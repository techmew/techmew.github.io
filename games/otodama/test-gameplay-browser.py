"""Optional browser smoke test. Requires: pip install playwright; Chromium installed."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

HTML = Path(__file__).with_name("index.html").read_text(encoding="utf-8")
STORE = """window.__otodamaStore={};
Object.defineProperty(window,'localStorage',{configurable:true,value:{
 getItem(k){return window.__otodamaStore[k]??null},
 setItem(k,v){window.__otodamaStore[k]=String(v)},
 removeItem(k){delete window.__otodamaStore[k]}
}});"""

def main():
    errors = []
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True, executable_path="/usr/bin/chromium",
                                     args=["--no-sandbox", "--disable-dev-shm-usage"])
        page = browser.new_page(viewport={"width":390,"height":844})
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.evaluate(STORE)
        # Fast-forward battle progression by shortening only the test copy of the game.
        page.set_content(HTML.replace("const EVENT_MS=820;", "const EVENT_MS=45;").replace("window.addEventListener('pagehide'", "window.__otodamaTest={get match(){return match},finishCombat,addBreak,resolveCombatImpact};window.addEventListener('pagehide'"))
        assert page.locator("#adventureStage").inner_text() == "STAGE 01"
        assert "空の広場" in page.locator("#stageHint").inner_text()
        page.locator("#fightBtn").click()
        page.evaluate("window.__otodamaTest.match.hp=[window.__otodamaTest.match.max[0],0];window.__otodamaTest.finishCombat()")
        page.locator("#lowFx").check()
        page.locator("#musicVolume").fill("11")
        assert page.evaluate("localStorage.getItem('otodama.music.volume')")=="11"
        assert page.evaluate("localStorage.getItem('otodama.lowfx')") == "1"
        page.wait_for_timeout(100)
        assert page.locator("#rematchBtn").is_enabled()
        assert "STAGE 2" in page.locator("#battlePrize").inner_text()
        page.locator('[data-buff="power"]').click()
        page.locator("#rematchBtn").click()
        assert "攻撃アップ" in page.locator("#battleGuide").inner_text()
        assert "STAGE 02" in page.locator("#battleTitle").inner_text()
        previous=page.evaluate("window.__otodamaTest.match.b.seed")
        page.evaluate("window.__otodamaTest.match.hp=[0,window.__otodamaTest.match.max[1]];window.__otodamaTest.finishCombat()")
        assert "STAGE 2" in page.locator("#battlePrize").inner_text()
        page.locator("#rematchBtn").click()
        assert page.evaluate("window.__otodamaTest.match.b.seed")!=previous
        assert "STAGE 02" in page.locator("#battleTitle").inner_text()
        page.evaluate("document.getElementById(\'closeBattle\').click()")
        assert page.locator("#adventureStage").inner_text() == "STAGE 02"
        page.evaluate("""localStorage.setItem('otodama.progress',
          JSON.stringify({stage:5,stageWins:3,wins:3,streak:2,best:2}))""")
        # Test-only hook. Production HTML remains unchanged.
        hook = "window.__otodamaTest={get match(){return match},finishCombat,addBreak,resolveCombatImpact};"
        page.set_content(HTML.replace("window.addEventListener('pagehide'", hook+"window.addEventListener('pagehide'"))
        assert "夜の公園" in page.locator("#stageHint").inner_text()
        page.locator("#fightBtn").click()
        assert page.locator("#bossPanel").is_visible()
        assert page.locator("#musicVolume").input_value()=="11"
        result = page.evaluate("""() => {
          const api=window.__otodamaTest,m=api.match;
          m.current={atk:1,kind:'meteor',damage:45,selfDamage:0,recovery:0,resolved:false};
          m.pop=performance.now()-600;m.breakMeter=80;m.bossStunned=false;
          const before=m.hp[0];api.addBreak(m,25);api.resolveCombatImpact(performance.now());
          return {before,after:m.hp[0],broken:m.current.bossBreak,reset:m.breakMeter===0};
        }""")
        assert result["before"] == result["after"] and result["broken"] and result["reset"], result
        page.set_viewport_size({"width":915,"height":430})
        assert page.locator("#battleModal").is_visible()
        page.locator("#closeBattle").click()
        page.set_viewport_size({"width":320,"height":700})
        assert page.evaluate("document.documentElement.scrollWidth<=window.innerWidth+1")
        assert not errors, errors
        browser.close()
    print("BROWSER SMOKE PASS | next stage, buff, boss BREAK, audio UI, landscape, 320px")

if __name__ == "__main__":
    main()
