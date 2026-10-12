"""Baut index.html (Live) und test.html (Testversion) aus src/. Aufruf im Repo-Root: python3 build.py
Live:  src/i18n/*.js + src/app.js (ohne Test-Erweiterung)
Test:  zusätzlich src/test/texts.js (Texte) + src/test/ext.js (an der Stelle /*@@TEST_EXT@@*/ in app.js),
       window.TURBO_TEST=true → eigener Speicher bp_turbo_test_v1, kein Controlling-Sync."""
import os
R=os.path.dirname(os.path.abspath(__file__))
def rd(p): return open(f"{R}/{p}",encoding="utf8").read()
order=["de","en","it","hr","pl","tr"]
langs=[l for l in order if os.path.exists(f"{R}/src/i18n/{l}.js")]
i18n="var I18N={};\n"+"\n".join(rd(f"src/i18n/{l}.js") for l in langs)
app=rd("src/app.js"); MARK="/*@@TEST_EXT@@*/"
assert MARK in app, "Marker fehlt in app.js"
head=rd("src/app_head.html")
swreg='<script>if("serviceWorker" in navigator){window.addEventListener("load",function(){navigator.serviceWorker.register("sw.js").catch(function(){});});}</script>\n'
def page(js_i18n,js_app,test):
    pwa=('' if test else '<link rel="manifest" href="manifest.webmanifest">\n')+'<link rel="apple-touch-icon" href="apple-touch-icon.png">\n<link rel="icon" type="image/png" href="icon-192.png">\n'\
        '<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n<meta name="apple-mobile-web-app-title" content="Turbo">\n'
    h=head.replace("<title>Turbo-Onboarding</title>","<title>TEST · Turbo-Onboarding</title>",1) if test else head
    cut=h.index("</style>")+len("</style>")
    meta='<meta charset="utf-8">\n'+('<meta name="robots" content="noindex">\n' if test else '')
    return ('<!doctype html>\n<html lang="de">\n<head>\n'+meta+'<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
        +pwa+h[:cut]+"\n</head>\n<body>\n"+h[cut:]+'\n<script src="config.js"></script>\n'
        +('<script>window.TURBO_TEST=true;</script>\n' if test else '')
        +'<script>\n'+js_i18n+"\n"+js_app+"\n</script>\n"+swreg+"</body>\n</html>\n")
live=page(i18n,app.replace(MARK,""),False)
assert '<div id="root">' in live
assert "TURBO_TEST=true" not in live and "I18N.de.test={" not in live and "TESTVERSION – Nutzerführung" not in live
open(f"{R}/index.html","w",encoding="utf8").write(live)
print("index.html gebaut:",len(live),"Bytes · Sprachen:",", ".join(langs))
test=page(i18n+"\n"+rd("src/test/texts.js"),app.replace(MARK,rd("src/test/ext.js")),True)
assert '<div id="root">' in test and "TURBO_TEST=true" in test
open(f"{R}/test.html","w",encoding="utf8").write(test)
print("test.html gebaut:",len(test),"Bytes")
