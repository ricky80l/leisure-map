import { X, Sparkles, CheckCircle, Rocket } from 'lucide-react';
import { LATEST_PATCH_NOTE } from '../data/patchNotes';

interface PatchNotesModalProps {
  onClose: () => void;
}

export default function PatchNotesModal({ onClose }: PatchNotesModalProps) {
  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-[3010] flex flex-col overflow-hidden animate-fade-in-up">
        {/* Header Decorativo */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 text-white/10">
            <Rocket size={120} />
          </div>
          <h2 className="text-2xl font-bold mb-1 relative z-10">{LATEST_PATCH_NOTE.title}</h2>
          <div className="flex items-center justify-center gap-2 text-blue-100 text-sm font-medium relative z-10">
            <span className="bg-white/20 px-2 py-0.5 rounded-md">v{LATEST_PATCH_NOTE.version}</span>
            <span>•</span>
            <span>{LATEST_PATCH_NOTE.date}</span>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 bg-black/10 hover:bg-black/20 text-white rounded-full p-1.5 transition-colors z-[3020]"
        >
          <X size={20} />
        </button>

        {/* Contenuto */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          
          {LATEST_PATCH_NOTE.features.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-3">
                <Sparkles className="text-amber-500" size={20} />
                Nuove Funzionalità
              </h3>
              <ul className="space-y-3">
                {LATEST_PATCH_NOTE.features.map((feature, idx) => (
                  <li key={idx} className="flex gap-3 text-slate-600 text-sm leading-relaxed">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {LATEST_PATCH_NOTE.fixes.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-3">
                <CheckCircle className="text-emerald-500" size={20} />
                Correzioni e Miglioramenti
              </h3>
              <ul className="space-y-3">
                {LATEST_PATCH_NOTE.fixes.map((fix, idx) => (
                  <li key={idx} className="flex gap-3 text-slate-600 text-sm leading-relaxed">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    <span>{fix}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
          <button 
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-200 transition-all transform active:scale-95"
          >
            Ho capito, Inizia a Esplorare!
          </button>
        </div>
      </div>
    </div>
  );
}
