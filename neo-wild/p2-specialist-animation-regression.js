// Run: node neo-wild/p2-specialist-animation-regression.js
"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const game=fs.readFileSync(path.join(__dirname,"game.js"),"utf8"),webgl=fs.readFileSync(path.join(__dirname,"webgl3d.js"),"utf8");
new Function(game);new Function(webgl);
const types=["manul","tibetanFox","shoebill","penguin"],set=new Set(types);
const fields=["attackAction","flipperStrike","beakVisual","shoebillSwingTime","pounceTime"];
const start=game.indexOf("function tickSpecialistCombatPose("),end=game.indexOf("const SPECIALIST_CONTEST_FIELDS=",start);
assert(start>=0&&end>start);
const tick=new Function("m","dt","SPECIALIST_HUNTERS","SPECIALIST_POSE_FIELDS",game.slice(start,end)+"tickSpecialistCombatPose(m,dt);");
let checks=0;
function eq(a,b,msg){assert.strictEqual(a,b,msg);checks++}
function ok(a,msg){assert(a,msg);checks++}
ok(game.indexOf("tickSpecialistCombatPose(m,dt);")<game.indexOf("if(m.companion){updateCompanion(m,dt);continue;}"),"tick before early returns");
ok(game.includes("SPECIALIST_HUNTERS.has(t))?Math.max(0,o.attackAction||0):0"),"Canvas NPC strike");
ok(game.includes("specialistBodyDrive")&&game.includes("ctx.rotate(Math.sin(Math.PI*Math.min(1,(o.attackAction||0)/.45))"),"Canvas recoil");
for(const type of types){
 ok(webgl.includes(type)&&webgl.includes("attackAction"),type+" WebGL model and combat poses");
 const m={type,attackAction:.38,flipperStrike:.43,beakVisual:.46,shoebillSwingTime:.35,pounceTime:.24,attackActionStep:3};
 tick(m,.15,set,fields);
 ok(m.attackAction>.22&&m.attackAction<.24,type+" advance");
 tick(m,.4,set,fields);
 for(const key of fields)eq(m[key],0,type+" "+key+" reset");
 eq(m.attackActionStep,0,type+" combo reset");
 m.attackAction=.4;tick(m,0,set,fields);eq(m.attackAction,.4,type+" pause");
}
console.log("PASS: "+checks+" checks, four NPC strike poses, Canvas/WebGL references, pause and recovery");