import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { PRESETS, PRESET_BY_ID } from '../wod-light/scripts/presets.js';
import {
  getSystemAdapter, SUPPORTED_SYSTEMS, systemCanCreateItems,
  presetItemData, itemIsAvailable, conflictsWithPf2eTokenLight
} from '../wod-light/scripts/system-adapters.js';

const root = resolve(import.meta.dirname, '../wod-light');
const manifest = JSON.parse(readFileSync(resolve(root, 'module.json'), 'utf8'));
assert.equal(manifest.id, 'wod-light');
assert.match(manifest.version, /^\d+\.\d+\.\d+$/, 'manifest version must be SemVer');
assert.equal(manifest.relationships?.systems, undefined, 'WoD-only system requirement must be removed');
assert.equal(PRESETS.length, 51);
assert.equal(PRESETS.filter(p => p.portable).length, 10);
assert.equal(new Set(PRESETS.map(p => p.id)).size, 51);
const icons = readdirSync(resolve(root, 'assets/icons')).filter(x => x.endsWith('.svg'));
assert.equal(icons.length, 51);
for (const p of PRESETS) {
  const svg = readFileSync(resolve(root, `assets/icons/${p.id}.svg`), 'utf8');
  assert.match(svg, /<svg/); assert.match(svg, /<\/svg>/);
}
assert.deepEqual(SUPPORTED_SYSTEMS, ['worldofdarkness','pf2e','dnd5e']);
for (const [system, type, location] of [
  ['worldofdarkness','Item','description'], ['pf2e','equipment','description'], ['dnd5e','loot','description']
]) {
  const adapter = getSystemAdapter(system);
  assert.equal(adapter.itemType,type);
  const source = presetItemData(PRESET_BY_ID.flashlight, 'folder-a', adapter, 'img.svg');
  assert.equal(source.type,type);
  assert.equal(source.flags['wod-light'].presetId,'flashlight');
  assert.equal(source.name,'Flashlight');
  assert.equal(source.folder,'folder-a');
  assert.ok(system==='worldofdarkness' ? source.system.description.includes('Portable') : source.system.description.value.includes('Portable'));
  if (system==='pf2e') {
    assert.deepEqual(source.system.rules, []);
    assert.equal(source.system.usage.value, 'held-in-one-hand');
    assert.equal(source.system.equipped.handsHeld,0);
  }
  if (system==='dnd5e') assert.equal(source.system.quantity,1);
}
assert.equal(getSystemAdapter('tormenta20'), null);
assert.equal(systemCanCreateItems(null), false);
assert.equal(systemCanCreateItems(getSystemAdapter('pf2e'), {equipment:{}}), true);
assert.equal(systemCanCreateItems(getSystemAdapter('pf2e'), {spell:{}}), false);
assert.equal(itemIsAvailable({system:{quantity:0}}),false);
assert.equal(itemIsAvailable({system:{quantity:1}}),true);
assert.equal(itemIsAvailable({system:{}}),true);
assert.equal(conflictsWithPf2eTokenLight({rules:[{key:'TokenLight'}]},'pf2e'),true);
assert.equal(conflictsWithPf2eTokenLight({rules:[{key:'TokenLight'}]},'dnd5e'),false);
assert.equal(conflictsWithPf2eTokenLight({items:[{type:'effect',system:{rules:[{key:'TokenLight'}]}}]},'pf2e'),true);
assert.equal(conflictsWithPf2eTokenLight({items:[{type:'equipment',system:{equipped:{carryType:'stowed'},rules:[{key:'TokenLight'}]}}]},'pf2e'),false);

const hooks = new Map();
globalThis.Hooks = {
  once(name,cb) {hooks.set(`once:${name}`,cb);},
  on(name,cb) {hooks.set(name,cb);}
};
const warnings=[]; const infos=[];
globalThis.ui={notifications:{info(s){infos.push(s);},warn(s){warnings.push(s);},error(s){throw Error(s);}}};
let ids=0;
const newId=()=>`document-${++ids}`;
const setFlag=(o,field,value)=>{o.flags['wod-light']??={};o.flags['wod-light'][field]=value;};
const makeDocument = data => ({...data,id:newId(),documentName:'Item', getFlag(ns,key){return this.flags?.[ns]?.[key];}});
let folders=[],items=[],created=[],controlled=[];
const store={};
globalThis.CONFIG={Item:{dataModels:{Item:{},equipment:{},loot:{}}}};
globalThis.Folder={async create(data){const f=makeDocument({...data,folder:folders.find(x=>x.id===data.folder)??null});folders.push(f);return f;}};
globalThis.Item={
  async createDocuments(data){const newItems=data.map(makeDocument);items.push(...newItems);created.push(...newItems);return newItems;},
  async updateDocuments(updates){for(const update of updates){const item=items.find(x=>x.id===update._id);Object.assign(item,update);}return updates;}
};
globalThis.foundry={utils:{deepClone:structuredClone},applications:{api:{DialogV2:{async confirm(){return true;}}}}};
globalThis.game={
  user:{isGM:true}, system:{id:'worldofdarkness'},
  items:{filter(fn){return items.filter(fn);}, get(id){return items.find(x=>x.id===id);}},
  folders:{find(fn){return folders.find(fn);}, some(fn){return folders.some(fn);}},
  settings:{register(ns,key,opt){store[`${ns}.${key}`]=opt.default;},get(ns,key){return store[`${ns}.${key}`];},async set(ns,key,value){store[`${ns}.${key}`]=value;}}
};
const lights=[];let selectionCount=0;
const scene={id:'scene-1',lights:{contents:lights},async createEmbeddedDocuments(type,data){assert.equal(type,'AmbientLight');const docs=data.map(makeDocument);lights.push(...docs);return docs;}};
globalThis.canvas={scene,level:null,lighting:{active:false,activate(){this.active=true;return this;},get(id){return {control(){selectionCount++;return true;}};}},clientCoordinatesFromCanvas({x,y}){return{x,y}},isOffscreen(){return false;}};
globalThis.fromUuidSync=uuid=>items.find(i=>`Item.${i.id}`===uuid)??null;
const main=await import('../wod-light/scripts/main.js');
await hooks.get('once:init')();
assert.equal(typeof hooks.get('getSceneControlButtons'),'function');

async function newWorld(system){
  folders=[];items=[];created=[];warnings.length=0;infos.length=0;
  game.system.id=system;
  store['wod-light.presetsInstalled']=false;
  store['wod-light.catalogPromptedFor']='';
}
for (const [system,type] of [['worldofdarkness','Item'],['pf2e','equipment'],['dnd5e','loot']]) {
  await newWorld(system);
  assert.equal(await main.installPresets(),51,system);
  assert.equal(items.length,51);
  assert.equal(folders.length,5);
  assert.ok(items.every(item=>item.type===type));
  assert.equal(await main.installPresets(),0,'install must be idempotent');
  assert.equal(items.length,51);
  // Reuse existing flag and Item IDs. In particular do not rewrite customized image.
  const original=items[0];original.img='worlds/custom/desk.webp';
  const oldId=original.id;
  assert.equal(await main.refreshPresetIcons(),0);
  assert.equal(items[0].id,oldId);assert.equal(items[0].img,'worlds/custom/desk.webp');
  // Scene drops use native AmbientLight and retain existing preset IDs.
  assert.equal(await main.placePresetOnScene('subway-strip',400,240),true);
  assert.equal(lights.at(-1).flags['wod-light'].presetId,'subway-strip');
  assert.equal(lights.at(-1).x,400);assert.equal(lights.at(-1).config.dim,38);
  // Inventory Items with flags trigger portable lights, with existing Token
  // config restored after off; Foundry decides animation, visibility, and walls.
  const lamp=items.find(x=>x.getFlag('wod-light','presetId')==='flashlight');
  const token={actor:{items:[lamp],rules:[]},document:{
    isOwner:true,light:{bright:3,dim:7,color:'#44aadd',angle:360},flags:{},
    getFlag(ns,key){return this.flags[ns]?.[key];},
    async update(changes){for(const[key,value]of Object.entries(changes)){
      if(key==='light')this.light=structuredClone(value);
      else if(key.startsWith('flags.wod-light.'))setFlag(this,key.slice('flags.wod-light.'.length),structuredClone(value));
      else if(key.startsWith('light.'))this.light[key.slice(6)]=value;
    }}
  }};
  const originalLight=structuredClone(token.document.light);
  assert.equal(await main.setCarriedLight(token,'flashlight'),true);
  assert.equal(token.document.light.angle,55);
  assert.equal(token.document.getFlag('wod-light','activeId'),'flashlight');
  assert.equal(await main.setCarriedLight(token,null),true);
  assert.deepEqual(token.document.light,originalLight);
  if(system==='pf2e'){
    token.actor.rules=[{key:'TokenLight'}];
    assert.equal(await main.setCarriedLight(token,'flashlight'),false,'do not fight PF2e TokenLight rules');
    assert.match(warnings.at(-1),/TokenLight/);
  }
  // A tagged fixture that is not portable never powers a Token HUD.
  assert.equal(await main.setCarriedLight(token,'subway-strip'),false);
  if(system==='dnd5e'){
    assert.equal(lamp.system.quantity,1);
    lamp.system.quantity=0;
    assert.equal(await main.setCarriedLight(token,'flashlight'),false);
  }
}
// Native actor-owned copies use the same preset flag, even after Item type
// conversion; players control only their owned Token HUD (not world scene drops).
await newWorld('dnd5e');
await main.installPresets();
const actorFlashlight=items.find(x=>x.getFlag('wod-light','presetId')==='flashlight');
game.user.isGM=false;
const playerToken={actor:{items:[actorFlashlight]},document:{isOwner:true,light:{bright:0,dim:0},flags:{},getFlag(ns,k){return this.flags[ns]?.[k];},async update(u){
  for(const[k,v]of Object.entries(u)){
    if(k==='light')this.light=structuredClone(v);
    else if(k.startsWith('flags.wod-light.'))setFlag(this,k.substring('flags.wod-light.'.length),structuredClone(v));
    else if(k.startsWith('light.'))this.light[k.substring(6)]=v;
  }
}}};
assert.equal(await main.setCarriedLight(playerToken,'flashlight'),true);
assert.equal(playerToken.document.getFlag('wod-light','activeId'),'flashlight');
assert.equal(await main.setCarriedLight(playerToken),true);
playerToken.document.isOwner=false;
assert.equal(await main.setCarriedLight(playerToken,'flashlight'),false);
assert.equal(await main.placePresetOnScene('office-warm',10,10),false,'players cannot create Ambient Lights');
game.user.isGM=true;

// Shared native Token light-origin adjustment retains prior geometry and
// only runs while a module portable preset is actually activated.
const held=await import('../wod-light/scripts/held-lights.js');
const tokenDoc={
  rotation:0, flags:{'wod-light':{activeId:'flashlight'}},
  getFlag(ns,key){return this.flags[ns]?.[key];},
  getSize(){return{width:100,height:100};}
};
const orig={x:100,y:100,elevation:12};
assert.deepEqual(held.handheldOrigin(tokenDoc,{rotation:0},orig),{x:142,y:100,elevation:12});
const turned=held.handheldOrigin(tokenDoc,{rotation:90},orig);
assert.ok(Math.abs(turned.x-100)<1e-8 && Math.abs(turned.y-142)<1e-8);
assert.equal(held.outwardSourceData({document:tokenDoc},{rotation:0,angle:55}).rotation,270);
tokenDoc.flags['wod-light'].activeId=null;
assert.equal(held.handheldOrigin(tokenDoc,{rotation:0},orig),orig);

// An existing WoD20 world gets a one-time offer that adds only missing Items.
await newWorld('worldofdarkness');
assert.equal(await main.installPresets(),51);
items.splice(27);const savedIds=items.map(i=>i.id);const savedImages=items.map(i=>i.img);
assert.equal(main.countMissingPresets(),24);
assert.equal(await main.offerMissingPresetsOnUpgrade(),true);
assert.equal(items.length,51);assert.deepEqual(items.slice(0,27).map(i=>i.id),savedIds);
assert.deepEqual(items.slice(0,27).map(i=>i.img),savedImages);
assert.equal(await main.offerMissingPresetsOnUpgrade(),false);
await newWorld('unknown-system');
assert.equal(await main.installPresets(),0);
assert.equal(folders.length,0);
assert.match(warnings.at(-1),/not have a supported native/);
game.user.isGM=false;
assert.equal(await main.installPresets(),0);
console.log('PASS: 51 preserved IDs/SVGs, three native Item types, opt-in add-only upgrade, scene drops, Token HUD light/restore, PF2e rule guard, system mismatch and permissions (mocked).');
