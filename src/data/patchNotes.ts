export interface PatchNote {
  version: string;
  date: string;
  title: string;
  features: string[];
  fixes: string[];
}

export const LATEST_PATCH_NOTE: PatchNote = {
  version: "1.2.0",
  date: "1 Luglio 2026",
  title: "Bot Scraper Intelligente & Filtri Avanzati 🤖",
  features: [
    "Scraping Semantico: Un nuovo bot scansiona in automatico i siti web delle palestre per estrarre i corsi sportivi offerti.",
    "Riconoscimento Sinonimi: Il bot normalizza intelligentemente le diciture (es. 'Suspension Training' o 'Allenamento in sospensione' diventano 'TRX').",
    "Filtri di Ricerca Avanzati: Ora puoi filtrare la mappa direttamente per disciplina specifica (es. Pilates, Crossfit, Zumba, ecc.) tramite l'apposito menù a tendina.",
    "Nuovi Dati: Inserite 54 nuove palestre (inclusa la provincia di Padova) con siti web ripuliti da URL spuri e numeri di telefono attivi."
  ],
  fixes: [
    "Rimosse le coordinate fittizie o approssimative dei centri non trovati inizialmente.",
    "Formattati i numeri di telefono per permettere la composizione automatica su smartphone.",
    "Migliorato il sistema di matching delle categorie nel pannello di sinistra."
  ]
};
