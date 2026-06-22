import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, ShieldAlert, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    facilityName: '',
    privacyAccepted: false,
    termsAccepted: false
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!supabase) {
      setErrorMsg("Errore: Supabase non configurato.");
      return;
    }

    if (!formData.privacyAccepted || !formData.termsAccepted) {
      setErrorMsg("Devi accettare la Privacy Policy e i Termini per registrarti.");
      return;
    }

    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      const user = authData.user;
      if (!user) throw new Error("Errore durante la creazione dell'utente.");

      const { error: profileError } = await supabase
        .from('managers')
        .insert([
          {
            id: user.id,
            full_name: formData.name,
            facility_name: formData.facilityName,
            status: 'pending'
          }
        ]);

      if (profileError) throw profileError;

      navigate('/dashboard');

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Errore sconosciuto durante la registrazione.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-gradient-to-br from-blue-600 to-cyan-500 p-4 rounded-2xl shadow-md border border-white/20">
            <MapPin className="h-10 w-10 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Registra la tua struttura
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500 font-medium px-4">
          Crea un account per gestire i corsi della tua palestra sulla mappa.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow-sm border border-slate-200 sm:rounded-2xl sm:px-10">
          
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6 rounded-r-xl shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <ShieldAlert className="h-5 w-5 text-amber-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-bold text-amber-900">Verifica dell'Identità</h3>
                <div className="mt-2 text-sm text-amber-700 font-medium">
                  <p>Per proteggere le strutture da modifiche non autorizzate, ogni nuovo account sarà <strong>sottoposto a verifica manuale</strong> da parte dello staff prima di poter pubblicare o modificare dati. Usa un'email aziendale ufficiale per velocizzare l'approvazione.</p>
                </div>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md mb-6 text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700">Nome del Gestore</label>
                <div className="mt-1">
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="appearance-none block w-full px-3 py-2.5 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Mario Rossi"
                  />
                </div>
                <p className="mt-1.5 text-xs font-medium text-slate-400">I tuoi dati personali non saranno resi pubblici.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700">Nome Struttura da rivendicare</label>
                <div className="mt-1">
                  <input
                    type="text"
                    required
                    value={formData.facilityName}
                    onChange={(e) => setFormData({...formData, facilityName: e.target.value})}
                    className="appearance-none block w-full px-3 py-2.5 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Es. Palestra FitLife"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700">Email aziendale</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="appearance-none block w-full px-3 py-2.5 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="info@tuapalestra.it"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700">Password</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="appearance-none block w-full px-3 py-2.5 border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Sezione Privacy e GDPR */}
            <div className="mt-6 border-t border-slate-200 pt-6">
              <h4 className="text-sm font-bold text-slate-900 mb-4">Consensi Privacy (GDPR)</h4>
              
              <div className="flex items-start mb-4">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    required
                    checked={formData.termsAccepted}
                    onChange={(e) => setFormData({...formData, termsAccepted: e.target.checked})}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-slate-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="font-bold text-slate-700">Termini di Servizio</label>
                  <p className="text-slate-500 font-medium mt-0.5">Accetto i <a href="#" className="text-blue-600 hover:underline">Termini di Servizio</a> e dichiaro di essere il legittimo rappresentante della struttura indicata.</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="privacy"
                    type="checkbox"
                    required
                    checked={formData.privacyAccepted}
                    onChange={(e) => setFormData({...formData, privacyAccepted: e.target.checked})}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-slate-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="privacy" className="font-bold text-slate-700">Informativa Privacy</label>
                  <p className="text-slate-500 font-medium mt-0.5">Acconsento al trattamento dei miei dati personali in conformità con la <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.</p>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md shadow-blue-200 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-blue-400"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Invia Richiesta di Registrazione"}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500 font-medium">Oppure</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link to="/login" className="font-bold text-blue-600 hover:text-blue-500">
                Hai già un account? Accedi
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
