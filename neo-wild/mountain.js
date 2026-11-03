/* MOUNTAIN-FOOTHILL-V1: a continuous, walkable eastern foothill.
 * Deterministic terrain/obstacles, shared by 2D, WebGL and collision.
 * Original city coordinates, 8 ecology regions and SAVE_SCHEMA2 stay intact. */
(()=>{"use strict";
const WEST=8300,FOOTHILL_END=10100,SUMMIT_START=11800,EAST=13600,CITY_EDGE=8400;
const CAVE_START=13040,CAVE_END=13450,CAVE_HALF=110;
// Northern woodland is reachable directly from the city's north-east edge.
// Its open western entrance preserves the original eight city districts.
const northWood=(x,y)=>x>=CITY_EDGE&&x<=10800&&y>=850&&y<=2580;
const northTrail=x=>1670+210*Math.sin((x-CITY_EDGE)/650);
const zone=x=>x>=CAVE_START&&x<=CAVE_END?"cave":x>=SUMMIT_START?"summit":x>FOOTHILL_END?"slope":"foothill";
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const center=x=>3770+110*Math.sin((x-WEST)/355)+(x>FOOTHILL_END?95*smooth(clamp((x-FOOTHILL_END)/720,0,1))*Math.sin((x-FOOTHILL_END)/300):0);
const smooth=t=>t*t*(3-2*t);
// Continuous side valley: no loading gate, shared with collision and renderers.
const southReach=x=>720+430*smooth(clamp((x-10220)/520,0,1))*(1-smooth(clamp((x-11450)/430,0,1)));
const meadowTrail=x=>center(x)+clamp((x-10970)/380,0,1)*720;
const meadowAt=(x,y)=>x>=10620&&x<=11530&&y>center(x)+590&&y<center(x)+southReach(x)-35&&Math.abs(x-(10950+28*Math.sin((y-3820)/190)))>65;
const active=(x,y)=>northWood(x,y)||(x>=WEST&&x<=EAST&&y>=2600&&y<=5100);
function height(x,y){
 if(northWood(x,y))return Math.max(0,12*(x-CITY_EDGE)/(10800-CITY_EDGE)+5*Math.sin(x/180)*Math.cos(y/200));
 if(x<=WEST)return 0;
 const p=clamp((Math.min(x,FOOTHILL_END)-WEST)/(FOOTHILL_END-WEST),0,1);
 const lateral=clamp(Math.abs(y-center(x))/740,0,1);
 const old=90*smooth(p)+19*p*lateral+4*p*Math.sin(x/210)*Math.cos(y/245);
 if(x<=FOOTHILL_END)return old;
 const q=clamp((x-FOOTHILL_END)/(EAST-FOOTHILL_END),0,1);
 const raw=old+160*smooth(q)+14*q*lateral+7*q*Math.sin((x-FOOTHILL_END)/175)*Math.cos(y/300)
  +190*smooth(clamp((x-SUMMIT_START)/(EAST-SUMMIT_START),0,1));
 const blend=smooth(clamp((x-10380)/450,0,1))*(1-smooth(clamp((x-11450)/440,0,1)))*smooth(clamp((y-center(x)-440)/290,0,1));
 return raw-18*blend;
}
function trail(x){return center(x);}
// Spawn along the same traversable ridge and cave passage used by collision.
// Never create extra wildlife slots: the caller enforces the global/local caps.
function spawnCandidate(player,attempt=0,preyOnly=false,requestedZone=null){
 if(!player||!active(player.x,player.y))return null;
 const n=Math.max(0,attempt|0),distance=(preyOnly?165:255)+(n*47)%340;
 // Narrow cave: farthest legal floor slots first; no new population budget.
 if(requestedZone==="cave"){
  const slot=n%11,span=CAVE_END-CAVE_START-40,fraction=(slot+.5)/11;
  const reverse=player.x<(CAVE_START+CAVE_END)*.5;
  const x=CAVE_START+20+span*(reverse?1-fraction:fraction);
  return {x,y:center(x)+[0,-22,22,0,12,-12][Math.floor(n/11)%6]};
 }
 if(requestedZone==="slope"&&meadowAt(player.x,player.y)){
  const x=clamp(player.x+((n%7)-3)*58,10710,11440);
  const y=center(x)+clamp(730+(Math.floor(n/7)%5)*52,700,southReach(x)-75);
  return {x,y};
 }
 if(northWood(player.x,player.y)){
  const x=clamp(player.x+((n%7)-3)*91,CITY_EDGE+80,10730);
  return {x,y:clamp(northTrail(x)+((Math.floor(n/7)%7)-3)*110,960,2460)};
 }
 const direction=n%2?-1:1;
 const bounds=requestedZone==="cave"?[CAVE_START+50,CAVE_END-50]:
  requestedZone==="summit"?[SUMMIT_START+70,EAST-70]:
  requestedZone==="slope"?[FOOTHILL_END+70,SUMMIT_START-70]:
  requestedZone==="foothill"?[CITY_EDGE+70,FOOTHILL_END-70]:
  [CITY_EDGE+70,EAST-70];
 const x=clamp(player.x+direction*distance,bounds[0],bounds[1]);
 const band=x>=CAVE_START&&x<=CAVE_END?32:90;
 return {x,y:center(x)+((n%5)-2)*band/2};
}
const trees=[],rocks=[],ferns=[],pines=[],scree=[],heather=[],alpinePines=[],alpineRocks=[],alpineGrass=[],meadowGrass=[],caveStones=[],caveColumns=[];
// Deterministic northern trees and food plants participate in existing
// collision, 2D/3D rendering, and the wildlife population budget.
for(let x=8530;x<10720;x+=148)for(let j=0;j<9;j++){
 const y=980+j*166+Math.sin(x*.021+j*2.4)*42;
 if(Math.abs(y-northTrail(x))<155)continue;
 const n=Math.sin(x*.018+j*9.37)*128.7,frac=n-Math.floor(n);
 const px=x+(frac-.5)*55;
 if(frac>.24)trees.push({x:px,y,r:25+frac*16,z:height(px,y)});
 else rocks.push({x:px,y,r:15+frac*11,z:height(px,y)});
 if(j%2===0)ferns.push({x:px+45,y:y+38,r:14+frac*7,z:height(px+45,y+38)});
}
const cave=Object.freeze({start:CAVE_START,end:CAVE_END,halfWidth:CAVE_HALF});
// Visual-only cave mineral seams and wall fragments, shared by 2D and 3D.
const caveSeams=[],caveWallMarks=[];
for(let x=CAVE_START+44,i=0;x<CAVE_END-28;x+=46,i++){
 const y=center(x)+Math.sin(x*.043)*24;
 caveSeams.push({x,y,rx:13+(i%3)*4,ry:4+(i%2),z:height(x,y)});
}
for(let x=CAVE_START+36,i=0;x<CAVE_END-18;x+=67,i++)for(const side of [-1,1]){
 const y=center(x)+side*(CAVE_HALF+23);
 caveWallMarks.push({x,y,r:7+(i%3)*2,z:height(x,y)});
}
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
for(let x=10680;x<11470;x+=82)for(let j=0;j<5;j++){
 const y=center(x)+690+j*69+Math.sin(x*.027+j*2.1)*14;
 if(meadowAt(x,y))meadowGrass.push({x:x+Math.sin(x*.011+j)*16,y,r:11+j%3*3,z:height(x,y)});
}
// Upper mountain vegetation and cave walls are deterministic; no save migration.
for(let x=11930;x<13000;x+=176){
 const cy=center(x);
 for(const side of [-1,1])for(let j=0;j<3;j++){
  const y=cy+side*(290+j*126),n=Math.sin(x*.021+side*9.1+j*6.8);
  const px=x+n*37;
  const obj={x:px,y:y+n*22,r:25+j*3,z:height(px,y)};
  if(j===2||n>.18)alpinePines.push(obj);else alpineRocks.push(obj);
 }
}
for(let x=11910;x<13500;x+=112)for(const side of [-1,1]){
 const y=center(x)+side*(x>=CAVE_START&&x<=CAVE_END?55:220);
 alpineGrass.push({x:x+Math.sin(x*.013)*12,y,r:13,z:height(x,y)});
}
for(let x=CAVE_START+25;x<CAVE_END-15;x+=83)for(const side of [-1,1]){
 const y=center(x)+side*153;
 caveStones.push({x,y,r:40,z:height(x,y)});
}
// Alternating stone pillars narrow the cave edges but leave a safe central lane.
// The same deterministic objects drive collision, visibility and both renderers.
for(const [x,side] of [[13105,-1],[13210,1],[13320,-1]]){
 const y=center(x)+side*72;
 caveColumns.push({x,y,r:17,z:height(x,y)});
}
// The marked footpath crosses the ravine only on the existing bridge. Keep
// its actual walking corridor clear of previously generated pine/stone props.
for(const group of [pines,scree]){
 for(let i=group.length-1;i>=0;i--){
  const p=group[i];
  if(p.x>=10960&&p.x<=11410&&Math.abs(p.y-meadowTrail(p.x))<p.r+43)group.splice(i,1);
 }
}
 function blocked(x,y,r=0,sourceTree=null){
 if(x<CITY_EDGE)return false;
 if(northWood(x,y)){
  if(y<920+r||y>2510-r||x>10720-r)return true;
  for(const p of [...trees,...rocks])if(p!==sourceTree&&Math.hypot(x-p.x,y-p.y)<p.r+r)return true;
  return false;
 }
 if(y<center(x)-720+r||y>center(x)+southReach(x)-r)return true;
 if(x>=CAVE_START&&x<=CAVE_END&&Math.abs(y-center(x))>CAVE_HALF-r)return true;
  // Only the planked bridge is passable; the creek banks block land animals.
  if(Math.abs(x-creek.xAt(y))<creek.halfWidth+r*.65&&
     Math.abs(y-creek.bridgeY)>creek.bridgeHalf-Math.min(26,r*.45))return true;
 if(Math.abs(x-gorge.xAt(y))<gorge.halfWidth+r*.65&&Math.abs(y-gorge.bridgeY)>gorge.bridgeHalf-Math.min(26,r*.45))return true;
 for(const hut of [...ruins,...ridgeHuts])if(x>hut.x-r&&x<hut.x+hut.w+r&&y>hut.y-r&&y<hut.y+hut.h+r)return true;
 for(const p of [...pines,...scree,...alpinePines,...alpineRocks,...caveStones,...caveColumns])if(p!==sourceTree&&Math.hypot(x-p.x,y-p.y)<p.r+r)return true;
 for(const p of trees)if(p!==sourceTree&&Math.abs(x-p.x)<p.r+r&&Math.abs(y-p.y)<p.r+r&&Math.hypot(x-p.x,y-p.y)<p.r+r)return true;
 for(const p of rocks)if(Math.abs(x-p.x)<p.r+r&&Math.abs(y-p.y)<p.r+r&&Math.hypot(x-p.x,y-p.y)<p.r+r)return true;
 return false;
}
// Wildlife slots are shared with the existing world cap, never added on top.
 // Mountain prey-only replenishment must not draw canal frogs/hippos from biome 7.

// Mountains share opaque geometry with combat, stealth, prey and projectiles.
// Streams and ravines remain transparent; cave walls, rock, trees and ruins do not.
function sightBlocked(a,b){
 if(!a||!b)return false;
 const minX=Math.min(a.x,b.x),maxX=Math.max(a.x,b.x);
 if(maxX<CITY_EDGE||minX>EAST)return false;
 const minY=Math.min(a.y,b.y),maxY=Math.max(a.y,b.y);
 const dx=b.x-a.x,dy=b.y-a.y,len2=dx*dx+dy*dy;
 const hitsCircle=p=>{
  const rr=p.r*.90;
  if(p.x+rr<minX||p.x-rr>maxX||p.y+rr<minY||p.y-rr>maxY)return false;
  const t=len2>1e-9?clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/len2,0,1):0;
  const ox=a.x+dx*t-p.x,oy=a.y+dy*t-p.y;
  return ox*ox+oy*oy<rr*rr;
 };
 const hitsRect=h=>{
  if(maxX<h.x||minX>h.x+h.w||maxY<h.y||minY>h.y+h.h)return false;
  let lo=0,hi=1;
  for(const [p,q] of [[-dx,a.x-h.x],[dx,h.x+h.w-a.x],[-dy,a.y-h.y],[dy,h.y+h.h-a.y]]){
   if(Math.abs(p)<1e-9){if(q<0)return false;}
   else{const t=q/p;if(p<0)lo=Math.max(lo,t);else hi=Math.min(hi,t);}
   if(lo>hi)return false;
  }
  return lo<=hi;
 };
 for(const h of [...ruins,...ridgeHuts])if(hitsRect(h))return true;
 for(const p of [...trees,...rocks,...pines,...scree,...alpinePines,...alpineRocks,...caveStones,...caveColumns])if(hitsCircle(p))return true;
 if(maxX>=CAVE_START&&minX<=CAVE_END){
  const left=Math.max(minX,CAVE_START),right=Math.min(maxX,CAVE_END);
  if(Math.abs(dx)<1e-9){
   if(a.x>=CAVE_START&&a.x<=CAVE_END&&(minY<center(a.x)-CAVE_HALF+4||maxY>center(a.x)+CAVE_HALF-4))return true;
  }else{
   const n=Math.max(1,Math.ceil((right-left)/24));
   for(let i=0;i<=n;i++){
    const x=left+(right-left)*i/n,t=(x-a.x)/dx,y=a.y+dy*t;
    if(t>=0&&t<=1&&Math.abs(y-center(x))>CAVE_HALF-4)return true;
   }
  }
 }
 return false;
}
function choose(random=Math.random(),x=9000,y=center(x),preyOnly=false,weather="CLEAR"){
 const entries=meadowAt(x,y)?
 [["serow",30],["mountainGoat",26],["deer",10],["rabbit",14],["boar",9],["wildFox",7],["macaque",4]]:zone(x)==="cave"?
 [["rat",30],["rabbit",30],["weasel",17],["snake",11],["wildFox",8],["raccoonDog",4]]:x>=SUMMIT_START?
 [["deer",19],["serow",14],["mountainGoat",13],["wildFox",8],["rabbit",17],["boar",10],["weasel",6],["raccoonDog",6],["crow",3],["macaque",7],["chimpanzee",4]]:x>FOOTHILL_END?
 [["deer",15],["serow",10],["mountainGoat",8],["wildFox",8],["rabbit",12],["boar",12],["weasel",6],["raccoonDog",6],["crow",5],["macaque",10],["chimpanzee",8]]:
 [["deer",22],["wildFox",12],["rabbit",21],["boar",11],["weasel",8],["raccoonDog",9],["crow",5],["macaque",12]];
 const rainy=weather==="RAIN"||weather==="THUNDER";
 const pool=entries.filter(([type])=>!preyOnly||["rat","deer","rabbit","crow","serow","mountainGoat"].includes(type))
  .map(([type,w])=>[type,rainy?w*(type==="crow"?.32:type==="macaque"?.58:type==="chimpanzee"?.53:type==="deer"?.72:type==="rabbit"?.86:type==="boar"?1.16:1):w]);
 const total=pool.reduce((sum,item)=>sum+item[1],0);
 let roll=clamp(Number.isFinite(random)?random:0,0,.999999999)*total;
 for(const [type,w] of pool){roll-=w;if(roll<0)return type;}
 return pool[pool.length-1]?.[0]||"rabbit";
}
function draw2D(ctx,visible){
 ctx.fillStyle="#344f3b";ctx.fillRect(CITY_EDGE,0,EAST-CITY_EDGE,6000);
 // Northern woodland: walkable trail, deciduous canopy and real obstacles.
 ctx.fillStyle="#47694c";ctx.fillRect(CITY_EDGE,850,2400,1730);
 ctx.strokeStyle="#8b8064";ctx.lineWidth=115;ctx.beginPath();
 for(let x=CITY_EDGE;x<=10780;x+=60){const y=northTrail(x);if(x===CITY_EDGE)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();
 ctx.strokeStyle="#c0b18b";ctx.lineWidth=4;ctx.stroke();
 // Continuous pass from the former city edge; rocky margins are impassable.
 for(let x=WEST;x<EAST;x+=95){
  const x2=Math.min(EAST,x+95),cy=center(x),cy2=center(x2),z=height(x,cy);
  if(!visible(x,cy,1050))continue;
  const col=x>=SUMMIT_START?(x>=CAVE_START?"#515950":"#67746a"):x>FOOTHILL_END?(z>185?"#5c6c61":"#3f5c4c"):z<25?"#52714b":z<62?"#4a6647":"#526b53";
  ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x,cy-720);ctx.lineTo(x2,cy2-720);ctx.lineTo(x2,cy2+southReach(x2));ctx.lineTo(x,cy+southReach(x));ctx.closePath();ctx.fill();
  ctx.fillStyle="#887d5c";ctx.beginPath();ctx.moveTo(x,cy-130);ctx.lineTo(x2,cy2-130);ctx.lineTo(x2,cy2+130);ctx.lineTo(x,cy+130);ctx.closePath();ctx.fill();
  ctx.strokeStyle="#a7a58a88";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,cy-135);ctx.lineTo(x2,cy2-135);ctx.moveTo(x,cy+135);ctx.lineTo(x2,cy2+135);ctx.stroke();
  for(const sign of [-1,1]){
   ctx.fillStyle="#777b6d";ctx.beginPath();ctx.moveTo(x,cy+(sign<0?-720:southReach(x)));ctx.lineTo(x2,cy2+(sign<0?-720:southReach(x2)));ctx.lineTo(x2,cy2+(sign<0?-815:southReach(x2)+95));ctx.lineTo(x,cy+(sign<0?-815:southReach(x)+95));ctx.closePath();ctx.fill();
   ctx.strokeStyle="#b2b2a04d";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,cy+(sign<0?-720:southReach(x)));ctx.lineTo(x2,cy2+(sign<0?-720:southReach(x2)));ctx.stroke();
  }
 }
 // The walkable meadow branch is a visible path from the original ridge.
 ctx.strokeStyle="#b5a779";ctx.lineWidth=90;ctx.beginPath();
 for(let x=10380;x<=11360;x+=45){const y=meadowTrail(x);if(x===10380)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();
 ctx.strokeStyle="#dbd1a4";ctx.lineWidth=4;ctx.stroke();
 for(const g of meadowGrass){if(!visible(g.x,g.y,45))continue;
  ctx.strokeStyle="#91ae6d";ctx.lineWidth=2.6;
  for(let k=-2;k<=2;k++){ctx.beginPath();ctx.moveTo(g.x,g.y);ctx.lineTo(g.x+k*3,g.y-13-Math.abs(k)*2);ctx.stroke();}
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
  // Cave floor and stone flanks use the same centerline as blocked().
  ctx.fillStyle="#343c39";ctx.beginPath();
  for(let x=CAVE_START;x<=CAVE_END;x+=20){const y=center(x)-CAVE_HALF;if(x===CAVE_START)ctx.moveTo(x,y);else ctx.lineTo(x,y);}
  for(let x=CAVE_END;x>=CAVE_START;x-=20)ctx.lineTo(x,center(x)+CAVE_HALF);
  ctx.closePath();ctx.fill();
  ctx.strokeStyle="#8b9087";ctx.lineWidth=13;
  for(const side of [-1,1]){ctx.beginPath();for(let x=CAVE_START;x<=CAVE_END;x+=20){const y=center(x)+side*CAVE_HALF;if(x===CAVE_START)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();}
  ctx.fillStyle="#9d9f8b";ctx.beginPath();ctx.ellipse(CAVE_START,center(CAVE_START),14,CAVE_HALF+22,0,0,Math.PI*2);ctx.stroke();
  // The dark damp floor and the three solid pillars match the 3D cave mesh.
  for(let x=CAVE_START+50;x<CAVE_END-20;x+=82){
   if(!visible(x,center(x),170))continue;
   ctx.fillStyle="#48544e";ctx.fillRect(x-7,center(x)-52,14,104);
  }
  for(const p of caveSeams){
   if(!visible(p.x,p.y,55))continue;
   ctx.fillStyle="#61736b";ctx.beginPath();ctx.ellipse(p.x,p.y,p.rx,p.ry,-.12,0,Math.PI*2);ctx.fill();
   ctx.strokeStyle="#92a59a";ctx.lineWidth=1.3;ctx.beginPath();
   ctx.moveTo(p.x-p.rx*.72,p.y+1);ctx.lineTo(p.x+p.rx*.65,p.y-1);ctx.stroke();
  }
  for(const p of caveWallMarks){
   if(!visible(p.x,p.y,40))continue;
   ctx.fillStyle="#828c81";ctx.beginPath();ctx.moveTo(p.x-p.r,p.y+p.r*.5);
   ctx.lineTo(p.x,p.y-p.r);ctx.lineTo(p.x+p.r,p.y+p.r*.6);ctx.closePath();ctx.fill();
  }
  for(const gateX of [CAVE_START,CAVE_END]){
   if(!visible(gateX,center(gateX),160))continue;
   ctx.strokeStyle="#c2bba0";ctx.lineWidth=5;ctx.beginPath();
   ctx.ellipse(gateX,center(gateX),14,CAVE_HALF+14,0,0,Math.PI*2);ctx.stroke();
  }
  for(const p of caveColumns){
   if(!visible(p.x,p.y,85))continue;
   ctx.fillStyle="#202b29";ctx.beginPath();ctx.ellipse(p.x+5,p.y+7,p.r*1.15,p.r*.70,0,0,Math.PI*2);ctx.fill();
   ctx.fillStyle="#7a847c";ctx.beginPath();ctx.ellipse(p.x,p.y,p.r,p.r*.94,0,0,Math.PI*2);ctx.fill();
   ctx.strokeStyle="#b0b8a8";ctx.lineWidth=2;ctx.stroke();
  }
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
  for(const a of alpineGrass){if(!visible(a.x,a.y,48))continue;
   ctx.strokeStyle="#899e79";ctx.lineWidth=2.3;
   for(let k=-3;k<=3;k++){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(a.x+k*4,a.y-13-Math.abs(k)*2);ctx.stroke();}
  }
  for(const p of [...alpineRocks,...caveStones]){if(!visible(p.x,p.y,90))continue;
   ctx.fillStyle="#737b75";ctx.beginPath();ctx.ellipse(p.x,p.y,p.r,p.r*.72,0,0,Math.PI*2);ctx.fill();
   ctx.strokeStyle="#a3a89d";ctx.lineWidth=2;ctx.stroke();
  }
  for(const t of alpinePines){if(!visible(t.x,t.y,115))continue;
   ctx.fillStyle="#5b594a";ctx.fillRect(t.x-5,t.y-6,10,22);ctx.fillStyle="#365a50";
   for(let k=0;k<3;k++){const rr=t.r*(1.15-k*.19),yy=t.y-17-k*16;
    ctx.beginPath();ctx.moveTo(t.x,yy-rr);ctx.lineTo(t.x-rr,yy+rr*.55);ctx.lineTo(t.x+rr,yy+rr*.55);ctx.closePath();ctx.fill();}
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
// Renewable food sites are the same visible ferns/heather in both renderers.
const forageSites=Object.freeze([...ferns,...heather,...alpineGrass,...meadowGrass]);
const api=Object.freeze({WEST,FOOTHILL_END,SUMMIT_START,EAST,CITY_EDGE,center,trail,height,active,northWood,northTrail,blocked,sightBlocked,zone,southReach,meadowTrail,meadowAt,spawnCandidate,choose,forageSites,meadowGrass,trees,rocks,ferns,pines,scree,heather,alpinePines,alpineRocks,alpineGrass,caveStones,caveColumns,caveSeams,caveWallMarks,cave,ruins,ridgeHuts,creek,gorge,draw2D});
window.WildMountain=api;
})();