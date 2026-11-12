# PHASE A / pantry recovery

Implementation commit: c9201db4d7d2b694cf49c9f9bf433a518e60458d

Changed: When the primary shared pantry is corrupted, restore from the last-good copy only if its full meat-lot totals validate and its stores exactly match the valid world autosave. Archive corrupt raw bytes before restoring. On any failure, retain the original warning and refuse unsafe recovery. Existing menu and roster unchanged.

Checks: GitHub content re-fetched, blob SHA verified; structural guards inspected. JavaScript syntax execution, crash simulation, browser and Android tests NOT performed.

Pending: Simulate storage quota/write interruption and malformed backup; inspect Pages publish and JS cache revision. Next: recovery transaction journal with cross-store crash tests.
