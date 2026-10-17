import assert from 'node:assert/strict';

// Mock only Foundry's narrowly-used APIs. A successful test is NOT a live Foundry test.
const events = new Map();
globalThis.Hooks = {
  once(name, cb) { events.set(`once:${name}`, cb); },
  on(name, cb) { events.set(name, cb); }
};

const folders = [];
const items = [];
const stored = {};
const lightsCreated = [];
let uid = 0;
const record = (input) => ({
  ...input, id: `fake${++uid}`,
  getFlag(ns, field) { return this.flags?.[ns]?.[field]; }
});

globalThis.Folder = {
  async create(input) {
    const folder = record({ ...input, folder: folders.find(f => f.id === input.folder) || null });
    folders.push(folder);
    return folder;
  }
};
globalThis.Item = {
  async createDocuments(documents) { for (const doc of documents) items.push(record(doc)); return documents; }
};
globalThis.foundry = {
  utils: { deepClone: structuredClone },
  applications: { api: { DialogV2: { async confirm() { return true; } } } }
};
globalThis.ui = { notifications: { info() {}, error(message) { throw Error(message); } } };
globalThis.game = {
  user: { isGM: true },
  items: { filter(cb) { return items.filter(cb); }, get(id) { return items.find(i => i.id === id); } },
  folders: { find(cb) { return folders.find(cb); }, some(cb) { return folders.some(cb); } },
  settings: {
    register(ns, name, options) { stored[`${ns}.${name}`] = options.default; },
    get(ns, name) { return stored[`${ns}.${name}`]; },
    async set(ns, name, val) { stored[`${ns}.${name}`] = val; }
  }
};
globalThis.canvas = { scene: { async createEmbeddedDocuments(type, data) { lightsCreated.push({ type, data }); } } };
globalThis.fromUuidSync = uuid => {
  const found = items.find(i => `Item.${i.id}` === uuid);
  if (found) return { ...found, documentName: 'Item' };
  return null;
};

const presets = await import('../wod-light/scripts/presets.js');
const main = await import('../wod-light/scripts/main.js');
assert.equal(presets.PRESETS.length, 27);
assert.equal(new Set(presets.PRESETS.map(p => p.id)).size, 27);
assert.equal(presets.PRESETS.filter(p => p.portable).length, 8);
assert.equal(presets.PRESETS.find(p => p.id === 'flashlight').light.angle, 55);
assert.equal(presets.PRESETS.find(p => p.id === 'ceiling-4x60-warm').light.bright, 18);

await events.get('once:init')();
assert.equal(await main.installPresets(), 27);
assert.equal(folders.length, 5);
assert.equal(items.length, 27);
assert.equal(await main.installPresets(), 0);
assert.equal(items.length, 27);
assert.equal(stored['wod-light.presetsInstalled'], true);

const desk = items.find(i => i.getFlag('wod-light', 'presetId') === 'desk-60-day');
assert.equal(main.onCanvasDrop(canvas, { type: 'Item', uuid: `Item.${desk.id}`, x: 450, y: 700 }), false);
await new Promise(resolve => setImmediate(resolve));
assert.equal(lightsCreated.length, 1);
assert.equal(lightsCreated[0].type, 'AmbientLight');
assert.equal(lightsCreated[0].data[0].x, 450);
assert.equal(lightsCreated[0].data[0].config.color, '#eef4ff');
assert.equal(main.onCanvasDrop(canvas, { type: 'Item', id: 'random', x: 1, y: 2 }), undefined);
assert.equal(main.onCanvasDrop(canvas, { type: 'Actor', id: desk.id, x: 1, y: 2 }), undefined);

const flashlight = items.find(i => i.getFlag('wod-light', 'presetId') === 'flashlight');
const candle = items.find(i => i.getFlag('wod-light', 'presetId') === 'candle');
function makeToken(equipment = [flashlight, candle], isOwner = true) {
  const doc = {
    isOwner,
    light: { ...structuredClone(presets.PRESET_BY_ID['desk-40-warm'].light), bright: 3, dim: 9, angle: 360, color: '#cc7777', alpha: 0.25 },
    flags: {},
    getFlag(ns, field) { return this.flags[ns]?.[field] ?? null; },
    async update(update) {
      for (const [field, val] of Object.entries(update)) {
        if (field === 'light') this.light = { ...this.light, ...structuredClone(val) };
        else if (field.startsWith('flags.wod-light.')) {
          this.flags['wod-light'] ||= {};
          this.flags['wod-light'][field.substring('flags.wod-light.'.length)] = structuredClone(val);
        } else if (field.startsWith('light.')) {
          this.light[field.substring('light.'.length)] = structuredClone(val);
        }
      }
    }
  };
  return { actor: { items: equipment }, document: doc };
}
const token = makeToken();
const expectedBefore = structuredClone(token.document.light);
assert.equal(await main.setCarriedLight(token, 'flashlight'), true);
assert.equal(token.document.light.angle, 55);
assert.equal(token.document.light.bright, 12);
assert.deepEqual(token.document.getFlag('wod-light', 'previousLight'), expectedBefore);
assert.equal(await main.setCarriedLight(token, 'candle'), true);
assert.equal(token.document.light.angle, 360);
assert.equal(token.document.getFlag('wod-light', 'selectedId'), 'candle');
assert.deepEqual(token.document.getFlag('wod-light', 'previousLight'), expectedBefore);
assert.equal(await main.setCarriedLight(token), true);
assert.deepEqual(token.document.light, expectedBefore);
assert.equal(token.document.getFlag('wod-light', 'activeId'), null);
assert.equal(await main.setCarriedLight(token, 'desk-60-day'), false);

// Ownership behavior
const notOwned = makeToken([flashlight], false);
game.user.isGM = false;
assert.equal(await main.setCarriedLight(notOwned, 'flashlight'), false);
assert.equal(await main.setCarriedLight(makeToken([]), 'flashlight'), false);
assert.equal(await main.setCarriedLight(makeToken([flashlight]), 'flashlight'), true);
game.user.isGM = true;

// Small fake DOM to verify the HUD injection and click behavior.
class FakeElement {
  constructor(tag = 'div') {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.listeners = {};
    this.dataset = {};
    this.innerHTML = '';
    this.className = '';
    this.style = {};
    this.classList = {
      toggle: (name, value) => {
        const all = new Set(this.className.split(' ').filter(Boolean));
        if (value) all.add(name); else all.delete(name);
        this.className = [...all].join(' ');
      }
    };
  }
  setAttribute() {}
  addEventListener(name, fn) { this.listeners[name] = fn; }
  appendChild(child) { this.children.push(child); }
  remove() {}
  contains(node) { return this === node || this.children.some(el => el.contains(node)); }
  getBoundingClientRect() { return { left: 100, bottom: 100 }; }
  get offsetWidth() { return 150; }
  get offsetHeight() { return 120; }
  querySelector(selector) {
    if (selector === '.col.left') return this.left ?? null;
    if (selector === 'menu.col.left') return this.left ?? null;
    if (selector === '.wod-light-hud-button') return this.children.find(e => e.className.includes('wod-light-hud-button'))
      ?? this.left?.children.find(e => e.className.includes('wod-light-hud-button')) ?? null;
    return null;
  }
}
globalThis.HTMLElement = FakeElement;
globalThis.document = {
  createElement(tag) { return new FakeElement(tag); },
  body: new FakeElement('body'),
  addEventListener() {}, removeEventListener() {}
};
globalThis.window = { innerWidth: 1100, innerHeight: 800 };
const hudRoot = new FakeElement(); hudRoot.left = new FakeElement();
const hudToken = makeToken([flashlight]);
main.onTokenHudRender({ object: hudToken }, hudRoot);
assert.equal(hudRoot.left.children.length, 1);
main.onTokenHudRender({ object: hudToken }, hudRoot);
assert.equal(hudRoot.left.children.length, 1);
const button = hudRoot.left.children[0];
const fakeClick = { button: 0, preventDefault() {}, stopPropagation() {}, stopImmediatePropagation() {} };
button.listeners.pointerdown(fakeClick);
await new Promise(resolve => setImmediate(resolve));
assert.equal(hudToken.document.getFlag('wod-light', 'activeId'), 'flashlight');
button.listeners.pointerdown(fakeClick);
await new Promise(resolve => setImmediate(resolve));
assert.equal(hudToken.document.getFlag('wod-light', 'activeId'), null);
const removed = makeToken([flashlight]);
await main.setCarriedLight(removed, 'flashlight');
removed.actor.items = [];
const removedLightRoot = new FakeElement(); removedLightRoot.left = new FakeElement();
main.onTokenHudRender({ object: removed }, removedLightRoot);
assert.equal(removedLightRoot.left.children.length, 1);
removedLightRoot.left.children[0].listeners.pointerdown(fakeClick);
await new Promise(resolve => setImmediate(resolve));
assert.equal(removed.document.getFlag('wod-light', 'activeId'), null);
// Context menu selection + last-used preset retained across off/on.
const twoSourceToken = makeToken([flashlight, candle]);
const twoSourceRoot = new FakeElement(); twoSourceRoot.left = new FakeElement();
main.onTokenHudRender({ object: twoSourceToken }, twoSourceRoot);
const multiButton = twoSourceRoot.left.children[0];
const rightClick = { button: 2, preventDefault() {}, stopPropagation() {}, stopImmediatePropagation() {} };
multiButton.listeners.pointerdown(rightClick);
const menu = document.body.children.at(-1);
assert.equal(menu.children.length, 2);
menu.children[1].listeners.pointerdown({ preventDefault() {}, stopPropagation() {} });
await new Promise(resolve => setImmediate(resolve));
assert.equal(twoSourceToken.document.getFlag('wod-light', 'activeId'), 'candle');
multiButton.listeners.pointerdown(fakeClick);
await new Promise(resolve => setImmediate(resolve));
assert.equal(twoSourceToken.document.getFlag('wod-light', 'activeId'), null);
multiButton.listeners.pointerdown(fakeClick);
await new Promise(resolve => setImmediate(resolve));
assert.equal(twoSourceToken.document.getFlag('wod-light', 'activeId'), 'candle');

const noLightRoot = new FakeElement(); noLightRoot.left = new FakeElement();
main.onTokenHudRender({ object: makeToken([]) }, noLightRoot);
assert.equal(noLightRoot.left.children.length, 0);
console.log('PASS: presets (27), idempotent install, scene drop, native light creation, token restore/switch, ownership, HUD injection and toggle.');
