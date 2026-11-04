/* WILD RECLAIM: immutable roster generation and permanent-death persistence. */
(function(){
"use strict";
const KEY="wild-reclaim-squad-v1",DEAD="wild-reclaim-dead-ids-v1",RESET_NEW_WORLD="wild-reclaim-explicit-new-world-v1";
const japan=["cat","dog","fox","wolf","deer","boar","crow","pigeon","otter","carp","tanuki","badger","macaque","blackBear","serow"];
const world=["manul","tibetanFox","shoebill","lion","tiger","cheetah","elephant","hippo","gorilla","giraffe","zebra","hyena","wildDog","armadillo","hedgehog"];
const names={cat:"猫",dog:"犬",fox:"狐",wolf:"狼",deer:"鹿",boar:"猪",crow:"カラス",pigeon:"ハト",otter:"カワウソ",carp:"コイ",tanuki:"タヌキ",badger:"アナグマ",macaque:"ニホンザル",blackBear:"ツキノワグマ",serow:"ニホンカモシカ",manul:"マヌルネコ",tibetanFox:"チベットスナギツネ",shoebill:"ハシビロコウ",lion:"ライオン",tiger:"トラ",cheetah:"チーター",elephant:"ゾウ",hippo:"カバ",gorilla:"ゴリラ",giraffe:"キリン",zebra:"シマウマ",hyena:"ハイエナ",wildDog:"リカオン",armadillo:"アルマジロ",hedgehog:"ハリネズミ"};
const playable=new Set(["cat","dog","fox","wolf","deer","boar","manul","tibetanFox","shoebill"]);
// Never award a permanent party slot to an animal that cannot become the player.
const rare=new Set(["manul","tibetanFox","shoebill","blackBear","serow","cheetah","hippo","gorilla","hyena","wildDog","armadillo","hedgehog"]);
const legendary=new Set(["lion","tiger","elephant","giraffe"]);
const traits=["俊足","粘り強い","急所狙い","警戒心","夜目","隠密","回復上手","強靭"];
const personalities=["慎重","大胆","好奇心旺盛","温厚","気難しい","協調的"];
const growth=["早熟","標準","大器晩成"];
const rand=(a,b)=>a+Math.random()*(b-a);
const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))??f}catch(_){return f}};
const dead=()=>new Set(read(DEAD,[]));
const saveDead=s=>localStorage.setItem(DEAD,JSON.stringify([...s]));
const rarity=s=>legendary.has(s)?"legendary":rare.has(s)?"rare":"basic";
const unlock=(s,year=0,explored=0)=>rarity(s)==="basic"||rarity(s)==="rare"&&(year>=7||explored>=8)||year>=34||explored>=35;
function rollSpecies(year=0,explored=0){
 const pool=[...japan,...world].filter(s=>playable.has(s)&&unlock(s,year,explored));
 const groups={basic:[],rare:[],legendary:[]};pool.forEach(s=>groups[rarity(s)].push(s));
 const weights=[["basic",.65],["rare",.30],["legendary",.05]].filter(([k])=>groups[k].length);
 const total=weights.reduce((n,[,v])=>n+v,0);let n=Math.random()*total;
 let tier=weights[weights.length-1][0];for(const [k,v] of weights){n-=v;if(n<=0){tier=k;break}}
 const list=groups[tier];return list[Math.floor(Math.random()*list.length)];
}
function generate(year=0,explored=0,poorStreak=0){
 const species=rollSpecies(year,explored);
 // Low-grade streaks improve the actual rolled individual, not merely its displayed grade.
 // Probability rises gradually and is capped; there is no guaranteed S-grade ceiling.
 const streak=Math.max(0,Math.min(12,Math.floor(Number(poorStreak)||0)));
 const lucky=Math.random()<Math.min(.36,streak*.03);
 const iv=Object.fromEntries(["hp","attack","speed","stamina"].map(k=>[k,Math.round(rand(lucky?.88:.6,1.4)*100)/100]));
 const avg=Object.values(iv).reduce((a,b)=>a+b,0)/4;
 const score=avg;const grade=score>=1.22?"S":score>=1.10?"A":score>=.97?"B":score>=.84?"C":"D";
 const abilities=Array.from({length:Math.floor(rand(0,3))},()=>traits[Math.floor(rand(0,traits.length))]).filter((v,i,a)=>a.indexOf(v)===i);
 const id=globalThis.crypto?.randomUUID?.()||"wr-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2);
 return {id,species,speciesName:names[species],rarity:rarity(species),sex:Math.random()<.5?"オス":"メス",age:Math.random()<.45?"若い":"成体",personality:personalities[Math.floor(rand(0,personalities.length))],name:names[species]+"-"+id.slice(-4),iv,growthType:growth[Math.floor(rand(0,3))],growthRate:Math.round(rand(.75,1.25)*100)/100,grade,abilities,level:1,xp:0,hpRatio:1,alive:true};
}
function assignSlots(members){
 const used=new Set();return members.map(m=>{
  const slot=Number.isInteger(m.slotIndex)&&m.slotIndex>=0&&m.slotIndex<3&&!used.has(m.slotIndex)?m.slotIndex:[0,1,2].find(i=>!used.has(i));
  used.add(slot);return {...m,slotIndex:slot};
 }).sort((a,b)=>a.slotIndex-b.slotIndex);
}
function targetSlot(member,members){
 const occupied=new Set(members.map(m=>m.slotIndex));
 const i=Number.isInteger(member?.slotIndex)?member.slotIndex:[0,1,2].find(n=>!occupied.has(n));
 return i>=0&&i<3&&!occupied.has(i)?i:null;
}
function load(){const v=read(KEY,null);if(!v||v.version!==1)return null;const d=dead(),seen=new Set();return {...v,members:assignSlots((Array.isArray(v.members)?v.members:[]).filter(x=>{if(!x?.id||d.has(x.id)||x.alive===false||seen.has(x.id))return false;seen.add(x.id);return true}).slice(0,3))}}
function save(roster){const d=dead();const members=assignSlots((roster.members||[]).filter(x=>x?.id&&!d.has(x.id)&&x.alive!==false).slice(0,3));const v={version:1,members,leaderId:members.some(x=>x.id===roster.leaderId)?roster.leaderId:members[0]?.id||null,sharedXp:Math.max(0,roster.sharedXp||0),gachaTickets:Math.min(999,Math.max(0,roster.gachaTickets||0)),ticketMilestone:Math.max(0,Math.floor(roster.ticketMilestone||0)),startPosition:roster.startPosition||read(KEY,null)?.startPosition||null,pendingStart:!!roster.pendingStart,newWorldOnStart:!!roster.newWorldOnStart,updatedAt:Date.now()};localStorage.setItem(KEY,JSON.stringify(v));return v}
function kill(id){if(!id)return load();const d=dead();d.add(id);saveDead(d);const r=load();return r?save(r):null}
function newSquad(members,leaderId){
 // The title UI is not a security boundary: never erase living animals via a stale dialog.
 const existing=load();
 if(existing?.members?.length)throw Error("生存中の編成は破棄できません。空き枠は巣で補充してください");
 if(!Array.isArray(members)||members.length<1||members.length>3||
    members.some(m=>!m?.id||!playable.has(m.species)||m.alive===false||dead().has(m.id))||
    new Set(members.map(m=>m.id)).size!==members.length)
   throw Error("編成は操作可能な1〜3体、重複・死亡個体は禁止");
 if(!members.some(m=>m.id===leaderId))throw Error("操作するリーダーを選択してください");
 return save({members,leaderId,sharedXp:0,gachaTickets:0,ticketMilestone:0,pendingStart:true,newWorldOnStart:localStorage.getItem(RESET_NEW_WORLD)==="1"||!read("wild-reclaim-world-chronicle-v1",null)});
}
function addXp(amount){
 const r=load();if(!r)return null;
 const earned=Number.isFinite(amount)?Math.max(0,Math.min(1000000,amount)):0;
 const previousMilestone=Math.max(0,Math.floor(r.ticketMilestone??(r.sharedXp||0)/600));
 r.sharedXp+=earned;
 // Every 600 shared XP earned through gameplay grants one vacancy-only draw.
 const nextMilestone=Math.floor(r.sharedXp/600);
 if(nextMilestone>previousMilestone)r.gachaTickets=Math.min(999,(r.gachaTickets||0)+nextMilestone-previousMilestone);
 r.ticketMilestone=Math.max(previousMilestone,nextMilestone);
 for(const m of r.members){
  const rate=Number.isFinite(m.growthRate)?Math.max(.5,Math.min(1.5,m.growthRate)):1;
  const phase=m.growthType==="大器晩成"?(m.level<12?.72:1.28):m.growthType==="早熟"?(m.level<12?1.2:.85):1;
  m.xp=Math.max(0,Number(m.xp)||0)+earned*rate*phase;
  m.level=Math.max(1,Math.floor(Number(m.level)||1));
  while(m.level<100&&m.xp>=m.level*100){m.xp-=m.level*100;m.level++;}
  if(m.level>=100)m.xp=0;
 }
 return save(r);
}
// Tickets are earned in gameplay, never purchased. Only vacant slots can consume them.
function grantTickets(amount=1){
 const r=load();if(!r)return null;
 const n=Number.isSafeInteger(amount)?Math.max(0,Math.min(100,amount)):0;
 r.gachaTickets=Math.min(999,Math.max(0,r.gachaTickets||0)+n);
 return save(r);
}
function fillVacancy(member){
 const r=load();if(!r||!Array.isArray(r.members)||r.members.length>=3)return {ok:false,reason:"空き枠がありません"};
 if(!member||!member.id||!playable.has(member.species)||member.alive===false||dead().has(member.id)||r.members.some(m=>m.id===member.id))return {ok:false,reason:"無効な個体です"};
 if((r.gachaTickets||0)<1)return {ok:false,reason:"ガチャ権が不足しています"};
 const slot=targetSlot(member,r.members);if(slot===null)return {ok:false,reason:"指定枠にはすでに動物がいます"};
 r.members.push({...member,slotIndex:slot,alive:true});r.gachaTickets-=1;
 const saved=save(r);
 return {ok:true,roster:saved};
}
function release(id){const r=load();if(!r||!r.members.some(m=>m.id===id))return {ok:false};const d=dead();d.add(id);saveDead(d);r.members=r.members.filter(m=>m.id!==id);if(r.leaderId===id)r.leaderId=r.members.find(m=>playable.has(m.species))?.id||r.members[0]?.id||null;return {ok:true,roster:save(r)};}
function resetForNewGame(){const r=load();if(r){const d=dead();r.members.forEach(m=>d.add(m.id));saveDead(d);}localStorage.removeItem(KEY);localStorage.setItem(RESET_NEW_WORLD,"1");return true;}
function addInitialSlot(member){
 const r=load();if(!r?.pendingStart||r.members.length>=3)return {ok:false,reason:"新規編成中の空き枠ではありません"};
 if(!member?.id||!playable.has(member.species)||member.alive===false||dead().has(member.id)||r.members.some(m=>m.id===member.id))return {ok:false,reason:"無効な個体です"};
 const slot=targetSlot(member,r.members);if(slot===null)return {ok:false,reason:"指定枠にはすでに動物がいます"};
 r.members.push({...member,slotIndex:slot,alive:true});return {ok:true,roster:save(r)};
}
function markStarted(){const r=load();if(!r)return null;r.pendingStart=false;r.newWorldOnStart=false;localStorage.removeItem(RESET_NEW_WORLD);return save(r);}
function livingCount(){return load()?.members?.length||0}
function drawSlot(year,explored,poorStreak=0){const options=[];return {roll(){if(options.length>=4)throw Error("引き直しは3回まで");const candidate=generate(year,explored,poorStreak);options.push(candidate);return candidate},choose(id){const found=options.find(x=>x.id===id);if(!found)throw Error("抽選外の個体");return found},get options(){return options.slice()}}}
window.WildSquad={japan,world,names,playable,canLead:s=>playable.has(s),rollSpecies,generate,drawSlot,load,save,kill,newSquad,addXp,grantTickets,fillVacancy,addInitialSlot,markStarted,release,resetForNewGame,livingCount,rarity,KEY,DEAD};
})();