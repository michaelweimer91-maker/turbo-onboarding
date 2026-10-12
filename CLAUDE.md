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
- `build.py` baut `index.html` (Live) **ohne** und `test.html` **mit** Test-Erweiterung: `src/test/texts.js` (Texte, `I18N.de.test`) + `src/test/ext.js` (wird an `/*@@TEST_EXT@@*/` in app.js eingesetzt). Der Build bricht ab, wenn Test-Code in Live landet.
- `test.html`: `window.TURBO_TEST=true` → eigener Speicher `bp_turbo_test_v1`, **kein Controlling-Sync**, Banner „TESTVERSION“, noindex.
- Stand 12.10.2026: Nutzerführung nach Anpassungsauftrag „Psychologisches Onboarding“ – Ziel vor Tempo (6 Wege), Zeitraum startet erst mit bestätigtem Arbeitsplan, Selbstcheck statt Leader-Sperre, Vergütung mit „noch zu klären“, transparente Vorlagen (du/Sie), Versand zählt nur per Bestätigung je Kontakt+Vorlage (`S.ev`), Fortschritt nur aus Pflichtschritten des Wegs (`REQ` in ext.js), Duplikation nur im Teamweg.
- Prüfprotokoll + offene Produktfragen + Schritte zur Live-Übernahme: `docs/pruefprotokoll-testversion-2026-10-12.md`.
- Vorlagen in der Testversion per `scriptsSet` an derselben Position ersetzen (IDs bleiben stabil); 4. Feld = Sie-Variante.
- **V2 (12.10.2026):** Vergütungsschritt `plan` = `src/test/commission.js` (wird an `/*@@COMMISSION@@*/` in ext.js eingesetzt): 7 Lernkarten, getrennte Rechner, Quiz, eigene Erklärung. Modellwerte in `CC` (commission.js). Produktfakten nur über `product-facts.js` (confirmed + Quelle + Prüfdatum) – nichts erfinden.
- `python3 build.py --preview` baut zusätzlich `onboarding-preview.html` (Live-Migrationsvorschau, Key `bp_turbo_preview_v2`, kein Sync, noindex). Schalter `ONBOARD`/`TURBO_ONBOARDING_V2` in app.js für spätere Live-Aktivierung.
- **V3 (12.10.2026, Vorrang vor V2 bei der Oberfläche):** `src/test/simple.js` (wird nach commission.js an `/*@@COMMISSION@@*/` eingesetzt): 4 Hauptbereiche (Start / System verstehen / Geld verdienen / Aktiv werden), Einstieg nur Vorname + Ziel (7 Tage vorbelegt), „Dein nächster Schritt“ auf Start, Vergütung = 3 Verdienstwege + Beispiel 100×0,10×20 €, Quiz Frage für Frage, Abschluss = 3 Grundlagenfragen + Bestätigung (Freitext optional), erste Vorlage sichtbar/Rest eingeklappt, keine mobile Bottom-Nav (Handy: „☰“-Menü).
- **Abschlussprovision (12.10.2026, Quelle: Michael):** `src/test/closure.js` (nach simple.js eingesetzt), Rechner „Abschlussprovision berechnen“ im Schritt `plan`. Premium-Paket = 3 CP (ab 15.09.2026), Gutschein/Voucher = 1 CP. Selbst eingeschrieben = Rang-Satz × CP (`CC.closureRates`); über der 1. Linie nur Differenz; direkter Partner gleiche Stufe → Team-Abschluss Gen. 1/2/3 = 20/6/4 € **je CP (Annahme aus Grafik)**, CB nur Gen. 1. Werte in `CL`. Kosten, Qualifikation, Anspruch, Auszahlung weiter unbestätigt.
- Tests: `tests/commission-qa.cjs` (JSDOM) bzw. `tests/commission-qa.chromium.cjs` (gleiche Prüfungen in Chromium, ohne jsdom), `tests/commission-browser-qa.cjs` (Playwright), `tests/v3-abnahme.py` (Abnahme laut V3-Checkliste). Ergebnisse in `docs/qa-v3-*.json` (qa-v2 = alter Stand), Integration: `docs/integrationsprotokoll-v3-2026-10-12.md`.

## Vergütungsplan
- Live: Schritt 3 „Dein Weg“ (`plan`) zwischen System und Namensliste: Warum → Was → Wohin → Mit wem. Bild: `img/verguetungsplan.jpg` (austauschen = Datei ersetzen). Erklärung, Szenarien und Rechner sind dort noch Platzhalter (`m.plan.parts` in de.js).
- Testversion/Vorschau: vollständiger Vergütungsschritt „So verdienst du mit BestPrime“ (V2, siehe oben). Keine Gesamtsummen über dieselben CP bilden, solange Kumulierung nicht bestätigt ist.
- Immer mit Hinweis „keine Einkommensgarantie, verbindlich sind die offiziellen Unterlagen“.

## Inhaltliche Regeln
- **Händler-Thema bleibt draußen (Live)** (Merchant Activation, Händlergespräche, Händlervorteile) – das wird beim Event in München präsentiert. Einziger Verweis: ein Satz im Schritt „System in 60 Sekunden“. Ausnahme: Die Testversion enthält auf Auftrag vom 12.10.2026 einen Händlerweg – vor Live-Übernahme mit Michael klären.
- Keine Einkommensversprechen, keine erfundenen Zahlen. Das Duplikations-Rechenbeispiel immer mit Hinweis „keine Prognose“.
- Ansprache-Vorlagen in `scripts` (de.js): `an` = Einsteiger (3. Feld = Gruppe für Filter-Chips: fr/be/wa/ka/re), `vk` = Vertriebsköpfe (aufklappbar im Schritt Ansprache), `fu` = Follow-ups & Einwände (Schritt Pipeline). IDs werden aus der Reihenfolge erzeugt (a1…, v1…, f1…) – neue Vorlagen nur hinten anhängen, sonst verschieben sich die Nutzungszähler. `sent` im Controlling = an + vk.
- Keine Kontaktnamen ins Controlling (DSGVO, Daten Dritter) – `payload()` sendet nur Zählwerte.

## Technische Regeln
- localStorage-Key `bp_turbo_v1` nicht ändern (Fortschritt der Partner). Strukturänderungen über `migrate()` in app.js.
- Gesendete Felder (`payload()` in app.js) und Spalten (`TURBO_HEAD`/`turboRow_` in gas/Turbo.gs) immer gemeinsam ändern.
- Payload trägt `app:"turbo"` – daran erkennt doPost in Code.gs die Turbo-Meldungen.
- Aufklappbare Bereiche immer über `more(titel, inhalt)` in app.js bauen (Plus-Kreis, Pfeil, „Antippen zum Öffnen“). Nie ein nacktes `<details>` – Nutzer erkennen sonst nicht, dass dahinter mehr steckt.
- Design: dunkles Navy, Teal/Gold-Akzente, Anton + Poppins, Premium-Fintech-Look.
