/* WILD RECLAIM | eastern passage: city -> suburb -> primeval woods -> pass -> ravine -> spring -> snow -> cave.
 * All coordinates are existing connected world XY; no teleports, asset generation or save keys here.
 * Exploration state and transactional rewards belong to game.js's current SAVE_SCHEMA2 snapshot. */
((global)=>{
 "use strict";
 const M=global.WildMountain;
 const STOPS=Object.freeze([
  {id:"citygate",name:"旧市街の東門",area:"廃市街",x:8360,y:1680,food:"berries",amount:34,score:90,info:"崩れた街道を抜け、森の入口へ",danger:"低：周辺の野犬に注意"},
  {id:"outskirts",name:"草に沈む郊外",area:"郊外",x:8700,y:1764,food:"berries",amount:40,score:110,info:"廃車と草地の先が原生林",danger:"低：隠れ場所が多い"},
  {id:"northwood",name:"北の原生林",area:"原生林",x:9320,y:1877,food:"berries",amount:48,score:150,info:"獣道と森の動物をたどって峠へ",danger:"中：獣に気づかれやすい"},
  {id:"pass",name:"峠の獣道",area:"山道",x:10740,y:2590,food:"meat",amount:35,score:190,info:"峠から渓谷の橋を目指す",danger:"中：崖際は足場が狭い"},
  {id:"ravine",name:"渓谷の橋",area:"渓谷",x:11350,y:3550,food:"meat",amount:39,score:240,info:"急流を越え、上流の水源を探索",danger:"高：雨天は足を取られる"},
  {id:"headwater",name:"高地の水源",area:"水源",x:12350,y:3250,food:"berries",amount:55,score:285,info:"上流の浅瀬を抜け、雪山へ",danger:"中：深い水と岩場に注意"},
  {id:"snowfield",name:"白峰の雪原",area:"雪山",x:12720,y:3818,food:"meat",amount:50,score:340,info:"凍った稜線の先が山頂洞窟",danger:"高：雪で体力・スタミナを消耗"},
  {id:"deepcave",name:"山頂洞窟",area:"洞窟",x:13220,y:3797,food:"meat",amount:70,score:500,info:"洞窟奥の物資・強敵・封印を探索",danger:"高：洞窟の強敵は年を経て目覚める"}
 ].map((item,index)=>Object.freeze({...item,index,eastRoute:true,z:Math.max(0,Number(M?.height?.(item.x,item.y))||0)})));
 // Route polyline follows a collision-checked 21-radius passable corridor;
 // straight lines across the cliffs and deep streams are deliberately omitted.
 const WALKWAY=Object.freeze([[8360,1680],[8700,1764],[9320,1877],[9920,1960],[10160,2200],[10320,2280],[10440,2360],[10740,2590],[10960,3280],[11280,3600],[11350,3550],[11760,3440],[11960,3320],[12120,3240],[12350,3250],[12440,3560],[12720,3818],[13220,3797]].map(p=>Object.freeze(p)));
 const ALL=(1<<STOPS.length)-1,dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 const cleanMask=m=>Number.isSafeInteger(m)?m&ALL:0;
 const visited=(mask,i)=>(cleanMask(mask)&(1<<i))!==0;
 const count=mask=>STOPS.reduce((n,s)=>n+(visited(mask,s.index)?1:0),0);
 const near=(player,max=150)=>player?STOPS.filter(s=>dist(player,s)<=max).sort((a,b)=>dist(a,player)-dist(b,player))[0]||null:null;
 const arrival=(player,mask)=>player&&player.hp>0?STOPS.find(s=>!visited(mask,s.index)&&dist(s,player)<125)||null:null;
 const next=(player,mask)=>player?STOPS.filter(s=>!visited(mask,s.index)).sort((a,b)=>dist(a,player)-dist(b,player)||a.index-b.index)[0]||null:null;
 const replenishable=(player,mask,years,year)=>{
  const s=near(player,115);if(!s||!visited(mask,s.index))return null;
  const last=Number(years?.[s.index]);return (Number.isFinite(last)?year-last:99)>=3?s:null;
 };
 function drawMap(ctx,X,Y,mask,detail=true){
  ctx.save();ctx.lineWidth=detail?2:1.5;ctx.strokeStyle=detail?"#e0d3a1":"#d5c28c";
  ctx.setLineDash(detail?[5,3]:[4,5]);ctx.beginPath();
  WALKWAY.forEach(([x,y],i)=>i?ctx.lineTo(X(x),Y(y)):ctx.moveTo(X(x),Y(y)));ctx.stroke();ctx.setLineDash([]);
  for(const s of STOPS){
   const x=X(s.x),y=Y(s.y),done=visited(mask,s.index);
   ctx.fillStyle=done?"#8ee2ad":"#f2c97a";ctx.strokeStyle="#122525";ctx.lineWidth=1.3;
   ctx.beginPath();ctx.arc(x,y,detail?6:3.4,0,Math.PI*2);ctx.fill();ctx.stroke();
   if(detail){ctx.fillStyle="#1b302e";ctx.font="bold 9px sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";
    ctx.fillText(String(s.index+1),x,y+.4);}
  }
  ctx.restore();
 }
 function drawPost2D(ctx,s,view,zoom,det,mask){
  const z=s.z,offset=z*.93*zoom,done=visited(mask,s.index);
  ctx.save();ctx.translate(s.x,s.y);
  if(z>0)ctx.translate(view.c*offset/det,-view.a*offset/det);
  ctx.fillStyle="#1a302ca8";ctx.beginPath();ctx.ellipse(0,5,26,13,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=done?"#8ddcb0":"#d8ba7e";ctx.lineWidth=3.5;ctx.beginPath();
  ctx.arc(0,0,17,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle="#5e5843";ctx.fillRect(-4,-46,8,46);
  ctx.fillStyle=done?"#49745e":"#8d6747";ctx.fillRect(-30,-57,60,20);
  ctx.strokeStyle="#ebd8a7";ctx.lineWidth=1.4;ctx.strokeRect(-30,-57,60,20);
  ctx.fillStyle="#fff3d0";ctx.font="bold 13px sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";
  ctx.fillText((s.index+1)+"/"+STOPS.length,0,-47);
  ctx.restore();
 }
 // P3: route-aware guidance uses the same physical waypoint coordinates in both renderers.
 const habitat=Object.freeze([
  {start:0,end:2,prey:true,threat:0,label:"郊外・森の入口"},
  {start:2,end:4,prey:true,threat:1,label:"原生林・峠"},
  {start:4,end:6,prey:false,threat:2,label:"渓谷・水源"},
  {start:6,end:7,prey:false,threat:3,label:"雪山・洞窟"}
 ]);
 // Project the actor onto the navigable polyline, not just the nearest post.
 // The old nearest-waypoint method sent animals backwards at bends and cliffs.
 function routePosition(player){
  if(!player)return null;
  let best=null;
  for(let i=0;i<WALKWAY.length-1;i++){
   const [ax,ay]=WALKWAY[i],[bx,by]=WALKWAY[i+1];
   const dx=bx-ax,dy=by-ay,den=dx*dx+dy*dy;
   const t=Math.max(0,Math.min(1,((player.x-ax)*dx+(player.y-ay)*dy)/den));
   const x=ax+t*dx,y=ay+t*dy,d=Math.hypot(player.x-x,player.y-y);
   if(!best||d<best.distance)best={segment:i,t,x,y,distance:d,progress:i+t};
  }
  return best;
 }
 function navigation(player,mask,water=false){
  if(!player)return null;
  const location=routePosition(player);
  const stop=next(player,mask)||STOPS.reduce((a,b)=>dist(player,a)<dist(player,b)?a:b);
  let goal=0,score=Infinity;
  for(let i=0;i<WALKWAY.length;i++){
   const [x,y]=WALKWAY[i],d=Math.hypot(stop.x-x,stop.y-y);
   if(d<score){score=d;goal=i;}
  }
  // Aim at the next navigable vertex along the path. When the player is
  // outside the corridor, first rejoin its nearest safe projected position.
  const offPath=location.distance>105;
  let step=goal;
  if(!offPath){
   if(goal>location.progress+.12)step=Math.min(WALKWAY.length-1,Math.floor(location.progress)+1);
   else if(goal<location.progress-.12)step=Math.max(0,Math.ceil(location.progress)-1);
  }
  const [wx,wy]=WALKWAY[step];
  const x=offPath?location.x:wx,y=offPath?location.y:wy;
  const sectionIndex=location.progress<4?0:location.progress<8?1:location.progress<15?2:3;
  const section=habitat[sectionIndex];
  return {x,y,stop,section,water:!!water,
   distance:Math.round(Math.hypot(player.x-x,player.y-y)),waypoint:step,
   offPath,routeDistance:Math.round(location.distance),routeProgress:location.progress,
   targetDistance:Math.round(dist(player,stop))};
 }
 // P3 eastern living corridor: pure world-coordinate ecology shared by NPC AI and route HUD.
 const BIOMES=Object.freeze([
  {id:"wood",x:9500,y:1950,r:740,prey:["deer","boar","fox"],hunters:["wolf","bear"],wet:false},
  {id:"pass",x:10660,y:2600,r:650,prey:["deer","goat"],hunters:["wolf","eagle"],wet:false},
  {id:"ravine",x:11370,y:3520,r:550,prey:["otter","frog","deer"],hunters:["wolf","bear"],wet:true},
  {id:"spring",x:12300,y:3280,r:520,prey:["otter","frog","carp"],hunters:["crocodile","bear"],wet:true},
  {id:"snow",x:12720,y:3818,r:530,prey:["deer","fox"],hunters:["wolf","bear"],wet:false},
  {id:"cave",x:13220,y:3797,r:460,prey:["bat"],hunters:["bear","wolf"],wet:false}
 ]);
 const biomeAt=(x,y)=>BIOMES.filter(b=>Math.hypot(x-b.x,y-b.y)<=b.r)
  .sort((a,b)=>Math.hypot(x-a.x,y-a.y)/a.r-Math.hypot(x-b.x,y-b.y)/b.r)[0]||null;
 function fieldStatus(player,mask,weather,year){
  if(!player)return null;
  const biome=biomeAt(player.x,player.y),wet=weather==="RAIN"||weather==="THUNDER";
  const nearest=STOPS.reduce((a,b)=>dist(player,a)<dist(player,b)?a:b);
  const target=next(player,mask)||nearest;
  const water=player.type==="carp",inWater=!!biome?.wet;
  const dangerous=biome?.id==="cave"?(year>=25||weather==="THUNDER"):
   biome?.id==="snow"||biome?.id==="ravine"&&wet||biome?.id==="spring"&&wet;
  return {biome,target,water,dangerous,
   message:water?(inWater?"水域の補給地点を探索。陸地へは上がれない":"水路から水源へ。陸地の道標は到達不可"):
    (dangerous?"危険地帯。遮蔽物と補給を確保":"次の探索地点へ進み、食料と報酬を回収"),
   distance:Math.round(dist(player,target))};
 }
 // Modifies only live wild NPC awareness; never creates/revives roster individuals.
 function wildlifeResponse(player,mobs,species,weather,year,blocked){
  if(!player||player.hp<=0)return {alerted:0,fleeing:0};
  const biome=biomeAt(player.x,player.y);if(!biome)return {alerted:0,fleeing:0};
  const wet=weather==="RAIN"||weather==="THUNDER";
  const radius=biome.id==="cave"&&year>=25?370:biome.wet&&wet?260:190;
  let alerted=0,fleeing=0;
  for(const mob of mobs||[]){
   if(!mob||mob.hp<=0||mob.companion||mob.strongBoss||
      Math.hypot(mob.x-player.x,mob.y-player.y)>radius||
      (blocked&&blocked(mob,player)))continue;
   const kind=species?.[mob.type],prey=!!kind?.prey;
   if(prey){
    if(fleeing>=4)continue;
    mob.alert=Math.max(Number(mob.alert)||0,1.2);
    mob.lastX=player.x;mob.lastY=player.y;
    fleeing++;
   }else{
    if(alerted>=3)continue;
    mob.alert=Math.max(Number(mob.alert)||0,biome.id==="cave"?2.7:1.6);
    mob.lastX=player.x;mob.lastY=player.y;
    mob.search=Math.max(Number(mob.search)||0,biome.id==="cave"?2.4:1.3);
    alerted++;
   }
  }
  return {alerted,fleeing};
 }
 global.WildEastExpedition=Object.freeze({stops:STOPS,walkway:WALKWAY,all:ALL,cleanMask,visited,count,near,arrival,next,replenishable,navigation,routePosition,habitat,biomes:BIOMES,biomeAt,fieldStatus,wildlifeResponse,drawMap,drawPost2D});
})(window);
