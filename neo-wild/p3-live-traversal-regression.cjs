// Run the game loop with generated scenery and active wildlife. Only the
// presentation, frame clock and storage use in-memory substitutes.
const fs=require("node:fs"), path=require("node:path"), vm=require("node:vm"), assert=require("node:assert/strict");
const read=file=>fs.readFileSync(path.join(__dirname,file),"utf8");
function traverse(type){
 const noop=()=>{}, nodes=new Map(), store=new Map();
 const canvas=new Proxy({measureText:()=>({width:40}),createLinearGradient:()=>({addColorStop:noop})},
  {get:(obj,key)=>obj[key]??noop});
 function element(){
  const classes=new Set();
  return {parentElement:{setAttribute:noop,classList:{toggle:noop}},style:{setProperty:noop},dataset:{},children:[],value:"",classList:{add:k=>classes.add(k),remove:k=>classes.delete(k),contains:k=>classes.has(k),toggle:noop},
  getContext:()=>canvas,addEventListener:noop,setAttribute:noop,removeAttribute:noop,append:noop,replaceChildren:noop,
  querySelector:()=>null,querySelectorAll:()=>[],getBoundingClientRect:()=>({width:100,height:100})};
 }
 const document={getElementById(id){if(!nodes.has(id))nodes.set(id,element());return nodes.get(id);},
  querySelectorAll:()=>[],querySelector:()=>null,createElement:element,addEventListener:noop,body:element(),documentElement:element()};
 const world={console,document,innerWidth:850,innerHeight:400,performance:{now:()=>0},
  addEventListener:noop,requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,
  navigator:{},location:{search:""},URLSearchParams,
  localStorage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)}};
 world.window=world;vm.createContext(world);
 function run(code,file){return vm.runInContext(code,world,{filename:file});}
 run("let seed=42;Math.random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);","seed");
 for(const file of ["mountain.js","east-expedition.js","world-time.js","era-ecology.js","fauna.js","boss-patterns.js","pack-tactics.js","disaster-world.js","wild-arsenal.js"])
  run(read(file),file);
 const game=read("game.js"),end=game.lastIndexOf("})();");
 run(game.slice(0,end)+`
  window.trial=function(type){
   choice=type;if(!start(false))throw Error("start failed");
   const route=window.WildEastExpedition;
   P.x=route.stops[0].x;P.y=route.stops[0].y;
   const visited=[],initialHp=P.hp;let nearby=0;
   for(let frame=0;frame<4800&&eastTrailMask!==255;frame++){
    const goal=route.navigation(P,eastTrailMask),dx=goal.x-P.x,dy=goal.y-P.y;
    const sx=VIEW.a*dx+VIEW.c*dy,sy=VIEW.b*dx+VIEW.d*dy,len=Math.hypot(sx,sy);
    const strength=Math.min(1,Math.hypot(dx,dy)/7);
    joy.x=len?sx/len*strength:0;joy.y=len?sy/len*strength:0;
    const before=eastTrailMask;
    update(1/30);
    if(before!==eastTrailMask)visited.push(eastTrailMask);
    nearby=Math.max(nearby,mobs.filter(m=>m.hp>0&&!species[m.type].prey&&dist(P,m)<400).length);
    if(mode!=="play")throw Error(mode+" at "+P.x+","+P.y+" mask "+eastTrailMask);
   }
   const saved=getAutoSnapshot();
   if(!saved||saved.eastTrailMask!==255||!restoreSnapshot(saved))throw Error("trail save did not restore");
   return {visited,mask:eastTrailMask,x:P.x,y:P.y,hp:P.hp,initialHp,nearby,buildings:buildings.length,props:streetProps.length};
  };
 `+game.slice(end),"game.js");
 return world.trial(type);
}
for(const type of ["cat","deer","wolf","elephant"]){
 const result=traverse(type);
 console.log(type,result);
 assert.equal(result.mask,255);
 assert.equal(result.visited.length,8);
 assert(result.hp>0&&result.nearby>0&&result.buildings>0&&result.props>0);
}
