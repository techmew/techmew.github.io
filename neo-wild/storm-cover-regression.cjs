const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const source=name=>fs.readFileSync(path.join(__dirname,name),"utf8");
const window={};
for(const file of ["mountain.js","storm-cover.js","dodge-counter.js"])new Function("window",source(file))(window);
const mountain=window.WildMountain,storm=window.WildStormCover;
storm.index(mountain,[]);
for(const group of [mountain.trees,mountain.rocks]){
 const prop=group.find(p=>mountain.meadowAt(p.x,p.y)&&p.r>=30);
 assert(prop);
 const actor={x:prop.x+prop.r+18,y:prop.y,r:14};
 assert(storm.cover(actor,[]));
 assert(!storm.cover({...actor,flying:true},[]));
}
storm.index(null,[{kind:"sapling",x:32,y:64}]);
const actor={x:32,y:64,hp:80,r:12},mob={...actor},far={...mob,x:1000};
assert.equal(storm.target(actor,[]).x,32);
assert(!storm.cover(far,[]));
storm.ignite(32,64);
const burn=(a,f,dt)=>a.hp-=8*dt;
storm.tick(1,"CLEAR",actor,[mob,far],burn);
assert.equal(actor.hp,72);assert.equal(mob.hp,72);assert.equal(far.hp,80);
const saved=storm.snapshot();storm.restore([]);assert.equal(storm.snapshot().length,0);
storm.restore(saved);storm.tick(4,"RAIN",actor,[],burn);assert.equal(storm.snapshot().length,0);
storm.ignite(32,64);storm.tick(33,"CLEAR",actor,[],burn);assert.equal(storm.snapshot().length,0);
const src=source("game.js"),duel=window.WildDodgeCounter;
const attempt=new Function("window","P","elapsed","mode","isControlBlocked","getAxes","playEffect",
 src.slice(src.indexOf("function tryPounceDodge"),src.indexOf("function dash(){"))+"return tryPounceDodge()"); 
const p={x:38,y:0,hp:80,r:12,sp:40},enemy={x:0,y:0,hp:80,r:16,strikeDir:0,windup:.5};
const press=()=>attempt(window,p,.4,"play",()=>false,()=>({x:0,y:-1}),()=>{});
assert(!press());duel.begin(p,enemy,0,70);assert(press());
assert.equal(p.sp,28);assert.equal(p.pounceDir,-Math.PI/2);assert(!p.pendingStrike);assert(!press());
p.y-=24;duel.track(p,.45);assert(duel.miss(p,enemy,.5,()=>false));assert.equal(duel.timeScale(p,.016),.22);
console.log("Passed meadow refuges, fire damage, persistence, extinction and pounce counter");
