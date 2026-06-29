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

function drawProgressBar(current, total, text) {
  const width = 30;
  const percentage = total === 0 ? 0 : Math.floor((current / total) * 100);
  const filled = total === 0 ? 0 : Math.floor((width * current) / total);
  const empty = width - filled;
  const bar = '█'.repeat(filled) + '-'.repeat(empty);
  process.stdout.write(`\r\x1b[K[${bar}] ${percentage}% | ${current}/${total} | ${text}`);
  if (current === total) console.log();
}

async function reverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
  for (let i = 0; i < 3; i++) {
    try {
      const response = await axios.get(url, {
        headers: { 'User-Agent': 'LeisureMap-Enricher/1.1 (contact: test@leisuremap.app)' }
      });
      return response.data;
    } catch (err) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  return null;
}

function formatAddress(addressObj) {
  if (!addressObj) return "Indirizzo non disponibile";
  
  const road = addressObj.road || addressObj.pedestrian || "";
  const houseNumber = addressObj.house_number || "";
  const city = addressObj.city || addressObj.town || addressObj.village || addressObj.municipality || "";
  const postcode = addressObj.postcode || "";
  
  let formatted = "";
  if (road) formatted += road;
  if (houseNumber) formatted += ` ${houseNumber}`;
  if (city) formatted += (formatted ? `, ${city}` : city);
  if (postcode) formatted += ` ${postcode}`;
  
  return formatted || "Indirizzo generico (coordinate)";
}

async function runEnricher() {
  console.log("\n=======================================");
  console.log("  ARRICCHIMENTO E NORMALIZZAZIONE DATI ");
  console.log("=======================================\n");

  console.log("Scaricamento di tutte le attività da Supabase...");
  const { data: activities, error } = await supabase.from('activities').select('*');
  
  if (error || !activities) {
    console.error("Errore nel recupero delle attività da Supabase:", error);
    return;
  }

  console.log(`Trovate ${activities.length} attività. Inizio raggruppamento...\n`);

  // Raggruppa per locationName
  const groups = {};
  for (const act of activities) {
    const key = act.locationName.trim().toLowerCase();
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(act);
  }

  const groupKeys = Object.keys(groups);
  console.log(`Trovate ${groupKeys.length} strutture uniche.\n`);

  let updatedCount = 0;
  const BATCH_SIZE = 50;
  let batch = [];

  for (let i = 0; i < groupKeys.length; i++) {
    const key = groupKeys[i];
    const groupActivities = groups[key];
    
    drawProgressBar(i, groupKeys.length, `Analisi: ${groupActivities[0].locationName.substring(0, 30)}...`);

    // Prendi le coordinate della prima attività come riferimento per tutto il gruppo
    const refLat = groupActivities[0].lat;
    const refLng = groupActivities[0].lng;

    // Chiamata Nominatim (una sola per struttura, risparmiando tempo!)
    const geoData = await reverseGeocode(refLat, refLng);
    let exactAddress = "Indirizzo non disponibile";
    if (geoData && geoData.address) {
      exactAddress = formatAddress(geoData.address);
    }

    // Applica a tutte le attività del gruppo la STESSA coordinata e lo STESSO indirizzo
    for (const act of groupActivities) {
      act.lat = refLat;
      act.lng = refLng;
      act.address = exactAddress;
      
      batch.push(act);
      updatedCount++;
    }

    // Upsert batch
    if (batch.length >= BATCH_SIZE) {
      await supabase.from('activities').upsert(batch, { onConflict: 'id' });
      batch = [];
    }

    // Nominatim policy: max 1 request per second
    await new Promise(r => setTimeout(r, 1200));
  }
  
  // Upsert final batch
  if (batch.length > 0) {
    await supabase.from('activities').upsert(batch, { onConflict: 'id' });
  }

  drawProgressBar(groupKeys.length, groupKeys.length, `Operazione completata!`);
  console.log(`\n✅ Successo! Sono stati generati e salvati ${updatedCount} indirizzi esatti nel database Supabase, unificando le coordinate.`);
}

runEnricher();
