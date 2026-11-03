/* WILD RECLAIM standard physical gamepad: PS/Xbox positions, no save changes. */
(()=>{
"use strict";
const B=()=>window.WildGamepadBridge, dead=.2, hold={2:450,1:550};
let active=-1,modeBefore="",mx=0,my=0,focused=null,label="";
let navDirection=0,navStarted=0,navLast=0,selectEditing=false,selectOriginal=null;
const menuGuide=document.getElementById("gamepad-menu-guide"),menuCurrent=document.getElementById("gamepad-menu-current");
const old=new Map(),began=new Map(),fired=new Set();
const hud=document.createElement("div");hud.id="gamepad-status";hud.hidden=true;hud.setAttribute("role","status");document.body.appendChild(hud);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const pads=()=>{try{return typeof navigator.getGamepads==="function"?Array.from(navigator.getGamepads()||[]).filter(p=>p&&p.connected!==false&&p.mapping==="standard"):[]}catch(_){return []}};
const buttons=p=>Array.from(p.buttons||[],b=>!!(b&&(b.pressed||b.value>.55)));
const axis=(p,i)=>clamp(Number(p.axes?.[i])||0,-1,1);
function stick(x,y){const r=Math.hypot(x,y);if(r<=dead)return [0,0];const k=clamp((r-dead)/(1-dead),0,1)/r;return [x*k,y*k]}
function clearFocus(){
 if(focused)focused.classList?.remove("gamepad-focused");
 focused=null;selectEditing=false;selectOriginal=null;navDirection=0;navStarted=0;navLast=0;
}
function neutral(){mx=my=0;began.clear();fired.clear();B()?.setMove(0,0);B()?.action("sprint",false);B()?.action("attack",false)}
function selectText(el){
 if(!el)return "項目を選択してください";
 if(el.id==="continue-btn")return "続きから／最初からプレイ";
 if(el.id==="start-btn")return "新しいゲームを開始";
 if(el.id==="checkpoint-menu-btn")return "チェックポイント一覧";
 if(el.id?.startsWith("checkpoint-slot-"))return el.textContent.trim()||"チェックポイント";
 if(el.classList?.contains("animal-card"))return "動物：" +(el.querySelector("b")?.textContent?.trim()||el.dataset.animal);
 if(el.classList?.contains("orientation-choice"))return "画面の向き：" +(el.querySelector("strong")?.textContent?.trim()||"画面選択");
 if(el.tagName==="SELECT")return "出発地点：" +(el.options[el.selectedIndex]?.textContent?.trim()||"選択");
 return (el.textContent||"項目").replace(/\s+/g," ").trim().slice(0,48);
}
function updateGuide(p,mode){
 if(menuGuide)menuGuide.hidden=!(p&&mode==="menu");
 if(mode!=="menu"||!menuCurrent)return;
 const tip=selectEditing?"候補を選択中｜方向キー：変更　×/A：確定　○/B：取消": "選択中："+selectText(focused)+"　｜　×/A：決定　○/B：戻る";
 if(menuCurrent.textContent!==tip)menuCurrent.textContent=tip;
}
function status(p,mode){
 const s=p?"パッド"+(p.index+1)+" 接続｜"+(mode==="play"?"左スティック:移動 右:視点 △/Y:連続攻撃 □/X:飛びつき/長押しダッシュ ○/B:食べる/くわえる ×/A:ジャンプ START:停止":mode==="menu"?"十字/左スティック:選択 ×/A:決定 ○/B:戻る":"十字/左スティック:選択 ×/A:決定 ○/B:戻る"):"";
 if(s!==label){hud.textContent=s;label=s}hud.hidden=!p||mode==="menu"||mode==="dying"||mode==="result";updateGuide(p,mode);
}
function visible(el){if(!el||el.disabled||el.closest?.(".hidden"))return false;const d=el.closest?.("details:not([open])");return (!d||el.tagName==="SUMMARY")&&(!el.getClientRects||el.getClientRects().length>0)}
const scopes={menu:"menu",pause:"pause",upgrade:"upgrade",guide:"tutorial-dialog",inventory:"den-inventory",map:"world-map",result:"result"};
function items(mode){return Array.from(document.getElementById(scopes[mode])?.querySelectorAll("button,summary,select")||[]).filter(visible)}
function focusElement(el){
 if(!el)return;
 if(focused!==el){
  focused?.classList?.remove("gamepad-focused");
  focused=el;selectEditing=false;selectOriginal=null;
 }
 focused.classList?.add("gamepad-focused");
 focused.focus?.({preventScroll:true});
 focused.scrollIntoView?.({block:"nearest",inline:"nearest"});
 updateGuide({index:active},modeBefore);
}
function focus(mode,step=0){
 const list=items(mode);if(!list.length){clearFocus();return}
 let n=list.indexOf(focused);
 if(n<0){
  const priorities={menu:["continue-btn","start-btn"],pause:["resume-btn"],guide:["tutorial-close"],result:["retry-btn"]}[mode]||[];
  n=list.findIndex(el=>priorities.includes(el.id));
  if(n<0)n=0;
 }else if(step)n=(n+step+list.length)%list.length;
 focusElement(list[n]);
}
function changeSelect(el,dir){
 if(!el?.options?.length)return;
 const n=(el.selectedIndex+dir+el.options.length)%el.options.length;
 el.selectedIndex=n;
 el.dispatchEvent(new Event("change",{bubbles:true}));
 updateGuide({index:active},modeBefore);
}
function confirm(mode){
 if(!items(mode).includes(focused))focus(mode);
 if(focused?.tagName==="SELECT"){
  if(selectEditing){selectEditing=false;selectOriginal=null;}
  else{selectEditing=true;selectOriginal=focused.selectedIndex;}
  updateGuide({index:active},mode);
  return;
 }
 focused?.click?.();
 // Menus can hide the activated item; re-evaluate it on the next poll.
}
function back(mode){
 if(selectEditing&&focused?.tagName==="SELECT"){
  focused.selectedIndex=selectOriginal;
  focused.dispatchEvent(new Event("change",{bubbles:true}));
  selectEditing=false;selectOriginal=null;updateGuide({index:active},mode);return;
 }
 if(mode==="result"){const choice=document.getElementById("menu-btn");if(visible(choice))focusElement(choice);return}
 if(mode==="pause"){B()?.pause();return}
 if(mode==="menu"){
  const c=document.getElementById("checkpoint-list");
  if(c&&!c.classList.contains("hidden")){
   document.getElementById("checkpoint-menu-btn")?.click?.();
  }
  const first=document.getElementById("continue-btn");
  if(visible(first)){focusElement(first);return}
  const animal=items(mode).find(el=>el.classList?.contains("animal-card"));
  if(animal)focusElement(animal);
  return;
 }
 const id={guide:"tutorial-close",inventory:"den-inventory-close",map:"map-close"}[mode];
 if(id)document.getElementById(id)?.click?.();
}
function navigate(mode,dir){
 if(selectEditing&&focused?.tagName==="SELECT"){changeSelect(focused,dir);return}
 focus(mode,dir);
}
function navigateHorizontal(mode,dir){
 if(mode==="menu"){
  if(!items(mode).includes(focused))focus(mode);
  if(focused?.tagName==="SELECT"){changeSelect(focused,dir);return}
  const group=focused?.closest?.(".animals,.orientation-choices");
  if(group){
   const row=Array.from(group.querySelectorAll("button")).filter(visible);
   const index=row.indexOf(focused);
   if(index>=0&&row.length>1){
    const chosen=row[(index+dir+row.length)%row.length];
    focusElement(chosen);
    chosen.click?.();
    return;
   }
  }
 }
 if(selectEditing&&focused?.tagName==="SELECT"){changeSelect(focused,dir);return}
 focus(mode,dir);
}
function navigationDirection(p,now){
 const x=axis(p,0),y=axis(p,1);
 if(now[12]||now[13]||now[14]||now[15]){
  if(now[12])return -1;
  if(now[13])return 1;
  if(now[14])return -2;
  return 2;
 }
 // Trigger below -0.62 or above +0.62. Switch to new direction immediately.
 if(Math.abs(x)>=.62&&Math.abs(x)>Math.abs(y))return x<0?-2:2;
 if(Math.abs(y)>=.62)return y<0?-1:1;
 return 0;
}
function navigateRepeat(mode,dir,t){
 if(!dir){navDirection=0;return}
 if(dir!==navDirection){navDirection=dir;navStarted=t;navLast=t;}
 else{
  if(t-navStarted<360||t-navLast<155)return;
  navLast=t;
 }
 if(Math.abs(dir)===2)navigateHorizontal(mode,dir<0?-1:1);
 else navigate(mode,dir);
}
function poll(dt=.016){
 const b=B();if(!b)return;
 const list=pads();
 if(!list.length){if(active!==-1)neutral();active=-1;old.clear();clearFocus();status(null,"");return}
 let p=list.find(p=>p.index===active)||list[0];
 for(const candidate of list){if(candidate.index===p.index)continue;const prev=old.get(candidate.index)||[];if(buttons(candidate).some((v,i)=>v&&!prev[i])){p=candidate;break}}
 if(active!==p.index){active=p.index;neutral();clearFocus()}
 const rawMode=b.getMode();
 // The game reports over/clear; both display the same result dialog.
 const mode=rawMode==="over"||rawMode==="clear"?"result":rawMode;
 if(mode!==modeBefore){modeBefore=mode;neutral();clearFocus()}
 const now=buttons(p),prev=old.get(p.index)||[];
 const down=i=>!!now[i]&&!prev[i],up=i=>!now[i]&&!!prev[i];
 const t=performance.now();status(p,mode);
 // The encyclopedia is a modal above the title; never activate title controls behind it.
 if(window.WildBestiary?.isOpen()){
  b.setMove(0,0);mx=my=0;
  window.WildBestiary.handlePad(p,down,clamp(dt,0,.06));
  for(const candidate of list)old.set(candidate.index,buttons(candidate));
  return;
 }
 // Trophy collection is a modal above the title; pad input must not start gameplay behind it.
 if(window.WildTrophyView?.isOpen?.()){
  b.setMove(0,0);mx=my=0;
  const gallery=document.getElementById("trophy-list");
  if((down(12)||down(13))&&gallery)gallery.scrollTop+=(down(13)?1:-1)*100;
  if(down(1)||down(9)||down(0))window.WildTrophyView.close();
  for(const candidate of list)old.set(candidate.index,buttons(candidate));
  return;
 }
 if(mode==="play"){
  const [lx,ly]=stick(axis(p,0),axis(p,1));
  // D-pad overrides a held analog stick on its own axis.
  const dx=(now[15]?1:0)-(now[14]?1:0),dy=(now[13]?1:0)-(now[12]?1:0);
  const tx=dx||lx,ty=dy||ly;
  const length=Math.max(1,Math.hypot(tx,ty));
  mx=tx/length;my=ty/length;
  b.setMove(mx,my);
  const [rx,ry]=stick(axis(p,2),axis(p,3));
  if(rx)b.turnCamera(rx*clamp(dt,0,.06)*2.9);
  if(Math.abs(ry)>.25)b.zoom(-ry*clamp(dt,0,.06)*.32);
  if(down(9)){b.pause();neutral()}
  else if(down(8)||down(10)){b.map();neutral()}
  else{
   // PS/Xbox position mapping: top △/Y, left □/X, right ○/B, bottom ×/A.
   if(down(3))b.action("attack",true);
   if(up(3))b.action("attack",false);
   if(down(0))b.action("jump",false);
   if(down(4))b.zoom(-.12);
   if(down(5))b.zoom(.12);
   for(const i of [2,1]){
    if(down(i)){began.set(i,t);fired.delete(i)}
    if(now[i]&&began.has(i)&&!fired.has(i)&&t-began.get(i)>=hold[i]){
     b.action(i===2?"sprint":"context",true);fired.add(i);
    }
    if(up(i)){
     if(i===2&&fired.has(i))b.action("sprint",false);
     else if(began.has(i)&&!fired.has(i)&&t-began.get(i)<hold[i])
      b.action(i===2?"pounce":"context",false);
     else if(i===1&&began.has(i)&&!fired.has(i))b.action("context",true);
     began.delete(i);fired.delete(i);
    }
   }
  }
 }else if(mode==="dying"){
  // The death animation is non-interactive; never activate a hidden menu.
  b.setMove(0,0);mx=my=0;
 }else{
  b.setMove(0,0);mx=my=0;
  if(mode==="pause"&&down(9))b.pause();
  else if(mode==="map"&&(down(1)||down(9)))b.map();
  else if(mode==="guide"&&down(9))document.getElementById("tutorial-close")?.click?.();
  else if(mode==="inventory"&&down(9))document.getElementById("den-inventory-close")?.click?.();
  else if(mode==="result"&&down(9)){} // START never auto-retries or discards a run.
  else if(down(1)||down(8))back(mode);
  else if(mode==="guide"&&(down(0)||down(3)))document.getElementById("tutorial-close")?.click?.();
  else if(down(0)||down(3))confirm(mode);
  else if(!items(mode).includes(focused)){
   // A menu action or a touch input may hide the previously selected control.
   // Recover the visible focus before processing the next D-pad movement.
   focus(mode);
   navigateRepeat(mode,navigationDirection(p,now),t);
  }
  else navigateRepeat(mode,navigationDirection(p,now),t);
 }
 for(const candidate of list)old.set(candidate.index,buttons(candidate));
 for(const index of [...old.keys()])if(!list.some(p=>p.index===index))old.delete(index);
}
window.addEventListener("gamepadconnected",()=>{});
window.addEventListener("gamepaddisconnected",e=>{if(e.gamepad?.index===active){active=-1;neutral();clearFocus();status(null,"")}old.delete(e.gamepad?.index)});
window.addEventListener("blur",neutral);
window.WildGamepad={poll};
})();
