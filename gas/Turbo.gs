/**
 * Best Prime – Turbo-Onboarding Controlling
 * Zusätzliche Datei im Apps-Script-Projekt der bestehenden Tabelle „FastTrack Controlling – Best Prime“.
 * Schreibt den Fortschritt aus der Turbo-App in ein eigenes Blatt „Turbo“ (eine Zeile pro Partner).
 * Das FastTrack-Blatt bleibt unberührt.
 *
 * Einrichtung (einmalig):
 * 1. Im Apps-Script-Editor: Dateien → + → Skript → Name „Turbo“ → diesen Code einfügen.
 * 2. In Code.gs in doPost direkt nach der Token-Prüfung diese eine Zeile einfügen:
 *        if (p.app === 'turbo') return turboPost_(p);
 * 3. Funktion „setupTurbo“ einmal ausführen (legt das Blatt + stündliche Ampel an).
 * 4. Bereitstellen → Bereitstellungen verwalten → ✏️ → Neue Version (URL bleibt gleich).
 * 5. Dieselbe /exec-URL in config.js der Turbo-App eintragen.
 */

var SHEET_TURBO = 'Turbo';
var TURBO_HOURS = 48;

var TURBO_HEAD = ['Partner-ID','Name','Leader','Sprache','Start','Letzte Aktivität','Ampel','Hebel für Leader',
  'Fortschritt %','Schritte erledigt','Aktueller Schritt','Stufe','Turbo (h übrig)',
  '60s-Durchgänge','60s-Freigabe Leader','Mini-Check bestanden','Namen auf Liste','TOP 10','Kontaktiert','Reaktionen',
  'Status NEU','Status TERMIN','Status FOLLOW-UP','Status ENTSCHEIDUNG','Status GESTARTET','Kein Interesse',
  'Gespräche','Nächste Schritte','Ansprachen gesendet','Starttyp','Warum','Zeit pro Woche','Braucht Unterstützung bei',
  'Duplikation (von 5)','48h-Review','Erledigte Schritte'];

var TURBO_LEVELS = ['Offen','Verstanden','Aktiv','Dupliziert'];
function tcol_(name) { return TURBO_HEAD.indexOf(name); }   // 0-basiert

/* ---------- Einmalige Einrichtung ---------- */
function setupTurbo() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_TURBO) || ss.insertSheet(SHEET_TURBO);
  sh.getRange(1, 1, 1, TURBO_HEAD.length).setValues([TURBO_HEAD]).setFontWeight('bold').setBackground('#5a4a1f').setFontColor('#ffffff').setWrap(true);
  sh.setFrozenRows(1); sh.setFrozenColumns(3);
  sh.setColumnWidth(1, 90); sh.setColumnWidths(2, 2, 150); sh.setColumnWidth(8, 320); sh.setColumnWidths(31, 3, 240);
  sh.getRange('E:F').setNumberFormat('dd.MM.yyyy HH:mm');
  if (!sh.getFilter()) sh.getRange(1, 1, Math.max(2, sh.getMaxRows()), TURBO_HEAD.length).createFilter();

  var g = sh.getRange('G2:G');
  sh.setConditionalFormatRules([
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('ROT').setBackground('#f4c7c3').setFontColor('#9c1c12').setBold(true).setRanges([g]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('GELB').setBackground('#fce8b2').setFontColor('#7a5300').setBold(true).setRanges([g]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo('GRÜN').setBackground('#b7e1cd').setFontColor('#0b5a33').setBold(true).setRanges([g]).build(),
    SpreadsheetApp.newConditionalFormatRule().whenNumberGreaterThanOrEqualTo(80).setBackground('#b7e1cd').setRanges([sh.getRange('I2:I')]).build()
  ]);

  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'refreshTurbo') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('refreshTurbo').timeBased().everyHours(1).create();
  return sh;
}

/* ---------- Bewertung: Ampel + wo der Leader ansetzen soll (48h-Logik) ---------- */
function turboAssess_(p, now) {
  var hInactive = p.updatedAt ? (now - p.updatedAt) / 3600000 : 999;
  var h = p.startedAt ? (now - p.startedAt) / 3600000 : 0;

  var lever;
  if (!p.diagDone) lever = 'Startprofil gemeinsam ausfüllen';
  else if (p.pitchReps < 3) lever = '60-Sekunden-Erklärung üben lassen (' + p.pitchReps + '/3)';
  else if (!p.leaderOk) lever = '60-Sekunden-Check abnehmen und freigeben';
  else if (p.list < 30) lever = 'Namensliste anschieben (' + p.list + '/30)';
  else if (p.top < 10) lever = 'TOP 10 gemeinsam priorisieren (' + p.top + '/10)';
  else if (p.contacted < 5) lever = 'Erste Ansprachen begleiten (' + p.contacted + '/5)';
  else if (p.talks < 1) lever = 'Erstgespräch gemeinsam führen (2er-Gespräch)';
  else if (!p.review) lever = '48h-Review machen';
  else if (p.dupDone < 1) lever = 'Ersten eigenen Partner starten';
  else lever = 'Läuft – Duplikation coachen';

  var ampel = 'GRÜN';
  if (p.level >= 2) ampel = 'GRÜN';
  else if (hInactive > 48 || (h >= TURBO_HOURS && p.contacted < 5)) ampel = 'ROT';
  else if (hInactive > 24 || (h > 12 && p.pitchReps < 3) || (h > 24 && (p.list < 30 || p.top < 10)) || (h > 36 && p.contacted < 5)) ampel = 'GELB';

  if (hInactive > 24 && hInactive < 999) lever = 'Anrufen – seit ' + Math.floor(hInactive) + ' h inaktiv · ' + lever;
  return { ampel: ampel, lever: lever, left: Math.max(0, Math.round(TURBO_HOURS - h)) };
}

function turboRow_(p, now) {
  var a = turboAssess_(p, now);
  var d = p.diag || [], st = p.st || {};
  function dt(ms) { return ms ? new Date(ms) : ''; }
  return [p.pid, p.name, p.leader, String(p.lang || '').toUpperCase(), dt(p.startedAt), dt(p.updatedAt), a.ampel, a.lever,
    p.pct, p.doneCount + '/' + p.total, p.view, TURBO_LEVELS[p.level] || 'Offen', a.left,
    p.pitchReps, p.leaderOk ? 'ja' : 'nein', p.quizOk ? 'ja' : 'nein', p.list, p.top, p.contacted, p.replies,
    st.NEU || 0, st.TERMIN || 0, st.FU || 0, st.ENT || 0, st.GO || 0, st.NO || 0,
    p.talks, p.nextSteps, p.sent, p.type, d[0] || '', d[1] || '', d[2] || '',
    p.dupDone, p.review ? 'ja' : 'nein', (p.doneModules || []).join(', ')];
}

/* ---------- Aufruf aus doPost (Code.gs) – läuft dort bereits im Lock ---------- */
function turboPost_(p) {
  if (!p.pid || !p.name) return out_('invalid');
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_TURBO) || setupTurbo();
  var row = turboRow_(p, Date.now());
  var last = sh.getLastRow(), at = -1;
  if (last > 1) {
    var ids = sh.getRange(2, 1, last - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) { if (ids[i][0] === p.pid) { at = i + 2; break; } }
  }
  if (at > 0) sh.getRange(at, 1, 1, row.length).setValues([row]);
  else sh.appendRow(row);
  return out_('ok');
}

/* ---------- Ampel stündlich aktualisieren (auch ohne neue Meldung) ---------- */
function refreshTurbo() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_TURBO);
  if (!sh || sh.getLastRow() < 2) return;
  var n = sh.getLastRow() - 1, now = Date.now();
  var data = sh.getRange(2, 1, n, TURBO_HEAD.length).getValues();
  function v(r, name) { return r[tcol_(name)]; }
  function ms(x) { return x ? new Date(x).getTime() : 0; }
  var outVals = [], left = [];
  data.forEach(function (r) {
    var p = { updatedAt: ms(v(r, 'Letzte Aktivität')), startedAt: ms(v(r, 'Start')),
      level: TURBO_LEVELS.indexOf(v(r, 'Stufe')), talks: Number(v(r, 'Gespräche')) || 0, list: Number(v(r, 'Namen auf Liste')) || 0,
      contacted: Number(v(r, 'Kontaktiert')) || 0, top: Number(v(r, 'TOP 10')) || 0,
      diagDone: !!(v(r, 'Starttyp') && v(r, 'Warum') && v(r, 'Zeit pro Woche') && v(r, 'Braucht Unterstützung bei')),
      pitchReps: Number(v(r, '60s-Durchgänge')) || 0, leaderOk: v(r, '60s-Freigabe Leader') === 'ja',
      review: v(r, '48h-Review') === 'ja', dupDone: Number(v(r, 'Duplikation (von 5)')) || 0 };
    var a = turboAssess_(p, now);
    outVals.push([a.ampel, a.lever]); left.push([a.left]);
  });
  sh.getRange(2, tcol_('Ampel') + 1, n, 2).setValues(outVals);
  sh.getRange(2, tcol_('Turbo (h übrig)') + 1, n, 1).setValues(left);
}
