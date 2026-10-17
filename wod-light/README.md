# WoD Light v0.1.2

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

Open the **Items** directory, expand `WoD Light`, and drag a preset Item onto the canvas. The module creates a **normal Ambient Light** at the dropped position, on the currently viewed **Level** in Foundry v14.

**After placing a light, Foundry's Lighting layer opens, the new light is selected, and a large amber local locator pulse names it for two seconds.** Drag the selected control to move it, press **Delete** to remove just that light, or double-click to edit it. This uses Foundry's native controls, not a separate management panel. The Item is a placement template, not a tile or token.

**Finding an older light:** Activate the native **Lighting** controls and click **Find WoD Lights** (magnifying glass icon). A small, searchable list of **WoD Light-created** fixtures appears; **large numbered amber markers** temporarily identify their positions on the map, including those from older versions. Click a row/marker to pan, select and pulse that light. Close the list to clear markers. Markers never exist as Tiles or world documents, and they are visible only to the GM using the tool. The finder prioritizes the last light placed in this client.

Lights assigned to another Foundry Level are listed by name with an **Other Level** indication; switch to that Level first and select the light again. Lights from v0.1.0 may say **Unassigned Level**. The native **Lighting > Placeables** sidebar remains an alternative for all scene lights. **Never use Clear Lights** unless you mean to erase every Ambient Light on the scene.

**Important for v0.1.0 placements:** Earlier dropped lights were created without explicit Level/elevation information. Existing lights are **never relocated automatically** by the update. Find them using the Placeables tab (including other Levels), adjust the correct Level in native Light configuration or remove and replace individually, after checking which light it is.

**Item artwork:** The module includes **27 custom, readable SVG pictograms**. Existing world library Items with the module's original default `light.svg` / `torch.svg` images receive the corresponding new image automatically on the GM's first launch after upgrade. An Item with customized art is **not overwritten**. Actor-embedded equipment is **not altered**; transfer a fresh portable Item from the library if you want its new icon on the character sheet. No Item names, descriptions, ratings or IDs are modified.

If you dismissed the first-run prompt, open the browser console as GM and run `game.wodLight.installPresets()`. Running it again only adds presets whose IDs are absent; it does not overwrite customized Items. To retry only the safe stock icon update: `game.wodLight.refreshPresetIcons()`.

## Player: turn on a carried light

The GM drags an Item from `WoD Light > Portable` onto a character's Actor sheet. The character then has a **lightbulb button on the upper-left side of their Token HUD** (right click the token to show the HUD):

- **Left click:** switch carried light on/off.
- **Right click:** choose a different carried light if the character has more than one.
- **Flashlight, tactical flashlight, headlamp and phone:** directional beam; rotating the token turns the cone with the token's facing.
- **Lantern, candle, glow stick and torch:** omnidirectional.

Only the token's owner or the GM can operate the button. No equipment Item => no button. The module snapshots and restores that *specific token's* prior light settings instead of editing prototype tokens.

## Notes / limitations

- When working on a v14 multi-Level Scene, new Ambient Lights are assigned to the currently viewed Level and its bottom elevation. This needs live verification in the subway scene.
- New light selection depends on the native Lighting layer drawing the created light; if selection is unavailable, use **Find WoD Lights** or the native Placeables tab. Finder UI depends on Foundry v14 `getSceneControlButtons` and remains live-unverified.
- Preset distances use the Scene's configured distance units; the numbers assume scenes measured in feet. They are game-friendly approximations, **not measured bulb lumens**. Adjust individual native Ambient Lights as needed.
- Item drop uses the Foundry `dropCanvasData` hook. It is designed for **world Items created in the WoD Light folder**. Compendium-only or nested third-party drag flows have not been confirmed.
- Stationary light placement is GM-only. Players can toggle a light only when carrying its tagged equipment Item.
- Foundry v14 + live WoD20 + multiplayer testing **not yet performed**; this package has static and simulated tests only.
- Potential interaction with other modules that directly replace Token light settings (Torch and similar) is not tested. Prefer disabling those overlapping lighting controls in the campaign.
- Deleting an Item from an Actor does not forcibly turn off a light that was previously activated; turn it off first. This will be revisited only if necessary.
- Preset creation is additive. The only automatic upgrade edit is the `img` field of identifiable *world* preset Items still using the original generic stock icon; customized artwork and all Actor Items remain untouched. Disabling the module does not delete Items or Ambient Lights it has created.

## Rollback

1. Back up your world first. Stop Foundry and restore the previous `wod-light` module folder, or disable/remove it if this is the first install.
2. World Items and Scene Ambient Lights made by the module **remain in the world** after disabling; remove those separately only if you intend to.
3. For a world-data rollback use a matching world backup; replacing the ZIP never restores documents.

## Technical

- Module ID: `wod-light`; version: `0.1.2`.
- WoD20 generic equipment type: `Item`.
- Preset Item flag: `flags.wod-light.presetId`.
- Token flags: `flags.wod-light.activeId` and `flags.wod-light.previousLight`.
- Created Ambient Light flag: `flags.wod-light.presetId`.
- No modified system files or external dependencies.

## Release notes

### 0.1.2 — 2026-10-17
- Replaced original generic icon art with 27 custom vector pictograms, designed and reviewed at 24px/64px.
- Automatically refreshes **only** stock WoD Light world Item images; preserves customized images and Actor inventory Items.
- Added GM-only **Find WoD Lights** tool under Foundry v14's native Lighting controls: searchable fixture list, temporary high-contrast map pins and direct native light selection/pan.
- Newly dropped and located lights receive a high-contrast local pulse/label (no multiplayer ping).
- No changes to existing Scene lights, player/token data, or lighting presets.
- Tests: Node simulation, syntax, icon inventory and SVG/XML validation passed; live Foundry v14 pending.

### 0.1.1 — 2026-10-17
- Fixed new light fixtures being hard to locate immediately after a drop: activate the native Lighting layer and select the newly created Ambient Light.
- New lights receive the currently viewed Foundry v14 Level and bottom elevation when a Level is available.
- Added instructions for locating or removing previously placed lights via the native Placeables tab, including all-Level search for legacy lights.
- Preserves existing Ambient Lights and all player/Token lighting settings; no world migration.
- Tests: Node syntax and simulated multi-Level scene selection/drop passed; live Foundry v14 not yet verified.

### 0.1.0 — 2026-10-16
- Added 27 basic indoor, outdoor, portable and atmospheric light presets.
- Added opt-in, additive Item-folder initialization.
- Added drag-to-map native Ambient Light creation from tagged world Items.
- Added inventory-aware left-side Token HUD toggle and right-click source chooser.
- Added restoration of pre-existing token lighting when switched off.
- Tests: local syntax/mock only. Live Foundry v14: **not tested**.
