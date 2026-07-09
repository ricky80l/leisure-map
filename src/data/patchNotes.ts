export interface PatchNote {
  version: string;
  date: string;
  title: string;
  features: string[];
  fixes: string[];
}

export const LATEST_PATCH_NOTE: PatchNote = {
  version: "2.4.0",
  date: "9 Luglio 2026",
  title: "Fix Scheda Dettagli su Mappa Mobile 📱",
  features: [
    "Pannello Dettagli Rifatto: Cliccando un pin sulla mappa da mobile, ora si apre un elegante Bottom Sheet animato che scorre dal basso con transizione fluida, mostrando tutti i dettagli dell'attività.",
    "Pulsante di Chiusura: Il pannello dettagli ha una X ben visibile in alto a destra per tornare immediatamente alla mappa.",
    "Layout Responsive Desktop: Su schermi grandi il pannello scorre da destra come un pannello laterale dedicato."
  ],
  fixes: [
    "Fix Critico: Corretto il bug per cui cliccando un pin sulla mappa non succedeva nulla. La causa era un conflitto tra Tailwind v4 e le classi CSS con valori arbitrari (h-[85vh], translate-y-full) che non venivano generate. Tutto lo styling critico è ora inline.",
    "Fix: Risolto il mismatch di tipo ID tra il GeoJSON della mappa (number) e i dati attività (string) che impediva il match dell'attività cliccata.",
    "Fix: Rimosso il flip 3D della card al tap su mobile — ora un singolo tap apre direttamente il pannello dettagli."
  ]
};
