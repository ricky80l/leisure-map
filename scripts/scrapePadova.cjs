const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERRORE: Variabili Supabase non configurate correttamente nel file .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Funzione per disegnare la barra di avanzamento
function drawProgressBar(current, total, text) {
  const width = 30;
  const percentage = total === 0 ? 0 : Math.floor((current / total) * 100);
  const filled = total === 0 ? 0 : Math.floor((width * current) / total);
  const empty = width - filled;
  const bar = '█'.repeat(filled) + '-'.repeat(empty);
  
  // Pulisce la riga e riscrive
  process.stdout.write(`\r\x1b[K[${bar}] ${percentage}% | ${current}/${total} | ${text}`);
  if (current === total) console.log();
}

// Funzione helper per le chiamate HTTP con retry
async function fetchOverpass(query) {
  const url = 'https://z.overpass-api.de/api/interpreter';
  for (let i = 0; i < 3; i++) {
    try {
      const response = await axios.post(url, `data=${encodeURIComponent(query)}`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'User-Agent': 'LeisureMapScraper/2.1 (contact: script@leisuremap.test)'
        }
      });
      return response.data;
    } catch (err) {
      if (err.response && err.response.status === 429) {
        await new Promise(r => setTimeout(r, 10000));
        continue;
      }
      await new Promise(r => setTimeout(r, 5000));
    }
  }
  throw new Error("Impossibile connettersi a Overpass API.");
}

async function getComuniPadova() {
  const query = `[out:json][timeout:25];
area["name"="Padova"]["admin_level"=6]->.provincia;
relation["admin_level"=8](area.provincia);
out tags;`;
  const data = await fetchOverpass(query);
  return data.elements
    .filter(e => e.tags && e.tags.name)
    .map(e => ({ id: e.id, name: e.tags.name }));
}

async function getFacilitiesInComune(comuneId) {
  const query = `[out:json][timeout:25];
rel(${comuneId});map_to_area->.comune;
(
  node["leisure"~"sports_centre|fitness_centre"](area.comune);
  way["leisure"~"sports_centre|fitness_centre"](area.comune);
  node["amenity"~"theatre|arts_centre"](area.comune);
  way["amenity"~"theatre|arts_centre"](area.comune);
  node["sport"~"tennis|swimming|gymnastics|dance|fitness|martial_arts|basketball|padel|yoga"](area.comune);
  way["sport"~"tennis|swimming|gymnastics|dance|fitness|martial_arts|basketball|padel|yoga"](area.comune);
);
out center tags;`;
  const data = await fetchOverpass(query);
  return data.elements || [];
}

// Funzione per generare dati simulati (orari, età, prezzi) coerenti
function generateCourseDetails(category, facilityName, count) {
  const prices = ["€40 / mese", "€50 / mese", "€60 / mese", "€15 / lezione", "€20 / lezione", "Contatta la struttura"];
  const targets = ["bambini", "ragazzi", "adulti", "anziani", "tutti"];
  const levels = ["principianti", "intermedio", "avanzato", "tutti i livelli"];
  
  // Orari casuali ma plausibili
  const startHour = 14 + (Math.abs(facilityName.length * count) % 6); // tra le 14 e le 19
  const endHour = startHour + 1 + (count % 2); // durata 1 o 2 ore
  
  // Giorni casuali (es. [1,3] lun-mer, [2,4] mar-gio)
  const daysCombinations = [[1, 3], [2, 4], [1, 3, 5], [2, 4, 6], [1, 5], [6, 0]];
  const days = daysCombinations[(facilityName.length + count) % daysCombinations.length];
  
  return {
    price: prices[(facilityName.length + count) % prices.length],
    target: targets[(facilityName.length + count) % targets.length],
    level: levels[(facilityName.length + count) % levels.length],
    startHour,
    endHour,
    days
  };
}

function parseFacilityToActivity(element, comuneName) {
  const tags = element.tags || {};
  const name = tags.name || tags.operator;
  if (!name) return null;

  const lat = element.lat || (element.center && element.center.lat);
  const lng = element.lon || (element.center && element.center.lon);
  if (!lat || !lng) return null;

  let category = "palestra";
  let courseName = "Fitness & Benessere";
  
  const sport = (tags.sport || "").toLowerCase();
  const leisure = (tags.leisure || "").toLowerCase();
  const amenity = (tags.amenity || "").toLowerCase();
  const facilityName = name.toLowerCase();

  if (sport.includes("tennis")) { category = "tennis"; courseName = "Corsi di Tennis"; }
  else if (sport.includes("swimming") || facilityName.includes("piscina")) { category = "nuoto"; courseName = "Scuola Nuoto"; }
  else if (sport.includes("basketball") || facilityName.includes("basket")) { category = "basket"; courseName = "Minibasket e Basket"; }
  else if (amenity === "theatre") { category = "teatro"; courseName = "Laboratorio Teatrale"; }
  else if (facilityName.includes("yoga")) { category = "yoga"; courseName = "Yoga e Meditazione"; }
  else if (sport.includes("dance") || facilityName.includes("danza")) { category = "danza"; courseName = "Corsi di Danza"; }
  else if (sport.includes("martial_arts") || facilityName.includes("karate") || facilityName.includes("judo")) { category = "karate"; courseName = "Arti Marziali"; }
  else if (facilityName.includes("padel") || sport.includes("padel")) { category = "padel"; courseName = "Padel"; }
  else if (facilityName.includes("pilates")) { category = "pilates"; courseName = "Pilates Matwork"; }

  const idHash = (lat + lng).toString().replace('.', '');
  const id = `act_pd_${idHash.substring(idHash.length - 8)}`;

  // Generiamo i dettagli simulati
  const details = generateCourseDetails(category, name, parseInt(idHash.substring(idHash.length - 2)) || 1);

  return {
    id: id,
    name: `${courseName} presso ${name}`,
    category: category,
    level: details.level,
    target: details.target,
    days: details.days,
    startHour: details.startHour,
    endHour: details.endHour,
    price: details.price,
    description: `Corso di ${category} situato a ${comuneName} presso la struttura "${name}". Ideale per ${details.target}.`,
    locationName: name,
    lat: lat,
    lng: lng,
    contact: tags.phone || tags.website || "Nessun contatto disponibile",
    organizer: name
  };
}

async function runPadovaScraper() {
  console.log("\n=======================================");
  console.log("  SCRAPER & UPLOADER: PROVINCIA PADOVA ");
  console.log("=======================================\n");

  try {
    process.stdout.write("Recupero comuni della provincia di Padova... ");
    const comuni = await getComuniPadova();
    console.log(`Trovati ${comuni.length} comuni!\n`);

    const newActivities = [];
    let facilityCount = 0;

    // Iterazione sui comuni con barra di avanzamento
    for (let i = 0; i < comuni.length; i++) {
      const comune = comuni[i];
      drawProgressBar(i, comuni.length, `Comune: ${comune.name} (${facilityCount} palestre trovate)`);

      try {
        const elements = await getFacilitiesInComune(comune.id);
        
        for (const el of elements) {
          const activity = parseFacilityToActivity(el, comune.name);
          if (activity) {
            // Evita duplicati nella stessa sessione
            if (!newActivities.find(a => a.id === activity.id)) {
              newActivities.push(activity);
              facilityCount++;
            }
          }
        }
      } catch (err) {
        // Log a capo per non rompere la barra
        process.stdout.write(`\nErrore su ${comune.name}: ${err.message}\n`);
      }
      
      // Pausa di rispetto per l'API di Overpass
      await new Promise(r => setTimeout(r, 1500));
    }
    
    // Completa la barra
    drawProgressBar(comuni.length, comuni.length, `Ricerca completata! (${facilityCount} palestre totali)`);

    if (newActivities.length === 0) {
      console.log("\nNessuna struttura trovata a Padova. Operazione terminata.");
      return;
    }

    console.log(`\nInizio caricamento di ${newActivities.length} corsi nel database Supabase...`);
    
    // Caricamento su Supabase
    const { error } = await supabase
      .from('activities')
      .upsert(newActivities, { onConflict: 'id' });

    if (error) {
      console.error('\nErrore durante l\'inserimento su Supabase:', error);
    } else {
      console.log(`\n✅ Successo! Popolati ${newActivities.length} nuovi corsi per la provincia di Padova su Supabase.`);
    }

  } catch (err) {
    console.error("\nErrore critico durante lo scraping:", err);
  }
}

runPadovaScraper();
