/* Vergütung: integrierter Lernschritt, keine zweite App.
   Modellwerte aus BestPrime_TurboApp_Claude_Provisionsplan_Implementierung, 12.10.2026.
   Produkt-/Abrechnungsregeln sind getrennt freizugeben, keine behauptete typische Rendite. */
var CC={version:"2026-10-12-v2",ranks:[
 {id:"P",name:"Partner",rate:2},{id:"CB",name:"Community Builder",rate:5},
 {id:"TB",name:"Team Builder",rate:20},{id:"AM",name:"Area Manager",rate:25},
 {id:"RD",name:"Regional Director",rate:30},{id:"SD",name:"Sales Director",rate:35},
 {id:"CM",name:"Country Manager",rate:40},{id:"IBM",name:"Innercircle Board Member",rate:40}],
 generationRates:{1:10,2:3,3:2},worldRate:10,
 closureRates:{P:5,CB:10,TB:40,AM:42,RD:44,SD:46,CM:48,IBM:50},
 cards:["Wofür du Vergütung erhältst","CP und eigene Kunden","Mit Community Buildern zusammenarbeiten","Dein Team: Ebenen statt Ränge","Vom kleinen Start bis zum großen Team","Positionen und Voraussetzungen","Der IBM-Welttopf"],
 presets:[
 {id:"starter",title:"Starter",mode:"own",rank:"TB",lower:"CB",partners:1,customers:100,cp:0.05,generation:1},
 {id:"build",title:"Aufbau",mode:"delta",rank:"TB",lower:"CB",partners:5,customers:200,cp:0.10,generation:1},
 {id:"lead",title:"Leadership",mode:"team",rank:"AM",lower:"TB",partners:10,customers:300,cp:0.10,generation:1},
 {id:"high",title:"High Performance",mode:"team",rank:"CM",lower:"TB",partners:50,customers:500,cp:0.10,generation:1}],
 quiz:[
 {q:"Entstehen CP allein durch eine Kundenregistrierung?",a:["Ja, jede Registrierung ist eine feste Monatsprovision","Nein. Im Modell zählen aktive Kunden und die CP aus ihrer Nutzung"],c:1,why:"Registrierung, Aktivität und vergütete Nutzung sind verschiedene Dinge."},
 {q:"100 aktive Kunden erzeugen im Beispiel je 0,10 CP. Bei 20 Euro pro CP ergibt das …",a:["200 Euro modellhafte Airtime vor Steuern","2.000 Euro garantierten Verdienst","20 Euro Abschlussprovision"],c:0,why:"100 × 0,10 = 10 CP. 10 CP × 20 Euro = 200 Euro. Der Satz setzt die entsprechende Berechtigung voraus."},
 {q:"Was unterscheidet Abschlussprovision und Airtime?",a:["Beide entstehen jeden Monat allein durch neue Namen","Abschlussprovision hängt an einem qualifizierten Anlass; Airtime an den CP des jeweiligen Abrechnungszeitraums"],c:1,why:"Eine einmalige Provision wird nicht automatisch zum wiederkehrenden Monatsverdienst."}],
 advancedQuiz:[
 {q:"Ein Country Manager hat einen Team Builder direkt unter sich. Welche Generation ist das?",a:["Generation 1, weil der Partner direkt darunter steht","Generation 3, weil der Rang niedriger ist"],c:0,why:"Die Generation folgt der Partnerkette und ist unabhängig vom Rang."},
 {q:"Dein IBM-Team hat 2.000 CP; weltweit entstehen 50.000 CP. Welche Größe zählt für den Welttopf?",a:["52.000 CP, Team und Welt zusammen","2.000 CP aus dem eigenen Team","50.000 CP weltweit"],c:2,why:"Das weltweite Volumen ist die Topfgrundlage; eigenes Teamvolumen wird nicht nochmals addiert."}]
};
function cRank(id){ return CC.ranks.filter(function(r){return r.id===id;})[0]||CC.ranks[0]; }
function cNum(v,integer,max){
 if(v===""||v==null||!isFinite(Number(v))||Number(v)<0||Number(v)>(max||1e9)) return null;
 var n=Number(v); return integer && Math.floor(n)!==n?null:n;
}
function cDefault(){ return {version:CC.version,card:0,seen:[],quiz:{},advanced:{},ownWords:"",calc:{mode:"own",rank:"P",lower:"CB",partners:1,customers:100,cp:0.05,generation:1,world:50000,ibms:1,ownTeam:2000,goal:""}}; }
function cEnsure(d){
 if(!d.commission || typeof d.commission!=="object") d.commission=cDefault();
 var def=cDefault(), c=d.commission;
 if(!Array.isArray(c.seen)) c.seen=[];
 if(!c.quiz) c.quiz={}; if(!c.advanced) c.advanced={};
 if(c.ownWords==null) c.ownWords="";
 if(!c.calc || typeof c.calc!=="object") c.calc=def.calc;
 for(var k in def.calc) if(c.calc[k]==null) c.calc[k]=def.calc[k];
 if(c.version!==CC.version){ c.quiz={}; c.advanced={}; c.seen=[]; c.version=CC.version; if(d.plan) d.plan.ok=false; }
 c.card=Math.max(0,Math.min(6,parseInt(c.card,10)||0));
 return d;
}
var _cMigrate=migrate;
migrate=function(d){ return cEnsure(_cMigrate(d)); };
var _cBlank=blank;
blank=function(lang){ return cEnsure(_cBlank(lang)); };
cEnsure(S);
function commissionQuizOk(){ return CC.quiz.every(function(q,i){return S.commission.quiz[i]===q.c;}); }
function commissionComplete(){
 var c=S.commission;
 return c.seen.indexOf(0)>=0 && c.seen.indexOf(1)>=0 && commissionQuizOk() && String(c.ownWords||"").trim().length>=20;
}
function cFactRows(){
 var f=window.TURBO_PRODUCT_FACTS||{}, data=f.facts||{};
 return [
 ["customer","Kundenablauf","Registrierung, Einkaufsprozess, Gutschrift, Einlösung und Voraussetzungen"],
 ["epay","ePAY-Status","Was ist nutzbar; welche Funktionen oder Termine sind bestätigt?"],
 ["costs","Kosten","Einmalige, wiederkehrende und optionale Kosten"],
 ["commission","Vergütungsanlässe","Qualifizierter Abschluss, CP, Anspruch und 50-%/30-%-Regel"],
 ["payout","Auszahlung","Abrechnungszeitraum, Stichtag, Auszahlung und Mindestbeträge"],
 ["plan","Aktuelle Planfassung","Datierte aktuelle Vergütungsunterlagen und bestätigte Modellwerte"],
 ["merchant","Händlerprozess","Verfügbarer Prozess, Rollen und bestätigte Händlervergütung"]
 ].map(function(x){ var d=data[x[0]]||{}; return {id:x[0],title:x[1],need:x[2],fact:d,ok:!!(d.confirmed&&String(d.text||"").trim()&&String(d.source||"").trim()&&String(d.checkedAt||"").trim())}; });
}
function productReady(){ return cFactRows().every(function(r){return r.ok;}); }
function cClosureReady(){return cFactRows().filter(function(r){return ['commission','costs','payout','plan'].indexOf(r.id)>=0;}).every(function(r){return r.ok;});}
function cClosureResult(){
 if(!cClosureReady())return '<p class="small muted">Der qualifizierte Abschluss, Kosten, Anspruch, Auszahlung und die aktuelle Planfassung sind noch nicht belegt. Deshalb wird hier keine Anzahl vergüteter Abschlüsse ausgegeben.</p>';
 var goal=cNum(S.commission.closureGoal,false,1e9),rank=cRank(S.commission.closureRank||'P'),rate=CC.closureRates[rank.id];
 if(goal==null||goal<=0)return '<p class="small muted">Gib einen positiven Zielbetrag für diese einmalige Beispielrechnung ein.</p>';
 var n=Math.ceil(goal/rate);
 return '<p><b>'+n+' qualifizierte Abschlüsse × '+rate+' € = '+cMoney(n*rate)+'.</b> Zielbetrag '+cMoney(goal)+' rechnerisch erreicht.</p><p class="small muted">Einmalige Abschlussprovision, keine Airtime. Rang und alle Voraussetzungen müssen zutreffen. Die Einordnung als Monatseinkommen setzt entsprechend viele qualifizierte Abschlüsse im betreffenden Monat voraus.</p>';
}
function cClosureHTML(){return '<p class="small muted">Abschlussprovisionen und Airtime-Sätze sind getrennte Werte. Die hier hinterlegten Abschluss-Sätze stammen aus der bisherigen undatierten Grafik; nach fachlicher Quellenfreigabe nutzbar.</p><div class="grid2"><label class="field"><span>Zielbetrag einmaliger Provision (optional)</span><input type="number" min="0" step="10" data-bind="commission.closureGoal" value="'+esc(S.commission.closureGoal||'')+'"></label><label class="field"><span>Rang im Abschluss-Beispiel</span><select data-bind="commission.closureRank">'+CC.ranks.map(function(r){return '<option value="'+r.id+'"'+((S.commission.closureRank||'P')===r.id?' selected':'')+'>'+r.id+' · '+r.name+'</option>';}).join('')+'</select></label></div><div id="commission-closure-results" aria-live="polite">'+cClosureResult()+'</div>';}
function cFactsHTML(){
 var rows=cFactRows(), open=rows.filter(function(r){return !r.ok;});
 var body='<p class="small muted">Offene Fragen sind kein persönlicher Fehler. Kläre den passenden Punkt mit deinem Ansprechpartner oder anhand der aktuellen Unterlagen, bevor du dazu eine konkrete Zusage machst.</p>';
 rows.forEach(function(r){ body+='<div class="qrow"><h3>'+r.title+' <span class="badge '+(r.ok?'b-ok':'b-warn')+'">'+(r.ok?'belegt':'noch zu klären')+'</span></h3><p class="small">'+esc(r.ok?r.fact.text:r.need)+'</p>'+(r.ok?'<p class="small muted">Quelle: '+esc(r.fact.source)+' · geprüft '+esc(r.fact.checkedAt)+'</p>':'')+'</div>'; });
 var msg='Hallo'+(S.leader?' '+S.leader:'')+', für meinen Start sind noch diese Produktfragen offen: '+open.map(function(r){return r.title+': '+r.need;}).join('; ')+'. Bitte zeig mir die aktuellen offiziellen Unterlagen.';
 if(open.length) body+='<button class="btn sm" data-act="tCopyTxt" data-v="'+esc(msg)+'">Offene Fragen als Nachricht kopieren</button>';
 return more('Bedingungen & offene Produktfragen ('+open.length+' offen)',body,"",false);
}
function cMoney(n){ return n.toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2})+' €'; }
function cCount(n){ return n.toLocaleString('de-DE',{maximumFractionDigits:4}); }
function cCalculate(a){
 var mode=a.mode, result={ok:false};
 if(['own','delta','team','world'].indexOf(mode)<0) return result;
 if(mode==='world'){
  var world=cNum(a.world,false,1e9), ibms=cNum(a.ibms,true,1000000);
  if(world==null||ibms==null||ibms<1) return result;
  return {ok:true,mode:mode,world:world,ibms:ibms,pot:world*CC.worldRate,value:world*CC.worldRate/ibms};
 }
 var people=cNum(a.customers,true,10000000), partners=mode==='own'?1:cNum(a.partners,true,1000000), cp=cNum(a.cp,false,1000);
 if(people==null||partners==null||cp==null) return result;
 var upper=cRank(a.rank), lower=cRank(a.lower), total=people*partners, points=total*cp;
 if(total>1e9||points>1e12) return result;
 result={ok:true,mode:mode,customers:total,points:points,upper:upper,lower:lower,cp:cp,partners:partners,each:people};
 if(mode==='own'){result.value=points*upper.rate;result.rate=upper.rate;}
 if(mode==='delta'){
  if(upper.rate<lower.rate) return {ok:false,reason:'Der obere Airtime-Satz darf im Differenzmodell nicht niedriger sein als der untere.'};
  result.rate=Math.max(0,upper.rate-lower.rate);result.value=points*result.rate;result.lowerShare=points*lower.rate;
 }
 if(mode==='team'){
  var gen=cNum(a.generation,true,4);if(gen==null||gen<1) return {ok:false};
  result.generation=gen;result.rate=CC.generationRates[gen]||0;result.value=points*result.rate;
  result.delta=points*Math.max(0,upper.rate-lower.rate);
 }
 return result;
}
function cResultHTML(){
 var a=S.commission.calc, r=cCalculate(a);
 if(!r.ok) return '<p class="small" role="alert">'+esc(r.reason||'Bitte gültige, nichtnegative Werte eingeben. Kunden und Partner sind ganze Zahlen; mindestens ein IBM ist nötig.')+'</p>';
 var h='';
 if(r.mode==='world'){
  h='<div class="grid3"><div class="kpi"><b>'+cMoney(r.pot)+'</b><span>Rechnerischer Welttopf</span></div><div class="kpi"><b>'+cCount(r.ibms)+'</b><span>Berechtigte IBMs im Beispiel</span></div><div class="kpi"><b>'+cMoney(r.value)+'</b><span>Rechnerischer Anteil je IBM</span></div></div><p class="small muted">'+cCount(r.world)+' weltweite CP × 10 € ÷ '+cCount(r.ibms)+' IBMs. Eigene Team-CP werden nicht nochmals addiert. Abrechnungszeitraum und Berechtigung sind separat zu bestätigen.</p>';
 }else{
  var label=r.mode==='own'?'Modellhafte eigene Airtime':r.mode==='delta'?'Rechnerische Rangdifferenz':'Modellhafte Team-Airtime';
  h='<div class="grid3"><div class="kpi"><b>'+cCount(r.customers)+'</b><span>Aktive Kunden im Beispiel</span></div><div class="kpi"><b>'+cCount(r.points)+'</b><span>Modellhafte CP im Zeitraum</span></div><div class="kpi"><b>'+cMoney(r.value)+'</b><span>'+label+' vor Steuern</span></div></div>';
  h+='<p class="small muted">'+cCount(r.customers)+' aktive Kunden × '+cCount(r.cp)+' angenommene CP = '+cCount(r.points)+' CP. '+cCount(r.points)+' CP × '+r.rate+' €/CP = '+cMoney(r.value)+'.</p>';
  if(r.mode==='delta') h+='<p class="small">Unterer Partneranteil separat: '+cCount(r.points)+' CP × '+r.lower.rate+' €/CP = '+cMoney(r.lowerShare)+'. Dies ist kein zusätzlicher eigener Verdienst.</p>';
  if(r.mode==='team') h+='<p class="small">Generation '+r.generation+': '+(r.generation>3?'Für diese Ebene ist im Modell keine Teamvergütung hinterlegt.':'Die Entfernung in der Partnerkette zählt; der Rang ändert die Generation nicht.')+'</p><p class="small">Rangdifferenz separat: '+cMoney(r.delta)+'. <b>Nicht zur Team-Airtime addieren:</b> Die Kumulierung auf denselben CP ist ungeklärt.</p>';
  if(r.mode==='own' && Number(a.goal)>0){
   var goal=cNum(a.goal,false,1e9), denom=r.cp*r.rate;
   if(goal!=null){h+=denom>0?'<p class="small"><b>Wunschziel '+cMoney(goal)+':</b> Rechnerisch mindestens '+cCount(Math.ceil(goal/denom))+' aktive Kunden unter diesen Annahmen. Das ist weder eine Kontaktquote noch eine Prognose zur Dauer.</p>':'<p class="small">Mit 0 CP pro Kunde lässt sich ein positives Wunschziel in diesem Modell nicht erreichen.</p>';}
  }
 }
 return h+'<p class="small muted">Modellrechnung für einen angenommenen Abrechnungsmonat. Keine typische oder garantierte Einnahme. Tatsächliche CP, Qualifikation, Kosten und Auszahlungsregeln bestimmen das Ergebnis.</p>';
}
function cField(name,label,type,min,max,step){
 var v=S.commission.calc[name];
 return '<label class="field"><span>'+label+'</span><input '+(type==='select'?'':'type="number" min="'+min+'" max="'+max+'" step="'+step+'" ')+'data-calc="'+name+'" value="'+esc(v)+'"></label>';
}
function cRankSelect(key,label){ return '<label class="field"><span>'+label+'</span><select data-calc="'+key+'">'+CC.ranks.map(function(r){return '<option value="'+r.id+'"'+(S.commission.calc[key]===r.id?' selected':'')+'>'+r.id+' · '+r.name+' · '+r.rate+' €/CP</option>';}).join('')+'</select></label>'; }
function cCalculatorHTML(){
 var a=S.commission.calc, h='<div class="card stack c-calculator"><span class="label">Selbst durchrechnen</span><h2>Dein Rechenbeispiel</h2><p class="small muted">Der gewählte Rang ist eine Beispielannahme, keine Feststellung deiner tatsächlichen Berechtigung.</p><div class="row c-controls">';
 [['own','Eigene Kunden'],['delta','CB / Rangdifferenz'],['team','Team'],['world','IBM-Welttopf']].forEach(function(x){h+='<button class="pill'+(a.mode===x[0]?' on':'')+'" data-act="cMode" data-v="'+x[0]+'" aria-pressed="'+(a.mode===x[0])+'">'+x[1]+'</button>';});
 h+='</div><div class="grid2">';
 if(a.mode==='world'){
  h+=cField('world','Weltweite Unternehmens-CP','number',0,1e9,1)+cField('ibms','Berechtigte IBMs im Beispiel','number',1,1e6,1)+cField('ownTeam','Eigene Team-CP (zum Vergleich, ändern den Topf nicht)','number',0,1e9,1);
 }else{
  h+=cRankSelect('rank',a.mode==='own'?'Rang für die Rechnung':'Oberer Rang im Beispiel');
  if(a.mode!=='own') h+=cRankSelect('lower','Unterer Partner im Beispiel')+cField('partners','Anzahl Partner / CBs','number',0,1e6,1);
  h+=cField('customers',a.mode==='own'?'Eigene aktive Kunden':'Aktive Kunden pro Partner','number',0,1e7,1)+cField('cp','Angenommene CP je aktivem Kunden im Monat','number',0,1000,0.01);
  if(a.mode==='team') h+='<label class="field"><span>Generation (unabhängig vom Rang)</span><select data-calc="generation">'+[1,2,3,4].map(function(g){return '<option value="'+g+'"'+(+a.generation===g?' selected':'')+'>'+g+(g===4?' · keine hinterlegte Teamvergütung':'')+'</option>';}).join('')+'</select></label>';
  if(a.mode==='own') h+=cField('goal','Persönliches Wunschziel vor Steuern (optional)','number',0,1e9,10);
 }
 h+='</div>'+(a.mode!=='world'?'<div class="row c-controls"><button class="btn sm" data-act="cCP" data-v="0.05">Beispiel: 0,05 CP</button><button class="btn sm" data-act="cCP" data-v="0.10">Beispiel: 0,10 CP</button></div>':'')+'<div id="commission-results" class="stack" aria-live="polite">'+cResultHTML()+'</div><div class="row c-controls"><button class="btn sm" data-act="cCopy">Berechnung kopieren</button><button class="btn sm ghost" data-act="cReset">Beispiel zurücksetzen</button></div></div>';
 return h;
}
function cCardHTML(index){
 var h='';
 if(index===0){
  h='<p>Du erklärst einen Nutzen und hilfst passenden Menschen beim Einstieg. Ob und wie du dafür Vergütung erhältst, hängt an der Tätigkeit und den geltenden Bedingungen.</p><div class="grid2"><div class="card"><h3>Abschlussprovision</h3><p class="small">Eine einmalige Provision für einen bestimmten qualifizierten Anlass. Was als Abschluss zählt, welche Kosten entstehen und wann ein Anspruch besteht, muss belegt sein.</p></div><div class="card hi"><h3>Airtime</h3><p class="small">Nutzungsbezogene Vergütung aus CP im jeweiligen Abrechnungszeitraum. Sie kann bei fortlaufender vergütungsfähiger Nutzung erneut entstehen. Eine Registrierung allein erzeugt keinen festen Monatsverdienst.</p></div></div><p class="small muted">Eigene Kunden, Zusammenarbeit mit Community Buildern und Teamaufbau sind verschiedene Wege. Du musst nicht zuerst ein großes Team aufbauen.</p>';
 }else if(index===1){
  h='<p><b>CP = Commission Points.</b> CP sind eine Rechengröße für vergütungsfähige Nutzung. Im Beispiel rechnen wir mit aktiven Kunden × angenommenen CP je Kunde. Echte CP ergeben sich aus den offiziellen Abrechnungsregeln.</p><p><b>Airtime = CP × dein berechtigter Rang-Satz.</b></p><div class="card hi"><span class="label">Beispiel Team Builder</span><h3>100 × 0,10 CP × 20 € = 200 €</h3><p class="small">100 aktive Kunden, 10 CP, 20 €/CP. Bei angenommenen 0,05 CP wären es 100 €. Beide CP-Werte sind Modellannahmen; weder ein garantierter Wert noch ein gemessener Durchschnitt.</p></div><p class="small muted">Der TB-Satz setzt die passende Qualifikation voraus. Auch ein kleineres Ziel braucht echte aktive Kunden, passende Voraussetzungen und einen Abrechnungszeitraum.</p>';
 }else if(index===2){
  h='<p>Im Modell arbeitet ein Team Builder mit einem Community Builder zusammen: TB 20 €/CP, CB 5 €/CP. Die rechnerische Differenz ist 15 €/CP.</p><div class="card hi"><h3>200 × 0,10 CP = 20 CP</h3><p>CB-Anteil separat: 20 × 5 € = <b>100 €</b>.<br>Rechnerische TB-Differenz: 20 × 15 € = <b>300 €</b>.</p></div><p class="small">Fünf vergleichbare CBs: 1.000 aktive Kunden, 100 CP, 1.500 € rechnerische TB-Differenz. Nicht zusätzlich Team Commission auf dieselben CP addieren.</p><p class="small muted">Ein Händler ist nicht automatisch ein CB. Der tatsächliche Händlerprozess und eine gesonderte Händler-Abschlussvergütung müssen aus aktuellen Unterlagen erklärt werden.</p>';
 }else if(index===3){
  h='<p><b>Generation = Entfernung in deiner Partnerkette.</b> Jeder direkte Partner ist Generation 1, unabhängig vom Rang. Ein Country Manager kann deshalb 50 Team Builder direkt in Generation 1 haben.</p><div class="grid3">'+[1,2,3].map(function(g){return '<div class="card"><span class="label">Generation '+g+'</span><h3>'+CC.generationRates[g]+' €/CP</h3><p class="small">'+['Dein direkter Partner','Partner deines direkten Partners','Die nächste Partnerebene'][g-1]+'</p></div>';}).join('')+'</div><p class="small muted">Das sind Modellwerte der Team-Airtime. Einmalige Team-Abschlussprovisionen (20 / 6 / 4 € laut Vergütungsgrafik) sind ein anderer Baustein; Anlass und Einheit nicht ungeprüft übernehmen. Für Generation 4 ist hier kein Team-Airtime-Satz hinterlegt.</p>';
 }else if(index===4){
  h='<p>Die vier Beispiele zeigen unterschiedliche Aufbausituationen. Sie sind weder typische Ergebnisse noch automatisch aufeinanderfolgende Karriereschritte.</p><div class="grid2 c-presets">';
  CC.presets.forEach(function(x){var r=cCalculate(x);h+='<button class="card pace" data-act="cPreset" data-v="'+x.id+'"><span class="label">'+x.title+'</span><h3>'+cMoney(r.value)+'</h3><p class="small">'+(x.mode==='own'?'100 aktive eigene Kunden, 0,05 CP, TB-Satz 20 €/CP':x.mode==='delta'?'5 CBs mit je 200 aktiven Kunden, 0,10 CP, Differenz 15 €/CP':x.id==='lead'?'10 direkte TBs mit je 300 aktiven Kunden, 0,10 CP, G1 10 €/CP':'50 direkte TBs mit je 500 aktiven Kunden, 0,10 CP, G1 10 €/CP')+'</p><small class="muted">Modellwert vor Steuern · im Rechner öffnen</small></button>';});
  h+='</div><p class="small">Leadership: Rangdifferenz separat 1.500 €. High Performance: Rangdifferenz separat 50.000 €. <b>Keine Gesamtwerte 4.500 € oder 75.000 € bilden</b>, solange Kumulierung und Anspruch nicht bestätigt sind.</p>';
 }else if(index===5){
  h='<p>Position, Generation und Vergütungsart sind verschieden. Der höhere Rang verändert den eigenen Airtime-Satz; die tatsächliche Partnerkette bestimmt die Generation.</p><div class="tablewrap"><table><thead><tr><th>Position</th><th>Airtime im Modell</th></tr></thead><tbody>'+CC.ranks.map(function(r){return '<tr><td>'+r.id+' · '+r.name+'</td><td>'+r.rate+' €/CP</td></tr>';}).join('')+'</tbody></table></div><p class="small muted">Qualifikation, Pack-Alternativen, 50-%-/30-%-Regeln und Berechtigung sind separat zu prüfen. Ein höherer Satz in der Rechnung bedeutet nicht, dass du die Position bereits erreicht hast. Zusätzliche Bonusarten werden nicht ungeprüft eingerechnet.</p>';
 }else{
  h='<p>Der IBM-Welttopf betrachtet das gesamte Unternehmen. Im Modell gilt: <b>weltweite Unternehmens-CP × 10 € ÷ berechtigte IBMs</b>.</p><div class="card hi"><h3>50.000 CP × 10 € = 500.000 €</h3><p>1 IBM: 500.000 € · 5 IBMs: 100.000 € je IBM · 10 IBMs: 50.000 € je IBM.</p></div><p class="small">Laut Provisionsvorgabe von Best Prime ist aktuell ein IBM im Modell hinterlegt (Stand 12.10.2026). Stichtag und Berechtigung bleiben zu prüfen. 2.000 eigene Team-CP ändern die Rechnung bei 50.000 weltweiten CP nicht.</p><div class="row c-controls">'+[1,5,6,7,8,9,10].map(function(n){return '<button class="btn sm" data-act="cIBM" data-v="'+n+'">'+n+' IBM'+(n>1?'s':'')+'</button>';}).join('')+'</div>';
 }
 return h;
}
function cLessonHTML(){
 var c=S.commission, i=c.card, h='<section class="card stack c-lesson"><span class="label">'+(i<2?'Grundlagen '+(i+1)+' / 2':'Optionale Vertiefung '+(i+1)+' / 7')+'</span><h2>'+CC.cards[i]+'</h2>'+cCardHTML(i);
 h+='<div class="row c-controls"><button class="btn ghost" data-act="cCard" data-v="'+Math.max(0,i-1)+'"'+(i===0?' disabled':'')+'>Zurück</button><button class="btn gold" data-act="cRead" data-v="'+i+'">'+(i===1?'Grundlagen gelesen':i===6?'Vertiefung gelesen':'Gelesen - weiter')+'</button></div>';
 h+='<p class="small muted">Grundlagen gelesen: '+((c.seen.indexOf(0)>=0?1:0)+(c.seen.indexOf(1)>=0?1:0))+' / 2. Vertiefungen sind für kleine Einstiegswege freiwillig.</p>';
 h+=more('Alle 7 Lernkarten auswählen','<div class="stack">'+CC.cards.map(function(t,j){return '<button class="btn '+(i===j?'pri':'ghost')+'" data-act="cCard" data-v="'+j+'">'+(j+1)+' · '+t+(j>=2?' (optional)':'')+'</button>';}).join('')+'</div>');
 return h+'</section>';
}
function cQuizHTML(advanced){
 var qs=advanced?CC.advancedQuiz:CC.quiz, answers=advanced?S.commission.advanced:S.commission.quiz;
 var h='<div class="stack">';
 qs.forEach(function(q,i){
  h+='<div class="stack" style="gap:8px"><h3>'+q.q+'</h3>';
  q.a.forEach(function(a,j){var selected=answers[i]===j, cls=selected?(j===q.c?' right':' wrong'):'';h+='<button class="opt'+cls+'" data-act="cQuiz" data-advanced="'+(advanced?'1':'0')+'" data-q="'+i+'" data-a="'+j+'">'+a+'</button>';});
  if(answers[i]!=null) h+='<p class="small" style="color:var(--'+(answers[i]===q.c?'ok':'warn')+')">'+(answers[i]===q.c?'Richtig. ':q.why)+'</p>';
  h+='</div>';
 });
 return h+'</div>';
}
R.plan=function(){
 var t=TX(), c=S.commission;S.plan.seen=true;
 var h=head('plan','Verstehe zuerst die Vergütungsart, dann ein kleines Rechenbeispiel. Teamaufbau und große Zahlen kannst du danach freiwillig vertiefen.');
 h+='<div class="card hi"><span class="label">Dein persönliches Ziel</span><p class="small">'+(pth()==='side'?t.side:'Wähle die Tätigkeit, die zu deinem Einstieg passt. Ein Rechenbeispiel hilft dir beim Verständnis; es ersetzt keine bestätigten Vergütungsbedingungen.')+'</p></div>';
 h+='<div class="card c-source"><p class="small muted">Modellwerte: Provisionsvorgabe von Best Prime, Stand 12.10.2026. Offizielle Kosten, Anspruch und Auszahlung sind separat zu bestätigen. '+(productReady()?'Produktangaben sind in der lokalen Quellenliste belegt.':'Produktfragen sind noch offen; Lernmodell und fachliche Freigabe sind getrennt.')+'</p></div>';
 h+=cLessonHTML()+more('Rechner: eigene Kunden, CB, Team und IBM',cCalculatorHTML(),'commission-calc',!!c.calcOpen);
 h+='<section class="card stack"><h2>Prüfe deinen Kern</h2><p class="small muted">Drei Grundlagenfragen; bei Fehlern kannst du direkt erneut antworten.</p>'+cQuizHTML(false)+
  '<label class="field"><span>In deinen Worten: Wie kann aus aktiver Kundennutzung Vergütung entstehen?</span><textarea rows="3" data-bind="commission.ownWords" placeholder="Erkläre den Zusammenhang zwischen Nutzung, CP, Rang-Satz und Bedingungen.">'+esc(c.ownWords||'')+'</textarea></label>'+
  '<p class="small muted">Deine Erklärung bleibt auf diesem Gerät. Die App prüft nur, ob du eine kurze Erklärung hinterlegt hast; sie bewertet deren fachliche Richtigkeit nicht automatisch.</p>'+
  '<label class="opt"><input type="checkbox" data-bind="plan.ok"'+(S.plan.ok?' checked':'')+'> Ich kenne den Unterschied zwischen Abschlussprovision und Airtime und weiß, welche Bedingungen noch offen sind.</label>'+
  '<div id="commission-check" class="small" aria-live="polite">'+(autoDone('plan')?'Grundlagen erledigt. Deine Erklärung kannst du mit deinem Ansprechpartner prüfen.':'Noch offen: beide Grundlagenkarten lesen, drei Fragen richtig beantworten, kurz in eigenen Worten erklären und bestätigen.')+'</div></section>';
 h+=more('Teamwissen prüfen (optional)',cQuizHTML(true))+cFactsHTML();
 h+=more('Offizielle Grafik als Detailansicht','<p class="small muted">Die bisherige Grafik ist undatiert. Vor konkreten Vergütungszusagen mit der aktuellen offiziellen Fassung abgleichen.</p><a class="planimg" href="img/verguetungsplan.jpg" target="_blank" rel="noopener"><img src="img/verguetungsplan.jpg" alt="Best Prime Vergütungsplan" loading="lazy"></a>');
 h+=more('Einmalige Abschlussprovision getrennt ansehen',cClosureHTML());
 h+='<div class="card stack"><h3>Dein nächster Schritt</h3><p class="small">'+(isTeam()?'Gehe zu deiner Namensliste und wähle passende Menschen für erste Gespräche.':pth()==='merch'?'Notiere passende Geschäfte. Kläre vor einem konkreten Angebot den aktuellen Händlerprozess.':'Notiere drei Namen und wähle einen Menschen, für den der tatsächliche Kundennutzen passen könnte.')+'</p><button class="btn pri" data-go="list">Zu meinen Namen</button></div>';
 return h;
};
var _cPayload=payload;
payload=function(){
 var p=_cPayload(), done=req().filter(function(m){return autoDone(m);});
 p.schemaVersion=2;p.path=pth();p.pace=S.pace;p.planAt=S.planAt||0;p.startedAt=S.planAt||0;
 p.doneModules=done.map(MT);p.doneIds=done;p.requiredIds=req();p.doneCount=done.length;p.total=req().length;p.pct=Math.round(done.length/p.total*100);
 p.level=level();p.diagDone=autoDone('start');p.quizOk=quiz2Ok();p.planOk=autoDone('plan');
 p.contacted=firstIds().length;p.sent=firstIds().length;p.firstSent=firstIds().length;p.followUps=fuCount();p.talks=okTalks().length;
 p.goalNames=Q().names;p.goalTop=Q().top;p.goalSent=Q().sent;p.talkRequired=req().indexOf('talk')>=0;
 var nextDate=S.fin.naWhen?new Date(S.fin.naWhen):null;
 p.planDuration=P().h;p.firstBlock=S.prof.block||'';p.nextActionAt=nextDate&&isFinite(nextDate.getTime())?nextDate.toISOString():'';p.nextActionDone=!!S.fin.naDone&&!S.fin.naSet;
 p.type='';p.diag=['',S.prof.time||'',''];p.dupDone=isTeam()&&S.dup.acc?1:0;
 /* Keine Motive, Kunden-/Partnernamen, Nachrichten, Eigenwort-Antworten oder freie Gesprächsnotizen. */
 return p;
};
document.addEventListener('click',function(e){
 var el=e.target.closest('[data-act]');if(!el)return;
 var a=el.getAttribute('data-act'),v=el.getAttribute('data-v'),c=S.commission;
 if(a==='cCard'){c.card=Math.max(0,Math.min(6,+v));save();render();}
 if(a==='cRead'){var i=+v;if(c.seen.indexOf(i)<0)c.seen.push(i);if(i===0||i>1&&i<6)c.card=i+1;save();render();}
 if(a==='cQuiz'){var ans=el.getAttribute('data-advanced')==='1'?c.advanced:c.quiz;ans[+el.getAttribute('data-q')]=+el.getAttribute('data-a');save();render();}
 if(a==='cMode'){c.calc.mode=v;c.calcOpen=true;save();render();}
 if(a==='cCP'){c.calc.cp=+v;c.calcOpen=true;save();render();}
 if(a==='cPreset'){var pr=CC.presets.filter(function(x){return x.id===v;})[0];if(pr){for(var k in pr)if(k!=='id'&&k!=='title')c.calc[k]=pr[k];save();render();var dt=document.querySelector('.c-calculator');if(dt){var details=dt.closest('details');if(details)details.open=true;dt.scrollIntoView({block:'start'});}}}
 if(a==='cIBM'){c.calc.mode='world';c.calc.ibms=+v;save();render();var dt2=document.querySelector('.c-calculator');if(dt2){var details2=dt2.closest('details');if(details2)details2.open=true;dt2.scrollIntoView({block:'start'});}}
 if(a==='cReset'){c.calc=cDefault().calc;c.calcOpen=true;save();render();}
 if(a==='cCopy'){var r=cCalculate(c.calc);if(!r.ok){toast('Bitte erst gültige Werte eingeben.');return;}var txt=document.getElementById('commission-results').innerText;copyText(txt);}
});
document.addEventListener('input',function(e){
 var el=e.target,key=el.getAttribute('data-calc');
 if(key&&el.tagName!=='SELECT'){S.commission.calc[key]=el.value;save();var out=document.getElementById('commission-results');if(out)out.innerHTML=cResultHTML();}
 if(el.getAttribute('data-bind')==='commission.closureGoal'){var one=document.getElementById('commission-closure-results');if(one)one.innerHTML=cClosureResult();}
 if(el.getAttribute('data-bind')==='commission.ownWords'){
  var out2=document.getElementById('commission-check');if(out2)out2.textContent=autoDone('plan')?'Grundlagen erledigt. Deine Erklärung bleibt eine Selbstauskunft.':'Beantworte die drei kurzen Fragen und bestätige dein Verständnis.';
  clearTimeout(cRenderTimer);cRenderTimer=setTimeout(function(){if(document.activeElement!==el)render();},500);
 }
});
var cRenderTimer=null;
document.addEventListener('toggle',function(e){if(e.target.classList&&e.target.classList.contains('commission-calc')){S.commission.calcOpen=e.target.open;save();}},true);
document.addEventListener('change',function(e){var el=e.target,key=el.getAttribute('data-calc');if(key&&el.tagName==='SELECT'){S.commission.calc[key]=el.value;save();var out=document.getElementById('commission-results');if(out)out.innerHTML=cResultHTML();}if(el.getAttribute('data-bind')==='commission.closureRank'){S.commission.closureRank=el.value;save();var one=document.getElementById('commission-closure-results');if(one)one.innerHTML=cClosureResult();}});
document.addEventListener('focusout',function(e){if(e.target.getAttribute('data-bind')==='commission.ownWords')setTimeout(function(){if(S.view==='plan')render();},100);});
/*@@QA_BOUNDARY@@*/
