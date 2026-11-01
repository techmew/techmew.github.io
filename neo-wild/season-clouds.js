/* WILD RECLAIM · seasonal sky overlay · 2026-11-01
 * Additive rendering only: no changes to game state, save schema, collision, or AI.
 * Captures the existing 3D render parameters, then paints to a separate transparent
 * canvas shared by WebGL and Canvas2D fallback. All positions are deterministic.
 */
(() => {
"use strict";
const app=document.getElementById("app");
const main=document.getElementById("scene");
if(!app||!main)return;
const layer=document.createElement("canvas");
layer.id="season-cloud-layer";
layer.setAttribute("aria-hidden","true");
Object.assign(layer.style,{
 position:"absolute",inset:"0",width:"100%",height:"100%",
 display:"block",pointerEvents:"none",zIndex:"1"
});
main.after(layer);
const ctx=layer.getContext("2d",{alpha:true});
if(!ctx)return;
const label=document.createElement("span");
label.id="season-indicator";
label.setAttribute("aria-live","off");
Object.assign(label.style,{
 display:"inline-block",marginLeft:"8px",fontSize:"11px",
 color:"#dde6d0",fontWeight:"700",letterSpacing:".04em"
});
document.getElementById("day-label")?.after(label);
const months=[31,28,31,30,31,30,31,31,30,31,30,31];
const seasons=[
 {name:"冬",leaf:"#c8cbb9",detail:"#8e977f",filter:"saturate(.76) brightness(1.04)"},
 {name:"春",leaf:"#a1c982",detail:"#eed3dc",filter:"saturate(1.12)"},
 {name:"夏",leaf:"#427c42",detail:"#69aa57",filter:"saturate(1.08) contrast(1.03)"},
 {name:"秋",leaf:"#cb783b",detail:"#e7aa54",filter:"sepia(.10) saturate(1.10)"}
];
function seasonOfDay(day){
 let remaining=(((Math.max(1,Math.floor(day))-1)%365)+365)%365;
 let month=0;
 while(month<11&&remaining>=months[month])remaining-=months[month++];
 const index=month===11||month<2?0:month<5?1:month<8?2:3;
 return {index,name:seasons[index].name,month:month+1,day:remaining+1};
}
function hash(x,y){
 const n=Math.sin(x*127.1+y*311.7)*43758.5453;
 return n-Math.floor(n);
}
let current=null,active3D=false;
if(window.Wild3D&&typeof window.Wild3D.render==="function"){
 const original=window.Wild3D.render;
 window.Wild3D.render=function(options){
  const rendered=original.call(this,options);
  if(rendered){current=options;active3D=true;}
  return rendered;
 };
}
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function cloudPatches(elapsed,weather,o){
 const overcast=weather==="THUNDER"?.98:weather==="RAIN"?.96:
  weather==="CLOUDY"?.87:weather==="FOG"?.72:weather==="WIND"?.55:.36;
 const cx=o.cam.x+o.vw*.5,cy=o.cam.y+o.vh*.5;
 const driftX=elapsed*7.8,driftY=elapsed*2.5,step=390;
 const gx=Math.floor((cx+driftX)/step),gy=Math.floor((cy+driftY)/step);
 const out=[];
 for(let row=gy-3;row<=gy+3;row++)for(let col=gx-3;col<=gx+3;col++){
  const n=hash(col*1.32+8,row*2.71+4);
  if(n>overcast)continue;
  const x=col*step+hash(col*2.3,row)*140-driftX;
  const y=row*step+hash(col,row*1.83)*130-driftY;
  if(Math.abs(x-cx)>o.vw*1.2+310||Math.abs(y-cy)>o.vh*1.25+310)continue;
  out.push({x,y,r:92+hash(col*1.7,row*1.9)*78});
  if(out.length>=14)return out;
 }
 return out;
}
function project(o,x,y){
 const dx=x-o.cam.x-o.vw*.5,dy=y-o.cam.y-o.vh*.5;
 return {x:o.vw*.5+o.VIEW.a*dx+o.VIEW.c*dy,
         y:o.vh*.5+o.VIEW.b*dx+o.VIEW.d*dy};
}
function drawFoliage(o,season){
 // Winter native renderer owns branches; remove the pale elliptical overlay.
 if(season.index===0){
  // 3D draws its own bare branches. 2D fallback covers the old green blobs.
  if(!window.Wild3D?.available&&o.plants&&o.cam){
   ctx.save();ctx.lineCap="round";let n=0;
   for(const p of o.plants){
    if(p.type!==2||n++>=40)continue;
    const at=project(o,p.x,p.y),r=clamp(p.r*(o.cameraZoom||1)*.5,9,38);
    if(at.x< -90||at.x>o.vw+90||at.y< -90||at.y>o.vh+90)continue;
    ctx.fillStyle="#33372f";ctx.beginPath();ctx.ellipse(at.x,at.y,r,r*.7,0,0,6.283);ctx.fill();
    for(let i=0;i<9;i++){
     const a=i*6.283/9+(p.phase||0),tx=at.x+Math.cos(a)*r*.8,ty=at.y-r*.7+Math.sin(a)*r*.3;
     ctx.strokeStyle=i%2?"#7c664b":"#a08b6b";ctx.lineWidth=Math.max(1.5,r*.08);
     ctx.beginPath();ctx.moveTo(at.x,at.y);ctx.lineTo(tx,ty);ctx.stroke();
     ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(at.x+(tx-at.x)*.6,at.y+(ty-at.y)*.6);
     ctx.lineTo(tx+r*.14,ty-r*.15);ctx.stroke();
    }
   }
   ctx.restore();
  }
  return;
 }
 if(!o.plants||!o.cam)return;
 const max=season.index===0?40:55;
 let drawn=0;
 ctx.save();
 for(const p of o.plants){
  if(p.type!==2||drawn>=max)continue;
  const at=project(o,p.x,p.y);
  if(at.x< -80||at.x>o.vw+80||at.y< -80||at.y>o.vh+80)continue;
  drawn++;
  const radius=clamp(p.r*(o.cameraZoom||1)*.45,9,38);
  ctx.globalAlpha=season.index===3?.44:season.index===0?.38:.28;
  ctx.fillStyle=season.leaf;
  for(let j=0;j<3;j++){
   const a=j*Math.PI*2/3+(p.phase||0);
   ctx.beginPath();ctx.ellipse(at.x+Math.cos(a)*radius*.7,
     at.y-5+Math.sin(a)*radius*.5,radius*.55,radius*.38,a*.2,0,Math.PI*2);ctx.fill();
  }
  if(season.index===1||season.index===3){
   ctx.fillStyle=season.detail;ctx.globalAlpha=season.index===1?.55:.40;
   for(let j=0;j<3;j++){
    const a=j*2.09+(p.phase||0);
    ctx.beginPath();ctx.arc(at.x+Math.cos(a)*radius*.9,
      at.y+Math.sin(a)*radius*.6,2.2,0,Math.PI*2);ctx.fill();
   }
  }
 }
 ctx.restore();
}
function drawGroundShadows(o,weather){
 if(!shadowEnabled)return;
 const light=o.lightProfile||{brightness:.9,warmth:0,hour:12};
 const clouds=cloudPatches(o.elapsed,weather,o);
 const daylight=clamp((light.brightness-.20)/.75,0,1);
 const shade=(weather==="CLEAR"?.075:weather==="CLOUDY"?.055:
  weather==="RAIN"?.025:.018)*daylight;
 ctx.save();
 for(const p of clouds){
  const shadow=project(o,p.x+(light.hour<12?68:-68),p.y+56);
  if(shade>.004&&shadow.x>-170&&shadow.x<o.vw+170&&shadow.y>-160&&shadow.y<o.vh+160){
   const r=p.r*(o.cameraZoom||1);
   ctx.save();ctx.translate(shadow.x,shadow.y);ctx.scale(1.38,.77);
   const g=ctx.createRadialGradient(0,0,r*.18,0,0,r*1.15);
   g.addColorStop(0,"rgba(10,23,34,"+shade+")");
   g.addColorStop(1,"rgba(10,23,34,0)");
   ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,r*1.15,0,Math.PI*2);ctx.fill();
   ctx.restore();
  }
 }
 // No sky cloud sprites: only faint moving ground shadows.
 ctx.restore();
}
let shadowEnabled=true;
let lastFrame=0,lastHudClock="",fallbackAnchor=0,fallbackTime=0;
function fallbackScene(ms,day,hud,dw,dh){
 // On low-end devices without WebGL, the normal 2D canvas is still playable.
 // HUD provides the existing game clock and weather without touching game state.
 const hour=Number((/·\s*(\d{2}):\d{2}/.exec(hud)||[])[1]||6);
 const key=day+":"+hour;
 if(key!==lastHudClock){
  lastHudClock=key;fallbackAnchor=ms;
  fallbackTime=(day-1)*85+((hour-6+24)%24)/24*85;
 }
 const estimated=fallbackTime+Math.max(0,ms-fallbackAnchor)/1000;
 const weather=hud.includes("雷雨")?"THUNDER":hud.includes("雨")?"RAIN":
  hud.includes("曇")?"CLOUDY":hud.includes("霧")?"FOG":
  hud.includes("風")?"WIND":"CLEAR";
 const brightness=hour>=19||hour<5?.12:hour>=10&&hour<15?1.16:
  hour>=9&&hour<17?.90:hour>=6&&hour<9?.54:.38;
 return {
  vw:dw,vh:dh,cam:{x:0,y:0},VIEW:{a:1,b:0,c:0,d:1},
  elapsed:estimated,weather,cameraZoom:1,plants:[],
  lightProfile:{brightness,warmth:hour>=17&&hour<19?.7:hour>=5&&hour<8?.5:0,hour}
 };
}
function frame(ms){
 requestAnimationFrame(frame);
 if(ms-lastFrame<32)return;
 lastFrame=ms;
 const sourceW=main.width,sourceH=main.height;
 if(sourceW!==layer.width||sourceH!==layer.height){
  layer.width=Math.max(1,sourceW);layer.height=Math.max(1,sourceH);
 }
 const dw=main.clientWidth||innerWidth,dh=main.clientHeight||innerHeight;
 const ratioX=layer.width/dw,ratioY=layer.height/dh;
 ctx.setTransform(1,0,0,1,0,0);
 ctx.clearRect(0,0,layer.width,layer.height);
 const hud=document.getElementById("day-label")?.textContent||"";
 const match=/DAY\s+(\d+)/.exec(hud);
 const day=match?Number(match[1]):1;
 const season=seasonOfDay(day);
 label.textContent=season.name+" "+season.month+"月";
 const menu=document.getElementById("menu");
 const show=!!match&&(!menu||menu.classList.contains("hidden"));
 layer.style.visibility=show?"visible":"hidden";
 if(!show)return;
 const opts=current||fallbackScene(ms,day,hud,dw,dh);
 const sc={...opts,vw:dw,vh:dh};
 ctx.setTransform(ratioX,0,0,ratioY,0,0);
 drawFoliage(sc,seasons[season.index]);
 drawGroundShadows(sc,opts.weather||"CLEAR");
 const glCanvas=document.getElementById("scene3d");
 const target=active3D?glCanvas:main;
 if(target&&target.style.filter!==seasons[season.index].filter)
  target.style.filter=seasons[season.index].filter;
}
requestAnimationFrame(frame);
window.WildSeasonClouds={
 seasonOfDay,cloudPatches,
 capture2D(options){current=options;active3D=false;},
 setShadowsEnabled(value){shadowEnabled=!!value;},
 get shadowsEnabled(){return shadowEnabled;},
 get hasRenderState(){return !!current},
 get season(){const d=Number((/DAY\s+(\d+)/.exec(document.getElementById("day-label")?.textContent||"")||[])[1])||1;return seasonOfDay(d)}
};
})();
