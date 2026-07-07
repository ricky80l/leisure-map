'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useVirtualizer } from '@tanstack/react-virtual';
import { track } from '@vercel/analytics';
import { dict } from '../i18n/it';
import Header from '../components/Header';
import Filters from '../components/Filters';
import ActivityCard from '../components/ActivityCard';
import ActivityDetailPanel from '../components/ActivityDetailPanel';
import PatchNotesModal from '../components/PatchNotesModal';
import ReportModal from '../components/ReportModal';
import { LATEST_PATCH_NOTE } from '../data/patchNotes';
import { Activity, getDistanceKm } from '../data/mockActivities';

const ActivityMap = dynamic(() => import('../components/map/ActivityMap'), { 
  ssr: false, 
  loading: () => <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'var(--surface)', color: 'var(--muted)' }}>Caricamento Mappa...</div> 
});

const DEFAULT_LAT = process.env.NEXT_PUBLIC_DEFAULT_LAT ? parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LAT) : 45.55;
const DEFAULT_LNG = process.env.NEXT_PUBLIC_DEFAULT_LNG ? parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LNG) : 11.95;

const DEFAULT_REGION_NAME = process.env.NEXT_PUBLIC_DEFAULT_REGION_NAME || 'Veneto Centrale';

export default function HomeClient({ 
  initialActivities,
  initialCity,
  initialCategory
}: { 
  initialActivities: Activity[],
  initialCity?: string,
  initialCategory?: string
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Layout State
  const isCompactView = searchParams?.get('vista') === 'elenco';

  // --- UI State ---
  const [theme, setTheme] = useState('light');
  const [showPatchNotes, setShowPatchNotes] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [mobileMode, setMobileMode] = useState<'map' | 'list'>(isCompactView ? 'list' : 'map');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hasRequestedMap, setHasRequestedMap] = useState(false);

  // Refs per Virtualizer
  const listParentRef = useRef<HTMLDivElement>(null);

  // --- Data State ---
  const [allActivities, setAllActivities] = useState<Activity[]>(initialActivities);
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const handleSelectActivity = useCallback((act: Activity | null) => {
    setSelectedActivity(act);
    if (act) {
      track('activity_viewed', { id: act.id, name: act.name, category: act.category });
    }
  }, []);

  // --- GPS / Search State ---
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
  const [citySearchQuery, setCitySearchQuery] = useState(initialCity || '');
  const [currentCityName, setCurrentCityName] = useState<string>(initialCity || DEFAULT_REGION_NAME);
  const [locationSource, setLocationSource] = useState<'gps' | 'search' | 'fallback'>(initialCity ? 'search' : 'fallback');
  const [isDistanceFilterActive, setIsDistanceFilterActive] = useState<boolean>(!!initialCity);
  const [isLocating, setIsLocating] = useState<boolean>(!initialCity);
  
  // --- Filters State ---
  const [searchRadius, setSearchRadius] = useState<number>(30);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
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
    setAllActivities(initialActivities);
  }, [initialActivities]);

  useEffect(() => {
    if (initialCity && initialActivities.length > 0) {
      const match = initialActivities.find(a => a.locationName.toLowerCase() === initialCity.toLowerCase());
      if (match) {
        setUserCoords({ lat: match.lat, lng: match.lng });
        setCurrentCityName(match.locationName);
        setIsDistanceFilterActive(true);
        setIsLocating(false);
        return;
      }
    }

    const savedCoords = localStorage.getItem('leisureMap_userCoords');
    const savedCityName = localStorage.getItem('leisureMap_currentCityName');
    
    if (savedCoords && savedCityName) {
      try {
        const parsedCoords = JSON.parse(savedCoords);
        setUserCoords(parsedCoords);
        setCurrentCityName(savedCityName);
        setIsDistanceFilterActive(true);
        setIsLocating(false);
        return;
      } catch (e) {
        console.error('Errore nel parse delle coordinate salvate', e);
      }
    }

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
          setCurrentCityName('Tua Posizione GPS');
          setLocationSource('gps');
          setIsDistanceFilterActive(true);
          setIsLocating(false);
        },
        () => {
          setUserCoords({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
          setCurrentCityName(DEFAULT_REGION_NAME);
          setLocationSource('fallback');
          setIsDistanceFilterActive(false);
          setIsLocating(false);
          track('geo_negata');
        },
        { enableHighAccuracy: true, timeout: 3000, maximumAge: 0 }
      );
    } else {
      // Fallback in assenza di geolocation API
      setUserCoords({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
      setCurrentCityName(DEFAULT_REGION_NAME);
      setLocationSource('fallback');
      setIsDistanceFilterActive(false);
      setIsLocating(false);
      track('geo_negata');
    }
  }, [initialCity, initialActivities]);

  // Lazy load map initialization
  useEffect(() => {
    if (window.innerWidth >= 640 || mobileMode === 'map') {
      setHasRequestedMap(true);
    }
  }, [mobileMode]);

  // Analytics for filters
  useEffect(() => {
    // Evita di tracciare i valori iniziali se sono di default
    if (selectedCategory !== 'all' || searchRadius !== 30) {
      track('filter_applied', { category: selectedCategory, distance: searchRadius });
    }
  }, [selectedCategory, searchRadius]);

  useEffect(() => {
    if (userCoords && allActivities.length > 0) {
      let nearby = allActivities;
      if (isDistanceFilterActive) {
        nearby = allActivities.filter(act => {
          const distance = getDistanceKm(userCoords.lat, userCoords.lng, act.lat, act.lng);
          return distance <= searchRadius;
        });
      }
      setActivities(nearby);
      setSelectedActivity(prev => {
        if (!prev) return null;
        const isStillNearby = nearby.some(a => a.id === prev.id);
        return isStillNearby ? prev : null;
      });
    }
  }, [userCoords, searchRadius, allActivities, isDistanceFilterActive]);

  const availableCategories = useMemo(() => {
    const baseCats = allActivities.map(act => act.category);
    const uniqueCats = Array.from(new Set(baseCats.map(c => c.toLowerCase()))).sort();
    return uniqueCats;
  }, [allActivities]);

  const resetLocation = () => {
    setIsLocating(true);
    setCitySearchQuery('');
    localStorage.removeItem('leisureMap_userCoords');
    localStorage.removeItem('leisureMap_currentCityName');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
          setCurrentCityName('Tua Posizione GPS');
          setLocationSource('gps');
          setIsDistanceFilterActive(true);
          setIsLocating(false);
        },
        () => {
          setUserCoords({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
          setCurrentCityName(DEFAULT_REGION_NAME);
          setLocationSource('fallback');
          setIsDistanceFilterActive(false);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 3000, maximumAge: 0 }
      );
    } else {
      setUserCoords({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
      setCurrentCityName(DEFAULT_REGION_NAME);
      setLocationSource('fallback');
      setIsDistanceFilterActive(false);
      setIsLocating(false);
    }
  };

  const handleLocationSearch = (locName: string, lat?: number, lng?: number) => {
    if (lat !== undefined && lng !== undefined) {
      const coords = { lat, lng };
      setUserCoords(coords);
      setCurrentCityName(locName);
      setLocationSource('search');
      setIsDistanceFilterActive(true);
      localStorage.setItem('leisureMap_userCoords', JSON.stringify(coords));
      localStorage.setItem('leisureMap_currentCityName', locName);
      track('citta_selezionata', { citta: locName, metodo: 'geocoding_photon' });
    }
  };

  const handleActivitySelect = (activityId: string) => {
    const act = allActivities.find(a => a.id === activityId);
    if (act) {
      const coords = { lat: act.lat, lng: act.lng };
      setUserCoords(coords);
      setCurrentCityName(act.locationName);
      setLocationSource('search');
      setIsDistanceFilterActive(true);
      localStorage.setItem('leisureMap_userCoords', JSON.stringify(coords));
      localStorage.setItem('leisureMap_currentCityName', act.locationName);
      
      handleSelectActivity(act);
    }
  };

  const filteredActivities = useMemo(() => {
    const filtered = activities.filter(act => {
      if (selectedCategory !== 'all') {
        const matchCategory = act.category?.toLowerCase() === selectedCategory.toLowerCase();
        if (!matchCategory) return false;
      }
      if (selectedLevel !== 'all' && (act.level || '').toLowerCase() !== selectedLevel.toLowerCase()) return false;
      
      if (selectedTarget !== 'all') {
        const actTarget = (act.target || 'tutti').toLowerCase();
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
    
    return filtered.sort((a, b) => {
      const distA = getDistanceKm(userCoords.lat, userCoords.lng, a.lat, a.lng);
      const distB = getDistanceKm(userCoords.lat, userCoords.lng, b.lat, b.lng);
      return distA - distB;
    });
  }, [activities, selectedCategory, selectedLevel, selectedTarget, selectedDay, startHourLimit, endHourLimit, userCoords]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedLevel('all');
    setSearchRadius(1000);
    setSelectedTarget('all');
    setSelectedDay('all');
    setStartHourLimit('all');
    setEndHourLimit('all');
    handleSelectActivity(null);
  };

  const toggleViewMode = () => {
    const params = new URLSearchParams(searchParams?.toString());
    if (isCompactView) {
      params.delete('vista');
    } else {
      params.set('vista', 'elenco');
    }
    router.replace(`?${params.toString()}`);
  };

  const handleSearchArea = useCallback((b: { west: number; south: number; east: number; north: number }) => {
    const lat = (b.north + b.south) / 2;
    const lng = (b.east + b.west) / 2;
    setUserCoords({ lat, lng });
  }, []);

  const rowVirtualizer = useVirtualizer({
    count: filteredActivities.length,
    getScrollElement: () => listParentRef.current,
    estimateSize: () => isCompactView ? 116 : 400,
    overscan: 5,
  });

  return (
    <>
      <Header 
        citySearchQuery={citySearchQuery} 
        setCitySearchQuery={setCitySearchQuery} 
        handleLocationSearch={handleLocationSearch}
        onActivitySelect={handleActivitySelect}
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
        isDistanceFilterActive={isDistanceFilterActive}
      />

      <main className={`split ${mobileMode === 'map' ? 'mode-map' : 'mode-list'}`}>
        <section className="list" aria-label="Risultati" ref={listParentRef}>
          <div className="list-head" style={{ flexWrap: 'wrap', gap: '8px' }}>
            <h1>
              {isLocating 
                ? dict.home.ricerca_in_corso 
                : (locationSource === 'gps' 
                    ? dict.home.vicino_gps 
                    : (locationSource === 'search' 
                        ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            Vicino a {currentCityName}
                            <button 
                              onClick={(e) => { e.preventDefault(); resetLocation(); }}
                              style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--ink)' }}
                              aria-label="Rimuovi filtro località"
                            >
                              ✕
                            </button>
                          </span>
                        ) 
                        : dict.home.vicino_fallback))}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
              <span className="count" aria-live="polite">
                {isLocating ? dict.home.ricerca_in_corso : dict.home.attivita_trovate(filteredActivities.length)}
              </span>
              <button 
                onClick={toggleViewMode} 
                style={{ fontSize: '0.8rem', padding: '4px 10px', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '99px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {isCompactView ? '🖼️ Schede' : '📋 Elenco'}
              </button>
            </div>
          </div>

          {isLocating ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
               <style>{`
                  @keyframes pulseLoc { 0% { opacity:0.6; transform:scale(0.95); } 50% { opacity:1; transform:scale(1.05); } 100% { opacity:0.6; transform:scale(0.95); } }
               `}</style>
               <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:'var(--primary)', animation:'pulseLoc 1.5s infinite ease-in-out' }}></div>
               <p style={{ margin:0, fontWeight:500 }}>Sto cercando le attività migliori...</p>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)', border: '1px dashed var(--line)', borderRadius: '12px', marginTop: '20px' }}>
              <p style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: 500 }}>Non ci sono attività in questa zona con i filtri attuali.</p>
              <button onClick={handleResetFilters} style={{ padding: '10px 20px', background: 'var(--primary)', color: '#fff', borderRadius: '8px', fontWeight: 600 }}>
                Azzera tutti i filtri
              </button>
            </div>
          ) : (
            <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
              {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                const act = filteredActivities[virtualItem.index];
                return (
                  <div
                    key={act.id}
                    data-index={virtualItem.index}
                    ref={rowVirtualizer.measureElement}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualItem.start}px)`,
                      paddingBottom: '16px' // spacing below card
                    }}
                  >
                    <div style={{ paddingBottom: '16px' }}>
                      <ActivityCard
                        activity={act}
                        index={virtualItem.index}
                        userCoords={userCoords}
                        locationSource={locationSource}
                        isCompactView={isCompactView}
                        isFlipped={hoveredId === act.id}
                        onMouseEnter={() => {
                          if (window.matchMedia('(hover: hover)').matches) {
                            setHoveredId(act.id);
                          }
                        }}
                        onMouseLeave={() => setHoveredId(null)}
                        onCardClick={() => {
                          if (window.matchMedia('(hover: none)').matches) {
                            setHoveredId(hoveredId === act.id ? null : act.id);
                          }
                        }}
                        onDetailsClick={() => {
                          handleSelectActivity(act);
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ============ MAPPA ============ */}
        <section className="mapwrap" aria-label="Mappa dei risultati">
          {hasRequestedMap && (
            <ActivityMap 
              activities={filteredActivities}
              theme={theme as "light" | "dark"}
              hoveredId={hoveredId}
              selectedId={selectedActivity?.id}
              initialCenter={userCoords ? [userCoords.lng, userCoords.lat] : undefined}
              onMarkerClick={(id) => {
                const act = allActivities.find(a => a.id === id);
                if (act) {
                  handleSelectActivity(act);
                  document.getElementById(`card-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              onEmptyMapClick={(lng, lat) => {
                const coords = { lat, lng };
                setUserCoords(coords);
                setCurrentCityName('Punto selezionato');
                handleSelectActivity(null);
                setIsDistanceFilterActive(true);
                localStorage.setItem('leisureMap_userCoords', JSON.stringify(coords));
                localStorage.setItem('leisureMap_currentCityName', 'Punto selezionato');
              }}
              onSearchArea={handleSearchArea}
            />
          )}
        </section>

        {/* Pulsante Floating per Mobile (Mappa/Elenco) */}
        <button 
          className="mobile-view-toggle"
          onClick={() => {
            const nextMode = mobileMode === 'map' ? 'list' : 'map';
            setMobileMode(nextMode);
            track('toggle_vista', { vista: nextMode });
          }}
          aria-label="Cambia visualizzazione"
        >
          {mobileMode === 'map' ? '📋 Mostra Elenco' : '🗺️ Mostra Mappa'}
        </button>
      </main>

      {selectedActivity && (
        <ActivityDetailPanel 
          activity={selectedActivity} 
          onClose={() => handleSelectActivity(null)} 
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
