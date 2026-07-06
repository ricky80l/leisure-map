export interface PatchNote {
  version: string;
  date: string;
  title: string;
  features: string[];
  fixes: string[];
}

export const LATEST_PATCH_NOTE: PatchNote = {
  version: "2.3.0",
  date: "7 Luglio 2026",
  title: "Ottimizzazioni Mobile, Prestazioni & SEO 🚀",
  features: [
    "Navigazione Mobile Migliorata: L'header è stato ridisegnato per occupare meno spazio. Inoltre, il dettaglio delle attività ora si apre in un comodo 'Bottom Sheet' (pannello a scorrimento dal basso) che non interrompe la navigazione sulla mappa.",
    "Prestazioni di Livello Enterprise: L'elenco attività ora utilizza la 'virtualizzazione'. Anche con centinaia di risultati, l'app scorrerà fluidamente senza mai rallentare il tuo smartphone.",
    "Infrastruttura SEO (Server-Side Rendering): Le singole attività ora sono indicizzabili dai motori di ricerca, con URL dedicati e meta-tag ottimizzati pronti per essere condivisi sui social.",
    "Gestione Geolocalizzazione Intelligente: Se non condividi la posizione, l'app calcola automaticamente le distanze dal centro della mappa, garantendoti sempre risultati coerenti."
  ],
  fixes: [
    "Fix: Sistemato il problema che impediva l'apertura delle schede dettaglio su mobile interagendo con i pin della mappa.",
    "Fix: Eliminati i 'layout shift' visivi durante il caricamento dei filtri e rimosse label anomale senza selezione.",
    "Refactoring: Centralizzate le etichette dell'app in un dizionario unificato (i18n) per prepararsi a futuri aggiornamenti multilingua."
  ]
};
