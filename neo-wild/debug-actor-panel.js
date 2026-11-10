/* WILD RECLAIM: isolated QA actor lab. Loaded after debug-mode.js. */
(() => {
 "use strict";
 if(window.WildDebugSandbox?.active!==true)return;
 const host=document.getElementById("wr-debug-panel"),bridge=()=>window.WildDebugBridge;
 if(!host||!bridge()?.listPlayerSpecies||host.querySelector("#wr-actor-lab"))return;
 const species=bridge().listPlayerSpecies();
 const settingsKey="wr-actor-lab-settings-v1",checksKey="wr-actor-lab-checks-v1";
 const tests=["move","attack","special","appearance"];
 const labels={move:"移動",attack:"攻撃",special:"固有技",appearance:"外見"};
 let settings={},checks={};
 try{settings=JSON.parse(sessionStorage.getItem(settingsKey)||"{}")||{}}catch(_){}
 try{checks=JSON.parse(sessionStorage.getItem(checksKey)||"{}")||{}}catch(_){}
 const css=document.createElement("style");
 css.textContent=[
  "#wr-actor-lab{border:2px solid #8cebb6!important;background:#192d2b!important}",
  "#wr-actor-lab .wr-actor-state{white-space:pre-wrap;padding:10px;background:#102522;border-radius:8px;line-height:1.6;font-size:12px}",
  "#wr-actor-lab .wr-actor-progress{font-weight:bold;margin:10px 0;font-size:13px}",
  "#wr-actor-lab [data-actor-check][aria-pressed=true]{background:#176947;border-color:#aaffc8}",
  "#wr-actor-lab .wr-actor-list{white-space:pre-wrap;font-size:12px;line-height:1.7;max-height:220px;overflow-y:auto}",
  "#wr-actor-lab .wr-actor-help{font-size:12px;line-height:1.65;color:#cedfd7}"
 ].join("");
 document.head.appendChild(css);
 const section=document.createElement("details");
 section.className="wr-section";section.id="wr-actor-lab";section.open=true;
 section.innerHTML=[
 '<summary>自キャラ検証｜全動物・レベル・操作</summary>',
 '<div class="wr-inside">',
 '<p class="wr-actor-help">デバッグ専用データで35種を直接操作できます。未解放24種はQA専用で、通常のガチャと所有枠には追加されません。</p>',
 '<label>操作する動物<select id="wr-actor-species"></select></label>',
 '<div id="wr-actor-selected" class="wr-note">動物を選択してください</div>',
 '<div class="wr-row"><button type="button" data-actor-action="prev">前の動物</button><button type="button" data-actor-action="next">次の動物</button></div>',
 '<button type="button" class="wr-primary" data-actor-action="switch">この動物を操作・動作検証</button>',
 '<label>自キャラLV（1～1000）<input id="wr-actor-level" type="number" inputmode="numeric" min="1" max="1000" step="1" value="10"></label>',
 '<div class="wr-row"><button type="button" data-actor-action="preset" data-level="1">LV1</button><button type="button" data-actor-action="preset" data-level="10">LV10</button><button type="button" data-actor-action="preset" data-level="30">LV30</button><button type="button" data-actor-action="preset" data-level="100">LV100</button></div>',
 '<button type="button" class="wr-primary" data-actor-action="level">レベル設定（HP・攻撃・移動速度に反映）</button>',
 '<div id="wr-actor-state" class="wr-actor-state">ゲーム開始待ち</div>',
 '<div class="wr-row"><button type="button" data-actor-action="heal">HP・空腹・SP回復</button><button type="button" data-actor-action="target">攻撃用のウサギ配置</button></div>',
 '<div class="wr-row"><button type="button" data-actor-action="attack">攻撃</button><button type="button" data-actor-action="instinct">固有アクション</button></div>',
 '<div class="wr-row"><button type="button" data-actor-action="jump">ジャンプ</button><button type="button" data-actor-action="dash">飛びつき・ダッシュ</button></div>',
 '<p class="wr-actor-help">上のボタンはゲーム本体の実動作を発行します。画面で成功を目視した項目だけ下で記録してください。</p>',
 '<div class="wr-row"><button type="button" data-actor-check="move">移動：未確認</button><button type="button" data-actor-check="attack">攻撃：未確認</button><button type="button" data-actor-check="special">固有技：未確認</button><button type="button" data-actor-check="appearance">外見：未確認</button></div>',
 '<div class="wr-actor-progress" id="wr-actor-progress">確認済み：0 / 35種</div>',
 '<details><summary>全35種の確認記録</summary><div id="wr-actor-list" class="wr-actor-list"></div></details>',
 '<button type="button" class="wr-danger" data-actor-action="restore">元の自キャラを復元</button>',
 '<div id="wr-actor-feedback" role="status" aria-live="polite" class="wr-note"></div>',
 '</div>'
 ].join("");
 const launch=host.querySelector(".wr-launch");
 if(launch)launch.insertAdjacentElement("afterend",section);
 else host.querySelector("header")?.insertAdjacentElement("afterend",section);
 const $=id=>section.querySelector("#"+id),pick=$("wr-actor-species"),lv=$("wr-actor-level");
 for(const entry of species){
  const option=document.createElement("option");option.value=entry.id;
  option.textContent=entry.name+(entry.gachaReady?"｜ガチャ対象":"｜未解放・QA専用");
  pick.appendChild(option);
 }
 const current=bridge()?.getPlayerTestState?.();
 pick.value=species.some(s=>s.id===settings.species)?settings.species:
  species.some(s=>s.id===current?.type)?current.type:(species[0]?.id||"");
 if(Number.isInteger(settings.level)&&settings.level>=1&&settings.level<=1000)lv.value=String(settings.level);
 const report=message=>{$("wr-actor-feedback").textContent=message;render();};
 const saveSettings=()=>{
  try{sessionStorage.setItem(settingsKey,JSON.stringify(settings));return true}
  catch(error){report("設定の保存に失敗："+error.message);return false}
 };
 function render(){
  const a=species.find(s=>s.id===pick.value),player=bridge()?.getPlayerTestState?.();
  $("wr-actor-selected").textContent=a?
   a.name+"｜"+(a.gachaReady?"通常ガチャ対象":"QA限定（通常は未解放）"):
   "操作できる動物がありません";
  $("wr-actor-state").textContent=player?
   "操作中："+player.name+"／LV"+player.level+"／HP "+player.hp+"/"+player.maxHp+
   "／SP "+player.stamina+"\n攻撃 "+player.attack+" ／ 移動 "+player.speed+
   " ／ 座標 "+player.x+","+player.y+(player.temporary?" ／ テスト仮キャラ":" ／ 元の所有個体"):
   "ゲーム開始後に自キャラの能力を表示します";
  const record=checks[pick.value]||{};
  for(const type of tests){
   const el=section.querySelector('[data-actor-check="'+type+'"]');
   el.textContent=labels[type]+"："+(record[type]?"確認済 ✓":"未確認");
   el.setAttribute("aria-pressed",String(!!record[type]));
  }
  const complete=species.filter(s=>tests.every(t=>checks[s.id]?.[t])).length;
  $("wr-actor-progress").textContent="確認済み："+complete+" / "+species.length+"種｜選択中 "+tests.filter(t=>record[t]).length+"/4項目";
  const list=$("wr-actor-list");
  if(list.parentElement?.open)list.textContent=species.map(s=>{
   const r=checks[s.id]||{};
   return (tests.every(t=>r[t])?"✓ ":"・ ")+s.name+"　"+tests.filter(t=>r[t]).length+"/4";
  }).join("\n");
 }
 pick.addEventListener("change",()=>{settings.species=pick.value;saveSettings();render();});
 lv.addEventListener("change",()=>{
  const n=Number(lv.value);
  if(!Number.isInteger(n)||n<1||n>1000)return;
  settings.level=n;saveSettings();
  const old=document.getElementById("wr-debug-level");
  if(old){old.value=String(n);old.dispatchEvent(new Event("input",{bubbles:true}));}
 });
 section.addEventListener("click",event=>{
  const btn=event.target.closest("button");
  if(!btn||!section.contains(btn))return;
  const check=btn.dataset.actorCheck,action=btn.dataset.actorAction;
  if(check){
   const state=bridge()?.getPlayerTestState?.();
   if(state?.type!==pick.value||bridge()?.getState?.()?.mode!=="play"){
    report("選択した動物を実際に操作してから確認記録を付けてください");return;
   }
   const next={...(checks[pick.value]||{})};next[check]=!next[check];
   const previous=checks[pick.value];checks[pick.value]=next;
   try{sessionStorage.setItem(checksKey,JSON.stringify(checks));report(state.name+"の目視確認を更新")}
   catch(error){if(previous)checks[pick.value]=previous;else delete checks[pick.value];report("確認記録の保存失敗："+error.message);}
   return;
  }
  if(!action)return;
  if(action==="prev"||action==="next"){
   if(!species.length)return;
   const index=Math.max(0,species.findIndex(s=>s.id===pick.value));
   pick.value=species[(index+(action==="next"?1:species.length-1))%species.length].id;
   settings.species=pick.value;saveSettings();
   if(bridge()?.getState?.()?.mode!=="play"){report("動物を選択。ゲーム開始時に適用します");return;}
   const res=bridge()?.setPlayerSpecies?.(pick.value);
   report(res?.message||"操作動物を変更できません");
   if(res?.ok)host.hidden=true;return;
  }
  if(action==="preset"){
   lv.value=btn.dataset.level;
   lv.dispatchEvent(new Event("change",{bubbles:true}));
   report("LV"+lv.value+"を指定。下の設定ボタンで適用してください");return;
  }
  if(action==="switch"){
   settings.species=pick.value;saveSettings();
  }else if(action==="level"){
   const n=Number(lv.value);
   if(!Number.isInteger(n)||n<1||n>1000){report("レベルは1～1000の整数を指定してください");return;}
   settings.level=n;saveSettings();lv.dispatchEvent(new Event("change",{bubbles:true}));
  }else if(action==="restore"){
   delete settings.species;delete settings.level;saveSettings();
  }
  const api=bridge();
  let res;
  try{
   if(action==="switch")res=api?.setPlayerSpecies?.(pick.value);
   else if(action==="level")res=api?.setPlayerLevel?.(Number(lv.value));
   else if(action==="restore")res=api?.restorePlayer?.();
   else if(action==="heal")res=api?.heal?.()?{ok:true,message:"HP・空腹・持久力を回復"}:{ok:false,message:"回復不可"};
   else res=api?.playerAction?.(action);
  }catch(error){res={ok:false,message:"検証中のエラー："+error.message}}
  report(res?.message||"ゲーム開始後にデバッグ操作してください");
  if(res?.ok&&["switch","attack","jump","dash","instinct","target"].includes(action))host.hidden=true;
 });
 // The debug-mode launcher calls onGameLaunch on every valid in-game start.
 // Apply only user-selected test values, after the older debug presets run.
 const oldLaunch=window.WildDebugMode?.onGameLaunch;
 if(typeof oldLaunch==="function"){
  window.WildDebugMode.onGameLaunch=()=>{
   oldLaunch();
   const picked=settings.species,level=settings.level;
   if(!picked&&!level)return;
   setTimeout(()=>{
    if(window.WildDebugSandbox?.active!==true||bridge()?.getState?.()?.mode!=="play")return;
    if(picked)bridge()?.setPlayerSpecies?.(picked);
    if(Number.isInteger(level)&&level>=1&&level<=1000)bridge()?.setPlayerLevel?.(level);
    render();
   },750);
  };
 }
 render();
 setInterval(()=>{if(!host.hidden)render()},1000);
})();
