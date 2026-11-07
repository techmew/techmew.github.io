/* WILD RECLAIM | Developer QA only. Unlock: seven title taps. */
(() => {
"use strict";
const menu=document.getElementById("menu"),title=menu?.querySelector(".hero-title");
if(!menu||!title)return;
const css=document.createElement("style");
css.id="wr-debug-style";
css.textContent=[
"#wr-debug-pill,#wr-debug-panel{font-family:system-ui,'Noto Sans JP',sans-serif;box-sizing:border-box;color:#f4f8f6;}",
"#wr-debug-panel{border:3px solid #7dffba!important;}",
"#wr-debug-panel header{border-bottom:2px solid #6fdca5;}",
"#wr-debug-panel .wr-mode-banner{background:#104b36;border:2px solid #adffd3;color:white;text-align:center;font-size:14px;}",
"#wr-debug-panel .wr-launch{background:#12362d;border-color:#7ce7ae;}",
"#wr-debug-panel .wr-mode-actions{padding:6px 0;}",
"#wr-debug-panel .wr-choice{display:block;text-align:center;border-width:2px;}",
"#wr-debug-panel .wr-choice[role=switch][aria-checked=true]{background:#16874c;border-color:#b6ffd0;color:#fff;}",
"#wr-debug-panel .wr-choice[role=switch][aria-checked=false]{background:#42474b;border-color:#929a9e;color:#fff;}",
"#wr-debug-pill[hidden],#wr-debug-panel[hidden]{display:none!important;}",
"#wr-debug-pill{position:fixed;left:50%;bottom:calc(8px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:4999;padding:9px 18px;border:1px solid #9de0c0;border-radius:22px;background:#152a2f;color:#fff;font-size:12px;font-weight:800;box-shadow:0 4px 18px #000a;touch-action:manipulation;}",
"#wr-debug-panel{position:fixed;z-index:5000;top:calc(6px + env(safe-area-inset-top));right:max(6px,env(safe-area-inset-right));width:min(420px,calc(100vw - 12px));max-height:calc(100dvh - 12px - env(safe-area-inset-top) - env(safe-area-inset-bottom));overflow-y:auto;overscroll-behavior:contain;background:#111e22f8;border:1px solid #61776e;border-radius:14px;padding:13px;box-shadow:0 10px 40px #000c;}",
"#wr-debug-panel *,#wr-debug-panel *:before,#wr-debug-panel *:after{box-sizing:border-box;}",
"#wr-debug-panel header{display:flex;align-items:center;justify-content:space-between;gap:10px;position:sticky;top:-13px;z-index:2;padding:7px 0 10px;background:#111e22;}",
"#wr-debug-panel header strong{font-size:17px;}",
"#wr-debug-panel input[type=number]{width:100%;min-height:42px;padding:7px 9px;border:1px solid #6a847c;border-radius:8px;background:#293d41;color:#fff;font-size:14px;}",
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
"#wr-debug-panel .wr-launch{padding:12px;margin:10px 0;border:2px solid #7ce7ae;border-radius:11px;background:#12362d;}",
"#wr-debug-panel .wr-launch strong{display:block;font-size:15px;margin-bottom:5px;}",
"#wr-debug-panel .wr-launch button{font-size:15px;min-height:52px;margin-top:9px;background:#126c54;border:2px solid #beffdb;}",
"#wr-debug-panel .wr-choice{margin:5px 0 3px;padding:6px;border-radius:7px;background:#354346;border:1px solid #688079;color:#e2ebe4;font-size:12px;min-height:34px;}",
"#wr-debug-panel .wr-choice[aria-pressed=true]{background:#15583e;border:2px solid #bcffcf;color:#fff;}",
"#wr-debug-panel .wr-chosen{outline:2px solid #aafac7;outline-offset:1px;border-radius:5px;}",
"#wr-debug-panel .wr-selection{font-size:12px;line-height:1.5;min-height:25px;white-space:pre-wrap;color:#caffdb;}",
"#wr-debug-panel .wr-mode-banner{background:#104b36;border:2px solid #adffd3;color:#fff;text-align:center;padding:9px;border-radius:8px;font-size:14px;font-weight:800;margin:8px 0;}",
"@media(max-height:430px){#wr-debug-panel{max-height:calc(100dvh - 8px);}}"
].join("");
document.head.appendChild(css);
const pill=document.createElement("button");
pill.id="wr-debug-pill";pill.type="button";pill.hidden=true;pill.textContent="デバッグ ON｜設定";document.body.appendChild(pill);
const panel=document.createElement("section");
panel.id="wr-debug-panel";panel.setAttribute("aria-label","デバッグ操作");panel.hidden=true;
panel.innerHTML=[
'<header><strong>デバッグモード｜ON</strong><button class="wr-close" type="button" data-action="close">設定を閉じる ×</button></header>',
'<div class="wr-mode-actions"><button type="button" class="wr-danger" data-action="disable">デバッグOFF・通常プレイへ戻る</button></div>',
'<div class="wr-state" id="wr-debug-summary">ゲーム開始前</div>',
'<div id="wr-debug-mode-banner" class="wr-mode-banner">デバッグ ON｜通常プレイのセーブとは分離中</div>',
'<section class="wr-launch" aria-label="デバッグ設定">',
'<strong>テスト設定（各項目をON / OFF）</strong>',
'<p class="wr-mini">各項目のONで開始時に適用、OFFで適用しません。ONは緑色で表示されます。</p>',
'<div id="wr-debug-selection" class="wr-selection" role="status">開始時に適用する設定：なし</div>',
'<p class="wr-mini">設定を閉じ、タイトル画面の「デバッグモードで開始」を押してプレイします。現在の通常セーブを複製したテストデータだけが変更されます。</p>',
'</section>',
'<div id="wr-debug-message" role="status" aria-live="polite"></div>',
'<details class="wr-section" open><summary>1. チュートリアル通しテスト</summary><div class="wr-inside">',
'<p class="wr-mini">最初の食事から「生き残れ！」まで実際に遊んで検証。前・次で段階を飛ばせます。終了時は元のセーブに戻ります。</p>',
'<button type="button" data-action="tutorial-start" class="wr-primary">最初から通しテストを開始</button>',
'<div class="wr-stage" id="wr-debug-tutorial-status">通しテストは開始していません</div>',
'<div class="wr-row"><button type="button" data-action="tutorial-prev">前の段階へ</button><button type="button" data-action="tutorial-next">次の段階へ</button></div>',
'<label>段階を指定する<select id="wr-debug-stage"><option value="0">1/5 食事</option><option value="1">2/5 茂みで潜伏</option><option value="2">3/5 狩猟</option><option value="4">4/5 巣に1回備蓄</option><option value="7">5/5 チュートリアル終了</option></select></label>',
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
'<details class="wr-section"><summary>5. 全イベント・状態の強制テスト</summary><div class="wr-inside">',
'<p class="wr-mini">実装済みの天候・地震・落雷・洪水・火災・UFO・亡霊・動物AI・負傷・年代・地形を操作。未実装機能は選択不可と表示します。</p>',
'<label>検証するイベント・状態<select id="wr-debug-case"></select></label>',
'<p class="wr-note" id="wr-debug-case-status">機能を読み込み中</p>',
'<button type="button" data-action="case" class="wr-primary">選択したイベント・状態を実行</button>',
'<div class="wr-row"><button type="button" data-action="qa-backup">QAバックアップを作成</button><button type="button" data-action="qa-restore" class="wr-danger">元の保存状態へ復元</button></div>',
'<p class="wr-note" id="wr-debug-backup-status">初回テスト前に自動で保存内容を控えます。復元は画面を再読み込みします。</p>',
'<label>表示方式<select id="wr-debug-renderer"><option value="auto">3D（可能なら）</option><option value="2d">2D強制表示</option></select></label>',
'<button type="button" data-action="renderer">描画方式を切り替える</button>',
'<details><summary>任意の年代・LV・座標を指定</summary>',
'<div class="wr-row"><label>世界年（現在以降）<input id="wr-debug-year" type="number" min="0" max="1000" value="50" inputmode="numeric"></label><label>LV<input id="wr-debug-level" type="number" min="1" max="1000" value="10" inputmode="numeric"></label></div>',
'<div class="wr-row"><button type="button" data-action="custom-year">指定の世界年へ</button><button type="button" data-action="custom-level">指定LVへ</button></div>',
'<div class="wr-row"><label>世界X座標<input id="wr-debug-x" type="number" min="20" max="13600" value="9000" inputmode="numeric"></label><label>世界Y座標<input id="wr-debug-y" type="number" min="20" max="6000" value="3800" inputmode="numeric"></label></div>',
'<button type="button" data-action="custom-position">指定座標へ移動（安全な近傍を探索）</button>',
'</details>',
'<p class="wr-mini">QAバックアップにはゲームの保存・災害・怪異の保存状態を含めます。デバッグ中の操作は隔離されたテストセーブにのみ書き込みます。</p>',
'</div></details>',
'<details class="wr-section"><summary>6. 状態・保存・診断</summary><div class="wr-inside">',
'<pre id="wr-debug-stats" aria-live="off">診断を取得中</pre>',
'<details><summary>詳しい状態・イベント履歴・検査対象</summary><pre id="wr-debug-qa-report">診断を取得中</pre></details>',
'<pre id="wr-debug-errors">JavaScript例外：記録なし</pre>',
'<div class="wr-row"><button type="button" data-action="save">現在状態を保存</button><button type="button" data-action="copy">診断内容をコピー</button></div>',
'<button type="button" data-action="disable" class="wr-danger">デバッグモードを解除</button>',
'<p class="wr-mini">デバッグ専用セーブは通常プレイと完全に分離します。</p>',
'</div></details>'
].join("");
document.body.appendChild(panel);
const $=id=>panel.querySelector("#"+id),bridge=()=>window.WildDebugBridge;
const qaBackupKey="wild-reclaim-qa-session-backup-v1",recentErrors=[];
let pendingInitialSettings=false;
function onGameLaunch(){if(sandbox())pendingInitialSettings=true;}
function applyWhenReady(){
 if(!pendingInitialSettings||!sandbox()||bridge()?.getState?.()?.mode!=="play")return;
 pendingInitialSettings=false;
 const result=applySelectedSettings();
 $("wr-debug-message").textContent=result.message;
 if(result.failures){setOpen(true);}
}
const sandbox=()=>window.WildDebugSandbox?.active===true;
const launchKey="wr-debug-launch-v2";
const options=[
 ["year","wr-debug-year","世界年"],["level","wr-debug-level","レベル"],
 ["hour","wr-debug-hour","時刻"],["weather","wr-debug-weather","天候"],
 ["location","wr-debug-location","場所"],["hp","wr-debug-hp","HP"],
 ["hunger","wr-debug-hunger","空腹"],["den","wr-debug-den","巣"],
 ["denLevel","wr-debug-denlevel","巣LV"],["food","wr-debug-food","備蓄"],
 ["boss","wr-debug-boss","強敵"],["case","wr-debug-case","イベント"],
 ["renderer","wr-debug-renderer","描画方式"],["position","wr-debug-x","座標"]
];
const enabled=new Set();
function updateSelected(){
 const selected=[];
 for(const [key,id,name] of options){
  const input=$(id),toggle=panel.querySelector('[data-qa-choice="'+key+'"]'),active=enabled.has(key);
  if(toggle){toggle.setAttribute("aria-checked",String(active));toggle.textContent=active?"ON｜開始時に適用する":"OFF｜開始時に適用しない";}
  input?.closest("label")?.classList.toggle("wr-chosen",active);
  if(active){
   const value=key==="position"?"X"+$("wr-debug-x").value+" Y"+$("wr-debug-y").value:
    input?.tagName==="SELECT"?(input.selectedOptions?.[0]?.textContent||input.value):input?.value;
   selected.push(name+"："+value);
  }
 }
 $("wr-debug-selection").textContent=selected.length?"開始時の設定（"+selected.length+"件）\n"+selected.join(" / "):"開始時に適用する設定：なし";
}
function installChoices(){
 for(const [key,id,name] of options){
  const field=$(id),label=field?.closest("label");if(!label)continue;
  const toggle=document.createElement("button");toggle.type="button";toggle.className="wr-choice";toggle.setAttribute("role","switch");toggle.setAttribute("aria-checked","false");
  toggle.dataset.qaChoice=key;toggle.setAttribute("aria-label",name+"を開始時に適用するか切り替え");
  toggle.addEventListener("click",e=>{
   e.preventDefault();e.stopPropagation();
   if(enabled.has(key))enabled.delete(key);else enabled.add(key);
   updateSelected();saveSelected();
  });
  label.appendChild(toggle);
  field.addEventListener("change",()=>{enabled.add(key);updateSelected();saveSelected();});
  if(field.tagName==="INPUT")field.addEventListener("input",()=>{enabled.add(key);updateSelected();saveSelected();});
 }
 $("wr-debug-y").addEventListener("input",()=>{enabled.add("position");updateSelected();saveSelected();});
 updateSelected();
}
function collectLaunch(){
 const values={};for(const [,id] of options)values[id]=$(id)?.value;
 values["wr-debug-y"]=$("wr-debug-y").value;
 return {enabled:[...enabled],values};
}
function saveSelected(){
 if(!sandbox())return;
 try{sessionStorage.setItem(launchKey,JSON.stringify(collectLaunch()));}
 catch(error){trackError("デバッグ設定を記録できません: "+error.message);}
}
function restoreLaunch(config){
 if(!config||!Array.isArray(config.enabled)||!config.values)return;
 fillOptions();enabled.clear();
 for(const key of config.enabled)if(options.some(([id])=>id===key))enabled.add(key);
 for(const [id,value] of Object.entries(config.values)){
  const field=$(id);if(!field)continue;
  if(field.tagName==="INPUT"||field.tagName==="SELECT"&&[...field.options].some(o=>o.value===String(value)))field.value=String(value);
 }
 updateSelected();
}
function applySelectedSettings(){
 const api=bridge();
 if(!sandbox()||!api||api.getState?.()?.mode!=="play")return {ok:false,message:"デバッグゲーム起動後に設定を反映します",failures:1};
 const results=[],steps=[
  ["year",()=>api.runCase("year:"+$("wr-debug-year").value)],
  ["level",()=>api.runCase("player:level"+$("wr-debug-level").value)],
  ["hour",()=>api.setHour(Number($("wr-debug-hour").value))],
  ["weather",()=>api.setWeather($("wr-debug-weather").value==="auto"?null:$("wr-debug-weather").value)],
  ["location",()=>api.warp($("wr-debug-location").value)],
  ["den",()=>api.warpDen($("wr-debug-den").value)],
  ["denLevel",()=>api.setDenLevel(Number($("wr-debug-denlevel").value))],
  ["food",()=>api.setDenFood(Number($("wr-debug-food").value))],
  ["renderer",()=>api.setRenderer($("wr-debug-renderer").value)],
  ["position",()=>api.teleportTo(Number($("wr-debug-x").value),Number($("wr-debug-y").value))],
  ["boss",()=>api.spawnBoss($("wr-debug-boss").value)],
  ["case",()=>api.runCase($("wr-debug-case").value)],
  ["hunger",()=>api.setHunger(Number($("wr-debug-hunger").value))],
  ["hp",()=>api.setHp(Number($("wr-debug-hp").value))]
 ];
 let failures=0;
 for(const [key,fn] of steps)if(enabled.has(key)){
  try{
   const result=fn(),ok=result===true||result?.ok===true;
   if(!ok)failures++;
   results.push((ok?"✓ ":"× ")+options.find(o=>o[0]===key)[2]+(result?.message?"："+result.message:""));
  }catch(error){failures++;trackError(error.message);results.push("× "+key+"："+error.message);}
 }
 return {ok:true,message:results.length?results.join(" / "):"デバッグ開始：設定変更なし",failures};
}
installChoices();
function trackError(message){
 recentErrors.push({time:new Date().toISOString(),message:String(message).slice(0,360)});
 if(recentErrors.length>12)recentErrors.shift();
}
window.addEventListener("error",event=>trackError(event.message||event.error?.message||"不明な例外"));
window.addEventListener("unhandledrejection",event=>trackError(event.reason?.message||event.reason||"未処理のPromiseエラー"));
function qaCapture(force=false){
 try{
  const previous=!force?JSON.parse(sessionStorage.getItem(qaBackupKey)||"null"):null;
  const currentMode=bridge()?.getState?.()?.mode||"menu";
  // Unlocking on the title can precede a new run. Capture the *actual* run
  // before its first QA mutation rather than restoring an obsolete menu save.
  if(previous&&!(previous.mode==="menu"&&currentMode==="play"))return true;
  bridge()?.save?.();
  const entries={};
  for(let i=0;i<localStorage.length;i++){
   const k=localStorage.key(i);
   if(k&&(k.startsWith("wild-reclaim-")||k.startsWith("wild_reclaim_")))entries[k]=localStorage.getItem(k);
  }
  sessionStorage.setItem(qaBackupKey,JSON.stringify({createdAt:Date.now(),mode:currentMode,entries}));
  return true;
 }catch(error){trackError("QAバックアップ: "+error.message);return false}
}
function qaRestore(){
 try{
  const saved=JSON.parse(sessionStorage.getItem(qaBackupKey)||"null");
  if(!saved||!saved.entries)return false;
  const keys=[];
  for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&(k.startsWith("wild-reclaim-")||k.startsWith("wild_reclaim_")))keys.push(k)}
  for(const key of keys)localStorage.removeItem(key);
  for(const [key,value] of Object.entries(saved.entries))localStorage.setItem(key,value);
  sessionStorage.removeItem(qaBackupKey);
  location.reload();return true;
 }catch(error){trackError("QA復元: "+error.message);return false}
}
function fillCases(){
 const select=$("wr-debug-case");if(select.options.length)return;
 const cases=bridge()?.listCases?.()||[],groups=new Map();
 for(const item of cases){
  if(!groups.has(item.group))groups.set(item.group,[]);
  groups.get(item.group).push(item);
 }
 for(const [group,entries] of groups){
  const optgroup=document.createElement("optgroup");optgroup.label=group;
  for(const item of entries){
   const option=document.createElement("option");option.value=item.id;option.textContent=(item.available?"":"未実装：")+item.label;
   option.disabled=!item.available;optgroup.appendChild(option);
  }
  select.appendChild(optgroup);
 }
 select.value=cases.find(item=>item.available)?.id||"";
}
function updateCaseStatus(){
 const cases=bridge()?.listCases?.()||[],selected=$("wr-debug-case").value;
 const entry=cases.find(x=>x.id===selected),available=cases.filter(x=>x.available).length;
 $("wr-debug-case-status").textContent=entry?(entry.available?"実装済み：":"未実装：")+entry.label+" ／ 実行可能 "+available+"件・未実装 "+(cases.length-available)+"件":"機能を読み込み中";
}
$("wr-debug-case").addEventListener("change",updateCaseStatus);
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
 fillCases();updateCaseStatus();
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
 $("wr-debug-summary").textContent=state?(state.mode==="menu"?"タイトル画面":state.animal+"｜"+state.region+"｜YEAR "+Math.floor((b?.diagnostics?.()?.elapsed||0)/120)+"｜HP "+state.hp+" / 空腹 "+state.hunger+"%"):"ゲーム起動待ち";
 $("wr-debug-mode-banner").textContent=sandbox()?"デバッグ ON｜通常セーブとは分離中":"通常プレイ";
 $("wr-debug-tutorial-status").textContent=inTest?"通しテスト中："+(m>=0?(m+1)+"/7 "+stageNames[m]:"段階確認中"):"通常プレイ中（通しテスト未開始）";
 $("wr-debug-boss-status").textContent="現在の強敵："+(boss?boss.name+"（HP "+boss.hp+"）":"なし");
 if(inTest&&m>=0)$("wr-debug-stage").value=String(stages[m]);
 for(const action of ["tutorial-prev","tutorial-next","tutorial-stage","tutorial-stop"]){
  const item=panel.querySelector('[data-action="'+action+'"]');
  item.disabled=!inTest||(action==="tutorial-prev"&&m<=0)||(action==="tutorial-next"&&m>=stages.length-1);
 }
 panel.querySelector('[data-action="tutorial-start"]').disabled=inTest;
 const saveText=(()=>{try{const s=JSON.parse(localStorage.getItem("wild-reclaim-autosave-v2")||"null");return s?"DAY "+s.day+" v"+s.version:"なし";}catch(_){return "読み取り不可";}})();
 try{
  const snap=sessionStorage.getItem(qaBackupKey);
  const meta=snap?JSON.parse(snap):null;
  $("wr-debug-backup-status").textContent=meta?"QAバックアップあり："+new Date(meta.createdAt).toLocaleString("ja-JP")+"（保存キー "+Object.keys(meta.entries||{}).length+"件）":"QAバックアップなし";
 }catch(_){$("wr-debug-backup-status").textContent="バックアップ確認失敗";}
 if(!enabled.has("renderer"))$("wr-debug-renderer").value=b?.getRenderer?.()||"auto";
 $("wr-debug-qa-report").textContent=JSON.stringify(b?.diagnostics?.()||{status:"ゲーム起動待ち"},null,2).slice(0,16000);
 $("wr-debug-errors").textContent=recentErrors.length?"JavaScript例外（直近）:\\n"+recentErrors.map(e=>e.time+" "+e.message).join("\\n"):"JavaScript例外：記録なし";
 $("wr-debug-stats").textContent=[
  "FPS（画面更新）: "+fps,"描画: "+(window.Wild3D?.available?"WebGL":"Canvas2D"),
  "状態: "+(state?.mode||"不明"),"場所: "+(state?.region||"開始前"),
  "日時: "+(state?.day||0)+"日 "+String(state?.hour||0).padStart(2,"0")+":00",
  "天気: "+(state?.weather||"-"),"敵/死骸: "+(state?.mobCount||0)+" / "+(state?.carcassCount||0),
  "巣LV/備蓄: "+(state?.denLevel||0)+" / "+(state?.denStash||0),
  "チュートリアル: "+(inTest?"QA通しテスト":"通常の進行"),
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
function leaveDebug(){
 if(!sandbox())return;
 try{sessionStorage.removeItem(launchKey);window.WildDebugSandbox?.reset?.();}
 catch(error){trackError("デバッグ終了: "+error.message);}
 const clean=new URL(location.href);clean.searchParams.delete("wr_debug_sandbox");
 location.replace(clean.toString());
}
function toggle(){
 if(sandbox()){leaveDebug();return;}
 try{
  sessionStorage.removeItem(launchKey);
  sessionStorage.removeItem("wr-debug-storage-v1");
  const url=new URL(location.href);url.searchParams.set("wr_debug_sandbox","1");
  location.assign(url.toString());
 }catch(error){trackError("デバッグ開始: "+error.message);}
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
 if(action==="disable"){leaveDebug();return;}
  if(!sandbox()&&action!=="copy"){
   say("通常セーブへの影響を防ぐためデバッグ操作は利用できません");return;
  }
 if(action==="copy"){
  try{await navigator.clipboard.writeText($("wr-debug-stats").textContent);say("診断をコピーしました");}catch(_){say("コピーできませんでした");}return;
 }
 if(action==="qa-backup"){say(qaCapture(true)?"現在のセーブをQAバックアップに記録":"QAバックアップに失敗");return;}
 if(action==="qa-restore"){if(!qaRestore())say("QAバックアップがありません。復元できません");return;}
 if(action==="renderer"){
  const success=bridge()?.setRenderer?.($("wr-debug-renderer").value);
  say(success?"描画方式を切り替えました":"描画方式変更不可");return;
 }
 if(["custom-year","custom-level","custom-position"].includes(action)){
  if(!qaCapture(false)){say("バックアップ作成失敗。検証を中止");return;}
  const api=bridge();let res;
  try{
   if(action==="custom-position")res=api?.teleportTo?.(Number($("wr-debug-x").value),Number($("wr-debug-y").value));
   else if(action==="custom-year")res=api?.runCase?.("year:"+$("wr-debug-year").value);
   else res=api?.runCase?.("player:level"+$("wr-debug-level").value);
  }catch(error){trackError(error.message);res={ok:false,message:"検証時エラー："+error.message};}
  say(res?.message||"指定値を実行できません");return;
 }
 if(action==="case"){
  if(!qaCapture(false)){say("QAバックアップの作成に失敗。実行を中止");return;}
  let res;
  try{res=bridge()?.runCase?.($("wr-debug-case").value)}
  catch(error){trackError(error.message);res={ok:false,message:"実行時エラー："+error.message}}
  say(res?.message||"実行できません");
  return;
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
setInterval(()=>{applyWhenReady();render();},350);
if(sandbox()){
 unlocked=true;pill.hidden=false;pill.textContent="デバッグ ON｜設定";panel.hidden=false;
 runFps();fillOptions();
 let config=null;try{config=JSON.parse(sessionStorage.getItem(launchKey)||"null")}catch(_){}
 restoreLaunch(config);
 say("デバッグはONです。項目をON/OFFして設定を閉じ、タイトルの開始ボタンでプレイしてください");
}
window.WildDebugMode={get unlocked(){return unlocked;},get open(){return unlocked&&!panel.hidden;},get taps(){return taps;},toggle,onGameLaunch};
})();