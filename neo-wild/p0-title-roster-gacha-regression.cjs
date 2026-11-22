/* P0 title roster and gacha access; production source-backed DOM mock.
 * node neo-wild/p0-title-roster-gacha-regression.cjs
 * Not a real browser, Android, or restored user save. */
"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const ui=fs.readFileSync(path.join(__dirname,"squad-gacha-ui.js"),"utf8");
const coreJs=fs.readFileSync(path.join(__dirname,"squad-core.js"),"utf8");
const css=fs.readFileSync(path.join(__dirname,"title-ui-restore.css"),"utf8");
const html=fs.readFileSync(path.join(__dirname,"index.html"),"utf8");
new Function(ui);new Function(coreJs);
let checks=0;const ok=(value,why)=>{assert.ok(value,why);checks++};
const begin=ui.indexOf(" function updateHome(){"),end=ui.indexOf(" function showSize(){",begin);
ok(begin>0&&end>begin,"production updateHome source");
function el(tag,cl,value){return{tag,className:cl||"",textContent:value||"",children:[],attrs:{},
 append(...nodes){this.children.push(...nodes)},prepend(...nodes){this.children.unshift(...nodes)},
 replaceChildren(...nodes){this.children=[...nodes]},setAttribute(k,v){this.attrs[k]=v},
 addEventListener(k,fn){this["on"+k]=fn}}}
function makeBtn(label,fn,cl){const node=el("button",cl,label);node.handler=fn;return node}
function render(data){
 const roster=el("section"),hint=el("p"),gacha=el("button");let openCount=0;
 const env={core:{load:()=>data,selectActive:()=>({ok:true})},roster,hint,gacha,
  MAX_OWNED:3,RARITY:{basic:"基本"},el,makeBtn,
  preview:()=>el("div","preview"),openSlot:()=>{openCount++},confirmRelease:()=>{},
  window:{WildBossRoster:{load:()=>({members:[]})},dispatchEvent(){}},
  CustomEvent:function(){}};
 new Function("env","with(env){"+ui.slice(begin,end)+"updateHome();}")(env);
 return {roster,hint,gacha,get openCount(){return openCount}};
}
const empty=render(null);
ok(empty.roster.children.length===3,"new game draws three cards");
ok(empty.gacha.hidden===false,"entry visible in new game");
ok(empty.gacha.textContent.includes("ガチャ"),"entry label");
empty.roster.children[0].children[0].handler();
ok(empty.openCount===1,"first empty card is actionable");
const spent=render({version:1,members:[],initialGachaUsed:3,gachaTickets:0});
ok(spent.gacha.hidden===false&&spent.gacha.textContent.includes("新世界"),"party wipe offers confirmed reset choice");
ok(spent.hint.textContent.includes("無料枠は使用済み"),"party wipe explains ticket exhaustion");
const live=[0,1,2,3,4].map(i=>({id:"living-"+i,slotIndex:i,species:"cat",
 speciesName:"猫",name:"猫"+i,rarity:"basic",grade:"A",
 iv:{hp:1,attack:1,speed:1,stamina:1}}));
const old=render({version:1,members:live,leaderId:"living-0",initialGachaUsed:3});
ok(old.roster.children.length===5,"old five-animal roster stays visible");
ok(old.roster.children.every(c=>c.children.length>2),"every old living animal is rendered");
ok(old.gacha.textContent.includes("動物を選択"),"selection entry visible with living animals");
ok(live.length===5,"no mutation to owned roster");
ok(css.includes("#squad-home #squad-open:not([hidden])")&&css.includes("display:flex!important"),"title CSS overrides historical display none");
ok(html.includes("squad-gacha-ui.js?rev=p0-roster-gacha-20261122"),"JS cache updated");
ok(html.includes("title-ui-restore.css?rev=p0-roster-gacha-20261122"),"CSS cache updated");
const os=ui.indexOf(" function openSlot(index){"),oe=ui.indexOf(" function confirmRelease(member){",os);
ok(os>0&&oe>os,"real openSlot source");
const root={hidden:true,scrollTop:12};let showed=false;
const env={core:{load:()=>({members:[],initialGachaUsed:3,gachaTickets:0})},MAX_OWNED:3,
 root,showSize:()=>{showed=true},message:()=>{throw Error("no dead-end message")},
 $:()=>null,window:{},nextSlot:()=>{throw Error("no unearned gacha")}};
new Function("env","with(env){"+ui.slice(os,oe)+"openSlot(0);}") (env);
ok(showed&&root.hidden===false,"exhausted empty plus opens explicit choice");
ok(ui.includes('gacha.removeAttribute("aria-hidden")')&&ui.includes('gacha.removeAttribute("tabindex")'),"gacha restored to screen reader and keyboard");
const memory=new Map(),storage={getItem:k=>memory.has(k)?memory.get(k):null,
 setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};
const W={};
new Function("window","localStorage",coreJs)(W,storage);
const c=W.WildSquad;
ok(!!c&&c.MAX_OWNED===3,"real squad core loads");
const first=c.drawSlot(0,0,0);const animal=first.roll();first.choose(animal.id);
const roster=c.newSquad([animal],animal.id);
ok(roster.members.length===1&&c.load().members[0].id===animal.id,"fresh gacha adopts to verified local storage");
const second=c.drawSlot(0,0,0).roll();second.slotIndex=1;
const a=c.addInitialSlot(second);
ok(a.ok&&c.load().members.length===2&&c.load().initialGachaUsed===2,"another initial animal remains adoptable");
ok(c.selectActive(second.id).ok&&c.load().leaderId===second.id,"leader selection persists");
console.log("P0 TITLE GACHA/ROSTER PASS "+checks+" conditions (source-backed DOM, no browser/Android)");
