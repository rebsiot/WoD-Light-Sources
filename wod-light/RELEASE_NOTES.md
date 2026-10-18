# AFT Lighting+ v0.2.1 — A clearer name in Foundry

The module formerly shown as **WoD Light** is now **AFT Lighting+**. It should appear under that name in Foundry's module lists, making it easier to recognize among other AFT modules.

## What's changed

- Renamed the visible module title, lighting finder and in-world prompts.
- New worlds create an **AFT Lighting+** Items library; existing **WoD Light** folders remain intact.
- All **51 presets**, scene lights and portable Token HUD functionality are unchanged.

## Before updating

Back up your world, then update through Foundry Setup and reload the world. The internal module ID is still `wod-light`, so **do not install a second copy** or delete the old module: this is a normal update. No Item reimport is needed.

## Known limitations

The naming and source checks are automated. Previous cross-system compatibility is still awaiting live Foundry v14 tests in WoD20, PF2e and D&D5e, including player-held light behavior. A renamed module does **not** indicate whether it is enabled in a particular world; check the Module Management checkbox for each world.

**Install manifest:** https://github.com/rebsiot/WoD-Light-Sources/releases/latest/download/module.json

**Rollback:** Restore the published v0.2.0 module files if required. The name update does not migrate or remove any world data; existing Items and Scene Ambient Lights are retained.
