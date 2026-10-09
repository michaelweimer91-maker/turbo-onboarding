# Einrichtung – Turbo-Onboarding

## 1. App live schalten (2 Min.)
GitHub → Repo `turbo-onboarding` → Settings → Pages → Branch `main`, Ordner `/ (root)` → Save.
Nach ca. 1 Minute: https://michaelweimer91-maker.github.io/turbo-onboarding/

## 2. Controlling-Blatt „Turbo“ einrichten (5 Min.)
In der Tabelle **„FastTrack Controlling – Best Prime“** → Erweiterungen → Apps Script:

1. **Neue Datei:** Links bei „Dateien“ auf **+ → Skript**, Name `Turbo`. Den kompletten Inhalt von `gas/Turbo.gs` einfügen, speichern.
2. **Weiche in Code.gs:** In der Funktion `doPost` direkt nach der Zeile
   `if (TOKEN && p.token !== TOKEN) return out_('forbidden');`
   diese Zeile einfügen:
   ```
   if (p.app === 'turbo') return turboPost_(p);
   ```
   Speichern.
3. Oben die Funktion **`setupTurbo`** auswählen → **Ausführen** (Berechtigungen bestätigen). Das Blatt „Turbo“ und die stündliche Ampel werden angelegt.
4. **Bereitstellen → Bereitstellungen verwalten → ✏️ → Version: Neue Version → Bereitstellen.** Die URL bleibt gleich.
5. Kurz Bescheid geben – dann wird die `/exec`-URL in `config.js` eingetragen und das Controlling ist aktiv.

Wichtig: Schritt 5 erst nach 1–4. Sonst landen Turbo-Partner im FastTrack-Blatt.

## Ampel (48h-Logik)
- **GRÜN:** Stufe „Aktiv“ erreicht oder im Plan
- **GELB:** 24 h inaktiv · nach 12 h noch keine 3 Durchgänge der 60-Sekunden-Erklärung · nach 24 h unter 30 Namen oder ohne TOP 10 · nach 36 h unter 5 Kontakten
- **ROT:** 48 h inaktiv · oder 48 h vorbei und unter 5 Kontakten
- Spalte **„Hebel für Leader“** sagt, wo der Leader als Nächstes ansetzen soll.
