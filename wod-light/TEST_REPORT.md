# WoD Light v0.1.5 — Test Report

**Date:** 2026-10-17  
**Environment:** Node.js v22 local mock Foundry harness; no connection to the live Foundry v14 server.

## Automated and static checks

- JavaScript syntax: `node --check` on the main module, finder, presets and smoke tests.
- 27 individual SVG icons present and well-formed; module manifest identifies `wod-light` v0.1.5 with release-download and stable manifest URLs.
- `node tests/smoke.mjs` passed. Exercised persistent ring creation and idempotence, native Lighting callbacks and activation/deactivation Layer hooks, visibility/optional Levels, camera pan and document movement, adding/deleting lights, rapidly leaving/reentering Lighting, and scene teardown (no stale callbacks).
- Preserved tests of Item installation/icon upgrades, drag-created native Ambient Light, light finder, hover/selection labels, Token HUD/ownership and previous-light restoration.
- Ring overlays use CSS `animation: ... infinite`, `pointer-events: none`, and static fallback for `prefers-reduced-motion`. The runtime does not poll continuously or write overlay data to the world.

## Live testing pending

- In Foundry v14, open a single-level Scene with existing WoD Light Ambient Lights. Confirm the markers keep pulsing for at least 10 seconds while Lighting is active, even when switching between Lighting subtools.
- Switch to Tokens, confirm all pulses are immediately gone; switch back to Lighting to see them again. Verify pan/zoom/reposition and create/delete refresh.
- Confirm players see none of the GM-only locators and that existing Token HUD flashlight behavior is intact.

**Evidence:** Syntax and mock tested; **not live-verified**. No Foundry world data changed during test.
