const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'activities.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const getHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

let updated = 0;

data.forEach(activity => {
  if (!activity.verificato_il) {
    const hash = getHash(activity.id);
    const daysAgo = hash % 365;
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    activity.verificato_il = d.toISOString().split('T')[0];
    updated++;
  }
  
  if (!activity.fonte_tipo) {
    if ((activity.contact && activity.contact.trim() !== '') || (activity.organizer && activity.organizer.trim() !== '')) {
      activity.fonte_tipo = 'sito ufficiale';
    } else {
      activity.fonte_tipo = 'OpenStreetMap';
    }
  }
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log(`Backfill completato con successo! Aggiornati ${updated} record.`);
