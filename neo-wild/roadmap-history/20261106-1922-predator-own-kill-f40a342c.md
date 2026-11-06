# 2026-11-06 19:22 JST | 20分担当 狩り後の敵の食事
PHASE=A_FEATURES / starting HEAD f40a342c07aa04ef728aa4bd2c3d6a3437b1bb48 / game.js blob 623039bba9a1e546d8f2bf7b65e31c5bf862c9de.
自ら殺した動物の死骸を24秒確保し優先して戻り、2～6回かけて実際に食べる。捕食動作・肉量の減少・HP回復・食べ残しの解放を統合。ワシの着地と水辺ハンターも対象。予約中の横取り不可。SAVE_SCHEMA2に追加プロパティだけを使用。
JS全体構文PASS。個体専有／複数回摂食／HP回復／横取り防止／食べ残し／猛禽／水辺の隔離テストPASS。Android・WebGL実動作、旧4/5所有セーブ、30種個別動作のE2Eは未検証。
既存UI/HTML/CSS、world time、ガチャ、旧セーブ、放流・死亡ID、ROADMAPには無変更。40分担当は3D捕食姿勢、00分担当は捕食予約の保存復元を確認すること。
