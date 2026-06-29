const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const openrouterKey = process.env.OPENROUTER_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERRORE: Variabili Supabase non configurate correttamente nel file .env');
  process.exit(1);
}

if (!openrouterKey) {
  console.error('ERRORE CRITICO: OPENROUTER_API_KEY non trovata nel file .env!');
  console.error('Genera una chiave gratuita su https://openrouter.ai/keys e aggiungila al file .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Inizializzazione OpenAI ma puntando ai server di OpenRouter
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: openrouterKey,
});

// Parametro opzionale per testare una singola palestra
const TEST_MODE = process.argv.includes('--test');

async function fetchWebsiteText(url) {
  try {
    const response = await axios.get(url, { 
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const html = response.data;
    const $ = cheerio.load(html);
    
    // Rimuoviamo elementi non utili per risparmiare token
    $('script, style, nav, footer, iframe, img, svg').remove();
    
    // Estraiamo il testo pulito
    let text = $('body').text();
    text = text.replace(/\s+/g, ' ').trim();
    
    // Se il sito è enorme, prendiamo solo le prime 15000 lettere per non sforare
    return text.substring(0, 15000);
  } catch (err) {
    console.warn(`[WARN] Impossibile visitare ${url}: ${err.message}`);
    return null;
  }
}

async function extractCoursesWithAI(websiteText, facilityName) {
  const systemPrompt = `Sei un assistente specializzato nell'estrazione di dati strutturati da siti web di strutture sportive.
Il tuo compito è restituire ESCLUSIVAMENTE codice JSON valido, senza markdown, senza preamboli né spiegazioni.

Formato esatto richiesto per l'array:
[
  {
    "courseName": "Nome esatto del corso (es. Pilates, CrossFit)",
    "category": "Una tra: palestra, piscina, tennis, yoga, calcio, arti_marziali, danza, basket, padel",
    "price": "Es. €50/mese. Se non trovi nessun prezzo, scrivi ESATTAMENTE 'Prezzo su richiesta'.",
    "level": "Una tra: principianti, intermedio, avanzato. Se non specificato, scegli 'principianti'.",
    "target": "Una tra: bambini, adulti, tutti. Se non specificato, scegli 'tutti'.",
    "description": "Breve frase descrittiva del corso."
  }
]
Se dal testo non riesci a dedurre nemmeno un corso, restituisci un array con almeno il corso deducibile dal nome della struttura.`;

  const userPrompt = `Testo estratto dal sito di "${facilityName}":\n\n${websiteText}`;

  try {
    const response = await openai.chat.completions.create({
      model: "meta-llama/llama-3.2-3b-instruct:free",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.1,
    });
    
    let aiOutput = response.choices[0].message.content;
    
    // Pulizia di eventuali blocchi markdown (es. ```json ... ```)
    aiOutput = aiOutput.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    // Pulizia ulteriore se l'AI dovesse iniziare con frasi di circostanza
    if (!aiOutput.startsWith('[')) {
        const startIndex = aiOutput.indexOf('[');
        if (startIndex !== -1) aiOutput = aiOutput.substring(startIndex);
    }
    if (!aiOutput.endsWith(']')) {
        const endIndex = aiOutput.lastIndexOf(']');
        if (endIndex !== -1) aiOutput = aiOutput.substring(0, endIndex + 1);
    }

    const courses = JSON.parse(aiOutput);
    return Array.isArray(courses) ? courses : [];
  } catch (err) {
    console.error(`[ERRORE AI] OpenRouter (Llama 3) ha fallito per ${facilityName}:`, err.message);
    return [];
  }
}

async function processFacility(facility) {
  console.log(`\n🤖 Analisi in corso per: ${facility.locationName}`);
  console.log(`🌐 Visito il sito: ${facility.contact}`);
  
  const websiteText = await fetchWebsiteText(facility.contact);
  
  if (!websiteText) {
    console.log(`⏭️ Sito non raggiungibile. Salto questa struttura.`);
    return;
  }
  
  console.log(`🧠 Testo scaricato (${websiteText.length} caratteri). Interrogo Meta Llama 3 via OpenRouter...`);
  const aiCourses = await extractCoursesWithAI(websiteText, facility.locationName);
  
  if (!aiCourses || aiCourses.length === 0) {
    console.log(`⚠️ L'AI non ha trovato corsi validi o ha generato un JSON malformato.`);
    return;
  }
  
  console.log(`✅ L'AI ha estratto ${aiCourses.length} corsi reali:`);
  
  const newRecords = aiCourses.map((c, index) => {
    console.log(`   - ${c.courseName} | ${c.price}`);
    const newId = `${facility.id}_real_${index}`;
    
    return {
      id: newId,
      name: c.courseName,
      category: c.category,
      level: c.level,
      target: c.target,
      days: [1, 3], 
      startHour: 18,
      endHour: 19,
      price: c.price,
      description: c.description,
      locationName: facility.locationName,
      address: facility.address,
      lat: facility.lat,
      lng: facility.lng,
      contact: facility.contact,
      organizer: facility.locationName
    };
  });
  
  if (!TEST_MODE) {
    console.log(`💾 Salvataggio dei ${newRecords.length} nuovi corsi nel database...`);
    await supabase.from('activities').delete().eq('id', facility.id);
    
    const { error } = await supabase.from('activities').upsert(newRecords);
    if (error) {
      console.error("❌ Errore di salvataggio Supabase:", error.message);
    } else {
      console.log(`🎉 Salvataggio completato!`);
    }
  } else {
    console.log(`[TEST MODE] Salvataggio saltato. Questo era solo un test.`);
  }
}

async function runAIScraper() {
  console.log("=======================================");
  console.log("  AI SMART SCRAPER - PREZZI E CORSI    ");
  console.log("=======================================\n");

  const { data: facilities, error } = await supabase
    .from('activities')
    .select('*')
    .like('contact', 'http%');
    
  if (error || !facilities) {
    console.error("Errore nel recuperare i dati da Supabase", error);
    process.exit(1);
  }
  
  const uniqueFacilities = [];
  const seenLocations = new Set();
  
  for (const f of facilities) {
    if (!seenLocations.has(f.locationName)) {
      seenLocations.add(f.locationName);
      uniqueFacilities.push(f);
    }
  }

  console.log(`Trovate ${uniqueFacilities.length} strutture uniche con un sito web valido.\n`);

  if (TEST_MODE) {
    console.log(`ATTENZIONE: Esecuzione in modalità TEST (--test).`);
    console.log(`Verrà analizzata solo la prima struttura della lista e non verranno apportate modifiche al database.\n`);
    
    await processFacility(uniqueFacilities[0]);
    console.log(`\nTest completato. Se il risultato ti piace, lancia lo script senza --test`);
    return;
  }

  for (let i = 0; i < uniqueFacilities.length; i++) {
    const fac = uniqueFacilities[i];
    console.log(`\n[Struttura ${i+1}/${uniqueFacilities.length}]`);
    await processFacility(fac);
    
    // Pausa di 3 secondi tra una chiamata e l'altra (OpenRouter rate limit è generoso ma meglio essere cauti)
    if (i < uniqueFacilities.length - 1) {
      console.log(`⏳ Attendo 3 secondi...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.log(`\n✅ Operazione completata! Il database è ora popolato con corsi e prezzi REALI.`);
}

runAIScraper();
