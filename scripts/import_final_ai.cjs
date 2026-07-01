const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const cheerio = require('cheerio');
const { OpenAI } = require('openai');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

async function geocode(addressQuery) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(addressQuery)}`;
    const res = await axios.get(url, { 
      headers: { 'User-Agent': 'LeisureMapDataParser/1.0 (contact: test@example.com)' } 
    });
    
    if (res.data && res.data.length > 0) {
      return { lat: parseFloat(res.data[0].lat), lng: parseFloat(res.data[0].lon), address: res.data[0].display_name };
    }
  } catch (err) {
    console.error(`  [Nominatim] Errore di rete su ${addressQuery}`);
  }
  return null;
}

async function scrapeWebsite(url) {
  try {
    if (!url.startsWith('http')) return null;
    const res = await axios.get(url, { 
      timeout: 8000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const $ = cheerio.load(res.data);
    
    // Rimuovi script, stili, nav, footer per pulire
    $('script, style, nav, footer, header').remove();
    
    let text = $('body').text().replace(/\s+/g, ' ').trim();
    // Prendi solo i primi 4000 caratteri per evitare di superare limiti inutili
    return text.substring(0, 4000);
  } catch (err) {
    console.error(`  [Scraping] Errore su ${url}: ${err.message}`);
    return null;
  }
}

async function extractInfoWithAI(websiteText, fallbackName) {
  if (!websiteText) {
    return {
      description: `Palestra ${fallbackName}. Accesso libero e corsi disponibili.`,
      price: 'Da verificare',
      startHour: 8,
      endHour: 22
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'google/gemini-2.5-flash',
      messages: [
        {
          role: 'system',
          content: `Sei un assistente per una mappa di palestre. Analizza il testo del sito web fornito ed estrai le seguenti informazioni in formato JSON puro (senza markdown, solo l'oggetto JSON):\n` +
                   `{\n` +
                   `  "description": "Una breve descrizione accattivante di 2 frasi",\n` +
                   `  "price": "Il prezzo se trovato (es. '19.90€/mese'), altrimenti 'Da verificare'",\n` +
                   `  "startHour": un numero intero tra 0 e 23 (es. se apre alle 8 metti 8, se è H24 metti 0),\n` +
                   `  "endHour": un numero intero tra 0 e 24 (es. se chiude alle 22 metti 22, se è H24 metti 24)\n` +
                   `}`
        },
        {
          role: 'user',
          content: `Nome Palestra: ${fallbackName}\n\nTesto Sito: ${websiteText}`
        }
      ],
      temperature: 0.1
    });

    let rawJson = response.choices[0].message.content.trim();
    // Pulisci se c'è del markdown
    rawJson = rawJson.replace(/^```json/g, '').replace(/```$/g, '').trim();
    return JSON.parse(rawJson);
  } catch (err) {
    console.error(`  [AI] Errore estrazione AI per ${fallbackName}:`, err.message);
    return {
      description: `Palestra ${fallbackName}. Accesso libero e corsi disponibili.`,
      price: 'Da verificare',
      startHour: 8,
      endHour: 22
    };
  }
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
  const content = fs.readFileSync('liste/table-996816f4-e81e-4992-8f28-b97531bb0b6e.csv', 'utf-8');
  // Parser base CSV (considerando le virgolette per l'indirizzo)
  // Fortunatamente in questo CSV le virgolette sono usate regolarmente
  
  // Utilizziamo un regex base per lo split del CSV ignorando le virgole tra virgolette
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
            ret.push(val);
            val = "";
        } else {
            val += char;
        }
    }
    ret.push(val);
    return ret;
  };

  const records = lines.slice(1).map(line => {
    const parts = parseCSVLine(line);
    return {
      comune: parts[0]?.trim(),
      nome: parts[1]?.trim(),
      indirizzo: parts[2]?.trim(),
      contatto: parts[3]?.trim()
    };
  });

  console.log(`Trovate ${records.length} palestre nel CSV. Inizio importazione con AI...`);

  for (const rec of records) {
    if (!rec.nome) continue;
    
    console.log(`\n- Elaboro: ${rec.nome} (${rec.comune})`);
    
    // Controlla se esiste (ignorando " (H24)" ecc)
    const cleanName = rec.nome.replace(/\s*\(.*?\)\s*/g, '').trim();
    const { data: existing } = await supabase
      .from('activities')
      .select('id')
      .ilike('locationName', `%${cleanName}%`)
      .limit(1);

    // AI Scraping
    let aiInfo = { description: `Palestra ${rec.nome}.`, price: 'Da verificare', startHour: 8, endHour: 22 };
    if (rec.contatto && rec.contatto.startsWith('http')) {
      console.log(`  [Scraping] Leggo ${rec.contatto}...`);
      const siteText = await scrapeWebsite(rec.contatto);
      if (siteText) {
        console.log(`  [AI] Estraggo informazioni intelligenti...`);
        aiInfo = await extractInfoWithAI(siteText, rec.nome);
      }
    }

    // Aggiustamenti base
    if (rec.nome.toLowerCase().includes('h24') || aiInfo.endHour === 24) {
      aiInfo.startHour = 0;
      aiInfo.endHour = 24;
    }
    const days = (aiInfo.endHour === 24) ? [1,2,3,4,5,6,7] : [1,2,3,4,5,6];

    if (existing && existing.length > 0) {
      // Update
      const id = existing[0].id;
      const { error } = await supabase
        .from('activities')
        .update({
          contact: rec.contatto !== '-' ? rec.contatto : undefined,
          description: aiInfo.description,
          price: aiInfo.price,
          startHour: aiInfo.startHour,
          endHour: aiInfo.endHour,
          days
        })
        .eq('id', id);
      if (error) console.error(`  [ERROR] Update fallito ${id}:`, error.message);
      else console.log(`  [UPDATE] Dati arricchiti con successo per ${rec.nome}. (Prezzo: ${aiInfo.price})`);
    } else {
      // Inserisci
      let lat = null, lng = null, finalAddress = rec.indirizzo;
      
      // Geocoding sicuro con indirizzo (se presente e non "Contatto locale")
      let queryStr = `${rec.indirizzo}, ${rec.comune}, Italia`;
      if (!rec.indirizzo || rec.indirizzo.includes('locale') || rec.indirizzo === '-') {
         queryStr = `${cleanName}, ${rec.comune}, Italia`;
      }
      
      console.log(`  [Geocoding] Cerco: ${queryStr}`);
      const geo = await geocode(queryStr);
      
      if (geo) {
        lat = geo.lat;
        lng = geo.lng;
        if (rec.indirizzo === '-') finalAddress = geo.address;
      } else {
        console.error(`  [ERROR] Impossibile trovare le coordinate per ${rec.nome}. Salto inserimento.`);
        await sleep(1500);
        continue;
      }

      const newId = `act_gym_${Date.now()}_${Math.floor(Math.random()*1000)}`;
      const { error } = await supabase
        .from('activities')
        .insert({
          id: newId,
          name: aiInfo.startHour === 0 ? 'Abbonamento Palestra 24/7' : 'Abbonamento Palestra',
          description: aiInfo.description,
          category: 'palestra',
          level: 'all',
          target: 'adulti',
          days,
          startHour: aiInfo.startHour,
          endHour: aiInfo.endHour,
          price: aiInfo.price,
          locationName: rec.nome,
          address: finalAddress !== '-' ? finalAddress : rec.comune,
          lat,
          lng,
          contact: rec.contatto !== '-' ? rec.contatto : undefined,
          organizer: rec.nome
        });
        
      if (error) console.error(`  [ERROR] Inserimento fallito:`, error.message);
      else console.log(`  [INSERT] Creato ${rec.nome} con successo. (Prezzo: ${aiInfo.price})`);
    }

    await sleep(2000);
  }
  console.log("\nFine importazione AI massiva!");
}

run();
