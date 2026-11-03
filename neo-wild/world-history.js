/* World chronology: active-play clock and persisted disaster/region history. */
(()=>{"use strict";
const $=id=>document.getElementById(id);
const regions=["霞町の廃庁街","桜坂駅跡","蔦ヶ丘の古町","白鷺の獣舎跡","朝霧川の土手","楠の森","汐浜の廃工場","潮見の水路"];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function seconds(){
 let saved=0;try{const x=JSON.parse(localStorage.getItem("wild-reclaim-world-chronicle-v1")||"null");saved=Math.max(0,Number(x?.elapsed)||0)}catch(_){}
 const live=Number(window.WildGameWorldTime?.());return Math.max(saved,Number.isFinite(live)?live:0);
}
function entries(atSeconds=seconds()){
 const year=window.WildWorldClock?.at(atSeconds)?.year??Math.floor(atSeconds/120);
 const items=[];
 for(const e of window.WildDisaster?.history?.()||[]){
  if(!e||!Number.isFinite(Number(e.year))||Number(e.year)>year)continue;
  const names={fallen_tree:"地震・倒木",flood:"河川氾濫",wildfire:"山火事"};
  items.push({year:Number(e.year),label:names[e.kind]||"災害",kind:"disaster",x:e.x,y:e.y});
 }
 for(const e of window.WildEraEcology?.history?.(year)||[]){
  if(!e||!Number.isFinite(Number(e.year))||Number(e.year)>year)continue;
  items.push({year:Number(e.year),label:(regions[e.region]||"未知の地区")+"："+e.name,kind:"ecology",region:e.region});
 }
 try{const x=JSON.parse(localStorage.getItem("wild-reclaim-world-chronicle-v1")||"null");
  for(const e of x?.lightningHistory||[]){
   const y=Number(e.year);if(Number.isFinite(y)&&y<=year)items.push({year:y,label:"落雷の記録",kind:"lightning"});
  }
 }catch(_){}
 // NPC abductions are actual captured/removed animals, not visual UFO sightings.
 try{
  const raw=JSON.parse(localStorage.getItem("wild-reclaim-ufo-abduction-history-v1")||"[]");
  if(Array.isArray(raw))for(const e of raw){
   const y=Number(e?.year);
   if(!Number.isFinite(y)||y<0||y>year)continue;
   const kind=typeof e.kind==="string"&&/^[a-zA-Z0-9_-]{1,40}$/.test(e.kind)?e.kind:"不明";
   items.push({year:y,label:"UFOによる動物の誘拐（"+kind+"）",kind:"ufo-abduction"});
  }
 }catch(_){}
 return items.sort((a,b)=>b.year-a.year||a.label.localeCompare(b.label,"ja")).slice(0,120);
}
function render(){
 const list=$("world-history-list"),summary=$("world-history-summary");if(!list||!summary)return;
 const t=seconds(),clock=window.WildWorldClock?.at(t),year=clock?.year??Math.floor(t/120),events=entries(t);
 summary.textContent="世界 "+year+"年｜"+(clock?.season||"季節不明")+"｜記録 "+events.length+"件（地域変動は直近約100年）";
 list.replaceChildren();
 if(!events.length){const li=document.createElement("li");li.textContent="まだ記録はありません。世界の探索を続けてください。";list.append(li);return}
 for(const e of events){const li=document.createElement("li");li.textContent="世界"+e.year.toFixed(e.year%1?1:0)+"年｜"+e.label;list.append(li)}
}
function close(){const panel=$("world-history-view");if(!panel)return;panel.classList.add("hidden");panel.setAttribute("aria-hidden","true");$("world-history-open")?.setAttribute("aria-expanded","false")}
function open(){const panel=$("world-history-view");if(!panel)return;render();panel.classList.remove("hidden");panel.setAttribute("aria-hidden","false");$("world-history-open")?.setAttribute("aria-expanded","true");$("world-history-close")?.focus()}
function setup(){
 $("world-history-open")?.addEventListener("click",open);
 $("world-history-close")?.addEventListener("click",close);
 $("world-history-view")?.addEventListener("click",e=>{if(e.target===$("world-history-view"))close()});
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("world-history-view")?.classList.contains("hidden")){e.preventDefault();close()}});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",setup,{once:true});else setup();
window.WildWorldHistory=Object.freeze({entries,render,open,close});
})();