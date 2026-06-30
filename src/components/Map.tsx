import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { Activity, CATEGORY_EMOJIS, getCategoryLabel } from '../data/mockActivities';

interface MapProps {
  userCoords: { lat: number; lng: number } | null;
  currentCityName: string;
  searchRadius: number;
  filteredActivities: Activity[];
  selectedActivity: Activity | null;
  setSelectedActivity: (act: Activity | null) => void;
  setSidebarOpen: (open: boolean) => void;
  gpsLoading: boolean;
  onMapClick: (lat: number, lng: number) => void;
}

export default function Map({
  userCoords,
  currentCityName,
  searchRadius,
  filteredActivities,
  selectedActivity,
  setSelectedActivity,
  setSidebarOpen,
  gpsLoading,
  onMapClick
}: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersGroupRef = useRef<L.FeatureGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);

  // 1. Inizializza la Mappa Leaflet
  useEffect(() => {
    if (gpsLoading || !userCoords || !mapContainerRef.current || mapRef.current) return;

    // Inizializza la mappa centrata sulla posizione corrente
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([userCoords.lat, userCoords.lng], 13);

    // Riposiziona il controllo dello zoom in basso a destra per evitare sovrapposizioni
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Carica i tile CHIARI E MINIMALI da CartoDB (Positron)
    const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Aggiunge controllo attribuzione
    L.control.attribution({ position: 'bottomright' }).addTo(map);

    // Gruppo Cluster per i marker delle attività
    const markersGroup = L.markerClusterGroup({
      maxClusterRadius: 30, // Raggio di raggruppamento in pixel
      spiderfyOnMaxZoom: true, // Apre a ragnatela se i marker hanno stesse coordinate
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      spiderLegPolylineOptions: { weight: 2, color: '#fca5a5', opacity: 0.8 }
    }).addTo(map);

    mapRef.current = map;
    markersGroupRef.current = markersGroup;

    // Aggiungi l'evento click per aggiornare il punto di ricerca
    map.on('click', (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    });

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

  // 2. Gestione dinamica del raggio di ricerca (cerchio visuale e zoom automatico)
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
  }, [userCoords, searchRadius]);

  // 3. Aggiorna il marker di posizione quando cambiano le coordinate utente
  useEffect(() => {
    if (mapRef.current && userMarkerRef.current && userCoords) {
      userMarkerRef.current.setLatLng([userCoords.lat, userCoords.lng]);
      userMarkerRef.current.bindPopup(currentCityName || 'Punto di riferimento');
    }
  }, [userCoords, currentCityName]);

  // 4. Aggiorna i marker sulla mappa quando cambiano i filtri o la selezione dell'attività
  useEffect(() => {
    if (!mapRef.current || !markersGroupRef.current) return;

    // Rimuove i marker precedenti
    markersGroupRef.current.clearLayers();

    filteredActivities.forEach(act => {
      // Risoluzione dell'icona basata sul dizionario dinamico delle emoji
      const emoji = CATEGORY_EMOJIS[(act.category || '').toLowerCase()] || CATEGORY_EMOJIS.default;
      const isSelected = selectedActivity?.id === act.id;

      const customIcon = L.divIcon({
        className: `custom-marker ${isSelected ? 'active' : ''}`,
        html: `<span>${emoji}</span>`,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
        popupAnchor: [0, -22]
      });

      const marker = L.marker([act.lat, act.lng], { icon: customIcon });

      const isMobile = window.innerWidth <= 768;

      marker.bindTooltip(`
        <div style="text-align: center; font-family: 'Outfit', sans-serif;">
          <div style="font-weight: 700; font-size: 12px; color: #0f172a; max-width: 140px; white-space: normal; line-height: 1.2;">${act.name}</div>
          <div style="color: #64748b; font-size: 10px; margin-top: 2px; font-weight: 600;">${getCategoryLabel(act.category)}</div>
        </div>
      `, {
        direction: 'top',
        offset: [0, -20],
        className: 'custom-tooltip',
        permanent: isMobile,
        opacity: 0.95
      });
      
      marker.on('click', () => {
        setSelectedActivity(act);
        if (isMobile) {
          setSidebarOpen(false); // Chiudiamo la sidebar sinistra così si vede bene il panel destro
        }
      });

      markersGroupRef.current?.addLayer(marker);
    });

    // Se c'è un'attività selezionata, centrala fluidamente
    if (selectedActivity) {
      // Usa un offset visivo per desktop se necessario (opzionale), ma flyTo garantisce il pan corretto
      mapRef.current.flyTo([selectedActivity.lat, selectedActivity.lng], 15, { duration: 0.8 });
    }
  }, [filteredActivities, selectedActivity, setSelectedActivity, setSidebarOpen]);

  return (
    <main className="map-container" ref={mapContainerRef}>
      {gpsLoading && (
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          zIndex: 2000, 
          background: 'var(--bg-color)', 
          gap: '16px' 
        }}>
          <span style={{ fontSize: '32px', animation: 'float 2s infinite' }}>🎈</span>
          <div style={{ fontSize: '16px', fontWeight: 600 }}>Rilevamento posizione GPS...</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Consenti la geolocalizzazione o scrivi una località nel menu a sinistra.
          </div>
        </div>
      )}
    </main>
  );
}
