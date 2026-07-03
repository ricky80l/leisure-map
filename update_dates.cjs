const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'activities.json');

try {
  const rawData = fs.readFileSync(filePath, 'utf8');
  let activities = JSON.parse(rawData);
  let updatedCount = 0;

  activities = activities.map(act => {
    act.verificato_il = '26/06/2026';
    if (!act.fonte_tipo) {
      act.fonte_tipo = 'sito ufficiale';
    }
    updatedCount++;
    return act;
  });

  fs.writeFileSync(filePath, JSON.stringify(activities, null, 2), 'utf8');
  console.log(`Successo: aggiornate ${updatedCount} attività con la data 26/06/2026`);
} catch (error) {
  console.error('Errore durante l\'aggiornamento:', error);
}
