/* node neo-wild/p2-bestiary-acquisition-regression.js
 * Headless, isolated save: checks gacha ownership registration without touching real saves.
 */
"use strict";
const fs=require("fs"),path=require("path"),assert=require("assert");
const root=__dirname,source=fs.readFileSync(path.join(root,"bestiary.js"),"utf8");
const ui=fs.readFileSync(path.join(root,"squad-gacha-ui.js"),"utf8");
new Function("window","document","localStorage",source);
new Function("window","document","localStorage",ui);
const store=new Map(),storage={
 getItem:k=>store.has(k)?store.get(k):null,
 setItem:(k,v)=>store.set(k,String(v)),
 removeItem:k=>store.delete(k)
};
const fakeCanvas={addEventListener(){},getContext:()=>null};
const doc={getElementById:id=>id==="bestiary-preview"?fakeCanvas:null,addEventListener(){},querySelectorAll:()=>[]};
const models=Object.fromEntries(["manul","tibetanFox","shoebill","penguin"].map(id=>[id,{color:"#999",r:18}]));
function boot(squad){
 const w={WildSquad:{load:()=>({members:squad})}};
 new Function("window","document","localStorage",source)(w,doc,storage);
 w.WildBestiary.configure(models,{});
 return w.WildBestiary;
}
let b=boot([{species:"manul"}]);
assert(b.isKnown("manul"),"existing owned animal must migrate");
for(const id of ["tibetanFox","shoebill","penguin"])assert(!b.isKnown(id),"unowned species must remain locked");
for(const id of ["tibetanFox","shoebill","penguin"])assert(b.recordAcquired(id),"first acquisition must unlock");
assert(!b.recordAcquired("penguin"),"duplicate acquisition must be idempotent");
assert.deepStrictEqual(JSON.parse(storage.getItem("wild-reclaim-bestiary-v1")),{},"ownership must not fake kills");
b.recordKill("penguin");
assert.strictEqual(JSON.parse(storage.getItem("wild-reclaim-bestiary-v1")).penguin,1);
b=boot([]);
for(const id of Object.keys(models))assert(b.isKnown(id),"acquired species lost on reload: "+id);
const commit=ui.slice(ui.indexOf("const staged=chosen[0]"),ui.indexOf('new CustomEvent("wild-squad-refilled"'));
for(const branch of ["core.fillVacancy(staged)","core.newSquad(chosen,leader)"]){
 const registration=commit.indexOf("for(const member of chosen)window.WildBestiary?.recordAcquired?.(member.species)");
 assert(commit.includes(branch)&&registration>commit.indexOf(branch),"registration follows "+branch);
}
console.log("PASS: bestiary four species, migration, gacha hooks, persistence, separate kill counts");
