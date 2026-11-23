/* Regression for mobile squad adoption buttons and exhausted first-three tickets.
 * node neo-wild/squad-confirm-regression.cjs
 * Source-backed V8 DOM mock; not a browser or Android run. */
"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const src=fs.readFileSync(path.join(__dirname,"squad-gacha-ui.js"),"utf8");
new Function(src);
const begin=src.indexOf(" function finish(){");
const end=src.indexOf(" function showLivingSquad(){",begin);
const head=src.indexOf(' const close=makeBtn("この個体で決定",()=>{');
const headEnd=src.indexOf(' const cancel=makeBtn("ガチャ結果をキャンセル"',head);
assert.ok(begin>0&&end>begin&&head>0&&headEnd>head);
let checks=0;function ok(value,message){assert.ok(value,message);checks++}
function element(tag,cl,value){return{tag,className:cl||"",textContent:value||"",children:[],
 value:"",hidden:false,disabled:false,attrs:{},
 append(...items){this.children.push(...items)},replaceChildren(...items){this.children=[...items]},
 setAttribute(k,v){this.attrs[k]=v},addEventListener(k,fn){if(k==="click")this.handler=fn},
 click(){if(!this.disabled)this.handler?.()},
 querySelector(q){const descendants=[];const walk=n=>{for(const child of n.children){descendants.push(child);walk(child)}};walk(this);
  const named=(cl,tag)=>descendants.find(n=>(!cl||n.className.split(" ").includes(cl))&&(!tag||n.tag===tag))||null;
  if(q.includes(".squad-gacha-actions .squad-adopt")){
   const foot=named("squad-gacha-actions");return foot?.querySelector(".squad-adopt")||null;
  }
  if(q===".squad-adopt")return named("squad-adopt");
  if(q===".squad-reset-start")return named("squad-reset-start");
  if(q===".squad-final-field input")return named(null,"input");
  return null;
 } }}
const el=(...args)=>element(...args);
const makeBtn=(label,handler,cl)=>{const node=el("button",cl,label);node.handler=handler;return node};
function scenario(error,refill=false){
 const acquired=[];
 const body=el("div","squad-gacha-body"),root=el("section","squad-gacha"),info=el("p");
 let saved=0,updates=0,dispatched=0,savedRoster=refill?[{id:"first",species:"cat"}]:[];
 const id="penguin-test-1";
 const chosen=[{id,species:"penguin",speciesName:"ペンギン",grade:"C",name:"ハルゾウ",
  iv:{hp:.67,attack:1.05,speed:.97,stamina:.92}}];
 const env={body,root,info,chosen,draw:{options:[{id}]},selected:id,
  slotTarget:0,leader:null,refill,MAX_OWNED:3,$:()=>null,committing:false,activeConfirm:null,el,makeBtn,preview:()=>el("canvas","portrait"),
  OPERABLE:new Set(["penguin"]),nextSlot(){},confirmReset(){info.textContent="reset confirmation"},
  updateHome(){updates++},window:{WildBestiary:{recordAcquired(species){acquired.push(species)}},dispatchEvent(){dispatched++}},
  Event:function(){},CustomEvent:function(){},core:{fillVacancy(item){
   saved++;if(error)throw Error(error);savedRoster.push(item);return {ok:true};},load(){return{members:savedRoster}},newSquad(items){
   saved++;if(error)throw Error(error);savedRoster=items;return{members:items};}}};
 new Function("env","with(env){"+src.slice(begin,end)+"finish();}")(env);
 const top=new Function("env","with(env){"+src.slice(head,headEnd)+"return close;}")(env);
 return {env,top,acquired,get saved(){return saved},get updates(){return updates},get dispatched(){return dispatched}};
}
let a=scenario();ok(!!a.env.body.querySelector(".squad-gacha-actions .squad-adopt"),"bottom action");
a.top.click();ok(a.saved===1&&a.env.root.hidden&&a.updates===1&&a.dispatched===1,"header commits roster");
a=scenario();a.env.body.querySelector(".squad-gacha-actions .squad-adopt").click();
ok(a.saved===1&&a.env.root.hidden,"bottom commits same roster");
a=scenario("最初の3体分を使い切りました。放流券が必要です");
a.top.click();ok(a.saved===1&&!a.env.root.hidden&&a.env.info.textContent.includes("放流券"),"visible no-credit failure");
const reset=a.env.body.querySelector(".squad-reset-start");ok(!!reset,"explicit new world reset offered");
reset.click();ok(a.env.info.textContent==="reset confirmation","reset never silently erases save");
a=scenario("編成の保存を確認できません。端末の保存容量を確認してください");
a.top.click();ok(!a.env.root.hidden&&a.env.info.textContent.includes("保存"),"visible save failure");
ok(src.includes("if(!(Math.max(0,3-(rights?.initialGachaUsed||0))+(rights?.gachaTickets||0)))"),"checks credits before drawing");
for(const refill of [false,true]){
 const success=scenario(null,refill);
 success.top.click();success.top.click();
 assert.deepEqual(success.acquired,["penguin"]);
 const failed=scenario("保存失敗",refill);
 failed.top.click();
 assert.deepEqual(failed.acquired,[]);
}
console.log("SQUAD CONFIRM PASS "+checks+" source-backed V8 DOM checks (not browser/Android)");
