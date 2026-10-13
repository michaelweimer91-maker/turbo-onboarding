# Live-Umstellung 13.10.2026

Auftrag Michael: „Überspiele es auf die Live App“. Händlerweg: **ausblenden** (Entscheidung Michael, 13.10.2026).

## Was live ist
- Neue Nutzerführung aus der Testversion: 4 Hauptbereiche, einfacher Einstieg, Vergütungsschritt mit Abschlussrechner (Premium 3 CP / Voucher 1 CP), 6 Sprachen, Hell/Dunkel mit Einstellungsleiste.
- Ohne Händlerweg: Ziel „Händler gewinnen“, Händler-Vorlage/-Filter, Händlerweg-Hinweise und die Produktfrage „Händlerprozess“ sind ausgeblendet (`window.TURBO_NO_MERCH`). Bestandsdaten mit Weg „Händler“ (nur aus Tests möglich) werden auf „Weiß noch nicht“ gesetzt.
- Speicher `bp_turbo_v1` unverändert → Bestandspartner behalten Partner-ID, Name, Leader, Kontakte, Einwilligung. Alte Zähler gelten nicht als bestätigte Ereignisse (Fortschritt startet daher niedriger).
- Controlling-Sync aktiv (Schema 2). Neue Partner müssen auf der Startseite der Übermittlung zustimmen (wie bisher).

## Prüfung (alle grün)
Live-Umstellung 16/16 (neuer Partner, Einwilligung Pflicht, Sync abgefangen: `app=turbo`, Schema 2, keine Kontaktnamen; Bestandspartner mit altem Stand; alle 10 Schritte; kein „Händler“ in Ansprache und Vergütung) · Logik 65/65 · Browser 90/90 · V3-Abnahme 131/131 · Abschlussrechner 18/18 · Sprachen/Hell-Dunkel 92/92.

## Rückweg
`python3 build.py --live-alt` erzeugt die alte `index.html` (geprüft: byte-gleich zum Stand vor der Umstellung, Commit `f26493b`). Danach committen und pushen.

## Offen / zu tun
1. **`gas/Turbo.gs` im Apps Script einspielen** (V2-Spalten + Ampel nach Weg). Bis dahin kommen die Meldungen an, die Ampel bewertet aber nach alter 48h-Logik.
2. Übersetzungen von Muttersprachlern gegenlesen lassen.
3. Produktfakten (Kosten, Auszahlung, Qualifikation) weiter offen – in der App als „noch zu klären“ gekennzeichnet.
4. Team-Abschluss 20/6/4 € „je CP“ ist eine Annahme aus der Grafik.
