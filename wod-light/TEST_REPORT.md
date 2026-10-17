# WoD Light v0.1.7 — Test Report

**Prepared:** 2026-10-17; **Environment:** local Node.js v22 mock Foundry harness plus Python SVG/XML raster validation. Live Foundry client not connected.

## Verified locally

- 51 total presets and 51 distinct preset IDs, comprising 27 unchanged originals and 24 additions (Indoor 11, Outdoor 5, Effects 6, Portable 2); 10 portable overall.
- All 51 SVG assets exist and are parseable; original 27 icons are byte-identical to v0.1.6. New 24 icons manually inspected at 84px and 24px on a contact sheet.
- New scene presets create native Ambient Lights with their own flags, expected ranges, optional Level behavior and unchanged selection/pulse mechanism.
- New portable searchlight and road flare use the existing held-light Token HUD set/switch/off/restore behavior and 3-o'clock origin geometry. Searchlight cone remains directional; road flare remains 360°.
- Catalog upgrade logic on an installed 27-Item world offers exactly 24 missing presets once, creates only missing Items when accepted, preserves existing Item instances and custom images, and does not reprompt after declining. Manual later installation remains available.
- Existing tests still cover GMs/non-GMs, duplicate installation prevention, icon refresh safeguards, token ownership, Lighting finder, continuous GM-only locator rings, hover/selection labels, scene updates and teardown.
- `node --check` source checks, `node tests/smoke.mjs`, JSON manifest, SVG parsing, complete release ZIP content.

## Pending live checks

1. Upgrade the existing world from v0.1.6; verify GM sees one `Add 24 Lights` prompt, then the four existing Items folders contain the new presets without any customized Items changing.
2. Drag **Subway Platform Strip** and **Warehouse High-Bay LED** onto appropriate maps; confirm native Ambient Lights are selected and movable/deletable, with continuous locator pulses while Lighting is active.
3. Equip **Handheld Searchlight** and **Emergency Road Flare** separately on a test Actor; check light toggle, angle/color, cone rotation, right-edge origin, and prior-light restoration in a real client. Test wall occlusion and one second-player view.
4. Restart GM/browser; verify the missing-preset prompt does not repeat and no new duplicates appear.

**Evidence classification:** static, raster and mock-tested; **not live-verified**. Never claim the Foundry deployment succeeded until a live map/token workflow is confirmed.

---

# WoD Light v0.1.6 — Test Report

**Prepared:** 2026-10-17  
**Environment:** Node.js v22 local mock Foundry harness. No actual Foundry v14 client/server session was available.

## Automated checks

- `node --check` on all JavaScript sources and the smoke script; JSON module manifest validated.
- `node tests/smoke.mjs` passed for the new token light-origin and emitted-source adapters.
- Checks include: 3 o'clock edge offset at token 0/90/180/270 degrees; independent x/y/elevation inputs; original positioning and source data for inactive/unrecognized lights; omnidirectional carried items; outward directional-cone data; idempotent patch; no changes to unrelated tokens.
- Existing coverage preserved for preset installation, SVGs, Item icon migration safeguards, stationarity of world Ambient Lights, Token HUD ownership/toggle, restored prior token lighting, and GM Lighting locator/finder UI.

## Live verification pending — must not conflate with mock success

1. Give a test PC a Flashlight on a simple scene; turn it on. With token facing default rotation 0, check **origin at token 3 o'clock and beam toward the right**.
2. Rotate token 90/180/270 degrees; confirm emitter follows the token's edge, and **the cone points directly outward**, not perpendicular to the offset.
3. Switch to Candle or Lantern; verify circular light appears offset to the same edge. Turn it off and verify original lighting.
4. Test near a wall, while moving, and from a second player's client. If the cone is correctly positioned but points south at rotation 0, the Token `_getLightSourceData` adaptation is not being honored and needs a version-specific correction.

**Evidence:** syntax/mock-tested only; Foundry v14 client rendering and multiplayer remain **unverified**.

---

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
