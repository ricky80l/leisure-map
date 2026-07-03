# Piano di Migrazione a Server-Side Rendering (Next.js)

## 1. Analisi dello Stato Attuale
Attualmente, **Leisure Map è una Single Page Application (SPA) basata su Vite e React Router**.
Tutto il rendering avviene **interamente lato client**. Questo significa che il browser scarica un file `index.html` pressoché vuoto (con soli meta tag generici) e demanda l'intero rendering del contenuto (mappa, lista attività, filtri) all'esecuzione del bundle JavaScript.
Sebbene ottimale per interazioni ricche, questo approccio penalizza pesantemente la SEO: i motori di ricerca fanno fatica a indicizzare le singole attività e non c'è possibilità di avere meta tag dinamici per ogni specifica palestra o corso quando condivisi sui social.

## 2. Obiettivo della Migrazione
L'obiettivo è migrare l'architettura verso **Next.js (App Router)** per sfruttare il Server-Side Rendering (SSR) e la Static Site Generation (SSG).
Questo permetterà di pre-renderizzare sul server la lista delle attività e le singole schede, massimizzando l'indicizzazione e le performance SEO, mantenendo però la mappa interattiva come "isola client" (Client Component).

## 3. Piano di Migrazione Sintetico

### Fase 1: Setup di Next.js e Porting dell'Architettura
- Inizializzare un nuovo progetto Next.js con App Router (`app/` directory).
- Spostare le dipendenze e i componenti UI dall'attuale progetto Vite al nuovo.
- Rimuovere `react-router-dom` in favore del file-system routing di Next.js.
- Sostituire l'attuale `index.html` con il layout di root `app/layout.tsx`.

### Fase 2: Rendering Lato Server (Lista e Contenuti)
- **Home Page (`app/page.tsx`)**: Verrà resa un **Server Component**. La chiamata al database Supabase (o lettura locale) per ottenere le attività verrà fatta direttamente sul server. Il server restituirà l'HTML già compilato della lista delle attività.
- **Isola Client per la Mappa**: Il componente `ActivityMap` diventerà un **Client Component** (dichiarato con `"use client"` in cima al file). Questo riceverà le attività come *props* dal Server Component padre, isolando la logica di Mapbox, lo stato dell'utente e i filtri lato client, garantendo massima interattività.

### Fase 3: Pagine Dettaglio Dinamiche e SEO
- **Dynamic Routes**: Creare la rotta dinamica `app/activity/[id]/page.tsx`. Questa pagina (anch'essa Server Component) renderizzerà i dettagli della singola attività prima di inviarli al browser.
- **generateMetadata()**: In `app/activity/[id]/page.tsx`, implementare la funzione `generateMetadata` fornita da Next.js. Questo permetterà di generare in modo dinamico i tag `title`, `meta description` e le *Open Graph Cards* (inclusa la `og:image`) specifiche per quella particolare attività (es: "Corsi di Yoga a Padova", invece del generico "Leisure Map").

### Fase 4: Sitemap e Indicizzazione
- Sfruttare la funzione integrata `app/sitemap.ts` di Next.js per generare un file `sitemap.xml` dinamico.
- Questo file mapperà automaticamente l'URL principale e ciclerà l'intero database delle attività per generare URL puntuali per ogni singola entità (es: `/activity/officina-del-movimento`), rendendoli facilmente esplorabili dai crawler di Google.

---
**Nota:** Come concordato, questo documento rappresenta unicamente un'analisi e una pianificazione. *La migrazione non è stata ancora avviata.*
