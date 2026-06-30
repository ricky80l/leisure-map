export interface PatchNote {
  version: string;
  date: string;
  title: string;
  features: string[];
  fixes: string[];
}

export const LATEST_PATCH_NOTE: PatchNote = {
  version: "1.0.1",
  date: "30 Giugno 2026",
  title: "Aggiunte Nuove Strutture & Ricerca Potenziata 🚀",
  features: [
    "La barra di ricerca ora ti porta istantaneamente alla struttura desiderata se presente in database.",
    "Aggiunto FitActive Treviso (H24) e Teatro Sant'Anna (Gli Alcuni).",
    "Cliccando su telefono, email o sito web si aprirà direttamente l'app corrispondente.",
    "Le icone mappa ora sono più pulite e coerenti con le tipologie di corsi."
  ],
  fixes: [
    "Corretto un bug che nascondeva le palestre H24 quando si impostava un filtro orario.",
    "Rimossi vecchi dati fittizi e ripulito il database per una maggiore affidabilità.",
    "Migliorata la stabilità dell'apertura del pannello laterale."
  ]
};
