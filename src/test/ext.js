/* ===== TESTVERSION – Nutzerführung nach Anpassungsauftrag 12.10.2026 =====
   Wird von build.py NUR in test.html an der Stelle @@TEST_EXT@@ (innerhalb der App-Closure) eingefügt.
   Ersetzt Darstellung und Fortschrittslogik; Live-App (index.html) bleibt unverändert. */
if(ONBOARD){
/* ---------- Sprachen (nur Test/Vorschau): fest eingebaute Texte laufen über tr(deutscherText) ----------
   Übersetzungen: I18N.<sprache>.str[deutscherText] (erzeugt von build.py aus src/test/i18n/*.json).
   Fehlt eine Übersetzung, bleibt der deutsche Text stehen. Sprachwechsel lädt die Seite neu,
   damit auch beim Start erzeugte Texte (Vergütungsmodell) in der neuen Sprache erscheinen. */
var TRL=(function(){ try{ var d=JSON.parse(localStorage.getItem(KEY)||"null"); if(d && d.lang && I18N[d.lang]) return d.lang; }catch(e){} var h=(location.hash||"").replace("#","").toLowerCase(); return I18N[h]?h:detectLang(); })();
function tr(s){ var d=I18N[TRL] && I18N[TRL].str; return d && d[s]!=null ? d[s] : s; }
var _setLangT=setLang;
setLang=function(l){ _setLangT(l); TRL=S.lang; };
switchLang=function(l){
  if(l===S.lang) return;
  keepDraft(); try{ sessionStorage.setItem("bp_turbo_draft",JSON.stringify(draft)); }catch(e){}
  setLang(l); save(); flush(); location.reload();
};
/* ---------- Hell / Dunkel (Gerätevorgabe, eigener Schlüssel – nicht Teil des Partner-Fortschritts) ---------- */
var THEME_KEY="bp_turbo_theme";
function themeGet(){ try{ var t=localStorage.getItem(THEME_KEY); if(t==="light"||t==="dark") return t; }catch(e){} return (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches)?"light":"dark"; }
function themeApply(t){ document.documentElement.setAttribute("data-theme",t); var m=document.querySelector('meta[name="theme-color"]'); if(m) m.setAttribute("content",t==="light"?"#f5f1e8":"#0b1a22"); }
function themeBtn(compact){ var t=themeGet(); return '<button type="button" class="themebtn noprint" data-act="theme" data-compact="'+(compact?1:0)+'" aria-label="'+esc(tr("Hell- oder Dunkelmodus"))+'" title="'+esc(tr("Hell- oder Dunkelmodus"))+'">'+(t==="light"?"☾":"☀")+(compact?"":" "+(t==="light"?tr("Dunkel"):tr("Hell")))+'</button>'; }
themeApply(themeGet());
document.addEventListener("click",function(e){ var b=e.target.closest && e.target.closest('[data-act="theme"]'); if(!b) return; var t=themeGet()==="light"?"dark":"light"; try{ localStorage.setItem(THEME_KEY,t); }catch(err){} themeApply(t); Array.prototype.forEach.call(document.querySelectorAll('[data-act="theme"]'),function(x){ x.outerHTML=themeBtn(x.getAttribute("data-compact")==="1"); }); });
var TX=function(){ return L.tx; };
var PATHS=["side","cust","merch","net","team","unsure"];
function pth(){ return S.path||"unsure"; }
function isTeam(){ return pth()==="team"; }
/* Ziele des gewählten Wegs: Teamweg behält 30/10/5 bzw. 10/5/3, alle anderen starten klein */
function Q(){ var p=P(); return isTeam()?{names:p.names,top:p.top,first:p.first,sent:p.sent,cont:p.cont}:{names:3,top:0,first:1,sent:1,cont:1}; }
/* Pflichtschritte je Weg (zentral definiert) */
var REQ={side:["start","system","plan","list","top","talkto","pipe","finish"],cust:["start","system","plan","list","top","talkto","pipe","finish"],merch:["start","system","plan","list","top","talkto","pipe","finish"],
  net:["start","system","plan","list","top","talkto","pipe","talk","finish"],team:["start","system","plan","list","top","talkto","pipe","talk","dup","finish"],unsure:["start","system","plan","list","top","talkto","pipe","finish"]};
function req(){ return REQ[pth()]||REQ.unsure; }
var DEF_GROUP={side:"cu",cust:"cu",merch:"me",net:"co",team:"pa",unsure:"cu"};

/* ---------- Zustand ergänzen (sichere Standards, alte Sicherungen bleiben ladbar) ---------- */
var _migrate=migrate;
migrate=function(d){ var hadFlow=!!(d.prof && d.path); d=_migrate(d); if(!d.prof) d.prof={}; if(!Array.isArray(d.ev)) d.ev=[]; if(!d.qz) d.qz={}; if(d.path==null) d.path=""; if(d.planAt==null) d.planAt=0; if(d.sie==null) d.sie=false; if(!hadFlow){d.pace="";d.planAt=0;d.plan.ok=false;} return d; };
var _blank=blank;
blank=function(lang){ var b=_blank(lang); b.prof={}; b.ev=[]; b.qz={}; b.path=""; b.planAt=0; b.sie=false; b.pace=""; return b; };
S=blank(); /* neu aufbauen, damit Testfelder existieren */

/* ---------- Versand-Ereignisse: Kontakt + Vorlage + Zeitpunkt, doppelte Bestätigung zählt nicht ---------- */
function addEv(cid,tpl,kind){ for(var i=0;i<S.ev.length;i++){ if(S.ev[i].c===cid && S.ev[i].t===tpl) return false; } S.ev.push({c:cid,t:tpl,k:kind,at:Date.now()}); return true; }
function firstIds(){ var o={}; S.ev.forEach(function(e){ if(e.k==="first" && findC(e.c)) o[e.c]=1; }); return Object.keys(o); }
function fuCount(){ return S.ev.filter(function(e){ return e.k==="fu" && findC(e.c); }).length; }
function okTalks(){ return S.talks.filter(function(t){ return t.ok; }); }
function quiz2Ok(){ var qz=TX().quiz; for(var i=0;i<qz.length;i++){ if(S.qz[i]!==qz[i].c) return false; } return true; }
function quiz2Right(){ var qz=TX().quiz, n=0; for(var i=0;i<qz.length;i++){ if(S.qz[i]===qz[i].c) n++; } return n; }
function addressed(){ var ids=firstIds(); return S.list.filter(function(c){ return ids.indexOf(c.id)>=0; }); }
function pipeOk(){ var a=addressed(); if(a.length<Q().cont) return false; return a.every(function(c){ return c.status==="NO"||c.status==="GO"||(c.next&&c.date); }); }
function profOk(){ var p=S.prof; return !!(S.path && S.pace && p.time && p.skill && p.block); }
function topOk(){ return isTeam()? (tops().length>=Q().top && first5().length>=Q().first) : first5().length>=1; }
function dupOk(){ var d=S.dup; return d.yes? !!d.acc : !!((d.inv||"").trim() && d.invDate); }

autoDone=function(id){
  switch(id){
   case "start": return profOk() && !!S.planAt;
   case "system": return quiz2Ok();
   case "plan": return !!S.plan.ok && commissionComplete();
   case "list": return S.list.length>=Q().names;
   case "top": return topOk();
   case "talkto": return firstIds().length>=Q().sent;
   case "pipe": return pipeOk();
   case "talk": return okTalks().length>=1;
   case "dup": return dupOk();
   case "finish": return !!(S.fin.naSet||S.fin.naDone);
  }
  return false;
};
function partial(id){
  switch(id){
   case "start": return !!(S.path||S.pace||S.prof.time);
   case "system": return Object.keys(S.qz).length>0||S.pitch.reps>0;
   case "plan": return !!S.plan.seen;
   case "list": return S.list.length>0;
   case "top": return first5().length>0||tops().length>0;
   case "talkto": return S.list.some(function(c){ return c.status==="PREP"; })||firstIds().length>0;
   case "pipe": return addressed().length>0;
   case "talk": return S.talks.length>0;
   case "dup": return !!(S.dup.inv||S.dup.partner||S.dup.yes);
   case "finish": return !!(S.fin.naWhat||"").trim();
  }
  return false;
}
isOpt=function(m){ return req().indexOf(m)<0; };
isDone=function(m){ return autoDone(m); };
totalReq=function(){ return req().length; };
navCls=function(m){ return autoDone(m)?"done":(partial(m)?"auto":""); };
var ACT=["start","plan","list","top","talkto","pipe","talk"];
function activeMissing(){ var out=[]; ACT.forEach(function(m){ if(req().indexOf(m)>=0 && !autoDone(m)) out.push(MT(m)); }); return out; }
level=function(){
  var u=quiz2Ok(), a=u && activeMissing().length===0, d=a && isTeam() && !!S.dup.acc && !!(S.dup.partner||"").trim();
  return d?3:a?2:u?1:0;
};

/* ---------- Zeitraum: startet erst mit bestätigtem Arbeitsplan ---------- */
hoursGone=function(){ return S.planAt?(Date.now()-S.planAt)/3600000:0; };
sprintLabel=function(){
  if(!S.planAt) return TX().noPlan;
  var h=hoursGone(), H=P().h; if(h>=H) return L.ui.sprintOver;
  return H>48? Math.ceil((H-h)/24)+tr(" Tage übrig") : Math.ceil(H-h)+tr(" h übrig");
};
/* Platzhalter für Tempo und Ziele des Wegs */
tok=function(h){
  var e=S.pace==="easy", q=Q();
  return String(h).replace(/\{SPAN\}/g,e?tr("7 Tage"):tr("48 Stunden")).replace(/\{SPANS\}/g,e?tr("7-Tage"):"48h")
   .replace(/\{NAMES\}/g,q.names).replace(/\{TOP\}/g,q.top).replace(/\{FIRST\}/g,q.first).replace(/\{SENT\}/g,q.sent).replace(/\{BIG\}/g,P().names);
};

/* ---------- Bausteine ---------- */
function chip(act,v,label,on,extra){ return '<button type="button" class="pill'+(on?" on":"")+'" data-act="'+act+'" data-v="'+v+'"'+(extra||"")+'>'+label+'</button>'; }
function lname(){ return S.leader?esc(S.leader):L.ui.yourLeader; }
function pathCards(cur,w){
  var t=TX();
  return '<div class="stack"><span class="label">'+t.goalT+'</span><p class="small muted">'+t.goalHint+'</p><div class="grid2">'+t.pathOrder.map(function(k){ var on=cur===k; return '<button type="button" class="card pace'+(on?" on":"")+'" data-act="tPath" data-v="'+k+'" data-w="'+w+'"><h3>'+(on?"✓ ":"")+t.paths[k][0]+'</h3><p class="small muted">'+t.paths[k][1]+'</p></button>'; }).join("")+'</div></div>';
}
function paceCards2(cur,w,path){
  var t=TX(), recEasy=(path==="unsure"||!path||S.prof.time==="15"||S.prof.time==="30");
  return '<div class="stack"><span class="label">'+t.paceT+'</span><p class="small muted">'+t.paceHint+'</p><div class="grid2">'+["easy","turbo"].map(function(k){ var on=cur===k; return '<button type="button" class="card pace'+(on?" on":"")+'" data-act="tPace" data-v="'+k+'" data-w="'+w+'"><h3>'+(on?"✓ ":"")+t.paces[k][0]+(k==="easy"&&recEasy?' <span class="badge b-ok">'+t.rec+'</span>':'')+'</h3><p class="small muted">'+t.paces[k][1]+'</p></button>'; }).join("")+'</div></div>';
}
function sysIntro(){
  var t=TX();
  return '<div class="card hi stack" id="sysintro"><span class="label">'+t.exL+'</span><p style="font-size:16px">'+t.example+'</p>'+
   '<div class="grid3">'+t.exSteps.map(function(s){ return '<div class="card"><h3>'+s[0]+'</h3><p class="small muted" style="margin-top:4px">'+s[1]+'</p></div>'; }).join("")+'</div>'+
   '<p class="small muted">'+t.exNote+'</p></div>'+
   '<div class="stack"><h2>'+t.brandsT+'</h2><div class="grid3">'+t.brands.map(function(b){ return '<div class="card"><div class="row" style="justify-content:space-between"><span class="label" style="margin:0">'+b[0]+'</span><span class="badge '+(b[2]==="plan"?"b-warn":"b-ok")+'">'+(b[2]==="plan"?t.stPlan:t.stNow)+'</span></div><p class="small muted" style="margin-top:8px">'+b[1]+'</p></div>'; }).join("")+'</div></div>'+
   '<div class="card stack"><h3>'+t.availT+'</h3><div class="grid2">'+t.avail.map(function(a,i){ return '<div class="avail '+(i?"plan":"now")+'"><b>'+a[0]+'</b><p class="small">'+a[1]+'</p></div>'; }).join("")+'</div></div>';
}

/* ---------- Startseite: Ziel vor Tempo, kein Countdown vor dem Start ---------- */
var draft={name:"",leader:"",path:"",pace:""};
try{ var _dr=JSON.parse(sessionStorage.getItem("bp_turbo_draft")||"null"); if(_dr){ draft=_dr; sessionStorage.removeItem("bp_turbo_draft"); } }catch(e){}
function keepDraft(){ var n=document.getElementById("w_name"), l=document.getElementById("w_leader"); if(n) draft.name=n.value; if(l) draft.leader=l.value; }
renderWelcome=function(){
  var t=TX();
  return '<div class="welcome">'+testBar()+'<div class="row" style="justify-content:space-between">'+brand()+'</div>'+
   '<div class="stack"><div class="eyebrow">'+t.kicker+'</div><h1 style="font-size:clamp(38px,8vw,62px)">'+t.hero+'</h1><p class="lead">'+t.heroLead+'</p>'+
   '<div class="row"><button class="btn gold" data-act="tScroll" data-v="startform2">'+t.btnFind+'</button><button class="btn" data-act="tScroll" data-v="sysintro">'+t.btnSys+'</button></div></div>'+
   '<form class="card hi stack" id="startform2"><h2>'+t.btnFind+'</h2>'+
   '<div class="grid2"><label class="field"><span>'+t.nameL+'</span><input type="text" id="w_name" autocomplete="given-name" value="'+esc(draft.name)+'"></label>'+
   '<label class="field"><span>'+t.leaderL+'</span><input type="text" id="w_leader" placeholder="'+esc(t.leaderPh)+'" value="'+esc(draft.leader)+'"><small class="muted">'+t.leaderHint+'</small></label></div>'+
   pathCards(draft.path,"w")+paceCards2(draft.pace,"w",draft.path)+
   '<p class="small muted">'+t.localNote+'</p>'+
   '<div class="row"><button class="btn gold" type="submit">'+t.startBtn+'</button><button class="btn ghost" type="button" data-act="backup">'+L.ui.loadBackup+'</button></div></form>'+
   '<div id="backupbox"></div>'+
   '<div class="stack"><h2>'+t.sysIntroT+'</h2>'+sysIntro()+'</div>'+
   (VIDEO?more(t.videoOpt,videoBlock()):'')+'</div>';
};

/* ---------- Fußzeile: Zustand statt „Als erledigt markieren“ ---------- */
renderFoot=function(id){
  var t=TX(), i=ORDER.indexOf(id), st=autoDone(id)?"done":isOpt(id)?"opt":partial(id)?"prep":"open";
  var cls={done:"b-ok",prep:"b-warn",open:"b-mut",opt:"b-mut"}[st];
  return stuckBox(id)+'<div class="modfoot noprint"><div class="row"><span class="badge '+cls+'">'+t.st[st]+'</span></div>'+
   '<div class="row">'+(i>0?'<button class="btn" data-go="'+ORDER[i-1]+'">← '+MT(ORDER[i-1])+'</button>':'')+
   (i<ORDER.length-1?'<button class="btn pri" data-go="'+ORDER[i+1]+'">'+MT(ORDER[i+1])+' →</button>':'')+'</div></div>';
};

/* ---------- Woran hängt es? – gezielte Hilfe ---------- */
stuckBox=function(id){
  if(autoDone(id)) return "";
  var u=L.ui, t=TX().stuck, r=S.stuck[id];
  var b='<div class="row">'+u.stuckR.map(function(x){ return chip("stuck",x[0],x[1],r===x[0],' data-id="'+id+'"'); }).join("")+'</div>';
  if(r==="understand"){
    b+='<div class="stack" style="margin-top:10px"><p class="small">'+t.understand+' '+TX().exSteps.map(function(s){return s[0].replace(/^\d · /,"");}).join(" → ")+'.</p>'+
     '<ul class="clean small muted">'+t.terms.map(function(x){ return '<li><b style="color:var(--fg)">'+x[0]+':</b> '+x[1]+'</li>'; }).join("")+'</ul>'+
     (VIDEO?'<p class="small muted">'+t.videoHint+'</p>':'')+(id!=="system"?'<div><button class="btn sm" data-go="system">'+t.toSystem+'</button></div>':'')+'</div>';
  } else if(r==="time"){
    b+='<div class="stack" style="margin-top:10px"><p class="small">'+t.time+'</p><div class="row"><label class="field" style="flex:1;min-width:200px"><span>'+t.newBlock+'</span><input type="datetime-local" id="stuck_block" value="'+esc(S.prof.block||"")+'"></label><button class="btn sm gold" data-act="tBlock">'+t.saveBlock+'</button></div>'+
     (S.pace!=="easy"?'<div><button class="btn sm" data-act="tPace" data-v="easy" data-w="s">'+t.toEasy+'</button></div>':'')+'</div>';
  } else if(r==="unsure"){
    b+='<div class="stack" style="margin-top:10px"><p class="small">'+t.unsure+'</p><div><button class="btn sm" data-go="talkto">'+t.toTpl+'</button></div></div>';
  } else if(r==="help"){
    if(S.leader){ var msg=F(t.helpMsg,{l:S.leader,s:MT(id)}); b+='<div class="stack" style="margin-top:10px"><p class="small">'+F(t.helpL,{l:esc(S.leader)})+'</p><div class="script"><p>'+esc(msg)+'</p><div class="row"><button class="btn sm pri" data-act="tCopyTxt" data-v="'+esc(msg)+'">'+t.copy+'</button><a class="btn sm" href="https://wa.me/?text='+encodeURIComponent(msg)+'" target="_blank" rel="noopener">WhatsApp</a></div></div></div>'; }
    else b+='<p class="small" style="margin-top:10px">'+t.helpNo+'</p>';
  }
  return more(u.stuckT,b,"",!!r);
};

/* ---------- 1 · Arbeitsplan: Ziel, Tempo, Profil, Empfehlung ---------- */
function recText(){
  var t=TX(), p=S.prof, out=[t.recPath[pth()]];
  if(p.time){ var tl=(t.times.filter(function(x){return x[0]===p.time;})[0]||[])[1]||""; out.push(F(t.recTime,{t:tl})); if(p.time==="15"||p.time==="30") out.push(isTeam()&&S.pace!=="easy"?t.recTeamSmall:t.recSmall); }
  if(p.skill) out.push(t.recSkill[p.skill]);
  if(p.block) out.push(F(t.recBlock,{d:fdate(p.block,{weekday:"long",day:"2-digit",month:"long",hour:"2-digit",minute:"2-digit"})}));
  return out.join(" ");
}
R.start=function(){
  var t=TX(), p=S.prof, h=hoursGone(), H=P().h;
  var out=head("start",t.startLead);
  if(S.planAt && h>=H) out+='<div class="card" style="border-color:var(--warn)"><h3>'+t.overT+'</h3><p class="small muted" style="margin-top:4px">'+t.over+'</p></div>';
  var cards='<p class="small muted">'+t.changeHint+'</p>'+pathCards(S.path,"s")+paceCards2(S.pace,"s",S.path);
  if(S.path && S.pace) out+='<div class="card stack"><span class="label">'+t.changeT+'</span><p><b>'+t.paths[S.path][0]+'</b> · '+t.paces[S.pace][0]+'</p>'+more(t.changeBtn,cards)+'</div>';
  else out+='<div class="card stack"><h2>'+t.changeT+'</h2>'+cards+'</div>';
  out+='<div class="card stack"><h2>'+t.profT+'</h2>'+
   '<div class="grid2"><label class="field"><span>'+L.ui.yourName+'</span><input type="text" data-bind="name" value="'+esc(S.name)+'"></label><label class="field"><span>'+t.leaderL+'</span><input type="text" data-bind="leader" placeholder="'+esc(t.leaderPh)+'" value="'+esc(S.leader)+'"><small class="muted">'+t.leaderHint+'</small></label></div>'+
   '<div class="stack" style="gap:6px"><span class="small muted">'+t.motiveQ+'</span><div class="row">'+t.motives.map(function(x){ return chip("tMot",x[0],x[1],p.motive===x[0]); }).join("")+'</div><input type="text" data-bind="prof.motiveTxt" placeholder="'+esc(t.motiveFree)+'" value="'+esc(p.motiveTxt||"")+'"></div>'+
   '<div class="stack" style="gap:6px"><span class="small muted">'+t.timeQ+'</span><div class="row">'+t.times.map(function(x){ return chip("tTime",x[0],x[1],p.time===x[0]); }).join("")+'</div></div>'+
   '<label class="field"><span>'+t.blockQ+'</span><input type="datetime-local" id="p_block" data-bind="prof.block" value="'+esc(p.block||"")+'"></label>'+
   '<div class="stack" style="gap:6px"><span class="small muted">'+t.skillQ+'</span><div class="row">'+t.skills.map(function(x){ return chip("tSkill",x[0],x[1],p.skill===x[0]); }).join("")+'</div></div>'+
   more(t.typesT,'<p class="small muted">'+t.typesHint+'</p><div class="grid2" style="margin-top:8px">'+t.types.map(function(x,i){ var on=String(S.diag.type)===String(i); return '<button type="button" class="card pace'+(on?" on":"")+'" data-act="setType" data-v="'+i+'"><h3>'+(on?"✓ ":"")+x[0]+'</h3><p class="small muted">'+x[1]+'</p></button>'; }).join("")+'</div>')+'</div>';
  out+='<div class="card hi stack"><span class="label">'+t.recT+'</span><p style="font-size:16px">'+recText()+'</p>'+
   (S.planAt?'<p class="small" style="color:var(--ok)">✓ '+F(t.planOn,{d:fdate(S.planAt,{dateStyle:"medium",timeStyle:"short"})})+'</p>':'<div><button class="btn gold" data-act="tPlan">'+t.planBtn+'</button></div>')+'</div>';
  out+='<div class="card stack"><h3>'+t.planListT+'</h3><ul class="checks">'+req().map(function(m){ var ok=autoDone(m); return '<li class="'+(ok?"ok":"")+'"><span class="dot'+(ok?" done":"")+'">'+(ok?"✓":"")+'</span><button class="linkbtn" data-go="'+m+'">'+MT(m)+'</button></li>'; }).join("")+'</ul></div>';
  if(VIDEO) out+=more(t.videoOpt,videoBlock());
  return out+task(L.ui.lbl.first,t.recPath[pth()]);
};

/* ---------- 2 · System: Beispiel → Nutzen → Marken → eigene Aufgabe → Selbstcheck ---------- */
R.system=function(){
  var t=TX(), m=L.m.system, h=head("system",TX().roles[pth()])+sysIntro();
  h+='<div class="card stack"><span class="label">'+t.roleT+'</span><p>'+t.roles[pth()]+'</p>'+(pth()==="merch"?'<p class="small" style="color:var(--gold)">'+t.merchNote+'</p>':'')+'</div>';
  h+='<div class="card stack"><h2>'+t.quizT+'</h2><p class="small muted">'+t.quizHint+'</p>';
  t.quiz.forEach(function(q,i){
    var ans=S.qz[i];
    h+='<div class="stack" style="gap:8px"><h3>'+(i+1)+'. '+q.q+'</h3><div class="stack" style="gap:6px">';
    q.a.forEach(function(a,j){ var cls="opt"; if(ans===j) cls+=(q.c===j?" right":" wrong"); h+='<button class="'+cls+'" data-act="tQuiz" data-q="'+i+'" data-a="'+j+'"><span class="dot'+(ans===j?" done":"")+'">'+(ans===j?"✓":"")+'</span>'+a+'</button>'; });
    h+='</div>';
    if(ans!=null) h+= ans===q.c?'<p class="small" style="color:var(--ok)">'+t.right+'</p>':'<p class="small" style="color:var(--warn)">'+q.why+'</p>';
    h+='</div>';
  });
  h+='<p class="small">'+(quiz2Ok()?'<span class="badge b-ok">'+t.quizOk+'</span>':'<span class="badge b-mut">'+F(t.quizOpen,{n:quiz2Right()})+'</span>')+'</p></div>';
  h+=more(t.trT,'<p class="small muted">'+t.trHint+'</p><div class="row" style="justify-content:space-between;margin-top:8px"><div class="timer tab" id="timer">60</div><div class="row"><button class="btn pri" data-act="pitchStart" id="pitchBtn">'+m.start+'</button><button class="btn" data-act="pitchReset">'+m.reset+'</button></div></div><p class="small muted">'+m.reps+': '+S.pitch.reps+'</p>',"",pT!=null);
  h+='<div class="card stack"><h3>'+t.lfbT+'</h3><label class="opt'+(S.pitch.leaderOk?" sel":"")+'"><input type="checkbox" data-bind="pitch.leaderOk" '+(S.pitch.leaderOk?"checked":"")+'> '+F(t.lfb,{l:lname()})+'</label><p class="small muted">'+t.lfbHint+'</p></div>';
  return h+task(L.ui.lbl.task,t.sysTask);
};

/* ---------- 3 · Vergütung: Überblick vor Bild, offene Punkte sichtbar ---------- */
function calcHTML(){
  var t=TX(), g=+(S.plan.goal||0), st=t.stages[+(S.plan.stage||0)]||t.stages[0];
  if(!(g>0)) return '<p class="small muted">'+t.calcNo+'</p>';
  return '<p><b>'+F(t.calcRes,{n:Math.ceil(g/st[2]),p:st[2],g:fmt(g)})+'</b></p>';
}
R.plan=function(){
  if(!S.plan.seen){ S.plan.seen=true; save(); }
  var t=TX(), img="img/verguetungsplan.jpg";
  var h=head("plan",t.planLead);
  if(pth()==="side"||pth()==="unsure"||S.prof.motive==="money") h+='<div class="card hi stack"><span class="label">'+t.sideT+'</span><p>'+t.side+'</p></div>';
  h+='<div class="card stack"><h2>'+t.qT+'</h2>'+t.qs.map(function(q){ return '<div class="qrow"><h3>'+q[0]+'</h3><p class="small muted">'+q[1]+'</p><p class="small"><span class="badge b-warn">'+t.open+'</span> '+q[2]+'</p></div>'; }).join("")+
   '<p class="small muted">'+t.openHint+'</p><div><button class="btn sm" data-act="tCopyTxt" data-v="'+esc(F(t.askMsg,{l:S.leader||""}).replace("Hi , ","Hallo, "))+'">'+t.askBtn+'</button></div></div>';
  if(pth()==="merch") h+='<div class="card" style="border-color:rgba(217,180,92,.45)"><h3 style="color:var(--gold)">'+t.merchT+'</h3><p class="small muted" style="margin-top:6px">'+t.merch+'</p></div>';
  h+='<div class="card stack"><h3>'+t.tableT+'</h3><div class="tablewrap"><table><thead><tr>'+t.tableCols.map(function(c){return '<th>'+c+'</th>';}).join("")+'</tr></thead><tbody>'+
   t.stages.map(function(s){ return '<tr><td>'+s[0]+'</td><td>'+s[1]+'</td><td class="tab">'+s[2]+' €</td></tr>'; }).join("")+'</tbody></table></div><p class="small muted">'+t.tableNote+'</p></div>';
  h+='<div class="card stack"><h3>'+t.calcT+'</h3><div class="grid2"><label class="field"><span>'+t.calcGoal+'</span><input type="number" min="0" step="10" id="calc_goal" data-bind="plan.goal" value="'+esc(S.plan.goal||"")+'"></label>'+
   '<label class="field"><span>'+t.calcStage+'</span><select id="calc_stage" data-bind="plan.stage">'+t.stages.map(function(s,i){ return '<option value="'+i+'"'+(String(S.plan.stage||0)===String(i)?" selected":"")+'>'+s[0]+' · '+s[2]+' €</option>'; }).join("")+'</select></label></div>'+
   '<div id="calcres">'+calcHTML()+'</div><p class="small muted">'+t.calcNote+'</p></div>';
  h+=more(t.imgT,'<a class="planimg" href="'+img+'" target="_blank" rel="noopener"><img src="'+img+'" alt="Best Prime Vergütungsplan" loading="lazy"></a><div style="margin-top:8px"><a class="btn sm" href="'+img+'" target="_blank" rel="noopener">'+t.zoom+'</a></div>');
  h+='<div class="card hi stack"><label class="field"><span>'+t.qL+'</span><input type="text" data-bind="plan.q" value="'+esc(S.plan.q||"")+'"></label>'+
   '<label class="opt'+(S.plan.ok?" sel":"")+'"><input type="checkbox" data-bind="plan.ok" '+(S.plan.ok?"checked":"")+'> '+t.okL+'</label></div>';
  return h+task(L.ui.lbl.task,t.planTask);
};

/* ---------- 4 · Namen: drei Namen reichen zum Start ---------- */
R.list=function(){
  var t=TX(), m=L.m.list, n=S.list.length, q=Q();
  var h=head("list",t.listLead);
  h+='<div class="card stack"><div class="row" style="justify-content:space-between"><div class="kpi"><b class="tab">'+n+' / '+q.names+'</b><span>'+t.who[pth()]+'</span></div><span class="badge '+(n>=q.names?"b-ok":"b-warn")+'">'+(n>=q.names?t.listOk:t.smallT)+'</span></div>'+
   '<div class="bar"><i style="width:'+Math.min(100,n/q.names*100).toFixed(1)+'%"></i></div>'+(isTeam()?'<p class="small muted">'+t.big+'</p>':'')+'</div>';
  var hp=t.help[pth()]||t.help.def;
  h+='<div class="card"><h3>'+m.helpT+'</h3>'+ul(hp)+'</div>';
  h+='<form class="card stack" id="addform"><h3>'+m.add+'</h3><div class="grid2"><label class="field"><span>'+m.name+'</span><input type="text" id="add_name" placeholder="'+esc(m.namePh)+'" autocomplete="off"></label><label class="field"><span>'+m.ctx+'</span><input type="text" id="add_ctx" placeholder="'+esc(m.ctxPh)+'"></label></div>'+
   '<div class="row" id="catpills">'+L.cats.map(function(c,i){ return '<button type="button" class="pill'+(addCat===i?" on":"")+'" data-act="addCat" data-v="'+i+'">'+c+'</button>'; }).join("")+'</div>'+
   '<div class="row"><button class="btn pri" type="submit">'+m.addBtn+'</button><span class="small muted">'+m.tip+'</span></div>'+
   more(m.bulk,'<div class="stack"><textarea id="bulk" placeholder="'+esc(m.bulkPh)+'"></textarea><button type="button" class="btn sm" data-act="bulkAdd">'+m.bulkBtn+'</button></div>')+'</form>';
  h+='<div class="card"><h3 style="margin-bottom:6px">'+m.yours+'</h3>';
  if(!n) h+='<p class="muted small">'+m.empty+'</p>';
  S.list.forEach(function(c,i){
    h+='<div class="listrow"><span class="n tab">'+(i+1)+'</span><input type="text" value="'+esc(c.name)+'" data-cbind="'+c.id+'.name" aria-label="'+esc(m.name)+'"><input class="ctx" type="text" value="'+esc(c.ctx||"")+'" placeholder="'+esc(m.ctxCol)+'" data-cbind="'+c.id+'.ctx" aria-label="'+esc(m.ctxCol)+'">'+
     '<select class="cat" data-cbind="'+c.id+'.cat" aria-label="'+esc(m.cat)+'"><option value="">'+m.cat+'</option>'+L.cats.map(function(k,ki){return '<option value="'+ki+'"'+(String(c.cat)===String(ki)?" selected":"")+'>'+k+'</option>';}).join("")+'</select>'+
     '<button class="iconbtn" data-act="delC" data-id="'+c.id+'" aria-label="'+esc(m.remove)+'">×</button></div>';
  });
  return h+'</div>'+task(L.ui.lbl.today,t.listTask);
};

/* ---------- 5 · Auswahl: drei einfache Fragen, Bewertung 1–5 optional ---------- */
R.top=function(){
  var t=TX(), m=L.m.top, team=isTeam(), q=Q();
  var h=head("top",team?t.topLeadTeam:t.topLead);
  if(!S.list.length) return h+'<div class="card"><p class="muted">'+m.empty+'</p><div style="margin-top:10px"><button class="btn pri" data-go="list">'+m.toList+'</button></div></div>'+task(L.ui.lbl.task,team?t.topTaskTeam:t.topTask);
  var rows=S.list.slice().sort(function(a,b){ return ((b.first5?2:0)+(b.top?1:0)+(b.k0?1:0)+(b.k1?1:0)+(b.k2?1:0))-((a.first5?2:0)+(a.top?1:0)+(a.k0?1:0)+(a.k1?1:0)+(a.k2?1:0)); });
  h+='<div class="card"><div class="tablewrap"><table class="pick"><thead><tr><th>'+m.cols[1]+'</th>'+t.crit.map(function(c){return '<th>'+c+'</th>';}).join("")+(team?'<th>'+t.topCol+'</th>':'')+'<th>'+t.choose+'</th></tr></thead><tbody>';
  rows.forEach(function(c){
    h+='<tr><td><b>'+esc(c.name)+'</b>'+(c.ctx?'<div class="small muted">'+esc(c.ctx)+'</div>':'')+'</td>'+[0,1,2].map(function(k){ return '<td><button class="yn'+(c["k"+k]?" on":"")+'" data-act="tCrit" data-id="'+c.id+'" data-v="'+k+'" aria-label="'+esc(t.crit[k])+'">'+(c["k"+k]?"✓":"")+'</button></td>'; }).join("")+
     (team?'<td><input type="checkbox" data-act="tTop" data-id="'+c.id+'" '+(c.top?"checked":"")+' aria-label="TOP"></td>':'')+
     '<td><button class="btn sm '+(c.first5?"gold":"")+'" data-act="tChoose" data-id="'+c.id+'">'+(c.first5?"✓ ":"")+t.choose+'</button></td></tr>';
  });
  h+='</tbody></table></div><p class="small muted" style="margin-top:8px">'+(team?F(t.maxTop,{n:q.top})+' · ':'')+F(t.maxFirst,{n:q.first})+'</p></div>';
  if(team||pth()==="net") h+=more(t.rateT,'<div class="tablewrap"><table><thead><tr>'+t.rateCols.map(function(c){return '<th>'+c+'</th>';}).join("")+'</tr></thead><tbody>'+S.list.map(function(c){ return '<tr><td><b>'+esc(c.name)+'</b></td>'+stars(c,"t")+stars(c,"p")+stars(c,"s")+'<td class="tab">'+scoreOf(c)+'</td></tr>'; }).join("")+'</tbody></table></div>');
  return h+task(L.ui.lbl.task,team?t.topTaskTeam:t.topTask);
};

/* ---------- 6 · Nachricht: Kontakt zeigen, Vorlage, erst „gesendet“ zählt ---------- */
var pend={};
function scriptBlock2(g,title,excludeNo){
  var t=TX(), sc=L.m.sc;
  var cands=S.list.filter(function(c){ return !(excludeNo && c.status==="NO"); });
  /* Vorauswahl: nächster ausgewählter, noch nicht angesprochener Kontakt (bzw. beim Nachfassen ein angesprochener offener Kontakt) */
  if(!pick[g] || !findC(pick[g]) || (excludeNo && findC(pick[g]).status==="NO")){
    var ids=firstIds(), auto=null;
    if(g==="fu") auto=cands.filter(function(c){ return ids.indexOf(c.id)>=0 && c.status!=="GO"; })[0];
    else auto=first5().filter(function(c){ return ids.indexOf(c.id)<0 && c.status!=="NO"; })[0]||first5().filter(function(c){ return c.status!=="NO"; })[0];
    pick[g]=auto?auto.id:"";
  }
  var opts='<option value="">'+t.pickPh+'</option>'+cands.slice().sort(function(a,b){return ((b.first5?2:0)+(b.top?1:0))-((a.first5?2:0)+(a.top?1:0));}).map(function(c){ return '<option value="'+c.id+'"'+(pick[g]===c.id?" selected":"")+'>'+(c.first5?"★ ":"")+esc(c.name)+(c.status?" · "+L.status[c.status]:"")+'</option>'; }).join("");
  var who=findC(pick[g]);
  if(who && excludeNo && who.status==="NO") who=null;
  var h='<div class="card stack"><div class="row" style="justify-content:space-between"><h2>'+title+'</h2><div class="row"><label class="field" style="min-width:200px;flex:0 1 260px"><span>'+sc.forWho+'</span><select data-act="pick" data-g="'+g+'">'+opts+'</select></label>'+
   '<div class="field"><span>'+t.form+'</span><div class="row" style="gap:4px">'+chip("tSie","0",t.du,!S.sie)+chip("tSie","1",t.sie,!!S.sie)+'</div></div></div></div>';
  if(!who) h+='<p class="small" style="color:var(--warn)">'+t.whoNone+'</p>';
  var list=scripts(g);
  if(g==="an"){
    var gs=[]; list.forEach(function(s){ if(s.g && gs.indexOf(s.g)<0) gs.push(s.g); });
    h+='<div class="chips">'+[""].concat(gs).map(function(k){ return '<button class="chip'+(scf===k?" on":"")+'" data-act="scf" data-v="'+k+'">'+(k?sc.groups[k]:sc.all)+'</button>'; }).join("")+'</div>';
    if(scf) list=list.filter(function(s){ return s.g===scf; });
  }
  h+='<div class="grid2">';
  list.forEach(function(s){
    var raw=(S.sie&&s.x2)?s.x2:s.x, txt=fill(raw,who), done=who && S.ev.some(function(e){ return e.c===who.id && e.t===s.id; });
    h+='<div class="script"><div class="t">'+s.t+'</div><p>'+hl(esc(txt))+'</p><div class="row"><button class="btn sm pri" data-act="tCopy" data-id="'+s.id+'" data-g="'+g+'">'+sc.copy+'</button>'+
     '<a class="btn sm" href="https://wa.me/?text='+encodeURIComponent(txt)+'" target="_blank" rel="noopener" data-act="tWa" data-id="'+s.id+'" data-g="'+g+'">WhatsApp</a></div>'+
     (who?(done?'<span class="badge b-ok">✓ '+F(t.already,{n:esc(who.name)})+'</span>':'<button class="btn sm '+(pend[s.id]===who.id?"gold pulse":"")+'" data-act="tSend" data-id="'+s.id+'" data-g="'+g+'">'+F(t.sendBtn,{n:esc(who.name.split(" ")[0])})+'</button>'):'')+'</div>';
  });
  return h+'</div></div>';
}
R.talkto=function(){
  var t=TX(), m=L.m.talkto, q=Q(), n=firstIds().length, ch=first5();
  if(scf===null) scf=DEF_GROUP[pth()];
  var h=head("talkto",t.talktoLead)+
   ((!autoDone("system")||!autoDone("plan"))?tr('<div class="card hi stack"><h3>Vor deiner ersten Einladung</h3><p class="small">Verstehe Kundennutzen und Vergütung zuerst. Du kannst deine Nachricht hier vorbereiten; bestätige keine Konditionen, die noch ungeklärt sind.</p><div class="row"><button class="btn sm" data-go="system">System verstehen</button><button class="btn sm" data-go="plan">Vergütung verstehen</button></div></div>'):'')+
   '<div class="card stack"><div class="grid3">'+[n,fuCount(),okTalks().length].map(function(v,i){ return '<div class="kpi"><b class="tab">'+v+(i===0?' / '+q.sent:'')+'</b><span>'+t.cnt[i]+'</span></div>'; }).join("")+'</div></div>';
  if(ch.length) h+='<div class="card stack"><h3>'+t.chosenT+'</h3><div class="row">'+ch.map(function(c){ return '<button class="pill'+(pick.an===c.id?" on":"")+'" data-act="tPickC" data-v="'+c.id+'">'+esc(c.name)+(c.status?" · "+L.status[c.status]:"")+'</button>'; }).join("")+'</div></div>';
  h+='<div class="card hi stack"><h3 style="color:var(--gold)">'+m.tonT+'</h3><p class="small">'+m.ton+'</p></div>'+
   scriptBlock2("an",L.m.sc.templates,true)+(scf==="re"?'<p class="small muted"><b style="color:var(--gold)">'+m.reT+':</b> '+m.re+'</p>':'')+
   more(m.rulesT,'<ol class="small">'+m.rules.map(function(r){return '<li>'+r+'</li>';}).join("")+'</ol><div class="grid2" style="margin-top:10px"><div class="card"><h3 style="color:var(--ok)">'+m.doT+'</h3>'+ul(m.do)+'</div><div class="card"><h3 style="color:var(--bad)">'+m.dontT+'</h3>'+ul(m.dont)+'</div></div>');
  if(isTeam()||pth()==="net") h+='<div class="card stack vkbox"><button class="vktoggle" data-act="vk" aria-expanded="'+vkOpen+tr('"><span><span class="label">Level up</span><h2>')+m.vkT+'</h2></span><span class="vkhint'+(vkOpen?' open':'')+'">'+moreHint()+'</span></button>'+
   (vkOpen?'<p class="small muted">'+m.vkLead+'</p>'+scriptBlock2("vk",L.m.sc.vkSeq,true)+'<p class="small muted">'+m.vkWarn+'</p>':'')+'</div>';
  return h+task(L.ui.lbl.task,t.talktoTask);
};

/* ---------- 7 · Kontakte & nächste Schritte ---------- */
var ST2=["","PREP","NEU","RE","TERMIN","LATER","GO","NO"];
R.pipe=function(){
  var t=TX(), st=L.status, h=head("pipe",t.pipeLead);
  var counts={}; S.list.forEach(function(c){ if(c.status) counts[c.status]=(counts[c.status]||0)+1; });
  h+='<div class="card stack"><div class="row">'+ST2.slice(1).map(function(s){ return '<span class="badge b-mut">'+st[s]+' <b class="tab" style="color:var(--fg)">'+(counts[s]||0)+'</b></span>'; }).join("")+'</div>';
  var ids=firstIds(), rows=S.list.filter(function(c){ return c.first5||c.top||c.status||ids.indexOf(c.id)>=0; });
  if(!rows.length) h+='<p class="muted small">'+t.pipeEmpty+'</p>';
  else{
    var today=new Date().toISOString().slice(0,10);
    h+='<div class="tablewrap"><table><thead><tr>'+t.pipeCols.map(function(c){return '<th>'+c+'</th>';}).join("")+'</tr></thead><tbody>';
    rows.sort(function(a,b){ return (a.date||"9999").localeCompare(b.date||"9999"); }).forEach(function(c){
      var closed=c.status==="NO"||c.status==="GO", overdue=!closed && c.date && c.date<today, opts=ST2.slice(); if(c.status==="FU"||c.status==="ENT") opts.push(c.status);
      h+='<tr><td style="min-width:120px"><b>'+esc(c.name)+'</b>'+(ids.indexOf(c.id)>=0?'<div class="small muted">✓ '+st.NEU+'</div>':'')+'</td>'+
       '<td><select data-act="tStatus" data-id="'+c.id+'" style="min-width:140px" aria-label="Status">'+opts.map(function(s){return '<option value="'+s+'"'+((c.status||"")===s?" selected":"")+'>'+(s?st[s]:st.open)+'</option>';}).join("")+'</select></td>'+
       (c.status==="NO"?'<td colspan="2" class="small muted">'+t.noFu+'</td>':
       '<td><input type="text" style="min-width:160px" value="'+esc(c.next||"")+'" placeholder="'+esc(L.m.pipe.nextPh)+'" data-cbind="'+c.id+'.next"></td>'+
       '<td><input type="date" value="'+esc(c.date||"")+'" data-cbind="'+c.id+'.date" style="'+(overdue?"border-color:var(--warn)":"")+'">'+(overdue?'<div class="small" style="color:var(--warn)">'+t.overdue+'</div>':'')+'</td>')+'</tr>';
    });
    h+='</tbody></table></div>';
  }
  h+='</div>'+scriptBlock2("fu",L.m.sc.fu,true);
  return h+task(L.ui.lbl.task,t.pipeTask);
};

/* ---------- 8 · Gespräche ---------- */
R.talk=function(){
  var t=TX(), m=L.m.talk, opt=isOpt("talk");
  var h=head("talk",t.talkLead)+'<div class="stack">'+t.tSteps.map(function(s){ return '<div class="card"><span class="label">'+s[0]+'</span><p class="small">'+s[1]+'</p></div>'; }).join("")+'</div>';
  if(isTeam()||pth()==="net") h+='<div class="card"><h3>'+t.netQT+'</h3><ol class="small" style="margin-top:8px">'+t.netQ.map(function(q){return '<li>'+q+'</li>';}).join("")+'</ol></div>';
  h+='<div class="card stack"><h2>'+t.ansT+'</h2><div class="grid2">'+t.ans.map(function(a){ return '<div class="script"><div class="t">'+a[0]+'</div><p>'+a[1]+'</p><div class="row"><button class="btn sm pri" data-act="tCopyTxt" data-v="'+esc(a[1])+'">'+L.m.sc.copy+'</button></div></div>'; }).join("")+'</div></div>'+
   '<div class="card" style="border-color:rgba(217,180,92,.45)"><h3 style="color:var(--gold)">'+m.honestT+'</h3><p class="small muted" style="margin-top:6px">'+m.honest+'</p><p class="small muted" style="margin-top:6px">'+t.together+'</p></div>';
  var today=new Date().toISOString().slice(0,10);
  h+='<form class="card stack" id="talkform2"><h2>'+t.prot+'</h2><div class="grid2"><label class="field"><span>'+t.pf[0]+'</span><input type="date" id="t2_date" value="'+today+'"></label><label class="field"><span>'+t.pf[1]+'</span><input type="text" id="t2_who" list="contacts2"></label></div>'+
   '<datalist id="contacts2">'+S.list.map(function(c){return '<option value="'+esc(c.name)+'">';}).join("")+'</datalist>'+
   '<label class="field"><span>'+t.pf[2]+'</span><textarea id="t2_imp" rows="2"></textarea></label><div class="grid2"><label class="field"><span>'+t.pf[3]+'</span><input type="text" id="t2_q"></label><label class="field"><span>'+t.pf[4]+'</span><input type="text" id="t2_next"></label></div>'+
   '<label class="opt"><input type="checkbox" id="t2_ok"> '+t.pDone+'</label><div><button class="btn pri" type="submit">'+t.pSave+'</button></div></form>';
  if(S.talks.length){
    h+='<div class="card"><div class="tablewrap"><table><thead><tr>'+t.pCols.map(function(c){return '<th>'+c+'</th>';}).join("")+'<th></th></tr></thead><tbody>';
    S.talks.forEach(function(x,i){ h+='<tr><td class="tab small">'+(x.d?esc(x.d):fdate(x.at,{dateStyle:"short"}))+'</td><td><b>'+esc(x.who)+'</b>'+(x.ok?'':'<div class="small muted">'+t.legacy+'</div>')+'</td><td>'+esc(x.imp||x.lever||"")+'</td><td>'+esc(x.q||"")+'</td><td>'+esc(x.next||"")+'</td><td><button class="iconbtn" data-act="delTalk" data-i="'+i+'" aria-label="'+esc(m.del)+'">×</button></td></tr>'; });
    h+='</tbody></table></div></div>';
  }
  return h+task(L.ui.lbl.task,opt?t.talkTaskOpt:t.talkTask);
};

/* ---------- 9 · Weitergeben: nur im Teamweg Pflicht ---------- */
multiRows=function(){
  var m=S.multi, size=Math.max(1,+m.size||100), r=Math.max(0,+m.rate||0)/100, Lv=Math.min(8,Math.max(1,+m.levels||6)), act=1, out="";
  for(var i=1;i<=Lv;i++){ var lst=act*size, nw=Math.round(lst*r); out+='<tr><td><b>E'+i+'</b></td><td class="tab">'+fmt(act)+'</td><td class="tab">'+fmt(lst)+'</td><td class="tab" style="color:var(--teal)"><b>'+fmt(nw)+'</b></td></tr>'; act=nw; if(!act) break; }
  return out;
};
R.dup=function(){
  var t=TX(), m=L.m.dup, d=S.dup, mm=S.multi;
  var h=head("dup",t.dupLead);
  if(!isTeam()) h+='<div class="card hi"><h3>'+t.optT+'</h3><p class="small muted" style="margin-top:6px">'+t.opt+'</p></div>';
  h+='<div class="card stack"><label class="opt'+(d.yes?" sel":"")+'"><input type="checkbox" data-bind="dup.yes" '+(d.yes?"checked":"")+'> '+t.yesL+'</label>';
  if(!d.yes) h+='<h3>'+t.invT+'</h3><label class="field"><span>'+t.invL+'</span><input type="text" data-bind="dup.inv" placeholder="'+esc(t.invPh)+'" value="'+esc(d.inv||"")+'"></label><label class="field"><span>'+t.invD+'</span><input type="date" data-bind="dup.invDate" value="'+esc(d.invDate||"")+'"></label>';
  else{
    h+='<h3>'+t.startT+'</h3><label class="field"><span>'+t.partner+'</span><input type="text" data-bind="dup.partner" value="'+esc(d.partner||"")+'"></label><div class="tablewrap"><table><thead><tr>'+m.cols2.map(function(c){return '<th>'+c+'</th>';}).join("")+'</tr></thead><tbody>';
    t.dupSteps.forEach(function(s,i){ h+='<tr><td>'+s+'</td><td><input type="date" data-bind="dup.t'+i+'" value="'+esc(d["t"+i]||"")+'"></td><td><input type="checkbox" data-bind="dup.d'+i+'" '+(d["d"+i]?"checked":"")+'></td></tr>'; });
    h+='</tbody></table></div><div class="row"><button class="btn sm" data-act="copyLink">'+m.link+'</button></div>'+
     ((d.partner||"").trim()?'<label class="opt'+(d.acc?" sel":"")+'"><input type="checkbox" data-bind="dup.acc" '+(d.acc?"checked":"")+'> '+F(t.accL,{n:esc(d.partner)})+'</label>':'');
  }
  h+='</div>';
  h+=more(t.multiT,'<p class="small muted">'+t.multiText+'</p>'+
   '<div class="grid3" style="margin-top:8px"><label class="field"><span>'+m.size+'</span><input type="number" min="10" max="500" step="10" data-mbind="size" value="'+esc(mm.size)+'"></label><label class="field"><span>'+m.rate+'</span><input type="number" min="1" max="50" step="1" data-mbind="rate" value="'+esc(mm.rate)+'"></label><label class="field"><span>'+m.levels+'</span><input type="number" min="1" max="8" step="1" data-mbind="levels" value="'+esc(mm.levels)+'"></label></div>'+
   '<div class="card" style="border-color:var(--warn);margin-top:8px"><h3>'+t.assT+'</h3>'+ul(t.ass.map(function(a){ return F(a,{k:esc(mm.size),r:esc(mm.rate)}); }))+'</div>'+
   '<div class="tablewrap" style="margin-top:8px"><table><thead><tr>'+t.mCols.map(function(c){return '<th>'+c+'</th>';}).join("")+'</tr></thead><tbody id="multibody">'+multiRows()+'</tbody></table></div>'+
   '<p class="small muted" style="margin-top:8px">'+m.not+'</p>');
  return h+task(L.ui.lbl.task,t.dupTask);
};

/* ---------- 10 · Abschluss: begründeter Stand ---------- */
R.finish=function(){
  var t=TX(), m=L.m.finish, lv=level();
  var vals=[firstIds().length,fuCount(),okTalks().length,nextSteps()], go=S.list.filter(function(c){return c.status==="GO";}).length;
  var h=head("finish",t.finLead);
  if(S.planAt && hoursGone()>=P().h) h+='<div class="card" style="border-color:var(--warn)"><h3>'+t.overT+'</h3><p class="small muted" style="margin-top:4px">'+t.over+'</p></div>';
  h+='<div class="card hi stack"><h2>'+t.scT+'</h2><div class="grid4">'+vals.map(function(v,i){ return '<div class="kpi"><b class="tab">'+v+'</b><span>'+t.k[i]+'</span></div>'; }).join("")+'</div></div>'+
   '<div class="card"><h3>'+t.resT+'</h3><p style="margin-top:6px"><b>'+F(t.res,{n:go})+'</b></p><p class="small muted">'+t.resHint+'</p></div>';
  var lvs=isTeam()?t.lv:t.lv.slice(0,2);
  h+='<div class="grid3">'+lvs.map(function(x,i){ return '<div class="card'+(lv>i?" hi":"")+'"><span class="label">'+(lv>i?"✓ ":"")+x[0]+'</span><p class="small muted">'+x[1]+'</p></div>'; }).join("")+'</div>';
  var miss=activeMissing();
  h+='<div class="card stack"><p><b>'+t.status+':</b> '+t.why[lv]+'</p>'+(lv>=1&&lv<2&&miss.length?'<p class="small muted">'+F(t.missing,{x:miss.join(", ")})+'</p>':'')+'</div>';
  h+=nextActionCard();
  h+=tr('<div class="card print-summary"><h3>Mein nächster Schritt</h3><p>')+esc(S.fin.naWhat||tr("Noch nicht festgelegt"))+'</p><p>'+(S.fin.naWhen?esc(fdate(S.fin.naWhen,{dateStyle:"medium",timeStyle:"short"})):"")+'</p><p class="small muted">'+esc(S.fin.naNeed||"")+'</p></div>';
  h+=more(t.reviewT,'<label class="opt'+(S.fin.review?" sel":"")+'"><input type="checkbox" data-bind="fin.review" '+(S.fin.review?"checked":"")+'> '+F(t.review,{l:lname()})+'</label><label class="field" style="margin-top:8px"><span>'+t.reviewDate+'</span><input type="date" data-bind="fin.date" value="'+esc(S.fin.date||"")+'"></label>');
  var names=[t.none,t.lv[0][0],t.lv[1][0],t.lv[2][0]];
  h+='<div class="cert">'+brand()+'<div class="eyebrow" style="color:var(--gold)">'+t.certEye+'</div><h1>'+esc(S.name||m.yourName)+'</h1><p class="muted">'+t.certDid+'</p>'+
   '<div class="lv">'+lvs.map(function(x,i){ return '<span class="'+(lv>i?"on":"")+'">'+(lv>i?"✓ ":"")+x[0]+'</span>'; }).join("")+'</div>'+
   '<p class="small muted">'+t.status+': <b style="color:var(--gold)">'+names[lv]+'</b></p>'+(inFrame?'':'<button class="btn sm noprint" data-act="print">'+m.print+'</button>')+'</div>';
  h+='<div class="card"><h3>'+m.rulesT+'</h3>'+ul(m.rules)+'</div>';
  return h+task(L.ui.lbl.next,t.finTask);
};

/* ---------- Ereignisse ---------- */
function setPath2(v,w){
  if(w==="w"){ keepDraft(); draft.path=v; if(v==="unsure" && !draft.pace) draft.pace="easy"; render(); return; }
  S.path=v; scf=DEF_GROUP[v]; if(v==="unsure" && !S.pace) S.pace="easy"; save(); render(); toast(TX().paths[v][0]);
}
document.addEventListener("click",function(e){
  var el=e.target.closest("[data-act]"); if(!el) return;
  var a=el.getAttribute("data-act"), v=el.getAttribute("data-v"), id=el.getAttribute("data-id"), t=TX(), c;
  switch(a){
   case "tScroll": var tg=document.getElementById(v); if(tg) tg.scrollIntoView({behavior:"smooth"}); break;
   case "tPath": setPath2(v,el.getAttribute("data-w")); break;
   case "tPace": if(el.getAttribute("data-w")==="w"){ keepDraft(); draft.pace=v; render(); } else { S.pace=v; save(); render(); toast(t.paces[v][0]); } break;
   case "tMot": S.prof.motive=S.prof.motive===v?"":v; save(); render(); break;
   case "tTime": S.prof.time=v; save(); render(); break;
   case "tSkill": S.prof.skill=v; save(); render(); break;
   case "tPlan": if(!profOk()){ toast(t.planNeed); break; } S.planAt=Date.now(); save(); render(); toast(t.planDone); break;
   case "tBlock": var nb=document.getElementById("stuck_block"); if(nb && nb.value){ S.prof.block=nb.value; save(); render(); toast(t.stuck.blockSaved); } break;
   case "tQuiz": S.qz[+el.getAttribute("data-q")]=+el.getAttribute("data-a"); save(); render(); break;
   case "tCopyTxt": copyText(v); break;
   case "tSie": S.sie=v==="1"; save(); render(); break;
   case "tPickC": pick.an=v; render(); break;
   case "tCrit": c=findC(id); if(c){ c["k"+v]=!c["k"+v]; save(); render(); } break;
   case "tChoose": c=findC(id); if(c){ if(!c.first5 && first5().length>=Q().first){ toast(F(t.maxFirst,{n:Q().first})); break; } c.first5=!c.first5; if(c.first5 && isTeam() && !c.top && tops().length<Q().top) c.top=true; if(c.first5 && !pick.an) pick.an=c.id; save(); render(); } break;
   case "tCopy": case "tWa":
    var g=el.getAttribute("data-g"), s=scripts(g).filter(function(x){return x.id===id;})[0], who=findC(pick[g]), raw=(S.sie&&s.x2)?s.x2:s.x;
    if(a==="tCopy") copyText(fill(raw,who));
    if(who){ pend[id]=who.id; if(!who.status && g!=="fu"){ who.status="PREP"; save(); } setTimeout(function(){ render(); if(a==="tCopy") setTimeout(function(){ toast(t.prepOk); },900); },60); }
    break;
   case "tSend":
    var g2=el.getAttribute("data-g"), w2=findC(pick[g2]); if(!w2){ toast(t.whoNone); break; }
    if(g2==="fu" && w2.status==="NO"){ toast(F(t.noFuNo,{n:w2.name})); break; }
    var kind=g2==="fu"?"fu":"first";
    if(!addEv(w2.id,id,kind)){ toast(F(t.already,{n:w2.name})); break; }
    if(kind==="first" && (!w2.status||w2.status==="PREP")) w2.status="NEU";
    delete pend[id]; save(); render(); toast(F(kind==="fu"?t.sentFu:t.sentOk,{n:w2.name})); break;
  }
});
document.addEventListener("change",function(e){
  var el=e.target, a=el.getAttribute("data-act");
  if(a==="tStatus"){ var c=findC(el.getAttribute("data-id")); if(c){ c.status=el.value; save(); render(); if(el.value==="NO") toast(TX().noMsg); } return; }
  if(a==="tTop"){ var c2=findC(el.getAttribute("data-id")); if(c2){ if(el.checked && tops().length>=Q().top){ el.checked=false; toast(F(TX().maxTop,{n:Q().top})); return; } c2.top=el.checked; if(!c2.top) c2.first5=false; save(); render(); } return; }
});
document.addEventListener("input",function(e){
  var el=e.target;
  if(el.id==="calc_goal"||el.id==="calc_stage"){ var r=document.getElementById("calcres"); if(r) r.innerHTML=calcHTML(); }
});
document.addEventListener("submit",function(e){
  var f=e.target, t=TX();
  if(f.id==="startform2"){
    keepDraft(); var n=draft.name.trim(); if(!n){ toast(t.needName); return; } if(!draft.path){ toast(t.needGoal); return; } if(!draft.pace){ toast(t.needPace); return; }
    S.name=n; S.leader=draft.leader.trim(); S.path=draft.path; S.pace=draft.pace; S.consent=false; S.startedAt=Date.now(); S.view="start"; scf=DEF_GROUP[S.path]; save(); render(); window.scrollTo(0,0); return; }
  if(f.id==="talkform2"){
    var who=document.getElementById("t2_who").value.trim(), d=document.getElementById("t2_date").value, imp=document.getElementById("t2_imp").value.trim(), ok=document.getElementById("t2_ok").checked;
    if(!who||!d||imp.length<10||!ok){ toast(t.pNeed); return; }
    S.talks.unshift({at:Date.now(),d:d,who:who,imp:imp,q:document.getElementById("t2_q").value.trim(),next:document.getElementById("t2_next").value.trim(),ok:true});
    var c=S.list.filter(function(x){return x.name===who;})[0]; if(c && (!c.status||c.status==="PREP"||c.status==="NEU"||c.status==="RE")) c.status="TERMIN";
    save(); render(); toast(t.pSaved); return; }
});
scf=null;
/*@@COMMISSION@@*/
}
