/* STAR FIGHTER manual display orientation. Choice, not implicit rotation. */
(()=>{'use strict';
const shell=document.getElementById('shell'),btn=document.getElementById('fullscreenBtn');
const switchBtn=document.getElementById('orientationBtn'),hint=document.getElementById('fullscreenHint');
if(!shell||!btn)return;
let preference='portrait',hintTimer=0,lockVersion=0;
const full=()=>document.fullscreenElement===shell||document.webkitFullscreenElement===shell;
const installed=()=>!!(window.matchMedia&&(window.matchMedia('(display-mode: fullscreen)').matches||window.matchMedia('(display-mode: standalone)').matches))||window.navigator.standalone===true;
function showHint(message){
 if(!hint)return;hint.textContent=message;hint.hidden=false;
 clearTimeout(hintTimer);hintTimer=setTimeout(()=>{hint.hidden=true},4200);
}
function unlock(){try{screen?.orientation?.unlock?.()}catch(_){}}
function update(){
 const active=full()||installed();
 btn.textContent=active?'⤢ 全画面中':'⛶ 最大化';
 btn.setAttribute('aria-pressed',active?'true':'false');
 if(switchBtn){switchBtn.textContent=preference==='portrait'?'↻ 横へ':'↻ 縦へ';
 switchBtn.setAttribute('aria-label',preference==='portrait'?'横画面に切り替える':'縦画面に切り替える')}
}
function lockMode(mode,notify=false){
 const version=++lockVersion,orient=screen?.orientation;
 if(!orient||typeof orient.lock!=='function'){
  if(notify)showHint('画面方向を固定できません。端末を'+(mode==='portrait'?'縦':'横')+'に向けてください。');return;
 }
 try{
  const result=orient.lock(mode);
  if(result&&typeof result.catch==='function')result.catch(()=>{
   if(version===lockVersion&&notify)showHint('回転制限中です。端末を'+(mode==='portrait'?'縦':'横')+'に向けてください。');
  });
 }catch(_){if(notify)showHint('端末を'+(mode==='portrait'?'縦':'横')+'に向けてください。')}
}
function enter(notify=true){
 if(full()||installed()){update();lockMode(preference,notify);return}
 const request=shell.requestFullscreen||shell.webkitRequestFullscreen;
 if(!request){if(notify)showHint('このブラウザでは全画面にできません。手動で端末を回転してください。');return}
 try{
  const p=request.call(shell);
  if(p&&typeof p.then==='function')p.then(()=>{update();lockMode(preference,notify)})
    .catch(()=>{if(notify)showHint('全画面にできません。端末を手動で回転してください。')});
  else{update();lockMode(preference,notify)}
 }catch(_){if(notify)showHint('端末の向きを手動で変更してください。')}
}
function choose(mode,activate=false,notify=false){
 preference=mode==='landscape'?'landscape':'portrait';
 shell.dataset.orientationPreference=preference;update();
 // Portrait start remains portrait and never asks for landscape by default.
 if(activate&&preference==='landscape')enter(notify);
 else if(full()||installed())lockMode(preference,notify);
 else if(preference==='portrait')unlock();
}
function toggle(){
 if(full()){
  const exit=document.exitFullscreen||document.webkitExitFullscreen;
  try{const p=exit?.call(document);if(p&&typeof p.finally==='function')p.finally(unlock);else unlock()}
  catch(_){unlock()}
 }else enter(true);
}
btn.addEventListener('click',toggle);
document.getElementById('startBtn')?.addEventListener('click',()=>choose('portrait',false),true);
document.getElementById('landscapeStartBtn')?.addEventListener('click',()=>choose('landscape',true,true),true);
for(const id of ['continueBtn','seedReplay'])
 document.getElementById(id)?.addEventListener('click',()=>{if(preference==='landscape')enter(false)},true);
switchBtn?.addEventListener('click',()=>choose(preference==='portrait'?'landscape':'portrait',true,true));
document.addEventListener('fullscreenchange',()=>{update();if(!full())unlock()});
document.addEventListener('webkitfullscreenchange',()=>{update();if(!full())unlock()});
document.addEventListener('fullscreenerror',()=>showHint('全画面にできません。端末を手動で回転してください。'));
window.addEventListener('keydown',e=>{
 if(e.key?.toLowerCase()==='f'&&!e.repeat&&!(e.target&&/input|textarea/i.test(e.target.tagName))){
  e.preventDefault();toggle();
 }
});
update();
window.StarFighterFullscreen={enter,active:full,choose,getPreference:()=>preference};
})();