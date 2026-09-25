(() => {
"use strict";

const BUILTIN_PRESETS = [
  {id:"ig-square",group:"Instagram",name:"Instagram 正方形",w:1080,h:1080,note:"1:1 フィード用"},
  {id:"ig-portrait",group:"Instagram",name:"Instagram 縦長",w:1080,h:1350,note:"4:5 フィード用"},
  {id:"ig-story",group:"Instagram",name:"Story / Reels",w:1080,h:1920,note:"9:16 作業用",safe:{top:250,right:80,bottom:250,left:80,kind:"guide"}},
  {id:"x-post",group:"X",name:"X 横長投稿",w:1600,h:900,note:"16:9 投稿向け"},
  {id:"x-profile",group:"X",name:"X プロフィール",w:400,h:400,note:"公式推奨 400×400"},
  {id:"x-header",group:"X",name:"X ヘッダー",w:1500,h:500,note:"公式推奨 1500×500"},
  {id:"yt-thumb",group:"YouTube",name:"YouTube サムネイル",w:1280,h:720,note:"16:9"},
  {id:"yt-banner",group:"YouTube",name:"YouTube バナー",w:2560,h:1440,note:"公式推奨・安全領域あり",safe:{w:1235,h:338,kind:"official"}},
  {id:"li-link",group:"LinkedIn",name:"LinkedIn リンク画像",w:1200,h:627,note:"公式 1.91:1"},
  {id:"li-logo",group:"LinkedIn",name:"LinkedIn ページロゴ",w:400,h:400,note:"公式推奨"},
  {id:"blog-ogp",group:"Web / Blog",name:"OGP",w:1200,h:630,note:"汎用 1.91:1"}
];
const POPULAR = new Set(["ig-square","ig-portrait","ig-story","x-post","yt-thumb","blog-ogp"]);
const MAX_FILES = 50;
const MAX_OUTPUTS = 300;
const SETTINGS_KEY = "himaneko_sns_image_studio_settings_v1";
const HISTORY_KEY = "himaneko_sns_image_studio_history_v1";

const $ = (s) => document.querySelector(s);
const els = {
  fileInput:$("#fileInput"), pickBtn:$("#pickBtn"), drop:$("#dropZone"), list:$("#fileList"),
  clearFiles:$("#clearFiles"), fileCount:$("#fileCount"), groups:$("#presetGroups"),
  selectPopular:$("#selectPopular"), selectAll:$("#selectAll"), selectNone:$("#selectNone"),
  customName:$("#customName"), customW:$("#customW"), customH:$("#customH"), addCustom:$("#addCustom"),
  fitMode:$("#fitMode"), format:$("#format"), backgroundMode:$("#backgroundMode"), bgColor:$("#bgColor"),
  quality:$("#quality"), qualityVal:$("#qualityVal"), zoom:$("#zoom"), zoomVal:$("#zoomVal"),
  previewPreset:$("#previewPreset"), canvas:$("#previewCanvas"), canvasWrap:$("#canvasWrap"),
  metricImages:$("#metricImages"), metricPresets:$("#metricPresets"), metricOutputs:$("#metricOutputs"),
  progressBar:$("#progressBar"), progressText:$("#progressText"), generate:$("#generateBtn"),
  zip:$("#downloadZip"), resultList:$("#resultList"), errorList:$("#errorList"), history:$("#history")
};

let files = [];
let selectedFileId = null;
let customPresets = [];
let results = [];
let busy = false;
let dragging = false;

function uid(){
  return (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)+Math.random().toString(36).slice(2));
}
function escapeHtml(v){
  return String(v).replace(/[&<>"']/g, (m) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
}
function bytes(n){
  if(!Number.isFinite(n)) return "0 B";
  const u=["B","KB","MB","GB"]; let i=0, v=n;
  while(v>=1024 && i<u.length-1){v/=1024;i++;}
  return (i? v.toFixed(v>=10?1:2):Math.round(v))+" "+u[i];
}
function safeName(name){
  return name.normalize("NFKC").replace(/\.[^.]+$/,"").replace(/[\\/:*?"<>|\s]+/g,"-").replace(/^-+|-+$/g,"").slice(0,70) || "image";
}
function extFor(type){ return type==="image/png"?"png":type==="image/webp"?"webp":"jpg"; }
function allPresets(){ return BUILTIN_PRESETS.concat(customPresets); }
function presetById(id){ return allPresets().find((p)=>p.id===id); }
function activeFile(){ return files.find((f)=>f.id===selectedFileId) || files[0] || null; }
function selectedPresetIds(){
  return Array.from(document.querySelectorAll("[data-preset-check]:checked")).map((x)=>x.value);
}
function selectedPresets(){ return selectedPresetIds().map(presetById).filter(Boolean); }

function loadSettings(){
  try{
    const s=JSON.parse(localStorage.getItem(SETTINGS_KEY)||"{}");
    if(Array.isArray(s.customPresets)) customPresets=s.customPresets.filter((p)=>p&&p.id&&p.w&&p.h).slice(0,20);
    if(s.fitMode) els.fitMode.value=s.fitMode;
    if(s.format) els.format.value=s.format;
    if(s.backgroundMode) els.backgroundMode.value=s.backgroundMode;
    if(/^#[0-9a-f]{6}$/i.test(s.bgColor||"")) els.bgColor.value=s.bgColor;
    if(s.quality) els.quality.value=String(s.quality);
    return new Set(Array.isArray(s.selected)?s.selected:POPULAR);
  }catch(_){ return new Set(POPULAR); }
}
function saveSettings(){
  const s={selected:selectedPresetIds(),customPresets,fitMode:els.fitMode.value,format:els.format.value,backgroundMode:els.backgroundMode.value,bgColor:els.bgColor.value,quality:Number(els.quality.value)};
  localStorage.setItem(SETTINGS_KEY,JSON.stringify(s));
}
let initialSelected=loadSettings();

function renderPresets(){
  const groups={};
  allPresets().forEach((p)=>{(groups[p.group]||(groups[p.group]=[])).push(p);});
  els.groups.innerHTML="";
  Object.entries(groups).forEach(([name,items])=>{
    const box=document.createElement("div"); box.className="preset-group";
    const title=document.createElement("div"); title.className="preset-title"; title.textContent=name; box.appendChild(title);
    const list=document.createElement("div"); list.className="preset-list";
    items.forEach((p)=>{
      const label=document.createElement("label"); label.className="preset-item";
      const checked=initialSelected.has(p.id);
      label.innerHTML='<input data-preset-check type="checkbox" value="'+escapeHtml(p.id)+'" '+(checked?"checked":"")+'><span><b>'+escapeHtml(p.name)+'</b><small>'+p.w+"×"+p.h+" ・ "+escapeHtml(p.note||"")+'</small></span>';
      if(p.custom){
        const d=document.createElement("button"); d.type="button"; d.className="preset-delete"; d.textContent="×"; d.title="削除";
        d.addEventListener("click",(e)=>{e.preventDefault();e.stopPropagation();customPresets=customPresets.filter((x)=>x.id!==p.id);initialSelected.delete(p.id);renderPresets();saveSettings();});
        label.appendChild(d);
      }
      list.appendChild(label);
    });
    box.appendChild(list); els.groups.appendChild(box);
  });
  els.groups.querySelectorAll("[data-preset-check]").forEach((c)=>c.addEventListener("change",()=>{initialSelected=new Set(selectedPresetIds());syncPreviewOptions();metrics();saveSettings();}));
  syncPreviewOptions(); metrics();
}
function syncPreviewOptions(){
  const current=els.previewPreset.value;
  const ps=selectedPresets();
  const pool=ps.length?ps:allPresets();
  els.previewPreset.innerHTML=pool.map((p)=>'<option value="'+escapeHtml(p.id)+'">'+escapeHtml(p.name)+" "+p.w+"×"+p.h+"</option>").join("");
  if(pool.some((p)=>p.id===current)) els.previewPreset.value=current;
  drawPreview();
}
function metrics(){
  const p=selectedPresets().length, n=files.length;
  els.metricImages.textContent=n; els.metricPresets.textContent=p; els.metricOutputs.textContent=n*p;
  els.fileCount.textContent=n+"枚";
  els.generate.disabled=busy || !n || !p || n*p>MAX_OUTPUTS;
  if(n*p>MAX_OUTPUTS) els.progressText.textContent="生成予定が"+MAX_OUTPUTS+"枚を超えています。画像またはサイズを減らしてください。";
  else if(!busy && els.progressText.textContent.startsWith("生成予定が")) els.progressText.textContent="";
}
function loadImage(file){
  return new Promise((resolve,reject)=>{
    const url=URL.createObjectURL(file), img=new Image();
    img.onload=()=>resolve({img,url,w:img.naturalWidth,h:img.naturalHeight});
    img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error("画像を読み込めません"));};
    img.src=url;
  });
}
async function addFiles(list){
  const incoming=Array.from(list).filter((f)=>["image/jpeg","image/png","image/webp"].includes(f.type));
  const room=Math.max(0,MAX_FILES-files.length);
  for(const file of incoming.slice(0,room)){
    try{
      const d=await loadImage(file);
      files.push({id:uid(),file,img:d.img,url:d.url,w:d.w,h:d.h,focalX:.5,focalY:.5,zoom:1});
    }catch(err){ showError(file.name+"： "+err.message); }
  }
  if(!selectedFileId && files[0]) selectedFileId=files[0].id;
  renderFiles(); metrics(); drawPreview();
}
function renderFiles(){
  els.list.innerHTML="";
  files.forEach((f)=>{
    const row=document.createElement("div"); row.className="file-row"+(f.id===selectedFileId?" active":"");
    row.innerHTML='<img class="thumb" src="'+f.url+'" alt=""><div><div class="file-name">'+escapeHtml(f.file.name)+'</div><div class="file-meta">'+f.w+"×"+f.h+" ・ "+bytes(f.file.size)+'</div></div><button class="remove" type="button" aria-label="削除">×</button>';
    row.addEventListener("click",(e)=>{if(e.target.closest(".remove"))return; selectedFileId=f.id; els.zoom.value=String(Math.round(f.zoom*100));els.zoomVal.textContent=Math.round(f.zoom*100)+"%";renderFiles();drawPreview();});
    row.querySelector(".remove").addEventListener("click",()=>removeFile(f.id));
    els.list.appendChild(row);
  });
}
function removeFile(id){
  const f=files.find((x)=>x.id===id); if(f) URL.revokeObjectURL(f.url);
  files=files.filter((x)=>x.id!==id);
  if(selectedFileId===id) selectedFileId=files[0]?.id||null;
  renderFiles();metrics();drawPreview();
}
function clearFiles(){
  files.forEach((f)=>URL.revokeObjectURL(f.url)); files=[];selectedFileId=null;renderFiles();metrics();drawPreview();
}
function showError(msg){
  const d=document.createElement("div");d.textContent=msg;els.errorList.appendChild(d);
}
function fillBackground(ctx,cw,ch,img,mode,color){
  if(mode==="transparent"){ctx.clearRect(0,0,cw,ch);return;}
  if(mode==="blur"){
    ctx.save();ctx.filter="blur(28px) brightness(.72)";
    const s=Math.max(cw/img.naturalWidth,ch/img.naturalHeight)*1.12;
    const w=img.naturalWidth*s,h=img.naturalHeight*s;
    ctx.drawImage(img,(cw-w)/2,(ch-h)/2,w,h);ctx.restore();
    ctx.fillStyle="rgba(0,0,0,.12)";ctx.fillRect(0,0,cw,ch);return;
  }
  ctx.fillStyle=color;ctx.fillRect(0,0,cw,ch);
}
function drawImageTo(ctx,img,cw,ch,settings,focalX,focalY,zoom){
  const iw=img.naturalWidth, ih=img.naturalHeight;
  if(settings.fitMode==="contain"){
    fillBackground(ctx,cw,ch,img,settings.backgroundMode,settings.bgColor);
    const s=Math.min(cw/iw,ch/ih)*zoom, dw=iw*s, dh=ih*s;
    const overflowX=Math.max(0,dw-cw),overflowY=Math.max(0,dh-ch);
    const dx=(cw-dw)/2-(focalX-.5)*overflowX*2,dy=(ch-dh)/2-(focalY-.5)*overflowY*2;
    ctx.drawImage(img,dx,dy,dw,dh);
  }else{
    ctx.fillStyle=settings.bgColor;ctx.fillRect(0,0,cw,ch);
    const s=Math.max(cw/iw,ch/ih)*zoom,dw=iw*s,dh=ih*s;
    const dx=-(dw-cw)*focalX,dy=-(dh-ch)*focalY;
    ctx.drawImage(img,dx,dy,dw,dh);
  }
}
function currentSettings(){
  return {fitMode:els.fitMode.value,format:els.format.value,backgroundMode:els.backgroundMode.value,bgColor:els.bgColor.value,quality:Number(els.quality.value)/100};
}
function drawSafe(ctx,p,cw,ch){
  if(!p.safe)return;
  let x,y,w,h;
  if(p.safe.w){
    w=cw*(p.safe.w/p.w);h=ch*(p.safe.h/p.h);x=(cw-w)/2;y=(ch-h)/2;
  }else{
    x=cw*(p.safe.left/p.w);y=ch*(p.safe.top/p.h);w=cw*(1-(p.safe.left+p.safe.right)/p.w);h=ch*(1-(p.safe.top+p.safe.bottom)/p.h);
  }
  ctx.save();
  ctx.fillStyle="rgba(120,103,255,.12)";ctx.fillRect(x,y,w,h);
  ctx.strokeStyle=p.safe.kind==="official"?"rgba(88,220,173,.95)":"rgba(255,207,98,.95)";ctx.lineWidth=Math.max(2,cw/400);ctx.setLineDash([10,7]);ctx.strokeRect(x,y,w,h);
  ctx.setLineDash([]);ctx.fillStyle="rgba(5,7,10,.72)";ctx.font=Math.max(12,Math.round(cw/55))+"px system-ui";ctx.fillText(p.safe.kind==="official"?"公式セーフエリア":"UI回避の目安",x+8,y+22);
  ctx.restore();
}
function drawPreview(){
  const f=activeFile(),p=presetById(els.previewPreset.value)||selectedPresets()[0]||allPresets()[0],c=els.canvas,ctx=c.getContext("2d");
  if(!p){ctx.clearRect(0,0,c.width,c.height);return;}
  const max=900,scale=Math.min(1,max/p.w);c.width=Math.max(1,Math.round(p.w*scale));c.height=Math.max(1,Math.round(p.h*scale));
  ctx.clearRect(0,0,c.width,c.height);
  if(!f){
    ctx.fillStyle="#0c0f14";ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle="#8991a0";ctx.textAlign="center";ctx.font=Math.max(14,Math.round(c.width/30))+"px system-ui";ctx.fillText("画像を追加するとここにプレビューします",c.width/2,c.height/2);return;
  }
  drawImageTo(ctx,f.img,c.width,c.height,currentSettings(),f.focalX,f.focalY,f.zoom);
  drawSafe(ctx,p,c.width,c.height);
  ctx.save();ctx.strokeStyle="rgba(255,255,255,.85)";ctx.lineWidth=1.5;const x=f.focalX*c.width,y=f.focalY*c.height;ctx.beginPath();ctx.arc(x,y,8,0,Math.PI*2);ctx.moveTo(x-13,y);ctx.lineTo(x+13,y);ctx.moveTo(x,y-13);ctx.lineTo(x,y+13);ctx.stroke();ctx.restore();
}
function setFocalFromPointer(e){
  const f=activeFile();if(!f)return;
  const r=els.canvas.getBoundingClientRect();
  f.focalX=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));f.focalY=Math.max(0,Math.min(1,(e.clientY-r.top)/r.height));drawPreview();
}
function canvasBlob(canvas,type,quality){
  return new Promise((resolve,reject)=>canvas.toBlob((b)=>b?resolve(b):reject(new Error("書き出しに失敗しました")),type,quality));
}
async function verifyBlob(blob,w,h){
  if("createImageBitmap" in window){
    const b=await createImageBitmap(blob);const ok=b.width===w&&b.height===h;b.close();if(!ok)throw new Error("出力サイズ検証に失敗");
    return;
  }
  const url=URL.createObjectURL(blob);
  await new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>{const ok=i.naturalWidth===w&&i.naturalHeight===h;URL.revokeObjectURL(url);ok?resolve():reject(new Error("出力サイズ検証に失敗"));};i.onerror=()=>{URL.revokeObjectURL(url);reject(new Error("出力再読込に失敗"));};i.src=url;});
}
function clearResults(){
  results.forEach((r)=>URL.revokeObjectURL(r.url));results=[];els.resultList.innerHTML="";els.zip.disabled=true;
}
function resultRow(r){
  const row=document.createElement("div");row.className="result-row";
  row.innerHTML='<div><b>'+escapeHtml(r.name)+'</b><small>'+r.w+"×"+r.h+" ・ "+bytes(r.blob.size)+" ・ 検証OK</small></div><a href="'+r.url+'" download="'+escapeHtml(r.name)+'">保存</a>';
  els.resultList.appendChild(row);
}
async function generate(){
  if(busy)return;
  const ps=selectedPresets();
  if(!files.length||!ps.length)return;
  const total=files.length*ps.length;
  if(total>MAX_OUTPUTS){showError("一度に生成できるのは"+MAX_OUTPUTS+"枚までです。");return;}
  busy=true;clearResults();els.errorList.innerHTML="";metrics();els.progressText.textContent="準備中…";els.progressBar.style.width="0%";
  const settings=currentSettings();let done=0,failed=0;
  try{
    for(const f of files){
      for(const p of ps){
        try{
          const c=document.createElement("canvas");c.width=p.w;c.height=p.h;const ctx=c.getContext("2d",{alpha:settings.format!=="image/jpeg"});
          if(settings.format==="image/jpeg"&&settings.backgroundMode==="transparent") settings.backgroundMode="solid";
          drawImageTo(ctx,f.img,p.w,p.h,settings,f.focalX,f.focalY,f.zoom);
          const blob=await canvasBlob(c,settings.format,settings.quality);await verifyBlob(blob,p.w,p.h);
          const name=safeName(f.file.name)+"__"+safeName(p.name)+"__"+p.w+"x"+p.h+"."+extFor(settings.format);
          const url=URL.createObjectURL(blob);const r={name,blob,url,w:p.w,h:p.h,preset:p.name};results.push(r);resultRow(r);
        }catch(err){failed++;showError(f.file.name+" / "+p.name+"： "+err.message);}
        done++;const pct=Math.round(done/total*100);els.progressBar.style.width=pct+"%";els.progressText.textContent=done+" / "+total+" 処理中";
        await new Promise((r)=>requestAnimationFrame(r));
      }
    }
    els.progressText.textContent="完了： "+results.length+"枚"+(failed?" / 失敗 "+failed+"枚":"");
    els.zip.disabled=!results.length || !window.JSZip;
    addHistory(files.length,results.length,settings.format,failed);
  }finally{busy=false;metrics();saveSettings();}
}
async function downloadZip(){
  if(!results.length||!window.JSZip)return;
  els.zip.disabled=true;els.progressText.textContent="ZIPを作成中…";
  try{
    const zip=new JSZip();results.forEach((r)=>zip.file(r.name,r.blob));
    const blob=await zip.generateAsync({type:"blob",compression:"DEFLATE",compressionOptions:{level:6}},(m)=>{els.progressBar.style.width=Math.round(m.percent)+"%";});
    const a=document.createElement("a");const url=URL.createObjectURL(blob);a.href=url;a.download="sns-image-studio_"+new Date().toISOString().slice(0,10)+".zip";a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);els.progressText.textContent="ZIPを保存しました。";
  }catch(err){showError("ZIP作成： "+err.message);}finally{els.zip.disabled=false;}
}
function addHistory(inputCount,outputCount,type,failed){
  let h=[];try{h=JSON.parse(localStorage.getItem(HISTORY_KEY)||"[]");}catch(_){}
  h.unshift({at:new Date().toISOString(),inputCount,outputCount,type,failed});h=h.slice(0,10);localStorage.setItem(HISTORY_KEY,JSON.stringify(h));renderHistory();
}
function renderHistory(){
  let h=[];try{h=JSON.parse(localStorage.getItem(HISTORY_KEY)||"[]");}catch(_){}
  if(!h.length){els.history.innerHTML='<div class="history-item">まだ処理履歴はありません。</div>';return;}
  els.history.innerHTML=h.map((x)=>'<div class="history-item">'+new Date(x.at).toLocaleString("ja-JP")+" ・ "+x.inputCount+"枚 → "+x.outputCount+"枚"+(x.failed?" / 失敗 "+x.failed:"")+"</div>").join("");
}
function addCustom(){
  const w=Number(els.customW.value),h=Number(els.customH.value),name=els.customName.value.trim()||"カスタム";
  if(!Number.isInteger(w)||!Number.isInteger(h)||w<16||h<16||w>10000||h>10000){showError("カスタムサイズは16〜10000pxで指定してください。");return;}
  const p={id:"custom-"+uid(),group:"Custom",name,w,h,note:"カスタム",custom:true};customPresets.push(p);initialSelected.add(p.id);renderPresets();saveSettings();
}
function bind(){
  els.pickBtn.addEventListener("click",()=>els.fileInput.click());els.fileInput.addEventListener("change",()=>{addFiles(els.fileInput.files);els.fileInput.value="";});
  ["dragenter","dragover"].forEach((n)=>els.drop.addEventListener(n,(e)=>{e.preventDefault();els.drop.classList.add("is-over");}));
  ["dragleave","drop"].forEach((n)=>els.drop.addEventListener(n,(e)=>{e.preventDefault();els.drop.classList.remove("is-over");}));
  els.drop.addEventListener("drop",(e)=>addFiles(e.dataTransfer.files));els.clearFiles.addEventListener("click",clearFiles);
  els.selectPopular.addEventListener("click",()=>{initialSelected=new Set(POPULAR);renderPresets();saveSettings();});
  els.selectAll.addEventListener("click",()=>{initialSelected=new Set(allPresets().map((p)=>p.id));renderPresets();saveSettings();});
  els.selectNone.addEventListener("click",()=>{initialSelected=new Set();renderPresets();saveSettings();});
  els.addCustom.addEventListener("click",addCustom);
  [els.fitMode,els.format,els.backgroundMode,els.bgColor].forEach((x)=>x.addEventListener("change",()=>{drawPreview();saveSettings();}));
  els.quality.addEventListener("input",()=>{els.qualityVal.textContent=els.quality.value+"%";saveSettings();});
  els.zoom.addEventListener("input",()=>{const f=activeFile();if(f){f.zoom=Number(els.zoom.value)/100;els.zoomVal.textContent=els.zoom.value+"%";drawPreview();}});
  els.previewPreset.addEventListener("change",drawPreview);
  els.canvas.addEventListener("pointerdown",(e)=>{dragging=true;els.canvas.setPointerCapture(e.pointerId);setFocalFromPointer(e);});
  els.canvas.addEventListener("pointermove",(e)=>{if(dragging)setFocalFromPointer(e);});
  els.canvas.addEventListener("pointerup",()=>dragging=false);els.canvas.addEventListener("pointercancel",()=>dragging=false);
  els.generate.addEventListener("click",generate);els.zip.addEventListener("click",downloadZip);
  window.addEventListener("beforeunload",()=>{files.forEach((f)=>URL.revokeObjectURL(f.url));results.forEach((r)=>URL.revokeObjectURL(r.url));});
}
function init(){
  els.qualityVal.textContent=els.quality.value+"%";renderPresets();renderFiles();renderHistory();bind();metrics();drawPreview();
  if(!window.JSZip) showError("ZIPライブラリを読み込めませんでした。個別保存は利用できます。");
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();