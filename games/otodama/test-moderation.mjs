import assert from 'node:assert/strict';
import {isForbiddenName,isForbiddenSpeech,sanitizePublicName,moderationTermCount} from './moderation.js';
assert.ok(moderationTermCount>=200,`only ${moderationTermCount} banned strings`);
for (const phrase of ['死ね','し・ね','ＳＥＸＣＡＭ','f.u.c.k y.o.u','ころす','kill yourself','www.spam.com','a@example.com','t.me/bad','ガイジ','児童ポルノ','白人至上主義','確実に儲かる','b1t.ly','く た ば れ']) {
 if(!isForbiddenName(phrase))throw new Error('not rejected: '+phrase);
}
for (const blocked of ['膣','陰部','局部露出','股間露出','ち・ん・ぽ','ｓｅｘ','ѕех','p\u200benis','ちんぽ','ペニス','ｐｅｎｉｓ','p.e.n.i.s','ま ん こ','sexual assault']) assert.equal(isForbiddenName(blocked),true,'missed explicit input '+blocked);
for (const safe of ['たまたま出会った','クリスタルの騎士','クリームソーダ','あそこにいる','裸足で走る','装備を挿入','つまらない','変態する昆虫','星屑のオトダマ','ほしのこえ','勇敢なスライム','音の旅人','フレンドA','ピヨピヨ','かわいいモンスター','grape','therapist','scrapebook','skyscaper','sexagenarian','クリスタルの剣士']) assert.equal(isForbiddenName(safe),false,'false positive '+safe);
assert.equal(sanitizePublicName('死ね',123),'声魂-3F');
assert.equal(sanitizePublicName('音の旅人',123),'音の旅人');
// Bidi/invisible characters must not survive public display, and Unicode emoji must not be split.
assert.equal(sanitizePublicName('テ\\u202eスト'.replace('\\u202e','\u202e'),123),'テスト');
assert.equal(sanitizePublicName('あ\\u200bい'.replace('\\u200b','\u200b'),123),'あい');
assert.equal(sanitizePublicName('  星   の  声  ',123),'星 の 声');
assert.equal(sanitizePublicName('😀'.repeat(25),123),'😀'.repeat(24));
for(const phrase of ['死\\u200bね'.replace('\\u200b','\u200b'),'p\\u200benis'.replace('\\u200b','\u200b')]){
 assert.equal(isForbiddenName(phrase),true);
 assert.ok(sanitizePublicName(phrase,123).startsWith('声魂-'));
}
// Speech-recognition output must use the same policy as names, including
// common phonetic variants, spacing and fullwidth/katakana substitutions.
for(const phrase of ['ちんこ','チンコ','ち ん こ','ち・ん・こ','ちんこー','てぃんこ','おちんぽ','まんこ','まんこー','陰茎','性器','セックス','せっくす','し ね','ＳＥＸ','p.e.n.i.s','rape you']){
 assert.equal(isForbiddenSpeech(phrase),true,'speech bypass: '+phrase);
}
for(const phrase of ['たまたま会った','かわいい猫','おはよう','勝った','まけた','クリスタルの剣士','グレープジュース','音の旅人']){
 assert.equal(isForbiddenSpeech(phrase),false,'false positive speech: '+phrase);
}
console.log('MODERATION TEST PASS | terms',moderationTermCount);
