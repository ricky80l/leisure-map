import { createClient } from '@supabase/supabase-js';
import rawActivities from './activities.json';
import { Activity } from './mockActivities';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key';
export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

let cachedActivitiesPromise: Promise<Activity[]> | null = null;

export function slugify(text: string) {
  if (!text) return '';
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

function enforceStableSlugs(activities: Activity[]): Activity[] {
  const seen = new Set<string>();
  return activities.map(a => {
    let baseSlug = a.slug || `${slugify(a.name)}-${slugify(a.locationName)}${a.category ? '-' + slugify(a.category) : ''}`;
    let uniqueSlug = baseSlug;
    let counter = 1;
    // Fallback in case of exact duplicates to avoid crash, though it should be rare
    while (seen.has(uniqueSlug)) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }
    seen.add(uniqueSlug);
    return { ...a, id: String(a.id), slug: uniqueSlug };
  });
}

/**
 * Funzione centralizzata per recuperare i dati.
 * Se Supabase è configurato e contiene dati, li restituisce.
 * Altrimenti effettua un "fallback" sicuro al file JSON locale.
 * Cache in-memory per worker per prevenire rate-limits durante SSG.
 */
export async function fetchActivities(): Promise<Activity[]> {
  if (cachedActivitiesPromise) {
    return cachedActivitiesPromise;
  }

  cachedActivitiesPromise = (async () => {
    let rawResult: Activity[] = [];
    if (!supabase) {
      console.log("Supabase non configurato (chiavi mancanti). Fallback al JSON locale.");
      rawResult = rawActivities as Activity[];
    } else {
      try {
        const { data, error } = await supabase.from('activities').select('*');
        
        if (error) {
          console.warn("Errore durante il fetch da Supabase:", error.message);
          console.log("Fallback al JSON locale.");
          rawResult = rawActivities as Activity[];
        } else if (!data || data.length === 0) {
          console.log("Nessun dato trovato su Supabase. Fallback al JSON locale.");
          rawResult = rawActivities as Activity[];
        } else {
          const localImported = (rawActivities as Activity[]).filter(a => String(a.id).startsWith('csv_imported'));
          rawResult = [...(data as Activity[]), ...localImported];
        }
      } catch (error) {
        console.error("Errore imprevisto di rete con Supabase:", error);
        rawResult = rawActivities as Activity[];
      }
    }
    
    return enforceStableSlugs(rawResult);
  })();

  return cachedActivitiesPromise;
}
