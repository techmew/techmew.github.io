"""Local browser smoke test for authoritative live-client protocol (mock socket; not Cloudflare deployment)."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json

html=Path(__file__).with_name('index.html').read_text()
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
    page=browser.new_page(viewport={'width':390,'height':844})
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.evaluate("window.__store={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem(k){return window.__store[k]??null},setItem(k,v){window.__store[k]=String(v)},removeItem(k){delete window.__store[k]}}})")
    hook="window.__otodamaLiveTest={gen,beginLiveBattle,receiveLiveTurn,guardPress,receiveLiveAck,receiveLiveImpact,skillPress,endLiveBattle,closeBattle,get match(){return match},setWs(v){ws=v},get EVENT_MS(){return EVENT_MS}};"
    page.set_content(html.replace("window.addEventListener('pagehide'",hook+"window.addEventListener('pagehide'"),wait_until='load')
    result=page.evaluate('''() => {
      const sent=[];
      const T=window.__otodamaLiveTest;
      T.setWs({readyState:1,send:s=>sent.push(JSON.parse(s)),close:()=>{}});
      const {gen,beginLiveBattle,receiveLiveTurn,guardPress,receiveLiveAck,receiveLiveImpact,skillPress,endLiveBattle,closeBattle}=T;
      const a=gen(12345),b=gen(67890);
      beginLiveBattle({creatures:[a,b],max:[181,179]});
      const opened=document.getElementById('battleModal').classList.contains('open');
      receiveLiveTurn({type:'live_turn',seq:0,atk:1,kind:'rush',dodgeCooldown:[0,0]});
      T.match.pop=performance.now()-T.EVENT_MS*.32;
      guardPress();
      const sentGuard=sent.some(v=>v.action==='guard'&&v.seq===0);
      receiveLiveAck({type:'live_ack',action:'guard',seq:0,valid:true});
      receiveLiveImpact({type:'live_impact',seq:0,atk:1,kind:'rush',damage:2,parry:true,dodge:false,skill:false,hp:[179,179],charge:[42,30]});
      const hpUpdated=T.match.hp[0]===179&&T.match.charge===42&&T.match.current.resolved;
      receiveLiveTurn({type:'live_turn',seq:1,atk:0,kind:'combo',dodgeCooldown:[0,0]});
      skillPress();
      const noSkillAt42=sent.filter(v=>v.action==='skill').length===0;
      receiveLiveImpact({type:'live_impact',seq:1,atk:0,kind:'combo',damage:21,hp:[179,158],charge:[64,30],skill:false});
      skillPress();
      const sentSkill=sent.some(v=>v.action==='skill');
      receiveLiveAck({type:'live_ack',action:'skill',valid:true,charge:4});
      const armed=T.match.skillArmed&&T.match.charge===4;
      receiveLiveImpact({type:'live_impact',seq:1,atk:0,kind:'combo',damage:21,hp:[179,158],charge:[4,30],skill:false});
      endLiveBattle({type:'live_end',winner:0,hp:[179,0]});
      const done=T.match.done&&document.getElementById('rematchBtn').textContent.includes('次の対戦相手')&&!document.getElementById('rematchBtn').disabled;
      closeBattle();
      return {opened,sentGuard,hpUpdated,noSkillAt42,sentSkill,armed,done,closed:!document.getElementById('battleModal').classList.contains('open')};
    }''')
    browser.close()
    assert all(result.values()),result
    assert not errors,errors
    print(json.dumps({'result':'PASS','live_ui':result,'errors':errors},ensure_ascii=False))
