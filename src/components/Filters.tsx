

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
  handleResetFilters
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
          onChange={(e) => setSelectedCategory(e.target.value)}
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
          style={selectStyle}
          value={searchRadius}
          onChange={(e) => setSearchRadius(Number(e.target.value))}
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
          onChange={(e) => setSelectedDay(e.target.value)}
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

        <div className="chip" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 12px' }}>
          <span>Orario:</span>
          <input 
            type="number" 
            min="0" 
            max="24" 
            placeholder="Inizio"
            style={{ width: '45px', border: 'none', background: 'transparent', textAlign: 'center', fontWeight: 'bold', outline: 'none' }}
            value={startHourLimit === 'all' ? '' : startHourLimit}
            onChange={(e) => setStartHourLimit(e.target.value === '' ? 'all' : Number(e.target.value))}
          />
          <span>-</span>
          <input 
            type="number" 
            min="0" 
            max="24" 
            placeholder="Fine"
            style={{ width: '45px', border: 'none', background: 'transparent', textAlign: 'center', fontWeight: 'bold', outline: 'none' }}
            value={endHourLimit === 'all' ? '' : endHourLimit}
            onChange={(e) => setEndHourLimit(e.target.value === '' ? 'all' : Number(e.target.value))}
          />
        </div>

        <select 
          className="chip"
          style={selectStyle}
          value={selectedTarget}
          onChange={(e) => setSelectedTarget(e.target.value)}
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
          onChange={(e) => setSelectedLevel(e.target.value)}
        >
          <option value="all">Livello: Tutti</option>
          <option value="principianti">Principianti</option>
          <option value="intermedio">Intermedio</option>
          <option value="avanzato">Avanzato</option>
        </select>
        
        <button className="reset" onClick={handleResetFilters}>
          Azzera
        </button>
      </div>
    </div>
  );
}
