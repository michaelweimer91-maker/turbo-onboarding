# Bedientest Abschlussrechner (Playwright). Voraussetzung: python3 -m http.server 8765 im Repo-Ordner.
import asyncio,sys
from playwright.async_api import async_playwright
R=[]
def ok(n,c,d=""): R.append(c); print(("PASS " if c else "FAIL ")+n+" | "+str(d))
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path="/opt/pw-browsers/chromium",args=["--no-sandbox"])
    for page,w in [("test.html",390),("onboarding-preview.html",1440)]:
      err=[]; pg=await b.new_page(locale="de-DE",viewport={"width":w,"height":900}); pg.on("pageerror",lambda e: err.append(str(e)))
      await pg.goto("http://localhost:8765/"+page); await pg.evaluate("localStorage.clear()"); await pg.reload()
      await pg.fill("#w_name","Anna"); await pg.select_option("#simple-path","team"); await pg.click("#startform2 button[type=submit]"); await pg.wait_for_timeout(200)
      await pg.evaluate("location.hash='plan'"); await pg.reload(); await pg.wait_for_timeout(200)
      body=await pg.inner_text("body")
      ok(page+" Beispiel 120 € auf Plan sichtbar","3 CP × 40 € = 120 €" in body)
      await pg.get_by_text("Abschlussprovision berechnen",exact=True).click(); await pg.wait_for_timeout(150)
      r=lambda: pg.inner_text("#commission-closure-results")
      ok(page+" Standard TB selbst = 120 €","120,00 €" in await r(), await r())
      await pg.select_option("[data-cl=me]","AM"); await pg.select_option("[data-cl=who]","g1"); await pg.wait_for_timeout(150)
      await pg.select_option("[data-cl=partner]","TB"); await pg.wait_for_timeout(150)
      ok(page+" AM über TB = 6 € Differenz","6,00 €" in await r() and "Differenz" in await r(), await r())
      await pg.select_option("[data-cl=partner]","AM"); await pg.wait_for_timeout(150)
      ok(page+" AM über AM = 60 € Team-Abschluss","60,00 €" in await r(), await r())
      await pg.select_option("[data-cl=pkg]","voucher"); await pg.wait_for_timeout(150)
      await pg.fill("[data-cl=n]","10"); await pg.wait_for_timeout(200)
      ok(page+" 10 Voucher AM über AM = 200 €","200,00 €" in await r(), await r())
      ok(page+" Tiefen-Tabelle aktualisiert","Gutschein" in await pg.inner_text("#commission-closure-depth"))
      sw=await pg.evaluate("document.documentElement.scrollWidth-document.documentElement.clientWidth"); ok(page+" kein Überlauf",sw<=0,sw)
      await pg.locator("#commission-closure-box").screenshot(path=(sys.argv[1] if len(sys.argv)>1 else "/tmp")+f"/cl_{w}.png")
      await pg.wait_for_timeout(300); await pg.reload(); await pg.wait_for_timeout(250)
      await pg.get_by_text("Abschlussprovision berechnen",exact=True).click(); await pg.wait_for_timeout(150)
      ok(page+" nach Reload gespeichert","200,00 €" in await r(), await r())
      ok(page+" keine JS-Fehler",not err,err[:2])
      await pg.close()
    await b.close()
  print("PASSED",sum(R),"FAILED",len(R)-sum(R))
asyncio.run(main())
