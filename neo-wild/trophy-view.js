/* WILD RECLAIM: read-only permanent trophy collection on the title menu. */
(()=>{"use strict";
const $=id=>document.getElementById(id);
const panel=$("trophy-view"),list=$("trophy-list"),count=$("trophy-count");
const button=$("trophies-open"),closeButton=$("trophies-close");
if(!panel||!list||!count||!button||!closeButton)return;
const TIER_NAMES={bronze:"ブロンズ",silver:"シルバー",gold:"ゴールド"};
const TIER_ORDER={gold:0,silver:1,bronze:2};
function render(){
 const trophies=window.WildTrophies?.catalog?.()||[];
 const earned=trophies.filter(x=>x.earned).length;
 count.textContent="獲得 "+earned+" / "+trophies.length+"　｜　ブロンズ・シルバー・ゴールド";
 const fragment=document.createDocumentFragment();
 const order=[...trophies].sort((a,b)=>Number(b.earned)-Number(a.earned)||
  TIER_ORDER[a.tier]-TIER_ORDER[b.tier]||a.name.localeCompare(b.name,"ja"));
 for(const trophy of order){
  const item=document.createElement("li");
  const tier=["bronze","silver","gold"].includes(trophy.tier)?trophy.tier:"bronze";
  const masked=trophy.hidden&&!trophy.earned;
  item.className="trophy-entry trophy-"+(masked?"secret":tier)+(trophy.earned?" trophy-earned":" trophy-locked");
  const med=document.createElement("span");med.className="trophy-medal";
  med.textContent=masked?"？":tier==="gold"?"★":tier==="silver"?"◆":"●";
  med.setAttribute("aria-hidden","true");
  const details=document.createElement("div");details.className="trophy-entry-details";
  const title=document.createElement("strong");title.textContent=trophy.name;
  const description=document.createElement("small");description.textContent=trophy.description;
  details.append(title,description);
  const tierLabel=document.createElement("span");tierLabel.className="trophy-tier";
  tierLabel.textContent=masked?"秘密":TIER_NAMES[tier];
  const status=document.createElement("span");status.className="trophy-state";
  status.textContent=trophy.earned?"獲得済":"未獲得";
  const side=document.createElement("div");side.className="trophy-entry-side";side.append(tierLabel,status);
  item.append(med,details,side);fragment.append(item);
 }
 list.replaceChildren(fragment);
}
function open(){
 if($("menu")?.classList.contains("hidden"))return;
 render();panel.classList.remove("hidden");panel.setAttribute("aria-hidden","false");
 button.setAttribute("aria-expanded","true");closeButton.focus();
}
function close(){
 panel.classList.add("hidden");panel.setAttribute("aria-hidden","true");
 button.setAttribute("aria-expanded","false");button.focus();
}
button.addEventListener("click",open);closeButton.addEventListener("click",close);
panel.addEventListener("click",e=>{if(e.target===panel)close();});
document.addEventListener("keydown",e=>{
 if(panel.classList.contains("hidden"))return;
 if(e.key==="Escape"||e.key==="Backspace"){e.preventDefault();e.stopImmediatePropagation();close();}
},true);
window.WildTrophyView={open,close,isOpen:()=>!panel.classList.contains("hidden")};
})();