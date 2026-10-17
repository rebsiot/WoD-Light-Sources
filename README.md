# WoD-Light-Sources
A folder of items to import into WoD worlds with pre-configured lights

## WoD Light v0.1.5

This repository contains the complete source for a small campaign-focused Foundry VTT v14 module for the World of Darkness 20th system.

- [`wod-light/`](wod-light/) — installable module directory, including `module.json`, lighting presets, Token HUD controls, and [instructions](wod-light/README.md).
- [`tests/smoke.mjs`](tests/smoke.mjs) — Node 22 simulated-Foundry smoke test; run from repository root with `node tests/smoke.mjs`.
- [`16-WOD-LIGHT-HANDOFF.md`](16-WOD-LIGHT-HANDOFF.md) — project decisions, data contracts, and pending live tests.

**Install:** Download this repository and copy its internal `wod-light` folder to `Z:\\Data\\modules\\wod-light` (with `module.json` immediately inside). Restart Foundry, enable WoD Light in the intended world, and accept the GM prompt to create 27 preset Items. Back up the world before installing. See the [module README](wod-light/README.md) for usage and rollback.

**Status:** v0.1.5 keeps GM-only fixture rings gently pulsing while native Lighting tools are active. Syntax/mock tests passed. Live Foundry v14 / WoD20 behavior has not yet been verified. This is a lightweight campaign utility, not a replacement for Foundry's native lighting system.

**v0.1.5 interaction:** In Foundry's Lighting controls, WoD Light fixtures remain visibly pulsing until the GM leaves Lighting. Hover or select a fixture to see its name and editing hint. Ordinary scenes do not require Levels.
