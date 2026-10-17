/* System-aware inventory documents. The lighting engine and preset flags remain
   ordinary Foundry data; only the Item type/schema varies by game system. */

const ADAPTERS = Object.freeze({
  worldofdarkness: Object.freeze({ id: "worldofdarkness", name: "World of Darkness 20th", itemType: "Item" }),
  pf2e: Object.freeze({ id: "pf2e", name: "Pathfinder Second Edition", itemType: "equipment" }),
  dnd5e: Object.freeze({ id: "dnd5e", name: "Dungeons & Dragons Fifth Edition", itemType: "loot" })
});

export const SUPPORTED_SYSTEMS = Object.freeze(Object.keys(ADAPTERS));

export function getSystemAdapter(systemId = globalThis.game?.system?.id) {
  return ADAPTERS[systemId] ?? null;
}

// Never create an unknown Item subtype in an unfamiliar game system.
export function systemCanCreateItems(adapter, itemDataModels = globalThis.CONFIG?.Item?.dataModels) {
  if (!adapter) return false;
  if (itemDataModels && Object.keys(itemDataModels).length) {
    return Object.hasOwn(itemDataModels, adapter.itemType);
  }
  // CONFIG's Item type registry may not be populated during mock tests. Foundry
  // validates on createDocuments too; the caller catches and reports failures.
  return true;
}

export function presetDescription(preset) {
  const intro = preset.portable
    ? "Portable light: give this Item to a character, then use the Token HUD lightbulb to switch it on or off."
    : "GM scene light template: drag this world Item onto a Scene to create a native Ambient Light.";
  return `<p>${intro}</p><p>Bright: ${preset.light.bright}; Dim: ${preset.light.dim} scene units; Cone: ${preset.light.angle}&deg;. Lighting distances are gameplay approximations.</p>`;
}

export function presetItemData(preset, folderId, adapter, iconPath) {
  if (!adapter || !systemCanCreateItems(adapter)) throw new Error(`No supported Item type for system ${adapter?.id ?? "unknown"}`);
  const description = presetDescription(preset);
  let system;
  switch (adapter.id) {
    case "worldofdarkness":
      system = { description };
      break;
    case "pf2e":
      // Ordinary native equipment. Deliberately no TokenLight rule element:
      // light is controlled by our Token HUD, not a competing PF2e automation.
      system = {
        description: { value: description },
        quantity: 1,
        bulk: { value: 0 },
        usage: { value: preset.portable ? "held-in-one-hand" : "other" },
        equipped: { carryType: "worn", handsHeld: 0 },
        rules: []
      };
      break;
    case "dnd5e":
      // Native mundane carried gear, not armor/equipped equipment or magic.
      // Both the 2014 and 2024 rule choices use the dnd5e system ID.
      system = { description: { value: description }, quantity: 1 };
      break;
    default:
      throw new Error(`Unsupported game system: ${adapter.id}`);
  }
  return {
    name: preset.name, type: adapter.itemType, folder: folderId,
    img: iconPath,
    system,
    flags: { "wod-light": { presetId: preset.id } }
  };
}

export function itemIsAvailable(item) {
  // Actor-owned Items remain normal Items. The shared presetId flag survives
  // WoD20, PF2e, and D&D5e inventory copies. Quantity zero is not usable.
  const qty = Number(item?.system?.quantity);
  return !Number.isFinite(qty) || qty > 0;
}

function hasTokenLightRule(rules) {
  return Array.isArray(rules) && rules.some(rule => rule?.key === "TokenLight" || rule?.constructor?.name === "TokenLightRuleElement");
}

export function conflictsWithPf2eTokenLight(actor, systemId = globalThis.game?.system?.id) {
  if (systemId !== "pf2e" || !actor) return false;
  if (hasTokenLightRule(actor.rules)) return true;
  // Prepared rules may be unavailable on some clients. Check active effect or
  // explicitly held/worn gear instead of all inventory (including stowed items).
  return Array.from(actor.items ?? []).some(item => {
    const type = item?.type;
    const carry = item?.system?.equipped?.carryType;
    const active = type === "effect" || type === "condition" || carry === "held" || carry === "worn";
    return active && hasTokenLightRule(item?.system?.rules);
  });
}
