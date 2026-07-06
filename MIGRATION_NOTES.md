# Migration Notes & SSR Diagnosis (FIX 1)

## Diagnosi SSR / CSR
Attualmente l'applicazione carica le attività tramite il file JSON `src/data/activities.json` in modo asincrono (mock) o li importa staticamente (SSG) in alcune viste di dettaglio.
L'HTML iniziale della Home, come verificato tramite `curl`, contiene tutti i Meta Tag e Open Graph corretti (`og:url`, `og:image`, `canonical` parametrizzati con `NEXT_PUBLIC_SITE_URL`).
Tuttavia, il *markup* delle card `ActivityCard` NON viene renderizzato interamente sul server nel payload HTML, ma delegato al Client Side Rendering (CSR) dentro `HomeClient.tsx` (il browser idrata le liste tramite state `filteredActivities`).

### Conseguenze
- ✅ **TTFB (Time to First Byte) rapido** perché la shell HTML statica è leggera.
- ❌ **SEO Profonda**: I crawler che non eseguono Javascript non vedranno le singole attività nella Home (vedranno "0 attività trovate" iniziale). Fortunatamente le pagine di dettaglio singole sono esportate staticamente via `generateStaticParams`.
- ❌ **Bundle Size**: Il payload completo JSON viene accorpato nel bundle JS, appesantendo l'idratazione su dispositivi di fascia bassa.

## Piano a Lungo Termine
Per progetti futuri o scale-up a 10.000+ attività:
1. Sostituire il fetching basato su import/client con **React Server Components (RSC)** per `page.tsx`.
2. Eseguire il filter query params lato Server.
3. Passare al Client solo le attività vicine e filtrate, riducendo drasticamente il JSON idratato nel DOM.
4. Introdurre **ISR** (Incremental Static Regeneration) sulle card di dettaglio.
