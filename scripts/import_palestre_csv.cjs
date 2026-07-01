const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function geocode(query) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'LeisureMap/1.0' } });
    const data = await res.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), address: data[0].display_name };
    }
  } catch (err) {
    console.error(`Error geocoding ${query}:`, err.message);
  }
  return null;
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
  const content = fs.readFileSync('liste/table-6e633997-6600-45cd-aa23-be2ef54eb57f.csv', 'utf-8');
  const lines = content.split('\n').filter(l => l.trim() !== '');
  const headers = lines[0].split(',');
  
  const records = lines.slice(1).map(line => {
    // Gestione basilare del CSV (assumendo niente virgole nei campi)
    const parts = line.split(',');
    return {
      comune: parts[0]?.trim(),
      nome: parts[1]?.trim(),
      contatto: parts.slice(2).join(',').trim()
    };
  });

  console.log(`Trovate ${records.length} palestre nel CSV. Inizio l'elaborazione...`);

  for (const rec of records) {
    if (!rec.nome) continue;
    
    console.log(`- Elaboro: ${rec.nome} (${rec.comune})...`);
    
    // Controlla se esiste
    const { data: existing } = await supabase
      .from('activities')
      .select('id')
      .ilike('locationName', `%${rec.nome}%`)
      .limit(1);

    const isH24 = rec.nome.toLowerCase().includes('h24');
    let startHour = isH24 ? 0 : 8;
    let endHour = isH24 ? 24 : 22;
    let days = isH24 ? [1,2,3,4,5,6,7] : [1,2,3,4,5,6];

    let lat = 45.6669; // Treviso fallback
    let lng = 12.2431;
    let address = `${rec.comune}, Treviso, Italia`;

    // Geocoding
    const geo = await geocode(`${rec.nome}, ${rec.comune}, Italia`);
    if (geo) {
      lat = geo.lat;
      lng = geo.lng;
      address = geo.address;
    } else {
      // Prova solo col comune
      const geoComune = await geocode(`${rec.comune}, Treviso, Italia`);
      if (geoComune) {
         lat = geoComune.lat;
         lng = geoComune.lng;
      }
    }

    if (existing && existing.length > 0) {
      // Aggiorna
      const id = existing[0].id;
      const { error } = await supabase
        .from('activities')
        .update({
          contact: rec.contatto,
          startHour,
          endHour,
          days
        })
        .eq('id', id);
      if (error) console.error(`  Errore aggiornamento ${id}:`, error.message);
      else console.log(`  [UPDATE] Aggiornato contatto e orari per ${rec.nome}`);
    } else {
      // Inserisci
      const newId = `act_gym_${Date.now()}_${Math.floor(Math.random()*1000)}`;
      const { error } = await supabase
        .from('activities')
        .insert({
          id: newId,
          name: isH24 ? 'Abbonamento Palestra 24/7' : 'Abbonamento Palestra',
          description: `Palestra situata a ${rec.comune}. Accesso libero alla sala pesi e macchinari.`,
          category: 'palestra',
          level: 'all',
          target: 'adulti',
          days,
          startHour,
          endHour,
          price: 'Da verificare',
          locationName: rec.nome,
          address,
          lat,
          lng,
          contact: rec.contatto,
          organizer: rec.nome
        });
        
      if (error) console.error(`  Errore inserimento:`, error.message);
      else console.log(`  [INSERT] Inserito ${rec.nome} con successo.`);
    }

    // Rispetta rate limit di nominatim (1 sec tra richieste)
    await sleep(1200);
  }
  console.log("Fine importazione!");
}

run();
