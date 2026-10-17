# WoD Light v0.1.1 — Test Report

**Prepared:** 2026-10-17 (America/Chicago)  
**Intended environment:** Foundry VTT v14 + World of Darkness 20th `worldofdarkness` v7.3.x

## Verified locally (not a live Foundry test)

- `node --check` passes for both ES modules.
- `module.json` parses, has module id `wod-light`, script and CSS paths exist, version `0.1.1`.
- Node-based simulated Foundry APIs:
  - All 27 preset definitions have distinct IDs; 8 marked as portable.
  - Additive GM install makes one main Item folder, four subfolders and 27 Items.
  - Second install creates no duplicates and doesn't overwrite existing Items.
  - Dragging a tagged world Item sends one `AmbientLight` document with intended coordinates and native `config`; unrelated drop types do nothing.
  - On a multi-Level scene, a new light gets the currently viewed Level and bottom elevation (test uses subway elevation -20).
  - After creation the native Lighting layer is activated in `select` mode and the new placeable is controlled; creating into an unviewed scene does not redirect the GM; creating without Level works as before.
  - Selection handles unavailable canvas placeables without deleting or changing the created Ambient Light.
  - Carrying a light permits token-light activation; source switching retains an original lighting snapshot; switch-off restores it.
  - Ownership and inventory checks block unauthorized and absent portable sources.
  - Token HUD button injected once; click toggles; right click lists carried sources; last choice is remembered.
  - If the active source was removed from inventory, the off button remains available.

## Live tests not performed

1. Enable module in actual Foundry v14 and accept initial preset creation; inspect folder contents.
2. From Items sidebar drag an **Office Fluorescent - Daylight** onto the Subway Level. Verify the native Lighting controls activate, that **only the new light** is selected, and dragging it moves it. Press Delete to remove that selected light; do not use Clear Lights. Verify the Level and elevation in its configuration.
3. Search for the earlier v0.1.0 office light via Lighting > Placeables. Remove any Viewed-Level filter and confirm you can find its previous document on another Level, if applicable.
4. Drop a **Flashlight** Item onto a PC Actor; right click that token and click its new lightbulb control.
5. Rotate token while the light is on; verify the cone follows its rotation, does not point backward relative to token art, and is blocked by walls.
6. Turn off; verify prior token lighting is restored. Test with a player who owns the token, not just a GM account.

These checks are prerequisites to calling this release "confirmed live." No claim of live deployment is made.
