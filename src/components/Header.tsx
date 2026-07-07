import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dict } from '../i18n/it';

interface HeaderProps {
  citySearchQuery: string;
  setCitySearchQuery: (q: string) => void;
  handleLocationSearch: (locName: string, lat?: number, lng?: number) => void;
  onActivitySelect: (activityId: string) => void;
  theme: string;
  toggleTheme: () => void;
  allActivities: any[];
  onReportClick: () => void;
}

const normalizeStr = (str: string) => 
  str ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase() : '';

export default function Header({ 
  citySearchQuery, 
  setCitySearchQuery, 
  handleLocationSearch, 
  onActivitySelect,
  theme, 
  toggleTheme, 
  allActivities, 
  onReportClick 
}: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const [localSuggestions, setLocalSuggestions] = useState<any[]>([]);
  const [remoteSuggestions, setRemoteSuggestions] = useState<any[]>([]);
  const [remoteError, setRemoteError] = useState(false);
  
  const containerRef = useRef<HTMLFormElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const { user, loading } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        if (window.innerWidth <= 640 && !citySearchQuery) {
          setIsSearchExpanded(false);
        }
      }
    };
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    
    // Close dropdown with ESC
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [citySearchQuery]);

  // Local matching (activities)
  useEffect(() => {
    if (citySearchQuery.length >= 2) {
      const normVal = normalizeStr(citySearchQuery);
      const matched = allActivities.filter(a => 
        normalizeStr(a.name).includes(normVal) || 
        normalizeStr(a.address).includes(normVal) ||
        normalizeStr(a.locationName).includes(normVal)
      ).slice(0, 5); // Max 5 risultati
      setLocalSuggestions(matched);
    } else {
      setLocalSuggestions([]);
    }
  }, [citySearchQuery, allActivities]);

  // Remote matching (Photon Geocoding)
  useEffect(() => {
    if (citySearchQuery.length < 3) {
      setRemoteSuggestions([]);
      setRemoteError(false);
      if (abortControllerRef.current) abortControllerRef.current.abort();
      return;
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(citySearchQuery)}&bbox=10.6,44.8,13.1,46.7&limit=5`, { signal: controller.signal });
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        setRemoteSuggestions(data.features || []);
        setRemoteError(false);
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          setRemoteError(true);
          setRemoteSuggestions([]);
        }
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [citySearchQuery]);

  return (
    <header className={scrolled ? 'scrolled' : ''}>
      <div className="hbar">
        <div className="logo">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z"/>
            <path d="M9.5 10.5 12 7l2.5 3.5L12 13z" fill="currentColor" stroke="none"/>
          </svg>
          {dict.header.titolo}
        </div>
        
        <form className={`search ${isSearchExpanded ? 'expanded' : ''}`} onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', alignItems: 'center', position: 'relative' }} ref={containerRef}>
          <svg 
            className="search-icon"
            width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            onClick={(e) => { 
              if (window.innerWidth <= 640 && !isSearchExpanded) {
                e.preventDefault();
                setIsSearchExpanded(true);
              }
            }}
          >
            <circle cx="11" cy="11" r="7"/>
            <path d="m20 20-3.5-3.5"/>
          </svg>
          
          <input 
            type="text" 
            placeholder="Cerca palestra, indirizzo o località…" 
            value={citySearchQuery}
            onFocus={() => setShowDropdown(true)}
            onChange={(e) => {
              setCitySearchQuery(e.target.value);
              setShowDropdown(true);
            }}
            onKeyDown={(e) => {
              // Basic keyboard nav: just closing on Enter for now to avoid complexity without focus management
              if (e.key === 'Enter') {
                e.preventDefault();
                setShowDropdown(false);
              }
            }}
            style={{background: 'transparent', border: 'none', outline: 'none', width: '100%', color: 'inherit'}}
            role="combobox"
            aria-expanded={showDropdown}
            aria-controls="search-dropdown"
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
          {showDropdown && citySearchQuery.length >= 2 && (
            <div 
              id="search-dropdown"
              role="listbox"
              style={{ 
                position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, 
                background: 'var(--surface)', border: '1px solid var(--border)', 
                borderRadius: '8px', maxHeight: '350px', overflowY: 'auto', 
                zIndex: 1000, margin: 0, padding: 0,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                display: 'flex', flexDirection: 'column'
              }}
            >
              {localSuggestions.length === 0 && remoteSuggestions.length === 0 && !remoteError && (
                <div style={{ padding: '16px', color: 'var(--muted)', textAlign: 'center', fontSize: '0.9rem' }}>
                  Nessun risultato. Prova con il nome del comune o un'altra palestra.
                </div>
              )}
              
              {remoteError && citySearchQuery.length >= 3 && (
                 <div style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: '0.85rem', background: 'var(--bg)', borderBottom: localSuggestions.length > 0 ? '1px solid var(--border)' : 'none' }}>
                    Ricerca indirizzi non disponibile in questo momento, riprova più tardi. Le palestre sono comunque ricercabili.
                 </div>
              )}

              {remoteSuggestions.length > 0 && (
                <div style={{ padding: '8px 0', borderBottom: localSuggestions.length > 0 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ padding: '4px 16px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Luoghi e Indirizzi</div>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {remoteSuggestions.map((feat, idx) => {
                      const props = feat.properties;
                      const displayName = [props.name, props.street, props.city, props.state].filter(Boolean).join(', ');
                      return (
                        <li 
                          key={`rem-${idx}`}
                          role="option"
                          style={{ padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border)', minHeight: '44px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                          onClick={(e) => {
                            e.preventDefault();
                            setCitySearchQuery(displayName);
                            setShowDropdown(false);
                            const [lng, lat] = feat.geometry.coordinates;
                            handleLocationSearch(displayName, lat, lng);
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>{props.name || props.street || props.city}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '2px' }}>
                            {[props.street, props.city, props.state].filter(Boolean).filter(x => x !== (props.name || props.street || props.city)).join(', ')}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {localSuggestions.length > 0 && (
                <div style={{ padding: '8px 0' }}>
                  <div style={{ padding: '4px 16px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Palestre</div>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {localSuggestions.map(act => (
                      <li 
                        key={`loc-${act.id}`}
                        role="option"
                        style={{ padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border)', minHeight: '44px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                        onClick={(e) => {
                          e.preventDefault();
                          setCitySearchQuery(act.name);
                          setShowDropdown(false);
                          onActivitySelect(act.id);
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>{act.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '2px' }}>{act.locationName}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
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
          {!loading && user && (
            <div className="avatar" title={user.email || ''}>{user.email?.charAt(0).toUpperCase() || 'U'}</div>
          )}
          {!loading && !user && (
            <div className="avatar" style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
