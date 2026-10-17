# WoD-Light-Sources
A folder of items to import into WoD worlds with pre-configured lights

## WoD Light v0.1.7

This repository contains the complete source for a small campaign-focused Foundry VTT v14 module for the World of Darkness 20th system.

- [`wod-light/`](wod-light/) — installable module directory, including `module.json`, lighting presets, Token HUD controls, and [instructions](wod-light/README.md).
- [`tests/smoke.mjs`](tests/smoke.mjs) — Node 22 simulated-Foundry smoke test; run from repository root with `node tests/smoke.mjs`.
- [`16-WOD-LIGHT-HANDOFF.md`](16-WOD-LIGHT-HANDOFF.md) — project decisions, data contracts, and pending live tests.

**Install:** Download this repository and copy its internal `wod-light` folder to `Z:\\Data\\modules\\wod-light` (with `module.json` immediately inside). Restart Foundry, enable WoD Light in the intended world, and accept the GM prompt to create 27 preset Items. Back up the world before installing. See the [module README](wod-light/README.md) for usage and rollback.

**Status:** v0.1.7 adds 24 modern-scene light presets, 24 readable SVG icons, and an opt-in existing-world catalog upgrade. Syntax/mock tests passed. Live Foundry v14 / WoD20 behavior has not yet been verified. This is a lightweight campaign utility, not a replacement for Foundry's native lighting system.

**v0.1.7 interaction:** In Foundry's Lighting controls, WoD Light fixtures remain visibly pulsing until the GM leaves Lighting. Hover or select a fixture to see its name and editing hint. Ordinary scenes do not require Levels.

**Portable light origin in v0.1.7:** Active carried lights now emit near the token's local right edge and rotate with it. Directional cones face outward; circular lamps and candles remain omnidirectional. No new scene lights or data migrations. Live Foundry rendering still needs confirmation.

**v0.1.7:** 51 presets total (27 original, 24 new), including transit, medical, industrial, retail, nightlife and emergency scenes. Existing worlds receive a one-time offer to add only the missing Items; the user can decline and later run `game.wodLight.installPresets()`. [Full catalog](wod-light/CATALOG.md). No world Scene or Actor migration.
