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
// A witnessed NPC abduction is distinct from the player's own capture.
add("ufo-npc-witness","空の狩人を目撃","UFOが動物を連れ去る場面を目撃する",true,
 (e,d)=>e==="ufo-npc-abduction"&&!!(d?.species||d?.type));
add("ufo-captured","空からの失踪","UFOに捕獲される",true,(e,d)=>e==="death"&&d.reason==="ufo");
add("ghost-possession","影に触れられた者","亡霊に憑依される",true,(e)=>e==="ghost-possession");
add("ghost-hallucination","幻影の目撃者","亡霊の幻覚を見る",true,(e)=>e==="ghost-hallucination");
add("first-death","命の終わり","最初の死亡を経験する",false,(e)=>e==="death");
add("lightning-survive","雷を生き延びた者","落雷の直撃から生還する",true,(e,d)=>e==="lightning"&&d.survived);
add("lightning-fatal","落雷の犠牲","落雷によって死亡する",true,(e,d)=>e==="lightning"&&d.fatal);
// Disaster achievements are event-specific: location, warning and survival matter.
const disasterKinds=[["fallen_tree","倒木"],["flood","河川氾濫"],["wildfire","山火事"],["landslide","土砂崩れ"]];
for(const [kind,label] of disasterKinds){
 add("disaster-witness-"+kind,label+"の目撃者",label+"の発生現場を目撃する",false,
  (e,d)=>e==="disaster-witness"&&d.kind===kind&&d.distance<=d.radius+250);
 add("disaster-escape-"+kind,label+"からの生還",label+"の危険範囲から生きて脱出する",true,
  (e,d)=>e==="disaster-escape"&&d.kind===kind&&d.exposed===true&&d.alive===true);
}
add("disaster-triple","三つの災厄を知る者","倒木・洪水・山火事をすべて目撃する",true,
 (e,d)=>e==="disaster-triple"&&d.all===true);

// Additional achievements require an actual gameplay event, not a scripted
// progress counter. Preserve the original 65 historical awards and IDs.
const LEGACY_COUNT=defs.length, extraByEvent=new Map();
function addEvent(event,id,name,description,hidden,test){
 if(defs.some(d=>d.id===id))return;
 add(id,name,description,hidden,test);
 const group=extraByEvent.get(event)||[];group.push(defs[defs.length-1]);extraByEvent.set(event,group);
}
const wildAnimals=[["rat","ネズミ"],["rabbit","ウサギ"],["pigeon","ハト"],["dog","野犬"],["boar","イノシシ"],["strayCat","野良猫"],["snake","ヘビ"],["crow","カラス"],["raccoonDog","ホンドタヌキ"],["wildFox","野生の狐"],["weasel","イタチ"],["frog","カエル"],["deer","シカ"],["venomSnake","毒ヘビ"],["cheetah","チーター"],["giraffe","キリン"],["zebra","シマウマ"],["lion","ライオン"],["elephant","ゾウ"],["hippo","カバ"],["macaque","ニホンザル"],["chimpanzee","チンパンジー"],["serow","ニホンカモシカ"],["mountainGoat","山ヤギ"],["manul","マヌルネコ"],["tibetanFox","チベットスナギツネ"],["shoebill","ハシビロコウ"],["otter","カワウソ"],["carp","コイ"],["tanuki","タヌキの仲間"],["badger","アナグマ"],["blackBear","ツキノワグマ"],["tiger","トラ"],["gorilla","ゴリラ"],["hyena","ハイエナ"],["wildDog","リカオン"],["armadillo","アルマジロ"],["hedgehog","ハリネズミ"],["giantTreeFrog","巨大アマガエル"],["pacmanFrog","ベルツノガエル"]];
for(const [id,name] of wildAnimals){
 addEvent("sighting","spot-"+id,name+"の生息記録",name+"を目の届く距離で遮蔽物なしに見つける",false,
  (event,data)=>event==="sighting"&&data.type===id);
 addEvent("kill","defeat-"+id,name+"との決着",name+"との狩猟に勝利する",false,
  (event,data)=>event==="kill"&&data.type===id);
}
const uniqueBosses=[["alpha","アルファウルフ"],["giantSnake","大蛇"],["oldBear","老熊"],["giantBoar","巨大イノシシ"],["blackPanther","黒豹"],["oneEyedWolf","隻眼の狼"],["whiteTiger","白虎"],["giantHyena","巨大ハイエナ"],["giantLion","巨大ライオン"],["giantMoose","巨大ヘラジカ"],["giantBuffalo","巨大バッファロー"],["giantCrocodile","巨大ワニ"],["giantHippo","巨大カバ"],["giantAnaconda","巨大アナコンダ"],["giantLizard","巨大オオトカゲ"],["rhino","サイの強敵"],["giantGorilla","巨大ゴリラ"],["giantElephant","巨象"],["albinoWolf","アルビノの狼"],["giantEagle","大鷲"]];
for(const [id,name] of uniqueBosses)addEvent("kill","boss-"+id,name+"の討伐者",name+"を強敵として実際に撃破する",true,
 (event,data)=>event==="kill"&&data.type===id&&data.boss===true);
const eligiblePlayables=[["cat","猫"],["dog","犬"],["fox","狐"],["wolf","狼"],["deer","シカ"],["boar","イノシシ"],["manul","マヌルネコ"],["tibetanFox","チベットスナギツネ"],["shoebill","ハシビロコウ"],["macaque","ニホンザル"],["gorilla","ゴリラ"],["crocodile","ワニ"],["lion","ライオン"],["tiger","トラ"],["cheetah","チーター"],["hyena","ハイエナ"],["elephant","ゾウ"],["penguin","ペンギン"],["rhino","サイ"],["giantTreeFrog","巨大アマガエル"],["pacmanFrog","ベルツノガエル"],["tanuki","タヌキ"],["badger","アナグマ"],["blackBear","ツキノワグマ"],["serow","ニホンカモシカ"],["giraffe","キリン"],["zebra","シマウマ"],["wildDog","リカオン"],["armadillo","アルマジロ"],["hedgehog","ハリネズミ"],["otter","カワウソ"],["carp","コイ"],["hippo","カバ"],["crow","カラス"],["pigeon","ハト"]];
for(const [id,name] of eligiblePlayables){
 addEvent("species-lead","lead-"+id,name+"の操作記録",name+"を所有して実際に操作する",false,
  (event,data)=>event==="species-lead"&&data.type===id);
 addEvent("species-special","instinct-"+id,name+"の固有技",name+"の固有技を持久力を使って発動する",false,
  (event,data)=>event==="species-special"&&data.type===id);
}
const regionNames=["霞町の廃庁街","桜坂駅跡","蔦ヶ丘の古町","白鷺の獣舎跡","朝霧川の土手","楠の森","汐浜の廃工場","潮見の水路"];
for(let area=0;area<regionNames.length;area++){
 addEvent("region-visit","region-visit-"+area,regionNames[area]+"の探検記録",
  regionNames[area]+"へ実際に踏み入る",false,(event,data)=>event==="region-visit"&&data.region===area);
 addEvent("kill","region-hunter-"+area,regionNames[area]+"の狩猟記録",
  regionNames[area]+"で実際に野生動物を仕留める",false,(event,data)=>event==="kill"&&data.region===area);
}
for(const [id,name] of [["zoo","獣舎跡の調査"],["river","川辺の発見"],["forest","森林の踏破"],["factory","廃工場の手掛かり"],["canal","水路の観察"],["ark","地下道の発見"]])addEvent("explore-site","discovery-"+id,name,
 "探索地点を見つけて記録を獲得する",false,(event,data)=>event==="explore-site"&&data.site===id);
for(const [id,name,description] of [["alien-scout-player-counterattack","異星偵察機の撃退","攻撃を命中させて異星偵察機を停止させる"],["alien-scout-herd-counterattack","獣群の共同防衛","野生動物の群れが異星偵察機を追い払う"],["alien-scout-wildlife-kill","異星の犠牲者","異星偵察機が野生動物を倒す事件を経験する"],["alien-scout-rescue","異星の救助","友好的な偵察機がUFOの捕獲を妨害する"],["alien-observation-site","異星基地の発見","UFOが去った跡に観測基地が残る"],["ufo-player-abduction","光に奪われた者","操作個体がUFOに吸い込まれる"],["ghost-repelled","亡霊の撃退","実体化した亡霊を攻撃で追い払う"],["ghost-animal-haunt","野生動物と亡霊","亡霊が野生動物の行動を狂わせる"],["ghost-shadow-step","影の跳躍","亡霊の瞬間移動を目撃する"],["ghost-mimic","影の分身","亡霊が幻惑の分身を生む"],["ghost-hallucination","幻影の体験","亡霊によって視界に幻影が現れる"]])addEvent(id,"anomaly-"+id,name,description,true,
 event=>event===id);

const completed=new Set();
try{const saved=JSON.parse(localStorage.getItem(KEY)||"null");if(saved&&saved.version===1&&Array.isArray(saved.ids))for(const id of saved.ids)if(defs.some(x=>x.id===id))completed.add(id)}catch(_){}
function persist(){try{localStorage.setItem(KEY,JSON.stringify({version:1,ids:[...completed],updatedAt:Date.now()}))}catch(_){}}
function record(event,data={},announce){let newly=[];
 // Efficient dispatch: only historic definitions plus the exact event's additions.
 // Weather/XP/year update each frame; don't iterate 200+ definitions per frame.
 const extra=extraByEvent.get(event)||[];
 for(let i=0;i<LEGACY_COUNT+extra.length;i++){
  const d=i<LEGACY_COUNT?defs[i]:extra[i-LEGACY_COUNT];
  if(completed.has(d.id))continue;
  try{if(!d.test(event,data))continue;}catch(_){continue}
  completed.add(d.id);newly.push(d);
 }
 if(newly.length){persist();if(typeof announce==="function")for(const d of newly.slice(0,3))announce("トロフィー獲得："+d.name)}
 return newly.map(d=>d.id);
}
function catalog(){return defs.map(({id,name,description,hidden,tier})=>({id,name:hidden&&!completed.has(id)?"？？？":name,description:hidden&&!completed.has(id)?"獲得まで秘密":description,hidden,earned:completed.has(id),tier}))}
window.WildTrophies=Object.freeze({record,catalog,count:()=>completed.size,total:defs.length,has:id=>completed.has(id)});
})();