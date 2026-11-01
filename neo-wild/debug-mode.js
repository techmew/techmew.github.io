/* WILD RECLAIM debug mode. Seven taps/clicks on the title to unlock. */
(() => {
"use strict";
const menu=document.getElementById("menu");
const title=menu?.querySelector(".hero-title");
if(!menu||!title)return;
const style=document.createElement("style");
style.id="wr-debug-style";
style.textContent=[
"#wr-debug-pill,#wr-debug-panel{font-family:system-ui,'Noto Sans JP',sans-serif;box-sizing:border-box;color:#eef3f0;}",
"#wr-debug-pill[hidden],#wr-debug-panel[hidden]{display:none!important;}",
"#wr-debug-pill{position:fixed;z-index:4999;left:50%;bottom:calc(6px + env(safe-area-inset-bottom));transform:translateX(-50%);background:#152a2fe8;border:1px solid #7cc9b5;border-radius:22px;padding:7px 18px;font-size:11px;font-weight:800;box-shadow:0 3px 12px #0008;touch-action:manipulation;}",
"#wr-debug-panel{position:fixed;right:10px;top:calc(8px + env(safe-area-inset-top));width:min(350px,calc(100vw - 20px));max-height:calc(100dvh - 32px);overflow:auto;z-index:5000;padding:14px;background:#101b20f6;border:1px solid #56786f;border-radius:14px;box-shadow:0 12px 50px #000b;font-size:12px;overscroll-behavior:contain;}",
"#wr-debug-panel *{box-sizing:border-box;}",
"#wr-debug-panel header{display:flex;gap:8px;align-items:center;justify-content:space-between;margin-bottom:10px;}",
"#wr-debug-panel header strong{font-size:14px;letter-spacing:.08em;}",
"#wr-debug-panel button,#wr-debug-panel select{background:#273b40;border:1px solid #55736e;color:#f4f8f6;border-radius:7px;padding:8px 9px;font-size:12px;min-height:35px;touch-action:manipulation;}",
"#wr-debug-panel button:active{background:#326c68;}",
"#wr-debug-panel .wr-debug-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:9px;}",
"#wr-debug-panel .wr-debug-row{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:8px 0;}",
"#wr-debug-panel label{display:block;color:#d4dfda;font-weight:700;}",
"#wr-debug-panel label select{display:block;width:100%;margin-top:5px;}",
"#wr-debug-panel pre{margin:0;background:#071015;border:1px solid #263a40;border-radius:8px;padding:10px;font:11px/1.5 ui-monospace,monospace;white-space:pre-wrap;overflow-wrap:anywhere;min-height:85px;}",
"#wr-debug-panel small{display:block;color:#bccfca;line-height:1.5;}",
"#wr-debug-panel #wr-debug-message{min-height:1.4em;color:#a6e7cd;margin-top:9px;font-weight:700;}",
"#wr-debug-panel .wr-debug-wide{grid-column:1 / -1;}",
"@media(max-height:520px){#wr-debug-panel{max-height:90dvh;}}"
].join("");
document.head.appendChild(style);
const pill=document.createElement("button");
pill.type="button";pill.id="wr-debug-pill";pill.textContent="DEBUG";pill.hidden=true;
document.body.appendChild(pill);
const panel=document.createElement("section");
panel.id="wr-debug-panel";panel.setAttribute("role","region");panel.setAttribute("aria-label","デバッグモード");
panel.hidden=true;
panel.innerHTML=[
'<header><strong>DEBUG MODE</strong><button type="button" data-action="close" aria-label="閉じる">閉じる ×</button></header>',
'<small>タイトル7タップで切替。ゲームプレイ中に以下の動作を確認できます。</small>',
'<pre id="wr-debug-stats" aria-live="off">情報取得中</pre>',
'<div class="wr-debug-row">',
'<label>時刻<select id="wr-debug-hour"><option value="6">06時 朝</option><option value="9">09時</option><option value="12">12時 昼</option><option value="17">17時 夕</option><option value="18">18時 夕方</option><option value="21">21時 夜</option><option value="0">00時 夜</option></select></label>',
'<label>天気<select id="wr-debug-weather"><option value="auto">通常（自動）</option><option value="CLEAR">晴れ</option><option value="CLOUDY">曇り</option><option value="RAIN">雨</option><option value="THUNDER">雷雨</option><option value="WIND">強風</option><option value="FOG">霧</option></select></label>',
'<button type="button" data-action="hour">時刻を適用</button><button type="button" data-action="weather">天気を適用</button>',
'</div>',
'<div class="wr-debug-row">',
'<label class="wr-debug-wide">移動先<select id="wr-debug-location"><option value="home">巣周辺</option><option value="zoo">廃動物園</option><option value="forest">森林</option><option value="factory">工業区</option><option value="canal">運河沿い</option><option value="river">河川敷</option></select></label>',
'<button type="button" data-action="warp">指定地点へ移動</button><button type="button" data-action="heal">HP・空腹・持久回復</button>',
'</div>',
'<div class="wr-debug-grid">',
'<button type="button" data-action="shadows">雲影：ON</button><button type="button" data-action="save">現在状態を保存</button>',
'<button type="button" data-action="copy">診断情報をコピー</button><button type="button" data-action="disable">デバッグ解除</button>',
'</div>',
'<small>天気の強制変更は一時的です。時刻・移動・回復はセーブに反映されます。</small>',
'<div id="wr-debug-message" role="status" aria-live="polite"></div>'
].join("");
document.body.appendChild(panel);
const stats=panel.querySelector("#wr-debug-stats");
const message=panel.querySelector("#wr-debug-message");
let unlocked=false,count=0,frames=0,lastFpsTime=0,fps=0,rafStarted=false;
const bridge=()=>window.WildDebugBridge;
const shadow=()=>window.WildSeasonClouds;
function showPanel(value){
 if(!unlocked)return;
 panel.hidden=!value;
 if(value)renderStats();
}
function unlockToggle(){
 unlocked=!unlocked;
 count=0;
 pill.hidden=!unlocked;
 panel.hidden=!unlocked;
 if(!unlocked)bridge()?.setWeather(null);
 if(unlocked){startFps();renderStats();}
}
title.style.touchAction="manipulation";
title.style.userSelect="none";
title.setAttribute("aria-label","WILD RECLAIM タイトル。7回タップでデバッグ画面");
title.setAttribute("tabindex","0");
function registerTap(){
 if(menu.classList.contains("hidden"))return;
 count+=1;
 if(count>=7)unlockToggle();
}
title.addEventListener("click",registerTap);
title.addEventListener("keydown",event=>{
 if(event.key==="Enter"||event.key===" "){event.preventDefault();registerTap();}
});
pill.addEventListener("click",()=>showPanel(panel.hidden));
function startFps(){
 if(rafStarted)return;
 rafStarted=true;
 function tick(now){
  if(!unlocked){rafStarted=false;return;}
  frames++;
  if(!lastFpsTime)lastFpsTime=now;
  const dt=now-lastFpsTime;
  if(dt>=1000){fps=Math.round(frames*1000/dt);frames=0;lastFpsTime=now;}
  requestAnimationFrame(tick);
 }
 requestAnimationFrame(tick);
}
function renderStats(){
 if(!unlocked||panel.hidden)return;
 const b=bridge();
 const state=b?.getState()||null;
 let saved=null;
 try{saved=JSON.parse(localStorage.getItem("wild-reclaim-autosave-v2")||"null");}catch(_){}
 const is3d=!!window.Wild3D?.available;
 const rendering=is3d?"WebGL 3D":"Canvas2D";
 const display=state?[
  "FPS              "+fps,
  "描画             "+rendering,
  "状態             "+state.mode,
  "DAY / 時刻       "+state.day+" / "+String(state.hour).padStart(2,"0")+":00",
  "地域             "+(state.region||"開始前"),
  "座標             "+(state.position?Math.round(state.position.x)+", "+Math.round(state.position.y):"開始前"),
  "天候             "+state.weather+(state.weatherOverride?" （強制）":""),
  "動物 / 死骸      "+state.mobCount+" / "+state.carcassCount,
  "体力 / 巣Lv      "+(state.hp===null?"--":state.hp)+" / "+state.denLevel,
  "保存             "+(saved?"DAY "+saved.day+" (v"+saved.version+")":"なし")
 ].join("\n"):[
  "FPS              "+fps,
  "描画             "+rendering,
  "状態             タイトル画面",
  "保存             "+(saved?"DAY "+saved.day+" (v"+saved.version+")":"なし")
 ].join("\n");
 stats.textContent=display;
}
function say(text){message.textContent=text;renderStats();}
panel.addEventListener("click",async ev=>{
 const button=ev.target.closest("button[data-action]");
 if(!button||!panel.contains(button))return;
 const action=button.dataset.action;
 if(action==="close"){showPanel(false);return;}
 if(action==="disable"){unlockToggle();return;}
 if(action==="shadows"){
  const service=shadow();
  if(!service?.setShadowsEnabled){say("雲影の切替を利用できません");return;}
  const enabled=!service.shadowsEnabled;
  service.setShadowsEnabled(enabled);
  button.textContent="雲影："+(enabled?"ON":"OFF");
  say(enabled?"雲影を表示":"雲影を非表示");
  return;
 }
 if(action==="copy"){
  const payload=stats.textContent;
  try{
   await navigator.clipboard.writeText(payload);
   say("診断情報をコピーしました");
  }catch(_){say("コピーできませんでした");}
  return;
 }
 const api=bridge();
 if(!api){say("デバッグ連携を読み込めません");return;}
 let ok=false;
 if(action==="hour")ok=api.setHour(Number(panel.querySelector("#wr-debug-hour").value));
 if(action==="weather"){
  const value=panel.querySelector("#wr-debug-weather").value;
  ok=api.setWeather(value==="auto"?null:value);
 }
 if(action==="warp")ok=api.warp(panel.querySelector("#wr-debug-location").value);
 if(action==="heal")ok=api.heal();
 if(action==="save")ok=api.save();
 say(ok?"適用しました":"ゲームを開始してから操作してください");
});
setInterval(renderStats,650);
window.WildDebugMode={
 get unlocked(){return unlocked;},
 get open(){return unlocked&&!panel.hidden;},
 get taps(){return count;},
 toggle:unlockToggle
};
})();