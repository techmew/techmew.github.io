# PHASE A / JSON backup export integrity (2026-11-13 00:10 JST)

Implementation: 427e402f00a3eedb6901313735468412a621becb
Publication revision: 6e0f83b69bc4a2452c7397f850c43580ff1bb52c

Change: validate the generated JSON backup using the same restore validator before offering a download. Broken world saves, permanent death IDs and boss roster now block unusable exports instead of producing misleading backup files. No UI layout or save schema change.

Tests: JavaScript syntax PASS; six mocked export cases PASS (valid world, corrupt world, malformed permanent death ID, invalid boss roster, legacy four-member roster, empty storage). Re-fetched backup blob and HTML script revision. Browser/Android actual play not tested.

Pending: integrated world/pantry interrupted-write journal recovery and forced-termination test, plus real-device backup/download validation. Next priority: crash-safe world/pantry recovery without resurrecting permanently departed IDs.
