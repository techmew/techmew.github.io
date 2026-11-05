# 動物鳴き声音源 / ライセンス管理（2026-11-06）

WILD RECLAIM の音声実装は `audio.js` の `ANIMAL_VOCALS` と `SYNTH_VOICE_SHAPES`。スタート画面・UIには手を加えない。

## ライセンス
SFXMint 公式: https://sfxmint.com/license
- 以下のファイルはサイトが **CC0 1.0** と明記。商用ゲームへの組み込み・音程加工・直接リンク可。
- 音源は **AI生成／合成による動物声の効果音** であり、野外で録った実物の録音ではない。
- ゲーム中は `https://sfxmint.com/dl/<file>.mp3` を対応する種の初回再生前に読み込み、WebAudio の音量・ミュート処理へ接続する。通信失敗時は独自合成音へフォールバック。
- 再生中に音声を毎秒大量ロードしない。同一音声をキャッシュし、攻撃・必殺技でのみ短く鳴らす。

## 対応一覧（公開音源24種）
|操作種|外部ファイル|備考|
|---|---|---|
|cat|animal-cat-meow-34|猫|
|dog|animal-dog-bark-25|犬|
|fox|fox-01|狐|
|wolf|wolf-growl-01|狼|
|deer|deer-call-01|鹿|
|boar|boar-grunt-02|猪|
|crow|crow-caw-01|カラス|
|pigeon|pigeon-coo-01|鳩|
|macaque|monkey-chatter-01|猿|
|blackBear|bear-growl-01|クマ|
|serow|goat-bleat-01|近縁のヤギ声を加工した代用|
|manul|animal-cat-meow-34|ネコ声を低く加工した代用|
|tibetanFox|fox-01|狐声を高く加工した代用|
|lion|lion-roar-02|ライオン|
|tiger|short-tiger-roar-01|トラ|
|cheetah|animal-cat-meow-34|ネコ声を高く加工した代用|
|elephant|elephant-trumpet-01|ゾウ|
|hippo|hippo-04|カバ|
|gorilla|monkey-chatter-01|サル声を低く加工した代用|
|zebra|zebra-02|シマウマ|
|hyena|hyena-laugh-10|ハイエナ|
|wildDog|animal-dog-bark-25|犬声を加工した代用|
|hedgehog|hedgehog-07|ハリネズミ|
|armadillo|hedgehog-07|小動物声を低く加工した代用|

## 実録・種固有音源のない6種（オリジナル合成効果音）
- otter: 短い甲高い声を模した電子音
- carp: 水中泡音（魚の鳴き声と誤称しない）
- tanuki: 野犬風の独自合成声（実録ではない）
- badger: 低い唸りを模した独自合成声
- shoebill: くちばしの打音を模した独自合成音（実録ではない）
- giraffe: 低音の鳴動を模した独自合成音

## 検証・残課題
- JavaScript 構文とモックでの音源取得→デコード→再生→合成フォールバックを確認。
- サードパーティからの実ダウンロード／実機のWebAudio出力／Android通信環境は未確認。
- 30種の特殊技呼出しは実装済み。所有・ガチャの直接操作は現時点で9種で、残る21種の操作導線は別枠で未実装。
