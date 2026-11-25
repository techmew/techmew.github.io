"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const source=file=>fs.readFileSync(path.join(__dirname,file),"utf8");
const game=source("game.js");
const P={x:0,y:0,r:10,type:"cat",dir:0};
const mob=(x,y)=>({x,y,r:8,hp:10,type:"rat"});
const rear=mob(-34,0),front=mob(35,0),next=mob(45,0),wall=mob(22,0);
const state={P,mobs:[next,front,rear,wall],dist:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),
 hitboxesOverlap:(a,b,d)=>d<a.r+b.r,lineBlocked:(_p,m)=>m===wall};
vm.runInNewContext(game.slice(game.indexOf("function meleeContacts("),game.indexOf("function resolveAttack(")),state);
const hit=motion=>Array.from(state.meleeContacts(null,motion),c=>c.m);
assert.deepEqual(hit("hind"),[rear]);
assert.deepEqual(hit("claw"),[next,front]);
for(const motion of ["beak","tongue","jaw"])assert.deepEqual(hit(motion),[front]);
front.groundZ=80;
assert.deepEqual(hit("jaw"),[next]);
P.jumpDive=true;assert.deepEqual(hit("hind"),[next]);
P.jumpDive=false;P.jumpTime=0;
const empty={...state,mode:"play",P:{...P,hp:100,pendingStrike:true},mobs:[],
 ambushTarget:null,aerialPounceState:new WeakMap(),playEffect(){},combatMotion:()=>"claw"};
const calls=[];empty.emitCombatFX=(...args)=>calls.push(args[0]);
vm.runInNewContext(game.slice(game.indexOf("function meleeContacts("),game.indexOf("// A full combat kill")),empty);
empty.resolveAttack();
assert.deepEqual(calls,["normal"]);
const victim={...front,groundZ:0,hp:100,r:9,attack:0,staggerGuard:1};
Object.assign(empty,{mobs:[victim],species:{rat:{prey:false}},COMBAT_LEVELS:null,RUSH_POWER:[0,1],
 rainStrength:()=>1,rnd:()=>1,weaponHitDamage:(_m,d)=>d,traitEffect:(_t,n)=>n,
 blood(){},label(){},move(){},elapsed:10,shake:0});
Object.assign(empty.P,{pendingStrike:true,damage:12,rushActiveStep:1,level:1});
const effects=[];empty.emitCombatFX=(...args)=>effects.push(args);
empty.resolveAttack();
assert.equal(victim.hp,88);
assert.deepEqual(effects.map(e=>e[0]),["normal","hit"]);
assert.equal(effects[1][3],victim.x-victim.r*.58);
const uploads=[];
const gl=new Proxy({getShaderParameter:()=>true,getProgramParameter:()=>true,getContextAttributes:()=>({stencil:true}),
 bufferData(_dest,data){assert.equal(data.length%9,0);assert(data.every(Number.isFinite));uploads.push(data.length);}
},{get:(target,k)=>target[k]??(String(k)===String(k).toUpperCase()?1:()=>1)});
const canvas={style:{},getContext:()=>gl,addEventListener(){}};
const browser={window:{},document:{getElementById:()=>canvas},console};
vm.runInNewContext(source("mountain.js"),browser);
vm.runInNewContext(source("webgl3d.js"),browser);
const base={color:"#ad9472",belly:"#d5bf99"},actor={type:"cat",r:18,hp:100,dir:0,base};
const scene={vw:480,vh:800,dpr:1,VIEW:{a:.97,b:.2,c:-.35,d:.68},WORLD:{w:15000,h:8000},
 buildings:[],plants:[],carcasses:[],mobs:[],species:{},P:actor,elapsed:10,weather:"CLEAR",cameraZoom:1};
for(const [x,y] of [[530,465],[10950,3800],[12500,3700]]){
 actor.x=x;actor.y=y;scene.cam={x:x-240,y:y-400};
 for(let i=0;i<2;i++)assert(browser.window.Wild3D.render(scene));
}
vm.runInNewContext(source("movement-trail.js"),browser);
const renderer=browser.window.Wild3D;
const baseline=renderer.stats.dynamicTriangles;
browser.window.WildMovementTrail.record(actor,"water",120,scene.elapsed,0,()=>12);
assert(renderer.render(scene));
assert.equal(renderer.stats.dynamicTriangles,baseline+4,"swimming wake adds only four triangles");
// Alpine snow now uploads after several frames in the same camera sector.
for(let i=0;i<160&&!renderer.stats.snowTriangles;i++)assert(renderer.render(scene));
assert(renderer.stats.snowTriangles>0,"completed alpine mesh");
assert(uploads.some(n=>n>65536),"large finite terrain mesh uploaded");
console.log("Combat contacts, clean misses and six finite mesh frames passed (mock WebGL).");
