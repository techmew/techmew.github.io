/* UFO capture, death postcard and three-owner lifecycle regression.
 * node neo-wild/ufo-death-squad-regression.cjs
 * V8/Canvas mock; NOT an Android/GPU/real browser acceptance. */
"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const read=n=>fs.readFileSync(path.join(__dirname,n),"utf8");
const game=read("game.js"),ufo=read("ufo-events.js"),share=read("death-share.js"),
  squad=read("squad-core.js"),webgl=read("webgl3d.js"),ui=read("squad-gacha-ui.js"),
  html=read("index.html");
for(const source of [game,ufo,share,squad,webgl,ui])new Function(source);
let checks=0;
const ok=(condition,message)=>{assert.ok(condition,message);checks++};
const same=(a,b,message)=>{assert.strictEqual(a,b,message);checks++};
const data=new Map(),localStorage={
 getItem:key=>data.has(key)?data.get(key):null,
 setItem:(key,value)=>data.set(key,String(value)),
 removeItem:key=>data.delete(key)
};
const win={};new Function("window","localStorage",squad)(win,localStorage);
const S=win.WildSquad;
const mk=i=>({id:"qa-owner-"+i,species:"cat",speciesName:"猫",name:"猫"+i,
 alive:true,level:1,grade:"B"});
let r=S.newSquad([mk(1)],"qa-owner-1");
same(r.initialGachaUsed,1,"first free animal");
r=S.markStarted();
same(r.initialGachaUsed,1,"start never consumes two remaining free animals");
r=S.fillVacancy(mk(2));ok(r.ok,"second free animal even after starting");
r=S.fillVacancy(mk(3));ok(r.ok,"third free animal even after starting");
same(r.roster.gachaTickets,0,"initial roster has no additional tickets");
same(r.roster.initialGachaUsed,3,"free draw lifetime limit is three");
ok(!S.fillVacancy(mk(4)).ok,"fourth member rejected");
same(S.addXp(30000).gachaTickets,0,"XP does not generate tickets");
same(S.grantTickets(4).gachaTickets,0,"historic milestone API no longer grants tickets");
r=S.kill("qa-owner-1");
same(r.gachaTickets,0,"permanent death grants no refill");
ok(!S.fillVacancy(mk(4)).ok,"death vacancy cannot be purchased free");
r=S.release("qa-owner-2");
ok(r.ok&&r.roster.gachaTickets===1,"released animal grants one durable draw");
ok(S.fillVacancy(mk(4)).ok,"refill uses release credit");
same(S.load().gachaTickets,0,"refill consumes exactly one draw");
ok(!S.fillVacancy(mk(5)).ok,"no second refill without release");
r=S.release("qa-owner-4");ok(r.ok&&r.roster.gachaTickets===1,"another release earns one");
r=S.release("qa-owner-3");ok(r.ok&&r.roster.members.length===0&&r.roster.gachaTickets===2,
 "last release retains empty-roster credits");
r=S.newSquad([mk(6)],"qa-owner-6");
same(r.initialGachaUsed,3,"new roster cannot reset initial three entitlement");
same(r.gachaTickets,1,"one re-adoption consumes one release ticket");
S.kill("qa-owner-6");
S.newSquad([mk(7)],"qa-owner-7");S.kill("qa-owner-7");
assert.throws(()=>S.newSquad([mk(8)],"qa-owner-8"));checks++;
const start=ufo.indexOf("function drawDeathCard(ctx,x,y,w,h){"),end=ufo.indexOf("function resetWorld(){",start);
ok(start>=0&&end>start,"real UFO art compositor present");
const recorded=[],fake={
 save(){},restore(){},createLinearGradient(){return {addColorStop(){}}},
 fillRect(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){}
};
const env={lastPlayerCapture:{craftCount:3,year:38},
 renderSaucer:(ctx,x,y,r,t,variant)=>recorded.push({x,y,variant})};
const compose=new Function("env","with(env){"+ufo.slice(start,end)+"return drawDeathCard;}")(env);
ok(compose(fake,0,0,1200,402),"captured player gets a UFO death image");
same(recorded.length,3,"three UFOs actually drawn");
same(recorded.filter(x=>x.variant==="scout").length,2,"two escorts visible");
ok(recorded.every(x=>x.x>=0&&x.x<=1200&&x.y>=0&&x.y<402),"all craft in frame");
env.lastPlayerCapture=null;
ok(!compose(fake,0,0,1200,402),"ordinary death does not fabricate craft");
const a=share.indexOf("function cover(ctx,img,x,y,w,h){"),
  b=share.indexOf("function makeCard(sources){",a);
ok(a>=0&&b>a,"real death frame compositor found");
let drawn=null;const ctx={save(){},restore(){},beginPath(){},rect(){},clip(){},
 drawImage:(...args)=>drawn=args};
const cover=new Function(share.slice(a,b)+"return cover;")();
ok(cover(ctx,{width:393,height:873},0,0,1200,402),"mobile portrait photo captured");
ok(drawn[3]>=1200,"photo fills postcard width, no tiny centered strip");
ok(game.includes("if(P&&!P._ufoAbducted)entities.push(P)"),"2D corpse hidden after UFO capture");
ok(webgl.includes("P&&!P._ufoAbducting&&!P._ufoAbducted"),"WebGL corpse hidden after UFO capture");
ok(ufo.includes('P._ufoAbducted=true;P.corpse=false;'),"UFO capture sets corpse-free state");
ok(ufo.includes('if(e.stage==="depart")'),"existing takeoff animation preserved");
ok(share.includes('if(info.cause==="ufo")window.WildUFO?.drawDeathCard'),"real UFO image compositor wired to death card");
ok(html.includes('id="death-share-panel" hidden')&&html.includes('style="width:100%;max-width:100%'),"death card image panel enlarged");
ok(game.includes("function awardGameplayGachaTicket(kind,milestone){")&&
 game.includes("only initial three draws"),"quest rewards cannot mint new animals");
console.log("UFO / DEATH CARD / SQUAD: PASS "+checks+" source-backed V8 checks (not real browser/Android/GPU)");
