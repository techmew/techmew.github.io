/* STAR FIGHTER — genuine in-game 16:9 outcome screenshot and voluntary X sharing. */
(()=>{
'use strict';
const GAME_URL='https://techmew.github.io/games/star-fighter/';
const W=1200,H=675;
const $=id=>document.getElementById(id);
const titleMode=mode=>mode==='win'?'ALL CLEAR':'GAME OVER';
const difficultyName=mode=>({easy:'イージー',normal:'ノーマル',hard:'ハード'})[mode]||'ノーマル';
const int=(x,cap=1e12)=>Math.max(0,Math.min(cap,Math.floor(Number(x)||0)));
const pad=(x,n=2)=>String(x).padStart(n,'0');
const duration=t=>pad(Math.floor(int(t)/60))+':'+pad(int(t)%60);
let imageBlob=null,previewUrl=null,current=null,generation=0;
function normalized(value){
 if(!value||!['win','over'].includes(value.mode))return null;
 return {mode:value.mode,score:int(value.score),best:int(value.best),
  stage:Math.min(8,Math.max(1,int(value.stage)||1)),difficulty:difficultyName(value.difficulty),
  kills:int(value.kills),combo:int(value.combo),grazes:int(value.grazes),
  level:Math.max(1,int(value.level)),seconds:int(value.seconds),seed:String(value.seed||'').slice(0,8),
  demo:!!value.demo};
}
function postText(d=current){
 if(!d)return '';
 const score=d.score.toLocaleString('ja-JP');
 if(d.mode==='win'){
  return '🚀🌌【STAR FIGHTER｜銀河突破！】\n'+
   '💥 最終ボス撃破！全8ステージ制覇！\n'+
   '🏆 SCORE '+score+'｜'+d.difficulty+'\n'+
   '🔥 '+d.kills+'機撃破 / 最大'+d.combo+'連鎖 / SHIP Lv.'+d.level+'\n'+
   '😈 この記録、超えられる猛者いる？\n'+
   '🎮 無料で挑戦👇\n'+GAME_URL+'\n#STARFIGHTER #シューティング';
 }
 return '💀💥【STAR FIGHTER｜撃墜！】\n'+
  '🚨 SECTOR '+pad(d.stage)+'/08 で機体が大破…！\n'+
  '🏆 SCORE '+score+'｜'+d.difficulty+'\n'+
  '🔥 '+d.kills+'機撃破 / 最大'+d.combo+'連鎖 / SHIP Lv.'+d.level+'\n'+
  '👾 この弾幕、突破できるなら見せてくれ！\n'+
  '🎮 無料で出撃👇\n'+GAME_URL+'\n#STARFIGHTER #弾幕シューティング';
}
function status(value){const el=$('sfShareStatus');if(el)el.textContent=value}
function revoke(){if(previewUrl){URL.revokeObjectURL(previewUrl);previewUrl=null}}
function reset(){
 generation++;revoke();imageBlob=null;current=null;
 const img=$('sfSharePreview');if(img)img.removeAttribute('src');
 const panel=$('sfSharePanel');if(panel)panel.hidden=true;
 const demo=$('sfShareSampleBtn');if(demo)demo.hidden=false;
 for(const id of ['sfShareDownload','sfShareX','sfShareCopy','sfShareImageCopy']){const b=$(id);if(b)b.disabled=true}
 status('');
}
function fit(ctx,t,maxWidth){
 let s=String(t);
 while(s.length>2&&ctx.measureText(s).width>maxWidth)s=s.slice(0,-2)+'…';
 return s;
}
function card(d,gameCanvas){
 if(!gameCanvas||!gameCanvas.width||!gameCanvas.height)return null;
 const img=document.createElement('canvas');img.width=W;img.height=H;
 const ctx=img.getContext('2d');
 if(!ctx)return null;
 ctx.fillStyle='#071422';ctx.fillRect(0,0,W,H);
 // The frame comes only from the actual game's Canvas, not promotional artwork.
 try{ctx.drawImage(gameCanvas,0,0,gameCanvas.width,gameCanvas.height,0,0,W,429)}
 catch(err){console.warn('STAR FIGHTER capture unavailable',err);return null}
 const shade=ctx.createLinearGradient(0,0,0,430);
 shade.addColorStop(0,'rgba(1,8,23,.5)');shade.addColorStop(.58,'rgba(1,8,23,0)');
 shade.addColorStop(1,'rgba(1,8,23,.94)');ctx.fillStyle=shade;ctx.fillRect(0,0,W,430);
 const accent=d.mode==='win'?'#5cead6':'#ffc173';
 ctx.fillStyle=accent;ctx.fillRect(0,0,12,H);
 ctx.textBaseline='middle';ctx.textAlign='left';
 ctx.fillStyle='#f2fcff';ctx.font='900 27px system-ui,sans-serif';ctx.fillText('STAR FIGHTER',44,48);
 ctx.fillStyle=accent;ctx.textAlign='right';ctx.font='800 22px system-ui,sans-serif';
 ctx.fillText('RESULT SCREENSHOT',1152,48);ctx.textAlign='left';
 ctx.shadowColor='#051021';ctx.shadowBlur=13;
 ctx.fillStyle='#fff';ctx.font='900 76px system-ui,sans-serif';
 ctx.fillText(titleMode(d.mode),44,352);ctx.shadowBlur=0;
 if(d.demo){
  ctx.fillStyle='rgba(255,217,112,.96)';ctx.font='900 22px system-ui,sans-serif';
  ctx.textAlign='right';ctx.fillText('SAMPLE / 実際の記録ではありません',1150,385);ctx.textAlign='left';
 }
 ctx.fillStyle='#091d31';ctx.fillRect(0,430,W,245);
 ctx.fillStyle=accent;ctx.fillRect(44,453,96,5);
 ctx.font='800 24px system-ui,sans-serif';ctx.fillStyle='#9dc5dc';
 ctx.fillText(d.mode==='win'?'全8ステージクリア':'到達ステージ',44,483);
 ctx.font='900 35px system-ui,sans-serif';ctx.fillStyle='#fff';
 ctx.fillText(d.mode==='win'?'SECTOR 08 / 08':'SECTOR '+pad(d.stage)+' / 08',44,529);
 ctx.textAlign='right';ctx.fillStyle='#9dc5dc';ctx.font='800 20px system-ui,sans-serif';
 ctx.fillText('SCORE',1152,474);
 ctx.fillStyle=accent;ctx.font='900 53px system-ui,sans-serif';
 ctx.fillText(d.score.toLocaleString('ja-JP'),1152,530);
 ctx.textAlign='left';ctx.strokeStyle='#31526b';ctx.lineWidth=2;
 ctx.beginPath();ctx.moveTo(44,554);ctx.lineTo(1152,554);ctx.stroke();
 const metrics=[
  ['難易度',d.difficulty],['撃破',d.kills+'体'],['最大連続',d.combo],
  ['GRAZE',d.grazes],['SHIP LEVEL',String(d.level)],['TIME',duration(d.seconds)]
 ];
 metrics.forEach(([name,value],i)=>{
  const x=44+i*184;
  ctx.fillStyle='#8caec6';ctx.font='700 17px system-ui,sans-serif';ctx.fillText(name,x,582);
  ctx.fillStyle='#f5fdff';ctx.font='900 24px system-ui,sans-serif';ctx.fillText(fit(ctx,value,170),x,616);
 });
 ctx.fillStyle='#132f46';ctx.fillRect(0,645,W,30);
 ctx.fillStyle='#e2f5ff';ctx.font='700 17px system-ui,sans-serif';
 ctx.fillText('君はどこまで進める？',44,662);
 ctx.textAlign='right';ctx.fillStyle=accent;
 ctx.fillText('techmew.github.io/games/star-fighter/',1152,662);
 return img;
}
function renderShare(value,gameCanvas){
 reset();
 const d=normalized(value);if(!d)return false;current=d;
 const panel=$('sfSharePanel');if(panel)panel.hidden=false;
 const demo=$('sfShareSampleBtn');if(demo)demo.hidden=true;
 const caption=$('sfShareText');if(caption)caption.textContent=postText(d);
 const image=card(d,gameCanvas);
 if(!image){status('プレイ画面を取得できませんでした。');return false}
 const gen=generation;
 status('スクリーンショットを生成中…');
 image.toBlob(blob=>{
  if(gen!==generation||!current)return;
  if(!blob){status('PNG画像を作成できませんでした。');return}
  imageBlob=blob;previewUrl=URL.createObjectURL(blob);
  const preview=$('sfSharePreview');if(preview){preview.src=previewUrl;preview.alt=d.demo?'X共有カードの見本':'実際の戦闘画面と戦績を合成した16対9の画像'}
  if($('sfShareDownload'))$('sfShareDownload').disabled=false;
  if($('sfShareCopy'))$('sfShareCopy').disabled=false;
  if($('sfShareImageCopy'))$('sfShareImageCopy').disabled=d.demo;
  if($('sfShareX'))$('sfShareX').textContent=canNativeShareFile()?'📸 画像＋文章をXで共有':'📸 画像コピーしてXを開く';
  if($('sfShareX'))$('sfShareX').disabled=d.demo;
  status(d.demo?'サンプル表示です。実際の結果ではありません。':'プレイ画面のPNGが完成しました。Xで共有できます。');
 },'image/png');
 return true;
}
function prepare(result,gameCanvas){
 if(result?.debug){reset();status('デバッグの戦績は共有できません。');return false}
 return renderShare(result,gameCanvas);
}
function sample(gameCanvas){
 // Explicitly marked as a sample; never allowed to post as a real result.
 return renderShare({mode:'win',score:1234560,best:1234560,stage:8,difficulty:'normal',
  kills:247,combo:28,grazes:83,level:20,seconds:845,seed:'DEMO',demo:true},gameCanvas);
}
function filename(){return 'star-fighter-'+(current?.mode==='win'?'clear':'game-over')+'-'+(current?.demo?'sample':('sector-'+pad(current?.stage||1)))+'.png'}
function download(){
 if(!imageBlob||!current)return false;
 const url=URL.createObjectURL(imageBlob),a=document.createElement('a');
 a.href=url;a.download=filename();document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),10000);
 status('スクリーンショットを保存しました。');
 return true;
}
async function copyText(){
 if(!current)return false;
 const t=postText(current);
 try{if(!navigator.clipboard?.writeText)throw Error('clipboard unavailable');await navigator.clipboard.writeText(t);status('投稿文をコピーしました。');return true}
 catch(err){status('コピーできませんでした。表示中の投稿文を選択してコピーしてください。');return false}
}
function makeShareFile(){
 if(!imageBlob||!current||typeof File!=='function')return null;
 try{return new File([imageBlob],filename(),{type:'image/png'})}
 catch(err){return null}
}
function canNativeShareFile(){
 if(typeof navigator.share!=='function'||typeof navigator.canShare!=='function')return false;
 const file=makeShareFile();if(!file)return false;
 try{return !!navigator.canShare({files:[file]})}catch(err){return false}
}
function clipboardImageAvailable(){
 return typeof ClipboardItem==='function'&&typeof navigator.clipboard?.write==='function';
}
function writeImageClipboard(){
 if(!imageBlob||!current||!clipboardImageAvailable())return Promise.resolve(false);
 // Call Clipboard.write synchronously from the user's gesture to preserve activation.
 try{
  return navigator.clipboard.write([new ClipboardItem({'image/png':imageBlob})])
   .then(()=>true,error=>{console.warn('STAR FIGHTER image copy failed',error);return false});
 }catch(error){console.warn('STAR FIGHTER image clipboard unavailable',error);return Promise.resolve(false)}
}
async function copyImage(){
 if(!imageBlob||!current||current.demo)return false;
 const success=await writeImageClipboard();
 status(success?'📸 画像をコピーしました。Xの投稿欄で貼り付けてください。':'画像コピーには非対応です。「画像を保存」してXに添付してください。');
 return success;
}
function openXComposer(text){
 const url='https://twitter.com/intent/tweet?text='+encodeURIComponent(text);
 const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener noreferrer';
 document.body.appendChild(a);a.click();a.remove();
}
async function share(){
 if(!current||!imageBlob||current.demo)return false;
 const text=postText();
 // Most convenient supported path: pass the actual PNG plus text to Android/iOS native share.
 // The user chooses X as destination, confirms attachment and taps Post. No auto-post.
 if(canNativeShareFile()){
  try{
   await navigator.share({files:[makeShareFile()],text,title:'STAR FIGHTER 撃墜／クリア記録'});
   status('📸 共有先でXを選択し、画像と文章が付いているか確認して投稿してください。');
   return true;
  }catch(error){
   if(error?.name==='AbortError'){status('共有をキャンセルしました。');return false}
   console.warn('STAR FIGHTER file share failed',error);
  }
 }
 // X Web Intent only accepts text. Attempt to copy the actual PNG on the same
 // user gesture, then immediately open the X composer; the player pastes the PNG.
 const pending=writeImageClipboard();
 openXComposer(text); // Synchronous while the click still has transient activation.
 const copied=await pending;
 status(copied?
  '📸 X投稿画面を開き、画像をコピーしました。投稿欄でCtrl+V（スマホは貼り付け）して画像を追加してください。':
  'X投稿画面を開きました。画像の自動添付はできない環境です。「画像を保存」からXに添付してください。');
 return true;
}
$('sfShareX')?.addEventListener('click',share);
$('sfShareDownload')?.addEventListener('click',download);
$('sfShareCopy')?.addEventListener('click',copyText);
$('sfShareImageCopy')?.addEventListener('click',copyImage);
$('sfShareSampleBtn')?.addEventListener('click',()=>sample($('game')));
window.StarFighterResultShare={prepare,reset,sample,postText,normalized,card,copyImage,share,canNativeShareFile};
})();