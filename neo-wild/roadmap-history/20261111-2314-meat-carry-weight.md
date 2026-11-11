# PHASE A — Heavy meat hauling changes survival decisions (2026-11-11 JST)

Baseline: latest main 893a973dca247da84b4a8860e88db3048eb15f77, recent commits and roadmap-history, ROADMAP-RECOVERY.md read. Previous English HUD fix was not reimplemented. Existing save schema, title/menu/roster layout, 3+3 slots, death IDs and carp QA lock preserved.

Gameplay: carrying heavy meat now reduces ground movement speed by up to 24%, and increases sprint stamina drain from 43/s to up to 59/s. Small pieces <=8pt have no penalty; burden scales with carried amount relative to actor size and level. The penalty ends immediately when the food is eaten, deposited, stolen or dropped, because it is computed from existing P.carry. Heavy pickups warn the player to evade wild dogs on the way to a den. Existing food theft, pantry and saving mechanisms unchanged.

Code commit a25e59281dae28e4643c176692befa630bd7eb97; game blob 6e9d9e5881f39559d623002750053a32ce370e36.
HTML cache revision commit 6bb6bd9796d1c09498823c777d68d737f7525c1b; index blob ee5682016c04e426251d855669436a02ead57bd2.

Validation: entire game.js parsed with JavaScript Function; 6 mocked cases for empty/8pt/45pt/invalid loads, larger stronger animal capacity and speed/stamina extrema passed. Re-fetched game.js and index.html and confirmed cache rev. Pages Action for 6bb6bd was queued when checked; actual Android gameplay and browser visual testing not performed. No image generation.

Next priority: mobile English gameplay visual QA after previous hotfix and realistic heavy meat chase test (dog theft, dropping, depositing, continuing saved game). Avoid modifying user UI without permission. No user response required for this code change.
