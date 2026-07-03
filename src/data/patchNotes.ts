export interface PatchNote {
  version: string;
  date: string;
  title: string;
  features: string[];
  fixes: string[];
}

export const LATEST_PATCH_NOTE: PatchNote = {
  version: "2.2.0",
  date: "4 Luglio 2026",
  title: "Schede 3D, Distanze & Segnalazioni 🌟",
  features: [
    "Card 3D Interattive: Le schede delle attività ora hanno un fantastico effetto di rotazione 3D al passaggio del mouse. Il retro offre un layout premium con icone e design ad alto contrasto.",
    "Distanza Geografica in tempo reale: Aggiunta un'etichetta in cima a ogni scheda che mostra istantaneamente a che distanza ti trovi dalla struttura (calcolata con formula di Haversine).",
    "Sistema di Verifica Dati: Implementata la visibilità sull'ultima data di verifica delle informazioni e sulla fonte originaria. I dati non aggiornati da oltre 6 mesi verranno evidenziati in rosso.",
    "Segnalazioni Utenti: Aggiunto un nuovo modulo integrato per permettere alla community di segnalare aggiornamenti, inviare correzioni e proporre nuove strutture da aggiungere alla mappa."
  ],
  fixes: [
    "Ottimizzazione Touch: Risolto il fastidioso comportamento 'Sticky Hover' sui dispositivi mobile che teneva le schede bloccate sul lato posteriore.",
    "Riformattazione Date: Standardizzato globalmente il formato delle date nel corretto standard italiano (GG/MM/AAAA)."
  ]
};
