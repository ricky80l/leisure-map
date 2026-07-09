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

// Gradient backgrounds as inline styles (Tailwind v4 arbitrary bg may not compile)
const GRADIENT_MAP: Record<string, string> = {
  'from-blue-500 to-cyan-400': 'linear-gradient(to bottom right, #3b82f6, #22d3ee)',
  'from-cyan-500 to-blue-600': 'linear-gradient(to bottom right, #06b6d4, #2563eb)',
  'from-green-500 to-emerald-400': 'linear-gradient(to bottom right, #22c55e, #34d399)',
  'from-purple-500 to-pink-400': 'linear-gradient(to bottom right, #a855f7, #f472b6)',
  'from-green-600 to-lime-500': 'linear-gradient(to bottom right, #16a34a, #84cc16)',
  'from-red-500 to-orange-400': 'linear-gradient(to bottom right, #ef4444, #fb923c)',
  'from-slate-600 to-slate-400': 'linear-gradient(to bottom right, #475569, #94a3b8)',
};

export default function ActivityDetailPanel({ activity, onClose }: ActivityDetailPanelProps) {
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  
  useEffect(() => {
    // Detect desktop vs mobile
    const mq = window.matchMedia('(min-width: 640px)');
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    
    // Trigger mount animation after a frame
    const timer = requestAnimationFrame(() => {
      setTimeout(() => setMounted(true), 20);
    });
    
    return () => {
      cancelAnimationFrame(timer);
      mq.removeEventListener('change', handler);
    };
  }, []);

  if (!activity) return null;

  const badgeKey = activity.disciplina || activity.category;
  const visuals = getCategoryVisuals(badgeKey);
  const gradientBg = GRADIENT_MAP[visuals.bg] || GRADIENT_MAP['from-slate-600 to-slate-400'];
  const daysString = activity.days.map(d => DAY_LABELS.find(l => l.value === d)?.label).join(', ');

  const handleDirections = () => {
    let destination = `${activity.lat},${activity.lng}`;
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
        await navigator.share({ title: activity.name, text: shareText, url: shareUrl });
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

  // ── Inline styles for critical layout (bypasses Tailwind v4 arbitrary value issues) ──

  const backdropStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 2000,
    background: 'rgba(15, 23, 42, 0.4)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    transition: 'opacity 0.3s ease',
    opacity: mounted ? 1 : 0,
  };

  const panelStyle: React.CSSProperties = isDesktop ? {
    position: 'fixed', top: 0, right: 0, bottom: 0,
    width: '100%', maxWidth: 450, height: '100%',
    zIndex: 2010, background: '#fff',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
    transition: 'transform 0.4s cubic-bezier(0.2, 0, 0, 1)',
    transform: mounted ? 'translateX(0)' : 'translateX(100%)',
  } : {
    position: 'fixed', bottom: 0, left: 0, right: 0,
    width: '100%', height: '85vh',
    zIndex: 2010, background: '#fff',
    borderRadius: '24px 24px 0 0',
    boxShadow: '0 -10px 40px -10px rgba(0,0,0,0.2)',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
    transition: 'transform 0.4s cubic-bezier(0.2, 0, 0, 1)',
    transform: mounted ? 'translateY(0)' : 'translateY(100%)',
  };

  const closeButtonStyle: React.CSSProperties = {
    position: 'absolute', top: 16, right: 16, zIndex: 2020,
    background: 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(241,245,249,0.8)',
    borderRadius: '50%', padding: 8, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#1e293b',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    transition: 'background 0.2s, transform 0.15s',
  };

  return (
    <>
      <div style={backdropStyle} onClick={onClose} />

      <div style={panelStyle}>
        {/* Drag handle mobile */}
        {!isDesktop && (
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4, position: 'absolute', top: 0, zIndex: 2030, pointerEvents: 'none' }}>
            <div style={{ width: 48, height: 6, background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(8px)', borderRadius: 999 }} />
          </div>
        )}

        <button
          onClick={onClose}
          style={closeButtonStyle}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.85)'; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <X size={20} />
        </button>

        {/* Header con Gradiente + Emoji */}
        <div style={{ position: 'relative', height: 224, width: '100%', flexShrink: 0, background: gradientBg, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.1)' }} />
          <div style={{ position: 'absolute', width: 256, height: 256, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(40px)', top: '-20%', right: '-10%' }} />
          
          <span style={{ fontSize: '5rem', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))', zIndex: 10, position: 'relative', marginBottom: 32 }}>
            {visuals.emoji}
          </span>
          
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.4) 60%, transparent)', zIndex: 10, color: '#fff' }}>
            <span style={{ display: 'inline-block', padding: '4px 10px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', borderRadius: 6, marginBottom: 8, border: '1px solid rgba(255,255,255,0.2)' }}>
              {getCategoryLabel(badgeKey)}
            </span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.2, textShadow: '0 1px 4px rgba(0,0,0,0.3)', margin: 0 }}>
              {activity.name}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8, opacity: 0.9 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', fontWeight: 600 }}>
                <MapPin size={14} style={{ flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activity.locationName}</span>
              </div>
              {activity.address && activity.address !== "Indirizzo non disponibile" && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 20, fontSize: '0.75rem', fontWeight: 500, opacity: 0.8 }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activity.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contenuto Scrollabile */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 12, border: '1px solid #f1f5f9' }}>
              <Calendar style={{ color: '#2563eb', marginBottom: 4 }} size={18} />
              <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, margin: 0 }}>Giorni</p>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>{daysString}</p>
            </div>
            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 12, border: '1px solid #f1f5f9' }}>
              <Clock style={{ color: '#2563eb', marginBottom: 4 }} size={18} />
              <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, margin: 0 }}>Orario</p>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>{activity.startHour}:00 - {activity.endHour}:00</p>
            </div>
            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 12, border: '1px solid #f1f5f9' }}>
              <span style={{ color: '#2563eb', fontWeight: 700, marginBottom: 4, display: 'block', fontSize: '1.125rem', lineHeight: 1 }}>🎖️</span>
              <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, margin: 0 }}>Livello</p>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>{LEVEL_LABELS[activity.level] || 'Tutti i livelli'}</p>
            </div>
            <div style={{ background: '#f8fafc', padding: 12, borderRadius: 12, border: '1px solid #f1f5f9' }}>
              <span style={{ color: '#2563eb', fontWeight: 700, marginBottom: 4, display: 'block', fontSize: '1.125rem', lineHeight: 1 }}>🎯</span>
              <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, margin: 0 }}>Target</p>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b', margin: 0 }}>{TARGET_LABELS[activity.target]}</p>
            </div>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>Informazioni sul corso</h3>
            <p style={{ color: '#475569', lineHeight: 1.7, fontSize: '0.875rem', margin: 0 }}>{activity.description}</p>
          </div>

          <div style={{ background: 'rgba(239, 246, 255, 0.5)', borderRadius: 16, padding: 20, marginBottom: 32, border: '1px solid #dbeafe' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e3a5f', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gestito da</h3>
            <p style={{ fontWeight: 600, color: '#0f172a', marginBottom: 12 }}>{activity.organizer}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.875rem', color: '#334155' }}>
                <div style={{ background: '#fff', padding: 6, borderRadius: '50%', boxShadow: '0 1px 2px rgba(0,0,0,0.06)', color: '#2563eb' }}>
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
                  style={{ color: 'inherit', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {activity.contact}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Azioni Rapide */}
        <div style={{ background: '#fff', borderTop: '1px solid #f1f5f9', padding: 16, boxShadow: '0 -10px 20px -15px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, padding: '0 8px' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, margin: 0 }}>Prezzo</p>
              {!activity.price || activity.price === 'N/A' || activity.price.toLowerCase().includes('verificare') ? (
                <p style={{ fontSize: '1.125rem', fontWeight: 700, color: '#d97706', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                  Da verificare
                </p>
              ) : (
                <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{activity.price}</p>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8 }}>
            <button 
              onClick={handleDirections}
              style={{ background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 0', borderRadius: 12, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.3)', transition: 'background 0.2s', fontSize: '0.875rem' }}
            >
              <Navigation size={18} />
              Andiamo!
            </button>
            <button 
              onClick={handleCalendar}
              style={{ background: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 0', borderRadius: 12, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}
              title="Aggiungi al Calendario"
            >
              <CalendarPlus size={20} />
            </button>
            <button 
              onClick={handleShare}
              style={{ background: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 0', borderRadius: 12, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}
              title="Condividi"
            >
              <Share2 size={20} />
            </button>
          </div>
          <button 
            onClick={handleContact}
            style={{ 
              width: '100%', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 0', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', transition: 'background 0.2s',
              ...(!activity.price || activity.price === 'N/A' || activity.price.toLowerCase().includes('verificare')
                ? { background: '#fffbeb', border: '2px solid #fde68a', color: '#92400e' }
                : { background: '#fff', border: '2px solid #e2e8f0', color: '#1e293b' }
              ),
            }}
          >
            {contactIcon}
            {contactText}
          </button>
        </div>
      </div>
    </>
  );
}
