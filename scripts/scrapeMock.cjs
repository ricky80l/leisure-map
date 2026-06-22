const fs = require('fs');
const path = require('path');

// Percorsi del database JSON locale
const dbPath = path.join(__dirname, '..', 'src', 'data', 'activities.json');

// 1. Definiamo i nuovi corsi da importare (es. un corso di Ciclismo a Treviso e uno di Skate a Conegliano)
const scrapedCourses = [
  {
    name: "Avviamento al Ciclismo su Strada",
    category: "ciclismo", // Nuova categoria! Comparirà automaticamente nella select del frontend
    level: "principianti",
    target: "bambini",
    days: [6, 7], // Sabato e Domenica
    startHour: 9,
    endHour: 11,
    price: "€35 / mese",
    description: "Lezioni pratiche per bambini per imparare a condurre la bici da corsa in sicurezza.",
    locationName: "Pista Ciclismo Spresiano",
    address: "Via dei Giuseppini, Spresiano, Treviso",
    contact: "giovanili@ciclismotrevigiano.it",
    organizer: "Velo Club Trevigiano"
  },
  {
    name: "Lezioni di Skateboarding e Balance",
    category: "skate", // Nuova categoria!
    level: "principianti",
    target: "tutti",
    days: [3, 6],
    startHour: 15,
    endHour: 17,
    price: "€15 / lezione",
    description: "Impara le basi dello skate: spinta, frenata e primi trick nel park assistito da skater esperti.",
    locationName: "Skatepark Treviso",
    address: "Via delle Piscine, Treviso",
    contact: "skatetv@skate.it",
    organizer: "ASD Treviso Skate Boarding"
  }
];

// 2. Funzione per geocodificare un indirizzo testuale usando Nominatim (OpenStreetMap)
async function geocodeAddress(address) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`;
    console.log(`Geocoding indirizzo: "${address}"...`);
    
    // Nominatim richiede un User-Agent valido per evitare errori 403 Forbidden
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'LeisureMapScraper/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
  } catch (error) {
    console.error(`Errore nel geocoding per "${address}":`, error.message);
  }
  return null;
}

// 3. Esecuzione principale di sincronizzazione
async function run() {
  // Carica il database esistente
  let database = [];
  if (fs.existsSync(dbPath)) {
    try {
      const fileData = fs.readFileSync(dbPath, 'utf8');
      database = JSON.parse(fileData);
      console.log(`Database caricato correttamente. Righe attuali: ${database.length}`);
    } catch (e) {
      console.warn("Database non leggibile o vuoto. Ne verrà creato uno nuovo.");
    }
  }

  let changesMade = false;

  for (const course of scrapedCourses) {
    // Evita duplicati controllando se il corso esiste già per nome
    const exists = database.some(item => item.name.toLowerCase() === course.name.toLowerCase());
    if (exists) {
      console.log(`Il corso "${course.name}" esiste già nel database. Salto.`);
      continue;
    }

    // Effettua il geocoding per ottenere lat e lng
    const coords = await geocodeAddress(course.address);
    if (coords) {
      // Crea l'oggetto finale conforme a Activity
      const newId = `act_${database.length + 1}`;
      const newActivity = {
        id: newId,
        name: course.name,
        category: course.category,
        level: course.level,
        target: course.target,
        days: course.days,
        startHour: course.startHour,
        endHour: course.endHour,
        price: course.price,
        description: course.description,
        locationName: course.locationName,
        lat: coords.lat,
        lng: coords.lng,
        contact: course.contact,
        organizer: course.organizer
      };

      database.push(newActivity);
      changesMade = true;
      console.log(`Aggiunto con successo: ${course.name} [ID: ${newId}]`);
    } else {
      console.error(`Impossibile determinare le coordinate per "${course.name}". Non inserito.`);
    }

    // Rispetta i limiti d'uso gratuiti delle API Nominatim (almeno 1 secondo di attesa)
    await new Promise(resolve => setTimeout(resolve, 1200));
  }

  if (changesMade) {
    // Scrive nuovamente il database aggiornato sul file JSON
    fs.writeFileSync(dbPath, JSON.stringify(database, null, 2), 'utf8');
    console.log(`Database aggiornato con successo! Nuove righe totali: ${database.length}`);
  } else {
    console.log("Nessuna nuova attività da aggiungere. Database invariato.");
  }
}

run();
