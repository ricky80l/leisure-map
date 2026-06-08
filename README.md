# 🎈 LeisureMap

Un'applicazione web interattiva stile Google Maps per scoprire e filtrare corsi e attività per il tempo libero.

## 🚀 Funzionalità

- 📍 **Geolocalizzazione GPS** automatica all'avvio
- 🌍 **Ricerca manuale** di qualsiasi città tramite OpenStreetMap
- 📏 **Raggio di ricerca** configurabile (1–15 km)
- ⚽ **Filtri avanzati**: sport/categoria, livello, target età, giorni, fascia oraria
- 🗺️ **Mappa interattiva** con marker personalizzati (Leaflet.js + OpenStreetMap)
- 📱 **Design responsivo** per mobile e desktop

## 🛠️ Tecnologie

- **React 18** + **TypeScript** + **Vite**
- **Leaflet.js** + **React-Leaflet** (mappa open source)
- **CartoDB Voyager** (tile map a colori)
- **OSM Nominatim** (geocoding gratuito)
- **Lucide React** (icone)
- **CSS puro** (glassmorphism, gradients, animazioni)

## ▶️ Come Avviare in Locale

```bash
# Installa le dipendenze
npm install --strict-ssl=false

# Avvia il server di sviluppo
npm run dev
```

Apri il browser su: [http://localhost:5173](http://localhost:5173)

## 📁 Struttura del Progetto

```
leisure-map/
├── src/
│   ├── App.tsx          # Componente principale (mappa + filtri + logica)
│   ├── index.css        # Stili globali (design colorato tempo libero)
│   ├── main.tsx         # Entry point
│   └── data/
│       └── mockActivities.ts  # Dati di esempio generati dinamicamente
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## ⚠️ Nota

I dati delle attività sono attualmente generati come **mock** (simulati) intorno alla posizione dell'utente. In futuro saranno collegati a un database reale (es. Supabase).
