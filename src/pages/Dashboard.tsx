import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ShieldAlert, LogOut, Plus, Settings, CalendarDays, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Activity } from '../data/mockActivities';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [managerProfile, setManagerProfile] = useState<any>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    // Se non è loggato (e non sta caricando l'auth), caccialo
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    async function loadDashboardData() {
      if (!user || !supabase) return;

      try {
        // 1. Fetch Profilo Gestore
        const { data: profileData, error: profileError } = await supabase
          .from('managers')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;
        setManagerProfile(profileData);

        // 2. Se è approvato, scarica SOLO i corsi della sua struttura
        if (profileData && profileData.status === 'approved') {
          const { data: actData, error: actError } = await supabase
            .from('activities')
            .select('*')
            .eq('locationName', profileData.facility_name);

          if (actError) throw actError;
          setActivities(actData as Activity[]);
        }
      } catch (err) {
        console.error("Errore caricamento dashboard:", err);
      } finally {
        setLoadingData(false);
      }
    }

    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
      </div>
    );
  }

  const isPending = managerProfile?.status === 'pending';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Dashboard */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
            <MapPin size={24} />
            <span>Leisure Map</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 uppercase font-semibold tracking-wider">Area Gestori</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <a href="#" className="flex items-center gap-3 bg-blue-50/80 text-blue-700 px-4 py-2.5 rounded-xl font-semibold shadow-sm border border-blue-100/50">
            <CalendarDays size={18} />
            I Miei Corsi
          </a>
          <a href="#" className="flex items-center gap-3 text-slate-500 hover:bg-slate-50 hover:text-slate-700 px-4 py-2.5 rounded-xl font-semibold transition-colors">
            <Settings size={18} />
            Profilo Struttura
          </a>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 text-slate-500 hover:text-red-500 hover:bg-red-50 px-4 py-2.5 rounded-xl font-semibold transition-colors"
          >
            <LogOut size={18} />
            Esci
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-slate-200 p-6 flex justify-between items-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-800">
            Pannello di Controllo
          </h1>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-bold text-slate-800 text-sm leading-tight">{managerProfile?.full_name}</p>
              <p className="text-xs text-slate-500 font-medium">{managerProfile?.facility_name}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold uppercase shadow-sm">
              {managerProfile?.full_name ? managerProfile.full_name.substring(0, 2) : 'MR'}
            </div>
          </div>
        </header>

        <main className="p-8 max-w-6xl mx-auto">
          {/* Banner Pending State */}
          {isPending && (
            <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-6 mb-8 flex items-start gap-4 shadow-sm">
              <div className="bg-white p-2 rounded-xl shadow-sm border border-amber-100 shrink-0">
                <ShieldAlert className="text-amber-500 w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-amber-900">Account in attesa di verifica</h3>
                <p className="text-amber-700/80 mt-1 text-sm font-medium leading-relaxed">
                  Abbiamo ricevuto la tua richiesta di rivendicazione per <strong>{managerProfile?.facility_name}</strong>. Il nostro team sta verificando i tuoi dati. 
                  Nel frattempo, <strong>la funzionalità di modifica e inserimento corsi è bloccata</strong> e non puoi vedere i corsi esistenti.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Corsi Attivi</h2>
            <button 
              disabled={isPending}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
                isPending 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200'
              }`}
            >
              <Plus size={18} />
              Aggiungi Corso
            </button>
          </div>

          {/* Tabella Corsi */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {isPending ? (
              <div className="p-12 text-center text-slate-400">
                <p className="font-medium">La tabella dei corsi sarà visibile dopo l'approvazione del tuo account.</p>
              </div>
            ) : activities.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-bold">Nome Corso</th>
                    <th className="p-4 font-bold">Categoria</th>
                    <th className="p-4 font-bold">Orario</th>
                    <th className="p-4 font-bold">Prezzo</th>
                    <th className="p-4 font-bold">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activities.map(act => (
                    <tr key={act.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-800">{act.name}</td>
                      <td className="p-4 text-slate-600 capitalize text-sm font-medium">{act.category}</td>
                      <td className="p-4 text-slate-600 text-sm font-medium">{act.startHour}:00 - {act.endHour}:00</td>
                      <td className="p-4 text-slate-800 font-bold text-sm">{act.price}</td>
                      <td className="p-4">
                        <button disabled={isPending} className="text-blue-600 hover:text-blue-800 font-bold text-sm disabled:text-slate-300 mr-4 transition-colors">
                          Modifica
                        </button>
                        <button disabled={isPending} className="text-red-500 hover:text-red-700 font-bold text-sm disabled:text-slate-300 transition-colors">
                          Elimina
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center text-slate-400">
                <p className="font-medium">Nessun corso inserito attualmente in questa struttura.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
