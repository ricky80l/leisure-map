export interface PatchNote {
  version: string;
  date: string;
  title: string;
  features: string[];
  fixes: string[];
}

export const LATEST_PATCH_NOTE: PatchNote = {
  version: "1.3.0",
  date: "2 Luglio 2026",
  title: "Motore di Ricerca Avanzato & Pulizia Dati 🚀",
  features: [
    "Ricerca a Parole Chiave: Ora puoi digitare più parole simultaneamente (es. 'tennis este') per trovare esattamente la struttura o il corso che desideri.",
    "Autocompletamento Intelligente: Aggiunti menù a tendina nativi (datalist) per suggerire automaticamente i nomi delle città e delle discipline mentre digiti.",
    "Coordinate Precise al Millimetro: Migliorato l'algoritmo per posizionare il pin esattamente sopra la struttura sportiva, non più al centro del paese.",
    "Bonifica Prezzi: Rimossi i prezzi fittizi dal database (es. 50€/mese) generati dalle vecchie importazioni AI, sostituiti con un chiaro 'Da verificare' lampeggiante."
  ],
  fixes: [
    "Rimosse le strutture ridondanti e duplicate sfuggite ai precedenti filtri di importazione.",
    "Corretto un bug per il quale alcune categorie estratte dal bot non venivano lette se prive di punto finale.",
    "Formattati e aggiornati i contatti telefonici per palestre specifiche."
  ]
};
