/* WILD RECLAIM: player den companion, one ally per saved run.
 * Explicit recruitment only; no silent pantry consumption.
 * A companion occupies a normal wildlife slot and uses normal collision.
 */
(()=>{"use strict";
 const speciesFor={fox:"wildFox",cat:"strayCat",wolf:"dog"};
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 function create(owner,x,y,species){
  const type=speciesFor[owner],s=species?.[type];
  if(!s||!Number.isFinite(x)||!Number.isFinite(y))return null;
  const hp=Math.max(45,Math.round(s.hp*.85+22));
  return {x,y,type,r:s.r,color:s.color,belly:s.belly,hp,maxHp:hp,
   companion:true,companionOwner:owner,companionAttackCD:0,companionHurtCD:0,
   attack:0,vx:0,vy:0,dir:0,wander:1,alert:0,search:0,lastX:x,lastY:y,
   step:0,flee:0,flash:0,windup:0,windupTotal:0,swing:0,strikeDir:0,
   stun:0,evadeTime:0,evadeCooldown:0,chargeTime:0,chargeHit:false,
   groundZ:0,damageScale:1,speedScale:1};
 }
 function isAlly(m,owner){return !!m&&m.hp>0&&m.companion===true&&m.companionOwner===owner;}
 function threat(ally,player,mobs,species,visible,now){
  if(!ally||!player||!Array.isArray(mobs)||player.hidden)return null;
  const engaged=Number.isFinite(player.lastCombatAt)&&now-player.lastCombatAt<5;
  let chosen=null,score=Infinity;
  for(const m of mobs){
   if(!m||m===ally||m.hp<=0||m.companion||species?.[m.type]?.prey)continue;
   const da=distance(ally,m),dp=distance(player,m);
   if(da>215||dp>265||!visible(ally,m))continue;
   if(!engaged&&!(m.alert>0||m.windup>0||m.chargeTime>0))continue;
   const priority=da+dp*.25+(m.strongBoss?110:0);
   if(priority<score){score=priority;chosen=m;}
  }
  return chosen;
 }
 function followGoal(ally,player){
  if(!ally||!player)return null;
  const d=distance(ally,player);
  if(d<85)return null;
  const a=Number.isFinite(player.dir)?player.dir:0;
  return {x:player.x-Math.cos(a)*54,y:player.y-Math.sin(a)*54};
 }
 window.WildCompanions=Object.freeze({create,isAlly,threat,followGoal,speciesFor:Object.freeze(speciesFor),cost:24});
})();