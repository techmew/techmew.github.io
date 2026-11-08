/* WILD RECLAIM: portable, local-only game save backup and guarded restore. */
(()=>{"use strict";
const PREFIX="wild-reclaim-", FORMAT="WILD_RECLAIM_BACKUP_V1",MAX_BYTES=16*1024*1024;
const $=id=>document.getElementById(id), keyOk=k=>typeof k==="string"&&k.startsWith(PREFIX)&&k.length<200;
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
 return {format:FORMAT,version:1,createdAt:new Date().toISOString(),game:"WILD RECLAIM",origin:location.origin,records,checksum:digest(records)};
}
function exportBackup(){
 try{
  const data=JSON.stringify(buildBackup());
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
async function importBackup(file){
 try{
  if(!file||file.size<=0||file.size>MAX_BYTES)throw Error("ファイルが空、または16MBを超えています");
  const jsonText=typeof file.text==="function"?await file.text():await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result||""));reader.onerror=()=>reject(reader.error||Error("ファイルを読み取れません"));reader.readAsText(file,"UTF-8");});
  const data=validate(JSON.parse(jsonText));
  if(!document.getElementById("menu")||document.getElementById("menu").classList.contains("hidden"))throw Error("読み込みはタイトル画面でのみ実行できます");
  const confirmed=window.confirm("バックアップを読み込むと現在のゲーム進行を置き換えます。\n現在のデータを先にバックアップしましたか？\n死亡・野生放流した個体の永久離脱は維持されます。");
  if(!confirmed){status("読み込みをキャンセルしました。");return}
  const before=snapshot(),merged=Object.assign(Object.create(null),data);
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
   }catch(_){}
   throw Error("読み込み時に保存容量不足・書込失敗が発生しました。復元を中止しました："+(error?.message||""));
  }
  status("バックアップを読み込みました。ページを再起動します。");
  location.reload();
 }catch(error){status("読み込み失敗："+(error?.message||"JSONファイルを確認してください"),true);}
}
function setup(){
 const save=$("save-backup-export"),load=$("save-backup-import"),file=$("save-backup-file");
 if(!save||!load||!file)return;
 save.addEventListener("click",exportBackup);
 load.addEventListener("click",()=>file.click());
 file.addEventListener("change",()=>{const picked=file.files?.[0];file.value="";if(picked)void importBackup(picked);});
 try{localStorage.length}catch(_){status("このブラウザでは保存領域にアクセスできません。通常モードで開いてください。",true);}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",setup,{once:true});else setup();
window.WildSaveBackup=Object.freeze({buildBackup,validate,digest});
})();
