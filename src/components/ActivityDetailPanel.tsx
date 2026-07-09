'use client';

import { useState, useEffect } from 'react';
import { Activity, getCategoryLabel, LEVEL_LABELS, TARGET_LABELS, DAY_LABELS } from '../data/mockActivities';
import { X, MapPin, Navigation, Share2, CalendarPlus, Mail, Phone, Clock, Calendar } from 'lucide-react';

interface ActivityDetailPanelProps {
  activity: Activity | null;
  onClose?: () => void;
}

// Funzione helper per visuali coerenti e standardizzate
const getCategoryVisuals = (category: string) => {
  const map: Record<string, { bg: string, emoji: string }> = {
    'palestra': { bg: 'from-blue-500 to-cyan-400', emoji: '🏋️‍♂️' },
    'piscina': { bg: 'from-cyan-500 to-blue-600', emoji: '🏊‍♀️' },
    'tennis': { bg: 'from-green-500 to-emerald-400', emoji: '🎾' },
    'yoga': { bg: 'from-purple-500 to-pink-400', emoji: '🧘‍♀️' },
    'calcio': { bg: 'from-green-600 to-lime-500', emoji: '⚽' },
    'arti_marziali': { bg: 'from-red-500 to-orange-400', emoji: '🥋' },
    'default': { bg: 'from-slate-600 to-slate-400', emoji: '🎯' }
  };
  return map[category.toLowerCase()] || map['default'];
};

export default function ActivityDetailPanel({ activity, onClose }: ActivityDetailPanelProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // Piccolo delay per innescare la transizione CSS in modo affidabile
    const timer = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(timer);
  }, []);

  if (!activity) return null;

  const badgeKey = activity.disciplina || activity.category;
  const visuals = getCategoryVisuals(badgeKey);
  const daysString = activity.days.map(d => DAY_LABELS.find(l => l.value === d)?.label).join(', ');

  const handleDirections = () => {
    let destination = `${activity.lat},${activity.lng}`;
    // Se l'indirizzo sembra esatto (es. via e comune), usiamo quello per avere il civico preciso su Maps
    if (activity.address && activity.address !== "Indirizzo non disponibile" && activity.address.includes(',')) {
      destination = encodeURIComponent(activity.address);
    }
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank');
  };

  const handleContact = () => {
    if (!activity.contact || activity.contact === 'Nessun contatto disponibile') {
      alert("Purtroppo non abbiamo recapiti per questa struttura. Cerca il nome su Google!");
      return;
    }
    
    if (activity.contact.startsWith('http') || activity.contact.startsWith('www')) {
      const url = activity.contact.startsWith('www') ? `https://${activity.contact}` : activity.contact;
      window.open(url, '_blank');
    } else if (activity.contact.includes('@')) {
      window.location.href = `mailto:${activity.contact}?subject=Richiesta informazioni: ${activity.name}`;
    } else {
      window.location.href = `tel:${activity.contact.replace(/\s+/g, '')}`;
    }
  };

  let contactIcon = <Phone size={18} />;
  let contactText = "Contatta la struttura";
  if (activity.contact?.includes('@')) {
    contactIcon = <Mail size={18} />;
    contactText = "Invia Email";
  } else if (activity.contact?.startsWith('http') || activity.contact?.startsWith('www')) {
    contactIcon = <Navigation size={18} />;
    contactText = "Visita il Sito Web";
  } else if (activity.contact && activity.contact !== 'Nessun contatto disponibile') {
    contactIcon = <Phone size={18} />;
    contactText = "Chiama Ora";
  }

  const handleShare = async () => {
    const shareText = `Vieni a fare ${activity.name} da ${activity.locationName}!\nOrario: ${activity.startHour}:00 - ${activity.endHour}:00\n`;
    const shareUrl = `${window.location.origin}/attivita/${activity.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: activity.name,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.warn("Share interrotto", err);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert("Testo copiato negli appunti!");
    }
  };

  const handleCalendar = () => {
    alert("Funzionalità 'Aggiungi a Calendario' (.ics) in arrivo presto!");
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        style={{ zIndex: 2000 }}
        onClick={onClose}
      />

      <div 
        className={`fixed bg-white shadow-2xl flex flex-col overflow-hidden bottom-0 left-0 right-0 w-full h-[85vh] rounded-t-3xl sm:bottom-auto sm:top-0 sm:left-auto sm:right-0 sm:h-full sm:w-full sm:max-w-[450px] sm:rounded-none transition-transform duration-500 ease-[cubic-bezier(0.2,0,0,1)] ${mounted ? 'translate-y-0 sm:translate-x-0' : 'translate-y-full sm:translate-y-0 sm:translate-x-full'}`}
        style={{ zIndex: 2010 }}
      >
        
        {/* Drag handle per Bottom Sheet su mobile */}
        <div className="w-full flex justify-center pt-3 pb-1 sm:hidden absolute top-0 pointer-events-none" style={{ zIndex: 2030 }}>
          <div className="w-12 h-1.5 bg-white/40 backdrop-blur-md rounded-full" />
        </div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/80 backdrop-blur hover:bg-white p-2 rounded-full shadow-lg text-slate-800 transition-all border border-slate-100"
          style={{ zIndex: 2020 }}
        >
          <X size={20} />
        </button>

        {/* Header con Gradiente + Emoji Standardizzata */}
        <div className={`relative h-56 w-full shrink-0 bg-gradient-to-br ${visuals.bg} flex items-center justify-center overflow-hidden`}>
          <div className="absolute inset-0 bg-black/10" />
          
          {/* Cerchio di sfondo astratto per dare tridimensionalità */}
          <div className="absolute w-64 h-64 bg-white/10 rounded-full blur-2xl top-[-20%] right-[-10%]" />
          
          <span className="text-8xl drop-shadow-2xl z-10 relative transform hover:scale-110 transition-transform duration-500 ease-out mb-8">
            {visuals.emoji}
          </span>
          
          <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10 text-white">
            <span className="inline-block px-2.5 py-1 bg-white/20 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-widest rounded-md mb-2 border border-white/20 shadow-sm">
              {getCategoryLabel(badgeKey)}
            </span>
            <h2 className="text-2xl font-bold leading-tight drop-shadow-md">{activity.name}</h2>
            <div className="flex flex-col gap-1 mt-2 opacity-90 drop-shadow-sm">
              <div className="flex items-center gap-1.5 text-sm font-semibold">
                <MapPin size={14} className="shrink-0" />
                <span className="truncate">{activity.locationName}</span>
              </div>
              {activity.address && activity.address !== "Indirizzo non disponibile" && (
                <div className="flex items-center gap-1.5 pl-5 text-xs font-medium opacity-80">
                  <span className="truncate">{activity.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contenuto Scrollabile */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* Griglia Informazioni Principali */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <Calendar className="text-blue-600 mb-1" size={18} />
              <p className="text-xs text-slate-500 font-medium">Giorni</p>
              <p className="text-sm font-semibold text-slate-800">{daysString}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <Clock className="text-blue-600 mb-1" size={18} />
              <p className="text-xs text-slate-500 font-medium">Orario</p>
              <p className="text-sm font-semibold text-slate-800">{activity.startHour}:00 - {activity.endHour}:00</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-blue-600 font-bold mb-1 block text-lg leading-none">🎖️</span>
              <p className="text-xs text-slate-500 font-medium">Livello</p>
              <p className="text-sm font-semibold text-slate-800">{LEVEL_LABELS[activity.level] || 'Tutti i livelli'}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-blue-600 font-bold mb-1 block text-lg leading-none">🎯</span>
              <p className="text-xs text-slate-500 font-medium">Target</p>
              <p className="text-sm font-semibold text-slate-800">{TARGET_LABELS[activity.target]}</p>
            </div>
          </div>

          {/* Descrizione */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Informazioni sul corso</h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              {activity.description}
            </p>
          </div>

          {/* Organizer & Contatti */}
          <div className="bg-blue-50/50 rounded-2xl p-5 mb-8 border border-blue-100">
            <h3 className="text-sm font-bold text-blue-900 mb-4 uppercase tracking-wider">Gestito da</h3>
            <p className="font-semibold text-slate-900 mb-3">{activity.organizer}</p>
            
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-sm text-slate-700">
                <div className="bg-white p-1.5 rounded-full shadow-sm text-blue-600">
                  {activity.contact?.includes('@') ? <Mail size={14} /> : 
                   (activity.contact?.startsWith('http') || activity.contact?.startsWith('www')) ? <Navigation size={14} /> : 
                   <Phone size={14} />}
                </div>
                <a 
                  href={activity.contact?.includes('@') ? `mailto:${activity.contact}` : 
                        activity.contact?.startsWith('http') ? activity.contact :
                        activity.contact?.startsWith('www') ? `https://${activity.contact}` :
                        `tel:${activity.contact?.replace(/\s+/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 hover:underline transition-colors truncate"
                >
                  {activity.contact}
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Appiccicato in Basso con Azioni Rapide */}
        <div className="bg-white border-t border-slate-100 p-4 shadow-[0_-10px_20px_-15px_rgba(0,0,0,0.1)]">
          <div className="flex items-center justify-between mb-4 px-2">
            <div>
              <p className="text-xs text-slate-500 font-medium">Prezzo</p>
              {!activity.price || activity.price === 'N/A' || activity.price.toLowerCase().includes('verificare') ? (
                <p className="text-lg font-bold text-amber-600 flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                  Da verificare
                </p>
              ) : (
                <p className="text-xl font-extrabold text-slate-900">{activity.price}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <button 
              onClick={handleDirections}
              className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all shadow-md shadow-blue-200"
            >
              <Navigation size={18} />
              Andiamo!
            </button>
            <button 
              onClick={handleCalendar}
              className="col-span-1 bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center py-3 rounded-xl font-bold transition-all"
              title="Aggiungi al Calendario"
            >
              <CalendarPlus size={20} />
            </button>
            <button 
              onClick={handleShare}
              className="col-span-1 bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center py-3 rounded-xl font-bold transition-all"
              title="Condividi"
            >
              <Share2 size={20} />
            </button>
          </div>
          <button 
            onClick={handleContact}
            className={`w-full mt-2 border-2 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
              (!activity.price || activity.price === 'N/A' || activity.price.toLowerCase().includes('verificare'))
                ? 'bg-amber-50 border-amber-200 hover:bg-amber-100 text-amber-800 shadow-sm'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
            }`}
          >
            {contactIcon}
            {contactText}
          </button>
        </div>

      </div>
    </>
  );
}
