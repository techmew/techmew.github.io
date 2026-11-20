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

 // P3: one continuous, source-coordinate aquatic network. Drawings, swim collision,
 // spawn recovery and navigation refer to the same channels; no teleport or save reset.
 const riverX=y=>7505+68*Math.sin(y/390),canalY=x=>5025+35*Math.sin(x/390);
 const inletX=riverX(2485),mouthX=M?.headwater?.mouthX||9230,sourceX=M?.headwater?.sourceX||12740;
 const upperY=x=>M?.headwater?.yAt?.(x)??(2485+12*Math.sin((x-10500)/470));
 const creekX=y=>M?.creek?.xAt?.(y)??(9250+35*Math.sin((y-3800)/180));
 const depthBand=(offset,half)=>Math.max(0,Math.min(1,(half-Math.abs(offset))/(half*.48)));
 function channelDepth(x,y){
  let d=0;
  if(y>=2480&&y<=canalY(inletX)+45)d=Math.max(d,depthBand(x-inletX,85));
  if(x>=inletX-35&&x<=mouthX+30)d=Math.max(d,depthBand(y-upperY(x),76));
  if(x>=mouthX-25&&x<=sourceX+18)d=Math.max(d,depthBand(y-upperY(x),35));
  if(y>=2485&&y<=4650)d=Math.max(d,depthBand(x-creekX(y),53));
  return d;
 }
 // Physical water below a road bridge remains swimmable for fish, while surface
 // waterDepth can keep the old dry road crossing for land creatures.
 function aquaticDepth(x,y){
  let d=channelDepth(x,y);
  if(y>=0&&y<=2600)d=Math.max(d,depthBand(x-riverX(y),133));
  if(x>=5600&&x<=8400)d=Math.max(d,depthBand(y-canalY(x),100));
  return d;
 }
 const waterRibbons=[];
 function drawRibbon(a,b,half,kind){
  const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,nx=-dy/len*half,ny=dx/len*half;
  return Object.freeze({kind,cx:(a.x+b.x)/2,cy:(a.y+b.y)/2,
   pts:[[a.x+nx,a.y+ny],[a.x-nx,a.y-ny],[b.x-nx,b.y-ny],[b.x+nx,b.y+ny]]});
 }
 const waterNodes=[],waterEdges=[];
 function lane(points,half,kind,draw){
  let previous=-1;
  for(const p of points){
   const index=waterNodes.length;
   waterNodes.push(Object.freeze({x:p.x,y:p.y}));
   waterEdges.push([]);
   if(previous>=0){
    waterEdges[previous].push(index);waterEdges[index].push(previous);
    if(draw)waterRibbons.push(drawRibbon(waterNodes[previous],p,half,kind));
   }
   previous=index;
  }
 }
 function samples(a,b,step,at){
  const count=Math.max(1,Math.ceil(Math.abs(b-a)/step));
  return Array.from({length:count+1},(_,i)=>at(a+(b-a)*i/count));
 }
 lane(samples(0,2600,35,y=>({x:riverX(y),y})),133,"river",false);
 lane(samples(5600,8400,35,x=>({x,y:canalY(x)})),100,"canal",false);
 lane(samples(canalY(inletX),2485,35,y=>({x:inletX,y})),85,"waterlink",true);
 lane(samples(inletX,mouthX,35,x=>({x,y:upperY(x)})),76,"waterlink",true);
 lane(samples(mouthX,sourceX,24,x=>({x,y:upperY(x)})),35,"spring",false);
 lane(samples(2485,4650,30,y=>({x:creekX(y),y})),53,"creek",false);
 // Join only physically coincident centerlines; diagonal bank-cutting is tested
 // against the same passable predicate before any route is advertised.
 for(let i=0;i<waterNodes.length;i++)for(let j=i+1;j<waterNodes.length;j++){
  if(waterEdges[i].includes(j)||Math.hypot(waterNodes[i].x-waterNodes[j].x,waterNodes[i].y-waterNodes[j].y)>31)continue;
  waterEdges[i].push(j);waterEdges[j].push(i);
 }
 Object.freeze(waterRibbons);
 const waterStations=Object.freeze([
  {id:"fish-river",name:"朝霧川の水中補給",area:"川",x:riverX(1640),y:1640,amount:28,score:110},
  {id:"fish-canal",name:"潮見水路の補給",area:"水路",x:6880,y:canalY(6880),amount:32,score:125},
  {id:"fish-inlet",name:"東部の合流水域",area:"合流",x:8550,y:upperY(8550),amount:40,score:200},
  {id:"fish-source",name:"高地の源流水域",area:"水源",x:12350,y:upperY(12350),amount:52,score:350}
 ].map((site,index)=>Object.freeze({...site,index,waterRoute:true,food:"berries",
  z:Math.max(0,Number(M?.height?.(site.x,site.y))||0)})));
 const cleanWaterMask=m=>Number.isSafeInteger(m)?m&15:0;
 const waterVisited=(mask,i)=>(cleanWaterMask(mask)&(1<<i))!==0;
 const waterArrival=(player,mask)=>player&&player.type==="carp"&&player.hp>0?
  waterStations.find(s=>!waterVisited(mask,s.index)&&dist(s,player)<105)||null:null;
 const waterReplenishable=(player,mask,years,year)=>{
  if(!player||player.type!=="carp")return null;
  const s=waterStations.find(s=>dist(s,player)<105&&waterVisited(mask,s.index));
  return s&&year-(Number(years?.[s.index])||0)>=3?s:null;
 };
 function aquaticNetworkStep(player,target,passable){
  const fail={x:player?.x||0,y:player?.y||0,reachable:false,targetReached:false};
  if(!player||!target||typeof passable!=="function"||!passable(player.x,player.y))return fail;
  // Validate the actual final water target, rather than accepting a nearby dry landmark.
  if(!passable(target.x,target.y))return fail;
  if(dist(player,target)<=100)return {...fail,reachable:true,targetReached:true};
  const starts=waterNodes.map((p,i)=>({i,d:dist(p,player)})).filter(p=>p.d<=105).sort((a,b)=>a.d-b.d).slice(0,6);
  const goals=new Set(waterNodes.map((p,i)=>({i,d:dist(p,target)})).filter(p=>p.d<=72&&passable(waterNodes[p.i].x,waterNodes[p.i].y)).map(p=>p.i));
  if(!starts.length||!goals.size)return fail;
  const edgeOK=(a,b)=>{
   const p=waterNodes[a],q=waterNodes[b];
   if(!passable(q.x,q.y))return false;
   for(let t=.25;t<1;t+=.25)if(!passable(p.x+(q.x-p.x)*t,p.y+(q.y-p.y)*t))return false;
   return true;
  };
  const queue=[],from=new Map();
  for(const a of starts){
   const p=waterNodes[a.i];
   if(!passable(p.x,p.y)||!passable((p.x+player.x)/2,(p.y+player.y)/2))continue;
   from.set(a.i,-1);queue.push(a.i);
  }
  let end=-1;
  for(let h=0;h<queue.length&&h<waterNodes.length;h++){
   const u=queue[h];
   if(goals.has(u)){end=u;break;}
   for(const v of waterEdges[u]){
    if(from.has(v)||!edgeOK(u,v))continue;
    from.set(v,u);queue.push(v);
   }
  }
  if(end<0)return fail;
  // Reconstruct the exact graph path to the selected destination. Choosing any
  // previously visited neighbor can send fish backward at a river fork.
  const chain=[end];
  while(from.get(chain.at(-1))!==-1&&from.get(chain.at(-1))!==undefined)
   chain.push(from.get(chain.at(-1)));
  chain.reverse();
  let next=waterNodes[chain[0]];
  if(dist(player,next)<26&&chain.length>1)next=waterNodes[chain[1]];
  return {x:next.x,y:next.y,reachable:true,targetReached:false,remaining:dist(player,target)};
 }

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
 function drawMap(ctx,X,Y,mask,detail=true,waterMask=0){
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
  for(const site of waterStations){
   const x=X(site.x),y=Y(site.y),done=waterVisited(waterMask,site.index);
   ctx.fillStyle=done?"#7be8db":"#5ec7e1";ctx.strokeStyle="#17333d";ctx.lineWidth=1.6;
   ctx.beginPath();ctx.arc(x,y,detail?4.5:2.8,0,Math.PI*2);ctx.fill();ctx.stroke();
  }
  ctx.restore();
 }
 function drawPost2D(ctx,s,view,zoom,det,mask){
  const z=s.z,offset=z*.93*zoom,done=s.waterRoute?waterVisited(mask,s.index):visited(mask,s.index);
  ctx.save();ctx.translate(s.x,s.y);
  if(z>0)ctx.translate(view.c*offset/det,-view.a*offset/det);
  ctx.fillStyle="#1a302ca8";ctx.beginPath();ctx.ellipse(0,5,26,13,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=done?"#8ddcb0":"#d8ba7e";ctx.lineWidth=3.5;ctx.beginPath();
  ctx.arc(0,0,17,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle="#5e5843";ctx.fillRect(-4,-46,8,46);
  ctx.fillStyle=s.waterRoute?(done?"#407c80":"#327899"):(done?"#49745e":"#8d6747");ctx.fillRect(-30,-57,60,20);
  ctx.strokeStyle="#ebd8a7";ctx.lineWidth=1.4;ctx.strokeRect(-30,-57,60,20);
  ctx.fillStyle="#fff3d0";ctx.font="bold 13px sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";
  ctx.fillText(s.waterRoute?"水"+(s.index+1):(s.index+1)+"/"+STOPS.length,0,-47);
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
 // Local water-only A* uses the same live collision predicate as player movement.
 // It never advertises a dry straight-line waypoint as reachable.
 function aquaticStep(player,target,passable){
  if(!player||!target||typeof passable!=="function")return {x:player?.x||0,y:player?.y||0,reachable:false,targetReached:false};
  // Reject dry destinations; otherwise the A* can falsely accept water 60m from a dry post.
  // Find a physical water approach to the landmark without moving the actual landmark/reward.
  const offsets=[[0,0],[0,40],[40,0],[-40,0],[0,-40],[40,40],[-40,40],[40,-40],[-40,-40],
   [0,80],[80,0],[-80,0],[0,-80],[80,80],[-80,80],[80,-80],[-80,-80]];
  const wetGoals=offsets.map(([dx,dy])=>({x:target.x+dx,y:target.y+dy}))
   .filter(p=>Math.hypot(p.x-target.x,p.y-target.y)<=115&&passable(p.x,p.y));
  if(!wetGoals.length||!passable(player.x,player.y))return {x:player.x,y:player.y,reachable:false,targetReached:false,remaining:Infinity,expanded:0};
  // Search every wet approach, not just the nearest: the nearest can be across a dry bank.
  const goalDistance=(x,y)=>Math.min(...wetGoals.map(g=>Math.hypot(x-g.x,y-g.y)));
  if(goalDistance(player.x,player.y)<=40)return {x:player.x,y:player.y,reachable:true,targetReached:dist(player,target)<=125,remaining:0,expanded:0};
  const size=40,limit=3200,origin={x:player.x,y:player.y},start="0,0";
  const key=(x,y)=>x+","+y,open=[{x:0,y:0,g:0,f:0}],seen=new Map([[start,0]]),cells=new Map([[start,open[0]]]);
  const dirs=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
  let best=open[0],bestDist=goalDistance(origin.x,origin.y),expanded=0,found=false;
  while(open.length&&expanded++<limit){
   open.sort((a,b)=>a.f-b.f);const node=open.shift(),nk=key(node.x,node.y);
   if(node.g!==seen.get(nk))continue;
   const px=origin.x+node.x*size,py=origin.y+node.y*size,d=goalDistance(px,py);
   if(d<bestDist){best=node;bestDist=d;}
   if(d<=size*1.5){best=node;found=true;break;}
   for(const [dx,dy] of dirs){
    const nx=node.x+dx,ny=node.y+dy,x=origin.x+nx*size,y=origin.y+ny*size;
    if(Math.abs(nx)>90||Math.abs(ny)>90||!passable(x,y))continue;
    if(dx&&dy&&(!passable(origin.x+nx*size,origin.y+node.y*size)||
      !passable(origin.x+node.x*size,origin.y+ny*size)))continue;
    // Prevent stepping across narrow dry banks between two water samples.
    if(!passable((px+x)/2,(py+y)/2))continue;
    const g=node.g+Math.hypot(dx,dy),k=key(nx,ny);
    if(g>=(seen.get(k)??Infinity))continue;
    const next={x:nx,y:ny,g,f:g+goalDistance(x,y)/size,parent:nk};
    seen.set(k,g);cells.set(k,next);open.push(next);
   }
  }
  if(best===cells.get(start))return {x:player.x,y:player.y,reachable:false,targetReached:false};
  let cursor=best;
  while(cursor.parent&&cursor.parent!==start)cursor=cells.get(cursor.parent);
  const x=origin.x+cursor.x*size,y=origin.y+cursor.y*size;
  return {x,y,reachable:found&&passable(x,y),targetReached:found,partial:!found,
   remaining:Math.round(bestDist),expanded};
 }
 const waterNavMemo={time:0,origin:null,mask:null,result:null};
 function navigation(player,mask,water=false,passable=null){
  if(!player)return null;
  if(water&&waterNavMemo.result&&waterNavMemo.mask===mask&&
     Date.now()-waterNavMemo.time<700&&
     dist(player,waterNavMemo.origin)<26&&
     passable?.(waterNavMemo.result.x,waterNavMemo.result.y))return waterNavMemo.result;
  const location=routePosition(player);
  const aquatic=water?waterStations:null;
  const candidates=aquatic||STOPS;
  const ranked=candidates.filter(s=>water?!waterVisited(mask,s.index):!visited(mask,s.index))
   .sort((a,b)=>dist(player,a)-dist(player,b));
  const ordered=ranked.length?ranked:candidates.slice().sort((a,b)=>dist(player,a)-dist(player,b));
  let stop=ordered[0],swim=null;
  if(water){
   // Only label a stop reachable after the actual water/collision search succeeds.
   // Do not replace a failed route with a dry-land arrow.
   for(const candidate of ordered){
    const attempt=aquaticNetworkStep(player,candidate,passable);
    if(attempt.reachable){stop=candidate;swim=attempt;break;}
    if(!swim||attempt.remaining<swim.remaining){swim=attempt;stop=candidate;}
   }
  }
  let goal=0,score=Infinity;
  for(let i=0;i<WALKWAY.length;i++){
   const [x,y]=WALKWAY[i],d=Math.hypot(stop.x-x,stop.y-y);
   if(d<score){score=d;goal=i;}
  }
  const offPath=location.distance>105;
  let step=goal;
  if(!offPath){
   if(goal>location.progress+.12)step=Math.min(WALKWAY.length-1,Math.floor(location.progress)+1);
   else if(goal<location.progress-.12)step=Math.max(0,Math.ceil(location.progress)-1);
  }
  const [wx,wy]=WALKWAY[step];
  const x=water?(swim.reachable?swim.x:player.x):(offPath?location.x:wx);
  const y=water?(swim.reachable?swim.y:player.y):(offPath?location.y:wy);
  const sectionIndex=location.progress<4?0:location.progress<8?1:location.progress<15?2:3;
  const result={x,y,stop,section:habitat[sectionIndex],water:!!water,
   distance:Math.round(Math.hypot(player.x-x,player.y-y)),waypoint:step,
   offPath:water?!swim.reachable:offPath,routeDistance:water?0:Math.round(location.distance),
   routeProgress:location.progress,waterReachable:water?swim.reachable:null,
   targetDistance:Math.round(dist(player,stop))};
  if(water){
   waterNavMemo.time=Date.now();waterNavMemo.origin={x:player.x,y:player.y};
   waterNavMemo.mask=mask;waterNavMemo.result=result;
  }
  return result;
 }
 // P3: guide active guardian -> loot -> den -> boss along the real
 // eastern land corridor when a direct line is blocked or too long.
 // Pure world-space XY: does not move NPCs, rewards, labels or 3D models.
 // A live mountain detour is only accepted when its next segment is actually
 // traversable. Avoid advertising an impossible waypoint behind a cliff.
 function groundGuide(player,target,blocked){
  if(!player||!target)return null;
  const direct={x:target.x,y:target.y,goalX:target.x,goalY:target.y,via:false};
  const gap=dist(player,target),obstructed=typeof blocked==="function"&&!!blocked(player,target);
  if(gap<200&&!obstructed)return direct;
  const current=routePosition(player),destination=routePosition(target);
  if(!current||!destination||current.distance>290||destination.distance>300||
     (gap<460&&!obstructed))return direct;
  // Rejoin a visible path before marching through a blocked mountain.
  if(current.distance>90)return {x:current.x,y:current.y,goalX:target.x,
   goalY:target.y,via:true,waypoint:-1};
  let step=-1;
  if(destination.progress>current.progress+.18)step=Math.min(WALKWAY.length-1,Math.floor(current.progress)+1);
  else if(destination.progress<current.progress-.18)step=Math.max(0,Math.ceil(current.progress)-1);
  if(step<0)return direct;
  let [x,y]=WALKWAY[step];
  // If the first forward marker lies behind a cliff, guide toward the closest
  // physical rejoin point instead of telling the player to walk into rock.
  if(typeof blocked==="function"&&blocked(player,{x,y})){
   const nearby=WALKWAY.map(([wx,wy],i)=>({x:wx,y:wy,i,d:Math.hypot(wx-player.x,wy-player.y)}))
    .filter(q=>q.d>35&&q.d<420&&!blocked(player,q))
    .sort((a,b)=>a.d-b.d)[0];
   if(nearby){x=nearby.x;y=nearby.y;step=nearby.i;}
   else if(current.distance>20){x=current.x;y=current.y;step=-1;}
  }
  return {x,y,goalX:target.x,goalY:target.y,via:true,waypoint:step};
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
  // Aquatic starts must receive reachable water objectives, never a dry mountain post.
  const aquaticStops=waterStations;
  const aquaticTarget=water?aquaticStops.filter(s=>!waterVisited(mask,s.index)).sort((a,b)=>dist(player,a)-dist(player,b))[0]||
   aquaticStops.slice().sort((a,b)=>dist(player,a)-dist(player,b))[0]:null;
  const dangerous=biome?.id==="cave"?(year>=25||weather==="THUNDER"):
   biome?.id==="snow"||biome?.id==="ravine"&&wet||biome?.id==="spring"&&wet;
  return {biome,target:aquaticTarget||target,water,dangerous,
   message:water?(inWater?"水域の補給地点を探索。陸地へは上がれない":"水路から水源へ。陸地の道標は到達不可"):
    (dangerous?"危険地帯。遮蔽物と補給を確保":"次の探索地点へ進み、食料と報酬を回収"),
   distance:Math.round(dist(player,aquaticTarget||target))};
 }
 // Water expeditions use the same physical water-depth and live NPC system.
 // Fish receive only reachable aquatic goals, never a dry-land cache or patrol.
 function aquaticEncounter(player,mobs,species,weather,passable){
  if(!player||player.type!=="carp"||player.hp<=0)return {pressure:0,alerted:0,near:null};
  const depth=aquaticDepth(player.x,player.y);
  if(depth<=.09)return {pressure:0,alerted:0,near:null};
  const near=waterStations.slice().sort((a,b)=>dist(player,a)-dist(player,b))[0];
  const wet=weather==="RAIN"||weather==="THUNDER";
  const pressure=near?.index===3?3:near?.index===2?2:1;
  let alerted=0;
  for(const mob of mobs||[]){
   if(alerted>=Math.min(2,pressure)||!mob||mob.hp<=0||mob.companion||
    mob.strongBoss||mob.releasedIndividualId||species?.[mob.type]?.prey||
    Math.hypot(mob.x-player.x,mob.y-player.y)>(wet?285:195)||
    aquaticDepth(mob.x,mob.y)<=.05||
    (passable&&!passable(mob.x,mob.y)))continue;
   // Only genuinely waterborne hostile wildlife can pursue the carp.
   mob.alert=Math.max(Number(mob.alert)||0,wet?2.3:1.5);
   mob.search=Math.max(Number(mob.search)||0,wet?2.1:1.2);
   mob.lastX=player.x;mob.lastY=player.y;
   alerted++;
  }
  return {pressure,alerted,near,wet,depth};
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
 global.WildEastExpedition=Object.freeze({stops:STOPS,walkway:WALKWAY,waterStations,
  waterRibbons,channelDepth,aquaticDepth,waterNodes,aquaticNetworkStep,
  cleanWaterMask,waterVisited,waterArrival,waterReplenishable,all:ALL,cleanMask,visited,count,near,arrival,next,replenishable,navigation,aquaticStep,routePosition,groundGuide,habitat,biomes:BIOMES,biomeAt,fieldStatus,wildlifeResponse,aquaticEncounter,drawMap,drawPost2D});
})(window);
