/* MOUNTAIN-FOOTHILL-V1: a continuous, walkable eastern foothill.
 * Deterministic terrain/obstacles, shared by 2D, WebGL and collision.
 * Original city coordinates, 8 ecology regions and SAVE_SCHEMA2 stay intact. */
(()=>{"use strict";
const WEST=8300,FOOTHILL_END=10100,EAST=11800,CITY_EDGE=8400;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const center=x=>3770+110*Math.sin((x-WEST)/355)+(x>FOOTHILL_END?95*smooth(clamp((x-FOOTHILL_END)/720,0,1))*Math.sin((x-FOOTHILL_END)/300):0);
const smooth=t=>t*t*(3-2*t);
const active=(x,y)=>x>=WEST&&x<=EAST&&y>=2600&&y<=5100;
function height(x,y){
 if(x<=WEST)return 0;
 const p=clamp((Math.min(x,FOOTHILL_END)-WEST)/(FOOTHILL_END-WEST),0,1);
 const lateral=clamp(Math.abs(y-center(x))/740,0,1);
 const old=90*smooth(p)+19*p*lateral+4*p*Math.sin(x/210)*Math.cos(y/245);
 if(x<=FOOTHILL_END)return old;
 const q=clamp((x-FOOTHILL_END)/(EAST-FOOTHILL_END),0,1);
 return old+160*smooth(q)+14*q*lateral+7*q*Math.sin((x-FOOTHILL_END)/175)*Math.cos(y/300);
}
function trail(x){return center(x);}
const trees=[],rocks=[],ferns=[],pines=[],scree=[],heather=[];
 // This stream has a physical crossing; the world never loads a new stage.
 const creek=Object.freeze({xAt:y=>9250+35*Math.sin((y-3800)/180),bridgeY:center(9250),halfWidth:31,bridgeHalf:170});
const ruins=[
 {x:8545,y:center(8545)-370,w:112,h:84},
 {x:8720,y:center(8720)+340,w:98,h:110}
];
const gorge=Object.freeze({xAt:y=>10950+28*Math.sin((y-3820)/190),bridgeY:center(10950),halfWidth:44,bridgeHalf:160});
const ridgeHuts=[{x:10480,y:center(10480)-440,w:88,h:82}];
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
for(let x=8600;x<10030;x+=210){
  const c=center(x);
  for(const side of [-1,1])for(let j=0;j<3;j++){
   const y=c+side*(270+j*130),n=Math.sin(x*.017+j*4.2+side*13);
   ferns.push({x:x+n*39,y:y+Math.cos(x*.009+j*3)*28,r:13+j*3,z:height(x+n*39,y)});
  }
 }
for(let x=10220;x<11770;x+=177){
 const c=center(x);
 for(const side of [-1,1])for(let j=0;j<3;j++){
  const n=Math.sin(x*.029+side*8.1+j*12.3)*121.7,frac=n-Math.floor(n);
  const px=x+(frac-.5)*48,py=c+side*(290+j*127)+(frac-.5)*36;
  if(frac>.26)pines.push({x:px,y:py,r:21+frac*11,z:height(px,py)});
  else scree.push({x:px,y:py,r:23+frac*17,z:height(px,py)});
 }
}
for(let x=10270;x<11750;x+=165)for(const side of [-1,1])for(let j=0;j<2;j++){
 const y=center(x)+side*(235+j*160);
 heather.push({x:x+Math.sin(x*.017+j)*26,y,r:13+j*4,z:height(x,y)});
}
 function blocked(x,y,r=0){
 if(x<CITY_EDGE)return false;
 if(y<center(x)-720+r||y>center(x)+720-r)return true;
  // Only the planked bridge is passable; the creek banks block land animals.
  if(Math.abs(x-creek.xAt(y))<creek.halfWidth+r*.65&&
     Math.abs(y-creek.bridgeY)>creek.bridgeHalf-Math.min(26,r*.45))return true;
 if(Math.abs(x-gorge.xAt(y))<gorge.halfWidth+r*.65&&Math.abs(y-gorge.bridgeY)>gorge.bridgeHalf-Math.min(26,r*.45))return true;
 for(const hut of [...ruins,...ridgeHuts])if(x>hut.x-r&&x<hut.x+hut.w+r&&y>hut.y-r&&y<hut.y+hut.h+r)return true;
 for(const p of [...pines,...scree])if(Math.hypot(x-p.x,y-p.y)<p.r+r)return true;
 for(const p of trees)if(Math.abs(x-p.x)<p.r+r&&Math.abs(y-p.y)<p.r+r&&Math.hypot(x-p.x,y-p.y)<p.r+r)return true;
 for(const p of rocks)if(Math.abs(x-p.x)<p.r+r&&Math.abs(y-p.y)<p.r+r&&Math.hypot(x-p.x,y-p.y)<p.r+r)return true;
 return false;
}
function choose(random=Math.random(),x=9000){
 const entries=x>FOOTHILL_END?
 [["deer",29],["wildFox",12],["rabbit",18],["boar",17],["weasel",7],["raccoonDog",9],["crow",8]]:
 [["deer",24],["wildFox",15],["rabbit",24],["boar",12],["weasel",9],["raccoonDog",10],["crow",6]];
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
  const col=x>FOOTHILL_END?(z>185?"#5c6c61":"#3f5c4c"):z<25?"#52714b":z<62?"#4a6647":"#526b53";
  ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x,cy-720);ctx.lineTo(x2,cy2-720);ctx.lineTo(x2,cy2+720);ctx.lineTo(x,cy+720);ctx.closePath();ctx.fill();
  ctx.fillStyle="#887d5c";ctx.beginPath();ctx.moveTo(x,cy-130);ctx.lineTo(x2,cy2-130);ctx.lineTo(x2,cy2+130);ctx.lineTo(x,cy+130);ctx.closePath();ctx.fill();
  ctx.strokeStyle="#a7a58a88";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,cy-135);ctx.lineTo(x2,cy2-135);ctx.moveTo(x,cy+135);ctx.lineTo(x2,cy2+135);ctx.stroke();
  for(const sign of [-1,1]){
   ctx.fillStyle="#777b6d";ctx.beginPath();ctx.moveTo(x,cy+sign*720);ctx.lineTo(x2,cy2+sign*720);ctx.lineTo(x2,cy2+sign*815);ctx.lineTo(x,cy+sign*815);ctx.closePath();ctx.fill();
   ctx.strokeStyle="#b2b2a04d";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,cy+sign*720);ctx.lineTo(x2,cy2+sign*720);ctx.stroke();
  }
 }
 // Stream and bridge occupy exactly the world-space collision crossing.
  for(const [width,col] of [[94,"#5a665d"],[68,"#294f57"],[55,"#377c83"]]){
   ctx.beginPath();
   for(let y=3000;y<=4650;y+=45){const x=creek.xAt(y);if(y===3000)ctx.moveTo(x,y);else ctx.lineTo(x,y);}
   ctx.lineWidth=width;ctx.strokeStyle=col;ctx.stroke();
  }
  const bx=creek.xAt(creek.bridgeY),by=creek.bridgeY;
  ctx.fillStyle="#665d48";ctx.fillRect(bx-70,by-168,140,336);
  ctx.fillStyle="#a99a73";
  for(let x=bx-64;x<bx+70;x+=18)ctx.fillRect(x,by-165,13,330);
  ctx.strokeStyle="#b6aa87";ctx.lineWidth=7;
  for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(bx-71,by+side*173);ctx.lineTo(bx+71,by+side*173);ctx.stroke();}
  // A genuine second ravine crossing with collision-backed timber bridge.
  for(const [width,col] of [[126,"#6b7068"],[88,"#333e40"],[55,"#39707b"]]){
   ctx.beginPath();for(let y=3000;y<=4650;y+=45){const x=gorge.xAt(y);if(y===3000)ctx.moveTo(x,y);else ctx.lineTo(x,y);}
   ctx.lineWidth=width;ctx.strokeStyle=col;ctx.stroke();
  }
  const gx=gorge.xAt(gorge.bridgeY),gy=gorge.bridgeY;
  ctx.fillStyle="#5e5747";ctx.fillRect(gx-82,gy-158,164,316);
  ctx.fillStyle="#b3a17c";for(let x=gx-76;x<gx+79;x+=16)ctx.fillRect(x,gy-154,11,308);
  ctx.strokeStyle="#d1c4a0";ctx.lineWidth=6;
  for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(gx-85,gy+side*164);ctx.lineTo(gx+85,gy+side*164);ctx.stroke();}
  for(const hut of [...ruins,...ridgeHuts]){
  if(!visible(hut.x+hut.w/2,hut.y+hut.h/2,160))continue;
  ctx.fillStyle="#776f5c";ctx.fillRect(hut.x,hut.y,hut.w,hut.h);
  ctx.fillStyle="#3b5544";ctx.fillRect(hut.x+12,hut.y+12,hut.w-24,hut.h-24);
  ctx.strokeStyle="#b0a68a";ctx.lineWidth=8;ctx.strokeRect(hut.x+4,hut.y+4,hut.w-8,hut.h-8);
  ctx.fillStyle="#426d4a";ctx.beginPath();ctx.ellipse(hut.x+hut.w*.78,hut.y+7,23,11,0,0,Math.PI*2);ctx.fill();
 }
 for(const f of ferns){
   if(!visible(f.x,f.y,35))continue;
   ctx.strokeStyle="#42764c";ctx.lineCap="round";ctx.lineWidth=2.8;
   for(let k=-2;k<=2;k++){
    ctx.beginPath();ctx.moveTo(f.x,f.y);
    ctx.lineTo(f.x+k*f.r*.55,f.y-11-Math.abs(k)*3);
    ctx.lineTo(f.x+k*f.r*.72,f.y-17-Math.abs(k)*2);
    ctx.stroke();
   }
  }
  for(const h of heather){if(!visible(h.x,h.y,55))continue;
   ctx.strokeStyle="#7da074";ctx.lineWidth=2.2;
   for(let k=-3;k<=3;k++){ctx.beginPath();ctx.moveTo(h.x,h.y);ctx.lineTo(h.x+k*4,h.y-11-Math.abs(k)*2);ctx.stroke();}
  }
  for(const p of scree){if(!visible(p.x,p.y,85))continue;
   ctx.fillStyle="#737a74";ctx.beginPath();ctx.moveTo(p.x-p.r,p.y+6);ctx.lineTo(p.x-p.r*.35,p.y-p.r*.65);ctx.lineTo(p.x+p.r*.4,p.y-p.r*.8);ctx.lineTo(p.x+p.r,p.y+5);ctx.closePath();ctx.fill();
   ctx.strokeStyle="#a9aea2";ctx.lineWidth=2;ctx.stroke();
  }
  for(const t of pines){if(!visible(t.x,t.y,110))continue;
   ctx.fillStyle="#675d49";ctx.fillRect(t.x-5,t.y-8,10,22);ctx.fillStyle="#2d5547";
   for(let k=0;k<3;k++){const rr=t.r*(1.1-k*.17),yy=t.y-16-k*17;
    ctx.beginPath();ctx.moveTo(t.x,yy-rr*1.2);ctx.lineTo(t.x-rr,yy+rr*.45);ctx.lineTo(t.x+rr,yy+rr*.45);ctx.closePath();ctx.fill();}
  }
  for(const p of rocks){if(!visible(p.x,p.y,75))continue;ctx.fillStyle="#4c5c55";ctx.beginPath();ctx.ellipse(p.x,p.y,p.r,p.r*.72,.4,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#a1a99a";ctx.lineWidth=2;ctx.stroke();}
 for(const t of trees){if(!visible(t.x,t.y,95))continue;
  ctx.fillStyle="#1e3b2a8a";ctx.beginPath();ctx.ellipse(t.x+7,t.y+11,t.r*1.4,t.r*.6,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#6d5d40";ctx.fillRect(t.x-5,t.y-9,10,22);
  ctx.fillStyle="#315f40";for(const [dx,dy] of [[-15,-16],[16,-16],[0,-30]]){ctx.beginPath();ctx.ellipse(t.x+dx,t.y+dy,t.r*.84,t.r*.7,0,0,Math.PI*2);ctx.fill();}
 }
}
const api=Object.freeze({WEST,FOOTHILL_END,EAST,CITY_EDGE,center,trail,height,active,blocked,choose,trees,rocks,ferns,pines,scree,heather,ruins,ridgeHuts,creek,gorge,draw2D});
window.WildMountain=api;
})();