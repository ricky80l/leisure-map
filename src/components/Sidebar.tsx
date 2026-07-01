import { Search, Navigation, RotateCcw } from 'lucide-react';
import ActivityCard from './ActivityCard';
import { 
  Activity, 
  getCategoryLabel, 
  LEVEL_LABELS, 
  TARGET_LABELS, 
  DAY_LABELS 
} from '../data/mockActivities';

interface SidebarProps {
  sidebarOpen: boolean;
  citySearchQuery: string;
  setCitySearchQuery: (q: string) => void;
  handleCitySearch: (e: React.FormEvent) => void;
  searchLoading: boolean;
  currentCityName: string;
  searchRadius: number;
  setSearchRadius: (r: number) => void;
  gpsError: string | null;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  selectedLevel: string;
  setSelectedLevel: (l: string) => void;
  selectedTarget: string;
  setSelectedTarget: (t: string) => void;
  selectedDays: number[];
  toggleDay: (d: number) => void;
  startHourFilter: number;
  setStartHourFilter: (h: number) => void;
  endHourFilter: number;
  setEndHourFilter: (h: number) => void;
  filteredActivities: Activity[];
  handleResetFilters: () => void;
  selectedActivity: Activity | null;
  handleCardClick: (act: Activity) => void;
  availableCategories: string[];
  allActivities: Activity[];
}

const hoursOptions = Array.from({ length: 17 }, (_, i) => i + 8); // Da 8 a 24

export default function Sidebar({
  sidebarOpen,
  citySearchQuery,
  setCitySearchQuery,
  handleCitySearch,
  searchLoading,
  currentCityName,
  searchRadius,
  setSearchRadius,
  gpsError,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedLevel,
  setSelectedLevel,
  selectedTarget,
  setSelectedTarget,
  selectedDays,
  toggleDay,
  startHourFilter,
  setStartHourFilter,
  endHourFilter,
  setEndHourFilter,
  filteredActivities,
  handleResetFilters,
  selectedActivity,
  handleCardClick,
  availableCategories,
  allActivities
}: SidebarProps) {
  return (
    <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-area">
          <span className="logo-icon">🎈</span>
          <h1 className="logo-text">LeisureMap</h1>
        </div>
        <p className="subtitle">Scopri i migliori corsi e hobby nella tua zona</p>
        <p className="subtitle">by Riccardo Z.</p>
      </div>

      <div className="sidebar-content">
        
        {/* Ricerca Località */}
        <div className="filter-group">
          <label className="filter-label">🌍 Area di ricerca / Città</label>
          <form onSubmit={handleCitySearch} className="location-search-form">
            <div className="search-input-wrapper" style={{ flex: 1 }}>
              <Navigation className="search-icon" size={16} style={{ color: 'var(--secondary-accent)' }} />
              <input 
                type="text" 
                className="input-field" 
                placeholder="Comune o nome struttura (es. Natatorium)"
                value={citySearchQuery}
                onChange={(e) => setCitySearchQuery(e.target.value)}
                list="facility-suggestions"
              />
              <datalist id="facility-suggestions">
                {Array.from(new Set(allActivities.map(a => a.locationName))).sort().map(loc => (
                  <option key={loc} value={loc} />
                ))}
              </datalist>
            </div>
            <button type="submit" className="location-btn" disabled={searchLoading}>
              {searchLoading ? '...' : 'Vai'}
            </button>
          </form>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
            <span>📍 Attuale:</span>
            <strong style={{ color: 'var(--text-primary)' }}>{currentCityName}</strong>
          </div>
        </div>

        {/* Raggio di ricerca */}
        <div className="filter-group">
          <label className="filter-label">📏 Raggio di ricerca</label>
          <select 
            className="select-field"
            value={searchRadius}
            onChange={(e) => setSearchRadius(Number(e.target.value))}
            style={{ fontWeight: 600 }}
          >
            <option value={1}>1 Kilometro (A piedi)</option>
            <option value={2}>2 Kilometri (Molto vicino)</option>
            <option value={5}>5 Kilometri (Nei paraggi)</option>
            <option value={10}>10 Kilometri (In auto/mezzi)</option>
            <option value={15}>15 Kilometri (Area allargata)</option>
          </select>
        </div>

        {/* Indicatore Stato GPS */}
        {gpsError && (
          <div className="gps-status-bar" style={{ background: 'rgba(245, 158, 11, 0.08)', borderColor: 'rgba(245, 158, 11, 0.2)', color: '#d97706' }}>
            <span>💡 Inserisci una località qui sopra per iniziare.</span>
          </div>
        )}

        <hr style={{ border: 'none', borderBottom: '1px solid rgba(0,0,0,0.05)' }} />

        {/* Filtro Ricerca Testuale Attività */}
        <div className="filter-group">
          <label className="filter-label">🔍 Cerca Attività</label>
          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Cosa vuoi fare? (es. Calcio, Yoga)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              list="activity-suggestions"
            />
            <datalist id="activity-suggestions">
              {availableCategories.map(cat => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Categoria Attività */}
        <div className="filter-group">
          <label className="filter-label">Categoria</label>
          <select 
            className="select-field"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Tutte le categorie</option>
            {availableCategories.map(cat => (
              <option key={cat} value={cat}>
                {getCategoryLabel(cat)}
              </option>
            ))}
          </select>
        </div>

        {/* Livello */}
        <div className="filter-group">
          <label className="filter-label">Livello</label>
          <select 
            className="select-field"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
          >
            <option value="all">Tutti i livelli</option>
            {Object.entries(LEVEL_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        {/* Target (Età) */}
        <div className="filter-group">
          <label className="filter-label">Target Età</label>
          <select 
            className="select-field"
            value={selectedTarget}
            onChange={(e) => setSelectedTarget(e.target.value)}
          >
            <option value="all">Tutti</option>
            {Object.entries(TARGET_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        {/* Giorni della Settimana */}
        <div className="filter-group">
          <label className="filter-label">Giorni della settimana</label>
          <div className="days-grid">
            {DAY_LABELS.map(day => (
              <button
                key={day.value}
                type="button"
                className={`day-btn ${selectedDays.includes(day.value) ? 'active' : ''}`}
                onClick={() => toggleDay(day.value)}
              >
                {day.label.substring(0, 3)}
              </button>
            ))}
          </div>
        </div>

        {/* Filtro Orario Preciso (Fascia di Interesse) */}
        <div className="filter-group">
          <label className="filter-label">🕒 Fascia oraria di svolgimento</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Dalle ore:</span>
              <select 
                className="select-field" 
                value={startHourFilter}
                onChange={(e) => {
                  const start = Number(e.target.value);
                  setStartHourFilter(start);
                  if (start >= endHourFilter) {
                    setEndHourFilter(start + 1);
                  }
                }}
                style={{ padding: '8px' }}
              >
                {hoursOptions.map(h => (
                  <option key={h} value={h}>{h}:00</option>
                ))}
              </select>
            </div>
            
            <div style={{ alignSelf: 'flex-end', paddingBottom: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>a</div>

            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Alle ore:</span>
              <select 
                className="select-field" 
                value={endHourFilter}
                onChange={(e) => setEndHourFilter(Number(e.target.value))}
                style={{ padding: '8px' }}
              >
                {hoursOptions.filter(h => h > startHourFilter).map(h => (
                  <option key={h} value={h}>{h}:00</option>
                ))}
                <option value={24}>24:00</option>
              </select>
            </div>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>
            Mostra solo i corsi che si svolgono interamente tra le {startHourFilter}:00 e le {endHourFilter}:00.
          </div>
        </div>

        {/* Intestazione Risultati */}
        <div className="results-header">
          <span className="results-count">Trovati {filteredActivities.length} corsi</span>
          <button className="reset-filters-btn" onClick={handleResetFilters}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <RotateCcw size={14} /> Reset
            </span>
          </button>
        </div>

        {/* Lista Corsi Filtrati */}
        <div className="activities-list">
          {filteredActivities.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px 0', fontSize: '14px' }}>
              Nessun corso corrisponde ai filtri selezionati.
            </div>
          ) : (
            filteredActivities.map(act => (
              <ActivityCard
                key={act.id}
                activity={act}
                isSelected={selectedActivity?.id === act.id}
                onClick={() => handleCardClick(act)}
              />
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
