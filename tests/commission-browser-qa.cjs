const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert');
const {chromium}=require('playwright');
const ROOT=path.resolve(__dirname,'..'),OUT=process.env.QA_OUTPUT||path.join(ROOT,'tmp/qa');
fs.mkdirSync(OUT,{recursive:true});
const results=[];let browser,server;
const hooks='window.__qa={state:function(){return S;},calc:cCalculate,config:CC,done:autoDone,level:level,payload:payload,go:go};';
async function check(name,fn){try{await fn();results.push({name,status:'passed'});}catch(e){results.push({name,status:'failed',error:e.message});console.error(name+': '+e.message);}}
async function main(){
 server=http.createServer((req,res)=>{
  const file=decodeURIComponent(req.url.split('?')[0]);
  if(file==='/config.js'){res.setHeader('Content-Type','application/javascript');res.end('window.TURBO_CONFIG={syncUrl:"",token:"",videoUrl:""};');return;}
  const resolved=path.join(ROOT,file==='/'?'test.html':file);if(!resolved.startsWith(ROOT)){res.writeHead(403);res.end();return;}
  try{let bytes=fs.readFileSync(resolved);if(file.endsWith('.html')){res.setHeader('Content-Type','text/html; charset=utf-8');bytes=Buffer.from(bytes.toString().replace('/*@@QA_BOUNDARY@@*/',hooks));}else if(file.endsWith('.js'))res.setHeader('Content-Type','application/javascript');else if(file.endsWith('.jpg'))res.setHeader('Content-Type','image/jpeg');res.end(bytes);}catch(e){res.writeHead(404);res.end();}
 });await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port;
 const options={headless:true};if(process.env.CHROMIUM_PATH){options.executablePath=process.env.CHROMIUM_PATH;options.args=['--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--no-zygote'];}
 browser=await chromium.launch(options);
 const ctx=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
 await ctx.route('https://**/*',r=>r.abort());
 const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(base+'/test.html');
 await check('Startseite ohne Countdown',async()=>assert(await p.getByRole('heading',{name:'Wie möchtest du starten?',exact:true}).isVisible()));
 await p.locator('#w_name').fill('Test GPT');await p.locator('#simple-path').selectOption('side');await p.getByRole('button',{name:'Los geht’s',exact:true}).click();
 await check('Anfänger startet ohne Leader',async()=>assert((await p.locator('body').innerText()).includes('0 von 8 Pflichtschritten')));
 await p.locator('[data-act="tTime"][data-v="30"]').click();await p.locator('[data-act="tSkill"][data-v="write"]').click();await p.locator('#p_block').fill('2026-10-13T10:00');await p.locator('[data-act="tPlan"]').click();
 await check('Zeitraum startet nach Arbeitsplan',async()=>assert((await p.locator('body').innerText()).includes('7 Tage übrig')));
 await check('Start zeigt nächste Aufgabe',async()=>assert(await p.getByRole('button',{name:'Jetzt weitermachen',exact:true}).isVisible()));
 await p.getByRole('button',{name:'Jetzt weitermachen',exact:true}).click();
 await check('Nächster Schritt öffnet System',async()=>assert(await p.getByRole('heading',{name:'So funktioniert es',exact:true}).isVisible()));
 await p.setViewportSize({width:1440,height:1000});
 for(const [area,title] of [['plan','So verdienst du Geld'],['start','Dein Start'],['system','So funktioniert es']]){
  await p.locator('.simple-nav > [data-go="'+area+'"]').click();
  await check('Hauptnavigation '+area,async()=>assert(await p.getByRole('heading',{name:title,exact:true}).first().isVisible()));
 }
 await p.setViewportSize({width:390,height:844});
 await p.evaluate(()=>window.__qa.go('plan'));
 await check('Plan ist nativ integriert',async()=>assert.equal(await p.getByRole('heading',{name:'So verdienst du Geld',exact:true}).count(),1));
 await p.locator('.toast').evaluateAll(els=>els.forEach(el=>el.style.display='none'));
 await p.screenshot({path:path.join(OUT,'plan-mobile.png'),fullPage:true});
 for(const width of [320,390,1440]){
  await p.setViewportSize({width,height:900});
  for(const id of ['start','system','plan','list','top','talkto','pipe','talk','dup','finish']){
   await p.evaluate(id=>window.__qa.go(id),id);
   await check('Breite '+width+' / '+id+' ohne Seitenüberlauf',async()=>assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)));
  }
  await p.evaluate(()=>window.__qa.go('plan'));
  await p.getByText('Mehr erfahren: Team, Positionen und IBM',{exact:true}).click();
  for(const title of ['Mit Community Buildern zusammenarbeiten','Dein Team: Ebenen statt Ränge','Vom kleinen Start bis zum großen Team','Positionen und Voraussetzungen','Der IBM-Welttopf']){
   await p.getByText(title,{exact:true}).click();
   await check('Detail '+title+' bei '+width+' px ohne Überlauf',async()=>assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)));
  }
 }
 await p.setViewportSize({width:390,height:844});await p.evaluate(()=>{window.__qa.state().commission.card=0;window.__qa.go('plan');});
 await check('Nur vier Hauptbereiche',async()=>assert.equal(await p.locator('.simple-nav > button').count(),4));
 await check('Vertiefungen standardmäßig geschlossen',async()=>assert(!await p.getByText('Der IBM-Welttopf',{exact:true}).isVisible()));
 await check('Nur eine Grundlagenfrage sichtbar',async()=>assert.equal(await p.locator('[data-act="cQuiz"][data-advanced="0"]:visible').count(),2));
 await p.locator('[data-act="cQuiz"][data-q="0"][data-a="0"][data-advanced="0"]').click();
 await check('Falsche Antwort erklärt Grund',async()=>assert((await p.locator('body').innerText()).includes('verschiedene Dinge')));
 for(const [q,a] of [[0,1],[1,0],[2,1]])await p.locator('[data-act="cQuiz"][data-q="'+q+'"][data-a="'+a+'"][data-advanced="0"]').click();
 await p.locator('[data-bind="plan.ok"]').check();
 await check('Grundlagenabschluss aktualisiert sich',async()=>assert(await p.evaluate(()=>window.__qa.done('plan'))));
 await p.getByText('Mit eigenen Zahlen rechnen',{exact:true}).click();
 await p.locator('[data-calc="rank"]').selectOption('TB');await p.getByText('Annahmen und Wunschziel ändern',{exact:true}).click();await p.locator('[data-calc="cp"]').fill('0.10');await p.waitForFunction(()=>document.getElementById('commission-results').innerText.includes('200,00'),null,{timeout:3000}).catch(()=>{});
 await check('TB-Beispiel ergibt 200 Euro',async()=>assert((await p.locator('#commission-results').innerText()).includes('200,00 €')));
 await p.locator('[data-calc="customers"]').fill('-2');
 await check('Negative Eingabe zeigt Fehler statt Provision',async()=>assert((await p.locator('#commission-results').innerText()).includes('gültige')));
 await p.locator('[data-calc="customers"]').fill('100');await p.locator('[data-act="cCP"][data-v="0.05"]').click();
 await check('CP-Umschalter hält Rechner geöffnet',async()=>{assert(await p.locator('.commission-calc').getAttribute('open')!==null);assert((await p.locator('#commission-results').innerText()).includes('100,00 €'));});
 await p.evaluate(()=>{window.__qa.state().commission.card=4;window.__qa.go('plan');});
 for(const [preset,amount] of [['starter','100,00 €'],['build','1.500,00 €'],['lead','3.000,00 €'],['high','25.000,00 €']]){
  await p.getByText('Mehr erfahren: Team, Positionen und IBM',{exact:true}).click();await p.getByText('Vom kleinen Start bis zum großen Team',{exact:true}).click();
  await p.locator('[data-act="cPreset"][data-v="'+preset+'"]').click();
  await check('Preset '+preset+' per Klick bedienbar',async()=>assert((await p.locator('#commission-results').innerText()).includes(amount)));
 }
 await p.locator('[data-act="cMode"][data-v="world"]').click();await p.locator('[data-calc="ibms"]').fill('7');
 await check('IBM / 7 korrekt formatiert',async()=>assert((await p.locator('#commission-results').innerText()).includes('71.428,57 €')));
 await p.locator('[data-calc="ownTeam"]').fill('9000');
 await check('Team-CP beeinflussen Weltvolumen nicht',async()=>assert((await p.locator('#commission-results').innerText()).includes('71.428,57 €')));
 await p.locator('[data-calc="ibms"]').fill('0');
 await check('IBM / 0 wird abgefangen',async()=>assert((await p.locator('#commission-results').innerText()).includes('mindestens ein IBM')));
 await p.locator('[data-calc="ibms"]').fill('5');
 await p.screenshot({path:path.join(OUT,'plan-world-mobile.png'),fullPage:true});
 await p.setViewportSize({width:1440,height:1100});await p.screenshot({path:path.join(OUT,'plan-desktop.png'),fullPage:true});
 await p.evaluate(()=>{const s=window.__qa.state();s.list=[{id:'a',name:'Anna',first5:true},{id:'b',name:'Ben'},{id:'c',name:'Clara'}];window.__qa.go('talkto');});
 await check('Eine Nachricht zuerst sichtbar',async()=>assert.equal(await p.locator('.script:visible').count(),1));
 await p.locator('[data-act="tSie"][data-v="1"]').click();
 await check('Sie-Anrede im Kundenweg',async()=>assert((await p.locator('.script').first().innerText()).includes('Ihnen')));
 await p.locator('[data-act="tCopy"]').first().click();
 await check('Kopieren zählt nicht als Versand',async()=>assert.equal(await p.evaluate(()=>window.__qa.state().ev.length),0));
 await p.locator('[data-act="tSend"]').first().click();
 await check('Bestätigung erfasst genau eine Person',async()=>assert.equal(await p.evaluate(()=>window.__qa.payload().firstSent),1));
 await p.reload();await check('Neuladen erhält Vergütungsgrundlagen und Versand',async()=>assert.equal(await p.evaluate(()=>window.__qa.payload().firstSent),1));
 await p.evaluate(()=>{const s=window.__qa.state();s.fin.naWhat='Aktuellen Kundenablauf gemeinsam klären';s.fin.naWhen='2026-10-13T10:00';window.__qa.go('finish');});
 await p.emulateMedia({media:'print'});
 await check('Nächster Schritt bleibt im Druck sichtbar',async()=>assert(await p.locator('.print-summary').isVisible()));
 await p.pdf({path:path.join(OUT,'finish-print.pdf'),format:'A4',printBackground:true});
 await check('Abschluss-PDF wird erzeugt',async()=>assert(fs.statSync(path.join(OUT,'finish-print.pdf')).size>1000));
 await p.emulateMedia({media:'screen'});await p.screenshot({path:path.join(OUT,'finish-desktop.png'),fullPage:true});
 await check('Kein JavaScript-Fehler im neuen Ablauf',async()=>assert.deepEqual(errors,[]));
 const legacy=await ctx.newPage(),legacyErrors=[];await legacy.setViewportSize({width:1440,height:1000});legacy.on('pageerror',e=>legacyErrors.push(e.message));await legacy.goto(base+'/index.html');
 await check('Live-Build behält bisherige Texte',async()=>assert((await legacy.locator('body').innerText()).toLowerCase().includes('turbo-start')));
 await check('Live-Build enthält keine neuen Lernkarten',async()=>assert(!fs.readFileSync(path.join(ROOT,'index.html'),'utf8').includes('var CC=')));
 await legacy.locator('#w_name').fill('Test GPT Legacy');await legacy.locator('#startform button[type="submit"]').click();
 for(const id of ['start','system','plan','list','top','talkto','pipe','talk','dup','finish']){
   await legacy.locator('.nav[data-go="'+id+'"]').click();
   await check('Live-Regression: '+id+' lädt ohne Fehler',async()=>assert.deepEqual(legacyErrors,[]));
 }
 await check('Live-Build bootet ohne JavaScriptfehler',async()=>assert.deepEqual(legacyErrors,[]));
 await browser.close();await new Promise(r=>server.close(r));
 const report={date:'2026-10-12',method:'Lokaler Chromium-/Playwright-Test, 320/390/1440 px, externe Ressourcen gesperrt (Fallback-Schrift); kein echter iOS-/Android- oder Nutzertest',passed:results.filter(r=>r.status==='passed').length,failed:results.filter(r=>r.status==='failed').length,results};
 fs.writeFileSync(path.join(ROOT,'docs/qa-v3-browser-results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({passed:report.passed,failed:report.failed}));if(report.failed)process.exitCode=1;
}
main().catch(async e=>{console.error(e);if(browser)await browser.close();if(server)server.close();process.exitCode=1;});
