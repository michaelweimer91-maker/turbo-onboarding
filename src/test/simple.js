/* V3: progressive disclosure, four main areas; all existing data retained. */
var simpleGroups=[['start',tr('Start')],['system',tr('System verstehen')],['plan',tr('Geld verdienen')],['list',tr('Aktiv werden')]];
function simpleGroup(id){return ['start','system','plan'].indexOf(id)>=0?id:'list';}
function simpleNext(){return req().filter(function(id){return !autoDone(id);})[0]||'finish';}
var _simpleHead=head;
head=function(id,lead){return '<header class="stack"><div class="eyebrow">'+simpleGroups.filter(function(g){return g[0]===simpleGroup(id);})[0][1]+'</div><h1>'+({start:tr('Dein Start'),system:tr('So funktioniert es'),plan:tr('So verdienst du Geld')}[id]||MT(id))+'</h1>'+(lead?'<p class="lead">'+lead+'</p>':'')+'</header>';};
var _simpleRender=render;
render=function(){
 _simpleRender(); if(!S.startedAt)return;
 var side=document.getElementById('side');if(!side)return;
 Array.prototype.slice.call(side.querySelectorAll('.phase')).forEach(function(el){el.remove();});
 var nav=document.createElement('nav');nav.className='simple-nav';nav.setAttribute('aria-label',tr('Hauptbereiche'));
 nav.innerHTML=simpleGroups.map(function(g,i){return '<button class="nav'+(simpleGroup(S.view)===g[0]?' on':'')+'" data-go="'+(g[0]==='list'&&simpleGroup(simpleNext())==='list'?simpleNext():g[0])+'"><span class="dot">'+(i+1)+'</span>'+g[1]+'</button>';}).join('')+more(tr('Alle Aufgaben'),'<div class="stack">'+ORDER.map(function(id){return '<button class="btn ghost" data-go="'+id+'">'+(autoDone(id)?'✓ ':'')+MT(id)+(isOpt(id)?' (optional)':'')+'</button>';}).join('')+'</div>');
 side.insertBefore(nav,side.querySelector('.side-foot'));
 var bar=document.querySelector('.topbar .tab');if(bar)bar.textContent=Math.round(doneCount()/totalReq()*100)+tr(' % erledigt');
 var mobile=document.querySelector('.mobnav');if(mobile)mobile.remove();
 var me=side.querySelector('.me');if(me)me.insertAdjacentHTML('afterend',setBar());
 var tb=document.querySelector('.topbar');if(tb){tb.insertAdjacentHTML('beforeend',setBtn());tb.insertAdjacentHTML('afterend','<div class="setpop noprint" id="setpop" hidden>'+setBar()+'</div>');}
};
renderFoot=function(id){var sequence=req(),i=sequence.indexOf(id),next=(i>=0?sequence[i+1]:sequence.filter(function(m){return ORDER.indexOf(m)>ORDER.indexOf(id);})[0])||simpleNext();return stuckBox(id)+'<div class="modfoot noprint"><span class="badge '+(autoDone(id)?'b-ok':'b-mut')+'">'+(autoDone(id)?tr('Erledigt'):tr('In Bearbeitung'))+'</span><div class="row">'+(i>0?'<button class="btn ghost" data-go="'+sequence[i-1]+tr('">Zurück</button>'):'')+(id!==next?'<button class="btn pri" data-go="'+next+tr('">Weiter: ')+MT(next)+'</button>':'')+'</div></div>';};
var _simpleStart=R.start;
R.start=function(){
 var full=_simpleStart();if(!S.planAt)return full;
 var next=simpleNext(),pct=Math.round(doneCount()/totalReq()*100);
 return head('start',tr('Hallo ')+esc(S.name)+tr('. Ein Schritt nach dem anderen.'))+tr('<section class="card hi stack"><span class="label">Dein nächster Schritt</span><h2>')+MT(next)+'</h2><p>'+({system:tr('Verstehe den Nutzen anhand eines einfachen Beispiels.'),plan:tr('Lerne die drei Verdienstwege kennen.'),list:tr('Notiere passende Menschen für ein erstes Gespräch.'),top:tr('Wähle deinen ersten Kontakt.'),talkto:tr('Bereite eine persönliche Nachricht vor.')}[next]||tr('Setze deine nächste Aufgabe um.'))+'</p><button class="btn gold" data-go="'+next+'">'+(next==='start'?tr('Arbeitsplan prüfen'):tr('Jetzt weitermachen'))+'</button><progress max="100" value="'+pct+'" aria-label="'+tr('Fortschritt')+'">'+pct+' %</progress><span class="small muted">'+pct+tr(' % erledigt · ')+sprintLabel()+'</span></section>'+more(tr('Mein Ziel und Arbeitsplan'),full);
};
var _simpleSystem=R.system;
R.system=function(){var full=_simpleSystem(),at=full.indexOf('<div class="card stack"><h2>'+TX().quizT);return head('system',tr('Ein Einkauf. Ein Kundenvorteil. Deine Aufgabe: den Nutzen verständlich erklären.'))+sysIntro()+more(tr('Meine Rolle, Selbstcheck und Übung'),at>=0?full.slice(at):full);};
/* First two cards are now directly visible in one overview. Written answers are optional. */
commissionComplete=function(){return commissionQuizOk();};
var _simpleQuiz=cQuizHTML;
cQuizHTML=function(advanced){
 if(advanced)return _simpleQuiz(true);
 var i=CC.quiz.findIndex(function(q,j){return S.commission.quiz[j]!==q.c;});
 if(i<0)return tr('<p class="badge b-ok">3 von 3 Fragen richtig</p>');
 var q=CC.quiz[i];return tr('<span class="label">Frage ')+(i+1)+' von 3</span><h3>'+q.q+'</h3><div class="stack">'+q.a.map(function(a,j){return '<button class="opt" data-act="cQuiz" data-advanced="0" data-q="'+i+'" data-a="'+j+'">'+a+'</button>';}).join('')+'</div>'+(S.commission.quiz[i]!=null?'<p class="small">'+q.why+'</p>':'');
};
var _simpleCalc=cCalculatorHTML;
cCalculatorHTML=function(){
 var h=_simpleCalc(),a=S.commission.calc;
 var doc=document.createElement('div');doc.innerHTML=h;
 var modes=doc.querySelector('.c-controls');
 if(modes){var detail=document.createElement('div');detail.innerHTML=more(tr('Weitere Berechnungen: Team und IBM'),modes.outerHTML,'',a.mode!=='own');modes.replaceWith(detail.firstElementChild);}
 if(a.mode==='own'){
  var grid=doc.querySelector('.grid2'),advanced=document.createElement('div');
  ['cp','goal'].forEach(function(key){var input=grid.querySelector('[data-calc="'+key+'"]');if(input)advanced.appendChild(input.closest('label'));});
  var options=document.createElement('div');options.innerHTML=more(tr('Annahmen und Wunschziel ändern'),advanced.innerHTML);grid.after(options.firstElementChild);
 }
 return doc.innerHTML;
};
R.plan=function(){
 var c=S.commission;S.plan.seen=true;
 var h=head('plan',tr('Drei Wege. Ein einfaches Beispiel zum Einstieg.'));
 h+=tr('<div class="grid3 simple-ways"><section class="card"><span class="label">01 · Eigene Kunden</span><h3>Nutzung ermöglichen</h3><p>Aktive Kunden nutzen ePOINT. Vergütungsfähige Nutzung erzeugt CP - die Rechenpunkte für deine Provision.</p></section><section class="card"><span class="label">02 · Partner begleiten</span><h3>Gemeinsam aufbauen</h3><p>Du unterstützt Partner. Je nach berechtigtem Rang kann dir eine Differenzvergütung zustehen.</p></section><section class="card"><span class="label">03 · Team entwickeln</span><h3>Mit dem Team wachsen</h3><p>Zusätzlich gibt es ein Teammodell nach Partnerebenen. Anspruch und Kombination richten sich nach dem gültigen Plan.</p></section></div>');
 h+=tr('<section class="card hi stack"><h2>Ein Beispiel mit eigenen Kunden</h2><p><b>100 aktive Kunden × 0,10 CP × 20 € = 200 €</b></p><p class="small">CP sind Commission Points: Rechenpunkte aus vergütungsfähiger Nutzung. Airtime ist die daraus berechnete, nutzungsbezogene Provision. Hier rechnen wir beispielhaft mit dem Team-Builder-Satz von 20 € je CP.</p><p class="small muted">Modell für einen Abrechnungsmonat, keine Einkommensgarantie. 0,10 CP je Kunde sind eine Annahme; Qualifikation, tatsächliche Nutzung, Kosten und Auszahlung müssen berücksichtigt werden.</p></section>');
 if(S.path==='merch')h+=tr('<p class="small muted">Händlerweg: Kläre vor einem konkreten Angebot den aktuellen Händlerprozess mit deinem Leader.</p>');
 h+=tr('<div class="card"><h3>Einmalig oder laufend?</h3><p class="small"><b>Abschlussprovision:</b> einmalig, wenn ein neuer Partner ein Paket erwirbt – z. B. als Team Builder: Premium-Paket 3 CP × 40 € = 120 €.<br><b>Airtime:</b> aus vergütungsfähiger Nutzung im jeweiligen Zeitraum. Eine Registrierung allein erzeugt keinen festen Monatsverdienst.</p></div>');
 h+=more(tr('Mit eigenen Zahlen rechnen'),cCalculatorHTML(),'commission-calc',!!c.calcOpen);
 h+=more(tr('Abschlussprovision berechnen'),'<div id="commission-closure-box">'+cClosureHTML()+'</div>','commission-closure');
 h+=more(tr('Mehr erfahren: Team, Positionen und IBM'), [2,3,4,5,6].map(function(i){return more(CC.cards[i],cCardHTML(i));}).join('')+more(tr('Teamwissen prüfen (optional)'),cQuizHTML(true)));
 h+=tr('<section class="card stack"><h2>Kurz prüfen, dann weiter</h2>')+cQuizHTML(false)+(commissionQuizOk()?'<label class="opt"><input type="checkbox" data-bind="plan.ok"'+(S.plan.ok?' checked':'')+tr('> Ich verstehe einmalige und nutzungsbezogene Provision. Offene Bedingungen kläre ich vor konkreten Zusagen.</label>'):'')+'<div id="commission-check" class="small">'+(autoDone('plan')?tr('Grundlagen erledigt.'):tr('Beantworte die drei kurzen Fragen.'))+'</div></section>';
 h+=more(tr('Bedingungen und Unterlagen'),cFactsHTML()+more(tr('Bisherige Plangrafik'),tr('<p class="small">Undatierte Grafik: vor Zusagen mit der aktuellen offiziellen Fassung abgleichen.</p><img style="max-width:100%" src="img/verguetungsplan.jpg" alt="Bisheriger Vergütungsplan">'))+more(tr('In eigenen Worten erklären (optional)'),tr('<label class="field"><span>Wie entsteht Vergütung?</span><textarea data-bind="commission.ownWords">')+esc(c.ownWords||'')+'</textarea></label>'));
 return h;
};
var _simpleSysIntro=sysIntro;
sysIntro=function(){var t=TX();return tr('<section class="card hi stack" id="sysintro"><h2>Ein Beispiel aus dem Alltag</h2><p>')+t.example+'</p><p class="small muted">'+t.exNote+tr('</p></section><div class="card stack"><h2>Wer macht was?</h2>')+t.brands.map(function(b){return '<p class="small"><b>'+b[0]+':</b> '+b[1]+'</p>';}).join('')+'</div>'+more(tr('Ablauf und Verfügbarkeit im Detail'),_simpleSysIntro().replace('id="sysintro"',''));};
renderWelcome=function(){
 var t=TX();if(!draft.pace)draft.pace='easy';
 return '<div class="welcome">'+testBar()+setBar()+brand()+tr('<header class="stack"><h1>Dein Start bei BestPrime</h1><p class="lead">Verstehen. Deinen Weg finden. Den ersten Schritt machen.</p></header><form class="card hi stack" id="startform2"><h2>Wie möchtest du starten?</h2><label class="field"><span>Dein Vorname</span><input id="w_name" autocomplete="given-name" value="')+esc(draft.name)+tr('"></label><label class="field"><span>Was ist dein Ziel?</span><select id="simple-path"><option value="">Bitte wählen</option>')+t.pathOrder.map(function(k){return '<option value="'+k+'"'+(draft.path===k?' selected':'')+'>'+t.paths[k][0]+'</option>';}).join('')+'</select></label><input type="hidden" id="w_leader" value="'+esc(draft.leader)+tr('"><p class="small muted">Du startest in deinem Tempo. Ziel und Tempo kannst du später anpassen.</p><button class="btn gold" type="submit">Los geht’s</button><p class="small muted">')+t.localNote+'</p></form>'+more(tr('Vorher kurz verstehen'),sysIntro())+more(tr('Bestehenden Stand laden'),'<button class="btn" data-act="backup">'+L.ui.loadBackup+'</button><div id="backupbox"></div>')+'</div>';
};
document.addEventListener('change',function(e){if(e.target.id==='simple-path'){keepDraft();draft.path=e.target.value;}});
var _simpleStartFinal=R.start;
R.start=function(){
 var html=_simpleStartFinal();if(S.planAt)return html;
 var doc=document.createElement('div');doc.innerHTML=html;
 ['prof.motiveTxt','leader','name'].forEach(function(key){var input=doc.querySelector('[data-bind="'+key+'"]');if(!input)return;var block=key==='prof.motiveTxt'?input.parentElement:input.closest('.grid2');if(block&&!block.closest('details')){var wrap=document.createElement('div');wrap.innerHTML=more(key==='prof.motiveTxt'?tr('Meine Motivation (optional)'):tr('Persönliche Angaben'),block.outerHTML);block.replaceWith(wrap.firstElementChild);}});
 var checks=doc.querySelector('ul.checks');if(checks){var box=checks.closest('.card');var wrap=document.createElement('div');wrap.innerHTML=more(tr('Alle Aufgaben im Überblick'),box.innerHTML);box.replaceWith(wrap.firstElementChild);}
 return doc.innerHTML;
};
var _simpleScripts=scriptBlock2;
scriptBlock2=function(g,title,excludeNo){
 var html=_simpleScripts(g,title,excludeNo);if(g!=='an')return html;
 var doc=document.createElement('div');doc.innerHTML=html;
 var scripts=doc.querySelectorAll('.script');if(scripts.length<2)return html;
 var rest='',open=false;
 for(var i=1;i<scripts.length;i++){var btn=scripts[i].querySelector('[data-act="tCopy"]');if(btn&&pend[btn.getAttribute('data-id')])open=true;rest+=scripts[i].outerHTML;scripts[i].remove();}
 var first=doc.querySelector('.script'),grid=first.parentElement;grid.className='stack';
 var options=document.createElement('div');options.innerHTML=more(tr('Weitere Nachrichtenvorlagen'),rest,'',open);grid.after(options.firstElementChild);
 return doc.innerHTML;
};
