# V3 – vereinfachte App

V3 ersetzt die V2-Vorgaben zur Oberfläche und zum Vergütungsabschluss.
Vier Hauptbereiche, kompakter Einstieg, nächste Aufgabe auf Startseite, drei Verdienstwege,
Details auf Wunsch, eine Frage nach der anderen und eine Nachricht zuerst.
Freitext und Lernkarten-Abhaken sind nicht mehr verpflichtend. Drei Grundlagenantworten
plus Bestätigung bleiben erforderlich. Mathematik, Datenschutzeigenschaften und Ereignis-IDs bleiben erhalten.

## Integration
- src/test/simple.js wird durch build.py nach commission.js eingebunden.
- Genau einen Patch verwenden: changes.patch gegen Originalcommit 42408d55fe3a6ceb9decc5c05f2e3c148f3d7c71
  ODER update-v2-zu-v3.patch gegen das zuvor gelieferte V2-Paket.
- Erst git apply --check, bei Abweichungen fachlich zusammenführen; keine neueren Änderungen überschreiben.
- python3 build.py --preview; npm run test:logic; npm run test:browser.
- index.html bleibt beim bisherigen Live-Ablauf. Test und Vorschau enthalten V3.
- V3 wurde nicht veröffentlicht. Produktquellen, GAS-Rollout und echte Geräteprüfungen bleiben offen.

## Verifikation
56 Logik-/DOM-Prüfungen und 90 lokale Chromium-Prüfungen bestanden.
320/390/1440 px; Rechner, Navigation, Einzelfragen, Nachrichten, Fortschritt und Live-Regression.
Kein Test mit echten Neulingen; keine native iOS-/Android-/PWA- oder produktive GAS-Verifikation.
Die qa-v2-Dateien dokumentieren ausschließlich den früheren Stand.
