// Exercise actual walk/swim collision against the mountain map, including bridge approaches.
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const read=name=>fs.readFileSync(path.join(__dirname,name),"utf8");
const window={};
for(const file of ["mountain.js","east-expedition.js"])new Function("window",read(file))(window);
const mountain=window.WildMountain,route=window.WildEastExpedition,game=read("game.js");
function part(start,end){
 const a=game.indexOf(start),b=game.indexOf(end,a+start.length);
 assert(a>=0&&b>a,start);
 return game.slice(a,b);
}
const env={window,MOUNTAIN:mountain,WORLD:{w:13600,h:6000},elapsed:0,P:null,
 WATER_PLAYABLES:new Set(["carp","otter","hippo"]),buildings:[],streetProps:[],
 roadsX:[],roadsY:[],riverAxis:()=>7500,canalAxis:()=>5025,
 recoverPlayerFromGap:()=>{},narrowBuildingPassage:()=>false,roofAt:()=>0};
const physics=new Function("env","with(env){"+part("function waterDepth(","function shallowWater(")+
 part("function collides(","// Avoid admitting")+part("function move(o,","function lineBlocked(")+
 ";return {move,waterDepth,swimWaterDepth};}")(env);
function cross(type,stream,y){
 const start=stream.xAt(y)-92,player={type,r:15,x:start,y,jumpTime:0,pounceTime:0};
 env.P=player;
 for(let i=0;i<46;i++)physics.move(player,4,0);
 return Math.round(player.x-start);
}
for(const stream of [mountain.creek,mountain.gorge]){
 const y=stream.bridgeY,x=stream.xAt(y);
 assert.equal(physics.waterDepth(x,y),0,"deck is dry");
 assert.equal(route.streamCurrent(x,y,"THUNDER"),null);
 assert.equal(cross("cat",stream,y),184,"land crossing on bridge");
 const off=y+stream.bridgeHalf+65,axis=stream.xAt(off);
 assert(physics.waterDepth(axis,off)>.9);
 assert(cross("cat",stream,off)<92,"land animal stops at bank");
 assert.equal(cross("otter",stream,off),184,"otter enters and exits real banks");
 const sunny=route.streamCurrent(axis,off,"CLEAR"),storm=route.streamCurrent(axis,off,"THUNDER");
 assert(storm.y>sunny.y&&sunny.y>0);
 assert(route.streamCurrent(axis+stream.halfWidth*.9,off,"RAIN").y<route.streamCurrent(axis,off,"RAIN").y);
 let foam=0;
 route.eachRapid({x:axis,y:off},8,"RAIN",(x,y,xx,yy)=>{
  assert(route.streamCurrent(x,y,"RAIN")&&yy>y&&Math.abs(xx-x)<8);
  foam++;
 });
 assert(foam>0);
}
const step=new Function("env","with(env){"+part("const oldX=P.x,oldY=P.y;\n   const current=", "   if(ghostSteering&&")+"}");
Object.assign(env,{move:physics.move,waterDepth:physics.waterDepth,fishWaterAt:(x,y)=>physics.swimWaterDepth(x,y)>.035,
 dt:1/60,ghostSteering:false,weather:"THUNDER"});
const creek=mountain.creek;
let off=creek.bridgeY+creek.bridgeHalf+60;
// Choose open water for the drift trial. Natural rocks must still block displacement.
while(off<4550&&Array.from({length:85},(_,i)=>off-55+i).some(y=>
 mountain.blocked(creek.xAt(y),y,15,null,true)))off+=10;
assert(off<4550,"open 85-unit stretch");
env.P={type:"otter",r:15,x:creek.xAt(off),y:off,vx:0,vy:0};
for(let i=0;i<30;i++)step(env);
assert(env.P.y>off+15,"resting swimmer is carried downstream by production steering");
env.P.vy=-140;
for(let i=0;i<30;i++)step(env);
assert(env.P.y<off,"player can swim against peak storm flow");
env.P.x=creek.xAt(creek.bridgeY);env.P.y=creek.bridgeY;env.P.vy=0;
step(env);assert.equal(env.P.y,creek.bridgeY);assert.equal(env.P.swimVisual,0);
const c=mountain.creek,fish={type:"carp",r:15,x:c.xAt(c.bridgeY),y:c.bridgeY};
env.P=fish;physics.move(fish,0,8);assert.equal(fish.y,c.bridgeY+8,"fish can swim beneath the dry walking surface");
assert.equal(route.surfaceDepth(9700,mountain.headwater.yAt(9700)),0);
assert(route.aquaticDepth(9700,mountain.headwater.yAt(9700))>.9);
const cat={type:"cat",r:16,hp:100,x:route.walkway[0][0],y:route.walkway[0][1]};
env.P=cat;
let mask=0;
for(const [x,y] of route.walkway){
 let distance=Math.hypot(x-cat.x,y-cat.y);
 while(distance>.01){
  const size=Math.min(4,distance);
  physics.move(cat,(x-cat.x)*size/distance,(y-cat.y)*size/distance);
  const remaining=Math.hypot(x-cat.x,y-cat.y);
  assert(remaining<distance-.001,"east trail blocked at "+Math.round(cat.x)+","+Math.round(cat.y)+" toward "+x+","+y);
  distance=remaining;
  const site=route.arrival(cat,mask);
  if(site)mask|=1<<site.index;
 }
}
assert.equal(mask,255,"reach eight land stations in one continuous traversal");
console.log("PASS both crossings, swimming and all eight stops in one walk");
const navigation=new Function("env","with(env){"+part("function wildlifeBridgeWaypoint","// Small cave-only")+
 part("function routeClear(","function navSetup(")+
 part("function collides(","// Avoid admitting")+";return {wildlifeBridgeWaypoint,routeClear};}")(env);
Object.assign(env,{waterBlocksLand:(x,y)=>physics.waterDepth(x,y)>.0001,
 clamp:(n,a,b)=>Math.max(a,Math.min(b,n)),dist:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y)});
for(const stream of [mountain.creek,mountain.gorge]){
 for(const side of [-1,1]){
  const y=stream.bridgeY+stream.bridgeHalf+55,axis=stream.xAt(y);
  const hunter={type:"wolf",r:16,x:axis+side*135,y},prey={x:axis-side*135,y};
  assert(!navigation.routeClear(hunter,prey,hunter.r),"open water cuts off direct pursuit");
  for(let frame=0;frame<250&&env.dist(hunter,prey)>6;frame++){
   const next=navigation.routeClear(hunter,prey,hunter.r)?prey:navigation.wildlifeBridgeWaypoint(hunter,prey);
   assert(next,"bridge approach reachable at "+hunter.x+","+hunter.y);
   const d=env.dist(hunter,next);
   physics.move(hunter,(next.x-hunter.x)*3/d,(next.y-hunter.y)*3/d);
   assert.equal(physics.waterDepth(hunter.x,hunter.y),0);
  }
  assert(env.dist(hunter,prey)<=6,"arrive within striking distance");
 }
}
console.log("PASS wildlife pursuit across both eastern bridges in both directions");

// Run the live hunt, alarm, flight and contact damage with a moving target.
const chase=new Function("env","with(env){"+
 part("function clearStep(","// A struck herd")+
 part("function wildPreyInterceptPoint(","function nearbyVisibleWildPredator")+
 part("function huntWildPrey(","const WEATHER_NAMES")+
 part("function routeClear(","function navSetup(")+
 part("function collides(","// Avoid admitting")+
 part("function lineBlocked(","// Winter shrubs")+
 ";return {huntWildPrey,chooseEscape};}")(env);
Object.assign(env,{species:{deer:{prey:true}},scentReachTo:()=>150,windDirection:0,
 visibleShrubCover:()=>false,navPlansThisFrame:0,routeTo:()=>null,weather:"CLEAR"});
const dt=1/60;
for(const stream of [mountain.creek,mountain.gorge]){
 for(const side of [-1,1]){
  const y=stream.bridgeY+stream.bridgeHalf+36,axis=stream.xAt(y);
  const deer={x:axis+side*97,y,type:"deer",r:16,hp:50};
  const dog={x:deer.x+side*177,y,type:"dog",r:16,hp:60};
  while(mountain.blocked(dog.x,dog.y,dog.r)&&env.dist(dog,deer)>80)dog.x-=side*4;
  assert(!mountain.blocked(dog.x,dog.y,dog.r)&&!mountain.blocked(deer.x,deer.y,deer.r));
  env.mobs=[dog,deer];
  let crossed=false;
  for(let frame=0;frame<600&&deer.hp===50;frame++){
   env.elapsed+=dt;
   env.navPlansThisFrame=0;
   const motion=chase.huntWildPrey(dog,{speed:143,damage:30},false,1000);
   if(!motion)break;
   if(deer.hp<50)break;
   if(frame%12===0)deer.dir=chase.chooseEscape(deer,Math.atan2(deer.y-dog.y,deer.x-dog.x),dog);
   physics.move(deer,Math.cos(deer.dir)*83*dt,Math.sin(deer.dir)*83*dt);
   physics.move(dog,motion.vx*dt,motion.vy*dt);
   assert.equal(physics.waterDepth(deer.x,deer.y),0);
   assert.equal(physics.waterDepth(dog.x,dog.y),0);
   if((deer.x-stream.xAt(deer.y))*side<0)crossed=true;
  }
  assert(crossed,"deer escapes across deck before contact "+side+" "+axis);
  assert(deer.hp<50&&dog.hp===52&&dog.stun>0,"bite and deer counter both land");
 }
}
console.log("PASS moving deer escape, pursuit, bite and counter on both bridges");
