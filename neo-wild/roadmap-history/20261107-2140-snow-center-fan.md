# 2026-11-07 21:40 JST / 40分担当 / PHASE=A_FEATURES
開始HEAD: 1ed7866d81ab2f81b66b4281cc486a01623c7a5a（最新main起点）
今回の実装: webgl3d.js の雪被覆32unitセルを、従来の対角線2三角形から、世界座標で共有する辺中点＋中心点の8三角形ファンへ変更。山の曲面上で雪線が対角線に沿って角張る現象を軽減し、隣接セル境界の標高サンプルと雪マスクが一致するよう維持。地形衝突は既存WildMountain.heightを参照。ゲームのUI/保存/所有数/旧IDは無変更。index.htmlのwebgl3dキャッシュrev更新。
実装コミット: 80de9de5a8398b7333dc9beda3018b0e0c3a8520 (webgl3d.js), b839af35cd3cb0338f7faf0e0aa3ff03befa068c (index.html)。
検査: JS構文(webgl3d/squad-gacha/save-backup/world-history/debug-mode)合格。snowクリップ/世界座標中点/高さ共有とHTMLキャッシュ参照確認。ガチャ上部「この個体で決定」「ガチャ結果をキャンセル」既存実装を保持。ブラウザWebGLの実描画/Android FPS/長時間/JSON読み込み/年表は未検証。
未完/担当:
- 検証待ち（40分）: Android/WebGLで積雪境界・隣接メッシュのちらつき、FPS(8fanで従来2triより描画負荷増)・遠景描画を実測。問題があれば可視領域限定/LOD導入。対象 webgl3d.js。
- 実装中（40分）: 動物30種の専用3D体型・顔の攻撃中の座標・四脚/二脚モーション、UFO/怪異/巨大存在の実挙動。対象 webgl3d.js/ufo-events.js/apparitions.js。
- 実装中（20分）: 右上林→山岳→河川の上下流標高と雪・地形判定の統一。対象 mountain.js/terrain API。20分担当のコードを旧版で上書きしない。
- 検証待ち（00分）: JSON保存/読み込み、旧4/5体とSAVE_SCHEMA2、死亡/放流ID永久保護、年表、世界0年8時。対象 save-backup.js/world-history.js/game.js。
- 検証待ち（40分）: デバッグモードON/OFF・タイトル通常開始ボタン統合・各設定ON/OFFのAndroid実機E2E。対象 debug-mode.js/game.js。
- 検証待ち（40分）: ガチャ上部決定/キャンセルの実機操作・ガチャ権不変・候補採用とリーダー保存。対象 squad-gacha-ui.js。
保護基準: commit 2a8b20e7419e1d93105018835fa81e9d50788e8b は下限、常に最新mainから。タイトル3枠/JSONバックアップ/年表/最大3体(旧4/5保護)/死亡放流永久ID/3D固有技/デバッグ新UI保持。ROADMAP.md編集禁止。
