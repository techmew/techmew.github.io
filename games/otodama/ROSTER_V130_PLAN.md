# OTODAMA v130 — ten-character roster and birth overlay

Implemented on main (2026-10-27 JST): microphone birth ceremony overlays the recording controls, ten 60%-scale character thumbnails display in two rows of five, desktop drag-and-drop and touch-handle reorder persist, and both recorded and trial-generated characters auto-register. When full, replacement requires confirmation; locked characters are never silently overwritten. Existing collections over ten are split into ten active characters and an archive, with a downloadable JSON backup. If browser storage quota blocks migration, the old data remains untouched and an export option is displayed. Archived JSON can be imported without silently discarding existing active characters.

Quality: embedded JavaScript syntax PASS; CSS braces balanced; GitHub Actions full Node test:node 26 suites PASS on 2026-10-27 (run 40485604357, commit c5b5bfaae0532e1d4749754cd697886e5e951091). The newer documentation/test commits must be checked separately. Live Worker remains deployed; Android real-device microphone/drag, browser visuals, and latest Pages cache not yet verified.

Next: confirm latest Pages and Actions success; test 320px portrait, landscape, touch drag, ten-slot migration with large voice clips, archive download/import, audio playback, and CPU/PvP handoff on physical Android.
