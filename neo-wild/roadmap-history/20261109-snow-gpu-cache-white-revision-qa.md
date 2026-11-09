# WILD RECLAIM｜2026-11-09｜雪の白色保持・モバイルGPU負荷削減・キャッシュ整合
ACTIVE_SPRINT_ID: WR_PHASEA_20261109_SNOW_PERFORMANCE
PHASE=A_FEATURES（機能統合・実機検証未完。Bへ切替しない）
対象: techmew/techmew.github.io main /neo-wild/ のみ
作業起点: main 1ab41ae72bcd32069a163bceb460ebf0f257cc64（過去のcommitへ巻戻しなし）
記録前の確認HEAD: f5b7ddf128d3e5c271cae7cf89dbea0b729986b5
セーブ・タイトル・UI固定の保護基準: 2a8b20e7419e1d93105018835fa81e9d50788e8b

## 実コミット（現行mainに追加のみ）
- a18ba06b263339fade2cc550f5d79b91711226b1: neo-wild/webgl3d.js。積雪三角メッシュを動的動物/植生バッファから分離し、専用WebGL GPUバッファに格納。カメラ256ワールド単位の区間・積雪量・5秒ごとの水面状態・表示寸法・世界座標/視点に変化がない限り、計算とGPU転送を再利用。雪のRGB指定 `color("#f4f6f3")` を保全。カメラ移動時の欠けを避けるオーバースキャン。WebGLコンテキスト復帰時にGPU雪バッファとキャッシュを破棄して作り直す。追加stats: snowRebuilds/snowTriangles。既存WebGL不調時のCanvas2Dフォールバック維持。
- f5b7ddf128d3e5c271cae7cf89dbea0b729986b5: neo-wild/index.html。既存script 27本のクエリ版指定を最新の各JS blob SHA先頭12文字に同期。タグ/文言/配置/ボタン/画面構成に一切変更なし。キャッシュに旧JSが残る不整合を回避。

## 今回の検査（コードと関数モック）
- JS構文: webgl3d.js/game.js/squad-core.js/world-time.js/trophy-records.js/save-backup.js PASS。
- 27/27スクリプトのrev・HTMLタイトル（動物3枠→続きから→最下部バックアップ）順序PASS。書き換えはJSスクリプトのrev値のみ。
- 雪GPUバッファ独立、キー一致時再利用、動的メッシュ維持、WebGL復帰、Canvas2Dフォールバック、白系RGB設定の静的回帰PASS。
- 旧所有5体維持・リーダー交代・死亡永久除外・放流永久除外と旧編成復活拒否: squad-core.js実行モックPASS。
- 120秒=世界YEAR 1と年代3倍、257トロフィーID一意、JSONバックアップchecksumおよび死亡台帳破損の拒否: 関数モックPASS。
- 今回の計13検査PASS。Androidの実フレーム描画/FPSや全動物操作E2EをPASSと報告しない。

## 未完了・次担当への具体的引継ぎ
- 【40分 / 検証待ち】Android Chromeで雪が白く描画されるか、雪中カメラ移動の継ぎ目、雪表示前後のfps/メモリとsnowRebuilds増加数を比較。WebGL/Canvas2D双方を試す。対象: webgl3d.js の雪キャッシュ、game.js のdrawWorldSnow2D。負荷がまだ大きければ2D雪もキャッシュ検討。既存UI/セーブは変更禁止。
- 【40分・20分 / 検証待ち】河川・洪水と雪の境界、山岳・水源・右側地形の物理一致、季節と床高度を実機で確認し、問題時のみ最新mainへ最小差分修正。対象 mountain.js/webgl3d.js/fauna.js。
- 【00分 / 検証待ち】Android JSONダウンロード/読み込み、旧SAVE_SCHEMA2/旧4・5体、leaderId、死亡・放流永久ID、容量不足/旧タブ同時書込、年表表示を実操作。対象 save-backup.js/squad-core.js/world-history.js/game.js。
- 【40分 / 検証待ち】全35種の実プレイ、飛行・水中・戦闘・顔位置・文字列ID・NaN、57分以上の連続FPS（短時間も）を実端末で試す。対象 game.js/webgl3d.js。
- 【全担当 / 未完】隕石・津波・地割れ/崩落・伝染病・異星基地/怪獣の恒久地形影響など未完成機能の実統合、オンライン共有世界のサーバー側、257個の全トロフィー条件E2Eとバランス確認。単なる調査のみで次回を終えない。
- 【全担当 / 検証待ち】GitHub Pagesの最新HTML公開とAndroidのキャッシュ反映。GitHub Actionsのビルド成功は実機FPS/実プレイ成功を保証しない。
- 【保護】タイトル・所有3枠・ガチャ・バックアップUI、操作1体＋非同行2体、旧4/5生存者、leaderId、死亡/放流ID永久保護、旧SAVE_SCHEMA2、0年08時・旧世界継続、100年イベント圧縮、年表、ROADMAP.mdを維持。既存履歴の編集削除禁止。
