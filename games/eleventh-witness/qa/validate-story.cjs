// Run from the game directory: node qa/validate-story.cjs
'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'story.js'), 'utf8'), sandbox);
const book = sandbox.window.NOVEL_DATA;
assert.equal(book.start, 'y0_open');
assert.ok(book.scenes.opening, 'legacy save scene must remain');
const engine = fs.readFileSync(path.join(root, 'engine.js'), 'utf8');
assert.ok(engine.includes('eleventh_novel_reboot_2026_v1'), 'save key changed');
assert.ok(engine.includes('SLOTS=3'), 'three bookmark slots changed');
const scenes = book.scenes;
let nodes = 0, choices = 0;
for (const [id, rows] of Object.entries(scenes)) {
  assert.ok(Array.isArray(rows) && rows.length, 'empty scene: ' + id);
  for (const row of rows) {
    nodes++;
    if (row.k === 'j') assert.ok(scenes[row.to], id + ' -> ' + row.to);
    if (row.k === 'c') {
      choices++;
      assert.ok(row.opts.length, 'empty choice: ' + id);
      for (const option of row.opts) assert.ok(scenes[option.to], id + ' -> ' + option.to);
    }
    assert.ok(['n','d','f','j','c','e'].includes(row.k), 'invalid node: ' + id);
  }
}
function endings(scene, active = new Set()) {
  assert.ok(!active.has(scene), 'cycle: ' + scene);
  const next = new Set(active);
  next.add(scene);
  const found = new Set();
  for (const row of scenes[scene]) {
    if (row.k === 'e') found.add(row.name);
    if (row.k === 'j') for (const name of endings(row.to, next)) found.add(name);
    if (row.k === 'c') for (const opt of row.opts)
      for (const name of endings(opt.to, next)) found.add(name);
  }
  return found;
}
const first = [...endings('y0_open')].sort();
const second = [...endings('y1_intro')].sort();
assert.equal(first.length, 3, 'first night must have 3 endings');
assert.equal(second.length, 2, 'second night must have 2 endings');
console.log(JSON.stringify({scenes:Object.keys(scenes).length,nodes,choices,first,second,saveKey:'unchanged',slots:3},null,2));
