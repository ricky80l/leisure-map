# LEISURE MAP — Piano Operativo per Antigravity (Gemini 3.1 Pro)

**Data:** Luglio 2026
**Progetto:** Leisure Map — https://leisure-map.vercel.app/
**Agente:** Antigravity con Gemini 3.1 Pro
**Modalità:** Agent mode con browser subagent attivo (necessario per audit visivo)

---

## ⚠️ REGOLE GLOBALI (leggere prima di ogni fase)

1. **Un branch per fase**: `fix/fase-N-descrizione`. Mai lavorare su `main`.
2. **STOP obbligatorio a fine fase**: presentare report + screenshot, attendere approvazione umana esplicita prima di procedere. Non concatenare fasi.
3. **Non toccare** la pipeline di ingestione dati trimestrale né gli adapter delle piattaforme di booking. Se una modifica la impatta, fermarsi e chiedere.
4. **Ogni fix deve avere verifica**: comando o screenshot che dimostra il prima/dopo.
5. **Vincolo noto**: l'investimento SEO pesante (Fase 5) è subordinato al dominio custom. I fix tecnici SEO (Fasi 1–2) vanno fatti comunque perché sono prerequisiti indipendenti dal dominio.
6. Commit atomici con messaggi in inglese, formato `fix:`, `feat:`, `chore:`.

---

## FASE 0 — Ricognizione e Audit Visivo

**Obiettivo:** fotografare lo stato reale del sito prima di toccare qualsiasi cosa.

### 0.1 Ricognizione codice
- Clonare/aprire il repo. Identificare e riportare: framework (Vite SPA? Next? React Router?), versioni, struttura routing, dove sono definiti i meta tag, config Vercel (`vercel.json`), presenza di `robots.txt` e `sitemap.xml` in `public/`.
- Eseguire `npm run build` e riportare warning, dimensione dei bundle, chunk principali.

### 0.2 Verifica server-side (il punto critico)
```bash
curl -s https://leisure-map.vercel.app/ | head -100
```
- Confermare che il body contiene solo il div root vuoto con "Caricamento app...".
- Verificare cosa rispondono le rotte interne (es. pagina di dettaglio corso, pagina provincia) via curl: probabilmente lo stesso shell vuoto.
- Verificare esistenza e risposta di `/robots.txt`, `/sitemap.xml`, `/og-default.png` **su entrambi i domini** (`leisure-map.vercel.app` e `leisure-map-zhso.vercel.app`).

### 0.3 Audit visivo con browser subagent
Navigare il sito reale e produrre screenshot per ciascuno di questi punti:
- Homepage: desktop 1440px, tablet 768px, mobile 375px.
- Barra di ricerca unificata: testare match palestre locali + geocoding Photon con query reali ("padova", "yoga treviso", "montebelluna"). Riportare comportamento, latenza percepita, gestione risultati vuoti.
- Mappa: pan/zoom, click sui marker, popup, comportamento con molti marker ravvicinati (clustering presente?).
- Pagina dettaglio di 3 corsi diversi: completezza dati, link rotti, immagini mancanti.
- Stati limite: ricerca senza risultati, connessione lenta (throttling), JS disabilitato (cosa vede l'utente? probabilmente solo "Caricamento app...").
- Console browser: elencare TUTTI gli errori e warning (inclusi errori di hydration, richieste 404, CORS).
- Lighthouse (mobile): Performance, Accessibility, Best Practices, SEO. Salvare i punteggi come baseline.

### 0.4 Deliverable
Report `AUDIT-FASE0.md` con: stack rilevato, elenco bug ordinato per gravità (Critico / Alto / Medio / Basso), screenshot, punteggi Lighthouse baseline.

**🛑 CHECKPOINT UMANO — attendere approvazione e priorizzazione dei bug trovati.**

---

## FASE 1 — Quick Wins: Meta Tag, Domini, Canonical

**Obiettivo:** fix a basso rischio e alto impatto, senza toccare l'architettura.

### 1.1 Bug mismatch dominio (CONFERMATO dall'analisi preliminare)
`og:url`, `og:image` e `twitter:image` puntano a `leisure-map-zhso.vercel.app` invece del dominio di produzione `leisure-map.vercel.app`.
- Sostituire tutti gli URL hardcoded con una variabile d'ambiente `VITE_SITE_URL` (o equivalente per il framework rilevato), valorizzata in Vercel.
- **Nota per il futuro**: quando arriverà il dominio custom, basterà cambiare la env var.

### 1.2 Deduplicazione domini Vercel
- Aggiungere redirect 301 da `leisure-map-zhso.vercel.app` verso il dominio di produzione (via `vercel.json` redirects o impostazioni progetto Vercel). Se non possibile a livello progetto, documentare la limitazione e proporre alternativa (meta canonical è il minimo).

### 1.3 Canonical + robots + sitemap
- Aggiungere `<link rel="canonical">` (per ora statico sull'homepage; diventerà per-rotta in Fase 2).
- Creare/verificare `robots.txt` con riferimento alla sitemap.
- Generare `sitemap.xml` statica con le rotte principali. **Vincolo**: la struttura URL deve essere compatibile con il refresh dati trimestrale — nessun URL basato su ID volatili; usare slug stabili.

### 1.4 Noscript e fallback
- Aggiungere `<noscript>` con testo descrittivo del servizio e link testuali alle sezioni principali (utile anche ai crawler più limitati).
- Migliorare il fallback "Caricamento app..." con uno skeleton/spinner brandizzato.

### Verifica
- `curl` sui meta tag: tutti gli URL devono puntare al dominio di produzione.
- Test anteprima social con browser subagent su opengraph.xyz o metatags.io.
- Screenshot prima/dopo del fallback di caricamento.

**🛑 CHECKPOINT UMANO.**

---

## FASE 2 — Contenuto Server-Side (il fix strutturale)

**Obiettivo:** i crawler devono ricevere HTML con contenuto reale. È il blocco n.1 di qualsiasi SEO.

### 2.1 Decisione architetturale (proporre, non decidere da soli)
In base allo stack rilevato in Fase 0, presentare all'umano una tabella con 2–3 opzioni, effort e rischi. Opzioni tipiche:
- **A. Prerendering statico (SSG)** delle rotte note al build time (es. `vite-plugin-prerender` o build script custom): basso rischio, ottimo per pagine provincia/categoria; le pagine di dettaglio corso vengono generate a ogni deploy dal dataset. Compatibile con la pipeline trimestrale (ogni refresh dati → rebuild → nuove pagine).
- **B. Migrazione a Next.js (o framework SSR equivalente)**: più potente ma invasiva. Da valutare solo se A si rivela insufficiente.
- **C. Prerendering on-demand per soli bot** (rendering dinamico): sconsigliato come soluzione di lungo periodo, documentare perché.

**🛑 MINI-CHECKPOINT: attendere scelta dell'opzione prima di implementare.**

### 2.2 Implementazione (assumendo opzione A)
- Prerender di: homepage, pagine provincia (Padova, Treviso), pagine categoria, pagine dettaglio corso/palestra.
- Meta tag per-rotta: title, description, canonical, og:* unici per ogni pagina (title formato `{Nome corso} a {Comune} | Leisure Map`).
- JSON-LD: `LocalBusiness`/`SportsActivityLocation` per palestre, `Course`/`Event` dove pertinente, `BreadcrumbList` per la navigazione.
- La generazione delle rotte deve leggere dal dataset corrente: agganciarla allo stesso trigger del refresh trimestrale.

### Verifica
- `curl` su 5 rotte campione: l'HTML deve contenere h1, testo reale e JSON-LD.
- Validare JSON-LD con il validatore Schema.org via browser subagent.
- Lighthouse SEO: confronto con baseline Fase 0.

**🛑 CHECKPOINT UMANO.**

---

## FASE 3 — Fix Bug UI/UX dall'Audit

**Obiettivo:** correggere i bug Critici e Alti emersi in Fase 0.3.

Nota: l'elenco esatto dipende dal report Fase 0. Aree attese, da verificare:
- Errori console (hydration, 404 su asset, promise non gestite).
- Barra di ricerca unificata: debounce sulle chiamate Photon, gestione "nessun risultato", indicatore di caricamento, chiusura dropdown su click esterno/ESC, navigazione da tastiera (frecce + invio).
- Mappa: clustering marker se assente, focus/zoom corretto dopo ricerca, comportamento touch su mobile.
- Stati vuoti ed errore: messaggi utili invece di schermate bianche.
- Accessibilità di base: contrasti, alt text, label sugli input, ordine di focus (guidarsi con il punteggio Accessibility di Lighthouse).

Ogni bug → un commit → uno screenshot prima/dopo nel report di fase.

**🛑 CHECKPOINT UMANO.**

---

## FASE 4 — Performance

**Obiettivo:** migliorare i punteggi Lighthouse mobile rispetto alla baseline.

- Code splitting: la libreria mappa (Leaflet/MapLibre) caricata lazy, solo quando la mappa entra in viewport.
- Immagini: formati moderni (WebP/AVIF), `loading="lazy"`, dimensioni esplicite per evitare CLS.
- Font: `font-display: swap`, preload dei font critici.
- Analisi bundle: rimuovere dipendenze pesanti non necessarie (riportare le 5 più pesanti con proposta).
- Cache headers su asset statici via `vercel.json`.

### Verifica
Lighthouse mobile prima/dopo. Target indicativo: Performance ≥ 85, SEO ≥ 95, Accessibility ≥ 90. Se un target non è raggiungibile senza interventi invasivi, documentare il perché e fermarsi.

**🛑 CHECKPOINT UMANO.**

---

## FASE 5 — Ampliamenti (solo dopo approvazione esplicita)

Proposte da validare con l'umano, in ordine di valore stimato:

1. **Pagine indice per SEO locale**: pagina per ogni combinazione comune × categoria ("Corsi di yoga a Montebelluna") generate dal dataset — solo dove esistono risultati reali, per evitare thin content. ⚠️ Prerequisito: dominio custom attivo.
2. **Filtri avanzati**: fascia oraria, fascia prezzo, distanza dal punto cercato.
3. **Condivisione**: URL che preservano lo stato di ricerca/filtri (query params), così i link condivisi riproducono la vista.
4. **"Vicino a me"**: geolocalizzazione browser con fallback elegante se negata.
5. **Sitemap dinamica**: rigenerata automaticamente a ogni refresh trimestrale dei dati.
6. **Analytics privacy-friendly** (es. Plausible/Umami) per capire le ricerche reali degli utenti — dato prezioso per la validazione del prodotto.

Per ciascun ampliamento scelto: mini-spec → approvazione → implementazione → verifica browser → checkpoint.

---

## FORMATO REPORT DI FINE FASE

```
## Report Fase N
- Obiettivo: ...
- Fatto: [elenco commit con hash]
- Verifiche: [comandi eseguiti + esito, screenshot allegati]
- Non fatto / rimandato: [con motivazione]
- Rischi aperti: ...
- Prossimo passo proposto: ...
IN ATTESA DI APPROVAZIONE UMANA.
```
