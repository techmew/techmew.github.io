/* BEAST BREAKER 3D — fully modeled, live WebGL racing. Three.js r148 (MIT). */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const loader=$('loader'),loadStatus=$('loadStatus');
const fail=msg=>{loadStatus.textContent=msg;loader.querySelector('.spinner').style.display='none'};
if(!window.THREE){fail('3Dエンジンを読み込めませんでした。通信とブラウザのWebGL対応を確認してください。');return}
const T=THREE, clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), mix=(a,b,t)=>a+(b-a)*t;
const mobile=/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent)||innerWidth<800;
const racer=(id,name,sub,kph,acc,kind,coat,tier,profile='steady',group='現生動物')=>({id,name,sub,kph,acc,kind,coat,tier,profile,group});
const animals=[
 racer('dog','イヌ','走りの基本を学ぶ',35,4.5,'dog',0xc28a58,1),
 racer('cat','ネコ','軽い体で素早く加速',48,5.8,'cat',0xc7a47b,1),
 racer('fox','アカギツネ','鋭い加速と小さな体',50,6,'fox',0xc76e37,2),
 racer('dodo','ドードー','太い脚で駆ける絶滅鳥',41,5.2,'dodo',0x817f77,2,'heavy','絶滅動物'),
 racer('rabbit','ノウサギ','跳躍を繰り返す',65,7,'rabbit',0xb99d76,2,'hopper'),
 racer('greyhound','グレイハウンド','流線型の競走犬',70,7.3,'greyhound',0xa69588,3,'sprinter'),
 racer('zebra','シマウマ','長い脚と力強い加速',60,5.8,'zebra',0xe8e6df,3),
 racer('wildboar','巨大イノシシ','低い姿勢から突進する',73,6.5,'boar',0x75563c,4,'heavy','現生動物'),
 racer('ostrich','ダチョウ','二本脚の高速走行',70,6.2,'ostrich',0x272931,4,'sprinter'),
 racer('kangaroo','アカカンガルー','大きな跳躍で進む',70,6.2,'kangaroo',0xb77651,4,'hopper'),
 racer('moa','ジャイアントモア','巨大な絶滅鳥',78,6.5,'moa',0x706a58,5,'hopper','絶滅動物'),
 racer('horse','クォーターホース','強い加速と長いストライド',71,7,'horse',0x9e6240,5,'sprinter'),
 racer('wolf','オオカミ','群れを離れた長距離走者',79,7.2,'wolf',0x797977,6),
 racer('giantsloth','巨大ナマケモノ','長い前脚で力強く駆ける',83,5.1,'giantsloth',0x80705c,6,'heavy','絶滅動物'),
 racer('lion','ライオン','大型肉食獣の猛ダッシュ',80,7.7,'lion',0xd49c54,7,'sprinter'),
 racer('deer','アカシカ','跳ねるような軽い走り',86,7.6,'deer',0xaa8055,7,'hopper'),
 racer('smilodon','スミロドン','鋭い牙を持つ絶滅肉食獣',87,8.4,'smilodon',0xb69c75,8,'sprinter','絶滅動物'),
 racer('gazelle','スプリングボック','加速と跳躍を両立',88,8.4,'gazelle',0xbf956d,8,'hopper'),
 racer('pronghorn','プロングホーン','長い距離を高速で走る',88,8.7,'pronghorn',0xbc9b75,8,'sprinter'),
 racer('tiger','トラ','大きな体と高い瞬発力',91,8.4,'tiger',0xc68d52,9,'sprinter'),
 racer('unicorn','ユニコーン','角を持つ伝説の馬',96,8.5,'unicorn',0xe1dbd3,9,'sprinter','架空生物'),
 racer('cheetah','チーター','最高速度に優れた現生動物',103.5,11,'cheetah',0xe3ae65,10,'sprinter'),
 racer('gorilla','ゴリラ','大きな腕で地面を蹴る',99,5.8,'gorilla',0x393a36,11,'heavy'),
 racer('elephant','アフリカゾウ','巨体から生まれる力強い加速',101,5.4,'elephant',0x777e7b,11,'heavy'),
 racer('hippo','カバ','重い体で突進する',105,6,'hippo',0x71655f,12,'heavy'),
 racer('rhino','サイ','一直線の突進力',109,6.3,'rhino',0x777975,12,'heavy'),
 racer('mammoth','マンモス','長い牙と巨体を持つ絶滅動物',112,5.6,'mammoth',0x7d5d45,13,'heavy','絶滅動物'),
 racer('woollyrhino','ケナガサイ','毛皮に覆われた巨大なサイ',115,6.2,'woollyrhino',0x726153,13,'heavy','絶滅動物'),
 racer('direwolf','ダイアウルフ','大きな体の絶滅したイヌ科',120,8.5,'direwolf',0x66635d,14,'sprinter','絶滅動物'),
 racer('terrorbird','フォルスラコス','巨大なくちばしの恐鳥',121,8.2,'terrorbird',0x8e8070,14,'hopper','絶滅動物'),
 racer('cavebear','ホラアナグマ','重量級の絶滅したクマ',123,6.7,'cavebear',0x5b493f,15,'heavy','絶滅動物'),
 racer('triceratops','トリケラトプス','三本の角を持つ恐竜',127,6.6,'triceratops',0x6b7b60,15,'heavy','恐竜'),
 racer('stegosaurus','ステゴサウルス','背中に大きな骨板を持つ恐竜',129,6.4,'stegosaurus',0x627b66,16,'heavy','恐竜'),
 racer('ankylosaurus','アンキロサウルス','全身を鎧で覆われた恐竜',131,6.4,'ankylosaurus',0x667767,16,'heavy','恐竜'),
 racer('parasaurolophus','パラサウロロフス','長い頭の突起を持つ恐竜',136,8.1,'parasaurolophus',0x728d79,17,'steady','恐竜'),
 racer('gallimimus','ガリミムス','細い脚で高速疾走する恐竜',140,10.4,'gallimimus',0xa69c79,18,'sprinter','恐竜'),
 racer('velociraptor','ヴェロキラプトル','小型の素早い肉食恐竜',144,11,'velociraptor',0x8a8b73,18,'sprinter','恐竜'),
 racer('deinonychus','デイノニクス','長い尾でバランスを取る恐竜',148,11.2,'deinonychus',0x647e72,19,'sprinter','恐竜'),
 racer('carnotaurus','カルノタウルス','頭に角を持つ大型肉食恐竜',152,9.8,'carnotaurus',0x986e5b,19,'sprinter','恐竜'),
 racer('trex','ティラノサウルス','巨体で加速する肉食恐竜',158,9.4,'trex',0x77826d,20,'heavy','恐竜'),
 racer('spinosaurus','スピノサウルス','背中の帆が特徴の大型恐竜',162,9.6,'spinosaurus',0x597780,20,'heavy','恐竜'),
 racer('pegasus','ペガサス','翼を持つ伝説の馬',167,11.5,'pegasus',0xe0d9cd,21,'sprinter','架空生物'),
 racer('cerberus','ケルベロス','三つの頭を持つ魔獣',173,11.4,'cerberus',0x39323d,21,'sprinter','架空生物'),
 racer('griffin','グリフォン','ワシの翼と獣の体を持つ',179,11.6,'griffin',0xa88754,22,'sprinter','架空生物'),
 racer('minotaur','ミノタウロス','牛の頭を持つ二足歩行の怪物',186,10.5,'minotaur',0x5e524d,22,'heavy','架空生物'),
 racer('dragon','ドラゴン','巨大な翼と角を持つ生物',192,12.0,'dragon',0x7c4b50,23,'late','架空生物'),
 racer('golem','ゴーレム','岩の体で地面を踏み鳴らす',198,9.2,'golem',0x777e80,24,'heavy','架空生物'),
 racer('giantrobot','巨大ロボット','機械の脚で加速する',208,12.4,'giantrobot',0x7b9aaa,24,'late','架空生物'),
 racer('alien','宇宙生物','地球とは違う走り方をする',216,15.2,'alien',0x70a79b,25,'late','架空生物'),
 racer('kaiju','巨大怪獣','全ての相手を超える最後の一戦',224,11.8,'kaiju',0x656377,26,'late','架空生物')
];
const palettes={skin:['#ffe0c7','#eec09b','#c88d62','#975f45','#633c2d','#f3c99c','#c49574','#ab7858','#dfac7d','#6b4936'],hair:['#202029','#432c23','#9f6337','#d8bd75','#8a484b','#bebdc2','#1e5581','#a649a7','#74371d','#d4d3cb'],shirt:['#a9b5ae','#ffffff','#1a2c47','#ef645a','#3a9ede','#9c69e2','#e5aa49','#1f7d72','#dc88a9','#b6bdc4','#343038','#f3ca77'],pants:['#14283e','#f1f3ee','#193b4f','#3f454d','#953d4e','#41553f','#8e735a','#253364','#74748b'],shoes:['#f7f8f0','#e9b14e','#252a2f','#63d7e6','#ef6a66','#a77beb','#9bb59f','#cfd3d7'],irisTone:['#443020','#67513a','#2a4d62','#477164','#8f897d','#282b30','#8b6b4e','#627e94','#a5ab97','#425d56'],sole:['#e6e4dd','#282f32','#808a8e','#d4c1a4','#c38e72','#546973','#a3a69d','#a36956']};

const avatarGroups=[
 {id:'face',label:'輪郭・肌',items:[
 ['顔の幅','face','range',1,10],['顔の長さ','faceLength','range',0,100],['顔の奥行き','faceDepth','range',0,100],
 ['頭の大きさ','headSize','range',0,100],['あごの幅','chinWidth','range',0,100],['あごの長さ','chinLength','range',0,100],
 ['頬骨の幅','cheekbone','range',0,100],['頬の丸み','cheekFull','range',0,100],['額の高さ','forehead','range',0,100],
 ['耳の大きさ','earSize','range',0,100],['耳の角度','earAngle','range',0,100],['肌の色','skin','palette','skin'],
 ['そばかす','freckles','range',0,100]]},
 {id:'brows',label:'眉',items:[
 ['眉の形','brow','range',1,10],['眉の太さ','browThick','range',0,100],['眉の長さ','browLength','range',0,100],
 ['眉の間隔','browGap','range',0,100],['眉の高さ','browHeight','range',0,100],['眉尻の角度','browAngle','range',0,100],['眉のカーブ','browCurve','range',0,100]]},
 {id:'eyes',label:'目',items:[
 ['目の大きさ','eyes','range',1,10],['目の横幅','eyeWidth','range',0,100],['目の縦幅','eyeHeight','range',0,100],
 ['目の間隔','eyeGap','range',0,100],['目尻の角度','eyeTilt','range',0,100],['瞳の大きさ','irisSize','range',0,100],
 ['瞳の色','irisTone','palette','irisTone'],['まぶた','eyelid','range',0,100],['まつげ','lash','range',0,100]]},
 {id:'nose',label:'鼻',items:[
 ['鼻の大きさ','nose','range',1,10],['鼻筋の高さ','noseBridge','range',0,100],['鼻の横幅','noseWidth','range',0,100],
 ['鼻の長さ','noseLength','range',0,100],['鼻先の形','noseTip','range',0,100],['小鼻の幅','nostril','range',0,100]]},
 {id:'mouth',label:'口',items:[
 ['口の大きさ','mouth','range',1,10],['口の横幅','mouthWidth','range',0,100],['上唇の厚み','upperLip','range',0,100],
 ['下唇の厚み','lowerLip','range',0,100],['口角の上がり','smile','range',0,100],['口の高さ','mouthHeight','range',0,100]]},
 {id:'hair',label:'髪',items:[
 ['髪型','hairStyle','range',0,9],['髪の長さ','hairLength','range',0,100],['髪のボリューム','hairVolume','range',0,100],
 ['前髪の長さ','bangs','range',0,100],['分け目','part','range',0,100],['髪の色','hair','palette','hair']]},
 {id:'body',label:'体格',items:[
 ['筋肉量','build','range',1,10],['全体の体型','body','range',1,10],['身長','height','range',1,10],
 ['肩幅','shoulderWidth','range',0,100],['胴の幅','waistWidth','range',0,100],['胸の厚み','chestDepth','range',0,100],
 ['お腹周り','belly','range',0,100],['腰幅','hipWidth','range',0,100],['腕の太さ','armBulk','range',0,100],
 ['腕の長さ','armLength','range',0,100],['脚の長さ','legLength','range',0,100],
 ['太ももの太さ','legBulk','range',0,100],['ふくらはぎ','calfBulk','range',0,100],['姿勢','posture','range',0,100]]},
 {id:'clothes',label:'服装',items:[
 ['トップスの色','shirt','palette','shirt'],['服の形','shirtStyle','range',0,9],
 ['袖の長さ','sleeveLength','range',0,100],['襟の開き','neckline','range',0,100],['服の柄','topPattern','range',0,9],
 ['ボトムスの色','pants','palette','pants'],['ズボンの丈','pantsLength','range',0,100],
 ['靴の色','shoes','palette','shoes'],['靴底の色','sole','palette','sole'],
 ['靴の大きさ','shoeSize','range',0,100],['アクセサリー','accessory','range',0,9],
 ['リストバンド','wristband','range',0,100]]}
];
const categories=avatarGroups.flatMap(group=>group.items.map(item=>[...item,group.id]));
const defaultAvatar={
 face:5,brow:3,eyes:4,nose:3,mouth:3,hairStyle:3,skin:2,hair:0,
 build:4,body:5,height:5,shirt:0,shirtStyle:0,pants:0,shoes:1,accessory:0,
 faceLength:50,faceDepth:50,headSize:50,chinWidth:50,chinLength:50,cheekbone:50,cheekFull:50,forehead:50,earSize:50,earAngle:50,freckles:0,
 browThick:50,browLength:50,browGap:50,browHeight:50,browAngle:50,browCurve:50,
 eyeWidth:50,eyeHeight:50,eyeGap:50,eyeTilt:50,irisSize:50,irisTone:0,eyelid:50,lash:15,
 noseBridge:50,noseWidth:50,noseLength:50,noseTip:50,nostril:50,
 mouthWidth:50,upperLip:50,lowerLip:50,smile:50,mouthHeight:50,
 hairLength:40,hairVolume:50,bangs:50,part:50,
 shoulderWidth:50,waistWidth:50,chestDepth:50,belly:50,hipWidth:50,armBulk:50,armLength:50,legLength:50,legBulk:50,calfBulk:50,posture:50,
 sleeveLength:45,neckline:50,topPattern:0,pantsLength:65,sole:0,shoeSize:50,wristband:0
};
const defaultSave={money:170,stats:{speed:2,power:1,stamina:1,technique:1},best:null,won:[],chosen:0,avatar:defaultAvatar,races:0,runnerName:'ランナー',bestByBeast:{}};
let save=(()=>{try{const v=JSON.parse(localStorage.getItem('animal100m_v4'));if(v&&typeof v==='object')return {...defaultSave,...v,stats:{...defaultSave.stats,...v.stats},avatar:{...defaultAvatar,...v.avatar},won:Array.isArray(v.won)?v.won:[],bestByBeast:v.bestByBeast||{}}}catch(e){}return JSON.parse(JSON.stringify(defaultSave))})();
const store=()=>{try{localStorage.setItem('animal100m_v4',JSON.stringify(save))}catch(e){}};

const originalBeastIds=['dog','cat','fox','rabbit','zebra','greyhound','ostrich','kangaroo','horse','lion','gazelle','pronghorn','cheetah'];
if(save.rosterVersion!==2){
 const originalStage=Math.max(0,Math.min(originalBeastIds.length-1,Math.floor(Number(save.chosen)||0)));
 const oldChoice=originalBeastIds[originalStage];
 const chosenNew=animals.findIndex(a=>a.id===oldChoice);
 const reachedOld=originalBeastIds.reduce((furthest,id,i)=>save.won.includes(id)?Math.max(furthest,i+1):furthest,0);
 const reachedNew=animals.findIndex(a=>a.id===originalBeastIds[Math.min(reachedOld,originalBeastIds.length-1)]);
 save.chosen=Math.max(0,chosenNew);
 save.unlockedStage=Math.max(0,chosenNew,reachedNew);
 save.rosterVersion=2;store();
}else{
 save.chosen=Math.max(0,Math.min(animals.length-1,Math.floor(Number(save.chosen)||0)));
 save.unlockedStage=Math.max(0,Math.min(animals.length-1,Math.floor(Number(save.unlockedStage)||0)));
}

const training=[{id:'speed',name:'脚力・最高速度',desc:'最高速度とトップスピード維持を強化',gain:'+4.2km/h'}, {id:'power',name:'爆発力・加速',desc:'スタートからの加速、踏み込み効率を強化',gain:'加速 +8%'},{id:'stamina',name:'心肺・持久力',desc:'連打で消費する体力を軽減',gain:'持久力 +8%'},{id:'technique',name:'走法・フォーム',desc:'連打効率とコンボ蓄積を強化',gain:'効率 +7%'}];
const mat=(color,roughness=.86,metalness=.01)=>new T.MeshStandardMaterial({color,roughness,metalness});
const m={track:mat(0x944b42),trackDark:mat(0x894039),line:mat(0xf8ead7),grass:mat(0x38594c),grass2:mat(0x29473d),dark:mat(0x122336),wall:mat(0x243748),seat:mat(0x304554),seat2:mat(0x253843),steel:mat(0xbccad5,.4,.7),gold:mat(0xffd36a,.35,.4),white:mat(0xf4f5eb),black:mat(0x191e25),eye:mat(0xf9faf7),lens:mat(0x263449),nose:mat(0x332c29),paint:mat(0x8baec1),shoe:mat(0x252c3b),red:mat(0xd94d4e)};
const scene=new T.Scene();scene.background=new T.Color(0x516577);scene.fog=new T.FogExp2(0x677789,.0048);

const skyGradient=new T.ShaderMaterial({
 depthWrite:false,side:T.BackSide,
 vertexShader:'varying vec3 p; void main(){p=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
 fragmentShader:'varying vec3 p; void main(){float y=clamp(normalize(p).y*0.5+0.5,0.0,1.0); vec3 low=vec3(0.34,0.42,0.48); vec3 high=vec3(0.17,0.25,0.33); vec3 col=mix(low,high,smoothstep(0.26,0.89,y));gl_FragColor=vec4(col,1.0);}'
});
const skyDome=new T.Mesh(new T.SphereGeometry(270,32,20),skyGradient);skyDome.position.set(0,0,45);skyDome.frustumCulled=false;scene.add(skyDome);
const camera=new T.PerspectiveCamera(52,1,.1,420);
let renderer;
try {renderer=new T.WebGLRenderer({canvas:$('world'),antialias:!mobile,powerPreference:'high-performance',alpha:false,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,mobile?1.35:1.85));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputEncoding=T.sRGBEncoding;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.78;}catch(err){fail('WebGL 3Dの起動に失敗しました。WebGL対応ブラウザで開いてください。');return}
const hemi=new T.HemisphereLight(0xb8c9cf,0x42362e,1.02);scene.add(hemi);
const sun=new T.DirectionalLight(0xe9d6bd,1.45);sun.position.set(-26,60,24);sun.castShadow=true;sun.shadow.mapSize.set(mobile?1024:2048,mobile?1024:2048);sun.shadow.camera.left=-34;sun.shadow.camera.right=34;sun.shadow.camera.top=32;sun.shadow.camera.bottom=-32;sun.shadow.camera.near=5;sun.shadow.camera.far=150;sun.shadow.bias=-.00026;sun.target.position.set(0,0,14);scene.add(sun,sun.target);
const fill=new T.DirectionalLight(0x8eabba,.27);fill.position.set(20,15,65);scene.add(fill);
const ground=new T.Mesh(new T.PlaneGeometry(480,540),m.grass);ground.rotation.x=-Math.PI/2;ground.position.set(0,-.075,55);ground.receiveShadow=true;scene.add(ground);
const box=(parent,w,h,d,mt,x=0,y=0,z=0,cast=false)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),mt);o.position.set(x,y,z);o.castShadow=cast;o.receiveShadow=true;parent.add(o);return o};
const ball=(parent,mt,x,y,z,sx,sy,sz,detail=22)=>{const o=new T.Mesh(new T.SphereGeometry(1,detail,Math.max(10,Math.floor(detail*.7))),mt);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o};
const conical=(parent,mt,x,y,z,r1,r2,h,segments=10)=>{const o=new T.Mesh(new T.CylinderGeometry(r1,r2,h,segments),mt);o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o};
const tube=(parent,from,to,r,mt,r2)=>{const a=new T.Vector3(...from),b=new T.Vector3(...to);const d=new T.Vector3().subVectors(b,a);const o=new T.Mesh(new T.CylinderGeometry(r2??r,r,d.length(),9),mt);o.position.copy(a).add(b).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());o.castShadow=true;parent.add(o);return o};
function textTexture(text,background='#152a3b',foreground='#ffffff',wide=512,high=128){const cv=document.createElement('canvas');cv.width=wide;cv.height=high;const c=cv.getContext('2d');c.fillStyle=background;c.fillRect(0,0,wide,high);c.strokeStyle='#d9e3df40';c.lineWidth=8;c.strokeRect(4,4,wide-8,high-8);c.fillStyle=foreground;c.font='900 '+Math.floor(high*.42)+'px system-ui, sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(text,wide/2,high/2,wide-22);const tx=new T.CanvasTexture(cv);tx.anisotropy=renderer.capabilities.getMaxAnisotropy?Math.min(4,renderer.capabilities.getMaxAnisotropy()):1;return tx}
function placard(parent,text,x,y,z,w=5,h=1.1,rot=0,bg='#152a3b',fg='#ffffff'){const t=textTexture(text,bg,fg,512,128);const me=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:t,side:T.DoubleSide}));me.position.set(x,y,z);me.rotation.y=rot;parent.add(me);return me}
function makeMaterialGrain(material,repeatX,repeatY,contrast=12){
 const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;
 const g=canvas.getContext('2d'),data=g.createImageData(256,256);
 let seed=547921;const next=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 for(let i=0;i<data.data.length;i+=4){const v=Math.round(234+(next()-.5)*contrast*2);data.data[i]=v;data.data[i+1]=v;data.data[i+2]=v;data.data[i+3]=255}
 g.putImageData(data,0,0);
 const t=new T.CanvasTexture(canvas);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(repeatX,repeatY);t.anisotropy=4;t.encoding=T.sRGBEncoding;
 material.map=t;material.roughness=.98;material.needsUpdate=true;return t;
}
makeMaterialGrain(m.track,4,24,20);makeMaterialGrain(m.trackDark,4,23,17);
makeMaterialGrain(m.grass,35,48,28);
const furMaterialTexture=makeMaterialGrain(mat(0xffffff),3,3,10);
function buildStadium(){
 box(scene,23,.12,128,m.track,0,.03,44);
 box(scene,20,.1,118,m.trackDark,0,.035,48);
 for(let i=0;i<=6;i++){const x=-9.6+i*3.2;box(scene,.085,.055,122,m.line,x,.1,44);}
 for(let z=0;z<=100;z+=5){for(let x of [-8,-4.8,-1.6,1.6,4.8,8]){if(z>0&&z<100&&z%10===0)box(scene,.11,.028,.7,m.white,x,.115,z)} }
 box(scene,19.2,.075,.5,m.white,0,.125,0);box(scene,19.2,.075,.7,m.white,0,.13,100);
 // Start-line lane numbers painted into the surface
  for(let lane=0;lane<6;lane++){
   const numberTexture=textTexture(String(lane+1),'#8b463c','#f5e8da',128,128);
   const number=new T.Mesh(new T.PlaneGeometry(1.55,1.55),new T.MeshBasicMaterial({map:numberTexture,transparent:false,depthWrite:true,side:T.DoubleSide}));
   number.rotation.x=-Math.PI/2;number.position.set(-8+lane*3.2,.153,-3.2);scene.add(number);
  }
  // large chequered finish mark
 for(let k=0;k<12;k++){box(scene,1.6,.081,.5,k%2===0?m.black:m.white,-8.8+k*1.6,.16,100)}
 for(let z=0;z<=100;z+=10){for(let side of [-1,1]){box(scene,.8,.12,1.5,m.white,side*11.6,.1,z);const p=conical(scene,m.steel,side*11.6,.45,z,.05,.08,.8);p.castShadow=false;placard(scene,String(z)+'m',side*11.6,.98,z,1.7,.47,side===1?Math.PI/2:-Math.PI/2,'#21343b','#e1e6e3')}}
 // finish arch and mid-track details
 for(let side of [-1,1]){box(scene,.53,6.6,.55,m.steel,side*10.1,3.35,100,true);box(scene,1.2,.35,1.3,m.dark,side*10.1,5.96,100)}
 box(scene,21,1.15,.7,m.dark,0,6.45,100,true);placard(scene,'GOAL  /  100m',0,6.47,99.59,14,1,0,'#23363f','#e9efe7');
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
  const bodyGeo=new T.CylinderGeometry(.18,.27,.44,7),people=new T.InstancedMesh(bodyGeo,mat(0xb9b6ae,.96),count);
  for(let i=0;i<count;i++){const side=i%2?1:-1,row=(Math.floor(i/2)%7),z=-27+((i*19.13)%148),x=side*(15+row*2.85);dummy.position.set(x,.59+row*.61,z);dummy.scale.set(1,1,1);dummy.updateMatrix();people.setMatrixAt(i,dummy.matrix);col.setHex(colors[(i*31+3)%colors.length]);people.setColorAt(i,col)}
  people.instanceMatrix.needsUpdate=true;scene.add(people);
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
 const morph=k=>clamp((Number(a[k]??defaultAvatar[k]??50)-50)/50,-1,1);
 const root=new T.Group(),skeleton=new T.Group();root.add(skeleton);
 const skin=mat(palettes.skin[a.skin%palettes.skin.length]),hair=mat(palettes.hair[a.hair%palettes.hair.length]),shirt=mat(palettes.shirt[a.shirt%palettes.shirt.length],.72),pants=mat(palettes.pants[a.pants%palettes.pants.length]),shoes=mat(palettes.shoes[a.shoes%palettes.shoes.length],.6),white=mat(0xecf1ea), iris=mat(palettes.irisTone[a.irisTone??0]||palettes.irisTone[0],.32),dark=mat(0x312721),lipMat=mat(new T.Color(palettes.skin[a.skin%palettes.skin.length]).multiplyScalar(.70),.92),soleMat=mat(palettes.sole[a.sole??0]||palettes.sole[0],.9);
 const bulky=.83+(a.build/10)*.45,wide=.89+(a.body/10)*.29;const height=.88+(a.height/10)*.26;const legRatio=1+.15*morph('legLength'),baseTorsoY=1.05*legRatio,shoulderWidth=1+.28*morph('shoulderWidth'),hipWidth=1+.25*morph('hipWidth'),armLength=1+.16*morph('armLength'),armBulk=1+.29*morph('armBulk'),thighBulk=1+.30*morph('legBulk'),calfBulk=1+.25*morph('calfBulk');
 skeleton.scale.set(wide*.91,height*1.03,wide*.91);const torso=new T.Group();torso.position.set(0,baseTorsoY,0);skeleton.add(torso);
 ball(torso,pants,0,-.01,-.04,.30*bulky*hipWidth,.235,.225);
 const chest=ball(torso,shirt,0,.39,-.02,.345*bulky*shoulderWidth,.40,.235*(1+.25*morph('chestDepth')));chest.scale.x*=wide;
 const jerseyOutline=[new T.Vector2(.245,.03),new T.Vector2(.264,.15),new T.Vector2(.275,.33),new T.Vector2(.31*shoulderWidth,.52),new T.Vector2(.30*shoulderWidth,.72),new T.Vector2(.16,.82)];
 const jersey=new T.Mesh(new T.LatheGeometry(jerseyOutline,24),shirt);jersey.scale.x=bulky*wide;jersey.scale.z=1+.20*morph('chestDepth');jersey.receiveShadow=true;jersey.castShadow=true;torso.add(jersey);ball(torso,shirt,0,.15,0,.255*(1+.33*morph('waistWidth')),.25,.20*(1+.25*morph('belly')));
 ball(torso,skin,0,.89,.06,.13,.16,.13);ball(torso,shirt,0,.77,.06,.17+.04*morph('neckline'),.055,.17); // neck
 // decorative shirt panels / collar
 if(a.shirtStyle%3===0){ball(torso,white,0,.62,.22,.14,.10,.04)}
 if(a.shirtStyle%3===1){box(torso,.06,.65,.022,white,0,.35,.245)}
 if(a.shirtStyle%3===2){box(torso,.48,.095,.04,white,0,.3,.244)}if(a.shirtStyle>=4){for(let s of [-1,1])box(torso,.035,.46,.024,white,s*.25,.34,.20,true)}
 if(a.topPattern>0){for(let i=0;i<Math.min(5,a.topPattern);i++)box(torso,.23,.025,.025,a.topPattern%2?white:dark,0,.15+i*.10,.255,true)}
 // shoulder joints and articulated arms
 const arms=[],legs=[];
 for(const side of [-1,1]){
  const sh=new T.Group();sh.position.set(side*.42*bulky*shoulderWidth,.72,-.01);sh.scale.set(armBulk,armLength,armBulk);torso.add(sh);
  ball(sh,shirt,0,-.1,0,.19,.24,.20);
  ball(sh,a.shirtStyle>5||a.sleeveLength>65?shirt:skin,0,-.34,.01,.135,.32,.135);if(a.sleeveLength>20)ball(sh,shirt,0,-.18-a.sleeveLength*.0015,0,.155,.08+a.sleeveLength*.0015,.155);
  const elbow=new T.Group();elbow.position.y=-.58;sh.add(elbow);
  ball(elbow,skin,0,-.23,.035,.12,.28,.11);
  ball(elbow,skin,0,-.5,.06,.135,.15,.12);if(a.wristband>20)ball(elbow,shirt,0,-.39,.03,.14,.02+a.wristband*.00035,.12);arms.push({sh,elbow,side});
  const hip=new T.Group();hip.position.set(side*.2*wide*hipWidth,1.06*legRatio,0);hip.scale.y=legRatio;skeleton.add(hip);
  ball(hip,a.pantsLength>30?pants:skin,0,-.28,0,.153*bulky*thighBulk,.35,.17);
  const knee=new T.Group();knee.position.y=-.52;hip.add(knee);
  ball(knee,a.pantsLength>65?pants:skin,0,-.22,0,.125*calfBulk,.29,.14);
  ball(knee,shoes,0,-.49,.13,.145*(1+.20*morph('shoeSize')),.105,.27*(1+.20*morph('shoeSize')));
  box(knee,.25,.035,.27,soleMat,0,-.56,.21);
  legs.push({hip,knee,side});
 }
 const head=new T.Group();head.position.set(0,1.08+.025*morph('forehead'),.065);head.scale.setScalar(.88*(1+.20*morph('headSize')));torso.add(head);
 const hscale=.95+a.face*.013,faceW=.295*hscale,faceH=.34*(1+.20*morph('faceLength')),faceZ=.29*(1+.20*morph('faceDepth'));const headProfile=[[-.34,.042],[-.27,.17],[-.20,.235],[-.11,.282],[.02,faceW],[.15,faceW*.97],[.26,faceW*.88],[.32,faceW*.60],[.345,.018]].map(([y,r])=>new T.Vector2(r,y*faceH/.34));
 const headShape=new T.Mesh(new T.LatheGeometry(headProfile,32),skin);headShape.position.y=.13;headShape.scale.z=faceZ/faceW;headShape.castShadow=true;headShape.receiveShadow=true;head.add(headShape);ball(head,skin,0,.345+.03*morph('forehead'),-.015,faceW*.92,.095+.038*morph('forehead'),faceZ*.91,24);
 for(let s of [-1,1]){const ear=ball(head,skin,s*(faceW*1.04),.13,0,.06+.021*morph('earSize'),.094+.029*morph('earSize'),.058,20);ear.rotation.z=s*(.1+.35*morph('earAngle'));}
 // chin, cheekbones, eyes in +Z facing direction
 ball(head,skin,0,-.045-.038*morph('chinLength'),.12,.17+.055*morph('chinWidth'),.12+.025*morph('chinLength'),.18);for(let s of [-1,1])ball(head,skin,s*(faceW*.63),.050,faceZ*.5,.085+.04*morph('cheekbone'),.065+.028*morph('cheekFull'),.13,20);
 for(const side of [-1,1]){
  const eyeX=side*(.115+a.eyes*.002+.03*morph('eyeGap')),eyeY=.22+.020*morph('eyeHeight'),eyeZ=faceZ*.91;
  const ew=(.045+a.eyes*.002)*(1+.29*morph('eyeWidth')),eh=(.025+a.eyes*.001)*(1+.29*morph('eyeHeight'));const e=ball(head,white,eyeX,eyeY,eyeZ,ew,eh,.017,24);e.rotation.z=side*morph('eyeTilt')*.20;ball(head,skin,eyeX,eyeY+eh*.95+.007*morph('eyelid'),eyeZ+.008,ew*1.12,.012+.007*morph('eyelid'),.014,20);
  ball(head,iris,eyeX,eyeY,eyeZ+.017,.015+.009*morph('irisSize'),.021+.009*morph('irisSize'),.009,20);ball(head,dark,eyeX,eyeY,eyeZ+.027,.008,.013,.007,16);
  const brow=ball(head,hair,eyeX+side*.016*morph('browGap'),.296+(a.brow-5)*.006+.026*morph('browHeight'),faceZ*.95,.08*(1+.30*morph('browLength')),.014+a.brow*.001+.008*morph('browThick'),.018,20);brow.rotation.z=side*((a.brow-5)*-.03+.30*morph('browAngle')+.15*morph('browCurve'));
  ball(head,skin,side*.16,.09,faceZ*.62,.084,.06,.06);if(a.lash>20)for(let j=0;j<3;j++)ball(head,hair,eyeX+(j-1)*.025,eyeY+.035,eyeZ+.020,.005,.010+a.lash*.0002,.006,12);if(a.freckles>10)for(let j=0;j<Math.floor(a.freckles/12);j++)ball(head,dark,side*(.14+j*.011),.04+(j%3)*.018,faceZ*.83,.004,.004,.006,10);
 }
 ball(head,skin,0,.09,faceZ*.91+.008*morph('noseBridge'),(.042+a.nose*.003)*(1+.28*morph('noseWidth')),.07+.029*morph('noseLength'),.048+a.nose*.003+.025*morph('noseBridge'),20);ball(head,skin,0,.022,faceZ+.045+.023*morph('noseTip'),.058+.025*morph('noseTip'),.036,.042,20);for(let s of [-1,1])ball(head,dark,s*(.040+.014*morph('nostril')),.004,faceZ+.062,.013+.008*morph('nostril'),.008,.006,12);
 const mouthY=-.048+.036*morph('mouthHeight'),mouthW=(.055+a.mouth*.003)*(1+.28*morph('mouthWidth'));ball(head,lipMat,0,mouthY+.009,faceZ*.94,mouthW,.011+.010*morph('upperLip'),.012,20);ball(head,lipMat,0,mouthY-.010,faceZ*.95,mouthW*.96,.013+.010*morph('lowerLip'),.012,20);for(let s of [-1,1])ball(head,dark,s*mouthW,mouthY+.015*morph('smile'),faceZ*.93,.006,.005,.007,12);
 const style=a.hairStyle%10;const hairGroup=new T.Group();head.add(hairGroup);hairGroup.position.set(.055*morph('part'),-.023*morph('bangs'),0);hairGroup.scale.set(1+.22*morph('hairVolume'),1+.26*morph('hairLength'),1+.16*morph('hairVolume'));
 const hairCap=ball(hairGroup,hair,0,.37,-.036,.3,.13,.295);
 if(style===0)hairCap.scale.y=.42;
 else if(style===1){for(let i=0;i<8;i++){const ang=i*Math.PI*2/8;ball(hairGroup,hair,Math.cos(ang)*.22,.44,Math.sin(ang)*.20,.09,.10,.11,10)}}
 else if(style===2){for(let i=0;i<9;i++){ball(hairGroup,hair,Math.sin(i*2.3)*.22,.38+(i%3)*.055,Math.cos(i*2.3)*.2,.095,.105,.10,9)}}
 else if(style===3){for(let i=0;i<6;i++){ball(hairGroup,hair,(i-2.5)*.085,.47+Math.sin(i)*.04,.11,.096,.15,.16,11)}}
 else if(style===4){ball(hairGroup,hair,0,.48,-.27,.15,.21,.2);ball(hairGroup,hair,0,.26,-.33,.12,.26,.16)}
 else if(style===5){for(let i=0;i<11;i++){const ang=i*2.399;ball(hairGroup,hair,Math.cos(ang)*.22,.46+Math.sin(i)*.05,Math.sin(ang)*.21,.11,.14,.12,9)}}
 else if(style===6){for(let i=0;i<5;i++)ball(hairGroup,hair,0,.52+i*.085,-.05,.07*(1-i*.10),.12,.11,9)}
 else if(style===7){ball(hairGroup,hair,-.13,.41,.13,.18,.13,.14);ball(hairGroup,hair,.18,.49,.04,.19,.16,.19)}
 else if(style===8){for(let i=0;i<7;i++)ball(hairGroup,hair,(i-3)*.09,.46,.07,.07,.19,.10,9)}
 else {ball(hairGroup,hair,0,.29,-.22,.30,.37,.12);ball(hairGroup,hair,-.17,.23,.19,.09,.26,.10);ball(hairGroup,hair,.17,.23,.19,.09,.26,.10)}
 if(a.hairLength>30){for(let side of [-1,1]){const lock=ball(hairGroup,hair,side*.245,.11-(a.hairLength-30)*.0035,-.035,.067,.12+a.hairLength*.0022,.094,18);lock.rotation.z=side*.05}}
 if(a.bangs>15){for(let j=0;j<6;j++){const x=(j-2.5)*.086+.045*morph('part');const fringe=ball(hairGroup,hair,x,.33-.075*morph('bangs'),.20,.062,.082+.075*morph('bangs'),.085,16);fringe.rotation.z=.06*morph('part')}}
  if(a.accessory===1||a.accessory===6){const glassMat=mat(0x202c3a,.2,.5);for(const side of [-1,1])ball(head,glassMat,side*.115,.22,.30,.095,.055,.014)}
 if(a.accessory===2||a.accessory===7){const cap=ball(head,mat(0x142739),0,.47,0,.32,.105,.31);ball(head,mat(0x1a3453),0,.45,.25,.28,.026,.17)}
 if(a.accessory===3||a.accessory===8){box(torso,.075,.30,.03,m.gold,0,.22,.275)}
 if(a.accessory===4){ball(head,mat(0xd9b769,.3,.8),-.31,.12,0,.04,.07,.034);ball(head,mat(0xd9b769,.3,.8),.31,.12,0,.04,.07,.034)}
 if(a.accessory===5||a.accessory===9){ball(torso,m.gold,0,.46,.268,.08,.08,.023)}
 lineShadow(root,.5);
 return {root,skeleton,torso,head,arms,legs,animate(t,speed,stamina=1,legTaps=null,raceTime=0){
 const moving=speed>.13,intensity=moving?clamp(speed/9,.15,1.25):0;
 const pulse=side=>{if(!moving||!legTaps)return 0;const age=raceTime-legTaps[side];return age>=0&&age<.28?Math.sin(Math.PI*age/.28):0};
 const left=pulse('L'),right=pulse('R'),total=Math.max(left,right);
 torso.rotation.x=moving?-(.10+.075*intensity)+morph('posture')*.06:morph('posture')*.06;
 torso.rotation.z=(left-right)*.035;torso.position.y=baseTorsoY+total*.045*intensity;
 head.rotation.x=-torso.rotation.x*.55;head.rotation.z=-torso.rotation.z*.4;
 legs.forEach((v,i)=>{const foot=i===0?left:right;v.hip.rotation.x=foot*(.51+.31*intensity);v.knee.rotation.x=foot*(.54+.32*intensity)});
 arms.forEach((v,i)=>{const opposite=i===0?right:left;v.sh.rotation.x=opposite*(-.30-.38*intensity);v.sh.rotation.z=v.side*.10;v.elbow.rotation.x=-.28-opposite*.35});
 }};
}
function makeBeast(data){
 const k=data.kind;const root=new T.Group(),bodyGroup=new T.Group();root.add(bodyGroup);const coat=mat(data.coat,.98),highlight=mat(new T.Color(data.coat).multiplyScalar(1.10),.94),shade=mat(new T.Color(data.coat).multiplyScalar(.72),.96),nose=mat(0x2c2727),pale=mat(k==='zebra'?0xece8e2:0xf0dac3),white=mat(0xffffff),eyes=mat(0x18191c,.28);coat.map=furMaterialTexture;coat.needsUpdate=true;let legs=[],tail;
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
 return {root,bodyGroup,legs,tail,animate(t,speed){const speedF=clamp(speed/13,0,1.5),phase=t,s=Math.sin(phase),hop=k==='rabbit'||k==='kangaroo';bodyGroup.position.y=(hop?Math.abs(s)*.16:Math.sin(phase*2)*.047)*speedF;bodyGroup.rotation.x=hop?s*.045:Math.sin(phase)*.014;legs.forEach((v,i)=>{const offset=(i%2===0?0:Math.PI)+((v.front||1)<0?Math.PI*.35:0);v.hip.rotation.x=Math.sin(phase+offset)*(hop?.85:.62)*speedF;v.knee.rotation.x=Math.max(0,-Math.sin(phase+offset))*.85*speedF});if(tail){tail.rotation.y=Math.sin(t*5)*.16;tail.rotation.x=Math.sin(t*6)*.09}}};
}
// 3D player and opponent are rebuilt on customization / opponent changes.
let human=makeHuman(save.avatar);human.root.position.set(humanX,.13,0);scene.add(human.root);
let opponent=makeBeast(animals[clamp(save.chosen,0,animals.length-1)]);opponent.root.position.set(animalX,.13,0);scene.add(opponent.root);
const sharedMaterials=new Set(Object.values(m));
function disposeModel(root){
 root.traverse(o=>{if(!o.isMesh)return;if(o.geometry?.dispose)o.geometry.dispose();
 const ms=Array.isArray(o.material)?o.material:[o.material];
 for(const material of ms){if(material&&!sharedMaterials.has(material)&&material.dispose)material.dispose()}
 });
}
let humanRebuildScheduled=false;
function refreshHuman(){
 if(humanRebuildScheduled)return;
 humanRebuildScheduled=true;
 setTimeout(()=>requestAnimationFrame(()=>{
  humanRebuildScheduled=false;
  const old=human.root;scene.remove(old);disposeModel(old);
  human=makeHuman(save.avatar);human.root.position.set(humanX,.13,mode==='race'?(race?.humanD||0):0);scene.add(human.root);
 }),45);
}
function refreshOpponent(){const old=opponent.root;scene.remove(old);disposeModel(old);opponent=makeBeast(animals[save.chosen]);opponent.root.position.set(animalX,.13,0);scene.add(opponent.root);refreshMenu()}
// Subtle footstep puffs, with pooled 3D meshes.
const dust=[],dustMat=new T.MeshBasicMaterial({color:0xd4b6a1,transparent:true,opacity:.3,depthWrite:false});for(let i=0;i<38;i++){const p=new T.Mesh(new T.SphereGeometry(1,7,5),dustMat.clone());p.visible=false;scene.add(p);dust.push({mesh:p,life:0,max:1})}let dustCursor=0;
function kickDust(x,z,speed){if(speed<2)return;const p=dust[dustCursor++%dust.length];p.life=.4+Math.random()*.2;p.max=p.life;p.mesh.visible=true;p.mesh.position.set(x+Math.random()*.4-.2,.13,z-0.5);p.mesh.scale.set(.2,.09,.33);p.mesh.material.opacity=.23}
const clock=new T.Clock();let mode='menu',race=null,camSpin=0,cameraTarget=new T.Vector3(0,1.5,3),camPos=new T.Vector3(-5.8,3.1,9.2),sceneTime=0,sfx=true,lastHUD=0,raceName='';
const initResize=()=>{const w=window.innerWidth,h=window.innerHeight;camera.aspect=w/h;camera.fov=w<h?59:52;camera.updateProjectionMatrix();renderer.setSize(w,h,false)};addEventListener('resize',initResize);initResize();
let audioCtx;function beep(freq=450,dur=.1,type='sine',gain=.04){if(!sfx)return;try{audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();const osc=audioCtx.createOscillator(),g=audioCtx.createGain();osc.type=type;osc.frequency.value=freq;g.gain.setValueAtTime(gain,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.0001,audioCtx.currentTime+dur);osc.connect(g).connect(audioCtx.destination);osc.start();osc.stop(audioCtx.currentTime+dur+.01)}catch(e){}}
let footBuffer=null;
function footstep(speed){
 if(!sfx||speed<=2)return;
 try{
  audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();
  if(!footBuffer){
   footBuffer=audioCtx.createBuffer(1,1500,audioCtx.sampleRate);
   const samples=footBuffer.getChannelData(0);
   let seed=17891;for(let i=0;i<samples.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;samples[i]=((seed/4294967296)*2-1)*Math.exp(-i/260)}
  }
  const src=audioCtx.createBufferSource();src.buffer=footBuffer;
  const filter=audioCtx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=180+speed*18;
  const gain=audioCtx.createGain();const now=audioCtx.currentTime;
  gain.gain.setValueAtTime(.017+Math.min(.025,speed*.001),now);gain.gain.exponentialRampToValueAtTime(.0001,now+.04);
  src.connect(filter);filter.connect(gain);gain.connect(audioCtx.destination);src.start(now);
 }catch(err){}
}
function showScreen(mo){mode=mo;document.body.classList.remove('menu-mode','race-mode','custom-mode','train-mode','beasts-mode');document.body.classList.add(mo+'-mode');['menu','custom','train','beasts'].forEach(x=>$(x+'Screen').classList.toggle('active',x===mo));$('bottomNav').classList.toggle('gone',mo==='race');document.querySelectorAll('[data-screen]').forEach(b=>b.classList.toggle('active',b.dataset.screen===mo));$('raceHUD').style.display=mo==='race'?'flex':'none';$('raceControls').style.display=mo==='race'?'block':'none';$('resultOverlay').style.display='none';if(mo!=='race'){$('countdown').style.display='none';human.root.position.z=0;opponent.root.position.z=0;human.root.position.x=humanX;opponent.root.position.x=animalX;human.root.rotation.y=0;opponent.root.rotation.y=0;$('raceMsg').style.display='none';$('raceBanner').textContent='';}else {$('raceBanner').textContent='100m走'}if(mo==='train')renderTraining();if(mo==='custom'){$('customScreen').classList.remove('previewOnly');$('previewAvatar').textContent='全身を見る';renderCustom();}if(mo==='beasts')renderBeasts();refreshMenu()}
const cost=(id)=>{const level=save.stats[id]||1;return Math.round(40+12*(level-1)+2.6*Math.pow(level-1,2))};
const unlocked=(i)=>i===0||i<=save.unlockedStage||save.won.includes(animals[i-1].id);
function refreshMenu(){let x=animals[save.chosen]||animals[0];$('bestDisplay').textContent=save.best==null?'--':save.best.toFixed(2)+'秒';$('winDisplay').textContent=save.won.length+' / '+animals.length;$('raceCount').textContent=save.races||0;$('coinDisplay').textContent=Math.floor(save.money).toLocaleString();$('nextName').textContent=x.name;$('nextSub').textContent=x.sub;$('nextSpeed').textContent=x.kph+' km/h';$('nextBar').style.width=(x.kph/110*100).toFixed(1)+'%';const win=save.won.includes(x.id);$('nextDescription').textContent=win?'勝利済み — 記録の更新に挑戦':'勝利すると次の生物が解放される';$('startBtn').textContent='▶ '+x.name+'と100m走'}
function renderTraining(){const el=$('trainList');el.innerHTML='';const cards=training.map(item=>{const level=save.stats[item.id]||1,need=cost(item.id),max=level>=50;return `<div class="trainitem"><header><div><div class="label">${item.name}</div><h3>${item.name} <span class="mini">Lv.${level}</span></h3></div><button data-train="${item.id}" ${max||save.money<need?'disabled':''}>${max?'MAX':need+' G'}</button></header><p>${item.desc} ・ ${item.gain}</p><div class="trainLine"><i style="width:${Math.min(100,level*2)}%"></i></div></div>`}).join('');el.innerHTML=cards;el.querySelectorAll('[data-train]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.train,n=cost(id);if(save.money<n||save.stats[id]>=50)return;save.money-=n;save.stats[id]++;store();beep(670,.09,'triangle',.055);renderTraining();refreshMenu()}))}
function renderBeasts(){const el=$('animalList');el.innerHTML='';el.innerHTML=animals.map((a,i)=>`<div class="animalitem ${i===save.chosen?'selected':''} ${unlocked(i)?'':'locked'}"><header><div><div class="label">第${i+1}戦 / ${a.kph} km/h</div><h3>${a.name} ${save.won.includes(a.id)?'<span class="mini">★ 勝利済</span>':''}</h3></div><button data-beast="${i}" ${unlocked(i)?'':'disabled'}>${i===save.chosen?'選択中':unlocked(i)?'挑戦する':'未解放'}</button></header><p>${a.sub}。${!unlocked(i)?'前の動物に勝つと解放されます。':''}</p></div>`).join('');el.querySelectorAll('[data-beast]').forEach(b=>b.addEventListener('click',()=>{const i=+b.dataset.beast;if(!unlocked(i))return;save.chosen=i;store();refreshOpponent();renderBeasts();beep(540,.1)}))}

let customTab='face';
function renderCustom(){
 const el=$('customList'),tabs=$('avatarTabs');
 el.replaceChildren();tabs.replaceChildren();
 for(const group of avatarGroups){
  const b=document.createElement('button');b.type='button';b.textContent=group.label;b.classList.toggle('active',customTab===group.id);
  b.setAttribute('role','tab');b.setAttribute('aria-selected',customTab===group.id?'true':'false');
  b.addEventListener('click',()=>{if(customTab===group.id)return;customTab=group.id;renderCustom();el.scrollTop=0;});
  tabs.appendChild(b);
 }
 const selected=avatarGroups.find(g=>g.id===customTab)||avatarGroups[0];
 if(customTab==='face'){
  const name=document.createElement('label');name.className='formrow';
  const label=document.createElement('span');label.textContent='ランナー名';
  const input=document.createElement('input');input.type='text';input.id='runnerName';input.maxLength=16;
  input.value=save.runnerName||'ランナー';input.autocomplete='off';
  input.addEventListener('input',()=>{save.runnerName=input.value.slice(0,16)||'ランナー';store()});
  name.append(label,input);el.appendChild(name);
 }
 for(const [label,key,kind,min,max] of selected.items){
  const row=document.createElement('label');row.className='formrow';
  const caption=document.createElement('span');caption.textContent=label;row.appendChild(caption);
  if(kind==='range'){
   const slider=document.createElement('input');slider.type='range';slider.min=min;slider.max=max;slider.step=1;
   slider.value=clamp(Number(save.avatar[key]??defaultAvatar[key]??50),min,max);
   slider.setAttribute('aria-label',label);
   const val=document.createElement('span');val.className='val';val.textContent=slider.value;
   slider.addEventListener('input',()=>{save.avatar[key]=Number(slider.value);val.textContent=slider.value;refreshHuman();store()});
   row.append(slider,val);
  }else{
   const select=document.createElement('select');select.setAttribute('aria-label',label);
   const colors=palettes[min];
   for(let j=0;j<colors.length;j++){
    const option=document.createElement('option');option.value=j;option.textContent='色 '+(j+1);select.appendChild(option);
   }
   select.value=clamp(Number(save.avatar[key]??defaultAvatar[key]??0),0,colors.length-1);
   const sample=document.createElement('span');sample.className='colorPreview';
   sample.style.backgroundColor=colors[Number(select.value)];
   select.addEventListener('change',()=>{save.avatar[key]=Number(select.value);sample.style.backgroundColor=colors[Number(select.value)];refreshHuman();store()});
   row.append(select,sample);
  }
  el.appendChild(row);
 }
 const help=document.createElement('p');help.className='hint';help.textContent='スライダーを動かすと3Dモデルに反映されます。画面上の人物をなぞると向きを変えられます。';el.appendChild(help);
 $('avatarCount').textContent='編集項目 '+categories.length+'個 / '+selected.label+' '+selected.items.length+'個';
}
$('previewAvatar')?.addEventListener('click',()=>{const screen=$('customScreen'),open=screen.classList.toggle('previewOnly');$('previewAvatar').textContent=open?'編集へ戻る':'全身を見る';});
$('randomAvatar')?.addEventListener('click',()=>{
 for(const [label,key,kind,min,max] of categories){
  save.avatar[key]=kind==='range'?min+Math.floor(Math.random()*(max-min+1)):Math.floor(Math.random()*palettes[min].length);
 }
 refreshHuman();renderCustom();store();
});
$('resetAvatar')?.addEventListener('click',()=>{save.avatar={...defaultAvatar};refreshHuman();renderCustom();store()});
$('saveAvatarSlot')?.addEventListener('click',()=>{
 const slot=Number($('avatarSlot').value);
 save.avatarPresets=save.avatarPresets||[null,null,null];
 save.avatarPresets[slot]={name:save.runnerName,avatar:{...save.avatar}};
 store();$('avatarCount').textContent='キャラ'+(slot+1)+'に保存しました';
});
$('loadAvatarSlot')?.addEventListener('click',()=>{
 const slot=Number($('avatarSlot').value),preset=save.avatarPresets?.[slot];
 if(!preset){$('avatarCount').textContent='キャラ'+(slot+1)+'には保存データがありません';return}
 save.avatar={...defaultAvatar,...preset.avatar};save.runnerName=preset.name||'ランナー';
 refreshHuman();renderCustom();store();$('avatarCount').textContent='キャラ'+(slot+1)+'を呼び出しました';
});
// Tap race physics — speed is in metres per second, distances in metres.
function startRace(){if(mode==='race')return;raceName=animals[save.chosen].name;humanGait=0;race={time:0,phase:'countdown',count:3.3,lastCount:4,humanD:0,enemyD:0,humanV:0,enemyV:0,combo:0,lastFoot:'',lastTap:0,drive:0,taps:0,legTaps:{L:-999,R:-999},stamina:1,burstCharge:0,burstLeft:0,burstUsed:false,hFinish:null,eFinish:null,lastStep:-1};showScreen('race');race.time=0;$('countdown').textContent='3';$('countdown').style.display='flex';$('raceBanner').textContent='第'+(save.chosen+1)+'戦 / '+raceName;$('enemyLabel').textContent='対戦相手 / '+raceName;$('burstBtn').disabled=true;$('burstBtn').classList.remove('ready');updateHud(true);beep(480,.11);}
function tap(side){if(!race||race.phase!=='running'||race.hFinish!==null)return;const r=race;const now=r.time;r.taps=(r.taps||0)+1;r.legTaps[side]=now;const alternating=side!==r.lastFoot,quick=now-r.lastTap<.55;if(alternating){r.combo=quick?Math.min(99,r.combo+1):1;r.drive=clamp(r.drive+(.08+save.stats.technique*.004)*(quick?1.15:1),0,1.3);r.burstCharge=clamp(r.burstCharge+2.8+Math.min(4,r.combo*.12)+save.stats.technique*.10,0,100)}else{r.combo=0;r.drive=clamp(r.drive+.025,0,1.3)}r.lastFoot=side;r.lastTap=now;if(r.humanV>2){footstep(r.humanV);kickDust(humanX,r.humanD,r.humanV)}const b=$(side==='L'?'leftTap':'rightTap');b.classList.add('hit');setTimeout(()=>b.classList.remove('hit'),70);if(r.combo%6===0)beep(230+r.combo*5,.045,'triangle',.012);if(navigator.vibrate&&r.combo%3===0)navigator.vibrate(10)}
function activateBurst(){if(!race||race.phase!=='running'||race.burstCharge<99||race.burstLeft>0||race.hFinish!==null)return;race.burstCharge=0;race.burstLeft=2.8;race.burstUsed=true;beep(800,.35,'sawtooth',.075);showNotice('スパート中',1.2);$('burstBtn').disabled=true;$('burstBtn').classList.remove('ready')}
function showNotice(s,seconds){$('raceMsg').textContent=s;$('raceMsg').style.display='block';noticeTime=seconds}let noticeTime=0;

let racePicture=null,resultText='',lastResultWon=false;
function buildPodiumPhoto(){
 const sc=new T.Scene();
 sc.background=new T.Color(0x657783);
 sc.fog=new T.Fog(0x8997a0,18,50);
 sc.add(new T.HemisphereLight(0xe7eced,0x50605c,1.75));
 const sunlight=new T.DirectionalLight(0xffebd5,2.0);
 sunlight.position.set(-5,11,8);sunlight.castShadow=true;
 sunlight.shadow.mapSize.set(1024,1024);
 sunlight.shadow.camera.left=-10;sunlight.shadow.camera.right=10;
 sunlight.shadow.camera.top=10;sunlight.shadow.camera.bottom=-10;
 sunlight.shadow.camera.near=1;sunlight.shadow.camera.far=27;
 sc.add(sunlight,sunlight.target);
 const fill=new T.DirectionalLight(0xa9c9dd,.65);fill.position.set(7,4,5);sc.add(fill);
 const mtBase=mat(0x34454f,.83),mtSilver=mat(0xa9b6bd,.47,.42),mtGold=mat(0xd8b46c,.34,.56);
 const mtDark=mat(0x263d46,.9),mtGrass=mat(0x4d6959,.99);
 const ground=new T.Mesh(new T.PlaneGeometry(130,100),mtGrass);
 ground.rotation.x=-Math.PI/2;ground.position.y=-.095;ground.receiveShadow=true;sc.add(ground);
 box(sc,12,.16,7,mtBase,0,-.025,0);
 // Subtle stadium seating in the background, behind the winner.
 for(let level=0;level<5;level++){
  box(sc,35,.48,1.4,level%2?mat(0x3b505f):mat(0x485e6a),
      0,.30+level*.47,-7.5-level*.56);
 }
 const seatRows=mobile?110:200;
 const spectatorMat=mat(0xb7b7ac,.96);
 const spectators=new T.InstancedMesh(new T.SphereGeometry(.13,7,5),spectatorMat,seatRows);
 const dummy=new T.Object3D(),col=new T.Color();
 const shirtColors=[0xaabbc1,0x727f85,0xc3aa87,0x6a8a82,0x9c9da1,0xb68d7b];
 for(let i=0;i<seatRows;i++){
  const row=i%5,slot=Math.floor(i/5);
  dummy.position.set(-11+slot*.57,.79+row*.47,-6.67-row*.56);
  dummy.scale.set(1,1,1);dummy.updateMatrix();
  spectators.setMatrixAt(i,dummy.matrix);
  spectators.setColorAt(i,col.setHex(shirtColors[(i*19)%shirtColors.length]));
 }
 spectators.instanceMatrix.needsUpdate=true;sc.add(spectators);
 for(const x of [-5.5,5.5]){
  box(sc,.10,5,.10,mtSilver,x,2.5,-2);
  box(sc,1.7,.10,.08,mtGold,x,4.9,-2);
  placard(sc,'100m',x,4.35,-1.96,1.5,.55,0,'#2e4651','#e7e6d9');
 }
 // Solid elevated awards podium with clearly readable 1st/2nd place markings.
 box(sc,2.28,1.17,1.68,mtSilver,0,.59,.30,true);
 box(sc,2.28,.095,1.71,mtGold,0,1.20,.30,true);
 box(sc,1.84,.68,1.50,mtSilver,-2.48,.34,.25,true);
 box(sc,1.84,.07,1.54,mtGold,-2.48,.705,.25,true);
 box(sc,1.84,.39,1.50,mtSilver,2.48,.195,.25,true);
 box(sc,1.84,.07,1.54,mtGold,2.48,.415,.25,true);
 placard(sc,'1',0,.65,1.158,1.08,.75,0,'#657987','#fff2d0');
 placard(sc,'2',-2.48,.34,1.035,.72,.46,0,'#60717b','#ffffff');
 placard(sc,'3',2.48,.21,1.035,.72,.32,0,'#60717b','#ffffff');
 const beast=animals.find(a=>a.name===raceName)||animals[0];
 const athlete=makeHuman(save.avatar),rival=makeBeast(beast);
 const characterScale=1.08;
 const heightFactor=['horse','zebra','ostrich','kangaroo'].includes(beast.kind)?.70:
                    ['lion','pronghorn','gazelle'].includes(beast.kind)?.82:
                    ['rabbit','cat'].includes(beast.kind)?1.10:.95;
 athlete.root.scale.setScalar(characterScale);
 rival.root.scale.setScalar(heightFactor);
 const winningHuman=lastResultWon;
 athlete.root.position.set(winningHuman?0:-2.48,winningHuman?1.255:.76,.30);
 rival.root.position.set(winningHuman?-2.48:0,winningHuman?.75:1.255,.20);
 athlete.root.rotation.y=0;
 rival.root.rotation.y=0;
 athlete.animate(0,0);
 rival.animate(0,0);
 if(winningHuman){
  athlete.arms.forEach(part=>{
   part.sh.rotation.x=-.28;
   part.sh.rotation.z=part.side*2.05;
   part.elbow.rotation.x=-.56;
  });
  athlete.torso.rotation.z=0;
  athlete.head.rotation.x=0;
 }else{
  athlete.arms.forEach(part=>{part.sh.rotation.x=0;part.sh.rotation.z=part.side*.10;part.elbow.rotation.x=-.3;});
 }
 sc.add(athlete.root,rival.root);
 const chain=mat(0xdcc683,.42,.56),gold=mat(0xe4bc5d,.25,.75);
 const green=mat(0x668368,.94),bright=mat(0xf6e8bb,.62);
 function winnerNecklace(attach,scale=1,neckY=.75,frontZ=.37){
  const grp=new T.Group();grp.scale.setScalar(scale);attach.add(grp);
  tube(grp,[-.19,neckY,frontZ-.055],[0,neckY-.28,frontZ+.02],.023,chain,.021);
  tube(grp,[.19,neckY,frontZ-.055],[0,neckY-.28,frontZ+.02],.023,chain,.021);
  for(let i=0;i<12;i++){
   const side=i<6?-1:1,k=i%6,t=k/5;
   const x=side*(.19*(1-t));
   const y=neckY-.28*t;
   const leaf=ball(grp,green,x,y,frontZ-.038+t*.07,.036,.020,.023,10);
   leaf.rotation.z=side*(.5+t*.45);
  }
  const medal=new T.Mesh(new T.CylinderGeometry(.13,.13,.034,36),gold);
  medal.rotation.x=Math.PI/2;medal.position.set(0,neckY-.32,frontZ+.08);
  medal.castShadow=true;grp.add(medal);
  const ring=new T.Mesh(new T.TorusGeometry(.107,.012,8,30),chain);
  ring.position.set(0,neckY-.32,frontZ+.101);grp.add(ring);
  ball(grp,bright,0,neckY-.32,frontZ+.103,.036,.036,.014,16);
 }
 if(winningHuman){
  winnerNecklace(athlete.torso,.95,.78,.36);
 }else{
  // Animal winner receives the same decoration, scaled and positioned by body size.
  const bounds=new T.Box3().setFromObject(rival.root);
  const wHeight=Math.max(.8,bounds.max.y-bounds.min.y);
  const neckMount=new T.Group();
  const localScale=Math.max(.48,Math.min(.98,heightFactor));
  neckMount.position.set(0,wHeight*.50/heightFactor,beast.kind==='ostrich'?.70:.75);
  rival.root.add(neckMount);
  winnerNecklace(neckMount,localScale,.35,.27);
 }
 // Restrained celebratory confetti, always behind the central character.
 const confettiMaterials=[mat(0xe4c485,.6,.22),mat(0xe5e9e2,.72,.1),mat(0x8faeb3,.7,.2)];
 for(let i=0;i<48;i++){
  const x=-5.5+(i*2.39996323%1+1)%1*11;
  const y=1.7+(i*1.61803399%1)*3.0;
  const z=-1.6-(i%5)*.45;
  const mesh=box(sc,.052,.13,.012,confettiMaterials[i%3],x,y,z);
  mesh.rotation.z=i*.68;
 }
 const cam=new T.PerspectiveCamera(39,16/9,.1,100);
 cam.position.set(0,3.1,8.15);cam.lookAt(0,2.04,.16);
 return {scene:sc,camera:cam};
}
function makeRacePhoto(){
 let target=null,stage=null;
 try{
  const w=1200,h=675;
  const cnv=document.createElement('canvas');cnv.width=w;cnv.height=h;
  const cx=cnv.getContext('2d',{alpha:false});
  if(!cx)throw new Error('Canvas unavailable');
  stage=buildPodiumPhoto();
  target=new T.WebGLRenderTarget(w,h,{depthBuffer:true,stencilBuffer:false,format:T.RGBAFormat,type:T.UnsignedByteType});
  const pixels=new Uint8Array(w*h*4),image=cx.createImageData(w,h);
  renderer.setRenderTarget(target);
  renderer.render(stage.scene,stage.camera);
  renderer.readRenderTargetPixels(target,0,0,w,h,pixels);
  renderer.setRenderTarget(null);
  // WebGL framebuffer pixels are bottom-up.
  for(let y=0;y<h;y++){
   image.data.set(pixels.subarray((h-1-y)*w*4,(h-y)*w*4),y*w*4);
  }
  cx.putImageData(image,0,0);
  const strip=142,top=h-strip;
  const grad=cx.createLinearGradient(0,top,0,h);
  grad.addColorStop(0,'rgba(14,25,31,0)');
  grad.addColorStop(.23,'rgba(14,25,31,.85)');
  grad.addColorStop(1,'rgba(10,19,23,.95)');
  cx.fillStyle=grad;cx.fillRect(0,top,w,strip);
  cx.textAlign='left';
  cx.fillStyle='#f1f1eb';
  cx.font='600 25px system-ui,"Noto Sans JP",sans-serif';
  cx.fillText('動物と100m走  /  '+raceName,34,top+49);
  cx.font='800 44px system-ui,"Noto Sans JP",sans-serif';
  cx.fillText(resultText,34,top+98,w-60);
  cx.textAlign='right';
  cx.font='500 19px system-ui,sans-serif';
  cx.fillStyle='#d0dbd5';
  cx.fillText('techmew.github.io/human-vs-beasts/',w-34,top+125);
  racePicture=cnv;
  const img=$('resultPhoto');img.src=cnv.toDataURL('image/png');img.hidden=false;
  $('shareHelp').textContent='写真を保存・共有できます。Xへ投稿する際は共有先から選択してください。';
 }catch(err){
  console.warn('Podium screenshot failed',err);
  // Never expose the old rear-facing track capture as a result photograph.
  racePicture=null;
  $('resultPhoto').hidden=true;
  $('shareHelp').textContent='この端末では表彰台の写真を生成できませんでした。';
 }finally{
  try{renderer.setRenderTarget(null)}catch(e){}
  if(target)target.dispose();
  if(stage){
   stage.scene.traverse(o=>{if(o.isMesh&&o.material?.map&&o.material.map.isCanvasTexture&&o.material.map!==furMaterialTexture)o.material.map.dispose()});
   disposeModel(stage.scene);
  }
 }
}
function finishRace(){
 const r=race;if(!r||r.phase==='results')return;
 r.phase='results';$('countdown').style.display='none';$('raceControls').style.display='none';$('raceHUD').style.display='none';
 const completed=Number.isFinite(r.hFinish),won=completed&&r.hFinish<r.eFinish,record=completed?r.hFinish:r.time;
 save.races=(save.races||0)+1;
 if(completed){save.best=save.best==null?r.hFinish:Math.min(save.best,r.hFinish);const key=animals[save.chosen].id;save.bestByBeast[key]=Math.min(save.bestByBeast[key]||999,r.hFinish)}
 const reward=Math.max(15,Math.round((won?190:completed?65:30)+animals[save.chosen].tier*(won?68:completed?13:0)+(completed?Math.max(0,18-r.hFinish)*4:0)));
 save.money+=reward;
 const atLast=save.chosen>=animals.length-1;
 if(won){if(!save.won.includes(animals[save.chosen].id))save.won.push(animals[save.chosen].id);save.unlockedStage=Math.max(save.unlockedStage,Math.min(animals.length-1,save.chosen+1));if(!atLast)save.chosen++}
 store();
 $('resultEyebrow').textContent='100m走の結果';
 $('resultTitle').textContent=won?'勝ち':completed?'負け':'未完走';
 $('resultTitle').style.color=won?'#d7e4d2':'#e5c2aa';
 $('resultTime').textContent=completed?r.hFinish.toFixed(2)+'秒':'未完走';
 $('resultEnemy').textContent=r.eFinish.toFixed(2)+'秒';
 $('resultMoney').textContent='+'+reward+' G';
 $('resultMsg').textContent=won?'勝ちました。'+(atLast?'全ての動物との対戦を終えました。':'次の動物に挑戦できます。'):completed?'負けました。育成してから再挑戦できます。':'35秒以内にゴールできませんでした。タップして走ってください。';
 lastResultWon=won;resultText=(completed?r.hFinish.toFixed(2)+'秒':'未完走')+'  /  '+(won?'勝ち':'負け');
 $('resultOverlay').style.display='flex';
 makeRacePhoto();refreshMenu();beep(won?790:270,.24,'sine',.045);
}
function updateRace(dt){const r=race;if(!r)return;if(r.phase==='countdown'){r.count-=dt;const n=Math.ceil(clamp(r.count,0,3));if(n>0){$('countdown').textContent=n;if(n!==r.lastCount){beep(480+n*100,.12);r.lastCount=n}}else{$('countdown').textContent='GO!';r.phase='running';r.time=0;showNotice('GO!',.7);beep(1150,.38,'triangle',.08);setTimeout(()=>{$('countdown').style.display='none'},450)}return}
 if(r.phase!=='running')return;const dtSafe=Math.min(.045,dt);r.time+=dtSafe;r.drive=Math.max(0,r.drive-dtSafe*.15);if(r.combo>0&&r.time-r.lastTap>.65)r.combo=0;
 const base=(7.15+(save.stats.speed-1)*1.17+save.stats.technique*.10),maxSpeed=base*(r.burstLeft>0?1.47:1);const hasInput=(r.taps||0)>0&&(r.time-r.lastTap)<.38;const tempo=clamp(r.drive*.98,.08,1.15);const fatigued=(.55+.45*r.stamina);const targetHuman=hasInput?maxSpeed*Math.min(1.07,tempo)*fatigued:0;const accel=7.8+(save.stats.power-1)*.55;
 if(r.hFinish===null){if(!hasInput){r.humanV=0;r.combo=0}else if(r.humanV<targetHuman)r.humanV=Math.min(targetHuman,r.humanV+accel*dtSafe);else r.humanV=Math.max(targetHuman,r.humanV-5.8*dtSafe);r.humanD+=r.humanV*dtSafe;
 r.stamina=clamp(r.stamina-((r.drive>.50?.012:.001)*(1/(1+save.stats.stamina*.09))+(r.burstLeft>0?.028:0))*dtSafe+(r.drive<.4?.014:0)*dtSafe,.32,1);if(r.humanD>=100){const before=r.humanD-r.humanV*dtSafe;r.hFinish=r.time-dtSafe+(100-before)/Math.max(.01,r.humanV);r.humanD=100;beep(930,.16,'sine',.05)}}
 const a=animals[Math.max(0,Math.min(animals.length-1,save.chosen))],maxB=a.kph/3.6;
 if(r.eFinish===null){const phaseBonus=r.enemyD<22?1:(r.enemyD>81?.95:1);const enemyTarget=maxB*phaseBonus;r.enemyV=Math.min(enemyTarget,r.enemyV+a.acc*dtSafe);r.enemyD+=r.enemyV*dtSafe;if(r.enemyD>=100){const before=r.enemyD-r.enemyV*dtSafe;r.eFinish=r.time-dtSafe+(100-before)/Math.max(.01,r.enemyV);r.enemyD=100}}
 r.burstLeft=Math.max(0,r.burstLeft-dtSafe);const ready=r.burstCharge>=99&&r.burstLeft<=0;const button=$('burstBtn');if(button.disabled===ready){button.disabled=!ready;button.classList.toggle('ready',ready)}
 human.root.position.z=r.humanD;opponent.root.position.z=r.enemyD;
 /* Human steps occur only after a real tap. */
 if(r.eFinish===null&&r.enemyV>7&&Math.random()<dtSafe*10)kickDust(animalX,r.enemyD,r.enemyV);
 if(noticeTime>0){noticeTime-=dtSafe;if(noticeTime<=0)$('raceMsg').style.display='none'}
 if(r.hFinish===null&&r.time>35){r.hFinish=Infinity;r.dnf=true;r.humanV=0;r.drive=0;}if(r.hFinish!==null&&r.eFinish!==null){finishRace();return}lastHUD+=dtSafe;if(lastHUD>.055){lastHUD=0;updateHud()}}
function updateHud(force=false){if(!race)return;const r=race;$('dist').textContent=r.humanD.toFixed(1);$('enemyDist').textContent=r.enemyD.toFixed(1);$('timer').textContent=r.time.toFixed(2);$('speedDisplay').innerHTML=(r.humanV*3.6).toFixed(1)+' <small>km/h</small>';$('comboDisplay').textContent='連続 '+r.combo;$('humanProgress').style.width=r.humanD+'%';$('enemyProgress').style.width=r.enemyD+'%';$('staminaBar').style.width=r.stamina*100+'%';$('burstPercent').textContent=Math.round(r.burstCharge);$('burstBar').style.width=r.burstCharge+'%';const diff=r.humanD-r.enemyD;$('diffLabel').textContent=diff>=0?'+'+diff.toFixed(1)+'m':'−'+Math.abs(diff).toFixed(1)+'m';$('diffLabel').style.color=diff>=0?'#dcff62':'#ffb678';$('burstTxt').textContent=r.burstLeft>0?'スパート中':r.burstCharge>=99?'使用できます':'ためる'}
$('startBtn').addEventListener('click',startRace);$('goCustom').addEventListener('click',()=>showScreen('custom'));
document.querySelectorAll('[data-screen]').forEach(b=>b.addEventListener('click',()=>showScreen(b.dataset.screen)));document.querySelectorAll('[data-back]').forEach(b=>b.addEventListener('click',()=>showScreen('menu')));
for(const [side,id] of [['L','leftTap'],['R','rightTap']]){const el=$(id);el.addEventListener('pointerdown',e=>{e.preventDefault();tap(side)});el.addEventListener('contextmenu',e=>e.preventDefault())}
$('burstBtn').addEventListener('pointerdown',e=>{e.preventDefault();activateBurst()});
let swipeStart=null;
$('raceControls').addEventListener('pointerdown',e=>{if(e.target.id==='burstBtn'){swipeStart={x:e.clientX,y:e.clientY,id:e.pointerId}}});
$('raceControls').addEventListener('pointerup',e=>{if(!swipeStart||e.pointerId!==swipeStart.id)return;if(swipeStart.y-e.clientY>38)activateBurst();swipeStart=null});
$('raceControls').addEventListener('pointercancel',()=>swipeStart=null);$('resultHome').addEventListener('click',()=>{race=null;showScreen('menu');refreshOpponent()});$('retryBtn').addEventListener('click',()=>{race=null;showScreen('menu');refreshOpponent();startRace()});
const raceUrl='https://techmew.github.io/human-vs-beasts/';
const raceCaption=()=>('動物と100m走で'+raceName+'と対戦。結果：'+resultText+'。 #動物と100m走');
async function raceImageBlob(){
 if(!racePicture)makeRacePhoto();
 if(!racePicture)return null;
 return await new Promise(resolve=>racePicture.toBlob(resolve,'image/png'));
}
async function saveRacePhoto(){
 const blob=await raceImageBlob();if(!blob){$('shareHelp').textContent='画像を生成できませんでした。';return false}
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='100m走_'+new Date().toISOString().slice(0,10)+'.png';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),45000);return true
}
$('downloadRace')?.addEventListener('click',()=>{saveRacePhoto()});
$('shareRace')?.addEventListener('click',async()=>{
 const blob=await raceImageBlob();
 const msg=raceCaption();
 if(blob&&navigator.share&&typeof File==='function'){
  const file=new File([blob],'100m-race-result.png',{type:'image/png'});
  try{
   if(!navigator.canShare||navigator.canShare({files:[file]})){
     await navigator.share({files:[file],title:'動物と100m走',text:msg+' '+raceUrl});
     return;
   }
  }catch(err){if(err?.name==='AbortError')return;console.warn('Native image share unavailable',err)}
 }
 if(blob){await saveRacePhoto();$('shareHelp').textContent='画像を保存しました。Xの投稿画面で写真を添付してください。'}
 else $('shareHelp').textContent='写真を作成できませんでした。Xには文章のみ共有します。';
 const link='https://twitter.com/intent/tweet?text='+encodeURIComponent(msg+' '+raceUrl);
 window.location.assign(link);
});
$('audioBtn').addEventListener('click',()=>{sfx=!sfx;$('audioBtn').textContent=sfx?'♪':'×'});$('fullBtn').addEventListener('click',()=>{if(document.fullscreenElement)document.exitFullscreen?.();else document.documentElement.requestFullscreen?.().catch(()=>{})});
addEventListener('keydown',e=>{if(e.target?.tagName==='INPUT')return;if(['Space','ArrowLeft','ArrowRight','KeyA','KeyD'].includes(e.code))e.preventDefault();if(e.repeat)return;if(e.code==='KeyA'||e.code==='ArrowLeft')tap('L');if(e.code==='KeyD'||e.code==='ArrowRight')tap('R');if(e.code==='Space')activateBurst();if(e.code==='Escape'&&mode!=='race')showScreen('menu')});
// Drag the 3D model in studio, with direct pointer interaction.
let dragging=false,pointerStart=0;$('world').addEventListener('pointerdown',e=>{if(mode==='custom'||mode==='beasts'){dragging=true;pointerStart=e.clientX;$('world').setPointerCapture?.(e.pointerId)}});$('world').addEventListener('pointermove',e=>{if(dragging){camSpin+=(e.clientX-pointerStart)*.012;pointerStart=e.clientX}});$('world').addEventListener('pointerup',()=>dragging=false);$('world').addEventListener('pointercancel',()=>dragging=false);
function updateCam(dt){const d=race?.humanD||0;let wantedPos,wantedTarget;
 if(mode==='race'){const run=race?.humanV||0;const portrait=innerWidth<innerHeight;const shake=run>2?Math.min(.052,run*.003):0;wantedPos=new T.Vector3(-.50+Math.sin(sceneTime*12)*shake,portrait?3.55:2.85,d-(portrait?9.2:7.8));wantedTarget=new T.Vector3(-.45,portrait?1.05:1.3,d+12);camera.fov=mix(camera.fov,(portrait?57:49)+(race?.burstLeft>0&&run>0?2:0),Math.min(1,dt*2.2));camera.updateProjectionMatrix()}
 else if(mode==='custom'){const portrait=innerWidth<innerHeight,close=['face','brows','eyes','nose','mouth','hair'].includes(customTab)&&!$('customScreen').classList.contains('previewOnly');const radius=close?(portrait?2.8:2.15):(portrait?4.7:4.0);wantedPos=new T.Vector3(humanX+Math.sin(camSpin+.18)*radius,portrait?2.48:(close?2.28:2.16),Math.cos(camSpin+.18)*radius);wantedTarget=new T.Vector3(humanX+(portrait?0:.85),portrait?(close?1.25:.75):(close?2.18:1.18),0);camera.fov=mix(camera.fov,portrait?47:(close?44:50),Math.min(1,dt*3));camera.updateProjectionMatrix()}
 else if(mode==='beasts'){wantedPos=new T.Vector3(animalX+Math.sin(camSpin+sceneTime*.12)*5,2.2,Math.cos(camSpin+sceneTime*.12)*5);wantedTarget=new T.Vector3(animalX,1.35,0)}
 else if(mode==='train'){wantedPos=new T.Vector3(-2.7,2.45,7);wantedTarget=new T.Vector3(humanX,1.25,0)}
 else{const portrait=innerWidth<innerHeight;wantedPos=portrait?new T.Vector3(-4.1,2.95,12.8):new T.Vector3(-5.4,3.08,10.9);wantedTarget=portrait?new T.Vector3(0,1.15,0):new T.Vector3(-2.0,1.12,0);camera.fov=mix(camera.fov,portrait?55:50,Math.min(1,dt*2.5));camera.updateProjectionMatrix()}
 const t=Math.min(1,dt*(mode==='race'?3.8:2.9));camPos.lerp(wantedPos,t);cameraTarget.lerp(wantedTarget,t);camera.position.copy(camPos);camera.lookAt(cameraTarget)}

let renderQuality=renderer.getPixelRatio(),perfFrames=0,perfSeconds=0,perfGate=0;
function adaptQuality(dt){
 perfFrames++;perfSeconds+=dt;
 if(perfSeconds<3)return;
 const fps=perfFrames/Math.max(.01,perfSeconds);
 perfFrames=0;perfSeconds=0;perfGate++;
 if(perfGate<2)return;
 const min=mobile?.85:1.15,max=Math.min(devicePixelRatio||1,mobile?1.35:1.85);
 let target=renderQuality;
 if(fps<29)target=Math.max(min,renderQuality-.12);
 else if(fps>54)target=Math.min(max,renderQuality+.06);
 if(Math.abs(target-renderQuality)>.015){renderQuality=target;renderer.setPixelRatio(renderQuality);renderer.setSize(innerWidth,innerHeight,false)}
}
let humanGait=0,beastGait=0;function frame(){requestAnimationFrame(frame);const dt=Math.min(.046,clock.getDelta());sceneTime+=dt;if(mode==='race')updateRace(dt);// Visual animations use actual runner and opponent speeds
 const hspeed=mode==='race'&&race?.phase==='running'?(race?.humanV||0):0,espeed=mode==='race'&&race?.phase==='running'?(race?.enemyV||0):0;
 if(hspeed>.13)humanGait+=dt*(6.8+clamp(hspeed/8,0,1.7)*4.3);if(espeed>.13)beastGait+=dt*(4.2+clamp(espeed/10,0,2.5)*5.4);human.animate(humanGait,hspeed,mode==='race'?race.stamina:1,mode==='race'?race.legTaps:null,mode==='race'?race.time:0);opponent.animate(beastGait,espeed);
 if(mode!=='race'){human.root.position.z=0;opponent.root.position.z=0;human.root.rotation.y=(mode==='custom')?Math.sin(sceneTime*.3)*.03:0;opponent.root.rotation.y=0}
 dust.forEach(x=>{if(x.life>0){x.life-=dt;x.mesh.scale.multiplyScalar(1+dt*1.9);x.mesh.position.y+=dt*.24;x.mesh.material.opacity=Math.max(0,.25*x.life/x.max);if(x.life<=0)x.mesh.visible=false}});
 adaptQuality(dt);updateCam(dt);sun.position.z=(mode==='race'?race.humanD:0)+24;sun.target.position.z=mode==='race'?race.humanD:0;sun.target.updateMatrixWorld();renderer.render(scene,camera)}
// Replace synthetic expression typo guard for minifier-safe runtime.
renderCustom();renderTraining();renderBeasts();refreshMenu();showScreen('menu');requestAnimationFrame(frame);loader.style.display='none';
})();