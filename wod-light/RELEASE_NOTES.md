# WoD Light v0.1.2 — 2026-10-17

Campaign usability + readable icon update for Foundry v14 / WoD20.

- Shipped 27 individually packaged, original SVG lighting pictograms with bold silhouettes and legible warm/daylight differentiation, validated in a 24px/64px contact sheet.
- Existing **world** preset Items using only the module's old generic icon paths get their `img` updated on GM launch. Custom images and Items already attached to Actors are not modified.
- **Find WoD Lights** button added to native Lighting tools. Clicking it opens a small filterable list of this module's scene lights and temporary, high-contrast numbered on-map markers. Clicking a row/pin recenters, selects, and pulses that light. Handles wrong-Level lights with explicit guidance.
- New light drops now show an amber local locator ring and name for ~2 seconds, on top of v0.1.1's auto-select behavior.
- Last placed light is prioritized in the finder for the same scene. Marker UI is strictly local GM UI; it creates no Tiles and broadcasts no network pings.
- Existing Ambient Light documents, their Level/elevation and config, Token HUD behavior and player inventory remain unchanged. No mass migration.

**Upgrade:** Back up the campaign world, update through the stable module manifest and hard-refresh. Once a GM opens the world, only the original generic world Item icons are updated. Don't reimport preset Items; the existing IDs are preserved. In Lighting, use **Find WoD Lights** to locate the previous Office Fluorescent on the subway map. For older unassigned or other-Level light documents, switch Levels or use native Lighting > Placeables.

**Test status:** Node v22 syntax checks, simulated drop/HUD/GM finder workflow, Level and item image preservation checks, 27 SVG XML parses and 24/64px visual icon review passed. **Actual Foundry v14 browser/live multiplayer test has not been performed.** First live test: open the Subway scene, Lighting > Find WoD Lights, locate the Office Fluorescent, then drag another office fixture to test pulse/auto-selection.

**Known limitations:** The finder uses Foundry v14 tool hook and native Lighting APIs; pending live confirmation in this campaign. The finder only lists WoD Light-tagged Ambient Lights, not every manually placed Foundry light. It does not automatically switch the viewed Level, move older lights, or modify customized icon art / Actor inventory images. Other baseline caveats below still apply.

**Rollback:** Back up the world, stop Foundry, restore v0.1.1 module folder or disable v0.1.2. Existing light documents remain. New default world Item `img` paths will be invalid if v0.1.2 icon files are removed; restore a world snapshot or manually reset those few icon paths if needed. Do not delete/reimport existing world Items to roll back.

---

# WoD Light v0.1.1 — 2026-10-17

Campaign usability fix for Foundry VTT v14 and WoD20.

- Dropping a lighting preset now activates Foundry's native Lighting controls and selects the newly created Ambient Light for immediate moving, configuration, or deletion.
- On multi-Level v14 scenes, new lights use the currently viewed Level ID and bottom elevation, rather than assuming elevation 0.
- Native Placeables sidebar remains the way to find previously placed lights; no custom GM panel or new management system.
- Existing scene lights and token lighting remain untouched. No mass migration, rewrites or deletions.
- Retains all 27 light presets, Item folder, and flashlight Token HUD behavior.

**Upgrade:** Back up your world, update the module through Foundry's manifest, then hard-refresh. No Item regeneration is required. The original light in the subway may still be on another Level; find it via Lighting > Placeables with all Levels shown, then edit/delete/replace individually.

**Test results:** Node 22 syntax checks and mock tests passed, including Level assignment and auto-selection. **Live Foundry v14 testing is pending.** Verify a new office light on the subway Level and confirm its marker can be dragged or deleted.

**Known limitations:** Selection depends on the native Lighting placeable being drawn; if it is not available promptly, the light remains created and can be managed from Placeables. Core v14 light markers remain small. Existing v0.1.0 placed lights are not silently migrated. Scene distances still assume feet; see README for other baseline limitations.

**Rollback:** Stop Foundry and restore the previous v0.1.0 module folder or disable WoD Light. Ambient Lights and world Item presets remain; a world snapshot is required to roll back any world-document edits made by the GM.

---

# WoD Light v0.1.0 — 2026-10-16

First campaign release for Foundry VTT v14 and WoD20 (`worldofdarkness` approximately 7.3.x).

- 27 stationary and portable lighting presets in four Item folders (Indoor, Outdoor, Portable, Effects).
- Drag a GM light preset Item onto a scene to create a native Ambient Light.
- Players carrying supported light Items can toggle their light using the Token HUD; right-click to choose the light.
- Directional flashlight, tactical flashlight, headlamp, and phone beams follow token rotation.
- Restores a token's previous lighting when its carried light is disabled.
- Creates missing preset Items additively after GM confirmation; no forced imports, overwrites, or world migrations.

**Checks:** Node 22 smoke tests and source syntax checks passed locally. **No live Foundry/browser test has been run yet.**

**Known limitations:** Scene distances assume feet; map drops currently use world Items, not compendium-only drags; external lighting module interactions untested; removing an actively lit Item does not turn off its light automatically. See `README.md`.

**Upgrade/rollback:** Back up the Foundry world before installing. To roll back, disable the module or restore its prior folder. Existing world Items and Ambient Lights remain after disabling and should be cleaned up separately only if desired.
