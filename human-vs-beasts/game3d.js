/* BEAST BREAKER 3D — fully modeled, live WebGL racing. Three.js r148 (MIT). */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const loader=$('loader'),loadStatus=$('loadStatus');
const fail=msg=>{loadStatus.textContent=msg;loader.querySelector('.spinner').style.display='none'};
if(!window.THREE){fail('3Dエンジンを読み込めませんでした。通信とブラウザのWebGL対応を確認してください。');return}
const T=THREE, clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), mix=(a,b,t)=>a+(b-a)*t;
const mobile=/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent)||innerWidth<800;
const animals=[
 {id:'dog',name:'イヌ',sub:'加速の基本を学ぶ',kph:35,acc:4.5,kind:'dog',coat:0xc28a58,tier:1},
 {id:'cat',name:'ネコ',sub:'軽い身体と瞬発力',kph:48,acc:5.8,kind:'cat',coat:0xc7a47b,tier:1},
 {id:'fox',name:'アカギツネ',sub:'細身のスプリンター',kph:50,acc:6.0,kind:'fox',coat:0xc76e37,tier:2},
 {id:'rabbit',name:'ノウサギ',sub:'猛烈な跳躍',kph:65,acc:7.0,kind:'rabbit',coat:0xb99d76,tier:2},
 {id:'zebra',name:'シマウマ',sub:'脚の長い大型獣',kph:60,acc:5.8,kind:'zebra',coat:0xe8e6df,tier:3},
 {id:'greyhound',name:'グレイハウンド',sub:'競走のための流線型',kph:70,acc:7.3,kind:'greyhound',coat:0xa69588,tier:3},
 {id:'ostrich',name:'ダチョウ',sub:'二本脚で疾走',kph:70,acc:6.2,kind:'ostrich',coat:0x272931,tier:4},
 {id:'kangaroo',name:'アカカンガルー',sub:'巨大な後脚で跳ねる',kph:70,acc:6.2,kind:'kangaroo',coat:0xb77651,tier:4},
 {id:'horse',name:'クォーターホース',sub:'圧倒的な馬力',kph:71,acc:7.0,kind:'horse',coat:0x9e6240,tier:5},
 {id:'lion',name:'ライオン',sub:'強靱な四肢と筋肉',kph:80,acc:7.7,kind:'lion',coat:0xd49c54,tier:5},
 {id:'gazelle',name:'スプリングボック',sub:'軽快な高速アンテロープ',kph:88,acc:8.4,kind:'gazelle',coat:0xbf956d,tier:6},
 {id:'pronghorn',name:'プロングホーン',sub:'長距離にも強い速足',kph:88,acc:8.7,kind:'pronghorn',coat:0xbc9b75,tier:6},
 {id:'cheetah',name:'チーター',sub:'地上最速への最終挑戦',kph:103.5,acc:11.0,kind:'cheetah',coat:0xe3ae65,tier:7}
];
const palettes={skin:['#ffe0c7','#eec09b','#c88d62','#975f45','#633c2d','#f3c99c','#c49574','#ab7858','#dfac7d','#6b4936'],hair:['#202029','#432c23','#9f6337','#d8bd75','#8a484b','#bebdc2','#1e5581','#a649a7','#74371d','#d4d3cb'],shirt:['#e0ff5d','#ffffff','#1a2c47','#ef645a','#3a9ede','#9c69e2','#e5aa49','#1f7d72','#dc88a9','#b6bdc4','#343038','#f3ca77'],pants:['#14283e','#f1f3ee','#193b4f','#3f454d','#953d4e','#41553f','#8e735a','#253364','#74748b'],shoes:['#f7f8f0','#e9b14e','#252a2f','#63d7e6','#ef6a66','#a77beb','#97ff56','#cfd3d7']};
const categories=[
 ['顔・輪郭','face','range',1,10],['眉毛','brow','range',1,10],['目の大きさ','eyes','range',1,10],['鼻の形','nose','range',1,10],['口・表情','mouth','range',1,10],['髪型','hairStyle','range',0,9],['肌の色','skin','palette','skin'],['髪の色','hair','palette','hair'],['筋肉量','build','range',1,10],['体型','body','range',1,10],['身長','height','range',1,10],['トップス','shirt','palette','shirt'],['服の形','shirtStyle','range',0,9],['ボトムス','pants','palette','pants'],['シューズ','shoes','palette','shoes'],['アクセサリー','accessory','range',0,9]
];
const defaultAvatar={face:5,brow:3,eyes:4,nose:3,mouth:3,hairStyle:3,skin:2,hair:0,build:4,body:5,height:5,shirt:0,shirtStyle:0,pants:0,shoes:1,accessory:0};
const defaultSave={money:170,stats:{speed:2,power:1,stamina:1,technique:1},best:null,won:[],chosen:0,avatar:defaultAvatar,races:0,runnerName:'ランナー',bestByBeast:{}};
let save=(()=>{try{const v=JSON.parse(localStorage.getItem('animal100m_v4'));if(v&&typeof v==='object')return {...defaultSave,...v,stats:{...defaultSave.stats,...v.stats},avatar:{...defaultAvatar,...v.avatar},won:Array.isArray(v.won)?v.won:[],bestByBeast:v.bestByBeast||{}}}catch(e){}return JSON.parse(JSON.stringify(defaultSave))})();
const store=()=>{try{localStorage.setItem('animal100m_v4',JSON.stringify(save))}catch(e){}};
const training=[{id:'speed',name:'脚力・最高速度',desc:'最高速度とトップスピード維持を強化',gain:'+4.2km/h'}, {id:'power',name:'爆発力・加速',desc:'スタートからの加速、踏み込み効率を強化',gain:'加速 +8%'},{id:'stamina',name:'心肺・持久力',desc:'連打で消費する体力を軽減',gain:'持久力 +8%'},{id:'technique',name:'走法・フォーム',desc:'連打効率とコンボ蓄積を強化',gain:'効率 +7%'}];
const mat=(color,roughness=.86,metalness=.01)=>new T.MeshStandardMaterial({color,roughness,metalness});
const m={track:mat(0x944b42),trackDark:mat(0x894039),line:mat(0xf8ead7),grass:mat(0x38594c),grass2:mat(0x29473d),dark:mat(0x122336),wall:mat(0x243748),seat:mat(0x304554),seat2:mat(0x253843),steel:mat(0xbccad5,.4,.7),gold:mat(0xffd36a,.35,.4),white:mat(0xf4f5eb),black:mat(0x191e25),eye:mat(0xf9faf7),lens:mat(0x263449),nose:mat(0x332c29),paint:mat(0x8baec1),shoe:mat(0x252c3b),red:mat(0xd94d4e)};
const scene=new T.Scene();scene.background=new T.Color(0x516577);scene.fog=new T.FogExp2(0x677789,.0048);
const camera=new T.PerspectiveCamera(52,1,.1,420);
let renderer;
try {renderer=new T.WebGLRenderer({canvas:$('world'),antialias:!mobile,powerPreference:'high-performance',alpha:false,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,mobile?1.35:1.85));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputEncoding=T.sRGBEncoding;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.78;}catch(err){fail('WebGL 3Dの起動に失敗しました。WebGL対応ブラウザで開いてください。');return}
const hemi=new T.HemisphereLight(0xb8c9cf,0x42362e,1.02);scene.add(hemi);
const sun=new T.DirectionalLight(0xe9d6bd,1.45);sun.position.set(-26,60,24);sun.castShadow=true;sun.shadow.mapSize.set(mobile?1024:2048,mobile?1024:2048);sun.shadow.camera.left=-34;sun.shadow.camera.right=34;sun.shadow.camera.top=32;sun.shadow.camera.bottom=-32;sun.shadow.camera.near=5;sun.shadow.camera.far=150;sun.shadow.bias=-.00026;sun.target.position.set(0,0,14);scene.add(sun,sun.target);
const fill=new T.DirectionalLight(0x8eabba,.27);fill.position.set(20,15,65);scene.add(fill);
const ground=new T.Mesh(new T.PlaneGeometry(480,540),m.grass);ground.rotation.x=-Math.PI/2;ground.position.set(0,-.075,55);ground.receiveShadow=true;scene.add(ground);
const box=(parent,w,h,d,mt,x=0,y=0,z=0,cast=false)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),mt);o.position.set(x,y,z);o.castShadow=cast;o.receiveShadow=true;parent.add(o);return o};
const ball=(parent,mt,x,y,z,sx,sy,sz,detail=16)=>{const o=new T.Mesh(new T.SphereGeometry(1,detail,Math.max(10,Math.floor(detail*.7))),mt);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o};
const conical=(parent,mt,x,y,z,r1,r2,h,segments=10)=>{const o=new T.Mesh(new T.CylinderGeometry(r1,r2,h,segments),mt);o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o};
const tube=(parent,from,to,r,mt,r2)=>{const a=new T.Vector3(...from),b=new T.Vector3(...to);const d=new T.Vector3().subVectors(b,a);const o=new T.Mesh(new T.CylinderGeometry(r2??r,r,d.length(),9),mt);o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());o.castShadow=true;parent.add(o);return o};
function textTexture(text,background='#152a3b',foreground='#ffffff',wide=512,high=128){const cv=document.createElement('canvas');cv.width=wide;cv.height=high;const c=cv.getContext('2d');c.fillStyle=background;c.fillRect(0,0,wide,high);c.strokeStyle='#e4fc7470';c.lineWidth=8;c.strokeRect(4,4,wide-8,high-8);c.fillStyle=foreground;c.font='900 '+Math.floor(high*.42)+'px system-ui, sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(text,wide/2,high/2,wide-22);const tx=new T.CanvasTexture(cv);tx.anisotropy=renderer.capabilities.getMaxAnisotropy?Math.min(4,renderer.capabilities.getMaxAnisotropy()):1;return tx}
function placard(parent,text,x,y,z,w=5,h=1.1,rot=0,bg='#152a3b',fg='#ffffff'){const t=textTexture(text,bg,fg,512,128);const me=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:t,side:T.DoubleSide}));me.position.set(x,y,z);me.rotation.y=rot;parent.add(me);return me}
function buildStadium(){
 box(scene,23,.12,128,m.track,0,.03,44);
 box(scene,20,.1,118,m.trackDark,0,.035,48);
 for(let i=0;i<=6;i++){const x=-9.6+i*3.2;box(scene,.085,.055,122,m.line,x,.1,44);}
 for(let z=0;z<=100;z+=5){for(let x of [-8,-4.8,-1.6,1.6,4.8,8]){if(z>0&&z<100&&z%10===0)box(scene,.11,.028,.7,m.white,x,.115,z)} }
 box(scene,19.2,.075,.5,m.white,0,.125,0);box(scene,19.2,.075,.7,m.white,0,.13,100);
 // large chequered finish mark
 for(let k=0;k<12;k++){box(scene,1.6,.081,.5,k%2===0?m.black:m.white,-8.8+k*1.6,.16,100)}
 for(let z=0;z<=100;z+=10){for(let side of [-1,1]){box(scene,.8,.12,1.5,m.white,side*11.6,.1,z);const p=conical(scene,m.steel,side*11.6,.45,z,.05,.08,.8);p.castShadow=false;placard(scene,String(z)+'m',side*11.6,.98,z,1.7,.47,side===1?Math.PI/2:-Math.PI/2,'#15263a','#faffb5')}}
 // finish arch and mid-track details
 for(let side of [-1,1]){box(scene,.53,6.6,.55,m.steel,side*10.1,3.35,100,true);box(scene,1.2,.35,1.3,m.dark,side*10.1,5.96,100)}
 box(scene,21,1.15,.7,m.dark,0,6.45,100,true);placard(scene,'GOAL  /  100m',0,6.47,99.59,14,1,0,'#112133','#f6ffb7');
 for(let side of [-1,1]){
  // tiered modern grandstand
  box(scene,24,1.5,163,m.dark,side*28,.15,44);
  for(let row=0;row<7;row++){
   const x=side*(15+row*2.85),y=.7+row*.61;
   box(scene,2.9,.33,156,row%2?m.seat:m.seat2,x,y,44);
   box(scene,.2,.7,156,m.steel,side*(16.3+row*2.85),y+.35,44);
  }
  for(let z=-25;z<=111;z+=24){const p=side*13.2;box(scene,.45,7,.5,m.steel,p,3.5,z,true);box(scene,3,.15,.25,m.steel,p,7,z);for(let xx=-1;xx<=1;xx++)ball(scene,mat(0xffefbb,.3),p+xx*.85,6.93,z,.2,.2,.16,8)}
  for(let z=-15;z<=110;z+=30){const ps=side*12.7;placard(scene,'100m RACE',ps,2.7,z,5.5,1,side===1?Math.PI/2:-Math.PI/2,'#13263c','#dbe5df')}
 }
 // multi-colour 3D crowd (instancing for performance)
 const count=mobile?340:930;const geo=new T.SphereGeometry(.21,7,5);const inst=new T.InstancedMesh(geo,mat(0xe3d5c8,.9),count);const dummy=new T.Object3D();const col=new T.Color();const colors=[0xe9b9a0,0xeadeda,0x98b9ce,0xdbda62,0xe28a6b,0x9fb66f,0x5e779c,0xdeb786,0xc1a9cb];
 for(let i=0;i<count;i++){const side=i%2?1:-1,row=(Math.floor(i/2)%7),z=-27+((i*19.13)%148),x=side*(15+row*2.85);dummy.position.set(x,.92+row*.61,z);dummy.scale.set(1,1,1);dummy.updateMatrix();inst.setMatrixAt(i,dummy.matrix);col.setHex(colors[(i*37)%colors.length]);inst.setColorAt(i,col)}inst.instanceMatrix.needsUpdate=true;scene.add(inst);
 for(let z=-36;z<=126;z+=26){for(let x of [-53,53]){conical(scene,m.steel,x,8,z,.16,.23,16);box(scene,4.5,.34,1.6,m.steel,x,16,z);for(let k=-1;k<=1;k++)ball(scene,m.white,x+k*1.3,15.8,z+.65,.5,.15,.1,9)}}
 // background skyline, scenery, and flagpoles
 const building=[0x54728a,0x3e657d,0x7894a5,0x567c90];for(let i=0;i<34;i++){const z=-100+i*11,x=(i%2?1:-1)*(67+(i*7%25)),h=6+(i*23%23);box(scene,6+(i%5)*2,h,6,mat(building[i%4]),x,h/2-.05,z)}
 const trunk=mat(0x6a5b42),leaf=mat(0x275c4b);for(let i=0;i<46;i++){const x=(i%2?1:-1)*(54+i%6*3),z=-80+(i*11.37)%230;conical(scene,trunk,x,2.5,z,.15,.27,5);ball(scene,leaf,x,5.4,z,2.2,3,2.2,9)}
 // shadows are available even when no texture files are fetched
}
buildStadium();
function lineShadow(parent,scale=1){const shadow=new T.Mesh(new T.CircleGeometry(1,20),new T.MeshBasicMaterial({color:0x09141b,transparent:true,opacity:.22,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.scale.set(scale,.5*scale,1);shadow.position.y=.115;parent.add(shadow);return shadow}
const humanX=-1.6,animalX=1.6;
function makeHuman(a){
 const root=new T.Group(),skeleton=new T.Group();root.add(skeleton);
 const skin=mat(palettes.skin[a.skin%palettes.skin.length]),hair=mat(palettes.hair[a.hair%palettes.hair.length]),shirt=mat(palettes.shirt[a.shirt%palettes.shirt.length],.72),pants=mat(palettes.pants[a.pants%palettes.pants.length]),shoes=mat(palettes.shoes[a.shoes%palettes.shoes.length],.6),white=mat(0xecf1ea), iris=mat(0x30291e,.32),dark=mat(0x312721);
 const bulky=.83+(a.build/10)*.45,wide=.89+(a.body/10)*.29;const height=.88+(a.height/10)*.26;
 skeleton.scale.set(wide*.94,height*.92,wide*.94);const torso=new T.Group();torso.position.set(0,1.05,0);skeleton.add(torso);
 ball(torso,pants,0,-.01,-.04,.36*bulky,.27,.25);
 const chest=ball(torso,shirt,0,.38,-.02,.41*bulky,.53,.26);chest.scale.x*=wide;
 ball(torso,skin,0,.89,.06,.13,.16,.13); // neck
 // decorative shirt panels / collar
 if(a.shirtStyle%3===0){ball(torso,white,0,.62,.22,.14,.10,.04)}
 if(a.shirtStyle%3===1){box(torso,.06,.65,.022,white,0,.35,.245)}
 if(a.shirtStyle%3===2){box(torso,.48,.095,.04,white,0,.3,.244)}
 // shoulder joints and articulated arms
 const arms=[],legs=[];
 for(const side of [-1,1]){
  const sh=new T.Group();sh.position.set(side*.42*bulky,.72,-.01);torso.add(sh);
  ball(sh,shirt,0,-.1,0,.19,.24,.20);
  ball(sh,a.shirtStyle>5?shirt:skin,0,-.34,.01,.135,.32,.135);
  const elbow=new T.Group();elbow.position.y=-.58;sh.add(elbow);
  ball(elbow,skin,0,-.23,.035,.12,.28,.11);
  ball(elbow,skin,0,-.5,.06,.135,.15,.12);arms.push({sh,elbow,side});
  const hip=new T.Group();hip.position.set(side*.2*wide,1.06,0);skeleton.add(hip);
  ball(hip,pants,0,-.28,0,.185*bulky,.36,.20);
  const knee=new T.Group();knee.position.y=-.52;hip.add(knee);
  ball(knee,pants,0,-.22,0,.155,.28,.17);
  ball(knee,shoes,0,-.49,.14,.175,.12,.31);
  box(knee,.28,.045,.29,m.white,0,-.57,.22);
  legs.push({hip,knee,side});
 }
 const head=new T.Group();head.position.set(0,1.08,.065);torso.add(head);
 const hscale=.95+a.face*.013;ball(head,skin,0,.13,0,.295*hscale,.34,.29);
 // chin, cheekbones, eyes in +Z facing direction
 ball(head,skin,0,-.02,.13,.19,.12,.19);
 for(const side of [-1,1]){
  const eyeX=side*(.115+a.eyes*.002),eyeY=.22;
  ball(head,white,eyeX,eyeY,.265,.045+a.eyes*.002,.035+a.eyes*.0015,.026,12);
  ball(head,iris,eyeX,eyeY,.293,.018+a.eyes*.001,.027,.01,12);
  const brow=ball(head,hair,eyeX,.296+(a.brow-5)*.006,.257,.08,.014+a.brow*.001,.018,10);brow.rotation.z=side*(a.brow-5)*-.03;
  ball(head,skin,side*.16,.09,.19,.084,.06,.06);
 }
 ball(head,skin,0,.09,.295,.042+a.nose*.003,.065,.055+a.nose*.003);
 const mouth=ball(head,dark,0,-.048,.280,.055+a.mouth*.003,.008+a.mouth*.0015,.012);
 const style=a.hairStyle%10;
 const hairCap=ball(head,hair,0,.37,-.036,.3,.13,.295);
 if(style===0)hairCap.scale.y=.42;
 else if(style===1){for(let i=0;i<8;i++){const ang=i*Math.PI*2/8;ball(head,hair,Math.cos(ang)*.22,.44,Math.sin(ang)*.20,.09,.10,.11,10)}}
 else if(style===2){for(let i=0;i<9;i++){ball(head,hair,Math.sin(i*2.3)*.22,.38+(i%3)*.055,Math.cos(i*2.3)*.2,.095,.105,.10,9)}}
 else if(style===3){for(let i=0;i<6;i++){ball(head,hair,(i-2.5)*.085,.47+Math.sin(i)*.04,.11,.096,.15,.16,11)}}
 else if(style===4){ball(head,hair,0,.48,-.27,.15,.21,.2);ball(head,hair,0,.26,-.33,.12,.26,.16)}
 else if(style===5){for(let i=0;i<11;i++){const ang=i*2.399;ball(head,hair,Math.cos(ang)*.22,.46+Math.sin(i)*.05,Math.sin(ang)*.21,.11,.14,.12,9)}}
 else if(style===6){for(let i=0;i<5;i++)ball(head,hair,0,.52+i*.085,-.05,.07*(1-i*.10),.12,.11,9)}
 else if(style===7){ball(head,hair,-.13,.41,.13,.18,.13,.14);ball(head,hair,.18,.49,.04,.19,.16,.19)}
 else if(style===8){for(let i=0;i<7;i++)ball(head,hair,(i-3)*.09,.46,.07,.07,.19,.10,9)}
 else {ball(head,hair,0,.29,-.22,.30,.37,.12);ball(head,hair,-.17,.23,.19,.09,.26,.10);ball(head,hair,.17,.23,.19,.09,.26,.10)}
 if(a.accessory===1||a.accessory===6){const glassMat=mat(0x202c3a,.2,.5);for(const side of [-1,1])ball(head,glassMat,side*.115,.22,.30,.095,.055,.014)}
 if(a.accessory===2||a.accessory===7){const cap=ball(head,mat(0x142739),0,.47,0,.32,.105,.31);ball(head,mat(0x1a3453),0,.45,.25,.28,.026,.17)}
 if(a.accessory===3||a.accessory===8){box(torso,.075,.30,.03,m.gold,0,.22,.275)}
 if(a.accessory===4){ball(head,mat(0xd9b769,.3,.8),-.31,.12,0,.04,.07,.034);ball(head,mat(0xd9b769,.3,.8),.31,.12,0,.04,.07,.034)}
 if(a.accessory===5||a.accessory===9){ball(torso,m.gold,0,.46,.268,.08,.08,.023)}
 lineShadow(root,.5);
 return {root,skeleton,torso,head,arms,legs,animate(t,speed,stamina=1){
 const moving=speed>.13, factor=moving?clamp(speed/8.5,.14,1.6):0;
 const phase=t*(6.0+factor*5.2),step=Math.sin(phase),op=Math.cos(phase);
 // Rest pose has zero limb movement. While running, hips swing opposite shoulders.
 torso.rotation.x=moving?-(.07+factor*.105):0;
 torso.rotation.z=step*.036*factor;
 torso.position.y=1.05+(moving?Math.abs(op)*.065*factor:0);
 head.rotation.x=-torso.rotation.x*.6;
 head.rotation.z=-step*.019*factor;
 arms.forEach((v,i)=>{
   const s=i===0?1:-1;
   v.sh.rotation.x=moving?(-step*s)*(.43+.42*factor):0;
   v.sh.rotation.z=v.side*(.08+factor*.018);
   v.elbow.rotation.x=moving?-.50-Math.max(0,step*s)*factor*.32:-.28;
 });
 legs.forEach((v,i)=>{
   const stride=Math.sin(phase+(i===0?0:Math.PI));
   v.hip.rotation.x=moving?stride*(.40+.44*factor):0;
   v.knee.rotation.x=moving?Math.max(0,-stride)*(.62+.33*factor):0;
 });
 }};
}
function makeBeast(data){
 const k=data.kind;const root=new T.Group(),bodyGroup=new T.Group();root.add(bodyGroup);const coat=mat(data.coat),highlight=mat(new T.Color(data.coat).multiplyScalar(1.15)),shade=mat(new T.Color(data.coat).multiplyScalar(.72)),nose=mat(0x2c2727),pale=mat(k==='zebra'?0xece8e2:0xf0dac3),white=mat(0xffffff),eyes=mat(0x18191c,.28);let legs=[],tail;
 const isHorse=['horse','zebra','gazelle','pronghorn'].includes(k),large=['horse','zebra','lion'].includes(k),catlike=['lion','cheetah','cat'].includes(k),biped=['ostrich','kangaroo'].includes(k);
 let sizes={bodyW:.4,bodyH:.35,bodyL:.78,hipY:.89,headY:1.17,leg:.42,scale:1};
 if(k==='greyhound'){sizes={bodyW:.31,bodyH:.30,bodyL:.89,hipY:1.02,headY:1.32,leg:.54,scale:1}}
 if(isHorse){sizes={bodyW:.42,bodyH:.48,bodyL:.99,hipY:1.53,headY:2.05,leg:.73,scale:1}}
 if(k==='lion'){sizes={bodyW:.52,bodyH:.45,bodyL:.92,hipY:1.06,headY:1.49,leg:.51,scale:1}}
 if(k==='cheetah'){sizes={bodyW:.32,bodyH:.29,bodyL:.96,hipY:1.02,headY:1.3,leg:.54,scale:1}}
 if(k==='rabbit'){sizes={bodyW:.35,bodyH:.32,bodyL:.55,hipY:.65,headY:.95,leg:.32,scale:1}}
 if(k==='cat'){sizes={bodyW:.30,bodyH:.29,bodyL:.67,hipY:.65,headY:.91,leg:.30,scale:1}}
 if(k==='ostrich'){sizes={bodyW:.40,bodyH:.52,bodyL:.71,hipY:1.38,headY:2.62,leg:.78,scale:1}}
 if(k==='kangaroo'){sizes={bodyW:.38,bodyH:.52,bodyL:.49,hipY:1.24,headY:2.14,leg:.64,scale:1}}
 if(k==='fox'){sizes.bodyL=.73;sizes.headY=1.15}
 const S=sizes;const torso=ball(bodyGroup,coat,0,S.hipY,0,S.bodyW,S.bodyH,S.bodyL,20);
 ball(bodyGroup,highlight,0,S.hipY+.12,S.bodyL*.43,S.bodyW*.84,S.bodyH*.85,.28);
 if(k==='lion'){ball(bodyGroup,shade,0,S.headY-.11,S.bodyL*.91,.56,.65,.48);for(let i=0;i<10;i++){const th=i*Math.PI*2/10;ball(bodyGroup,shade,Math.cos(th)*.42,S.headY-.06+Math.sin(th)*.46,S.bodyL*.9,.18,.2,.19)}}
 if(k==='zebra')for(let i=0;i<12;i++){const z=-.75+i*.135;const r=.17+.20*Math.sqrt(Math.max(.05,1-z*z));const strip=ball(bodyGroup,m.black,i%2?S.bodyW*.55:-S.bodyW*.55,S.hipY+(i%3-1)*.09,z,.12,.34,r*.19,9);strip.rotation.z=i%2?.4:-.5}
 if(k==='cheetah'){for(let i=0;i<43;i++){const a=i*2.399963,z=-.74+(i*.079)%1.47;const q=Math.sqrt(Math.max(.05,1-(z/S.bodyL)**2));ball(bodyGroup,shade,Math.cos(a)*S.bodyW*q*.93,S.hipY+Math.sin(a)*S.bodyH*q*.93,z,.052,.045,.07,7)}}
 if(k==='kangaroo'||k==='ostrich'){
  if(k==='ostrich'){ball(bodyGroup,shade,-.34,S.hipY+.04,-.06,.19,.37,.31);ball(bodyGroup,shade,.34,S.hipY+.04,-.06,.19,.37,.31);tube(bodyGroup,[0,S.hipY+.2,.44],[0,2.29,.63],.095,coat,.11);ball(bodyGroup,coat,0,2.39,.69,.18,.19,.20);ball(bodyGroup,pale,0,2.36,.9,.12,.06,.19);ball(bodyGroup,m.gold,0,2.29,1.02,.08,.04,.19)}
  else{ball(bodyGroup,coat,0,S.hipY+.35,.28,.36,.75,.29);ball(bodyGroup,highlight,0,S.hipY+.62,.35,.22,.33,.15);tube(bodyGroup,[0,1.69,.31],[0,2.05,.49],.11,coat);ball(bodyGroup,coat,0,2.18,.57,.22,.26,.23);for(let side of [-1,1]){tube(bodyGroup,[side*.12,2.32,.55],[side*.16,2.68,.57],.047,coat,.028);ball(bodyGroup,shade,side*.16,2.68,.57,.06,.11,.05)}}
  const headZ=k==='ostrich'?.69:.57,headY=k==='ostrich'?2.39:2.18;
  for(let side of [-1,1])ball(bodyGroup,eyes,side*.14,headY+.04,headZ+.15,.045,.052,.04);
  for(let side of [-1,1]){const hip=new T.Group();hip.position.set(side*.27,k==='kangaroo'?1.24:.93,k==='kangaroo'?-.05:0);bodyGroup.add(hip);ball(hip,coat,0,-.30,0,.22,.41,.22);const knee=new T.Group();knee.position.y=-.54;hip.add(knee);ball(knee,k==='ostrich'?shade:coat,0,-.28,.04,.105,.37,.105);ball(knee,nose,0,-.58,.22,.16,.09,.42);legs.push({hip,knee,side})}
  if(k==='kangaroo'){tube(bodyGroup,[0,.96,-.42],[0,.43,-1.34],.17,shade,.25);tube(bodyGroup,[0,.43,-1.34],[0,.15,-1.89],.11,shade,.16);for(let side of [-1,1]){tube(bodyGroup,[side*.31,1.59,.22],[side*.44,1.21,.57],.11,coat,.09);ball(bodyGroup,coat,side*.47,1.18,.65,.1,.16,.09)}}
 }else{
  const neck=ball(bodyGroup,coat,0,S.headY-.16,S.bodyL*.79,S.bodyW*.57,isHorse?.47:.28,isHorse?.37:.35);
  const head=ball(bodyGroup,coat,0,S.headY,S.bodyL+.42,isHorse?.25:.30,isHorse?.34:.28,isHorse?.40:.36);
  ball(bodyGroup,highlight,0,S.headY-.13,S.bodyL+.68,isHorse?.16:.21,isHorse?.27:.15,isHorse?.28:.28);
  ball(bodyGroup,nose,0,S.headY-.13,S.bodyL+(isHorse?.91:.95),.13,.08,.075);
  // cheeks, eyes and ears
  for(let side of [-1,1]){
   ball(bodyGroup,eyes,side*(isHorse?.20:.24),S.headY+.08,S.bodyL+.6,.055,.063,.04,12);
   ball(bodyGroup,white,side*(isHorse?.214:.254),S.headY+.105,S.bodyL+.637,.015,.018,.013,7);
   const ear=ball(bodyGroup,coat,side*(isHorse?.19:.21),S.headY+.28,S.bodyL+.2, isHorse?.10:.13, k==='rabbit'?.52:isHorse?.25:.23,.115);
   ear.rotation.z=side*.20;
   if(k==='fox'){ear.scale.y*=1.7;ear.scale.x*=.75}
   if(k==='cat'){ear.scale.y*=1.32;ear.scale.x*=.8}
  }
  if(k==='rabbit'){for(let s of [-1,1]){const ear=ball(bodyGroup,highlight,s*.15,S.headY+.67,S.bodyL+.22,.10,.49,.10);ear.rotation.z=s*.14}}
  if(k==='gazelle'||k==='pronghorn'){for(let s of [-1,1]){tube(bodyGroup,[s*.17,S.headY+.34,S.bodyL+.2],[s*.30,S.headY+.83,S.bodyL+.16],.05,shade,.02);tube(bodyGroup,[s*.30,S.headY+.83,S.bodyL+.16],[s*.44,S.headY+1.1,S.bodyL+.14],.028,shade,.014);if(k==='pronghorn')tube(bodyGroup,[s*.27,S.headY+.65,S.bodyL+.2],[s*.11,S.headY+.82,S.bodyL+.28],.03,shade,.015)}}
  if(k==='horse'||k==='zebra'){for(let i=0;i<7;i++)ball(bodyGroup,shade,0,S.headY+.34-i*.085,S.bodyL-.07+i*.08,.08,.11,.10,9)}
  if(k==='cheetah'){for(let s of [-1,1]){tube(bodyGroup,[s*.22,S.headY+.04,S.bodyL+.68],[s*.22,S.headY-.22,S.bodyL+.80],.023,shade)}}
  const lg=isHorse?.70:S.leg;
  for(let front of [-1,1])for(let side of [-1,1]){
   const hip=new T.Group();hip.position.set(side*S.bodyW*.8,S.hipY-.20,front*S.bodyL*.70);bodyGroup.add(hip);
   ball(hip,coat,0,-lg*.45,0,large?.19:.14,lg*.65,large?.19:.15);
   const knee=new T.Group();knee.position.y=-lg*.90;hip.add(knee);ball(knee,coat,0,-lg*.31,.03,large?.12:.10,lg*.40,large?.12:.105);
   ball(knee,k==='horse'||k==='zebra'?m.black:shade,0,-lg*.72,.12,large?.20:.15,.095,large?.26:.19);legs.push({hip,knee,side,front});
  }
  const tailGroup=new T.Group();tailGroup.position.set(0,S.hipY+.07,-S.bodyL*.83);bodyGroup.add(tailGroup);
  tube(tailGroup,[0,0,0],[0,-.1,-.55],isHorse?.13:.085,coat,.08);
  tube(tailGroup,[0,-.1,-.55],[0,-.32,-.85],.085,shade,.03);
  if(k==='fox'){ball(tailGroup,highlight,0,-.2,-.77,.19,.2,.45)}
  if(k==='lion')ball(tailGroup,shade,0,-.32,-.89,.12,.14,.19);
  if(k==='cat'||k==='cheetah'){tube(tailGroup,[0,-.32,-.85],[.1,-.08,-1.13],.05,coat,.038)}
  if(k==='horse'||k==='zebra')ball(tailGroup,shade,0,-.31,-.69,.12,.26,.16);
  tail=tailGroup;
 }
 bodyGroup.scale.setScalar((['cat','rabbit'].includes(k))?.87:1);
 lineShadow(root,large?.8:.6);
 return {root,bodyGroup,legs,tail,animate(t,speed){const speedF=clamp(speed/13,0,1.5),phase=t*(2.8+speedF*6),s=Math.sin(phase),hop=k==='rabbit'||k==='kangaroo';bodyGroup.position.y=(hop?Math.abs(s)*.16:Math.sin(phase*2)*.047)*speedF;bodyGroup.rotation.x=hop?s*.045:Math.sin(phase)*.014;legs.forEach((v,i)=>{const offset=(i%2===0?0:Math.PI)+((v.front||1)<0?Math.PI*.35:0);v.hip.rotation.x=Math.sin(phase+offset)*(hop?.85:.62)*speedF;v.knee.rotation.x=Math.max(0,-Math.sin(phase+offset))*.85*speedF});if(tail){tail.rotation.y=Math.sin(t*5)*.16;tail.rotation.x=Math.sin(t*6)*.09}}};
}
// 3D player and opponent are rebuilt on customization / opponent changes.
let human=makeHuman(save.avatar);human.root.position.set(humanX,.13,0);scene.add(human.root);
let opponent=makeBeast(animals[clamp(save.chosen,0,animals.length-1)]);opponent.root.position.set(animalX,.13,0);scene.add(opponent.root);
function refreshHuman(){scene.remove(human.root);human=makeHuman(save.avatar);human.root.position.set(humanX,.13,0);scene.add(human.root)}
function refreshOpponent(){scene.remove(opponent.root);opponent=makeBeast(animals[save.chosen]);opponent.root.position.set(animalX,.13,0);scene.add(opponent.root);refreshMenu()}
// Subtle footstep puffs, with pooled 3D meshes.
const dust=[],dustMat=new T.MeshBasicMaterial({color:0xd4b6a1,transparent:true,opacity:.3,depthWrite:false});for(let i=0;i<38;i++){const p=new T.Mesh(new T.SphereGeometry(1,7,5),dustMat.clone());p.visible=false;scene.add(p);dust.push({mesh:p,life:0,max:1})}let dustCursor=0;
function kickDust(x,z,speed){if(speed<2)return;const p=dust[dustCursor++%dust.length];p.life=.4+Math.random()*.2;p.max=p.life;p.mesh.visible=true;p.mesh.position.set(x+Math.random()*.4-.2,.13,z-0.5);p.mesh.scale.set(.2,.09,.33);p.mesh.material.opacity=.23}
const clock=new T.Clock();let mode='menu',race=null,camSpin=0,cameraTarget=new T.Vector3(0,1.5,3),camPos=new T.Vector3(-5.8,3.1,9.2),sceneTime=0,sfx=true,lastHUD=0,raceName='';
const initResize=()=>{const w=window.innerWidth,h=window.innerHeight;camera.aspect=w/h;camera.fov=w<h?59:52;camera.updateProjectionMatrix();renderer.setSize(w,h,false)};addEventListener('resize',initResize);initResize();
let audioCtx;function beep(freq=450,dur=.1,type='sine',gain=.04){if(!sfx)return;try{audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();const osc=audioCtx.createOscillator(),g=audioCtx.createGain();osc.type=type;osc.frequency.value=freq;g.gain.setValueAtTime(gain,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+dur);osc.connect(g).connect(audioCtx.destination);osc.start();osc.stop(audioCtx.currentTime+dur+.01)}catch(e){}}
function showScreen(mo){mode=mo;['menu','custom','train','beasts'].forEach(x=>$(x+'Screen').classList.toggle('active',x===mo));$('bottomNav').classList.toggle('gone',mo==='race');document.querySelectorAll('[data-screen]').forEach(b=>b.classList.toggle('active',b.dataset.screen===mo));$('raceHUD').style.display=mo==='race'?'flex':'none';$('raceControls').style.display=mo==='race'?'block':'none';$('resultOverlay').style.display='none';if(mo!=='race'){$('countdown').style.display='none';human.root.position.z=0;opponent.root.position.z=0;human.root.position.x=humanX;opponent.root.position.x=animalX;human.root.rotation.y=0;opponent.root.rotation.y=0;$('raceMsg').style.display='none';$('raceBanner').textContent='';}else {$('raceBanner').textContent='100m走'}if(mo==='train')renderTraining();if(mo==='custom')renderCustom();if(mo==='beasts')renderBeasts();refreshMenu()}
const cost=(id)=>{const level=save.stats[id]||1;return Math.floor(45*Math.pow(1.34,level-1)+(level-1)*7)};
const unlocked=(i)=>i===0||save.won.includes(animals[i-1].id);
function refreshMenu(){let x=animals[save.chosen]||animals[0];$('coinDisplay').textContent=Math.floor(save.money).toLocaleString();$('nextName').textContent=x.name;$('nextSub').textContent=x.sub;$('nextSpeed').textContent=x.kph+' km/h';$('nextBar').style.width=(x.kph/110*100).toFixed(1)+'%';const win=save.won.includes(x.id);$('nextDescription').textContent=win?'勝利済み — 記録の更新に挑戦':'勝利すると次の生物が解放される';$('startBtn').textContent='▶ '+x.name+'と100m走'}
function renderTraining(){const el=$('trainList');el.innerHTML='';const cards=training.map(item=>{const level=save.stats[item.id]||1,need=cost(item.id),max=level>=50;return `<div class="trainitem"><header><div><div class="label">${item.name.toUpperCase()}</div><h3>${item.name} <span class="mini">Lv.${level}</span></h3></div><button data-train="${item.id}" ${max||save.money<need?'disabled':''}>${max?'MAX':need+' G'}</button></header><p>${item.desc} ・ ${item.gain}</p><div class="trainLine"><i style="width:${Math.min(100,level*2)}%"></i></div></div>`}).join('');el.innerHTML=cards;el.querySelectorAll('[data-train]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.train,n=cost(id);if(save.money<n||save.stats[id]>=50)return;save.money-=n;save.stats[id]++;store();beep(670,.09,'triangle',.055);renderTraining();refreshMenu()}))}
function renderBeasts(){const el=$('animalList');el.innerHTML='';el.innerHTML=animals.map((a,i)=>`<div class="animalitem ${i===save.chosen?'selected':''} ${unlocked(i)?'':'locked'}"><header><div><div class="label">STAGE ${String(i+1).padStart(2,'0')} / ${a.kph}km/h</div><h3>${a.name} ${save.won.includes(a.id)?'<span class="mini">★ 勝利済</span>':''}</h3></div><button data-beast="${i}" ${unlocked(i)?'':'disabled'}>${i===save.chosen?'選択中':unlocked(i)?'挑戦する':'未解放'}</button></header><p>${a.sub}。${!unlocked(i)?'前の動物に勝つと解放されます。':''}</p></div>`).join('');el.querySelectorAll('[data-beast]').forEach(b=>b.addEventListener('click',()=>{const i=+b.dataset.beast;if(!unlocked(i))return;save.chosen=i;store();refreshOpponent();renderBeasts();beep(540,.1)}))}
function renderCustom(){const el=$('customList');el.innerHTML='';const name=document.createElement('div');name.className='formrow';name.innerHTML='<span>ランナー名</span><input id="runnerName" type="text" maxlength="16" placeholder="ランナー" autocomplete="off">';el.appendChild(name);$('runnerName').value=save.runnerName;$('runnerName').addEventListener('change',e=>{save.runnerName=e.target.value.trim().slice(0,16)||'ランナー';store()});
 categories.forEach((c,i)=>{const [label,key,kind,min,max]=c;const row=document.createElement('div');row.className='formrow';const l=document.createElement('span');l.textContent=label;row.appendChild(l);let input,display;
 if(kind==='range'){input=document.createElement('input');input.type='range';input.min=min;input.max=max;input.step=1;input.value=clamp(Number(save.avatar[key])||0,min,max);display=document.createElement('span');display.className='val';display.textContent=input.value;row.appendChild(input);row.appendChild(display);input.addEventListener('input',()=>{save.avatar[key]=+input.value;display.textContent=input.value;refreshHuman();store()})}
 else{input=document.createElement('select');palettes[min].forEach((x,j)=>{const o=document.createElement('option');o.value=j;o.textContent=(j+1).toString().padStart(2,'0')+'  '+x;input.appendChild(o)});input.value=save.avatar[key];input.addEventListener('change',()=>{save.avatar[key]=+input.value;refreshHuman();store()});row.appendChild(input)}el.appendChild(row)
 });const note=document.createElement('p');note.className='hint';note.textContent='16か所を個別調整。顔・体型・服装は3Dモデルに反映されます。';el.appendChild(note)}
// Tap race physics — speed is in metres per second, distances in metres.
function startRace(){if(mode==='race')return;raceName=animals[save.chosen].name;race={time:0,phase:'countdown',count:3.3,lastCount:4,humanD:0,enemyD:0,humanV:0,enemyV:0,combo:0,lastFoot:'',lastTap:0,drive:0,taps:0,stamina:1,burstCharge:0,burstLeft:0,burstUsed:false,hFinish:null,eFinish:null,lastStep:-1};showScreen('race');race.time=0;$('countdown').textContent='3';$('countdown').style.display='flex';$('raceBanner').textContent='第'+(save.chosen+1)+'戦 / '+raceName;$('enemyLabel').textContent='対戦相手 / '+raceName;$('burstBtn').disabled=true;$('burstBtn').classList.remove('ready');updateHud(true);beep(480,.11);}
function tap(side){if(!race||race.phase!=='running'||race.hFinish!==null)return;const r=race;const now=r.time;r.taps=(r.taps||0)+1;const alternating=side!==r.lastFoot,quick=now-r.lastTap<.55;if(alternating){r.combo=quick?Math.min(99,r.combo+1):1;r.drive=clamp(r.drive+(.08+save.stats.technique*.004)*(quick?1.15:1),0,1.3);r.burstCharge=clamp(r.burstCharge+2.8+Math.min(4,r.combo*.12)+save.stats.technique*.10,0,100)}else{r.combo=0;r.drive=clamp(r.drive+.025,0,1.3)}r.lastFoot=side;r.lastTap=now;const b=$(side==='L'?'leftTap':'rightTap');b.classList.add('hit');setTimeout(()=>b.classList.remove('hit'),70);if(r.combo%6===0)beep(230+r.combo*5,.045,'triangle',.012);if(navigator.vibrate&&r.combo%3===0)navigator.vibrate(10)}
function activateBurst(){if(!race||race.phase!=='running'||race.burstCharge<99||race.burstLeft>0||race.hFinish!==null)return;race.burstCharge=0;race.burstLeft=2.8;race.burstUsed=true;beep(800,.35,'sawtooth',.075);showNotice('スパート中',1.2);$('burstBtn').disabled=true;$('burstBtn').classList.remove('ready')}
function showNotice(s,seconds){$('raceMsg').textContent=s;$('raceMsg').style.display='block';noticeTime=seconds}let noticeTime=0;
function finishRace(){const r=race;if(!r)return;r.phase='results';$('countdown').style.display='none';$('raceControls').style.display='none';$('raceHUD').style.display='none';$('resultOverlay').style.display='flex';const won=r.hFinish<r.eFinish;save.races=(save.races||0)+1;save.best=save.best==null?r.hFinish:Math.min(save.best,r.hFinish);save.bestByBeast[animals[save.chosen].id]=Math.min(save.bestByBeast[animals[save.chosen].id]||999,r.hFinish);const reward=Math.round((won?130:56)+animals[save.chosen].tier*(won?34:11)+Math.max(0,18-r.hFinish)*3);save.money+=reward;if(won&&!save.won.includes(animals[save.chosen].id)){save.won.push(animals[save.chosen].id);if(save.chosen<animals.length-1)save.chosen++}store();$('resultEyebrow').textContent='100 METERS / OFFICIAL RESULT';$('resultTitle').textContent=won?'VICTORY!':'TRY AGAIN';$('resultTitle').style.color=won?'#dfff62':'#ffbb71';$('resultTime').textContent=r.hFinish.toFixed(2)+'s';$('resultEnemy').textContent=r.eFinish.toFixed(2)+'s';$('resultMoney').textContent='+'+reward+' G';$('resultMsg').textContent=won?'人間の勝利！ '+(save.chosen<animals.length?'次の生物に挑戦できます。':''):'敗北しても育成資金を獲得しました。鍛え直して再挑戦。';refreshMenu();beep(won?890:200,.34,won?'triangle':'sine',.075)}
function updateRace(dt){const r=race;if(!r)return;if(r.phase==='countdown'){r.count-=dt;const n=Math.ceil(clamp(r.count,0,3));if(n>0){$('countdown').textContent=n;if(n!==r.lastCount){beep(480+n*100,.12);r.lastCount=n}}else{$('countdown').textContent='GO!';r.phase='running';r.time=0;showNotice('GO!',.7);beep(1150,.38,'triangle',.08);setTimeout(()=>{$('countdown').style.display='none'},450)}return}
 if(r.phase!=='running')return;const dtSafe=Math.min(.045,dt);r.time+=dtSafe;r.drive=Math.max(0,r.drive-dtSafe*.15);if(r.combo>0&&r.time-r.lastTap>.65)r.combo=0;
 const base=(7.15+(save.stats.speed-1)*1.17+save.stats.technique*.10),maxSpeed=base*(r.burstLeft>0?1.47:1);const hasInput=(r.taps||0)>0&&(r.time-r.lastTap)<.38;const tempo=clamp(r.drive*.98,.08,1.15);const fatigued=(.55+.45*r.stamina);const targetHuman=hasInput?maxSpeed*Math.min(1.07,tempo)*fatigued:0;const accel=7.8+(save.stats.power-1)*.55;
 if(r.hFinish===null){if(!hasInput){r.humanV=0;r.combo=0}else if(r.humanV<targetHuman)r.humanV=Math.min(targetHuman,r.humanV+accel*dtSafe);else r.humanV=Math.max(targetHuman,r.humanV-5.8*dtSafe);r.humanD+=r.humanV*dtSafe;
 r.stamina=clamp(r.stamina-((r.drive>.50?.012:.001)*(1/(1+save.stats.stamina*.09))+(r.burstLeft>0?.028:0))*dtSafe+(r.drive<.4?.014:0)*dtSafe,.32,1);if(r.humanD>=100){const before=r.humanD-r.humanV*dtSafe;r.hFinish=r.time-dtSafe+(100-before)/Math.max(.01,r.humanV);r.humanD=100;beep(930,.16,'sine',.05)}}
 const a=animals[Math.max(0,Math.min(animals.length-1,save.chosen))],maxB=a.kph/3.6;
 if(r.eFinish===null){const phaseBonus=r.enemyD<22?1:(r.enemyD>81?.95:1);const enemyTarget=maxB*phaseBonus;r.enemyV=Math.min(enemyTarget,r.enemyV+a.acc*dtSafe);r.enemyD+=r.enemyV*dtSafe;if(r.enemyD>=100){const before=r.enemyD-r.enemyV*dtSafe;r.eFinish=r.time-dtSafe+(100-before)/Math.max(.01,r.enemyV);r.enemyD=100}}
 r.burstLeft=Math.max(0,r.burstLeft-dtSafe);const ready=r.burstCharge>=99&&r.burstLeft<=0;const button=$('burstBtn');if(button.disabled===ready){button.disabled=!ready;button.classList.toggle('ready',ready)}
 human.root.position.z=r.humanD;opponent.root.position.z=r.enemyD;
 if(r.humanV>2){const step=Math.floor(r.time*clamp(r.humanV,3,20)*1.15);if(step!==r.lastStep){r.lastStep=step;kickDust(humanX,r.humanD,r.humanV);if(step%3===0)beep(110,.026,'sine',.008)}}
 if(r.eFinish===null&&r.enemyV>7&&Math.random()<dtSafe*10)kickDust(animalX,r.enemyD,r.enemyV);
 if(noticeTime>0){noticeTime-=dtSafe;if(noticeTime<=0)$('raceMsg').style.display='none'}
 if(r.hFinish!==null&&r.eFinish!==null){finishRace();return}lastHUD+=dtSafe;if(lastHUD>.055){lastHUD=0;updateHud()}}
function updateHud(force=false){if(!race)return;const r=race;$('dist').textContent=r.humanD.toFixed(1);$('enemyDist').textContent=r.enemyD.toFixed(1);$('timer').textContent=r.time.toFixed(2);$('speedDisplay').innerHTML=(r.humanV*3.6).toFixed(1)+' <small>km/h</small>';$('comboDisplay').textContent='連続 '+r.combo;$('humanProgress').style.width=r.humanD+'%';$('enemyProgress').style.width=r.enemyD+'%';$('staminaBar').style.width=r.stamina*100+'%';$('burstPercent').textContent=Math.round(r.burstCharge);$('burstBar').style.width=r.burstCharge+'%';const diff=r.humanD-r.enemyD;$('diffLabel').textContent=diff>=0?'+'+diff.toFixed(1)+'m':'−'+Math.abs(diff).toFixed(1)+'m';$('diffLabel').style.color=diff>=0?'#dcff62':'#ffb678';$('burstTxt').textContent=r.burstLeft>0?'スパート中':r.burstCharge>=99?'使用できます':'ためる'}
$('startBtn').addEventListener('click',startRace);$('goCustom').addEventListener('click',()=>showScreen('custom'));
document.querySelectorAll('[data-screen]').forEach(b=>b.addEventListener('click',()=>showScreen(b.dataset.screen)));document.querySelectorAll('[data-back]').forEach(b=>b.addEventListener('click',()=>showScreen('menu')));
for(const [side,id] of [['L','leftTap'],['R','rightTap']]){const el=$(id);el.addEventListener('pointerdown',e=>{e.preventDefault();tap(side)});el.addEventListener('contextmenu',e=>e.preventDefault())}
$('burstBtn').addEventListener('pointerdown',e=>{e.preventDefault();activateBurst()});$('resultHome').addEventListener('click',()=>{race=null;showScreen('menu');refreshOpponent()});$('retryBtn').addEventListener('click',()=>{race=null;showScreen('menu');refreshOpponent();startRace()});
$('audioBtn').addEventListener('click',()=>{sfx=!sfx;$('audioBtn').textContent=sfx?'♪':'×'});$('fullBtn').addEventListener('click',()=>{if(document.fullscreenElement)document.exitFullscreen?.();else document.documentElement.requestFullscreen?.().catch(()=>{})});
addEventListener('keydown',e=>{if(e.target?.tagName==='INPUT')return;if(['Space','ArrowLeft','ArrowRight','KeyA','KeyD'].includes(e.code))e.preventDefault();if(e.repeat)return;if(e.code==='KeyA'||e.code==='ArrowLeft')tap('L');if(e.code==='KeyD'||e.code==='ArrowRight')tap('R');if(e.code==='Space')activateBurst();if(e.code==='Escape'&&mode!=='race')showScreen('menu')});
// Drag the 3D model in studio, with direct pointer interaction.
let dragging=false,pointerStart=0;$('world').addEventListener('pointerdown',e=>{if(mode==='custom'||mode==='beasts'){dragging=true;pointerStart=e.clientX;$('world').setPointerCapture?.(e.pointerId)}});$('world').addEventListener('pointermove',e=>{if(dragging){camSpin+=(e.clientX-pointerStart)*.012;pointerStart=e.clientX}});$('world').addEventListener('pointerup',()=>dragging=false);$('world').addEventListener('pointercancel',()=>dragging=false);
function updateCam(dt){const d=race?.humanD||0;let wantedPos,wantedTarget;
 if(mode==='race'){const run=race?.humanV||0;const shake=run>2?Math.min(.09,run*.004):0;wantedPos=new T.Vector3(-.35+Math.sin(sceneTime*13)*shake,2.48+Math.cos(sceneTime*23)*shake*.28,d-6.7);wantedTarget=new T.Vector3(-.20,1.27,d+12);camera.fov=mix(camera.fov,((innerWidth<innerHeight)?56:48)+(race?.burstLeft>0&&run>0?3:0),Math.min(1,dt*2.2));camera.updateProjectionMatrix()}
 else if(mode==='custom'){wantedPos=new T.Vector3(humanX+Math.sin(camSpin)*3.3,1.7,Math.cos(camSpin)*3.3);wantedTarget=new T.Vector3(humanX,1.45,0);if(Math.abs(camSpin)<.0001){wantedPos.x=humanX+1.65;wantedPos.z=3.6}}
 else if(mode==='beasts'){wantedPos=new T.Vector3(animalX+Math.sin(camSpin+sceneTime*.12)*5,2.2,Math.cos(camSpin+sceneTime*.12)*5);wantedTarget=new T.Vector3(animalX,1.35,0)}
 else if(mode==='train'){wantedPos=new T.Vector3(-2.7,2.45,7);wantedTarget=new T.Vector3(humanX,1.25,0)}
 else{wantedPos=new T.Vector3(-5.4,3.08,9.9);wantedTarget=new T.Vector3(0,1.1,0)}
 const t=Math.min(1,dt*(mode==='race'?3.8:2.9));camPos.lerp(wantedPos,t);cameraTarget.lerp(wantedTarget,t);camera.position.copy(camPos);camera.lookAt(cameraTarget)}
function frame(){requestAnimationFrame(frame);const dt=Math.min(.046,clock.getDelta());sceneTime+=dt;if(mode==='race')updateRace(dt);// Visual animations use actual runner and opponent speeds
 const hspeed=mode==='race'?(race?.humanV||0):0,espeed=mode==='race'?(race?.enemyV||0):0;
 human.animate(sceneTime,hspeed,mode==='race'?race.stamina:1);opponent.animate(sceneTime,espeed);
 if(mode!=='race'){human.root.position.z=0;opponent.root.position.z=0;human.root.rotation.y=(mode==='custom')?Math.sin(sceneTime*.3)*.03:0;opponent.root.rotation.y=0}
 dust.forEach(x=>{if(x.life>0){x.life-=dt;x.mesh.scale.multiplyScalar(1+dt*1.9);x.mesh.position.y+=dt*.24;x.mesh.material.opacity=Math.max(0,.25*x.life/x.max);if(x.life<=0)x.mesh.visible=false}});
 updateCam(dt);sun.position.z=(mode==='race'?race.humanD:0)+24;sun.target.position.z=mode==='race'?race.humanD:0;sun.target.updateMatrixWorld();renderer.render(scene,camera)}
// Replace synthetic expression typo guard for minifier-safe runtime.
renderCustom();renderTraining();renderBeasts();refreshMenu();showScreen('menu');requestAnimationFrame(frame);loader.style.display='none';
})();