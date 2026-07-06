
import { track } from '@vercel/analytics';

interface FiltersProps {
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  availableCategories: string[];
  searchRadius: number;
  setSearchRadius: (r: number) => void;
  selectedLevel: string;
  setSelectedLevel: (l: string) => void;
  selectedTarget: string;
  setSelectedTarget: (t: string) => void;
  selectedDay: string;
  setSelectedDay: (d: string) => void;
  startHourLimit: number | 'all';
  setStartHourLimit: (t: number | 'all') => void;
  endHourLimit: number | 'all';
  setEndHourLimit: (t: number | 'all') => void;
  handleResetFilters: () => void;
  isDistanceFilterActive: boolean;
}

export default function Filters({
  selectedCategory,
  setSelectedCategory,
  availableCategories,
  searchRadius,
  setSearchRadius,
  selectedLevel,
  setSelectedLevel,
  selectedTarget,
  setSelectedTarget,
  selectedDay,
  setSelectedDay,
  startHourLimit,
  setStartHourLimit,
  endHourLimit,
  setEndHourLimit,
  handleResetFilters,
  isDistanceFilterActive
}: FiltersProps) {
  
  const mainCategories = availableCategories.length > 0 
    ? availableCategories 
    : ['fitness', 'corsi', 'arti_marziali'];

  const selectStyle = { 
    appearance: 'none' as const, 
    cursor: 'pointer', 
    paddingRight: '30px', 
    backgroundImage: 'url("data:image/svg+xml;utf8,<svg fill=%27black%27 height=%2724%27 viewBox=%270 0 24 24%27 width=%2724%27 xmlns=%27http://www.w3.org/2000/svg%27><path d=%27M7 10l5 5 5-5z%27/><path d=%27M0 0h24v24H0z%27 fill=%27none%27/></svg>")', 
    backgroundRepeat: 'no-repeat', 
    backgroundPosition: 'calc(100% - 5px) center' 
  };

  return (
    <div className="filters">
      <div className="frow" role="toolbar" aria-label="Filtri">
        <select 
          className="chip"
          style={selectStyle}
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            track('filtro_applicato', { tipo: 'categoria', valore: e.target.value });
          }}
        >
          <option value="all">Attività: Tutte</option>
          {mainCategories.map(cat => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
        
        <select 
          className="chip"
          style={{ ...selectStyle, opacity: isDistanceFilterActive ? 1 : 0.5, cursor: isDistanceFilterActive ? 'pointer' : 'not-allowed' }}
          value={searchRadius}
          onChange={(e) => {
            setSearchRadius(Number(e.target.value));
            track('filtro_applicato', { tipo: 'distanza', valore: e.target.value });
          }}
          disabled={!isDistanceFilterActive}
          title={!isDistanceFilterActive ? "Attiva la posizione o seleziona un'area per filtrare per distanza" : "Distanza massima"}
        >
          <option value={5}>Distanza: ≤ 5 km</option>
          <option value={15}>Distanza: ≤ 15 km</option>
          <option value={30}>Distanza: ≤ 30 km</option>
          <option value={50}>Distanza: ≤ 50 km</option>
        </select>

        <select 
          className="chip"
          style={selectStyle}
          value={selectedDay}
          onChange={(e) => {
            setSelectedDay(e.target.value);
            track('filtro_applicato', { tipo: 'giorno', valore: e.target.value });
          }}
        >
          <option value="all">Giorno: Qualsiasi</option>
          <option value="1">Lunedì</option>
          <option value="2">Martedì</option>
          <option value="3">Mercoledì</option>
          <option value="4">Giovedì</option>
          <option value="5">Venerdì</option>
          <option value="6">Sabato</option>
          <option value="7">Domenica</option>
        </select>

        <div className="chip" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0 12px' }}>
          {startHourLimit === 'all' && endHourLimit === 'all' ? (
            <span>Orario:</span>
          ) : (
            <span style={{ display: 'none' }}>Orario:</span> // Nascosto per risparmiare spazio se ci sono valori
          )}
          <input 
            type="number" 
            min="0" 
            max="24" 
            placeholder={startHourLimit === 'all' && endHourLimit === 'all' ? "Qualsiasi" : "Da"}
            style={{ 
              width: startHourLimit === 'all' && endHourLimit === 'all' ? '65px' : '30px', 
              border: 'none', background: 'transparent', textAlign: 'center', fontWeight: 'bold', outline: 'none' 
            }}
            value={startHourLimit === 'all' ? '' : startHourLimit}
            onChange={(e) => {
              const val = e.target.value === '' ? 'all' : Number(e.target.value);
              setStartHourLimit(val);
              track('filtro_applicato', { tipo: 'orario_inizio', valore: String(val) });
            }}
          />
          {(startHourLimit !== 'all' || endHourLimit !== 'all') && (
            <>
              <span>-</span>
              <input 
                type="number" 
                min="0" 
                max="24" 
                placeholder="A"
                style={{ width: '30px', border: 'none', background: 'transparent', textAlign: 'center', fontWeight: 'bold', outline: 'none' }}
                value={endHourLimit === 'all' ? '' : endHourLimit}
                onChange={(e) => {
                  const val = e.target.value === '' ? 'all' : Number(e.target.value);
                  setEndHourLimit(val);
                  track('filtro_applicato', { tipo: 'orario_fine', valore: String(val) });
                }}
              />
            </>
          )}
        </div>

        <select 
          className="chip"
          style={selectStyle}
          value={selectedTarget}
          onChange={(e) => {
            setSelectedTarget(e.target.value);
            track('filtro_applicato', { tipo: 'per_chi', valore: e.target.value });
          }}
        >
          <option value="all">Per chi: Tutti</option>
          <option value="bambini">Bambini</option>
          <option value="adulti">Adulti</option>
          <option value="anziani">Anziani</option>
        </select>

        <select 
          className="chip"
          style={selectStyle}
          value={selectedLevel}
          onChange={(e) => {
            setSelectedLevel(e.target.value);
            track('filtro_applicato', { tipo: 'livello', valore: e.target.value });
          }}
        >
          <option value="all">Livello: Tutti</option>
          <option value="principianti">Principianti</option>
          <option value="intermedio">Intermedio</option>
          <option value="avanzato">Avanzato</option>
        </select>
        
        <button className="reset" onClick={() => {
          handleResetFilters();
          track('filtro_applicato', { tipo: 'reset_tutti', valore: 'all' });
        }}>
          Azzera
        </button>
      </div>
    </div>
  );
}
