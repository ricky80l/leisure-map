import { 
  Activity, 
  getCategoryLabel, 
  LEVEL_LABELS
} from '../data/mockActivities';

interface ActivityCardProps {
  activity: Activity;
  isSelected: boolean;
  onClick: () => void;
}

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

export default function ActivityCard({ activity, isSelected, onClick }: ActivityCardProps) {
  const visuals = getCategoryVisuals(activity.category);

  return (
    <div 
      className={`activity-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
      style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '16px', padding: '14px 16px' }}
    >
      {/* Icona Quadrata Stondata con Gradiente */}
      <div className={`w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center bg-gradient-to-br ${visuals.bg} text-2xl shadow-sm border border-white/20`}>
        <span style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>{visuals.emoji}</span>
      </div>
      
      {/* Testi Centrali */}
      <div className="flex-1 min-w-0">
        <h3 className="text-[15px] font-bold text-slate-900 truncate leading-tight">{activity.name}</h3>
        <p className="text-[13px] text-slate-500 truncate mt-0.5 font-medium">{activity.locationName}</p>
        
        <div className="flex gap-2 mt-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
            {getCategoryLabel(activity.category)}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
            {LEVEL_LABELS[activity.level]}
          </span>
        </div>
      </div>
      
      {/* Orario e Prezzo a Destra */}
      <div className="text-right shrink-0 flex flex-col justify-center items-end h-full">
        <span className="text-xs font-bold text-slate-400 mb-1">
          {activity.startHour}:00
        </span>
        <span className="text-sm font-extrabold text-slate-800">
          {activity.price.toLowerCase() === 'gratis' ? 'Gratis' : '€€'}
        </span>
      </div>
    </div>
  );
}

