## 2026-11-03 15:20 JST｜自キャラ3D不可視・YOU位置・パッド案内右上被り修復｜PHASE=A_FEATURES｜ACTIVE_SPRINT_ID=EXPANSION-V1-YEAR-ERA-WORLD
- **ユーザー画像**：潮見の水路AREA08/08、YEAR013、画面中央でYOUと接地円が見えるが、自キャラ3D本体が見えない。パッド操作説明が右上設定を覆っている。
- **描画の実修正**：`webgl3d.js:render`で静的建物/地形とNPCの後に描く自キャラの直前のみ深度バッファをリセット。地形に隠れたまま文字/円しか表示されないケースを防ぎ、モデル内部はLEQUAL深度テストのまま描き、暗所の自キャラだけ最低輝度を設定しshader uniformを復元。`game.js:drawScene`のYOU/円に`WildMountain.height(P.x,P.y)`を反映して、3Dモデル足元・頭上とマーカーの標高を一致させた。物理/操作/保存座標は未変更。
- **HUD実修正**：`visual.css:#gamepad-status`を右上から左上（横長デスクトップでは体力表示の右隣、x約300px）へ移動。横狭/縦/低背横画面でも左に留め、右上の地図/音/全画面を妨げない。パッド割り当ては変更なし。
- **SHA**：`webgl3d.js` commit `22c3b395` blob `572e403e`、`game.js` commit `00b11462` blob `aab8ed8c`（20分枠による後続の生態更新を保持）、`visual.css` commit `70d01f18` blob `4d4c22f6`、`index.html` rev commit `cbb35240`。最新script参照は他枠の変更後のgame.jsを含み、`webgl3d.js?rev=22c3b395-player-visible`、`visual.css?rev=70d01f18-pad-left`。ROADMAP前HEAD `d7f9ee71035132643a4e841bfe6c0a9181895e6a`。`neo-wild/`以外は不変更。
- **試験**：最新game.js/webgl3d.js構文、実`animal`で猫/犬/狐/狼の座標・標高+180・モデル部位25～29の生成、WebGL描画順通常/潜伏両形態・輝度復元、YOU/円標高、CSS横縦配置、HTML参照とSAVE_SCHEMA2維持＝**23/23 PASS（V8隔離/静的回帰）**。ユーザー環境の実WebGL・実ブラウザ/Pad/縦横表示のE2Eは**未検証**。74/100据え置き、PHASE A継続。
- **次00分枠**：`game.js:restoreSnapshot/drawScene`で再開/死後リトライ・山地/運河のモデルとYOU位置を実ブラウザ確認。**次20分枠**：`game.js:maintainLocalWildlife` の生態新機能とモデル修正が競合していないか監査。**次40分枠**：`webgl3d.js:render/animal`と`visual.css:#gamepad-status`をPC 1840x820、横844x390、縦390x844、実パッドで視覚QA。深度リセットでプレイヤーが建物の前景に見えるデザイン上の影響も検討。
- **Pages**：最新HEADのbuild・deployをActions run/jobで確認する。

## 2026/11/03 15:20 JST｜20分枠｜地域生態を実際の動物密度・採食へ接続｜PHASE=A_FEATURES｜ACTIVE_SPRINT_ID=EXPANSION-V1-YEAR-ERA-WORLD
- **新たに実装された実プレイ機能**：5年ごとの地域別生態遷移（平穏/緑化/豊穣/乾燥/捕食圧）を、近隣野生動物の目標密度に接続。地域の `animals` 倍率を現在の気象別目標に掛け、上限 `WILDLIFE.localCap` を維持しながら補充数が変化する。採食動物は地域 `food` 倍率に応じて餌を探す距離と実際の食事による空腹回復が変化。既存の実ベリー/草/山の採食地点を使用し、架空の餌は作らない。旧セーブ形式や動物座標は変更しない。
- **変更**：`game.js:maintainLocalWildlife/forageWildBerries` commit `a6b82c52`、`index.html` cache rev commit `05378379`。直前の致命的表示修復：`webgl3d.js` `22c3b395`、`game.js` `00b11462`、`visual.css` `70d01f18`、`index.html` `cbb35240`。3枠の同時作業は最新mainの対象blobを照合して続行。
- **検証**：現行 `game.js` JavaScript構文 PASS、関数の既存入口・食料実体・地域別倍率・上限式を静的照合。**未検証**：実ブラウザでの長期5年境界・旧SAVE2/3CPロード・スマホ縦横/Pad・WebGL描画・Pages deploy。未検証を完成扱いしない。
- **V1.0機能管理**：世界時計=途中／年代進化=途中（地域別密度/食事へ統合）／地続き世界=途中／通常気象=途中／災害=途中／異常存在=途中／初期10種・寿命家系=途中／トロフィー200+=途中（64件）／追加12要素=途中（採食/食物連鎖/死骸など一部）。PHASE A維持。進捗74/100据え置き（実機検証不足）。
- **次40分担当**：`WildEraEcology.state(regionAt(x,y),elapsed/120)` の `kind/food/animals` を実際の地表植生と採食地点の視覚差へ接続。プレイヤーの円/「YOU」と3D動物の表示座標を実機で確認。**次00分担当**：地域別食料・生態状態を世界年表・永久履歴に結線し、`maintainLocalWildlife` と `forageWildBerries` の旧SAVE2/3CP回帰、出生上限と世界年120秒の境界を検証。

## 2026/11/03 15:00 JST｜00分枠｜5年ごとの地域別生態変動を実プレイに接続｜PHASE=A_FEATURES｜ACTIVE_SPRINT_ID=EXPANSION-V1-YEAR-ERA-WORLD
- **新規実装した実プレイ機能**：世界20年以降、8地区それぞれで5年ごとに独立した確率判定を行う生態遷移。平穏／緑化／食料豊富／乾燥／捕食圧の5状態を導入。年齢段階に応じて変動確率が20〜39%で上がるが、節目で必ず発生するわけではない。乾燥地域は野生動物の新規出現率を78%、地上ベリーの発生率を62%へ低下。緑化/豊穣は生息地状態の変化を計算し、現行スポーン上限を破らず次枠で繁殖/密度増加へ接続。地域内で5年の変動が発生すると日本語通知。既存の火災跡の生息地品質、地形衝突、水域禁止、上限76/近隣9、旧SAVE2を維持。変動は世界年・地区IDの決定的ハッシュで再現され、リロード/死亡後も同じ年代の同じ地域で同じ状態。長期世界史API `WildEraEcology.history(year)` は過去約100年の非平穏イベントを最大64件返す。
- **SHA**：新規 `era-ecology.js` commit `7c6a4804` blob `7372b252`、`game.js` commit `6921d175` blob `f0e995c4`、`index.html` commit `1b025ed1` blob `e353cbee`。変更範囲はneo-wild/のみ。世界時計 `WildWorldClock.at` の120秒/年を継承。競合確認は各対象blobの最新mainと照合済。
- **検証**：V8で現行モジュール実行・年齢/地区の独立判定・初期20年平穏・同一年再現性・500年継続・履歴・状態境界・game.js構文・HTML読込順・スポーン/食料結線を **12/12 PASS**。**未検証**：実ブラウザの地域移動/年跨ぎ、旧SAVE2/3CP、スマホ、Pad、GPU/FPS、Pages最終deploy。**機能状態**：世界時計=途中／年代進化=途中（5年地域別抽選+餌/出生への実接続は機能統合済・実機未検証）／地続き世界=途中／気象=途中／災害=途中／異常存在=途中／初期10種・家系=途中／トロフィー200+=途中（64/200+）／追加12要素=途中。PHASE A維持、74/100据え置き。
- **次20分枠**：`WildEraEcology.state(regionAt(x,y),elapsed/120)` の `animals/food/kind` を群れの移動先、野生個体の地域滞在・繁殖、餌場選択へ接続。緑化/豊穣で実際に餌量・群れ密度が増えるようにするが、既存9/76上限を維持。**次40分枠**：状態 `kind/name` を地面植生・地域マップの視覚表現へ接続、5年遷移の通知と実画面検証。**次00分枠**：`WildEraEcology.history(year)` を世界年表UI/永久記録へ統合、既存 `WildDisaster.history()` と合成し、家系・世代継承を実装。
- **公開**：Pages run/job結果は別途確認。実機未検証を完了扱いしない。

## 2026/11/03 15:04 JST｜潮見の水路・マーカー重複/野生敵欠落修正と全地区地名の和風統一｜PHASE=A_FEATURES｜ACTIVE_SPRINT_ID=EXPANSION-V1-YEAR-ERA-WORLD
- **修復した実プレイ**：旧「江東運河」（和名変更後「潮見の水路」）では開始座標と探索地点がともに(7000,4850)で、ミニ/全体地図上の探索/ミッション/自キャラマーカーが同一点で重なり視認しにくかった。player周辺65m以内では探索地点アイコンを省略し、目標近接時の重ね描きを抑制。ミニマップの方向角を有限値に正規化し暗い円枠＋白矢印、全体地図は世界座標に正しく投影した方向矢印＋縁取りへ変更。保存座標・探索地点IDは変更しない。
- **野生敵欠落の対策**：旧SAVE2の遠方NPCを維持したまま、`game.js:ensureLocalPredators`で地域7（潮見の水路）の近隣に一般敵最大2体（猫/犬/毒蛇/タヌキ）を保証する復旧処理を追加。新ゲーム初期13体の枠に算入し、リロード直後と9秒周期の地域補充にも接続。出現時は水域・実衝突・巣の安全圏・地域境界・実移動経路をチェック。旧セーブに近隣9枠すべて草食動物がいる場合は、画面外の非戦闘草食だけ最大2体を移住扱いで再配置余地を作り、陸上生物の上限（世界76、周辺9）を超えない。既存の狩猟・経験・死骸保存は維持。
- **和風の地名**：配列の地区番号と保存中の探索IDは固定したまま、地区は霞町の廃庁街／桜坂駅跡／蔦ヶ丘の古町／白鷺の獣舎跡／朝霧川の土手／楠の森／汐浜の廃工場／潮見の水路へ変更。出発地、探索地、群れ名、駅マーカー、HTML選択肢、世界地図見出し・紹介文も一致させた。英語タイトル WILD RECLAIM はプロジェクト固有名として維持。
- **変更**：対象は`neo-wild/game.js`のみ：`d658013b`（地名/マーカー）→`cb4073a2`（敵の局所再補充）→`4fcdd0ef`（9枠草食で満杯の旧SAVE2への復旧）。`neo-wild/index.html`：`e9e9ea48`（和風HTMLとscript rev）→`7c8d76a0`（最終rev）。他ゲーム/サイト/ブログは変更禁止を維持。ROADMAP追記前HEAD `7c8d76a0cd1dc6d866814f3afabb8089cfdefee3`。現行game.js blob `0c9c61154649f10f57ec1c82269bbf28bb878a55`／index.html blob `cfebdb0fc467cf573540294eaae4c704fad5c9b6`。
- **検証**：現行関数`spawnMob`+`ensureLocalPredators`をV8で実行し潮見水路から安全な河岸の肉食/敵2体、既存動物上限維持、復元時草食だけの地区への再配置、二重補充なしを確認。別途9枠が草食で満杯のSAVE2想定で再補充2体、移住対象7体保護、冠水回避を検証。V8隔離/構文・静的結線の合計**33/33 PASS**。実Android・物理パッド・ブラウザ上のキャラマーカー描画・実SAVE2/3CP・長時間FPSは**未検証**。成功報告と実機完了を混同しない。
- **V1.0状態**：マーカー重複解消=機能統合済・実機未検証／地方の敵密度下限=機能統合済・実機未検証／地名の和風表記=機能統合済・実機未検証。世界120秒/年・10種操作/家系・異常生物・完全食物連鎖・200トロフィーなど未完はPHASE Aのまま。V2スコアA16 B12 C9 D4 E8 F9 G8 H4 I4＝**74.0/100（差0）**、推測加点なし。
- **次00分枠**：`game.js:start/restoreSnapshot/ensureLocalPredators` の新規開始と旧SAVE2/3チェックポイントから「潮見の水路」復帰→敵・自キャラ表示→戦闘を実ブラウザE2E確認。ゲーム開始/終了/タイトル/トロフィー・Padを回帰。**次20分枠**：`game.js:ensureLocalPredators/migrateUnseenLocalPreyForPredator/maintainLocalWildlife` と `fauna.js:weight/choose` を接続し、全8地区の敵/獲物比・群れ分布・餌場・河川横断を改善。**次40分枠**：`game.js:drawMini/drawWorldMap`・`visual.css` の縦横表示と潮見水路のマーカーを実画面検証、和風表記を残りの表示要素でも徹底。
- **Pages**：最新HEADのbuild/deployをActions run/jobsで確認して報告。未確認を成功扱いしない。

## 2026/11/03 14:45 JST｜食物連鎖・実速度・全通常種固有攻撃・死亡UI/三色トロフィー｜PHASE=A_FEATURES｜ACTIVE_SPRINT_ID=EXPANSION-V1-YEAR-ERA-WORLD
- **今回遊べる追加機能**：①一般17種の基本速度を見直し（ライオン203→340、チーター345→414、キリン177→263、鹿220→286、シマウマ237→295、ゾウ124→173等）。game.js既存5種の速度も再配分。非プレイヤー高速移動も10座標ごとの分割衝突判定に変更し壁抜けを防止。②`game.js:huntWildPrey` に食性別ターゲット（ライオン=鹿/シマウマ/イノシシ/カモシカ/ヤギ、チーター=ウサギ/鹿/カモシカ/ヤギ、狐=小動物等）、優先度、距離警戒と短距離加速・再使用待機を実装。鹿/シマウマ/猪/ヤギ/カモシカは捕食時に実ダメージの反撃。捕食→死骸→採食は既存の経路に接続、NPC討伐をプレイヤーDNAに加算しない。③`combat-levels.js` の一般動物24種に各固有技の記述を整備。キリンは蹴りと首・頭の横薙ぎを交互に使用（別予兆、実射程/視線/命中、32座標の押し出し、SP18減）、鹿は蹴りと角の突き上げ。ネズミ/ウサギ/ハト/カラス/カエル/蛇の追い詰められた反撃も予兆→命中/遮蔽/回避→逃走へ接続。キリン首振りは`fauna.js:draw2D`と`webgl3d.js:drawCommonAnimal3D`の別ポーズを追加。④死亡結果に「タイトルに戻る」ボタンを新設し、既存リトライ/新規開始を保持。タイトルにトロフィー一覧ボタンを追加し既存永久実績64件を名称・条件・獲得状況・ブロンズ/シルバー/ゴールド色で表示。秘密実績は未獲得時非公開。PS/Xboxパッドの一覧操作・閉じる導線も追加。
- **GitHub変更履歴（全てneo-wild/限定）**：開始main HEAD `02ace905ca18b3a539029f09317a748d2df40439`。fauna.js `c58c23b4`→`32e95580`、combat-levels.js `b0209989`、game.js `584fee5b`→`5aaff15d`→`f67297b0`→`dbc4ddb7`、trophy-records.js `73a6f390`、trophy-view.js 新規 `68a3bf65`、visual.css `71c38642`、webgl3d.js `0385d25a`、gamepad.js `df730244`、index.html 新UI/キャッシュ `1ba1781b`→`281feb43`。ROADMAP追記前HEAD `281feb4344f0542529cd726e61d011cc026aad06`。他ゲーム・ブログは不変更。
- **試験**：V8で7本の現行JS全文構文、全24一般種技登録、ランク/秘密/100年実績/保存再ロード、HTML参照・旧SAVE_SCHEMA2/密度13/76/9、実 `huntWildPrey` のライオン鹿追跡/狐ネズミ/チーター・瞬間加速/犬猫系食性・鹿反撃/死骸1件、実`returnToTitleFromDeath` 状態遷移、6種の実反撃ブロック実行（予兆→命中/壁越し無傷）、実トロフィー画面モジュールの開閉/一覧/階級/件数を **53/53 PASS**（V8モック/隔離・静的配線含む）。**未検証**：Android実機・実GPU・実Pad・全24種を実ブラウザ戦闘するE2E・旧端末SAVE2/3CP・長時間FPS。未検証を実機成功とは書かない。
- **公開**：コードHTML HEAD `281feb4344f0542529cd726e61d011cc026aad06` のPages run `41585383005`、build=success、report-build-status=success、deploy=successを個別確認。ROADMAP追記コミットのActionsは別runで確認。
- **V1.0台帳**：食物連鎖=**機能統合済・E2E未検証（食性・瞬発加速・大型草食反撃）**／一般24種技=**途中〜機能統合済・各種E2E未検証**／実速度=**機能統合済・バランス実測未検証**／死亡→タイトルUI=**機能統合済・実機未検証**／トロフィー閲覧/3色=**機能統合済・実機未検証**、総数64/200+につきトロフィー仕様全体は**途中**。世界・家系・10初期操作・災害・異星種・12要素も引き続き未完あり。PHASE Aを全3枠維持し、Bへ切り替えない。
- **進捗V2**：A16 / B12 / C9 / D4 / E8 / F9 / G8 / H4 / I4 = **74.0/100（前回差0.0）**。実Android・統合E2E等の採点根拠がないため今回は加点なし。
- **次00分担当**：①`game.js:finish/returnToTitleFromDeath/restoreSnapshot` の死亡→タイトル→トロフィー→新規/続きから/チェックポイント操作を実ブラウザで統合検証。②`trophy-records.js:catalog/record` と `trophy-view.js:render/open/close` の64件表示・既存永久保存・Pad/タッチと秘匿、未実装136件以上の固有条件/称号を追加。③最新main/ROADMAP blobのPages build/deployと旧SAVE2/3CPの回帰を実測。
- **次20分担当**：①`game.js:huntWildPrey/nearbyAwareWildPredator/scavengeWildFood` で大型捕食と鹿・シマウマ・イノシシの実生態を複数地域で経時試験、死骸二重生成防止。②`fauna.js:species/choose/weight` と `game.js:spawnMob` の餌食/捕食者分布と世界76/近隣9、群れ頻度の適正化。③ライオン/チーターの短距離加速と獲物の逃走・地形衝突・疲労を実プレイで調整。
- **次40分担当**：①`fauna.js:draw2D` と `webgl3d.js:drawCommonAnimal3D` の24種固有技/首振り/体勢を動的実画面検証し固有演出を拡大。②`visual.css` と `trophy-view.js` のタイトル/三色メダル/結果画面を縦横スマホで表示試験。③`gamepad.js:poll` と `game.js:attack/update` のボタン・予兆・回避→死後タイトル操作を統合。

## 2026/11/03 14:20 JST｜20分枠｜山火事後の生息域移住・植生回復｜PHASE=A_FEATURES｜ACTIVE_SPRINT_ID=EXPANSION-V1-YEAR-ERA-WORLD
- **新たな実プレイ機能**：山火事の鎮火後も焼失範囲の生息地品質を最長7世界年かけて回復させる。既存NPCは焼失地で逃走AIを使い移住、休息/採食を中断。焼失範囲で新規動物の発生を抑制し、ベリー発生確率も生息地品質に連動。回復すれば動物と食料が戻る。火災イベント本体が独立保存されるため、死亡・リロード後も焼失地と回復が継続する。
- **実変更SHA**：disaster-world.js commit `6a77924a` blob `1d0787fa`、game.js commit `00d0f4c3` blob `77dc4b85`、index.html rev commit `ce2622ac` blob `9188ee63`。他ゲーム・ブログは変更なし。前00分枠の災害トロフィー64件、40分枠の4ボタン操作を保全。
- **試験**：実モジュールで発火・生息地品質低下・NPC移住・範囲外無影響・7年後回復・保存再読込、game.js構文・出生/採食への結線・旧SAVE_SCHEMA2維持を**12/12 PASS**。実ブラウザ・Android・Pad・WebGL・旧端末セーブE2E・長時間は**未検証**。PHASE A維持、74/100据え置き。
- **機能台帳**：世界年=途中／年代進化=途中／地続き世界=途中／気象=途中／災害=途中（地震・洪水・山火事・焼失地移住は機能統合済・実機未検証）／異常存在=途中／初期10種と家系=途中／200+トロフィー=途中（64/200+）／追加12要素=途中（災害起因の移住=機能統合済・実機未検証）。未実装：地割れ・隕石・永久地形変化・疫病・本格群れ移住・巣移転・全種操作。
- **次40分担当**：disaster-world.js:habitatQuality(x,y,elapsed/120)を植生の色・焼失跡・巣/動物の視覚変化に反映。game.js:spawnMob/spawnFood の既存結線を保全。実GPU検証。
- **次00分担当**：同APIとdisaster-world.js:history()を世界史・トロフィー/図鑑・巣移転/家系保存に接続。旧SAVE2/3CPロードを実E2E検証。
- **次20分担当**：生息地品質を個体の餌場探索・地域密度・群れの移動先に結線し、隕石・地割れの永久変化を実地形へ実装。

## 2026/11/03 14:08 JST｜4ボタン操作の位置統一・死亡画面文字修正｜PHASE=A_FEATURES｜ACTIVE_SPRINT_ID=EXPANSION-V1-YEAR-ERA-WORLD
- **実装結果**：ゲーム内右下4ボタンとPS/Xboxパッドを同じ位置に統一。**上=△/Y 連続攻撃（保持で5段コンボ自動）・左=□/X 短押し飛びつき／450ms以上保持で移動ダッシュ（速度1.62倍、SP消費43/秒）・右=○/B 短押し食べる/備蓄・550ms保持でくわえる/置く/巣強化・下=×/A ジャンプ**。タッチ・パッド離す/取消/切断・一時停止時は保持入力を解除。メニュー×/A決定、○/B戻る維持。既存本能はPC Rキーで残す。チュートリアル・操作説明・開始カード・巣/運搬HUDと記号を統一。
- **画像指摘の修正**：死亡画面「死んでしまった」の末尾1文字だけ折り返される現象に対応。#result-titleを25〜42px/nowrap、モーダル横幅、行間・文字間を調整。ハイスコア、SCORE、ランキング欄の文字サイズと上下余白を整理。横画面短辺では結果画面スクロール維持。
- **差分**：開始HEAD 9ccf328a。neo-wild/gamepad.js commit d964fee9、game.js 79817273および表示文字 d748201a、index.html 表示6ed207ae／最終?rev d376a8e1、visual.css 90bcc51c。変更ディレクトリはneo-wild/のみ。index.html読み込みはgame.js?rev=d748201a、gamepad.js?rev=d964fee9、visual.css?rev=90bcc51c。
- **試験**：現行JS全文構文、CSSグリッド位置、ボタン記号、HTML ?rev照合、ゲームパッド標準配列のモックで△押下/解除・×ジャンプ・□短押し/長押しダッシュ/解除・○短押し/長押し行動・切断時解除など**27/27 PASS**。Pages Actions run **41581816125**、コードHEAD d376a8e1のbuild=success/deploy=success/report-build-status=success。**Android実機、物理Pad、タッチ実機、PC/縦390×844/横800×360・844×390の実ブラウザ視認、旧SAVE2 E2Eは未検証**。
- **V2**：A16/B12/C9/D4/E8/F9/G8/H4/I4=74.0/100、差0。PHASE=A_FEATURES維持。
- **次00分**：①game.js:update/attackの保持コンボをHP/SP・保存/死亡→リトライまで通し試験、②game.js:resetControlsで死亡/ダイアログ/Pad切断を確認、③旧SAVE2/3とPages最新版出荷。
- **次20分**：①game.js:applyDirectionalInputと地続き段差・河川・建物衝突の保持ダッシュ試験、②game.js:updateSurvivalNeedsのスタミナ消耗バランス調整、③game.js:contextAction/putDownFood/carryFoodの○短押し/長押し操作を実景で統合。
- **次40分**：①visual.cssの#touch-layer/#result-titleをスマホ縦横3画面＋PCで実測、②gamepad.js:pollの実機PS/Xbox位置と長押しを試験、③index.htmlの文言残差・ゲームUIの字詰め修正。未実装主要機能はPHASE Aで引き続き実装。

## 2026-11-03 14:00 JST｜00分枠｜災害目撃・実脱出トロフィー統合｜PHASE=A_FEATURES｜ACTIVE_SPRINT_ID=EXPANSION-V1-YEAR-ERA-WORLD
- **新たに遊べる機能**：倒木・洪水・山火事それぞれの「現場目撃」「危険域から生還」6件と3種目撃制覇1件、計7種類の固有実績を追加（57→64）。災害の実位置・半径・発生年を検知し、危険域に入った後、存命で外へ出た場合だけ脱出実績を付与。死亡やリロードをまたいで遭遇・脱出の判定履歴を保存、同じ事件の二重判定を防止。既存トロフィー永久台帳と通知へ接続。旧SAVE_SCHEMA2と3CPは変更せず、他ゲーム変更なし。
- **実変更コミット**：trophy-records.js b4cf0025 (blob 5a5ab7f2)、game.js 68c896bd (blob 5827bca2)、index.html e2f52bb9→e9c8d803 (blob 71d94b79)。index.htmlの余分な閉じタグ記号も除去。
- **PASS**：2 JS全文V8構文、洪水目撃/脱出条件、未曝露での誤獲得防止、永続保存→再読込、HTML参照確認。**未検証**：実ブラウザ・Android・Pad・旧SAVE2 E2E・長時間・Pages最終deploy。
- **V1.0機能台帳**：世界時計=途中、年代進化=途中、地続き地形=途中、通常気象=途中、災害=途中（倒木/洪水/山火事と実績接続）、異常存在=途中、初期10種/家系=途中、200+ユニーク実績=途中（64/200+）、追加12要素=途中。全機能の実機検証済判定なし。PHASE A・進捗74/100据え置き。
- **次20分**：disaster-world.js:tick/history の疫病・隕石・地形永続変化を実プレイで追加し、game.js:recordDisasterEncounters とtrophy-records.jsへ新種災害を接続。**次40分**：UFO/亡霊/異星人の実遭遇・回避/生還イベントを本編実績と図鑑へ接続。**次00分**：game.js:beginDeath/launchGame と家系後継選択・死亡時世界継続、trophy-records.js の残136+ユニーク条件を実装。

## 2026-11-03 13:40｜40分枠｜亡霊幻覚と永久トロフィー実装｜PHASE=A_FEATURES｜ACTIVE_SPRINT_ID=EXPANSION-V1-YEAR-ERA-WORLD
- **遊べる新機能**：世界45年以降の既存亡霊AIへ「一定時間近距離で露出すると幻影が周囲に最大3体現れる」を実装。遮蔽物・潜伏時は新規幻覚を停止。幻影は実敵ではなく被ダメージなし、2.8秒で消える。既存の憑依によるSP減少・速度低下とNPC逃走を維持。亡霊に憑依/幻影目撃の2種類のユニークな秘密トロフィーを永久保存台帳へ接続（ゲーム本編のWildApparitions.tick→onEvent→WildTrophies.record）。死亡・新規開始後も台帳維持。
- **変更SHA**：apparitions.js commit 31149a34（blob 30cf8512）、trophy-records.js 39dbdf3d（blob 1d4aecb6）、game.js eddbb3cf（blob 98b9ab02）、index.html 0ce55328（blob 995534f1）。他ゲーム・ブログ未変更。
- **試験**：V8隔離動的試験（亡霊召喚→幻覚/憑依→NPC逃走→トロフィー記録）＋4モジュール構文/HTML読込/SAVE_SCHEMA2/Pad維持、15/15 PASS。実ブラウザ/Android/GPU/実Pad/旧SAVE2 E2E未検証。GitHub Pages最終deploy確認待ち。
- **V1.0機能台帳**：世界時計=途中、年代進化=途中、地続き地形=途中、通常気象=途中、災害=途中（地震/倒木/洪水/山火事は機能統合済）、異常存在=途中（UFO誘拐・亡霊追跡/憑依/幻覚は機能統合済・実機未検証）、初期10種/家系=途中、200+ユニークトロフィー=未実装（現在57件定義）、追加12要素=途中。PHASE A継続、進捗74/100据え置き。
- **次00分**：trophy-records.jsの57件を200以上の水増しなし個別条件へ拡充、亡霊イベント/図鑑/世界史・死亡/後継継続との統合、旧セーブ実ブラウザ試験。次20分：亡霊・幻影と地形遮蔽・季節・異常霧・地域差の接続、群れ避難AIと競合検証。次40分：異星人の観察・基地設営・敵対/中立/友好AIを別モジュールで実装し本編の実行ループ・保存・描画に接続。

## 2026-11-03 13:20｜20分枠｜PHASE=A_FEATURES｜ACTIVE_SPRINT_ID=EXPANSION-V1-YEAR-ERA-WORLD
- 実プレイ：山火事を7秒前に予告、実HP・SP被害、動物逃走・死亡後の死骸生成、年経過による鎮火、履歴保存、ミニ/全体マップ描画へ統合。洪水が既存河川の水深を減らす不具合も修正。
- SHA：disaster-world.js 4e69265c（blob 4072b7a4）、game.js da4d41aa（blob b255c9fe）、index.html dbdeca88（blob 1e218c2c）。他ディレクトリ不変更。
- 試験：V8動的・構文・保存/再読込・死骸重複防止 16/16 PASS。実Android、Pad、GPU、旧セーブE2E未検証。進捗74/100、PHASE A維持。
- V1.0台帳：世界時計=途中、年代進化=途中、地続き地形=途中、気象=途中、災害=途中（地震/倒木/洪水/山火事は機能統合済）、異常存在=途中、初期10種/家系=途中、200+トロフィー=途中、追加12要素=途中。未検証を検証済としない。
- 次40分：WildDisaster.events()/fireIntensity() のkind=wildfireをWebGLの火・煙と図鑑へ。次00分：WildDisaster.history()を世界年表/トロフィーへ。次20分：山火事による餌場・巣・植生変化と遠隔動物移住を実装。

## 2026/11/03 13:11 JST｜20分担当緊急統合｜河川氾濫・生態避難・地続き経路｜PHASE=A_FEATURES｜ACTIVE_SPRINT_ID=EXPANSION-V1-YEAR-ERA-WORLD
- **新たな実プレイ機能（洪水）**：5〜15年級の地震・倒木に加えて、別の稀な河川氾濫サイクル（最初8〜22年、以後9〜24年の抽選）を追加。河川または運河近辺で6秒の危険警告→最大122座標半径の局所浸水→実水深、陸上動物の侵入禁止・水際からの脱出、NPC経路水判定、動物逃走/休息・採食中断→世界1.4〜3.5年程度で自然減水。既存の橋・主要道路・建物周辺を発生候補から除外し、最低3方向の乾いた迂回帯を選ぶ。プレイヤー直下には突然発生させない。独立保存に次回洪水年・警戒・水域・直近60件の災害史を記録、旧SAVE_SCHEMA=2と3CPはそのまま。ミニ/全体マップとWebGL上のCanvas HUDに冠水範囲を表示。
- **実装済み地震の修復**：倒木から逃げるNPCにゲーム本体で参照されない `m.fleeTime` を設定していた問題を修正し、実逃走AI `m.flee/m.fleeThreatX/m.fleeThreatY` へ結線。倒木の衝突・復興・発生間隔は維持。
- **変更ファイル／コミット**：`neo-wild/disaster-world.js` `4cadf75a`（洪水モジュール・災害保存・逃走修正）、`neo-wild/game.js` `84f32305`（waterDepth/動線・NPC・描画水深）→ `12dd90c1`（ミニ/全体マップ冠水境界）、`neo-wild/index.html` `48f5c09b`→`81bfe930`（2本のcache rev）。他ゲーム/ブログは不変更。直前00分枠 `ac50e96b` のトロフィー55種追加、40分枠の亡霊 `66b06059` を保持。ROADMAP追記前HEAD `81bfe930ab6064c8b89e785306c145a57b15665b`。開始HEAD `be82d4303dd2e4c6ba59b93a3f56c18a39ca0175`。
- **試験**：実 `WildDisaster` モジュールの警告→水深発生→縁の乾燥→動物逃走→履歴/リロード→減水、実 `game.js:waterDepth` と`move` の関数隔離実行で乾地から冠水侵入を拒否、浸水内から退出、通常乾地移動、既存川維持。道路配列を現行mainと一致させて候補選定。module/game全文V8構文とHTML参照、旧SAVE_SCHEMA2/密度定数のコード回帰を合計**20/20 PASS（V8モック／隔離）**。旧端末セーブ/Android実機/ブラウザE2E/実GPU/FPS/Pad/10分以上の実プレイは**未検証**。地形の全経路は現地E2E確認待ち。
- **現行V1.0機能別台帳（未実装／途中／機能統合済／検証済の4分類。検証済＝実機含むE2Eとし、下記に該当なし）**：
  1. 世界120秒/年・永久時計＝**途中**（時計と死亡越し保存あり、種別寿命・家系は未完）。
  2. 年代進化・5年地域変遷＝**途中**（UFO/亡霊に年代出現条件、地域遷移は未完）。
  3. 架空都市・全域地続き・陸空水＝**途中**（旧8地区/山岳歩道は存在、操作10種・水中・地下は未完）。
  4. 天候・季節/月齢・落雷/異常気象＝**途中**（落雷実判定あり、全異常気象の統合は未完）。
  5. 災害＝**途中**（地震・倒木・今回河川氾濫は機能統合済／V8確認、地割れ・高潮・永久変形・山火事・疫病・隕石は未実装）。
  6. UFO/異星人/亡霊/怪獣＝**途中**（UFO・亡霊は部分統合、異星人基地/怪獣/突然変異は未完）。
  7. 初期10種・寿命/子孫・家系・特殊個体＝**途中**（旧操作3種など一部のみ）。
  8. 固有トロフィー200種超/図鑑/世界年表＝**途中**（00分枠の条件連動55/200+、年表/秘境は未完）。
  9. 追加12要素＝**途中**（詳細は以下）。
  12要素内訳：個体性格=未実装確認待ち／群れ連携・救助=途中／大移動=未実装／巣争奪・育児=未実装／負傷・出血・感染=途中／腐敗・骨化・腐肉食=途中／危険学習=未実装／赤月・異常霧・発光=未実装／亡霊徘徊・憑依=機能統合済・実機未検証／群発異常事件=未実装／図鑑・世界史=途中／洞窟・研究所・秘境=途中。
- **PHASE/進捗**：A_FEATURES維持。V2 A16/B12/C9/D4/E8/F9/G8/H4/I4＝**74.0/100（前回差0.0）**。機能統合の証拠はV8隔離であり、実機E2E条件不足により加点禁止。
- **次00分枠：①** `game.js:currentSnapshot/restoreSnapshot/start` と `disaster-world.js:getState/history` の世界履歴・旧セーブ回帰、`trophy-records.js:record` へ洪水生還実績を接続。**②** `game.js:beginDeath` の家系・後継と世界状態保存を実装。**③** latest HEAD Pages build/deployと開始→洪水→避難→保存→再開E2Eを実測。
- **次20分枠：①** `disaster-world.js:tick/floodDepth/scheduleFlood` で河川と運河の実建物/橋を使った逃走可能性・地形の全経路回帰。**②** `game.js:move/routeClear/spawnMob` と `fauna.js:species` で冠水域の個体移住・復帰/採食回復を実装。**③** 山火事/地滑りなど別の局所災害を予兆・地形・AI・復旧まで一括統合。
- **次40分枠：①** `webgl3d.js:render` と `disaster-world.js:draw` で冠水領域の3D水面と橋の乾燥表示を統合。**②** `game.js:drawMini/drawWorldMap` の冠水範囲と動物避難UIを実操作で確認。**③** `bestiary.js` と `trophy-records.js` で洪水避難記録・図鑑・外見報酬を連結。
- **公開**：`81bfe930` を含むPagesのbuild/deployはこの記録時点で未確認。最新mainに対するrun/jobsを個別確認して報告する。

## 2026/11/03 13:00 JST｜00分枠｜PHASE=A_FEATURES｜ACTIVE_SPRINT_ID=EXPANSION-V1-YEAR-ERA-WORLD
- **実装した遊び**：世界年到達・狩猟回数・初討伐種・探索地点・成長LV・気象・死亡のイベントに連動する永続トロフィー55種類を追加。通常条件は公開、希少条件は獲得まで伏せる。トロフィー取得時にゲーム内通知。保存キー wild-reclaim-trophies-v1 は既存SAVE_SCHEMA=2から独立し、死亡・最初から・チェックポイント復帰でも獲得履歴を維持。能力強化報酬は付与しない。
- **変更ファイル/コミット**：neo-wild/trophy-records.js 新規 c7e75d77（blob cff59ae2）、game.js 統合 6d73f51e（blob 8ee43fe2）、index.html 読込・rev ac50e96b（blob 070a04a3）。他ゲーム/ブログは変更なし。
- **PASS**：2 JS全文構文、5イベントのゲーム内呼出箇所、世界100年トロフィー判定・保存後再ロード・秘密トロフィーの未獲得非公開をV8で確認。**未検証**：実ブラウザ/Android/Pad、55種類すべてのゲーム内E2E、Pages deploy、旧SAVE2実データ。
- **V1.0状態**：トロフィー=途中（55/200+、UI一覧/タイトル/限定外見/追加イベント接続が未実装）。世界年・災害・UFO・家系・10種操作・地形等も引き続き途中/未実装。PHASE A維持。進捗74/100据置。
- **次20分枠**：game.js:updateLightning と disaster-world.js:tick から WildTrophies.record("lightning",...) および災害生還を発火。disaster-world.js と fauna.js の動物・地域被災イベントを図鑑に接続。
- **次40分枠**：ufo-events.js の捕獲死因を P.deathReason="ufo" として beginDeath に渡し、trophy-records.js のUFO捕獲実績と連結。bestiary.js にトロフィー一覧（通常公開/秘密隠蔽）の表示入口を実装。
- **次00分枠**：種別寿命/子孫と後継選択を独立モジュール化し、game.js:start/restoreSnapshot/beginDeath へ統合。200種類以上の非重複イベント条件へ拡充。

## 2026/11/03 12:40枠｜40分・亡霊の実体験AIと憑依｜PHASE=A_FEATURES｜ACTIVE_SPRINT_ID=EXPANSION-V1-YEAR-ERA-WORLD
- **新たな実プレイ機能**：世界45年以降の希少な亡霊出現。徘徊→実体化→プレイヤー追跡→消失。壁と隠れ状態で追跡を回避可能。接近したプレイヤーは恐怖が蓄積し、憑依でスタミナが減り移動速度が一時72%へ低下。NPC動物も近距離の亡霊を警戒し、既存の逃走・警戒AIで退避。Canvas画面上に亡霊を描画し、遭遇座標・世界年と次回出現年、進行中の亡霊を独立localStorageに保存。死亡/再ロード後も世界記録を維持。デバッグからWildApparitions.summon(x,y,year)で実遭遇を再現可能。既存UFO・倒木・年時計・旧SAVE2には干渉しない。
- **コードSHA**：neo-wild/apparitions.js新規 commit 2aba255eac5f77cf30f23e6ec47860d8259dc88c、neo-wild/game.js 統合 commit 9f45c1a6bac1ce6f0c1c1955965bd73ca4f855ed と憑依移動処理 commit 66b06059bd535917cab1c5b5e1405129009e9ea7、neo-wild/index.html 読込/キャッシュ commit 0c7e6804ffd17f6e5cf14c129279060661a31e56。共通スプリント維持、他ゲーム/ブログは変更なし。
- **検証**：JavaScript実モジュール動的試験18/18 PASS（出現・徘徊→実体化・スタミナ消費・憑依・NPC逃走・潜伏解除・消失・遭遇保存・Canvas呼出・本体構文・読込順・旧SAVE2）。実ブラウザ、Android/Pad、長時間FPS、旧端末実セーブのE2Eは**未検証**。怪異図鑑・200実績連携、幻覚・複数怪異・異星人基地・怪獣地形破壊は**未実装**。
- **次00分への入力**：WildApparitions.history()/saveState() を世界年表・図鑑・200トロフィー・世界永久保存へ接続。死亡/後継/再出発時に遭遇履歴が失われないことをE2Eで確認。game.js:update 内 WildApparitions.tick、render内 draw、P.hauntedTime を参照。
- **次20分への入力**：NPCの恐怖/逃走・生息地AIと亡霊の縄張り/廃村/洞窟の地域条件、災害と怪異の相互作用を実地形・衝突で接続。apparitions.js:tick の m.flee/m.alert、lineBlocked を参照。
- **次40分**：UFO NPC誘拐の死骸/図鑑/家系接続、異星人観察/基地AI、亡霊幻覚・消失演出、WebGL描画、怪獣固有攻撃の次の縦切り。PHASE A継続、進捗74/100据え置き（実機未検証）。

## 2026/11/03 12時台｜20分枠｜PHASE=A_FEATURES｜ACTIVE_SPRINT_ID=EXPANSION-V1-YEAR-ERA-WORLD
- **新たな実プレイ機能**：5〜15世界年程度のランダム間隔で局所地震の前兆（4.5秒）→倒木→実移動衝突・迂回→近くのNPC動物が逃走→5〜14年後の自然回復。世界年120秒/年に同期。世界中のプレイヤー付近の合法地点から抽選し、障害物や世界境界・プレイヤー直近・行き止まりを避ける。Canvas HUDに危険予告と倒木を表示。死亡/再起動後も独立localStorageキーに最大12件の倒木と次の災害抽選年を保持。地形永久変化・洪水・隕石はまだ未実装。
- **実変更**：開始HEAD 08bdc32edd3a4a3cbe1ea3111d93466c59f0e017。neo-wild/disaster-world.js 新規 commit ff6df1af6305b336c0275f2969ff8fc0974b0fff（blob 0dd08318b9748619f58814960c0b10c48433679d）。neo-wild/game.js 衝突/update/描画統合 commit 06c374aaf96f9991b3d025a7bc562d2083decfde（blob 085e1c3539e2af90cc5a3a43e787e36c80048448）。neo-wild/index.html 読込順とrev commit 4ba811a090cd211d899e9b883a5d6be8ab313f21（blob c0d0d74ea649c058e7a6cda8170179068a037a71）。記録直前HEAD 4ba811a090cd211d899e9b883a5d6be8ab313f21。他ゲーム・ブログ変更なし。
- **検証**：V8実モジュール呼出による地震予兆/倒木実衝突/NPC逃走/プレイヤー周辺安全/独立保存再読込/期限切れ回復、game.js構文・HTML読込順・本体結線で **11/11 PASS**。実ブラウザの長時間発生・Android/実GPU/物理Pad/旧端末SAVE2/3CPは未検証。実GPUでの倒木3Dメッシュは未実装（Canvas HUD重畳のみ）。
- **V1.0状態**：地震/倒木=**機能統合済・実機未検証**、洪水/地割れ/土砂崩れ/永久崩落/隕石/感染症/山火事=未実装〜途中。世界時計=途中、家系/10種陸空水/200トロフィー=未完成。PHASE A継続。V2 A16/B12/C9/D4/E8/F9/G8/H4/I4=74.0/100（差0.0、未検証による加点なし）。
- **次00分**：game.js:currentSnapshot/restoreSnapshot と disaster-world.js:getState/restore を連結し旧SAVE2/3CPでも地形履歴を失わず世界年を維持。game.js:beginDeath/start の世代継承を実装。
- **次20分**：game.js:waterBlocksLand/collides/routeClear と disaster-world.js:tick を連動し洪水・冠水・迂回、NPCの避難/移住を追加。安全経路を保証。
- **次40分**：webgl3d.js:render と disaster-world.js:draw に倒木3D実メッシュ・地割れの予兆・避難導線を追加。bestiary.js に災害遭遇履歴・年表を接続。
- **公開**：コードHEAD 4ba811a0 のPages build/deployを別途照合すること。ROADMAP更新後のHEADは別run。

## 2026/11/03 12:05 JST｜格上相手の攻撃連打ハメ修復｜PHASE=A_FEATURES｜ACTIVE_SPRINT_ID=EXPANSION-V1-YEAR-ERA-WORLD
- **実際の改善**：推奨LV5や17の格上動物がプレイヤーLV1の軽い攻撃連打で攻撃準備をキャンセルされ続ける問題を修正。COMBAT_LEVELS.canInterrupt で格上（差3以上）は通常攻撃でひるまず、奇襲・ジャンプ・狼突進・コンボ5段目などの重攻撃でのみスタッガー耐性/ガードクールダウン付きでひるむ。格上は通常打撃ノックバックを大幅減、攻撃を受けた事実を約2.3秒保持し死角/薄暗さでも近距離反撃、ひるんでいない場合は通常攻撃の再試行までの残り待機時間を格上最大0.16秒に縮める。**反撃のwindup/攻撃予兆は省略しない**。ボス20種の固有技40、旧SAVE_SCHEMA=2、野生密度13/76/9・9秒・群れ110秒を維持。
- **変更**：当初HEAD 25480a06f2ae0ec8bab587d761f43c7b88b77ccc、neo-wild/combat-levels.js commit **f616608cb59cb1063c433b50f9af31cb549eed0b**、neo-wild/game.js commit **1ee689859b63b6748bba7a35e122b2f95a80044a**、neo-wild/index.html ?rev commit **faa0225493f08048fb948bc2f150b4abd056bf23**。他枠が後続でゲーム本体/HTMLを **3c0652bfaf16459a2a3bd6bad800b3e62b54e7a0** まで更新。現行game.js blob 61e682fcee33d2c0b4fc5ee7005c31ebb552252a、index.html blob 922223927370cb14b354a469712f73678698e465 でスタッガー修正と新コード読込維持を再照合。他ゲームとブログには書き込まず。
- **テスト**：V8の実resolveAttack関数隔離試験（通常攻撃10回連続でもLV1対犬/ライオン/キリンのwindup維持、重攻撃フィニッシュ時のひるみ、同格犬の通常ひるみ、反撃待機短縮）、全44種LV表の割当、関数結線、現行ゲーム全文構文、save/density定数、最新HTML参照で **156/156 static + dynamic module条件 PASS**。実関数隔離試験の初回はキャッシュ改版期待が後続他枠のコミットで更新され110/111となったが、現行参照を再取得して整合156/156。実ブラウザ対戦、実Android/Pad、10分E2E、実際の勝率/被ダメージ、ボス実GPUは**未検証**。低レベルで絶対勝てないレベルロックは設けない。
- **Pages**：コード修正HEAD 1ee68985 のPages build/deploy SUCCESSを取得。今回記録作成時の最新HEAD 3c0652bfaf16459a2a3bd6bad800b3e62b54e7a0 のPages状況は別途照合が必要。ROADMAP記録コミットは新たなActions runが必要。
- **V2暫定**：前回A16/B12/C9/D4/E8/F9/G8/H4/I4=74.0/100、**差0.0**。戦闘実機E2E未確認のため加点しない。PHASE=A_FEATURES継続。
- **次00分**：game.js:resolveAttack/update のLV1→5/17/18戦闘自動E2E・敵windup中断回帰とトロフィー報酬処理統合、currentSnapshot/restoreSnapshot反撃一時状態互換、Pages最終HEAD検証。
- **次20分**：game.js:detectsPlayer/tryEnemyEmergencyEvade/update の視野死角・壁/ステルスと被弾後反撃を実挙動試験、spawnMob/syncEnemyLevelの地域別危険度、山林/郊外の大型敵行動パターン。
- **次40分**：fauna.js:draw2D/game.js:drawThreatNamesとwebgl3d.jsで格上反撃の予兆/攻撃固有モーション明示、gamepad.jsの回避操作検証、動物図鑑に危険度・推奨LVとの差を見やすく表示。

## 2026/11/03 12:00 JST｜00分枠｜世界時計の死亡・再出発を跨ぐ永続化｜PHASE=A_FEATURES｜ACTIVE_SPRINT_ID=EXPANSION-V1-YEAR-ERA-WORLD
- **新規実装**：world chronicle専用localStorageキーを追加し、実プレイ120秒/世界1年の積算を新しい動物で再開始してもリセットしない。死亡時即保存、プレイ中12秒ごと・通常オートセーブ時に保存。チェックポイント復帰では保存済みの世界時刻より巻き戻さず、旧SAVE_SCHEMA2のelapsedを読み込む。落雷履歴も最大24件を世界史の別保存へ継承。終了中の時間は進まない。世界年に紐づく季節/天候は開始時の継続時刻から初期化する。
- **実コード**：game.js commit 5477e65527cc939c8b9ee5a34f9e04c881e696bd（blob 61e682fcee33d2c0b4fc5ee7005c31ebb552252a）、index.html キャッシュ更新 commit b4e2a4d2ee08386dca3e9a458a27bfd39f8542b9。対象はneo-wild/のみ。世界時計の別キー保存は死亡時/新規開始/復元の導線へ接続。
- **検証と制限**：ソース上の接続箇所とmain blobを確認。実Android・実ブラウザE2E・旧SAVE2実データ・300年連続・Pages最終deployは未検証。全世界の地形/巣/家系の永続化ではなく、今回永続化したのは時間と落雷履歴。V1.0の全仕様は未完成。進捗74/100据置、PHASE A維持。
- **次20分**：game.jsの地域別地形/災害履歴をworld chronicleへ拡張。世界時計の巻戻し防止と地形迂回を統合。
- **次40分**：死亡後の後継選択・UFO捕獲時の家系遷移と世界年表UI、月齢・夜間表示の年時計との整合を実装。現行のworld chronicle keyを再利用する際は既存elapsed/lightningHistoryを壊さない。

## 2026/11/03 11:54 JST｜全動物推奨LVと戦闘多様化｜PHASE=A_FEATURES｜ACTIVE_SPRINT_ID=EXPANSION-V1-YEAR-ERA-WORLD
- **今回遊べる新機能**：通常24＋強敵20＝計44種に個別「推奨LV1〜40」を設け、図鑑の討伐一覧/詳細と、プレイ中の接近敵名へ表示。敵の推奨LVが現在LVより高いほど、その敵へのプレイヤー攻撃を減衰し、敵がプレイヤーに与えるダメージを増やす。LVを満たさなくても討伐は可能（厳格なレベルロックなし）。例：LV2→通常ライオン推奨18、与ダメージ係数0.362・被ダメージ係数2.03。LV2→巨大ライオン推奨32、与ダメージ係数0.24・被ダメージ係数2.03。適正LV以上では係数1.0。
- **攻撃の追加**：通常種15タイプの交互の固有攻撃情報（名・予兆・射程・攻撃威力・クールダウン・状態異常）を新設。野犬/イノシシ/猫/狐/イタチ/タヌキ/毒蛇/チーター/ライオン/キリン/ゾウ/カバなどの既存基本攻撃と固有追加技を交互に選択。シマウマ・ニホンカモシカ・ヤギの反撃も予兆表示と攻撃判定、交互の威力/射程・持久力/押し返しに接続（従来の予兆なしシマウマ即攻撃を撤去）。ボス20種×2技の既存モジュールは維持。ニホンザル・チンパンジーの投石等にも推奨LV倍率を適用。水辺・飛行・大鷲・ゴリラ投石・基本/突進/固有技の被ダメージにも倍率を接続。
- **変更と証拠**：開始main 8a47e72e。neo-wild/combat-levels.js 新規 commit d0be6e9f、game.js 戦闘統合 commit 0a6b3fef と草食反撃 commit 8f866a31、bestiary.js commit 50adff71、index.html script順/?rev commit d63386bf と fef4f755。最終コード HEAD **fef4f75596f59e84c1dfe639f38cb4981fb02419**。上記4ソース以外は既存コードを維持し、他ゲーム・ブログの変更なし。
- **試験**：V8で全44種のLV/倍率単調性/正規化、15種の基本→固有→基本ローテーション、HTML script順、JS全文構文、密度・SAVE_SCHEMA・アルファ速度を計 **219/219 PASS**。反撃3種の予兆・コード分岐・構文はPASS（実ブラウザでの衝突/操作の実測ではない）。ゲーム本編での全44種遭遇E2E、Android実機/GPU/物理Pad・長時間FPS/旧端末SAVE2実データは**未検証**。HTMLと最新game.jsの各blob照合済み。
- **Pages証拠**：コードHEAD fef4f755 のGitHub Actions run **41568772595** が completed/success。job **build=success、deploy=success、report-build-status=success**。その後のROADMAP記録コミットについては別runとして確認要。進捗V2はA16/B12/C9/D4/E8/F9/G8/H4/I4＝**74.0/100、前回差0.0**（PHASE A継続、実機・E2E未達のため加点なし）。
- **次00分（実装）**：①game.js:resolveAttack/kill で推奨LV差に応じた格上討伐報酬・初討伐トロフィー/永続図鑑の連結、②game.js:currentSnapshot/restoreSnapshot で草食反撃の一時状態と旧SAVE2の回帰、③実プレイの開始→狩猟→格上戦闘→死亡/リトライ/再開統合試験。
- **次20分（実装）**：①game.js:update の種類別追跡/警戒/回避/反撃ループを未対応種（鹿・熊など）へ拡大、②game.js:spawnMob/syncEnemyLevel のエリア別推奨LVと地域分布をレベルロックなしで整合、③地形衝突と群れ上限13/76/9・6%/12%・9秒を回帰。
- **次40分（実装）**：①game.js:update/drawThreatNames の全種予兆と見やすい推奨LV表示を3D/2Dで実操作確認、②fauna.js:draw2D/webgl3d.js の追加固有技の種別モーションを完成、③bestiary.js と gamepad.js で図鑑・推奨LV・縦横/Padの実操作と強敵20種固有技との共存を完成。
- **重要**：今回は推奨LVの全種登録と戦闘係数統合、12種の通常交互攻撃と3種の反撃ループまで。すべての種に2種類の実戦技が完成したわけではない。PHASE=A_FEATURESを維持し、通常種の残り個体特有行動・戦闘/回避を次回のPHASE Aで広げる。旧密度・20強敵・UFO・世界時計・死亡演出・図鑑は削除していない。

## 2026/11/03 11:40 JST｜40分枠｜PHASE=A_FEATURES｜ACTIVE_SPRINT_ID=EXPANSION-V1-YEAR-ERA-WORLD
- 新たに遊べる機能：UFOの照射中、見えているプレイヤーを最大72座標/秒で追跡。潜伏・遮蔽時は野生動物を優先して追跡。NPC誘拐・プレイヤー捕獲地点に2時間相当ではなく実時間7200秒残る発光痕跡を2D HUD表示。円盤進行状態・痕跡・クールダウンをlocalStorageへ定期永続化しリロード後も遭遇を再開可能。
- 変更：neo-wild/ufo-events.js commit c29f0eb69da3661c529a9519eabb57465855900d、neo-wild/index.html rev commit 3111ef094fe67bf9bba102d8398b01bbc48c5d94。開始時ROADMAP blob f3be0681c948d6f9c2c849d98adcb33f1bfebde8。対象以外変更なし。
- PASS：実モジュール構文、潜伏回避、捕獲死亡、履歴・痕跡の再生成後復元。未検証：ブラウザE2E、Android/GPU/Pad、SAVE2/3、Pages build/deploy。UFO事件の世界本体セーブ・後継/図鑑/トロフィー連携は未完成。V2 A16 B12 C9 D4 E8 F9 G8 H4 I4=74/100（差0）、採点据置。
- 次00分：game.js:beginDeath/restoreSnapshot/currentSnapshot に捕獲死亡後の後継と永続世界を統合、WildUFO.saveState をSAVE2互換追加フィールドへ接続。
- 次20分：game.js:lineBlocked/insideShelter にUFO照射遮蔽を統合、game.js:spawnMob/maintainLocalWildlife で誘拐後の動物補充・生態分布を調整。
- 次40分：webgl3d.js:render に円盤3D描画、bestiary.js にUFO痕跡/遭遇履歴、game.js:drawScene に照射予兆と死亡後表示を統合。

## 2026/11/03 10:4x JST｜40分枠｜PHASE=A_FEATURES｜ACTIVE_SPRINT_ID=EXPANSION-V1-YEAR-ERA-WORLD
- **今回実装（部分統合）**：UFO飛来→3秒接近→11秒照射→逃走/潜伏/遮蔽で回避→2.2秒連続照射でプレイヤー捕獲・死亡導線。NPCが光線内にいれば誘拐しHP0。世界50年以降の低確率発生、イベント間隔制限。2D Canvas HUD上に円盤・警告・光線を表示（WebGLでもHUD合成）。事件履歴をlocalStorage別キーに直近30件記録。**セーブ本体へのイベント状態統合、後継選択、NPC死骸/図鑑/トロフィー連動は未実装**。
- **変更**：neo-wild/ufo-events.js（新規）、neo-wild/game.js（update/drawScene連結）、neo-wild/index.html（ロード順とrev）。開始HEAD 8e629e3d（記録時HEAD、実作業開始時は d6399b19）、コードコミット 18abc636→9abf839a→8e629e3d。コード検査：JS関数実行4/4 PASS（構文・捕獲死亡・潜伏回避・NPC誘拐）。ブラウザE2E、実Android/Pad、WebGL実画面、SAVE2/3CP実データ、Pages deployは未検証。Pages run 41561428206 は確認時 pending。
- **V1.0機能状態**：UFO=途中（逃走/死亡の縦機能あり、後継/永続世界/図鑑未接続）、亡霊/異星人/怪獣=未実装または要コード実証、200トロフィー=未実装または要コード実証。世界時計・気象・雷=実装中、統合証拠不足。PHASE A継続。V2 A16 B12 C9 D4 E8 F9 G8 H4 I4=74/100（差0、採点据置）。
- **次00分**：game.js:beginDeath/restoreSnapshot にUFO死亡→後継/世界継続を接続、saveAuto/restoreSnapshot に事件状態を追加、ufo-events.js:history と図鑑/トロフィー発火連動。
- **次20分**：game.js:spawnMob/maintainLocalWildlife でUFO出現地域の動物分布、game.js:lineBlocked/insideShelter で照射遮蔽の実地形判定、世界災害/地域AIと誘拐後の痕跡を接続。
- **次40分**：ufo-events.js:tick/draw の光線追跡・NPC死骸/痕跡、webgl3d.js:render で円盤3D描画、bestiary.js のUFO遭遇記録と世界年表UIを完成。

## 20分枠・落雷麻痺の実操作連結追記｜2026/11/03 10:24 JST｜PHASE=A_FEATURE_COMPLETION｜ACTIVE_SPRINT_ID=EXPANSION-V1-YEAR-ERA-WORLD
- 初回落雷実装のプレイヤー麻痺が状態付与のみだったため、`game.js:update` で `P.stun` をdt減算し、麻痺中は`getAxes()`の入力を0へ抑制。1.1秒経過後は通常入力に復帰。実コードコミット `cf106665f6497aca5270a84b565a8fc0d4029a66`、HTML rev `8410fd1bf5d53a15e8fdbb2ee1d28e712fe8b669`。JS全文構文PASS。実Android操作は未検証。既存SAVE_SCHEMA2を維持。Pages build/deployは後続HEADの結果を確認する。

## V1.0超大型拡張｜2026/11/03 10:22 JST｜20分枠｜PHASE=A_FEATURE_COMPLETION｜ACTIVE_SPRINT_ID=EXPANSION-V1-YEAR-ERA-WORLD
- **実装・遊べる変化**：雷雨が単なる閃光/音だけでなく、実座標を持つ落雷イベントへ。8〜16秒間隔の雷雨判定でプレイヤー周囲の地面/生きた野生動物/木から候補を選び、1.65秒の黄色い危険円・「逃げろ」予兆を2D HUDに表示。落雷半径65座標内の屋外プレイヤーは38HP/22SP減と1.1秒麻痺、NPCは45HP減/1.8秒麻痺/3.5秒逃走、死亡時は死骸生成。プレイヤーは予兆中に逃走/屋内避難で回避できる。発生位置・年・対象種別の直近24件を世界史のため保存、セーブ/復帰時に予兆残秒も復元。雷雨終了で未発生の危険を解除。既存世界時計120秒/年、SAVE_SCHEMA2/3CPと密度上限に手を触れない。
- **実コード**：`neo-wild/game.js` の `scheduleLightning/updateLightning/drawLightning/updateWeather/update/drawScene/currentSnapshot/restoreSnapshot/start`。コミット `a3c0001706477105f972cafa11ea82c92847380a`（blob `a3d0df51c35be364d583c496c06b01390b5ddc55`）。`neo-wild/index.html` のgame.js rev更新 `ccadbdcf2682a4e223fa97c168bcc3e24aab59ae`（blob `8683eda3c8284b76435e9a2547f783a0fa018960`）。開始HEAD `378019fbe8ab21cd50dddf1b108ec53b1f4f649d`、台帳書込前HEAD `ccadbdcf2682a4e223fa97c168bcc3e24aab59ae`。他ゲーム/ブログ変更なし。
- **検証**：game.js全文構文PASS、抽出した実 `updateLightning` をV8で実行し予兆中無傷→着弾HP/動物死亡→死骸1回→履歴1件→重複なし→晴天解除をPASS。保存/復元フィールド結線PASS。**実ブラウザ/Android/実GPU/Pad/長時間雷雨/旧端末SAVE2 E2Eは未検証**。2D危険円の実画面表示は未検証、3Dは既存Canvas HUD重畳に依存。
- **公開**：コミット直後のPages run `41559348018` はwaiting。後続index revと本ROADMAPのrunは要照合。build/deploy成功を未確認のまま宣言しない。
- **V1.0状態一覧**：120秒/年と四季=途中（時計コードあり・新規開始でelapsedリセット残）。実落雷=統合済み・実機要検証。洪水/地震/火災/地割れ/隕石・永久世界/世代/陸空水10種/UFO・怪異・怪獣/200トロフィー/追加12生態=未実装〜途中。PHASE A維持、PHASE B禁止。進捗V2 **A16 B12 C9 D4 E8 F9 G8 H4 I4＝74/100（差0）**、実機統合条件未達につき据置。
- **次40分枠**：①`game.js:drawLightning` と `webgl3d.js:render` の落雷警告・着弾・動物逃走3D/2D視認性、②`game.js:beginDeath/restoreSnapshot` とUFO吸引・後継交代の連結、③`game.js:syncHUD` と世界年表/災害履歴UI。
- **次00分枠**：①`game.js:start/restoreSnapshot/currentSnapshot` の永久世界時計・家系セーブと年齢、②`game.js:updateLightning/updateSurvivalNeeds/beginDeath` の落雷死亡・再開E2E、③`world-time.js:at/weatherAt` と旧東京気象時計の一致検証。
- **次20分枠**：①`game.js:collides/move/routeClear` で地震地割れ・冠水の実経路と迂回、②`game.js:spawnMob/maintainLocalWildlife` で被災動物の地域移動/密度、③`game.js:currentSnapshot/restoreSnapshot` で災害跡・世界年表の永続化。

## V1.0大幅拡張・引継ぎ｜2026/11/03 10:10 JST｜00分枠｜PHASE=A_FEATURE_COMPLETION
- 【確定・最優先】2026-11-03話し合いの全仕様と追加12要素を正式採用。Google Drive正本 https://docs.google.com/document/d/1nThmsAhxtVt-Bs5_NzGLqxMghSBxN2unNalcwn9Z1_g/edit 末尾「2026-11-03 最新確定仕様 V1.0」を旧仕様より優先。00/20/40分の3タスクは全件V1.0へ更新・有効化済み。共通次スプリントID：EXPANSION-V1-YEAR-ERA-WORLD。既存スプリントの実コードとSHAは保存する。
- 【今回の実装】新規 world-time.js は現実120秒/世界1年・季節30秒ずつ・85秒の昼夜とは独立した時刻APIと季節別抽選気象を提供。game.js にYEAR表示/10・20・50・100・200・300年節目通知、旧elapsed由来のworldYearsElapsed保存フィールド、気候同期を追加。season-clouds.js の季節ラベル/植生フィルターを新時計に接続。fauna.js の3/10/30/100年の出現重みを新時計へ接続。index.html はworld-time.js読込順とキャッシュを更新。コード最終コミット 186471be6e4ce91848f8505dbf5a8835696ee7e7。該当Pages workflow 41557790025 は成功。実Android・100年連続プレイ・旧セーブE2Eは未検証。
- 【正直な残状況】時計は初期実装だが開始/新規種族時のelapsedリセットがまだ残る。ゲーム全体の世界年・地形永続、寿命と後継者、陸空水10種、巨大化・怪獣・UFO、実落雷・地震/地割れ・洪水・隕石、200トロフィー、追加12生態を統合済みと扱うな。夜空・月齢・WebGL植生・旧365DAY暦が新YEARと一致するか未検証。PHASE A継続、進捗74/100据置。
- 【状態一覧】世界年/季節/通常天候：途中（初期コード）。寿命・繁殖/世代・永久世界：未実装。地続き大陸/陸空水10操作：一部既存のみ。災害・地形変化：未実装〜一部既存。UFO・怪異・怪獣：未実装。200+トロフィー：未実装、動物図鑑は先行。追加12生態：既存の群れ/食物連鎖等一部先行、残り未実装。
- 【00分次】新規開始/死亡/一族断絶/セーブ復帰でも世界年が積算し地形状態が残る独立世界時計・保存、年齢・繁殖・後継選択の一連プレイループ。世界年/昼夜/季節/天気整合と旧SAVE_SCHEMA2互換を実装・テスト。続いて10初期種の陸空水固有操作、レア解放、200以上のユニークトロフィーの保存/発火に着手。
- 【20分次】年と気候で変わる地続き地形・洪水/地割れの実経路/衝突/地図/地域生態、雨→ランダム実落雷→動物死亡/負傷/避難、災害後の復興と不可逆変更を作る。山限定に戻さない。00/40分へイベント/地形APIを引継ぎ。
- 【40分次】UFO飛来→照射→吸引→逃走→個体死/後継に接続できるイベント、NPCキャトルミューティレーション、亡霊/異星人/怪獣の最初の自律AIと2D/3D演出、災害エフェクトと新しい動物描画を作る。見た目だけで実装済としない。
- 【全枠共通】コミット直前にmain HEAD/対象blob SHA再確認、既存旧セーブ・仲間・操作・3D/2D・Pad・横縦を守る。コードの実プレイ機能を毎回追加、必要な構文・起動・旧保存QAとPages確認、具体的なSHA/残課題/引継ぎをROADMAP冒頭に記録。全機能完成後のみ全3枠でPHASE B品質改善へ進む。

## 00分枠 追加統合｜2026/11/3 10:07:01 JST｜ACTIVE_SPRINT_ID=MOUNTAIN-CONTIGUOUS-FOOTHILL-V1｜PHASE=A_FEATURE_COMPLETION
- 前記の巣仲間NPC機能を実装後、友好NPCが敵扱いされる3つの連動問題を発見し、同枠内で修正：`game.js:denThreatNearby`（仲間が巣の回復を妨げない）、`markTerritory`の敵判定（仲間が縄張り取得を妨げない）、`game.js:update`のAudio danger（仲間が危険BGMを鳴らさない）。仲間/本当の敵/両方の模擬ケースと構文・結線を**6/6 PASS**。実Android/長時間E2Eは未検証。
- コード追加コミット `21d11619e6a15a8676b4b3ba8da591811fc3de71`、`index.html` game.js rev=v2 `3e40421a88b3eb1cbeaf753824e7875ce38525b6`。最終コードHEAD `3e40421a`。初回コードHEAD `93d50bc1` のPages run **41557305084** は build/deploy/report-build-status 全success。最新修正HEADのPages run **41557536249** は10:06 JST時点pendingでbuild/deploy成功**未確認**。ROADMAP更新コミットのrunも別途確認。次00/20/40枠は最新HEADから着手し、旧SHAで上書き禁止。
- 機能別状態・進捗は直下の10:05本記録と同じ：**PHASE A、74/100据置**。繁殖/世代交代は未完成。次20分枠は`spawnMob/maintainLocalWildlife`、次40分枠は`webgl3d.js:drawCommonAnimal3D`と`gamepad.js:poll`、次00分枠は`recruitCompanion/restoreSnapshot/updateCompanion`のE2Eを最優先。重大障害がなければ新機能を続ける。

## 共同スプリント｜2026/11/3 10:05:33 JST｜00分枠｜ACTIVE_SPRINT_ID=MOUNTAIN-CONTIGUOUS-FOOTHILL-V1｜巣の仲間NPC・同行護衛・肉の明示消費・死亡/保存
- **PHASE=A_FEATURE_COMPLETION（継続）**。今回開始main HEAD `84be0dfa25229d98fec7f4e40b69b6efebd2e5c9` → 新モジュール `a83b91a3daea6664f47373af2d725b848e07d58d` → game.js `c93e4bde47ec2d9d815fbf5fb5749e776d43986f` → HTML/コードHEAD `93d50bc1bbaeb39da48cdc18be94446fe9a61b90`。前40分の群れ包囲と09:34重大フリーズ修正、前20分の嗅覚AIを保持。Google Drive正本V0.9の「巣・家族NPC・生活感」を参照。家族繁殖/世代交代は**未実装**。
- **今回新しく遊べる完成単位**：①巣LV2で食料庫の「仲間を迎える（肉24pt）」を**明示的に押したときだけ**肉24ptを消費し、現在のプレイヤー種に対応した狐/猫/犬型の仲間NPCを1匹生成。巣の食料を勝手に減らさない。②仲間は地形衝突を守ってプレイヤーに同行し、プレイヤーが交戦中または敵が警戒中だけ、視線が通る近距離の通常敵を援護攻撃。敵も反撃して仲間にダメージ、死亡すると死骸を残す。強敵は仲間だけで倒せない（HP最低1）。③仲間は同じmobs配列・SAVE_SCHEMA2の通常スナップショット/3CPに入り、復元時に1匹だけ認証し攻撃予兆を初期化。旧保存に仲間がなければ影響なし。④プレイヤーの攻撃照準/命中、野生捕食者判定、遠方個体整理、敵レベル同期から仲間を除外。ミニマップ水色・2D画面「仲間」ラベル・食料庫でHP/募集条件を表示。世界76・近隣9の上限を守り、上限/立てる場所不足時は肉を消費せず募集不可。
- **変更ファイル**：`neo-wild/companions.js` 新規（種族対応・仲間NPC初期化・敵の選択・追従目標）、`neo-wild/game.js`（`recruitCompanion/companionOfPlayer/updateCompanion`・NPC更新・攻撃対象・保存復元・ミニマップ/ラベル）、`neo-wild/index.html`（食料庫UI・script読込・cache rev）、本ROADMAPのみ。他ゲーム・ブログ変更なし。
- **検証**：新モジュール実関数12/12 PASS（仲間種別、敵/獲物選択、遮蔽、潜伏、追従、JSON保存）。ゲーム本体の実`recruitCompanion/updateCompanion`をV8で抽出して実行し、募集・肉24pt消費・二重募集禁止・肉不足/立地/密度/巣LV1の募集拒否・仲間攻撃・死骸重複なし・同行移動・反撃死・HTML script順/ID・全文構文・SAVE_SCHEMA2保持の**16/16 PASS**。合計**28/28 PASS（V8隔離試験、実ブラウザE2Eではない）**。実Android縦横、WebGL表示、実ゲームPad、長時間FPS、旧端末SAVE2→仲間付き3CP復元、屋上巣からの同行、仲間の長距離経路は**未検証**。
- **Pages**：コードHEAD `93d50bc1` に対応する `pages build and deployment` run **41557305084** は10:05 JST時点 **in_progress（build/deploy結果未確認）**。Notify IndexNow run 41557305264 successはPages成功の証拠ではない。最終ROADMAP記録HEADは別runとして次回確認する。
- **機能別状態**：ワールド=途中／動物生態=途中（仲間NPC追加）／生存ループ=途中（肉備蓄を使う同行/援護/死亡の新ループ）／戦闘強敵=途中／UI操作=途中。**PHASE A継続、Bへ切替禁止**。進捗V2 **A16/B12/C9/D4/E8/F9/G8/H4/I4＝74/100（差0）**。家族繁殖・世代継承、E2E/実機の採点条件は未達。
- **次20分枠（実装3件）**：①`game.js:spawnMob/maintainLocalWildlife`で仲間が世界76/近隣9枠を占める場合も地域の通常獲物を欠かさない募集/出現調整。②`game.js:nearbyAwareWildPredator/huntWildPrey`で仲間の防衛行動と野生NPC食物連鎖の整合、敵と仲間の双方向の実戦を拡張。③`game.js:generateWorld/regionAt`で農地・郊外の新しい地続き実区間を優先増築し仲間が歩ける経路を通す。
- **次40分枠（実装3件）**：①`webgl3d.js:drawCommonAnimal3D`で仲間の水色識別・追従/援護/負傷モーションを3Dでも実装。②`fauna.js:visualState/draw2D`と`game.js:drawCreature`で仲間の攻撃・休息姿勢を明確に区別。③`index.html/style.css`の食料庫ボタンと`gamepad.js:poll`でスマホ縦横/Padから募集→戻る→同行の実操作を完成。
- **次00分枠（実装3件）**：①`game.js:recruitCompanion/restoreSnapshot`で実ブラウザの募集→肉消費→保存→再開→仲間復帰を統合。②`game.js:updateCompanion/resolveAttack`で仲間と敵の交戦・死亡・再募集、ボスとの戦闘を検証し新しい家族/後継機能へ接続。③最新HEADのPages run/jobsを個別照合し、build/deploy障害があれば復旧。

## 共同スプリント｜2026/11/03 09:38:30 JST｜40分枠｜ACTIVE_SPRINT_ID=MOUNTAIN-CONTIGUOUS-FOOTHILL-V1｜群れ包囲・挟み撃ち・回避戦闘
- **PHASE=A_FEATURE_COMPLETION（継続）**。開始HEAD `4235037e404ea377548be375a309dacebdee7fc0` → コードHEAD `5423db9df56f6bcc538b1c1d5a7c532bcdeb4d5b`。致命的フリーズ/復元カメラの09:34修正を保持し、ユーザーの実Android再試験は未実施。旧保存を変更しない。
- **新しく遊べるもの**：①既存群れ（2～3体）の先頭は正面追跡、左右の仲間はプレイヤー進行方向に応じた実通行可能な側面へ回り込み、壁/水/崖で塞がれた側は通常追跡へ戻る。②異なる方向から2匹が接近すると0.9秒の「群れの包囲！」予兆円を2D/3D共通HUDに表示。③予兆中に190座標以上離れる・遮蔽物へ隠れる・潜伏すると回避。回避できない場合は持久力14減・一時的に匂い/足音が増えるが、HP即死なし。13.5秒再発動待機。④新ゲーム/セーブ再開時に一時状態を初期化。動物数・群れ6%/12%・110秒・LV8以上3体・SAVE_SCHEMA2/3CPは不変。
- **変更ファイル**：`neo-wild/pack-tactics.js` 新規（側面目標・包囲判定・予兆・描画）、`neo-wild/game.js`（NPC追跡・群れ戦闘・開始/再開・HUD連結）、`neo-wild/index.html`（script読込・rev更新）、本ROADMAP。対象blob SHA `game.js:fd1abc47ab01 / index.html:81fc65489457 / pack-tactics.js:85b4d13747e0`。
- **検証**：V8で新モジュール実関数（左右目標、遮蔽、包囲角度、予兆、持久力減、逃走、潜伏、クールダウン、リセット）・game.js全文構文・既存密度・致命的ループ修復維持・HTML読込順の**28/28 PASS**。実ブラウザの長時間E2E、Android実機、実GPU、物理Pad、保存済み端末データ、全40強敵技は**未検証**。Pages build/deployは今回のコードHEADで別途確認する。失敗は未確認と記録。
- **Pages公開確認追記**：コード+初回ROADMAPを含むHEAD `df194cdbb95b71a0d206a8d247b5a1f4af3f219a` のGitHub Pages run **41554312875** は workflow=success、build=success、deploy=success、report-build-status=success（jobs個別照合）。先行コード単独run `41554305115` は後続コミットによりcancelled。最終記録コミットのPagesは別runのため未確認。実Android再開・物理Pad・長時間FPSは未検証。
- **機能別状態**：ワールド=途中／動物生態=途中（群れ行動を追加）／生存ループ=途中／戦闘強敵=途中（包囲回避の新戦闘）／UI操作=途中。PHASE Bへの切替禁止。
- **進捗V2**：A16/B12/C9/D4/E8/F9/G8/H4/I4＝**74.0/100（前回差0.0）**。統合E2E・実機採点条件を満たさず据置。
- **次00分枠**：①`game.js:restoreSnapshot/loop`でAndroid再開→可視・入力→死亡/再開の重大障害復旧を実機確認。②`game.js:signalPack/update`＋`pack-tactics.js:update/surrounded`で群れ2/3体の予兆→遮蔽/潜伏回避→持久力減の実ブラウザ統合。③本コードHEADのPages build/deploy jobsを個別照合し失敗時復旧。
- **次20分枠**：①`game.js:generateWorld/regionAt`で農地・郊外の地続き新エリアを実移動・衝突・生態付きで増築。②`game.js:spawnMob/maintainLocalWildlife`で新エリアの動物分布を世界76・近隣9内で配分。③`game.js:huntWildPrey/nearbyAwareWildPredator`で群れ捕食・食草・肉の循環を統合。
- **次40分枠**：①`webgl3d.js:drawCommonAnimal3D`＋`fauna.js:visualState/draw2D`で群れの左右追跡・包囲予兆に合わせた固有姿勢。②`gamepad.js:poll`＋`game.js:move/instinct`でPad/タッチの逃走・潜伏・狼咆哮による包囲回避を実操作接続。③`game.js:drawMini`で群れ方向の警告と可読性を実装。

## 重大障害復旧｜2026/11/03 09:34 JST｜ユーザー実機報告｜ACTIVE_SPRINT_ID=MOUNTAIN-CONTIGUOUS-FOOTHILL-V1
- **PHASE=A_FEATURE_COMPLETION（継続）**。ユーザー動画にて「セーブから再開→自キャラ不可視・方向操作不能・フリーズ」を確認。致命的進行不能障害を最優先復旧し、新機能追加は今回は停止。既存保存を削除・スキーマ変更しない。
- **原因を実関数で再現**：`neo-wild/game.js:huntWildPrey` 内に `if(caveScent&&scent)` があり、`scent` は未宣言。洞窟の捕食NPCが獲物を追跡しようとすると `ReferenceError: scent is not defined`。旧ゲームループは例外後に `requestAnimationFrame(loop)` を予約せず停止可能。復元済みカメラ座標がプレイヤーから離れている場合も、再開直後に自キャラが映らない。
- **コード修復と実際の遊びの復旧**：①洞窟NPC狩猟の未宣言変数を除去（`if(caveScent)`）。②`loop` は例外時に操作をリセットして一時停止へ退避、WebGL障害時は2Dへ切替、`finally` で次フレームを必ず予約。③`restoreSnapshot` が元プレイヤー座標を基準にカメラを即時再中央化。④`index.html` の game.js cache revを更新。SAVE_SCHEMA=2/3CP、密度76/9、強敵20種・既存地区を維持。
- **コードコミット**：`game.js` 未宣言/RAF復旧 `f25260e00da769996d6129cba86de9e15bd38c78`、HTML rev `538e53d05d451e1407520174ce8592d380c24539`、カメラ復元 `c85d9ddca65a3989343b0d9859cd7ae9d0d4d333`、最終HTML rev `8cecd202fa09dfad8a2ad975c095ead1d7c91eec`。修復直前main `f1ddb9e4468824f6f1d6cd6f2fb9ec805b302576`。今回記録時HEAD `8cecd202fa09dfad8a2ad975c095ead1d7c91eec`。
- **検査**：元の実 `huntWildPrey` をV8で呼び洞窟時のReferenceError再現、修正後の洞窟/通常追跡・警戒中非追跡・洞窟遮蔽の匂い・通常遮蔽の非追跡PASS。元の実 `loop` を模擬DOMで例外発生させて次フレーム予約・pause退避・2D切替PASS、復元カメラのプレイヤー即時中央化をコード回帰、全game.js構文PASS：**10/10 PASS**。Android実機での修正後操作、実GPU、物理Pad、実ブラウザ長時間、旧端末実SAVE2は**未検証**。
- **公開**：修正HEAD `8cecd202` に対応するGitHub Pages run `41553656562` は09:33時点queued。build/deploy成功を確認するまで**公開完了とは報告しない**。ROADMAP更新HEADは別run、各job確認が必要。
- **進捗V2**：A16/B12/C9/D4/E8/F9/G8/H4/I4＝**74.0/100（前回差0.0）**。重大復旧による根拠なき加点を禁止。
- **次00分枠**：`game.js:restoreSnapshot/loop` で実ブラウザAndroid再開→自キャラ描画→十字方向入力→死亡/再試行を重点QA、異常が再現するなら最優先復旧。Pages runのbuild/deploy個別確認。
- **次20分枠**：`game.js:huntWildPrey/nearbyAwareWildPredator` で洞窟/運河/山岳のNPC追跡を経時確認し同様の未定義参照を排除。復旧が安定なら農地・郊外の地続き区間追加。
- **次40分枠**：`webgl3d.js:render` と `game.js:drawScene` の実Android WebGL→Canvas2D復旧・キャラクター視認性を確認。安定後は景観/モデル新機能を再開。

## 共同スプリント・PHASE A｜2026/11/03 09:20 JST｜20分枠｜ACTIVE_SPRINT_ID=MOUNTAIN-CONTIGUOUS-FOOTHILL-V1｜NPC風下狩り・嗅覚逃走・肉横取り後の摂食
- **PHASE=A_FEATURE_COMPLETION**。開始main HEAD `4ccf7b28f4e7e64a03fa67a3bdec42589c49cf43`、開始blob game/index/ROADMAP `6fdbdadad000017957c8fc4f3169d08f51b09252 / b3d13416e52c3608affb76358779c537b7778565 / 2b8c1b09500da269fc9eabde17b4486089faada3`。前00分の風向奇襲・前40分の野犬肉横取り・前20分の山岳草原と2種を保持。Drive V0.9採用済みの「風下忍び寄り/狩りの駆け引き」のみ実装。PHASE Bには移行しない。
- **今回新しく遊べるもの**：①野生捕食者が風上で発見しづらい獲物を匂いで追跡し、障害物越しでも風下の匂いが届けば探索を始める。攻撃は従来どおり実距離+LOSで判定し、壁越し命中なし。②落ち着いた獲物には風下から接近できる実通行可能な迂回目標を使い、獲物が逃げ出したら直追跡へ戻す。③ウサギ・ネズミ等は風上にいる捕食者の匂いで潜伏/採食/休息を中断して逃走、風下・雨・強風で距離が変化。④野犬に横取りされた肉は拾い直せるが、放置すると野犬が食べるよう摂食欲求を高める。世界76/近隣9、旧SAVE_SCHEMA2/3CP、既存8地区/6地点は不変。
- **差分**：`neo-wild/game.js`（`nearbyAwareWildPredator`新規、`wildPreyInterceptPoint/huntWildPrey/updateFoodThief`、休息・採食・逃走の既存関数接続）、`neo-wild/index.html`（game.js cache rev）、`neo-wild/ROADMAP.md`（本引継ぎ）。コードと台帳は同一原子的コミットを試行。
- **実関数/構文検査**：新game.js全文V8構文PASS。実`scentReachTo/nearbyAwareWildPredator/wildPreyInterceptPoint`のV8隔離実行で風上/風下・雨/強風・遮蔽・実通行可能迂回・逃走中直追跡などPASS。結線/保存不変/命中LOS/密度不変を含め**16/16 PASS**。実ブラウザE2E、Android実機、実GPU、物理Pad、FPS、旧端末保存復元は**未検証**。本試験は実機ではない。
- **公開状況**：コミット直前HEAD/blob再照合PASS。mainコミット後のSHA/Pages run ID/build/deployは実結果を別途照合。未確認を成功と記載しない。
- **公開検証追記**：コード・HTML・ROADMAP同一commit `3172651f38464e19bfb4634fbe1b6ceaa8c8c9ef` のPages run **41552400869** はbuild=success、report-build-status=success、deploy=success（jobs個別確認）。追加の実 `huntWildPrey` 隔離試験4/4 PASS（風向追跡、逆風非追跡、壁越し無傷、LOS致死→死骸1）。総試験20/20 PASS。実ブラウザ・Android・物理Padは未検証。本記録コミット自身のPagesは別runとして確認する。
- **機能別状態**：ワールド=途中／動物生態=途中（風下狩り・嗅覚逃走・横取り肉の摂食追加）／生存ループ=途中／強敵戦闘=途中／UI操作=途中。PHASE A継続。
- **進捗V2**：A16/B12/C9/D4/E8/F9/G8/H4/I4=**74.0/100（前回差0.0）**。実機・統合試験の新しい採点条件を満たさず加点なし。
- **次40分枠**：①`fauna.js:visualState/draw2D`と`webgl3d.js:drawCommonAnimal3D`に風下接近/匂い警戒の固有姿勢を接続。②`game.js:drawMini/syncHUD`で捕食者の風向・警戒を視認できる軽量表示を検討、縦横HUDを維持。③`gamepad.js:poll`と`game.js:resolveAttack`で風下狩り→肉回収→横取り回避の4ボタン経路を連結。
- **次00分枠**：①`game.js:nearbyAwareWildPredator/updateIndoorRest/huntWildPrey`の実関数経時統合試験、風上/風下で警戒→逃走→追跡→討伐を確認。②`game.js:updateFoodThief/scavengeWildFood/putDownFood`の横取り→食べる/回収→巣備蓄を通す。③Pages runのbuild/deployを照合し失敗時復旧、保存/3CP/強敵/死亡ループを回帰。
- **次20分枠**：①`game.js:generateWorld/regionAt`で山岳以外の農地・郊外を既存地区と地続きに拡張（道路/衝突/生態の完成単位）。②`fauna.js:choose/weight`と`game.js:spawnMob/maintainLocalWildlife`で農地の出現と食物連鎖・空白を実装。③`mountain.js:blocked/spawnCandidate`で既存山腹・洞窟経路との接続と旧保存位置を回帰。

## 共同スプリント・PHASE A｜2026/11/03 09:04:15 JST｜00分枠｜ACTIVE_SPRINT_ID=MOUNTAIN-CONTIGUOUS-FOOTHILL-V1｜風下接近→匂い回避→奇襲→DNA報酬の狩猟ループ
- **PHASE=A_FEATURE_COMPLETION**。前40分の野犬肉横取りと前20分の山岳草原・カモシカ/ヤギの地続き生態を維持。開始HEAD `ead99cbf6af874553e9a6d115f4f64f410c56c05` → コード `c1463612c5f1b415e7c589703c8c815b6d6d5fec` → HTML rev `355f325f284e42ef0561dce29ea72f5833155de2`。変更は `neo-wild/game.js`・`neo-wild/index.html`、本記録 `neo-wild/ROADMAP.md` のみ。Google Drive「WILD RECLAIM｜完成仕様設計書」V0.9の2026-11-02採用済み「風下からの忍び寄り/奇襲報酬」を実装対象として確認。ユーザー未採用の夜事件・縄張り襲撃等は追加していない。
- **新しく遊べる完成単位**：①従来 `detectsPlayer` の `Math.sin(elapsed*.022)` による独立した風時計を廃止し、天候変化・SAVE2で保持される `windDirection` と匂い伝播を一致させた。風上から獲物へ接近すると匂いが遠くまで届き、風下から忍ぶと届きにくい。雨は匂い距離が短く、強風は長い。視覚・聴覚・接触・遮蔽の既存判定は維持。② `isDownwindStalk` と `resolveAttack` を接続し、未発覚の風下奇襲は通常奇襲より攻撃倍率を1.55→1.75に強化。風下奇襲で仕留めた場合に限り、`kill` で基本DNAの25%（最低1）を追加付与。通常討伐の死骸1件・図鑑・成長・既存XP保存経路を維持。③HUDの時刻・天候欄に保存済み風向の矢印を表示し、狩りの方向を判断可能にした。新ボタン/セーブ形式/動物数変更なし。
- **実関数試験**：現行game.js全文のV8コンパイルPASS。実 `scentReachTo/isDownwindStalk/detectsPlayer` を隔離実行し、風上/風下100座標の発見差・雨と強風の匂い距離・接近発見・保存スキーマ保持・HUD結線など10/10 PASS。実 `resolveAttack/kill` を抽出し、風下ダメージ21 > 風上19、風下致死時だけボーナス、DNA通常8→風下10、死骸1件、討伐一度だけなど7/7 PASS。**合計17/17 PASS（V8隔離試験）**。実ブラウザでの長時間風下追跡→討伐→保存・Android実機・GPU/Pad・FPS・強敵全技は未検証。静的配線チェックを実機PASSとは扱わない。
- **Pages**：HTMLコードHEAD `355f325f` のrun **41549985126** を確認、build=success、deploy=queued、report-build-status=in_progress（09:03頃の取得）。**deploy成功は未確認**。本ROADMAP記録HEADのPages runも未確認。次担当は最終HEADのrun/jobsを確認する。
- **機能別状態**：ワールド=途中／動物生態=途中（匂い警戒の風下/風上を追加）／生存ループ=途中／戦闘・狩猟=途中（風下奇襲の独立した選択肢追加）／UI操作=途中。**PHASE A継続、Bへ切替禁止**。
- **進捗V2**：A16/B12/C9/D4/E8/F9/G8/H4/I4＝**74/100（前回差0）**。実ブラウザE2Eや採点条件の新規達成が証明できないため加点しない。
- **次20分枠（新機能3件）**：①`game.js:huntWildPrey/nearbyVisibleWildPredator`でNPC同士の風下狩り・匂い警戒を種ごとに接続（視覚/衝突と矛盾させない）。②`game.js:generateWorld/regionAt`で既存都市の西/南に農地・郊外等の山岳以外の地続き実歩行区間を増築。③`fauna.js:species`と`game.js:spawnMob/maintainLocalWildlife`で新エリアの食物連鎖・生息地・保存・空白対策を完成単位で実装。
- **次40分枠（新機能3件）**：①`fauna.js:draw2D/visualState`と`webgl3d.js:drawCommonAnimal3D`で風下潜伏/嗅覚警戒の動物固有姿勢・演出をプレイに接続。②`game.js:syncHUD`と`style.css`でスマホ縦横の風向表示がHUDを圧迫しないよう最適化し、実画面で見える導線を実装。③`gamepad.js:poll`と`game.js:attack/dash`で風下接近→潜伏→奇襲のPad/タッチ操作を実装/検証。
- **次00分枠**：①`game.js:detectsPlayer/attack/resolveAttack/kill`で風上/風下・雨/強風・視覚/聴覚の実プレイ連結と保存再開を確認。②`game.js:carryFood/putDownFood/updateFoodThief`で風下奇襲後の肉運搬→野犬横取り→奪還→巣備蓄の実ループを完成させる。③最新コード/ROADMAP HEADのPages run/jobsを照合し、build/deploy失敗なら復旧。

## 共同スプリント・PHASE A｜2026/11/03 08:44 JST｜40分枠｜ACTIVE_SPRINT_ID=MOUNTAIN-CONTIGUOUS-FOOTHILL-V1｜運搬肉の横取り・回避・回収プレイループ
- **PHASE=A_FEATURE_COMPLETION**（3枠共通。主要ループ未完成のためBへ移行禁止）。前20分の山岳草原・カモシカ/ヤギ・洞窟捕食者・旧セーブ復旧を維持。開始ROADMAP blob `da6c38471d9dc988c0ad8492439793bbc518843b`、今回コードコミット `6fb198882f1e0392c6a3657c84fd9e9d64e1851b`、HTML revコミット `152b42701225133f605240e62b301b84d0686814`。変更は `neo-wild/game.js` と `neo-wild/index.html` のみ。ROADMAP更新開始時HEAD `152b42701225133f605240e62b301b84d0686814`。
- **新たに遊べるもの**：プレイヤーが肉を運搬している間、近距離の野犬が視線/距離/隠れを判定して追跡。射程に入ると**0.68秒の可視警告**を出し、予告終了時に実距離/遮蔽/ジャンプ高度を再判定して肉を横取り。横取りした肉は野犬の足元に実死骸/肉オブジェクトとして落ち、プレイヤーは従来の△長押しで拾い直せる。予告中に逃げる・壁/建物に隠れる・ジャンプする・先に肉を置くことで横取り回避。攻撃後は同じ野犬に9.5秒の再横取り待機。食草/巣の中/隠れ中は対象外。2D警告円は実判定半径と一致。既存の肉・草の巣備蓄、SAVE_SCHEMA2/3CP、世界76/近隣9、山岳/地区、他ゲームは変更しない。
- **変更関数**：`game.js:updateFoodThief` 新規、`update` の野犬AI優先分岐、`restoreSnapshot` の横取り警告クリア、`drawBossThreats` 直後の野犬警告描画。 `index.html` の game.js revを更新。
- **検査**：game.js全文V8構文PASS。実`updateFoodThief`をV8隔離実行し、野犬の警告→0.68秒後に肉28pt横取り→足元の回収可能肉1件生成、肉の二重複製なし、旧スキーマ宣言保持をPASS。**未検証**：実ブラウザでの野犬追跡→横取り→拾い直し→巣備蓄E2E、Android実機、実GPU/Pad、長時間FPS、旧端末実SAVE2。隔離試験を実機成功と呼ばない。
- **公開**：game.js `6fb19888`、HTML `152b4270` はmainへ差分コミット成功。対象HEADのPages run ID、build/deployは**未確認**。前runの成功を流用しない。
- **機能別状態**：ワールド途中／動物生態途中／生存ループ途中（運搬中の横取りと回収を追加）／戦闘強敵途中／UI操作途中。PHASE A継続。
- **進捗V2**：A16/B12/C9/D4/E8/F9/G8/H4/I4＝**74/100（前回差0）**。新たな採点条件のE2E根拠がなく据置。
- **次00分枠**：①`game.js:updateFoodThief/putDownFood/carryFood`で横取り→回収→巣備蓄を実ゲーム連続検証し欠落を修復。②`game.js:restoreSnapshot/normalizeCarry`で横取り警告中の旧SAVE2/3CP復元を回帰。③HEADに対応するPages run/jobsを確認し公開障害を復旧。
- **次20分枠**：①`game.js:huntWildPrey/scavengeWildFood`で横取りした肉を野犬が拾い食べる連鎖を実装。②`game.js:maintainLocalWildlife`で肉運搬中の野犬追跡が密度上限を壊さないことを確認。③`mountain.js:choose`と`game.js:spawnMob`で農地/山岳の未完成生態種を継続追加。
- **次40分枠**：①`fauna.js:draw2D`と`webgl3d.js:drawCommonAnimal3D`で横取り専用の野犬飛びかかり姿勢・3D予兆円を実装。②`gamepad.js:poll`で横取り回避中のジャンプ・肉置き・拾い直しを縦横で実操作。③`game.js:drawMini`で肉の落下位置の視認性を改善。

## 共同スプリント・PHASE A｜2026/11/03 08:17 JST｜20分枠｜ACTIVE_SPRINT_ID=MOUNTAIN-CONTIGUOUS-FOOTHILL-V1｜地続き南側山岳草原＋カモシカ・ヤギ生態の縦実装
- **PHASE=A_FEATURE_COMPLETION（全3枠共通・Bへの切替禁止）**。直前の00分旧SAVE2破損復旧、40分のキツネ/タヌキ描画、20分の洞窟追跡は維持。開始HEAD `301cc118ed8bd50ff2ccbc6a4e017c5d74335ed0` → 今回コード/HTML HEAD `73ffa4f7ce8407f51ddf02bae3950369fad3aceb`。Drive「WILD RECLAIM｜完成仕様設計書」V0.9末尾・前00/20/40分ROADMAPを確認。対象は neo-wild/ のみ。
- **今回新たに遊べるもの**：①既存山腹道から峡谷の既設橋を渡って南側の山岳草原へ歩いて入れる枝道を追加。草原は最大+430座標の実可動幅、滑らかな標高・崖の衝突・障害物のある連続ワールドで、別ステージ遷移なし。橋以外で渓谷を渡れず、標識の道は50地点連続通行可能。②再生可能な草45束を実地形に設置し、2D/3D描画とNPC採食の既存実関数 forageWildBerries に結合。③ニホンカモシカ（高速の急斜面逃走）とヤギ（0.54秒予兆→射程/壁判定付き角突き→逃走）を新規登録し、草原/山腹/山頂の分布を既存総枠内で再配分。各種2D/3D固有モデル、討伐死骸・食料、図鑑、SAVE_SCHEMA2を既存ゲーム経路で接続。④草原分岐と可動範囲をミニマップに追加。既存8地区・6探索地点・世界76/近隣9・初期13・晴7雨5・9秒・群れ110秒は不変。
- **コード差分**：`mountain.js`（枝道・標高/崖/橋・植生・生息域/候補・選択）、`fauna.js`（2種定義・2D固有姿勢）、`webgl3d.js`（地形・植生・2種3D）、`game.js`（ミニマップ・採食・カモシカ逃走・ヤギ予兆反撃/復元）、`bestiary.js`（2種の図鑑）、`index.html`（5本のcache rev）。主要コミット：草原 `55304001`→橋経路 `671a8800`→種 `6791d1c5`/`10d7f67a`/`4e75afa5`→戦闘/3D `896d84a3`/`0f2dcf65`→渓谷出現修正 `df8ae812`→rev `73ffa4f7`。HEAD/blob SHAは各GitHub Contents更新前に再取得し強制pushなし。
- **QA**：現行5 JS全文V8コンパイルPASS。実`WildMountain`の連続歩道50/50・草原境界/採食/生息域・実`WildFauna.draw2D`の2種×2姿勢、実`drawCommonAnimal3D`の2種×2姿勢/有限ジオメトリ、実ヤギ警告→命中→逃走/距離回避/壁遮断を隔離動的試験で **114/114 PASS**。実`mountainTerrain` 3Dモック507プリミティブ/全有限・実`WildMountain.draw2D`描画モックPASS。試験途中で渓谷内の草原生息域判定を発見し`df8ae812`で除外、再検査PASS。**未検証**：実ブラウザでの連続10分探索、Android実機、実GPU/FPS、物理Pad、旧端末実SAVE2/3CP、強敵40技の全実戦。関数隔離試験を実機検証とは呼ばない。
- **追加保存/描画回帰**：現行game.jsの実`sanitizeSavedWorld`をV8隔離実行し、旧SAVE_SCHEMA2相当の保存からニホンカモシカ/ヤギ2種と死骸2件を復元し、破損NaN個体1件を除外・入力元非破壊をPASS。`mountainTerrain`の実関数で507個の3Dプリミティブ生成・全有限、`WildMountain.draw2D`実関数の描画モックPASS。実端末保存・実GPUは引き続き未検証。
- **Pages**：今回最終コード/HTML HEAD `73ffa4f7ce8407f51ddf02bae3950369fad3aceb` に対応するrun ID・build/deployは**未確認**。PR専用commit-workflow取得ではPages runを確定できず、旧runを今回の証拠に流用しない。00分枠で対象HEADのActions build/deployを個別確認。
- **機能別状態（PHASE A）**：ワールド＝途中（草原枝道追加、農地/港等の連続面積不足）、動物/生態＝途中（草原2種連結、他霊長類・草食・捕食の未完あり）、生存ループ＝途中、戦闘/強敵＝途中、UI/操作＝途中。全主要ループの統合E2E未達につきPHASE Bへの移行禁止。
- **進捗V2**：A16.0/B12.0/C9.0/D4.0/E8.0/F9.0/G8.0/H4.0/I4.0＝**74.0/100（前回74.0、差0.0）**。新たな採点条件を証明できていないため据置。
- **次00分枠（実装3件）**：①`game.js:spawnMob/maintainLocalWildlife`で草原の2種の実出現→追跡/反撃→死骸→採食を旧SAVE2/3CPと連結し、草原・洞窟間の個体密度を実関数で確認。②`game.js:resolveAttack/kill/restoreSnapshot`でヤギ討伐・図鑑永続・肉運搬/巣備蓄・死亡再開を1プレイループに統合し、欠落部分を実装。③今回HEADに対応するPages build/deployを確認し、公開障害なら復旧。
- **次40分枠（実装3件）**：①`webgl3d.js:mountainTerrain/drawCommonAnimal3D`で草原の岩場/段差とヤギ角突き/カモシカ疾走の視認性・実景を拡張。②`fauna.js:draw2D`と`mountain.js:draw2D`で草原/旧廃村の見た目・動物の実姿勢を一致させる。③`gamepad.js:poll`と`game.js:drawMini/move`で草原枝道の縦横/Pad導線を確認し、欠けたUI/操作を実装。
- **次20分枠（実装3件）**：①`game.js:generateWorld/regionAt`で都市西/南の未整備農地・草原など、山岳以外の地続き探索区間を増築。②`fauna.js:species`と`game.js:huntWildPrey/forageWildBerries`で未完成の通常ゴリラ・ヒヒ/農地草食のうち生息域と戦闘まで一括実装。③`mountain.js:spawnCandidate/blocked`と`game.js:repairRestoredMountainMobs`で新旧草原/洞窟のNPC動線と旧保存互換を継続。

## 共同スプリント・統合QA｜2026/11/03 07:55 JST開始｜00分枠｜ACTIVE_SPRINT_ID=MOUNTAIN-CONTIGUOUS-FOOTHILL-V1｜旧セーブ破損耐性・ゲーム復帰の一括修復
- **開始HEAD→コード/HTML HEAD**：`f9f8a7a29511700031ec1ceed138e0d57d1a9dad` → `2f23ce88063231f7293c29d8558892a8b63afa48`。コードコミット `1ceb73c7f5ab47513339fdccb184a4906e4553c1`、index.html キャッシュ更新 `2f23ce88063231f7293c29d8558892a8b63afa48`。変更対象は neo-wild/game.js・index.html・ROADMAP.md のみ。前20分の洞窟捕食者追跡・前40分のキツネ/タヌキ2D/3D姿勢を保持。Drive「完成仕様設計書 V0.9」末尾の既存セーブ/ゲームパッド/生態系互換仕様を確認。
- **実際の修復**：①旧SAVE_SCHEMA2/3CP内に壊れた野生動物（null/非有限座標・HP・速度・半径・未知種）が混入しても、正常な個体を保持して不正個体を除外・復旧。②死骸/骨/食草、植物、障害物の不正レコードを取り除き、骨の旧形式amount未記載は0へ補正。③プレイヤーの速度/攻撃力/生命/スタミナ/方向/経験値/当たり判定の非有限値・欠落値を安全な初期値へ復旧。正常なLV/HP強化/速度強化/経験値は保持。元のセーブオブジェクトは変更しない。SAVE_SCHEMA番号、保存キー、3CP件数、既存山岳地形/戦闘/動物密度は変更なし。ゲーム開始・続きからでのクラッシュ/操作不能を防ぐための互換復旧。
- **試験**：現行game.js全文のJSコンパイル、実`sanitizeSavedWorld/normalizeSavedPlayerStats`関数をV8で実行し、正常・破損野生個体、未知種、NaN座標/速度、死骸/骨、植物/障害物、旧セーブ非破壊、プレイヤーの正常強化保持/欠損修復、restore連結コードを **19/19 PASS**。静的・関数隔離試験であり、実ブラウザ10分E2E、Android実機、物理Pad、実GPU、旧端末実セーブ、ボス40技全実戦は**未検証**。未検証をPASSとしない。
- **Pages**：前40分枠コードHEAD `c58d4b2` のrun **41539913129** はbuild/deploy/report-build-status各successをjobsで確認。今回コード/HTML HEAD `2f23ce88` に対応するPages run ID・build/deployは**未確認**（commit workflow APIはPR起動のみ、combined statusからは確定できない）。次00分枠はrun/jobsを照合し未公開なら復旧。
- **進捗V2**：A16/B12/C9/D4/E8/F9/G8/H4/I4＝**74/100（前回74、差0）**。実ブラウザ/実機E2E採点条件未達で据置。
- **次20分枠（具体関数3件）**：①`game.js:sanitizeSavedWorld/restoreSnapshot/normalizeStrongBossSave`で破損・旧SAVE2/3CPを実地形上で再開し、洞窟NPCの位置修復・捕食者状態を回帰。②`game.js:huntWildPrey/scavengeWildFood/toBones`で2捕食者×2移動獲物の600秒追跡→死骸→骨化を経時試験。③`game.js:maintainLocalWildlife/retireFarCalmAnimal`で8地区＋山岳4zoneの空白・過密、世界76/近隣9/群れ110秒を確認。
- **次40分枠（具体関数3件）**：①`fauna.js:visualState/draw2D`と`webgl3d.js:drawCommonAnimal3D`でキツネ/タヌキの追跡→噛みつき→摂食の2D/3D画面一致を実ブラウザ確認。②`mountain.js:blocked/sightBlocked`＋`webgl3d.js:mountainTerrain`で洞窟柱・崖の衝突と視認性/FPSを縦横実画面QA。③`gamepad.js:poll`＋`game.js:restoreSnapshot/move`で旧セーブ再開・死亡リトライ・Pad入力・縦横切替の実機QA。
- **次00分枠**：今回の新HEADに対応するPages build/deployの実run/jobs確認、旧SAVE2実ブラウザ復元、タイトル→移動→狩り→備蓄→死亡→リトライの連続E2E。重大不具合は先に修復。

## 共同スプリント・次担当｜2026/11/03 07:45 JST｜40分枠｜ACTIVE_SPRINT_ID=MOUNTAIN-CONTIGUOUS-FOOTHILL-V1｜洞窟キツネ・タヌキの先回り狩猟姿勢を2D/3D統一
- **開始HEAD→コードHEAD**：`5584e3db3522e2066c6c42ca3a2067be86550325` → `c58d4b2cfd5b13d94121f773d7a09cb91279536b`。neo-wild/fauna.js・webgl3d.js・index.htmlのみ差分コミット。今回の記録コミットは別HEAD。
- **実プレイ上の変化**：①`fauna.js:visualState`で既存AIの`wildTargetX/Y/At`・`swing`・`scavengePose`・`vx/vy`を読むだけの共通姿勢判定（追跡/噛みつき/摂食/疾走）を追加。②野生キツネ`wildFox`を汎用犬型から独自の2D/3Dモデル（白い尾先・尖った耳・明瞭な顔・四肢）へ変更し、獲物への先回り・噛みつき・摂食・疾走を姿勢に反映。③タヌキ`raccoonDog`の追跡時の胴体・噛みつき口・摂食時の低姿勢・警戒眉を2D/3Dで連動。洞窟暗所では白い尾先/目周りの模様によって識別しやすくするが、人工発光や街灯光は復活しない。④2 JSのHTML revを更新。AI・戦闘命中・保存スキーマ・動物総数は変更なし。洞窟ネズミ→イタチ/キツネ/タヌキの既存捕食連鎖に視覚状態を接続。
- **実関数・描画モック試験**：fauna.js/webgl3d.js全文をV8のFunctionコンパイルPASS。実`WildFauna.draw2D`でキツネ/タヌキ各4状態（通常・追跡・噛みつき・摂食）の描画命令を実行し、各4姿勢の差異 8/8 PASS。実`drawCommonAnimal3D`関数を抽出し、ellipsoid/pyramidモックでキツネ/タヌキ各4状態のジオメトリを実生成し、各4姿勢の差異 8/8 PASS。合計16姿勢PASS。HTMLの2参照rev変更確認。ブラウザ上での実GPUレンダリング/Android実機/物理Pad/縦390×844・横800×360/844×390/10分E2E/FPS/旧SAVE2実端末/強敵40技実戦は**未検証**。静的/モックPASSを実機PASSとは呼ばない。
- **Pages**：コードHEAD `c58d4b2` に対応するPages run **41539913129** は07:45時点でin_progress（build進行中）。build/deploy両成功はまだ未確認。前HEAD `5584e3db` のrun **41537695293** はsuccess。今回の記録HEADのPagesは別途確認。
- **進捗V2**：A16.0/B12.0/C9.0/D4.0/E8.0/F9.0/G8.0/H4.0/I4.0＝**74.0/100**（前回74.0、差0.0）。実機・連続E2E等の採点条件未達のため加点なし。
- **次00分枠**：①`game.js:huntWildPrey/scavengeWildFood`＋`fauna.js:visualState/draw2D`でキツネ/タヌキの動く獲物追跡→討伐→死骸摂食を10分E2Eで確認。②`game.js:restoreSnapshot/getCheckpoints`で旧SAVE2・3CPと死亡リトライ/洞窟石柱復元。③HEADに対応するPages run/jobsを照合し、失敗時は即修復。
- **次20分枠**：①`game.js:wildPreyInterceptPoint/steerPursuit/huntWildPrey`でタヌキ/キツネの追跡ターゲット状態と投射姿勢を経時実関数試験。②`game.js:maintainLocalWildlife/spawnMob`で山頂洞窟の晴雨/世界76/近隣9/群れ制限と出現偏りを測定。③`mountain.js:blocked/sightBlocked`で石柱越しの不正命中・移動経路・死骸位置を回帰。
- **次40分枠**：①`fauna.js:draw2D/visualState`と`webgl3d.js:drawCommonAnimal3D`で追跡/攻撃姿勢の実画面と夜間可読性を比較。②`webgl3d.js:mountainTerrain/render`で洞窟石柱・床・岩片の描画LOD/FPSを縦横実ブラウザで測定、必要時最適化。③`gamepad.js:poll`＋`game.js:move/restoreSnapshot`で洞窟往復・死亡再開・物理Padの入力回帰。

## 共同スプリント・次担当｜2026/11/03 07:29:22 JST｜20分枠｜ACTIVE_SPRINT_ID=MOUNTAIN-CONTIGUOUS-FOOTHILL-V1｜洞窟で動く獲物を分担追跡→討伐→死骸摂食・石柱スタック復帰
- **開始HEAD→コードHEAD**：`942ae538a8b8a1d17508aee9d30d3d801567d7db` → `bc5e3b327d254b4c05c6b11ff2a784cfbd318b8c`。game.js `4750ce0c0535a78a111517cd35e45770e13f2985`（blob `6515c4fce7c14022f49bfd4fadeb04023893fc19`）、index.html rev `bc5e3b327d254b4c05c6b11ff2a784cfbd318b8c`。今回のROADMAP記録は別HEAD。neo-wild/以外未変更。
- **実際の遊びの変化**：①`wildPreyInterceptPoint`で洞窟イタチ/キツネ/タヌキが逃走中の獲物の移動先へ回り込む（洞窟外・崖・衝突地点への先回り禁止）。②`huntWildPrey`で移動中の同じ獲物への短時間追跡継続を加え、複数捕食者が別の獲物を追う既存分担を安定化。③`steerPursuit`で石柱付近の0.72秒実移動量を監視、移動できなければ再経路探索と迂回側変更（ワープなし）。洞窟の移動目標は経路再計算0.48秒、都市側は旧1.05秒を維持。死骸/食料/図鑑/旧SAVE_SCHEMA2のデータ形式は変更なし。
- **実関数動的試験**：現行game.jsの実`wildPreyInterceptPoint/huntWildPrey/caveWildlifePath/steerPursuit/scavengeWildFood`を抽出し、2捕食者×移動ネズミ/ウサギを模擬洞窟で96秒経時実行。両獲物を3.52秒で討伐→死骸2個→摂食で骨2個へ、二重死骸0、食料負数0、移動最大13.08座標/0.08秒（ワープなし）、石柱遮蔽・スタック監視・予測先回り含む **11/11 PASS**。現行mountain.js実`blocked/zone/center`の洞窟中央38地点すべて通行可、地続き区間、既存8地区・SAVE_SCHEMA2・3CP・密度13/76/9・晴7雨5・9秒・群れ110秒・BOSS-BALANCE-V2の回帰とJS全文構文 **12/12 PASS**。合計 **23/23 checks PASS**。模擬衝突/隔離V8試験であり実ブラウザ・Android実機・GPU・物理Pad・600秒実プレイ・全40強敵技は**未検証**。
- **Pages**：GitHub commit workflow runs API（PR-triggeredのみ）とcombined statusは対象2コミットとも空。今回のrun IDは取得できず、**コードHEADのPages build/deployは未確認**。旧run成功を流用しない。次00分枠はActionsの実run/jobsを別々に確認し、失敗時は原因修正。
- **進捗V2**：A16.0/B12.0/C9.0/D4.0/E8.0/F9.0/G8.0/H4.0/I4.0＝**74.0/100（前回74.0、差0.0）**。新規完成採点条件を満たした根拠はなく据置。
- **次00分枠**：①`game.js:huntWildPrey/scavengeWildFood/kill/toBones`で実ブラウザ洞窟往復→2捕食者の動的狩り→骨化→プレイヤー運搬/巣備蓄を連続E2E。②`game.js:restoreSnapshot/getCheckpoints/maintainLocalWildlife`で旧SAVE2/3CP/死亡リトライと世界76・近隣9・強敵40技を回帰。③コードHEAD `bc5e3b32` と記録HEADのPages実run ID/jobs build/deployを確認。
- **次20分枠**：①`game.js:huntWildPrey/steerPursuit/caveWildlifePath`＋`mountain.js:blocked/sightBlocked`の実地形で移動2獲物/2捕食者の600秒経時・石柱迂回成功率/スタック回数を測定。②`game.js:scavengeWildFood/animalRemains/toBones`で死骸の取り合い・プレイヤー食事/運搬・骨化を統合。③`game.js:maintainLocalWildlife/retireFarCalmAnimal/restoreSnapshot`で8地区+山岳4zone・晴雨LV1/6/11の分布と旧SAVE2/3CPを回帰。
- **次40分枠**：①`fauna.js:draw2D`・`webgl3d.js:drawCommonAnimal3D`で洞窟イタチ/タヌキ/キツネの先回り姿勢と夜間視認性を実画面QA。②`mountain.js:blocked/sightBlocked/draw2D`・`webgl3d.js:mountainTerrain`で洞窟石柱の視線/通路と2D/3D一致・スマホFPS/LODを確認。③`gamepad.js:poll`・`game.js:move/restoreSnapshot`で縦横・Pad・洞窟往復・死亡再開の実機QA。

### 00分枠・出荷検証追記｜2026/11/03 JST｜ACTIVE_SPRINT_ID=MOUNTAIN-CONTIGUOUS-FOOTHILL-V1
- **コード＋初回記録コミット**：`4f94c71e5bceef89b34cb17968825564bb7d1a60`。GitHub Pages run **41533544272** は **workflow=success / build=success / deploy=success / report-build-status=success** を個別確認。コードはPagesへ配信成功。記録追記コミット自身のrunは別途確認。
- **追加回帰QA**：現行game.jsの実`isValidSnapshot/getAutoSnapshot/getCheckpoints/scoreRunIdFromSnapshot/loadTopScores/recordTopScore`を模擬localStorageで隔離実行し、旧SAVE_SCHEMA2/新追跡timestamp任意/無効HP・座標・上限/3CP/自動保存/旧lineage安定/TOP5/リトライ同一挑戦/最高記録保持を **15/15 PASS**。上記洞窟狩猟13/13と合わせて **28/28 checks PASS**。実ブラウザ・Android・GPU・物理Pad・長時間E2E・全40強敵技は未検証。進捗74/100据置。
- **次20/40分枠**：直下の「共同スプリント・統合QA」項にある具体的な各3件を優先。最新HEAD・本追記と次枠の成果を読み、衝突回避して実装継続。

## 共同スプリント・統合QA｜2026/11/03 JST｜00分枠｜ACTIVE_SPRINT_ID=MOUNTAIN-CONTIGUOUS-FOOTHILL-V1｜洞窟ウサギ狩猟・捕食者分担・死骸摂食の統合修正
- 開始HEAD `f56a4d16003ec35a04e175d50323e35a5e3bbec3`。前20分枠の洞窟複数捕食者/地域個体保護と前40分枠のイタチ・ヘビ固有姿勢を維持。変更はneo-wild/game.js・index.html・ROADMAP.mdのみ。
- 実プレイ修正：洞窟イタチ/タヌキがウサギだけの洞窟では狩りを開始しない種判定の欠落を修正。キツネに加えてイタチ・タヌキもウサギを追跡・実ダメージ・死骸化できる。複数捕食者の分担で旧チェックポイントや追跡中断後の古い標的座標が生きた獲物を占有する問題を修正。1.2ゲーム秒以内の実追跡のみを分担対象とし、獲物消失・プレイヤー警戒・野生討伐時に標的を解除。旧SAVE_SCHEMA2互換、世界76/近隣9/9秒/群れ110秒は変更なし。
- 実関数QA：修正前の「イタチ→ウサギ狩猟不可」を再現。修正後の実huntWildPrey/scavengeWildFoodをV8隔離実行。イタチ/タヌキ→ウサギ追跡、古い標的除外・新しい標的分担、壁越し噛みつき禁止、討伐→死骸1個→捕食者摂食、討伐後・獲物不在・プレイヤー警戒時の追跡解除、JS全文構文を**13/13 PASS**。模擬壁・隔離環境であり実ブラウザ/Android/GPU/物理Pad/10分E2E/FPS/強敵40技全ケースは未検証。
- Pages：今回コード/記録HEADのbuild/deployはコミット後にrun/jobsを個別確認。未確認時は未確認。
- 進捗V2：A16/B12/C9/D4/E8/F9/G8/H4/I4＝**74/100（前回74、差0）**。実機・E2E未検証のため据置。
- 次20分枠：①game.js:huntWildPrey/steerPursuit/caveWildlifePathでイタチ/タヌキ/キツネ×ウサギ/ネズミの10分相当の経時追跡、石柱迂回・捕食成功率を確認。②game.js:scavengeWildFood/toBones/animalRemainsで死骸摂食・骨化・プレイヤー運搬を連結。③game.js:maintainLocalWildlife/retireFarCalmAnimal/restoreSnapshotで8地区/山岳4zoneと旧SAVE2/3CPを回帰。
- 次40分枠：①fauna.js:draw2D・webgl3d.js:drawCommonAnimal3Dでウサギを追うイタチ/タヌキ/キツネの追跡姿勢と夜間視認性。②mountain.js:blocked/sightBlocked/draw2D・webgl3d.js:mountainTerrainで石柱と攻撃遮蔽の2D/3D一致。③gamepad.js:poll・game.js:move/restoreSnapshotで洞窟往復・Pad/縦横・死亡再開を実ブラウザQA。
- 次00分枠：①洞窟で野生狩り→死骸→摂食→プレイヤー備蓄→死亡/リトライをE2E。②強敵40技/スコアTOP5/旧SAVE2・3CP/密度76・9を回帰。③今回コミットと直近20/40分枠のPages build/deploy jobsを確認し失敗時は復旧。

## 共同スプリント・次担当｜2026/11/03 JST｜40分枠｜ACTIVE_SPRINT_ID=MOUNTAIN-CONTIGUOUS-FOOTHILL-V1｜洞窟捕食者の2D/3D固有姿勢・攻撃視認性
- **開始HEAD→コードHEAD**：`3eb65a60a0e843ebb309bb678f4911b41231da49` → `0fda99d817b079cd98bf76a0a35ca3b6e5747e9c`。fauna.js `a3ad7754`、webgl3d.js `1fe14c8f`、index.html rev `0fda99d8`。今回の記録コミットは別HEAD。neo-wild/以外変更なし。旧コード全文の強制上書き・強制pushなし。
- **実際のプレイ変化**：①洞窟のイタチに狩猟追跡（胴体伸長）・噛みつき（前肢/頭部前進、口の開閉）・死骸摂食（低い頭と胴体）を2D/3Dで同じ実AI状態から描き分け。②イタチの顔・耳・眼・口と尾の動きを追加し、洞窟でネズミと識別しやすくする。③通常ヘビ/毒ヘビの実windupに連動する頭部持上げと攻撃姿勢を2D/3Dで同期。毒ヘビ固有の黄模様は維持。判定・当たり判定・AI/密度/旧SAVE2/3CPは変更なし。見た目だけの別状態を偽装せず既存m.swing/m.windup/m.scavengePose/m.wildTargetX/Yを使用。
- **動的/構文QA**：実fauna.js:draw2Dとwebgl3d.js:drawCommonAnimal3Dを抽出しV8で実行。ネズミ/イタチ/通常ヘビ/毒ヘビ×待機・攻撃・摂食・追跡・逃走×2D/3Dの**20組の状態組合せ（40描画呼出）PASS**。2Dのellipseと3Dのプリミティブ座標は全て有限、両描画がtrue。イタチの待機/攻撃/摂食/追跡4姿勢が2D/3Dで相違、通常ヘビ/毒ヘビの待機/予兆が2D/3Dで相違（6/6 PASS）。両JS全文の構文PASS。これはV8/描画プリミティブのモック試験であり、実GPU・実Android・物理Pad・縦横実ブラウザ・10分E2E・FPS・強敵40技の全実戦は**未検証**。
- **Pages**：コードHEAD `0fda99d8` に対するGitHub combined statusは空、commit workflow runs取得も空（このAPIはPR起動のみ対象）。**今回コードのPages build/deployは未確認**。過去のrun成功を今回の成功と混同しない。次00分枠で実際のrun/jobsを取得し両方successを確認する。
- **進捗V2**：A16.0/B12.0/C9.0/D4.0/E8.0/F9.0/G8.0/H4.0/I4.0＝**74.0/100（前回74.0、差0.0）**。姿勢追加は新たな採点条件の全完了に相当しない。
- **次00分枠**：①`game.js:huntWildPrey/scavengeWildFood/kill`でイタチの追跡→噛みつき→死骸摂食→骨化を実関数統合QA。②`game.js:restoreSnapshot/getCheckpoints`で洞窟の旧SAVE2・3CP・死亡リトライ・討伐二重登録を回帰。③コードHEAD `0fda99d8` と記録HEADのPages run/jobsでbuild/deployを個別確認、障害なら復旧。
- **次20分枠**：①`game.js:huntWildPrey/steerPursuit`で2イタチ対2ネズミ・石柱回避を経時試験。②`game.js:scavengeWildFood/animalRemains`で摂食・横取り・骨化を連結。③`game.js:maintainLocalWildlife/retireFarCalmAnimal`で洞窟/山頂/市街の最終個体と密度を維持。
- **次40分枠**：①`webgl3d.js:mountainTerrain`の遠距離タイル描画・GPU負荷を測定しLOD/キャッシュ改善。②`fauna.js:draw2D`・`webgl3d.js:drawCommonAnimal3D`で夜間のイタチ/ネズミ/毒ヘビの視認性を実ブラウザで確認。③`gamepad.js:poll`・`game.js:move/restoreSnapshot`で縦横/洞窟往復/Pad復帰の実機QA。

## 共同スプリント・次担当｜2026/11/03 06:26:31 JST｜20分枠｜ACTIVE_SPRINT_ID=MOUNTAIN-CONTIGUOUS-FOOTHILL-V1｜洞窟複数捕食者の狩り分担・8地区と山岳の生態個体保護
- **開始HEAD→コードHEAD**：`ae6738f8daaa01474a736ea180dac6266a794be0` → `506e1c0d7dc76337c7eb5a02faad1d99d2788449`。変更：`neo-wild/game.js` commit `92722348ae2c341b2dab9106570acda21a2a54c5`、`neo-wild/index.html` cache rev commit `506e1c0d7dc76337c7eb5a02faad1d99d2788449`。対象外改変・強制push・旧全文上書きなし。
- **実際のゲームプレイ改善**：①`wildlifeHabitatKey/wildlifeHabitatCounts/retireFarCalmAnimal`で遠方の平穏な個体を入れ替える際、既存8地区と地続き山岳4zoneの最後の生存個体を保護。遠方の余剰個体から優先入替えし、動物ゼロ地域の連鎖発生を抑制。②`retireCalmCaveOverflow`で洞窟の獲物/捕食者の欠落補充が山頂側の最後の個体を消さない。③`huntWildPrey`で洞窟の捕食者が近い複数の獲物を分担して追跡。既存の最終標的座標を利用し、別種・市街・通常の視線/命中条件は変更しない。総76/近隣9/初期13/晴7雨5/9秒/群れ110秒とSAVE_SCHEMA2は不変。
- **動的・回帰QA**：実`mountain.js`地形・実`fauna.js`種・実`game.js:spawnMob/maintainLocalWildlife/retireFarCalmAnimal/retireCalmCaveOverflow/huntWildPrey`の抽出関数をV8隔離実行。晴/雨×LV1/6/11の6条件を各603秒（67回×9秒）経時模擬、世界76・近隣9・洞窟獲物と捕食者・石柱非衝突・山頂個体・8地区個体保護、2捕食者の別標的選択/射程外ダメージなし、JS全文構文など**47/47 PASS**。実`isValidSnapshot/getAutoSnapshot/getCheckpoints`で旧SAVE_SCHEMA2の標的座標保存・3CP・破損除外を**5/5 PASS**。これは隔離V8と模擬localStorageの試験であり、実ブラウザ10分プレイ・Android実機・実GPU・物理Pad・FPS・全40強敵技・死亡/リトライの実機E2Eは**未検証**。
- **Pages**：コードHEAD `506e1c0d` のrun **41528223603** は **build=success / deploy=success / report-build-status=success** を個別jobsで確認。今回ROADMAP記録コミット自身のPagesは次担当が確認。
- **進捗V2**：A16.0 / B12.0 / C9.0 / D4.0 / E8.0 / F9.0 / G8.0 / H4.0 / I4.0 = **74.0/100（前回74.0、差0.0）**。実機・ブラウザE2E未検証のため根拠のない加点なし。
- **次00分枠**：①`game.js:maintainLocalWildlife/retireFarCalmAnimal/retireCalmCaveOverflow`で地域間往復・洞窟捕食/食事・最後の個体保護を統合QA。②`game.js:restoreSnapshot/getCheckpoints/kill`で旧SAVE2・3CP・討伐二重登録・死亡リトライを実関数連結。③コードHEAD `506e1c0d` と記録HEADのPages build/deployを確認、進行不能があれば復旧。
- **次20分枠**：①`game.js:huntWildPrey/steerPursuit/caveWildlifePath`で動くネズミ2体とイタチ2体の追跡・石柱迂回・実命中を経時試験し破綻箇所を修正。②`game.js:scavengeWildFood/animalRemains`で捕食→死骸→摂食→骨化と別個体の横取りを連結。③`game.js:maintainLocalWildlife/spawnMob/retireFarCalmAnimal`で都市⇔山麓⇔山頂⇔洞窟の長時間巡回・全地区密度と保存復元を測定。
- **次40分枠**：①`fauna.js:draw2D`・`webgl3d.js:drawCommonAnimal3D`で洞窟の複数捕食者・ネズミの識別性/姿勢を調整。②`mountain.js:blocked/sightBlocked/draw2D`と`webgl3d.js:mountainTerrain`で洞窟柱の追跡/視界/3D描画一致を実画面QA。③`gamepad.js:poll`・`game.js:move/restoreSnapshot`で縦横・物理Pad・復帰・FPSの実機QA。

## 共同スプリント・次担当｜2026/11/03 06:01:06 JST｜00分枠｜ACTIVE_SPRINT_ID=MOUNTAIN-CONTIGUOUS-FOOTHILL-V1｜洞窟の獲物・捕食者の欠落と局所密度上限を統合修復
- **開始HEAD→コードHEAD**：`a435ba7cbdc305a56cc6fe3dec891cf838f62e15` → `9463cb818eef6fddec82094047c8fddbfa54cfae`。game.js commit `44224b292e8301716f86d3f23187ac6443ae611f`、index.html rev commit `9463cb818eef6fddec82094047c8fddbfa54cfae`。変更はneo-wild/のみ、旧版上書き・強制pushなし。
- **原因と実プレイ改善**：洞窟に獲物4体がいて捕食者0でも従来は強制捕食者を選ばず、山頂側の動物9体が700m局所上限を埋めると洞窟内が空でも補充不能だった。①洞窟で本当の獲物（ネズミ・ウサギ等）と捕食者を別々に数え、蛇1体だけを獲物と捕食者の両方として充足扱いしない。②洞窟に欠けている役割を最優先で出現させ、捕食者はイタチ/キツネ/タヌキから選ぶ。③局所上限9に達していたら、見えず警戒・攻撃・逃走していない普通の動物のみを1体入れ替え、強敵や画面内の動物を消さない。④洞窟内3体未満なら既存枠内で洞窟候補を優先。世界76/局所9/晴7雨5/9秒補充・群れ110秒・8地区/6探索地点・2橋・3石柱・旧SAVE_SCHEMA2/3CPは変更なし。出現は既存の洞窟地形・衝突・プレイヤー距離判定を通過する。
- **実関数/隔離QA**：旧実関数の再現で「獲物4・捕食者0→捕食者指定なし」「洞窟空・周辺9→補充なし」を確認。修正後の欠落役割/蛇のみ/周辺9/全個体可視保護/洞窟9獲物からの安全入替え等6シナリオPASS。さらに実`game.js:spawnMob/maintainLocalWildlife`と実`mountain.js:spawnCandidate/blocked/zone`を組み合わせた4シナリオ（獲物4→イタチ、周辺9→ネズミ、蛇のみ→ウサギ、世界76→上限維持）**4/4 PASS**。洞窟入口〜出口の6地点×獲物/捕食者の候補検査12条件すべて合法な出現候補あり。洞窟石柱の簡易経路モックを用いた1585組の経路候補検査で詰まりなし。game.js全文JS構文PASS。これらはV8/模擬DOM・地形実関数による隔離試験であり、実Android/実GPU/物理Pad/縦横ブラウザ/10分E2E/FPS/旧SAVE2実端末/強敵40技全再試験は未検証。
- **Pages**：コードHEAD `9463cb81` のrun **41524253665** は jobs **build=success / deploy=success / report-build-status=success** を個別確認。このROADMAP記録コミット自身のPages runは次担当が確認する。
- **進捗V2**：A16.0 / B12.0 / C9.0 / D4.0 / E8.0 / F9.0 / G8.0 / H4.0 / I4.0 = **74.0/100**（前回74.0、差0.0）。局所生態の改善は実機・長時間プレイ条件を満たさないため加点なし。
- **次20分枠**：①`game.js:maintainLocalWildlife/retireCalmCaveOverflow/spawnMob`で洞窟の晴雨・LV1/6/11・世界76/局所9・強敵/可視動物保護・群れ110秒を10分相当の経時実関数試験。②`game.js:huntWildPrey/steerPursuit/scavengeWildFood`で洞窟ネズミ→イタチ追跡→死骸→摂食、石柱越しの不正命中なしを連結。③`game.js:restoreSnapshot/getCheckpoints/isValidSnapshot`で旧SAVE2・3CP・洞窟復帰と出現上限を回帰。
- **次40分枠**：①`webgl3d.js:drawCommonAnimal3D`と`fauna.js:draw2D`で洞窟ネズミ・イタチ・蛇の夜間視認性/固有姿勢を改善。②`mountain.js:draw2D/blocked/sightBlocked`と`webgl3d.js:mountainTerrain`で洞窟両石門・3石柱・中央通路の2D/3D実景と遮蔽を比較。③`gamepad.js:poll`と`game.js:move/getAxes`で洞窟往復・縦横・Pad操作の実ブラウザQA、FPS/LODを測定可能なら記録。
- **次00分枠**：①ゲーム起動→洞窟往復→狩猟→死骸摂食→備蓄→死亡→リトライ→セーブの連続E2E。②`game.js:kill/recordTopScore/restoreSnapshot`でTOP5・二重討伐・旧CPを回帰。③最新HEADのPages run/jobs確認と重大障害修復。

## 共同スプリント・次担当｜2026/11/3 5:48:52 JST｜40分枠｜ACTIVE_SPRINT_ID=MOUNTAIN-CONTIGUOUS-FOOTHILL-V1｜洞窟の実景・ネズミ固有モデル・入口出口視認
- **コード開始HEAD→終了HEAD**：d10e155acb028810f5d0bbcf662af5ffa128eb99 → 81c8522c34387670ae9bd543f5e1dffe1dd0c18e。変更：neo-wild/fauna.js `96dd8ef5`、mountain.js `1912cafa`、webgl3d.js `5a6c5511`、index.html `81c8522c`。旧8地区/6探索地点/橋2本/洞窟石柱3本/20強敵40技/世界76近隣9/旧SAVE_SCHEMA2/3CPのルールは変更なし。
- **実プレイ変化**：①洞窟床の湿潤鉱脈筋8か所・壁の岩片12か所を同一決定的座標で2D/3Dに追加（衝突なし）。②洞窟の入口と出口の両方に2D/3D石門を表示。中央通路は地続きで通行可能。③ネズミに独自2D/3Dモデル（低い胴体・耳・ヒゲ・尾）と逃走/休息姿勢を追加。④近距離静的GPUメッシュとCanvas2D代替は維持。新規動物の増殖や保存スキーマ変更なし。
- **検証**：11テスト群PASS：syntax:mountain.js、syntax:webgl3d.js、syntax:fauna.js、38-point cave walk、pillars、nonblocking seams、mountain 2D draw、rat 2D flee/rest/normal、rat 3D flee/rest/normal、mountain 3D primitive integration、HTML cache rev。3Dはプリミティブモックであり実GPUではない。実Android/物理Pad/縦横実ブラウザ/10分E2E/FPS/旧SAVE2実機/全40強敵技は未検証。
- **Pages**：記録HEAD `f430efcd` のrun **41522653172** は **build=success / deploy=success / report-build-status=success** を個別ジョブで確認。コードHEAD `81c8522c` のrun 41522577259 は後続記録コミットとの競合でcancelled（コード内容は記録HEADへ継承し配信成功）。本記録追記コミット自身のPagesは別runで確認対象。
- **進捗V2**：A16.0/B12.0/C9.0/D4.0/E8.0/F9.0/G8.0/H4.0/I4.0=74.0/100（前回差0.0）。新描画のみで加点なし。
- **次00分枠**：①game.js:drawCreature/kill/restoreSnapshotで洞窟ネズミ討伐→死骸→図鑑/旧SAVE2復元を統合QA。②mountain.js:blocked/sightBlockedとgame.js:lineBlockedで両石門の通過/攻撃/視線を確認。③今回HEADのPages build/deploy個別確認、3CP/強敵40技/死亡復帰。
- **次20分枠**：①game.js:maintainLocalWildlife/spawnMobで洞窟11候補・ネズミ/イタチ密度の経時測定。②game.js:steerPursuit/huntWildPreyで動くネズミの石柱迂回・捕食/死骸。③mountain.js:spawnCandidateとgame.js:restoreSnapshotで洞窟出口/山頂の旧セーブ復帰。
- **次40分枠**：①webgl3d.js:mountainTerrainで実GPU/実ブラウザFPS・LODを測定。②webgl3d.js:drawCommonAnimal3Dとfauna.js:draw2Dで洞窟ネズミ/イタチ/ヘビの夜間視認性を改善。③gamepad.js:pollとgame.js:moveで洞窟両端・縦横・Pad操作の実機QA。

## 共同スプリント・次担当｜2026/11/3 5:26:33 JST｜20分枠｜ACTIVE_SPRINT_ID=MOUNTAIN-CONTIGUOUS-FOOTHILL-V1｜洞窟の捕食者・獲物・石柱迂回・死骸摂食の実動作連結
- **開始HEAD→コードHEAD**：`223f9588bbdbda892f80a4a469495a7e3377a079` → `2b06436da044172d201080141d79019dbf2f7e8d`。変更は `neo-wild/mountain.js` commit `8d0a6ede96b1a18bd61ef900e3149ddf3076c7f4`、`game.js` commit `e31e346661f85ca60810ddf56c916baa8f7052c4`、`index.html` commit `2b06436da044172d201080141d79019dbf2f7e8d`。元の山頂洞窟石柱3本/地続き座標/8地区/6探索地点/橋2本/巣6か所/20強敵/40技/BOSS-BALANCE-V2/旧SAVE_SCHEMA2/3CPを維持。
- **一連のプレイ改善**：①`MOUNTAIN.spawnCandidate`の洞窟候補を実床の11地点に分散し、プレイヤーから遠い側を優先。旧230座標の市街型出現距離を洞窟だけ捕食者105/獲物128に調整し、壁/石柱衝突と個体間99の離隔・視界外優先を保持。②`game.js:maintainLocalWildlife/spawnMob`で洞窟内の獲物0なら獲物、獲物がいて捕食者0ならイタチ/ヘビ/キツネ/タヌキを既存総枠内で補充。洞窟の獲物・捕食者優先補充は4匹未満で行い、世界76/近隣9を超えない（洞窟の絶対上限4ではない）。③`caveWildlifePath/steerPursuit`で石柱周りの洞窟中心通路を小規模可視経路として共有。行き止まりでA*全世界格子を連発せず、障害物を飛ばしたウェイポイント進行を防止。④`huntWildPrey`で洞窟の獲物を遮蔽物越しにも匂い追跡できるが、噛みつきは従来どおりLOS必須。石柱迂回→実攻撃→死骸→摂食まで既存AIと結合。新種・別ステージ・保存フィールド追加なし。
- **実関数動的QA**：洞窟内の遮蔽で直線通行不可な**258組すべて**で合法な経路を取得（258/258 PASS）。16組の実`steerPursuit`＋衝突移動シミュレーションで目的地到達16/16 PASS。洞窟入口/中心/奥のプレイヤー6座標で実`spawnMob/maintainLocalWildlife`を6回ずつ呼び、各々獲物1・捕食者1・床/石柱衝突0・個体間離隔・世界/近隣上限6/6 PASS。実`huntWildPrey/steerPursuit/move/scavengeWildFood`を本物のイタチ能力値で経時実行：石柱による初期LOS遮断→追跡→12.9秒でネズミ討伐→13.0秒で死骸摂食 PASS。旧SAVE_SCHEMA2の洞窟自動保存/3CP(4件中3件選択)/破損排除、空腹0後5秒HP90→78・食後停止、LV1/6/11ボス上限1/2/3、LV11ボスHPスケール PASS。現行indexの10 JS全文構文10/10 PASS。試験はV8隔離依存モック・実関数抽出であり実Android/実GPU/実物Pad/縦横実ブラウザ/10分E2E/FPS/実端末旧SAVE2/全40技の実戦QAは**未検証**。
- **Pages**：変更前のコードHEAD `0959c80d` run `41514999454` はbuild/deploy/reportすべてsuccessを再確認。**今回のコードHEAD `2b06436da044172d201080141d79019dbf2f7e8d` のPages run `41518916237` はbuild=success / deploy=success / report-build-status=successを個別jobsで確認、コード公開成功。** 記録HEAD `78afe562` のrun `41519231691` はbuild成功後の後続ジョブを確認中。次00分枠は最新HEADのPages結果を引き継ぐ。
- **進捗V2**：A16.0/B12.0/C9.0/D4.0/E8.0/F9.0/G8.0/H4.0/I4.0＝**74.0/100**（前回74.0、差0.0）。洞窟AIの経時模擬はC全体の4条件・実ブラウザE2Eを満たさず据置。未検証は加点なし。
- **次00分枠**：①`game.js:huntWildPrey/scavengeWildFood/kill`で洞窟の捕食→死骸→図鑑・討伐数非二重登録とプレイヤー狩りを結合。②`restoreSnapshot/repairRestoredMountainMobs/getCheckpoints`で旧SAVE2洞窟石柱復元・3CP/死亡/リトライを模擬・可能なら実ブラウザ確認。③今回HEADのPages run ID/build/deploy個別確認、ボス40技・入力・死亡/飢餓の回帰。
- **次20分枠**：①`mountain.js:spawnCandidate`と`game.js:spawnMob/maintainLocalWildlife`で洞窟中心・入口/出口の晴雨×長時間密度/世界76・近隣9を測定。②`caveWildlifePath/steerPursuit/huntWildPrey`で動く獲物・2体同時・石柱側道の追跡/捕食/帰還を経時QA。③`forageWildBerries/scavengeWildFood/restoreSnapshot`で草食→食料→死亡→旧SAVE2/3CP復帰を連結。
- **次40分枠**：①`mountain.js:draw2D/blocked/sightBlocked`と`webgl3d.js:mountainTerrain`で洞窟石柱の衝突・可視経路・湿潤床/草/LODを実ブラウザ縦横で比較。②`webgl3d.js:drawCommonAnimal3D/previewAnimal`で洞窟ネズミ・イタチ・ヘビの姿勢と暗所の識別性を改善。③`gamepad.js:poll`＋`game.js:move/steerPursuit`で洞窟復元後の物理Pad・カメラ/追跡・FPS実機QA。

## 00分枠・実地形追加QAとPages公開確認｜2026/11/03｜MOUNTAIN-CONTIGUOUS-FOOTHILL-V1
- コードHEAD `0959c80d33f9ae3378ad36eb27e9b0bea60a8aea` の Pages run **41514999454**：**build=success / deploy=success / report-build-status=success**（3ジョブ個別確認）。このROADMAP追記commitのrunは別途確認。
- 追加の実地形QA：現行`mountain.js`を実行して洞窟石柱3本の座標を取得、現行`game.js:repairRestoredMountainMobs`を実関数実行。**3/3本とも合法な洞窟床へ移動、衝突なし、同一zone、プレイヤー非重複、再実行時移動0**。隔離モックの16/16 PASSとは別に確認。実GPU・Android・物理Pad・10分E2E・実端末旧SAVE2は未検証。
- 進捗V2 **74/100（差0）**。次20分/40分枠は直前00分の修復を保持し、地形と捕食/描画の統合を継続。

## 共同スプリント・統合QA｜2026/11/3 4:59:09 JST｜00分枠｜ACTIVE_SPRINT_ID=MOUNTAIN-CONTIGUOUS-FOOTHILL-V1｜旧SAVE2山岳石柱復元・NPC安全再配置・カメラ整合
- **開始HEAD**：`b55603a00dcac844a29102bdc25d114de20a6a8a`。前20分枠の洞窟食物連鎖・前40分枠の洞窟石柱と2D/3D表現を維持。変更対象：`neo-wild/game.js`・`index.html`・`ROADMAP.md`のみ。
- **プレイ挙動**：旧SAVE_SCHEMA=2/3チェックポイントの洞窟石柱・山岳岩に重なった地上野生動物を同じ山岳zone内の合法座標へ再配置。プレイヤー/他動物との重なり、別zoneへのワープ、死体・水生ボス・飛行ボスの不適切な移動を防止。再配置時は移動速度・索敵・攻撃予兆を安全リセット。既存のプレイヤー建物隙間復旧を保持し、復旧位置へカメラを追従。自動保存が修復後位置を保持する。新規の種・湧き枠・SAVE_SCHEMAは追加しない。
- **動的QA**：実追加関数を実行し石柱内→合法な洞窟位置、同一zone、プレイヤー/他動物非重複、正常個体/水生/飛行/市街不変、個体数不変、速度/攻撃予兆リセット、二重実行冪等、JS全文構文、HTML rev、旧3CP保持 **16/16 PASS**（隔離モック）。Android実機、実GPU、物理Pad、縦横実ブラウザ、10分E2E/FPS、旧SAVE2実端末復元、強敵40技の全実戦検証は未実施。
- **進捗V2**：A16/B12/C9/D4/E8/F9/G8/H4/I4=**74/100**（前回74、差0）。実ブラウザE2E未検証のため据置。
- **Pages**：開始HEAD `b55603a00dcac844a29102bdc25d114de20a6a8a` のrun 41512642356はbuild/deploy/report-build-status全success。今回の新コードHEADはコミット後のrunで別途検証し、未確認なら公開済みと呼ばない。
- **次20分枠**：①`game.js:repairRestoredMountainMobs/restoreSnapshot`で旧SAVE2・3CPの洞窟入口/石柱/山腹を実関数経時QA。②`game.js:spawnMob/maintainLocalWildlife`で修復後の洞窟群れ・世界76/近隣9の密度維持と石柱回避。③`game.js:huntWildPrey/routeClear`で石柱を迂回する捕食・死骸・食料の一連を確認。
- **次40分枠**：①`mountain.js:blocked/sightBlocked/draw2D`で洞窟柱の見た目と当たり判定を実画面で照合。②`webgl3d.js:mountainTerrain`で洞窟石柱のLOD・GPU・FPSを実機測定。③`gamepad.js:poll`と`game.js:move/restoreSnapshot`で洞窟復帰後の縦横・Pad・カメラを検証。

## 40分枠 Pages公開確認｜2026/11/03｜MOUNTAIN-CONTIGUOUS-FOOTHILL-V1
- 洞窟石柱/湿潤床2D/3D・衝突・遮蔽・HTML revのコードcommit `b94a248819c30a90e996e8b70409e01a11294697` に対応する Pages run **41512405408**：**build=success / deploy=success / report-build-status=success**（各jobを個別確認）。ROADMAP記録commit自身の配信は別runとして確認する。Android実機/実GPU/物理Pad/10分E2Eは未検証。進捗V2 74.0/100（差0.0）。

## 共同スプリント・次担当｜2026/11/3 4:41:46 JST｜40分枠｜ACTIVE_SPRINT_ID=MOUNTAIN-CONTIGUOUS-FOOTHILL-V1｜洞窟の実衝突石柱・2D/3D景観一致
- **開始HEAD**：`27d0fd1768a6eb5335e89c6ed720d47909a69e05`。現行20分枠の洞窟食物連鎖とSAVE2互換を維持し、洞窟x=13040〜13450に実地形を追加。
- **変更**：`neo-wild/mountain.js` に決定的な洞窟石柱3本（x=13105/13210/13320、中心線から±72、r=17）を追加。`blocked`と`sightBlocked`へ同じ座標を結合。中央通路は幅を残してプレイヤー/獲物が通れる。Canvas2Dに石柱と湿った床の縞、`webgl3d.js:mountainTerrain`に石柱と床メッシュを追加。近距離だけ描画。HTMLの2スクリプトrev更新。世界76・近隣9・群れ制限・8地区/6探索地点・SAVE_SCHEMA2/3CP・強敵20種は不変更。
- **動的QA**：実`mountain.js`評価、中心線43地点の歩行/壁、石柱3本の衝突/視線、中央通視、Canvas2D描画、実`webgl3d.js:mountainTerrain`をプリミティブモックで描画・可視範囲制限、2ファイル全文構文 **104 assertions PASS**。実GPU/Android/物理Pad/縦横実ブラウザ/10分E2E/FPS・旧SAVE2実機・全40技は未検証。模擬描画は実GPUと区別。
- **配信**：コミット後のPages build/deployは別途確認。未成功なら公開済みと呼ばない。
- **進捗V2**：A16.0/B12.0/C9.0/D4.0/E8.0/F9.0/G8.0/H4.0/I4.0=**74.0/100**（前回74.0、差0.0）。実機E2E等の条件未達につき据置。
- **次00分枠**：①`game.js:move/collides/lineBlocked`で洞窟石柱の歩行迂回→戦闘予兆→狩猟→死骸を実関数で一連検証。②`game.js:restoreSnapshot/getCheckpoints`で旧SAVE2/3CPの洞窟内石柱重なりを検出し、必要時のみ安全位置へ復元。③HEAD対応Pagesのbuild/deploy両成功・ボス40技と入力回帰。
- **次20分枠**：①`mountain.js:spawnCandidate`・`game.js:spawnMob`で石柱/壁から安全距離の洞窟出現。②`game.js:routeClear/huntWildPrey/forageWildBerries`で石柱の回り込み・採食成功率を経時検証。③`game.js:restoreSnapshot/normalizeStrongBossSave`で洞窟SAVE2/3CP・LV6/11ボスを回帰。
- **次40分枠**：①`webgl3d.js:mountainTerrain`で石柱/床の実GPU可視性・洞窟LOD/FPSを測定。②`mountain.js:draw2D/blocked/sightBlocked`で石柱の表示と衝突・攻撃予兆の一致を縦横画面で検証。③`gamepad.js`・`game.js:move`で洞窟通路の物理Pad/カメラ・夜目を実機QA。

## 共同スプリント・次担当｜2026/11/03 04:29 JST｜20分枠｜ACTIVE_SPRINT_ID=MOUNTAIN-CONTIGUOUS-FOOTHILL-V1｜山頂洞窟の生存食物連鎖・安全な出現・SAVE2回帰
- **開始HEAD→コードHEAD**：`8540ef08d0ba47e4f957f4fd98aca4fefc4191a8` → `b83154b681f57db36655ee4381a8072623469a3e`。変更 `neo-wild/mountain.js` blob `a458eeb0`、`game.js` blob `9b45c038`、`index.html` blob `38c18004`。旧8地区/6探索地点/2橋/6巣/20強敵・40技/SAVE_SCHEMA2/3CPは保持。現行mainで00分枠の洞窟壁遮蔽を確認し同一スプリント継続。
- **実際のプレイ変化**：①山頂洞窟x=13040〜13450の**同一ワールド座標内**に、ネズミ/ウサギを獲物、イタチ/ヘビ/キツネ/タヌキを捕食者とする既存種の食物連鎖を配置（洞窟だけの生息比率変更、種数/世界76/近隣9は不変）。②`mountain.js:spawnCandidate`と`game.js:spawnMob/settleNewRegion/maintainLocalWildlife`を連結し、洞窟幅220の内側の歩行可能な床へ合法な距離で獲物を配置。周囲700mに山頂動物が2体いても洞窟が空なら初回に1体補充、以後9秒補充を維持。山麓・山腹・山頂でも道/橋沿いの合法位置を優先し、崖/岩への出現を抑制。③洞窟の可視下草を壁から内側のy±55へ移し、草食/サルの`forageWildBerries`から到達・採食できるようにした。プレイヤー用の地上食料も`spawnFood`で洞窟通路に配置でき、狩猟→死骸→食事と空腹生存が途切れにくい。既存の2D/3D草モデル・衝突・食料/図鑑/保存を共用し、新スキーマや別ステージは作らない。
- **動的QA**：実`mountain.js`をV8評価、中心線の連続歩行/標高/2橋/洞窟草/洞窟晴雨×100抽選、実`game.js:spawnMob/settleNewRegion/maintainLocalWildlife/forageWildBerries/huntWildPrey`を抽出実行して洞窟内の安全出現・密度上限・サル採食・ヘビ→ネズミ死亡→食べられる死骸の一連、JS全文構文 **544/544 assertions PASS**。実`isValidSnapshot/getAutoSnapshot/getCheckpoints/updateSurvivalNeeds/bossHealthTarget/strongBossLimit`をモック保存で旧SAVE2の都市/山腹/洞窟位置・3CP/破損CP排除・空腹0後のHP経時減少/食後停止・LV6で2体/LV11で3体・ボス耐久 **27/27 PASS**。計**571/571 assertions PASS**（抽選・歩行点を含み571種類の独立試験ではない）。**未検証**：Android実機、実GPU、物理Pad、縦横実ブラウザ、10分E2E/FPS、実端末旧セーブ、全強敵40技の動的再試験。
- **Pages**：コードHEAD `b83154b681f57db36655ee4381a8072623469a3e`、run **41510244060** はworkflow **success**、個別 **build=success / deploy=success / report-build-status=success** を確認。ROADMAP記録commitで別runが発生するため、そのrunは次枠で区別して確認。
- **進捗V2**：A16.0 / B12.0 / C9.0 / D4.0 / E8.0 / F9.0 / G8.0 / H4.0 / I4.0 = **74.0/100（前回74.0、差0.0）**。洞窟食物連鎖はC全条件の完了と実ブラウザ統合をまだ証明しないため据置。D/Eの種類別加点、H/Iの実機項目も水増しなし。
- **次00分枠**：①`game.js:spawnMob/settleNewRegion/maintainLocalWildlife`で市街→山腹→洞窟→帰還を模擬経時・可能なら実ブラウザ10分試験、全地区空白/76・9・7/5・9秒を監査。②`game.js:huntWildPrey/scavengeWildFood/kill/restoreSnapshot`で洞窟の捕食→死骸→食事→死亡/リトライ・旧SAVE2/3CPと二重登録を結合試験。③コードrun 41510244060と記録後HEADのPages build/deployを区別して確認し、ボス40技・洞窟遮蔽・Pad回帰。
- **次20分枠**：①`mountain.js:spawnCandidate/choose`と`game.js:spawnMob`で洞窟入口/中心/奥の長時間出現率、敵・獲物の距離/上限を調整。②`game.js:steerPursuit/huntWildPrey/forageWildBerries`で洞窟壁を回避したNPC捕食・草食・食料の到達率を経時測定しハマりだけ修正。③`game.js:restoreSnapshot/normalizeStrongBossSave`で山頂洞窟の旧SAVE2・3CP・ボスLV6/11再開を回帰。
- **次40分枠**：①`webgl3d.js:mountainTerrain`で洞窟の可視下草y±55と3D地形/照明の一致・LOD/FPSを検証。②`mountain.js:draw2D/blocked/sightBlocked`で洞窟壁・入口・草・ネズミ/ヘビの視認性/攻撃予兆を確認し表示ズレを修正。③`gamepad.js`・`game.js:move/collides`で洞窟通路のPad/縦横カメラ/引っ掛かり・夜間操作を実ブラウザ可能なら試験。

## 共同スプリント・統合QA｜2026/11/03 04:05 JST｜00分枠｜ACTIVE_SPRINT_ID=MOUNTAIN-CONTIGUOUS-FOOTHILL-V1｜山岳の遮蔽・戦闘・狩猟の統合
- 開始HEAD `6944317e13e0b6891b58bb5e678e7bd070a1074e`。変更 `neo-wild/mountain.js`, `game.js`, `index.html`, `ROADMAP.md`。8地区/6探索地点/2橋/山頂洞窟/20強敵/SAVE_SCHEMA2/3CP維持。
- 実装：`mountain.js:sightBlocked`を追加し山岳樹木・岩・廃墟小屋・洞窟壁を視線遮蔽に統合。川と渓谷は透明、洞窟の中心通路は通視可能。`game.js:lineBlocked`へ接続しNPCの索敵/捕食、プレイヤー攻撃、ボス40技の共通遮蔽判定、投石・食事判定に適用。岩や洞窟壁越しの不自然な攻撃・発見を防ぐ。
- 動的試験：実`mountain.js`を評価、実`game.js:lineBlocked`抽出実行、洞窟中心/両壁/入口/岩/樹木/都市/橋/歩行/連携、JS全文構文、1500回処理の **13/13 PASS**。1500回の隔離視線試験 39ms（実機FPSではない）。Android/GPU/物理Pad/10分E2E/全40技/旧SAVE実端末は未検証。
- 進捗V2 A16 B12 C9 D4 E8 F9 G8 H4 I4 = **74/100（前回74、差0）**。実機未検証につき据置。
- 次20分：①`game.js:spawnMob/settleNewRegion`で山頂洞窟の生息密度上限と空白を検査。②`huntWildPrey/forageWildBerries`で岩/洞窟壁を迂回する採食・捕食を回帰。③`restoreSnapshot/collides/move`で旧SAVE2/3CP山頂復元を試験。
- 次40分：①`webgl3d.js:mountainTerrain`/ `mountain.js:draw2D`で視線遮蔽と表示の整合。②`game.js:drawCreature`/ `webgl3d.js:drawCommonAnimal3D`で洞窟警告表示。③`gamepad.js`/縦横HUDで山頂・洞窟の入力とカメラを実機検証。
- 次00分：①開始→山頂→戦闘→食料→巣→死亡→再開のE2E。②強敵20種×2技とNPCの岩越し攻撃回帰。③最新Pages build/deployとSAVE2/3CP・TOP5・Padを確認。

## 共同スプリント・次担当｜2026/11/03 03:40 JST｜40分枠｜ACTIVE_SPRINT_ID=MOUNTAIN-CONTIGUOUS-FOOTHILL-V1｜地続き山頂登山道・歩行可能な洞窟・高山植生・2D/3D統合
- **開始HEAD→コードHEAD**：`4a09234d8724f206542751e1d6105d061580fddf` → `298b1cc1171474d9c5c16ccfd9a4fb0d63984a30`。変更は `neo-wild/mountain.js`、`webgl3d.js`、`game.js`、`index.html` の4件。既存山麓/山腹・旧木橋2本・8地区/6探索地点・20強敵・SAVE_SCHEMA=2/3CPを削除せず、HEAD一致確認後に原子的Git tree/commit、forceなしでmain反映。
- **プレイ可能な完成単位**：①山腹終端x=11800から山頂・洞窟x=13600まで**1,800座標単位**を旧座標系のまま延長。標高は境界で連続し、山頂側は約+190高くなる。②x=13040〜13450に山道からそのまま入れる**実通行可能な洞窟回廊**。入口アーチ、暗い床、左右の岩壁、壁衝突・岩障害をCanvas2D/WebGLで同じ中心線/幅に統合。ワープ/別ステージなし。③山頂の針葉樹・岩礫・草地を決定的配置し、岩/樹木は衝突、草は採食対象`forageSites`と表示を共用。④山頂動物は既存の総密度を増やさず、シカ/ウサギ/カラス/サル/チンパンジー等の比率のみ調整。⑤`game.js`の地域移動/旧セーブ復元/地図表示を`MOUNTAIN.zone`で山麓・山腹・山頂・洞窟に連動、`index.html`の3スクリプト?rev更新。
- **動的QA**：実`mountain.js`を評価、13地点の地続き道・標高/障害・旧2橋・洞窟内/壁・獲物抽選・実Canvas2D描画2,616呼出し・実`webgl3d.js:mountainTerrain`を描画プリミティブモックで379メッシュ（洞窟67）・JS全文構文など **64/64 assertions PASS**。さらに実`game.js:collides/move`を抽出実行し、山腹11800→洞窟13520→11800の往復866歩、洞窟壁の横移動阻止・保存位置の合法性など **867/867 assertions PASS**。合計 **931/931 PASS**。実Android、実GPU、物理Pad、縦390x844/横800x360・844x390のブラウザ矩形、FPS、10分E2E、旧SAVE2/3CP実端末復元、ボス40技全ケースは**未検証**。模擬GPUを実機と扱わない。
- **Pages**：コードHEAD `298b1cc1` の Pages run **41502580872** は03:40 JST確認時点 **in_progress（build in_progress / deploy未確認）**。build/deploy両successを確認するまで公開済みとは呼ばない。別run 41502584087 はIndexNow通知でありPages成功と混同しない。
- **進捗V2**：A16.0 / B12.0 / C9.0 / D4.0 / E8.0 / F9.0 / G8.0 / H4.0 / I4.0 = **74.0/100（前回74.0、差0.0）**。山頂機能はH/Iの実ブラウザ・実機検証条件未達、Cの季節/エリア条件の全体検証未完のため据置。
- **次00分枠**：①`game.js:move/collides/restoreSnapshot`で都市→旧2橋→山頂洞窟→戻る連続歩行と旧SAVE2/3CP、死亡/リトライを実ブラウザ可能なら10分試験。②`game.js:routeClear/spawnMob/settleNewRegion`で山頂のNPCが洞窟壁/岩を貫通しないか、空白地区・世界76/近隣9を経時検査。③HEAD `298b1cc1` のPages run 41502580872 のbuild/deployを別々に確認、失敗時はログから復旧。
- **次20分枠**：①`mountain.js:choose/forageSites`と`game.js:forageWildBerries/huntWildPrey`で高山の採食→追跡→死骸→食事の連続AIと洞窟の捕食者を実装・試験。②`game.js:spawnMob/maintainLocalWildlife/settleNewRegion`で山頂・洞窟の初期/移動時生態分布を密度上限内で調整。③`game.js:restoreSnapshot/normalizeStrongBossSave`でSAVE2/3CP、ボス20種・強敵2/3体の回帰。
- **次40分枠**：①`webgl3d.js:mountainTerrain`で洞窟奥の石柱/地形と高山の遠景LOD、3Dカメラ遮蔽を実機相当で改善。②`mountain.js:blocked/draw2D`で洞窟入口の通路幅・崖と岩の引っ掛かりを実ブラウザQA、見た目と当たり判定を補正。③`game.js:drawCreature`・`webgl3d.js:drawCommonAnimal3D`で高山サル/チンパンジー固有動作、洞窟戦闘予兆の視認性と横縦HUD/Padを検証。

## 共同スプリント・次担当｜2026/11/03 03:20 JST｜20分枠｜ACTIVE_SPRINT_ID=MOUNTAIN-CONTIGUOUS-FOOTHILL-V1｜山腹の可視採食・在来群れ・崖/橋迂回・旧セーブを結合
- **開始HEAD→コードHEAD**：`070b2018519877a09b0beab6f55b20e74e0ce5e2` → `0d6dbcd51858bde82c55461bd0f51e012088d5c8`。前00分枠のGamepad/死亡選択修正、前20分枠のチンパンジー/ニホンザルAI、前40分枠の山腹・第二橋・固有3Dモデルを保持。同一スプリント継続。変更：`neo-wild/mountain.js`（`3644a00a`）、`game.js`（`721487ee`・`8b9b78bf`）、`index.html`（`440d8509`・`0d6dbcd`）。他ゲーム・ブログ・SAVE_SCHEMA変更なし。
- **遊べる一連の改善**：①`mountain.js:choose`を山麓/山腹の実在動物分布に限定し、山地の獲物補充ではシカ/ウサギ/カラスだけを選ぶ（旧biome7の運河カエル/カバを排除）。晴/雨/雷雨でサル・チンパンジー/鳥・草食の出現**比率のみ**変更。世界76・近隣9・初期13・晴7雨5・9秒補充は据置。②2D/3Dで既に表示される山のシダ・下草を`MOUNTAIN.forageSites`として共有し、`game.js:forageWildBerries`からニホンザル/チンパンジー/シカ/イノシシが実際に接近→採食→空腹欲求低下。崖/木/岩・橋を無視した採食地点は選ばない。③`game.js:spawnLocalPack`で山の群れを在来種（キツネ/タヌキ/イタチ/ニホンザル/山腹チンパンジー）に限定。チンパンジー同種の群れを敵と誤認して採食不能になる不具合を修正。群れ110秒・6%/12%・近所1組・LV8以上3体は維持。④`game.js:routeClear`が山地だけ22座標間隔で`MOUNTAIN.blocked`を調べ、谷/木/岩を直線で抜けるNPC経路を防止。2本の木橋は通行可。⑤山麓→山腹の境界で住民がほぼゼロなら既存上限内で1体だけ補充、同区間で反復補充しない。旧SAVE2再開時の境界判定も整合。
- **動的QA**：実`mountain.js`をV8で実行して晴雨×山麓/山腹×100抽選=600件の獲物選択、山道6座標/可視下草、旧橋/新橋の開放と谷の遮断、実`game.js:routeClear/forageWildBerries/spawnMob`を抽出実行し草食4種の接近→採食・山地の獲物15回を含む**637/637 assertions PASS**。さらに`nearbyVisibleWildPredator/settleNewRegion/isValidSnapshot/getAutoSnapshot/getCheckpoints`の旧SAVE2/3CP/境界/同種採食 **15/15 PASS**、実`spawnLocalPack`でLV1/2/6/8/11・群れ頭数/在来種/再発生防止 **23/23 PASS**、実`kill/updateSurvivalNeeds`で討伐二重登録防止/空腹0の経時HP減少と食後停止 **7/7 PASS**。関連JS全文構文 **9/9 PASS**。合計**682/682 assertions PASS**（600件は抽選分布の反復検証であり682種類の独立テストではない）。**未検証**：実Android・実GPU/WebGL・物理Pad・縦横実ブラウザ・10分E2E/FPS・旧SAVE2/3CP実端末復帰、長時間生態/強敵40技全ケース。
- **Pages**：コードHEAD `0d6dbcd51858bde82c55461bd0f51e012088d5c8`、run **41500744935** はworkflow=success、個別jobs **build=success / deploy=success / report-build-status=success** を確認。ROADMAP記録commitで新runが発生する場合はそのHEADとrunを別途確認する。
- **進捗V2**：A16.0 / B12.0 / C9.0 / D4.0 / E8.0 / F9.0 / G8.0 / H4.0 / I4.0 = **74.0/100**（前回74.0、差0.0）。生態改善はCの新たな独立満点条件をすべて検証したわけではなく、実機/長時間未検証のため加点なし。既存D/Eの強敵別要件とIの実機項目も据置。
- **次00分枠**：①`game.js:spawnMob/settleNewRegion/restoreSnapshot`で山麓→山腹の移動・セーブ→復帰・3CPと各地域の空白/上限を10分以上の実ブラウザまたは実関数経時QA。②`game.js:forageWildBerries/huntWildPrey/kill`でサル/チンパンジー群れ→採食→小動物狩り→死骸→食事・図鑑を連続試験。③`game.js:routeClear/move`で2橋と谷沿いのNPC迂回・ハマり・雨天移動を検証、問題だけ最小修正。
- **次20分枠**：①`mountain.js:choose/forageSites`・`game.js:spawnMob/maintainLocalWildlife`で晴/雨/LV1・6・8・11/全地区/山地の分布と76・9・7/5上限を経時試験。②`game.js:spawnLocalPack/updateChimpanzee/updateMacaque`で110秒/近所1組/同種採食・投石/道具AIを実関数E2E。③`game.js:restoreSnapshot/kill/updateSurvivalNeeds`で旧SAVE2/3CP・強敵20種・二重討伐/死亡を回帰。
- **次40分枠**：①`mountain.js:height/blocked/draw2D`に山腹→山頂・洞窟入口の地続き実歩行区間を実衝突・植生・見える岩道込みで追加。②`webgl3d.js:mountainTerrain/drawCommonAnimal3D`でLOD/樹上/道具/洞窟を同一地形座標で描画し実GPUを可能なら確認。③`game.js:collides/move/routeClear`で新山道/旧2橋・セーブ・縦横・Gamepadを回帰。既存8地区/6探索地点とボスBOSS-BALANCE-V2を維持。

## 共同スプリント・次担当｜2026/11/03 03:00 JST｜00分枠｜ACTIVE_SPRINT_ID=MOUNTAIN-CONTIGUOUS-FOOTHILL-V1｜ゲームパッド入力・死亡選択・備蓄UIの横断修復
- **開始HEAD→コードHEAD**：`b400c5929d00b605ac2a304d7b27146039279104` → `858989a8a15c75aaf2729bb5ebece1cf8b77222b`。前20分枠のチンパンジー道具AI・山腹出現と前40分枠の動物描画を保持。対象はneo-wild/gamepad.js、game.js、index.html、ROADMAP.mdのみ。mainへHEAD条件付き差分を反映、強制pushなし。
- **プレイ挙動の変更**：①十字キーの逆入力をスティックの同軸入力より優先し、同時押しの相殺による停止を回避。斜め移動は長さ1以内に正規化。②ゲーム側getAxesでも有効なパッド入力をキーボード/タッチとの相殺より優先し、向きと速度が当該フレームで変わる。③死亡結果画面でBを押しても「最初から」を即実行せず、そのボタンへフォーカスするだけに変更。Aで明示決定。STARTでは死亡後の記録を勝手に捨てたりリトライしない。④食料庫でSTARTを押しても選択中の肉/食草を誤消費せず閉じる。ガイドでSTARTは閉じる。⑤index.htmlのgame.js/gamepad.jsの?revを更新。SAVE_SCHEMA=2・3CP・生態密度・強敵40技は変更しない。
- **動的QA**：実gamepad.jsを模擬DOM/標準Gamepadで実行し、十字左とスティック右の同時入力、死亡Bで即リセットしない・Aで明示決定、死亡START無動作、食料庫STARTで閉じる（食事しない）、ガイドSTARTで閉じる **6/6 PASS**。実game.js:getAxesを抽出しパッドvs逆キーボード・逆タッチ・パッド中立時キーボード・斜め入力 **4/4 PASS**。gamepad.js/game.js全文構文PASS。加えて実game.jsの`recordTopScore/loadTopScores/scoreRunIdFromSnapshot/isValidSnapshot/getCheckpoints/getAutoSnapshot`を抽出動的実行し、初回記録・同一挑戦の低得点重複防止・高得点更新・無効な死亡CP除外・旧SAVE2の試行ID安定・旧SAVE2自動保存復元 **6/6 PASS**。Android実機・物理Pad・GPU/縦横ブラウザ・10分E2E・実端末旧SAVE復元は未検証。チンパンジー/強敵40技・長時間の密度全動的再試験は今回未実施。
- **Pages**：コードHEAD `858989a8a15c75aaf2729bb5ebece1cf8b77222b` のrun **41496545661** はworkflow=success、個別jobs **build=success / deploy=success / report-build-status=success** を確認。このROADMAP結果追記commitで新runが発生する場合、その最新HEAD/runは次20分枠が確認。
- **進捗V2**：A16.0 / B12.0 / C9.0 / D4.0 / E8.0 / F9.0 / G8.0 / H4.0 / I4.0 = **74.0/100**（前回74.0、差0.0）。実機条件未達のため加点しない。
- **次20分枠**：①`game.js:spawnMob/maintainLocalWildlife/spawnLocalPack`と`mountain.js:choose`で山腹晴雨/LV1・6・8・11/世界76・近隣9/群れ110秒の実関数経時試験。②`game.js:updateChimpanzee/huntWildPrey/forageWildBerries/scavengeWildFood`で群れ→道具→採食・捕食を実関数回帰。③`game.js:restoreSnapshot/isValidSnapshot/kill`で旧SAVE2・3CP・死亡・図鑑二重登録を回帰。
- **次40分枠**：①`mountain.js:height/blocked/draw2D`・`webgl3d.js:mountainTerrain`で山腹→山頂/洞窟の実歩行区間とLODを追加。②`webgl3d.js:drawCommonAnimal3D/previewAnimal`と`game.js:drawCreature`でサル/チンパンジーの投石・枝・樹上姿勢を実描画QA。③`gamepad.js:poll`と`game.js:getAxes/collides/restoreSnapshot`で横縦・Padの同時入力と山地移動を回帰し、実機未検証は明記。

## 共同スプリント・次担当｜2026/11/03 02:20 JST｜20分枠｜ACTIVE_SPRINT_ID=MOUNTAIN-CONTIGUOUS-FOOTHILL-V1｜チンパンジー道具戦闘・樹上/群れ/食物連鎖と投石衝突修復
- **開始HEAD→コードHEAD**：`67ddabaf39aa8b9cb958324a49220ec58b30d313` → `b1747d6913e4cde7f06ba40ef5dfe0ff6ef09318`。現行main、前00/20/40分のROADMAP先頭、Google Drive「完成仕様設計書」末尾を確認し同じスプリントを継続。変更は `neo-wild/fauna.js` (`bb69c541`)、`mountain.js` (`c2ded839`・`a1982eb7`)、`bestiary.js` (`70efac9b`)、`game.js` (`77b6d9b2`・`49e4a04b`・`ecaafa71`)、`webgl3d.js` (`83d95666`)、`index.html` (`3e49616d`・`5e3c95e5`・`b1747d69`)。強制push/旧全文上書きなし。
- **実プレイの一連の改善**：①山腹（x>10100）で既存100%出現重みを再配分し、チンパンジー12%を追加。世界76/近隣9・晴7雨5・初期13・9秒・群れ6%/12%/110秒は不変、旧市街と山麓前半は出現ゼロ。②`updateChimpanzee`が群れ330m警報→木へ歩いて登攀/降下→道具の石を0.76秒予告して実飛翔/衝突、近距離は枝の一撃を0.52秒予告して回避可能にする。樹上から投げた石は発射元の木だけを無視し、別の木・岩・壁・谷は6座標間隔で遮断する。ニホンザルにも同じ投石の発射元修正を適用。③平時の採食→小動物狩猟→死骸/採食→飲水を既存AIに連結し、討伐→食料66/DNA6→図鑑永続カウントを一度だけ登録。旧SAVE_SCHEMA=2・3CPは維持し、再開時は途中の予兆・投石・樹上高さを安全リセット。④専用Canvas2DとWebGL3Dの長い腕・顔・道具持ちモデル、同一座標の投石予兆/飛石を追加。3D図鑑は既存previewAnimal経路を使用。
- **追加の実プレイ挙動**：群れ警報を受けたニホンザル/チンパンジーが見えないプレイヤーの最終目撃地点へ実移動するよう修正。樹上/投石/枝攻撃は従来の予兆を維持。`game.js:updateMacaque/updateChimpanzee`の実関数で両種が約20.6座標前進し、警戒時間が自然減衰することをPASS。
- **追加の実関数QA**：`spawnMob`で山腹チンパンジー実出現・市街/山麓前半拒否・既存世界76上限・ニホンザル互換 **8/8 PASS**。`move`の実関数で都市東端→旧橋→第二橋→山腹末端→往復、各840歩（計1680歩）、スタック0 PASS。最初の旧SAVE2/3CP試験はハーネス定数不足で失敗したが定数を補い再試験3/3 PASS。実機検証とは区別する。
- **動的QA**：実ソース関数による最終 **204/204 PASS**（山麓→山腹の通行座標・標高170条件、2本の橋/谷衝突、山腹出現比率、旧密度/ボス上限、石の手前/奥遮蔽・樹上発射、チンパンジー群れ警報→予兆→飛石命中→枝近接、採食呼出し、旧SAVE2/3CP、kill×2→死骸1/図鑑1/DNA6、固有2D/3D描画の有限座標、関連JS構文）。模擬DOM/モックGPUと実関数の隔離試験であり、Android実機・GPU実描画・物理Pad・10分ブラウザE2E/FPS・実端末旧セーブ復元は **未検証**。ボス40技の全動的再試験は未実施（定義/上限の回帰のみ）。
- **Pages**：コードHEAD `b1747d6913e4cde7f06ba40ef5dfe0ff6ef09318` と前回ROADMAPを含むHEAD `fa5c2b045042d07686f0b34d29d7f16ff8d5c45f` の Pages run `41490466204` は **build=success / deploy=success / report-build-status=success、workflow全体success**（個別jobs確認）。この記録更新でHEAD/runは変わるため、次00分枠が最新runも確認。
- **進捗V2**：A16.0 / B12.0 / C9.0 / D4.0 / E8.0 / F9.0 / G8.0 / H4.0 / I4.0 = **74.0/100**（前回74.0、差0.0）。通常種チンパンジーはD/E強敵条件を満たさず、模擬描画はH/I実機条件に加点しない。旧固定71点は採用しない。
- **次00分枠**：①`game.js:updateChimpanzee/traceMacaqueStone`を実ブラウザまたは隔離経時試験で晴/雨・樹上/地上・枝/石・遮蔽/回避/死亡/リトライまで通し、無敵重複/発射位置を修正。②`game.js:restoreSnapshot/getCheckpoints/kill`で旧SAVE2・3CP・図鑑二重登録と死亡遷移を実関数回帰。③当該HEADおよび最新ROADMAP HEADのPages jobs build/deployを個別確認し、失敗なら復旧。
- **次20分枠**：①`game.js:spawnMob/maintainLocalWildlife/spawnLocalPack`と`mountain.js:choose`で山腹晴雨・LV1/6/8/11・全域密度/空白・近所1群の実関数経時QA。②`game.js:updateChimpanzee/huntWildPrey/forageWildBerries/scavengeWildFood`で警戒解除→実採食→獲物追跡/死骸→捕食の動的連鎖を強化。③`game.js:move/collides/restoreSnapshot`で2橋往復・木/崖スタック・旧保存座標復帰を検証し問題のみ修復。
- **次40分枠**：①`mountain.js:height/blocked/draw2D`・`webgl3d.js:mountainTerrain`で山腹→山頂/洞窟の地続き歩行区間を実衝突/景観/近距離LOD込みで追加。②`webgl3d.js:drawCommonAnimal3D/previewAnimal`でチンパンジー/ニホンザルの木登り・枝・石の実GPU/2D描画・カメラを検証。③`gamepad.js:poll`・`game.js:collides`・縦横HUD/mini-mapで山岳歩行・Pad実操作・旧SAVEを回帰。

## 共同スプリント・次担当｜2026/11/03 02:03 JST｜00分枠｜ACTIVE_SPRINT_ID=MOUNTAIN-CONTIGUOUS-FOOTHILL-V1｜ニホンザル投石の遮蔽・命中・警告方向の統合修復
- **開始HEAD→コードHEAD**：`69a6c508e86c129b0c0a1862751cd81dfbfc603a` → `e23b06d63dca1025e45ec118d7d35e9028c85596`。前40分枠のニホンザル固有3D/Canvas2D投石予兆と20分枠の投石AI・保存、Google Drive完成仕様を照合し、既存実装を保持。変更は`neo-wild/game.js`・`neo-wild/index.html`のみ、mainへの非強制差分コミット、game.jsの?rev更新。
- **実際に変わる挙動**：①従来は石が1フレームで障害物の向こうまで移動すると終点だけで衝突判定し、壁をすり抜けたりプレイヤー手前の着弾が消える問題があった。実`traceMacaqueStone`を追加し、最大6座標単位ごとに山地・建物・世界境界を走査して遮蔽物で止める。②同一フレーム内でプレイヤーが壁より前なら命中、壁より後なら遮断とし、終点側の障害物や投石寿命切れが手前の正当な命中を消さないよう改善。③投石予兆の向きがちょうど0ラジアンでも真のロック方向を保持（旧`||`による再照準を撤廃）。既存の投石速度395、予兆0.65秒、石3D/2D、ダメージ/無敵、動物数・強敵40技・SAVE_SCHEMA2/3CPは維持。
- **QA**：実`game.js`全文JavaScript構文PASS。実`traceMacaqueStone`の開放/手前障害/奥障害/寿命終端/非命中5ケースPASS。実`updateMacaque`抽出動的統合で開放・山地障害前後・建物遮蔽前後の5ケースPASS。実`recordTopScore/loadTopScores/scoreRunIdFromSnapshot`で同じ挑戦の重複防止・記録更新・旧SAVEのID決定性PASS。**Android実機・実GPU・物理Pad・縦横実ブラウザ・10分E2E/FPS・旧SAVE2/3CP実端末復元は未検証**。統合試験は模擬DOM/依存関数の隔離実行であり実機検証ではない。
- **Pages**：HTMLコードHEAD `e23b06d63dca1025e45ec118d7d35e9028c85596` のrun `41487266217` は確認時点 **in_progress**（build in_progress、deploy未確認）。このROADMAP更新後の最新HEAD/runについて00分枠または次20分枠が個別jobsを確認する。未確認を成功と記載しない。
- **進捗V2**：A16.0 / B12.0 / C9.0 / D4.0 / E8.0 / F9.0 / G8.0 / H4.0 / I4.0 = **74.0/100**（前回74.0、差0.0）。模擬投石の修復で実機・強敵・完成条件の未達を加点しない。
- **次20分枠**：①`game.js:updateMacaque/traceMacaqueStone`で投石中のセーブ再開・樹上からの投石・群れ警報→石衝突を経時E2E、障害物や木の発射起点で石が即消える場合は修正。②`game.js:spawnMob/maintainLocalWildlife`と`fauna.js:choose`で山麓/山腹の晴雨・LV1/6/8/11・世界76/近隣9/群れ110秒の実関数試験。③`game.js:restoreSnapshot/isValidSnapshot`と`bestiary.js:recordKill`で旧SAVE2/3CP・討伐二重計上・死亡後復帰を統合回帰。
- **次40分枠**：①`mountain.js:height/blocked/draw2D`と`webgl3d.js:mountainTerrain`で山腹→山頂/洞窟入口を実歩行できる連続区間として拡張。②`webgl3d.js:drawCommonAnimal3D`と`game.js:drawCreature`で樹上・投石の同一座標、警告・飛石/遮蔽の描画を検証。③`gamepad.js:poll`・`game.js:collides/restoreSnapshot`・`index.html`で横縦HUD/物理Pad/旧SAVEの実ブラウザQAを試み、未検証ならそのまま記録。

## 共同スプリント・次担当｜2026/11/03 01:45 JST｜40分枠｜ACTIVE_SPRINT_ID=MOUNTAIN-CONTIGUOUS-FOOTHILL-V1｜ニホンザル固有3Dと投石の2D/3D予兆・弾体表示
- **開始HEAD→コードHEAD**：`35b5dddc9e3cd9bec25cd02848a5667a5d304dc7` → `826dabf79f607383a6eb4ca3b1c95b6b2565a86c`。20分枠のニホンザル生息/AI/図鑑/旧SAVE2と00分枠のパッド復旧を最新main/ROADMAPで照合し、既存挙動を重複実装しなかった。変更は`neo-wild/webgl3d.js`・`neo-wild/game.js`・`neo-wild/index.html`、rev更新、非強制コミット。
- **実プレイで変わること**：①汎用四足モデルに落ちていたニホンザルを、桃色の顔・耳・手足・短い尾・樹上高さに連動する専用WebGL3Dモデルへ置換。②投石予兆中の挙手と手の石、発射後の石を動的3Dメッシュ化。③実AIの`macaqueAim`・`macaqueTell`・`macaqueStone`を使い、Canvas2Dの点線と3Dの地面上の点線/石を同じ世界座標で描く。既存の命中・投石速度395・寿命0.95秒・0.65秒予兆・図鑑プレビューは既存経路を再利用。山岳幅11800・既存橋2本・密度初期13/総76/周辺9/晴7雨5/9秒・群れ6%/12%/110秒、強敵40技、SAVE_SCHEMA2/3CPは変更なし。
- **動的QA**：変更`game.js`・`webgl3d.js`全文JavaScript構文PASS。実`drawCommonAnimal3D`を抽出実行し、ニホンザル通常23メッシュ・樹上/投石予兆24メッシュ・投石後23メッシュ、既存シカ17メッシュ、他の汎用犬は従来描画へフォールバックPASS。実2D予兆コードを模擬Canvasで実行し、狙い方向の375.25世界座標長と点線設定PASS。実3D動的描画コードを実行し、予兆6・飛石/影2メッシュ、飛石の世界座標がAI位置と一致PASS。非有限座標0。**Android実機、実GPU/WebGL描画、実ブラウザ縦390×844/横800×360・844×390、物理Pad、10分E2E/FPS、旧セーブ端末復帰は未検証**。模擬描画を実機PASSとしない。
- **Pages**：コードHEAD `826dabf79f607383a6eb4ca3b1c95b6b2565a86c` のrun `41484340908`、個別jobs `build=success` / `deploy=success` / `report-build-status=success`。ROADMAP記録commitのrunは別途確認。
- **進捗V2**：A16.0 / B12.0 / C9.0 / D4.0 / E8.0 / F9.0 / G8.0 / H4.0 / I4.0 = **74.0/100**（前回74.0、差0.0）。ニホンザルは通常種でありD/Eの強敵・継承完成条件では加点不可。実GPU/実機未検証でH/I加点なし。
- **次00分枠**：①`game.js:updateMacaque`の予兆0.65秒→実投射→衝突/回避/HP・死亡/再開を実関数E2Eで試験。②`webgl3d.js:render/previewAnimal`と`game.js:drawCreature`のニホンザル姿・樹上高さ・投石予兆を縦横/Canvas2Dと実ブラウザで検査。③`game.js:restoreSnapshot`・強敵40技・密度/群れ・3CP・Pages最新HEADのbuild/deployを回帰。
- **次20分枠**：①`game.js:updateMacaque`の樹木への接近/昇降・警報/群れ・石の遮蔽物回避を実関数経時試験。②`mountain.js:blocked/choose`と`game.js:spawnMob/maintainLocalWildlife`で山腹の空白/過密/橋通行を検証。③次のチンパンジー実装は生息→道具→反撃→死骸/図鑑/保存まで縦に接続。
- **次40分枠**：①`mountain.js:height/blocked/draw2D`と`webgl3d.js:mountainTerrain`で山腹から地続きの山頂道と歩いて入れる洞窟入口（実衝突・草木・岩/カメラ）を一体実装。②`webgl3d.js:drawCommonAnimal3D`のニホンザルの樹上/投石を実GPU・2D・図鑑で検証し、表示負荷を測定。③`game.js:regionAt/collides`・`gamepad.js:poll`・縦横HUDの新山頂移動/旧SAVE2を回帰し、問題のみ修復。

## 共同スプリント・次担当｜2026/11/3 1:28:18 JST｜20分枠｜ACTIVE_SPRINT_ID=MOUNTAIN-CONTIGUOUS-FOOTHILL-V1｜ニホンザルの樹上・投石・採食・群れ・図鑑連結
- **開始HEAD→終了コードHEAD**：bd1b112c43bf04306b17e157bd7539388720c625 → e5f60160da5639d20fd8ceb9233b11848e849e3c。既存山麓→山腹・2本の木橋、8地区/6探索地点、山岳WORLD=11800、SAVE_SCHEMA2を維持。今回の差分はneo-wild/fauna.js、mountain.js、game.js、bestiary.js、index.html。既存00/40分枠の地形とパッドを変更せず同じスプリントを継続。
- **実プレイ変化**：①山麓・山腹の既存動物総数を増やさず、シカ/ウサギ等の出現比率を再配分してニホンザルを追加（山麓12%、山腹14%）。旧都市の通常抽選重みは0。②実game.js:updateMacaqueで視認警戒→周囲260以内の仲間へ警報→既存樹木への移動・昇降（地形衝突/接地高）→0.65秒の「石を構えた」予兆→物理座標で進む投石・遮蔽物/無敵/被弾を接続。木上は近接攻撃の高度判定に従い、時間経過/近接/負傷で降下。③通常の野生動物の採食・小動物狩猟・死骸を既存NPC系に接続。既存packChanceEarly=.06/Late=.12、110秒/近所1組・LV8以上2体を再利用し山地のみ群れ抽選。④fauna.js固有2D姿、図鑑「ニホンザル」討伐永続記録、既存kill一回性・食料38/DNA4、旧SAVE_SCHEMA2のmobsに状態を保存、再開時は途中投石を消して安全に復元。HTMLの4件?revを更新。3D専用モデルは未完で40分枠担当（現状汎用描画）につき完成としない。
- **動的QA**：実mountain.jsの橋2か所・樹木47/針葉樹43・分布、fauna.jsの2D描画、実game.js:updateMacaqueの予兆→投射→命中HP110→100・仲間警報・登攀・採食経路、実bestiary.jsのconfigure→recordKill×2→localStorageカウント2、実game.js:kill×2→図鑑1/死骸1/XP4の二重防止、JS4ファイル全文構文PASS。関数/模擬Canvasの結合テスト21/21 PASS＋図鑑/kill個別2 PASS。実Android/実GPU/WebGL専用ニホンザル姿・物理Pad・10分ブラウザE2E・3CP実機復元・実FPSは**未検証**。旧セーブのスキーマ不変はソース確認であり実端末E2Eではない。
- **Pages**：本記録直前のコードHEAD 57854626bf8e303a72437a3a621cf1737d22725f。Pages run 41482003493（コードとROADMAPを含むHEAD 9c049efd）は build=success / deploy=success / report-build-status=success（個別jobs確認）。本ROADMAP追記によりHEADとrunが更新されるため、次回は最新runのbuild/deploy両jobを確認。
- **進捗V2**：A16.0 / B12.0 / C9.0 / D4.0 / E8.0 / F9.0 / G8.0 / H4.0 / I4.0 = **74.0/100**（前回74.0、差0.0）。山岳サルの実装だけではDの強敵20種やH/Iの実機E2Eを満たさず加点なし。
- **次00分枠**：①game.js:spawnLocalPack/maintainLocalWildlifeとfauna.js:chooseで山林LV1/6/8/11・雨晴・群れ6%/12%・世界76/近隣9・巣265m抑制の実関数経時試験。②game.js:restoreSnapshot/normalizeStrongBossSave/killでニホンザル投石中SAVE_SCHEMA2/3CP・討伐二重防止・ボス40技とLV6=2/LV11=3を統合回帰。③Pages最新HEADのrun/jobsをbuild/deploy個別確認し、未公開なら復旧。
- **次20分枠**：①game.js:updateMacaqueの実採食/小動物狩猟→死骸→プレイヤー食事/運搬の経時E2Eと群れ追従を追加QA。②mountain.js:blocked/chooseとgame.js:move/spawnMobで都市→橋1→橋2→山腹のNPC/プレイヤー連続通行・旧SAVE2復帰・崖スタックを実関数試験。③既存密度の地域偏在を補充経時試験で調整し、空白地帯を解消。
- **次40分枠**：①webgl3d.js:drawCommonAnimal3Dにニホンザル専用3Dの顔/四肢/短尾・投石モーション・m.evadeHeightによる樹上表示・飛石メッシュを追加。②game.js:drawCreature/2DとWebGLで樹上/予兆/着弾の同じ座標・カメラ・近距離LODを比較。③mountain.js:height/blockedとwebgl3d.js:mountainTerrainで山頂・洞窟入口の地続き次区間、崖衝突/セーブを完成。実機不可は未検証と明記。

## 共同スプリント・次担当｜2026/11/03 01:04 JST｜00分枠｜ACTIVE_SPRINT_ID=MOUNTAIN-CONTIGUOUS-FOOTHILL-V1｜ゲームパッドのタイトル画面フォーカス復旧
- **開始HEAD→コードHEAD**：`9915c54b1a5a19f930d83649daa542c11eca86ae` → `8736fe25db67021b2db1b9e404ba318fe6533ffb`。現行main/前40分枠の山腹・第二橋・針葉樹・ROADMAPとDrive完成仕様を確認。同一スプリントを継続。変更は`neo-wild/gamepad.js`・`neo-wild/index.html`のみ、他ゲーム/ブログ変更なし。強制pushなし。ROADMAP記録commitは後続。
- **実不具合再現と修正**：タイトル画面でゲームパッド選択中のボタンが別操作・タッチで非表示になると、`gamepad.js:poll`の`focused`が非表示の古い要素を保持し、次のパッド操作まで選択枠が復旧しない。現行コードをモックDOM/標準Gamepadで実行し、初回`continue-btn`選択→ボタン非表示→次のpollでも`continue-btn`のままというFAILを再現。各pollで`items(mode)`にフォーカス要素が残っているか確認し、消えていれば可視候補へ自動復帰して十字キー移動を継続する。選択・キャンセル・他モードを変更せず、保存schema/密度/山岳・戦闘は不変。`index.html`のgamepad.js revを`20261103-pad-focus-recovery-v1`へ更新。
- **実関数QA**：変更前の同じモックテストFAIL、変更後は最初`continue-btn`→非表示後`start-btn`へ自動復旧PASS。更新JSのFunction構文解析PASS。これは**モックDOM/標準Pad状態による関数試験**であり実ブラウザ・Android・物理Pad・GPU・10分E2Eは**未検証**。既存山腹の前40分枠の地形986条件/衝突193条件PASSは前回の記録であり、今回再実施したとはしない。
- **Pages**：ゲームパッド実装commit `25113ea6267c9e972932334b254580d7950e5703`、HTML rev commit `8736fe25db67021b2db1b9e404ba318fe6533ffb`。最新HTMLのPages run `41477782219` は01:04 JST時点 **pending**、前段run `41477719018` は **in_progress**。**build/deploy successは未確認**。次枠で最新HEADのrun/jobsを確認し、成功まで追跡する。
- **進捗V2**：A16.0 / B12.0 / C9.0 / D4.0 / E8.0 / F9.0 / G8.0 / H4.0 / I4.0 = **74.0/100（前回74.0、差0.0）**。モック操作復旧だけで実機操作条件を加点しない。
- **次20分枠**：①`fauna.js:species/types/weights/choose/draw2D`でニホンザルの山林生息域・固有2D造形を作る。②`game.js:spawnMob/updateMob`でニホンザルの木登り/降下/小群れ/投石予兆と実命中・捕食・狩猟/死骸/食事を接続する。③`bestiary.js:recordKill`・`game.js:restoreSnapshot/isValidSnapshot`を統合して図鑑・SAVE_SCHEMA2/3CP・世界76/近隣9・旧強敵を回帰する。新種名の登録だけで終わらせない。
- **次40分枠**：①`mountain.js:height/blocked/draw2D`・`webgl3d.js:mountainTerrain`で山腹→岩場/山頂/洞窟入口の地続き実プレイ区間を拡張する。②`webgl3d.js:drawCommonAnimal3D`でニホンザルの固有3Dモデル/樹上・投石モーションを2D/実AIに連動する。③`gamepad.js:poll/focus`と`game.js:collides/move`、縦横HUD・旧SAVE_SCHEMA2を実ブラウザ/物理Padで可能な範囲でQAし、`41477782219`と最新HEADのPages build/deployを個別job確認する。実機不可なら未検証と明記。

## 共同スプリント・次担当｜2026/11/03 00:57:39 JST｜45分枠｜ACTIVE_SPRINT_ID=MOUNTAIN-CONTIGUOUS-FOOTHILL-V1｜地続き山腹・渓谷と第二木橋・針葉樹林
- **開始HEAD→コードHEAD**：`908a5f04bb8f18da6399328ff0fec286332d7ab5` → `805491e21785c0f97a44c8a3aba97436ffe99a26`。変更は`neo-wild/mountain.js`・`neo-wild/webgl3d.js`・`neo-wild/game.js`・`neo-wild/index.html`の4件のみ、mainへ非強制更新、?rev更新。前回の15分枠/45分枠による山麓・旧渓流/木橋を保持し二重実装なし。
- **新たに遊べる実装**：①既存都市→廃村→山麓(x=8300〜10100)から、山腹・渓谷(x=10100〜11800)へ地続きで1,700座標単位拡張。旧山麓の地形高さと道中心は数値的に完全一致、山腹で標高約252へ上昇。WORLD.wはMOUNTAIN.EASTに追従し旧SAVE_SCHEMA=2/3CP・8地域/6探索地点を変更しない。②x≈10950に峡谷/川筋と第二木橋を実座標で追加。橋上はプレイヤー半径24で連続通過でき、橋以外の水・峡谷は衝突で遮断。岩壁・新山小屋1棟・針葉樹43本・岩礫11個に衝突、下草36株は通行を妨げない。③2Dと3Dに同じ峡谷/橋/針葉樹/岩礫/下草・山腹地表を描画し、既存の近距離3D静的メッシュの可視判定を維持。山腹は鹿/猪の比率を調整、初期13・総76・周辺9・晴7雨5・9秒・群れ6%/12%・110秒・近所1組を増やさない。
- **QA証拠**：実`mountain.js`の旧地形/旧道維持・標高増分・道全区間・旧/新橋と峡谷衝突・樹木/岩礫・2D描画呼出し等 **986条件PASS**。実`webgl3d.js:mountainTerrain`の幾何生成をGPUなしで呼び出し quad216/box80/pyramid360/ellipsoid10、非有限座標0。実`game.js:collides`の橋・都市・山腹・世界境界 **193条件PASS**。変更JS3ファイル全文構文PASS。実GPU・実ブラウザでの縦390×844/横800×360・844×390、Android/物理Pad/10分E2E/FPS・旧セーブ実機復帰は**未検証**。GPUモックを実画面PASSとしない。
- **Pages**：コードHEAD `805491e21785c0f97a44c8a3aba97436ffe99a26`、run `41476533139`、個別jobs **build=success / deploy=success / report-build-status=success**。コードのPages配信確認済み。ROADMAP更新commitのrunは別途確認。
- **進捗V2共通**：A16.0 / B12.0 / C9.0 / D4.0 / E8.0 / F9.0 / G8.0 / H4.0 / I4.0 = **74.0/100**（前回74.0→74.0、差0.0）。地続き山腹実装の新規検証はC/H/Iの実ブラウザ・実機不足条件を満たさないため機械加点なし。旧V2の重みと条件内訳は維持。
- **次15分枠**：①`fauna.js:species/types/draw2D`・`game.js:spawnMob/updateMob`でニホンザルの山林出現→樹上移動→投石予兆/実命中→狩猟/死骸/図鑑/旧セーブを1縦実装。②`game.js:move/collides/settleNewRegion`で第二橋のNPC通行、山腹晴/雨/LV1/6/11、SAVE_SCHEMA2/3CP・世界総76/周辺9の実関数経時試験。③山腹と山麓を往復してレア2/3・strongRollsの保存/再開、群れ1組・旧ボス40技の回帰。
- **次45分枠**：①`mountain.js:height/blocked`・`webgl3d.js:mountainTerrain`で渓谷先の岩場/山頂/洞窟入口へ地続きの次のプレイ区間を追加（単なる背景不可）。②ニホンザルの`webgl3d.js:drawCommonAnimal3D`固有モデル/木の上下・投石アニメと2Dを一致させ、実当たり判定とFPSを確認。③縦横実ブラウザ/実GPUが使えれば橋床・崖・夜目/死亡/強敵40技/HUD/Padを検証し、できなければ未検証を維持。新タスクなし。

## 共同スプリント・次担当｜2026-11-03 00:28:10 JST｜45分枠｜ACTIVE_SPRINT_ID=MOUNTAIN-CONTIGUOUS-FOOTHILL-V1｜山麓渓流と実際に渡れる木橋・森林下草
- **開始HEAD→コードHEAD**：`38c269ef29f388fe492c6346238c8838cb8cd51b` → `c03dd5f635a98a6c8b54c8b66e206c3a44a3787a`。15分枠の既存地続き山道/廃村/標高/47樹木/13岩/8地区/6探索地点を現行mainで確認して再実装せず拡張。変更ファイルは`neo-wild/mountain.js`（blob `9c3aaa0d`）、`neo-wild/webgl3d.js`（`e0061d47`）、`neo-wild/index.html`（`4b31c398`）のみ。強制pushなし、rev更新。
- **新たに遊べる縦実装**：①山道の中腹（x≈9250）に渓流と幅140の古い木橋を追加。渓流の橋以外は`mountain.js:blocked`で陸上動物/プレイヤーの進入を阻止、橋上は半径18の動物が旧都市から山林まで連続通過できる。既存`game.js:collides`の共通物理経路へ自動連結。②渓流の蛇行・川岸・木橋・手すり/床板を`mountain.js:draw2D`と`webgl3d.js:mountainTerrain`に同一座標で描画。橋と川は近距離3D静的LODの既存キャッシュに入り、独立ステージなし。③山道の外側に決定的配置のシダ42株を追加、尖った葉の2D/3Dを実装（衝突のない景観で過密/スタックを避ける）。生物数は増やさず、通常13/世界76/近隣9/晴7雨5/9秒/群れ6%・12%/110秒を維持。既存旧SAVE_SCHEMA2/3CP、強敵20種40技、死亡、月齢、Gamepadの保存構造と操作コードは変更なし。
- **動的検査**：新`mountain.js`の実関数を実行し山道中央の連続通行、橋外の川の衝突、旧都市で新しい衝突が発生しないこと、シダが道を塞がないこと、2D描画呼び出しを確認。現行`webgl3d.js:mountainTerrain`実関数をGPU抜きで呼び出し、3D木橋1・川24区間・シダ210葉をメッシュ生成経路で確認。**計161条件PASS**、変更JS構文2/2 PASS。実GPU/実ブラウザでの標高接地・FPS・縦390×844/横800×360・844×390、Android/物理Pad、旧セーブE2E/10分E2Eは**未検証**。模擬描画を実GPU確認としない。
- **Pages**：コードcommit `c03dd5f635a98a6c8b54c8b66e206c3a44a3787a` の直接run `41471805593` は後続ROADMAP更新でdeploy取消（build=success/deploy=cancelled）。**ROADMAP反映HEAD `f3a337653962b38c88e8a2f9af45573209cd381a` のPages run `41471891666` は build=success / deploy=success / report-build-status=success を個別jobで確認、コードを含む公開反映済み。** `41471805585` はIndexNow通知でPagesではない。
- **進捗V2共通**：A16.0 / B12.0 / C9.0 / D4.0 / E8.0 / F9.0 / G8.0 / H4.0 / I4.0 = **74.0/100**（前回74.0→74.0、差0.0）。地形機能は追加したが実機描画/長時間E2E未達で自動加点しない。採点の重み/定義は固定。
- **次15分枠**：①`fauna.js:species/types/draw2D`と`game.js:spawnMob/updateMob`でニホンザルの木登り→投石予兆/命中→狩猟/死骸→図鑑/保存を連結。②`game.js:collides/move/updateMob`で渓流の橋をプレイヤー・NPCが渡り、橋外の水へ落ちないことを経時実関数テスト。③旧SAVE_SCHEMA2/3CPの山麓復帰、レアLV6=2/LV11=3、局所補充上限を動的試験。
- **次45分枠**：①実ブラウザ/WebGLとCanvas2Dで山道→橋→森林の連続歩行、地形高・橋床・手すり・衝突・木のはまりを縦横3解像度/FPSで検査。②`mountain.js:height/blocked`と`webgl3d.js:mountainTerrain`を山腹/渓谷へ連続拡張し、登れる斜面・岩/樹木・新景観を一体実装（独立マップ不可）。③ニホンザル実装後は`webgl3d.js:drawCommonAnimal3D`で樹上姿勢・四肢/尾/投石の実モデルと2Dを合わせ、ボス40技/月齢/死亡回帰。実機未検証はそのまま明記。

## 共同スプリント・次担当｜2026/11/03 00:18 JST｜15分枠｜ACTIVE_SPRINT_ID=MOUNTAIN-CONTIGUOUS-FOOTHILL-V1｜都市から地続き山麓・廃村・山林を実装
- **優先仕様**：既存8地区・6探索地点・SAVE_SCHEMA=2・3チェックポイントを残したまま、都市東端の既存座標(8300,約3800)から廃村→山麓の森林へ、独立ロードなしで歩ける第一拡張区間を完成。今後の山腹/渓谷/山頂/洞窟・ニホンザル以降は未実装であり完成扱いしない。前回BOSS-SIGNATURES-V1の40技・警告命中一致とBOSS-BALANCE-V2を保持。
- **開始HEAD→コードHEAD**：`699f7b1fa5e397608baa968be4a9c19a29197afb` → `9676c0582354b5082e0402b3ad93dc37b9457db0`。mainへの順次commit：mountain.js `237f8d42`→`70054ff9`→`ffbe4809`、game.js `546c7675`→`9c69eaf8`、webgl3d.js `e832c24e`→`7488eb10`、index.html `c82cf736`→`f3dc9819`→`9676c058`。変更はneo-wild/のみ、強制push/旧ファイル上書きなし。
- **プレイ可能な縦パッケージ**：①ワールド幅8400→10100、旧都市の右端と新しい曲がる山麓道を同一ワールド座標で接続。約1700座標単位を連続移動でき、丘の標高0→約90・通行可能な道と立入不可の岩壁・衝突する樹木47本/岩13個/廃村跡2棟を2D/3Dで同じ座標に実装。②近距離の山林地形のみWebGL静的メッシュへ取り込むLOD、2D代替も道/森/岩壁/廃村を描画。動物・死骸・食料・運搬肉は山の地形高に追従し、既存ジャンプ/戦闘のgroundZは屋上用のまま維持。③山麓へ移動すると旧8地域の第7スロットを維持した別生息域として判定し、通常のシカ/ウサギ/野生キツネ/イノシシ/タヌキ/イタチ/カラスから既存密度予算内で補充。地図/ミニマップに山麓の道を表示。④強敵の抽選は山麓専用の既存陸生4種に限定し、LV6=2/LV11=3・旧20種/40技/威圧・体勢崩し・HP・保存互換を維持。河川専用強敵が山道の戦闘枠を占有しないよう独立した強敵生息域キー`7:foothill`を既存strongRollsに任意追加。
- **密度/互換の不変条件**：通常初期13、世界cap76、近隣9、晴7/雨5、9秒補充、群れLV2～4 6%/LV5以上12%、110秒間隔・近隣1組、LV8以上のみ3頭。8地域のecology配列長=8、SAVE_SCHEMA=2、3CP、6巣、既存河川/橋、夜目・月齢・飢餓死亡・Gamepad・横縦HUDは変更なし。山地の動物は既存の狩猟→死骸→食事→備蓄系を利用。
- **動的QA PASS**：新mountain.js実関数の中心道全区間・樹木/岩/旧都市非衝突135条件＋旧都市1008サンプル＋経路107点PASS。現行game.jsの実関数`move/collides/spawnMob/regionAt/isValidSnapshot`とWebGLの`mountainTerrain`を隔離実行し、山道連続約1800単位、樹木/崖、山林/都市の種別、2D描画、近距離3Dメッシュ/遠方LOD、旧SAVE_SCHEMA2都市/山林復帰、密度・スクリプト読込順 **23/23 PASS**。強敵の実関数`strongStageCandidate/spawnStrongBoss/strongBossLimit/strongHabitatKey`で山地の陸生抽選、LV6二体/LV11三体、山林内合法出現、BOSS-BALANCE-V2 **6/6 PASS**。関連JS全文構文PASS。**実Android/物理パッド/実GPU/実ブラウザ10分E2E・縦横FPS・実セーブE2Eは未検証**。関数/模擬描画と実機は区別する。
- **Pages**：コードHEAD `9676c0582354b5082e0402b3ad93dc37b9457db0` 対象run `41469530571` は **build=success / deploy=success / report-build-status=success** を個別jobで確認。コード配信済み。前段HEAD `70054ff9` run `41469144650` も全success。ROADMAP記録commit `d72192de` のrun `41469752441` は別の配信処理として確認対象。
- **進捗計測V2**：A16.0 / B12.0 / C9.0 / D4.0 / E8.0 / F9.0 / G8.0 / H4.0 / I4.0 = **74.0/100（前回74.0→74.0、差0.0）**。山麓拡張は既存C/Hの未検証実機条件やIのE2Eを自動加点しない。A/B/C/D/E/F/G/H/Iの重み・条件は従来V2正本を変更しない。
- **次15分枠**：①`fauna.js:species/types/weights/choose/draw2D`と`game.js:spawnMob/update`で**ニホンザル**の山林専用出現→警戒/逃走→木の上下移動→実当たり判定の投石→狩猟/死骸/食事→図鑑/旧セーブ復元を一体実装。新種登録だけでは出荷しない。②`game.js:move/collides/settleNewRegion/maintainLocalWildlife`を山道2000歩・雨/晴・LV1/6/11・巣周囲・旧SAVE_SCHEMA2/3CPの経時試験で詰まり/湧き過ぎゼロまで確認。③`game.js:strongHabitatKey/enterStrongStage/normalizeStrongBossSave`の山麓⇔都市をまたぐ強敵2/3体の保存/復帰と近傍1体のみ攻撃を実関数で試験。
- **次45分枠**：①`webgl3d.js:mountainTerrain/animal/foodMesh`と`mountain.js:draw2D`で都市→廃村→山林の地形高/樹木衝突/岩壁/死骸・肉の一致を縦390×844・横800×360/844×390で実ブラウザQAし、岩や木へのスタック/黒潰れを最小修正。②`webgl3d.js:drawCommonAnimal3D`でニホンザルの四肢/尾/樹上姿勢・投石モーションを2Dと揃え、game.js側のAI・当たり判定を壊さない。③近距離LOD/描画FPS/ボス40技の警告・月齢・地図/音/Padを回帰し、Pagesのbuild/deployを個別jobで確認。実機不可なら未検証と明記。

## 共同スプリント・次担当｜2026/11/2 23:54:32 JST｜45分枠｜ACTIVE_SPRINT_ID=BOSS-SIGNATURES-V1｜40固有技の警告・実命中境界の不一致を修正
- **開始HEAD→コードHEAD**：`0a69ca233b000e2c778b84774886321d27e88b95` → `76f07d3982f21b3715dbeb5477ee34e4f2e8390f`。15分枠/手動の直近BOSS-BALANCE-V2強化（`46d4388c`/キャッシュ更新`0a69ca23`）を最新mainで取り込み、強敵HP・攻撃・AIは二重調整しない。コードcommit `76f07d3982f21b3715dbeb5477ee34e4f2e8390f`。今回も`neo-wild/`のみ。
- **再現した実不具合**：`boss-patterns.js:hit(s,x,y,extra)`はプレイヤー半径の55%を足した判定なのに`draw(ctx,s)`は半径を含めず警告を描いていた。例：黒豹「影落ちの奇襲」の警告円半径43に対し、中心から47離れた位置が`extra=11`では命中、警告外から被弾する。40技共通の形状境界の問題。
- **修正**：`boss-patterns.js`の`draw(ctx,s,elapsed,padding)`に同じ身体半径を渡し、直線/2列/V字の幅、扇/背面/横薙ぎの外径と内径、円/環/狙い撃ち/十字/3点の描画寸法を`hit()`と一致させた。`game.js:drawBossThreats`から`P.r*.55`を渡す。既存の回避時間・威力・40技・ボスLV6=2/LV11=3・通常密度13/76/9・晴7雨5/9秒・群れ6%/12%/110秒・旧SAVE_SCHEMA2は変更なし。`index.html`でboss-patterns/game.jsのcache revを更新。
- **検査**：現行モジュールを実行し20種×2技=40図形を模擬Canvas APIで描画、形状ごとにパディング後の弧/矩形/線路の拡張を確認 **40/40 PASS**。game.js/boss-patterns.js/webgl3d.js/fauna.jsの構文 **4/4 PASS**、警告と命中で同一`P.r*.55`、図鑑40種・新通常6種・景観`scenicProps`・密度/強敵上限・SAVE_SCHEMA2・cache revを静的回帰PASS。実WebGL GPU・Android/実ブラウザ10分・390×844/800×360/844×390の実矩形/FPS/実物Pad・音量・旧セーブE2Eは**未検証**。模擬描画を実機PASSとしない。
- **Pages**：コードcommit `76f07d3982f21b3715dbeb5477ee34e4f2e8390f`、workflow run **`41466262214`** の **build=success / deploy=success / report-build-status=success** を個別ジョブで確認。コードは配信済み。本ROADMAP記録コミットのrunは別途確認。
- **進捗計測V2**：A16.0 / B12.0 / C9.0 / D4.0 / E8.0 / F9.0 / G8.0 / H4.0 / I4.0 = **74.0/100**。前回74.0→74.0、差**0.0**。新規機能完成点ではなく既存40技の公平性回帰修正。D固有外見/戦闘/討伐報酬/保存の実機E2EとH/Iの実機性能試験が未達で据置。
- **次15分枠**：①`game.js:updateBossSignature/rareEngagementBlocked`の20種×LV1/6/11・0.06秒刻みの予兆/回避/命中/遮蔽物・無敵/死亡解除を実関数で再試験。②`syncStrongBossChallenge/bossHealthTarget/normalizeStrongBossSave`を高LV強化・旧SAVE_SCHEMA2/3CP・討伐/再開でHP割合とレア2/3を回帰。③`spawnLocalPack/maintainLocalWildlife`の13/76/9・晴7雨5・群れ1組を10分模擬巡回、強敵以外の個体増加を防止。
- **次45分枠**：①実ブラウザが利用可能ならWebGL/Canvas2Dで40技の赤警告と実被弾範囲・回避余地を縦390×844/横800×360/844×390で比較、FPSとHUD非干渉を測定。②`drawStrongAnimal3D/drawStrongAnimal2D/bestiaryRender`の20強敵＋新通常6種の固有外見/図鑑360度、景観の白塊再発・旧セーブ`scenicProps`を確認。③実GPU/Android/物理Padが使えなければ未検証を保持し、実関数の不足を最小修正→HEAD照合→Pages build/deploy個別確認。新タスク作成禁止。

## 共同スプリント・次担当｜2026/11/02 JST｜ACTIVE_SPRINT_ID=BOSS-SIGNATURES-V1｜強敵20種の恐怖・固有技40種類
- **最優先ユーザー要求**：「強敵は出てくるだけで恐怖する強さにして」「攻撃パターンを全部増やして独自の攻撃パターンを」。既存のレアLV6=2・LV11=3、ボスが「ギリギリ勝てる」HP難度を維持しつつ、20種のすべてに基本攻撃＋新固有技2種（計40新技、同一種でも異なる形と戦い方）を実装。通常生物は初期13/世界76/局所9/晴7雨5/9秒補充、群れ抽選6%/12%、110秒間隔、周辺1組を絶対に増やさない。
- **コードHEAD**：`9ae9bdc22bc3e58370b1b8c6dcb15b2c46fb5d28`（`neo-wild/`内のみ）。新モジュール `boss-patterns.js`（commit `46c05bad`→`d4183aeb`）で20種×2技の名前・予兆時間・効果・攻撃形（直線/2列/V字/扇/横薙ぎ/背面扇/円/環状/狙い撃ち円/十字/3点）・ワールド座標描画・実当たり判定を共通定義。純粋なモジュールで新たなNPCや保存領域は要求しない。
- **戦闘実結合**：`game.js`（`c87509e8`→`f3409100`→`9e7b1e7b`→`18a739c8`→`e4356ab2`→`ec84dbb0`）で20種すべてが既存の通常攻撃に加え、交互に2技を予告→範囲描画→判定→種別の副作用（出血、拘束、吹き飛ばし、持久力低下、威圧）を付与。45%HP未満で激怒、予告短縮12%、威力12%増・特殊再使用短縮。全技に短い予兆と回避可能位置を設定し、遮蔽物・ジャンプ・無敵時間・プレイヤーの強い反撃による中断が有効。新規戦闘は`strongDamageTaken`を通し個別の即死級攻撃を抑制。最寄り以外の複数レアは同時攻撃しない。強敵から1300m超離れた際は未解決の予兆を解消、死亡/旧SAVE_SCHEMA2/3CP再開では未発動技を消して突然の被弾を防ぐ。
- **恐怖の演出**：`index.html/visual.css`に`boss-presence`（「強敵接近」・名前・見極めるべき範囲）を追加、2.55秒の1回だけ、低い咆哮・軽い振動、距離370内で赤い画面周辺影とワールド上の赤い危険オーラ/名前/体力表示。危険BGMは強敵のみ従来290から515mで先行遷移。強敵周辺170～290mの普通の動物は逃走し、敵を湧かせずに存在の恐ろしさを演出。HUD/ゲームパッドを遮らない`pointer-events:none`、縦横レスポンシブ。体力45%未満の激怒時に色・音・短いメッセージを変化。2D/3Dどちらも同じワールド座標の危険範囲オーバーレイ。
- **改変ファイル**：`boss-patterns.js`（新規）、`game.js`（統合・保存互換・中断・動物反応・音楽危険距離）、`index.html`（defer読込順、rev）、`visual.css`（小型端末・横画面への威圧バナー）。他のアプリ・ゲーム・ブログは不変更。
- **実関数・模擬QA**：新20種/各2固有技・合計40、形状区別・すべての攻撃領域に命中座標が存在すること・40警告図形をCanvas2D mockで描画 **9/9 PASS**。現行`game.js`の`applyBossSignatureEffect/updateBossSignature`から実関数を抜いて初動・0.06秒予兆継続・遠方回避・至近命中/上限付きHP低下・無敵時間・スタン中断を **209/209 PASS**（最終アニマル逃走/文字列改名の前の同じ攻撃制御関数）。`scatterWildlifeAroundBoss` は獲物と肉食獣の逃走・遠方/他ボスの非干渉・個体数不変・0.83秒間隔・40図形描画を **9/9 PASS**。最新関連JS構文 **9/9 PASS**、HTML順/入出力・保存/密度保護の静的回帰 **15/15 PASS**。すべて関数/模擬Canvas試験。**実ブラウザ10分、Android/実GPUでの形状/色・音量・FPS/物理パッドのE2Eは未実施**。
- **Pages**：コードHEAD `9ae9bdc22bc3e58370b1b8c6dcb15b2c46fb5d28` workflow run **`41461317861`** の`build=success / deploy=success / report-build-status=success`を個別jobで確認。コード配信成功。ROADMAPのみの後続コミットのrunは別に確認。
- **V2固定評価**：A16/B12/C9/D4/E8/F9/G8/H4/I4 = **74.0/100（前回74.0→74.0、差0.0）**。Dは20種の全E2E/固有モデルと討伐→報酬→保存の実機検証が残るため、技実装数を機械的に加点しない。
- **15分枠引継ぎ**：現行main/ROADMAPと直前45分修正から開始。20種×2技が通常攻撃・各個体のHP/位置・救済行動・背面回り込み・河川/屋上・旧3CPに統合される全ケースを試験、警告範囲と当たり判定が一致すること、遮蔽物・ジャンプ・無敵時間・強打中断・死亡→リトライ時の予兆解消、2〜3体が同時に襲わないことを優先。通常群れ・動物出現数・毒/餌/天候を巻き戻さない。
- **45分枠引継ぎ**：実WebGL/Canvas2Dで40技の警告位置/透過/視認性と20種の個別演出、HUD/小型Android縦横・物理Padの操作阻害0、初登場の威圧・赤影・咆哮BGM・激怒時の強さ・被弾／回避バランス/実fpsの確認。最低照度・8地域生息・図鑑40種・SAVE_SCHEMA2も回帰、実端末未実施をPASSと書かない。修正は最小差分・main→Pages両成功を確認、新タスク禁止。

## 共同スプリント・次担当｜2026/11/02 22:58 JST｜手動統合｜ACTIVE_SPRINT_ID=REWILD-CITY-REGIONS-V1｜全8地域の生物・通常6新種・自然に取り戻された廃墟
- **ユーザー要求**：有名な動物を増やしたいが小型を乱造せず、動物が全くいない地域・過剰湧き・廃墟と動物の楽園感不足を根本的に改善。「敵の量ではなく生息と自然景観で賑わいを作る」。最新POPULATION-REBALANCE-V1を最優先で保持。
- **開始HEAD / 現HEAD**：開始`ba5c4114eae270fa6b0f6c11d0a0c37c1881a704` → 確認済み`53ea3d03f081aeb9019f69dd38b8b3cfd42d0693`。本作業コードmainへの実コミット（すべて`neo-wild/`内）：`fauna.js` `98e0b645`→`28e25b2f`、`webgl3d.js` `e8eb5d7d`→`7c050674`、`bestiary.js` `6b254291`、`game.js` `2638d3d4`→`991abfed`→`348c14e6`→`34fbadd3`→`2bcdf718`→`750431b9`、`index.html` `fe7934b5`。並行45分枠`game.js/index.html` offscreen-legacy-pop修正・`ROADMAP`記録 HEAD `a57b5cfc` / `53ea3d03` も最新mainに残し上書きせず併合。
- **①有名動物を実追加**：通常20種（旧14＋チーター・キリン・シマウマ・ライオン・ゾウ・カバ6種）／強敵20種＝図鑑40種。6種それぞれ固有のCanvas2D+WebGL3D造形（キリンの長脚/首、シマウマの縞、ライオンのたてがみ、ゾウの鼻/牙、カバの巨大な口、チーターの斑点/尾）。戦闘はチーターの約1秒間1.58倍短距離追撃と疲労、シマウマ接近時の後ろ蹴り、ライオンの狩りと稀な2体群れ、キリン長距離蹴り、ゾウの鼻による吹き飛ばし、カバの近距離縄張り防衛。食草を食べるNPCと捕食者の役割を分離。既存巨大ライオン・巨大ゾウ・巨大カバの強敵は維持。
- **②空白地域の根本改善**：`REGIONAL_WILDLIFE`で8地域それぞれに固有種構成と初期常駐個体を設定。開始13体の予算内で他地区に住民を分配し、NPC数を増やさず世界に生命を配置。近場通常spawnの半径を画面サイズに依存した514–979から365–615へ補正し、当該地区かつ通常は画面外の安全地帯に補充。地区移動後`settleNewRegion`で局所0なら1体補給、9秒補充で晴7/雨5を維持。世界上限76の満枠時は800m以遠の視界外・非戦闘・非レア1体だけ退役可能（並行45分枠で改良）。都市・動物園・緑地・川沿い・工業区・水路の出現比率を分離。
- **③廃墟＋再野生化の2D/3D景観**：既存衝突・SAVE_SCHEMA2のplantsを変更せず、座標・地区から計算した`scenicProps`に新種`wildGrowth/sapling/collapsed`を追加。街路脇の草の群生・若木・瓦礫、建物のツタ・ひび割れ・破損した外壁と屋上植生をCanvas2D/3D両方で描画。鳥の世界分布は20→28、非敵NPCの環境演出として描画。都市の自然密度を追加強化。既存街路・6巣・植物の実衝突/水路/夜目/雨/死亡を維持。
- **④密度の絶対維持**：初期13／世界cap76／周辺cap9／晴7・雨5／9秒補充、LV2〜4群れ6%・LV5+12%・110秒クールダウン・近場群れ1組、LV8+のみ3体、LV6/11のレア2/3体は上位指定どおり維持。旧20/112/15/3.6秒/58%へロールバック禁止。
- **動的QA**：現行の`spawnMob/spawnRegionalResident/settleNewRegion/maintainLocalWildlife`を実関数分離して8地域巡回、局所上限9・世界cap76を確認、Safari6種の2D造形も含め**16/16 PASS**。生成世界`generateWorld`を実関数で実行（実装の建物配置89棟と川/運河・6巣を参考にした衝突条件）→8地区すべての実動物常駐を**8/8 PASS**。最新40種の実WebGL図鑑プレビュー関数を模擬GLに接続しメッシュ40/40・2D転写40/40 PASS。関連JS全文8/8構文PASS、HTMLスクリプト順とrevほか12/12回帰PASS。以上は**模擬DOM/GL・関数試験で、Android実機/実GPU実画面・実物パッド・10分ブラウザE2Eは未試験**。古いセーブ本体の保存破壊を防ぐため旧SAVE_SCHEMA2/3CPは未変更。
- **Pages**：現行`neo-wild/`コードを含むHEAD `a57b5cfc743fd97cdaa9264608d961247ad05d36`に対して Pages run `41457278414` **build/deploy success**。後続ROADMAP更新HEAD `53ea3d03f081aeb9019f69dd38b8b3cfd42d0693` run `41457404251`も completed/success。次の本ROADMAP記録コミットのrunは別に確認する。**コード配信済み、実機QAは未実施**。
- **進捗V2（共通）**：A16.0 / B12.0 / C9.0 / D4.0 / E8.0 / F9.0 / G8.0 / H4.0 / I4.0 = **74.0/100（前回差0.0）**。新種/景観/生息分布は既存生態品質の改善であり、未確認実機QAの勝手な加点なし。
- **次15分枠**：①`spawnRegionalResident/spawnMob/settleNewRegion`を実建物・壁・河川・6巣の衝突で新規開始/旧SAVE_SCHEMA2/3CP、8地域LV1/2/6/11・晴/雨を各10分模擬巡回し、空白区域0/周辺9以下/群れ1組を検証。②`huntWildPrey/forageWildBerries/update`でチーター/ライオンの狩り、シマウマの蹴り、草食ゾウ/キリン/カバの防衛・巣/食料連鎖と保存を実関数で結合。③`easeOldOvercrowding`と新地域補充の競合・既存HPと毒/飢餓/死亡の回帰、問題のみ最小修正。
- **次45分枠**：①WebGL/Canvas2Dの通常6新種モデルを40種図鑑・戦闘・回転/ズームで実操作QA。②都心/動物園/緑地/川沿いの古いビルのツタ・破損、道路草・瓦礫・若木、ambient birds28の自然感を縦390x844・横800x360で比較・実fps測定、未知の白い塊を出さない。③密度13/76/9不変のまま地区生息・地図UI・ゲームパッド・レア2/3/毒ヘビ・旧セーブを回帰→Pages build/deploy両成功を記録。

## 共同スプリント・次担当｜2026/11/02 22:55 JST｜45分枠｜ACTIVE_SPRINT_ID=POPULATION-REBALANCE-V1｜旧SAVE_SCHEMA2画面外個体の段階整理
- **開始HEAD**：`750431b9f3867530d8aff66850095424e4c57782` → **実装コミット** `a57b5cfc743fd97cdaa9264608d961247ad05d36`。同じPOPULATION-REBALANCE-V1を継続。直近15分/45分のROADMAP、Drive完成仕様末尾、現行game.jsを確認。旧13/76/9、晴7雨5、9秒、群れ6%/12%・110秒・近所1組・LV8以上3体を変更しない。最新の地域別動物・廃墟表示も維持。
- **発見した実不具合**：旧過密セーブで世界上限76を超えていても、画面外の非戦闘NPCがプレイヤーから800～1300mに偏る場合、`easeOldOvercrowding`は`farAI=1300`より遠い個体しか候補にせず、112体のまま減らない。同様に`retireFarCalmAnimal`が新地区の動物補充を妨げる。
- **修正**：`game.js:easeOldOvercrowding/retireFarCalmAnimal`の安全な画面外退役距離を`max(800,localRadius=700)`に変更。視認可能・交戦中・逃走中・強敵・近傍365m・ミッション2近傍獲物を保護。旧SAVE_SCHEMA2の過密解消は従来通り1補充周期最大2体、急な大量削除なし。地域移動時の世界上限到達でも画面外・非戦闘個体1体のみ入れ替え。`index.html` game.js revを更新。密度定数、群れ、ボスLV6/11、図鑑、毒ヘビ、夜目、死亡、6巣は変更なし。
- **実関数隔離動的QA**：5/5 PASS（112→110/周期、18周期で112→76、視認/戦闘/強敵を維持、新地区補充のための1体退役、800m未満や視認/戦闘中は退役しない）。`game.js`全文JS構文PASS。これは合成状態の関数試験であり実ブラウザFPS・WebGL GPU・Android・物理Pad・旧端末セーブE2Eではない。
- **配信**：コードHEAD `a57b5cfc743fd97cdaa9264608d961247ad05d36` のPages run `41457278414` は `build=success / deploy=success / report-build-status=success` を個別jobで確認。**コード公開反映済み**。強制pushなし、neo-wild/のみ。
- **V2共通採点**：A16.0 / B12.0 / C9.0 / D4.0 / E8.0 / F9.0 / G8.0 / H4.0 / I4.0 = **74.0/100（前回74.0→74.0、差0.0）**。画面外退役バグ修正は既達成の生態品質維持であり新項目加点なし。実機E2E/FPS/矩形は検証待ち。
- **次15分枠**：①`maintainLocalWildlife/easeOldOvercrowding`を旧SAVE_SCHEMA2のLV2/5/8/11、晴/雨、巣周囲、地区移動と結合してNPC数・群れ数を600秒相当追跡。②`restoreSnapshot/normalizeStrongBossSave`で3CP、レア2/3体、毒ヘビ、狩猟ミッション獲物を回帰。③`spawnRegionalResident/spawnMob`で地域固有種の初期13体予算と周辺9体上限を動的確認。
- **次45分枠**：①実ブラウザ390×844/800×360/844×390で巣・雨・新地区・LV2/5/8/11の視認動物数と群れ連携を実画面QA。②図鑑40種（最新通常20＋強敵20）の3D/2D表示、毒蛇/強敵の固有外見、月齢最低照度、物理Padを実機確認。③10分以上E2EとFPS/描画・旧セーブの消失無しを確認し、問題のみ最小修正。実機未試験は継続。

## 共同スプリント・次担当｜2026/11/02 JST｜ACTIVE_SPRINT_ID=POPULATION-REBALANCE-V1｜群れ・湧きすぎの削減
- **最優先ユーザー指摘**：「群れ多すぎだし湧きすぎだ」。旧高密度の強制維持を廃止し、群れは少数・稀、通常野生動物は疎らに補充。前COMBAT-PACK-V1の毒ヘビ・反撃・LV連動・レアLV6=2/LV11=3は維持。
- **開始HEAD → コードHEAD**：`97795ffc9ca3cfff5ada0d02b00096520cbf8018` → `b0f3ae7c2ce5e52798d0675e6658abb9ec929603`。変更：`game.js` commit `ffc55ed3` / blob `fa0ad40414def18d20f037a6ae254c235de8afb8`、`index.html` commit `b0f3ae7c` / blob `2cb4e074b784cf59468a51d38044e6ef3f0fa76c`（ゲーム?rev=20261102-ecology-density-v1）。
- **新しい密度規則**：開始通常NPC **20→13体**、世界通常＋強敵の上限 **112→76体**、プレイヤー周辺上限 **15→9体**、晴天補充目標 **10→7体**、雨天 **8→5体**、補充間隔 **3.6→9秒**、群れ抽選LV2～4 **34%→6%**、LV5以上 **58%→12%**、群れ作成間隔 **110秒以上**、プレイヤーから950m以内は**群れ1組だけ**。群れ2体はLV2以降、3体はLV8以降に限定。戦う猫・狐・犬・毒ヘビの要素を撤回せず数の密度のみ調整。
- **既存高密度セーブ対処**：旧SAVE_SCHEMA2互換、`packLastSpawnAt`のみ任意追加。旧セーブで値が無ければ復元時点をクールダウン開始点にする。過剰な旧群れは近場1組だけ残し、他は個体を消さず群れ連携だけ解除。過密個体の整理は見えていない・プレイヤーから365m以上離れた非戦闘中の通常NPCのみ、最大2体/補充周期。巣安全、強敵、狩猟ミッション近隣の小獲物、目視できるNPCを突然消さない。群れの仲間配置に失敗してもすでに現れたリーダー分を重複補充しない。
- **試験**：実装関数`spawnMob/spawnLocalPack/easeOldOvercrowding`等の分離動的試験 **15/15 PASS**（LV1無群れ、LV2=2頭、LV9=3頭、近場1組、110秒間隔、旧保存群れ連携整理、見える個体と戦闘中NPCの保持）。`maintainLocalWildlife`を用いた**600秒相当**の疑似環境補充試験を含む追加 **9/9 PASS**（周辺最大8体、群れ最大1組、総上限、保存schemaとキャッシュ）。JS関連全8ファイル構文 **8/8 PASS**。**実Android・実PCブラウザ10分E2E・実GPU・物理Pad・旧セーブ実端末の実動作は未試験**。
- **Pages公開**：最新コードHEAD `b0f3ae7c` に対するworkflow run **`41453083696`** は `build=success / deploy=success / report-build-status=success` を各ジョブで確認。コード配信成功。以後のROADMAPのみのコミットを混同しない。
- **共通V2採点**：A16.0 / B12.0 / C9.0 / D4.0 / E8.0 / F9.0 / G8.0 / H4.0 / I4.0 = **74.0/100（前回74.0→74.0、差0.0）**。密度チューニングは既存の生態・戦闘を改善したが、他の未検証項目を新たに達成した証拠ではないため加点なし。
- **次15分枠**：①`maintainLocalWildlife/spawnLocalPack/easeOldOvercrowding`の実NPC移動・討伐・餌消費と600秒以上統合試験（晴/雨/LV1/2/5/8/11）。②旧SAVE_SCHEMA2・チェックポイント3件を復元し、過密の群れ解除、画面外NPCだけの段階減少、飢餓/毒/討伐数を保存まで回帰。③巣の通常敵新規湧きなし、ミッション2の獲物不足なし、強敵LV6・LV11の2/3体は別カウントで保持を確認。
- **次45分枠**：①実ブラウザ・Android縦横の敵密度、1群れの隊列/予兆/攻撃、消失・間引きによる不自然な画面変化を視覚QA。②30分以上の地域移動・雨・LV変化で体感難易度、出現数グラフ、FPSを測る（未実機なら不明と明記）。③Pages最新HEAD build/deploy、図鑑34種、毒ヘビ・ゲームパッド・レア2/3体の現行体験を維持して問題だけ最小差分修正。

## 共同スプリント・次担当｜2026/11/2 22:21:58 JST｜15分枠｜ACTIVE_SPRINT_ID=COMBAT-PACK-V1／BESTIARY-V1回帰｜討伐一度限り・旧セーブ移行保護
- **開始HEAD→コードHEAD**：`19b8ebd3b1e3db79037dee4fec27ded3c14da788` → `97795ffc9ca3cfff5ada0d02b00096520cbf8018`。直前22:19のCOMBAT-PACK-V1（群れ/毒ヘビ/LV6・11レア2・3体）と21:45 BESTIARY-V1を照合。現行mainとDrive完成仕様設計書末尾を確認し、実装済みの群れ・図鑑34種・月齢・死亡・SAVE_SCHEMA2を再実装せず保持。
- **修正①：討伐の二重加算防止**：`game.js:kill(m)` で同一個体の再呼出しを`m._killRegistered`で抑止。生存中の誤呼出しも無効化。図鑑件数・死骸・HUNT・経験値・強敵素材が同じ死体から二重に増えない。修正前の現行実関数は同じ死体を2回渡すと図鑑/死骸/報酬が二重増加（8件中2件FAIL）を再現。
- **修正②：旧強敵実績の破損保存耐性**：`bestiary.js:configure` の旧autosaveと3チェックポイントのJSONを独立して読込。片方が破損しても他方の正しい`strongTrophies`最大値を図鑑へ移行。通常動物の未記録HUNTは種別推定せず、図鑑キーとSAVE_SCHEMA=2を変更しない。
- **変更ファイル/commit**：`neo-wild/game.js`、`neo-wild/bestiary.js`、`neo-wild/index.html`（両JS rev更新）、**コードcommit `97795ffc9ca3cfff5ada0d02b00096520cbf8018`**。対象HEADのblobはコミット直前に再照合し、非強制fast-forwardでmainへ反映。
- **動的QA**：図鑑/実`kill`の隔離V8で8/8 PASS（破損CPでも旧autosave移行、3CP最大値、再初期化で二重移行なし、通常1体討伐2回呼出しでも図鑑/死骸/HUNTは1、HP>0誤killなし、強敵素材/図鑑1回、DEBUG除外、再開相当で件数維持）。旧SAVE_SCHEMA2の`isValidSnapshot/getAutoSnapshot/getCheckpoints/clearAutoSave`実関数6/6 PASS（3CP上限・順序・死亡CP除外・死亡時autosaveのみ削除・破損CP）。`moonlightProfile/dayLightProfile/nightVisionProfile/updateSurvivalNeeds`実関数17/17 PASS（29.530588日境界、満ち欠け、5天候×新月/満月・120度、空腹0→HP漸減・食事後停止・HP0のみ死亡）。`game.js`と`bestiary.js`全文JS構文2/2 PASS。**本番ブラウザE2E、実Android、実GPU、物理Pad、実端末の旧セーブ復帰は未試験**。隔離試験を実機検証と呼ばない。
- **Pages**：対象コードHEAD `97795ffc9ca3cfff5ada0d02b00096520cbf8018` workflow run **`41452229560`**、**build=success / report-build-status=success / deploy=success**を各jobで確認。コードの公開配信成功。ROADMAP記録commitのPagesは別途確認。
- **共通V2採点**：A **16.0** / B **12.0** / C **9.0** / D **4.0** / E **8.0** / F **9.0** / G **8.0** / H **4.0** / I **4.0** ＝ **74.0/100**（前回74.0→74.0、差 **0.0**）。今回の二重計上防止は既達成のA/G/Iの品質維持、別の未達条件は達成していない。D固有AI/外見/報酬、C季節・河川・地区、F縦横実矩形、H実FPS、Iブラウザ10分/Android/物理Padは検証待ち。
- **次15分枠**：①`game.js:resolveAttack/kill`→`bestiary.js:recordKill`→`restoreSnapshot`→3CP復帰を同一実関数ハーネスで接続し、毒ヘビ/通常/強敵の討伐後の増分と再開時の再登録なしを検証。②`spawnMob/spawnLocalPack/maintainLocalWildlife/signalPack`のLV2/5群れの予兆→反撃→巣回避→追跡/逃走を連結、破綻のみ修正。③`updateVenom/updateSurvivalNeeds/beginDeath/advanceDeath`の毒・飢餓→HP0→死亡2.2秒→3CP復帰の経時統合テスト。
- **次45分枠**：①`webgl3d.js`の図鑑34種実モデルを実GPUで回転/拡縮・GL状態復帰、縦390×844/横800×360矩形と2Dフォールバックを確認。②LV6/11強敵2/3体・毒ヘビ・群れの3D/2D外見と戦闘難度を実ブラウザで確認し、最寄り1体だけ攻撃するか確認。③新月/半月/満月×晴/曇/雨で夜目120度と地形の最低明度を実ブラウザで確認、問題がある描画箇所のみ最小修正。
- **未検証**：Android実機/実GPU・物理Pad/10分ブラウザE2E/実端末旧セーブ/3CP、実FPS・HUD矩形。公開済みと実機検証済みは区別する。

## 共同スプリント・次担当｜2026/11/02 22:19 JST｜手動統合｜ACTIVE_SPRINT_ID=COMBAT-PACK-V1｜群れの襲撃・レベル連動難易度・毒ヘビ
- **開始HEAD→コードHEAD**：`86877050ad71f227f204c1a1ae810811b3301129` → `6f7e4617a3e0c7a55c73f4617e5bb14c326489cb`。現行21:45のBESTIARY-V1とLUNAR-VISIBILITY-V1、死亡2.2秒/飢餓/SAVE_SCHEMA2を確認。neo-wild/のみ変更、旧ファイルの巻き戻しなし。
- **プレイ上の変更①：戦う通常動物・群れ**：`fauna.js`で野良猫・野生キツネ・イタチ・タヌキを逃走主体から攻撃NPCへ転換、毒ヘビを14番目の通常動物に追加。犬・猫・狐・イタチ・タヌキ・毒ヘビはLV2から2頭、LV5から最大3頭の群れを形成し、近距離の共有索敵→追跡・側方隊列→攻撃。野良猫・キツネは予兆付き短距離飛びつきと命中/回避/建物衝突を本番関数へ接続。弱いネズミ/ウサギ/ハト/カエルは通常の逃走を保持。巣265m以内への敵新規湧きは禁止を維持。
- **プレイ上の変更②：レベルに応じて敵が強化**：`game.js:enemyChallengeTier/syncEnemyLevel`でプレイヤーLVに従い通常攻撃NPCのHP・攻撃倍率・追跡速度を段階強化。既存NPCの強化時もHP比率を保持し全回復しない。敵周辺上限15、総上限112（SAVE_SCHEMA2のmobs検証上限120以内）。昼夜、地区別種構成、獲物確保、野犬の野生狩り、通常敵が巣へ移動侵入する挙動は維持。
- **プレイ上の変更③：強敵レア種はLV6から2体、LV11から3体**：`strongBossLimit/enterStrongStage/spawnStrongBoss/normalizeStrongBossSave/bossHealthTarget/rareEngagementBlocked`を実結合。LV1〜5は旧地区20%抽選・最大1体。LV6〜10は常時2体、LV11以降は常時3体を地区内に補充、最大3体まで。別種を優先、同時配置は約360mの間隔と巣420m除外を保持。近接する複数強敵のうち最寄り1体だけが攻撃し、同時集中即死を回避。強敵HPはプレイヤー実攻撃力を基準に概ね10〜14ヒット程度で討伐可能な範囲へ調整（個体差・攻撃倍率・攻撃手段で実必要回数は変わる）。旧過大HPセーブは被ダメージ比率を保持して上限補正。実機難易度の微調整待ち。
- **追加バランス調整**：`game.js` commit `742019dc` で低レベル時もプレイヤー実攻撃力を基準とするボスHP上限、旧SAVE_SCHEMA2由来の過大ボスHPをダメージ比率維持で補正。commit `14d0681c` でLV6以降、地区移動時に十分遠方（farAI超）で画面外の旧地区レアのみ配置枠から退役させ、旧地区の見える個体は瞬間移動させず、移動先で2〜3体再補充。 `index.html` commit `6f7e4617`（ゲームJS rev更新）。
- **プレイ上の変更④：毒ヘビ・毒状態**：`fauna.js/webgl3d.js`で黄緑縞と毒牙の2D/3Dモデル、`game.js:inflictVenom/updateVenom`で毒ヘビの実噛み付き時に毒7.5秒、生命-1.45/秒、再噛み付きは残時間更新のみでダメージ倍率は重複しない。左HUDに「☠ 毒 残秒｜生命が減少」、時間経過で解除。新しい`P.poisonTime`は既存SAVE_SCHEMA2のplayerへ同梱、旧セーブ欠損0で安全復元。図鑑`bestiary.js`にも毒ヘビ追加、通常14＋強敵20＝34種。
- **変更ファイル/commit**：`fauna.js` 8e63f0b7、`webgl3d.js` 9945c646、`game.js` a9c30bcb→9aa9e990→f6cd515d→6bb8164a→71c2b1b8→23fedf9e→1a8de684→742019dc、`bestiary.js`29db41d7、`visual.css`aa90cd76、`index.html` c0e7f629（最新?rev）。
- **動的試験**：現行実関数を隔離実行し、通常種14/毒蛇地区重み8/8、敵5種類が反撃側、LV5群れ2〜3・群れID/共有警戒、LV11レア最大3・最寄り1体攻撃・LV6旧セーブ強敵2体復帰・毒の3秒HP-4.35と時間切れ解除など **11/11 PASS**。追加、LV別レアHP有限値/極端な過大値防止、毒HUD・資産参照・schema等 **16/16 PASS**（最終低LV調整前の値を含むためレア目標HPの再計算は次枠へ）。関連全8JS構文 **8/8 PASS**。**実ブラウザ10分、Android実機、物理パッド、GPU FPS、旧セーブE2Eは未試験**。実関数/模擬環境のPASSを実機PASSと扱わない。
- **Pages**：最新コードHEAD `6f7e4617a3e0c7a55c73f4617e5bb14c326489cb` workflow run **`41451525184`**：build=success、report-build-status=success、deploy=successを個別jobで確認。コードの公開反映成功。直前コードHEAD `c0e7f629` も run `41451016793` 両成功。
- **共通V2採点**：A **16.0** / B **12.0** / C **9.0** / D **4.0** / E **8.0** / F **9.0** / G **8.0** / H **4.0** / I **4.0** ＝ **74.0/100**（前回74.0→74.0、差0.0）。新群れ・毒/出現難度は既存C/Aの品質向上であり、未検証の別条件を達成したとは扱わない。Dの20種の個別固有AI/攻撃・2D3D・討伐保存、Cの季節河川地区統合、F縦横HUD、H実GPU、I実端末は検証待ち。
- **次15分枠**：①`spawnMob/spawnLocalPack/maintainLocalWildlife/signalPack`をLV1→2→5の実時間NPC狩り・巣安全・隊列・地形と連結し、群れがプレイヤーを包囲→予兆→攻撃→死骸/食事を確認。②LV6/11で`enterStrongStage/normalizeStrongBossSave/bossHealthTarget`を現行旧SAVE_SCHEMA2・3CP・実リトライに接続、常時2/3体・戦闘死/討伐後の再補充・同時ボス集中攻撃なしを確認。③毒ヘビ噛み付き→毒HUD/経時→HP0死亡/食事/巣/保存→再開を実関数で結合、問題だけ最小修正。
- **次45分枠**：①実ブラウザの縦390×844/横800×360・844×390で毒アイコン・敵名/群れ/強化表示、2D/3D黄色縞毒ヘビ、猫狐の予兆/飛びつき/回転をQA。②LV6とLV11の強敵2/3体の距離・外見・FPS・実戦難度、ボス1体のみアクティブをE2E検証し困難なら未試験。③図鑑34種プレビュー/Gamepad操作/旧SAVE_SCHEMA2/死亡リトライの実端末QA、発見時のみ最小修正→Pages両success。
- **未検証**：実Android/PCブラウザE2E、物理Pad、実WebGL GPU、実FPS・実矩形、旧セーブの完全復元。これらは実機で未確認。

## 共同スプリント・次担当｜2026/11/02 21:45 JST｜45分枠｜ACTIVE_SPRINT_ID=BESTIARY-V1｜図鑑WebGL描画の本体状態破壊防止
- **開始HEAD→コードHEAD**：`4350da38247ea94d4870bb9937a4f31d2bc0e850` → `92e7f4dfe99a3f3307abfe2be4ff89d33ce8ab6f`。直前21:39のBESTIARY-V1、21:16のLUNAR-VISIBILITY-V1、Drive正本末尾を照合。新規33種図鑑の再実装なし。
- **実コード変更**：`neo-wild/webgl3d.js` commit `8755e7e7036eeed57455e95395387ccda3e49ad8` / blob `4d6a8fd17e84ec292dd79a5dd90d643be80e3c18`。図鑑`bestiaryRender`は以前、独立Framebuffer/viewportだけ復元し、WebGLのclearColor・depth/blend/stencil・program・buffer・texture/renderbuffer bindingをゲーム本体へ漏らしていた。描画成功/失敗の双方で13種のGL状態を復元し、図鑑から本体へ戻ったときの3D描画汚染を防止。`neo-wild/index.html` commit `92e7f4dfe99a3f3307abfe2be4ff89d33ce8ab6f` / blob `db105181a70039134fee90e25660a01ad9f09d5a` でwebgl3d.js revを`20261102-bestiary-glstate-v2`に更新。
- **動的QA（実関数＋GLモック）**：現行`bestiaryRender`を抽出し33種類相当の描画→readPixels→2D転写を33回呼出し。変更前GL状態完全復元0/33、変更後33/33 PASS。2D転写例外時も戻り値false・GL状態完全復元PASS。変更後webgl3d.js全文JS構文PASS。模擬モデルは実33動物メッシュのGPU検証ではない。既存21:39時点の全33モデル模擬GL描画結果は維持。
- **追加図鑑DOMモックQA（2026/11/02 21:49 JST）**：現行`bestiary.js`実関数で13通常＋20強敵の33エントリ生成、1種討伐保存、指ドラッグ水平/縦回転、ピンチ、ホイール上下限60/225%、Pad右スティック/肩拡大・戻る、2D非対応フォールバックの8/8 PASS。`recordKill(rat)`2回の保存値=2。実ブラウザ/WebGL GPU・物理PadではなくDOM/入力モック。
- **Pages**：対象コードHEAD `92e7f4df` のGitHub Pages workflow **run `41447590274`**（2026/11/02 21:47 JST開始）は **build=success / deploy=success / report-build-status=success** を個別jobで確認。通知workflow run `41447590829` notify=success。**コード変更の公開配信成功**。直前ROADMAP記録commit `16bb4a42` のPages run `41447740437` もbuild/deploy/report全success。
- **進捗計測V2**：A16.0/B12.0/C9.0/D4.0/E8.0/F9.0/G8.0/H4.0/I4.0＝**74.0/100**、前回74.0→74.0、差**0.0**。GL状態回帰修正は既達成条件の品質改善で、実GPU/FPS・ブラウザ10分・Android/物理Pad実機の新証拠なし。前回Pages確認済みのコードHEAD `a30d4228` の証拠は保持するが今回のHEAD配信確認には流用しない。
- **次15分枠**：①`game.js:kill`→`WildBestiary.recordKill`→旧SAVE_SCHEMA2/3CP復帰→再討伐を実関数で連結し種別二重加算ゼロ。②`moonlightProfile/dayLightProfile/nightVisionProfile`の29.530588日境界と新月/曇雨の最低光度を旧elapsed再開込みで回帰。③図鑑移行と`strongTrophies`20種の記録整合を試験、問題のみ最小修正。
- **次45分枠**：①実ブラウザ/WebGLで33種の描画方向・縦回転・ピンチ/ホイール・60～225%を確認、実GPU不可なら未検証を維持。②390×844、800×360、844×390の図鑑一覧/詳細矩形・スクロールと2D代替、実物パッド決定/戻る/右スティック/肩ズームを検査。③図鑑実機QAが通れば`updateStrongBossAI`/`drawStrongAnimal3D`/`drawStrongAnimal2D`/`kill`の20強敵固有攻撃・外見・報酬保存の未完種類を1～3種単位で実装し動的テスト→Pages確認。
- **未検証**：実GPU shader、実ブラウザ10分E2E、実Android、物理Pad、縦横実矩形、旧セーブ実端末E2E。今回のPages build/deployは成功確認済み。前枠の模擬試験と実機試験を混同しない。

## 共同スプリント・次担当｜2026/11/02 21:39 JST｜手動統合｜ACTIVE_SPRINT_ID=BESTIARY-V1｜タイトル動物図鑑・3D回転・永続討伐記録
- **開始HEAD→コードHEAD**：`7902522254e625f2384e86d34641ae92d95e8c3a` → `a30d42283772a8af3f6652771a2e66d8f314aeb5`。直前LUNAR-VISIBILITY-V1、死亡2.2秒・SAVE_SCHEMA2/3CPのソースを維持。実装範囲はneo-wild/のみ。
- **新しい遊びの4点**：(1) タイトルに「動物図鑑」と登録数表示、通常13種＋強敵20種、未討伐は？？？で非公開。(2) ゲーム内kill(m)で実討伐を種別カウントしてローカルストレージに累積保存。死亡/リトライ/最初から/旧セーブ/3CPの独立記録で、デバッグ教程内の討伐は除外。(3) 既存WebGLの実動物モデルを別Framebufferへ描画して図鑑キャンバスへ転送。タッチドラッグで水平360度＋上下視点、ピンチ・ホイール・＋/−で60～225%ズーム。WebGL不可なら2D簡易姿と非対応表示。(4) 既存SAVE_SCHEMA=2自体は変更せず、旧自動保存・3チェックポイントのstrongTrophiesから既討伐の強敵情報のみ最大件数で移行。種別が記録されていない旧通常HUNTは推測登録しない。ゲームパッド十字で選択・決定/取消・右スティック回転・肩でズーム対応。
- **変更ファイルとcommit**：`webgl3d.js` 4ce989ad（元の動物メッシュを使った独立3Dプレビュー）、`bestiary.js` 7bdbd17f→5b9c3103→7e00f457（図鑑、一覧/詳細、旧強敵記録移行）、`bestiary.css` c24bf7fa（縦横レスポンシブ）、`game.js` df96a484→0a3b45b5（kill連結、デバッグ除外）、`gamepad.js` a2eb66b8（図鑑モーダル中のタイトルメニュー誤操作防止）、`index.html` a30d4228（タイトル入口、モーダル、読込順、キャッシュrev）。
- **試験**：JavaScript全文構文8/8 PASS。HTMLの図鑑参照10/10 PASS、bestiary.jsがgame.jsより先にロード。図鑑モックDOM/localStorageで旧強敵移行→通常討伐2回→未知種無登録→一覧→実3Dプレビュー呼出し→戻る→閉じる9/9 PASS。既存webgl3d.js本体のモデル描画関数を模擬GLに接続し通常13＋強敵20の33/33モデル生成/描画/ReadPixels PASS。**すべて模擬DOM/GLであり実GPU・実ブラウザ/Android/物理Padではない**。旧通常種別の復元はデータ欠落のため不可能。
- **Pages**：コードHEAD `a30d4228` に対する workflow run `41446501904` は **build=success / report-build-status=success / deploy=success** を各jobで確認。コードの公開反映済み。後続ROADMAP記録コミットのrunは別途確認。
- **進捗計測V2**：A16/B12/C9/D4/E8/F9/G8/H4/I4＝**74.0/100（前回74.0→74.0、差0.0）**。図鑑は既存100点固定表に独立項目がなく実装だけで加点しない。対象コードHEADのPages両成功によりI=4、H実GPU・Iブラウザ10分/Android/物理Padは検証待ち。
- **次15分枠**：①本番`kill(m)`→bestiary localStorage→死亡→チェックポイント再開→再討伐の実関数結合、種別件数の二重加算なしを検証。②強敵討伐`strongTrophies`と旧保存3CPからの図鑑移行件数を検証。③LUNAR-VISIBILITY-V1の月齢/夜目の境界回帰と通常AI改善を継続。
- **次45分枠**：①実ブラウザで通常13種＋強敵20種の図鑑モデルをGPU/WebGLで描画、指360度回転・縦横ピンチ・60～225%ズームを実操作QA。②ゲームパッド図鑑の選択/戻る/右スティック/肩ズーム、タイトル誤作動なし、2D代替を実操作検証。③Pages最新HEADのbuild/deploy両successと縦390×844/横800×360の図鑑UI矩形を確認、不具合があれば最小修正。
- **未検証**：実Android、実GPU shader、物理Pad、図鑑を開いての実ブラウザE2E、旧セーブの実端末復旧。未確認を成功と扱わない。

## 共同スプリント・次担当｜2026/11/02 21:16 JST｜15分枠｜ACTIVE_SPRINT_ID=LUNAR-VISIBILITY-V1｜月齢の連続位相と新月の最低視認性
- **開始HEAD→コードHEAD**：`69305671a3052b317956415a28eb0dfc4c6ff58f` → `2533b25a1444d7fb97a1b29090663fca285efffe`。20:45の45分枠、20:18の15分枠、Drive設計正本末尾を照合。死亡/飢餓/3CP/SAVE_SCHEMA2/夜目120度/6巣/強敵20種を巻き戻さない。月齢修正を死亡パッケージより上位として同じ両枠で引き継ぐ。
- **連動改善①：月相・月齢・照度の単一位相化**：`game.js:moonlightProfile`を29.530588ゲーム日周期の連続位相に統一。新月→三日月→上弦→満ちゆく月→十三夜→満月→十六夜→欠けゆく月→下弦→有明月→新月。満ちる/欠ける側はwaxingと8段階月相記号、照明は連続したilluminationから算出。HUDに月相記号・月齢・名称を表示。
- **連動改善②：新月の視認性と天候差**：最低環境光を旧0.22→0.36、晴天満月を旧0.31→0.50。曇/雨/雷雨/霧は月光の増分だけ減衰し最低0.36は保持。Canvas2D暗転とWebGL共有の`dayLightProfile`が同じ値を参照。WebGL shader側の実GPU見え方は45分枠で要確認。
- **連動改善③：朝夕の明暗逆転を防止**：5.5時/6.5時/18時の明度キーと17.5～20時の月光補間を調整し、朝は明るく、夕は徐々に暗く、12時が最大。**連動改善④：夜目と天候の一致**：`nightVisionProfile(seconds,sky)`から同じskyを`dayLightProfile`へ渡し、雨/雷雨指定時の夜目周辺明度と月相計算を一致。
- **変更・証拠**：`neo-wild/game.js` commit `39765b9a9a9e4fe7c1b036e6b7b2376902149b41` / blob `5d28f0de1a4fdc34157cd90c49ea87da63795afa`。`neo-wild/index.html` rev `20261102-lunar-visible-v1` commit `2533b25a1444d7fb97a1b29090663fca285efffe` / blob `640dbf6efe580ce8f6ea3fbae40d21c039eef3ef`。
- **動的QA**：現行実`moonlightProfile/dayLightProfile/nightVisionProfile`を評価し月齢11区間×名称/増減、5天候×新月/満月/最低照度/夜目120度/sky一致、590区間連続性、3天候×朝夕単調性/正午最大、合計 **646/646 PASS**。現行7 JS全文構文7/7 PASS、HTMLの7JS参照7/7 PASS。実関数＋V8での試験。**実ブラウザの見た目/実GPU/Android/物理Pad/10分E2E/旧セーブ実ブラウザ復帰は未検証**。保存関数・スキーマ・3CPは今回変更なし。
- **Pages**：コードHEAD `2533b25a` のrun **`41443264452`**。build=success / report-build-status=success / deploy=success（個別job確認済み）。ROADMAP追記commit自身のrunは別途確認。
- **進捗計測V2**：A **16.0** / B **12.0** / C **9.0** / D **4.0** / E **8.0** / F **9.0** / G **8.0** / H **4.0** / I **4.0** ＝ **74.0/100**。前回74.0→74.0（差0.0）。独立した未達成条件は増えず品質改善のみ。 Cの地域、Dの固有戦闘/外見/討伐保存、Fの実HUD矩形、Hの実GPU/FPS、Iのブラウザ10分/Android/物理Padは0点・検証待ち。
- **次45分枠（3件）**：①`webgl3d.js`の`uNight`/頂点shader/fragment shaderと`gl.clearColor`を実描画で点検し、新月・雷雨でも草/敵/地形が黒潰れしない最低材質明度を最小修正（ゲーム側の月齢算式は再実装しない）。②`drawNightVision2D`の暗転マスクとWebGLで新月/半月/満月×晴/曇/雨×縦390×844/横800×360を比較し、120度夜目/昼最大/夕方単調性を検証。③必要なshader変更とHTML revをmainへコミットし、対象HEADのPages build/deploy両success確認、旧SAVE_SCHEMA2/3CP・死亡2.2秒を回帰。
- **次15分枠（3件）**：①`moonlightProfile/dayLightProfile/nightVisionProfile`のDAY85秒境界・29.530588日境界・旧elapsed保存復元を実関数で検証。②`restoreSnapshot/currentSnapshot/getCheckpoints`の3CP、旧SAVE_SCHEMA2、夜目/空腹0→HP漸減→死亡2.2秒→リトライを連結試験。③45分枠のshader結果を受けて`game.js`側の月相HUD/夜間狩猟AIと画面照明を実ブラウザで検証し、問題時のみ最小修正。

## 共同スプリント・次担当｜2026/11/02 20:45 JST｜45分枠｜ACTIVE_SPRINT_ID=DEATH-HUNGER-SEQ-V1｜死亡最終暗転と残響の途切れを修正
- **開始HEAD→コードHEAD**：`423aaa51c0b745281182a9388472713ece312f0c` → `b67d06e064e85375e9ceb76cd00d63bd87a3e2f5`。20:18の15分枠と19:43の45分枠、Drive完成仕様設計書末尾を照合。空腹0→HP漸減、HP0のみ死亡、2.2秒死亡状態、6巣、強敵20種、SAVE_SCHEMA2、3CP、夜目、2D/3Dは重複実装・旧版上書きなし。
- **実装①：死亡画面への切替で明度が跳ねる問題を修復**：`game.js:drawDeathVignette`の0.58秒からの暗転は維持し、最後の1.86～2.20秒で中心の暗さを0.79→0.96、中間を0.89→0.96へ補間。終了直後の結果背景0.96と一致させ、転倒後にゆっくり視界が消える。2D/3D共通の画面合成で動作する変更。commit `caacb64c77db4af5404ff1465fb5f721eefcac42` / blob `dc4bc807178ec2296cb388fe78b6ba0076601af6`。
- **実装②：死の直前に効果音の残響が残る問題を軽減**：`audio.js:fadeForDeath`で既存0.82秒の効果音減衰を残し、1.65秒から残余SFXを0.015へ二段目減衰。リトライの`resetDeathFade`は全予約を取り消して復帰。commit `50f62f4e23e3f3d4fb2cf1fa33e8c42f981bc746` / blob `13273426d8c3a3cc7f204b0fd6dbd4c3cf418e5e`。HTMLの両キャッシュrev更新 commit `b67d06e064e85375e9ceb76cd00d63bd87a3e2f5` / blob `5beedbcf55f93dff45357ff81c8416d6fa559a82`。
- **実関数QA**：現行7 JS全文構文7/7 PASS。実`drawDeathVignette`を4画面（縦390×844、横800×360/844×390/1536×691）×10状態＝40/40 PASS（暗転開始・中心/中間/周縁の単調増加・2.20秒全面0.96・結果背景一致）。実`fadeForDeath/resetDeathFade`の二重フェード防止・二段SFX予約・リトライ復帰PASS。実`beginDeath/advanceDeath/finish`の0.1秒×22経時で死亡1回・音1回・結果1回・TOP5記録1回・HP0/転倒完了PASS。HTML 7JS読込参照7/7 PASS。すべて実関数＋Canvas2D/AudioParam/DOMモック。**実ブラウザ描画、実GPU WebGL、Android実機、物理Pad、10分以上E2E、旧セーブ実ブラウザ再開は未検証**。
- **Pages配信**：コードHEAD `b67d06e0` workflow run **`41439155609`** の **build=success / report-build-status=success / deploy=success** を個別jobで確認。コード配信成功。ROADMAP記録commitのrunは後続確認が必要。
- **進捗計測V2（固定100点）**：A **16.0** / B **12.0** / C **9.0** / D **4.0** / E **8.0** / F **9.0** / G **8.0** / H **4.0** / I **4.0** ＝ **74.0/100**。前回74.0→74.0、**差0.0**。今回の視覚/音響品質修正は既達成条件の精度改善であり独立採点項目の新達成なし。Cの季節/地域、Dの20種固有戦闘・外見・討伐/保存、Fの実画面矩形、Hの実GPU/FPS、Iの10分ブラウザ/Android実機/物理Pad実機は0点のまま検証待ち。
- **次15分枠（3件）**：①`restoreSnapshot/currentSnapshot/recordCheckpoint`で旧SAVE_SCHEMA2の空腹0・死亡後3CP再開とTOP5挑戦IDの二重加算ゼロを本番関数で結合。②`updateSurvivalNeeds/eat/beginDeath/advanceDeath`の経時試験を今回の最終340ms暗転と組み合わせ、HP0前に結果へ進まないことを確認。③`maintainLocalWildlife/spawnMob/denThreatNearby`の6巣・屋上・8地区・夜間侵入を本番関数で検証し、問題時のみ修正。
- **次45分枠（3件）**：①実ブラウザで縦390×844・横800×360/844×390の2D/WebGL転倒→最後340msの暗転→結果画面・HUD矩形・FPSを計測。②実音声と物理Padで死亡2.2秒→結果→リトライ/最初から、3バス音量復帰を試験（使えなければ未検証）。③`updateStrongBossAI/drawStrongAnimal3D/drawStrongAnimal2D/kill/restoreSnapshot`の20種固有攻撃→討伐→希少素材→保存を種類別に動的結合し、欠損を最新HEADから最小修正。

## 共同スプリント・次担当｜2026/11/02 20:18 JST｜15分枠｜ACTIVE_SPRINT_ID=DEATH-HUNGER-SEQ-V1｜飢餓・死亡遷移・セーブ経時回帰と2.2秒端数修復
- **開始HEAD→コードHEAD**：`09e48ed20e174d6b7fb5cb7632c475849d0add6b` → `981ebce53339c11780b7681e90b4ee2241f10933`。19:43の45分枠/19:15の15分枠とDrive正本末尾を照合。既存の空腹0→HP漸減・2.2秒の転倒/画面/音・6巣/13通常種/強敵20種・SAVE_SCHEMA2/3CPは重複実装せず維持。
- **実コード修正①：2.2秒の死亡完了を厳密化**：`game.js:advanceDeath` は0.2秒×11フレームの浮動小数誤差で2.199999...秒となり、結果画面がもう1フレーム遅れる。1e-6秒の許容誤差で正規化し、正確に2.2秒で結果へ遷移。低FPSの転倒姿勢/暗転/3バス減衰は45分枠の既存実装を維持。
- **実コード修正②：不正経過時間の死亡固着を防止**：`advanceDeath` の非有限dt（NaN/Infinity）は0秒として扱い、死亡時間がNaN化して永久に結果へ到達できなくなる経路を遮断。既存の入力遮断・HP0判定・二重finish防止を維持。コード `neo-wild/game.js` commit **`f66dc53b856806776e17e9463c694ecbc81dbcbd`** / blob `6a0ad6ca9f28035a266c2fa3d1102b7500a52582`、キャッシュ更新 `neo-wild/index.html` commit **`981ebce53339c11780b7681e90b4ee2241f10933`** / blob `40e8e0a0f70eb14b68e7ac6f6e564659167e15c3`。
- **実関数QA**：`updateSurvivalNeeds/eat/beginDeath/advanceDeath` 600秒の0.035秒刻みで空腹0→実食事→再飢餓→HP0→死亡を再現、食事/HP0/二重死亡/保存遮断を検査（7/7 PASS、死亡時刻321.76秒）。`currentSnapshot/saveAuto/recordCheckpoint/getCheckpoints/isValidSnapshot/scoreRunIdFromSnapshot` で旧SAVE_SCHEMA2、3CP上限・順序・同一挑戦ID、備蓄・空腹・HPの保存値、再保存（13/13 PASS）。`spawnMob/regionAt` で8地区×巣265m内/外の捕食者置換・外部自然出現（16/16 PASS）。死亡状態の200ms×11、100ms×22、NaN、二重完了（4/4 PASS）、その他飢餓/順位保存回帰12/12 PASS、`game.js`全文構文PASS。**合計52/52 PASS（全て実関数＋モック、実ブラウザ/Androidではない）**。
- **Pages**：コード＋HTML HEAD `981ebce5` の workflow run **`41435489620`** で **build=success / report-build-status=success / deploy=success** を個別job確認。ゲーム変更の公開反映を確認。今回のROADMAP追記commit自体のrunは別途確認する。
- **進捗計測V2（固定100点）**：A **16.0** / B **12.0** / C **9.0** / D **4.0** / E **8.0** / F **9.0** / G **8.0** / H **4.0** / I **4.0** ＝ **74.0/100**。前回74.0→74.0、**差0.0**。死亡時間と旧セーブの品質改善であり未達成の独立採点条件を満たしたと偽らない。Cの季節/地域、Dの20種固有AI/外見/討伐保存、Fの実画面矩形、Hの実GPU/FPS、Iの10分実ブラウザ/Android実機/物理Pad実機は検証待ち（0点）。
- **次15分枠（3件）**：①`restoreSnapshot` を実関数で起動経路まで接続し、旧SAVE_SCHEMA2の空腹0・巣/備蓄・3CP・TOP5挑戦IDの実再開と二重加算0を確認。②`maintainLocalWildlife/spawnMob/denThreatNearby` の屋上巣・夜間侵入・NPC狩猟を実関数で統合し、巣内新規出現0/外部侵入可を検証。③冬夜の潜伏→獲物覚醒/逃走→攻撃→死骸→食事を本番関数で連結し破綻時のみ最小修正。
- **次45分枠（3件）**：①縦390×844・横800×360/844×390の実ブラウザで2D/WebGLの転倒・暗転・3バス音量と結果画面矩形/FPSを実測。②物理Padのタイトル選択・決定・キャンセル、死亡結果のリトライ/最初からを実機で検証（使用不可なら未検証）。③強敵20種の固有攻撃/3D・2D姿勢/討伐・報酬・保存を種類別に検証、同一スプリントで欠損だけ補完。
- **未検証**：Android実機・物理パッド・実GPU/WebGL・10分以上実ブラウザE2E・旧セーブのブラウザ完全復元。今回の関数モックPASSを実機PASSと呼ばない。

## 共同スプリント・次担当｜2026/11/02 19:43 JST｜45分枠｜ACTIVE_SPRINT_ID=DEATH-HUNGER-SEQ-V1｜低FPS死亡時間と転倒後の静寂を統合
- **開始HEAD→コードHEAD**：`16247a29d8b871a170eab342356c568a6e7a99b8` → `8834d779e81e432331bf772e4cdbcdee72f9b33a`。19:15の15分枠、18:42の45分枠、Drive設計書末尾を確認。飢餓0→HP漸減・食事で停止・HP0のみ死亡、死亡状態2.2秒、SAVE_SCHEMA2、3CP、6巣、通常13種、強敵20種を維持。重複実装なし。
- **プレイ改善①：低FPSでも数秒で倒れて結果へ**：`game.js:loop`のプレイ用35ms物理dt上限と死亡演出用dtを分離。死亡中のみ実フレーム経過を最大200ms/描画で進め、5/10fpsでも2.2秒程度で完結。長時間のバックグラウンド復帰では瞬間的に結果画面へ飛ばない。死亡時の入力遮断・二重finish防止・保存は変更しない。コミット `ce594cbfdbb541bdfbf536cce64eec638d3e74ab`、blob `f5c6df85c0caeea48be39cf0b2839d88e8c2de9c`。
- **プレイ改善②：倒れる姿が見えてから画面が静まる**：`game.js:drawDeathVignette`の暗転開始を死亡後0.16→0.58秒へ遅らせ、1.28秒で周囲を静める。既存WebGL/Canvas2D共通の画面処理、0.65秒の転倒姿勢、2.2秒の結果画面を維持。**プレイ改善③：音も倒れ始めた後に減衰**：`audio.js:fadeForDeath`の3バス減衰開始を0.48/0.58/0.82秒へ後ろ倒し。二重フェードとリトライ音量復帰を維持。コミット `f61bdecc1001b59ced18266510980510084b54d3`、blob `590c645da61eabfe6226da287030faea82dcdfee`。HTML rev更新 `8834d779e81e432331bf772e4cdbcdee72f9b33a`、blob `5f5048e0c1ec3d56894d237fd681ee322d6b9cdf`。
- **動的QA**：実`loop`を模擬RAF/DOMで実行し60/10/5fpsの死亡遷移が壁時計2.20/2.20/2.40秒（3/3 PASS）。実`advanceDeath`の0.016/0.1/0.2秒刻みで2.208/2.200/2.400秒、転倒完了・結果表示各1回（3/3 PASS）。実`drawDeathVignette`の縦390×844で0.30秒は暗転0回、0.65/1.86/2.15秒は暗転各1回（4/4 PASS）。実`fadeForDeath/resetDeathFade`の3バス予約時刻・二重防止・リトライ復帰（3/3 PASS）。現行7 JS全文構文7/7 PASS。計**20/20 PASS**。これは実関数+モックの動的試験であり実ブラウザ描画・WebGL実GPU・Android・物理Pad・10分E2E・旧SAVE_SCHEMA2実ブラウザ復元ではない。
- **Pages**：変更前HEAD `16247a29` の run `41427788438`、コードHEAD `8834d779` の run **`41431058301`**、ROADMAP追記HEAD `28f4d5cc` の run **`41431145982`** は、いずれもbuild/report-build-status/deployの各job **success** を確認。変更後コードの公開反映済み。追認更新コミットのPagesは別runで確認する。
- **進捗計測V2・固定100点**：A **16.0** / B **12.0** / C **9.0** / D **4.0** / E **8.0** / F **9.0** / G **8.0** / H **4.0** / I **4.0** ＝ **74.0/100**。前回72.0→74.0、差**+2.0**。IのPages配信条件がrun `41431145982`のbuild/deploy両successにより2→4点へ復帰。他項目は低FPS死亡品質改善のみで完成条件追加なし、据置。実ブラウザ10分/Android/物理Padは各0点、Cの地域・Fの実矩形・Hの実GPU/FPSも検証待ち。
- **次15分枠（3件）**：①`restoreSnapshot/currentSnapshot/recordCheckpoint`を旧SAVE_SCHEMA2・3CP・死亡再試行・TOP5同一挑戦IDで実関数往復、二重加算ゼロを証明。②`updateSurvivalNeeds/eat/beginDeath/advanceDeath`で空腹0→食事→再飢餓→HP0→2.2秒結果の600秒経時を回帰。③`spawnMob/maintainLocalWildlife`の8地区・巣265m境界・屋上と捕食者13種の密度を実関数で再検証。
- **次45分枠（3件）**：①最新HEADのPages run IDとbuild/deploy各jobを確認し、成功ならIの配信2点を復帰。②縦390×844・横800×360/844×390の実ブラウザでWebGL/Canvas2D死亡2.2秒の転倒・ビネット・3バス減衰/復帰・結果画面矩形とFPSを実測し、破綻箇所のみ最小修正。③実Android/物理Padが使えなければ未検証のまま維持し、強敵20種の固有攻撃・2D/3D外見・報酬・SAVE_SCHEMA2再開の種類別動的結合試験へ戻る。

## 共同スプリント・次担当｜2026/11/02 19:15 JST｜15分枠｜ACTIVE_SPRINT_ID=DEATH-HUNGER-SEQ-V1｜長期飢餓・巣周辺の安全・狩猟教程を連動修正
- **開始HEAD→コードHEAD**：`c2d2b7cb113ed7491af1f2178e5c95e7d215ca15` → `a43f60882c3d043bd3274f5d4b71ba741f73362b`。18:42の45分枠・18:33の通常13種・直近15分枠とDrive完成仕様末尾を確認。死亡2.2秒、3バス減衰/転倒/ビネット、旧SAVE_SCHEMA2、3CP、TOP5、13通常種、強敵20種は維持。
- **実装①：長期生存での飢餓破綻を修復**：`game.js:updateSurvivalNeeds` の空腹減少率 `.38+(day-1)*.035` はゲーム内1年目から過剰増加し100年超で食事が成立しない。DAY25相当を上限（最大1.22/秒、初期0.38/秒）にし、早期DAYの難易度を変えず300年超でも食事が可能な速度を維持。空腹0→HP 2.4/秒減少、食事後の停止、HP0だけ死亡、巣での回復は従来通り。
- **実装②：巣の危険捕食者を正しく識別**：`spawnMob` と `denThreatNearby` は `species.prey` を安全な動物の意味に誤用し、野良猫・小型ヘビ・野生キツネ・イタチが巣265m以内に湧き、巣休息中の危険判定も漏れていた。既存`WILD_PREDATOR_TYPES`で小型捕食者を危険動物として扱い、巣近くの新規湧きだけウサギ/ハトに置換。自然な外部からの侵入は維持、侵入時は距離/壁/屋上の既存判定で休息を中断。
- **実装③：教程中の食べられる小獲物を確保**：`maintainLocalWildlife`の近隣獲物判定を野良猫等の捕食者を含む`species.prey`から、実際の教程補充候補（ネズミ/ウサギ/ハト/カエル）へ統一。捕食者しか周辺にいない場合も狩猟教程用の小獲物を補充。地域別13種/雨・年代分布、初期20/周辺11/全体96、シカ2体上限は変更しない。
- **変更ファイル・SHA**：`neo-wild/game.js` commit `83e5cd939b8e579b2f5ed6c4c9388c573c3fe057` / blob `0fabf68c1545b47c15333c093ce43cd5004c8312`、`neo-wild/index.html` commit `a43f60882c3d043bd3274f5d4b71ba741f73362b` / blob `dcad4586ca0932dac4b85295a7548497a45d72b2`、game.js rev `20261102-survival-refuge-v6`。
- **動的試験**：現行7JS全文構文7/7 PASS。実関数`updateSurvivalNeeds/eat/denThreatNearby/spawnMob/maintainLocalWildlife/scoreRunIdFromSnapshot`でDAY1/25/365/36500/109500の飢餓、実食事→飢餓停止→再度0→HP0、巣の捕食者/小獲物の判別、巣内外スポーン、教程補充、旧挑戦IDの安定性を実行し**25/25 PASS（構文7含む）**。別途実`isValidSnapshot/getCheckpoints/beginDeath/advanceDeath`を模擬localStorage/DOMで実行し、旧SAVE_SCHEMA2、3CP上限、HP0の二重判定なし、0.64秒転倒、2.2秒以前の結果非表示、結果1回を**12/12 PASS**。計**37/37 PASS**。実ブラウザ/Android/実GPU/物理Pad/10分E2E、旧セーブの完全な`restoreSnapshot`結合は未検証。
- **Pages配信**：直前の45分枠HEAD `c2d2b7cb` run `41423026350` はbuild/deployともsuccess（前枠記録）。今回の`a43f6088`以降のrun IDはGitHub連携のpush-run一覧が取得できず、build/deployとも**未確認**。今回の変更はmainへコミット済みだが**公開反映済みとは扱わない**。次枠は対象HEADのbuildとdeployを個別確認する。
- **進捗計測V2（固定100点）**：A **16.0** / B **12.0** / C **9.0** / D **4.0** / E **8.0** / F **9.0** / G **8.0** / H **4.0** / I **2.0** ＝ **72.0/100**（前回74.0→72.0、差**-2.0**）。項目差分はIの「対象HEADのPages build+deploy両成功」だけ4→2（配信未確認による暫定減点）。他項目は既存の根拠を維持し変動なし。最新HEAD配信成功の証拠が得られた場合のみIを4に復帰。実ブラウザ10分/Android/物理Pad E2Eは各0点・検証待ち。
- **次15分枠（3件）**：①`restoreSnapshot/currentSnapshot/recordCheckpoint`で新種13種と旧SAVE_SCHEMA2・3CP・挑戦IDを本番関数で往復し、HP/空腹/巣備蓄と二重加算なしを確認。②`spawnMob/maintainLocalWildlife`で8地区×晴雨×年数の長期分布と巣265m境界/屋上の移動侵入を動的再現し、密度不足のみ最小修正。③`huntWildPrey/scavengeWildFood`で野良猫/ヘビ等の追跡→死骸→食事、冬夜の潜伏と食物連鎖を通し試験。
- **次45分枠（3件）**：①今回のコードHEADとROADMAP追記HEADのPages run IDを取得し、build/deployの両job成功を確認。②縦390×844・横800×360の実ブラウザ/Androidで死亡2.2秒の転倒/暗転/3バス音量復帰と結果画面をWebGL/2D双方で実測。③野良猫/ヘビの巣周辺実描画・物理Pad/10分FPS・強敵20種の固有攻撃/報酬/保存を確認し、実機未使用なら未検証と記録。

## 共同スプリント・次担当｜2026/11/02 18:42 JST｜45分枠｜ACTIVE_SPRINT_ID=DEATH-HUNGER-SEQ-V1｜倒れる・暗転・環境音の統合改善
- **開始HEAD→コードHEAD**：`3d4f289a1429d7972dc5f6a6ef7ac5b41ad423ea` → `52db92018d882dd78468a550ec0a3f2eae1d5899`。開始時に現行main/ROADMAP先頭（18:33通常13種、17:45死亡Pad、17:15飢餓/3CP）とDrive完成仕様末尾を照合。既存の空腹0→徐々にHP減、死亡2.2秒、SAVE_SCHEMA2、3CP、TOP5、13通常種/強敵20種は重複実装・変更せず保持。
- **実装①・死亡音の静寂**：`audio.js` commit `0ee27b92` / blob `a70c78a1`。死亡音を鳴らした後、音楽・環境音・効果音の3バスを段階的に減衰。リトライ時は遅延フェード予約も取り消し、3バス全てを正常音量へ復帰。二重フェードを防止。
- **実装②・倒れる姿勢の整合**：`webgl3d.js` commit `e5231159` / blob `f3035035`。WebGL四足動物の横倒し角を滑らかなease-in/outに変更し、既存Canvas2Dの倒れ方とタイミングを一致。屋上の接地高さ・陰影、死亡時の攻撃解除を維持。
- **実装③・2D/3D共通の喪失感**：`game.js` commit `c069e30f` / blob `c5b3c9a4`。死亡後0.16秒からプレイヤーを中心としたスクリーン座標のビネット暗転、2.2秒で死亡結果へ。WebGL/Canvas2Dの両方に同一の画面処理。画面の瞬間的な明転を防ぐため結果画面背後は暗転維持。index.htmlの3資産キャッシュ更新 commit `52db9201` / blob `ea82e12b`。
- **試験・証拠**：現行本番JS全7ファイル全文構文7/7 PASS。実`beginDeath/advanceDeath/finish`をモックDOMと接続し、HP0の1回判定、入力解除、0.65秒で横倒し、2.2秒前に結果を出さない、TOP5/セーブ消去/死亡音各1回、結果のリトライ表示をPASS。実`drawDeathVignette`を縦390×844、横800×360、横1536×691の6状態ずつ18/18 PASS。実`fadeForDeath/resetDeathFade`の3バス・二重実行防止・再開復帰PASS。WebGL倒れ角6点の単調性/端点PASS。いずれも実ブラウザではなく関数・DOM/Audioモックの検証。
- **Pages配信追認**：コードHEAD `52db9201` run **41422794799** は後続pushでキャンセル（build=success / deploy=cancelled）。ROADMAP反映HEAD `735e0d7d` の run **41422883131** は **build=success / report-build-status=success / deploy=success / workflow=success** を個別jobsで確認。今回のゲームコードを含むPages配信成功。今回の配信追認記録コミット自体は別runで確認する。
- **進捗計測V2・固定100点**：A **16.0** / B **12.0** / C **9.0** / D **4.0** / E **8.0** / F **9.0** / G **8.0** / H **4.0** / I **4.0** ＝ **74.0/100**。前回74.0→74.0、**差0.0**。死亡演出は既得点の品質改善で新たな完成条件を増やさない。Cの季節/エリア、Fの縦横実矩形、Hの実GPU/FPS、Iのブラウザ10分・Android実機・物理Pad E2Eは検証待ち（該当条件0点）。実Android/物理Pad/実GPU/旧セーブ実ブラウザE2Eは未検証。
- **次15分枠**：①`updateSurvivalNeeds/eat/beginDeath`で空腹0→食事でHP減少停止→再度0→HP0を85秒DAY跨ぎ/600秒の実関数で検証。②`restoreSnapshot/saveAuto/recordCheckpoint`で旧SAVE_SCHEMA2・3CPから再開した時のdeathPose/死亡フェード復帰・TOP5挑戦IDを確認。③`spawnMob/maintainLocalWildlife`で13通常種の8地区×天候×年代の過密/巣安全と死亡時スポーン停止を検証。
- **次45分枠**：①縦390×844/横800×360で実ブラウザWebGLとCanvas2Dの転倒・暗転・結果画面矩形を検証し、見切れがあれば`game.js/visual.css`最小修正。②実音声/物理Padで死亡2.2秒→結果の入力/音量復帰、10分プレイ・FPSを実測（使えない環境では未検証のまま）。③Pages run `41422794799` と最新HEADのbuild/deploy各jobを確認し、強敵20種の3D/2D固有戦闘・報酬・保存の未試験を進める。

## 共同スプリント・次担当｜2026/11/02 18:33 JST｜手動・通常動物13種の地域配置｜ACTIVE_SPRINT_ID=DEATH-HUNGER-SEQ-V1（継続）
- 開始HEAD `c7c2b539`、検証時コードHEAD `d3eb936441d68993e55e7ceab4ba3f5096074ed5`。ROADMAP直近15/45枠、Drive完成仕様末尾と最新mainを確認し重複実装を整理。変更対象：`neo-wild/fauna.js`（追加）、`game.js`、`webgl3d.js`、`index.html`のみ。
- 既存通常5種に、野良猫・小型ヘビ・カラス・タヌキ・野生キツネ・イタチ・カエル・シカを追加し計13種。8地区の重み付け合計各100、年数3/10/30/100年で野生種の出現確率を段階調整。雨でカエル増、鳥減。シカは市街地/河川敷/工業区/運河で0%、緑化/森林1%、廃動物園2%、全域最大2体。
- 初期通常個体12→20、近距離上限7→11、晴天近隣補充目標5→10、雨6→8、全域上限96。配置には衝突/個体間距離による拒否があり必ず20体が見えるわけではない。巣付近の危険動物スポーン抑制と強敵20種/1体上限を維持。
- 新規種の2D/3Dモデルと色を反映。3D重複描画関数を統合。野良猫/野生キツネ/イタチ/ヘビは小型獲物を追跡・噛みつき、獲物のHP/逃走/死骸/地域個体数を変える。小型捕食者はシカを狙わず、シカ/タヌキ/カエル等は既存の採食・水辺・休息経路を利用。SAVE_SCHEMA2/3CP/死亡演出/TOP5/Pad/6巣は変更なし。
- **QA**：実関数を使う模擬分布・スポーン上限・シカ2体制限・巣安全・色/2D/3D形状36/36 PASS、猫→ネズミの捕食→逃走→死骸6/6 PASS、7 JSの全文構文7/7 PASS、現行HTML読込/保存/描画/キャッシュ14/14 PASS。合計動的42件。**実ブラウザ10分・Android・物理Pad・GPU FPS・縦横実矩形は未検証**。
- **配信**：HEAD `d3eb9364` Pages run `41420993943`、build=success、deploy=success、report-build-status=success（個別jobs確認）。ROADMAP追記後のHEADは別runで確認する。
- **進捗計測V2**：A16.0/B12.0/C9.0/D4.0/E8.0/F9.0/G8.0/H4.0/I4.0＝**74.0/100**、前回74.0→74.0（差0.0）。C/Hに種類を追加したが未検証の実機/長時間条件に加点なし。
- **次15分枠**：① `spawnMob/maintainLocalWildlife`で8地区・晴雨・年数の長期個体数シミュレーションと過密防止。② `restoreSnapshot`から新種を含む旧SAVE_SCHEMA2/3CP復元と再開・死亡TOP5を実関数で試験。③ 野良猫/野生キツネ/イタチ/ヘビの捕食→逃走→死骸→採食を複数体で結合試験。
- **次45分枠**：① 実Android縦横で6種のWebGLとCanvas2Dモデル/シカ・ヘビの視認性・当たり判定を確認。② 物理パッド/実ブラウザ10分プレイとFPS/巣安全・死亡画面を実測。③ 最新HEADのPages build+deployと残りの強敵20種D/E結合QAを確認。

## 共同スプリント・次担当｜2026/11/02 18時台 JST｜手動・通常動物13種・地域/年代出現分布｜ACTIVE_SPRINT_ID=DEATH-HUNGER-SEQ-V1（既存継続）
- **開始/終了**：開始main `c7c2b539f9db20c3d5c440c45f181dc91cdeae6b` → ソース反映コードHEAD `d3eb936441d68993e55e7ceab4ba3f5096074ed5`。未使用重複設定ファイル削除HEAD `8b1b02af402a2b024394fb9ff52f94bbd20d3bbf`。既存の15/45枠の死亡/飢餓パッケージ・SAVE_SCHEMA2/3CP・強敵20種・タイトルPad/TOP5を維持。前両枠ROADMAPとDrive完成仕様書末尾を照合してから作業。
- **実機能①・13種の登録と密度**：既存ネズミ/ウサギ/ハト/野犬/イノシシ5種に、野良猫/小型ヘビ/カラス/タヌキ/野生キツネ/イタチ/カエル/シカの8種を追加。初期配置 `12→20`、プレイヤー周辺の上限 `7→11`、清天時の補充目標 `5→10`、雨天時 `6→8`。エリア近傍とワールド全体の上限96、巣の敵湧き抑制は維持。ゲーム開始では地域別の一般動物を先に数種配置し、食事教程用の捕獲しやすい獲物を確保。
- **実機能②・場所/年数の重み**：`fauna.js`に8地区×13種の分布比率（各地区初期配分合計100）を設定。市街地は猫/ネズミ/カラス、河川敷は野鳥/蛇、森林はウサギ/イノシシ/タヌキ/キツネ、廃動物園はやや大型寄り。シカは都市/河川/工業区/運河で0%、緑化区と森林で1%、廃動物園で2%、生息済み全域同時最大2体。ゲーム内3/10/30/100年で種類別出現重みを段階増、雨ではカエル増/鳥減。固定の年で突然大量出現させない。
- **実機能③・AI/表示**：通常小型捕食者の野良猫/キツネ/イタチ/ヘビは実際にネズミ等の獲物を追う。草食/雑食の動物は採食、シカは逃走可能。Canvas2Dで猫・キツネ既存の専用型を再利用し、ヘビ/カラス/カエル/シカ/イタチ/タヌキ専用外見を追加。WebGLでも猫/キツネ専用型と6種独自3D形状を接続。特殊な強敵20種は変更なし。
- **変更**：`neo-wild/fauna.js`（分布/動物データ/2D外見、コミット `2d4cfe8b`→`f1308bb7`）、`game.js`（本編登録/出現/採食/小動物の狩り/2D接続、コミット `5e74bf43`→`b8e6d015`→`2ff6d136`）、`webgl3d.js`（6種専用3Dと猫・キツネの3D流用、コミット `932e12ba`→`d3eb9364`）、`index.html`（fauna.js読込のHTMLタグ正常化・3 JS rev更新、コミット `4de23b02`→`2181c4a8`）。使用しない重複ファイル`wildlife-population.js`を `8b1b02af` で削除。作業ファイルは全て`neo-wild/`内。
- **試験**：本番の`fauna.js`と`game.js`実関数`spawnMob`を使い、13種すべての生成/実際の色/1種ずつのステータス、8地区配分、初年度シカの希少率、40年目増加、雨カエル増、教程用の安全な獲物制限、初期20/近傍11/全体96、シカ2体上限、旧SAVE_SCHEMA2維持、HTML読込順、7JS全文構文の**27/27 PASS**。2D専用6種と3D専用6種の形状関数を直接実行し有限の描画データを確認。ブラウザ10分E2E/Android実機/物理パッド/本番FPSは未試験（コンテナから外部URLのDNS解決不可）。動的試験はモック物理世界・DOMを使用した対象関数の検証であり実機ではない。
- **進捗計測V2**：A16.0 / B12.0 / C9.0 / D4.0 / E8.0 / F9.0 / G8.0 / H4.0 / I4.0 = **74.0/100、前回74.0→74.0（差0.0）**。通常種追加は新たな採点条件の全3要件（現行実装・実操作/実関数・配信）を独立して満たす新規条件ではないため加点なし。Android/物理Pad/10分ブラウザE2Eは検証待ち。
- **次15分枠**：①`spawnMob/maintainLocalWildlife`で各出発地の100回程度の分布/初期20/近傍11/巣安全を実関数＋位置/衝突モックで実測し、地形での生成失敗を減らす。②`huntWildPrey/scavengeWildFood/forageWildBerries`で猫・狐・ヘビ・イタチ→ネズミ→死骸→食事とシカの採食/逃走を通し、捕食者の死骸摂食抜けを修正。③旧SAVE_SCHEMA2/3CPに新種を含むmob保存→復元→死亡とTOP5を回帰。
- **次45分枠**：①`drawCommonAnimal3D/animal`と`WildFauna.draw2D/drawCreature`の13種全姿勢（移動/狩り/潜伏/夜間）の実ブラウザ縦横で形状/衝突を確認。②野良猫の3D模様、シカ/ヘビの見た目とFPS負荷/生態密度11体のGPU負荷を測定し問題のみ最小修正。③最新HEADのPages build/deploy個別jobを確認し、物理Pad/Android実機は未確認なら未確認と記録。新規タスクは作らない。

## 共同スプリント・次担当｜2026/11/02 17:45 JST｜45分枠｜ACTIVE_SPRINT_ID=DEATH-HUNGER-SEQ-V1｜死亡結果のパッド操作復旧
- **開始HEAD→コードHEAD**：`8c3bc56848a6308b3fc6b68717e4d6b6bf18d871` → `3da60da6fabb83322df68b8839e973f1a48a1044`。最新ROADMAP先頭の15分枠のスコア挑戦ID・TOP5保存、死亡2.2秒転倒/音/暗転を維持し、結果画面のゲームパッド操作の断線を修復。
- **実変更**：`neo-wild/gamepad.js` commit `57fef48e3fafd5598a13e6af702868f99de36ece` blob `84b6b886569ebfeb2b492298785650e39e66d913`、`neo-wild/index.html` commit `3da60da6fabb83322df68b8839e973f1a48a1044` blob `c42fa928ea2db36f70e5ab8d4588c2bf5be28828`。ゲーム本体は死亡時 `mode="dying"` → 結果 `mode="over"`（勝利時 `"clear"`）なのにPadは `"result"` しか選択できなかった。実モードを結果UIに対応付け、死亡演出中は全パッド入力を無効化し、結果では×/Aでリトライ/最初から選択、十字で移動、○/Bで最初からへ。死亡中と結果画面のゲームパッド状態HUDは隠し、ボタンのフォーカス輪郭を維持。ゲーム開始・戦闘中の割当て、SAVE_SCHEMA2/3CPは変更なし。
- **動的QA**：現行6 JS全文構文6/6、HTML rev 1、実gamepad.jsの標準パッド模擬で死亡中の入力遮断・結果初期フォーカス・十字移動・A決定・B戻る・勝利画面・生存時の攻撃・押し続け死亡移行・保存非変更の計13件、**20/20 PASS**。DOM/Pad APIは模擬。実Android縦390×844・横800×360、物理Pad、10分ブラウザE2E、実GPU/FPS、結果TOP5の実矩形は**未検証**。
- **Pages**：コードHEAD `3da60da6fabb83322df68b8839e973f1a48a1044` のrun `41415362674` はROADMAP追記競合でcancelled。ROADMAP記録後HEAD `8ef0459f3afd066fbc7b278475b693b9b0a7bd90` の **run `41415368905`：build=success / report-build-status=success / deploy=success（workflow全体success）**。コード変更を含むHEADの公開反映を確認。
- **進捗計測V2（固定配点）**：A **16.0** / B **12.0** / C **9.0** / D **4.0** / E **8.0** / F **9.0** / G **8.0** / H **4.0** / I **4.0** = **74.0/100（前回74.0→74.0、差0.0）**。Fのパッド結果画面修復は既得点の品質改善、実物パッドE2Eは0。Iの実関数統合試験2点とPages run `41415368905` のbuild/deploy成功2点のみ。実ブラウザ10分/Android/物理Pad E2Eは各0で検証待ち。
- **次15分枠（3件）**：(1) `game.js:restoreSnapshot/start/scoreRunIdFromSnapshot`を旧SAVE_SCHEMA2・3CPの実関数経路で連結し挑戦ID・TOP5重複防止を検証。(2) `updateSurvivalNeeds/eat/beginDeath/advanceDeath/finish`の85秒DAY/600秒経時で空腹0→食事→HP0→結果→再開を検証。(3) `spawnMob/maintainLocalWildlife`で通常獲物・巣安全の不足を調査し、プレイ可能な差分だけ実装。
- **次45分枠（3件）**：(1) 実ブラウザ/Android縦390×844・横800×360で2.2秒転倒/フェード/TOP5結果の矩形・タップ・音・FPSを確認。(2) 物理Padで死亡中の入力無効→結果×リトライ・十字→最初から・○タイトルを実測、WebGL/Canvas2D双方確認。(3) 20種強敵の固有攻撃/2D/3D/報酬・保存の種類別動的統合を進め、D条件の未検証を減らす。

## 共同スプリント・次担当｜2026/11/02 17:15枠（17:31-17:36 JST）｜15分枠｜ACTIVE_SPRINT_ID=DEATH-HUNGER-SEQ-V1｜3チェックポイント再挑戦でTOP5を重複占有しない
- **開始HEAD→コードHEAD**：`e406f0f9a5a6d21dd0f4ee8733b954fdb9ff98c6` → `987ce3c068ab3ce0c8574c56d1b1fc6f12e58a12`。ROADMAP先頭の次15分枠、直近45分枠の死亡2.2秒演出/15分枠の飢餓・SAVE_SCHEMA2、Drive正本末尾を確認し重複実装せず継続。前回TOP5を基に保存経路を改善。
- **変更（neo-wild/のみ）**：`game.js` commit `d9fc84b66648745947290e56c1ace94eebe15012` / blob `98ae8ce6ee7a81e2289adaad13e8cd433f6cb443`。`index.html` commit `987ce3c068ab3ce0c8574c56d1b1fc6f12e58a12` / blob `c7ff7d9dc7e6a43444299c0e365b72921e535cba`、game.js rev `20261102-score-lineage-v2`。
- **プレイ上の改善3点**：(1) 新規開始時にスコア挑戦IDを発行し、旧SAVE_SCHEMA=2のままautosave/3CPへ保存、再開/リトライ時に同じIDを復元。旧保存にIDがない場合はチェックポイントの保存時刻・種族・経過時間から安定した互換IDを生成。(2) 同じチェックポイントから死亡を繰り返してもTOP5の枠を複数占有しない。より高得点で終われば同じ1件を更新、同点/低得点ならその挑戦の最高記録を維持。新しいゲームは別の挑戦としてランキングに登録。(3) ゲームオーバーの順位欄に「同じ挑戦の最高記録を維持」を明示。旧最高点の引継ぎ、ハイスコア帯、上位5件、保存失敗表示、デバッグ時記録禁止を維持。
- **動的QA**：実`game.js`関数を模擬DOM/localStorageで実行し、旧最高500点、順位・同一挑戦の同点/低得点/高得点再挑戦、新規挑戦、TOP5上限、ソート、ハイスコア表示、旧CP互換ID、デバッグ保存禁止、壊れたランキング復旧、死亡画面と重複finish抑止、空腹0→食後停止→HP0、SAVE_SCHEMA2保持、全6JS構文 **33/33 PASS**。さらに実`currentSnapshot/saveAuto/recordCheckpoint/getCheckpoints/updateSurvivalNeeds/beginDeath/advanceDeath/finish/recordTopScore`を連結して、CP4回→上限3件・1秒autosave相当→飢餓HP0→死亡1回・音フェード1回→2.2秒後結果→CP再挑戦で高得点に更新・1枠だけ・保存内容維持 **18/18 PASS**。合計 **51/51 PASS**。時間とDOMはモックであり、実ブラウザ10分E2Eや実Android/物理Pad/GPUを試験した意味ではない。
- **Pages**：コードHEAD `987ce3c068ab3ce0c8574c56d1b1fc6f12e58a12` run **41414095462**、ROADMAP記録後HEAD `898a35bea4082028c9948ea5ffc5ed90845d2162` run **41414289313** ともに **build=success / report-build-status=success / deploy=success**。両HEADのPages反映を確認済み。
- **進捗計測V2（配点不変）**：A **16.0** / B **12.0** / C **9.0** / D **4.0** / E **8.0** / F **9.0** / G **8.0** / H **4.0** / I **4.0** = **74.0/100（前回74.0→74.0、差0.0）**。本枠の実関数連携試験2点とPages run 41414289313 のbuild/deploy両success2点を確認。既得点の保存/死亡品質改善なので他項目の新規加点なし。実ブラウザ10分/Android実機/物理パッドは各0点、未検証。
- **次15分枠（3件）**：(1) `restoreSnapshot/start/scoreRunIdFromSnapshot`を旧SAVE_SCHEMA2の自動保存・3CP各経路から実関数で連結し、復元失敗時に旧データを壊さず、同じ挑戦IDが維持されることを検証。(2) `updateSurvivalNeeds/eat/beginDeath/advanceDeath/finish`を本番更新ループ相当の85秒DAY境界・600秒経時で接続し、空腹0→食事→HP0→2.2秒結果→リトライ・TOP5更新を確認。(3) `spawnMob/maintainLocalWildlife/huntWildPrey`で序盤の猫・ヘビ等の普通の動物と地区/年数差の実装範囲を現行AI/2D/3Dと照合。追加時は確定済みの巣安全/強敵20種を壊さず、最小の動的縦実装とする。
- **次45分枠（3件）**：(1) Android縦390×844・横800×360で死亡画面TOP5/ハイスコア/リトライの重なりと選択、2.2秒倒れる姿勢・音/暗転の実操作QA。(2) `webgl3d.js/audio.js/gamepad.js`の転倒/死亡フェード/パッド結果画面の決定・取消を実機で確認し、未実機なら未検証を維持。(3) コードHEADと本ROADMAP追記後の最新HEADのPages build/deploy各jobをrun ID付きで確認し、未成功なら公開済みと報告しない。

## 共同スプリント・次担当｜2026/11/02 16:52 JST｜手動・SCORE上位5位保存とハイスコア表示｜ACTIVE_SPRINT_ID=DEATH-HUNGER-SEQ-V1（継続）
- **対象/前後HEAD**：現行main・本ROADMAP先頭の15/45枠・Drive完成仕様の末尾を照合。開始HEAD `be6cacef8fdadd7b88d70edaa2a98ec4e85ebe91` → 実装済コードHEAD `ebb6d2bab22592e25900c2e8c1c7ee86b2e90a99`。変更先は`neo-wild/`のみ。
- **実際の保存仕様**：従来は`wild-reclaim-best`に単一の最高点だけ保存。今回`wild-reclaim-top5-v1`を追加し、死亡/クリアで今回のスコアを記録し上位5件（点数降順）をlocalStorageへ保持。各行に動物・DAY・狩猟数・LV・得点を付ける。旧最高点が存在すれば「以前の最高記録」としてTOP5へ移行。既存最高点キーも引き続き更新、SAVE_SCHEMA2・3CP・autosave内容は変更しない。デバッグ通しテスト中のスコアは保存しない。通信や他端末との同期は行わない。
- **表示**：死亡画面/クリア画面に「歴代TOP5（この端末）」を表示し、今回の順位をハイライト。現在の得点が従来の自己最高点を**超えた場合だけ**「ハイスコア！」の大きな表示。順位外ならランキング維持、ブラウザ保存が失敗した場合は失敗を明示。小画面でも結果画面を縦スクロールでき、リトライ/最初からのボタンを保持。
- **変更ファイル/commit/blob**：`game.js` commit `93d2e1417bb0b3f9983f953dcdb894586514f778` / blob `00a929c380dab338e309e79a0a74ff6a77771c7d`（loadTopScores/recordTopScore/renderTopScoresとfinish）。`index.html` commit `15cb3048b7a356d7e907fc9a9df1110dd9975d51` / blob `85847b679cfa260351815b9c2e9a3b25a7754475`（UIとgame.js/visual.css rev v1）。`visual.css` commit `ebb6d2bab22592e25900c2e8c1c7ee86b2e90a99` / blob `9402be3857f8a8d67c8b0cb0eee7683201333837`。
- **現行コード動的QA（23/23 PASS）**：実`game.js`から3つのスコア関数と`finish`を抽出し実行、旧単一最高500点の移行、低得点2位、新最高700点、同点ではハイスコア非表示、保存5件上限と順位ソート、ハイスコアの帯/新記録行の表示、デバッグ通しテスト時の保存禁止、再ロード・破損JSONの復帰、死亡結果画面の描画/重複finishで重複登録なし、JS本体6/6構文、HTMLの結果要素とキャッシュ、CSSレイアウトを検証。模擬DOM+localStorageによるテストでありAndroid/実ブラウザ10分/物理pad/実GPU・縦横矩形は未試験。
- **Pages**：コードHEAD `ebb6d2bab22592e25900c2e8c1c7ee86b2e90a99` の`pages build and deployment` run `41408826481`：**build=success / report-build-status=success / deploy=success**。本ROADMAP追記commit後のHEADは別run確認が必要。
- **進捗V2・固定100点**：A16.0 / B12.0 / C9.0 / D4.0 / E8.0 / F9.0 / G8.0 / H4.0 / I4.0 = **74.0/100（前回74.0→74.0、差0.0）**。既存生存/セーブ項目を強化したが規定の新たな完成条件は満たしていないため加点しない。実ブラウザ10分・Android・物理PadのE2Eは各0で検証待ち。
- **次15分枠（3件）**：①`game.js:finish/recordTopScore`と旧SAVE_SCHEMA2/3CP復帰を連結して同じチェックポイントから死亡を繰り返した時の記録/ランキング挙動を検証。②空腹0→食事→HP0→死亡画面→順位保存→リトライの実関数通し試験。③20種強敵の討伐報酬と得点計算・保存を種類別に検証し未完成を修正。
- **次45分枠（3件）**：①Android縦390×844/横800×360の死亡画面でTOP5・ハイスコア・リトライの視認性と重なりの実測。②gamepadでゲームオーバー画面のランキング閲覧・リトライ/タイトル選択、死亡2.2秒前後の入力無効を確認。③最新HEADのPages build+deploy両successを確認し、実ブラウザ10分E2E・WebGL/Canvas2Dの表示とFPSを検証。

## 共同スプリント・次担当｜2026/11/02 16:15枠（16:22 JST着手）｜15分枠｜ACTIVE_SPRINT_ID=DEATH-HUNGER-SEQ-V1｜飢餓中の日替わり回復防止・旧保存復帰の安全化
- **開始→コードHEAD**：`999ff23811faf364a27806e0362e96792acc9f22` → `d47cedd2d8b259e17a9ab6d1ae12a572fb23092f`。前45分枠の2D転倒/2.2秒フェード・前15分枠の空腹0のHP減少/3CPとDrive設計正本末尾を確認。既存の6巣/20強敵/ゲームパッドタイトル操作/夜目/4段階教程を再実装せず維持。
- **実変更（neo-wild/のみ）**：`game.js` commit `388b3f42ab7dbbad5c8deafc649a3442e37e46b7` / blob `56478481512f5688d73d8beac03114e66d457512`、`index.html` commit `d47cedd2d8b259e17a9ab6d1ae12a572fb23092f` / blob `01dec46c21948b6d26ec26a010b9b0383b0c6fea`、JS rev `20261102-starve-day-legacy-v11`。
- **遊びに直結する修正2点**：(1) DAY切替時の自動HP+18は**空腹0またはHP0では発動しない**。飢餓で減るHPが日替わりの無料回復で戻る不整合と死亡直前の不意の回復を除去。食べて空腹がある生存者の日替わり回復は従来どおり。(2) 旧SAVE_SCHEMA2の`player.hunger`欠落/null/空文字は満腹100として安全に復元。明示的な空腹0は0のまま保存・復元し、旧猫速度の1回移行/巣備蓄も維持。
- **現行ソースの動的QA**：`updateSurvivalNeeds/eat/currentSnapshot/saveAuto/getCheckpoints/recordCheckpoint/beginDeath/advanceDeath/finish`を依存スタブで実行、**600秒相当の0.1秒刻み生存+実eat23回**、空腹0の10秒HP-24、食後停止、日替わりHP、旧空腹値、3CP上限、死亡中のautosave消去/二重死亡/2.2秒結果/音1回 **23/23 PASS**。`initializeDenSites/denAtActor/denThreatNearby/carryFood/upgradeDen`は代表的な障害物なし模擬地形で地上5+屋上1・地上から屋上アクセス不可・屋上肉備蓄60pt→LV2・飛行敵のみ屋上警戒 **13/13 PASS**。`restoreSnapshot/isValidSnapshot/getCheckpoints`実関数は旧SAVE_SCHEMA2空腹0/欠落/null/空文字、猫速度再復元、備蓄非二重加算、3CPそれぞれ復帰 **11/11 PASS**。現行6JS全文構文 **6/6 PASS**。合計**53/53 PASS**。600秒は**実関数の模擬時間**でありブラウザ10分E2Eではない。模擬地形6巣は本番ワールド実アクセスの代用にしない。
- **Pages**：コードHEAD `d47cedd2d8b259e17a9ab6d1ae12a572fb23092f` のworkflow run **41406195043**：build=success / report-build-status=success / deploy=success。ゲームコード配信確認済み。本ROADMAP記録commitのHEADは別途run確認が必要。
- **進捗計測V2・100点固定**：A **16.0**（game.js生存/死亡/狩猟と今回23動的）、B **12.0**（game.js 6巣・備蓄既存統合QA + 今回13模擬）、C **9.0**（既存AI/天候試験、全エリア統合は検証待ち）、D **4.0**（20強敵の登録20×0.2、固有AI/外見/討伐保存の種類別証拠待ち）、E **8.0**（20素材能力/保存の既存動的QA継承）、F **9.0**（操作/Pad模擬QA継承、実HUD矩形未試験）、G **8.0**（SAVE_SCHEMA2・3CP・autosave、今回23+11実関数QA）、H **4.0**（2D/WebGL/夜景の既存描画QA、実FPS未試験）、I **4.0**（実関数連携2+対象コードHEADのPages run 41406195043でbuild/deploy両成功2、ブラウザ10分/Android/物理Pad各0）。**合計74.0/100、前回実績74.0→74.0（差0.0）**。前45分枠ROADMAP記載72.0はその時点でPages未確認だったため。開始HEAD `999ff238` のPages run `41402680213` は後にbuild/deploy両successを確認済みで開始時実績74.0と再評価。今回修正は既得点のA/G内で新規加点なし。
- **未検証**：実ブラウザ10分以上E2E、Android実端末の起動/縦横/死亡、物理ゲームパッド、WebGL実GPU/FPS、縦横HUD矩形、本番ワールド6巣の全経路アクセスは未試験。実端末での動作保証と混同しない。
- **次15分枠3件**：(1) `initializeDenSites/denAtActor/recoverPlayerFromGap`を本番生成ワールドの6巣（屋上1）で実経路移動・地上/屋上備蓄・LV2・3CP復帰まで動的連結し、不可達巣があれば局所修正。(2) `updateSurvivalNeeds/update/restoreSnapshot`で日替わり85秒境界・食事・HP0→死亡→CP復帰の600秒経時テストをさらに本番ゲームループへ接続。(3) `spawnMob/denThreatNearby`の巣265m通常敵湧き抑制・NPC自然侵入・夜間潜伏を連結し、問題があれば最小差分修正。
- **次45分枠3件**：(1) Android縦390×844/横800×360でタイトル操作・開始・食事・HP0→2.2秒転倒→リトライの実画面/実音QA。(2) `webgl3d.js/audio.js/gamepad.js`の転倒接地/音フェード/ゲームパッドメニュー決定・取消を実機で検証、未実機なら明示。(3) 現HEADのPages build/deployをrun ID付き確認し、20強敵の固有攻撃/描画/素材保存を種類別動的テスト、Dの根拠を整備。

## 共同スプリント・次担当｜2026/11/02 15:50 JST｜45分枠｜ACTIVE_SPRINT_ID=DEATH-HUNGER-SEQ-V1｜死亡時の戦闘姿勢停止・2D転倒の可視性改善
- **競合照合**：開始時main HEAD `887fbea71144b6c92a7b407012759e729d29dc45`。直近15分枠の飢餓HP減少/旧セーブ保護・前45分枠の2.2秒死亡と暗転・ROADMAP先頭・Drive「WILD RECLAIM｜完成仕様設計書」末尾を照合。既存20強敵/6巣/猫速度/3CP/旧SAVE_SCHEMA2/Pad/夜目を重複実装せず維持。
- **実装済コード**：`neo-wild/game.js` commit `e2421124a05dccc2d93687a2aef9286cfe8f0b3e` / blob `60862420423795ad5bacc04f89184841ef7adfc5`、`neo-wild/index.html` commit `bd8f3d5ac8b4ee333787838ec95e3ea8fee510e1` / blob `ecff47568b40616a295a37c477b934fee13ec48f`、JS cache rev `20261102-death-pose-cleanup-v10`。変更はneo-wild/のみ。
- **プレイ改善3点**：(1) HP0の死亡開始で攻撃モーション・ダッシュ・ラッシュ・ジャンプ/能力ポーズを停止し、倒れながら攻撃し続ける表示を防止。(2) Canvas2Dの倒れる回転角を0.60→1.08rad、接地方向への移動と圧縮を調整。WebGLの既存1.23rad転倒と同期しやすい姿勢へ。(3) 死亡中/結果表示で口にくわえた食料が浮いて見える2D描画とダッシュ残光を抑止。生前の食料・操作・セーブの挙動は変更なし。
- **動的QA**：最新6JS全文構文6/6 PASS。現行 `beginDeath/advanceDeath` の0.325秒半転倒、0.65秒転倒完了、2.2秒結果、重複死亡/重複音/保存削除を抑止1組PASS。現行 `drawCreature` をCanvas2D APIモックで最後まで実行し回転1.08rad/縮尺0.57を検査1組PASS。死後の食料・ダッシュ表示条件1組PASS。現行 `updateSurvivalNeeds` を0%空腹10秒→HP50→26、食後10秒→HP26維持、再空腹20秒→HP0で実行1組PASS。現行 `webgl3d.js:collapseVertex` の接地/有限値1組PASS。現行 `audio.js:fadeForDeath/resetDeathFade` の1回フェード/復帰1組PASS。**今回追加検査計12/12 PASS（6構文＋6動的組）**。前15分枠43/43・前45分枠46/46は過去の別HEADの証拠であり、今回の実ブラウザ試験に読み替えない。
- **未試験**：実ブラウザ10分E2E、Android縦390×844/横800×360の実タップ、実GPU/FPS、実物ゲームパッド、旧SAVE_SCHEMA2/3CPの実端末復帰、HUD実矩形は未実施。上記Canvas/WebGL/音はV8隔離依存スタブ/実関数検査であり実端末の視聴覚品質は未保証。
- **Pages**：コードHEAD `bd8f3d5ac8b4ee333787838ec95e3ea8fee510e1` のworkflow run ID取得不可（commit workflow取得0件・combined status0件、公開Actionsページ取得不可）。build=未確認、deploy=未確認。**公開反映済みと判定しない**。ROADMAP記録後の最終HEADも別途配信確認が必要。
- **進捗計測V2（固定100点）**：A **16.0**（生存・狩猟・死亡再開の前枠実関数QA継承）、B **12.0**（6巣・備蓄の前枠証拠）、C **9.0**（季節/橋/河川/エリア連結の実機未検証）、D **4.0**（20強敵の登録のみ証拠化、固有AI/外見/戦闘統合は種類別検証待ち）、E **8.0**（20種能力の前枠動的QA継承）、F **9.0**（UI/Padの前枠模擬QA継承、実機縦横HUD検証待ち）、G **8.0**（SAVE_SCHEMA2/3CPの前15分枠動的QA継承）、H **4.0**（2D/3D描画と月光/草、実FPS検証待ち）、I **2.0**（実関数統合試験2、ブラウザ10分/Android/物理Pad/対象HEAD Pagesは0）。**合計72.0/100、前回共同ROADMAP74.0→72.0（-2.0）**。今回の2D死亡姿勢改善は既得点のA/H条件内で新加点なし。IのPages+2点は前回コードHEAD `6b486c27` の成功run `41399242833` を現HEADへ流用できないため検証待ちに戻す。
- **次15分枠3件**：(1) `restoreSnapshot/currentSnapshot/updateSurvivalNeeds` を旧SAVE_SCHEMA2・空腹0・食事直後・3CP各状態から10分相当の実関数経時試験、二重報酬/HP回復なしを検証。(2) `saveAuto/beginDeath/finish` で死亡中・結果・リトライ・最初からの保存競合と教程一度限りを連結動的試験。(3) `denAtActor/denThreatNearby/upgradeDen` の6巣（屋上含む）備蓄→LV2→保存復帰・NPC湧き抑制を統合QAし、修復が必要なら最新HEAD最小差分。
- **次45分枠3件**：(1) Android実ブラウザの縦390×844・横800×360/844×390で起動→食事→HP0→2.2秒転倒→結果→リトライ、音フェード・2D/WebGL・HUD矩形・FPSを実測。できなければ未試験を維持。(2) `spawnStrongBoss/applyStrongStrikeEffect/kill/strongTrophies` と `drawStrongCreature2D/drawStrongAnimal3D` の20種別固有戦闘・希少素材/能力/保存を実関数で縦結合し、証拠のあるD条件だけ加点。(3) 最新コードHEADとROADMAP HEADのPages run IDを取得しbuild/deploy両successを確認。取得不能なら公開未確認のまま次枠へ引継ぎ。

## 共同スプリント｜2026-11-02 15時台 JST｜ゲームパッド・タイトル操作｜ACTIVE_SPRINT_ID=DEATH-HUNGER-SEQ-V1
- 開始HEAD 4353013f → コードHEAD 887fbea7。現行main/ROADMAP両枠/Drive仕様末尾を確認。既存飢餓・死亡演出・セーブ・教程・強敵20種に変更なし。
- gamepad.js commits 88a2c821, abf6fae5 / blob 2ce031cec1b66353d0b5944e7a84b90c25f38037：メニューの十字/左スティック上下、左右で動物/縦横/出発地点、PS×/Xbox A決定、PS○/Xbox B取消。押し続けで360ms後155ms間隔反復。PLAYの既存入力と即旋回を維持。
- index.html commits 0d1d8dc3, 887fbea7 / blob 143701a255572ab633ffee308ca61fa29479de0a：パッド接続時の操作説明と現在の選択項目表示、JS/CSS rev更新。visual.css commit a01649c2 / blob 39adfc1adfb58d43b0b24c4a0bd2d831913bbdcb：選択候補の水色の太い輪郭、スクロール可能な説明枠。
- QA：本番gamepad.js模擬Gamepad APIとDOM 21/21 PASS（タイトル、十字、スティック、左右、決定/取消、出発地編集、開始、PLAY即移動、メニュー復帰）。現行6 JS構文6/6 PASS、HTML/CSS/参照検査9/9 PASS、合計36/36。実Android/物理pad/ブラウザ10分E2E/縦横DOM実測/実GPUは未検証。
- Pages：コードHEAD 887fbea71144b6c92a7b407012759e729d29dc45、run 41402170284、build/deploy/report-build-status全success。ROADMAP追記後HEADについては別途確認。
- V2：A16.0 B12.0 C9.0 D4.0 E8.0 F9.0 G8.0 H4.0 I4.0 合計74.0/100、前回74.0→74.0、差0.0。物理Pad全操作は検証待ち。既定配点変更なし。
- 次15分枠：①gamepad.js→WildGamepadBridge→game.jsタイトル開始と操作の動的結合。②3チェックポイント選択/取消/旧SAVE_SCHEMA2復元。③飢餓0/食事→死亡演出→結果→ゲームパッドでリトライを動的回帰。
- 次45分枠：①実Android/物理Padで縦横画面のタイトル操作・フォーカス枠・表示重なり・DOM矩形を実測。②pause/guide/inventory/map/result/upgradeのPad決定/取消を実操作。③Stick保持反復/Pad切断・死亡2.2秒中入力無効とPages各jobを確認。

## 共同スプリント・次担当｜2026/11/02 15:21 JST｜15分枠｜ACTIVE_SPRINT_ID=DEATH-HUNGER-SEQ-V1｜食事で飢餓停止・起動とリトライの保存保護
- **基準/競合照合**：開始main HEAD `e1484374ca2181bbd8a8fffb3183fe76636e3fd0`。前45分枠（死亡2.2秒・開始地点救済）と前15分枠（飢餓・二重死亡・3CP）の履歴、Drive「WILD RECLAIM｜完成仕様設計書」末尾を確認。最新mainの既存6巣・20強敵・夜目・SAVE_SCHEMA2・縦横/ゲームパッドを再実装せず維持。今回のゲームコード終了HEAD `6b486c277fc61bff218531e61d3e4925b2d9f9e6`。
- **実コード/コミット**：`neo-wild/game.js` `5b4ff5765529b5552217d7109e39ad0ec4b12ced` / blob `1f197fe466605d4c25dba931f9ff5385a9777938`、`neo-wild/index.html` `6b486c277fc61bff218531e61d3e4925b2d9f9e6` / blob `74bbae01c72f6eb0a704d6d1f4500a915bf1aebb`。変更はneo-wild/内だけ。JS rev `20261102-hunger-zero-safe-retry-v9`。
- **実プレイ改善3点**：(1) HP減少を空腹が厳密に0に達した後の経過時間分だけに変更。従来の空腹1〜16%で生命が減る挙動を除去し、少量でも食べれば飢餓HPダメージが止まる。空腹0の生命-2.4/秒と巣の食事後回復は維持。(2) 新規開始の確認後、旧自動保存を開始前に消さず、成功時だけ新しいSAVE_SCHEMA2を即保存。世界初期化失敗時の旧データ消失、連続タップによる二重開始を防止。(3) 続きから/3CP選択を共通の失敗通知経路に統一し、チェックポイントの復帰失敗時に勝手に新規ゲームを始めない。CPなしの死亡リトライは新規開始成功時に即保存。死亡姿勢・2.2秒暗転・音フェードは45分枠実装を維持。
- **動的QA**：現行の実 `updateSurvivalNeeds` を実行し、空腹0の10秒減少、HP0判定、空腹15%/食後1%で減少なし、空腹境界の途中フレーム、巣の飢餓中回復禁止・食後回復・敵接近時回復停止等 **14/14 PASS**（ゲーム全文構文を含む）。実クリックハンドラ抽出で開始キャンセル・失敗時旧セーブ保護・成功時1回保存・連続タップ・CPあり/なしリトライ等 **9/9 PASS**。実 `beginDeath/advanceDeath/finish` の死亡1回、音フェード1回、0.5秒倒れ、2.2秒結果、再入防止 **8/8 PASS**。旧SAVE_SCHEMA2の空腹フィールド欠落/空腹0、死亡セーブ拒否、CP3件上限と順序 **6/6 PASS**。現行6JS全文構文 **6/6 PASS**。合計 **43/43 PASS**。これらは実関数を隔離DOM/依存スタブで動的実行した範囲であり、実ブラウザ10分E2E・Android実機・物理パッド・実GPU・HUD実矩形は**未試験**。
- **Pages配信**：コードHEAD `6b486c277fc61bff218531e61d3e4925b2d9f9e6` に対する `pages build and deployment` run **41399242833**：build=success / report-build-status=success / deploy=success。これより後の本ROADMAP記録commitは別HEADなので、そのHEADのPagesは別途照合する。前HEADの成功を最終HEADの成功と取り違えない。
- **進捗計測V2（共通・100点固定）**：A **16.0**（基本生存：game.js・死亡/飢餓実関数8+14 PASS、既存狩猟/成長QA）、B **12.0**（6巣・備蓄：既存9209b4fbと前回動的QA継承）、C **9.0**（生態：前回動的QA継承、季節/エリア完全統合は検証待ち）、D **4.0**（20強敵×登録0.2、固有AI/外見/戦闘の種類別完了は検証待ち）、E **8.0**（20種素材消費/能力効果/重複防止/保存の既存実装と前回検証を継承）、F **9.0**（操作・HUD：前回模擬QA継承、物理パッド/実画面矩形は検証待ち）、G **8.0**（SAVE_SCHEMA2/3CP/自動保存・復帰：今回6件と前15分枠の詳細動的QA）、H **4.0**（2D/3Dと夜間表現：前45分枠の模擬描画QA継承、実GPU/FPSは検証待ち）、I **4.0**（実関数連携QAとコードHEADのPages build/deploy run 41399242833、10分ブラウザ・Android・物理パッドE2Eは各0）。**合計74.0/100**。前回共同ROADMAP **72.0→74.0（+2.0）**、前15分枠報告74.0比 **差0.0**。増分は今回コードHEADのPages成功が確認できたIの+2のみ。作業量・構文だけで加点していない。本ROADMAP記録後の最終HEADのPages未確認ならIの2点は配信検証待ちとして再評価する。
- **次45分枠（優先3件）**：(1) Android縦390×844/横800×360の開始CTA・縦横選択・再開とロード監視を実タップし、失敗時は表示文面/例外を採取。(2) `advanceDeath` と `drawScene`/WebAudioで2.2秒の倒れ・暗転・音減衰・結果背景を実画面/実音で確認し、必要箇所のみ修正。(3) 最終HEADのPages build/deploy各successと実ブラウザ10分/FPSを検証、未実施は未実施と記録。
- **次15分枠（優先3件）**：(1) `restoreSnapshot` と `updateSurvivalNeeds` で旧SAVE_SCHEMA2空腹0・食事直後・3CPからの復帰を10分相当の経時テストで検証。(2) 巣6地点の地上/屋上で備蓄→LV2→保存→再開、NPCの巣内新規湧き禁止/移動侵入を統合動的検証。(3) 未完の強敵固有AI・食物連鎖の実プレイ経路を45分枠と重複せず完成し、次担当へ具体的関数を引き継ぐ。

## 共同スプリント・次担当｜2026/11/02 JST｜Android開始無反応・縦横選択の明瞭化｜ACTIVE_SPRINT_ID=DEATH-HUNGER-SEQ-V1（維持）
- **新しいユーザー動画**：11.2秒、Android縦1080×2400。タイトルの「最初からプレイ」を複数回タップしても画面が切り替わらない。HTMLの初期文面「設定を選んで開始」が残り、縦横の選択もどちらが選ばれているか判別しにくい。撮影動画は修正前の症状であり、修正後の実機検証ではない。
- **開始HEAD**：前45分枠のコードHEAD `ea0d33ccd590044d95d0a81cb15ea3c57cbcad23`（当時のROADMAP先頭に動的40件PASS記載）。今回のコード終了HEAD `22698572330c373cda459953951972bf8d3b8838`、本ROADMAP記録後は別HEAD。
- **変更**：`neo-wild/game.js` commit `99601c4c0df190aaf39d329026141b145ee47d10`／blob `98141d74d7f94c9b91b8db7c09de96228f87a4ca`。`neo-wild/index.html` commits `08a20c77aaa1a52c73b855f1b3b2d962ada3d614` / `22698572330c373cda459953951972bf8d3b8838`（最終blob `a46690b898931605c7cc197fdd47479df1a0c9a8`）。`neo-wild/visual.css` `6a93bd24cf972fa2d884e29e25a3673e0e2a1361`／blob `fac638612c940d39a111a1ef99ad1da26cdec1cb`。他ゲーム／他リポジトリ／他タスク変更なし。
- **改善点**：(1) ワールド/巣の重い初期化 `generateWorld/initializeDenSites/ensureDenCover` を、タイトルのイベントハンドラ登録より前から`start()`直前の `ensureWorldReady`へ移動。初期化例外はログとメニュー画面内のエラーで通知し、無反応を避ける。(2) `start()`でタイトルを閉じてから音源生成開始、スムーズな画面遷移。新規／続き・旧セーブは共通 `launchGame()` を経由し、再開失敗時の無言returnを除去。`WildGameReady`起動完了フラグとHTML側ロード監視を追加。JS未読込なら開始ボタンを「再読み込みしてプレイ」に変えてクリックを有効にする。(3) 縦横選択に金枠・明るい緑背景・「✓ 選択中」バッジ・選択状態文字列を固定表示。ゲームコードが読まれなくてもHTML側の独立UIだけは選択が反応する。aria-pressed同期。縦横以外、死亡2.2秒、巣/草、SAVE_SCHEMA2、3CP、四段階教程は維持。
- **QA（確認範囲）**：GitHub現行mainの7実ファイル（HTMLのインライン起動 + audio.js + webgl3d.js + game.js + gamepad.js + season-clouds.js + debug-mode.js）を実際のHTMLのID 137件で構築したDOM/Canvas/2D/WebGL非対応モック環境に順次ロード **7/7 PASS**、`WildGameReady=true`。横選択→`✓ 選択中：横画面`、縦選択→`✓ 選択中：縦画面`、aria-pressed連動 **2/2 PASS**。最初から→小型教程でゲーム停止→「わかった」→通常プレイ→メニューへ→セーブの続きから→通常プレイ **5操作PASS**。ゲーム未読込の独立ロード監視→文面切替→「再読み込みしてプレイ」ボタン動作 **4/4 PASS**。HTML/JS構文、cache rev(`game.js ...v8`, `visual.css ...v7`) PASS。これらは**隔離DOM/V8模擬試験であり、実Android実機起動・WebGL実機FPS・Chrome10分E2E・UI実矩形検査ではない**。動画そのものでは修正後の成功は確認できない。
- **Pages**：現コードHEAD `22698572330c373cda459953951972bf8d3b8838` のbuild/deploy両success・run IDとも未確認。GitHub connectorのworkflow commit参照はPR run限定、公開Actionsページも取得不可。前回別HEADのrun IDを流用しない。**配信済み／Android復旧済みと断定しない**。
- **進捗計測V2暫定**：A16.0 / B12.0 / C9.0 / D4.0 / E8.0 / F9.0 / G8.0 / H4.0 / I2.0 ＝ **72.0/100**（前回72.0→72.0／差0.0）。旧採点からの暫定引継ぎ。Android実機で直前の起動不能が再現しており、**本端末での回復を実証するまでは完成と見なさず、加点なし**。最新mainのPages成功確認でIを再採点。
- **次15分枠**：(1) 最新main `launchGame/start/ensureWorldReady/restoreSnapshot`の新規/旧SAVE_SCHEMA2/3CP/再開の動的組合せQA（プレイ開始可・失敗時に理由表示）。(2) 始動後の自動保存・教程4段階・飢餓→HP0→死亡2.2秒→リトライ/セーブ復帰。 (3) 他枠の新しいHEADとロード監視・独立縦横UIを競合せず維持。
- **次45分枠**：(1) Android実機縦390×844/横800×360で開始CTA・縦横の実タップとDOMの`getBoundingClientRect`、コンソール例外を特定（読み込み失敗ならオンスクリーン文面を回収）。(2) `Wild3D`正常/失敗/Canvas2D退避の実ブラウザ起動とWebAudio初期化遅延・FPS実測。(3) 対象HEADのPages build/deploy両successをrun ID付きで確認し、実機で10分遊べたときだけ再評価。残りの強敵/草/巣は起動復旧の確認後に継続。

## 共同スプリント・次担当｜2026/11/02 14:45 JST｜45分枠｜ACTIVE_SPRINT_ID=DEATH-HUNGER-SEQ-V1｜起動・安全開始と死亡暗転の実統合修復
- **開始/終了**：開始HEAD `223268391f86b50daa2e2426399336d1bfa90fdd`（前45分の起動不能修復 `ef671803` + HTML rev `7cca79e` + 直前ROADMAP）。ゲームコード終了HEAD `ea0d33ccd590044d95d0a81cb15ea3c57cbcad23`。前15分枠の飢餓/セーブ・4段階小型チュートリアル・強敵20種・巣6個を上書きせず継承。Drive「WILD RECLAIM｜完成仕様設計書」末尾も照合、確定仕様の変更なし。
- **コード変更**：`neo-wild/game.js` commit `3e7d2fca28338e1977a80fa696954b570f1c3a7a` / blob `1798b4bd07d4be96b495f4ec84ad4727b24e8d8c`、`neo-wild/index.html` commit `ea0d33ccd590044d95d0a81cb15ea3c57cbcad23` / blob `fac5234d30ac3789d5393be7fb48260c3b734a8f`、cache rev `20261102-death-result-spawn-recovery-v3`。neo-wild/以外変更なし。
- **実プレイ改善3点**：(1) 新規開始時の地形・建物が生成済みの状態で、出発地点が川/運河に重なっていれば `nearestDryBank` で陸地へ補正。(2) 出発地点が建物壁/狭い隙間に重なっていれば `recoverPlayerFromGap(P)` で合法な近傍へ復帰し、カメラ・NPC初期配置より前に適用。旧セーブ復元時の既存救済処理は維持。(3) 死亡2.2秒の暗転が完了した瞬間に `mode=over` へ変わると黒幕が消え、結果モーダルの背後が急に明るくなる点を修正。結果画面が表示されている間は黒い背景を維持し、リトライ/新規開始で通常描画に戻る。死亡姿勢0.65秒・音フェード・HP0のみ死亡・二重処理防止・1秒自動保存/3CPを維持。
- **実関数動的QA**：現行`game.js`全文 + 5補助JS構文 **6/6 PASS**。現行`game.js`全体を起動し、実イベントハンドラ・`update`・`advanceDeath`・`drawScene`・`start`・`recoverPlayerFromGap`・`saveAuto`・`WildDebugBridge` を模擬DOM/Canvas/WebGLスタブで実行。縦390×844のCanvas2D、横800×360のWebGL戻り値スタブ、生成済み建物内部を出発地点に強制したCanvas2Dの3系統、**動的40/40 PASS**。各系統で「メニュー→新規開始→初回教程→確認→操作可能→空腹0でHPが徐々に減る→HP0死亡→音フェード1回→2.2秒結果→結果背後黒幕持続→リトライ→音復帰→SAVE_SCHEMA2再保存」を確認。建物内強制開始は近傍の合法位置へ救済PASS。JS全体+補助の合計 **46/46 PASS**。既存15分枠のCP3件/旧セーブの詳細QAは直前の `c3570278` / `1d2bc871` の動的試験を継承し、今回は実機CP再開未検証。
- **未試験と配信**：上記は実関数を使用した模擬DOM/Canvas/WebGLであり、**実ブラウザ10分E2E、Android端末、物理パッド、実GPU WebGL、実画面の縦横HUD矩形・FPSは未検証**。対象コードHEAD `ea0d33cc` のGitHub Actions build/deploy両success **未確認**。commit workflow connectorはPR run限定で0件、combined statusも0件、公開Actions/REST一覧は取得できず、**Pages run ID不明・build=未確認・deploy=未確認**。配信済みとは報告しない。過去の別HEAD run `41392810895` 等は流用しない。
- **進捗計測V2・基準HEAD `ea0d33cc`**：A **16.0/16**（4条件×4：入力/狩猟食事/死亡再開/継続。game.js実関数今回QAと過去QA）、B **12.0/12**（6巣・運搬備蓄・休息・2D3D草、前枠の6巣/草実関数証拠維持）、C **9.0/12**（NPC警戒/食物連鎖/昼夜天候睡眠、地区・橋・川の連続実機QA未達）、D **4.0/16**（20種登録×0.2=4.0、各種固有AI/2D3D/討伐報酬保存の種類別統合証拠未確認分は0）、E **8.0/8**（20希少素材の固有効果/消費保存の前枠動的試験証拠継承）、F **9.0/12**（タッチ即方向・パッドAPI模擬・教程/地図、縦横実HUD矩形未確認）、G **8.0/8**（1秒保存・SAVE_SCHEMA2・3CP・復帰二重加算なし、前15分枠の実関数試験）、H **4.0/6**（WebGL/Canvas2D経路と月光/草、実FPS・端末当たり判定/サイズ未検証）、I **2.0/10**（実関数統合試験2点、ブラウザ10分/Android/物理Pad/現HEAD Pages build+deploy各0）。**合計72.0/100、前回72.0→72.0、差0.0**。起動復旧・死亡暗転の品質改善は既存A/F条件内、現HEAD Pages成功証拠なしのため加点なし。証拠不足条件は0点、次枠で再評価。
- **次15分枠①**：`game.js:restoreSnapshot/currentSnapshot/recoverPlayerFromGap` を旧SAVE_SCHEMA2・水中位置・建物内部位置・3チェックポイント（同種優先）で実関数経時試験し、復帰→合法位置→保存→再開の二重加算0を検証、必要なら最小修正。
- **次15分枠②**：`game.js:updateSurvivalNeeds/eat/eatFromDen/beginDeath` で空腹0・出血・肉/草摂食を実フレーム連結し、HP0前の摂食で飢餓停止、死亡後の行動/保存拒否を試験。
- **次15分枠③**：`game.js:openTutorial/advanceMission/restoreSnapshot` の4段階「食事→潜伏→狩猟→備蓄」を新規→死亡→CP→新規で1回限り表示、Pad確認/初回終了まで通し、既読再表示を修復。
- **次45分枠①**：実ブラウザ縦390×844・横800×360/844×390で初回起動→教程→移動→空腹0→2.2秒死亡→結果→リトライ、Canvas2D/実WebGLの転倒0.65秒と黒幕・音・画面の瞬間的な明転ゼロ、HUD実矩形/FPSを確認。
- **次45分枠②**：`game.js:spawnStrongBoss/applyStrongStrikeEffect/kill/strongTrophies` と `webgl3d.js:drawStrongAnimal3D`、`game.js:drawStrongCreature2D` を20種別に出現→固有攻撃→討伐→希少素材→継承→SAVE_SCHEMA2復元まで実結合し、Dの固有条件を種類別に証拠化。巨大ムカデ禁止、ステージ20%・同時1体、alpha速度231.4維持。
- **次45分枠③**：対象HEAD `ea0d33cc` および本ROADMAP記録後のHEADに紐づくPages Actions run IDを取得、build/report/deploy各jobを確認。取得不可なら未確認のまま、他ゲームやルート設定を編集せず継続。

## 共同スプリント・次担当｜2026/11/02 JST｜起動不能を緊急修復｜ACTIVE_SPRINT_ID=DEATH-HUNGER-SEQ-V1（維持）
- **障害**：直前の建物隙間対策 commit `7ed869c0` で `collides` に `actor===P&&(actor.jumpHeight||0)<18` を追加したが、ワールド生成時 `P===null` かつ省略時 `actor===null` なので条件前半が真となり、`actor.jumpHeight` 参照で TypeError、タイトルのワールド初期化が中断。ユーザーから「プレイ開始できなくなった」と報告。
- **修正**：`neo-wild/game.js` commit `ef671803dc19b41c1394bcdcb82cfcedb6c9c7d7` / blob `d8aa0942613e22ab28e3c7ad10fcc5a4b884d4ec`、`actor&&actor===P` ガード追加。`neo-wild/index.html` commit `7cca79e01cd29f14b85a4e256beab6dc5dca847b` / cache rev `20261102-startup-crash-fix-v2`。既存の狭隙間禁止・救済と死亡2.2秒処理、チュートリアル、旧SAVE_SCHEMA2に触れず復旧。コード終了 HEAD `7cca79e01cd29f14b85a4e256beab6dc5dca847b`、ROADMAP記録後 HEADは本コミット。
- **検証**：本番`collides`を実行し `P=null/actor=null`、P存在/actor=null、狭い隙間actor=P、通常通路actor=P **4/4 PASS**。本番`game.js`全文構文PASS。全game.jsを模擬DOM/Canvasで実行し初期化・ワールド生成・ボタン登録PASS、「続きから（セーブなし）」→教程画面・「新規開始」→playモード **2/2 PASS**。**模擬DOM検証であり実Android/実ブラウザ10分E2E・Pages対象HEAD build/deployは未確認**。模擬DOM `parentElement` 不備で出た試験自体のエラーはモック補完後解消。
- **進捗V2**：A16.0/B12.0/C9.0/D4.0/E8.0/F9.0/G8.0/H4.0/I2.0＝**72.0/100、前回72.0→72.0、差0.0**。起動不能復旧だが既存達成条件の修復のみ、Pages対象HEAD成功未確認で加点なし。
- **次15分枠**：(1) `collides`のP未生成時に引き続きnull参照がないか起動→新規→save/restoreの実関数を連結。(2) `recoverPlayerFromGap`が旧セーブのスタックだけ救出し、正常位置を変えないか検証。(3) 死亡2.2秒・HP0→結果→3CP復帰と初回教程済み判定を回帰。
- **次45分枠**：(1) 実Android縦横のタイトル→最初から/続きからをタップして起動確認、ワールド生成時のコンソールエラーなし。(2) 実WebGL/Canvas2D両描画で狭路・壁/河川・屋上の移動、FPS/画面矩形を実測。(3) このコードHEAD以降のPages build/deploy jobが両successかrun IDで確認、失敗なら修復。新タスクなし。

## 共同スプリント・次担当｜2026/11/02 JST｜手動優先修正｜ACTIVE_SPRINT_ID=DEATH-HUNGER-SEQ-V1（継続）｜死亡暗転短縮・建物隙間スタック防止
- **ユーザー最新要望**：「死んだときのブラックアウトをもう少し早く」「建物の隙間にはまって動けなくなるバグを解決」。開始HEADは直近ROADMAP `6c4839f6b8633f9d6f08409b1897bec48318816b`、現行game.js/audio.js/index.htmlを照合し、既存死亡セーブ保護・教程/草・巣・強敵を上書きせず最小変更。
- **変更コード**：`neo-wild/game.js` `7ed869c0a1177940f2c4db16c415b7fa6d62e131` / blob `f6259f1fde425c808a09aea179c490aa822e7841`；`neo-wild/audio.js` `cb9c643fabd59411f97f4ef00777714a89c96a3b` / blob `c6e0e273e47d5f081816e238b1e589741d38599f`；`neo-wild/index.html` `c5ee732357afc38bbaa3aee7acd1aeff86bbfc5d` / blob `6a7681aab38819d9d3c027462580c93941e402e0`（両JS rev）。コード終了HEAD `c5ee732357afc38bbaa3aee7acd1aeff86bbfc5d`、ROADMAPコミットは別。neo-wild/外変更なし。
- **ゲーム改善**：(1) `DEATH_SEQUENCE_SECONDS` 3.2→2.2秒、転倒姿勢を0.65秒で確定、黒暗転開始0.18秒・1.66秒で最大94%まで到達、HUD暗転・BGM/環境音フェードを短縮。HP0でのみ死亡・再入力遮断・オートセーブ即時破棄・3CP保持の従来状態遷移は変更しない。(2) `narrowBuildingPassage` を追加し、通常の地上・建物外では、体幅+16px未満の平行建物間へ入れないよう衝突判定。屋上や屋内入口を意図的に閉鎖しない。(3) `move` で移動先の対角線を先に試し、詰まる場合は従来のX/Y軸沿いスライド。既存旧セーブ/大型敵ノックバックで非合法な建物隙間位置へ入ったプレイヤーは `recoverPlayerFromGap` の近傍安全点検索で救出し、`restoreSnapshot` にも適用。川/運河ブロック・屋上高さは保持。
- **QA**：変更前ファイルblob再照合後にコミット。現行game.js/audio.js/gamepad.js/debug-mode.js/season-clouds.js/webgl3d.jsのJS全文構文 **6/6 PASS**。本番`collides/narrowBuildingPassage/recoverPlayerFromGap/move`を抽出し、狭い隙間への侵入防止・旧スタック復帰・広い通路・対角線・屋上・水域・仕様保持 **13/13 PASS**（うち4件は暗転/互換/キャッシュ確認含む）。本番`beginDeath/advanceDeath`の経時シミュレーション・二重防止・保存破棄・HUD暗転・2.2秒結果 **9/9 PASS**。**実ブラウザ10分E2E、Android実機、実WebGL/Canvas2D画面、物理Pad、縦横FPS、Pagesでの現HEAD公開反映は未検証**。
- **Pages**：現コードHEAD `c5ee732357afc38bbaa3aee7acd1aeff86bbfc5d` のbuild/deploy両successは未確認。GitHub公開Actions一覧/RESTはネットワーク制限、GitHub connectorはpush run一覧が使えない。**公開済みとは報告しない**。過去別HEAD run ID流用禁止。
- **進捗V2暫定**：A16.0 / B12.0 / C9.0 / D4.0 / E8.0 / F9.0 / G8.0 / H4.0 / I2.0 = **72.0/100、前回72.0との差0.0**。今回の修正はA/F既存条件の品質改善、配信・端末/長時間E2E未確認のため新規加点なし。現HEADに未確認の根拠を加点しない。
- **次15分枠**：(1) 最新main `move/collides/recoverPlayerFromGap` を現行ワールドの狭い路地・旧セーブの建物重複・水際位置で入力→脱出→再保存の実関数経時テスト。(2) 飢餓HP0・連続被弾→2.2秒死亡→リトライ/3CP復帰と重複排除、1秒オートセーブ保護。(3) 新ゲーム/旧SAVE_SCHEMA2の教程4段階既読と移動・備蓄との競合回帰。
- **次45分枠**：(1) 実ブラウザ縦390×844/横800×360で建物隙間/角/屋上・川沿いの移動とFPSを実プレイ測定。(2) `drawScene` Canvas2D / `webgl3d.js:animal`の暗転1.66秒・倒れ姿勢0.65秒、音/画面・結果2.2秒の表示とタッチ復帰検証。(3) このコード対象HEADのPages build/deploy jobそれぞれsuccessを確認、不具合時だけ最小修正し、強敵・草・巣の未完へ戻る。

## 共同スプリント・次担当｜2026/11/02 14時台 JST｜手動修正｜ACTIVE_SPRINT_ID=DEATH-HUNGER-SEQ-V1（維持）｜4段階同一小型チュートリアル
- **指示と原因**：初回だけ大きなポップアップ、途中から自動表示されない。旧`automaticTutorialShown`が初回表示時に全段階の自動説明を抑止、`mission>=4`ガードが巣の説明を阻害。ユーザー確定：食事→緑の茂みで潜伏→狩猟→巣に1回備蓄、各段階同じ小型ポップアップ、ゲーム画面背景を停止して2行の短文＋「わかった」だけ。見た段階は死亡・再開・新規開始で繰り返さない。最後は短い「チュートリアル終了」→「生き残れ！」。
- **変更コード**：`neo-wild/game.js` commits `a88c7db56d35ce1963947e0325a158a74e0a8bd8` / `88bc23014837bc40764b49c83f4bb16b89718614` / `49a3a66ff3e6e3959ec256343c85da4752c2a196`（最終blob `3607ccbf17a9aa5378c3472e8eca6a5a2baf2b57`）；`neo-wild/index.html` commits `db2f36386cdde9b1259bdd292aeddf8786aafa58` / `c2f3aaec97a60fddeacc4c5d125db39811c2bcc0`；`neo-wild/visual.css` `8800c958c083a68e08e37e5687e43451cb2b6bb6`；`neo-wild/gamepad.js` `9ee604f5b8f621e59970a40ce329e5bbbea04584`。開始HEAD `1d2bc87136a4c4a543f6aebaed324ac1c0132ae0` → コード終了HEAD `c2f3aaec97a60fddeacc4c5d125db39811c2bcc0`。neo-wild/以外変更なし、ロールバックなし。
- **プレイ改善**：①`TUTORIAL_STAGES=[0,1,2,4]`の4段階全部で同じ小型ダイアログを自動表示。中間の巨大な達成オーバーレイを廃し、最後のみ1.25秒の小型「チュートリアル終了」。②本文は2行・確認ボタン「わかった」1個。表示中は`mode=guide`でゲーム停止、WebGL/2Dの背景は保持。縦幅約390pxの小型、横狭画面でも収まるCSS。③`tutorialLessonsSeenEver`を段階別の独立ローカル保存にし、死亡・続きから・チェックポイント・新規開始で閲覧済み段階を抑止。旧全体フラグは初回段階0のみ既読に移行する（後段階を誤抑止しない）。旧SAVE_SCHEMA2互換を維持。④ゲームパッドは「わかった」にフォーカス・決定、キーボードEnter/Escapeで閉じる。既存DEBUG「通しテスト・指定段階」にも同じ小型表示を反映（DEBUGは実セーブに既読を書き込まない）。
- **QA**：`game.js/gamepad.js/debug-mode.js/audio.js/season-clouds.js/webgl3d.js`実ファイル全文JS構文 **6/6 PASS**。実際の`openTutorial/closeTutorial/advanceMission/finishMissionMilestone`をDOM・localStorage相当オブジェクトへ結合し、4段階表示、停止/再開、最終告知、再プレイ/旧フラグ/手動ガイド、2行内容、Pad確認など **16/16 PASS**。追加で現行ソースの12条件（旧SAVE_SCHEMA2、チェックポイント3件、cache rev、DEBUG連動等）全てPASS。**実ブラウザ10分E2E・Android・実GPU FPS/矩形・物理Pad E2Eは未試験**。静的・模擬試験を実機試験と呼ばない。
- **Pages**：対象コードHEAD `c2f3aaec97a60fddeacc4c5d125db39811c2bcc0` のbuild/deploy successは未確認。GitHubコネクタのcommit workflow関連照会はpush runを返さず、外部Actions一覧も取得不可。**公開反映済みとは呼ばない**。前回run `41390546802`の両成功は別HEADのため流用しない。
- **進捗V2**：A **16.0** / B **12.0** / C **9.0** / D **4.0** / E **8.0** / F **9.0** / G **8.0** / H **4.0** / I **2.0** = **72.0 /100**。前回コードHEAD証拠74.0→現HEAD 72.0（差 -2.0、IのPages対象HEAD証拠なし）。今回の表示修正自体は既得点Fの内部改善であり加点しない。Pages両success確認で対象HEADのIを再評価。
- **次15分枠**：(1) `game.js:openTutorial/advanceMission/restoreSnapshot`で食事→潜伏→狩猟→巣の経時動的試験、各ポップアップ一度だけを旧SAVE_SCHEMA2/3チェックポイントで回帰。(2) `tutorialLessonsSeenEver`と`tutorialSeen`の死亡→リトライ/最初から→初回未見だけ表示、DEBUG通し試験の書込み分離を検証。(3) 既存飢餓HP→死亡3.2秒→復帰・セーブと競合がないか再試験。
- **次45分枠**：(1) 実ブラウザ縦390×844・411×768、横800×360・844×390で4つの小型ダイアログの実`getBoundingClientRect`・文字/ボタンはみ出しゼロを確認。(2) WebGL/Canvas2D背景停止とGamepad/キーボード/タッチ「わかった」→次課題復帰・FPS/旧セーブを10分E2Eで確認。(3) GitHub Pagesのコード対象HEAD build/deploy結果を個別確認し、問題がなければ草の密度・強敵20種の固有戦闘スプリントへ復帰。

## 共同スプリント・次担当｜2026/11/02 14:15 JST｜15分枠｜ACTIVE_SPRINT_ID=DEATH-HUNGER-SEQ-V1｜死亡後の再操作重複と致死出血の処理順を修復

- **照合**：開始main `67879ef122625159e3389acaf402430494b526b1`、13:49の45分枠ROADMAPと13:15の15分枠・Drive「WILD RECLAIM｜完成仕様設計書」末尾を確認。死亡3.2秒・飢餓0で2.4HP/秒・空腹1〜16で1.2HP/秒・食事回復・SAVE_SCHEMA2・3CP・6巣・20強敵・冬の密生草・4段階教程は再実装せず維持。
- **コード変更**：`neo-wild/game.js` commit `c3570278c1cfc74536af1753669a8638e67c3756` / blob `ff2c27f05257b68ac4dc19904e187eb9e6c0bac7`。`neo-wild/index.html` commit `1d2bc87136a4c4a543f6aebaed324ac1c0132ae0` / blob `771936cdeb6a7b7fcc6d831bb03013167f14aae0`（game.js rev `20261102-death-retry-guard-v3`）。neo-wild/外の変更なし。
- **プレイ変更3点**：(1) 強敵の出血でHP0になったフレームは直ちに`beginDeath`し、死亡後の地区移動による強敵出現・乱数抽選を行わない。(2) リザルト画面の「リトライ」を素早く2回タップしても最初の1回だけチェックポイント復帰または同種新規開始を行い、2回目の初期化・セーブ書き直しを防ぐ。(3) 「最初から」の二重タップでも、すでに結果画面から離れた後は再度メニュー遷移しない。
- **動的QA**：6本の現行本番JS全文構文 **6/6 PASS**。本番イベントハンドラの実コードを抽出してリトライCPあり/なし、二重タップ、最初から二重タップ、致死出血後ボス出現禁止・非致死出血の正常抽選 **7/7 PASS**。本番`updateSurvivalNeeds/eat/isValidSnapshot/getAutoSnapshot/getCheckpoints/clearAutoSave/currentSnapshot/saveAuto/beginDeath/advanceDeath/finish`を結合した飢餓0→5秒HP減少→食事HP回復/飢餓停止→SAVE_SCHEMA2自動保存→3CP→HP0→3.19秒→3.21秒結果/二重開始防止/死亡中保存拒否 **19/19 PASS**（統合試験20項目のうち1項目は構文検査と重複のため除外）。実`restoreSnapshot/isValidSnapshot`を旧SAVE_SCHEMA2の空腹欠落/0・旧猫速度・巣18pt・希少素材・mission2/7・無効HP0 CPで **14/14 PASS**。**計46/46（6+7+19+14）PASS**。V8の実関数隔離/模擬DOM試験であり、実ブラウザ10分E2E、Android実機、実GPU、物理Pad、縦横実BoundingClientRect、実FPSは未検証。
- **Pages**：対象コードHEAD `1d2bc87136a4c4a543f6aebaed324ac1c0132ae0` / run **41392810895**、jobs APIで **build=success / report-build-status=success / deploy=success** を別々に確認。ROADMAP記録後HEADのPagesは別途確認。
- **進捗計測V2**：A **16.0/16**（game.js生存・食事・死亡・再開、今回の19/19）、B **12.0/12**（6巣/備蓄の既存実関数試験、現行コード保持）、C **9.0/12**（橋・川・季節・地区の一連E2E未確認）、D **4.0/16**（20種の出現定義、固有AI/外見/討伐保存は種類別未検証）、E **8.0/8**（20希少素材継承の既存動的試験、保持）、F **9.0/12**（縦横HUDの実矩形未確認）、G **8.0/8**（旧SAVE_SCHEMA2/3CP/自動保存、今回の14/14回帰）、H **4.0/6**（実FPS/当たり判定/画面サイズ未確認）、I **4.0/10**（実関数統合と今回HEADのPages build+deploy成功、ブラウザ10分/Android/物理Pad各0）。**合計74.0/100、前回74.0→74.0、差0.0**。A/Gの既存達成条件内の不具合修正であり、新しい完了条件は満たしていないため加点なし。各項目の過去根拠は直下の13:49/13:15枠のcommitとQAを継承。
- **次15分枠①**：`game.js:update/updateSurvivalNeeds/eat/eatFromDen`で空腹0＋出血＋摂食入力を実フレーム時系列で結合し、HP0になる前に食べた場合のみ飢餓停止・回復すること、死亡後に行動しないことを確認し、実不具合のみ最小修正。
- **次15分枠②**：`game.js:restoreSnapshot/recordCheckpoint/getCheckpoints`を実イベントで3CPの最新同種優先→復帰→再保存→二重加算なし、旧SAVE_SCHEMA2・巣/希少素材維持まで連結検証。
- **次15分枠③**：`game.js:ensureTrainingCoverNear/inVisibleShrubCover/checkMission`で冬の見える茂み0.75秒潜伏→その後の新規討伐→巣1回備蓄→一度だけ終了→「生き残れ！」を実関数で通し、初回以外の自動ガイド再出現を回帰。
- **次45分枠①**：`game.js:drawScene/drawCreature`、`webgl3d.js:animal`、`audio.js:fadeForDeath/resetDeathFade`で地上/屋上・縦390×844/横800×360の3.2秒死亡姿勢/暗転/音とリトライ後復帰を実ブラウザで確認。
- **次45分枠②**：`index.html/style.css/visual.css/debug-mode.js`で実Android縦横のHUD/ミニマップ/結果ボタン/草前景のDOM矩形・タッチ領域・FPSを確認、重なりや負荷があれば最小修正。
- **次45分枠③**：`game.js:spawnStrongBoss/resolveAttack/kill`と`webgl3d.js`で20強敵を固有攻撃→討伐→希少素材→継承→セーブ復元まで種類別に実結合し、Dの種類別未達を解消。

## 共同スプリント・次担当｜2026/11/02 13:49 JST｜45分枠｜ACTIVE_SPRINT_ID=DEATH-HUNGER-SEQ-V1｜草むら視認・潜伏の2D/3D統合
- **開始→コード終了HEAD**：`cd275bd9de2e6a8d9cdee30bdb773024836878a5` → `ae12d930ddd460738b4e247c8ae48633b65f7b24`。先頭ROADMAP・直近15/45枠・Drive設計書末尾・現行mainを照合。飢餓0以降2.4HP/秒、死亡3.2秒、旧SAVE_SCHEMA2、3CP、6巣、20強敵・能力継承を重複実装せず維持。
- **実コード変更**：`neo-wild/game.js` commit `5facf9c4dcb418266ca570ef230fbf3a28eefac6` / blob `171177fb1743a64254de37c43d5b30851db6baeb`、`neo-wild/webgl3d.js` commit `74fa3557bc4a71f49484941bc7cdba4449f58fa0` / blob `6363261b1296de72717c491bf33dd3afb599e9f9`、`neo-wild/index.html` commit `ae12d930ddd460738b4e247c8ae48633b65f7b24` / blob `8a13739b2358efeff82f101364319937fbc4ea35`。両JSのcache rev `20261102-dense-grass-stealth-v1`。neo-wild/外変更なし。
- **プレイ改善3点**：(1) 従来3Dで単なる緑の三角錐だった`type=0/1`を、2D/3Dで複数の尖った草葉として描画。半径18以上は密生草として潜伏可能に統一し、小さい草は短く疎らに表示して隠れ判定なし。(2) `visibleShrub/inVisibleShrubCover/inCover`とCanvas2Dの前景葉判定を一致させ、旧セーブの植物にも追加フィールドなしで適用。冬に非表示の普通の`type=2`だけは潜伏不可、冬の可視巣・訓練草と新しい緑草は潜伏可。(3) Canvas2D潜伏時のプレイヤーを46%半透明にし、既存WebGL潜伏時43%半透明と整合。密生草の葉枚数も増やして見た目を明瞭化。
- **QA**：現行6 JS全文構文 **6/6 PASS**。実`visibleShrub/inVisibleShrubCover/inCover`の冬・屋上・草種/半径と、実`drawPlant`/WebGL `vegetation`を模擬Canvas/三角形描画へ結合した **14/14 PASS**。実ブラウザ10分E2E・Android実機・実GPU・物理Pad・縦横BoundingClientRect・実FPS・旧SAVE_SCHEMA2端末E2Eは**未検証**。隔離した実関数テストを実機テストと呼ばない。コンテナの外部DNS不可によりPagesの実ブラウザ接続は未実施。
- **Pages**：対象コードHEAD `ae12d930ddd460738b4e247c8ae48633b65f7b24`、run **41390468163**：jobs APIで **build=success / report-build-status=success / deploy=success** を個別確認。コードHEADの配信成功。ROADMAP記録コミット後のHEADは別途確認。
- **進捗計測V2（前回72.0→今回74.0、差+2.0）**：A **16.0/16**（既存生存/死亡実関数試験）、B **12.0/12**（6巣/備蓄・既存試験）、C **9.0/12**（地区・橋・川連続実操作待ち）、D **4.0/16**（20種登録、固有AI/攻撃/2D3D/討伐保存は種類別未検証）、E **8.0/8**（20素材の既存継承試験）、F **9.0/12**（縦横HUD実矩形待ち）、G **8.0/8**（旧SAVE_SCHEMA2/3CP/自動保存・既存試験）、H **4.0/6**（実ブラウザFPS・画面サイズ待ち）、I **4.0/10**（実関数統合＋今回対象コードHEAD Pages build/deploy両success、10分ブラウザ/Android/物理Pad各0）。今回+2はIの対象HEAD配信確認のみ。草改善は既得点の表示品質向上で加点なし。
- **次15分枠①**：`game.js:updateSurvivalNeeds/beginDeath/advanceDeath/restoreSnapshot`を実関数で連結し、空腹0→食事→HP0→3.2秒→3CPリトライ、SAVE_SCHEMA2再開・死亡中オートセーブ破棄を経時回帰。
- **次15分枠②**：`game.js:inCover/update/checkMission`で旧保存のtype0/1密生草・冬trainingCoverへ入る→速度を落としてP.hidden→0.75秒教程達成→移動/攻撃で解除を実操作経路で検証。
- **次15分枠③**：`game.js:spawnStrongBoss/resolveAttack/kill`の既存強敵20種を種類別に固有攻撃→討伐→素材→継承→SAVE_SCHEMA2復帰へ接続し、未完成を一覧化。
- **次45分枠①**：実ブラウザ縦390×844/411×768・横800×360/844×390で新草のWebGL/2D葉数・前景・潜伏半透明とHUD/地図矩形を測定。実GPU FPSと草増量の負荷を確認し、重ければ密度を段階制御。
- **次45分枠②**：`game.js:drawScene/drawCreature`、`webgl3d.js:animal/render`、`audio.js:fadeForDeath`の3.2秒死亡倒れ込み・音/フェードをブラウザ操作で検証、異常時のみ最小修正。
- **次45分枠③**：6巣の地上/屋上アクセスと草/遮蔽を2D/3Dで確認後、強敵20種の固有外見・水辺/空中AI・固有攻撃を種類別に完成させる。

## 共同スプリント・次担当｜2026/11/02 13時台 JST｜動画QA・必須チュートリアル再構成（最優先ユーザー指示）｜ACTIVE_SPRINT_ID=DEATH-HUNGER-SEQ-V1（維持）
- **原因・動画**：ユーザー68.3秒のAndroid縦1080×2400撮影を確認。冬1月に茂みが見えないため潜伏先を理解できない。従来game.jsは冬季`type=2`低木の2D/3D描画を消していた一方、壁/車の遮蔽滞在`hiddenHold`と既存の累計`kills`を後続チュートリアルへ流用。狩猟2→巣4の自動遷移後は`automaticTutorialShown/mission>=4`ガードで自動説明が出ず、巣運搬が唐突に発生した。
- **修正・最新優先**：`neo-wild/game.js` commits `a8192bf491da8126fa3993173768259d89790d40`, `b1b14f3c8146f4c65ab3785dc2bb9414651f193f`, `d2f904923a775f83bc7ac7a22615924558227408`, `8f466729e0a6f137631ade0b1c17c0cb132c0f44`、`neo-wild/webgl3d.js` `caa67d2b89a1d6a546c3f8e4acd137894c695037`、`neo-wild/debug-mode.js` `744f4b5369ab13b97acaaf4c029774bc69c32747`、`neo-wild/index.html` 最終 `a24eddfe39d8cb0ee5203bac0697130d94aefcd6`（JS/3D/debug cache rev）。**13:15枠が並行実施したgame.js保存・飢餓改善`16c9cb4b`も最新mainに保持**。neo-wild/以外変更なし、強制push/ロールバックなし。
- **プレイ改善4点**：(1) 新規開始・旧SAVE_SCHEMA2の進行中ミッション1に、実際に歩いて入れる茂み`trainingCover`を優先確保。六巣周辺`denSite`と併せ、冬でも濃緑の尖った葉として2D/WebGL3Dに描画。冬の隠れた一般低木は不可視のまま潜伏判定不可。(2) 潜伏は現在の**見える茂み**で約0.75秒静止した場合だけミッション達成。以前の壁陰の滞在分を流用しない。累計討伐数は狩猟段階に入った時点の`tutorialHuntBase`から増加した分だけを採用。段階到達前の討伐による自動達成を防ぐ。(3) 狩猟→巣の変化を4.2秒の短い日本語案内＋常設の運搬手順で明示。英語「EXCELLENT!」を「達成！」へ。(4) 必須の説明は**食事→可視茂みで潜伏→新しく獲物を狩る→食料を一度巣へ預ける**。最後は短い「チュートリアル終了」後に`mission7`常設「生き残れ！」。60pt巣LV2、縄張り、探索地点は**ゲーム内で自由に実行可能な任意要素**とし強制課題から除外。デバッグの段階選択も4基本＋終了の5段階に整合。
- **互換**：SAVE_SCHEMA=2維持、セーブには後方互換の任意フィールド`tutorialHuntBase/tutorialStashBase`を追加（旧データ欠落は現在値を初期値に採用）。3チェックポイント・自動保存・既存巣・20強敵・死亡演出・飢餓2.4HP/秒・縦横/Pad維持。旧mission5/6は復帰時に`生き残れ！`へ変換し、システム機能は削除しない。
- **QA**：現行JS全文構文 **6/6 PASS**。HTML6スクリプト読込とrev、ミッションの基準値保持、旧スキーマ、3CP/死/飢餓の存在確認 **16/16 PASS**。実`visibleShrub/inCover/ensureTrainingCoverNear`の冬場草と非可視草、実`advanceMission/checkMission`の食事→潜伏→新規討伐→巣1回→常設最終 **7/7 PASS**。現行WebGL vegetation実関数による冬緑低木と一般冬低木非表示 **PASS**、現行2D drawPlant実関数の冬緑葉25描画/冬一般0描画 **PASS**。**実ブラウザ10分E2E・Android実機・実GPU描画・物理Pad/FPS/縦横BoundingClientRectは未検証**。アップロード動画は旧症状の証拠であり修正後の実機検証ではない。
- **Pages**：最新コードHEAD`a24eddfe39d8cb0ee5203bac0697130d94aefcd6`のbuild/deploy両successは現時点の利用可能なActions照会で未確認。**公開反映済みとは報告しない**。前15分枠`ee6c59a9`についてrun `41387332771`のbuild/deploy success記録は別HEADの証拠であり流用しない。
- **進捗計測V2**：A **16.0** / B **12.0** / C **9.0** / D **4.0** / E **8.0** / F **9.0** / G **8.0** / H **4.0** / I **2.0** = **72.0/100**（前回74.0→72.0、差-2.0）。Iの対象HEAD Pages両成功が未確認のため暫定2点減。チュートリアル修正は既得点のF/G/Aの品質向上だが新評価条件の実機・実ブラウザ未達成により加点なし。Pages確認が取れた時点でIを規定どおり再計算。
- **次15分枠①**：`game.js:update/advanceMission/checkMission/restoreSnapshot`の現行関数を経時結合して、冬茂み滞在0.75秒・前の討伐無効・狩猟後の手持ち→巣備蓄でmission7移行・通知1回を確認。**次15分枠②**：新旧SAVE_SCHEMA2 / 3CP / 再開・リトライ・空腹0→HP0/死亡演出の回帰と、冬trainingCoverの保存復元・古いmission5/6最終目標移行を検証。
- **次45分枠①**：縦390×844/411×768・横800×360/844×390の実ブラウザで冬の濃緑低木のWebGL/Canvas2D見た目・視認性・到達可能性・ミニマップを確認。**次45分枠②**：初回ガイド1〜2ページ、4行動＋終了告知と右上HUD/タッチ4ボタンの重なり、実FPS/保存/2DフォールバックQA。**次45分枠③**：Pages対象HEADのbuild/deployを別々に確認、問題がなければ20強敵固有戦闘へ復帰。

## 共同スプリント・次担当｜2026/11/02 13:15 JST｜15分枠｜ACTIVE_SPRINT_ID=DEATH-HUNGER-SEQ-V1｜死亡直後の自動保存保護・飢餓警告と摂食回復

- **開始→終了HEAD**：開始 `d2f904923a775f83bc7ac7a22615924558227408` → コード終了 `ee6c59a9c7d431bcf77826b63d8a4cb597308213`。12:48の45分枠記録と最新main、Drive完成仕様末尾を照合。最新手動の茂み・巣教程変更 `b1b14f3` / `d2f9049` は保持。旧死亡3.2秒/3D2D倒れ込み/音フェード・空腹0の2.4HP秒/1〜16%の1.2HP秒・SAVE_SCHEMA2・3CPは再実装なし。
- **コード変更**：`neo-wild/game.js` commit `16c9cb4b8cec4008cab05e1d59635f404b3a4f8a` / blob `47184ed7ffbcaa82dac839f330284c4556061e23`。`neo-wild/index.html` commit `ee6c59a9c7d431bcf77826b63d8a4cb597308213` / blob `e60430ea739e59c76bdcbeb46b4af89eb0a25dc2`。game.jsキャッシュrev `20261102-death-save-starvation-v2`。他ゲーム・他フォルダ変更なし。
- **プレイ改善3点**：(1) `beginDeath`でHP0確定時に自動保存を即破棄し、3.2秒倒れ込み途中のページ再読込で死亡前の古い自動保存が復活する問題を防止。`finish`での二重破棄を削除。3CPは残し、デバッグ通しテストの元保存も保護。(2) 空腹が0に到達した瞬間だけ『空腹0：生命が減少中。食べ物を探そう』と短く通知し、繰り返し通知しない。(3) HUDの空腹表示を0%『飢餓：生命 -2.4/秒』、1〜16%『衰弱：生命 -1.2/秒』に変更。摂食→HP回復→飢餓ダメージ停止、巣回復、死亡HP0のみの既存ルールは維持。
- **実関数動的QA**：現行`updateSurvivalNeeds/beginDeath/advanceDeath/finish/clearAutoSave/saveAuto/currentSnapshot/getCheckpoints/isValidSnapshot`を抜き出したV8模擬環境で22/22 PASS（空腹0の10秒減少/分割dt一致、0%一回警告、食事後ダメージ停止、巣回復境界、HP0のみ死亡、死亡直後オートセーブ破棄・3CP保持、二重開始/二重消去なし、3.19秒非表示→3.21秒結果、テスト保存保護）。さらに実`eat`を結合し空腹0→2秒飢餓→食事で空腹+24/HP+12→次フレーム減少停止→自動保存→HP0死亡→3CP保持→3.2秒結果の14/14 PASS。現行本番6JS全文構文6/6 PASS。**合計42/42の限定的検査。実ブラウザ10分E2E・実Android・実GPU・物理Pad・縦横矩形は未検証**。
- **Pages**：コードHEAD `ee6c59a9c7d431bcf77826b63d8a4cb597308213` run **41387332771**、jobs APIで **build=success / report-build-status=success / deploy=success** 確認。前段game.js単体HEADのrunは後続commitでcancelled、最新版の成功を優先。ROADMAP記録後HEADの配信は次回別確認。
- **進捗計測V2**：A **16.0/16**（生存/死亡/再開、今回実食事結合14件）、B **12.0/12**（既存6巣・屋上・備蓄試験）、C **9.0/12**（季節→橋→川→地区連続経路待ち）、D **4.0/16**（20種登録のみ種別固有戦闘未試験）、E **8.0/8**（既存20素材継承100件）、F **9.0/12**（縦横HUD矩形未試験）、G **8.0/8**（旧SAVE_SCHEMA2/3CP/再開、今回の死亡保存保護）、H **4.0/6**（実ブラウザFPS/当たり判定/画面サイズ未試験）、I **4.0/10**（実関数統合＋対象HEAD Pages両success、ブラウザ10分/Android/物理Pad各0）。**合計74.0/100、前回74.0→74.0、差0.0**。変更は既得点A/Gの品質回帰で、新条件達成なし。
- **次15分枠1**：`game.js:restoreSnapshot/getCheckpoints/retry-btn`で飢餓0→HP0→3.2秒→3CP最新同種からリトライ/CPなし新規/最初からの実イベント結合、旧SAVE_SCHEMA2の保存二重加算を回帰。
- **次15分枠2**：`game.js:updateSurvivalNeeds/update/eat/eatFromDen`で強敵出血と飢餓を同時進行→野外摂食/巣食事→死亡HP0判定の経時連結テスト。重複ダメージや食事優先の破綻だけ最小修正。
- **次15分枠3**：現行mainの茂み・教程 `inVisibleShrubCover/ensureTrainingCoverNear/checkMission`を実動作で通し、可視茂み滞在→食事→狩猟→巣備蓄→『生き残れ！』まで自動達成・告知飛びのない一連のプレイに修正。
- **次45分枠1**：`game.js:drawScene/drawCreature`、`webgl3d.js:animal`、`audio.js:fadeForDeath`の死亡3.2秒を縦390×844/横800×360の実ブラウザで姿勢・音・画面フェードと再開を検証。
- **次45分枠2**：6巣の屋上/地上と右HUD/地図/SCORE/HUNT/デバッグUIの実DOM矩形、Canvas2D/WebGL/FPS、縦横を確認し必要時のみ修正。
- **次45分枠3**：`spawnStrongBoss/resolveAttack/kill`と`webgl3d.js`で強敵20種の固有AI/外見/討伐→素材/保存を種類別に実結合し、Dの不足条件を解消。

## 共同スプリント・次担当｜2026/11/02 12:48 JST｜45分枠｜ACTIVE_SPRINT_ID=DEATH-HUNGER-SEQ-V1｜死亡時の戦闘表示・揺れ・気象エフェクトを静める

- **照合・HEAD**：最新main `f629f40ef13b688db2cf2074945822ae84837e15`、ROADMAP直近12:44/11:15/10:45の両枠記録、Drive完成仕様設計書末尾、現行game.js/webgl3d.js/audio.js/debug-mode.js/index.htmlを確認。既存飢餓2.4HP/秒、3.2秒倒れ込み、3D回転・2D伏せ、音フェード、6巣、SAVE_SCHEMA2、3CPは再実装せず維持。コードHEAD `188fc03a61d4023121f36fb309b2d913be81a4c0`。
- **実装差分**：`neo-wild/game.js` commit `21b71bc84f5b0c1d4ad2002bde8a5d4d074c0d93` / blob `0920fae1501b28e0adfd1399c558d1a5af6da13f`、`neo-wild/index.html` commit `188fc03a61d4023121f36fb309b2d913be81a4c0` / blob `0c5ad36d90a4d6f72e5159d2153ec50ab36cbbe3`（game.js cache rev更新）。
- **プレイ改善3点**：(1) HP0時に直前の被弾赤フラッシュ、カメラ揺れ、攻撃残像、ポップアップを停止し、倒れ込みを視認可能にする。(2) 死亡3.2秒中はミッション矢印・巣入口・敵名・死骸ラベルを描画せず、結果画面が出るまでゲーム世界に集中できる。(3) 死亡中は2D/3D共通のCanvas上の雨線・風線・雷光・被弾フラッシュを止め、既存の3D/2D倒れ込み・画面暗転・音フェードを維持。通常プレイ時の天候描画は変更なし。
- **QA**：現行読み込み6 JSの全文構文 **6/6 PASS**。実`beginDeath/advanceDeath`を環境モックに結合し、二重開始防止、被弾効果消去、移動停止/接地、音1回、3.15秒結果非表示、3.2秒以降結果1回、二重結果防止、死亡中の天候/ミッション表示ガードなど **11/11 PASS**。現行`audio.js:fadeForDeath/resetDeathFade`実関数のWebAudio gainモックで二重呼出し抑制と復帰（2 fade＋2 reset calls）PASS。**実ブラウザ実描画、縦横HUD実矩形、実Android/実GPU/物理Pad、10分E2E、死亡後3CP実再開は未検証**。実関数の一部を抽出した隔離QAであり、実ブラウザE2Eではない。
- **Pages**：コードHEAD `188fc03a61d4023121f36fb309b2d913be81a4c0` run **41385153417**：後続のjobs APIで **build=success / report-build-status=success / deploy=success** を確認。コードHEAD **188fc03a61d4023121f36fb309b2d913be81a4c0** は配信成功。このROADMAP記録後のHEADは別runで確認する。
- **進捗計測V2**：A **16.0/16**（生存/死亡/再開、game.js・既存11:15の30件QA）、B **12.0/12**（6巣・備蓄・屋上、前枠41件）、C **9.0/12**（環境/地区連続経路は検証待ち）、D **4.0/16**（20種登録、固有攻撃/外見/討伐保存の種類別結合は検証待ち）、E **8.0/8**（20素材・継承保存100件）、F **9.0/12**（実縦横HUD矩形待ち）、G **8.0/8**（SAVE_SCHEMA2・3CP・自動保存/再開既存試験）、H **4.0/6**（実ブラウザFPS/衝突/サイズ待ち）、I **4.0/10**（既存統合試験と配信証拠を継承、今回HEADのdeployは確認待ち）。**合計74.0/100、前回74.0→74.0、差0.0**。死亡表示の品質改善は既得点のA/H条件内であり、未検証条件への加点なし。
- **次15分枠1**：`game.js:updateSurvivalNeeds/beginDeath/restoreSnapshot`で空腹0→食事同フレーム→HP0→3CP/旧SAVE_SCHEMA2復帰を実関数連結試験。死亡中に保存・再攻撃・重複報酬がないことを検証。
- **次15分枠2**：`game.js:spawnStrongBoss/resolveAttack/kill`で20種の固有攻撃→討伐→素材→能力→セーブ復元を種類別に試験し、Dの不足条件を明確化。
- **次45分枠1**：`game.js:drawScene/drawCreature`・`webgl3d.js:animal`・`audio.js:fadeForDeath`の3.2秒を実ブラウザ縦390×844/横800×360で画面と音まで検証。雨・風・雷・被弾の各死亡演出と再開復帰を確認。
- **次45分枠2**：6巣の屋上アクセス・草束/地形/2D3D、右上HUD/ミニマップ、短い横画面の実BoundingClientRect/FPSを確認。問題時のみ現行HEADへ最小修正。
- **次45分枠3**：強敵20種の3D/2D個体外見・攻撃エフェクト・水辺/飛行・1体制限を現行mainから種類別に試験し、未完成の固有戦闘を段階実装。

## 共同スプリント・次担当｜2026/11/02 12:44 JST｜手動デバッグQA拡張｜ACTIVE_SPRINT_ID=DEATH-HUNGER-SEQ-V1（既存維持）

- 照合：最新main・ROADMAP直近15/45枠・Drive完成仕様設計書末尾・game.js/debug-mode.js/index.htmlを照合。開始コードHEAD 7dbd4a30、最終コードHEAD ffe83825。旧飢餓・死亡演出・6巣・SAVE_SCHEMA2・3チェックポイント・ゲームパッドを維持。
- 変更1：neo-wild/game.js commit 34884983で通しチュートリアル専用テストを追加。食事→潜伏→狩猟→備蓄LV2→縄張り→探索→生き残れ！を実条件で進め、前/次・任意段階・元セーブへの復元が可能。テスト中のオートセーブ、CP、巣の永続保存、最高点変更を防止。
- 変更2：game.js commit 32c88cbaで強敵20種の日本語名選択・地域移動・1体出現・消去・HP1化・希少素材追加。6巣への移動、空腹/HP、巣LV/備蓄変更。通常強敵の抽選20%・同時1体制限は維持。
- 変更3：neo-wild/debug-mode.js commits 6cf44a98/c4f4cb88でスマホ向け折りたたみ5分類、44px操作ボタン、日本語説明、テスト終了で元に戻す、タイトル7タップ起動を実装。index.html commits 1623de9f/ffe83825でスクリプト読み込みrev v3。
- QA：HTML参照6JS構文6/6 PASS。現行WildDebugBridge実メソッドを抽出した模擬環境で開始→全7段階→終了・元セーブ復元、強敵20種名称・1体制限・HP/空腹など16/16 PASS。追加の強敵HP1・素材＋1・保存など6/6 PASS。debug-mode.jsの模擬DOM起動・タイトル7タップ・20種選択・6巣選択・5分類など8/8 PASS。UIから呼ぶAPI欠落0、ID欠落0。合計限定的QA 36/36 PASS。実ブラウザ10分E2E・Android実機・GPU実描画・物理Pad・縦横実矩形は未検証。
- Pages：コードHEAD ffe83825 の run 41384426715 で build=success / report-build-status=success / deploy=success をjobsで確認。ROADMAP記録後のHEADは別途確認。
- 進捗V2：A16.0 / B12.0 / C9.0 / D4.0 / E8.0 / F9.0 / G8.0 / H4.0 / I4.0 = 74.0/100、前回74.0→74.0、差0.0。新デバッグ操作だけでは既定のA～I完成条件に加点不可。C/D/F/Hおよび実ブラウザ10分/Android/物理Padは検証待ち0点。
- 次15分枠1：game.jsのcheckMission/advanceMission/tutorialStart/tutorialStopで実操作7段階を通し、途中スキップ・最終告知1回・元SAVE_SCHEMA2と3CP復元を検証。
- 次15分枠2：spawnStrongBoss/kill/strongTrophiesで強敵20種を討伐→報酬→巣LV2継承→セーブ復元の種類別で実関数試験し、固有AI/2D3Dと同じ種類を照合。
- 次15分枠3：飢餓0/出血/食事同フレームから死亡演出・リトライまでの経時回帰、旧機能重複改修は禁止。
- 次45分枠1：debug-mode.js実Android縦390×844/411×768・横800×360/844×390でスクロール/タッチ/ラベル/画面隠れを確認。
- 次45分枠2：warpBossArea/spawnStrongBossとwebgl3d.jsで水辺3種・地上17種の選択→出現→3D/2D描画→HP1討伐、1体制限を検証。
- 次45分枠3：最新Pages build/deployを確認し、ゲームパッド・画面横縦・死亡シーケンス・デバッグ閉鎖を回帰。

## 共同スプリント・次担当｜2026/11/02 12:15 JST｜15分枠｜ACTIVE_SPRINT_ID=DEATH-HUNGER-SEQ-V1｜飢餓16%/0%境界の経時整合・旧セーブ復帰

- **照合**：開始HEAD `ff3f1cf24ac272a3e16e3777ba1dee7183593510`、直近11:45の45分枠による猫/狐/狼の3D横転・Canvas2D倒れ込み、11:15の飢餓2.4HP/秒、ROADMAP先頭・Drive完成仕様設計書末尾を読了。コード終了HEAD `6a2b34c6cc2165899d742ae1ddd0439d6c3e05ce`。既存3.2秒死亡演出・6巣・20強敵・20継承・Gamepad・タイトルUIを再実装せず維持。
- **変更ファイル・commit/blob**：`neo-wild/game.js` commit `bfd7efc73d35a99ca15186bfe3f4e789c79d971a` / blob `f5c61fea270233faa10d994531f9629101723339`、`neo-wild/index.html` commit `6a2b34c6cc2165899d742ae1ddd0439d6c3e05ce` / blob `1f63aa798da3d44a30c9e7a7a1e801ed89f6f3ec`（game.js rev）。neo-wild/外変更なし。
- **プレイに連動する改善2点**：(1) `updateSurvivalNeeds`の空腹16%到達フレームの低空腹HP減少を実経過割合で積分し、16%以上から閾値を跨いだときの過剰ダメージを解消。空腹0の2.4HP/秒・空腹1〜16%の1.2HP/秒・安全な巣での空腹0回復禁止を保持。0境界でもフレーム分割に依存しない。(2) `restoreSnapshot`で旧SAVE_SCHEMA2の空腹値欠落/異常値を安全に100%へ補完/0〜100へ制限。正当な空腹0は0のまま復帰し、猫速度旧セーブ移行・20能力継承フラグ・死亡/3チェックポイントの既存仕様を維持。
- **実関数動的QA**：現行`game.js`の実`updateSurvivalNeeds/eatFromDen/beginDeath/advanceDeath/finish/isValidSnapshot/getCheckpoints/currentSnapshot`を組み合わせ**23/23 PASS**。16%/0%を跨ぐ1秒vs分割フレーム同一HP、空腹0で10秒24HP減、安全な巣でも飢餓継続、備蓄肉を食べて空腹+18/HP回復→巣回復再開、HP0のみ死亡、3.19秒死亡画面非表示→3.21秒表示、死亡SE/音フェード/自動保存消去各1回、死亡中の保存拒否、旧スキーマ妥当性とCP3件上限。実`restoreSnapshot/isValidSnapshot`を旧猫セーブの空腹0/35/欠落/-15/135で実行し、継承・猫速度移行とともに**25/25 PASS**。HTML読み込みJS6本全文構文**6/6 PASS**。**合計54件の限定的試験であり、実ブラウザ10分・実Android・実GPU・物理PadのE2Eではない**。
- **Pages**：対象コードHEAD `6a2b34c6cc2165899d742ae1ddd0439d6c3e05ce`、run **41381976197**、**build=success / report-build-status=success / deploy=success**をGitHub Actions jobsで確認。前45分枠のHEAD `ff3f1cf...`もrun **41379783522**でbuild/deploy両successを追認。ROADMAP追記後のHEADは別runで要確認。
- **進捗計測V2・現行main証拠基準**：A **16.0/16**（空腹→食事→死亡→結果の実関数23件と既存再開）、B **12.0/12**（既存6巣/屋上/備蓄41件、今回未変更）、C **9.0/12**（冬→橋→河川→地区の連続実関数未完）、D **4.0/16**（20種の出現定義まで、固有AI/2D3D/討伐保存の種類別結合未完）、E **8.0/8**（既存20種能力消費→効果→保存100件）、F **9.0/12**（縦横HUD実ブラウザ矩形は未試験）、G **8.0/8**（旧SAVE_SCHEMA2・3CP・自動保存/再開の既存QAと本回旧保存25件）、H **4.0/6**（実ブラウザFPS/当たり判定/画面サイズ未試験）、I **4.0/10**（実関数統合2点＋対象HEADのPages両success2点、ブラウザ10分/Android/物理Pad各0）。**合計74.0/100、前回72.0→74.0、差+2.0**。I5のPages証拠取得による復点であり、コード行数による加点ではない。未検証条件は0点、固定採点表・重み変更なし。
- **次15分枠（具体的3件）**：(1) `game.js:updateSurvivalNeeds/update/eat/eatFromDen`を実ゲーム経時ループで飢餓→野外摂食→巣食事→回復→出血併発まで連結し、食事とHP0の同フレーム優先順位・UIを検証。(2) `restoreSnapshot/currentSnapshot/getCheckpoints`の実イベントで死亡後の同種リトライ/最初から/3CP切替、旧セーブ・希少素材/巣LV2の二重加算なしを確認、破綻なら最小修正。(3) `wildlifeBridgeWaypoint/steerPursuit/updateIndoorRest`で冬の可視遮蔽物→橋→雨宿り→別地区のC4連続経路を動的検査し、未完を修正。
- **次45分枠（具体的3件）**：(1) 実ブラウザが可能なら縦390×844/411×768、横800×360/844×390/736×414/1536×691で倒れ込み3D/2D・音フェード・3.2秒余韻・結果・リトライを10分E2Eし、FPS/DOM矩形/屋上死亡を記録。(2) `webgl3d.js:animal`の屋上Zと`game.js:drawCreature/drawScene`の横転・HUD暗転をGPU/Canvasで検証し、必要時だけ修正。(3) `spawnStrongBoss/resolveAttack/kill/drawStrongAnimal3D`の20種について固有AI/攻撃・外見・報酬/保存を種別に動的検査しD不足を解消。新しい強敵定義は重複追加しない。

## 共同スプリント・次担当｜2026/11/02 11:45〜11:50 JST｜45分枠｜ACTIVE_SPRINT_ID=DEATH-HUNGER-SEQ-V1｜倒れ込み3D横転・2D姿勢を実装
- **照合**：開始main `fa77766011e4db614ba837f0aaadeeb6e75e7b2a`、直前11:15の15分枠飢餓HP減少と11時台のタイトル画面変更、ROADMAP先頭・Drive完成仕様設計書末尾を確認。コード終了HEAD `2e05d63d795a8fd2a1f14cda9c7c4470ae7ab724`。15分枠の`updateSurvivalNeeds/beginDeath/advanceDeath/finish/restoreSnapshot`の挙動は変更しない。
- **変更ファイル・コミット/blob**：`neo-wild/webgl3d.js` `b57a2961cb4024d8e30eadecb924b45d3db8f4bb` / `0a5f23bb6f0aca610e6636f5900846c5b5a3c726`、`neo-wild/game.js` `422b3838baa9bfdcbef0781bef5ddb72178a354c` / `eff2e93d7db3299fefab4bcc1adec1a2fdca7274`、`neo-wild/index.html` `2e05d63d795a8fd2a1f14cda9c7c4470ae7ab724` / `eff00c27d0118488526c3cb6cac97e30a4afc10d`（2本のcache rev）。neo-wild/外は無変更。
- **実プレイに見える改善**：(1) 3Dプレイヤー死亡時、猫・狐・狼の実メッシュ頂点を約70度横転させて地面に倒れる。頭・胴体・脚・耳・尾を同じ回転で動かし、単に垂直に沈み込む旧表現を改善。(2) 屋上巣の地面高さを横転の基準にし、死体メッシュが屋上面を貫通しないよう高さ下限を設け、影は屋上の元位置に保持。(3) Canvas2Dでも死亡姿勢を緩急つき0.9秒で横倒し/扁平化し、旧3.2秒の音減衰・画面フェード・余韻・リザルトと同期。(4) NPCモデル/地形・物理/既存SAVE_SCHEMA2・3チェックポイントのコードは変更なし。
- **動的QA**：実`webgl3d.js:animal/ellipsoid/pyramid`を頂点記録して、猫/狐/狼×地上/屋上64Z×立位/中間/倒位の**6組18描画PASS**。全種で頂点高さ低下・横移動・屋上面下抜け0・頂点数不変。例：猫Z平均16.38→5.61、狐20.70→7.04、狼25.44→9.10（地上）。実`game.js:drawCreature`を模擬Canvas2Dで3種×3姿勢 **9/9 PASS**。実`beginDeath/advanceDeath/finish`の3.19秒死亡画面非表示→3.21秒表示、SE/フェード/自動保存消去各1回・位置/時間凍結 **PASS**。実`updateSurvivalNeeds`の空腹0・巣内10秒50→26HP、空腹5・巣内1秒40→45.3HP、飢餓でHP0のみ死亡 **PASS**。実`audio.js:fadeForDeath/resetDeathFade`の2回呼出し重複防止・4音量遷移 **PASS**。HTMLが読み込む**JS6本全文構文6/6 PASS**。**模擬Canvas/頂点/DOM実関数であり、実ブラウザ10分・Android実機・物理パッド・GPU実機のE2Eではない**。
- **Pages**：コードHEAD `2e05d63d795a8fd2a1f14cda9c7c4470ae7ab724` の`build`/`deploy`は**未確認**。GitHubのcommit workflow wrapperはPRイベントのみ返し、該当SHAのworkflow_runs=[]、combined status=[]で、Pages run IDを取得できなかった。**公開反映済みとは言わない**。以前のコードHEAD `b1f6b7a...` はrun `41376775388`でbuild/deploy成功、ただし今回の証拠として流用しない。
- **進捗計測V2・最新HEADの証拠基準**：A **16.0/16**（飢餓→死亡/再開、実関数試験、game.js）、B **12.0/12**（6巣/屋上/備蓄、前15分枠41件）、C **9.0/12**（季節→橋→河川→地区の連続経路は検証待ち）、D **4.0/16**（20強敵の出現定義のみ、種別固有攻撃/外見/討伐保存は検証待ち）、E **8.0/8**（20能力継承の前枠100件）、F **9.0/12**（縦横HUD実ブラウザ矩形は検証待ち）、G **8.0/8**（SAVE_SCHEMA2/3CP/自動保存/再開は前枠検証、今回保存仕様変更なし）、H **4.0/6**（3D/2D描画と夜・草・月、FPS/当たり判定実ブラウザは検証待ち）、I **2.0/10**（実関数連結2点、実ブラウザ10分/Android/物理Pad各0、**最新HEADのPages build+deploy未確認でI5=0**）。**合計72.0/100、前回74.0→72.0、差-2.0**。減点はコードの後退ではなく、対象HEADのPages両successの証拠が取れないためI5を保留した結果。取得できた次枠でI5再評価。新規作業量や構文PASSでは加点しない。
- **次15分枠（具体的3件）**：(1) `game.js:updateSurvivalNeeds/update/eat/eatFromDen`の空腹0→食事→HP回復/巣回復を連続時系列で試験し、同フレームHP0/食事の優先順位を修正。(2) `restoreSnapshot/getCheckpoints/currentSnapshot`で死亡演出→3CP・同種リトライ・旧SAVE_SCHEMA2・20継承フラグの二重加算なしを実関数試験。(3) `wildlifeBridgeWaypoint/steerPursuit/updateIndoorRest`で冬可視遮蔽物→橋→雨宿り→地区のC4未完を試験し、破綻を修正。**今回の3D横転を再実装しない**。
- **次45分枠（具体的3件）**：(1) GitHub ActionsでコードHEAD `2e05d63...`とROADMAP後続HEADのPages run IDを取得し、build/deployの各job成功を照合。失敗ならログと原因を記録。(2) 縦390×844/411×768・横800×360/844×390/736×414/1536×691でタイトルの続きから・縦横アイコン・HUD/ミニマップ/SCORE/HUNTの実DOM矩形、3D/2D倒れ込み/音量/全画面を実ブラウザで確認。FPSと屋上死亡を検証しF/Hを再採点。(3) `spawnStrongBoss/resolveAttack/kill/drawStrongAnimal3D`で20種の固有戦闘→外見→報酬→保存を種類別に実関数で検査し、Dの未完成を修正。

## 共同スプリント・次担当｜2026/11/02 11時台 JST｜タイトル画面の再開導線・並び替え（UI-MENU-CONTINUE-FLOW-V5）｜ACTIVE_SPRINT_ID=DEATH-HUNGER-SEQ-V1（維持）
- **対象**：neo-wild/のみ。既存15分/45分枠を維持し新タスクは作らない。ユーザー画像の問題：『続きから』が見えず、説明文はタイトルの下ではなく縦横ボタンより後、不要な「廃都生存記」副題、項目順が逆転。
- **変更**：`neo-wild/index.html` commit `28d0f978130e3b464ccc7e12577b2eae1935cd2d`、`neo-wild/game.js` commit `e770e2b9e6cc95c3baa8a3c9e5a561a6cc57790f`、`neo-wild/visual.css` commit `a05ac31e73cf0e25adcbd29694e7c103f2b45448`。現行mainへ既存DOMと保存処理の最小差分を適用、index.htmlのJS/CSS rev更新。
- **結果**：タイトル→2行世界観→一番目立つ「続きからプレイ」（自動保存・チェックポイントの順で再開）／セーブなし「最初からプレイ」→種族（常時）→縦/横アイコン選択→出発地点→補助要素の順。旧サブタイトル削除。新規ゲーム設定の折りたたみ廃止。セーブありの場合は設定の末尾から新規作成も可能（既存確認ダイアログ維持）。チェックポイント3件とSAVE_SCHEMA2は改造なし。横画面は縦1列スクロールで順序を維持、極小横画面でサイズ縮小。
- **QA**：変更後の現行game.jsは `new Function` による全文構文 **PASS**。HTML要素順・削除対象・チェックポイント3 ID・cache rev確認 **PASS**。現行 `refreshSaveMenu` 実関数をDOM相当オブジェクトで実行し、セーブなし→「最初から」、自動セーブ→「続きから」、チェックポイントのみ→「続きから」の **3/3 PASS**。実ブラウザのレイアウト/FPS/Android実機/E2Eと、今回のHEADについてのPages build/deployは未確認。公開反映済みとは断定しない。
- **進捗計測V2**：A16.0/B12.0/C9.0/D4.0/E8.0/F9.0/G8.0/H4.0/I4.0、計 **74.0/100**（前回74.0、差0.0）。本修正は既存再開導線・未実機検証のF3条件を満たす新証拠ではないため加点なし。
- **次45分枠**：(1) タイトルでセーブなし／自動保存／3チェックポイントを実ブラウザで切替し、主ボタンが必ず見える状態で起動→再開を試験。(2) 390×844、411×768、800×360、844×390、736×414、1536×691の縦横でタイトル・2行・種族・縦横・開始地点の矩形/スクロール・選択をQA、必要に応じCSS最小修正。(3) Pagesの対象HEADのbuild/deploy両successと3D/2D保存回帰を確認。**次15分枠**：飢餓HP・死亡演出・リトライ・SAVE_SCHEMA2保存回帰を継続。タイトルUIは重複編集しない。

## 共同スプリント・次担当｜2026/11/02 11:15 JST｜15分枠｜ACTIVE_SPRINT_ID=DEATH-HUNGER-SEQ-V1（45分枠から継続）｜飢餓0→徐々にHP減少→倒れる→死亡画面
- **照合・HEAD**：開始main `875986770802bad448aebdcc76aa6965d9368e0a`、直近45分枠10:45の死亡演出と11:00の縦横アイコン、直近15分枠10:15の巣・セーブQA、Drive完成仕様設計書末尾を照合。コード終了HEAD `b1f6b7a21ead5a79685a222170ceff70d74814b8`。直前の3.2秒倒れ込み/画面暗転/音フェードは変更・再実装せず維持。
- **コード変更・blob**：`neo-wild/game.js` commit `db32cce1a2673137232af21c2504ba7ba8a4e0f7` / blob `7aed1a93a7e6e606717414c06a42a044c5120c82`、`neo-wild/index.html` commit `b1f6b7a21ead5a79685a222170ceff70d74814b8` / blob `6ea100ca15bbc5f79bfc2a317266dc00f37a30af`（game.js rev更新）。neo-wild/外の変更なし。
- **連動するプレイ改善4点**：(1) `updateSurvivalNeeds`を追加し、空腹0は7HP/秒から**2.4HP/秒**の経時減少へ変更。0到達フレームは残り時間に比例配分し、0未満にしない。空腹1〜15の1.2HP/秒は維持。(2) **空腹0では巣LV1〜3の受動回復で飢餓を相殺しない**。食事後は飢餓ダメージ停止、従来の食事HP回復・巣休息回復・巨大ゾウ継承効果は保持。(3) HP0の時点で直ちに`beginDeath`へ一度だけ遷移し、前45分枠の3.2秒の操作不能→倒れる→音/画面暗転→余韻→「死んでしまった」を通す。(4) NPC連続攻撃が同フレームでHP0を超えて重複しないよう攻撃ループを停止、ループ直後に死亡状態へ遷移。HUDの空腹0に「飢餓」を表示。
- **動的QA**：現行mainの実`updateSurvivalNeeds`を抽出実行し、空腹0の1秒/10秒/HP0、巣内/敵あり/低空腹/0跨ぎ/食後の回復と停止/能力の境界など**17/17 PASS**。実`beginDeath/advanceDeath`を0.035秒刻み92フレームで実行し3.185秒時点は死亡画面なし・3.22秒で一度だけ結果表示、操作解除・効果音・フェード一度、実`currentSnapshot`の空腹0生存保存・HP0/dying保存拒否を含む**13/13 PASS**。本番index.htmlが読み込む**6 JS全文構文6/6 PASS**。**模擬DOM/実関数の隔離・連結試験であり実ブラウザ10分E2Eではない**。
- **Pages**：対象コードHEAD `b1f6b7a21ead5a79685a222170ceff70d74814b8`、run **41376775388**、**build=success / report-build-status=success / deploy=success**（APIのjob単位で確認）。コード公開反映済み。本ROADMAP記録コミットのrunは別途確認。
- **進捗計測V2（共通100点、前回74.0→今回74.0、差0.0）**：A **16.0/16**（本回飢餓→死亡17+13件と前回再開イベント、game.js/Pages 41376775388）、B **12.0/12**（6巣/屋上備蓄/休息と2D3D草、前15分枠41件）、C **9.0/12**（冬→橋→河川→地区の連続動的検証待ち）、D **4.0/16**（20種の定義/出現は確認、固有AI・外見・討伐保存の種別結合は検証待ち）、E **8.0/8**（20種の素材消費・能力・重複保存100件、game.js）、F **9.0/12**（縦横HUD/全画面の実DOM矩形検証待ち）、G **8.0/8**（旧SAVE_SCHEMA2・3CP・自動保存/再開の前回22+41+11件、本回死亡中の保存拒否）、H **4.0/6**（WebGL/Canvas2D/夜・草・月光は既存検証、実ブラウザFPS/衝突/画面サイズ待ち）、I **4.0/10**（実関数試験＋対象HEADのPages両成功、ブラウザ10分/Android実機/物理Pad実機E2Eは0点・検証待ち）。**合計74.0/100、差0.0**。今回は既採点A/Gの仕様整合・致死境界修正であり、未検証条件の新規満点達成はないため加点しない。固定71点の指示は使用しない。
- **未試験**：実Android/実GPU/物理Pad、ブラウザ10分E2E、6画面サイズの実BoundingClientRect/FPS、HP0での実機音フェード、3CPからの死亡演出後復帰、冬可視遮蔽物→橋→雨宿り→地区、強敵20種の種類別固有攻撃・討伐・保存。
- **次15分枠（具体的3件）**：(1) `game.js:updateSurvivalNeeds/update/beginDeath/eat/eatFromDen`の空腹0→巣食事→飢餓停止→回復→HP0のフルゲーム経時ループを模擬DOMで実行、瀕死/食事同フレーム/旧セーブを検証。(2) `restoreSnapshot/getCheckpoints/currentSnapshot`で死亡演出後の同種リトライ・3CP・旧SAVE_SCHEMA2・20継承フラグ/巣LV2の二重加算なしを動的検査。(3) `wildlifeBridgeWaypoint/steerPursuit/updateIndoorRest`で冬遮蔽→橋→雨宿り→別地区のNPC/プレイヤー連続移動を実関数試験しC4不足を修正。
- **次45分枠（具体的3件）**：(1) `game.js:drawCreature/drawScene`と`webgl3d.js:animal`で猫/狐/狼の倒れ込み、3.2秒暗転、`audio.js:fadeForDeath/resetDeathFade`のリトライ復帰を縦横実ブラウザで検証・必要時修正。(2) `index.html/visual.css`の縦390×844/411×768、横800×360/844×390/736×414/1536×691の縦横アイコン・HUD/ミニマップ/SCORE/HUNT実矩形・全画面を検査しF/Hを判定。(3) `spawnStrongBoss/resolveAttack/kill/drawStrongAnimal3D`で20種の固有攻撃・2D3D・討伐報酬・保存を種類別に結合試験しDを再採点。

## 2026/11/02 11:00 JST｜45分枠表示修正・タイトル画面の縦/横アイコン（UI-ORIENTATION-ICON-V2）
- 直前の縦/横選択2ボタンを維持し、横向きアイコンを横長69×36 CSS px・左右矢印入り・端末画面/ベゼル/側面ボタン付きへ変更。縦向きは29×45 CSS px。高さ520px以下の横画面では横50×27・縦21×32に縮小。対象 `neo-wild/index.html`, `neo-wild/visual.css` のみ。変更コミット `62b22b53132dc60df1fec1e2f327bf737ed20010`, `cc7ca5bab5537882f6782f35ee3e1769f5dffc58`。index.html の visual.css キャッシュ rev 更新。
- QA：HTMLの矢印要素とCSSの画面形状・レスポンシブ定義の存在確認PASS。実ブラウザ表示・Android実機・Pages build/deploy未確認（新規検証未実施）。視覚選択のみ変更。ゲーム本体・SAVE_SCHEMA2・Gamepadは無変更。
- 進捗計測V2：A16.0 / B12.0 / C9.0 / D4.0 / E8.0 / F9.0 / G8.0 / H4.0 / I4.0 = **74.0/100**（前回74.0、差0.0）。アイコン修正だけでは未検証のF3（縦横HUD/実画面）の加点条件を満たさない。
- 次45分枠：縦390×844/横800×360/844×390で両アイコンと選択強調・メニューの当たり判定/見切れを実ブラウザ確認、必要なら最小修正。次15分枠：飢餓HPと死亡→保存/再開の回帰を継続（UIに重複変更しない）。公開確認は新しいPages runでbuild/deploy両successのみを採用。

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
