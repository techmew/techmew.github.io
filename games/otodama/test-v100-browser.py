"""v0.10.0 browser regression: early attack, archetypes, missions, background freeze."""
import asyncio, json
from pathlib import Path
from playwright.async_api import async_playwright

async def main():
    html=Path(__file__).with_name('index.html').read_text()
    html=html.replace('const EVENT_MS=820;', 'const EVENT_MS=8000;')
    html=html.replace("window.addEventListener('pagehide'", "window.__v100={get match(){return match},set stage(v){adventureStage=v},doCom,stageEnemy,get cur(){return cur},enemyTactic,stageMission,missionCompleted,guardPress,dodgePress,resolveCombatImpact};window.addEventListener('pagehide'")
    errors=[]
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
        page=await browser.new_page(viewport={'width':390,'height':844})
        page.on('pageerror',lambda e:errors.append(str(e)))
        await page.set_content(html,wait_until='domcontentloaded')
        first=await page.evaluate("""() => {
          const t=window.__v100;
          if(t.enemyTactic(12,5)!=='flash'||t.enemyTactic(11,5)==='flash')return {error:'flash tactic'};
          if(t.stageMission(7).kind!=='counterHits'||t.stageMission(8).kind!=='strikeBest')return {error:'mission rotation'};
          const roles=[2,3,4].map(n=>t.stageEnemy(n,t.cur).archetype);
          if(new Set(roles).size!==3)return {error:'archetype rotation',roles};
          t.stage=12;t.doCom();const m=t.match;
          m.current={atk:1,kind:'rush',damage:24,selfDamage:0,recovery:0,tactic:'flash',resolved:false};
          m.pop=performance.now()-8000*.25;t.guardPress();
          if(!m.parried)return {error:'early guard'};
          m.guardUsed=false;m.parried=false;m.pop=performance.now()-8000*.55;t.guardPress();
          if(m.parried)return {error:'late flash guard accepted'};
          m.guardUsed=false;m.dodgeUsed=false;m.dodgeCooldown=0;m.current.resolved=false;
          m.pop=performance.now()-8000*.15;t.dodgePress();
          if(!m.dodgeSuccess)return {error:'early dodge'};
          m.current={atk:0,kind:'rush',damage:20,selfDamage:0,recovery:0,resolved:false};
          m.pop=performance.now()-8000*.7;m.evadeCounterReady=true;t.resolveCombatImpact(performance.now());
          if(m.counterHits!==1)return {error:'counter scoring'};
          m.stageNo=7;if(!t.missionCompleted(m))return {error:'counter mission'};
          m.stageNo=8;m.strikeBest=2;if(!t.missionCompleted(m))return {error:'precision chain mission'};
          m.current={atk:1,kind:'rush',damage:24,selfDamage:0,recovery:0,resolved:false};
          m.pop=performance.now()-8000*.30;
          window.__hidden=true;Object.defineProperty(document,'hidden',{configurable:true,get:()=>!!window.__hidden});
          document.dispatchEvent(new Event('visibilitychange'));
          return {pausedAt:m.pausedAt,pop:m.pop,valid:!!m.pausedAt};
        }""")
        assert first.get('valid'),first
        await page.wait_for_timeout(200)
        resumed=await page.evaluate("""oldPop => {
          const m=window.__v100.match;window.__hidden=false;
          document.dispatchEvent(new Event('visibilitychange'));
          return {pausedAt:m.pausedAt,shift:m.pop-oldPop,message:document.getElementById('battleMsg').textContent};
        }""",first['pop'])
        assert resumed['pausedAt']==0 and resumed['shift']>=150 and '再開' in resumed['message'],resumed
        assert not errors,errors
        print(json.dumps({'result':'PASS','flash':'guard/dodge','archetypes':3,'missions':2,'pauseShiftMs':round(resumed['shift']),'errors':errors},ensure_ascii=False))
        await browser.close()

asyncio.run(main())
