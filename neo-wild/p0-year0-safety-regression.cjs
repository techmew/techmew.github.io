/* P0 early-game safety. Node CLI: node neo-wild/p0-year0-safety-regression.cjs.
 * V8 mock only; not browser, GPU, real device or measured FPS.
 */
"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const read=n=>fs.readFileSync(path.join(__dirname,n),"utf8");
const game=read("game.js"),ufo=read("ufo-events.js"),apparitions=read("apparitions.js");
for(const s of [game,ufo,apparitions])new Function(s);
const data=new Map(),localStorage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,String(v))};
const window={WildWorldClock:{eventYear:y=>y*3,eventIntervalYears:y=>y/3}};
new Function("window","localStorage",ufo)(window,localStorage);
new Function("window","localStorage",apparitions)(window,localStorage);
const P={type:"cat",hp:100,sp:100,r:20,maxHp:100,x:9000,y:1950};
const w={P,mobs:[],mode:"play",WORLD:{w:13600,h:6000},lineBlocked:()=>false,notify:()=>{},elapsed:0,worldYear:0};
let n=0;
for(let i=0;i<150;i++){
 w.elapsed=2+i*.7;w.worldYear=w.elapsed/120;
 window.WildUFO.tick(.7,w);window.WildApparitions.tick(.7,w);
 assert.equal(window.WildUFO.active,null,"YEAR0 UFO");n++;
 assert.equal(window.WildApparitions.active,null,"YEAR0 ghost");n++;
}
for(const [yes,msg] of [
 [game.includes("if(elapsed<240&&!window.WildDebugSandbox?.active)return 1"),"novice one guardian"],
 [game.includes("Math.hypot(m.x-P.x,m.y-P.y)<880"),"no overlapping siege"],
 [game.includes("if(elapsed>=240)spawnWeaponScrap"),"no early random junk"],
 [game.includes('if(P.type==="carp")return;'),"fish land siege disabled"],
 [game.includes("if(elapsed<360&&!window.WildDebugSandbox?.active)return"),"boss after year3"],
 [game.includes("if(!escape)continue"),"spawn exit path"]
]){assert.ok(yes,msg);n++;}
console.log("P0 YEAR0 SANCTUARY PASS "+n+" V8 checks (not device)");
