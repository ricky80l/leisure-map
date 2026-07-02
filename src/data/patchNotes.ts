export interface PatchNote {
  version: string;
  date: string;
  title: string;
  features: string[];
  fixes: string[];
}

export const LATEST_PATCH_NOTE: PatchNote = {
  version: "2.1.0",
  date: "3 Luglio 2026",
  title: "Nuova Ricerca Intelligente & Grafica Premium 🚀",
  features: [
    "Ricerca Map-Click: Clicca in un punto qualsiasi della mappa per aggiornare immediatamente i risultati nei dintorni.",
    "Nuovo Menù a Tendina: Sostituito il menù standard con una tendina customizzata super veloce, cliccabile più volte, filtrata dinamicamente e con la nuova veste grafica.",
    "Autocompletamento Rapido: Usa il tasto TAB nella barra di ricerca per completare al volo il suggerimento.",
    "Importazione Dati: 151 nuove attività sportive, inclusi Calisthenics, Fitness e Arti Marziali, aggiunte al database."
  ],
  fixes: [
    "Patch Notes Premium: Rivista l'interfaccia delle note di aggiornamento per farla combaciare perfettamente con il tema e i colori dell'app.",
    "Fix Mapbox Crash: Risolta l'incompatibilità tecnica (type mismatch) che causava la sparizione dei pin sulla mappa.",
    "Scorrimento Intelligente: La lista laterale ora scorre automaticamente per centrare la scheda dell'attività selezionata dalla mappa."
  ]
};
