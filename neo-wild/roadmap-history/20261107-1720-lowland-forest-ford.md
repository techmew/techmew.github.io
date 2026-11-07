# 2026-11-07 17:20 JST / world ecology
PHASE=A_FEATURES. Main before ca4ff4fbaf61b37e9ea768d2898d4ba2f70587eb. Implementation ee9bd1dea26cce1f7de7ae96a6088df5c6b40ac8; mountain.js blob 0f78f4efd077e8568a83f21f77fa14481dc00b36.

Implemented: Added a second shallow lowland crossing at x=9630..9780 along the northern forest tributary, with a visible gravel ford in 2D. Existing upstream ford x=10500..10980 retained. Both player and NPC collision use the same headwaterFord() logic. No changes to UI, save, world coordinates or ROADMAP.md.

Validation: fetched new blob and HEAD ee9bd1dea26cce1f7de7ae96a6088df5c6b40ac8; verified source invariants. Browser/Android traversal and 3D ford depiction remain 検証待ち; no browser runtime test claimed.

Open: [実装中,20分] right mountain-to-forest hydrology, elevation and traversability: next inspect mountain.js height/headwaterBed and collision integration; [検証待ち,20分] walk both fords, blocked deep-water routes and NPC paths; [実装中,40分] 3D snow mesh seams and ford surface representation in webgl3d.js; [検証待ち,00分] Android JSON backup and chronology, old SAVE_SCHEMA2 and permanent death/release IDs; [未着手/継続,20分] 30-species ecology, pack behavior, disasters and released animal AI. Preserve latest main, baseline 2a8b20e, and title UI. Never rollback.
