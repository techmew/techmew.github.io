# WILD RECLAIM｜2026-11-09｜地割れの実プレイ化と災害バックアップ統合
ACTIVE_SPRINT_ID: WR_PHASEA_20261109_FISSURE
PHASE=A_FEATURES（全体完成ではない）
対象: techmew/techmew.github.io/main/neo-wild/のみ
作業前HEAD: 2ac601778e2d7249a2a2b6f8a4f5387cb3e29887
記録直前HEAD: 12f84575f44e4f0b7bf31f596afc170c91ebccc5
保護基準（作業起点ではない）: 2a8b20e7419e1d93105018835fa81e9d50788e8b

## 今回の実コード更新
- `724f63ffa512582fe390f4bb79a5c07e8b7d4c52` disaster-world.js: 既存地震予兆に続く地割れ発生。安全な場所と迂回路を確認した場合だけ発生。地割れの実通行障害は capsule segment で衝突計算。野生NPCは脅威から逃げ、避難中は採食・休息を中断。WebGL/Canvas2D共通のワールド座標上に暗色地割れを描画。新規イベントを既存 `wild_reclaim_disasters_v1` に保存し、世界歴史へ記録。恒久的な新UIや新しいSAVE_SCHEMAは追加しない。地割れは現段階では数年後に自然復旧する一時地形。
- `91f902b987463509911eb0a81bb6587b114d5c3e` world-history.js: 本当に発生した地割れを年表「地震による地割れ」で表示。年代到達と混同しない。
- `7b70f0fd81b039701c614c8641cea2ba3e590c12` save-backup.js: プレフィックスの異なる既存災害キー `wild_reclaim_disasters_v1` をJSONバックアップに含める。旧バックアップに含まれない場合、現在の端末の災害記録を黙って削除しない。死亡・放流ID保護、旧4/5体、SAVE_SCHEMA2、タイトルUIを変更しない。
- `7515271677c4c1b930b6630f12fa7f72194b63ce` index.html: 変更した3ファイルのscript revだけ更新。要素・CSS・ボタン配置は変更しない。
- `c00f0446dbb8fabd966bab963b517225fb8040f4` disaster-world.js: 古いバックアップへ復帰した際、未来の災害が先行して出現しないようイベント開始年で抑制。期限切れ判定も確認。
- `12f84575f44e4f0b7bf31f596afc170c91ebccc5` index.html: 上記時刻保護修正後のscript revのみ更新。

## 実行検査（達成した範囲）
- 本更新の JS 構文・27/27スクリプトJS構文 PASS。
- 地震予兆→倒木と地割れ発生、物理衝突、迂回、historyとlocalStorage往復、リセット、古い災害保存形式の復元: 関数モック PASS。
- 世界時刻を巻き戻した時の未来の地割れ非表示、正しい年での衝突、期限切れの消滅: 関数モック PASS。
- JSONバックアップ：新しい災害キーの収録とchecksum、旧ファイル受理、旧データ復元後も端末の地割れ/死亡ID消失なし、再起動: 関数モック PASS。
- HTML scripts 27件の現blob rev照合、所有3枠→続きから→バックアップのUI順維持、タイトルボタン維持: PASS（最終ファイルで再点検対象）。
- 旧保護コミットへの rollback/reset/revert は実行せず、GitHub contents現行blob SHA指定で更新。
- 本環境ではAndroid Chromeのタップ操作・GPU実描画・FPS・WebGL障害回復・長時間プレイは未検証であり「完了」としない。

## 繰越し残件と担当
- 【00分・検証待ち】AndroidでJSON保存/読み込み、16MB上限、容量不足、旧4/5体、leaderId、放流/死亡ID永久保護、旧SAVE_SCHEMA2/3チェックポイント、旧タブ衝突を実機確認。対象 save-backup.js/game.js/squad-core.js/world-history.js。
- 【20分・実装中】地震による地割れと右側山岳/川源の地形・水系・AI経路が自然に交差するか実機確認。将来の地形恒久変化を小さな安全区間と迂回経路の保証付きで実装。対象 mountain.js/disaster-world.js/fauna.js。
- 【40分・検証待ち】今回の新規地割れがWebGL/2D両方で地表と合い、30秒以上の移動/当たり判定/カメラ俯瞰でちらつかず、雪色が白・FPSが実測で回復するかAndroidで確認。対象 webgl3d.js/game.js/disaster-world.js。
- 【全担当・未完】津波・隕石・疫病・大崩落・異星基地・怪獣の永続地形効果、257トロフィー個別E2E、35動物の実操作/Pad/描画、バックエンド上の共有世界は依然未完成。PHASE=Bへ切替しない。
- 【全担当・保護】最新mainを毎回取得、他枠の差分とblob SHAを確認。UI/HTML/CSSの既存配置/文言・所有合計3体(操作1+非同行2)・旧4/5体生存者・leaderId・放流と死亡の永久ID・NEW GAME 0年08:00・旧世界時計・100年圧縮・JSONボタンと年表を回帰保全。ROADMAP.mdと既存小型履歴は編集削除禁止。
