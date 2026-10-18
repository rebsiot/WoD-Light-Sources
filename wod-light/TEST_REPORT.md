# AFT Lighting+ v0.2.1 — Test summary (2026-10-18)

- **Scope:** Display-name and UI-label update only. Source based on verified `v0.2.0` GitHub commit `f39d4593b63f78a6794272c923bf406e59b14a29`; local v0.2.0 ZIP key files matched GitHub blob SHAs.
- **Automated:** Node syntax checks; 51 SVG XML validations; manifest ID/title/version/URL checks; no new Item IDs or Scene/Actor migrations; package ZIP integrity/root structure. Full GitHub smoke test is evaluated by the publishing workflow.
- **Live tests:** Not run here. Verify module list label **AFT Lighting+**, old world remains enabled, legacy Items folder persists, and native lighting/Token HUD still function in a real Foundry world.
- **Compatibility:** Foundry v14 targeted; game system versions and three-world smoke matrix remain unverified in the live installation.

---

# WoD Light v0.2.0 — Test report

**Source baseline:** Published GitHub tag `v0.1.7` at commit `c26785e6bf4b4f2279ed940845bade7ed4d41663`. Local ZIP manifest/core script blob hashes match the published tag. **Current build:** `v0.2.0`.

## Automated and static checks

- Node 22 syntax checks for all JavaScript scripts, JSON parse, complete ZIP integrity/entrypoint checks and 51 distinct SVGs.
- Mock Worlds: native Item creation on `worldofdarkness` (`Item`), `pf2e` (`equipment`), `dnd5e` (`loot`) with system-appropriate descriptions and the same `flags.wod-light.presetId`.
- Add-only setup and upgrade preserve existing Item IDs/custom icon images; unsupported systems make no Items.
- Native AmbientLight creation/drop unchanged in three mock Worlds, GM-only, and preserve preset IDs.
- Portable light on/off restores original token light; player token-owner use, non-owner denial, zero-quantity denial, PF2e `TokenLight` collision guard and right-edge handheld-origin geometry covered.
- Existing finder and continuous locator source unchanged; these tests verify shared API loading, but do not reproduce all actual canvas DOM interactions.

## Not tested live

- Actual Foundry v14 `worldofdarkness`, `pf2e` or `dnd5e` systems' Item model validation/sheet display/inventory drag, embedded Items, and multiple clients.
- PF2e active `TokenLight` rule interactions after its own Actor/Token preparation, D&D5e 2014/2024 rules setting, and actual v14 cone/wall behavior.
- The module's protected token light source hook is an integration risk in future Foundry releases.

## One live test per system

1. In a **test world and backup**, enable WoD Light; as GM accept creation of 51 presets. Confirm Item types and thumbnails in Items directory; drag **Recessed Ceiling LED** onto a Scene and verify native Ambient Light selection and continuous locator pulse.
2. Give a controlled PC the **Flashlight** Item; activate the Token HUD switch; confirm the cone begins on the right-hand side, follows token rotation, and previous light returns on off. Repeat with a player client.
3. On PF2e, add a separate native `TokenLight` effect and confirm WoD Light warns and does not overwrite it. On D&D5e, try both 2014 and 2024 rules settings.

**Release status:** Automated/mock-tested only. No live deployment or full compatibility claim.
