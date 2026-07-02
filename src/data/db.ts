import { supabase } from '../lib/supabaseClient';
import rawActivities from './activities.json';
import { Activity } from './mockActivities';

/**
 * Funzione centralizzata per recuperare i dati.
 * Se Supabase è configurato e contiene dati, li restituisce.
 * Altrimenti effettua un "fallback" sicuro al file JSON locale.
 */
export async function fetchActivities(): Promise<Activity[]> {
  if (!supabase) {
    console.log("Supabase non configurato (chiavi mancanti). Fallback al JSON locale.");
    return rawActivities as Activity[];
  }

  try {
    // Al momento, la query legge da un'ipotetica vista o tabella 'activities'
    // che riproduce la struttura piatta attuale. 
    // In futuro, questa query sarà una JOIN tra 'facilities' e 'courses'.
    const { data, error } = await supabase.from('activities').select('id, name, category, level, target, days, startHour, endHour, price, description, locationName, address, lat, lng, contact, organizer');
    
    if (error) {
      console.warn("Errore durante il fetch da Supabase:", error.message);
      console.log("Fallback al JSON locale.");
      return rawActivities as Activity[];
    }

    if (!data || data.length === 0) {
      console.log("Nessun dato trovato su Supabase. Fallback al JSON locale.");
      return (rawActivities as Activity[]).map(a => ({ ...a, id: String(a.id) }));
    }

    // Uniamo i dati che abbiamo appena importato localmente dal CSV!
    const localImported = (rawActivities as Activity[]).filter(a => String(a.id).startsWith('csv_imported'));
    const combined = [...(data as Activity[]), ...localImported];
    
    // Forziamo tutti gli ID a essere stringhe per evitare crash nei filtri di Mapbox
    return combined.map(a => ({ ...a, id: String(a.id) }));
  } catch (error) {
    console.error("Errore imprevisto di rete con Supabase:", error);
    return (rawActivities as Activity[]).map(a => ({ ...a, id: String(a.id) }));
  }
}
