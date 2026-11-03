/* WILD RECLAIM V1.0 — UFO encounter. Independent of save schema. */
(function(){
"use strict";
const key="wild-reclaim-ufo-events-v1";
let event=null, cooldown=0, history=[];
try{const v=JSON.parse(localStorage.getItem(key)||"[]");if(Array.isArray(v))history=v.slice(-30)}catch(_){}
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function record(kind,year,x,y){history.push({kind,year,x:Math.round(x),y:Math.round(y)});history=history.slice(-30);try{localStorage.setItem(key,JSON.stringify(history))}catch(_){}}
function resetTransient(){event=null;cooldown=80}
function summon(x,y){event={x,y,t:0,stage:"approach",beam:0,victim:null};return event}
function tick(dt,world){
 if(!world||!world.P||world.mode!=="play")return;
 const {P,mobs,elapsed}=world,year=Math.floor(elapsed/120);
 if(!event){cooldown=Math.max(0,cooldown-dt);if(year>=50&&cooldown===0&&Math.random()<dt/950){summon(P.x+240+(Math.random()-.5)*350,P.y+(Math.random()-.5)*420);cooldown=420;world.notify("空に正体不明の円盤が現れた！")};return}
 const e=event;e.t+=dt;
 if(e.stage==="approach"&&e.t>=3){e.stage="scan";e.t=0;world.notify("謎の光線！ 遮蔽物に隠れるか逃げろ")}
 if(e.stage==="scan"){
  // NPC can be abducted before the player: nearest living wildlife in beam.
  const targets=mobs.filter(m=>m.hp>0&&!m.companion&&distance(m,e)<95).sort((a,b)=>distance(a,e)-distance(b,e));
  if(targets.length&&e.t>2.5){const m=targets[0];m.hp=0;m._killRegistered=true;record("NPC誘拐",year,m.x,m.y);world.notify("動物が光に吸い込まれた！");e.stage="depart";e.t=0}
  else if(distance(P,e)<105&&!P.hidden&&!world.lineBlocked(P,e)){e.beam+=dt;if(e.beam>=2.2){record("UFO捕獲",year,P.x,P.y);world.notify("円盤に捕獲された！");P.hp=0;world.beginDeath();e.stage="depart";e.t=0}}
  else e.beam=Math.max(0,e.beam-dt*2);
  if(e.t>11){e.stage="depart";e.t=0}
 }
 if(e.stage==="depart"&&e.t>2){event=null;cooldown=Math.max(cooldown,300)}
}
function draw(ctx,project,world){
 if(!event||!world||world.mode!=="play")return;
 const e=event,p=project(e.x,e.y);if(!Number.isFinite(p.x)||!Number.isFinite(p.y))return;
 const radius=35+Math.sin(e.t*5)*3;
 ctx.save();ctx.translate(p.x,p.y-110);ctx.fillStyle="#1b2837";ctx.strokeStyle="#a5e9ff";ctx.lineWidth=3;
 ctx.beginPath();ctx.ellipse(0,0,radius,13,0,0,Math.PI*2);ctx.fill();ctx.stroke();
 ctx.beginPath();ctx.ellipse(0,-8,19,12,0,Math.PI,Math.PI*2);ctx.fill();ctx.stroke();
 if(e.stage==="scan"){const alpha=.15+.16*Math.sin(e.t*9);ctx.fillStyle="rgba(131,235,252,"+alpha+")";ctx.beginPath();ctx.moveTo(-15,12);ctx.lineTo(-92,110);ctx.lineTo(92,110);ctx.lineTo(15,12);ctx.closePath();ctx.fill();
 ctx.fillStyle="#fff0b2";ctx.font="bold 13px sans-serif";ctx.textAlign="center";ctx.fillText("光線から逃げろ！",0,-33);
 if(e.beam>0){ctx.fillStyle="#ffe0a0";ctx.fillRect(-38,24,76*e.beam/2.2,5)}}
 ctx.restore();
}
window.WildUFO={tick,draw,resetTransient,summon,history:()=>history.slice(),get active(){return event}};
})();
