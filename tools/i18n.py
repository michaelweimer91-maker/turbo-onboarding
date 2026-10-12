"""Sprachen der Testversion.
  python3 tools/i18n.py catalog   → src/test/i18n/catalog.json (alle zu übersetzenden deutschen Texte, id = Hash)
  python3 tools/i18n.py build     → src/test/i18n/<sprache>.js aus catalog.json + <sprache>.json (fehlend = Deutsch)
  python3 tools/i18n.py status    → fehlende Übersetzungen je Sprache
Benötigt node (für das Auswerten von de.js/texts.js und der JS-Literale)."""
import json,sys,os,re,hashlib,subprocess
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));sys.path.insert(0,os.path.join(R,'tools'))
from jslit import literals
D=os.path.join(R,'src/test/i18n')
LANGS={'en':('en-GB','English'),'it':('it-IT','Italiano'),'hr':('hr-HR','Hrvatski'),'pl':('pl-PL','Polski'),'tr':('tr-TR','Türkçe')}
CODE=['src/test/ext.js','src/test/commission.js','src/test/simple.js','src/test/closure.js']
def hid(s): return hashlib.sha1(s.encode('utf8')).hexdigest()[:10]
def tree(): return json.loads(subprocess.check_output(['node',os.path.join(R,'tools/i18n_tree.cjs')]))
SKIP_PATHS={'locale','label','ph'}
def translatable(path,s):
    if path[0] in SKIP_PATHS: return False
    if tuple(path)==('tx','du'): return True   # Anrede-Schalter du/Sie
    if not re.search(r'[A-Za-zÄÖÜäöüß]{2,}',s): return False
    if re.fullmatch(r'[a-z0-9_\-]{1,4}',s): return False
    if re.fullmatch(r'https?://\S+',s): return False
    return True
def leaves(o,p=()):
    if isinstance(o,dict):
        for k,v in o.items(): yield from leaves(v,p+(k,))
    elif isinstance(o,list):
        for i,v in enumerate(o): yield from leaves(v,p+(i,))
    elif isinstance(o,str): yield p,o
def code_strings():
    srcs=[]
    for f in CODE:
        s=open(os.path.join(R,f),encoding='utf8').read()
        for a,b,l in literals(s):
            if s[:a].rstrip().endswith('tr('): srcs.append(l)
    out=subprocess.check_output(['node','-e','const a=JSON.parse(require("fs").readFileSync(0,"utf8"));process.stdout.write(JSON.stringify(a.map(x=>eval(x))))'],input=json.dumps(srcs).encode())
    return json.loads(out)
def catalog():
    t=tree();cat={}
    for p,s in leaves(t['base']):
        if translatable(p,s): cat[hid(s)]=s
    for s in code_strings(): cat[hid(s)]=s
    json.dump(cat,open(os.path.join(D,'catalog.json'),'w'),ensure_ascii=False,indent=0,sort_keys=True)
    print(len(cat),'Texte',sum(len(v) for v in cat.values()),'Zeichen')
def load(l):
    f=os.path.join(D,l+'.json')
    return json.load(open(f,encoding='utf8')) if os.path.exists(f) else {}
def build():
    t=tree();cat=json.load(open(os.path.join(D,'catalog.json'),encoding='utf8'));codes=code_strings()
    for l,(loc,lab) in LANGS.items():
        tx=load(l)
        if not tx: continue
        def mp(o,p=()):
            if isinstance(o,dict): return {k:mp(v,p+(k,)) for k,v in o.items()}
            if isinstance(o,list): return [mp(v,p+(i,)) for i,v in enumerate(o)]
            if isinstance(o,str) and translatable(p,o): return tx.get(hid(o),o)
            return o
        b=mp(t['base']);b['locale']=loc;b['label']=lab
        b['str']={s:tx[hid(s)] for s in codes if hid(s) in tx}
        js='/* automatisch erzeugt von tools/i18n.py – nicht von Hand bearbeiten; Übersetzungen in '+l+'.json */\nI18N.'+l+'='+json.dumps(b,ensure_ascii=False,separators=(',',':'))+';\n'
        open(os.path.join(D,l+'.js'),'w',encoding='utf8').write(js);print(l,'geschrieben')
def status():
    cat=json.load(open(os.path.join(D,'catalog.json'),encoding='utf8'))
    for l in LANGS:
        tx=load(l);miss=[k for k in cat if k not in tx];bad=[]
        for k in cat:
            if k in tx:
                a=set(re.findall(r'\{\w+\}|\[Name\]|<[a-z/][^>]*>',cat[k]));b=set(re.findall(r'\{\w+\}|\[Name\]|<[a-z/][^>]*>',tx[k]))
                if a!=b: bad.append(k)
        print(l,'fehlend',len(miss),'Platzhalter/HTML abweichend',len(bad),bad[:8])
if __name__=='__main__': {'catalog':catalog,'build':build,'status':status}[sys.argv[1]]()
