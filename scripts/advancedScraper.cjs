const fs = require('fs');
const path = require('path');
const axios = require('axios');

const dbPath = path.join(__dirname, '..', 'src', 'data', 'activities.json');

// Funzione helper per le chiamate HTTP con retry
async function fetchOverpass(query) {
  const url = 'https://z.overpass-api.de/api/interpreter';
  
  for (let i = 0; i < 3; i++) {
    try {
      const response = await axios.post(url, `data=${encodeURIComponent(query)}`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'User-Agent': 'LeisureMapScraper/2.0 (contact: riccardoz@example.com; app: LeisureMap)'
        }
      });
      return response.data;
    } catch (err) {
      if (err.response && err.response.status === 429) {
        console.warn("Rate limit superato, attendo 10 secondi...");
        await new Promise(r => setTimeout(r, 10000));
        continue;
      }
      console.warn(`Errore di connessione (tentativo ${i + 1}/3):`, err.message);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
  throw new Error("Impossibile connettersi a Overpass API dopo 3 tentativi.");
}

async function getComuni() {
  console.log("Fase 1: Recupero tutti i comuni della provincia di Treviso...");
  const query = `[out:json][timeout:25];
area["name"="Treviso"]["admin_level"=6]->.provincia;
relation["admin_level"=8](area.provincia);
out tags;`;
  const data = await fetchOverpass(query);
  const comuni = data.elements
    .filter(e => e.tags && e.tags.name)
    .map(e => ({ id: e.id, name: e.tags.name }));
  
  console.log(`Trovati ${comuni.length} comuni.`);
  return comuni;
}

async function getFacilitiesInComune(comuneId, comuneName) {
  const query = `[out:json][timeout:25];
rel(${comuneId});map_to_area->.comune;
(
  node["leisure"~"sports_centre|fitness_centre"](area.comune);
  way["leisure"~"sports_centre|fitness_centre"](area.comune);
  node["amenity"~"theatre|arts_centre"](area.comune);
  way["amenity"~"theatre|arts_centre"](area.comune);
  node["sport"~"tennis|swimming|gymnastics|dance|fitness|martial_arts|basketball"](area.comune);
  way["sport"~"tennis|swimming|gymnastics|dance|fitness|martial_arts|basketball"](area.comune);
);
out center tags;`;
  const data = await fetchOverpass(query);
  return data.elements || [];
}

function parseFacilityToActivity(element, comuneName, existingIds) {
  const tags = element.tags || {};
  const name = tags.name || tags.operator;
  if (!name) return null; // Ignora se non ha nome

  const lat = element.lat || (element.center && element.center.lat);
  const lng = element.lon || (element.center && element.center.lon);
  if (!lat || !lng) return null;

  // Inferenza categoria e corsi
  let category = "palestra";
  let courseName = "Fitness & Benessere";
  let level = "principianti";
  
  const sport = (tags.sport || "").toLowerCase();
  const leisure = (tags.leisure || "").toLowerCase();
  const amenity = (tags.amenity || "").toLowerCase();
  const facilityName = name.toLowerCase();

  if (sport.includes("tennis")) { category = "tennis"; courseName = "Corsi di Tennis"; }
  else if (sport.includes("swimming") || facilityName.includes("piscina")) { category = "nuoto"; courseName = "Scuola Nuoto"; }
  else if (sport.includes("basketball") || facilityName.includes("basket")) { category = "basket"; courseName = "Corsi di Minibasket e Basket"; }
  else if (amenity === "theatre") { category = "teatro"; courseName = "Laboratorio Teatrale"; }
  else if (facilityName.includes("yoga")) { category = "yoga"; courseName = "Hatha Yoga"; }
  else if (sport.includes("dance") || facilityName.includes("danza")) { category = "danza"; courseName = "Danza Classica e Moderna"; }
  else if (sport.includes("martial_arts") || facilityName.includes("karate") || facilityName.includes("judo")) { category = "karate"; courseName = "Arti Marziali"; }
  else if (facilityName.includes("padel")) { category = "padel"; courseName = "Lezioni di Padel"; }
  else if (facilityName.includes("pilates")) { category = "pilates"; courseName = "Pilates Matwork"; }

  // Determina un orario fittizio
  const idHash = (lat + lng).toString().replace('.', '');
  const id = `act_auto_${idHash.substring(idHash.length - 8)}`;
  
  if (existingIds.has(id)) return null;
  existingIds.add(id);

  return {
    id: id,
    name: `${courseName} presso ${name}`,
    category: category,
    level: level,
    target: "tutti",
    days: [1, 3, 5],
    startHour: 18,
    endHour: 20,
    price: "Contatta la struttura",
    description: `Corso generato automaticamente per la struttura "${name}" nel comune di ${comuneName}. L'impianto offre attività legate a: ${category}.`,
    locationName: name,
    lat: lat,
    lng: lng,
    contact: tags.phone || tags.website || "Nessun contatto disponibile",
    organizer: name
  };
}

async function runScraper() {
  console.log("=======================================");
  console.log("  ADVANCED SCRAPER: PROVINCIA DI TREVISO ");
  console.log("=======================================\n");

  let existingDatabase = [];
  if (fs.existsSync(dbPath)) {
    existingDatabase = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  }
  
  const existingIds = new Set(existingDatabase.map(a => a.id));
  const newActivities = [];

  try {
    const comuni = await getComuni();
    
    console.log(`\nFase 2: Ricerca strutture per ogni comune (${comuni.length} totali)...`);
    
    // Per evitare il ban, iteriamo lentamente
    for (let i = 0; i < comuni.length; i++) {
      const comune = comuni[i];
      process.stdout.write(`Scansionando [${i+1}/${comuni.length}] ${comune.name}... `);
      
      try {
        const elements = await getFacilitiesInComune(comune.id, comune.name);
        let countForComune = 0;
        
        for (const el of elements) {
          const activity = parseFacilityToActivity(el, comune.name, existingIds);
          if (activity) {
            newActivities.push(activity);
            existingDatabase.push(activity); // Aggiungiamo anche a existingDatabase
            countForComune++;
          }
        }
        console.log(`Trovate ${countForComune} strutture valide.`);
        
        // SALVATAGGIO INCREMENTALE
        if (countForComune > 0) {
          fs.writeFileSync(dbPath, JSON.stringify(existingDatabase, null, 2), 'utf8');
        }
      } catch (err) {
        console.log(`ERRORE: ${err.message}`);
      }
      
      // Pausa di rispetto per l'API pubblica
      await new Promise(r => setTimeout(r, 2000));
    }
    
    if (newActivities.length > 0) {
      const combined = [...existingDatabase, ...newActivities];
      fs.writeFileSync(dbPath, JSON.stringify(combined, null, 2), 'utf8');
      console.log(`\nFase 3: Salvataggio completato! Aggiunte ${newActivities.length} nuove attività.`);
      console.log(`Database totale: ${combined.length} record.`);
    } else {
      console.log("\nNessuna nuova struttura trovata. Il database è già aggiornato.");
    }
    
  } catch (err) {
    console.error("Errore critico durante lo scraping:", err);
  }
}

runScraper();
