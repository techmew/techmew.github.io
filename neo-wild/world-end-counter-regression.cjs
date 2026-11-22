const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const read=name=>fs.readFileSync(path.join(__dirname,name),"utf8");
const window={},records=new Map();
new Function("window","localStorage",read("world-end.js"))(window,{
 getItem:key=>records.get(key),setItem:(key,value)=>records.set(key,value)
});
const P={x:2800,y:2800,r:16},boss=window.WildWorldEnd,game=read("game.js");
const damage=new Function("window","P",game.slice(game.indexOf("function weaponHitDamage("),
 game.indexOf("function nearestWeaponScrap("))+"return weaponHitDamage;")(window,P);
for(const evade of [true,false]){
 records.clear();
 const mobs=[],env={P,mobs,WORLD:{w:13600,h:6000},year:100,dt:.05,elapsed:12000};
 const tick=()=>{env.elapsed+=env.dt;boss.tick(env);};
 tick();const m=mobs[0];m.worldEndCooldown=0;tick();
 assert(m.worldEndThreats.length);
 const target=m.worldEndThreats[0];
 P.x=target.x+(evade?target.radius+P.r+10:0);P.y=target.y;
 while(m.worldEndCharge>0)tick();
 assert.equal(damage(m,100),evade?135:100);
 if(evade){
  const x=m.x,y=m.y;tick();assert.equal(m.x,x);assert.equal(m.y,y);
  for(let i=0;i<50;i++)tick();
  assert.equal(damage(m,100),100);
 }
}
console.log("PASS final boss dodge, counter damage, recovery and direct hit");
