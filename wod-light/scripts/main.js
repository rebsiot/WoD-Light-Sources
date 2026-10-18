import { PRESETS, PRESET_BY_ID, GROUPS } from "./presets.js";
import { getSystemAdapter, systemCanCreateItems, presetItemData, itemIsAvailable, conflictsWithPf2eTokenLight } from "./system-adapters.js";
import { installHeldLightOffsets } from "./held-lights.js";
import { registerLightFinderTool, showLightFinder, locateWoDLight, closeLightOverlays, refreshLightMarkers, pulseLightPosition, onLightHover, onLightControl, onCanvasPointerMove, onCanvasPointerUp, onCanvasLayerActivated, onLightingLayerDeactivated } from "./finder.js";

const MOD = "wod-light";
const ROOT_NAME = "AFT Lighting+";
const CATALOG_REVISION = "51-presets";
const LEGACY_ICON_PATHS = new Set(["icons/svg/light.svg", "icons/svg/torch.svg"]);
const iconForPreset = p => `modules/${MOD}/assets/icons/${p.id}.svg`;

function warn(message, error) {
  console.error(`AFT Lighting+ | ${message}`, error);
  ui.notifications.error(`AFT Lighting+: ${message}`);
}

// A compact, opt-in library install: no changes to existing Items or other world folders.
export async function installPresets() {
  if (!game.user.isGM) return 0;
  const adapter = getSystemAdapter();
  if (!systemCanCreateItems(adapter)) {
    ui.notifications.warn("AFT Lighting+: this game system does not have a supported native light-preset Item type. No Items were changed.");
    return 0;
  }
  let root = game.folders.find(f => f.type === "Item" && f.getFlag(MOD, "libraryRoot"));
  if (!root) {
    // Don't annex a player's existing unrelated folder with this name.
    const occupied = game.folders.some(f => f.type === "Item" && f.name === ROOT_NAME && !f.getFlag(MOD, "libraryRoot"));
    root = await Folder.create({
      name: occupied ? `${ROOT_NAME} (Presets)` : ROOT_NAME,
      type: "Item",
      flags: { [MOD]: { libraryRoot: true } }
    });
  }

  const groups = new Map();
  for (const name of GROUPS) {
    let folder = game.folders.find(f => f.type === "Item" && f.folder?.id === root.id && f.getFlag(MOD, "group") === name);
    if (!folder) {
      folder = await Folder.create({
        name, type: "Item", folder: root.id,
        flags: { [MOD]: { group: name } }
      });
    }
    groups.set(name, folder);
  }

  const installed = new Set(game.items.filter(i => i.getFlag(MOD, "presetId")).map(i => i.getFlag(MOD, "presetId")));
  const missing = PRESETS.filter(p => !installed.has(p.id))
    .map(p => presetItemData(p, groups.get(p.group).id, adapter, iconForPreset(p)));
  if (missing.length) await Item.createDocuments(missing);
  await game.settings.set(MOD, "presetsInstalled", true);
  ui.notifications.info(`AFT Lighting+: ${missing.length ? `created ${missing.length} light preset Items` : "light presets already installed"}.`);
  return missing.length;
}

// An upgrade never changes existing preset Items. One opt-in offer adds missing
// presets for existing worlds; declining won't prompt on every GM login.
export function countMissingPresets() {
  const present = new Set(game.items.filter(i => i.getFlag(MOD, "presetId")).map(i => i.getFlag(MOD, "presetId")));
  return PRESETS.filter(p => !present.has(p.id)).length;
}

export async function offerMissingPresetsOnUpgrade() {
  if (!game.user.isGM || !getSystemAdapter() || !game.settings.get(MOD, "presetsInstalled")) return false;
  const missing = countMissingPresets();
  if (!missing || game.settings.get(MOD, "catalogPromptedFor") === CATALOG_REVISION) return false;
  // Reserve the prompt even when declined; the GM can still manually run
  // game.wodLight.installPresets() later. No Scene, Actor, or Item edits yet.
  await game.settings.set(MOD, "catalogPromptedFor", CATALOG_REVISION);
  const confirmed = await foundry.applications.api.DialogV2.confirm({
    window: { title: "AFT Lighting+ — New Light Presets" },
    content: `<p>Add <strong>${missing} missing light presets</strong> to your existing light preset Items folders?</p><p>Only missing presets will be created. Your existing Items, custom images, Actors and placed lights are unchanged.</p>`,
    yes: { label: `Add ${missing} Lights` },
    no: { label: "Not Now" },
    rejectClose: false
  });
  if (confirmed) await installPresets();
  return Boolean(confirmed);
}

// Update only old, untouched generic module icons. Never replace artwork a GM
// or player intentionally chose, and do not modify Items on Actors.
export async function refreshPresetIcons() {
  if (!game.user.isGM) return 0;
  const upgrades = game.items.filter(item => {
    const preset = PRESET_BY_ID[item.getFlag(MOD, "presetId")];
    return preset && LEGACY_ICON_PATHS.has(item.img);
  }).map(item => ({ _id: item.id, img: iconForPreset(PRESET_BY_ID[item.getFlag(MOD, "presetId")]) }));
  if (upgrades.length) await Item.updateDocuments(upgrades);
  return upgrades.length;
}

function getItemFromDrop(data) {
  if (data?.type !== "Item") return null;
  // Core world Item drag contains either a UUID or the world Item ID.
  if (data.uuid && typeof fromUuidSync === "function") {
    try {
      const item = fromUuidSync(data.uuid);
      if (item?.documentName === "Item") return item;
    } catch (_) { /* An unresolved UUID isn't one of our installed world Items. */ }
  }
  return game.items.get(data.id) ?? null;
}

// Foundry v14 Scenes can contain multiple Levels. Keep dropped fixtures on the
// GM's currently viewed floor rather than relying on the default elevation 0.
function viewedLevelForScene(scene) {
  const level = canvas?.scene?.id === scene?.id ? canvas.level : null;
  if (!level?.id) return {};
  return {
    levels: [level.id],
    ...(Number.isFinite(level.elevation?.bottom) ? { elevation: level.elevation.bottom } : {})
  };
}

// Prefer native Lighting and Placeables tools to a second AFT Lighting+ manager.
// A newly created document may take a few animation frames to get its placeable.
export async function focusPlacedLight(scene, documentId) {
  if (!game.user.isGM || !documentId || canvas?.scene?.id !== scene?.id) return false;
  const layer = canvas.lighting;
  if (!layer?.activate || !layer?.get) return false;
  layer.activate({ tool: "select" });

  for (let attempt = 0; attempt < 10; attempt++) {
    if (canvas?.scene?.id !== scene?.id || layer.active === false) return false;
    const light = layer.get(documentId);
    if (light?.control) return light.control({ releaseOthers: true });
    if (attempt < 9) {
      await new Promise(resolve => {
        if (typeof requestAnimationFrame === "function") requestAnimationFrame(resolve);
        else resolve();
      });
    }
  }
  return false;
}

let shownPlacementHint = false;
export async function placePresetOnScene(presetId, x, y, scene = canvas?.scene) {
  const preset = PRESET_BY_ID[presetId];
  if (!game.user.isGM || !preset || !scene || !Number.isFinite(x) || !Number.isFinite(y)) return false;
  const created = await scene.createEmbeddedDocuments("AmbientLight", [{
    x, y, name: preset.name, rotation: 0, hidden: false,
    walls: true, vision: false,
    ...viewedLevelForScene(scene),
    config: foundry.utils.deepClone(preset.light),
    flags: { [MOD]: { presetId: preset.id } }
  }]);
  if (!created?.length) return false;

  // Make the new fixture immediately manageable: selecting it on the native
  // Lighting layer exposes drag-to-move and Delete without hunting for a dot.
  let focused = false;
  try { focused = await focusPlacedLight(scene, created[0].id); }
  catch (error) { console.warn("AFT Lighting+ | created light but could not select it", error); }
  // This stays in the GM browser only; no world marker or multiplayer ping.
  if (canvas?.scene?.id === scene.id) pulseLightPosition(x, y, preset.name);
  if (!shownPlacementHint) {
    shownPlacementHint = true;
    ui.notifications.info(focused
      ? "AFT Lighting+: new light selected. Drag to move or Delete; use Lighting > Find Preset Lights to find it later."
      : "AFT Lighting+: light placed. Use Lighting > Find Preset Lights to locate it.");
  }
  if (created[0]?.id) {
    try { await game.settings.set(MOD, "lastPlaced", `${scene.id}:${created[0].id}`); }
    catch (error) { console.warn("AFT Lighting+ | could not remember last placed fixture", error); }
  }
  return true;
}

export function onCanvasDrop(_canvas, data) {
  if (!game.user.isGM) return;
  const item = getItemFromDrop(data);
  const presetId = item?.getFlag(MOD, "presetId");
  if (!PRESET_BY_ID[presetId]) return;
  // Suppress the default Item drop; otherwise core may also try to add an Item to a token.
  if (Number.isFinite(data.x) && Number.isFinite(data.y)) {
    void placePresetOnScene(presetId, data.x, data.y, _canvas.scene).catch(e => warn("could not place the light", e));
  }
  return false;
}

function carriedLights(token) {
  const items = token?.actor?.items;
  if (!items) return [];
  const seen = new Set();
  return Array.from(items).flatMap(item => {
    const p = PRESET_BY_ID[item.getFlag(MOD, "presetId")];
    if (!p?.portable || !itemIsAvailable(item) || seen.has(p.id)) return [];
    seen.add(p.id);
    return [p];
  });
}

function previousTokenLight(document) {
  return document.light?.toObject?.() ?? foundry.utils.deepClone(document.light);
}

// Preserve the complete original Token light config and never edit prototype Token data.
export async function setCarriedLight(token, selectedId = null) {
  const doc = token?.document;
  if (!doc || !(game.user.isGM || doc.isOwner)) return false;
  const available = carriedLights(token);
  const active = doc.getFlag(MOD, "activeId");
  if (selectedId && !available.some(p => p.id === selectedId)) return false;
  if (!selectedId && !active) return false;

  // PF2e can apply its own TokenLight rule elements, which may overwrite or
  // combine with direct TokenDocument light updates. Never fight those rules.
  if (selectedId && conflictsWithPf2eTokenLight(token?.actor)) {
    ui.notifications.warn("AFT Lighting+: PF2e already controls this token's lighting via a TokenLight rule. Remove or disable that effect before using the AFT Lighting+ HUD.");
    return false;
  }

  if (!selectedId) {
    const original = doc.getFlag(MOD, "previousLight");
    await doc.update({
      ...(original && typeof original === "object" ? { light: original } : { "light.bright": 0, "light.dim": 0 }),
      [`flags.${MOD}.activeId`]: null,
      [`flags.${MOD}.previousLight`]: null
    });
    return true;
  }

  const original = active ? doc.getFlag(MOD, "previousLight") : previousTokenLight(doc);
  await doc.update({
    light: foundry.utils.deepClone(PRESET_BY_ID[selectedId].light),
    [`flags.${MOD}.activeId`]: selectedId,
    [`flags.${MOD}.selectedId`]: selectedId,
    [`flags.${MOD}.previousLight`]: original
  });
  return true;
}

const BUSY = new WeakSet();
async function guardedSet(token, id, root) {
  if (BUSY.has(token.document)) return;
  BUSY.add(token.document);
  try {
    await setCarriedLight(token, id);
    const active = token.document.getFlag(MOD, "activeId");
    const button = root?.querySelector(".wod-light-hud-button");
    if (button) {
      button.classList.toggle("active", Boolean(active));
      button.dataset.tooltip = active ? `Light on: ${PRESET_BY_ID[active]?.name ?? "Portable light"}` : "Switch portable light on";
    }
  } catch (e) {
    warn("could not change token lighting", e);
  } finally {
    BUSY.delete(token.document);
  }
}

let chooser = null;
function closeChooser() {
  if (!chooser) return;
  chooser.remove();
  chooser = null;
  document.removeEventListener("pointerdown", dismissChooser, true);
}
function dismissChooser(event) {
  if (chooser && !chooser.contains(event.target)) closeChooser();
}
function showChooser(token, lights, button, root) {
  closeChooser();
  const menu = document.createElement("div");
  menu.className = "wod-light-chooser";
  menu.setAttribute("role", "menu");
  const current = token.document.getFlag(MOD, "activeId");
  for (const light of lights) {
    const option = document.createElement("button");
    option.type = "button";
    option.textContent = `${current === light.id ? "\u2713 " : ""}${light.name}`;
    option.addEventListener("pointerdown", event => {
      event.preventDefault();
      event.stopPropagation();
      closeChooser();
      void guardedSet(token, light.id, root);
    });
    menu.appendChild(option);
  }
  document.body.appendChild(menu);
  chooser = menu;
  const rect = button.getBoundingClientRect();
  menu.style.left = `${Math.max(8, Math.min(rect.left, window.innerWidth - menu.offsetWidth - 8))}px`;
  menu.style.top = `${Math.max(8, Math.min(rect.bottom + 4, window.innerHeight - menu.offsetHeight - 8))}px`;
  document.addEventListener("pointerdown", dismissChooser, true);
}

export function onTokenHudRender(hud, html) {
  const root = html instanceof HTMLElement ? html : html?.[0];
  const token = hud.object;
  if (!root || !token || !(game.user.isGM || token.document?.isOwner)) return;
  if (root.querySelector(".wod-light-hud-button")) return;
  const lights = carriedLights(token);
  const active = token.document.getFlag(MOD, "activeId");
  // Retain an off switch if the last carried light was removed while enabled.
  if (!lights.length && !active) return;

  const left = root.querySelector(".col.left")
    ?? root.querySelector("menu.col.left")
    ?? root.querySelector('[data-action="combat"]')?.parentElement;
  if (!left) return; // Avoid floating an unpositioned button over the map.
  const button = document.createElement("button");
  button.type = "button";
  button.className = `control-icon wod-light-hud-button${active ? " active" : ""}`;
  button.innerHTML = '<i class="fa-solid fa-lightbulb" aria-hidden="true"></i>';
  button.setAttribute("aria-label", "Toggle portable light (right click to choose)");
  button.dataset.tooltip = active ? `Light on: ${PRESET_BY_ID[active]?.name ?? "Portable light"}` : "Switch portable light on";
  button.addEventListener("pointerdown", event => {
    if (event.button !== 0 && event.button !== 2) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    if (event.button === 2) {
      if (lights.length) showChooser(token, lights, button, root);
      return;
    }
    const current = token.document.getFlag(MOD, "activeId");
    const remembered = token.document.getFlag(MOD, "selectedId");
    const selected = current ? null : (lights.find(p => p.id === remembered)?.id ?? lights[0]?.id ?? null);
    void guardedSet(token, selected, root);
  });
  button.addEventListener("contextmenu", event => { event.preventDefault(); event.stopPropagation(); });
  left.appendChild(button);
}

Hooks.once("init", () => {
  installHeldLightOffsets();
  game.settings.register(MOD, "presetsInstalled", {
    scope: "world", config: false, type: Boolean, default: false
  });
  game.settings.register(MOD, "catalogPromptedFor", {
    scope: "world", config: false, type: String, default: ""
  });
  game.settings.register(MOD, "lastPlaced", {
    scope: "client", config: false, type: String, default: ""
  });
});

Hooks.once("ready", async () => {
  game.wodLight = {
    installPresets, refreshPresetIcons, countMissingPresets, placePresetOnScene,
    findLights: showLightFinder, locateLight: locateWoDLight, presets: PRESETS
  };
  if (!game.user.isGM) return;
  const adapter = getSystemAdapter();
  if (!systemCanCreateItems(adapter)) {
    console.warn("AFT Lighting+ | preset Item installation is supported for worldofdarkness, pf2e, and dnd5e only; native scene-light utilities remain available");
    return;
  }
  try {
    const count = await refreshPresetIcons();
    if (count) ui.notifications.info(`AFT Lighting+: updated ${count} original preset icons. Customized images were preserved.`);
  } catch (error) { warn("could not refresh light icons", error); }
  if (game.settings.get(MOD, "presetsInstalled")) {
    try { await offerMissingPresetsOnUpgrade(); }
    catch (error) { warn("could not offer the new light presets", error); }
    return;
  }
  try {
    const confirmed = await foundry.applications.api.DialogV2.confirm({
      window: { title: "AFT Lighting+ — Install Presets" },
      content: `<p>Create the ${PRESETS.length} starter light Items in an <strong>AFT Lighting+</strong> folder?</p><p>This only adds missing Items and does not modify existing characters or Scenes.</p>`,
      yes: { label: "Create Light Items" },
      no: { label: "Not Now" },
      rejectClose: false
    });
    if (confirmed) await installPresets();
  } catch (e) { warn("could not initialize presets", e); }
});

Hooks.on("dropCanvasData", onCanvasDrop);
Hooks.on("renderTokenHUD", onTokenHudRender);

Hooks.on("getSceneControlButtons", registerLightFinderTool);
Hooks.on("canvasPan", refreshLightMarkers);
Hooks.on("canvasTearDown", closeLightOverlays);
Hooks.on("canvasReady", refreshLightMarkers);
Hooks.on("activateCanvasLayer", onCanvasLayerActivated);
Hooks.on("deactivateLightingLayer", onLightingLayerDeactivated);
Hooks.on("createAmbientLight", refreshLightMarkers);
Hooks.on("updateAmbientLight", refreshLightMarkers);
Hooks.on("deleteAmbientLight", refreshLightMarkers);
Hooks.on("hoverAmbientLight", onLightHover);
Hooks.on("controlAmbientLight", onLightControl);
// A fallback for builds in which Ambient Light hover Hooks are not emitted.
Hooks.once("ready", () => {
  document.addEventListener("pointermove", onCanvasPointerMove, { passive: true });
  document.addEventListener("pointerup", onCanvasPointerUp, { passive: true });
});
