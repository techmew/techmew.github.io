/* WILD RECLAIM: immutable roster generation and permanent-death persistence. */
(function(){
"use strict";
const KEY="wild-reclaim-squad-v1",DEAD="wild-reclaim-dead-ids-v1",RESET_NEW_WORLD="wild-reclaim-explicit-new-world-v1",RELEASED="wild-reclaim-released-ids-v1";
// Exactly one active animal + up to two reserves. Preserve all four/five pre-change animals until natural vacancies.
const MAX_OWNED=3,LEGACY_OWNED=5;
const japan=["cat","dog","fox","wolf","deer","boar","crow","pigeon","otter","carp","tanuki","badger","macaque","blackBear","serow"];
const world=["manul","tibetanFox","shoebill","lion","tiger","cheetah","elephant","hippo","gorilla","giraffe","zebra","hyena","wildDog","armadillo","hedgehog"];
const names={cat:"猫",dog:"犬",fox:"狐",wolf:"狼",deer:"鹿",boar:"猪",crow:"カラス",pigeon:"ハト",otter:"カワウソ",carp:"コイ",tanuki:"タヌキ",badger:"アナグマ",macaque:"ニホンザル",blackBear:"ツキノワグマ",serow:"ニホンカモシカ",manul:"マヌルネコ",tibetanFox:"チベットスナギツネ",shoebill:"ハシビロコウ",lion:"ライオン",tiger:"トラ",cheetah:"チーター",elephant:"ゾウ",hippo:"カバ",gorilla:"ゴリラ",giraffe:"キリン",zebra:"シマウマ",hyena:"ハイエナ",wildDog:"リカオン",armadillo:"アルマジロ",hedgehog:"ハリネズミ"};
const playable=new Set(["cat","dog","fox","wolf","deer","boar","manul","tibetanFox","shoebill"]);
// Never award a permanent party slot to an animal that cannot become the player.
const rare=new Set(["manul","tibetanFox","shoebill","blackBear","serow","cheetah","hippo","gorilla","hyena","wildDog","armadillo","hedgehog"]);
const legendary=new Set(["lion","tiger","elephant","giraffe"]);
const nameHeads=["アオ","アカ","アキ","アサ","アズ","アメ","イチ","ウタ","ウメ","エン","オト","カイ","カゲ","カナ","キク","キナ","キリ","クウ","クマ","クロ","ケイ","ココ","コタ","コハ","サク","サチ","シオ","シズ","シロ","スイ","スズ","セナ","ソラ","タケ","タマ","チカ","チヨ","ツキ","トキ","ナギ","ナツ","ナナ","ニコ","ネネ","ノア","ハク","ハナ","ハル","ヒナ","フウ","フク","ホシ","マオ","マル","ミオ","ミケ","ミナ","ムギ","メイ","モカ","モモ","ヤマ","ユキ","ユズ","ヨル","ライ","ララ","リク","リン","ルナ","レオ","レン","ロク","ワカ","ワタ","ワビ","ワン","コウ","ゴン","シン","ジン","ダイ","テン","トラ","バク","ヒメ","ボン","ミツ","ユウ","リオ","ルイ","レイ","ロア","キヨ","サラ","タロ","ジロ","ポン","ペコ","ピノ","チビ","ミミ"];
const nameTails=["マル","タロウ","スケ","ノスケ","ヒメ","コ","ミ","キチ","ゾウ","リン","ニャン"];
const famousAnimalNames=["ポチ","タマ","ミケ","クロ","シロ","ハチ","ラッシー","レオ","シンバ","ムファサ","バルー","バンビ","ダンボ","トニー","ティガー","プー","スヌーピー","ガーフィールド","トム","ジェリー","ドラ","ジジ","ニャース","ピカ","ルドルフ","パトラッシュ","ジョリィ","ラスカル","ゴン","チロ","モモ","コロ","マロン","チャチャ","コタロー","ハナ","サクラ","ユキ","ソラ"];
const NAME_POOL=[...new Set([...famousAnimalNames,...nameHeads,...nameHeads.flatMap(h=>nameTails.map(t=>h+t))])];
function randomName(){return NAME_POOL[Math.floor(Math.random()*NAME_POOL.length)];}
const traits=["俊足","粘り強い","急所狙い","警戒心","夜目","隠密","回復上手","強靭"];
const personalities=["慎重","大胆","好奇心旺盛","温厚","気難しい","協調的"];
const growth=["早熟","標準","大器晩成"];
const rand=(a,b)=>a+Math.random()*(b-a);
const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k))??f}catch(_){return f}};
const dead=()=>new Set(read(DEAD,[]));
const saveDead=s=>localStorage.setItem(DEAD,JSON.stringify([...s]));
const released=()=>new Set(read(RELEASED,[]));
// Wild archive is an independent permanent ownership exclusion journal. A stale
// checkpoint or a missing release tombstone must not reclaim a wild veteran.
const excluded=()=>{
 const ids=new Set([...dead(),...released()]);
 const archive=read("wild-reclaim-released-archive-v1",[]);
 if(Array.isArray(archive))for(const animal of archive)if(typeof animal?.id==="string"&&animal.id)ids.add(animal.id);
 return ids;
};
const saveReleased=s=>localStorage.setItem(RELEASED,JSON.stringify([...s]));
const rarity=s=>legendary.has(s)?"legendary":rare.has(s)?"rare":"basic";
const unlock=(s,year=0,explored=0)=>rarity(s)==="basic"||rarity(s)==="rare"&&(year>=7||explored>=8)||year>=34||explored>=35;
function rollSpecies(year=0,explored=0){
 const pool=[...japan,...world].filter(s=>playable.has(s)&&unlock(s,year,explored));
 const groups={basic:[],rare:[],legendary:[]};pool.forEach(s=>groups[rarity(s)].push(s));
 const weights=[["basic",.65],["rare",.30],["legendary",.05]].filter(([k])=>groups[k].length);
 const total=weights.reduce((n,[,v])=>n+v,0);let n=Math.random()*total;
 let tier=weights[weights.length-1][0];for(const [k,v] of weights){n-=v;if(n<=0){tier=k;break}}
 const list=groups[tier];return list[Math.floor(Math.random()*list.length)];
}
function generate(year=0,explored=0,poorStreak=0){
 const species=rollSpecies(year,explored);
 // Low-grade streaks improve the actual rolled individual, not merely its displayed grade.
 // Probability rises gradually and is capped; there is no guaranteed S-grade ceiling.
 const streak=Math.max(0,Math.min(12,Math.floor(Number(poorStreak)||0)));
 const lucky=Math.random()<Math.min(.36,streak*.03);
 const iv=Object.fromEntries(["hp","attack","speed","stamina"].map(k=>[k,Math.round(rand(lucky?.88:.6,1.4)*100)/100]));
 const avg=Object.values(iv).reduce((a,b)=>a+b,0)/4;
 const score=avg;const grade=score>=1.22?"S":score>=1.10?"A":score>=.97?"B":score>=.84?"C":"D";
 const abilities=Array.from({length:Math.floor(rand(0,3))},()=>traits[Math.floor(rand(0,traits.length))]).filter((v,i,a)=>a.indexOf(v)===i);
 const id=globalThis.crypto?.randomUUID?.()||"wr-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2);
 return {id,species,speciesName:names[species],rarity:rarity(species),sex:Math.random()<.5?"オス":"メス",age:Math.random()<.45?"若い":"成体",personality:personalities[Math.floor(rand(0,personalities.length))],name:randomName(),iv,growthType:growth[Math.floor(rand(0,3))],growthRate:Math.round(rand(.75,1.25)*100)/100,grade,abilities,level:1,xp:0,hpRatio:1,alive:true};
}
function assignSlots(members){
 // Existing four- or five-animal rosters are grandfathered: never delete a living individual.
 // When deaths leave three or fewer, compact the survivors into normal three-slot ownership.
 const limit=members.length>MAX_OWNED?LEGACY_OWNED:MAX_OWNED;
 const slots=Array.from({length:limit},(_,i)=>i),used=new Set();
 return members.map(m=>{
  const slot=Number.isInteger(m.slotIndex)&&slots.includes(m.slotIndex)&&!used.has(m.slotIndex)?
   m.slotIndex:slots.find(i=>!used.has(i));
  used.add(slot);return {...m,slotIndex:slot};
 }).sort((a,b)=>a.slotIndex-b.slotIndex);
}
function targetSlot(member,members){
 const occupied=new Set(members.map(m=>m.slotIndex));
 const i=Number.isInteger(member?.slotIndex)?member.slotIndex:
  Array.from({length:MAX_OWNED},(_,n)=>n).find(n=>!occupied.has(n));
 return i>=0&&i<MAX_OWNED&&!occupied.has(i)?i:null;
}
function load(){const v=read(KEY,null);if(!v||v.version!==1)return null;const d=excluded(),seen=new Set();const members=assignSlots((Array.isArray(v.members)?v.members:[]).filter(x=>{if(!x?.id||d.has(x.id)||x.alive===false||seen.has(x.id))return false;seen.add(x.id);return true}).slice(0,5));return {...v,members,leaderId:members.some(m=>m.id===v.leaderId)?v.leaderId:members[0]?.id||null}}
function save(roster,explicitLeaderSelection=false,explicitGachaAdoption=false){const d=excluded(),seen=new Set();const requested=Array.isArray(roster?.members)?roster.members:[];
 // Stale autosaves must not silently discard living legacy 4/5-member owners.
 // Death and release tombstones remain authoritative, so genuine departures stay permanent.
 const prior=read(KEY,null),protectedLiving=prior?.version===1&&Array.isArray(prior.members)?prior.members.filter(m=>m?.id&&!d.has(m.id)&&m.alive!==false):[];
 const combined=requested.slice();
 for(const member of protectedLiving)if(!combined.some(m=>m?.id===member.id))combined.push(member);
 const members=assignSlots(combined.filter(x=>{if(!x?.id||d.has(x.id)||x.alive===false||seen.has(x.id))return false;seen.add(x.id);return true}).slice(0,5));
 // Older autosaves must not undo a newer, explicitly selected leader.
 // A fresh selectActive() uses load() and therefore carries the current updatedAt.
 const staleLeader=!explicitLeaderSelection&&prior?.version===1&&Number.isFinite(prior.updatedAt)&&(!Number.isFinite(roster.updatedAt)||roster.updatedAt<=prior.updatedAt);
 const requestedLeader=staleLeader?prior.leaderId:roster.leaderId;
 // Only confirmed, durably saved adoptions may change the pity counter.
 const gachaPoorStreak=clampPoorStreak(explicitGachaAdoption&&Number.isFinite(roster?.gachaPoorStreak)?roster.gachaPoorStreak:
  Number.isFinite(prior?.gachaPoorStreak)?prior.gachaPoorStreak:read(STREAK_KEY,0));
 const v={version:1,members,leaderId:members.some(x=>x.id===requestedLeader)?requestedLeader:members[0]?.id||null,sharedXp:Math.max(0,roster.sharedXp||0),gachaTickets:Math.min(999,Math.max(0,roster.gachaTickets||0)),ticketMilestone:Math.max(0,Math.floor(roster.ticketMilestone||0)),gachaPoorStreak,startPosition:roster.startPosition||read(KEY,null)?.startPosition||null,pendingStart:!!roster.pendingStart,newWorldOnStart:!!roster.newWorldOnStart,updatedAt:Math.max(Date.now(),(Number.isFinite(prior?.updatedAt)?prior.updatedAt:0)+1)};localStorage.setItem(KEY,JSON.stringify(v));return v}
// Selection is persisted before the renderer is notified; stock animals never spawn as AI.
function selectActive(id){
 const roster=load();
 if(!roster?.members?.some(m=>m.id===id))return {ok:false,reason:"操作できる生存個体がありません"};
 if(roster.leaderId===id)return {ok:true,roster};
 roster.leaderId=id;
 // A failed or non-persistent write must never launch the previously selected animal.
 try{
  const saved=save(roster,true);
  const verified=load();
  if(!verified?.members?.some(m=>m.id===id)||verified.leaderId!==id)
   return {ok:false,reason:"操作個体の選択を保存できません。空き容量を確認して再試行してください"};
  return {ok:true,roster:verified};
 }catch(_){
  return {ok:false,reason:"操作個体の選択を保存できません。空き容量を確認して再試行してください"};
 }
}
// Persist the death tombstone before modifying the roster. A stale autosave
// cannot reintroduce the individual, even when the active character dies.
function kill(id){
 if(!id)return load();
 // A death tombstone is committed first. Even if saving the roster fails,
 // load() will filter the deceased ID from every older snapshot.
 const d=dead();d.add(id);saveDead(d);
 // A silently ignored storage write must not be treated as permanent death.
 if(!dead().has(id))throw Error("死亡個体の永久保存に失敗しました。端末の保存容量を確認してください");
 const roster=load();
 if(!roster)return null;
 // The permanent death ID is already stored. A quota failure on the roster
 // snapshot must not interrupt death handling or resurrect this animal.
 let saved;
 try{saved=save(roster);}catch(_){saved=load();}
 if(!saved)return null;
 // An empty roster returns to gacha even when the snapshot cannot be written.
 if(!saved.members.length&&saved.pendingStart){
  saved.pendingStart=false;
  try{return save(saved);}catch(_){return saved;}
 }
 return saved;
}
// Verify adoption survives a storage read; silent localStorage failures must not start a ghost roster.
function saveVerified(roster,requiredIds,explicitGachaAdoption=false){
 const saved=save(roster,false,explicitGachaAdoption),verified=load();
 if(!verified||verified.leaderId!==saved.leaderId||verified.members.length!==saved.members.length||
    requiredIds.some(id=>!verified.members.some(m=>m.id===id))||
    (explicitGachaAdoption&&verified.gachaPoorStreak!==saved.gachaPoorStreak))
  throw Error("個体データを保存できません。端末の保存容量を確認して再試行してください");
 return verified;
}
function newSquad(members,leaderId){
 // The title UI is not a security boundary: never erase living animals via a stale dialog.
 const existing=load();
 if(existing?.members?.length)throw Error("生存中の編成は破棄できません。空き枠は巣で補充してください");
 if(!Array.isArray(members)||members.length<1||members.length>MAX_OWNED||
    members.some(m=>!m?.id||!playable.has(m.species)||m.alive===false||excluded().has(m.id))||
    new Set(members.map(m=>m.id)).size!==members.length)
   throw Error("所有は操作中1体＋ストック2体の合計最大3体です。重複・死亡個体は禁止");
 if(!members.some(m=>m.id===leaderId))throw Error("操作するリーダーを選択してください");
 return saveVerified({members,leaderId,sharedXp:0,gachaTickets:0,ticketMilestone:0,
  gachaPoorStreak:members.reduce((n,m)=>adoptedPoorStreak(n,m),load()?.gachaPoorStreak??read(STREAK_KEY,0)),
  pendingStart:true,newWorldOnStart:localStorage.getItem(RESET_NEW_WORLD)==="1"||!read("wild-reclaim-world-chronicle-v1",null)},members.map(m=>m.id),true);
}
function addXp(amount){
 const r=load();if(!r)return null;
 const earned=Number.isFinite(amount)?Math.max(0,Math.min(1000000,amount)):0;
 const previousMilestone=Math.max(0,Math.floor(r.ticketMilestone??(r.sharedXp||0)/600));
 r.sharedXp+=earned;
 // Every 600 shared XP earned through gameplay grants one vacancy-only draw.
 const nextMilestone=Math.floor(r.sharedXp/600);
 if(nextMilestone>previousMilestone)r.gachaTickets=Math.min(999,(r.gachaTickets||0)+nextMilestone-previousMilestone);
 r.ticketMilestone=Math.max(previousMilestone,nextMilestone);
 for(const m of r.members){
  const rate=Number.isFinite(m.growthRate)?Math.max(.5,Math.min(1.5,m.growthRate)):1;
  // Split a large shared-XP reward at growth-phase boundaries. A late-bloomer
  // crossing Lv12 must receive its faster mature growth for the remaining XP.
  m.level=Math.max(1,Math.min(100,Math.floor(Number(m.level)||1)));
  m.xp=Math.max(0,Number(m.xp)||0);
  let remaining=earned;
  while(remaining>0&&m.level<100){
   const phase=m.growthType==="大器晩成"?(m.level<12?.72:1.28):m.growthType==="早熟"?(m.level<12?1.2:.85):1;
   const multiplier=rate*phase,needed=Math.max(0,m.level*100-m.xp);
   if(needed===0){m.level++;m.xp=0;continue;}
   const spent=Math.min(remaining,needed/multiplier);
   m.xp+=spent*multiplier;remaining-=spent;
   if(m.xp>=m.level*100-1e-8){m.xp=0;m.level++;}
   else break;
  }
  if(m.level>=100){m.level=100;m.xp=0;}
 }
 return save(r);
}
// Tickets are earned in gameplay, never purchased. Only vacant slots can consume them.
function grantTickets(amount=1){
 const r=load();if(!r)return null;
 const n=Number.isSafeInteger(amount)?Math.max(0,Math.min(100,amount)):0;
 r.gachaTickets=Math.min(999,Math.max(0,r.gachaTickets||0)+n);
 return save(r);
}
function fillVacancy(member){
 const r=load();if(!r||!Array.isArray(r.members)||r.members.length>=MAX_OWNED)return {ok:false,reason:"空き枠がありません"};
 // Legacy 4/5-member saves must shrink naturally; a stale vacancy dialog
 // cannot bypass the three-owner cap or spend tickets on a protected roster.
 if(r.members.some(m=>!m?.id||excluded().has(m.id)))return {ok:false,reason:"所有データを再読み込みしてください"};
 if(!member||!member.id||!playable.has(member.species)||member.alive===false||excluded().has(member.id)||r.members.some(m=>m.id===member.id))return {ok:false,reason:"無効な個体です"};
 if((r.gachaTickets||0)<1)return {ok:false,reason:"ガチャ権が不足しています"};
 const slot=targetSlot(member,r.members);if(slot===null)return {ok:false,reason:"指定枠にはすでに動物がいます"};
 r.members.push({...member,slotIndex:slot,alive:true});r.gachaTickets-=1;
 r.gachaPoorStreak=adoptedPoorStreak(r.gachaPoorStreak??read(STREAK_KEY,0),member);
 // A ticket is spent only when the new owner and reduced ticket balance
 // are durably stored together. Storage failures must not report adoption.
 try{
  const saved=save(r,false,true);
  const verified=load();
  if(!verified?.members?.some(m=>m.id===member.id)||verified.gachaTickets!==saved.gachaTickets||verified.gachaPoorStreak!==saved.gachaPoorStreak)
   return {ok:false,reason:"ガチャ結果を保存できません。空き容量を確認して再試行してください"};
  return {ok:true,roster:verified};
 }catch(_){return {ok:false,reason:"ガチャ結果を保存できません。空き容量を確認して再試行してください"};}
}
function release(id){
 const roster=load(),member=roster?.members?.find(m=>m.id===id);
 if(!member)return {ok:false,reason:"その個体はすでに所有一覧にいません"};
 // Queue the original individual for a strong, personality-driven wild encounter.
 // Tombstones prevent old autosaves and checkpoints from re-owning released IDs.
 const key="wild-reclaim-released-v1",archiveKey="wild-reclaim-released-archive-v1",pending=read(key,[]);
 const priorArchive=read(archiveKey,[]);
 const archive=Array.isArray(priorArchive)?priorArchive.filter(m=>m?.id!==id):[];
 const queue=Array.isArray(pending)?pending.filter(m=>m?.id!==id):[];
 queue.push({...member,releasedAt:Date.now()});
 try{
  // Keep the wild identity in both the encounter queue and the permanent
  // archive before excluding it from ownership. Queue corruption or a stale
  // autosave must not erase the released animal from the world.
  archive.push({...member,releasedAt:Date.now()});
  localStorage.setItem(archiveKey,JSON.stringify(archive));
  if(!Array.isArray(read(archiveKey,null))||!read(archiveKey,[]).some(x=>x?.id===id&&x.name===member.name&&x.species===member.species))
   throw Error("野生個体の永久記録を保存できません");
  localStorage.setItem(key,JSON.stringify(queue));
  // A storage shim may silently drop writes: never tombstone an individual
  // unless its wild identity has actually been persisted first.
  const queued=read(key,[]);
  if(!Array.isArray(queued)||queued.filter(x=>x?.id===id).length!==1||
     !queued.some(x=>x.id===id&&x.name===member.name&&x.species===member.species))
   throw Error("野生出現キューの保存を確認できません");
  try{
   const blocked=released();blocked.add(id);saveReleased(blocked);
   if(!released().has(id))throw Error("永久離脱IDの保存を確認できません");
  }catch(error){
   try{localStorage.setItem(key,JSON.stringify(pending));localStorage.setItem(archiveKey,JSON.stringify(priorArchive));}catch(_){}
   throw error;
  }
  const survivors=roster.members.filter(m=>m.id!==id);
  const leaderId=roster.leaderId===id?(survivors[0]?.id||null):roster.leaderId;
  // The permanent exclusion ID is already committed. If the roster write fails,
  // the old snapshot is filtered by load(); report the actual released state.
  let saved;
  try{saved=save({...roster,members:survivors,leaderId,pendingStart:survivors.length?roster.pendingStart:false});}
  catch(_){saved=load();}
  return {ok:true,roster:saved,released:member,newLeaderId:saved?.leaderId||null};
 }catch(_){
  if(!released().has(id)){
   try{localStorage.setItem(key,JSON.stringify(pending));localStorage.setItem(archiveKey,JSON.stringify(priorArchive));}catch(_){}
  }
  return {ok:false,reason:"野生への放流を保存できません。端末の保存容量を確認してください"};
 }
}
function resetForNewGame(){
 // A new world is explicit, but a failed storage operation must never erase
 // the roster or permit its old identities to reappear from a checkpoint.
 const r=load(),ids=r?.members?.map(m=>m.id)||[];
 const d=dead();ids.forEach(id=>d.add(id));
 try{
  if(ids.length){
   saveDead(d);
   if(ids.some(id=>!dead().has(id)))throw Error("永久離脱IDの保存に失敗しました");
  }
  localStorage.setItem(RESET_NEW_WORLD,"1");
  if(localStorage.getItem(RESET_NEW_WORLD)!=="1")throw Error("新世界開始状態を保存できません");
  localStorage.removeItem(KEY);
  if(localStorage.getItem(KEY)!==null)throw Error("旧編成を削除できません");
  return true;
 }catch(error){
  // Never roll back verified tombstones: a partial reset must not resurrect IDs.
  // A failed reset remains an explicit error rather than reporting success.
  throw Error("新世界の初期化を保存できません。空き容量を確認してください: "+error.message);
 }
}
function addInitialSlot(member){
 const r=load();if(!r?.pendingStart||r.members.length>=MAX_OWNED)return {ok:false,reason:"新規編成中の空き枠ではありません"};
 if(!member?.id||!playable.has(member.species)||member.alive===false||excluded().has(member.id)||r.members.some(m=>m.id===member.id))return {ok:false,reason:"無効な個体です"};
 const slot=targetSlot(member,r.members);if(slot===null)return {ok:false,reason:"指定枠にはすでに動物がいます"};
 r.members.push({...member,slotIndex:slot,alive:true});
 r.gachaPoorStreak=adoptedPoorStreak(r.gachaPoorStreak??read(STREAK_KEY,0),member);
 try{return {ok:true,roster:saveVerified(r,r.members.map(m=>m.id),true)};}
 catch(_){return {ok:false,reason:"新規個体の保存に失敗しました。空き容量を確認して再試行してください"};}
}
function markStarted(){
 const r=load();if(!r)return null;
 r.pendingStart=false;r.newWorldOnStart=false;
 const saved=saveVerified(r,r.members.map(m=>m.id));
 if(saved.pendingStart||saved.newWorldOnStart)throw Error("開始状態の保存に失敗しました");
 // Only clear the reset marker after the new-world roster is durable.
 localStorage.removeItem(RESET_NEW_WORLD);
 return saved;
}
function livingCount(){return load()?.members?.length||0}
// Keep the low-grade pity counter across separate gacha sessions and reloads.
// It advances only when the player adopts an individual, not when rerolling.
const STREAK_KEY="wild-reclaim-gacha-poor-streak-v1";
const clampPoorStreak=n=>Math.max(0,Math.min(12,Math.floor(Number(n)||0)));
const adoptedPoorStreak=(count,member)=>["C","D"].includes(member?.grade)?Math.min(12,clampPoorStreak(count)+1):0;
function drawSlot(year,explored,poorStreak=0){
 const options=[];
 let adoptedId=null;
 const persistent=clampPoorStreak(load()?.gachaPoorStreak??read(STREAK_KEY,0));
 const effectiveStreak=Math.max(persistent,Math.max(0,Math.min(12,Math.floor(Number(poorStreak)||0))));
 return {
  roll(){if(adoptedId!==null)throw Error("採用確定後は引き直しできません");if(options.length>=4)throw Error("引き直しは3回まで");const candidate=generate(year,explored,effectiveStreak);options.push(candidate);return candidate},
  choose(id){
   const found=options.find(x=>x.id===id);
   if(!found)throw Error("抽選外の個体");
   // Adoption is final for this draw: repeated UI events must not swap the
   // selected animal after its grade has already updated the pity counter.
   if(adoptedId!==null){
    if(adoptedId!==id)throw Error("採用済みの個体は変更できません");
    return found;
   }
   // A draw selection remains tentative until the roster and tickets are saved.
   adoptedId=id;
   return found;
  },
  get options(){return options.slice()}
 };
}
window.WildSquad={japan,world,names,NAME_POOL,randomName,playable,canLead:s=>playable.has(s),rollSpecies,generate,drawSlot,load,save,kill,selectActive,newSquad,addXp,grantTickets,fillVacancy,addInitialSlot,markStarted,release,resetForNewGame,livingCount,rarity,MAX_OWNED,LEGACY_OWNED,KEY,DEAD,RELEASED};
})();