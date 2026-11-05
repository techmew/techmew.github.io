# 20分担当 2026-11-06 00:20 JST
PHASE=A_FEATURES / 実装コミット 85b77456adf286b17353833a9931c89a20dab487
対象 neo-wild/fauna.js blob de50472c93256273864d36d4d29e2fb1c91c1cdc
実装: 雷雨・台風・豪雨時に既存出現枠で隠れ場の小動物・腐肉食寄りの種を増やし、露出地の鳥・草食種を減らす。天候回復後は草食獣の再出現を促す。地域・年代ロック、過密上限、既存UI、保存構造は変更しない。
検証: JavaScript構文PASS、WildFauna.chooseをCLEAR/THUNDER/TYPHOONで実行PASS。旧セーブ回帰・Android実機・WebGL描画は未検証。
次担当: 40分は表示構成固定。00分は保存構造固定。放流個体AIは本変更の対象外で継続要確認。
ROADMAP.md変更なし。
