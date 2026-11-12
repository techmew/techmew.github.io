/* WILD RECLAIM: portable, local-only game save backup and guarded restore. */
(()=>{"use strict";
const PREFIX="wild-reclaim-", DISASTER_KEY="wild_reclaim_disasters_v1",FORMAT="WILD_RECLAIM_BACKUP_V1",MAX_BYTES=16*1024*1024;
const $=id=>document.getElementById(id), keyOk=k=>typeof k==="string"&&k.length<200&&(k.startsWith(PREFIX)||k===DISASTER_KEY);
const status=(message,error=false)=>{const el=$("save-backup-status");if(el){el.textContent=message;el.dataset.error=error?"true":"false";}};
function snapshot(){
 const records=Object.create(null);
 for(let i=0;i<localStorage.length;i++){
  const k=localStorage.key(i);
  if(keyOk(k))records[k]=localStorage.getItem(k);
 }
 return records;
}
function digest(records){
 // Lightweight corruption check, not a security signature.
 let hash=2166136261>>>0;
 for(const key of Object.keys(records).sort()){
  const s=key+"\u0000"+records[key]+"\u0001";
  for(let i=0;i<s.length;i++){hash^=s.charCodeAt(i);hash=Math.imul(hash,16777619)>>>0;}
 }
 return hash.toString(16).padStart(8,"0");
}
function buildBackup(){
 const records=snapshot();
 if(!Object.keys(records).length)throw Error("このブラウザにバックアップ対象のゲームデータがありません");
 // A second read catches concurrent tab writes while collecting a multi-key backup.
 const verified=snapshot();
 if(Object.keys(records).length!==Object.keys(verified).length||Object.keys(records).some(key=>verified[key]!==records[key]))
  throw Error("別タブで保存内容が更新されました。最新の画面でバックアップをやり直してください");
 const backup={format:FORMAT,version:1,createdAt:new Date().toISOString(),game:"WILD RECLAIM",origin:location.origin,records,checksum:digest(records)};
 // Do not download a backup that the restore path would reject (broken death IDs,
 // boss roster, world save, etc.). This avoids giving players false safety.
 validate(backup);
 return backup;
}
function exportBackup(){
 try{
  const backup=buildBackup();
  const data=JSON.stringify(backup);
  // Recheck after JSON serialization: another tab may have saved while the
  // potentially large backup string was being assembled.
  const latest=snapshot();
  if(digest(latest)!==backup.checksum||Object.keys(latest).length!==Object.keys(backup.records).length)
   throw Error("バックアップ作成中に別タブで保存内容が変わりました。もう一度実行してください");
  // Never offer a backup that this same importer would reject as oversized.
  const bytes=new Blob([data],{type:"application/json;charset=utf-8"}).size;
  if(bytes>MAX_BYTES)throw Error("バックアップが16MBを超えています。保存データの容量を確認してください");
  const blob=new Blob([data],{type:"application/json;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a"),when=new Date();
  const timestamp=[when.getFullYear(),String(when.getMonth()+1).padStart(2,"0"),String(when.getDate()).padStart(2,"0")].join("")+"-"+[when.getHours(),when.getMinutes()].map(v=>String(v).padStart(2,"0")).join("");
  a.href=url;a.download="WILD_RECLAIM_BACKUP_"+timestamp+".json";a.style.display="none";
  document.body.append(a);a.click();a.remove();
  // Android download managers may consume the blob URL after the click handler returns.
  // Keep it alive long enough for the browser to begin copying the JSON file.
  setTimeout(()=>URL.revokeObjectURL(url),120000);
  status("バックアップのダウンロードを開始しました。端末の「ダウンロード」にJSONファイルが保存されたことを確認してください。");
 }catch(error){status("バックアップ作成失敗："+(error?.message||"ブラウザの保存設定を確認してください"),true);}
}
function jsonArray(raw){
 try{const v=JSON.parse(raw||"[]");return Array.isArray(v)?v:[]}catch(_){return []}
}
function mergeIds(records,key,older){
 const incoming=jsonArray(records[key]);
 const values=[...new Set([...incoming,...jsonArray(older[key])].filter(id=>typeof id==="string"&&id.length>0&&id.length<=240))];
 // Never remove a death or release marker from this device via an older backup.
 if(values.length||Object.prototype.hasOwnProperty.call(records,key)||older[key]!=null)records[key]=JSON.stringify(values);
}
function mergeArchive(records,key,older){
 const map=new Map();
 for(const entry of [...jsonArray(older[key]),...jsonArray(records[key])]){
  if(entry&&typeof entry.id==="string"&&entry.id&&entry.id.length<=240){
   const prior=map.get(entry.id);
   map.set(entry.id,prior?{...entry,...prior}:entry);
  }
 }
 if(map.size)records[key]=JSON.stringify([...map.values()]);
}
function readCaveSeal(raw){
 if(raw==null)return null;
 let state;
 try{state=JSON.parse(raw);}catch(_){throw Error("洞窟の封印記録が破損しています");}
 if(!state||state.version!==1||!["sealed","released","defeated"].includes(state.stage)||
    (state.stage!=="sealed"&&(!Number.isFinite(state.openedYear)||state.openedYear<0))||
    (state.stage==="defeated"&&(!Number.isFinite(state.defeatedYear)||state.defeatedYear<state.openedYear)))
  throw Error("洞窟の封印記録の形式が不正です");
 return state;
}
function mergeCaveSeal(records,older){
 const key="wild-reclaim-cave-seal-v1";
 // This is an irreversible world event like death/release: an earlier JSON
 // backup must not relock a seal or resurrect a defeated guardian.
 const imported=readCaveSeal(records[key]),current=readCaveSeal(older[key]);
 if(!imported&&!current)return;
 const rank={sealed:0,released:1,defeated:2};
 const chosen=imported&&(!current||rank[imported.stage]>rank[current.stage])?imported:current;
 if(chosen)records[key]=JSON.stringify(chosen);
}
function readBossIds(raw,key){
 if(raw==null)return [];
 let ids;try{ids=JSON.parse(raw)}catch(_){throw Error("ボス永久IDの記録が破損: "+key)}
 if(!Array.isArray(ids)||ids.some(x=>typeof x!=="string"||!x||x.length>240))
  throw Error("ボス永久IDの形式が不正: "+key);
 return ids;
}
function readBossRoster(raw){
 if(raw==null)return null;
 let r;try{r=JSON.parse(raw)}catch(_){throw Error("ボス編成のJSONが破損しています")}
 if(!r||r.version!==1||!Array.isArray(r.members)||r.members.length>3||
  r.members.some(m=>!m||typeof m.id!=="string"||!m.id||m.id.length>240||
   typeof m.type!=="string"||!m.type||m.type.length>64)||
  (r.activeId!=null&&typeof r.activeId!=="string"))
  throw Error("ボスの専用3枠データが不正です");
 return r;
}
function mergeBossRoster(records,older){
 const deadKey="wild-reclaim-boss-dead-v1",retiredKey="wild-reclaim-boss-retired-v1",
 claimedKey="wild-reclaim-boss-claimed-v1",key="wild-reclaim-boss-roster-v1";
 for(const idKey of [deadKey,retiredKey,claimedKey]){
  const union=[...new Set([...readBossIds(records[idKey],idKey),...readBossIds(older[idKey],idKey)])];
  if(union.length||records[idKey]!=null||older[idKey]!=null)records[idKey]=JSON.stringify(union);
 }
 const incoming=readBossRoster(records[key]),current=readBossRoster(older[key]);
 if(!incoming&&!current)return;
 const forbidden=new Set([...readBossIds(records[deadKey],deadKey),...readBossIds(records[retiredKey],retiredKey)]);
 const members=[],used=new Set();
 // Current-owned live bosses have priority; importing an old backup must not
 // remove newly recruited bosses or resurrect dead/replaced boss IDs.
 for(const state of [current,incoming])for(const m of state?.members||[]){
  if(forbidden.has(m.id)||used.has(m.id)||members.length>=3)continue;
  members.push(m);used.add(m.id);
 }
 const activeId=[current?.activeId,incoming?.activeId].find(id=>members.some(m=>m.id===id))||null;
 const updatedAt=Math.max(Number(current?.updatedAt)||0,Number(incoming?.updatedAt)||0)+1;
 records[key]=JSON.stringify({version:1,members,activeId,updatedAt});
}
function readWorldEnd(raw){
 if(raw==null)return null;
 let value;try{value=JSON.parse(raw)}catch(_){throw Error("この世の終わりの保存記録が破損しています")}
 if(!value||value.version!==1||!["dormant","active","defeated"].includes(value.stage)||
   (value.stage!=="dormant"&&(!Number.isFinite(value.year)||value.year<100||
    !Number.isFinite(value.x)||!Number.isFinite(value.y)))||
   (value.stage==="defeated"&&(!Number.isFinite(value.defeatedYear)||value.defeatedYear<100)))
  throw Error("この世の終わりの保存形式が不正です");
 return value;
}
function mergeWorldEnd(records,current){
 const key="wild-reclaim-world-end-v1";
 const incoming=readWorldEnd(records[key]),prior=readWorldEnd(current[key]);
 if(!incoming&&!prior)return;
 const rank={dormant:0,active:1,defeated:2};
 const choose=incoming&&(!prior||rank[incoming.stage]>rank[prior.stage])?incoming:prior;
 if(!choose)return;
 const next={...choose};
 // Old-world reloads cannot heal an already wounded active 100-year boss.
 if(incoming?.stage==="active"&&prior?.stage==="active")
  next.hp=Math.min(Number(incoming.hp)||3600,Number(prior.hp)||3600);
 records[key]=JSON.stringify(next);
}
function validate(file){
 if(!file||typeof file!=="object"||file.format!==FORMAT||file.version!==1)throw Error("WILD RECLAIMのバックアップファイルではありません");
 const data=file.records;
 if(!data||Array.isArray(data)||typeof data!=="object")throw Error("保存データの形式が不正です");
 const entries=Object.entries(data);
 if(!entries.length||entries.length>500||entries.some(([k,v])=>!keyOk(k)||typeof v!=="string"))throw Error("保存キーの形式が不正です");
 if(digest(data)!==file.checksum)throw Error("ファイルの整合性チェックに失敗しました");
 // Never silently interpret a corrupted permanent exclusion journal as empty.
 for(const key of ["wild-reclaim-dead-ids-v1","wild-reclaim-released-ids-v1"]){
  if(data[key]==null)continue;
  let ids;try{ids=JSON.parse(data[key]);}catch(_){throw Error("永久離脱IDのJSONが破損しています："+key);}
  if(!Array.isArray(ids)||ids.some(id=>typeof id!=="string"||!id||id.length>240))
   throw Error("永久離脱IDの形式が不正です："+key);
 }
 for(const key of ["wild-reclaim-released-archive-v1","wild-reclaim-released-v1"]){
  if(data[key]==null)continue;
  let archive;try{archive=JSON.parse(data[key]);}catch(_){throw Error("野生放流履歴のJSONが破損しています");}
  if(!Array.isArray(archive)||archive.some(entry=>!entry||typeof entry.id!=="string"||!entry.id||entry.id.length>240))
   throw Error("野生放流履歴の形式が不正です");
 }
 // Reject broken seal records before changing any local game keys.
 readCaveSeal(data["wild-reclaim-cave-seal-v1"]);
 // Never accept corrupt dedicated boss death/replacement journals or roster.
 for(const key of ["wild-reclaim-boss-dead-v1","wild-reclaim-boss-retired-v1","wild-reclaim-boss-claimed-v1"])readBossIds(data[key],key);
 readBossRoster(data["wild-reclaim-boss-roster-v1"]);
 readWorldEnd(data["wild-reclaim-world-end-v1"]);
 if(data["wild-reclaim-squad-v1"]!=null){
  const roster=JSON.parse(data["wild-reclaim-squad-v1"]);
  if(!roster||roster.version!==1||!Array.isArray(roster.members)||roster.members.length>5)throw Error("編成データが不正です");
 }
 if(data["wild-reclaim-autosave-v2"]!=null){
  const saved=JSON.parse(data["wild-reclaim-autosave-v2"]);
  if(!saved||saved.version!==2||!saved.player||!Number.isFinite(saved.elapsed))throw Error("セーブデータが不正です");
 }
 return Object.assign(Object.create(null),data);
}
// Capture local storage BEFORE opening the Android file picker, not after.
// Concurrent additions, edits and deaths must be detected on import.
let importBaseline=null;
async function importBackup(file,baseline=null){
 try{
  if(!file||file.size<=0||file.size>MAX_BYTES)throw Error("ファイルが空、または16MBを超えています");
  const jsonText=typeof file.text==="function"?await file.text():await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result||""));reader.onerror=()=>reject(reader.error||Error("ファイルを読み取れません"));reader.readAsText(file,"UTF-8");});
  const data=validate(JSON.parse(jsonText));
  if(!document.getElementById("menu")||document.getElementById("menu").classList.contains("hidden"))throw Error("読み込みはタイトル画面でのみ実行できます");
  const confirmed=window.confirm("バックアップを読み込むと現在のゲーム進行を置き換えます。\n現在のデータを先にバックアップしましたか？\n死亡・野生放流した個体の永久離脱は維持されます。");
  if(!confirmed){status("読み込みをキャンセルしました。");return}
  const before=baseline||snapshot(),merged=Object.assign(Object.create(null),data);
  // Never treat a corrupt local permanent-ID journal as an empty list.
  // An import must stop rather than silently resurrect a dead/released animal.
  for(const key of ["wild-reclaim-dead-ids-v1","wild-reclaim-released-ids-v1"]){
   if(before[key]==null)continue;
   let ids;
   try{ids=JSON.parse(before[key]);}catch(_){throw Error("端末の永久離脱IDが破損しています。復元前に現在のデータを保全してください："+key);}
   if(!Array.isArray(ids)||ids.some(id=>typeof id!=="string"||!id||id.length>240))
    throw Error("端末の永久離脱ID形式が不正です。読み込みを中止しました："+key);
  }
  for(const key of ["wild-reclaim-released-archive-v1","wild-reclaim-released-v1"]){
   if(before[key]==null)continue;
   let archive;
   try{archive=JSON.parse(before[key]);}catch(_){throw Error("端末の放流履歴が破損しています："+key);}
   if(!Array.isArray(archive)||archive.some(entry=>!entry||typeof entry.id!=="string"||!entry.id||entry.id.length>240))
    throw Error("端末の放流履歴形式が不正です："+key);
  }
  mergeCaveSeal(merged,before);
  mergeBossRoster(merged,before);
  mergeWorldEnd(merged,before);
  // Older JSON backups omitted the existing underscore-prefixed disaster
  // record. Retain its current data rather than deleting it on import.
  if(merged[DISASTER_KEY]==null&&before[DISASTER_KEY]!=null)merged[DISASTER_KEY]=before[DISASTER_KEY];
  mergeIds(merged,"wild-reclaim-dead-ids-v1",before);
  mergeIds(merged,"wild-reclaim-released-ids-v1",before);
  mergeArchive(merged,"wild-reclaim-released-archive-v1",before);
  // Restoring an older backup must not discard wild animals still awaiting
  // their first encounter. Preserve the current queue and de-duplicate by ID.
  mergeArchive(merged,"wild-reclaim-released-v1",before);
  // The archive is the permanent source of released identities; a queued
  // encounter must never be treated as an owned character after restore.
  mergeArchive(merged,"wild-reclaim-released-archive-v1",{
   "wild-reclaim-released-archive-v1":merged["wild-reclaim-released-v1"]
  });
  // Archive entries also prove permanent release even when an old save omitted the ID ledger.
  const releasedFromArchive=jsonArray(merged["wild-reclaim-released-archive-v1"])
   .map(entry=>entry?.id).filter(id=>typeof id==="string"&&id.length>0&&id.length<=240);
  if(releasedFromArchive.length){
   const released=new Set([...jsonArray(merged["wild-reclaim-released-ids-v1"]),...releasedFromArchive]);
   merged["wild-reclaim-released-ids-v1"]=JSON.stringify([...released]);
  }
  // A stale tab may have saved new death/release markers while the file picker
  // was open. Refuse to overwrite those markers with an older snapshot.
  const liveBeforeWrite=snapshot();
  for(const key of ["wild-reclaim-dead-ids-v1","wild-reclaim-released-ids-v1","wild-reclaim-released-archive-v1","wild-reclaim-released-v1"]){
   if(liveBeforeWrite[key]!==before[key])throw Error("別タブで永久離脱情報が更新されました。再読み込み後に復元してください："+key);
  }
  // A newly created key is also a concurrent edit, even if it was absent at picker open.
  for(const key of Object.keys(liveBeforeWrite)){
   if(!Object.prototype.hasOwnProperty.call(before,key))
    throw Error("別タブで新しいゲームデータが作成されました。読み込みをやり直してください："+key);
  }
  // An older browser tab can update progression while the file picker is open.
  // Do not overwrite ANY changed existing key, not only permanent-ID journals.
  // This also protects world clock, exploration and roster from stale restores.
  for(const [key,value] of Object.entries(before)){
   if(liveBeforeWrite[key]!==value)throw Error("別タブでゲームデータが更新されました。最新画面で読み込みをやり直してください："+key);
  }
  // A key created by another tab during the file-picker interval must not be overwritten by an older backup.
  for(const [key,value] of Object.entries(liveBeforeWrite)){
   if(!Object.prototype.hasOwnProperty.call(before,key)&&Object.prototype.hasOwnProperty.call(merged,key)&&merged[key]!==value)
    throw Error("別タブで新しいゲームデータが作成されました。読み込みをやり直してください："+key);
  }
  // Preserve unrelated new game keys rather than deleting another tab's work.
  for(const [key,value] of Object.entries(liveBeforeWrite)){
   if(!Object.prototype.hasOwnProperty.call(before,key)&&!Object.prototype.hasOwnProperty.call(merged,key))merged[key]=value;
  }
  // Old backups are allowed to restore progression, never to resurrect excluded IDs.
  const keysBefore=Object.keys(before),keysNext=Object.keys(merged);
  try{
   // Write/verify first; delete absent game keys only after the backup is complete.
   for(const key of keysNext){
    localStorage.setItem(key,merged[key]);
    if(localStorage.getItem(key)!==merged[key])throw Error("ブラウザ保存の検証に失敗："+key);
   }
   // Detect quota/eviction or concurrent-tab writes before removing obsolete keys.
   for(const key of keysNext)if(localStorage.getItem(key)!==merged[key])throw Error("保存内容が途中で変更されました："+key);
   for(const key of keysBefore)if(!Object.prototype.hasOwnProperty.call(merged,key))localStorage.removeItem(key);
   // A restore is successful only when the final durable snapshot matches the target.
   for(const key of keysNext)if(localStorage.getItem(key)!==merged[key])throw Error("最終保存検証に失敗："+key);
  }catch(error){
   // Best-effort transaction rollback: never knowingly report a partial restore as success.
   try{
    for(const [key,value] of Object.entries(before))localStorage.setItem(key,value);
    for(const key of keysNext)if(!Object.prototype.hasOwnProperty.call(before,key))localStorage.removeItem(key);
   }catch(rollbackError){
    throw Error("重大：復元失敗後の元データへの書き戻しにも失敗しました。ページを閉じず、端末の保存データを削除しないでください："+(rollbackError?.message||""));
   }
   // A successful setItem call is not proof of durable rollback: verify every
   // original key and absence of imported-only keys before allowing a retry.
   let restored;
   try{restored=snapshot()}catch(readError){
    throw Error("重大：復元失敗後の保存状態を確認できません。ページを閉じずデータを保全してください："+(readError?.message||""));
   }
   if(Object.keys(restored).length!==keysBefore.length||
      keysBefore.some(key=>restored[key]!==before[key]))
    throw Error("重大：復元失敗後に元データとの不一致を検出しました。ページを閉じずデータを保全してください");
   throw Error("読み込み時に書込失敗が発生しました。元の保存データへの復帰を検証しました："+(error?.message||""));
  }
  status("バックアップを読み込みました。ページを再起動します。");
  location.reload();
 }catch(error){status("読み込み失敗："+(error?.message||"JSONファイルを確認してください"),true);}
}
function setup(){
 const save=$("save-backup-export"),load=$("save-backup-import"),file=$("save-backup-file");
 if(!save||!load||!file)return;
 save.addEventListener("click",exportBackup);
 load.addEventListener("click",()=>{
  try{importBaseline=snapshot();file.click();}
  catch(error){importBaseline=null;status("現在の保存状態を確認できません："+(error?.message||""),true);}
 });
 file.addEventListener("change",()=>{
  const picked=file.files?.[0],baseline=importBaseline;importBaseline=null;file.value="";
  if(picked)void importBackup(picked,baseline);
 });
 try{localStorage.length}catch(_){status("このブラウザでは保存領域にアクセスできません。通常モードで開いてください。",true);}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",setup,{once:true});else setup();
window.WildSaveBackup=Object.freeze({buildBackup,validate,digest});
})();
