/* WILD RECLAIM — flood rescue: controllable escort of endangered wild prey. */
(()=>{
"use strict";
const rescuers=new Set(["frog","giantTreeFrog","pacmanFrog","otter"]);
let active=null,probe=null,probeAt=-1,scanAt=0,noticeAt=-90;
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const flood=(api,o)=>Math.max(0,Number(api.floodDepth?.(o.x,o.y))||0);
const owned=m=>!!(m.squadIndividualId||m.releasedIndividualId||m.ownedId||m.companion||m.strongBoss||m.worldEndBoss);
function allowed(api){
 const P=api?.P;
 return !!P&&api.mode==="play"&&P.hp>0&&!P._ufoAbducting&&rescuers.has(P.type)&&flood(api,P)>.07;
}
function eligible(api,m){
 return !!m&&m.hp>0&&!m.floodRescued&&!owned(m)&&api.isPrey?.(m)&&
  Number.isFinite(m.x)&&Number.isFinite(m.y)&&(m.r||12)<=(api.P.r||16)*1.65+8&&flood(api,m)>.11;
}
function candidate(api){
 if(!allowed(api)||active)return null;
 const t=Number(api.elapsed)||0,P=api.P;
 if(t-probeAt<.35&&probeAt>=0){
  return probe&&eligible(api,probe)&&distance(P,probe)<P.r+(probe.r||12)+37&&!api.lineBlocked?.(P,probe)?probe:null;
 }
 probeAt=t;probe=null;let nearest=Infinity;
 for(const m of api.mobs||[]){
  if(!eligible(api,m))continue;
  const d=distance(P,m);
  if(d>=nearest||d>P.r+(m.r||12)+37||api.lineBlocked?.(P,m))continue;
  nearest=d;probe=m;
 }
 return probe;
}
function tryBegin(api){
 if(active){api.notify?.("救助中：動物を乾いた岸へ誘導");return true;}
 const m=candidate(api);if(!m)return false;
 active={mob:m,owner:api.P,lastNear:Number(api.elapsed)||0};
 m.flee=0;m.alert=0;m.search=0;m.windup=0;
 api.notify?.("洪水救助！ 動物を乾いた岸へ連れていこう。離れると失敗");
 return true;
}
function tick(dt,api){
 if(!api||api.mode!=="play"||!api.P||!Number.isFinite(dt)||dt<=0)return;
 const P=api.P,t=Number(api.elapsed)||0;
 if(active){
  const {mob:m,owner}=active;
  if(owner!==P||!api.mobs.includes(m)||P.hp<=0||m.hp<=0||P._ufoAbducting||
   !rescuers.has(P.type)||distance(P,m)>160){active=null;return;}
  const d=distance(P,m);
  if(d<104)active.lastNear=t;
  if(t-active.lastNear>1.15){active=null;api.notify?.("動物とはぐれて救助失敗");return;}
  const angle=Math.atan2(P.y-m.y,P.x-m.x),ideal=P.r+(m.r||12)+15;
  const step=Math.min(Math.max(0,d-ideal),Math.max(0,Number(P.speed)||145)*dt*.83);
  if(step>.1){
   const ox=m.x,oy=m.y;api.move?.(m,Math.cos(angle)*step,Math.sin(angle)*step);
   const moved=distance({x:ox,y:oy},m);
   m.vx=(m.x-ox)/Math.max(.001,dt);m.vy=(m.y-oy)/Math.max(.001,dt);
   m.step=(m.step||0)+moved*.05;
  }else{m.vx=0;m.vy=0;}
  m.flee=0;m.alert=0;m.search=0;m.windup=0;m.chargeTime=0;m.stun=0;m.floodStrain=0;
  if((Number(api.waterDepth?.(m.x,m.y))||0)<.045&&flood(api,m)<.025){
   m.floodRescued=true;
   if(api.onRescue?.(m)!==false){active=null;api.notify?.("救助成功！ 動物が陸へ帰った");}
   else{m.floodRescued=false;api.notify?.("保存に失敗。救助報酬は未確定");}
  }
  return;
 }
 // Once every 0.4s, only prey close to the player. No HP death or owned-NPC mutation.
 if(t<scanAt)return;scanAt=t+.4;
 for(const m of api.mobs||[]){
  if(!m||m.hp<=0||owned(m)||m.floodRescued||!api.isPrey?.(m)||
   Math.abs(m.x-P.x)>320||Math.abs(m.y-P.y)>320)continue;
  const depth=flood(api,m);
  if(depth>.12){
   m.floodStrain=Math.min(5,(Number(m.floodStrain)||0)+.4*depth);
   if(m.floodStrain>1.65&&(m.floodStunCooldown||0)<=t){
    m.stun=Math.max(m.stun||0,.28);m.floodStunCooldown=t+4.5;
    if(distance(P,m)<125&&t-noticeAt>9){noticeAt=t;api.notify?.("水没した動物が疲弊。水辺の動物で救助できる");}
   }
  }else m.floodStrain=Math.max(0,(Number(m.floodStrain)||0)-.3);
 }
}
function draw(ctx,project,api){
 if(api?.mode!=="play"||!api.P)return;
 const m=active?.owner===api.P?active.mob:candidate(api);
 if(!m||m.hp<=0)return;
 const p=project(m.x,m.y),player=project(api.P.x,api.P.y);
 if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))return;
 ctx.save();ctx.strokeStyle=active?"#80f0cf":"#ffe5a3";ctx.lineWidth=active?3:2;ctx.globalAlpha=.92;
 if(active&&player&&Number.isFinite(player.x)){
  ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(player.x,player.y-15);
  ctx.lineTo(p.x,p.y-12);ctx.stroke();ctx.setLineDash([]);
 }
 ctx.beginPath();ctx.ellipse(p.x,p.y,Math.max(12,(m.r||12)*.75),8,0,0,Math.PI*2);ctx.stroke();
 ctx.fillStyle="#112f30";ctx.fillRect(p.x-43,p.y-53,86,22);
 ctx.fillStyle="#f2fff0";ctx.textAlign="center";ctx.font="bold 12px sans-serif";
 ctx.fillText(active?"救助中 → 岸へ":"救助 ○",p.x,p.y-38);ctx.restore();
}
window.WildFloodRescue=Object.freeze({tick,draw,tryBegin,canBegin:api=>!!candidate(api),
 get active(){return active?.mob||null},reset(){active=null;probe=null;probeAt=-1;scanAt=0;noticeAt=-90;}});
})();