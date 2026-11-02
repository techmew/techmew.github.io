/* WILD RECLAIM | Developer QA only. Unlock: seven title taps. */
(() => {
"use strict";
const menu=document.getElementById("menu"),title=menu?.querySelector(".hero-title");
if(!menu||!title)return;
const css=document.createElement("style");
css.id="wr-debug-style";
css.textContent=[
"#wr-debug-pill,#wr-debug-panel{font-family:system-ui,'Noto Sans JP',sans-serif;box-sizing:border-box;color:#f4f8f6;}",
"#wr-debug-pill[hidden],#wr-debug-panel[hidden]{display:none!important;}",
"#wr-debug-pill{position:fixed;left:50%;bottom:calc(8px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:4999;padding:9px 18px;border:1px solid #9de0c0;border-radius:22px;background:#152a2f;color:#fff;font-size:12px;font-weight:800;box-shadow:0 4px 18px #000a;touch-action:manipulation;}",
"#wr-debug-panel{position:fixed;z-index:5000;top:calc(6px + env(safe-area-inset-top));right:max(6px,env(safe-area-inset-right));width:min(420px,calc(100vw - 12px));max-height:calc(100dvh - 12px - env(safe-area-inset-top) - env(safe-area-inset-bottom));overflow-y:auto;overscroll-behavior:contain;background:#111e22f8;border:1px solid #61776e;border-radius:14px;padding:13px;box-shadow:0 10px 40px #000c;}",
"#wr-debug-panel *,#wr-debug-panel *:before,#wr-debug-panel *:after{box-sizing:border-box;}",
"#wr-debug-panel header{display:flex;align-items:center;justify-content:space-between;gap:10px;position:sticky;top:-13px;z-index:2;padding:7px 0 10px;background:#111e22;}",
"#wr-debug-panel header strong{font-size:17px;}",
"#wr-debug-panel button,#wr-debug-panel select{width:100%;min-height:44px;padding:9px 10px;color:#fff;background:#293d41;border:1px solid #6a847c;border-radius:8px;font-size:13px;font-weight:700;touch-action:manipulation;}",
"#wr-debug-panel button:disabled{opacity:.37;}",
"#wr-debug-panel button:focus-visible,#wr-debug-panel select:focus-visible,#wr-debug-panel summary:focus-visible{outline:3px solid #a8d6ff;outline-offset:2px;}",
"#wr-debug-panel .wr-primary{background:#235951;border-color:#a1d9ba;}",
"#wr-debug-panel .wr-danger{background:#563d40;border-color:#b79a9a;}",
"#wr-debug-panel .wr-close{width:auto;min-width:75px;}",
"#wr-debug-panel .wr-mini{font-size:12px;color:#cedcd5;line-height:1.55;margin:5px 0 9px;}",
"#wr-debug-panel .wr-state{background:#1c3032;border-radius:9px;padding:9px 10px;font-size:12px;line-height:1.6;}",
"#wr-debug-panel #wr-debug-message{margin:8px 0;color:#b1efce;font-size:12px;font-weight:700;min-height:1.3em;}",
"#wr-debug-panel details.wr-section{border:1px solid #536b65;border-radius:10px;background:#1b2c2f;margin:10px 0;overflow:hidden;}",
"#wr-debug-panel details.wr-section summary{display:block;list-style:none;padding:14px 11px;cursor:pointer;font-weight:800;font-size:15px;}",
"#wr-debug-panel details.wr-section summary::-webkit-details-marker{display:none;}",
"#wr-debug-panel details.wr-section summary:after{content:'開く ＋';float:right;color:#b5cfc3;font-size:11px;}",
"#wr-debug-panel details.wr-section[open] summary:after{content:'閉じる −';}",
"#wr-debug-panel .wr-inside{padding:0 11px 13px;}",
"#wr-debug-panel .wr-row{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:8px 0;}",
"#wr-debug-panel label{display:block;font-size:12px;font-weight:700;color:#e0e8e3;margin:8px 0;}",
"#wr-debug-panel label select{display:block;margin-top:5px;}",
"#wr-debug-panel .wr-note{display:block;font-size:12px;line-height:1.55;color:#c0d7cd;margin:6px 0;}",
"#wr-debug-panel pre{background:#091416;padding:11px;border-radius:8px;white-space:pre-wrap;overflow-wrap:anywhere;font:11px/1.5 ui-monospace,monospace;}",
"#wr-debug-panel .wr-stage{padding:8px;border-left:3px solid #9bd7c0;background:#243a38;margin:8px 0;font-size:13px;}",
"@media(max-height:430px){#wr-debug-panel{max-height:calc(100dvh - 8px);}}"
].join("");
document.head.appendChild(css);
const pill=document.createElement("button");
pill.id="wr-debug-pill";pill.type="button";pill.hidden=true;pill.textContent="デバッグ";document.body.appendChild(pill);
const panel=document.createElement("section");
panel.id="wr-debug-panel";panel.setAttribute("aria-label","デバッグ操作");panel.hidden=true;
panel.innerHTML=[
'<header><strong>デバッグ操作</strong><button class="wr-close" type="button" data-action="close">閉じる ×</button></header>',
'<div class="wr-state" id="wr-debug-summary">ゲーム開始前</div>',
'<div id="wr-debug-message" role="status" aria-live="polite"></div>',
'<details class="wr-section" open><summary>1. チュートリアル通しテスト</summary><div class="wr-inside">',
'<p class="wr-mini">最初の食事から「生き残れ！」まで実際に遊んで検証。前・次で段階を飛ばせます。終了時は元のセーブに戻ります。</p>',
'<button type="button" data-action="tutorial-start" class="wr-primary">最初から通しテストを開始</button>',
'<div class="wr-stage" id="wr-debug-tutorial-status">通しテストは開始していません</div>',
'<div class="wr-row"><button type="button" data-action="tutorial-prev">前の段階へ</button><button type="button" data-action="tutorial-next">次の段階へ</button></div>',
'<label>段階を指定する<select id="wr-debug-stage"><option value="0">1/7 食事</option><option value="1">2/7 潜伏</option><option value="2">3/7 狩猟</option><option value="4">4/7 巣の備蓄・強化</option><option value="5">5/7 縄張り</option><option value="6">6/7 探索地点</option><option value="7">7/7 終了「生き残れ！」</option></select></label>',
'<button type="button" data-action="tutorial-stage">指定の段階へ移動</button>',
'<button type="button" data-action="tutorial-stop" class="wr-danger">テストを終了し、元に戻す</button>',
'</div></details>',
'<details class="wr-section"><summary>2. 強敵20種類を試す</summary><div class="wr-inside">',
'<p class="wr-mini">名前を選び、地域へ移動して1体出現させます。強敵は同時に1体まで。</p>',
'<label>強敵の種類<select id="wr-debug-boss"></select></label>',
'<p class="wr-note" id="wr-debug-boss-info">強敵を読み込み中</p>',
'<p class="wr-stage" id="wr-debug-boss-status">現在の強敵：なし</p>',
'<button type="button" data-action="boss-area">出現地域へ移動</button>',
'<div class="wr-row"><button type="button" data-action="boss" class="wr-primary">この強敵を出す</button><button type="button" data-action="boss-clear" class="wr-danger">今いる強敵を消す</button></div>',
'<div class="wr-row"><button type="button" data-action="boss-weaken">強敵HPを1にする</button><button type="button" data-action="boss-trophy">選択素材を＋1</button></div>',
'<p class="wr-note">HP1は実際の戦闘を試す用、素材＋1は能力継承を試す用です。どちらもデバッグ専用。</p>',
'</div></details>',
'<details class="wr-section"><summary>3. HP・空腹・巣を試す</summary><div class="wr-inside">',
'<button type="button" data-action="heal" class="wr-primary">HP・空腹・持久を全回復</button>',
'<div class="wr-row"><label>HP<select id="wr-debug-hp"><option value="50">HP 50</option><option value="20">HP 20</option><option value="1">HP 1</option><option value="0">HP 0（死亡演出）</option></select></label>',
'<label>空腹<select id="wr-debug-hunger"><option value="100">100% 満腹</option><option value="15">15% 空腹</option><option value="0">0% 飢餓</option></select></label></div>',
'<div class="wr-row"><button type="button" data-action="hp">HPを適用</button><button type="button" data-action="hunger">空腹を適用</button></div>',
'<label>移動する巣<select id="wr-debug-den"></select></label>',
'<button type="button" data-action="den-warp">選んだ巣へ移動</button>',
'<div class="wr-row"><label>巣レベル<select id="wr-debug-denlevel"><option value="1">LV1</option><option value="2">LV2</option><option value="3">LV3</option></select></label><label>備蓄量<select id="wr-debug-food"><option value="0">0pt</option><option value="30">30pt</option><option value="60">60pt</option><option value="120">120pt</option></select></label></div>',
'<div class="wr-row"><button type="button" data-action="den-level">巣レベル適用</button><button type="button" data-action="den-food">備蓄を適用</button></div>',
'</div></details>',
'<details class="wr-section"><summary>4. 時刻・天候・場所を試す</summary><div class="wr-inside">',
'<div class="wr-row"><label>時刻<select id="wr-debug-hour"><option value="6">06時 朝</option><option value="12">12時 昼</option><option value="17">17時 夕方</option><option value="21">21時 夜</option><option value="0">00時 深夜</option></select></label>',
'<label>天気<select id="wr-debug-weather"><option value="auto">通常（自動）</option><option value="CLEAR">晴れ</option><option value="CLOUDY">曇り</option><option value="RAIN">雨</option><option value="THUNDER">雷雨</option><option value="WIND">強風</option><option value="FOG">霧</option></select></label></div>',
'<div class="wr-row"><button type="button" data-action="hour">時刻を適用</button><button type="button" data-action="weather">天気を適用</button></div>',
'<label>移動先<select id="wr-debug-location"><option value="home">巣周辺</option><option value="zoo">廃動物園</option><option value="forest">森林</option><option value="factory">工業区</option><option value="canal">運河沿い</option><option value="river">河川敷</option></select></label>',
'<button type="button" data-action="warp">選んだ場所へ移動</button>',
'<button type="button" data-action="shadows">雲影を切り替える</button>',
'</div></details>',
'<details class="wr-section"><summary>5. 状態・保存・診断</summary><div class="wr-inside">',
'<pre id="wr-debug-stats" aria-live="off">診断を取得中</pre>',
'<div class="wr-row"><button type="button" data-action="save">現在状態を保存</button><button type="button" data-action="copy">診断内容をコピー</button></div>',
'<button type="button" data-action="disable" class="wr-danger">デバッグモードを解除</button>',
'<p class="wr-mini">通しテスト中の変更は通常の自動保存・チェックポイントに書き込みません。</p>',
'</div></details>'
].join("");
document.body.appendChild(panel);
const $=id=>panel.querySelector("#"+id),bridge=()=>window.WildDebugBridge;
const stages=[0,1,2,4,5,6,7],stageNames=["食事","潜伏","狩猟","巣の備蓄・強化","縄張り","探索地点","終了「生き残れ！」"];
let unlocked=false,taps=0,frames=0,fps=0,lastFrame=0,rafStarted=false;
function fillOptions(){
 const bosses=bridge()?.listBosses?.()||[],bossSelect=$("wr-debug-boss");
 if(bosses.length&&bossSelect.options.length!==bosses.length){
  const selected=bossSelect.value;bossSelect.replaceChildren();
  for(const b of bosses){const opt=document.createElement("option");opt.value=b.id;opt.textContent=b.name;bossSelect.appendChild(opt);}
  if(bosses.some(b=>b.id===selected))bossSelect.value=selected;
 }
 const dens=bridge()?.listDens?.()||[],denSelect=$("wr-debug-den");
 if(dens.length&&denSelect.options.length!==dens.length){
  const selected=denSelect.value;denSelect.replaceChildren();
  for(const d of dens){const opt=document.createElement("option");opt.value=d.id;opt.textContent=d.name+(d.roof?"（屋上）":"");denSelect.appendChild(opt);}
  if(dens.some(d=>d.id===selected))denSelect.value=selected;
 }
 updateBossInfo();
}
function updateBossInfo(){
 const b=bridge()?.listBosses?.().find(x=>x.id===$("wr-debug-boss").value);
 $("wr-debug-boss-info").textContent=b?"獲得能力："+b.effect+" ／ 出現地域："+b.regions.join("・"):"ゲームを読み込むと20種類から選べます";
}
$("wr-debug-boss").addEventListener("change",updateBossInfo);
function render(){
 if(!unlocked||panel.hidden)return;
 fillOptions();
 const b=bridge(),state=b?.getState?.(),inTest=!!state?.debugTutorialActive;
 const m=stages.indexOf(state?.mission),boss=b?.bossState?.();
 $("wr-debug-summary").textContent=state?(state.mode==="menu"?"タイトル画面":state.animal+"｜"+state.region+"｜DAY "+state.day+"｜HP "+state.hp+" / 空腹 "+state.hunger+"%"):"ゲーム起動待ち";
 $("wr-debug-tutorial-status").textContent=inTest?"通しテスト中："+(m>=0?(m+1)+"/7 "+stageNames[m]:"段階確認中"):"通常プレイ中（通しテスト未開始）";
 $("wr-debug-boss-status").textContent="現在の強敵："+(boss?boss.name+"（HP "+boss.hp+"）":"なし");
 if(inTest&&m>=0)$("wr-debug-stage").value=String(stages[m]);
 for(const action of ["tutorial-prev","tutorial-next","tutorial-stage","tutorial-stop"]){
  const item=panel.querySelector('[data-action="'+action+'"]');
  item.disabled=!inTest||(action==="tutorial-prev"&&m<=0)||(action==="tutorial-next"&&m>=stages.length-1);
 }
 panel.querySelector('[data-action="tutorial-start"]').disabled=inTest;
 const saveText=(()=>{try{const s=JSON.parse(localStorage.getItem("wild-reclaim-autosave-v2")||"null");return s?"DAY "+s.day+" v"+s.version:"なし";}catch(_){return "読み取り不可";}})();
 $("wr-debug-stats").textContent=[
  "FPS（画面更新）: "+fps,"描画: "+(window.Wild3D?.available?"WebGL":"Canvas2D"),
  "状態: "+(state?.mode||"不明"),"場所: "+(state?.region||"開始前"),
  "日時: "+(state?.day||0)+"日 "+String(state?.hour||0).padStart(2,"0")+":00",
  "天気: "+(state?.weather||"-"),"敵/死骸: "+(state?.mobCount||0)+" / "+(state?.carcassCount||0),
  "巣LV/備蓄: "+(state?.denLevel||0)+" / "+(state?.denStash||0),
  "チュートリアル: "+(inTest?"通しテスト中":"通常"),
  "保存: "+saveText
 ].join("\n");
}
function say(message){$("wr-debug-message").textContent=message;render();}
function setOpen(value){if(!unlocked)return;panel.hidden=!value;if(value)render();}
function runFps(){
 if(rafStarted)return;rafStarted=true;frames=0;lastFrame=0;
 function tick(now){
  if(!unlocked){rafStarted=false;return;}
  frames++;if(!lastFrame)lastFrame=now;
  if(now-lastFrame>=1000){fps=Math.round(frames*1000/(now-lastFrame));frames=0;lastFrame=now;}
  requestAnimationFrame(tick);
 }
 requestAnimationFrame(tick);
}
function toggle(){
 if(unlocked&&bridge()?.getState?.()?.debugTutorialActive)bridge()?.tutorialStop?.();
 unlocked=!unlocked;taps=0;pill.hidden=!unlocked;panel.hidden=!unlocked;
 if(!unlocked)bridge()?.setWeather?.(null);
 if(unlocked){runFps();render();}
}
title.style.touchAction="manipulation";title.style.userSelect="none";
title.setAttribute("tabindex","0");
title.setAttribute("aria-label","タイトル。7回タップでデバッグモードを切り替え");
function tap(){if(menu.classList.contains("hidden"))return;taps++;if(taps>=7)toggle();}
title.addEventListener("click",tap);
title.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();tap();}});
pill.addEventListener("click",()=>setOpen(panel.hidden));
panel.addEventListener("click",async event=>{
 const btn=event.target.closest("button[data-action]");if(!btn||!panel.contains(btn))return;
 const action=btn.dataset.action,api=bridge();
 if(action==="close"){setOpen(false);return;}
 if(action==="disable"){toggle();return;}
 if(action==="copy"){
  try{await navigator.clipboard.writeText($("wr-debug-stats").textContent);say("診断をコピーしました");}catch(_){say("コピーできませんでした");}return;
 }
 if(action==="shadows"){
  const svc=window.WildSeasonClouds;
  if(!svc?.setShadowsEnabled){say("雲影の切り替えは使用できません");return;}
  const on=!svc.shadowsEnabled;svc.setShadowsEnabled(on);say(on?"雲影：表示":"雲影：非表示");return;
 }
 if(!api){say("ゲーム操作との接続がありません");return;}
 let ok=false,quiet=false;
 try{
  if(action==="tutorial-start")ok=api.tutorialStart();
  else if(action==="tutorial-stop")ok=api.tutorialStop();
  else if(action==="tutorial-prev")ok=api.tutorialStep(-1);
  else if(action==="tutorial-next")ok=api.tutorialStep(1);
  else if(action==="tutorial-stage")ok=api.tutorialStage(Number($("wr-debug-stage").value));
  else if(action==="boss")ok=api.spawnBoss($("wr-debug-boss").value);
  else if(action==="boss-clear")ok=api.clearBoss();
  else if(action==="boss-weaken")ok=api.weakenBoss();
  else if(action==="boss-trophy")ok=api.giveTrophy($("wr-debug-boss").value);
  else if(action==="boss-area")ok=api.warpBossArea($("wr-debug-boss").value);
  else if(action==="den-warp")ok=api.warpDen($("wr-debug-den").value);
  else if(action==="hp")ok=api.setHp(Number($("wr-debug-hp").value));
  else if(action==="hunger")ok=api.setHunger(Number($("wr-debug-hunger").value));
  else if(action==="den-level")ok=api.setDenLevel(Number($("wr-debug-denlevel").value));
  else if(action==="den-food")ok=api.setDenFood(Number($("wr-debug-food").value));
  else if(action==="heal")ok=api.heal();
  else if(action==="hour")ok=api.setHour(Number($("wr-debug-hour").value));
  else if(action==="weather")ok=api.setWeather($("wr-debug-weather").value==="auto"?null:$("wr-debug-weather").value);
  else if(action==="warp")ok=api.warp($("wr-debug-location").value);
  else if(action==="save")ok=api.save();
 }catch(_){ok=false;}
 const messages={
  "tutorial-start":"チュートリアル通しテストを開始","tutorial-stop":"元のゲーム・保存内容に戻しました",
  "tutorial-prev":"前の段階へ移動","tutorial-next":"次の段階へ移動","tutorial-stage":"指定段階に移動",
  "boss":"強敵を出現させました","boss-clear":"強敵を消しました（報酬なし）","boss-weaken":"強敵のHPを1に変更","boss-trophy":"希少素材を1個追加","boss-area":"強敵の出現地域に移動",
  "hp":"HPを適用","hunger":"空腹を適用","den-warp":"選んだ巣に移動",
  "den-level":"巣レベルを適用","den-food":"備蓄を適用","heal":"全回復",
  "hour":"時刻を変更","weather":"天気を変更","warp":"移動しました","save":"現在状態を保存"
 };
 say(ok?messages[action]||"適用しました":"適用できません。ゲーム開始・現在の状態・場所や強敵の有無を確認してください");
 if(ok&&["tutorial-start","tutorial-prev","tutorial-next","tutorial-stage","boss","boss-area","den-warp","hp"].includes(action))setOpen(false);
});
setInterval(render,700);
window.WildDebugMode={get unlocked(){return unlocked;},get open(){return unlocked&&!panel.hidden;},get taps(){return taps;},toggle};
})();