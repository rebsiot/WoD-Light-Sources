# WoD Light v0.2.0 — More game systems

WoD Light can now create native light-preset Items in **World of Darkness 20th, Pathfinder 2e, and D&D 5e**, including its 2014 and 2024 rule options. The 51 light presets, familiar icons, scene light controls, and Token HUD remain the same.

## What's changed

- In PF2e the library creates equipment Items; in D&D5e it creates loot Items. Existing WoD20 Items are untouched.
- Portable Items still use the lightbulb Token HUD. PF2e tokens with an active `TokenLight` rule are not overwritten by the module's handheld switch.
- The module no longer requires the WoD20 system in its manifest. Unsupported game systems are not offered an unsafe Item library.
- The public README now starts with setup and two examples, correctly says **51 presets**, and clarifies the layout of the release ZIP.

## Before updating

Back up your world. Update through Foundry Setup, then restart/refresh the client. Already-installed library Items and placed lights are not migrated or replaced. There are no new presets to install if your world already has all 51.

## Known limitations

This is a cross-system test release. Automated Node/mocked Foundry tests pass, but there is **no recorded live three-system or multiplayer test** yet. Token-origin rendering, PF2e rule interactions, and D&D5e inventory-drop behavior need confirmation in Foundry v14. Check existing token lights before enabling another lighting module concurrently.

**Install manifest:** https://github.com/rebsiot/WoD-Light-Sources/releases/latest/download/module.json

**Rollback:** Restore the earlier module package. World Items and Ambient Lights are not removed by code rollback; use your backed-up world only if reverting changes to world documents.
