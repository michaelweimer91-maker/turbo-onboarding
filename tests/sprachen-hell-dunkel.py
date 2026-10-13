# Prüft Sprachen (de/en/it/hr/pl/tr) und Hell/Dunkel in test.html + Vorschau, Live unverändert.
# Voraussetzung: python3 -m http.server 8765 im Repo-Ordner. Aufruf: python3 tests/sprachen-hell-dunkel.py <ausgabeordner>
import asyncio,sys,json
from playwright.async_api import async_playwright
OUT=sys.argv[1] if len(sys.argv)>1 else "."
B="http://localhost:8765/"
R=[]
def ok(n,c,d=""): R.append({"r":"PASS" if c else "FAIL","case":n,"detail":str(d)[:160]}); print(("PASS " if c else "FAIL ")+n+" | "+str(d)[:160])
EXP={"en":("Your start at BestPrime","120.00 €"),"it":("Il tuo inizio con BestPrime","120,00 €"),"hr":("Tvoj početak u BestPrimeu","120,00 €"),"pl":("Twój start w BestPrime","120,00 €"),"tr":("BestPrime'da başlangıcın","120,00 €"),"de":("Dein Start bei BestPrime","120,00 €")}
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path="/opt/pw-browsers/chromium",args=["--no-sandbox"])
    for page in ["test.html","onboarding-preview.html"]:
      for lang,(h1,money) in EXP.items():
        err=[];pg=await b.new_page(locale="de-DE",viewport={"width":390,"height":900});pg.on("pageerror",lambda e: err.append(str(e)))
        await pg.goto(B+page);await pg.evaluate("localStorage.clear()");await pg.reload();await pg.wait_for_timeout(200)
        await pg.fill("#w_name","Ana")
        if lang!="de": await pg.select_option(".setbar select[data-act=langsel]",lang);await pg.wait_for_timeout(700)
        t=await pg.evaluate("document.querySelector('h1').textContent")
        ok(f"{page} {lang}: Startseite übersetzt",h1.lower() in t.lower().replace("\n"," "),t)
        ok(f"{page} {lang}: Vorname bleibt nach Sprachwechsel",(await pg.input_value("#w_name"))=="Ana")
        ok(f"{page} {lang}: html lang",(await pg.evaluate("document.documentElement.lang"))==lang)
        await pg.select_option("#simple-path","team");await pg.click("#startform2 button[type=submit]");await pg.wait_for_timeout(250)
        await pg.evaluate("location.hash='plan'");await pg.reload();await pg.wait_for_timeout(300)
        await pg.evaluate("document.querySelectorAll('details').forEach(d=>d.open=true)")
        r=await pg.inner_text("#commission-closure-results")
        ok(f"{page} {lang}: Abschlussrechner 120 € im Landesformat",money in r,r)
        await pg.reload();await pg.wait_for_timeout(250)
        ok(f"{page} {lang}: Sprache bleibt nach Neuladen",(await pg.evaluate("document.documentElement.lang"))==lang)
        ok(f"{page} {lang}: keine JS-Fehler",not err,err)
        await pg.close()
      # Hell/Dunkel
      pg=await b.new_page(locale="de-DE",color_scheme="light",viewport={"width":1440,"height":900})
      await pg.goto(B+page);await pg.evaluate("localStorage.clear()");await pg.reload();await pg.wait_for_timeout(200)
      ok(f"{page}: helles System → heller Modus",(await pg.evaluate("document.documentElement.dataset.theme"))=="light")
      ok(f"{page}: Einstellungsleiste sichtbar oben",await pg.locator(".setbar").first.is_visible() and (await pg.locator(".setbar").first.bounding_box())["y"]<250)
      await pg.click(".setbar [data-act=themeset][data-v=dark]");await pg.wait_for_timeout(150)
      ok(f"{page}: Umschalter → dunkel",(await pg.evaluate("document.documentElement.dataset.theme"))=="dark")
      await pg.reload();await pg.wait_for_timeout(200)
      ok(f"{page}: Wahl bleibt nach Neuladen",(await pg.evaluate("document.documentElement.dataset.theme"))=="dark")
      bg=await pg.evaluate("getComputedStyle(document.body).backgroundColor")
      ok(f"{page}: dunkler Hintergrund",bg.startswith("rgb(11, 26, 34"),bg)
      ok(f"{page}: Dunkel-Knopf markiert",await pg.locator(".setbar [data-v=dark].on").count()==1)
      await pg.click(".setbar [data-act=themeset][data-v=light]");await pg.wait_for_timeout(150)
      bg=await pg.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()")
      ok(f"{page}: heller Hintergrund",bg=="#f5f1e8",bg)
      await pg.close()
    pg=await b.new_page(locale="de-DE",viewport={"width":390,"height":800});await pg.goto(B+"test.html");await pg.evaluate("localStorage.clear()");await pg.reload();await pg.wait_for_timeout(200)
    await pg.fill("#w_name","Ana");await pg.select_option("#simple-path","team");await pg.click("#startform2 button[type=submit]");await pg.wait_for_timeout(250)
    ok("Handy: Einstellungsknopf in Kopfleiste sichtbar",await pg.locator("[data-act=setopen]").is_visible())
    await pg.click("[data-act=setopen]");await pg.wait_for_timeout(150)
    ok("Handy: Einstellungen öffnen sich",await pg.locator("#setpop .setbar").is_visible())
    await pg.click("#setpop [data-act=themeset][data-v=light]");await pg.wait_for_timeout(150)
    ok("Handy: Hell-Umschaltung wirkt",(await pg.evaluate("document.documentElement.dataset.theme"))=="light")
    await pg.select_option("#setpop select[data-act=langsel]","it");await pg.wait_for_timeout(900)
    ok("Handy: Sprachwechsel über Kopfleiste",(await pg.evaluate("document.documentElement.lang"))=="it")
    await pg.close()
    pg=await b.new_page(locale="en-US",color_scheme="light");await pg.goto(B+"index.html");await pg.wait_for_timeout(300)
    ok("Live: Sprachwahl vorhanden, folgt Gerätesprache",(await pg.evaluate("document.documentElement.lang"))=="en" and await pg.locator(".setbar select[data-act=langsel] option").count()==6)
    ok("Live: Hell/Dunkel vorhanden (System hell → hell)",await pg.locator(".setbar [data-act=themeset]").count()==2 and (await pg.evaluate("document.documentElement.dataset.theme"))=="light")
    await b.close()
  json.dump({"passed":sum(x["r"]=="PASS" for x in R),"failed":sum(x["r"]=="FAIL" for x in R),"results":R},open(OUT+"/sprachen-hell-dunkel.json","w"),ensure_ascii=False,indent=1)
  print("PASSED",sum(x["r"]=="PASS" for x in R),"FAILED",sum(x["r"]=="FAIL" for x in R))
asyncio.run(main())
