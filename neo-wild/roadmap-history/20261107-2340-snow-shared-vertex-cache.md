# 2026-11-07 23:40 JST | 40分担当 | 雪メッシュ共有頂点サンプルキャッシュ
PHASE=A_FEATURES。実装開始前main=e8c1050baf56de54d4e2463a24acc5fbff2375bc。webgl3d.js blob=d8112a1b5afce1ded5a868dc637ad355dcb02f4f。index.html blob=d044cd6a494b8e7c57ec2b1cc4a3de815d52c7ff。
実装：webgl3d.js雪面ループに1描画フレーム限定のmaskCache/heightCacheを追加。隣接セルが共有する同一世界座標の積雪フィールド（広域/微細ノイズ・標高・水面）と地形標高を再計算せず再利用する。各フレーム新規Mapで地形/天候変化追従、出力頂点/三角形/法線/雪判定閾値を変更しない。標高非有限値を0へ安全化。index.htmlはwebgl3d.jsのキャッシュバスターのみ変更。保存・年表・ガチャ・3体タイトルUI・debug UI・旧SAVE_SCHEMA2は無変更。
コミット webgl3d.js 63d1dc5825bef475426e874e39024799c1bea732、index.html 83b6a2fe08b5c0d8287a6858a217eedb85c87e4f。構文 new Function PASS、変更後のGitHub blob再取得一致。Android実機・実WebGL・雪境界シームレス性・FPS定量測定・Pages配信は検証待ち（完了扱い禁止）。
未完/次回：
- 40分（実装中）webgl3d.js 雪の斜面・岩・草遷移、チャンク境界の実機検証と必要時修復。30種固有3D造形・攻撃部位と顔座標の実機品質改善。ufo-events.js/apparitions.js異常存在と巨大生物AI拡張。
- 20分（実装中）mountain.jsの右上林/山岳/河川上流と標高・水源・バイオーム整合、通行判定。40分の高さAPIとの整合を維持。
- 00分（検証待ち）save-backup.js/world-history.js/game.jsのAndroid JSON保存/復元・年表表示、死亡/放流ID永久保護、旧4/5体・リーダー・新規0年8時。
- 40分（検証待ち）デバッグON/OFFの通常開始ボタン連動、Android UI実動作。
保護基準2a8b20e7および最新mainの追加機能を保持。ROADMAP.md編集禁止、古いコミットへのreset/revert/force禁止。完了済みガチャ上部2ボタンは回帰条件に留め、毎回監査だけで終了しない。
