# Leisure Map — Revisione post-rilascio v2 · Istruzioni per Gemini 3.1 Pro

**Destinatario:** Gemini 3.1 Pro in modalità agente (Gemini CLI / Gemini Code Assist), eseguito nel repository di Leisure Map.
**Nota per l'uso:** incollare un solo FIX alla volta insieme al blocco CONTESTO. Non incollare l'intero documento in un'unica richiesta: l'esecuzione monolitica tende a mescolare i fix e a rifattorizzare oltre il necessario. Se usi Gemini CLI, salva il blocco CONTESTO anche in `GEMINI.md` alla radice del repo così viene ricaricato ad ogni sessione.

---

## CONTESTO (includere in ogni sessione)

Sei un ingegnere frontend senior che lavora sul progetto **Leisure Map**: web app per scoprire attività per il tempo libero (outdoor, palestre, corsi) in Veneto, deployata su Vercel (leisure-map-zhso.vercel.app). La UI attuale rispetta già un design system definito ("outdoor editorial"): titoli in **Fraunces**, testo in **Inter**, palette con primario verde bosco `#0E7C66`, accento ambra `#F2A93B`, superficie `#FBFAF7`, testo `#1A2233`, pericolo `#B4433A`. Tutti i valori visivi provengono da CSS custom properties in un file di token: **non introdurre mai colori, raggi o spaziature hardcoded nei componenti**.

Regole vincolanti per ogni intervento:
1. Branch `fix/post-release-v2`; un commit per fix, messaggio `fix-N: descrizione`.
2. **Modifica solo i file necessari al fix richiesto.** Non rifattorizzare, rinominare o "migliorare" codice non pertinente, anche se noti problemi: segnalali a fine risposta in una sezione "Osservazioni", senza toccarli.
3. Non aggiungere dipendenze npm se non esplicitamente previsto dal fix.
4. Non inventare dati o campi: se un campo necessario non esiste nello schema, fermati e proponi la modifica di schema prima di implementare.
5. Prima di scrivere codice, elenca in 5-10 righe i file che intendi modificare e perché; poi procedi.
6. Al termine di ogni fix esegui i comandi di verifica indicati e riporta l'output reale (non presunto). Se la verifica fallisce, correggi prima di dichiarare concluso.
7. Lo stato dell'interfaccia condivisibile vive nella query string della URL (filtri, vista, mappa), mai in localStorage.

---

## FIX 1 — HTML servito vuoto (CRITICO — eseguire per primo)

**Problema verificato:** `curl -s https://leisure-map-zhso.vercel.app/` restituisce solo `<title>` e meta viewport. Niente meta description, Open Graph, `lang`, né contenuto. I motori di ricerca vedono una pagina vuota e i link condivisi non hanno anteprima.

**Compito in due parti.**

Parte A — subito, indipendente dallo stack:
1. Individua il file HTML radice (o il layout root se Next.js) e aggiungi: `<html lang="it">`; meta description «Leisure Map: scopri attività, corsi e palestre in Veneto. Outdoor, sport, natura e gusto vicino a te.»; Open Graph (`og:title`, `og:description`, `og:type=website`, `og:locale=it_IT`, `og:image`); `twitter:card=summary_large_image`.
2. Genera `public/og-default.png` 1200×630 via script Node (canvas o sharp): sfondo `#0E7C66`, wordmark "Leisure Map" bianco in serif, sottotitolo "Trova il tuo tempo libero in Veneto". Committa script e PNG.

Parte B — diagnosi e piano (non implementare in questo fix):
3. Determina se il progetto è una SPA (Vite/CRA) o Next.js con rendering interamente client. Scrivi l'esito in `MIGRATION_NOTES.md` con un piano sintetico per portare lista attività e contenuti statici a rendering server (route per scheda, `generateMetadata`, sitemap), lasciando la mappa come unica isola client. NON eseguire la migrazione ora.

**Verifica obbligatoria:** dopo il deploy preview, esegui e riporta l'output di:
`curl -s <preview-url> | grep -E 'og:|description|lang="it"'`
Atteso: tutti i tag presenti.

---

## FIX 2 — Illustrazioni card: mapping errato e monotonia

**Problema verificato da screenshot:** la card con badge TENNIS mostra l'illustrazione di una bicicletta; tutte le card PALESTRA condividono un'unica illustrazione molto scura, e file di 3+ card risultano identiche.

**Compito:**
1. Trova la logica che assegna l'illustrazione e correggila: chiave = **disciplina** (dal vocabolario controllato del progetto), fallback = categoria. Vietato mostrare un'illustrazione di disciplina diversa dal badge.
2. Crea SVG inline per disciplina, stile flat coerente con gli esistenti, colori solo dai token: tennis-padel, basket, sala pesi (sostituisce l'attuale), nuoto, arti marziali, danza, yoga-pilates, arrampicata, ciclismo (l'attuale bici, riservata a ciclismo/MTB), generico-outdoor.
3. Anti-monotonia: 3 varianti di sfondo (alba ambra / giorno verde chiaro / tramonto) scelte con hash deterministico dell'id attività — stessa card, stessa variante a ogni render. Non usare Math.random.
4. Leggibilità: il titolo bianco con gradiente inferiore deve mantenere contrasto ≥ 4.5:1 anche sulle varianti scure.

**Verifica:** rendering con ≥ 8 card fitness/corsi consecutive: zero incoerenze badge-illustrazione, mai due card adiacenti identiche. Allega elenco dei file SVG creati.

---

## FIX 3 — Badge "Verificato" incompleto

**Problema verificato:** il footer card mostra "Verificato · {nome struttura}", duplicando il nome già visibile. Manca la data di verifica.

**Compito:**
1. Nuovo formato: `✓ Verificato: {mese anno} · {tipo fonte}` (es. "✓ Verificato: giugno 2026 · sito ufficiale"). Enum tipi fonte: `sito ufficiale`, `piattaforma booking`, `OpenStreetMap`, `segnalazione diretta`.
2. Se i campi `verificato_il` / `fonte_tipo` non esistono nei dati: fermati, proponi la modifica di schema e il backfill (data = inserimento record; fonte = `sito ufficiale` se nota, altrimenti `OpenStreetMap`), attendi conferma nel piano, poi implementa.
3. Variante scaduta: `verificato_il` più vecchio di 6 mesi → testo colore `--danger`: `⏱ Ultima verifica: {mese anno} — in riverifica`.
4. Il nome della struttura non deve mai comparire nel footer.

**Verifica:** screenshot di una card normale e una con data forzata a >6 mesi; entrambe conformi al formato.

---

## FIX 4 — Distanza mancante nei metadati

**Problema verificato:** la riga metadati mostra struttura · prezzo · livello, senza la distanza dall'utente né la durata dei corsi.

**Compito:**
1. Implementa una funzione haversine pura (no librerie) tra posizione utente e struttura; primo elemento dei metadati: `6 km da te` (numero in grassetto, `font-variant-numeric: tabular-nums`; sotto 1 km arrotonda a 100 m).
2. Fallback senza permesso GPS: usa il centro mappa corrente ma cambia l'etichetta in "dal centro mappa" (mai "da te" se la posizione non è reale).
3. Corsi: aggiungi la durata lezione se presente nel dato.
4. La sezione "vicino a te" deve essere ordinata per distanza crescente; verifica ed eventualmente correggi l'ordinamento.

**Verifica:** con geolocalizzazione simulata attiva la prima card è la più vicina; con permesso negato l'etichetta cambia. Riporta i due screenshot.

---

## FIX 5 — Header mobile

**Problema verificato:** su mobile il logo va a capo su due righe e il campo ricerca è una pillola con testo troncato ("C"); l'header supera i 100px.

**Compito:**
1. Logo su una riga (`white-space: nowrap`, font ridotto sotto 480px).
2. Ricerca mobile: solo icona lente 44×44px che al tap espande un campo a tutta larghezza (o overlay). Nessun placeholder troncato.
3. Altezza header mobile 56-60px; toggle tema e avatar a 36px.
4. Ombra dell'header solo dopo scroll > 0.

**Verifica:** screenshot a 360px e 412px di larghezza: una riga di logo, header ≤ 60px.

---

## FIX 6 — Microcopy

**Problema verificato:** H1 "Vicino a Tua Posizione GPS": maiuscole distribuite all'inglese e gergo tecnico.

**Compito:**
1. Sostituisci con "Vicino a te" (GPS attivo) / "Nella zona della mappa" (fallback).
2. Normalizza tutte le stringhe UI: in italiano solo l'iniziale di frase è maiuscola; "436 attività trovate" → "436 attività".
3. Centralizza le stringhe in `src/i18n/it.ts` e importa da lì. Non tradurre, non riscrivere testi non citati: solo spostare e normalizzare le maiuscole.

**Verifica:** ricerca nei componenti di stringhe con Ogni Parola Maiuscola = zero occorrenze; tutte le stringhe importate dal modulo.

---

## FIX 7 — Densità lista mobile

**Problema verificato:** ~1,5 card visibili per schermata su 436 risultati.

**Compito:**
1. Su viewport ≤ 640px l'immagine card passa da 4:3 a 16:9.
2. Variante `compact` orizzontale (thumb 96px a sinistra, titolo e metadati a destra, badge come puntino colorato + testo) con toggle "Schede / Elenco" accanto al contatore; la scelta vive nella query string `?vista=elenco`.
3. Virtualizza la lista oltre 50 elementi (windowing implementato a mano o con una sola micro-dipendenza; motiva la scelta nel piano prima di installare).
4. Obiettivo: ≥ 3 risultati per schermata in vista compatta a 360×780.

**Verifica:** screenshot vista compatta a 360px con ≥ 3 card; scroll dei 436 elementi fluido (riporta se hai usato virtualizzazione manuale o libreria e perché).

---

## Ordine, rilascio, checklist

Ordine: FIX 1 → (2+3+4 insieme, stesso componente card) → (5+6) → 7.
Rilascio: deploy preview per gruppo di fix → screenshot prima/dopo → merge su main.

Checklist finale (spuntare con evidenza, non a memoria):
- [ ] Output `curl` con meta/OG presenti
- [ ] Zero incoerenze badge-illustrazione; card adiacenti mai identiche
- [ ] Badge "Verificato: mese anno · tipo fonte" ovunque, variante scaduta funzionante
- [ ] Distanza visibile, etichetta onesta senza GPS, ordinamento per vicinanza
- [ ] Header mobile ≤ 60px, logo su una riga
- [ ] Stringhe centralizzate e normalizzate
- [ ] ≥ 3 risultati/schermata in vista compatta
- [ ] `MIGRATION_NOTES.md` aggiornato con diagnosi SSR e piano (FIX 1 parte B)
