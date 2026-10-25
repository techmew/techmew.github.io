import assert from 'node:assert/strict';
import {isForbiddenName,sanitizePublicName,moderationTermCount} from './moderation.js';
assert.ok(moderationTermCount>=200,`only ${moderationTermCount} banned strings`);
for (const phrase of ['死ね','し・ね','ＳＥＸＣＡＭ','f.u.c.k y.o.u','ころす','kill yourself','www.spam.com','a@example.com','t.me/bad','ガイジ','児童ポルノ','白人至上主義','確実に儲かる','b1t.ly','く た ば れ']) {
 if(!isForbiddenName(phrase))throw new Error('not rejected: '+phrase);
}
for (const safe of ['星屑のオトダマ','ほしのこえ','勇敢なスライム','音の旅人','フレンドA','ピヨピヨ','かわいいモンスター']) assert.equal(isForbiddenName(safe),false,'false positive '+safe);
assert.equal(sanitizePublicName('死ね',123),'オトダマ-3F');
assert.equal(sanitizePublicName('音の旅人',123),'音の旅人');
console.log('MODERATION TEST PASS | terms',moderationTermCount);