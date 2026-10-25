"""Local mocked-WebSocket reconnect smoke test; not an external Cloudflare test."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json
html=Path(__file__).with_name('index.html').read_text()
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':390,'height':844})
 errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.evaluate('''() => {
  window.__store={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem(k){return window.__store[k]??null},setItem(k,v){window.__store[k]=String(v)},removeItem(k){delete window.__store[k]}}});
  class MockSocket {
    static instances=[];static OPEN=1;
    constructor(url){this.url=url;this.readyState=0;this.sent=[];MockSocket.instances.push(this);setTimeout(()=>{this.readyState=1;this.onopen?.()},0)}
    send(s){this.sent.push(JSON.parse(s))}
    receive(obj){this.onmessage?.({data:JSON.stringify(obj)})}
    close(){this.readyState=3;this.onclose?.({code:1006})}
  }
  window.WebSocket=MockSocket;window.__sockets=MockSocket.instances;
 }''')
 page.set_content(html.replace("window.addEventListener('pagehide'","window.__otodamaReconnectTest={get match(){return match}};window.addEventListener('pagehide'"),wait_until='load')
 page.locator('#serverUrl').fill('https://example.workers.dev')
 page.locator('#applyServer').click()
 page.locator('#roomCode').fill('ABCDEF')
 page.locator('#joinRoom').click()
 page.wait_for_timeout(100)
 result=page.evaluate('''() => {
  const a=window.__sockets[0],token='0123456789abcdef0123456789abcdef';
  if(!a||!a.sent.some(m=>m.type==='join'))return {join:false};
  a.receive({type:'session',token,seat:0});
  a.receive({type:'state',me:0,youReady:false,players:[{name:'A',ready:true},{name:'B',ready:true}]});
  const cr={seed:42,name:'Test',element:'音',type:'T',parts:{body:1,color:1},voice:{vol:40},stats:[50,50,50,50,50]};
  a.receive({type:'live_start',creatures:[cr,{...cr,seed:43}],max:[180,180]});
  a.receive({type:'live_turn',seq:0,atk:1,kind:'rush',duration:900,dodgeCooldown:[0,0]});
  a.close();
  return {join:true,waiting:document.getElementById('roomLine').textContent.includes('再接続'),token};
 }''')
 assert result['join'] and result['waiting'],result
 page.wait_for_timeout(1100)
 result=page.evaluate('''() => {
  const sockets=window.__sockets,b=sockets.at(-1),token='0123456789abcdef0123456789abcdef';
  if(sockets.length!==2||!b.url.includes('resume='+token)||b.sent.length)return {created:false,sockets:sockets.length,url:b.url,sent:b.sent};
  b.receive({type:'session',token,seat:0});
  const cr={seed:42,name:'Test',element:'音',type:'T',parts:{body:1,color:1},voice:{vol:40},stats:[50,50,50,50,50]};
  b.receive({type:'live_resumed',creatures:[cr,{...cr,seed:43}],max:[180,180],hp:[145,120],charge:[52,40]});
  b.receive({type:'live_turn',seq:0,atk:1,kind:'beam',duration:900,dodgeCooldown:[0,0]});
  return {created:true,hp:window.__otodamaReconnectTest.match.hp[0],charge:window.__otodamaReconnectTest.match.charge,
    connected:document.getElementById('netLabel').textContent==='ONLINE ROOM',turn:window.__otodamaReconnectTest.match.current.seq};
 }''')
 assert result=={'created':True,'hp':145,'charge':52,'connected':True,'turn':0},result
 assert not errors,errors
 print(json.dumps({'result':'PASS','client_reconnect':result,'errors':errors},ensure_ascii=False))
 browser.close()
