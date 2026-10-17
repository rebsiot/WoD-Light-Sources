# WoD Light v0.1.4 — Test Report

**Date:** 2026-10-17  
**Environment:** Node.js 22 local harness; no live Foundry VTT client or server connected.

## Local tests passed

- `node --check` for `scripts/main.js`, `scripts/finder.js`, `scripts/presets.js`, and the smoke-test script.
- `node tests/smoke.mjs`: 27 preset flags and module-owned SVG paths; additive Item install and safe icon refresh; native Ambient Light placement with Level data only when available; selection and GM ownership; Token HUD toggle and original-light restoration.
- Native Foundry v14 control callbacks: Lighting control activation, Select tool activation, suppression of duplicate callbacks; noninteractive pulsing of visible WoD light fixtures; excluding lights on other viewed Levels; no-visible-lights behavior.
- Readable hover/selected fixture label: native hover/control Hook simulation, pointer-proximity fallback, and cleanup on canvas tear-down. Enlarged CSS ring and label styling validated.
- Source ZIP manifest version and download URL checked; icon paths and module assets verified.

## Pending live Foundry v14 checks

- Click Lighting then Select, confirm GM sees approximately 3-second amber rings for visible WoD Light fixtures.
- Hover/select a light on subway map, verify name and move/Delete hint remains readable, with no interference with native drag/delete.
- Pan/zoom while selected, verify overlay reposition and hide when changing tool or scene.
- Confirm existing world Lights, portable flashlight beam/Token HUD, inventory and custom icons stay unchanged.

**Evidence label:** Automated/mock-tested. Live Foundry/browser verification: **not yet run**.
