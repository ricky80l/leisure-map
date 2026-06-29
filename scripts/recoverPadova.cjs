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

// Elenco dei comuni che hanno dato errore (recuperato dai log)
const failedComuniNames = [
  "Barbona", "Anguillara Veneta", "Casale di Scodosia", "Villa Estense", "Urbana",
  "Santa Caterina d'Este", "Ospedaletto Euganeo", "San Pietro Viminario", "Bovolenta",
  "Piove di Sacco", "Pernumia", "Battaglia Terme", "Polverara", "Saccolongo",
  "Rubano", "Piazzola sul Brenta", "Borgoricco", "Campo San Martino", "Grantorto",
  "Cittadella", "Carmignano di Brenta", "Villanova di Camposampiero"
];

function drawProgressBar(current, total, text) {
  const width = 30;
  const percentage = total === 0 ? 0 : Math.floor((current / total) * 100);
  const filled = total === 0 ? 0 : Math.floor((width * current) / total);
  const empty = width - filled;
  const bar = '█'.repeat(filled) + '-'.repeat(empty);
  process.stdout.write(`\r\x1b[K[${bar}] ${percentage}% | ${current}/${total} | ${text}`);
  if (current === total) console.log();
}

async function fetchOverpass(query) {
  const url = 'https://maps.mail.ru/osm/tools/overpass/api/interpreter';
  // Aumentiamo i tentativi a 5 per i recuperi e aggiungiamo attese più lunghe
  for (let i = 0; i < 5; i++) {
    try {
      const response = await axios.post(url, `data=${encodeURIComponent(query)}`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'User-Agent': 'LeisureMapScraper/2.2-Recovery'
        }
      });
      return response.data;
    } catch (err) {
      if (err.response && err.response.status === 429) {
        await new Promise(r => setTimeout(r, 15000)); // Attesa lunga se ratelimited
        continue;
      }
      await new Promise(r => setTimeout(r, 8000));
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

function generateCourseDetails(category, facilityName, count) {
  const prices = ["€40 / mese", "€50 / mese", "€60 / mese", "€15 / lezione", "€20 / lezione", "Contatta la struttura"];
  const targets = ["bambini", "ragazzi", "adulti", "anziani", "tutti"];
  const levels = ["principianti", "intermedio", "avanzato", "tutti i livelli"];
  const startHour = 14 + (Math.abs(facilityName.length * count) % 6);
  const endHour = startHour + 1 + (count % 2);
  const daysCombinations = [[1, 3], [2, 4], [1, 3, 5], [2, 4, 6], [1, 5], [6, 0]];
  const days = daysCombinations[(facilityName.length + count) % daysCombinations.length];
  
  return { price: prices[(facilityName.length + count) % prices.length], target: targets[(facilityName.length + count) % targets.length], level: levels[(facilityName.length + count) % levels.length], startHour, endHour, days };
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
  const details = generateCourseDetails(category, name, parseInt(idHash.substring(idHash.length - 2)) || 1);

  return {
    id: id, name: `${courseName} presso ${name}`, category, level: details.level, target: details.target,
    days: details.days, startHour: details.startHour, endHour: details.endHour, price: details.price,
    description: `Corso di ${category} situato a ${comuneName} presso la struttura "${name}". Ideale per ${details.target}.`,
    locationName: name, lat, lng, contact: tags.phone || tags.website || "Nessun contatto disponibile", organizer: name
  };
}

async function runRecovery() {
  console.log("\n=======================================");
  console.log("  RECUPERO COMUNI FALLITI - PADOVA ");
  console.log("=======================================\n");

  try {
    process.stdout.write("Recupero ID dei comuni interessati... ");
    const tuttiComuni = await getComuniPadova();
    const comuniDaRecuperare = tuttiComuni.filter(c => failedComuniNames.includes(c.name));
    console.log(`Trovati ${comuniDaRecuperare.length} comuni da recuperare su ${failedComuniNames.length} richiesti!\n`);

    const newActivities = [];
    let facilityCount = 0;

    for (let i = 0; i < comuniDaRecuperare.length; i++) {
      const comune = comuniDaRecuperare[i];
      drawProgressBar(i, comuniDaRecuperare.length, `Recupero: ${comune.name} (${facilityCount} trovate)`);

      try {
        const elements = await getFacilitiesInComune(comune.id);
        
        for (const el of elements) {
          const activity = parseFacilityToActivity(el, comune.name);
          if (activity && !newActivities.find(a => a.id === activity.id)) {
            newActivities.push(activity);
            facilityCount++;
          }
        }
      } catch (err) {
        process.stdout.write(`\nNuovo errore su ${comune.name}: ${err.message}. Salto ancora.\n`);
      }
      
      // Pausa di rispetto ANCORA PIÙ LUNGA per evitare di essere bloccati di nuovo
      await new Promise(r => setTimeout(r, 4000));
    }
    
    drawProgressBar(comuniDaRecuperare.length, comuniDaRecuperare.length, `Recupero completato! (${facilityCount} palestre recuperate)`);

    if (newActivities.length === 0) {
      console.log("\nNessuna nuova struttura trovata nei comuni recuperati.");
      return;
    }

    console.log(`\nInizio caricamento dei ${newActivities.length} corsi recuperati su Supabase...`);
    
    const { error } = await supabase
      .from('activities')
      .upsert(newActivities, { onConflict: 'id' });

    if (error) {
      console.error('\nErrore durante l\'inserimento su Supabase:', error);
    } else {
      console.log(`\n✅ Successo! Aggiunti con successo i ${newActivities.length} corsi dei comuni recuperati su Supabase.`);
    }

  } catch (err) {
    console.error("\nErrore critico durante il recupero:", err);
  }
}

runRecovery();
