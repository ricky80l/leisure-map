const fs = require('fs');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
  const content = fs.readFileSync('palestre_treviso_COMPLETE_geolocalizzate.csv', 'utf-8');
  const lines = content.split('\n').filter(l => l.trim() !== '');
  const parseCSVLine = (text) => {
    let ret = [];
    let inQuote = false;
    let val = "";
    for (let i = 0; i < text.length; i++) {
        let char = text[i];
        if (char === '"') {
            inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
            ret.push(val.trim());
            val = "";
        } else {
            val += char;
        }
    }
    ret.push(val.trim());
    return ret;
  };

  const records = lines.slice(1).map(line => {
    const parts = parseCSVLine(line);
    return {
      comune: parts[1] || '',
      nome: parts[2] || '',
      indirizzo: parts[3] || '',
      lat: parseFloat(parts[4]) || 0,
      lng: parseFloat(parts[5]) || 0,
      indirizzoCompleto: parts[6] || ''
    };
  });

  const missing = records.filter(r => (r.lat === 0 || r.lng === 0 || isNaN(r.lat) || isNaN(r.lng)) && r.nome && !r.nome.includes('Nessun centro'));

  console.log(`Trovate ${missing.length} palestre senza coordinate nel CSV. Provo a fare geocoding tramite indirizzo...`);

  for (const rec of missing) {
    const query = rec.indirizzoCompleto && rec.indirizzoCompleto.length > 5 ? rec.indirizzoCompleto : `${rec.indirizzo}, ${rec.comune}, Treviso, Italy`;
    console.log(`\n- Cerco: ${rec.nome} -> ${query}`);
    
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`, {
        headers: { 'User-Agent': 'LeisureMap-Bot (contact: your-email@example.com)' }
      });
      
      if (res.data && res.data.length > 0) {
        const lat = parseFloat(res.data[0].lat);
        const lng = parseFloat(res.data[0].lon);
        console.log(`  [TROVATO] Lat: ${lat}, Lng: ${lng}`);

        // Update in supabase
        const cleanName = rec.nome.replace(/\s*\(.*?\)\s*/g, '').trim();
        const { error } = await supabase
          .from('activities')
          .update({ lat, lng })
          .ilike('locationName', `%${cleanName}%`);
        
        if (error) console.error(`  [ERRORE DB] ${error.message}`);
        else console.log(`  [DB UPDATED]`);
      } else {
        console.log(`  [FALLITO] Nessun risultato per questo indirizzo.`);
      }
    } catch(e) {
      console.log(`  [API ERROR] ${e.message}`);
    }

    await sleep(2000); // 2 seconds sleep to respect Nominatim policy
  }
  
  console.log("\nFine procedura geocoding missing!");
}

run();
