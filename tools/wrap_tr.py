"""Umschließt deutsche UI-Literale in den Test-Dateien mit tr(...). Idempotent (bereits umschlossene werden übersprungen)."""
import sys,re
sys.path.insert(0,__import__('os').path.dirname(__file__))
from jslit import literals,is_text
SKIP_AFTER_KEY=re.compile(r'^\s*:')
for f in sys.argv[1:]:
    s=open(f,encoding='utf8').read();out=s;n=0
    for a,b,l in reversed(literals(s)):
        if not is_text(l): continue
        before=s[:a].rstrip()
        if before.endswith('tr(') : continue
        if SKIP_AFTER_KEY.match(s[b:]) and before[-1:] in '{,': continue   # Objektschlüssel
        if before.endswith('case'): continue
        if re.search(r'(===|!==|==|indexOf\(|getAttribute\(|querySelector(All)?\(|getElementById\()$',before): print('SKIP-CMP',f,l[:60]); continue
        out=out[:a]+'tr('+l+')'+out[b:];n+=1
    open(f,'w',encoding='utf8').write(out);print(f,n)
