# アイキャッチ権利監査（2026-10-09）

対象: techmew/techmew.github.io のブログ、OGP、一覧、トップ、制作物。目的: アフィリエイト規約・著作権リスクの低減。

## 判定基準
- 画像の出所、制作者、利用許諾、商用利用可否、クレジット条件を確認する。
- 公式ゲーム画像、スクリーンショット、他サイト転載、ロゴ、商品画像、人物写真、AI生成による既存キャラクター酷似を重点確認。
- 製品名・作品名を含むだけでは違反と断定しない。
- 権利不明の画像は公開継続の可否を保留し、オリジナルの図形・文字中心の画像へ差し替える。
- 変更後はHTML、OGP、一覧、公開URL、GitHub Pages配信を検証する。

## 現時点
GitHub main のツリーを取得。画像ファイルの所在を確認したが、個々の原画像のライセンス確認・再制作・差し替えは未完了。したがって現段階では全件安全との判定はしない。

## 要確認例
- assets/images/hq/assassins-creed-shadows-sale-2026-hero.jpg
- assets/images/hq/chatgpt-ads-asia-expansion-2026.svg
- assets/images/hq/dlss-5-rtx50-2026.png
- assets/images/eyecatch/prime-sale-2026.jpg

これらは違反認定ではなく調査対象。

## 2026-10-10 継続調査
GitHub main の再帰ツリーを取得し、全242エントリ中、画像拡張子（PNG/JPG/JPEG/WebP/SVG）97ファイル、blog/ 配下のHTML 23ファイルを確認。これはファイル棚卸しであり、画像内容や出所の法的監査を完了した件数ではない。

### 優先確認画像
ゲーム・商品・著名サービスを主題とする以下の画像は、権利者提供素材、生成素材、独自作図のどれに該当するか確認する。該当ファイルが存在するだけで違反とは判断しない。

- assets/images/hq/assassins-creed-shadows-sale-2026-hero.jpg
- assets/images/hq/minecraft-dungeons-ii-2026-hero.jpg
- assets/images/hq/minecraft-dungeons-ii-2026-hero.png
- assets/images/hq/switch2-microsd-express-2026-hero.jpg
- assets/images/hq/iphone-18-latest-2026.jpg
- assets/images/hq/meta-adventurer-2026-hero.jpg
- assets/images/hq/prime-sale-2026.jpg
- assets/images/eyecatch/prime-sale-2026.jpg

### 判定上の注意
著作権、商標、肖像権、商品写真の利用条件、広告プログラム固有の画像利用規定は別々に確認する。公式スクリーンショットでも引用等の法的例外が成立する場合はあり、一律違法とは限らない。画像の生成履歴やライセンス記録がない場合は「権利不明」として扱い、違反確定とは区別する。

### 進捗
画像97件のパス棚卸し完了。原画像の目視・出所照合は未完了。画像差し替え0件。公開済み画像が全て安全であるとの保証はしない。


## 2026-10-10 対応

優先対象8ファイルを画像として目視確認。ゲーム作品を連想させるロゴ風表記・人物やキャラクター風の絵、製品写真に似せた絵、販売元ロゴ風表記、確認元が明記されていない価格・発売日表示が含まれていたため、侵害の法的判断はせず「公開リスクあり」と判定した。該当8ファイルと、同じセール表記を含むSVGをリポジトリから削除する。公開HTMLから参照されていないことを検索で確認した。

記事で実際に利用されていた高解像度ラスター画像のうち、同名の独自SVG版が存在するものはHTML/OGPの参照先をSVGへ変更し、元ラスターを削除する。これにより、商品写真に似せた生成画像やロゴ風表現が公開ページに残る可能性を減らす。削除後、画像参照切れとサイト配信を確認する。

### 対応対象

- 削除: `assets/images/hq/assassins-creed-shadows-sale-2026-hero.jpg`
- 削除: `assets/images/hq/minecraft-dungeons-ii-2026-hero.jpg`
- 削除: `assets/images/hq/minecraft-dungeons-ii-2026-hero.png`
- 削除: `assets/images/hq/switch2-microsd-express-2026-hero.jpg`
- 削除: `assets/images/hq/iphone-18-latest-2026.jpg`
- 削除: `assets/images/hq/meta-adventurer-2026-hero.jpg`
- 削除: `assets/images/hq/prime-sale-2026.jpg`
- 削除: `assets/images/eyecatch/prime-sale-2026.jpg`
- 削除: `assets/images/prime-sale-2026.svg`
- 削除: `assets/images/hq/ai-handoff-builder-hero.png`
- 削除: `assets/images/hq/chatgpt-ads-asia-expansion-2026.png`
- 削除: `assets/images/hq/chatgpt-security-history-2026.png`
- 削除: `assets/images/hq/chatgpt-voice-plugins-2026.png`
- 削除: `assets/images/hq/creator-monitor-4k-5k-2026.png`
- 削除: `assets/images/hq/gemini-connected-apps-2026.jpg`
- 削除: `assets/images/hq/github-copilot-slack-teams-2026.png`
- 削除: `assets/images/hq/gpt-6-prompt-caching-guide-2026.png`
- 削除: `assets/images/hq/gpt-6-sol-luna-guide-2026.png`
- 削除: `assets/images/hq/heic-jpeg-sharing-guide-2026.png`
- 削除: `assets/images/hq/iphone-photo-location-exif-guide.png`
- 削除: `assets/images/hq/jpeg-png-webp-guide-2026.png`
- 削除: `assets/images/hq/microsoft-copilot-home-code-autopilot-2026.png`
- 削除: `assets/images/hq/portable-ssd-creator-guide-2026.png`
- 削除: `assets/images/hq/samsung-p9-p7-usb4-ssd-ai-guide-2026.png`
- 削除: `assets/images/hq/sns-image-studio-hero.jpg`
- 削除: `assets/images/hq/thinkpad-x9-ai-pc-guide-2026.png`
- 削除: `assets/images/hq/usb-c-hub-creator-guide-2026.png`
- 削除: `assets/images/hq/x-post-studio-hero.jpg`

### もしもアフィリエイト運用

- 今回の公開HTMLには、もしもの「かんたんリンク」は存在しない。現在はAmazonアソシエイトの文字リンクを使用している。
- 今後もしもの「かんたんリンク」を利用する場合、管理画面のHTMLを改変しない。商品画像・価格・ボタンだけの抜き出しや、価格・在庫を固定値で添える運用は避ける。
- 広告リンクを記事の冒頭で明示し、公式仕様と実機検証を区別する。


## 2026-10-10 追加確認

ブランド名・製品名・事件名を含む未使用ラスター画像を追加確認した。次の素材には、公式ロゴや製品外観に似せた描写、未確認の価格・性能・発売情報、または公式障害画面に見えるUIが含まれる可能性がある。法的侵害とは断定せず、公式出典・許諾・事実確認ができるまで公開ツリーから除外する。HTML/CSS/JS/XMLの現行参照は見つからなかった。

- 削除: `assets/images/hq/dlss-5-rtx50-2026.png`
- 削除: `assets/images/hq/m6-mac-mini-2026-hero.jpg`
- 削除: `assets/images/hq/m6-mac-mini-2026-hero.png`
- 削除: `assets/images/hq/nichicon-tribrid-battery-2026-hero.jpg`
- 削除: `assets/images/hq/nichicon-tribrid-battery-2026-hero.png`
- 削除: `assets/images/hq/googlebook-vs-macbook-neo-2026.jpg`
- 削除: `assets/images/hq/codex-outage-2026-09-26-hero.jpg`
- 削除: `assets/images/hq/codex-outage-2026-09-26-hero.png`
