'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Header from '../components/Header';
import Filters from '../components/Filters';
import ActivityCard from '../components/ActivityCard';
import ActivityMap from '../components/map/ActivityMap';
import ActivityDetailPanel from '../components/ActivityDetailPanel';
import PatchNotesModal from '../components/PatchNotesModal';
import ReportModal from '../components/ReportModal';
import { LATEST_PATCH_NOTE } from '../data/patchNotes';
// Removed unused fetchActivities import
import { Activity, getDistanceKm } from '../data/mockActivities';

const DEFAULT_LAT = 45.6669;
const DEFAULT_LNG = 12.2431;

export default function HomeClient({ initialActivities }: { initialActivities: Activity[] }) {
  // --- UI State ---
  const [theme, setTheme] = useState('light');
  const [showPatchNotes, setShowPatchNotes] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // --- Data State ---
  const [allActivities, setAllActivities] = useState<Activity[]>(initialActivities);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  // --- GPS / Search State ---
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [currentCityName, setCurrentCityName] = useState<string>('');
  
  // --- Filters State ---
  const [searchRadius, setSearchRadius] = useState<number>(30);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedTarget, setSelectedTarget] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [startHourLimit, setStartHourLimit] = useState<number | 'all'>('all');
  const [endHourLimit, setEndHourLimit] = useState<number | 'all'>('all');

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.body.dataset.theme = newTheme;
  };

  useEffect(() => {
    const savedVersion = localStorage.getItem('leisureMap_version');
    if (savedVersion !== LATEST_PATCH_NOTE.version) {
      setShowPatchNotes(true);
    }
  }, []);

  const handleClosePatchNotes = () => {
    localStorage.setItem('leisureMap_version', LATEST_PATCH_NOTE.version);
    setShowPatchNotes(false);
  };

  useEffect(() => {
    // If the server passes updated initialActivities later, sync it
    setAllActivities(initialActivities);
  }, [initialActivities]);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
          setCurrentCityName('Tua Posizione GPS');
        },
        () => {
          setUserCoords({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
          setCurrentCityName('Treviso (Predefinita)');
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      setUserCoords({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
      setCurrentCityName('Treviso (Predefinita)');
    }
  }, []);

  // Update nearby activities when coords or radius change
  useEffect(() => {
    if (userCoords && allActivities.length > 0) {
      const nearby = allActivities.filter(act => {
        const distance = getDistanceKm(userCoords.lat, userCoords.lng, act.lat, act.lng);
        return distance <= searchRadius;
      });
      setActivities(nearby);
      setSelectedActivity(prev => {
        if (!prev) return null;
        const isStillNearby = nearby.some(a => a.id === prev.id);
        return isStillNearby ? prev : null;
      });
    }
  }, [userCoords, searchRadius, allActivities]);

  const availableCategories = useMemo(() => {
    const baseCats = allActivities.map(act => act.category);
    const uniqueCats = Array.from(new Set(baseCats.map(c => c.toLowerCase()))).sort();
    return uniqueCats;
  }, [allActivities]);

  const handleCitySearch = async (e?: any, overrideQuery?: string) => {
    if (e && e.preventDefault) e.preventDefault();
    const queryToUse = overrideQuery !== undefined ? overrideQuery : citySearchQuery;
    if (!queryToUse.trim()) return;

    const queryTerms = queryToUse.toLowerCase().trim().split(/\s+/);
    const facilityMatch = allActivities.find(act => {
      const searchStr = `${act.name} ${act.locationName} ${act.organizer} ${act.address} ${act.category}`.toLowerCase();
      return queryTerms.every(term => searchStr.includes(term));
    });

    if (facilityMatch) {
      setUserCoords({ lat: facilityMatch.lat, lng: facilityMatch.lng });
      setCurrentCityName(facilityMatch.locationName);
      setSelectedActivity(facilityMatch);
      return;
    }

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(citySearchQuery + ', Treviso, Italia')}`);
      const data = await res.json();
      if (data && data.length > 0) {
        setUserCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
        setCurrentCityName(data[0].display_name.split(',')[0]);
      } else {
        alert('Località non trovata.');
      }
    } catch (error) {
      console.error('Errore nel geocoding:', error);
    }
  };

  const filteredActivities = useMemo(() => {
    return activities.filter(act => {
      if (selectedCategory !== 'all') {
        const matchCategory = act.category?.toLowerCase() === selectedCategory.toLowerCase();
        if (!matchCategory) return false;
      }
      if (selectedLevel !== 'all' && (act.level || '').toLowerCase() !== selectedLevel.toLowerCase()) return false;
      
      if (selectedTarget !== 'all') {
        const actTarget = (act.target || 'tutti').toLowerCase();
        // If the activity is for 'tutti', it matches anything. Otherwise, it must match specifically.
        if (actTarget !== 'tutti' && actTarget !== selectedTarget.toLowerCase()) return false;
      }

      if (selectedDay !== 'all') {
        if (!act.days || !act.days.includes(parseInt(selectedDay))) return false;
      }

      if (startHourLimit !== 'all' || endHourLimit !== 'all') {
        const st = act.startHour ?? 0;
        const en = act.endHour ?? 24;
        
        if (startHourLimit !== 'all' && st < startHourLimit) return false;
        if (endHourLimit !== 'all' && en > endHourLimit) return false;
      }

      return true;
    });
  }, [activities, selectedCategory, selectedLevel, selectedTarget, selectedDay, startHourLimit, endHourLimit]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedLevel('all');
    setSearchRadius(1000); // Imposta un raggio grandissimo per mostrare tutti i pin globalmente
    setSelectedTarget('all');
    setSelectedDay('all');
    setStartHourLimit('all');
    setEndHourLimit('all');
    setSelectedActivity(null);
  };

  const handleSearchArea = useCallback((b: { west: number; south: number; east: number; north: number }) => {
    // Basic implementation: update center to the middle of bounds
    const lat = (b.north + b.south) / 2;
    const lng = (b.east + b.west) / 2;
    setUserCoords({ lat, lng });
  }, []);

  return (
    <>
      <Header 
        citySearchQuery={citySearchQuery} 
        setCitySearchQuery={setCitySearchQuery} 
        handleCitySearch={handleCitySearch}
        theme={theme}
        toggleTheme={toggleTheme}
        allActivities={allActivities}
        onReportClick={() => setShowReportModal(true)}
      />

      <Filters 
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        availableCategories={availableCategories}
        searchRadius={searchRadius}
        setSearchRadius={setSearchRadius}
        selectedLevel={selectedLevel}
        setSelectedLevel={setSelectedLevel}
        selectedTarget={selectedTarget}
        setSelectedTarget={setSelectedTarget}
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
        startHourLimit={startHourLimit}
        setStartHourLimit={setStartHourLimit}
        endHourLimit={endHourLimit}
        setEndHourLimit={setEndHourLimit}
        handleResetFilters={handleResetFilters}
      />

      <main className="split">
        {/* ============ LISTA ============ */}
        <section className="list" aria-label="Risultati">
          <div className="list-head">
            <h1>Vicino a {currentCityName}</h1>
            <span className="count" aria-live="polite">{filteredActivities.length} attività trovate</span>
          </div>

          {filteredActivities.map((act) => (
            <ActivityCard
              key={act.id}
              activity={act}
              userCoords={userCoords}
              isSelected={selectedActivity?.id === act.id}
              onMouseEnter={() => setHoveredId(act.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => {
                if (selectedActivity?.id === act.id) {
                  setSelectedActivity(null);
                } else {
                  setSelectedActivity(act);
                }
              }}
            />
          ))}
          {filteredActivities.length === 0 && (
            <p style={{ color: 'var(--muted)', marginTop: 20 }}>Nessuna attività trovata con questi filtri.</p>
          )}
        </section>

        {/* ============ MAPPA ============ */}
        <section className="mapwrap" aria-label="Mappa dei risultati">
          <ActivityMap 
            activities={filteredActivities}
            theme={theme as "light" | "dark"}
            hoveredId={hoveredId}
            selectedId={selectedActivity?.id}
            initialCenter={userCoords ? [userCoords.lng, userCoords.lat] : undefined}
            onMarkerClick={(id) => {
              const act = allActivities.find(a => a.id === id);
              if (act) {
                setSelectedActivity(act);
                document.getElementById(`card-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }}
            onEmptyMapClick={(lng, lat) => {
              setUserCoords({ lat, lng });
              setCurrentCityName('Punto selezionato');
              setSelectedActivity(null);
            }}
            onSearchArea={handleSearchArea}
          />
        </section>
      </main>

      {selectedActivity && (
        <ActivityDetailPanel 
          activity={selectedActivity} 
          onClose={() => setSelectedActivity(null)} 
        />
      )}

      {showPatchNotes && (
        <PatchNotesModal onClose={handleClosePatchNotes} />
      )}

      {showReportModal && (
        <ReportModal onClose={() => setShowReportModal(false)} />
      )}
    </>
  );
}
