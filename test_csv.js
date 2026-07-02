const line = '1,Ponzano Veneto,ASD AREA,"Via Piave, 1/B, Ponzano Veneto",45.7036091,12.219804,"Calisthenics Treviso, 1b, Via Piave, Zanella, Ponzano, Ponzano Veneto, Treviso, Veneto, 31050, Italia",OK';
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
console.log(cols);
