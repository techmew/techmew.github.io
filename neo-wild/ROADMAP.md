## 共同スプリント・次担当｜2026/11/02 10:45 JST｜45分枠｜ACTIVE_SPRINT_ID=DEN-REFUGE-SIX-AND-GRASS-V1 → DEATH-HUNGER-SEQ-V1（最優先）→ STRONG-STAGE-20P-COMPLETE｜死亡の倒れ込み・静寂・余韻を実装
- **照合・担当**：開始main `a3bc0e5601511f6af39c994676f81cc5dfe41eb8`（前15分枠10:15のROADMAPと実行履歴、前45分枠09:45の能力継承、Drive完成仕様設計書末尾を確認）→ コード最終HEAD `9bb9e965922747b757711880c877b7a628188110`。15分枠の飢餓HP減少・死亡保存は未上書き。既存6巣・20強敵/20継承・猫速度・Gamepad・夜目・SAVE_SCHEMA2を保持。
- **変更ファイル・commit・blob**：`neo-wild/game.js` `c99c73e`→`fce87ff` / blob `95355e67f6bef470adf2e6dff31cad3214be5238`、`neo-wild/webgl3d.js` `2bc99c1` / blob `ca2cf502533f41818a40e431ff2e79bb78a97e0e`、`neo-wild/audio.js` `c9ca543` / blob `a796b23b6af7a86ca0eb191a8efdeb64607ef161`、`neo-wild/index.html` `48369ce`→`9bb9e96` / blob `21d06d37e0ba482152a4226ffeac3861c368aa5b`（3ファイルのcache rev更新）。neo-wild/外変更なし。
- **実際のプレイ改善4点**：(1) `beginDeath`でHP0時に一度だけ`mode=dying`へ遷移、移動・攻撃・タッチ・Padを停止、ジャンプ中も接地。死亡画面を即表示せず3.2秒後の`finish`で表示し、死の効果音と自動保存削除の二重実行を防ぐ。(2) `drawCreature`の2D倒れ込み/伏せ姿勢と`webgl3d.js:animal`の3D脚・胴体・頭の高さ低下、ステルス半透明/「YOU」表示の解除。(3) `drawScene`で画面を段階的に暗転、HUDも徐々に薄くする。ゲーム時間・NPC・環境は死亡中に進めず、最後に短い余韻。(4) `WildAudio.fadeForDeath/resetDeathFade`でBGMと環境音を緩やかに減衰し、リトライ/チェックポイント/最初からの再開で音量を復元。死亡SEは1回のみ。
- **動的QA**：最新6 JS全文構文 **6/6 PASS**。現行`beginDeath/advanceDeath/finish`を抽出して実行し、二重死亡拒否・入力解除・0.7秒姿勢・3.19秒結果非表示・3.21秒結果1回・SE1回・auto削除1回の**7条件PASS**。実関数`advanceDeath(.035)`を**92フレーム＝3.22秒**実行し、死亡中のelapsed不変・一度だけ結果画面・半透明解除をPASS。実`currentSnapshot/saveAuto`はdying/HP0の保存を拒否し、既存の有効な旧SAVE_SCHEMA2を不正データで上書きしない。実`drawCreature`を模擬Canvas2Dで実行して伏せscaleを確認、実`webgl3d.js:animal`をプリミティブ記録で実行して平均Z **15.88→10.31**（27プリミティブ）、実`audio.js`のfade/resetで音量4遷移・二重抑止PASS。HTMLの3キャッシュ参照一致PASS。前15分枠の死亡/リトライ/CP/保存の22+41+11判定を引継ぎ。**模擬DOM/プリミティブ試験であり実ブラウザ/実GPU試験ではない。**
- **Pages**：コードHEAD `9bb9e965922747b757711880c877b7a628188110`、run **41374787653**、**build=success / report-build-status=success / deploy=success**をAPIのjob単位で確認。コード配信成功。本ROADMAP記録コミットのPages runは別途確認。
- **進捗計測V2**：A **16.0/16**（前15分枠死亡/再開実イベント11件＋本回死亡経時QA、`game.js`、run 41374787653）、B **12.0/12**（6巣/屋上/備蓄/2D3D草、前15/45分枠41+14件、`game.js/webgl3d.js`）、C **9.0/12**（冬→橋→河川→地区の連続経路は検証待ち）、D **4.0/16**（20種定義・出現のみ採点、固有戦闘/外見/討伐保存の種類別E2Eは検証待ち）、E **8.0/8**（20種継承・保存100件、`game.js`、run 41368763421）、F **9.0/12**（実縦横HUD/全画面矩形は検証待ち）、G **8.0/8**（旧SAVE_SCHEMA2・3CP・自動保存/再開の前枠QA＋本回dying保存拒否、`game.js`）、H **4.0/6**（実ブラウザFPS/衝突/画面サイズは検証待ち）、I **4.0/10**（実関数連結試験＋コードHEAD Pages 41374787653、ブラウザ10分/Android/物理Pad実機E2Eは検証待ち）。**合計74.0/100、前回74.0→74.0、差0.0**。今回の死亡演出は既採点A3/H1の品質改善であり、新しい条件の満点達成ではないため加点なし。未検証は0点、重み変更なし。
- **未試験**：実ブラウザ10分以上、実Android/物理Pad/実GPU、縦390×844/411×768・横800×360/844×390/736×414/1536×691の死亡演出HUD/全画面/FPS実矩形、死亡直前の実端末セーブと3CPからの操作復帰、飢餓0→巣休息回復との整合。現行`update`は空腹16未満で1.2HP/s・0で7HP/s減少し、巣の回復が同じフレームに入るため、飢餓0の優先順位は15分枠で要調整。
- **次15分枠（具体的3件）**：(1) `game.js:update`の空腹16未満/0時の減算と`atDen/denRestRate`を統合し、空腹0では巣内もHPが時間で減り、食事で停止・HP回復は既存摂食量を維持。実`update(.2)`×100でHP経時推移/0以前/食後を比較。(2) `beginDeath/advanceDeath/finish/currentSnapshot/saveAuto/restoreSnapshot`をHP0・出血・NPC攻撃・飢餓の4経路で連結し、死亡中の保存拒否、リトライ/最初から/3CP・旧SAVE_SCHEMA2・継承能力の二重加算なしを実イベント試験。(3) 15分枠から変更した`game.js`を最新HEADへ最小適用し、45分枠の`mode=dying`と衝突しないようにROADMAPへ引継ぎ。
- **次45分枠（具体的3件）**：(1) 実ブラウザが使える環境で2D/3Dの倒れ姿勢→画面/音の3.2秒フェード→死亡画面→リトライを縦横6サイズで10分E2E、FPS/DOM矩形を計測。不可能なら未検証のまま維持。(2) `webgl3d.js:animal`の猫/狐/狼各死亡姿勢と屋上巣Z、`game.js:drawCreature/drawScene`のCanvas2Dで実地形・橋・川の重なりとHUD暗転を確認、問題を最小修正。(3) 死亡演出の完成確認後、`spawnStrongBoss/updateFlyingEagle/updateAquaticStrong/resolveAttack/kill`の20強敵の固有戦闘→報酬→保存、`drawStrongAnimal3D`の2D/3D固有姿を種類別に実関数試験しDの不足条件を埋める。
- **連携**：15分枠の飢餓/セーブと45分枠の表示/音はこの同一パッケージを継続。新タスク・旧版上書き・ロールバック禁止。

## 共同スプリント・次担当｜2026/11/02 10:15 JST｜15分枠｜ACTIVE_SPRINT_ID=DEN-REFUGE-SIX-AND-GRASS-V1 → STRONG-STAGE-20P-COMPLETE｜巣周辺の自然なNPC狩猟・壁越し安全判定・死亡/保存回帰

- **開始HEAD→コード終了HEAD**：`d69fb9bc1ef63ff6a628106b52963e58b4518f4b` → `0ca44d90883199c1e9b7b98ac670f2ceffa1693b`。前15分枠09:19、前45分枠09:45のROADMAP・現行main・Drive完成仕様設計書末尾を照合。既存6巣、強敵20種・能力20種、即時旋回、旧セーブを維持。対象blob/HEADは各書込直前に再照合。
- **変更ファイル/commit/blob**：`neo-wild/game.js` commit `2cbe8e0fc181ec86c70b1e0b6e15825db1a7d887` / blob `83eadadb2f3a437fbc822064b145824c2c1c2bfe`、`neo-wild/index.html` cache rev commit `0ca44d90883199c1e9b7b98ac670f2ceffa1693b` / blob `d6e752a49ff662e5881ca74349e6d0db279905b6`。neo-wild/以外の変更なし。
- **プレイに結合した改善2点**：(1) `huntWildPrey`の「プレイヤーから140m以内ならNPCは絶対狩りをしない」を撤廃。プレイヤーが巣の草陰に隠れていて野犬に未発見なら、巣近傍で野犬がウサギを追い噛み、覚醒/逃走を引き起こす。プレイヤー発見・NPC警戒・スタン時のプレイヤー優先は従来条件を維持。(2) `denThreatNearby`は地上の壁越しにいる敵を休息妨害として誤判定しない。敵が実際に侵入して視線が通れば回復を妨げ、屋上の地上野犬は妨げず大鷲は引き続き妨げる。巣265m新規敵出現抑制は維持し、既存敵の自然な移動侵入は許可。
- **動的QA**：現行配信6 JS全文構文 **6/6 PASS**。修正後実game.jsを模擬DOM/Canvasにロードし、巣付近の野犬→ウサギ実噛み35→31HP・覚醒逃走、実壁遮蔽/巣安全、死亡CP復帰/CPなし同種リトライ、旧猫速度239→320と再復元の二重加算なし等 **22/22 PASS**。6巣（地上5/屋上1）それぞれ実`carryFood`で30pt備蓄→合計180pt→LV2→屋上保存/復元、地上犬は屋上回復妨害せず大鷲は妨害、3チェックポイント・死亡CP再開の **41/41 PASS**。実DOMイベントハンドラを用いた初回ガイド1回、死亡→CPなし同種、最初から→猫選択、死亡→CPあり復帰 **11/11 PASS**。実`update(.2)`×3000回＝ゲーム内600秒（DAY8まで）のNPC/環境/保存シミュレーションは例外0、最終17体・途中死亡なし。巣内敵1体は自然侵入の可能性があり新規湧きとの識別は未試験。これは**実ブラウザ10分E2Eではない**。
- **Pages**：対象コードHEAD `0ca44d90883199c1e9b7b98ac670f2ceffa1693b` run **41371759009**、**build=success / report-build-status=success / deploy=success**を確認。コード公開反映済み。ROADMAP記録コミット自身のrunは別途確認。
- **進捗V2（前回70.0→今回74.0/100、差+4.0）**：A **16.0/16**（12.0→16.0：死亡→同種CP/CPなし/最初から動物選択を実イベント11/11＋保存22/22、`game.js`、Pages 41371759009）。B **12.0/12**（据置：6巣/屋上備蓄/回復/2D3D草、今回41/41＋前45分枠描画14件、`game.js/webgl3d.js`）。C **9.0/12**（据置：野犬→獲物の狩猟を追加回帰、季節/橋/河川/地区の一連移動は検証待ち、`game.js`）。D **4.0/16**（据置：20種定義・出現のみ、固有AI/攻撃/2D3D外見/討伐報酬保存の種類別結合は検証待ち、`game.js/webgl3d.js`）。E **8.0/8**（据置：前45分枠20種×継承・固有効果・保存/重複QA、`game.js`、Pages 41368763421）。F **9.0/12**（据置：タッチ/Pad/〉〉/地図は既存QA、実ブラウザ縦横HUD矩形・全画面検証待ち、`game.js/gamepad.js/index.html/visual.css`）。G **8.0/8**（据置：旧SAVE_SCHEMA2/1秒自動保存/3CP/再開、今回22+41+11内の再開回帰、`game.js`）。H **4.0/6**（据置：WebGL/2D・夜/草/月光は既存描画QA、実ブラウザFPS/衝突/画面サイズ検証待ち、`webgl3d.js/game.js/season-clouds.js`）。I **4.0/10**（据置：実関数結合試験＋対象HEAD Pages 41371759009、ブラウザ10分・Android実機・物理Pad実機E2Eは未試験）。**合計74.0/100、前回差+4.0（Aのみ）**。未検証は0点、項目/重み変更なし。
- **未試験**：実Android/物理Pad/実GPU、実ブラウザ10分以上、FPS・縦390×844/411×768・横800×360/844×390/736×414/1536×691のDOM矩形、冬可視遮蔽物→川橋→雨宿り→地区移動の連続経路、20強敵各個体の固有戦闘/素材ドロップ/保存の実結合、6巣付近の敵が新規湧きでないことの個体ID追跡。
- **次15分枠（具体的3件）**：(1) `spawnMob/huntWildPrey/updateIndoorRest`で6巣265m内の敵の新規spawnが0・巣外からの野犬自然侵入・休息ウサギ覚醒→逃走→死骸/食事を個体生成前後の位置/IDで追跡、必要なら最小修正。(2) `wildlifeBridgeWaypoint/steerPursuit/update`で冬の実在遮蔽物→橋渡り→雨の建物入口→別地区までNPCとプレイヤーの連結移動を動的再現しC4判定。(3) `currentSnapshot/restoreSnapshot/getCheckpoints`で長時間NPC狩猟・20継承フラグ・巣LV2のCP3件から復帰し再開時のNPC死骸/報酬二重加算なしを検査。
- **次45分枠（具体的3件）**：(1) `spawnStrongBoss/updateFlyingEagle/updateAquaticStrong/applyStrongStrikeEffect/resolveAttack/kill`で20種の固有行動→命中→討伐→素材→再開を種類別に動的試験しDの未検証条件を埋める。(2) `webgl3d.js:drawStrongAnimal3D/denBeddingMesh`と`game.js:drawDenBedding2D`で20強敵の外見と6巣/屋上草を3D/2D実ブラウザで比較、見た目と衝突を一致。(3) 実ブラウザ縦横6画面で`index.html/visual.css`の右上3ボタン→ミニマップ→SCORE/HUNTのBoundingClientRect、全画面/FPSを計測しF/H不足を修復。
- **共同引継ぎ**：45分枠の強敵20種/3Dモデル領域は変更していない。最新HEAD/ROADMAPを再取得して同一スプリントを続行。旧71点固定・ロールバック・新タスクは禁止。

## 共同スプリント・次担当｜2026/11/02 09:45 JST｜45分枠｜ACTIVE_SPRINT_ID=DEN-REFUGE-SIX-AND-GRASS-V1 → STRONG-STAGE-20P-COMPLETE｜強敵20種類の希少素材・固有能力をプレイに接続／進捗V2更新

- **開始HEAD→コード終了HEAD**：`bb9e17a60ec99ba1e1ee633cd0160564754b7b09` → `30bb3990fd18926b65b268ba996e4f6b88a94419`。開始時main/ROADMAP先頭（09:19 15分枠V2初回64.0）・Drive完成仕様設計書末尾を確認。既存5能力/20種定義/6巣/屋上AIは重複実装せず保持。現行main/対象blobを変更直前に照合。
- **変更ファイル/コミット/blob**：`neo-wild/game.js` commit `e6789fc5382a6fa0eb3976ff2ac705a016628899` / blob `905667d897b882d9648e71c2fbe4509658b2410f`、`neo-wild/index.html` commit `30bb3990fd18926b65b268ba996e4f6b88a94419` / blob `9f8d9facb2b1075c61621e63f9662421a0c38e56`。neo-wild/以外変更なし。game.js cache revを`20261102-strong-inheritance-all20-v1`へ更新。
- **実際の遊びの改善4点**：(1) 巣LV2食料庫に残り15種類の素材継承ボタンを追加し、既存5種と合わせ20/20種。素材1個消費・1回限り・取得状態と残数の保存は従前`inheritStrongTrait`を共用。(2) 移動/狩猟：大蛇＝減速回復、巨大イノシシ＝飛びつき距離、隻眼の狼＝未発見奇襲、白虎＝跳躍距離、巨大ライオン＝5段目、巨大ヘラジカ＝ジャンプ省力、巨大バッファロー＝吹き飛ばし、巨大ゴリラ＝敵ひるみ。(3) 生存/環境：巨大ハイエナ＝空腹低下、水辺の巨大ワニ＝持久力回復、水辺の巨大カバ＝物理被害軽減、巨大アナコンダ＝拘束中の移動低下軽減、サイ＝物理被害軽減、巨大ゾウ＝安全な巣の回復強化、アルビノの狼＝潜伏足音低下。水辺判定は実河川/運河座標に限定し、能力なしでは従来値。(4) 既存5種の効果/セーブ、20%地区抽選/同時1体、alpha速度231.4、屋上・6巣、夜目・月齢、4ボタン・Gamepad、SAVE_SCHEMA=2・3チェックポイントのコードを維持。
- **動的QA**：現行配信6 JS全文構文6/6 PASS。実`inheritStrongTrait`で20種×「消費・取得・保存・重複拒否・再読込」計100判定PASS。実`traitEffect`で新15種の未取得→取得後の数値差15/15 PASS、実`strongDamageTaken`で無継承/サイ/水辺カバ併用/陸地復帰4判定PASS、実`jump`4判定（白虎の距離・大角の消費）、実`dash`2判定（猪の飛距離）、実`resolveAttack`4判定（ライオン5段目・野牛ノックバック・ゴリラひるみ・隻眼奇襲）PASS。実`renderDenInventory`で20ボタン有効→既取得のみ無効・残り19有効PASS。HTML 6 script、20ボタン、重複IDなし。前15分枠の旧SAVE_SCHEMA2/3チェックポイント26/26と6巣屋上/生態18/18を引継ぎ。**実ブラウザでの10分E2E、屋上ジャンプ・草/ミニマップ実矩形、FPS/実GPU、実Android、物理Pad、旧セーブ実端末E2Eは未試験**。今回の関数単体/連結QAを実機E2Eと混同しない。
- **Pages**：コードHEAD `30bb3990fd18926b65b268ba996e4f6b88a94419` のrun **41368763421**、**build=success / report-build-status=success / deploy=success**を確認。コード公開反映済み。ROADMAP記録コミット自身のrunは別途確認。
- **進捗計測V2（前回09:19 15分枠64.0/100 → 今回70.0/100、差+6.0）**：A **12.0/16**（死亡→リトライ統合未試験）、B **12.0/12**（6巣・屋上/草の前回動的QA）、C **9.0/12**（季節→橋→河川→地区の連結未試験）、D **4.0/16**（20種定義/地域出現のみ採点。各固有AI・攻撃・2D/3D・討伐保存の20種別連結は未検証のため0）、E **8.0/8**（20種×0.4：`game.js:STRONG_TRAITS/traitEffect/inheritStrongTrait`と20ボタン、上記20種保存/重複・15効果数値QA、Pages 41368763421）、F **9.0/12**（縦横HUDの実DOM矩形未試験）、G **8.0/8**（前15分枠26/26、Pages 41366359817）、H **4.0/6**（実ブラウザFPS/当たり判定未試験）、I **4.0/10**（実関数統合＋対象HEAD Pages成功、ブラウザ10分/Android/物理Pad E2E未試験）。採点表・配点は前15分枠V2と同一。前回との差はE 2.0→8.0のみ。未検証項目は0点。
- **次15分枠（具体的3件）**：(1) `finish/getCheckpoints/restoreSnapshot/start`で死亡→同種CP復元→CPなし同種開始→最初から動物選択を動的連結、旧SAVE_SCHEMA2/3CPと新20継承フラグの再開・二重加算なしを検査しA3を判定。(2) `spawnMob/huntWildPrey/updateIndoorRest`で6巣265m内の敵新規出現0と屋上/地上の獲物・野犬・大鷲の10分相当生態試験。(3) `wildlifeBridgeWaypoint/steerPursuit/update`で冬可視草→橋→雨宿り→地区境界の連結を実行しC4不足を修正。
- **次45分枠（具体的3件）**：(1) 実ブラウザで`webgl3d.js:denBeddingMesh/vegetation`・`game.js:drawDenBedding2D/drawMini`を6巣・屋上・縦390×844/411×768・横800×360/844×390/736×414/1536×691の矩形/目視/FPSで試験し不具合を最小修正。現環境はブラウザへのゲームファイル配信取得ができず未試験。(2) `spawnStrongBoss/updateFlyingEagle/updateAquaticStrong/applyStrongStrikeEffect/resolveAttack/kill`を20種類別に「地区20%→固有行動/攻撃→討伐/素材→再開」の動的連結にしDの種類別条件を検証・修復。(3) `webgl3d.js:drawStrongAnimal3D`と`game.js`の2D動物形状を20種類別の固有シルエット/水辺/空中・地形衝突で回帰し、実モデルとAIの不一致を修正。Pages build/deploy確認。
- **連携**：次回も最新main/ROADMAP/Driveを再取得。旧版上書き/強制push/新タスクは禁止。実機検証が未達の項目は加点しない。

## 共同スプリント・次担当｜2026/11/02 09:19 JST｜15分枠｜ACTIVE_SPRINT_ID=DEN-REFUGE-SIX-AND-GRASS-V1（屋上安全・生態・保存）→STRONG-STAGE-20P-COMPLETE（45分枠継続）｜進捗V2初回採点

- **開始HEAD→コード終了HEAD**：`12afddae11c08f49770016fea58a7b92e5d71096` → `1d070fa3bd6503a3cbdabc6506f57f933d29b98f`。開始時main/ROADMAP前2枠、Drive「完成仕様設計書」末尾、最新6巣・強敵20種・5能力の現行ソースを確認。15分枠のAI/操作/セーブ担当として既存巣・能力を重複実装せず修復。
- **変更ファイル・コミット・blob**：`neo-wild/game.js` commit `e8aa46101e621e27fc7ea79270f74dd1981a7117` / blob `ecff44521a9d0a5264af87ccdaf96a892bf4d4c6`、`neo-wild/index.html` commit `1d070fa3bd6503a3cbdabc6506f57f933d29b98f` / blob `75cd75de2c04186191a4eb18be4a1f2780864171`。game.jsのrev更新。webgl3d.js・gamepad.js・他ゲーム・ブログ・ルートは変更なし。
- **実プレイの連動改善4点**：(1) 屋上巣に着地・しゃがみ移動した時に寝床で潜伏可能。地上の草束で屋上動物が隠れる誤判定は防止。(2) 地上野犬は屋上プレイヤーを高さ無視で発見せず、同高度の敵と飛行する大鷲の警戒は残す。夜間の獲物の覚醒も高度判定に整合。(3) 地上の食草/肉を屋上から透過取得・摂食できない。屋上に持ち込んだ食料は着地後に食べられ、地上の通常摂食は従来どおり。(4) 屋上の生命回復と強敵出血の回復速度が同じ危険判定を共有。地上の敵は屋上休息を妨げず、大鷲/同高度の敵は妨げる。6巣共通備蓄、屋上LV2、旧SAVE_SCHEMA2を維持。
- **今回のQA**：配信JS全文構文6/6 PASS。実関数`denAtActor/denThreatNearby/inCover/sharesPlayerElevation/detectsPlayer/foodAtActorLevel/nearbyFood/eat`を模擬世界で呼ぶ屋上・地上・大鷲・野犬・食事18/18 PASS。実`resolveAttack→kill→animalRemains→eat→HP/空腹回復→saveAuto`連結9/9 PASS。実`currentSnapshot/saveAuto/getCheckpoints/recordCheckpoint/restoreSnapshot`で新5能力の保存状態・素材残数、旧SAVE_SCHEMA2猫速度移行、同一セーブ再読込の二重加算なし、3チェックポイント上限26/26 PASS。合計53件の関数動的検証。実Android・実GPU・物理Pad・10分実ブラウザE2Eは未試験。既存6巣描画は前45分枠の模擬14項目、能力5種は前45分枠の8/8を根拠として引継ぎ。
- **Pages**：コード終了HEAD `1d070fa3bd6503a3cbdabc6506f57f933d29b98f` のrun **41366359817** を確認。**build=success / report-build-status=success / deploy=success**。本ROADMAP追記コミットのrunは別途確認。実機公開目視・FPSは未検証。
- **進捗V2初回基準**：2026/11/02 09:19 JST、採点対象HEAD `1d070fa3`。旧71/100を継承しない。初回のため前回V2との差は**比較対象なし**（旧方式71点との増減計算は不可）。以下はA/B/C/F/G/H/Iは条件ごとに満点または0点、D/Eは種類別のみ加点。実機を模擬試験と混同しない。
  - **A 基本生存 12.0/16**：即方向転換4（`game.js/gamepad.js`、既存移動10/パッド8動的・Pages 41364072902）、狩猟→食事→回復4（本run実関数9/9・Pages 41366359817）、死亡→リトライ0【旧/3CP/死亡画面を通す統合試験待ち】、成長→生き残れ！4（`game.js`のmission7と過去18項目動的/配信）。
  - **B 巣・備蓄 12.0/12**：6巣アクセス3（`game.js`/前15分枠17/17）、運搬→備蓄→LV2 3（同17/17）、安全休息回復3（同17/17＋今回18/18）、2D/3D・草区別3（`webgl3d.js/game.js`/前45分枠描画14件・Pages 41363977485）。屋上への実端末ジャンプは別途未検証。
  - **C 生態・環境 9.0/12**：NPC警戒→追跡→逃走3（`game.js`/前15分枠25件）、食物連鎖3（`huntWildPrey`/前15分枠17件）、昼夜/天候/睡眠/夜目3（`game.js/webgl3d.js`/既存夜間/照明動的試験）、季節/橋/河川/地区移動0【4要素の連結実移動試験待ち】。
  - **D 強敵 4.0/16**：20種×定義・地域出現0.2=4.0（`STRONG_NAMES/STRONG_REGIONS/spawnStrongBoss`、前45分枠20種登録QA）。20種それぞれの固有AI・攻撃、2D/3D固有外見、討伐報酬/上限/保存の**種類別一式検証が未完**のため、それらの条件は0点。基本登録のみで16点としない。
  - **E 希少素材・能力継承 2.0/8**：アルファ/老熊/黒豹/大鷲/巨大オオトカゲの5種×0.4（`STRONG_TRAITS/inheritStrongTrait/nightVisionProfile/update`、前45分枠8/8、今回保存26/26、Pages 41364072902）。残り15種は0【実効果と保存の結合未実装】。
  - **F UI・操作 9.0/12**：タッチ/即旋回3（`game.js`既存動的10件）、ゲームパッド4ボタン・方向3（`gamepad.js`既存動的8件）、縦横HUD/全画面0【実DOM矩形/横画面検証待ち】、教程/〉〉/常設地図3（`game.js/index.html`既存mission/地図動的試験）。物理PadはIの別未検証。
  - **G セーブ 8.0/8**：1秒autosave2、旧SAVE_SCHEMA2互換2、3チェックポイント2、再開/二重加算なし2（`currentSnapshot/restoreSnapshot/recordCheckpoint`、今回26/26、Pages 41366359817）。
  - **H 描画・性能 4.0/6**：WebGL/Canvas2D両描画2（`webgl3d.js/game.js`既存模擬描画14件）、夜/雲/草/月光2（`season-clouds.js/webgl3d.js/game.js`既存31項目照明/草試験）、実ブラウザFPS/当たり判定/画面サイズ0【実ブラウザ計測待ち】。
  - **I 統合検証・配信 4.0/10**：実関数の連続統合2（今回9/9＋26/26）、ブラウザ10分E2E 0【未試験】、Android実機E2E 0【未試験】、物理Pad実機E2E 0【未試験】、対象HEAD Pages build/deploy両成功2（run 41366359817）。
  - **合計 64.0/100、前回V2差：初回のためなし**。項目A12/B12/C9/D4/E2/F9/G8/H4/I4。採点項目/重みの変更なし。コード行数・コミット数だけでは加点しない。
- **次15分枠（具体的3件）**：(1) `finish/retry/restoreSnapshot/getCheckpoints`で死亡→同種CP復帰/CPなし新規→最初から動物選択の実関数連結試験を作り、失敗すれば現行HEAD最小修正、A3判定。(2) `spawnMob/huntWildPrey/followNightCover/updateIndoorRest`で6巣265m内の敵新規出現0、侵入野犬の狩猟、屋上のプレイヤー・休息獲物・夜目を10分相当シミュレーションし、食物連鎖/高度不具合を修正。(3) `wildlifeBridgeWaypoint/steerPursuit/update`で冬の可視遮蔽物→川橋迂回→雨宿り→地区境界の実関数連結を試験し、C4を満たすまで検証。
- **次45分枠（具体的3件）**：(1) `webgl3d.js:denBeddingMesh/vegetation`と`game.js:drawDenBedding2D/drawMini`の6巣を実ブラウザ縦390×844/411×768・横800×360/844×390/736×414/1536×691で目視・矩形・FPS検証し、屋上潜伏の3D可読性を整える。(2) `STRONG_TRAITS/inheritStrongTrait`の残15種を個別の消費→固有実効果→保存/重複拒否で実装し、45分担当の強敵AI/モデルとの競合を避ける。(3) `spawnStrongBoss/updateFlyingEagle/drawStrongAnimal3D`で20%抽選/1体上限/巣420m回避/屋上大鷲の固有戦闘と報酬保存を種類別動的試験し、Dの条件を証拠に応じて加点。Pages両job success確認。
- **次担当共通**：両枠とも本V2採点表を基準に最新HEAD/ROADMAP先頭を再取得。旧「71据置」指示は無効。実Android・実GPU・物理Padの未検証は未検証のまま維持。新タスクなし。

## 共同スプリント・次担当｜2026/11/02 08:49 JST｜45分枠｜ACTIVE_SPRINT_ID=DEN-REFUGE-SIX-AND-GRASS-V1 → STRONG-STAGE-20P-COMPLETE｜6巣描画統合QA・希少素材5能力の実継承
- **開始HEAD→コード終了HEAD**：`1f52f723625129dbbd6ba88395d64d257e13b0e8` → `23a7d65619629fc4ce2b36e1c0813eadfea3eb64`。開始時ROADMAP先頭、15分枠08:18の屋上巣/備蓄/回復修復、Drive完成仕様設計書末尾を再読。既存6巣/20種の基本登録は再実装しない。最新game.jsのAI・屋上誘導・SAVE_SCHEMA=2・alpha速度231.4を保持。
- **コード変更**：`neo-wild/game.js` commit `93cd501a0c23c82348b3bef4bc1d38fea9329697` / blob `9551d89d0b725bec1c6a9e371d3a0b086d7db82b`、`neo-wild/index.html` commits `32fc63d45e9441f7c9ca5a8a732c1f3e717179fd`・`23a7d65619629fc4ce2b36e1c0813eadfea3eb64` / blob `0d7fedfa3e7a898ee4e1fc9e4f379dc90e67e08c`、`neo-wild/visual.css` commit `93e2e43ca4fb014ed6f245f7c9d834d5f7a73a24` / blob `ba6ed4eb0b7dda0c4fe9af6caf73b5d231665c93`。全てneo-wild/内、ゲーム/スタイルcache rev更新済み。
- **プレイで変わる4点**：(1) 20種の強敵のうち5種の希少素材を、**巣LV2以上の食料庫**から消費して固有能力へ継承できる（素材1個/能力、同一能力は一度だけ）。(2) アルファ＝移動速度+8%、老熊＝最大生命+28、黒豹＝攻撃力+12%。(3) 大鷲＝夜の前方視認距離+22%（WebGL/Canvas2D共有nightVisionProfile）、巨大オオトカゲ＝強敵の出血被害-35%。いずれも実移動・攻撃・生命・描画・被弾計算に連動し、名前だけの効果ではない。(4) 5種の素材所持数/未解放/継承済み状態を食料庫にタッチ可能なボタンで表示。素材消費・プレイヤー能力は既存SAVE_SCHEMA=2のstrongTrophiesとplayer内inheritedTraits/既存ステータスで保存し、旧セーブは空の継承状態に正規化。再ロード時に能力を二重加算しない。
- **QA**：配信JS6/6全文構文PASS、HTML id重複0・6 script順/2 rev・CSS括弧PASS。実`inheritStrongTrait`抽出動的試験で5能力の獲得/素材消費/一回制限5件とLV1・素材0・既取得拒否3件＝8/8 PASS。実`nightVisionProfile`で大鷲継承前後の夜間距離767.52→936.37、強度0.57→0.627、昼補正0 PASS。出血軽減フックとSAVE_SCHEMA2のplayer展開/復元正規化はコード経路確認（旧セーブE2Eではない）。実`denBeddingMesh`を6巣（地上5/屋上z32）で呼び3D形状167個/有限座標・屋上z維持PASS、実`drawDenBedding2D`で地上5/屋上1を分離PASS、実`vegetation`で夏46葉・冬0葉PASS。合計14項目の構文/表示/地形統合チェックPASS。初回2Dテストの「巣ごとのtranslate数」カウンタは葉材の局所translateを誤算入したためテスト側のみ修正して再実行（製品コード不具合なし）。
- **Pages**：最終コードcommit `23a7d65619629fc4ce2b36e1c0813eadfea3eb64` に対するrun **41363977485** のjobs **build=success / report-build-status=success / deploy=success** を実確認。コード公開反映済み。本ROADMAP追記コミットのrunは別途確認。
- **未検証**：実ブラウザ10〜20分E2E、実Android・実GPU/WebGL FPS・物理Gamepad、屋上到達の物理ジャンプ/6巣での実プレイ目視、縦390×844/411×768・横800×360/844×390/736×414/1536×691の実DOM矩形・衝突、実旧セーブ/3チェックポイントの完全復元、残り15種の素材能力継承、全20種の固有戦闘長時間バランス。模擬描画を実GPU目視と称しない。
- **次15分枠**：(1) `currentSnapshot/restoreSnapshot/getCheckpoints`で新しいinheritedTraitsの保存→再開/3チェックポイント→同素材の再消費拒否・alpha/熊/黒豹の数値二重加算なし・旧SAVE_SCHEMA2に未定義フィールドでも復帰する動的E2Eを追加。(2) `spawnMob/huntWildPrey/followNightCover`で6巣の敵出現265m禁止と通常獲物の生成、夜の潜伏→野犬の追跡→狩猟/死骸を10分相当シミュレーション。(3) `update/denAtActor/currentSnapshot`で屋上回復・地上敵高さ・大鷲の高度攻撃・屋上食料備蓄とLV2継承ボタンの相互作用を確認。
- **次45分枠**：(1) `webgl3d.js:denBeddingMesh/vegetation`と`game.js:drawDenBedding2D/drawMini`を実ブラウザ縦横6画面で屋上アクセス・6巣可読性・ミニマップ/FPS・草の冬非表示を目視/矩形検査し、不具合は現行HEADから最小修正。(2) `game.js:STRONG_TRAITS/inheritStrongTrait/applyStrongStrikeEffect/update`で残り15種の素材継承を個別の実効果・上限・保存・HUDと連動させ、同じ20%抽選/1体上限を維持。(3) `game.js:spawnStrongBoss/updateFlyingEagle`と`webgl3d.js:drawStrongAnimal3D`で巣420m出現抑制/大鷲屋上予兆・地上敵侵入・固有戦闘を動的/実ブラウザで回帰し、Pages build/deploy確認。
- **進捗**：71/100据置。強敵基本20/20種、能力継承は**5/20種**。新タスクなし。

## 共同スプリント・次担当｜2026/11/02 08:18 JST｜15分枠｜ACTIVE_SPRINT_ID=DEN-REFUGE-SIX-AND-GRASS-V1｜屋上巣の実プレイ修復
- **開始HEAD→コード終了HEAD**：`9b94b26328eec644e43b3e5229bc0c47bf09d68b` → `6970ef6c52a23ae3ec871b75a59607d908a47cca`。開始時ROADMAP先頭・直前15/45引継ぎ・Drive「完成仕様設計書」末尾とmainを再読。既存6巣/20強敵の定義・3D/他ディレクトリに手を触れず、同一DEN-REFUGE-SIX-AND-GRASS-V1の未完実操作を継続。
- **実変更とコミット**：`neo-wild/game.js` commit `b8c3ba60e945836fd995964a7bb258a82c057470`、blob `9da77e3aa5d267053a30ed83757ae8f5ce03915d`。`neo-wild/index.html` game.js rev commit `6970ef6c52a23ae3ec871b75a59607d908a47cca`、blob `213d8f3890eb436c077b18678c5db951808a4afa`。旧ファイルの全面復元なし、現行blob SHA照合後に対象6か所だけ最小差分。ROADMAP本記録のコミットは別SHA。
- **実プレイで変わる4点**：(1) 屋上の巣に着地して食料をくわえた時、mission4の目的地「〉〉」が遠方の地上巣を指さず、**今いる屋上の巣**を指す。地上にいる場合は従来の近い地上巣へ誘導。(2) 屋上/地上の巣内では「ここで△を押して備蓄」「ここで△長押ししてLV2へ強化」と現場に即したHUD案内。(3) 屋上で休息中、屋上に到達できない地上野犬などが平面距離165m以内にいても生命回復を妨げない。高度が同じ敵・大鷲は危険扱いを維持。敵の移動侵入・攻撃AI・出現率には手を加えない。(4) 巣で備蓄不足の△長押しは食料庫を開いて終わる代わりに、`upgradeDen`が不足ptを通知する。所定量があれば従来通り強化し、運搬中の備蓄を優先。
- **QA PASS**：配信6 JSの全文`new Function`構文6/6、HTML6スクリプト順・game.js rev・ID重複0。実`start/update/getObjective/stockpileStep/contextAction/carryFood/upgradeDen/currentSnapshot/restoreSnapshot/recordCheckpoint/huntWildPrey`を模擬DOM/Canvasで呼び、6巣（地上5/屋上1）・屋上誘導・備蓄・LV2・地上敵越しの屋上回復・旧SAVE_SCHEMA2備蓄移行・3チェックポイント・野犬の獲物討伐→死骸・20種登録/アルファ231.4等 **17/17 PASS**。直前の旧ソースでは屋上ミッションが地上巣を指し、地上犬が屋上回復を止めることを動的再現してから修正。前回の6巣生成/屋上Z/草形/巣近傍出現QAは既存成果を維持。
- **Pages**：コード最終commit `6970ef6c52a23ae3ec871b75a59607d908a47cca`、run **41361429203**、**build=success / deploy=success / report-build-status=success**（各job実確認）。このROADMAP追記のPages runは別途確認。
- **未検証**：実Android・実GPU・物理Gamepad、10～20分の実ブラウザE2E、屋上までのジャンプ/肉運搬の物理実操作、6画面実DOM矩形/FPS、強敵20種全固有戦闘・素材からの能力継承、夜間NPC長時間生態/川橋。モックPASSを実機PASSと混同しない。
- **次45分枠**：(1) `webgl3d.js:denBeddingMesh/vegetation`と`game.js:drawDenBedding2D`で屋上巣の高さ・草束/冬の非表示を実WebGL/Canvas目視・FPS・衝突でQAし、不整合を最小修正。(2) `game.js:spawnStrongBoss/updateFlyingEagle`の巣420m回避・大鷲の屋上視認/攻撃予兆・地上敵の屋上侵入不能を動的に確認し、3D/戦闘側の修正を担当。(3) 強敵20種の素材→能力継承と縦横HUD矩形・Pages build/deployを同ロードマップで進め、次15分枠にAI/セーブ関数とテスト条件を引き継ぐ。
- **次15分枠**：(1) `spawnMob/huntWildPrey/followNightCover/startlePrey`で6巣周囲265mの敵新規出現0・小獲物の生成・夜間草陰潜伏→野犬侵入→覚醒逃走→死骸/食事を10分相当の動的シミュレーションで完結。(2) `update/denAtActor/currentSnapshot/restoreSnapshot`で屋上・地上の備蓄/生命回復・敵接近・旧保存/3チェックポイントを長時間回帰し、復元後の巣座標と保存量一致を確認。(3) `getAxes/move/guideWisp`で逆方向即時移動・ミッション〉〉・水/橋迂回・雨夜目とゲームパッド/4ボタンを回帰。検出した問題だけ現行HEADへ最小修正。
- **進捗**：71/100据置。20/20種は基本登録済みだが実機E2E・能力継承未完成。新タスクなし。

## 共同スプリント・次担当｜2026/11/02 JST｜ユーザー最新指示・手動即時改修｜ACTIVE_SPRINT_ID=DEN-REFUGE-SIX-AND-GRASS-V1
- **指定**：巣が1か所しかない・敵の出現地点すぎる・草陰/屋上/多様な隠れ巣が欲しい・潜伏草が丸い塊で草に見えない。既存2枠（15分AI/セーブ、45分表示/地形）を継続。**この最新指示を完了パッケージとし、両枠の旧コードで巻き戻さない。** 次の未完スプリントでは強敵20種類の戦闘・能力継承を再開。
- **コード開始HEAD→完成HEAD**：`19c3000d5ec6f80df22038ec4b9d534cdf4b0dd9` → `9209b4fb0613a8e65f5522305edbc8ec590ad912`。neo-wild/のみ変更。game.js `6ad35f58`（6候補生成）→ `6791e05d`（巣の利用・安全出現・地図・教程）→ `96a40af7`（地上/屋上2D寝床・草の葉形）→ `0d026dd4`（小型獲物は巣周辺可・敵のみ出現回避、場所別2D造形）。webgl3d.js `ad829a87`（屋上高さ/複数寝床/葉状草）→ `d4e8d3bf`（屋上板、廃墟瓦礫、工場裏資材、水辺の葦で造形差）。index.html `9209b4fb`（game.js/webgl3d.jsのrev=v2）。古い大鷲/アルファ/猫速度/夜目/ゲームパッド/ミッション〉〉のロジックに変更なし。
- **プレイ改善**：(1) ワールド生成後に6つの候補：草陰・森林・廃墟・工場裏・水路脇・低い屋上を地形/道路/水域/建物と重ならない実位置へ決定。6か所にマーカーと名称（詳細地図）・常設ミニマップ印、2D/3D実際の寝床を表示。(2) 全候補で`denAtActor/atDen/closestDen`により接近・高さ一致で休息/備蓄/強化。教程の巣誘導は現在地から近い地上候補へ。屋上の寝床も通常ジャンプで到達し、着地中のみ使用。旧セーブの単一巣レベル・備蓄は新候補でも利用可能（現段階では**全巣共通備蓄**で旧セーブ無損失。独立備蓄の新仕様を勝手に導入しない）。(3) `spawnMob`の巣周囲265mでは野犬・イノシシなど敵性個体が直接出現せず、小獲物へ置換。強敵`spawnStrongBoss`は巣周囲420mの出現を避ける。生存者が出会った既存敵を消去したり、侵入した敵を無敵化したりはしない。(4) 巣周辺に草束を適度に植え、古いセーブ復元後も追加・重複防止。潜伏のtype2を3Dでは計46枚の葉先が尖った三角葉、2Dでは24枚のしなった葉と葉脈へ描画変更。冬は旧仕様どおり非表示で不可視草潜伏を作らない。
- **動的QA**：配信全6 JSファイルの`new Function`全文構文PASS。実`generateWorld/initializeDenSites/ensureDenCover`（ワールド補助の水/建物/衝突を模擬したJS）で6候補、地上5/屋上1、地上障害物0、候補重複0、巣別の草設置/再生成重複0、実`denAtActor`＋`upgradeDen/carryFood`で地上と屋上の高度判定、屋上備蓄18pt・LV2強化PASS。実`spawnMob`を模擬DOMで走査、近傍小動物生成・敵性個体の置換を確認。実`drawDenBedding2D`の地上/屋上別描画、実`vegetation`の夏46葉・冬0葉、WebGLの寝床高さ（Z=32）・有限座標PASS。HTML6スクリプト読込順・id重複なし、キャッシュrev両更新PASS。**未検証**：実Android/物理Pad/実GPUの2D/3D目視、実端末で6候補へ実移動・屋上へのジャンプ成功・屋上食料運搬E2E、WebGL FPS、旧セーブ全3チェックポイントでの実DOM復元、縦390/横800他6サイズの矩形重なり0。模擬QAと実機QAを混同しない。
- **Pages**：最終JS/HTMLコミット `9209b4fb0613a8e65f5522305edbc8ec590ad912` に対応する `pages build and deployment` run **41360862002**、jobs **build=success / report-build-status=success / deploy=success**。このROADMAP追記コミット自体のワークフローは別途判定。
- **次15分枠**：(1) `initializeDenSites→atDen→contextAction→carryFood/upgradeDen→currentSnapshot/restoreSnapshot` の新規開始と旧SAVE_SCHEMA2/3チェックポイントを、屋上/地上それぞれ連続操作で動的確認。(2) 通常NPC`spawnMob/huntWildPrey/followNightCover`が巣から265mの敵出現禁止を守りつつ、移動して侵入する野犬と獲物の生態/逃走/草陰潜伏に破綻がないか試験。(3) 川・橋・雨夜目/ミッション〉〉と現行の即時逆方向旋回を回帰、問題は最小差分だけ修正。
- **次45分枠**：(1) `denBeddingMesh/drawDenBedding2D/drawPlant/vegetation` の6か所固有形状、屋上高さ、四季の草・冬の消失、実WebGL/2D目視とFPSを検査。(2) 屋上到達と建物衝突・巣から420mの強敵出現回避・実マップ/ミニマップの全候補表示・縦横HUD矩形を実ブラウザで確認、不備を最小修復。(3) 強敵20種の戦闘・素材能力継承・旧セーブ回帰を同ROADMAP上の次の未完パッケージで続行し、15分枠へNPC/保存の具体的引継ぎを記録。
- **全体進捗**：71/100据置。新巣候補生成・QAを自動加点しない。新規タスク・他ゲーム変更なし。

## 共同スプリント・次担当｜2026/11/02 07:49 JST｜45分枠｜ACTIVE_SPRINT_ID=STRONG-STAGE-20P-COMPLETE｜大鷲の飛行・急降下・野生狩猟を実装（基本20/20種）
- **開始HEAD→コード終了HEAD**：`1d76311a8871f7dfa9d8019c9480b01af39a2c1d` → `93e9422ff7e2e40db7a61ced918ec4f802b1381c`。直前15分枠の白狼陸上出現/野生狩猟修復とDrive設計正本末尾を引継ぎ、既存19種を重複させず大鷲を追加。コードcommit：`e2b6e983`（大鷲AI/抽選）、`01e72ff4`（3D翼）、`6c463ce7`（rev）、`d20261ff`（水上復元）、`49cc79fd`（攻撃クールダウン）、`93e9422f`（最終rev）。変更は `neo-wild/game.js` blob `d3063dfad94b74f1b858266567f5d7fa6fce7433`、`neo-wild/webgl3d.js` blob `afeec3fa90be1b5aac03a21a3299eb7e5d1c7529`、`neo-wild/index.html` blob `d37fc1941c639b5343b89bed09500f065a879440`。他ゲーム/ブログ/ルート変更なし。
- **実プレイ変化**：(1) **大鷲**：地区2/3/4/5/7の既存20%地区抽選内に追加。空中高度125の旋回→0.84秒の「急降下」予兆→高度を下げて追撃→爪によるHP/持久力減少→離脱/上昇。通常地上NPCの `move()` を使用せず、壁越し/屋内への攻撃を禁止。 (2) プレイヤー非発見時はウサギ/ハト等を空から捕食し、実HP減少→死骸生成→地区の獲物密度低下に接続。討伐は既存 `kill` のDNA・希少素材・死骸/巣運搬に接続。(3) 2Dは翼/羽根/尾/鉤爪と飛行高度・地上影を個別描画。3Dは左右の羽ばたく翼・羽根/頭/くちばし・高度を独立メッシュで表現。水面上を飛行したセーブでも陸へ強制移動させず復帰。(4) 既存アルファ速度231.4、猫320、強敵最大1体・地区再入場固定、SAVE_SCHEMA=2/チェックポイント3件、夜目/月齢/ミニマップ/Gamepadを維持。
- **動的QA**：配信JS全6/6構文PASS。実 `updateFlyingEagle` の旋回→予兆→急降下→命中→離脱→再旋回・屋内/遮蔽時ダメージ0、実 `drawStrongCreature2D` 28描画図形と `drawStrongAnimal3D` 30メッシュの有限座標、実 `spawnStrongBoss` 大鷲生成→2体目拒否、実 `enterStrongStage/strongStageCandidate` 2500回の地区抽選で出現482回（19.28%）・再入場5回/ステージで増殖0、実 `updateFlyingEagle` の野生獲物討伐→死骸1→生態獲物20→19、実 `normalizeStrongBossSave/isValidSnapshot/getCheckpoints` でボス単体・SAVE_SCHEMA2/3チェックポイント/飛行高度JSON往復を確認。**未検証**：実Android/実GPU/物理パッド、実ブラウザ10〜20分E2E、縦横6画面HUD矩形/FPS、旧セーブ実DOM復帰・3D/2D実画面目視・水上/建物の長時間飛行、素材から能力継承。
- **Pages**：最終コードcommit `93e9422f` run **41358986835**。**build=success / report-build-status=success / deploy=success** をjobsで確認、コード公開反映済み。本ROADMAP追記commitのrunは別途確認。
- **次15分枠**：(1) `restoreSnapshot→normalizeStrongBossSave→enterStrongStage` で水面上の大鷲・旧SAVE_SCHEMA2・3チェックポイントを実DOM復元し、上空維持・再抽選0・投石など古い攻撃の暴発0を確認。(2) `updateFlyingEagle/nearbyVisibleWildPredator/startlePrey` の大鷲・ウサギ・ハト・橋・屋内・雨夜間を10分相当の動的連続試験し、獲物逃走と死骸/補充を回帰。(3) `updateMob` の強敵被弾→死亡→`kill/animalRemains/carryFood/eatFromDen` でDNA/希少素材/巣備蓄・成長の実操作連鎖を回帰。
- **次45分枠**：(1) `updateFlyingEagle` の水上飛行/建物屋上/急降下回避・予兆/FPSを実ブラウザで確認し、地形衝突・移動・死骸の不具合を最小修復。(2) `drawStrongCreature2D/drawStrongAnimal3D` の20種造形と縦390×844・横800×360/844×390/736×414/1536×691のHUD/ミニマップ・FPS・WebGL/2Dを実矩形でQA。(3) 全20種の固有戦闘・生態/希少素材の**実際の能力継承**を完成条件で検証し、未実装なら同ACTIVE_SPRINT_IDで次の縦パッケージへ継続。
- **進捗**：71/100据置。強敵の**基本登録は20/20種**、全種の実機E2E・希少素材の能力継承・長時間バランスは未完成。完成を偽らず継続。

## 共同スプリント・次担当｜2026/11/02 07:17 JST｜15分枠｜ACTIVE_SPRINT_ID=STRONG-STAGE-20P-COMPLETE｜アルビノ狼の陸上出現・野生狩猟復旧（19/20種）
- **開始HEAD→コード終了HEAD**：`2eeed3c1fa5a7c8881efd8e6679bf107aaca453e` → `77e2a7a5984741eb1735826f42d010d6e53aa1a7`。直前45分枠の19/20種、現行mainとDrive設計書V0.9末尾を照合。実変更：`neo-wild/game.js` commit `b442f6d2` blob `263ed0873f4e49bb5e8fa087a8aa29a0f7696ba3`、`neo-wild/index.html` rev commit `77e2a7a5` blob `572782a036174b960e8024c95416b45f58a78b58`。45分枠のwebgl3d.jsと他ゲームは変更なし。
- **実プレイ変化**：(1) 45分枠の19種追加後に残存した誤分類を修正。陸生のアルビノ狼が水棲集合に混入していたため地区0/1では出現できず、地区7では水中に生成されていた。水棲3種はそのまま、狼は地区0/1/7の陸上で20%地区抽選内の候補として正常出現。(2) 45分枠が意図した野生狩り登録が現物ソースに存在しなかったため捕食者集合に追加。ウサギ/ハトの警戒・逃走→狼の側面追跡→実噛み付き→死骸生成→狼の食後待機/生態密度変化を有効化。(3) 白狼専用の野生獲物感知335・追跡速度倍率.99・噛み付き係数.42/再攻撃1.38秒を付与。プレイヤー近接時は野生狩りを優先せず、既存の回避・突進/側面攻撃を維持。旧水中狼の保存は`restoreSnapshot`既存の`nearestDryBank`分岐へ戻る。巨大ムカデ追加なし。
- **動的QA**：配信JS 6/6全文構文PASS。V8実関数`spawnStrongBoss`で陸上白狼生成・強敵1体上限PASS、`huntWildPrey`で獲物追跡/被弾/覚醒逃走/死亡→死骸/食後待機/野生討伐でプレイヤー報酬なし等11/11 PASS、`strongStageCandidate`地区0/1/7・`isValidSnapshot/getCheckpoints/normalizeStrongBossSave`でSAVE_SCHEMA2/旧形式除外/3チェックポイント/単体ボス復元等13/13 PASS。旧水中狼の乾いた岸への移行は実分岐存在の静的確認のみ。**未検証**：実ブラウザ10～20分プレイ、実Android/実GPU/物理ゲームパッド、旧セーブDOM復元/3チェックポイント実E2E、縦横実DOM矩形、WebGL/2D目視・川橋の長距離経路。
- **Pages**：コードrev commit `77e2a7a5` run **41356352588**。**build=success / report-build-status=success / deploy=successをjobsで実確認、コード公開反映済み**。ROADMAP記録commit `cad4c6d9` run **41356424498** はbuild/deploy確認中。本追記コミットのrunは別途確認。
- **次15分枠**：(1) `restoreSnapshot→normalizeStrongBossSave→enterStrongStage`で旧水中アルビノ狼/地区0・1・7の保存復元→乾いた岸・再抽選なしを模擬DOMで実行。(2) `huntWildPrey→startlePrey→animalRemains→scavengeWildFood`を白狼/ウサギ/ハト・建物/橋・夜間で10分相当統合し、死骸食事/成長と野生補充を回帰。(3) `updateGorillaRock`の壁・ジャンプ・連続フレーム・死亡→リトライを検証し、衝突順序など破綻があれば最小修正。
- **次45分枠**：(1) 残り**大鷲1種**の飛行旋回→予兆→急降下→命中/回避→離脱・野生狩りを地上移動コピーなしで実装。(2) `drawStrongCreature2D/drawStrongAnimal3D`の翼/高度・白狼陸上モデルと縦横HUD・FPSを確認。(3) 全20種20%地区抽選・最大1体・SAVE_SCHEMA2/3チェックポイント・夜目・地図・ゲームパッド・Pages build/deployを統合回帰。
- **進捗**：71/100据置。19/20種の基礎実装、実機E2E・素材能力継承・大鷲が未完。

## 共同スプリント・次担当｜2026/11/02 06:54 JST｜45分枠｜ACTIVE_SPRINT_ID=STRONG-STAGE-20P-COMPLETE｜ゴリラ・ゾウ・アルビノ狼追加（19/20種）
- **開始HEAD→終了HEAD（コード）**：`d2ab280ce80d44470b232f4be32799f20afbc098` → `32d97f4eeac4a4ae5dd3a0da2ab01bad394468b5`。直前15分枠の巨大オオトカゲ出血・食事/巣治療とDrive設計正本末尾を確認し、既存16種/出現抽選/セーブを巻き戻さず、強敵3種を追加。コードコミット `918a4dc5`（3種・2D/3D・攻撃）、`286583d8`（アルビノ狼の野生狩猟/側面追跡）、`32d97f4e`（セーブ再開時の投石消去）。対象：`neo-wild/game.js` blob `ebe235f795fdc81315df6887cd58b712eb02c845`、`neo-wild/webgl3d.js` blob `5bd9904014bc7646462d1492dd3cd5332db6501b`、`neo-wild/index.html` blob `fce39ecf931bdd5a5fd437461887ef91aca449cc`。rev=strong-land-trio-v3。他ゲーム・ブログ・ルート変更なし。
- **実プレイ変化**：(1) **巨大ゴリラ**：地区2/5の20%抽選内。2D/3Dで太い腕・肩・顔を独立造形。近距離の掴みで移動低下・持久力-15、離れたプレイヤーへ予兆付きの実移動する岩を投げる。岩は軌道上で命中/回避/建物遮断を判定、当たるとHP/持久力減少。ロード直後に不可視の岩が命中しないよう未着弾の岩を消去。(2) **巨大ゾウ**：地区3/5、4本の太脚・大耳・鼻・牙を独立造形。広い踏みつけ射程、持久力-20と62の吹飛ばし、草食採食。体格69・HP880。(3) **アルビノの狼**：地区0/1/7の希少候補。白い毛・赤い目・耳/尾を2D/3D造形。79%の条件付き緊急回避、98の側方回避距離、側面回り込み・追跡強化、野生獲物を実際に襲撃。通常の強敵討伐で希少素材・DNA・死骸→運搬→巣備蓄に接続。(4) 既存の16種、ステージ抽選20%の内訳・最大1体・再入場固定、SAVE_SCHEMA=2/3チェックポイント、アルファ速度231.4、猫320、夜目・月齢・ミニマップ/右HUD・Gamepadを維持。
- **QA**：全配信JS 6/6構文PASS。2D/3D現物関数で3種のモデル各8以上の図形/プリミティブ・有限座標を検査。実関数`spawnStrongBoss`で3種の出現→最大1体→JSONセーブ復元、`normalizeStrongBossSave`で二重ボス除去・地区抽選復元、`strongStageCandidate`で8地区候補、`enterStrongStage`で19%出現/20%非出現/再入場無抽選、`applyStrongStrikeEffect`で掴み・踏みつけ・白狼持久低下、`updateGorillaRock`で岩命中/回避/障害物遮断を動的検査。初回35件中「白狼が野生捕食者に未登録」を検出→修正し、再検査28件+6件PASS。ソース全文構文6/6PASS。**未検証**：実ブラウザ10～20分E2E、実Android/実GPU/実物パッド、6画面BoundingClientRect/FPS、実旧セーブDOM復元・3チェックポイントE2E、3D/2D実画面目視、橋/川/夜目長時間回帰。
- **Pages**：コード`918a4dc5` run **41354196952** と`286583d8` run **41354286387** はbuild=success / deploy=success / report-build-status=successをjobsで確認。最終安全復旧commit `32d97f4e` run **41354354318** とROADMAP記録commit `2980d748` run **41354400640** も **build=success / deploy=success / report-build-status=success** をjobsで実確認。**19種の追加コードはPages公開反映済み**。本検証追記commitのrunは別途確認。進捗71/100据置。
- **次15分枠**：(1) `restoreSnapshot/normalizeStrongBossSave/getCheckpoints`で19種・3チェックポイントの実DOM再開、ゴリラ投石の消去・再抽選なし・白狼回避タイマー正常化を検証。(2) `huntWildPrey/forageWildBerries/kill/animalRemains/carryFood/eatFromDen`で白狼野生狩り・ゾウ/ゴリラ採食・討伐→希少素材→死骸→巣備蓄を連続動的検証。(3) `updateGorillaRock`の連続フレーム、壁越し/ジャンプ回避/被弾後死亡・リトライを再現し、衝突漏れがあれば最小修正。
- **次45分枠**：(1) **残り1種・大鷲**を空中旋回→予兆→急降下→地上命中/回避→飛び去り・野生狩り、2D/3Dの翼/高度、地区候補/20%抽選/1体上限/保存/報酬まで実装。地上NPCの移動コピーは禁止。(2) `drawStrongCreature2D/drawStrongAnimal3D`の19種と新大鷲、縦390×844・横800×360/844×390/736×414/1536×691のHUD/モデル/FPSを実ブラウザ回帰。(3) 全20種の旧SAVE_SCHEMA2・3チェックポイント・夜目/月齢・川橋・GamepadとPages build/deploy成功を統合確認し、素材能力継承の未完成部分を次スプリントへ残す。
- **進捗**：71/100据置。強敵の基本実装19/20、最後の大鷲・実機E2E・素材能力継承は未完。

## 共同スプリント・次担当｜2026/11/02 06:14 JST｜15分枠｜ACTIVE_SPRINT_ID=STRONG-STAGE-20P-COMPLETE｜大トカゲ出血→食事→巣で回復の実プレイ接続
- **開始HEAD→コード終了HEAD**：`efa805e94d05f010055f25aa1ee308020b5db931` → `fe846ea2263228d55d029aecb2e7ebaa0afc42b3`。45分枠の巨大オオトカゲ/サイ追加（16/20種）とDrive完成仕様設計書末尾を照合。45分枠の種類定義・3Dモデル、直前の水辺強敵・20%抽選・1体上限は変更なし。
- **実プレイ変化**：(1) 大トカゲの出血攻撃後、生命HUDに「出血 残り秒数」を表示し、出血状態を視認可能にした。(2) 野外の肉/食草を食べると満腹・HP回復に加え出血時間が摂食量×0.08秒短縮し、出血緩和を表示、食事直後にSAVE_SCHEMA2へ自動保存。(3) 巣の食料庫で肉/食草を食べると摂食量×0.15秒の出血緩和。生命/空腹が満タンでも出血中なら食事可能で、無傷・満腹時の無駄食いは防止。(4) 敵が巣の近くにいなければ出血の自然収束が2.2倍速。敵が165以内にいれば通常速度。元の出血ダメージ毎秒2.6・最長5.5秒と死亡/リトライを維持。
- **変更ファイル・SHA**：`neo-wild/game.js` コードcommit `f4bf705afda94414700958f40269fdc36d5fbf40` / blob `93d0322a429add260400035b3e2c7eed8adbd924`、`neo-wild/index.html` rev `20261102-strong-wound-recovery-v1` commit `fe846ea2263228d55d029aecb2e7ebaa0afc42b3` / blob `0440c8b49a54eba64b888bd0202234dd5cfffd84`。ROADMAPは本記録commit。neo-wild/外の変更なし。
- **QA**：変更前の厳密なblob/HEAD照合PASS。全配信JS全文構文6/6 PASS。実関数/更新ブロックの模擬V8で野外出血2.6HP/秒、巣安全時2.2倍・敵接近時通常、食事によるHP/満腹/出血変化・即保存、満腹でも巣で止血・在庫減算・再保存・表示、負数防止を計55アサーションPASS（初回パッチ36＋追加10＋討伐→死骸→運搬→巣備蓄9）。旧SAVE_SCHEMA2とチェックポイント3件の出血フィールド往復・旧セーブ欠損時0正規化を検証。さらに現物kill/carryFood関数で大トカゲ討伐→希少素材+1・DNA+17→死骸85→肉24運搬→巣備蓄24・即保存まで9/9 PASS。既存サイ正面装甲・希少素材/討伐・20%抽選・アルファ231.4・猫320・右HUD/小〉〉・ゲームパッド入力ソースは非変更。**未検証**：実ブラウザ10～20分のボス戦→帰巣E2E、実Android/実GPU/実物パッド、縦横6画面HUD BoundingClientRect/FPS、旧セーブの実DOM再開、橋/建物経路・3D/2D目視。
- **Pages**：コード+rev最終commit `fe846ea2` run **41350946611**、ROADMAP記録commit `16382bbb` run **41351005963**。両runの **build=success / deploy=success / report-build-status=success** を実確認。**出血治療・巣備蓄の新コードはPages公開反映済み**。本追記コミットのrunは別途確認。
- **次15分枠**：(1) `restoreSnapshot/currentSnapshot/getCheckpoints`で旧セーブ・3チェックポイントの大トカゲ出血中復帰→治療→保存→再開の実DOM統合を完了、復帰時出血二重適用・ボス増殖を防止。(2) `resolveAttack/kill/animalRemains/carryFood/eatFromDen`でサイ正面/側面とトカゲを討伐→希少素材・死骸→運搬→備蓄→巣LV2の実操作連鎖を検証し、不具合を修復。(3) `aquaticBankHunt/huntWildPrey/chooseEscape`で水辺・夜間の獲物逃走→捕食→死骸・巣備蓄の長時間プレイを完結。
- **次45分枠**：(1) 残4種「大鷲・巨大ゴリラ・巨大ゾウ・アルビノの狼」を固有AI/攻撃/2D/3D/20%抽選/1体制限/保存まで同じスプリントで追加。(2) `drawStrongCreature2D/drawStrongAnimal3D`の16種造形と出血HUD・サイ予兆を縦390×844/横800×360/844×390/736×414/1536×691で矩形/FPSを実ブラウザ検証。(3) `enterStrongStage/normalizeStrongBossSave`の旧セーブ/水辺3種・出血/希少素材を復元してPages build/deploy両successを記録。
- **進捗**：71/100据置。強敵基本実装16/20、出血治療ループの模擬動作はPASSだが実機E2E/残4種/素材能力継承は未完。

## 共同スプリント・次担当｜2026/11/02 05:52 JST｜45分枠｜ACTIVE_SPRINT_ID=STRONG-STAGE-20P-COMPLETE｜巨大オオトカゲ・サイを追加（16/20種）
- **開始HEAD→コード終了HEAD**：`39984e15f68a39da645faa2017860391b4d74e25` → `a6bb1bab0697827828e1fdbe6e3f4ca83c15047a`。直前15分枠の水辺3種・野生襲撃・水中セーブ修復を最新mainで引継ぎ、Drive設計書V0.9末尾を確認。変更はneo-wild/内のみ。
- **実プレイ変化**：(1) **巨大オオトカゲ**：地区2/3/5の20%抽選内に登場。四足・背中の棘・長い尾・低い頭を2D/3Dで個別造形。接近時に追跡加速、噛みつき命中で5.5秒の出血（毎秒2.6ダメージ）、野生ウサギ等を実際に狩り、死亡→死骸・地区獲物数へ連動。(2) **サイ**：地区3/5に登場。大きな胴・2本角・短い脚を2D/3Dで造形。角突進の予兆→0.57秒突進、吹飛ばし68・持久力-16。正面の皮は通常攻撃を48%に軽減、側面・飛びつき・奇襲・狼チャージは軽減しない。草食採食を優先し肉を漁らない。(3) 既存強敵14種の抽選20%・最大1体・再入場抽選固定・希少素材/DNA/死骸・旧SAVE_SCHEMA2を共有。強敵の3D毛色/腹色を新規spawnおよび旧セーブ復元で設定し、既存種も灰一色のフォールバックを避ける。(4) アルファ速度231.4、水中3種の専用AI・夜目・HUD・ゲームパッドを変更しない。
- **変更ファイル/コードSHA**：`neo-wild/game.js` blob `2c3be658ac45de14b891c3340286d46659de9327`、`neo-wild/webgl3d.js` blob `0a6aad131cb2e677344c6b42ef6dbc6aeccc3c72`、`neo-wild/index.html` blob `ce8f93f033f46a1eb80909a6dd3f16cf307d421b`（game.js/webgl3d.js rev=`20261102-strong-lizard-rhino-v1`）。コードcommit `a6bb1bab0697827828e1fdbe6e3f4ca83c15047a`。
- **QA PASS**：全配信JS構文6/6、2D/3D固有形状各2種（2D 26/14描画命令、3D 28/14プリミティブ）、現物`spawnStrongBoss/enterStrongStage`の20%境界・最大1体・再入場30回、現物`huntWildPrey`のトカゲ狩猟→獲物死亡→死骸→生態減少・採食クールダウン、現物`applyStrongStrikeEffect`の出血/角突進、現物`resolveAttack`のサイ正面10/側面20ダメージ・怯み差、SAVE_SCHEMA2の新フィールドJSON往復、アルファ速度231.4維持。**未検証**：実ブラウザでの連続戦闘10～20分、実Android/実GPU/実物Gamepad、縦横6画面BoundingClientRect/FPS、旧SAVE_SCHEMA2・3チェックポイント実DOM復元E2E、出血中死亡/復活・橋/建物の長距離経路。実関数モック試験を実機試験と称さない。
- **Pages**：コードcommit `a6bb1bab` run **41349006464** はbuild=success / deploy=success / report-build-status=success。ROADMAP記録commit `5b17c4c3` のrun **41349104094** もbuild=success / deploy=success / report-build-status=successを確認。**新2種の修正コードはPages公開反映済み**。本記録追補commitのrunは別途確認。
- **次15分枠**：(1) `restoreSnapshot→normalizeStrongBossSave→enterStrongStage`で旧SAVE_SCHEMA2と3チェックポイント・新2種/水辺3種・出血状態・素材を実DOM再開し、ボス増殖/旧位置への復帰を防ぐ。(2) `update→resolveAttack/kill→animalRemains→contextAction→denStores`でサイ正面/側面・トカゲ出血→撃破→希少素材/巣備蓄の一連動的プレイを検証。(3) `huntWildPrey/aquaticBankHunt/forageWildBerries`で野生捕食・サイ採食・水辺死骸を連続シミュレーションし、狩猟密度と橋迂回を調整。
- **次45分枠**：(1) 残り4種 **大鷲・巨大ゴリラ・巨大ゾウ・アルビノの狼** を地形/飛行・固有AI/攻撃・2D/3D・出現・討伐/保存まで段階追加。大鷲を地上NPCコピーにしない。(2) `drawStrongCreature2D/drawStrongAnimal3D`の16種の見た目・予兆・死骸、縦390×844/横800×360/844×390/736×414/1536×691でHUD矩形/FPSを実ブラウザ確認。(3) Pages build/deploy成功と旧セーブ/チェックポイント3件・月齢/夜目/ゲームパッドを回帰し、素材から能力継承の実装条件を進める。
- **進捗**：71/100据置。強敵基本実装16/20。20種完成・実機E2E・素材能力継承は未完。

## 共同スプリント・次担当｜2026/11/2 5:17:50 JST｜15分枠｜ACTIVE_SPRINT_ID=STRONG-STAGE-20P-COMPLETE｜水辺強敵の野生襲撃・水中セーブ復旧
- **開始HEAD→終了HEAD（コード）**：`4042642be09350a88dc38954a258ec8690e79e3f` → `51fd9af7bd36ff8221d420df1392e40bf11e7241`。対象は`neo-wild/game.js`・`neo-wild/index.html`と本ROADMAPのみ。直前45分枠14/20種、前15分枠の採食、Drive設計書V0.9末尾を確認。
- **プレイ変化**：(1) 巨大ワニ・巨大カバ・巨大アナコンダが岸辺のウサギ/ハト/イノシシを実際に攻撃。逃走・死亡・岸に残る死骸・地区獲物数へ連動。死骸はプレイヤーが食事/運搬/巣備蓄できる既存形式。(2) 水辺NPC襲撃は壁遮断・水中獲物除外・再攻撃待機・プレイヤー戦闘時抑止を実装。ボスは水から出ない。(3) SAVE_SCHEMA2の水辺ボス再開で水中位置を維持し、旧岸上座標は同地区の水へ補正。読み込み直後の予兆なし攻撃を解除。(4) 水辺ボスのattack/swingタイマー二重減算を解消。強敵出現20%・同時1体・アルファ231.4・即時旋回・小〉〉・右HUD・夜目は不変。
- **変更**：game.js と index.html のキャッシュrev=`20261102-aquatic-bank-save-v1`。コードcommit `51fd9af7bd36ff8221d420df1392e40bf11e7241`。ROADMAPは本記録コミット。
- **QA**：全配信JS構文 **6/6 PASS**。現物関数`updateAquaticStrong/aquaticBankHunt/nearestAquaticWater`動的 **30/30 PASS**（3種の野生襲撃→死亡→岸死骸→生態更新、水域移動・クールダウン、壁遮断、NPC逃走、交戦中抑止、旧水中/岸上座標補正）。**未検証**：実ブラウザ10～20分、実Android/実GPU/物理Gamepad、縦横DOM矩形/FPS、旧SAVE_SCHEMA2と3チェックポイントの実DOM復元E2E、橋長距離AI。模擬関数試験を実機PASSとは呼ばない。
- **Pages**：コードcommit `51fd9af7` のrun **41346094939** はbuild=success、deploy=cancelled（後続ROADMAPコミットで置換）。最新ROADMAP commit `2d4d8da5` のrun **41346123680** は **build=success / deploy=success / report-build-status=success** を確認。**修正コードの公開反映確認済み**。本記録コミットの新runは別途確認。
- **次15分枠**：(1) `restoreSnapshot→normalizeStrongBossSave→enterStrongStage`で水辺3種/旧保存/強敵素材/3チェックポイントを実DOM連続再開し、ボス再抽選や陸上転移がないこと。(2) `aquaticBankHunt→animalRemains→contextAction/carryFood→denStores`で岸死骸→巣備蓄→巣LV2の実プレイを完成。(3) 猫/狐/狼の即時180度転換・小〉〉・地図/SCORE/HUNT・冬夜目の縦横実矩形QA。
- **次45分枠**：(1) `webgl3d.js/drawStrongCreature2D`の水辺3種の野生襲撃・予兆・死骸の目視とFPSを回帰。(2) 未実装6種（巨大オオトカゲ/大鷲/巨大ゴリラ/サイ/巨大ゾウ/アルビノ狼）の固有AI/攻撃/造形/報酬を順次追加。(3) Pages build/deploy・縦横HUD・夜目・Gamepad・旧保存を確認。今回のgame.jsの水中保存/襲撃を巻き戻さない。
- **進捗**：71/100据置、強敵基本実装14/20。実機E2E・素材能力継承未完。

## 共同スプリント・次担当｜2026-11-02 04:52 JST｜45分枠｜ACTIVE_SPRINT_ID=STRONG-STAGE-20P-COMPLETE｜水辺強敵3種・14/20
- **開始HEAD→コード終了HEAD**：`64f267abee486e9bee830fb5484493312a42b8b2` → `5dc61b02142877912ed338fda2d713d18185fde0`。直前15分枠の捕食・冬採食・ライオン追撃とDrive設計書末尾を照合。15分枠のgame.js変更を現行main上で引継ぎ、古い版へ戻していない。
- **実コード**：`neo-wild/game.js` commit `290819f4631fe73fec41f2abfd120de832373d28` blob `2650959f429968ddec42c41122357aa52aca1f99`、`neo-wild/webgl3d.js` commit `08352ebb880a6aebceaee8df57518d1903c3557f` blob `e635613f5eac102255be59ce9076ebabd9cff1e5`、`neo-wild/index.html` rev commit `5dc61b02142877912ed338fda2d713d18185fde0` blob `efaedb2100ceaf20c2fb15ec3927dbe779031433`。ROADMAP記録は本コミット。neo-wild/以外変更なし。
- **プレイ変化**：(1) **巨大ワニ・巨大カバ・巨大アナコンダ**を地区4/7の水辺限定候補として追加。地区初回抽選20%の内訳で選び、最大1体・再入場抽選固定・SAVE_SCHEMA2を維持。水域が近くになければ候補から外し、陸上ランダム出現を禁止。(2) 水中のみの専用移動AIでワニ潜伏接近、カバ突進、アナコンダ蛇行を分岐。水辺の攻撃予兆→命中/回避/壁遮断、引込・吹飛ばし・締付/持久力低下を分離。プレイヤーは従来どおり水に入れず、橋も通れる。(3) 2Dと3Dでワニの長い顎/背甲、カバの巨体/短足/口、アナコンダの長い蛇行胴を別造形。通常動物の水辺逃走、ミニマップ強敵、討伐DNA/希少素材と岸への死骸漂着・採食を連動。(4) アルファ速度231.4・既存11種・ライオン0.48秒追撃・右上HUD・小〉〉・即時旋回・Gamepad/夜目を維持。
- **QA PASS**：配信JS全文構文6/6、実関数による水域候補/陸地除外/出現/最大1体/再入場/20%境界/3種の攻撃と壁遮断19項目、3種の2D/3D実造形各3種（2D形状32/15/20、3Dプリミティブ25/14/18）、実関数による旧SAVE_SCHEMA2・強敵状態・希少素材・チェックポイント3件・複数ボス復元正規化4項目PASS。**未検証**：実ブラウザ10～20分E2E、Android/実GPU/物理パッド、縦390×844・横800×360等の実DOM矩形、実2D/3D目視・FPS、橋経由の長距離水辺経路、実セーブDOM復元E2E。
- **Pages**：コード最終commit `5dc61b02` run **41343732737**、ROADMAP記録commit `1380821d` run **41343839253**。両runとも **build=success / deploy=success / report-build-status=success** を実確認。**14/20種のコード公開反映済み**。この追記コミットの新runは別途確認。
- **次15分枠**：(1) `updateAquaticStrong→aquaticMove→applyStrongStrikeEffect`のワニ/カバ/アナコンダ攻撃予兆→回避→命中→水際離脱を実関数で10分相当再現し、追撃無限/壁越し/橋上貫通があれば修正。(2) `currentSnapshot→restoreSnapshot→normalizeStrongBossSave→recordCheckpoint`の水中位置・attack/windup・素材・旧SAVE_SCHEMA2・3チェックポイントの再開E2Eを追加し、再入場抽選を維持。(3) `huntWildPrey/scavengeWildFood`と水辺逃走・岸の死骸の食事→巣備蓄→成長を統合QAし、通常獲物の水中ワープ禁止。
- **次45分枠**：(1) 14/20種の3D/2D・地形・ミニマップ・戦闘・保存を統合回帰し、水辺3種のモデル目視と近岸での攻撃射程・兆候を改善。(2) 未実装6種 **巨大オオトカゲ・大鷲・巨大ゴリラ・サイ・巨大ゾウ・アルビノの狼**を固有AI/攻撃/造形/生態/報酬で順次追加（巨大ムカデは禁止）。(3) Pages runのbuild/deploy両success、縦横HUD・夜目・ゲームパッド・旧セーブを実ブラウザで確認。現行HEAD/blob再照合し競合時は最小差分のみ。
- **進捗**：71/100据置。強敵基本実装**14/20**、未実装6種。全20種・実機QA・希少素材による能力継承は未完成。

## 共通スプリント｜2026-11-02 04:12 JST｜15分枠｜ACTIVE_SPRINT_ID=STRONG-STAGE-20P-COMPLETE｜捕食後の採食・冬の見える食物・ライオン連撃回帰
- **開始HEAD→コード終了HEAD**：`18245709d18b604343257e9df20225c3cab823ee` → `56dbcc5c22e7146ccb165f8b6d0b732896f1e8df`。直前45分枠の11/20種・ライオン追撃0.48秒、Drive設計書V0.9末尾、前15分枠の死骸採食を照合。既存の強敵定義/3D、即時旋回、ミッション小〉〉、HUD、旧保存、Gamepadは変更なし。変更は`neo-wild/game.js`と`neo-wild/index.html`（game.js rev=`20261102-wild-feed-lion-v1`）のみ。コードコミット`56dbcc5c`。
- **プレイ動作の連動修正**：(1) 捕食者が死骸の近くにいても壁越しに食べたり、その場で食べられない死骸に固執する状態を防ぎ、届く死骸を選んでHPを回復。(2) 草食のベリー・植物選択も近距離の壁越し採食を除外し、冬に描画されない茂みを食べず見える草を食べる。春の茂み採食は維持。(3) 巨大ライオンの2連撃で追撃を回避・壁遮断・中断した場合に`lionCombo`を解消し、次の攻撃が追撃の残り状態を引きずらない。0.48秒追撃/0.42秒無敵時間は変更なし。
- **QA**：実ソース関数と現行combat分岐の模擬V8動的12/12 PASS（冬の見える草/不可視茂み除外/春採食/壁越し採食防止/到達死骸の選択・HP回復/ライオン初撃→2撃目命中/回避/壁遮断/中断/旧状態解消）。旧SAVE_SCHEMA=2の`currentSnapshot/isValidSnapshot/getCheckpoints/normalizeStrongBossSave`を実関数で検証：保存可能・強敵状態保持・旧データ受入・チェックポイント3件上限・複数ボス正規化を確認。全配信JS構文6/6 PASS。**未検証**：実ブラウザ10～20分E2E、実Android/実GPU/物理パッド、全6画面BoundingClientRect/FPS、旧セーブの実DOM復元E2E、川橋を含む遠距離経路と3D/2D目視。模擬PASSを実機PASSと扱わない。
- **Pages**：コードcommit `56dbcc5c` のPages run **41340518254**、build=success / deploy=success / report-build-status=success。**コード公開反映確認済み**。本ROADMAP記録コミットのrunは別途確認する。
- **次15分枠**：(1) `huntWildPrey→scavengeWildFood→toBones`の捕食者が橋/建物を迂回し、死骸採食→HP回復→骨化する10分相当の動的経路試験。進めない経路は`steerPursuit/wildlifeBridgeWaypoint`を最小修正。(2) `currentSnapshot/restoreSnapshot/recordCheckpoint`を旧SAVE_SCHEMA2と強敵素材・`lionCombo`付き3チェックポイントで模擬DOM統合試験し、死亡後/再開後の攻撃・教程・備蓄の整合を修復。(3) 猫/狐/狼の180度即時移動・小〉〉・地図/SCORE/HUNT・夜目・冬潜伏を縦横モックで回帰。
- **次45分枠**：(1) `update`のライオン追撃0.48秒とプレイヤー無敵0.42秒を実戦連続試験し、初撃→2撃目/空振り/壁/反撃/保存復元の攻撃状態を確認。(2) 同一11/20種の強敵出現20%・1体制限・野生捕食・固有3D/2Dを維持し、残9種のうち水辺固有行動（巨大ワニ/カバ/アナコンダ）を`waterBlocksLand/routeClear`と整合させて実装。(3) Pages build/deployと縦390×844・横800×360、4ボタン/ゲームパッド/夜目のQA。15分枠の`game.js`変更を巻き戻さない。
- **進捗**：71/100据置。強敵基本実装11/20、残9種。実機・長時間E2E未完。

## 共通スプリント追補｜2026-11-02 03:58 JST｜45分枠｜ACTIVE_SPRINT_ID=STRONG-STAGE-20P-COMPLETE｜ライオン連撃の実命中タイミング修正
- 直前コード`feda61cc`の巨大ライオン追撃は初撃後0.30秒で発動する一方、初撃命中時のプレイヤー無敵時間が0.42秒で、回避しなくても追撃が無効化される競合を確認。追撃予兆を**0.48秒**へ変更し、0.42秒の無敵が終了してから命中判定するよう調整。移動・回避・壁による空振りは維持。変更：game.js commit `910278e9c2b045b03902b4138a4aedeccb5cfdba`（blob `5f9ab872bdf8428fe64bd49c452ad45651c82040`）、index.html rev v2 commit `247a6e78436042895d932e159613bcc534765796`。JS全文構文PASS、0.48>0.42の時系列確認PASS。**実ゲーム連撃E2Eは未検証**。
- 直前コード`feda61cc`のPages run **41338932062** はbuild/deploy/reportすべてsuccessを確認。**現行コード`247a6e78`のPagesは別runで確認必須**。15分/45分枠の未完事項と進捗71/100は直前記録から不変。

## 共通スプリント｜2026-11-02 03:54 JST｜45分枠｜ACTIVE_SPRINT_ID=STRONG-STAGE-20P-COMPLETE｜陸上強敵3種＋野生食性・群れ防衛
- **開始HEAD→コード終了HEAD**：`c02f47db2217ddfc9e7ae2c6f3f30a30d64ce488` → `feda61cc2423c4ed099fb108ecc710ef64d9ace7`。前15分枠の捕食者採食・イノシシ逃走、ROADMAP先頭、Drive完成仕様設計書末尾を確認。新規タスク・他ゲーム・他ディレクトリ非変更。
- **実プレイ変化**：(1) **巨大ライオン**：地区3/5/6の20%抽選内に追加。咆哮予兆、実命中で持久力-12、初撃命中後の短い追撃予兆と2連撃、野生獲物を追跡・捕食。(2) **巨大ヘラジカ**：地区2/5/7で候補。大きな枝角を2D/3Dで造形、角突進→ノックバック43・持久力-10、普段は草食。(3) **巨大バッファロー**：地区2/4/5で候補。巨体・背の隆起・湾曲角を2D/3Dで造形、予兆→猛突進・ノックバック62。近距離の野生捕食者へ22ダメージ/気絶・近くの通常イノシシが逃走する群れ防衛を追加、普段は草食。(4) 3種とも既存`enterStrongStage/spawnStrongBoss`の地区初回20%・最大1体・再入場抽選固定、`kill`のDNA/希少素材/巣在庫/旧SAVE_SCHEMA2保存を継承。アルファ速度231.4不変。**基本実装11/20、残9種**。
- **コードコミット**：game.js `067ccb69ff6b4ee43bfd3e845977bd14f6e7e8ba`（blob `1b24e998dc4ed5c7adff253c27ce3b10fdfd1426`）、webgl3d.js `a14a54888a6d4d22177104cc763ae6a914fce26f`（blob `5f70b90274f9517c4dde32a78ae70f66a0503f63`）、index.html rev `feda61cc2423c4ed099fb108ecc710ef64d9ace7`（blob `69a732b607375f7e3632ea999a928a430a1b2201`）。
- **QA PASS**：変更JS全文構文、3種2D固有造形3/3、3D専用プリミティブ3/3（ライオン29・ヘラジカ19・バッファロー20）、実関数の出現/非出現20%境界・地区再入場各30回/増殖なし・バッファロー防衛22ダメージ/通常イノシシ逃走/再攻撃抑制・3種の攻撃副作用 **27項目PASS**。強敵抽選総率20%据置、既存アルファ231.4維持。**未試験**：全6JSを最終コードでまとめて再コンパイル、実ブラウザでの10～20分連続戦闘、ライオン2撃目の回避/壁衝突、旧セーブ/3チェックポイント動的E2E、実Android/実GPU/物理パッド、縦横6画面の実DOM矩形、WebGL/2D実描画目視・FPS、水際経路。
- **Pages**：コード最終commit `feda61cc2423c4ed099fb108ecc710ef64d9ace7` run **41338932062**。確認時 build=success、deploy=in_progress、report-build-status=success。**公開完了未確認**（deploy successまで断定禁止）。本ROADMAP記録commitで別run発生時は新runを確認。
- **次15分枠**：(1) `game.js:update`でライオン初撃→連撃/回避/空振り、ヘラジカ・バッファローの予兆→chargeTime→衝突/壁激突を実関数で連続動的QAし、不発/連撃無限を修復。(2) `currentSnapshot/restoreSnapshot/recordCheckpoint`で新3種の討伐素材と地区抽選結果、旧SAVE_SCHEMA2、3スロットの復元E2E。(3) `huntWildPrey/defendBuffaloHerd/forageWildBerries`の捕食→草食逃走→死骸採食・群れ防衛を10分相当で動的検証、壁/橋・夜間を回帰。
- **次45分枠**：(1) 現行11種の3D/2D・当たり判定・野生AI・ミニマップ・報酬の回帰と、残9種の種類別未実装を整理。(2) **巨大ワニ・巨大カバ・巨大アナコンダ**は地上動物のコピー禁止。川・橋の既存水域判定を読み、水辺限定出現・水陸移動/潜伏・固有攻撃・2D/3D・保存を一体で実装。(3) Pages build/deploy両successと縦390×844/横800×360のHUD/夜目/ゲームパッドを実ブラウザ相当で確認。次回も同一ACTIVE_SPRINT_IDを継続。
- **進捗**：71/100据置。11/20種は出現/攻撃/固有2D/3D/報酬の基本実装であり、全20種・実機QA・素材による能力継承は未完成。

## 共通スプリント｜2026-11-02 03時台 JST｜15分枠｜ACTIVE_SPRINT_ID=STRONG-STAGE-20P-COMPLETE｜野生狩猟→採食・視認警戒・イノシシ逃走
- **開始HEAD→コード終了HEAD**：`307d987f20feb937db9b397d690f1f85ac5b4e86` → `2e389aa19f70f40bded3a18cc7d2a84b82aa59cb`。前45分枠の強敵8/20種、ROADMAP、Drive設計書V0.9末尾を確認。neo-wild/以外は変更なし。
- **プレイ変化**：(1) 犬/強敵が獲物を倒すと8秒間死骸採食を優先し、生命回復・死骸減少。別の獲物が近くても新鮮な死骸を食べる。(2) ウサギ/ハトの警戒・フェイント・採食・飲水は壁で遮られていない実際の捕食者だけに反応。草食イノシシへの誤警戒を解消。(3) 通常イノシシも実際の捕食者から逃走し、障害物時は方向を再選択。巨大イノシシは草食強敵のまま。(4) feedAfterKill/scavenge状態を旧SAVE_SCHEMA2のNPC復元時に正規化。強敵抽選20%・最大1体・3チェックポイント・素材保存を維持。
- **変更**：game.js `bbad6fd328a7479e9983b5161f3212703bb6eb21`、index.html game.js rev `2e389aa19f70f40bded3a18cc7d2a84b82aa59cb`。gamepad.js、webgl3d.js、CSS、45分枠の強敵定義は非変更。
- **QA**：実関数動的隔離試験12/12 PASS（捕食者/草食分類・壁越し・野生死亡→死骸/生態→採食/回復・狩猟一時停止・クールダウン）、全JS構文6/6 PASS。**未検証**：update全体10～20分E2E、旧セーブ/3チェックポイント動的E2E、実ブラウザ縦横/FPS、実Android/実GPU/物理パッド、川橋経路。
- **Pages**：コードcommit `2e389aa19f70f40bded3a18cc7d2a84b82aa59cb` のrun ID/build/deploy **未確認**。両success確認まで公開完了とは報告しない。
- **次45分枠**：(1) 新3種の攻撃予兆→命中/空振り/壁衝突を動的QAし、feedAfterKillを維持。(2) 残12種から巨大ライオン・巨大ヘラジカ・巨大バッファローを固有攻撃/2D/3D/野生食性一体で追加し、新肉食種をWILD_PREDATOR_TYPESへ連動。(3) 旧保存/3チェックポイント、即時旋回/小〉〉/夜目/縦横HUD/Pages build/deployを回帰。
- **次15分枠**：(1) update→huntWildPrey→scavengeWildFoodの10分相当連続試験で死骸への経路/橋迂回と捕食圧を確認。(2) currentSnapshot/restoreSnapshot/recordCheckpointの3スロットと強敵素材・feedAfterKill復元を実関数E2E。(3) 通常イノシシ逃走と夜間ウサギ休息→覚醒→狩りを3D/2Dモックで再現し、HUD/入力を回帰。
- **進捗**：71/100据置。強敵8/20種、残12種。実ブラウザE2E/旧保存E2E/Pages未確認を未完として継続。

## 共通スプリント｜2026/11/02 02:52 JST｜45分枠｜ACTIVE_SPRINT_ID=STRONG-STAGE-20P-COMPLETE｜STRONG-GROUND-3-20261102-0245
- **開始HEAD→コード終了HEAD**：`230e4946c4532ec841ac21df4bd19cf64eea40fa` → `90897211a84b407ac12f95f927524d72def04517`。直前15分枠の`huntWildPrey/isWildPredator`野生狩猟・休息覚醒・死骸生態統合を現行mainから継承し、Drive「WILD RECLAIM｜完成仕様設計書」末尾を再確認。15分枠の操作・教程・猫速度・旧セーブ・ミニマップ・Gamepadは変更なし。
- **実プレイで変わる完成パッケージ（3種追加、既存5種を重複作成せず）**：(1) **隻眼の狼**：地区0/1で抽選候補、左右回り込み・側面待伏せ・フェイント→予兆付き飛びかかり→衝突ノックバック＋持久力-8。片眼の傷・細長い狼の耳/胴体/尾を2Dと3Dに別造形。(2) **白虎**：森林/旧動物園の地区2/3/5で候補、大型の白い虎に縞・大きな四肢・長い尾、長距離予兆→高速跳躍→実ダメージ＋ノックバック。2D/3Dで同じ固有シルエット。(3) **巨大ハイエナ**：地区4/6/7で候補、持久追跡（対プレイヤー追跡速度補正、野生獲物への長い索敵・短い噛みつき間隔）→命中時持久力-16、肩の盛り上がり・傾斜胴・背毛・太い顎を2D/3Dで専用造形。(4) 3種とも既存野生狩猟`huntWildPrey`へ統合し、獲物の逃走・死亡→死骸・生態カウント更新、プレイヤー撃破→DNA＋固有希少素材→巣在庫/既存`strongTrophies`保存へ接続。地区初回抽選総量**20%据置**・同時**最大1体**・再入場30回で増殖なし、既存アルファ速度**231.4据置**。
- **実変更**：`neo-wild/game.js`（新種データ、地区候補・天候/昼夜重み、3攻撃プロフィール、命中副作用、追跡/野生捕食AI、2D固有造形/名前表示）、`neo-wild/webgl3d.js`（3種3D専用造形＋跳躍姿勢）、`neo-wild/index.html`（game.js/webgl3d.jsキャッシュrev=`20261102-strong-ground-3-v1`）。コードcommit `90897211a84b407ac12f95f927524d72def04517`。他ディレクトリ/他ゲーム非変更。
- **QA PASS**：配信全JS構文6/6、3種の`enterStrongStage→spawnStrongBoss`実関数抽選/各30回再入場で増殖なし（計90回）、`normalizeStrongBossSave`複数強敵正規化3/3、20%当選境界、アルファ速度231.4、`applyStrongStrikeEffect`3種のノックバック/持久力変化、`drawStrongCreature2D`3新種＋既存黒豹（図形数14/29/21/12）、`drawStrongAnimal3D`3新種＋既存老熊（プリミティブ数17/32/24/25）、`huntWildPrey`3種が実HP減少→死亡/死骸→生態数更新、`kill`3種のDNAと固有素材獲得（14/18/15 DNA、各素材+1）。攻撃予兆/チャージ分岐・夜間生態系/地図/旧SAVE_SCHEMA2・3チェックポイントはソース整合確認。**未検証**：新3種の実ブラウザ連続戦闘10～20分、旧セーブ/3チェックポイントの動的E2E、実Android/実GPU目視/物理Gamepad、6画面実DOM矩形/FPS、川/橋/水辺の実経路。模擬実関数試験を実機PASSとは称さない。
- **Pages**：コードcommit `90897211a84b407ac12f95f927524d72def04517` のrun **41333632089**（記録時点workflow=`completed/success`、build=`success`、deploy=`success`、report-build-status=`success`）。**build/deploy両successになるまで公開済みと断定禁止**。ROADMAP記録コミット自体のrunは別途確認。
- **次15分枠**：(1) `game.js:huntWildPrey/isWildPredator/nightCoverThreatened`で新3種の狩猟→獲物覚醒/逃走→壁/橋迂回→死骸→肉食動物の採食まで10分相当の動的シミュレーション、捕食圧/草食数の偏りを修正。(2) `currentSnapshot/restoreSnapshot/recordCheckpoint/renderDenInventory`で新3種の討伐素材・一回限り20%抽選・旧SAVE_SCHEMA2・チェックポイント3件の保存/復元E2Eを実関数で確認。(3) `game.js`の強敵攻撃中に即時180度方向転換・巣備蓄・小「〉〉」・ミニマップ/夜目が競合しないことを縦横モックで試験し、次45分枠へ不具合の具体的関数を引き継ぐ。
- **次45分枠**：(1) `game.js:update`の3種`windup→chargeTime→move→P.hp/P.sp`実命中/空振り/壁激突・予兆中プレイヤー回避の動的テスト、必要なら予兆・追跡速度・攻撃間隔を調整。(2) 残12種から**巨大ライオン・巨大ヘラジカ・巨大バッファロー**を、固有行動/攻撃/2D/3D/野生食性まで一体のプレイ可能なパッケージで追加。水生/飛行種を地上NPCコピーで実装しない。(3) Pages run build/deploy両successと現物の縦390×844・横800×360等HUD/3D/2Dを確認、実機不可なら範囲を記録。
- **進捗**：71/100据置。強敵**8/20種**が基本出現/固有攻撃/2D/3D/報酬まで統合、**残12種未実装**。実ブラウザ長時間E2Eと固有継承能力解放は未完。ACTIVE_SPRINT_IDを維持し次15/45分枠へ連携。

## 共通スプリント｜2026-11-02 02:22 JST｜15分枠｜ACTIVE_SPRINT_ID=STRONG-STAGE-20P-COMPLETE｜強敵の野生狩猟・獲物覚醒・死骸・草食統合
- **開始HEAD→コード終了HEAD**：`273b539897bf811492418f6b0340942c8cf38f49` → `2600c4267c797f8500dad9333a459948e69a755a`。前45分枠の4種固有攻撃/2D/3D/希少素材実装とROADMAP先頭、Drive完成仕様設計書V0.9末尾を確認。前枠のgamepad.js・即時方向転換・夜目・HUD・ミッション〉〉を変更せず、neo-wild/のみ編集。
- **プレイ可能な連動改善**：(1) 従来野犬/アルファ専用だった野生狩りを大蛇・老熊・黒豹へ拡張。獲物を実際に探す→障害物/橋を避けて追う→噛みつきHP減少→覚醒/逃走→死亡時は死骸化・生態数更新。黒豹は移動中の獲物へ側面回り込みを適用。(2) 夜間休息中のウサギ/ハトは新たな捕食者にも警戒して覚醒、冬の可視遮蔽物候補でも強敵の接近を避ける。(3) 巨大イノシシは死骸食い・肉食追跡ではなく既存の草/食草を採食する。獲物の採食は新捕食者が近くにいると中断。(4) 野生同士の討伐はプレイヤーDNA/希少素材を増やさず、野生のイノシシ死亡を草食小動物数から誤減算しない。プレイヤーへの強敵攻撃・固有予兆/突進は既存のまま。
- **実変更**：`game.js` commit `e9ccf483fb0dc3e3e111c4e16c3d2830436cdc44`（blob `ca19098c7d0eb688d54f47bfd30f3507f395d3e1`）、`index.html` commit `2600c4267c797f8500dad9333a459948e69a755a`（game.js rev=`20261102-wild-predator-chain-v1`）。`webgl3d.js`・`gamepad.js`・CSSは非変更。追加実関数`isWildPredator/huntWildPrey`、変更`update`内NPCループ/`updateIndoorRest/nightCoverThreatened/forageWildBerries/wildPreyInterceptPoint`。
- **QA**：実関数をV8モック世界で実行する野生狩り25/25 PASS（野犬/アルファ/大蛇/老熊/黒豹の追跡→実ダメージ→獲物覚醒→攻撃クールダウン、巨大イノシシ非肉食、プレイヤー発見時の中止、壁越し禁止、ウサギ死亡→死骸/生態減、イノシシ死亡→死骸/草食数維持、範囲外/予兆中の禁止）。現行6 JS全文構文6/6 PASS。静的回帰：SAVE_SCHEMA2・3チェックポイント・1秒autosave・強敵20%/1体・生き残れ！・小〉〉・即時旋回・冬遮蔽物・夜目・Gamepad/3D/2D構造・強敵素材保存復元は現行ソースで確認。**未検証**：実ブラウザ10～20分E2E、旧セーブ/チェックポイントの動的E2E、実Android・実GPU/物理パッド、FPS/縦横6矩形、川/橋の実経路プレイ。V8模擬テストを実機検証済みとは扱わない。
- **Pages**：コードHEAD `2600c426` のrun **41331070956** は記録時点build=success、deploy=queued、report-build-status=in_progress。**公開成功未確認**。このROADMAP記録コミットで新runが発生する場合はそのbuild/deploy両方を別途確認。
- **次15分枠**：(1) `update`内`huntWildPrey`と`scavengeWildFood`を実ゲーム1地区10分相当で連続試験。夜間のウサギ休息→黒豹/大蛇接近→覚醒→橋/壁迂回→攻撃→死骸→捕食者の食事を通し、停滞時は`steerPursuit`の実経路を最小修正。(2) `currentSnapshot/restoreSnapshot/recordCheckpoint`で旧SAVE_SCHEMA2・3チェックポイントと強敵戦闘/希少素材の復元を模擬DOMで動的検証、再開後の野生狩り/生存HUD重複通知なしを確認。(3) 入力180度即時旋回とmission〉〉・巣備蓄・夜目を縦横で回帰し、45分枠の新ボスと競合させない。
- **次45分枠**：(1) 今回追加した`huntWildPrey/isWildPredator`を維持し、強敵4種の2D/3D狩猟モーション・死骸/モデルを実ブラウザ相当で確認、必要なら`webgl3d.js/drawStrongCreature2D`のみ修正。(2) 残り15種のうち地上生物を`STRONG_REGIONS/STRONG_ATTACK_PROFILES`へ追加する際、捕食/草食分類を15分枠の`WILD_PREDATOR_TYPES`と連携。1地区20%・最大1体を維持。(3) 4ボタン/横画面/夜間満月照明・実Gamepadと新ボスの突進を回帰。前枠の操作とHUDを巻き戻さない。
- **進捗**：71/100据置。連鎖動作はモックPASSだが実ブラウザE2E/旧保存E2EとPages deploy完了未確認。ACTIVE_SPRINT_IDを継続し、強敵20種は既存アルファ＋4種、残15種未実装。

## 共通スプリント｜2026-11-02 01:45 JST｜45分枠｜ACTIVE_SPRINT_ID=STRONG-STAGE-20P-COMPLETE｜強敵4種の攻撃・固有モデル・報酬
- **開始HEAD→コード終了HEAD**：`ae6ddb7aa2245a037d1499c6ada2f39a1e3e9e01` → `8a4d9413247aabb5f1910c26973f85309cd7ab75`。直前15分枠の小「〉〉」42/42模擬QAと即時方向転換、共有スプリントを読了。Drive「完成仕様設計書 V0.9」末尾の夜目・巣/猫・川/雨・狩猟要件を確認。今回変更は`neo-wild/`のみ。
- **プレイ可能な実装**：①既存大蛇・老熊・巨大イノシシ・黒豹の4種に別々の予兆/発生時間/間合い/ダメージ/攻撃後待機を実装。大蛇は命中で約1.9秒の移動減速（実歩行速度0.54倍）、老熊は高威力の爪と吹き飛ばし、巨大イノシシは長い予兆→直進猛突進・吹き飛ばし、黒豹は短い予兆→高速飛びかかり。衝突判定・無敵時間・空振り・地形に沿うmove()は既存実コードを使用。②Canvas2DとWebGL3Dの両方に、大蛇の蛇行胴体/舌、老熊の巨体/爪、巨大イノシシの背毛/牙、黒豹の細長い胴/尾/耳の独立した形状を実装。色だけの変更ではない。既存アルファ・普通の動物の描画分岐は維持。③プレイヤーが強敵を倒すと通常のDNA経験値に加えて種類別の希少素材+1を`strongTrophies`へ加算し、獲得通知と巣在庫画面の素材一覧へ表示。既存SAVE_SCHEMA=2の保存・復元フィールドを再利用しスキーマ変更なし。素材による継承能力の解放は**未実装**であり、解放済みと称しない。
- **変更コミット**：`game.js` `a3018f3f`（4種の攻撃/2D）→`248b3168`（討伐素材と巣在庫）、`webgl3d.js` `4b7ebf31`（4種3D）、`index.html` `2c52e1dd`→`8a4d9413`（game.js/webgl3d.jsキャッシュrev更新）。`gamepad.js`・15分枠のAI/入力・保存形式は変更していない。
- **動的QA**：全6 JS全文構文 **6/6 PASS**。現物`drawCreature`＋Canvas2D模擬ctxで大蛇/老熊/巨大イノシシ/黒豹/通常野犬の描画 **5/5 PASS**。現物`animal`＋3Dプリミティブ計測で4種＋通常野犬 **5/5 PASS**。強敵4種のwindup→命中/チャージ移行 **4/4 PASS**、巨大イノシシ/黒豹と既存アルファ/イノシシの実チャージ区間→命中・無敵時間・吹き飛ばし **4/4 PASS**。強敵/通常個体のkill→DNAと素材の分離 **2/2 PASS**。実`enterStrongStage`の20%抽選固定・同地区30回再入場で増殖なし・撃破後再抽選なし・複数強敵セーブ正規化 **PASS**。既存アルファ速度231.4・SAVE_SCHEMA2・strongRolls/strongTrophies保存復元フィールドを静的回帰確認。
- **Pages公開**：コード最終HEAD `8a4d9413247aabb5f1910c26973f85309cd7ab75`、workflow run **41327886968**：build/report-build-status/deploy全success（2026-11-02 JST）。本ROADMAP記録コミットのPagesは別runで確認。**未検証**：実Android、実GPU描画目視、物理ゲームパッド、長時間プレイ/FPS、旧セーブの実ブラウザE2E、6画面実DOM矩形、現物の難易度/当たり判定体感。模擬動的試験を実機PASSとは扱わない。
- **次15分枠**：(1) `game.js`のNPC警戒/逃走/狩猟・食物連鎖に大蛇/老熊/巨大イノシシ/黒豹が正しく反応するか、実NPC経路で試験・必要な最小AI修正。(2) `kill/currentSnapshot/restoreSnapshot/renderDenInventory`の「強敵撃破→希少素材獲得→巣在庫表示→保存/チェックポイント復元」経路を旧SAVE_SCHEMA2含め動的E2E確認し不足を補う。(3) 即時180度転換/小「〉〉」/夜目/ミニマップの回帰を行い、次45分枠へ未完と具体的再現手順を引継ぐ。
- **次45分枠**：(1) 現行4種の実ブラウザ相当戦闘・壁際/雨/夜・WebGL/2Dの形状と攻撃の破綻を検証し修復。(2) 同じ20%出現総量・地区最大1体を維持し、残15種から地上で別行動の隻眼の狼/白虎/巨大ライオン/巨大ハイエナなどを固有AI＋2D/3D＋戦闘/報酬の縦パッケージで追加。(3) 水生の巨大ワニ/アナコンダ、空中の大鷲などは既存陸上NPCをコピーせず水域/高度/橋/衝突の実装と合わせて順次追加。最後まで強敵20種を完成済みと報告しない。
- **未完成数**：強敵20種のうち既存アルファ＋4種は基本出現と固有攻撃/形状まで実装。残り15種未追加。4種の全演出/生態・希少素材を使う継承解放・長期生態変化も未完成。進捗**71/100据置**。同じACTIVE_SPRINT_IDを次15/45分枠で継続。

## 共同スプリント｜2026-11-02 JST｜DUAL-SLOT-COORDINATED-OVERNIGHT-20261102｜停止指示まで15分／45分枠交互継続
- **ユーザー最新確定**：「寝ている間も、既存15分と45分のタスクでWILD RECLAIMを継続してアップデート。強敵だけでなくほかの未完了改善も。両枠は連携」。既存2タスクの本文を相互連携版に更新済み。新規タスク禁止。JST毎時15分枠・45分枠の2系統を維持。
- **共有の作業台帳**：このROADMAP先頭を両枠で必ず読んで、現在のACTIVE_SPRINT_IDと最新main HEAD/各ファイルblob・前枠ログを照合して着手。毎回ここに「開始/終了HEAD、実変更、試験、Pages build/deploy、未完、次15分と次45分の具体的3工程」を残す。READMEの古い実装済み記述よりGitHub実コード優先。旧HEADの全文上書き・強制push・ロールバック・他ゲーム変更を禁止。
- **ACTIVE_SPRINT_ID**：`STRONG-STAGE-20P-COMPLETE`（45分枠主担当、15分枠は実ゲームAI/保存の連携担当）。現物`game.js`では`STRONG_NAMES`はアルファ・大蛇・老熊・巨大イノシシ・黒豹の5種、`strongRolls/strongTrophies`と`enterStrongStage()`で地区ごと20%出現判定・一体制限・セーブ項目がある。**基礎実装と20種完成を混同しない**。残15種と既存4種の専用攻撃、個体外見/3D・2D、戦闘/捕食、報酬、負傷/逃走等を機能パッケージ単位で完成させる。巨大ムカデは追加禁止。alpha speed 231.4を重複倍率変更しない。
- **役割分担：15分枠**：直前45分枠の強敵追加がNPCの警戒/逃走/捕食・プレイヤー狩猟・死亡/死骸・経験値/巣・旧SAVE_SCHEMA=2/3チェックポイントに及ぼす影響を実関数で検証して不足を実装。ゲームの即時方向転換、猫速度、ミッション小「〉〉」、初回のみ教程、川橋・雨宿り・夜間狩猟など日常生態系の未完成体験も前進させる。同じ強敵定義やモデルを別枠で重複追加しない。
- **役割分担：45分枠**：現行5種の固有攻撃/形状/地形適応・3D/2D表示を完成し、残15種を段階的に追加。15分枠の最新AI/セーブ差分を受け取り、統合動的テスト→GitHub main→Pages build/deploy両successを確認。全20種完了後は地域/景観/季節・雨・月齢・夜目・地形衝突・遺伝/繁殖・UI等の残パッケージを継続。
- **次15分枠の具体工程**：(1) 最新`game.js`の`spawnStrongBoss/enterStrongStage`と`update` NPC狩猟枝、食物連鎖・捕食者のターゲット/逃走が強敵5種と整合するかプレイ経路の動的テスト、必要ならAI最小改修。(2) 特殊敵死亡→死骸→採食→報酬/セーブ復元・3チェックポイントのE2Eを実関数で検証し不足を補う。(3) 即時逆方向移動、チュートリアル/「〉〉」、縦横ミニマップ・SCORE/HUNT、夜目を回帰し、次45分枠へ関数/エラー再現と完了条件を記録。
- **次45分枠の具体工程**：(1) 既存`STRONG_NAMES/STRONG_REGIONS`、`spawnStrongBoss`、`update`の攻撃/追跡枝を現物確認し、まず大蛇/老熊/巨大イノシシ/黒豹の差のある行動と攻撃・実ダメージ・外見を完成。(2) `webgl3d.js`＋Canvas2Dで大型サイズ/種別が識別可能か、ミニマップの赤菱形・水辺/草陰の衝突を整合。(3) テスト済みの新たな強敵候補を追加、候補抽選20%・最大1体・一回判定・保存再開を実関数で検査。15分枠へNPC反応/報酬の具体的依頼を書き戻す。
- **永久維持条件**：最新mainの左ロゴ削除・生命HUD上詰め、音楽→最大化→ポーズ→地図→SCORE/HUNT、ミッションのみ小「〉〉」、反対方向へ即旋回移動、Gamepad、昼夜月齢/夜目、川橋/天候、Save schema2/3 checkpoints、タイトル7回DEBUG、狩猟/巣/初回教程。実Android/物理パッド不可なら未検証と記す。進捗71/100を機械的加点しない。
- **この連携規約の開始時HEAD**：`13affb8e2fb098ac2dfd246f7b6280d7f6b7fc8b`。この台帳への追記はゲーム機能の完成扱いにしない。夜間も枠単位で作業を試み、停止条件はユーザーからの停止指示と重大な技術/権限障害。障害時は次の再開点を残す。

## 共通スプリント｜2026-11-02 JST｜15分枠｜MISSION-CHEVRONS-REGRESSION-QA-20261102
- **開始HEAD**：`6f512c0ad629d56fc9b01f5b74d90aaed327cb53`。直近45分枠の即時方向転換（game.js/gamepad.js/index.html）とROADMAPの最新引継ぎ、Drive設計書末尾を照合。今回ゲームコード変更なし。最新`game.js` blob `5a154a816f6cfdf75e3f66475e6c2f1c1a97c87b`の既存`drawMissionChevrons`を再実装しない。
- **結合QA 42/42 PASS**：現行`getObjective→guidancePoint→drawMissionChevrons`実関数をV8＋模擬Canvasで実行。縦390×844/411×768・横800×360/844×390/736×414/1536×691の6画面×mission0/1/2/4/5/6/7。各0/1/2/4/5/6で小「〉〉」2組が画面内に描画され、mission7で0。冬mission1は車/建物陰、mission2は獲物、mission4は食草、mission5は縄張り、mission6は探索地点を目標取得。旧駅ミッションを復活させない。
- **追加動的QA**：ガイド中・経路blocked・目的地42m以内・waypoint不在・goal不在は描画0。短いwaypointは1組。カメラ0→90度で描画角度が変化。実`guidancePoint`で迂回waypoint採用をモック検証。関連JS6本構文6/6 PASS。HTML ID重複0、左ブランド無し、音楽→最大化→ポーズ→地図→SCORE/HUNT、`.mini-map-stack`と`#status`、旧巨大`#nav-hud`非表示、夜目/3段階地図/SAVE_SCHEMA2は静的照合。直近のキャッシュrevは即時操作修正で`game.js?rev=20261102-instant-move-v1`へ更新済みであり、旧chevron rev文字列に戻さない。
- **Pages**：ゲームコードHEAD `de895b45d212e8800cc6fd78e37a84e7d5b40000` のrun `41325720081`はbuild/deploy/report-build-status全success。ROADMAPのみの今回コミットは別runで確認。
- **未検証**：実Android/物理パッド、実WebGL/Canvas2D目視、6画面の**本番全HTML+CSSの実BoundingClientRect**、セーフエリア、実プレイでの建物迂回→到達。公開サイトの直接取得は実行環境でDNS不可。模擬Canvasの42/42を実ブラウザPASSとは扱わない。
- **次45分枠**：①本番実DOMで右上3ボタン→地図→SCORE/HUNT、左生命列・4ボタンの縦横6画面重なり0を測定。②カメラ回転/迂回/到達/mission7の「〉〉」消灯を実プレイ確認。③地図3段階/550ms長押し、強敵20種、夜目、物理パッド/旧セーブを回帰。問題が出た箇所だけ最小差分修正。
- **次15分枠**：初回チュートリアル→巣LV2→縄張り→探索→「生き残れ！」、死亡リトライ/猫速度/3チェックポイントと夜間狩猟を実ブラウザで回帰。**進捗71/100維持**（今回のQAだけで加点なし）。

## 共通スプリント｜2026-11-02 01:15 JST｜手動即時修正・15分枠引継ぎ｜INSTANT-DIRECTIONAL-CONTROLS-20261102
- **症状・完成像**：十字キー（矢印/ゲームパッド）で反対方向へ入力してもプレイヤーが大回りで旋回し移動に遅れがある。通常歩行では入力フレーム内で方向と速度を即変更し、逆180度・横90度・斜めも回り込まず、離上時だけ自然な既存減速。ジャンプ/飛びつき/突進の固定軌道は維持。
- **開始HEAD**：`e17728908bdfa48f56d2acc34861269ea5013a16`。GitHub main、`game.js`・`gamepad.js`・`index.html`現物とROADMAP上位を確認。前枠の小型「〉〉」ミッションナビ、猫/狐/狼速度、セーブスキーマ、右上HUDは上書きしない。
- **実コード修正**：`neo-wild/game.js` commit `440de492078f4ec9a6503c3cfd80b035494ef22f`。通常移動分岐に`applyDirectionalInput(actor,axis,targetSpeed,dt,foxTurbo)`を導入。移動入力のあるフレームで`P.dir=atan2(axis.y,axis.x)`と`P.vx/P.vy=axis*target`を同時適用。旧低速加速度制限・速度追従旋回を撤去、離上時の従来の減速上限は維持。カメラ逆変換`getAxes`、種族別速度/天候/潜伏/能力倍率、衝突移動、攻撃/ジャンプ/飛びつき/ダッシュ分岐は従前のまま。
- **ゲームパッド修正**：`neo-wild/gamepad.js` commit `19b89fb4232394b143b98ac72b5c342e46c0c85a`。左スティック/D-pad入力`mx/my`の平滑化遅延を除去。stickの20%デッドゾーン・右スティック視点回転・START/操作ボタン、非接続へのフォールバックは変更なし。
- **HTMLキャッシュ**：`neo-wild/index.html` commit `de895b45d212e8800cc6fd78e37a84e7d5b40000`。game.js`?rev=20261102-instant-move-v1`、gamepad.js`?rev=20261102-instant-pad-v1`を更新。6本のscript読込順維持、HTML ID重複なし。
- **動的QA**：現行ゲームの実`getAxes`と新`applyDirectionalInput`関数をV8で抽出実行し、入力逆転・入力瞬間の向き一致・狼175/猫320速度・斜め正規化・キーボード矢印・仮想スティック・ゲームパッド入力・キー離上停止・有限値 **10/10 PASS**。ゲームパッド本物の`gamepad.js`をモックwindow/navigator/標準パッドで実行し、D-pad右→即左・上下・アナログ右→即左・右視点・切断で中立化・平滑化除去など **8/8 PASS**。全6本のJS全文構文 PASS、移動関数/旧旋回撤去/保存/夜目/alpha速度231.4/地図/「〉〉」/rev等静的回帰 **15/15 PASS**。
- **Pages**：コードHEAD `de895b45d212e8800cc6fd78e37a84e7d5b40000` の `pages build and deployment` run `41325720081` にて **build success / deploy success** を確認。以後ROADMAP追記コミットに対応する別workflowの成否は必要に応じ追加確認。
- **未検証**：実Android Chrome、実物Gamepad、ゲーム全体10～20分実プレイ、WebGL・Canvas2Dでの反転アニメーション視認、雨/狭い衝突/斜め移動の実GPUフレームレート。模擬入力を実機試験とは言わない。
- **次15分枠**：(1) 最新mainで矢印/WASD、D-pad、左スティックを180度・90度・斜めに即逆転し、移動とP.dirが同フレーム変わるか実ブラウザ動的検証。(2) 猫/狐/狼・雨/走行能力/潜伏/壁際・衝突/ジャンプ中を回帰し必要な不具合だけ最小修正。(3) 既存夜目/セーブ/ミニマップ/「〉〉」/右上HUDを維持し、Pages両段成功を確認。45分枠の強敵20種類担当は変えない。
- **進捗**：71/100据え置き（操作感改善のみ・実機未検証）。

## 共通スプリント｜2026-11-02 JST｜即時描画改善・15分枠引継ぎ｜MISSION-DOUBLE-CHEVRONS-20261102
- **要望**：チュートリアル/ミッションの「次に進む場所」を画面中の小さな「〉〉」で案内。かつて削除した巨大中央ナビの復活は禁止。プレイヤー近くの進行方向のみ、目的地がある期間に限定。旧GAME UI・右上3ボタン→ミニマップ→SCORE/HUNTと左ロゴ削除を維持。
- **コード改修**：`neo-wild/game.js` commit `f8e04bf165d60d460216753bbb7a8a043044cb06`：新規`drawMissionChevrons()`は既存`getObjective()→guidancePoint()→guideWisp/guideGoal`に従い、プレイヤーから60/120ワールド座標程度前方の2組まで「〉〉」を描画。進行方向に投影ベクトルで回転、3D/Canvas2D共通Canvas overlay。フレームごとに画面向きへ追従、カメラ回転にも対応。障害物があれば既存迂回経由のwaypointを使い、blockedは無表示。mission>=7、到達42m以内、現在のガイド画面（ポーズ）での表示は禁止。色は暗背景でも読める細い黒縁＋薄緑（高彩度の大型光円やラベルは無し）。
- **キャッシュ反映**：`neo-wild/index.html` commit `49735edd5997d0b7bd20bd4a3483b90c9313de93`。game.js?rev=`20261102-mission-double-chevrons-v1`へ更新。ほか6スクリプトの読み順とHUD/ミニマップは変更なし。
- **実行QA**：新関数を取り出し、V8のモックCanvas + 実関数テキストで動的テスト。通常ミッションは「〉〉」2組、mission7完了・ガイド表示・waypoint消失・目的地近接・blockedは0組、カメラ投影方角の90度回転・短い横画面もPASS。実ゲーム6 JS全ファイルnew Function構文PASS、既存SAVE_SCHEMA2/alpha速度231.4/右スコアDOM/ID重複0・HTML revチェック全PASS。**未実施**：実Android Chrome/GPU・WebGL/Canvas2Dの本物の画面上での長時間プレイ、障害物回避の実プレイE2E/全6 viewport矩形測定。動的モックPASSと実機PASSは区別。
- **Pages**：更新コードのHEAD `49735edd5997d0b7bd20bd4a3483b90c9313de93`、GitHub Pages `pages build and deployment` run `41324575307`、確認時 `completed` / `success`。build/deploy両成功前は配信済みと言わない。
- **既存15分枠タスク**：`6ae373bfe9fc81918d84c77f6096a4c5` の最優先追補を更新済み。次の確認：(1) ミッション0/1/2/4/5/6・カメラ回転・迂回→到着→mission7で「〉〉」を実画面で追試 (2) HUD・夜目・地図と重ならないよう縦390/411横800/844/736/1536を測定 (3) 異常があれば最新mainの`drawMissionChevrons`のみ最小修正、Pages両段階成功まで確認。45分枠の強敵20種は従来どおり別担当、旧main上書き禁止。
- **進捗**：71/100据え置き（実端末未確認、単一UI追加では加点しない）。

## 共通スプリント｜2026-11-02 JST｜15分枠引継ぎ／即時HUD修正｜UI-LEFT-NOBRAND-MAPSTATS-V2-20261102
- **最新ユーザー画像**：縦Androidのゲーム画面で左上「W//R WILD RECLAIM 東京・生存戦線」を削除して生命/空腹/持久/LV/巣/備蓄/食料庫/ガイドを上詰め、右地図の真下にSCORE・HUNTを密着配置する。タイトルメニューのゲームタイトルは削除しない。右上の音楽→最大化→ポーズの横一列・常設地図を維持。
- **担当**：既存15分枠タスク `6ae373bfe9fc81918d84c77f6096a4c5` を最新要求で更新済み。45分枠の強敵20種担当は変更しない。新規タスク作成なし。
- **実コード**：`neo-wild/index.html` commit `2a46d89b721b0b2fd4b67fe3d74e3b1e23489636` はHUDの `.brand-small` をDOMから削除、`#mini-map-control` と `#status` を共通 `.mini-map-stack` に収納。CSS rev `20261102-hud-nobrand-mapstats-v2` に更新、ID・ゲームのscore/hunt更新関数は維持。
- **実コード**：`neo-wild/visual.css` commit `09dba2bfddea33b74a144ee0ff0974593c3ed8be` は左 `.vitals` 上マージンを0にし、地図とSCORE/HUNTを3px gapの同じ縦flexカラムで固定、従来絶対座標指定をより高い特異度の `position:static!important` で解除。COMBO空欄の余白除去、縦96px/横80-105px地図サイズ維持。
- **静的QA**：実mainのHTML+CSS+game.jsを再取得して16/16 PASS：左ブランド不在、タイトル画面維持、先頭生命表示、地図グループ/DOM順/唯一ID、CSS cache rev、余白解消、地図relative+スコアstatic、COMBO空行抑制、score/hunt実DOM更新維持、CSS波括弧、SAVE_SCHEMA=2、alpha速度231.4等。ゲームJSは非変更。
- **未確認**：実Android表示、本番全CSSの実Chromium矩形、縦390×844/411×768と横800×360/844×390/736×414/1536×691の地図-SCORE/HUNT間隔実測、全画面・ミニマップ3段階+長押し・ゲームパッド・旧保存・WebGL/2D動的E2E。静的検査を実機PASSと称さない。
- **Pages**：HEAD `09dba2bfddea33b74a144ee0ff0974593c3ed8be` のpages run `41323016158` は記録時点 `completed`、結論 `success`。build/deploy双方成功を確認するまで公開済みと報告しない。
- **次15分枠**：①最新main全CSS/実HTMLで左生命パネルと `.mini-map-stack > #status` の矩形・上下間隔を縦横6条件とsafe-areaで測り、重なりがあれば最小CSS差分。②地図短押し3段階/550ms長押し、COMBO/スコア反映、ポーズ/全画面を動的検査。③実Androidと旧セーブ/ゲームパッド/夜目の未検証を明記し、重大バグのみ修復。45分枠の強敵パッケージと旧版で競合させない。
- **進捗**：71/100据え置き。

## 共通スプリント｜2026-11-02 JST｜手動即時UI修正｜UI-MAP-SCORE-STACK-20261102 スコア・ハントを常設地図の真下へ
- **ユーザー最新確定**：「スコアとハントを地図の下に配置」。右上の音楽→最大化→ポーズの横3列、下段ミニマップを維持。その直下にSCORE→HUNT→（コンボ発生時のみ）COMBOを縦積みする。
- **変更**：`neo-wild/index.html` commit `f26b0fc9d08987a8806173c6b37b27131ea12737`：既存 `#status`（`#score-line/#kill-line/#combo-line`）をHUD外の絶対配置から `#hud .hud-right` 内の `#mini-map-control` 直後に移動。IDやゲームの更新処理は変更せず、CSS cache rev `20261102-map-score-stack-v1` に更新。
- **変更**：`neo-wild/visual.css` commit `118ee0c5720222440389749d8edd6bc99095e390`：既存のモバイル/横画面位置指定を上書きし、地図とスコアを通常のflexフローで追従。右揃え・文字の折返しなし・縦/横の既存フォント設定を保持。
- **静的検証PASS（7項目）**：ボタン→地図→SCORE→HUNT→COMBOのDOM順、`#status`のHUD内包含、HTML ID重複0、CSS rev参照、地図直後の要素順、`position:static`の上書き指定、CSS波括弧整合。前15分枠の猫の旧セーブ補正、強敵アルファ速度231.4、夜目/操作/セーブ/地図イベントのJSは非変更。
- **未検証**：Android実機、実ブラウザ全CSSでの `getBoundingClientRect`、横800×360/844×390/736×414/1536×691・縦390×844/411×768でのスコアと地図・ゲームパッドステータス/四操作との衝突、長押し詳細地図。これらは次45分枠で確認。
- **Pages**：該当コードHEAD `118ee0c5720222440389749d8edd6bc99095e390` の `pages build and deployment` run `41322468311`。記録時点はin_progressのため配信成功を未確認として扱う。
- **次45分枠**：1) 実ブラウザ縦横6条件で`#status`が地図の直下にあり他HUD/右下タッチと非干渉か矩形測定。2) ミニマップ3段階短押し・550ms長押し詳細・ポーズ/全画面・COMBO発生/解除の表示確認。3) 強敵20種スプリント継続。今回の右上HUD/地図/スコアをロールバックしない。
- **進捗**：71/100据え置き（配置のみ、実機未検証）。

## 共通スプリント｜2026/11/02 00:37 JST｜手動即時改修｜UI-RIGHT-TRIPLE-ROW-20261102 右上「音楽→最大化→ポーズ」一列＋直下地図
- **対象・ユーザー実画像**：縦691×1536相当（DPR未確定）。右上のポーズが単独一段目、音/最大化が二段目に分離していた。新規タスクなし・他ゲーム変更なし。
- **確認済み現行構造**：開始時点の `neo-wild/index.html` は `.session-actions`（pause）→`.top-actions`（sound/full）→`#mini-map-control`。既存 `visual.css` の最終portrait/landscape CSSでは地図はrelative表示でボタン列の後に追従。Gamepad/旧SAVE_SCHEMA2/狩猟AI/夜目/猫速度は非変更。
- **実コードコミット**：`ce6ede2bd83c915d62141af794e27f41528574d9` （`visual.css`：40pxタッチボタン3個を3px間隔の一列に、地図はその直下へrelative配置・縦横サイズ維持）。`65ba2edfbf9d62caa4f20ad3f5df8ceba043c34d` （`index.html`：既存sound/full/pause IDを単一 `.top-actions.session-actions` コンテナ内でその順に、地図の直前に配置。visual.css rev `20261102-right-triple-row-v1`）。
- **QA**：HTMLの音→全画面→ポーズ→地図の順序、3操作IDと地図IDの重複0、CSSの括弧数整合0、既存ミニマップcanvas/scale DOM維持を静的確認。旧CSSキャッシュを更新。**未確認**：実ブラウザでの全CSSによるgetBoundingClientRect、縦390×844/411×768、横800×360/844×390/736×414/1536×691、端末セーフエリア、ゲームパッド・詳細地図長押し・実Android目視。静的検査を実機PASSとは称しない。
- **Pages**：コードHEAD `65ba2edfbf9d62caa4f20ad3f5df8ceba043c34d` のrun `41322143835` は確認時点でin_progress。build/deploy両成功の確認まで公開済みとはしない。
- **次45分枠**：1) 最新HEADで `#hud .hud-right .top-actions.session-actions` の3ボタンと `#mini-map-control` の矩形/タッチを縦横6サイズで検証し、衝突があれば最新CSS末尾に最小差分。2) 短押し3段階/長押し詳細地図/一時停止/全画面を模擬またはブラウザ動的確認。3) 強敵20種パッケージ開発を継続、今回の右上配置を旧版で巻き戻さない。
- **進捗**：71/100据え置き。未実機検証のため加点なし。

## 共通スプリント｜2026/11/02 00:20 JST｜15分枠即時対応｜CAT-LEGACY-SPEED-RETRY-QA-01 旧猫強化セーブ救済＋教程/死亡リトライ統合QA
- **開始HEAD→コード終了HEAD**：`89679fa78a1815f726b8d0840a9a1e2161a3f202` → `af413283234b2459699c1514a573feb7558b8a3b`。先行45分枠の右上UI・中央ナビ撤去、夜目120度・月齢・ゲームパッドを現物確認。Google Drive設計書末尾の初回教程/旧猫速度/死亡リトライ仕様を確認。変更競合なし。
- **動的統合試験で発見した実不具合**：旧猫セーブの `catSpeedV2` 未設定かつ `speed>=320`（例：旧基準239から強化した365）の場合、復元後も速度365のままで、新基準320への倍率移行が失われる。修正前の実ゲーム関数+模擬DOM/localStorage試験では22/23 PASS、旧強化速度365→期待489だけFAIL。
- **実コード修正**：`neo-wild/game.js` commit `15b6b63697b5d3f6e5a833a75d7ebeac3341066e`。旧猫は速度239を基準とする強化倍率を常に320基準へ1回換算し、速度値不正時は239に補正。 `catSpeedV2` を立てて再復元の二重加速を防ぐ。新規猫320、狐285、アルファ231.4、操作/スタミナ/衝突の既存実装は変更なし。 `neo-wild/index.html` commit `af413283234b2459699c1514a573feb7558b8a3b`：`game.js?rev=20261102-cat-legacy-speed-v3` へ更新。他ファイル・ゲームパッド・HUD・月齢/夜目・地図は未変更。
- **動的QA**：パッチ済みの**実game.js全文**を模擬DOM/Canvas/localStorageで実行。初回猫320→自動ガイド1回→食事→潜伏→狩猟→駅を飛ばし巣mission4→巣LV2→縄張り→探索→mission7の「チュートリアル終了」→常設「生き残れ！」、死亡結果→同種チェックポイント復元、再開後自動ポップアップなし、最初から→狐選択、3チェックポイント上限、旧mission3→4移行、旧猫速度239/300/365/700の倍率保持と二重補正なし、旧mission7復元を含め**46/46 PASS**。パッチ前に確認した旧猫強化セーブ1件のFAILを解消。実ブラウザでなく模擬DOMでの動的実行であることを明示。
- **静的QA**：game.js/webgl3d.js/gamepad.js/audio.js/season-clouds.js/debug-mode.js全6本のJS全文構文PASS、HTML ID重複0、revとSAVE_SCHEMA=2・チェックポイント3件・夜目/4操作・巣・最終生存HUD等の静的維持検査8件PASS（計14/14）。**未検証**：実Android Chrome・実GPU WebGL/Canvas2D描画・物理Gamepad・フルゲーム10〜20分E2E・旧保存実ブラウザ復元。静的確認を実機PASSとみなさない。
- **Pages**：コードHEAD `af413283234b2459699c1514a573feb7558b8a3b` のbuild/deploy run IDを取得できず**未確認**。旧HEADの成功は今回の配信成功とみなさない。次枠で最新workflow runを確認しbuild/deploy別々に記録すること。
- **次45分枠**：(1) `game.js:restoreSnapshot` の旧猫速度239/300/365/700→320基準換算と再読込二重加速なしを実ブラウザのlocalStorage+3チェックポイントで確認。(2) フルDOM/CSSで縦390/411、横800/844/736/1536の右上地図/4操作/死亡結果と夜目2D/3Dの実矩形/描画を確認。(3) 実Gamepad4ボタンと月齢/雨天夜目、Pages最新build/deployを検証し、失敗時だけ最小差分修正。
- **次15分枠**：(1) `updateIndoorRest/startlePrey/chooseEscape/resolveAttack` の夜間休息→犬警戒→追跡→攻撃→死骸→食事を実関数連結QA。(2) `carryFood/upgradeDen/checkMission` の運搬→備蓄→LV2を実操作で完走し、途中死亡→リトライ後も初回ガイド非表示を確認。(3) 同種/異種が混在するチェックポイント3件と旧SAVE_SCHEMA2で保存/復帰、アルファ速度231.4・猫320・狐285を回帰。45分枠のUI・Gamepad・夜目コードに重複編集を加えない。
- **進捗**：71/100据え置き。旧強化セーブの速度欠損を修正したがPagesと実ブラウザE2E未確認のため72への条件未達。

## 共通スプリント｜2026-11-01 23:48–23:55 JST｜45分枠｜UI-RIGHT-STACK-NONAV-02 旧中央ナビ完全撤去＋6画面ブラウザ矩形回帰
- **開始HEAD**：`54961e3eaa3d36d1a6d2f35d0466180d5697033e`。前15分枠の猫速度・死亡時同種チェックポイント・教程既読・夜間AI、前45分枠の夜目/常設ミニマップ、Drive正本末尾の確定仕様を照合。中央大型ナビ非表示と右上ポーズ→音/全画面→地図のCSSレイアウトは**前回既に実装済み**であり、重複作成・旧版上書きなし。
- **本回の実コード変更**：`game.js` `cf819f092823611d0bc52fcbdef3a7d4432ffe11` で、CSSで隠していた旧`#nav-hud`へのDOM更新（`show`/毎回`syncHUD`）を完全削除。未使用の大型目的地発光`drawObjectiveGlow`と追従矢印`drawGuideWisps`関数定義を削除（JS約3459文字減）。`index.html` `030eb870cba0ed500a06084ba2141b176ac48b98` で旧`#nav-hud` DOM一式を削除（231文字減）、`game.js?rev=20261101-right-stack-no-nav-v2`に更新。右上3操作・地図、青い実入口`drawShelterEntranceMarker`、シアン目標、狩猟表示は維持。`visual.css`は前回の配置を保持、今後の旧CSS上書きに対する`#nav-hud{display:none!important}`ガードは残す。
- **QA ①コード**：最新6 JS全ファイル`new Function`構文PASS（game/webgl3d/gamepad/season-clouds/audio/debug-mode）、CSS2件の括弧整合PASS、HTML ID重複0、script読込6本・rev PASS。旧セーブ`SAVE_SCHEMA=2`/3チェックポイント、GamepadBridge、nightVision2D、チュートリアル既読フラグ、巣入口表示は静的維持PASS。**実旧セーブ復元E2E/実物パッドは未検証**。
- **QA ②地図の実関数**：改修前の同じ`drawMini()`関数を現行`game.js`から抽出し、模擬Canvas 2Dと実種族・強敵判定データで動的実行。獲物緑1、強敵赤1、通常敵橙2、警戒黄1、巣青1、目的地シアン1、プレイヤー白1を確認。実ポインタイベント処理で短押し標準→遠目→広域→標準、550ms長押しで詳細地図が1回だけ開き縮尺は変化しないことPASS。今回のJS削除はこれらの関数・イベントに非干渉。
- **QA ③Chromium UI矩形**：ローカルPlaywright/Chromiumに**現行DOMの右上HUD構造と関連するCSS規則を抜粋した検証用fixture**を読み込み、`getBoundingClientRect`を実測。縦390×844/411×768はミニマップ直上の音/全画面ボタン列との縦間隔**6 CSS px**、地図96×96、地図下端195・スコア開始207で12px空き。横800×360/844×390は間隔5px・地図80×80・地図下端173・スコア開始180で7px空き。横736×414は5px・95×95・地図下端188・スコア開始210。横1536×691は5px・105×105・地図下端198・スコア開始210。**全6サイズで右上のポーズ/音/全画面/地図/スコア/ゲームパッド表示の画面外・相互重なり0**。中央と左右HUDカラムの矩形重なりも0。**重要**：fixtureは本番HTML/CSS全体ではなく関連箇所の抜粋。タッチ4ボタンのfixtureには本番の全CSSを移植していないため、4ボタンの見切れ判定は無効（本番のバグと断定不可）。実Android/フルゲーム描画の実DOM矩形は未検証。
- **Pages**：前回UI配信run `41317074020` はbuild/deployともsuccess。今回コードHEAD `030eb870cba0ed500a06084ba2141b176ac48b98` のrun **`41318349775` は completed/success、build・deploy・report-build-status 全3ジョブ success を後追い確認。コード公開成功**。ROADMAP追記コミットは別run（初回 `41318402434` queued）で、コードの実配信確認とは区別する。
- **次45分枠**：(1) **本番全CSS+実ゲームDOM**を使い、縦390/411、横800/844/736/1536で`#hud .session-actions/.top-actions/#mini-map-control/#status/#gamepad-status`とタッチ4ボタンの実矩形、セーフエリアを測定。抜粋fixtureの推定を本番QAに置き換える。(2) 起動→地図短押し3段階→長押し詳細→閉じる→ポーズ→横全画面→縦復帰、旧セーブ3件、実パッド肩ズーム、夜目2D/3DのE2E。(3) UIの独立ズーム非表示時のピンチ/肩ボタン、月齢・悪天候夜目・狩猟可読性をGPU/Androidで比較し、実不具合だけ最新HEADから最小差分修正。
- **次15分枠**：(1) 既存`nightCoverThreatened`/休息地点/警戒の実関数で夜間休息→覚醒→逃走→追跡→捕食の連続テスト。(2) 死亡→同種チェックポイント→再開で猫速度・初回チュートリアル既読・巣備蓄の保存回帰。(3) UI改修と競合しないよう`drawScene`旧大型目的地マーカーと`#nav-hud`を復活させない。
- **進捗**：71/100据え置き（実機フルプレイ・本番全DOM回帰未検証）。

## 共通スプリント｜2026-11-01 23時台｜手動45分枠引継ぎ｜UI-RIGHT-STACK-NONAV-01 中央ナビ撤去＋右上操作とミニマップ連結
- **ユーザー実画像**：822×1536物理ピクセルの縦画面で、大きい中央「食草 1274m」ナビのカプセルと緑の方向矢印がゲームを遮り、右上の音・全画面ボタンと常設ミニマップの間に不要な空白が存在。右上への集約、ミニマップを直下へ配置という最新指定。
- **開始HEAD／コード実装コミット**：`db636f1f95ca234eada1e47b388d95871cbe616c`→`game.js 0c2d34c2f8ec05844043e3d0fc29a2f7a285d5e4`→`visual.css cb49d0a81acb3f64fe4925bab6f0df5be986f6be`→`index.html 84b47b49f1d35bc593dcfdb9f7420b47a3365f9d`。neo-wild以外変更なし。
- **見た目変更①**：`game.js:drawScene`から巨大な画面内目的地ハロー・ラベル(`drawObjectiveGlow`)とプレイヤー周囲の追従方向矢印(`drawGuideWisps`)を外した。中央上`#nav-hud`はCSSで強制非表示。ミニマップの`getObjective()/drawMini`によるシアン目的地/向き、巣、赤・橙・緑の生物色分けは保持。青い実建物入口`drawShelterEntranceMarker`・敵名・死骸は保持。
- **見た目変更②**：縦600px幅以下は`.hud-right`の自然なflex順に「ポーズ→音・全画面（横並び、44×40px実タッチ領域）→96px角ミニマップ」を配置。地図を古い絶対top120pxから`position:relative;top:auto`へ移し、操作列との間を約4〜6CSSpxに縮小。scoreを約207px+safe-area上端に移し地図下へ。gamepad状態も地図・scoreの下へ。横小型800×360/844×390/736×414等は元の横画面コンパクトHUD・4ボタンを維持したまま地図を同じ親flex順に置き、地図80〜105px角・safe area対応。
- **QA**：game.js全文new Function構文PASS、HTMLの全id一意PASS、CSSの括弧整合PASS、ミニマップ目的地/3段階タップ/長押し詳細、GAMEPAD、SAVE_SCHEMA=2、3チェックポイント、初回教程フラグ等コード14項目＋縦411×768/390×844・横800×360/844×390/736×414/1536×691のCSSサイズ数式6例でマップ下端とscore上端が非重複（**推定であり実ブラウザDOM矩形試験ではない**）。実Android/PCブラウザでのレンダリング・WebGL/Canvas2D・E2E・物理パッド・縦横実矩形は**未検証**。
- **Pages**：コードHEAD`84b47b49f1d35bc593dcfdb9f7420b47a3365f9d`はrun **41317074020**が初回照合時queued。build/deploy両successまで公開成功は未確認。
- **次45分枠**：(1) 縦390×844/411×768、横800×360/844×390/736×414/1536×691の実BoundingClientRectでポーズ/音/全画面/地図/scoreの上下隙間が4〜6CSSpx、重複/画面外なしを検証し、必要なら現物に合わせCSSだけ修正。(2) 常設地図標準→遠目→広域→標準のタップ/長押し詳細を通し、方向矢印と大きな目標カプセルが再表示されないこと、ミニマップには目標が残ることを確認。(3) 実Android Chrome・横全画面・旧SAVE_SCHEMA2／3チェックポイント・Gamepad・夜目/狩猟を回帰しPages最新runを調べる。
- **次15分枠**：引き続き夜間休息→覚醒→逃走→狩り/食事・猫高速化・死亡後の一度限りチュートリアルの実関数QA。45分枠のHUD配置/右上ミニマップ・drawSceneのナビ非表示を復活させない。
- **進捗**：71/100（実プレイ総合QA未完）。

## 共通スプリント｜2026-11-01 23:29 JST｜45分枠｜NIGHT-VISION-120-01 夜目・視界改善
- **開始HEAD**：`764e3e8988fdbc27eb8a5a33b43229d91fef2556`。15分枠の猫速度・初回チュートリアル・死亡リトライ最新更新と、前45分枠のMINIMAP-COMPACT-MARKERS-01、Drive正本末尾を照合。ミニマップ3段階・長押し・敵色分けは既存実装を保持し再実装なし。
- **完成したコード**：`game.js`で夜間最低環境光を0.17→0.22、2D暗転を0.88→0.80（上限0.82→0.76）に調整。猫/狐/狼の夜目パラメータを月齢・天候・昼夜と連動。前方約120度の柔らかい扇形視界と周辺視野を2Dではオフスクリーン暗転マスクで表現し、背後は最低環境光を維持。`webgl3d.js`ではワールド座標と進行方向を使い、fragment shaderで距離・角度の滑らかな視認性/コントラスト補正（発光/街灯追加なし）。猫は昼行性より遠方・高強度。旧SAVE_SCHEMA=2・3チェックポイント・月齢/雨・夜間狩猟AI・ゲームパッド・横画面・ミニマップを維持。`index.html`のgame.js/webgl3d.js revを更新。
- **コードコミット**：game.js `63a7eb09828af6ff49118f52688083b5343ab9e1`、webgl3d.js `bc43c8387cea346db846547a77a5923a575f7d2c`、index.html `1b9c6976145352fe3606dde7d0f79a268424b5d1`。変更はneo-wild/のみ、force pushなし。
- **QA**：両JS全文new Function構文PASS。実`moonlightProfile/dayLightProfile/nightVisionProfile`を抽出して昼夜×猫狐狼、晴/曇/霧/雨/雷雨、月齢新月/満月、猫の距離優位・悪天候減衰を動的PASS。実`drawNightVision2D`をモックCanvas2Dで実行し、向き0→90度で扇形4層クリップ・グラデーション・合成2回PASS。WebGL shaderのuniform/結線・既存SAVE_SCHEMA/miniMap/GamepadBridge・script6件は静的PASS。**未検証**：実WebGL GPU shaderコンパイル、実ブラウザ2D Canvas表示/描画負荷・夜目の見え方、Android/iOS縦横矩形、物理ゲームパッド、旧保存/チェックポイントのE2E、15分プレイ。構文/数値/静的結線を実機QAと混同しない。
- **Pages**：新コードを含むHEAD `b55b28babc0d0c0abdc6d9d7e2ab12bd76ad2f57` のrun **41316644996** は2026-11-01 23:32 JSTに`completed/success`、build・deploy・report-build-status全3ジョブsuccess。コード配信成功。
- **次15分枠**：(1) game.jsのnightCoverThreatened/updateIndoorRestと視認距離の乖離を晴/雨・猫/狐で確認、夜間休息→覚醒→逃走→狩りを実関数で検証。(2) 死亡リトライ・最初から・旧SAVE_SCHEMA2の教程既読が保持される実DOM+保存回帰。(3) 既存ミニマップの獲物/敵マーカー更新とmission4→7切替を継続。
- **次45分枠**：(1) Android/PCブラウザで夜間2D/3Dの前方120度・背後最低照度・晴天新月/満月/曇/雷雨の実画像比較、GPUコンパイル/負荷確認。(2) 横800×360/844×390/736×414・縦390×844でミニマップ・月齢・結果ダイアログ・4ボタンの矩形衝突確認。(3) ミニマップ3段階→長押し詳細→閉じる・カメラピンチ・パッド肩ボタン・旧3チェックポイントを実機E2E。
- **進捗**：71/100据え置き（実機E2E未検証）。

## 共通スプリント追補｜2026-11-01 23時台｜再プレイ時の終了演出も一度限り
- **追加修正**：前回、死亡後の自動説明ポップアップは抑止したが、mission達成時のEXCELLENT/「チュートリアル終了」は再プレイで表示され得た。ゲーム開始時に`previouslyOnboardedAtRunStart`をプロフィールの既読状態から固定し、初回プレイでは既存の短い達成演出を維持、初回以後の死亡リトライ・新規再開始・旧セーブ再開では`showMissionMilestone`を抑止。巣のチュートリアルはHUD/手動ガイドで確認でき、毎回の全画面再説明は行わない。
- **コミット**：game.js `74b178e4546a5ffde60c36e12aff936b6962e631`、index.html `9f5b9e1fd8ff041f7d90f4bd293c3f16063aace6`（script rev v4）。全文JS構文PASS、初回判定・旧セーブ2・巣移行・autoTutorialShownなど6項目の整合PASS。実ブラウザの死亡→リトライ/最初から・初回演出E2Eは**未検証**。進捗71/100据え置き。
- **次15分枠**：初回プレイと再プレイそれぞれでmission0→4→7の達成演出回数を実関数テストし、死亡結果/同種チェックポイント/新規ゲームを通した実DOM・localStorageテスト。**次45分枠**：結果画面を横/縦Android寸法で操作/ゲームパッド/セーフエリア確認。旧コード復活・tutorial再表示禁止。

## 共通スプリント追補｜2026-11-01 23時台｜死亡リトライは同じ動物のチェックポイントのみ
- 複数動物のチェックポイントが混在する場合に、猫が死亡したのに狐へリトライされる問題を防止。死亡表示の選択肢判定・リトライ復元とも`getCheckpoints().find(s=>s.player.type===P.type)`へ統一。同種チェックポイントがなければ同じ動物で新規再開。「最初から」はタイトルの動物選択を開く。
- game.js `4c6c955f4483396d1d61d7e6ee9c55c095cc9ed7`、index.htmlキャッシュ更新 `34af66fafd925bd20791a67f957fd7c1cbb70ea9`。JS全文構文・種別一致の選択モックPASS。死亡後の実ブラウザ/Androidゲームパッド操作は未検証。
- **引継ぎ**：15分枠は猫の旧新保存の速度・チュートリアル再開・巣チュートリアル4/4、45分枠は死亡結果画面の縦横・同種チェックポイント選択・ゲームパッドボタンを実DOMで確認。ゲーム本体の新しいミッション再編を重複実装しない。進捗71/100据え置き。

## 共通スプリント追補｜2026-11-01 23時台｜旧猫セーブ速度移行とPages公開成功
- **旧セーブの速度補正**：新規猫の基本速度320が、旧SAVE_SCHEMA=2保存から再開するとP.speed=239へ戻ることを確認し、game.jsのstartで新基準フラグを付与、restoreSnapshotで未移行猫の旧速度だけ320以上に補正。旧猫保存速度239→320、275→368、320→320、360→360の4動的ケースPASS。移行済みはcatSpeedV2を保存し、ロードのたびに加速しない。狐・狼、旧3チェックポイント、ゲームパッド、ミニマップ等は変更なし。
- **コミット/配信**：game.js `4fb7a5c684561fda1cd6fe22315e4c972c2e15f2`、index.html `5ba6065e16ed22ad1cbec3bb1a683d8d7e2f65d6`（game.js ?rev更新）。GitHub Pages run **41315954351** は build、deploy、report-build-statusすべて**completed/success**。コード公開成功。Android実機・実ブラウザでの新規→死亡→リトライと旧猫セーブE2Eは未検証。
- **次15分枠**：初回自動チュートリアル表示→死亡→チェックポイント復帰/最初から動物再選択→二度と自動表示しないことの実DOMテスト、旧保存の猫走行実測、巣への備蓄/強化まで4段階教程進行。次45分枠は縦横モーダルのリトライ/最初から2択の実タッチ/パッド操作と見切れ防止を検証。**進捗71/100据え置き（実機E2E未検証）**。

## 共通スプリント｜2026-11-01 23時台｜手動・猫の高速化／一度だけの説明／巣のチュートリアル／死亡時リトライ
- **開始HEAD／実装コードコミット**：最新15分枠の更新後HEAD `a0cd699322d24752eee438edcb0b8d651fa7c088`を起点に、`neo-wild/game.js` `7896ab16b26b469cba6b008ba487768f14f98fe3`、`neo-wild/index.html` `d6ce0ee7f1c2649945f6c05cf6d1dda13e9c6913`。15分枠の野犬夜間AI、45分枠ミニマップ/横画面/パッド/照明を保持して最新コードを最小差分編集。
- **変更①猫**：基本移動速度239→320（狐285）。猫の既存旋回・ジャンプ・壁蹴り・攻撃・セーブ内のP.speedと他種能力は維持。**注意**：旧SAVE_SCHEMA=2復元は保存されているP.speedを従来通り尊重するため、旧セーブで速度239の猫には新速度が自動適用されない可能性がある。次回、古い猫保存のスキルアップ倍率を壊さず速度を正規化する検証を優先。
- **変更②説明は生涯一度**：`wild-reclaim-auto-tutorial-shown-v1`で一度表示した自動ガイドをゲーム進行・死亡・新規開始をまたいで記録。旧オートセーブ/最大3チェックポイントのtutorialSeen/mission進捗から既読を移行。手動「ガイドを見る」は引き続き利用可能。従来生存目標の無限自動ポップアップは復活しない。
- **変更③チュートリアル内容**：旧「旧新宿駅を探せ」を必須課題から撤去。狩猟達成mission2→直接mission4「巣に食料を持ち帰る→△短押しで備蓄→△長押しで巣LV2」をチュートリアル4/4とし、旧mission3セーブも自動的にmission4へ正常化。旧SAVE_SCHEMA=2/既存地域・探索地点・地形は削除しない。
- **変更④死亡**：「死んでしまった」、リトライ/最初から（動物を選ぶ）を明示。リトライは既存最新チェックポイントがあればそこから、なければ同じ動物で新規再開。死亡前オートセーブは従来通りクリア、最大3チェックポイント保持。チュートリアル既読フラグは死亡時にも保持。
- **QA**：最新game.jsの全文JS構文PASS、現行reconcileRestoredGoals実関数の4動的ケース（旧mission2狩猟済→4、旧mission3→4、巣LV2のmission4→5、食事達成0→1）PASS、猫320＞狐285・保存スキーマ2・3チェックポイント・地図/パッド保持・HTMLの結果選択肢・cache rev等11件コード整合PASS。**未検証**：実ブラウザ死亡→リトライのE2E、実Android縦横・速度/操作性、旧猫セーブ速度移行、実セーブの新規開始→教程既読復旧、最新Pages deployの成否。進捗**71/100据え置き**（未完のE2Eを加点しない）。
- **次15分枠**：①旧SAVE_SCHEMA=2の猫保存（speed239/能力・強化済みspeedあり）で新しい猫の基礎速度を整合させ、レベル/強化倍率を壊さずにテスト。②初回のみ説明→死亡→チェックポイントリトライ／新しい動物で最初から→ガイドが自動再表示されない一連の模擬DOM・保存試験。③食事→潜伏→狩猟→巣で運搬/備蓄/LV2を実ゲーム進行テストし、旧stationへの寄り道不要を確認。
- **次45分枠**：①縦/横実画面で死亡モーダルの2選択肢が見切れずタップできるか、GamepadのUI選択と併用できるか確認。②巣のHUDガイドが1枚で理解できるか検証、必要なら表示を短文化。③旧セーブ／mini-map／月齢／Pages build+deployの成功判定、実Android未接続なら未検証と明示。

## 共通スプリント｜2026-11-01 23:15 JST｜15分枠｜NIGHT-HUNT-PREDATOR-SAFE-REST-02（夜の安全な潜伏→野犬接近で覚醒・逃走）
- **開始HEAD→コード終了HEAD**：`4ce821eb98d40137540f6a42186648ef2a1a4b76` → `a0cd699322d24752eee438edcb0b8d651fa7c088`。直前45分枠のMINIMAP-COMPACT-MARKERS-01、前15分枠の冬の外壁潜伏・狩猟連鎖、Drive完成仕様書末尾SURVIVAL-FINAL-GOAL-01、最新10ファイルを照合。既存「自由探索」廃止とmission6→7初回「チュートリアル終了」→「生き残れ！」は維持し、再実装しない。
- **完成改善①・夜間休息場所の危険回避**：`game.js:nightCoverThreatened`を追加。野犬/アルファが165以内かつ遮蔽物越しでない夜間休息候補を除外。春〜秋の実在茂みと冬の可視の車・建物壁の候補を同じ危険判定で選ぶ。`winterCoverSpotFor`の末尾に任意accept条件を追加し、旧呼出しと冬の開いた入口・不可視低木禁止を保持。隠れたプレイヤーは既存の奇襲を維持。
- **完成改善②・移動中の危険変化に追従**：以前の夜間目標へ野犬が接近したら、4秒の候補更新待ちをせず危険なキャッシュ目標を破棄して安全な場所へ再選択。既に茂み・壁陰にいる個体も野犬の目の前で無条件停止しない。
- **完成改善③・野犬への反応を実動作へ**：`game.js:updateIndoorRest`で、眠っていないウサギ/ハトも視線の通る野生捕食者が155以内なら`startlePrey→chooseEscape`を直ちに開始。既存の眠り→覚醒・逃走、壁越しの非検知、逃走衝突・川岸回避、狩猟→死骸→食事は維持。
- **変更ファイル/コミット**：`neo-wild/game.js` `5e42c01b7af8b7f82413fb937d44817f9791b225`、`neo-wild/index.html` cache rev `20261101-predator-safe-night-rest-v1` `a0cd699322d24752eee438edcb0b8d651fa7c088`。Gamepad Bridge、mini-map/45分HUD、月齢/気象、3D/2D、SAVE_SCHEMA=2/3チェックポイントは未変更。force push/ロールバックなし。
- **QA**：現行6JS全文構文6/6、実`followNightCover/winterCoverSpotFor/updateIndoorRest`を模擬世界で検証した10項目（春安全茂み・冬安全な可視車陰・危険な旧目標の再選択・非危険時静止・野犬接近時の非静止・実`startlePrey/chooseEscape`連動・壁越し非反応・旧関数呼出し・セーブ互換・最終目標維持）10/10、実`announceObjective/showMissionMilestone/finishMissionMilestone/checkMission/reconcileRestoredGoals/getObjective/isValidSnapshot/getCheckpoints`を使う旧セーブ/mission6→7/一回告知/無限通知なし/最終マーカーなし/3チェックポイント等7/7、実`updateIndoorRest→startlePrey→chooseEscape`の野犬から216距離増加・眠りから覚醒の2/2、**計25/25 PASS**。**試験は抽出した実関数＋模擬DOM/世界であり、実ブラウザ10〜20分E2Eではない。**
- **Pages**：コード終了HEAD `a0cd699322d24752eee438edcb0b8d651fa7c088` のrun IDは取得できず、build/deployとも**未確認**。GitHub connectorのcommit workflow検索はPRイベント限定でこのpushには空配列。以前の `e96533bf...` に対するrun `41314359468` successを今回の配信成功と混同しない。**未検証**：実Android/iOS、物理ゲームパッド、実ブラウザWebGL/Canvas2Dと15分プレイ/FPS、旧SAVE_SCHEMA=2/チェックポイント3件の実localStorage復帰、ミニマップ縦横DOM実測。
- **次45分枠（UI/統合担当）**：(1) 実ブラウザで冬の可視外壁/車陰の休息候補と野犬接近→ウサギ/ハト覚醒→逃走を確認し、`nightCoverThreatened`の165px閾値で不自然な停止があれば実画面基準で調整。(2) 横800×360/844×390/736×414・縦390×844で常設ミニマップの3段階縮尺・長押し詳細、score/月齢/4ボタン/パッドHUDの`getBoundingClientRect`非重複を測定し、問題のみvisual.cssを最小修正。(3) 旧SAVE_SCHEMA2/3チェックポイント・全画面横向き・物理パッドとPages workflowのbuild/deploy両成功を確認、実機未確認を明示。
- **次15分枠（狩猟/AI）**：現行`updateIndoorRest/followNightCover/startlePrey/chooseEscape`で実ブラウザ10〜20分の潜伏→追跡→攻撃→死骸→食事を通す。野犬/アルファの位置変化がミニマップの赤/橙、獲物の緑へ追従し、mission7でシアン目的地なし・「生き残れ！」のみを維持。異常があれば現物再現と最小修正。
- **進捗**：**71/100据え置き**。実コードと模擬統合はPASS、最新Pages/実機E2Eが未確認のため72とはしない。ROADMAP追記開始時の最新HEAD：`d6ce0ee7f1c2649945f6c05cf6d1dda13e9c6913`。

## 共通スプリント｜2026-11-01 23:05 JST｜45分枠｜MINIMAP-COMPACT-MARKERS-01 右上ミニマップ操作統合・3段階縮尺・危険度色分け
- **開始HEAD→コード終了HEAD**：`89b0a3d94031318699bf73784f137ed58ec76ee9` → `e96533bf50553465ccb8107218b2504b1678fe2a`。前45分枠（22:48常設ミニマップ）と前15分枠（22:10冬の狩猟AI）、Drive正本末尾SURVIVAL-FINAL-GOAL-01を確認。旧地図エンジン・drawMiniを再利用し、旧セーブ/AI/照明/パッドを変更しない。
- **完成改善①・操作集約**：`index.html`から独立「地図」ボタンを除き、右上常設`#mini-map-control`に統合。短押しで「標準1270→遠目1905→広域2800→標準」の表示範囲を切替、550ms長押しで既存詳細地図を開く。マウス・タッチのpointerイベント、移動キャンセル、キーボードEnter/Space、既存Mキー/詳細地図の閉じる操作を維持。画面カメラのズームとは別状態であり、ゲームpad肩ボタン/キーボード/ピンチによるカメラズームを維持。
- **完成改善②・実データ色分け**：`drawMini`は現在のmobs/species・m.maxHp・P.maxHp・sp.damage/P.damage・alert/windup/searchを参照。白三角=プレイヤー、シアン=現在目標、青丸=巣、赤菱形=alphaまたはプレイヤーより大幅に強い個体、橙三角=通常敵対、黄四角=平静なイノシシ、緑丸=獲物。最大30体を距離順に描画し、3段階とも位置・向き・目標は毎描画更新。既存詳細地図の描画は維持。
- **完成改善③・右上再配置**：`visual.css`で縦画面は操作列の下（地図top120px、96角）→得点top230px、横画面は地図top90～93px、80～105角→得点top180～210pxへ整理。高さ691px相当で一度見つかった地図/得点10px重複を修正コミットで解消。タッチ端末の独立大型カメラズームパネルを非表示（ピンチ・パッド肩ボタン・PCキー操作は存続）。既存横画面コンパクトUI・タイトル・左右アクションは維持。
- **変更ファイル/コミット**：`neo-wild/game.js`、`neo-wild/index.html`、`neo-wild/visual.css`。コードコミット `2eda1024aad95d80b7de629ddd72040800bd22ae`、横画面得点重複修正 `e96533bf50553465ccb8107218b2504b1678fe2a`。他ディレクトリ変更なし、force pushなし。
- **QA**：JS全体new Function構文PASS、HTML ID重複なし、CSS括弧整合、必須map/zoomハンドラ保持PASS。実`drawMini`関数をモックCanvasで3縮尺（1270/1905/2800）×緑/橙/黄/赤/青/シアン/白の全色描画3/3 PASS、プレイヤー位置・向き変更再描画PASS。実イベントコードの短押し3回→標準復帰、550ms長押し→詳細地図、Enter切替を模擬DOMでPASS。CSS数式による横800×360/844×390/736×414/1536×691・縦390×844の地図対得点重複0/5（**実DOM矩形測定ではない**）。**未検証**：Android/iOS実機のタップ・長押し/ピンチ、ブラウザ実画面の他HUDとの重なり、物理パッド、WebGL/2D実GPU、SAVE_SCHEMA=2旧セーブ・3チェックポイントの実ブラウザE2E、15分実プレイ/FPS。未検証をPASS扱いしない。
- **Pages**：コードHEAD `e96533bf50553465ccb8107218b2504b1678fe2a` に対する`pages build and deployment` run **41314359468** は`completed/success`、build/deploy/report-build-statusの3ジョブすべて`success`。コード配信成功。ROADMAPだけの本追記コミットは別HEADのためrunは別途確認。
- **次15分枠（狩猟AI）**：(1) `game.js`の獲物/捕食者の`m.type`とalert変化を最新`drawMini`分類に合わせて検証し、冬の狩猟AIの移動更新が現在座標に反映することを確認。(2) `mission6→7`で目標シアンが消え「生き残れ！」だけになることを確認。(3) `chooseEscape/updateIndoorRest`の建物外壁→野犬→逃走→攻撃→食事を実関数で継続し、45分枠のHUDと入力を上書きしない。
- **次45分枠（UI/統合）**：(1) 実ブラウザの`getBoundingClientRect`で縦390×844/横800×360/844×390/736×414/1536×691の地図・スコア・月齢・4ボタン・ゲームパッドHUDの重なりを実測して必要時最小修正。(2) Androidで地図3回短押し→長押し詳細→閉じる、カメラピンチ、全画面回転、旧SAVE_SCHEMA2/3チェックポイントを通し、実機未検証を解消。(3) 色弱でも形状が判別できるか、強敵判定のHP/攻撃閾値と負荷（30体上限）を実プレイで調整。
- **進捗**：**71/100据え置き**。コード実装・Pages配信は確認、実機E2E未確認。

## 共通スプリント｜2026-11-01 22:48 JST｜45分枠｜MINIMAP-ALWAYS-ON-01 常設ミニマップ実装
- **開始HEAD→コードHEAD**：`eb2f33a70ef294c754d145ae7f24ce9ae2729e54` → `5250b4b0d37dc9b3abeb6000cd7813973ff3ce1b`。前15分枠（22:10、冬の可視外壁→休息→逃走→狩猟・食事）と前45分枠（21:45、横画面コンパクトUI・ズーム左下）を照合。Drive正本の最終SURVIVAL-FINAL-GOAL-01、既存minimap描画、詳細地図、パッド・月齢仕様を確認。新規地図エンジンは作らず既存Canvasと`drawMini`を拡張。
- **完成した連動改善①**：`visual.css`で既存`#hud .map-frame`の横画面非表示を上書きし、常時表示。横画面800×360/844×390/736×414/1536×691では画面右側、右下4ボタンと右上操作・ゲームパッド状態表示の左に80～112px角を配置。縦390×844では94px角。PCは112px角。横画面コンパクトHUD、タイトル2カラム、左下ズーム、4ボタンの寸法と位置を変更しない。
- **完成した連動改善②**：`game.js:drawMini`にプレイヤー向きの三角マーカー、巣（範囲内）、現在の`getObjective()`の目標点と範囲外方向矢印を追加。道路・川/運河・橋（既存道路と水路の重ね描画）・建物・動物・探索地点を維持。プレイヤー座標を中心に毎0.14秒更新し、目標完了時は旧マーカーを残さない。最終`mission>=7`では`getObjective()`がnullとなり、自由探索/旧目標は再表示しない。
- **完成した連動改善③**：新規開始直後に`drawMini()`を追加。既存の旧セーブ復元時`drawMini()`、毎0.14秒更新、既存「地図」ボタンと詳細地図`world-map-canvas`を維持。Canvasを128×128へ変更し、`index.html`のgame.js/visual.cssキャッシュrevを更新。SAVE_SCHEMA=2/3チェックポイント・Gamepad Bridge・月齢照明・15分枠の冬狩猟AIは変更なし。
- **変更ファイル／コードコミット**：`neo-wild/game.js`、`neo-wild/visual.css`、`neo-wild/index.html` → `5250b4b0d37dc9b3abeb6000cd7813973ff3ce1b`。他ゲーム/他ディレクトリ編集なし。force pushなし。
- **QA**：全`game.js`構文、HTML ID一意、既存詳細地図・横画面CSS・Gamepad/月齢・旧セーブ形式、開始/復元の再描画、実`drawMini`関数をモックCanvasで起動→位置移動/地区変更→向き変更→目的地切替→目標消去、横800×360/844×390/736×414/1536×691・縦390×844のCSS寸法推定を合計**19/19 PASS**。**注意：レイアウトは数式推定であり実ブラウザgetBoundingClientRectではない。** WebGL/Canvas2D実画面、Android実機・縦横全画面、物理パッド、旧セーブ/チェックポイント3件のブラウザE2E、10～20分プレイ/FPSは未検証。旧セーブとAIの実機動作をPASSと誤認しない。
- **Pages**：コードHEAD `5250b4b0d37dc9b3abeb6000cd7813973ff3ce1b` のrun ID `41313302361`は**completed/success**、ジョブ`build`・`deploy`・`report-build-status`すべて**success**を確認。コードのPages配信成功。実Android/実ブラウザでのミニマップ表示・矩形実測は未確認。**進捗71/100据え置き**（実画面・実プレイ未検証のため）。
- **次15分枠（狩猟/ミッション担当）**：(1) 最新HEADから`game.js:getObjective`と`drawMini`の依存関係を確認し、冬の狩猟AI更新時に旧目標/自由探索マーカーを戻さない。(2) `updateIndoorRest/startlePrey/chooseEscape`で壁陰休息→犬接近→逃走→攻撃→食事を実プレイ相当で通し、地図の獲物マーカーが現在位置に追従することを確認。(3) `mission6→7`の終了後、ミニマップ目標マーカーなし・常設「生き残れ！」を維持する。
- **次45分枠（表示/統合担当）**：(1) 800×360/844×390/736×414/縦390×844/PCで実ブラウザ`getBoundingClientRect`を取得し、ミニマップと右上操作・score・Gamepad状態・nav・右4ボタン・左ズームの非重複を確認し、必要なら`visual.css`を最小修正。(2) 実Chromeで新規/旧セーブ/3チェックポイント→横全画面→移動・視点・目標切替→地図→縦復帰を試し、WebGL/2D・パッドの実機未確認を解消。(3) Pages run `41313302361`のbuild/deploy成功を照合し、公開反映後に実URLで常設表示を確認する。
- **終了HEAD**：コード `5250b4b0d37dc9b3abeb6000cd7813973ff3ce1b`、本ROADMAP追記コミットが次の引継ぎHEAD。

## 共通スプリント｜2026-11-01 22:10 JST｜15分枠｜NIGHT-HUNT-WINTER-COVER-01 室内出入口のある建物でも冬の潜伏→覚醒→逃走→狩猟・食事をつなぐ
- **開始HEAD→コード終了HEAD**：`6a1949a8be240207774819d61e1d0430e0e3e0c4` → `3f79c9ff0a8cc56114cd2a3066e56a6b6f731c77`。最新の45分枠のLANDSCAPE-COMPACT-UI-01と既存SURVIVAL-FINAL-GOAL-01、Drive正本末尾を確認。「自由探索」廃止、mission6→7で1回「チュートリアル終了」→常設「生き残れ！」は既に実装済み。重複修正せず維持。
- **連動改善①・冬の可視遮蔽物**：`game.js:visibleWinterCover` が `b.interior` の建物を無条件除外していたため、入れる建物の外壁でも冬の潜伏が成立しない問題を修正。実在する `shelterWalls` の壁片から距離判定し、**開いたドアは遮蔽物にしない**。`winterCoverSpotFor` に入れる建物の外壁・扉両脇を候補追加し、衝突と実経路を通った地点だけ採用。冬の不可視低木は復活させない。
- **連動改善②・敵からの逃走**：`game.js:chooseEscape` の78px候補だけの選択を、78/44/24pxの3距離＋既存 `routeClear` による建物・車・水路の実経路判定に変更。壁や河岸で長距離逃走候補が塞がれても、短い安全な回避を選択可能。長い安全経路・逃走方向を優先し、瞬間移動や水中侵入はさせない。
- **連動改善③・攻撃→食事の結合検査**：現行実関数 `resolveAttack/kill/animalRemains/eat` を呼び、ウサギを攻撃→HP0→死骸→DNA取得→肉を食べて満腹・HP回復を再現。冬の実外壁で `updateIndoorRest` が休息開始→野犬接近→ `startlePrey/chooseEscape` で覚醒・逃走することも確認。プレイヤーの冬潜伏、旧ミッション、旧セーブ・3チェックポイントの処理は変更なし。
- **コミット**：`neo-wild/game.js` `08ed4708c7bf0d41c940a1e28fa46ba4f2cce7f9`、`neo-wild/index.html`（game.jsキャッシュrev `20261101-winter-cover-escape-v1`）`3f79c9ff0a8cc56114cd2a3066e56a6b6f731c77`。その他のファイル、Gamepad Bridge、横画面CSS、月齢照明、SAVE_SCHEMA=2は未変更。
- **QA**：6JS全文構文 **6/6 PASS**。実関数を模擬DOM・状態で動かす10項目（入れる建物の壁/ドア開口、冬潜伏地点、夜間休息→野犬接近→覚醒・逃走、短距離回避と河岸）**10/10 PASS**。実 `resolveAttack/kill/eat` の攻撃→死骸→食事・回復 **5/5 PASS**。実 `collides/routeClear/shelterWalls` を使う建物・開口・河川経路 **8/8 PASS**。計 **29/29 PASS**（うち6は構文）。実ゲーム全体のブラウザ10～20分E2Eではない。**未検証**：Android/物理パッド、実GPU 3D/Canvas2D描画、旧SAVE_SCHEMA2 localStorage実復元と3チェックポイントE2E、縦横実DOM矩形、Pages最新HEAD build/deploy。
- **Pages**：このコミットのpush Pages workflow run IDを現在のGitHub connectorから取得できず、build/deployとも**未確認**。以前の別HEADの成功を今回の成功と混同しない。**進捗71/100据え置き**（Pagesと実プレイ未確認）。
- **次45分枠**：(1) ブラウザで冬1月の車/入れる建物の実壁へ潜伏→ウサギ/ハトが休息→野犬接近で覚醒→逃走→攻撃→死骸→食事まで10～20分操作し、特にドア開口で潜伏不可・建物壁で潜伏可を視覚確認。(2) 横800×360/844×390/736×414の `#survival-goal/#nav-hud`、月齢・右4ボタン・左スティック/ズーム・ゲームパッド入力と旧セーブ3件のE2Eを実行し、重なりや再告知だけ最小修正。(3) `3f79c9ff0a8c` 以降のPages workflow run IDを取得してbuild/deploy両ジョブのsuccessを確認、未反映なら原因を記録。次15分枠は狩猟AIの連鎖で未完の部分を実ブラウザ相当で再現し、45分枠のUI/パッド/照明を上書きしない。
- **終了HEAD**：コード `3f79c9ff0a8c`、本ROADMAP追記コミットが次の引継ぎHEAD。

## 45分枠追補｜2026-11-01 21:46 JST｜LANDSCAPE-COMPACT-UI-01 タップ領域の40px化
- 横画面HUDの右上ポーズ・音・地図・全画面を**高さ40 CSS px**に統一（以前の36pxから修正）。スコア表示を上端96pxへ下げて右上操作列との重なりを回避。右下4アクション44～50px、ズーム40px、タイトル全画面ボタン40pxを維持。
- 変更コミット：`visual.css` `02dc7de2c5cf9af0bb401f54e0b4b3b985fa92eb`、`index.html` `777a213ac29b8c257eb13b244fed41d821271258`（visual.css cache revを`20261101-landscape-compact-v2`に更新）。コード終了HEAD `777a213ac29b8c257eb13b244fed41d821271258`。
- 既存6JS構文・CSS構造・viewport寸法の33項目は直前PASS。追加2点（操作ボタン高さ40px・スコア開始96px）はCSS上で照合。実ブラウザ/実Androidの矩形測定は未実施。直前コードHEAD `fd956266...` のPages run `41307958732` はbuild/deployともsuccess。新コードHEAD `777a213...` のPagesはrun `41308103882` がqueued（21:46 JST時点）で、配信成功は**未確認**。次枠はこのrunのbuild/deploy両成功を確認し、実画面のタッチ/重なりを測定。進捗71/100（未検証を加点しない）。
- 次15分枠はmission6→7の終了告知/常設「生き残れ！」と夜間狩猟AIを継続し、45分枠のUI/joystick/パッドBridgeは変更しない。次45分枠は800×360、844×390、736×414でタイトルとHUDのgetBoundingClientRect、ズーム/スティック実入力、PS/Xboxパッド、旧セーブ3件を優先QAする。

## 共通スプリント｜2026-11-01 21:45 JST｜45分枠｜LANDSCAPE-COMPACT-UI-01（横画面UI全体縮小・タイトル再配置・ズーム移動）
- **開始HEAD→コード終了HEAD**：`a60b3020b44c6ddab8a41aa79548d5b8033e67b3` → `fd95626683253d7eb1593097c63f3ed14b7ef159`。前15分枠`SURVIVAL-FINAL-GOAL-01`の21:40追補、Drive完成仕様書末尾、main対象10ファイルを取得。15分枠が同時更新した`game.js`と`index.html`は最新blobを再取得してから差分適用し、ミッション/旧セーブ/ゲームパッド/月齢照明を巻き戻していない。対象はneo-wild/のみ。
- **画像に基づくプレイ改善①**：`visual.css`末尾にモバイル横画面（coarse pointer＋高さ760px以下、または幅1024px以下かつ高さ520px以下）の独立レスポンシブレイアウトを追加。HUDを生命・巣/備蓄の左列、AREA・時刻・月齢・「生き残れ！」の中央列、ポーズ/音/地図/全画面と得点の右列へ整理。生命/空腹/持久バー、巣、備蓄、食料庫/ガイドを圧縮。目標マーカーを中央HUD下に配置、手動ミッションパネルは高さ制限とスクロールで操作部に重なりにくくした。縦画面/通常PCのスタイルは維持。
- **プレイ改善②**：左下スティックを実寸94～118px、ディスク76～94px、右下PS式4ボタンを44～50pxに縮小。CSS transformによる見かけだけの縮小を使わず、ボタンの実タッチ領域も同時変更。従来の下中央ズーム（幅約125px/ボタン44×40px）をスティック右隣の左下へ移し、幅約124px/ボタン40×40pxに調整。game.jsの`updateStick`固定44px半径/中心オフセットを、表示中のディスク/ノブの実BoundingClientRect/offsetWidthから求める方式へ変更し、横画面縮小後も移動入力の中心・可動半径を一致させる。縦画面にも表示ディスク準拠の正確な操作を適用。
- **プレイ改善③**：タイトルをモバイル横画面で2カラムに再配置。左に縮小ロゴ/副題、右に「続きから」「横画面で全画面プレイ」「新規ゲーム」を集約。短い画面でもメニュー内部の縦スクロールとタップを維持。背景画像/横画面API/既存新規開始/チェックポイントを変更せず、一時停止・地図・食料庫・ガイド・進化の最大高さも調整。Gamepad接続HUDは右上のポーズ列を塞がない高さへ移動。
- **変更ファイル・コミット**：`visual.css` `273bfa6c12ba37c5e62f4ef5c0febf7ada023115`（主レイアウト）＋`fd95626683253d7eb1593097c63f3ed14b7ef159`（スティックCSS互換）、`game.js` `5df1a031277f47026760cb69d9b0a344a93397df`（動的スティック半径）、`index.html` `ce225fd82be12168773a42cc81d03cf88e503861`（game/visualのcache rev）。旧SAVE_SCHEMA=2、3チェックポイント、4アクション、3D/2D、狩猟AI、月齢照明、横画面全画面API、DEBUGは削除していない。
- **QA**：現行6JS全文構文 **6/6 PASS**、style/visual CSSの括弧・引用符 **2/2 PASS**、横画面メディア条件・ボタン実寸・ズーム左下・タイトル2カラム・safe-area・JS半径・cache rev・HTML ID重複なし・SAVE_SCHEMA/パッド/地図/4ボタン等の静的整合と6画面（横800×360、844×390、736×414、1536×691のcoarse、縦390×844、PC1440×900）のCSS寸法式からの非交差推定を合わせ **33/33 PASS**。**ただし画面矩形は数式推定であり、実ブラウザのgetBoundingClientRectやスクリーンショット検証ではない**。Android実機/本物の縦横回転/ズームタッチ/物理パッド/10分プレイ/FPS/旧セーブlocalStorage E2E/3チェックポイントE2E/3D GPU描画は**未検証**。現行HTML/JSの存在チェックは実操作試験の代わりにならない。
- **Pages配信**：コード最終HEAD `fd95626683253d7eb1593097c63f3ed14b7ef159` に対する `pages build and deployment` run **41307958732** は `build=success`、`deploy=success`、`report-build-status=success` をジョブ単位で確認。コードのPages配信成功。ROADMAP追記後の新HEADについては別途run照合。
- **進捗**：**71/100（据え置き）**。3系統の画面改修を実装・配信したが、ユーザー画像と同じ実端末のHUD/タイトル/ボタン矩形で重なりゼロを確認できていないため、完成マイルストーンの加点は保留。
- **次15分枠**：(1)最新mainの`game.js:finishMissionMilestone/syncHUD/restoreSnapshot`を維持し、mission6→7→約1.9秒→「生き残れ！」固定と旧セーブ復元を検証。(2)夜の可視潜伏→覚醒→逃走→狩猟→食事を実関数で連続QA、横画面のHUD/パッド入力箇所は重複改修しない。(3) `#survival-goal/#nav-hud`と狩猟演出が同時表示される状態を報告し、45分枠へ視覚的競合を引き継ぐ。
- **次45分枠**：(1)Android Chrome相当の横800×360/844×390/736×414/1536×691物理px、縦390×844とPCで実ブラウザのgetBoundingClientRect/スクリーンショットを取得し、左上HUD・中央月齢/ナビ・右上操作・右下4ボタン・左下スティック/ズームの重なり/画面外ゼロを判定、問題なら`visual.css`最小修正。(2)タイトル「続きから」「横画面で全画面」「新規ゲーム」→プレイ→ズーム→停止→縦復帰を実操作し、`game.js:updateStick`の全方向入力とGamepad接続/非接続、旧セーブ・3チェックポイントを確認。(3)地図/食料庫/ガイド/進化/DEBUGと夜間月齢HUD・狩猟通知を横画面で表示し、40～44pxタップ領域とスクロール、FPS、Pages最新runを確認。実Android/物理パッドがなければ未検証のまま明記。
- **終了HEAD**：コード `fd95626683253d7eb1593097c63f3ed14b7ef159`、本ROADMAP記録コミットが次の引継ぎHEAD。強制push・全面ロールバックなし。

## 共通スプリント追補｜2026-11-01 21:40 JST｜15分枠｜SURVIVAL-FINAL-GOAL-01 実関数統合QA・終了フレーム即時HUD
- **開始HEAD** `a60b3020b44c6ddab8a41aa79548d5b8033e67b3`。既存21:15枠の自由探索全廃・一度だけ終了告知・常設「生き残れ！」は既にmain実装済みと確認。45分枠の横画面、gamepad、月齢照明は一切上書きせず、ユーザー指示を重複実装しない。
- **実コード改善**：`game.js:finishMissionMilestone` で最終約1.9秒告知終了と同フレームに `syncHUD()` を実行し、最終目標「生き残れ！」を即時表示。従前は次の定期HUD更新（最大約0.14秒後）まで隠れた。 `game.js` commit `f1793a74110db958a1f4df488362816d2f3a6115`、`index.html` キャッシュrev `20261101-survival-final-03` commit `271de31d5451a61d464af2a5c59bb3d61ead5a9e`。
- **実関数統合QA**：本物の `checkMission/advanceMission/showMissionMilestone/finishMissionMilestone/missionInfo/getObjective/objectiveShortLabel/reconcileRestoredGoals/visibleWinterCover/winterCoverSpotFor/followNightCover/updateIndoorRest/startlePrey/maintainLocalWildlife` を模擬DOM・状態で実行。12/12 PASS：mission6→7、初回終了告知1900ms、最終目標固定、告知終了、500回チェックでも無限通知なし、旧mission7復元、旧mission6達成済復元、冬の実可視遮蔽物、ウサギの潜伏地点誘導、休息開始、発見覚醒・逃走、最終段階の獲物補充。追加の `finishMissionMilestone` 改修後単体テストで同フレーム `syncHUD` 1回・告知再生なし PASS。6ファイル（game.js/webgl3d.js/gamepad.js/audio.js/season-clouds.js/debug-mode.js）の全文JS構文 6/6 PASS。最終HUDの `.hidden{display:none!important}` と `#survival-goal` の表示優先関係も確認。
- **未検証**：実ブラウザ10～20分、旧セーブ/3チェックポイントの実localStorage E2E、Android物理画面・実パッド、3D/2D GPU実描画。Pages：最終コードHEAD `271de31d5451` の combined statuses空、PR対象workflow runs空（この照会はpushのPages workflowを列挙できない）。build/deploy成功を確認できず **公開反映は未確認**。進捗 **71/100据え置き**。
- **次45分枠の最初の3作業**：(1) `game.js:finishMissionMilestone/syncHUD/restoreSnapshot` をブラウザでmission6→7→1.9秒→「生き残れ！」→続き/3チェックポイントで再現、再通知・ラベル重なりを修正。(2) 横画面タイトル→全画面→プレイと物理Gamepad 4ボタン、月齢/雨天照明、冬の休息→警戒→逃走→狩猟を実機/ブラウザ相当で確認。(3) Pagesの最新HEADについてbuildとdeployの両方をrun IDで照合、失敗ならログから復旧。旧セーブと狩猟AIを巻き戻さない。

## 共通スプリント追補｜2026-11-01 21時台｜SURVIVAL-FINAL-GOAL-01 最終目標HUDの常設化と回帰検査
- **追加コミット**：game.js `0fe31697ec1ecbe603dc413733b9a26d95813774`、visual.css `89341571c2b9de28eca18c9308fb3661b42064a0`、index.html `7e35e71bbb33695e02e8e2c272817e0cbfb7e5d2`。最終mission7の「生き残れ！」を、手動開閉の大きなmissionパネルに頼らず、画面中央上の小さなHUDとして通常プレイ中だけ常設。終了告知中・新規ゲーム時は隠す。ゲームJS/visual.cssのキャッシュrevを更新。
- **追加QA**：game.js/webgl3d.js/gamepad.js/audio.js/season-clouds.js/debug-mode.jsのJS全文構文 **6/6 PASS**。HTML内のgame.jsが参照するID **101種すべて存在**、旧「自由探索」表示文字列は対象6JS/HTML/CSSに**残存なし**。最終HUD DOM/表示切替/キャッシュrevの整合PASS。実Android・実ブラウザの10分プレイ/旧SAVE_SCHEMA=2チェックポイント3件E2E・GPU/パッド実機は引き続き**未検証**。Pages workflowはコネクタのcombined statuses空、PR限定workflow照会も0件で、build/deploy成功を判定できず**未確認**。進捗は**71/100据え置き**。
- **次45分枠の追加確認**：縦横・横画面全画面メニュー・月齢HUDと並んだ「生き残れ！」ラベルが操作ボタン/地図/スコアに重ならないこと。特に狭いスマホ横画面で必要ならvisual.cssのサイズと配置のみ調整し、15分枠のミッション進行ロジックは保持する。

## 共通スプリント｜2026-11-01 21:15 JST｜15分枠｜SURVIVAL-FINAL-GOAL-01（自由探索の無限目標廃止）
- **開始HEAD** `6463c0a969b325a125b59e308777dbfc14e5e69b` → **実装コミット** game.js `7d1bfd2b71c667c4ec35febf41117624cf557ee3`、index.html `175362966d53e9327cef80994255a47b96ecd2ec`。45分枠の横画面/ゲームパッド/月齢・街灯ハロー撤去を保持。ROADMAP追記コミットは本項目のコミット。
- **プレイ上の変更①** mission6（探索地点2件）完了時、中央に「チュートリアル終了」を約1.9秒**1回だけ**表示し、mission7以降はHUDの「生き残れ！」に固定。途中の既存達成告知は短い「EXCELLENT!」にしてチュートリアル終了の二重表示を回避。終了告知後は通常プレイへ戻る。
- **変更②** 「自由探索 / 生存」の無限食事↔狩猟ミッション、進行カウンター、交互達成通知、次目標案内、最終目標の目的地マーカーを停止。手動ガイドの最終項目も「生き残れ！」に統一。巣・備蓄・狩猟・移動・生態系は継続し、最終段階でも野生獲物が補充されるよう `maintainLocalWildlife` の狩猟条件を調整。
- **変更③** 旧SAVE_SCHEMA=2・3チェックポイント互換のため `freeStep/freeTarget/expedition` の読込/保存フィールドは残すがゲーム進行/UIでは使用しない。旧mission7復帰時は完了済み扱いとし、達成告知を再表示しない。旧mission6の既達成条件の復元時も告知は再生しない。mission7既読を `tutorialSeen` に保存。
- **検証**：game.js全文JS構文PASS、実`missionInfo`の最終表示PASS、実`showMissionMilestone`の約1900ms/日本語表示PASS、実`advanceMission`6→7の既読/完了状態と無限告知抑止PASS、実`checkMission`のmission7後の無限ループ停止PASS、SAVE_SCHEMA=2互換のソース整合PASS。HTML game.js rev `20261101-survival-final-01` 更新済み。**実ブラウザ10〜20分・Android・物理パッド・旧セーブE2E/3チェックポイントE2E・3D/2D実描画・Pages build/deploy成功は未検証**。未検証をPASSと扱わない。進捗は**71/100据え置き**。
- **次45分枠への引継ぎ**：(1)最新mainの`game.js:showMissionMilestone/finishMissionMilestone/advanceMission/missionInfo/syncHUD`をブラウザ相当でmission6→7→2秒終了→「生き残れ！」固定→食事/狩り10分→再開/チェックポイント3件の順に再現、無限通知やUI重なりがあれば修正。(2)45分枠担当の横画面・ゲームパッド・月齢/悪天候照明を維持し、縦横HUDの「目標」だけ表示・目的地マーカー消滅と狩猟/食事を実画面で確認。(3)Pagesの最新SHA build/deploy別々の成功確認、旧セーブ/実Android・物理パッドが未確認ならそのまま明記。15分枠は引き続き冬の潜伏→夜間覚醒→追跡→狩猟→食事の連動を次回完成させる。

## 共通スプリント追補｜2026-11-01 20:50 JST｜LANDSCAPE-FULLSCREEN-TITLE-01 横画面タイトルのタッチ操作を補強
- **作業開始HEAD**：`fb0e06f1b1d658d2cd2801eb33a557b00d6259c1`。並行45分枠が`NIGHT-MOONLIGHT-NO-LAMPGLOW-01`を`game.js/webgl3d.js/visual.css/index.html`に実装した直後の最新を確認してから、本横画面修正は`visual.css`と`index.html`のみに限定。新月/満月・天候・街灯ハロー撤去・Gamepad Bridgeを巻き戻さない。
- **追加改善**：スマホ横画面の短い高さでタイトル内容があふれた場合、既存`html,body{touch-action:none}`によりメニューがスクロールできなくなる危険を軽減。メニュー/スクロール領域の`touch-action:pan-y`とボタン・選択欄の`manipulation`を明示し、スクロール領域にiOS向け慣性スクロール指定。新しい`visual.css`のrevを`20261101-night-moonlight-hud-landscape-v2`へ更新し、45分枠の月齢HUDを維持。
- **コードコミット**：`neo-wild/visual.css` `9e4866f09ee3494578b9136bea51f401a3745af8`、`neo-wild/index.html` `306da0a98c13ca43b7ffa3e4c495425419005855`。横画面・全画面トップ選択の従前コミット`4a318e43/0da61111/c2d26e63/91853742`は保持。
- **テスト**：main最新game.jsの全文構文PASS、タイトル選択のDOM/回転処理、6スクリプトとgamepad、最新月明かり関数とCSS新revの維持を確認。先行ブラウザAPI模擬6経路PASS。実Androidでのスクロール・横画面自動固定、実フルスクリーン、縦横HUDおよび新SHA Pages deployは**未検証**。コードmainコミット済みでも配信成功は未断定。
- **終了HEAD**：本追補コミット。**進捗**71/100据え置き。**次45分枠**：(1)横画面メニュー選択→全画面→続き/新規→プレイを実Androidで確認、(2)画面が横にならない端末で自動回転案内・フルスクリーン非解除、タッチメニューのスクロールを実機確認、(3)月光HUD・Gamepad・冬の狩猟動作の縦横表示とPages build/deployを確認して、問題のみ最小修正。

## 共通スプリント｜2026-11-01 20:45 JST｜45分枠｜NIGHT-MOONLIGHT-NO-LAMPGLOW-01（街灯ハロー撤去・月齢と天候に連動した夜間照明）
- **担当・HEAD**：45分表示/照明担当。開始HEAD `91853742e13896994bacccae131ad6d5d6d7b405`、実装HEAD `87ad359f1f49fa924468086ec55b604f65cb225d`。直前15分NIGHT-HUNT-WINTER-COVER-01と45分GAMEPAD-FULL-CONTROLS-01、Drive完成仕様設計書末尾を確認。狩猟AI・ゲームパッド・セーブを上書きしない。
- **連動実装①**：game.jsのCanvas2D/3D共通オーバーレイで、街灯位置に描かれていた半径130の巨大な黄色・橙色の加算radialGradientを完全削除。街灯ポール・目的地/入口/狩猟マーカーは維持。WebGL側に街灯ハロー生成は元々なし。
- **連動実装②③**：elapsed/85から29.530588ゲームDAY周期の月齢を決定（新月/上弦/満月/下弦）。旧セーブから自動復元し保存形式は変更しない。新月でも環境光0.17、晴天満月0.26程度、曇/雨/雷雨/霧は月光減衰。昼正午照度は従来維持、朝夕から夜へ滑らかに移行。game.js:dayLightProfile/worldDaylightをWebGL uNight/Canvas2D夜間暗転/NPC検知距離で共用。WebGL暗さ上限を0.91にして悪天候の輪郭を保持。
- **連動実装④**：DAY/時刻/天候の下に小さな月齢HUD。PC/縦横モバイルの文字サイズを設定。空の雲や発光球は追加せず、薄い地上雲影を維持。
- **変更ファイル／実装コミット**：game.js `e5cf6ea19e986ff5bedbab104a66fb7a4eb94c93`、webgl3d.js `42c7b3c3d50ec4ebbeb93bdd01158e89bd1b0053`、visual.css `0d6f5a8852c279938b3654ff71f20d4f0ccdfd28`、index.html `87ad359f1f49fa924468086ec55b604f65cb225d`（3種のキャッシュrev更新）。neo-wild/外の編集なし。
- **QA 31項目PASS**：現行JS全文構文2件、実moonlightProfile/dayLightProfileで晴天の新月/上弦/満月/下弦、満月の曇/雨/雷雨/霧、昼正午/朝/夕の11条件で負値なし・光度順位、29.53日周期、3D/2Dの光度順位、街灯ハロー消去/ポール存続、目標表示、HUD、ゲームパッドBridge、SAVE_SCHEMA=2/3チェックポイント、川/雨宿り/狩猟の静的回帰。静的項目を実ブラウザE2Eと混同しない。
- **Pages**：実装HEADのPages run `41303442694` は20:47 JST時点pending。build/deploy success未確認、公開反映済みとは報告しない。Android/PC実ブラウザ・物理パッド・実GPU FPS・縦横HUD・旧セーブ実localStorage E2Eは未検証。
- **進捗71/100**：画面実機・Pages配信が未確認のため据え置き。検証完了でのみ再判定。
- **次15分枠**：①最新HEADを読んでgame.js:worldDaylight/detectsPlayerの新月・満月・悪天候のNPC感知→睡眠覚醒→逃走を実関数で試験。②冬の可視潜伏→mission2→狩猟→死骸→食事の連続プレイを完成。③gamepad Bridge/moon-label/旧セーブ/橋経路を維持、入力箇所と描画箇所を競合させない。
- **次45分枠**：①DEBUGで新月/満月/雷雨を切替えて3D/2Dの街灯黄色円ゼロ・動物の夜間視認性・縦横HUDを実画面確認。②物理PS/Xboxパッドでタイトル→移動→視点→4ボタン→一時停止/メニューを15分試験。③旧セーブ/3チェックポイント・WebGL/Canvas2DとPages build/deploy成功を検証。未完なら同パッケージで継続。
- **ROADMAP追記前HEAD**：`87ad359f1f49fa924468086ec55b604f65cb225d`。本ログコミットが次枠の照合HEAD。

## 共通スプリント｜2026-11-01 20:37 JST｜手動最優先｜LANDSCAPE-FULLSCREEN-TITLE-01（タイトルから横画面・全画面へ）
- **担当／開始HEAD→現在HEAD**：45分枠・描画/画面/UI担当（同一既存タスクへ追補済み）。着手`ba5a98835f1f12ae81772294b61bf540f45cc59e` → 実装`91853742e13896994bacccae131ad6d5d6d7b405`。15分枠の夜間捕食者AI、45分枠のGamepad Bridge、月明かりパッケージの前提を維持。GitHub対象10ファイルとDrive正本末尾、前2枠ROADMAPを再読した上で最小差分。
- **ユーザーの最新要望**：「横画面にできなくなっている。トップ画面に横画面で全画面プレイの選択肢を追加」。実装① `game.js`の従来`rotateScreen`は`ScreenOrientation.lock`が拒否されたときに自分でフルスクリーンを解除していた。共通`setFullscreenOrientation(target,note)`へ改修。端末が対応すればユーザー押下でrequestFullscreen→landscapeロック。非対応時は誤った成功表示をせず、可能なら全画面維持＋手動回転を明示。既存一時停止画面の縦横切替も共通関数を利用。② `index.html`タイトルの続きから/新規開始の近くに`menu-landscape-btn`と`menu-landscape-note`を追加し、押した後は従来の続き/新規ゲームを選べる。③ `visual.css`に横画面高さ520px以下と縦画面のコンパクトボタン/HUD用スタイルを追加。HTMLにgame.jsとvisual.cssの`?rev`更新。保存形式、4操作、gamepad.js、AI、川橋など変更なし。
- **実装コミット／変更ファイル**：`neo-wild/game.js` `4a318e432455a8c31f04d70a62e27f349cc23a03`、`neo-wild/index.html` `0da611114ab2f7c7293badf521539114b6a63f88`＋キャッシュ`91853742e13896994bacccae131ad6d5d6d7b405`、`neo-wild/visual.css` `c2d26e6342ee4df294322d17971899c74f5f2f0c`。`neo-wild/`以外変更なし。既存15分/45分タスクのうち45分枠のpromptのみ追補、新規タスクなし。
- **QA**：mainから実ファイルを再取得しgame/webgl/audio/season-clouds/debug/gamepad **全文JS構文6件PASS**。タイトルDOM ID134件重複0、6 script維持、新ボタン/各rev/CSS/4ボタン・GAMEPAD Bridge・SAVE_SCHEMA=2・3チェックポイント/橋経路など静的回帰10件PASS。実game.jsの`updateRotationButton/setFullscreenOrientation/rotateScreen`をモックブラウザ環境で実行、Android Chrome相当のフルスクリーン→横ロック成功、回転ロック拒否でも全画面継続、iOS lock APIなし、Fullscreen APIなし/拒否、既に全画面の6経路PASS。拒否時の強制全画面解除は0回。**実Android端末での自動回転・本物のフルスクリーン・UI縦横/FPS、実iOS、旧保存E2E、物理パッド、Pages最新SHAのbuild/deploy成功は未検証**。
- **次45分枠の具体的対応**：①最新HEAD/前15分ログと本パッケージを照合、可能ならChrome Android実機を縦から起動しタイトル`menu-landscape-btn`→画面横化・全画面→続きから/新規→10分プレイ→停止→縦へ戻すまで確認。②非対応端末で全画面を勝手に解除しない案内/手動回転を確認し、`game.js:resize/setFullscreenOrientation`と`visual.css`の短辺高さ画面のHUD/操作衝突を修正。③当該SHAのPages build/deploy結果を取得、成功していなければ未配信と記録。街灯撤去＋月相照明パッケージは45分枠が続行、15分枠のAI/操作を巻き戻さない。
- **進捗**：71/100据え置き。mainコミット完了、実Androidと配信未確認のため、ユーザー画面での復旧完了は断定しない。**本引継ぎを次15分/45分枠で共通正本として参照**。

## 共通スプリント｜2026-11-01 20:17 JST｜15分枠｜NIGHT-HUNT-WINTER-COVER-01（冬の可視潜伏→夜の獲物の睡眠→覚醒→逃走→狩猟・食事）
- **優先／担当／開始HEAD→実装HEAD**：P0/P1・15分ゲームプレイ担当、`fed9c4986d16` → `d5bfd6df5c07b3e4eb574a31c5552f2fdfd18d3f`。前45分枠の`GAMEPAD-FULL-CONTROLS-01`を確認、`gamepad.js` blob `0b8e72ed...`を変更せず、game.js内のBridge/getAxesと4ボタン/HTML読込順を保持。開始時にmain対象game/webgl/index/style/visual/audio/ROADMAP/season-clouds/debug/gamepad全文・直近10コミット、Drive設計書末尾を取得。
- **今回の連動改善①**：従来の`winterCoverSpot`を`winterCoverSpotFor(actor,maxRange,avoid)`へ共通化。車・自販機・バリケード・建物外壁という実在の可視遮蔽物のみ候補とし、`collides`に加え`routeClear`が通る場所だけ目的地にする。プレイヤーの冬mission1案内は実到達可能な遮蔽物へ。不可視の白い低木を戻さない。
- **連動改善②**：`nightRestSeason`の春～秋限定を解消し、冬はウサギ/ハトが可視の車・建物等の陰を最大300座標から探して歩いて移動→`updateIndoorRest`で休息。夏の草陰選択・雨の建物避難優先は維持。季節切替後の古い不可視低木ターゲットは再選択。NPCの潜伏先はプレイヤー140座標以内を避け、既存4秒キャッシュで探索負荷抑制。
- **連動改善③**：`startlePrey`で覚醒時の実際の脅威座標を保持し、`update`の逃走方向再選択が無条件にプレイヤーから逃げる旧挙動を修正。野犬が追跡・噛みついた獲物はその野犬の位置を基準に障害物を避けて逃走。既存の`chooseEscape`、`advancePreyFeint`、野犬弱攻撃・死骸生成・`resolveAttack`・`eat`を維持。
- **変更ファイル／実装コミット**：`neo-wild/game.js` `baf24cadb170b65a77631fde85361e61962e5a09`、`neo-wild/index.html` `d5bfd6df5c07b3e4eb574a31c5552f2fdfd18d3f`（game.js `?rev=20261101-night-hunt-winter-cover-v4`）。他パス・gamepad.js・セーブスキーマ・4操作は変更なし。更新直前にmain HEAD/対象blob SHA照合。
- **QA PASS**：計51件。実関数`visibleWinterCover/winterCoverSpotFor/inCover/followNightCover/updateIndoorRest/startlePrey/chooseEscape`を組み合わせた冬の車陰到達・休息・野犬接近で覚醒・脅威記憶・逃走/春の草陰/雨天休息優先20件（移動と衝突は模擬関数）。実`getObjective/checkMission`の冬mission1→2を4件、実`resolveAttack/kill/animalRemains/eat/toBones/normalizeRemains/normalizeCarry`で攻撃→死骸→2回食事→HP/空腹回復→45秒骨・旧運搬互換9件、実`waterDepth/collides/move/routeClear/wildlifeBridgeWaypoint`で川の非橋侵入禁止・橋通行・車/建物衝突12件。game/webgl/audio/season-clouds/debug/gamepad全文JS構文6件PASS。HTML ID132件重複0、script6本・gamepad読込順、SAVE_SCHEMA=2/saveAuto/restoreSnapshot/recordCheckpoint/旧ガイドの存在を回帰確認。WebGLと2Dの表示コードは変更せず、休息姿勢・Zz・!表示は既存経路を使用。
- **Pages状況**：直前45分枠のrun `41299230710`はbuild=success、report-build-status/deploy=cancelled。今回実装コミット`d5bfd6df...`のコミット紐付けrun取得は空配列、status checksも空。**今回のPages build/deploy successと実公開反映は未確認**。実Android/物理パッド/縦横HUD/GPU/FPS、実ブラウザ10～20分E2E、旧セーブを実localStorageから復元するE2Eも未確認。
- **進捗**：71/100（±0）。実プレイに直結する3改善をmainへコミットし実関数統合試験を通過したが、**最新SHAのPages deploy success未確認**のため72/100条件は未充足。コードはロールバックしない。
- **次45分枠（GAMEPAD統合と本スプリントの仕上げ）**：①`gamepad.js:poll/confirm/back`と`game.js:getAxes/resetControls`でSTART/SELECT/4ボタン・冬mission1→2を物理パッド/実DOMで確認（できなければ模擬DOM・入力Bridgeを動的テスト）。②`game.js:followNightCover/updateIndoorRest/startlePrey/chooseEscape/resolveAttack/eat`の冬ウサギ・ハト休息→プレイヤー/野犬で覚醒→逃走→追撃→死骸→食事を実`update(dt)`ループかブラウザ10～20分で通す。止まる箇所があれば最小修正。③`game.js:steerPursuit/wildlifeBridgeWaypoint`で河川・建物の複合障害物を実経路テストし、最新mainのPages run ID/build/deployを照合。両枠の新しいスプリントを勝手に増やさず、残QAと公開確認を優先。
- **終了HEAD**：実装完了時`d5bfd6df...`。本ROADMAP追記コミットを次枠の着手HEADとして照合する。

## 共通スプリント｜2026-11-01 19:47 JST｜45分枠｜GAMEPAD-FULL-CONTROLS-01（物理パッドでゲーム開始から狩猟・メニューまで）
- **優先／担当／開始HEAD**：P0・45分枠、`6ace94a0f84f7c3110a8a074bc5debefe244fe78`。15分枠の直前NIGHT-HUNT-WINTER-COVER-01（冬の実遮蔽物→夜間覚醒→逃走→狩猟）を保持し、15分枠はAI担当を継続。既存タスクのみで実装。
- **連動改善**：①標準Gamepad API接続/切断/再接続、複数パッドの新押下選択、未接続時の従来入力退避。②左スティック/十字移動・右スティック視点/ズーム・肩ズーム。③×位置0連続攻撃、○位置1ジャンプ、□位置2短押し飛びつき/450ms長押し種族能力、△位置3短押し食事・運搬・備蓄/550ms長押し、エッジ検出と重複防止。④START停止/再開・SELECT地図・タイトル/ガイド/巣の食料庫/進化/結果画面の十字フォーカスと決定/戻る、日本語接続HUD。既存game.jsのアクションをBridge経由で再利用し、セーブ形式と旧タッチ/キー入力を保持。
- **変更ファイル**：`neo-wild/gamepad.js`新規、`game.js`入力合成・毎フレームpoll・Bridge、`index.html`読込順/rev、`visual.css`HUD/フォーカス、`ROADMAP.md`本ログ。**実装コミット／実装HEAD**：`7236531c6a16793f957421c81c5e49ce9271a567`。本ROADMAP補足コミットの終了HEADは次枠で照合。
- **QA PASS**：31項目（全文JS構文6ファイル、Gamepad APIモック接続・切断・複数選択・移動/視点・4ボタン短押し/長押し・連打抑止・START・地図・ズーム・APIなし、セーブ/チェックポイントと既存デバッグ・季節JS読込の静的回帰）。実Android/PC Chrome物理パッド、15分実プレイ、縦横実DOM、WebGL/Canvas2D、旧セーブE2E、Pages workflow `41299230710`：in_progress／結果待ち（実配信成功は未確認）。進捗71/100据え置き。
- **次15分枠**：①`game.js:updateIndoorRest/startlePrey/chooseEscape`の夜の休息→覚醒→逃走→追跡を維持して実AIループ検証。②`getAxes/loop/resetControls`のパッド入力統合を巻き戻さず、既存操作4ボタンを維持。③冬の実車/建物陰潜伏→目標進行を実プレイ検証。
- **次45分枠**：①実PS/Xboxパッド＋PC/Android Chromeでタイトル→続き/新規→移動/カメラ→5段攻撃→□長押し→△運搬→STARTを15分試験。②`gamepad.js:focus/navigate/confirm/back`のガイド/巣在庫/進化の実DOM・縦横レイアウト試験。③`game.js:getAxes/loop`で旧SAVE_SCHEMA=2と3チェックポイント再開、WebGL/2D・低FPS回帰。実機未検証のため実機対応完了とは断定しない。

## 共通スプリント｜2026-11-01 19:23 JST｜15分枠｜NIGHT-HUNT-WINTER-COVER-01（冬の潜伏→発見・覚醒→逃走・狩猟）
- **優先度／担当／開始HEAD→実装HEAD**：P0・P1、15分ゲームプレイ担当、`a948c4bc9c3f57f3b67487480d876f9f1fbff7e2` → `28bfaadbc1ecbe7b2a8e0b68d883d4abc5adf01c`。45分枠は同じパッケージの可視性・経路・実ブラウザ回帰を担当し、別スプリントを立ち上げない。編集前にmainのgame/webgl/index/style/visual/audio/ROADMAP/season-clouds/debug全文、直近12コミット、Google Drive設計書末尾を確認。前15分夜間休息・前45分冬の不可視低木潜伏禁止を保持。
- **問題と完成条件**：冬の低木を非描画にしたため`inCover`が常時偽となり、冬1月のチュートリアル「潜伏」が進行不能。加えて寝ている獲物が敵を察知しても睡眠解除のみで実逃走を開始しない場合があり、攻撃を受けた獲物は`resolveAttack`で逃走値を0へ戻される。プレイヤーが見える建物・車の陰へ移動して潜伏達成でき、夜の獲物が発見・攻撃・野犬噛みつきで起きて障害物を避けて逃げ、逃走マーク／近距離の「目覚めた！」を見られること。
- **実装①冬の実在遮蔽物**：`game.js`の`visibleWinterCover`を追加。12～2月は見える車・自販機・バリケード・建物外壁の近傍だけ`inCover`成立、白い塊や不可視低木を復活しない。春～秋は従来の実在低木。冬チュートリアルの短文・ガイド・目的地を`winterCoverSpot`による実在障害物の通行可能な外側へ切替。水・建物衝突と連動して到達点を選択し、旧セーブのmission1も達成可能にする。目的地検索はmission1に限定。
- **実装②③④夜の狩猟連携**：`startlePrey`で眠る獲物の覚醒・休息クールダウン・既存経路解除・逃走タイマーと方向を統一。実捕食者オブジェクトを取得（旧`some`真偽値を方向計算に渡さない）し、`chooseEscape`の脅威距離をその捕食者に合わせて実衝突チェックで方向決定。プレイヤー攻撃の非致死命中と野犬の噛みつきでも同じ逃走を起動。近距離覚醒は「目覚めた！」、従来の`!`逃走表示・3D/2D・攻撃報酬を使用。新ボタンなし、NPCワープ・削除なし。
- **変更ファイル／コミット**：`neo-wild/game.js` `df30dc3e3b1b094eea92c593a177941fcf0a4eb3`、`neo-wild/index.html` `28bfaadbc1ecbe7b2a8e0b68d883d4abc5adf01c`（game.js `?rev=20261101-winter-hardcover-startle-v1`）。ほかのゲーム・ルート・保存スキーマは無変更。書込前にHEADと両blob SHAを再取得して一致を確認。
- **QA PASS**：実`inCover/visibleWinterCover/winterCoverSpot/startlePrey/updateIndoorRest`の隔離実行で冬の不可視低木不成立・車/建物の陰・開けた地面不成立・冬ガイド地点・夏低木の従来動作・休息解除・実捕食者方向・近距離覚醒表示・プレイヤー攻撃/野犬噛みつき接続など23ケースPASS。追加で実`getObjective→collides/move→inCover→hiddenHold→checkMission`を実行し、冬の車両陰まで実移動→0.8秒潜伏→mission1からmission2へ進行PASS。現行mainを再取得したgame/webgl3d/audio/season-clouds/debugの全文JS構文5件PASS、操作4ボタン/3D/2D/雲影/冬の白い塊なし/夜の休息/川の橋/雨宿り/SAVE_SCHEMA=2/1秒自動保存/3チェックポイント/旧セーブ復元/手動ガイド/7タップDEBUG等20静的回帰PASS。静的項目は動作E2Eと区別。
- **Pages**：実装HEAD`28bfaadb`のPages run `41297242578`はbuild/deploy/report-build-status全ジョブsuccess（19:23 JST）。**ゲーム実装のPages配信成功を確認**。本ROADMAPだけの後続HEADは別runのため配信完了と混同しない。Android縦横/GPU/FPS・10～20分の実ブラウザ操作・実旧セーブ/チェックポイント再開E2E・遮蔽物周辺の本物のAI長時間経路は未検証。
- **進捗**：71/100（前回71、±0。統合実装は完了、Pages/実機E2E未確認のため据え置き）。**ROADMAP追記直前HEAD**：`28bfaadbc1ecbe7b2a8e0b68d883d4abc5adf01c`。本ログコミットが終了HEADとなる。
- **次45分枠の具体的3作業**：①最新HEADを再取得し、`game.js:visibleWinterCover/winterCoverSpot/getObjective`で冬1月のmission1を開始・実車/建物の陰へ歩行→0.75秒潜伏→mission2へ進行する統合シミュレーション。ルート不可・遮蔽物不在の開始地点があれば最小差分修正。②`updateIndoorRest/startlePrey/chooseEscape`と`resolveAttack`、野犬`wildAttack`を実NPCループで夜間覚醒→逃走→攻撃→死骸まで確認し、川/橋/建物の衝突・振動を検証。③`drawScene`の3D/2D冬の可視遮蔽物・`!`・目覚めた表示、縦横HUDとPages run `41297242578`のbuild/deploy結果を確認。Android実機が無理なら実DOM模擬で保存復元と10分相当のAI進行をテスト。ロールバック・白い塊・空の雲の再導入禁止。

## 2026/11/01 18:49 JST｜45分枠・冬の不可視低木で潜伏できる不整合を修正
- **開始HEAD**：`f3d9193e5f3523544efb6612f0a0b4689d98a718`。mainのgame/webgl/index/style/visual/audio/ROADMAP、season-clouds/debug、直近コミット、Drive設計書末尾を再取得。15分枠の夜間ウサギ・ハトの草陰休息を維持。15分枠のPagesデプロイはworkflow `41292466047` successを新たに確認。
- **原因**：17:50修正で冬の低木(type2)を3D/2Dとも非描画にしたが、`inCover`は通年type2を潜伏扱いし、プレイヤーが冬の見えない草で隠れられ、NPCの逃走方向も見えない低木を高評価していた。夜間休息の季節判定（3～11月）は既に正しいため再実装しない。
- **今回の1機能**：`game.js`へ`visibleShrubCover`を追加。既存85秒DAY/365日カレンダーのゼロ始まり月から3～11月のみ低木の潜伏を許可し、12～2月は`inCover`と`chooseEscape`の隠れ判定を無効化。植物自体、衝突、生成、セーブ、春夏秋の草陰、雨宿り、夜の睡眠は変更しない。空に雲や白い三葉を戻さない。
- **変更／実コミット**：`neo-wild/game.js` `3f1d59c36ba86feb07d1490e37d534e3fcdba4b8`、`neo-wild/index.html` `b13362a3034bdd5f798a5d4eb8e624564a1dcfbe`（game.jsキャッシュ識別子`winter-visible-cover-v1`）、本ROADMAP。ほかのパス無変更。各ファイル更新前にmain HEAD再照合。
- **QA**：game/webgl3d/audio/season-clouds/debugのJS全文構文5件PASS。実`inCover`で1/2/3/6/9/11/12月の潜伏判定、非低木と遠方低木の排除、実`chooseEscape`で夏は草陰へ方向変更・冬は不可視草陰を無視、計10動的ケースPASS。SAVE_SCHEMA=2/restoreSnapshot/saveAuto/チェックポイント/橋迂回/雨宿り/夜の休息/4ボタン/HTML revの保持を静的確認。デプロイは`b13362a3`のPages workflow `41294748136`が確認時点でin_progress（成功未断定）。
- **未検証**：Android実機の冬白い塊ゼロ・潜伏HUD、縦横FPS、10～20分プレイ、旧セーブからの実ブラウザE2E。**進捗71/100（前回71、±0）**。
- **終了HEAD/引継ぎ**：本ROADMAP更新コミットを次回HEADとして照合。**次15分枠**：最新HEAD/Drive/本ログを確認し、Pages deploy successを確認。冬1月に隠れHUDが出ないこと、春夏秋に低木潜伏可能、夜のウサギ・ハトが移動→眠る→警戒覚醒すること、雨の建物避難/水際橋迂回を実機またはブラウザで確認。必要なら見える隠れ場所（建物陰等）を別の小機能として追加し、不可視低木は復活させない。

## 2026-11-01 18:16 JST｜15分枠・夜行性でない野生動物が草陰を探して眠る
- **開始HEAD**：`f5b64b47eb267a0ade14040b21d3cd8193f06db9`。GitHub mainの対象7ファイルとseason-clouds.js/debug-mode.js、直近8コミット、ROADMAP先頭、Google Drive「WILD RECLAIM｜完成仕様設計書」末尾を再取得。17:50手動修正で白い三葉模様が削除され、冬の低木は3D/2Dとも非表示、キャッシュ更新済みを確認。川/運河の実橋迂回、東京型昼夜光量・季節・天候、保存と7タップDEBUGはロールバックしない。
- **今回の1機能**：昼行性のウサギ・ハトが、春夏秋の乾いた夜に周囲300座標以内の実在する低木（type2）を探し、障害物と直線経路を確認して実移動し、潜伏可能な草陰で休息する生態AIを追加。植物探索は個体ごと4～5秒のキャッシュで制限し、プレイヤーから140座標以内の草陰は選ばない。休息は既存の`restNeed/restTime/restCooldown`・Zz表示・3Dのしゃがみ姿勢を流用し、プレイヤーや捕食者の接近・警戒・季節/天候変化で目を覚ます。夜行性のネズミは昼行性休息対象外。冬は白い塊除去により低木が不可視のため屋外の不可視潜伏場所へ誘導しない。雨天は従来の建物入口→屋内避難・休息を優先。ワープ/消滅、ボタン追加、保存スキーマ変更なし。
- **変更ファイルと実コミット**：`neo-wild/game.js` `c338ef437dd78488043db7d579a531f1035e3d7b`（nightRestSeason/followNightCoverと既存休息/AIループの最小差分）、`neo-wild/index.html` `55584ee5e7f496c233139d031a3b1c5ceef3d0b3`（game.js新rev）。書込直前にHEADを再照合して競合なし。neo-wild/以外は無変更。
- **QA**：新しい実関数を抽出し、春夏秋の夜ウサギ休息、昼は起きる、冬の不可視低木で眠らない、夜行性ネズミを眠らせない、プレイヤー接近時の休息禁止・警戒で覚醒、従来の雨天屋内休息、障害物のない草陰への実誘導、草陰がない/雨天/冬/プレイヤー直近の誘導禁止、AIループ統合の13項目PASS。最新mainから再取得したgame/webgl3d/audio/season-clouds/debug全文JS構文5件PASS。SAVE_SCHEMA=2、旧セーブ復元関数、チェックポイント3件、4操作ボタン、川の橋迂回、白い楕円模様の非再導入、キャッシュ識別子を確認PASS。既存の3D休息姿勢・2DのZzは再利用。
- **未検証**：実Androidの縦横/FPS、実ブラウザでの夜間10～20分AI移動・草陰到達と昼夜遷移、旧セーブ再開E2E。GitHubのコミット別workflow取得では今回の2コミットおよび前回のHTMLコミットにworkflow_runsが返らず、公開URLも外部アクセス不能。**mainへのコミットは成功、Pagesデプロイ成功・実URL反映は未確認**。既存Pages配信競合の解消は未断定。
- **進捗**：71/100（前回71、±0。実ブラウザ統合/Androidの未検証を考慮し据え置き）。**記録前HEAD**：`55584ee5e7f496c233139d031a3b1c5ceef3d0b3`。本ROADMAPコミットを終了HEADとして次回確認。
- **次45分枠**：最新HEAD/ROADMAP/Driveを再取得。最初にPagesのbuild/deploy成功とAndroid冬の白い塊ゼロを確認。夜のウサギ・ハトの草陰移動/睡眠→プレイヤー接近覚醒→狩り、雨の建物避難、夜の敵/獲物密度を10～20分プレイで回帰。実機確認不能なら実コードで経路/衝突・保存の動的試験を増やし、発見した1件だけを最小修正する。冬の不可視低木と潜伏判定の不一致は別途視認性を検討するが白い塊は絶対復活させない。

## 2026-11-01 17:50 JST｜手動最優先・白い3枚の花弁状オブジェクトの描画を完全停止
- **開始HEAD**：`c72a0d6993efd396df8ee3f542f7cbee6101f6de`。編集前にmainのneo-wild/game.js、webgl3d.js、index.html、style.css、visual.css、audio.js、ROADMAP.md、season-clouds.jsと直近コミット、Drive「WILD RECLAIM｜完成仕様設計書」末尾を再取得。直前45分枠の川/運河NPC橋経路修正とPages配信競合を確認し、ロールバックなし。
- **原因**：ユーザー実機スクリーンショットには画面各所で灰白色の楕円が3～4個まとまった不要な地表模様が多数表示。季節オーバーレイ`drawFoliage()`は3個の楕円を各低木に重ねる設計で、古い画面に残る症状と一致。前回の冬用茶色枝への置換だけでは解消できなかった。デザイン変更は白い塊そのものの廃止であり、別の塊へ置換しない。
- **今回の修正**：`season-clouds.js`の`drawFoliage`呼出しを全季節で停止（草木のゲーム本体は春夏秋に従来描画、地面を動く雲影/季節HUDは保持）。冬の低木type2は`webgl3d.js`でメッシュを描かず、2D退避`game.js`の`drawPlant`と`drawCoverForeground`でも冬だけ非描画。植物の存在座標・潜伏判定・当たり判定・セーブを変更しない。春夏秋の本来の植物描画は残す。scriptの`?rev=20261101-remove-white-clumps-v3`を3ファイルに適用し旧キャッシュ再利用を回避。
- **コミット**：季節上乗せの白い三葉の廃止`f838629014af90481e2e1d18a442a7ca1251bf1e`、冬3Dメッシュ非表示`7be5a04a1d0d02ddfe9a7a9e63d66d072dcd4f59`、冬2D・前景の非表示`1c97dfa47d3cff9ed4123eca4bd53e0fc8d908c5`、HTML版更新`2fe6c63192dabcf75f534652597e70cc479fbb0e`。本ROADMAPを引継ぎ。ほかのディレクトリ、GAS、ブログ、タスクは無変更。
- **確認したQA**：GitHub最新に再取得したgame/webgl3d/season-clouds/audio/debug全文JS構文5件PASS。季節上乗せ楕円の呼出し0回、地面の雲影は維持。WebGL冬のtype2植生メッシュ0／春夏秋は各9房PASS。Canvas2D冬の草・前景楕円0／夏は18個PASS。旧SAVE_SCHEMA=2、saveAuto、restoreSnapshot、チェックポイント3つ、NPCの橋/水際飲水、4操作ボタン、DEBUG、HTML新3 revの存在を静的確認。
- **未検証**：実Androidでの更新後画面、縦横・FPS、旧セーブの再開E2E、GitHub Pagesの当該SHA deploy success。公開URLへ直接アクセス試行は外部ネットワーク制約で不可。直前Pagesデプロイ競合が記録されているため、**mainコミット済み／Pages成功とは断定しない**。
- **進捗**：71/100（前回71、±0。実機品質・公開未検証のため据え置き）。**記録前HEAD**：`2fe6c63192dabcf75f534652597e70cc479fbb0e`。ROADMAP追加後のHEADを次回照合。
- **次15/45分枠の具体アクション**：開始時に最新HEADと本ログ、Driveを確認。GitHub Pagesのbuild/deploy実成功を検証し、実Androidの冬1月で白い三葉模様がゼロになったことを目視。春夏秋の自然な植生と冬の潜伏可視性を回帰、必要な場合は白い塊を増やさない枯れ草など別形状を小変更で検討。

## 2026-11-01 17:46 JST｜45分枠・Pages配信障害の追加引継ぎ
- **確認HEAD**：`133e4b9ad57a888c555066749938954d28270fa6`。今回のゲーム実装とHTMLはmainへ正常コミット済み。Pages workflow `41290090392` はbuild成功、deploy失敗。失敗ジョブログは「以前の`f68a7943aa34fb90a99c588226d44a77aae0c45e`のデプロイが進行中で新規配信不可」。失敗ジョブを1回再実行したが同じ理由で再失敗。**Pages配信成功・実URLへの反映は未確認**、完了済みとは報告しない。
- **変更**：このROADMAPの障害記録のみ。game.js/index.html・ほかのゲーム・旧セーブは追加変更なし。進捗71/100据え置き。
- **次回15分枠**：最新main HEADと直近Pages実行結果を確認。先行デプロイが解消したら該当HEADのPages再実行を検討。デプロイが詰まったままなら無理な再試行を繰り返さず、既存コードを巻き戻さず、橋経路の実ブラウザQAとAndroid確認へ引継ぎ。

## 2026/11/1 17:44:03 JST｜45分枠・野生NPCの川／運河の実橋迂回を追加
- **開始HEAD**：`f9d8d5738afea295e5c3c8a217e09ad9fce167dc`。直近6コミット、neo-wild/対象7ファイル＋season-clouds.js/debug-mode.js、ROADMAP先頭とDrive正本末尾を取得。17:32の冬の白い塊→茶色い枝の修正を確認し、15分枠の雲影世界座標同期・前45分枠の水際飲水を維持。ほかのゲーム/ディレクトリは無変更。
- **今回の1機能**：水路の反対岸に獲物・目的地があるNPCが直進して岸で停滞しないよう、実waterDepthと道路橋位置（川：roadsY、運河：roadsX）に沿った乾いた橋の手前・向こう岸の候補を選ぶ`wildlifeBridgeWaypoint`を`steerPursuit`へ統合。入口から橋への直線経路に障害物がある場合は従来のA*経路へフォールバック。橋上でも水中進入・ワープなし。獲物追跡・飲水・雨宿りが共有する操舵だけを拡張し、セーブ・4ボタン・8地区・四季・空の雲なし・冬の枯れ枝を保持。
- **変更ファイル／コミット**：`neo-wild/game.js` `c9dd3bd6d3ae89c1e162047983662537ea1edfeb`、`neo-wild/index.html` `f68a7943aa34fb90a99c588226d44a77aae0c45e`（game.jsキャッシュ識別子更新）、本ROADMAP。書き込み直前にmain HEAD・ファイルSHAを照合、旧版上書きなし。
- **QA**：game/webgl/audio/season-clouds/debug全文JS構文5件PASS。現行実関数waterDepth/collides/move/routeClear/steerPursuitを抽出した隔離シミュレーションで、川の両方向4例、運河の両方向＋別地点3例、陸上1例＝8ケースすべて目標40座標以内へ到達、水中侵入0回PASS。SAVE_SCHEMA=2、チェックポイント3件、tutorialSeen、東京型気候、水際飲水、地上雲影のみ、7タップDEBUG、4操作ボタン、HTML新キャッシュの維持PASS。
- **未検証**：実ブラウザでの10〜20分プレイ、実世界の建物がある場合のA*橋迂回、旧セーブ実再開E2E、Android縦横・実GPU/FPS、Pages最新SHAのデプロイ成功。実機QA完了までは**進捗71/100据え置き（前回71、±0）**。
- **記録前HEAD**：`f68a7943aa34fb90a99c588226d44a77aae0c45e`。本ROADMAPコミットが終了HEAD。**次15分枠**：最新HEAD/ROADMAP/Driveを再取得。実建物のある河川/運河のNPC橋経路を長時間プレイで検証し、行き止まり・経路の振動・Android負荷があれば最小差分で修正。冬の低木、空の雲なし、既存セーブ/水/4ボタンは絶対に巻き戻さない。

## 2026-11-01 17:32 JST｜手動修正・冬の白い塊を枯れ枝の低木へ
- **開始HEAD**：`f47128b64404b1b9371860394b526dd91eda96ba`。編集前にmainのgame/webgl/index/style/visual/audio/ROADMAPとseason-clouds、直近コミット、Google Drive正本末尾を再確認。ユーザーのAndroid実画像（DAY04・冬1月）では白い丸い塊が低木と認識できない。直接原因はWebGL冬の9個の淡色楕円葉メッシュと季節レイヤー上の冬の淡色楕円3枚重ね。
- **今回の1機能**：冬の植生の可読性を修正。WebGLの冬の低木を茶～枯れ木色の9本の幹・枝分かれと暗色根元に置換し、夕方の低照度でも見えるよう枝色を調整。季節オーバーレイの冬の白い楕円を廃止。Canvas2D退避時は旧緑葉の上に茶色い地表・枝を描いて冬の低木と判別できるようにする。春夏秋の既存葉、植物位置・当たり判定・潜伏の覆い半径、空に雲を描かない仕様、薄い地面雲影は維持。
- **変更**：`neo-wild/webgl3d.js`コミット`f524c88a`、枝の夕方視認性`7fd4ed2e`／`season-clouds.js`淡色オーバーレイ禁止`9339d683`、2D冬枝`38ef9eb7`／`index.html`両JSの読み込みキャッシュ更新`a899cbd6`。game.js/audio.js/操作/保存には変更なし。ロールバックなし。
- **試験**：最新mainのgame/webgl/audio/season-clouds/debug JS全文構文5件PASS。実WebGL植生関数から冬の枝27四角形＋暗色根元のみ、春夏秋の葉9房維持を検査PASS。季節レイヤーの模擬Canvas2D縦390x844／横844x390で冬の枝18ストロークを確認、WebGL利用時の冬の白いオーバーレイ描画0回を確認PASS。HTML新キャッシュ・4ボタン・SAVE_SCHEMA=2・3チェックポイント・復元/水際飲水/地上雲影の存在確認PASS。Android実機目視・FPS・旧セーブ再開E2E・GitHub Pages最新SHA配信成功は**未検証**。
- **進捗**：71/100据え置き（実機の見た目を未確認のため加点なし）。**記録前HEAD**：`7fd4ed2edad4cbbea2c75d87b63580bb6eedf762`。本ROADMAP書込のSHAは次回のHEAD照合で確認。
- **次15/45分枠**：まず最新HEADと本ログ、Driveを再取得。実AndroidのDAY04冬1月で以前の白い塊が茶色い枝に変わったか、47%/100%ズーム・夜間の視認性・Canvas2D退避と縦横HUDを検証。失敗時は植生だけを再調整し、保存・AI・水・操作・雲影を変更しない。

## 2026-11-01 17:13 JST｜15分枠・2D退避の雲影を実世界座標へ同期／停止中の雲影移動を修正
- **開始HEAD**：`b01d61630f5558e88a25ed3edef6bd4f846f85e6`。編集前にmain対象7ファイル＋`season-clouds.js`/`debug-mode.js`、直近12コミット、ROADMAP先頭、Drive正本末尾を再取得。直前45分枠の実水際飲水、既存四季・7タップDEBUG・「空の雲なし／地上の薄い雲影のみ」を確認し保持。
- **原因**：`season-clouds.js`のCanvas2D退避はカメラ座標`{x:0,y:0}`の仮想画面と実時間`performance.now`で影を計算。移動しても影が世界座標に固定されず、ガイド/一時停止中も2D雲影が流れ続ける。WebGLが失敗したフレームも季節フィルターの適用先が3Dキャンバスのままになる場合があった。
- **今回の1機能**：2D退避時に`game.js drawScene`から実カメラ、VIEW、植物、ゲーム内elapsed、天候、昼夜を`WildSeasonClouds.capture2D`へ渡す。影を実地面に固定し、プレイヤー移動・視点回転/ズームと連動、ガイド/停止中はゲーム時間とともに静止。WebGL描画成功時だけ3Dキャンバスを季節フィルター対象とし、描画失敗時は2Dキャンバスへ切替。空の雲モデルは追加しない。新しい保存項目・操作ボタン・UIなし。
- **実装コミット**：`season-clouds.js` `cd1bda9ef3f9d57ce4331f2e22264a29d9ec9b91`、`game.js` `19fdae1fe1ccf144aecacc75123ebeac49879152`、`index.html` `646563a15f30e5b0861848567e8033db43d06dae`（両JSの新キャッシュ識別子）。各書き込み直前にmain HEADと対象ファイルSHAを照合し、古い版上書きなし。変更はneo-wild/のみ。
- **QA**：mainから再取得したgame/webgl/audio/season-clouds/debug全文JS構文5件PASS。模擬DOM+Canvas2D/WebGLで縦390×844、横844×390、800×600の3画面を実行し、WebGL成功/失敗時の季節フィルター切替、実カメラ移動で地上影が動くこと、同じゲーム時間で一時停止時の影位置が不変なことを検証PASS。HTML ID重複なし、debug scriptと既存4ボタン・レスポンシブCSS保持。さらに実waterDepth/水域衝突/橋通行4ケース、旧SAVE_SCHEMA=2復元妥当性、チェックポイント3件、実saveAuto保存の計9動的回帰PASS。既存AI飲水・雨宿り・ミッション関数は変更なし、静的存在確認。
- **未検証**：実Androidの縦横画面・GPU/FPS、実ブラウザの10〜20分プレイ/本物の旧セーブ再開E2E、実機の雲影透明度と地面への重なり、当該SHAのGitHub Pages deployment success（公開URLの外部アクセスは今回確認できず）。**mainコミット済みだがPages配信成功は未断定**。
- **進捗**：71/100（前回71/100、±0。実機・実ブラウザE2E未完のため据え置き）。
- **終了HEAD**：`646563a15f30e5b0861848567e8033db43d06dae`から本ROADMAPコミットへ前進。**次回45分枠**：最新HEAD/ROADMAP/Drive再照合後、実Android/ブラウザで7タップDEBUG→季節/昼夜/雲影ON/OFF→Canvas2D退避の移動/停止→巣・旧セーブ/川・橋・飲水の回帰を確認。障害物で岸に到達できないNPCの橋迂回を次の1機能として検討。空の雲は絶対に再導入しない。

## 2026/11/01 16:42 JST｜45分枠・野生動物の実水際飲水を修正
- **開始HEAD**：`758477505ed116f516d86b2076d8bb5c2b5bb82b`。main対象7ファイル＋season-clouds/debug-mode、直近コミット、ROADMAP先頭、Drive正本末尾を照合。前枠の四季メッシュ・空の雲なし・薄い地上雲影・タイトル7タップデバッグを維持。
- **変更ファイル**：`neo-wild/game.js`、`neo-wild/index.html`、`neo-wild/ROADMAP.md`。実水面のriverAxis/canalAxisと橋判定を用い、旧探索地点の固定座標で水を飲む誤判定を撤去。川は左右、運河は上下の乾いた岸に移動してから飲水。橋上は水と誤認せず、道路から少し離れた岸を候補にする。水中侵入・ワープなし。game.jsのキャッシュrev更新。
- **QA**：game.js/webgl3d.js/audio.js/season-clouds.js/debug-mode.jsの全文JS構文5件PASS。実waterDepth・実drinkWildWaterを使った7ケース（川両岸、運河両岸、川/運河の橋周辺、内陸）で乾いた岸への歩行・飲水、内陸で飲水なしPASS。保存スキーマ2・4ボタン・チュートリアル・8地域・四季・雲影・7タップデバッグの参照維持を静的確認。
- **未確認**：Android実機/縦横/FPS・実ブラウザ長時間AI・本物の旧セーブ再開E2E・Pagesデプロイ。**進捗71/100据え置き**（実機未検証）。
- **実装コミットSHA／終了HEAD**：`6312a017550cb842b4f5197cb59e556546c9dc40`（本ログ確定時）。**次15分枠**：最新HEADを読み、橋をまたぐNPC経路と飲水/雨宿りの競合を実ブラウザで確認。障害物で岸に到達できない個体の経路を最小差分で改善。

## 2026-11-01 16:20 JST｜手動対応・7回タップ診断UIの読み込み復旧／雲影修正のキャッシュ更新
- **開始HEAD**：`960069bb5514ce5c6e78817036b39f897f10cc05`。mainの対象7ファイル、追加の`debug-mode.js`/`season-clouds.js`、直近コミット、ROADMAP先頭とDrive正本末尾を確認。並行する他枠の実装を再作成せず、既存成果を保持。
- **原因**：`debug-mode.js`は`8d42383abbeac6e107cb621fc4d434d42f1b09a6`、ゲーム内操作用`WildDebugBridge`は`960069bb5514ce5c6e78817036b39f897f10cc05`としてmainにあったが、`index.html`に診断UIのscript読み込みがなく、タイトルを7回タップしても利用できない状態だった。さらに直近`38984a75`の空の雲除去に対して季節JSの古いキャッシュ識別子が残っていた。
- **変更**：`neo-wild/index.html`のみ（コミット`ec9904003d3fee7a83fb090ed85e3a9dd3599f45`）。既存script順を維持したまま末尾へ`debug-mode.js?rev=20261101-seven-tap-v1`を追加。game.jsを`?rev=20261101-debug-bridge-v1`、季節雲レイヤーを`?rev=20261101-ground-shadows-only-v1`に変更。空の雲なし・地面の薄い雲影という最新指示を読み込みへ反映。
- **QA**：mainから再取得した`game.js`（191082字）、`debug-mode.js`（8773字）、`season-clouds.js`（7769字）のJS構文をV8でコンパイルし3件PASS。index.htmlのscript5件の順序、デバッグブリッジAPI、雲本体の描画削除、save schema2と既存操作の非変更を確認。実Android/実ブラウザでの7連打・描画/FPS・Pagesの当該コミット配信は**未検証**。
- **終了HEAD**：`ec9904003d3fee7a83fb090ed85e3a9dd3599f45`から本ROADMAP更新へ前進。**進捗71/100据え置き**（UI結線の復旧であり未検証分は加点しない）。
- **次回15/45分枠**：最新mainのHEADと本引継ぎを再確認。実Androidでタイトル7回タップ→DEBUGパネル表示→ゲーム開始後の時刻/天候/移動/回復/雲影ON/OFF→デバッグ解除を確認。問題時は`neo-wild/`のみ最小修正。季節3D植生と川・橋、旧保存、4ボタンの回帰維持。

## 2026-11-01 16:15 JST｜15分枠・3D植生メッシュの四季色を実装して公開
- **開始HEAD**：`8bab7a15afe189ed0f7663bc07f6cced19122d74`。開始時にmain対象7ファイル＋`season-clouds.js`・直近5コミット・ROADMAP先頭・Drive完成仕様設計書末尾を取得。既存の四季HUD/流れる雲/雲影の初期実装を確認し、二重実装やロールバックを回避。
- **変更ファイル**：`neo-wild/webgl3d.js`（`a73db4be85449b58a26bb253290daf8e1c510806`）、`neo-wild/index.html`（`407bfd8691a68c3d57524c9c4aad3241d9c4f374`）、本ROADMAP。ゲーム本体`game.js`、保存形式、AI、川・橋衝突、チュートリアル、操作4ボタン、他ディレクトリは無変更。
- **1機能の実装**：従来WebGL3Dの草・低木のメッシュ色が年中固定だったため、既存ゲームDAY=85秒×365日の暦から季節を求め、植生メッシュの頂点カラー自体を冬の枯れ色・春の若葉・夏の濃緑・秋の紅葉へ切替。低木9房・草1本の形状と当たり判定、潜伏用の草サイズは一切変えず、描画負荷増分は色選択のみ。従来の追加描画`season-clouds.js`（雲/影/HUD）も保持。HTMLの3D JSキャッシュを`?rev=20261101-seasonal-mesh-v1`へ更新。
- **QA**：WebGL3D全文JS構文PASS。季節境界10ケース、低木4季×9房・草/葦4季×2種・既存植物データ非変更PASS。さらに実`webgl3d.js`全文を模擬WebGLコンテキストで初期化・描画し、DAY 1/90/180/280/365でそれぞれ445動的三角形、4季のRGB頂点色差、DAY365=DAY1冬色、静的メッシュ再生成1回、描画5回すべてPASS。4つのscript読み込み順とキャッシュ識別子、縦横用CSSの存在、従来の雲・雲影モジュールの維持を確認。セーブ・AI・衝突はゲーム本体を変更していないため静的非変更確認のみ。
- **未検証/未完成**：Android実機の縦横表示・GPU/FPS、実端末での色味/雲影重なり、実ゲームを10〜20分遊ぶE2E、春の花びら/秋の落葉/冬の霜と積雪、季節による生息域・資源・動物行動。これらを完成済みとは扱わない。
- **次45分枠**：最新HEAD/ROADMAP/Driveを再取得し、まず四季の3D色・雲影の地表投影と前後関係を実ブラウザで点検。次の1機能は小さな季節別落葉・霜/春花の演出、又は雲影の実3D地面投影品質改善から未実装1つを選び、低負荷・セーブ互換・WebGL/2D退避を検証してmainへコミット。旧コードの上書きは禁止。
- **進捗**：71/100（前回70/100、＋1）。**終了HEAD**：本ROADMAP追記コミットのSHA。Pages公開成功はワークフローで実確認した場合のみ別途報告。

## 2026-11-01 16:08 JST｜手動緊急反映：四季の植生色・流れる雲と地面の雲影（初期段階）
- **開始HEAD**：`08099facc81b2e17cba2a8293e38d7ef5096d35b`。main現行の対象7ファイル、直近ROADMAP、Drive正本末尾を確認。以前のgame.js全文書き込みが安全性チェックでブロックされたため、今回game.js・旧セーブ・他ディレクトリは変更せず、独立する追加描画モジュールを作成して復旧した。
- **更新ファイルとコミット**：`neo-wild/season-clouds.js`新規 `7c62b2c6`、`index.html`読み込み追記 `c4837077`、Canvas2D/WebGL切替対応 `10251c76`、切替後も季節フィルター適用 `47fb7999`。現行mainに保存済み。
- **実装**：既存1DAY=85秒、365日カレンダーから冬12〜2月/春3〜5月/夏6〜8月/秋9〜11月の季節を算出、HUDに季節名と月を表示。WebGL描画引数から時刻・カメラ・VIEW・天候・植物を取得し、描画専用透明レイヤーに季節別の草木の彩り（春若葉・春色の花、夏濃緑、秋黄赤、冬枯れ色）、天気に応じて密度が変わる半透明の雲群、同座標の地上に動く雲影を描画。風で雲と影が移動し、夜・雷雨では影を減衰。ゲーム本体の衝突・AI・天候抽選・昼夜・旧SAVE_SCHEMA=2・3チェックポイント・既読ガイド・1秒自動保存には変更なし。3D/2D退避の両方で追加レイヤーを使用。
- **確認済みQA**：新モジュール全文JS構文PASS。実モジュールを模擬DOM/Canvas2D/3D描画状態で起動し、WebGL時は雲影1つ・季節の彩りと雲10図形、Canvas2D退避時も雲影3つ・雲3図形の描画を確認。季節の1月冬/3月春/6月夏/9月秋/12月冬、季節HUD、旧本体3 JSとHTML読み込み順、GitHub main更新を確認。最新`47fb7999`のPagesデプロイは記録時点in_progress（公開成功と未断定）。
- **未検証/未完成**：Android実機の縦横、実GPU/FPS、全8地域での見た目、長時間の雲描画、3Dの葉そのもののメッシュ色差（現状は追加描画＋軽度の景観フィルター）。本格的な樹種ごとの落葉/積雪・季節別生態AIは今後の段階。
- **進捗**：70/100（前回69/100、＋1）。**次15/45分枠**：開始HEAD・本ログ・Driveを確認し、実機の雲/雲影の動き・深度感/画面操作/HUD視認性を検査、低価格Androidでの負荷を測る。次は3D植生メッシュそのものの四季パレットと落葉演出を安全な最小差分で段階実装。旧セーブと水辺・食物連鎖・昼夜・天候を巻き戻さない。

## 2026-11-01 15:46 JST｜45分枠・昼夜の野生動物視認距離を照明と統合
- **開始HEAD**：`a49e54dd2b3077c858d62bc959241ca416fa7df5`。開始時にmainのneo-wild対象7ファイル、直近コミット7件、ROADMAP先頭・Drive正本末尾を再取得。直前の東京平年降水日カレンダー、2D/3D朝昼夕夜の色温度・光量差を維持し、二重実装なし。
- **原因**：NPCの`detectsPlayer`が旧式`Math.cos((elapsed%85)/85*2π)<-.45`を独立使用。正午から夕方の一部を夜扱いし、真夜中0時を昼扱いするため、描画が夜でも敵や獲物の視認距離が昼のままになる不一致があった。
- **実装**：`game.js`で既存`worldDaylight()`（朝昼夕夜と共通）からNPC視覚の距離倍率を連続計算。正午の視認距離が最長、朝・夕は短く、真夜中は獲物の視認距離を昼より短縮。野犬/アルファ等は獲物より夜間視力を高めるが、暗闇で無制限に見えることはない。雨・霧、潜伏、障害物による遮蔽、聴覚・嗅覚、近接発見の既存処理は保持。追加保存フィールド、ボタン、UI要素なし。既存昼夜照明・東京型雨カレンダー・8地区・水域・雨宿りを変更しない。
- **コミット**：`game.js` `c3329ef94f14f69025d5d7e92a4ed0691da800f8`、`index.html` `81e3191675311468c5409387017a5a20a392c67d`（game.jsの`?rev=20261101-wildlife-vision-v2`に更新）。両更新直前にmain HEADを再取得し競合なしを確認。ROADMAPはこの追記コミットが最終HEADとなる。
- **QA**：game.js/webgl3d.js/audio.js全文構文PASS。実`detectsPlayer`＋実`dayLightProfile`を抽出した隔離実行で、正午170mの獲物を視認・真夜中170mは非視認、7時/18時の減光、9時160mの視認、雨中170mの非視認、野犬の昼235m視認/夜235m非視認/夜165m視認、潜伏時の非視認、夜間でも騒音による発見と近距離発見、壁越しの非視認の12ケースPASS。旧SAVE_SCHEMA=2・1秒自動保存・3チェックポイント・雨宿り/飲水/水域衝突・ナビ・HUD/縦横CSSの存在と非変更を静的確認。
- **未検証**：Android実機の縦横・GPU/FPS、実ブラウザの長時間AI/セーブ再開E2E、実プレイでのNPC反応の体感。GitHub Pages配信成功は未確認なら公開済みと断定しない。進捗**69/100（前回68、＋1）**。
- **次回15分/45分枠**：最新HEAD・7ファイル・Drive正本・本ログを再取得。河川/運河の`drinkWildWater`が探索地点の`site.y±121`を水場と誤認しており、実際の`riverAxis(y)`/`canalAxis(x)`と一致しない疑いを最優先で実座標検証し、実際の岸に到達してからのみ飲水するよう小差分で修正。岸到達・橋・衝突・NPC経路・雨宿り・保存・2D/3D回帰必須。

## 2026-11-01｜東京の1991〜2020年平年降水日数に合わせた年間天気と、朝昼夕夜の明暗差
- **開始HEAD**：`f641f1f1a24e36e617c246aac2f72ae8bb81dab7`。編集前にGitHub mainの7対象ファイル、直近ROADMAPログ、Google Drive正本末尾を再取得。古い変更の上書き・ロールバックなし。ユーザーの新指示は「昼を最も明るく、朝・夕・夜は明確に別の明るさ」「雨が多すぎる。東京の1年の天気に準拠」。
- **公的データ**：気象庁東京観測所、1991〜2020年平年値、日降水量1mm以上の日数は年102.5日。月別1〜12月は4.5/5.2/9.2/9.5/10.1/11.6/10.5/7.9/11.0/10.5/7.4/5.2日。出典 https://www.data.jma.go.jp/stats/etrn/view/nml_sfc_ym.php?block_no=47662&day=&month=&prec_no=44&view=a1&year= 。これは東京型の気候参考値であり、架空都市の正式名称は変更しない。
- **実装**：`game.js`で以前の無作為な初期天気・高頻度の雨/雷雨遷移を廃止。ゲーム内既存の1DAY=85秒は維持し、年間365日を月別に区切った安定した疑似ランダム降水日カレンダーへ移行。同じセーブDAYでは同じ天気、1mm以上の日を月4〜12日程度とし、雨の日も当日の短い時間帯だけ降雨/まれに雷雨。晴れ・曇り・強風・霧を区別。旧セーブ復元時も現在の経過DAYから一貫して天候を計算。旧weatherTimer/nextWeatherフィールドとSAVE_SCHEMA=2、1秒自動保存・3チェックポイントは維持。
- **昼夜の表現**：`game.js`に朝5〜9時/昼9〜17時/夕17〜19時/夜19〜5時の連続補間した照明プロファイルを追加。正午12時の輝度1.16が最大、14時1.11、7時約0.51、17:30約0.545、21時0.12。2D退避画面には夜間の深い青い遮光、朝夕の暖色、正午の明るいスクリーン調整。WebGL `webgl3d.js`では同じプロファイルをuniform uTintで3Dオブジェクト全体に適用、空色も時刻で変更。静的3D地形のメッシュ再生成を増やさずGPUへの色uniform更新のみ。旧キャッシュ防止のため`index.html`でgame.jsとwebgl3d.js両者の?revを新識別子へ更新。
- **コミット**：`game.js` `affcaadc08384de9744c6ef9dac44546fcfb27a9`、`webgl3d.js` `095f21e4d9f4009a9a65103b021e047ccdad76f2`、`index.html` `7b0360e53757b32e2f9b2249ddfd333dc16e78bf`。開始・コミット直前に最新HEAD照合済み。変更はneo-wild/内のみ。2026-11-01 15時台JSTの該当コミットはGitHub Pages build/deploymentワークフローSUCCESSを確認。
- **QA**：game.js/webgl3d.js/audio.js全文JS構文PASS。年365日の12月別降水カレンダー生成検査：1〜12月で実際に5/5/9/10/10/11/11/8/11/11/8/5日の計104日（東京平年102.5日に近似、年ごとの丸めは変わる）。雨天の全フレーム時間比率は約7%、雨の日の外では天候は晴/曇/風/霧。正午>14時>朝7時>夜22時の輝度差、朝夕の暖色、旧セーブの気象復元・チュートリアル既読・チェックポイント維持PASS。WebGLのFakeGPUで正午・夕方・夜の実render3ケースPASS、太陽光色uniformと空色の変化確認。HTMLの両JSキャッシュ識別子確認。
- **未検証**：Android実機の昼夜可読性、実画面・WebGL GPU/FPS、実端末での長期季節表示、長時間セーブ→復元のブラウザE2E。各DAY=85秒と年間365日の気候は既存ゲーム内時間を使用するだけで、長期300年世界のYEAR進行比率を勝手に確定しない。進捗**68/100（前回67/100、＋1）**。
- **次アクション（15/45分両枠）**：まずmain最新HEAD、7ファイルと本ログとDrive設計書を再照合し競合・ロールバック防止。実Android縦横で朝昼夕夜の明暗とHUD可読性・雨が少なくなった体感を確認。空の色・動物の視認性、昼夜のNPC視界判定（現行は旧サイン関数）、季節の植生やNPC分布、先行する橋迂回・水際飲水の実プレイQAを順次1機能ずつ実装。ユーザーの最新指示優先。作業後も対応ログと次アクション必須。

## 2026-11-01｜川の進入・水中建物・水音・野生の食物連鎖修正（手動即時実行）
- **開始HEAD**：`67e6c1d19e0332fafb60bb4e97b99cc17f5a2186`（前回15分枠の最新）。編集前にmainのneo-wild対象7ファイル、直近ログ、Drive正本末尾を再取得。ロールバックなし。他フォルダ編集なし。
- **確認した原因**：川/運河のwaterDepthが移動速度を0.63/0.57倍にするだけで、陸上動物が水の中を通れた。建物生成addBlockは水域を判定していなかった。audio.jsに水流音がなかった。野犬の対NPC攻撃が最低12以上と強く、イノシシを小動物の捕食者として扱い、草食動物は有限のberriesしか食べられなかった。
- **実装**：`game.js`で水域への移動・衝突・直進/A*経路を禁止し、既存道路の乾いた橋は通行可。建物の矩形全体と川/運河を照合し水中への配置を排除。植物・小物の新規水中生成も抑止。旧セーブで水中にいた個体は陸地へ移行。川/運河からの距離と種類に応じた水音情報を音響へ渡す。`audio.js`で独立した合成水音を生成し、近いほど大きく、離れると無音・一時停止で減衰。野犬はウサギ/ネズミ/ハト/イノシシに弱い実HPダメージ（標準野犬4HP/回、クールダウンあり）、反撃ではなく逃走へ。イノシシの小動物捕食を解除し、草・低木の採食を導入。草食動物の定期採食は再生可能な植物を対象とし、潜伏用植物は消さない。既存死骸・雨宿り・キャラ4ボタン・8地域と旧SAVE_SCHEMA=2/3チェックポイントを維持。
- **変更とコミット**：`game.js` `078952d6f132d0f4bf80fff54770089fa92f11f0`（水・建物）、`audio.js` `58f462a4085c575cfbf5a41434b8fe5263c7071d`（水音）、`game.js` `1db0128ec444b71ba8af8de2b2a931fb8e6473a6`（野犬・草食/イノシシ）、`index.html` `ca078b94813632de5412a95fba123eaa1bfce50c`（game/audio ?rev更新）。正本Google Drive設計書にも新確定事項を追記済み。
- **QA**：game.js/webgl3d.js/audio.js全文構文PASS。川・運河の通常進入阻止、橋の通行、2地点の初期位置が陸上、水没建物判定、旧セーブ移行、弱攻撃、ウサギ/ネズミ/イノシシの実forageWildBerries関数による草食、1秒保存/旧スキーマ/チュートリアル保持など隔離試験22項目PASS。Fake WebAudioコンテキストで7音源生成、川/運河近接の音量変化・内陸無音・一時停止減衰PASS。
- **未確認**：Android実機・縦横・GPU/FPS、旧セーブ実ブラウザE2E、実端末音量、今回のGitHub Pagesデプロイ完了とブラウザキャッシュ。水音はWebAudioのため端末上で音を有効化する操作が必要。**進捗67/100（前回66、＋1）**。
- **次アクション（15分/45分共通）**：最新HEADと本ログを必ず読む。水辺での実プレイ・建物配置・河川橋経路・NPC飲水岸アクセス・野犬の弱噛みつき後の獲物逃走/死亡/死骸・草食の採食周期を検証。特にNPC直進時に川岸で停止して橋へ回れない場合、個体の経路切替を最小差分で修正する。先行するJSキャッシュとセーブ修正は巻き戻さない。作業後に再度対応ログと次アクションを残す。

## 2026-11-01 15:18 JST｜15分枠・水域の深さ・橋・動物の移動を一致（新機能）
- **開始HEAD**：`20dc9e0c573acd763a8173611bddb0129f0e176b`。開始時にneo-wild/対象7ファイル、直近コミット、ROADMAP先頭、Google Drive「完成仕様設計書」末尾を取得。45分枠が直前に公開した8地域の固有景観・連続河川/運河・昼夜描画を維持し、未実装の水際物理を選択。旧コードへのロールバックなし。
- **変更**：`game.js`の川/運河と同じ座標から0～1の水深を計算し、水辺から中心へ滑らかに増加。既存道路が川/運河を横断する位置は「橋」として水深0、移動速度100%に設定。プレイヤーは深水で通常移動速度63%、NPCは57%（両者とも岸際で連続変化）。ジャンプ/飛びつきの距離は変えず、以前の0.8倍の二重減速を撤去。NPC/目的地のA*経路計算に水深コストを追加し、橋や浅瀬を優先。動物が水中を移動する際は2DとWebGL3Dの両方に軽量な水しぶきの輪を表示（静止・空中・橋では非表示）。既存地図と水面の描画座標は維持。新しい操作ボタン・保存フィールドは増やさない。
- **コミット**：`game.js` `fa4ee656897d043da65f4f0bf218b1ec859b36ff`、`webgl3d.js` `eaf8bc331667687aefc4ac70bc4d019ce7dabd68`、`index.html` `e973f36f4eb68e46841ded70fa95c2574c6a4899`。キャッシュ識別子 `20261101-water-depth-bridge-v2`。このログ前HEAD `e973f36f4eb68e46841ded70fa95c2574c6a4899`。
- **QA**：game.js/webgl3d.js/audio.js全文構文、川/運河の深水・岸の勾配・両橋の水深0、巣周辺が乾燥、プレイヤー/野生動物の移動倍率、空中飛びつきの移動距離維持、A*水深コスト、3D/2Dの水紋、HTML両JSキャッシュ、SAVE_SCHEMA=2/自動保存/チェックポイント3件/既読チュートリアルガード、縦横対応CSS保持など**25項目PASS**。水中移動シミュレーション実測（10単位入力）：プレイヤー深水6.3・乾燥10・飛びつき10、NPC深水5.7・橋10。
- **未検証**：Android実機の縦横画面・GPU/FPS、実ブラウザでのセーブ→リロード→再開E2E、Pagesの最新コミット配信。川の流れの力、泳ぎ・溺水、動物の飲水行動と実際の岸の衝突、橋の立体交差はまだ未実装。A*の水深コストは適用したが直進行動の全AIが橋を選ぶ保証はない。
- **次回45分枠**：最新HEADと本ログを読み、現行の8地区・水域を保ったまま、**水辺の飲水行動/水深とAI経路の統合**または**昼夜の街灯・動物の行動差**の未実装1機能を選んで最小差分で公開。川・運河の水面と道路橋の描画、実際の通行の不一致があれば最優先修正。全対象回帰・HEAD競合照合・ROADMAP引継ぎ必須。**進捗66/100（前回65、+1）**。実機未検証につき大幅加点しない。

## 2026-11-01｜15分・45分共通引継ぎ：8地域固有景観・水路・昼夜の第1段階
- **今回の開始HEAD**：`99deb981f44e125be26290f2556f0d8d4d4b5496`。mainの7対象ファイル・既存ログ・Drive設計書を照合し、旧セーブと既存ゲーム進行は変更しない方針。
- **実装差分**：3D側`webgl3d.js`で全8地域の固有地面色と固有地物（封鎖区バリケード・駅跡線路・侵食区ツタ・動物園檻・河川敷葦・森林樹木・工業地帯配管/機械・運河桟橋）を分散生成。河川/運河を連続する低ポリ水面と岸に変更し、夜間の遮光差を拡大。2D側`game.js`にも対応する地面/地物/水面を描画、世界地図とミニマップで水域を表示し、水に踏み込むと移動速度0.8倍。時間帯を朝/昼/夕/夜で明記。HTMLのgame.js/webgl3d.js読み込みrevを更新して古いJSキャッシュを回避。
- **コミット**：3D `bca81e5e6bed6658791194191a79e3815a788974`、ゲーム/2D `a7e109b1ef2bb86680eef063b3d970e301378c9f`、HTML `e837ad0f1d4cd9e74b65d3183ddab0563124d8e8`。最終HEADは次枠開始時に再取得して確認。ロールバック・他ゲーム/ディレクトリ編集なし。
- **確認した試験**：ゲーム/3D/音声JS全文構文・旧SAVE_SCHEMA=2とチェックポイントキー・チュートリアル既読ガード・両JSキャッシュ識別子・2D/3D水路座標整合・2Dフォールバック描画関数・昼夜光量・6初期地点＋残り2エリアの3D生成・水路の見える位置の検査など隔離試験22項目PASS。
- **未検証/未完成**：Android実機と縦横表示、実FPS・GPU負荷、旧セーブでの長時間再開、Pagesの最新コミット配信成功。河川と運河は現時点では主に描画と浅瀬の減速のみ。水深、岸の物理・泳ぎ/溺水・NPC経路・水域との衝突一致、および全域の高品質な固有景観と生態の差別化は未完成。進捗65/100据え置き。
- **次アクション（15分/45分両枠）**：開始時に最新HEADと直前枠ログを確認して重複/競合を避ける。最優先で実3D/2Dの川と運河をプレイしている位置で見分けられるか、地形・通行・NPC・セーブを検証し、未完の水際物理/生活AIを小区域から1機能ずつ追加。昼夜の街灯・生態行動・画面色差も段階強化。実装前後のQA、コミット、ROADMAP引継ぎ必須。15分/45分の既存タスクは共に最新版追記済み。

## 2026-11-01 14:47 JST｜45分枠・完了済み生存目標の再表示を禁止（最優先修正）
- **開始HEAD**：`33d980bd602c6b676c902192e94859e994c2c82f`。mainのgame.js/webgl3d.js/index.html/style.css/visual.css/audio.js/ROADMAP.mdと直近コミット、Drive設計書末尾を再取得。15分枠の飲水AI（12d6885a）・直近のチュートリアル復元修正を確認し、重複やロールバックを回避。
- **変更ファイル**：`neo-wild/game.js`、`neo-wild/index.html`、`neo-wild/ROADMAP.md`。4段の初期チュートリアルを終えた後の生存目標（mission 4〜6）は自動ポップアップを開かず、HUD目標を維持。「ガイドを見る」の手動表示は維持。初期の説明（mission 0〜3）は未閲覧時のみ自動表示し、再開時は保存された既読状態を尊重。旧セーブで巣LV2なのにmission4、縄張り確保済みなのにmission5等の場合、restoreSnapshotで現在の進行状態に静かに補正し、即時保存。game.jsキャッシュ識別子を`20261101-silent-survival-v4`へ更新し、旧JSの再利用を抑止。1秒自動保存・旧SAVE_SCHEMA=2・3チェックポイント・8地区・4ボタンを保持。
- **QA**：実ゲームJSから抽出した復元8ケース、初期/生存目標・既読/未読・手動表示11ケース、全文JS構文、保存タイマー、スキーマ/3チェックポイント、GitHub mainへの反映再取得とHTMLキャッシュ識別子の静的検査 **PASS**。Android実機・縦横実画面・実ブラウザでの長時間継続・Pages配信成功は未検証。
- **実装コミット**：game.js `97c3ea1101d00047d56122ba7c5480c20f00f0c4`、index.html `69158ec00e55746caed781d42309fa315287f57c`。ログ書込前HEAD `69158ec00e55746caed781d42309fa315287f57c`。強制push・ロールバックなし。
- **未完了事項**：同一Androidブラウザで旧セーブから「続きから」→mission5（巣LV2）で説明が開かないことを実機E2E確認。キャッシュ更新直後の配信・実機描画も未確認。
- **次回15分枠の具体的アクション**：最新mainとこのログを照合。ゲーム再開時の説明抑止と古い保存の正規化を実機相当で回帰確認し、問題なければ生活AI/操作品質の未実装1機能を最小差分で追加。チュートリアルを再改変・ロールバックしない。**進捗65/100（前回65、バグ修正のため据え置き）**。

## 2026-11-01｜再開時チュートリアル再発の修正・キャッシュ対策（追加報告）
- **開始HEAD**：`0af8adaad760ecefeeb71d87845351953eb3f979`。mainの7対象ファイルと直近ログ、Drive設計書末尾を再確認。
- **原因**：前回の修正ではgame.jsのみ変更し、index.htmlの読み込みURLが旧`?rev=20261101-wild-drink1`のままだった。ブラウザが古いJSを再使用すると「続きから」で説明が再表示されうる。さらに旧セーブのtutorialSeenが空の場合、再開後の目標再通知で現在の説明が再度開く可能性があった。
- **修正**：index.htmlのJS読み込みを`?rev=20261101-resume-autosave-v3`に変更しキャッシュ分離。restoreSnapshotで到達済みmissionまでの全チュートリアルを自動表示済みとして復元し、再開後の再通知でも再表示しない（「目標を見る」からの手動確認は可能）。game.jsの1秒ごとの自動保存、達成時即時保存、tutorialSeenスナップショット保存、旧SAVE_SCHEMA=2、チェックポイント3件、他のゲームロジックは維持。
- **テスト**：game.js全文構文PASS、HTML旧新rev更新、旧セーブ（tutorialSeen欠落）mission 0/3/7・新セーブ（配列部分欠落）mission 6の4復元ケースPASS、実currentSnapshot/saveAuto関数のlocalStorageモックによるmission・tutorialSeen・位置の保存/復元PASS、1秒タイマー・復帰時の自動ポップアップ抑止の静的検査PASS。
- **実装コミット**：game.js `c160297f2ed6b98e3598eb0d4b633446fd1ee3a8`、index.html `77f1d29d169477800b4ab7ed222c14f1abc72d79`。強制push・ロールバックなし。対象外変更なし。
- **未検証**：Android実機、継続プレイ→リロード→再開の実ブラウザE2E、保存容量制限でlocalStorageに失敗する端末、Pages配信の利用端末キャッシュ。既存のブラウザ別・プライベートモード間のlocalStorageは同期しない。
- **次アクション**：同一ブラウザで新規→チュートリアル達成→リロード→続きからを実機検証し、旧キャッシュや保存容量エラーがあれば端末条件に応じて修正する。次の15分/45分タスクは最新HEADとこのログを読んでから作業する。

## 2026-11-01｜続きから再開時のチュートリアル再表示・自動保存改善
- **開始時確認**：最新game.jsでtutorialSeenが実行中のみのSetで、snapshotに未保存。restoreSnapshotがstart()で履歴を消し、announceObjective()が同じ説明を再表示することを確認。
- **実装**：snapshotにtutorialSeenを追加し、旧SAVE_SCHEMA=2の保存はmissionから完了済みの段階を推定。復元時に履歴を戻し、続きからの説明ポップアップを抑止。自動保存4秒→1秒、ミッション遷移時にも即時保存。セーブキーとスキーマは不変。
- **変更**：game.js。コミット e46410b3、修正追補 552ccf0b。ロールバックなし。
- **未検証**：Android実機、実ブラウザの長時間プレイ、Pages配信完了、保存容量不足時の端末挙動。
- **次アクション**：実ブラウザで新規開始→段階達成→再読込→続きから→ポップアップ非再表示を確認。保存容量エラー表示と他の保存トリガーを回帰試験。

## 2026-11-01 14:12:26 JST｜野生動物の水飲み行動（15分・45分引継ぎ）

- **開始HEAD**：`0d7e4c505fce851430ad794e6b83f5f98d3f4fca`。GitHub mainと前回45分枠ログ、Drive正本を照合。
- **変更ファイル**：`neo-wild/game.js`、`neo-wild/index.html`、`neo-wild/ROADMAP.md`。既存の河川敷・運河の岸に向かって動物が歩き、水を飲む。渇き・飲水間隔・警戒・捕食者回避・雨天避難優先・岸の衝突判定を追加。近距離に「水」表示。旧セーブは新フィールドを補完。SAVE_SCHEMA=2、チェックポイント3件、4ボタン、8地区は維持。
- **試験**：ゲームJS構文、WebGL/音源JS構文、飲水行動・雨天/捕食者/衝突/クールダウン等の隔離試験 **15項目PASS**。Android実機・ブラウザ長時間・GPU/FPS・Pagesデプロイ成功は未検証。
- **終了HEAD/コミットSHA**：実装・ROADMAP同時コミット `12d6885a60d27151caa4103647f0604106855e50`（main反映確認）。ロールバック・強制pushなし。
- **未完了**：実機で水辺到達率と3Dの頭部動作・FPSを確認。
- **次のアクション**：最新mainを再確認し、飲水・採餌・捕食AIの優先順位を実機相当で検証。次の生活AIを1機能改善。**進捗65/100（前回64、＋1）**。

## 2026-11-01 13:45 JST｜45分枠・野生捕食者の側面回り込み（1機能）

- **開始HEAD**：`c4bcce991e2e95a24c2b819042007f78b091154e`。15分枠の最新「獲物の急旋回フェイント」実装とDrive設計書末尾を確認。既存のプレイヤー追跡時の野犬回り込みは維持。
- **変更ファイル**：`neo-wild/game.js`、`neo-wild/index.html`（JSキャッシュ番号）、`neo-wild/ROADMAP.md`のみ。新規の`wildPreyInterceptPoint`を追加し、野犬・アルファが逃走中の野生獲物を追う場合だけ、移動方向の前方・左右側面を予測して回り込む。接近戦（115未満）・遠距離（235超）・障害物で両側面が塞がる場合は従来の直接追跡に戻す。両側候補に衝突・経路検査を行い、ワープなし。既存`flankSide`を使用し新セーブ項目を追加しない。飛びつき距離・4ボタン・8地区・生態AI・死骸/備蓄・旧セーブは変更しない。
- **試験**：JS構文3ファイル、HTML ID一意、側面予測・対象種制限・接近/遠距離/無警戒の従来追跡・片側/両側障害物・世界端・SAVE_SCHEMA=2/チェックポイント・4ボタン・既存AI・キャッシュの静的/隔離テスト **17項目PASS**。実Android縦横・実ブラウザ長時間・WebGL/GPU/FPS・Pagesデプロイ成功は未検証。
- **実装コミットSHA**：`105bdd33bd6d6c3be6ea8932d7dacfcbbd65d310`（main反映を確認）。ログ追記コミットは本項目を含む後続HEADを参照。強制push・旧版上書きなし。
- **未完了事項**：実機で側面回り込みの頻度、狩猟難易度、障害物とFPSを確認。
- **次回15分枠の具体的アクション**：最新main HEADを再取得してこの側面回り込みを確認し、獲物の逃走・フェイントとの実プレイ相性を検証。未実装の生活AI/衝突改善を1機能選び、最小差分で実装する。**進捗64/100（前回63、＋1・模擬QA）**。

## 2026-11-01｜獲物の急旋回フェイント（狩猟AI）

- **今回の1機能**：ウサギ・ネズミ・ハトがプレイヤーの追跡・飛びつき予兆、または野生捕食者から逃げるとき、確率で左右に急旋回「フェイント！」。従来の逃走・敵の緊急回避は保持。
- **実装**：game.jsにtryPreyFeint/advancePreyFeintを追加。ウサギ62・ネズミ40・ハト48ワールド単位を0.24秒で実移動。7単位以下の分割移動、経路/衝突チェック、途中障害物で停止、ワープ・無敵化なし。疲労消費、3.1〜4.5秒クールダウン、気絶・無警戒・疲労時は不発。近距離のみ短い「フェイント！」表示。NPC状態を既存SAVE_SCHEMA=2に含め、旧セーブ/3チェックポイントは新フィールドを復元時補完。4ボタン、8地区、巣/備蓄、雨宿り、食事、狩猟、既存3D/2Dを保持。index.htmlのgame.jsキャッシュ番号のみ更新。
- **QA**：最新main実関数を抽出した物理移動模擬と静的回帰 **29項目PASS**。攻撃予兆、野生捕食者、遮蔽、疲労、気絶、全経路閉塞、移動量、クールダウン、旧セーブ、4ボタン、チュートリアル、飛びつき距離、8地区、雨宿り、食事、チェックポイントを確認。game.js/webgl3d.js/audio.js全文JS構文PASS、HTML ID重複なし。**Android実機・実ブラウザ長時間プレイ・縦横実画面・GPU/FPS・Pagesデプロイ成功は未検証**。
- **進捗63/100（前回62、＋1）**。次工程はAndroid実機での発生頻度、追跡難易度、衝突、FPS検証。

## 2026-11-01｜雨天NPCの室内避難を入口経由の二段階移動に修正

- **今回の1機能**：雨・雷雨時に、獲物/敵NPCが建物の室内へ移動する際、従来は室内中央をいきなり目指して外壁に引っ掛かる場合があった。屋内の目的地に入口座標を付与し、**①入口前へ接近→②ドアの開口幅内から室内へ進入→③屋内の安全位置で待機**に変更。プレイヤーが建物に入って獲物を発見・狩猟できる既存の入口/当たり判定はそのまま。雨天のNPC個体を消去/ワープさせない。
- **実装**：neo-wild/game.jsのrainShelterPoint/followRainShelter/雨天AI分岐。NPC半径に応じてドアへの接近判定を調整。雨が止むか敵が緊急回避すると入口経路を破棄。目的地再評価（約3秒間隔）でも入口通過状態を維持し、行き戻りを防止。屋内到達時はm.shelteredを立てる。新しいNPC状態は既存のmobsスナップショットに含まれ、旧SAVE_SCHEMA=2の欠落フィールドは読み込み時に初期化。地区8/3チェックポイント/3D・2D/アクション4ボタンは変更なし。index.htmlのゲームJSキャッシュ番号更新。
- **QA**：実ゲームから関数を抽出した室内移動テスト12項目PASS（入口→室内、壁接触ゼロ、ワープなし、目的地再計算時の段階維持、旧セーブ/描画経路等）。NPC半径12/15/22/28/29の5パターンを追加検証し、全て壁衝突ゼロで屋内到達。JS全文構文PASS、HTML ID重複なし。実ゲーム全体のAndroid/WebGL実機操作・実雨天での長時間生態AI/FPS、Pagesデプロイ成功は別途未検証。
- **公開**：main game.jsコミット45f57760edfc1d0b5efcfe44413f1115e94aa2ee、index.htmlキャッシュ更新37c280c52aeaf919108ad9934b33be78ef8b1baf。URL https://techmew.github.io/neo-wild/ 。**進捗62/100（前回61、+1）**。次工程は実機の雨天で獲物・敵の室内移動と屋内狩猟を確認し、必要なら通路経路をさらに改善する。

## 2026-11-01｜達成演出が出ず、次のガイドが即表示される不具合を修正

- **原因**：旧実装はミッション完了後に次ガイドを即時開き、「TUTORIAL COMPLETE!」はそのガイドを閉じてから既存の2.6秒ミッション演出で表示する設計だった。達成直後に表示されず、ユーザーが見られないタイミングになっていた。
- **新しい順序**：ミッション0→1、1→2、2→3では達成直後に専用オーバーレイで「EXCELLENT!」を**780ミリ秒**表示。4つ目を達成する3→4では「TUTORIAL / COMPLETE!」を**1000ミリ秒**表示。その間ゲームモードをmilestoneにしてプレイヤー・NPC・時間・2D/WebGLの更新を停止。表示終了後にのみ次のコンパクトなチュートリアルを開く。生存目標4→5、5→6、6→7も同じ「EXCELLENT!」を表示する。ガイドを閉じるだけで達成演出は出ない。
- **二重表示・タイマー対策**：旧tutorialCompletePendingフラグと説明画面クローズ時の達成演出を完全撤去。既存の長い2.6秒中央ミッション告知には頼らず、専用DOM/CSSアニメーションで表示。自動終了時間はrequestAnimationFrame上のperformance.nowで監視し、ページ切り替えの先後を保証。端末回転・タブ復帰中は静止したゲームシーンを再描画できる。巣・備蓄・生存課題・SAVE_SCHEMA=2/3チェックポイント/4ボタンは維持。
- **回帰試験**：GitHub mainの変更済み関数（advanceMission/showMissionMilestone/finishMissionMilestone/openTutorial/loop）を抽出しDOMと時間を模擬、0→1→2→3→4の実行順・画面表示・780ms/1000ms・説明との非重複・一時停止・一回性・セーブ互換を**18件PASS**。JS全文構文PASS、HTML ID一意。Android実機でのCSS描画・縦横・WebGL/GPU/FPS、GitHub Pages最新デプロイは未検証。
- **実装範囲**：neo-wild/game.js, index.html, visual.css, ROADMAP.mdのみ。進捗**61/100（前回60、+1、実機未検証）**。次工程は実機での短い達成演出→次目標ガイドの表示順検証。

## 2026-11-01｜チュートリアル終了時の「TUTORIAL COMPLETE!」通知

- **実装**：4段の実際のチュートリアル最終目標（mission 3: 旧駅到達）を達成し、mission 4（巣への備蓄）へ遷移したときだけ、既存の中央ミッション演出を利用して「TUTORIAL / COMPLETE!」を表示する。説明ポップアップを閉じただけでは達成扱いにしない。次の生存目標の手動案内を閉じた後に一度だけ表示し、自動で約2.6秒後に消える。再びガイドを開いても表示しない。追加の画面・操作ボタン・説明は増やさない。
- **QA**：実コードの遷移分岐に基づく隔離試験10件PASS（未達成時なし、3→4のみ発火、次ガイドを閉じたあと1回、再表示なし、2.6秒で自動終了、JS構文/セーブ形式維持）。HTML ID一意、キャッシュ番号更新。Android実機・ブラウザ表示・Pagesデプロイは未検証。
- **変更範囲**：neo-wild/game.js、index.html、ROADMAP.mdのみ。旧セーブ・チェックポイント3件・2D/3D・食料庫・手動チュートリアル2ページ・4アクションボタンは維持。進捗**60/100（前回59、＋1）**。

## 2026-11-01｜チュートリアルを原則1ページ・最大2ページへ短縮、小型化

- **最新ユーザー指示**：説明が多すぎ、画面が大きすぎる。基本は現在の目標だけを1ページで要約し、必要な場合も2〜3ページ以内にする。
- **実装**：7ページ固定の長文説明を撤去。ページ1は実際のミッション0〜7に応じて変わる「今の目標」と操作・効果の2行だけ。ページ2は必要なときだけ見る4ボタンと備蓄の早見表。旧「何をする・なぜ・操作・どうなる」4節と冗長な補足を廃止。ミッション到達時の自動表示は常にページ1を開き、手動「戻る・次へ・閉じる」を維持。表示済み管理は2ページ番号ではなくミッション番号ごとに記録し、各新目標の案内が省略されないよう修正。
- **UI**：背景に停止したゲーム画面を表示する仕様を維持。中央ポップアップの通常上限幅390px、高さ最大43dvh/310px、スマホ縦最大39dvh/290px、横最大65dvh/幅430pxまで縮小。不要な見出しを取り除き、2つの短い説明を配置。
- **互換**：チュートリアル達成条件（4段＋生存3段）は維持。2D/WebGL背景一時停止と音声停止・再開、巣の食料庫、旧セーブ、SAVE_SCHEMA=2、チェックポイント3つ、操作4ボタン、8地区を維持。
- **QA**：JS全文構文、HTML ID重複、現目標/早見表の2ページ、0・4・6・7段での見出し更新、ページ境界、ミッション単位の表示済み管理、背景停止、縦横上限の静的・隔離実行を計13項目PASS。Android実機での縦横目視/スクロール、ブラウザ操作、Pages反映・FPSは未検証。
- **次工程**：Android実機の中央ポップアップ表示と操作確認、背景の見える範囲と説明の読みやすさを調整。**進捗59/100（前回58、+1）**。

## 2026-11-01｜チュートリアルを背景ゲーム表示付きポップアップへ変更（最優先・表示品質）
- **仕様**：背景は実際のゲーム画面を見せたまま、中央の少し小さめのチュートリアルポップアップを表示する。背面の遮光を90%から38%へ減らし、背景ぼかしを撤廃。縦は最大65%画面高、横は最大82%画面高とし、ゲーム風景が上下に残る。説明欄だけ縦スクロールし、ページ送り・戻る・閉じるを常時操作できる。チュートリアル7ページ・内容・達成条件・4アクションボタンは変更なし。
- **真の一時停止**：案内中の更新(update)は元々停止していたが、毎フレームの2D/WebGL描画は続いていた。ポップアップを開いたときに背景ゲームを1回描画して固定し、閉じるまで時間・NPC・アニメーション・雨などの更新と2D/WebGLの再描画を止める。CSSアニメーションも停止。音響はガイド中0へフェードし、閉じるとプレイ用ミックスへ復帰。閉じると同じ座標・時刻から再開。デバイス回転とタブ復帰ではフリーズ状態のまま1フレームだけ描画して背景を更新する。
- **変更**：neo-wild/game.js、visual.css、audio.js、index.htmlのCSS/JSキャッシュ番号を更新。既存食料庫、セーブ形式SAVE_SCHEMA=2、チェックポイント3件、巣/備蓄、4ボタン、8地域、2D/3Dコードは保持。
- **QA**：ゲームJS/音声JS構文PASS、HTML固有ID確認。実コードのloop関数を切り出した模擬試験で「案内開始時に背景1フレーム描画」「次フレーム以降は描画/更新なし」「ゲーム時間一定」「閉じたら更新/描画再開」「再表示でも停止」の5ケースPASS。CSS透明度、縦横ポップアップ寸法、ページ送り維持、音声停止、セーブ互換など計10項目PASS。回転/タブ復帰時の再描画分岐はコード/構文確認。**Android実機の縦横/ポップアップ内スクロールとGPU/FPS、実WebGLのフリーズ表示、Pagesデプロイ完了は未検証**。
- **次工程**：Android実機で上下にゲーム背景が見えるか、スクロールと操作、停止中の動物・空腹・天候・BGM、回転後の描画維持を確認。進捗 **58/100（前回57、+1・実機未検証）**。

## 2026-11-01 11時台｜備蓄消失・食事不能の根本修正＋手動7ページチュートリアル（実装）

- **確認した原因**：従来の巣LV2強化は備蓄60を直接差し引いていた。巣での空腹時△は備蓄を種類指定なしに自動消費し、肉・食草の内訳は単一denStash数値へ合算されていた。強化処理からcheckMission()が呼ばれていなかったため、チュートリアル進行が次フレームの定期チェック頼みだった。
- **食料庫の実装**：denStores={meat,berries,legacy}を備蓄ポイント単位で管理し、肉・食草を別々に永続保存。旧単一備蓄はlegacyとして保全し「以前の備蓄」から後で食べられる。旧SAVE_SCHEMA=2のスナップショット・チェックポイント3件はdenStoresがない場合にdenStashをlegacyへ移行。従来のdenStashは合計値としてHUD/巣の容量/チュートリアルの条件に維持。肉24量→36pt、食草19量→11ptの換算を保持。肉は1食18ptで満腹+18/HP+6、食草は7ptで満腹+7/HP+1、旧備蓄は12ptで満腹+12/HP+3（満腹とHPは最大値で止まる）。
- **備蓄の用途**：巣のLV2/3強化は備蓄量を解放条件とし、**強化時に備蓄を減らさない**。巣で食料を持っていれば△短押し/長押しで預け、手ぶらで△短押しすると食料庫を開く。肉・食草・旧備蓄を個別に選択した場合のみ消費。巣の外でもHUDの食料庫ボタンから残量を閲覧できるが、食事は巣の中に限定。備蓄の誤消費を停止し、強化時にcheckMission()/saveAuto()を呼ぶ。
- **手動チュートリアル**：チュートリアル4ページ＋生存目標3ページの計7ページ。大きなダイアログに「何をする／なぜする／操作方法／どうなる」を表示。戻る/次へ/閉じるで操作、ページを送ってもゲームのミッションは進まない。各新目標で自動表示するが**勝手に閉じず**、閉じるまでゲーム更新を停止。HUDの「ガイドを見る」でいつでも閲覧・ページ戻しが可能。既存の約2.6秒中央告知は自由探索時のみ残す。キーボード←→/Enter/Escapeでも操作可能。
- **互換と制限**：既存4アクションボタン、セーブ/チェックポイント3件、旧carry、死骸/骨、8地区、6探索地点、天候/生態AI、2D/3D描画コードを保持。変更はneo-wild/game.js、index.html、visual.cssのみ。WebGL3D/音源/style.cssは変更なし。
- **試験**：ゲームJS全文・webgl3d.js・audio.js構文PASS、HTML 131 ID一意、4ボタン/2ダイアログ存在、旧セーブ型/AI/地図/キャッシュ更新を静的検証。備蓄型の移行/上限、肉+36/食草+11、LV2条件61到達、強化後61維持＋ミッション進行、巣の食料庫表示、選択式の肉・食草・旧備蓄の消費、巣外で食事不可の隔離関数試験12/12 PASS。手動ガイド7ページ/手動ページ送り・戻し・境界・閉じる・再閲覧・新目標表示・自由探索の旧告知の隔離関数試験11/11 PASS。
- **未検証**：Android実機縦横画面、実ブラウザでの操作・セーブ再読込・UIスクロール、WebGL/GPU/FPS、GitHub Pagesのデプロイ成功。GitHub mainへのコミットは完了、Pages反映の実証はできていない。
- **次工程**：Android実機で巣内/巣外の△長短・食料庫の操作・ガイドの縦横表示を検証し、必要ならボタン位置・食事の回復バランスを調整。**進捗57/100（前回56、＋1）**。最終コミット（HTML・操作説明更新）1eed127436d9fcc1fb08ec2cf45976e0d548569e（ゲームJSのLV3条件表示修正692bbfd0d71b40b0ea5b29df40ea29e197c9c474）。

## 2026-11-01 10時台｜実機スクリーンショット指摘：備蓄進行・食草と肉の価値・目的地の発光抑制（修正）

- **根本対処**：巣の中で食料を運搬中、△長押しが「置く」を優先していたため、巣内の△短押し・長押しのどちらでも備蓄する。巣の判定には16単位の許容を加える。生存目標1/3の期間中は、空腹時△短押しによる備蓄の意図しない消費を禁止。60備蓄到達で巣LV2の強化を優先し、その成功で従来のmission=5へ進む。巣以外での長押しによる設置は維持。
- **食料の種類とバランス**：ゲーム内の既存 berries は旧SAVE_SCHEMA=2・NPC採餌処理の互換のため内部名を維持。表示は「食草」。食草12消費で満腹約7、HP約1、巣換算0.6倍（19採取で備蓄11）。肉12消費で満腹18、HP6、巣換算1.5倍（24採取で備蓄36）。食草と肉の地上の食べ残し、死骸からの肉運搬、旧carry復元を保持。
- **備蓄HUD**：常時「備蓄 N / 60（LV2まで）」とゲージを表示。巣LV2以降は次の巣強化に必要な値へ切り替え。残量と案内に同じdenStashを使用。200は巣LV1の容量であり、LV2への必要量60と混同させない。実際の食草を指すナビゲーションは「食草」と表示。操作案内は巣での備蓄と外での食事・置くを区別。
- **発光抑制**：目標の光柱・光輪・光ぼかしの範囲/透明度を大幅に減らし、加算的なスクリーン合成を通常合成へ変更。建物入口の過剰な発光と画面上の《方向案内のグローも弱めた。目標マーカー自体は保持。
- **試験**：game.js全文JS構文PASS、HTML ID重複なし、既存4ボタンとSAVE_SCHEMA=2/チェックポイント3件/旧carry処理残存を確認。実行関数を抽出して巣での長短預け・肉36/食草11・60到達・巣LV2・生存目標遷移・誤消費防止・食べた場合の回復差・旧berries拾得・備蓄上限と残量など12/12 PASS。これは隔離した模擬実行であり、ブラウザ全体のタッチ操作・実端末・WebGL/GPU/FPS・縦横画面目視・Pages配信確認とは異なる。
- **ファイル範囲**：neo-wild/game.js, index.html, visual.css, ROADMAP.mdのみ。style.css, webgl3d.js, audio.jsは変更なし。キャッシュ更新はindex.htmlのgame.js/visual.cssに反映。
- **次工程**：実Androidで巣の円内への誘導・長短タップ・HUDバー・目標光の強さ・3Dの食草描画を検証し、必要なら操作領域/補給UXを再調整。進捗 **56/100（前回55、+1、模擬QA）**。GitHub Pages成功は実証後に報告する。

## 2026-11-01 10:15｜小動物の実地採餌AI（1機能）

- **実装**：ネズミ・ウサギ・ハトが空腹度に応じて既存の木の実を実座標で探し、障害物迂回で接近し、近距離で5ずつ食べる。食料は他個体/プレイヤーと共通のcarcasses配列から減り、尽きた場合だけ削除。食事時に短い「食」状態と「食事」表示。敵接近・プレイヤー発見・逃走・壁越しは採餌中止。雨天屋外は雨宿り優先、室内なら採餌可能。ボタン追加・瞬間移動・生存個体の消去なし。
- **互換**：NPCのforageNeed/forageCooldown/foragePoseを既存mobs配列へ保存し、旧セーブで欠ける値は復元時・AI更新時に補完。SAVE_SCHEMA=2、チェックポイント3件、4ボタン、捕食者の死骸食事、45秒骨、雨宿り、8地区・6地点を保持。
- **試験**：game.js全文JS構文PASS。採餌関数の模擬実行と静的回帰 24/24 PASS（移動、複数回食事、枯渇、発見、逃走、捕食者、雨天/屋内、旧データ、壁、操作、保存、3D/2D等）。実ブラウザ長時間進行、Android縦横目視・GPU/FPSは未検証。
- **次工程**：採餌時の警戒と捕食者との食料競合、実機で屋内生活行動を検証。**進捗55/100（前回54、＋1）**。Pages成功はActionsで確認後に報告。

## 2026-11-01 09:15｜死骸から肉片を運搬・食べる・置く・拾う（1機能）

- **実装**：死骸から最大24の肉片だけをくわえ、動物の死骸は現地に残す。運搬中は△短押し/Eで12ずつ食べ、△長押し/Gで置き、置いた肉は△短押しで12ずつ食べるか長押しで拾い直す。巣で△短押しは従来の備蓄、Gは巣でも置く操作。空中・屋上では食事と設置を禁止。2Dの赤い肉片とWebGL3Dの口元に追従する立体肉片を実装し、旧3D平面オーバーレイを撤去。運搬中のHUD案内とG/Eキー説明を更新。PS式4ボタンは増やさない。
- **互換**：旧P.carry.type=corpse/meat/berriesはロード時にmeat/berriesへ正規化。SAVE_SCHEMA=2、チェックポイント3件、死骸→骨45秒、狩猟、雨宿り、8地区・6探索地点を維持。置いた食料は従来carcasses配列に保存。
- **検証**：game.js/WebGL JS全文構文PASS。死骸30→肉24＋死骸6、手持ち12ずつ食事、地上に置く→地面で食事/拾い直し、巣で備蓄、空中置き禁止、旧carry互換の模擬実行11/11 PASS。HTML ID一意性、4操作ボタン、キャッシュ更新PASS。**実Android/GPU/FPS、実ブラウザでの3D視認性と縦横の目視、長時間ゲーム進行は未検証**。
- **コミット**：game.js `8e57c9948e89310d7d76382a6a641947da2c27ce`＋G操作修正 `f1fb5fb3eb57ce234cfd568e30bde46fc9b381d3`、webgl3d.js `8b38d92a58903ef16ad5b533967a976706b8be3d`、index.html `4dbb2dd6d7668c1fa0413e7347c4c224f9aed871`。
- **次工程**：実Androidで肉モデル/HUD視認性を検証、NPC生活AIと落とした食料の競合処理を改善。**進捗54/100（前回53、＋1）**。Pages成功はActionsで確認後にのみ報告。

## 2026-11-01 09時台｜死骸と骨の視認性修正（1機能）

- **実装**：死骸は毛色・横倒しの大きな胴・頭・四肢・耳・尾を持ち、残量がある限り骨を露出しない。食べ尽くして骨化した後は白い背骨・肋骨・頭骨に切り替える。2Dと3D双方、小動物の最低描画サイズ、近距離の「死骸」「骨」日本語ラベル（最大5件）を追加。骨45秒消滅、旧セーブ、4ボタン、屋内、雨宿り、ナビは変更なし。
- **試験**：JS全文構文、2D/3Dで5種×死骸・骨の各10ケース、HTML ID一意性、SAVE_SCHEMA=2と既存AI・衝突・操作コード不変を確認。Android実機・GPU/FPS・実ブラウザ視認性は未検証。
- **次工程**：肉片の口元3Dモデル、運搬中の△短押し食事・△長押し置く・巣で預ける、旧carryデータ互換。
- **進捗53/100（前回52、＋1）**。PagesはActions成功を確認して判定。

## 2026-11-01｜野生の捕食者が死骸を食べる生態AI（フェーズB／1機能）

- **実装**：野犬・イノシシ・アルファが、警戒・戦闘・逃走・攻撃動作中ではないとき、近隣290単位以内の死骸または旧セーブ形式の肉を探し、実座標を移動して食べるようにした。既存の `steerPursuit()` のA*迂回経路を使うため壁を通過して食べない。生きた獲物が近ければ狩猟優先。プレイヤーを察知・至近距離・敵対した場合は食事行動を中止し、従来の攻撃・回避行動へ復帰。雨天の雨宿りより、生存のための食事を優先する。草食の小動物には死骸の摂食を実装していない。
- **資源と表示**：NPC食事は2秒弱の間隔で食料量を少しずつ消費し、食べると体力が上限まで少量回復する。死骸は枯渇すると既存の骨へ変わり、残量と経過時間も以前の2D/3D描画へ反映。旧保存の `meat` アイテムも食べられる。近景では短い「死骸を食べる」ポップアップと個体の「食」アイコンで状態を表示。死骸を複製・即消去・ワープさせない。新たな操作ボタンなし。旧セーブ形式 `SAVE_SCHEMA=2`、autosave v2、チェックポイント3件、既存チュートリアルを維持。新しい個体ごとの空腹・食事クールダウン・摂食表示は保存可能で、旧保存に存在しなければ最初のAI更新で初期値に復元する。
- **検証**：game.js / webgl3d.js / audio.js全文JS構文、HTML ID一意性、4操作ボタン/旧セーブキー/チュートリアル/ナビUIの保持PASS。現行ソースの摂食関数を抜き出して野犬・イノシシ・アルファ×縦390×844/横844×390/PC1280×720の9条件で実座標移動・複数回食事・骨化・体力回復PASS（骨化4.8～6.9秒の模擬時間）。旧meat摂食・食べ切りと体力回復、草食不可、プレイヤーに発見された時／近距離／警戒／攻撃予兆／遮蔽された壁の向こう／近くに生きた獲物がある場合の摂食抑止、旧mob状態フィールド欠落の初期化、JSONシリアライズPASS。実ブラウザ長時間操作とAndroid実機・GPU/FPS・雨天複数個体の負荷は未検証。
- **変更**：`game.js`内に`scavengeWildFood()`を追加し既存AI行動選択・雨宿り優先判定・描画状態に統合。`index.html`のビルド表示とgame.jsのrevクエリを`20261101-SCAVENGE1`に変更。変更対象は`neo-wild/`内に限定。
- **次工程**：肉を口でくわえる3D骨格アニメーション、死骸をめぐる動物同士の奪い合い、動物の採餌と子育て。オンラインは認証・実サーバー・同期が実装されるまで未実装扱いのまま。**進捗52/100（前回51、+1）**。Pages成功確認までは公開済みと断定しない。

## 2026-11-01 08時台｜死骸→食べ残し→骨、種族別の巣、備蓄チュートリアル（ユーザー実指示）

- **死亡した動物の姿**：player killと野生捕食双方で `corpse` を生成。動物種・体格・初期食料量を保持し、食べるたび最大12だけ減少。食べ尽くすか時間が過ぎれば `bones` へ変わり、約150ゲーム秒で骨も風化・消失。骨は食事・運搬・食料ナビ対象から除外。旧セーブに保存された `meat` は引き続き食べられる。野生捕食AIが他の死骸を食べる生活動作は未完成。
- **見た目**：2D・3Dとも倒れた種別の色・輪郭を残し、食べるほど骨格が露出し、骨だけが残る段階描画へ変更。2D・3Dに猫・狐・狼で異なる枯葉・草・枝・簡易囲いの寝床を巣中心へ描画。巣LVと備蓄によって素材/備蓄の見た目も変化。運搬中の食料は2Dでは口元、3Dモードでは画面オーバーレイの口元位置で可視化（完全な3Dモデル運搬ポーズは未完成）。
- **備蓄チュートリアル**：既存の4章チュートリアル/生存目標3段を変えず、生存目標1/3に「①食料へ移動して△約0.6秒長押しで運ぶ → ②巣に戻って△短押しで預ける → ③備蓄60で巣の中から△長押しでLV2強化」の3状態ガイドを追加。上部ミッション本文、黄色目的地、ナビの短い目標名、持ち運び通知を状態に合わせて変更。食料がない場合は獲物へ案内。新たな操作ボタンは追加せず、段階は既存P.carry/denStash/missionから再計算するため旧セーブも復帰可能。
- **確認**：game.js / webgl3d.js / audio.jsの全文JS構文PASS。3画面プロファイル(390×844/844×390/1280×720)×猫/狐/狼の2D寝床・死骸・骨・運搬の模擬描画9件PASS。3画面×食品4種と巣3種の3D有限数値15件PASS。運搬/備蓄チュートリアル5状態、死骸→食べ残し→骨と旧肉/木の実互換PASS。HTML ID重複なし、4ボタン/セーブキー/SCHEMA2不変、CSS縦横対応確認。**実Android端末/タッチ/視認性/GPU/FPS/長時間プレイ未検証**。ゲーム内全手順の本物のブラウザ操作試験は未実施。
- **将来のオンライン方針（ユーザー確定）**：単独NPC生態系と世代継承を先に成立させ、その後に認証、サーバー権威、同期・競合処理、不正防止、通信切断/再開を備えた協力PvEを実装する。群れ、巣、備蓄、世界変化を他プレイヤーと共有する。PvPはさらに後段で検討。**現時点では実オンライン未実装**。Google Drive正本へ今回の確定方針を追記済み。
- **次工程**：野生動物も食べ残しを食べる生態AI、口にくわえて歩く3D骨格動作、巣に現物の備蓄や子育て表示、食べ残しの置き直し/環境風化の細分化。進捗**51/100（前回50、＋1）**。デプロイ完了はActionsで個別確認。

## 2026-11-01 08:15｜雨天の屋内野生動物・睡眠／覚醒AI（フェーズB／1機能）

- **実装**：既存2棟の実際に入れる屋内で、雨・雷雨中に安全を確保した動物が疲労値に応じて伏せて眠り、5〜9秒程度の休息後に起きる自律睡眠AIを追加。個体ごとの疲労値・睡眠時間・再休息クールダウンを既存mobs個体に持たせ、保存と再開で引き継ぐ。移動・狩猟・敵の接近・プレイヤーの発見／攻撃・天候回復で即座に起床し、通常の追跡・逃走AIへ復帰。睡眠中は速度0で既存の実座標に留まり、ワープ／消去／複製は行わない。近景個体だけ詳細AIを更新し、遠方個体の保持は従来どおり。
- **描画と操作**：眠っている動物を2Dで低い伏せ姿勢、3Dで胴・四肢の接地を低くした休息姿勢として描き、上部に小さな「Zz」を表示。既存の屋内屋根切り欠き・青い建物入口と黄色いミッション目標を維持。プレイヤーのPS式4ボタン、狩猟ヒット判定、入口・壁・家具の当たり判定は変更しない。
- **保存互換**：SAVE_SCHEMA=2／autosave-v2／チェックポイント3件を変更せず、旧セーブに存在しないrestNeed/restTime/restCooldownを安全に補完。保存に異常な休息値がある場合は有限値・許容範囲に正規化。既存8地域、6探索地点、巣、縄張り、野鳥の雨宿り、敵の緊急回避、飛びつき距離70%を維持。
- **検証**：game.js・webgl3d.js・audio.jsのJS全文構文PASS。猫・狐・狼に対応する既存動物サイズを含む屋内2棟の入口入退室と壁通過不可8/8 PASS。ネズミ／ウサギ／野犬／イノシシ×雨／雷雨の睡眠→保存可能→覚醒→晴天で休息停止8/8 PASS。3D動物6種×睡眠／通常のメッシュ座標有限性12/12 PASS。HTML ID重複なし、4操作ボタン、再開・旧セーブキー、WebGL/2Dの表示分岐、資産キャッシュ更新PASS。**Android実機／GPU/FPS／長時間プレイ／実ブラウザでの3D・2Dの視覚品質は未検証**。
- **残課題**：屋内の採餌・睡眠場所の移動、室内生活の時間帯、遠方個体の睡眠・採餌集約処理。小雨・豪雨の雨量段階と架空都市移行、永続的地形変化も未完成。次工程は室内の食料を実際に探して食べる行動（獲物・食料を消去せず数量減算）とプレイヤーの狩猟との競合調整。
- **進捗50/100（前回49、＋1）**。game.jsコミット `59f2749b1fe35147eda1d0f73a601a270244e53f`、webgl3d.js `dec59c2d80910534c217948ec5d6130eeffd2593`、index.html `32141057c4d41c9ee782e7e6676f0e072d7d1439`。ビルド `20261101-INDOORSLEEP1`。Pages配信はActions成功を確認してから通知。

## 2026-11-01 08時台｜黄色の目標光と屋内避難所入口の誤案内修正（実画面指摘対応）

- **ユーザー実機画像で確認した問題**：黄色い発光リングのすぐ近くで「屋内避難所：光る入口から、そのまま中へ進めます」と表示され、黄色リングが入口に見える。しかし黄色リングは `getObjective()` から描画したミッション目標（食料・獲物・茂み・巣など）で、建物入口は2棟の北側外壁の幅110の開口部に存在する。誤案内は旧 `syncHUD()` が「入口から290単位以内」だけで同文を出していたことが原因。さらに「目的地」という汎用ラベルが実際の目標の種類を隠していた。
- **実コード修正**：game.jsでミッション段階に応じ黄色リングと上部ナビに「食料／獲物／潜伏する茂み／探索地点／巣／縄張り標識」を表示。2棟の実際の北側入口座標を `shelterEntrance()` から算出し、近距離255単位以内のみ青色の「建物入口」ビーコン（画面外では「入口方向」）を描画。WebGLとCanvas2Dの共通オーバーレイで描画し、黄色のミッション目標と明確に区別。避難所の案内は入口から112単位以内でのみ出し、晴れ・曇りでは「青い『建物入口』から歩いて入れる」、雨・雷雨では「雨宿りできる」と表示。いずれも「操作ボタン不要」。屋内では案内を消す。入口・壁・家具の物理判定やボタン入力は変更しない。
- **表示の修正**：index.htmlの間違った「光る入口から」の初期文言を除去。ナビ欄に目標名を表示する `nav-hud-label` を新設。タイトルのビルド表示 `20261101-DOORGUIDE1` と `game.js?rev=20261101-doorguide1` で旧JSキャッシュと区別。
- **回帰検証**：game.js/webgl3d.js/audio.js全文構文PASS、HTML ID一意性・4ボタン・再開/チェックポイント/SCHEMA2維持PASS。猫狐狼相当の半径18/24/30×屋内2棟で通常移動による北入口からの入退室と入口以外の外壁通過不可計6ケースPASS。近距離112単位以内と遠方での案内表示、曇り/雨/雷雨/屋内の5ケースPASS。ミッション段階別の表示名9/9、縦390×844/横844×390/PC1280×720の青入口スクリーン表示・画面外表示・不在・ポーズの12/12模擬Canvas検証PASS。実Androidでの新版目視・GPU/FPSは未検証。
- **残課題**：現在の室内は既存建物2棟のみ。ユーザーの実機画面で新しい青い入口の位置、黄色目標の内容、縦横HUD重複がないかを確認すること。屋内NPCの生活行動、小雨・豪雨、恒久的地形変化は未完成。
- **進捗49/100（前回49、据え置き）**：ユーザーの画面で混乱していた既存実装の案内不具合修正であり、新規の独立したゲーム進行機能ではないため進捗水増しをしない。コミット game.js `67dd39082cf77ab03b0aeec93f2ea747df3a975d`、index.html `90d046271c9a80dae051ec708f336c34028c88d4`。Pages成功はActions結果を参照し確認する。

## 2026-11-01 07時台｜雨・雷雨時の野鳥の着地・屋根／樹上休息・雨上がりの再飛行（フェーズB／1機能）

- **実装**：既存の野鳥20羽に飛行→安全な止まり場へ接近→着地／羽休め→雨上がりの離陸という状態遷移を追加。雨では飛行速度を抑え、一定の休息・再飛行周期を設け、雷雨では可能な限り近隣の既存ビル屋根・森のランドマーク樹木の枝へ向かい、雷雨が続く間は翼を畳んで待機。移動は鳥自身の飛行速度・上昇下降速度で進め、屋根の高さまで上昇してから屋根上へ進む。天候が戻れば同じ地点から上昇して再飛行する。プレイヤーが近づけば羽音を立てて飛び立ち、雨天でも緊急逃走を優先する。止まり場が近くにない鳥は位置を消さず飛行を継続し、数秒後に再探索する。
- **描画・見える化**：Canvas2D／WebGL両方の既存野鳥モデルで着地中の翼を畳む。3Dの屋根高度と同じ数値を使い、森の既存12樹木も候補とする。世界マップの説明欄に、雨・雷雨時のみ「野鳥の羽休め ○/20羽」を表示。新たな操作ボタンや画面を覆う常時HUDは追加しない。
- **保存互換**：既存SAVE_SCHEMA=2、旧localStorageキー、チェックポイント3件、旧8地域・6探索地点、動物96頭上限、巣・縄張り・PS式4ボタン・「》」ナビ・飛びつき距離70%、屋内2棟、敵緊急飛び逃げを維持。鳥の休息状態・止まり場・飛行／休息タイマーは従来のbirdFlocks配列に含めて自動保存。旧セーブの鳥には安全な飛行状態を補完。異常な座標・高さ・止まり場は検査して復元。
- **検証**：game.js／webgl3d.js／audio.js全文JS構文PASS。雷雨の屋根到達・着地・位置固定・晴天離陸・水平瞬間移動なし、森の枝選択、止まり場なしで有限座標維持、旧セーブ・不正止まり場復元、雨の着地→JSON保存→プレイヤー接近時の緊急離陸を模擬実行PASS。3D鳥の飛行／着地翼頂点の有限性PASS。室内入口・壁・家具・屋外建物・空地の衝突6/6、HTML ID重複なし、4操作ボタン、再開・チェックポイント、縦横CSS、8地域・6地点の静的回帰PASS。**実ブラウザでの長時間プレイ、Android実機、GPU/FPS、雨天時に何羽が着地するかの全域実測は未検証**。
- **次工程**：豪雨と小雨を含む雨量段階の追加（現時点ではRAINとTHUNDERのみ）、室内動物の採餌・睡眠、遠方動物の生活シミュレーション。屋根以外の止まり場の追加と、Android実機でのFPS・視認性・屋根と翼の描画確認。**進捗49/100（前回48、＋1）**。
- **GitHub main**：game.js `04e2e39b135647d865afaab1526fa8f7479b5fde`、webgl3d.js `27d297cc88d08b78805cc677dfd1cdaed5eae373`、index.html `79300c599a58d50da79a702b66d2f0d394c18fda`。BUILD `20261101-BIRDROOST1`、game.jsとwebgl3d.jsのキャッシュ更新。Pagesデプロイの成功はActionsで実確認した場合のみ報告。

## 2026-11-01 06時台｜遠方の野生動物を消さずに保持・雨天の周辺密度を段階補充（フェーズB／1機能）

- **実装**：game.jsの毎フレーム末尾にあった「画面サイズの2.7倍以上離れた生存NPCを配列から削除」を廃止。ミッション獲物の確保のために最遠個体を削除する処理も廃止。死亡したNPCのみ従来通り削除。遠方1300ゲーム単位を超える個体は正確な座標・HP・種別を保存したまま高負荷な個別追跡AIを休止し、接近時に再開。既存の8地域の集約生態シミュレーションは継続。ワープや既存個体の再生成は行わない。
- **遭遇密度**：局所半径670の生存個体数を基準に3.6秒ごとに最大1頭ずつ補充。通常は目標5頭、雨・雷雨は目標6頭、局所上限7頭（狩猟ミッション用の獲物は追加1枠）。全域の同時実体NPC上限を16→96に増やすが、近場の目標数を満たせばそれ以上増殖させない。近場の獲物が必要なミッションを優先し、既存の通常スポーン・障害物判定・種別分布・雨宿り・屋内移動を維持。動物の生成は新規個体として行い、既存個体を動かさない。マップ説明に「周辺の動物（獲物・敵）／全域生存個体」を表示し、遠方保持を可視化。ゲーム内で個体が不自然に増え続ける問題を防ぐため全域上限は96頭とする。
- **保存と互換**：SAVE_SCHEMA=2、既存自動保存キー、チェックポイント3件、旧保存形式は変更なし。従来のスナップショット上限120個体の内側で96個体を保存。新規・旧保存データの13頭／96頭を検証し、121頭は従来通り拒否。巣・縄張り・8地域・6探索地点・PS4式4ボタン・飛びつき70%・「》」ナビ・屋内2棟・緊急飛び逃げの実装は維持。
- **検証**：game.js/webgl3d.js/audio.js全文JS構文PASS。雷雨で周辺2→6頭を段階補充、既存遠方個体の座標保持、晴天で目標超過スポーンしない、ミッション獲物優先、96頭上限で強制削除なし、遠方AI休止・近距離AI復帰、旧セーブ互換、HTML ID重複なし、縦横CSS・HUD・ボタンの静的回帰PASS。実ブラウザ10〜20分プレイ、Android実機、GPU/FPS、雨宿りの自然な動線は未検証。
- **残課題／次工程**：遠方個体の完全な採餌・移動・子育てを実装したわけではなく、遠方では個別行動を休止する。全域96頭に達すると追加個体の補充は停止するため、長期的には地区ごとの集約個体と詳細個体を行き来させる保存設計が必要。鳥の豪雨着地、屋内の採餌・睡眠、実機FPSの測定も未実装。**進捗48/100（前回47、＋1）**。
- **GitHub main**：game.js `4b20d407e6f4d96f236354b01b419333bef0b6fd`、index.html `d827372cf03af1a2ca6b8e108dbf6d3580c6c3ab`。BUILD `20261101-WILDLIFE1`、キャッシュ `game.js?rev=20261101-wildlife1`。Pagesデプロイ成功はActionsで別途確認する。

## 2026-11-01 05時台｜2棟目の実入室・雨宿り・屋内狩猟（フェーズB／1機能）

- **実装**：旧来の既存建物 x=2570, y=705（屋根高度0、既存8地区内）を2棟目の入室可能な建物へ変更。初期の1棟 x=1640, y=1410 と合わせ2棟。北側幅110の実入口、壁5枚、家具2点、通路・衝突・射線・AI経路の判定を共通関数で適用。猫・狐・狼は通常移動で出入りし、室内の獲物は通常NPCとして攻撃・捕食・保存される。新規開始時のみ2棟に各1匹を通常スポーンし、従来と同じ「WILDLIFE.initial=12＋ミッション用の近場1頭＝計13頭」の開始時生成枠を維持し、室内分だけ通常の屋外初期生成数を減らす。旧セーブ復元時に追加スポーンしない。
- **雨宿りAI**：雨・雷雨時の既存rainShelterPointを、建物配列の先頭優先から**最も近い到達可能な室内**優先へ変更。敵・獲物とも逃走／攻撃／警戒を優先し、室内へ瞬間移動しない。入口が見通せなければ既存の軒下へ移動する。雨で既存個体を削除・ワープさせる変更はない。
- **3D屋根修正**：WebGLの屋根切り欠きは、従来の単一棟用判定 `interiorReveal==="1"` だと複数棟で常に偽になるため、各棟のプレイヤー距離で独立判定へ変更。静的メッシュ再生成キーには全室内棟の近接状態ビット列を使い、必要な切り替わり時だけ更新。Canvas2Dも既存のb.interior条件により両棟を室内描画。タイトル表示は `BUILD 20261101-ROOM2`、game.js・webgl3d.jsのキャッシュを更新。
- **回帰試験**：game.js/webgl3d.js/audio.jsの全文JavaScript構文PASS。2棟それぞれの室内床・北側入口・側壁・家具衝突・入口からの射線・側壁遮蔽・屋内判定・室内獲物スポーン、近い避難室選択をモックで確認。WebGLの2棟独立屋根開閉をプレイヤーが1棟目近傍／2棟目近傍／両棟遠方の3ケースで確認。HTMLのタグ整合・重複IDなし、続きから優先・チェックポイント・PS4式4ボタン・旧SAVE_SCHEMA=2・飛びつき・ナビHUDの不変を静的確認。実ブラウザの10〜20分操作・Android実機・GPU/FPS・屋根の視覚品質は未検証。
- **残課題／次工程**：屋内AIの自然な採餌・休息、悪天候での獲物・敵の実プレイ密度計測、さらに別地域の建物・地下、遠距離NPCの集約生態、鳥の豪雨着地、恒久的な地形変化。現行の遠距離NPC整理は引き続き改善対象。**進捗47/100（前回46、＋1）**。
- **GitHub main**：game.js `578929a8f8150446d1a450cc91242667f7aaeceb`、webgl3d.js `0fa7d16540b03ff9045495136fef04017596fc68`、index.html `f6163526508a42a549397e69cd5f3db6f9b25ccb`。Pages配信成否はActionsで別途確認する。

## 2026-11-01 04時台｜敵の緊急飛び逃げ（短距離横跳び・視認判定・壁衝突・クールダウン）｜フェーズA・1機能

- **今回の実装**：野犬・イノシシ・強敵アルファが、プレイヤーの通常攻撃／低空飛びつきを視認し、正面から接近する危険を察知した場合、確率的に横へ短距離飛び逃げする。野犬67、イノシシ58、アルファ74ゲーム単位、0.29秒の低い跳躍。種別で回避確率が異なり、成功後3.5〜4.7秒のクールダウン。失敗反応にも1.1秒の再試行待ち。プレイヤーが背後を向く／敵が発見していない／壁で視線が遮られる／真正面以外の攻撃／本物の奇襲／敵が攻撃予備動作・突進・スタン中なら発動しない。
- **衝突と実移動**：飛び逃げは座標ワープではなく1ステップ最大7単位の移動で、建物の入口・壁・家具・車両・障害物を既存のcollidesとrouteClearで検査。空き方向がない場合は飛ばず、途中で壁に当たれば直ちに中止。無敵時間は付与せず、プレイヤーの攻撃ヒット判定は既存座標を使う。既存AIの雨宿り・追跡・攻撃を回避動作中のみ一時停止し、着地後に通常AIへ復帰。
- **描画**：WebGL動物の足・胴体をevadeHeightで持ち上げる低空の実ジャンプと、Canvas2D代替描画の同じ高さを追加。「飛び逃げ！」を短く表示し、既存ジャンプ効果音を控えめに再生。UIボタンは追加せずPS式4ボタン、プレイヤーの飛びつき距離70%を維持。
- **セーブ**：localStorage自動保存・チェックポイント3件・SAVE_SCHEMA=2を変更せず、NPCの回避クールダウンは従来のmobs配列とともに保存。旧セーブで未定義の回避フィールドは復元時に初期化。回避中の再開は地上で安全に復帰し、座標と生存個体数は維持。
- **回帰QA**：game.js、webgl3d.js、audio.jsの全文構文PASS。敵の視認反応、奇襲禁止、獲物を敵回避対象にしない、距離／方向／攻撃なし、屋内壁、移動中衝突、スタン・予備動作、回避失敗クールダウン、種別差の10項目PASS。スマホ縦390×844・横844×390・PC1280×720の3画面×敵3種=9ケースでAI衝突／移動量／着地PASS。3画面×4描画ケース=12ケースでWebGL動物メッシュの有限座標・evadeHeight連動PASS（初回のテスト基準「全動物20メッシュ以上」がイノシシの元来17メッシュを誤って不合格扱いしたため、種別を踏まえ14以上に訂正し再試験PASS）。旧個体の回避フィールドなし・回避途中復元を模擬検証PASS。HTMLタグ・ID重複、キャッシュ参照、操作4ボタン、ミッション2.6秒、室内と雨宿り、ナビ「》」、再開優先、飛びつき70%の不変を確認。**実Chrome/Androidの操作・実GPU/FPS・長時間実プレイは未検証**。
- **未実装／次工程**：複数棟の室内出入り、屋内の野生動物の自然な行動と悪天候時の密度実測、獲物の高度なフェイント、小雨/豪雨の4段階、300年以降の恒久地形変化。回避成功率と移動量は実機プレイで調整。**進捗46/100（前回45、+1）**。
- **GitHub mainコミット**：game.js `c9b4cdf68666b6e050d547f43893822e435d4c87` → `6303f8d3b6173c71d63dd07e9f02d178e2439777`、webgl3d.js `b3a41bb68ab2cbff034711c4576ec6153a5b6844`、index.html `819ccbabbf9f06ae78b1f77aa03e194c51377613`。ビルド表示 `BUILD 20261101-EVADE1`、JS/3Dのrevをevade1へ更新。Pages配信成否はActionsで別途確認する。

## 2026-11-01 03時台｜既存ビル1棟に「実際に入れる室内」を実装（雨宿り・屋内狩猟／段階1）

- **今回の実コード**：初期の巣付近（旧地区の既存建物 x=1640, y=1410、北側入口）の1棟だけを、歩いて出入りできる室内へ改修。既存建物の位置・地区数は変更しない。北側幅110の入口、5分割の外壁、室内の障害物2つを実装。衝突判定・射線遮蔽・A*の直線判定で同じ壁形状を使い、壁を通り抜けず入口から入る。猫・狐・狼で移動可能。屋内に獲物1匹を初期配置し、狩猟可能。室内の獲物は通常の野生動物としてAI・ダメージ・セーブに残る（固定演出ではない）。
- **悪天候の行動**：雨・雷雨時、近くの落ち着いた野生動物は、入口への見通しが通れば実際に室内を避難先として選び、通常の移動／経路探索で入る。見通しがない場合は従来の軒下へ避難。追跡・警戒・逃走を優先する従来AIを維持し、天候変化で個体を削除／瞬間移動しない。プレイヤーが屋内に入ると「屋内避難中」HUD、雨の視界オーバーレイ軽減、雷雨時の持久回復低下と雨の足元減速を解除。建物入口近くに「光る入口から進める」案内を表示。
- **3D/2D表示**：WebGLは5壁・床・家具・屋根を実際の立体メッシュとして描画。プレイヤーが接近した場合のみ屋根中央を切り欠き、室内の動物と家具を見せる。Canvas2Dでも近づくと室内を表示し、従来の建物全体を遮蔽物とするシルエット描画を室内棟には適用しない。ミニマップ上の室内棟も識別可能。3Dメッシュの切替時だけ静的バッファを再生成し、毎フレーム再構築しない。
- **回帰QA**：game.js・webgl3d.js・audio.jsの全文JS構文PASS。室内床／入口／側壁／背面壁／家具の衝突、扉からの往復移動、射線、A*入口経路（5ノード）、雨避難地点をモック検証PASS。WebGLモックで縦390×844・横844×390・PC1280×720の屋根開閉、静的キャッシュ、有限頂点15バッファPASS。ゲーム全体のDOM/Canvas2D模擬で3画面×猫・狐・狼の9ケースを起動→室内の生物を確認→歩いて入室→雷雨HUD→2D描画→自動保存→再開後も室内→退室までPASS。旧セーブキー、SCHEMA2、チェックポイント3件、4操作ボタン、NAV3、8地区、既存の飛びつき距離70%は変更なし。HTMLのタグ・ID・キャッシュ版数とCSS括弧も確認。
- **未実装／未検証**：室内は現状1棟のみ。ほかの建物、地下、複数入口、ドア開閉、NPCの遠距離経路探索、屋内の高度な採餌・睡眠、雨量4段階、敵の緊急飛び逃げ、屋根の完全な雨遮蔽／雨粒の屋内外局所制御、長期地形変化は未完成。室内の雨表示は画面全体の軽減であり建物単位の雨粒シミュレーションではない。実Chrome画面目視・Android実機・GPU/FPS・10〜20分実プレイは未検証。
- **次工程**：屋内外のAI経路と獲物密度の実プレイ調整、敵の緊急飛び逃げ（短距離横跳び＋クールダウン＋衝突）、複数建物への安全な拡張。**進捗45/100（前回44、+1）**。
- **GitHub main**：game.js 997113687df49766668afe6093009ab343fdfa82 → aeb1e5a130e87cf48f4706137c7a5551e78bc31d → 9d576c40a75ecba618c5294ac8b13e9f01fb5c92、webgl3d.js d72d98023350e13ed1ec548afc0193eafbcf9d47、index.html e19920f107d954ce83710e5de117127b87fabab6、visual.css cea9e2509d20ec98ecdca17b9f26c8f196756570。ビルド識別子 BUILD 20261101-ROOM1。Pages配信成功はActions結果を確認した場合のみ報告。

## 2026-11-01 02:30 JST｜「》」ナビの視認性再修正・保存ゲームの再開を最優先に変更

- **直接指摘**：「ナビが変わっていない」「初めからのボタンが目立ち過ぎる。続きからを分かりやすく」。前回のGitHub Pages配信は成功していたが、旧ナビは29pxの小さなゲーム画面内文字、目的地が画面外なら光を省略、再開ボタンは新規開始の設定項目より後方の小さなボタンだった。見え方の問題を実コードで修正。
- **ナビ再修正**：index.htmlに画面中央上側の独立した`#nav-hud`を追加。game.jsの既存のA*迂回点または目標座標へ常時「》」を回転表示し、残距離を明示。プレイヤー近くの既存「》」描画も維持。目的地が画面内にあるときは発光リング・縦光柱・目的地ラベルを強化。画面外なら画面安全領域端の「目標方向」光マーカーで位置を示す（実際の到達地点と誤認させないラベル）。目標なし・ポーズ時は非表示。WebGLとCanvas2Dの共通オーバーレイ。
- **再開を最優先**：タイトル直下へ「▶ 続きからプレイ」を移動し、金色の大きな主ボタン、動物名・LV・DAY・保存時刻を表示。セーブがあれば新規開始（種族・出発地点・開始ボタン）を`details`内へ初期折りたたみ、控えめな色へ変更。チェックポイントのみ残るときも「チェックポイントから再開」を目立たせる。セーブなしでは新規開始欄を自動展開。既存セーブありで新規開始を押したときは上書き確認を追加し、チェックポイント3件は保持。
- **反映の目印**：タイトルビルド表示`20261101-NAV3`、HTMLのgame.js/style.css/visual.cssへ新しいrevクエリを設定。旧ページキャッシュのまま画面が変わらない場合にはクエリ付きのページURLで確認。
- **QA**：game.js/webgl3d.js/audio.jsの全文JavaScript構文検証、HTMLタグ対応・ID重複なし、CSS/JS revの整合、再開優先表示順と新規欄折りたたみ、ナビの方向（右/下）・200m表示・目標なし/ポーズ非表示4ケース、保存あり/チェックポイントのみ/保存なしのタイトル3ケース、3種画面寸法（390×844/844×390/1280×720）×画面内/画面外/なし/ポーズの目的地12描画ケース、旧localStorageキーとSCHEMA2、PS4ボタン維持。モック検査合格、実Android/GPU/FPS・タッチ・実ブラウザ画面確認は未実施。
- **未実装・次工程**：建物内への出入りと屋内AI、敵の緊急飛び逃げ。実端末縦横でナビHUDが他要素と重ならないか確認する。進捗44/100（前回43、+1）。
- **コミット**：index.html d2a18c14a2c8f103c21de642fa96620be59b6764 → a3ae092d456b4ae27d739d9b2fe53d9e356183ec、visual.css 246e63fc152215831c0d0b08eed60c7e01193fce、game.js 11d477c4fef6a72be4252b2bf698791f26f97577。PagesデプロイはActionsで別途実確認。

## 2026-11-01｜目的地への「》」誘導と発光ビーコン（視認性改善）

- **実装**：game.jsの旧5粒誘導光を廃止し、プレイヤー近くの単一「》」グリフへ変更。A*経路案内の次の到達可能地点を指し、斜め視点/視点回転に合わせて回転する。目的地そのものに淡い発光リング・縦の光柱・「目的地」の文字を表示。接近時は光柱とリングを強調。目的地が画面外ならビーコン描画を省き「》」で方向のみ示す。ゲームモードがplayでない時、目標が存在しない時は表示しない。実際の目的地はgetObjective()から取得し、ルート迂回点とは区別。WebGL3DとCanvas2D双方で同一スクリーンオーバーレイを利用。
- **互換**：A*経路、ミッション条件、4操作ボタン、セーブ形式SCHEMA=2、8地区、軒際避難AIと飛びつき70%を維持。index.htmlのgame.jsキャッシュ識別子を変更し、更新がブラウザへ届くようにした。
- **QA**：game.js全文をJavaScript構文解析、模擬Canvasで縦390×844/横844×390/PC1280×720の3画面における画面内・画面外・目標なし・ポーズの計12ケースを検証。表示中は「》」と発光リングを描くこと、画面外ではリングを描かないこと、目標なし/ポーズでは描かないことを確認。保存形式と4ボタンの既存コードを静的確認。
- **未検証**：実Chrome画面のデザイン、Android実機縦横・GPU/FPS、実ゲームでの長時間ナビ経路/目的地切替、画面端・HUD重なりの目視。Pages公開反映はActions成功を確認するまで未確定。建物内部・敵の緊急飛び逃げは引き続き未実装。
- **次工程**：建物内へ入れる小区画の実装と現行ナビが屋内の通行可能な入口を案内できるかを確認。
- **進捗43/100（前回42、+1）**。game.jsコミット 73fcf1ca97862ba2930c4ed5fa9ef32afa402c4d、index.htmlコミット 6d889192b5539f6cd5da9cb68c70f8432fb0f25c。

## 2026-11-01 02:15 JST｜悪天候の動物密度と軒下避難AI（フェーズB・段階1）

- **実装**：近景の野生動物上限4→6体、総数13→16体、初期10→12体へ段階増加。雨・雷雨時は近景5体未満なら近距離出現を優先。天候で既存個体を消去・瞬間移動せず、落ち着いた動物が通常移動で到達可能な建物外周の軒際へ歩いて雨宿りする。警戒・逃走・捕食・攻撃を優先。軒際で待機する個体には「雨」表示、晴れたら行動再開。建物や車の衝突・遮蔽物を越えて避難しない。
- **QA**：game.js/webgl3d.js/audio.js構文、軒際候補の到達可否・遮蔽物、悪天候移動・待機・警戒時優先・晴天復帰、飛びつき70%維持、セーブschema2と8地区の静的互換を検証。モック検査であり実ブラウザ・Android・GPU/FPS・10〜20分の実プレイは未検証。
- **未実装**：建物のドア・室内への出入りと屋内AI、軒の雨粒遮断、小雨と豪雨の段階、敵の緊急飛び逃げ、遠景個体永続化。近景上限増加によるAndroid負荷は未測定。次工程は建物の出入り可能な小区画、室内の衝突とAI経路を優先。
- **進捗42/100（前回41、+1）**。GitHub main commit: bc6c747f2f0a2f2a85a568b9da9943f275482228。Pages配信成功は別途確認が必要。

## 2026-11-01 01:15 JST｜低空飛びつきの接触命中・本物の奇襲演出（フェーズA）

- **実装**：猫・狐・狼の□短押し低空飛びつきが、高速移動線分と動物の円形当たり判定を計算し、最初の個体に接触した位置で停止して即時攻撃する。旧版の着地点だけの命中と狼限定の途中命中を修正。前方方向・高低差・建物・車・バリケード・衝突をチェックしてすり抜け/遮蔽物越しの誤命中を抑制。
- **奇襲**：警戒済みの動物には隠れていても奇襲倍率・強い怯み・英語演出を与えない。実際に未発見だった対象のみSHADOW HUNT/PHANTOM HUNTを発生。演出は約1.3秒後に明示消去。□長押し能力、×5段、○ジャンプ、△食事・巣、猫壁蹴り、狐疾走、狼突進を維持。
- **QA**：ゲーム・3D・音声JSの構文検査、3種の高速接触、最初の個体優先、背後/側面/高所/建物/車/固体衝突の非命中、未発見・警戒済みの2体に対するダメージと演出分離、セーブキー/8地域/動物数の静的回帰を検証。テストはJavaScript関数を実行したモック試験であり、実ブラウザ・実Android・GPU/FPS・縦横の実画面・10～20分の実プレイは未検証。
- **残課題**：獲物の急旋回/フェイントの実プレイ評価、四足の低空姿勢、Android縦横HUD、セーブ復元と長時間生存のブラウザ回帰。旧8地区と6探索地点、300年以上の世界変化方針は維持。地形変化と雨宿りAIは未実装。**進捗41/100（前回40、+1）**。

## 2026-11-01｜方向再構築・毎時15分タスク再開（実装方針・未実装の区別）

- **新方針**：WILD RECLAIMは、自律する動物の狩猟・逃走・生存と巣/親子/世代交代、および100年を超え300年以上続く地形・生態系の恒久的変化を核とする独自の斜め3Dオープンワールド。東京固定は解除する方向。架空都市/森林/山/河川/港/地下の連続した世界へ段階移行し、固有名・地域数は未決定。既存8地区・セーブを破壊しない。
- **開発順序**：A 猫狐狼の1地区を狩猟/低空飛びつき/奇襲/警戒/回避/逃走で10～20分遊べる状態にする → B 動物AI（採餌、飲水、睡眠、群れ、雨宿り、小雨～豪雨、鳥の休息） → C 3Dモデル・四足アニメ・天候環境とAndroid品質 → D 地域ごとの特色と広域探索/地形/内部 → E 世代継承＋300年以降の永続地形変化（通路・衝突・AI経路・生息域・セーブへ連動） → F 陸空水・SF物語・検証済みのオンライン機能。
- **現在の現物**：WORLD=8400×6000、8地区、画面内生物上限13（近隣4）、6天候、猫狐狼、中央ミッション/終了、低空飛びつき/英語奇襲演出のGitHub改修は存在。ただしAndroid実機での飛びつき体感、奇襲表示、GPU・FPSは未検証。小雨と豪雨の区別、雨宿りAI、実地形変化、繁殖・世代交代、架空世界の地名と地域構造は未実装。
- **運用**：既存の毎時タスク6ae373bfe9fc81918d84c77f6096a4c5をAsia/Tokyo 2026-11-01 01:15から毎時15分で有効化。毎回1つのまとまった機能のコード/回帰QA/コミット/進捗報告を行う。ユーザーの停止指示が出たら停止。他プロジェクト編集禁止。新しい機能で古いセーブ・4ボタン・斜め3D・UI・草むらのサイズ固定・オリジナル演出を壊さない。進捗40/100起点、実装+検証に基づき更新。Drive設計書に最新版を追記済み。
- **この時点の作業**：方針と自動タスクの改訂のみ。新しい天候AI・地形変化機能は未実装。実行開始時刻前にゲーム本体へ追加変更しない。

## 2026-10-31｜ミッション中央演出・チュートリアル明示・潜伏時の草むら縮小を廃止

- **ユーザーの決定**：次のミッション発生時は『龍が如く』のように画面中央へ目的を大きく短時間表示。潜伏時に草むらが小さくなる演出は不要。チュートリアルであることをミッションに明記し、その先の目的も示す。
- **実装**：index.htmlへタッチを遮らない中央ミッション帯、現在の目標と次の目的を追加。表示は約3.6秒で自動終了し、常設パネルは従来どおり「目標を見る」を押した時だけ開く。縦横・狭い画面へ適応。進化の選択画面中にミッションが進んだ場合、操作に戻ってから告知。
- **チュートリアル全4章**：①食料を確保、②茂みで潜伏、③獲物を仕留める、④旧新宿駅へ到着。全て「チュートリアル n / 4」表示。
- **チュートリアル後**：既存の実機能をミッション化し①巣をLV2へ強化（備蓄60／長押し）、②縄張りを1か所確保、③探索地点を2か所発見、その後は自由探索（食料補給／狩りの交互サイクル）。ミッション欄に「次の目的」を常時明記し、中心表示にも次の目的を表示。
- **草むら**：Canvas2Dの近接による半径変化、WebGL3Dの近接によるモデル縮小を撤去。見た目は元の標準係数0.74の一定サイズ。潜伏判定・視界保護の前景透過は維持。
- **互換性と検証**：localStorage保存キー・SCHEMA=2・座標は変更しない。既存セーブの mission=4 は新たに巣強化ミッションとして解釈される（旧来の無限周回への移行位置は変更）。全JS構文チェックPASS。模擬状態でチュートリアル4段階→生存3段階→自由探索2ターンの遷移を確認。**実Android縦横の目視・FPS・タップとGitHub Pages配信は未実機確認**。進捗40/100を維持。毎時自動タスクはユーザーの停止指示どおりOFF維持。

## 2026-10-31｜①3D動物→②地域の景観→③生態系AI→④探索・成長を順次実装

- **指示**：「かなりリアルなグラフィック、かなり誇張したアクション、自由探索・成長」の方針を確定。ユーザーは実装可能範囲を①動物の見た目と動き、②東京の景観、③動物AIと生態系、④自由探索と成長の順で実行するよう要求。毎時開発タスクはユーザーの明確な停止指示により**OFF維持（再開禁止）**。手動の今回実装のみ進めた。
- **① 動物モデル・動き**：webgl3d.jsのプロシージャル3D造形で、猫・狐・狼などの四肢に上下に動く関節、呼吸による身体の伸縮、着地圧縮、狐の揺れるふさふさした尻尾、狼の尾、毛の色分けパッチ、瞳の黒点を追加。既存の壁蹴り、狐疾走、狼突進、各種噛みつきポーズを保持。モデルファイルやフォトリアルな毛皮シェーダーへの置き換え、完全なスケルトンアニメーションは未導入である。
- **② 東京の地域景観**：上野動物園の檻、代々木の森の高木、湾岸工業区の煙突・コンテナ、江東運河の水路と護岸、荒川河川敷と橋、地下ARK設備入口のハッチを6地点の固有3Dメッシュで描画。描画は画面近傍だけの静的メッシュ生成とし、WebGLに失敗したブラウザでも同じ6地点の特徴をCanvas2Dに描画。探索地点は装飾物で、未実装の建物内部や新しい物理コリジョンは追加していない。既存の8地域と座標、道路と猫壁蹴り、長距離移動の挙動は維持。
- **③ 動物AI／プレイヤー不在の生態系**：8地域ごとに獲物数・捕食者数・食料余力・圧力・支配群れ交代の**集約シミュレーション**を15ゲーム秒単位で進行。プレイヤーが遠くにいても地域の生態値を更新。画面内では小動物が近隣捕食者から自発的に逃げ、捕食者はプレイヤーが発見されていなければ野生の獲物を追跡・狩猟し、食料になる。マップに現在の地域の獲物数・捕食者数と勢力状況を表示。これは遠方の動物を全個体独立移動させる物理シミュレーションではなく、画面内AI＋遠方の地域集約値という軽量方式。処理・スポーンは従来の13体上限などを保つ。
- **④ 探索成長・永続化**：六つの自由探索地点で1回限りの固有パッシブ効果を入手。上野：最大HP+12、荒川：持久回復+3/秒、代々木：空腹減少20%軽減、湾岸：走力+5%、江東運河：雨による速度減少軽減、ARK入口：固有能力CT15%短縮。地図に解放済み能力一覧と6分の達成数を表示。既存のゲームモード、種族能力、進化、巣、メニュー、停止中の毎時タスクには手を加えない。
- **旧セーブとの互換**：既存のlocalStorage AUTOSAVE_KEY/CHECKPOINTS_KEYとSCHEMA=2維持。snapshotへecology・ecologyClock・ecologyNews・earnedDiscoveriesを追加。旧セーブでは生態値を初期化し、過去に訪れた場所の新能力を1回のみ付与。新セーブからのロードでは重複付与しない。
- **検証**：全JS構文PASS。6出発地点×猫・狐・狼の18シナリオで新能力獲得、地域の生態値境界、マップ表示、セーブ→再開PASS。模擬WebGLは6地域×3動物×縦390x844/横844x390/PC1280x720の54シナリオでジオメトリ頂点が有限値・動的3Dモデル描画PASS。旧セーブに地域発見6件を追加した互換試験で新能力6件を1回だけ付与、再ロードでHP二重増加なし。画面内野犬が野生のネズミを捕獲し、肉の食料が生成され、地域の獲物数が減るシナリオPASS。**本物のAndroid実機GPU・FPSや3D品質、全世界長時間移動は未検証**。フォトリアルなモデルやGTA級の完全なAI実装とは称さない。
- **今後の未実装**：毛の質感・骨格モデルの高品質素材、地形別の細かなライティング、建物内部、物理的な水泳、NPCの遠方全個体維持、群れの繁殖と戦闘、季節を通じた生態系など。タスクの自動再開禁止。進捗40/100（実機未検証のため据え置き）。

## 2026-10-31｜音声全面刷新／6地点から新規開始して拡張地域を確認

- **ユーザーの指摘**：「なんも追加されてねえよ！ あとbgmと効果音をちゃんと変えろていったよな？」。マップ拡張は実コードに存在していたが旧巣から開始すると新地域が見えない点、音声が3種の微弱なサイン波と単音電子音中心だった点を改善する。
- **可視化と新規開始地点**：タイトル上部に `8 REGIONS / 6 WEATHER / NEW SOUNDTRACK / BUILD 20261031-AUDIO2` を表示。`index.html` に出発地点セレクトを追加し、東京の巣周辺／上野廃動物園／代々木の森／湾岸工業区／江東運河／荒川河川敷の6か所から**新規ゲーム**を開始できるようにした。再開・チェックポイントの挙動は変更なし。天候も新規開始時から6種類のいずれかをランダムに選び、以降は既存の不定期遷移。どこにいても選んだエリアに応じたBGMが始まる。新地域は座標8400×6000の中に存在し、旧巣周辺を壊さない。
- **実音声エンジン**：新しい `neo-wild/audio.js` を追加。ネットからの無許諾素材・音源直リンクなし。Web Audioで生成した**オリジナルBGM3曲**（探索・森・狩猟緊迫）、風／森／雨の**3レイヤー環境音**、地面ごとの足音・噛みつき・羽ばたき・ジャンプ・衝撃・咆哮・雷鳴・回収・ダメージなど**17種SE**。従来の `startAmbient` の単純なサイン波と `sound()` の電子音呼び出しを撤去し、新しいSFXトリガーへ変換。プレイヤー周囲の敵・地域・天候に応じてBGMと雨音が滑らかに変化。音声はユーザーのタップで初期化して以後継続、ポーズ時は低音量、♪でミュートできる。実録音ではなく独自生成サンプルであると明示する。
- **強制キャッシュ更新**：HTMLのゲームJS、音声JS、3D描画、CSSのURLクエリを `20261031-...audio2` に更新。ユーザーが旧版を見ている可能性があるため、最新版を開いたら必ず `BUILD 20261031-AUDIO2` と出発地点セレクトが見える。端末ブラウザ側のキャッシュの有無は未直接検証。GitHub Pages build / deploymentはab4867c891を含む版で成功済み（最終公開のコミット状態は別途確認）。
- **QA**：JavaScript構文PASS。モックAudioContextで音源バッファ13件（BGM3・環境音3・7種の効果音をサンプリング）、6ループ同時に起動し、地域別BGM、危険時BGM、ポーズ時音量低下、ミュート復帰を確認。6出発地点×縦390×844・横844×390・PC1280×720＝18ケースで座標・AREA表示・自動保存／続きから再開を確認。Google Drive正本第49節に会話と実装状況を保存。
- **留意**：ユーザー実Android上のBGMの聞こえ方や画面表示、FPSは未検証。本格的な外部録音素材（生の動物声・実フィールド録音）の採用はライセンス等を確認したのち次工程。広大な世界のAIや地域探索は未完成。進捗40/100据置。

## 2026-10-31｜広域マップのWebGL描画負荷削減（進捗40/100据置）

- **実装**：5倍マップ（8400×6000）の全道路に散らばる路面ライン・路肩植物の3Dメッシュを、各地域の静的GPUバッファ再構築時に画面周辺（投影視界＋850px）だけ生成するよう `webgl3d.js` を修正。地面・道路本体・地区の地色・建物・車・動物・食料・天候・遮蔽・保存・UIは変更なし。240単位のカメラ領域更新時に周囲の路面ディテールを再生成し、長距離移動で消えたままにならない。
- **効果（模擬GLの静的三角形数）**：旧版と修正版を同一入力で比較。390×844／844×390／1280×720、旧地区・上野・江東の3地点で静的メッシュ三角形数が**23〜38%減少**。これはGPU FPSの実測値ではない。
- **QA**：JavaScript構文PASS。3画面×3地区×6天候=54模擬GL描画と9回の地区移動後再構築、合計63ケースPASS。全GPU頂点が有限、描画命令と天候6種、移動後の静的再構築を確認。既存動物数・操作・保存・WebGL→Canvas退避は今回変更なし（既存機能の実端末回帰試験は未実施）。
- **コミット**：`neo-wild/webgl3d.js` main `0d1e38b6e1b11f40aee2acc3c4048bc9f92c3523`。
- **未検証**：実Android縦横のタッチとHUD非遮蔽、Chrome実GPUの画質・FPS、街の遠距離踏破、稲光の質感、天気の保存後継続。次回は実表示の問題が見つかれば修正し、ユーザー未承認の時計85秒／日・ARK結末・寿命は変更しない。
- **進捗：40/100（+0）**。軽量化のみで完成度を水増ししない。

## 2026-10-31｜広域オープンワールド5倍・不定期6種天候を実装

- **今回実装**：`game.js`：WORLD 4200×2400→8400×6000（面積5倍）、8地域（霞ヶ関・旧新宿・緑化区・上野廃動物園・荒川・代々木緑地・湾岸工業区・江東運河）、新しい道路網と建築物合計約100棟、森林や廃墟、草・デブリ、地域による動物の出現傾向の差と生存に必要な周辺食料スポーン。新たな探索地点6か所（上野・荒川・代々木・湾岸・江東・地下ARK管理区画）は自由に訪問でき、近寄ると発見記録。ワールドマップは8地域と未踏／発見済み地点を区別し、ミニマップは主人公周辺の実用的な近距離マップへ変更。
- **天候**：以前の日付固定の雨・霧を廃止。`CLEAR,CLOUDY,RAIN,THUNDER,FOG,WIND`（晴れ、曇り、雨、雷雨、霧、強風）の6状態を現在天候から重み付きで遷移させ、不定期におよそ28〜69秒（初回24〜44秒）で変化。約9秒前に雨雲・遠雷・霧などの予兆。雨線・曇りの遮光・濃霧・強風の描写・雷雨の稲光／雷鳴、雨の足元減速・嵐の持久力回復低下・匂い／視界への影響。WebGLの環境光も天気で暗さを変更。時間倍率（現状1日85秒）の全面的な変更は未決定なので実施していない。
- **WebGL3D**：`webgl3d.js` の地面を森林・工業地区・運河・動物園・川で描き分け、道路の数をゲーム本体から受け取る。旧マップの領域と巣／縄張り／三角飛び路地は維持。自由探索でARKの手がかりを偶発的に発見する方針と整合し、強制進行は追加しない。
- **セーブ互換**：`worldVersion:2`、`weatherTimer`、`nextWeather`、`thunderTimer`、`windDirection`、`discoveredSites` を既存のlocalStorage自動保存に追加。旧版の位置・HPなどを保持し、追加された街の草・デブリを復元時に補完。チェックポイント3件／4秒自動保存／ポーズからタイトル／PS式4ボタン／開始から使える猫三角飛び・狐高速疾走・狼突進／トップ背景2枚は保全。
- **QA**：JS構文PASS。猫狐狼×Android相当縦390x844・横844x390・PC1280x720×2D/模擬3Dの18ケースで雨・曇り・晴れ・雷・風・霧、雷閃、天候遷移、探索地点への移動・発見、地図描画、セーブを確認。独立WebGL模擬54ケース（3地域×3画面×6天気）で有限頂点・静的／動的メッシュ描画PASS。旧4200×2400セーブを新世界へ読み込み、元位置/HPを維持し新地域の草と瓦礫を補完する互換性試験PASS。全6探索地点は建物に塞がれていない。**実Chrome GPUとAndroid実画面・FPS・長距離踏破は未検証**。
- **Google Drive設計正本**：第47節に仕様、ユーザー要望、実装状況と未検証点を保存。次は地域単位のストリーミング、動物の生活AI、季節別天候、地下と屋上の連結が必要。旧マップの5倍の試作であり、GTA同等の完全な都市と誤報しない。
- **進捗：40/100（実機未検証のため据え置き）**。

## 2026-10-31｜邪魔な茂み・目標表示を改善／自動保存と3件のチェックポイント

- Android画面のユーザー指摘：大きな茂みが視界を塞ぎ、従来の常時表示目標パネルも重なって邪魔。ゲーム再訪時に初めからとなる状態を修正する。
- index.html：目標パネルは初期非表示、左HUDの「目標を見る」から開閉し「×」で閉じる。タイトルに「続きから再開」「チェックポイントから再開」「初めから生存する」の選択肢。ポーズに「チェックポイントを記録」。
- game.js：自動保存はlocalStorageの`wild-reclaim-autosave-v2`、プレイ中4秒ごと、ポーズ、タイトル帰還、ページ離脱、アプリ非表示とblur時。保存対象は主人公の動物・座標・HP/空腹/持久・LV/XP・狩り・任務・天候・経過時間・巣/備蓄/縄張り・獲物・食料・草木/障害物・鳥・視点。復元時は空中や攻撃の一時状態を終了させ床へ安全に着地。死亡時は自動セーブだけ消去。チェックポイントはlocalStorageの`wild-reclaim-checkpoints-v2`、新しい順に3件まで手動保存・選択再開でき、死亡でも残る。ブラウザ内のみ、クラウド同期なし。
- game.jsとwebgl3d.js：近くの大きな茂みを縮小。Canvas2Dでは手前の茂みを薄く表示。隠れ判定は維持。visual.cssでHUD、保存UIの縦横表示を調整。
- QA：JavaScript構文PASS。狐猫狼×縦390×844・横844×390・PC1280×720×Canvas2D／模擬WebGL、合計18ケースで目標開閉・自動保存・ポーズ保存・完全な実行環境再起動後の続きから復元・3件チェックポイントと過去地点再開・死亡時の自動セーブのみ削除を確認。実Androidの実画面・GPU/FPS・実端末の保存制限は未検証。
- Google Drive正本の設計書第46節に要望・実装内容・検証を保存し、読み戻して確認済み。今後Androidで実表示・茂みの大きさ・HUDの操作可能性・ストレージ制限を確認する。進捗：40/100（据置）。

## 2026-10-31｜実装済み：初期猫三角飛び・狐爆速疾走・狼重量突進

- **GitHub mainへ実コード公開**：`game.js`、`webgl3d.js`、`index.html`。動物を選んで開始した時点から各固有アクションが使用可能。技をレベル解放待ちにしない。古い狐の「次の噛みつき強化のみ」を「実際に移動が約2.3倍になる疾風」へ置換。PS式△行動／□短押し飛びつき・長押し本能／○ジャンプ／×5段ラッシュは維持。
- **猫**：通常ジャンプ中、近くの実建築壁に向かって○またはPC Lを押すと壁蹴り。壁の法線・角度に応じて蹴り出し、ジャンプ高度を引き継ぐ。LV1で最大2連続、成長で5連続まで（本能中+1）・距離／高さも強化。着地で回数リセット。壁A→壁Bへ接触して跳べる対向壁の路地（x1990と2185、y835付近）と屋上(x2085,y765)を追加。無制限の空中ジャンプは禁止。
- **狐**：基本スピード205→285ゲーム内単位/秒。□長押し／PC Rで疾風4.4秒・初期速度倍率2.32、LVで倍率・継続を強化。加速・減速・旋回・疾走カメラ追尾・砂埃演出を追加。高速度でも車や壁を貫通しないよう移動を小刻みに衝突判定。
- **狼**：□短押しの重量突進最大距離85→LV1で165ゲーム内単位に拡大。獲物に接触した時点で命中判定、ダメージ約1.6倍の突進ボーナス、強いノックバック。成長で距離と威力、□長押し／PC Rの咆哮で威圧する範囲が強化。本格的な仲間AIによる群れ連携は未実装。
- **ビジュアル**：WebGL3Dの脚・胴体・首に壁蹴り姿勢、狐の高速前傾、狼の踏み込みを追加。Canvas2D退避にも対応。スマホ向け種族選択説明とPC/タッチ操作ヒント更新。タイトル背景2枚・ポーズUI・既存セーブは維持。
- **QA**：JS構文PASS。模擬ランタイム6ケース（狐・猫・狼の主要動作、縦390×844／横844×390／PC1280×720、CanvasとモックWebGLで繰返し）PASS。狐の実動作最高約661ゲーム単位/秒、猫は対向壁A→Bの連続三角飛び成功（初期LVで3回目は不許可）、狼は敵への突進命中ダメージ成功。3種×3画面の模擬WebGL9ケースで3D静的／動的メッシュの有限頂点・描画命令PASS。**実Android・GPUによるピクセル表示とFPS・主観的操作感は未検証**。完成とはしない。
- **正本**：[Google Drive設計書](https://docs.google.com/document/d/1nThmsAhxtVt-Bs5_NzGLqxMghSBxN2unNalcwn9Z1_g/edit)第44節（方向性）、第45節（実装内容）。
- **進捗：40/100（据置）**：主要固有アクションの初版はできたが、実機と連続操作・街の自由度・群れAIは未完成。次回はAndroid縦横の入力／GPU画質／実際の三角飛びの位置関係とコリジョンを優先確認。その他のゲーム・ブログは対象外。

## 2026-10-31｜初期から派手な固有アクション・成長でさらに強化（承認済み）

- 猫：三角飛び・壁利用を初期から使用。成長に伴い連続性・空中制御・自由度を強化。
- 狐：超高速疾走・急加速・急旋回を初期から使用。成長すると速度・持久力・精度を強化。
- 狼：重量突進・噛みつき・咆哮を初期から使用。成長すると威力・群れとの連携を強化。
- 旧「能力を使うにはレベル解放を待つ」設計は採用しない。具体数値は実プレイで調整。動物らしい四足の姿、地形との接地、弱点とスタミナは維持する。
- Google Drive正本の第44節（合意）・第45節（実装）にも記録。固有アクションの初版はgame.jsとWebGL3Dへ実装済み。実機の触感と群れAIは未完成。進捗40/100据置。

## 2026-10-31｜最新決定：GTA級の自由探索＋動物らしさを保った超誇張アクション

- **ユーザー確定**：ミッション強制なしで廃東京を自由に動き、食料の横取り、狩り、逃走、群れ、巣、縄張り、子育て、屋上／地下の探索を好きな順に遊ぶ。動物の生活と一族の成長が中心で、ARKの謎は探索から自然に発見する。都市と野生動物がプレイヤーの行動に反応すること。
- **ゲームだから誇張しまくる**：現実の生物学的な移動速度・ジャンプ力を上限にしない。動物の身体、踏み切り、壁蹴り、爪、噛みつき、体当たりとして読めるなら派手な超高速／超跳躍を歓迎。人間の立ち格闘・銃・車運転や魔法のような超能力には変えない。位置・接地・当たり判定は一致させる。
- **猫**：壁→壁→屋上へ三角飛び、短い壁走り、空中急転換、急着地、狭い場所への侵入。地形利用が得意。**狐**：地上を圧倒的な速度で疾走し、急加速・急旋回・スライド停止・長い飛びつき。匂いと追跡。**狼**：大きな踏み込み・重量突進・強い噛みつき・咆哮・群れによる包囲。3種それぞれ別の操作感と攻略経路を持つ。
- **廃止／再導入禁止**：動物の身体能力で移動性能を制限する発想、強制的な一本道の任務、旧△ガード・旧×食事、左上の方向矢印／巨大ガイド矢印／長い線、2.5Dを完成基盤とする指定、相談開始だけで毎時タスクを止める古い手順。PS式△行動／□飛びつき／○ジャンプ／×5段ラッシュ、WebGL3D、巣・保存・世代交代・PvE保護は維持。
- **Google Drive正本へ保存済み**：設計書（ID: 1nThmsAhxtVt-Bs5_NzGLqxMghSBxN2unNalcwn9Z1_g）の第41〜43節に今回の会話・確定方針・具体的な3種族の技・廃止ルールを記録。古い「現実を超えない」上限文言を修正。旧ガード・旧ナビ・旧2.5D前提の使わない指定を整理。
- **方向性は確定**：初期から能力使用・成長で強化。猫LV1で2回の三角飛び、狐疾風初期2.32倍、狼の突進LV1距離165は初回実装値。今後バランステストで調整。**未完成**：群れ連携AI、本格自由探索、実AndroidとGPU実画面。実際の天候時間・ARKの真相は未確定。進捗40/100（据置）。

## 2026-10-31｜ゲーム方針確定：生存・一族の成長＋自然な探索・ARK物語の両立型

**ユーザーが明示確定した方針**：「動物の生存と一族の成長を中心にしながら、東京の探索とARKの物語が自然に進む両立型」。前者を主役とし、物語の強制クエストに従わずに生きるだけでも遊べる。東京の自然な変化や狩り／家族を通じてARKの手がかりを発見し、発見しなくても世界は継続。動物が人間の文字を読んで判断する形式にしない。既存の一族全滅後にも東京が続く仕様、生前操作交代、PvE保護を維持。

**ゲームの中心ループ（今回の具体化案。以下の数値・新機能は未承認）**
1. 短期5〜15分：餌／水を探す→匂いや足跡で獲物／危険を知る→隠れる・飛びつく・逃げる→食べる／安全な巣へ持ち帰る。食料が狩場・季節・時間・天候で変化し、敵同士も争う。
2. 1プレイ30〜60分：巣の安全と備蓄を整える→縄張り・仲間・子どもを守る→必要なら別地区へ移住。成功は日数やポイントの達成ではなく、目に見える家族の変化と増えた選択肢。
3. 長期2〜4時間以上の活動：子どもが成長し、親が生存中に成熟子へ操作を切替。親は生活し、戻ることも可能。死者は復活せず家系図に残る。一族全滅時は世界を初期化せず別の一族で再出発。
4. 探索：餌不足・動物の移住・増水・停電・地下からの風・特殊な匂いで東京の新しい経路を発見→ARK管理施設の痕跡が見つかる。物語を強制進行しない。
5. 大きな物語：ARKが人類消失とどう関係するかを段階的に発見、都市の管理機能と自然の共存に関する複数の結末を検討。具体的な真相／決断と結末はユーザーと協議するまでは未確定。エンディング後も動物・季節・世代は継続。

**動物と敵の役割案**
- 操作開始は狐（匂い・奇襲）、猫（高所・隙間・回避）、狼（群れ・追跡）の3種で違いを遊びに直結。将来は狸・犬・鹿・猪・カラス・フクロウ・魚類など地形に応じて拡張。
- ネズミ・ウサギ・ハト：食物や逃走行動が異なる小獲物。野犬：群れで追い詰める。猪：縄張りに近づくと突進。カラス：死肉・警告。フクロウ：夜の捕食。大型の固有ボス（隻眼狼、巨猪等）は各地区に生活圏を持ち、固定リスポーンしない。
- 敵が常にプレイヤーを追う設計を避ける。餌・水・群れ・休息・負傷・警戒・天候に応じて行動。敵同士が捕食・逃走し、戦わない選択が成立すること。

**時計・天候の変更方針案**
- 現実85秒＝東京1日という現行試作は変更対象。既存設計書の試案「現実60分＝東京1日、1季節14日、1年56日」を初期比較候補とする。世界時計と一族の個体寿命時計を分離し、ログアウトだけで一家が老衰全滅しないこと。
- 通常天候は晴れ・曇り・小雨・雨・霧・強風、希少な雷雨・熱波・雪など。日付に固定せず、地域・前の天気・季節・時間帯による重み付き不定期遷移。小雨で足音が隠れる一方、匂いが弱まり、雷雨で避難が必要。酸性雨は通常の雨と別の希少ARK異常現象。危険天候には雲・遠雷・鳥の行動などの前兆と避難策を設ける。確率・1回の持続時間はプレイテスト後に決定。
- 一般的な危険を予測不可能な即死にしない。脱水・寒さはHUDを増やし過ぎず、状態異常や行動への影響を分かりやすく説明。

**最初に完成させる実装範囲案**
- 第1歩：今ある1地区・3種の実GPU/Android操作を復旧確認。狩り・草むら・雨・夜間が本当に違うか、短い生存ループを検証。
- 第2歩：巣の備蓄、捕食者防衛、仲間AI・食料運搬がつながる生活を実装。
- 第3歩：子どもと成長、AI親子、家系図、生前交代・死亡後の引継ぎ。
- 第4歩：生態系の永続保存、地域追加、天候・災害とARK施設の手がかり。外部バックエンドがないのに共有MMOを完成扱いしない。

**協議が必要な未確定事項**：東京の1日を実60分に固定するか／個体の平均活動寿命20〜32時間の厳しさ／子ども・育児負担の程度／ボスと最終的なARKの結末。これらは今回のユーザーによる「両立型」選択だけで自動確定したものではない。今後勝手に全面的な時計変更や永久死亡を適用しない。

今回は設計の記録のみで、ゲーム実装やmain以外のプロジェクト変更は行わない。ゲーム進捗：40/100（据え置き）。

## 2026-10-31 16:13 JST｜横画面タッチ不能・縦画面復帰の緊急修正（40/100据置）

Android横画面で音／地図／全画面／ズームが右上で重なり、縦へ戻れない問題を最優先修正。横画面では右上にポーズ（上段）＋音・地図・全画面（下段44×40px、絶対配置解除）を置き、ズームを下中央へ移動。任務欄を上から122pxへ移し、HUDの幅を調整。全画面ボタンの自動横固定を削除。ポーズ画面内に「縦画面に戻す」（縦向きでは「横画面にする」）を追加し、端末が許す場合のみユーザー操作でscreen.orientation.lock()、全画面解除時はunlock()。非対応時は自動回転の案内。上部のタイトルボタンは追加せず、ポーズの「再開」「タイトルに戻る」は維持。既存4ボタン・音・地図・全画面・ズーム・カメラ・ゲーム内容は変更しない。

QA：JavaScript全文構文、CSS括弧、DOM要素とキャッシュ参照、横768×345／844×390／640×320と縦390×844の想定配置、全画面開始時に自動横ロックしないこと、縦回転操作・全画面解除時unlock、失敗時案内を確認。Android実機・実GPU・FPS・端末固有のscreen.orientation対応は未検証。**進捗40/100（+0）**。対象neo-wild/のみ。

## 2026-10-31 15:43 JST｜放置車両に向かう導きの光の経路修正（品質改善、40/100据置）

**不具合**：新しく追加した放置車・自販機・バリケードは`collides()`で移動を止めるが、`routeClear()`は建物だけを見ていた。この不整合でA*の移動候補やプレイヤー近くの小さな導きの光が、通行不能な車両を突っ切る方向を案内し得た。

**修正**：`game.js`の`routeClear()`へ線分と円形障害物の最短距離判定を追加。車・自販機・バリケードは実移動判定と同じ`prop.r+8+actor.r*0.40`で通行不可とし、A*の辺判定と直線誘導の両方を整合。自転車と看板は従来どおり通行可能。建物の経路判定、誘導光5粒、任務、PS式4ボタン、ポーズのみの上部UI、地図・音・全画面、鳥、縄張り、個体数は変更しない。

**QA**：全文JS構文検査PASS。実コードから`collides/routeClear/navSetup/routeTo`を抽出した独立実行で、狐/猫/狼の当たり半径16/19/24、車・自販機・バリケードの直線遮断とA*迂回、経路の各辺の通行可能性、自転車・空き道路・障害物なしを含む121アサーションPASS。ポーズ・タイトルへの復帰、WebGL分岐、初期10+任務1・上限13の不変条件は静的チェックPASS。**本検証はブラウザ画面・実GPU・Android実機・FPS・音の実聴・長時間プレイではない**。進捗40/100（+0）。game.js main commit `78acae415cdf2edf012c598b24e0be515d8f2af2`。

**未決定・要相談**：敵の種類と生態、昼夜の進み方、成長・寿命・死亡と世代交代の厳しさ、ゲームの長期目標。ユーザーと合意するまで大幅な仕様増築はしない。次回は実ブラウザ相当の見た目・タッチ・誘導光の位置と、ポーズからの再開を回帰QAし、明確な重大不具合を1件ずつ修正。毎時タスクはON維持、対象neo-wild/のみ。

## 2026-10-31｜画面上部は「ポーズ」のみ・タイトルへ戻るのはポーズ内（最新の明示指示）

ユーザーが「ポーズだけでいい」「ポーズしたらタイトルにもどるがあるやろ」と確定。最初に追加した上部「タイトル」ボタン・別のタイトル確認画面は撤去。**画面上部は「ポーズ」だけを置き、押すと既存ポーズ画面の「生存を再開する」「タイトルに戻る」の2択を使う**。タイトルへの移動はポーズ画面内の既存ボタン1か所のみ。再度上部にタイトルボタンや2段階確認を追加しない。既存の地図・音・全画面ボタンは維持。

GitHub main修正：index.html `225482093a67ec60c323050bdafbebfa41b57805`、game.js `b5b88a2639a2370d2108b4b38e51a7f175232581`、visual.css `b85af43fbce38637cb570da9b43ce0bfcfb9876b`。構文と画面要素の静的検査PASS、狐猫狼各1ケースで「開始→ポーズ→再開→ポーズ→タイトルへ戻る」の模擬操作PASS。実Androidタッチ表示は未検証。進捗40/100据置。

**次にユーザーと話し合う（未決定）**：敵の種類・行動、昼夜と時間進行、ゲーム全体の着地点、成長/世代交代/死亡の厳しさ。大きな決定を勝手に確定せず、既存Drive設計との違いをユーザーに明示し優先順位を相談する。新たな敵種や時計の大幅変更は設計合意まで保留。

## 2026-10-31｜ユーザー直接指示：動物の大きなモーション・音・自然な誘導・ズーム・街と鳥・敵の見分け・東京タイトル背景

**最新指示**：動物の身体全体に大きな動きを出す。電子音をやめて世界観に合うBGM／効果音。任務欄の意味不明な矢印を廃止して、プレイヤーの近くに目立たないキラキラの誘導。もっと引いて周囲を見渡せる画面。車・自転車などがある廃東京、飛ぶ鳥、分かりやすい敵。タイトルに東京ジャングル的な雰囲気のオリジナル画像を使う。既存作品のゲーム画像や公式素材のコピーは禁止。

**今回mainに実装**
- `game.js`：画面内プレイヤーの近くに5粒の小さな薄い導きの光。障害物迂回地点へ向く。旧左任務欄の`nav-arrow`文字は削除して距離だけ表示。長い点線・巨大矢印・攻撃の線は復活させない。
- `game.js`：標準ズーム80%、下限47%、上限160%、画面上の＋／−、PCの＋／−とマウスホイール、指2本の拡大縮小。WebGLシェーダーのズーム範囲も更新。
- `game.js`と`webgl3d.js`：動物の全身の上下動、前脚の振り出し・持ち上げ、胴体の伸縮・首の前後動作を拡大。攻撃5段の姿勢は保持。
- `game.js`と`webgl3d.js`：初期配置で約28個の車・自転車・自販機・バリケード・看板など。3DとCanvas2Dの両方で可視化し、大きな障害物に当たり判定を付与。巣の近くを塞がないよう配置。道路のオブジェクトの密度は性能と実画面で今後調整。
- `game.js`と`webgl3d.js`：街中の空を飛ぶ鳥10羽。3D翼とCanvas2D翼の上下動、移動、プレイヤーに近づくと飛び立つ動きを追加。鳥は狩猟対象の上限13頭には含めない。
- `game.js`：近くの野犬、イノシシ、アルファが名前で区別できる控えめな表示。負荷や画面の混雑を避けるため遠方は非表示。
- `game.js`：外部音源を借用せず、WebAudioでオリジナルの風・低い環境音・足音（道路と草の違い）・噛みつき・ジャンプ・羽ばたき音を生成。音量ON/OFFを連動。**収録音素材を使った本格BGM・動物音声ではなく、現段階はオリジナル合成音**。誇張せず今後実機で音を聴いて調整。
- `title-tokyo.svg`（新規）と`visual.css`（新規）、`index.html`：完全オリジナルの廃東京（廃車・高層ビル・植物・キツネ・夕暮れ）タイトル背景画像。ユーザーからの「東京ジャングル風」の世界観のみ参考にし、固有ロゴ・公式キャラクター・既存画像の複製はない。ゲームの描画と分け、タイトルメニューにのみ適用。キャッシュ更新済み。

**テスト結果**：
- JavaScript構文検査とHTML・画像参照・旧HUD矢印消去・ズーム・既存のPS式4ボタン、5段ラッシュ、巣、縄張り、野生動物の初期10＋任務1／上限13／近傍4／補充3.6秒の確認PASS。
- 3動物×縦390×844／横844×390／PC1280×720×Canvas2Dと模擬WebGLの18ケースで起動、ズーム55%、3分相当の更新描画、鳥移動、マップ開閉、個体数上限PASS。街のオブジェは28個、鳥10羽を確認。
- 模擬WebGLの9ケースでは、車や屋外設備を含む静的メッシュと鳥・動物の動的メッシュが正常な有限頂点から生成され、描画API呼出しが成功。
- **実Chrome GPU／Android実画面、FPS、画面の重なり、音の聴こえ方、主観的なゲーム性は未検証**。ヘッドレスChromiumのシェーダー確認は終了せず、実GPU検証済みとは主張しない。低ポリモデルはリアルな3D品質に達していない。

**次回優先**：実Chrome・Androidで見た目／タッチ／音／FPSを目視QA。車・自転車の配置と当たり判定で道が塞がれないか、鳥が実画面で飛んで見えるか、5段攻撃で胴・脚・頭が大きく動いて見えるか、キラキラ誘導が邪魔しないか、ズームで操作しにくくならないか。結果に従って修正し、実機未検証を完成扱いしない。既存タスクONを維持、neo-wild/以外不変更。

**進捗：40/100（据え置き）**。大幅な見た目の仕様追加だけでは無検証の完成度を上げない。

## 2026-10-31｜縄張り標識3地点の確保・巣への実利連動｜進捗40/100（+5）

**新規実装**：巣LV2から、東京の西（1410,1170）・東（2320,1170）・南（1860,1890）の道路沿い3地点を縄張りとして確保できる。地図とミニマップに未確保／確保済みの標識を表示。標識の近くで敵の捕食者を追い払い、地上で持久力20を消費して△長押しで印を付ける。既存の△食事・運搬・巣LVアップ、×5段ラッシュ、□飛びつき、○ジャンプを保全。食料が近くにある場合の△長押しは運搬を優先し、巣内では巣LVアップを優先。確保済み地点の重複消費は禁止。

**ゲーム上の効果**：確保1地点ごとに巣の安全な休息時のHP回復を毎秒+0.9。プレイヤーが確保済み地点を守る間は野犬が接近をためらい退避（猪・アルファは抑止できない、攻撃予備動作中の敵も即停止しない）。翌ゲーム内日以降、各地点に小さな木の実キャッシュを1日1回生成（近くに食料があるときは生成を抑制）。確保状態は動物種別ごとにlocalStorageへ保存し、再開始後も保持。サーバー共有・PvP領有権ではない。

**QA**：game.js全文構文PASS。狐・猫・狼×スマホ縦390×844／横844×390／PC1280×720のCanvas2D相当9ケースPASS。各ケースで初期11頭、LV2での△長押し確保、持久20消費、重複確保時の二重消費なし、種族別localStorage保存、巣の回復量増加、翌日木の実1回生成、犬だけ退避・猪には無効、HUD・地図・ミニマップ・更新ループを実行確認。別途、3種族×3画面の**模擬WebGL 9ケースPASS**（建物・肉・木の実・動物メッシュ、stencil+GREATERの半透明パス、LEQUAL復元、空食料シーン）。**実GPUピクセル表示、Android実機タッチ、FPS、長時間の生存バランスは未検証**。既存の獲物密度10+1、上限13、近傍4、3.6秒補充を変更せず。

**main SHA**：game.js `9ef007ca84dc43e26e9a30cf6c5efe2de277f8d9`、index.html `d71c733b29690dd460acc6d950681fb20f64d763`。次回は3地点の捕食者防衛・移動導線・スマホ操作の実機相当回帰を強化し、次の完成機能（仲間AIまたは世代）へ進む。neo-wild/以外は変更禁止。毎時ON継続。

## 2026-10-31 14:05｜最新ユーザー修正：△食事・行動／ナビ／肉の3D奥行き／ビル遮蔽シルエット｜進捗35/100（前回33から+2）

**最新仕様（第38節の旧ガード方針・ナビ禁止より優先）**：PS式△は短押しで食べる・巣への預入・備蓄補給、長押しで運搬・巣の成長。状況ラベルは食べる／預ける／補給／行動。×は常に5段ラッシュ、□飛びつく、○ジャンプ。PC Vガード・ジャストガード・カウンターはゲーム入力・ダメージ・スタミナ・状態から削除。旧ガード仕様を復活させない。

**ナビ**：任務欄に小型8方向矢印（↑↗→↘↓↙←↖）と残距離を追加。getObjective()→guidancePoint()→routeTo()の障害物迂回点を優先し、VIEWの回転・ズームに追随。地図・ミニマップを維持。巨大矢印・追跡点線・攻撃線は追加していない。

**肉・アイテムの奥行き**：従来の3D表示上へCanvas2Dで肉・木の実を描く処理を廃止。WebGLのfoodMeshで地面に接する低い3D肉／木の実を生成し、建物・地面・動物と共通の深度バッファで描画。建物の裏の動物・食料は、WebGLでは静的建物描画後にGREATER深度テスト＋stencil 1画素1回の約25%透明パスを描いてから通常描画。透明が重なって白くなる問題を抑止。Canvas2Dでは建物の投影輪郭にクリップした25%のシルエットを後描き。屋上プレイヤーを自分の建物が隠す判定を除外。潜伏中の透明度は掛け算で維持。WebGLにstencilがない環境は通常の深度描画へ安全に退避。

**QA実施**：game.js/webgl3d.js全文構文PASS。狐・猫・狼×縦390×844／横844×390／PC1280×720×Canvas2D・模擬WebGL＝**18ケースPASS**。各ケースで起動（初期11頭）、△短押し食事、×押下で誤食事なしの攻撃、任務ナビ更新、巣外で運搬→巣で預入→localStorage保存→巣LV2、地図開閉、更新・描画、動物上限13、Canvasの建物シルエットclip呼び出しを確認。さらに3種で5段ラッシュ①〜⑤と持久力42消費・食料非消費を確認。**模擬WebGL API**で肉2種の3D頂点生成、静的建物→stencil/GREATER透明パス→LEQUAL通常描画の呼び出し・深度状態復元を確認（実GPU描画ではない）。

**未検証**：実Chrome GPUのピクセル画像・遮蔽の見た目、Android実機の複数指入力、FPS・負荷、長時間のゲームプレイ、屋上・潜伏の見た目。模擬テストだけで完全修復とは断定しない。次回は実GPU/Androidの表示確認が可能なら最優先し、無理なら半透明と肉の位置の回帰を増やす。旧ガード復活・×の食事への転用は禁止。

**mainのファイル最終変更コミット**：game.js `d4560c838ce636b8771636dbcb61d58df07935ac`、webgl3d.js `034ad86d845c2682075ee0887789b51fe6938664`、index.html `53a784b38c60f48bdb2ecb8badf2731455332b3b`、style.css `75eedf348cbbe93f314ca863348d4480aab9ac23`。Drive設計正本に第39節を追記。対象はneo-wild/のみ。毎時タスクON維持。

## 2026-10-31 14:05｜ユーザー最新修正指示（旧ガード／ナビ禁止を失効）

最優先：△食べる・行動、×常時5段攻撃、□飛びつく、○ジャンプ。画面内小型8方向ナビ＋距離。肉・食料はWebGLの深度付き3Dへ移動。ビルに隠れた全生物と食料を約25%透明で位置表示。既存ガード／ジャストガード／PC Vは削除。旧仕様を復活させない。実装・QA・main SHAが揃うまで完了としない。

## 2026-10-31｜ジャストガードと噛みつきカウンター（第3段階）｜進捗33/100（+1）

**実装**：△／PC Vを押した直後0.15秒の正面ガード成功で、被ダメージ0・敵の攻撃中断・0.65秒の反撃受付を追加。ガード解除後に×／Jを押すと短い予備動作の噛みつきカウンター（通常初段比約1.37倍、持久10）を1回発動し、その後は既存5段ラッシュに接続する。ガード中の通常軽減（65%）は維持。ジャストガード再発動には0.65秒の待ち時間を設け、連続無敵化を防止。犬／猪／アルファの攻撃時は敵ごとに短い硬直を与え、突進も止める。カウンターの敵よろめきは0.32秒で、永久スタンを禁止。被弾時・画面切替時の入力とカウンター状態を安全に解除。既存のPS式4ボタン・5段ラッシュ・飛びつき・食事・巣・マップ・カメラ・野生動物数は不変更。

**QA**：game.js全文のJavaScript構文PASS。狐・猫・狼×縦390×844／横844×390／PC1280×720×Canvas2D／模擬WebGLの**18ケース・144状態確認PASS**。各ケースで正面ジャストガード→敵硬直→ガード解除→噛みつき反撃が実際にHPを削ること、1回だけ反撃判定、連続ジャストガード抑止、ポーズ相当の操作リセット、模擬描画を確認。HTMLのキャッシュを更新。さらに公開後の追加回帰で狐・猫・狼×縦横PC×Canvas2D/模擬WebGLの18ケース・144確認を実行し、食事→任務進行、巣外での食料拾得→巣への預入→localStorage保存、地図開閉、ジャンプ、更新・描画、初期11頭／上限13頭を確認し全件PASS。**実Chrome GPUのゲーム全体・Android実機・FPS・動物のモーション見栄え・主観的戦闘難易度は未検証**。模擬WebGLは実GPU検証ではない。

**mainコミット**：game.js `bd839c723ebef4da8897c3eb4bc3d755bcd14903`、index.html `c826d12f5cda92149b3c5419d43ee0e25e01564b`。次回は敵のフェイント／側面回避／ガード崩しを、明確な予兆と反撃可能性を保って実装・回帰QAする。対象neo-wild/のみ、毎時ON。

## 2026-10-31｜5段ラッシュ第2段階｜進捗32/100（+1）

**実装**：×連打で左前脚→右前脚→噛みつき→後脚蹴り出し→体当たり。rushStep/rushWindow/rushQueuedを追加し、狩猟キル連鎖P.comboから独立。1件の先行入力、終了後0.45秒まで継続、1段1回の接触判定。第38節の倍率0.65/0.75/1.0/0.9/1.45、持久5/5/8/10/14を採用。5段目は硬直増、被弾・ガード・疲労で連鎖中断。Canvas2DとWebGLの既存四足モデルに左右前脚・噛みつき・後脚・体当たりの姿勢差を反映。敵スタン耐性・狩猟・巣・保存・動物数を維持。

**QA**：JS構文2件PASS。5段遷移、5段後・時間切れリセット、コスト・倍率、2D/3D姿勢条件、P.combo保持の単体・静的確認。さらに狐・猫・狼×スマホ縦390×844／横844×390／PC1280×720×Canvas2D／模擬WebGLの**18/18統合ケースPASS**。各ケースで開始→画面描画→攻撃中の次入力予約→更新ループで2段目発動→被弾相当の中断で連鎖リセット→動物上限を確認。**実Chrome GPU・Android実機・FPS・実際の動物モーションの見た目・操作感は未検証**。模擬WebGLを実GPU検証とは扱わない。次はジャストガード/敵反撃。

**main SHA**：game.js `689e7c0439c400152de9275552baf9b8ecfa761f`、webgl3d.js `d9e69b5f193920c2981213ec6ff66e56ca40a871`、index.html `7578ee21e1b9e3828c0e66ce068c9a88a0343e79`。neo-wild/のみ、毎時ON。

## 2026-10-31｜PS式4ボタン＋交戦優先の×操作（第一段階）｜進捗31/100（+1）

**実装**：右下△ガード、左□飛びつき（0.45秒長押し種族能力）、右○ジャンプ、下×攻撃／非交戦時食事・預入・補給（0.55秒長押しで拾う／巣育成）に統合。旧食事・本能・運搬の追加丸ボタンと巣育成HUDボタンを撤去。×は交戦中・近接獲物・直前3秒の戦闘で攻撃を優先。指ごとに押下を管理し、攻撃長押しの自動連打を止め、短押しは1回だけ実行。△は正面ガード（被害を約65%軽減・持久消費）を暫定実装、ジャストガードと反撃は後続段階。PC既存キーは維持しVでガード。各顔ボタン56CSS px、横画面50CSS px。移動・視点・ズーム、巣・備蓄・既存狩猟機能を維持。

**検証**：JS構文PASS、4ボタンID・旧ボタン撤去・カメラ・獲物密度の静的回帰PASS。狐・猫・狼×縦390×844／横844×390／PC1280×720×Canvas2D/模擬WebGLの18起動ケースで、12フレーム以上の描画、△押下中のガードと解除、×短押しの非交戦食事・交戦時の誤食事防止、×長押しで巣LV2への成長を実行し全18ケースPASS。WebGLは模擬レンダラーであり実GPUではない。実Android・ゲーム全体WebGL/FPS/見た目/操作感は未検証。次回は5段ラッシュの独立連鎖状態と3種族モーションを実装し、統合テストを強化する。**進捗31/100（+1）**。対象neo-wild/のみ。

## 2026-10-31｜新戦闘設計：リアル動物×5段ラッシュとPS式4ボタン｜設計確定・実装待ち（30/100）

ユーザーが「動物としてリアルな見た目 × 如く風コンボ」の融合とPS式4ボタンの採用を決定。Google Drive設計正本の**第38節**に具体仕様を追記・確認済み。**これは設計の記録であり、コード実装済みとは扱わない。進捗30/100据置。**

**操作**：右下ひし形の△ガード（長押し・押下直後ジャストガード）、□飛びつき（長押し種族固有能力）、○ジャンプ、×連打ラッシュ／非交戦時の食事・持ち帰り・巣操作。移動スティックとドラッグ回転・2指ズームを維持。不要な既存の丸ボタンを整理し、4つの主要ボタンを最小48pxのタッチ領域で配置。×の行動は交戦中の攻撃を優先して誤食事を防止し、巣・死骸の長押しで運搬／巣メニューを扱う。PC既存キーを維持し専用ガードキー追加。

**5段**：左前脚→右前脚→噛みつき→後脚キック／蹴り出し→体当たり・押し倒し。猫は後脚で掴んだ相手を蹴る、狐は機敏な噛みつきと跳び込み、狼は肩・胸で制圧。四足歩行・足の接地を維持、二足格闘の模倣禁止。攻撃ごとに予備・命中・戻りの独立モーション、短い先行入力受付を実装。既存P.comboは狩猟キル連鎖なので、攻撃用rushStep/rushBufferを別管理。連打無敵・敵スタンロックを防ぐ。ガードは正面限定でスタミナを消費、ジャストガード後に反撃窓。犬の側面移動、猪の突進、アルファのガード崩しを明確な予備動作付きで実装。

**実装順**：1) 4ボタン＋×の交戦/食事/運搬の安全な入力整理、2) 5段モーション・命中判定・コンボリセット、3) ガード・ジャストガード・敵反撃、4) 3種族の差・WebGL/Canvas2D整合・実機QA。各段階は個別にコード変更→テスト→mainコミット。既存の巣LV3・備蓄・狩猟・任務・潜伏・ジャンプ・地図・カメラ・保存・密度を保全。巨大矢印・線エフェクトを復活させない。Android実機とゲーム全体WebGL・FPSはまだ未検証。**新戦闘の進捗加算は実装・回帰QAの結果に基づく。**

## 2026-10-31｜巣LV1→LV3成長・安全な休息範囲の拡張｜進捗30/100（前回比+5）

**実装**：巣内で「巣を育てる」ボタン／Hキーを押し、備蓄60でLV2、120でLV3。備蓄上限200→300→450、休息範囲半径90→125→165、敵が近くにいない場合のHP回復速度2.8→4.5→6.5/秒。地図に巣LVと休息範囲を表示。種族ごとに巣LV・備蓄をlocalStorage保存、既存の備蓄セーブと互換。持ち帰り・食事・狩猟・潜伏・ジャンプ・回転・ズーム・既存任務は維持。縄張りの敵AIやオンライン領有権はまだ未実装。

**QA**：JS構文PASS。狐・猫・狼×縦390×844／横844×390／PC1280×720×Canvas2D／模擬WebGLの18ケースで、起動、巣外での強化禁止、備蓄消費、LV2/LV3効果、Hキー、最大LVでの重複消費防止、休息回復、食料拾得・預入、地図開閉、再開始後のセーブ、更新・描画PASS。HTMLの新ID一意・CSS括弧・野生動物初期10＋任務1・上限13・近傍4・補充3.6秒の定数不変を確認。**実Chrome GPU・Android実機・FPS・屋上チラつき・動物体型の見栄え・主観的戦闘難易度は未検証**。

**main SHA**：game.js `5562f07f06c2871de7d947f37b014a307dae5d23`、index.html `945627ed92824a22a5b7a53112de86142d64215c`、style.css `1726e0c24c64e57391015d695fb946ebdc9b8ff3`。進捗30/100（前回25から+5）。次回は敵AIと縄張りの相互作用、仲間AIを段階的に実装。毎時ON。neo-wild/以外変更禁止。

## 2026-10-31｜停滞解消：巣への食料運搬・備蓄・補給を実装｜進捗25/100（前回比+5）

**原因と開発方針変更**：以前の自動開発プロンプトには「進捗20/100据え置き」「大型機能追加禁止」が繰り返しあり、画面調整だけが増えた。ユーザーが長期停滞を指摘。毎時自動開発の指示を更新し、重大バグを直しつつ巣・仲間・世代・生態系等の実機能を完成単位ごとに実装し、進捗は確認できた達成事項だけ加算する。タスクON継続。

**今回の実装（neo-wild/のみ）**：現行の緑色の休息地を拠点として利用。地上の食料に近づき、PCのGキー／スマホの新「運ぶ」ボタンで1個の食料を拾う。持って巣に戻って同じ操作をすると200単位まで備蓄。巣で荷物が無く空腹のときは同じ操作で備蓄から補給し、空腹・体力を回復。備蓄量は3種族ごとにlocalStorageへ保存し、死亡・新規開始後も保持（**世界全体のセーブを実装したわけではない**）。HUDに「巣 備蓄/200・運搬量」を表示。既存の食事ボタンは維持し、運搬操作と分離。携行食料は1個まで。高所・空中で地上の食料を取得できない。

**今回の試験**：ゲームJSを構文チェック。拾う→持ち帰る→備蓄→備蓄から回復の状態単体試験PASS。最新game.js全体を模擬DOM/Canvas環境で実行し、狐・猫・狼×スマホ縦390×844／横844×390／PC1280×720の9ケースで開始（初期11頭）、Gキーで拾う・巣へ預ける・10フレーム更新・2D描画・再開始後の備蓄持続を確認し9/9 PASS。HTMLの新ID一意性とCSS括弧構造、WILDLIFE初期10＋任務1・最大13・近傍4・補充3.6秒の定数不変を確認。WebGL実描画、Android実機タッチ、FPS、屋上チラつき、見た目と戦闘難易度は**未検証**。模擬実行を実機確認と呼ばない。

**mainコミット**：game.js `6649f819abdca59c696073504590bea8c73c8957`、style.css `27e8ccdca2c46a39cbd659e5c698c5b629db9a34`、index.html `e873b55c15e71e327adead70d496e702f4ea4e1b`。

**進捗：25/100（前回20から+5）**：単なる見た目の補正ではなく、食料を巣に運び、蓄え、消費できる新しい生存行動を追加したため。未実装は巣の拡張/縄張り、仲間、繁殖・世代、共通世界とオンライン保護、ARK、生態系・災害・陸空水、実機総合QA。次回は備蓄の明確な用途と巣成長を安全な1単位として実装する。対象neo-wild/のみ、毎時ON。

## 2026-10-31｜回転・ズーム時の2D建物と3Dプレイヤー表示位置のずれを修正

**コード上の問題**：前回のWebGLズーム高さ修正後も、Canvas2Dの屋上・ジャンプの高さが固定倍率のままで、3D描画上の「YOU」・足元リング・潜伏中ラベルもズーム時に高さが合わなかった。高所で目印が地面に残る場合がある。

**今回の修正**：game.jsの2D屋上と動物の高さ投影をカメラズーム0.7〜1.5倍に合わせ、WebGLの高さ係数0.93と一致させた。3Dの「YOU」・足元リング・潜伏ラベルも屋上／ジャンプ高度とズーム倍率を反映。index.htmlのgame.jsキャッシュ更新。屋上衝突・獲物数・戦闘・操作は不変更。

**QA**：JS構文検査PASS。視点6方向（0/45/90/180/270/360度）×ズーム3段階（0.7/1.0/1.5）×高度4段階（30/46/60/200）の計72ケースで、Canvasの高さ移動が水平0・垂直-0.93×高度×ズームとなり、WebGL高さ投影と数値一致。実ゲーム全体の起動・Android実機・Chrome GPU画面・FPS・屋上チラつき・動物体型の見た目・戦闘の面白さは今回未検証。数値試験を実機確認と混同しない。

**mainコミット**：game.js `b5ad26bbec5a6bf89f3d913782253e68e412f171`、HTML `e73516f4b09df9afe5c5149c7de8f10cfb18ac47`。次回は実GPUで高所・回転・ズーム・HUD・攻撃を目視QA。neo-wild/以外は不変更。毎時ON、**進捗：20/100（据え置き）**。

## 2026-10-31｜ピンチズーム時の3D建物・ジャンプ高度の縮尺不一致を修正

**確認したコード上の不具合**：カメラのズーム倍率は地面のX/Y投影だけに反映され、WebGLの建物・屋上・動物ジャンプの高さ（Z軸）には反映されていなかった。そのため、拡大・縮小すると地面と立体物の比率が変わり、立体感・深度の整合が崩れる。既存の360度回転、屋上0.8単位分離、戦闘・体型改善は二重適用しない。

**今回の修正**：game.jsから3D描画へcameraZoomを渡し、webgl3d.jsの頂点シェーダーでZ軸の画面高さと深度の双方に同倍率を適用。ズーム範囲0.7〜1.5倍、既存の高さ・衝突・屋上設備位置は変更しない。index.htmlの両JSキャッシュを更新。neo-wild/以外は不変更。

**QA**：両JSの構文検査PASS。模擬WebGLでズーム0.7／1.0／1.5の描画とuZoom値の受け渡しPASS。高さ30／46／60／200の12ケースでZ軸縮尺の数値一致PASS。Chromium 144の実GLSLコンパイル試験はEGL初期化失敗・起動タイムアウトのため未完了。**実Chrome GPUのゲーム全体描画、Android実機、屋上・道路のチラつき、動物の見た目、FPS、戦闘の難易度は未検証**。モック結果を実GPUの検証と混同しない。

**main SHA**：game.js `5f10ffca3a25f471d6b510eb3d9be0337b738c61`、webgl3d.js `4a9f520afc4ae25acbb6bddd54b4bcb8691256b3`、index.html `840f51f830a6feff226aed9c7ab486097b2e00a3`。

**次回最優先**：実Chrome GPU／Android画面でピンチズーム時の3D高さ・屋上・視点回転・動物体型・攻撃・FPSを確認。実機不可なら統合回帰で再現できた破綻のみ修正。獲物初期10＋任務1、上限13、近傍4、補充3.6秒、不要な矢印・点線・索敵撤去を維持。毎時ON、**進捗：20/100（据え置き）**。

## 2026-10-31｜屋上設備が床から浮く3D表示の修正

**確認した問題**：屋上の装飾床は高さ h+0.8 だが、空調設備2台と壊れた屋上設備の底面は h+6 で、5.2単位浮いていた。屋上のチラつき対策（0.8単位の面分離）はそのまま維持。

**main修正**：webgl3d.jsで屋上設備3か所の底面を h+0.8 に一致。歩行高さ・衝突・屋上面の分離・カメラ・戦闘・動物体型・獲物密度・任務・セーブは不変更。index.htmlの3Dキャッシュ更新。

**QA**：JavaScript構文PASS。模擬WebGLで屋上高さ30の装飾床上面30.8と設備3か所の底面30.8の一致を確認。狐・猫・狼×縦390×844／横844×390／PC1280×720×Canvas2D／模擬WebGLの18ケースで起動・12フレーム描画・視点ドラッグ・ジャンプ・攻撃・地図開閉・初期獲物11・上限13を確認し全件PASS。**実Chrome GPUでのゲーム全体・Android実機・FPS・屋上チラつきの消失・体型の見た目・戦闘の難易度は未検証**。模擬WebGLは実GPU表示の保証ではない。

**main SHA**：3D屋上設備 `b7e18fbf082edced2b7d9c88d85c83036803bad6`、HTML `4df0fa7239c85acd256ebe540e43cbc368d102eb`。次回は実Chrome GPU／Androidの3D表示と操作を最優先に確認。対象neo-wild/のみ。毎時ON継続、**進捗：20/100（据え置き）**。

## 2026-10-31｜3D動物の足先が地面に埋まる問題を修正

**再現**：脚の中心が体格半径の0.29倍に対し脚の縦半径が0.35〜0.51倍で、足先が地面にめり込んでいた。狐・猫・狼・ウサギ・犬・猪・アルファの7種で数値再現。

**修正**：脚中心の高さを各種の脚縦半径に一致させ、歩行と攻撃時の脚の持ち上げは維持。index.htmlの3Dキャッシュを更新。カメラ・屋上・戦闘・獲物数・任務・セーブは不変更。

**QA**：7種×4脚＝28脚の接地高さを修正前後で比較し、修正後の地面貫通0。JS構文PASS。狐/猫/狼×縦/横/PC×Canvas2D/模擬WebGLの18ケースで90フレーム更新、360度回転、ピンチズーム、座標往復、ジャンプ・攻撃・地図開閉・動物上限PASS。**実Chrome GPUゲーム全体・Android実機・FPS・屋上チラつき・体型の見た目・主観的戦闘難易度は未検証**。

**main SHA**：3D脚修正 `18a7be0aa0a708125684869d113d99b9633d820f`、HTML `e9815c7ca5824dabe206afa56deefe9fd08a51c7`。毎時ON継続。**進捗：20/100（据え置き）**。対象neo-wild/のみ。

## 2026-10-31｜重複する攻撃警告と道路交差部の重なりを整理

**確認したコード上の問題**：敵の予備動作に既存の「!」と警告表示がある一方、画面上には別の三角矢印・円弧・廃止済み「回避！」が重複していた。WebGLの縦横道路と白線・縁石は交差部で同じ高さの面が重なり、深度競合の原因になり得た。

**修正**：game.jsから重複する三角矢印・円弧の警告描画を削除し、敵の「!」・予備動作・反撃猶予は維持。無敵時間中の旧「回避！」表示は「無傷」に変更。webgl3d.jsの縦方向道路・縁石・白線だけを0.18単位上げ、交差部の同一平面を分離。屋上・カメラ・獲物密度・操作・戦闘数値は不変更。index.htmlの読み込みキャッシュを更新。

**QA**：JavaScript構文PASS。狐・猫・狼で各90フレームの模擬ゲーム更新・描画、視点ドラッグ・2本指ズーム、獲物上限、WebGL模擬静的メッシュ描画PASS。道路の重なりはコード上で修正したが、**実Chrome GPU/Android実機での道路・屋上チラつき消失、動物体型、FPS、主観的戦闘難易度は未検証**。模擬WebGLは実GPU検証ではない。

**mainコミット**：game.js `2065ed21720cd3c4fa0b2fc589ff97695b004ce3`、webgl3d.js `1611ac08c764dcbe271d254e506bf4c684ad7282`、index.html `3667a8897d2be00a586d7c5cb24de5b78e62d365`。**進捗：20/100（据え置き）**。毎時ON継続、neo-wild/以外変更禁止。

## 2026-10-31｜スマホ複数指の攻撃ボタンが途中で解除される不具合を修正

**再現**：攻撃ボタンを2本指で押した状態で1本だけ離すと、残る指が押し続けていても連続攻撃が停止していた。旧コードは、どの指の離脱でも攻撃長押し状態を解除していた。

**修正**：各アクションボタンが押している指を個別に管理し、最後の指が離れた時だけ長押し解除。2本目の指では飛びつき・ジャンプなどの単発操作を重複発動させない。地図・ポーズ・再スタート時には保持中の指とキャプチャをすべて解放する。屋上・回転/ズーム・戦闘難易度・動物体型・獲物密度の既存実装は変更しない。

**QA**：修正前は「攻撃2本指→1本離す」で長押しfalseを再現。修正後は最後の指が離れるまでtrueを保持。狐・猫・狼×スマホ縦390×844／横844×390／PC1280×720×Canvas2D/模擬WebGLの18ケースで、2本指攻撃、ポーズ後の入力解放、画面回転とピンチズーム、スティックの指所有、90フレーム更新と描画、動物数上限を確認し全件PASS。JavaScript構文PASS。別途、Linux Chromium＋Xvfb＋SwiftShaderで現行GLSLの頂点・断片シェーダーを実コンパイル／リンクし、単一三角形の描画・ピクセル読取[220,44,22,255]・GL error 0を確認。**このWebGL試験はシェーダー単体であり、ゲーム全体の実Chrome GPU描画・Android実機・屋上チラつき・FPS・体型の見た目・主観的戦闘難易度は未検証。**

**mainコミット**：game.js `38c28b285fcc40ef9451b423fa62652de616bd8b`、index.htmlキャッシュ `3bb4c0922160c354175938b2d43daa6f92c84978`。

**次回最優先**：実Chrome GPU／Androidのゲーム全体で屋上、視点、ズーム、動物体型、攻撃とFPSを目視QA。不可なら実ゲーム状態を再現する統合テストで破綻のみ1〜3点修正。初期10＋任務1、上限13、近傍4、3.6秒補充、不要な矢印・点線・索敵撤去を維持。対象neo-wild/のみ、毎時ON、**進捗：20/100（据え置き）**。

## 2026-10-31｜WebGL復帰不能の修正（GPUコンテキスト消失→復元）

**再現したコード上の不具合**：スマホでアプリ切替等によりWebGLコンテキストが失われると、旧処理は `available=false` と2D退避を行うだけで、ブラウザがWebGLコンテキストを復元しても3Dに戻る処理が存在しなかった。

**main修正**：`webgl3d.js`でWebGL復元イベント時にシェーダー・プログラム・GPUバッファを再作成し、古い背景メッシュキャッシュを破棄。復元成功後は3D描画を再開、復元失敗時はCanvas2Dを維持。`index.html`の3Dスクリプトキャッシュ番号を更新。従来の屋上、回転、索敵撤去、戦闘、動物体型、密度、任務、操作は変更しない。

**QA**：JavaScript構文とGLSLのuAlpha宣言確認PASS。模擬WebGLで初回描画→コンテキスト消失→2D退避→復元→3D再描画PASS。復元時にプログラム2回・バッファ4個が再生成されることを確認。復元失敗の負例では2D維持PASS。狐/猫/狼×縦390×844・横844×390・PC1280×720×潜伏ON/OFFの18描画ケース、屋上・動物・建物の模擬描画と視点回転時の背景更新PASS。**実Chrome GPUはEGL初期化不可、Android実機・屋上チラつき消失・FPS・体型の見た目・戦闘難易度は未検証**。模擬WebGLを実GPU試験と称さない。

**mainコミット**：3D復元 `3714f5545bc7e56dea3dc9b3b95d14e9180f4e2a`、HTMLキャッシュ `baff2c3a3e3c1f08462beb214abc5d323ae2ef04`。

**次回最優先**：実Chrome GPU/Androidで3D復元・屋上・回転/ズーム・動物体型・攻撃・FPSを目視検証。不可ならゲーム全体の統合QAを増やし再現した破綻のみ修正。初期獲物10＋任務1、上限13、近傍4、補充3.6秒、不要な矢印・点線・索敵撤去を保持。neo-wild/以外不変更、毎時タスクON、**進捗：20/100（据え置き）**。

## 2026-10-31｜初期獲物不足とスマホ2本指操作の実不具合修正

**再現**：旧コードの150回起動試験で初期動物が10頭止まり69回（指定11頭に不足）。先に通常動物を生成すると近傍上限4頭が埋まり、任務用の獲物を追加できなかった。スマホの移動スティックを2本指で触ると後の指が操作を奪い、別の指のキャプチャ喪失でもスティックがゼロへ戻った。

**修正**：任務用の近くの獲物1頭を先に配置してから通常10頭を生成。近傍上限4は変更しない。スティックは最初の指だけが所有し、所有者以外のキャプチャ喪失では移動入力を消さない。旧カメラ回転/索敵撤去/屋上/戦闘/体型修正は重複適用しない。game.jsのキャッシュ番号を更新。

**検証**：修正後1000回のランダム開始で11頭=1000回、420以内の獲物=1000回、近傍最大4頭。狐/猫/狼×縦390×844・横844×390・PC1280×720×Canvas2D/模擬WebGL=18ケースで、各25回開始、2本指のスティック所有、視点回転/地図後の入力残留防止、ジャンプ、140更新フレーム、描画の模擬統合QA合格。実Chrome GPU・Android実機・FPS・屋上チラつき・動物体型・戦闘難易度は**未検証**。WebGL模擬成功は実GPU描画を意味しない。

**main SHA**：game.js `184d2cadf6b1d252f41affd9696c01f065d8fdaa`、index.html `092b8f6a5351c883fd667de4871372c5ae7934da`。対象はneo-wild/のみ。次回は実Chrome/Android画面の3D屋上・視点・動物体型・攻撃とFPSを最優先。初期10＋任務1、上限13、近傍4、補充3.6秒を維持。不要な矢印・点線・索敵を戻さない。毎時タスクON、**進捗：20/100（据え置き）**。

## 2026-10-31｜入力状態の回帰修正：地図・一時停止後に視点が勝手に回る不具合

**再現した不具合**：カメラ回転ドラッグ中に地図を開いて閉じると、前の指の移動が残り、画面操作を再開した際にカメラが勝手に回転した。旧コードではドラッグ80pxで視点0.32rad、その後地図開閉を挟んだ古い指移動だけで0.80radに変化。ポーズ中の2本指ズームにも同じ入力残留の可能性があった。

**mainへ実装**：`game.js`の操作リセットで、視点ドラッグ・ピンチ中のポインターキャプチャを解放し、入力履歴とピンチ距離を消去。地図・一時停止・再スタート・ゲーム終了時に古いジェスチャーを持ち越さない。`index.html`に残っていた「SCANNING TOKYO」を「TOKYO MAP」に変更し、game.jsのキャッシュを更新。過去の屋上・戦闘・動物体型の修正は重複適用しない。

**検証**：修正前に古い指の入力でカメラ角が0.32→0.80radに変わることを再現し、修正後は0.32radのままになることを確認。狐・猫・狼×縦390×844／横844×390／PC1280×720×Canvas2D/模擬WebGL分岐の18ケースで、地図開閉時の古いドラッグ遮断、ポーズ後の古いピンチ遮断、再度の新しいドラッグ、90フレーム程度の更新・描画が例外なく通過。構文・模擬DOM回帰であり実画面の品質を保証しない。ChromiumのSwiftShader/ANGLEでWebGLコンテキスト取得を試したが取得不可。実Chrome GPUでのゲーム3D画面、Android実機、屋上チラつき、FPS、体型と戦闘の実プレイは**未検証**。

**mainコミット**：game.js `5a5a893ccced2b0d6d6aebcb7b370691d9f0afbf`、index.html `1ae91c2d7ce6e27449c98ae851153d11cc17390a`。

**次回優先**：実Chrome GPU/Androidの3D画面で屋上・動物体型・視点回転・ズーム・戦闘を目視QA。不可なら既存ゲームの統合回帰で再現した不具合だけ修正。初期10＋任務1、上限13、近傍4、3.6秒補充、既存機能と不要な矢印/点線/索敵撤去を保持。対象はneo-wild/のみ、毎時タスクON、**進捗：20/100**。

## 2026-10-31｜ユーザー実Android指摘：屋上のチラつき・視点回転・索敵撤去・戦闘と動物体型の修正

**今回mainへ実装**
- 屋上：建物本体の天面と装飾床が同じ高さに重なる描画を修正。装飾床を0.8ワールド単位だけ上へずらした。歩行高さと当たり判定は変更しない。カメラ回転・ズーム時に背景3Dのキャッシュが更新されるようにした。チラつき原因の最終確定は実GPU画面QA待ち。
- カメラ：プレイ画面の空き部分をドラッグすると360度視点回転、2本指で0.7〜1.5倍ズーム。左移動スティック・右攻撃/飛びつき/跳躍・地図・ポーズには干渉しない。カメラ回転時に画面投影と操作方向を同時更新する。
- 索敵：スマホ索敵ボタン、Qキー、レーダーリング、索敵HUD、関連説明を削除。キツネ固有の本能は「急襲（強化噛みつき）」として維持。地図・ミニマップ・野生動物の警戒AIは維持。
- 戦闘：犬HP80→124・攻撃12→16、猪HP135→190・攻撃18→23、アルファHP235→335・攻撃25→32。攻撃の予備動作と攻撃間隔を調整。犬・アルファが攻撃後に横へ回り込む行動を追加。通常噛みつき連打による敵の永久よろめきを防止し、潜伏奇襲と飛びかかりは攻撃中断可能にした。犬の空振りには反撃の隙を残す。難易度の最終調整は実プレイ待ち。
- 体型：WebGLで狐の胴・顔を細長く、脚と鼻を長く、猫を細身にし尾を細く、ウサギの後脚・後足を大きくした。犬・猪・狼・アルファの体格差も維持。Canvas2D側の狐・猫・ウサギの輪郭を合わせた。簡易メッシュのため実在動物の精密な骨格再現ではない。
- キャッシュ：index.htmlのgame.js/webgl3d.js読込revを更新。

**今回の検証**
- game.js/webgl3d.js JavaScript構文検査PASS。GLSL頂点・断片シェーダーのuAlpha宣言・使用を静的確認。
- 狐・猫・狼×スマホ縦390×844／横844×390／PC1280×720×Canvas2D/模擬WebGL成功分岐＝18ケースの起動・更新・描画PASS。
- ドラッグ回転、2本指ズーム、左スティックとの入力分離、カメラの座標往復変換、通常攻撃のよろめき耐性、ジャンプ起動を模擬検証PASS。3種の地図開閉、食事／狩猟任務遷移、ゲーム終了とBESTスコア保存を模擬検証PASS。
- **実Chrome GPUでのゲーム全体の3D描画、Android実機の表示・操作・FPS、屋上チラつきの消失、モデルの見栄え、戦闘の面白さは未検証。** 実GPU復旧・完全修復・品質承認とは報告しない。

**mainコミット（今回）**
- 屋上とカメラ時の背景キャッシュ：`3c308f04eba97e7cc687545c20ae6ee81f482f43`
- カメラ回転・ズーム・索敵削除：`8a300728563a9be582eb5eb807b5bef219fea72d`
- 索敵UI削除・キャッシュ更新：`94071a4564821d129bccfe5a8edf3598f6c1cd32`
- 戦闘強化：`6123321aa62ea3b6b2cf3a86a489560944e8b13d`
- 3D動物体型：`56354152b1196d57b3a24180d15497a9020f1b76`
- 2D動物体型：`5e12f3bffd8d8e56bffd51bf04ced9d07a908a3b`
- 最新HTMLキャッシュ：`d186bebc502c9232ac815ce397c871ad1568758d`

**次回最優先**：実Chrome GPU／Androidで屋上のチラつき・回転操作・3D動物のシルエット・戦闘の被弾理由とFPSを実画面QA。GPU不可なら統合状態テストを深めて見つけた破綻だけ修正。新しい大型機能追加は禁止。獲物初期10＋任務1、通常上限13、近傍4、補充3.6秒、ジャンプ・飛びつき・潜伏・AI・セーブ・3D→2D退避は維持。巨大矢印・点線・攻撃線は復活させない。変更はneo-wild/以下のみ。毎時開発ON継続。**進捗：20/100（据え置き）**。

## 2026-10-30 23:43｜緊急品質復旧：屋上に着地すると動物が瞬間移動する不具合を再現・修正

**実際に再現した不具合**：低い屋上へジャンプすると、動物が屋根を突き抜けて地面の高さまで落ち、次のフレームで屋上の高さへ瞬間移動していた。修正前の更新ループで、キツネ30・猫25・オオカミ28.3ワールド単位の不自然な高さ変化を再現。屋上の見た目も、歩ける高さより上に装飾床が6単位浮いており、動物が床に埋まる可能性があった。

**main修正**
- game.js：上昇→下降するジャンプ中、到達可能な屋上に足が触れた時点で着地を確定。地面まで落ちてから屋上へワープする処理を防止。空中／落下中は食べる操作と潜伏状態への移行を禁止。
- webgl3d.js：低い屋上の装飾床の上面を、ゲーム内で歩ける屋上高さと一致させた。
- index.html：ゲームとWebGLのキャッシュ更新。
- コミット：game.js `3dd0a84fceb4f4277902c2cb6d48654bf0c9a594`、webgl3d.js `e36995ca1a09fe53b645936df97f6eb29dcefb76`、index.html `dd81e09fdaacae036478331f39b4ccc93a734b06`。

**検証**：JS構文2件合格。3種族×スマホ縦390×844／横844×390／PC1280×720×Canvas/模擬WebGLの18ケースで屋上着地・落下・二段ジャンプ禁止・地図開閉・個体数上限を検証。修正後の屋上着地時の最大1フレーム高さ変化はキツネ7.1、猫8.1、狼5.0（対象屋上それぞれ30/60/30）。さらに3種族×Canvas/模擬WebGLの6ケースで食料任務・通常攻撃・飛びつき噛みつき・900フレームの敵AI更新と描画を検証、全件合格。スマホ操作イベントの模擬テストで左スティック移動／離す・ジャンプ・飛びつき・空中捕食禁止を確認。

**実WebGL検証の範囲**：Linux Chromium（Xvfb＋SwiftShader）で、現在のWebGLシェーダーと同一の頂点・フラグメントGLSLを実コンパイル・リンクして三角形を描画し、ピクセル読み取りが成功（GL error 0）。**これはシェーダー単体テストであり、実際のゲーム全体のWebGL描画・GPU性能・3D品質・Android実機での動作を検証したものではない**。公開サイトはこの実行環境のブラウザからアクセス制限があり、実Chrome/Androidの実ゲーム画面とFPSは未検証。見た目・面白さ・完成は未承認。

**次の最優先**：公開ゲームの実画面で、屋上着地・飛びつき・敵AI・Canvas2Dへの退避・スマホ縦横とFPSを確認し、表示と操作の残存不具合を修正。新機能追加は禁止。大きな追跡矢印・黄色点線・攻撃線を戻さない。動物数初期10＋任務1、上限13、近傍4、3.6秒補充を維持。対象neo-wild/のみ、毎時開発ON、進捗20/100据え置き。

## 2026-10-30｜緊急：ゲームがめちゃくちゃになったという実プレイ報告・品質復旧を最優先

ユーザーの直接指摘：「ゲームがめちゃくちゃになってるよ」。これを品質上の重大不具合として扱い、新規機能を増やすより**移動・ジャンプ・攻撃・画面表示の整合性を修正**する。

**今回、最新mainで確認して修正した問題**
- 屋上にいる操作動物と地上の獲物・敵が、同じ高さにいる扱いで噛みつき／敵攻撃／突進の判定を受ける不具合を修正。高さが違えば攻撃を通さない。屋上から地上の食料を食べる／草に隠れる誤判定も防止。
- 3Dの「YOU」の文字・足元リング・接地影が、屋上や跳躍中でも地上の位置に残るずれを修正。Canvas2Dでもジャンプで左右にずれる投影を修正し、地上と屋上の位置合わせを改善。
- 屋上端を出た瞬間に下までワープするように落ちる処理を改修し、地上まで短時間で降下する動きに変更。落下中の二段ジャンプ・飛びつきを抑止。
- **テストで発見した着地の二重実行**：ジャンプ最終フレームの移動が着地処理より先に地面の高さを更新し、落下の動きが失われることを再現。ジャンプの移動と着地の順序を修正。屋上から飛び降りた場合は着地まで噛みつき判定を遅らせる。

**実行検証**：最新版JavaScript構文検査合格。3種族（キツネ・猫・狼）×縦390x844・横844x390・PC1280x720×Canvas2D/模擬3D分岐で、屋上からのジャンプ→自然な降下→二段ジャンプ不可→地図開閉→動物数上限の**18ケース合格**。さらに3種とも地上から低い屋上に登り、屋上から地上への攻撃が届かず、地上同士は攻撃できることを確認。**本物のChrome GPU・Android画面、FPS、タッチ操作、楽しさの評価は未検証**。以前の低ポリの見た目について完成・品質承認はしない。

**main変更コミット**
- `e59a10b13831ca22a0ff84e4f0e9c9b7323e870e`：高さが違う場合の近接攻撃、地図・表示と影の高さ修正（game.js）
- `4e0f0df3b75195345cbee431ec6ba50bb734c29c`：屋上の影（webgl3d.js）
- `1bcb9e9fcbb9312c0698bca2e10d4294808ffe2c`：キャッシュ回避（index.html）
- `c17b6a045f2c03128f1da1f47a2ca1c894f00ceb`：屋上からの降下アニメーション
- `d2a0692befc31eb61b2411cd3548126298e1430a`：ジャンプ／飛びつきの着地と降下の統一
- `0101a7874143e9ab37bb8407623d753d7c5249bc`：ジャンプ最終フレームの二重着地不具合修正

**次回は機能を追加する前に**、実画面で移動・屋上・飛びつき・地図・スマホ縦横が壊れていないか確認。実Chrome/Androidで目視できない場合は「未検証」と記載し、モック検証で完成や復旧を断定しない。操作不能／表示崩れの報告があればその現象を優先修正。ゲームの新機能を漫然と増やさない。巨大な矢印・追跡点線を復活させない。野生動物は初期10＋狩猟任務1、上限13、近傍4、補充3.6秒を維持。対象はneo-wild/のみ。既存毎時開発タスクはON継続。**進捗：20/100（据え置き）**。

## 2026-10-30 22時台｜ユーザー最新指摘：回避ではなく飛びついて噛む／段差／意味のある地図

**実際に何ができるか、誰にでも分かる表現で報告する。** ユーザーから「難しい言葉ではなく、誰にでも分かりやすく明確に」と指示あり。以後、報告は「何を押すと何が起こるか」「実際にできたこと」「まだできないこと」に限定して短く説明する。

**現mainでの実装**：
- 旧「回避」ボタンを「飛びつく」に変更。Shiftまたはスマホ「飛びつく」で前へ飛び、着地時に射程・方向・壁を確認して噛みつき攻撃を行う。キツネ・猫・狼で距離・威力・消費体力が違う。通常攻撃と従来のジャンプ・ジャンプ中攻撃も維持する。
- 低い廃ビルの屋上に高さを設け、ジャンプで登り、着地後に屋上を移動できる最初の実装。低い屋上の高さは30/46/60ワールド単位で種族ごとに登れる高さが異なる。高層ビルの上や本格的な階段・複数階の移動はまだできない。登れないことを「全ビル対応済み」と報告しない。
- 「地図」ボタンと開閉できる地図を追加。現在地、旧新宿駅、休息地（安全なとき体力回復）、近くの食料・危険な敵、登れる低い屋上を色で示す。スマホでは地図ボタンを音楽・全画面・一時停止ボタンの下へ分けて配置。プレイ画面に大きな矢印・追跡線は戻さない。

**実施済みQA（模擬環境）**：3種で「飛びついて噛む」を発動し、着地後に獲物へダメージが入ることを確認。3種で壁際からジャンプし、低い屋上の内側へ着地することを確認（狐30、猫60、狼30）。Canvas2Dと模擬3D成功分岐で3種×スマホ縦・横・PCの18起動、画面更新、地図開閉を確認。模擬WebGLでは狐・猫・狼の屋上分のZ上昇を6ケース確認。コード構文合格。**実Chrome GPU・Android端末での画質、FPS、操作感、実機表示は未検証。**

**今回の記録済みコミット（一部、その後のmain更新があるため常に最新mainから作業する）**：
- 飛びつき攻撃：`a4d592f2d7c8b304fba3fac0924235b6cf8b6eff`、`24fc73f65a1d6f9cb912515e2274001e3e3e2fdc`
- 低い屋上：`6a5b7508e9d07744e7ebf1bd5fa7caebd12bf4d4`、`dcae281fad6d271713ca8ae351ca82ad07c0609c`、`64e7e8cba81e735811e0aa9b6d19c19f9cf2dfdf`
- 地図：`e9aefe559689de46550b276617d7e91165aef893`、`a4e935b4315ff2d0ea575f87dfd289d0b978f71b`、`0084b0754da9fb056d1902716828607a70e3a01e`、スマホ配置`d0ec23c12c94a30555c846fa344e80000d455fd1`

**次回最優先**：①高いビルへ登るための段差・足場・階段を、目で見て分かる形で設計／実装して動作検証。②地図の地点を実際の地形と遊びに結びつける（安全な巣、食料、狩場、探索の理由）。③飛びついて噛む際、獲物が警戒・逃走し、射程や遮蔽物に応じて命中／空振りする駆け引きを強化する。派手な線と矢印は戻さない。完成・面白くなったと断定しない。

**進捗：20/100（据え置き）**。既存毎時タスクはON、対象はneo-wild/以下のみ。

## 2026-10-30 22:44 JST｜飛びつき・低い屋上・意味のある地図：実コード修正と回帰試験

**最新指示**：回避ではなく「飛びついて噛む」。ジャンプで段差やビルに登れないと意味がない。地図には分かる用途が必要。説明は短く明確に。画面上の巨大矢印・点線・攻撃線は絶対に戻さない。

**mainの実装状態**：
- SHIFT／スマホ「飛びつく」は前方へ跳び、着地時に噛みつく。猫・狐・狼で距離・スタミナ・攻撃が異なる。着地前の早すぎる攻撃判定を防止。従来の空中攻撃・潜伏奇襲は維持。
- 低い建物に30／46／60の屋上高を設け、ジャンプで乗れるようにした。今回の修正では壁際の初回衝突で跳躍全体が中断される不具合を直し、上昇してから接触判定する。高い建物は登れない。屋上到達時に3秒の索敵を付与。
- 「地図」ボタンで全体図を開く。現在地・休息地（安全なら体力回復）・旧新宿駅・登れる屋上・近くの食料・確認できた獲物・危険な動物を区別。ゲーム画面のナビ線は増やさない。地図のEsc閉じに対応し、旧「回避」の表記を修正。
- 獲物初期10＋任務用1、総上限13、近傍4、補充3.6秒、潜伏半透明、AI、WebGL→Canvas退避を保持。

**検証**：V8構文検査でgame.js／webgl3d.js合格。模擬DOMで狐・猫・狼×スマホ縦390×844／横844×390／PC1280×720の低屋上ジャンプ9/9成功。高いビルの壁は通過せず。3種の「飛びつく→着地噛みつき」で獲物のHP減少を確認。食事→潜伏→狩猟→駅到達の4任務遷移、休息地での体力回復、地図の開閉、BESTスコア保存を確認。2D退避／模擬3D成功分岐の描画18ケースで例外なし。**これはモック試験であり、実GPU／実Android／主観的面白さの確認ではない。**

**残課題**：実Androidのジャンプ操作・3Dの屋上高さと遮蔽・FPS・獲物の反応を実画面で確認。現在の保存はBESTスコアのみで、中断位置からの復元は未実装。飛びつきの命中距離と狩猟30〜90秒の駆け引きは実プレイ調整が必要。大規模機能追加より狩りの手応えを優先。

**今回のmainコミット**：`847ccce6f5b0765786615adf2c6645b40df3055c`（屋上・地図・着地判定）、`0678d9834abd5d2305c1a5dab24b16988a63f79d`（地図凡例・キャッシュ）、`e86685a8274a7a63dc73a56f42951befb7bbd759`（Esc閉じ）、`4e3aa7f5a2cf60244ed14b2554a29755a838b91b`（表記・キャッシュ）。

**進捗：20/100（据え置き）**。既存の毎時開発はON維持。対象はneo-wild/のみ。

## 2026-10-30 22:19 JST｜実機スクリーンショット指摘：巨大矢印・点線の廃止／狩りの空白時間を短縮

**ユーザーの直接指摘**：「この線と矢印のいみないのやめ」「ゲームがつまらない。どう面白くするんだ？」。実Androidの提示画像では画面中央の大きな黄色い矢印と追跡点線が動物に重なり、目標距離656、周囲に直ちに狩れる獲物が映っておらず、狩猟の緊張感がない。旧「方向矢印・曲がり角点線・目的地リングを常時表示」の仕様は、この最新ユーザー指示で**画面内常時表示について失効**。ミニマップの目標点は残す。矢印・線を新しい別演出で勝手に復活させない。

**mainへ実際に反映した内容**：
- `game.js`：プレイヤーから伸びる黄色い点線、巨大矢印、目的地リングと数値を描く`drawGoalGuide`および呼び出しを削除。ミッション説明の矢印への依存を廃止し、食べる／隠れる／索敵して狩る／東の駅方面を探索する短い文章へ変更。AIのA*経路探索`routeTo`と敵攻撃警報は維持。
- `index.html`／`style.css`：左側の`mission-guide`（矢印と残距離の黄色い枠）とCSSを削除。ゲームスクリプトのクエリを更新。
- `game.js`：獲物探索の空白を減らすため、狩猟時に近傍供給を検討する半径を760→420、専用の近傍獲物生成を330〜570→160〜270ワールド単位、プレイヤーからの最短生成距離を専用獲物のみ145に変更。目標追跡の再選択閾値を760→420へ調整。**初期10＋任務用1、総上限13、近傍上限4、通常3.6秒間隔は変更しない**。

**確認したテスト**：更新JSの構文検査、旧描画呼び出し・HTML・CSSが消えている静的検査、AI経路処理と狩猟・潜伏・跳躍の関数残存を確認。Canvas2Dフォールバックと偽WebGL描画成功分岐の3種族×縦390×844・横844×390・PC1280×720（計18ゲーム起動）で更新ループ・任務HUD・獲物数・補充上限の例外なしを確認。40回のランダム初期配置試行で、最寄り獲物420以内が39回／40回、300以内が29回／40回（まだ保証ではない）。実Chrome GPUでの変更後描画スクリーンショットとAndroid操作感は**未検証**。面白さが改善済みとは断定しない。

**変更コミット**：
- 初回UI削除：`75de0489b4df5408128c51a5bda48503b6526a99`（game.js）、`28b0bae28298163582edc4e9961c71d579d4a1be`（index.html）、`e6359ae110f3d83755ee45103acc9177f33f1674`（style.css）
- 獲物探索：`ce06592d638b433e09b063ac8bd9f9caf8666f22`（game.js）、`b6b44311ff5ec5421836d80227e891ce8adfd651`（index.html）

**次の開発方針（提案・まだ達成していない）**：
1. **狩りの駆け引き**：何もない場所を長時間走る任務を減らす。獲物が餌を食べる・周囲を警戒・物音を聞いて逃げる・隠れる行動を明確に描き、足音／草むら／風向き／速度の使い方で追跡難度が変わるようにする。見つける→忍ぶ→飛びかかる→反応するという30〜90秒のプレイループを最優先に実装・試験。
2. **危険と判断**：犬・猪・アルファの攻撃予備動作と回避猶予、反撃機会、見失い・逃走を視覚とゲームプレイで一致させる。攻撃線・不要な三角形・大量HUDで代用しない。被弾理由がわかることを検証。
3. **意味のある成果**：食料補給・安全地帯・縄張りや巣を、次回のリスクと選択に影響する報酬へ進める。食べる→狩るの無限反復から脱却。大規模MMO・災害・世代継承の追加はコア体験が成立するまで延期。
4. **画面品質**：ユーザーの実機画像を優先して、操作動物の見やすさ、斜め3Dの奥行きと草の遮蔽、スマホのHUD占有率、WebGL実GPU表示を評価する。実機不可なら未検証と明記する。

**運用**：WILD RECLAIMの既存毎時タスクはON維持。ユーザーが明示的に停止しない限りOFFにしない。対象は`neo-wild/`のみ。次回はゲームの面白さを測れる狩猟・潜伏・逃走の改修を実コードで行い、テストとGitHub main SHAを報告する。**進捗：20/100（据え置き）**。

## 2026-10-30 21:41 JST｜攻撃モーション第2修正：敵の打撃欠落・急な姿勢変化

**確認した不具合**：前回の攻撃姿勢はプレイヤーの`swing`にのみ同期しており、犬・猪・アルファ等の敵は予備動作の後、命中／空振りの瞬間に姿勢が通常へ戻っていた。キツネ・猫・狼の3D/2Dモデルには、攻撃中だけ追加される余分な前脚形状もあり、体の一部が突然増える表現になっていた。

**今回の実改修（main／`neo-wild/`のみ）**
- `game.js`：敵にも独立した`swing`タイマー（0.22秒）を追加。予備動作終了時に命中・空振りを問わず攻撃姿勢を発生させ、フレームごとに減衰。プレイヤー攻撃で中断された敵の残存姿勢は解除。2Dフォールバックで猫・狐・狼／犬の既存前脚そのものを前へ動かし、攻撃中だけ生える余分な前脚を削除。
- `game.js`／`webgl3d.js`：攻撃姿勢を一瞬で最大伸展させず、約33msで伸ばして復帰する時間補間へ変更。猫は既存前脚で打撃、狐・狼・犬は頭部／顎と脚で噛みつく。猪・アルファは突進中の頭部・前脚を動かし、猪の鼻と牙も追従。ダメージ計算・射程・敵の攻撃開始時刻は変更しない。
- `index.html`：JS読み込みクエリを`attack-pose2`へ更新してキャッシュを回避。不要な斬撃線・突進ガイド線は復活させない。

**検証**：両JSのV8構文検査合格。模擬WebGLで狐・猫・狼・犬・猪・アルファ×縦390×844／横844×390／PC1280×720×待機・予備・打撃・復帰＝72ケース、猪・アルファの突進姿勢2ケース、潜伏猫1ケースの**計75ケース合格**。攻撃時のモデル前端が待機時より前へ出て、復帰時は後退し、頂点NaN/Infinityなし。Canvas2Dフォールバックの6種×4姿勢**24ケース**例外なし。フラグメント`uAlpha`宣言とvaryingを静的検査し、`uAlpha`未宣言の負例が検出されることを確認（模擬判定であり実GLSLコンパイルではない）。8方向ナビ、潜伏時の深度プリパス、既存狩猟・ジャンプ・AI・セーブのコード存在を確認。**統合操作・任務・セーブ復元の実行回帰は今回未実施**。

**実GPU・実機未検証**：Chromium headlessをSwiftShader/ANGLE/EGLで起動したがEGL初期化失敗・WebGLコンテキスト取得不可。公開サイト／GitHub rawはDNS解決失敗。したがって実Chrome/Android GPUでのGLSLコンパイル、スクリーンショット、廃ビル・草の遮蔽、FPS、スマホ縦横の操作感、実端末3D復旧は**未検証**。現在も手続き型の低ポリゴン3Dであり、リアルな完成品質ではない。

**mainコミット**：`788d6d22e640a30d31e88d7029cb1cb819d949e5`（game.js）、`35094e354cfd3912e0ba82c492badf72b07a5d4c`（webgl3d.js）、`ef4de9ee05fbec0c0c5a2d860f7c0fb70429cdc6`（index.html）。

**次回最優先**：実GPUが利用できれば実画面で3種族の攻撃予備→接触→復帰と線状演出の不在、草とビルの前後関係、縦横スマホ操作をスクリーンショットQA。GPU不可なら実ゲーム更新ループ・敵攻撃と空振り・飛びかかり・任務・保存のモック統合回帰を強化し、見つけた実不具合を修正。機能増築より攻撃の手触りと3D描画品質を優先。タスクON継続、ユーザーの明示的停止指示なしにOFFへ変更しない。**進捗：20/100（据え置き）**。

## 2026-10-30｜攻撃モーション改修・線状エフェクト削除（ユーザー直接指示）

**最優先のユーザー評価**：「攻撃モーションをちゃんと表現して」「へんな線みたいなのはいらない」。線の残像で攻撃を見せる方式を廃止し、動物自身の姿勢で予備動作・命中・戻りを表現する。

**変更（main / neo-wild/のみ）**
- `game.js`：Canvas2Dのキツネは前脚と口先、猫は前脚と爪、狼は前脚と顎を使った攻撃姿勢を追加。実際の`pendingStrike/windup/swing/jumpDive`時間に同期。攻撃の弧・斬撃の線・突進ガイドの線・赤い範囲扇形を削除。敵の危険通知「!」とHUDの敵警告、任務の8方位矢印と点線誘導は維持。狩猟射程・当たり判定・AI・既存ゲーム操作は変更しない。
- `webgl3d.js`：頭部の前突・胴の前後荷重移動・前脚の伸展と浮上、キツネ／狼の下顎・猫の前脚打撃を立体メッシュで表現。固有の動作量を設定。潜伏アルファの深度処理・影・街路キャッシュは維持。
- `index.html`：両スクリプトのキャッシュ更新タグを変更。

**検証**：両JavaScriptの構文検査合格。模擬WebGLでキツネ・猫・狼の待機／予備動作／命中／潜伏命中の12ケースにて有限な頂点のみ生成・描画成功。3種とも攻撃時のモデル前端が待機時より前方に移動（狐+14.4、猫+12.1、狼+9.5ワールド単位）。WebGLシェーダー自体の実GPUコンパイルと実Chrome/Androidの画面・タッチ・FPS・アニメーション美術品質は**未検証**。模擬GLではGPU品質を承認しない。進捗：20/100据え置き。

**コミット**：`14b30f26583b24ee2eb27e907df3899a9d174cf2`、`89dbc9b6edb79c504c22291b375dcd8c1ce3c5ce`、`2476c49750ef6b8e4c2aa717232cffddbe1632fc`。

**次回**：実Chrome/Android GPUで狐・猫・狼それぞれの予備動作→打撃→復帰を撮影・確認。物理接触と姿勢のズレや線の残存を見つけたら修正。新機能の増築より攻撃・移動・潜伏の美術と操作の改善を優先。毎時開発タスクは**ON維持**。ユーザーの明示的な停止指示なしにOFFへ変更しない。

# WILD RECLAIM — 開発ロードマップ

最終更新: 2026-10-30 (JST)
対象: `techmew/techmew.github.io/neo-wild/` のみ
設計正本: https://docs.google.com/document/d/1nThmsAhxtVt-Bs5_NzGLqxMghSBxN2unNalcwn9Z1_g/edit
公開: https://techmew.github.io/neo-wild/
状態: 開発中（完成ではない）
最優先: 操作の面白さ・種族の差・任務の見通し。これらが納得できるまでMMO・新地域・災害を機能追加の優先対象にしない。

## 2026-10-30｜毎時開発ON：潜伏中のWebGL半透明重ね描き修正

**優先順位**：ユーザー最新指示により毎時開発はONを維持。過去の「3D復旧確認まで自動停止」は失効。対象は`neo-wild/`のみ。新機能増築ではなく3Dの見え方とGPUの不具合防止を優先する。

**今回の問題と修正**：従来の潜伏中WebGLでは`gl.depthMask(false)`で43%半透明の動物メッシュをそのまま描いていたため、同一動物の前後の三角形が何度もブレンドされ、見た目の不透明度が意図より高くなる設計上の問題があった。`webgl3d.js`で潜伏中の動物だけ色出力を止めた**深度プリパス**を追加し、最前面の3D表面だけを`gl.EQUAL`でアルファ43%描画する方式に変更。非潜伏時は追加描画なし。深度関数・深度書込・ブレンド状態は描画後に復元。元の斜め俯瞰・草の前後・獲物上限・8方向矢印・ジャンプ・飛びかかり・狩猟・任務・AI・セーブは変更しない。`index.html`のWebGLスクリプト読み込みクエリも更新し、古いコードのキャッシュを回避。

**検証**：V8で修正済みJS構文を実行。WebGL APIの状態を記録するモックで、狐・猫・狼×スマホ縦390×844・横844×390・PC1280×720×潜伏ON/OFFの**18セッション合格**。潜伏中のみ深度プリパス→色出力復帰→`EQUAL`＋alpha 0.43→`LEQUAL`復帰、通常時は追加描画なし、2種類のシェーダー生成・フラグメントの`uAlpha`宣言を確認。**これはWebGLモック試験であり、GPUによる表示品質の実証ではない。**

**実GPU・実機制約**：実Chromiumを`--enable-unsafe-swiftshader`等の設定を含む3構成で起動したが、いずれも`canvas.getContext('webgl')`が`null`。公開サイトとGitHub rawへのDNS解決も失敗。従って実Chrome/Android GPUのシェーダーコンパイル、スクリーンショット、ビルの立体位置、地形遮蔽、動物の体形とモーション、草の前後関係、縦横実機操作、ユーザー端末の3D復旧は**未検証**。リアル3D完成とは主張しない。

**コミット**：`48b82dc2ea28fabc17d3248941061540213702f6`（潜伏半透明の深度プリパス）、`7638beb94a7913af3f1dcdb564fbb80fa2d581c8`（JSキャッシュ更新）。

**次回最優先**：実GPUが利用できる環境でスクリーンショット目視QAと3D表示復旧を確認し、確認できた視覚不具合だけを修正。GPU不在時はGLSLの宣言・深度・透明描画・静的キャッシュ・ナビ・操作の回帰試験を継続。**進捗：20/100（据え置き）**。

## 2026-10-30｜緊急障害修正：3Dが消えて2Dに戻る根本原因

**ユーザー報告**：「完全にこわしやがったな。リアルな3Dはどこにいった」。障害を最優先して既存の毎時開発タスクを停止。

**確定した実装ミス**：直前の潜伏半透明対応（WebGLフラグメントシェーダーで透明度`uAlpha`を使用）で、`uAlpha`を**頂点シェーダー側だけに宣言し、フラグメントシェーダーには宣言していなかった**。`gl_FragColor=vec4(...,uAlpha)`が未宣言識別子になり、実GLSLでシェーダーコンパイルが失敗する。その結果`Wild3D.available=false`となり2D Canvasへ自動フォールバックしていた。前回のモックWebGLは`getShaderParameter(...COMPILE_STATUS)`を常に成功扱いにしており、この不具合を見逃した。**実装・テスト両方の不備**。

**修正内容**：
- `neo-wild/webgl3d.js`：`uniform float uAlpha;`をフラグメントシェーダーへ移し、使用していない頂点側の宣言を削除。JS構文・シェーダー各ステージの参照変数宣言を確認。
- `neo-wild/index.html`：`webgl3d.js`と`game.js`の読み込みURLに同じバージョンクエリを付け、ブラウザが故障した古いJSを使い続けないようにした。
- `neo-wild/game.js`：万一WebGL利用に失敗し2Dに切り替わった場合、見えないまま放置せず一度「3D描画を開始できないため2D表示中です」と通知。

**厳格化したテスト**：Shader各ステージの`attribute`/`varying`/`uniform`宣言を使用箇所と照合し、修正前の`uAlpha`未宣言フラグメントを与える負例は失敗することを確認。修正後のWebGL初期化＋WebGL Canvasレンダリング、WebGL不可時の2D代替表示、PC1280x720・スマホ390x844・横844x390×3動物＝**18ケースのモック回帰テスト合格**。JS構文、3DのdrawArrays呼び出し、ジオメトリ非有限値0件、ジャンプ動作、HTMLキャッシュクエリを確認。

**重要な未達**：当環境から公開サイトのDNS解決ができず、ChromiumのWebGLコンテキスト取得も失敗するため、実ブラウザGPUでのGLSLコンパイル／スクリーンショット／利用者の端末での3D復帰は**未検証**。コンパイル不良のソース原因は修正できたが、利用者の画面で実際に復旧したと断定しない。元のWebGLも低ポリゴンの簡易形状であり、**高精細なリアル3Dモデルではない**。今後は本物のGPUまたは検証可能な実GLSLコンパイラによる回帰試験ができるまで、描画の大幅な改変を公開しない。

**コミット**：`c6deab20cabf1a5c27197fbebeaa39570d7b7486`（GLSL宣言の修正）、`80a32c453a931e45be150764d5b471f4b0f684b4`（キャッシュ更新）、`123882bf9bf1ceb9d71c211b207f50242b569543`（2Dフォールバック通知）。

**進捗：20/100（据え置き）**。ユーザーの実画面確認を優先。毎時自動改修は停止中に保ち、不確実な自動更新が修正済みソースを再度壊さないようにする。次回最優先は実端末でWebGLが出ることの確認と、3種族の品質向上に必要な本物の3Dモデル・影・動作の製作。

## 2026-10-30｜毎時開発：WebGL静的描画キャッシュ・種別3D造形・街路立体ディテール

**今回の実装**（`neo-wild/webgl3d.js`のみ、ゲーム機能の追加なし）：
- **スマホ向けGPU/CPU負荷削減**：道路・地面・ビル・壁面装飾をカメラの240ワールド単位の区画ごとに静的頂点バッファへ保持。毎フレーム再生成・再アップロードせず、カメラ区画が変わった場合だけ再構築する。動物と風に揺れる植物は毎フレーム別バッファへ描画。既存のWebGL深度テスト・2Dフォールバック・狩猟・A*・セーブは維持。
- **種別3D造形**：歩行の脚運びを実際の移動距離（`P.steps`／`m.step`）に連動させ、静止時の不自然な歩行を抑制。ウサギの長い耳と白い尻尾、ネズミの細い長尾、ハトの翼とくちばし、イノシシの牙、犬の垂れ耳、アルファの肩の鬣・逆立つ毛を追加。狐のふさふさ尾・猫の分節尾・狼の大型体格は維持。**手続き型メッシュであり高品質GLB／骨格アニメーションではない**。
- **立体地形**：道路の車線表示・縁石の高さ・沿道の植物、廃墟周囲のコンクリート片・壁を這う植物を3Dジオメトリとして追加。道路と建物の衝突判定・獲物密度上限13頭は変更なし。

**検証**：JS構文合格。WebGLモックで9種の動物メッシュ（狐・猫・狼・ネズミ・ウサギ・ハト・犬・猪・アルファ）の生成と非有限頂点0件。カメラ静止10フレームで静的ジオメトリのアップロード1回／動的10回、カメラ区画移動後の静的再構築1回。最終版のゲーム統合回帰試験：WebGL優先9＋Canvas2D代替9＝**計18セッション**、縦390×844・横844×390・PC1280×720で3種族の起動・移動・4任務遷移・8方向案内・獲物上限に合格。追加25フレームの静的アップロード1回、頂点異常0件。

**実機制約**：実行環境のChromiumを確認したがWebGLコンテキスト取得がfalseで、公開サイトへのネットワークアクセスもDNS制限で失敗。実GPUでのGLSLコンパイル・WebGL画面のスクリーンショット・Android実機の描画負荷／美術品質は**未検証**。低ポリゴン3Dの見た目を最終品質とは評価しない。

**コミット**：`a6df97b5ff619a617fdfae34930b044d57baf666`（静的メッシュキャッシュ）、`337eca4d848447b7a778b442e29dbce03470a6ac`（9種の体形差と距離ベース歩行）、`dbab8a3b392c782c2264ee9bb08686fdc5e51275`（道路・廃墟の立体ディテール）。

**次回最優先**：WebGLが使えるChrome／Androidでの実スクリーンショット・GLSL実コンパイル・カメラの遮蔽・動物造形・スマホFPSを測定し、実際に見えた問題だけを修正。実GPUが使えない場合も、静的描画の正確性・案内の経路・描画負荷の回帰テストを続ける。**進捗：20/100（据え置き）**。未完成。

## 2026-10-30｜ジャンプ・空中飛びかかり・半透明潜伏（直接指示）

**ユーザー直接フィードバック**：「ジャンプしないの？ 飛びかかり攻撃とか」「もっとアクションなどを深めてよ」「隠れた時も薄くなるとか」。アクションは新エリアなどの大規模増築より最優先。キツネの既存狐眼の跳躍は削除せず、その上で3種族に自発的なジャンプを追加。

**実装・操作**
- **Lキー／スマホ「跳躍」**で垂直成分を持つジャンプ（キー押しっぱなしで連発しない）。空中で**J／攻撃ボタン**を押すと「飛びかかり」を準備し、**着地時に射程・角度・建物遮蔽を再判定**して命中時のみ倍率1.4・追加よろけ・「飛びかかり！」を表示。通常攻撃や狐眼の跳躍と共存。
- 3動物の運動差：猫は高く俊敏（最大表示高さ約65・移動88）、キツネは跳躍距離約98・表示高さ51、オオカミは重く低いジャンプ（高さ39・距離65）。スタミナ消費、再使用待ち時間を動物ごとに設定。入力方向へ飛ぶが、静止中でもその場で跳べる。**衝突判定で壁越えはしない。**
- **草むらの潜伏が有効なとき**は2Dフォールバックで動物だけ不透明度44%、WebGLではプレイヤーの3Dメッシュを不透明な環境描画の後にアルファ43%でブレンド。輪郭・潜伏表示は維持。ジャンプを始めると潜伏状態は解除、着地後も再発見猶予あり。
- 3Dメッシュはジャンプの放物線状の高さを実際のZ座標へ反映。地面の影は下に残り、脚は空中で持ち上がる。Canvas2D側も本体のみ上へ移動して影を固定。スマホ右側のジャンプボタンは攻撃ボタン上方に独立配置し、操作グリッドに行を増やさない。
- 回帰不具合修正：初回テストで空中ジャンプ中にSHIFT回避が成立し、移動モードが重なる問題を発見。ジャンプ中は回避を受理しない。

**実装コミット**：
- `feee18616b07a089ff1463d0970683b3011333a7`：跳躍と空中攻撃、3種差、潜伏時の2D半透明。
- `8048ca43741fa347c4a88207fe03f8845c535332`：空中回避重複を防止。
- `ad7be1ca02d294b7d464abf95b8d129a28ae094d`：HTML操作ボタン・説明。
- `5fcef6fb78d962cb9e689958cac017443ec66a8c`：スマホボタン配置。
- `0d383547fd5b0bb1ff525909c05167e896d136a5`：WebGLアニメーション・潜伏時の3Dアルファ描画。

**検証**：JS構文検査、3D模擬描画、Canvas2Dフォールバック。3種族×スマホ縦390×844・横844×390・PC1280×720×2描画モードの18セッションで、物理的なジャンプ最高点（種差）、空中攻撃の着地命中とダメージ、ジャンプ→着地リセット、潜伏時のWebGL/Canvas不透明度、食料→潜伏→狩猟→目的地の任務遷移が合格。メッシュ浮動小数点の非数値データ0件。さらに3種族で建物前のジャンプ衝突を毎フレーム検査し、壁越えなし。タッチ跳躍の押下・解除・操作状態のリセットを検証。**本物のブラウザGPUによる描画目視・実機タッチ・操作の気持ちよさ／遊びの受入は未検証**。

**残課題**：飛びかかりの敵種類別カウンター・着地硬直・連続技の調整、猫らしい着地姿勢、狼の重量反動、草むらで透明になる量の視認性（実画面で決める）、本物の3Dボーンモデル・カメラ・地形・性能。**進捗20/100（保留、実プレイ評価前）**。未完成。

## 2026-10-30｜ユーザー新指示：▲は方向不明、真の立体描画へ

**直接フィードバック**：「行く方向が▲だとわかりにくいから↑かほかに採用できるものを探して」「なんで、こんなに平坦なの？立体的にしてて」。雰囲気重視の斜め俯瞰は保持。三角形1文字の回転案内をやめ、道路迂回を伴う**画面方向の矢印**＋接近ルート＋目的地距離に変更。ユーザーが納得したとは断定しない。

**実装**：
- WebGL1の**実立体メッシュ描画**（`webgl3d.js` 新規）をブラウザ優先で接続。地面・道路・廃墟の3D押し出し壁面、上面・側面、屋上設備・窓、草の立体葉、3種の操作動物と野生動物の別体格、脚と胴体・耳・尾などを低ポリゴンの3Dジオメトリとして組み立て、方向光と法線のシェーダー、深度バッファで前後遮蔽。動物の接地影を立体ワールドに描く。高品質のGLBモデル・骨格アニメーションではまだない**プロトタイプ**。
- `index.html` でWebGLキャンバスを2D HUDの後方へ配置、`game.js` から毎フレーム現在の世界の状態を渡す。WebGL非対応／初期化失敗／描画例外／コンテキスト喪失では従来のCanvas版に自動復帰。物理・衝突・狩猟AI・狩猟密度制限・3種族の固有能力・任務・セーブ判定は保持。WebGL描画時も食料、戦闘予兆、敵の体力表示、プレイヤー識別、天候フォグを残す。
- 任務ナビは三角形`▲`のグリフを廃止。**進行方向を示す太い矢印**を角度に合わせて回転させ、プレイヤーから次のA*到達可能地点へ短い点線を表示。画面内の目標は円形マーカーで区別。HUDは方向を示す8方位矢印（↑↗→↘↓↙←↖）と距離に変更。狭路では「曲がり角」を表示。旧通知・チュートリアル文の三角形案内表記も変更した。

**コミット**：
- `751724a5d303d7eaa706f4cc1c67aec54d98feb9`：ネイティブWebGL描画基盤。
- `54733622e3e84fc3e808d57c3c2af089ee392884`：接地影。
- `c4f37c45e3793a2258dc2d749678e62a508a3776`：矢印とルート、ゲーム・WebGL連携。
- `65b3c7170213214345fce4f1cbe7f91996ec2c4b`、`c072a6de265db35cb50a79e10ae6fbffafeac93e`、`474cda22fb9dd7173368f589ebe5847702f884d4`：旧▲表記削除、天候・視認性・敵HP表示。
- `aee0886ab4407c73f60bfbadefb1d77fd4b453c2`、`b3459621998f36ee150b379c61ae0da62d38fdfe`：HTML/CSS WebGL積層。

**検証**：全JSファイルの構文を確認。モックWebGL（シェーダー生成・バッファ送信・drawArrays）とモックCanvasで、縦390×844／横844×390／PC1280×720、狐・猫・狼の合計18セッション。WebGL優先9、Canvasへのフォールバック9で起動・移動・初期個体数上限・食料→潜伏→狩猟→目的地の4任務遷移・方向ナビの動作が合格。WebGLメッシュ用の浮動小数点配列は非数値値0件、試験全体で16万以上の三角形をモック送信。**実際のGPU上でのGLSLコンパイル・描画スクリーンショット・物理端末WebGL性能・美術品質・面白さは未検証**。ユーザーの評価待ち。ネイティブGLSLが実機でコンパイルできなければ2Dフォールバック。3Dプロトタイプを最終品質と呼ばない。

**次回優先（最重要）**：①本物のChrome/Android WebGLで画面を撮影し、カメラ角度・動物モデリング・草むらの遮蔽・視認性・当たり判定同期を評価、②低ポリゴン形状を表現力のあるモデル／アニメーション・環境材質へ置き換え、③画面上の進行方向矢印が分岐や狭路でも正確であるか検証。**進捗：20/100（据え置き／実機での品質受入前）**。WebGLコード導入とゲームとして面白いことは同義ではない。**未完成。**

## 2026-10-30｜追加指示：立体感の根本不足・獲物過密・最終ゴールの明確化

**ユーザー直接評価**：「立体的にはならんのか？」「もっともっともっとクオリティをあげろ」「獲物多すぎる」「このゲームの着地点はなんだ？」。単なる平面を傾けた2.5Dが本物の3Dモデルや陰影を持つゲームには見えない問題として受け止める。前回の「雰囲気重視の斜め俯瞰」選択は保持。**今回のCanvas描画は本物の3D実装ではない。**

**今回のコード改修（実施済み、`neo-wild/game.js`のみ）**
- 動物生成：開始時は従来26回から**10回＋狩猟任務用の小動物1回**へ削減。継続生成の最大頭数は従来DAY1で29頭程度から**13頭**へ。再出現間隔を**1.45秒から3.6秒**へ。
- 近距離密度：生成時、プレイヤー半径610ワールド単位内の個体を**最大4頭**に制限し、動物同士の生成位置を**155単位以上**離す。すでにいる個体の移動まで厳密な同時上限を約束するものではない。世界は極端ににぎやかにせず、探索と追跡の余白を作る。
- 任務ソフトロック防止：初期および狩猟中に近場の獲物がいないときは、密度上限を守りつつネズミ・ウサギ・ハトのうち1頭を視界から少し離れた地点へ再供給。常に足元へ直接出現させない。
- 立体風表現の暫定強化：建物の側壁に光の勾配、動物に地面との接地影と背中の反射光を追加。**これは品質向上の小修正であって真3D化ではない。**

**検証**：JS構文確認合格。390×844・1280×720それぞれで狐／猫／狼＝合計6セッションをモックDOM/Canvasで実行。動物初期頭数10～11、半径610内3～4頭、逆投影・画面上方向入力・4段階の任務遷移、動物0頭から約3.6秒後の狩猟用獲物補充を確認。総数上限13維持、描画関数例外なし。**ブラウザの実画面確認／物理的な3D／動物の3Dモデル／スマホ実機操作／面白さの受入試験は未達。**

**ゲームコミット**：`3567557407b197651a638d015cf759143f80bf82`。

**完成イメージ（既存設計の具体化、追加仕様の最終承認ではない）**：『人類が消えた東京で一匹の動物として生き延び、一族を作り、世代を継ぎ、ARKにまつわる人類消失の謎を探索する、生きた東京の3DサバイバルRPG』。世界は物語の一区切り後も永続し、一族全滅でもワールドは続く。**ARKの真相とエンディング内容は未確定**。

**最優先の技術課題**：2.5Dの色・影の細工を積み増して「3D」と呼ばない。スマホWebGL性能検証を行い、既存の衝突・AI・任務・セーブを保持した**実際の3Dレンダラー（WebGL／Three.jsなど）とGLB動物モデル・骨格アニメーションへの段階移行**を最優先検討。候補技術は確定前に同等仕様で性能と操作を比較し、十分な見た目にならない低品質なポリゴン置換はリリースしない。古いCanvas版への切替が必要なら暫定フォールバックとして保持。まず「1地区・3動物・狩猟と潜伏・スマホで快適」の縦切り受入テストを成立させ、その後に家族・オンライン・災害の大規模拡張を進める。

**進捗：20/100（据え置き）**。動物数の削減と陰影追加だけでは品質の根本問題が解決したと判断できない。完成・真3D化は宣言しない。

## 2026-10-30｜斜め俯瞰の奥行き整合・遮蔽と道路質感（毎時改修）

**今回の重点（新システムの増築なし）**
- **立体描画の前後関係**：建物を先に描き、動物を常に前に描いていた問題を改修。廃墟の建物、植物、食料、街灯、動物を斜め視点の**画面投影後の奥行き**でソートし、建物の後ろの動物は壁面に隠れ、手前の動物は前に見えるようにした。既存の壁衝突と戦闘AIは変更しない。
- **草むら潜伏**：茂み本体を個体の後ろに描画し、手前の草葉だけを個体の下半身に重ねる。プレイヤーだけでなく、茂みにいる野生動物にも同じ処理を適用。
- **廃都の地面ディテール**：道路の亀裂と縁の植物侵食を、位置が毎フレーム変わらない決定的ノイズで追加。斜めカメラで画面外の細部は描かない。

**検証**：JS構文検査合格。モックDOM/Canvasで390×844／1280×720の2画面×狐・猫・狼3種＝計6セッションを実行。開始、斜めカメラ逆変換、Wキーの画面上方向、食料→潜伏→狩猟→目的地到達（任務4）の遷移、前景草、建物の前後からの動物描画を検証。別の6セッションではミッション4後の食料補給、タッチスティック押下・解除、ベストスコア保存も確認。A*迂回経路14点の各線分が建物を横断しないことを検証。**実ブラウザ・実スマホのスクリーンショット／操作／主観的な面白さは未検証。** この環境から公開サイトとGitHub rawへのHTTP接続はDNS解決失敗・IP直指定も接続失敗。モックで描画例外がないことは美術的品質の保証ではない。

**コミット**：`87baf7a481e2d499a5c8f9663f8cbd61fe46acd1`（描画深度ソート、草の重なり、道路質感）、`169a681cb4bb86779e9d95916883945c5054ee8b`（画面投影に合わせた深度順の補正）。

**進捗：20/100（据え置き）**。実機目視とユーザー評価が未実施のため数値を上げない。

**次回最優先**：①実ブラウザ画像でビル屋上・壁面・動物の奥行き矛盾を探して修正、②草むらの見え方と隠れ判定の一致を実画面で確認、③▲の迂回誘導と敵予兆の見やすさを狭い路地・スマホ画面で評価。大型機能は増やさない。**未完成**。

## 2026-10-30｜ユーザー選択「3」：雰囲気重視の立体感ある斜め俯瞰（試作・未評価）

**ユーザーからの新しい最優先フィードバック**：真上視点が安っぽい、草むらに隠れる描写が不自然、環境のディテールが不足して視認性が悪い。提示した視覚方向3案から「3：もっと雰囲気重視の立体感ある斜め視点」を明示選択。従来の真上視点維持案を優先しない。既存の操作・戦闘・ミッション・3種族・セーブは無断削除しない。

**今回の試作**：
- 平面物理・既存A*／衝突判定は変えず、描画を斜めの2.5D行列へ移行。マウス／タッチ／WASDの方向を逆行列で補正し、画面上方向が実際に上へ移動するようにした。
- ミッション▲、危険方向、索敵表示、ミニマップ視野、画面内表示判定を投影に対応。従来の直接減算座標に依存しない。
- 廃墟ビルを屋上の高さ・側壁・壁面の窓で立体化。草むらは同じ円形の9枚葉から深さの異なる葉の重なりへ変更し、隠れる個体の足元に前景葉を被せ、潜伏中を画面座標で視認可能にした。

**検証**：JavaScript構文確認合格。390×844／1280×720、狐・猫・狼の合計6セッションをモックDOM/Canvasで実行し、開始・画面座標の逆変換・上下操作・任務1～4の目標表示・茂み前景描画に例外なし。**実ブラウザの描画スクリーンショット／実端末タッチ／画面の美術的完成度／面白さの評価は未検証。** 今回の2.5Dは最初の試作であり、ユーザーが納得したとは評価しない。

**ゲームコミット**：`eaee48fb957ae1f80043a37836471670c510c069`（斜めカメラ・入力・HUDの座標連動）、`fbab51201a175460fc11a46692f02bb73898d287`（ビル壁面と立体的な茂み／潜伏表現）。

**進捗**：20/100（暫定。受入テストの実機結果がないため主観的目安。前回の18/100から大きく上げない）。

**次回最優先**：①実ブラウザ／スマホ実機相当のスクリーンショットで斜め視点の破綻（建物と生物の前後関係、壁際での見え方）を検証・修正、②草むらの遮蔽深度と潜伏時の輪郭を実画面で再設計、③地面・道路・廃墟の質感を増やしつつ任務・危険・プレイヤーの視認性を優先。MMO・PvP・世代交代・災害等の機能増築は当面見送る。

**進行運用**：ユーザーから更新の相談・指示が出たらWILD RECLAIM毎時タスクをまず一時停止。対応・修正／評価が終わった後に同タスクを再開。報告の進捗は必ず `○/100` で示す。**未完成**。

## 2026-10-30｜毎時開発 第10回：攻撃の危険方向表示・動物別モーション・スマホ操作残留防止

**対象**：`neo-wild/game.js` のみ。既存の3種族本能、食事→潜伏→狩猟→到達の▲任務、A*経路探索、犬の包囲、猪突進、アルファ跳躍、セーブ等を保持。設計正本は参照のみ。

- **攻撃の視認性**：プレイヤーの近くで攻撃を予備動作中の捕食者のうち、遮蔽物のない最も切迫した敵を選び、プレイヤー周囲へ敵の方向を指す赤い三角と「危険」を表示。残り0.29秒未満では黄色の「回避！」へ変化。既存の敵周辺の赤い攻撃範囲・予兆表示も保持。複数の敵から警告が乱立しないように最優先の1頭に限定。
- **動物別の体の動き**：猫は速い歩幅・大きな脚運び・細身の攻撃姿勢、キツネは弾む移動・伏せ気味の攻撃、オオカミは低い歩幅・重量のある攻撃姿勢に調整。色替えではなく既存の種別シルエットを維持して差を増強。
- **タッチの残留操作防止**：一時停止、画面非アクティブ化、メニュー移動、死亡／結果画面、再スタート時にスティックID・方向・攻撃長押し・キー入力をクリア。ポーズ中のスティック・攻撃ボタン入力を無視。押下状態のボタン装飾も解除し、ポーズ解除後に勝手に移動／攻撃する問題を予防。

**検証**：JS構文合格。モックDOM/Canvasで390×844と1280×720の各3動物＝計6ケースを実行。食料→茂み潜伏→初狩猟→目的地到着（mission 4）、敵の攻撃予兆「回避！」の描画、タッチスティック・攻撃ボタンの押下、ポーズ／復帰、blur後の操作解除・自動停止に合格。描画モーションはコードの実行確認であり、実際の見た目の品質評価ではない。**実ブラウザ目視・実機タッチ・長時間プレイ・面白さの評価は未検証**。外部のGitHub Pages URLへのネットワーク接続がこの実行環境ではDNS解決失敗のため、公開反映の直接確認はできていない。

**ゲームコミット**：`9e90027f978a501676dccce7bfdec860581502b1`（主要改修）、`17b31a012e2304d01460c0326303176430d9a482`（警告円弧を敵方向へ補正）、`539a523ea52a4fd6db1330a3da9c0af5fa91f849`（タッチボタンの押下表示を解除）。

**次回優先**：①実ブラウザで攻撃予兆・キャラ姿勢・タッチUIの見た目と操作を確認、②狭い路地で野犬が詰まる／追跡が不自然に続く問題の再現と改善、③草むらを利用した逃走と奇襲の手応えを検証。大型MMO・世代・災害の増築は引き続き保留。**未完成**。

## 2026-10-30｜毎時開発 第9回：野犬の側面包囲・アルファの予兆付き跳躍

**対象**：`neo-wild/game.js` のみ。既存の▲A*誘導、潜伏・狩猟・3種族本能、猪突進、セーブ・UI等は維持。設計正本は参照のみ。大型MMO／世代／災害機能は追加しない。

- **野犬の挟撃**：複数の野犬がプレイヤーの左右後方へ別々の経路で接近。距離120px以内では側面回りをやめて直接攻撃する。移動中のプレイヤーの向きと障害物を考慮し、既存のA*経路を利用。
- **アルファの固有攻撃**：犬と同じ即時近接から、約0.72秒の直線予兆→約0.24秒の方向固定跳躍へ。横回避で外れ、空振り・壁衝突後に反撃の隙。猪の長い突進はそのまま保持。跳躍中は軌跡と赤い攻撃範囲を表示。
- **見た目**：アルファだけ大きな首周りの逆立つ毛と牙を追加。既存の犬・狼の輪郭、他動物のシルエットを変更しない。

**検証**：JS構文合格。モックDOM/Canvasで390×844と1280×720の各3種族、計6ケースの食事→潜伏→狩猟→目的地→継続目標、▲描画、R固有能力が合格。野犬2頭の左右からの包囲、アルファの跳躍命中・横回避、既存猪突進を各確認。追加で2画面×3種族の計6ケースについて、タッチスティック移動・回避・固有能力・画面非アクティブ時の一時停止と復帰を模擬テストで確認。計16ケース。実ブラウザでの視覚確認、実スマホのタッチ操作、狩猟の面白さ、長時間プレイは未検証。

**ゲームコミット**：`367275744dae3b2ba70ab5fcb2e465afad0560cb`。

**次回優先**：①野犬の包囲が狭い路地で詰まらず、警戒解除後に不自然に追い続けないか実プレイ検証、②アルファの跳躍予兆・当たり判定とスマホ回避の視認性、③動物3種の移動・攻撃アニメーションを実画面で評価。未完成。

## 2026-10-30｜毎時開発 第8回：猪の直線突進と回避・反撃の駆け引き

**実装対象**：`neo-wild/game.js`。他ゲーム・ブログ・サイトトップ・他タスク・設計正本の変更なし。既存の動物選択・固有本能・潜伏奇襲・▲任務・A*経路・レベルアップ・天候・セーブ記録を維持。

- **猪の攻撃を独立した行動へ変更**：従来の犬・アルファと共通の即時近接判定から、約0.76秒の予兆→向き固定の約0.36秒直線突進へ。プレイヤーが横へ回避すれば追尾せず外れる。長い矩形予兆と突進軌跡を描画し、攻撃開始時の狙いを視認可能にした。犬・アルファの近接攻撃は維持。
- **実際の接触判定**：突進移動区間とプレイヤーの距離で接触を判定し、1回だけダメージ。無敵時間と壁遮蔽を尊重。建物への衝突で猪が硬直し、回避された突進も終了時に反撃可能な硬直が発生する。
- **プレイヤーの反撃**：既存の攻撃による予備動作中断・硬直付与に加え、突進中の猪への命中でも突進を中断。狙いを見て避けて反撃する短い戦闘サイクルを優先した。数値は暫定バランス。

**検証**：JS構文合格。390×844・1280×720の2画面×キツネ・猫・狼の計6ケースで、食事→潜伏→初狩猟→目的地到着、▲描画、R固有能力の回帰試験合格（モックDOM/Canvas）。猪の直進攻撃は静止プレイヤーに18ダメージ、予兆開始後の横移動では被弾なし。突進を外した場合の硬直約0.52秒、建物への衝突で侵入なし・硬直約0.57秒を確認。初回の壁試験は衝突地点へ到達する前に判定して失敗したため、到達までのフレーム数を修正して再試験し合格。実ブラウザ画面目視、実端末タッチ、実際の面白さ、長時間性能は未検証。

**ゲームコミット**：`3fb649d18cd5a6a60dd61339f54b1e7d0dfc3fbd`（突進の基本実装）、`852f41c690253d767d3441bc42aa8b3ec33eff0f`（回避後の硬直・壁衝突判定改善）。

**次の最優先**：①猪の予兆・突進・反撃の実画面での視認性とスマホ回避ボタンの操作性、②犬とアルファを含む捕食者AIの駆け引き・適切な攻撃頻度、③草むらと建物を利用した狩猟・逃走の実プレイ検証。MMO・世代継承・災害の大規模実装は引き続き保留。**未完成**。

## 2026-10-30｜毎時開発 第7回：狐の跳躍を物理化・獲物の逃走を種別化

**対象**：`neo-wild/game.js` のみ。既存のミッション、▲A*経路、潜伏・索敵、敵攻撃予兆、3種族固有能力、進化、天候は保持。設計正本は参照のみ。

- **狐眼の跳び込み**：従来の攻撃ボタンを押した瞬間に最大53px移動するテレポート式から、約0.18秒の物理移動に変更。進行中は体を伸ばす姿勢と軌跡を表示。既存の経路遮蔽判定と各フレームの衝突判定を通し、攻撃発生は着地後へ調整。回避入力による中断を維持。
- **着地時の滑走不具合修正**：初回試験で跳躍終了後に移動速度が残り、53pxの上限を超えて合計72.3px滑ることを発見。着地時に跳躍速度をゼロにして修正。
- **獲物の逃走差**：ネズミは短い間隔で向きを変え草むらを優先、ウサギは長めの直進ダッシュ、ハトは横方向のフェイントを優先。逃走中の加速係数と方向転換間隔を種別化。既存の逃走疲労・壁回避・視覚／聴覚／匂い感知は維持。

**検証**：JS構文合格。狐眼跳躍を実行した直後の位置変化0px、約0.067秒後19.6px、着地後53px、対象への攻撃41ダメージをモック物理・Canvasで確認。ネズミ／ウサギ／ハトの逃走選択方向が異なることを確認（試験環境で-0.88／0／+0.88rad）。390×844のタッチ操作、1280×720のキーボード操作で狐・猫・狼の計6ケース：移動、食事→潜伏→狩猟→到達→継続探索、▲描画、固有本能、衝突しない位置・有限HPに合格。

**ゲームコミット**：`4a8a2ecdf6e73fb4e26d860f1a9c2483228977e3`。

**残課題**：実ブラウザでの描画目視・実端末タッチ・長時間プレイ・楽しさの評価は未実施。狐の跳躍を敵の移動／壁角／連続入力でさらに検証。獲物の種別逃走が実プレイで単調にならないか、狭路や複数障害物で▲と敵AIが安定するか確認。大規模新機能は引き続き保留。**未完成**。

## 2026-10-30｜毎時開発 第6回：獲物追跡の固定・タッチ攻撃補正・種族別の操作差

**対象**：`neo-wild/game.js` のみ。既存機能を削除せず、設計正本は参照のみ。大型システム追加なし。

- **▲狩猟目標の固定**：獲物が生きて近距離にいる間は同じ個体を追跡。近くを別の獲物が横切っても任務マーカーが瞬間移動しない。死亡・消失・大幅な距離離脱時は自動再選択。逃走方向へ0.22秒の先読み座標を案内し、先読み先が建物に入る場合は実位置を使う。従来のA*迂回・障害物判定は維持。
- **攻撃方向の微補正**：スマホの単一攻撃ボタンでも正面付近の獲物へ攻撃を当てやすいよう、見えていて壁に遮られていない相手に限定して小さく旋回。背後への自動振り向き・壁越し攻撃は行わない。猫は素早く、狼は重く旋回。
- **動物の固有操作感**：狐眼発動中の攻撃は建物を越えない短い跳び込み（最大53px）を行う。猫は加速・鋭い旋回・短い回避再使用待ちと本能中の強化回避。狼は低い加速・遅い旋回・短い重い回避。既存の本能、攻撃予備動作、潜伏奇襲、敵AI、▲任務は維持。

**検証**：JS構文合格。390×844／1280×720の2画面×狐・猫・狼の6ケースで、食料→潜伏→狩猟→目的地到着→継続探索、▲描画、本能、目標固定、猫の強化回避・狼の重い回避をモックDOM/Canvasで確認。追加の直接戦闘試験で、狐の跳び込み約41pxと命中、猫の旋回補正と命中、狼の旋回制限と命中を確認。最初の単体試験では獲物を猫の射程外に配置して失敗したため、実際の射程内で再試験して合格。射程そのものの不具合ではない。

**ゲームコミット**：`e610f517195be56ef8427842f20014c8df52aabd`。

**残課題**：実ブラウザ画面目視・実端末タッチ・長時間プレイ・面白さの評価は未実施。次回は狐の跳び込みと障害物の境界、猫の回避と敵の予兆、狼の重量感を実画面で調整。移動目標の予測が複数障害物を跨ぐ場面と、狭い通路の▲を引き続き検証。PvP/MMO・世代・災害は保留。**未完成**。

## 2026-10-30｜毎時開発 第5回：追跡負荷・▲視認性・到達可能な食料

**対象**：`neo-wild/game.js` のみ。既存機能を維持し、他ゲーム・サイト・ブログ・タスク・設計正本は変更なし。

- 捕食者のA*再探索を1フレーム最大2件に制限。経路が未計算の個体は従来の局所回避で動き、次フレーム以降に順次探索。多数の捕食者が同時に追跡しても同一フレームへ経路探索が集中しないようにした。
- 経路の壁判定を18px刻みの反復サンプリングから、移動する動物の体格を考慮した線分と拡張矩形の厳密交差判定に変更。長いA*経路と斜めの建物角を含めた安全性を維持しつつ計算量を削減。
- ▲任務マーカーがミッションパネル・スマホ操作領域に重なる場合は、可視領域へ移動して方向を表示。画面内目標でも端に隠れないようにした。
- 食料が壁際にあり、動物の中心がその座標まで進めない場合、拾える距離にある到達可能な地点を探して▲を案内。新規食料は体格を考慮して障害物近くに生成しない。建物越しの食事を禁止。

**検証結果**：
- JS構文合格。250件のランダム線分・4体格の経路判定を2px刻みの独立サンプリングと比較し、不一致0件。
- A*経路4ケース（単一建物・複数建物・狭い通路・壁際食料）で全経路区間の衝突なし、▲経路探索成功。
- 壁際食料の到達点補正：食料の41〜42px手前の衝突しない地点を案内できることを確認。
- 390×844と1280×720で狐・猫・狼の計6ケース：開始→食料→潜伏→狩猟→到着→継続探索、▲描画、本能、キーボード移動、一時停止・復帰、体格別経路、有限座標・非衝突をモックDOM/Canvasで確認。
- 18頭の捕食者を同時に建物の反対側から追跡させた120フレームの負荷試験：最大2件/フレームのA*再探索、18頭すべてに有効な迂回経路、障害物への侵入0件。
- ▲の画面重なり4ケースをモック矩形で検証。

**コミット**：
- `77f833db315be637272c4e703fb1829828086977`：A*負荷分散・線分衝突判定・壁越し食事防止。
- `ddb3e4cc24b72aae7c159f3dcb2d5448bb915455`：▲マーカーの重なり回避・壁際食料への到達可能な案内。

**未検証・次回優先**：実ブラウザの画面目視、実端末タッチ操作、HUDの狭い画面での重なり、実プレイの面白さ、長時間負荷。次回は実際の動物の操作差と獲物の逃走・追跡の駆け引き、▲の狭い通路での誘導を重点確認する。PvP/MMO・世代・災害の新規実装は引き続き保留。**未完成**。

## 2026-10-30｜毎時開発 第4回：追跡AIの壁詰まり修正・種族別の攻撃特性

**実装範囲**：`neo-wild/game.js` のみ。設計正本は参照のみ、既存の他ゲーム・サイトファイルは変更なし。

- 野生動物の視覚を全方位自動発見から種別の視野角に変更。視線・遮蔽物・草むら・足音・匂いを考慮し、遮蔽物越しの音は減衰するが完全無音にはならない。獲物は遠くで警戒停止「?」、接近や大きな音で「!」逃走に切り替える。
- 逃走先の短距離経路を壁判定し、草むらを選びやすくした。見失った後も障害物を確認して逃走方向を修正。
- 捕食者が建物に向かって走り続ける問題を再現・修正。既存のA*を追跡者の体格に対応させ、サイズ別グリッドをキャッシュし、道順を順番にたどる。経路の先を無理に飛ばす方式は壁際で往復する不具合を確認したため採用しなかった。最後に見た位置への追跡記憶は5.5秒に調整（暫定）。
- 攻撃に種別の間合い・角度・スタミナ消費・硬直・ノックバック差を追加。狐は中距離・中程度の硬直、猫は短い間合いと速い軽撃、狼は広い間合いと強いよろめき。壁越し・建物角越しに近接攻撃が命中する不具合を修正。スタミナ不足時の連打を抑制。
- ▲任務案内、4段階ミッション、狐眼／俊足／咆哮、潜伏奇襲、敵攻撃予兆などの既存機能は維持。

**実行テスト（モックDOM/Canvas）**：JS構文合格。キツネ・猫・狼×390×844／1280×720の6ケースで移動（タッチスティック／キーボード）、衝突、食料→潜伏→狩猟→到着、▲描画、種族固有操作（タッチ／R）、一時停止・復帰、体格別A*の全経路区間が建物を横切らないことを確認。捕食者を建物の反対側へ配置した7秒の実AI更新で、距離544→2に縮まり、壁詰まりが解消するケースを確認。3種族それぞれ壁越し攻撃の不成立・開放地の命中・スタミナ消費と息切れを確認。視野の前後判定も確認。

**制約・未検証**：実ブラウザの目視、実端末タッチ、長時間の性能・多数の捕食者が同時に経路探索する負荷、実プレイの面白さ、ネットワーク接続は未検証。A*の行き止まり・密集地形、警戒と逃走の数値は継続調整。完成ではない。

**コミット**：
- `f07fd51eff7fa0d77f2e7ea52c0b1e3dbb3d4057`：野生動物の方向別感知、警戒・逃走、初期追跡回避
- `71bb90efe807ff1fc744563eb570f7f348dadaa1`：種族別攻撃、疲労、壁越し攻撃防止
- `10b87d180780a6fc078f075ebac5229c457393ce`：体格別A*追跡と建物迂回
- `516fcb5a1e4f98b11f2b06a0457b8a6eb4d7bf00`：見失い追跡時間と逃走中の経路補正

**次回優先**：①実ブラウザで動物・HUD・▲と敵予兆の視認性を確認、②実際の狩猟／逃走のプレイバランス、③同時追跡時の経路探索負荷と動く目標への追随、④スマホでボタン誤操作・表示重なりを解消。新しい大型機能の追加は引き続き保留。

## 2026-10-30｜毎時開発 第3回：潜伏奇襲・獲物の疲労・警戒可視化

**実装（neo-wild/game.js のみ）**
- 草むらで潜伏したまま攻撃を開始すると「奇襲」判定。通常攻撃の1.55倍の威力と長い硬直（0.92秒）を付与し、攻撃・回避後は約1.15秒間潜伏を解除。狐眼の次撃強化とは併用可能。無限に潜伏攻撃を繰り返す挙動を抑制。
- ネズミ・ウサギ・ハトの逃走に体力（内部値）を追加。初動は速く、長く追いかけると速度が落ち、逃走をやめた後は回復する。逃走方向の候補で茂みを選びやすくし、追い詰め・待ち伏せの選択を増やした。数値は試験中で確定仕様ではない。
- 敵・獲物の頭上に「!」の警戒、「?」の探索を表示。プレイヤーの攻撃予備動作には扇状の進行表示を追加し、いつ攻撃が当たるかを視覚化。既存の赤い敵攻撃予兆と▲任務案内は維持。

**テスト**
- JS構文: 合格。
- モックDOM/Canvasの3種族で「食料→潜伏→狩猟→目的地到達→継続探索」、逃走エネルギー低下、潜伏奇襲のダメージ・硬直・解除、R固有能力、▲描画: 合格。
- 390×844（タッチスティックと本能ボタン）および1280×720（キーボードとR）で3種族ずつ計6ケース: 移動、障害物非侵入、座標・HP有限、任務▲表示、能力名を検証し合格。
- **未検証**：実ブラウザ目視・実機タッチ・音声・長時間負荷・面白さの実プレイ評価。モックの成功を実機品質の保証とみなさない。

**コミット**: `d21107138dc5db552aa6be4d14e35c440a0cf367`（game.js）

**次の最優先**
1. 実ブラウザ・実機で攻撃タイミング、警戒記号、種族ごとのシルエットと動き、▲とスマホHUDの重なりを目視確認して調整。
2. 追い込みのバランス（逃走体力・茂みへの逃げ込み・狐眼との相性）と、敵の見失い・再発見の挙動を実プレイで改善。動物別に異なる戦術が成立することを確認。
3. A*誘導の長距離負荷、移動する獲物、行き止まりのルートを検証。不要な新システムは増やさない。

## 2026-10-30｜毎時開発 第2回：逃げられる戦闘・迂回できる▲・動物の歩行

**今回の実装（GitHub main、neo-wild/game.js のみ）**
- 敵の即時接触ダメージを廃止。犬・猪・アルファは攻撃前に停止し、赤い扇形の予兆（約0.53〜0.76秒）を表示する。予兆の向きと距離を見て回避・離脱でき、プレイヤーの先制攻撃で敵の攻撃を中断可能。攻撃判定には方向・距離・遮蔽物・無敵時間を使用。
- 小動物が建物に向かって逃げ続けないよう、周囲の開いた方向を評価する逃走判断を追加。被弾時のノックバックは壁衝突を尊重。
- ▲誘導を単一の建物角選択から、歩行可能グリッドのA*経路探索へ変更。複数建物の迂回、斜め移動の角抜け防止、直進可能な経路の短縮、目標移動時の再計算、経路が見つからない場合の誤案内抑制を追加。
- 動物の脚アニメーションを実移動距離と連動。静止中にNPCの足が動く不具合を修正。キツネ・猫・狼の尻尾に歩行連動の揺れと体の上下動を追加。

**検証**
- JS構文チェック合格。
- 敵戦闘4ケース：予兆前に即時被弾しない／予兆中に離れると回避成功／逃げなければ命中／プレイヤー攻撃で敵予兆を中断、すべて合格（モックDOM/Canvas）。
- A*経路7ケース：道路上の目的地への複数建物迂回を計算し、各経路の全区間で障害物を横切らないこと、▲が現在地から到達可能な位置を指すことを検証。
- 390×844と1280×720でキツネ・猫・オオカミの合計6ケース：開始→食料→潜伏→狩猟→目的地→継続探索、本能ボタン表示、▲描画、例外なし。
- **未検証**：実ブラウザでの目視・実機タッチ・描画の美観・プレイの面白さ。実ブラウザでの公開URLアクセスは環境の外部接続制限で失敗。これらを合格と主張しない。

**コミット**
- `fe5c1942691ef602722b32b174b07117514ee2c9`：敵攻撃予兆・回避・中断、獲物の障害物回避
- `333b6e807d94d8208d33ddabf8f81066bf998923`：A*迂回誘導
- `e9f53c58917f55ca8cc2ebb8b462b389334c60e7`：動物の歩行と尻尾アニメーション

**次の最優先**
1. 画面の見た目を実ブラウザで確認し、動物の輪郭・視認性・攻撃予兆・スマホの操作性を調整。実機テストは可能な環境で実施する。
2. 狩りの追い込み・障害物を利用した逃走・敵の警戒/探索を深め、短時間でも駆け引きが成立するよう調整。単なる移動速度の違いで終わらせない。
3. A*経路の行き止まり・目標が建物に近い場合・目標が動く場合を追加検証し、経路探索の負荷とキャッシュを最適化する。

## 2026-10-30｜操作と面白さの根本見直し（ユーザー指摘の最優先対応）

ユーザー評価: 「あまりにも面白くない」「キャラが全部一緒」「司令がある場合は矢印（▲）で誘導」。既存の延長線で機能を増やすのではなく、基礎の楽しさを改善する。評価が改善したと決めつけず、実際のプレイ感想を最重視。

- 任務を受動的なDAY待ちから、食料採取→草むら潜伏→獲物の狩猟→旧新宿駅へ移動に変更。以降も補給と狩りの目標を循環させ、一定日数で強制終了しない。
- 任務対象への「▲」を画面内／画面端に描画し、ミニマップ、任務説明にも目標の距離・行動方法を表示。
- 導入時に食料と潜伏できる茂みを保証。再試行時に茂みを重複生成しない。目的地はマーカー付近まで実際に近づいて達成。
- 種別の見た目を描き分け。狐は大きな白先端の尾と鋭い鼻、猫は細身・曲がる尾・縞・ひげ、狼は大型の肩・鬣・太い四肢・立ち耳。猪・鼠・兎・鳩も独自のシルエットへ。
- Rキー／スマホ専用ボタン「本能」を導入。狐「狐眼」＝索敵＋次撃強化、猫「俊足」＝短時間加速、狼「咆哮」＝小動物への威圧。ボタン表示を選択した動物に合わせる。
- 既存の潜伏、攻撃、回避、食事、索敵、レベルアップ、マップ／天候等は残す。

検証: JS構文チェック合格。390×844のモックCanvas/DOMで狐・猫・狼を選択し、食料→潜伏→狩猟→目的地→継続探索の進行、Rで種族ごとに異なるメッセージ、▲描画を検証済（修正前の近接到達判定で合格、到達条件の狭域化は別途実機検証が必要）。実ブラウザでの目視／タッチ実機操作は未検証。**完成ではない。**

追加コミット: `8b9bf25766d01d277e4c596df723a7561dcc8c2d`（▲の初期迂回誘導）。検証追加: 390×844/1280×720、3動物の合計6ケースで食料→潜伏→狩猟→実際の目的地接近→探索継続・種固有R・▲表示をモックDOM/Canvasで確認。

今回の更新コミット: `26ccabacb4748e701e5b3bc0244cf2571bd0ff0a`（任務）→ `2cd5b3f9d6130083dcd862ab60f67e4aa351774`（操作UI）→ `743ed4bfc1865ef0a878c28e1f43e76048a1ba4b`（CSS）→ `9fdc5190de1ab336bbf443a82d6c1b705c02b42f`（専用能力）→ `5ff23df49e67501cb5a114d61652098c686c7698`（動物描画）→ `df692581494d189d8edcab70ee94d34b85f79140`（任務到達判定）。

次回の優先事項（過剰な新機能追加禁止）:
1. 実ブラウザ／スマホ視点でキャラの形・攻撃・効果音・操作・▲表示を視覚検証し、違いが十分に伝わるまで作り直す。情報過多や矢印がUIの裏に隠れる問題を修正。
2. 狩りと逃走のゲームプレイを改善。獲物AIの恐怖・行動変化、危険な敵の予兆、動物ごとの戦闘手応え、適正な敵密度。退屈な待ち時間を作らない。
3. ▲の初期迂回誘導を実装（直接経路が建物に遮られるとき角を選び、一定間隔で再計算）。複数の建物、狭い路地、カメラ端での経路の安定性を次回検証・改善する。
4. 既存機能を保持し、エラー検証後にGitHub mainへ保存。スコープは neo-wild/ のみ。

## 今回の実装 (初回開発)

- `game.js`: 動物別の加速・減速と旋回補間、壁衝突時の速度抑制。
- `game.js`: 大型草むらの生成と描画、静止・低速時の潜伏判定、潜伏中の視覚表示。
- `game.js`: 敵の遮蔽物越しの視認禁止、天候・夜間・潜伏・足音・風下の匂いによる発見判定。敵は最後に確認した位置へ向かい、見失うと短時間探索する。
- `game.js`: 攻撃を予備動作→命中判定に分割。回避で未発生の攻撃をキャンセル可能。
- `index.html`: PCのCキー潜伏とタッチスティックの低速潜伏を案内。
- 既存の3動物、ミッション、アップグレード、回避、索敵、採餌、スコア表示は維持。

## 検証

- JavaScript構文チェック: 合格。
- DOM/Canvasを模した起動・物理・AIのテスト: 起動、加速、草むら潜伏、敵の発見/未発見、建物遮蔽、攻撃予備動作、遅延命中の8項目合格。
- 390×844の縦画面相当の描画・80フレームの潜伏移動・回避・索敵・採餌・追加100フレームの更新と描画: 例外なし、座標・HP有限。
- 未検証: 実端末でのタッチ操作、長時間耐久、実ブラウザの描画品質、オンライン同期、実サーバーの負荷。

## 変更履歴

- game.js: `fd67d42ba122da7325423119e200e4428ae81976`
- index.html: `c71ed96e2656eb513f0768241149013a637f4ffa`
- 本ロードマップ作成直前のmain: `c71ed96e2656eb513f0768241149013a637f4ffa`

## 次回の優先事項

1. 潜伏の効果が分かる警戒表示、敵の探索時の挙動改善、風向きと音の見える化。
2. 戦闘の手応え（攻撃予備動作の表示、敵攻撃の予兆、被弾フィードバック）、狩猟・逃走のバランス。
3. 巣・餌の備蓄・家系図・世代継承の最小垂直スライスと保存機構。

## 未実装・技術課題

- MMOサーバー、共通世界、PvE保護とPvP、協力・群れ、オンライン永続保存。
- 親子・繁殖・老化・生前交代・瀕死・永久死亡、陸・空・水の全操作種。
- 四季・天候の生存影響、災害・隕石、ARKの物語、世界史、ボスの生活AI。
- 旧仕様の3日目到達による強制終了は、2026-10-30の能動的な継続ミッションへ置換済み。長期世界と永続保存は依然未実装。
- 現在のlocalStorageはベストスコアのみ。ワールドと個体の永続保存は未実装。
- GitHub Pagesは静的ホスティングのため、MMOの完成には別途認証・権威サーバー・データベースが必要。
- 設計書内の寿命・災害頻度・瀕死猶予の数値は暫定。確定扱いしない。

## 完成判定

操作・戦闘・潜伏・敵AI、世代継承と家系図、一族全滅後の世界継続、PvEの対人被害完全防止、PvP、陸空水、天候・災害の予兆と回避、セーブ復元、スマホの操作品質、オンライン同期の実測を満たすまで未完成とする。
