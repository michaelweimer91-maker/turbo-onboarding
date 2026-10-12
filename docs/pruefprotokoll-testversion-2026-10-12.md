# Prüfprotokoll Testversion – Anpassungsauftrag „Psychologisches Onboarding“

Stand: 12.10.2026 · Geprüft: `test.html` (Testversion) und `index.html` (Live, Regressionscheck)
Methode: automatisierter Browsertest (Chromium/Playwright, 390 px und 1440 px Breite), lokale Auslieferung der gebauten Dateien.
Ergebnis: **63 von 63 Prüfpunkten bestanden, 0 offen.**

Hinweis: Das ist ein technischer Funktionstest, **kein Nutzertest mit echten Neulingen** und keine Conversion-Messung.

## Geänderte Dateien
| Datei | Änderung |
|---|---|
| `src/test/ext.js` | **neu** – komplette Nutzerführung der Testversion (Ziel/Tempo, System, Vergütung, Profil, Liste/Auswahl, Nachricht, Kontakte, Gespräch, Weitergeben, Abschluss, Fortschrittslogik). Wird nur in `test.html` eingebaut. |
| `src/test/texts.js` | **neu** – alle Texte der Testversion inkl. transparenter Vorlagen (ersetzt den bisherigen Testblock in `de.js`). |
| `src/app.js` | neutrale Andockstellen (`isDone`, `isOpt`, `totalReq`, `navCls`, `tok`), Vorlagen-Ersetzung per Position (`scriptsSet`), Einfügestelle `/*@@TEST_EXT@@*/`. Live-Verhalten unverändert. |
| `src/i18n/de.js` | Testblock entfernt (Live-Texte unverändert). |
| `src/app_head.html` | Styles für neue Elemente (Status-Kacheln, Ja/Nein-Auswahl, Hinweise). |
| `build.py` | baut `index.html` ohne und `test.html` mit Test-Erweiterung; Prüfungen, dass nichts aus der Testversion in Live gelangt. |
| `sw.js` | Cache-Version erhöht. |

## Neue Nutzerführung (Kurzfassung)
1. **Startseite:** „Dein Start bei Best Prime“ · „Meinen Start finden“ / „Erst das System verstehen“. Vorname reicht, Ansprechpartner optional („die Person, die dich beim Einstieg begleitet“). Zielwahl (5 Wege + „Weiß noch nicht“) und separates Tempo (7 Tage empfohlen / 48 h bewusst wählbar). Kein Countdown vor dem Start; Video nur ergänzend.
2. **Arbeitsplan:** Weg/Tempo jederzeit wechselbar (Daten bleiben). Profil mit 3 wirksamen Fragen (Motiv optional, Zeit 15/30/60/mehr + erster Arbeitsblock, Stärke). Starttyp nur noch optional. Persönliche Empfehlung aus Weg + Zeit + Stärke. **Zeitraum startet erst mit „Arbeitsplan bestätigen“**; nach Ablauf bleibt alles nutzbar.
3. **System verstehen:** Alltagsbeispiel → 3 Schritte → Marken mit Status „Im Einsatz“/„Geplant“ (ePAY) → „Heute verfügbar – oder geplant?“ → eigene Aufgabe je Weg → Selbstcheck (4 inhaltliche Fragen, Erklärung bei Fehler, neuer Versuch). 60-s-Übung und Leader-Rückmeldung freiwillig, ohne Sperre.
4. **Vergütung verstehen:** vier Fragen vor jeder Einladung mit sichtbarem „noch zu klären“, Text für Nebenverdienst-Ziel, Tabelle „Was die Grafik je Stufe zeigt“, vereinfachte Rechnung nur mit dem in der Grafik belegten Satz je Abschluss (vor Steuern, Annahmen sichtbar), offizielle Grafik als Detailansicht, „Offene Fragen als Nachricht kopieren“. „Folgt in Kürze“ entfernt.
5. **Namen:** kleiner Start mit 3 Namen; Teamweg behält 30/10/5 bzw. 10/5/3 als Ausbauziel. Multiplikator-Sprung aus der Liste entfernt.
6. **Auswahl:** drei Ja/Nein-Fragen (Nutzen? Kontakt? Gespräch realistisch?) + „Auswählen“; 1–5-Bewertung optional (Team/Netzwerk).
7. **Erste Nachricht:** Kontakt sichtbar vorausgewählt, Vorlagen transparent (Best Prime/ePOINT genannt, kein „Projekt“, keine vorgetäuschte Meinungsfrage), du/Sie umschaltbar, Filter nach Weg. Kopieren/WhatsApp = „vorbereitet“; **nur „Ich habe diese Nachricht an … gesendet“ zählt – einmal pro Kontakt und Vorlage.**
8. **Meine Kontakte & nächste Schritte:** Status in Alltagssprache (vorbereitet, angesprochen, Rückmeldung, Termin, später, gestartet, kein Interesse); „kein Interesse“ beendet Nachfassen; Überfälliges neutral „Prüfen oder neu planen“. Ausweichende Einwand-Vorlagen ersetzt.
9. **Gespräche:** 5-Schritte-Ablauf, Netzwerkfragen nur im Team-/Netzwerkweg, zwei direkte Antworten („Was ist das genau?“, „Schneeballsystem?“). Protokoll zählt nur mit Datum, Kontakt, Notiz ≥ 10 Zeichen und Bestätigung „tatsächlich geführt“.
10. **Weitergeben:** nur im Teamweg Pflicht; erst Einladung planen, „Partner gemeinsam starten“ erst nach Zusage; „Dupliziert“ nur per Selbstauskunft „tatsächlich begleitet“. Rechenbeispiel optional mit sichtbaren Annahmen, „rechnerische Partnerzahl“.
11. **Abschluss-Check:** Aktivität (Personen angesprochen, Nachfassen, bestätigte Gespräche, nächste Schritte) getrennt von Ergebnissen („gestartet“). Stufe immer begründet; nächste Aktion mit Datum.
12. **Fortschritt:** nur Pflichtschritte des gewählten Wegs, automatisch aus den Daten; kein manuelles „Als erledigt markieren“, kein „Freigeschaltet“. Zustände Offen / Vorbereitet / Erledigt / Optional.

## Abnahmefälle
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
| ✅ | 2 Ziel 100–200 € | Kosten, Anspruch, Abschlussdefinition, Auszahlung sichtbar „noch zu klären“ (7×) |
| ✅ | 2 Ziel 100–200 € | Rechnung nur nach belegtem Satz: Rechnerisch 30 vergütete Abschlüsse à 5 € im Monat für 150 € vor Steuern. |
| ✅ | 2 Ziel 100–200 € | Stufe ändert Rechnung: Rechnerisch 4 vergütete Abschlüsse à 40 € im Monat für 150 € vor Steuern. |
| ✅ | 2 Ziel 100–200 € | keine Quote, keine Nettorechnung, keine Garantie |
| ✅ | 2 Ziel 100–200 € | offene Fragen gezielt erfragbar |
| ✅ | 3 Nur 30 Minuten | Teamweg + 30 Min → Hinweis auf kleineres Tempo |
| ✅ | 3 Nur 30 Minuten | Tempo ändert Ziele im Teamweg (0 / 30 → 0 / 10) |
| ✅ | 3 Nur 30 Minuten | Nebenverdienst-Weg: 3 Namen, 8 Pflichtschritte, kein Teamaufbau als Pflicht |
| ✅ | 4 Unternehmer | Vertriebskopf-Bereich sichtbar, Vorlagen starten bei Community |
| ✅ | 4 Unternehmer | Organisationsnutzen, Aufwand, Vergütung offen benannt |
| ✅ | 4 Unternehmer | Netzwerkfragen + direkte Antworten auf Rückfragen |
| ✅ | 4 Unternehmer | Grundlagen bleiben verfügbar |
| ✅ | 5 Händler/Kunde | Händlerweg zeigt eigenen Händlerhinweis |
| ✅ | 5 Händler/Kunde | ePAY klar als „Geplant“ markiert |
| ✅ | 5 Händler/Kunde | Händlerweg startet bei Händler-Vorlagen |
| ✅ | 5 Händler/Kunde | Händlerweg erreicht „Aktiv“ ohne Partnername und ohne Duplikation |
| ✅ | 5 Händler/Kunde | Gespräch und Weitergeben sind optional: Gespräche führen · optional, Weitergeben · optional |
| ✅ | 5 Händler/Kunde | Fortschritt 100 % aus Pflichtschritten des Wegs |
| ✅ | 6 Kein Interesse | Absage beendet Nachfassen in der Kontaktliste |
| ✅ | 6 Kein Interesse | abgesagter Kontakt erscheint nicht mehr bei Nachfass-Vorlagen |
| ✅ | 6 Kein Interesse | Überfälliges neutral („Prüfen oder neu planen“), nach Absage kein Termin-Hinweis mehr |
| ✅ | 6 Offene Frage | fehlendes Produktwissen wird sichtbar geklärt |
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

### Zusatzprüfungen
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

| Status | Regression Live-App |
|---|---|
| ✅ | `index.html`: alle 10 Schritte laden ohne JavaScript-Fehler; Live-Texte und -Logik unverändert; keine Test-Texte oder Test-Code im Live-Build (vom Build-Skript erzwungen). |

## Nicht getestet
- **Echte Neulinge:** Empfohlener Test mit 3–5 Personen ohne Vorwissen steht aus (5 Fragen: Was bekommt der Kunde? Was ist deine Aufgabe? Wofür Vergütung? Was ist schon nutzbar? Was machst du als Nächstes?).
- Tatsächliches Öffnen von WhatsApp und Zwischenablage auf iOS/Android-Geräten (im Test simuliert).
- Darstellung der du/Sie-Umschaltung wurde nicht separat automatisiert geprüft (Logik identisch zu den getesteten Vorlagen).
- Drucken / PDF-Export des Abschluss-Checks.
- Schriftarten (Google Fonts im Testsystem gesperrt; Fallback-Schrift verwendet).

## Offene Produktfragen (vor Live-Übernahme klären)
1. **Kundenablauf ePOINT:** Wie läuft die Kundennutzung heute konkret (Registrierung, Angebote, Gutschrift, Einlösung, Voraussetzungen)? → Text „Beispiel aus dem Alltag“ und Statusbox „Heute verfügbar“.
2. **ePAY-Status:** Was ist heute nutzbar, wann startet was? → Karte „ePAY – Geplant“.
3. **Kosten:** Preise Basic/Premium Pack, wiederkehrende Kosten, optionale Leistungen.
4. **Vergütungsanlässe:** Was genau zählt als „Abschluss“? Was bedeuten Airtime, CP und die 50-%/30-%-Regel?
5. **Anspruch & Auszahlung:** Wann entsteht ein Provisionsanspruch, wann/wie wird ausgezahlt, Mindestbeträge?
6. **Datum der Vergütungsgrafik:** Die Grafik trägt kein Datum; aktuelle Fassung bestätigen.
7. **Händlerprozess:** Ist ein Händlerprozess für Partner heute verfügbar, oder bleibt er bis zum Event in München zurückgestellt? (Der Auftrag führt einen Händlerweg ein; die bisherige Projektregel hielt das Händler-Thema aus dem Onboarding heraus.)

## Live-Übernahme (vorbereiteter Folgeschritt)
1. Produktfragen oben beantworten und Texte in `src/test/texts.js` füllen.
2. Test mit echten Neulingen durchführen, Texte nachbessern.
3. Übernahme: Inhalt von `src/test/ext.js`/`texts.js` in den Live-Build aufnehmen (Schalter in `build.py`). **Vorher Controlling erweitern:** `payload()` um Weg, Tempo, Plan-Zeitpunkt, bestätigte Ansprachen/Gespräche ergänzen und `gas/Turbo.gs` (Spalten + Ampel nach Weg) anpassen – sonst bewertet die Ampel Nicht-Teamwege falsch (bisher 30 Namen/5 Kontakte). Script danach neu einspielen.
4. Bestehende Live-Daten (`bp_turbo_v1`) migrieren: Weg/Tempo fehlen → Partner beim ersten Öffnen Ziel/Tempo wählen lassen; alte Zähler nicht als bestätigte Ereignisse übernehmen.
