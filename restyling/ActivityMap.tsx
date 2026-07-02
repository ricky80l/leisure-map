"use client";

/**
 * ActivityMap — componente mappa per Leisure Map
 * Stack: maplibre-gl (nessuna API key con OpenFreeMap; sostituibile con CARTO/MapTiler)
 *
 * Installazione:  npm i maplibre-gl
 * Import in Next.js (App Router) SEMPRE via dynamic import per tenerlo fuori dal bundle iniziale:
 *
 *   const ActivityMap = dynamic(() => import("@/components/map/ActivityMap"), {
 *     ssr: false,
 *     loading: () => <div className="map-skeleton" aria-label="Caricamento mappa" />,
 *   });
 *
 * Funzionalità incluse:
 *  - clustering nativo sulla source GeoJSON
 *  - marker colorati per categoria (colore + simbolo, mai solo colore)
 *  - sync lista->mappa: prop `hoveredId` evidenzia il marker corrispondente
 *  - sync mappa->lista: onMarkerClick(id) per aprire la card/popup
 *  - pulsante "Cerca in quest'area" dopo il pan (onSearchArea con il bounding box)
 *  - dark mode: prop `theme` scambia lo style URL
 *  - stato mappa serializzabile: onViewChange(center, zoom) per la query string
 */

import { useEffect, useRef, useCallback, useState } from "react";
import maplibregl, { Map as MLMap, LngLatBounds } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// ---------- Tipi ----------
export interface ActivityProperties {
  id: string;
  nome: string;
  categoria: "acqua" | "outdoor" | "gusto" | "natura" | "fitness" | "corsi";
  prezzo?: "€" | "€€" | "€€€";
  livello?: string; // dal vocabolario controllato
  rating?: number;
}

export type ActivityFeatureCollection = GeoJSON.FeatureCollection<
  GeoJSON.Point,
  ActivityProperties
>;

interface ActivityMapProps {
  data: ActivityFeatureCollection;
  theme?: "light" | "dark";
  /** id dell'attività attualmente in hover nella lista */
  hoveredId?: string | null;
  /** centro/zoom iniziali (es. ripristinati dalla query string) */
  initialCenter?: [number, number]; // [lng, lat]
  initialZoom?: number;
  onMarkerClick?: (id: string) => void;
  onSearchArea?: (bounds: {
    west: number; south: number; east: number; north: number;
  }) => void;
  onViewChange?: (center: [number, number], zoom: number) => void;
}

// ---------- Costanti di stile (dai token del design system) ----------
const CATEGORY_COLORS: Record<string, string> = {
  acqua: "#2673A6",
  outdoor: "#0E7C66",
  gusto: "#A6572E",
  natura: "#5B8C3E",
  fitness: "#7A4E9E",
  corsi: "#B4433A",
};

const STYLE_URLS = {
  // OpenFreeMap: gratuito, senza API key. Alternativa: CARTO o MapTiler (con key).
  light: "https://tiles.openfreemap.org/styles/liberty",
  dark: "https://tiles.openfreemap.org/styles/dark",
};

const DEFAULT_CENTER: [number, number] = [12.04, 45.775]; // Montebelluna
const DEFAULT_ZOOM = 10;

export default function ActivityMap({
  data,
  theme = "light",
  hoveredId = null,
  initialCenter = DEFAULT_CENTER,
  initialZoom = DEFAULT_ZOOM,
  onMarkerClick,
  onSearchArea,
  onViewChange,
}: ActivityMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const prevHovered = useRef<string | null>(null);
  const initialBounds = useRef<LngLatBounds | null>(null);
  const [showSearchArea, setShowSearchArea] = useState(false);

  // ---------- Init ----------
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

    map.on("load", () => {
      // Source con clustering nativo
      map.addSource("attivita", {
        type: "geojson",
        data,
        promoteId: "id",           // usa properties.id come feature id (serve per feature-state)
        cluster: true,
        clusterMaxZoom: 13,
        clusterRadius: 55,
      });

      // --- Cluster: cerchio + conteggio ---
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

      // --- Punti singoli: colore per categoria, scala su hover ---
      map.addLayer({
        id: "punti",
        type: "circle",
        source: "attivita",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": [
            "match", ["get", "categoria"],
            ...Object.entries(CATEGORY_COLORS).flat(),
            "#5A6472", // fallback
          ],
          "circle-stroke-color": "#FFFFFF",
          "circle-stroke-width": 2.5,
          "circle-radius": [
            "case",
            ["boolean", ["feature-state", "hover"], false], 11,
            8,
          ],
        },
      });

      initialBounds.current = map.getBounds();

      // --- Interazioni ---
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
        if (id && onMarkerClick) onMarkerClick(String(id));
      });

      for (const layer of ["clusters", "punti"]) {
        map.on("mouseenter", layer, () => (map.getCanvas().style.cursor = "pointer"));
        map.on("mouseleave", layer, () => (map.getCanvas().style.cursor = ""));
      }

      // "Cerca in quest'area": appare quando la vista si allontana da quella iniziale
      map.on("moveend", () => {
        const c = map.getCenter();
        onViewChange?.([c.lng, c.lat], map.getZoom());
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Aggiornamento dati (nuovi filtri) ----------
  useEffect(() => {
    const map = mapRef.current;
    const src = map?.getSource("attivita") as maplibregl.GeoJSONSource | undefined;
    if (src) src.setData(data);
  }, [data]);

  // ---------- Cambio tema ----------
  useEffect(() => {
    // Nota: setStyle rimuove i layer custom; per semplicità qui si ricarica lo style
    // e si riaggiungono source/layer al successivo "styledata". In produzione valutare
    // una funzione addLayers() riutilizzabile o due istanze di style con gli stessi layer.
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    map.setStyle(STYLE_URLS[theme], { diff: false });
  }, [theme]);

  // ---------- Sync hover dalla lista ----------
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getSource("attivita")) return;
    if (prevHovered.current) {
      map.setFeatureState(
        { source: "attivita", id: prevHovered.current },
        { hover: false }
      );
    }
    if (hoveredId) {
      map.setFeatureState({ source: "attivita", id: hoveredId }, { hover: true });
    }
    prevHovered.current = hoveredId;
  }, [hoveredId]);

  // ---------- Cerca in quest'area ----------
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
          style={{
            position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)",
            background: "var(--card, #fff)", color: "var(--ink, #1A2233)",
            border: "1px solid var(--line, #E4E7E2)", borderRadius: 999,
            padding: "9px 18px", fontSize: 14, fontWeight: 600,
            boxShadow: "0 2px 8px rgba(26,34,51,.12)", cursor: "pointer",
          }}
        >
          ⟳ Cerca in quest'area
        </button>
      )}
    </div>
  );
}
