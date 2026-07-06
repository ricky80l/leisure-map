export interface Activity {
  id: string;
  slug?: string;
  name: string;
  category: string; // Libero per supportare dinamicamente qualsiasi sport
  disciplina?: string; // Disciplina da vocabolario controllato
  level: 'principianti' | 'intermedio' | 'avanzato';
  target: 'bambini' | 'adulti' | 'tutti';
  days: number[]; // 1 = Lunedì, 7 = Domenica
  startHour: number; // 0-23
  endHour: number; // 0-23
  price: string;
  description: string;
  locationName: string;
  address?: string;
  lat: number;
  lng: number;
  contact: string;
  organizer: string;
  verificato_il?: string; // ISO date string e.g. "2026-06-15"
  fonte_tipo?: 'sito ufficiale' | 'piattaforma booking' | 'OpenStreetMap' | 'segnalazione diretta';
}

export const CATEGORY_EMOJIS: Record<string, string> = {
  calcio: '⚽',
  tennis: '🎾',
  yoga: '🧘',
  nuoto: '🏊',
  pilates: '🤸',
  teatro: '🎭',
  danza: '💃',
  basket: '🏀',
  karate: '🥋',
  ciclismo: '🚴',
  palestra: '💪',
  padel: '🎾',
  scacchi: '♟️',
  crossfit: '🏋️',
  zumba: '🕺',
  spinning: '🚲',
  funzionale: '🏃',
  pesi: '🏋️‍♂️',
  acquagym: '🤽',
  posturale: '🧘‍♂️',
  aerobica: '🏃‍♀️',
  step: '🧗',
  ginnastica: '🤸‍♀️',
  pugilato: '🥊',
  boxe: '🥊',
  'arti marziali': '🥋',
  judo: '🥋',
  ballo: '💃',
  calisthenics: '🤸‍♂️',
  kettlebell: '🏋️',
  trx: '🧗‍♂️',
  'total body': '💪',
  gag: '🍑',
  stretching: '🧘',
  cardiofitness: '🏃',
  pallavolo: '🏐',
  calcetto: '⚽',
  arrampicata: '🧗',
  macchinari: '⚙️',
  'sala attrezzi': '🏋️',
  idromassaggio: '🛁',
  sauna: '🧖',
  'body building': '🏋️‍♂️',
  bodybuilding: '🏋️‍♂️',
  kickboxing: '🥊',
  'thai boxe': '🥊',
  mma: '🤼',
  default: '❓'
};

export function getCategoryLabel(category: string): string {
  if (!category) return `${CATEGORY_EMOJIS.default} Altro`;
  const c = category.toLowerCase();
  const emoji = CATEGORY_EMOJIS[c] || CATEGORY_EMOJIS.default;
  const capitalized = category.charAt(0).toUpperCase() + category.slice(1);
  return `${emoji} ${capitalized}`;
}

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

// Formula dell'Emisenoverso (Haversine) per calcolare la distanza reale in km
export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Raggio della Terra in chilometri
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distanza in km
}
