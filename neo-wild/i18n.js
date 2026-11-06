(()=>{
"use strict";
const KEY="wild-reclaim-language-v1",dict=new Map([["人の消えた日本の町。","A Japanese town without people."],["支配者になったのは、飢えた野生だった。","Hungry wildlife now rules the streets."],["続きからプレイ","Continue"],["下の動物をタップして選択","Tap an animal below to select"],["保存したゲームから再開","Resume saved game"],["所有動物（操作1体＋ストック2体）","Owned animals (1 active + 2 reserves)"],["所有動物と操作キャラの選択","Owned animals and active character"],["空き枠の＋で動物を選択","Tap + to choose an animal"],["所有動物","Owned animals"],["操作中","Active"],["ストック","Reserve"],["空き枠","Empty slot"],["タップして選択","Tap to select"],["この個体を操作","Play as this animal"],["野生に放つ","Release into the wild"],["放流を確定","Confirm release"],["野生に放ちますか？","Release this animal?"],["この個体は所有に戻せません。","This animal can never return to your roster."],["野生では強化個体として再登場します。","It may return as stronger wildlife."],["最後の個体なので次はガチャから再出発します。","This is your last animal. Your next run will start with gacha."],["生存中の個体は破棄できません。","You cannot discard a living animal."],["図鑑","Bestiary"],["年表","Timeline"],["世界年表","World timeline"],["トロフィー","Trophies"],["獲得","Unlocked"],["画面設定と探索記録","Display settings and exploration records"],["ゲームパッド操作","Controller controls"],["選択中：最初の項目","Selected: first item"],["画面の向きを選択","Choose screen orientation"],["プレイ画面の向き","Screen orientation"],["縦画面","Portrait"],["横画面","Landscape"],["縦に持って遊ぶ","Play upright"],["横に持って遊ぶ","Play sideways"],["✓ 選択中","✓ Selected"],["縦画面に戻す","Switch to portrait"],["横画面にする","Switch to landscape"],["ゲームをリセットして新規で開始する","Reset and start a new game"],["ゲームをリセットして新規で開始しますか？現在の編成と自動セーブは消えます。チュートリアルの完了記録は残ります。","Reset and start a new game? Your roster and autosave will be erased. Tutorial progress remains."],["選んだ動物で新しく開始","Start with selected animal"],["現在の自動保存データを上書きし、","Your autosave will be replaced. Start as "],["で新しく開始します。チェックポイントは残ります。","? Checkpoints remain."],["キャンセル","Cancel"],["リセットする","Reset"],["閉じる","Close"],["戻る","Back"],["次へ","Next"],["リトライ","Retry"],["最初から","New game"],["タイトルに戻る","Return to title"],["ゲームを一時停止","Pause game"],["ポーズ","Pause"],["廃都は、あなたが動くのを待っている。","The abandoned city waits for your next move."],["生存を再開する","Resume survival"],["チェックポイントを記録","Save checkpoint"],["タイトルに戻る（自動保存）","Return to title (autosave)"],["BGMを選択","Choose BGM"],["BGM音量","BGM volume"],["デフォルト｜環境連動","Default | Adaptive ambience"],["廃都の残響｜静かなピアノ","City Echoes | Quiet Piano"],["深緑の息吹｜自然と弦","Forest Breath | Strings"],["獣の足音｜緊迫の低音","Wild Footsteps | Tense Bass"],["夜明けの地平｜広がる旋律","Dawn Horizon | Expansive Melody"],["ポーズ中に試聴できます。選択は保存されます。","Preview during pause. Your selection is saved."],["音楽の切替","Toggle music"],["最大化","Fullscreen"],["生命","Health"],["空腹","Hunger"],["持久","Stamina"],["獲物を狩って進化","Hunt prey to evolve"],["備蓄","Supplies"],["巣の備蓄","Den supplies"],["巣の食料庫","Den pantry"],["巣に戻ると備蓄を食べられます。","Return to the den to eat stored food."],["運搬","Carrying"],["縄張り","Territory"],["持久力","Stamina"],["なし","None"],["合計","Total"],["巣","Den"],["食べる","Eat"],["くわえる","Carry"],["置く","Drop"],["飛びつき","Pounce"],["ダッシュ","Dash"],["ジャンプ","Jump"],["固有技","Special skill"],["潜伏","Sneak"],["潜伏中","Hidden"],["食事","Eat"],["攻撃","Attack"],["速度","Speed"],["回復","Recovery"],["強化","Upgrade"],["周辺地図と生存記録","Nearby map and survival record"],["廃都の地図","World map"],["地図を閉じる","Close map"],["今いる場所と立ち寄れる場所","Your location and points of interest"],["探索で生存能力が解放されます","Explore to unlock survival abilities"],["目標を閉じる","Close objective"],["探索依頼","Explore quest"],["チュートリアル","Tutorial"],["ミッション","Mission"],["生存目標","Survival objective"],["食料を確保せよ","Find food"],["近くの食料を探して食べる","Find nearby food and eat it"],["次の目的：身を隠せ","Next: hide"],["次の目的：","Next objective: "],["目標を探索中","Searching for target"],["強敵接近","Boss approaching"],["危険な気配","Danger nearby"],["攻撃範囲を見極めろ","Watch for incoming attacks"],["落雷予兆！ 逃げろ","Lightning incoming! Run!"],["落雷！","Lightning strike!"],["進化の時","Time to evolve"],["本能が変異する。ひとつ選べ。","Your instincts are changing. Choose one."],["鋭利な牙","Sharp fangs"],["攻撃力 +25%","Attack +25%"],["野生の脚","Wild legs"],["移動速度 +15%","Movement speed +15%"],["強靭な肉体","Resilient body"],["最大生命 +30 / 回復","Max health +30 / heal"],["死んでしまった","You died"],["命を落としました。残る仲間がいれば引き継げます。","Your animal died. Continue as a survivor."],["生き延びた！","You survived!"],["生存記録を残しました。","Your survival record was saved."],["生存の記録","Survival record"],["ハイスコア！","New high score!"],["歴代TOP5","Top 5 records"],["この端末","This device"],["リトライ（同じ動物）","Retry (same animal)"],["新しいガチャ編成","New gacha roster"],["仲間から新リーダーを選択","Choose a new leader"],["画像を保存","Save image"],["Xで共有","Share to X"],["死亡スクショ","Death screenshot"],["編成ガチャ","Roster gacha"],["この個体で決定","Confirm this animal"],["ガチャ結果をキャンセル","Cancel gacha result"],["編成数を選択","Choose roster size"],["ガチャを引く","Draw"],["もう一度引く","Reroll"],["抽選済み候補","Drawn candidates"],["抽選結果：","Draw result: "],["引いた候補から選択","Choose from your draws"],["この個体を採用","Recruit this animal"],["選択中の個体で出発","Depart with selected animal"],["操作可能なリーダーを選んでください。","Choose a playable leader."],["名前なし","Unnamed"],["名前：","Name: "],["評価","Grade"],["成長型","Growth type"],["標準成長","Balanced growth"],["追加能力","Bonus abilities"],["ガチャ権","Gacha tickets"],["ガチャ","Gacha"],["基本","Common"],["希少","Rare"],["伝説級","Legendary"],["若い","Young"],["成体","Adult"],["オス","Male"],["メス","Female"],["リーダー","Leader"],["リーダーに指定","Make leader"],["出発前は空き枠を無料で追加できます。","You may fill empty slots for free before departure."],["空き枠に仲間を迎える","Recruit for an empty slot"],["ガチャ権がありません。探索や狩りで獲得してください。","No tickets. Earn them through exploration and hunting."],["巣の近くで補充してください。","Return to a den to add an animal."],["補充できる空き枠がありません。","There are no free roster slots."],["上限に達しています。死亡・野生への放流で枠が空くまで追加できません。","Roster full. Free a slot through death or release."],["操作する動物は1体。ほかは所有一覧から選択できます。","Control one animal at a time; choose from your roster."],["未実装の操作種はリーダーに指定できません。","An unavailable species cannot be leader."],["操作可能な動物がいません。最後のガチャに戻ってください。","No playable animal. Return to your last draw."],["補充にはガチャ権が必要です。探索・狩り・ミッションで獲得できます。","You need tickets earned by exploring, hunting or missions."],["操作する個体を所有一覧から選択してください。","Choose your active animal from the roster."],["操作中1体、ほかはストックです。","One active, the rest are reserves."],["空き枠の＋で動物を選択","Tap + in an empty slot to draw an animal"],["選択中","Selected"],["未実装","Not available"],["現在操作中","Currently active"],["アカギツネ","Red fox"],["ノラネコ","Stray cat"],["オオカミ","Wolf"],["野犬","Feral dog"],["ニホンジカ","Sika deer"],["イノシシ","Wild boar"],["マヌルネコ","Pallas's cat"],["チベットスナギツネ","Tibetan sand fox"],["ハシビロコウ","Shoebill"],["ニホンザル","Japanese macaque"],["ゴリラ","Gorilla"],["ワニ","Crocodile"],["ライオン","Lion"],["ゾウ","Elephant"],["ペンギン","Penguin"],["サイ","Rhinoceros"],["タヌキ","Raccoon dog"],["アナグマ","Badger"],["カラス","Crow"],["ハト","Pigeon"],["カワウソ","Otter"],["コイ","Carp"],["ツキノワグマ","Asian black bear"],["ニホンカモシカ","Japanese serow"],["トラ","Tiger"],["チーター","Cheetah"],["カバ","Hippopotamus"],["キリン","Giraffe"],["シマウマ","Zebra"],["ハイエナ","Hyena"],["リカオン","African wild dog"],["アルマジロ","Armadillo"],["ハリネズミ","Hedgehog"],["アルファウルフ","Alpha wolf"],["大蛇","Giant snake"],["老熊","Old bear"],["巨大イノシシ","Giant boar"],["黒豹","Black panther"],["隻眼の狼","One-eyed wolf"],["白虎","White tiger"],["巨大ハイエナ","Giant hyena"],["巨大ライオン","Giant lion"],["巨大ヘラジカ","Giant moose"],["巨大バッファロー","Giant buffalo"],["巨大ワニ","Giant crocodile"],["巨大カバ","Giant hippopotamus"],["巨大アナコンダ","Giant anaconda"],["巨大オオトカゲ","Giant monitor lizard"],["巨大ゴリラ","Giant gorilla"],["巨大ゾウ","Giant elephant"],["アルビノの狼","Albino wolf"],["大鷲","Giant eagle"],["霞町の廃庁街","Kasumachi civic ruins"],["桜坂駅跡","Sakurazaka Station ruins"],["蔦ヶ丘の古町","Tsutagaoka old town"],["白鷺の獣舎跡","Shirasagi zoo ruins"],["朝霧川の土手","Asagiri River banks"],["楠の森","Camphor Forest"],["汐浜の廃工場","Shiohama factory ruins"],["潮見の水路","Shiomi canal"],["首都高廃線跡","Abandoned expressway"],["山影の地下道入口","Mountain tunnel entrance"],["UFOに捕獲","Abducted by UFO"],["餓死","Starvation"],["毒による衰弱","Poison"],["出血","Bleeding"],["火災","Fire"],["落雷","Lightning"],["洪水","Flood"],["原因不明","Unknown cause"],["の攻撃"," attack"],["死亡","Death"],["生存","Survival"],["探索","Explore"],["地域","Area"],["ゲーム","Game"],["選択","Select"]]);
const terms=[...dict].sort((a,b)=>b[0].length-a[0].length),storedText=new WeakMap(),storedAttrs=new WeakMap();
let locale="ja",timer=0;
try{if(localStorage.getItem(KEY)==="en")locale="en"}catch(_){}
const dynamic=[
 [/^チュートリアル\s*(\d+)\s*\/\s*(\d+)$/,"Tutorial $1 / $2"],
 [/^\s*([123])枠目・空き\s*$/,"Slot $1: empty"],
 [/^\s*([123])枠目のガチャ\s*$/,"Slot $1 draw"],
 [/^巣\s*LV(\d+)｜運搬\s*(.*)$/,"Den Lv.$1 | Carrying $2"]
];
function translate(text){
 const raw=String(text),s=raw.trim();if(!/[\u3040-\u30ff\u3400-\u9fff]/.test(raw))return raw;
 if(dict.has(s)){const pos=raw.indexOf(s);return raw.slice(0,pos)+dict.get(s)+raw.slice(pos+s.length)}
 let t=raw;
 for(const [pattern,replacement] of dynamic)t=t.replace(pattern,replacement);
 for(const [ja,en] of terms)if(ja.length>=2&&t.includes(ja))t=t.split(ja).join(en);
 return t;
}
function textNode(n){
 if(n.nodeType!==3||!n.parentElement||/^(SCRIPT|STYLE|TEXTAREA)$/.test(n.parentElement.tagName)||n.parentElement.closest("[contenteditable=true]"))return;
 const old=storedText.get(n),raw=n.nodeValue;
 if(locale==="ja"){if(old&&raw===old.en)n.nodeValue=old.ja;return}
 if(old&&raw===old.en)return;
 const en=translate(raw);if(raw!==en){storedText.set(n,{ja:raw,en});n.nodeValue=en}
}
function attrs(n){
 if(n.nodeType!==1||/^(SCRIPT|STYLE|TEXTAREA|INPUT)$/.test(n.tagName))return;
 let cache=storedAttrs.get(n);if(!cache){cache=new Map();storedAttrs.set(n,cache)}
 for(const key of ["aria-label","title","placeholder"]){
  if(!n.hasAttribute(key))continue;
  const raw=n.getAttribute(key),old=cache.get(key);
  if(locale==="ja"){if(old&&raw===old.en)n.setAttribute(key,old.ja);continue}
  if(old&&raw===old.en)continue;
  const en=translate(raw);if(en!==raw){cache.set(key,{ja:raw,en});n.setAttribute(key,en)}
 }
}
function walk(root){
 if(!root)return;
 if(root.nodeType===3){textNode(root);return}
 if(root.nodeType!==1&&root.nodeType!==9&&root.nodeType!==11)return;
 if(root.nodeType===1)attrs(root);
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
 for(let node=walker.nextNode();node;node=walker.nextNode()){if(node.nodeType===3)textNode(node);else attrs(node)}
}
function syncControls(){
 for(const id of ["language-title","language-pause"]){
  const group=document.getElementById(id);
  if(!group)continue;
  for(const button of group.querySelectorAll("button[data-lang]")){
   const selected=button.dataset.lang===locale;
   button.setAttribute("aria-pressed",selected?"true":"false");
   button.classList.toggle("is-selected",selected);
  }
 }
 document.documentElement.lang=locale;
 document.title=locale==="en"?"WILD RECLAIM | Survival in a Lost City":"WILD RECLAIM | 廃都生存記";
}
function refresh(){walk(document.body);syncControls()}
function setLanguage(next){
 if(next!=="en"&&next!=="ja")return false;
 locale=next;
 try{localStorage.setItem(KEY,locale)}catch(_){}
 refresh();return true;
}
for(const id of ["language-title","language-pause"]){
 const group=document.getElementById(id);
 if(!group)continue;
 group.addEventListener("click",event=>{
  const button=event.target.closest?.("button[data-lang]");
  if(!button||!group.contains(button))return;
  setLanguage(button.dataset.lang);
 });
}
const pending=new Set();
function flush(){timer=0;if(locale!=="en"){pending.clear();return}for(const node of pending)walk(node);pending.clear()}
if(typeof MutationObserver!=="undefined"){
 const observer=new MutationObserver(changes=>{
  if(locale!=="en")return;
  for(const m of changes){
   if(m.type==="characterData"||m.type==="attributes")pending.add(m.target);
   else for(const node of m.addedNodes)pending.add(node);
  }
  if(pending.size&&!timer)timer=setTimeout(flush,55);
 });
 observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["aria-label","title","placeholder"]});
}
refresh();
window.WildI18n={setLanguage,translate,refresh,get locale(){return locale}};
})();