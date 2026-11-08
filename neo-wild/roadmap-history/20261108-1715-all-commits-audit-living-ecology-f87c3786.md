# WILD RECLAIM｜2026-11-08 17:15 JST｜全履歴棚卸・実装引継ぎ
PHASE=A_FEATURES
先行最新 main: c3111905adedd09ce719d12743d54c5eb400ee25
neo-wild 関連コミット 2,010 件の一覧を21ページ分取得。全コミットの個別パッチの完全検査と全機能E2Eは未完。
保護基準: 2a8b20e7419e1d93105018835fa81e9d50788e8b（比較時点で146件 ahead、0 behind）。旧版reset/revert/force pushなし。
今回の実装コミット（現行mainへblob SHA条件付き差分）:
- b389ae6a31730486ae96a373bb6558cc2d8f5be2: era-ecology.js / offlineAdvance : 2実時間h=1生態更新、最大24h=12回。世界YEAR、プレイヤー年齢、所有・死亡放流IDを動かさない。8地区の採食・動物数・捕食圧・勢力・回廊移住。
- ed70efc12a9423260707357fb41a685b45a305f9: game.js / 最新正常オートセーブの復元時だけ不在期間の生態計算、既存生態に連動した実NPC出現予算、実発生履歴を旧SAVE_SCHEMA2内へ40件保存、異星偵察機死亡の死骸・生態反映。
- 609082d2381a651cb7dfff2722c7708a0d9b1856: ufo-events.js / 異星偵察機によるNPC死亡を実コールバック接続、同一個体二重処理禁止。
- f87c378665eea67e3b571f507f6ab3e84bd6724f: world-history.js / 本当に発生した不在中生態変化・異星偵察機被害を表示。年代到達≠発生の区別を維持。
書込後の全4ファイルを再取得しblob SHA一致確認済み。
テスト合格:
- V8構文×4、純粋生態APIの30分ノーオペ・8h/4段階・120h/12段階上限・未来日不適用・8地区HP/餌/捕食者境界・入力不変。
- 実ufo-events.js tick実行モック: NPCが異星偵察機で死亡・コールバック1回・イベント記録・再tickで重複なし。
- 実world-history.js entries実行モック: YEAR10実際の2件＋開始、YEAR11の未来事象を拒否。
- 既存squad-core.js実行モック: 旧5体保全、leaderId選択、死亡ID永久、放流ID永久、残3体を確認。
- 既存save-backup.js実行モック: JSON構築/検証、改ざんチェックサム拒否、破損永久離脱台帳拒否。
未完/検証待ち:
- [検証待ち・00分] AndroidでのJSONバックアップ保存・読込・年表表示、旧4/5体・SAVE_SCHEMA2本実機、容量不足/複数タブ競合、保護台帳。対象 save-backup.js / world-history.js / game.js。
- [実装中・20分] 右上林→山岳→河川の勾配、headwater高度・衝突・生態移住の実連動、季節の野生動物、雪境界。対象 mountain.js / era-ecology.js / fauna.js。
- [検証待ち・40分] 雪継ぎ目の実WebGL表示/白色/FPS、文字列ID有限座標、顔/攻撃同期、カエルの実打撃距離、全種固有モーション。対象 webgl3d.js / game.js。
- [未完・40分] 異常事件・巨大生物・怪獣・異星人の更なる実行動と世界変革、封印解除から複数プレイヤーの討伐、地形永久変化。対象 ufo-events.js / apparitions.js / game.js / disaster-world.js。共有世界サーバー・データベースが未導入。
- [未完・横断] 現行trophy-records.jsは65件。200以上の別条件トロフィーはまだ未実装。WildFauna.playableRosterは35種だがsquad-core.js playableは18種で、35種すべての陸空水操作は未達。対象 trophy-records.js / squad-core.js / game.js / webgl3d.js。
- [未検証・全担当] WebGL実機・Android/タッチ/Pad/長時間・旧セーブE2E・Pages配信。コード静的＋モック検証済みでも完了としない。
共通永久保護: タイトル/ガチャの指定UI、所持1+非同行2・旧5体生存者、leaderId、死亡放流個体ID、SAVE_SCHEMA2、0年8時新規・継続の時計、ROADMAP.md無編集。既存UI/HTML/CSSを変更しない。
次回の順序: 最新main HEAD/対象blob取得→未完実コード→構文/ゲーム実行試験→条件付き差分コミット→新規履歴記録。古い基準コミットからの上書き禁止。
