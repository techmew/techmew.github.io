/* P3 east exploration + arsenal executable integration regression.
   Run: node neo-wild/p3-east-arsenal-integration-regression.cjs */
"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const root=__dirname,records=new Map(),store={
 getItem:k=>records.has(k)?records.get(k):null,
 setItem:(k,v)=>{records.set(k,String(v));},
 removeItem:k=>records.delete(k)
};
const window={localStorage:store,WildMountain:{height:()=>0}};
const context=vm.createContext({window,console,Math,Number,Map,Set,Object,Array,JSON});
for(const file of ["east-expedition.js","wild-arsenal.js"]){
 vm.runInContext(fs.readFileSync(path.join(root,file),"utf8"),context,{filename:file});
}
const E=window.WildEastExpedition,A=window.WildArsenal;
let checks=0;const ok=(v,msg)=>{assert.ok(v,msg);checks++};
ok(E.stops.length===8,"eight physical destinations");
ok(E.walkway.length===18,"18 navigable route vertices");
for(const stop of E.stops){
 const player={x:stop.x,y:stop.y,hp:100,type:"cat"};
 ok(E.arrival(player,0)?.id===stop.id,"stop discovery "+stop.id);
 ok(E.navigation(player,0,false)?.stop!=null,"navigation "+stop.id);
 ok(E.fieldStatus(player,0,"CLEAR",0)?.target!=null,"field status "+stop.id);
}
for(const pos of [[11320,3530],[12320,3260],[13190,3790],[8700,1750]]){
 const p={x:pos[0],y:pos[1],hp:100,type:"carp"};
 const n=E.navigation(p,0,true),status=E.fieldStatus(p,0,"RAIN",0);
 ok(["ravine","headwater"].includes(n.stop.id),"carp water stop");
 ok(n.stop.id===status.target.id,"carp HUD and route agree");
 ok(n.x===n.stop.x&&n.y===n.stop.y,"carp avoids dry walkway vertices");
}
ok(A.owners.length===35,"35 species");
ok(A.grades.reduce((s,g)=>s+g.weight,0)===1000,"rarity weights");
const scraps=[];
for(let i=0;i<240;i++){
 const scrap={id:"p3test-"+i,seed:i+1,x:8500+i,foundAt:100+i};
 const result=A.open(scrap);ok(result.ok&&!result.duplicate,"collect scrap "+i);
 scraps.push(result.item);
}
ok(A.read().vault.items.length===240,"full shared vault");
ok(!A.open({id:"overflow",seed:999,x:9000}).ok,"vault refuses overflow");
ok(!A.open({id:"west",seed:999,x:8300}).ok,"no western weapons");
const first=scraps[0],actor={type:first.owner,squadIndividualId:"living-1"};
ok(A.equip(actor,first.id).ok,"equip correct species");
ok(A.equippedFor(actor)?.id===first.id,"individual binding");
ok(!A.equip({type:"invalid",squadIndividualId:"living-2"},first.id).ok,"reject wrong species");
const boss={strongBoss:true},normal={strongBoss:false};
ok(A.damage(actor,boss,100)>A.damage(actor,normal,100),"boss damage multiplier");
const before=records.get(A.KEY);
const windowReload={localStorage:store};
vm.runInNewContext(fs.readFileSync(path.join(root,"wild-arsenal.js"),"utf8"),{window:windowReload});
ok(windowReload.WildArsenal.equippedFor(actor)?.id===first.id,"reload preserves equipment");
ok(records.get(A.KEY)===before,"reload does not alter save");
console.log("P3 east+arsenal integration PASS: "+checks+" assertions (Node VM; not browser/WebGL/Android)");
