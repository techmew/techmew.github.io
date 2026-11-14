"use strict";
/* Hand-pixelled raster renderer. No external sprites or copyrighted assets. */
(function(){
const cache=new Map(),T=48,S=2,TAU=Math.PI*2;
const C={
 ink:"#1b233c",deep:"#26344d",lite:"#faf5e2",ice:"#eefbff",
 skin:"#f4c49a",skinShadow:"#dc936f",skinHi:"#ffe1b5",
 coat:"#de6b68",coatShadow:"#983e5c",coatHi:"#fe9b7a",
 navy:"#314a70",navyLight:"#6684ad",boot:"#302940",bootHi:"#667185"
};
const pal=[
{sky:["#5089d5","#6cace6","#91c8e9","#c4e6db"],hills:["#b4d6a9","#71b68f","#468e79"],solid:["#654337","#966b4d","#bd8d57"],green:["#326a58","#5fbb78","#a1dc84"],brick:["#6b3944","#b66f59","#dc9b66"],light:"#e5ed9c"},
{sky:["#6599d2","#83b9e3","#d0c7b2","#e9d5b3"],hills:["#dec7a0","#d9a875","#b77f58"],solid:["#755046","#a57c55","#d0ac6b"],green:["#916f4e","#c5a26a","#f5db93"],brick:["#81514a","#b77d59","#dbad7a"],light:"#fff0b4"},
{sky:["#477fa7","#74ada7","#99c3af","#c7dbb6"],hills:["#83b78f","#3e917a","#2f6b6a"],solid:["#594c3a","#897758","#b5a075"],green:["#256950","#42a27a","#8bce9c"],brick:["#62544a","#a47f5f","#c0a77d"],light:"#dceeb0"},
{sky:["#396eac","#568db9","#77b5d1","#9dd9de"],hills:["#72bbca","#488cac","#345c86"],solid:["#455471","#5b789b","#85a5ad"],green:["#245c81","#3498a2","#75c6ca"],brick:["#4f5f80","#6e96b8","#a6c7d2"],light:"#b9fbff"},
{sky:["#4f87cc","#81aee0","#afcce9","#e0f0f3"],hills:["#e3ebeb","#aacdde","#7eaacb"],solid:["#536981","#6d91ae","#a7c6d8"],green:["#7197bd","#c5e4ed","#f6ffff"],brick:["#597b9b","#97b5d1","#d1e8f2"],light:"#fcffff"},
{sky:["#4a7db7","#80b4e0","#b3d9eb","#d8eff5"],hills:["#cadfdf","#8ebbd0","#6b9fb8"],solid:["#555b87","#7a80b2","#b0a3c5"],green:["#6ba9bd","#a9d8cf","#e9f6d7"],brick:["#616d9c","#8a9fc4","#becfe1"],light:"#ffffda"},
{sky:["#392d60","#5b467d","#9b648a","#d09394"],hills:["#956d90","#724d83","#423960"],solid:["#49364c","#74516f","#aa718c"],green:["#58487e","#9e6398","#db95c0"],brick:["#593d67","#a66c95","#d99bb6"],light:"#f7bdc3"},
{sky:["#211d39","#402744","#753344","#b24f48"],hills:["#833b4c","#673441","#3e293d"],solid:["#3a303e","#6a4451","#a85b5d"],green:["#833749","#c35952","#fc9161"],brick:["#48364b","#8a5260","#d57b6d"],light:"#ffcb86"}
];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),rnd=(n)=>{n|=0;n=Math.imul(n^n>>>16,0x7feb352d);n=Math.imul(n^n>>>15,0x846ca68b);return ((n^n>>>16)>>>0)/4294967296;};
const rect=(g,x,y,w,h,c)=>{if(w<=0||h<=0)return;g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.ceil(w),Math.ceil(h))};
function sprite(w,h,paint){const cv=document.createElement("canvas");cv.width=w;cv.height=h;const a=cv.getContext("2d",{alpha:true});a.imageSmoothingEnabled=false;
 const b=(x,y,ww,hh,c)=>rect(a,x,y,ww,hh,c);
 const e=(x,y,rx,ry,c)=>{for(let yy=Math.max(0,Math.floor(y-ry));yy<=Math.min(h-1,Math.ceil(y+ry));yy++)for(let xx=Math.max(0,Math.floor(x-rx));xx<=Math.min(w-1,Math.ceil(x+rx));xx++){if(((xx+.5-x)/rx)**2+((yy+.5-y)/ry)**2<1)b(xx,yy,1,1,c)}};
 const l=(x1,y1,x2,y2,c,th=1)=>{let dx=Math.abs(x2-x1),sx=x1<x2?1:-1,dy=-Math.abs(y2-y1),sy=y1<y2?1:-1,er=dx+dy,x=Math.round(x1),y=Math.round(y1);for(let i=0;i<120;i++){b(x-Math.floor(th/2),y-Math.floor(th/2),th,th,c);if(x===Math.round(x2)&&y===Math.round(y2))break;let f=2*er;if(f>=dy){er+=dy;x+=sx}if(f<=dx){er+=dx;y+=sy}}};
 paint({b,e,l,w,h});return cv;
}
function cached(key,w,h,fn){if(cache.has(key))return cache.get(key);const v=sprite(w,h,fn);cache.set(key,v);return v}
function shinePixel(P,seed,x,y,w,h,colors,freq=.3){
 for(let i=0;i<w*h;i++){if(rnd(i*37+seed*821)<freq){const xx=i%w,yy=Math.floor(i/w);P.b(x+xx,y+yy,1,1,colors[Math.floor(rnd(i*31+seed)*colors.length)])}}
}
function heroArt(suit="normal",pose="idle",frame=0){
 const key="hero:"+suit+":"+pose+":"+frame;
 return cached(key,38,53,P=>{
 const {b,e,l}=P,step=pose==="run"?[-3,-2,0,3,2,0][frame%6]:0,
 jump=pose==="jump",fall=pose==="fall",attack=pose==="attack";
 const jack={normal:["#d76165","#933b54","#ff9d80"],grow:["#4584b2","#274975","#7dc5d9"],fire:["#f3eecc","#b7a8a5","#fffef1"],leaf:["#65aa7c","#336b68","#a5e2ab"],frog:["#58b69d","#327679","#a5f3c4"],hammer:["#8b8ec7","#454c84","#c6c9ec"],cloak:["#9a77c6","#654f91","#d4acf4"]}[suit]||["#df696e","#943e60","#ffb3a1"];
 const coat=jack[0],shadow=jack[1],hi=jack[2];
 // Capes, wings and tail behind the silhouette
 if(suit==="cloak"){b(6,24,25,22,C.ink);b(8,25,21,20,"#8560aa");for(let i=0;i<4;i++)b(10+i*5,44,3,2,"#be96e0")}
 if(suit==="leaf"){l(7,28,1,18,"#29674f",4);e(3,17,6,9,"#63b980");b(2,12,5,2,"#b9ef98")}
 if(suit==="frog"){b(4,28,30,17,"#1d6371");e(19,31,17,13,"#65c09f")}
 // independently animated legs and shoes
 const legA=jump?-4:fall?3:step,legB=jump?4:fall?-3:-step;
 const xA=10+legA,xB=24+legB;
 b(8,35,25,6,C.ink);b(9,35,22,4,C.navy);b(xA-2,37,8,11,C.ink);b(xB-2,37,8,11,C.ink);
 b(xA-1,38,6,7,"#5379a1");b(xB-1,38,6,7,"#5379a1");
 b(xA-4,46,13,5,C.ink);b(xB-4,46,13,5,C.ink);
 b(xA-2,47,10,3,C.bootHi);b(xB-2,47,10,3,C.bootHi);
 b(xA+4,49,4,1,"#a2bed4");b(xB+4,49,4,1,"#a2bed4");
 // body, waist, tunic and cross-belt
 e(19,30,13,12,C.ink);e(19,29,11,11,coat);b(9,27,18,6,hi);
 b(10,35,18,3,shadow);b(11,30,16,2,coat);
 l(13,24,23,36,shadow,3);b(21,33,4,4,"#f8d58b");b(22,34,2,2,"#fff7c5");
 // arms physically extend on the attack frames
 const armY=attack?22:28;
 l(10,25,attack?4:6,attack?18:31,C.ink,8);l(10,26,attack?5:6,attack?19:31,coat,5);
 l(29,24,attack?37:30,armY,C.ink,8);l(29,25,attack?35:30,armY,coat,5);
 e(attack?35:30,armY,4,4,C.ink);e(attack?35:30,armY,3,3,C.skinHi);
 if(suit==="hammer"&&attack){l(34,20,37,8,C.boot,3);b(30,5,8,8,C.ink);b(31,6,7,5,"#c6d7ef");b(32,7,4,1,"#ffffff")}
 // neck, head 4-tone shaded hand pixels
 b(15,23,9,5,C.ink);b(16,23,7,4,C.skinShadow);
 e(19,15,13,12,C.ink);e(19,15,11,10,C.skin);b(11,16,5,7,C.skinHi);b(23,17,6,6,C.skinShadow);
 b(27,17,4,4,C.skinShadow);b(28,18,3,2,C.skinHi);b(26,18,2,2,C.ink);
 b(25,14,3,4,C.ink);b(25,14,2,3,"#fff8e1");b(26,14,1,3,C.ink);
 b(23,22,5,2,"#753f47");b(13,23,7,2,"#6c3b49");
 // animated eyes & expression
 if(frame%13===11&&pose==="idle")b(24,16,5,2,C.ink);
 // hair & cap pixel-stepped
 b(8,10,24,5,C.ink);b(9,8,20,5,"#1c3e61");b(12,5,17,6,suit==="fire"?"#fff0d0":suit==="hammer"?"#8b91c0":"#35b4d4");
 b(11,7,16,2,hi);b(9,12,24,3,"#2c7299");b(26,12,9,3,"#1e4d72");b(27,13,6,1,"#80d3da");
 b(18,8,4,4,"#fff1cd");b(19,9,2,2,"#f3bb61");
 if(suit==="frog"){b(10,6,20,6,"#2a775c");b(12,4,7,6,"#75deaa");b(22,4,7,6,"#75deaa");b(14,5,2,2,C.ink);b(24,5,2,2,C.ink)}
 if(suit==="leaf"){l(15,8,11,1,"#356e57",2);e(10,3,6,3,"#96d6a1")}
 if(suit==="cloak"){b(10,4,22,6,"#c499ec");b(13,2,11,4,"#734b9d")}
 // little tunic and fabric flecks
 b(9,29,3,3,shadow);b(25,28,3,3,shadow);
 b(14,32,3,2,"#ffcaa1");b(21,28,3,2,hi);
 });
}
function enemyArt(kind,phase=0,world=1,shadow=false,attacking=false){
 const key="enemy:"+kind+":"+phase+":"+world+":"+(shadow?1:0)+":"+(attacking?1:0);
 const isBoss=kind==="boss",w=isBoss?58:36,h=isBoss?60:43;
 return cached(key,w,h,P=>{
 const {b,e,l}=P,wig=[-2,-1,2,1][phase%4],ink=shadow?"#1a1738":C.ink,
 cl={
 walker:["#cc7995","#aa526f","#ffc1b2"],beetle:["#66af9a","#3d7f8d","#c5eeba"],
 spike:["#cc7197","#8e4978","#f7c0c4"],flyer:["#8d92ce","#526a9f","#e0e7f9"],
 fish:["#6fc2c8","#418cba","#f2d997"],plant:["#d97876","#5e9a75","#ffddaa"],
 ghost:["#d5d5f8","#9299ca","#ffffff"],thrower:["#ba9584","#657da1","#f7d4aa"],
 launcher:["#677e9b","#384b72","#c5d9e5"]
 }[kind]||["#b27d9e","#785985","#eec6c0"];
 if(isBoss){
 const colors=["#b96567","#d8a36c","#67b29b","#629ebc","#9dbedc","#9a87cc","#9962af","#dc685e"];
 const main=colors[(world-1)%8],armor=shadow?"#463457":"#3b3859";
 e(29,30,26,24,ink);e(29,29,24,22,main);e(24,27,10,12,"#ffffff23");b(15,35,28,10,armor);
 // boots and heavy motion
 b(10,47+wig,16,10,ink);b(36,47-wig,14,10,ink);
 b(12,49+wig,13,6,armor);b(37,49-wig,12,6,armor);
 // horns per-biome silhouette
 for(let z=0;z<3;z++){const xx=12+z*15;for(let t=0;t<11+z%2*5;t++)b(xx+t/5,11-t,10-t/4,2,world===8?"#ffdca0":world===5?"#e9faff":"#ffdbb0")}
 e(17,28,8,8,ink);e(40,28,8,8,ink);e(19,28,5,6,"#fff6cf");e(41,28,5,6,"#fff6cf");
 b(21,26,4,7,ink);b(42,26,4,7,ink);b(23,42,19,5,ink);b(26,44,3,5,"#fcf4d5");b(35,44,3,5,"#fcf4d5");
 l(11,31,3,41+wig,ink,10);l(49,30,attacking?56:55,attacking?16:43-wig,ink,10);l(11,31,6,38+wig,main,7);l(49,30,attacking?55:52,attacking?19:38-wig,main,7);if(attacking){e(54,15,3,4,"#ffe7b5");e(48,14,2,2,"#fff8d2")};
 if(world===4){for(let j=0;j<5;j++)l(11+j*9,40,4+j*12,57+(j%2?-wig:wig),"#7bd2ce",4)}
 if(world===8)for(let i=0;i<5;i++)b(i*9+5,12-i%2*6,6,5,"#fbc070");
 b(18,17,20,2,"#ffffff48");b(10,37,5,2,"#ffffff2a");
 return;
 }
 if(kind==="walker"){
 b(7,33+wig,11,8,ink);b(22,33-wig,11,8,ink);b(9,35+wig,9,4,"#855777");b(23,35-wig,8,4,"#855777");
 e(18,20,16,17,ink);e(18,19,14,15,cl[0]);e(14,15,8,10,cl[2]);b(24,19,5,9,cl[1]);
 b(12,13,5,7,ink);b(23,12,5,7,ink);b(13,14,3,5,"#fff4d7");b(24,13,3,5,"#fff4d7");
 b(15,16,2,4,ink);b(25,15,2,4,ink);b(17,27,9,3,"#7b435b");
 }else if(kind==="beetle"){
 b(6,34+wig,10,7,ink);b(22,34-wig,10,7,ink);
 e(18,22,16,17,ink);e(17,19,14,15,cl[1]);e(18,16,12,11,cl[0]);b(7,20,24,4,cl[2]);l(17,8,17,25,ink,2);
 e(26,23,6,7,cl[2]);b(27,20,4,5,ink);b(29,20,1,3,"#ffffff");
 }else if(kind==="spike"){
 for(let i=0;i<7;i++){const x=4+i*4;b(x,7+i%2*2,4,16,ink);b(x+1,9+i%2*2,2,12,"#f4bdd2")}
 e(18,24,15,14,ink);e(18,23,13,12,cl[0]);e(13,20,8,7,cl[2]);b(21,20,6,6,ink);b(22,21,4,4,"#fff2df");b(24,22,2,2,ink);
 b(6,35,9,5,ink);b(24,35,8,5,ink);
 }else if(kind==="flyer"){
 const wing=phase%2?8:-2;
 l(17,20,0,8+wing,ink,6);l(17,20,2,11+wing,cl[2],4);
 l(20,20,35,9+wing,ink,6);l(20,20,33,12+wing,cl[2],4);
 e(20,23,12,12,ink);e(20,22,10,10,cl[0]);b(24,18,5,5,"#fff8e5");b(27,19,2,3,ink);b(13,29,7,3,cl[1]);
 }else if(kind==="fish"){
 for(let y=0;y<20;y++)b(1+Math.floor(y/4),12+y,3,5,y%2?cl[1]:cl[0]);
 e(20,21,13,12,ink);e(20,20,11,10,cl[0]);b(23,15,6,5,"#f9f8e5");b(26,16,2,3,ink);b(29,26,4,2,cl[2]);b(13,14,6,3,cl[2]);
 }else if(kind==="plant"){
 b(14,23,8,18,ink);b(15,24,6,17,"#389b75");l(17,33,5,29,ink,6);l(17,33,5,29,"#72c28c",3);
 e(18,17+wig,15,13,ink);e(18,16+wig,13,11,cl[0]);b(23,15+wig,5,5,cl[2]);b(25,16+wig,3,3,ink);
 b(9,22+wig,19,attacking?6:3,ink);for(let i=0;i<4;i++)b(11+i*5,21+wig,2,attacking?6:3,"#fff5d8");if(attacking){b(28,18+wig,6,5,"#f7deaf");b(31,19+wig,4,3,"#d88767")};
 }else if(kind==="ghost"){
 for(let y=16;y<40;y++)b(5+Math.floor(y/6),y,24-y%5,1,ink);
 e(18,18,15,16,cl[1]);e(18,17,13,14,cl[2]);b(9,27,18,11,cl[0]);
 b(10,15,5,7,ink);b(24,15,5,7,ink);b(12,17,3,5,"#86a2ca");b(26,17,2,4,"#86a2ca");
 }else if(kind==="thrower"){
 b(7,34+wig,10,8,ink);b(23,34-wig,10,8,ink);e(18,26,15,14,ink);e(18,27,12,11,cl[1]);
 e(18,12,12,11,ink);e(19,12,10,9,cl[2]);b(23,12,5,5,ink);b(24,13,3,3,"#fff2e1");b(26,14,1,2,ink);
 b(7,4,24,6,ink);b(9,6,20,4,cl[1]);b(10,23,4,12,cl[0]);l(27,27,attacking?35:30,attacking?10:28,"#283f5d",6);l(27,27,attacking?34:30,attacking?12:28,cl[0],4);b(attacking?31:29,attacking?8:25+wig,6,5,cl[2]);if(attacking){b(28,3,7,4,"#f1c97e")};
 }else if(kind==="launcher"){
 b(5,19,27,21,ink);b(7,21,24,15,cl[1]);b(8,24,18,3,cl[0]);
 b(12,7,19,14,ink);b(13,9,18,11,cl[0]);e(28,14,7,8,ink);e(28,14,4,5,"#171e32");b(6,36,7,4,ink);b(26,36,7,4,ink);
 }
 b(2,38,4,2,"#ffffff22");
 });
}
function tileArt(L,id,ix,iy){
 const p=pal[(L.w-1)%8],upper=iy===10||!L.map[Math.max(0,iy-1)][ix],key="tile:"+L.w+":"+id+":"+(upper?1:0)+":"+((ix*3+iy*7)%5);
 return cached(key,24,24,P=>{
 const {b,l}=P,seed=ix*217+iy*71+L.w*11;
 if(id===1){
 b(0,0,24,24,p.solid[0]);b(1,1,22,22,p.solid[1]);
 for(let yy=2;yy<24;yy+=7)for(let xx=1;xx<23;xx+=8){b(xx,yy,6,3,p.solid[0]);b(xx+1,yy+1,3,1,p.solid[2])}
 for(let i=0;i<11;i++){const x=Math.floor(rnd(i*31+seed)*23),y=Math.floor(rnd(i*41+seed*3)*22);b(x,y,2,1,i%3?p.solid[2]:p.solid[0])}
 if(upper){b(0,0,24,3,p.green[0]);b(0,1,24,3,p.green[1]);for(let i=0;i<6;i++){const x=(i*7+seed)%23;b(x,0,3,2,p.green[2]);b(x+1,4,2,1,p.green[1])}}
 }else if(id===2){
 b(0,0,24,24,p.brick[0]);b(1,1,22,22,p.brick[1]);b(1,1,22,3,p.brick[2]);
 b(0,11,24,2,p.brick[0]);b(11,0,2,12,p.brick[0]);b(5,12,2,12,p.brick[0]);b(18,12,2,12,p.brick[0]);
 for(let i=0;i<5;i++)b(3+i*4,4+i%3*5,3,1,p.brick[2]);
 }else if(id===3){
 b(0,0,24,24,"#684455");b(2,2,20,20,"#f4b65f");b(3,3,18,4,"#ffeb9d");b(3,18,18,3,"#be784f");
 b(5,8,4,3,"#ffefb4");b(14,8,4,3,"#ffefb4");b(8,11,8,3,"#9d613e");b(10,14,5,4,"#fff5c3");
 b(1,1,3,3,"#fff4d4");b(20,20,3,3,"#684455");
 }else if(id===4){
 b(0,0,24,24,p.solid[0]);b(1,1,22,22,p.brick[1]);b(2,2,20,4,p.brick[2]);b(1,11,22,2,p.solid[0]);b(10,0,3,11,p.solid[0]);b(16,13,3,11,p.solid[0]);
 b(5,6,4,2,"#ffffff38");b(12,16,3,3,p.brick[2]);b(2,21,6,1,p.solid[2]);
 }else{
 b(0,0,24,24,"#374257");b(1,1,22,22,"#7f8b9b");b(2,2,20,5,"#b9c6c8");b(5,10,14,12,"#536479");b(9,9,6,6,"#39485d");b(10,14,4,3,"#aabec1");
 }
 });
}
function coinArt(frame){
 return cached("coin:"+frame,16,16,P=>{
 const {b,e}=P;if(frame===3){b(7,1,3,14,"#86542e");b(8,1,3,14,"#fff1a4");return}
 e(8,8,7,8,"#6e4833");e(8,7,6,7,"#e7ad45");e(8,7,5,6,"#ffdf73");
 b(4,3,6,2,"#fff5b3");b(6,4,3,1,"#fff9d4");b(7,5,2,6,"#b8783e");b(6,6,2,5,"#fff6a0");b(6,12,5,1,"#fcf7be");
 });
}
function itemArt(kind,phase){
 return cached("item:"+kind+":"+phase,20,20,P=>{
 const {b,e,l}=P;const colors={grow:["#e96d77","#a83f68"],fire:["#ffae50","#c95747"],leaf:["#8dd88b","#408567"],frog:["#65c8ae","#287d79"],hammer:["#9ab5d5","#57698e"],cloak:["#b895db","#725597"],star:["#ffe07b","#c68a51"]};
 const col=colors[kind]||colors.grow;
 e(10,10,10,10,"#182e48");e(10,10,8,8,col[0]);b(4,5,9,2,"#ffffff75");b(5,15,9,2,col[1]);
 if(kind==="grow"){e(10,9,7,7,"#ffdad7");e(10,6,6,4,col[0]);b(7,5,3,3,"#fffcdb");b(13,6,3,3,"#fffcdb")}
 if(kind==="fire"){for(let i=0;i<4;i++)l(6+i*2,14,10+i*2,3+i%2*4,i%2?"#fff4ad":"#ed6d4a",2)}
 if(kind==="leaf"){e(11,9,5,8,"#c3ef92");l(7,16,15,5,"#348b66",2)}
 if(kind==="frog"){e(6,6,4,4,"#c3f7c7");e(14,6,4,4,"#c3f7c7");b(5,6,2,2,"#1f3f4e");b(14,6,2,2,"#1f3f4e");b(7,13,6,2,"#1f7e67")}
 if(kind==="hammer"){b(8,5,3,11,"#5c456a");b(5,4,11,6,"#e9eef8");b(6,5,9,2,"#ffffff")}
 if(kind==="cloak"){b(7,4,6,12,"#d9b4eb");b(4,12,12,4,"#745a9d")}
 if(kind==="star"){for(let y=2;y<17;y++)for(let x=2;x<18;x++){let aa=Math.atan2(y-9,x-9),d=Math.hypot(x-9,y-9);if(d<6+3*Math.cos(5*aa))b(x,y,1,1,y%3?"#fff8aa":"#ffc867")}}
 });
}
function cameraRect(g,x,y,w,h,c){rect(g,x,y,w,h,c)}
function cloud(g,x,y,k,color,outline="#e0f9ed"){const unit=Math.max(4,Math.round(8*k));
 const blocks=[[2,2,8,2],[0,3,12,2],[1,1,4,3],[5,0,5,4],[8,2,3,2],[1,5,10,1]];
 for(const [a,b,w,h]of blocks)rect(g,x+a*unit*.52,y+b*unit*.6,w*unit*.52,h*unit*.6,color);
 rect(g,x+unit,y+unit*.9,unit*4,unit*.45,outline);
}
function steppedMountain(g,cx,ground,height,width,col,edge){
 const seg=9,half=Math.ceil(width/seg);
 for(let i=-half;i<=half;i++){const dist=Math.abs(i/half),h=Math.max(0,Math.floor(height*(1-dist*.86)));
 rect(g,cx+i*seg,ground-h,seg+1,h,col);
 if(h>40&&i%3===0)rect(g,cx+i*seg,ground-h,seg,7,edge);
 }
}
function background(g,L,cam,t,W,H){
 const a=pal[L.w-1];for(let i=0;i<4;i++)rect(g,0,i*135,W,137,a.sky[i]);
 if(L.shadow){for(let i=0;i<18;i++)rect(g,0,i*32,W,4,"#171d41" + (i%3?"2e":"19"))}
 if(L.type==="fort"||L.type==="depth"){
 const off=Math.floor(cam*.17/48)*48;
 for(let y=0;y<12;y++)for(let i=-2;i<25;i++){const x=i*48-off%48+((y%2)*22),Y=y*48;rect(g,x+1,Y+1,45,45,L.type==="fort"?"#26334d":"#284964");rect(g,x+2,Y+2,39,5,"#ffffff10");rect(g,x+8,Y+41,34,3,"#091b2f")}
 for(let i=-1;i<9;i++){const x=i*190-Math.floor(cam*.28)%190;
 if(L.type==="fort"){rect(g,x+40,150,12,246,"#121c32");rect(g,x+135,150,12,246,"#121c32");
 rect(g,x+40,152,108,13,"#87929c");rect(g,x+40,393,108,9,"#8a647a");rect(g,x+78,254,31,17,"#291e32");
 rect(g,x+85,267,15,49,"#f3ac60");rect(g,x+85,267+Math.floor(Math.sin(t*6+i)*7),14,16,"#ffe2a0");
 }else{steppedMountain(g,x+90,540,295,115,"#203951","#68869b");rect(g,x+45,108,20,40,"#2b526b")}}
 return;
 }
 const sunX=710-Math.floor(cam*.009)%90,sunY=100;
 for(let y=-40;y<40;y+=6){const w=Math.round(Math.sqrt(Math.max(0,40*40-y*y))/6)*6;rect(g,sunX-w,sunY+y,w*2,6,L.w===7||L.w===8?"#ffb18d":"#fff1ba")}
 for(let layer=0;layer<3;layer++){const mul=.09+layer*.08;
 for(let i=-2;i<10;i++){const x=i*245-Math.floor(cam*mul)%245;
 const alt=175+(i*37+layer*91)%76;
 steppedMountain(g,x+110,545,alt+layer*24,270,a.hills[layer],layer===0?a.light:a.hills[0]);
 }}
 if(L.w===1||L.w===2||L.w===5||L.w===6){
 for(let i=-2;i<10;i++){const x=i*255-Math.floor(cam*.14)%255,y=75+((i*41)%3)*25;
 cloud(g,x,y,.8+(i%3)*.2,L.w===8?"#efb5c8":"#f4f9e9","#bddddf")}
 }
 if(L.w===2){
 for(let i=-1;i<13;i++){const x=i*120-Math.floor(cam*.34)%120;
 rect(g,x+17,350,14,145,"#6a745f");rect(g,x+2,381,15,12,"#6a745f");rect(g,x+1,365,7,35,"#6a745f");rect(g,x+29,405,16,11,"#6a745f");rect(g,x+36,386,7,38,"#6a745f")}
 }else if(L.w===3){
 for(let i=-1;i<14;i++){const x=i*95-Math.floor(cam*.27)%95;
 rect(g,x+35,215,26,310,"#365c62");rect(g,x+40,215,9,310,"#7d9175");
 for(let k=0;k<6;k++)rect(g,x+12-k*4,146+k*19,89+k*8,25,k%2?"#388770":"#4e9a74")}
 }else if(L.w===4){
 rect(g,0,331,W,210,"#174a9c85");
 for(let i=-1;i<19;i++){const x=i*70-Math.floor(cam*.2)%70,y=448;
 for(let k=0;k<5;k++)rect(g,x+8+k*6,y-50-k*8,5,65+k*8,k%2?"#5eaab3":"#7cd0c3");
 for(let k=0;k<4;k++){const yy=350+(i*31+k*41)%135;rect(g,x+20+k*8,yy+Math.round(Math.sin(t*2+i)*6),6,7,"#e8faff5c")}}
 }else if(L.w===5){for(let i=0;i<50;i++){const x=(i*173+Math.floor(t*(9+i%3*9)))%W,y=(i*83+Math.floor(t*(10+i%4*7)))%470;rect(g,x,y,3+i%3,3+i%3,"#effcff")}}
 else if(L.w===6){for(let i=-1;i<9;i++){const x=i*180-Math.floor(cam*.28)%180,y=260+(i%3)*47;
 rect(g,x,y,128,20,"#d4ecdc");rect(g,x+12,y+20,99,15,"#80bdc4");for(let k=0;k<4;k++)rect(g,x+15+k*21,y+35,12,9,"#6a8ea9")}}
 else if(L.w===7){for(let i=-1;i<11;i++){const x=i*124-Math.floor(cam*.3)%124;
 rect(g,x+44,315,10,190,"#30314d");rect(g,x+5,306,84,17,"#45405e");rect(g,x+22,288,59,15,"#45405e");rect(g,x+35,269,34,22,"#696080")}}
 else if(L.w===8){for(let i=0;i<35;i++){const x=(i*191+Math.floor(Math.sin(t+i)*13))%W,y=(i*117-Math.floor(t*(9+i%4*8))%500+500)%500;
 rect(g,x,y,3+i%4,4+i%4,i%2?"#ffb574":"#d95d5f")}}
}
function tile(g,L,ix,iy,id,cam){
 const x=ix*T-Math.floor(cam),y=iy*T;if(x<-T||x>960+T)return;
 const im=tileArt(L,id,ix,iy);g.drawImage(im,x,y,48,48);
}
function pipes(g,L,cam){
 const colors=["#22564f","#3d9272","#76d4a4","#c6edd3"],rose=["#452d51","#884663","#c68390","#edc5be"];
 const P=L.w===8?rose:colors;
 for(const q of L.pipes){const x=Math.round(q.x-cam),y=q.y;if(x<-115||x>1075)continue;
 rect(g,x+10,y+22,q.w-20,q.h-22,"#13293e");rect(g,x+14,y+24,q.w-28,q.h-24,P[1]);
 rect(g,x+21,y+25,11,q.h-29,P[2]);rect(g,x+60,y+24,11,q.h-27,P[0]);rect(g,x+73,y+25,7,q.h-30,P[2]);
 rect(g,x,y+4,q.w,28,"#1a3047");rect(g,x+4,y+6,q.w-8,23,P[1]);rect(g,x+6,y+7,13,18,P[2]);rect(g,x+15,y+9,7,13,P[3]);rect(g,x+72,y+7,13,18,P[0]);
 rect(g,x+4,y+29,q.w-8,5,P[0]);if(q.bonus){rect(g,x+39,y-22,18,9,"#fff0ae");rect(g,x+43,y-13,10,6,"#ffe9a0")}
 }
 if(L.secret){const x=Math.round(L.roomExit-cam);rect(g,x,L.w?390:390,88,90,"#1d4464");rect(g,x+5,388,78,20,"#6ed8ba");rect(g,x+17,431,47,49,"#0b203d");rect(g,x+34,372,20,10,"#ffe2a0")}
}
function coins(g,items,cam,t,secret){
 for(const c of items){if(c.secretOnly&&!secret)continue;const x=Math.round(c.x-cam-3),y=Math.round(c.y+Math.sin(c.t*4)*3);
 if(x< -40||x>1000)continue;const f=Math.floor(c.t*8)%4;g.drawImage(coinArt(f),x,y,32,32)}
}
function drops(g,items,cam,secret){for(const d of items){if(d.secretOnly&&!secret)continue;const x=Math.round(d.x-cam-2),y=Math.round(d.y+Math.sin(d.age*3)*3-2);if(x< -60||x>1020)continue;g.drawImage(itemArt(d.kind,Math.floor(d.age*5)%3),x,y,39,39)}}
function player(g,p,cam,t){
 if(!p)return;
 if(p.invuln>0&&!p.starT&&Math.floor(t*13)%2)return;
 let pose=p.attackT>0?"attack":!p.grounded?(p.vy<0?"jump":"fall"):Math.abs(p.vx)>28?"run":"idle";
 const f=pose==="run"?Math.floor(p.age*(8+Math.abs(p.vx)/70))%6:Math.floor(p.age*5)%4;
 const im=heroArt(p.suit,pose,f),scale=p.suit==="normal"?1.24:1.50;
 const x=Math.round(p.x+p.w/2-cam),y=Math.round(p.y+p.h);
 if(p.grounded){rect(g,x-20,y-2,40,3,"#1d25394d")}
 g.save();g.translate(x,y);g.scale(p.dir*scale,scale);
 g.drawImage(im,-19,-53);
 g.restore();
 if(p.starT>0){for(let i=0;i<4;i++){let angle=t*4+i*TAU/4;const xx=x+Math.cos(angle)*24,yy=y-30+Math.sin(angle)*26;
 const im=itemArt("star",0);g.drawImage(im,xx-7,yy-7,14,14)}}
}
function mob(g,m,L,cam,t){
 if(m.dead)return;const x=Math.round(m.x+m.w/2-cam),y=Math.round(m.y+m.h);
 if(x< -150||x>1110)return;
 const f=Math.floor(m.age*(m.kind==="boss"?5:11))%4,im=enemyArt(m.kind,f,L.w,L.shadow,m.alert>0);
 const scale=m.kind==="boss"?1.78:(m.kind==="launcher"?1.44:1.30);
 if(m.kind!=="flyer"&&m.kind!=="fish"&&m.kind!=="ghost"&&m.grounded)rect(g,x-19,y-2,38,3,"#1d25394d");
 g.save();g.translate(x,y);g.scale(m.dir*scale,scale);g.drawImage(im,-im.width/2,-im.height);g.restore();
 if(m.kind==="boss"){
 const hpMax=L.w===8?(L.shadow?12:10):4+Math.ceil(L.w/2)+(L.shadow?3:0);
 rect(g,x-42,m.y-26,84,9,"#251b36");rect(g,x-40,m.y-24,Math.max(0,80*m.hp/hpMax),5,"#f3b267");rect(g,x-42,m.y-29,84,3,"#ffffff88");
 }else if(m.alert>0){rect(g,x-3,m.y-17,8,12,"#fff3b3");rect(g,x-3,m.y-1,8,5,"#fff3b3")}
}
function hazards(g,items,cam){
 for(const h of items){const x=Math.round(h.x-cam);if(x< -60||x>1020)continue;
 if(h.kind==="spike"){for(let i=0;i<3;i++)for(let y=0;y<24;y+=3){const span=Math.ceil(y/4);
 rect(g,x+i*16+8-span,h.y+y-1,span*2,3,y<9?"#f9f9e9":"#bac1d1")}
 rect(g,x,h.y+20,48,3,"#6a6477")}
 else{rect(g,x,h.y+h.h-7,48,7,"#8d3d59");if(Math.sin(h.age*3.2+h.cycle)>.12)
 for(let i=0;i<4;i++)for(let y=0;y<30;y+=4){const n=6-Math.floor(y/7);rect(g,x+i*12+6-n/2,h.y+24-y+Math.sin(h.age*9+i)*4,n,4,y%3?"#ffd369":"#f76e4e")}
 }
 }
}
function goal(g,L,cam,t){
 const x=Math.round(L.goalX-cam);if(x<-250||x>1050)return;
 rect(g,x+12,93,8,387,"#263849");rect(g,x+14,99,4,378,"#d9e2d9");rect(g,x+6,89,20,14,L.bossCleared?"#ffdb7f":"#6e8092");
 for(let i=0;i<5;i++)rect(g,x+24+i*14,118+i*6,14,25-i*4,L.bossCleared?"#e65e68":"#54748e");
 const xx=x+131,yy=375;rect(g,xx,yy,133,105,"#253851");rect(g,xx+6,yy+9,121,95,"#8c99ab");
 for(let i=0;i<4;i++){rect(g,xx+i*34,yy-22,26,31,"#2a3c52");rect(g,xx+i*34+3,yy-19,20,28,"#99aec1");rect(g,xx+i*34+3,yy-18,20,5,"#d1d2ce")}
 for(let j=0;j<6;j++)rect(g,xx+j*22,yy+40+(j%2)*13,19,4,"#53667d");
 rect(g,xx+42,yy+48,48,57,"#1f253d");rect(g,xx+46,yy+52,40,53,L.bossCleared?"#1d3544":"#b8505d");
 for(let j=0;j<4;j++)rect(g,xx+15+j*25,yy+20,9,13,"#283c59");
 if(L.s===4&&!L.bossCleared){rect(g,x-18,72,117,28,"#1d273b");g.fillStyle="#ffdf9a";g.font="bold 20px monospace";g.fillText("BOSS",x+10,92)}
}
function projectiles(g,items,cam,t){
 for(const v of items){const x=Math.round(v.x-cam),y=Math.round(v.y);if(x< -60||x>1020)continue;
 if(v.kind==="hammer"){rect(g,x+7,y+1,6,19,"#4f395d");rect(g,x+1,y,18,8,"#dde5f1");rect(g,x+3,y+1,12,3,"#ffffff")}
 else if(v.kind==="bullet"){rect(g,x-2,y+2,25,13,"#24344e");rect(g,x+7,y+2,16,12,"#71879c");rect(g,x+17,y+4,6,7,"#ffedbe")}
 else if(v.kind==="ice"){for(let i=0;i<4;i++){rect(g,x+2+i*4,y+4,4,11,"#b9ecff");rect(g,x+6,y+i*4,11,4,"#f7ffff")}}
 else if(v.kind==="bubble"){rect(g,x+3,y+1,13,3,"#c9fbff");rect(g,x+1,y+4,3,12,"#a8d9ee");rect(g,x+13,y+4,3,12,"#a8d9ee");rect(g,x+4,y+15,9,2,"#f8ffff")}
 else{rect(g,x+2,y+1,12,15,v.enemy?"#af4859":"#d96f40");rect(g,x+4,y+3,9,10,v.enemy?"#fa9569":"#ffcf7b");rect(g,x+6,y+3,4,4,"#fff2b5");rect(g,x-Math.sign(v.vx)*8,y+7,8,4,"#ffc97e")}
 }
}
function particles(g,items,cam){
 for(const v of items){g.globalAlpha=Math.max(0,1-v.t/v.max);rect(g,v.x-cam,v.y,v.coin?8:v.r,v.coin?10:v.r,v.coin?"#ffe27d":v.color)}g.globalAlpha=1;
}
window.PixelSprites={background,tile,pipes,coins,drops,player,mob,hazards,goal,projectiles,particles};
})();
