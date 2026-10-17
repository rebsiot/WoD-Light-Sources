# 16 — WoD Light (St. Louis v2)

**Owning conversation:** `16.0 — WoD Light` (user-selected initial thread name)  
**Next development conversation:** `16.1 — WoD Light Improvements`  
**Created:** 2026-10-16  
**Status:** v0.1.2 implemented and local tests passed; user confirmed initial map placement issue; finder + SVG art **live Foundry verification pending**.

## Purpose and settled requirements

- Very small Foundry v14/WoD20 module for instant GM scene lighting; not a public product.
- No GM dashboard/panel and no external Torch requirement.
- `WoD Light` Items folder with named presets for desk lamps (40W/60W, warm/daylight), ceiling (4x60W/2x100W, warm/daylight), office, outdoor, portable and effects lighting.
- GM drags a preset Item onto the map and a native `AmbientLight` is placed at the drop point.
- Giving a portable preset Item to an Actor causes a Torch-like lightbulb to appear in the upper-left Token HUD; click on/off, right-click to choose carried source.
- A flashlight emits a cone of light which should turn with token rotation. Players should never have to edit token light settings.
- Native WoD20 Item type is exactly `Item`; do not change Actor schema or the other project's modules.

## v0.1.2 — 2026-10-17

- User requested legible, identifiable source images (not scribbles) and a simple way to signal/find placed lights much later, without a GM management dashboard.
- Added 27 original SVG Item thumbnails (`wod-light/assets/icons/{presetId}.svg`) designed as bold, high-contrast silhouettes. Reviewed at 64px and 24px with a contact sheet; built-in shape variants cover indoor, outdoor, portable, effects lights, and warm/daylight distinctions. No copyrighted or Patreon art used.
- World Item image upgrade is **selective:** only module-tagged world Items whose `img` is the original generic `icons/svg/light.svg` / `icons/svg/torch.svg` are updated on GM launch. Customized Item images and all embedded Actor Items remain unchanged. No forced migration or world Scene edit.
- Hook `getSceneControlButtons` adds one **Find WoD Lights** button to native v14 Lighting tools. Clicking opens a compact, searchable, GM-only list and local on-map numbered amber markers. Choosing a light pans and selects its native Ambient Light, with a local pulse/label. Lights on a different viewed Level are reported and never silently relocated.
- A fresh drag-to-scene automatically shows an amber pulse and short name label. Existing v0.1.1 auto-selection/Level behavior remains.
- Finder uses `scene.lights`, native `canvas.lighting`, `canvas.animatePan`, `canvas.clientCoordinatesFromCanvas`, and `canvasPan` hooks. No alternate lighting engine, manager panel, world Tiles, or network pings.
- Full ZIP for direct install and GitHub release v0.1.2; same module ID `wod-light` and same stable manifest path. Source tests and icon checks passed; **live Foundry v14 scene/player tests are not yet done.**
- Next test: load Subway, activate Lighting > Find WoD Lights, find and select the existing Office Fluorescent; then drop a new one and check labeled pulse + easy movement.

## v0.1.1 — 2026-10-17 (this conversation)

- User reported: an Office Fluorescent preset dropped onto the subway Scene but its control was effectively impossible to locate for moving/deleting.
- Foundry v14 changed Ambient Light markers to small dots. The native Placeables sidebar (Lighting layer) lists/searches the scene lights and supports selection.
- v0.1.0 placed lights without explicit native v14 Level/elevation, possibly producing off-floor results in multi-Level subway maps.
- Fix: new lights include `levels: [canvas.level.id]` and `elevation: canvas.level.elevation.bottom` when the viewed Level exists. After the `AmbientLight` is created, activate native Lighting with Select tool and control the newly created light by returned ID. If the placeable has not drawn, bounded animation-frame retries and a Placeables fallback keep the creation intact.
- No custom manager panel, no new Items, no migrations. Previously placed lights are **not changed**. The existing wrongly placed light must be located via Placeables (show all Levels / clear Viewed filter), then manually edited, deleted or replaced.
- Tests: updated Node 22 mock tests cover multi-Level placement, auto-selection, same-scene guard, and no-Level scenes. Live v14 with the actual subway map still pending.
- Module version `0.1.1`; release manifest unchanged: `https://github.com/rebsiot/WoD-Light-Sources/releases/latest/download/module.json`.
- Next test: in subway while viewing the intended Level, drag new Office Fluorescent; check that it is selected and movable/deletable and that it shows on that Level.

## Initial release

- `wod-light-0.1.0.zip`, with one top-level `wod-light` module folder and `module.json` at its root.
- Module ID: `wod-light`, independently versioned `0.1.0`.
- Sources: `scripts/main.js`, `scripts/presets.js`; CSS: `styles/wod-light.css`.
- Starter preset catalog: 27 (8 portable), installed by **opt-in first GM launch confirmation** as world Items in one root folder and four child folders.
- Installing again via GM console `game.wodLight.installPresets()` is additive and idempotent, and does not replace edited Items.
- Map placement: `dropCanvasData` hook for tagged world Items, writes native `AmbientLight` config.
- Token operation: `renderTokenHUD` hook; lights detected from Actor-owned Item flags, stored on Token document. Complete original light config saved for subsequent restore.
- Token last-selected portable source persists in token flag.
- Tests: local syntax/static and Node mocked Foundry API. No actual Foundry client or live server was available in this chat; **do not mark live verified**.

## Data contracts

- `flags.wod-light.presetId` on each world/Actor Item, and created Ambient Light.
- `flags.wod-light.libraryRoot` on the Items root folder; `flags.wod-light.group` on each child folder.
- `flags.wod-light.activeId`, `selectedId`, `previousLight` on individual token documents.
- No changes to existing Actor fields, world Scenes except GM-requested new Ambient Lights, or other module scripts.

## Known limitations

- Drag-to-canvas is designed for world Items in the new folder; compendium-only drag paths not live-verified.
- Interactions with other token-light-modifying modules not validated.
- Light distances follow the Scene distance unit, so the defaults assume feet; watt labels are narrative rather than physically calibrated.
- Clearing a carried Item while lit leaves an HUD switch to turn it off manually. No automatic cross-scene cleanup.
- Token rotation synchronization and wall occlusion require live validation.

## Next single live smoke test

After installing/enabling in the target world, confirm the GM's Items folder is created. Drag **Desk Lamp - 60W (Warm)** onto the map. Verify one editable native Ambient Light appears. Then test the Flashlight HUD/rotation as the second integration test.

## Install, rollback, references

Follow `wod-light/README.md` and `wod-light/TEST_REPORT.md` in the ZIP. Install to `Z:\Data\modules\wod-light`, after backing up the target world and stopping Foundry; restart/enable world. On rollback, restoring module source does not undo world Items or created Ambient Lights. Read `00-START-HERE.md`, `GLOBAL-02-ARCHITECTURE-DATA-CONTRACTS.md`, `GLOBAL-03-RELEASE-DEPLOYMENT-TESTING.md` and `GLOBAL-04-DECISIONS-ROADMAP-RISKS.md` as needed. Add this component to `00-START-HERE.md` on the next shared index update; `GLOBAL-04` needs update only after live confirmation.
