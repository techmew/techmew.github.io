/* WILD RECLAIM: optional four-player cooperative transport.
 * Server-authoritative session membership; no connection until configured.
 * Remote players are visual-only and never enter local save/roster/death ledgers.
 */
(function(global){'use strict';
const V=1,MAX_PACKET=4096,MAX_PARTY=4;
const finite=n=>typeof n==='number'&&Number.isFinite(n);
const id=s=>typeof s==='string'&&/^[a-zA-Z0-9_-]{1,64}$/.test(s);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function snapshot(p){
 if(!p||!id(p.id)||!id(p.species)||!Number.isInteger(p.level)||p.level<1||p.level>100)return null;
 if(![p.x,p.y,p.z,p.dir,p.hp].every(finite)||Math.abs(p.x)>1e6||Math.abs(p.y)>1e6||Math.abs(p.z)>1e5)return null;
 return {id:p.id,species:p.species,level:p.level,x:p.x,y:p.y,z:p.z,dir:p.dir,hp:clamp(p.hp,0,1),action:typeof p.action==='string'?p.action.slice(0,24):'idle',time:Date.now()};
}
class CoopParty{
 constructor({url,token,level,onPeer=()=>{},onLeave=()=>{},onStatus=()=>{},onEvent=()=>{}}={}){
  if(typeof url!=='string'||!/^wss:\/\//.test(url))throw Error('Trusted WSS endpoint required');
  if(!Number.isInteger(level)||level<1||level>100)throw Error('Invalid level');
  Object.assign(this,{url,token:token||null,level,onPeer,onLeave,onStatus,onEvent,peers:new Map(),ws:null,closed:false,lastSend:0,session:null});
 }
 connect(){if(this.ws||this.closed)return;const ws=new WebSocket(this.url);this.ws=ws;
  ws.onopen=()=>{this.send({type:'coop_join',v:V,token:this.token,level:this.level,range:5,maxPlayers:MAX_PARTY});this.onStatus('matching');};
  ws.onmessage=e=>{if(typeof e.data!=='string'||e.data.length>MAX_PACKET)return;let m;try{m=JSON.parse(e.data);}catch{return;}
   if(!m||m.v!==V)return;
   if(m.type==='coop_ready'&&id(m.session)){this.session=m.session;this.onStatus('matched');}
   else if(m.type==='coop_peer'&&this.session&&m.session===this.session){
    const p=snapshot(m.player);if(!p||Math.abs(p.level-this.level)>5||(!this.peers.has(p.id)&&this.peers.size>=MAX_PARTY-1))return;
    const old=this.peers.get(p.id);if(old)p.previous={x:old.x,y:old.y,z:old.z,dir:old.dir};
    this.peers.set(p.id,p);this.onPeer(p);
   }else if(m.type==='coop_leave'&&id(m.id)){if(this.peers.delete(m.id))this.onLeave(m.id);}
   else if(m.type==='coop_event'&&this.session&&m.session===this.session&&m.authoritative===true&&id(m.eventId)&&['revive','assist','objective'].includes(m.kind)){
    this.onEvent({eventId:m.eventId,kind:m.kind,actorId:id(m.actorId)?m.actorId:null,targetId:id(m.targetId)?m.targetId:null});
   }else if(m.type==='coop_status'&&['matching','matched','reconnecting','error'].includes(m.status))this.onStatus(m.status);
  };
  ws.onclose=()=>{this.ws=null;this.session=null;for(const key of this.peers.keys())this.onLeave(key);this.peers.clear();if(!this.closed)this.onStatus('disconnected');};
  ws.onerror=()=>this.onStatus('error');
 }
 send(m){if(this.ws?.readyState===WebSocket.OPEN)this.ws.send(JSON.stringify(m));}
 update(player){const now=Date.now();if(!this.session||now-this.lastSend<100)return false;const p=snapshot(player);if(!p||p.level!==this.level)return false;this.lastSend=now;this.send({type:'coop_state',v:V,session:this.session,player:p});return true;}
 requestAssist(kind,targetId){if(!this.session||!['revive','assist','objective'].includes(kind)||!id(targetId))return false;this.send({type:'coop_request',v:V,session:this.session,kind,targetId});return true;}
 rendered(now=Date.now()){const out=[];for(const [key,p] of this.peers){if(now-p.time>5000){this.peers.delete(key);this.onLeave(key);continue;}const old=p.previous,t=old?clamp((now-p.time)/120,0,1):1;const lerp=k=>old?old[k]+(p[k]-old[k])*t:p[k];const d=old?Math.atan2(Math.sin(p.dir-old.dir),Math.cos(p.dir-old.dir)):0;out.push({...p,x:lerp('x'),y:lerp('y'),z:lerp('z'),dir:old?old.dir+d*t:p.dir});}return out;}
 close(){this.closed=true;this.ws?.close();this.ws=null;this.session=null;this.peers.clear();}
}
global.WildCoop={CoopParty,snapshot,VERSION:V,MAX_PARTY};})(typeof window!=='undefined'?window:globalThis);
