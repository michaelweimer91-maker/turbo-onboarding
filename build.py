"""Baut index.html (Live) und test.html (Testversion) aus src/. Aufruf im Repo-Root: python3 build.py
Live:  src/i18n/*.js + src/app.js (ohne Test-Erweiterung)
Test:  zusätzlich src/test/texts.js (Texte) + src/test/ext.js (an der Stelle /*@@TEST_EXT@@*/ in app.js),
       window.TURBO_TEST=true → eigener Speicher bp_turbo_test_v1, kein Controlling-Sync."""
import os,sys
R=os.path.dirname(os.path.abspath(__file__))
def rd(p): return open(f"{R}/{p}",encoding="utf8").read()
order=["de","en","it","hr","pl","tr"]
langs=[l for l in order if os.path.exists(f"{R}/src/i18n/{l}.js")]
i18n="var I18N={};\n"+"\n".join(rd(f"src/i18n/{l}.js") for l in langs)
app=rd("src/app.js"); MARK="/*@@TEST_EXT@@*/"
ti18n="\n".join(rd(f"src/test/i18n/{l}.js") for l in order[1:] if os.path.exists(f"{R}/src/test/i18n/{l}.js"))  # Sprachen nur Test/Vorschau
ext=rd("src/test/ext.js").replace("/*@@COMMISSION@@*/",rd("src/test/commission.js")+"\n"+rd("src/test/simple.js")+"\n"+rd("src/test/closure.js"))
assert MARK in app, "Marker fehlt in app.js"
head=rd("src/app_head.html")
swreg='<script>if("serviceWorker" in navigator){window.addEventListener("load",function(){navigator.serviceWorker.register("sw.js").catch(function(){});});}</script>\n'
def page(js_i18n,js_app,test,preview=False,livev3=False):
    pwa=('' if test else '<link rel="manifest" href="manifest.webmanifest">\n')+'<link rel="apple-touch-icon" href="apple-touch-icon.png">\n<link rel="icon" type="image/png" href="icon-192.png">\n'\
        '<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n<meta name="apple-mobile-web-app-title" content="Turbo">\n'
    h=head.replace("<title>Turbo-Onboarding</title>","<title>TEST · Turbo-Onboarding</title>",1) if test else head
    cut=h.index("</style>")+len("</style>")
    meta='<meta charset="utf-8">\n'+('<meta name="robots" content="noindex">\n' if test or preview else '')
    return ('<!doctype html>\n<html lang="de">\n<head>\n'+meta+'<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
        +pwa+h[:cut]+"\n</head>\n<body>\n"+h[cut:]+'\n<script src="config.js"></script>\n'
        +('<script>\n'+rd("product-facts.js")+'\n</script>\n' if test or preview or livev3 else '')
        +('<script>window.TURBO_ONBOARDING_V2=true;window.TURBO_NO_MERCH=true;</script>\n' if livev3 else '')
        +('<script>window.TURBO_TEST=true;</script>\n' if test else '')
        +('<script>window.TURBO_ONBOARDING_V2=true;window.TURBO_PREVIEW=true;</script>\n' if preview else '')
        +'<script>\n'+js_i18n+"\n"+js_app+"\n</script>\n"+swreg+"</body>\n</html>\n")
# Live = neue Nutzerführung (seit 13.10.2026): wie die Vorschau, aber Speicher bp_turbo_v1, Controlling-Sync an, ohne Händlerweg.
# Rückweg auf die alte Live-Nutzerführung: python3 build.py --live-alt  (oder git-Tag live-vor-umstellung-2026-10-13)
if "--live-alt" in sys.argv:
    import re as _re
    head_live=_re.sub(r"/\*@@THEME_START@@\*/.*?/\*@@THEME_END@@\*/\n?","",head,flags=_re.S)
    _h=head; head=head_live
    live=page(i18n,app.replace(MARK,""),False)
    head=_h
    assert "data-theme" not in live and "I18N.en=" not in live
else:
    live=page(i18n+"\n"+rd("src/test/texts.js")+"\n"+ti18n,app.replace(MARK,ext),False,False,True)
    assert "TURBO_NO_MERCH=true" in live and "TURBO_PREVIEW=true" not in live
assert '<div id="root">' in live
assert "TURBO_TEST=true" not in live and 'name="robots"' not in live
open(f"{R}/index.html","w",encoding="utf8").write(live)
print("index.html gebaut:",len(live),"Bytes ·","ALTE Nutzerführung" if "--live-alt" in sys.argv else "neue Nutzerführung, 6 Sprachen, Hell/Dunkel, ohne Händlerweg")
test=page(i18n+"\n"+rd("src/test/texts.js")+"\n"+ti18n,app.replace(MARK,ext),True)
assert '<div id="root">' in test and "TURBO_TEST=true" in test
open(f"{R}/test.html","w",encoding="utf8").write(test)
print("test.html gebaut:",len(test),"Bytes")
if "--preview" in sys.argv:
    preview=page(i18n+"\n"+rd("src/test/texts.js")+"\n"+ti18n,app.replace(MARK,ext),False,True)
    open(f"{R}/onboarding-preview.html","w",encoding="utf8").write(preview)
    print("onboarding-preview.html gebaut: eigener Speicher, kein Sync, Live-Build nicht ersetzt")
