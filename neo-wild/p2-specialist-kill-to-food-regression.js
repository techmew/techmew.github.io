"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const source=fs.readFileSync(path.join(__dirname,"game.js"),"utf8");new Function(source);
const begin=source.indexOf("if(prey.hp===0){\n       // The alternate ambush branch");
const end=source.indexOf("       m.specialistHuntCooldown+=.7;\n      }",begin);
assert(begin>=0&&end>begin,"live specialist death path missing");
const branch=source.slice(begin,end+"       m.specialistHuntCooldown+=.7;\n      }".length);
assert(source.includes("m.specialistHuntCooldown=Math.max(0"),"cooldown not live");
assert(source.includes("for(let i=mobs.length-1;i>=0;i--)if(mobs[i].hp<=0)mobs.splice(i,1)"),"dead prey cleanup missing");
let checks=0;
for(const type of ["manul","tibetanFox","shoebill","penguin"]){
 for(const already of [false,true]){
  const m={type,x:100,y:100,r:18,specialistHuntCooldown:1};
  const prey={type:"rat",x:110,y:100,r:12,hp:0,_killRegistered:already};
  const carcasses=[],ecology=[{prey:20}],species={rat:{food:24,prey:true},[type]:{damage:12}};
  let labels=0,claims=0;
  const P={x:100,y:100},elapsed=50;
  const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const regionAt=()=>0,label=()=>labels++;
  const claimPredatorKill=(hunter,victim)=>{
   claims++;const token="kill-"+claims;
   hunter.feedClaimToken=token;hunter.feedClaimUntil=elapsed+24;
   hunter.feedAfterKill=8;
   carcasses.push({type:"corpse",animalType:victim.type,amount:species[victim.type].food,
    x:victim.x,y:victim.y,claimedBy:token,claimUntil:elapsed+24});
  };
  new Function("prey","m","species","ecology","P","dist","regionAt","label","claimPredatorKill",branch)(
   prey,m,species,ecology,P,dist,regionAt,label,claimPredatorKill);
  assert.strictEqual(claims,already?0:1,type+" unique kill");checks++;
  assert.strictEqual(carcasses.length,already?0:1,type+" unique corpse");checks++;
  assert.strictEqual(ecology[0].prey,already?20:19,type+" ecological cost");checks++;
  assert.strictEqual(m.specialistHuntCooldown,1.7,type+" cooldown");checks++;
  if(!already){
   assert.strictEqual(carcasses[0].amount,24,type+" edible meat");checks++;
   assert.strictEqual(m.feedClaimToken,carcasses[0].claimedBy,type+" feeding lease");checks++;
   assert.strictEqual(prey._killRegistered,true,type+" dedup flag");checks++;
  }
 }
}
console.log("PASS "+checks+" checks: four species, death->corpse->feeding lease, ecology and dedup");