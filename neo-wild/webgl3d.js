/* WILD RECLAIM -- progressive native WebGL 3D renderer.
 * Original world physics, navigation, missions and persistence remain in game.js.
 * Orthographic 3D mesh rendering + depth buffer. Falls back to Canvas2D on failure.
 */
(() => {
"use strict";
const canvas=document.getElementById("scene3d");
if(!canvas){window.Wild3D={available:false};return;}
let gl;
try {gl=canvas.getContext("webgl",{alpha:false,depth:true,antialias:true,premultipliedAlpha:false});}catch(_){}
if(!gl){canvas.style.display="none";window.Wild3D={available:false};return;}
const vertex=String.raw`
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec3 aColor;
uniform vec2 uCenter;
uniform vec2 uSize;
uniform vec4 uView;
uniform float uNight;
varying vec3 vColor;
varying float vShade;
void main(){
 vec2 d=aPosition.xy-uCenter;
 float sx=uSize.x*0.5+uView.x*d.x+uView.z*d.y;
 float sy=uSize.y*0.5+uView.y*d.x+uView.w*d.y-aPosition.z*0.93;
 float zDepth=-(uView.y*d.x+uView.w*d.y)*0.56-aPosition.z*1.24;
 gl_Position=vec4(sx/(uSize.x*.5)-1.0,1.0-sy/(uSize.y*.5),zDepth/5000.0,1.0);
 vec3 n=normalize(aNormal);
 vec3 sun=normalize(vec3(-0.55,-0.7,1.2));
 float bright=max(0.0,dot(n,sun));
 vShade=0.34+0.65*bright;
 vColor=aColor*(1.0-uNight*.42);
}
`;
const fragment=String.raw`
precision mediump float;
varying vec3 vColor;
varying float vShade;
void main(){gl_FragColor=vec4(vColor*vShade,1.0);}
`;
function shader(type,src){const v=gl.createShader(type);gl.shaderSource(v,src);gl.compileShader(v);if(!gl.getShaderParameter(v,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(v));return v;}
let program,buffer,attrPos,attrNormal,attrColor,ucenter,usize,uview,unight;
try {
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
 unight=gl.getUniformLocation(program,"uNight");
 gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);
}catch(err){console.warn("Wild3D shader unavailable; 2D fallback",err);canvas.style.display="none";window.Wild3D={available:false};return;}
const TAU=Math.PI*2,clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),cache=new Map();
function color(hex){if(Array.isArray(hex))return hex;let c=cache.get(hex);if(c)return c;const raw=(hex||"#777777").replace("#","").slice(0,6),n=parseInt(raw,16);c=[(n>>16&255)/255,(n>>8&255)/255,(n&255)/255];cache.set(hex,c);return c;}
function tone(hex,s){const c=color(hex);return c.map(v=>Math.min(1,v*s));}
let data=[];
 // Static district geometry is rebuilt only when the camera enters a new region.
 // Animal and vegetation animation still update every frame.
 const staticBuffer=gl.createBuffer();
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
function pyramid(x,y,z,rx,ry,h,col){
 const base=[[x-rx,y-ry,z],[x+rx,y-ry,z],[x+rx,y+ry,z],[x-rx,y+ry,z]],top=[x,y,z+h],c=color(col);
 for(let i=0;i<4;i++)triangle(base[i],base[(i+1)%4],top,c);
}
function ellipsoid(x,y,z,rx,ry,rz,col,heading=0,segments=9,rings=5){
 const c=color(col),cos=Math.cos(heading),sin=Math.sin(heading);
 const point=(phi,theta)=>{
  const lx=rx*Math.cos(phi)*Math.cos(theta),ly=ry*Math.cos(phi)*Math.sin(theta),lz=rz*Math.sin(phi);
  return [x+lx*cos-ly*sin,y+lx*sin+ly*cos,z+lz];
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
function animal(m,player,clock){
 const type=m.type,c=m.base||m.species||null,base=m.color||(c&&c.color)||"#86928d",belly=m.belly||(c&&c.belly)||"#c5ccbd";
 const r=m.r||16,dir=m.dir||0,cos=Math.cos(dir),sin=Math.sin(dir),speed=Math.hypot(m.vx||0,m.vy||0);
 const moving=clamp(speed/95,0,1);
 const phase=(m.steps||m.step||0)*(type==="cat"?3.4:type==="fox"?2.9:type==="wolf"?2.1:2.6);
 const gait=Math.sin(phase)*moving;
 const fx=(dx,dy)=>m.x+dx*cos-dy*sin,fy=(dx,dy)=>m.y+dx*sin+dy*cos;
 const fox=type==="fox",cat=type==="cat",wolf=type==="wolf"||type==="alpha",rabbit=type==="rabbit",rat=type==="rat",pigeon=type==="pigeon";
 const large=wolf||type==="boar",torso=fox?"#c97741":cat?"#9caaa1":wolf?"#647b84":base;
 const h=large?r*.74:r*.56;
 const x=m.x,y=m.y;
 // Genuine world-space contact shadow below the articulated 3D model.
 ellipsoid(x+r*.16,y+r*.22,1.1,r*1.46,r*.72,1.4,"#1c302b",dir,9,3);
 // Feet and real joints are below the torso, and each species has its own proportions.
 for(const s of [-1,1])for(const k of [-1,1]){
  const dx=k*r*.57,dy=s*r*.45,bob=gait*(k===s?1:-1)*r*.13*moving;
  ellipsoid(fx(dx,dy),fy(dx,dy),r*.29+Math.max(0,bob),r*.21,r*.19,r*.38,large?"#465158":fox?"#372f2a":cat?"#89968b":base,dir,7,4);
 }
 ellipsoid(x,y,h+r*.28,large?r*1.22:rat?r*.76:pigeon?r*.72:r*.91,cat?r*.49:rat?r*.40:pigeon?r*.46:r*.69,large?r*.69:r*.55,torso,dir,11,6);
 if(type==="alpha"){
  // Dense shoulder mane and raised hackles give the alpha a heavier silhouette.
  ellipsoid(fx(r*.22,0),fy(r*.22,0),h+r*.60,r*.78,r*.83,r*.74,"#354d50",dir,10,6);
  for(let side of [-1,1])for(let k=0;k<3;k++)
   pyramid(fx(-r*.1+k*r*.31,side*r*.54),fy(-r*.1+k*r*.31,side*r*.54),h+r*.78,r*.16,r*.17,r*.31,"#3e5556");
 }
 // Fur belly visually breaks the silhouette.
 ellipsoid(fx(r*.22,0),fy(r*.22,0),h+r*.19,r*.62,r*.40,r*.40,belly,dir,9,5);
 const neck=large?r*.70:r*.64,headR=cat?r*.47:fox?r*.50:large?r*.53:r*.49;
 ellipsoid(fx(neck,0),fy(neck,0),h+r*.49,headR,headR*.80,headR*.83,torso,dir,9,5);
 if(fox||cat||wolf||rabbit||rat){
  for(const side of [-1,1]){
   const earLength=rabbit?r*1.08:rat?r*.22:wolf?r*.59:fox?r*.52:r*.38;
   const earWidth=rabbit?r*.14:rat?r*.22:r*.20;
   pyramid(fx(neck-r*.18,side*r*.40),fy(neck-r*.18,side*r*.40),h+r*.79,earWidth,r*.13,earLength,torso);
   if(rabbit)pyramid(fx(neck-r*.16,side*r*.40),fy(neck-r*.16,side*r*.40),h+r*.82,r*.075,r*.06,earLength*.82,"#dfaa9c");
  }
 }
 if(type==="boar"){
  ellipsoid(fx(r*1.15,0),fy(r*1.15,0),h+r*.32,r*.35,r*.42,r*.31,"#ba9a83",dir,8,5);
  for(const side of [-1,1])pyramid(fx(r*1.19,side*r*.34),fy(r*1.19,side*r*.34),h+r*.40,r*.12,r*.13,r*.36,"#e9d7ad");
 }else if(pigeon){
  for(const side of [-1,1])ellipsoid(fx(-r*.15,side*r*.55),fy(-r*.15,side*r*.55),h+r*.55,r*.60,r*.16,r*.25,"#aec3b8",dir,7,4);
 }else{
  ellipsoid(fx(r*1.06,0),fy(r*1.06,0),h+r*.42,fox?r*.47:rat?r*.24:r*.31,fox?r*.19:r*.23,r*.19,belly,dir,8,4);
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
   ellipsoid(fx(dx,dy),fy(dx,dy),z,r*.26,r*.14,r*.15,torso,dir,6,4);
  }
 }else if(fox){
  ellipsoid(fx(-r*1.58,0),fy(-r*1.58,0),h+r*.48,r*.85,r*.42,r*.45,torso,dir,9,5);
  ellipsoid(fx(-r*2.28,0),fy(-r*2.28,0),h+r*.49,r*.37,r*.35,r*.38,"#f5e9ce",dir,8,5);
 }else if(wolf){
  ellipsoid(fx(-r*1.21,0),fy(-r*1.21,0),h+r*.48,r*.54,r*.29,r*.29,torso,dir,7,4);
 }
 // Eyes distinguish living characters from scenery at oblique camera distance.
 for(const side of [-1,1]){
  ellipsoid(fx(neck+r*.32,side*headR*.53),fy(neck+r*.32,side*headR*.53),h+r*.58,r*.10,r*.08,r*.09,cat?"#d1f18e":"#f4dd9a",dir,5,3);
 }
}
function vegetation(p,clock){
 if(p.type===2){
  const count=9,r=p.r;
  for(let i=0;i<count;i++){
   const a=i*TAU/count+p.phase,xx=p.x+Math.cos(a)*r*.44,yy=p.y+Math.sin(a)*r*.4;
   const size=r*(.24+.1*((i*7)%5)/5),height=r*(.5+.13*((i*3)%5)/5);
   ellipsoid(xx,yy,height*.67,size,size*.76,height*.46,i%3===0?"#648d52":i%3===1?"#3f734c":"#4c7f53",Math.sin(clock*.9+i)*.15,7,4);
  }
 }else if(p.type===1){
  pyramid(p.x,p.y,0,p.r*.63,p.r*.53,p.r*1.4,"#56764f");
 }else{
  pyramid(p.x,p.y,0,p.r*.5,p.r*.45,p.r*.8,"#4e7859");
 }
}
function terrain(w){
 // Ground and roads have real surfaces. No fake slanted canvas transformation.
 box(0,0,-6,w.w,w.h,6,"#26392f","#53634b");
 for(const y of [465,1170,1890]){
  box(0,y-80,0,w.w,160,1,"#323d3e","#344145");
  box(0,y-86,0,w.w,6,2,"#565d54","#717e68");
  box(0,y+80,0,w.w,6,2,"#565d54","#717e68");
 }
 for(const x of [530,1410,2320,3270]){
  box(x-80,0,0,160,w.h,1,"#323d3e","#344145");
  box(x-86,0,0,6,w.h,2,"#565d54","#717e68");
  box(x+80,0,0,6,w.h,2,"#565d54","#717e68");
 }
}
let failed=false,frames=0;
canvas.addEventListener("webglcontextlost",e=>{e.preventDefault();failed=true;window.Wild3D.available=false;canvas.style.display="none";});
function render(o){
 if(failed)return false;
 try{
  const {vw,vh,dpr,cam,VIEW,buildings,plants,mobs,P,elapsed,weather,WORLD,species}=o;
  const width=Math.max(1,Math.round(vw*dpr)),height=Math.max(1,Math.round(vh*dpr));
  if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
  gl.viewport(0,0,width,height);
  const night=(1-(Math.cos(((elapsed%85)/85-.15)*TAU)+1)/2)*.68;
  gl.clearColor(.12*(1-night*.5),.18*(1-night*.48),.18*(1-night*.4),1);
  gl.clearDepth(1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  const isVisible=(x,y,margin=150)=>{
   const dx=x-cam.x-vw/2,dy=y-cam.y-vh/2;
   const sx=vw/2+VIEW.a*dx+VIEW.c*dy,sy=vh/2+VIEW.b*dx+VIEW.d*dy;
   return sx>-margin&&sx<vw+margin&&sy>-margin&&sy<vh+margin;
  };
  const regionKey=[Math.floor(cam.x/240),Math.floor(cam.y/240),vw,vh,buildings.length,WORLD.w,WORLD.h].join(":");
  if(regionKey!==staticKey){
   data=[];terrain(WORLD);
   for(const b of buildings){
   if(!isVisible(b.x+b.w/2,b.y+b.h/2,680))continue;
   const h=135+(b.kind%4)*75; // Genuine extruded world-space geometry, not painted walls.
   box(b.x,b.y,0,b.w,b.h,h,b.kind%2?"#56646c":"#67736d",b.kind%2?"#45545b":"#58665e");
   box(b.x+13,b.y+13,h,b.w-26,b.h-26,6,"#394e50","#87918a");
   if(b.broken)box(b.x+b.w*.65,b.y+b.h*.28,h+6,b.w*.23,b.h*.30,14,"#343f42","#5e6a64");
   // Air conditioning and roof ducts
   box(b.x+b.w*.16,b.y+b.h*.2,h+6,28,35,28,"#586767","#9da39a");
   box(b.x+b.w*.72,b.y+b.h*.64,h+6,36,25,19,"#546667","#8e9992");
   // Windows and masonry accents are extruded, keeping the world from looking painted-flat.
   for(let k=1;k<5;k++){
    const z=k*h/5;
    for(let j=1;j<5;j++){
     box(b.x+j*b.w/5-11,b.y-1,z,22,3,12,"#789294","#a2b4ac");
     box(b.x+b.w-1,b.y+j*b.h/5-11,z,3,22,12,"#50656a","#85918a");
    }
   }
   }
   const staticVertices=new Float32Array(data);
   gl.bindBuffer(gl.ARRAY_BUFFER,staticBuffer);
   gl.bufferData(gl.ARRAY_BUFFER,staticVertices,gl.STATIC_DRAW);
   staticCount=staticVertices.length/9;
   staticKey=regionKey;staticRebuilds++;
  }
  data=[];
  for(const p of plants)if(isVisible(p.x,p.y,p.r*2+90))vegetation(p,elapsed);
  for(const m of mobs)if(isVisible(m.x,m.y,110)){animal({...m,...species[m.type]},false,elapsed);}
  if(P)animal({...P,color:P.base.color,belly:P.base.belly},true,elapsed);
  const vertices=new Float32Array(data);
  gl.useProgram(program);
  gl.uniform2f(ucenter,cam.x+vw/2,cam.y+vh/2);
  gl.uniform2f(usize,vw,vh);
  gl.uniform4f(uview,VIEW.a,VIEW.b,VIEW.c,VIEW.d);
  gl.uniform1f(unight,night);
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
  if(dynamicCount)gl.drawArrays(gl.TRIANGLES,0,dynamicCount);
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
