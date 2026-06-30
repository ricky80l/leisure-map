const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, error } = await supabase
    .from('activities')
    .update({ 
      price: '', // Cancella il prezzo finto affinché UI mostri 'Da verificare'
      contact: 'https://santabona.natatorium.it/',
      organizer: 'Piscine Natatorium Treviso',
      description: 'Corsi di nuoto e nuoto libero. Le tariffe variano stagionalmente, visita il sito web ufficiale per scaricare le brochure aggiornate.'
    })
    .eq('id', 'act_1');
    
  if (error) {
    console.error("Errore aggiornamento:", error);
  } else {
    console.log("Aggiornamento completato con successo:", data);
  }
}

run();
