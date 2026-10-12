# Integrationsprotokoll V3 – „BestPrime App vereinfacht“ (12.10.2026)

## Vorgehen
- Paket enthielt nur `changes.patch` gegen Originalcommit 42408d5 (kein `update-v2-zu-v3.patch`). Das Repo stand auf V2 **plus** eigenen Nachbesserungen (Wortwahl in commission.js, Empfänger-Vorauswahl, Test-Wartezeit, Chromium-Adapter).
- `git apply --check` gegen main schlägt erwartungsgemäß fehl. Daher: Referenzzweige 42408d5+V2-Patch und 42408d5+V3-Patch gebaut, daraus das reine V2→V3-Delta erzeugt und per Cherry-Pick (ohne Commit) auf main gelegt. So bleiben alle neueren Änderungen erhalten.
- Ergebnis: automatisch zusammengeführt bis auf einen Konflikt in `tests/commission-browser-qa.cjs` → V3-Klickfolge übernommen **plus** bestehende Wartebedingung auf das Rechnerergebnis.
- Ergänzt: Hinweis im Vergütungsschritt für den Händlerweg („Kläre vor einem konkreten Angebot den aktuellen Händlerprozess mit deinem Leader.“), `sw.js` Cache auf `turbo-v13`, Chromium-Adapter schreibt jetzt `docs/qa-v3-dom-results.json`.
- Build: `python3 build.py --preview` → index.html, test.html, onboarding-preview.html.

## Prüfungen
| Suite | Ergebnis |
|---|---|
| Logik/DOM (`commission-qa.chromium.cjs`, gleiche Prüfungen wie JSDOM) | 56 / 56 |
| Browser (`commission-browser-qa.cjs`, Playwright/Chromium) | 90 / 90 |
| Abnahme V3-Checkliste (`tests/v3-abnahme.py`, test.html + Vorschau, 390 und 1440 px) | 131 / 131 |
| Live-Smoke (index.html: alle Schritte rendern, keine Fehler) | bestanden |

Abgedeckt laut V3-PDF: Einstieg (Vorname + Ziel, keine Tempo-/Wege-Kacheln, 7 Tage vorbelegt), alle vier Hauptbereiche (Desktop-Leiste und Handy-Menü, Menü schließt nach Auswahl), Vergütungsfragen (eine Frage zur Zeit, falsche Antwort bleibt mit Erklärung, 3/3 + Bestätigung = erledigt, ohne Pflicht-Freitext), Rechner (TB 100 × 0,10 CP = 200,00 €, negative Eingaben), Nachrichten (eine Vorlage sichtbar, Rest eingeklappt; Händlerweg filtert auf eine Vorlage; Versand zählt erst nach Bestätigung), gespeicherter Fortschritt nach Neuladen, kein horizontaler Überlauf, keine JS-Fehler, Live ohne V3-Einstieg und ohne Testbanner.

## Live
- `index.html`: Ablauf unverändert. Einzige Änderung aus dem Paket: eine CSS-Zeile in `app_head.html` (ungenutzte V3-Klassen, `progress`-Stil, Fußzeilen-Knöpfe min. 48 px hoch).
- Controlling/GAS: unverändert, V2-Spalten weiterhin **nicht** in der echten Tabelle eingespielt.

## Offen (vor Live-Übernahme)
- Produktfakten 0 / 7 bestätigt (`product-facts.js`); Abschlussrechner bleibt gesperrt.
- Händlerweg in der Testversion mit Michael klären (Live-Regel: Händler-Thema draußen).
- Kein Test mit echten Neulingen, keine echten iOS-/Android-/PWA-Geräte.
