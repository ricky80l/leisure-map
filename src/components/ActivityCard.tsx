import { useRef, useEffect } from 'react';
import { Activity, getCategoryLabel, LEVEL_LABELS } from '../data/mockActivities';

interface ActivityCardProps {
  activity: Activity;
  isSelected?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
}

const getSvgForCategory = (category: string, activityId: string) => {
  const cat = category.toLowerCase();
  
  if (cat === 'acqua' || cat === 'piscina') {
    return (
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustrazione acqua">
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
  if (cat === 'outdoor' || cat === 'tennis' || cat === 'calcio') {
    return (
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustrazione outdoor">
        <defs><linearGradient id={`g2-${activityId}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFE3B0"/><stop offset="1" stopColor="#F2A93B"/></linearGradient></defs>
        <rect width="400" height="300" fill={`url(#g2-${activityId})`}/>
        <circle cx="330" cy="60" r="30" fill="#FBFAF7" opacity=".9"/>
        <path d="M0 200 Q120 120 250 190 T420 170 V300 H0 Z" fill="#5B8C3E"/>
        <path d="M0 240 Q150 180 300 240 T420 225 V300 H0 Z" fill="#3E6B2A"/>
        <path d="M40 300 Q180 230 380 275" stroke="#D9C9A3" strokeWidth="16" fill="none" strokeLinecap="round"/>
        <circle cx="200" cy="243" r="13" fill="none" stroke="#1A2233" strokeWidth="4"/>
        <circle cx="238" cy="240" r="13" fill="none" stroke="#1A2233" strokeWidth="4"/>
        <path d="M200 243 L219 218 L238 240 M219 218 L212 205" stroke="#1A2233" strokeWidth="4" fill="none" strokeLinecap="round"/>
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
  
  // Natura, fitness, corsi e default
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustrazione natura">
      <defs><linearGradient id={`g4-${activityId}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6E8B85"/><stop offset="1" stopColor="#33504B"/></linearGradient></defs>
      <rect width="400" height="300" fill={`url(#g4-${activityId})`}/>
      <path d="M0 0 H400 V70 Q300 130 210 90 Q120 55 0 110 Z" fill="#22362F"/>
      <path d="M0 300 V210 Q130 250 240 215 Q330 190 400 235 V300 Z" fill="#1B2B26"/>
      <rect x="182" y="78" width="34" height="150" fill="#BFE3E0" opacity=".85" rx="8"/>
      <ellipse cx="199" cy="238" rx="70" ry="18" fill="#8FD0E8" opacity=".6"/>
      <path d="M120 250 q18 -7 36 0 M250 258 q18 -7 36 0" stroke="#BFE3E0" strokeWidth="4" fill="none" strokeLinecap="round" opacity=".7"/>
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
    if (['acqua', 'piscina'].includes(cat)) return 'b-acqua';
    if (['outdoor', 'tennis', 'calcio'].includes(cat)) return 'b-outdoor';
    if (['gusto'].includes(cat)) return 'b-gusto';
    if (['fitness', 'palestra'].includes(cat)) return 'b-fitness';
    if (['corsi', 'arti_marziali', 'yoga'].includes(cat)) return 'b-corsi';
    return 'b-natura';
  };

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
        <span className={`badge ${getBadgeClass(activity.category)}`}>
          {getCategoryLabel(activity.category).toUpperCase()}
        </span>
        <div className="save" aria-label="Salva" onClick={(e) => { e.stopPropagation(); e.currentTarget.classList.toggle('saved'); }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1A2233" strokeWidth="2">
            <path d="M19 14c1.5-1.5 2-3.2 2-5a5 5 0 0 0-9-3 5 5 0 0 0-9 3c0 1.8.5 3.5 2 5l7 7z"/>
          </svg>
        </div>
        {getSvgForCategory(activity.category, activity.id)}
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
