/* WILD RECLAIM -- progressive native WebGL 3D renderer.
 * Original world physics, navigation, missions and persistence remain in game.js.
 * Orthographic 3D mesh rendering + depth buffer. Falls back to Canvas2D on failure.
 */
(() => {
"use strict";
const canvas=document.getElementById("scene3d");
if(!canvas){window.Wild3D={available:false};return;}
let gl;
try {gl=canvas.getContext("webgl",{alpha:false,depth:true,stencil:true,antialias:true,premultipliedAlpha:false});}catch(_){}
if(!gl){canvas.style.display="none";window.Wild3D={available:false};return;}
const vertex=String.raw`
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec3 aColor;
uniform vec2 uCenter;
uniform vec2 uSize;
uniform vec4 uView;
uniform float uZoom;
uniform float uNight;
uniform vec3 uTint;
varying vec2 vWorldXY;
varying vec3 vColor;
varying float vShade;
void main(){
 vec2 d=aPosition.xy-uCenter;
 float sx=uSize.x*0.5+uView.x*d.x+uView.z*d.y;
 float sy=uSize.y*0.5+uView.y*d.x+uView.w*d.y-aPosition.z*0.93*uZoom;
 float zDepth=-(uView.y*d.x+uView.w*d.y)*0.56-aPosition.z*1.24*uZoom;
 gl_Position=vec4(sx/(uSize.x*.5)-1.0,1.0-sy/(uSize.y*.5),zDepth/5000.0,1.0);
 vec3 n=normalize(aNormal);
 vec3 sun=normalize(vec3(-0.55,-0.7,1.2));
 float bright=max(0.0,dot(n,sun));
 vShade=0.34+0.65*bright;
 vColor=aColor*uTint*(1.08-uNight*.91);
 vWorldXY=aPosition.xy;
}
`;
const fragment=String.raw`
precision mediump float;
uniform float uAlpha;
uniform vec4 uNightVision; // player x/y, heading radians, range
uniform float uNightVisionStrength;
varying vec3 vColor;
varying float vShade;
varying vec2 vWorldXY;
void main(){
 vec3 shaded=vColor*vShade;
 if(uNightVisionStrength>0.001){
  vec2 delta=vWorldXY-uNightVision.xy;
  float distanceToPlayer=length(delta);
  vec2 forward=vec2(cos(uNightVision.z),sin(uNightVision.z));
  float alignment=dot(delta,forward)/max(distanceToPlayer,1.0);
  float edge=smoothstep(0.30,0.70,alignment);
  float reach=1.0-smoothstep(uNightVision.w*.62,uNightVision.w,distanceToPlayer);
  float peripheral=(1.0-smoothstep(55.0,145.0,distanceToPlayer))*.30;
  float acuity=max(edge*reach,peripheral)*uNightVisionStrength;
  shaded=shaded*(1.0+acuity*.72)+vec3(.026,.040,.034)*acuity;
 }
 gl_FragColor=vec4(shaded,uAlpha);
}
`;
function shader(type,src){const v=gl.createShader(type);gl.shaderSource(v,src);gl.compileShader(v);if(!gl.getShaderParameter(v,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(v));return v;}
let program,buffer,attrPos,attrNormal,attrColor,ucenter,usize,uview,uzoom,unight,utint,ualpha,unightVision,unightVisionStrength;
function initializeGPU(){
 program=gl.createProgram();
 gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));
 gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));
 gl.linkProgram(program);
 if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
 buffer=gl.createBuffer();
 attrPos=gl.getAttribLocation(program,"aPosition");
 attrNormal=gl.getAttribLocation(program,"aNormal");
 attrColor=gl.getAttribLocation(program,"aColor");
 ucenter=gl.getUniformLocation(program,"uCenter");
 usize=gl.getUniformLocation(program,"uSize");
 uview=gl.getUniformLocation(program,"uView");
  uzoom=gl.getUniformLocation(program,"uZoom");
 unight=gl.getUniformLocation(program,"uNight");utint=gl.getUniformLocation(program,"uTint");ualpha=gl.getUniformLocation(program,"uAlpha");
 unightVision=gl.getUniformLocation(program,"uNightVision");unightVisionStrength=gl.getUniformLocation(program,"uNightVisionStrength");
 gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);
}
try{initializeGPU()}catch(err){console.warn("Wild3D shader unavailable; 2D fallback",err);canvas.style.display="none";window.Wild3D={available:false};return;}
const TAU=Math.PI*2,clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),cache=new Map();
function color(hex){if(Array.isArray(hex))return hex;let c=cache.get(hex);if(c)return c;const raw=(hex||"#777777").replace("#","").slice(0,6),n=parseInt(raw,16);c=[(n>>16&255)/255,(n>>8&255)/255,(n&255)/255];cache.set(hex,c);return c;}
function tone(hex,s){const c=color(hex);return c.map(v=>Math.min(1,v*s));}
let data=[];
 // Static district geometry is rebuilt only when the camera enters a new region.
 // Animal and vegetation animation still update every frame.
 let staticBuffer=gl.createBuffer();
 let staticKey="",staticCount=0,staticRebuilds=0,dynamicCount=0;
function triangle(a,b,c,t){
 const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
 let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;
 const len=Math.hypot(nx,ny,nz)||1;nx/=len;ny/=len;nz/=len;
 for(const p of [a,b,c])data.push(p[0],p[1],p[2],nx,ny,nz,t[0],t[1],t[2]);
}
function quad(a,b,c,d,t){triangle(a,b,c,t);triangle(a,c,d,t)}
function box(x,y,z,w,h,height,col,roofCol=col){
 const z1=z+height,t=color(col),roof=color(roofCol),x1=x+w,y1=y+h;
 quad([x,y,z1],[x1,y,z1],[x1,y1,z1],[x,y1,z1],roof);
 quad([x,y,z],[x1,y,z],[x1,y,z1],[x,y,z1],tone(col,.92));
 quad([x1,y,z],[x1,y1,z],[x1,y1,z1],[x1,y,z1],tone(col,.76));
 quad([x1,y1,z],[x,y1,z],[x,y1,z1],[x1,y1,z1],tone(col,1.04));
 quad([x,y1,z],[x,y,z],[x,y,z1],[x,y1,z1],tone(col,.83));
}
let animalLift=0,animalCollapseTransform=null;
// Only the dying player's mesh rolls onto its side; the roof-level shadow remains fixed.
function collapseVertex(vertex){
 const t=animalCollapseTransform;
 if(!t)return vertex;
 const [x,y,z]=vertex;
 const side=-(x-t.x)*t.sin+(y-t.y)*t.cos,height=z-t.pivot;
 const rolledSide=side*t.ct+height*t.st,rolledHeight=height*t.ct-side*t.st;
 const shift=rolledSide-side;
 return [x-shift*t.sin,y+shift*t.cos,Math.max(t.ground+.65,t.pivot+rolledHeight)];
}
function pyramid(x,y,z,rx,ry,h,col){z+=animalLift;
 const base=[[x-rx,y-ry,z],[x+rx,y-ry,z],[x+rx,y+ry,z],[x-rx,y+ry,z]],top=[x,y,z+h],c=color(col);
 for(let i=0;i<4;i++)triangle(collapseVertex(base[i]),collapseVertex(base[(i+1)%4]),collapseVertex(top),c);
}
function ellipsoid(x,y,z,rx,ry,rz,col,heading=0,segments=9,rings=5){z+=animalLift;
 const c=color(col),cos=Math.cos(heading),sin=Math.sin(heading);
 const point=(phi,theta)=>{
  const lx=rx*Math.cos(phi)*Math.cos(theta),ly=ry*Math.cos(phi)*Math.sin(theta),lz=rz*Math.sin(phi);
  return collapseVertex([x+lx*cos-ly*sin,y+lx*sin+ly*cos,z+lz]);
 };
 for(let j=0;j<rings;j++){
  const a=-Math.PI/2+j*Math.PI/rings,b=-Math.PI/2+(j+1)*Math.PI/rings;
  for(let i=0;i<segments;i++){
   const t=i*TAU/segments,u=(i+1)*TAU/segments;
   const p=point(a,t),q=point(a,u),r=point(b,u),s=point(b,t);
   if(j>0)triangle(p,q,r,c);
   triangle(p,r,s,c);
  }
 }
}

/* STRONG-MODELS-3D-V2: species-specific anatomy, proportions and silhouettes. */
function drawStrongAnimal3D(m,clock){
 const t=m.type;
 if(t!=="giantSnake"&&t!=="oldBear"&&t!=="giantBoar"&&t!=="blackPanther"&&t!=="oneEyedWolf"&&t!=="whiteTiger"&&t!=="giantHyena"&&t!=="giantLion"&&t!=="giantMoose"&&t!=="giantBuffalo"&&t!=="giantCrocodile"&&t!=="giantHippo"&&t!=="giantAnaconda"&&t!=="giantLizard"&&t!=="rhino"&&t!=="giantGorilla"&&t!=="giantElephant"&&t!=="albinoWolf"&&t!=="giantEagle")return false;
 const r=m.r||30,dir=m.dir||0,c=Math.cos(dir),sn=Math.sin(dir);
 const x=(dx,dy)=>m.x+dx*c-dy*sn,y=(dx,dy)=>m.y+dx*sn+dy*c;
 const fur=m.color||"#6c675d",belly=m.belly||"#b4a38e";
 const orb=(dx,dy,z,rx,ry,rz,col)=>ellipsoid(x(dx,dy),y(dx,dy),z,rx,ry,rz,col,dir,9,5);
 const spike=(dx,dy,z,rx,ry,h,col)=>pyramid(x(dx,dy),y(dx,dy),z,rx,ry,h,col);
 const pace=Math.sin((m.step||0)*2.1)*Math.min(1,Math.hypot(m.vx||0,m.vy||0)/110)*r*.11;
 if(t==="giantEagle"){
  const flap=Math.sin((m.step||0)*2.4),spread=1+.22*flap;
  orb(-r*.17,0,r*.42,r*.89,r*.42,r*.31,fur);orb(r*.65,0,r*.46,r*.44,r*.33,r*.32,belly);
  for(const side of [-1,1]){
   for(let k=0;k<7;k++){const along=-.67+k*.22;orb(r*along,side*r*(.79+k*.10)*spread,r*(.44+flap*.13),r*.39,r*.36,r*.10,k%2?"#493a2c":"#8e6c46");}
   orb(r*.9,side*r*.19,r*.65,r*.09,r*.08,r*.09,"#f3d78e");
   for(let k=0;k<3;k++)spike(r*.38+k*r*.08,side*r*.20,r*.18,r*.07,r*.06,r*.22,"#dfc27b");
  }
  for(let k=-2;k<=2;k++)orb(-r*1.14,k*r*.18,r*.35,r*.63,r*.15,r*.09,"#a18b6a");
  spike(r*1.18,0,r*.42,r*.18,r*.15,r*.36,"#e4bb66");
 }else if(t==="giantGorilla"){
  for(const side of [-1,1]){orb(-r*.2,side*r*.83,r*.52+pace,r*.43,r*.39,r*.62,"#30332f");orb(r*.72,side*r*.8,r*.48+pace,r*.45,r*.39,r*.52,fur);}
  orb(-r*.25,0,r*1.16,r*1.25,r*.92,r*1.03,fur);orb(r*.53,0,r*1.25,r*.88,r*.78,r*.82,belly);
  for(const side of [-1,1]){orb(r*.1,side*r*.98,r*1.05,r*.55,r*.35,r*.67,fur);orb(r*1.04,side*r*.29,r*1.45,r*.12,r*.11,r*.12,"#262827");}
  orb(r*1.17,0,r*1.31,r*.45,r*.39,r*.40,"#8d8076");orb(r*1.4,0,r*1.17,r*.26,r*.21,r*.20,"#35332f");
  if(m.rock)ellipsoid(m.rock.x,m.rock.y,20,12,12,12,"#b5aa9b",0,8,5);
 }else if(t==="giantElephant"){
  for(const side of [-1,1])for(const front of [-1,1])orb(front*r*.68,side*r*.7,r*.59+pace,r*.42,r*.41,r*.65,"#6b716d");
  orb(-r*.21,0,r*1.35,r*1.46,r*1.04,r*1.28,fur);orb(r*.77,0,r*1.44,r*.97,r*.87,r*.99,belly);
  for(const side of [-1,1]){orb(r*.85,side*r*.89,r*1.62,r*.54,r*.22,r*.69,"#777d79");spike(r*1.44,side*r*.34,r*.98,r*.21,r*.18,r*.86,"#e9e0cc");orb(r*1.1,side*r*.43,r*1.79,r*.13,r*.13,r*.13,"#323936");}
  for(let k=0;k<6;k++)orb(r*(1.35+k*.18),Math.sin(k*.5)*r*.10,r*(1.15-k*.13),r*(.30-k*.028),r*(.27-k*.025),r*(.31-k*.02),fur);
 }else if(t==="albinoWolf"){
  for(const side of [-1,1])for(const front of [-1,1])orb(front*r*.63,side*r*.45,r*.38+pace,r*.27,r*.25,r*.36,"#cdd0c7");
  orb(-r*.19,0,r*.76,r*1.21,r*.59,r*.64,fur);orb(r*.74,0,r*.80,r*.67,r*.49,r*.55,belly);
  for(const side of [-1,1]){spike(r*.49,side*r*.34,r*1.05,r*.23,r*.19,r*.58,fur);orb(r*1.06,side*r*.29,r*.97,r*.12,r*.10,r*.12,"#cf9e9e");}
  orb(r*1.25,0,r*.65,r*.42,r*.25,r*.27,belly);orb(-r*1.39,0,r*.79,r*.69,r*.20,r*.21,fur);
 }else if(t==="giantLizard"){
  for(const side of [-1,1])for(const front of [-1,1])orb(front*r*.59,side*r*.76,r*.24+pace,r*.43,r*.26,r*.25,"#50614d");
  orb(-r*.22,0,r*.57,r*1.32,r*.66,r*.52,fur);orb(r*.70,0,r*.50,r*.77,r*.49,r*.43,fur);orb(r*1.34,0,r*.38,r*.64,r*.34,r*.30,belly);
  for(let i=0;i<9;i++)spike(-r*1.1+i*r*.28,0,r*.98,r*.13,r*.16,r*.29,"#354d39");
  for(let i=0;i<8;i++)orb(-r*(1.13+i*.25),Math.sin(clock*1.7+i*.7)*r*.18,r*(.36-i*.02),r*(.38-i*.03),r*(.28-i*.023),r*(.25-i*.02),i%2?"#566d50":"#8b946d");
  for(const side of [-1,1]){orb(r*1.40,side*r*.27,r*.57,r*.14,r*.10,r*.10,"#ddbf75");orb(r*1.44,side*r*.28,r*.60,r*.05,r*.05,r*.06,"#19291f");}
 }else if(t==="rhino"){
  for(const side of [-1,1])for(const front of [-1,1])orb(front*r*.67,side*r*.62,r*.36+pace,r*.38,r*.33,r*.42,"#635e58");
  orb(-r*.24,0,r*.93,r*1.40,r*.93,r*.86,fur);orb(r*.59,0,r*1.18,r*1.00,r*.83,r*.94,"#6b6660");orb(r*1.35,0,r*.96,r*.70,r*.55,r*.56,belly);
  spike(r*1.46,0,r*1.34,r*.23,r*.24,r*1.05,"#e7ddc6");spike(r*.98,0,r*1.55,r*.16,r*.18,r*.52,"#c7bda8");
  for(const side of [-1,1]){orb(r*1.08,side*r*.48,r*1.38,r*.21,r*.18,r*.29,fur);orb(r*1.38,side*r*.43,r*1.10,r*.10,r*.09,r*.10,"#252521");}
  orb(-r*1.58,0,r*.73,r*.37,r*.15,r*.17,"#68635d");
 }else if(t==="giantCrocodile"){
  orb(-r*.15,0,r*.43,r*1.38,r*.72,r*.48,fur);
  for(const side of [-1,1])for(const front of [-1,1]){orb(front*r*.55,side*r*.71,r*.21+pace,r*.37,r*.24,r*.25,"#405b48");}
  for(let i=0;i<8;i++)spike(-r*.97+i*r*.27,0,r*.87,r*.16,r*.17,r*.24,"#36513e");
  orb(r*1.00,0,r*.36,r*.89,r*.45,r*.30,fur);orb(r*1.63,0,r*.25,r*.48,r*.36,r*.20,belly);
  for(const side of [-1,1]){orb(r*1.08,side*r*.34,r*.58,r*.14,r*.11,r*.12,"#e8d188");orb(r*1.11,side*r*.36,r*.64,r*.055,r*.05,r*.06,"#192b22");}
  for(let i=0;i<6;i++)orb(-r*(1.2+i*.30),0,r*(.28-i*.028),r*.35,r*(.38-i*.045),r*(.22-i*.026),i%2?"#405c47":fur);
 }else if(t==="giantHippo"){
  for(const side of [-1,1])for(const front of [-1,1])orb(front*r*.65,side*r*.69,r*.34+pace,r*.35,r*.35,r*.43,"#62565b");
  orb(-r*.21,0,r*.92,r*1.33,r*.98,r*.87,fur);orb(r*.70,0,r*.94,r*.91,r*.84,r*.76,"#8b787d");
  orb(r*1.40,0,r*.72,r*.79,r*.64,r*.53,belly);orb(r*1.91,0,r*.58,r*.40,r*.43,r*.33,"#8c7a7d");
  for(const side of [-1,1]){orb(r*.81,side*r*.67,r*1.43,r*.23,r*.21,r*.27,fur);orb(r*1.28,side*r*.53,r*1.13,r*.14,r*.13,r*.13,"#2a2528");orb(r*1.93,side*r*.25,r*.76,r*.13,r*.11,r*.10,"#4b383b");}
 }else if(t==="giantAnaconda"){
  for(let i=0;i<14;i++){const q=i/13,thick=r*(.15+.26*Math.sin(q*Math.PI));orb(-r*2.65+q*r*3.65,Math.sin(q*9+clock*1.3)*r*.36,thick*.73,thick*1.2,thick,thick*.79,i%3?"#3d705c":"#9cae7e");}
  orb(r*1.14,0,r*.40,r*.69,r*.48,r*.38,fur);orb(r*1.59,0,r*.31,r*.51,r*.33,r*.26,belly);
  for(const side of [-1,1])orb(r*1.34,side*r*.31,r*.54,r*.11,r*.10,r*.11,"#dfcc82");
 }else if(t==="giantSnake"){
  for(let i=0;i<10;i++){
   const p=i/9,dx=-r*2.05+p*r*2.9,dy=Math.sin(i*.63+clock*.9)*r*.27;
   const thick=r*(.14+.31*Math.sin(p*Math.PI*.85));
   orb(dx,dy,thick*.72,thick*1.35,thick,thick*.86,i%3===0?"#315844":fur);
  }
  orb(r*.98,0,r*.45,r*.62,r*.44,r*.37,fur);orb(r*1.35,0,r*.35,r*.42,r*.33,r*.23,belly);
  for(const side of [-1,1]){orb(r*1.06,side*r*.33,r*.60,r*.12,r*.10,r*.12,"#f4da86");orb(r*1.10,side*r*.39,r*.63,r*.04,r*.04,r*.08,"#172521");}
  spike(r*1.76,0,r*.25,r*.24,r*.09,r*.12,"#cb6e75");
 }else if(t==="oldBear"){
  for(const side of [-1,1])for(const front of [-1,1]){
   const dx=front*r*.64,dy=side*r*.61;
   orb(dx,dy,r*.34+pace*(front===side?1:-1),r*.29,r*.28,r*.38,"#483a32");
   for(let k=-1;k<=1;k++)spike(dx+r*.24,dy+k*r*.13,r*.09,r*.07,r*.04,r*.13,"#e7d7b3");
  }
  orb(-r*.08,0,r*.94,r*1.18,r*.88,r*.77,fur);orb(r*.45,0,r*1.24,r*.78,r*.82,r*.80,"#4f3e33");
  orb(r*1.0,0,r*1.02,r*.61,r*.56,r*.55,fur);
  for(const side of [-1,1]){orb(r*.76,side*r*.52,r*1.40,r*.23,r*.21,r*.26,fur);orb(r*1.20,side*r*.32,r*1.17,r*.08,r*.07,r*.08,"#e8bd82");}
  orb(r*1.42,0,r*.89,r*.40,r*.37,r*.30,belly);orb(r*1.72,0,r*.91,r*.14,r*.13,r*.11,"#281f1b");
 }else if(t==="giantBoar"){
  for(const side of [-1,1])for(const front of [-1,1])orb(front*r*.64,side*r*.58,r*.34+pace*(front===side?1:-1),r*.28,r*.25,r*.38,"#42352e");
  orb(-r*.14,0,r*.88,r*1.20,r*.81,r*.72,fur);orb(r*.64,0,r*.98,r*.75,r*.61,r*.59,"#655047");
  for(let i=0;i<8;i++)spike(-r*.83+i*r*.24,0,r*1.43,r*.15,r*.16,r*.43,"#42372d");
  orb(r*1.24,0,r*.77,r*.45,r*.44,r*.37,belly);
  for(const side of [-1,1]){spike(r*1.05,side*r*.43,r*.88,r*.16,r*.13,r*.48,"#f4e5bf");orb(r*1.52,side*r*.19,r*.74,r*.09,r*.10,r*.10,"#4b352e");}
 }else if(t==="oneEyedWolf"){
  for(const side of [-1,1])for(const front of [-1,1])orb(front*r*.65,side*r*.47,r*.32+pace*(front===side?1:-1),r*.22,r*.20,r*.33,"#51545a");
  orb(-r*.15,0,r*.68,r*1.12,r*.55,r*.48,"#6e7276");
  orb(r*.61,0,r*.85,r*.63,r*.51,r*.50,"#7e8181");
  for(const side of [-1,1])spike(r*.58,side*r*.39,r*1.13,r*.20,r*.16,r*.47,"#5d6468");
  orb(r*1.10,0,r*.69,r*.42,r*.25,r*.23,"#b8b5a8");
  orb(r*.91,-r*.29,r*1.01,r*.12,r*.08,r*.10,"#e5d1a6");
  orb(r*.91,r*.29,r*1.01,r*.12,r*.08,r*.10,"#c7b4a0");
  orb(r*.95,-r*.32,r*1.05,r*.055,r*.04,r*.06,"#212b2d");
  spike(r*.81,r*.32,r*1.13,r*.06,r*.09,r*.32,"#b08c86");
  for(let i=0;i<4;i++)orb(-r*(1.04+i*.27),Math.sin(clock*1.2+i*.5)*r*.08,r*.55,r*.21,r*.14,r*.12,"#53575b");
 }else if(t==="whiteTiger"){
  for(const side of [-1,1])for(const front of [-1,1])orb(front*r*.64,side*r*.53,r*.34+pace*(front===side?1:-1),r*.25,r*.24,r*.35,"#dedbd0");
  orb(-r*.12,0,r*.77,r*1.23,r*.77,r*.63,"#e4e1d7");
  orb(r*.55,0,r*.91,r*.82,r*.71,r*.66,"#f6f3e8");
  for(let i=0;i<7;i++)for(const side of [-1,1])
   spike(-r*.89+i*r*.29,side*r*.54,r*1.12,r*.10,r*.14,r*.30,"#42494c");
  orb(r*1.12,0,r*.86,r*.57,r*.51,r*.46,"#e4e1d7");
  for(const side of [-1,1]){orb(r*.87,side*r*.44,r*1.17,r*.20,r*.20,r*.24,"#f6f3e8");orb(r*1.27,side*r*.28,r*.98,r*.10,r*.08,r*.09,"#d9ae70");}
  orb(r*1.53,0,r*.72,r*.33,r*.31,r*.23,"#f6f3e8");
  for(let i=0;i<6;i++)orb(-r*(1.00+i*.27),Math.sin(clock*1.6+i*.5)*r*.21,r*(.62+i*.06),r*.21,r*.14,r*.13,i%2?"#434b4d":"#e4e1d7");
 }else if(t==="giantLion"){
  for(const side of [-1,1])for(const front of [-1,1])orb(front*r*.63,side*r*.54,r*.32+pace*(front===side?1:-1),r*.26,r*.26,r*.36,"#a9824b");
  orb(-r*.21,0,r*.79,r*1.18,r*.69,r*.65,"#cba56a");orb(r*.53,0,r*1.05,r*.83,r*.88,r*.90,"#966438");
  for(let i=0;i<12;i++){const a=i*Math.PI/6;spike(r*.57+Math.cos(a)*r*.65,Math.sin(a)*r*.67,r*1.08,r*.20,r*.18,r*.37,"#a36c37");}
  orb(r*1.11,0,r*.92,r*.55,r*.45,r*.44,"#cba56a");orb(r*1.45,0,r*.73,r*.40,r*.30,r*.26,"#e6cb96");
  for(const side of [-1,1]){orb(r*1.18,side*r*.29,r*1.06,r*.09,r*.07,r*.07,"#f6d19a");spike(r*.86,side*r*.42,r*1.28,r*.17,r*.14,r*.26,"#cba56a");}
  for(let i=0;i<5;i++)orb(-r*(1.02+i*.30),Math.sin(clock*1.5+i*.55)*r*.15,r*(.68+i*.06),r*.19,r*.12,r*.12,"#cba56a");
 }else if(t==="giantMoose"){
  for(const side of [-1,1])for(const front of [-1,1])orb(front*r*.72,side*r*.52,r*.43+pace*(front===side?1:-1),r*.21,r*.20,r*.46,"#4d3a30");
  orb(-r*.19,0,r*1.08,r*1.31,r*.72,r*.79,"#70523f");orb(r*.68,0,r*1.35,r*.65,r*.50,r*.62,"#80624a");orb(r*1.27,0,r*1.04,r*.61,r*.34,r*.34,"#b4a18b");
  for(const side of [-1,1]){spike(r*.83,side*r*.29,r*1.61,r*.17,r*.16,r*.73,"#d6bb8b");
   for(let k=0;k<4;k++)spike(r*(.55+k*.20),side*r*(.57+k*.20),r*(1.75+k*.11),r*.12,r*.12,r*.44,"#d6bb8b");
   orb(r*1.15,side*r*.25,r*1.29,r*.07,r*.07,r*.09,"#261d19");}
 }else if(t==="giantBuffalo"){
  for(const side of [-1,1])for(const front of [-1,1])orb(front*r*.67,side*r*.59,r*.39+pace*(front===side?1:-1),r*.30,r*.27,r*.41,"#3a2e28");
  orb(-r*.27,0,r*.93,r*1.24,r*.82,r*.80,"#514237");orb(r*.37,0,r*1.31,r*1.00,r*.98,r*1.09,"#42332a");
  for(let i=0;i<8;i++)spike(-r*.80+i*r*.23,0,r*1.91,r*.16,r*.18,r*.32,"#382c25");
  orb(r*1.17,0,r*1.05,r*.69,r*.63,r*.59,"#514237");orb(r*1.58,0,r*.83,r*.38,r*.34,r*.29,"#9c846b");
  for(const side of [-1,1]){spike(r*1.08,side*r*.45,r*1.24,r*.18,r*.19,r*.75,"#e2d4af");orb(r*1.32,side*r*.35,r*1.22,r*.10,r*.09,r*.10,"#e8c78a");}
 }else if(t==="giantHyena"){
  for(const side of [-1,1])for(const front of [-1,1])orb(front*r*.61,side*r*.48,r*.33+pace*(front===side?1:-1),r*.23,r*.23,r*.33,"#706149");
  orb(-r*.33,0,r*.62,r*.85,r*.52,r*.49,"#a68b63");
  orb(r*.26,0,r*1.00,r*.96,r*.75,r*.84,"#947852");
  for(let i=0;i<9;i++)spike(-r*.77+i*r*.21,0,r*1.47,r*.13,r*.16,r*.44,"#4e4639");
  orb(r*.93,0,r*.97,r*.58,r*.51,r*.48,"#a68b63");
  for(const side of [-1,1]){spike(r*.75,side*r*.36,r*1.27,r*.20,r*.15,r*.45,"#514a3d");orb(r*1.16,side*r*.29,r*1.05,r*.10,r*.08,r*.09,"#f0d398");}
  orb(r*1.35,0,r*.72,r*.46,r*.34,r*.27,"#d9c69d");
  for(let i=0;i<3;i++)orb(-r*(1.0+i*.29),0,r*.50,r*.24,r*.16,r*.15,"#52483b");
 }else{
  for(const side of [-1,1])for(const front of [-1,1]){
   const dx=front*r*.72,dy=side*r*.43;
   orb(dx,dy,r*.31+pace*(front===side?1:-1),r*.19,r*.19,r*.32,fur);
  }
  orb(-r*.18,0,r*.65,r*1.22,r*.42,r*.43,fur);orb(r*.65,0,r*.73,r*.55,r*.46,r*.45,fur);
  for(const side of [-1,1]){spike(r*.58,side*r*.32,r*1.08,r*.18,r*.15,r*.42,fur);orb(r*.91,side*r*.32,r*.85,r*.12,r*.09,r*.09,"#f0d38d");}
  orb(r*1.18,0,r*.63,r*.33,r*.21,r*.19,belly);
  for(let i=0;i<5;i++)orb(-r*(1.03+i*.32),Math.sin(clock*2+i*.55)*r*.21,r*(.64+i*.10),r*.22,r*.12,r*.12,fur);
 }
 return true;
}

// NORMAL-FAUNA-DISTRICTS-V1: real volumetric silhouettes in WebGL, no generic wolf fallback.
function drawOrdinaryAnimal3D(m,clock){
 const t=m.type;
 if(!["snake","frog","crow","weasel","raccoonDog","deer"].includes(t))return false;
 const r=m.r||16,dir=m.dir||0,c=Math.cos(dir),sn=Math.sin(dir);
 const x=(dx,dy)=>m.x+dx*c-dy*sn,y=(dx,dy)=>m.y+dx*sn+dy*c;
 const fur=m.color||"#777c71",belly=m.belly||"#b5bcb1";
 const orb=(dx,dy,z,rx,ry,rz,col)=>ellipsoid(x(dx,dy),y(dx,dy),z,rx,ry,rz,col,dir,9,5);
 const horn=(dx,dy,z,rx,ry,h,col)=>pyramid(x(dx,dy),y(dx,dy),z,rx,ry,h,col);
 const pace=Math.sin((m.step||0)*2.1+clock*.4)*Math.min(1,Math.hypot(m.vx||0,m.vy||0)/100);
 orb(0,0,1,r*1.3,r*.78,1.2,"#182d2a");
 if(t==="snake"){
  for(let i=0;i<9;i++){
   const k=i/8,dx=r*(1.0-k*3.0),dy=r*(Math.sin(k*Math.PI*2+pace*.35)*.40);
   orb(dx,dy,7+Math.sin(k*Math.PI)*r*.13,r*(.31-k*.20),r*(.27-k*.17),r*(.29-k*.17),fur);
  }
  orb(r*1.14,0,r*.52,r*.52,r*.40,r*.33,fur);
  for(const side of [-1,1]){
   orb(r*1.36,side*r*.27,r*.73,r*.09,r*.08,r*.10,"#e3d08a");
   orb(r*1.39,side*r*.28,r*.74,r*.04,r*.04,r*.085,"#192319");
  }
  orb(r*1.55,0,r*.42,r*.18,r*.10,r*.06,"#b98986");
 }else if(t==="frog"){
  for(const side of [-1,1]){
   orb(-r*.46,side*r*.75,7,r*.55,r*.35,r*.30,fur);
   orb(-r*.96,side*r*1.02,3+Math.max(0,pace)*3,r*.37,r*.19,r*.18,belly);
   orb(r*.52,side*r*.52,6,r*.22,r*.24,r*.22,fur);
  }
  orb(-r*.10,0,r*.53,r*.92,r*.69,r*.52,fur);
  orb(r*.64,0,r*.63,r*.56,r*.57,r*.45,fur);
  for(const side of [-1,1]){
   orb(r*.79,side*r*.42,r*1.04,r*.23,r*.20,r*.22,"#c6e3a2");
   orb(r*.86,side*r*.47,r*1.10,r*.10,r*.09,r*.11,"#243c25");
  }
 }else if(t==="crow"){
  orb(-r*.18,0,r*.56,r*.89,r*.52,r*.55,fur);
  orb(r*.65,0,r*.77,r*.42,r*.38,r*.40,fur);
  for(const side of [-1,1]){
   orb(-r*.35,side*r*.45,r*.72,r*.68,r*.20,r*.15,"#55616b");
   orb(-r*.10,side*r*.21,r*.14,r*.09,r*.09,r*.22,"#616267");
   orb(r*.84,side*r*.24,r*.85,r*.07,r*.07,r*.08,"#d4d7c0");
  }
  horn(r*1.12,0,r*.79,r*.25,r*.17,r*.29,"#4d5050");
  for(const side of [-1,1])orb(-r*1.25,side*r*.20,r*.48,r*.42,r*.15,r*.11,fur);
 }else if(t==="weasel"){
  for(const side of [-1,1])for(const forward of [-.65,.55]){
   orb(r*forward,side*r*.42,r*.20,r*.14,r*.15,r*.21,"#67513c");
  }
  orb(-r*.13,0,r*.43,r*1.36,r*.41,r*.39,fur);
  orb(r*.94,0,r*.51,r*.44,r*.30,r*.31,fur);
  for(let k=0;k<4;k++)orb(-r*(1.37+k*.32),Math.sin(clock*2+k*.6)*r*.15,r*(.36+k*.05),r*.25,r*.11,r*.11,fur);
  for(const side of [-1,1])orb(r*1.09,side*r*.22,r*.64,r*.11,r*.09,r*.085,"#252c2a");
 }else if(t==="raccoonDog"){
  for(const side of [-1,1])for(const forward of [-.57,.50]){
   orb(r*forward,side*r*.49,r*.25,r*.26,r*.23,r*.29,"#4d4a41");
  }
  orb(-r*.10,0,r*.72,r*1.12,r*.78,r*.72,fur);
  orb(r*.83,0,r*.88,r*.57,r*.54,r*.54,fur);
  for(const side of [-1,1]){
   horn(r*.53,side*r*.36,r*1.16,r*.18,r*.14,r*.32,"#544b42");
   orb(r*1.05,side*r*.35,r*.96,r*.33,r*.24,r*.18,"#413f38");
   orb(r*1.14,side*r*.39,r*1.07,r*.085,r*.065,r*.075,"#eee6d3");
  }
  orb(r*1.42,0,r*.77,r*.22,r*.19,r*.16,"#41382f");
  orb(-r*1.2,0,r*.80,r*.55,r*.43,r*.35,"#514c43");
 }else if(t==="deer"){
  for(const side of [-1,1])for(const forward of [-.57,.53]){
   const dx=r*forward,dy=side*r*.45;
   orb(dx,dy,r*.72,r*.16,r*.17,r*.80,fur);
   orb(dx+r*.03,dy,r*.13,r*.19,r*.20,r*.16,"#473a34");
  }
  orb(-r*.14,0,r*1.43,r*1.05,r*.46,r*.55,fur);
  orb(r*.57,0,r*1.56,r*.34,r*.30,r*.48,fur);
  orb(r*1.00,0,r*1.90,r*.49,r*.32,r*.36,fur);
  orb(r*1.48,0,r*1.72,r*.42,r*.25,r*.19,belly);
  orb(r*1.76,0,r*1.68,r*.15,r*.13,r*.13,"#3b322c");
  for(const side of [-1,1]){
   horn(r*.96,side*r*.30,r*2.06,r*.12,r*.10,r*.20,belly);
   orb(r*1.24,side*r*.23,r*1.99,r*.10,r*.085,r*.10,"#252a26");
   // Each antler has a main shaft plus two tines, unlike a rabbit's long ears.
   horn(r*.71,side*r*.32,r*2.32,r*.12,r*.11,r*.87,"#c8ad86");
   horn(r*.42,side*r*.55,r*2.69,r*.10,r*.09,r*.48,"#c8ad86");
   horn(r*.96,side*r*.61,r*2.63,r*.09,r*.085,r*.34,"#c8ad86");
  }
 }
 return true;
}

/* NORMAL-FAUNA-DISTRICTS-V1: silhouette-specific, low-poly 3D models.
 * All parts are collidable world positions and use normal ground height. */
function drawCommonAnimal3D(m,clock){
 const t=m.type;
 if(!["snake","frog","crow","deer","weasel","raccoonDog"].includes(t))return false;
 const r=m.r||14,dir=m.dir||0,c=Math.cos(dir),sn=Math.sin(dir);
 const fx=(dx,dy)=>m.x+dx*c-dy*sn,fy=(dx,dy)=>m.y+dx*sn+dy*c;
 const fur=m.color||(t==="crow"?"#313b44":t==="snake"?"#587b50":"#977c62");
 const belly=m.belly||"#d2baa4";
 const orb=(dx,dy,z,rx,ry,rz,col)=>ellipsoid(fx(dx,dy),fy(dx,dy),z,rx,ry,rz,col,dir,8,5);
 const horn=(dx,dy,z,rx,ry,h,col)=>pyramid(fx(dx,dy),fy(dx,dy),z,rx,ry,h,col);
 const gait=Math.sin((m.step||0)*.9+clock*1.1);
 if(t==="snake"){
  for(let k=8;k>=0;k--){
   const x=r*(2.5-k*.48),y=Math.sin(k*.86+clock*.7)*r*.33;
   orb(x,y,r*.19,r*(.42-k*.022),r*(.28-k*.015),r*.20,k%2?fur:belly);
  }
  orb(r*1.43,0,r*.23,r*.52,r*.35,r*.23,fur);
  for(const side of [-1,1])orb(r*1.66,side*r*.23,r*.35,r*.06,r*.06,r*.07,"#f8e8b8");
  horn(r*1.94,0,r*.16,r*.15,r*.09,r*.12,"#bc8179");
 }else if(t==="frog"){
  for(const side of [-1,1]){
   orb(-r*.58,side*r*.70,r*.20,r*.36,r*.29,r*.16,fur);
   orb(-r*.83,side*r*1.07,r*.12,r*.26,r*.27,r*.12,belly);
   orb(r*.55,side*r*.70,r*.17,r*.20,r*.40,r*.16,fur);
  }
  orb(-r*.06,0,r*.32,r*.96,r*.74,r*.43,fur);
  orb(r*.58,0,r*.37,r*.58,r*.53,r*.40,fur);
  for(const side of [-1,1]){
   orb(r*.68,side*r*.42,r*.76,r*.19,r*.20,r*.23,belly);
   orb(r*.78,side*r*.47,r*.85,r*.08,r*.08,r*.10,"#202b27");
  }
 }else if(t==="crow"){
  orb(-r*.22,0,r*.42,r*.88,r*.45,r*.39,fur);
  for(const side of [-1,1]){
   orb(-r*.37,side*r*.56,r*.63,r*.79,r*.32,r*.12,side<0?"#46515b":"#242c35");
   orb(-r*.88,side*r*.37,r*.43,r*.55,r*.15,r*.10,"#212935");
   orb(r*.52,side*r*.15,r*.56,r*.22,r*.20,r*.22,fur);
  }
  orb(r*.56,0,r*.65,r*.42,r*.36,r*.32,fur);
  horn(r*.98,0,r*.55,r*.22,r*.17,r*.25,"#747979");
  for(const side of [-1,1])orb(r*.67,side*r*.31,r*.78,r*.07,r*.07,r*.07,"#e4e2d4");
 }else if(t==="deer"){
  for(const side of [-1,1])for(const front of [-1,1]){
   const dx=front*r*.59,dy=side*r*.46;
   orb(dx,dy,r*.34,r*.15,r*.15,r*.36,"#73583f");
   orb(dx+gait*r*.07*front,dy,r*.10,r*.16,r*.19,r*.10,"#4b453b");
  }
  orb(-r*.14,0,r*.88,r*1.08,r*.49,r*.60,fur);
  orb(r*.69,0,r*.95,r*.44,r*.31,r*.53,fur);
  orb(r*1.07,0,r*1.06,r*.44,r*.33,r*.34,fur);
  orb(r*1.43,0,r*.93,r*.32,r*.23,r*.20,belly);
  for(const side of [-1,1]){
   orb(r*1.00,side*r*.38,r*1.36,r*.20,r*.14,r*.16,fur);
   horn(r*1.02,side*r*.28,r*1.37,r*.10,r*.10,r*.67,"#c4ab82");
   horn(r*.92,side*r*.55,r*1.76,r*.08,r*.08,r*.35,"#c4ab82");
   horn(r*1.27,side*r*.56,r*1.78,r*.08,r*.08,r*.37,"#c4ab82");
   orb(r*1.40,side*r*.21,r*1.14,r*.08,r*.06,r*.07,"#283029");
  }
  orb(-r*1.17,0,r*1.04,r*.29,r*.18,r*.17,belly);
 }else if(t==="weasel"){
  for(const side of [-1,1])for(const front of [-1,1])
   orb(front*r*.70,side*r*.39,r*.20,r*.16,r*.15,r*.19,fur);
  for(let k=0;k<5;k++)orb(-r*(1.07+k*.29),Math.sin(k*.62)*r*.12,r*.23,r*(.23-k*.031),r*.13,r*.14,fur);
  orb(-r*.18,0,r*.34,r*1.30,r*.30,r*.27,fur);
  orb(r*1.03,0,r*.40,r*.41,r*.30,r*.30,fur);
  orb(r*1.35,0,r*.27,r*.25,r*.18,r*.14,belly);
  for(const side of [-1,1])orb(r*1.1,side*r*.24,r*.60,r*.13,r*.13,r*.15,fur);
 }else if(t==="raccoonDog"){
  for(const side of [-1,1])for(const front of [-1,1])
   orb(front*r*.54,side*r*.55,r*.25,r*.22,r*.18,r*.29,"#554a42");
  orb(-r*.18,0,r*.54,r*1.02,r*.64,r*.49,fur);
  for(let k=0;k<3;k++)orb(-r*(1.22+k*.27),0,r*.60,r*.31,r*.23,r*.23,k%2?"#66574a":"#4d443e");
  orb(r*.73,0,r*.62,r*.57,r*.52,r*.43,fur);
  for(const side of [-1,1]){
   orb(r*.90,side*r*.30,r*.66,r*.27,r*.18,r*.25,"#3f4041");
   orb(r*1.01,side*r*.31,r*.77,r*.10,r*.08,r*.08,belly);
   orb(r*1.00,side*r*.32,r*.81,r*.05,r*.04,r*.05,"#242423");
   orb(r*.58,side*r*.40,r*1.00,r*.20,r*.16,r*.22,fur);
  }
  orb(r*1.26,0,r*.49,r*.29,r*.24,r*.20,belly);
 }
 return true;
}

function animal(m,player,clock){
 const type=m.type==="strayCat"?"cat":m.type==="wildFox"?"fox":m.type,c=m.base||m.species||null,base=m.color||(c&&c.color)||"#86928d",belly=m.belly||(c&&c.belly)||"#c5ccbd";
 const r=m.r||16,collapse=player?clamp(m.deathPose||0,0,1):0,dir=(m.dir||0)+collapse*.24,cos=Math.cos(dir),sin=Math.sin(dir),speed=Math.hypot(m.vx||0,m.vy||0);
 const resting=!player&&!!m.resting;
 const moving=resting||collapse>0?0:clamp(speed/95,0,1);
 const phase=(m.steps||m.step||0)*(type==="cat"?3.4:type==="fox"?2.9:type==="wolf"?2.1:2.6);
 const gait=Math.sin(phase)*moving;
 const idleBreath=(.5+.5*Math.sin(clock*2.8+(m.id||0)*.7))*r*.048*(1-collapse);
 const headAttention=resting||collapse>0?0:Math.sin(clock*.83+(m.id||0))*r*(moving>.4?.016:.07);
 const landingCompression=player&&m.fallTime>0?-r*.12:0;
 const kickPose=player&&type==="cat"?clamp((m.wallKickTime||0)/.43,0,1):0;
 const turboPose=player&&type==="fox"&&m.abilityTime>0?clamp(speed/660,0,1):0;
 const chargePose=player&&type==="wolf"&&m.chargeStrike&&m.pounceTime>0?1:0;
 const bodyBob=Math.abs(Math.sin(phase))*r*.13*moving+kickPose*r*.32+turboPose*r*.10+idleBreath+landingCompression;
 const bodyDrive=Math.sin(phase)*r*.10*moving+turboPose*r*.28+chargePose*r*.34;
 const attackPrep=player&&m.pendingStrike?clamp(1-m.windup/Math.max(.001,Math.min(.15,m.rate*.38)),0,1):(!player&&m.windup>0?clamp(1-m.windup/Math.max(.01,m.windupTotal||.53),0,1):0);
 const swingDuration=player?.18:.22,swingLeft=clamp(m.swing||0,0,swingDuration);
 const attackSnap=swingLeft>0?clamp((swingDuration-swingLeft)/.033,0,1)*clamp(swingLeft/.12,0,1):0;
 const airStrike=player&&m.jumpDive&&m.jumpTime>0?.32:0;
 const attackCharge=!player&&(type==="boar"||type==="alpha"||type==="oneEyedWolf"||type==="whiteTiger"||type==="giantMoose"||type==="giantBuffalo")?clamp((m.chargeTime||0)/(type==="alpha"?.24:type==="oneEyedWolf"?.28:type==="whiteTiger"?.39:type==="giantMoose"?.46:type==="giantBuffalo"?.53:.36),0,1)*.55:0;
 const attackReach=Math.max(attackSnap,attackCharge)+airStrike;
 const rushPose=player&&(m.pendingStrike||m.swing>0)?(m.rushActiveStep||0):0;
 const foreDrive=(side,base)=>rushPose===1||rushPose===2?attackReach*(side===(rushPose===1?-1:1)?1:.08):rushPose===3?attackReach*.14:rushPose===4?attackReach*.05:rushPose===5?attackReach*.60:base;
 const fx=(dx,dy)=>m.x+dx*cos-dy*sin,fy=(dx,dy)=>m.y+dx*sin+dy*cos;
 const fox=type==="fox"||type==="wildFox",cat=type==="cat"||type==="strayCat",wolf=type==="wolf"||type==="alpha",rabbit=type==="rabbit",rat=type==="rat",pigeon=type==="pigeon";
 const large=wolf||type==="boar",torso=fox?"#c97741":cat?"#9caaa1":wolf?"#647b84":base;
 const h=(large?r*.74:fox?r*.72:cat?r*.64:rabbit?r*.50:r*.56)*(resting?.64:1)*(1-collapse*.52);
 const x=m.x,y=m.y;
 animalLift=0;
 // Shadow is projected to the walkable roof when standing on one.
 const contactZ=player?Math.max(0,m.groundZ||0):0;
 ellipsoid(x+r*.16,y+r*.22,contactZ+1.1,r*1.46,r*.72,1.4,"#1c302b",dir,9,3);
 animalLift=player?Math.max(0,m.jumpHeight||0):Math.max(0,m.type==="giantEagle"?m.airHeight||125:m.evadeHeight||0); // NPC feet and body rise during a real emergency leap.
 const tilt=collapse*1.23;
 animalCollapseTransform=player&&collapse>0?{x:m.x,y:m.y,cos,sin,pivot:contactZ+r*.18,ground:contactZ,ct:Math.cos(tilt),st:Math.sin(tilt)}:null;
 if(!player&&drawStrongAnimal3D(m,clock)){animalLift=0;animalCollapseTransform=null;return;}
 if(!player&&drawCommonAnimal3D(m,clock)){animalLift=0;animalCollapseTransform=null;return;}
 if(!player&&drawOrdinaryAnimal3D(m,clock)){animalLift=0;animalCollapseTransform=null;return;}
 // Feet and real joints are below the torso, and each species has its own proportions.
 for(const s of [-1,1])for(const k of [-1,1]){
  const front=k>0,lead=cat?(s<0?1:.60):fox?.9:large?.53:.65;
  const dx=k*r*.57+(front?(foreDrive(s,attackReach*lead)-attackPrep*.21)*r:(rushPose===4?-attackReach*r*(cat?.75:fox?.48:.28):0))+(k===s?1:-1)*gait*r*(cat?.34:fox?.34:wolf?.27:.22)+(chargePose&&front?-r*.15:0);
  const dy=s*r*.45+(front&&cat?attackReach*s*r*.08:0);
  const bob=Math.max(0,gait*(k===s?1:-1))*r*.29*moving+(player&&m.jumpTime>0?r*.18:0)+(front&&kickPose>0?(s<0?1:.35)*r*.48*kickPose:0);
  const pawLift=front?foreDrive(s,attackReach)*r*(cat?.34:fox?.20:.13):(rushPose===4?attackReach*r*.27:0);
  const legHeight=(fox?r*.51:cat?r*.45:rabbit?(front?r*.35:r*.46):r*.38)*(resting?.55:1)*(1-collapse*.68);
  // Separate upper joints and moving paws replace stiff single-piece legs.
  const jointFlex=Math.max(0,Math.sin(phase+(front?s:-s)*.6))*r*.10*moving;
  ellipsoid(fx(dx*.78-k*r*.08,dy*.89),fy(dx*.78-k*r*.08,dy*.89),
   legHeight*1.35+jointFlex+bodyBob*.24,r*.135,r*.13,legHeight*.40,
   large?"#596b6b":fox?"#a05f35":cat?"#909e91":base,dir,6,3);
  // Keep the bottom of each paw on or above its walkable surface.
  ellipsoid(fx(dx,dy),fy(dx,dy),legHeight+Math.max(0,bob)+pawLift,fox?r*.16:cat?r*.17:rabbit?(front?r*.15:r*.28):r*.21,fox?r*.14:cat?r*.14:rabbit?(front?r*.15:r*.24):r*.19,legHeight,large?"#465158":fox?"#372f2a":cat?"#89968b":base,dir,7,4);
 }
 ellipsoid(fx(r*(attackReach*.16-attackPrep*.16)+bodyDrive,0),fy(r*(attackReach*.16-attackPrep*.16)+bodyDrive,0),h+r*.28-attackPrep*r*.11+attackReach*r*.09+bodyBob,
  large?r*1.22:fox?r*1.15:cat?r*1.04:rabbit?r*.91:type==="dog"?r*1.08:rat?r*.76:pigeon?r*.72:r*.91,
  fox?r*.42:cat?r*.40:rabbit?r*.53:type==="dog"?r*.58:rat?r*.40:pigeon?r*.46:r*.69,
  large?r*.69:fox?r*.46:cat?r*.43:rabbit?r*.52:type==="dog"?r*.58:r*.55,torso,dir,11,6);
 if(rabbit){
  // Rounded haunches and broad hind feet, not four identical short legs.
  for(const side of [-1,1]){
   ellipsoid(fx(-r*.49,side*r*.39),fy(-r*.49,side*r*.39),h+r*.12,r*.42,r*.30,r*.39,torso,dir,9,5);
   ellipsoid(fx(-r*.78,side*r*.50),fy(-r*.78,side*r*.50),r*.19,r*.41,r*.23,r*.19,base,dir,8,4);
  }
 }
 if(type==="alpha"){
  // Dense shoulder mane and raised hackles give the alpha a heavier silhouette.
  ellipsoid(fx(r*.22,0),fy(r*.22,0),h+r*.60,r*.78,r*.83,r*.74,"#354d50",dir,10,6);
  for(let side of [-1,1])for(let k=0;k<3;k++)
   pyramid(fx(-r*.1+k*r*.31,side*r*.54),fy(-r*.1+k*r*.31,side*r*.54),h+r*.78,r*.16,r*.17,r*.31,"#3e5556");
 }
 // Fur belly visually breaks the silhouette.
 ellipsoid(fx(r*.22,0),fy(r*.22,0),h+r*.19,r*.62,r*.40,r*.40,belly,dir,9,5);
 const headDrive=r*(attackReach*((rushPose===1||rushPose===2)?.12:rushPose===4?.08:cat?.66:fox?.72:large?.48:.35)-attackPrep*.23);
 const neck=(large?r*.70:fox?r*.76:r*.64)+headDrive+bodyDrive*.75+turboPose*r*.15,headR=cat?r*.47:fox?r*.43:rabbit?r*.43:large?r*.53:r*.49;
 ellipsoid(fx(neck,0),fy(neck,0),h+r*.49+headAttention*.15,headR,headR*.80,headR*.83,torso,dir,10,6);
 if(fox||cat||wolf||rabbit||rat){
  for(const side of [-1,1]){
   const earLength=rabbit?r*1.08:rat?r*.22:wolf?r*.59:fox?r*.52:r*.38;
   const earWidth=rabbit?r*.14:rat?r*.22:r*.20;
   pyramid(fx(neck-r*.18,side*r*.40),fy(neck-r*.18,side*r*.40),h+r*.79,earWidth,r*.13,earLength,torso);
   if(rabbit)pyramid(fx(neck-r*.16,side*r*.40),fy(neck-r*.16,side*r*.40),h+r*.82,r*.075,r*.06,earLength*.82,"#dfaa9c");
  }
 }
 if(type==="boar"){
  ellipsoid(fx(r*1.15+headDrive,0),fy(r*1.15+headDrive,0),h+r*.32-attackReach*r*.12,r*.35,r*.42,r*.31,"#ba9a83",dir,8,5);
  for(const side of [-1,1])pyramid(fx(r*1.19+headDrive,side*r*.34),fy(r*1.19+headDrive,side*r*.34),h+r*.40-attackReach*r*.10,r*.12,r*.13,r*.36,"#e9d7ad");
 }else if(pigeon){
  for(const side of [-1,1])ellipsoid(fx(-r*.15,side*r*.55),fy(-r*.15,side*r*.55),h+r*.55,r*.60,r*.16,r*.25,"#aec3b8",dir,7,4);
 }else{
  ellipsoid(fx(r*1.06+headDrive,0),fy(r*1.06+headDrive,0),h+r*.42-attackReach*r*.06,fox?r*.60:rat?r*.24:r*.31,fox?r*.15:r*.23,fox?r*.16:r*.19,belly,dir,8,4);
 }
 if(pigeon){
  pyramid(fx(r*.95,0),fy(r*.95,0),h+r*.46,r*.23,r*.17,r*.27,"#d6b46c");
 }else if(rat){
  // Long tapered naked tail, unlike the cat's segmented raised tail.
  for(let i=0;i<5;i++){
   const t=i/5;
   ellipsoid(fx(-r*(.9+i*.35),Math.sin(i*.4)*r*.15),fy(-r*(.9+i*.35),Math.sin(i*.4)*r*.15),h*.25,r*(.29-t*.22),r*.075,r*.08,"#ba928b",dir,6,3);
  }
 }else if(rabbit){
  ellipsoid(fx(-r*.94,0),fy(-r*.94,0),h+r*.43,r*.35,r*.34,r*.36,"#f6efe0",dir,7,4);
 }else if(type==="dog"){
  // Drooping ears and long muzzle make dogs distinct from wolves.
  for(const side of [-1,1])ellipsoid(fx(neck-r*.16,side*r*.51),fy(neck-r*.16,side*r*.51),h+r*.57,r*.25,r*.19,r*.36,torso,dir,7,4);
 }
 if(cat){
  // A bent segmented tail is visibly different from the fox's dense brush.
  for(let i=0;i<4;i++){
   const dx=-r*(1.06+i*.33),dy=Math.sin(clock*2+i*.7)*r*.25,z=h+r*(.43+i*.16);
   ellipsoid(fx(dx,dy),fy(dx,dy),z,r*.21,r*.105,r*.11,torso,dir,6,4);
  }
 }else if(fox){
  const sway=Math.sin(clock*3.1+phase*.13)*r*.22*(.45+.55*moving);
  ellipsoid(fx(-r*1.40,sway*.34),fy(-r*1.40,sway*.34),h+r*.48,r*.60,r*.30,r*.28,torso,dir,8,4);
  ellipsoid(fx(-r*1.93,sway),fy(-r*1.93,sway),h+r*.49,r*.80,r*.48,r*.43,"#c77742",dir,10,5);
  ellipsoid(fx(-r*2.57,sway*1.17),fy(-r*2.57,sway*1.17),h+r*.50,r*.35,r*.31,r*.31,"#f1dfbf",dir,8,5);
 }else if(wolf){
  const tailY=Math.sin(clock*2.1+phase*.20)*r*.10;
  ellipsoid(fx(-r*1.18,tailY),fy(-r*1.18,tailY),h+r*.43,r*.56,r*.31,r*.30,torso,dir,8,4);
 }
 if(attackReach>.01&&(fox||wolf||type==="dog")&&(!player||rushPose===3||rushPose===5)){
  // Cat uses its existing forepaw; canids open the jaw along the moving skull.
  ellipsoid(fx(r*1.04+headDrive,0),fy(r*1.04+headDrive,0),h+r*(.22-attackReach*.13),r*.37,r*.25,r*.12,"#28302b",dir,8,4);
  ellipsoid(fx(r*1.1+headDrive,0),fy(r*1.1+headDrive,0),h+r*(.14-attackReach*.12),r*.32,r*.24,r*.10,belly,dir,8,4);
 }
 // Sparse coat patches follow torso articulation without per-hair GPU overload.
 if(cat||fox||wolf||type==="dog"){
  for(const side of [-1,1])for(let k=0;k<3;k++){
   const localX=r*(-.53+k*.45)+bodyDrive*.55;
   const localY=side*r*(fox?.29:wolf?.45:.36);
   const z=h+r*(cat?.58:fox?.60:.75)+bodyBob*.56;
   const patch=cat?(k===1?"#bac2b1":"#78897d"):fox?(k===2?"#df9b5b":"#9c5d3e"):wolf?"#52676c":"#80614c";
   ellipsoid(fx(localX,localY),fy(localX,localY),z,r*.24,r*.12,r*.07,patch,dir,6,3);
  }
 }
 // Eyes distinguish living characters from scenery at oblique camera distance.
 for(const side of [-1,1]){
  ellipsoid(fx(neck+r*.32,side*headR*.53),fy(neck+r*.32,side*headR*.53),h+r*.58,r*.105,r*.08,r*.09,cat?"#d1f18e":"#edcc88",dir,5,3);
  ellipsoid(fx(neck+r*.37,side*headR*.57),fy(neck+r*.37,side*headR*.57),h+r*.587,r*.037,r*.034,r*.047,"#172420",dir,5,3);
 }
 animalLift=0;animalCollapseTransform=null;
}
// Palette is applied to the native 3D leaf/grass mesh, not merely a CSS tint.
// Game climate calendar: one game day is 85 seconds; leap days and YEAR progression
// are intentionally not introduced here. Index: winter/spring/summer/autumn.
const SEASONAL_FOLIAGE=[
 {shrub:["#a4a996","#8b947e","#b8baa4"],grass:"#929a80",reed:"#a4a78b"},
 {shrub:["#a0cc72","#7fb45d","#b8d58c"],grass:"#81b967",reed:"#9bc46d"},
 {shrub:["#548f54","#3e7648","#477e51"],grass:"#4d8548",reed:"#5c9156"},
 {shrub:["#d49a48","#b96c3e","#c35c35"],grass:"#a89b56",reed:"#aa8050"}
];
function seasonIndexFromElapsed(seconds){
 const day=((Math.floor(Math.max(0,seconds)/85)%365)+365)%365;
 return day<59||day>=334?0:day<151?1:day<243?2:3;
}
function vegetation(p,clock,season=2){
 const palette=SEASONAL_FOLIAGE[season]||SEASONAL_FOLIAGE[2];
 if(p.type===2&&season===0&&!p.denSite&&!p.trainingCover)return;
 const dense=p.type===2||p.r>=18;
 const r=p.r*(p.type===2?.74:dense?.94:.70);
 const count=p.type===2?34:dense?24:8;
 // Multi-angle pointed leaves replace old green pyramids; dense patches conceal.
 for(let i=0;i<count;i++){
  const a=i*2.39996+p.phase,rad=r*(.12+(i%5)*.12);
  const bx=p.x+Math.cos(a)*rad,by=p.y+Math.sin(a)*rad;
  const height=r*(dense?.75:.43)*(.78+(i%6)*.13),width=Math.max(.6,r*(.055+(i%3)*.012));
  const sway=Math.sin(clock*1.55+p.phase+i)*r*.045;
  const tip=[bx+Math.cos(a)*r*.21+sway,by+Math.sin(a)*r*.18,height];
  const tint=color(season===0?["#406f55","#5a8c66","#345943"][i%3]:palette.shrub[i%3]);
  const cross=color(season===0?"#3c7058":palette.grass);
  triangle([bx-width,by,1],[bx+width,by,1],tip,tint);
  triangle([bx,by-width,1],[bx,by+width,1],tip,cross);
 }
}
// Food shares depth with terrain, buildings and animals.
function foodMesh(c,species){
 const r=Math.max(6,Math.min(24,c.r||9));
 animalLift=0;
 ellipsoid(c.x+2,c.y+4,1.4,r*1.5,r*.82,1.3,"#243027",0,7,3);
 if(c.type==="corpse"||c.type==="bones"){
  const size=Math.max(14,Math.min(36,(c.r||9)*1.28)),angle=c.phase||0,cs=Math.cos(angle),sn=Math.sin(angle);
  const fraction=clamp(Number(c.amount)/Math.max(1,Number(c.initialAmount)||Number(c.amount)||1),0,1);
  const part=(x,y,z,rx,ry,rz,col,turn=angle)=>ellipsoid(c.x+x*cs-y*sn,c.y+x*sn+y*cs,z,rx,ry,rz,col,turn,7,3);
  if(c.type==="bones"){
   part(-size*.05,0,3,size*.95,size*.12,2.7,"#f1ebdc");
   for(let i=0;i<4;i++)for(const side of [-1,1])part((-.55+i*.35)*size,side*size*.29,2.8,size*.11,size*.37,2,"#e6dfcd",angle+side*.20);
   part(size*.96,0,3.8,size*.37,size*.30,3.4,"#f1ebdc");
   for(const side of [-1,1])part(size*1.05,side*size*.15,6.4,size*.08,size*.08,1.2,"#3b443e");
  }else{
   const fur=species?.[c.animalType]?.color||"#a58c76",belly=species?.[c.animalType]?.belly||"#bcae99";
   part(-size*.99,0,4,size*.47,size*.15,3,fur,angle-.25);
   for(const side of [-1,1])for(const front of [-1,1])part(front*size*.55,side*size*.65,4.4,size*.24,size*.44,4.1,fur,angle+front*.2);
   part(-size*.08,0,7,size*(.9+.17*fraction),size*.60,6.1,fur);
   part(size*.06,size*.20,11,size*.63,size*.22,2,belly);
   part(size*.84,-size*.07,7.4,size*.45,size*.38,5.2,fur);
   for(const side of [-1,1])part(size*.75,side*size*.4,6,size*.19,c.animalType==="rabbit"?size*.47:size*.24,3.4,fur);
   part(size*1.23,-size*.04,6.5,size*.09,size*.08,2,"#3b3330");
  }
 }else if(c.type==="meat"){
  ellipsoid(c.x,c.y,4.2,r*1.03,r*.70,3.8,"#a85149",-.24,10,5);
  ellipsoid(c.x+r*.70,c.y-r*.16,4.4,r*.42,r*.20,1.4,"#d6b2a2",-.24,7,3);
  ellipsoid(c.x+r*1.05,c.y-r*.18,4.8,r*.18,r*.21,2.0,"#eee2c6",0,7,3);
 }else{
  ellipsoid(c.x,c.y,2.9,r*1.03,r*.90,2.5,"#527b51",0,9,4);
  for(let k=0;k<5;k++){
   const angle=k*TAU/5;
   ellipsoid(c.x+Math.cos(angle)*r*.53,c.y+Math.sin(angle)*r*.47,5.0,r*.25,r*.25,2.3,k%2?"#cf956b":"#c96e55",0,6,3);
  }
 }
}
function carriedFoodMesh(p){
 const c=p.carry;if(!c||!(c.amount>0))return;
 animalLift=0;
 const dir=p.dir||0,cs=Math.cos(dir),sn=Math.sin(dir),r=Math.max(7,Math.min(13,6+Math.sqrt(c.amount)));
 const x=p.x+cs*p.r*1.45,y=p.y+sn*p.r*1.45,z=Math.max(0,p.jumpHeight||p.groundZ||0)+p.r*.72;
 if(c.type==="berries"){
  ellipsoid(x,y,z,r,6,5,"#52774d",dir,9,4);
  for(let i=0;i<4;i++)ellipsoid(x+cs*(i-1.5)*r*.3,y+sn*(i-1.5)*r*.3,z+3,3,2.5,2.8,i%2?"#d5a36d":"#c36c55",dir,6,3);
 }else{
  ellipsoid(x,y,z,r+2,7,5.5,"#61282a",dir,10,5);
  ellipsoid(x-cs*1.4,y-sn*1.4,z+2,r,6.2,4.5,"#b94c49",dir,10,5);
  ellipsoid(x-cs*r*.35,y-sn*r*.35,z+5,r*.48,2.3,1.1,"#e08a78",dir,7,3);
  ellipsoid(x+cs*r*.78,y+sn*r*.78,z+1,3.3,2.7,2.4,"#edc9b3",dir,7,3);
 }
}
function denBeddingMesh(d){
 if(!d)return;
 animalLift=0;
 const x=d.x,y=d.y,k=d.type,level=d.level||1,z=d.z||0;
 const size=1+level*.10,cat=k==="cat",fox=k==="fox";
 ellipsoid(x,y,z+1.1,55*size,38*size,1.6,"#273b30",0,10,3);
 ellipsoid(x,y,z+2.1,45*size,30*size,2.3,cat?"#998e77":fox?"#8f774a":"#676448",0,10,3);
 ellipsoid(x,y,z+2.8,31*size,19*size,2.1,cat?"#687969":fox?"#5a6342":"#5d6e4b",0,9,3);
 for(let i=0;i<11+level*4;i++){
  const a=i*2.39996,r=21+(i%5)*7;
  ellipsoid(x+Math.cos(a)*r,y+Math.sin(a)*r*.73,z+3.4,6,2.2,1,
   cat?"#bda786":fox?(i%2?"#b78351":"#d0ac71"):"#a3936a",a,6,2);
 }
 if(cat){
  box(x-47,y-32,z+1,94,4,7,"#9b8667");
  box(x-47,y+28,z+1,94,4,7,"#9b8667");
 }else if(!fox){
  box(x-48,y-31,z+1,96,5,7,"#615b42");
  box(x-48,y+27,z+1,96,5,7,"#615b42");
 }
 if(d.stash>0)ellipsoid(x+32,y+16,z+4,Math.min(20,8+d.stash*.06),8,5,"#a8906b",0,8,3);
 // Small permanent site details distinguish each den without extra UI markers.
 if(d.kind==="roof"){
  for(let j=0;j<3;j++)box(x-45+j*29,y+27,z+.5,21,4,3,"#8b9a9e");
 }else if(d.kind==="ruin"){
  for(let j=0;j<4;j++)box(x-53+j*27,y-41+j%2*6,z+.5,13,8,6,"#878379");
 }else if(d.kind==="yard"){
  for(let j=0;j<3;j++)box(x-42+j*34,y-41,z+.5,25,5,4,"#717c6d");
 }else if(d.kind==="reeds"){
  for(let j=0;j<7;j++)pyramid(x-65+j*19,y+42,z+2,3,3,31+j%3*7,j%2?"#b7b47d":"#8caa73");
 }
}
function detailNoise(n){const x=Math.sin(n*127.1+37.19)*43758.5453;return x-Math.floor(x);}
// Lightweight location-specific 3D detail, decorative only.
function landmarkMesh(site){
 const x=site.x,y=site.y;animalLift=0;
 if(site.id==="zoo"){
  for(const s of [-1,1])for(let i=0;i<7;i++)box(x-130+i*42,y+s*105,0,5,7,68,"#84938a");
  box(x-130,y-105,63,265,7,10,"#9d9d87");
 }else if(site.id==="forest"){
  for(let i=0;i<12;i++){
   const a=i*TAU/12,tx=x+Math.cos(a)*185,ty=y+Math.sin(a)*185;
   box(tx-5,ty-5,0,10,10,67,"#62543e");
   pyramid(tx,ty,35,29,25,105,"#46774b");
  }
 }else if(site.id==="factory"){
  for(let i=0;i<3;i++)box(x-130+i*108,y-115,0,35,35,120+i*18,"#76716b");
  for(let i=0;i<3;i++)box(x-142+i*105,y+95,0,95,43,35,"#7c6559");
 }else if(site.id==="canal"){
  box(x-220,y-110,-1,440,220,1,"#386776");
  for(const s of [-1,1])for(let i=0;i<6;i++)
   box(x-215+i*85,y+s*115,0,6,6,32,"#9ca7a0");
  box(x+70,y-30,1,110,44,14,"#8f8779");
 }else if(site.id==="river"){
  box(x-230,y-140,-1,460,280,1,"#3d6373");
  box(x-180,y-16,1,360,32,8,"#909285");
  for(let i=0;i<8;i++)ellipsoid(x+Math.cos(i*TAU/8)*214,y+Math.sin(i*TAU/8)*121,1,20,16,6,"#869087",0,7,4);
 }else if(site.id==="ark"){
  box(x-88,y-64,0,176,128,12,"#5b6764");
  box(x-61,y-38,12,122,76,5,"#263e43");
  for(let i=0;i<7;i++)box(x-57+i*18,y-35,17,5,70,3,"#8da49e");
  box(x-105,y-75,0,20,27,96,"#88928d");box(x+85,y-75,0,20,27,96,"#88928d");
 }
}
function terrain(w,roadsX,roadsY,isVisible,buildings=[]){
 // Raised road edges, lane paint and broken curbs give a consistent world-space scale.
 box(0,0,-6,w.w,w.h,6,"#26392f","#53634b");
 // Regional ground changes visibly without drawing every distant building.
 
 const regionalBases=[
  [0,0,1400,2600,"#455552","#64716c"],[1400,0,1400,2600,"#584f47","#85715e"],
  [2800,0,1400,2600,"#31533a","#608854"],[4200,0,2100,2600,"#455447","#66796b"],
  [6300,0,2100,2600,"#6a7256","#9aa17b"],[0,2600,2800,3400,"#244c33","#3f8150"],
  [2800,2600,2800,3400,"#554d48","#897565"],[5600,2600,2800,3400,"#405960","#6b8e96"]
 ];
 for(const [x,y,w,h,base,top] of regionalBases)box(x,y,-.4,w,h,.45,base,top);
 const river=y=>7505+68*Math.sin(y/390),canal=x=>5025+35*Math.sin(x/390);
 for(let y=0;y<2600;y+=125){
  const y2=Math.min(2600,y+125),a=river(y),b=river(y2),h=133;
  if(!isVisible((a+b)/2,(y+y2)/2,440))continue;
  quad([a-h-22,y,.13],[a+h+22,y,.13],[b+h+22,y2,.13],[b-h-22,y2,.13],color("#a8af91"));
  quad([a-h,y,.18],[a+h,y,.18],[b+h,y2,.18],[b-h,y2,.18],color("#34788b"));
  box((a+b)/2-33,(y+y2)/2,.2,65,2,.10,"#72aab6","#a4d2ca");
 }
 for(let x=5600;x<8400;x+=125){
  const x2=Math.min(8400,x+125),a=canal(x),b=canal(x2),h=100;
  if(!isVisible((x+x2)/2,(a+b)/2,440))continue;
  quad([x,a-h-23,.13],[x2,b-h-23,.13],[x2,b+h+23,.13],[x,a+h+23,.13],color("#929b91"));
  quad([x,a-h,.18],[x2,b-h,.18],[x2,b+h,.18],[x,a+h,.18],color("#2c687f"));
  box((x+x2)/2,(a+b)/2-28,.2,52,2,.10,"#64a0b0","#afc7c4");
 }

 for(const y of roadsY){
  box(0,y-80,0,w.w,160,1,"#323d3e","#344145");
  box(0,y-86,0,w.w,6,2,"#565d54","#717e68");
  box(0,y+80,0,w.w,6,5,"#565d54","#717e68");
  for(let x=140;x<w.w;x+=280){
   if(!isVisible(x,y,850))continue; // Distant road details do not belong in the local GPU mesh.
   box(x,y-2,1,76,4,.8,"#697066","#8d9285");
   if(detailNoise(x+y)>.45)pyramid(x+88,y+83,2,15,10,13,"#596b53");
  }
 }
 for(const x of roadsX){
  box(x-80,0,.18,160,w.h,1,"#323d3e","#344145");
  box(x-86,0,.18,6,w.h,2,"#565d54","#717e68");
  box(x+80,0,.18,6,w.h,5,"#565d54","#717e68");
  for(let y=150;y<w.h;y+=280){
   if(!isVisible(x,y,850))continue; // Nearby details return after camera region changes.
   box(x-2,y,1.18,4,70,.8,"#697066","#8d9285");
   if(detailNoise(x+y)>.45)pyramid(x+84,y+82,2,13,11,16,"#536e54");
  }
 }
 // Deterministic, low-poly district landmarks across the whole region, not only at the six quest pins.
 const styles=[
 [0,0,1400,2600,"barrier"],[1400,0,1400,2600,"rail"],[2800,0,1400,2600,"ivy"],[4200,0,2100,2600,"cage"],
 [6300,0,2100,2600,"reeds"],[0,2600,2800,3400,"forest"],[2800,2600,2800,3400,"factory"],[5600,2600,2800,3400,"dock"]
 ];
 for(const [zx,zy,zw,zh,kind] of styles){
  const step=kind==="forest"?280:385;
  for(let y=zy+120;y<zy+zh-75;y+=step)for(let x=zx+120;x<zx+zw-75;x+=step){
   const n=detailNoise(x*.011+y*.017),px=x+(n-.5)*65,py=y+(detailNoise(x*.013-y*.021)-.5)*65;
   if(n<.20||!isVisible(px,py,150))continue;
   if(roadsX.some(v=>Math.abs(px-v)<112)||roadsY.some(v=>Math.abs(py-v)<112))continue;
   if(buildings.some(b=>px>b.x-65&&px<b.x+b.w+65&&py>b.y-65&&py<b.y+b.h+65))continue;
   if(kind==="reeds"&&Math.abs(px-river(py))<177||kind==="dock"&&Math.abs(py-canal(px))<150)continue;
   if(kind==="barrier"){
    box(px-34,py-10,0,68,20,16,"#888b83","#c1bba8");
    for(let k=-2;k<=2;k++)box(px+k*12,py-12,16,5,24,2,"#b19a65");
   }else if(kind==="rail"){
    for(let k=-2;k<=2;k++)box(px+k*14,py-45,0,6,90,3,"#98816b");
    for(const off of [-20,20])box(px-38,py+off,2,76,6,3,"#a9aaa1");
   }else if(kind==="ivy"){
    for(let k=0;k<6;k++){const a=k*TAU/6;pyramid(px+22*Math.cos(a),py+20*Math.sin(a),0,25,19,34,"#448b51");}
   }else if(kind==="cage"){
    for(const xx of [-42,0,42])for(const yy of [-28,28])box(px+xx-2,py+yy-2,0,4,4,62,"#9ca7a0");
    for(const yy of [-28,28])box(px-44,py+yy,46,88,4,5,"#b5c0b2");
   }else if(kind==="reeds"){
    for(let k=-4;k<=4;k++)pyramid(px+k*8,py+(k%3)*14,0,5,5,24+(k+4)%4*9,"#a2b67b");
   }else if(kind==="forest"){
    box(px-6,py-7,0,12,14,79,"#635339");
    pyramid(px,py,52,41,38,98,"#2b7b46");
    pyramid(px+7,py+4,92,27,25,54,"#4b9959");
   }else if(kind==="factory"){
    box(px-40,py-20,0,80,40,17,"#9a7660","#c39c79");
    box(px-40,py-20,17,80,40,7,"#765a50");
    for(const t of [-30,30])box(px+t,py-5,0,7,10,47,"#8b8580");
   }else if(kind==="dock"){
    box(px-46,py-30,0,92,60,5,"#796a59","#b2a18b");
    for(let k=-3;k<=3;k++)box(px+k*12,py-30,5,4,60,3,"#685f50");
    for(const t of [-35,35])box(px+t-4,py-35,0,8,8,38,"#748d8e");
   }
  }
 }

}
let failed=false,frames=0;
canvas.addEventListener("webglcontextlost",e=>{e.preventDefault();failed=true;window.Wild3D.available=false;canvas.style.display="none";});
canvas.addEventListener("webglcontextrestored",()=>{
 try{
  // A restored WebGL context invalidates shaders, programs and GPU buffers.
  initializeGPU();staticBuffer=gl.createBuffer();staticKey="";staticCount=0;dynamicCount=0;
  failed=false;canvas.style.display="block";window.Wild3D.available=true;
 }catch(err){
  failed=true;window.Wild3D.available=false;canvas.style.display="none";
  console.warn("Wild3D context restoration failed; Canvas2D remains active",err);
 }
});
function render(o){
 if(failed)return false;
 try{
  const {vw,vh,dpr,cam,VIEW,buildings,plants,carcasses,mobs,P,elapsed,weather,WORLD,species}=o;
  const width=Math.max(1,Math.round(vw*dpr)),height=Math.max(1,Math.round(vh*dpr));
  if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
  gl.viewport(0,0,width,height);
  // Explicit dawn/noon/sunset/night profile is shared with the 2D world.
  const profile=o.lightProfile||{brightness:Math.max(0,Math.sin(((6+(elapsed%85)/85*24)%24-6)*Math.PI/12)),warmth:0,tint:[1,1,1]};
  const overcast=weather==="THUNDER"?.22:weather==="RAIN"?.14:weather==="CLOUDY"?.12:weather==="FOG"?.10:0;
  // The shared profile already includes lunar phase and weather attenuation.
  // Preserve a minimum silhouette light during storms and new moon.
  const night=clamp(Math.max(0,1-profile.brightness)+overcast*.8,0,.91),warm=profile.warmth||0;
  gl.clearColor(
   clamp(.018+profile.brightness*.145+warm*.11,0,1),
   clamp(.030+profile.brightness*.175+warm*.018,0,1),
   clamp(.066+profile.brightness*.16-warm*.018,0,1),1);
  gl.clearDepth(1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  const isVisible=(x,y,margin=150)=>{
   const dx=x-cam.x-vw/2,dy=y-cam.y-vh/2;
   const sx=vw/2+VIEW.a*dx+VIEW.c*dy,sy=vh/2+VIEW.b*dx+VIEW.d*dy;
   return sx>-margin&&sx<vw+margin&&sy>-margin&&sy<vh+margin;
  };
  // Rebuild the static room only when the roof changes to its playable cutaway.
  const interiorReveal=buildings.filter(b=>b.interior).map(b=>P&&Math.hypot(P.x-b.x-b.w*.5,P.y-b.y-b.h*.5)<Math.max(b.w,b.h)*.92?1:0).join("");
  const regionKey=[Math.floor(cam.x/240),Math.floor(cam.y/240),vw,vh,...[VIEW.a,VIEW.b,VIEW.c,VIEW.d].map(v=>Math.round(v*12)),buildings.length,(o.streetProps||[]).length,WORLD.w,WORLD.h,interiorReveal].join(":");
  if(regionKey!==staticKey){
   data=[];terrain(WORLD,o.roadsX||[530,1410,2320,3270],o.roadsY||[465,1170,1890],isVisible,buildings);
   for(const site of o.landmarks||[])if(isVisible(site.x,site.y,600))landmarkMesh(site);
   for(const b of buildings){
   if(!isVisible(b.x+b.w/2,b.y+b.h/2,680))continue;
   if(b.interior){
    // Geometry matches the five physical wall rectangles in game.js.
    const wall=15,door=b.x+b.w*.5,half=55,high=83;
    box(b.x+wall,b.y+wall,-2,b.w-2*wall,b.h-2*wall,3,"#263e3b","#3c5850");
    const walls=[
     [b.x,b.y,door-half-b.x,wall],
     [door+half,b.y,b.x+b.w-door-half,wall],
     [b.x,b.y,wall,b.h],
     [b.x+b.w-wall,b.y,wall,b.h],
     [b.x,b.y+b.h-wall,b.w,wall]
    ];
    for(const [x,y,w,h] of walls)box(x,y,0,w,h,high,"#5c6c67","#9caba0");
    for(const [x,y,w,h] of [
      [b.x+34,b.y+b.h*.57,52,31],
      [b.x+b.w-92,b.y+b.h*.58,54,30]
    ])box(x,y,0,w,h,24,"#5b675a","#8e927a");
    box(door-half,b.y-3,0,2*half,6,3,"#9a8658","#d4c58a");
    const reveal=!!P&&Math.hypot(P.x-b.x-b.w*.5,P.y-b.y-b.h*.5)<Math.max(b.w,b.h)*.92;
    if(!reveal)box(b.x,b.y,high,b.w,b.h,8,"#394b4a","#67766c");
    else{
     // Roof cutaway exposes animals and furniture after the player approaches.
     box(b.x,b.y,high,b.w*.15,b.h,7,"#455653","#7c8979");
     box(b.x+b.w*.85,b.y,high,b.w*.15,b.h,7,"#455653","#7c8979");
     box(b.x+b.w*.15,b.y+b.h*.84,high,b.w*.70,b.h*.16,7,"#455653","#7c8979");
    }
    continue;
   }
   const h=b.roofZ||135+(b.kind%4)*75; // Low roofs have matching walkable height.
   box(b.x,b.y,0,b.w,b.h,h,b.kind%2?"#56646c":"#67736d",b.kind%2?"#45545b":"#58665e");
   box(b.x+13,b.y+13,h-5.2,b.w-26,b.h-26,6,"#394e50","#87918a");
   if(b.broken)box(b.x+b.w*.65,b.y+b.h*.28,h+.8,b.w*.23,b.h*.30,14,"#343f42","#5e6a64");
   // Air conditioning and roof ducts
   box(b.x+b.w*.16,b.y+b.h*.2,h+.8,28,35,28,"#586767","#9da39a");
   box(b.x+b.w*.72,b.y+b.h*.64,h+.8,36,25,19,"#546667","#8e9992");
   // Broken parapets, displaced concrete and climbing vegetation use real height.
   for(let i=0;i<6;i++){
    const q=detailNoise(b.seed*37+i*17),t=detailNoise(b.seed*71+i*29);
    const bx=b.x+(i%2?b.w*.91:b.w*.09)+(q-.5)*15;
    const by=b.y+b.h*(.12+t*.76);
    pyramid(bx,by,1,9+q*16,8+t*13,7+q*23,i%3?"#6d716a":"#536b55");
    if(i<3){
     const wallX=b.x+(i%2?b.w*.97:b.w*.03);
     pyramid(wallX,by,18+t*h*.55,11,13,35+q*65,"#42614b");
    }
   }
   // Windows and masonry accents are extruded, keeping the world from looking painted-flat.
   for(let k=1;k<5;k++){
    const z=k*h/5;
    for(let j=1;j<5;j++){
     box(b.x+j*b.w/5-11,b.y-1,z,22,3,12,"#789294","#a2b4ac");
     box(b.x+b.w-1,b.y+j*b.h/5-11,z,3,22,12,"#50656a","#85918a");
    }
   }
   }
   // Abandoned traffic has real 3D depth and matches the fallback drawings.
   for(const prop of o.streetProps||[]){
    if(!isVisible(prop.x,prop.y,150))continue;
    const x=prop.x,y=prop.y;
    if(prop.type==="car"){
     const horiz=Math.abs(prop.dir)<.5,w=horiz?70:38,h=horiz?38:70;
     box(x-w/2,y-h/2,2,w,h,16,prop.seed%2?"#7d6b60":"#63726c","#88928b");
     box(x-w*.24,y-h*.34,18,w*.48,h*.68,17,"#50646b","#6a8080");
     for(const side of [-1,1])for(const back of [-1,1])
      box(x+side*w*.34-6,y+back*h*.44-6,0,12,12,12,"#1e282b","#363c3a");
    }else if(prop.type==="bicycle"){
     for(const side of [-1,1])box(x+side*13-7,y-6,1,14,12,13,"#34403f","#778986");
     box(x-16,y-2,10,32,4,5,"#9aab9e","#aebfb1");
    }else if(prop.type==="vending"){
     box(x-14,y-10,1,28,20,42,"#885b53","#b57960");
     box(x-11,y-11,15,21,4,21,"#acc4bd","#d6d6c3");
    }else if(prop.type==="barrier"){
     box(x-19,y-4,3,38,8,13,"#c59e6c","#ebc288");
    }else{
     box(x-2,y-2,0,4,4,43,"#52655f","#8e9585");
     box(x-13,y-3,28,26,6,19,"#67817a","#a2aca0");
    }
   }
   const staticVertices=new Float32Array(data);
   gl.bindBuffer(gl.ARRAY_BUFFER,staticBuffer);
   gl.bufferData(gl.ARRAY_BUFFER,staticVertices,gl.STATIC_DRAW);
   staticCount=staticVertices.length/9;
   staticKey=regionKey;staticRebuilds++;
  }
  data=[];
  const foliageSeason=seasonIndexFromElapsed(elapsed);
  for(const p of plants)if(isVisible(p.x,p.y,p.r*2+90))vegetation(p,elapsed,foliageSeason);
  for(const den of o.dens||[])if(isVisible(den.x,den.y,160))denBeddingMesh(den);
  // Lightweight water wakes match the physical depth model; skip dry bridges and stationary actors.
  if(typeof o.waterAt==="function"){
   animalLift=0;
   for(const a of [P,...mobs]){
    if(!a||!isVisible(a.x,a.y,95)||Math.hypot(a.vx||0,a.vy||0)<25)continue;
    if(a===P&&(a.jumpTime>0||a.pounceTime>0||(a.jumpHeight||0)>(a.groundZ||0)+8))continue;
    if(o.waterAt(a.x,a.y)<.10)continue;
    const r=Math.max(10,Math.min(38,(a.r||16)*1.3));
    ellipsoid(a.x,a.y,.58,r,r*.68,.32,"#8fc1c2",a.dir||0,9,2);
   }
  }
  const ghostStart=data.length/9; // Food and every animal; not vegetation.
  for(const c of carcasses)if(isVisible(c.x,c.y,50))foodMesh(c,species);
  for(const m of mobs)if(isVisible(m.x,m.y,110)){animal({...m,...species[m.type]},false,elapsed);}
  for(const bird of o.birdFlocks||[]){
   if(!isVisible(bird.x,bird.y,170))continue;
   const x=bird.x,y=bird.y,z=bird.z||55,c=Math.cos(bird.dir),s=Math.sin(bird.dir);
   const resting=bird.roostState==="rest";
   const wing=resting?0:Math.sin(bird.wing)*11,spread=resting?6:19;
   const colorWing=color(bird.type==="crow"?"#243036":"#91a19b");
   const pt=(dx,dy,dz)=>[x+dx*c-dy*s,y+dx*s+dy*c,z+dz];
   triangle(pt(-7,-2,0),pt(6,0,1),pt(resting?-10:-13,-spread,wing),colorWing);
   triangle(pt(-7,2,0),pt(6,0,1),pt(resting?-10:-13,spread,-wing),colorWing);
   ellipsoid(x,y,z,8,3,3,bird.type==="crow"?"#293537":"#a5b1a9",bird.dir,6,3);
  }
  const playerFirst=data.length/9;
  if(P){animal({...P,color:P.base.color,belly:P.base.belly},true,elapsed);carriedFoodMesh(P);}
  const playerEnd=data.length/9;
  const ghostEnd=playerEnd;
  const vertices=new Float32Array(data);
  gl.useProgram(program);
  gl.uniform2f(ucenter,cam.x+vw/2,cam.y+vh/2);
  gl.uniform2f(usize,vw,vh);
  gl.uniform4f(uview,VIEW.a,VIEW.b,VIEW.c,VIEW.d);
   gl.uniform1f(uzoom,clamp(o.cameraZoom||1,.47,1.6));
  gl.uniform1f(unight,night);gl.uniform3f(utint,profile.tint[0],profile.tint[1],profile.tint[2]);
  const vision=o.nightVision;
  gl.uniform4f(unightVision,P?.x||0,P?.y||0,P?.dir||0,vision?.range||1);
  gl.uniform1f(unightVisionStrength,vision?.strength||0);gl.uniform1f(ualpha,1);gl.disable(gl.BLEND);gl.depthMask(true);
  const bindAttributes=(buf)=>{
   gl.bindBuffer(gl.ARRAY_BUFFER,buf);
   for(const [a,offset] of [[attrPos,0],[attrNormal,12],[attrColor,24]]){
    if(a<0)continue;
    gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,3,gl.FLOAT,false,36,offset);
   }
  };
  bindAttributes(staticBuffer);
  if(staticCount)gl.drawArrays(gl.TRIANGLES,0,staticCount);
  bindAttributes(buffer);
  gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.DYNAMIC_DRAW);
  dynamicCount=vertices.length/9;
  // Occluded silhouettes are drawn once per pixel behind static architecture.
  // Stencil prevents overlapping body triangles from accumulating alpha.
  if(ghostEnd>ghostStart&&gl.getContextAttributes()?.stencil){
   gl.clearStencil(0);gl.stencilMask(0xff);gl.clear(gl.STENCIL_BUFFER_BIT);
   gl.enable(gl.STENCIL_TEST);gl.stencilFunc(gl.EQUAL,0,0xff);
   gl.stencilOp(gl.KEEP,gl.KEEP,gl.INCR);
   gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
   gl.depthFunc(gl.GREATER);gl.depthMask(false);gl.uniform1f(ualpha,.25);
   gl.drawArrays(gl.TRIANGLES,ghostStart,ghostEnd-ghostStart);
   gl.disable(gl.STENCIL_TEST);gl.depthFunc(gl.LEQUAL);gl.depthMask(true);
   gl.disable(gl.BLEND);gl.uniform1f(ualpha,1);
  }
  if(playerFirst)gl.drawArrays(gl.TRIANGLES,0,playerFirst);
  if(P&&playerEnd>playerFirst){
   if(P.hidden){
    // Depth-only prepass prevents 43% alpha from accumulating across
    // overlapping 3D body triangles and turning a hidden animal opaque.
    gl.colorMask(false,false,false,false);
    gl.depthMask(true);
    gl.drawArrays(gl.TRIANGLES,playerFirst,playerEnd-playerFirst);
    gl.colorMask(true,true,true,true);
    gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    gl.depthFunc(gl.EQUAL);gl.depthMask(false);gl.uniform1f(ualpha,.43);
   }
   gl.drawArrays(gl.TRIANGLES,playerFirst,playerEnd-playerFirst);
   if(P.hidden)gl.depthFunc(gl.LEQUAL);
   gl.depthMask(true);gl.disable(gl.BLEND);gl.uniform1f(ualpha,1);
  }
  frames++;
  return true;
 }catch(e){
  if(!failed)console.error("Wild3D rendering error; Canvas2D restored",e);
  failed=true;window.Wild3D.available=false;canvas.style.display="none";return false;
 }
}
window.Wild3D={available:true,render,get frames(){return frames},
 get stats(){return {staticRebuilds,staticTriangles:staticCount/3,dynamicTriangles:dynamicCount/3}}};
})();
