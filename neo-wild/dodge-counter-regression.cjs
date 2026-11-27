const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const read=file=>fs.readFileSync(path.join(__dirname,file),"utf8");
const window={};new Function("window",read("dodge-counter.js"))(window);
const duel=window.WildDodgeCounter,a={x:38,y:0,r:12,hp:80},
 m={x:0,y:0,r:16,hp:80,strikeDir:0,windup:.5},other={...m};
const clear=()=>false;
assert(duel.begin(a,m,0,70));assert(!duel.begin(a,other,.01,70));
const paths=[];const ctx=new Proxy({},{get:(o,k)=>(...v)=>paths.push([k,...v])});
const project=(x,y)=>({x,y});
duel.draw(ctx,a,.1,project);assert(paths.some(([k])=>k==="lineTo"));
assert(!duel.miss(a,m,.5,clear));
a.x+=16;assert(!duel.miss(a,m,.5,clear));
a.y+=32;assert(!duel.miss(a,m,.5,()=>true));
a.inv=.1;assert(!duel.miss(a,m,.5,clear));a.inv=0;
assert(duel.miss(a,m,.5,clear));
paths.length=0;duel.draw(ctx,a,.6,project);assert(paths.some(([k])=>k==="ellipse"));
assert(!duel.strike(a,other,.6));assert(!duel.strike({...a},m,.6));
const src=read("game.js");let sounds=0;
const damage=new Function("window","P","elapsed","playEffect",src.slice(src.indexOf("function weaponHitDamage("),src.indexOf("function nearestWeaponScrap("))+"return weaponHitDamage")(window,a,.65,()=>sounds++);
assert.equal(damage(m,20),25);assert.equal(damage(m,20),20);assert.equal(sounds,1);
paths.length=0;duel.draw(ctx,a,.70,project);assert(paths.some(([k])=>k==="rotate"));
paths.length=0;duel.draw(ctx,a,.90,project);assert.equal(paths.length,0);
assert(duel.begin(a,m,2,70));a.y-=32;assert(duel.miss(a,m,2.4,clear));assert(!duel.strike(a,m,3.26));
for(const key of ["strongBoss","salvageCacheId","worldEndBoss","companion"])assert(!duel.begin(a,{...m,[key]:true},4,70));
console.log("PASS directional evasion, timed cue, identity, single counter, protected encounters");
function timedEvade(cross,guard=false){
 const w={};new Function("window",read("dodge-counter.js"))(w);
 const d=w.WildDodgeCounter,p={x:38,y:0,r:12,hp:80},e={...m,salvageCacheId:guard?"g":null};
 d.begin(p,e,0,70);p.y=24;d.track(p,cross);
 assert(d.miss(p,e,.5,clear));return {d,p,e};
}
for(const guard of [false,true]){
 const {d,p}=timedEvade(.38,guard);
 assert.equal(d.timeScale(p,.016),.22);
 assert(d.timeScale(p,.23)>.22);
 assert.equal(d.timeScale(p,.21),1);
}
{
 const {d,p}=timedEvade(.18);assert.equal(d.timeScale(p,.016),1);
 const late=timedEvade(.48);assert.equal(late.d.timeScale(null,.02),1);assert.equal(late.d.timeScale(late.p,.02),1);
}
const burstStart=src.indexOf("function drawContactBurst(");
const burst=new Function(src.slice(burstStart,src.indexOf("function drawCombatFX(",burstStart))+"return drawContactBurst")();
for(const [style,polygons] of [["claw",4],["jaw",3],["body",9]]){
 paths.length=0;burst(ctx,{x:2,y:3},1,12,.25,style,"#fff");
 assert.equal(paths.filter(([k])=>k==="closePath").length,polygons);
 assert.equal(paths.filter(([k])=>k==="fill").length,2);
}
{
 const {d,p,e}=timedEvade(.47);
 d.timeScale(p,.016);assert(d.strike(p,e,.55));d.timeScale(null,.01);
 paths.length=0;d.draw(ctx,p,.56,project);
 assert(paths.some(([k])=>k==="fill"));assert(!paths.some(([k])=>k==="ellipse"));
 paths.length=0;d.draw(ctx,p,.8,project);
 assert(paths.some(([k])=>k==="ellipse"));assert(paths.filter(([k])=>k==="closePath").length>=10);
 paths.length=0;d.draw(ctx,p,.99,project);assert.equal(paths.length,0);
}
