/* Turbo-Onboarding – Konfiguration. Nur diese Datei anpassen. */
window.TURBO_CONFIG = {
  // Web-App-URL des Apps Scripts der Controlling-Tabelle (endet auf /exec) – dieselbe URL wie im FastTrack.
  // Voraussetzung: gas/Turbo.gs + Weiche in doPost sind eingespielt (09.10.2026). Leer = kein Controlling, App läuft nur lokal.
  syncUrl: "https://script.google.com/macros/s/AKfycbx7iOJnQLtD041rcV7yotms-LGOBxuJsjhvUU7lpK17YbaTJRiASQtWWjinf7S7RoKT/exec",
  // Gleiches Passwort wie TOKEN in Code.gs
  token: "bp-ft-50a52f708f03",
  // Startvideo (ca. 2 Min.). Leer = kein Video. Erlaubt: YouTube-Link (am besten „Nicht gelistet“),
  // Vimeo-Link oder eine MP4-Datei im Repo, z. B. "video/turbo.mp4".
  videoUrl: "https://vimeo.com/1232915422",
  // Format des Videos: "16:9" (quer) oder "9:16" (hochkant)
  videoFormat: "9:16",
  // Länge, wird auf dem Play-Knopf angezeigt
  videoLength: "6 Min."
};
