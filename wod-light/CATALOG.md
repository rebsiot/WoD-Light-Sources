# WoD Light — Preset Catalog (v0.1.7)

Gameplay-scaled defaults in **scene distance units**, assuming feet. **Bright** and **Dim** are radii, not diameters. The wattage in legacy names is descriptive, not a measured lumen conversion.

All fixtures can be dragged by the GM as native Ambient Lights. **Only Items in the Portable group** activate through the character Token HUD; the Worksite Flood is a stationary, repositionable scene light.

Legend: **New** = introduced in v0.1.7. Directional angles under 360° create cones. Walls and Foundry lighting settings may limit actual illumination.

## Indoor (21)

| Source | Bright | Dim | Spread | Added |
|---|---:|---:|---:|---|
| Desk Lamp - 40W (Warm) | 5 | 12 | 360° | Original |
| Desk Lamp - 40W (Daylight) | 5 | 12 | 360° | Original |
| Desk Lamp - 60W (Warm) | 8 | 16 | 360° | Original |
| Desk Lamp - 60W (Daylight) | 8 | 16 | 360° | Original |
| Ceiling Light - 4x60W (Warm) | 18 | 30 | 360° | Original |
| Ceiling Light - 4x60W (Daylight) | 18 | 30 | 360° | Original |
| Ceiling Light - 2x100W (Warm) | 20 | 35 | 360° | Original |
| Ceiling Light - 2x100W (Daylight) | 20 | 35 | 360° | Original |
| Office Fluorescent - Warm | 20 | 35 | 360° | Original |
| Office Fluorescent - Daylight | 20 | 35 | 360° | Original |
| Wall Sconce - Warm | 6 | 15 | 360° | New |
| Recessed Ceiling LED | 10 | 20 | 360° | New |
| Pendant / Bar Light | 10 | 24 | 360° | New |
| TV / Monitor Glow | 0 | 8 | 360° | New |
| Vending / Arcade Cabinet | 2 | 14 | 360° | New |
| Medical Examination Lamp | 8 | 18 | 120° | New |
| Display Case Spotlight | 9 | 22 | 75° | New |
| Subway Platform Strip | 22 | 38 | 360° | New |
| Parking Garage Fixture | 16 | 32 | 360° | New |
| Train / Bus Ceiling Strip | 14 | 28 | 360° | New |
| Warehouse High-Bay LED | 28 | 50 | 360° | New |

## Outdoor (10)

| Source | Bright | Dim | Spread | Added |
|---|---:|---:|---:|---|
| Streetlight - Sodium Orange | 15 | 32 | 360° | Original |
| Streetlight - White LED | 15 | 32 | 360° | Original |
| Security Floodlight | 30 | 55 | 120° | Original |
| Porch Light | 8 | 18 | 360° | Original |
| Vehicle Headlights | 35 | 65 | 55° | Original |
| Portable Worksite Flood | 25 | 45 | 130° | New |
| Bollard / Pathway Light | 5 | 14 | 360° | New |
| Illuminated Storefront Sign | 0 | 15 | 360° | New |
| Gas Station Canopy Light | 20 | 38 | 360° | New |
| Tower Searchlight | 45 | 85 | 35° | New |

## Effects (10)

| Source | Bright | Dim | Spread | Added |
|---|---:|---:|---:|---|
| Fireplace | 10 | 22 | 360° | Original |
| Neon Sign - Red | 2 | 12 | 360° | Original |
| Flickering Light Bulb | 8 | 18 | 360° | Original |
| Emergency Red Light | 5 | 15 | 360° | Original |
| Stage Spotlight | 25 | 55 | 40° | New |
| Dance Floor Strobe | 14 | 28 | 360° | New |
| Neon Sign - Blue | 2 | 12 | 360° | New |
| Emergency Blue Flash | 5 | 15 | 360° | New |
| Amber Hazard Beacon | 5 | 18 | 360° | New |
| Campfire / Fire Pit | 9 | 23 | 360° | New |

## Portable (10)

| Source | Bright | Dim | Spread | Added |
|---|---:|---:|---:|---|
| Flashlight | 12 | 35 | 55° | Original |
| Tactical Flashlight | 22 | 55 | 35° | Original |
| Headlamp | 8 | 24 | 100° | Original |
| Camping Lantern | 10 | 25 | 360° | Original |
| Candle | 2 | 8 | 360° | Original |
| Phone Light | 3 | 12 | 95° | Original |
| Glow Stick | 0 | 9 | 360° | Original |
| Hand Torch | 8 | 20 | 360° | Original |
| Handheld Searchlight | 35 | 75 | 30° | New |
| Emergency Road Flare | 2 | 15 | 360° | New |

## Upgrade behavior

On the first GM login after updating an existing library, WoD Light offers to add only missing presets (typically 24). Accepting creates new world Items and their supplied SVG icons. Declining does not nag again on every reload; a GM may run `game.wodLight.installPresets()` later. Existing Item IDs, artwork, values, and Actor copies are preserved. No Scene lights are created until the GM drags a preset onto a scene.
