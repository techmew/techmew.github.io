/* WILD RECLAIM — coordinated hostile-pack encirclement.
 * Ephemeral combat state only: no changes to SAVE_SCHEMA 2/3 checkpoints.
 * A threatened player can break line of sight, hide, or escape the ring.
 */
(()=>{"use strict";
 const state={packId:null,tell:0,cooldown:0};
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 function reset(){state.packId=null;state.tell=0;state.cooldown=0;}
 function flankGoal(m,p,mobs,canStand){
  if(!m||!p||!m.packId||!(m.packOrder>0)||distance(m,p)>400)return null;
  const leader=mobs.find(q=>q!==m&&q.hp>0&&q.packId===m.packId&&q.packOrder===0);
  if(!leader||distance(leader,m)>450)return null;
  const moving=Math.hypot(p.vx||0,p.vy||0)>35;
  const heading=moving?Math.atan2(p.vy,p.vx):Number.isFinite(p.dir)?p.dir:0;
  const side=m.packOrder%2?1:-1;
  for(const [back,lateral] of [[38,138],[75,95],[30,65]]){
   const x=p.x-Math.cos(heading)*back-Math.sin(heading)*side*lateral;
   const y=p.y-Math.sin(heading)*back+Math.cos(heading)*side*lateral;
   if(canStand(x,y,m.r||18))return {x,y};
  }
  return null;
 }
 function membersNear(p,mobs,packId,canSee){
  return mobs.filter(m=>m&&m.hp>0&&m.packId===packId&&
   (m.alert||0)>0&&distance(m,p)<195&&canSee(m,p));
 }
 function surrounded(p,mobs,packId,canSee){
  if(!p||p.hidden||!packId)return false;
  const group=membersNear(p,mobs,packId,canSee);
  if(group.length<2||!group.some(m=>m.packOrder>0))return false;
  for(let i=0;i<group.length;i++)for(let j=i+1;j<group.length;j++){
   const a=Math.atan2(group[i].y-p.y,group[i].x-p.x);
   const b=Math.atan2(group[j].y-p.y,group[j].x-p.x);
   // A pair on the same side is a pursuit, not an encirclement.
   // Require genuinely opposed attack angles before warning or dealing damage.
   if(Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)))>=2.1)return true;
  }
  return false;
 }
 function update(dt,p,mobs,canSee,events={}){
  if(!p||!Array.isArray(mobs))return null;
  const step=Math.max(0,Math.min(.2,Number(dt)||0));
  state.cooldown=Math.max(0,state.cooldown-step);
  if(state.tell>0){
   if(!surrounded(p,mobs,state.packId,canSee)){
    state.tell=0;state.packId=null;state.cooldown=Math.max(state.cooldown,4.5);
    events.escape?.();return "escaped";
   }
   state.tell=Math.max(0,state.tell-step);
   if(state.tell===0){
    state.packId=null;state.cooldown=13.5;
    events.hit?.();return "hit";
   }
   return "warning";
  }
  if(state.cooldown>0||p.hidden)return null;
  const seen=new Set();
  for(const m of mobs){
   if(!m?.packId||seen.has(m.packId)||m.hp<=0)continue;
   seen.add(m.packId);
   if(surrounded(p,mobs,m.packId,canSee)){
    state.packId=m.packId;state.tell=.9;
    events.warn?.();return "warning";
   }
  }
  return null;
 }
 function draw(ctx,screen,dpr,elapsed){
  if(!(state.tell>0)||!screen||!Number.isFinite(screen.x)||!Number.isFinite(screen.y))return;
  ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);
  const pulse=.5+.5*Math.sin((elapsed||0)*13);
  const radius=42+11*(1-state.tell/.9);
  ctx.strokeStyle="rgba(255,156,95,"+(.62+.25*pulse)+")";
  ctx.lineWidth=3.2;ctx.setLineDash([8,6]);
  ctx.beginPath();ctx.arc(screen.x,screen.y,radius,0,Math.PI*2);ctx.stroke();
  ctx.setLineDash([]);
  ctx.textAlign="center";ctx.font="900 14px sans-serif";
  ctx.lineWidth=3.5;ctx.strokeStyle="#2a1c18";
  ctx.strokeText("群れの包囲！ 逃げろ",screen.x,screen.y-radius-17);
  ctx.fillStyle="#ffcf99";ctx.fillText("群れの包囲！ 逃げろ",screen.x,screen.y-radius-17);
  ctx.restore();
 }
 window.WildPackTactics=Object.freeze({flankGoal,surrounded,update,draw,reset,getState:()=>({...state})});
})();