/* STAR FIGHTER immersive display controls.
   requestFullscreen must run directly inside user activation; it cannot hide
   browser chrome on platforms that do not offer the Fullscreen API. */
(()=>{
'use strict';
const shell=document.getElementById('shell');
const btn=document.getElementById('fullscreenBtn');
const hint=document.getElementById('fullscreenHint');
const primary=['startBtn','continueBtn','seedReplay'];
if(!shell||!btn)return;
let hintTimer=0;
const fullscreenActive=()=>document.fullscreenElement===shell||document.webkitFullscreenElement===shell;
function installed(){return !!(window.matchMedia&&(window.matchMedia('(display-mode: fullscreen)').matches||window.matchMedia('(display-mode: standalone)').matches))||window.navigator.standalone===true}
function showHint(){
 if(!hint)return;
 hint.textContent=/iPad|iPhone|iPod/i.test(navigator.userAgent)?'Safariはホーム画面に追加して起動するとアドレスバーを隠せます。':'全画面にできない場合は、ブラウザの「ホーム画面に追加」から起動してください。';
 hint.hidden=false;
 clearTimeout(hintTimer);
 hintTimer=setTimeout(()=>{hint.hidden=true},5500);
}
function updateBtn(){
 const on=fullscreenActive()||installed();
 btn.textContent=on?'⤢ 全画面中':'⛶ 全画面';
 btn.setAttribute('aria-label',on?'全画面を終了':'ゲームを全画面にする');
 btn.setAttribute('aria-pressed',on?'true':'false');
 btn.title=installed()?'アプリ表示中':on?'通常表示に戻す':'アドレスバーを隠して最大化';
}
function enterFullscreen(notify=true){
 if(fullscreenActive()||installed()){updateBtn();return}
 const request=shell.requestFullscreen||shell.webkitRequestFullscreen;
 if(!request){if(notify)showHint();return}
 try{
  const promise=request.call(shell);
  if(promise&&typeof promise.then==='function'){
   promise.then(()=>{
    updateBtn();
    if(window.matchMedia?.('(pointer: coarse)').matches){
     try{screen.orientation?.lock?.('landscape')?.catch?.(()=>{})}catch(_){}
    }
   }).catch(()=>{updateBtn();if(notify)showHint()});
  }else updateBtn();
 }catch(_){updateBtn();if(notify)showHint()}
}
function toggleFullscreen(){
 if(installed()){showHint();return}
 if(fullscreenActive()){
  const exit=document.exitFullscreen||document.webkitExitFullscreen;
  try{exit?.call(document)?.catch?.(()=>{})}catch(_){}
 }else enterFullscreen(true)
}
btn.addEventListener('click',toggleFullscreen);
/* Capture ensures a click is still a user gesture before game setup proceeds.
   Auto-enter only on touch devices; desktop users can use the button. */
for(const id of primary){
 document.getElementById(id)?.addEventListener('click',()=>{if(window.matchMedia?.('(pointer: coarse)').matches)enterFullscreen(false)},true)
}
document.addEventListener('fullscreenchange',updateBtn);
document.addEventListener('webkitfullscreenchange',updateBtn);
document.addEventListener('fullscreenerror',()=>showHint());
document.addEventListener('webkitfullscreenerror',()=>showHint());
window.addEventListener('keydown',e=>{
 if(e.key.toLowerCase()==='f'&&!e.repeat&&!(e.target&&/input|textarea/i.test(e.target.tagName))){
  e.preventDefault();toggleFullscreen()
 }
});
updateBtn();
window.StarFighterFullscreen={enter:enterFullscreen,active:fullscreenActive};
})();