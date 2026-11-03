/* WILD RECLAIM: persistent defeated-animal encyclopedia, independent of SAVE_SCHEMA2. */
(()=>{"use strict";
const KEY="wild-reclaim-bestiary-v1";
const NORMAL_NAMES={serow:"ニホンカモシカ",mountainGoat:"ヤギ",chimpanzee:"チンパンジー",macaque:"ニホンザル",rat:"ネズミ",rabbit:"ウサギ",pigeon:"ハト",dog:"野犬",boar:"イノシシ",strayCat:"野良猫",snake:"ヘビ",venomSnake:"毒ヘビ",cheetah:"チーター",giraffe:"キリン",zebra:"シマウマ",lion:"ライオン",elephant:"ゾウ",hippo:"カバ",crow:"カラス",raccoonDog:"タヌキ",wildFox:"野生のキツネ",weasel:"イタチ",frog:"カエル",deer:"シカ"};
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
let catalog=[],registry={},counts={},selected=null,yaw=.65,tilt=.1,zoom=1.15,open=false,lastPadNavigation=0;
const points=new Map();
function load(){
 try{const value=JSON.parse(localStorage.getItem(KEY)||"{}");if(value&&typeof value==="object"&&!Array.isArray(value))counts=value;}catch(_){counts={};}
}
function count(type){const n=Number(counts[type]);return Number.isSafeInteger(n)&&n>0?Math.min(n,999999):0;}
function persist(){
 try{const safe={};for(const item of catalog)if(count(item.type))safe[item.type]=count(item.type);localStorage.setItem(KEY,JSON.stringify(safe));return true;}catch(_){return false;}
}
function configure(species,strongNames){
 registry={};catalog=[];
 for(const [type,name] of Object.entries(NORMAL_NAMES)){
  if(!species[type])continue;
  const item={type,name,boss:false,model:species[type]};catalog.push(item);registry[type]=item;
 }
 for(const [type,name] of Object.entries(strongNames||{})){
  if(!species[type])continue;
  const item={type,name,boss:true,model:species[type]};catalog.push(item);registry[type]=item;
 }
 load();
 // Import pre-existing boss trophies from legacy autosave/checkpoints once; do not
 // guess species from the aggregate HUNT counter (it lacks type information).
 const snapshots=[];
 for(const key of ["wild-reclaim-autosave-v2","wild-reclaim-checkpoints-v2"]){
  // One damaged save must not prevent migration from the other valid saves.
  try{
   const value=JSON.parse(localStorage.getItem(key)||"null");
   if(Array.isArray(value))snapshots.push(...value.slice(0,3));
   else if(value&&typeof value==="object")snapshots.push(value);
  }catch(_){}
 }
 for(const snap of snapshots){
  if(!snap||snap.version!==2||!snap.strongTrophies)continue;
  for(const type of Object.keys(strongNames||{})){
   const n=Number(snap.strongTrophies[type]);
   if(Number.isSafeInteger(n)&&n>count(type))counts[type]=Math.min(n,999999);
  }
 }
 persist();updateSummary();
}
function recordKill(type){
 if(!registry[type])return;
 counts[type]=Math.min(999999,count(type)+1);
 persist();if(open)renderList();else updateSummary();
}
function updateSummary(){
 const total=catalog.filter(x=>count(x.type)).length;
 if($("bestiary-open"))$("bestiary-open").textContent="動物図鑑　"+total+" / "+catalog.length;
 if($("bestiary-progress"))$("bestiary-progress").textContent="登録 "+total+" / "+catalog.length+"種";
}
function drawFallback(canvas,item,angle=0){
 const c=canvas.getContext("2d");if(!c)return;
 const w=canvas.width,h=canvas.height,r=Math.min(w/5,h/4),m=item.model;
 c.clearRect(0,0,w,h);c.fillStyle="#101c20";c.fillRect(0,0,w,h);
 c.save();c.translate(w*.49,h*.58);
 const profile=Math.abs(Math.cos(angle));
 function ell(x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,Math.max(1,rx),Math.max(1,ry),0,0,Math.PI*2);c.fill();}
 ell(-r*.06,r*.85,r*1.50,r*.24,"#27383a");
 if(item.type==="snake"||/Snake|Anaconda/.test(item.type)){
  for(let j=0;j<6;j++)ell((-2.1+j*.7)*r,Math.sin(j)*r*.3,r*.58,r*.34,m.color);
 }else{
  for(const side of [-1,1])for(const x of [-.68,.65])ell(x*r,side*r*.8,r*.19,r*.8,m.color);
  ell(-r*.12,0,r*1.30*profile+r*.35,r*.63,m.color);
  ell(r*.75,-r*.25,r*.58,r*.51,m.belly||"#b7b7a8");
  for(const side of [-1,1])ell(r*.48,(-.63+side*.30)*r,r*.19,r*.37,m.color);
  ell(-r*1.45,0,r*.56,r*.19,m.color);
  ell(r*1.11,-r*.34,r*.08,r*.08,"#ecddae");
 }
 c.restore();
}
function drawModel(canvas,item,angle=yaw,magnification=zoom,pitch=tilt){
 if(!item||!count(item.type))return false;
 if(window.Wild3D?.available&&window.Wild3D.previewAnimal?.({...item.model,type:item.type},canvas,angle,magnification,pitch))return true;
 drawFallback(canvas,item,angle);return false;
}
function renderList(){
 const parent=$("bestiary-list");if(!parent)return;
 parent.replaceChildren();
 for(const group of [false,true]){
  const title=document.createElement("h3");title.textContent=group?"強敵":"通常動物";parent.appendChild(title);
  const grid=document.createElement("div");grid.className="bestiary-grid";parent.appendChild(grid);
  for(const item of catalog.filter(x=>x.boss===group)){
   const known=count(item.type)>0,button=document.createElement("button");
   button.type="button";button.className="bestiary-entry"+(known?" unlocked":" locked")+(selected===item.type?" chosen":"");
   button.dataset.type=item.type;button.setAttribute("aria-label",known?item.name+"　討伐"+count(item.type)+"体":"未発見の動物");
   const thumb=document.createElement("canvas");thumb.width=104;thumb.height=82;thumb.className="bestiary-thumb";
   if(known)drawModel(thumb,item,.65,1.18,.12);
   else{const c=thumb.getContext("2d");c.fillStyle="#132027";c.fillRect(0,0,104,82);c.fillStyle="#738083";c.font="24px sans-serif";c.textAlign="center";c.fillText("？",52,51);}
   const name=document.createElement("strong");name.textContent=known?item.name:"？？？";
   const countTag=document.createElement("small");const recommended=window.WildCombatLevels?.level(item.type)||1;
   countTag.textContent=(known?"討伐 "+count(item.type)+"体":"未討伐")+"｜推奨LV"+recommended;
   button.append(thumb,name,countTag);
   button.disabled=!known;button.addEventListener("click",()=>select(item.type));
   grid.appendChild(button);
  }
 }
 updateSummary();
}
function select(type){
 const item=registry[type];if(!item||!count(type))return;
 selected=type;yaw=.65;tilt=.1;zoom=1.15;
 $("bestiary-list").classList.add("hidden");
 $("bestiary-detail").classList.remove("hidden");
 $("bestiary-name").textContent=item.name;
 $("bestiary-count").textContent="討伐 "+count(type)+"体｜推奨LV"+(window.WildCombatLevels?.level(type)||1);
 $("bestiary-render-help").textContent="指で回転・ピンチで拡大縮小。ゲームパッドは右スティックとL/R。";
 renderPreview();
 document.querySelectorAll(".bestiary-entry").forEach(e=>e.classList.toggle("chosen",e.dataset.type===type));
}
function renderPreview(){
 const item=registry[selected];if(!item||!open)return;
 const can=$("bestiary-preview");const ok=drawModel(can,item);
 if(!ok)$("bestiary-render-help").textContent="3D描画に非対応のため簡易表示中です。";
 $("bestiary-zoom").textContent=Math.round(zoom*100)+"%";
}
function openDialog(){
 if(!catalog.length)return;
 open=true;selected=null;$("bestiary").classList.remove("hidden");$("bestiary-detail").classList.add("hidden");$("bestiary-list").classList.remove("hidden");
 $("bestiary-open").setAttribute("aria-expanded","true");renderList();$("bestiary-close").focus({preventScroll:true});
}
function closeDialog(){
 open=false;points.clear();$("bestiary").classList.add("hidden");$("bestiary-open").setAttribute("aria-expanded","false");$("bestiary-open").focus({preventScroll:true});
}
function adjustZoom(delta){zoom=clamp(zoom+delta,.60,2.25);renderPreview();}
function install(){
 $("bestiary-open")?.addEventListener("click",openDialog);
 $("bestiary-close")?.addEventListener("click",closeDialog);
 $("bestiary-back")?.addEventListener("click",()=>{selected=null;$("bestiary-detail").classList.add("hidden");$("bestiary-list").classList.remove("hidden");renderList();});
 $("bestiary-plus")?.addEventListener("click",()=>adjustZoom(.16));
 $("bestiary-minus")?.addEventListener("click",()=>adjustZoom(-.16));
 const canvas=$("bestiary-preview");
 canvas.addEventListener("pointerdown",e=>{if(!selected)return;e.preventDefault();canvas.setPointerCapture(e.pointerId);points.set(e.pointerId,{x:e.clientX,y:e.clientY});});
 canvas.addEventListener("pointermove",e=>{
  if(!points.has(e.pointerId)||!selected)return;e.preventDefault();
  const p=points.get(e.pointerId),dx=e.clientX-p.x,dy=e.clientY-p.y;
  if(points.size===1){yaw=(yaw+dx*.015)%(Math.PI*2);tilt=clamp(tilt+dy*.008,-.85,.85);}
  else{
   const others=[...points.entries()].filter(([id])=>id!==e.pointerId);
   if(others.length){const op=others[0][1];const before=Math.hypot(p.x-op.x,p.y-op.y);const after=Math.hypot(e.clientX-op.x,e.clientY-op.y);zoom=clamp(zoom+(after-before)*.009,.60,2.25);}
  }
  points.set(e.pointerId,{x:e.clientX,y:e.clientY});renderPreview();
 });
 for(const type of ["pointerup","pointercancel","lostpointercapture"])canvas.addEventListener(type,e=>points.delete(e.pointerId));
 canvas.addEventListener("wheel",e=>{if(!selected)return;e.preventDefault();adjustZoom(e.deltaY<0?.12:-.12);},{passive:false});
 document.addEventListener("keydown",e=>{
  if(!open)return;
  if(e.key==="Escape"){e.preventDefault();if(selected){$("bestiary-back").click();}else closeDialog();}
  if(!selected)return;
  if(e.key==="ArrowLeft"||e.key==="ArrowRight"){e.preventDefault();yaw+=(e.key==="ArrowLeft"?-.16:.16);renderPreview();}
  if(e.key==="ArrowUp"||e.key==="ArrowDown"){e.preventDefault();tilt=clamp(tilt+(e.key==="ArrowUp"?-.12:.12),-.85,.85);renderPreview();}
  if(e.key==="+"||e.key==="="||e.key==="-"){e.preventDefault();adjustZoom(e.key==="-"?-.14:.14);}
 });
}
function handlePad(p,down,dt){
 if(!open)return;
 if(down(1)||down(8)){if(selected)$("bestiary-back").click();else closeDialog();return;}
 if(selected){
  const a=p.axes||[];const rx=Number(a[2])||0,ry=Number(a[3])||0;
  if(Math.abs(rx)>.18||Math.abs(ry)>.18){yaw+=rx*dt*2.5;tilt=clamp(tilt+ry*dt*1.4,-.85,.85);renderPreview();}
  if(down(4))adjustZoom(-.15);if(down(5))adjustZoom(.15);
  return;
 }
 const unlocked=catalog.filter(i=>count(i.type));
 if(!unlocked.length)return;
 const now=performance.now(),b=p.buttons||[],vy=(b[13]?.pressed?1:0)-(b[12]?.pressed?1:0),vx=(b[15]?.pressed?1:0)-(b[14]?.pressed?1:0),ay=Number(p.axes?.[1])||0;
 const step=vy||vx||(Math.abs(ay)>.6?Math.sign(ay):0);
 if(step&&now-lastPadNavigation>180){
  const focused=unlocked.findIndex(i=>i.type===document.activeElement?.dataset?.type);
  const i=(focused+step+unlocked.length)%unlocked.length,el=$("bestiary-list").querySelector('[data-type="'+unlocked[i].type+'"]');
  el?.focus();el?.scrollIntoView({block:"nearest"});lastPadNavigation=now;
 }
 if(down(0)){const el=document.activeElement;if(el?.dataset?.type&&count(el.dataset.type))select(el.dataset.type);else select(unlocked[0].type);}
}
install();load();
window.WildBestiary={configure,recordKill,isOpen:()=>open,handlePad};
})();
