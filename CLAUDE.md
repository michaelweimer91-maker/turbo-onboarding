# Best Prime Turbo-Onboarding

Installierbare Web-App (PWA): neue Vertriebspartner in 48 Stunden ins Verständnis und in die Aktivität bringen.
Abgeleitet aus dem FastTrack (michaelweimer91-maker/fasttrack), deutlich kürzer: 4 Phasen, 9 Schritte.
Live (nach Aktivierung von GitHub Pages): https://michaelweimer91-maker.github.io/turbo-onboarding/

## Aufbau
- `src/app_head.html` – Titel + komplettes CSS + Root-Container
- `src/app.js` – gesamte App-Logik (Vanilla JS, kein Optional Chaining – iOS-Safari-kompatibel)
- `src/i18n/de.js` – alle Texte. **de.js ist die Referenz.** Weitere Sprachen (en/it/hr/pl/tr) als eigene Datei mit exakt derselben Struktur anlegen – build.py bindet jede vorhandene Datei automatisch ein, die Sprachauswahl erscheint ab 2 Sprachen.
- `build.py` – baut `index.html` aus src/. **Nach jeder Änderung in src/ ausführen** und index.html mit committen.
- `config.js` – Sync-URL + Token + `videoUrl` (Startvideo auf Startseite und im Schritt 1; YouTube/Vimeo-Link oder MP4 im Repo, leer = kein Video). YouTube lädt erst nach Klick (DSGVO, youtube-nocookie).
- `sw.js` – Offline-Cache, network-first.
- `gas/Turbo.gs` – Zusatzdatei für das Apps Script der bestehenden Tabelle „FastTrack Controlling – Best Prime“. Schreibt ins Blatt **„Turbo“**. Einrichtung: siehe ANLEITUNG.md.

## Inhaltliche Regeln
- **Händler-Thema bleibt draußen** (Merchant Activation, Händlergespräche, Händlervorteile) – das wird beim Event in München präsentiert. Einziger Verweis: ein Satz im Schritt „System in 60 Sekunden“.
- Keine Einkommensversprechen, keine erfundenen Zahlen. Das Duplikations-Rechenbeispiel immer mit Hinweis „keine Prognose“.
- Keine Kontaktnamen ins Controlling (DSGVO, Daten Dritter) – `payload()` sendet nur Zählwerte.

## Technische Regeln
- localStorage-Key `bp_turbo_v1` nicht ändern (Fortschritt der Partner). Strukturänderungen über `migrate()` in app.js.
- Gesendete Felder (`payload()` in app.js) und Spalten (`TURBO_HEAD`/`turboRow_` in gas/Turbo.gs) immer gemeinsam ändern.
- Payload trägt `app:"turbo"` – daran erkennt doPost in Code.gs die Turbo-Meldungen.
- Design: dunkles Navy, Teal/Gold-Akzente, Anton + Poppins, Premium-Fintech-Look.
