"""v0.9.7: adaptive COM tactics, missions, dodge counter, feint, grades, damage."""
import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright

async def main():
 errors=[]
 html=Path(__file__).with_name('index.html').read_text()
 html=html.replace('const EVENT_MS=820;','const EVENT_MS=8000;').replace("window.addEventListener('pagehide'","window.__otodamaTest={get match(){return match},enemyTactic,stageMission,missionCompleted,dodgePress,guardPress,resolveCombatImpact,finishCombat,attackVoice};window.addEventListener('pagehide'")
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
  page=await browser.new_page(viewport={'width':390,'height':844})
  page.on('pageerror',lambda e:errors.append(str(e)))
  await page.set_content(html,wait_until='domcontentloaded')
  await page.locator('#fightBtn').click()
  result=await page.evaluate('''() => {
   const t=window.__otodamaTest,m=t.match;
   if(t.enemyTactic(2,1)!==null||t.enemyTactic(3,1)!=='drain'||t.enemyTactic(6,1)!=='feint'||t.enemyTactic(9,1)!=='heavy')return {error:'tactic mapping'};
   if(t.enemyTactic(5,1,{parries:3,dodges:0})!=='feint'||t.enemyTactic(5,1,{parries:0,dodges:3})!=='drain')return {error:'adaptive tactic'};
   if(t.stageMission(1).kind!=='parries'||t.stageMission(2).kind!=='dodges'||t.stageMission(3).kind!=='skillsUsed')return {error:'mission rotation'};
   m.current={atk:1,kind:'rush',damage:20,selfDamage:0,recovery:0,tactic:'feint',resolved:false};
   m.pop=performance.now()-8000*.26;t.guardPress();const tooEarly=!m.parried;
   m.guardUsed=false;m.current.resolved=false;m.pop=performance.now()-8000*.49;t.guardPress();const feintSuccess=m.parried;
   m.parried=false;m.guardUsed=false;m.current={atk:1,kind:'rush',damage:20,selfDamage:0,recovery:0,tactic:'drain',resolved:false};
   m.charge=50;m.pop=performance.now()-8000*.7;t.resolveCombatImpact(performance.now());const drain=m.charge;
   m.current={atk:1,kind:'rush',damage:20,selfDamage:0,recovery:0,tactic:'heavy',resolved:false};m.pop=performance.now()-8000*.7;t.resolveCombatImpact(performance.now());const heavy=m.current.damage;
   m.evadeCounterReady=true;m.current={atk:0,kind:'rush',damage:20,selfDamage:0,recovery:0,resolved:false};m.pop=performance.now()-8000*.7;t.resolveCombatImpact(performance.now());const dodgeCounter=m.current.evadeCounter===true&&!m.evadeCounterReady;
   m.parries=3;m.dodges=2;m.skillsUsed=1;m.damageDealt=140;m.damageTaken=10;m.hp=[m.max[0],0];t.finishCombat();
   return {tooEarly,feintSuccess,drain,heavy,dodgeCounter,missionAwarded:m.missionAwarded,grade:m.grade,report:document.getElementById('battleReport').innerText,prize:document.getElementById('battlePrize').innerText};
  }''')
  assert result['tooEarly'] and result['feintSuccess'],result
  assert result['drain']==44,result
  assert result['dodgeCounter'] and result['missionAwarded'],result
  assert result['heavy']==24,result
  assert result['grade']=='S' and 'RANK S' in result['report'],result
  assert '勝利' in result['prize'] and '+5XP' in result['prize'],result
  assert not errors,errors
  print(json.dumps({'result':'PASS','tactics':'heavy/drain/feint','feint':'timing enforced','drain':result['drain'],'heavy':result['heavy'],'grade':result['grade'],'xp':'S-rank and stage mission bonuses','errors':errors},ensure_ascii=False))
  await browser.close()

asyncio.run(main())
