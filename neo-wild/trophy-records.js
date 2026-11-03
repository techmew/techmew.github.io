/* WILD RECLAIM V1.0: permanent, non-stat trophy ledger. */
(()=>{"use strict";
const KEY="wild-reclaim-trophies-v1";
const defs=[];
function tierFor(id,hidden){
 if(hidden)return "gold";
 if(id.startsWith("year-"))return Number(id.slice(5))>=100?"gold":Number(id.slice(5))>=20?"silver":"bronze";
 if(id.startsWith("hunt-"))return Number(id.slice(5))>=100?"gold":Number(id.slice(5))>=25?"silver":"bronze";
 if(id.startsWith("level-"))return Number(id.slice(6))>=20?"gold":Number(id.slice(6))>=5?"silver":"bronze";
 if(id.startsWith("site-"))return Number(id.slice(5))>=6?"gold":Number(id.slice(5))>=3?"silver":"bronze";
 if(id.startsWith("defeat-"))return ["defeat-lion","defeat-elephant","defeat-gorilla"].includes(id)?"gold":"silver";
 if(id.startsWith("disaster-"))return id.includes("escape")?"gold":"silver";
 return id==="weather-THUNDER"?"silver":"bronze";
}
const add=(id,name,description,hidden,test)=>defs.push({id,name,description,hidden:!!hidden,tier:tierFor(id,hidden),test});
const years=[1,5,10,20,30,50,75,100,150,200,300,500,1000];
for(const y of years)add("year-"+y,"世界"+y+"年の目撃者","世界が"+y+"年を迎える",y>=150,(e,d)=>e==="year"&&d.year>=y);
const hunt=[1,3,10,25,50,100,200,500];
for(const n of hunt)add("hunt-"+n,n+"回の狩猟","狩猟を"+n+"回成功させる",n>=200,(e,d)=>e==="hunt"&&d.kills>=n);
const levels=[2,5,10,20,30,50];
for(const n of levels)add("level-"+n,"進化の足跡 LV"+n,"LV"+n+"に到達する",n>=30,(e,d)=>e==="progress"&&d.level>=n);
const sites=[1,2,3,4,5,6];
for(const n of sites)add("site-"+n,n===6?"探索地点の踏破":"探索地点"+n+"か所","異なる探索地点を"+n+"か所発見する",n===6,(e,d)=>e==="explore"&&d.sites>=n);
const weather=[["CLEAR","晴天の旅人"],["RAIN","雨を越えて"],["THUNDER","雷鳴の下"],["FOG","霧の迷い人"],["WIND","強風の足跡"],["CLOUDY","曇天の旅人"]];
for(const [w,name] of weather)add("weather-"+w,name,"この天候で生存する",false,(e,d)=>e==="weather"&&d.weather===w);
const species=[["strayCat","野良猫"],["wildFox","野生の狐"],["crow","カラス"],["snake","蛇"],["boar","イノシシ"],["deer","鹿"],["bear","熊"],["lion","ライオン"],["cheetah","チーター"],["elephant","ゾウ"],["hippo","カバ"],["gorilla","ゴリラ"]];
for(const [s,name] of species)add("defeat-"+s,name+"との決着",name+"を初めて倒す",["lion","elephant","gorilla"].includes(s),(e,d)=>e==="kill"&&d.type===s);
add("ufo-captured","空からの失踪","UFOに捕獲される",true,(e,d)=>e==="death"&&d.reason==="ufo");
add("ghost-possession","影に触れられた者","亡霊に憑依される",true,(e)=>e==="ghost-possession");
add("ghost-hallucination","幻影の目撃者","亡霊の幻覚を見る",true,(e)=>e==="ghost-hallucination");
add("first-death","命の終わり","最初の死亡を経験する",false,(e)=>e==="death");
add("lightning-survive","雷を生き延びた者","落雷の直撃から生還する",true,(e,d)=>e==="lightning"&&d.survived);
add("lightning-fatal","落雷の犠牲","落雷によって死亡する",true,(e,d)=>e==="lightning"&&d.fatal);
// Disaster achievements are event-specific: location, warning and survival matter.
const disasterKinds=[["fallen_tree","倒木"],["flood","河川氾濫"],["wildfire","山火事"]];
for(const [kind,label] of disasterKinds){
 add("disaster-witness-"+kind,label+"の目撃者",label+"の発生現場を目撃する",false,
  (e,d)=>e==="disaster-witness"&&d.kind===kind&&d.distance<=d.radius+250);
 add("disaster-escape-"+kind,label+"からの生還",label+"の危険範囲から生きて脱出する",true,
  (e,d)=>e==="disaster-escape"&&d.kind===kind&&d.exposed===true&&d.alive===true);
}
add("disaster-triple","三つの災厄を知る者","倒木・洪水・山火事をすべて目撃する",true,
 (e,d)=>e==="disaster-triple"&&d.all===true);
const completed=new Set();
try{const saved=JSON.parse(localStorage.getItem(KEY)||"null");if(saved&&saved.version===1&&Array.isArray(saved.ids))for(const id of saved.ids)if(defs.some(x=>x.id===id))completed.add(id)}catch(_){}
function persist(){try{localStorage.setItem(KEY,JSON.stringify({version:1,ids:[...completed],updatedAt:Date.now()}))}catch(_){}}
function record(event,data={},announce){let newly=[];
 for(const d of defs){if(completed.has(d.id))continue;
  try{if(!d.test(event,data))continue;}catch(_){continue}
  completed.add(d.id);newly.push(d);
 }
 if(newly.length){persist();if(typeof announce==="function")for(const d of newly.slice(0,3))announce("トロフィー獲得："+d.name)}
 return newly.map(d=>d.id);
}
function catalog(){return defs.map(({id,name,description,hidden,tier})=>({id,name:hidden&&!completed.has(id)?"？？？":name,description:hidden&&!completed.has(id)?"獲得まで秘密":description,hidden,earned:completed.has(id),tier}))}
window.WildTrophies=Object.freeze({record,catalog,count:()=>completed.size,total:defs.length,has:id=>completed.has(id)});
})();