(()=>{
"use strict";
const KEY="wild-reclaim-language-v1",dict=new Map([["人の消えた日本の町。","A Japanese town without people."],["支配者になったのは、飢えた野生だった。","Hungry wildlife now rules the streets."],["続きからプレイ","Continue"],["下の動物をタップして選択","Tap an animal below to select"],["保存したゲームから再開","Resume saved game"],["所有動物（操作1体＋ストック2体）","Owned animals (1 active + 2 reserves)"],["所有動物と操作キャラの選択","Owned animals and active character"],["空き枠の＋で動物を選択","Tap + to choose an animal"],["所有動物","Owned animals"],["操作中","Active"],["ストック","Reserve"],["空き枠","Empty slot"],["タップして選択","Tap to select"],["この個体を操作","Play as this animal"],["野生に放つ","Release into the wild"],["放流を確定","Confirm release"],["野生に放ちますか？","Release this animal?"],["この個体は所有に戻せません。","This animal can never return to your roster."],["野生では強化個体として再登場します。","It may return as stronger wildlife."],["最後の個体なので次はガチャから再出発します。","This is your last animal. Your next run will start with gacha."],["生存中の個体は破棄できません。","You cannot discard a living animal."],["図鑑","Bestiary"],["年表","Timeline"],["世界年表","World timeline"],["トロフィー","Trophies"],["獲得","Unlocked"],["画面設定と探索記録","Display settings and exploration records"],["ゲームパッド操作","Controller controls"],["選択中：最初の項目","Selected: first item"],["画面の向きを選択","Choose screen orientation"],["プレイ画面の向き","Screen orientation"],["縦画面","Portrait"],["横画面","Landscape"],["縦に持って遊ぶ","Play upright"],["横に持って遊ぶ","Play sideways"],["✓ 選択中","✓ Selected"],["縦画面に戻す","Switch to portrait"],["横画面にする","Switch to landscape"],["ゲームをリセットして新規で開始する","Reset and start a new game"],["ゲームをリセットして新規で開始しますか？現在の編成と自動セーブは消えます。チュートリアルの完了記録は残ります。","Reset and start a new game? Your roster and autosave will be erased. Tutorial progress remains."],["選んだ動物で新しく開始","Start with selected animal"],["現在の自動保存データを上書きし、","Your autosave will be replaced. Start as "],["で新しく開始します。チェックポイントは残ります。","? Checkpoints remain."],["キャンセル","Cancel"],["リセットする","Reset"],["閉じる","Close"],["戻る","Back"],["次へ","Next"],["リトライ","Retry"],["最初から","New game"],["タイトルに戻る","Return to title"],["ゲームを一時停止","Pause game"],["ポーズ","Pause"],["廃都は、あなたが動くのを待っている。","The abandoned city waits for your next move."],["生存を再開する","Resume survival"],["チェックポイントを記録","Save checkpoint"],["タイトルに戻る（自動保存）","Return to title (autosave)"],["BGMを選択","Choose BGM"],["BGM音量","BGM volume"],["デフォルト｜環境連動","Default | Adaptive ambience"],["廃都の残響｜静かなピアノ","City Echoes | Quiet Piano"],["深緑の息吹｜自然と弦","Forest Breath | Strings"],["獣の足音｜緊迫の低音","Wild Footsteps | Tense Bass"],["夜明けの地平｜広がる旋律","Dawn Horizon | Expansive Melody"],["ポーズ中に試聴できます。選択は保存されます。","Preview during pause. Your selection is saved."],["音楽の切替","Toggle music"],["最大化","Fullscreen"],["生命","Health"],["空腹","Hunger"],["持久","Stamina"],["獲物を狩って進化","Hunt prey to evolve"],["備蓄","Supplies"],["巣の備蓄","Den supplies"],["巣の食料庫","Den pantry"],["巣に戻ると備蓄を食べられます。","Return to the den to eat stored food."],["運搬","Carrying"],["縄張り","Territory"],["持久力","Stamina"],["なし","None"],["合計","Total"],["巣","Den"],["食べる","Eat"],["くわえる","Carry"],["置く","Drop"],["飛びつき","Pounce"],["ダッシュ","Dash"],["ジャンプ","Jump"],["固有技","Special skill"],["潜伏","Sneak"],["潜伏中","Hidden"],["食事","Eat"],["攻撃","Attack"],["速度","Speed"],["回復","Recovery"],["強化","Upgrade"],["周辺地図と生存記録","Nearby map and survival record"],["廃都の地図","World map"],["地図を閉じる","Close map"],["今いる場所と立ち寄れる場所","Your location and points of interest"],["探索で生存能力が解放されます","Explore to unlock survival abilities"],["目標を閉じる","Close objective"],["探索依頼","Explore quest"],["チュートリアル","Tutorial"],["ミッション","Mission"],["生存目標","Survival objective"],["食料を確保せよ","Find food"],["近くの食料を探して食べる","Find nearby food and eat it"],["次の目的：身を隠せ","Next: hide"],["次の目的：","Next objective: "],["目標を探索中","Searching for target"],["強敵接近","Boss approaching"],["危険な気配","Danger nearby"],["攻撃範囲を見極めろ","Watch for incoming attacks"],["落雷予兆！ 逃げろ","Lightning incoming! Run!"],["落雷！","Lightning strike!"],["進化の時","Time to evolve"],["本能が変異する。ひとつ選べ。","Your instincts are changing. Choose one."],["鋭利な牙","Sharp fangs"],["攻撃力 +25%","Attack +25%"],["野生の脚","Wild legs"],["移動速度 +15%","Movement speed +15%"],["強靭な肉体","Resilient body"],["最大生命 +30 / 回復","Max health +30 / heal"],["死んでしまった","You died"],["命を落としました。残る仲間がいれば引き継げます。","Your animal died. Continue as a survivor."],["生き延びた！","You survived!"],["生存記録を残しました。","Your survival record was saved."],["生存の記録","Survival record"],["ハイスコア！","New high score!"],["歴代TOP5","Top 5 records"],["この端末","This device"],["リトライ（同じ動物）","Retry (same animal)"],["新しいガチャ編成","New gacha roster"],["仲間から新リーダーを選択","Choose a new leader"],["画像を保存","Save image"],["Xで共有","Share to X"],["死亡スクショ","Death screenshot"],["編成ガチャ","Roster gacha"],["この個体で決定","Confirm this animal"],["ガチャ結果をキャンセル","Cancel gacha result"],["編成数を選択","Choose roster size"],["ガチャを引く","Draw"],["もう一度引く","Reroll"],["抽選済み候補","Drawn candidates"],["抽選結果：","Draw result: "],["引いた候補から選択","Choose from your draws"],["この個体を採用","Recruit this animal"],["選択中の個体で出発","Depart with selected animal"],["操作可能なリーダーを選んでください。","Choose a playable leader."],["名前なし","Unnamed"],["名前：","Name: "],["評価","Grade"],["成長型","Growth type"],["標準成長","Balanced growth"],["追加能力","Bonus abilities"],["ガチャ権","Gacha tickets"],["ガチャ","Gacha"],["基本","Common"],["希少","Rare"],["伝説級","Legendary"],["若い","Young"],["成体","Adult"],["オス","Male"],["メス","Female"],["リーダー","Leader"],["リーダーに指定","Make leader"],["出発前は空き枠を無料で追加できます。","You may fill empty slots for free before departure."],["空き枠に仲間を迎える","Recruit for an empty slot"],["ガチャ権がありません。探索や狩りで獲得してください。","No tickets. Earn them through exploration and hunting."],["巣の近くで補充してください。","Return to a den to add an animal."],["補充できる空き枠がありません。","There are no free roster slots."],["上限に達しています。死亡・野生への放流で枠が空くまで追加できません。","Roster full. Free a slot through death or release."],["操作する動物は1体。ほかは所有一覧から選択できます。","Control one animal at a time; choose from your roster."],["未実装の操作種はリーダーに指定できません。","An unavailable species cannot be leader."],["操作可能な動物がいません。最後のガチャに戻ってください。","No playable animal. Return to your last draw."],["補充にはガチャ権が必要です。探索・狩り・ミッションで獲得できます。","You need tickets earned by exploring, hunting or missions."],["操作する個体を所有一覧から選択してください。","Choose your active animal from the roster."],["操作中1体、ほかはストックです。","One active, the rest are reserves."],["空き枠の＋で動物を選択","Tap + in an empty slot to draw an animal"],["選択中","Selected"],["未実装","Not available"],["現在操作中","Currently active"],["アカギツネ","Red fox"],["ノラネコ","Stray cat"],["オオカミ","Wolf"],["野犬","Feral dog"],["ニホンジカ","Sika deer"],["イノシシ","Wild boar"],["マヌルネコ","Pallas's cat"],["チベットスナギツネ","Tibetan sand fox"],["ハシビロコウ","Shoebill"],["ニホンザル","Japanese macaque"],["ゴリラ","Gorilla"],["ワニ","Crocodile"],["ライオン","Lion"],["ゾウ","Elephant"],["ペンギン","Penguin"],["サイ","Rhinoceros"],["タヌキ","Raccoon dog"],["アナグマ","Badger"],["カラス","Crow"],["ハト","Pigeon"],["カワウソ","Otter"],["コイ","Carp"],["ツキノワグマ","Asian black bear"],["ニホンカモシカ","Japanese serow"],["トラ","Tiger"],["チーター","Cheetah"],["カバ","Hippopotamus"],["キリン","Giraffe"],["シマウマ","Zebra"],["ハイエナ","Hyena"],["リカオン","African wild dog"],["アルマジロ","Armadillo"],["ハリネズミ","Hedgehog"],["アルファウルフ","Alpha wolf"],["大蛇","Giant snake"],["老熊","Old bear"],["巨大イノシシ","Giant boar"],["黒豹","Black panther"],["隻眼の狼","One-eyed wolf"],["白虎","White tiger"],["巨大ハイエナ","Giant hyena"],["巨大ライオン","Giant lion"],["巨大ヘラジカ","Giant moose"],["巨大バッファロー","Giant buffalo"],["巨大ワニ","Giant crocodile"],["巨大カバ","Giant hippopotamus"],["巨大アナコンダ","Giant anaconda"],["巨大オオトカゲ","Giant monitor lizard"],["巨大ゴリラ","Giant gorilla"],["巨大ゾウ","Giant elephant"],["アルビノの狼","Albino wolf"],["大鷲","Giant eagle"],["霞町の廃庁街","Kasumachi civic ruins"],["桜坂駅跡","Sakurazaka Station ruins"],["蔦ヶ丘の古町","Tsutagaoka old town"],["白鷺の獣舎跡","Shirasagi zoo ruins"],["朝霧川の土手","Asagiri River banks"],["楠の森","Camphor Forest"],["汐浜の廃工場","Shiohama factory ruins"],["潮見の水路","Shiomi canal"],["首都高廃線跡","Abandoned expressway"],["山影の地下道入口","Mountain tunnel entrance"],["UFOに捕獲","Abducted by UFO"],["餓死","Starvation"],["毒による衰弱","Poison"],["出血","Bleeding"],["火災","Fire"],["落雷","Lightning"],["洪水","Flood"],["原因不明","Unknown cause"],["の攻撃"," attack"],["死亡","Death"],["生存","Survival"],["探索","Explore"],["地域","Area"],["ゲーム","Game"],["選択","Select"]]);
// Fully authored English phrases. Keep the original Japanese source untouched.
for(const [ja,en] of [["野生に放つ","Release"],["狼","Wolf"],["猫","Cat"],["犬","Dog"],["狐","Fox"],["鹿","Deer"],["猪","Wild boar"],["動物","Animal"],["野良猫","Stray cat"],["早熟","Early bloomer"],["大器晩成","Late bloomer"],["標準成長","Balanced growth"],["成長率","Growth rate"],["好戦的","Aggressive"],["臆病","Timid"],["のんびり","Laid-back"],["温厚","Gentle"],["食料を運んでくる","Brings food"],["能力値","Stats"],["攻","ATK"],["速","SPD"],["持","STA"],["保存されたチェックポイント","Saved checkpoints"],["残った仲間からリーダーを選ぶ","Choose a surviving leader"],["＋を押して最初の動物を選択（無料）","Tap + to get your first animal (free)."],["ゲームが起動できません。ページを再読み込みしてください。","Game failed to start. Reload this page."],["編成画面を読み込めません。再読み込みしてください。","Could not load the roster. Reload this page."],["この動物の専用操作は開発中。編成には採用できますが、現時点ではリーダーに指定できません。","This animal is not yet playable. It can join the roster but cannot be the leader."],["旧セーブの4〜5体は保護中。削除せず、3体未満になるまでガチャ補充できません。","Older saves with 4–5 animals are protected. You cannot draw replacements until fewer than three remain."],["ガチャを引く・編成する","Draw and manage roster"],["追加不可","Unavailable"],["✓ リーダー","✓ Leader"],["✓ 現在操作中","✓ Active"],["個体は1匹ずつ採用。引き直した候補も選べます。操作中1体＋ストック2体で合計3体。死亡した個体は永久に消えます。","Recruit animals one at a time, including previous draws. One active animal and two reserves; death is permanent."],["最初の動物をガチャで獲得。初回＋最大3回引き直せます。","Draw your first animal. You may reroll up to three times."],["最後のガチャに戻る","Back to last draw"],["タイトル画面か巣で空き枠を確認してください。","Check available slots at the title screen or den."],["追加ガチャはタイトル画面か巣でのみ利用できます。巣に戻るかタイトルへ移動してください。","Replacement draws are only available at a den or the title screen."],["ガチャ権が0枚です。獲得方法：続きからプレイ → 獲物8匹・共有経験値600・探索地点2か所・チュートリアル完了で獲得する → タイトルか巣で空き枠の＋を押す。最初の編成は無料です。","No gacha tickets. Earn one by hunting eight animals, gaining 600 shared XP, exploring two locations or completing the tutorial. Then select + at your den or on the title screen. Your first roster is free."],["ガチャ権がありません。探索や狩りで獲得してください。","No tickets. Earn them through exploration and hunting."],["所有情報が変更されました。キャンセルして一覧を更新してください。","Roster changed. Cancel and refresh it."],["放流の保存に失敗しました。再試行するかキャンセルしてください。","Could not save release. Retry or cancel."],["操作するリーダーを選択してください","Choose an active leader."],["この動物の専用操作は開発中","This animal's controls are not yet implemented"],["ゲームパッド操作案内","Controller instructions"],["新規ゲームの設定","New game settings"],["新規ゲーム開始の確認","Confirm new game"],["新規ゲームの操作動物：","Starting animal: "],["ゲーム画面","Game screen"],["移動スティック","Movement stick"],["動物アクション4ボタン","Four animal action buttons"],["もっと広く見る","Zoom out"],["近くを見る","Zoom in"],["入口","Entrance"],["屋内避難所","Indoor shelter"],["建物入口","Building entrance"],["入口方向","Toward entrance"],["人の消えた架空の日本の町で、野生として生き抜く。狩猟・空腹・縄張り・進化を楽しむサバイバルアクション。","Survive as wildlife in a fictional Japanese city abandoned by humans. Hunt, scavenge, build territory and evolve."],["○ 右：食べる・くわえる。短押し食事や備蓄、長押しで運搬・置く・巣強化","○ Right: Eat or carry. Tap to eat/store food; hold to carry, drop or improve the den."],["□ 左：短押しで飛びつき、長押し中はスタミナ消費でダッシュ","□ Left: Tap to pounce; hold to sprint using stamina."],["× 下：ジャンプ","× Down: Jump"],["△ 上：連続攻撃、長押しで5段コンボを自動継続","△ Up: Combo attack; hold for a five-hit chain."],["固有技・本能を使用。種族ごとの狩り方を発動","Use the animal's unique hunting skill."],["現在地・休息地・駅・登れる屋上の地図","Map of your position, resting areas, station and rooftops"],["動物の3Dモデル。指で360度回転・ピンチで拡大縮小","3D animal. Drag to rotate; pinch to zoom."],["年代・地域変動・災害の履歴","History of eras, disasters and regional changes"],["獲得状況・トロフィーの名称と条件","Earned trophies, titles and requirements"],["討伐した動物の一覧","Defeated animal list"],["旧セーブ互換","Compatible with old saves"],["希少素材の能力継承","Inherit abilities from rare materials"],["ゲームパッド操作","Controller controls"],["ゲームパッド操作案内","Controller help"],["ゲームを準備できません。ページを更新してください。","Game could not load. Refresh the page."],["保存した場所から再開","Resumed saved location"],["保存完了：","Saved: "],["現在の状態を自動保存しました","Autosaved."],["自動保存に失敗しました","Autosave failed."],["保存できませんでした。端末の保存容量・設定を確認してください。","Could not save. Check your browser's storage settings."],["ゲームを開始できません。ページを更新して再度お試しください。","Unable to start. Refresh and retry."],["保存データを再開できません。最初からプレイを選んでください。","Unable to resume. Select New Game."],["生存ガイド","Survival guide"],["いまやること","Current task"],["自由探索","Free exploration"],["チュートリアル終了","Tutorial complete"],["目標を見る","Show objective"],["動物","Animal"],["強敵","Boss"],["強敵・","Boss: "],["正体不明の強敵","Unknown boss"],["毒ヘビ","Venomous snake"],["野生の動物","Wild animal"],["骨","Bones"],["死骸","Carcass"],["通常動物","Common wildlife"],["敵","Enemies"],["獲物","Prey"],["仲間","Companion"],["非常に危険","Extreme danger"],["格上","Higher level"],["適正","Appropriate level"],["推奨LV","Recommended Lv."],["未踏の探索地点","Unexplored location"],["確保","Claimed"],["未確保","Unclaimed"],["山麓の森","Foothill forest"],["山腹・渓谷","Mountain slopes and gorge"],["山頂の岩場","Summit rocks"],["山頂洞窟","Summit cave"],["狩り","Hunts"],["共有経験値","Shared XP"],["成長型","Growth pattern"],["成長率","Growth rate"],["餓死","Starvation"],["落雷","Lightning"],["火災","Fire"],["満腹","Full"],["周辺の動物","Nearby animals"],["探索能力","Exploration skills"],["目的地まで約","Distance to target: ~"],["食料を置いた / ○短押しで食べる・長押しで拾う","Dropped food. Tap ○ to eat, hold to pick it up."],["毒ヘビに噛まれた！ 毒状態","Bitten by a venomous snake! Poisoned."],["空腹0：生命が減少中。食べ物を探そう","Starving: health is dropping. Find food."],["狩猟達成：ガチャ権 +1（巣・タイトルで欠員補充）","Hunt completed: +1 ticket (refill at the den or title)."],["狩猟成功 / 食物連鎖が変化する","Hunt successful. The food chain changes."],["持久力不足 / 固有技を出せない","Insufficient stamina for special skill."],["持久力不足 / ジャンプできない","Not enough stamina to jump."],["持久力が足りない","Not enough stamina."],["息切れ / 少し間合いを取れ","Out of breath. Back away to recover."],["食草・肉が近くにない","No edible plants or meat nearby."],["運べる食草・肉が近くにない","No plants or meat to carry."],["巣の備蓄が満杯","Den storage is full."],["死骸に運べる肉が残っていない","No meat left to carry."],["着地してから食べる","Land before eating."],["着地してから置く","Land before dropping food."],["着地してから運ぶ","Land before carrying food."],["屋上に到着","Reached the rooftop."],["霊が離れた。操作を取り戻した","The spirit has left. You are back in control."],["雪が降り始めた。凍った地面では滑る","Snow has started. The ground is slippery."],["遠雷と雨雲が近づいている","Thunder and rain clouds are approaching."],["天候変化：雨","Weather changed: Rain"],["落雷予兆！ 地面の光から離れろ","Lightning incoming! Leave the glowing ground."],["落雷！ ダメージと麻痺","Lightning hit! Damage and stun."],["落雷予兆！ 逃げろ","Lightning incoming! Run!"],["UFOによる動物の誘拐（","UFO abductions ("],["まだ記録はありません。世界の探索を続けてください。","No records yet. Explore the world to create history."],["未発見の動物","Undiscovered animal"],["未討伐","Not defeated"],["獲得済","Unlocked"],["未獲得","Locked"],["秘密","Secret"],["ブロンズ","Bronze"],["シルバー","Silver"],["ゴールド","Gold"],["登録","Registered"],["種","species"],["匹","animals"],["指で回転・ピンチで拡大縮小。ゲームパッドは右スティックとL/R。","Drag to rotate, pinch to zoom. Controller: right stick and L/R."],["3D描画に非対応のため簡易表示中です。","3D is unavailable; showing a simplified view."],["月齢","Moon age"],["三日月","Crescent"],["新月","New moon"],["満月","Full moon"],["上弦","First quarter"],["下弦","Last quarter"],["春","Spring"],["夏","Summer"],["秋","Autumn"],["冬","Winter"],["晴れ","Clear"],["曇り","Cloudy"],["小雨","Drizzle"],["雨","Rain"],["雪","Snow"],["雷雨","Thunderstorm"],["世界","World"],["季節不明","Unknown season"],["未知の地区","Unknown area"],["地震・倒木","Earthquake / fallen trees"],["河川氾濫","Flooding"],["山火事","Forest fire"],["選択した曲を再生中・次回も保持します","Playing your selected track; choice saved."],["選択を保存しました。右上の♪で音楽をONにできます。","Track saved. Tap ♪ to enable music."],["現在地","Current location"],["現在操作中","Currently active"],["ミッション完了","Mission complete"],["目標を見る","Show objectives"],["言語選択 / Language","Language"],["日本語に切り替え","Switch to Japanese"],["ヤギ","Goat"],["チンパンジー","Chimpanzee"],["ネズミ","Mouse"],["ウサギ","Rabbit"],["ヘビ","Snake"],["毒ヘビ","Venomous snake"],["イタチ","Weasel"],["カエル","Frog"],["アカギツネ","Red fox"],["ノラネコ","Stray cat"],["オオカミ","Wolf"],["ニホンジカ","Sika deer"],["イノシシ","Wild boar"],["チベットスナギツネ","Tibetan sand fox"],["ハシビロコウ","Shoebill"],["マヌルネコ","Pallas's cat"],["狼","Wolf"],["猫","Cat"],["犬","Dog"],["狐","Fox"],["鹿","Deer"],["猪","Wild boar"]])dict.set(ja,en);
for(const [ja,en] of [["登録 ","Registered "],["動物図鑑　","Animal bestiary: "],["野生のキツネ","Wild fox"],["シカ","Deer"],["討伐 ","Defeated "],["不明","Unknown"],["季節不明","Unknown season"],["落雷の記録","Lightning event"],["災害","Disaster"],["項目を選択してください","Choose an item"],["続きから／最初からプレイ","Continue / New Game"],["新しいゲームを開始","Start a new game"],["チェックポイント一覧","Checkpoint list"],["チェックポイント","Checkpoint"],["動物：","Animal: "],["画面の向き：","Orientation: "],["画面選択","Choose orientation"],["出発地点：","Starting location: "],["項目","Item"],["候補を選択中｜方向キー：変更　×/A：確定　○/B：取消","Choose a candidate | D-pad: change · A: confirm · B: cancel"],["左スティック:移動 右:視点 △/Y:連続攻撃 □/X:飛びつき/長押しダッシュ ○/B:食べる/くわえる ×/A:ジャンプ START:停止","Left stick: move · Right: camera · Y: combo · X: pounce/sprint · B: eat/carry · A: jump · START: pause"],["十字/左スティック:選択 ×/A:決定 ○/B:戻る","D-pad / left stick: select · A: confirm · B: back"],["成長型：","Growth type: "],["（成長率×","(Growth rate ×"],["追加能力：","Bonus skills: "],["選択中との差 ","Difference from selected: "],["能力値","Stats"],["攻","ATK"],["速","SPD"],["持","STA"],["狼","Wolf"],["基本","Common"],["希少","Rare"],["伝説級","Legendary"],["追跡の脚力","Tracking legs"],["移動速度 +8%","Movement speed +8%"],["熊の生命力","Bear vitality"],["最大生命 +28","Max HP +28"],["黒豹の爪","Black panther claws"],["攻撃力 +12%","Attack +12%"],["大鷲の夜目","Eagle night vision"],["夜間の前方視認距離 +22%","Night vision +22%"],["鱗の止血","Scaly protection"],["強敵の出血ダメージ -35%","Boss bleed damage -35%"],["大蛇の脱皮","Giant snake shedding"],["拘束による減速の回復 +50%","Slowdown recovery +50%"],["猪の突進力","Boar charge"],["飛びつき距離 +14%","Pounce range +14%"],["隻眼の奇襲","One-eyed ambush"],["未発見からの攻撃 +20%","Ambush attack +20%"],["白虎の跳躍","White tiger leap"],["ジャンプ移動距離 +16%","Jump distance +16%"],["ハイエナの持久食","Hyena metabolism"],["空腹の減少 -18%","Hunger decay -18%"],["獅子の連撃","Lion combo"],["5段目の攻撃力 +22%","Fifth-hit attack +22%"],["大角の足腰","Heavy antler strength"],["ジャンプ持久力消費 -25%","Jump stamina cost -25%"],["野牛の押し","Buffalo shove"],["攻撃の吹き飛ばし距離 +35%","Knockback distance +35%"],["水辺の活力","Waterfront vitality"],["水辺で持久力回復 +4/秒","Stamina regen +4/s near water"],["河馬の皮膚","Hippo hide"],["水辺で受ける物理ダメージ -14%","Physical damage near water -14%"],["水蛇の柔軟さ","Serpentine flexibility"],["拘束中の移動速度低下を軽減","Less movement slowdown while restrained"],["サイの装甲","Rhino armor"],["受ける物理ダメージ -10%","Incoming physical damage -10%"],["剛腕の威圧","Mighty arms"],["攻撃で敵をひるませる時間 +0.15秒","Enemy stun duration +0.15s"],["巨象の休息","Giant elephant rest"],["安全な巣で生命回復 +1.7/秒","HP recovery +1.7/s in safe den"],["白狼の忍び足","White wolf stealth"],["潜伏移動時の足音 -25%","Sneaking noise -25%"],["強靭な生存力","Survival resilience"],["最大生命 +12","Max HP +12"],["長距離回復","Endurance recovery"],["持久力回復 +3/秒","Stamina regen +3/s"],["草地への適応","Grassland adaptation"],["空腹の進行 -20%","Hunger decay -20%"],["廃都の脚力","Urban agility"],["走力 +5%","Movement speed +5%"],["悪天候への適応","Weather resilience"],["雨の移動減速を軽減","Reduced rain slowdown"],["研ぎ澄まされた本能","Sharpened instinct"],["固有能力の再使用 -15%","Special skill cooldown -15%"],["大型動物の気配が残る獣舎","Animal enclosure with traces of large wildlife"],["新たな水場と野鳥の生息地","New watering areas and bird habitats"],["食料は豊富だが足元が見えにくい","Plentiful food, but poor footing visibility"],["高い足場と廃機械の残骸","High walkways and broken machinery"],["水路沿いの獣道","Animal tracks beside the canal"],["都市の旧設備から異音が聞こえる","Strange noises from old city facilities"],["霞町・草陰の巣","Kasumachi grass den"],["上野・廃動物園","Ueno zoo ruins"],["潮見の水路・水路跡","Shiomi old canal"],["発見報酬：","Discovery bonus: "],["霞町の野犬","Kasumachi feral dogs"],["桜坂の群れ","Sakurazaka pack"],["蔦ヶ丘のイノシシ","Tsutagaoka wild boars"],["白鷺の獣群","Shirasagi animal herd"],["朝霧川のカラス","Asagiri River crows"],["楠の森の群れ","Camphor Forest pack"],["汐浜の野犬","Shiohama feral dogs"],["潮見の水鳥","Shiomi waterbirds"],["生態系は変化し続けている","Ecosystems continue to evolve"],["草陰のねぐら","Grass hideout"],["森の深い草むら","Deep forest thicket"],["崩れた塀の陰","Behind a collapsed wall"],["廃工場の裏庭","Abandoned factory yard"],["水路脇の葦原","Reeds by the canal"],["高台の屋上","Hilltop roof"],["西の交差点","West intersection"],["東の交差点","East intersection"],["南の高架下","South underpass"],["食草","Edible plants"],["食料を巣に預けてから縄張りを確保","Store food at the den before claiming territory"],["縄張りの確保は巣LV2から","Claim territory after upgrading the den to Lv.2"],["地上に降りてから縄張りを確保","Land before claiming territory"],["縄張りを確保する持久力が不足","Not enough stamina to claim territory"],["敵を追い払ってから○長押し","Drive enemies away, then hold ○"],["縄張りを確保","Territory claimed"],["☠ 毒","☠ Poison"],["以前の最高記録","Previous high score"],["生存記録","Survival record"],["旧データから引き継ぎ","Imported from older records"],["（今回）","(this run)"],["野犬に肉を奪われた！ 地面の肉は拾い直せる","Feral dogs stole your meat. You can pick it up again."],["巣に着地してから強化","Land at your den before upgrading"],["巣の中心に近づいて○長押しで強化","Hold ○ at the center of your den to upgrade"],["巣は最大LV3まで成長済み","Den already at Lv.3"],["地上で食草・肉を運ぶ","Carry food at ground level"],["能力継承には巣LV2が必要","Ability inheritance requires den Lv.2"],["この能力は継承済み","Already inherited"],["必要な希少素材がありません","Required rare material missing"],["編成仲間はガチャで決定します","Roster members come from gacha"],["巣LV2で仲間を迎えられます","Unlock companions at den Lv.2"],["仲間はすでに同行中","A companion is already following"],["仲間には肉24ptが必要","A companion costs 24 meat points"],["周辺の動物が多い。少し時間を置こう","Too many animals nearby. Try later."],["巣の周囲に仲間が立てる場所がない","No space around the den for a companion"],["仲間が加わった！ 一緒に移動し、戦闘を援護する","A companion has joined and will help fight"],["食べたい種類を選んでください。選択しなければ減りません。","Choose food to eat. Nothing is consumed until selected."],["巣の外では閲覧のみ。食べるには巣へ戻ってください。","Outside the den you can only browse supplies. Return to eat."],["巣LV2で解放。強敵の希少素材を1個消費して能力を継承。","Unlock at den Lv.2; spend one rare boss material to inherit an ability."],["強敵の希少素材1個で1能力を継承（各能力1回）。","Spend one rare boss material to inherit each ability once."],["満腹で体力も最大です","Already full and at maximum health"],["その食料はありません","That food is unavailable"],["達成報酬：ガチャ権 +1（巣・タイトルで空き枠補充）","Objective complete: +1 ticket (refill at a den or title)."],["巣へ食料を運び、○で備蓄","Bring food to your den and press ○ to store"],["群れに囲まれた！ 距離と遮蔽物で回避","Surrounded by a pack! Escape using cover and distance."],["仲間が倒れた","A companion has fallen"],["屋上に到着","Reached a rooftop"],["霊が離れた。操作を取り戻した","The spirit left. Your controls are back."],["空腹に注意","Watch hunger"],["飢餓：生命 -2.4/秒","Starvation: HP -2.4/s"],["長押し強化","Hold to upgrade"],["食べる/置く","Eat / Drop"],["長押し運ぶ","Hold to carry"],["食料庫","Pantry"],["行動","Interact"],["屋内","Indoors"],["未踏の探索地点","Unexplored location"],["確保 ","Claimed "],["未確保 ","Unclaimed "],["山麓の森","Foothill forest"],["山腹・渓谷","Mountain slopes and gorge"],["山頂の岩場","Summit rocks"],["山頂洞窟","Summit cave"],["3D描画を開始できないため2D表示中です","3D rendering failed. Showing 2D mode."],["端末の自動回転をONにして横向きにしてください。","Enable auto-rotate and turn your device sideways."],["録画","Record"],["新規ゲームの操作動物：","New game animal: "]])dict.set(ja,en);
for(const [ja,en] of [["食草か肉を食べよう","Eat plants or meat"],["近くの食草・肉を食べる / ○・E","Eat nearby food with ○ / E"],["身を隠せ","Hide"],["緑の茂みで身を隠す","Hide in green bushes"],["緑の葉がある茂みに入って約1秒止まる","Stand still in green bushes for one second"],["獲物を仕留めろ","Hunt your first prey"],["獲物に近づいて攻撃 / ×・J","Approach prey and attack with × / J"],["巣に食料を備蓄しよう","Store food at your den"],["食草か肉を運んで巣に備蓄し、巣を強化する","Carry food to the den and upgrade it"],["巣をLV2に強化","Upgrade den to Lv.2"],["食料をくわえて巣へ持ち帰ろう","Carry food back to your den"],["食料を巣に預けよう","Store food at your den"],["巣で○短押し","Tap ○ at your den"],["食料を運んで備蓄","Carry and store food"],["縄張りを1か所確保せよ","Claim one territory"],["地図の縄張り標識で○長押し。周囲の敵に注意","Hold ○ at a territory marker. Beware of enemies."],["探索地点を2か所発見せよ","Discover two exploration sites"],["地図の未発見地点を訪れ、生存能力を得る","Visit undiscovered sites to unlock abilities"],["探索を続ける","Keep exploring"],["探索・狩猟・巣の発展","Explore, hunt and develop your den"],["食事をする","Eat food"],["食べ物に近づき、○を押す。","Approach food and press ○."],["食べると空腹が回復する。","Eating restores hunger."],["茂みに隠れる","Hide in bushes"],["緑の草むらに入り、少し止まる。","Enter green bushes and stay still."],["隠れると体が薄くなる。","Your body becomes translucent when hidden."],["獲物を狩る","Hunt prey"],["△で攻撃、□で飛びつく。","Press △ to attack and □ to pounce."],["獲物を仕留めて肉を得る。","Defeat prey to obtain meat."],["巣の作り方","Building a den"],["食草・肉で○長押しして運ぶ。","Hold ○ near food to carry it."],["巣の中心で○短押しして備蓄し、○長押しでLV2に強化。","Tap ○ at the den center to store food; hold ○ to upgrade to Lv.2."],["巣に備蓄する","Stock the den"],["食料を○長押しで運ぶ。","Hold ○ to carry food."],["巣に戻り、○で預ける。","Return to the den and press ○ to store food."],["縄張りを取る","Claim territory"],["標識で○長押し。","Hold ○ at the marker."],["巣の安全性が上がる。","The den becomes safer."],["探索地点を見つける","Discover locations"],["未発見の地点を2か所訪れる。","Visit two undiscovered locations."],["最後の目標へ進む。","Proceed to the final objective."],["探索依頼に挑む","Take exploration challenges"],["狩りや食事、未発見の場所を巡り、報酬を獲得する。","Hunt, eat and visit unknown places to earn rewards."],["各依頼を達成して、巣と群れを守る。","Complete challenges to protect your den and group."],["食物連鎖の狩人","Food-chain hunter"],["冬を越す食料確保","Food for winter"],["街道踏破","Road expedition"],["未知の場所を発見","Discover an unknown location"],["世界の時を生きる","Survive through time"],["野生動物を2匹狩る","Hunt two wild animals"],["食草・肉を3回食べる","Eat food three times"],["世界を歩いて32歩分の距離を踏破","Travel 32 steps through the world"],["まだ見つけていない探索地点へ行く","Visit an undiscovered site"],["現実時間90秒を生き抜く","Survive 90 real-world seconds"],["報酬：得点・体力・食料","Rewards: score, health and food"],["① 食草・肉のそばで○長押しして運ぶ","① Hold ○ near plants or meat to carry it"],["② ここで○を押して備蓄","② Press ○ here to store food"],["② 巣の中心へ戻り○で備蓄（短押し・長押し可）","② Return to den center and press ○ to store food"],["（巣に1回預けたら完了）","(Store food once to finish)"],["青い「建物入口」へ進むと雨宿りできます（ボタン不要）","Walk through the blue building entrance to shelter from rain. No button needed."],["青い「建物入口」から歩いて入れます（ボタン不要）","Walk through the blue building entrance. No button needed."],["緑の茂みの中で約1秒止まろう","Stay in green bushes for one second"],["獲物を△で狩ろう。□で飛びつき","Hunt with △. Pounce with □."],["伏撃：しゃがみ・岩陰からの初撃が強力","Ambush: first attack is stronger from cover or while crouching"],["小動物を探して急襲｜肉・腐肉の回復効率＋18%","Rush small prey | Meat and carrion heal 18% more"],["構えて嘴の高速突き","Rapid beak thrust after aiming"],["チュートリアル 4 / 4・巣に備蓄","Tutorial 4 / 4 | Store food"],["生存目標 2 / 3","Survival objective 2 / 3"],["生存目標 3 / 3","Survival objective 3 / 3"],["噛み傷で出血！","Bite wound! Bleeding!"],["つかまれた！","Grabbed!"],["踏みつけと鼻の一撃！","Trampled and struck by a trunk!"],["大鷲の爪！","Giant eagle talons!"],["白狼の急襲！","White wolf ambush!"],["角突進！","Horn charge!"],["水際へ引き込まれる！","Dragged toward the water!"],["水辺の強烈な突進！","Powerful waterfront charge!"],["締め付けで移動低下！","Constricted! Movement slowed!"],["締め付け！ 動きが鈍る","Constricted! Moving slowly."],["咆哮で持久力 -12","Roar: stamina -12"],["吹き飛ばされた！","Knocked back!"],["強烈な一撃！","Heavy strike!"],["見切った！","Dodged!"],["強敵技：","Boss skill: "],["水辺の襲撃 -","Waterfront ambush -"],["水辺の狩り","Water hunt"],["回避成功！","Dodged!"],["投石 -","Stone thrown -"],["石を構えた！","Stone ready!"],["肉を奪われた！","Meat stolen!"],["横取りを回避！","Prevented theft!"],["肉を狙って飛びかかる！","Leaping for meat!"],["道具の投石 -","Tool-assisted stone throw -"],["枝の一撃 -","Branch strike -"],["枝を振り上げた！","Branch raised!"],["大鷲が急降下！","Giant eagle diving!"],["大鷲の爪 -","Eagle claws -"],["大鷲の狩り","Eagle hunt"],["死骸を食べる","Eat carcass"],["水を飲む","Drink water"],["獲物を食べる","Eat prey"],["体当たり -","Body slam -"],["正面の厚い皮で軽減","Thick hide reduced damage"],["固有技を阻止！","Special skill interrupted!"],["体勢を崩した！","Off balance!"],["風下からの奇襲！","Downwind ambush!"],["奇襲成功！","Ambush successful!"],["飛びかかり！","Pounce!"],["よろめき","Stagger"],["低姿勢の伏撃！","Low-stance ambush!"],["小動物への急襲！","Small prey rush!"],["嘴の高速突き！","Rapid beak strike!"],["目覚めた！","Awakened!"],["反撃してくる！","Counterattack!"],["針の反撃","Spine counterattack"],["尾びれの反撃","Tailfin counterattack"],["逃走中の反撃","Counterattack while fleeing"],["反撃をかわした","Dodged counterattack"],["針を立てて反撃！","Spines raised to counterattack!"],["身を守りながら反撃！","Counterattacking defensively!"],["逃げながら反撃！","Counterattacking while fleeing!"],["フェイント！","Feint!"],["飛び逃げ！","Leaping away!"],["群れを守る角突き！","Horn strike to protect the herd!"],["獅子の短距離加速！","Lion sprint burst!"],["チーターの疾走！","Cheetah sprint!"],["狐の跳躍！","Fox leap!"],["反撃！ -","Counterattack! -"],["野生の狩り -","Wild hunt -"],["野生の狩り","Wild hunt"],["仲間の援護 -","Companion assist -"],["仲間が敵を撃退","Companion drove off an enemy"],["仲間 -","Companion -"],["は永久に離脱"," has permanently left"],["は死亡し永久離脱"," died and permanently left"],["激怒！ 攻撃速度が上がる","Enraged! Attack speed increased!"],["瞬間加速！","Speed burst!"],["角突き -","Horn attack -"],["角突きを回避！","Dodged horn attack!"],["角突きの予兆！","Horn attack incoming!"],["噛みつき","Bite"],["後脚蹴り","Rear kick"],["翼の威嚇","Wing threat"],["くちばし","Beak"],["跳ね飛び","Leap away"],["追い詰められた動物が反撃！","Cornered animal fights back!"],["後ろ蹴り","Backward kick"],["角の突き上げ","Upward horn strike"],["後脚の蹴り","Rear-leg kick"],["角突き","Horn strike"],["反撃を回避！","Dodged counterattack!"],["後ろ蹴りの予兆！","Rear kick incoming!"],["鹿の後ろ蹴り！","Deer rear kick!"],["カモシカの角突き！","Serow horn strike!"],["突進！","Charge!"],["投石！","Stone thrown!"],["首と頭の一撃！","Neck-and-head strike!"],["鼻で吹き飛ばされた！","Knocked back by a trunk!"],["カバの体当たり！","Hippo body slam!"],["連撃！","Combo!"],["空振りの隙！","Opening after a missed attack!"],["突進 -","Charge -"],["無傷","Unharmed"],["激突！","Impact!"],["隙！","Opening!"],["突進予兆！","Charge incoming!"],["跳躍予兆！","Leap incoming!"],["危険！","Danger!"],["群れが包囲してくる！","Pack is surrounding you!"],["包囲の威圧！ 持久力 -14","Surrounded! Stamina -14"],["包囲を回避！","Escaped encirclement!"],["全画面にできません。端末を横向きにすると横画面で遊べます。","Fullscreen unavailable. Turn device sideways for landscape."],["全画面にしました。自動回転をONにして端末を横向きにしてください。","Fullscreen enabled. Use auto-rotate and turn sideways."],["縦画面を選択しました。端末を縦にしてください。","Portrait selected. Hold device upright."],["残った仲間からリーダーを選択","Choose a surviving leader"],["この種の操作は未実装です","This species is not yet playable"],["操作できる動物を選んでください","Choose a playable animal"],["編成リーダーを復旧できません","Unable to restore roster leader"],["戦闘中は交代できません","Cannot switch animals during combat"],["選択した動物で操作を再開","Resumed as selected animal"],["リトライ（同じ動物のチェックポイント）","Retry from this animal's checkpoint"],["チェックポイントからリトライ","Retry from checkpoint"],["通しテスト中はチェックポイントを変更しません","Checkpoints cannot change during a test"],["デバッグ通しテスト中：記録は保存しません","Debug test: records are not saved."],["音楽・最大化・一時停止","Music, fullscreen and pause"],["所有動物と操作キャラ","Owned animals and active character"],["死亡スクショとX共有","Death screenshot and X sharing"],["保存された上位5件の記録","Top five saved records"],["縮小","Zoom out"],["拡大","Zoom in"],["ガチャ読込エラー・タップで再読み込み","Unable to load gacha. Tap to retry."],["選択中：","Selected: "],["パッド","Controller"],[" 接続｜"," connected |"],["　｜　×/A：決定　○/B：戻る"," | A: confirm · B: back"]])dict.set(ja,en);
// Supplement the original translation dictionary without changing Japanese gameplay data.
for(const [ja,en] of window.WildI18nPhrases||[])dict.set(ja,en);
const terms=[...dict].sort((a,b)=>b[0].length-a[0].length),storedText=new WeakMap(),storedAttrs=new WeakMap();
let locale="ja";
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
 [/^巣 LV(\d+)｜運搬 (.+)｜縄張り (\d+)\/(\d+)(.*)$/,m=>`Den Lv.${m[1]} | Carrying: ${translate(m[2])} | Territory ${m[3]}/${m[4]}${m[5]?" | "+translate(m[5].replace(/^｜/,"")):""}`],
 [/^目的地まで約(\d+)m$/,m=>`Target ~${m[1]} m away`]
];


const moreFormats=[
 [/^(オス|メス)・(若い|成体)・(.+) ×([\d.]+)$/,m=>`${translate(m[1])} | ${translate(m[2])} | ${translate(m[3])} ×${m[4]}`],
 [/^(オス|メス)・(若い|成体)・(.+)・(.+)$/,m=>`${translate(m[1])} | ${translate(m[2])} | ${translate(m[3])} | ${translate(m[4])}`],
 [/^(.+)\s*／\s*(オス|メス)\s*／\s*(若い|成体)\s*／\s*(.+)$/,m=>`${translate(m[1])} | ${translate(m[2])} | ${translate(m[3])} | ${translate(m[4])}`],
 [/^成長型：(.+)（成長率×([\d.]+)）\s*／\s*LV(\d+)$/,m=>`Growth: ${translate(m[1])} ×${m[2]} | Lv.${m[3]}`],
 [/^追加能力：(.+)$/,m=>`Bonus skills: ${m[1].split("、").map(translate).join(", ")}`],
 [/^HP (\d+)\s*\/\s*攻 (\d+)\s*\/\s*速 (\d+)\s*\/\s*持 (\d+)$/,m=>`HP ${m[1]} / ATK ${m[2]} / SPD ${m[3]} / STA ${m[4]}`],
 [/^HP (\d+)%\s*／\s*攻撃 (\d+)%\s*／\s*速度 (\d+)%\s*／\s*持久 (\d+)%$/,m=>`HP ${m[1]}% / ATK ${m[2]}% / SPD ${m[3]}% / STA ${m[4]}%`],
 [/^HP (\d+)%／能力値 HP (\d+)・攻 (\d+)・速 (\d+)・持 (\d+)$/,m=>`HP ${m[1]}% | Stats: HP ${m[2]} / ATK ${m[3]} / SPD ${m[4]} / STA ${m[5]}`],
 [/^\s*(\d+)枠目のガチャ　残り引き直し (\d+)回$/,m=>`Slot ${m[1]}: ${m[2]} rerolls left`],
 [/^\s*世界([\d.]+)年｜(.+)$/,m=>`World year ${m[1]} | ${translate(m[2])}`],
 [/^\s*登録\s*(\d+)\s*\/\s*(\d+)種$/,m=>`Registered ${m[1]}/${m[2]} species`],
 [/^\s*討伐\s*(\d+)体｜推奨LV(\d+)$/,m=>`Defeated: ${m[1]} | Recommended Lv.${m[2]}`],
 [/^\s*([\d]+)体｜推奨LV(\d+)$/,m=>`${m[1]} defeated | Recommended Lv.${m[2]}`],
 [/^ガチャ権：(\d+)枚。生存中は編成を上書きしません。$/,m=>`Tickets: ${m[1]}. Living animals will not be replaced.`]
];


const additionalFormats=[
 [/^探索依頼\s*(\d+)｜(\d+)\/(\d+)$/,m=>`Exploration quest ${m[1]} | ${m[2]}/${m[3]}`],
 [/^探索達成：(.+)／(\d+)点$/,m=>`Exploration complete: ${translate(m[1])} | +${m[2]} points`],
 [/^探索報酬 \+(\d+)$/,m=>`Exploration reward +${m[1]}`],
 [/^生存目標\s*(\d+)\s*\/\s*(\d+)$/,m=>`Survival objective ${m[1]}/${m[2]}`],
 [/^静止照準\s*(\d+)%｜構えて嘴の高速突き$/,m=>`Stillness aim ${m[1]}% | Rapid beak strike`],
 [/^(\d+)\s*\/\s*(\d+)(?:｜出血\s*(\d+)秒)?(?:｜年齢\s*([\d.]+)歳)?$/,m=>`HP ${m[1]}/${m[2]}${m[3]?" | Bleeding "+m[3]+"s":""}${m[4]?" | Age "+m[4]+"y":""}`],
 [/^(\d+)%｜空腹に注意$/,m=>`${m[1]}% | Low hunger!`],
 [/^(\d+)%｜飢餓：生命 -2\.4\/秒$/,m=>`${m[1]}% | Starving: HP -2.4/s`],
 [/^☠ 毒 (\d+)秒｜生命が減少$/,m=>`☠ Poison ${m[1]}s | HP falling`],
 [/^備蓄\s*(\d+)\s*\/\s*(\d+)pt(?:（LV(\d+)まで・消費なし）|（容量）)?$/,m=>`Supplies ${m[1]}/${m[2]} pt${m[3]?" | to Lv."+m[3]+" (no consumption)":""}`],
 [/^(.+) 月齢 ([\d.]+) · (.+?)(?: · 積雪 (\d+)%)?$/,m=>`${m[1]} Moon age ${m[2]} · ${translate(m[3])}${m[4]?" · Snow "+m[4]+"%":""}`],
 [/^現在地：(.+)｜探索 (\d+)\/(\d+)｜獲物 (\d+)・捕食者 (\d+)｜勢力 (.+)｜(.*)$/,m=>`Location: ${translate(m[1])} | Explore ${m[2]}/${m[3]} | Prey ${m[4]} · Predators ${m[5]} | Pack ${translate(m[6])} | ${translate(m[7])}`],
 [/^周辺の動物 (\d+)匹（獲物 (\d+)・敵 (\d+)）／全域で生存 (\d+)匹。遠方の個体も保持。(.*)$/,m=>`Nearby ${m[1]} (${m[2]} prey, ${m[3]} enemies) | World total ${m[4]}. Distant animals persist.${m[5]?" "+translate(m[5]):""}`],
 [/^(.+)を操作中$/,m=>`Playing as ${translate(m[1])}`],
 [/^(.+)の操作は準備中$/,m=>`${translate(m[1])} controls not ready yet`],
 [/^(.+)が食べ物を持ってきた$/,m=>`${translate(m[1])} brought food`]
];


const extendedFormats=[
 [/^天候変化：(.+)$/,m=>`Weather changed: ${translate(m[1])}`],
 [/^([春夏秋冬])\s*(\d{1,2})月$/,m=>`${translate(m[1])} · Month ${m[2]}`],

 [/^(.+)（(.+)）｜素材 (\d+)個$/,m=>`${translate(m[1])} (${translate(m[2])}) | Materials: ${m[3]}`],
 [/^(.+)｜素材 (\d+)個$/,m=>`${translate(m[1])} | Materials: ${m[2]}`],
 [/^仲間が同行中｜生命 (\d+)\/(\d+)$/,m=>`Companion following | HP ${m[1]}/${m[2]}`],
 [/^(.+) (.+) 必要素材1個、所持(\d+)個$/,m=>`${translate(m[1])}: ${translate(m[2])}. Requires 1 material; owned ${m[3]}`],

 [/^(.+) ボス所有枠$/,m=>`${translate(m[1])} boss roster slot`],
 [/^(.+)（交代(\d+)）$/,m=>`${translate(m[1])} (dominance change ${m[2]})`],
 [/^世界\s*(\d+)年｜(.+)｜探索\s*(\d+)地点｜年表\s*(\d+)件$/,m=>`World year ${m[1]} | ${translate(m[2])} | Discovered ${m[3]} locations | ${m[4]} historical events`],
 [/^現在｜世界\s*(\d+)年（災害・生態変動は記録がある場合のみ表示）$/,m=>`Now | World year ${m[1]} (only recorded disasters and ecosystem changes appear)`],
 [/^(基本|希少|伝説級)（(\d+)種）$/,m=>`${translate(m[1])} (${m[2]} species)`],
 [/^([\u30a0-\u30ff\u3400-\u9fff]+)を野生に放つ$/,m=>`Release ${translate(m[1])} into the wild`],
 [/^([\u30a0-\u30ff\u3400-\u9fff]+)を仲間にしますか？$/,m=>`Recruit ${translate(m[1])}?`],

 [/^世界(\d+)年の目撃者$/,m=>`Witness to world year ${m[1]}`],
 [/^世界が(\d+)年を迎える$/,m=>`Reach world year ${m[1]}`],
 [/^(\d+)回の狩猟$/,m=>`${m[1]} successful hunts`],
 [/^狩猟を(\d+)回成功させる$/,m=>`Successfully hunt ${m[1]} times`],
 [/^進化の足跡 LV(\d+)$/,m=>`Evolution milestone Lv.${m[1]}`],
 [/^LV(\d+)に到達する$/,m=>`Reach level ${m[1]}`],
 [/^探索地点(\d+)か所$/,m=>`Discover ${m[1]} locations`],
 [/^異なる探索地点を(\d+)か所発見する$/,m=>`Discover ${m[1]} distinct locations`],
 [/^(.+)との決着$/,m=>`Showdown with ${translate(m[1])}`],
 [/^(.+)を初めて倒す$/,m=>`Defeat ${translate(m[1])} for the first time`],
 [/^(.+)の目撃者$/,m=>`Witness to ${translate(m[1])}`],
 [/^(.+)の発生現場を目撃する$/,m=>`Witness a ${translate(m[1])} event`],
 [/^(.+)からの生還$/,m=>`Survive ${translate(m[1])}`],
 [/^(.+)の危険範囲から生きて脱出する$/,m=>`Escape the ${translate(m[1])} hazard alive`],
 [/^(.+)の生息記録$/,m=>`${translate(m[1])} sighting`],
 [/^(.+)を目の届く距離で遮蔽物なしに見つける$/,m=>`Spot ${translate(m[1])} at close range without obstacles`],
 [/^(.+)との狩猟に勝利する$/,m=>`Defeat ${translate(m[1])} in a hunt`],
 [/^(.+)の討伐者$/,m=>`${translate(m[1])} slayer`],
 [/^(.+)を強敵として実際に撃破する$/,m=>`Defeat ${translate(m[1])} as a boss`],
 [/^(.+)の操作記録$/,m=>`Played as ${translate(m[1])}`],
 [/^(.+)を所有して実際に操作する$/,m=>`Own and play as ${translate(m[1])}`],
 [/^(.+)の固有技$/,m=>`${translate(m[1])} special ability`],
 [/^(.+)の固有技を持久力を使って発動する$/,m=>`Use ${translate(m[1])}'s special ability with stamina`],
 [/^(.+)の探検記録$/,m=>`Explored ${translate(m[1])}`],
 [/^(.+)へ実際に踏み入る$/,m=>`Enter ${translate(m[1])}`],
 [/^(.+)の狩猟記録$/,m=>`Hunted in ${translate(m[1])}`],
 [/^(.+)で実際に野生動物を仕留める$/,m=>`Hunt a wild animal in ${translate(m[1])}`],
 [/^(.+)を仲間にしますか？$/,m=>`Recruit ${translate(m[1])}?`],
 [/^(.+)：群れの勢力が交代$/,m=>`${translate(m[1])}: pack dominance changed`],
 [/^(.+)から(.+)へ獣群が移動$/,m=>`Wildlife migrated from ${translate(m[1])} to ${translate(m[2])}`],
 [/^(.+) (\d+)pt（(\d+)塊）$/,m=>`${translate(m[1])}: ${m[2]} pt in ${m[3]} portions`],
 [/^共通食料庫から(.+)の肉 (\d+)ptを取り出した$/,m=>`Withdrew ${m[2]} pt of ${translate(m[1])} meat from shared storage`],
 [/^(.+) \/ 生存開始$/,m=>`Survival started at ${translate(m[1])}`],
 [/^不在中に(\d+)回の地域生態変化が起きた$/,m=>`${m[1]} regional ecosystem changes occurred while you were away`],
 [/^この地区に(.+)の気配がある$/,m=>`Signs of ${translate(m[1])} in this district`],
 [/^(.+)は確保済み$/,m=>`${translate(m[1])} is already secured`],
 [/^(.+)を確保！ 巣の休息力が上昇・野犬を牽制$/,m=>`Secured ${translate(m[1])}! Improved den rest and deterred feral dogs.`],
 [/^強敵を討伐：(.+)の希少素材を獲得$/,m=>`Boss defeated! Earned rare material from ${translate(m[1])}`],
 [/^巣の成長には備蓄 (\d+)pt必要（あと(\d+)pt）$/,m=>`Den upgrade requires ${m[1]} pt of supplies (${m[2]} pt short)`],
 [/^巣 LV(\d+)！ 食料は消費せず残ります。上限 (\d+)pt$/,m=>`Den upgraded to Lv.${m[1]}! Food remains untouched. Capacity: ${m[2]} pt.`],
 [/^(.+)を備蓄 \+(\d+)pt（合計 (\d+)pt）$/,m=>`Stored ${translate(m[1])}: +${m[2]} pt (${m[3]} total)`],
 [/^(.+)（(.+)・(\d+)）をくわえた。どの巣でも備蓄可能$/,m=>`Carrying ${translate(m[1])} (${translate(m[2])}, ${m[3]}). Store it at any den.`],
 [/^(.+)を食べた：満腹\+(\d+)・生命\+(\d+)(・出血緩和)?$/,m=>`Ate ${translate(m[1])}: hunger +${m[2]}, HP +${m[3]}${m[4]?", bleeding reduced":""}`],
 [/^(.+)を○長押しで運ぶ$/,m=>`Hold ○ to carry ${translate(m[1])}`],
 [/^(.+)を食べる \/ ○・E$/,m=>`Eat ${translate(m[1])} with ○ / E`],
 [/^獲物を追う \/ △・Jで攻撃$/,m=>`Chase prey and attack with △ / J`],
 [/^(\d+)年：この地域の生態が変化（(.+)）$/,m=>`Year ${m[1]}: ecosystem changed here (${translate(m[2])})`],
 [/^(.+)：異星偵察機の攻撃で(.+)が死亡$/,m=>`${translate(m[2])} died in an alien scout attack at ${translate(m[1])}`],
 [/^(.+)を操作中。移動・攻撃・特殊技を実操作で確認できます$/,m=>`Playing as ${translate(m[1])}. Test movement, attacks and special moves directly.`],
 [/^(.+)のゲーム内動物プレビュー$/,m=>`In-game preview of ${translate(m[1])}`],
 [/^(.+)の抽選個体$/,m=>`Drawn ${translate(m[1])}`],
 [/^(.+)｜(.+)$/,m=>`${translate(m[1])} | ${translate(m[2])}`]
];

function translate(text){
 const raw=String(text),value=raw.trim();
 if(!/[\u3040-\u30ff\u3400-\u9fff]/.test(raw))return raw;
 // Complete formatted text wins over an exact short string or glossary term.
 for(const [regex,format] of [...formatters,...moreFormats,...additionalFormats]){
  const match=value.match(regex);
  if(match)return raw.replace(value,format(match));
 }
 // Exact authored phrases take precedence over generic dynamic patterns.
 if(dict.has(value)){
  const index=raw.indexOf(value);
  return raw.slice(0,index)+dict.get(value)+raw.slice(index+value.length);
 }
 for(const [regex,format] of extendedFormats){
  const match=value.match(regex);
  if(match)return raw.replace(value,format(match));
 }
 let translated=raw;
 for(const [regex,replacement] of dynamic)translated=translated.replace(regex,replacement);
 // Stop blindly translating short pieces of sentences:
 // "S評価" -> "SGrade" and "探索2地点" -> "Explore2地点".
 for(const [ja,en] of terms){
  if(ja.length<4||!translated.includes(ja))continue;
  translated=translated.split(ja).join(en);
 }
 // User-generated katakana names must also be readable in English.
 if(/^[ァ-ヶー]{2,24}$/.test(translated))return displayAnimalName(translated);
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

// Gameplay rewrites these fields on every HUD tick. Use short English copy
// immediately so the portrait HUD does not inflate and overlap other widgets.
function hudEnglish(id,raw){
 if(id==="hp-text"){
  const m=raw.match(/^(\d+)\s*\/\s*(\d+)(?:｜出血\s*(\d+)秒)?(?:｜年齢\s*([\d.]+)歳)?$/);
  if(m)return `${m[1]}/${m[2]}${m[3]?" · Bleed "+m[3]+"s":""}${m[4]?" · Age "+m[4]+"y":""}`;
 }
 if(id==="den-status"){
  const m=raw.match(/^巣\s*LV(\d+)｜運搬\s*(.+)｜縄張り\s*(\d+)\/(\d+)(.*)$/);
  if(m)return `Den ${m[1]} · Carry ${translate(m[2])} · Turf ${m[3]}/${m[4]}${m[5]? " · "+translate(m[5].replace(/^｜/,"")):""}`;
 }
 if(id==="den-stash-count"){
  const m=raw.match(/^備蓄\s*(\d+)\s*\/\s*(\d+)pt(?:（LV(\d+)まで・消費なし）|（容量）)?$/);
  if(m)return `Food ${m[1]}/${m[2]}pt${m[3]?" · Lv"+m[3]+" target":""}`;
 }
 if(id==="species-skill-status"){
  const m=raw.match(/^静止照準\s*(\d+)%｜構えて嘴の高速突き$/);
  if(m)return `Aim ${m[1]}% · Rapid beak`;
 }
 return translate(raw);
}
function textNode(n){
 if(n.nodeType!==3||!n.parentElement||/^(SCRIPT|STYLE|TEXTAREA)$/.test(n.parentElement.tagName)||n.parentElement.closest("[contenteditable=true]"))return;
 const old=storedText.get(n),raw=n.nodeValue;
 if(locale==="ja"){if(old&&raw===old.en)n.nodeValue=old.ja;return}
 if(old&&raw===old.en)return;
 const nameLabel=n.parentElement.classList?.contains("squad-individual-name");
 const en=nameLabel&&/^[ァ-ヶー]{2,24}$/.test(raw)?displayAnimalName(raw):hudEnglish(n.parentElement.id,raw);
 if(raw!==en){storedText.set(n,{ja:raw,en});n.nodeValue=en}
}
function attrs(n){
 if(n.nodeType!==1||/^(SCRIPT|STYLE|TEXTAREA)$/.test(n.tagName))return;
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
   // Keep the Japanese selector legible in English without altering its layout.
   const languageCode=button.querySelector(".flag-code");
   if(languageCode&&button.dataset.lang==="ja")languageCode.textContent=locale==="en"?"JP":"日";
   button.setAttribute("aria-pressed",selected?"true":"false");
   button.classList.toggle("is-selected",selected);
  }
 }
 document.documentElement.lang=locale;
 document.title=document.body?.dataset?.page==="gacha-rates"?(locale==="en"?"Gacha Drop Rates | WILD RECLAIM":"ガチャ排出確率一覧｜WILD RECLAIM"):(locale==="en"?"WILD RECLAIM | Survival in a Lost City":"WILD RECLAIM | 廃都生存記");
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
function flush(){
 if(locale!=="en"){pending.clear();return}
 const nodes=[...pending];pending.clear();
 for(const node of nodes)walk(node);
}
if(typeof MutationObserver!=="undefined"){
 const observer=new MutationObserver(changes=>{
  if(locale!=="en")return;
  for(const m of changes){
   if(m.type==="characterData"||m.type==="attributes")pending.add(m.target);
   else for(const node of m.addedNodes)pending.add(node);
  }
  // MutationObserver runs before browser paint. Never show a Japanese frame
  // during the 55ms timer used by the previous implementation.
  if(pending.size)flush();
 });
 observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["aria-label","title","placeholder"]});
}
refresh();
// On-demand visible-string audit for translators and regression tests.
 function auditVisible(){
  const remaining=new Set();
  const addText=value=>{const text=String(value||"").trim();if(text&&/[\u3040-\u30ff\u3400-\u9fff]/.test(text))remaining.add(text.slice(0,180));};
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
  for(let node=walker.nextNode();node;node=walker.nextNode()){
   if(node.nodeType===3){
    const parent=node.parentElement;
    if(parent&&!/^(SCRIPT|STYLE|TEXTAREA)$/.test(parent.tagName)&&!parent.closest(".hidden,[hidden]"))addText(node.nodeValue);
   }else if(node.nodeType===1&&!node.closest(".hidden,[hidden]")){
    for(const key of ["aria-label","title","placeholder"])if(node.hasAttribute(key))addText(node.getAttribute(key));
   }
  }
  return [...remaining];
 }
 window.WildI18n={setLanguage,translate,displayAnimalName,refresh,auditVisible,get locale(){return locale}};
})();