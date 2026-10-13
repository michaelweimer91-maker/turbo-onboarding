/* Lokal: NODE_PATH auf jsdom setzen und node tests/commission-qa.cjs ausführen.
   Test-Hooks werden ausschließlich in den in-memory HTML-String eingebaut. */
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const {JSDOM,VirtualConsole}=require('jsdom');
const ROOT=path.resolve(__dirname,'..');
const results=[];
function check(name,fn){try{fn();results.push({name,status:'passed'});}catch(e){results.push({name,status:'failed',error:e.message});console.error(name,e.message);}}
const hook='window.__qa={state:function(){return S;},blank:blank,calc:cCalculate,config:CC,done:autoDone,level:level,payload:payload,addEv:addEv,firstIds:firstIds,go:go,migrate:migrate};';
function boot(file='test.html',seed){
 let html=fs.readFileSync(path.join(ROOT,file),'utf8').replace('/*@@QA_BOUNDARY@@*/',hook);
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM(html,{url:'https://qa.local/'+file,runScripts:'dangerously',virtualConsole:vc,beforeParse(w){
  w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.print=()=>{};
  w.fetch=()=>{throw new Error('Unexpected network request');};
  Object.defineProperty(w.navigator,'clipboard',{value:{writeText:()=>Promise.resolve()}});
  if(seed)w.localStorage.setItem(file==='test.html'?'bp_turbo_test_v1':'bp_turbo_preview_v2',JSON.stringify(seed));
 }});
 return {dom,w:dom.window,q:dom.window.__qa,errors};
}
let a=boot(),w=a.w,q=a.q;
check('Testversion bootet ohne Scriptfehler',()=>{assert(q);assert.deepEqual(a.errors,[]);assert(w.document.body.textContent.includes('Dein Start bei'));});
function active(){const s=q.state();s.name='Test GPT';s.startedAt=Date.now();s.path='side';s.pace='easy';s.view='plan';q.go('plan');return s;}
let s=active();
check('Natives Vergütungsmodul integriert',()=>assert(w.document.body.textContent.includes('So verdienst du Geld')));
check('Alle sieben Lernkarten vorhanden',()=>assert.equal(q.config.cards.length,7));
check('Kompakte Grundlagen; Vertiefungen optional',()=>{assert(w.document.body.textContent.includes('Drei Wege.')); assert(w.document.body.textContent.includes('optional'));});
check('Unbekannte Produktangaben bleiben offen',()=>assert(w.document.body.textContent.includes('7 offen')));
check('Reiner Plan-Haken ist kein Vergütungsverständnis',()=>{s.plan.ok=true;assert.equal(q.done('plan'),false);});
const cases=[
 ['TB 100 / 0,05 CP', {mode:'own',rank:'TB',customers:100,cp:.05},100],
 ['TB 100 / 0,10 CP', {mode:'own',rank:'TB',customers:100,cp:.1},200],
 ['TB → CB 200 Kunden', {mode:'delta',rank:'TB',lower:'CB',partners:1,customers:200,cp:.1},300],
 ['5 CB unter TB', {mode:'delta',rank:'TB',lower:'CB',partners:5,customers:200,cp:.1},1500],
 ['AM mit 10 direkten TB', {mode:'team',rank:'AM',lower:'TB',partners:10,customers:300,cp:.1,generation:1},3000],
 ['CM mit 50 direkten TB', {mode:'team',rank:'CM',lower:'TB',partners:50,customers:500,cp:.1,generation:1},25000],
 ['CM → TB Differenz separat', {mode:'delta',rank:'CM',lower:'TB',partners:50,customers:500,cp:.1},50000],
 ['IBM 1', {mode:'world',world:50000,ibms:1},500000],
 ['IBM 5', {mode:'world',world:50000,ibms:5},100000],
 ['IBM 7', {mode:'world',world:50000,ibms:7},500000/7],
 ['IBM 10', {mode:'world',world:50000,ibms:10},50000],
 ['Gleicher Rang: keine Differenz', {mode:'delta',rank:'TB',lower:'TB',partners:1,customers:200,cp:.1},0],
 ['G4: kein hinterlegter Team-Satz', {mode:'team',rank:'CM',lower:'TB',partners:1,customers:200,cp:.1,generation:4},0],
 ['G2 unabhängig vom Rang', {mode:'team',rank:'CM',lower:'RD',partners:1,customers:200,cp:.1,generation:2},60],
 ['G3 unabhängig vom Rang', {mode:'team',rank:'AM',lower:'AM',partners:1,customers:200,cp:.1,generation:3},40]
];
for(const [name,args,value] of cases)check(name,()=>assert(Math.abs(q.calc(args).value-value)<1e-7));
check('Eigene Team-CP verändern Welttopf nicht',()=>assert.equal(q.calc({mode:'world',world:50000,ibms:5,ownTeam:9000}).value,100000));
check('Keine automatische Addition Team + Differenz',()=>{const r=q.calc(cases[5][1]);assert.equal(r.value,25000);assert.equal(r.delta,50000);assert.equal(r.total,undefined);});
for(const [name,args] of [
 ['IBM null', {mode:'world',world:50000,ibms:0}],
 ['IBM Dezimal', {mode:'world',world:50000,ibms:1.5}],
 ['Negative Kunden', {mode:'own',rank:'TB',customers:-1,cp:.1}],
 ['Leere Kunden', {mode:'own',rank:'TB',customers:'',cp:.1}],
 ['Dezimale Kunden', {mode:'own',rank:'TB',customers:1.5,cp:.1}],
 ['Ungültige Differenz', {mode:'delta',rank:'P',lower:'TB',partners:1,customers:200,cp:.1}],
 ['Unendliche CP', {mode:'own',rank:'TB',customers:100,cp:Infinity}]
])check(name+' wird nicht als Ergebnis ausgegeben',()=>assert.equal(q.calc(args).ok,false));
function click(selector){const el=w.document.querySelector(selector);assert(el,selector);el.click();}
check('Keine Pflichtklicks durch sieben Karten',()=>assert.equal(w.document.querySelectorAll('[data-act="cRead"]').length,0));
check('Falsche Vergütungsantwort bleibt offen',()=>{click('[data-act="cQuiz"][data-q="0"][data-a="0"][data-advanced="0"]');assert.equal(q.done('plan'),false);assert(w.document.body.textContent.includes('verschiedene Dinge'));});
check('Drei Antworten schließen den Selbstcheck ab; Erklärung bleibt optional',()=>{
 click('[data-act="cQuiz"][data-q="0"][data-a="1"][data-advanced="0"]');click('[data-act="cQuiz"][data-q="1"][data-a="0"][data-advanced="0"]');click('[data-act="cQuiz"][data-q="2"][data-a="1"][data-advanced="0"]');
 assert.equal(q.done('plan'),true);
 const text=w.document.querySelector('[data-bind="commission.ownWords"]');text.value='Aus vergütungsfähiger Nutzung entstehen CP; CP mal berechtigter Satz ergibt modellhafte Airtime.';text.dispatchEvent(new w.Event('input',{bubbles:true}));s.plan.ok=true;assert.equal(q.done('plan'),true);
});
check('Fortgeschrittenen-Quiz blockiert Einsteiger nicht',()=>assert.equal(q.done('plan'),true));
check('High-Performance-Preset zeigt getrennte Beträge',()=>{click('[data-act="cPreset"][data-v="high"]');const text=w.document.getElementById('commission-results').textContent;assert(text.includes('25.000,00'));assert(text.includes('50.000,00'));assert(!text.includes('75.000,00'));});
check('Aktiv ohne bestätigten Arbeitsplan bleibt gesperrt',()=>{
 s.qz={0:0,1:1,2:2,3:1};s.prof={time:'30',skill:'write',block:'2026-10-13T10:00'};s.planAt=0;
 s.list=[{id:'1',name:'Anna',first5:true,status:'NO'},{id:'2',name:'Ben'},{id:'3',name:'Clara'}];s.ev=[{c:'1',t:'a1',k:'first',at:Date.now()}];assert(q.level()<2);
});
check('Aktiv ohne Vergütungsgrundlagen bleibt gesperrt',()=>{s.planAt=Date.now();s.plan.ok=false;assert(q.level()<2);});
check('Aktiv im Nebenverdienstweg ohne eigenen Partner möglich',()=>{s.plan.ok=true;assert.equal(q.level(),2);});
check('Versand-Doppelbestätigung erhöht Zähler nicht',()=>{assert(q.addEv('2','a2','first'));assert.equal(q.addEv('2','a2','first'),false);assert.equal(q.firstIds().length,2);});
check('Zweite Vorlage ist keine zweite Person',()=>{q.addEv('2','a3','first');assert.equal(q.firstIds().length,2);});
check('Payload enthält keine Kontakt-/Nachrichtentexte oder eigene Erklärung',()=>{const p=q.payload();const text=JSON.stringify(p);assert(!text.includes('Anna'));assert(!text.includes('Clara'));assert(!text.includes(s.commission.ownWords));assert.equal(p.schemaVersion,2);assert.equal(p.path,'side');assert.equal(p.planDuration,168);assert.equal(p.planOk,true);});
check('Pflichtabschluss zählt keine optionalen Teamaufgaben',()=>{const p=q.payload();assert.equal(p.total,8);assert(!p.requiredIds.includes('dup'));});
check('Alle zehn Ansichten rendern fehlerfrei',()=>{for(const id of ['start','system','plan','list','top','talkto','pipe','talk','dup','finish'])q.go(id);assert.deepEqual(a.errors,[]);});
check('Jede Ansprache hat eine Sie-Fassung',()=>{for(const g of ['an','vk','fu'])for(const tpl of w.I18N.de.scripts[g])assert(tpl[3]&&tpl[3].trim().length>10);});
const clTxt=(cl)=>{s.commission.cl=cl;q.go('plan');return w.document.getElementById('commission-closure-results').textContent;};
check('Abschluss: TB schreibt Premium selbst ein = 3 × 40 = 120 €',()=>assert(clTxt({pkg:'premium',n:1,me:'TB',who:'self'}).includes('120,00 €')));
check('Abschluss: AM über direktem TB erhält nur Differenz 3 × 2 = 6 €',()=>{const t=clTxt({pkg:'premium',n:1,me:'AM',who:'g1',partner:'TB'});assert(t.includes('Differenzprovision')&&t.includes('6,00 €'));});
check('Abschluss: TB über CB erhält Differenz 3 × 30 = 90 €',()=>assert(clTxt({pkg:'premium',n:1,me:'TB',who:'g1',partner:'CB'}).includes('90,00 €')));
check('Abschluss: gleiche Stufe Gen. 1 = Team-Abschluss 3 × 20 = 60 €, keine Differenz',()=>{const t=clTxt({pkg:'premium',n:1,me:'TB',who:'g1',partner:'TB'});assert(t.includes('Team-Abschlussprovision Gen. 1')&&t.includes('60,00 €'));});
check('Abschluss: gleiche Stufe Gen. 2/3 = 18 € / 12 €',()=>{assert(clTxt({pkg:'premium',n:1,me:'AM',who:'g2'}).includes('18,00 €'));assert(clTxt({pkg:'premium',n:1,me:'AM',who:'g3'}).includes('12,00 €'));});
check('Abschluss: direkter Partner mit höherem Rang ergibt 0 €',()=>assert(clTxt({pkg:'premium',n:1,me:'TB',who:'g1',partner:'AM'}).includes('0,00 €')));
check('Abschluss: CB nur Generation 1',()=>assert(clTxt({pkg:'premium',n:1,me:'CB',who:'g2'}).includes('0,00 €')));
check('Abschluss: Voucher 1 CP, 5 Stück als TB = 200 €',()=>assert(clTxt({pkg:'voucher',n:5,me:'TB',who:'self'}).includes('200,00 €')));
check('Abschluss: ungültige Anzahl ohne Ergebnis',()=>assert(clTxt({pkg:'premium',n:-3,me:'TB',who:'self'}).includes('mindestens 1')));
check('Abschluss: Tiefen-Tabelle für AM zeigt Differenz zu TB und Team-Generationen',()=>{clTxt({pkg:'premium',n:1,me:'AM',who:'self'});const d=w.document.getElementById('commission-closure-depth').textContent;assert(d.includes('126,00 €')&&d.includes('6,00 €')&&d.includes('60,00 €')&&d.includes('12,00 €'));});
check('Abschluss: Hinweis keine Einkommensgarantie',()=>assert(w.document.getElementById('commission-closure-box').textContent.includes('Keine Einkommensgarantie')));
check('Druckzusammenfassung enthält nächsten Schritt',()=>{s.fin.naWhat='Kundenablauf mit Ansprechpartner klären';s.fin.naWhen='2026-10-13T10:00';q.go('finish');assert(w.document.querySelector('.print-summary').textContent.includes(s.fin.naWhat));});
const old={v:1,pid:'legacy123',name:'Altpartner',lang:'de',startedAt:1,view:'start',done:{plan:true},list:[{id:'oldc',name:'Altkontakt',status:'TERMIN'}],pitch:{reps:3,leaderOk:true},quiz:{},talks:[{who:'Altkontakt',lever:'alter Eintrag'}],diag:{q0:'privates Motiv'},sent:{a1:30},dup:{},fin:{},plan:{ok:true},multi:{size:100,rate:10,levels:6}};
let oldApp=boot('test.html',old);
check('Alte Identität und Kontakte bleiben erhalten',()=>{const m=oldApp.q.state();assert.equal(m.pid,'legacy123');assert.equal(m.list[0].name,'Altkontakt');assert.equal(m.list[0].status,'TERMIN');});
check('Altzähler sind keine neuen bestätigten Ereignisse',()=>{assert.equal(oldApp.q.firstIds().length,0);assert.equal(oldApp.q.done('plan'),false);});
check('Altpartner muss Weg und Tempo bewusst wählen',()=>{assert.equal(oldApp.q.state().path,'');assert.equal(oldApp.q.state().pace,'');});
let preview=boot('onboarding-preview.html',old);
check('Live-Migrationsvorschau bleibt isoliert',()=>{assert(preview.q);assert.equal(preview.q.state().pid,'legacy123');assert.equal(preview.w.localStorage.getItem('bp_turbo_v1'),null);});
const gas={};vm.createContext(gas);vm.runInContext(fs.readFileSync(path.join(ROOT,'gas/Turbo.gs'),'utf8'),gas);
check('Controlling erhält erste 36 Altspalten',()=>assert.equal(gas.TURBO_HEAD[35],'Erledigte Schritte'));
check('7-Tage-Kundenweg ohne Leader-Haken wird passend bewertet',()=>{const p=q.payload();p.planAt=Date.now();p.level=2;const r=gas.turboAssess_(p,Date.now());assert.equal(r.ampel,'GRÜN');assert(!r.lever.includes('30'));assert.equal(r.left,168);});
check('Kein bestätigter Arbeitsplan löst keinen falschen 48h-Verzug aus',()=>{const r=gas.turboAssess_({schemaVersion:2,pace:'easy',planAt:0,requiredIds:['start'],doneIds:[]},Date.now());assert.equal(r.ampel,'GELB');});
check('Controlling-Zeile passt zu Spaltenzahl',()=>assert.equal(gas.turboRow_(q.payload(),Date.now()).length,gas.TURBO_HEAD.length));
let live=boot('index.html');
check('Live-Start zeigt neue Nutzerführung ohne Händlerweg',()=>{const sel=live.w.document.getElementById('simple-path');assert(sel);assert(![...sel.options].some(o=>o.value==='merch'));assert.deepEqual(live.errors,[]);});
for(const x of [a,oldApp,preview,live])x.dom.window.close();
const report={date:'2026-10-12',method:'Node + JSDOM: DOM-/Zustands- und Rechenlogik; kein Layout-, Geräte- oder echter Nutzertest',passed:results.filter(r=>r.status==='passed').length,failed:results.filter(r=>r.status==='failed').length,results};
fs.mkdirSync(path.join(ROOT,'docs'),{recursive:true});fs.writeFileSync(path.join(ROOT,'docs/qa-v3-dom-results.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({passed:report.passed,failed:report.failed}));if(report.failed)process.exit(1);
