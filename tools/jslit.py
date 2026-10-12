"""Findet String-Literale in JS-Dateien (einfacher Tokenizer: Kommentare, Strings, Template-Literale, Regex grob)."""
import re,sys
def literals(src):
    i,n=0,len(src);out=[];prev=''
    while i<n:
        c=src[i]
        if src.startswith('//',i):
            j=src.find('\n',i); i=n if j<0 else j; continue
        if src.startswith('/*',i):
            j=src.find('*/',i+2); i=n if j<0 else j+2; continue
        if c in '"\'`':
            j=i+1
            while j<n and src[j]!=c:
                if src[j]=='\\': j+=1
                j+=1
            out.append((i,j+1,src[i:j+1])); i=j+1; prev='s'; continue
        if c=='/' :
            # Regex-Literal, wenn vorher Operator/Klammer
            k=i-1
            while k>=0 and src[k] in ' \t\n': k-=1
            if k<0 or src[k] in '(,=:[!&|?{};+':
                j=i+1;cls=False
                while j<n:
                    if src[j]=='\\': j+=2; continue
                    if src[j]=='[': cls=True
                    elif src[j]==']': cls=False
                    elif src[j]=='/' and not cls: break
                    elif src[j]=='\n': break
                    j+=1
                i=j+1; continue
        i+=1
    return out
TAG=re.compile(r'<[^>]*>')
def is_text(lit):
    body=lit[1:-1]
    if lit[0]=='`': return False
    t=TAG.sub(' ',body)
    t=re.sub(r'<[^>]*$',' ',t); t=re.sub(r'^[^<>]*>',' ',t)
    if re.search(r'(class|data-[\w-]+|id|type|value|style|href|src)=',t): t=re.sub(r'[\w-]+="[^"]*"?',' ',t)
    t=re.sub(r'&\w+;',' ',t)
    words=re.findall(r'[A-Za-zÄÖÜäöüß]{2,}',t)
    if not words: return False
    if re.search(r'[äöüÄÖÜß]',t): return True
    # mindestens zwei Wörter mit Leerzeichen oder ein deutsches Großwort
    if len(words)>=2 and ' ' in t.strip():
        if re.search(r'[\[#{};]|var\(|^\s*[.#\[]|=',t): return False
        if not re.search(r'[A-ZÄÖÜ][a-zäöüß]{2,}|\b[a-zäöüß]{3,}\s+[a-zäöüß]{3,}',t): return False
        return True
    if len(words)==1 and re.fullmatch(r'\s*[A-ZÄÖÜ][a-zäöüß]{2,}(-[A-ZÄÖÜa-zäöüß]+)*\s*[:.!?]?\s*',t) : return True
    return False
if __name__=='__main__':
    for f in sys.argv[1:]:
        s=open(f,encoding='utf8').read()
        for a,b,l in literals(s):
            if is_text(l): print(f.split('/')[-1],a,l[:110])
