# WoD Light v0.1.7 — 2026-10-17

Modern lighting catalog expansion for Foundry VTT v14 / WoD20 and TC Modern-style scenes.

- Added **24 usable modern fixtures**, taking the catalog from 27 to **51** without changing any of the original preset IDs or lighting values.
  - **Indoor (11):** Wall Sconce – Warm, Recessed Ceiling LED, Pendant / Bar Light, TV / Monitor Glow, Vending / Arcade Cabinet, Medical Examination Lamp, Display Case Spotlight, Subway Platform Strip, Parking Garage Fixture, Train / Bus Ceiling Strip, Warehouse High-Bay LED.
  - **Outdoor (5):** Portable Worksite Flood (scene fixture), Bollard / Pathway Light, Illuminated Storefront Sign, Gas Station Canopy Light, Tower Searchlight.
  - **Effects (6):** Stage Spotlight, Dance Floor Strobe, Neon Sign – Blue, Emergency Blue Flash, Amber Hazard Beacon, Campfire / Fire Pit.
  - **Portable (2):** Handheld Searchlight, Emergency Road Flare.
- Added 24 module-owned SVG pictograms, all checked at 24px; no font dependencies, paid map graphics or third-party assets. Original 27 pictograms unchanged.
- Existing world: **one-time GM confirmation** to create only the missing presets (typically 24), never overwrite existing Items. If declined, manually run `game.wodLight.installPresets()` later. New world: offer all 51 at initial setup. No force import or destructive migration.
- Existing portable Token HUD and 3-o'clock edge emission also apply to the new handheld searchlight (30° beam) and road flare (360° flickering red light). Scene placement remains standard native Ambient Lights.
- Added `CATALOG.md` for all preset defaults and categories; retained four Items folders, Find WoD Lights, continuous pulses, hover/selection labels, and native lighting edit/delete.

**Tests:** Node v22 syntax and mock suite passed (including 51 unique preset IDs and images, one-time upgrade/decline flow, new portable light switching/origin, native scene-light placement, and existing finder/Token HUD workflows). All 51 SVGs parse as XML; new icons visually reviewed at 24px/84px. **No live Foundry v14 or multiplayer verification performed.**

**Upgrade:** Back up the world and old `wod-light` folder. In Foundry Setup update using `https://github.com/rebsiot/WoD-Light-Sources/releases/latest/download/module.json`, restart/reload; GM accepts the one-time `Add 24 Lights` prompt. No Scene/Actor import or reinstallation of TC Modern modules is needed.

**Rollback:** Disable v0.1.7 and restore the published v0.1.6 module folder/manifest. Newly installed Item presets persist as world data unless you deliberately remove them; restore a world backup only if you need to reverse world document additions. No existing Item or Scene edits are performed by the catalog upgrade.

---

# WoD Light v0.1.6 — 2026-10-17

Carried-light position improvement for Foundry VTT v14 + WoD20.

- Portable lights now originate near the **right (3 o'clock) edge** of the character token, not the center. The offset follows token rotation and uses a radius 42% of the smaller token pixel dimension.
- Directional flashlight/headlamp/phone cones are rotated toward the outward side of the token while omnidirectional candles, lanterns, torches and glow sticks remain 360-degree illumination.
- Changes are scoped strictly to Token Documents with WoD Light's own **active portable Item** flag. Inactive tokens and other token light sources retain their normal native position/direction. Turning off the portable Item restores its saved light configuration.
- Implementation wraps Foundry v14's `TokenDocument.getLightOrigin` and the Token `_getLightSourceData` method only where those v14 APIs exist; no additional scene Ambient Lights, world documents, or network requests.
- Preserved: all 27 original SVGs and presets, lighting layer persistent locator rings, GM finder, Item drag placement, Token HUD UI, stable module ID and manifest. No migration or new configuration.

**Upgrade:** Back up your world and module folder, update with the existing Foundry manifest, then restart Foundry/hard-refresh. Existing Item and Token data remain unchanged.

**Live smoke test required:** On an unobstructed scene, give a player a Flashlight. Activate the Token HUD light. With token rotation 0, the beam should originate at the right edge and point east. Rotate the token +90 degrees: the emitter and cone should now point south. Turn it off; any original light should be restored. Then repeat with a Candle for 360-degree right-edge emission and check behavior close to a wall.

**Tests:** Node v22 static syntax and mocked origin/directional-source tests passed, including rotation 0/90/180/270, inactive lights, 360-degree lights, no double patches, and existing module flows. **No live Foundry v14 render test, wall test, or multiplayer test has been performed.** The protected API's runtime behavior is a specific verification risk.

**Rollback:** Restore the previous v0.1.5 module folder or disable WoD Light. The new emission offset is entirely client-side and disappears when the module is disabled; no world-data rollback is necessary for this feature. The existing world Items and Ambient Lights remain unchanged.

---

# WoD Light v0.1.5 — 2026-10-17

Foundry v14 Lighting locator improvement for the St. Louis v2 campaign.

- **Changed:** WoD Light fixtures keep pulsing continuously whenever the GM has Foundry's native Lighting controls active, instead of fading out after a few seconds. Switching to another control category or Scene clears the markers at once.
- **Usability:** Amber, readable 68px rings are GM-local, pointer-transparent and maintain their positions when the map pans, lights move, or fixtures are created/deleted. No new settings or GM panel.
- **Accessibility:** Reduced-motion users see a steady highlighted ring rather than an animation.
- **Preserved:** native Ambient Lights, 27 SVG presets, Item icons, Find WoD Lights/search, names on hover/selection, portable Token HUD switching, optional Level filtering, all existing Scene and Actor data.
- **Compatibility:** Same module ID `wod-light` and stable Foundry manifest URL. No new permissions, migrations, or API contracts.

**Install/upgrade:** Back up world and module folder. Update WoD Light in Foundry Setup from the existing manifest, then restart Foundry and hard-refresh your client. No Item reimport needed. ZIP manual install: extract its contents to `Z:\Data\modules\wod-light\` so `module.json` is directly in that folder.

**Rollback:** Restore v0.1.4 module source or disable the module; fixtures and Items remain because this release does not migrate data. Keep the SVG assets introduced in v0.1.2+ if using newer Item image paths.

**Local tests:** JavaScript syntax and Node v22 mock tests passed. Verified persistent locator lifecycle across activation, duplicate events, camera pans, visibility and Level filters, document creation/deletion/movement, player permissions, leaving Lighting and Scene teardown. **No live Foundry/browser test was run.**

**First live check:** On the subway Scene, enter Lighting. Confirm your existing Office Fluorescent rings continue pulsing past 3 seconds, remain movable and stop immediately when you select another control category. If it fails, report the specific action and console errors.

---

# WoD Light v0.1.4 — 2026-10-17

Lighting locator usability upgrade for Foundry VTT v14 and WoD20. Includes the v0.1.3 local-only select-tool pulse changes in the publicly installable release.

- Selecting Foundry's native **Lighting** control or **Select** tool briefly pulses all currently visible WoD Light-created fixtures (68px amber ring, approximately 3 seconds). No separate management panel.
- A clear fixture name appears above the light when its native control is hovered. When selected, the name remains with a short drag/Delete hint. Pointer-proximity hover fallback helps where v14 placeable hover events differ.
- Pulses, labels, and temporary finder markers are local to the GM client and cannot interfere with native light movement or selection.
- Regular scenes require **no Levels**. Where a scene uses Foundry Levels, the locator filters out lights assigned to another viewed Level; unassigned legacy lights remain eligible.
- Existing **Find WoD Lights**, 27 readable SVG icons, placement presets, and Token HUD portable-light controls are preserved.
- No Scene, Token, Actor, or existing Ambient Light migrations; no new Items are added on upgrade.

**Upgrade:** Back up the world, update from the existing stable manifest, restart Foundry/refresh the client. Re-importing Items is not required.

**Test report:** JavaScript syntax, 27 SVG inventory, Node mocked Foundry lighting tool callbacks/hover/selection/pulse/Level tests passed. **Actual Foundry v14 with WoD20 has not been tested in the live world.**

**Recommended live check:** Open the subway, click **Lighting -> Select**, confirm visible WoD lights pulse; hover or select one to see its name, then move it and confirm the label follows canvas changes.

**Rollback:** Revert to v0.1.2 (the previous GitHub release), or disable WoD Light. The v0.1.3 local ZIP was not published to GitHub. Previously upgraded Item images depend on the v0.1.2+ SVG assets; retain these files or restore a matching world backup if downgrading before v0.1.2. Previously created world Items and Ambient Lights remain after disabling.

---

# WoD Light v0.1.3 — 2026-10-17

Usability update for Foundry VTT v14 and WoD20.

- When the GM activates the native **Lighting -> Select** tool, currently visible WoD Light fixtures on the viewed Level pulse briefly in amber.
- This is a GM-local locator effect only; it does not create world markers or change scene documents.
- Retains the existing **Find WoD Lights** utility, placement pulse, readable SVG icons, and Token HUD carried-light behavior.
- Existing fixtures remain untouched; no migrations.

**Upgrade:** Back up your world, replace/update the module, refresh the browser, then switch to the Lighting Select tool on a scene with WoD Light fixtures and confirm they pulse.

**Test results:** Node 22 smoke tests passed. **Live Foundry v14 testing is still pending.**

**Rollback:** Restore the previous module folder. Existing created Items and Ambient Lights remain in the world.

---

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
