/** OTODAMA ∞ room + random matchmaking server — Cloudflare Workers + Durable Objects
 * Room-code matchmaking, two participants, authoritative (prototype) battle replay.
 * Short recorded attacks are relayed directly peer-to-peer via room DO; not persisted. No accounts or storage.
 * Not hardened for competitive ranked play: client-submitted stats need signing.
 */
import { DurableObject } from 'cloudflare:workers';

const safeJson = (obj, code=200) => new Response(JSON.stringify(obj), {
  status:code, headers:{'content-type':'application/json; charset=utf-8','access-control-allow-origin':'*'}
});
const clamp = (x,min,max) => Math.max(min,Math.min(max,Number(x)||0));

export default {
  async fetch(request,env) {
    const url = new URL(request.url);
    if (url.pathname === '/' || url.pathname === '/health') return safeJson({ok:true,service:'otodama-room',version:'0.3',randomMatch:true});
    if(url.pathname==='/random'){
      if(request.method!=='GET'||(request.headers.get('Upgrade')||'').toLowerCase()!=='websocket')return safeJson({error:'WebSocket upgrade required'},426);
      return env.MATCHMAKER.get(env.MATCHMAKER.idFromName('global-v1')).fetch(request);
    }
    const match = /^\/room\/([A-HJ-NP-Z2-9]{6})$/.exec(url.pathname);
    if (!match) return safeJson({error:'Unknown path'},404);
    if (request.method !== 'GET' || (request.headers.get('Upgrade')||'').toLowerCase() !== 'websocket')
      return safeJson({error:'WebSocket upgrade required'},426);
    // Give every code a separate tiny Durable Object room.
    return env.ROOM.get(env.ROOM.idFromName(match[1])).fetch(request);
  }
};

export class Room extends DurableObject {
  async fetch() {
    if (this.ctx.getWebSockets().filter(ws=>ws.readyState===1).length>=2)
      return safeJson({error:'This room is full'},409);
    const [client,server] = Object.values(new WebSocketPair());
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({creature:null,ready:false});
    return new Response(null,{status:101,webSocket:client});
  }
  peers(){return this.ctx.getWebSockets().filter(ws=>ws.readyState===1)}
  send(ws,obj){try{if(ws.readyState===1)ws.send(JSON.stringify(obj))}catch{}}
  state(){const ps=this.peers();for(let i=0;i<ps.length;i++){
    const own=ps[i].deserializeAttachment()||{};
    this.send(ps[i],{type:'state',me:i,youReady:!!own.ready,
      players:ps.map(p=>{let a=p.deserializeAttachment()||{};return{name:a.creature?.name||'接続中',ready:!!a.ready}})});
  }}
  cleanCreature(v){
    if(!v||typeof v!=='object')return null;
    const parts=v.parts||{},voice=v.voice||{};
    const nums={body:5,eyes:20,brows:20,nose:20,mouth:20,ears:20,left:30,right:30,color:10,family:12,crest:30,back:16,pattern:24,legs:16};
    let safeParts={};for(const [key,max] of Object.entries(nums))safeParts[key]=Math.floor(clamp(parts[key],0,max-1));
    let safeVoice={};for(const key of ['vol','pitch','res','rhythm','stable','breath'])safeVoice[key]=Math.floor(clamp(voice[key],0,100));
    return{seed:(Number(v.seed)||1)>>>0,name:String(v.name||'オトダマ').slice(0,24),
      element:String(v.element||'音').slice(0,5),type:String(v.type||'不明').slice(0,12),
      rank:String(v.rank||'C').slice(0,2),parts:safeParts,voice:safeVoice,
      stats:Array.from({length:5},(_,i)=>Math.floor(clamp(v.stats?.[i],25,95)))};
  }
  simulate(a,b){
    const fighters=[a,b],max=fighters.map(c=>Math.round(140+c.stats[1]*.6)),hp=max.slice(),events=[];
    const kinds=['rush','aerial','warp','beam','combo','spin','uppercut','shockwave','meteor','counter'];
    let streak=0,last=-1;
    for(let turn=0;turn<35&&hp[0]>0&&hp[1]>0;turn++){
      let atk=turn%2;if(Math.random()<.34)atk=Math.random()<.5?0:1;
      if(atk===last)streak++;else streak=0;if(streak>=3){atk=1-atk;streak=0}last=atk;
      const def=1-atk,A=fighters[atk],B=fighters[def];let kind=kinds[Math.floor(Math.random()*kinds.length)];
      const crit=Math.random()<.08+A.stats[3]/950,hits=['combo','aerial','spin'].includes(kind)?2+Math.floor(Math.random()*4):1;
      let dodge=Math.random()<.065+B.stats[2]/750,counter=!dodge&&Math.random()<.04+B.stats[3]/1080;
      if(Math.random()<.065){kind='meteor';dodge=false}
      let damage=Math.max(4,Math.round((12+A.stats[0]*.2+A.stats[4]*.13-B.stats[1]*.11+(Math.random()*16-6))*(hits>1?1+.15*(hits-1):1)*(crit?1.45:1)));
      if(dodge)damage=0;else if(counter)damage=Math.max(2,Math.round(damage*.32));
      const selfDamage=counter?Math.round(10+B.stats[0]*.19+Math.random()*8+2):0;
      hp[def]=Math.max(0,hp[def]-damage);hp[atk]=Math.max(0,hp[atk]-selfDamage);
      let recovery=0;if(hp[atk]>0&&hp[atk]<max[atk]*.5&&Math.random()<.11){recovery=Math.round(8+Math.random()*17);hp[atk]=Math.min(max[atk],hp[atk]+recovery)}
      const arena=Math.random()<.115?['無重力ゾーン','落雷の嵐','残響増幅','空間反転','音速暴走'][Math.floor(Math.random()*5)]:null;
      events.push({atk,kind,damage,crit,hits,dodge,counter,selfDamage,recovery,arena,hp:hp.slice()});
    }
    return {events,max,winner:hp[0]/max[0]>=hp[1]/max[1]?0:1};
  }
  async webSocketMessage(ws,raw){
    if(typeof raw!=='string'||raw.length>120000){this.send(ws,{type:'error',message:'無効なメッセージ'});return}
    let data;try{data=JSON.parse(raw)}catch{return}
    const attachment=ws.deserializeAttachment()||{creature:null,ready:false};
    if(data.type==='join'){
      if(attachment.creature)return;
      const creature=this.cleanCreature(data.creature);
      if(!creature){this.send(ws,{type:'error',message:'キャラデータが不正です'});return}
      ws.serializeAttachment({creature,ready:false});this.state();return;
    }
    if(data.type==='voice'){
      if(!attachment.creature)return;
      const clip=typeof data.clip==='string'?data.clip:'';
      if(clip.length>100000||(clip&&!/^data:audio\/(?:webm|mp4|ogg|mpeg|wav|x-wav)[^,]{0,90};base64,[A-Za-z0-9+/=]+$/i.test(clip)))return;
      for(const peer of this.peers())if(peer!==ws)this.send(peer,{type:'voice',clip});
      return;
    }
    if(data.type==='ready'){
      if(!attachment.creature)return;
      ws.serializeAttachment({...attachment,ready:true});
      const peers=this.peers();if(peers.length!==2){this.state();return}
      const both=peers.map(s=>s.deserializeAttachment()||{});
      if(both.every(p=>p.creature&&p.ready)){
        const creatures=both.map(p=>p.creature),outcome=this.simulate(...creatures);
        for(const p of peers){const a=p.deserializeAttachment();p.serializeAttachment({...a,ready:false});this.send(p,{type:'battle',creatures,outcome})}
      }
      this.state();
    }
  }
  async webSocketClose(ws){
    for(const peer of this.peers())if(peer!==ws){
      let data=peer.deserializeAttachment();if(data)peer.serializeAttachment({...data,ready:false});
      this.send(peer,{type:'left'});
    }
    this.state();
  }
  async webSocketError(ws){try{ws.close(1011,'Connection error')}catch{}}
}


/** Single, simple FIFO matchmaking queue for the prototype.
 * Client connects to /random and sends {type:"search"}. A pair gets a
 * random room code and reconnects to /room/CODE using the existing protocol.
 * Matchmaker uses hibernatable WebSockets; queued players have no active CPU.
 */
export class Matchmaker extends DurableObject {
  async fetch() {
    const [client,server]=Object.values(new WebSocketPair());
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({status:'connected',time:Date.now()});
    return new Response(null,{status:101,webSocket:client});
  }
  async webSocketMessage(ws,raw){
    if(typeof raw!=='string'||raw.length>256)return;
    let msg;try{msg=JSON.parse(raw)}catch{return}
    if(msg.type!=='search')return;
    ws.serializeAttachment({status:'waiting',time:Date.now()});
    this.pair();
  }
  pair(){
    let waiting=this.ctx.getWebSockets().filter(w=>w.readyState===1&&w.deserializeAttachment()?.status==='waiting')
      .sort((a,b)=>a.deserializeAttachment().time-b.deserializeAttachment().time);
    const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    while(waiting.length>=2){
      const a=waiting.shift(),b=waiting.shift();
      if(a.readyState!==1||b.readyState!==1)continue;
      const bytes=crypto.getRandomValues(new Uint8Array(6));
      const code=Array.from(bytes,x=>chars[x%chars.length]).join('');
      for(const socket of [a,b]){
        socket.serializeAttachment({status:'paired',time:Date.now()});
        try{socket.send(JSON.stringify({type:'matched',code}));socket.close(1000,'paired')}catch{}
      }
    }
  }
  async webSocketClose(ws,code,reason){try{ws.close(code||1000,reason||'closed')}catch{}}
  async webSocketError(ws){try{ws.close(1011,'Socket error')}catch{}}
}