"""v0.9.8: rival rewards, five mission rotation, BGM ducking, campaign continuity."""
import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright

async def main():
    html=Path(__file__).with_name('index.html').read_text()
    html=html.replace('const EVENT_MS=820;','const EVENT_MS=8000;')
    html=html.replace("window.addEventListener('pagehide'", "window.__v098={get match(){return match},get stage(){return adventureStage},set stage(v){adventureStage=v},get duck(){return bgmDuckUntil},get cur(){return cur},isRivalStage,stageTitle,stageEnemy,stageMission,missionProgress,missionCompleted,doCom,finishCombat,attackVoice};window.addEventListener('pagehide'")
    errors=[]
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
        page=await browser.new_page(viewport={'width':390,'height':844})
        page.on('pageerror',lambda e:errors.append(str(e)))
        await page.set_content(html,wait_until='domcontentloaded')
        result=await page.evaluate('''() => {
          const t=window.__v098;
          if(!t.isRivalStage(7)||t.isRivalStage(5)||t.isRivalStage(10)||t.stageTitle(7)!=='ライバル戦')return {error:'rival rotation'};
          if(t.stageMission(4).kind!=='guardBest'||t.stageMission(5).kind!=='damageDealt')return {error:'mission expansion'};
          const foe=t.stageEnemy(7,t.cur);if(!foe.name.startsWith('宿敵・'))return {error:'rival appearance'};
          t.stage=7;t.doCom();const m=t.match;
          if(!m.rival||m.boss||!document.getElementById('battleGuide').textContent.includes('宿敵戦'))return {error:'rival setup'};
          const old=performance.now();t.attackVoice(m.a,0);
          const duck=t.duck>old+350;
          m.hp=[m.max[0],0];m.parries=2;m.guardBest=2;m.damageDealt=140;m.damageTaken=5;m.skillsUsed=1;
          t.finishCombat();
          return {duck,stage:t.stage,rival:m.rival,grade:m.grade,prize:document.getElementById('battlePrize').textContent,next:document.getElementById('rematchBtn').textContent};
        }''')
        assert result.get('duck'),result
        assert result['stage']==8 and result['rival'],result
        assert 'RIVAL BONUS +2XP' in result['prize'] and '次のバトル' in result['next'],result
        assert not errors,errors
        print(json.dumps({'result':'PASS','rival':result,'errors':errors},ensure_ascii=False))
        await browser.close()

asyncio.run(main())
