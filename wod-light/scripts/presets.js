/* WoD Light — gameplay-scaled lighting presets, measured in Scene distance units.
   Wattages are labels for familiar fixtures, not photometric simulations. */

const WARM = "#ffd39b";
const DAY = "#eef4ff";

function preset(id, name, group, bright, dim, options = {}) {
  const { color = WARM, angle = 360, alpha = 0.32, animation = null, portable = false } = options;
  return {
    id, name, group, portable,
    light: {
      bright, dim, angle, color, alpha,
      attenuation: 0.45, luminosity: 0.5, coloration: 1,
      saturation: 0, contrast: 0, shadows: 0,
      negative: false, priority: 0,
      animation: animation ?? { type: null, speed: 5, intensity: 5, reverse: false },
      darkness: { min: 0, max: 1 }
    }
  };
}

export const PRESETS = Object.freeze([
  preset("desk-40-warm", "Desk Lamp - 40W (Warm)", "Indoor", 5, 12),
  preset("desk-40-day", "Desk Lamp - 40W (Daylight)", "Indoor", 5, 12, { color: DAY }),
  preset("desk-60-warm", "Desk Lamp - 60W (Warm)", "Indoor", 8, 16),
  preset("desk-60-day", "Desk Lamp - 60W (Daylight)", "Indoor", 8, 16, { color: DAY }),
  preset("ceiling-4x60-warm", "Ceiling Light - 4x60W (Warm)", "Indoor", 18, 30),
  preset("ceiling-4x60-day", "Ceiling Light - 4x60W (Daylight)", "Indoor", 18, 30, { color: DAY }),
  preset("ceiling-2x100-warm", "Ceiling Light - 2x100W (Warm)", "Indoor", 20, 35),
  preset("ceiling-2x100-day", "Ceiling Light - 2x100W (Daylight)", "Indoor", 20, 35, { color: DAY }),
  preset("office-warm", "Office Fluorescent - Warm", "Indoor", 20, 35),
  preset("office-day", "Office Fluorescent - Daylight", "Indoor", 20, 35, { color: DAY }),
  preset("street-sodium", "Streetlight - Sodium Orange", "Outdoor", 15, 32, { color: "#ffae55", alpha: 0.48 }),
  preset("street-led", "Streetlight - White LED", "Outdoor", 15, 32, { color: DAY }),
  preset("floodlight", "Security Floodlight", "Outdoor", 30, 55, { color: DAY, angle: 120 }),
  preset("porch", "Porch Light", "Outdoor", 8, 18),
  preset("headlights", "Vehicle Headlights", "Outdoor", 35, 65, { color: DAY, angle: 55 }),
  preset("flashlight", "Flashlight", "Portable", 12, 35, { color: DAY, angle: 55, portable: true }),
  preset("tactical-flashlight", "Tactical Flashlight", "Portable", 22, 55, { color: DAY, angle: 35, portable: true }),
  preset("headlamp", "Headlamp", "Portable", 8, 24, { color: DAY, angle: 100, portable: true }),
  preset("lantern", "Camping Lantern", "Portable", 10, 25, { portable: true }),
  preset("candle", "Candle", "Portable", 2, 8, { alpha: 0.45, portable: true, animation: { type: "torch", speed: 2, intensity: 2, reverse: false } }),
  preset("phone", "Phone Light", "Portable", 3, 12, { color: DAY, angle: 95, portable: true }),
  preset("glowstick", "Glow Stick", "Portable", 0, 9, { color: "#9bffb0", alpha: 0.55, portable: true }),
  preset("torch", "Hand Torch", "Portable", 8, 20, { portable: true, animation: { type: "torch", speed: 4, intensity: 4, reverse: false } }),
  preset("fireplace", "Fireplace", "Effects", 10, 22, { color: "#ffb26a", alpha: 0.55, animation: { type: "torch", speed: 3, intensity: 3, reverse: false } }),
  preset("neon", "Neon Sign - Red", "Effects", 2, 12, { color: "#ff5555", alpha: 0.6 }),
  preset("faulty-bulb", "Flickering Light Bulb", "Effects", 8, 18, { color: DAY, animation: { type: "pulse", speed: 6, intensity: 7, reverse: false } }),
  preset("emergency", "Emergency Red Light", "Effects", 5, 15, { color: "#ff5555", alpha: 0.5, animation: { type: "pulse", speed: 3, intensity: 6, reverse: false } }),
  // v0.1.7: practical fixtures for residential, commercial, transit, industrial,
  // outdoor, nightlife and emergency scenes. Values are game-scaled feet.
  preset("wall-sconce", "Wall Sconce - Warm", "Indoor", 6, 15),
  preset("recessed-led", "Recessed Ceiling LED", "Indoor", 10, 20, { color: DAY }),
  preset("pendant-bar", "Pendant / Bar Light", "Indoor", 10, 24),
  preset("tv-glow", "TV / Monitor Glow", "Indoor", 0, 8, { color: "#99c9ff", alpha: 0.55 }),
  preset("vending-arcade", "Vending / Arcade Cabinet", "Indoor", 2, 14, { color: "#86e8f9", alpha: 0.58 }),
  preset("medical-lamp", "Medical Examination Lamp", "Indoor", 8, 18, { color: DAY, angle: 120 }),
  preset("display-spot", "Display Case Spotlight", "Indoor", 9, 22, { color: DAY, angle: 75 }),
  preset("subway-strip", "Subway Platform Strip", "Indoor", 22, 38, { color: DAY }),
  preset("garage-fixture", "Parking Garage Fixture", "Indoor", 16, 32, { color: DAY }),
  preset("train-bus-strip", "Train / Bus Ceiling Strip", "Indoor", 14, 28, { color: DAY }),
  preset("warehouse-highbay", "Warehouse High-Bay LED", "Indoor", 28, 50, { color: DAY }),
  preset("worksite-flood", "Portable Worksite Flood", "Outdoor", 25, 45, { color: DAY, angle: 130 }),
  preset("bollard-path", "Bollard / Pathway Light", "Outdoor", 5, 14),
  preset("storefront-sign", "Illuminated Storefront Sign", "Outdoor", 0, 15, { color: "#aee6ff", alpha: 0.55 }),
  preset("gas-canopy", "Gas Station Canopy Light", "Outdoor", 20, 38, { color: DAY }),
  preset("tower-search", "Tower Searchlight", "Outdoor", 45, 85, { color: DAY, angle: 35 }),
  preset("stage-spot", "Stage Spotlight", "Effects", 25, 55, { color: "#ffe2b6", angle: 40 }),
  preset("dance-strobe", "Dance Floor Strobe", "Effects", 14, 28, { color: "#e4acff", alpha: 0.53, animation: { type: "pulse", speed: 8, intensity: 8, reverse: false } }),
  preset("neon-blue", "Neon Sign - Blue", "Effects", 2, 12, { color: "#538fff", alpha: 0.6 }),
  preset("emergency-blue", "Emergency Blue Flash", "Effects", 5, 15, { color: "#527fff", alpha: 0.58, animation: { type: "pulse", speed: 4, intensity: 7, reverse: false } }),
  preset("hazard-amber", "Amber Hazard Beacon", "Effects", 5, 18, { color: "#ffb447", alpha: 0.53, animation: { type: "pulse", speed: 4, intensity: 6, reverse: false } }),
  preset("campfire", "Campfire / Fire Pit", "Effects", 9, 23, { color: "#ffb26a", alpha: 0.55, animation: { type: "torch", speed: 4, intensity: 5, reverse: false } }),
  preset("hand-searchlight", "Handheld Searchlight", "Portable", 35, 75, { color: DAY, angle: 30, portable: true }),
  preset("road-flare", "Emergency Road Flare", "Portable", 2, 15, { color: "#ff5252", alpha: 0.62, portable: true, animation: { type: "torch", speed: 4, intensity: 4, reverse: false } })
]);

export const PRESET_BY_ID = Object.freeze(Object.fromEntries(PRESETS.map(p => [p.id, p])));
export const GROUPS = Object.freeze(["Indoor", "Outdoor", "Portable", "Effects"]);
