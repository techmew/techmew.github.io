// A single foreground opponent keeps the direction cue legible in a pack.
((global)=>{
 "use strict";
 let threat=null,impact=null,focus=null;
 function begin(actor,enemy,now,reach){
  if(enemy.strongBoss||enemy.worldEndBoss||enemy.companion||enemy.releasedIndividualId)return false;
  if(threat&&threat.actor===actor&&threat.enemy.hp>0&&now>=threat.at&&
     (threat.until>now||threat.enemy!==enemy&&now-threat.at<2&&(threat.enemy.windup>0||threat.enemy.chargeTime>0)))return false;
  threat={actor,enemy,x:actor.x,y:actor.y,angle:enemy.strikeDir,reach,until:0,at:now,crossedAt:-Infinity};
  return !enemy.salvageCacheId; // Guardians already draw their own committed direction.
 }
 function sidestep(actor,now,axis){
  const t=threat;
  if(!t||t.actor!==actor||t.until||now<t.at||now-t.at>2||t.enemy.hp<=0||
     !(t.enemy.windup>0||t.enemy.chargeTime>0)||Math.hypot(actor.x-t.enemy.x,actor.y-t.enemy.y)>t.reach+48)return null;
  const side=-axis.x*Math.sin(t.angle)+axis.y*Math.cos(t.angle);
  return t.angle+(side<0?-Math.PI/2:Math.PI/2);
 }
 function track(actor,now){
  const t=threat;
  if(!t||t.actor!==actor||t.until||Number.isFinite(t.crossedAt)||now<t.at||now-t.at>2)return;
  const lateral=Math.abs((actor.y-t.y)*Math.cos(t.angle)-(actor.x-t.x)*Math.sin(t.angle));
  if(lateral>=Math.max(14,actor.r))t.crossedAt=now;
 }
 function timeScale(actor,realDt){
  if(!focus)return 1;
  if(focus.actor!==actor||realDt>.5){focus=null;return 1;}
  focus.age+=realDt;
  if(focus.age>=.44){focus=null;return 1;}
  const release=Math.max(0,(focus.age-.20)/.24);
  return .22+.78*release*release;
 }
 function miss(actor,enemy,now,blocked){
  const t=threat;
  if(!t||t.actor!==actor||t.enemy!==enemy||now<t.at||now-t.at>2||t.until||
     actor.hp<=0||enemy.hp<=0||actor.inv>0||actor.flying)return false;
  const lateral=Math.abs((actor.y-t.y)*Math.cos(t.angle)-(actor.x-t.x)*Math.sin(t.angle));
  if(lateral<Math.max(14,actor.r)||Math.hypot(actor.x-enemy.x,actor.y-enemy.y)>t.reach+48||
     Math.abs((actor.groundZ||0)-(enemy.groundZ||0))>=22||blocked(enemy,actor))return false;
  if(now>=t.crossedAt&&now-t.crossedAt<=.16){
   focus={actor,age:0,x:t.x,y:t.y};
   t.perfect=true;
  }
  t.until=now+.85;
  return true;
 }
 function strike(actor,enemy,now){
  if(!threat||threat.actor!==actor||threat.enemy!==enemy||!(threat.until>now)||now<threat.at)return false;
  impact={actor,perfect:threat.perfect,x:enemy.x,y:enemy.y,angle:Math.atan2(enemy.y-actor.y,enemy.x-actor.x),at:now};
  threat=null;return true;
 }
 // One contact drives the cut, the pressure wave and the trailing hot fragments.
 function perfectImpact(c,u){
  const cut=Math.min(1,u/.33),tail=Math.min(1,(1-u)*3);
  c.save();c.rotate(-.42);c.globalAlpha=tail;
  for(const [half,tint] of [[12,"#ec652a"],[6,"#ffcf4b"],[2,"#fffbd9"]]){
   const front=12+cut*86,back=-12-cut*38+Math.max(0,u-.32)*100;
   c.fillStyle=tint;c.beginPath();c.moveTo(back,2);c.lineTo(1,-half*(1-u));
   c.lineTo(front,-4);c.lineTo(8,half*(1-u));c.closePath();c.fill();
  }
  if(u>.13){
   const wave=(u-.13)/.87,r=10+70*wave;
   c.globalAlpha=(1-wave)*.88;c.strokeStyle="#ffcb61";c.lineWidth=3*(1-wave)+1;
   c.beginPath();c.ellipse(0,3,r,r*.54,0,.15,2.85);c.moveTo(-r,3);
   c.ellipse(0,3,r,r*.54,0,Math.PI,5.95);c.stroke();
   c.fillStyle="#fff3a4";c.beginPath();
   for(let k=0;k<10;k++){
    const a=k*2.4,dx=Math.cos(a),dy=Math.sin(a)*.72,len=(18+(k%3)*9)*(1+wave);
    const x=dx*len,y=dy*len+wave*wave*8;
    c.moveTo(x,y);c.lineTo(x+dx*(10-6*wave),y+dy*(10-6*wave));
    c.lineTo(x-dy*2,y+dx*2);c.closePath();
   }
   c.fill();
  }
  c.restore();
 }
 function draw(ctx,actor,now,project){
  if(focus&&focus.actor===actor){
   const start=project(focus.x,focus.y,6),end=project(actor.x,actor.y,6);
   const angle=Math.atan2(end.y-start.y,end.x-start.x),length=Math.min(65,Math.hypot(end.x-start.x,end.y-start.y));
   ctx.save();ctx.translate(end.x,end.y);ctx.rotate(angle);ctx.globalAlpha=.8*(1-focus.age/.44);
   ctx.fillStyle="#6666ff";ctx.beginPath();
   for(let i=-1;i<=1;i++){
    const back=-length-15-Math.abs(i)*7;
    ctx.moveTo(back,i*11);ctx.quadraticCurveTo(-length*.45,i*7-6,6,i*2);
    ctx.quadraticCurveTo(-length*.48,i*7+4,back,i*11);ctx.closePath();
   }
   ctx.fill();ctx.strokeStyle="#79fff4";ctx.lineWidth=2.5;ctx.beginPath();
   for(let i=-1;i<=1;i++){
    ctx.moveTo(-length-5,i*7);ctx.quadraticCurveTo(-length*.45,i*4,0,i*2);
   }
   ctx.stroke();ctx.restore();
  }
  if(impact&&impact.actor===actor&&now>=impact.at&&now-impact.at<(impact.perfect ? .42 : .18)){
   const u=(now-impact.at)/(impact.perfect ? .42 : .18),pos=project(impact.x,impact.y,12);
   const tip=project(impact.x+Math.cos(impact.angle)*24,impact.y+Math.sin(impact.angle)*24,12);
   ctx.save();ctx.translate(pos.x,pos.y);ctx.rotate(Math.atan2(tip.y-pos.y,tip.x-pos.x));
   if(impact.perfect)perfectImpact(ctx,u);
   ctx.globalAlpha=1-u;ctx.strokeStyle=impact.perfect?"#fff4a4":"#d4ffee";ctx.lineWidth=impact.perfect?3:2;ctx.beginPath();
   for(let i=-1;i<=1;i++){ctx.moveTo(3+u*7,i*2);ctx.lineTo((impact.perfect?24:11)+u*12,i*(6+5*u));}
   ctx.stroke();ctx.restore();
  }
  const t=threat;
  if(!t||t.actor!==actor||t.enemy.hp<=0||now<t.at||now-t.at>3)return;
  const m=t.enemy,open=t.until>now;
  if(m.salvageCacheId)return;
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
 global.WildDodgeCounter=Object.freeze({begin,sidestep,track,timeScale,miss,strike,draw});
})(window);
