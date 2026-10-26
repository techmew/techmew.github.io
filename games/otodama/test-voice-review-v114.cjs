// No hardware required. Test ASR transcript screening and fail-closed audio policy.
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const {isForbiddenSpeech}=await import('./moderation.js');
 for(const word of ['人間の局部','局部','ちーーんこ','chinko','c.h.i.n.k.o','ちんこ','チ・ン・コ','ちんぽ','ちーんこ','ち ん ぽ','ま・ん・こ',
  '陰茎','金玉','ｓｅｘ','ｐｅｎｉｓ','s.e.x','f.u.c.k y.o.u']){
   assert.equal(isForbiddenSpeech(word),true,'unblocked transcription: '+word);
 }
 for(const text of ['たまたま出会った','クリスタルの騎士','今日はよろしくお願いします',
  'もっと強くなりたい','かわいいモンスター','音の旅人']){
   assert.equal(isForbiddenSpeech(text),false,'false positive: '+text);
 }
 const html=fs.readFileSync(__dirname+'/index.html','utf8');
 const js=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
 assert.ok(js);new Function(js);
 const from=js.indexOf('async function beginSpokenWordReview()');
 const to=js.indexOf('// v0.4 microphone capture:',from);
 assert.ok(from>=0&&to>from,'review functions');
 const source=js.slice(from,to).replace("await import('./moderation.js')","await Promise.resolve({isForbiddenSpeech})");
 const nodes={allowCloudSpeech:{checked:false}};
 const $=id=>nodes[id]||{checked:false};
 const storage=new Map();
 const localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,String(v))};
 const api=(window)=>new Function('window','$','localStorage','setTimeout','isForbiddenSpeech',
  source+'return {beginSpokenWordReview,evaluateSpokenWordReview};')(window,$,localStorage,setTimeout,isForbiddenSpeech);
 let phrase='チ ン コ';
 class LocalRecognition{
  constructor(){this.processLocally=false;LocalRecognition.instance=this}
  static async available(){return 'available'}
  start(){this.started=true}
  stop(){
   const alternative=[{transcript:phrase}];alternative.isFinal=true;
   this.onresult({results:[alternative]});this.onend();
  }
  abort(){}
 }
 let h=api({SpeechRecognition:LocalRecognition}),r=await h.beginSpokenWordReview();
 assert.equal(LocalRecognition.instance.processLocally,true,'on-device recognition preferred');
 assert.equal((await h.evaluateSpokenWordReview(r)).banned,true,'explicit transcription rejected');
 phrase='こんにちは。';r=await h.beginSpokenWordReview();
 let check=await h.evaluateSpokenWordReview(r);
 assert.equal(check.allowed,true,'harmless recognized Japanese speech permitted');
 assert.equal(check.banned,false);
 class NoLocalRecognition{
  start(){this.started=true;NoLocalRecognition.instance=this}
  stop(){const result=[{transcript:'ちんこ'}];result.isFinal=true;this.onresult({results:[result]});this.onend()}
  abort(){}
 }
 h=api({webkitSpeechRecognition:NoLocalRecognition});
 r=await h.beginSpokenWordReview();
 check=await h.evaluateSpokenWordReview(r);
 assert.equal(check.allowed,false,'off-device must not activate without opt-in');
 assert.equal(check.state,'consent');
 nodes.allowCloudSpeech.checked=true;
 nodes.allowCloudSpeech.onchange();
 h=api({webkitSpeechRecognition:NoLocalRecognition});
 r=await h.beginSpokenWordReview();check=await h.evaluateSpokenWordReview(r);
 assert.equal(check.banned,true,'opt-in remote recognition still blocks explicit term');
 h=api({});
 r=await h.beginSpokenWordReview();check=await h.evaluateSpokenWordReview(r);
 assert.equal(check.allowed,false,'unsupported ASR must not approve audio');
 const clipStart=js.indexOf('function clipData(cr){');
 const clipEnd=js.indexOf('async function decodeVoice(',clipStart);
 assert.ok(clipEnd>clipStart);
 const clip=new Function(js.slice(clipStart,clipEnd)+'return clipData;')();
 const audio='data:audio/webm;base64,QUJDRA==';
 assert.equal(clip({seed:1,voiceClip:audio,voiceReview:'passed'}),audio);
 assert.equal(clip({seed:1,voiceClip:audio,voiceReview:'unverified'}),null);
 assert.equal(clip({seed:1,voiceClip:audio}),null,'legacy audio cannot bypass review');
 assert.ok(js.includes('if(review.banned)'),'microphone flow rejects harmful recognized audio');
 assert.ok(js.includes("send:false,receive:false"),'online audio consent disabled');
 assert.ok(html.includes('id="shareVoice" disabled'),'online audio UI disabled');
 const worker=fs.readFileSync(__dirname+'/worker.js','utf8');
 assert.ok(worker.includes("type:'voice_rejected'"),'server must reject unmoderated audio');
 assert.ok(!html.includes('id="bowBanner"'),'bow deleted');
 console.log('VOICE REVIEW PASS: forbidden Japanese phrases blocked; consent, ASR fail closed, local, cloud and legacy clip policy (mock only)');
})().catch(e=>{console.error(e);process.exitCode=1});
