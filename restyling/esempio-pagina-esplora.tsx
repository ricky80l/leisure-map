"use client";

/**
 * Esempio di integrazione di ActivityMap in una pagina "Esplora" (Next.js App Router).
 * Mostra: dynamic import, sync hover lista->mappa, click marker->lista,
 * stato filtri/vista nella query string.
 */

import dynamic from "next/dynamic";
import { useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ActivityFeatureCollection } from "@/components/map/ActivityMap";
import rawData from "@/data/attivita.geojson"; // configurare il loader JSON, o fetch da /data/attivita.geojson

const ActivityMap = dynamic(() => import("@/components/map/ActivityMap"), {
  ssr: false,
  loading: () => (
    <div
      style={{ width: "100%", height: "100%", background: "#EAF0E4" }}
      aria-label="Caricamento mappa"
    />
  ),
});

export default function EsploraPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const data = rawData as unknown as ActivityFeatureCollection;

  // Vista iniziale ripristinata dalla URL (condivisibilità)
  const initialCenter = useMemo<[number, number]>(() => {
    const c = params.get("c")?.split(",").map(Number);
    return c && c.length === 2 && c.every(Number.isFinite)
      ? [c[0], c[1]]
      : [12.04, 45.775];
  }, [params]);
  const initialZoom = Number(params.get("z")) || 10;

  const handleViewChange = useCallback(
    (center: [number, number], zoom: number) => {
      const p = new URLSearchParams(params.toString());
      p.set("c", `${center[0].toFixed(4)},${center[1].toFixed(4)}`);
      p.set("z", zoom.toFixed(1));
      router.replace(`?${p.toString()}`, { scroll: false });
    },
    [params, router]
  );

  const handleSearchArea = useCallback(
    (b: { west: number; south: number; east: number; north: number }) => {
      // Qui: rifetch/filtro delle attività dentro il bounding box b
      console.log("Nuova ricerca nel bbox:", b);
    },
    []
  );

  return (
    <main style={{ display: "grid", gridTemplateColumns: "42% 58%", height: "calc(100vh - 121px)" }}>
      <section style={{ overflowY: "auto", padding: 20 }} aria-label="Risultati">
        {data.features.map((f) => (
          <article
            key={f.properties.id}
            tabIndex={0}
            onMouseEnter={() => setHoveredId(f.properties.id)}
            onMouseLeave={() => setHoveredId(null)}
            onFocus={() => setHoveredId(f.properties.id)}
            onBlur={() => setHoveredId(null)}
            onClick={() => setSelectedId(f.properties.id)}
            style={{
              padding: 14, marginBottom: 12, borderRadius: 12,
              background: selectedId === f.properties.id ? "#EAF3F0" : "#fff",
              boxShadow: "0 2px 8px rgba(26,34,51,.08)", cursor: "pointer",
            }}
          >
            <strong>{f.properties.nome}</strong>
            <div style={{ fontSize: 13, color: "#5A6472" }}>
              {f.properties.categoria} · {f.properties.prezzo} · ★ {f.properties.rating}
            </div>
          </article>
        ))}
      </section>

      <section aria-label="Mappa">
        <ActivityMap
          data={data}
          hoveredId={hoveredId}
          initialCenter={initialCenter}
          initialZoom={initialZoom}
          onMarkerClick={(id) => {
            setSelectedId(id);
            document.getElementById(`card-${id}`)?.scrollIntoView({ behavior: "smooth" });
          }}
          onSearchArea={handleSearchArea}
          onViewChange={handleViewChange}
        />
      </section>
    </main>
  );
}
