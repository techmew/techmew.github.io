# 2026-11-05 18:20 JST / 20分担当
PHASE=A_FEATURES / 地域生態

実装: era-ecology.js に決定的な地域間移動回廊（2↔5↔3↔7↔4↔2、1↔6）を追加。地域遷移のmigration状態に応じて草食群と追跡捕食者の既存スポーン抽選重みを移出側/移入側で変更。fauna.js の既存食物連鎖/気象/生息域制限を保持。新規スポーン処理は増やさない。

実装コミット: e2036afaccfe6181e19d0929b8aaefbc813ac4f8, 20ba3df85cdb9c5c306b6fdc5ba3ffbf3c1e5010
対象blob: era-ecology.js e74db479fac2f0bd056ca133879f0a038dd3546b; fauna.js e6db2cd8a6cc3daf784a2e8b6ae5d6b771536b8e
検証: 両JS構文PASS、隔離実行で移動回廊の発火と fauna.weight 呼出しPASS。スマホ実機/旧セーブE2E/Pages描画は未検証。
保護: HTML/CSS/UI/ROADMAP.mdは未変更。所有3体・放流IDロジック未変更。
次: 00分担当はセーブ/放流永続ID回帰、40分担当は群れ移動の視覚表現と描画座標同期。実移動AIおよび新地域の地形衝突は未実装。
