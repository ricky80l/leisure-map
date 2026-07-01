const fs = require('fs');
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
    // 0: Zona, 1: Comune, 2: Nome Palestra, 3: Indirizzo, 4: Latitudine, 5: Longitudine, 6: Indirizzo Completo, 7: Stato
    return {
      comune: parts[1] || '',
      nome: parts[2] || '',
      indirizzo: parts[3] || '',
      lat: parseFloat(parts[4]) || 0,
      lng: parseFloat(parts[5]) || 0,
      indirizzoCompleto: parts[6] || ''
    };
  });

  console.log(`Trovate ${records.length} palestre nel CSV. Inizio importazione/aggiornamento geolocalizzato...`);

  let added = 0;
  let updated = 0;

  for (const rec of records) {
    if (!rec.nome || rec.nome.includes('Nessun centro')) continue;
    if (rec.lat === 0 || rec.lng === 0) {
      console.log(`[SKIP] Coordinate mancanti per: ${rec.nome}`);
      continue;
    }
    
    const cleanName = rec.nome.replace(/\s*\(.*?\)\s*/g, '').trim();
    const { data: existing } = await supabase
      .from('activities')
      .select('id, address')
      .ilike('locationName', `%${cleanName}%`)
      .limit(1);

    const isH24 = rec.nome.toLowerCase().includes('h24');
    let startHour = isH24 ? 0 : 8;
    let endHour = isH24 ? 24 : 22;
    let days = isH24 ? [1,2,3,4,5,6,7] : [1,2,3,4,5,6];
    
    // Costruiamo un indirizzo migliore
    let bestAddress = rec.indirizzoCompleto && rec.indirizzoCompleto.length > 5 ? rec.indirizzoCompleto : (rec.indirizzo !== '-' ? `${rec.indirizzo}, ${rec.comune}` : rec.comune);

    if (existing && existing.length > 0) {
      const id = existing[0].id;
      const { error } = await supabase
        .from('activities')
        .update({
          address: bestAddress,
          lat: rec.lat,
          lng: rec.lng
        })
        .eq('id', id);
      if (error) {
        console.error(`  [ERROR] Aggiornamento fallito ${id}:`, error.message);
      } else {
        // console.log(`  [UPDATE] Aggiornato ${rec.nome}`);
        updated++;
      }
    } else {
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
          address: bestAddress,
          lat: rec.lat,
          lng: rec.lng,
          organizer: rec.nome
        });
        
      if (error) {
        console.error(`  [ERROR] Inserimento fallito:`, error.message);
      } else {
        // console.log(`  [INSERT] Inserito ${rec.nome}`);
        added++;
      }
    }

    await sleep(50); // Piccolo delay per non intasare supabase
  }
  console.log(`\nFine! Nuove aggiunte: ${added}, Aggiornate: ${updated}`);
}

run();
