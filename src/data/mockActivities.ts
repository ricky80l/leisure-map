export interface Activity {
  id: string;
  name: string;
  category: 'calcio' | 'tennis' | 'yoga' | 'nuoto' | 'pilates' | 'teatro' | 'danza';
  level: 'principianti' | 'intermedio' | 'avanzato';
  target: 'bambini' | 'adulti' | 'tutti';
  days: number[]; // 1 = Lunedì, 2 = Martedì, ..., 7 = Domenica
  startHour: number; // 0-23
  endHour: number; // 0-23
  price: string;
  description: string;
  locationName: string;
  lat: number;
  lng: number;
  contact: string;
  organizer: string;
}

export const CATEGORY_LABELS: Record<Activity['category'], string> = {
  calcio: '⚽ Calcio',
  tennis: '🎾 Tennis',
  yoga: '🧘 Yoga',
  nuoto: '🏊 Nuoto',
  pilates: '🤸 Pilates',
  teatro: '🎭 Teatro',
  danza: '💃 Danza'
};

export const LEVEL_LABELS: Record<Activity['level'], string> = {
  principianti: 'Principianti',
  intermedio: 'Intermedio',
  avanzato: 'Avanzato'
};

export const TARGET_LABELS: Record<Activity['target'], string> = {
  bambini: 'Bambini',
  adulti: 'Adulti',
  tutti: 'Tutti'
};

export const DAY_LABELS = [
  { value: 1, label: 'Lunedì' },
  { value: 2, label: 'Martedì' },
  { value: 3, label: 'Mercoledì' },
  { value: 4, label: 'Giovedì' },
  { value: 5, label: 'Venerdì' },
  { value: 6, label: 'Sabato' },
  { value: 7, label: 'Domenica' }
];

// Generatore di attività mock distribuite entro un certo raggio in km
export function generateMockActivities(centerLat: number, centerLng: number, radiusKm: number = 5): Activity[] {
  const templates: Omit<Activity, 'id' | 'lat' | 'lng'>[] = [
    {
      name: 'Corso di Calcio a 5 per Adulti Principianti',
      category: 'calcio',
      level: 'principianti',
      target: 'adulti',
      days: [1, 3], // Lunedì e Mercoledì
      startHour: 20,
      endHour: 22,
      price: '€40 / mese',
      description: 'Dedicato ad adulti che vogliono ricominciare o imparare le basi del calcio a 5. Allenamenti con istruttore e partitella finale.',
      locationName: 'Centro Sportivo Comunale Green Arena',
      organizer: 'ASD Calcio Amatoriale',
      contact: 'info@asdcalcioamatoriale.it'
    },
    {
      name: 'Scuola Calcio Bimbi - Primi Calci',
      category: 'calcio',
      level: 'principianti',
      target: 'bambini',
      days: [2, 4], // Martedì e Giovedì
      startHour: 17,
      endHour: 19,
      price: '€45 / mese',
      description: 'Corso propedeutico al calcio per bambini da 5 a 8 anni. Giochi di movimento e prima tecnica calcistica.',
      locationName: 'Sporting Club Dynamic',
      organizer: 'FC Giovani Promesse',
      contact: 'giovanipromesse@email.com'
    },
    {
      name: 'Calcio a 8 - Allenamento Avanzato',
      category: 'calcio',
      level: 'avanzato',
      target: 'adulti',
      days: [3, 5], // Mercoledì e Venerdì
      startHour: 19,
      endHour: 21,
      price: '€50 / mese',
      description: 'Allenamento ad alta intensità per giocatori esperti. Schemi tattici, atletica e partitella regolamentare.',
      locationName: 'Campi Sportivi San Siro Club',
      organizer: 'Lega Amatori Calcio',
      contact: '06-99887711'
    },
    {
      name: 'Vinyasa Flow Yoga serale',
      category: 'yoga',
      level: 'principianti',
      target: 'adulti',
      days: [1, 4], // Lunedì e Giovedì
      startHour: 18,
      endHour: 19,
      price: '€12 / lezione',
      description: 'Classe fluida adatta a tutti, concentrata sul respiro e sulla flessibilità. Perfetta per scaricare la tensione post-lavoro.',
      locationName: 'Shanti Yoga Studio',
      organizer: 'Elena Rossi (Insegnante RYT-200)',
      contact: 'elena.yoga@gmail.com'
    },
    {
      name: 'Hatha Yoga per la Terza Età',
      category: 'yoga',
      level: 'principianti',
      target: 'adulti',
      days: [2, 5],
      startHour: 9,
      endHour: 10,
      price: '€35 / mese',
      description: 'Movimenti dolci e guidati, adatti a chi cerca mobilità articolare e rilassamento mentale.',
      locationName: 'Centro Olistico Armonia',
      organizer: 'Associazione Benessere ASD',
      contact: 'info@benessereasd.it'
    },
    {
      name: 'Tennis Adulti - Perfezionamento Tecnico',
      category: 'tennis',
      level: 'intermedio',
      target: 'adulti',
      days: [2, 6], // Martedì e Sabato
      startHour: 10,
      endHour: 12,
      price: '€60 / mese',
      description: 'Migliora il tuo dritto, rovescio e servizio. Gruppi ridotti da massimo 4 persone per campo.',
      locationName: 'Tennis Club Garden',
      organizer: 'Maestro Federale FIT',
      contact: 'maestro.tennis@fit.it'
    },
    {
      name: 'Tennis Principianti Bambini',
      category: 'tennis',
      level: 'principianti',
      target: 'bambini',
      days: [1, 3, 5],
      startHour: 16,
      endHour: 17,
      price: '€55 / mese',
      description: 'Mini-tennis per bambini e ragazzi. Sviluppo della coordinazione oculo-manuale e divertimento assicurato.',
      locationName: 'Tennis Club Garden',
      organizer: 'Maestro Federale FIT',
      contact: 'maestro.tennis@fit.it'
    },
    {
      name: 'Pilates Matwork per Tutti',
      category: 'pilates',
      level: 'principianti',
      target: 'tutti',
      days: [1, 3],
      startHour: 13,
      endHour: 14,
      price: '€15 / lezione',
      description: 'Sessione di pilates a corpo libero focalizzata sul core (Powerhouse) e sulla postura. Ottimo per la pausa pranzo.',
      locationName: 'Core & Balance Studio',
      organizer: 'Studio Pilates ASD',
      contact: 'corebalance@outlook.it'
    },
    {
      name: 'Corso di Nuoto Adulti (Base)',
      category: 'nuoto',
      level: 'principianti',
      target: 'adulti',
      days: [2, 4],
      startHour: 20,
      endHour: 21,
      price: '€65 / mese',
      description: 'Impara a nuotare da zero o supera la paura dell\'acqua. Istruttori pazienti e qualificati FIN.',
      locationName: 'Piscina Comunale Olimpionica',
      organizer: 'Nuoto Club Italia',
      contact: 'segreteria@nuotoclubitalia.it'
    },
    {
      name: 'Acquagym ed Esercizio in Acqua',
      category: 'nuoto',
      level: 'intermedio',
      target: 'adulti',
      days: [3, 5],
      startHour: 9,
      endHour: 10,
      price: '€8 / ingresso',
      description: 'Ginnastica a ritmo di musica in acqua alta media. Tonificazione senza impatti sulle articolazioni.',
      locationName: 'Piscina Comunale Olimpionica',
      organizer: 'Nuoto Club Italia',
      contact: 'segreteria@nuotoclubitalia.it'
    },
    {
      name: 'Recitazione Teatrale - Laboratorio Adulti',
      category: 'teatro',
      level: 'principianti',
      target: 'adulti',
      days: [4], // Solo Giovedì
      startHour: 21,
      endHour: 23,
      price: '€50 / mese',
      description: 'Espressione corporea, uso della voce, improvvisazione e messa in scena di uno spettacolo finale. Non è richiesta alcuna esperienza.',
      locationName: 'Teatro Filodrammatici Piccolo',
      organizer: 'Compagnia del Sipario',
      contact: 'teatro.sipario@gmail.com'
    },
    {
      name: 'Danza Classica Propedeutica',
      category: 'danza',
      level: 'principianti',
      target: 'bambini',
      days: [2, 5],
      startHour: 16,
      endHour: 18,
      price: '€40 / mese',
      description: 'Primi passi nel mondo della danza per bambine e bambini. Ritmo, postura e gioco-danza.',
      locationName: 'Accademia Balletto Arte',
      organizer: 'Maestra diplomata alla Scala',
      contact: 'balletto.arte@yahoo.it'
    },
    {
      name: 'Salsa e Bachata per Coppie e Singoli',
      category: 'danza',
      level: 'principianti',
      target: 'adulti',
      days: [3], // Mercoledì
      startHour: 21,
      endHour: 22,
      price: '€10 / lezione',
      description: 'Corso divertente di balli caraibici. Impara i passi base di salsa portoricana e bachata sensuale.',
      locationName: 'Club Latino Dance',
      organizer: 'Salsa & Friends ASD',
      contact: '333-1234567'
    }
  ];

  return templates.map((t, idx) => {
    const seed = idx * 0.77;
    // 0.009 gradi di latitudine corrispondono a circa 1 km.
    // Generiamo i marker sparpagliati proporzionalmente al raggio selezionato.
    // Aggiungiamo un fattore casuale controllato che rientra nel raggio in km.
    const maxOffset = (radiusKm * 0.009) * 0.75;
    const latOffset = Math.sin(seed) * maxOffset;
    const lngOffset = Math.cos(seed * 1.3) * maxOffset;

    return {
      ...t,
      id: `act_${idx + 1}`,
      lat: centerLat + latOffset,
      lng: centerLng + lngOffset
    };
  });
}
