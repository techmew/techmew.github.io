PHASE=A_FEATURES / 40-minute handoff
Change: top 'この個体で決定' now delegates only when a selected draw exists or final named adoption is pending. Existing 'ガチャ結果をキャンセル' remains non-persistent. No terrain, 3D, CSS, HTML or save schema edits.
Prior HEAD: 5eecfa4d537b2562993414942d01043c73805bd5
Code commit: bbe510faedaed3381892b3d63fc7e87582e76049
Code blob: 52bc58c7d8b96da36babe7f24c8ba31196b6b5ce
Verification: GitHub blob/HEAD read-back; browser E2E, JS runtime, legacy save regression and Pages propagation not verified.
Next: test reroll, selection, naming, adoption, cancel with localStorage snapshots, old 4/5 members, release/death IDs; then resume 40-minute 3D/snow work.
