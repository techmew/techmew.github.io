"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const source=file=>fs.readFileSync(path.join(__dirname,file),"utf8");
const game=source("game.js");
let raw=null,reads=0,inject=false,elapsed=10,parses=0;
const foreign=JSON.stringify({elapsed:15,saveSessionId:"other",savedAt:100});
const env={window:{},console:{warn(){}},AUTOSAVE_KEY:"auto",SAVE_TAB_ID:"local",approvedForeignSaveAt:null,
 pantrySaveConflict:false,debugTutorialSession:false,persistWorldChronicle(){},persistSquadVitals(){},
 currentSnapshot:()=>({elapsed,saveSessionId:"local"}),isValidSnapshot:s=>Number.isFinite(s?.elapsed),
 JSON:{stringify:JSON.stringify,parse(s){parses++;return JSON.parse(s)}},
 localStorage:{getItem(k){if(k!=="auto")return null;if(inject&&++reads===2)raw=foreign;return raw;},
 setItem(k,v){raw=v;},removeItem(){raw=null;}}};
vm.runInNewContext(game.slice(game.indexOf("let verifiedAutoRaw"),game.indexOf("function checkpointLabel")),env);
assert(env.saveAuto());elapsed++;assert(env.saveAuto());assert.equal(parses,0);
elapsed=3;assert.equal(env.saveAuto(),false);assert.equal(JSON.parse(raw).elapsed,11);
elapsed=12;inject=true;assert.equal(env.saveAuto(),false);assert.equal(raw,foreign);
inject=false;assert.equal(env.saveAuto(),false);assert.equal(raw,foreign);
raw="broken";assert.equal(env.saveAuto(),false);assert.equal(raw,"broken");
const noop=()=>1,gl=new Proxy({getContextAttributes:()=>({stencil:true})},{get:(obj,k)=>obj[k]??(k===k.toUpperCase()?1:noop)});
const browser={window:{},console,document:{getElementById:()=>({style:{},getContext:()=>gl,addEventListener:noop})}};
vm.runInNewContext(source("webgl3d.js"),browser);
const renderer=browser.window.Wild3D;
const scene={vw:480,vh:800,dpr:1,cam:{x:239,y:100},VIEW:{a:1,b:0,c:0,d:.7},WORLD:{w:15000,h:8000},
 buildings:[],plants:[],carcasses:[],mobs:[],species:{},P:null,elapsed:10,weather:"CLEAR",cameraZoom:1};
for(let i=0;i<40;i++){scene.cam.x=239+i%2*2;assert(renderer.render(scene));}
assert.equal(renderer.stats.staticRebuilds,1);
scene.cam.x+=170;assert(renderer.render(scene));assert.equal(renderer.stats.staticRebuilds,2);
scene.vw++;assert(renderer.render(scene));assert.equal(renderer.stats.staticRebuilds,3);
console.log("City boundary reuse, travel, resize and verified save ownership passed.");
scene.mobs=["cat","dog","fox","wolf"].map((type,i)=>({
 type,id:i+1,x:scene.cam.x+120+i*40,y:scene.cam.y+300,r:16,hp:10,flash:.18,dir:0
}));
assert(renderer.render(scene));
assert(renderer.stats.dynamicTriangles>0 && renderer.stats.dynamicTriangles<=5000,"four combat models exceed the triangle budget");
console.log("Combat triangles",renderer.stats.dynamicTriangles);
