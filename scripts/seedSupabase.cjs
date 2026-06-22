const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || supabaseKey.includes('INCOLLA_QUI')) {
  console.error('ERRORE: Variabili Supabase non configurate correttamente nel file .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const activitiesPath = path.join(__dirname, '..', 'src', 'data', 'activities.json');

async function seed() {
  console.log('Inizio migrazione dati verso Supabase...');
  
  if (!fs.existsSync(activitiesPath)) {
    console.error('File activities.json non trovato!');
    return;
  }

  const rawData = fs.readFileSync(activitiesPath, 'utf8');
  const activities = JSON.parse(rawData);
  
  console.log(`Trovati ${activities.length} record. Preparazione invio...`);

  const { data, error } = await supabase
    .from('activities')
    .upsert(activities, { onConflict: 'id' });

  if (error) {
    console.error('Errore durante l\'inserimento su Supabase:', error);
  } else {
    console.log(`Successo! Inseriti/Aggiornati ${activities.length} record nel Cloud.`);
  }
}

seed();
