/* WILD RECLAIM online transport: no connection without a trusted WSS server. */
(function(global){'use strict';
const VERSION=1,MAX_PACKET=4096,MAX_PEERS=12,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const finite=v=>typeof v==='number'&&Number.isFinite(v);
const cleanId=s=>typeof s==='string'&&/^[\w-]{1,64}$/.test(s)?s:null;
function validateSnapshot(p){if(!p||typeof p!=='object'||!cleanId(p.id)||!cleanId(p.species)||!Number.isInteger(p.level)||p.level<1||p.level>100)return null;
if(!finite(p.x)||!finite(p.y)||!finite(p.z)||!finite(p.dir)||!finite(p.hp)||Math.abs(p.x)>1e6||Math.abs(p.y)>1e6||Math.abs(p.z)>1e5)return null;
return {id:p.id,species:p.species,level:p.level,x:p.x,y:p.y,z:p.z,dir:p.dir,hp:clamp(p.hp,0,1),action:typeof p.action==='string'?p.action.slice(0,24):'idle',time:Date.now()};}
class OnlinePvP{
constructor({url,token,level,onPeer,onLeave,onStatus,onHit}={}){if(typeof url!=='string'||!/^wss:\/\//.test(url))throw Error('WSS server required');if(!Number.isInteger(level)||level<1||level>100)throw Error('Invalid level');
this.url=url;this.token=token||null;this.level=level;this.peers=new Map();this.onPeer=onPeer||(()=>{});this.onLeave=onLeave||(()=>{});this.onStatus=onStatus||(()=>{});this.onHit=onHit||(()=>{});this.ws=null;this.connected=false;this.lastSend=0;this.closed=false;}
connect(){if(this.ws||this.closed)return;const ws=new WebSocket(this.url);this.ws=ws;
ws.onopen=()=>{this.connected=true;this.send({type:'join',v:VERSION,level:this.level,range:5,token:this.token});this.onStatus('matching');};
ws.onmessage=e=>{if(typeof e.data!=='string'||e.data.length>MAX_PACKET)return;let msg;try{msg=JSON.parse(e.data);}catch{return;}if(!msg||msg.v!==VERSION)return;
if(msg.type==='peer'&&this.peers.size<MAX_PEERS){const p=validateSnapshot(msg.player);if(!p||Math.abs(p.level-this.level)>5)return;const previous=this.peers.get(p.id);if(previous)p.previous={x:previous.x,y:previous.y,z:previous.z,dir:previous.dir,time:previous.time};this.peers.set(p.id,p);this.onPeer(p);}
else if(msg.type==='leave'&&cleanId(msg.id)){this.peers.delete(msg.id);this.onLeave(msg.id);}
else if(msg.type==='hit'&&cleanId(msg.from)&&finite(msg.damage)&&msg.damage>=0&&msg.damage<=1){if(msg.authoritative===true)this.onHit({from:msg.from,damage:msg.damage,remainingHp:finite(msg.remainingHp)?clamp(msg.remainingHp,0,1):null});}
else if(msg.type==='status'&&['matching','matched','reconnecting','error'].includes(msg.status))this.onStatus(msg.status);};
ws.onclose=()=>{this.ws=null;this.connected=false;for(const id of this.peers.keys())this.onLeave(id);this.peers.clear();if(!this.closed)this.onStatus('disconnected');};ws.onerror=()=>this.onStatus('error');}
send(data){if(this.ws?.readyState===1)this.ws.send(JSON.stringify(data));}
update(player){const now=Date.now();if(!this.connected||now-this.lastSend<100)return false;const p=validateSnapshot(player);if(!p||p.level!==this.level)return false;this.lastSend=now;this.send({type:'state',v:VERSION,player:p});return true;}
// Smooth remote avatars without changing the local world's clock or save state.
// No extrapolation beyond the last trusted server position; stale peers disappear.
getRenderedPeers(now=Date.now(),delayMs=120){
 if(!finite(now))return [];
 const result=[];
 for(const [id,p] of this.peers){
  if(now-p.time>5000){this.peers.delete(id);this.onLeave(id);continue;}
  const prev=p.previous;
  const alpha=prev?clamp((now-p.time+delayMs)/Math.max(50,p.time-prev.time),0,1):1;
  const blend=(key)=>prev?prev[key]+(p[key]-prev[key])*alpha:p[key];
  const delta=prev?Math.atan2(Math.sin(p.dir-prev.dir),Math.cos(p.dir-prev.dir)):0;
  result.push({...p,x:blend('x'),y:blend('y'),z:blend('z'),dir:prev?prev.dir+delta*alpha:p.dir});
 }
 return result;
}
attack(targetId,action){if(!this.connected||!cleanId(targetId)||!this.peers.has(targetId))return false;this.send({type:'attack',v:VERSION,targetId,action:String(action||'attack').slice(0,24)});return true;}
close(){this.closed=true;this.ws?.close();this.ws=null;this.connected=false;this.peers.clear();}}
global.WildOnlinePvP={OnlinePvP,validateSnapshot,VERSION};})(typeof window!=='undefined'?window:globalThis);
