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

## Nachtrag: Abschlussprovision (12.10.2026, abends)
Regeln laut Michael Weimer (Chat, 12.10.2026):
- Premium-Paket = 3 CP (gültig ab 15.09.2026), Gutschein/Voucher = 1 CP; beides kann ein Partner erwerben.
- Wer selbst einschreibt: Abschluss-Satz seines Rangs × CP (P 5 · CB 10 · TB 40 · AM 42 · RD 44 · SD 46 · CM 48 · IBM 50 €/CP).
- Darüber: nur die Differenz zum Satz der ersten Linie (AM über TB: 3 × 2 € = 6 €).
- Direkter Partner auf gleicher Stufe: keine Differenz, sondern Team-Abschlussprovision Gen. 1/2/3 = 20/6/4 €.
- **Annahme (zu bestätigen):** 20/6/4 € gelten wie in der Grafik **je CP** (Premium Gen. 1 = 60 €). CB nur Generation 1.

Umsetzung: `src/test/closure.js` – Rechner (Paket, Anzahl, eigener Rang, wer schreibt ein, Rang des direkten Partners), Tabelle „Was du je Paket erhältst“ für den eigenen Rang, Kettenbeispiel TB → AM → RD, Beispiel 3 × 40 € = 120 € im Kasten „Einmalig oder laufend?“. Der Rechner ist freigeschaltet (Freigabe Michael); Kosten, Qualifikation (50-/30-%-Regel), Anspruch und Auszahlung bleiben als unbestätigt gekennzeichnet. Live unverändert.

Prüfung: Logik/DOM 65/65 (11 neue Abschlussprüfungen), Browser 90/90, Abnahme 131/131, Bedientest Abschlussrechner 18/18 (390 + 1440 px, Speichern nach Neuladen), Live-Smoke ohne Fehler.

## Nachtrag: Hell/Dunkel und Sprachen (12.10.2026, abends)
- **Hell/Dunkel:** heller Modus in Elfenbein (#f5f1e8) mit Navy-Seitenleiste/Kopfleiste, Gold- und Teal-Akzenten – gleiche Markenlogik wie der dunkle Modus. Standard = Systemeinstellung des Geräts, Umschalter „☀ Hell / ☾ Dunkel“ auf der Startseite, in der Seitenleiste und (als Symbol) in der Handy-Kopfleiste; Wahl wird pro Gerät gemerkt. CSS ist markiert und wird aus `index.html` entfernt.
- **Sprachen:** DE, EN, IT, HR, PL, TR (wie FastTrack). Rund 1.180 Texte; Marken (Best Prime, ePOINT, ePAY), Rangnamen (Partner … Innercircle Board Member) und interne Codes bleiben unübersetzt. Du-/Sie-Vorlagen in allen Sprachen mit passender Höflichkeitsform (IT Lei, HR Vi, PL Pan/Pani, TR siz). Beträge im Landesformat (EN 120.00 €, sonst 120,00 €). Sprachwahl folgt beim ersten Aufruf der Gerätesprache.
- **Prüfung:** Logik 65/65, Browser 90/90, V3-Abnahme 131/131, Abschlussrechner 18/18, Sprachen + Hell/Dunkel 84/84 (alle 6 Sprachen in Testversion und Vorschau: Startseite, Vorname bleibt beim Sprachwechsel, Abschlussrechner, Sprache nach Neuladen, keine JS-Fehler; Hell/Dunkel-Umschaltung und Speicherung). Automatischer Suchlauf über alle zehn Schritte nach deutschen Resten: EN/IT ohne Funde.
- **Live:** `index.html` byte-gleich zum vorherigen Stand.
- **Offen:** Übersetzungen sind maschinennah von Claude erstellt – vor Live-Übernahme von Muttersprachlern gegenlesen lassen (besonders Vergütungs- und Rechtstexte). Händler-Video/Startvideo bleibt deutsch.
- **Nachbesserung Auffindbarkeit:** Sprache und Hell/Dunkel stehen jetzt in einer gold umrandeten Leiste „🌐 Sprache [Deutsch ▾] · ☀ Hell | ☾ Dunkel“ ganz oben auf der Startseite und oben in der Seitenleiste; am Handy als beschrifteter Knopf „🌐 DE · ☾“ in der Kopfleiste, der die Leiste aufklappt. Sprachen ausgeschrieben (Deutsch, English, Italiano …). Prüfung: Sprachen/Ansicht 92/92, übrige Suiten unverändert grün.
