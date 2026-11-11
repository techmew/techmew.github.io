# WILD RECLAIM - English player-facing UI audit (2026-11-11 JST)

## Scope and baseline
- Repository: techmew/techmew.github.io / main / neo-wild only
- Starting main HEAD: e1ebc89f10cf59ea6e9c0127397f75adc2b2670d
- ROADMAP-RECOVERY.md reviewed; original large ROADMAP.md intentionally preserved.
- Recent roadmap-history and main commits examined before editing.

## Actual changes
- Created i18n-phrases.js containing 964 authored Japanese-to-English translations for player-facing messages, boss roster/patterns, combat, den/pantry/strong traits, gacha, save backup, world history, trophies, disasters, UFO, ghosts, tutorial, debugging and game controls.
- Extended i18n.js with composed/parameterized string patterns for animal names, boss offers, world-year records, trophy titles/criteria, hunting/carrying/eating, active character and companion health. Preserved Japanese source messages and original save keys and JSON formats.
- Enabled translation of INPUT placeholders and accessibility labels; Japanese flag switch displays JP when the English interface is selected, without moving UI.
- Updated index.html and gacha-rates.html to load phrase pack before translation logic, set file-SHA cache revision URLs; gacha-rates.html now shares stored English selection and has a localized document title.
- No game mechanics, existing title/menu/roster geometry or save schema changed; no image generation.

## Commit references and verification
- Translation pack introduced: 6a2a54927a450d04be20e5ccf7022d610f09330e
- Final translation engine: 6bc1eabaa26e40194e967f71261c9f29f88ae2c6
- Final pack wording: 35bbef4acc6fd5fd6ac5a6d98172c90c9c09ea22
- Final HTML cache / rates revision commit: 6305d241a3543a8d60dcc870c055183692f2780d
- JavaScript syntax checked via new Function on engine and phrase pack. Full i18n closure executed against mocked DOM/localStorage; ja/en selection and document language/title tested.
- Dynamic translation regression: 27/27 cases passed.
- Static HTML audit: index.html 189 Japanese-source text nodes and 58 Japanese-source accessibility/title/placeholder attributes: 0 unexpected Japanese residues after English translation; the Japanese language switch changes 日 to JP in English.
- Rates HTML audit: 12 source text nodes and 1 accessibility/title/placeholder attribute, 0 untranslated.
- GitHub Actions: 'pages build and deployment' success for 6305d241a3543a8d60dcc870c055183692f2780d.
- Direct public Pages fetch and Android/browser real play NOT verified from this environment. Japanese-only source fragments composed at runtime are not evidence of untranslated final strings; on-screen audit remains necessary.

## Unfinished / next priority
1. Open the actual deployed game in Android/browser, switch to English, play through start/continue, gacha, den, boss recruit, map, trophies, backup/restore, failure prompts and game over. Capture visible Japanese with context; run window.WildI18n.auditVisible() for DOM residue.
2. Verify Canvas/WebGL-generated alerts, dynamic error branches, and true layout overflow in English with real gameplay.
3. Fix any residual strings or bad phrasing in a follow-up without altering save behavior or menu layout.

## User action
- None required to keep development moving. Real Android gameplay capture is needed to certify full runtime coverage.
