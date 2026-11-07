/* WILD RECLAIM: isolated QA storage, initialized before any game module.
 * Normal browser saves are read once, then never written in debug play. */
(() => {
 "use strict";
 if(new URLSearchParams(location.search).get("wr_debug_sandbox")!=="1"){
  window.WildDebugSandbox={active:false};return;
 }
 const KEY="wr-debug-storage-v1",native=window.localStorage,session=window.sessionStorage;
 try {
  session.setItem("wr-debug-probe","ok");session.removeItem("wr-debug-probe");
  const raw=session.getItem(KEY);let entries;
  if(raw!==null){
   entries=JSON.parse(raw);
   if(!entries||typeof entries!=="object"||Array.isArray(entries))throw Error("テストデータが不正です");
  }else{
   entries={};
   for(let i=0;i<native.length;i++){
    const key=native.key(i);if(key!==null)entries[key]=native.getItem(key);
   }
   session.setItem(KEY,JSON.stringify(entries));
  }
  let data=new Map(Object.entries(entries));
  function commit(next){
   // Commit to sessionStorage first, so quota failure does not partially mutate data.
   session.setItem(KEY,JSON.stringify(Object.fromEntries(next)));
   data=next;
  }
  const isolated={
   get length(){return data.size;},
   key(index){return [...data.keys()][Number(index)]??null;},
   getItem(key){key=String(key);return data.has(key)?data.get(key):null;},
   setItem(key,value){const next=new Map(data);next.set(String(key),String(value));commit(next);},
   removeItem(key){key=String(key);if(!data.has(key))return;const next=new Map(data);next.delete(key);commit(next);},
   clear(){commit(new Map());}
  };
  const descriptor=Object.getOwnPropertyDescriptor(window,"localStorage");
  if(descriptor&&!descriptor.configurable)throw Error("ブラウザがデバッグ保存領域の分離に非対応です");
  Object.defineProperty(window,"localStorage",{configurable:true,enumerable:true,get(){return isolated;}});
  if(window.localStorage!==isolated)throw Error("保存領域を隔離できません");
  window.WildDebugSandbox={active:true,key:KEY,reset(){session.removeItem(KEY);}};
 }catch(error){
  window.WildDebugSandbox={active:false,error:String(error?.message||error)};
  // Fail closed: game code cannot fall through to the user's real saves.
  try{Object.defineProperty(window,"localStorage",{configurable:true,get(){throw Error("デバッグ保存領域の隔離に失敗しました");}});}catch(_){}
 }
})();
