(()=>{
"use strict";
const KEY="wild-reclaim-language-v1",dict=new Map([["人の消えた日本の町。","A Japanese town without people."],["支配者になったのは、飢えた野生だった。","Hungry wildlife now rules the streets."],["続きからプレイ","Continue"],["下の動物をタップして選択","Tap an animal below to select"],["保存したゲームから再開","Resume saved game"],["所有動物（操作1体＋ストック2体）","Owned animals (1 active + 2 reserves)"],["所有動物と操作キャラの選択","Owned animals and active character"],["空き枠の＋で動物を選択","Tap + to choose an animal"],["所有動物","Owned animals"],["操作中","Active"],["ストック","Reserve"],["空き枠","Empty slot"],["タップして選択","Tap to select"],["この個体を操作","Play as this animal"],["野生に放つ","Release into the wild"],["放流を確定","Confirm release"],["野生に放ちますか？","Release this animal?"],["この個体は所有に戻せません。","This animal can never return to your roster."],["野生では強化個体として再登場します。","It may return as stronger wildlife."],["最後の個体なので次はガチャから再出発します。","This is your last animal. Your next run will start with gacha."],["生存中の個体は破棄できません。","You cannot discard a living animal."],["図鑑","Bestiary"],["年表","Timeline"],["世界年表","World timeline"],["トロフィー","Trophies"],["獲得","Unlocked"],["画面設定と探索記録","Display settings and exploration records"],["ゲームパッド操作","Controller controls"],["選択中：最初の項目","Selected: first item"],["画面の向きを選択","Choose screen orientation"],["プレイ画面の向き","Screen orientation"],["縦画面","Portrait"],["横画面","Landscape"],["縦に持って遊ぶ","Play upright"],["横に持って遊ぶ","Play sideways"],["✓ 選択中","✓ Selected"],["縦画面に戻す","Switch to portrait"],["横画面にする","Switch to landscape"],["ゲームをリセットして新規で開始する","Reset and start a new game"],["ゲームをリセットして新規で開始しますか？現在の編成と自動セーブは消えます。チュートリアルの完了記録は残ります。","Reset and start a new game? Your roster and autosave will be erased. Tutorial progress remains."],["選んだ動物で新しく開始","Start with selected animal"],["現在の自動保存データを上書きし、","Your autosave will be replaced. Start as "],["で新しく開始します。チェックポイントは残ります。","? Checkpoints remain."],["キャンセル","Cancel"],["リセットする","Reset"],["閉じる","Close"],["戻る","Back"],["次へ","Next"],["リトライ","Retry"],["最初から","New game"],["タイトルに戻る","Return to title"],["ゲームを一時停止","Pause game"],["ポーズ","Pause"],["廃都は、あなたが動くのを待っている。","The abandoned city waits for your next move."],["生存を再開する","Resume survival"],["チェックポイントを記録","Save checkpoint"],["タイトルに戻る（自動保存）","Return to title (autosave)"],["BGMを選択","Choose BGM"],["BGM音量","BGM volume"],["デフォルト｜環境連動","Default | Adaptive ambience"],["廃都の残響｜静かなピアノ","City Echoes | Quiet Piano"],["深緑の息吹｜自然と弦","Forest Breath | Strings"],["獣の足音｜緊迫の低音","Wild Footsteps | Tense Bass"],["夜明けの地平｜広がる旋律","Dawn Horizon | Expansive Melody"],["ポーズ中に試聴できます。選択は保存されます。","Preview during pause. Your selection is saved."],["音楽の切替","Toggle music"],["最大化","Fullscreen"],["生命","Health"],["空腹","Hunger"],["持久","Stamina"],["獲物を狩って進化","Hunt prey to evolve"],["備蓄","Supplies"],["巣の備蓄","Den supplies"],["巣の食料庫","Den pantry"],["巣に戻ると備蓄を食べられます。","Return to the den to eat stored food."],["運搬","Carrying"],["縄張り","Territory"],["持久力","Stamina"],["なし","None"],["合計","Total"],["巣","Den"],["食べる","Eat"],["くわえる","Carry"],["置く","Drop"],["飛びつき","Pounce"],["ダッシュ","Dash"],["ジャンプ","Jump"],["固有技","Special skill"],["潜伏","Sneak"],["潜伏中","Hidden"],["食事","Eat"],["攻撃","Attack"],["速度","Speed"],["回復","Recovery"],["強化","Upgrade"],["周辺地図と生存記録","Nearby map and survival record"],["廃都の地図","World map"],["地図を閉じる","Close map"],["今いる場所と立ち寄れる場所","Your location and points of interest"],["探索で生存能力が解放されます","Explore to unlock survival abilities"],["目標を閉じる","Close objective"],["探索依頼","Explore quest"],["チュートリアル","Tutorial"],["ミッション","Mission"],["生存目標","Survival objective"],["食料を確保せよ","Find food"],["近くの食料を探して食べる","Find nearby food and eat it"],["次の目的：身を隠せ","Next: hide"],["次の目的：","Next objective: "],["目標を探索中","Searching for target"],["強敵接近","Boss approaching"],["危険な気配","Danger nearby"],["攻撃範囲を見極めろ","Watch for incoming attacks"],["落雷予兆！ 逃げろ","Lightning incoming! Run!"],["落雷！","Lightning strike!"],["進化の時","Time to evolve"],["本能が変異する。ひとつ選べ。","Your instincts are changing. Choose one."],["鋭利な牙","Sharp fangs"],["攻撃力 +25%","Attack +25%"],["野生の脚","Wild legs"],["移動速度 +15%","Movement speed +15%"],["強靭な肉体","Resilient body"],["最大生命 +30 / 回復","Max health +30 / heal"],["死んでしまった","You died"],["命を落としました。残る仲間がいれば引き継げます。","Your animal died. Continue as a survivor."],["生き延びた！","You survived!"],["生存記録を残しました。","Your survival record was saved."],["生存の記録","Survival record"],["ハイスコア！","New high score!"],["歴代TOP5","Top 5 records"],["この端末","This device"],["リトライ（同じ動物）","Retry (same animal)"],["新しいガチャ編成","New gacha roster"],["仲間から新リーダーを選択","Choose a new leader"],["画像を保存","Save image"],["Xで共有","Share to X"],["死亡スクショ","Death screenshot"],["編成ガチャ","Roster gacha"],["この個体で決定","Confirm this animal"],["ガチャ結果をキャンセル","Cancel gacha result"],["編成数を選択","Choose roster size"],["ガチャを引く","Draw"],["もう一度引く","Reroll"],["抽選済み候補","Drawn candidates"],["抽選結果：","Draw result: "],["引いた候補から選択","Choose from your draws"],["この個体を採用","Recruit this animal"],["選択中の個体で出発","Depart with selected animal"],["操作可能なリーダーを選んでください。","Choose a playable leader."],["名前なし","Unnamed"],["名前：","Name: "],["評価","Grade"],["成長型","Growth type"],["標準成長","Balanced growth"],["追加能力","Bonus abilities"],["ガチャ権","Gacha tickets"],["ガチャ","Gacha"],["基本","Common"],["希少","Rare"],["伝説級","Legendary"],["若い","Young"],["成体","Adult"],["オス","Male"],["メス","Female"],["リーダー","Leader"],["リーダーに指定","Make leader"],["出発前は空き枠を無料で追加できます。","You may fill empty slots for free before departure."],["空き枠に仲間を迎える","Recruit for an empty slot"],["ガチャ権がありません。探索や狩りで獲得してください。","No tickets. Earn them through exploration and hunting."],["巣の近くで補充してください。","Return to a den to add an animal."],["補充できる空き枠がありません。","There are no free roster slots."],["上限に達しています。死亡・野生への放流で枠が空くまで追加できません。","Roster full. Free a slot through death or release."],["操作する動物は1体。ほかは所有一覧から選択できます。","Control one animal at a time; choose from your roster."],["未実装の操作種はリーダーに指定できません。","An unavailable species cannot be leader."],["操作可能な動物がいません。最後のガチャに戻ってください。","No playable animal. Return to your last draw."],["補充にはガチャ権が必要です。探索・狩り・ミッションで獲得できます。","You need tickets earned by exploring, hunting or missions."],["操作する個体を所有一覧から選択してください。","Choose your active animal from the roster."],["操作中1体、ほかはストックです。","One active, the rest are reserves."],["空き枠の＋で動物を選択","Tap + in an empty slot to draw an animal"],["選択中","Selected"],["未実装","Not available"],["現在操作中","Currently active"],["アカギツネ","Red fox"],["ノラネコ","Stray cat"],["オオカミ","Wolf"],["野犬","Feral dog"],["ニホンジカ","Sika deer"],["イノシシ","Wild boar"],["マヌルネコ","Pallas's cat"],["チベットスナギツネ","Tibetan sand fox"],["ハシビロコウ","Shoebill"],["ニホンザル","Japanese macaque"],["ゴリラ","Gorilla"],["ワニ","Crocodile"],["ライオン","Lion"],["ゾウ","Elephant"],["ペンギン","Penguin"],["サイ","Rhinoceros"],["タヌキ","Raccoon dog"],["アナグマ","Badger"],["カラス","Crow"],["ハト","Pigeon"],["カワウソ","Otter"],["コイ","Carp"],["ツキノワグマ","Asian black bear"],["ニホンカモシカ","Japanese serow"],["トラ","Tiger"],["チーター","Cheetah"],["カバ","Hippopotamus"],["キリン","Giraffe"],["シマウマ","Zebra"],["ハイエナ","Hyena"],["リカオン","African wild dog"],["アルマジロ","Armadillo"],["ハリネズミ","Hedgehog"],["アルファウルフ","Alpha wolf"],["大蛇","Giant snake"],["老熊","Old bear"],["巨大イノシシ","Giant boar"],["黒豹","Black panther"],["隻眼の狼","One-eyed wolf"],["白虎","White tiger"],["巨大ハイエナ","Giant hyena"],["巨大ライオン","Giant lion"],["巨大ヘラジカ","Giant moose"],["巨大バッファロー","Giant buffalo"],["巨大ワニ","Giant crocodile"],["巨大カバ","Giant hippopotamus"],["巨大アナコンダ","Giant anaconda"],["巨大オオトカゲ","Giant monitor lizard"],["巨大ゴリラ","Giant gorilla"],["巨大ゾウ","Giant elephant"],["アルビノの狼","Albino wolf"],["大鷲","Giant eagle"],["霞町の廃庁街","Kasumachi civic ruins"],["桜坂駅跡","Sakurazaka Station ruins"],["蔦ヶ丘の古町","Tsutagaoka old town"],["白鷺の獣舎跡","Shirasagi zoo ruins"],["朝霧川の土手","Asagiri River banks"],["楠の森","Camphor Forest"],["汐浜の廃工場","Shiohama factory ruins"],["潮見の水路","Shiomi canal"],["首都高廃線跡","Abandoned expressway"],["山影の地下道入口","Mountain tunnel entrance"],["UFOに捕獲","Abducted by UFO"],["餓死","Starvation"],["毒による衰弱","Poison"],["出血","Bleeding"],["火災","Fire"],["落雷","Lightning"],["洪水","Flood"],["原因不明","Unknown cause"],["の攻撃"," attack"],["死亡","Death"],["生存","Survival"],["探索","Explore"],["地域","Area"],["ゲーム","Game"],["選択","Select"]]);
// Fully authored English phrases. Keep the original Japanese source untouched.
for(const [ja,en] of [["野生に放つ","Release"],["狼","Wolf"],["猫","Cat"],["犬","Dog"],["狐","Fox"],["鹿","Deer"],["猪","Wild boar"],["動物","Animal"],["野良猫","Stray cat"],["早熟","Early bloomer"],["大器晩成","Late bloomer"],["標準成長","Balanced growth"],["成長率","Growth rate"],["好戦的","Aggressive"],["臆病","Timid"],["のんびり","Laid-back"],["温厚","Gentle"],["食料を運んでくる","Brings food"],["能力値","Stats"],["攻","ATK"],["速","SPD"],["持","STA"],["保存されたチェックポイント","Saved checkpoints"],["残った仲間からリーダーを選ぶ","Choose a surviving leader"],["＋を押して最初の動物を選択（無料）","Tap + to get your first animal (free)."],["ゲームが起動できません。ページを再読み込みしてください。","Game failed to start. Reload this page."],["編成画面を読み込めません。再読み込みしてください。","Could not load the roster. Reload this page."],["この動物の専用操作は開発中。編成には採用できますが、現時点ではリーダーに指定できません。","This animal is not yet playable. It can join the roster but cannot be the leader."],["旧セーブの4〜5体は保護中。削除せず、3体未満になるまでガチャ補充できません。","Older saves with 4–5 animals are protected. You cannot draw replacements until fewer than three remain."],["ガチャを引く・編成する","Draw and manage roster"],["追加不可","Unavailable"],["✓ リーダー","✓ Leader"],["✓ 現在操作中","✓ Active"],["個体は1匹ずつ採用。引き直した候補も選べます。操作中1体＋ストック2体で合計3体。死亡した個体は永久に消えます。","Recruit animals one at a time, including previous draws. One active animal and two reserves; death is permanent."],["最初の動物をガチャで獲得。初回＋最大3回引き直せます。","Draw your first animal. You may reroll up to three times."],["最後のガチャに戻る","Back to last draw"],["タイトル画面か巣で空き枠を確認してください。","Check available slots at the title screen or den."],["追加ガチャはタイトル画面か巣でのみ利用できます。巣に戻るかタイトルへ移動してください。","Replacement draws are only available at a den or the title screen."],["ガチャ権が0枚です。獲得方法：続きからプレイ → 獲物8匹・共有経験値600・探索地点2か所・チュートリアル完了で獲得する → タイトルか巣で空き枠の＋を押す。最初の編成は無料です。","No gacha tickets. Earn one by hunting eight animals, gaining 600 shared XP, exploring two locations or completing the tutorial. Then select + at your den or on the title screen. Your first roster is free."],["ガチャ権がありません。探索や狩りで獲得してください。","No tickets. Earn them through exploration and hunting."],["所有情報が変更されました。キャンセルして一覧を更新してください。","Roster changed. Cancel and refresh it."],["放流の保存に失敗しました。再試行するかキャンセルしてください。","Could not save release. Retry or cancel."],["操作するリーダーを選択してください","Choose an active leader."],["この動物の専用操作は開発中","This animal's controls are not yet implemented"],["ゲームパッド操作案内","Controller instructions"],["新規ゲームの設定","New game settings"],["新規ゲーム開始の確認","Confirm new game"],["新規ゲームの操作動物：","Starting animal: "],["ゲーム画面","Game screen"],["移動スティック","Movement stick"],["動物アクション4ボタン","Four animal action buttons"],["もっと広く見る","Zoom out"],["近くを見る","Zoom in"],["入口","Entrance"],["屋内避難所","Indoor shelter"],["建物入口","Building entrance"],["入口方向","Toward entrance"],["人の消えた架空の日本の町で、野生として生き抜く。狩猟・空腹・縄張り・進化を楽しむサバイバルアクション。","Survive as wildlife in a fictional Japanese city abandoned by humans. Hunt, scavenge, build territory and evolve."],["○ 右：食べる・くわえる。短押し食事や備蓄、長押しで運搬・置く・巣強化","○ Right: Eat or carry. Tap to eat/store food; hold to carry, drop or improve the den."],["□ 左：短押しで飛びつき、長押し中はスタミナ消費でダッシュ","□ Left: Tap to pounce; hold to sprint using stamina."],["× 下：ジャンプ","× Down: Jump"],["△ 上：連続攻撃、長押しで5段コンボを自動継続","△ Up: Combo attack; hold for a five-hit chain."],["固有技・本能を使用。種族ごとの狩り方を発動","Use the animal's unique hunting skill."],["現在地・休息地・駅・登れる屋上の地図","Map of your position, resting areas, station and rooftops"],["動物の3Dモデル。指で360度回転・ピンチで拡大縮小","3D animal. Drag to rotate; pinch to zoom."],["年代・地域変動・災害の履歴","History of eras, disasters and regional changes"],["獲得状況・トロフィーの名称と条件","Earned trophies, titles and requirements"],["討伐した動物の一覧","Defeated animal list"],["旧セーブ互換","Compatible with old saves"],["希少素材の能力継承","Inherit abilities from rare materials"],["ゲームパッド操作","Controller controls"],["ゲームパッド操作案内","Controller help"],["ゲームを準備できません。ページを更新してください。","Game could not load. Refresh the page."],["保存した場所から再開","Resumed saved location"],["保存完了：","Saved: "],["現在の状態を自動保存しました","Autosaved."],["自動保存に失敗しました","Autosave failed."],["保存できませんでした。端末の保存容量・設定を確認してください。","Could not save. Check your browser's storage settings."],["ゲームを開始できません。ページを更新して再度お試しください。","Unable to start. Refresh and retry."],["保存データを再開できません。最初からプレイを選んでください。","Unable to resume. Select New Game."],["生存ガイド","Survival guide"],["いまやること","Current task"],["自由探索","Free exploration"],["チュートリアル終了","Tutorial complete"],["目標を見る","Show objective"],["動物","Animal"],["強敵","Boss"],["強敵・","Boss: "],["正体不明の強敵","Unknown boss"],["毒ヘビ","Venomous snake"],["野生の動物","Wild animal"],["骨","Bones"],["死骸","Carcass"],["通常動物","Common wildlife"],["敵","Enemies"],["獲物","Prey"],["仲間","Companion"],["非常に危険","Extreme danger"],["格上","Higher level"],["適正","Appropriate level"],["推奨LV","Recommended Lv."],["未踏の探索地点","Unexplored location"],["確保","Claimed"],["未確保","Unclaimed"],["山麓の森","Foothill forest"],["山腹・渓谷","Mountain slopes and gorge"],["山頂の岩場","Summit rocks"],["山頂洞窟","Summit cave"],["狩り","Hunts"],["共有経験値","Shared XP"],["成長型","Growth pattern"],["成長率","Growth rate"],["餓死","Starvation"],["落雷","Lightning"],["火災","Fire"],["満腹","Full"],["周辺の動物","Nearby animals"],["探索能力","Exploration skills"],["目的地まで約","Distance to target: ~"],["食料を置いた / ○短押しで食べる・長押しで拾う","Dropped food. Tap ○ to eat, hold to pick it up."],["毒ヘビに噛まれた！ 毒状態","Bitten by a venomous snake! Poisoned."],["空腹0：生命が減少中。食べ物を探そう","Starving: health is dropping. Find food."],["狩猟達成：ガチャ権 +1（巣・タイトルで欠員補充）","Hunt completed: +1 ticket (refill at the den or title)."],["狩猟成功 / 食物連鎖が変化する","Hunt successful. The food chain changes."],["持久力不足 / 固有技を出せない","Insufficient stamina for special skill."],["持久力不足 / ジャンプできない","Not enough stamina to jump."],["持久力が足りない","Not enough stamina."],["息切れ / 少し間合いを取れ","Out of breath. Back away to recover."],["食草・肉が近くにない","No edible plants or meat nearby."],["運べる食草・肉が近くにない","No plants or meat to carry."],["巣の備蓄が満杯","Den storage is full."],["死骸に運べる肉が残っていない","No meat left to carry."],["着地してから食べる","Land before eating."],["着地してから置く","Land before dropping food."],["着地してから運ぶ","Land before carrying food."],["屋上に到着","Reached the rooftop."],["霊が離れた。操作を取り戻した","The spirit has left. You are back in control."],["雪が降り始めた。凍った地面では滑る","Snow has started. The ground is slippery."],["遠雷と雨雲が近づいている","Thunder and rain clouds are approaching."],["天候変化：雨","Weather changed: Rain"],["落雷予兆！ 地面の光から離れろ","Lightning incoming! Leave the glowing ground."],["落雷！ ダメージと麻痺","Lightning hit! Damage and stun."],["落雷予兆！ 逃げろ","Lightning incoming! Run!"],["UFOによる動物の誘拐（","UFO abductions ("],["まだ記録はありません。世界の探索を続けてください。","No records yet. Explore the world to create history."],["未発見の動物","Undiscovered animal"],["未討伐","Not defeated"],["獲得済","Unlocked"],["未獲得","Locked"],["秘密","Secret"],["ブロンズ","Bronze"],["シルバー","Silver"],["ゴールド","Gold"],["登録","Registered"],["種","species"],["匹","animals"],["指で回転・ピンチで拡大縮小。ゲームパッドは右スティックとL/R。","Drag to rotate, pinch to zoom. Controller: right stick and L/R."],["3D描画に非対応のため簡易表示中です。","3D is unavailable; showing a simplified view."],["月齢","Moon age"],["三日月","Crescent"],["新月","New moon"],["満月","Full moon"],["上弦","First quarter"],["下弦","Last quarter"],["春","Spring"],["夏","Summer"],["秋","Autumn"],["冬","Winter"],["晴れ","Clear"],["曇り","Cloudy"],["小雨","Drizzle"],["雨","Rain"],["雪","Snow"],["雷雨","Thunderstorm"],["世界","World"],["季節不明","Unknown season"],["未知の地区","Unknown area"],["地震・倒木","Earthquake / fallen trees"],["河川氾濫","Flooding"],["山火事","Forest fire"],["選択した曲を再生中・次回も保持します","Playing your selected track; choice saved."],["選択を保存しました。右上の♪で音楽をONにできます。","Track saved. Tap ♪ to enable music."],["現在地","Current location"],["現在操作中","Currently active"],["ミッション完了","Mission complete"],["目標を見る","Show objectives"],["言語選択 / Language","Language"],["日本語に切り替え","Switch to Japanese"],["ヤギ","Goat"],["チンパンジー","Chimpanzee"],["ネズミ","Mouse"],["ウサギ","Rabbit"],["ヘビ","Snake"],["毒ヘビ","Venomous snake"],["イタチ","Weasel"],["カエル","Frog"],["アカギツネ","Red fox"],["ノラネコ","Stray cat"],["オオカミ","Wolf"],["ニホンジカ","Sika deer"],["イノシシ","Wild boar"],["チベットスナギツネ","Tibetan sand fox"],["ハシビロコウ","Shoebill"],["マヌルネコ","Pallas's cat"],["狼","Wolf"],["猫","Cat"],["犬","Dog"],["狐","Fox"],["鹿","Deer"],["猪","Wild boar"]])dict.set(ja,en);
const terms=[...dict].sort((a,b)=>b[0].length-a[0].length),storedText=new WeakMap(),storedAttrs=new WeakMap();
let locale="ja",timer=0;
try{if(localStorage.getItem(KEY)==="en")locale="en"}catch(_){}
const dynamic=[
 [/^チュートリアル\s*(\d+)\s*\/\s*(\d+)$/,"Tutorial $1 / $2"],
 [/^\s*([123])枠目・空き\s*$/,"Slot $1: empty"],
 [/^\s*([123])枠目のガチャ\s*$/,"Slot $1 draw"],
 [/^巣\s*LV(\d+)｜運搬\s*(.*)$/,"Den Lv.$1 | Carrying $2"]
];

const formatters=[
 [/^所有する(\d+)体から操作個体を選んで(再開|開始)$/,m=>`Choose one of your ${m[1]} animals to ${m[2]==="再開"?"continue":"start"}`],
 [/^保存した(.+)で再開$/,m=>`Continue as ${translate(m[1])}`],
 [/^所有\s*(\d+)\/(\d+)体｜ガチャ権\s*(\d+)枚。狩り8回・共有経験値600・探索2地点・ミッション完了で獲得。(.*)$/,m=>`Owned ${m[1]}/${m[2]} | Tickets: ${m[3]}. Earn a ticket by 8 hunts, 600 shared XP, 2 explored locations or a completed mission.${m[4]?" "+translate(m[4]):""}`],
 [/^Lv\.(\d+)｜(基本|希少|伝説級)｜([A-D]|S\+?|SS)評価$/,m=>`Lv.${m[1]} | ${translate(m[2])} | Grade ${m[3]}`],
 [/^LV(\d+)・([A-D]|S\+?|SS)評価・(基本|希少|伝説級)$/,m=>`Lv.${m[1]} | Grade ${m[2]} | ${translate(m[3])}`],
 [/^抽選結果：(基本|希少|伝説級)\s*／\s*([A-D]|S\+?|SS)評価$/,m=>`Draw result: ${translate(m[1])} | Grade ${m[2]}`],
 [/^([A-D]|S\+?|SS)評価\s*[　｜・]?\s*(基本|希少|伝説級)$/,m=>`Grade ${m[1]} | ${translate(m[2])}`],
 [/^([A-D]|S\+?|SS)評価$/,m=>`Grade ${m[1]}`],
 [/^(\d+)枠目・空き$/,m=>`Slot ${m[1]}: empty`],
 [/^(\d+)枠目のガチャ(?:を引く)?$/,m=>`Draw for slot ${m[1]}`],
 [/^(\d+)枠目のガチャ\s*残り引き直し\s*(\d+)回$/,m=>`Slot ${m[1]} draw | ${m[2]} rerolls left`],
 [/^(\d+)枠目に採用する個体を確認$/,m=>`Confirm the animal for slot ${m[1]}`],
 [/^この個体を(\d+)枠目に採用$/,m=>`Recruit for slot ${m[1]}`],
 [/^もう一度引く（残り(\d+)回）$/,m=>`Reroll (${m[1]} left)`],
 [/^空き枠ガチャ（残り(\d+)権）$/,m=>`Draw for empty slot (${m[1]} tickets)`],
 [/^ガチャ権：(\d+)枚。生存中は編成を上書きしません。$/,m=>`Tickets: ${m[1]}. Living animals will not be replaced.`],
 [/^所有動物\s*(\d+)\/(\d+)体。操作中1体、ほかはストックです。死亡すると永久に消えます。$/,m=>`Owned ${m[1]}/${m[2]}. One active, others in reserve. Death is permanent.`],
 [/^(基本|希少|伝説級)の抽選個体$/,m=>`${translate(m[1])} draw`],
 [/^([\u3400-\u9fffァ-ヶー]+)\s*[　]([A-D]|S\+?|SS)評価$/,m=>`${translate(m[1])} | Grade ${m[2]}`],
 [/^([\u3400-\u9fffァ-ヶー]+)を野生に放つ$/,m=>`Release ${displayAnimalName(m[1])}`],
 [/^([\u3400-\u9fffァ-ヶー]+)を野生に放ちますか？ この個体は所有に戻せません。野生では強化個体として再登場します。(.*)$/,m=>`Release ${displayAnimalName(m[1])}? This animal can never rejoin the roster and may return stronger in the wild.${m[2]?" "+translate(m[2]):""}`],
 [/^所有\s*(\d+)\/(\d+)体｜ガチャ権\s*(\d+)枚$/,m=>`Owned ${m[1]}/${m[2]} | Tickets: ${m[3]}`],
 [/^ガチャ権：(\d+)枚$/,m=>`Gacha tickets: ${m[1]}`],
 [/^([0-9]+)枠目のガチャを引く$/,m=>`Draw for slot ${m[1]}`],
 [/^([\d.]+)歳$/,m=>`${m[1]} years old`],
 [/^(\d+)年目$/,m=>`Year ${m[1]}`],
 [/^([0-9]+)位$/,m=>`#${m[1]}`],
 [/^チュートリアル\s*(\d+)\s*\/\s*(\d+)$/,m=>`Tutorial ${m[1]} / ${m[2]}`],
 [/^(.+)｜成長率\s*([\d.]+)$/,m=>`${translate(m[1])} | Growth rate ${m[2]}`],
 [/^HP\s*(\d+)\s*\/\s*攻\s*(\d+)\s*\/\s*速\s*(\d+)\s*\/\s*持\s*(\d+)$/,m=>`HP ${m[1]} / ATK ${m[2]} / SPD ${m[3]} / STA ${m[4]}`],
 [/^推奨LV(\d+)｜(非常に危険|格上|適正)$/,m=>`Recommended Lv.${m[1]} | ${translate(m[2])}`],
 [/^強敵・(.+)$/,m=>`Boss: ${translate(m[1])}`],
 [/^登録\s*(\d+)\s*\/\s*(\d+)種$/,m=>`Registered ${m[1]}/${m[2]} species`],
 [/^討伐\s*(\d+)体｜推奨LV(\d+)$/,m=>`Defeated: ${m[1]} | Recommended Lv.${m[2]}`],
 [/^討伐\s*(\d+)体$/,m=>`Defeated: ${m[1]}`],
 [/^世界\s*([\d.]+)年｜(.+)｜記録\s*(\d+)件（地域変動は直近約100年）$/,m=>`World year ${m[1]} | ${translate(m[2])} | ${m[3]} records (recent ~100 years)`],
 [/^獲得\s*(\d+)\s*\/\s*(\d+)\s*｜\s*ブロンズ・シルバー・ゴールド$/,m=>`Unlocked ${m[1]}/${m[2]} | Bronze / Silver / Gold`],
 [/^探索達成：(\d+)／(\d+)点$/,m=>`Exploration completed: ${m[1]}/${m[2]} points`],
 [/^巣 LV(\d+)｜運搬 (.+)｜縄張り (\d+)\/(\d+)(.*)$/,m=>`Den Lv.${m[1]} | Carrying: ${translate(m[2])} | Territory ${m[3]}/${m[4]}${m[5]?" | "+translate(m[5]):""}`],
 [/^目的地まで約(\d+)m$/,m=>`Target ~${m[1]} m away`]
];

function translate(text){
 const raw=String(text),value=raw.trim();
 if(!/[\u3040-\u30ff\u3400-\u9fff]/.test(raw))return raw;
 // Complete formatted text wins over an exact short string or glossary term.
 for(const [regex,format] of formatters){
  const match=value.match(regex);
  if(match)return raw.replace(value,format(match));
 }
 if(dict.has(value)){
  const index=raw.indexOf(value);
  return raw.slice(0,index)+dict.get(value)+raw.slice(index+value.length);
 }
 let translated=raw;
 for(const [regex,replacement] of dynamic)translated=translated.replace(regex,replacement);
 // Stop blindly translating short pieces of sentences:
 // "S評価" -> "SGrade" and "探索2地点" -> "Explore2地点".
 for(const [ja,en] of terms){
  if(ja.length<4||!translated.includes(ja))continue;
  translated=translated.split(ja).join(en);
 }
 return translated;
}

const kana={
 ア:"a",イ:"i",ウ:"u",エ:"e",オ:"o",カ:"ka",キ:"ki",ク:"ku",ケ:"ke",コ:"ko",サ:"sa",シ:"shi",ス:"su",セ:"se",ソ:"so",
 タ:"ta",チ:"chi",ツ:"tsu",テ:"te",ト:"to",ナ:"na",ニ:"ni",ヌ:"nu",ネ:"ne",ノ:"no",
 ハ:"ha",ヒ:"hi",フ:"fu",ヘ:"he",ホ:"ho",マ:"ma",ミ:"mi",ム:"mu",メ:"me",モ:"mo",ヤ:"ya",ユ:"yu",ヨ:"yo",
 ラ:"ra",リ:"ri",ル:"ru",レ:"re",ロ:"ro",ワ:"wa",ヲ:"o",ン:"n",
 ガ:"ga",ギ:"gi",グ:"gu",ゲ:"ge",ゴ:"go",ザ:"za",ジ:"ji",ズ:"zu",ゼ:"ze",ゾ:"zo",
 ダ:"da",ヂ:"ji",ヅ:"zu",デ:"de",ド:"do",バ:"ba",ビ:"bi",ブ:"bu",ベ:"be",ボ:"bo",パ:"pa",ピ:"pi",プ:"pu",ペ:"pe",ポ:"po",
 キャ:"kya",キュ:"kyu",キョ:"kyo",シャ:"sha",シュ:"shu",ショ:"sho",チャ:"cha",チュ:"chu",チョ:"cho",
 ニャ:"nya",ニュ:"nyu",ニョ:"nyo",ヒャ:"hya",ヒュ:"hyu",ヒョ:"hyo",ミャ:"mya",ミュ:"myu",ミョ:"myo",
 リャ:"rya",リュ:"ryu",リョ:"ryo",ギャ:"gya",ギュ:"gyu",ギョ:"gyo",ジャ:"ja",ジュ:"ju",ジョ:"jo",
 ビャ:"bya",ビュ:"byu",ビョ:"byo",ピャ:"pya",ピュ:"pyu",ピョ:"pyo"
};
function displayAnimalName(v){
 const s=String(v||"");
 if(dict.has(s))return dict.get(s);
 if(!/^[ァ-ヶー]{2,24}$/.test(s))return s;
 let result="",small=false;
 for(let i=0;i<s.length;i++){
  const ch=s[i],digraph=s.slice(i,i+2);
  if(ch==="ッ"){small=true;continue}
  if(ch==="ー"){const last=result.match(/[aeiou][^aeiou]*$/);if(last)result+=last[0][0];continue}
  const sound=kana[digraph]?(i++,kana[digraph]):kana[ch];
  if(!sound)return s;
  result+=(small?sound[0]:"")+sound;small=false;
 }
 return result[0]?.toUpperCase()+result.slice(1);
}

function textNode(n){
 if(n.nodeType!==3||!n.parentElement||/^(SCRIPT|STYLE|TEXTAREA)$/.test(n.parentElement.tagName)||n.parentElement.closest("[contenteditable=true]"))return;
 const old=storedText.get(n),raw=n.nodeValue;
 if(locale==="ja"){if(old&&raw===old.en)n.nodeValue=old.ja;return}
 if(old&&raw===old.en)return;
 const nameLabel=n.parentElement.classList?.contains("squad-individual-name");
 const en=nameLabel&&/^[ァ-ヶー]{2,24}$/.test(raw)?displayAnimalName(raw):translate(raw);
 if(raw!==en){storedText.set(n,{ja:raw,en});n.nodeValue=en}
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