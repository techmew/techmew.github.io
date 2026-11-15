/* Right-only unidentified weapon scrap, 35-species gear and persistent all-den vault.
   Separate from food, gacha, permanent-death ledger, and SAVE_SCHEMA2. */
((window)=>{
"use strict";
const KEY="wild-reclaim-weapon-vault-v1",MAX=240;
const owners="cat:猫:爪具|dog:犬:牙具|fox:狐:牙具|wolf:狼:牙具|deer:鹿:角具|boar:猪:牙具|crow:カラス:嘴具|pigeon:ハト:嘴具|otter:カワウソ:牙具|carp:コイ:鰭具|tanuki:タヌキ:爪具|badger:アナグマ:爪具|macaque:ニホンザル:腕具|blackBear:ツキノワグマ:腕具|serow:ニホンカモシカ:角具|manul:マヌルネコ:爪具|tibetanFox:チベットスナギツネ:牙具|shoebill:ハシビロコウ:嘴具|lion:ライオン:爪具|tiger:トラ:爪具|cheetah:チーター:爪具|elephant:ゾウ:牙具|hippo:カバ:牙具|gorilla:ゴリラ:腕具|giraffe:キリン:脚具|zebra:シマウマ:脚具|hyena:ハイエナ:牙具|wildDog:リカオン:牙具|armadillo:アルマジロ:甲具|hedgehog:ハリネズミ:棘具|crocodile:ワニ:顎具|penguin:ペンギン:鰭具|rhino:サイ:角具|giantTreeFrog:巨大アマガエル:舌具|pacmanFrog:ベルツノガエル:顎具".split("|").map(s=>{
 const [id,name,kind]=s.split(":");return Object.freeze({id,name,kind});
});
const ownById=new Map(owners.map(x=>[x.id,x]));
const grades=Object.freeze([
 {id:"worn",name:"旧式",weight:620,color:"#a6b3a5",attack:1.05,boss:1.09},
 {id:"improved",name:"改良",weight:270,color:"#87bdc9",attack:1.13,boss:1.22},
 {id:"rare",name:"希少",weight:90,color:"#c2aaf0",attack:1.25,boss:1.39},
 {id:"epic",name:"極上",weight:18,color:"#e3b66c",attack:1.40,boss:1.60},
 {id:"legendary",name:"伝説",weight:2,color:"#ffe28f",attack:1.62,boss:1.85}
].map(g=>Object.freeze(g)));
function seedRng(seed){let s=(Number(seed)>>>0)||0x6d2b79f5;return ()=>{
 s=(s+0x6d2b79f5)|0;let t=Math.imul(s^(s>>>15),1|s);
 t^=t+Math.imul(t^(t>>>7),61|t);return ((t^(t>>>14))>>>0)/4294967296;};}
function derive(scrap){
 if(!scrap||typeof scrap.id!=="string"||scrap.id.length>140||
 !/^[a-zA-Z0-9._:-]+$/.test(scrap.id)||!Number.isSafeInteger(scrap.seed))return null;
 const r=seedRng(scrap.seed),owner=owners[Math.floor(r()*owners.length)];let q=r()*1000,g=grades[0];
 for(const next of grades){q-=next.weight;if(q<0){g=next;break}}
 return Object.freeze({id:scrap.id,owner:owner.id,rarity:g.id,
  name:g.name+"・"+owner.name+"の"+owner.kind,obtainedAt:Number(scrap.foundAt)||0});
}
const empty=()=>({version:1,items:[],equipped:{}});
function valid(v){
 if(!v||v.version!==1||!Array.isArray(v.items)||v.items.length>MAX||
 !v.equipped||typeof v.equipped!=="object"||Array.isArray(v.equipped))return false;
 const ids=new Set();
 for(const i of v.items){
  if(!i||typeof i.id!=="string"||i.id.length>140||ids.has(i.id)||
     !ownById.has(i.owner)||!grades.some(g=>g.id===i.rarity)||
     typeof i.name!=="string"||i.name.length>110)return false;
  ids.add(i.id);
 }
 return Object.entries(v.equipped).length<=160&&Object.entries(v.equipped).every(([k,id])=>k.length<=160&&ids.has(id));
}
let cacheRaw,cacheVault;
function read(){
 try{
  const raw=window.localStorage.getItem(KEY);
  if(raw===cacheRaw&&cacheVault)return {ok:true,vault:cacheVault};
  if(raw===null){cacheRaw=null;cacheVault=empty();return {ok:true,vault:cacheVault};}
  const v=JSON.parse(raw);if(!valid(v))return {ok:false,error:"damaged"};
  cacheRaw=raw;cacheVault=v;return {ok:true,vault:v};
 }catch(_){return {ok:false,error:"read_failed"}}
}
function write(next){
 if(!valid(next))return false;
 try{
  const raw=window.localStorage.getItem(KEY);
  if(raw!==null&&!valid(JSON.parse(raw)))return false;
  const encoded=JSON.stringify(next);
  window.localStorage.setItem(KEY,encoded);
  if(window.localStorage.getItem(KEY)!==encoded)return false;
  cacheRaw=encoded;cacheVault=next;return true;
 }catch(_){return false}
}
function alreadyClaimed(id){const state=read();return !!state.ok&&state.vault.items.some(i=>i.id===id)}
function open(scrap){
 if(!scrap||scrap.x<8400)return {ok:false,error:"only_east"};
 const state=read();if(!state.ok)return {ok:false,error:state.error};
 const found=state.vault.items.find(i=>i.id===scrap.id);
 if(found)return {ok:true,duplicate:true,item:found};
 if(state.vault.items.length>=MAX)return {ok:false,error:"vault_full"};
 const item=derive(scrap);if(!item)return {ok:false,error:"invalid_scrap"};
 if(!write({version:1,items:[...state.vault.items,item],equipped:{...state.vault.equipped}}))
  return {ok:false,error:"save_failed"};
 return {ok:true,duplicate:false,item};
}
function actorKey(actor){
 const id=actor?.squadIndividualId||actor?.bossIndividualId;
 return typeof actor?.type==="string"?(id?"individual:"+String(id):"species:"+actor.type):null;
}
function equippedFor(actor){
 const key=actorKey(actor),state=read();if(!key||!state.ok)return null;
 return state.vault.items.find(i=>i.id===state.vault.equipped[key]&&i.owner===actor.type)||null;
}
function equip(actor,id){
 const key=actorKey(actor),state=read();if(!key||!state.ok)return {ok:false,error:"unavailable"};
 const weapon=id===null?null:state.vault.items.find(i=>i.id===id);
 if(id!==null&&(!weapon||weapon.owner!==actor.type))return {ok:false,error:"wrong_species"};
 const bindings={...state.vault.equipped};if(id===null)delete bindings[key];else bindings[key]=id;
 if(!write({version:1,items:state.vault.items,equipped:bindings}))return {ok:false,error:"save_failed"};
 return {ok:true,item:weapon};
}
const gradeOf=item=>grades.find(g=>g.id===item?.rarity)||null;
function damage(actor,target,base){
 const item=equippedFor(actor),g=gradeOf(item),n=Math.max(0,Number(base)||0);
 return g&&item?.owner===actor?.type?
  Math.max(1,Math.round(n*(target?.strongBoss||target?.worldEndBoss?g.boss:g.attack))):Math.round(n);
}
const dangerTier=x=>x<8400?0:x<10100?1:x<11800?2:x<13040?3:4;
function enemyBuff(m,species){
 const tier=dangerTier(Number(m?.x)||0);
 if(!tier||!m||species?.prey||m.companion||m.releasedIndividualId||m.eastThreatTier)return m;
 const hp=1+[0,.24,.48,.70,.94][tier],damage=1+[0,.12,.22,.34,.49][tier];
 m.eastThreatTier=tier;m.hp=Math.max(1,Math.round((m.hp||1)*hp));
 m.maxHp=Math.max(m.hp,Math.round((m.maxHp||m.hp)*hp));
 m.damageScale=Math.max(1,Number(m.damageScale)||1)*damage;
 m.speedScale=Math.max(1,Number(m.speedScale)||1)*(1+.024*tier);
 return m;
}
window.WildArsenal=Object.freeze({KEY,MAX,owners,grades,seedRng,derive,valid,read,write,open,
 alreadyClaimed,actorKey,equippedFor,equip,gradeOf,damage,dangerTier,enemyBuff,isEast:x=>Number(x)>=8400});
})(window);
