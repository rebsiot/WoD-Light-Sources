/* WoD Light — compact native-Lighting utility; all visuals are local GM-only UI.
   No Scene/Token changes, Tile markers, or multiplayer pings. */
import { PRESET_BY_ID } from "./presets.js";

const MOD = "wod-light";
const iconFor = presetId => `modules/${MOD}/assets/icons/${presetId}.svg`;
let finder = null;
const activePulses = new Set();
let hoverLightId = null;
let selectedLightId = null;
let activeLabel = null;
let scheduledSelectPulse = false;
// While the GM is in the Lighting controls, one CSS-animated locator per
// visible WoD Light persists without JS intervals, world documents, or Tiles.
const continuousLocators = new Map();
let continuousSceneId = null;
let lightingControlEngaged = null;
let locatorGeneration = 0;

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

// Labels are informational DOM overlays, not clickable Tiles or light placeables.
// Keep only one on screen. Native Lighting controls remain unobstructed.
function lightingControlActive() {
  if (!eligible() || lightingControlEngaged === false) return false;
  if (canvas?.lighting?.active === false) return false;
  const activeControl = ui?.controls?.control?.name;
  if (activeControl && activeControl !== "lighting") return false;
  // In v14 the control callback can run before the UI/Layer state settles.
  return lightingControlEngaged === true || activeControl === "lighting" || canvas?.lighting?.active === true;
}

function lightingSelectActive() {
  if (!lightingControlActive()) return false;
  const tool = ui?.controls?.tool?.name;
  return !tool || tool === "select";
}

function eligibleLightById(id) {
  if (!id) return null;
  const doc = listWoDLights().find(light => light.id === id);
  if (!doc || otherLevel(doc) || canvas.isOffscreen?.({ x: doc.x, y: doc.y })) return null;
  return doc;
}

function selectedLight() {
  const controlled = canvas?.lighting?.controlled;
  const selected = (Array.isArray(controlled) ? controlled : Array.from(controlled ?? []))
    .find(obj => eligibleLightById(obj?.document?.id ?? obj?.id));
  return eligibleLightById(selected?.document?.id ?? selected?.id) ?? eligibleLightById(selectedLightId);
}

export function refreshLightLabel() {
  const doc = lightingSelectActive() ? (eligibleLightById(hoverLightId) ?? selectedLight()) : null;
  if (!doc || typeof document === "undefined") {
    activeLabel?.remove();
    activeLabel = null;
    return false;
  }
  const p = positionOf(doc.x, doc.y);
  if (!p) { activeLabel?.remove(); activeLabel = null; return false; }
  if (!activeLabel) {
    activeLabel = document.createElement("div");
    activeLabel.className = "wod-light-live-label";
    activeLabel.setAttribute("role", "status");
    activeLabel.append(document.createElement("strong"), document.createElement("small"));
    document.body.appendChild(activeLabel);
  }
  activeLabel.children[0].textContent = doc.name || PRESET_BY_ID[doc.getFlag(MOD, "presetId")]?.name || "Light";
  activeLabel.children[1].textContent = doc.id === hoverLightId ? "Light source" : "Selected — drag to move · Delete to remove";
  activeLabel.style.left = `${p.x}px`;
  activeLabel.style.top = `${p.y - 36}px`;
  return true;
}

export function onLightHover(placeable, hovering) {
  const id = placeable?.document?.id ?? placeable?.id;
  if (!id) return;
  if (hovering) hoverLightId = id;
  else if (hoverLightId === id) hoverLightId = null;
  refreshLightLabel();
}

export function onLightControl(placeable, controlled) {
  const id = placeable?.document?.id ?? placeable?.id;
  if (!id) return;
  if (controlled) selectedLightId = id;
  else if (selectedLightId === id) selectedLightId = null;
  refreshLightLabel();
}

// DOM hover fallback in case the native placeable hover Hook is not emitted by
// a particular Foundry v14 build. Ignore sidebar and other non-canvas UI.
export function onCanvasPointerUp() {
  // Native clicks control/release a light. Catch the result even if the v14
  // controlAmbientLight Hook is not emitted by this Foundry build.
  if (typeof requestAnimationFrame === "function") requestAnimationFrame(() => refreshLightLabel());
  else queueMicrotask(() => refreshLightLabel());
}

export function onCanvasPointerMove(event) {
  if (!lightingSelectActive()) { hoverLightId = null; refreshLightLabel(); return; }
  const board = event?.target?.closest?.("#board") ||
    event?.target === canvas?.app?.view || event?.target === canvas?.app?.canvas;
  if (!board || !Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) {
    if (hoverLightId) { hoverLightId = null; refreshLightLabel(); }
    return;
  }
  let nearest = null;
  let bestSquared = 30 * 30;
  for (const doc of listWoDLights()) {
    if (otherLevel(doc) || canvas.isOffscreen?.({ x: doc.x, y: doc.y })) continue;
    const p = positionOf(doc.x, doc.y);
    if (!p) continue;
    const squared = (p.x - event.clientX) ** 2 + (p.y - event.clientY) ** 2;
    if (squared < bestSquared) { bestSquared = squared; nearest = doc.id; }
  }
  if (nearest !== hoverLightId) { hoverLightId = nearest; refreshLightLabel(); }
}

function clearContinuousLocators() {
  for (const marker of continuousLocators.values()) marker.remove();
  continuousLocators.clear();
  continuousSceneId = null;
}

/**
 * Reconcile unobtrusive, infinite CSS pulses with the current view. No periodic
 * polling: canvasPan, create/update/delete AmbientLight, Level/view changes,
 * and Lighting activation drive this function. All elements ignore pointers.
 */
export function refreshContinuousLocators() {
  if (!lightingControlActive() || typeof document === "undefined") {
    clearContinuousLocators();
    return 0;
  }
  if (continuousSceneId !== canvas.scene.id) {
    clearContinuousLocators();
    continuousSceneId = canvas.scene.id;
  }
  const visible = new Set();
  for (const doc of listWoDLights()) {
    if (otherLevel(doc) || canvas.isOffscreen?.({ x: doc.x, y: doc.y })) continue;
    const p = positionOf(doc.x, doc.y);
    if (!p) continue;
    visible.add(doc.id);
    let marker = continuousLocators.get(doc.id);
    if (!marker) {
      marker = document.createElement("div");
      marker.className = "wod-light-continuous-locator";
      marker.dataset.lightId = doc.id;
      marker.dataset.sceneId = canvas.scene.id;
      const ring = document.createElement("span");
      ring.className = "wod-light-continuous-ring";
      marker.appendChild(ring);
      marker.setAttribute("aria-hidden", "true");
      document.body.appendChild(marker);
      continuousLocators.set(doc.id, marker);
    }
    marker.style.left = `${p.x}px`;
    marker.style.top = `${p.y}px`;
  }
  for (const [id, marker] of continuousLocators) {
    if (!visible.has(id)) { marker.remove(); continuousLocators.delete(id); }
  }
  return continuousLocators.size;
}

export function refreshLightOverlays() {
  for (const node of activePulses) {
    const x = Number(node.dataset.worldX), y = Number(node.dataset.worldY);
    const p = positionOf(x, y);
    if (p) { node.style.left = `${p.x}px`; node.style.top = `${p.y}px`; }
  }
  refreshContinuousLocators();
  return refreshLightLabel();
}

export function closeLightOverlays() {
  // Invalidate any next-frame activation callback from the previous scene.
  locatorGeneration++;
  clearContinuousLocators();
  for (const node of activePulses) node.remove();
  activePulses.clear();
  closeLightFinder();
  activeLabel?.remove();
  activeLabel = null;
  hoverLightId = selectedLightId = null;
  scheduledSelectPulse = false;
  lightingControlEngaged = null;
}

export function pulseLightPosition(x, y, name = "Light placed", options = {}) {
  if (!eligible() || !Number.isFinite(x) || !Number.isFinite(y)) return false;
  const p = positionOf(x, y);
  if (!p || typeof document === "undefined") return false;
  const container = document.createElement("div");
  container.className = "wod-light-pulse";
  container.style.left = `${p.x}px`;
  container.style.top = `${p.y}px`;
  const ring = document.createElement("span");
  ring.className = "wod-light-pulse-ring";
  container.appendChild(ring);
  if (options.label !== false) {
    const caption = document.createElement("span");
    caption.className = "wod-light-pulse-label";
    caption.textContent = name;
    container.appendChild(caption);
  }
  container.dataset.worldX = String(x);
  container.dataset.worldY = String(y);
  document.body.appendChild(container);
  activePulses.add(container);
  setTimeout(() => { activePulses.delete(container); container.remove(); }, options.duration ?? 3400);
  return true;
}

export function pulseWoDLightsOnViewedLevel() {
  if (!eligible()) return 0;
  const visible = listWoDLights().filter(doc => !otherLevel(doc) && !canvas.isOffscreen?.({ x: doc.x, y: doc.y }));
  for (const doc of visible) pulseLightPosition(doc.x, doc.y, doc.name ?? "Light", { label: false, duration: 3200 });
  if (!visible.length) ui.notifications.info("WoD Light: no fixtures visible on this part of the scene.");
  return visible.length;
}

function scheduleSelectPulse() {
  if (scheduledSelectPulse || !game.user?.isGM) return;
  scheduledSelectPulse = true;
  const generation = locatorGeneration;
  const run = () => {
    if (generation !== locatorGeneration) return;
    scheduledSelectPulse = false;
    refreshContinuousLocators();
    refreshLightLabel();
  };
  // Core can change the active layer after invoking the controls callback.
  if (typeof requestAnimationFrame === "function") requestAnimationFrame(run);
  else queueMicrotask(run);
}

function deactivateLightingLocators() {
  lightingControlEngaged = false;
  locatorGeneration++;
  scheduledSelectPulse = false;
  clearContinuousLocators();
  for (const node of activePulses) node.remove();
  activePulses.clear();
  closeLightFinder();
  activeLabel?.remove();
  activeLabel = null;
  hoverLightId = selectedLightId = null;
}


// Native InteractionLayer lifecycle hooks catch control changes made by
// keyboard shortcuts or other modules, not just SceneControls button clicks.
export function onCanvasLayerActivated(layer) {
  if (!game.user?.isGM) return;
  if (layer === canvas?.lighting) {
    lightingControlEngaged = true;
    scheduleSelectPulse();
  } else deactivateLightingLocators();
}

export function onLightingLayerDeactivated() {
  deactivateLightingLocators();
}

export function closeLightFinder() {
  finder?.root?.remove();
  finder?.pins?.remove();
  finder = null;
}

export function refreshLightMarkers() {
  refreshLightOverlays();
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

  // v14 activates the Lighting control separately from its Select tool.
  // Both activation paths reconcile one persistent locator per light; leaving
  // Lighting tears all of them down immediately, even before the UI updates.
  if (!lighting._wodLightWrapped) {
    const originalOnChange = lighting.onChange;
    lighting.onChange = (...args) => {
      const result = typeof originalOnChange === "function" ? originalOnChange(...args) : undefined;
      if (args[1] === true) {
        lightingControlEngaged = true;
        scheduleSelectPulse();
      } else if (args[1] === false) deactivateLightingLocators();
      return result;
    };
    const originalToolChange = lighting.onToolChange;
    lighting.onToolChange = (...args) => {
      const result = typeof originalToolChange === "function" ? originalToolChange(...args) : undefined;
      if (args[2] === true) scheduleSelectPulse();
      return result;
    };
    lighting._wodLightWrapped = true;
  }
  const selectTool = lighting.tools.select;
  if (selectTool && !selectTool._wodLightWrapped) {
    const originalOnChange = selectTool.onChange;
    selectTool.onChange = (...args) => {
      const result = typeof originalOnChange === "function" ? originalOnChange(...args) : undefined;
      if (args[1] === true) scheduleSelectPulse();
      return result;
    };
    selectTool._wodLightWrapped = true;
  }

  const toolOrder = Math.max(0, ...Object.values(lighting.tools).map(t => Number(t.order) || 0)) + 1;
  lighting.tools.wodLightFind = {
    name: "wodLightFind", title: "Find WoD Lights", icon: "fa-solid fa-magnifying-glass-location",
    order: toolOrder, button: true, visible: true,
    onChange: () => showLightFinder()
  };
}
