import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Map from '../components/Map';
import { fetchActivities } from '../data/db';
import { Activity, getDistanceKm } from '../data/mockActivities';
import { Link } from 'react-router-dom';
import ActivityDetailPanel from '../components/ActivityDetailPanel';

// Coordinate di default (Treviso) se il GPS non è disponibile
const DEFAULT_LAT = 45.6669;
const DEFAULT_LNG = 12.2431;

export default function MapPage() {
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

  // Database globale scaricato (Supabase o JSON)
  const [allActivities, setAllActivities] = useState<Activity[]>([]);

  // Database attività filtrate geograficamente
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

  // 0. Carica i dati dal DB (Supabase o JSON locale)
  useEffect(() => {
    async function loadData() {
      const data = await fetchActivities();
      setAllActivities(data);
    }
    loadData();
  }, []);

  // 1. Rileva la posizione GPS dell'utente all'avvio
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserCoords({ lat, lng });
          setGpsLoading(false);
          setCurrentCityName('Tua Posizione GPS');
        },
        (error) => {
          console.warn('Errore geolocalizzazione:', error.message);
          setGpsError('GPS non disponibile. Cerca un comune della provincia di Treviso.');
          setUserCoords({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
          setGpsLoading(false);
          setCurrentCityName('Treviso (Predefinita)');
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      setGpsError('Geolocalizzazione non supportata.');
      setUserCoords({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
      setGpsLoading(false);
      setCurrentCityName('Treviso (Predefinita)');
    }
  }, []);

  // 2. Filtra geograficamente le attività
  useEffect(() => {
    if (userCoords && allActivities.length > 0) {
      const nearby = allActivities.filter(act => {
        const distance = getDistanceKm(userCoords.lat, userCoords.lng, act.lat, act.lng);
        return distance <= searchRadius;
      });
      setActivities(nearby);
      setSelectedActivity(null);
    }
  }, [userCoords, searchRadius, allActivities]);

  // 3. Estrarre l'elenco delle categorie uniche presenti nel database per i filtri della Sidebar
  const availableCategories = Array.from(
    new Set(allActivities.map(act => act.category))
  );

  // 4. Funzione per cercare una città / indirizzo / struttura
  const handleCitySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citySearchQuery.trim()) return;

    setSearchLoading(true);

    // 1. Cerca prima se il testo corrisponde a una struttura o corso nel nostro DB globale
    const query = citySearchQuery.toLowerCase();
    const facilityMatch = allActivities.find(act => 
      act.locationName.toLowerCase().includes(query) || 
      act.organizer.toLowerCase().includes(query)
    );

    if (facilityMatch) {
      setUserCoords({ lat: facilityMatch.lat, lng: facilityMatch.lng });
      setCurrentCityName(facilityMatch.locationName);
      setGpsError(null);
      setSelectedActivity(facilityMatch); // Seleziona subito l'attività trovata
      setSearchLoading(false);
      return;
    }

    try {
      // Prioritizza i risultati nella provincia di Treviso o in Veneto
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(citySearchQuery + ', Treviso, Italia')}`
      );
      const data = await res.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        const displayName = data[0].display_name.split(',')[0]; // Prende il nome principale (es. città)

        setUserCoords({ lat, lng });
        setCurrentCityName(displayName);
        setGpsError(null);
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

  // 5. Funzione per aggiornare la posizione tramite clic sulla mappa
  const handleMapClick = async (lat: number, lng: number) => {
    setUserCoords({ lat, lng });
    setCurrentCityName('Punto selezionato');
    setGpsError(null);
    
    // Reverse geocoding opzionale per avere il nome della via o città
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data && data.address) {
        const placeName = data.address.city || data.address.town || data.address.village || data.address.road || 'Punto selezionato';
        setCurrentCityName(placeName);
      }
    } catch (error) {
      console.warn("Reverse geocoding fallito", error);
    }
  };

  // Filtra le attività visualizzate in base ai filtri selezionati
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

    // Filtro orario
    if (act.startHour < startHourFilter || act.endHour > endHourFilter) return false;

    return true;
  });

  const handleCardClick = (act: Activity) => {
    setSelectedActivity(act);
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

  return (
    <div className="app-container">
      {/* Header Mobile / Pulsante Menu */}
      <div className="absolute top-4 left-4 z-[1010] flex gap-2">
        <button 
          className="sidebar-toggle-btn !static"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title="Filtri e Attività"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Pulsante Area Gestori (in alto a destra) */}
      <div className="absolute top-4 right-4 z-[1000]">
        <Link 
          to="/login"
          className="bg-gray-900/90 hover:bg-gray-800 text-white px-4 py-2 rounded-full shadow-lg backdrop-blur text-sm font-medium transition-all"
        >
          Sei un gestore?
        </Link>
      </div>

      {/* Sidebar Laterale */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        citySearchQuery={citySearchQuery}
        setCitySearchQuery={setCitySearchQuery}
        handleCitySearch={handleCitySearch}
        searchLoading={searchLoading}
        currentCityName={currentCityName}
        searchRadius={searchRadius}
        setSearchRadius={setSearchRadius}
        gpsError={gpsError}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedLevel={selectedLevel}
        setSelectedLevel={setSelectedLevel}
        selectedTarget={selectedTarget}
        setSelectedTarget={setSelectedTarget}
        selectedDays={selectedDays}
        toggleDay={toggleDay}
        startHourFilter={startHourFilter}
        setStartHourFilter={setStartHourFilter}
        endHourFilter={endHourFilter}
        setEndHourFilter={setEndHourFilter}
        filteredActivities={filteredActivities}
        handleResetFilters={handleResetFilters}
        selectedActivity={selectedActivity}
        handleCardClick={handleCardClick}
        availableCategories={availableCategories}
      />

      {/* Contenitore Mappa */}
      <Map
        userCoords={userCoords}
        currentCityName={currentCityName}
        searchRadius={searchRadius}
        filteredActivities={filteredActivities}
        selectedActivity={selectedActivity}
        setSelectedActivity={setSelectedActivity}
        setSidebarOpen={setSidebarOpen}
        gpsLoading={gpsLoading}
        onMapClick={handleMapClick}
      />

      {/* Pannello Dettaglio */}
      <ActivityDetailPanel 
        activity={selectedActivity} 
        onClose={() => setSelectedActivity(null)} 
      />
    </div>
  );
}
