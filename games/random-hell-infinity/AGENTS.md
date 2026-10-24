# ASTRAL BREAK ∞ development contract

This game is not tied to ASTRA or any model. Preserve a handoff that another model can use without chat history.

- Code authority: latest `main` of `techmew/techmew.github.io`, this directory only.
- Specification/progress authority: https://docs.google.com/document/d/1q_u55b225IhQWCPLZgpj4Xufj6x8JWvdxd0aT7BoavA/edit
- Drive folder: https://drive.google.com/drive/folders/106EiFWXUvn69Onb1TZiRaZwgKMxqtHRt
- Live game: https://techmew.github.io/games/random-hell-infinity/

Read the latest Drive handoff and fetch latest main before development. Never restore older Drive code backups over newer GitHub code. Do not create, enable, disable or modify scheduled tasks, or modify other games.

Keep the title ASTRAL BREAK ∞, Japanese cute pixel-art 2D action, Lulu's silver hair/star hairpin/blue scarf, fantasy star worlds, full-body attack animation, 8 worlds x 3 stages, existing image assets and save compatibility. Retain left floating joystick and right jump/attack buttons. Falls reset weapons; damaged HP carries across stages; zero HP ends the run.

Each development session must make a substantive code change, run appropriate syntax and behavior tests, recheck main before committing, commit to main without overwriting concurrent changes, and retrieve committed GitHub code for comparison. Verify Pages Actions for that SHA and the actual public HTML game-build marker. Never report publication complete based only on a commit or Actions success.

At session end, update these Drive sections with JST timestamp, commit SHA and build identifier: CURRENT_STATUS, DESIGN_DIRECTION, CHANGELOG, TEST_RESULTS, NEXT_ACTIONS, BLOCKERS. Distinguish passed, failed and untested checks. Include exact failures and retry steps. Record last successful commit, public deployment status, complete/incomplete work, first three next actions with files and implementation steps, used/missing image assets and untested items. Do this also when interrupted or switching models; preserve unpublished work and restart instructions.

Regression test: `node games/random-hell-infinity/tests/resume.cjs`. This uses mocked DOM/canvas and does not establish browser rendering or physical touch quality.
