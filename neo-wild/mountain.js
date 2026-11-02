/* MOUNTAIN-FOOTHILL-V1: a continuous, walkable eastern foothill.
 * Deterministic terrain/obstacles, shared by 2D, WebGL and collision.
 * Original city coordinates, 8 ecology regions and SAVE_SCHEMA2 stay intact. */
(()=>{"use strict";
const WEST=8300,EAST=10100,CITY_EDGE=8400;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const center=x=>3770+110*Math.sin((x-WEST)/355);
const smooth=t=>t*t*(3-2*t);
const active=(x,y)=>x>=WEST&&x<=EAST&&y>=2600&&y<=5100;
function height(x,y){
 if(x<=WEST)return 0;
 const p=clamp((x-WEST)/(EAST-WEST),0,1);
 const lateral=clamp(Math.abs(y-center(x))/740,0,1);
 return (90*smooth(p)+19*p*lateral+4*p*Math.sin(x/210)*Math.cos(y/245));
}
function trail(x){return center(x);}
const trees=[],rocks=[];
for(let x=8515;x<10060;x+=158){
 const c=center(x);
 for(let j=-4;j<=4;j++){
  if(j===0)continue;
  const n=Math.sin(x*.031+j*13.7)*143.31,frac=n-Math.floor(n);
  const y=c+j*157+(frac-.5)*72;
  if(Math.abs(y-c)<205||Math.abs(y-c)>680)continue;
  if(frac>.21)trees.push({x:x+(frac-.5)*64,y,r:22+frac*12,z:height(x,y)});
  else rocks.push({x:x+(frac-.5)*55,y,r:22+frac*14,z:height(x,y)});
 }
}
function blocked(x,y,r=0){
 if(x<CITY_EDGE)return false;
 if(y<center(x)-720+r||y>center(x)+720-r)return true;
 for(const p of trees)if(Math.abs(x-p.x)<p.r+r&&Math.abs(y-p.y)<p.r+r&&Math.hypot(x-p.x,y-p.y)<p.r+r)return true;
 for(const p of rocks)if(Math.abs(x-p.x)<p.r+r&&Math.abs(y-p.y)<p.r+r&&Math.hypot(x-p.x,y-p.y)<p.r+r)return true;
 return false;
}
function choose(random=Math.random()){
 const entries=[["deer",24],["wildFox",15],["rabbit",24],["boar",12],["weasel",9],["raccoonDog",10],["crow",6]];
 let roll=random*100;
 for(const [type,w] of entries){roll-=w;if(roll<0)return type;}
 return "rabbit";
}
function draw2D(ctx,visible){
 ctx.fillStyle="#344f3b";ctx.fillRect(CITY_EDGE,0,EAST-CITY_EDGE,6000);
 // Continuous pass from the former city edge; rocky margins are impassable.
 for(let x=WEST;x<EAST;x+=95){
  const x2=Math.min(EAST,x+95),cy=center(x),cy2=center(x2),z=height(x,cy);
  if(!visible(x,cy,1050))continue;
  const col=z<25?"#52714b":z<62?"#4a6647":"#526b53";
  ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x,cy-720);ctx.lineTo(x2,cy2-720);ctx.lineTo(x2,cy2+720);ctx.lineTo(x,cy+720);ctx.closePath();ctx.fill();
  ctx.fillStyle="#887d5c";ctx.beginPath();ctx.moveTo(x,cy-130);ctx.lineTo(x2,cy2-130);ctx.lineTo(x2,cy2+130);ctx.lineTo(x,cy+130);ctx.closePath();ctx.fill();
  ctx.strokeStyle="#a7a58a88";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,cy-135);ctx.lineTo(x2,cy2-135);ctx.moveTo(x,cy+135);ctx.lineTo(x2,cy2+135);ctx.stroke();
  for(const sign of [-1,1]){
   ctx.fillStyle="#777b6d";ctx.beginPath();ctx.moveTo(x,cy+sign*720);ctx.lineTo(x2,cy2+sign*720);ctx.lineTo(x2,cy2+sign*815);ctx.lineTo(x,cy+sign*815);ctx.closePath();ctx.fill();
   ctx.strokeStyle="#b2b2a04d";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,cy+sign*720);ctx.lineTo(x2,cy2+sign*720);ctx.stroke();
  }
 }
 for(const p of rocks){if(!visible(p.x,p.y,75))continue;ctx.fillStyle="#4c5c55";ctx.beginPath();ctx.ellipse(p.x,p.y,p.r,p.r*.72,.4,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#a1a99a";ctx.lineWidth=2;ctx.stroke();}
 for(const t of trees){if(!visible(t.x,t.y,95))continue;
  ctx.fillStyle="#1e3b2a8a";ctx.beginPath();ctx.ellipse(t.x+7,t.y+11,t.r*1.4,t.r*.6,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#6d5d40";ctx.fillRect(t.x-5,t.y-9,10,22);
  ctx.fillStyle="#315f40";for(const [dx,dy] of [[-15,-16],[16,-16],[0,-30]]){ctx.beginPath();ctx.ellipse(t.x+dx,t.y+dy,t.r*.84,t.r*.7,0,0,Math.PI*2);ctx.fill();}
 }
}
const api=Object.freeze({WEST,EAST,CITY_EDGE,center,trail,height,active,blocked,choose,trees,rocks,draw2D});
window.WildMountain=api;
})();