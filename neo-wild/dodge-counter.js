// A single foreground opponent keeps the direction cue legible in a pack.
((global)=>{
 "use strict";
 let threat=null,impact=null;
 function begin(actor,enemy,now,reach){
  if(enemy.strongBoss||enemy.worldEndBoss||enemy.salvageCacheId||enemy.companion||enemy.releasedIndividualId)return false;
  if(threat&&threat.actor===actor&&threat.enemy.hp>0&&now>=threat.at&&
     (threat.until>now||threat.enemy!==enemy&&now-threat.at<2&&(threat.enemy.windup>0||threat.enemy.chargeTime>0)))return false;
  threat={actor,enemy,x:actor.x,y:actor.y,angle:enemy.strikeDir,reach,until:0,at:now};
  return true;
 }
 function miss(actor,enemy,now,blocked){
  const t=threat;
  if(!t||t.actor!==actor||t.enemy!==enemy||now<t.at||now-t.at>2||t.until||
     actor.hp<=0||enemy.hp<=0||actor.inv>0||actor.flying)return false;
  const lateral=Math.abs((actor.y-t.y)*Math.cos(t.angle)-(actor.x-t.x)*Math.sin(t.angle));
  if(lateral<Math.max(14,actor.r)||Math.hypot(actor.x-enemy.x,actor.y-enemy.y)>t.reach+48||
     Math.abs((actor.groundZ||0)-(enemy.groundZ||0))>=22||blocked(enemy,actor))return false;
  t.until=now+.85;
  return true;
 }
 function strike(actor,enemy,now){
  if(!threat||threat.actor!==actor||threat.enemy!==enemy||!(threat.until>now)||now<threat.at)return false;
  impact={actor,x:enemy.x,y:enemy.y,angle:Math.atan2(enemy.y-actor.y,enemy.x-actor.x),at:now};
  threat=null;return true;
 }
 function draw(ctx,actor,now,project){
  if(impact&&impact.actor===actor&&now>=impact.at&&now-impact.at<.18){
   const u=(now-impact.at)/.18,pos=project(impact.x,impact.y,12);
   const tip=project(impact.x+Math.cos(impact.angle)*24,impact.y+Math.sin(impact.angle)*24,12);
   ctx.save();ctx.translate(pos.x,pos.y);ctx.rotate(Math.atan2(tip.y-pos.y,tip.x-pos.x));
   ctx.globalAlpha=1-u;ctx.strokeStyle="#d4ffee";ctx.lineWidth=2;ctx.beginPath();
   for(let i=-1;i<=1;i++){ctx.moveTo(3+u*7,i*2);ctx.lineTo(11+u*12,i*(6+5*u));}
   ctx.stroke();ctx.restore();
  }
  const t=threat;
  if(!t||t.actor!==actor||t.enemy.hp<=0||now<t.at||now-t.at>3)return;
  const m=t.enemy,open=t.until>now;
  if(!open&&!(m.windup>0&&!t.until))return;
  const base=project(m.x,m.y,3);
  ctx.save();ctx.lineCap="round";ctx.lineJoin="round";ctx.beginPath();
  if(open){
   const u=(t.until-now)/.85,r=10+m.r*.35;
   ctx.ellipse(base.x,base.y,r,r*.46,0,Math.PI*(1-u),Math.PI*(1+u));
  }else{
   const tip=project(m.x+Math.cos(t.angle)*t.reach,m.y+Math.sin(t.angle)*t.reach,3);
   const a=Math.atan2(tip.y-base.y,tip.x-base.x);
   ctx.moveTo(base.x,base.y);ctx.lineTo(tip.x,tip.y);
   ctx.moveTo(tip.x-7*Math.cos(a-.65),tip.y-7*Math.sin(a-.65));ctx.lineTo(tip.x,tip.y);
   ctx.lineTo(tip.x-7*Math.cos(a+.65),tip.y-7*Math.sin(a+.65));
  }
  ctx.strokeStyle="#17231f";ctx.lineWidth=4;ctx.stroke();
  ctx.strokeStyle=open?"#a6f2cf":m.windup<.16?"#fff0be":"#efaa79";ctx.lineWidth=2;ctx.stroke();
  ctx.restore();
 }
 global.WildDodgeCounter=Object.freeze({begin,miss,strike,draw});
})(window);
