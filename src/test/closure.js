/* Abschlussprovision (Testversion/Vorschau). Wird nach simple.js eingesetzt.
   Quelle: Angabe Michael Weimer, 12.10.2026 (Chat) + Vergütungsgrafik img/verguetungsplan.jpg.
   Regeln:
   - Premium-Paket = 3 CP (gültig ab 15.09.2026), Gutschein/Voucher = 1 CP; beides kann ein Partner erwerben.
   - Wer selbst einschreibt: Abschluss-Satz seines Rangs × CP (CC.closureRates).
   - Darüber: liegt der eigene Satz über dem der ersten Linie → nur die Differenz × CP.
   - Hat der direkte Partner dieselbe Stufe → keine Differenz, dafür Team-Abschlussprovision nach Generation.
   - Team-Abschluss je CP laut Grafik: CB nur Gen. 1 = 20 €, ab TB 20 / 6 / 4 €. Einheit "je CP" = Annahme, siehe CL.teamUnit.
   Offen (nicht bestätigt): Kosten, Qualifikation/50-%-/30-%-Regel, Anspruch und Auszahlung. */
var CL={source:"Angabe Michael Weimer, 12.10.2026 · Vergütungsgrafik",validFrom:"15.09.2026",teamUnit:"je CP",
 packages:[{id:"premium",name:"Premium-Paket",cp:3},{id:"voucher",name:"Gutschein / Voucher",cp:1}],
 team:{P:[0,0,0],CB:[20,0,0],TB:[20,6,4],AM:[20,6,4],RD:[20,6,4],SD:[20,6,4],CM:[20,6,4],IBM:[20,6,4]}};
function clState(){var c=S.commission;if(!c.cl||typeof c.cl!=='object')c.cl={};var s=c.cl;
 if(!s.pkg)s.pkg='premium';if(!s.me)s.me='TB';if(!s.who)s.who='self';if(!s.partner)s.partner='TB';if(s.n==null||s.n==='')s.n=1;return s;}
function clPkg(id){return CL.packages.filter(function(p){return p.id===id;})[0]||CL.packages[0];}
function clIdx(id){for(var i=0;i<CC.ranks.length;i++)if(CC.ranks[i].id===id)return i;return 0;}
/* Ergebnis je Paket: {eur, kind, why} */
function clCalc(me,who,partner,cp){
 var rm=CC.closureRates[me]||0;
 if(who==='self')return {eur:rm*cp,kind:'Direktprovision',why:cp+' CP × '+rm+' €'};
 var g=who==='g1'?1:who==='g2'?2:3;
 if(g===1&&partner!==me){
  var rp=CC.closureRates[partner]||0;
  if(rm>rp)return {eur:(rm-rp)*cp,kind:'Differenzprovision',why:cp+' CP × ('+rm+' € − '+rp+' €)'};
  return {eur:0,kind:'keine',why:'Dein direkter Partner hat einen höheren Abschluss-Satz als du – keine Differenz.'};
 }
 var t=(CL.team[me]||[0,0,0])[g-1]||0;
 if(!t)return {eur:0,kind:'keine',why:me==='CB'?'Als Community Builder gibt es Team-Abschluss nur in Generation 1.':'Für deinen Rang ist keine Team-Abschlussprovision hinterlegt.'};
 return {eur:t*cp,kind:'Team-Abschlussprovision Gen. '+g,why:cp+' CP × '+t+' € (gleiche Stufe)'};
}
function clCount(){var n=cNum(clState().n,true,10000);return n==null?null:n;}
cClosureResult=function(){
 var s=clState(),p=clPkg(s.pkg),n=clCount();
 if(n==null||n<1)return '<p class="small muted">Gib eine Anzahl von mindestens 1 ein.</p>';
 var r=clCalc(s.me,s.who,s.partner,p.cp);
 if(!r.eur)return '<p><b>0,00 €</b></p><p class="small">'+r.why+'</p>';
 return '<p><b>'+n+' × '+p.name+' → '+r.kind+': '+(n>1?n+' × ':'')+r.why+' = '+cMoney(n*r.eur)+'</b></p><p class="small muted">Einmalig je Paket, keine Airtime und kein Monatseinkommen. Keine Einkommensgarantie – verbindlich sind die offiziellen Unterlagen.</p>';
};
function clDepth(){
 var s=clState(),p=clPkg(s.pkg),me=s.me,mi=clIdx(me),rows=[];
 rows.push(['Du schreibst selbst ein',clCalc(me,'self','',p.cp)]);
 for(var i=0;i<mi;i++){var r=CC.ranks[i];rows.push(['Direkter Partner ist '+r.id,clCalc(me,'g1',r.id,p.cp)]);}
 [1,2,3].forEach(function(g){rows.push(['Partner auf gleicher Stufe ('+me+'), Generation '+g,clCalc(me,'g'+g,me,p.cp)]);});
 return '<div class="card stack"><h3>Was du als '+me+' je '+p.name+' ('+p.cp+' CP) erhältst</h3><table class="pick"><tbody>'+rows.map(function(x){return '<tr><td>'+x[0]+'</td><td><b>'+cMoney(x[1].eur)+'</b><br><span class="small muted">'+x[1].kind+'</span></td></tr>';}).join('')+'</tbody></table></div>';
}
function clChain(){
 var cp=clPkg(clState().pkg).cp,tb=CC.closureRates.TB,am=CC.closureRates.AM,rd=CC.closureRates.RD;
 return '<div class="card hi stack"><h3>Beispiel: Wer bekommt was?</h3><p class="small">Ein Team Builder schreibt einen neuen Partner mit '+clPkg(clState().pkg).name+' ('+cp+' CP) ein. Darüber stehen ein Area Manager und ein Regional Director.</p><p class="small">TB: '+cp+' × '+tb+' € = <b>'+cMoney(cp*tb)+'</b><br>AM: '+cp+' × ('+am+' − '+tb+') € = <b>'+cMoney(cp*(am-tb))+'</b> Differenz<br>RD: '+cp+' × ('+rd+' − '+am+') € = <b>'+cMoney(cp*(rd-am))+'</b> Differenz</p><p class="small muted">Jeder bekommt nur den Unterschied zu dem Satz, der darunter schon bezahlt ist. Steht über dir ein Partner auf gleicher Stufe, greift statt der Differenz die Team-Abschlussprovision.</p></div>';
}
function clSel(key,opts,val){return '<select data-cl="'+key+'">'+opts.map(function(o){return '<option value="'+o[0]+'"'+(String(val)===o[0]?' selected':'')+'>'+o[1]+'</option>';}).join('')+'</select>';}
cClosureHTML=function(){
 var s=clState(),ranks=CC.ranks.map(function(r){return [r.id,r.id+' · '+r.name+' · '+CC.closureRates[r.id]+' €/CP'];});
 var h='<p class="small">Wenn ein neuer Partner ein Paket erwirbt, gibt es <b>einmalig</b> Abschlussprovision je Commission Point (CP). '+CL.packages.map(function(p){return p.name+' = <b>'+p.cp+' CP</b>';}).join(', ')+' (gültig ab '+CL.validFrom+').</p>';
 h+='<div class="grid2"><label class="field"><span>Paket</span>'+clSel('pkg',CL.packages.map(function(p){return [p.id,p.name+' ('+p.cp+' CP)'];}),s.pkg)+'</label>';
 h+='<label class="field"><span>Anzahl Pakete</span><input type="number" min="1" step="1" data-cl="n" value="'+esc(String(s.n))+'"></label>';
 h+='<label class="field"><span>Dein Rang</span>'+clSel('me',ranks,s.me)+'</label>';
 h+='<label class="field"><span>Wer schreibt ein?</span>'+clSel('who',[['self','Ich selbst'],['g1','Mein direkter Partner (1. Linie)'],['g2','Partner in Generation 2 (gleiche Stufe)'],['g3','Partner in Generation 3 (gleiche Stufe)']],s.who)+'</label>';
 if(s.who==='g1')h+='<label class="field"><span>Rang deines direkten Partners</span>'+clSel('partner',ranks,s.partner)+'</label>';
 h+='</div><div id="commission-closure-results" aria-live="polite">'+cClosureResult()+'</div>';
 h+='<div id="commission-closure-depth">'+clDepth()+'</div>'+clChain();
 h+='<p class="small muted">Quelle: '+CL.source+'. Team-Abschlussprovision '+CL.teamUnit+' laut Grafik. Noch nicht bestätigt: Kosten, Qualifikation (50-%-/30-%-Regel), Anspruch und Auszahlung. Keine Einkommensgarantie – verbindlich sind die offiziellen Unterlagen.</p>';
 return h;
};
function clRefresh(full){
 var box=document.getElementById('commission-closure-box');
 if(full&&box){box.innerHTML=cClosureHTML();return;}
 var out=document.getElementById('commission-closure-results');if(out)out.innerHTML=cClosureResult();
 var d=document.getElementById('commission-closure-depth');if(d)d.innerHTML=clDepth();
}
document.addEventListener('input',function(e){var k=e.target.getAttribute&&e.target.getAttribute('data-cl');if(k!=='n')return;clState().n=e.target.value;save();clRefresh(false);});
document.addEventListener('change',function(e){var k=e.target.getAttribute&&e.target.getAttribute('data-cl');if(!k||k==='n')return;clState()[k]=e.target.value;save();clRefresh(k==='who'||k==='pkg');});
