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
