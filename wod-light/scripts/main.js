import { PRESETS, PRESET_BY_ID, GROUPS } from "./presets.js";

const MOD = "wod-light";
const ROOT_NAME = "WoD Light";
const ICONS = {
  Indoor: "icons/svg/light.svg",
  Outdoor: "icons/svg/light.svg",
  Portable: "icons/svg/torch.svg",
  Effects: "icons/svg/light.svg"
};

function warn(message, error) {
  console.error(`WoD Light | ${message}`, error);
  ui.notifications.error(`WoD Light: ${message}`);
}

// A compact, opt-in library install: no changes to existing Items or other world folders.
export async function installPresets() {
  if (!game.user.isGM) return 0;
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
  const missing = PRESETS.filter(p => !installed.has(p.id)).map(p => ({
    name: p.name,
    type: "Item", // The native generic equipment Item type in WoD20 7.3.x.
    folder: groups.get(p.group).id,
    img: ICONS[p.group],
    system: {
      description: `<p>${p.portable ? "Portable light: give this Item to a character to enable its Token HUD light control." : "GM light preset: drag this Item onto a scene to create a normal Foundry Ambient Light."}</p><p>Bright: ${p.light.bright}; Dim: ${p.light.dim} scene units; Cone: ${p.light.angle}&deg;.</p>`
    },
    flags: { [MOD]: { presetId: p.id } }
  }));
  if (missing.length) await Item.createDocuments(missing);
  await game.settings.set(MOD, "presetsInstalled", true);
  ui.notifications.info(`WoD Light: ${missing.length ? `created ${missing.length} light preset Items` : "light presets already installed"}.`);
  return missing.length;
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

// Prefer native Lighting and Placeables tools to a second WoD Light manager.
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
  catch (error) { console.warn("WoD Light | created light but could not select it", error); }
  if (!shownPlacementHint) {
    shownPlacementHint = true;
    ui.notifications.info(focused
      ? "WoD Light: new light selected. Drag to move or press Delete; Lighting > Placeables lists existing lights."
      : "WoD Light: light placed. Use Lighting > Placeables to find and edit it.");
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
    if (!p?.portable || seen.has(p.id)) return [];
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
  game.settings.register(MOD, "presetsInstalled", {
    scope: "world", config: false, type: Boolean, default: false
  });
});

Hooks.once("ready", async () => {
  game.wodLight = { installPresets, placePresetOnScene, presets: PRESETS };
  if (!game.user.isGM || game.settings.get(MOD, "presetsInstalled")) return;
  try {
    const confirmed = await foundry.applications.api.DialogV2.confirm({
      window: { title: "WoD Light — Install Presets" },
      content: `<p>Create the ${PRESETS.length} starter light Items in an <strong>WoD Light</strong> folder?</p><p>This only adds missing Items and does not modify existing characters or Scenes.</p>`,
      yes: { label: "Create Light Items" },
      no: { label: "Not Now" },
      rejectClose: false
    });
    if (confirmed) await installPresets();
  } catch (e) { warn("could not initialize presets", e); }
});

Hooks.on("dropCanvasData", onCanvasDrop);
Hooks.on("renderTokenHUD", onTokenHudRender);
