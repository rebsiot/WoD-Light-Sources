# AFT Lighting+

**Place lights on a Foundry scene; switch on a carried light from the Token HUD.** AFT Lighting+ provides 51 practical, illustrated lighting presets without replacing Foundry's lighting engine.

**GM example:** In **Items → AFT Lighting+ → Indoor** (or **WoD Light → Indoor** for an existing install), drag an office fluorescent preset onto a scene. Foundry creates an editable Ambient Light. Activate **Lighting** to see persistent locator pulses for the module's lights, or use **Find Preset Lights** to search for a fixture.

**Player example:** Give your character a **Flashlight** from the Portable preset folder. On the token, right-click to open its HUD and use the lightbulb to turn the beam on or off. The token's earlier light setting is restored when you turn the carried light off.

## Requirements and supported game systems

Foundry VTT **v14** and one of these game systems:

- `worldofdarkness`: WoD20 (native `Item` type)
- `pf2e`: Pathfinder Second Edition (native `equipment` type)
- `dnd5e`: D&D Fifth Edition, 2014 or 2024 rules / commonly called 5.5e (native `loot` type)

The **core lighting code is system-independent**, but inventory presets and Token HUD have adapters only for these three systems. Other systems cannot automatically install the Item library. The new adapters have passed source/mock tests, **not live system-client tests**; treat this version as a test build. PF2e `TokenLight` rules may override token lighting, so the module refuses a conflicting handheld toggle.

## Install

1. Back up the world, then go to **Foundry Setup → Add-on Modules → Install Module**.
2. Paste the manifest: `https://github.com/rebsiot/WoD-Light-Sources/releases/latest/download/module.json`.
3. Install, enable **AFT Lighting+** in the intended world, and refresh the browser after updating.
4. As GM, accept the optional prompt to create the **51 light presets** in four Item folders.
5. Drag scene presets onto the map; give portable presets to characters to use the Token HUD.

**Existing worlds:** Upgrades offer **only missing presets**, once, after GM confirmation. Existing Item IDs, custom images, Actors and placed lights are preserved. A GM who declines can add missing presets later with `game.wodLight.installPresets()`.

**ZIP layout:** This repository holds the installable source under [`wod-light/`](wod-light/), **not** at its root. The published [release ZIP](https://github.com/rebsiot/WoD-Light-Sources/releases) contains `module.json` at the ZIP root. For manual installation extract the ZIP contents into Foundry's `Data/modules/wod-light/` after stopping the server. Do not create an extra nested `wod-light` folder.

## Documentation, status and credits

- [Complete 51-light catalog](wod-light/CATALOG.md)
- [User guide and limitations](wod-light/README.md)
- [Release notes](wod-light/RELEASE_NOTES.md) and [historical changelog](wod-light/CHANGELOG.md)
- [Automated test report](wod-light/TEST_REPORT.md)
- [GitHub releases](https://github.com/rebsiot/WoD-Light-Sources/releases) · [Report an issue](https://github.com/rebsiot/WoD-Light-Sources/issues)

The vector icons are custom project-generated artwork. No TC Modern creator maps, subscriber assets or player data are included. **No explicit open-source license has been granted** for this repository; discuss redistribution terms with the maintainer. Live Foundry/GM/player testing is required before general compatibility or stability claims.

**Renaming:** Foundry now lists this module as **AFT Lighting+**. Its unchanged internal ID is `wod-light`, so upgrades preserve existing flags, Items, and installed module identity. Old **WoD Light** Items folders remain unchanged; new installs use **AFT Lighting+**.
