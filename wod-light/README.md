# WoD Light

A small Foundry VTT v14 lighting utility with 51 recognizable, ready-to-place light presets. GMs place ordinary Ambient Lights on a scene; players can switch on a carried flashlight, lantern, torch or another portable light using the Token HUD. It uses Foundry's lighting engine, not an alternate lighting system.

## Two quick examples

**GM — light a room:** Open **Items → WoD Light → Indoor**, drag **Office Fluorescent – Daylight** onto the map. The light is selected automatically. While **Lighting** controls are active, placed WoD Light sources pulse so you can find and move them later. The **Find WoD Lights** button opens a searchable locator.

**Player — use a flashlight:** The GM adds **WoD Light → Portable → Flashlight** to your character's inventory. Right-click the token and use its **lightbulb** HUD button to turn the beam on or off. Right-click the button to choose among several carried sources. Turning off restores that token's previous light settings.

## Compatibility

- **Foundry VTT:** version 14; other versions are not certified.
- **World of Darkness 20th:** `worldofdarkness`, preserving its original `Item` presets.
- **Pathfinder Second Edition:** `pf2e`, using native **equipment** Items.
- **Dungeons & Dragons Fifth Edition:** `dnd5e`, using native **loot** Items for both the 2014 and 2024 rule choices (often called 5.5e).
- **Unsupported systems:** no automatic Item-library creation; do not expect the inventory HUD to work. Core Foundry lighting APIs and the module's `placePresetOnScene` GM API remain system-independent.

**Compatibility status:** Source and mocked APIs were checked, but live Foundry v14 playtests with these systems have not yet been recorded. In PF2e, if another effect already uses a `TokenLight` rule element, WoD Light refuses to switch on a conflicting carried light instead of overwriting that automation. Avoid simultaneous operation with other token-light modules until tested.

## Install and first use

1. Back up the world, especially if it already contains WoD Light Items or modified token lighting.
2. In **Foundry Setup → Add-on Modules → Install Module**, enter the manifest URL:

   `https://github.com/rebsiot/WoD-Light-Sources/releases/latest/download/module.json`

3. Enable **WoD Light** in the intended world; restart/refresh the client after updating.
4. As GM, accept **Create Light Items** to add the 51 starter Items in four folders: Indoor, Outdoor, Portable, Effects.
5. Drag a preset from Items to the map. For portable lights, give its Item to a character and use the Token HUD button.

**Existing worlds:** The one-time upgrade prompt only offers *missing* presets. It preserves existing Items, IDs, custom images, Actors, and placed lights. The module does not convert old WoD20 Items into another system's Item type or move any world content. Declining is safe; the GM can later run `game.wodLight.installPresets()` in the browser console. If you upgrade from v0.1.7 with all 51 presets, there are no new presets to import.

**Manual install:** Download the release's `wod-light.zip`, stop Foundry, and extract its contents into `Data/modules/wod-light/` (or `Z:\Data\modules\wod-light\` for the St. Louis Samba share). Verify `module.json` is directly inside that folder—not inside another nested `wod-light` folder. The GitHub repository stores its installable source inside [`wod-light/`](https://github.com/rebsiot/WoD-Light-Sources/tree/main/wod-light); the *release ZIP* contains that folder's **contents** at its own root. Enable the module after starting Foundry again.

## Notes

- Preset distances are game-scale approximations in the scene's distance units, not physical lumen conversions. The catalog was tuned around scenes using feet. Check the scene grid/distance scale in other systems; edit native lights as needed.
- Only the **ten Portable** presets enable the inventory Token HUD. An Outdoor **Portable Worksite Flood** is a movable *scene fixture*, not an inventory switch.
- Active handheld lights emit near the token's three-o'clock edge, turning with token rotation. This uses a Foundry v14 protected source method for cone orientation; actual rendering and wall interaction require live confirmation.
- WoD Light's GM-only fixture locator pulses do not create Tiles or modify Scene light records. Foundry's native Light layer remains the editing interface.
- Module disabling or reverting source **does not delete** previously created Item or Ambient Light world documents. Revert the code to the previous release if needed, and restore the world backup only when you need a data rollback.

For details see [all 51 presets](CATALOG.md), [change history](CHANGELOG.md), [test report](TEST_REPORT.md), and the [GitHub releases](https://github.com/rebsiot/WoD-Light-Sources/releases). Report bugs through [GitHub Issues](https://github.com/rebsiot/WoD-Light-Sources/issues), including Foundry/system/module versions and the reproduction steps.

## Credits and permissions

SVG preset icons were authored for this project's light catalog as standalone vector shapes; no paid TC Modern map artwork, Patreon assets or user data are distributed. This repository has **no explicit open-source license** at present; public visibility alone does not grant redistribution rights. The maintainer must choose and review appropriate software licensing before a public listing.
