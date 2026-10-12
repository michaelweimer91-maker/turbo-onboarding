# Integrationsprotokoll V2 – Vergütungsschritt „So verdienst du mit BestPrime“

Stand: 12.10.2026 · Grundlage: Übergabepaket `changes.patch` + Briefing „Nachanalyse und Integration V2“ · Ausgangscommit `42408d5`

## Ergebnis in Kürze
| Suite | Paket (gemeldet) | Hier wiederholt |
|---|---|---|
| DOM-/Rechenlogik (`tests/commission-qa.cjs`) | 56 / 56 | **56 / 56** – ausgeführt in Chromium statt JSDOM (siehe Methode) |
| Browser 320/390/1440 px (`tests/commission-browser-qa.cjs`) | 88 / 88 | **88 / 88** (3 Läufe in Folge grün, nach Stabilisierung) |
| Eigene Abnahmefälle (an V2-Regeln angepasst) | – | **62 / 62** |
| Live-Regression `index.html` | – | alle 10 Schritte ohne JS-Fehler; Live-Nutzerführung unverändert |

Technische Tests – **kein Nutzertest, kein Gerätetest, keine fachliche Freigabe der Vergütung.**

## Was integriert wurde
- Patch `git apply --check` sauber gegen `42408d5`, unverändert angewendet. Builds reproduzierbar: `index.html`, `test.html`, `onboarding-preview.html` byte-identisch mit dem Paket.
- Vergütung im bestehenden Schritt `plan`: 7 Lernkarten (2 Grundlagen + 5 optionale Vertiefungen), getrennte Rechner (eigene Kunden, CB-/Rangdifferenz, Team-Generationen, IBM-Welttopf), 4 Presets, Grund- und Teamquiz, eigene Kurz-Erklärung, Quellenliste `product-facts.js`.
- Fortschritt: `plan` erst erledigt mit beiden Grundlagenkarten, 3 richtigen Antworten, eigener Erklärung (≥ 20 Zeichen) und Bestätigung; „Aktiv“ verlangt zusätzlich Arbeitsplan und Vergütungsgrundlagen.
- Alle 27 Vorlagen mit echter Sie-Fassung (IDs stabil). Druckansicht mit lesbarer nächster Handlung.
- Separate Vorschau `onboarding-preview.html` (Speicher `bp_turbo_preview_v2`, kein Sync) für die spätere Live-Migration.
- `gas/Turbo.gs`: V2-Spalten werden nur angehängt; neue Ampel nach Weg/Tempo/Pflichtschritten für Schema 2, alte Bewertung für Schema 1. **Nicht eingespielt.**

## Eigene Anpassungen bei der Integration
| Datei | Änderung | Grund |
|---|---|---|
| `src/test/commission.js` | „laut Briefing“, „im Briefing“, „laut deiner Vorgabe“, „Provisionsbriefing“ → „Vergütungsgrafik“, „Modell“, „Provisionsvorgabe von Best Prime“ | interner Arbeitsjargon war für Partner sichtbar und sprach den falschen Leser an |
| `src/test/commission.js` | „Grundlagen gelesen: 0 / 0“ → Zähler „0 / 2“ | Anzeige war missverständlich |
| `build.py` | `noindex` auch für `onboarding-preview.html` | Vorschau wäre auf GitHub Pages indexierbar gewesen |
| `tests/commission-browser-qa.cjs` | wartet nach Eingabe kurz auf das neu berechnete Ergebnis | 1 von 5 Läufen las das Ergebnis vor der Neuberechnung (Timing, kein App-Fehler) |
| `tests/commission-qa.chromium.cjs` | **neu**: führt die unveränderten Prüfungen von `commission-qa.cjs` in Chromium aus (iframe je App-Instanz) | npm-Registry in dieser Umgebung gesperrt → jsdom nicht installierbar |
| `.gitignore`, `sw.js` | `node_modules/`, `tmp/`; Cache-Version | Hygiene / Aktualisierung |

## Methode und Grenzen
- Browser-Suite mit vorinstalliertem Playwright **1.56.1** (Paket verlangt 1.62.1) und Chromium 1194; API identisch genutzt.
- DOM-Suite: gleiche 56 Prüfungen, aber in echtem Chromium statt JSDOM. Ergebnis gleich (56/56); Unterschiede zwischen JSDOM und Browser sind damit nicht ausgeschlossen, aber für diese Prüfungen unkritisch.
- Externe Ressourcen gesperrt (Fallback-Schrift). Nicht geprüft: echte iOS-/Android-Geräte, installierte PWA, Google Fonts, Google-Sheet/Apps-Script End-to-End, Nutzertest mit Neulingen.

## Eigene Abnahmefälle gegen V2
Anpassungen an V2: Hilfsschritt „Vergütung verstanden“ erfüllt jetzt die V2-Bedingungen (Karten, Quiz, Erklärung, Haken); Fall 2 prüft den neuen Rechner statt der entfernten Abschluss-Zielrechnung.

| Status | Fall | Prüfung |
|---|---|---|
| ✅ | 1 Kein Leader | Startseite: neue Überschrift + beide Einstiege |
| ✅ | 1 Kein Leader | kein laufender Countdown vor dem Start |
| ✅ | 1 Kein Leader | „Weiß noch nicht“ wählt automatisch 7 Tage vor |
| ✅ | 1 Kein Leader | Name bleibt beim Antippen erhalten |
| ✅ | 1 Kein Leader | Start nur mit Vorname, ohne Ansprechpartner |
| ✅ | 1 Kein Leader | Zeitraum startet erst mit bestätigtem Arbeitsplan (Startet mit deinem Arbeitsplan) |
| ✅ | 1 Kein Leader | Arbeitsplan bestätigt, Zeitraum läuft |
| ✅ | 1 Kein Leader | Empfehlung reagiert auf Weg, Zeit (15 Min) und Stärke |
| ✅ | 1 Kein Leader | Selbstcheck nach Korrektur bestanden, ohne Leader-Freigabe |
| ✅ | 1 Kein Leader | falsche Antwort zeigt kurze Erklärung |
| ✅ | 1 Kein Leader | „Brauche Hilfe“ ohne Leader erklärt, wo es Hilfe gibt |
| ✅ | 1 Kein Leader | „Nicht verstanden“ zeigt Beispiel + Begriffe |
| ✅ | 1 Kein Leader | erste Nachricht vorbereitet und bestätigt – ohne externe Freigabe |
| ✅ | 1 Kein Leader / Tempo | bei 7 Tagen keine 48h-Texte/kein TOP 10 auf allen 10 Seiten (nur die Wahlkarte „Kompakt starten – 48 Stunden“ bleibt als Option) |
| ✅ | 1 Kein Leader / Altlasten | „Als erledigt markieren“ nicht mehr sichtbar |
| ✅ | 1 Kein Leader / Altlasten | „Freigeschaltet“ nicht mehr sichtbar |
| ✅ | 1 Kein Leader / Altlasten | „Folgt in Kürze“ nicht mehr sichtbar |
| ✅ | 1 Kein Leader / Altlasten | „Multiplikator ansehen“ nicht mehr sichtbar |
| ✅ | 1 Kein Leader / Altlasten | „Keine Firmennamen“ nicht mehr sichtbar |
| ✅ | 2 Ziel 100–200 € | Wunschziel wird als persönliches Ziel eingeordnet |
| ✅ | 2 Ziel 100–200 € | offene Produktfragen sichtbar gezählt („Bedingungen & offene Produktfragen (7 offen)“) |
| ✅ | 2 Ziel 100–200 € | 7× „noch zu klären“; einmalige Abschlussrechnung bleibt ohne Belege gesperrt |
| ✅ | 2 Ziel 100–200 € | Airtime-Modell 100 × 0,10 × 20 € = 200 €; Ziel 150 € → 75 aktive Kunden, ausdrücklich keine Quote/Prognose |
| ✅ | 2 Ziel 100–200 € | keine Garantieaussage |
| ✅ | 3 Nur 30 Minuten | Teamweg + 30 Min → Hinweis auf kleineres Tempo |
| ✅ | 3 Nur 30 Minuten | Tempo ändert Ziele im Teamweg (0 / 30 → 0 / 10) |
| ✅ | 3 Nur 30 Minuten | Nebenverdienst-Weg: 3 Namen, 8 Pflichtschritte, kein Teamaufbau als Pflicht |
| ✅ | 4 Unternehmer | Vertriebskopf-Bereich sichtbar, Vorlagen starten bei Community |
| ✅ | 4 Unternehmer | Organisationsnutzen, Aufwand, Vergütung offen benannt |
| ✅ | 4 Unternehmer | Netzwerkfragen + direkte Antworten auf Rückfragen |
| ✅ | 4 Unternehmer | Grundlagen bleiben verfügbar |
| ✅ | 5 Händler/Kunde | Händlerweg: Vergütungsschritt verweist vor jedem Angebot auf den aktuellen Händlerprozess |
| ✅ | 5 Händler/Kunde | ePAY klar als „Geplant“ markiert |
| ✅ | 5 Händler/Kunde | Händlerweg startet bei Händler-Vorlagen |
| ✅ | 5 Händler/Kunde | Händlerweg erreicht „Aktiv“ ohne Partnername und ohne Duplikation |
| ✅ | 5 Händler/Kunde | Gespräch und Weitergeben sind optional: Gespräche führen · optional, Weitergeben · optional |
| ✅ | 5 Händler/Kunde | Fortschritt 100 % aus Pflichtschritten des Wegs |
| ✅ | 6 Kein Interesse | Absage beendet Nachfassen in der Kontaktliste |
| ✅ | 6 Kein Interesse | abgesagter Kontakt erscheint nicht mehr bei Nachfass-Vorlagen |
| ✅ | 6 Kein Interesse | Überfälliges neutral („Prüfen oder neu planen“), nach Absage kein Termin-Hinweis mehr |
| ✅ | 6 Offene Frage | fehlendes Produktwissen: offene Fragen benannt + als Nachricht an den Ansprechpartner kopierbar |
| ✅ | 7 Zähler | Kopieren zählt nicht |
| ✅ | 7 Zähler | Bestätigung zählt einmal; zweite Bestätigung derselben Vorlage nicht möglich |
| ✅ | 7 Zähler | zweite Vorlage an dieselbe Person: weiterhin 1 Person angesprochen (1 / 1) |
| ✅ | 7 Zähler | Nachfassnachricht separat protokolliert (mit Kontakt, Vorlage, Zeit) |
| ✅ | 7 Wechsel | Ziel-/Tempowechsel + Neuladen erhalten Namen und Ereignisse |
| ✅ | 7 Wechsel | Sicherungsimport erhält Daten |
| ✅ | 8 Bestand | alter Fortschritt ladbar; alte Zähler/Gespräche nicht als bestätigte Ereignisse ausgegeben |
| ✅ | 8 Bestand | alter Status bleibt erhalten |
| ✅ | 8 Mobil/Desktop | 390 px: keine horizontale Scrollbar auf 10 Seiten |
| ✅ | 8 Mobil/Desktop | 1440 px: keine horizontale Scrollbar auf 10 Seiten |
| ✅ | 8 JS-Fehler | keine JavaScript-Fehler (0) |
| ✅ | Team | Teamweg 7 Tage: TOP 5 und 3 Auswahl begrenzt |
| ✅ | Team | 3 Personen nacheinander automatisch vorausgewählt und bestätigt |
| ✅ | Gespräch | leeres Protokoll wird nicht gespeichert |
| ✅ | Gespräch | Notiz unter 10 Zeichen reicht nicht |
| ✅ | Gespräch | Gespräch mit Notiz + Bestätigung zählt |
| ✅ | Team | Teamweg: „Aktiv“ durch Aktivität erreicht, Pflichtschritt Weitergeben noch offen (90%) |
| ✅ | Team | Einladung geplant → Pflicht erfüllt (100 %), aber noch nicht „Dupliziert“ |
| ✅ | Team | Name eingetragen reicht nicht für „Dupliziert“ |
| ✅ | Team | erst Selbstauskunft „tatsächlich begleitet“ → „Dupliziert“ mit Begründung |
| ✅ | JS-Fehler | keine JavaScript-Fehler (0) |

## Quellenliste `product-facts.js` – Stand: 0 von 7 belegt
Alle sieben Bereiche stehen auf `confirmed:false`. Es wurden **keine** Angaben ergänzt, weil keine offizielle, datierte Quelle vorlag. Benötigt wird je Bereich: verständlicher Text, konkrete offizielle Quelle, Prüfdatum (YYYY-MM-DD), `confirmed:true`.

1. **Kundenablauf:** Registrierung, Einkaufsvorgang, Entstehung/Gutschrift/Einlösung von Cashback, Voraussetzungen.
2. **ePAY-Status:** Was ist heute nutzbar, welche Funktionen/Termine sind bestätigt?
3. **Kosten:** einmalig/wiederkehrend, kostenlose Einstiegsoption, optionale Leistungen je Rolle (Basic/Premium Pack).
4. **Vergütungsanlässe:** Was erzeugt CP? Was zählt als Abschluss? 50-%/30-%-Regel? Wann gilt welcher Rang-Satz? Dürfen Team-Airtime und Rangdifferenz auf denselben CP addiert werden?
5. **Auszahlung:** Anspruch, Abrechnungszeitraum, Stichtag, Weg, Mindestbetrag.
6. **Planfassung:** aktuelle datierte Unterlagen; Bestätigung der Sätze (Airtime 2/5/20/25/30/35/40/40 €/CP, Team 10/3/2 €/CP, Welttopf 10 €/CP, Abschluss 5–50 €).
7. **Händlerprozess:** heute verfügbarer Anbindungsprozess, Rolle des Partners, Händlerkosten, Händlervergütung (inkl. „Merchant Commission bis zu 70 €“).

Erst wenn 3–6 belegt sind, schaltet sich die einmalige Abschluss-Zielrechnung frei.

## Hinweise zur Entscheidung (Betreiber)
- Die optionalen Vertiefungen zeigen große Modellbeträge (High Performance 25.000 €, IBM-Welttopf 500.000 €). Sie sind klar als Modell, nicht typisch und nicht addierbar gekennzeichnet. Vor einer Live-Übernahme sollte geprüft werden, ob diese Größenordnungen in einem Onboarding für Neulinge gezeigt werden sollen.
- Der Händlerweg aus der Testversion bleibt bestehen; die Projektregel „Händler-Thema erst in München“ gilt für Live weiterhin.

## Veröffentlichungsstatus
- Live (`index.html`): Nutzerführung unverändert. Enthalten sind nur neue Styles (u. a. lesbarer Druck) und ein ausgeschalteter V2-Schalter.
- Testversion (`test.html`) und Vorschau (`onboarding-preview.html`): auf GitHub Pages aktualisiert, beide `noindex`, eigener Speicher, kein Controlling.
- Controlling (`gas/Turbo.gs`): im Repo vorbereitet, **nicht** im Apps-Script-Projekt eingespielt.

## Nächste Schritte bis Live
1. Quellenliste mit offiziellen, datierten Unterlagen füllen (oben).
2. Pilot mit 3–5 Neulingen (Nebenverdienst, wenig Zeit, Unternehmer) + Test auf echtem iPhone/Android.
3. `gas/Turbo.gs` einspielen, alte und neue Payload gegen die echte Tabelle prüfen.
4. Live-Build mit `TURBO_ONBOARDING_V2` aktivieren (ohne `TURBO_PREVIEW`), Key `bp_turbo_v1` behalten, Bestandsnutzer Weg/Tempo wählen lassen; vorher sichern, Rückweg bereithalten.
