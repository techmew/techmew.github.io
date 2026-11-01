/* WILD RECLAIM standard physical gamepad: PS/Xbox positions, no save changes. */
(()=>{
"use strict";
const B=()=>window.WildGamepadBridge, dead=.2, hold={2:450,3:550};
let active=-1,modeBefore="",mx=0,my=0,focused=null,label="";
const old=new Map(),began=new Map(),fired=new Set();
const hud=document.createElement("div");hud.id="gamepad-status";hud.hidden=true;hud.setAttribute("role","status");document.body.appendChild(hud);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const pads=()=>{try{return typeof navigator.getGamepads==="function"?Array.from(navigator.getGamepads()||[]).filter(p=>p&&p.connected!==false&&p.mapping==="standard"):[]}catch(_){return []}};
const buttons=p=>Array.from(p.buttons||[],b=>!!(b&&(b.pressed||b.value>.55)));
const axis=(p,i)=>clamp(Number(p.axes?.[i])||0,-1,1);
function stick(x,y){const r=Math.hypot(x,y);if(r<=dead)return [0,0];const k=clamp((r-dead)/(1-dead),0,1)/r;return [x*k,y*k]}
function neutral(){mx=my=0;began.clear();fired.clear();B()?.setMove(0,0)}
function status(p,mode){
 const s=p?"パッド"+(p.index+1)+" 接続｜"+(mode==="play"?"左:移動 右:視点 ×:攻撃 ○:ジャンプ □:飛びつき △:行動 START:停止":"十字:選択 ×:決定 ○:戻る START:再開"):"";
 if(s!==label){hud.textContent=s;label=s}hud.hidden=!p;
}
function visible(el){if(!el||el.disabled||el.closest?.(".hidden"))return false;const d=el.closest?.("details:not([open])");return (!d||el.tagName==="SUMMARY")&&(!el.getClientRects||el.getClientRects().length>0)}
const scopes={menu:"menu",pause:"pause",upgrade:"upgrade",guide:"tutorial-dialog",inventory:"den-inventory",map:"world-map",result:"result"};
function items(mode){return Array.from(document.getElementById(scopes[mode])?.querySelectorAll("button,summary,select")||[]).filter(visible)}
function focus(mode,step=0){
 const list=items(mode);if(!list.length){focused=null;return}
 let n=list.indexOf(focused);
 if(n<0){const priorities={menu:["continue-btn","new-game-summary","start-btn"],pause:["resume-btn"],guide:["tutorial-next"],result:["retry-btn"]}[mode]||[];n=Math.max(0,list.findIndex(el=>priorities.includes(el.id)))}
 else if(step)n=(n+step+list.length)%list.length;
 focused=list[n];focused.focus?.({preventScroll:true});
}
function confirm(mode){if(!items(mode).includes(focused))focus(mode);if(focused?.tagName!=="SELECT")focused?.click?.()}
function back(mode){
 if(mode==="pause"){B()?.pause();return}
 if(mode==="menu"){
  const d=document.getElementById("new-game-options");if(d?.open){d.open=false;focus(mode);return}
  const c=document.getElementById("checkpoint-list");if(c&&!c.classList.contains("hidden"))document.getElementById("checkpoint-menu-btn")?.click?.();
  return;
 }
 const id={guide:"tutorial-close",inventory:"den-inventory-close",map:"map-close"}[mode];
 if(id)document.getElementById(id)?.click?.();
}
function navigate(mode,dir){
 if(focused?.tagName==="SELECT"){
  const el=focused;el.selectedIndex=clamp(el.selectedIndex+dir,0,el.options.length-1);el.dispatchEvent(new Event("change",{bubbles:true}));return;
 }
 focus(mode,dir);
}
function poll(dt=.016){
 const b=B();if(!b)return;
 const list=pads();
 if(!list.length){if(active!==-1)neutral();active=-1;old.clear();status(null,"");return}
 let p=list.find(p=>p.index===active)||list[0];
 for(const candidate of list){if(candidate.index===p.index)continue;const prev=old.get(candidate.index)||[];if(buttons(candidate).some((v,i)=>v&&!prev[i])){p=candidate;break}}
 if(active!==p.index){active=p.index;neutral();focused=null}
 const mode=b.getMode();
 if(mode!==modeBefore){modeBefore=mode;neutral();focused=null}
 const now=buttons(p),prev=old.get(p.index)||[];
 const down=i=>!!now[i]&&!prev[i],up=i=>!now[i]&&!!prev[i];
 const t=performance.now();status(p,mode);
 if(mode==="play"){
  const [lx,ly]=stick(axis(p,0),axis(p,1));
  const tx=clamp(lx+(now[15]?1:0)-(now[14]?1:0),-1,1);
  const ty=clamp(ly+(now[13]?1:0)-(now[12]?1:0),-1,1);
  const a=1-Math.exp(-clamp(dt,.001,.06)*20);
  mx+=(tx-mx)*a;my+=(ty-my)*a;if(Math.abs(mx)<.005)mx=0;if(Math.abs(my)<.005)my=0;
  b.setMove(mx,my);
  const [rx,ry]=stick(axis(p,2),axis(p,3));
  if(rx)b.turnCamera(rx*clamp(dt,0,.06)*2.9);
  if(Math.abs(ry)>.25)b.zoom(-ry*clamp(dt,0,.06)*.32);
  if(down(9)){b.pause();neutral()}
  else if(down(8)||down(10)){b.map();neutral()}
  else{
   if(down(0))b.action("attack",false);
   if(down(1))b.action("jump",false);
   if(down(4))b.zoom(-.12);
   if(down(5))b.zoom(.12);
   for(const i of [2,3]){
    if(down(i)){began.set(i,t);fired.delete(i)}
    if(now[i]&&began.has(i)&&!fired.has(i)&&t-began.get(i)>=hold[i]){b.action(i===2?"pounce":"context",true);fired.add(i)}
    if(up(i)){if(began.has(i)&&!fired.has(i))b.action(i===2?"pounce":"context",t-began.get(i)>=hold[i]);began.delete(i);fired.delete(i)}
   }
  }
 }else{
  b.setMove(0,0);mx=my=0;
  if(mode==="pause"&&down(9))b.pause();
  else if(mode==="map"&&(down(1)||down(9)))b.map();
  else if(down(1)||down(8))back(mode);
  else if(mode==="guide"&&down(14))document.getElementById("tutorial-prev")?.click?.();
  else if(mode==="guide"&&down(15))document.getElementById("tutorial-next")?.click?.();
  else if(down(12)||down(14))navigate(mode,-1);
  else if(down(13)||down(15))navigate(mode,1);
  else if(down(0)||down(3)||down(9))confirm(mode);
  else if(!focused)focus(mode);
 }
 for(const candidate of list)old.set(candidate.index,buttons(candidate));
 for(const index of [...old.keys()])if(!list.some(p=>p.index===index))old.delete(index);
}
window.addEventListener("gamepadconnected",()=>{});
window.addEventListener("gamepaddisconnected",e=>{if(e.gamepad?.index===active){active=-1;neutral();status(null,"")}old.delete(e.gamepad?.index)});
window.addEventListener("blur",neutral);
window.WildGamepad={poll};
})();
