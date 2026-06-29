import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

export default function Terms() {
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
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900">Termini di Servizio</h1>
          </div>
          
          <div className="prose prose-slate max-w-none prose-headings:text-slate-800 prose-p:text-slate-600">
            <p className="lead text-lg font-medium text-slate-500 mb-8">
              Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}
            </p>

            <h2 className="text-xl font-bold mt-8 mb-4">1. Accettazione dei Termini</h2>
            <p className="mb-4">
              Registrandoti come "Gestore" su LeisureMap, accetti i presenti Termini di Servizio. Se non sei d'accordo con una o più delle presenti condizioni, ti preghiamo di non utilizzare il servizio di registrazione.
            </p>

            <h2 className="text-xl font-bold mt-8 mb-4">2. Rivendicazione delle Strutture</h2>
            <p className="mb-4">
              Dichiari sotto la tua personale responsabilità di essere il titolare, il rappresentante legale o un dipendente autorizzato della struttura sportiva che intendi rivendicare. Registrazioni fraudolente o non autorizzate porteranno all'immediata sospensione dell'account e alla rimozione dei dati alterati.
            </p>

            <h2 className="text-xl font-bold mt-8 mb-4">3. Accuratezza dei Dati</h2>
            <p className="mb-4">
              Ti impegni a inserire informazioni veritiere, accurate e aggiornate sui corsi, gli orari e i prezzi della tua struttura. LeisureMap funge solo da vetrina e non è responsabile per discrepanze tra i prezzi indicati sulla piattaforma e quelli effettivamente applicati in sede.
            </p>

            <h2 className="text-xl font-bold mt-8 mb-4">4. Approvazione Manuale</h2>
            <p className="mb-4">
              Ogni nuovo account gestore viene sottoposto a revisione manuale. Ci riserviamo il diritto di rifiutare una registrazione o richiedere ulteriore documentazione qualora l'identità o l'associazione con la struttura non risultino chiare.
            </p>
            
            <h2 className="text-xl font-bold mt-8 mb-4">5. Limitazione di Responsabilità</h2>
            <p className="mb-4">
              Il servizio è fornito "così com'è". LeisureMap non può garantire l'assenza di interruzioni o errori nel servizio e declina ogni responsabilità per eventuali danni diretti o indiretti derivanti dall'utilizzo della piattaforma.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
