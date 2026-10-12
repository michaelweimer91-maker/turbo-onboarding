# Auftrag und bereits umgesetzte Änderungen

Grundlage: öffentliches Repository `michaelweimer91-maker/turbo-onboarding`, Commit
`42408d55fe3a6ceb9decc5c05f2e3c148f3d7c71`, 12.10.2026.

Dieses Paket enthält die Umsetzung, keinen isolierten Entwurf. Die erneute Analyse,
fachliche Datenbasis, Prioritäten und Abnahme stehen in der beigefügten PDF.

## Einspielen

1. Aktuellen Projektstand und CLAUDE.md lesen. Vorhandene neuere Änderungen bewahren.
2. Patch gegen den genannten Basisstand prüfen (`git apply --check changes.patch`).
   Bei anderem Stand Änderungen gezielt zusammenführen; keine Dateien blind überschreiben.
3. Dateien unter `src/` sind maßgeblich. `python3 build.py --preview` baut `index.html`,
   `test.html` und die separate Migrationsvorschau `onboarding-preview.html`.
4. `test.html` verwendet `bp_turbo_test_v1`, die Vorschau `bp_turbo_preview_v2`;
   beide senden nichts an das Controlling. `bp_turbo_v1` wird dadurch nicht ersetzt.
5. Dateien auf lokalem Webserver prüfen. `Vorschau.html` im Paket ist zusätzlich
   eine Datei mit eingebetteten Assets und ohne Controlling-Konfiguration.

## Fertig implementiert

- Schritt `plan`: 7 native Lernkarten, 2 Grundlagenkarten plus optionale Vertiefungen.
- Eigene Airtime, Rangdifferenz, Team-Airtime und IBM-Welttopf separat berechnet.
- Vier Presets, Eingabeprüfung, optionales Wunschziel, IBM-Anzahl 1 und 5 bis 10.
- Drei Grundlagenfragen plus eigene Kurz-Erklärung. Der Text wird nicht automatisch
  fachlich bewertet und bleibt lokal.
- Pflichtabschluss `plan` statt bloßem Haken; Status `Aktiv` verlangt Arbeitsplan
  und Vergütungsgrundlagen sowie die Aktivitätsaufgaben des gewählten Wegs.
- Vollständige du-/Sie-Fassungen, fortbestehende Kontakt-/Vorlagen-IDs.
- Lesbarer Abschlussdruck mit statischer nächster Handlung.
- Quellenliste `product-facts.js`; ungeklärte Fakten werden nicht erfunden.
- Abschluss-Zielrechnung ist bis zur Freigabe von Anlass, Kosten, Auszahlung und
  Planfassung deaktiviert. Danach: z. B. 4 × 40 € = 160 € bei Zielbetrag 150 €.
- V2-Payload und rückwärtskompatible Erweiterung von `gas/Turbo.gs` vorbereitet:
  nur neue Spalten anhängen; Weg, Tempo, Pflichtschritte und bestätigte Ereignisse.
  Keine Kontakt-/Nachrichtentexte, Motivantworten oder freien Lern-/Gesprächsnotizen.

## Fachlich noch ausfüllen

`product-facts.js` enthält sieben Bereiche. Eine Freigabe benötigt tatsächlichen
Text, belegte Quelle, Prüftag und `confirmed:true`. Keine historischen Preise
oder nur aus Beispielen abgeleiteten Anspruchsregeln übernehmen. Ungeklärt sind
insbesondere Ablauf, Kosten, CP-Erzeugung, Rangberechtigung, Kumulierung,
Auszahlungsbedingungen, Händlerprozess und aktueller ePAY-Status.

## Tests und verbleibende externe Prüfungen

`tests/commission-qa.cjs`: Node/JSDOM. `tests/commission-browser-qa.cjs`:
Chromium/Playwright. Node-Pakete `jsdom` und `playwright` sowie ein passendes
Chromium sind zum Wiederholen nötig; `CHROMIUM_PATH` kann gesetzt werden.
Tests enthalten nur lokale QA-Daten; keine echten Kontakte oder Konten.
Ergebnisse: `docs/qa-v2-dom-results.json` und `docs/qa-v2-browser-results.json`.
Externe Ressourcen wurden gesperrt; Layout mit Fallback-Schrift geprüft.

Noch nicht erledigt: echter iOS-/Android-Test von WhatsApp, Zwischenablage,
installierter PWA; Google Fonts; Nutzertest mit 3 bis 5 Neulingen; Bereitstellung
und End-to-End-Test im tatsächlichen Google-Sheet-/Apps-Script-Projekt.

## Live-Übernahme

Die überarbeitete Nutzerführung ist nicht veröffentlicht. Der Default-Build
behält die bisherige Live-Nutzerführung. `ONBOARD` in app.js und die separate
Vorschau bereiten eine spätere Aktivierung vor.

Nach fachlicher Freigabe und Pilot: zuerst Apps Script aktualisieren, Spaltenzuordnung
und altes/neues Schema testen; anschließend den neuen Overlay-/Erweiterungs-Code
im Live-Build aktivieren (wie in der Vorschau, aber ohne TURBO_PREVIEW), den
Live-Key `bp_turbo_v1` erhalten und bestehende Partner Weg/Tempo wählen lassen.
Altzähler bleiben gespeichert, gelten aber nicht als neue bestätigte Ereignisse.
Vor dem produktiven Rollout aktuelle Dateien und Nutzerdaten sichern, Regression
prüfen und einen Rückweg auf die vorherige Version vorhalten.

Nicht behaupten, dass eine Registrierung CP erzeugt, 0,10 CP ein gemessener
Durchschnitt ist oder Team-/Differenzprovisionen ungeprüft addiert werden dürfen.
