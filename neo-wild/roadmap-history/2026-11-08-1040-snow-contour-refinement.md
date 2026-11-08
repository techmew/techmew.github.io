# 40分担当 2026-11-08 雪境界補間

実装: webgl3d.js の積雪ポリゴン輪郭交点を、線形マスク補間からワールド座標 field() の6段二分探索に変更。地形高度・UI・保存処理は未変更。
実装コミット: 0273a5ea2054483934d2ce8db63a5baaa2ea0b90
更新後blob: fdf49d1a9a5d3a5c253b2b2b8d271c1ca2dc899c
確認時main: 0273a5ea2054483934d2ce8db63a5baaa2ea0b90
構文: V8 new Function 合格。実機/WebGL描画・FPS・雪継ぎ目の目視は検証待ち。

未完と担当:
- 40分: 積雪チャンクの境界・Z-fighting実画面検証、30種固有3D/顔・攻撃座標、UFO/怪異/怪獣の実プレイAI。次: webgl3d.js の snow clip/surface、animal描画、ufo-events.js。
- 20分: 林/山岳・川の上流と下流の地形整合、通行高度API。次: WildMountain.height/snowCover。
- 00分: 旧4/5体、leaderId、死亡/放流永久ID、SAVE_SCHEMA2保存回帰。次: game.js / save-backup.js。
- 検証待ち: Android JSONバックアップ保存/読込、年表実表示、旧セーブ実機、WebGL/Canvas・スマホ・ゲームパッド。
- 未着手: プレイヤー不在中も進化する永続世界・封印解除と全員参加ボス。サーバー権威型世界状態/定期更新/イベントログの設計と実装が必要。ブラウザの閉じたタブだけでは常時稼働しない。

保護: UI全固定、タイトル3枠/続きから/JSON、ガチャ採用・キャンセル、放流/死亡永久ID、既存セーブ、ROADMAP.md不変更。PHASE=A_FEATURES。
