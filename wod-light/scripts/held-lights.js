/* WoD Light: relocate only our active carried-light origin to a token's
   local three-o'clock edge, leaving native vision and untagged lights alone.
   V14 TokenDocument#getLightOrigin is the supported origin seam. Token's
   protected _getLightSourceData is adapted only for directional held lights. */
import { PRESET_BY_ID } from "./presets.js";

const MOD = "wod-light";
const PATCH = Symbol.for("wod-light.held-light-origin.v1");
const SIDE_FACTOR = 0.42; // Near a 1x1 human token's right edge, still inside token.
const OUTWARD_TURN = -90; // Core Token rotation 0 faces south; our 3 o'clock is east.

function activePortable(document) {
  const id = document?.getFlag?.(MOD, "activeId");
  const preset = PRESET_BY_ID[id];
  return preset?.portable ? preset : null;
}

/**
 * Pure geometry adapter, called only for a WoD Light active portable Item.
 * The caller supplies the native light origin; elevation/Level are retained.
 */
export function handheldOrigin(document, data = {}, nativeOrigin) {
  if (!activePortable(document) || !Number.isFinite(nativeOrigin?.x) || !Number.isFinite(nativeOrigin?.y)) {
    return nativeOrigin;
  }
  // TokenDocument.getSize accepts TokenDimensions and returns pixel dimensions.
  const dimensions = document.getSize?.(data) ?? {};
  const width = dimensions.width;
  const height = dimensions.height;
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return nativeOrigin;
  const degrees = Number.isFinite(data?.rotation) ? data.rotation : (Number(document.rotation) || 0);
  const radians = degrees * Math.PI / 180;
  const offset = Math.min(width, height) * SIDE_FACTOR;
  return {
    ...nativeOrigin,
    x: nativeOrigin.x + Math.cos(radians) * offset,
    y: nativeOrigin.y + Math.sin(radians) * offset
  };
}

/** Outward at 3 o'clock for cones; 360-degree lights need no orientation. */
export function outwardSourceData(tokenObject, nativeData) {
  const preset = activePortable(tokenObject?.document);
  if (!preset || !nativeData || preset.light.angle >= 360) return nativeData;
  // Native Token 0 rotation faces south, whereas the local 3 o'clock edge is
  // east. Modify ONLY the emitted source data, never TokenDocument.rotation.
  const base = Number.isFinite(nativeData.rotation) ? nativeData.rotation : (Number(tokenObject.document.rotation) || 0);
  return { ...nativeData, rotation: (base + OUTWARD_TURN + 360) % 360 };
}

/** Install once on this client; no new Documents or network messages. */
export function installHeldLightOffsets() {
  const documentClass = globalThis.foundry?.documents?.TokenDocument ?? globalThis.CONFIG?.Token?.documentClass;
  const placeableClass = globalThis.foundry?.canvas?.placeables?.Token ?? globalThis.CONFIG?.Token?.objectClass;
  const documentProto = documentClass?.prototype;
  const tokenProto = placeableClass?.prototype;
  let origin = false;
  let direction = false;

  if (typeof documentProto?.getLightOrigin === "function") {
    if (!documentProto[PATCH]) {
      const nativeGetLightOrigin = documentProto.getLightOrigin;
      documentProto.getLightOrigin = function (data = {}) {
        const original = nativeGetLightOrigin.call(this, data);
        return handheldOrigin(this, data, original);
      };
      Object.defineProperty(documentProto, PATCH, {value: true});
    }
    origin = true;
  }

  if (typeof tokenProto?._getLightSourceData === "function") {
    if (!tokenProto[PATCH]) {
      const nativeGetLightSourceData = tokenProto._getLightSourceData;
      tokenProto._getLightSourceData = function (...args) {
        const original = nativeGetLightSourceData.apply(this, args);
        return outwardSourceData(this, original);
      };
      Object.defineProperty(tokenProto, PATCH, {value: true});
    }
    direction = true;
  }

  if (!origin || !direction) console.warn("WoD Light | v14 held-light API differs; edge origin or cone orientation may not be available", {origin, direction});
  return {origin, direction};
}
