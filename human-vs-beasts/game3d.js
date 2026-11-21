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
 racer('pegasus','ペガサス','助走から翼を広げて滑空する天馬',167,11.5,'pegasus',0xe0d9cd,21,'sprinter','架空生物'),
 racer('cerberus','ケルベロス','三つの頭を持つ魔獣',173,11.4,'cerberus',0x39323d,21,'sprinter','架空生物'),
 racer('griffin','グリフォン','ワシの翼と獣の体を持つ',179,11.6,'griffin',0xa88754,22,'sprinter','架空生物'),
 racer('minotaur','ミノタウロス','牛の頭を持つ二足歩行の怪物',186,10.5,'minotaur',0x5e524d,22,'heavy','架空生物'),
 racer('dragon','ドラゴン','巨大な翼と角を持つ生物',192,12.0,'dragon',0x7c4b50,23,'late','架空生物'),
 racer('golem','ゴーレム','岩の体で地面を踏み鳴らす',198,9.2,'golem',0x777e80,24,'heavy','架空生物'),
 racer('giantrobot','巨大ロボット','機械の脚で加速する',208,12.4,'giantrobot',0x7b9aaa,24,'late','架空生物'),
 racer('alien','宇宙生物','地球とは違う走り方をする',216,15.2,'alien',0x70a79b,25,'late','架空生物'),
 racer('kaiju','巨大怪獣','全ての相手を超える最後の一戦',224,11.8,'kaiju',0x656377,26,'late','架空生物'),
 // Preserve the first 50 rivals and their save IDs; special kaiju are bonus challenges.
 racer('spinetitan','スパインタイタン','27mの巨体と岩の背甲を持つ二足怪獣',81,5.5,'spinetitan',0x425b5f,23,'heavy','怪獣'),
 racer('velka','ヴェルカ','13mの軽量な疾走型二足怪獣',94,9.2,'velka',0x7a6555,24,'sprinter','怪獣'),
 racer('dorogan','ドロガン','20mの重甲四足怪獣',68,4.6,'dorogan',0x666c58,24,'heavy','怪獣')
];
// Fictional kaiju heights and per-foot strides (metres); not zoological measurements.
const KAIJU_SPECS={spinetitan:{heightM:27,strideM:9,form:'biped'},velka:{heightM:13,strideM:5.2,form:'biped'},dorogan:{heightM:20,strideM:7,form:'quad'}};
// Full standing-model heights in metres. Living species are representative adults;
// extinct sizes are approximate reconstructions; fantasy heights are game design.
// Measurement is the entire modeled silhouette (including horns/crest), not shoulder height.
const SPECIES_HEIGHT_M={
 dog:0.78,
 cat:1.04,
 fox:0.55,
 dodo:1,
 rabbit:0.5,
 greyhound:0.98,
 zebra:2.25,
 boar:1.35,
 ostrich:2.6,
 kangaroo:1.8,
 moa:3,
 horse:2.28,
 wolf:1.05,
 giantsloth:4,
 lion:1.38,
 deer:2.22,
 smilodon:1.42,
 gazelle:1.26,
 pronghorn:1.5,
 tiger:1.34,
 unicorn:2.37,
 cheetah:1.06,
 gorilla:1.76,
 elephant:3.7,
 hippo:1.75,
 rhino:2.12,
 mammoth:3.95,
 woollyrhino:2.32,
 direwolf:1.15,
 terrorbird:2.65,
 cavebear:2.1,
 triceratops:3.02,
 stegosaurus:4.05,
 ankylosaurus:1.95,
 parasaurolophus:4.4,
 gallimimus:2.45,
 velociraptor:0.65,
 deinonychus:1.4,
 carnotaurus:3.38,
 trex:4.65,
 spinosaurus:4.75,
 pegasus:2.38,
 cerberus:1.95,
 griffin:2.52,
 minotaur:3.2,
 dragon:6.4,
 golem:4.3,
 giantrobot:7.8,
 alien:2.35,
 kaiju:10,
 spinetitan:27,
 velka:13,
 dorogan:20
};
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
let debugMode=false;
// Debug runs operate on a temporary in-memory save and never rewrite the real career.
const store=()=>{if(debugMode)return;try{localStorage.setItem('animal100m_v4',JSON.stringify(save))}catch(e){}};

const originalBeastIds=['dog','cat','fox','rabbit','zebra','greyhound','ostrich','kangaroo','horse','lion','gazelle','pronghorn','cheetah'];
if(save.rosterVersion!==2){
 const originalStage=Math.max(0,Math.min(originalBeastIds.length-1,Math.floor(Number(save.chosen)||0)));
 const oldChoice=originalBeastIds[originalStage];
 const chosenNew=animals.findIndex(a=>a.id===oldChoice);
 const reachedOld=originalBeastIds.reduce((furthest,id,i)=>save.won.includes(id)?Math.max(furthest,i+1):furthest,0);
 const reachedNew=animals.findIndex(a=>a.id===originalBeastIds[Math.min(reachedOld,originalBeastIds.length-1)]);
 save.chosen=Math.max(0,save.won.includes('cheetah')&&oldChoice==='cheetah'?Math.min(animals.length-1,chosenNew+1):chosenNew);
 save.unlockedStage=Math.max(0,save.chosen,reachedNew);
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
const sphereCache=new Map(),sharedModelGeometries=new Set();
function sphereGeometry(detail){
 const n=Math.max(7,Math.min(40,Math.round(detail)));
 let geometry=sphereCache.get(n);
 if(!geometry){
  geometry=new T.SphereGeometry(1,n,Math.max(7,Math.floor(n*.7)));
  sphereCache.set(n,geometry);sharedModelGeometries.add(geometry);
 }
 return geometry;
}
const ball=(parent,mt,x,y,z,sx,sy,sz,detail=22)=>{
 const o=new T.Mesh(sphereGeometry(detail),mt);
 o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;o.receiveShadow=true;
 parent.add(o);return o;
};
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
function makeRawHuman(a){
 const morph=k=>clamp((Number(a[k]??defaultAvatar[k]??50)-50)/50,-1,1);
 const root=new T.Group(),skeleton=new T.Group();root.add(skeleton);
 const skin=mat(palettes.skin[a.skin%palettes.skin.length]),hair=mat(palettes.hair[a.hair%palettes.hair.length]),shirt=mat(palettes.shirt[a.shirt%palettes.shirt.length],.72),pants=mat(palettes.pants[a.pants%palettes.pants.length]),shoes=mat(palettes.shoes[a.shoes%palettes.shoes.length],.6),white=mat(0xecf1ea), iris=mat(palettes.irisTone[a.irisTone??0]||palettes.irisTone[0],.32),dark=mat(0x312721),lipMat=mat(new T.Color(palettes.skin[a.skin%palettes.skin.length]).multiplyScalar(.70),.92),soleMat=mat(palettes.sole[a.sole??0]||palettes.sole[0],.9);
 const bulky=.83+(a.build/10)*.45,wide=.89+(a.body/10)*.29;const height=.88+(a.height/10)*.26;const legRatio=1+.15*morph('legLength'),baseTorsoY=1.05*legRatio,shoulderWidth=1+.28*morph('shoulderWidth'),hipWidth=1+.25*morph('hipWidth'),armLength=1+.16*morph('armLength'),armBulk=1+.29*morph('armBulk'),thighBulk=1+.30*morph('legBulk'),calfBulk=1+.25*morph('calfBulk');
 skeleton.scale.set(wide*.91,height*1.03,wide*.91);const torso=new T.Group();torso.position.set(0,baseTorsoY,0);skeleton.add(torso);
 ball(torso,pants,0,-.01,-.04,.30*bulky*hipWidth,.235,.225);
 const chest=ball(torso,shirt,0,.39,-.02,.345*bulky*shoulderWidth,.40,.235*(1+.25*morph('chestDepth')));chest.scale.x*=wide;
 const jerseyOutline=[new T.Vector2(.245,.03),new T.Vector2(.264,.15),new T.Vector2(.275,.33),new T.Vector2(.31*shoulderWidth,.52),new T.Vector2(.30*shoulderWidth,.72),new T.Vector2(.16,.82)];
 const jersey=new T.Mesh(new T.LatheGeometry(jerseyOutline,24),shirt);jersey.scale.x=bulky*wide;jersey.scale.z=1+.20*morph('chestDepth');jersey.receiveShadow=true;jersey.castShadow=true;torso.add(jersey);ball(torso,shirt,0,.15,0,.255*(1+.33*morph('waistWidth')),.25,.20*(1+.25*morph('belly')));
 ball(torso,skin,0,.89,.06,.118,.155,.112);ball(torso,shirt,0,.77,.06,.15+.035*morph('neckline'),.043,.15); // neck
 // Narrow contrasting shoulder and side seams make the jersey read as technical sportswear.
 const jerseyTrim=mat(new T.Color(palettes.shirt[a.shirt%palettes.shirt.length]).multiplyScalar(.70),.92);
 for(const side of [-1,1]){
  tube(torso,[side*.237,.72,.103],[side*.287,.45,.193],.009,jerseyTrim,.009);
  tube(torso,[side*.278,.39,.180],[side*.222,.06,.137],.008,jerseyTrim,.008);
 }
 // decorative shirt panels / collar
 if(a.shirtStyle%3===0){ball(torso,white,0,.62,.22,.14,.10,.04)}
 if(a.shirtStyle%3===1){box(torso,.06,.65,.022,white,0,.35,.245)}
 if(a.shirtStyle%3===2){box(torso,.48,.095,.04,white,0,.3,.244)}if(a.shirtStyle>=4){for(let s of [-1,1])box(torso,.035,.46,.024,white,s*.25,.34,.20,true)}
 if(a.topPattern>0){for(let i=0;i<Math.min(5,a.topPattern);i++)box(torso,.23,.025,.025,a.topPattern%2?white:dark,0,.15+i*.10,.255,true)}
 // shoulder joints and articulated arms
 const arms=[],legs=[];
 for(const side of [-1,1]){
  const sh=new T.Group();sh.position.set(side*.42*bulky*shoulderWidth,.72,-.01);sh.scale.set(armBulk,armLength,armBulk);torso.add(sh);
  ball(sh,shirt,0,-.1,0,.158,.185,.165);
  conical(sh,a.shirtStyle>5||a.sleeveLength>65?shirt:skin,0,-.34,.01,.145,.105,.50,18);if(a.sleeveLength>20)ball(sh,shirt,0,-.18-a.sleeveLength*.0015,0,.155,.08+a.sleeveLength*.0015,.155);
  const elbow=new T.Group();elbow.position.y=-.58;sh.add(elbow);
  conical(elbow,skin,0,-.23,.035,.120,.078,.47,16);
  ball(elbow,skin,0,-.5,.06,.083,.113,.078);
  for(let finger=0;finger<3;finger++)ball(elbow,skin,(finger-1)*.040,-.594+(finger===1?-.014:0),.111,.020,.052,.028,14);
  ball(elbow,skin,side*.076,-.46,.116,.032,.059,.041,16);if(a.wristband>20)ball(elbow,shirt,0,-.39,.03,.14,.02+a.wristband*.00035,.12);arms.push({sh,elbow,side});
  const hip=new T.Group();hip.position.set(side*.2*wide*hipWidth,1.06*legRatio,0);hip.scale.y=legRatio;skeleton.add(hip);
  conical(hip,a.pantsLength>30?pants:skin,0,-.27,0,.169*bulky*thighBulk,.117*bulky*thighBulk,.57,20);
  const knee=new T.Group();knee.position.y=-.52;hip.add(knee);ball(knee,a.pantsLength>65?pants:skin,0,-.015,.012,.126*calfBulk,.112,.126,18);
  conical(knee,a.pantsLength>65?pants:skin,0,-.235,.015,.139*calfBulk,.075*calfBulk,.46,20);
  ball(knee,shoes,0,-.49,.115,.136*(1+.20*morph('shoeSize')),.104,.235*(1+.20*morph('shoeSize')));ball(knee,shoes,0,-.525,.31,.132*(1+.20*morph('shoeSize')),.071,.143*(1+.20*morph('shoeSize')));
  box(knee,.265,.043,.35,soleMat,0,-.566,.193);
   const lace=mat(0xd6d8cf,.87);
   for(let k=0;k<3;k++){
    const z=.16+k*.067;
    tube(knee,[-.061,-.417,z],[.061,-.417,z+.013],.007,lace,.007);
   }
   ball(knee,soleMat,0,-.58,.39,.123,.022,.042,14);
  legs.push({hip,knee,side});
 }
 const head=new T.Group();head.position.set(0,1.08+.025*morph('forehead'),.065);head.scale.setScalar(.88*(1+.20*morph('headSize')));torso.add(head);
 const hscale=.95+a.face*.013,faceW=.268*hscale,faceH=.352*(1+.17*morph('faceLength')),faceZ=.275*(1+.17*morph('faceDepth'));const headProfile=[[-.34,.042],[-.27,.17],[-.20,.235],[-.11,.282],[.02,faceW],[.15,faceW*.97],[.26,faceW*.88],[.32,faceW*.60],[.345,.018]].map(([y,r])=>new T.Vector2(r,y*faceH/.34));
 const headShape=new T.Mesh(new T.LatheGeometry(headProfile,32),skin);headShape.position.y=.13;headShape.scale.z=faceZ/faceW;headShape.castShadow=true;headShape.receiveShadow=true;head.add(headShape);ball(head,skin,0,.345+.03*morph('forehead'),-.015,faceW*.92,.095+.038*morph('forehead'),faceZ*.91,24);
 for(let s of [-1,1]){const ear=ball(head,skin,s*(faceW*1.04),.13,0,.06+.021*morph('earSize'),.094+.029*morph('earSize'),.058,20);ear.rotation.z=s*(.1+.35*morph('earAngle'));}
 // chin, cheekbones, eyes in +Z facing direction
 ball(head,skin,0,-.074-.030*morph('chinLength'),.103,.142+.034*morph('chinWidth'),.084+.019*morph('chinLength'),.138);for(let s of [-1,1])ball(head,skin,s*(faceW*.64),.042,faceZ*.43,.061+.016*morph('cheekbone'),.067+.015*morph('cheekFull'),.079,22);
 for(const side of [-1,1]){
  const eyeX=side*(.115+a.eyes*.002+.03*morph('eyeGap')),eyeY=.22+.020*morph('eyeHeight'),eyeZ=faceZ*.91;
  const ew=(.037+a.eyes*.0017)*(1+.25*morph('eyeWidth')),eh=(.018+a.eyes*.00085)*(1+.25*morph('eyeHeight'));const e=ball(head,white,eyeX,eyeY,eyeZ,ew,eh,.011,24);e.rotation.z=side*morph('eyeTilt')*.20;ball(head,skin,eyeX,eyeY+eh*.95+.007*morph('eyelid'),eyeZ+.008,ew*1.12,.012+.007*morph('eyelid'),.014,20);
  ball(head,iris,eyeX,eyeY,eyeZ+.012,.014+.004*morph('irisSize'),.016+.006*morph('irisSize'),.006,24);ball(head,dark,eyeX,eyeY,eyeZ+.018,.006,.009,.004,16);ball(head,white,eyeX-.005,eyeY+.006,eyeZ+.023,.003,.003,.002,12);
  const brow=ball(head,hair,eyeX+side*.016*morph('browGap'),.296+(a.brow-5)*.006+.026*morph('browHeight'),faceZ*.95,.08*(1+.30*morph('browLength')),.014+a.brow*.001+.008*morph('browThick'),.018,20);brow.rotation.z=side*((a.brow-5)*-.03+.30*morph('browAngle')+.15*morph('browCurve'));
  ball(head,skin,side*.145,.086,faceZ*.47,.057,.052,.046);if(a.lash>20)for(let j=0;j<3;j++)ball(head,hair,eyeX+(j-1)*.025,eyeY+.035,eyeZ+.020,.005,.010+a.lash*.0002,.006,12);if(a.freckles>10)for(let j=0;j<Math.floor(a.freckles/12);j++)ball(head,dark,side*(.14+j*.011),.04+(j%3)*.018,faceZ*.83,.004,.004,.006,10);
 }
 ball(head,skin,0,.09,faceZ*.91+.006*morph('noseBridge'),(.030+a.nose*.002)*(1+.23*morph('noseWidth')),.067+.018*morph('noseLength'),.042+.011*morph('noseBridge'),24);ball(head,skin,0,.018,faceZ+.028+.012*morph('noseTip'),.044+.014*morph('noseTip'),.029,.035,22);for(let s of [-1,1])ball(head,lipMat,s*(.035+.008*morph('nostril')),.000,faceZ+.041,.009+.004*morph('nostril'),.005,.004,14);
 const mouthY=-.049+.026*morph('mouthHeight'),mouthW=(.051+a.mouth*.0027)*(1+.25*morph('mouthWidth'));ball(head,lipMat,0,mouthY+.009,faceZ*.94,mouthW,.011+.010*morph('upperLip'),.012,20);ball(head,lipMat,0,mouthY-.010,faceZ*.95,mouthW*.96,.013+.010*morph('lowerLip'),.012,20);for(let s of [-1,1])ball(head,dark,s*mouthW,mouthY+.015*morph('smile'),faceZ*.93,.006,.005,.007,12);
 const style=a.hairStyle%10;const hairGroup=new T.Group();head.add(hairGroup);hairGroup.position.set(.055*morph('part'),-.023*morph('bangs'),0);hairGroup.scale.set(1+.22*morph('hairVolume'),1+.26*morph('hairLength'),1+.16*morph('hairVolume'));
 const hairCap=ball(hairGroup,hair,0,.365,-.034,.282,.11,.273);
 // Continuous temple/occipital volume avoids the isolated clump-like helmet look.
 for(const side of [-1,1]){
  const temple=ball(hairGroup,hair,side*.226,.29,-.055,.066,.14,.15,22);
  temple.rotation.z=side*.15;
 }
 const sideSweep=style=>style===0||style===3||style===7||style===8;
 if(sideSweep(a.hairStyle%10)){
  for(let i=0;i<5;i++){
   const strand=ball(hairGroup,hair,-.19+i*.085,.435-(i%2)*.02,.11,.077,.073,.13,18);
   strand.rotation.z=-.28;strand.rotation.y=.22;
  }
 }
 if(style===0)hairCap.scale.y=.62;
 else if(style===1){for(let i=0;i<8;i++){const ang=i*Math.PI*2/8;ball(hairGroup,hair,Math.cos(ang)*.22,.44,Math.sin(ang)*.20,.09,.10,.11,10)}}
 else if(style===2){for(let i=0;i<9;i++){ball(hairGroup,hair,Math.sin(i*2.3)*.22,.38+(i%3)*.055,Math.cos(i*2.3)*.2,.095,.105,.10,9)}}
 else if(style===3){for(let i=0;i<7;i++){const lock=ball(hairGroup,hair,(i-3)*.072,.433+Math.sin(i)*.025,.12,.056,.10,.105,20);lock.rotation.z=-.15+Math.sin(i)*.1}}
 else if(style===4){ball(hairGroup,hair,0,.48,-.27,.15,.21,.2);ball(hairGroup,hair,0,.26,-.33,.12,.26,.16)}
 else if(style===5){for(let i=0;i<11;i++){const ang=i*2.399;ball(hairGroup,hair,Math.cos(ang)*.22,.46+Math.sin(i)*.05,Math.sin(ang)*.21,.11,.14,.12,9)}}
 else if(style===6){for(let i=0;i<5;i++)ball(hairGroup,hair,0,.52+i*.085,-.05,.07*(1-i*.10),.12,.11,9)}
 else if(style===7){ball(hairGroup,hair,-.13,.41,.13,.18,.13,.14);ball(hairGroup,hair,.18,.49,.04,.19,.16,.19)}
 else if(style===8){for(let i=0;i<7;i++){const lock=ball(hairGroup,hair,(i-3)*.072,.46,.075,.062,.125,.092,18);lock.rotation.z=(i-3)*-.06}}
 else {ball(hairGroup,hair,0,.29,-.22,.30,.37,.12);ball(hairGroup,hair,-.17,.23,.19,.09,.26,.10);ball(hairGroup,hair,.17,.23,.19,.09,.26,.10)}
 if(a.hairLength>30){for(let side of [-1,1]){const lock=ball(hairGroup,hair,side*.245,.11-(a.hairLength-30)*.0035,-.035,.067,.12+a.hairLength*.0022,.094,18);lock.rotation.z=side*.05}}
 if(a.bangs>15){for(let j=0;j<6;j++){const x=(j-2.5)*.071+.035*morph('part');const fringe=ball(hairGroup,hair,x,.342-.053*morph('bangs'),.208,.045,.061+.060*morph('bangs'),.067,20);fringe.rotation.z=.18*morph('part')-.10}}
  if(a.accessory===1||a.accessory===6){const glassMat=mat(0x202c3a,.2,.5);for(const side of [-1,1])ball(head,glassMat,side*.115,.22,.30,.095,.055,.014)}
 if(a.accessory===2||a.accessory===7){const cap=ball(head,mat(0x142739),0,.47,0,.32,.105,.31);ball(head,mat(0x1a3453),0,.45,.25,.28,.026,.17)}
 if(a.accessory===3||a.accessory===8){box(torso,.075,.30,.03,m.gold,0,.22,.275)}
 if(a.accessory===4){ball(head,mat(0xd9b769,.3,.8),-.31,.12,0,.04,.07,.034);ball(head,mat(0xd9b769,.3,.8),.31,.12,0,.04,.07,.034)}
 if(a.accessory===5||a.accessory===9){ball(torso,m.gold,0,.46,.268,.08,.08,.023)}
 lineShadow(root,.5);
 return {root,skeleton,torso,head,arms,legs,animate(t,speed,stamina=1,legTaps=null,raceTime=0,dt=.016){
 const moving=speed>.13,intensity=moving?clamp(speed/9,.15,1.25):0;
 const pulse=side=>{if(!moving||!legTaps)return 0;const age=raceTime-legTaps[side];return age>=0&&age<.28?Math.sin(Math.PI*age/.28):0};
 const left=pulse('L'),right=pulse('R'),total=Math.max(left,right);
 const blend=1-Math.exp(-Math.max(.001,dt)*18);
 const smooth=(current,target)=>current+(target-current)*blend;
 torso.rotation.x=smooth(torso.rotation.x,moving?-(.10+.075*intensity)+morph('posture')*.06:morph('posture')*.06);
 torso.rotation.z=smooth(torso.rotation.z,(left-right)*.035);
 torso.position.y=smooth(torso.position.y,baseTorsoY+total*.045*intensity);
 head.rotation.x=smooth(head.rotation.x,-torso.rotation.x*.55);
 head.rotation.z=smooth(head.rotation.z,-torso.rotation.z*.4);
 legs.forEach((v,i)=>{
  const foot=i===0?left:right;
  v.hip.rotation.x=smooth(v.hip.rotation.x,foot*(.51+.31*intensity));
  v.knee.rotation.x=smooth(v.knee.rotation.x,foot*(.54+.32*intensity));
 });
 arms.forEach((v,i)=>{
  const opposite=i===0?right:left;
  v.sh.rotation.x=smooth(v.sh.rotation.x,opposite*(-.30-.38*intensity));
  v.sh.rotation.z=smooth(v.sh.rotation.z,v.side*.10);
  v.elbow.rotation.x=smooth(v.elbow.rotation.x,-.28-opposite*.35);
 });
 }};
}

// Normalize geometry to a shared world scale, then seat feet on the track.
// The holder is separate from the animated body: animation can reset body.position.y
// without losing the calibrated ground offset. Track shadows remain in the root.
function normalizeSubjectHeight(rig,model,heightM){
 if(!(heightM>0)&&heightM!==0)throw Error('Missing physical height');
 rig.root.updateMatrixWorld(true);
 const bbox=new T.Box3().setFromObject(model);
 const measured=bbox.max.y-bbox.min.y;
 if(!(measured>.04)||!Number.isFinite(measured))throw Error('Invalid 3D model bounds');
 const rootScale=rig.root.scale.y;
 const holder=new T.Group();
 rig.root.add(holder);
 // Prefer the lowest articulated foot over decorative tails, manes and body ornaments.
 // The standing sole is measured before the race animation; this prevents the
 // whole quadruped being lifted when an accessory hangs below its hooves.
 let soleY=Infinity;
 if(Array.isArray(rig.legs)&&rig.legs.length){
  for(const leg of rig.legs){
   const foot=leg.knee||leg.hip;
   if(!foot)continue;
   foot.updateWorldMatrix(true,true);
   const footBounds=new T.Box3().setFromObject(foot);
   if(Number.isFinite(footBounds.min.y))soleY=Math.min(soleY,footBounds.min.y);
  }
 }
 // Ground contact is determined by the articulated feet even when a long tail,
 // wing or decorative geometry extends far below the soles. Comparing the foot
 // to the overall bounds made some quadrupeds hover over the track.
 const groundY=Number.isFinite(soleY)?soleY:bbox.min.y;
 holder.position.y=-groundY/Math.max(.0001,rootScale);
 holder.add(model);
 rig.root.scale.multiplyScalar(heightM/measured);
 // Make the new world-space bounds immediately valid for camera and podium setup.
 rig.root.updateMatrixWorld(true);
 rig.root.userData.worldHeightM=heightM;
 return rig;
}

function makeHuman(a){
 const rig=makeRawHuman(a);
 // Avatar height (1..10) maps to an adult stature while retaining all 73 sliders.
 const value=clamp(Number(a.height)||5,1,10);
 return normalizeSubjectHeight(rig,rig.skeleton,1.70+(value-5)*.045);
}
function makeBeast(data){
 const k=data.kind;const root=new T.Group(),bodyGroup=new T.Group();root.add(bodyGroup);const coat=mat(data.coat,.98),highlight=mat(new T.Color(data.coat).multiplyScalar(1.10),.94),shade=mat(new T.Color(data.coat).multiplyScalar(.72),.96),nose=mat(0x2c2727),pale=mat(k==='zebra'?0xece8e2:0xf0dac3),white=mat(0xffffff),eyes=mat(0x18191c,.28);coat.map=furMaterialTexture;coat.needsUpdate=true;let legs=[],tail,arms=[],rabbitEars=[];
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
  if(k==='kangaroo'){
    const tailPivot=new T.Group();tailPivot.position.set(0,.96,-.42);bodyGroup.add(tailPivot);
    tube(tailPivot,[0,0,0],[0,-.53,-.92],.17,shade,.24);
    tube(tailPivot,[0,-.53,-.92],[0,-.81,-1.47],.11,shade,.15);
    tail=tailPivot;
    for(const side of [-1,1]){
     const arm=new T.Group();arm.position.set(side*.31,1.59,.22);bodyGroup.add(arm);
     tube(arm,[0,0,0],[side*.13,-.38,.35],.11,coat,.085);
     ball(arm,coat,side*.16,-.41,.44,.095,.14,.085);
     arms.push({sh:arm,side});
    }
   }
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
   if(k==='rabbit')rabbitEars.push(ear);
   if(k==='fox'){ear.scale.y*=1.7;ear.scale.x*=.75}
   if(k==='cat'){ear.scale.y*=1.32;ear.scale.x*=.8}
  }
  if(k==='rabbit'){for(let s of [-1,1]){const ear=ball(bodyGroup,highlight,s*.15,S.headY+.67,S.bodyL+.22,.10,.49,.10);ear.rotation.z=s*.14;rabbitEars.push(ear)}}
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
 bodyGroup.scale.setScalar(k==='rabbit'?.94:1);
 lineShadow(root,large?.8:.6);
 return {root,bodyGroup,legs,arms,tail,rabbitEars,animate(t,speed){
  const effort=clamp(speed/13,0,1.35),moving=effort>.025;
  const hopper=k==='rabbit'||k==='kangaroo',gallop=['cat','cheetah','greyhound','dog','fox','lion'].includes(k);
  const heavy=['horse','zebra'].includes(k);
  const cadence=hopper?1.15:gallop?1.28:heavy?.88:1;
  const phase=t*cadence,s=Math.sin(phase);
  // Contact-aware animation: quadrupeds never receive a permanent floating
  // offset. Only the airborne half of a true hop lifts the torso.
  const lift=hopper?Math.pow(Math.max(0,s),1.5)*.18:
    gallop?Math.max(0,Math.sin(phase*2))*.043:
    heavy?Math.max(0,Math.sin(phase*2))*.016:Math.max(0,Math.sin(phase*2))*.028;
  bodyGroup.position.y=lift*effort;
  bodyGroup.rotation.x=(hopper?s*.07:gallop?s*.032:s*.012)*effort;
  legs.forEach((v,i)=>{
   const front=(v.front||1)>0,side=v.side||((i%2)?1:-1);
   // Diagonal trot for horses/zebras, paired hind-leg thrust for hoppers,
   // bounding front/hind phases for cats and sprinters.
   const offset=hopper?(front?Math.PI:0):
     gallop?(front?Math.PI*.72:0)+(side>0?.16:-.16):
     (front===(side>0)?0:Math.PI);
   const step=Math.sin(phase+offset);
   v.hip.rotation.x=step*(hopper?.86:gallop?.76:heavy?.53:.62)*effort;
   v.knee.rotation.x=Math.max(0,-step)*(hopper?1.03:gallop?.96:heavy?.47:.7)*effort;
  });
  // Keep the lowest articulated paw/hoof on the track for non-jumping
  // quadrupeds. Measure in world space, then convert the correction into
  // body-local coordinates; do not use tails or other decorations as feet.
  // Hoppers retain their deliberate airborne phase.
  if(!hopper && moving && legs.length===4 && legs.every(leg=>leg.knee)){
   bodyGroup.updateMatrixWorld(true);
   let lowest=Infinity;
   for(const leg of legs){
    const bounds=new T.Box3().setFromObject(leg.knee);
    if(Number.isFinite(bounds.min.y))lowest=Math.min(lowest,bounds.min.y);
   }
   if(Number.isFinite(lowest)){
    const rootY=root.getWorldPosition(new T.Vector3()).y;
    const scaleY=Math.max(.001,root.getWorldScale(new T.Vector3()).y);
    const soleHeight=(lowest-rootY)/scaleY;
    // A small tolerance preserves natural gallop suspension while preventing
    // obvious hovering. Never accumulate offsets between animation frames.
    const tolerance=heavy?.012:gallop?.035:.020;
    const correction=clamp(soleHeight-tolerance,-.15,.15);
    bodyGroup.position.y-=correction*.85;
   }
  }
  if(tail){tail.rotation.y=Math.sin(phase*1.2)*.19*effort;tail.rotation.x=Math.sin(phase*.9)*.12*effort}
 }};
}


function makeOriginalKaiju(data){
 const cfg=KAIJU_SPECS[data.kind];
 if(!cfg)throw Error('Unknown original kaiju');
 const root=new T.Group(),bodyGroup=new T.Group();root.add(bodyGroup);
 const coat=mat(data.coat,.93),shade=mat(new T.Color(data.coat).multiplyScalar(.67),.91);
 const plate=mat(data.kind==='spinetitan'?0x869496:data.kind==='velka'?0xb7a37a:0x49534b,.8);
 const eyes=mat(0xe3b979,.5),claws=mat(0x343a37,.89);
 const legs=[],arms=[];let tail=null;
 const b=(p,m,x,y,z,w,h,d)=>ball(p,m,x,y,z,w,h,d,16);
 const spike=(p,m,x,y,z,h,w=.19)=>{const o=new T.Mesh(new T.ConeGeometry(w,h,6),m);o.position.set(x,y+h*.3,z);o.rotation.x=-.34;o.castShadow=true;p.add(o)};
 function leg(side,z,hipY,front=false){
  const hip=new T.Group();hip.position.set(side*.65,hipY,z);bodyGroup.add(hip);
  b(hip,coat,0,-.33,0,.29,.47,.33);
  const knee=new T.Group();knee.position.set(0,-.72,.10);hip.add(knee);
  b(knee,shade,0,-.37,0,.23,.46,.28);
  b(knee,plate,0,-.74,.27,.32,.14,.48);
  for(const x of [-.15,0,.15])b(knee,claws,x,-.74,.51,.07,.07,.14);
  legs.push({hip,knee,side,front:front?1:-1});
 }
 if(cfg.form==='quad'){
  b(bodyGroup,coat,0,1.68,0,1.00,.76,1.68);
  b(bodyGroup,shade,0,1.71,1.01,.82,.55,.88);
  b(bodyGroup,coat,0,2.28,1.64,.75,.53,.73);
  b(bodyGroup,plate,0,2.07,2.20,.49,.12,.53);
  for(const side of [-1,1]){
   leg(side,-1.03,1.46,false);leg(side,1.06,1.46,true);
   b(bodyGroup,eyes,side*.51,2.43,2.25,.10,.08,.06);
   spike(bodyGroup,plate,side*.55,2.45,1.67,.55,.22);
  }
  for(let i=0;i<7;i++)spike(bodyGroup,plate,0,2.28,-1.34+i*.41,.33+i*.018,.28);
 }else{
  const swift=data.kind==='velka',width=swift?.55:.84;
  b(bodyGroup,coat,0,1.79,swift?.18:0,width,swift?.82:1.04,swift?.54:.73);
  b(bodyGroup,shade,0,1.17,.04,width*.80,.34,.48);
  b(bodyGroup,coat,0,2.84,swift?.60:.22,swift?.40:.56,.48,.48);
  b(bodyGroup,plate,0,2.63,swift?1.06:.69,swift?.29:.42,.14,.43);
  b(bodyGroup,claws,0,2.59,swift?1.36:1.00,.30,.07,.14);
  for(const side of [-1,1]){
   leg(side,-.16,1.46,false);
   b(bodyGroup,eyes,side*(swift?.28:.40),2.95,swift?.90:.59,.075,.06,.06);
   const arm=new T.Group();arm.position.set(side*(swift?.52:.77),2.26,.30);bodyGroup.add(arm);
   b(arm,coat,0,-.32,.12,.18,.43,.23);b(arm,shade,0,-.65,.22,.16,.19,.19);
   arms.push({sh:arm,side});
   if(swift)spike(bodyGroup,plate,side*.37,3.02,.34,.33,.15);
  }
  for(let i=0;i<(swift?5:8);i++)spike(bodyGroup,plate,0,1.24+i*.22,swift?-.49:-.66,swift?.30:.54,swift?.16:.29);
 }
 const tailRoot=new T.Group();tailRoot.position.set(0,cfg.form==='quad'?1.51:1.24,cfg.form==='quad'?-1.51:-.71);
 bodyGroup.add(tailRoot);
 tube(tailRoot,[0,0,0],[0,-.22,-1.08],.34,coat,.26);
 tube(tailRoot,[0,-.22,-1.08],[0,-.55,-2.18],.25,shade,.08);
 for(let i=0;i<5;i++)spike(tailRoot,plate,0,-.07-i*.095,-.40-i*.31,.24,.13);
 tail=tailRoot;
 // Fit the 3D bounding box to the explicitly fictional height in game-world metres.
 root.updateMatrixWorld(true);const bb=new T.Box3().setFromObject(root);
 const h=Math.max(.1,bb.max.y-bb.min.y);root.scale.setScalar(cfg.heightM/h);
 root.userData.worldHeightM=cfg.heightM;
 lineShadow(root,.85);
 return withSpeciesLocomotion(data,{root,bodyGroup,legs,arms,tail,animate:()=>{}});
}

function buildUnscaledBeast(data){
 if(KAIJU_SPECS[data.kind])return makeOriginalKaiju(data);
 // The original thirteen racers retain their existing models; the other thirty-seven use specialized anatomy.
 if(data.kind==='boar')return withSpeciesLocomotion(data,makeWildBoar(data));
 if(originalBeastIds.includes(data.id))return withSpeciesLocomotion(data,finishAnimalModel(data,makeBeast(data)));
 const k=data.kind,root=new T.Group(),bodyGroup=new T.Group();root.add(bodyGroup);
 const inorganic=['golem','giantrobot'].includes(k);
 const coat=mat(data.coat,inorganic?.64:.96,inorganic?.13:0);
 const shade=mat(new T.Color(data.coat).multiplyScalar(.68),inorganic?.7:.97);
 const light=mat(new T.Color(data.coat).multiplyScalar(1.28),.91);
 const eye=mat(inorganic?0xa5eff1:0x191b20,.35),white=mat(0xe2e2d9,.85);
 const tusk=mat(0xe7d8b4,.53),horn=mat(0x625b4b,.79),mouth=mat(0x302b29,.9);
 const armor=mat(new T.Color(data.coat).multiplyScalar(.86),.74,.04);
 const gold=mat(0xbca164,.55,.15);
 const wingmat=mat(new T.Color(data.coat).multiplyScalar(.91),.85);
 const legs=[],arms=[];let tail=null,wings=[],decor=[];
 const dinoArmored=['triceratops','stegosaurus','ankylosaurus'].includes(k);
 const theropod=['parasaurolophus','gallimimus','velociraptor','deinonychus','carnotaurus','trex','spinosaurus'].includes(k);
 const bird=['dodo','moa','terrorbird'].includes(k);
 const humanoid=['gorilla','giantsloth','minotaur','golem','giantrobot','alien','kaiju'].includes(k);
 const quad=!theropod&&!bird&&!humanoid;
 const supersize=['mammoth','elephant','triceratops','stegosaurus','ankylosaurus','dragon','kaiju','giantrobot','golem','spinosaurus','trex'].includes(k);
 const sizeScale=({dodo:.86,moa:1.12,terrorbird:1.14,boar:1.04,wolf:.99,direwolf:1.16,deer:1.08,tiger:1.16,smilodon:1.12,gorilla:1.18,giantsloth:1.18,elephant:1.48,hippo:1.18,rhino:1.24,mammoth:1.58,woollyrhino:1.40,cavebear:1.38,triceratops:1.44,stegosaurus:1.44,ankylosaurus:1.35,parasaurolophus:1.45,gallimimus:1.08,velociraptor:.85,deinonychus:1.05,carnotaurus:1.42,trex:1.70,spinosaurus:1.72,unicorn:1.05,pegasus:1.16,cerberus:1.18,griffin:1.20,minotaur:1.32,dragon:1.68,golem:1.44,giantrobot:1.52,alien:1.24,kaiju:1.78})[k]||1;
 root.scale.setScalar(sizeScale);
 const b=(parent,mt,x,y,z,sx,sy,sz,n=16)=>ball(parent,mt,x,y,z,sx,sy,sz,n);
 const t=(parent,p1,p2,r,mt,r2)=>tube(parent,p1,p2,r,mt,r2??r*.75);
 const cone=(parent,mt,x,y,z,r1,r2,h)=>conical(parent,mt,x,y,z,r1,r2,h,10);
 function spike(parent,mt,x,y,z,h,angle=0,r=.12){
  const s=new T.Mesh(new T.ConeGeometry(r,h,8),mt);
  s.position.set(x,y+h*.34,z);s.rotation.x=angle;s.castShadow=true;parent.add(s);return s;
 }
 function leafWing(parent,side,x,y,z,large=false){
  const wing=new T.Group();wing.position.set(side*x,y,z);parent.add(wing);
  for(let i=0;i<5;i++){
   const feather=b(wing,wingmat,side*(.18+i*.19),-.02+i*.02,-.07-i*.065,
        .15+(large?.05:0),.043,.48+i*.10,12);
   feather.rotation.y=side*(.13+i*.055);feather.rotation.z=side*(.23+i*.09);
  }
  t(wing,[0,0,0],[side*(large?1.20:.95),.27,-.42],.09,shade,.045);
  wings.push({wing,side});return wing;
 }
 function eyesPair(parent,xx,yy,zz,width=.05){
  for(const side of [-1,1]){
   b(parent,eye,side*xx,yy,zz,width,width*.92,.031,12);
   if(inorganic)b(parent,white,side*xx,yy,zz+.034,width*.25,width*.25,.008,10);
  }
 }
 function horns(parent,x,y,z,h,r=.065){
  for(const side of [-1,1]){
   const sp=spike(parent,horn,side*x,y,z,h,side*.38,r);
   sp.rotation.z=-side*.35;
  }
 }
 function animalHead(parent,z,y,w=.27,h=.28,front=.35){
  b(parent,coat,0,y,z,w,h,front);
  b(parent,light,0,y-.12,z+front*.62,w*.70,h*.46,front*.48);
  eyesPair(parent,w*.78,y+.06,z+front*.66,Math.max(.034,w*.18));
  b(parent,mouth,0,y-.19,z+front*.96,w*.29,.041,.045);
 }
 function limb(upper,lower,z,side,x,thin=.16,heel=.16,hipY=1.03){
  const joint=new T.Group();joint.position.set(side*x,hipY,z);bodyGroup.add(joint);
  if(inorganic){
    box(joint,thin*2.1,upper*1.05,thin*2.2,armor,0,-upper*.48,0,true);
  }else b(joint,coat,0,-upper*.40,0,thin,upper*.54,thin*.97,15);
  const knee=new T.Group();knee.position.y=-upper*.83;joint.add(knee);
  if(inorganic)box(knee,thin*1.55,lower*.93,thin*1.8,shade,0,-lower*.45,0,true);
  else b(knee,coat,0,-lower*.38,.025,thin*.74,lower*.48,thin*.75,15);
  b(knee,inorganic?armor:shade,0,-lower*.81,.16,thin*1.01,.095,heel,12);
  legs.push({hip:joint,knee,side,front:z>0?1:-1});
 }
 if(quad){
  const massive=['elephant','hippo','rhino','mammoth','woollyrhino','cavebear','dragon','triceratops','stegosaurus','ankylosaurus'].includes(k);
  const runnerHorse=['deer','unicorn','pegasus'].includes(k);
  const broad=massive?.68:runnerHorse?.40:.46;
  const length=massive?1.18:runnerHorse?1.04:.87;
  const hipY=massive?1.34:runnerHorse?1.20:1.06;
  const bh=massive?.57:runnerHorse?.42:.37;
  b(bodyGroup,coat,0,hipY,0,broad,bh,length,24);
  b(bodyGroup,light,0,hipY+.11,length*.37,broad*.72,bh*.74,.38,19);
  if(['hippo','rhino','woollyrhino','boar','mammoth','elephant'].includes(k)){
   b(bodyGroup,coat,0,hipY+.02,length*.48,broad*.91,bh*.89,.48,20);
  }
  const neckY=massive?1.57:runnerHorse?1.60:1.31;
  b(bodyGroup,coat,0,neckY-.19,length*.72,broad*.58,.36,.34,18);
  const headY=massive?1.58:runnerHorse?1.79:1.42;
  const faceW=['mammoth','elephant','hippo'].includes(k)?broad*.60:runnerHorse?.23:.30;
  animalHead(bodyGroup,length+.38,headY,faceW,massive?.35:.28,runnerHorse?.47:.34);
  for(let side of [-1,1]){
   const ear=b(bodyGroup,coat,side*(faceW+.12),headY+.23,length+.22,massive?.19:.105,massive?.20:.17,.085);
   ear.rotation.z=side*.35;
  }
  if(runnerHorse||['rhino','woollyrhino','triceratops'].includes(k)){
   for(let side of [-1,1]){const legGap=runnerHorse?.78:.82;limb(.69,.55,side*length*.74,1, broad*.63,runnerHorse?.115:.20,.24,hipY-.17);limb(.69,.55,side*length*.74,-1,broad*.63,runnerHorse?.115:.20,.24,hipY-.17)}
  }else{
   for(let front of [-1,1])for(let side of [-1,1]){
    const thick=massive?.225:.16,top=massive?.65:.51,low=massive?.58:.49;
    limb(top,low,front*length*.72,side,broad*.70,thick,massive?.26:.21,hipY-.10);
   }
  }
  if(['elephant','mammoth'].includes(k)){
   // Curved trunk and paired tusks distinguish the elephant and mammoth in silhouette.
   const z=length+.72,y=headY-.12;
   t(bodyGroup,[0,y,z],[0,y-.34,z+.24],.13,coat,.105);
   t(bodyGroup,[0,y-.34,z+.24],[0,y-.77,z+.39],.105,coat,.077);
   t(bodyGroup,[0,y-.77,z+.39],[0,y-.98,z+.54],.074,coat,.066);
   for(let side of [-1,1]){
    t(bodyGroup,[side*.20,headY-.18,length+.64],[side*.38,headY-.30,length+1.04],.095,tusk,.066);
    t(bodyGroup,[side*.38,headY-.30,length+1.04],[side*.43,headY+.04,length+1.23],.066,tusk,.012);
   }
   if(k==='mammoth'){
    for(let i=0;i<20;i++){const angle=i*2.39996,z=-.9+(i*.18)%2;
      b(bodyGroup,shade,Math.cos(angle)*broad*.88,hipY+Math.sin(angle)*bh*.86,z,.13,.18,.17,9)}
    b(bodyGroup,shade,0,headY+.29,length+.35,.38,.20,.21);
   }
  }
  if(['rhino','woollyrhino'].includes(k)){
   spike(bodyGroup,tusk,0,headY+.11,length+.78,.55,-.55,.16);
   spike(bodyGroup,tusk,0,headY+.28,length+.60,.28,-.45,.10);
   if(k==='woollyrhino')for(let i=0;i<22;i++){
    b(bodyGroup,shade,Math.cos(i*2.4)*broad*.84,hipY+Math.sin(i*2.4)*bh*.7,-.85+i*.083,.125,.13,.12,8)}
  }
  if(k==='hippo'){b(bodyGroup,light,0,headY-.20,length+.80,.39,.24,.37,18);b(bodyGroup,mouth,0,headY-.37,length+1.01,.31,.065,.16)}
  if(k==='boar'){for(let side of [-1,1]){spike(bodyGroup,tusk,side*.21,headY-.28,length+.74,.25,-.28,.08);spike(bodyGroup,shade,side*.23,headY+.27,length+.25,.28,0,.11)}}
  if(k==='smilodon'){for(let side of [-1,1]){const tooth=cone(bodyGroup,tusk,side*.145,headY-.30,length+.70,.015,.075,.36);tooth.rotation.z=Math.PI}}
  if(k==='wolf'||k==='direwolf'||k==='cerberus'){for(let side of [-1,1])spike(bodyGroup,shade,side*.17,headY+.29,length+.31,.27,0,.09)}
  if(k==='tiger'){for(let i=0;i<16;i++){const z=-.70+i*.095;const s=i%2?1:-1;const stripe=b(bodyGroup,shade,s*broad*.82,hipY+.11+(i%3)*.11,z,.073,.15,.085,9);stripe.rotation.z=s*.3}}
  if(k==='deer'){for(let side of [-1,1]){const x=side*.20,z=length+.32;
   t(bodyGroup,[x,headY+.26,z],[side*.39,headY+.73,z-.06],.05,horn,.03);
   for(let h=0;h<3;h++)t(bodyGroup,[side*(.29+h*.04),headY+.40+h*.12,z-.05],[side*(.43+h*.09),headY+.55+h*.18,z-.18],.028,horn,.014);
  }}
  if(k==='unicorn')spike(bodyGroup,tusk,0,headY+.32,length+.46,.60,-.16,.065);
  if(k==='cerberus')for(let side of [-1,1]){
   const group=new T.Group();group.position.set(side*.45,.12,length-.05);bodyGroup.add(group);
   animalHead(group,.72,headY,.27,.23,.35);spike(group,shade,side*.12,headY+.25,.76,.23,0,.09);
  }
  if(k==='pegasus'||k==='griffin'||k==='dragon'){
   for(let side of [-1,1]){
    const wing=leafWing(bodyGroup,side,broad*.86,hipY+.32,-.22,k==='dragon');
    if(k==='pegasus')wing.scale.set(1.75,1.4,1.35);
   }
  }
  if(k==='griffin'){
   b(bodyGroup,light,0,headY+.28,length+.28,.31,.26,.27);
   spike(bodyGroup,gold,0,headY-.12,length+.85,.26,-1.3,.12);
   for(let side of [-1,1])spike(bodyGroup,light,side*.17,headY+.45,length+.24,.18,0,.07);
  }
  if(k==='dragon'){
   horns(bodyGroup,.20,headY+.35,length+.35,.38);
   for(let i=0;i<8;i++)spike(bodyGroup,shade,0,hipY+bh*.80,-length+i*.27,.24,0,.15);
  }
  if(dinoArmored){
   if(k==='triceratops'){
    b(bodyGroup,armor,0,headY+.12,length+.15,.48,.45,.20);
    for(let side of [-1,1])spike(bodyGroup,tusk,side*.26,headY+.31,length+.57,.62,-.38,.12);
    spike(bodyGroup,tusk,0,headY-.10,length+.85,.25,-.55,.11);
   }
   if(k==='stegosaurus')for(let i=0;i<8;i++){
    const zz=-length+i*length*.29;spike(bodyGroup,i%2?shade:armor,i%2?.13:-.13,hipY+bh*.64,zz,.42+Math.sin(i*.44)*.28,0,.22);
   }
   if(k==='ankylosaurus'){
    for(let i=0;i<24;i++)spike(bodyGroup,armor,(i%2?1:-1)*(broad*.62),hipY+bh*.75,-length+(i%12)*(length/5.5),.14,0,.12);
    b(bodyGroup,armor,0,hipY+bh*.75,0,broad*.87,bh*.55,length*.84);
   }
  }
  if(['cavebear','boar','direwolf','smilodon','dragon','ankylosaurus','stegosaurus'].includes(k)){
   const tg=new T.Group();tg.position.set(0,hipY,-length*.85);bodyGroup.add(tg);
   t(tg,[0,0,0],[0,-.15,-.58],.10,coat,.08);
   t(tg,[0,-.15,-.58],[0,-.32,-1.04],.075,shade,.033);
   if(k==='ankylosaurus')b(tg,armor,0,-.35,-1.08,.34,.22,.30,12);
   if(k==='stegosaurus'||k==='dragon')for(let i=0;i<4;i++)spike(tg,horn,0,-.13,-.35-i*.2,.22,.8,.075);
   tail=tg;
  }
 }else if(theropod||bird){
  const small=['dodo','velociraptor','deinonychus'].includes(k);
  const longNeck=['moa','gallimimus','parasaurolophus','terrorbird'].includes(k);
  const big=['carnotaurus','trex','spinosaurus'].includes(k);
  const bodyY=bird?.99:(big?1.70:1.32),bodyW=bird?(k==='dodo'?.46:.38):(big?.56:.35);
  const bodyL=bird?(k==='dodo'?.63:.69):(big?1.10:.78);
  b(bodyGroup,coat,0,bodyY,-.02,bodyW,bird?(k==='dodo'?.57:.40):(big?.51:.36),bodyL,22);
  const neckTop=longNeck?bodyY+.72:bodyY+.40;
  if(longNeck){
   t(bodyGroup,[0,bodyY+.10,bodyL*.55],[0,neckTop,bodyL*.82],.16,coat,.095);
   b(bodyGroup,coat,0,neckTop,bodyL*.95,.20,.24,.26);
  }else{
   b(bodyGroup,coat,0,bodyY+.30,bodyL*.68,bodyW*.63,.33,.43);
  }
  const hy=longNeck?neckTop+.10:bodyY+.37;
  const hz=longNeck?bodyL+0.53:bodyL+.66;
  b(bodyGroup,coat,0,hy,hz,big?.36:bird?.23:.24,.24,big?.50:.32);
  b(bodyGroup,light,0,hy-.14,hz+.24,.20,.11,.24);
  eyesPair(bodyGroup,big?.28:.20,hy+.07,hz+.18,big?.055:.044);
  if(bird){
   const beak=b(bodyGroup,k==='terrorbird'?horn:gold,0,hy-.07,hz+.40,k==='terrorbird'?.20:.15,.095,k==='terrorbird'?.46:.31);
   beak.rotation.x=.11;
   for(let side of [-1,1])b(bodyGroup,shade,side*bodyW,bodyY+.14,.13,.20,.24,.29,12);
  }else{
   b(bodyGroup,mouth,0,hy-.21,hz+.40,big?.25:.17,.06,big?.23:.16);
   if(['trex','carnotaurus','spinosaurus','velociraptor','deinonychus'].includes(k))
    for(let side of [-1,1])for(let i=0;i<3;i++)spike(bodyGroup,tusk,side*(.08+i*.045),hy-.23,hz+.44,.10,Math.PI,.027);
  }
  for(let side of [-1,1]){
   const legY=bird?bodyY-.29:bodyY-.35;
   limb(bird?.53:big?.84:.67,bird?.51:big?.77:.64,-bodyL*.26,side,bodyW*.68,big?.22:.15,.24,legY);
  }
  if(!bird){
   for(let side of [-1,1]){const arm=new T.Group();arm.position.set(side*bodyW*.65,hy-.22,bodyL*.62);bodyGroup.add(arm);
    b(arm,coat,0,-.12,.12,.085,.22,.10);
    b(arm,shade,0,-.36,.23,.075,.18,.085);
    for(let i=0;i<2;i++)spike(arm,horn,side*(i?.06:-.06),-.55,.27,.12,-.7,.025);
    arms.push({sh:arm,side});
   }
   const tg=new T.Group();tg.position.set(0,bodyY-.05,-bodyL*.64);bodyGroup.add(tg);
   t(tg,[0,0,0],[0,-.10,-.65],bodyW*.47,coat,bodyW*.28);
   t(tg,[0,-.10,-.65],[0,-.27,-1.3],bodyW*.28,coat,.08);
   t(tg,[0,-.27,-1.3],[0,-.36,-1.75],.08,shade,.015);
   tail=tg;
  }
  if(k==='parasaurolophus')t(bodyGroup,[0,hy+.1,hz-.05],[0,hy+.72,hz-.47],.09,shade,.025);
  if(k==='carnotaurus')horns(bodyGroup,.22,hy+.23,hz+.12,.28);
  if(k==='spinosaurus')for(let i=0;i<11;i++){
   spike(bodyGroup,shade,0,bodyY+.23,-bodyL+(i*.2),.39+Math.sin(i/10*Math.PI)*.68,0,.16);
  }
  if(k==='gallimimus'||k==='velociraptor'||k==='deinonychus')for(let side of [-1,1]){
   b(bodyGroup,shade,side*bodyW*.85,bodyY+.24,-.15,.13,.10,.32);
   if(k!=='gallimimus')for(let j=0;j<5;j++)b(bodyGroup,light,side*(bodyW*.78),bodyY+.13,-.45+j*.15,.03,.06,.08,10);
  }
 }else if(humanoid){
  const stone=k==='golem',robot=k==='giantrobot',slender=k==='alien',beastlike=k==='kaiju';
  const shoulder=slender?.34:beastlike?.70:.53;
  const bodyY=1.65;
  if(stone||robot)box(bodyGroup,shoulder*2.0,1.0,.56,coat,0,bodyY+.02,0,true);
  else b(bodyGroup,coat,0,bodyY,0,shoulder,.73,.38,22);
  b(bodyGroup,shade,0,1.10,.06,shoulder*.82,.35,.31);
  if(k==='gorilla'||k==='giantsloth')b(bodyGroup,light,0,1.76,.33,.36,.37,.12);
  for(let side of [-1,1]){
   limb(.63,.56,.05,side,shoulder*.56,stone?.25:slender?.10:.20,.25,1.05);
   const arm=new T.Group();arm.position.set(side*shoulder,2.11,.05);bodyGroup.add(arm);
   if(stone||robot)box(arm,.30,.65,.32,shade,0,-.37,.04,true);
   else b(arm,coat,0,-.40,0,stone?.24:.18,humanoid?.49:.45,.19);
   const hand=b(arm,stone||robot?armor:shade,0,-.90,.16,stone?.25:.21,.23,.19);
   arms.push({sh:arm,side});
  }
  const headY=slender?2.75:2.64,headW=slender?.40:k==='kaiju'?.40:.32;
  if(robot||stone)box(bodyGroup,.58,.55,.50,shade,0,headY,.13,true);
  else b(bodyGroup,coat,0,headY,.12,headW,slender?.38:.30,slender?.27:.32);
  if(slender){
   for(let side of [-1,1])b(bodyGroup,eye,side*.175,headY+.02,.38,.125,.20,.06,18);
   for(let side of [-1,1])t(bodyGroup,[side*.13,headY+.34,.03],[side*.27,headY+.58,.04],.027,shade,.012);
  }else{
   eyesPair(bodyGroup,headW*.62,headY+.065,.40,stone?.053:.047);
   b(bodyGroup,light,0,headY-.14,.38,headW*.63,.115,.11);
  }
  if(k==='minotaur'){horns(bodyGroup,.28,headY+.18,.09,.43);b(bodyGroup,mouth,0,headY-.23,.48,.20,.11,.13)}
  if(k==='giantsloth')for(let side of [-1,1])for(let i=0;i<3;i++){
   spike(bodyGroup,tusk,side*(shoulder+.07*i),1.20,.45,.22,-.70,.045);
  }
  if(stone)for(let i=0;i<10;i++){
   const x=(i%2?1:-1)*(shoulder*.65),y=1.05+(i%5)*.31;
   box(bodyGroup,.23,.28,.21,armor,x,y,.24,true);
  }
  if(robot){
   box(bodyGroup,.47,.26,.08,mtRobotLight(),0,1.80,.335);
   for(let i=-1;i<=1;i++)b(bodyGroup,eye,i*.11,1.8,.38,.036,.045,.020,12);
   for(let side of [-1,1])box(bodyGroup,.13,.32,.13,armor,side*.51,2.29,.02,true);
  }
  if(k==='kaiju'){
   for(let i=0;i<8;i++)spike(bodyGroup,shade,0,1.04+i*.25,-.30,.31+i*.025,-.18,.14);
   const tg=new T.Group();tg.position.set(0,1.04,-.25);bodyGroup.add(tg);
   t(tg,[0,0,0],[0,-.35,-.9],.27,coat,.18);
   t(tg,[0,-.35,-.9],[0,-.54,-1.65],.18,shade,.04);
   tail=tg;
  }
 }
 // Distinct run cycles: heavy creatures swing slowly; nimble creatures gallop or hop.
 lineShadow(root,supersize?1.15:.65);
 function animate(time,speed){
  const effort=clamp(speed/15,0,1.9);
  const hop=bird||theropod||k==='deer'||k==='pegasus';
  bodyGroup.position.y=effort*(hop?Math.abs(Math.sin(time))*.10:Math.sin(time*2)*.035);
  bodyGroup.rotation.z=effort*Math.sin(time)*.019;
  for(const [i,part] of legs.entries()){
   const alternate=i%2===0?0:Math.PI;
   const front=part.front<0?Math.PI*.53:0;
   const phase=time+(quad?alternate+front:alternate);
   const swing=Math.sin(phase);
   part.hip.rotation.x=swing*effort*(quad?.54:.68);
   part.knee.rotation.x=Math.max(0,-swing)*effort*.76;
  }
  for(const [i,part] of arms.entries()){
   part.sh.rotation.x=Math.sin(time+i*Math.PI)*effort*.50;
  }
  if(tail){tail.rotation.y=Math.sin(time*.67)*.11*effort;tail.rotation.x=Math.sin(time*.55)*.07*effort}
  for(const wing of wings)wing.wing.rotation.z=-wing.side*(.08+.15*Math.sin(time*.76)*effort);
 }
 function mtRobotLight(){return mat(0x80bdb4,.25,.3)}
 return withSpeciesLocomotion(data,finishAnimalModel(data,{root,bodyGroup,legs,arms,tail,wings,animate}));
}


function makeExtendedBeast(data){
 const rig=buildUnscaledBeast(data);
 // Also reseat the metre-sized kaiju: their original meshes extended below ground.
 const heightM=SPECIES_HEIGHT_M[data.kind];
 return normalizeSubjectHeight(rig,rig.bodyGroup,heightM);
}

function finishAnimalModel(data,rig){
 const g=rig.bodyGroup,k=data.kind;if(!g)return rig;
 const ink=mat(0x272724,.93);
 const dark=mat(new T.Color(data.coat).multiplyScalar(.65),.97);
 const light=mat(new T.Color(data.coat).lerp(new T.Color(0xf1e8d8),.38),.94);
 const dot=(m,x,y,z,w,h,d)=>ball(g,m,x,y,z,w,h,d,12);
 const line=(a,b,m,r=.006)=>tube(g,a,b,r,m,r*.72);
 if(['cat','dog','fox','greyhound','wolf','direwolf','lion','cheetah','tiger','smilodon'].includes(k)){
  const native=originalBeastIds.includes(data.id),yy=native?(k==='cat'?.95:1.19):1.42,zz=native?(k==='cat'?1.04:1.35):1.40;
  dot(light,0,yy-.17,zz+.20,.20,.11,.16);dot(ink,0,yy-.13,zz+.34,.065,.037,.040);
  for(const side of [-1,1]){
   dot(ink,side*.22,yy+.065,zz+.15,.021,.015,.012);
   for(let i=0;i<3;i++)line([side*.13,yy-.11+i*.044,zz+.29],[side*(.34+i*.02),yy-.13+i*.044,zz+.13],light,.0045);
  }
 }
 if(['horse','zebra','gazelle','pronghorn','deer','unicorn','pegasus'].includes(k)){
  const yy=originalBeastIds.includes(data.id)?1.72:1.75,zz=originalBeastIds.includes(data.id)?1.06:1.45;
  dot(light,0,yy+.08,zz+.20,.07,.20,.034);
  for(let i=0;i<7;i++)dot(dark,0,yy+.09+i*.080,zz-.28-i*.041,.062,.081,.071);
 }
 if(['ostrich','dodo','moa','terrorbird','griffin'].includes(k)){
  const yy=k==='ostrich'?1.35:k==='dodo'?.98:1.15;
  for(const side of [-1,1])for(let i=0;i<7;i++){
   const f=dot(i%3===0?light:dark,side*(.32+i*.025),yy+.16-i*.035,(i-3)*.086,.072,.065,.14);
   f.rotation.y=side*.20;
  }
 }
 if(['elephant','mammoth','rhino','woollyrhino','hippo','giantsloth','cavebear'].includes(k)){
  for(let i=0;i<14;i++)dot(i%5===0?light:dark,i%2?.54:-.54,1.25+((i*3)%5)*.077,-.85+i*.125,.034,.09,.05);
 }
 if(['trex','spinosaurus','carnotaurus','velociraptor','deinonychus','gallimimus','triceratops','stegosaurus','ankylosaurus','parasaurolophus'].includes(k)){
  const yy=['trex','spinosaurus','carnotaurus'].includes(k)?1.76:1.34;
  for(let i=0;i<22;i++)dot(i%5===0?light:dark,(i%2?.35:-.35),yy+.16+(i%5)*.04,-.73+i*.073,.042,.027,.067);
 }
 if(['golem','giantrobot','alien','minotaur','gorilla','kaiju'].includes(k)){
  if(['golem','giantrobot'].includes(k))for(let i=0;i<5;i++)dot(i%2?light:dark,0,1.2+i*.22,.40,.29,.02,.035);
  else dot(light,0,1.70,.39,.28,.22,.055);
 }
 if(['dragon','pegasus','griffin'].includes(k)){
  for(let side of [-1,1]){
   const shape=new T.Shape();shape.moveTo(0,0);shape.lineTo(side*.90,.27);shape.lineTo(side*1.34,-.15);shape.lineTo(side*.67,-.34);shape.lineTo(0,-.07);shape.closePath();
   const membrane=new T.Mesh(new T.ShapeGeometry(shape),new T.MeshStandardMaterial({color:new T.Color(data.coat).multiplyScalar(.87),roughness:.96,side:T.DoubleSide}));
   membrane.position.set(side*.49,k==='dragon'?1.8:1.6,-.42);membrane.rotation.y=side*.2;membrane.castShadow=true;g.add(membrane);
  }
 }
 // Species-specific anatomy remains in the same rig for races and photos.
 // Add key silhouette cues to the original mammals where the shared
 // quadruped body used to make a cat look like a small dog.
 if(k==='cat'){
  const earInside=mat(0x9e716d,.90),nosePink=mat(0x8b6661,.87);
  for(const side of [-1,1]){
   const ear=new T.Mesh(new T.ConeGeometry(.135,.30,4),light);
   ear.position.set(side*.22,1.30,.91);ear.rotation.z=-side*.20;ear.rotation.y=Math.PI/4;g.add(ear);
   dot(earInside,side*.22,1.29,1.00,.052,.103,.025);
   for(let i=0;i<3;i++)line([side*.10,.83+i*.045,1.51],
    [side*(.46+i*.07),.82+i*.065,1.41],i===1?light:dark,.006);
  }
  dot(nosePink,0,.80,1.55,.066,.044,.037);
  dot(light,-.12,.77,1.47,.13,.09,.07);dot(light,.12,.77,1.47,.13,.09,.07);
 }
 if(k==='dog'){
  const earDark=mat(new T.Color(data.coat).multiplyScalar(.62),.98);
  for(const side of [-1,1]){
   const flap=dot(earDark,side*.33,1.32,.98,.155,.27,.13);
   flap.rotation.z=side*.40;
   dot(light,side*.15,1.08,1.51,.12,.09,.18);
   for(let toe=-1;toe<=1;toe++)dot(ink,side*.25+toe*.07,.27,1.02,.031,.026,.042);
  }
  dot(ink,0,1.00,1.70,.112,.09,.075);
  dot(light,0,.92,1.56,.25,.15,.22);
 }
 if(k==='rabbit'){
  const inner=mat(0xba918f,.93);
  for(const side of [-1,1])dot(inner,side*.15,1.66,.99,.042,.30,.035);
  dot(light,0,.67,-.58,.16,.15,.13);
 }
 if(['horse','zebra','unicorn','pegasus'].includes(k)){
  const hoof=mat(0x423d39,.91);
  for(const leg of rig.legs||[])if(leg.knee)
   dot(hoof,0,-.57,.24,.17,.105,.17);
  for(let side of [-1,1])dot(light,side*.18,2.16,1.93,.085,.045,.045);
 }
 if(k==='cheetah'){
  for(const side of [-1,1])line([side*.21,1.40,1.62],
   [side*.20,1.07,1.80],ink,.022);
 }
 for(const leg of rig.legs||[])if(leg.knee)for(const side of [-1,1])ball(leg.knee,ink,side*.077,-.54,.24,.029,.036,.060,10);
 return rig;
}

function makeWildBoar(data){
 const root=new T.Group(),body=new T.Group();root.add(body);root.scale.setScalar(1.16);
 const coat=mat(0x73543f,.98),dark=mat(0x41352f,.99),muzzle=mat(0x967a67,.97),nose=mat(0xaf9382,.94),
 eyeMat=mat(0x211d1a,.25),tusk=mat(0xefe2c2,.5),hoof=mat(0x2c2925,.95),pink=mat(0x996f5e,.93);
 coat.map=furMaterialTexture;coat.needsUpdate=true;
 const B=(p,m,x,y,z,sx,sy,sz,d=18)=>ball(p,m,x,y,z,sx,sy,sz,d);
 const curved=(points,r,material)=>{
  const path=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));
  const o=new T.Mesh(new T.TubeGeometry(path,12,r,7,false),material);o.castShadow=true;body.add(o);return o;
 };
 const legs=[];
 // Deep shoulders, wedge-shaped head, narrow rear.
 B(body,coat,0,1.08,-.11,.48,.45,.93,24);
 B(body,coat,0,1.26,.42,.52,.53,.57,24);
 B(body,coat,0,1.06,.77,.39,.36,.38,22);
 B(body,coat,0,1.08,1.03,.35,.33,.43,24);
 const bridge=B(body,muzzle,0,.94,1.35,.278,.21,.34,22);bridge.rotation.x=-.16;
 B(body,nose,0,.86,1.64,.29,.20,.085,24);
 for(let side of [-1,1]){
  B(body,eyeMat,side*.31,1.26,1.20,.039,.038,.023,12);
  B(body,pink,side*.31,1.27,1.23,.012,.012,.009,8);
  B(body,eyeMat,side*.138,.885,1.727,.070,.057,.021,12);
  // Boar ears are flat triangles; there are no horns.
  const ear=new T.Mesh(new T.ConeGeometry(.156,.30,3),coat);
  ear.position.set(side*.35,1.55,.80);ear.rotation.z=side*.51;ear.rotation.x=-.22;ear.castShadow=true;body.add(ear);
  const inset=B(body,pink,side*.36,1.55,.9,.045,.115,.025,10);inset.rotation.z=side*.44;
  // The characteristic curved UPWARD lower tusks on the outside of the cheeks.
  curved([[side*.26,.80,1.38],[side*.38,.86,1.54],[side*.42,1.045,1.67]],.059,tusk);
  B(body,tusk,side*.42,1.045,1.67,.026,.050,.025,10);
 }
 // Short thick legs with black split hooves.
 for(let front of [-1,1])for(let side of [-1,1]){
  const hip=new T.Group();hip.position.set(side*.335,.82,front*.65);body.add(hip);
  B(hip,coat,0,-.18,0,.20,.27,.21);
  const knee=new T.Group();knee.position.y=-.39;hip.add(knee);
  B(knee,coat,0,-.16,.03,.14,.23,.15);
  B(knee,hoof,0,-.37,.09,.153,.09,.22);
  for(let toe of [-1,1])B(knee,hoof,toe*.071,-.428,.23,.060,.063,.10,10);
  legs.push({hip,knee,front,side});
 }
 // Dark rigid bristles follow the back instead of cartoon horns.
 for(let i=0;i<52;i++){
  const z=.51-(i%13)*.114,x=(Math.floor(i/13)-1.5)*.107;
  const y=1.68-.14*Math.max(0,Math.abs(z+.15));
  const mesh=new T.Mesh(new T.ConeGeometry(.013,.13+(i%4)*.020,5),i%4===0?coat:dark);
  mesh.position.set(x,y,z);mesh.rotation.x=-.34;mesh.rotation.z=x*.5;body.add(mesh);
 }
 curved([[0,1.09,-.97],[0,1.07,-1.19],[.10,1.13,-1.35],[.18,1.23,-1.43]],.033,coat);
 B(body,dark,.18,1.23,-1.44,.06,.09,.08,10);
 lineShadow(root,.8);
 return {root,bodyGroup:body,legs,tail:null,animate(time,speed){
  const eff=clamp(speed/13,0,1.8);
  body.position.y=eff*Math.sin(time*2)*.026;
  body.rotation.x=Math.sin(time)*.011*eff;
  for(let i=0;i<legs.length;i++){
   const l=legs[i],phase=time+(i<2?0:Math.PI)+(i%2?Math.PI*.45:0),w=Math.sin(phase);
   l.hip.rotation.x=w*.54*eff;l.knee.rotation.x=Math.max(0,-w)*.55*eff;
  }
 }};
}


// Individual biomechanical gaits for every race competitor.
// Contemporary animals use observed locomotor families; prehistoric/fantasy gaits are stylized hypotheses.
const GAIT_MAP={
 dog:'canter',cat:'flexGallop',fox:'canter',dodo:'birdRun',rabbit:'bound',greyhound:'flexGallop',
 zebra:'horseGallop',boar:'heavyTrot',ostrich:'birdRun',kangaroo:'kangarooHop',moa:'birdRun',
 horse:'horseGallop',wolf:'canter',giantsloth:'heavyBiped',lion:'flexGallop',
 deer:'pronk',smilodon:'flexGallop',gazelle:'pronk',pronghorn:'horseGallop',tiger:'flexGallop',
 unicorn:'horseGallop',cheetah:'flexGallop',gorilla:'knuckleRun',elephant:'heavyTrot',
 hippo:'heavyTrot',rhino:'heavyTrot',mammoth:'heavyTrot',woollyrhino:'heavyTrot',
 direwolf:'canter',terrorbird:'birdRun',cavebear:'heavyTrot',
 triceratops:'heavyTrot',stegosaurus:'heavyTrot',ankylosaurus:'heavyTrot',
 parasaurolophus:'birdRun',gallimimus:'birdRun',velociraptor:'birdRun',
 deinonychus:'birdRun',carnotaurus:'birdRun',trex:'birdRun',spinosaurus:'birdRun',
 spinetitan:'giantBiped',velka:'giantBiped',dorogan:'giantQuad',
 pegasus:'wingFlight',cerberus:'canter',griffin:'canter',
 minotaur:'heavyBiped',dragon:'heavyTrot',golem:'heavyBiped',
 giantrobot:'mechanicalRun',alien:'springRun',kaiju:'heavyBiped'
};
const GAIT_LABELS={
 kangarooHop:'両後脚で跳躍',bound:'前後の脚をそろえて跳躍',pronk:'4本脚で跳ねる',
 birdRun:'二足で交互に疾走',horseGallop:'四足のギャロップ',flexGallop:'背中をしならせた疾走',
 canter:'四足で駆ける',heavyTrot:'重量級の踏み込み',heavyBiped:'重い二足歩行',
 knuckleRun:'腕で体を支える走り',mechanicalRun:'機械の脚で走る',springRun:'軽い跳躍走',
 giantBiped:'巨体の二足踏み込み',giantQuad:'巨体の四足踏み込み',wingFlight:'助走・羽ばたき飛行・着地'
};
function animalGaitRate(kind,speed){
 // Contact phase advances by ground distance / species stride length.
 if(KAIJU_SPECS[kind]){const spec=KAIJU_SPECS[kind];return (spec.form==='quad'?Math.PI/2:Math.PI)*Math.max(0,speed)/spec.strideM;}
 if(kind==='pegasus')return 2.7+clamp(speed,0,38)*.10;
 const gait=GAIT_MAP[kind]||'canter';
 const clamped=clamp(speed,0,45);
 const stride={
  kangarooHop:1.58,bound:1.75,pronk:1.6,birdRun:2.7,
  horseGallop:2.04,flexGallop:2.18,canter:2.10,
  heavyTrot:1.38,heavyBiped:1.28,knuckleRun:1.58,
  mechanicalRun:1.61,springRun:2.23
 }[gait]||2.0;
 return (1.65+clamped*0.28)*stride;
}

// Species-specific performance accents run ON TOP of anatomically distinct gaits.
// Every one of the 53 models gets its own 3D action, not a shared randomized wobble.
// These are stylized character performances, not claims about real animal biology.
function speciesMotion(kind,rig,phase,effort){
 const body=rig.bodyGroup,legs=rig.legs||[],arms=rig.arms||[],tail=rig.tail,wings=rig.wings||[];
 const a=Math.min(1.35,effort),s=Math.sin(phase),c=Math.cos(phase);
 const f=Math.sin(phase*2.3),g=Math.cos(phase*1.3),q=Math.sin(phase*.43);
 const yaw=(n)=>{body.rotation.y+=n*a};
 const roll=(n)=>{body.rotation.z+=n*a};
 const pitch=(n)=>{body.rotation.x+=n*a};
 const bounce=(n)=>{body.position.y+=Math.max(0,n)*a};
 const tailWag=(n)=>{if(tail)tail.rotation.y+=n*a};
 const tailPitch=(n)=>{if(tail)tail.rotation.x+=n*a};
 const armSwing=(n)=>{for(const [i,p] of arms.entries())if(p.sh)p.sh.rotation.x+=(i%2?-1:1)*n*a};
 const wingFlap=(n)=>{for(const p of wings)p.wing.rotation.z+=p.side*n*a};
 switch(kind){
  case 'dog':          roll(.10*f);tailWag(.36*Math.sin(phase*2.6));break; // happy tail & excited zig
  case 'cat':          pitch(-.13*c);body.scale.z*=1+.085*s;tailWag(.25*Math.sin(phase*1.9));break; // springy arched back
  case 'fox':          yaw(.095*s);tailWag(.40*g);bounce(.04*(1+c));break; // tail-led sidestep
  case 'dodo':         roll(.23*s);pitch(.09*f);bounce(.05*(1+f));break; // drunken waddling
  case 'rabbit':       pitch(.12*c);legs.forEach(p=>{if(p.front<0)p.knee.rotation.x+=.22*a*Math.max(0,s)});body.rotation.z+=.025*f*a;break; // double hind tuck and airborne balance
  case 'greyhound':    pitch(-.085*s);body.scale.z*=1+.14*c;tailWag(.10*g);break; // overextended sprint
  case 'zebra':        yaw(.07*f);roll(.065*c);tailWag(.26*f);break; // energetic stamping
  case 'boar':         pitch(-.14*Math.abs(s));roll(.12*f);tailWag(.18*s);break; // head-first shuffle
  case 'ostrich':      roll(.12*g);pitch(.12*s);bounce(.06*(1+c));break; // high-neck sway
  case 'kangaroo':     pitch(.10*s);tailPitch(-.31*c);tailWag(.12*g);break; // tail as a rudder
  case 'moa':          roll(.16*Math.sin(phase*.8));pitch(.14*f);break; // towering wobbly strides
  case 'horse':        pitch(.09*s);body.scale.z*=1+.048*c;tailWag(.25*f);break; // exaggerated thoroughbred
  case 'wolf':         pitch(-.105*(1+c));tailWag(.16*q);roll(.044*f);break; // low pack-leader prowl
  case 'giantsloth':   roll(.15*g);pitch(.17*s);armSwing(.23*f);break; // enormous slow lurch
  case 'lion':         pitch(-.13*s);roll(.07*Math.sin(phase*1.5));tailWag(.23*q);break; // chest-out charge
  case 'deer':         bounce(.09*(1+s));roll(.075*f);yaw(.05*c);break; // sideways spring
  case 'smilodon':     pitch(-.20*Math.max(0,c));armSwing(.12*f);tailPitch(.12*s);break; // teeth-first pounce
  case 'gazelle':      roll(.10*Math.sin(phase*.7));yaw(.105*f);bounce(.10*(1+s));break; // corkscrew pronk
  case 'pronghorn':    yaw(.16*Math.sin(phase*.93));roll(.045*f);tailWag(.09*s);break; // slalom dash
  case 'tiger':        roll(.115*Math.sin(phase*1.7));pitch(-.10*s);tailWag(.31*Math.sin(phase*.72));break; // stalking shoulder rolls
  case 'unicorn':      pitch(.19*Math.max(0,s));roll(.065*f);tailWag(.20*Math.sin(phase*1.1));break; // proud head toss
  case 'cheetah':      body.scale.z*=1+.19*s;pitch(.095*c);tailWag(.24*g);break; // extreme spinal extension
  case 'gorilla':      roll(.16*s);pitch(.18*Math.max(0,c));armSwing(.30*f);break; // alternating knuckle smash
  case 'elephant':     roll(.060*Math.sin(phase*.68));pitch(.035*c);tailWag(.21*Math.sin(phase*.64));break; // lumbering trunk-like sway
  case 'hippo':        roll(.16*Math.sin(phase*1.37));bounce(.035*(1+f));pitch(.075*s);break; // barrel wobble
  case 'rhino':        pitch(-.18*Math.max(0,s));yaw(.06*f);roll(.035*c);break; // horn-first bulldozer
  case 'mammoth':      roll(.055*g);pitch(.065*s);tailWag(.13*Math.sin(phase*.55));break; // swinging tusk silhouette
  case 'woollyrhino':  pitch(-.10*Math.abs(c));roll(.090*f);tailWag(.075*g);break; // woolly shoulder shake
  case 'direwolf':     pitch(-.065*c);body.scale.z*=1+.074*s;tailWag(.28*Math.sin(phase*1.32));break; // enormous canine stride
  case 'terrorbird':   pitch(.22*Math.sin(phase*1.12));roll(.09*f);bounce(.048*(1+c));break; // fast pecking gait
  case 'cavebear':     roll(.13*Math.sin(phase*.77));pitch(.17*Math.max(0,s));armSwing(.14*c);break; // staggering bear bulk
  case 'triceratops':  pitch(-.18*Math.max(0,s));roll(.065*Math.sin(phase*.84));tailWag(.11*q);break; // horn feint
  case 'stegosaurus':  roll(.075*g);tailWag(.46*Math.sin(phase*.83));pitch(.04*f);break; // dramatic tail sweep
  case 'ankylosaurus': tailWag(.68*Math.sin(phase*.63));roll(.075*Math.sin(phase*.63));break; // club-tail windup
  case 'parasaurolophus':yaw(.14*Math.sin(phase*.95));pitch(.125*s);tailWag(.11*c);break; // crest-like head dance
  case 'gallimimus':   roll(.13*f);pitch(.10*c);armSwing(.21*Math.sin(phase*2.1));break; // nervous bird-arm paddles
  case 'velociraptor':yaw(.19*Math.sin(phase*1.1));roll(.115*f);tailWag(-.25*s);break; // evasive raptor jig
  case 'deinonychus':  pitch(.13*c);armSwing(.33*Math.sin(phase*1.7));tailWag(.20*Math.sin(phase*.98));break; // sickle-claw reach
  case 'carnotaurus':  roll(.10*Math.sin(phase*2.0));pitch(-.145*Math.max(0,s));armSwing(.40*f);break; // tiny furious arms
  case 'trex':         pitch(-.135*Math.max(0,c));armSwing(.42*Math.sin(phase*2.1));tailWag(.115*g);break; // ridiculous micro-arm sprint
  case 'spinosaurus':  roll(.083*Math.sin(phase*.62));pitch(.13*s);tailWag(.29*Math.sin(phase*.57));break; // sailboat-like rocking
  case 'pegasus':      wingFlap(-.29*Math.sin(phase*.58));pitch(-.06*Math.max(0,s));tailWag(.10*q);break; // broad wing strokes
  case 'cerberus':     yaw(.20*Math.sin(phase*.84));roll(.090*Math.cos(phase*2.2));tailWag(.31*f);break; // three-head scan
  case 'griffin':      wingFlap(-.37*Math.sin(phase*.90));roll(.17*Math.sin(phase*.71));pitch(-.07*c);break; // banking wing-beast
  case 'minotaur':     yaw(.095*f);pitch(-.20*Math.max(0,s));armSwing(.28*Math.sin(phase*1.61));break; // bull-like shoulder feint
  case 'dragon':       wingFlap(-.45*Math.sin(phase*.68));roll(.14*Math.sin(phase*.42));tailWag(.29*Math.sin(phase*.42));break; // broad-winged sway
  case 'golem':        roll(.10*Math.sign(s)*Math.abs(s));bounce(.035*(1+f));armSwing(.12*c);break; // loose masonry stomp
  case 'giantrobot':   pitch(.095*Math.sin(phase*1.15));roll(.062*Math.sign(f));armSwing(.28*Math.sign(s));break; // angular mechanical joints
  case 'alien':        body.scale.x*=1+.12*Math.sin(phase*1.7);body.scale.y*=1+.078*Math.sin(phase*.81);yaw(.15*f);break; // elastic extraterrestrial shuffle
  case 'kaiju':        roll(.09*Math.sin(phase*.42));pitch(-.10*Math.max(0,s));tailWag(.20*Math.sin(phase*.41));break; // geological wobble
  case 'spinetitan':   roll(.10*Math.sin(phase*.34));pitch(.09*Math.sin(phase*.49));tailWag(.08*f);break; // drifting giant dorsal plates
  case 'velka':        yaw(.145*Math.sin(phase*1.47));pitch(-.09*s);tailWag(.32*Math.sin(phase*1.34));break; // agile titan switchback
  case 'dorogan':      roll(.06*Math.sin(phase*.36));pitch(.035*c);tailWag(.095*Math.sin(phase*.42));break; // slow four-foot quake
  default:throw Error('Missing 3D signature motion for '+kind);
 }
 rig.signatureMotion=kind;
}

function withSpeciesLocomotion(data,rig){
 const kind=data.kind,gait=GAIT_MAP[kind]||'canter';
 const body=rig.bodyGroup,legs=rig.legs||[],arms=rig.arms||[],tail=rig.tail,wings=rig.wings||[],rabbitEars=rig.rabbitEars||[];
 const original=rig.animate,scaleX=body.scale.x,scaleY=body.scale.y,scaleZ=body.scale.z;
 let lastImpact=null;
 rig.gait=gait;rig.gaitLabel=GAIT_LABELS[gait]||'走行';
 rig.animate=function(phase,speed,distance=0){
  // Preserve native wing articulation and accessories before overriding the common leg cycle.
  if(original)original(phase,speed);
  const moving=speed>.18,effort=moving?clamp(speed/11,.18,1.50):0;
  if(!moving){
   body.position.y=0;body.rotation.x=0;body.rotation.y=0;body.rotation.z=0;
   body.scale.x=scaleX;body.scale.y=scaleY;body.scale.z=scaleZ;
   for(const leg of legs){leg.hip.rotation.x=0;leg.knee.rotation.x=0}
   for(const arm of arms)if(arm.sh)arm.sh.rotation.x=0;
   for(const ear of rabbitEars)ear.rotation.x=0;
   if(tail){tail.rotation.x=0;tail.rotation.y=0}
   lastImpact=null;
   return false;
  }
  const s=Math.sin(phase),cos=Math.cos(phase);
  const lift=Math.pow(Math.max(0,s),1.20);
  const brace=Math.pow(Math.max(0,-s),1.35);
  const isKangaroo=gait==='kangarooHop';
  const isBound=gait==='bound';
  const isPronk=gait==='pronk';
  const biped=['birdRun','heavyBiped','knuckleRun','mechanicalRun','springRun'].includes(gait);
  body.position.y=0;body.rotation.x=0;body.rotation.y=0;body.rotation.z=0;body.scale.x=scaleX;body.scale.y=scaleY;body.scale.z=scaleZ;
  if(isKangaroo){
   // True macropod cycle: paired hind-leg push, ballistic aerial tuck, and
   // two-foot landing. Vertical travel is measured in world metres, not rig units.
   const jump=Math.pow(Math.max(0,Math.sin(phase*.5)),1.45);
   const stance=1-jump,worldScale=Math.max(.0001,rig.root.scale.y);
   const clearance=(.62*jump*Math.min(1.3,effort)+.015*stance)/worldScale;
   body.position.y=clearance;
   body.rotation.x=(.11*Math.cos(phase*.5)-.065*jump)*effort;
   body.scale.z=scaleZ*(1+.055*Math.cos(phase)*effort);
   for(const leg of legs){
    // Both rear feet are synchronized, unlike a generic alternating run.
    const hind=leg.front<0||legs.length<=2;
    leg.hip.rotation.x=(hind?-.24-.65*jump+.20*stance:-.15-.22*jump)*effort;
    leg.knee.rotation.x=(hind?.13+.98*jump:.14+.24*jump)*effort;
   }
   for(const arm of arms)if(arm.sh)arm.sh.rotation.x=(-.18-.28*jump)*effort;
   if(tail){
    tail.rotation.x=(.22*stance-.28*jump+.07*Math.cos(phase*.5))*effort;
    tail.rotation.y=.075*Math.sin(phase*.25)*effort;
   }
  }else if(isBound){
   // Rabbit: physically visible airborne phase, paired hind-foot push and
   // forward-reaching forefeet, then crouched ground contact.
   const jump=Math.pow(Math.max(0,Math.sin(phase)),1.06);
   const compression=Math.pow(Math.max(0,-Math.sin(phase)),.85);
   const worldScale=Math.max(.0001,rig.root.scale.y);
   body.position.y=.49*jump*Math.min(1.22,effort)/worldScale;
   body.rotation.x=(-.17*Math.cos(phase)+.045*compression)*Math.min(1.1,effort);
   body.scale.z=scaleZ*(1+.105*jump-.065*compression);
   body.scale.y=scaleY*(1-.055*compression);
   for(const leg of legs){
    const hind=leg.front<0||legs.length===2;
    leg.hip.rotation.x=(hind?(-.35-.78*jump+.30*compression):(.21+.56*jump-.19*compression))*effort;
    leg.knee.rotation.x=(hind?(.27+.86*jump):(.08+.45*jump))*effort;
   }
   for(const [i,ear] of rabbitEars.entries()){
    ear.rotation.x=(-.20*jump+.12*compression)*effort;
    ear.rotation.z=(i%2?1:-1)*(.12+.075*compression);
   }
   if(tail)tail.rotation.x=(.12*Math.cos(phase)-.11*jump)*effort;
  }else if(isPronk){
   // Deer and gazelles move with synchronized suspended leaps, not a flat trot.
   const worldScale=Math.max(.0001,rig.root.scale.y);
   body.position.y=.31*lift*Math.min(1.2,effort)/worldScale;
   body.rotation.x=.068*cos*effort;
   for(const leg of legs){leg.hip.rotation.x=(-.20-.49*lift)*effort;leg.knee.rotation.x=(.16+.64*lift)*effort}
   if(tail)tail.rotation.y=.12*s*effort;
  }else if(gait==='wingFlight'){
   // Pegasus takes off after the approach and NEVER lands within the race.
   // Keep flapping beyond 100m while the animal recedes over the horizon.
   const up=clamp((distance-7)/14,0,1);
   const flight=up*up*(3-2*up);
   rig.flight=flight;
   const heightScale=Math.max(.0001,rig.root.scale.y);
   const bob=.35*Math.sin(phase*1.2)*flight;
   // Steady climb from takeoff to 100m, rather than skimming a metre above the track.
   const climb=(6.5+Math.max(0,Math.min(100,distance)-21)*.11)*flight;
   body.position.y=(climb+bob)/heightScale;
   body.rotation.x=(-.10*flight+.025*cos)*effort;
   body.rotation.z=.025*Math.sin(phase*.6)*flight;
   for(const [i,leg] of legs.entries()){
    const beat=Math.sin(phase+(leg.front>0?Math.PI*.72:0)+(leg.side>0?.34:0));
    leg.hip.rotation.x=mix(beat*.61,-.31+(leg.front>0?.24:0),flight)*effort;
    leg.knee.rotation.x=mix(Math.max(0,-beat)*.7,.68,flight)*effort;
   }
   for(const wing of wings){
    const flap=Math.sin(phase*.92);
    wing.wing.rotation.z=-wing.side*(.17+flight*(.30+.78*flap));
    wing.wing.rotation.x=flight*.12*Math.sin(phase*.92-.9);
    wing.wing.rotation.y=wing.side*(.08+.09*Math.cos(phase*.92))*flight;
   }
   if(tail){tail.rotation.x=.08*Math.sin(phase*.5);tail.rotation.y=.14*Math.sin(phase*.48)}
  }else if(gait==='flexGallop'){
   // Cheetahs/felines and racing greyhounds stretch and gather the spine at speed.
   body.position.y=(.13*Math.max(0,Math.sin(phase*2))-.015*brace)*effort/Math.max(.0001,rig.root.scale.y);
   body.scale.z=scaleZ*(1+.10*Math.sin(phase)*effort);
   body.rotation.x=.085*cos*effort;
   for(const leg of legs){
    const hind=leg.front<0||legs.length===2;
    const wave=Math.sin(phase+(hind?0:Math.PI*.78)+(leg.side===1?.28:0));
    leg.hip.rotation.x=(.63*wave+(hind?.14:-.05))*effort;
    leg.knee.rotation.x=(Math.max(0,-wave)*.83)*effort;
   }
   if(tail)tail.rotation.y=.17*Math.sin(phase*.55)*effort;
  }else if(gait==='horseGallop'||gait==='canter'){
   const gallop=gait==='horseGallop';
   body.position.y=(gallop?.11:.055)*Math.max(0,Math.sin(phase*2))*Math.min(1.15,effort)/Math.max(.0001,rig.root.scale.y);
   body.rotation.x=(gallop?.048:.038)*cos*effort;
   for(const leg of legs){
    const front=leg.front>0,side=leg.side||1;
    const offset=front?(side===1?1.82:2.35):(side===1?.36:0);
    const step=Math.sin(phase+offset);
    leg.hip.rotation.x=(gallop?.66:.57)*step*effort;
    leg.knee.rotation.x=Math.max(0,-step)*(.66+.12*(gallop?1:0))*effort;
   }
   if(tail){tail.rotation.y=.14*Math.sin(phase*.7)*effort;tail.rotation.x=.035*cos*effort}
  }else if(gait==='heavyTrot'){
   // Mammoths/elephants and other massive animals stay grounded, with deliberate weight transfer.
   body.position.y=.012*Math.abs(Math.sin(phase*2))*Math.min(1,effort);
   body.rotation.z=.031*Math.sin(phase)*Math.min(1,effort);
   body.rotation.x=.015*cos*effort;
   for(const leg of legs){
    const right=leg.side===1,front=leg.front>0;
    const diag=(right!==front)?Math.PI:0;
    const wave=Math.sin(phase+diag);
    leg.hip.rotation.x=.37*wave*effort;
    leg.knee.rotation.x=.42*Math.max(0,-wave)*effort;
   }
   if(tail)tail.rotation.y=.07*s*effort;
  }else if(gait==='giantBiped'||gait==='giantQuad'){
   const quad=gait==='giantQuad',load=Math.min(1,effort);
   body.position.y=.016*Math.abs(cos)*load;
   body.rotation.z=(quad?.02:.035)*s*load;
   body.rotation.x=.015*cos*load;
   for(const [i,leg] of legs.entries()){
    const w=Math.sin(phase+(quad?(leg.front>0?Math.PI:0)+(leg.side>0?Math.PI:0):i*Math.PI));
    leg.hip.rotation.x=w*(quad?.27:.39)*load;
    leg.knee.rotation.x=Math.max(0,-w)*(quad?.27:.39)*load;
   }
   for(const [i,arm] of arms.entries())if(arm.sh)arm.sh.rotation.x=-.17*Math.sin(phase+i*Math.PI)*load;
   if(tail){tail.rotation.y=.075*Math.sin(phase*.5)*load;tail.rotation.x=.035*cos*load}
  }else if(gait==='knuckleRun'){
   // Gorillas travel with bent knees and long weight-bearing forearms.
   body.position.y=.012*Math.abs(s)*effort;
   body.rotation.x=-.24*Math.min(1,effort);
   body.rotation.z=.045*s*effort;
   for(const [i,leg] of legs.entries()){
    const w=Math.sin(phase+i*Math.PI);
    leg.hip.rotation.x=w*.46*effort;
    leg.knee.rotation.x=Math.max(0,-w)*.55*effort;
   }
   for(const [i,arm] of arms.entries()){
    const w=Math.sin(phase+i*Math.PI);
    if(arm.sh)arm.sh.rotation.x=(.28+w*.58)*effort;
   }
  }else if(biped){
   const heavy=gait==='heavyBiped'||gait==='mechanicalRun';
   const stride=heavy?.40:.66;
   body.position.y=(gait==='springRun'?.24*lift*effort:(heavy?.013:.035)*Math.abs(Math.cos(phase))*effort)/Math.max(.0001,rig.root.scale.y);
   body.rotation.x=(gait==='springRun'?.10:.040)*cos*effort;
   body.rotation.z=.035*s*effort;
   for(const [i,leg] of legs.entries()){
    const w=Math.sin(phase+i*Math.PI);
    leg.hip.rotation.x=w*stride*effort;
    leg.knee.rotation.x=Math.max(0,-w)*(heavy?.49:.73)*effort;
   }
   for(const [i,arm] of arms.entries())if(arm.sh)arm.sh.rotation.x=-.46*Math.sin(phase+i*Math.PI)*effort;
   if(tail){tail.rotation.y=.13*s*effort;tail.rotation.x=-.045*cos*effort}
  }
  speciesMotion(kind,rig,phase,effort);
  // Stabilize articulated hooves for equids and other four-legged ungulates. Static
  // normalization alone cannot compensate for the articulated knee/hip swing.
  // Sample only the four hoof assemblies, not tails, manes or other ornaments.
  // Throttle the expensive bounds sampling on low-end Android GPUs.
  if(['horse','zebra','unicorn','gazelle','pronghorn','deer'].includes(kind)&&legs.length>=4&&rig.root.visible){
   const contact=rig.userDataHoofContact||(rig.userDataHoofContact={lastPhase:-999,offset:0});
   if(phase-contact.lastPhase>.18||phase<contact.lastPhase){
    contact.lastPhase=phase;
    // The gait pose is reset at the start of every frame. Sample before
    // adding the correction to avoid feedback from the previous contact.
    rig.root.updateMatrixWorld(true);
    let minSole=Infinity;
    for(const leg of legs){
     const hoof=leg.knee||leg.hip;
     if(!hoof)continue;
     const b=new T.Box3().setFromObject(hoof);
     if(Number.isFinite(b.min.y))minSole=Math.min(minSole,b.min.y);
    }
    if(Number.isFinite(minSole)){
     // World-space correction, limited to prevent snapping and ground penetration.
     const desired=clamp((rig.root.position.y-minSole)/Math.max(.001,rig.root.getWorldScale(new T.Vector3()).y),-.14,.14);
     contact.offset=clamp(contact.offset*.45+desired*.55,-.14,.14);
    }
   }
   body.position.y+=contact.offset;
  }
  // A landing event is generated from foot/ground contact, not from arbitrary distance.
  const beats=isKangaroo||isBound||isPronk?1:gait==='heavyTrot'||gait==='giantBiped'?2:gait==='giantQuad'?4:biped?2:4;
  const shift=isKangaroo?0:isBound||isPronk?Math.PI:0;
  const impactIndex=Math.floor((phase+shift)*beats/(Math.PI*2));
  if(lastImpact===null){lastImpact=impactIndex;return false}
  const landed=impactIndex>lastImpact;lastImpact=impactIndex;
  if(isKangaroo)return landed&&body.position.y<.04;
  if(isBound||isPronk)return landed;
  return gait==='wingFlight'&&rig.flight>.35?false:landed;
 };
 return rig;
}

// 3D player and opponent are rebuilt on customization / opponent changes.
let human=makeHuman(save.avatar);human.root.position.set(humanX,.13,0);scene.add(human.root);
let opponent=makeExtendedBeast(animals[clamp(save.chosen,0,animals.length-1)]);opponent.root.position.set(animalX,.13,0);scene.add(opponent.root);
const sharedMaterials=new Set(Object.values(m));
function disposeModel(root){
 root.traverse(o=>{if(!o.isMesh)return;if(o.geometry?.dispose&&!sharedModelGeometries.has(o.geometry))o.geometry.dispose();
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
function refreshOpponent(){const old=opponent.root;scene.remove(old);disposeModel(old);opponent=makeExtendedBeast(animals[save.chosen]);opponent.root.position.set(animalX,.13,0);scene.add(opponent.root);refreshMenu()}
// Subtle footstep puffs, with pooled 3D meshes.
const dust=[],dustMat=new T.MeshBasicMaterial({color:0xcdb8a3,transparent:true,opacity:.22,depthWrite:false});for(let i=0;i<38;i++){const p=new T.Mesh(sphereGeometry(8),dustMat.clone());p.visible=false;scene.add(p);dust.push({mesh:p,life:0,max:1})}let dustCursor=0;
 // Race scuffs are faint track-level motion marks; unlike neon speed lines they remain grounded.
 const scuffs=[],scuffGeo=new T.PlaneGeometry(.07,.48);
 for(let i=0;i<18;i++){
  const mesh=new T.Mesh(scuffGeo,new T.MeshBasicMaterial({color:0xe3d5c1,transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide}));
  mesh.rotation.x=-Math.PI/2;mesh.visible=false;scene.add(mesh);scuffs.push({mesh,life:0,max:.30});
 }
 let scuffCursor=0;
 function markFootfall(x,z,speed,side){
  if(speed<2)return;
  const puff=scuffs[scuffCursor++%scuffs.length];
  puff.life=puff.max=.19+Math.random()*.11;
  puff.mesh.visible=true;
  puff.mesh.position.set(x+(side==='L'?.19:-.19),.166,z-.40);
  puff.mesh.scale.set(.72+Math.random()*.3,.6+Math.min(.9,speed/15),1);
  puff.mesh.material.opacity=.13;
 }
function kickDust(x,z,speed){if(speed<2)return;const p=dust[dustCursor++%dust.length];p.life=.4+Math.random()*.2;p.max=p.life;p.mesh.visible=true;p.mesh.position.set(x+Math.random()*.4-.2,.13,z-0.5);p.mesh.scale.set(.2,.09,.33);p.mesh.material.opacity=.23}
const clock=new T.Clock();let mode='menu',race=null,camSpin=0,cameraTarget=new T.Vector3(0,1.5,3),camPos=new T.Vector3(-5.8,3.1,9.2),sceneTime=0,sfx=true,lastHUD=0,raceName='';
let ceremonyStage=null;
const initResize=()=>{
 const w=window.innerWidth,h=window.innerHeight;camera.aspect=w/h;camera.fov=w<h?59:52;camera.updateProjectionMatrix();
 if(ceremonyStage){
  const slot=$('result3DWindow'),cw=Math.max(300,slot.clientWidth||340),ch=Math.max(169,slot.clientHeight||192);
  ceremonyStage.camera.aspect=cw/ch;ceremonyStage.camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(1.4,devicePixelRatio||1));renderer.setSize(cw,ch,false);
 }else renderer.setSize(w,h,false);
};addEventListener('resize',initResize);initResize();

let audioCtx,noiseBuffer,ambient=null,lastRivalImpact=-1;
function audioSystem(){
 if(!sfx)return null;
 try{
  audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();
  if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});
  if(!noiseBuffer){
   const rate=audioCtx.sampleRate;
   noiseBuffer=audioCtx.createBuffer(1,Math.max(1,rate*2),rate);
   const samples=noiseBuffer.getChannelData(0);let seed=615031;
   for(let i=0;i<samples.length;i++){
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    samples[i]=(seed/2147483648-1)*.82;
   }
  }
  return audioCtx;
 }catch(err){return null}
}
function soundTone(frequency,length=.12,type='sine',volume=.04,delay=0,toFreq=0){
 const ctx=audioSystem();if(!ctx)return;
 const start=ctx.currentTime+delay,osc=ctx.createOscillator(),gain=ctx.createGain();
 osc.type=type;osc.frequency.setValueAtTime(Math.max(20,frequency),start);
 if(toFreq>0)osc.frequency.exponentialRampToValueAtTime(Math.max(20,toFreq),start+length);
 gain.gain.setValueAtTime(.0001,start);
 gain.gain.exponentialRampToValueAtTime(Math.max(.0003,volume),start+.008);
 gain.gain.exponentialRampToValueAtTime(.0001,start+length);
 osc.connect(gain);gain.connect(ctx.destination);osc.start(start);osc.stop(start+length+.025);
}
function soundNoise(duration=.13,volume=.07,low=140,high=1600,delay=0,pan=0){
 const ctx=audioSystem();if(!ctx)return;
 const start=ctx.currentTime+delay;
 const source=ctx.createBufferSource();source.buffer=noiseBuffer;source.loop=false;
 const hp=ctx.createBiquadFilter();hp.type='highpass';hp.frequency.value=Math.max(20,low);
 const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=Math.max(low+20,high);
 const gain=ctx.createGain();
 gain.gain.setValueAtTime(.0001,start);
 gain.gain.exponentialRampToValueAtTime(Math.max(.0003,volume),start+.012);
 gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
 source.connect(hp);hp.connect(lp);lp.connect(gain);
 if(typeof ctx.createStereoPanner==='function'){
  const stereo=ctx.createStereoPanner();stereo.pan.value=clamp(pan,-1,1);
  gain.connect(stereo);stereo.connect(ctx.destination);
 }else gain.connect(ctx.destination);
 source.start(start,Math.random()*1.2,duration+.018);
 source.stop(start+duration+.020);
}
function beep(freq=450,dur=.1,type='sine',gain=.04){
 soundTone(freq,dur,type,Math.min(.065,gain*.68));
}
function footstep(speed=5,side='L'){
 if(!sfx)return;
 const power=clamp(speed/15,.22,1),pan=side==='L'?-0.18:.18;
 soundNoise(.09,.047+.025*power,155,1200,0,pan);
 soundTone(112+power*31,.105,'sine',.033+.018*power,0,51+power*15);
}
function animalFootstep(kind,speed){
 if(!sfx)return;
 const giant=['boar','elephant','mammoth','rhino','woollyrhino','hippo','trex','spinosaurus','triceratops','dragon','golem','giantrobot','kaiju','spinetitan','velka','dorogan'].includes(kind);
 const heavy=['lion','tiger','gorilla','horse','carnotaurus','cavebear','minotaur'].includes(kind);
 const power=clamp(speed/24,.34,1);
 const vol=giant?.14:heavy?.085:.055;
 soundNoise(giant?.24:heavy?.16:.105,vol*(.60+.4*power),giant?45:110,giant?620:1300,0,.18);
 soundTone(giant?48:heavy?68:104,giant?.28:.13,'sine',giant?.082:heavy?.052:.032,0,giant?32:heavy?44:70);
 if(giant&&navigator.vibrate&&mode==='race'&&race?.enemyD-race?.humanD<15)navigator.vibrate(6);
}

/* Recorded wildlife calls; Wikimedia Commons source files are credited in the game.
   Fictional and extinct creatures continue to use original synthesized voices. */
const recordedVoices={
 boar:{file:'Boar.Grwls(1).ogg',begin:.15,length:2.4},
 cat:{file:'Meow.ogg',begin:0,length:.9},
 dog:{file:'Dog.ogg',begin:1.0,length:2.2},
 greyhound:{file:'Dog.ogg',begin:1.0,length:2.2},
 lion:{file:'Lion_raring-sound1TamilNadu178.ogg',begin:0,length:2.5},
 tiger:{file:'Lion_raring-sound1TamilNadu178.ogg',begin:0,length:2.5},
 wolf:{file:'Wolf_howls.ogg',begin:.3,length:2.8},
 horse:{file:'Wiehern.ogg',begin:0,length:2.3},
 zebra:{file:'Wiehern.ogg',begin:0,length:2.3},
 unicorn:{file:'Wiehern.ogg',begin:0,length:2.3},
 pegasus:{file:'Wiehern.ogg',begin:0,length:2.3},
 elephant:{file:'Elephant_voice_-_trumpeting.ogg',begin:0,length:1.4},
 mammoth:{file:'Elephant_voice_-_trumpeting.ogg',begin:0,length:1.4}
};
const loadedCalls={};
function prefetchVoice(kind){
 const entry=recordedVoices[kind];
 if(!entry||loadedCalls[entry.file])return;
 const url='https://commons.wikimedia.org/wiki/Special:Redirect/file/'+encodeURIComponent(entry.file);
 try{
  const media=new Audio(url);
  media.preload='auto';media.volume=.12;
  loadedCalls[entry.file]=media;
  media.addEventListener('canplay',()=>{
   // Asynchronously loaded animal audio should still be heard even on a slow connection.
   const current=animals[save.chosen]?.kind;
   if(sfx&&mode==='race'&&race?.phase==='running'&&race.time<2.5&&
      recordedVoices[current]?.file===entry.file&&!race.voiceLatePlayed){
    race.voiceLatePlayed=true;playRecordedVoice(current);
   }
  },{once:true});
  media.load();
 }catch(err){console.warn('Voice preload',err)}
}
let voiceStopTimer=null;
function playRecordedVoice(kind){
 const data=recordedVoices[kind];if(!data)return false;
 prefetchVoice(kind);
 const player=loadedCalls[data.file];
 if(!player||player.readyState<2)return false;
 try{
  if(voiceStopTimer){clearTimeout(voiceStopTimer);voiceStopTimer=null}
  player.pause();player.currentTime=Math.min(data.begin,Math.max(0,(player.duration||9)-1));
  player.volume=.14;
  const promise=player.play();if(promise?.catch)promise.catch(e=>{console.warn('Animal recording playback',e);synthesizeCreatureCall(kind)});
  voiceStopTimer=setTimeout(()=>{player.pause();voiceStopTimer=null},data.length*1000);
  return true;
 }catch(err){console.warn('Recorded voice',err);return false}
}

function animalCall(kind){
 if(!sfx)return;
 if(playRecordedVoice(kind))return;
 synthesizeCreatureCall(kind);
}
function synthesizeCreatureCall(kind){
 if(!sfx)return;
 const quietTone=(frequency,length,type,volume,delay=0,toFreq=0)=>soundTone(frequency,length,type,Math.min(.018,volume*.22),delay,toFreq);
 const quietNoise=(duration,volume,low,high,delay=0,pan=0)=>soundNoise(duration,Math.min(.019,volume*.22),low,high,delay,pan);
 const bird=['ostrich','dodo','moa','terrorbird','griffin'].includes(kind);
 const roar=['lion','tiger','dragon','trex','spinosaurus','kaiju','smilodon','cavebear','gorilla'].includes(kind);
 const giant=['mammoth','elephant','rhino','hippo','triceratops','golem','giantrobot'].includes(kind);
 if(kind==='boar'){
  quietNoise(.26,.083,55,680);
  quietTone(128,.24,'sawtooth',.033,0,80);
  quietTone(82,.20,'triangle',.030,.065,52);
 }else if(bird){
  quietTone(520,.18,'triangle',.045,0,350);
  quietTone(635,.25,'sine',.038,.065,420);
 }else if(roar){
  quietNoise(.42,.080,85,630);
  quietTone(102,.45,'sawtooth',.033,0,67);
  quietTone(151,.32,'triangle',.027,.09,92);
 }else if(giant){
  quietNoise(.35,.061,42,440);
  quietTone(77,.46,'sawtooth',.032,0,47);
 }else{
  quietNoise(.19,.041,165,1100);
  quietTone(195,.23,'triangle',.023,0,124);
 }
}
function effect(name){
 if(!sfx)return;
 if(name==='start'){
  // Clean, original 3-2-1-GO cue: three short countdown pips resolve into one long higher chime.
  soundTone(1046.5,.68,'triangle',.080,0,1318.5);
  soundTone(1568,.57,'sine',.028,.035,1568);
 }else if(name==='burst'){
  soundNoise(.83,.078,420,5500);
  soundTone(170,.61,'sawtooth',.052,0,410);
  soundTone(95,.42,'sine',.058,0,56);
  navigator.vibrate?.([22,15,34]);
 }else if(name==='victory'){
  [392,493.88,587.33,783.99].forEach((f,i)=>soundTone(f,.25+(i===3?.26:0),'triangle',.041,i*.13));
  soundNoise(.48,.028,1700,6800,.20);
 }else if(name==='defeat'){
  soundTone(294,.32,'triangle',.041,0,234);
  soundTone(196,.47,'sine',.041,.19,144);
 }else if(name==='count'){
  soundTone(740,.115,'triangle',.072,0,740);
  soundTone(1110,.100,'sine',.017,0,1110);
 }else if(name==='ready'){
  soundTone(740,.10,'triangle',.026,0,950);
 }else if(name==='jump'){
  soundNoise(.16,.045,390,2200);
  soundTone(300,.20,'sine',.038,0,480);
 }else if(name==='bump'){
  soundNoise(.20,.11,75,1050);
  soundTone(88,.23,'sine',.068,0,45);
 }
}
function startAmbience(){
 if(!sfx||ambient)return;const ctx=audioSystem();if(!ctx)return;
 const src=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();
 src.buffer=noiseBuffer;src.loop=true;filter.type='bandpass';filter.frequency.value=570;filter.Q.value=.38;
 gain.gain.setValueAtTime(.0001,ctx.currentTime);
 gain.gain.linearRampToValueAtTime(.005,ctx.currentTime+.6);
 src.connect(filter);filter.connect(gain);gain.connect(ctx.destination);src.start();
 ambient={src,gain}; 
}
function stopAmbience(){
 if(!ambient)return;
 const {src,gain}=ambient;ambient=null;
 try{const ctx=audioCtx;gain.gain.cancelScheduledValues(ctx.currentTime);gain.gain.setTargetAtTime(.0001,ctx.currentTime,.10);src.stop(ctx.currentTime+.42)}catch(e){}
}
function showScreen(mo){if(mo!=='race'){if(ceremonyStage)endCeremonyStage();stopAmbience();if(voiceStopTimer){clearTimeout(voiceStopTimer);voiceStopTimer=null}for(const player of Object.values(loadedCalls))if(!player.paused)player.pause()}mode=mo;document.body.classList.remove('menu-mode','race-mode','custom-mode','train-mode','beasts-mode');document.body.classList.add(mo+'-mode');['menu','custom','train','beasts'].forEach(x=>$(x+'Screen').classList.toggle('active',x===mo));$('bottomNav').classList.toggle('gone',mo==='race');document.querySelectorAll('[data-screen]').forEach(b=>b.classList.toggle('active',b.dataset.screen===mo));$('raceHUD').style.display=mo==='race'?'flex':'none';$('raceControls').style.display=mo==='race'?'block':'none';$('resultOverlay').style.display='none';if(mo!=='race'){$('countdown').style.display='none';human.root.position.z=0;opponent.root.position.z=0;human.root.position.x=humanX;opponent.root.position.x=animalX;human.root.rotation.y=0;opponent.root.rotation.y=0;$('raceMsg').style.display='none';$('raceBanner').textContent='';}else {$('raceBanner').textContent='100m走'}if(mo==='train')renderTraining();if(mo==='custom'){$('customScreen').classList.remove('previewOnly');studioShowFull=false;camSpin=0;renderCustom();}if(mo==='beasts')renderBeasts();refreshMenu()}
const cost=(id)=>{const level=save.stats[id]||1;return Math.round(40+12*(level-1)+2.6*Math.pow(level-1,2))};
const unlocked=(i)=>!!animals[i]&&(animals[i].group==='怪獣'||i===0||i<=save.unlockedStage||save.won.includes(animals[i-1].id));
// Opponent-specific race briefing uses the same pace profiles as the physics.
// Show the actual personal best for this opponent, not the global best.
function rivalRaceBrief(a){
 const gait=GAIT_MAP[a.kind]||'canter';
 if(a.kind==='pegasus'||gait==='wingFlight')return '空中の相手は接触で止められません。交互タップと終盤スパートを重視';
 if(a.profile==='heavy'||gait==='giantQuad'||gait==='heavyTrot')return '重量級は出足が遅く終盤に伸びます。序盤にリードを確保';
 if(a.profile==='sprinter'||gait==='flexGallop')return '序盤から加速する短距離型。左右交互で素早く最高速へ';
 if(a.profile==='hopper'||gait==='kangarooHop'||gait==='bound')return '跳躍のリズムで速度が変化。接触のタイミングに注意';
 if(a.profile==='late')return '後半加速型。前半のリードとスパート温存が重要';
 if(gait==='birdRun'||gait==='giantBiped')return '二足走行で安定したペース。交互タップで走路を維持';
 return '交互タップで加速、左連打で接近、右連打はコース外に注意';
}
function refreshMenu(){let x=animals[save.chosen]||animals[0];if(mode!=='race')prefetchVoice(x.kind);$('bestDisplay').textContent=save.best==null?'--':save.best.toFixed(2)+'秒';$('winDisplay').textContent=save.won.length+' / '+animals.length;$('raceCount').textContent=save.races||0;$('coinDisplay').textContent=Math.floor(save.money).toLocaleString();$('nextName').textContent=x.name;$('nextSub').textContent=x.group+' / '+(GAIT_LABELS[GAIT_MAP[x.kind]]||'走行')+' / '+x.sub;$('nextSpeed').textContent='ゲーム内 '+x.kph+' km/h';$('nextBar').style.width=Math.min(100,x.kph/230*100).toFixed(1)+'%';const win=save.won.includes(x.id);const pb=Number(save.bestByBeast?.[x.id]);const pbText=Number.isFinite(pb)&&pb>0?' / 対戦自己ベスト '+pb.toFixed(2)+'秒':'';$('nextDescription').textContent='第'+(save.chosen+1)+' / '+animals.length+'戦 ・ '+(win?'勝利済み':'勝つと次を解放')+pbText+'。攻略: '+rivalRaceBrief(x);$('startBtn').textContent='▶ '+x.name+'と100m走'}
function renderTraining(){const el=$('trainList');el.innerHTML='';const cards=training.map(item=>{const level=save.stats[item.id]||1,need=cost(item.id),max=level>=50;return `<div class="trainitem"><header><div><div class="label">${item.name}</div><h3>${item.name} <span class="mini">Lv.${level}</span></h3></div><button data-train="${item.id}" ${max||save.money<need?'disabled':''}>${max?'MAX':need+' G'}</button></header><p>${item.desc} ・ ${item.gain}</p><div class="trainLine"><i style="width:${Math.min(100,level*2)}%"></i></div></div>`}).join('');el.innerHTML=cards;el.querySelectorAll('[data-train]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.train,n=cost(id);if(save.money<n||save.stats[id]>=50)return;save.money-=n;save.stats[id]++;store();beep(670,.09,'triangle',.055);renderTraining();refreshMenu()}))}
function renderBeasts(){
 const el=$('animalList'),filter=$('beastTypeFilter')?.value||'all';
 const text=($('beastSearch')?.value||'').trim().toLowerCase();
 const filtered=animals.map((a,i)=>({a,i})).filter(({a})=>(filter==='all'||a.group===filter)&&(!text||a.name.toLowerCase().includes(text)));
 el.innerHTML=filtered.map(({a,i})=>{
  const available=unlocked(i),won=save.won.includes(a.id),pb=save.bestByBeast?.[a.id];
  return `<div class="animalitem ${i===save.chosen?'selected':''} ${available?'':'locked'}">
   <header><div><div class="label">第${i+1}/${animals.length}戦 <span class="kind">${a.group}</span></div>
   <h3>${a.name} ${won?'<span class="mini">勝利済</span>':''}</h3></div>
   <button data-beast="${i}" ${available?'':'disabled'}>${i===save.chosen?'選択中':available?'挑戦する':'未解放'}</button></header>
   <p>${a.sub} / モデル全高目安 ${SPECIES_HEIGHT_M[a.kind]}m${KAIJU_SPECS[a.kind]?' / 歩幅 '+KAIJU_SPECS[a.kind].strideM+'m':''} / ${GAIT_LABELS[GAIT_MAP[a.kind]]||'走行'} / ゲーム内最高速度 ${a.kph} km/h${Number.isFinite(pb)?' / 自己記録 '+pb.toFixed(2)+'秒':''}${available?'':' / 前の対戦に勝利すると解放'}</p>
   </div>`}).join('');
 if(!filtered.length)el.textContent='該当する対戦相手はありません。';
 el.querySelectorAll('[data-beast]').forEach(b=>b.addEventListener('click',()=>{const i=Number(b.dataset.beast);if(!unlocked(i))return;save.chosen=i;store();refreshOpponent();renderBeasts();beep(540,.1)}));
}

const studioFaceTabs=new Set(['face','brows','eyes','nose','mouth','hair']);
let customTab='face',studioShowFull=false;
function syncStudioZoomButton(){
 const focused=studioFaceTabs.has(customTab),full=studioShowFull||!focused;
 const button=$('previewAvatar');
 button.textContent=focused?(full?'部位を拡大':'全身を見る'):'全身表示中';
 button.disabled=!focused;
 const label=$('studioFocusLabel');
 if(label)label.textContent=full?'全身プレビュー':(avatarGroups.find(g=>g.id===customTab)?.label||'顔')+'・アップ';
}
function renderCustom(){
 const el=$('customList'),tabs=$('avatarTabs');
 el.replaceChildren();tabs.replaceChildren();
 for(const group of avatarGroups){
  const b=document.createElement('button');b.type='button';b.textContent=group.label;b.classList.toggle('active',customTab===group.id);
  b.setAttribute('role','tab');b.setAttribute('aria-selected',customTab===group.id?'true':'false');
  b.addEventListener('click',()=>{if(customTab===group.id)return;customTab=group.id;studioShowFull=false;renderCustom();el.scrollTop=0;});
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
 syncStudioZoomButton();
}
$('previewAvatar')?.addEventListener('click',()=>{if(!studioFaceTabs.has(customTab))return;studioShowFull=!studioShowFull;syncStudioZoomButton();});
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
function startRace(){if(mode==='race')return;opponent.root.visible=true;opponent.root.position.y=.13;stopAmbience();prefetchVoice(animals[save.chosen].kind);audioSystem();raceName=animals[save.chosen].name;humanGait=0;beastGait=0;race={opponentIndex:save.chosen,time:0,phase:'countdown',count:3.3,lastCount:4,humanD:0,enemyD:0,humanV:0,enemyV:0,combo:0,lastFoot:'',lastTap:-999,lastRatingAt:-999,drive:0,taps:0,legTaps:{L:-999,R:-999},lastAlternate:-999,sideStreak:0,lateral:humanX,lateralTarget:humanX,lateralVelocity:0,enemyLateral:animalX,offTrack:false,bumpCooldown:0,enemyStumble:0,stamina:1,burstCharge:0,burstLeft:0,burstUsed:false,hFinish:null,eFinish:null,lastStep:-1,lastRivalStep:-1,lastRivalImpact:-1,lastRivalCall:-99,rivalStridePhase:0};showScreen('race');race.time=0;$('countdown').textContent='3';$('countdown').style.display='flex';$('raceBanner').textContent='第'+(save.chosen+1)+'戦 / '+raceName;$('enemyLabel').textContent='対戦相手 / '+raceName;$('burstBtn').disabled=true;$('burstBtn').classList.remove('ready');updateHud(true);}
function tap(side,overlapping=false){
 if(!race||race.phase!=='running'||race.hFinish!==null)return;
 const r=race,now=r.time,elapsed=now-r.lastTap;
 const hadFoot=!!r.lastFoot;
 // Alternation is always valid, even for very fast taps. Timing only adjusts a bonus.
 const alternate=hadFoot&&side!==r.lastFoot&&!overlapping;
 const fresh=!hadFoot||elapsed>1.15;
 r.taps++;r.legTaps[side]=now;
 r.sideStreak=alternate?0:Math.min(12,(r.sideStreak||0)+1);
 const direction=side==='L'?1:-1;
 const sideways=alternate?.072:.32+Math.min(.34,r.sideStreak*.052);
 // Same-side mashing steers strongly. Alternating feet gently straighten the
 // runner toward their own lane, so a single mistake does not strand them off
 // track for the remainder of the race.
 if(alternate){
  const laneCenter=humanX;
  const recovery=clamp(.095+Math.abs(r.lateralTarget-laneCenter)*.085,.095,.40);
  const centered=r.lateralTarget+(laneCenter-r.lateralTarget)*recovery;
  r.lateralTarget=clamp(centered+direction*.026,-6.25,3.10);
 }else{
  r.lateralTarget=clamp(r.lateralTarget+direction*sideways,-6.25,3.10);
 }
 if(alternate){
  r.combo=fresh?1:Math.min(99,r.combo+1);
  const tempoBonus=clamp((.55-elapsed)/.55,0,1);
  r.drive=clamp(r.drive+.095+save.stats.technique*.003+tempoBonus*.022,0,1.3);
  r.burstCharge=clamp(r.burstCharge+5.4+Math.min(3.5,r.combo*.26)+tempoBonus*1.0+save.stats.technique*.12,0,100);
  r.lastAlternate=now;
 }else if(overlapping){
  // Overlapping fingers are suboptimal, but never invalidate otherwise rapid tapping.
  r.combo=0;r.drive=clamp(r.drive*.965+.006,0,1.1);r.humanV*=.985;
  r.burstCharge=clamp(r.burstCharge+.45,0,100);
 }else if(fresh){
  r.combo=0;r.drive=clamp(r.drive+.070,0,1.1);
  r.burstCharge=clamp(r.burstCharge+1.8,0,100);
 }else{
  // Single-side mashing still runs, but is capped below alternating strides.
  r.combo=0;
  r.drive=clamp(r.drive*.997+.088/(1+.11*r.sideStreak),0,.84);
  r.humanV*=.988; // Small but noticeable stumble; rapid tapping still works.
  r.burstCharge=clamp(r.burstCharge+1.25,0,100);
 }
 r.lastFoot=side;r.lastTap=now;
 if(!overlapping)showTapRating(r,side,alternate&&elapsed<=.45?'JUST!':'GOOD!');
 footstep(Math.max(2.5,r.humanV),side);
 if(r.humanV>2){kickDust(r.lateral+(side==='L'?.18:-.18),r.humanD,r.humanV);markFootfall(r.lateral,r.humanD,r.humanV,side)}
 const btn=$(side==='L'?'leftTap':'rightTap');btn.classList.add('hit');
 setTimeout(()=>btn.classList.remove('hit'),75);
 if(r.combo>0&&r.combo%12===0)effect('ready');
 if(navigator.vibrate&&r.combo>0&&r.combo%4===0)navigator.vibrate(9);
}
// Brief feedback follows the runner's projected feet, not the HUD or touch buttons.
function showTapRating(r,side,label){
 const layer=$('footFeedback');
 if(!layer||r.time-(r.lastRatingAt??-999)<.105)return;
 r.lastRatingAt=r.time;
 const target=new T.Vector3(r.lateral+(side==='L'?-0.16:.16),.17,r.humanD+.06);
 camera.updateMatrixWorld();
 target.project(camera);
 const controlY=$('raceControls').getBoundingClientRect().top;
 const rawX=(target.x+1)*.5*innerWidth;
 const rawY=(1-target.y)*.5*innerHeight;
 const hop=(r.taps%5)-2;
 const x=clamp(rawX+hop*16+(side==='L'?-13:13),innerWidth*.12,innerWidth*.88);
 const y=clamp(rawY-24+(r.taps%3-1)*19,innerHeight*.36,Math.max(innerHeight*.37,Math.min(innerHeight*.78,controlY-34)));
 const mark=document.createElement('span');
 mark.className='stepRating '+(label==='JUST!'?'just':'good');
 mark.textContent=label;mark.style.left=x+'px';mark.style.top=y+'px';
 mark.style.setProperty('--twist',(-18+(r.taps%4)*7)+'deg');
 layer.append(mark);
 while(layer.childElementCount>4)layer.firstElementChild.remove();
 setTimeout(()=>mark.remove(),620);
}
function activateBurst(){if(!race||race.phase!=='running'||race.burstCharge<99||race.burstLeft>0||race.hFinish!==null)return;race.burstCharge=0;race.burstLeft=2.8;race.burstUsed=true;effect('burst');showNotice('スパート中',1.2);$('burstBtn').disabled=true;$('burstBtn').classList.remove('ready')}
function showNotice(s,seconds){$('raceMsg').textContent=s;$('raceMsg').style.display='block';noticeTime=seconds}let noticeTime=0;

let racePicture=null,resultText='',lastResultWon=false;
let raceShareBlob=null,raceShareCanvas=null,manualXSharePrepared=false;
function cacheRaceSharePhoto(canvas){
 raceShareCanvas=canvas;raceShareBlob=null;manualXSharePrepared=false;
 const button=$('shareRace');if(button)button.textContent='写真と結果をXで共有';
 if(!canvas||typeof canvas.toBlob!=='function')return;
 try{
  canvas.toBlob(blob=>{
   // Encode before the tap: awaiting toBlob can expire Android share activation.
   if(racePicture===canvas&&raceShareCanvas===canvas&&blob&&blob.size>=2048&&blob.type.startsWith('image/'))
    raceShareBlob=blob;
  },'image/png');
 }catch(err){console.warn('Podium photo share cache unavailable',err)}
}
let podiumPreviewURL=null,podiumPreviewToken=0;
// Display the validated real-3D framebuffer directly when Android cannot decode
// a data URL or Blob URL. This is a canvas copy of the actual 3D photograph,
// never a synthetic 2D illustration, and does not require GPU work to remain visible.
function showCapturedPodiumCanvas(source){
 const view=$('result3DWindow');
 if(!view||!source||!source.width||!source.height)return false;
 let snapshot=view.querySelector('canvas[data-podium-snapshot]');
 if(!snapshot){
  snapshot=document.createElement('canvas');
  snapshot.dataset.podiumSnapshot='1';
  snapshot.setAttribute('aria-label','3D表彰台の撮影画像');
  snapshot.style.cssText='position:absolute;inset:0;width:100%;height:100%;object-fit:contain;z-index:2;pointer-events:none';
  view.appendChild(snapshot);
 }
 if(snapshot.width!==source.width)snapshot.width=source.width;
 if(snapshot.height!==source.height)snapshot.height=source.height;
 const ctx=snapshot.getContext('2d',{alpha:false});
 if(!ctx)return false;
 ctx.drawImage(source,0,0);
 snapshot.hidden=false;
 $('resultPhoto').hidden=true;
 view.hidden=false;
 return true;
}
function clearCapturedPodiumCanvas(){
 const view=$('result3DWindow');
 view?.querySelector('canvas[data-podium-snapshot]')?.remove();
}
function releasePodiumPreview(){
 podiumPreviewToken++;
 clearCapturedPodiumCanvas();
 if(podiumPreviewURL){URL.revokeObjectURL(podiumPreviewURL);podiumPreviewURL=null}
 $('resultPhoto').removeAttribute('src');
}
// Android WebView may support asynchronous canvas encoding but reject toDataURL.
// Keep the live 3D stage visible until an actual encoded photo is ready.
async function showAsyncPodiumPreview(canvas){
 const token=++podiumPreviewToken;
 if(typeof canvas.toBlob!=='function')return false;
 let blob=null;
 for(const format of ['image/jpeg','image/png']){
  try{
   blob=await new Promise(resolve=>{
    let settled=false;
    const done=b=>{if(settled)return;settled=true;clearTimeout(timer);resolve(b)};
    const timer=setTimeout(()=>done(null),1600);
    try{canvas.toBlob(done,format,format==='image/jpeg'?.88:undefined)}catch(e){done(null)}
   });
  }catch(e){blob=null}
  if(blob&&blob.size>2048&&blob.type.startsWith('image/'))break;
  blob=null;
 }
 if(token!==podiumPreviewToken||!ceremonyStage||racePicture!==canvas||!blob)return false;
 const url=URL.createObjectURL(blob);
 const image=$('resultPhoto');
 try{
  // Decode into a detached image first. A timed-out DOM image must not
  // retain event handlers that can fire during a later race's photo preview.
  await new Promise((resolve,reject)=>{
   const probe=new Image();
   let settled=false;
   const finish=(error)=>{
    if(settled)return;
    settled=true;clearTimeout(timeout);
    probe.onload=null;probe.onerror=null;
    if(error)reject(error);else resolve();
   };
   const timeout=setTimeout(()=>finish(Error('Podium preview image timed out')),1800);
   probe.onload=()=>finish(probe.naturalWidth&&probe.naturalHeight?null:Error('Empty podium preview'));
   probe.onerror=()=>finish(Error('Podium preview decode failed'));
   probe.src=url;
   if(probe.complete&&probe.naturalWidth&&probe.naturalHeight)finish(null);
  });
  if(token!==podiumPreviewToken||!ceremonyStage||racePicture!==canvas){
   URL.revokeObjectURL(url);return false;
  }
  // The visible image also needs its own successful decode. Keep the live 3D
  // and captured canvas visible until the actual DOM image is ready.
  await new Promise((resolve,reject)=>{
   let settled=false;
   const finish=(error)=>{
    if(settled)return;
    settled=true;clearTimeout(timeout);
    image.onload=null;image.onerror=null;
    if(error)reject(error);else resolve();
   };
   const timeout=setTimeout(()=>finish(Error('Visible podium image timed out')),1800);
   image.onload=()=>finish(image.naturalWidth&&image.naturalHeight?null:Error('Empty visible podium image'));
   image.onerror=()=>finish(Error('Visible podium image failed'));
   image.src=url;
   if(image.complete&&image.naturalWidth&&image.naturalHeight)finish(null);
  });
  if(token!==podiumPreviewToken||!ceremonyStage||racePicture!==canvas){URL.revokeObjectURL(url);return false}
  if(podiumPreviewURL)URL.revokeObjectURL(podiumPreviewURL);
  podiumPreviewURL=url;
  // Android WebView may decode an image successfully but paint a blank
  // composited layer after the WebGL canvas is hidden. Keep the verified
  // pixel snapshot on screen instead of switching to the decoded <img>.
  // Save/share still use the original 3D canvas (racePicture).
  if(mobile){
   image.hidden=true;
   $('result3DWindow').hidden=false;
   showCapturedPodiumCanvas(canvas);
  }else{
   image.hidden=false;$('result3DWindow').hidden=true;
   clearCapturedPodiumCanvas();
  }
  $('shareHelp').textContent='3D表彰台写真を保存・共有できます。';
  return true;
 }catch(e){URL.revokeObjectURL(url);if(token===podiumPreviewToken)image.removeAttribute('src');return false}
 finally{
  // An older asynchronous preview must not erase the callbacks of a newer
  // capture, otherwise Android can remain stuck on a blank result surface.
  if(token===podiumPreviewToken){image.onload=null;image.onerror=null}
 }
}

let podiumRetryFrame=0,podiumRetryAttempts=0;

function fitPodiumCamera(stage,aspect){
 if(!stage?.fitBounds||!stage.camera)return;
 const b=stage.fitBounds,cam=stage.camera;
 // Fit the ACTUAL 3D character bounds, not the decorative stadium. Validate
 // every bounding-box corner in camera space so portrait WebViews never crop
 // the runner, the animal, or a winner's medal.
 const a=Math.max(.35,Math.min(3.5,Number(aspect)||16/9));
 cam.aspect=a;
 const halfFov=cam.fov*Math.PI/360;
 const halfHeight=Math.max(1.16,(b.max.y-b.min.y)*.5*1.18);
 const halfWidth=Math.max(2.62,(b.max.x-b.min.x)*.5*1.16);
 const depth=(b.max.z-b.min.z)*.5;
 const distance=Math.max(4.75,halfHeight/Math.tan(halfFov),
  halfWidth/(Math.tan(halfFov)*a))+depth+.75;
 const x=(b.min.x+b.max.x)*.5,y=(b.min.y+b.max.y)*.5,z=(b.min.z+b.max.z)*.5;
 cam.position.set(x,y+Math.min(.65,distance*.035),z+distance);
 cam.lookAt(x,y,z);
 cam.updateProjectionMatrix();
 // Perspective camera bounds differ in portrait, and the subjects may extend
 // toward the camera. Iteratively increase distance until all 8 corners fit.
 const corners=[];
 for(const px of [b.min.x,b.max.x])for(const py of [b.min.y,b.max.y])for(const pz of [b.min.z,b.max.z])
  corners.push(new T.Vector3(px,py,pz));
 for(let iteration=0;iteration<9;iteration++){
  cam.updateMatrixWorld(true);
  let overshoot=1;
  for(const point of corners){
   const projected=point.clone().project(cam);
   if(!Number.isFinite(projected.x)||!Number.isFinite(projected.y)||projected.z>1){
    overshoot=Math.max(overshoot,1.5);continue;
   }
   overshoot=Math.max(overshoot,Math.abs(projected.x)/.89,Math.abs(projected.y)/.82);
  }
  if(overshoot<=1.001)break;
  cam.position.z=z+(cam.position.z-z)*Math.min(2,Math.max(1.12,overshoot*1.08));
  cam.lookAt(x,y,z);
 }
 // The old fixed far plane clipped enormous fantasy creatures after the
 // camera backed away to fit them. Compute clipping planes from the actual
 // projected depth of both 3D subjects, preserving the medal and anatomy.
 cam.updateMatrixWorld(true);
 let nearDepth=Infinity,farDepth=0;
 for(const point of corners){
  const view=point.clone().applyMatrix4(cam.matrixWorldInverse);
  const depth=-view.z;
  if(Number.isFinite(depth)&&depth>0){
   nearDepth=Math.min(nearDepth,depth);
   farDepth=Math.max(farDepth,depth);
  }
 }
 if(Number.isFinite(nearDepth)&&farDepth>0){
  cam.near=Math.max(.03,Math.min(.5,nearDepth*.45));
  cam.far=Math.max(160,farDepth*1.6+15);
  cam.updateProjectionMatrix();
 }
}

function buildPodiumPhoto(){
 const sc=new T.Scene();
 sc.background=new T.Color(0x657783);
 // No distance fog on the awards portrait: it previously washed out the
 // real 3D models when the camera moved back to fit larger opponents.
 sc.fog=null;
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
 // Bind the podium to the completed race, not the next unlocked selection.
 const finishedOpponent=race&&Number.isInteger(race.opponentIndex)?race.opponentIndex:save.chosen;
 const beast=animals[Math.max(0,Math.min(animals.length-1,finishedOpponent))];
 const athlete=makeHuman(save.avatar),rival=makeExtendedBeast(beast);
 const winningHuman=lastResultWon;
 // Preserve the customized avatar's normalized height. setScalar() erased the
 // height slider and shrank the actual player to 0.90–1.16 world metres.
 // KEEP the exact rigs and dimensions from the playable race. The previous
 // fixed 2.35/2.95m podium target enlarged cats to 3m and shrank 27m kaiju
 // to 3m, destroying every species' physical identity.
 // Athlete customization and real animal scale are preserved at 1:1.
 athlete.root.updateMatrixWorld(true);
 rival.root.updateMatrixWorld(true);
 const naturalBox=new T.Box3().setFromObject(rival.bodyGroup);
 const naturalHeight=naturalBox.max.y-naturalBox.min.y;
 if(!Number.isFinite(naturalHeight)||naturalHeight<=.01)throw Error('Invalid 3D podium opponent height');
 const expectedHeight=SPECIES_HEIGHT_M[beast.kind];
 if(Math.abs(naturalHeight-expectedHeight)>.15)
  throw Error('Podium species height differs from race: '+beast.kind);
 function seatOnStep(rig,x,platformHeight,z){
  // makeHuman/makeExtendedBeast return rigs; only rig.root is a THREE.Object3D.
  // Reading rig.position used to throw and abort every podium render.
  const model=rig.root;
  model.position.set(x,0,z);
  model.updateMatrixWorld(true);
  const bounds=new T.Box3().setFromObject(model);
  if(!Number.isFinite(bounds.min.y))throw Error('Podium model bounds unavailable');
  model.position.y=platformHeight-bounds.min.y+.035;
  model.updateMatrixWorld(true);
 }
 seatOnStep(athlete,winningHuman?0:-2.48,winningHuman?1.27:.75,.28);
 seatOnStep(rival,winningHuman?-2.48:0,winningHuman?.75:1.27,.10);
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
  // The medal remains proportional to each species rather than growing
  // three metres high on a 37cm cat or vanishing on a giant creature.
  rival.root.updateMatrixWorld(true);
  const bounds=new T.Box3().setFromObject(rival.bodyGroup),size=new T.Vector3();
  bounds.getSize(size);
  const rootScale=Math.max(.0001,rival.root.scale.x);
  const pendantWorld=Math.min(.62,Math.max(.075,naturalHeight*.23));
  const neckMount=new T.Group();
  neckMount.position.set(0,(bounds.min.y+size.y*.74-rival.root.position.y)/rootScale,
   (bounds.max.z-size.z*.18-rival.root.position.z)/rootScale);
  rival.root.add(neckMount);
  winnerNecklace(neckMount,pendantWorld/rootScale,.32,.16);
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
 // Frame the actual customized runner and opponent, including tall or wide beasts.
 // Fixed-distance framing cropped large dinosaurs and made small rivals hard to see.
 const subjects=new T.Box3().setFromObject(athlete.root);
 subjects.union(new T.Box3().setFromObject(rival.root));
 const cam=new T.PerspectiveCamera(39,16/9,.1,160);
 // Portrait Android previews must refit after changing the camera aspect.
 const stage={scene:sc,camera:cam,fitBounds:{min:subjects.min.clone(),max:subjects.max.clone()}};
 // A genuinely broken model must not turn the entire result screen grey.
 if(!subjects.min.toArray().every(Number.isFinite)||!subjects.max.toArray().every(Number.isFinite))
  throw Error('Invalid podium subject bounds');
 fitPodiumCamera(stage,16/9);
 return stage;
}

// Guaranteed result image: attempt live Three.js podium capture first.
// If WebGL capture is blocked on Android, draw a local podium scene on 2D canvas.

function endCeremonyStage(){
 releasePodiumPreview();
 if(!ceremonyStage)return;
 const old=ceremonyStage;ceremonyStage=null;
 try{
  const canvas=renderer.domElement,shade=$('shade');
  shade.parentNode.insertBefore(canvas,shade);
  canvas.removeAttribute('style');
  old.scene.traverse(o=>{if(o.isMesh&&o.material?.map?.isCanvasTexture&&o.material.map!==furMaterialTexture)o.material.map.dispose()});
  disposeModel(old.scene);
 }catch(e){console.warn('3D podium release',e)}
 $('result3DWindow').hidden=true;$('resultPhoto').hidden=true;
 racePicture=null;raceShareBlob=null;raceShareCanvas=null;manualXSharePrepared=false;podiumRetryAttempts=0;podiumRetryFrame=0;initResize();
}
function capturePodiumFromGPU(ctx,w,h,lowMemory=false){
 // A fresh offscreen framebuffer is essential on Android: the visible WebGL
 // drawing buffer may already have been discarded by the compositor.
 const target=new T.WebGLRenderTarget(w,h,{depthBuffer:true,stencilBuffer:false,format:T.RGBAFormat,type:T.UnsignedByteType});
 const previousTarget=renderer.getRenderTarget();
 const previousClearColor=new T.Color();
 renderer.getClearColor(previousClearColor);
 const previousClearAlpha=renderer.getClearAlpha();
 const previousAutoClear=renderer.autoClear;
 const previousShadows=renderer.shadowMap.enabled;
 // Editor mode uses a clipped viewport. Preserve and reset it explicitly for
 // offscreen podium capture, including captures started before the next frame.
 const previousViewport=renderer.getViewport(new T.Vector4());
 const previousScissor=renderer.getScissor(new T.Vector4());
 const previousScissorTest=renderer.getScissorTest();
 try{
  renderer.setScissorTest(false);
  renderer.setViewport(0,0,w,h);
  renderer.setScissor(0,0,w,h);
  // Android GPUs can fail allocating a depth texture plus a shadow atlas
  // simultaneously. Retry with a flat-lit REAL 3D scene before giving up.
  if(lowMemory)renderer.shadowMap.enabled=false;
  // Force current world transforms before the offscreen pass. On some
  // Android WebViews the awards stage was rebuilt between animation frames,
  // leaving stale matrices and a background-only photograph.
  ceremonyStage.scene.updateMatrixWorld(true);
  ceremonyStage.camera.updateMatrixWorld(true);
  renderer.setRenderTarget(target);
  renderer.autoClear=true;
  renderer.setClearColor(0x657783,1);
  renderer.clear(true,true,true);
  renderer.render(ceremonyStage.scene,ceremonyStage.camera);
  // Force the offscreen draw to complete before Android WebView readback.
  // Some tile-based mobile GPUs otherwise return the cleared target while
  // the live podium still renders correctly. Keep this inside the capture
  // path so the race animation never pays for a blocking GPU flush.
  const captureGL=renderer.getContext();
  if(captureGL.isContextLost?.())throw Error('Podium WebGL context lost');
  captureGL.finish();
  // Three.js may restore or switch framebuffer bindings during render.
  // Checking the *current* GL framebuffer here can inspect the default
  // framebuffer instead of this render target, rejecting a valid 3D frame.
  // readRenderTargetPixels explicitly binds the target before reading it.
  const gl=renderer.getContext();
  // Clear errors left by the preview pass before this independent readback.
  // A stale GL error is not proof that the newly rendered podium failed.
  for(let n=0;n<8&&gl.getError()!==gl.NO_ERROR;n++){}
  const pixels=new Uint8Array(w*h*4);
  // WebGL readPixels is synchronous. Check the target framebuffer after
  // Three.js binds it, rather than sampling the default Android framebuffer.
  // A partial/unsupported target must not be accepted as a saved photograph.
  renderer.readRenderTargetPixels(target,0,0,w,h,pixels);
  const readError=gl.getError();
  if(readError!==gl.NO_ERROR)throw Error('Podium GPU readback error '+readError);
  // Reject cleared / partial readback before copying or encoding it.
  let opaque=0,low=255,high=0;
  for(let i=0;i<pixels.length;i+=4){
   if(pixels[i+3]>=245)opaque++;
   const light=(pixels[i]*3+pixels[i+1]*6+pixels[i+2])/10;
   low=Math.min(low,light);high=Math.max(high,light);
  }
  if(opaque<w*h*.95||high-low<45)throw Error('Incomplete or uniform podium GPU readback');
  // A stadium-only frame can pass whole-frame contrast checks even when the
  // actual runner and opponent are outside the camera. Validate the portrait
  // before committing the pixels to the final result canvas.
  // Validate the real GPU portrait in the final canvas rather than allocating
  // a second full-resolution RGBA canvas. Android WebView often fails when
  // GPU readback, the result canvas and a duplicate validation canvas coexist.
  // A failed validation is cleared by the caller before any fallback is shown.
  // Flip bottom-up GPU rows in place. Avoid a second full-frame RGBA
  // allocation while Android still holds the framebuffer and readback.
  const stride=w*4,swapRow=new Uint8Array(stride);
  for(let y=0,half=Math.floor(h/2);y<half;y++){
   const top=y*stride,bottom=(h-1-y)*stride;
   swapRow.set(pixels.subarray(top,top+stride));
   pixels.copyWithin(top,bottom,bottom+stride);
   pixels.set(swapRow,bottom);
  }
  // ImageData shares the readback buffer: no extra full-frame copy.
  // Validate the already-read GPU bytes before allocating ImageData or touching
  // the destination canvas. getImageData() here doubled peak RAM on Android
  // and could fail even when the actual 3D framebuffer was valid.
  if(!podiumPixelsValid(null,w,h,pixels))throw Error('Podium subjects not visible in GPU readback');
  // Older Android WebViews may expose CanvasRenderingContext2D but lack the
  // global ImageData constructor. Reuse the GPU readback in modern browsers;
  // fall back to the context's own ImageData allocation only when necessary.
  const clamped=new Uint8ClampedArray(pixels.buffer);
  let frame;
  if(typeof ImageData==='function')frame=new ImageData(clamped,w,h);
  else{frame=ctx.createImageData(w,h);frame.data.set(clamped)}
  ctx.putImageData(frame,0,0);
  return;

 }finally{
  renderer.setRenderTarget(previousTarget);
  renderer.setViewport(previousViewport);
  renderer.setScissor(previousScissor);
  renderer.setScissorTest(previousScissorTest);
  renderer.setClearColor(previousClearColor,previousClearAlpha);
  renderer.autoClear=previousAutoClear;
  renderer.shadowMap.enabled=previousShadows;
  target.dispose();
 }
}
// Reject cleared/blank frames before applying result text: otherwise a
// screenshot with only the footer appears to have captured successfully.
// Validate actual subjects, not merely a varied stadium background.
// A bright sky and dark stands alone must never count as a successful portrait.
function podiumPixelsValid(ctx,w,h,rgbaPixels=null){
 // The offscreen GPU path supplies vertically corrected raw RGBA pixels.
 // Other capture paths continue to validate their existing 2D canvas.
 const data=rgbaPixels||ctx.getImageData(0,0,w,h).data;
 const luminance=(x,y)=>{
  const p=(Math.min(h-1,Math.max(0,y))*w+Math.min(w-1,Math.max(0,x)))*4;
  return (data[p]*3+data[p+1]*6+data[p+2])/10;
 };
 let total=0,bright=0,dark=0,min=255,max=0;
 const step=Math.max(2,Math.floor(Math.min(w,h)/45));
 for(let y=0;y<h;y+=step)for(let x=0;x<w;x+=step){
  const p=(y*w+x)*4;
  if(data[p+3]<245)continue;
  const l=luminance(x,y);total++;
  min=Math.min(min,l);max=Math.max(max,l);
  if(l>160)bright++;
  if(l<85)dark++;
 }
 if(!(total>100&&max-min>75&&bright>total*.008&&dark>total*.008))return false;
 // Compare local contrast in the two expected character positions.
 // Large 3D models and podiums must create edges across these regions.
 // The left and center crops exclude the decorative stadium stands.
 // Scan the complete foreground region at a resolution-independent grid.
 // The previous seven fixed columns could miss thin runners, tall dinosaurs,
 // and off-centre rivals even when both 3D models were clearly rendered.
 // Ignore the lower caption strip and upper spectator stands.
 let strongEdges=0,edgeSum=0,samples=0;
 const dx=Math.max(3,Math.round(w*.014)),dy=Math.max(3,Math.round(h*.025));
 for(let y=Math.round(h*.25);y<Math.round(h*.72);y+=dy){
  for(let x=Math.round(w*.14);x<Math.round(w*.86);x+=dx){
   const l=luminance(x,y);
   const edge=Math.max(Math.abs(l-luminance(x+dx,y)),
                       Math.abs(l-luminance(x,y+dy)));
   if(edge>24)strongEdges++;
   edgeSum+=edge;samples++;
  }
 }
 return samples>80&&strongEdges>=Math.max(9,samples*.025)&&edgeSum/samples>5;
}
function captureCeremonyPhoto(){
 if(!ceremonyStage)return false;
 // Retry at progressively smaller 16:9 resolutions on memory-constrained GPUs.
// A failed full-size framebuffer should not cause three identical failed attempts.
 let success=false;
 const widths=mobile?[640,512,384,256]:[960,768,576,384];
 const w=widths[Math.min(podiumRetryAttempts,widths.length-1)],h=Math.round(w*9/16);
 const photo=document.createElement('canvas');photo.width=w;photo.height=h;
 try{
  const ctx=photo.getContext('2d',{alpha:false,willReadFrequently:true})||photo.getContext('2d');
  if(!ctx)throw Error('Canvas 2D context unavailable');
  // Prefer the explicit GPU framebuffer: mobile WebGL canvases may clear
  // their default drawing buffer before drawImage reads it.
  fitPodiumCamera(ceremonyStage,w/h);
  let captured=false;
  try{
   // capturePodiumFromGPU validates the real 3D portrait before returning.
   // Avoid a second full-frame getImageData readback on memory-limited Android.
   capturePodiumFromGPU(ctx,w,h);
   captured=true;
  }catch(e){console.warn('Offscreen podium capture unavailable',e)}
  // Independent GPU fallback: progressively smaller real-3D framebuffers.
  // Reuse ONE small validation canvas rather than allocating a new canvas on
  // each retry. Android WebViews may reject 384px FBOs but accept 256px.
  if(!captured){
   const reduced=document.createElement('canvas');
   const reducedCtx=reduced.getContext('2d',{alpha:false,willReadFrequently:true})||reduced.getContext('2d');
   if(reducedCtx){
    const sizes=[Math.min(w,384),Math.min(w,256)];
    for(const reducedW of [...new Set(sizes)]){
     const reducedH=Math.round(reducedW*9/16);
     try{
      reduced.width=reducedW;reduced.height=reducedH;
      fitPodiumCamera(ceremonyStage,reducedW/reducedH);
      // The reduced real-3D GPU frame has already passed portrait validation.
      capturePodiumFromGPU(reducedCtx,reducedW,reducedH,true);
      ctx.clearRect(0,0,w,h);
      ctx.drawImage(reduced,0,0,w,h);
      captured=true;
      break;
     }catch(e){console.warn('Low-memory 3D podium capture unavailable at '+reducedW+'px',e)}
    }
   }
  }
  if(!captured){
   // A failed readback may have left partial pixels in the output canvas.
   // Clear them before trying the live framebuffer, so a failed fallback
   // cannot accidentally pass validation with remnants of the GPU attempt.
   ctx.clearRect(0,0,w,h);
   // Preserve the active WebGL drawing buffer on Android. Resizing the
   // renderer here reallocates the default framebuffer and can leave a
   // permanently grey podium or lose the WebGL context on memory-limited
   // devices. Draw a fresh frame at the existing preview resolution and
   // downsample its pixels into the photo canvas instead.
   // A failed offscreen capture can leave editor scissor/viewport state active.
   // The live fallback must render into the entire default framebuffer, not
   // the stale editor rectangle, or the resulting photograph can be blank.
   renderer.setRenderTarget(null);
   renderer.setScissorTest(false);
   const liveBuffer=renderer.getDrawingBufferSize(new T.Vector2());
   renderer.setViewport(0,0,liveBuffer.x,liveBuffer.y);
   const live=renderer.domElement;
   if(!live.width||!live.height)throw Error('Podium preview framebuffer unavailable');
   const liveAspect=live.width/live.height;
   const photoAspect=w/h;
   // Render the actual 3D portrait into a centered 16:9 viewport. Fitting
   // the camera to the full phone screen and cropping afterwards can cut
   // off the opponent or avatar on tall Android devices.
   const portraitW=Math.max(1,Math.floor(Math.min(liveBuffer.x,liveBuffer.y*photoAspect)));
   const portraitH=Math.max(1,Math.floor(Math.min(liveBuffer.y,liveBuffer.x/photoAspect)));
   const portraitX=Math.floor((liveBuffer.x-portraitW)/2);
   const portraitY=Math.floor((liveBuffer.y-portraitH)/2);
   fitPodiumCamera(ceremonyStage,portraitW/portraitH);
   renderer.setScissor(0,0,liveBuffer.x,liveBuffer.y);
   renderer.autoClear=true;
   renderer.clear(true,true,true);
   renderer.setViewport(portraitX,portraitY,portraitW,portraitH);
   ceremonyStage.scene.updateMatrixWorld(true);
   ceremonyStage.camera.updateMatrixWorld(true);
   renderer.render(ceremonyStage.scene,ceremonyStage.camera);
   // Read the live WebGL framebuffer synchronously before Android WebView's
   // compositor can discard it. This is a third independent real-3D capture
   // path when both offscreen GPU render targets are unavailable.
   try{
    const gl=renderer.getContext();
    if(gl.isContextLost?.())throw Error('WebGL context lost');
    const pw=gl.drawingBufferWidth,ph=gl.drawingBufferHeight;
    if(pw>0&&ph>0){
     // Read only the centered 16:9 portrait region, bounded to a mobile-safe
     // framebuffer allocation. WebGL readPixels uses bottom-left coordinates.
     const aspect=w/h;
     // Read the entire 16:9 podium in bounded strips; do not crop out the
     // runner or rival on high-density Android WebView drawing buffers.
     const cropW=Math.max(1,Math.floor(Math.min(pw,ph*aspect)));
     const cropH=Math.max(1,Math.floor(Math.min(ph,pw/aspect)));
     if(cropW<16||cropH<9)throw Error('Default framebuffer too small');
     const rx=Math.floor((pw-cropW)/2),ry=Math.floor((ph-cropH)/2);
     const stripH=Math.max(1,Math.min(cropH,Math.floor((mobile?640*360:960*540)/cropW)));
     const scan=document.createElement('canvas');scan.width=cropW;scan.height=stripH;
     const scanCtx=scan.getContext('2d',{alpha:false,willReadFrequently:true})||scan.getContext('2d');
     if(!scanCtx)throw Error('Readback canvas unavailable');
     const raw=new Uint8Array(cropW*stripH*4);
     const stride=cropW*4,swap=new Uint8Array(stride);
     gl.finish();
     for(let n=0;n<8&&gl.getError()!==gl.NO_ERROR;n++){}
     for(let y=0;y<cropH;y+=stripH){
      const rows=Math.min(stripH,cropH-y);
      gl.readPixels(rx,ry+y,cropW,rows,gl.RGBA,gl.UNSIGNED_BYTE,raw.subarray(0,rows*stride));
      if(gl.getError()!==gl.NO_ERROR)throw Error('Default framebuffer strip readback failed');
      for(let row=0,half=Math.floor(rows/2);row<half;row++){
       const top=row*stride,bottom=(rows-1-row)*stride;
       swap.set(raw.subarray(top,top+stride));
       raw.copyWithin(top,bottom,bottom+stride);
       raw.set(swap,bottom);
      }
      const frame=scanCtx.createImageData(cropW,rows);
      frame.data.set(raw.subarray(0,rows*stride));
      scanCtx.putImageData(frame,0,0);
      // GPU rows run bottom-up. Place each flipped strip at its correct
      // vertical location, preserving the entire podium and both models.
      const destTop=h*(cropH-y-rows)/cropH;
      const destBottom=h*(cropH-y)/cropH;
      ctx.drawImage(scan,0,0,cropW,rows,0,destTop,w,destBottom-destTop);
     }
     captured=podiumPixelsValid(ctx,w,h);
    }
   }catch(readErr){console.warn('Default WebGL readback unavailable',readErr)}
   if(!captured){
    ctx.clearRect(0,0,w,h);
    const cropW=liveAspect>photoAspect?live.height*photoAspect:live.width;
    const cropH=liveAspect<photoAspect?live.width/photoAspect:live.height;
    const sx=(live.width-cropW)*.5,sy=(live.height-cropH)*.5;
    ctx.drawImage(live,sx,sy,cropW,cropH,0,0,w,h);
    captured=podiumPixelsValid(ctx,w,h);
   }
  }
  if(!captured)throw Error('Podium framebuffer is empty or uniform');
  // Only a snapshot of the actual game models is used. No illustrated substitute.
  // Low-memory Android capture may be only 256x144. A fixed 84px footer
  // obscured most of the actual 3D subjects, making valid photos look blank.
  // Scale the caption and its safe margins with the real framebuffer size.
  const photoScale=Math.min(1,w/640,h/360);
  const footerH=Math.round(84*photoScale);
  const start=h-footerH,gradient=ctx.createLinearGradient(0,start,0,h);
  gradient.addColorStop(0,'rgba(8,20,25,0)');gradient.addColorStop(.22,'rgba(8,20,25,.82)');gradient.addColorStop(1,'rgba(8,20,25,.96)');
  ctx.fillStyle=gradient;ctx.fillRect(0,start,w,footerH);
  const margin=Math.round(24*photoScale);
  ctx.fillStyle='#fff9ee';ctx.textAlign='left';
  ctx.font='600 '+Math.max(8,Math.round(19*photoScale))+'px system-ui,sans-serif';
  ctx.fillText('動物と100m走 / '+raceName,margin,start+Math.round(29*photoScale),w-margin*2);
  ctx.font='800 '+Math.max(12,Math.round(30*photoScale))+'px system-ui,sans-serif';
  ctx.fillText(resultText,margin,start+Math.round(63*photoScale),w-margin*2);
  ctx.textAlign='right';ctx.fillStyle='#ccd7d4';
  ctx.font='500 '+Math.max(7,Math.round(13*photoScale))+'px sans-serif';
  ctx.fillText('techmew.github.io/human-vs-beasts/',w-Math.round(20*photoScale),h-Math.round(8*photoScale),w-margin*2);
  // A valid WebGL readback is already held in the canvas. Android WebView
  // may block synchronous toDataURL even though asynchronous toBlob works.
  // Keep the captured pixels for Save/Share instead of discarding them.
  racePicture=photo;
  cacheRaceSharePhoto(photo);
  ceremonyStage.photoCaptured=true;
  // Show the validated pixels immediately, without waiting for Android's
  // potentially unreliable image decoder. Keep the real WebGL scene underneath.
  try{showCapturedPodiumCanvas(photo)}catch(err){console.warn('Canvas podium preview unavailable',err)}
  success=true;
  // Android WebView can freeze or lose the GPU context when encoding the
  // full photograph synchronously. The real 3D snapshot is already visible
  // in a canvas and pre-encoding for Share runs independently. Use toBlob
  // for the preview on mobile; never block the race result screen on toDataURL.
  if(mobile){
   void showAsyncPodiumPreview(photo);
   return true;
  }
  let src='';
  for(const format of ['image/jpeg','image/png']){
   try{
    const candidate=format==='image/jpeg'?photo.toDataURL(format,.88):photo.toDataURL(format);
    if(candidate.startsWith('data:'+format+';base64,')&&candidate.length>2000){src=candidate;break}
   }catch(exportErr){console.warn('Podium preview encoding unavailable',format,exportErr)}
  }
  if(src){
   // Data URL encoding can succeed while Android WebView fails to decode the
   // resulting image. Keep live 3D visible until the image actually loads.
   const token=++podiumPreviewToken;
   const image=$('resultPhoto');
   const probe=new Image();
   // A successful detached Image decode does not prove the visible DOM
   // <img> decoded: Android WebView can evict the data URL between the two.
   // Keep the actual 3D WebGL scene visible until the displayed image loads.
   let settled=false;
   const fallback=()=>{
    if(settled||token!==podiumPreviewToken||!ceremonyStage||racePicture!==photo)return;
    settled=true;clearTimeout(previewTimer);
    image.onload=null;image.onerror=null;image.removeAttribute('src');
    image.hidden=true;$('result3DWindow').hidden=false;
    $('shareHelp').textContent='3D表彰台を表示中です。写真は保存・共有できます。';
    void showAsyncPodiumPreview(photo);
   };
   const previewTimer=setTimeout(fallback,2400);
   probe.onload=()=>{
    if(settled||token!==podiumPreviewToken||!ceremonyStage||racePicture!==photo){clearTimeout(previewTimer);return}
    image.onload=()=>{
     if(settled||token!==podiumPreviewToken||!ceremonyStage||racePicture!==photo)return;
     if(!image.naturalWidth||!image.naturalHeight){fallback();return}
     settled=true;clearTimeout(previewTimer);
     image.onload=null;image.onerror=null;
     if(mobile){
      // Android may decode an IMG but composite it as grey. Keep verified 3D pixels.
      image.hidden=true;$('result3DWindow').hidden=false;
      showCapturedPodiumCanvas(photo);
     }else{
      image.hidden=false;$('result3DWindow').hidden=true;
      clearCapturedPodiumCanvas();
     }
     $('shareHelp').textContent='3D表彰台写真を保存・共有できます。';
    };
    image.onerror=fallback;
    image.src=src;
    // Cached data URLs may complete synchronously without firing onload.
    if(image.complete&&image.naturalWidth&&image.naturalHeight)image.onload();
   };
   probe.onerror=fallback;
   probe.src=src;
   image.hidden=true;$('result3DWindow').hidden=false;
   $('shareHelp').textContent='3D表彰台写真を確認中。保存・共有は利用できます。';
  }else{
   // Preserve the actual 3D podium as the preview; never substitute 2D art.
   // The valid photo canvas remains available to the async save/share path.
   $('resultPhoto').hidden=true;$('result3DWindow').hidden=false;
   $('shareHelp').textContent='3D表彰台写真を準備中。保存・共有も利用できます。';
   void showAsyncPodiumPreview(photo);
  }
 }catch(err){
  console.warn('3D image capture blocked; show live 3D podium instead',err);
  // A failed retry must not erase a previously validated photograph.
  // This is especially important after Android restores a lost GPU context.
  if(racePicture&&racePicture.width>0&&racePicture.height>0){
   ceremonyStage.photoCaptured=true;
   try{showCapturedPodiumCanvas(racePicture)}
   catch(previewError){console.warn('Saved 3D podium preview unavailable',previewError)}
   $('shareHelp').textContent='撮影済みの3D写真を保存・共有できます。';
  }else{
   racePicture=null;
   releasePodiumPreview();
   $('resultPhoto').hidden=true;$('result3DWindow').hidden=false;
   ceremonyStage.photoCaptured=false;
   $('shareHelp').textContent='3D表彰台を表示中。写真を再取得しています。';
  }
 }finally{
  if(ceremonyStage){
   // Restore the live 3D preview only while it is visible. After an encoded
   // photo is displayed, reallocating a hidden WebGL buffer on Android is
   // unnecessary and may lose the context before the next race.
   const view=$('result3DWindow');
   if(!view.hidden){
    const pw=Math.max(320,view.clientWidth||340),ph=Math.max(180,view.clientHeight||192);
    renderer.setRenderTarget(null);
    renderer.setPixelRatio(Math.min(1.4,devicePixelRatio||1));
    renderer.setSize(pw,ph,false);
    fitPodiumCamera(ceremonyStage,pw/ph);
    if(!success)renderer.render(ceremonyStage.scene,ceremonyStage.camera);
   }
  }
 }
 return success;
}
function makeRacePhoto(){
 // Release the previous ceremony before showing the new preview. Releasing
 // it hides both result surfaces; doing that after unhiding the preview left
 // Android with an invisible live 3D fallback whenever capture failed.
 if(ceremonyStage)endCeremonyStage();
 racePicture=null;releasePodiumPreview();podiumRetryAttempts=0;podiumRetryFrame=0;
 const preview=$('result3DWindow');preview.hidden=false;
 $('resultPhoto').hidden=true;
 try{
  // Build the podium before transferring the live WebGL canvas; a failed
  // model construction must never leave the gameplay canvas detached.
  try{
   ceremonyStage=buildPodiumPhoto();
  }catch(primaryError){
   // Keep a genuine 3D portrait even if decorative podium construction fails.
   // Clone the live customized runner and selected opponent, never use 2D art.
   console.warn('Full podium unavailable; using minimal 3D portrait',primaryError);
   const sc=new T.Scene();sc.background=new T.Color(0x657783);
   sc.add(new T.HemisphereLight(0xffffff,0x556677,2.0));
   const light=new T.DirectionalLight(0xffe8ce,2.1);light.position.set(-4,9,8);sc.add(light);
   // A failed decorative stage must still produce a genuine, recognizable
   // 3D podium portrait, with both real race rigs and a winner's medal.
   // Object3D.clone() shares mesh geometry and materials with the live race.
   // The result stage is disposed on retry; deep-copy GPU resources here so
   // disposing a fallback podium cannot corrupt the next race or avatar editor.
   function isolatedPodiumClone(source){
    const copy=source.clone(true);
    copy.traverse(node=>{
     if(!node.isMesh)return;
     if(node.geometry)node.geometry=node.geometry.clone();
     if(Array.isArray(node.material))node.material=node.material.map(m=>m?.clone?.()||m);
     else if(node.material?.clone)node.material=node.material.clone();
     // Material maps may be shared safely: disposeModel never disposes maps.
    });
    return copy;
   }
   const runner=isolatedPodiumClone(human.root),beast=isolatedPodiumClone(opponent.root);
   const winner=lastResultWon?runner:beast;
   const floorMat=new T.MeshStandardMaterial({color:0x34454f,roughness:.82});
   const goldMat=new T.MeshStandardMaterial({color:0xd9b46b,metalness:.52,roughness:.34});
   const ground=new T.Mesh(new T.PlaneGeometry(40,32),floorMat);
   ground.rotation.x=-Math.PI/2;ground.position.y=-.06;sc.add(ground);
   const steps=[{x:0,y:1.12,width:2.15},{x:-2.4,y:.67,width:1.9}];
   for(const step of steps){
    const block=new T.Mesh(new T.BoxGeometry(step.width,step.y,1.65),floorMat);
    block.position.set(step.x,step.y/2,.1);sc.add(block);
    const cap=new T.Mesh(new T.BoxGeometry(step.width,.08,1.7),goldMat);
    cap.position.set(step.x,step.y+.04,.1);sc.add(cap);
   }
   function placeFallbackModel(model,x,top){
    model.position.set(x,0,.1);model.rotation.set(0,0,0);
    model.visible=true;model.updateMatrixWorld(true);
    const box=new T.Box3().setFromObject(model);
    if(box.isEmpty()||!Number.isFinite(box.min.y))throw primaryError;
    model.position.y=top+.08-box.min.y;
    model.updateMatrixWorld(true);
   }
   placeFallbackModel(runner,lastResultWon?0:-2.4,lastResultWon?1.12:.67);
   placeFallbackModel(beast,lastResultWon?-2.4:0,lastResultWon?.67:1.12);
   sc.add(runner,beast);
   // Position the 3D medal in world coordinates, scaled to the actual
   // winner's anatomy; never replace the character with flat artwork.
   const winnerBounds=new T.Box3().setFromObject(winner);
   const size=new T.Vector3();winnerBounds.getSize(size);
   const medalSize=Math.max(.065,Math.min(.28,size.y*.14));
   const medal=new T.Mesh(new T.CylinderGeometry(medalSize,medalSize,.035,28),goldMat);
   medal.rotation.x=Math.PI/2;
   medal.position.set((winnerBounds.min.x+winnerBounds.max.x)/2,
     winnerBounds.min.y+size.y*.70,winnerBounds.max.z+.045);
   sc.add(medal);
   const ribbonMat=new T.MeshStandardMaterial({color:0x4d846f,roughness:.8});
   for(const side of [-1,1]){
    const ribbon=new T.Mesh(new T.BoxGeometry(medalSize*.15,medalSize*1.7,.018),ribbonMat);
    ribbon.position.set(medal.position.x+side*medalSize*.34,
      medal.position.y+medalSize*.8,medal.position.z-.025);
    ribbon.rotation.z=side*.33;sc.add(ribbon);
   }
   const bounds=new T.Box3().setFromObject(runner);
   bounds.union(new T.Box3().setFromObject(beast));
   bounds.union(new T.Box3().setFromObject(medal));
   if(bounds.isEmpty())throw primaryError;
   const camera=new T.PerspectiveCamera(39,16/9,.1,400);
   ceremonyStage={scene:sc,camera,fitBounds:{min:bounds.min.clone(),max:bounds.max.clone()}};
  }
  ceremonyStage.photoCaptured=false;
  const canvas=renderer.domElement;preview.appendChild(canvas);
  canvas.style.position='relative';canvas.style.inset='auto';canvas.style.width='100%';canvas.style.height='100%';
  const w=Math.max(320,preview.clientWidth||340),h=Math.max(180,preview.clientHeight||192);
  fitPodiumCamera(ceremonyStage,w/h);
  renderer.setPixelRatio(Math.min(1.4,devicePixelRatio||1));renderer.setSize(w,h,false);
  renderer.render(ceremonyStage.scene,ceremonyStage.camera);
  // Show the live 3D podium before GPU capture on Android.
  // frame() captures after two rendered frames.
 }catch(err){
  console.warn('Could not create 3D podium',err);
  $('shareHelp').textContent='3D表彰台の描画に失敗しました。再試行してください。';
  if(ceremonyStage)endCeremonyStage();
  // A failed model build must not leave an empty grey result window visible.
  $('result3DWindow').hidden=true;
  $('resultPhoto').hidden=true;
  const canvas=renderer.domElement,shade=$('shade');
  if(shade?.parentNode&&canvas.parentNode!==shade.parentNode)shade.parentNode.insertBefore(canvas,shade);
  canvas.removeAttribute('style');
  initResize();
 }
}


// Race distance and finish time remain locked at 100m. The visual Pegasus
// travels farther, climbs and vanishes without changing awards or save state.
function advancePegasusFlight(dt){
 const r=race;
 if(!r||animals[r.opponentIndex]?.kind!=='pegasus'||(r.phase!=='pegasusExit'&&r.eFinish===null))return;
 const step=Math.min(.065,Math.max(0,dt));
 if(r.pegasusBeyond==null)r.pegasusBeyond=r.enemyD;
 if(r.pegasusCruiseTime==null)r.pegasusCruiseTime=0;
 r.pegasusCruiseTime+=step;
 const speed=Math.min(108,Math.max(22,r.pegasusCruiseSpeed||22)+r.pegasusCruiseTime*17);
 r.pegasusFlightSpeed=speed;
 r.pegasusBeyond+=speed*step;
 // Hold a low, visible departure first; then rise progressively after
 // the finish. Avoid the previous immediate 65m climb in three seconds.
 const t=Math.max(0,r.pegasusCruiseTime-1.6);
 const height=Math.min(165,1.4*Math.min(r.pegasusCruiseTime,1.6)+2.2*t*t+0.65*t*t*t);
 opponent.root.position.set(r.enemyLateral,.13+height,r.pegasusBeyond);
 opponent.root.visible=r.pegasusBeyond<520;
 if(r.phase==='pegasusExit'){
  r.pegasusExitWait=(r.pegasusExitWait||0)+step;
  if(!opponent.root.visible||r.pegasusExitWait>=8.5){
   // A missing render frame cannot trap the player in the farewell sequence.
   opponent.root.visible=false;
   r.pegasusExitDone=true;
   finishRace();
  }
 }
}

function finishRace(){
 const r=race;if(!r||r.phase==='results')return;
 const opponentIndex=Number.isInteger(r.opponentIndex)&&r.opponentIndex>=0&&r.opponentIndex<animals.length?r.opponentIndex:save.chosen;
 const opponent=animals[opponentIndex];
 // Pegasus must visibly continue flying beyond the finish before the result UI
 // switches WebGL over to the podium. The official race time is already fixed.
 if(opponent.kind==='pegasus'&&!r.pegasusExitDone&&(r.pegasusBeyond??r.enemyD)<520){
  if(r.phase!=='pegasusExit'){
   r.phase='pegasusExit';r.pegasusExitWait=0;r.pegasusBeyond=r.pegasusBeyond??r.enemyD;
   r.pegasusCruiseTime=r.pegasusCruiseTime||0;r.pegasusCruiseSpeed=Math.max(22,r.pegasusCruiseSpeed||r.enemyV||22);
   r.humanV=0;r.drive=0;
   $('countdown').style.display='none';$('raceControls').style.display='none';$('raceHUD').style.display='none';
   $('raceMsg').style.display='none';noticeTime=0;
  }
  return;
 }
 r.phase='results';$('countdown').style.display='none';$('raceControls').style.display='none';$('raceHUD').style.display='none';
 const completed=Number.isFinite(r.hFinish);
 // An opponent still running has eFinish=null; numeric comparison with null
 // incorrectly treated it as zero and marked a first-place human as defeated.
 const won=completed&&(!Number.isFinite(r.eFinish)||r.hFinish<r.eFinish);
 const record=completed?r.hFinish:r.time;
 save.races=(save.races||0)+1;
 if(completed){save.best=save.best==null?r.hFinish:Math.min(save.best,r.hFinish);const key=opponent.id;save.bestByBeast[key]=Math.min(save.bestByBeast[key]||999,r.hFinish)}
 const reward=Math.max(15,Math.round((won?190:completed?65:30)+opponent.tier*(won?68:completed?13:0)+(completed?Math.max(0,18-r.hFinish)*4:0)));
 save.money+=reward;
 // Bonus monster wins must not unlock all 50 regular rivals.
 const bonusChallenge=opponent.group==='怪獣';
 const atLast=!bonusChallenge&&opponentIndex>=49;
 if(won){
  if(!save.won.includes(opponent.id))save.won.push(opponent.id);
  if(!bonusChallenge){
   save.unlockedStage=Math.max(save.unlockedStage,Math.min(49,opponentIndex+1));
   if(!atLast)save.chosen=Math.max(save.chosen,opponentIndex+1);
  }
 }
 store();
 $('resultEyebrow').textContent='100m走の結果';
 $('resultTitle').textContent=won?'勝ち':completed?'負け':'未完走';
 $('resultTitle').style.color=won?'#d7e4d2':'#e5c2aa';
 $('resultTime').textContent=completed?r.hFinish.toFixed(2)+'秒':'未完走';
 $('resultEnemy').textContent=Number.isFinite(r.eFinish)?r.eFinish.toFixed(2)+'秒':'ゴール前に終了';
 $('resultMoney').textContent='+'+reward+' G';
 $('resultMsg').textContent=won?(bonusChallenge?'怪獣に勝利しました。通常50種の進行は変わりません。':'勝ちました。'+(atLast?'通常50種との対戦を終えました。':'次の動物に挑戦できます。')):completed?'負けました。育成してから再挑戦できます。':'35秒以内にゴールできませんでした。タップして走ってください。';
 lastResultWon=won;resultText=(completed?r.hFinish.toFixed(2)+'秒':'未完走')+'  /  '+(won?'勝ち':'負け');
 $('resultOverlay').style.display='flex';
 stopAmbience();if(voiceStopTimer){clearTimeout(voiceStopTimer);voiceStopTimer=null}for(const player of Object.values(loadedCalls))if(!player.paused)player.pause();makeRacePhoto();refreshMenu();effect(won?'victory':'defeat');
}

// Each opponent gets a repeatable, species-specific pace rhythm rather than
// sharing one generic acceleration curve. Variation averages to zero so
// progression, records and the official 100m distance remain comparable.
function rivalStridePace(kind,phase,distance){
 const gait=GAIT_MAP[kind]||'canter';
 const rhythm={
  kangarooHop:[.095,1.30],bound:[.075,1.75],pronk:[.068,1.50],
  birdRun:[.042,2.10],horseGallop:[.048,1.38],
  flexGallop:[.055,1.62],canter:[.035,1.44],
  heavyTrot:[.028,.85],heavyBiped:[.043,.94],
  giantBiped:[.038,.68],giantQuad:[.022,.62],
  knuckleRun:[.047,1.22],mechanicalRun:[.050,1.05],
  springRun:[.10,1.92],wingFlight:[.068,1.08]
 }[gait]||[.035,1.2];
 // Stable species-specific offset: no random per-frame acceleration.
 let hash=0;for(let i=0;i<kind.length;i++)hash=(hash*31+kind.charCodeAt(i))%997;
 const offset=hash/997*Math.PI*2;
 const wave=Math.sin(phase*rhythm[1]+offset);
 const fatigue=distance>75?.82:1;
 return clamp(1+wave*rhythm[0]*fatigue,.88,1.12);
}

// Advance race physics in bounded steps on low-FPS phones. Previously frames
// longer than 65ms lost elapsed time, slowing both runners and the countdown.
// Clamp background-tab stalls to 250ms to avoid sudden unseen race progress.
function updateRace(dt){
 if(!race||!Number.isFinite(dt)||dt<=0)return;
 let remaining=Math.min(dt,.25);
 while(remaining>0.000001){
  const step=Math.min(remaining,.05);
  updateRaceStep(step);
  remaining-=step;
  if(!race||race.phase==='finished'||race.phase==='results'||race.phase==='pegasusExit')break;
 }
}
function updateRaceStep(dt){const r=race;if(!r)return;if(r.phase==='countdown'){r.count-=dt;const n=Math.ceil(clamp(r.count,0,3));if(n>0){$('countdown').textContent=n;if(n!==r.lastCount){effect('count');r.lastCount=n}}else{$('countdown').textContent='GO!';r.phase='running';r.time=0;showNotice('GO!',.7);effect('start');startAmbience();animalCall(animals[Number.isInteger(r.opponentIndex)?r.opponentIndex:save.chosen].kind);setTimeout(()=>{if(race===r&&r.phase==='running'&&mode==='race')$('countdown').style.display='none'},450)}return}
 if(r.phase!=='running')return;const dtSafe=Math.min(.065,dt);r.time+=dtSafe;r.drive=Math.max(0,r.drive-dtSafe*.15);r.bumpCooldown=Math.max(0,r.bumpCooldown-dtSafe);r.enemyStumble=Math.max(0,r.enemyStumble-dtSafe);if(r.combo>0&&r.time-r.lastTap>1.15)r.combo=0;
 const prevLateral=r.lateral;const moveFactor=1-Math.exp(-dtSafe*8.4);
 r.lateral+=(r.lateralTarget-r.lateral)*moveFactor;
 r.lateralVelocity=(r.lateral-prevLateral)/Math.max(.005,dtSafe);
 const base=(7.15+(save.stats.speed-1)*1.17+save.stats.technique*.10),maxSpeed=base*(r.burstLeft>0?1.47:1);const sinceTap=r.time-r.lastTap;
 // A runner must be driven by taps: smoothly wind down within 0.38s rather
 // than continuing at full speed for 0.85s after the player's fingers stop.
 const tapMomentum=(r.taps||0)>0?clamp((.38-sinceTap)/.24,0,1):0;
 const hasInput=tapMomentum>0;const tempo=clamp(.18+r.drive*.79,.18,1.10);const fatigued=(.55+.45*r.stamina);const offCourse=r.lateral < -4.85 || r.lateral > 2.1;const targetHuman=hasInput?maxSpeed*Math.min(1.07,tempo)*fatigued*(offCourse?.76:1)*tapMomentum:0;const accel=7.8+(save.stats.power-1)*.55;
 if(r.hFinish===null){if(!hasInput){r.humanV=0;r.combo=0;r.lateralTarget=r.lateral;r.sideStreak=0}else if(r.humanV<targetHuman)r.humanV=Math.min(targetHuman,r.humanV+accel*dtSafe);else r.humanV=Math.max(targetHuman,r.humanV-(5.8+22*(1-tapMomentum))*dtSafe);r.humanD+=r.humanV*dtSafe;
 r.stamina=clamp(r.stamina-((r.drive>.50?.012:.001)*(1/(1+save.stats.stamina*.09))+(r.burstLeft>0?.028:0))*dtSafe+(r.drive<.4?.014:0)*dtSafe,.32,1);if(r.humanD>=100){const before=r.humanD-r.humanV*dtSafe;r.hFinish=r.time-dtSafe+(100-before)/Math.max(.01,r.humanV);r.humanD=100;r.humanV=0;r.combo=0;beep(930,.16,'sine',.05)}}
 // Lock rival physics to the opponent selected at race start; menu/async updates must not swap opponents mid-race.
 const rivalIndex=Number.isInteger(r.opponentIndex)?r.opponentIndex:save.chosen;
 const a=animals[Math.max(0,Math.min(animals.length-1,rivalIndex))],maxB=a.kph/3.6;
 if(r.eFinish===null){
  // Every profile remains a normal 100m race: heavy starters gather momentum,
  // hoppers pulse, sprinters accelerate quickly, and special opponents finish fast.
  const progress=r.enemyD;
  let pace=1,accMult=1;
  if(a.profile==='heavy'){pace=progress<18?.72:progress<52?.94:1.12;accMult=.82}
  else if(a.profile==='sprinter'){pace=progress<16?1.06:progress<76?1.035:.96;accMult=1.13}
  else if(a.profile==='hopper'){pace=(progress<18?.88:1.02);accMult=1.04}
  else if(a.profile==='late'){pace=progress<35?.83:progress<70?1.04:1.23;accMult=1.04}
  else{pace=progress<20?.95:progress>82?1.04:1}
  const stage=rivalIndex;
  const challenge=stage<3?1.15:stage<7?1.58:stage<14?2.25:stage<22?1.95:stage<37?2.10:2.18;
  // Integrate the rival's stride on the fixed physics clock, not the
  // render-frame gait. Android frame drops must not change opponent pace.
  r.rivalStridePhase=(r.rivalStridePhase||0)+dtSafe*animalGaitRate(a.kind,Math.max(1,r.enemyV));
  const stridePace=rivalStridePace(a.kind,r.rivalStridePhase,progress);
  // Hopper push-off used to depend on the visual beastGait clock, which runs
  // once per rendered frame. Use the fixed physics stride phase instead:
  // identical taps and elapsed time now yield identical kangaroo/rabbit pace
  // on both 30 FPS and 60 FPS phones.
  const hopImpulse=a.profile==='hopper'?Math.pow(Math.max(0,Math.sin(r.rivalStridePhase)),2)*.12:0;
  const enemyTarget=maxB*(pace+hopImpulse)*stridePace*(r.enemyStumble>0?.62:1),acc=a.acc*accMult*challenge;
  if(r.enemyV<enemyTarget)r.enemyV=Math.min(enemyTarget,r.enemyV+acc*dtSafe);
  else r.enemyV=Math.max(enemyTarget,r.enemyV-acc*1.4*dtSafe);
  r.enemyD+=r.enemyV*dtSafe;
  // Impact effects follow the 3D rig's foot contacts, not distance-only timers.
  if(r.enemyD>60&&r.lastRivalCall<0){r.lastRivalCall=r.time;animalCall(a.kind)}
  if(r.enemyD>=100){const before=r.enemyD-r.enemyV*dtSafe;r.eFinish=r.time-dtSafe+(100-before)/Math.max(.01,r.enemyV);r.enemyD=100;r.enemyV=0}
 }
 r.burstLeft=Math.max(0,r.burstLeft-dtSafe);const ready=r.burstCharge>=99&&r.burstLeft<=0;const button=$('burstBtn');if(button.disabled===ready){button.disabled=!ready;button.classList.toggle('ready',ready)}
 // Repeated right input moves toward the outside of the rightmost lane (negative world X).
 // Repeated left input moves toward the rival (positive X) and can shoulder-bump it.
 human.root.position.set(r.lateral,.13,r.humanD);human.root.rotation.y=clamp(-r.lateralVelocity*.045,-.13,.13);
 // Official opponent distance stops at 100m; the post-finish flight is visual only.
 if(a.kind!=='pegasus'||r.eFinish===null)opponent.root.position.set(r.enemyLateral,.13,r.enemyD);
 if(offCourse&&!r.offTrack){r.offTrack=true}
 else if(!offCourse)r.offTrack=false;
 // Shoulder contact depends on rival size and mass, not a universal hitbox.
 const rivalHeight=SPECIES_HEIGHT_M[a.kind]||1.5;
 const massive=rivalHeight>=3.1||['elephant','hippo','rhino','mammoth','woollyrhino','gorilla','giantsloth','boar'].includes(a.kind);
 const collisionWidth=clamp(.65+rivalHeight*.12,.75,1.52);
 const collisionDepth=clamp(1.8+rivalHeight*.54,2.1,5.4);
 // Collision immunity must follow the same physics stride as the rival's
 // acceleration. The visual animation clock can lag or pause on Android,
 // otherwise a kangaroo/rabbit is hittable at different times on 30/60 FPS.
 // Only the airborne half of the actual hop is protected; landing is hittable.
 const hopPhase=r.rivalStridePhase||0;
 const airborne=a.profile==='hopper'&&Math.sin(hopPhase)>.55;
 const flying=['pegasus','griffin','dragon'].includes(a.kind)&&opponent.flight>.4;
 if(r.bumpCooldown===0&&r.hFinish===null&&r.eFinish===null&&!airborne&&!flying
  &&Math.abs(r.lateral-r.enemyLateral)<collisionWidth
  &&Math.abs(r.humanD-r.enemyD)<collisionDepth){
   r.bumpCooldown=massive?1.65:1.2;
   r.enemyStumble=massive?.18:.95;
   r.enemyV*=massive?.97:.69;
   r.humanV*=massive?.72:.94;
   if(massive)r.drive*=.80;
   r.enemyLateral=clamp(r.enemyLateral+(massive?.08:.34),animalX-.4,animalX+1.35);
   kickDust(r.lateral,r.humanD,massive?16:10);
   effect('bump');
  }
 /* Rival dust is generated only by actual animated foot contact in frame(). */
 if(noticeTime>0){noticeTime-=dtSafe;if(noticeTime<=0)$('raceMsg').style.display='none'}
 if(r.hFinish===null&&r.time>35){r.hFinish=Infinity;r.dnf=true;r.humanV=0;r.drive=0;}// The player's finish is decisive: do not keep the race running while the rival completes 100m.
 // If the rival finished first, the player can continue until finishing or the 35s limit.
 if(r.hFinish!==null){finishRace();return}lastHUD+=dtSafe;if(lastHUD>.055){lastHUD=0;updateHud()}}
function updateHud(force=false){if(!race)return;const r=race;$('dist').textContent=r.humanD.toFixed(1);$('enemyDist').textContent=r.enemyD.toFixed(1);$('timer').textContent=r.time.toFixed(2);$('speedDisplay').innerHTML=(r.humanV*3.6).toFixed(1)+' <small>km/h</small>';$('comboDisplay').textContent=r.combo>=2?'交互 '+r.combo+'連続':r.taps===0?'READY':r.time-r.lastTap>.7?'—':r.lastFoot==='L'?'L':'R';$('humanProgress').style.width=r.humanD+'%';$('enemyProgress').style.width=r.enemyD+'%';$('staminaBar').style.width=r.stamina*100+'%';$('burstPercent').textContent=Math.round(r.burstCharge);$('burstBar').style.width=r.burstCharge+'%';const diff=r.humanD-r.enemyD;$('diffLabel').textContent=diff>=0?'+'+diff.toFixed(1)+'m':'−'+Math.abs(diff).toFixed(1)+'m';$('diffLabel').style.color=diff>=0?'#dcff62':'#ffb678';$('burstTxt').textContent=r.burstLeft>0?'スパート中':r.burstCharge>=99?'使用できます':'ためる'}
$('beastTypeFilter')?.addEventListener('change',renderBeasts);$('beastSearch')?.addEventListener('input',renderBeasts);

// Developer tools: destructive reset is always confirmed; tests never alter the saved career.
function closeTools(){
 $('resetDialog').hidden=true;
 $('debugDialog').hidden=true;
}
function refreshDebugStatus(){
 const d=$('debugReadout');if(!d)return;
 const render=renderer?.info?.render||{},memory=renderer?.info?.memory||{};
 let context='不明';
 try{context=renderer.getContext().isContextLost?.()?'切断中':'有効'}catch(err){context='取得失敗'}
 const phase=race?.phase||'-';
 const active=race&&animals[race.opponentIndex]?animals[race.opponentIndex].name:animals[save.chosen]?.name;
 const seconds=race&&Number.isFinite(race.time)?race.time.toFixed(2):'-';
 d.textContent='実行: '+(debugMode?'デバッグ（セーブ保存停止）':'通常')+
  '\n3D: '+context+' / draw calls '+(render.calls??0)+' / polygons '+(render.triangles??0)+
  '\ngeometry '+(memory.geometries??0)+' / textures '+(memory.textures??0)+
  '\nモード: '+mode+' / レース状態: '+phase+' / '+active+
  '\nタイム: '+seconds+' 秒 / 人間 '+(race?.humanD?.toFixed(1)??'-')+
  'm / 動物 '+(race?.enemyD?.toFixed(1)??'-')+'m'+
  '\n3D写真: '+(racePicture?'取得済み（'+racePicture.width+'×'+racePicture.height+'）':'未撮影')+
  '\nデバッグで育成・勝利しても元のセーブは変更しません。';
}
$('resetProgress')?.addEventListener('click',()=>{
 closeTools();$('resetDialog').hidden=false;
});
$('resetCancel')?.addEventListener('click',closeTools);
$('resetConfirm')?.addEventListener('click',()=>{
 try{
  localStorage.removeItem('animal100m_v4');
  window.location.reload();
 }catch(err){
  $('resetDialog').querySelector('p').textContent='セーブを消去できませんでした。端末の保存設定を確認してください。';
 }
});
function fillDebugControls(){
 const picker=$('debugAnimal');
 picker.replaceChildren();
 animals.forEach((animal,index)=>{
  const opt=document.createElement('option');
  opt.value=String(index);opt.textContent=(index+1)+'. '+animal.name+'（'+animal.group+'）';
  picker.appendChild(opt);
 });
 picker.value=String(save.chosen);
 $('debugMoney').value=String(save.money);
 for(const [key,id] of [['speed','debugSpeed'],['power','debugPower'],['stamina','debugStamina'],['technique','debugTechnique']])
  $(id).value=String(save.stats[key]||1);
 refreshDebugStatus();
}
function openDebugTools(){
 closeTools();
 fillDebugControls();
 $('debugDialog').hidden=false;
}
$('debugOpen')?.addEventListener('click',openDebugTools);
// Seven taps on the menu title reveal the existing debug console; no onscreen button.
let titleTapCount=0,titleTapStarted=0,titleTapPrevious=0;
$('debugTitleTap')?.addEventListener('click',()=>{
 if(mode!=='menu'||!$('debugDialog').hidden)return;
 const now=Date.now();
 if(now-titleTapStarted>5000||now-titleTapPrevious>1700){
  titleTapCount=0;
  titleTapStarted=now;
 }
 titleTapPrevious=now;
 if(++titleTapCount>=7){
  titleTapCount=0;
  titleTapStarted=0;
  titleTapPrevious=0;
  openDebugTools();
 }
});
$('debugRefresh')?.addEventListener('click',refreshDebugStatus);
$('debugClose')?.addEventListener('click',closeTools);
$('debugExit')?.addEventListener('click',()=>{
 if(debugMode)window.location.reload();
 else closeTools();
});
function startDebugTrial(photoTest=false){
 // Apply values to the in-memory save only. Saved level, unlocked stages,
 // character creation and records remain intact after a normal reload.
 const idx=Number($('debugAnimal').value);
 if(!Number.isInteger(idx)||idx<0||idx>=animals.length)return;
 const numeric=(id,min,max,fallback)=>{
  const val=Number($(id).value);
  return Number.isFinite(val)?Math.round(clamp(val,min,max)):fallback;
 };
 debugMode=true;
 save.chosen=idx;
 save.money=numeric('debugMoney',0,999999,save.money);
 for(const [key,id] of [['speed','debugSpeed'],['power','debugPower'],['stamina','debugStamina'],['technique','debugTechnique']])
  save.stats[key]=numeric(id,1,50,save.stats[key]||1);
 $('debugOpen').textContent='デバッグ中';
 closeTools();
 race=null;
 showScreen('menu');
 refreshOpponent();
 startRace();
 if(photoTest&&race){
  // Isolated, non-persistent finish used to inspect the actual 3D podium,
  // winner necklace, photo save, and native share without replaying a race.
  race.phase='running';
  race.count=0;race.time=3.14;
  race.humanD=100;race.enemyD=100;
  race.hFinish=3.14;race.eFinish=2.95;
  race.humanV=0;race.enemyV=0;race.drive=0;
  race.pegasusExitDone=true;
  finishRace();
 }
}
$('debugRace')?.addEventListener('click',()=>startDebugTrial(false));
$('debugPhoto')?.addEventListener('click',()=>startDebugTrial(true));
// The overlay is a test console, not an always-running heavy profiler.
setInterval(()=>{if(!$('debugDialog').hidden)refreshDebugStatus()},1000);

$('startBtn').addEventListener('click',startRace);$('goCustom').addEventListener('click',()=>showScreen('custom'));
document.querySelectorAll('[data-screen]').forEach(b=>b.addEventListener('click',()=>showScreen(b.dataset.screen)));document.querySelectorAll('[data-back]').forEach(b=>b.addEventListener('click',()=>showScreen('menu')));
const heldFootPointers=new Map();
// A suspended WebView can swallow pointerup. Clear stale fingers so the next
// tap is never misclassified as a simultaneous press after app resume.
function releaseAllFootPointers(){
 heldFootPointers.clear();
 if(race&&race.phase==='running'){
  race.lastFoot='';
  race.sideStreak=0;
  race.combo=0;
  race.drive=0;
  race.lastTap=-999;
  race.humanV=0;
  race.lateralTarget=race.lateral;
 }
}
document.addEventListener('visibilitychange',()=>{if(document.hidden)releaseAllFootPointers()});
window.addEventListener('blur',releaseAllFootPointers);

for(const [side,id] of [['L','leftTap'],['R','rightTap']]){
 const el=$(id);
 el.addEventListener('pointerdown',e=>{
  e.preventDefault();
  if(heldFootPointers.has(e.pointerId))return;
  const overlap=Array.from(heldFootPointers.values()).some(v=>v!==side);
  heldFootPointers.set(e.pointerId,side);
  try{el.setPointerCapture(e.pointerId)}catch(_){}
  tap(side,overlap);
 });
 const release=e=>heldFootPointers.delete(e.pointerId);
 el.addEventListener('pointerup',release);
 el.addEventListener('pointercancel',release);
 el.addEventListener('lostpointercapture',release);
 el.addEventListener('contextmenu',e=>e.preventDefault());
}
$('burstBtn').addEventListener('pointerdown',e=>{e.preventDefault();activateBurst()});
let swipeStart=null;
$('raceControls').addEventListener('pointerdown',e=>{if(e.target.id==='burstBtn'){swipeStart={x:e.clientX,y:e.clientY,id:e.pointerId}}});
$('raceControls').addEventListener('pointerup',e=>{if(!swipeStart||e.pointerId!==swipeStart.id)return;if(swipeStart.y-e.clientY>38)activateBurst();swipeStart=null});
$('raceControls').addEventListener('pointercancel',()=>swipeStart=null);$('resultHome').addEventListener('click',()=>{race=null;showScreen('menu');refreshOpponent()});$('retryBtn').addEventListener('click',()=>{const replayIndex=race?.opponentIndex;race=null;if(Number.isInteger(replayIndex)&&replayIndex>=0&&replayIndex<animals.length)save.chosen=replayIndex;showScreen('menu');refreshOpponent();startRace()});
const raceUrl='https://techmew.github.io/human-vs-beasts/';
const raceCaption=()=>{
 const me=Number.isFinite(race?.hFinish)?race.hFinish.toFixed(2):null;
 const rival=Number.isFinite(race?.eFinish)?race.eFinish.toFixed(2):null;
 const gap=me!==null&&rival!==null?Math.abs(Number(me)-Number(rival)).toFixed(2):null;
 const tag='#'+raceName.replace(/[^ぁ-んァ-ヶー一-龯A-Za-z0-9]/g,'');
 const hook=lastResultWon
  ?'【'+raceName+'を撃破】人間が100mで勝った！？'
  :gap?'【'+gap+'秒差で敗北】'+raceName+'にあと一歩届かない。'
  :'【'+raceName+'との100m決戦】まだ勝てない。';
 const times=me!==null?'自分'+me+'秒'+(rival!==null?'、相手'+rival+'秒。':'。'):'人間は未完走。';
 return hook+'\n'+times+(lastResultWon?'次は誰に勝てる？':'育成でこの差、ひっくり返せる？')+'\n#ブラウザゲーム '+tag;
};
// Timeout-protected frame wait for Android WebViews and background tabs.
function waitForPodiumFrames(count=2,timeoutMs=900){
 return new Promise(resolve=>{
  let settled=false,frames=0;
  const complete=ok=>{if(settled)return;settled=true;clearTimeout(timer);resolve(ok)};
  const timer=setTimeout(()=>complete(false),timeoutMs);
  const tick=()=>{
   if(settled)return;
   if(++frames>=count)complete(true);
   else requestAnimationFrame(tick);
  };
  try{requestAnimationFrame(tick)}catch(err){complete(false)}
 });
}
async function raceImageBlob(){
 // A successfully captured 3D photo lives in a 2D canvas and does NOT
 // require a functioning WebGL context for encoding, download or sharing.
 // Android often loses WebGL when the system share sheet opens.
 if(!racePicture&&webglUnavailable){
  $('shareHelp').textContent='3D描画の復旧待ちです。復旧後に保存・共有を再試行してください。';
  return null;
 }
 if(!racePicture&&!ceremonyStage)makeRacePhoto();
 if(!racePicture&&ceremonyStage){
  podiumRetryAttempts=0;podiumRetryFrame=0;
  for(let attempt=0;attempt<4&&!racePicture&&ceremonyStage;attempt++){
   // A user-initiated Save/Share must attempt a real 3D capture immediately.
   // Android WebView can pause requestAnimationFrame while its share sheet is
   // opening, so awaiting two frames BEFORE the first capture loses the tap.
   // Later retries may wait for a fresh animation frame if the first readback
   // failed; never wait if a valid snapshot has already been captured.
   if(attempt>0){
    const framesReady=await waitForPodiumFrames(2,900);
    if(!framesReady){
     $('shareHelp').textContent='画面復帰後に写真保存・共有を再試行してください。';
     return null;
    }
   }
   if(webglUnavailable||!ceremonyStage)break;
   podiumRetryAttempts=attempt;
   try{
    ceremonyStage.scene.updateMatrixWorld(true);
    ceremonyStage.camera.updateMatrixWorld(true);
    renderer.setRenderTarget(null);
    renderer.render(ceremonyStage.scene,ceremonyStage.camera);
    captureCeremonyPhoto();
   }catch(err){console.warn('Manual 3D podium capture failed',err)}
  }
 }
 if(!racePicture)return null;
 if(raceShareCanvas===racePicture&&raceShareBlob)return raceShareBlob;
 const canvas=racePicture;
 // A captured photo remains exportable after WebGL context loss or stage disposal.
 // Android WebViews may implement JPEG toBlob while PNG toBlob fails.
 // Export the already validated 3D frame; never recapture or substitute artwork.
 // Keep the async operation bounded and reject callbacks from an obsolete race.
 if(typeof canvas.toBlob==='function'){
  for(const format of ['image/png','image/jpeg']){
   if(canvas!==racePicture)return null;
   try{
    const blob=await new Promise(resolve=>{
     let settled=false;
     const complete=value=>{if(settled)return;settled=true;clearTimeout(timeout);resolve(value)};
     const timeout=setTimeout(()=>complete(null),1400);
     try{canvas.toBlob(complete,format,format==='image/jpeg'?.88:undefined)}
     catch(err){complete(null)}
    });
    if(canvas!==racePicture)return null;
    if(blob&&blob.size>=2048&&blob.type===format){raceShareCanvas=canvas;raceShareBlob=blob;return blob}
   }catch(err){console.warn('Canvas '+format+' export unavailable',err)}
  }
 }
 // Both asynchronous encoders can be missing or time out. Try synchronous
 // formats against the same validated 3D pixels, with a minimum file size.
 for(const format of ['image/png','image/jpeg']){
  if(canvas!==racePicture)return null;
  try{
   const data=format==='image/jpeg'?canvas.toDataURL(format,.88):canvas.toDataURL(format);
   const match=/^data:(image\/(?:png|jpeg));base64,([A-Za-z0-9+/=]+)$/.exec(data);
   if(!match||match[1]!==format)continue;
   const bytes=atob(match[2]);
   if(bytes.length<2048)continue;
   const array=new Uint8Array(bytes.length);
   for(let i=0;i<bytes.length;i++)array[i]=bytes.charCodeAt(i);
   const blob=new Blob([array],{type:format});
   if(blob.size>=2048){raceShareCanvas=canvas;raceShareBlob=blob;return blob}
  }catch(err){console.warn('3D result photo '+format+' export failed',err)}
 }
 $('shareHelp').textContent='3D写真の書き出しに失敗しました。再撮影してから保存・共有してください。';
 return null;
}
async function saveRacePhoto(){
 const blob=await raceImageBlob();if(!blob){$('shareHelp').textContent='画像を生成できませんでした。';return false}
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='100m走_'+new Date().toISOString().slice(0,10)+(blob.type==='image/jpeg'?'.jpg':'.png');document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),45000);return true
}
$('downloadRace')?.addEventListener('click',()=>{saveRacePhoto()});
// Recover from a blank WebGL result without replaying the entire race.
// Rebuilds the customized human and the opponent from the finished race.
let recaptureBusy=false;
async function recaptureRacePhoto(){
 if(recaptureBusy||mode!=='race'||race?.phase!=='results')return false;
 if(webglUnavailable){$('shareHelp').textContent='3D描画の復旧待ちです。復旧後に再撮影してください。';return false}
 recaptureBusy=true;
 // A failed recapture must never destroy the previously validated 3D photograph.
 // Keep its actual canvas pixels available for download and X sharing.
 const previousPhoto=racePicture;
 const button=$('recaptureRace');
 button.disabled=true;button.textContent='3D写真を撮影中…';
 try{
  makeRacePhoto();
  if(!ceremonyStage){$('shareHelp').textContent='3Dモデルの作成に失敗しました。';return false}
  const ready=await waitForPodiumFrames(2,900);
  if(!ready||webglUnavailable||!ceremonyStage){
   $('shareHelp').textContent='描画が停止しています。画面復帰後に再撮影してください。';return false;
  }
  for(let attempt=0;attempt<4&&!racePicture&&ceremonyStage;attempt++){
   podiumRetryAttempts=attempt;
   renderer.setRenderTarget(null);
   renderer.render(ceremonyStage.scene,ceremonyStage.camera);
   if(captureCeremonyPhoto())break;
   if(attempt<3&&!await waitForPodiumFrames(2,900))break;
  }
  if(!racePicture){$('shareHelp').textContent='3D表彰台の撮影に失敗しました。再撮影できます。';return false}
  return true;
 }catch(err){
  console.warn('Manual podium rebuild failed',err);
  $('shareHelp').textContent='再撮影に失敗しました。画面復帰後にお試しください。';
  return false;
 }finally{
  if(!racePicture&&previousPhoto){
   racePicture=previousPhoto;
   cacheRaceSharePhoto(previousPhoto);
   if(ceremonyStage)ceremonyStage.photoCaptured=true;
   try{showCapturedPodiumCanvas(previousPhoto)}catch(err){console.warn('Previous 3D photo preview unavailable',err)}
   $('shareHelp').textContent='再撮影できませんでした。前の3D写真は保存・共有できます。';
  }
  recaptureBusy=false;button.disabled=false;button.textContent='3D写真を再撮影';
 }
}
$('recaptureRace')?.addEventListener('click',recaptureRacePhoto);
$('shareRace')?.addEventListener('click',async()=>{
 const button=$('shareRace'),msg=raceCaption()+' '+raceUrl;
 // An X web-intent cannot attach files. Never silently post text-only.
 if(manualXSharePrepared){
  window.location.assign('https://twitter.com/intent/tweet?text='+encodeURIComponent(msg));
  return;
 }
 button.disabled=true;
 try{
  // Already-encoded image allows native share within the original tap gesture.
  const cached=raceShareCanvas===racePicture?raceShareBlob:null;
  if(cached&&typeof File==='function'&&navigator.share){
   const type=cached.type==='image/jpeg'?'image/jpeg':'image/png';
   const file=new File([cached],'100m-race-result.'+(type==='image/jpeg'?'jpg':'png'),{type});
   try{
    if(!navigator.canShare||navigator.canShare({files:[file]})){
     await navigator.share({files:[file],title:'動物と100m走',text:msg});
     $('shareHelp').textContent='写真付きで共有できます。Xを選択してください。';
     return;
    }
   }catch(err){
    if(err?.name==='AbortError')return;
    console.warn('Native photo sharing unavailable',err);
   }
  }
  const blob=cached||await raceImageBlob();
  if(!blob){
   $('shareHelp').textContent='3D写真がありません。「3D写真を再撮影」で写真を作成してください。画像なしのX投稿画面には移動しません。';
   return;
  }
  // Two-step browser fallback. Save the real 3D image first, then require
  // explicit photo attachment in X before posting; do NOT open text-only X.
  const url=URL.createObjectURL(blob),link=document.createElement('a');
  try{
   link.href=url;
   link.download='100m走_'+new Date().toISOString().slice(0,10)+(blob.type==='image/jpeg'?'.jpg':'.png');
   document.body.appendChild(link);link.click();link.remove();
  }catch(err){
   $('shareHelp').textContent='このブラウザは写真保存を制限しています。標準ブラウザで再試行してください。';
   return;
  }finally{setTimeout(()=>URL.revokeObjectURL(url),45000)}
  manualXSharePrepared=true;
  button.textContent='Xを開く（写真を添付）';
  $('shareHelp').textContent='写真を保存しました。次にXを開き、画像アイコンから保存した3D写真を添付してください。';
 }finally{button.disabled=false}
});
$('audioBtn').addEventListener('click',()=>{sfx=!sfx;$('audioBtn').textContent=sfx?'♪':'×';if(!sfx){stopAmbience();for(const player of Object.values(loadedCalls))player.pause()}else if(mode==='race'&&race?.phase==='running')startAmbience()});$('fullBtn').addEventListener('click',()=>{if(document.fullscreenElement)document.exitFullscreen?.();else document.documentElement.requestFullscreen?.().catch(()=>{})});
function keyFoot(code){return code==='KeyA'||code==='ArrowLeft'?'L':code==='KeyD'||code==='ArrowRight'?'R':null}
addEventListener('keydown',e=>{
 if(e.target?.tagName==='INPUT')return;
 if(['Space','ArrowLeft','ArrowRight','KeyA','KeyD'].includes(e.code))e.preventDefault();
 if(e.repeat)return;
 const side=keyFoot(e.code);if(side)tap(side);
 if(e.code==='Space')activateBurst();
 if(e.code==='Escape'&&mode!=='race')showScreen('menu');
});
// Drag the 3D model in studio, with direct pointer interaction.
let dragging=false,pointerStart=0;$('world').addEventListener('pointerdown',e=>{if(mode==='custom'||mode==='beasts'){dragging=true;pointerStart=e.clientX;$('world').setPointerCapture?.(e.pointerId)}});$('world').addEventListener('pointermove',e=>{if(dragging){camSpin+=(e.clientX-pointerStart)*.012;pointerStart=e.clientX}});$('world').addEventListener('pointerup',()=>dragging=false);$('world').addEventListener('pointercancel',()=>dragging=false);
function updateCam(dt){const d=race?.humanD||0;let wantedPos,wantedTarget;
 if(mode==='race'&&race?.phase==='pegasusExit'){
  // Stationary viewpoint behind the finish line; Pegasus shrinks into the sky.
  // Lock the viewpoint at the finish line. Tracking the animal's distance
  // previously kept it almost the same apparent size, defeating the flyaway.
  const finishLine=100;
  wantedPos=new T.Vector3(.2,5.8,finishLine-22);
  // Fixed upward view, rather than chasing the flying subject as it recedes.
  wantedTarget=new T.Vector3(animalX,48,finishLine+180);
  camera.fov=mix(camera.fov,innerWidth<innerHeight?60:51,Math.min(1,dt*2.8));camera.updateProjectionMatrix();
 }else{
 const monster=KAIJU_SPECS[animals[save.chosen]?.kind];
 const speciesHeight=SPECIES_HEIGHT_M[animals[save.chosen]?.kind]||1.7;
 if(mode==='race'&&monster){
  const portrait=innerWidth<innerHeight,side=clamp((race?.lateral??humanX)-humanX,-4,4);
  const back=monster.heightM*(portrait?1.6:1.3);
  wantedPos=new T.Vector3(-3.3+side*.4,monster.heightM*.63,d-back);
  wantedTarget=new T.Vector3(animalX*.5,monster.heightM*.4,d+12);
  camera.fov=mix(camera.fov,portrait?65:58,Math.min(1,dt*2.5));camera.updateProjectionMatrix();
 }
 else if(mode==='race'&&speciesHeight>3.3){
  // Retain a real-size human and a multi-metre animal in view simultaneously.
  const portrait=innerWidth<innerHeight,side=clamp((race?.lateral??humanX)-humanX,-4,4);
  const back=Math.max(portrait?12:10,speciesHeight*(portrait?2.7:2.1));
  wantedPos=new T.Vector3(-.7+side*.6,Math.max(3.1,speciesHeight*.70),d-back);
  wantedTarget=new T.Vector3(.1+side*.3,Math.max(1.45,speciesHeight*.39),d+12);
  camera.fov=mix(camera.fov,portrait?61:54,Math.min(1,dt*2.2));camera.updateProjectionMatrix();
 }
 else if(mode==='race'){const run=race?.humanV||0,portrait=innerWidth<innerHeight;const shake=run>2?Math.min(.052,run*.003):0;const side=clamp((race?.lateral??humanX)-humanX,-4,4);const small=speciesHeight<1.10;const back=portrait?(small?10.7:11.8):(small?7.7:9.2);wantedPos=new T.Vector3(.05+side*.60+Math.sin(sceneTime*12)*shake,portrait?(small?3.15:3.80):3.15,d-back);wantedTarget=new T.Vector3(.04+side*.60,portrait?1.0:1.30,d+(small?8:12));camera.fov=mix(camera.fov,(portrait?(small?60:62):(small?51:53))+(race?.burstLeft>0&&run>0?2:0),Math.min(1,dt*2.2));camera.updateProjectionMatrix()}
 else if(mode==='custom'){
  const portrait=innerWidth<innerHeight;
  const close=studioFaceTabs.has(customTab)&&!studioShowFull;
  const height=human.root.userData.worldHeightM||1.7;
  const focus={face:.85,brows:.93,eyes:.91,nose:.86,mouth:.81,hair:.96};
  // The body is normalized to 1.7m; the old hard-coded Y=2.12 looked above the head.
  const level=height*(close?(focus[customTab]||.85):.52);
  const radius=close?(portrait?1.73:1.35):(portrait?2.7:3.05);
  const angle=camSpin;
  wantedPos=new T.Vector3(humanX+Math.sin(angle)*radius,level+(close?.035:.17),Math.cos(angle)*radius);
  wantedTarget=new T.Vector3(humanX,level,0);
  camera.fov=mix(camera.fov,close?(portrait?65:49):(portrait?67:51),Math.min(1,dt*6));
  camera.updateProjectionMatrix();
 }
 else if(mode==='beasts'){const h=speciesHeight,r=monster?monster.heightM*1.55:clamp(h*2.4,3.2,18);wantedPos=new T.Vector3(animalX+Math.sin(camSpin+sceneTime*.12)*r,Math.max(.85,h*.65),Math.cos(camSpin+sceneTime*.12)*r);wantedTarget=new T.Vector3(animalX,h*.44,0);camera.fov=mix(camera.fov,innerWidth<innerHeight?55:48,Math.min(1,dt*3));camera.updateProjectionMatrix()}
 else if(mode==='train'){wantedPos=new T.Vector3(-2.7,2.45,7);wantedTarget=new T.Vector3(humanX,1.25,0)}
 else if(mode==='menu'&&monster){const b=monster.heightM*1.6;wantedPos=new T.Vector3(-b*.34,monster.heightM*.65,b);wantedTarget=new T.Vector3(animalX,monster.heightM*.42,0);camera.fov=mix(camera.fov,innerWidth<innerHeight?60:53,Math.min(1,dt*3));camera.updateProjectionMatrix()}
 else{const portrait=innerWidth<innerHeight;wantedPos=portrait?new T.Vector3(-4.1,2.95,12.8):new T.Vector3(-5.4,3.08,10.9);wantedTarget=portrait?new T.Vector3(0,1.15,0):new T.Vector3(-2.0,1.12,0);camera.fov=mix(camera.fov,portrait?55:50,Math.min(1,dt*2.5));camera.updateProjectionMatrix()}
 }
 const t=1-Math.exp(-Math.max(.0001,dt)*(mode==='race'?4.0:3.0));camPos.lerp(wantedPos,t);cameraTarget.lerp(wantedTarget,t);camera.position.copy(camPos);camera.lookAt(cameraTarget)}

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
 else if(fps>54)target=Math.min(max,renderQuality+.045);
 // Avoid pixel-ratio oscillation on devices hovering around 30-50 fps.
 if(Math.abs(target-renderQuality)>.015){renderQuality=target;renderer.setPixelRatio(renderQuality);renderer.setSize(innerWidth,innerHeight,false)}
}
// Four bounded screenshot attempts. Wait for genuine render frames before
// readback and reduce output resolution if the first attempt fails.
function renderCeremonyFrame(){
 if(!ceremonyStage||webglUnavailable)return;
 // A temporary context loss is not a failed photograph. The restored
 // event resumes capture without consuming the bounded retry budget.
 // The final image is a validated snapshot of the real 3D models. Rendering
 // the hidden WebGL canvas at 60 fps after its image loads wastes GPU time,
 // drains mobile batteries and can trigger Android context loss.
 // Keep rendering while the async image encoder is still preparing the preview.
 if(ceremonyStage.photoCaptured&&!$('resultPhoto').hidden)return;
 try{
  renderer.setRenderTarget(null);
  // The character editor leaves a right-side scissor/viewport active. Results
  // return before the normal frame resets it, so the podium can render into
  // only part of the drawing buffer and produce a blank/cropped photograph.
  renderer.setScissorTest(false);
  const podiumBuffer=renderer.getDrawingBufferSize(new T.Vector2());
  renderer.setViewport(0,0,podiumBuffer.x,podiumBuffer.y);
  fitPodiumCamera(ceremonyStage,podiumBuffer.x/Math.max(1,podiumBuffer.y));
  renderer.render(ceremonyStage.scene,ceremonyStage.camera);
  if(ceremonyStage.photoCaptured||podiumRetryAttempts>=4)return;
  podiumRetryFrame++;
  if(podiumRetryFrame<(podiumRetryAttempts===0?2:20))return;
  podiumRetryFrame=0;
  if(!captureCeremonyPhoto()){
   podiumRetryAttempts++;
   if(podiumRetryAttempts>=4)
    $('shareHelp').textContent='3D表彰台は表示中です。写真保存から再撮影できます。';
  }
 }catch(err){
  // A lost WebGL context or repeated renderer exception must not trigger
  // an unbounded render/exception loop on every animation frame.
  if(renderer.getContext().isContextLost?.()){
   webglUnavailable=true;
   podiumRetryFrame=0;
   return;
  }
  podiumRetryAttempts=4;
  podiumRetryFrame=0;
  console.warn('3D podium frame unavailable',err);
  $('shareHelp').textContent='3D表彰台の描画に失敗しました。写真保存から再試行できます。';
 }
}
// Android may discard the GPU context when sharing or switching apps.
// Suspend GPU work until restored and reconstruct the real 3D podium.
let webglUnavailable=false;
renderer.domElement.addEventListener('webglcontextlost',event=>{
 event.preventDefault();
 webglUnavailable=true;
 if(mode==='race'&&race?.phase==='results')
  $('shareHelp').textContent='3D描画を復旧しています。復旧後に写真を再撮影できます。';
},false);
renderer.domElement.addEventListener('webglcontextrestored',()=>{
 webglUnavailable=false;
 // Restore a fresh capture budget after GPU resources have been rebuilt.
 // Do not discard an already validated 3D photograph.
 if(!racePicture){podiumRetryAttempts=0;podiumRetryFrame=0;}
 clock.getDelta();
 if(mode==='race'&&race?.phase==='results'){
  // Preserve a validated photo and its image/canvas preview. Rebuilding
  // the podium here destroyed the photo just as Android returned from Share.
  if(!racePicture)makeRacePhoto();
  else if(ceremonyStage&&!$('result3DWindow').hidden){
   const view=$('result3DWindow');
   const w=Math.max(320,view.clientWidth||340),h=Math.max(180,view.clientHeight||192);
   // Context restoration must not leave the global race renderer at the
   // result-card dimensions. Preserve the full-screen drawing buffer for
   // replay, character editing and future podium captures.
   const previousPixelRatio=renderer.getPixelRatio();
   const previousSize=renderer.getSize(new T.Vector2());
   try{
    renderer.setRenderTarget(null);
    renderer.setScissorTest(false);
    renderer.setPixelRatio(Math.min(1.4,devicePixelRatio||1));
    renderer.setSize(w,h,false);
    const buffer=renderer.getDrawingBufferSize(new T.Vector2());
    renderer.setViewport(0,0,buffer.x,buffer.y);
    fitPodiumCamera(ceremonyStage,w/h);
    renderer.render(ceremonyStage.scene,ceremonyStage.camera);
   }finally{
    renderer.setPixelRatio(previousPixelRatio);
    renderer.setSize(previousSize.x,previousSize.y,false);
    const buffer=renderer.getDrawingBufferSize(new T.Vector2());
    renderer.setViewport(0,0,buffer.x,buffer.y);
    renderer.setScissorTest(false);
   }
  }
 }else initResize();
},false);
let humanGait=0,beastGait=0;function frame(){requestAnimationFrame(frame);
 // Keep visual animation capped at 65ms, but advance race physics using the
 // actual elapsed frame time in bounded substeps. Low-FPS Android devices
 // must not make the 100m clock and countdown run in slow motion.
 const elapsed=clock.getDelta(),dt=Math.min(.065,elapsed),raceDt=Math.min(.25,elapsed);
 sceneTime+=dt;
 if(webglUnavailable)return;
 if(mode==='race'&&race?.phase==='results'){renderCeremonyFrame();return}
 if(mode==='race'&&race?.phase==='pegasusExit')advancePegasusFlight(dt);
 else if(mode==='race')updateRace(raceDt);
 if(mode==='race'&&race?.phase==='pegasusExit'&&race.pegasusExitWait===0)advancePegasusFlight(dt);
 if(mode==='race'&&race?.phase==='running'&&race.eFinish!==null&&animals[race.opponentIndex]?.kind==='pegasus')advancePegasusFlight(dt);
 if(mode==='race'&&race?.phase==='results'){renderCeremonyFrame();return}
 // Visual animations use actual runner and opponent speeds
 const hspeed=mode==='race'&&race?.phase==='running'&&race.hFinish===null?(race.humanV||0):0;
 const visualPegasus=mode==='race'&&animals[race?.opponentIndex]?.kind==='pegasus'&&(race?.phase==='pegasusExit'||race?.eFinish!==null);
 const espeed=visualPegasus?(race.pegasusFlightSpeed||22):mode==='race'&&race?.phase==='running'&&race.eFinish===null?(race.enemyV||0):mode==='beasts'&&animals[save.chosen]?.kind==='pegasus'?6:0;
 if(hspeed>.13)humanGait+=dt*(6.8+clamp(hspeed/8,0,1.7)*4.3);if(espeed>.13)beastGait+=dt*animalGaitRate(animals[Number.isInteger(race?.opponentIndex)?race.opponentIndex:save.chosen].kind,espeed);human.animate(humanGait,hspeed,mode==='race'?race.stamina:1,mode==='race'?race.legTaps:null,mode==='race'?race.time:0,dt);
 
 const hasLanded=opponent.animate(beastGait,espeed,mode==='beasts'?40:visualPegasus?(race.pegasusBeyond??race.enemyD):race?.enemyD||0);
 if(hasLanded&&mode==='race'&&race?.phase==='running'&&race.eFinish===null&&espeed>2){
  const kind=animals[Number.isInteger(race?.opponentIndex)?race.opponentIndex:save.chosen].kind,gait=GAIT_MAP[kind];
  const gap=['heavyTrot','heavyBiped','mechanicalRun'].includes(gait)?.22:gait==='kangarooHop'||gait==='bound'?.26:.13;
  if(race.time-race.lastRivalImpact>gap){
   race.lastRivalImpact=race.time;animalFootstep(kind,espeed);
   // Emit impact dust on the actual animation landing, not on random frames.
   kickDust(race.enemyLateral,race.enemyD,espeed);
   if(['heavyTrot','heavyBiped','mechanicalRun'].includes(gait))
    kickDust(race.enemyLateral+.36,race.enemyD-.30,espeed);
  }
 }
 if(mode!=='race'){human.root.position.z=0;opponent.root.position.z=0;opponent.root.position.y=.13;opponent.root.visible=true;human.root.rotation.y=(mode==='custom')?Math.sin(sceneTime*.3)*.03:0;opponent.root.rotation.y=0}
 dust.forEach(x=>{if(x.life>0){x.life-=dt;x.mesh.scale.multiplyScalar(1+dt*1.55);x.mesh.position.y+=dt*.16;x.mesh.material.opacity=Math.max(0,.20*x.life/x.max);if(x.life<=0)x.mesh.visible=false}});
 scuffs.forEach(x=>{if(x.life>0){x.life-=dt;x.mesh.material.opacity=Math.max(0,.13*x.life/x.max);if(x.life<=0)x.mesh.visible=false}});
 adaptQuality(dt);updateCam(dt);sun.position.z=(mode==='race'?race.humanD:0)+24;sun.target.position.z=mode==='race'?race.humanD:0;sun.target.updateMatrixWorld();
 // A dedicated right-hand WebGL viewport ensures the editor never obscures the avatar.
 // Reset full viewport on every non-studio frame for race, results and screenshots.
 if(mode==='custom'){
  const x=Math.floor(innerWidth*(innerWidth<innerHeight?.53:.44));
  const w=Math.max(1,innerWidth-x);
  renderer.setViewport(x,0,w,innerHeight);
  renderer.setScissor(x,0,w,innerHeight);
  renderer.setScissorTest(true);
  camera.aspect=w/innerHeight;
 }else{
  renderer.setScissorTest(false);
  renderer.setViewport(0,0,innerWidth,innerHeight);
  camera.aspect=innerWidth/innerHeight;
 }
 camera.updateProjectionMatrix();
 renderer.render(scene,camera)
}
// Replace synthetic expression typo guard for minifier-safe runtime.
renderCustom();renderTraining();renderBeasts();refreshMenu();showScreen('menu');requestAnimationFrame(frame);loader.style.display='none';
})();