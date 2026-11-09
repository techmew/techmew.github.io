# WILD RECLAIM｜2026-11-09｜山岳土砂崩れ・3D造形・生態・トロフィー
ACTIVE_SPRINT_ID: WR_PHASEA_20261109_LANDSLIDE_QUALITY
PHASE=A_FEATURES 継続。実機未検証項目は完了にしない。
対象: techmew/techmew.github.io/main/neo-wild/ のみ
開始時 HEAD: f35d1aa514a9299a063d840cc5c7d2ad07934e5b
記録前 HEAD: 42b66e76050b2955a7925d3e19ce548905234dda
既存下限保護: 2a8b20e7419e1d93105018835fa81e9d50788e8b（作業起点は現行main）
ROADMAP.md と過去小型履歴の上書き・削除は行わない。

## 実装・コミット
- 38dbba1138a6293a550fe4c3c4646f3b8370ca96 disaster-world.js: 降雨/雷雨がある場合に限り山岳で低頻度の斜面崩落を抽選。実際のWildMountainの中心線・高さ勾配・既存衝突で安全地点を抽選。7秒の警告、野生NPCの避難、着弾ダメージと生存個体の退避、楕円形の障害物と迂回路、食料資源の局所低下と数年での回復、旧災害保存キーへの追加フィールドと復元、NEW GAMEだけのリセットを実装。HTML/UI/主セーブschema変更なし。
- 118b569e8d2fa575671260eaed21d7bc77cb8737 world-history.js: 実際の「山岳の土砂崩れ」のみ年表へ記録。未来イベントの先行表示なし。
- 7eb55cdab1a3af27d71a07368364a7bd0d6a002a webgl3d.js: 現行WildMountain高さに合わせた立体的な堆積土・岩片を静的GPUメッシュへ収録。発生・消滅時のみ当該領域を再構築。既存積雪キャッシュ・地震の揺れ・建物・倒木を保持。
- a3c1b7130ac50ab5de5c98156b07d3936aa6524e disaster-world.js: WebGL上の不自然な平面土砂二重描画を防止。Canvas2Dフォールバックの岩片、双方の粉塵と危険標識は維持。
- e70a3b7c2bb3f94e77ab1dffd64ba58f1a985441 trophy-records.js: 土砂崩れ目撃・生還の2個を実イベント条件付き追加。トロフィー計259種、既存257種のIDは保持。
- 44fc634d318015a2b72c0b094201fd4f6869c161 game.js: 土砂崩れの危険距離・脱出を既存の実績記録ループへ接続。直接操作・戦闘・HUD・セーブには変更なし。
- 42b66e76050b2955a7925d3e19ce548905234dda index.html: 上記5本のJS rev識別子だけをblob SHAへ合わせ、HTMLタグ・レイアウト・配色・文言は変更なし。

## 実行済み回帰検査
- 現行27本すべてのJavaScript構文検査 PASS（14+13本）。
- 27本スクリプトのHTML読み込み識別子と現行blob一致、タイトル3枠→続きから→JSONバックアップの順、ボタン存在 PASS。
- 関数モック: 雨限定、山岳高低差、7秒警告、着弾・NPC被害と退避、堆積物の物理衝突/迂回・時間経過での復旧、採食低下、イベント保存・復元、明示NEW GAMEリセット PASS。
- 本物の mountain.js 高さ/衝突を使う山岳24地点（両側斜面）の候補成立確認 PASS。ゲーム内物理衝突と一貫した山岳の経路を採用。
- 旧5体の生存保持・リーダー切替・死亡/放流ID復活防止、120秒/世界YEARと3倍イベント年代、旧JSONバックアップへの災害内容の収録、世界年表の実発生/未来除外、259個トロフィーID重複なし・目撃/生還の永続化、模擬回帰 PASS。
- GitHub Pages main 本体のデプロイ成功確認。コミット範囲はneo-wild/の6ファイル限定（今回の引継ぎ追加前）。

## 未完・次担当
- 【40分／検証待ち】Android Chromeで土砂崩れの3D岩片・地表高さと遮蔽、Canvas2D、雪の白色、地震揺れ、30秒・長時間FPS/メモリを実機確認。特に静的GPUの再構築回数、積雪メッシュの境目を計測。対象 webgl3d.js/disaster-world.js/game.js。
- 【20分／実装中】山岳土砂崩れの川・沢・崖・既存動物AIとの接続、ルート選択・群れ避難、土砂の天然ダムや一時的な流路変化は未実装。対象 mountain.js/disaster-world.js/fauna.js。迂回路を恒久封鎖しない。
- 【00分／検証待ち】AndroidでJSONバックアップダウンロード・復元、容量不足、複数タブ競合、SAVE_SCHEMA2・旧4/5体、leaderId、死亡/放流永久ID、年表、0年08:00 NEW GAMEとContinueを実機で確認。対象 save-backup.js/squad-core.js/world-history.js/game.js。
- 【全担当／未実装/実装中】津波・疫病・巨獣/異星基地の地形/生態への物理影響、35動物の実戦E2E、259トロフィーの条件全件確認、サーバー側共有プレイは未完成。PHASE Bに切替しない。
- 【永続保護】UI/HTML/CSS固定、操作1体+非同行2体・旧4/5体生存、放流4性格・永久死亡/放流ID、roster.leaderId、旧セーブ保存形式、旧年表、明示新世界0年8時、100年圧縮、既存雪・水系・3D・その他機能の回帰保全。他担当の変更を古いコードで上書きしない。
