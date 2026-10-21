"use strict";
// Run from games/eleventh-witness: node tests/story.test.js
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const root=path.resolve(__dirname,".."),context=vm.createContext({window:{}});
for(const file of ["story.js","cast.js"]){vm.runInContext(fs.readFileSync(path.join(root,file),"utf8"),context,{filename:file,timeout:1000});}
const book=context.window.NOVEL_DATA,cast=context.window.NOVEL_CAST,engine=fs.readFileSync(path.join(root,"engine.js"),"utf8"),html=fs.readFileSync(path.join(root,"index.html"),"utf8");
assert.equal(book.start,"y0_open");assert.equal(cast.people.length,11);
assert.equal(cast.people.filter(x=>x.speaker).length,10);
assert.equal(new Set(cast.people.map(x=>x.id)).size,11);
assert.equal(new Set(cast.people.map(x=>x.color)).size,11);
assert(cast.people.every(x=>x.expressions.length===8));
assert(cast.byId.missing11.spoilerProtected);
assert(engine.includes('SAVE="eleventh_novel_reboot_2026_v1"'));
assert(engine.includes("SLOTS=3"));
assert(html.indexOf('src="story.js"')<html.indexOf('src="cast.js"')&&html.indexOf('src="cast.js"')<html.indexOf('src="engine.js"'));
const scenes=book.scenes;
for(const id of ["opening","survive","y0_open","y1_intro","y2_intro","y3_intro","y4_intro","y4_epilogue"]){assert(scenes[id],"Missing scene "+id);}
const chain={
 "第一夜・記録END":"y1_intro","第二夜・記録END":"y2_intro","第二夜・疑惑END":"y2_intro",
 "第三夜・証言END":"y3_intro","第四夜・記録END":"y4_intro"
};
let nodeCount=0,choiceCount=0;const endings=new Set();
for(const [id,rows] of Object.entries(scenes)){
 assert(Array.isArray(rows)&&rows.length,"Empty scene "+id);
 for(const row of rows){
  nodeCount++;assert(["n","d","c","j","e","f"].includes(row.k),"Invalid node "+id);
  if(row.k==="j")assert(scenes[row.to],"Missing jump "+id+" -> "+row.to);
  if(row.k==="c"){
   choiceCount++;assert(row.opts.length>=2,"Choice missing alternatives "+id);
   for(const opt of row.opts)assert(scenes[opt.to],"Missing option "+id+" -> "+opt.to);
  }
  if(row.k==="d")assert(book.speakers[row.who]||row.who==="不明","Unknown speaker "+row.who);
  if(row.k==="e")endings.add(row.name);
 }
}
for(const end of Object.keys(chain))assert(endings.has(end),"Missing handoff "+end);
function simulate(seed){
 let scene=book.start,index=0,flags={},clues={},choices=0,steps=0,visited=[];
 while(steps++<6000){
  const row=scenes[scene]&&scenes[scene][index];
  assert(row,"Missing scene/index "+scene+"/"+index);
  if(row.when){const neg=row.when[0]==="!",key=neg?row.when.slice(1):row.when;const match=!!(flags[key]||clues[key]);if(neg?match:!match){index++;continue;}}
  if(row.k==="n"||row.k==="d"){index++;continue;}
  if(row.k==="f"){clues[row.key]=row.clue;index++;continue;}
  if(row.k==="j"){scene=row.to;index=0;continue;}
  if(row.k==="c"){
   const opt=row.opts[(seed+choices*7+Math.floor(choices/3))%row.opts.length];
   Object.assign(flags,opt.set||{});choices++;scene=opt.to;index=0;continue;
  }
  if(row.k==="e"){visited.push(row.name);if(chain[row.name]){scene=chain[row.name];index=0;continue;}return {result:row.name,visited,steps,choices};}
 }
 throw Error("Infinite traversal "+seed);
}
const runs=Array.from({length:36},(_,i)=>simulate(i));
assert(runs.some(x=>x.result==="終夜・真相END"),"True ending unreachable");
assert(runs.some(x=>x.result==="終夜・誤認END"),"False final ending unreachable");
assert(runs.some(x=>x.visited.includes("第三夜・証言END")&&x.visited.includes("第四夜・記録END")),"Chapters disconnected");
console.log(JSON.stringify({status:"PASS",scenes:Object.keys(scenes).length,nodes:nodeCount,choiceNodes:choiceCount,endings:[...endings],runs:runs.length,true:runs.filter(x=>x.result==="終夜・真相END").length,misidentification:runs.filter(x=>x.result==="終夜・誤認END").length,saveSlots:3},null,2));
