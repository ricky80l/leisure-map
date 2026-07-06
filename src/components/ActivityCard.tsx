import { useRef, useEffect } from 'react';
import { Activity, getCategoryLabel, LEVEL_LABELS, getDistanceKm } from '../data/mockActivities';

interface ActivityCardProps {
  activity: Activity;
  isFlipped?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onCardClick?: () => void;
  onDetailsClick?: (e: React.MouseEvent) => void;
  userCoords?: { lat: number; lng: number } | null;
  locationSource?: 'gps' | 'search' | 'fallback';
  index?: number;
  isCompactView?: boolean;
}

const getHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const getSvgForCategory = (activity: Activity, index: number = 0) => {
  const cat = (activity.disciplina || activity.category).toLowerCase();
  
  // FIX: Usa l'indice progressivo invece dell'hash per evitare sfondi identici adiacenti
  const bgVariant = index % 3;

  const getOutdoorBg = () => {
    if (bgVariant === 0) {
      // Alba ambra
      return (
        <>
          <rect width="400" height="300" fill="#FBFAF7"/>
          <circle cx="200" cy="130" r="50" fill="#F2A93B" opacity="0.6"/>
          <path d="M0 200 Q120 140 250 190 T420 170 V300 H0 Z" fill="#F2A93B" opacity="0.4"/>
          <path d="M0 240 Q150 190 300 240 T420 225 V300 H0 Z" fill="#0E7C66" opacity="0.7"/>
        </>
      );
    } else if (bgVariant === 1) {
      // Giorno verde chiaro
      return (
        <>
          <rect width="400" height="300" fill="#E4E7E2"/>
          <circle cx="330" cy="60" r="35" fill="#FBFAF7" opacity="0.9"/>
          <path d="M0 200 Q120 140 250 190 T420 170 V300 H0 Z" fill="#0E7C66" opacity="0.3"/>
          <path d="M0 240 Q150 190 300 240 T420 225 V300 H0 Z" fill="#0A5F4E" opacity="0.7"/>
        </>
      );
    } else {
      // Tramonto
      return (
        <>
          <rect width="400" height="300" fill="#FBFAF7"/>
          <rect width="400" height="300" fill="#F2A93B" opacity="0.25"/>
          <circle cx="100" cy="150" r="60" fill="#B4433A" opacity="0.8"/>
          <path d="M0 200 Q120 140 250 190 T420 170 V300 H0 Z" fill="#5A6472" opacity="0.5"/>
          <path d="M0 240 Q150 190 300 240 T420 225 V300 H0 Z" fill="#1A2233" opacity="0.8"/>
        </>
      );
    }
  };

  const getDefaultBg = () => {
    if (bgVariant === 0) {
      // Indoor base scura
      return (
        <>
          <rect width="400" height="300" fill="#1A2233"/>
          <path d="M0 0 H400 V90 L0 140 Z" fill="#5A6472" opacity="0.3"/>
          <path d="M0 300 V140 L400 90 V300 Z" fill="#1A2233"/>
          <rect x="180" y="50" width="40" height="200" fill="#FBFAF7" opacity="0.05"/>
          <ellipse cx="200" cy="250" rx="80" ry="20" fill="#FBFAF7" opacity="0.05"/>
        </>
      );
    } else if (bgVariant === 1) {
      // Indoor tinta ambra
      return (
        <>
          <rect width="400" height="300" fill="#1A2233"/>
          <path d="M0 0 H400 V90 L0 140 Z" fill="#F2A93B" opacity="0.15"/>
          <path d="M0 300 V140 L400 90 V300 Z" fill="#1A2233"/>
          <rect x="180" y="50" width="40" height="200" fill="#FBFAF7" opacity="0.05"/>
          <ellipse cx="200" cy="250" rx="80" ry="20" fill="#FBFAF7" opacity="0.05"/>
        </>
      );
    } else {
      // Indoor tinta ottanio
      return (
        <>
          <rect width="400" height="300" fill="#1A2233"/>
          <path d="M0 0 H400 V90 L0 140 Z" fill="#0E7C66" opacity="0.25"/>
          <path d="M0 300 V140 L400 90 V300 Z" fill="#1A2233"/>
          <rect x="180" y="50" width="40" height="200" fill="#FBFAF7" opacity="0.05"/>
          <ellipse cx="200" cy="250" rx="80" ry="20" fill="#FBFAF7" opacity="0.05"/>
        </>
      );
    }
  };

  if (cat === 'acqua' || cat === 'piscina' || cat === 'nuoto') {
    return (
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustrazione nuoto">
        <rect width="400" height="300" fill="#FBFAF7"/>
        <circle cx="200" cy="150" r="60" fill="#F2A93B" opacity="0.9"/>
        <path d="M0 190 Q100 160 200 195 T400 185 V300 H0 Z" fill="#0E7C66" opacity="0.7"/>
        <path d="M0 220 Q120 195 230 225 T400 215 V300 H0 Z" fill="#0A5F4E"/>
        <path d="M60 245 q20 -8 40 0 M300 255 q20 -8 40 0 M120 270 q20 -8 40 0" stroke="#FBFAF7" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.5"/>
      </svg>
    );
  }
  
  if (cat === 'gusto') {
    return (
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustrazione gusto">
        <rect width="400" height="300" fill="#FBFAF7"/>
        <path d="M0 170 Q110 90 230 165 T420 150 V300 H0 Z" fill="#F2A93B" opacity="0.4"/>
        <path d="M0 230 Q140 160 290 235 T420 220 V300 H0 Z" fill="#F2A93B" opacity="0.7"/>
        <g stroke="#B4433A" strokeWidth="4" opacity="0.8">
          <path d="M30 210 Q120 155 220 205" fill="none"/><path d="M45 235 Q140 180 250 232" fill="none"/>
          <path d="M60 262 Q160 205 285 258" fill="none"/><path d="M85 288 Q185 232 320 285" fill="none"/>
        </g>
        <rect x="290" y="120" width="50" height="30" fill="#FFFFFF" stroke="#1A2233" strokeWidth="2"/>
        <path d="M285 120 L315 90 L345 120 Z" fill="#B4433A"/>
      </svg>
    );
  }

  if (cat === 'ciclismo' || cat === 'mtb') {
    return (
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustrazione ciclismo">
        {getOutdoorBg()}
        <circle cx="170" cy="240" r="22" fill="#FBFAF7" stroke="#1A2233" strokeWidth="6"/>
        <circle cx="250" cy="240" r="22" fill="#FBFAF7" stroke="#1A2233" strokeWidth="6"/>
        <circle cx="170" cy="240" r="4" fill="#0E7C66"/>
        <circle cx="250" cy="240" r="4" fill="#0E7C66"/>
        <path d="M170 240 L205 200 L250 240 M205 200 L190 180" stroke="#F2A93B" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M180 180 L200 180" stroke="#1A2233" strokeWidth="6" fill="none" strokeLinecap="round"/>
      </svg>
    );
  }

  if (cat === 'tennis' || cat === 'padel') {
    return (
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustrazione tennis/padel">
        {getOutdoorBg()}
        <g transform="rotate(45 230 220)">
           <rect x="226" y="235" width="8" height="35" fill="#1A2233" rx="4"/>
           <ellipse cx="230" cy="210" rx="20" ry="26" fill="#FBFAF7" stroke="#1A2233" strokeWidth="5"/>
           <path d="M220 190 V230 M240 190 V230 M210 205 H250 M210 215 H250" stroke="#0E7C66" strokeWidth="2" opacity="0.6"/>
        </g>
        <circle cx="170" cy="245" r="12" fill="#F2A93B"/>
        <path d="M165 235 Q170 245 165 255 M175 235 Q170 245 175 255" stroke="#FBFAF7" fill="none" strokeWidth="2"/>
      </svg>
    );
  }

  if (cat === 'basket') {
    return (
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustrazione basket">
        {getOutdoorBg()}
        <circle cx="200" cy="220" r="35" fill="#F2A93B"/>
        <path d="M200 185 V255 M165 220 H235 M175 195 Q215 220 175 245 M225 195 Q185 220 225 245" stroke="#1A2233" strokeWidth="3" fill="none"/>
      </svg>
    );
  }

  if (cat === 'arrampicata') {
    return (
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustrazione arrampicata">
        {getOutdoorBg()}
        <path d="M100 300 L200 120 L270 200 L350 300 Z" fill="#5A6472"/>
        <path d="M200 120 L270 200 L230 300 Z" fill="#1A2233" opacity="0.2"/>
        <circle cx="210" cy="170" r="6" fill="#B4433A"/>
        <circle cx="180" cy="210" r="5" fill="#F2A93B"/>
        <circle cx="230" cy="240" r="7" fill="#FBFAF7"/>
        <path d="M210 170 L180 210 L230 240" stroke="#E4E7E2" strokeWidth="2" fill="none" strokeDasharray="6 4"/>
      </svg>
    );
  }

  if (cat === 'outdoor' || cat === 'calcio') {
    return (
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustrazione outdoor">
        {getOutdoorBg()}
        <path d="M170 255 L190 195 L210 255 Z" fill="#0E7C66"/>
        <path d="M190 270 L220 205 L250 270 Z" fill="#0A5F4E"/>
        <rect x="186" y="255" width="8" height="20" fill="#1A2233"/>
        <rect x="216" y="270" width="8" height="15" fill="#1A2233"/>
      </svg>
    );
  }

  if (cat === 'sala pesi' || cat === 'pesi' || cat === 'fitness' || cat === 'body building' || cat === 'palestra' || cat === 'crossfit') {
    return (
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustrazione pesi">
        {getDefaultBg()}
        <rect x="130" y="235" width="140" height="12" fill="#5A6472" rx="4"/>
        <rect x="150" y="210" width="24" height="62" fill="#1A2233" rx="4"/>
        <rect x="226" y="210" width="24" height="62" fill="#1A2233" rx="4"/>
        <rect x="135" y="222" width="15" height="38" fill="#F2A93B" rx="3"/>
        <rect x="250" y="222" width="15" height="38" fill="#F2A93B" rx="3"/>
      </svg>
    );
  }

  if (cat === 'arti marziali' || cat === 'karate' || cat === 'judo') {
    return (
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustrazione arti marziali">
        {getDefaultBg()}
        <path d="M160 270 L200 200 L240 270 Z" fill="#FBFAF7"/>
        <path d="M160 270 L200 230 L240 270" stroke="#E4E7E2" strokeWidth="6" fill="none"/>
        <rect x="175" y="235" width="50" height="10" fill="#1A2233"/>
        <path d="M190 245 L180 275 M210 245 L220 270" stroke="#1A2233" strokeWidth="8" strokeLinecap="round"/>
      </svg>
    );
  }

  if (cat === 'danza' || cat === 'ballo') {
    return (
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustrazione danza">
        {getDefaultBg()}
        <circle cx="170" cy="240" r="12" fill="#F2A93B"/>
        <rect x="176" y="180" width="8" height="60" fill="#F2A93B"/>
        <path d="M176 180 Q200 170 215 195 L205 200 Q195 185 184 195 Z" fill="#F2A93B"/>
        
        <circle cx="230" cy="220" r="12" fill="#0E7C66"/>
        <rect x="236" y="160" width="8" height="60" fill="#0E7C66"/>
        <path d="M236 160 Q260 150 275 175 L265 180 Q255 165 244 175 Z" fill="#0E7C66"/>
      </svg>
    );
  }

  if (cat === 'yoga' || cat === 'pilates' || cat === 'stretching') {
    return (
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustrazione yoga">
        {getDefaultBg()}
        <circle cx="200" cy="195" r="18" fill="#0E7C66"/>
        <path d="M185 225 Q200 210 215 225 L245 250 A12 12 0 0 1 230 270 L200 255 L170 270 A12 12 0 0 1 155 250 Z" fill="#F2A93B"/>
      </svg>
    );
  }

  // Fallback generico 
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustrazione generica">
      {getDefaultBg()}
      <circle cx="200" cy="230" r="20" fill="#E4E7E2" opacity="0.8"/>
      <circle cx="200" cy="230" r="10" fill="#1A2233" opacity="0.5"/>
    </svg>
  );
};

export default function ActivityCard({ activity, isFlipped, onMouseEnter, onMouseLeave, onCardClick, onDetailsClick, userCoords, locationSource = 'fallback', index = 0, isCompactView = false }: ActivityCardProps) {
  
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isFlipped && buttonRef.current) {
      buttonRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isFlipped]);

  const getBadgeClass = (category: string) => {
    const cat = category.toLowerCase();
    if (['acqua', 'piscina', 'nuoto'].includes(cat)) return 'b-acqua';
    if (['outdoor', 'tennis', 'calcio', 'padel', 'ciclismo'].includes(cat)) return 'b-outdoor';
    if (['gusto'].includes(cat)) return 'b-gusto';
    if (['fitness', 'palestra', 'pesi', 'body building', 'crossfit'].includes(cat)) return 'b-fitness';
    if (['corsi', 'arti marziali', 'yoga', 'pilates', 'danza', 'karate'].includes(cat)) return 'b-corsi';
    return 'b-natura';
  };

  const badgeKey = activity.disciplina || activity.category;

  return (
    <div 
      ref={buttonRef}
      id={`card-${activity.id}`}
      className={`card ${isCompactView ? 'compact' : ''} ${isFlipped ? 'selected' : ''}`} 

      tabIndex={0}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onMouseEnter}
      onBlur={onMouseLeave}
      onClick={onCardClick}
    >
      <div className="flipper" style={{ outline: isFlipped ? '2px solid var(--primary)' : undefined, outlineOffset: '2px' }}>
        
        {/* LATO FRONTALE */}
        <div className="front">
      <div className="thumb">
        <span className={`badge ${getBadgeClass(badgeKey)}`}>
          {getCategoryLabel(badgeKey).toUpperCase()}
        </span>
        <div className="save" aria-label="Salva" onClick={(e) => { e.stopPropagation(); e.currentTarget.classList.toggle('saved'); }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1A2233" strokeWidth="2">
            <path d="M19 14c1.5-1.5 2-3.2 2-5a5 5 0 0 0-9-3 5 5 0 0 0-9 3c0 1.8.5 3.5 2 5l7 7z"/>
          </svg>
        </div>
        {getSvgForCategory(activity, index)}
        <div className="tname">{activity.name}</div>
      </div>
      <div className="cbody" data-title={activity.name}>
        <div className="meta">
          {(() => {
            if (!userCoords) return null;
            const distance = getDistanceKm(userCoords.lat, userCoords.lng, activity.lat, activity.lng);
            const labelSuffix = locationSource === 'gps' ? 'da te' : 'dal centro mappa';
            if (distance < 1) {
              const meters = Math.round(distance * 10) * 100;
              return <span><b style={{ fontVariantNumeric: 'tabular-nums' }}>{meters >= 1000 ? '1 km' : `${meters} m`}</b> {labelSuffix}</span>;
            }
            const km = Math.round(distance);
            return <span><b style={{ fontVariantNumeric: 'tabular-nums' }}>{km} km</b> {labelSuffix}</span>;
          })()}
          {activity.locationName && <span><b>{activity.locationName}</b></span>}
          <span><b>{activity.price.toLowerCase() === 'gratis' ? 'Gratis' : '€€'}</b></span>
          <span>{LEVEL_LABELS[activity.level] || 'Tutti i livelli'}</span>
          {(activity as any).duration && <span>{(activity as any).duration} min</span>}
        </div>
        {(() => {
          let dateStr = 'sconosciuta';
          let isExpired = false;
          
          if (activity.verificato_il) {
            let d: Date;
            if (activity.verificato_il.includes('/')) {
              const [day, month, year] = activity.verificato_il.split('/');
              d = new Date(`${year}-${month}-${day}`);
            } else if (activity.verificato_il.includes('-') && activity.verificato_il.split('-')[0].length === 2) {
              const [day, month, year] = activity.verificato_il.split('-');
              d = new Date(`${year}-${month}-${day}`);
            } else {
              d = new Date(activity.verificato_il);
            }
            
            if (!isNaN(d.getTime())) {
              // FIX: Formattazione "mese anno" per il badge Verificato
              dateStr = d.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
              
              const sixMonthsAgo = new Date();
              sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
              if (d < sixMonthsAgo) {
                isExpired = true;
              }
            }
          }
          
          // Assicuriamoci che il nome della struttura non compaia nel footer come richiesto
          let source = activity.fonte_tipo || 'OpenStreetMap';
          if (activity.locationName && source.toLowerCase().includes(activity.locationName.toLowerCase())) {
            source = 'OpenStreetMap';
          }

          if (isExpired) {
            return (
              <div className="verified" style={{ color: 'var(--danger)' }}>
                <span>⏱</span>
                Ultima verifica: {dateStr} — in riverifica
              </div>
            );
          }

          return (
            <div className="verified">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
              Verificato: {dateStr} · {source}
            </div>
          );
        })()}
        </div>
      </div>

      {/* LATO POSTERIORE */}
      <div className="back" style={{ padding: '24px', display: 'flex', flexDirection: 'column', textAlign: 'left', height: '100%' }}>
        
        {/* Decorazione di Sfondo (Watermark SVG della categoria) */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05, pointerEvents: 'none', overflow: 'hidden', transform: 'scale(1.15) translateY(10px)' }}>
          {getSvgForCategory(activity, index)}
        </div>

        <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, color: 'var(--primary)', background: 'var(--surface)', padding: '5px 10px', borderRadius: '6px', border: '1px solid var(--line)' }}>
              {getCategoryLabel(badgeKey)}
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)' }}>
              {activity.price.toLowerCase() === 'gratis' ? 'Gratis' : '€€'}
            </span>
          </div>

          <h3 style={{ fontSize: '1.25rem', fontFamily: "'Fraunces', serif", fontWeight: 700, color: 'var(--ink)', margin: '0 0 18px 0', lineHeight: 1.2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {activity.name}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, justifyItems: 'center' }}>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--line)', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.3, paddingTop: '4px' }}>
                {activity.address || activity.locationName || 'Indirizzo non disponibile'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--line)', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <span style={{ fontSize: '0.85rem', color: 'var(--ink)', lineHeight: 1.3, paddingTop: '5px', fontWeight: 600 }}>
                  {activity.startHour !== undefined ? `${activity.startHour}:00 - ${activity.endHour}:00` : 'Su appunt.'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--line)', flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.2, paddingTop: '3px' }}>
                  {activity.days && activity.days.length > 0 ? activity.days.map(d => ['Do','Lu','Ma','Me','Gi','Ve','Sa'][d]).join(', ') : 'Su rich.'}
                </span>
              </div>
            </div>

          </div>

          <button onClick={(e) => { e.stopPropagation(); onDetailsClick?.(e); }} style={{ marginTop: 'auto', padding: '12px', background: 'var(--primary)', color: '#fff', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(14, 124, 102, 0.25)', border: 'none', cursor: 'pointer', width: '100%' }}>
            Vedi scheda completa
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>

      </div>
    </div>
  );
}
