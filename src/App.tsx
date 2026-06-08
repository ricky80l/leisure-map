import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  Search, 
  MapPin, 
  Clock, 
  Calendar, 
  Phone, 
  User, 
  RotateCcw,
  X,
  Menu,
  Navigation
} from 'lucide-react';
import { 
  Activity, 
  generateMockActivities, 
  CATEGORY_LABELS, 
  LEVEL_LABELS, 
  TARGET_LABELS, 
  DAY_LABELS 
} from './data/mockActivities';

// Coordinate di default (Roma) se il GPS non è disponibile
const DEFAULT_LAT = 41.9028;
const DEFAULT_LNG = 12.4964;

export default function App() {
  // Posizione corrente dell'utente o impostata manualmente
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(true);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Stato per la ricerca testuale della località
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [currentCityName, setCurrentCityName] = useState<string>('');
  const [searchLoading, setSearchLoading] = useState(false);

  // Raggio di ricerca in km
  const [searchRadius, setSearchRadius] = useState<number>(5);

  // Database attività
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  // Filtri di ricerca attività
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedTarget, setSelectedTarget] = useState<string>('all');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  
  // Fascia oraria precisa (ora d'inizio e ora di fine consentita)
  const [startHourFilter, setStartHourFilter] = useState<number>(8);
  const [endHourFilter, setEndHourFilter] = useState<number>(23);

  // UI Mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Riferimenti Leaflet
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersGroupRef = useRef<L.FeatureGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);

  // 1. Rileva la posizione GPS dell'utente all'avvio
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserCoords({ lat, lng });
          setActivities(generateMockActivities(lat, lng, searchRadius));
          setGpsLoading(false);
          setCurrentCityName('Tua Posizione GPS');
        },
        (error) => {
          console.warn('Errore geolocalizzazione:', error.message);
          setGpsError('GPS non disponibile. Cerca una città nel campo sotto.');
          setUserCoords({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
          setActivities(generateMockActivities(DEFAULT_LAT, DEFAULT_LNG, searchRadius));
          setGpsLoading(false);
          setCurrentCityName('Roma (Predefinita)');
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      setGpsError('Geolocalizzazione non supportata.');
      setUserCoords({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
      setActivities(generateMockActivities(DEFAULT_LAT, DEFAULT_LNG, searchRadius));
      setGpsLoading(false);
      setCurrentCityName('Roma (Predefinita)');
    }
  }, []);

  // 2. Inizializza la Mappa Leaflet
  useEffect(() => {
    if (gpsLoading || !userCoords || !mapContainerRef.current || mapRef.current) return;

    // Inizializza la mappa centrata sulla posizione corrente
    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: false
    }).setView([userCoords.lat, userCoords.lng], 13);

    // Carica i tile a COLORI e VIVACI da CartoDB (Voyager) - perfetto per tempo libero!
    const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Aggiunge controllo attribuzione
    L.control.attribution({ position: 'bottomright' }).addTo(map);

    // Gruppo per i marker delle attività
    const markersGroup = L.featureGroup().addTo(map);

    mapRef.current = map;
    markersGroupRef.current = markersGroup;

    // Marker posizione di riferimento (punto verde pulsante)
    const gpsIcon = L.divIcon({
      className: 'gps-marker',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
    userMarkerRef.current = L.marker([userCoords.lat, userCoords.lng], { icon: gpsIcon })
      .addTo(map)
      .bindPopup(currentCityName || 'Punto di riferimento');

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [gpsLoading, userCoords]);

  // Gestione dinamica del raggio di ricerca (cerchio visuale e zoom automatico)
  useEffect(() => {
    if (!mapRef.current || !userCoords) return;

    // Rimuove cerchio precedente se esiste
    if (radiusCircleRef.current) {
      radiusCircleRef.current.remove();
    }

    // Crea un nuovo cerchio semitrasparente a tema corallo per evidenziare l'area di ricerca
    const circle = L.circle([userCoords.lat, userCoords.lng], {
      radius: searchRadius * 1000, // in metri
      color: 'var(--accent-color)',
      fillColor: 'var(--accent-color)',
      fillOpacity: 0.07,
      weight: 2,
      dashArray: '6, 6'
    }).addTo(mapRef.current);

    radiusCircleRef.current = circle;

    // Adatta automaticamente lo zoom della mappa per mostrare tutto il raggio
    mapRef.current.fitBounds(circle.getBounds(), { padding: [30, 30] });

    // Rigenera i dati mock distribuiti entro il nuovo raggio
    setActivities(generateMockActivities(userCoords.lat, userCoords.lng, searchRadius));
    setSelectedActivity(null);
  }, [userCoords, searchRadius]);

  // Aggiorna il marker di posizione quando cambiano le coordinate utente
  useEffect(() => {
    if (mapRef.current && userMarkerRef.current && userCoords) {
      userMarkerRef.current.setLatLng([userCoords.lat, userCoords.lng]);
      userMarkerRef.current.bindPopup(currentCityName || 'Punto di riferimento');
    }
  }, [userCoords, currentCityName]);

  // Funzione per cercare una città / indirizzo tramite geocoding gratuito (OpenStreetMap Nominatim)
  const handleCitySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citySearchQuery.trim()) return;

    setSearchLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(citySearchQuery)}`
      );
      const data = await res.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        const displayName = data[0].display_name.split(',')[0]; // Prende il nome principale (es. città)

        setUserCoords({ lat, lng });
        setCurrentCityName(displayName);
        setGpsError(null); // Pulisce gli errori GPS poiché l'utente ha scelto l'area manualmente
      } else {
        alert('Località non trovata. Controlla l\'ortografia e riprova.');
      }
    } catch (error) {
      console.error('Errore nel geocoding:', error);
      alert('Impossibile cercare la località in questo momento. Controlla la tua connessione.');
    } finally {
      setSearchLoading(false);
    }
  };

  // Filtra le attività in base ai criteri selezionati
  const filteredActivities = activities.filter(act => {
    // Ricerca testuale
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchName = act.name.toLowerCase().includes(query);
      const matchDesc = act.description.toLowerCase().includes(query);
      const matchLoc = act.locationName.toLowerCase().includes(query);
      if (!matchName && !matchDesc && !matchLoc) return false;
    }

    // Categoria
    if (selectedCategory !== 'all' && act.category !== selectedCategory) return false;

    // Livello
    if (selectedLevel !== 'all' && act.level !== selectedLevel) return false;

    // Target (Adulti / Bambini)
    if (selectedTarget !== 'all' && act.target !== selectedTarget) return false;

    // Giorni (se selezionati, l'attività deve svolgersi in almeno uno dei giorni scelti)
    if (selectedDays.length > 0) {
      const matchDay = act.days.some(d => selectedDays.includes(d));
      if (!matchDay) return false;
    }

    // Filtro orario corretto per fascia di interesse:
    // L'attività deve svolgersi COMPLETAMENTE all'interno del range (es. corso dalle 20 alle 22 rientra in 18-23)
    if (act.startHour < startHourFilter || act.endHour > endHourFilter) return false;

    return true;
  });

  // Aggiorna i marker sulla mappa quando cambiano i filtri o la selezione dell'attività
  useEffect(() => {
    if (!mapRef.current || !markersGroupRef.current) return;

    // Rimuove i marker precedenti
    markersGroupRef.current.clearLayers();

    filteredActivities.forEach(act => {
      // Icone per categoria
      const emojiMap: Record<Activity['category'], string> = {
        calcio: '⚽',
        tennis: '🎾',
        yoga: '🧘',
        nuoto: '🏊',
        pilates: '🤸',
        teatro: '🎭',
        danza: '💃'
      };

      const emoji = emojiMap[act.category] || '📍';
      const isSelected = selectedActivity?.id === act.id;

      const customIcon = L.divIcon({
        className: `custom-marker ${isSelected ? 'active' : ''}`,
        html: `<span>${emoji}</span>`,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
        popupAnchor: [0, -22]
      });

      const marker = L.marker([act.lat, act.lng], { icon: customIcon });

      const daysString = act.days.map(d => DAY_LABELS.find(l => l.value === d)?.label).join(', ');
      const popupHtml = `
        <div class="popup-content">
          <div class="popup-title">${act.name}</div>
          <div class="popup-location"><span style="font-size:14px">📍</span> ${act.locationName}</div>
          <div class="popup-schedule"><span style="font-size:14px">🕒</span> ${daysString} dalle ${act.startHour}:00 alle ${act.endHour}:00</div>
          <div class="popup-footer">
            <span class="popup-price">${act.price}</span>
            <button class="popup-btn" id="popup-btn-${act.id}">Dettagli</button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      
      marker.on('click', () => {
        setSelectedActivity(act);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`popup-btn-${act.id}`);
        if (btn) {
          btn.addEventListener('click', () => {
            setSelectedActivity(act);
            if (window.innerWidth <= 768) {
              setSidebarOpen(true);
            }
          });
        }
      });

      markersGroupRef.current?.addLayer(marker);
    });

    // Se c'è una sola attività filtrata o selezionata, centrala
    if (selectedActivity) {
      const marker = markersGroupRef.current.getLayers().find(
        (l: any) => l.getLatLng().lat === selectedActivity.lat && l.getLatLng().lng === selectedActivity.lng
      ) as L.Marker;
      
      if (marker && !marker.isPopupOpen()) {
        marker.openPopup();
        mapRef.current.setView([selectedActivity.lat, selectedActivity.lng], 14, { animate: true });
      }
    }
  }, [filteredActivities, selectedActivity]);

  const handleCardClick = (act: Activity) => {
    setSelectedActivity(act);
    if (mapRef.current) {
      mapRef.current.setView([act.lat, act.lng], 14, { animate: true });
    }
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedLevel('all');
    setSelectedTarget('all');
    setSelectedDays([]);
    setStartHourFilter(8);
    setEndHourFilter(23);
    setSelectedActivity(null);
  };

  const toggleDay = (dayValue: number) => {
    if (selectedDays.includes(dayValue)) {
      setSelectedDays(selectedDays.filter(d => d !== dayValue));
    } else {
      setSelectedDays([...selectedDays, dayValue]);
    }
  };

  // Ore disponibili per le select dei filtri
  const hoursOptions = Array.from({ length: 17 }, (_, i) => i + 8); // Da 8 a 24

  return (
    <div className="app-container">
      {/* Bottone Menu per Mobile */}
      <button 
        className="sidebar-toggle-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        title="Filtri e Attività"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Laterale */}
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
                  placeholder="Inserisci città (es. Milano, Firenze)"
                  value={citySearchQuery}
                  onChange={(e) => setCitySearchQuery(e.target.value)}
                />
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
              />
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
              {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
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
                <div 
                  key={act.id} 
                  className={`activity-card ${selectedActivity?.id === act.id ? 'selected' : ''}`}
                  onClick={() => handleCardClick(act)}
                >
                  <div className="card-header">
                    <h3 className="card-title">{act.name}</h3>
                  </div>

                  <div className="card-tags">
                    <span className="tag tag-category">{CATEGORY_LABELS[act.category]}</span>
                    <span className="tag tag-level">{LEVEL_LABELS[act.level]}</span>
                    <span className="tag tag-target">{TARGET_LABELS[act.target]}</span>
                  </div>

                  <div className="card-info-item" style={{ marginTop: '4px' }}>
                    <MapPin size={14} style={{ color: 'var(--secondary-accent)' }} />
                    <span>{act.locationName}</span>
                  </div>

                  <div className="card-info-item">
                    <Calendar size={14} style={{ color: 'var(--secondary-accent)' }} />
                    <span>{act.days.map(d => DAY_LABELS.find(l => l.value === d)?.label.substring(0, 3)).join(', ')}</span>
                  </div>

                  <div className="card-info-item">
                    <Clock size={14} style={{ color: 'var(--secondary-accent)' }} />
                    <span>dalle {act.startHour}:00 alle {act.endHour}:00</span>
                  </div>

                  {selectedActivity?.id === act.id && (
                    <div style={{ marginTop: '8px', padding: '12px', background: 'rgba(0,0,0,0.02)', borderRadius: '10px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '3px solid var(--accent-color)' }}>
                      <p style={{ color: 'var(--text-primary)', fontStyle: 'italic' }}>"{act.description}"</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                        <User size={12} />
                        <span>Organizzato da: {act.organizer}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                        <Phone size={12} />
                        <span>Contatto: {act.contact}</span>
                      </div>
                    </div>
                  )}

                  <span className="card-price">{act.price}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* Contenitore Mappa */}
      <main className="map-container" ref={mapContainerRef}>
        {gpsLoading && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 2000, background: 'var(--bg-color)', gap: '16px' }}>
            <span style={{ fontSize: '32px', animation: 'float 2s infinite' }}>🎈</span>
            <div style={{ fontSize: '16px', fontWeight: 600 }}>Rilevamento posizione GPS...</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Consenti la geolocalizzazione o scrivi una località nel menu a sinistra.</div>
          </div>
        )}
      </main>
    </div>
  );
}
