# Prüft die Live-App (index.html) nach der Umstellung 13.10.2026. Controlling-Aufrufe werden abgefangen (nichts geht an die echte Tabelle).
# Voraussetzung: python3 -m http.server 8765 im Repo-Ordner. Aufruf: python3 tests/live-umstellung.py <ausgabeordner>
import asyncio,sys,json
from playwright.async_api import async_playwright
OUT=sys.argv[1] if len(sys.argv)>1 else "."
B="http://localhost:8765/index.html"; R=[]
def ok(n,c,d=""): R.append({"r":"PASS" if c else "FAIL","case":n,"detail":str(d)[:200]}); print(("PASS " if c else "FAIL ")+n+" | "+str(d)[:200])
OLD={"v":1,"lang":"de","pid":"altpartner01","consent":True,"updatedAt":1760000000000,"name":"Bestand Bernd","leader":"Lena","startedAt":1759900000000,"view":"top","done":{"start":True,"system":True},
 "diag":{"q0":"mehr Freiheit"},"pitch":{"reps":3,"best":52,"leaderOk":True},"quiz":{"0":0,"1":0,"2":0},"list":[{"id":"c1","name":"Kontakt Eins","status":"NEU","top":True,"first5":True},{"id":"c2","name":"Kontakt Zwei"}],
 "sent":{"a1":2},"talks":[],"dup":{},"fin":{},"plan":{"ok":True},"stuck":{},"pace":"turbo","multi":{"size":100,"rate":10,"levels":6}}
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path="/opt/pw-browsers/chromium",args=["--no-sandbox"])
    posts=[]
    async def ctxpage(w=390):
      ctx=await b.new_context(locale="de-DE",viewport={"width":w,"height":900},service_workers="block")
      async def h(route):
        posts.append(route.request.post_data or ""); await route.fulfill(status=200,body="ok")
      await ctx.route("https://script.google.com/**",h)
      await ctx.route("https://fonts.googleapis.com/**",lambda r: r.abort()); await ctx.route("https://player.vimeo.com/**",lambda r: r.abort())
      pg=await ctx.new_page(); err=[]; pg.on("pageerror",lambda e: err.append(str(e))); return ctx,pg,err
    # 1) Neuer Partner
    ctx,pg,err=await ctxpage()
    await pg.goto(B); await pg.wait_for_timeout(400)
    body=await pg.inner_text("body")
    ok("Neu: kein Testbanner","TESTVERSION" not in body)
    ok("Neu: Einstellungsleiste (Sprache + Hell/Dunkel)",await pg.locator(".setbar select[data-act=langsel] option").count()==6 and await pg.locator(".setbar [data-act=themeset]").count()==2)
    opts=await pg.eval_on_selector_all("#simple-path option","els=>els.map(e=>e.value)")
    ok("Neu: Ziele ohne Händlerweg",("merch" not in opts) and len(opts)==6,opts)
    ok("Neu: Einwilligung zum Controlling sichtbar",await pg.locator("#w_consent").count()==1)
    await pg.fill("#w_name","Neu Nina"); await pg.select_option("#simple-path","team"); await pg.click("#startform2 button[type=submit]"); await pg.wait_for_timeout(300)
    ok("Neu: ohne Einwilligung kein Start",not await pg.evaluate("JSON.parse(localStorage.getItem('bp_turbo_v1')||'{}').startedAt"))
    await pg.check("#w_consent"); await pg.click("#startform2 button[type=submit]"); await pg.wait_for_timeout(800)
    st=await pg.evaluate("JSON.parse(localStorage.getItem('bp_turbo_v1')||'{}')")
    ok("Neu: Speicher bp_turbo_v1 mit Weg/Einwilligung",st.get("path")=="team" and st.get("consent") is True,{k:st.get(k) for k in ("path","pace","consent")})
    ok("Neu: Controlling-Meldung gesendet",len(posts)>=1,len(posts))
    if posts:
      d=json.loads(posts[-1]); ok("Neu: Meldung app=turbo, Schema 2, ohne Kontaktnamen",d.get("app")=="turbo" and d.get("schemaVersion")==2 and "Kontakt" not in posts[-1],{k:d.get(k) for k in ("app","schemaVersion","path","name")})
    for v in ["start","system","plan","list","top","talkto","pipe","talk","dup","finish"]:
      await pg.evaluate(f"location.hash='{v}'"); await pg.reload(); await pg.wait_for_timeout(250)
    ok("Neu: alle 10 Schritte ohne JS-Fehler",not err,err[:2])
    await pg.evaluate("location.hash='talkto'"); await pg.reload(); await pg.wait_for_timeout(300)
    await pg.evaluate("document.querySelectorAll('details').forEach(d=>d.open=true)")
    t=await pg.inner_text("body")
    ok("Neu: keine Händler-Vorlage/-Filter","Händler" not in t, [l for l in t.split("\n") if "Händler" in l][:3])
    await pg.evaluate("location.hash='plan'"); await pg.reload(); await pg.wait_for_timeout(300)
    await pg.evaluate("document.querySelectorAll('details').forEach(d=>d.open=true)")
    t=await pg.inner_text("body")
    ok("Neu: Vergütung ohne Händler-Hinweise","Händler" not in t,[l for l in t.split("\n") if "Händler" in l][:3])
    # Aufgeklappte Bereiche bleiben beim Ausfüllen offen (Meldung Michael 13.10.2026)
    await pg.evaluate("location.hash='system'"); await pg.reload(); await pg.wait_for_timeout(300)
    sm=pg.locator("details.more > summary", has_text="Meine Rolle, Selbstcheck")
    await sm.click(); await pg.wait_for_timeout(150)
    y0=await pg.evaluate("scrollY")
    for q,a in [(0,1),(0,0),(1,1),(2,2),(3,1)]:
      bt=pg.locator(f"[data-act=tQuiz][data-q='{q}'][data-a='{a}']")
      if await bt.count(): await bt.first.click(); await pg.wait_for_timeout(150)
    ok("Offen bleibt: Selbstcheck-Bereich nach Antworten",await pg.evaluate("[...document.querySelectorAll('details.more')].some(d=>d.open && d.textContent.includes('Selbstcheck'))"))
    await pg.evaluate("location.hash='plan'"); await pg.reload(); await pg.wait_for_timeout(300)
    await pg.locator("details.more > summary", has_text="Abschlussprovision berechnen").click(); await pg.wait_for_timeout(150)
    await pg.select_option("[data-cl=who]","g1"); await pg.wait_for_timeout(150)
    await pg.locator("details.more > summary", has_text="Mehr erfahren").click(); await pg.wait_for_timeout(150)
    await pg.locator("[data-act=cQuiz][data-advanced='0']").first.click(); await pg.wait_for_timeout(200)
    ok("Offen bleibt: Rechner + Vertiefung nach Quiz-Klick",await pg.evaluate("[...document.querySelectorAll('details.more')].filter(d=>d.open).length")>=2)
    await pg.evaluate("location.hash='talkto'"); await pg.reload(); await pg.wait_for_timeout(300)
    await pg.locator("details.more > summary", has_text="Weitere Nachrichtenvorlagen").click(); await pg.wait_for_timeout(150)
    await pg.locator("[data-act=tSie][data-v='1']").first.click(); await pg.wait_for_timeout(200)
    ok("Offen bleibt: weitere Vorlagen nach Wechsel du→Sie",await pg.evaluate("[...document.querySelectorAll('details.more')].some(d=>d.open && d.textContent.includes('Weitere Nachrichtenvorlagen'))"))
    ok("Offen bleibt: keine JS-Fehler",not err,err[:2])
    await ctx.close()
    # 2) Bestandspartner aus alter Live-Version
    posts.clear()
    ctx,pg,err=await ctxpage(1440)
    await pg.goto(B.replace("index.html","config.js")); await pg.evaluate("s=>localStorage.setItem('bp_turbo_v1',JSON.stringify(s))",OLD)
    await pg.goto(B); await pg.wait_for_timeout(800)
    st=await pg.evaluate("JSON.parse(localStorage.getItem('bp_turbo_v1')||'{}')")
    ok("Bestand: Identität und Kontakte erhalten",st.get("pid")=="altpartner01" and len(st.get("list",[]))==2 and st.get("name")=="Bestand Bernd")
    ok("Bestand: Einwilligung bleibt",st.get("consent") is True)
    body=await pg.inner_text("body")
    ok("Bestand: landet in der App (nicht auf Startseite)",await pg.locator(".simple-nav").count()==1)
    await pg.evaluate("location.hash='start'"); await pg.reload(); await pg.wait_for_timeout(300)
    await pg.evaluate("document.querySelectorAll('details').forEach(d=>d.open=true)")
    ok("Bestand: kann Weg wählen",await pg.locator("[data-act=tPath]").count()>=5,await pg.locator("[data-act=tPath]").count())
    for v in ["start","system","plan","list","top","talkto","pipe","talk","dup","finish"]:
      await pg.evaluate(f"location.hash='{v}'"); await pg.reload(); await pg.wait_for_timeout(250)
    ok("Bestand: alle 10 Schritte ohne JS-Fehler",not err,err[:2])
    await pg.screenshot(path=OUT+"/live_bestand.png")
    await ctx.close(); await b.close()
  json.dump({"passed":sum(x["r"]=="PASS" for x in R),"failed":sum(x["r"]=="FAIL" for x in R),"results":R},open(OUT+"/qa-live-umstellung-results.json","w"),ensure_ascii=False,indent=1)
  print("PASSED",sum(x["r"]=="PASS" for x in R),"FAILED",sum(x["r"]=="FAIL" for x in R))
asyncio.run(main())
