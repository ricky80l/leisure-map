import { useRef, useEffect } from 'react';
import { Activity, getCategoryLabel, LEVEL_LABELS } from '../data/mockActivities';

interface ActivityCardProps {
  activity: Activity;
  isSelected?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
}

const getSvgForCategory = (activity: Activity) => {
  const cat = (activity.disciplina || activity.category).toLowerCase();
  const activityId = activity.id;
  
  if (cat === 'acqua' || cat === 'piscina' || cat === 'nuoto') {
    return (
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustrazione nuoto">
        <defs><linearGradient id={`g1-${activityId}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8FD0E8"/><stop offset="1" stopColor="#2673A6"/></linearGradient></defs>
        <rect width="400" height="300" fill={`url(#g1-${activityId})`}/>
        <path d="M0 190 Q100 160 200 195 T400 185 V300 H0 Z" fill="#1E5D87" opacity=".8"/>
        <path d="M0 220 Q120 195 230 225 T400 215 V300 H0 Z" fill="#174A6D" opacity=".8"/>
        <path d="M-20 120 L90 40 L180 130 Z" fill="#0E7C66" opacity=".55"/>
        <path d="M140 130 L260 25 L390 135 Z" fill="#0A5F4E" opacity=".6"/>
        <ellipse cx="200" cy="212" rx="55" ry="14" fill="#F2A93B"/>
        <circle cx="180" cy="198" r="8" fill="#FBFAF7"/><circle cx="205" cy="196" r="8" fill="#FBFAF7"/><circle cx="228" cy="199" r="8" fill="#FBFAF7"/>
        <path d="M60 245 q20 -8 40 0 M300 255 q20 -8 40 0 M120 270 q20 -8 40 0" stroke="#8FD0E8" strokeWidth="4" fill="none" strokeLinecap="round" opacity=".7"/>
      </svg>
    );
  }
  
  if (cat === 'gusto') {
    return (
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustrazione gusto">
        <defs><linearGradient id={`g3-${activityId}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#CFE8D8"/><stop offset="1" stopColor="#8FBF9A"/></linearGradient></defs>
        <rect width="400" height="300" fill={`url(#g3-${activityId})`}/>
        <path d="M0 170 Q110 90 230 165 T420 150 V300 H0 Z" fill="#5B8C3E"/>
        <path d="M0 230 Q140 160 290 235 T420 220 V300 H0 Z" fill="#3E6B2A"/>
        <g stroke="#2A4D1D" strokeWidth="5" opacity=".65">
          <path d="M30 210 Q120 155 220 205" fill="none"/><path d="M45 235 Q140 180 250 232" fill="none"/>
          <path d="M60 262 Q160 205 285 258" fill="none"/><path d="M85 288 Q185 232 320 285" fill="none"/>
        </g>
        <rect x="300" y="115" width="46" height="34" fill="#D9C9A3"/><path d="M296 115 L323 96 L350 115 Z" fill="#A6572E"/>
      </svg>
    );
  }

  const OutdoorBg = () => (
    <>
      <defs><linearGradient id={`g2-${activityId}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFE3B0"/><stop offset="1" stopColor="#F2A93B"/></linearGradient></defs>
      <rect width="400" height="300" fill={`url(#g2-${activityId})`}/>
      <circle cx="330" cy="60" r="30" fill="#FBFAF7" opacity=".9"/>
      <path d="M0 200 Q120 120 250 190 T420 170 V300 H0 Z" fill="#5B8C3E"/>
      <path d="M0 240 Q150 180 300 240 T420 225 V300 H0 Z" fill="#3E6B2A"/>
      <path d="M40 300 Q180 230 380 275" stroke="#D9C9A3" strokeWidth="16" fill="none" strokeLinecap="round"/>
    </>
  );

  const DefaultBg = () => (
    <>
      <defs><linearGradient id={`g4-${activityId}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6E8B85"/><stop offset="1" stopColor="#33504B"/></linearGradient></defs>
      <rect width="400" height="300" fill={`url(#g4-${activityId})`}/>
      <path d="M0 0 H400 V70 Q300 130 210 90 Q120 55 0 110 Z" fill="#22362F"/>
      <path d="M0 300 V210 Q130 250 240 215 Q330 190 400 235 V300 Z" fill="#1B2B26"/>
      <rect x="182" y="78" width="34" height="150" fill="#BFE3E0" opacity=".85" rx="8"/>
      <ellipse cx="199" cy="238" rx="70" ry="18" fill="#8FD0E8" opacity=".6"/>
      <path d="M120 250 q18 -7 36 0 M250 258 q18 -7 36 0" stroke="#BFE3E0" strokeWidth="4" fill="none" strokeLinecap="round" opacity=".7"/>
    </>
  );

  if (cat === 'ciclismo' || cat === 'mtb') {
    return (
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustrazione ciclismo">
        <OutdoorBg />
        <circle cx="200" cy="243" r="13" fill="none" stroke="#1A2233" strokeWidth="4"/>
        <circle cx="238" cy="240" r="13" fill="none" stroke="#1A2233" strokeWidth="4"/>
        <path d="M200 243 L219 218 L238 240 M219 218 L212 205" stroke="#1A2233" strokeWidth="4" fill="none" strokeLinecap="round"/>
      </svg>
    );
  }

  if (cat === 'tennis' || cat === 'padel') {
    return (
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustrazione tennis/padel">
        <OutdoorBg />
        {/* Tennis Racket */}
        <ellipse cx="230" cy="220" rx="15" ry="20" fill="none" stroke="#1A2233" strokeWidth="4" transform="rotate(45 230 220)"/>
        <path d="M219 231 L200 250" stroke="#1A2233" strokeWidth="6" strokeLinecap="round"/>
        <circle cx="180" cy="210" r="6" fill="#1A2233" />
      </svg>
    );
  }

  if (cat === 'basket') {
    return (
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustrazione basket">
        <OutdoorBg />
        <circle cx="220" cy="235" r="18" fill="#F2A93B" stroke="#1A2233" strokeWidth="3"/>
        <path d="M202 235 H238 M220 217 V253 M212 219 Q232 235 212 251 M228 219 Q208 235 228 251" stroke="#1A2233" strokeWidth="2" fill="none"/>
      </svg>
    );
  }

  if (cat === 'arrampicata' || cat === 'outdoor') {
    return (
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustrazione outdoor/arrampicata">
        <OutdoorBg />
        {/* Simple Pine Trees */}
        <path d="M180 250 L190 220 L200 250 Z" fill="#1A2233" opacity="0.8"/>
        <path d="M220 260 L235 210 L250 260 Z" fill="#1A2233" opacity="0.8"/>
        <rect x="188" y="250" width="4" height="10" fill="#1A2233"/>
        <rect x="233" y="260" width="4" height="12" fill="#1A2233"/>
      </svg>
    );
  }

  if (cat === 'sala pesi' || cat === 'pesi' || cat === 'fitness' || cat === 'body building') {
    return (
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustrazione pesi">
        <DefaultBg />
        {/* Dumbbell */}
        <path d="M190 238 H210" stroke="#1A2233" strokeWidth="6" strokeLinecap="round"/>
        <rect x="180" y="228" width="10" height="20" fill="#1A2233" rx="2"/>
        <rect x="210" y="228" width="10" height="20" fill="#1A2233" rx="2"/>
      </svg>
    );
  }

  if (cat === 'arti marziali' || cat === 'karate' || cat === 'judo') {
    return (
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustrazione arti marziali">
        <DefaultBg />
        <circle cx="200" cy="238" r="16" fill="#FBFAF7" stroke="#1A2233" strokeWidth="3"/>
        <path d="M200 222 A8 8 0 0 1 200 254 A8 8 0 0 0 200 222" fill="#1A2233"/>
        <circle cx="200" cy="230" r="3" fill="#1A2233"/>
        <circle cx="200" cy="246" r="3" fill="#FBFAF7"/>
      </svg>
    );
  }

  if (cat === 'danza' || cat === 'ballo') {
    return (
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustrazione danza">
        <DefaultBg />
        {/* Music Notes */}
        <path d="M195 245 V225 Q195 220 205 220 V230 Q200 230 198 235 V245 Z" fill="#1A2233"/>
        <circle cx="192" cy="245" r="4" fill="#1A2233"/>
        <path d="M215 235 V215 Q215 210 225 210 V220 Q220 220 218 225 V235 Z" fill="#1A2233"/>
        <circle cx="212" cy="235" r="4" fill="#1A2233"/>
      </svg>
    );
  }

  if (cat === 'yoga' || cat === 'pilates' || cat === 'stretching') {
    return (
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustrazione yoga">
        <DefaultBg />
        {/* Lotus / Person sitting */}
        <circle cx="200" cy="225" r="5" fill="#1A2233"/>
        <path d="M190 245 Q200 235 210 245 M195 235 Q200 245 205 235 M200 233 V245" stroke="#1A2233" strokeWidth="3" fill="none" strokeLinecap="round"/>
      </svg>
    );
  }

  // Fallback generico 
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustrazione generica">
      <DefaultBg />
    </svg>
  );
};

export default function ActivityCard({ activity, isSelected, onMouseEnter, onMouseLeave, onClick }: ActivityCardProps) {
  
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isSelected && buttonRef.current) {
      buttonRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isSelected]);

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
    <button 
      ref={buttonRef}
      id={`card-${activity.id}`}
      className={`card ${isSelected ? 'selected' : ''}`} 
      tabIndex={0}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onMouseEnter}
      onBlur={onMouseLeave}
      onClick={onClick}
      style={{ outline: isSelected ? '2px solid var(--primary)' : undefined, outlineOffset: '2px' }}
    >
      <div className="thumb">
        <span className={`badge ${getBadgeClass(badgeKey)}`}>
          {getCategoryLabel(badgeKey).toUpperCase()}
        </span>
        <div className="save" aria-label="Salva" onClick={(e) => { e.stopPropagation(); e.currentTarget.classList.toggle('saved'); }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1A2233" strokeWidth="2">
            <path d="M19 14c1.5-1.5 2-3.2 2-5a5 5 0 0 0-9-3 5 5 0 0 0-9 3c0 1.8.5 3.5 2 5l7 7z"/>
          </svg>
        </div>
        {getSvgForCategory(activity)}
        <div className="tname">{activity.name}</div>
      </div>
      <div className="cbody">
        <div className="meta">
          {activity.locationName && <span><b>{activity.locationName}</b></span>}
          <span><b>{activity.price.toLowerCase() === 'gratis' ? 'Gratis' : '€€'}</b></span>
          <span>{LEVEL_LABELS[activity.level] || 'Tutti i livelli'}</span>

        </div>
        <div className="verified">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M20 6 9 17l-5-5"/>
          </svg>
          Verificato · {activity.organizer || 'Leisure Map Partner'}
        </div>
      </div>
    </button>
  );
}
