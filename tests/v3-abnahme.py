# V3-Abnahme (Playwright/Python). Voraussetzung: python3 -m http.server 8765 im Repo-Ordner. Aufruf: python3 tests/v3-abnahme.py <ausgabeordner>
import asyncio, json, sys
from playwright.async_api import async_playwright
BASE="http://localhost:8765/"
SP=sys.argv[1] if len(sys.argv)>1 else "."
RES=[]; ERR=[]
def ok(case,cond,detail=""): RES.append({"r":"PASS" if cond else "FAIL","case":case,"detail":detail}); print(("PASS " if cond else "FAIL ")+case+" | "+str(detail))
async def st(pg,key): return await pg.evaluate("JSON.parse(localStorage.getItem('%s')||'{}')"%key)
async def goto(pg,step): await pg.evaluate("location.hash='%s'"%step); await pg.reload(); await pg.wait_for_timeout(150)
async def fresh(b,page,w):
    pg=await b.new_page(viewport={"width":w,"height":900}); pg.on("pageerror",lambda e: ERR.append(page+": "+str(e)))
    await pg.goto(BASE+page); await pg.evaluate("localStorage.clear()"); await pg.reload(); await pg.wait_for_timeout(150); return pg
async def overflow(pg): return await pg.evaluate("document.documentElement.scrollWidth-document.documentElement.clientWidth")

async def run(b,page,key,w):
    tag=f"{page}@{w}"
    pg=await fresh(b,page,w)
    # Einstieg
    ok(tag+" Einstieg: Vorname + Ziel-Auswahl", await pg.locator("#w_name").count()==1 and await pg.locator("#simple-path option").count()>=7)
    ok(tag+" Einstieg: keine Tempo-/Wege-Kacheln", await pg.locator("[data-act=tPace],[data-act=tPath]").count()==0)
    await pg.fill("#w_name","Anna"); await pg.select_option("#simple-path","merch")
    await pg.click("#startform2 button[type=submit]"); await pg.wait_for_timeout(200)
    s=await st(pg,key)
    ok(tag+" Start gespeichert (Name/Weg/7 Tage)", s.get("name")=="Anna" and s.get("path")=="merch" and s.get("pace")=="easy", f"{s.get('name')}/{s.get('path')}/{s.get('pace')}")
    nav=pg.locator(".simple-nav > button.nav")
    ok(tag+" 4 Hauptbereiche", await nav.count()==4, await nav.all_inner_texts())
    ok(tag+" keine mobile Bottom-Nav", await pg.locator(".mobnav").count()==0)
    ok(tag+" kein horizontaler Überlauf (Start)", await overflow(pg)<=0, await overflow(pg))
    # Arbeitsplan bestätigen (liegt in Start)
    await goto(pg,"start")
    await pg.click("[data-act=tTime][data-v='30']"); await pg.click("[data-act=tSkill][data-v=write]")
    await pg.fill("#p_block","2026-10-14T19:00"); await pg.wait_for_timeout(200)
    await pg.click("[data-act=tPlan]"); await pg.wait_for_timeout(200)
    txt=await pg.inner_text("#main") if await pg.locator("#main").count() else await pg.inner_text("body")
    ok(tag+" Start zeigt 'Dein nächster Schritt'", "nächster Schritt" in txt.lower() or "NÄCHSTER SCHRITT" in txt, "")
    # Bereiche durchklicken
    for i,area in enumerate(["System verstehen","Geld verdienen","Aktiv werden","Start"]):
        if w<900: await pg.click("[data-act=openside]"); await pg.wait_for_timeout(250)
        await pg.locator(".simple-nav > button.nav", has_text=area).first.click(); await pg.wait_for_timeout(250)
        ok(tag+f" Menü schließt nach '{area}'", w>=900 or not await pg.evaluate("document.getElementById('side').classList.contains('open')"))
        h=await pg.locator("h1").first.inner_text()
        ok(tag+f" Bereich '{area}' öffnet", bool(h.strip()), h)
    # Vergütung
    await goto(pg,"plan")
    body=await pg.inner_text("body")
    ok(tag+" Plan: drei Verdienstwege + Beispiel 200 €", "100 aktive Kunden" in body and "200 €" in body)
    ok(tag+" Plan: Hinweis keine Einkommensgarantie", "keine einkommensgarantie" in body.lower())
    ok(tag+" Plan: Händlerweg-Hinweis", "Händlerprozess" in body)
    ok(tag+" Quiz: nur eine Frage sichtbar", await pg.locator("[data-act=cQuiz][data-advanced='0']").count()<=4 and "frage 1 von 3" in body.lower() and "frage 2 von 3" not in body.lower())
    await pg.click("[data-act=cQuiz][data-q='0'][data-a='0'][data-advanced='0']"); await pg.wait_for_timeout(120)
    b2=await pg.inner_text("body")
    ok(tag+" Quiz: falsche Antwort bleibt bei Frage 1 mit Erklärung", "frage 1 von 3" in b2.lower())
    for q,a in [(0,1),(1,0),(2,1)]:
        await pg.click(f"[data-act=cQuiz][data-q='{q}'][data-a='{a}'][data-advanced='0']"); await pg.wait_for_timeout(120)
    ok(tag+" Quiz: 3 von 3", "3 von 3" in await pg.inner_text("body"))
    await pg.click("input[data-bind='plan.ok']"); await pg.wait_for_timeout(250)
    done="Grundlagen erledigt" in await pg.inner_text("#commission-check") and "Erledigt" in await pg.inner_text(".modfoot .badge")
    ok(tag+" Vergütung erledigt ohne Pflicht-Freitext", bool(done))
    # Rechner
    await pg.get_by_text("Mit eigenen Zahlen rechnen",exact=True).click()
    await pg.select_option("[data-calc=rank]","TB")
    await pg.get_by_text("Annahmen und Wunschziel ändern",exact=True).click()
    await pg.fill("[data-calc=customers]","100"); await pg.fill("[data-calc=cp]","0.10"); await pg.wait_for_timeout(300)
    r=await pg.inner_text("#commission-results")
    ok(tag+" Rechner TB 100×0,10 = 200,00 €", "200,00" in r, r[:80].replace("\n"," "))
    await pg.fill("[data-calc=customers]","-5"); await pg.wait_for_timeout(300)
    r=await pg.inner_text("#commission-results")
    ok(tag+" Rechner: negative Eingabe ergibt kein negatives Ergebnis", "-" not in r.replace("–","").split("€")[0], r[:60].replace("\n"," "))
    ok(tag+" kein Überlauf (Plan)", await overflow(pg)<=0, await overflow(pg))
    # Nachrichten
    await goto(pg,"list")
    await pg.click("details.more summary:has-text('Viele Namen')")
    await pg.fill("#bulk","Kontakt 1\nKontakt 2\nKontakt 3"); await pg.click("[data-act=bulkAdd]"); await pg.wait_for_timeout(250)
    await goto(pg,"top")
    bs=await pg.query_selector_all("[data-act=tChoose]:not(.gold)")
    if bs: await bs[0].click(); await pg.wait_for_timeout(150)
    await goto(pg,"talkto")
    vis=await pg.locator(".script:visible").count()
    ok(tag+" Nachrichten: genau eine Vorlage sichtbar", vis==1, vis)
    ok(tag+" Händlerweg: Vorlagenfilter auf eine passende Vorlage", await pg.locator(".script").count()==1, await pg.locator(".script").count())
    await pg.locator(".script:visible [data-act=tCopy]").first.click(); await pg.wait_for_timeout(200)
    sent=pg.locator("[data-act=tSend]:visible").first
    ok(tag+" Bestätigen-Knopf nach Kopieren sichtbar", await sent.count()==1)
    if await sent.count():
        await sent.click(); await pg.wait_for_timeout(300)
    s=await st(pg,key)
    ok(tag+" Versand per Bestätigung gezählt (S.ev)", len(s.get("ev",[]))>=1, len(s.get("ev",[])))
    # Fortschritt nach Reload
    await pg.wait_for_timeout(300); await pg.reload(); await pg.wait_for_timeout(250)
    s2=await st(pg,key)
    ok(tag+" Fortschritt nach Reload erhalten", s2.get("name")=="Anna" and len(s2.get("list",[]))>=3 and len(s2.get("ev",[]))>=1 and bool((s2.get("plan") or {}).get("ok")))
    ok(tag+" Fortschrittsanzeige > 0 %", (await pg.locator(".topbar .tab").first.inner_text()).strip()[:1]!="0" if await pg.locator(".topbar .tab").count() else True)
    if w==390: await pg.screenshot(path=f"{SP}/v3_{page.split('.')[0]}_{w}.png",full_page=False)
    # kein Sync
    await pg.close()
    pg=await fresh(b,page,w)
    await pg.fill("#w_name","Ben"); await pg.select_option("#simple-path","cust"); await pg.click("#startform2 button[type=submit]"); await pg.wait_for_timeout(200)
    await goto(pg,"talkto")
    ok(tag+" Kundenweg: 1 Vorlage sichtbar, weitere eingeklappt", await pg.locator(".script:visible").count()==1 and await pg.locator("summary:has-text('Weitere Nachrichtenvorlagen')").count()==1, await pg.locator(".script").count())
    await pg.close()

async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/opt/pw-browsers/chromium",args=["--no-sandbox"])
        reqs=[]
        for page,key in [("test.html","bp_turbo_test_v1"),("onboarding-preview.html","bp_turbo_preview_v2")]:
            for w in (390,1440): await run(b,page,key,w)
        # Live unverändert
        pg=await b.new_page(); pg.on("pageerror",lambda e: ERR.append("index: "+str(e)))
        await pg.goto(BASE+"index.html"); await pg.wait_for_timeout(200)
        ok("Live: kein V3-Einstieg (#simple-path fehlt)", await pg.locator("#simple-path").count()==0)
        ok("Live: kein Testbanner", "TESTVERSION" not in await pg.inner_text("body"))
        await b.close()
    ok("Keine JS-Fehler", not ERR, ERR[:3])
    json.dump({"date":"2026-10-12","results":RES,"passed":sum(r["r"]=="PASS" for r in RES),"failed":sum(r["r"]=="FAIL" for r in RES)},open(f"{SP}/acc_v3.json","w"),ensure_ascii=False,indent=1)
    print("PASSED",sum(r["r"]=="PASS" for r in RES),"FAILED",sum(r["r"]=="FAIL" for r in RES))
asyncio.run(main())
