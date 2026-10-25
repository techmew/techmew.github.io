"""v0.9.9 Chromium checks: timed strike, mission reward, dual-consent packet, online strike."""
import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright

async def main():
    html=Path(__file__).with_name('index.html').read_text()
    html=html.replace('const EVENT_MS=820;', 'const EVENT_MS=8000;')
    html=html.replace("window.addEventListener('pagehide'", "window.__v099={get match(){return match},get stage(){return adventureStage},set stage(v){adventureStage=v},doCom,strikePress,resolveCombatImpact,finishCombat,stageMission,missionCompleted,beginLiveBattle,receiveLiveTurn,receiveLiveAck,receiveLiveImpact,sendVoiceConsent,get cur(){return cur},set ws(v){ws=v},set side(v){side=v}};window.addEventListener('pagehide'")
    errors=[]
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
        page=await browser.new_page(viewport={'width':390,'height':844})
        page.on('pageerror',lambda e:errors.append(str(e)))
        await page.set_content(html,wait_until='domcontentloaded')
        result=await page.evaluate('''() => {
            const t=window.__v099;
            if(document.getElementById('shareVoice').checked||document.getElementById('receiveVoice').checked)return {error:'voice not opt-in'};
            if(t.stageMission(6).kind!=='strikes')return {error:'precision mission not rotated'};
            t.stage=6;t.doCom();const m=t.match;
            for(let i=0;i<2;i++){
                m.current={atk:0,kind:'rush',damage:24,selfDamage:0,recovery:0,hit:1,resolved:false};
                m.strikeUsed=false;m.strikeSuccess=false;m.pop=performance.now()-4000;
                t.strikePress();if(!m.strikeSuccess)return {error:'timed precision rejected'};
                m.pop=performance.now()-4800;t.resolveCombatImpact(performance.now());
                if(!m.current.strike||m.current.damage<=24)return {error:'strike damage not applied'};
            }
            if(m.strikes!==2||!t.missionCompleted(m))return {error:'strike mission failed'};
            m.hp=[m.max[0],0];t.finishCombat();
            const prize=document.getElementById('battlePrize').textContent;
            if(t.stage!==7||!prize.includes('MISSION CLEAR'))return {error:'campaign precision reward missing',prize};
            const packets=[];const sock={readyState:1,send:s=>packets.push(JSON.parse(s))};
            t.ws=sock;t.side=0;
            document.getElementById('shareVoice').checked=true;
            document.getElementById('receiveVoice').checked=true;
            t.sendVoiceConsent();
            if(packets[0]?.type!=='voice_consent'||!packets[0].send||!packets[0].receive)return {error:'dual-consent packet'};
            t.beginLiveBattle({creatures:[t.cur,{...t.cur,name:'ONLINE ENEMY'}],max:[190,190]});
            t.receiveLiveTurn({seq:0,atk:0,kind:'rush',duration:900,dodgeCooldown:[0,0]});
            const online=t.match;online.pop=performance.now()-400;
            t.strikePress();
            if(packets.at(-1)?.action!=='strike'||packets.at(-1)?.seq!==0)return {error:'online strike not sent'};
            t.receiveLiveAck({action:'strike',seq:0,valid:true});
            t.receiveLiveImpact({seq:0,atk:0,damage:31,hp:[190,159],charge:[30,18],strike:true});
            if(online.strikes!==1||!online.current.strike||online.hp[1]!==159)return {error:'online precision impact'};
            return {result:'PASS',stage:t.stage,precision:m.strikes,mission:prize.includes('MISSION CLEAR'),voiceConsent:packets[0],onlineStrike:packets.at(-1)};
        }''')
        assert result.get('result')=='PASS',result
        assert not errors,errors
        print(json.dumps({'browser':result,'errors':errors},ensure_ascii=False))
        await browser.close()

asyncio.run(main())
