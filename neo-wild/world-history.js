/* World yearbook: source-backed events plus factual era milestones.
   Never substitutes a past checkpoint for the current world, never resets saves. */
(()=>{"use strict";
const $=id=>document.getElementById(id);
const regions=["霞町の廃庁街","桜坂駅跡","蔦ヶ丘の古町","白鷺の獣舎跡","朝霧川の土手","楠の森","汐浜の廃工場","潮見の水路"];
const read=(key,fallback)=>{try{const raw=localStorage.getItem(key);return raw==null?fallback:JSON.parse(raw)}catch(_){return fallback}};
const finite=n=>Number.isFinite(Number(n))&&Number(n)>=0?Number(n):0;
function worldState(){
 const chronicle=read("wild-reclaim-world-chronicle-v1",null),auto=read("wild-reclaim-autosave-v2",null),squad=read("wild-reclaim-squad-v1",null);
 const explicitNew=localStorage.getItem("wild-reclaim-explicit-new-world-v1")==="1";
 const launched=explicitNew||!!chronicle||!!auto||!!(squad?.members?.length&&!squad.pendingStart);
 // A new game intentionally starts at YEAR 0; prior checkpoint years must not leak in.
 const saved=explicitNew?0:Math.max(finite(chronicle?.elapsed),finite(auto?.elapsed));
 const live=finite(window.WildGameWorldTime?.());
 // The live clock may be 0 before a saved game is resumed; prefer the durable world.
 const t=Math.max(saved,live);
 return {t,year:window.WildWorldClock?.at?.(t)?.year??Math.floor(t/120),chronicle,auto,launched};
}
function seconds(){return worldState().t;}
function entries(atSeconds=seconds()){
 const year=window.WildWorldClock?.at?.(atSeconds)?.year??Math.floor(atSeconds/120),items=[];
 const hasWorld=worldState().launched;
 if(!hasWorld)return [];
 items.push({year:0,label:"世界の始まり",kind:"origin"});
 // These are reached era thresholds, NOT fabricated disaster or UFO encounters.
 for(const [at,label] of [
  [7,"年代段階：森林の拡大・生態変化が進む時代"],
  [15,"怪異が発生し得る年代へ到達"],
  [17,"UFOが出現し得る年代へ到達"],
  [34,"年代段階：巨大生物と異常現象が増える時代"],
  [67,"年代段階：広域変動の時代"],
  [100,"年代段階：100年経過（世界は継続）"]
 ])if(year>=at)items.push({year:at,label,kind:"era-milestone"});
 try{
  for(const e of window.WildDisaster?.history?.()||[]){
   if(!e||!Number.isFinite(Number(e.year))||Number(e.year)<0||Number(e.year)>year)continue;
   const names={fallen_tree:"地震・倒木",flood:"河川氾濫",wildfire:"山火事"};
   items.push({year:Number(e.year),label:names[e.kind]||"災害",kind:"disaster"});
  }
 }catch(_){}
 try{
  for(const e of window.WildEraEcology?.history?.(year)||[]){
   if(!e||!Number.isFinite(Number(e.year))||Number(e.year)>year)continue;
   items.push({year:Number(e.year),label:(regions[e.region]||"未知の地区")+"："+e.name,kind:"ecology"});
  }
 }catch(_){}
 const chrono=read("wild-reclaim-world-chronicle-v1",{});
 for(const e of chrono?.lightningHistory||[]){
  const y=Number(e?.year);
  if(Number.isFinite(y)&&y>=0&&y<=year)items.push({year:y,label:"落雷の記録",kind:"lightning"});
 }
 // UFO abductions represent removed NPCs, not merely seeing a saucer.
 const taken=read("wild-reclaim-ufo-abduction-history-v1",[]);
 if(Array.isArray(taken))for(const e of taken){
  const y=Number(e?.year);
  if(!Number.isFinite(y)||y<0||y>year)continue;
  const kind=typeof e.kind==="string"&&/^[a-zA-Z0-9_-]{1,40}$/.test(e.kind)?e.kind:"不明";
  items.push({year:y,label:"UFOによる動物の誘拐（"+kind+"）",kind:"ufo-abduction"});
 }
 // Only actual stored incidents appear here; offline change never advances YEAR
 // and must not be confused with a guaranteed disaster or UFO encounter.
 const snapshot=worldState().auto;
 // Actual incidents are also saved in the compact world chronicle, so dying
 // (which deletes the large autosave) does not erase historical consequences.
 const freshWorld=localStorage.getItem("wild-reclaim-explicit-new-world-v1")==="1";
 const savedEvents=read("wild-reclaim-world-chronicle-v1",{})?.worldEventJournal;
 const sourceEvents=freshWorld?[]:[
  ...(Array.isArray(savedEvents)?savedEvents:[]),
  ...(Array.isArray(snapshot?.worldEventJournal)?snapshot.worldEventJournal:[])
 ];
 const recorded=new Set();
 for(const e of sourceEvents.slice(-160)){
  const y=Number(e?.year);
  if(!Number.isFinite(y)||y<0||y>year||typeof e?.label!=="string"||e.label.length>110||
     !["offline-ecology","alien-scout","cave-seal"].includes(e.kind))continue;
  const key=e.kind+"|"+e.at+"|"+e.label;
  if(recorded.has(key))continue;
  recorded.add(key);
  items.push({year:y,label:e.label,kind:e.kind});
 }
 // Preserve all era markers and the earliest beginning event alongside recent incidents.
 const highlights=items.filter(e=>e.kind==="origin"||e.kind==="era-milestone");
 const incidents=items.filter(e=>e.kind!=="origin"&&e.kind!=="era-milestone").sort((a,b)=>b.year-a.year).slice(0,114);
 return [...highlights,...incidents].sort((a,b)=>b.year-a.year||a.label.localeCompare(b.label,"ja"));
}
function render(){
 const list=$("world-history-list"),summary=$("world-history-summary");if(!list||!summary)return;
 const w=worldState(),events=entries(w.t),season=window.WildWorldClock?.at?.(w.t)?.season||"季節不明";
 const discovered=Array.isArray(w.chronicle?.discoveredSites)?w.chronicle.discoveredSites.length:Array.isArray(w.auto?.discoveredSites)?w.auto.discoveredSites.length:0;
 summary.textContent=w.launched?"世界 "+Math.floor(w.year)+"年｜"+season+"｜探索 "+discovered+"地点｜年表 "+events.length+"件":"世界を開始すると年表に記録されます";
 list.replaceChildren();
 if(!events.length){
  const li=document.createElement("li");li.textContent="世界はまだ始まっていません。動物を選んで出発してください。";list.append(li);return;
 }
 const current=document.createElement("li");current.textContent="現在｜世界 "+Math.floor(w.year)+"年（災害・生態変動は記録がある場合のみ表示）";list.append(current);
 for(const e of events){
  const li=document.createElement("li"),yr=Number(e.year);
  li.textContent="YEAR "+(Number.isInteger(yr)?yr.toString():yr.toFixed(1))+"｜"+e.label;
  list.append(li);
 }
}
function close(){
 const panel=$("world-history-view");if(!panel)return;
 panel.classList.add("hidden");panel.setAttribute("aria-hidden","true");
 $("world-history-open")?.setAttribute("aria-expanded","false");
}
function open(){
 const panel=$("world-history-view");if(!panel)return;
 render();panel.classList.remove("hidden");panel.setAttribute("aria-hidden","false");
 $("world-history-open")?.setAttribute("aria-expanded","true");$("world-history-close")?.focus();
}
function setup(){
 $("world-history-open")?.addEventListener("click",open);
 $("world-history-close")?.addEventListener("click",close);
 $("world-history-view")?.addEventListener("click",e=>{if(e.target===$("world-history-view"))close()});
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("world-history-view")?.classList.contains("hidden")){e.preventDefault();close()}});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",setup,{once:true});else setup();
window.WildWorldHistory=Object.freeze({entries,render,open,close,seconds});
})();