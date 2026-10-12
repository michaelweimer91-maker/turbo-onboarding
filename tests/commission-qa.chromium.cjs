/* Alternative Ausführung von tests/commission-qa.cjs OHNE jsdom (z. B. wenn npm gesperrt ist).
   Die Prüfungen aus commission-qa.cjs werden unverändert übernommen und in Chromium ausgeführt:
   jede boot()-Instanz läuft in einem eigenen iframe (document.open/write), statt in einem JSDOM-Fenster.
   Aufruf: NODE_PATH=<node_modules mit playwright> CHROMIUM_PATH=<chrome> node tests/commission-qa.chromium.cjs
   Ergebnis: docs/qa-v3-dom-results.json (Methode wird als „Chromium-iframe statt JSDOM“ ausgewiesen). */
const fs=require('fs'),path=require('path'),http=require('http');
const {chromium}=require('playwright');
const ROOT=path.resolve(__dirname,'..');
let src=fs.readFileSync(path.join(__dirname,'commission-qa.cjs'),'utf8');
/* Node-Kopf entfernen, boot() asynchron machen, JSDOM durch iframe-Fenster ersetzen */
src=src.replace(/^const fs=require[^\n]*\n/m,'').replace(/^const \{JSDOM,VirtualConsole\}=require[^\n]*\n/m,'').replace(/^const ROOT=[^\n]*\n/m,'');
src=src.replace('function boot(','async function boot(')
 .replace(/const errors=\[\],vc=new VirtualConsole\(\);vc\.on\('jsdomError',e=>errors\.push\(e\.message\)\);\n const dom=new JSDOM\(html,\{url:[^,]+,runScripts:'dangerously',virtualConsole:vc,beforeParse\(w\)\{/,"const errors=[];\n const dom=await __makeDom(html,errors,function(w){")
 .replace(/\n \}\}\);\n return \{dom,w:dom\.window,q:dom\.window\.__qa,errors\};/,"\n });\n return {dom,w:dom.window,q:dom.window.__qa,errors};")
 .replace('let a=boot(),','let a=await boot(),').replace("let oldApp=boot(","let oldApp=await boot(").replace("let preview=boot(","let preview=await boot(").replace("let live=boot(","let live=await boot(")
 .replace("const gas={};vm.createContext(gas);vm.runInContext(fs.readFileSync(path.join(ROOT,'gas/Turbo.gs'),'utf8'),gas);","const gas=__runGas(fs.readFileSync(path.join(ROOT,'gas/Turbo.gs'),'utf8'));")
 .replace("if(report.failed)process.exit(1);","");
if(!/async function boot/.test(src)||!/__makeDom/.test(src)||!/__runGas/.test(src)) throw new Error('Umbau der Testdatei fehlgeschlagen – commission-qa.cjs hat sich geändert');
const files={};for(const f of ['test.html','index.html','onboarding-preview.html','gas/Turbo.gs'])files[f]=fs.readFileSync(path.join(ROOT,f),'utf8');
const runner=`<!doctype html><meta charset="utf-8"><body><script>
const __files=${JSON.stringify(files).replace(/<\//g,'<\\/')};const __out={};
const path={join:(a,b)=>b,resolve:()=>''};const __dirname='';const ROOT='';
const fs={readFileSync:(p)=>{if(!(p in __files))throw new Error('Datei fehlt: '+p);return __files[p];},writeFileSync:(p,t)=>{__out[p]=t;},mkdirSync:()=>{}};
function assert(v,m){if(!v)throw new Error(m||'assert fehlgeschlagen');}
assert.equal=(a,b)=>{if(a!=b)throw new Error('erwartet '+JSON.stringify(b)+', erhalten '+JSON.stringify(a));};
assert.deepEqual=(a,b)=>{if(JSON.stringify(a)!==JSON.stringify(b))throw new Error('erwartet '+JSON.stringify(b)+', erhalten '+JSON.stringify(a));};
const console={log:(...x)=>{__out.__log=(__out.__log||'')+x.join(' ')+'\\n';},error:(...x)=>{__out.__err=(__out.__err||'')+x.join(' ')+'\\n';}};
function __runGas(code){const names=[...code.matchAll(/^(?:var|function)\\s+([A-Za-z_$][\\w$]*)/gm)].map(m=>m[1]);const fn=new Function(code+'\\nreturn {'+[...new Set(names)].map(n=>n+':'+n).join(',')+'};');return fn();}
function __makeDom(html,errors,before){return new Promise(res=>{
 const fr=document.createElement('iframe');document.body.appendChild(fr);const w=fr.contentWindow;
 w.onerror=(m)=>{errors.push(String(m));};w.localStorage.clear();
 const d=w.document;d.open();before(w);
 w.addEventListener('load',()=>res({window:w,close:()=>{}}));
 d.write(html);d.close();
 setTimeout(()=>res({window:w}),4000);
});}
window.__done=(async()=>{try{${src.replace(/<\/script/gi,'<\\/script')}
}catch(e){__out.__fatal=String(e&&e.stack||e);}return __out;})();
<\/script>`;
async function main(){
 const server=http.createServer((req,res)=>{const f=decodeURIComponent(req.url.split('?')[0]);
  if(f==='/runner.html'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(runner);return;}
  if(f==='/config.js'){res.setHeader('Content-Type','application/javascript');res.end(fs.readFileSync(path.join(ROOT,'config.js')));return;}
  res.writeHead(404);res.end();});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const opt={headless:true};if(process.env.CHROMIUM_PATH){opt.executablePath=process.env.CHROMIUM_PATH;opt.args=['--no-sandbox','--disable-gpu','--disable-dev-shm-usage'];}
 const browser=await chromium.launch(opt);const ctx=await browser.newContext({serviceWorkers:'block',locale:'de-DE'});await ctx.route('https://**/*',r=>r.abort());
 const page=await ctx.newPage();await page.goto('http://127.0.0.1:'+server.address().port+'/runner.html');
 const pageErr=[];page.on('pageerror',e=>pageErr.push(e.message));
 const out=await page.evaluate(()=>window.__done);
 if(!out){console.error('Runner nicht gestartet: '+pageErr.join(' | '));process.exitCode=1;await browser.close();server.close();return;}await browser.close();server.close();
 if(out.__fatal){console.error(out.__fatal);process.exitCode=1;return;}
 const key=Object.keys(out).find(k=>k.endsWith('qa-v3-dom-results.json'));
 const report=JSON.parse(out[key]);report.method='Chromium (iframe je App-Instanz) statt JSDOM – gleiche Prüfungen wie tests/commission-qa.cjs; kein Layout-, Geräte- oder Nutzertest';
 fs.writeFileSync(path.join(ROOT,'docs/qa-v3-dom-results.json'),JSON.stringify(report,null,2));
 if(out.__err)process.stderr.write(out.__err);
 console.log(JSON.stringify({passed:report.passed,failed:report.failed}));if(report.failed)process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exitCode=1;});
