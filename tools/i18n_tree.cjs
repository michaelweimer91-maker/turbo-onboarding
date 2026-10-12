// Gibt den effektiven deutschen Texte-Baum der Testversion aus (de.js + texts.js überlagert), plus easy-Overlay.
const fs=require('fs'),path=require('path'),R=path.resolve(__dirname,'..');
const I18N={};const window={};
eval(fs.readFileSync(R+'/src/i18n/de.js','utf8'));eval(fs.readFileSync(R+'/src/test/texts.js','utf8'));
const clone=o=>JSON.parse(JSON.stringify(o));
function dmerge(a,b){for(const k in b){if(b[k]&&typeof b[k]==='object'&&!Array.isArray(b[k])&&a[k]&&typeof a[k]==='object'&&!Array.isArray(a[k]))dmerge(a[k],b[k]);else a[k]=b[k];}return a;}
const TT=I18N.de.test;
if(TT.scriptsAdd)for(const g in TT.scriptsAdd)I18N.de.scripts[g]=I18N.de.scripts[g].concat(TT.scriptsAdd[g]);
if(TT.scriptsSet)for(const g in TT.scriptsSet)for(const i in TT.scriptsSet[g])I18N.de.scripts[g][+i]=TT.scriptsSet[g][i];
dmerge(I18N.de,clone(TT.over||{}));
const base=clone(I18N.de);delete base.test;
process.stdout.write(JSON.stringify({base,easy:TT.easy||null,testKeys:Object.keys(TT)}));
