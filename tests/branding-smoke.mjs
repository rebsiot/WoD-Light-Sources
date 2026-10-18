import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../wod-light');
const manifest = JSON.parse(readFileSync(resolve(ROOT,'module.json'),'utf8'));
assert.equal(manifest.id, 'wod-light');
assert.equal(manifest.title, 'AFT Lighting+');
assert.equal(manifest.version,'0.2.1');
assert.equal(manifest.download,'https://github.com/rebsiot/WoD-Light-Sources/releases/download/v0.2.1/wod-light.zip');
assert.equal(manifest.manifest,'https://github.com/rebsiot/WoD-Light-Sources/releases/latest/download/module.json');
const finderSource=readFileSync(resolve(ROOT,'scripts/finder.js'),'utf8');
assert.match(finderSource,/title: "Find Preset Lights"/);

// Use module's real installPresets, fake only the Foundry document services.
const folder=(data)=>({...data,id:data.id??String(++nextId),getFlag(ns,key){return this.flags?.[ns]?.[key]}});
const item=(data)=>({...data,id:data.id??String(++nextId),getFlag(ns,key){return this.flags?.[ns]?.[key]}});
let nextId=0;let folders=[];let items=[];
const created=[];const logs=[];
globalThis.Hooks = {once(){},on(){}};
globalThis.CONFIG = {Item:{dataModels:{Item:{},equipment:{},loot:{}}}};
globalThis.ui = {notifications:{error:(s)=>{throw new Error(s)},warn:(s)=>logs.push(s),info:(s)=>logs.push(s)}};
globalThis.Folder={async create(data){let f=folder({...data,folder:folders.find(x=>x.id===data.folder)??null});folders.push(f);return f}};
globalThis.Item={async createDocuments(docs){for(const d of docs)items.push(item(d));created.push(...docs);return docs},async updateDocuments() {throw new Error('icon updates not relevant here')}};
globalThis.game={user:{isGM:true},system:{id:'worldofdarkness'},folders:{find:(fn)=>folders.find(fn),some:(fn)=>folders.some(fn)},items:{filter:(fn)=>items.filter(fn)},settings:{async set(){}}};
const {PRESETS}=await import(resolve(ROOT,'scripts/presets.js'));
const main=await import(resolve(ROOT,'scripts/main.js'));
assert.equal(PRESETS.length,51);
assert.equal(new Set(PRESETS.map(x=>x.id)).size,51);
for (const system of [['worldofdarkness','Item'],['pf2e','equipment'],['dnd5e','loot']]) {
  [game.system.id]=[system[0]];nextId=0;folders=[];items=[];created.length=0;
  assert.equal(await main.installPresets(),51);
  assert.equal(folders.find(f=>f.getFlag('wod-light','libraryRoot')).name,'AFT Lighting+');
  assert.equal(created.length,51);
  assert.ok(created.every(d=>d.type===system[1] && d.flags['wod-light'].presetId));
  assert.equal(await main.installPresets(),0);
  assert.equal(items.length,51);
}
// Existing installation remains in its historic named folder, and old Item IDs survive.
game.system.id='worldofdarkness';nextId=27;created.length=0;folders=[folder({id:'legacy-root',name:'WoD Light',type:'Item',flags:{'wod-light':{libraryRoot:true}}})];
items=PRESETS.slice(0,27).map((p,i)=>item({id:`legacy-${i}`,name:p.name,img:'custom.png',flags:{'wod-light':{presetId:p.id}}}));
const idsBefore=items.map(x=>x.id);
assert.equal(await main.installPresets(),24);
assert.equal(folders.find(f=>f.getFlag('wod-light','libraryRoot')).name,'WoD Light');
assert.deepEqual(items.slice(0,27).map(x=>x.id),idsBefore);
assert.ok(items.slice(0,27).every(x=>x.img==='custom.png'));
assert.equal(items.length,51);
assert.equal(main.countMissingPresets(),0);
assert.equal(logs.filter(x=>x.includes('AFT Lighting+')).length>0,true);
console.log('PASS: AFT Lighting+ display identity, 51 presets, 3 system Item adapters, legacy folder, existing IDs and artwork, no duplicate items.');
