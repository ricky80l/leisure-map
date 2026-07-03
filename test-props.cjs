const data = require('./src/data/activities.json');
console.log(Object.keys(data[0]));
const withDisciplina = data.find(a => Object.keys(a).includes('disciplina'));
console.log(withDisciplina ? 'Found disciplina' : 'No disciplina found');
