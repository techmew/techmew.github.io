'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8'),js=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(js);new vm.Script(js);
const beginning=js.indexOf('let evolutionDialogSeed=null,evolutionDraft=null;'),
      ending=js.indexOf('const researchStorageKey=',beginning);
assert.ok(beginning>0&&ending>beginning,'v140 evolution flow implemented in main client');
const source=js.slice(beginning,ending);
for(const id of ['evolutionDialog','evoRecord','evoListen','evoRetry','evoConfirm','evoCancel','evoClose',
                  'evolutionTarget','evolutionDialogStatus','evolutionDialogRecording']){
 assert.equal(html.split('id="'+id+'"').length-1,1,'unique dialog control '+id);
}
assert.match(html,/id="evolutionDialog"[^>]*role="dialog" aria-modal="true"/);
assert.match(html,/確定するまでキャラ・レベル・能力・登録済みの声は変わりません/);
assert.match(js,/evolutionDraft=\{seed:selectedSeed,voice:audioDNA\?\.voice\|\|v,dna:audioDNA,clip:compactClip\}/,
 'captured evolution voice must be staged not saved');
assert.match(js,/function confirmEvolutionDraft\(\)/,'confirmation guard');
assert.match(js,/if\(cur.seed!==selectedSeed\|\|evolutionDialogSeed!==selectedSeed\|\|\$\('evolutionDialog'\)\.hidden\)/,'stale capture never commits');
assert.match(js,/if\(!saved\).*syncEvolutionDialog\(\);return false/,'save failures retain draft');
const GROWTH={EVOLUTION_LEVELS:[10,20,30],canEvolve:cr=>(cr.evolutionVoices||[]).length<3&&[10,20,30][(cr.evolutionVoices||[]).length]<=cr.level,
 evolutionCombatBonus:cr=>({attack:(cr.evolutionVoices||[]).length*12,hp:(cr.evolutionVoices||[]).length*8})};
const nodes=new Map();
const $=id=>{if(!nodes.has(id))nodes.set(id,{hidden:id==='evolutionDialog'||id==='evolutionDialogRecording',
 textContent:'',title:'',disabled:false,style:{},dataset:{},focus(){this.focused=true}});
 return nodes.get(id);};
let old={seed:71,level:10,rarity:'A',voice:{pitch:50},stats:[41,42,43,44,45],evolutionVoices:[]};
const data={roster:[old],cur:old,recording:false,recordingRequestPending:false,recordingFinishing:false,match:null,notes:[],saveFails:false};
const calls=[];
const ctx={...data,GROWTH,$,levelOf:cr=>cr.level,rarityOf:cr=>cr.rarity,displayName:cr=>'テスト'+cr.seed,
 stopAttackVoices:()=>calls.push('stop'),unlockBattleAudio:()=>calls.push('unlock'),
 playDecodedVoice:(sample,seat,force)=>calls.push(['preview',sample.voiceClip,seat,force]),
 startRecord:mode=>calls.push('capture:'+mode),abortCaptureForBackground:()=>calls.push('abort'),
 commitEvolutionVoice:(cr,voice,dna,clip)=>{
  calls.push('commit');if(ctx.saveFails)return false;
  const next={...cr,stats:cr.stats.map((v,i)=>v+(i===0?2:0)),
    evolutionVoices:[...(cr.evolutionVoices||[]),{voice,clip,signature:dna.signature}]};
  ctx.roster[ctx.roster.findIndex(x=>x.seed===cr.seed)]=next;ctx.cur=next;return true;
 }};
vm.runInNewContext(source+';globalThis.workflow={openEvolutionDialog,cancelEvolutionDialog,recordEvolutionDraft,listenEvolutionDraft,retryEvolutionDraft,confirmEvolutionDraft,updateEvolutionUI,syncEvolutionDialog,getDraft:()=>evolutionDraft,setDraft:v=>evolutionDraft=v,getSeed:()=>evolutionDialogSeed}',ctx);
const api=ctx.workflow;
const sample={seed:71,voice:{pitch:65},dna:{signature:53},clip:'data:audio/wav;base64,'+'QUJD'.repeat(60)};
ctx.cur.level=9;api.updateEvolutionUI();
assert.equal($('evolveBtn').disabled,true,'cannot evolve until level 10');
assert.match($('evolutionInfo').textContent,/Lv\.10/,'locked reason clearly shown');
assert.equal(api.openEvolutionDialog(),false,'locked character cannot open capture');
ctx.cur.level=10;api.updateEvolutionUI();
assert.equal($('evolveBtn').disabled,false,'level 10 should enable evolution');
assert.equal(api.openEvolutionDialog(),true,'level 10 dialog opens');
assert.equal($('evolutionDialog').hidden,false);
assert.equal($('evoConfirm').disabled,true,'nothing committed before recording');
api.recordEvolutionDraft();assert.ok(calls.includes('capture:evolve'),'record button starts evolution voice path');
assert.equal(ctx.roster[0].evolutionVoices.length,0,'opening/recording does not mutate character');
api.setDraft(sample);api.syncEvolutionDialog();
assert.equal($('evoListen').disabled,false);assert.equal($('evoRetry').disabled,false);assert.equal($('evoConfirm').disabled,false);
api.listenEvolutionDraft();assert.ok(calls.some(x=>Array.isArray(x)&&x[0]==='preview'&&x[1]===sample.clip),'audible preview of new voice');
ctx.saveFails=true;
assert.equal(api.confirmEvolutionDraft(),false,'failed save cannot evolve');
assert.equal(ctx.roster[0].evolutionVoices.length,0,'failed save retains original');
assert.ok(api.getDraft(),'failed save keeps draft for retry');
ctx.saveFails=false;assert.equal(api.confirmEvolutionDraft(),true,'explicit confirmation commits');
assert.equal(ctx.roster[0].evolutionVoices.length,1,'one additional voice saved');
assert.equal(ctx.roster[0].stats[0],43,'stats changed only after confirmation');
assert.equal($('evolutionDialog').hidden,true);
ctx.cur.level=20;api.updateEvolutionUI();assert.equal($('evolveBtn').disabled,false,'Lv20 permits second voice');
api.openEvolutionDialog();api.setDraft({...sample});api.retryEvolutionDraft();
assert.equal(api.getDraft(),null,'retake discards current draft');assert.ok(calls.filter(x=>x==='capture:evolve').length>=2);
api.setDraft(sample);api.cancelEvolutionDialog();
assert.equal(api.getDraft(),null,'cancel discards draft');assert.equal(ctx.roster[0].evolutionVoices.length,1,'cancel cannot progress stats');
ctx.cur={...ctx.cur,seed:777};assert.equal(api.openEvolutionDialog(),false,'unsaved character cannot evolve');
console.log('EVOLUTION FLOW v140 PASS | Lv10 eligibility, record/preview/retake/confirm, save rollback, cancellation and stale guards');
