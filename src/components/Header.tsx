import { useState, useRef, useEffect } from 'react';

interface HeaderProps {
  citySearchQuery: string;
  setCitySearchQuery: (q: string) => void;
  handleCitySearch: (e?: any, overrideQuery?: string) => void;
  theme: string;
  toggleTheme: () => void;
  allActivities: any[];
  onReportClick: () => void;
}

export default function Header({ citySearchQuery, setCitySearchQuery, handleCitySearch, theme, toggleTheme, allActivities, onReportClick }: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLFormElement>(null);

  const suggestions = Array.from(new Set(allActivities.map(a => a.locationName)))
    .filter((loc: any) => loc.toLowerCase().includes(citySearchQuery.toLowerCase()))
    .sort();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header>
      <div className="hbar">
        <div className="logo">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z"/>
            <path d="M9.5 10.5 12 7l2.5 3.5L12 13z" fill="currentColor" stroke="none"/>
          </svg>
          Leisure Map
        </div>
        <form className="search" onSubmit={handleCitySearch} style={{ display: 'flex', alignItems: 'center', position: 'relative' }} ref={containerRef}>
          <svg 
            width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            style={{ cursor: 'pointer' }}
            onClick={(e) => { e.preventDefault(); handleCitySearch(); }}
          >
            <circle cx="11" cy="11" r="7"/>
            <path d="m20 20-3.5-3.5"/>
          </svg>
          <input 
            type="text" 
            placeholder="Cerca attività, luoghi, esperienze…" 
            value={citySearchQuery}
            onFocus={() => setShowDropdown(true)}
            onChange={(e) => {
              const val = e.target.value;
              setCitySearchQuery(val);
              setShowDropdown(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Tab') {
                const val = e.currentTarget.value;
                if (!val) return;
                const match = allActivities.find(a => a.locationName.toLowerCase().startsWith(val.toLowerCase()));
                if (match) {
                  e.preventDefault();
                  setCitySearchQuery(match.locationName);
                  setShowDropdown(false);
                  handleCitySearch(null, match.locationName);
                }
              }
              if (e.key === 'Enter') {
                setShowDropdown(false);
              }
            }}
            style={{background: 'transparent', border: 'none', outline: 'none', width: '100%', color: 'inherit'}}
          />
          {citySearchQuery && (
            <svg 
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ cursor: 'pointer', marginLeft: '8px', opacity: 0.6 }}
              onClick={() => {
                setCitySearchQuery('');
                setShowDropdown(true);
              }}
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          )}
          
          {/* Custom Dropdown */}
          {showDropdown && suggestions.length > 0 && (
            <ul 
              style={{ 
                position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, 
                background: 'var(--surface)', border: '1px solid var(--border)', 
                borderRadius: '8px', maxHeight: '240px', overflowY: 'auto', 
                zIndex: 1000, margin: 0, padding: 0, listStyle: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              {suggestions.map((loc: any) => (
                <li 
                  key={loc}
                  style={{ padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
                  onMouseDown={(e) => {
                    e.preventDefault(); 
                    setCitySearchQuery(loc);
                    setShowDropdown(false);
                    handleCitySearch(null, loc);
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {loc}
                </li>
              ))}
            </ul>
          )}
        </form>
        <nav className="hnav">
          <a href="#" onClick={(e) => { e.preventDefault(); onReportClick(); }}>➕ Segnala</a>
          <a href="#">Esplora</a>
          <a href="#">Salvate</a>
          <button className="theme-btn" onClick={toggleTheme} aria-label="Cambia tema">
            {theme === 'dark' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>
            )}
          </button>
          <div className="avatar">R</div>
        </nav>
      </div>
    </header>
  );
}
