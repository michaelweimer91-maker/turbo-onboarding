# Best Prime Turbo-Onboarding

Installierbare Web-App (PWA): neue Vertriebspartner in 48 Stunden ins Verständnis und in die Aktivität bringen.
Abgeleitet aus dem FastTrack (michaelweimer91-maker/fasttrack), deutlich kürzer: 4 Phasen, 10 Schritte.
Live (nach Aktivierung von GitHub Pages): https://michaelweimer91-maker.github.io/turbo-onboarding/

## Aufbau
- `src/app_head.html` – Titel + komplettes CSS + Root-Container
- `src/app.js` – gesamte App-Logik (Vanilla JS, kein Optional Chaining – iOS-Safari-kompatibel)
- `src/i18n/de.js` – alle Texte. **de.js ist die Referenz.** Weitere Sprachen (en/it/hr/pl/tr) als eigene Datei mit exakt derselben Struktur anlegen – build.py bindet jede vorhandene Datei automatisch ein, die Sprachauswahl erscheint ab 2 Sprachen.
- `build.py` – baut `index.html` aus src/. **Nach jeder Änderung in src/ ausführen** und index.html mit committen.
- `config.js` – Sync-URL + Token + `videoUrl`/`videoFormat` ("16:9"|"9:16")/`videoLength` (Startvideo auf Startseite und im Schritt 1; YouTube/Vimeo-Link oder MP4 im Repo, leer = kein Video). YouTube lädt erst nach Klick (DSGVO, youtube-nocookie).
- `sw.js` – Offline-Cache, network-first.
- `gas/Turbo.gs` – Zusatzdatei für das Apps Script der bestehenden Tabelle „FastTrack Controlling – Best Prime“. Schreibt ins Blatt **„Turbo“**. Einrichtung: siehe ANLEITUNG.md.

## Testversion (`test.html`)
- `build.py` erzeugt zusätzlich `test.html`: gleiche App + `window.TURBO_TEST=true` → eigener Speicher `bp_turbo_test_v1`, **kein Controlling-Sync**, Banner „TESTVERSION“, noindex.
- Neue Funktionen nur über `TEST` in app.js schalten; Texte im Block `I18N.de.test` (de.js): `over` (Überschreibungen), `scriptsAdd` (Vorlagen hinten anhängen), `easy` (Einsteiger-Tempo).
- Aktuell im Test: Tempo-Wahl Turbo 48 h (30/10/5) vs. Einsteiger 7 Tage (10/5/3) über `P()`, „Kopiert ≠ Gesendet“ (Button „✓ Gesendet“), „Woran hängt es?“ unter jedem offenen Schritt, „Nächste Aktion mit Datum“ im Abschluss, ePAY-Formulierung „geplant / gemäß offiziellem Produktstatus“, zwei Einwand-Vorlagen, „Ehrliche Grenze“ im Gespräch.
- Übernahme in Live: Funktion aus dem `TEST`-Schalter lösen, Texte aus `test.over` in den Hauptblock verschieben. Tempo + „Woran hängt es?“ brauchen dann Felder in `payload()` + Spalten/Ampel in `gas/Turbo.gs` (Script neu einspielen).

## Vergütungsplan
- Schritt 3 „Dein Weg“ (`plan`) zwischen System und Namensliste: Warum → Was → Wohin → Mit wem. Bild: `img/verguetungsplan.jpg` (austauschen = Datei ersetzen). Erklärung, Szenarien und Rechner sind Platzhalter (`m.plan.parts` in de.js) und werden nachgereicht.
- Immer mit Hinweis „keine Einkommensgarantie, verbindlich sind die offiziellen Unterlagen“.

## Inhaltliche Regeln
- **Händler-Thema bleibt draußen** (Merchant Activation, Händlergespräche, Händlervorteile) – das wird beim Event in München präsentiert. Einziger Verweis: ein Satz im Schritt „System in 60 Sekunden“.
- Keine Einkommensversprechen, keine erfundenen Zahlen. Das Duplikations-Rechenbeispiel immer mit Hinweis „keine Prognose“.
- Ansprache-Vorlagen in `scripts` (de.js): `an` = Einsteiger (3. Feld = Gruppe für Filter-Chips: fr/be/wa/ka/re), `vk` = Vertriebsköpfe (aufklappbar im Schritt Ansprache), `fu` = Follow-ups & Einwände (Schritt Pipeline). IDs werden aus der Reihenfolge erzeugt (a1…, v1…, f1…) – neue Vorlagen nur hinten anhängen, sonst verschieben sich die Nutzungszähler. `sent` im Controlling = an + vk.
- Keine Kontaktnamen ins Controlling (DSGVO, Daten Dritter) – `payload()` sendet nur Zählwerte.

## Technische Regeln
- localStorage-Key `bp_turbo_v1` nicht ändern (Fortschritt der Partner). Strukturänderungen über `migrate()` in app.js.
- Gesendete Felder (`payload()` in app.js) und Spalten (`TURBO_HEAD`/`turboRow_` in gas/Turbo.gs) immer gemeinsam ändern.
- Payload trägt `app:"turbo"` – daran erkennt doPost in Code.gs die Turbo-Meldungen.
- Aufklappbare Bereiche immer über `more(titel, inhalt)` in app.js bauen (Plus-Kreis, Pfeil, „Antippen zum Öffnen“). Nie ein nacktes `<details>` – Nutzer erkennen sonst nicht, dass dahinter mehr steckt.
- Design: dunkles Navy, Teal/Gold-Akzente, Anton + Poppins, Premium-Fintech-Look.
