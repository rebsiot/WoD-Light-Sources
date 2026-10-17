/* WoD Light — compact native-Lighting utility; all visuals are local GM-only UI.
   No Scene/Token changes, Tile markers, or multiplayer pings. */
import { PRESET_BY_ID } from "./presets.js";

const MOD = "wod-light";
const iconFor = presetId => `modules/${MOD}/assets/icons/${presetId}.svg`;
let finder = null;
let pulse = null;

function eligible() { return Boolean(game.user?.isGM && canvas?.scene); }
function allLights() {
  const collection = canvas?.scene?.lights;
  return collection?.contents ? Array.from(collection.contents) : collection ? Array.from(collection) : [];
}
export function listWoDLights() {
  if (!eligible()) return [];
  return allLights().filter(doc => PRESET_BY_ID[doc.getFlag(MOD, "presetId")]);
}

export function otherLevel(light) {
  // A v0.1.0 light without a Level is not necessarily on another floor.
  const ids = Array.from(light?.levels ?? []);
  const viewedId = canvas?.level?.id;
  return Boolean(viewedId && ids.length && !ids.includes(viewedId));
}

function levelLabel(light) {
  const ids = Array.from(light?.levels ?? []);
  if (!ids.length) return "Unassigned Level";
  return ids.map(id => canvas?.scene?.levels?.get?.(id)?.name ?? id).join(", ");
}

export async function locateWoDLight(documentId) {
  if (!eligible()) return false;
  const doc = listWoDLights().find(light => light.id === documentId);
  if (!doc) { ui.notifications.warn("WoD Light: that light no longer exists on this scene."); return false; }
  if (otherLevel(doc)) {
    ui.notifications.warn(`WoD Light: ${doc.name} is on ${levelLabel(doc)}. View that Level, then select it again.`);
    return false;
  }
  const sceneId = canvas.scene.id;
  closeLightFinder();
  try {
    await canvas.animatePan?.({ x: doc.x, y: doc.y, duration: 260 });
    if (canvas?.scene?.id !== sceneId) return false;
    const layer = canvas.lighting;
    layer?.activate?.({ tool: "select" });
    const obj = layer?.get?.(documentId);
    const selected = Boolean(obj?.control?.({ releaseOthers: true }));
    pulseLightPosition(doc.x, doc.y, doc.name);
    if (!selected) ui.notifications.info("WoD Light: centered on the fixture. If it isn't selectable, check the viewed Level or Lighting > Placeables.");
    return selected;
  } catch (error) {
    console.warn("WoD Light | could not locate scene light", error);
    ui.notifications.warn("WoD Light: open Lighting > Placeables to find this light.");
    return false;
  }
}

function positionOf(x, y) {
  const p = canvas?.clientCoordinatesFromCanvas?.({ x, y });
  return p && Number.isFinite(p.x) && Number.isFinite(p.y) ? p : null;
}

export function pulseLightPosition(x, y, name = "Light placed") {
  if (!eligible() || !Number.isFinite(x) || !Number.isFinite(y)) return false;
  pulse?.remove();
  const p = positionOf(x, y);
  if (!p || typeof document === "undefined") return false;
  const container = document.createElement("div");
  container.className = "wod-light-pulse";
  container.style.left = `${p.x}px`;
  container.style.top = `${p.y}px`;
  const ring = document.createElement("span");
  ring.className = "wod-light-pulse-ring";
  const caption = document.createElement("span");
  caption.className = "wod-light-pulse-label";
  caption.textContent = name;
  container.append(ring, caption);
  document.body.appendChild(container);
  pulse = container;
  setTimeout(() => { container.remove(); if (pulse === container) pulse = null; }, 2300);
  return true;
}

export function closeLightFinder() {
  finder?.root?.remove();
  finder?.pins?.remove();
  finder = null;
}

export function refreshLightMarkers() {
  if (!finder || !eligible() || finder.sceneId !== canvas?.scene?.id) {
    if (finder) closeLightFinder();
    return;
  }
  const ids = finder.visibleIds;
  for (const pin of finder.pinButtons) {
    const doc = listWoDLights().find(d => d.id === pin.dataset.lightId);
    if (!doc || otherLevel(doc) || !ids.has(doc.id)) {
      pin.hidden = true;
      continue;
    }
    const p = positionOf(doc.x, doc.y);
    pin.hidden = !p || Boolean(canvas.isOffscreen?.({x:doc.x,y:doc.y}));
    if (!pin.hidden) {
      pin.style.left = `${p.x}px`;
      pin.style.top = `${p.y}px`;
    }
  }
}

function repositionFinderRows() {
  if (!finder) return;
  const search = finder.input.value.trim().toLocaleLowerCase();
  const visible = finder.rows.filter(({ doc, element }) => {
    const yes = !search || `${doc.name} ${levelLabel(doc)}`.toLocaleLowerCase().includes(search);
    element.hidden = !yes;
    return yes;
  });
  finder.visibleIds = new Set(visible.map(r => r.doc.id));
  refreshLightMarkers();
}

function makeElement(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text != null) node.textContent = text;
  return node;
}

export function showLightFinder() {
  if (!eligible() || typeof document === "undefined") return false;
  if (finder) { closeLightFinder(); return false; } // Native tool is a toggle-open popover.
  const all = listWoDLights();
  const sceneId = canvas.scene.id;
  const root = makeElement("section", "wod-light-finder");
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-label", "Find WoD Lights");
  const header = makeElement("header", "wod-light-finder-header");
  header.append(makeElement("strong", "", `WoD Lights (${all.length})`));
  const close = makeElement("button", "wod-light-close", "×");
  close.type = "button";
  close.title = "Close light finder";
  close.addEventListener("click", closeLightFinder);
  header.appendChild(close);
  root.appendChild(header);
  const explanation = makeElement("p", "wod-light-finder-help", "Click a light to center, highlight and select it. Amber markers appear while this list is open.");
  root.appendChild(explanation);
  const input = makeElement("input", "wod-light-finder-search");
  input.type = "search";
  input.setAttribute("aria-label", "Filter light names");
  input.placeholder = "Filter lights…";
  root.appendChild(input);
  const list = makeElement("div", "wod-light-finder-list");
  root.appendChild(list);
  const pins = makeElement("div", "wod-light-map-pins");
  const rows = [];
  const pinButtons = [];
  const [savedScene, savedId] = (game.settings.get(MOD, "lastPlaced") ?? "").split(":");
  const lastId = savedScene === sceneId ? (savedId ?? "") : "";
  all.sort((a, b) => (a.id === lastId ? -1 : 0) - (b.id === lastId ? -1 : 0) || a.name.localeCompare(b.name));
  for (const [index, light] of all.entries()) {
    const presetId = light.getFlag(MOD, "presetId");
    const line = makeElement("button", "wod-light-finder-row");
    line.type = "button";
    line.title = otherLevel(light) ? `On ${levelLabel(light)} — switch Level to select` : "Center and select light";
    const img = makeElement("img", "wod-light-row-icon");
    img.src = iconFor(presetId);
    img.alt = "";
    const labels = makeElement("span", "wod-light-row-labels");
    const name = makeElement("span", "wod-light-row-name", light.name ?? PRESET_BY_ID[presetId]?.name);
    const meta = makeElement("small", "", `${levelLabel(light)}${light.id === lastId ? " · Last placed" : ""}${otherLevel(light) ? " · Other Level" : ""}`);
    labels.append(name, meta);
    line.append(img, labels);
    line.addEventListener("click", () => { void locateWoDLight(light.id); });
    list.appendChild(line);
    rows.push({ doc: light, element: line });
    const pin = makeElement("button", "wod-light-map-pin");
    pin.type = "button";
    pin.dataset.lightId = light.id;
    pin.title = `${light.name} — click to select`;
    pin.setAttribute("aria-label", `Find ${light.name}`);
    pin.textContent = String(index + 1);
    pin.addEventListener("click", () => { void locateWoDLight(light.id); });
    pins.appendChild(pin);
    pinButtons.push(pin);
  }
  if (!all.length) list.appendChild(makeElement("p", "wod-light-finder-empty", "No WoD Light fixtures on this scene yet."));
  document.body.append(root, pins);
  finder = { root, pins, input, rows, pinButtons, sceneId, visibleIds: new Set(all.map(l => l.id)) };
  input.addEventListener("input", repositionFinderRows);
  refreshLightMarkers();
  return true;
}

// Foundry v14: getSceneControlButtons receives a keyed SceneControl object,
// not the legacy v12/v13 array. This registers one button in native Lighting.
export function registerLightFinderTool(controls) {
  if (!game.user?.isGM) return;
  const lighting = controls?.lighting ?? Object.values(controls ?? {}).find(c => c?.name === "lighting");
  if (!lighting?.tools) return;
  const toolOrder = Math.max(0, ...Object.values(lighting.tools).map(t => Number(t.order) || 0)) + 1;
  lighting.tools.wodLightFind = {
    name: "wodLightFind", title: "Find WoD Lights", icon: "fa-solid fa-magnifying-glass-location",
    order: toolOrder, button: true, visible: true,
    onChange: () => showLightFinder()
  };
}
