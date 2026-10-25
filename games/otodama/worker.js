/** OTODAMA ∞ room + random matchmaking server — Cloudflare Workers + Durable Objects
 * Room-code matchmaking, two participants, authoritative (prototype) battle replay.
 * Audio never leaves client. No persistent accounts or cloud storage.
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
    if (url.pathname === '/' || url.pathname === '/health') return safeJson({ok:true,service:'otodama-room',version:'0.2',randomMatch:true});
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
    // Later: server must recompute stats from a validated voice-signature protocol.
    const max=[Math.round(110+a.stats[1]*.7),Math.round(110+b.stats[1]*.7)];
    const hp=max.slice(),events=[];
    for(let turn=0;turn<42&&hp[0]>0&&hp[1]>0;turn++){
      const atk=turn%2,def=1-atk,A=atk?a:b,B=atk?b:a;
      const crit=Math.random()<(.08+A.stats[3]/750);
      const damage=Math.max(3,Math.round(A.stats[0]*.25+A.stats[4]*.12+Math.random()*18-7-B.stats[1]*.10+(crit?13:0)));
      hp[def]=Math.max(0,hp[def]-damage);events.push({atk,damage,crit,hp:hp.slice()});
    }
    return{events,max,winner:hp[0]>=hp[1]?0:1};
  }
  async webSocketMessage(ws,raw){
    if(typeof raw!=='string'||raw.length>4096){this.send(ws,{type:'error',message:'無効なメッセージ'});return}
    let data;try{data=JSON.parse(raw)}catch{return}
    const attachment=ws.deserializeAttachment()||{creature:null,ready:false};
    if(data.type==='join'){
      if(attachment.creature)return;
      const creature=this.cleanCreature(data.creature);
      if(!creature){this.send(ws,{type:'error',message:'キャラデータが不正です'});return}
      ws.serializeAttachment({creature,ready:false});this.state();return;
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