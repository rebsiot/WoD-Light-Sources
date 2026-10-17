# 16 — WoD Light (St. Louis v2)

**Owning conversation:** `16.0 — WoD Light` (user-selected initial thread name)  
**Next development conversation:** `16.1 — WoD Light Improvements`  
**Created:** 2026-10-16  
**Status:** Initial private campaign-only module assembled; **mock-tested, live Foundry verification pending**.

## Purpose and settled requirements

- Very small Foundry v14/WoD20 module for instant GM scene lighting; not a public product.
- No GM dashboard/panel and no external Torch requirement.
- `WoD Light` Items folder with named presets for desk lamps (40W/60W, warm/daylight), ceiling (4x60W/2x100W, warm/daylight), office, outdoor, portable and effects lighting.
- GM drags a preset Item onto the map and a native `AmbientLight` is placed at the drop point.
- Giving a portable preset Item to an Actor causes a Torch-like lightbulb to appear in the upper-left Token HUD; click on/off, right-click to choose carried source.
- A flashlight emits a cone of light which should turn with token rotation. Players should never have to edit token light settings.
- Native WoD20 Item type is exactly `Item`; do not change Actor schema or the other project's modules.

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
