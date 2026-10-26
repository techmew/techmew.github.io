"""v0.10.1 local Chromium smoke: next-stage preview, 12 missions and reconnect timing."""
import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright

async def main():
    html=Path(__file__).with_name('index.html').read_text()
    html=html.replace("window.addEventListener('pagehide'", "window.__v101={get match(){return match},set stage(v){adventureStage=v},get stage(){return adventureStage},get cur(){return cur},doCom,finishCombat,stageMission,beginLiveBattle,receiveLiveTurn};window.addEventListener('pagehide'")
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
        page=await browser.new_page(viewport={'width':390,'height':844})
        errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
        await page.set_content(html,wait_until='domcontentloaded')
        result=await page.evaluate('''() => {
          const t=window.__v101;
          if(t.stageMission(9).target!==3||t.stageMission(12).kind!=='skillsUsed')return {error:'new missions'};
          t.stage=9;t.doCom();const m=t.match,defeated=m.b.name;
          m.hp[1]=0;m.hp[0]=m.max[0];t.finishCombat();
          const preview=document.getElementById('nextStagePreview').textContent;
          if(!preview.includes('STAGE 10')||!preview.includes('節目のボス')||!preview.includes('目標'))return {error:'preview',preview};
          t.doCom();const next=t.match.b.name;
          if(!preview.includes(next.replace(/ [0-9]{6}$/,''))||next===defeated||!document.getElementById('nextStagePreview').hidden)return {error:'next opponent mismatch',preview,next,defeated};
          const cr={seed:42,name:'Test',element:'音',type:'T',parts:{body:1,color:1},voice:{vol:40},stats:[50,50,50,50,50]};
          t.beginLiveBattle({creatures:[cr,{...cr,seed:43}],max:[180,180]});
          t.receiveLiveTurn({seq:3,atk:1,kind:'beam',duration:900,elapsed:430,resumed:true,actionStatus:['guard',null],dodgeCooldown:[1,0]});
          const live=t.match,elapsed=performance.now()-live.pop;
          return {stage:t.stage,defeated,next,elapsed,guardUsed:live.guardUsed,dodgeCooldown:live.dodgeCooldown,preview};
        }''')
        assert not result.get('error'),result
        assert result['stage']==10 and result['defeated']!=result['next'],result
        assert 410<=result['elapsed']<=600 and result['guardUsed'] and result['dodgeCooldown']==1,result
        assert not errors,errors
        print(json.dumps({'result':'PASS','newMissions':12,'nextStage':result['stage'],'newOpponent':True,'resumeElapsedMs':round(result['elapsed']),'errors':errors},ensure_ascii=False))
        await browser.close()

asyncio.run(main())
