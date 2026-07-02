import { useEffect, useRef, useCallback, useState } from "react";
import maplibregl, { Map as MLMap, LngLatBounds } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Activity, CATEGORY_EMOJIS } from "../../data/mockActivities";

const getMacroCategoria = (category?: string) => {
  const cat = (category || "").toLowerCase();
  if (cat === "acqua" || cat === "piscina") return "acqua";
  if (cat === "outdoor" || cat === "tennis" || cat === "calcio") return "outdoor";
  if (cat === "gusto") return "gusto";
  if (cat === "natura") return "natura";
  return "default";
};

// Convert Activity array to GeoJSON FeatureCollection
const convertToGeoJSON = (activities: Activity[]) => {
  return {
    type: "FeatureCollection" as const,
    features: activities.map(act => ({
      type: "Feature" as const,
      properties: {
        id: act.id,
        nome: act.name,
        categoria: act.category,
        macroCategoria: getMacroCategoria(act.category),
        iconKey: CATEGORY_EMOJIS[act.category?.toLowerCase()] ? act.category.toLowerCase() : "default",
        prezzo: act.price,
        livello: act.level,
        emoji: CATEGORY_EMOJIS[act.category?.toLowerCase()] || CATEGORY_EMOJIS.default,
        rating: 4.5
      },
      geometry: {
        type: "Point" as const,
        coordinates: [act.lng, act.lat]
      }
    }))
  };
};

interface ActivityMapProps {
  activities: Activity[];
  theme?: "light" | "dark";
  hoveredId?: string | null;
  selectedId?: string | null;
  initialCenter?: [number, number];
  initialZoom?: number;
  onMarkerClick?: (id: string) => void;
  onSearchArea?: (bounds: { west: number; south: number; east: number; north: number; }) => void;
  onViewChange?: (center: [number, number], zoom: number) => void;
  onEmptyMapClick?: (lng: number, lat: number) => void;
}

const getMacroColor = (macroCat: string) => {
  if (macroCat === "acqua") return "#2673A6";
  if (macroCat === "outdoor") return "#0E7C66";
  if (macroCat === "gusto") return "#A6572E";
  if (macroCat === "natura") return "#5B8C3E";
  return "#7A4E9E";
};

const loadPinImages = async (map: MLMap) => {
  const promises = Object.entries(CATEGORY_EMOJIS).map(([catKey, emoji]) => new Promise<void>((resolve) => {
    const macroCat = getMacroCategoria(catKey);
    const color = getMacroColor(macroCat);
    
    // Create an SVG pin with the specific emoji in the center
    const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="46" height="58" viewBox="-23 -55 46 58">
      <path d="M0 0 C-15 -22 -15 -40 0 -44 C15 -40 15 -22 0 0 Z" fill="${color}" stroke="#fff" stroke-width="2.5" transform="scale(1.15)"/>
      <text x="0" y="-31" font-family="sans-serif" font-size="18" text-anchor="middle" dominant-baseline="central">${emoji}</text>
    </svg>`;
    const dataUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgStr);
    
    const img = new Image(46, 58);
    img.onload = () => {
      if (!map.hasImage(`pin-${catKey}`)) {
        map.addImage(`pin-${catKey}`, img);
      }
      resolve();
    };
    img.onerror = () => {
      resolve();
    };
    img.src = dataUrl;
  }));
  await Promise.all(promises);
};

const STYLE_URLS = {
  light: "https://tiles.openfreemap.org/styles/liberty",
  dark: "https://tiles.openfreemap.org/styles/dark",
};

const DEFAULT_CENTER: [number, number] = [12.04, 45.775]; // Montebelluna
const DEFAULT_ZOOM = 10;

export default function ActivityMap({
  activities,
  theme = "light",
  hoveredId = null,
  selectedId = null,
  initialCenter = DEFAULT_CENTER,
  initialZoom = DEFAULT_ZOOM,
  onMarkerClick,
  onSearchArea,
  onViewChange,
  onEmptyMapClick,
}: ActivityMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const initialBounds = useRef<LngLatBounds | null>(null);
  const [showSearchArea, setShowSearchArea] = useState(false);

  const onMarkerClickRef = useRef(onMarkerClick);
  const onEmptyMapClickRef = useRef(onEmptyMapClick);
  const onViewChangeRef = useRef(onViewChange);

  useEffect(() => {
    onMarkerClickRef.current = onMarkerClick;
    onEmptyMapClickRef.current = onEmptyMapClick;
    onViewChangeRef.current = onViewChange;
  }, [onMarkerClick, onEmptyMapClick, onViewChange]);

  // Init
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URLS[theme],
      center: initialCenter,
      zoom: initialZoom,
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: false },
        trackUserLocation: false,
      }),
      "bottom-right"
    );

    map.on("load", async () => {
      await loadPinImages(map);
      
      const data = convertToGeoJSON(activities);
      
      map.addSource("attivita", {
        type: "geojson",
        data,
        promoteId: "id",
        cluster: true,
        clusterMaxZoom: 13,
        clusterRadius: 55,
      });

      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "attivita",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#0E7C66",
          "circle-stroke-color": "#FBFAF7",
          "circle-stroke-width": 3,
          "circle-radius": ["step", ["get", "point_count"], 16, 10, 20, 30, 25],
        },
      });
      
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "attivita",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-size": 13,
          "text-font": ["Noto Sans Bold"],
        },
        paint: { "text-color": "#FFFFFF" },
      });

      map.addLayer({
        id: "punti-selected-bg",
        type: "circle",
        source: "attivita",
        filter: ["==", ["get", "id"], ""],
        paint: {
          "circle-radius": 32,
          "circle-color": "rgba(255, 215, 0, 0.4)",
          "circle-blur": 0.4,
          "circle-stroke-color": "#FFD700",
          "circle-stroke-width": 3,
        },
      });

      map.addLayer({
        id: "punti",
        type: "symbol",
        source: "attivita",
        filter: ["!", ["has", "point_count"]],
        layout: {
          "icon-image": ["concat", "pin-", ["get", "iconKey"]],
          "icon-size": 1.0,
          "icon-allow-overlap": true,
          "icon-anchor": "bottom",
          "symbol-sort-key": 1
        }
      });

      initialBounds.current = map.getBounds();

      map.on("click", "clusters", async (e) => {
        const feature = map.queryRenderedFeatures(e.point, { layers: ["clusters"] })[0];
        const clusterId = feature.properties?.cluster_id;
        const src = map.getSource("attivita") as maplibregl.GeoJSONSource;
        const zoom = await src.getClusterExpansionZoom(clusterId);
        map.easeTo({
          center: (feature.geometry as GeoJSON.Point).coordinates as [number, number],
          zoom,
        });
      });

      map.on("click", "punti", (e) => {
        const id = e.features?.[0]?.properties?.id;
        if (id && onMarkerClickRef.current) onMarkerClickRef.current(String(id));
      });

      map.on("click", (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ["clusters", "punti"] });
        if (features.length === 0) {
          if (onEmptyMapClickRef.current) onEmptyMapClickRef.current(e.lngLat.lng, e.lngLat.lat);
        }
      });

      for (const layer of ["clusters", "punti"]) {
        map.on("mouseenter", layer, () => (map.getCanvas().style.cursor = "pointer"));
        map.on("mouseleave", layer, () => (map.getCanvas().style.cursor = ""));
      }

      map.on("moveend", () => {
        const c = map.getCenter();
        onViewChangeRef.current?.([c.lng, c.lat], map.getZoom());
        if (initialBounds.current) {
          const moved =
            !initialBounds.current.contains(map.getCenter()) ||
            Math.abs(map.getZoom() - initialZoom) > 0.7;
          setShowSearchArea(moved);
        }
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []); // Run only once

  // Aggiornamento dati (nuovi filtri)
  useEffect(() => {
    const map = mapRef.current;
    const src = map?.getSource("attivita") as maplibregl.GeoJSONSource | undefined;
    if (src) {
      src.setData(convertToGeoJSON(activities) as any);
    }
  }, [activities]);

  // Cambio tema
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    map.setStyle(STYLE_URLS[theme], { diff: false });
  }, [theme]);

  // Sync hover/selected dalla lista
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getSource("attivita") || !map.getLayer("punti")) return;
    
    map.setLayoutProperty("punti", "icon-size", [
      "case",
      ["==", ["get", "id"], selectedId || ""], 1.45,
      ["==", ["get", "id"], hoveredId || ""], 1.25,
      1.0
    ]);

    map.setLayoutProperty("punti", "symbol-sort-key", [
      "case",
      ["==", ["get", "id"], selectedId || ""], 10,
      ["==", ["get", "id"], hoveredId || ""], 5,
      1
    ]);

    if (map.getLayer("punti-selected-bg")) {
      map.setFilter("punti-selected-bg", ["==", ["get", "id"], selectedId || ""]);
    }
  }, [hoveredId, selectedId]);

  // Pan to selected marker
  const lastPannedId = useRef<string | null>(null);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;

    if (lastPannedId.current === selectedId) return; // already panned

    const act = activities.find(a => a.id === selectedId);
    if (act) {
      map.easeTo({
        center: [act.lng, act.lat],
        zoom: Math.max(map.getZoom(), 14.5),
        duration: 800
      });
      lastPannedId.current = selectedId;
    }
  }, [selectedId, activities]);

  const handleSearchArea = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const b = map.getBounds();
    onSearchArea?.({
      west: b.getWest(), south: b.getSouth(),
      east: b.getEast(), north: b.getNorth(),
    });
    initialBounds.current = b;
    setShowSearchArea(false);
  }, [onSearchArea]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={containerRef} style={{ position: "absolute", inset: 0 }} aria-label="Mappa delle attività" />
      {showSearchArea && (
        <button
          onClick={handleSearchArea}
          className="searcharea"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/></svg>
          Cerca in quest'area
        </button>
      )}
    </div>
  );
}
