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
