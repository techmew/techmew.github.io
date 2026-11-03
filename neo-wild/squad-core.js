/* WILD RECLAIM: immutable roster generation and permanent-death persistence. */
(function(){
"use strict";
const KEY="wild-reclaim-squad-v1",DEAD="wild-reclaim-dead-ids-v1";
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
 const iv=Object.fromEntries(["hp","attack","speed","stamina"].map(k=>[k,Math.round(rand(.6,1.4)*100)/100]));
 const avg=Object.values(iv).reduce((a,b)=>a+b,0)/4;
 const bonus=Math.min(.16,Math.max(0,poorStreak)*.018);
 const score=avg+bonus;const grade=score>=1.22?"S":score>=1.10?"A":score>=.97?"B":score>=.84?"C":"D";
 const abilities=Array.from({length:Math.floor(rand(0,3))},()=>traits[Math.floor(rand(0,traits.length))]).filter((v,i,a)=>a.indexOf(v)===i);
 const id=globalThis.crypto?.randomUUID?.()||"wr-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2);
 return {id,species,speciesName:names[species],rarity:rarity(species),sex:Math.random()<.5?"オス":"メス",age:Math.random()<.45?"若い":"成体",personality:personalities[Math.floor(rand(0,personalities.length))],name:names[species]+"-"+id.slice(-4),iv,growthType:growth[Math.floor(rand(0,3))],growthRate:Math.round(rand(.75,1.25)*100)/100,grade,abilities,level:1,xp:0,hpRatio:1,alive:true};
}
function load(){const v=read(KEY,null);if(!v||v.version!==1)return null;const d=dead();return {...v,members:(v.members||[]).filter(x=>x?.id&&!d.has(x.id)&&x.alive!==false).slice(0,3)}}
function save(roster){const d=dead();const members=(roster.members||[]).filter(x=>x?.id&&!d.has(x.id)&&x.alive!==false).slice(0,3);const v={version:1,members,leaderId:members.some(x=>x.id===roster.leaderId)?roster.leaderId:members[0]?.id||null,sharedXp:Math.max(0,roster.sharedXp||0),gachaTickets:Math.max(0,roster.gachaTickets||0),startPosition:roster.startPosition||read(KEY,null)?.startPosition||null,updatedAt:Date.now()};localStorage.setItem(KEY,JSON.stringify(v));return v}
function kill(id){if(!id)return load();const d=dead();d.add(id);saveDead(d);const r=load();return r?save(r):null}
function newSquad(members,leaderId){if(!Array.isArray(members)||members.length<1||members.length>3||new Set(members.map(x=>x.id)).size!==members.length)throw Error("編成は1〜3体、重複ID禁止");return save({members,leaderId,sharedXp:0,gachaTickets:0})}
function addXp(amount){
 const r=load();if(!r)return null;
 const earned=Number.isFinite(amount)?Math.max(0,Math.min(1000000,amount)):0;
 r.sharedXp+=earned;
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
function drawSlot(year,explored,poorStreak=0){const options=[];return {roll(){if(options.length>=4)throw Error("引き直しは3回まで");const candidate=generate(year,explored,poorStreak);options.push(candidate);return candidate},choose(id){const found=options.find(x=>x.id===id);if(!found)throw Error("抽選外の個体");return found},get options(){return options.slice()}}}
window.WildSquad={japan,world,names,playable,canLead:s=>playable.has(s),rollSpecies,generate,drawSlot,load,save,kill,newSquad,addXp,rarity,KEY,DEAD};
})();