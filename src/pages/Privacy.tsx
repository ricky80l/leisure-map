import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold mb-8 transition-colors">
          <ArrowLeft size={20} />
          Torna alla mappa
        </Link>
        
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12">
          <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-8">
            <div className="bg-blue-100 p-3 rounded-2xl">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">Informativa sulla Privacy</h1>
          </div>
          
          <div className="prose prose-slate max-w-none prose-headings:text-slate-800 prose-p:text-slate-600">
            <p className="lead text-lg font-medium text-slate-500 mb-8">
              Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}
            </p>

            <h2 className="text-xl font-bold mt-8 mb-4">1. Dati raccolti</h2>
            <p className="mb-4">
              Raccogliamo i dati forniti volontariamente dai gestori durante la registrazione (nome, email aziendale, nome della struttura) esclusivamente allo scopo di verificare l'identità e permettere la gestione autonoma dei corsi sulla piattaforma LeisureMap. Non raccogliamo dati personali dagli utenti che navigano liberamente sulla mappa.
            </p>

            <h2 className="text-xl font-bold mt-8 mb-4">2. Utilizzo dei dati</h2>
            <p className="mb-4">
              L'indirizzo email viene utilizzato esclusivamente come credenziale di accesso e per eventuali comunicazioni tecniche essenziali relative al funzionamento dell'account. I dati pubblici della struttura (orari, prezzi, categorie) vengono mostrati pubblicamente sulla mappa.
            </p>

            <h2 className="text-xl font-bold mt-8 mb-4">3. Conservazione e Sicurezza</h2>
            <p className="mb-4">
              I dati sono conservati in modo sicuro sui database di Supabase. Adottiamo misure di sicurezza standard per proteggere l'accesso non autorizzato, l'alterazione o la distruzione dei dati.
            </p>

            <h2 className="text-xl font-bold mt-8 mb-4">4. Diritti dell'utente (GDPR)</h2>
            <p className="mb-4">
              In base al Regolamento Europeo (GDPR), hai il diritto di richiedere in qualsiasi momento l'accesso, la rettifica o la cancellazione dei tuoi dati (Diritto all'Oblio) inviando una comunicazione al gestore della piattaforma. In caso di cancellazione, tutti i dati associati al tuo account gestore verranno rimossi dai nostri server.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
