// Run with: node neo-wild/p2-specialist-survival-loop-regression.js
// Real production player-action and food functions; isolated mock saves only.
"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const source=fs.readFileSync(path.join(__dirname,"game.js"),"utf8");new Function(source);
function part(a,b){const i=source.indexOf(a),j=source.indexOf(b,i+a.length);assert(i>=0&&j>i,"missing "+a);return source.slice(i,j);}
assert(source.includes("SPECIALIST_HUNTERS.has(m.type))&&updateFoodThief(m,dt,d)"),"NPC not wired");
const f=new Function("w","with(w){"+part("const SPECIALIST_CONTEST_FIELDS=","const RUSH_COST")+part("function carryFood(){","function inheritStrongTrait(")+part("function eatFromDen(kind){","function stockpileStep()")+";return {contextAction,carryFood,eat,eatFromDen};}");
let checks=0;
function eq(a,b,m){assert.strictEqual(a,b,m);checks++}
function ok(a,m){assert(a,m);checks++}
for(const type of ["manul","tibetanFox","shoebill","penguin"]){
 function make(){
  const meat={type:"corpse",amount:30,initialAmount:30,animalType:"rat",claimedBy:"token",claimUntil:140,x:100,y:100,r:12,ttl:150};
  const mob={type,hp:30,x:120,y:100,r:15,feedClaimToken:"token",feedClaimUntil:140,alert:0,search:0};
  const w={mode:"play",elapsed:100,meals:0,mission:0,SPECIALIST_HUNTERS:new Set(["manul","tibetanFox","shoebill","penguin"]),
   mobs:[mob],carcasses:[meat],species:{rat:{food:30},[type]:{name:type}},P:{type,x:100,y:100,r:20,level:1,hp:40,maxHp:100,hunger:20,sp:90,eatCD:0,groundZ:0,jumpHeight:0},
   denStores:{meat:0,berries:0,legacy:0},denMeatLots:[],denStash:0,nearDen:false,fail:false,
   window:{WildFloodRescue:{tryBegin:()=>false}},isControlBlocked:()=>false,tryReleaseCaveSeal:()=>false,markTerritory:()=>false,
   atDen:()=>w.nearDen,dist:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),lineBlocked:()=>false,isPlayerConcealed:()=>false,foodAtActorLevel:()=>true,
   clamp:(x,a,b)=>Math.max(a,Math.min(b,x)),denCapacity:()=>200,normalizeMeatLots:(lots)=>lots,
   foodName:()=>"肉",foodBalance:()=>({stash:1.5,satiety:1.5,healing:.5}),meatSizeName:()=>"中",carriedFoodBurden:()=>0,
   syncDenStash:()=>{w.denStash=w.denStores.meat+w.denStores.berries+w.denStores.legacy},
   saveDenStash:()=>{w.pan=JSON.parse(JSON.stringify(w.denStores));return true},
   saveAuto:()=>{if(w.fail)return false;w.persist=JSON.parse(JSON.stringify({P:w.P,mobs:w.mobs,carcasses:w.carcasses,denStores:w.denStores}));return true},
   notify:()=>{},syncHUD:()=>{},checkMission:()=>{},announceObjective:()=>{},sootheStrongWound:()=>0,
   openDenInventory:()=>{w.mode="inventory"},renderDenInventory:()=>{},putDownFood:()=>{},label:()=>{},blood:()=>{},playEffect:()=>{},toBones:c=>{c.type="bones";c.amount=0;c.ttl=45}};
  return {w,meat,mob,api:f(w)};
 }
 let {w,meat,mob,api}=make();
 api.contextAction(true);
 eq(w.P.carry.amount,13,type+" pickup");
 eq(meat.amount,17,type+" carcass remainder");
 eq(w.persist.mobs[0].alert,5.5,type+" persisted hunter alert");
 eq(w.persist.carcasses[0].claimedBy,null,type+" persisted claim release");
 w.nearDen=true;api.contextAction(false);
 eq(w.persist.denStores.meat,20,type+" den points");
 eq(w.persist.P.carry,null,type+" no duplication");
 api.contextAction(false);eq(w.mode,"inventory",type+" open inventory");
 ok(api.eatFromDen("meat"),type+" eat stored meat");
 ok(w.P.hp>40&&w.P.hunger>20,type+" health benefit");
 eq(w.persist.denStores.meat,w.pan.meat,type+" pantry agrees after eating");
 ({w,meat,mob,api}=make());w.fail=true;
 eq(api.carryFood(),false,type+" pickup denied");
 eq(meat.amount,30,type+" unchanged carcass");
 eq(mob.alert,0,type+" alert rolled back");
 eq(mob.feedClaimToken,"token",type+" claim restored");
 ({w,meat,mob,api}=make());meat.amount=10;
 ok(api.eat(),type+" final corpse bite");
 eq(w.persist.carcasses[0].type,"bones",type+" bones durable");
 ({w,meat,mob,api}=make());meat.amount=10;w.fail=true;
 eq(api.eat(),false,type+" failed final bite");
 eq(meat.type,"corpse",type+" corpse restored");
 eq(meat.amount,10,type+" meat restored");
 eq(mob.feedClaimToken,"token",type+" hunter restored");
 ({w,api}=make());api.carryFood();const before=w.P.carry.amount;
 w.nearDen=true;w.fail=true;
 eq(api.carryFood(),false,type+" failed den deposit");
 eq(w.P.carry.amount,before,type+" carried meal restored");
 eq(w.denStores.meat,0,type+" pantry restored");
 eq(w.pan.meat,0,type+" durable pantry restored");
}
console.log("PASS: "+checks+" assertions across 4 species, actual action->hunt meat->den->eat->save and rollback");