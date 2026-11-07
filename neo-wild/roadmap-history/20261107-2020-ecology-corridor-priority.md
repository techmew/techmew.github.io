# 2026-11-07 20-minute ecology continuation
PHASE=A_FEATURES / latest-main-only. Implementation commit 84472020d786d2c2fb403488f142fcb83d7e8cf9; era-ecology.js blob 68496c0a2a65b9bea85a706d2c5111d4297e0815.
実装中: 複数の活動中回廊が同じ地域に接続するとき、先頭の回廊を固定選択せず食料・捕食圧の生息適性差が最大の回廊を選ぶ。元の人口倍率上限、8地域、世界年、UI、セーブは不変更。
検証待ち: ブラウザ実プレイ、JS実行、地域間の群れ移動の体感・長時間密度。担当20分: era-ecology.js migration() と実NPCスポーン側の呼び出し。
実装中: 右上林と山の標高・源流・雪の継ぎ目、実歩行の接合テスト。担当20分 mountain.js height/headwaterAt/blocked; 描画側40分へ snowCover/world-coordinate seam を引継ぎ。
検証待ち: Android JSONバックアップ/読込、年表実表示、旧4/5体、SAVE_SCHEMA2、死亡・放流IDの復活防止。担当00分 save-backup.js/world-history.js/game.js。
未着手・継続: 生態AIの群れ・救助・感染・死骸・学習、災害地形連動、30種固有動作/生息域、地続きの新地域。20分担当、各関数を最新mainから確認して実装。
保護: UI完全固定（明示済みタイトル3枠下続きから、JSONボタン、注意書きを含む）。死亡/放流永久ID、リーダー、旧セーブ、0年8時、30種描画を保持。ROADMAP.mdと既存履歴は変更しない。
検査: GitHub blob再取得一致。JS構文/起動/旧セーブ/Android E2Eは未実施、完了扱い禁止。