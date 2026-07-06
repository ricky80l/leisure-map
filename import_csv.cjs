const fs = require('fs');
const crypto = require('crypto');

const csvPath = 'palestre_treviso_COMPLETE_geolocalizzate.csv';
const jsonPath = 'src/data/activities.json';

const csvContent = fs.readFileSync(csvPath, 'utf8');
const lines = csvContent.split('\n').filter(l => l.trim().length > 0);

const existingJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Zona,Comune,Nome Palestra,Indirizzo,Latitudine,Longitudine,Indirizzo Completo,Stato
const newActivities = [];

function createSlug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

function generateStableId(name, address) {
  const data = (name + '|' + address).toLowerCase().trim();
  return crypto.createHash('md5').update(data).digest('hex').substring(0, 10);
}

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  // Basic CSV parsing splitting by comma but ignoring commas in quotes
  const cols = [];
  let current = '';
  let inQuotes = false;
  for (let char of line) {
    if (char === '"') inQuotes = !inQuotes;
    else if (char === ',' && !inQuotes) {
      cols.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  cols.push(current);

  if (cols.length >= 6) {
    const name = cols[2].replace(/"/g, '').trim();
    const address = cols[3].replace(/"/g, '').trim();
    const lat = parseFloat(cols[4]);
    const lng = parseFloat(cols[5]);
    const fullAddress = cols.length >= 7 ? cols[6].replace(/"/g, '').trim() : address;

    // Avoid duplicates by name
    if (existingJson.some(a => a.name === name) || newActivities.some(a => a.name === name)) {
      continue;
    }

    if (!isNaN(lat) && !isNaN(lng)) {
      
      // Infer category from name or address
      let category = 'palestra';
      const textToSearch = (name + ' ' + fullAddress).toLowerCase();
      if (textToSearch.includes('calisthenics')) category = 'calisthenics';
      else if (textToSearch.includes('crossfit')) category = 'crossfit';
      else if (textToSearch.includes('yoga')) category = 'yoga';
      else if (textToSearch.includes('pilates')) category = 'pilates';
      else if (textToSearch.includes('arti marziali') || textToSearch.includes('karate') || textToSearch.includes('judo')) category = 'arti_marziali';
      
      const stableId = generateStableId(name, address);
      const slug = createSlug(`${name}-${cols[1].replace(/"/g, '').trim()}`);

      newActivities.push({
        id: stableId,
        slug: slug,
        name: name,
        category: category,
        level: 'intermedio',
        target: 'tutti',
        days: [1, 2, 3, 4, 5],
        startHour: 8,
        endHour: 22,
        price: 'Contatta la struttura',
        description: `Struttura: ${name}. Indirizzo: ${fullAddress}`,
        locationName: name,
        lat: lat,
        lng: lng,
        contact: 'Nessun contatto',
        organizer: name
      });
    }
  }
}

// Append and save
const combined = [...existingJson, ...newActivities];
fs.writeFileSync(jsonPath, JSON.stringify(combined, null, 2), 'utf8');

console.log(`Imported ${newActivities.length} activities from CSV.`);
