/* P0: Snow accumulation GPU work budget, real WebGL source in a simulated scene.
 * node neo-wild/snow-frame-budget-regression.cjs
 * Does not claim actual Android/GPU frame rate. */
"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const src=fs.readFileSync(path.join(__dirname,"webgl3d.js"),"utf8");
const game=fs.readFileSync(path.join(__dirname,"game.js"),"utf8");
const index=fs.readFileSync(path.join(__dirname,"index.html"),"utf8");
new Function(src);new Function(game);
let checks=0;const ok=(v,msg)=>{assert.ok(v,msg);checks++};
const start=src.indexOf("  const snow=clamp(o.snowpack||0,0,1);");
const end=src.indexOf("  // Lightweight water wakes",start);
ok(start>0&&end>start,"extract production WebGL snow block");
const gl={ARRAY_BUFFER:34962,STATIC_DRAW:35044,uploads:[],bindBuffer(){},
 bufferData(target,data,usage){this.uploads.push({target,length:data.length,usage})}};
const env={o:{snowpack:.66,waterAt:()=>0,disasterEvents:[]},
 window:{WildMountain:{height:()=>12,snowCover:()=>.75}},
 vw:380,vh:780,dpr:2,cam:{x:12200,y:3350},VIEW:{a:.75,b:.16,c:-.23,d:.54},
 WORLD:{w:13500,h:6000},elapsed:0,gl,snowBuffer:{},snowCacheKey:"",snowBuild:null,
 snowCount:0,snowRebuilds:0,meshData:new Float32Array(200000),meshLength:27,
 clamp:(x,a,b)=>Math.max(a,Math.min(b,x)),
 detailNoise:v=>{const n=Math.sin(v*1.23)*2457.83;return n-Math.floor(n)},
 color:()=>[1,1,1],isVisible:()=>true};
env.meshData[0]=371;
env.triangle=()=>{
 if(env.meshLength+27>=env.meshData.length){
  const more=new Float32Array(env.meshData.length*2);more.set(env.meshData);env.meshData=more;
 }
 env.meshLength+=27;
};
const execute=new Function("env","with(env){"+src.slice(start,end)+"}");
const frames=n=>{for(let i=0;i<n;i++){execute(env);env.elapsed+=1/60}};
frames(1);
ok(gl.uploads.length===0,"no single-frame giant snow upload");
ok(env.snowBuild!==null,"large surface yields until next frame");
ok(env.meshLength===27&&env.meshData[0]===371,"dynamic mesh remains untouched");
frames(140);
ok(gl.uploads.length===1&&env.snowRebuilds===1,"complete snow uploads exactly once");
ok(env.snowCount>0,"real snow geometry reaches GPU");
const mobileSize=gl.uploads[0].length;
ok(mobileSize<330000,"adaptive mobile grid cuts GPU vertex volume further");
frames(60);
ok(gl.uploads.length===1,"unchanged snow state does not rebuild");
env.o.snowpack=.662;
frames(60);
ok(gl.uploads.length===1,"tiny snowpack fluctuations do not trigger GPU rebuild");
env.o.snowpack=.66;
env.cam.x+=256;
frames(140);
ok(gl.uploads.length===2,"new camera sector updates snow surface");
env.o.snowpack=.80;
frames(140);
ok(gl.uploads.length===3,"new snow depth updates the surface");
ok(env.snowBuild===null&&env.meshLength===27,"new surface completes and preserves dynamic mesh");
const fallStart=game.indexOf(' if(weather==="SNOW"&&mode!=="dying"){');
const fallEnd=game.indexOf(' if(weather==="WIND"',fallStart);
ok(fallStart>0&&fallEnd>fallStart,"real snowfall source exists");
const canvas={arcs:0,fills:0,save(){},restore(){},beginPath(){},moveTo(){},
 arc(){this.arcs++},fill(){this.fills++}};
new Function("env","with(env){"+game.slice(fallStart,fallEnd)+"}")(
 {weather:"SNOW",mode:"play",ctx:canvas,elapsed:15,vw:380,vh:780,TWO:Math.PI*2});
ok(canvas.arcs===145&&canvas.fills===1,"145 visible flakes drawn with one paint");
const drawStart=game.indexOf("function drawWorldSnow2D(");
const drawEnd=game.indexOf("function drawScene()",drawStart);
ok(drawStart>0&&drawEnd>drawStart&&game.slice(drawStart,drawEnd).includes("ctx.fill();ctx.restore();"),
 "Canvas fallback snow combines contour fills");
// Exercise the actual fallback path: beginPath inside the tile loop would
// discard all but the final polygon before the single fill.
let contours=0,painted=0,paints=0;
const fallback={save(){},restore(){},beginPath(){contours=0},moveTo(){contours++},
 lineTo(){},closePath(){},fill(){painted=contours;paints++}};
const drawFallback=new Function("env","with(env){"+game.slice(drawStart,drawEnd)+";return drawWorldSnow2D}")({
 ctx:fallback,MOUNTAIN:null,WORLD:{w:192,h:128},vw:192,vh:128,visible:()=>true,
 window:{},elapsed:0,noise:()=>0,waterDepth:(x)=>x>=192?1:0,
 snowTiles2D:new Map(),tileSnowAmount:-1
});
drawFallback(1,0,0);
ok(paints===1&&painted===8,"four solid tiles and four shoreline triangles survive one paint");
ok(index.includes("webgl3d.js?rev=debug-end-snow-lod-20261127")&&
   /game\.js\?rev=[\w-]+/.test(index),"cache revisions include both fixes");
console.log("SNOW GPU/CPU BUDGET PASS "+checks+" checks, mobile mesh "+mobileSize+" floats (mock, not Android FPS)");
