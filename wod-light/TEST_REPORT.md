# WoD Light v0.1.0 — Test Report

**Prepared:** 2026-10-16 (America/Chicago)  
**Intended environment:** Foundry VTT v14 + World of Darkness 20th `worldofdarkness` v7.3.x

## Verified locally (not a live Foundry test)

- `node --check` passes for both ES modules.
- `module.json` parses, has module id `wod-light`, script and CSS paths exist, version `0.1.0`.
- Node-based simulated Foundry APIs:
  - All 27 preset definitions have distinct IDs; 8 marked as portable.
  - Additive GM install makes one main Item folder, four subfolders and 27 Items.
  - Second install creates no duplicates and doesn't overwrite existing Items.
  - Dragging a tagged world Item sends one `AmbientLight` document with intended coordinates and native `config`; unrelated drop types do nothing.
  - Carrying a light permits token-light activation; source switching retains an original lighting snapshot; switch-off restores it.
  - Ownership and inventory checks block unauthorized and absent portable sources.
  - Token HUD button injected once; click toggles; right click lists carried sources; last choice is remembered.
  - If the active source was removed from inventory, the off button remains available.

## Live tests not performed

1. Enable module in actual Foundry v14 and accept initial preset creation; inspect folder contents.
2. From Items sidebar drag a **Desk Lamp - 60W (Warm)** onto a dark Scene; verify a native Ambient Light is created and can be edited/deleted using normal Lighting tools.
3. Drop a **Flashlight** Item onto a PC Actor; right click that token and click its new lightbulb control.
4. Rotate token while the light is on; verify the cone follows its rotation, does not point backward relative to token art, and is blocked by walls.
5. Turn off; verify prior token lighting is restored. Test with a player who owns the token, not just a GM account.

These checks are prerequisites to calling this release "confirmed live." No claim of live deployment is made.
