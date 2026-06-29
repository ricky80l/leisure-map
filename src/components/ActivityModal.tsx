import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { Activity, getCategoryLabel, LEVEL_LABELS, TARGET_LABELS, DAY_LABELS } from '../data/mockActivities';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: Partial<Activity>) => Promise<void>;
  activityToEdit: Activity | null;
  facilityName: string;
}

const hoursOptions = Array.from({ length: 17 }, (_, i) => i + 8); // Da 8 a 24

export default function ActivityModal({
  isOpen,
  onClose,
  onSave,
  activityToEdit,
  facilityName
}: ActivityModalProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState<Partial<Activity>>({
    name: '',
    category: 'palestra',
    level: 'principianti',
    target: 'tutti',
    price: '',
    startHour: 18,
    endHour: 19,
    days: [1, 3],
    description: '',
    locationName: facilityName
  });

  useEffect(() => {
    if (activityToEdit) {
      setFormData(activityToEdit);
    } else {
      setFormData({
        name: '',
        category: 'palestra',
        level: 'principianti',
        target: 'tutti',
        price: '',
        startHour: 18,
        endHour: 19,
        days: [1, 3],
        description: '',
        locationName: facilityName
      });
    }
    setErrorMsg('');
  }, [activityToEdit, facilityName, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      setErrorMsg("Il nome del corso è obbligatorio");
      return;
    }
    if (formData.startHour && formData.endHour && formData.startHour >= formData.endHour) {
      setErrorMsg("L'orario di fine deve essere successivo all'inizio.");
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Errore durante il salvataggio.");
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (dayValue: number) => {
    setFormData(prev => {
      const currentDays = prev.days || [];
      if (currentDays.includes(dayValue)) {
        return { ...prev, days: currentDays.filter(d => d !== dayValue) };
      } else {
        return { ...prev, days: [...currentDays, dayValue] };
      }
    });
  };

  // Categorie hardcoded based on mockActivities available Categories
  const categories = ['palestra', 'piscina', 'tennis', 'yoga', 'calcio', 'arti_marziali', 'danza', 'basket', 'padel', 'pallavolo', 'arrampicata'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50 shrink-0">
          <h2 className="text-xl font-bold text-slate-800">
            {activityToEdit ? 'Modifica Corso' : 'Nuovo Corso'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-200">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 font-medium rounded-r-xl text-sm">
              {errorMsg}
            </div>
          )}

          <form id="activity-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">Nome del Corso <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                  placeholder="Es. Yoga Principianti"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Categoria</label>
                <select
                  value={formData.category || 'palestra'}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white shadow-sm"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{getCategoryLabel(c)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Prezzo Visibile agli Utenti</label>
                <input
                  type="text"
                  value={formData.price || ''}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                  placeholder="Es. €50/mese, €15 lezione"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Livello</label>
                <select
                  value={formData.level || 'tutti'}
                  onChange={e => setFormData({...formData, level: e.target.value as any})}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white outline-none shadow-sm"
                >
                  {Object.entries(LEVEL_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Target Età</label>
                <select
                  value={formData.target || 'tutti'}
                  onChange={e => setFormData({...formData, target: e.target.value as any})}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white outline-none shadow-sm"
                >
                  {Object.entries(TARGET_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Orario Inizio</label>
                <select
                  value={formData.startHour || 18}
                  onChange={e => setFormData({...formData, startHour: Number(e.target.value)})}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white outline-none shadow-sm"
                >
                  {hoursOptions.map(h => <option key={h} value={h}>{h}:00</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Orario Fine</label>
                <select
                  value={formData.endHour || 19}
                  onChange={e => setFormData({...formData, endHour: Number(e.target.value)})}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white outline-none shadow-sm"
                >
                  {hoursOptions.map(h => <option key={h} value={h}>{h}:00</option>)}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">Giorni di svolgimento</label>
                <div className="flex flex-wrap gap-2">
                  {DAY_LABELS.map(day => {
                    const isSelected = (formData.days || []).includes(day.value);
                    return (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleDay(day.value)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                          isSelected 
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {day.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">Descrizione (opzionale)</label>
                <textarea
                  value={formData.description || ''}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                  placeholder="Dettagli sul corso, cosa portare, ecc..."
                ></textarea>
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 font-bold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Annulla
          </button>
          <button
            type="submit"
            form="activity-form"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-200 transition-all disabled:bg-blue-400"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {activityToEdit ? 'Salva Modifiche' : 'Crea Corso'}
          </button>
        </div>

      </div>
    </div>
  );
}
