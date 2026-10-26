import assert from 'node:assert/strict';
import {isForbiddenName,sanitizePublicName,moderationTermCount} from './moderation.js';
assert.ok(moderationTermCount>=200,`only ${moderationTermCount} banned strings`);
for (const phrase of ['死ね','し・ね','ＳＥＸＣＡＭ','f.u.c.k y.o.u','ころす','kill yourself','www.spam.com','a@example.com','t.me/bad','ガイジ','児童ポルノ','白人至上主義','確実に儲かる','b1t.ly','く た ば れ']) {
 if(!isForbiddenName(phrase))throw new Error('not rejected: '+phrase);
}
for (const blocked of ['膣','陰部','局部露出','股間露出','ち・ん・ぽ','ｓｅｘ','ѕех','p\u200benis','ちんぽ','ペニス','ｐｅｎｉｓ','p.e.n.i.s','ま ん こ','sexual assault']) assert.equal(isForbiddenName(blocked),true,'missed explicit input '+blocked);
for (const safe of ['たまたま出会った','クリスタルの騎士','クリームソーダ','あそこにいる','裸足で走る','装備を挿入','つまらない','変態する昆虫','星屑のオトダマ','ほしのこえ','勇敢なスライム','音の旅人','フレンドA','ピヨピヨ','かわいいモンスター','grape','therapist','scrapebook','skyscaper','sexagenarian','クリスタルの剣士']) assert.equal(isForbiddenName(safe),false,'false positive '+safe);
assert.equal(sanitizePublicName('死ね',123),'オトダマ-3F');
assert.equal(sanitizePublicName('音の旅人',123),'音の旅人');
console.log('MODERATION TEST PASS | terms',moderationTermCount);
