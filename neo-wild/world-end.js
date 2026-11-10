/* WILD RECLAIM | the end of the world: mandatory encounter at YEAR 100.
 * Purely original dark one-eyed giant; no sprites, no UI or save-schema changes.
 */
(()=>{"use strict";
const KEY="wild-reclaim-world-end-v1",TYPE="worldEnd",SPAWN_YEAR=100,RADIUS=345;
let warningAt=-1000;
const validPos=(x,y,w)=>Number.isFinite(x)&&Number.isFinite(y)&&x>=RADIUS&&x<=w.w-RADIUS&&y>=RADIUS&&y<=w.h-RADIUS;
function read(){
 try{
  const raw=localStorage.getItem(KEY);
  if(!raw)return {version:1,stage:"dormant"};
  const s=JSON.parse(raw);
  if(s?.version!==1||!["dormant","active","defeated"].includes(s.stage))throw Error("stage");
  if(s.stage!=="dormant"&&(!Number.isFinite(s.x)||!Number.isFinite(s.y)||
   !Number.isFinite(s.year)||s.year<SPAWN_YEAR))throw Error("position");
  return s;
 }catch(_){return {version:1,stage:"corrupt"}}
}
function persist(s){
 const raw=JSON.stringify(s);
 try{localStorage.setItem(KEY,raw);return localStorage.getItem(KEY)===raw}catch(_){return false}
}
function findSpawn(P,WORLD,blocked){
 const preferred=Math.atan2(P.y-WORLD.h*.50,P.x-WORLD.w*.52);
 // Search the existing connected world, not a new level or a teleport map.
 for(const radius of [850,1100,1450,1900]){
  for(let i=0;i<16;i++){
   const a=preferred+i*Math.PI/8,x=Math.max(RADIUS+40,Math.min(WORLD.w-RADIUS-40,P.x+Math.cos(a)*radius));
   const y=Math.max(RADIUS+40,Math.min(WORLD.h-RADIUS-40,P.y+Math.sin(a)*radius));
   if(Math.hypot(x-P.x,y-P.y)<520||blocked?.(x,y,75))continue;
   return {x,y};
  }
 }
 return {x:Math.max(RADIUS+40,Math.min(WORLD.w-RADIUS-40,P.x+800)),y:Math.max(RADIUS+40,Math.min(WORLD.h-RADIUS-40,P.y+480))};
}
function makeMob(state){
 const hp=Math.max(1,Math.min(5000,Math.round(Number(state.hp)||3600)));
 return {type:TYPE,x:state.x,y:state.y,r:RADIUS, hp,maxHp:3600,
  color:"#09090c",belly:"#15121d",vx:0,vy:0,dir:0,step:0,swing:0,attack:0,
  wander:0,flash:0,stun:0,windup:0,windupTotal:0,alert:0,search:0,
  flee:0,fleeEnergy:1,evadeTime:0,evadeCooldown:0,escapeTimer:0,
  strongBoss:true,worldEndBoss:true,worldEndCooldown:3.5,worldEndCharge:0,
  worldEndTargetX:null,worldEndTargetY:null,worldEndStrikeCount:0,
  bossBalanceVersion:2,poise:0,poiseLastAt:0,guardBreakUntil:0};
}
function tick({P,mobs,year,elapsed,dt=0,WORLD,collides,notify,onSpawn,onImpact,paused=false}){
 if(paused||!P||year<SPAWN_YEAR)return false;
 let state=read();
 if(state.stage==="corrupt"){
  if(elapsed-warningAt>35){warningAt=elapsed;notify?.("100年のボス記録が破損しています。JSONバックアップを保護してください")}
  return false;
 }
 if(state.stage==="defeated")return false;
 if(state.stage==="dormant"){
  const site=findSpawn(P,WORLD,collides);
  state={version:1,stage:"active",year:SPAWN_YEAR,x:site.x,y:site.y,hp:3600,updatedAt:Date.now()};
  // Irreversible event is stored before any NPC enters the live simulation.
  if(!persist(state)){
   if(elapsed-warningAt>35){warningAt=elapsed;notify?.("100年ボスの出現記録を保存できません。ブラウザの容量を確認してください")}
   return false;
  }
  onSpawn?.(state);notify?.("世界100年。この世の終わりが目覚めた。討伐が最終目標",6);
 }
 let mob=mobs.find(m=>m?.type===TYPE&&m.hp>0);
 if(!mob){
  // Reserve a live slot at YEAR 100 even if ordinary wildlife hit the cap.
  // Never evict owned, released, companion or existing boss individuals.
  if(mobs.length>=119){
   const expendable=mobs.filter(m=>m&&m.hp>0&&m.type!==TYPE&&
    !m.strongBoss&&!m.worldEndBoss&&!m.companion&&!m.squadIndividualId&&
    !m.bossIndividualId&&!m.releasedIndividualId)
    .sort((a,b)=>Math.hypot(b.x-P.x,b.y-P.y)-Math.hypot(a.x-P.x,a.y-P.y));
   while(mobs.length>=119&&expendable.length){
    const old=expendable.shift(),index=mobs.indexOf(old);
    if(index>=0)mobs.splice(index,1);
   }
  }
  if(mobs.length>=119){
   if(elapsed-warningAt>35){warningAt=elapsed;notify?.("最終ボスの出現枠を確保できません。近くの野生動物を減らしてください")}
   return false;
  }
  mob=makeMob(state);mobs.push(mob);
 }
 // A newer, separately persisted boss HP wins over an old autosave snapshot.
 // The final boss never heals when a stale checkpoint is loaded.
 if(state.stage==="active"&&Number.isFinite(state.hp)&&state.hp>0&&mob.hp>state.hp)mob.hp=state.hp;
 if(mob.hp<=0)return false;
 mob.worldEndBoss=true;mob.strongBoss=true;mob.r=RADIUS;
 mob.worldEndCooldown=Math.max(0,Number(mob.worldEndCooldown)||0);
 mob.worldEndCharge=Math.max(0,Number(mob.worldEndCharge)||0);
 mob.worldEndStrikeCount=Math.max(0,Math.floor(Number(mob.worldEndStrikeCount)||0));
 const delta=Math.max(0,Math.min(.05,Number(dt)||0));
 const distance=Math.hypot(P.x-mob.x,P.y-mob.y),dir=Math.atan2(P.y-mob.y,P.x-mob.x);
 mob.dir=dir;
 // Terrifyingly slow; never teleport into the player's den or chase through walls.
 if(distance>RADIUS+120&&distance<1900){
  const step=19*delta;
  const x=mob.x+Math.cos(dir)*step,y=mob.y+Math.sin(dir)*step;
  if(validPos(x,y,WORLD)&&!collides?.(x,y,75)){
   mob.vx=delta>0?(x-mob.x)/delta:0;mob.vy=delta>0?(y-mob.y)/delta:0;mob.x=x;mob.y=y;
  }else{mob.vx=0;mob.vy=0}
 }else{mob.vx=0;mob.vy=0}
 if(mob.worldEndCharge>0){
  mob.worldEndCharge=Math.max(0,mob.worldEndCharge-delta);
  if(mob.worldEndCharge===0){
   const impact={x:mob.worldEndTargetX,y:mob.worldEndTargetY,radius:190,damage:Math.max(28,Math.min(64,32+mob.worldEndStrikeCount*2))};
   onImpact?.(mob,impact);
   mob.worldEndCooldown=4.7;mob.worldEndStrikeCount++;
  }
 }else if(mob.worldEndCooldown>0)mob.worldEndCooldown=Math.max(0,mob.worldEndCooldown-delta);
 else if(distance<1080){
  mob.worldEndCharge=2.2;
  mob.worldEndTargetX=P.x+(P.vx||0)*.18;
  mob.worldEndTargetY=P.y+(P.vy||0)*.18;
  notify?.("巨大な触手が振り下ろされる！ 範囲から逃げろ",2.2);
 }
 // Throttled independent HP persistence supports death/reload without a full autosave.
 if(!mob.worldEndSaveAt||elapsed-mob.worldEndSaveAt>=4){
  mob.worldEndSaveAt=elapsed;
  const ratio=Math.max(0,Math.min(1,mob.hp/mob.maxHp));
  if(Math.abs((state.hp||3600)-mob.hp)>=1||
     Math.hypot(state.x-mob.x,state.y-mob.y)>=8)
   persist({...state,x:mob.x,y:mob.y,hp:mob.hp,updatedAt:Date.now()});
 }
 return true;
}
function defeat(m,year){
 if(!m?.worldEndBoss||m.hp>0)return false;
 const current=read();
 if(current.stage==="defeated")return true;
 if(current.stage!=="active")return false;
 return persist({...current,stage:"defeated",hp:0,defeatedYear:year,updatedAt:Date.now()});
}
function reset(){try{localStorage.removeItem(KEY);return localStorage.getItem(KEY)===null}catch(_){return false}}
function drawWarnings(ctx,mobs,elapsed){
 const mob=mobs.find(m=>m?.worldEndBoss&&m.hp>0&&m.worldEndCharge>0);
 if(!mob||!Number.isFinite(mob.worldEndTargetX)||!Number.isFinite(mob.worldEndTargetY))return;
 const x=mob.worldEndTargetX,y=mob.worldEndTargetY,pulse=.5+.5*Math.sin(elapsed*7);
 ctx.save();ctx.strokeStyle=pulse>.5?"#f6a77c":"#db675c";ctx.lineWidth=3.8;
 ctx.setLineDash([20,11]);ctx.beginPath();ctx.arc(x,y,190,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
 ctx.strokeStyle="#efc1a2";ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(mob.x,mob.y);
 ctx.quadraticCurveTo((mob.x+x)*.5,(mob.y+y)*.5-100,x,y);ctx.stroke();ctx.restore();
}
window.WildWorldEnd=Object.freeze({KEY,TYPE,SPAWN_YEAR,RADIUS,read,persist,tick,defeat,reset,drawWarnings,makeMob});
})();