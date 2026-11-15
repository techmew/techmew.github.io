# 2026-11-15 — P2 four-species durable survival loop, immediate recovery

## Starting state / scope
main 35dfe2c296472113638048a1247a6e8cedf47de1; previous P2 15:10 handoff read. Only neo-wild edited. Preserved title, menu, roster placement, saved schema and old identifiers.

## Player experience and actual production paths
- Real contextAction long press -> carryFood picks fresh NPC-owned carcass; staged specialist defender detection now changes world state BEFORE the matching autosave rather than after it.
- Commit of carried food, remaining meat, owner claim release, and hunter alert/search are atomic in the snapshot. If autosave rejects the transaction, food, stamina and each hunter field are restored; false alert message is suppressed.
- At-den contextAction -> carryFood deposits shared meat, then inventory -> eatFromDen consumes stored meat and restores hunger/HP using existing pantry/world transactional path.
- On-site eat() now persists the final corpse-to-bones change and predator claim response in the same save. A rejected save restores the exact original corpse and owner claim.
- Existing 2D/WebGL actor animations and UI unchanged. No generated images, no new paid services.

## Commits
- game.js implementation c2cab5d075d63a3372dbd8c632368d8e7a02fb33, new blob 85d07f04ffee690aeb91df220738111a5b4c6453
- runnable Node-compatible regression e48fc63948818d55f6478d0b75c73d736d12cdc2: p2-specialist-survival-loop-regression.js
- index game.js?rev=85d07f04ffee: d3ba2c369f1734ac66f6f39e949268fbb1da6cfa

## Verification scope (no inflated acceptance)
- Actual complete game.js parsed with V8 new Function: PASS.
- Before implementation, isolated real-source V8 mock: 52 assertions / 4 species for carcass pickup, AI claim, world save result, rollback and den deposit PASS.
- After implementation, newly committed regression script executed in a Node-compatible V8 module shim (not actual Node CLI): 96 assertions PASS for 4 species, player action button, carcass, persistent snapshot model, shared pantry deposit, den eating, corpse-to-bones, and rejected autosave rollback.
- Real browser, Canvas, WebGL, Android, long-play FPS, real localStorage/old-save migration and 100-year boss: NOT EXECUTED. Production saveAuto internals were NOT run by the mock. End-to-end browser acceptance remains open.
- Never call this 4-species P2 batch completed until physical battle/rendering and save migration checks meet criteria.

## 35-species status ledger (playableRoster from fauna.js)
Status labels are specific to THIS P2 acceptance, not existence in source. Baseline 11 means previously present, NOT newly tested. Four focus species have an integrated action/save mock PASS but visual/browser acceptance remains unknown.

| # | ID | Name | State |
|---|---|---|---|
| 1 | cat | 猫 | 既存11（今回未検証） |
| 2 | dog | 犬 | 既存11（今回未検証） |
| 3 | fox | 狐 | 既存11（今回未検証） |
| 4 | wolf | 狼 | 既存11（今回未検証） |
| 5 | deer | 鹿 | 既存11（今回未検証） |
| 6 | boar | 猪 | 既存11（今回未検証） |
| 7 | crow | カラス | 既存11（今回未検証） |
| 8 | pigeon | ハト | 既存11（今回未検証） |
| 9 | otter | カワウソ | 既存11（今回未検証） |
| 10 | carp | コイ | 既存11（今回未検証） |
| 11 | tanuki | タヌキ | 既存11（今回未検証） |
| 12 | badger | アナグマ | 要実装／未検証 |
| 13 | macaque | ニホンザル | 要実装／未検証 |
| 14 | blackBear | ツキノワグマ | 要実装／未検証 |
| 15 | serow | ニホンカモシカ | 要実装／未検証 |
| 16 | manul | マヌルネコ | 実装済み未検証（4種統合モックPASS） |
| 17 | tibetanFox | チベットスナギツネ | 実装済み未検証（4種統合モックPASS） |
| 18 | shoebill | ハシビロコウ | 実装済み未検証（4種統合モックPASS） |
| 19 | lion | ライオン | 要実装／未検証 |
| 20 | tiger | トラ | 要実装／未検証 |
| 21 | cheetah | チーター | 要実装／未検証 |
| 22 | elephant | ゾウ | 要実装／未検証 |
| 23 | hippo | カバ | 要実装／未検証 |
| 24 | gorilla | ゴリラ | 要実装／未検証 |
| 25 | giraffe | キリン | 要実装／未検証 |
| 26 | zebra | シマウマ | 要実装／未検証 |
| 27 | hyena | ハイエナ | 要実装／未検証 |
| 28 | wildDog | リカオン | 要実装／未検証 |
| 29 | armadillo | アルマジロ | 要実装／未検証 |
| 30 | hedgehog | ハリネズミ | 要実装／未検証 |
| 31 | crocodile | ワニ | 要実装／未検証 |
| 32 | penguin | ペンギン | 実装済み未検証（4種統合モックPASS） |
| 33 | rhino | サイ | 要実装／未検証 |
| 34 | giantTreeFrog | 巨大アマガエル | 要実装／未検証 |
| 35 | pacmanFrog | ベルツノガエル | 要実装／未検証 |

## Current position and next batch
P1: source-integrated, real browser unverified. P2 accepted complete batches **0**; unfinished 24 (including current four). P3-P8 untouched.
NEXT one major deliverable: finish the SAME four-species controlled combat + NPC terrain/2D/WebGL animated strike, prey death, carry/den/food and browser/save acceptance as an end-to-end experience. Run committed Node regressions in real Node/CI if available, test physical browser if accessible; do not revert current main or redo minor single-stat tweaks. Protect 3+3 roster, release/death tombstones, legacy SAVE_SCHEMA2 and JSON backups. No user work currently required.
