# WoD Light v0.1.2 — Test Report

**Prepared:** 2026-10-17 (America/Chicago)  
**Intended environment:** Foundry VTT v14 + World of Darkness 20th `worldofdarkness` v7.3.x

## Verified locally (not a live Foundry test)

- `node --check` passes for all three ES modules (`main.js`, `presets.js`, `finder.js`).
- `module.json` parses, has module id `wod-light`, script and CSS paths exist, version `0.1.2`.
- Verified all 27 original SVG assets are well-formed XML and correspond exactly to defined preset IDs; generated 64px and 24px contact sheet for legibility review. No external paid or stock imagery.
- Node-based simulated Foundry APIs:
  - All 27 preset definitions have distinct IDs; 8 marked as portable.
  - Additive GM install makes one main Item folder, four subfolders and 27 Items, each with an asset-specific SVG image path.
  - Auto-refresh of old default world Item images changes only matching old generic icons. Customized images are preserved; Actor Items untouched.
  - Second install creates no duplicates and doesn't overwrite existing Items.
  - Dragging a tagged world Item sends one `AmbientLight` document with intended coordinates and native `config`; unrelated drop types do nothing.
  - On a multi-Level scene, a new light gets the currently viewed Level and bottom elevation (test uses subway elevation -20).
  - Foundry v14 `getSceneControlButtons` hook adds one **Find WoD Lights** button to the native Lighting controls for GMs only.
  - Finder lists tagged Ambient Lights including old placements, checks Level mismatch before selection, filters list entries, renders/cleans up local map pins and animates pan on selecting a visible light.
  - A local GM-only locator pulse is created with browser coordinates and the fixture name; no scene document or broadcast ping is generated.
  - After creation the native Lighting layer is activated in `select` mode and the new placeable is controlled; creating into an unviewed scene does not redirect the GM; creating without Level works as before.
  - Selection handles unavailable canvas placeables without deleting or changing the created Ambient Light.
  - Carrying a light permits token-light activation; source switching retains an original lighting snapshot; switch-off restores it.
  - Ownership and inventory checks block unauthorized and absent portable sources.
  - Token HUD button injected once; click toggles; right click lists carried sources; last choice is remembered.
  - If the active source was removed from inventory, the off button remains available.

## Live tests not performed

1. Enable module in actual Foundry v14 and accept initial preset creation; inspect folder contents.
2. Confirm existing WoD Light Items show specific clear icons (not generic light/torch). Any customized Item art should remain unchanged. Then drag **Office Fluorescent - Daylight** onto the Subway Level. Verify a large amber labeled pulse appears, native Lighting activates, and **only the new light** is selected. Drag to move, or Delete to remove just it; do not use Clear Lights. Verify its Level/elevation.
3. Use **Lighting > Find WoD Lights** to show the searchable finder and numbered markers, and locate the original older Office Fluorescent. Filter by `Office` and select it. If the finder indicates another Level, switch Levels then retry; Placeables is a fallback. Close finder and verify temporary markers vanish.
4. Drop a **Flashlight** Item onto a PC Actor; right click that token and click its new lightbulb control.
5. Rotate token while the light is on; verify the cone follows its rotation, does not point backward relative to token art, and is blocked by walls.
6. Turn off; verify prior token lighting is restored. Test with a player who owns the token, not just a GM account.

These checks are prerequisites to calling this release "confirmed live." No claim of live deployment is made.
