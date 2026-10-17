"""WoD Light pictograms — original large-form silhouettes designed for 24px item rows.
No external assets or fonts; 27 per-preset SVGs, each with distinct intended light color.
"""
from pathlib import Path
from xml.etree import ElementTree as ET
import re

OUT = Path(__file__).parent / 'wod-light/assets/icons'
OUT.mkdir(parents=True, exist_ok=True)
WHITE = '#EDF5FB'
DARK = '#17283A'

# Each silhouette stays inside a generous 16-80 safe box. Large shape, no micro-detail.
# Fill is used more than thin outlines, to remain readable at 24x24 px.
def silhouette(kind, accent):
    w=WHITE
    if kind == 'desk':
        return f'''<path d="M40 23h28l10 22H31z" fill="{w}"/><path d="M51 45 37 66" stroke="{w}" stroke-width="7" stroke-linecap="round"/><path d="M35 65h29v8H28v-3q0-5 7-5" fill="{w}"/><path d="M39 47 23 60" stroke="{accent}" stroke-width="5" stroke-linecap="round" opacity=".9"/>'''
    if kind == 'ceiling4':
        return f'''<rect x="20" y="23" width="56" height="50" rx="9" fill="{w}"/><rect x="28" y="31" width="7" height="34" rx="3" fill="{accent}"/><rect x="39" y="31" width="7" height="34" rx="3" fill="{accent}"/><rect x="50" y="31" width="7" height="34" rx="3" fill="{accent}"/><rect x="61" y="31" width="7" height="34" rx="3" fill="{accent}"/>'''
    if kind == 'ceiling2':
        return f'''<rect x="18" y="23" width="60" height="50" rx="9" fill="{w}"/><rect x="27" y="32" width="42" height="11" rx="4" fill="{accent}"/><rect x="27" y="53" width="42" height="11" rx="4" fill="{accent}"/>'''
    if kind == 'office':
        return f'''<rect x="17" y="24" width="62" height="48" rx="7" fill="{w}"/><rect x="24" y="32" width="48" height="7" rx="2" fill="{accent}"/><rect x="24" y="44" width="48" height="7" rx="2" fill="{accent}"/><rect x="24" y="56" width="48" height="7" rx="2" fill="{accent}"/>'''
    if kind == 'street':
        return f'''<path d="M38 77V29q0-10 12-10h13" fill="none" stroke="{w}" stroke-width="7" stroke-linecap="round"/><path d="M59 25h18l-5 13H55z" fill="{w}"/><path d="M62 43 57 52M70 43l4 9" stroke="{accent}" stroke-width="4" stroke-linecap="round"/><rect x="25" y="77" width="28" height="6" rx="3" fill="{w}"/>'''
    if kind == 'flood':
        return f'''<path d="M27 27h40l10 24H18z" fill="{w}"/><rect x="29" y="34" width="38" height="11" rx="3" fill="{accent}"/><path d="M49 52v24M32 76h34" stroke="{w}" stroke-width="7" stroke-linecap="round"/><path d="M24 56 17 65M72 56l7 9" stroke="{accent}" stroke-width="4" stroke-linecap="round"/>'''
    if kind == 'porch':
        return f'''<path d="M18 34 48 19 78 34" fill="none" stroke="{w}" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"/><path d="M25 40v35h46V40" fill="none" stroke="{w}" stroke-width="7"/><rect x="39" y="46" width="18" height="22" rx="5" fill="{accent}"/><rect x="44" y="40" width="8" height="9" rx="3" fill="{w}"/>'''
    if kind == 'headlights':
        return f'''<path d="M19 55 26 37q3-6 10-6h24q8 0 11 7l7 17v18H18V55z" fill="{w}"/><path d="M34 37h28l5 14H28z" fill="{DARK}"/><rect x="23" y="57" width="18" height="10" rx="4" fill="{accent}"/><rect x="55" y="57" width="18" height="10" rx="4" fill="{accent}"/><path d="M28 76v5M67 76v5" stroke="{w}" stroke-width="7" stroke-linecap="round"/>'''
    if kind == 'flashlight':
        return f'''<path d="M58 30 84 17v62L58 66z" fill="{accent}" opacity=".65"/><rect x="17" y="38" width="43" height="21" rx="7" fill="{w}"/><rect x="52" y="35" width="11" height="27" rx="4" fill="{w}"/><rect x="24" y="43" width="17" height="5" rx="2.5" fill="{DARK}"/><path d="M49 35v27" stroke="{DARK}" stroke-width="4"/>'''
    if kind == 'tactical':
        return f'''<path d="M62 32 83 24v48L62 64z" fill="{accent}" opacity=".7"/><path d="M17 38h48v26H17z" fill="{w}"/><rect x="22" y="33" width="34" height="8" rx="2" fill="{w}"/><rect x="22" y="61" width="34" height="8" rx="2" fill="{w}"/><path d="M29 43v16M38 43v16M47 43v16" stroke="{DARK}" stroke-width="4"/><rect x="58" y="34" width="10" height="34" rx="3" fill="{w}"/>'''
    if kind == 'headlamp':
        return f'''<path d="M17 47q0-24 31-24t31 24v15" fill="none" stroke="{w}" stroke-width="8" stroke-linecap="round"/><path d="M20 56q24 18 55 0" fill="none" stroke="{w}" stroke-width="7" stroke-linecap="round"/><rect x="34" y="35" width="29" height="29" rx="9" fill="{w}"/><circle cx="48.5" cy="49.5" r="9" fill="{accent}"/>'''
    if kind == 'lantern':
        return f'''<path d="M34 29q0-14 14-14t14 14" fill="none" stroke="{w}" stroke-width="7"/><rect x="29" y="32" width="38" height="45" rx="9" fill="{w}"/><rect x="36" y="40" width="24" height="27" rx="5" fill="{accent}"/><rect x="25" y="75" width="46" height="8" rx="4" fill="{w}"/><path d="M25 33h46" stroke="{w}" stroke-width="8" stroke-linecap="round"/>'''
    if kind == 'candle':
        return f'''<path d="M48 17q15 14 0 28-14-8 0-28" fill="{accent}"/><rect x="37" y="47" width="22" height="29" rx="4" fill="{w}"/><rect x="24" y="76" width="48" height="7" rx="3.5" fill="{w}"/><path d="M48 44v7" stroke="{DARK}" stroke-width="3" stroke-linecap="round"/>'''
    if kind == 'phone':
        return f'''<rect x="31" y="16" width="34" height="65" rx="8" fill="{w}"/><rect x="37" y="25" width="22" height="43" rx="3" fill="{accent}"/><rect x="43" y="20" width="10" height="3" rx="1.5" fill="{DARK}"/><circle cx="48" cy="74" r="3" fill="{DARK}"/>'''
    if kind == 'glowstick':
        return f'''<g transform="rotate(-37 48 49)"><rect x="36" y="13" width="24" height="74" rx="10" fill="{w}"/><rect x="41" y="22" width="14" height="54" rx="6" fill="{accent}"/><path d="M39 30h18M39 70h18" stroke="{DARK}" stroke-width="3"/></g>'''
    if kind == 'torch':
        return f'''<path d="M49 16q21 14 3 30-2-11-8-13 1 12-4 15-15-15 9-32" fill="{accent}"/><path d="M35 49h27l-5 11H40z" fill="{w}"/><path d="M45 60h10l-3 24h-5z" fill="{w}"/>'''
    if kind == 'fireplace':
        return f'''<path d="M18 80V37q0-18 30-18t30 18v43z" fill="{w}"/><path d="M28 73V41q0-12 20-12t20 12v32z" fill="{DARK}"/><path d="M48 38q15 15 2 32-3-9-8-11-2 7-7 11-11-13 13-32" fill="{accent}"/><path d="M16 79h64" stroke="{w}" stroke-width="9" stroke-linecap="round"/>'''
    if kind == 'neon':
        return f'''<rect x="16" y="24" width="64" height="50" rx="8" fill="none" stroke="{w}" stroke-width="7"/><path d="M27 60V37l13 23V37M49 37v23M49 37h19M49 48h15M49 60h19" fill="none" stroke="{accent}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>'''
    if kind == 'faulty':
        return f'''<path d="M33 60q-13-10-12-23a27 27 0 0 1 54 0q1 13-12 23z" fill="{w}"/><path d="M42 46l8-15-3 13 10-3-8 18" fill="{accent}"/><path d="M38 64h20M39 73h18" stroke="{w}" stroke-width="7" stroke-linecap="round"/><path d="M19 19l-7-6M77 19l7-6" stroke="{accent}" stroke-width="5" stroke-linecap="round"/>'''
    if kind == 'emergency':
        return f'''<path d="M26 65v-20a22 22 0 0 1 44 0v20" fill="{accent}"/><path d="M26 65h44" stroke="{w}" stroke-width="7" stroke-linecap="round"/><rect x="20" y="70" width="56" height="11" rx="5" fill="{w}"/><path d="M48 14v12M19 31l-9-6M77 31l9-6" stroke="{accent}" stroke-width="6" stroke-linecap="round"/>'''
    raise ValueError(kind)

blue='#AEE6FF'; warm='#FFD08B'; orange='#FFAF6D'; red='#FF7474'; green='#96F6C8'
# Explicit preset map also acts as a coverage fixture: every defined preset must have an SVG.
KINDS = {
 'desk-40-warm':('desk',warm),'desk-40-day':('desk',blue),
 'desk-60-warm':('desk',warm),'desk-60-day':('desk',blue),
 'ceiling-4x60-warm':('ceiling4',warm),'ceiling-4x60-day':('ceiling4',blue),
 'ceiling-2x100-warm':('ceiling2',warm),'ceiling-2x100-day':('ceiling2',blue),
 'office-warm':('office',warm),'office-day':('office',blue),
 'street-sodium':('street',orange),'street-led':('street',blue),
 'floodlight':('flood',blue),'porch':('porch',warm),'headlights':('headlights',blue),
 'flashlight':('flashlight',blue),'tactical-flashlight':('tactical',blue),
 'headlamp':('headlamp',blue),'lantern':('lantern',warm),
 'candle':('candle',warm),'phone':('phone',blue),'glowstick':('glowstick',green),'torch':('torch',warm),
 'fireplace':('fireplace',orange),'neon':('neon',red),'faulty-bulb':('faulty',blue),'emergency':('emergency',red)
}
for id,(kind,accent) in KINDS.items():
    svg=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" role="img" aria-label="{id.replace('-', ' ')}">
  <rect width="96" height="96" rx="19" fill="#132537"/>
  <rect x="3" y="3" width="90" height="90" rx="17" fill="none" stroke="#36536C" stroke-width="2"/>
  <circle cx="48" cy="48" r="34" fill="{accent}" opacity=".075"/>
  {silhouette(kind,accent)}
  <rect x="36" y="86" width="24" height="3" rx="1.5" fill="{accent}"/>
</svg>
'''
    ET.fromstring(svg) # Reject malformed XML
    (OUT/f'{id}.svg').write_text(svg,encoding='utf-8')
print('Created',len(KINDS),'validated legible-design SVG assets')
