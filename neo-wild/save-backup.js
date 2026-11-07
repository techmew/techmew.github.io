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
 return {format:FORMAT,version:1,createdAt:new Date().toISOString(),game:"WILD RECLAIM",origin:location.origin,records,checksum:digest(records)};
}
function exportBackup(){
 try{
  const data=JSON.stringify(buildBackup());
  const blob=new Blob([data],{type:"application/json;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a"),when=new Date();
  const timestamp=[when.getFullYear(),String(when.getMonth()+1).padStart(2,"0"),String(when.getDate()).padStart(2,"0")].join("")+"-"+[when.getHours(),when.getMinutes()].map(v=>String(v).padStart(2,"0")).join("");
  a.href=url;a.download="WILD_RECLAIM_BACKUP_"+timestamp+".json";a.style.display="none";
  document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),15000);
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
  const data=validate(JSON.parse(await file.text()));
  if(!document.getElementById("menu")||document.getElementById("menu").classList.contains("hidden"))throw Error("読み込みはタイトル画面でのみ実行できます");
  const confirmed=window.confirm("バックアップを読み込むと現在のゲーム進行を置き換えます。\n現在のデータを先にバックアップしましたか？\n死亡・野生放流した個体の永久離脱は維持されます。");
  if(!confirmed){status("読み込みをキャンセルしました。");return}
  const before=snapshot(),merged=Object.assign(Object.create(null),data);
  mergeIds(merged,"wild-reclaim-dead-ids-v1",before);
  mergeIds(merged,"wild-reclaim-released-ids-v1",before);
  mergeArchive(merged,"wild-reclaim-released-archive-v1",before);
  // Archive entries also prove permanent release even when an old save omitted the ID ledger.
  const releasedFromArchive=jsonArray(merged["wild-reclaim-released-archive-v1"])
   .map(entry=>entry?.id).filter(id=>typeof id==="string"&&id.length>0&&id.length<=240);
  if(releasedFromArchive.length){
   const released=new Set([...jsonArray(merged["wild-reclaim-released-ids-v1"]),...releasedFromArchive]);
   merged["wild-reclaim-released-ids-v1"]=JSON.stringify([...released]);
  }
  // Old backups are allowed to restore progression, never to resurrect excluded IDs.
  const keysBefore=Object.keys(before),keysNext=Object.keys(merged);
  try{
   // Write/verify first; delete absent game keys only after the backup is complete.
   for(const key of keysNext){
    localStorage.setItem(key,merged[key]);
    if(localStorage.getItem(key)!==merged[key])throw Error("ブラウザ保存の検証に失敗："+key);
   }
   for(const key of keysBefore)if(!Object.prototype.hasOwnProperty.call(merged,key))localStorage.removeItem(key);
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
