# WoD Light v0.1.0

A small **private St. Louis v2 campaign module** for Foundry VTT v14 + World of Darkness 20th (`worldofdarkness`, approximately 7.3.x). No Torch dependency, GM panel, custom lighting engine or battery bookkeeping.

## Install with a manifest URL

In Foundry Setup, choose **Add-on Modules → Install Module**, paste:

`https://github.com/rebsiot/WoD-Light-Sources/releases/latest/download/module.json`

and install. This GitHub Release manifest points to the matching installable ZIP. Then enable **WoD Light** in the world.

## Manual installation

1. Back up your Foundry world. Stop the Foundry server before updating files.
2. Extract the whole `wod-light` folder into **`Z:\Data\modules\`** (Ubuntu Foundry user-data root is mapped as `Z:`). The manifest must be at `Z:\Data\modules\wod-light\module.json`.
3. Restart Foundry; enable **WoD Light** in the desired world; refresh the browser.
4. The first GM who opens the world gets a **Create Light Items** prompt. Accept it to create a `WoD Light` folder with **Indoor, Outdoor, Portable, Effects** child folders. No existing Items are modified.

## GM: place a scene light

Open the **Items** directory, expand `WoD Light`, and drag a preset Item onto the canvas. The module creates a **normal Ambient Light** at the dropped position. You can reposition, duplicate, edit and delete it with Foundry's native Lighting controls. The item is a placement template, not a tile or token.

If you dismissed the first-run prompt, open the browser console as GM and run `game.wodLight.installPresets()`. Running it again only adds presets whose IDs are absent; it does not overwrite customized Items.

## Player: turn on a carried light

The GM drags an Item from `WoD Light > Portable` onto a character's Actor sheet. The character then has a **lightbulb button on the upper-left side of their Token HUD** (right click the token to show the HUD):

- **Left click:** switch carried light on/off.
- **Right click:** choose a different carried light if the character has more than one.
- **Flashlight, tactical flashlight, headlamp and phone:** directional beam; rotating the token turns the cone with the token's facing.
- **Lantern, candle, glow stick and torch:** omnidirectional.

Only the token's owner or the GM can operate the button. No equipment Item => no button. The module snapshots and restores that *specific token's* prior light settings instead of editing prototype tokens.

## Notes / limitations

- Preset distances use the Scene's configured distance units; the numbers assume scenes measured in feet. They are game-friendly approximations, **not measured bulb lumens**. Adjust individual native Ambient Lights as needed.
- Item drop uses the Foundry `dropCanvasData` hook. It is designed for **world Items created in the WoD Light folder**. Compendium-only or nested third-party drag flows have not been confirmed.
- Stationary light placement is GM-only. Players can toggle a light only when carrying its tagged equipment Item.
- Foundry v14 + live WoD20 + multiplayer testing **not yet performed**; this package has static and simulated tests only.
- Potential interaction with other modules that directly replace Token light settings (Torch and similar) is not tested. Prefer disabling those overlapping lighting controls in the campaign.
- Deleting an Item from an Actor does not forcibly turn off a light that was previously activated; turn it off first. This will be revisited only if necessary.
- Preset creation is additive. Disabling the module does not delete Items or Ambient Lights it has created.

## Rollback

1. Back up your world first. Stop Foundry and restore the previous `wod-light` module folder, or disable/remove it if this is the first install.
2. World Items and Scene Ambient Lights made by the module **remain in the world** after disabling; remove those separately only if you intend to.
3. For a world-data rollback use a matching world backup; replacing the ZIP never restores documents.

## Technical

- Module ID: `wod-light`; version: `0.1.0`.
- WoD20 generic equipment type: `Item`.
- Preset Item flag: `flags.wod-light.presetId`.
- Token flags: `flags.wod-light.activeId` and `flags.wod-light.previousLight`.
- Created Ambient Light flag: `flags.wod-light.presetId`.
- No modified system files or external dependencies.

## Release notes

### 0.1.0 — 2026-10-16
- Added 27 basic indoor, outdoor, portable and atmospheric light presets.
- Added opt-in, additive Item-folder initialization.
- Added drag-to-map native Ambient Light creation from tagged world Items.
- Added inventory-aware left-side Token HUD toggle and right-click source chooser.
- Added restoration of pre-existing token lighting when switched off.
- Tests: local syntax/mock only. Live Foundry v14: **not tested**.
