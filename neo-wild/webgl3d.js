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
  float reach=1.0-smoothstep(uNightVision.w*.48,uNightVision.w,distanceToPlayer);
  float peripheral=(1.0-smoothstep(110.0,300.0,distanceToPlayer))*.72;
  float acuity=max(edge*reach,peripheral)*uNightVisionStrength;
  shaded=shaded*(1.0+acuity*1.72)+vec3(.085,.105,.094)*acuity;
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
 let staticBuffer=gl.createBuffer(),snowBuffer=gl.createBuffer();
 let staticKey="",staticCount=0,staticRebuilds=0,dynamicCount=0;
 let snowCacheKey="",snowCount=0,snowRebuilds=0;
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



function standingGiantTreeMesh(t){
 const x=t.x,y=t.y,seed=Math.sin(x*.037+y*.021)*19.37;
 ellipsoid(x+18,y+15,1,51,28,1.3,"#193324",.28,8,3);
 ellipsoid(x,y,88,21,20,89,"#61503a",.15,11,6);
 ellipsoid(x,y,176,16,16,81,"#72573b",-.16,10,6);
 for(let k=0;k<5;k++){
  const a=k*2.4+seed,dist=39+(k%3)*9,cx=x+Math.cos(a)*dist,cy=y+Math.sin(a)*dist;
  ellipsoid((x+cx)*.5,(y+cy)*.5,206+k*5,13,14,37,"#594831",a,9,5);
  ellipsoid(cx,cy,230+k*9,40+(k%2)*10,38+(k%3)*6,40,k%2?"#466d45":"#355f3d",a,9,5);
 }
 ellipsoid(x,y,282,63,58,48,"#386540",.24,11,6);
 for(let k=0;k<5;k++){
  const a=k*TAU/5+seed;
  ellipsoid(x+Math.cos(a)*18,y+Math.sin(a)*18,311,31,28,26,k%2?"#537c51":"#3b6a45",a,8,4);
 }
}
/* Earthquake debris: physically grounded fallen wood, with deterministic variation.
 * Unlike a flat rectangle or stacked oval, each trunk and bough is a tapered
 * multi-face cylinder. All positions are in the existing world coordinate system.
 */
function fallenTreeMesh(e,worldYear){
 const fract=n=>n-Math.floor(n),seed=fract(Math.sin(e.x*.031+e.y*.067)*43758.5453);
 const angle=Number.isFinite(e.angle)?e.angle:-.48+(seed-.5)*.74;
 const ca=Math.cos(angle),sa=Math.sin(angle);
 const size=e.scale===3?3:1;
 const elapsed=Number.isFinite(e.fallAtSeconds)?Math.max(0,worldYear*120-e.fallAtSeconds):Infinity;
 const fall=Math.min(1,elapsed/1.4),pitch=fall*Math.PI/2,along=Math.sin(pitch),up=Math.cos(pitch);
 const rootX=e.x-ca*43*size,rootY=e.y-sa*43*size;
 const point=(forward,side,z)=>{
  const f=(forward+43)*size,l=side*size;
  return [rootX+ca*f*along-sa*l,rootY+sa*f*along+ca*l,f*up+z*size];
 };
 const tube=(a,b,ra,rb,shade,phase=0)=>{
  const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2];
  const flat=Math.max(.001,Math.hypot(dx,dy)),len=Math.max(.001,Math.hypot(flat,dz));
  const side=[-dy/flat,dx/flat,0],up=[-dz*dx/(flat*len),-dz*dy/(flat*len),flat/len];
  const count=12;
  const ring=(p,rad,t,k)=>{
   const theta=k*TAU/count,rough=1+.045*Math.sin(theta*5+phase+t*2.3);
   const rx=Math.cos(theta)*rad*size*rough,ry=Math.sin(theta)*rad*size*rough;
   return [p[0]+side[0]*rx+up[0]*ry,p[1]+side[1]*rx+up[1]*ry,p[2]+side[2]*rx+up[2]*ry];
  };
  for(let k=0;k<count;k++){
   const a0=ring(a,ra,0,k),a1=ring(a,ra,0,k+1);
   const b0=ring(b,rb,1,k),b1=ring(b,rb,1,k+1);
   quad(a0,b0,b1,a1,tone(shade,k%4===0?.75:k%3===0?1.12:1));
  }
 };
 // Continuous subtle ground shadow, buried roots and loose bark.
 ellipsoid(e.x,e.y,.38,66*size,19*size,.45,"#233329",angle,12,3);
 const root=point(-43,0,11);
 ellipsoid(root[0],root[1],5*size,16*size,13*size,8*size,"#4d4638",angle,10,5);
 ellipsoid(root[0]-sa*5*size,root[1]+ca*5*size,5*size,12*size,8*size,6*size,"#66543d",angle,9,4);
 for(let k=0;k<4;k++){
  const offset=(k-1.5)*5;
  tube(point(-39,offset,7),point(-56-k*2,offset*1.85,2.5),3.8,1.2,"#594433",k);
 }
 // Trunk bends, tapers and touches the ground. No bright flat end disc.
 const nodes=[
  point(-40,0,12),point(-19,1.8,11),point(7,-1.4,9),
  point(33,2.4,7),point(56,5,5)
 ];
 const radii=[12.8,10.8,8.5,6.1,3.4];
 for(let k=0;k<nodes.length-1;k++){
  tube(nodes[k],nodes[k+1],radii[k],radii[k+1],k%2?"#6c503c":"#79583f",seed*6+k*.3);
 }
 // Root-facing wood: restrained concentric grain, not a solid yellow circle.
 const cap=nodes[0],side=[-sa,ca,0],height=[0,0,1],rings=[12.7,10.8,7.8,4.6,1.1];
 const cols=["#4b392c","#866348","#a17b55","#74553d","#614632"];
 const ringPoint=(rad,i)=>[cap[0]+side[0]*rad*size*Math.cos(i*TAU/16),cap[1]+side[1]*rad*size*Math.cos(i*TAU/16),cap[2]+rad*size*Math.sin(i*TAU/16)];
 for(let ri=0;ri<rings.length-1;ri++){
  for(let i=0;i<16;i++){
   quad(ringPoint(rings[ri],i),ringPoint(rings[ri],i+1),ringPoint(rings[ri+1],i+1),ringPoint(rings[ri+1],i),color(cols[ri]));
  }
 }
 // Broken side branches sit in the ground, with twigs and uneven crown.
 const boughs=[
  {at:2,side:-1,len:26},{at:19,side:1,len:31},
  {at:30,side:-1,len:24},{at:43,side:1,len:25},
  {at:52,side:-1,len:15}
 ];
 const age=Math.max(0,(Number(worldYear)||0)-(Number(e.year)||0));
 const leaves=age<4;
 for(let k=0;k<boughs.length;k++){
  const branch=boughs[k],b=point(branch.at,k%2?1:-1,8-k*.43);
  const mid=point(branch.at+branch.len*.31,branch.side*branch.len*.48,12+(k%2)*4);
  const end=point(branch.at+branch.len*.58,branch.side*branch.len,4+(k%2)*3);
  tube(b,mid,3.8,2.3,"#6d513c",k*.8);
  tube(mid,end,2.3,.9,"#76593f",k*.6);
  const twig=point(branch.at+branch.len*.81,branch.side*branch.len*.85,3.5);
  tube(mid,twig,1.6,.45,"#594532",k*1.5);
  if(leaves){
   for(let j=0;j<3;j++){
    const at=point(branch.at+branch.len*(.45+j*.14),
     branch.side*branch.len*(.65+j*.11)+(j-1)*4,5+j*1.6);
    const crownColors=["#365e40","#476f46","#567b4e","#31593a"];
    ellipsoid(at[0],at[1],at[2],(8+(j%2)*3)*size,(5.6+j*.5)*size,5.5*size,crownColors[(k+j)%4],angle+branch.side*.46,10,5);
   }
  }
 }
 // Bark fragments and broken twigs scattered under the canopy.
 for(let k=0;k<6;k++){
  const drift=(fract(Math.sin(seed*91+k*29.13)*7613.21)-.5);
  const twig=point(-24+k*14,drift*25,1.7);
  tube(twig,point(-20+k*14,drift*25+4,1.1),1.2,.4,k%2?"#785c45":"#4b4030",k);
 }
}

/* STRONG-MODELS-3D-V2: species-specific anatomy, proportions and silhouettes. */
function drawStrongAnimal3D(m,clock){
 const t=m.type;
 if(t!=="alpha"&&t!=="giantSnake"&&t!=="oldBear"&&t!=="giantBoar"&&t!=="blackPanther"&&t!=="oneEyedWolf"&&t!=="whiteTiger"&&t!=="giantHyena"&&t!=="giantLion"&&t!=="giantMoose"&&t!=="giantBuffalo"&&t!=="giantCrocodile"&&t!=="giantHippo"&&t!=="giantAnaconda"&&t!=="giantLizard"&&t!=="rhino"&&t!=="giantGorilla"&&t!=="giantElephant"&&t!=="albinoWolf"&&t!=="giantEagle")return false;
 const r=m.r||30,dir=m.dir||0,c=Math.cos(dir),sn=Math.sin(dir);
 const x=(dx,dy)=>m.x+dx*c-dy*sn,y=(dx,dy)=>m.y+dx*sn+dy*c;
 const fur=m.color||"#6c675d",belly=m.belly||"#b4a38e";
 const orb=(dx,dy,z,rx,ry,rz,col)=>ellipsoid(x(dx,dy),y(dx,dy),z,rx,ry,rz,col,dir,9,5);
 const spike=(dx,dy,z,rx,ry,h,col)=>pyramid(x(dx,dy),y(dx,dy),z,rx,ry,h,col);
 // Player-owned bosses advance `steps`; wild bosses advance `step`.
 // The old mesh only read `step`, freezing the owned boss walking animation.
 const bossStride=Number.isFinite(m.steps)&&m.steps>0?m.steps:(m.step||0);
 const bossMotion=Math.min(1,Math.hypot(m.vx||0,m.vy||0)/110);
 const bossStrike=Math.max(0,Math.min(1,(m.attackAction||0)/.45));
 const pace=Math.sin(bossStride*2.1)*bossMotion*r*.11+Math.sin(Math.PI*bossStrike)*r*.12;
 if(t==="alpha"){
  // Alpha wolf: distinct bristling mane, forward-charging jaw and articulated paws.
  const motion=Math.min(1,Math.hypot(m.vx||0,m.vy||0)/130);
  const charge=Math.max(bossStrike,Math.min(1,Math.max(0,Number(m.chargeTime)||0)/.45));
  for(const side of [-1,1])for(const front of [-1,1]){
   const beat=Math.sin(bossStride*2.6+(front===side?0:Math.PI))*motion;
   const fx=front*r*.62+beat*r*.28+(front>0?charge*r*.20:0),fy=side*r*.49;
   orb(fx,fy,r*(.34+Math.max(0,beat)*.12),r*.27,r*.24,r*.40,"#253737");
   orb(fx+r*.18,fy,r*.12,r*.30,r*.23,r*.15,"#1b292a");
   for(let claw=-1;claw<=1;claw++)spike(fx+r*.36,fy+claw*r*.14,r*.10,r*.055,r*.035,r*.12,"#d3cbb3");
  }
  orb(-r*.17,0,r*.80,r*1.36,r*.70,r*.66,"#344a4a");
  orb(r*.57,0,r*1.03,r*.85,r*.79,r*.84,"#435a57");
  orb(r*.82,0,r*.75,r*.55,r*.50,r*.59,"#83918a");
  for(let k=0;k<9;k++){
   const dx=-r*.92+k*r*.25;
   for(const side of [-1,1])spike(dx,side*r*.35,r*(1.25+Math.sin(k*.6)*.13),r*.13,r*.12,r*(.42+(k%3)*.10),"#202e31");
  }
  orb(r*1.20+charge*r*.18,0,r*.90,r*.57,r*.48,r*.45,"#354b4c");
  for(const side of [-1,1]){
   spike(r*.99,side*r*.39,r*1.18,r*.24,r*.17,r*.62,"#1e2d30");
   orb(r*1.40+charge*r*.18,side*r*.30,r*1.04,r*.14,r*.12,r*.12,"#ebbb61");
   orb(r*1.48+charge*r*.18,side*r*.31,r*1.05,r*.07,r*.07,r*.08,"#10191b");
   spike(r*1.62+charge*r*.22,side*r*.18,r*.48,r*.095,r*.065,r*.23,"#e3dcc9");
  }
  orb(r*1.55+charge*r*.20,0,r*.62,r*.40,r*.31,r*.27,"#77817a");
  orb(r*1.79+charge*r*.21,0,r*.69,r*.19,r*.21,r*.16,"#171f22");
  for(let i=0;i<7;i++){
   const swish=Math.sin(clock*1.8+i*.50)*r*.13;
   orb(-r*(1.25+i*.29),swish,r*(.73+i*.055),r*.32,r*(.23-i*.015),r*.20,i%2?"#314547":"#263637");
  }
 }else if(t==="giantEagle"){
  // Owned eagles accumulate `steps`, while wild eagles accumulate `step`.
   // Use the shared stride and attack pose so both forms flap visibly.
   const flap=Math.sin(bossStride*2.4+clock*.8)+bossStrike*.45,spread=1+.22*flap;
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
  for(const side of [-1,1])for(const front of [-1,1])orb(front*r*.68,side*r*.7,r*.59+pace*(front===side?1:-1),r*.42,r*.41,r*.65,"#6b716d");
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
  for(const side of [-1,1])for(const front of [-1,1]){
    const phase=Math.sin((m.steps||m.step||0)*2.0+(front===side?0:Math.PI));
    const force=Math.min(1,Math.hypot(m.vx||0,m.vy||0)/130);
    orb(front*r*.67+phase*force*r*.21,side*r*.62,r*.36+Math.max(0,phase)*force*r*.18,r*.38,r*.33,r*.42,"#635e58");
   }
  orb(-r*.24,0,r*.93,r*1.40,r*.93,r*.86,fur);orb(r*.59,0,r*1.18,r*1.00,r*.83,r*.94,"#6b6660");orb(r*1.35,0,r*.96,r*.70,r*.55,r*.56,belly);
  spike(r*1.46+Math.max(0,m.hornCharge||0)*r*.08,0,r*(1.34-Math.max(0,m.hornCharge||0)*.18),r*.23,r*.24,r*1.05,"#e7ddc6");spike(r*.98,0,r*1.55,r*.16,r*.18,r*.52,"#c7bda8");
  for(const side of [-1,1]){orb(r*1.08,side*r*.48,r*1.38,r*.21,r*.18,r*.29,fur);orb(r*1.38,side*r*.43,r*1.10,r*.10,r*.09,r*.10,"#252521");}
  orb(-r*1.58,0,r*.73,r*.37,r*.15,r*.17,"#68635d");
 }else if(t==="giantCrocodile"){
  orb(-r*.15,0,r*.43,r*1.38,r*.72,r*.48,fur);
  for(const side of [-1,1])for(const front of [-1,1]){
    const stroke=Math.sin((m.steps||m.step||0)*2.3+(front===side?0:Math.PI));
    const motion=Math.min(1,Math.hypot(m.vx||0,m.vy||0)/125);
    orb(front*r*.55+stroke*r*.23*motion,side*r*.71,r*.21+Math.max(0,stroke)*r*.14*motion,r*.37,r*.24,r*.25,"#405b48");
   }
  for(let i=0;i<8;i++)spike(-r*.97+i*r*.27,0,r*.87,r*.16,r*.17,r*.24,"#36513e");
  orb(r*1.00,0,r*.36,r*.89,r*.45,r*.30,fur);orb(r*1.63,0,r*(.25-Math.min(.65,Math.max(0,m.jawSnap||0))*.13),r*.48,r*.36,r*.20,belly);
   if((m.jawSnap||0)>0){orb(r*1.68,0,r*.17,r*.47,r*.36,r*.10,"#3a2827");for(const y of [-1,1])for(let i=0;i<4;i++)spike(r*(1.38+i*.16),y*r*.28,r*.18,r*.055,r*.05,r*.12,"#ece1c3");}
  for(const side of [-1,1]){orb(r*1.08,side*r*.34,r*.58,r*.14,r*.11,r*.12,"#e8d188");orb(r*1.11,side*r*.36,r*.64,r*.055,r*.05,r*.06,"#192b22");}
  for(let i=0;i<6;i++){
    const twist=Math.sin((m.deathRollPose||0)*8+i*.6)*Math.min(1,m.deathRollPose||0)*r*.25;
    orb(-r*(1.2+i*.30),twist,r*(.28-i*.028),r*.35,r*(.38-i*.045),r*(.22-i*.026),i%2?"#405c47":fur);
   }
 }else if(t==="giantHippo"){
  for(const side of [-1,1])for(const front of [-1,1])orb(front*r*.65,side*r*.69,r*.34+pace*(front===side?1:-1),r*.35,r*.35,r*.43,"#62565b");
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
  // The one-eyed wolf has one unmistakable frontal eye, not two side eyes.
  orb(r*1.17,0,r*1.14,r*.22,r*.24,r*.19,"#d6b276");
  orb(r*1.34,0,r*1.15,r*.11,r*.12,r*.11,"#171d1e");
  orb(r*1.41,-r*.035,r*1.19,r*.034,r*.034,r*.035,"#f4e8b8");
  // Closed scarred socket on the left, preserving its asymmetric silhouette.
  spike(r*.82,r*.34,r*1.10,r*.07,r*.09,r*.32,"#b08c86");
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
 }else if(t==="blackPanther"){
  // Distinct low-slung feline boss: broad shoulders, articulated paws and long tail.
  const motion=Math.min(1,Math.hypot(m.vx||0,m.vy||0)/125);
  for(const side of [-1,1])for(const front of [-1,1]){
   const stride=Math.sin(bossStride*2.5+(front===side?0:Math.PI))*motion;
   orb(front*r*.68+stride*r*.24,side*r*.48,r*(.27+Math.max(0,stride)*.14),r*.26,r*.23,r*.32,"#161b24");
   for(let claw=-1;claw<=1;claw++)spike(front*r*.68+stride*r*.24+r*.21,side*r*.48+claw*r*.11,r*.09,r*.045,r*.035,r*.10,"#b9bec5");
  }
  orb(-r*.18,0,r*.72,r*1.32,r*.65,r*.53,"#202632");
  orb(r*.57,0,r*.79,r*.82,r*.68,r*.66,"#2a3040");
  orb(r*1.14,0,r*.75,r*.57,r*.47,r*.42,"#1b2230");
  orb(r*1.49,0,r*.56,r*.39,r*.30,r*.25,"#343846");
  for(const side of [-1,1]){
   spike(r*.95,side*r*.35,r*1.12,r*.19,r*.14,r*.33,"#151a25");
   orb(r*1.30,side*r*.32,r*.87,r*.12,r*.09,r*.09,"#e8b85e");
   orb(r*1.36,side*r*.34,r*.87,r*.047,r*.042,r*.055,"#12151b");
   for(let whisker=0;whisker<3;whisker++)spike(r*1.58,side*r*(.18+whisker*.08),r*(.48+whisker*.05),r*.035,r*.025,r*.08,"#9ca3aa");
  }
  for(let k=0;k<9;k++){
   const q=k/8,swish=Math.sin(clock*1.5+q*1.8)*r*.26;
   orb(-r*(1.20+q*1.6),swish,r*(.70+q*.18),r*.23,r*.13,r*.13,k%2?"#1a202c":"#303646");
  }
  if(bossStrike>.05)orb(r*1.52,0,r*.41,r*.34,r*.25,r*.12,"#a65a65");
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
// Attack timing shares the actual combo step with 2D limb-specific impact trails.
// Rush 1=left front, 2=right front, 4=left rear, 5=both front.
function combatLimbPose(m,front,side,r){
 const step=m.attackActionStep||m.rushActiveStep||0;
 const action=clamp(Number(m.attackAction)||0,0,.45),progress=1-action/.45;
 // Snap early, recover visibly; geometry only, not damage timing.
 const snap=clamp((progress-.08)/.25,0,1);
 const strike=Math.sin(Math.PI*clamp(snap*.72+Math.max(0,progress-.33)*.28/.67,0,1));
 const ultimate=Math.sin(Math.PI*clamp((m.specialVisual||0)/1.02,0,1));
 const normal=(step===1&&front>0&&side<0)||(step===2&&front>0&&side>0)||
  (step===4&&front<0&&side<0)||(step===5&&front>0);
 const skill=m.specialKind||"";
 const special=skill==="backkick"?front<0:
  ["slam","lunge","roll"].includes(skill)?front>0:
  skill==="double"&&front>0?side===(m.specialVisual>.51?-1:1):
  skill==="fan"&&front>0&&["deer","serow"].includes(m.type);
 const airborne=m.jumpDive&&m.jumpTime>0&&front>0&&
  ["cat","manul","fox","tibetanFox","wolf","dog","wildDog","lion","tiger","cheetah","hyena"].includes(m.type)?
  Math.max(0,Math.sin(Math.PI*clamp(1-m.jumpTime/Math.max(.1,m.jumpDuration||.45),0,1)))*.58:0;
 // Species-specific attack follow-through: claw swipe, hoof snap, heavy strike.
 // Geometry only: collision, attack timing and save data are unchanged.
 const hooved=["deer","serow","boar","mountainGoat","zebra","giraffe"].includes(m.type);
 const heavy=!!m.strongBoss||["bear","blackBear","elephant","hippo","gorilla"].includes(m.type);
 const style=hooved?.76:heavy?.58:1;
 const recovery=normal&&action>0&&progress>.48?
  Math.sin(Math.PI*clamp((progress-.48)/.52,0,1))*style:0;
 const force=Math.min(.85,(normal?strike*.66:0)+(special?ultimate*.70:0)+airborne);
 const retract=normal?recovery*(heavy?.18:hooved?.30:.38):0;
 return {dx:r*(force-retract),dz:r*(force*.52+recovery*(hooved?.18:.11))};
}
function drawCommonAnimal3D(m,clock){
 const t=m.type==="venomSnake"?"snake":m.type;
 if(!["rat","chimpanzee","macaque","snake","frog","crow","deer","serow","mountainGoat","weasel","raccoonDog","wildFox","cheetah","giraffe","zebra","lion","elephant","hippo"].includes(t))return false;
 const r=m.r||14,dir=m.dir||0,c=Math.cos(dir),sn=Math.sin(dir);
 const fx=(dx,dy)=>m.x+dx*c-dy*sn,fy=(dx,dy)=>m.y+dx*sn+dy*c;
 const fur=m.color||(t==="crow"?"#313b44":t==="snake"?"#587b50":"#977c62");
 const belly=m.belly||"#d2baa4";
 const orb=(dx,dy,z,rx,ry,rz,col)=>ellipsoid(fx(dx,dy),fy(dx,dy),z,rx,ry,rz,col,dir,8,5);
 const horn=(dx,dy,z,rx,ry,h,col)=>pyramid(fx(dx,dy),fy(dx,dy),z,rx,ry,h,col);
 const gait=Math.sin((m.step||0)*.9+clock*1.1);
 if(t==="rat"){
  const startled=(m.flee||0)>0,resting=!!m.resting;
  const stretch=startled?1.2:resting?.83:1;
  const bob=resting?0:Math.sin(clock*9+(m.step||0))*r*.045;
  for(const side of [-1,1])for(const front of [-1,1])
   orb(front*r*.54,side*r*.35,r*.12+Math.max(0,bob),r*.15,r*.13,r*.12,fur);
  orb(-r*.18,0,r*.31+bob,r*1.03*stretch,r*.42,r*.32,fur);
  orb(r*.69,0,r*.35+bob,r*.42,r*.37,r*.35,fur);
  orb(r*1.04,0,r*.22,r*.32,r*.23,r*.19,belly);
  for(const side of [-1,1]){
   orb(r*.63,side*r*.34,r*.68,r*.22,r*.12,r*.22,"#bd9892");
   orb(r*.94,side*r*.23,r*.46,r*.09,r*.07,r*.085,"#171c1a");
   for(let k=-1;k<=1;k++)orb(r*1.17,side*(r*.18+k*r*.13),r*.19,r*.20,r*.018,r*.018,"#ddd0bd");
  }
  orb(r*1.31,0,r*.19,r*.10,r*.10,r*.08,"#d49e9b");
  for(let k=0;k<7;k++)orb(-r*(1.04+k*.32),Math.sin(k*.47+clock*(startled?2.3:.8))*r*.11,r*(.25-k*.021),r*(.20-k*.017),r*.07,r*.075,"#c49d96");
 }else if(t==="chimpanzee"){
  // Upright heavy torso, long grasping arms and broad bare face: not a
  // recoloured four-legged animal. Branch/stone props follow real AI state.
  const climbing=Math.max(0,m.treeHeight||0),ready=(m.chimpTell||0)>0;
  const club=ready&&m.chimpAttackKind==="branch",rock=ready&&m.chimpAttackKind!=="branch";
  const armSwing=climbing>0?Math.sin(clock*7+(m.step||0))*.24:gait*.13;
  const skin="#978274",palm="#827164";
  orb(-r*.16,0,r*.93,r*.93,r*.77,r*.82,fur);
  orb(r*.52,0,r*1.26,r*.62,r*.68,r*.62,fur);
  orb(r*.92,0,r*1.58,r*.68,r*.59,r*.57,fur);
  orb(r*1.28,0,r*1.49,r*.42,r*.42,r*.40,skin);
  orb(r*1.54,0,r*1.29,r*.29,r*.29,r*.18,palm);
  for(const side of [-1,1]){
   orb(r*.94,side*r*.60,r*1.64,r*.19,r*.19,r*.23,fur);
   orb(r*1.30,side*r*.33,r*1.70,r*.075,r*.075,r*.075,"#161a1a");
   orb(r*.21,side*r*.75,r*1.22,r*.36,r*.30,r*.39,fur);
   const raised=side<0&&ready,handZ=raised?r*2.34:r*(.33+armSwing*side);
   orb(r*.29,side*r*.89,(handZ+r*1.18)*.5,r*.23,r*.23,Math.abs(handZ-r*1.18)*.56+r*.19,fur);
   orb(r*.39,side*r*.98,handZ,r*.29,r*.24,r*.18,palm);
   orb(-r*.65,side*r*.50,r*.51,r*.32,r*.29,r*.48,fur);
   orb(-r*.76,side*r*.57,r*.16,r*.32,r*.27,r*.16,palm);
  }
  if(club){
   orb(r*.52,-r*1.00,r*2.60,r*.12,r*.12,r*.72,"#856342");
   orb(r*.53,-r*1.00,r*3.22,r*.18,r*.16,r*.25,"#a27b4c");
  }else if(rock)orb(r*.42,-r*.99,r*2.56,r*.24,r*.23,r*.21,"#aaa398");
 }else if(t==="macaque"){
  // Dedicated macaque: expressive pink face, ears, four grasping limbs, short tail.
  const climbing=Math.max(0,m.treeHeight||0),preparing=(m.macaqueTell||0)>0||(m.macaqueThrowPose||0)>.28,throwing=(m.swing||0)>0&&!preparing;
  const motion=climbing>2?Math.sin(clock*8+(m.step||0))*.14:gait*.17;
  const pink="#b7847b",hand="#c8958b";
  orb(-r*.20,0,r*.89,r*.80,r*.62,r*.72,fur);
  orb(r*.45,0,r*1.09,r*.52,r*.49,r*.55,fur);
  orb(r*.86,0,r*1.34,r*.59,r*.55,r*.52,fur);
  orb(r*1.22,0,r*1.21,r*.34,r*.37,r*.35,pink);
  orb(r*1.45,0,r*1.04,r*.21,r*.25,r*.16,hand);
  for(const side of [-1,1]){
   orb(r*.77,side*r*.53,r*1.43,r*.21,r*.16,r*.23,fur);
   orb(r*.91,side*r*.58,r*1.43,r*.13,r*.10,r*.14,pink);
   orb(r*1.31,side*r*.26,r*1.34,r*.085,r*.075,r*.09,"#242a29");
   orb(r*.21,side*r*.57,r*.92,r*.28,r*.24,r*.31,fur);
   const raised=side<0&&(preparing||throwing),foreZ=raised?r*(preparing?2.15:1.85):r*(.52+motion*side);
   orb(r*.50,side*r*.69,(foreZ+r*.96)*.5,r*.18,r*.18,Math.abs(foreZ-r*.96)*.56+r*.16,fur);
   orb(r*.62,side*r*.76,foreZ,r*.19,r*.17,r*.15,hand);
   orb(-r*.67,side*r*.47,r*(.48-motion*side),r*.26,r*.24,r*.47,fur);
   orb(-r*.82,side*r*.55,r*.16,r*.31,r*.24,r*.14,hand);
  }
  orb(-r*1.04,0,r*.77,r*.30,r*.17,r*.16,fur);
  orb(-r*1.28,r*.11,r*.72,r*.22,r*.14,r*.14,fur);
  if(preparing)orb(r*.62,-r*.76,r*2.22,r*.21,r*.19,r*.20,"#918b7c");
   if(!preparing&&(m.macaqueThrowPose||0)>.05)orb(r*1.10,-r*.85,r*1.63,r*.12,r*.12,r*.12,"#a69c8c");
 }else if(t==="snake"){
  const ready=(m.windup||0)>0,striking=(m.swing||0)>0;
  const lift=ready?r*.48:striking?r*.24:0;
  for(let k=8;k>=0;k--){
   const x=r*(2.5-k*.48),y=Math.sin(k*.86+clock*.7)*r*.33;
   orb(x,y,r*.19,r*(.42-k*.022),r*(.28-k*.015),r*.20,k%2?fur:belly);
  }
  if(lift>0)orb(r*.96,0,r*.30+lift*.45,r*.28,r*.30,r*.30,belly);
  orb(r*(ready?1.33:striking?1.64:1.43),0,r*.23+lift,r*.52,r*.35,r*.23,fur);
  for(const side of [-1,1])orb(r*(ready?1.56:1.66),side*r*.23,r*.35+lift,r*.06,r*.06,r*.07,"#f8e8b8");
  horn(r*(ready?1.85:1.94),0,r*.16+lift,r*.15,r*.09,r*.12,"#bc8179");
  if(m.type==="venomSnake"){
   for(let k=0;k<6;k++)orb(r*(2.5-k*.67),Math.sin(k*.7)*r*.14,r*.44,r*.12,r*.35,r*.09,"#e8c34f");
   for(const side of [-1,1])orb(r*1.61,side*r*.26,r*.39,r*.085,r*.075,r*.075,"#161b12");
   horn(r*1.94,-r*.18,r*.13,r*.08,r*.07,r*.17,"#fff0bd");
  }
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
 }else if(t==="serow"||t==="mountainGoat"){
  const goat=t==="mountainGoat",defending=(m.headbuttTell||0)>0||(m.swing||0)>0;
  const feeding=(m.foragePose||0)>0,lean=defending?r*.22:0;
  for(const side of [-1,1])for(const front of [-1,1]){
   orb(front*r*.55,side*r*.43,r*.29+gait*r*.04*front,r*.18,r*.17,r*(goat?.38:.48),"#665e51");
   orb(front*r*.55,side*r*.43,r*.08,r*.19,r*.20,r*.11,"#3d4038");
  }
  orb(-r*.20,0,r*(goat?.86:.91),r*(goat?1.04:1.15),r*(goat?.63:.51),r*.61,fur);
  orb(r*.63,0,r*.98,r*.53,r*.38,r*.52,fur);
  orb(r*1.12+lean,0,r*(feeding?.79:1.17),r*.49,r*.36,r*.37,fur);
  orb(r*1.47+lean,0,r*(feeding?.67:1.01),r*.28,r*.24,r*.20,belly);
  for(const side of [-1,1]){
   orb(r*1.01+lean,side*r*.36,r*1.33,r*.22,r*.13,r*.16,fur);
   horn(r*.93+lean,side*r*.22,r*1.41,r*.12,r*.10,goat?r*.75:r*.48,goat?"#786e60":"#4b4c44");
   if(goat)horn(r*.70+lean,side*r*.26,r*1.89,r*.08,r*.07,r*.24,"#746c61");
   orb(r*1.32+lean,side*r*.21,r*1.19,r*.08,r*.07,r*.07,"#262a27");
  }
  if(goat)orb(r*1.35+lean,0,r*.70,r*.13,r*.14,r*.31,"#c2b59f");
  orb(-r*1.13,0,r*.94,r*.21,r*.21,r*.20,belly);
 }else if(t==="deer"){
  // Four-beat run: diagonal legs alternate, knees extend forward and hooves lift.
  // Phase follows actual travelled distance, so idle deer no longer paddle.
  const run=Math.min(1,Math.hypot(m.vx||0,m.vy||0)/105),phase=(m.step||0)*1.55;
  for(const side of [-1,1])for(const front of [-1,1]){
   const x=front*r*.59,y=side*r*.46;
   const beat=Math.sin(phase+(front===side?0:Math.PI));
   const swing=beat*r*.55*run,lift=Math.max(0,beat)*r*.34*run;
   const pose=combatLimbPose(m,front,side,r);
   const kneeX=x+swing*.48+pose.dx*.32,hoofX=x+swing+pose.dx;
   orb(x+swing*.17+pose.dx*.13,y,r*.59+lift*.16,r*.17,r*.16,r*.33,fur);
   orb(kneeX,y,r*.33+lift*.50,r*.14,r*.14,r*.24,"#73583f");
   orb(hoofX,y,r*.13+lift+pose.dz,r*.13,r*.14,r*.17,fur);
   orb(hoofX+swing*.15,y,r*.065+lift+pose.dz,r*.19,r*.18,r*.09,"#3d3931");
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
  const bite=(m.swing||0)>0,feeding=(m.scavengePose||0)>0;
  const stalk=Number.isFinite(m.wildTargetX)&&Number.isFinite(m.wildTargetY)&&
   Math.hypot(m.x-m.wildTargetX,m.y-m.wildTargetY)<240&&!feeding;
  const lean=bite?r*.25:feeding?-r*.14:0;
  const headZ=r*(feeding?.29:bite?.49:.40),tailWave=Math.sin((m.step||0)*.7+clock)*r*.14;
  for(const side of [-1,1])for(const front of [-1,1])
   orb(front*r*.70+(front>0?lean*.65:0),side*r*.39,r*.20+(bite&&front>0?r*.08:0),r*.16,r*.15,r*.19,fur);
  for(let k=0;k<5;k++)orb(-r*(1.07+k*.29),Math.sin(k*.62)*r*.12+tailWave,r*.23,r*(.23-k*.031),r*.13,r*.14,fur);
  orb(-r*.18,0,r*(feeding?.29:.34),r*(stalk?1.40:1.30),r*.30,r*.27,fur);
  orb(r*1.03+lean,0,headZ,r*.41,r*.30,r*.30,fur);
  orb(r*1.35+lean,0,headZ-r*.13,r*.25,r*.18,r*.14,belly);
  if(bite)orb(r*1.38+lean,0,headZ-r*.29,r*.18,r*.17,r*.07,"#4b2925");
  for(const side of [-1,1]){
   orb(r*1.1+lean,side*r*.24,headZ+r*.20,r*.13,r*.13,r*.15,fur);
   orb(r*1.31+lean,side*r*.22,headZ+r*.11,r*.09,r*.065,r*.07,"#eadbb8");
   orb(r*1.33+lean,side*r*.22,headZ+r*.12,r*.045,r*.043,r*.045,"#252720");
  }
 
  }else if(t==="wildFox"){
   const s=window.WildFauna?.visualState?.(m)||{feeding:false,bite:false,tracking:false,alert:false,sprint:false};
   const lean=s.bite?r*.27:s.feeding?-r*.14:s.tracking?r*.12:0,low=s.feeding?r*.16:s.tracking?r*.08:0;
   for(const side of [-1,1])for(const front of [-1,1]){
    const xx=front*r*.64+(front>0?lean*.65:0);
    orb(xx,side*r*.41,r*.29+gait*r*.035*side*front,r*.17,r*.17,r*.28,"#694b39");
    orb(xx+r*.05,side*r*.42,r*.10,r*.19,r*.18,r*.09,"#453a32");
   }
   orb(-r*.16,0,r*.68-low,r*(s.sprint?1.25:1.15),r*.43,r*(s.tracking?.40:.48),fur);
   orb(r*.46,0,r*.62-low,r*.63,r*.42,r*.35,belly);
   for(let k=0;k<5;k++)orb(-r*(1.11+k*.31),Math.sin((m.step||0)*.55+k*.44+clock)*r*.08,r*(.65-k*.045),r*(.32-k*.026),r*(.28-k*.030),r*(.27-k*.024),k===4?"#e9e0ce":fur);
   const hx=r*1.12+lean,hz=r*.77-low;
   orb(hx,0,hz,r*.50,r*.36,r*.39,fur);
   orb(hx+r*.41,0,hz-r*.16,r*.37,r*.24,r*.17,belly);
   orb(hx+r*.73,0,hz-r*.17,r*.11,r*.11,r*.10,"#302f2b");
   for(const side of [-1,1]){
    horn(hx-r*.12,side*r*.24,hz+r*.22,r*.18,r*.15,r*.43,fur);
    orb(hx+r*.23,side*r*.28,hz+r*.04,r*.12,r*.075,r*.09,"#f3e2be");
    orb(hx+r*.27,side*r*.29,hz+r*.05,r*.045,r*.04,r*.05,"#202622");
   }
   if(s.bite)orb(hx+r*.35,0,hz-r*.36,r*.30,r*.22,r*.075,"#4d2a27");
   if(s.alert)orb(hx-r*.06,-r*.34,hz+r*.06,r*.23,r*.06,r*.07,"#d7a777");
  }else if(t==="cheetah"){
  for(const side of [-1,1])for(const front of [-1,1])
   orb(front*r*.65,side*r*.42,r*.32+gait*r*.05*front*side,r*.17,r*.16,r*.33,fur);
  orb(-r*.16,0,r*.74,r*1.29,r*.42,r*.43,fur);orb(r*.78,0,r*.82,r*.45,r*.34,r*.34,fur);
  for(let k=0;k<11;k++){const xx=(-.98+k*.18)*r,yy=(k%2?1:-1)*r*.35;orb(xx,yy,r*.99,r*.08,r*.075,r*.07,"#504235");}
  orb(r*1.09,0,r*.87,r*.34,r*.28,r*.30,fur);orb(r*1.37,0,r*.69,r*.26,r*.18,r*.16,belly);
  for(const side of [-1,1]){orb(r*1.16,side*r*.23,r*.94,r*.09,r*.08,r*.09,"#292b27");}
  for(let k=0;k<6;k++)orb(-r*(1.05+k*.26),Math.sin(k*.75)*r*.14,r*(.7-k*.07),r*.17,r*.11,r*.12,k%2?"#3f403b":fur);
 }else if(t==="giraffe"){
  // Strong visible diagonal gallop: hip, knee, ankle and dark hoof
  // all move independently in world space instead of sliding as fixed pillars.
  const speed=Math.hypot(m.vx||0,m.vy||0),moving=Math.min(1,speed/105);
  const stride=(m.step||0)*1.64;
  for(const side of [-1,1])for(const front of [-1,1]){
   const x=front*r*.58,y=side*r*.37;
   const beat=Math.sin(stride+(front===side?0:Math.PI));
   const swing=beat*r*.67*moving,raise=Math.max(0,beat)*r*.45*moving;
   const kneeX=x+swing*.56,ankleX=x+swing*.90;
   orb(x+swing*.15,y,r*.96+raise*.12,r*.175,r*.16,r*.35,fur);
   orb(kneeX,y,r*.64+raise*.43,r*.145,r*.14,r*.30,fur);
   orb(ankleX,y,r*.33+raise*.80,r*.13,r*.13,r*.29,fur);
   orb(x+swing*1.11,y,r*.11+raise,r*.21,r*.18,r*.12,"#574332");
  }
  const attacking=(m.windup||0)>0||(m.swing||0)>0;
  const hit=(m.swing||0)>0;
  const headDrive=hit?r*.62:attacking?-r*.16:0;
  const headDip=hit?r*.49:0;
  const headSway=attacking?Math.sin(clock*13)*r*.17:0;
  const bob=moving*Math.abs(Math.sin(stride))*r*.042;
  orb(-r*.22,0,r*1.39+bob,r*1.06,r*.44,r*.48,fur);
  for(let k=0;k<10;k++){const x=(-.95+k*.19)*r,side=k%2?-1:1;orb(x,side*r*.37,r*1.60+bob,r*.13,r*.08,r*.14,"#a87948");}
  orb(r*.72+headDrive*.28,headSway*.14,r*2.10-headDip*.25,r*.24,r*.24,r*1.07,fur);
  for(let k=0;k<5;k++)orb(r*.72+headDrive*.30+(k%2)*r*.13,headSway*.14+(k%3-1)*r*.12,r*(1.52+k*.35)-headDip*.30,r*.12,r*.10,r*.14,"#aa763e");
  orb(r*1.08+headDrive,headSway,r*3.10-headDip,r*.40,r*.31,r*.33,fur);
  orb(r*1.48+headDrive,headSway,r*2.97-headDip,r*.27,r*.19,r*.18,belly);
  for(const side of [-1,1]){
   orb(r*1.10+headDrive,headSway+side*r*.20,r*3.35-headDip,r*.10,r*.12,r*.15,fur);
   pyramid(fx(r*1.03+headDrive,headSway+side*r*.17),fy(r*1.03+headDrive,headSway+side*r*.17),r*3.37-headDip,r*.10,r*.10,r*.31,"#876643");
  }
  orb(-r*1.35,0,r*1.55,r*.23,r*.13,r*.14,"#6a533e");
 }else if(t==="zebra"){
  // Gallop: diagonal pairs flex independently, knees and hooves follow distinct arcs.
  const run=clamp(Math.hypot(m.vx||0,m.vy||0)/110,0,1.35),cycle=(m.step||0)*1.9;
  for(const side of [-1,1])for(const front of [-1,1]){
   const beat=Math.sin(cycle+(front===side?0:Math.PI)+(front>0?.32:0));
   const pose=combatLimbPose(m,front,side,r);
   const stride=beat*r*.58*run+pose.dx,up=Math.max(0,beat)*r*.37*run+pose.dz,hip=front*r*.59,lat=side*r*.48;
   orb(hip+stride*.13,lat,r*.76+up*.13,r*.23,r*.20,r*.33,"#e0e0d7");
   orb(hip+stride*.52,lat,r*.43+up*.47,r*.16,r*.16,r*.26,"#585854");
   orb(hip+stride*.86,lat,r*.20+up*.83,r*.125,r*.14,r*.20,"#e6e4db");
   orb(hip+stride,lat,r*.085+up,r*.20,r*.18,r*.11,"#282d2d");
  }
  orb(-r*.18,0,r*.96,r*1.20,r*.56,r*.53,fur);
  for(let k=0;k<8;k++){const xx=(-1.0+k*.25)*r;orb(xx,0,r*1.38,r*.10,r*.53,r*.065,"#363c3c");}
  orb(r*.66,0,r*1.15,r*.44,r*.33,r*.66,fur);
  for(let k=0;k<3;k++)orb(r*.62+(k%2)*r*.12,0,r*(1.07+k*.31),r*.08,r*.32,r*.09,"#3d4140");
  orb(r*1.05,0,r*1.53,r*.44,r*.29,r*.37,fur);orb(r*1.43,0,r*1.35,r*.30,r*.25,r*.20,"#454847");
  for(const side of [-1,1])pyramid(fx(r*1.01,side*r*.23),fy(r*1.01,side*r*.23),r*1.86,r*.15,r*.14,r*.33,fur);
  for(let k=0;k<5;k++)orb(-r*(1.18+k*.26),0,r*(.93-k*.12),r*.11,r*.10,r*.13,k%2?"#343b3b":fur);
 }else if(t==="lion"){
  // Feline pursuit: paired hind-leg thrust and flexible airborne forepaws.
  const chase=clamp(Math.hypot(m.vx||0,m.vy||0)/125,0,1.3),cycle=(m.step||0)*2.4;
  for(const side of [-1,1])for(const front of [-1,1]){
   const beat=Math.sin(cycle+(front>0?0:Math.PI)+side*.36);
   const pose=combatLimbPose(m,front,side,r);
   const stride=beat*r*.62*chase+pose.dx,up=Math.max(0,beat)*r*.34*chase+pose.dz,hip=front*r*.59,lat=side*r*.49;
   orb(hip+stride*.13,lat,r*.60+up*.20,r*.30,r*.28,r*.30,fur);
   orb(hip+stride*.53,lat,r*.32+up*.53,r*.22,r*.20,r*.24,fur);
   orb(hip+stride,lat,r*.11+up,r*.29,r*.27,r*.15,"#c5a26c");
  }
  orb(-r*.17,0,r*.89,r*1.28,r*.66,r*.67,fur);
  orb(r*.71,0,r*1.08,r*.77,r*.79,r*.90,"#8d663d");
  for(let k=0;k<11;k++){const a=k*TAU/11;orb(r*.70,Math.cos(a)*r*.68,r*1.08+Math.sin(a)*r*.66,r*.26,r*.19,r*.22,"#a67a47");}
  orb(r*1.13,0,r*1.10,r*.50,r*.38,r*.43,fur);orb(r*1.47,0,r*.87,r*.30,r*.27,r*.18,belly);
  for(const side of [-1,1])orb(r*1.20,side*r*.29,r*1.25,r*.09,r*.09,r*.09,"#352c24");
   if((m.lionRoarPose||0)>0){const roar=Math.min(1,m.lionRoarPose);
    orb(r*1.50,0,r*.66,r*.32,r*.29,r*.13,"#382b24");
    orb(r*1.48,0,r*(.52-roar*.10),r*.26,r*.22,r*.11,belly);
    for(const side of [-1,1])pyramid(fx(r*1.51,side*r*.18),fy(r*1.51,side*r*.18),r*.69,r*.06,r*.06,r*.14,"#efe2c9");}
  for(let k=0;k<5;k++)orb(-r*(1.13+k*.26),0,r*(.82-k*.07),r*.14,r*.11,r*.11,k===4?"#584734":fur);
 }else if(t==="elephant"){
  // Heavy lateral walk: four independently planted pillar legs and broad toenails.
  const walking=clamp(Math.hypot(m.vx||0,m.vy||0)/90,0,1),cycle=(m.step||0)*1.13;
  for(const side of [-1,1])for(const front of [-1,1]){
   const beat=Math.sin(cycle+(front===side?0:Math.PI)),pose=combatLimbPose(m,front,side,r),step=beat*r*.28*walking+pose.dx;
   const stomp=front>0&&side<0?Math.sin(Math.PI*Math.min(1,m.elephantStompPose||0))*r*.25:0;
    const lift=Math.max(0,beat)*r*.15*walking+pose.dz+stomp,hip=front*r*.60,lat=side*r*.67;
   orb(hip+step*.18,lat,r*.77+lift*.13,r*.41,r*.39,r*.37,"#798680");
   orb(hip+step*.57,lat,r*.44+lift*.43,r*.35,r*.35,r*.34,"#66746d");
   orb(hip+step,lat,r*.12+lift,r*.41,r*.39,r*.15,"#59665f");
   for(let toe=-1;toe<=1;toe++)orb(hip+step+r*.24,lat+toe*r*.19,r*.08+lift,r*.10,r*.085,r*.055,"#a9a99a");
  }
  orb(-r*.23,0,r*1.22,r*1.41,r*1.01,r*1.11,fur);orb(r*.80,0,r*1.28,r*.89,r*.81,r*.98,belly);
  for(const side of [-1,1]){
   orb(r*.84,side*r*.82,r*1.40,r*.55,r*.31,r*.75,"#798983");
   pyramid(fx(r*1.49,side*r*.38),fy(r*1.49,side*r*.38),r*.55,r*.13,r*.11,r*1.05,"#e7dfc7");
   orb(r*1.25,side*r*.30,r*1.50,r*.10,r*.10,r*.10,"#313b37");
  }
  for(let k=0;k<6;k++){
    const trunk=Math.sin(Math.PI*Math.min(1,m.elephantStompPose||0))*r*.25*(1-k/7);
    orb(r*(1.42+k*.18),Math.sin(k*.58+(m.step||0)*.01)*r*.14,r*(1.07-k*.17)+trunk,r*(.28-k*.024),r*(.27-k*.023),r*(.27-k*.023),fur);
   }
 }else if(t==="hippo"){
  for(const side of [-1,1])for(const front of [-1,1])
   orb(front*r*.57,side*r*.70,r*.42,r*.32,r*.37,r*.43,"#736969");
  orb(-r*.19,0,r*.91,r*1.38,r*1.04,r*.91,fur);orb(r*.74,0,r*1.01,r*.87,r*.76,r*.68,belly);
  orb(r*1.42,0,r*.66,r*.70,r*.61,r*.45,fur);
  for(const side of [-1,1]){
   orb(r*1.48,side*r*.40,r*.92,r*.18,r*.18,r*.16,fur);
   orb(r*1.65,side*r*.37,r*.76,r*.13,r*.12,r*.10,"#373231");
   orb(r*.93,side*r*.58,r*1.48,r*.14,r*.15,r*.16,fur);
  }
}else if(t==="raccoonDog"){
  for(const side of [-1,1])for(const front of [-1,1])
   orb(front*r*.54,side*r*.55,r*.25,r*.22,r*.18,r*.29,"#554a42");
  orb(-r*.18,0,r*.54-((m.scavengePose||0)>0?r*.16:0),r*(Math.hypot(m.vx||0,m.vy||0)>125?1.13:1.02),r*.64,r*(window.WildFauna?.visualState?.(m)?.tracking?.43:.49),fur);
  for(let k=0;k<3;k++)orb(-r*(1.22+k*.27),0,r*.60,r*.31,r*.23,r*.23,k%2?"#66574a":"#4d443e");
  orb(r*.73+(window.WildFauna?.visualState?.(m)?.bite?r*.24:window.WildFauna?.visualState?.(m)?.feeding?-r*.16:window.WildFauna?.visualState?.(m)?.tracking?r*.12:0),0,r*.62,r*.57,r*.52,r*.43,fur);
  for(const side of [-1,1]){
   orb(r*.90,side*r*.30,r*.66,r*.27,r*.18,r*.25,"#3f4041");
   orb(r*1.01,side*r*.31,r*.77,r*.10,r*.08,r*.08,belly);
   orb(r*1.00,side*r*.32,r*.81,r*.05,r*.04,r*.05,"#242423");
   orb(r*.58,side*r*.40,r*1.00,r*.20,r*.16,r*.22,fur);
  }
  orb(r*1.26,0,r*.49,r*.29,r*.24,r*.20,belly);
   if(window.WildFauna?.visualState?.(m)?.bite)orb(r*1.18,0,r*.27,r*.29,r*.20,r*.08,"#512c25");
   if(window.WildFauna?.visualState?.(m)?.alert)orb(r*.75,-r*.39,r*.88,r*.23,r*.07,r*.07,"#d0b08e");
 }
 return true;
}


/* Three species-specific player meshes: sculpted with shaded anatomical
 * volumes, real muzzle/eye/feet ratios, fur/feather pattern and attack poses.
 * No external image textures, borrowed models or sprite impostors. */
function drawDistinctWildlife3D(m,clock){
 const t=m.type;
 if(t!=="armadillo"&&t!=="hedgehog"&&t!=="hyena")return false;
 const r=m.r||17,dir=m.dir||0,c=Math.cos(dir),sn=Math.sin(dir),speed=Math.hypot(m.vx||0,m.vy||0);
 const moving=clamp(speed/155,0,1),phase=(m.steps||m.step||0)*2.8;
 const young=m.age==="若い"||m.ageStage==="young",size=young?.84:1;
 const male=m.sex==="オス"||m.sex==="male";
 const x=(a,b)=>m.x+a*c-b*sn,y=(a,b)=>m.y+a*sn+b*c;
 const orb=(a,b,z,rx,ry,rz,col)=>ellipsoid(x(a,b),y(a,b),z,rx*size,ry*size,rz*size,col,dir,10,6);
 const cone=(a,b,z,w,h,col)=>pyramid(x(a,b),y(a,b),z,w*size,w*size,h*size,col);
 const gait=(front,side)=>Math.sin(phase+(front*side>0?0:Math.PI))*moving;
 if(t==="armadillo"){
  // Armoured low-slung body: segmented transverse bands and long tapered tail.
  for(const front of [-1,1])for(const side of [-1,1]){
   const g=gait(front,side),pose=combatLimbPose(m,front,side,r);orb(front*r*.55+g*r*.15+pose.dx,side*r*.46,r*.22+Math.max(0,g)*r*.13+pose.dz,r*.17,r*.16,r*.25,"#706b57");
  }
  orb(0,0,r*.47,r*.98,r*.59,r*.49,"#827964");
  for(let i=-3;i<=3;i++){
   const a=i*r*.205;
   orb(a,0,r*.80,r*.095,r*.565,r*.12,i%2?"#a99a7c":"#655e50");
  }
  orb(r*.89,0,r*.42,r*.35,r*.28,r*.24,"#9a8971");
  orb(r*1.16,0,r*.32,r*.18,r*.16,r*.15,"#ad9a7d");
  for(const side of [-1,1])cone(r*.76,side*r*.20,r*.54,r*.10,r*.29,"#7d715d");
  for(let i=0;i<5;i++)orb(-r*(.94+i*.24),Math.sin(i*.3)*r*.07,r*(.40-i*.055),r*.20*(1-i*.14),r*.15*(1-i*.13),r*.15*(1-i*.13),"#746b5a");
 }else if(t==="hedgehog"){
  for(const front of [-1,1])for(const side of [-1,1]){
   const g=gait(front,side),pose=combatLimbPose(m,front,side,r);orb(front*r*.42+g*r*.12+pose.dx,side*r*.37,r*.19+Math.max(0,g)*r*.10+pose.dz,r*.15,r*.15,r*.20,"#746354");
  }
  orb(0,0,r*.42,r*.82,r*.64,r*.48,"#806d5a");
  orb(r*.65,0,r*.43,r*.43,r*.37,r*.34,"#b9a58a");
  orb(r*.99,0,r*.35,r*.14,r*.17,r*.12,"#40362e");
  for(const side of [-1,1])orb(r*.76,side*r*.29,r*.55,r*.085,r*.08,r*.09,"#302c2a");
  // Radial quill field follows the spine and flanks, leaving the face clear.
  for(let i=0;i<11;i++)for(let j=-4;j<=4;j++){
   const a=-r*.78+i*r*.135,b=j*r*.14;
   const spread=Math.sqrt(Math.max(0,1-(b/(r*.79))**2));
   const z=r*(.69+.40*spread);
   cone(a,b,z,r*.055,r*(.31+.12*spread),((i+j)&1)?"#e5d6b5":"#433b34");
  }
 }else{
  // Hyena: sloping back, raised shoulders, shorter hindquarters and spotted coat.
  for(const front of [-1,1])for(const side of [-1,1]){
   const g=gait(front,side),h=front>0?r*.83:r*.56;
   orb(front*r*.57+g*r*.27,side*r*.45,h*.46+Math.max(0,g)*r*.15,r*.19,r*.17,h*.52,"#9d8662");
  }
  orb(-r*.08,0,r*.94,r*1.08,r*.52,r*.57,"#9b8462");
  orb(r*.39,0,r*1.14,r*.56,r*.60,r*.61,"#857258");
  orb(r*.96,0,r*1.14,r*.43,r*.37,r*.37,"#ad9570");
  orb(r*1.28,0,r*.98,r*.36,r*.25,r*.23,"#5d4d3e");
  for(const side of [-1,1])cone(r*.92,side*r*.28,r*1.44,r*.17,r*.34,"#6b5946");
  for(let i=0;i<16;i++){
   const a=-r*.83+(i%8)*r*.22,b=(i<8?-1:1)*r*(.22+.12*(i%3)/3);
   orb(a,b,r*(1.12+.10*Math.sin(i)),r*.072,r*.065,r*.065,"#53483a");
  }
  for(let i=0;i<4;i++)orb(-r*(1.02+i*.17),0,r*(.80-i*.12),r*.18,r*.14,r*.15,"#493e35");
  if(male)orb(r*.27,0,r*1.60,r*.33,r*.38,r*.19,"#594d40");
 }
 return true;
}

/* Individual ID may be a persisted STRING (released animals, gacha roster).
   Never feed it directly to Math.sin: NaN silently destroys 3D vertex positions. */
const visualIdSeedCache=new Map();
function visualIdSeed(id){
 if(typeof id==="number")return Number.isFinite(id)?id:0;
 if(typeof id!=="string"||!id.length)return 0;
 if(visualIdSeedCache.has(id))return visualIdSeedCache.get(id);
 let hash=0;
 for(let i=0;i<id.length;i++)hash=(Math.imul(hash,31)+id.charCodeAt(i))>>>0;
 const seed=(hash%6283)/1000;
 if(visualIdSeedCache.size>=2048)visualIdSeedCache.clear();
 visualIdSeedCache.set(id,seed);
 return seed;
}

function drawRarePlayable3D(m,clock){
 const t=m.type;
 if(t!=="manul"&&t!=="tibetanFox"&&t!=="shoebill")return false;
 // Individual age and sex affect silhouette without changing gameplay collision radius.
 const young=m.age==="若い"||m.age==="若年"||m.ageStage==="young";
 const male=m.sex==="オス"||m.sex==="male";
  const adult=!young, breath=1+.025*Math.sin(clock*2.1+visualIdSeed(m.id)), alert=!!(m.target||m.alert||m.attackTarget);
 const sizeFactor=young?.84:1;
 const r=(m.r||18)*sizeFactor,dir=m.dir||0,c=Math.cos(dir),sn=Math.sin(dir);
 const fx=(dx,dy)=>m.x+dx*c-dy*sn,fy=(dx,dy)=>m.y+dx*sn+dy*c;
 const orb=(dx,dy,z,rx,ry,rz,col,seg=8,ring=5)=>ellipsoid(fx(dx,dy),fy(dx,dy),z,rx,ry,rz,col,dir,seg,ring);
 const spike=(dx,dy,z,rx,ry,height,col)=>pyramid(fx(dx,dy),fy(dx,dy),z,rx,ry,height,col);
 const move=clamp(Math.hypot(m.vx||0,m.vy||0)/190,0,1);
 // One stride per distance travelled; no idle paddling. Both step field names
 // are supported because wild NPCs and the controlled individual differ.
 const phase=(m.steps||m.step||0)*2.4;
 const step=Math.sin(phase)*move;
 const legKick=(front,side)=>Math.sin(phase+(front===side?0:Math.PI))*move;
 const conceal=!!m.hidden,attack=(m.pendingStrike||m.swing>0||(m.specialVisual||0)>0);
 const specialMotion=Math.sin(Math.PI*clamp((m.specialVisual||0)/1.02,0,1));
 const normalMotion=Math.sin(Math.PI*clamp((m.attackAction||0)/.45,0,1));
 if(t==="manul"){
  // Broad heavily furred torso, stubby limbs, low head with low-mounted ears.
  const fur="#a8a69f",cream="#ddd8ca",under="#c9c4b7",shadow="#727872";
  const belly=conceal?r*.38:r*.49;
  for(const front of [-1,1])for(const side of [-1,1]){
   const dx=front*r*.55,dy=side*r*.52;
   const kick=legKick(front,side),pose=combatLimbPose(m,front,side,r),lift=Math.max(0,kick)*r*.16+pose.dz;
   orb(dx+kick*r*.26+pose.dx,dy,r*.14+lift,r*.25,r*.20,r*.14,shadow);
   orb(dx+kick*r*.13+pose.dx*.52,dy,r*.30+lift*.45,r*.23,r*.22,r*.26,fur);
  }
  orb(-r*.24,0,belly+r*.12,r*1.35,r*.84,r*.61,fur,12,7);
  orb(r*.18,0,belly+r*.06,r*.87,r*.78,r*.54,under,10,6);
  orb(-r*.14,0,belly+r*.47,r*1.06,r*.72,r*.25,fur);
  // Broad shoulder mantle: individual tufts and light frosted guard hairs.
  for(let i=0;i<13;i++){
   const dx=-r*1.02+i*r*.18,shade=i%3?"#c7c6bd":"#838a86";
   for(const side of [-1,1]){
    spike(dx,side*r*.67,belly+r*.25,r*.09,r*.10,r*.27,shade);
   }
  }
  // Thick rounded tail with distinct dark rings, not a fox brush.
  for(let k=0;k<7;k++){
   const x=-r*(1.10+k*.28),tw=Math.sin(k*.54+clock*.85)*r*.09;
   orb(x,tw,r*(.40+k*.018),r*(.29-k*.013),r*(.25-k*.011),r*(.24-k*.008),k%2?"#696d69":"#c9c8bd",7,4);
  }
  const faceDrive=attack?r*(.035+specialMotion*.13+normalMotion*.09):0;
  orb(r*.67+faceDrive,0,belly+r*.37,r*.70,r*.75,r*.47,"#c7c7bd",12,7);
  // Adult males have a visibly broader cheek ruff; younger animals a smaller one.
  for(const side of [-1,1])orb(r*.48+faceDrive,side*r*(male?.76:.69),belly+r*.29,r*(male?.27:.19),r*(male?.29:.22),r*.21,male?"#b1b0a6":"#c7c6ba",9,5);
  orb(r*.88+faceDrive,0,belly+r*.18,r*.55,r*.66,r*.32,cream,12,6);
  for(const side of [-1,1]){
   // Rounded tiny ears, set LOW and spread widely.
   orb(r*.44+faceDrive,side*r*.72,belly+r*.68,r*.21,r*.21,r*.16,"#858580");
   orb(r*.51+faceDrive,side*r*.76,belly+r*.72,r*.12,r*.14,r*.10,"#b89f9b");
   // Pale mask and deep cheek markings.
   orb(r*.94+faceDrive,side*r*.38,belly+r*.34,r*.21,r*.24,r*.17,"#eee7ce",8,5);
   orb(r*1.10+faceDrive,side*r*.35,belly+r*.42,r*.125,r*.12,r*.10,"#d4b780",9,5);
   orb(r*1.20+faceDrive,side*r*.36,belly+r*.43,r*.062,r*.066,r*.066,"#171c1c",8,4); // round pupil
   for(let i=0;i<3;i++)
    orb(r*(.50-i*.13)+faceDrive,side*r*(.63+i*.05),belly+r*.36,r*.06,r*.10,r*.045,"#68716f",6,3);
   for(let k=0;k<3;k++)
    orb(r*(1.13+k*.14)+faceDrive,side*r*(.18+k*.12),belly+r*.21,r*.12,r*.008,r*.008,"#f4eee0",6,3);
  }
  // Forehead's broken transverse bars and dense rounded cheek ruff.
  for(let k=0;k<3;k++){
   const x=r*(.69+k*.15)+faceDrive;
   orb(x,0,belly+r*(.77-k*.035),r*.085,r*(.48-k*.075),r*.026,k===1?"#6c746e":"#898f87",9,4);
  }
  for(const side of [-1,1])for(let k=0;k<4;k++)
   orb(r*(.48-k*.15)+faceDrive,side*r*(.70+k*.045),belly+r*(.25-k*.035),r*.15,r*.12,r*.085,k%2?"#b7b7ac":"#d4d0c3",7,4);
  orb(r*1.39+faceDrive,0,belly+r*.18,r*.115,r*.13,r*.09,"#896e6e",8,5);
  orb(r*1.38+faceDrive,0,belly+r*.09,r*.23,r*.18,r*.085,"#e4dbca");
 }else if(t==="tibetanFox"){
  // Angular Tibetan sand fox face: extremely broad square cheeks and tiny eyes.
  const fur="#bfa88e",sand="#e5cfb6",mask="#8f877e",light="#f1e2ce";
  const bob=Math.abs(step)*r*.08;
  for(const front of [-1,1])for(const side of [-1,1]){
   const x=front*r*.62,y=side*r*.48;
   const kick=legKick(front,side),pose=combatLimbPose(m,front,side,r),lift=Math.max(0,kick)*r*.17+pose.dz;
   orb(x+kick*r*.34+pose.dx*.43,y,r*.24+lift*.55,r*.18,r*.17,r*.25,"#817667");
   orb(x+r*.10+kick*r*.50+pose.dx,y,r*.12+lift,r*.22,r*.19,r*.12,"#64584f");
  }
  orb(-r*.20,0,r*.64+bob,r*1.23,r*.58,r*.48,fur,11,6);
  orb(r*.19,0,r*.62+bob,r*.79,r*.43,r*.33,sand);
  orb(-r*.16,0,r*.91+bob,r*.92,r*.50,r*.21,"#cab7a3");
  for(let k=0;k<7;k++){
   const x=-r*(1.11+k*.31),y=Math.sin(k*.5+clock*.9)*r*.09;
   orb(x,y,r*(.39+k*.016),r*(.34-k*.016),r*(.26-k*.016),r*(.25-k*.01),k%3===0?"#e0d1b9":"#ad9b84",7,4);
  }
  // The flat mask is a wide face, not an ordinary pointed fox muzzle.
  const headX=r*.79+(attack?r*(.035+specialMotion*.14+normalMotion*.10):0);
  orb(headX,0,r*.89+bob,r*.57,r*.79,r*.49,mask,12,7);
  if(male)for(const side of [-1,1])orb(headX-r*.12,side*r*.64,r*.78+bob,r*.22,r*.18,r*.27,"#a49786",9,5);
  orb(headX+r*.09,0,r*.85+bob,r*.55,r*.78,r*.39,light,12,7);
  for(const side of [-1,1]){
   spike(headX-r*.18,side*r*.55,r*1.08+bob,r*.15,r*.17,r*.49,"#8c7769");
   spike(headX-r*.10,side*r*.54,r*1.11+bob,r*.08,r*.09,r*.36,"#c49a8b");
   orb(headX+r*.19,side*r*.51,r*.88+bob,r*.32,r*.25,r*.29,light,9,5);
   orb(headX+r*.30,side*r*.41,r*1.09+bob,r*.18,r*.12,r*.057,"#6b6863",9,4);
   orb(headX+r*.41,side*r*.42,r*1.10+bob,r*.10,r*.065,r*.042,"#202725",8,4); // narrow horizontal eye
   orb(headX+r*.39,side*r*.42,r*1.14+bob,r*.10,r*.06,r*.025,"#d3be9d");
  }
  // Distinct straight brow ridge, broad flat cheek plane and darker
  // vertical cheek boundary (the sand fox's characteristic boxy face).
  for(const side of [-1,1]){
   orb(headX+r*.16,side*r*.49,r*1.18+bob,r*.34,r*.16,r*.068,"#a79a87",9,4);
   orb(headX-r*.11,side*r*.72,r*.80+bob,r*.12,r*.065,r*.30,"#918679",8,4);
   orb(headX+r*.07,side*r*.67,r*.64+bob,r*.30,r*.09,r*.12,"#e7d5bf",8,4);
  }
  // Broad squared jowls taper into a small closed muzzle.
  orb(headX+r*.46,0,r*.78+bob,r*.46,r*.35,r*.25,"#eee1cf",10,5);
  orb(headX+r*.87,0,r*.76+bob,r*.12,r*.15,r*.11,"#46403b");
  orb(headX+r*.71,0,r*.65+bob,r*.26,r*.19,r*.07,"#d0bda8");
 }else{
  // Shoebill anatomy: tall unfeathered shanks, rigid gray body, layered
  // flight feathers and an oversized laterally wide, hooked shoe-shaped bill.
  const grey="#798b94",dark="#52656d",feather="#9eabb0",bill="#c5bf9f";
  const flap=m.jumpTime>0||m.pounceTime>0||specialMotion>.12;
  const focus=m.beakVisual>0||m.beakStrike;
  const swingNorm=clamp((m.shoebillSwingTime||0)/.35,0,1);
  const sweep=Math.sin(Math.PI*swingNorm);
  const neckSweep=(m.shoebillSwingDir||1)*(sweep*.36+specialMotion*.30+normalMotion*.18)*r*.34;
  const thrust=r*(.30*sweep+.28*specialMotion+.16*normalMotion);
  const drop=r*(.20*sweep+.18*specialMotion+.09*normalMotion);
  const gape=r*(.10*sweep+.07*specialMotion+.045*normalMotion);
  const lean=focus?r*(.08+sweep*.10+specialMotion*.12+normalMotion*.06):(sweep+specialMotion)*r*.12;
  const bob=Math.abs(step)*r*.10;
  // Thin, long tarso-metatarsal legs and splayed toes.
  for(const side of [-1,1]){
   const legX=side<0?-r*.12:r*.13,legY=side*r*.34;
   const strikeBrace=clamp(sweep+specialMotion+normalMotion,0,1);
   const kick=Math.sin(phase+(side<0?0:Math.PI))*move*(1-strikeBrace*.92);
   const lift=Math.max(0,kick)*r*.26,ankleX=legX+kick*r*.45;
   orb(legX+kick*r*.12,legY,r*.53+lift*.30,r*.12,r*.13,r*.42,"#8a9088",7,4);
   orb(ankleX,legY,r*.14+lift,r*.18,r*.18,r*.13,"#7a877d",8,4);
   for(let toe=-1;toe<=1;toe++)
    orb(ankleX+r*(.19+(toe===0?.11:0)),legY+toe*r*.23,r*.055+lift,r*.25,r*.063,r*.055,"#687b73",7,3);
  }
  orb(-r*.15,0,r*1.18+bob,r*.87,r*.66,r*.77,grey,12,8);
  orb(r*.29,0,r*1.24+bob,r*.65,r*.53,r*.64,"#889aa2",11,7);
  // Folded wings with visible primary/secondary feather separation.
  for(const side of [-1,1]){
   orb(-r*.33,side*r*(flap?.71:.55),r*(flap?1.43:1.24)+bob,r*(flap?.98:.72),r*.24,r*.30,dark,10,6);
   for(let k=0;k<6;k++){
    orb(-r*(.65+k*.095),side*r*(flap?.85:.67),r*(1.27-k*.022)+bob,
     r*.21,r*.12,r*.10,k%2?"#8f9fa5":"#aab6b8",7,4);
   }
  }
  // Layered scapular feather edges keep the wings readable when folded.
  for(const side of [-1,1])for(let k=0;k<5;k++)
   orb(-r*(.23+k*.19),side*r*.71,r*(1.34-k*.07)+bob,r*.19,r*.075,r*.065,k%2?"#667983":"#a2afb3",8,4);
  // Uplifted neck and distinct blunt crown.
  orb(r*.56+lean*.3+thrust*.35,neckSweep*.35,r*1.57+bob-drop*.35,r*.35,r*.32,r*.55,"#84949a",10,6);
  const headY=neckSweep*.75;
  orb(r*.85+lean*.5+thrust,headY,r*1.98+bob-lean*.36-drop,r*.41,r*.37,r*.36,feather,10,6);
  for(let k=0;k<3;k++)
   spike(r*.57+k*r*.12+lean*.5+thrust,-r*.05+k*r*.07+headY,r*2.23+bob-lean*.36-drop,r*.09,r*.08,r*(.20+k*.045),"#a5b1b5");
  for(const side of [-1,1]){
   orb(r*.99+lean*.5+thrust,side*r*.31+headY,r*2.03+bob-lean*.35-drop,r*.11,r*.080,r*.096,"#ebd392",8,5);
   orb(r*1.055+lean*.5+thrust,side*r*.33+headY,r*2.03+bob-lean*.35-drop,r*.053,r*.045,r*.054,"#171b1b",8,4);
  }
  // Huge rigid shoe-like beak with an actual hooked apex; pose darts forward.
  const beakX=r*1.46+lean*.5+thrust,beakZ=r*1.80+bob-lean*.36-drop;
  orb(beakX,headY,beakZ+gape*.5,r*(male?.78:.72),r*(male?.55:.51),r*.32,bill,12,7);
  orb(beakX+r*.29,headY,beakZ-r*.10+gape*.5,r*.48,r*.47,r*.21,"#afa88e",11,5);
  orb(beakX-r*.08,headY,beakZ+r*.29+gape*.5,r*.53,r*.36,r*.13,"#dfd6b5",10,4);
  orb(beakX+r*.74,headY,beakZ-r*.19+gape*.5,r*.18,r*.34,r*.18,"#797865",8,5);
  orb(beakX+r*.18,headY,beakZ-r*.26-gape*.65,r*.60,r*.39,r*.115,"#8e8872",10,5);
  // Bill's median ridge and pronounced downward terminal hook.
  orb(beakX+r*.05,headY,beakZ+r*.36+gape*.5,r*.53,r*.105,r*.075,"#e5ddba",10,4);
  orb(beakX+r*.81,headY,beakZ-r*.37+gape*.5,r*.14,r*.14,r*.25,"#77735e",8,5);
  spike(beakX+r*.87,headY,beakZ-r*.47+gape*.5,r*.14,r*.14,-r*.23,"#656454");
  for(const side of [-1,1]){
   orb(beakX-r*.05,side*r*.40+headY,beakZ+r*.12+gape*.5,r*.07,r*.05,r*.025,"#6e7265",7,4);
  }
 }
 return true;
}



/* Giant tree frog and Pacman frog: dedicated mesh anatomy and expressive movement.
   World coordinates and solid/collision heights stay owned by the game engine. */
function drawPlayableFrog3D(m,clock){
 const tree=m.type==="giantTreeFrog",horned=m.type==="pacmanFrog";
 if(!tree&&!horned)return false;
 const young=m.age==="若い"||m.ageStage==="young",male=m.sex==="オス"||m.sex==="male";
 const r=(m.r||29)*(young?.83:1),dir=Number(m.dir)||0,c=Math.cos(dir),sn=Math.sin(dir);
 const fx=(x,y)=>m.x+x*c-y*sn,fy=(x,y)=>m.y+x*sn+y*c;
 const orb=(x,y,z,rx,ry,rz,col,seg=10,ring=6)=>ellipsoid(fx(x,y),fy(x,y),z,rx,ry,rz,col,dir,seg,ring);
 const spike=(x,y,z,w,h,col)=>pyramid(fx(x,y),fy(x,y),z,w,w,h,col);
 const skin=tree?"#62bd65":"#879748",dark=tree?"#34915a":"#5c6535",belly=tree?"#d5e5ad":"#d4b777";
 const speed=Math.hypot(Number(m.vx)||0,Number(m.vy)||0),motion=Math.min(1,speed/150);
 const beat=Math.sin((m.frogHopPhase||0)*Math.PI*2)*motion;
 const hopLift=Math.max(0,Number(m.frogHopLift)||0);
 const airborne=clamp(hopLift/Math.max(1,r*2.8),0,1);
 const slam=clamp(Number(m.frogSlamPose)||0,0,1);
 const crouch=motion*(1-Math.max(0,Math.sin((m.frogHopPhase||0)*Math.PI)))*r*.11+slam*r*.16;
 const squeeze=slam;
 // Jump physics stays in game.js; pose-only leg extension and landing brace.
 const extension=airborne*r*(tree?.40:.25),kick=airborne*r*(tree?.34:.18);
 if(hopLift>0||slam>0){
  const lift=animalLift;animalLift=Math.max(0,lift-hopLift);
  ellipsoid(m.x,m.y,1.5,r*(1.10+slam*.26),r*(.77+slam*.20),1.3,
   slam>.15?"#8b6e43":"#273b31",dir,12,3);
  animalLift=lift;
 }
 // Powerful folded hind legs have a femur, shank, splayed toes, and adhesive pads.
 for(const side of [-1,1]){
  orb(-r*.64-kick*.26,side*r*.70,r*.34-crouch+extension*.35,r*(tree?.55:.64),r*.38,r*.39,dark,10,6);
  orb(-r*.85+beat*r*.15-kick,side*r*.83,r*.20-crouch*.4-extension*.35,r*.46,r*.25,r*.17,skin);
  for(let toe=-1;toe<=1;toe++){
   const toeY=side*r*(1.00+.105*Math.abs(toe)),toeX=-r*(1.00+Math.abs(toe)*.13);
   orb(toeX+beat*r*.10-kick,toeY,r*.10-extension*.35,r*.22,r*.095,r*.07,skin,8,4);
   orb(toeX-r*.20+beat*r*.10-kick,toeY,r*.07-extension*.35,r*(tree?.16:.13),r*(tree?.155:.13),r*.065,tree?"#9ddb82":"#b7a66b",8,4);
  }
  orb(r*.53,side*r*.57,r*.28-crouch*.5,r*.22,r*.21,r*.31,skin);
  orb(r*.85,side*r*.72,r*.12,r*.31,r*.22,r*.13,dark);
  for(let toe=-1;toe<=1;toe++)
   orb(r*1.09,side*r*.72+toe*r*.15,r*.08,r*.13,r*.11,r*.055,tree?"#a2d47c":"#b4a06b",7,4);
 }
 orb(-r*.19,0,r*(tree?.64:.68)-crouch+extension*.12,r*(tree?1.18:1.26)*(1+slam*.08),r*(tree?.83:1.02)*(1+slam*.10),r*(tree?.63:.76)*(1-slam*.17),skin,14,9);
 orb(r*.31,0,r*.36-crouch*.40,r*(tree?.91:1.07),r*(tree?.70:.95),r*.34,belly,14,8);
 // Inflatable chin and the slow breathing/buccal pump.
 const breath=1+.025*Math.sin(clock*2.2+visualIdSeed(m.id));
 orb(r*.61,0,r*.32-crouch*.4,r*.53*breath,r*.46,r*.24,tree?"#c4dbab":"#cbb17b");
 // Stable, non-tiling dorsal skin glands and random-looking chromatophore patterns.
 for(let k=0;k<(tree?19:31);k++){
  const a=k*2.39996323,rad=Math.sqrt((k+.4)/(tree?19:31));
  const px=-r*.21+Math.cos(a)*r*.95*rad,py=Math.sin(a)*r*(tree?.68:.91)*rad;
  const rise=r*(tree?1.09:1.22)-crouch-r*.20*rad;
  orb(px,py,rise,r*(tree?.087:.14)*(k%3===0?1.2:.8),r*(tree?.078:.12),r*(tree?.057:.075),
   tree?(k%3===0?"#2d9460":"#91d179"):(k%4===0?"#c49a53":k%3===0?"#4d5031":"#6e7936"),7,4);
 }
 const headX=r*(tree?.69:.67),headZ=r*(tree?.79:.89)-crouch*.8;
 orb(headX,0,headZ,r*(tree?.69:.89),r*(tree?.79:.98),r*(tree?.40:.54),skin,13,8);
 orb(r*1.09,0,headZ-r*.27,r*(tree?.41:.60),r*(tree?.66:.86),r*.17,belly,12,6);
 // The eyelid, sclera, iris, pupil and catchlight share a rigid head transform.
 for(const side of [-1,1]){
  const ey=side*r*(tree?.61:.79),ex=r*(tree?.67:.62);
  orb(ex,ey,headZ+r*.27,r*(tree?.30:.32),r*.28,r*.30,dark,11,6);
  orb(ex+r*.12,ey+side*r*.025,headZ+r*.33,r*.22,r*.21,r*.23,"#e6d39a",11,6);
  orb(ex+r*.26,ey,headZ+r*.34,r*.083,r*.102,r*.136,"#151e1b",9,6);
  orb(ex+r*.28,ey-side*r*.045,headZ+r*.42,r*.028,r*.025,r*.040,"#f7efd2",7,4);
  if(horned){
   spike(ex-r*.17,ey,headZ+r*.37,r*.20,r*.46,"#5c6636");
   orb(ex-r*.13,ey,headZ+r*.45,r*.21,r*.23,r*.11,"#66713b");
  }
  orb(r*1.20,side*r*.21,headZ-r*.07,r*.065,r*.045,r*.040,tree?"#2b6851":"#4c4f2c");
  for(let i=0;i<3;i++)orb(r*.95-i*r*.15,side*r*(tree?.71:.84),headZ-r*.19,r*.055,r*.075,r*.038,dark,7,4);
 }
 // Wide upper and lower jaws, a red tongue and retracting sticky tip.
 const tongue=Math.min(1,Math.max(0,Number(m.frogTonguePose)||0));
 const mouthOpen=clamp(Math.max(tongue,Number(m.swing)||0,Number(m.specialVisual)||0),0,1);
 orb(r*1.27,0,headZ-r*.31-r*.07*mouthOpen,r*(tree?.39:.54),r*(tree?.45:.65),r*(.095+.12*mouthOpen),"#4a3631",12,5);
 orb(r*1.20,0,headZ-r*.36-r*.12*mouthOpen,r*(tree?.38:.52),r*(tree?.44:.60),r*(.065+.06*mouthOpen),"#d49391",11,5);
 if(tongue>0){
  const reach=r*tongue*(tree?6.3:4.6),rootX=r*1.20,rootZ=headZ-r*.32;
  for(let k=0;k<7;k++){
   const u=(k+.5)/7;
   orb(rootX+reach*u,Math.sin(u*Math.PI)*r*.065,rootZ+Math.sin(u*Math.PI)*r*.095,
    Math.max(r*.09,reach/13),r*(.085+(1-u)*.048),r*(.07+(1-u)*.038),k%2?"#b96573":"#d7838d",7,4);
  }
  orb(rootX+reach,0,rootZ,r*.24,r*.21,r*.16,"#e49fa0",9,5);
 }
 if(male)for(const side of [-1,1])orb(-r*.21,side*r*.68,r*.70-crouch,r*.24,r*.12,r*.19,tree?"#48a75f":"#6b7740");
 if(squeeze>0)orb(0,0,r*.24,r*(.83+squeeze*.16),r*(.75+squeeze*.12),r*.15,"#c6ac77");
 return true;
}

/* Penguin control rig: anatomically distinct biped, responsive feet, flippers
   and a flattened body during the player belly-slide special attack. */
function drawPenguinPlayable3D(m,clock){
 if(m.type!=="penguin")return false;
 const r=m.r||23,dir=m.dir||0,c=Math.cos(dir),s=Math.sin(dir);
 const X=(x,y)=>m.x+x*c-y*s,Y=(x,y)=>m.y+x*s+y*c;
 const orb=(x,y,z,a,b,h,col)=>ellipsoid(X(x,y),Y(x,y),z,a,b,h,col,dir,11,6);
 const speed=Math.hypot(Number(m.vx)||0,Number(m.vy)||0);
 const beat=Math.sin((m.steps||m.step||0)*3.9)*Math.min(1,speed/130);
 const slide=Math.max(0,Number(m.bellySlide)||0),slidePose=clamp(slide/.19,0,1);
 const attack=Math.max(0,Number(m.specialVisual)||0,Number(m.swing)||0);
 // Rapid separate bill jabs; the entire face remains a rigid assembly.
 const rapid=clamp((Number(m.beakVisual)||0)/.18,0,1);
 const jab=rapid*(.22+.78*Math.sin(clock*83)*Math.sin(clock*83));
 const headDrive=r*.24*jab;
 const bodyZ=r*(.96-.56*slidePose),bodyHeight=r*(.81-.30*slidePose);
 for(const side of [-1,1]){
  const slideKick=Math.sin(clock*24+side*Math.PI)*slidePose*Math.min(1,speed/90);
  const motion=beat*side,forward=motion*r*(slidePose>.1?.07:.26)-slideKick*r*.22,lift=slidePose>.1?Math.max(0,slideKick)*r*.055:Math.max(0,motion)*r*.20;
  orb(-r*.47+forward,side*r*.43,r*.14+lift,r*.29,r*.23,r*.14,"#d69b51");
  orb(-r*.35+forward*.5,side*r*.43,r*.32+lift*.48,r*.17,r*.18,r*.27,"#243942");
 }
 orb(-r*.22,0,bodyZ,r*.90,r*.69,bodyHeight,"#243942");
 orb(r*.11,0,bodyZ+r*.10,r*.69,r*.58,bodyHeight*.86,"#eaece4");
 const headZ=r*(1.80-1.10*slidePose);
 orb(r*.66+headDrive,0,headZ,r*.49,r*.44,r*.48,"#263943");
 for(const side of [-1,1]){
  const flap=Math.sin((m.steps||m.step||0)*3.6+side*Math.PI)*r*.16+
    Math.sin(Math.PI*Math.min(1,m.flipperStrike||0))*r*.29+(slidePose>.1?side*r*.08:Math.sin(attack*12)*attack*r*.11);
  orb(-r*.22,side*r*.74,bodyZ+r*.02+flap,r*.62,r*.18,r*.23,"#1b303a");
  orb(r*.85+headDrive,side*r*.29,headZ+r*.09,r*.095,r*.085,r*.095,"#f3f9ee");
  orb(r*.88+headDrive,side*r*.31,headZ+r*.10,r*.045,r*.052,r*.049,"#111d23");
 }
 // Two-piece beak opens on each rapid strike; both parts follow the same head offset.
 const billReach=r*(1.04+headDrive/r+.16*jab);
 const billGap=r*.075*jab;
 pyramid(X(billReach,0),Y(billReach,0),headZ-r*.25+billGap,r*(.24+.13*jab),r*.14,r*.19,"#dda458");
 pyramid(X(billReach-r*.035,0),Y(billReach-r*.035,0),headZ-r*.35-billGap,r*(.20+.08*jab),r*.115,r*.105,"#bd793b");
 orb(r*.83+headDrive,0,headZ-r*.30,r*.22,r*.29,r*.14,"#d7a26c");
 orb(-r*.94,0,bodyZ-r*.09,r*.34,r*.29,r*.23,"#21333b");
 return true;
}

/* SQUAD_WORLD_SPECIES_MESHES_V1 */
/* Distinct procedural meshes for six global gacha species.
   Uses the same vertex transform, terrain lift and shadow as the player renderer. */
function drawWorldSquadSpecies3D(m,clock){
 const t=m.type;
 if(!["armadillo","hedgehog","gorilla","hyena","wildDog","tiger"].includes(t))return false;
 const young=m.age==="若い"||m.age==="若年"||m.ageStage==="young";
 const male=m.sex==="オス"||m.sex==="male";
 const adult=!young,breath=1+.025*Math.sin(clock*1.8),alert=!!(m.alert||m.target||m.attackTarget);
 const r=(m.r||20)*(young?.84:1),dir=m.dir||0,c=Math.cos(dir),s=Math.sin(dir);
 const fx=(x,y)=>m.x+x*c-y*s,fy=(x,y)=>m.y+x*s+y*c;
 const orb=(x,y,z,a,b,h,col)=>ellipsoid(fx(x,y),fy(x,y),z,a,b,h,col,dir,9,5);
 const spike=(x,y,z,a,b,h,col)=>pyramid(fx(x,y),fy(x,y),z,a,b,h,col);
 const motion=Math.sin((m.steps||m.step||0)*2.8+clock*.3)*Math.min(1,Math.hypot(m.vx||0,m.vy||0)/160);
 const quadruped=(fur,belly,leg)=>{
  for(const x of [-.68,.67])for(const y of [-.56,.56]){
   const pose=combatLimbPose(m,x>0?1:-1,y>0?1:-1,r);
   orb(x*r+pose.dx*.40,y*r,r*(.24+motion*(x*y>0?.07:-.07))+pose.dz*.34,r*.19,r*.18,r*.27,leg);
   orb((x+.12)*r+pose.dx,y*r,r*.12+pose.dz,r*.23,r*.20,r*.12,leg);
  }
  orb(-r*.16,0,r*.75,r*1.19,r*.64,r*.62,fur);
  orb(r*.23,0,r*.53,r*.78,r*.48,r*.27,belly);
 };
 if(t==="armadillo"){
  quadruped("#77776b","#c0b5a1","#746c5f");
  orb(-r*.18,0,r*.96,r*1.16*breath,r*.72,r*.48,"#6b7067");
  // Segmented osteoderm bands and separate shoulder/pelvic shields.
  for(let k=0;k<7;k++){
   const x=r*(-.83+k*.235);
   orb(x,0,r*1.28,r*.085,r*(.62-Math.abs(k-3)*.028),r*.12,k%2?"#a99c7e":"#827961");
  }
  orb(r*1.06,0,r*.62,r*.52,r*.31,r*.26,"#b9a78e");
  orb(r*1.43,0,r*.51,r*.33,r*.19,r*.14,"#9a8670");
  for(const y of [-1,1]){orb(r*1.14,y*r*.24,r*.76,r*.11,r*.10,r*.20,"#a9977d");orb(r*1.42,y*r*.20,r*.66,r*.06,r*.06,r*.06,"#1e2220");}
  for(let k=0;k<8;k++)orb(-r*(1.12+k*.21),Math.sin(clock*.8+k*.35)*r*.06,r*(.53-k*.04),r*(.18-k*.014),r*.10,r*.10,"#8c826e");
   // Adult males have a wider cranial shield; juveniles retain softer proportions.
   if(male&&adult)orb(r*.92,0,r*.91,r*.48,r*.38,r*.15,"#817965");
 }else if(t==="hedgehog"){
  for(const x of [-.60,.48])for(const y of [-.48,.48])orb(x*r,y*r,r*.13,r*.14,r*.14,r*.17,"#75665a");
  orb(-r*.18,0,r*.43,r*1.05*breath,r*.75,r*.50,"#746655");
  orb(r*.73,0,r*.42,r*.51,r*.41,r*.35,"#d1b79a");
  orb(r*1.19,0,r*.29,r*.29,r*.22,r*.16,"#d1b79a");
  for(let k=0;k<11;k++)for(let j=-3;j<=3;j++){
   const x=r*(-1.02+k*.16),y=j*r*.17;
   const height=r*(.65+.33*(1-Math.abs(j)/4));
   spike(x,y,r*(.62+.10*Math.cos(j*.55)),r*.085,r*.065,height,k%3===0?"#e1d3b0":"#3f3c33");
  }
  for(const y of [-1,1]){orb(r*.94,y*r*.29,r*.57,r*.08,r*.075,r*.08,"#161a19");orb(r*.62,y*r*.39,r*.75,r*.16,r*.13,r*.20,"#bca48a");}
  orb(r*1.42,0,r*.32,r*.11,r*.11,r*.10,"#3c3431");
   if(alert)for(const side of [-1,1])orb(r*.83,side*r*.38,r*.73,r*.13,r*.10,r*.15,"#a58a70");
 }else if(t==="gorilla"){
  const fur="#3f4242",skin="#74716a",swing=motion*r*.22;
   const slam=Math.min(1,Math.max(0,Number(m.gorillaSlamPose)||0,Number(m.attackAction)||0)),strike=Math.sin(Math.PI*(1-slam));
  for(const y of [-1,1]){
   orb(-r*.54,y*r*.44,r*.42,r*.37,r*.33,r*.47,fur);
   orb(-r*.72,y*r*.49,r*.14,r*.37,r*.32,r*.15,skin);
  }
  orb(-r*.20,0,r*1.15,r*.88*breath,r*.82,r*.94,fur);
  orb(r*.32,0,r*1.42,r*.87,r*.97,r*.79,male?"#383b3c":"#505354");
  orb(r*.85,0,r*1.72,r*.68,r*.63,r*.63,fur);
  orb(r*1.28,0,r*1.52,r*.43,r*.46,r*.41,skin);
  orb(r*1.53,0,r*1.29,r*.30,r*.38,r*.19,"#5c5a54");
  for(const y of [-1,1]){
   orb(r*.99,y*r*.59,r*1.69,r*.22,r*.18,r*.23,fur);
   orb(r*1.35,y*r*.29,r*1.70,r*.08,r*.075,r*.08,"#191b1b");
   orb(r*.10,y*r*.91,r*1.25,r*.40,r*.35,r*.50,fur);
   orb(r*.16+swing*(y>0?1:-1)+strike*r*.20,y*r*1.03,r*.54+slam*r*.15,r*.32,r*.29,r*.68,fur);
   orb(r*.28+swing*(y>0?1:-1)+strike*r*.40,y*r*1.08,r*.17+slam*r*.46,r*.33,r*.32,r*.20,skin);
    if(slam>.1)for(let k=-1;k<=1;k++)orb(r*.48+strike*r*.37,y*r*1.08+k*r*.13,r*.20+slam*r*.42,r*.11,r*.07,r*.09,"#8f8b81");
  }
  if(male&&adult){
    orb(-r*.20,0,r*1.82,r*.54,r*.64,r*.17,"#777b7a");
    // Mature silverback has a pale dorsal saddle and pronounced sagittal crest.
    orb(-r*.46,0,r*1.54,r*.58,r*.70,r*.18,"#8d9190");
    orb(r*.88,0,r*2.24,r*.35,r*.24,r*.16,"#373a3b");
   }
 }else if(t==="hyena"){
  quadruped("#a99a74","#c6b394","#514d42");
  // Hyena sloped back and massive front shoulders, spotted coat.
  orb(r*.29,0,r*1.04,r*.78*breath,r*.68,r*.66,"#ae9a70");
  orb(-r*.65,0,r*.69,r*.65,r*.49,r*.37,"#a49373");
  for(let k=0;k<18;k++){
   const x=r*(-.95+(k%6)*.33),y=r*((Math.floor(k/6)-1)*.43);
   orb(x,y,r*(1.08+(k%3)*.10),r*.075,r*.075,r*.045,"#544b3d");
  }
  for(let k=0;k<7;k++)spike(r*(-.74+k*.24),0,r*1.36,r*.10,r*.12,r*(adult?.30:.18),"#51473b");
  orb(r*1.04,0,r*1.10,r*.53,r*.46,r*.42,"#8f7c5c");
  orb(r*1.42,0,r*.88,r*.41,r*.29,r*.23,"#554a3d");
  for(const y of [-1,1]){spike(r*.99,y*r*.34,r*1.35,r*.14,r*.14,r*.35,"#55483a");orb(r*1.23,y*r*.33,r*1.14,r*.07,r*.07,r*.07,"#1c1d1a");}
  for(let k=0;k<5;k++)orb(-r*(1.14+k*.23),0,r*(.56-k*.05),r*.19,r*.17,r*.14,k%2?"#8d7759":"#493e34");
 }else if(t==="wildDog"){
  quadruped("#7a5e48","#e1c7a0","#4d443c");
  // Painted dog: irregular three-tone patches, oversized round ears and white tail tip.
  for(let k=0;k<11;k++){
   const x=r*(-.99+(k%4)*.55),y=r*((Math.floor(k/4)-1)*.41);
   orb(x,y,r*(.94+(k%3)*.12),r*.19,r*.16,r*.09,k%3===0?"#d5c3a0":k%3===1?"#282b2a":"#b17b51");
  }
  orb(r*.96,0,r*.94,r*.49,r*.44,r*.42,"#3e3630");
   if(adult)for(const y of [-1,1])orb(r*.80,y*r*.48,r*1.20,r*.15,r*.12,r*.17,"#2b2825");
  orb(r*1.39,0,r*.72,r*.41,r*.28,r*.23,"#b98c66");
  for(const y of [-1,1]){
   orb(r*.89,y*r*.51,r*1.32,r*.27,r*.27,r*.38,"#332d2b");
   orb(r*1.23,y*r*.35,r*.98,r*.075,r*.08,r*.07,"#f3c48d");
   orb(r*1.26,y*r*.36,r*.98,r*.04,r*.04,r*.04,"#161a1a");
  }
  for(let k=0;k<6;k++)orb(-r*(1.13+k*.22),Math.sin(clock+k*.3)*r*.09,r*(.68-k*.025),r*.21,r*.15,r*.15,k===5?"#f2e8d7":"#3d332e");
 }else if(t==="tiger"){
  quadruped("#d88740","#e8dfc6","#c27b3f");
  orb(r*.75,0,r*.95,r*.58*breath,r*.55,r*.54,"#d68b46");
   if(male&&adult)orb(r*.63,0,r*1.30,r*.55,r*.56,r*.16,"#b96731");
  orb(r*1.10,0,r*.81,r*.40,r*.43,r*.36,"#f4e6d1");
  orb(r*1.49,0,r*.65,r*.33,r*.29,r*.21,"#e4d6be");
  // Stripe bands across back and flanks, not leopard spots.
  for(let k=0;k<9;k++){
   const x=r*(-1.04+k*.26);
   orb(x,0,r*1.28,r*.075,r*(.51+Math.sin(k)*.07),r*.10,"#252b29");
   for(const y of [-1,1])orb(x,y*r*.55,r*.89,r*.075,r*.09,r*.28,"#2d2926");
  }
  for(const y of [-1,1]){
   orb(r*.91,y*r*.40,r*1.29,r*.19,r*.18,r*.19,"#242b29");
   orb(r*1.18,y*r*.32,r*.98,r*.095,r*.085,r*.08,"#f3d7a0");
   orb(r*1.23,y*r*.32,r*.98,r*.055,r*.055,r*.055,"#161a1a");
  }
  orb(r*1.74,0,r*.66,r*.11,r*.15,r*.10,"#3d3532");
  for(let k=0;k<9;k++)orb(-r*(1.10+k*.22),Math.sin(k*.5+clock*.8)*r*.12,r*(.69-k*.012),r*.18,r*.15,r*.15,k%2?"#e3c9a1":"#282b29");
 }
 return true;
}


// Native species silhouettes: raccoon dog and Japanese serow.
// Each uses its own gait, face and terrain-facing anatomy; no UI assets.
function drawJapaneseForestMammals3D(m,clock){
 const t=m.type;
 if(t!=="raccoonDog"&&t!=="serow")return false;
 const r=m.r||17,dir=m.dir||0,cs=Math.cos(dir),sn=Math.sin(dir);
 const young=m.age==="若い"||m.ageStage==="young",sz=young?.82:1;
 const male=m.sex==="オス"||m.sex==="male";
 const speed=Math.hypot(m.vx||0,m.vy||0),motion=clamp(speed/135,0,1);
 const cycle=(m.steps||m.step||0)*(t==="serow"?2.1:3.0);
 const px=(a,b)=>m.x+a*cs-b*sn,py=(a,b)=>m.y+a*sn+b*cs;
 const orb=(a,b,z,rx,ry,rz,col)=>ellipsoid(px(a,b),py(a,b),z,rx*sz,ry*sz,rz*sz,col,dir,10,6);
 const spike=(a,b,z,w,h,col)=>pyramid(px(a,b),py(a,b),z,w*sz,w*sz,h*sz,col);
 const breathe=1+.018*Math.sin(clock*2.1);
 if(t==="raccoonDog"){
  // Short, stocky limbs and round fur-covered trunk. Diagonal steps alternate.
  for(const front of [-1,1])for(const side of [-1,1]){
   const beat=Math.sin(cycle+(front===side?0:Math.PI))*motion,pose=combatLimbPose(m,front,side,r);
   orb(front*r*.53+beat*r*.21+pose.dx*.38,side*r*.46,r*.23+Math.max(0,beat)*r*.13+pose.dz*.34,r*.19,r*.18,r*.28,"#423b33");
   orb(front*r*.56+beat*r*.32+pose.dx,side*r*.47,r*.09+Math.max(0,beat)*r*.18+pose.dz,r*.21,r*.17,r*.11,"#292927");
  }
  orb(-r*.15,0,r*.62,r*1.04*breathe,r*.69,r*.64,"#756b58");
  orb(r*.53,0,r*.75,r*.52,r*.59,r*.51,"#5a5549");
  orb(r*1.02,0,r*.70,r*.56,r*.48,r*.44,"#aa9a7e");
  orb(r*1.34,0,r*.53,r*.32,r*.30,r*.23,"#b6a68b");
  for(const side of [-1,1]){
   orb(r*1.04,side*r*.36,r*.82,r*.26,r*.19,r*.25,"#292c2b");
   orb(r*1.24,side*r*.40,r*.85,r*.085,r*.065,r*.065,"#d6c5a2");
   orb(r*1.27,side*r*.41,r*.85,r*.045,r*.045,r*.045,"#171b1a");
   orb(r*.73,side*r*.39,r*1.15,r*.20,r*.18,r*.25,"#4c453b");
  }
  orb(r*1.62,0,r*.49,r*.12,r*.14,r*.11,"#282928");
  for(let k=0;k<7;k++)orb(-r*(1.06+k*.17),Math.sin(clock*1.7+k*.3)*r*.10,r*(.61-k*.027),r*.23,r*.21,r*.20,k%2?"#4b473d":"#887b66");
  if(male&&!young)orb(r*.48,0,r*1.02,r*.43,r*.50,r*.17,"#6c6554");
 }else{
  // Japanese serow: deep chest, short muscular limbs, narrow muzzle,
  // and two backwards swept permanent horns (both sexes).
  for(const front of [-1,1])for(const side of [-1,1]){
   const beat=Math.sin(cycle+(front===side?0:Math.PI))*motion;
   const pose=combatLimbPose(m,front,side,r),swing=beat*r*.34+pose.dx,up=Math.max(0,beat)*r*.29+pose.dz;
   orb(front*r*.55+swing*.20,side*r*.35,r*.69+up*.12,r*.19,r*.17,r*.37,"#6e6556");
   orb(front*r*.55+swing*.60,side*r*.35,r*.35+up*.53,r*.13,r*.13,r*.30,"#857768");
   orb(front*r*.55+swing,side*r*.35,r*.09+up,r*.17,r*.16,r*.11,"#302f2c");
  }
  orb(-r*.10,0,r*1.14,r*.93*breathe,r*.53,r*.60,"#827c6d");
  orb(r*.54,0,r*1.24,r*.51,r*.56,r*.65,"#777164");
  orb(r*.96,0,r*1.51,r*.37,r*.34,r*.43,"#999183");
  orb(r*1.25,0,r*1.30,r*.41,r*.28,r*.24,"#b8b2a2");
  orb(r*1.53,0,r*1.22,r*.21,r*.20,r*.13,"#343331");
  for(const side of [-1,1]){
   orb(r*.96,side*r*.26,r*1.80,r*.23,r*.14,r*.16,"#797163");
   orb(r*1.19,side*r*.27,r*1.49,r*.065,r*.06,r*.06,"#242827");
   spike(r*.91,side*r*.19,r*1.86,r*.10,r*(young?.32:male?.68:.55),"#383c38");
   orb(r*.91-r*.10,side*r*.19,r*2.12,r*.095,r*.095,r*.13,"#3e413c");
  }
  for(let k=0;k<5;k++)orb(r*(.78+k*.11),0,r*(1.03-k*.13),r*.20,r*.24,r*.17,"#c3bcae");
  orb(-r*1.13,0,r*1.08,r*.20,r*.18,r*.18,"#514c43");
 }
 return true;
}


/* Native forest playable anatomy: stable world coordinates shared by all body parts.
 * No terrain, UI, save or species hitbox changes. */
function drawForestPlayable3D(m,clock){
 const type=m.type;
 if(type==="tanuki")return drawJapaneseForestMammals3D({...m,type:"raccoonDog"},clock);
 if(type!=="badger"&&type!=="blackBear")return false;
 const r=m.r||20,dir=Number(m.dir)||0,c=Math.cos(dir),s=Math.sin(dir);
 const fx=(a,b)=>m.x+a*c-b*s,fy=(a,b)=>m.y+a*s+b*c;
 const orb=(a,b,z,rx,ry,rz,col)=>ellipsoid(fx(a,b),fy(a,b),z,rx,ry,rz,col,dir,10,6);
 const sp=(a,b,z,rx,ry,h,col)=>pyramid(fx(a,b),fy(a,b),z,rx,ry,h,col);
 const running=Math.min(1,Math.hypot(Number(m.vx)||0,Number(m.vy)||0)/(type==="badger"?165:135));
 const stride=(m.steps||m.step||0)*2.5;
 const fur=type==="badger"?"#77736a":"#343332",belly=type==="badger"?"#a49a88":"#554b49";
 const attack=Math.min(1,Math.max(0,Number(m.attackAction)||0,Number(m.swing)||0));
 if(type==="badger"){
  // Badger: low, wedge-shaped body, digging forearms, striped face and heavy paws.
  for(const front of [-1,1])for(const side of [-1,1]){
   const k=Math.sin(stride+(front===side?0:Math.PI))*running;
   const reach=front>0?attack*r*.19:0;
   orb(front*r*.59+k*r*.10+reach,side*r*.48,r*.24+Math.max(0,k)*r*.13,r*.26,r*.22,r*.25,"#514d46");
   orb(front*r*.78+k*r*.11+reach,side*r*.53,r*.12,r*.29,r*.21,r*.12,"#383532");
   if(front>0)for(let n=-1;n<=1;n++)sp(r*(1.01+k*.11)+reach,side*r*.53+n*r*.09,r*.10,r*.07,r*.045,r*.24,"#e1d5bd");
  }
  orb(-r*.18,0,r*.52,r*1.20,r*.67,r*.54,fur);
  orb(r*.64,0,r*.53,r*.66,r*.52,r*.44,"#9f998f");
  orb(r*1.08,0,r*.48,r*.67,r*.46,r*.32,"#d5d0c2");
  for(const side of [-1,1]){
   orb(r*1.08,side*r*.26,r*.57,r*.57,r*.13,r*.22,"#383838");
   orb(r*1.30,side*r*.25,r*.64,r*.085,r*.06,r*.075,"#111517");
   orb(r*.85,side*r*.43,r*.78,r*.17,r*.15,r*.18,fur);
  }
  orb(r*1.65,0,r*.36,r*.18,r*.21,r*.12,"#302b2a");
  for(let i=0;i<5;i++)orb(-r*(1.25+i*.24),Math.sin(clock*.8+i*.3)*r*.08,r*(.46-i*.05),r*.27,r*(.19-i*.01),r*.20,fur);
 }else{
  // Japanese black bear: high shoulder mass, rounded ears, visible chest crescent.
  for(const front of [-1,1])for(const side of [-1,1]){
   const k=Math.sin(stride+(front===side?0:Math.PI))*running;
   orb(front*r*.59+k*r*.12,side*r*.60,r*.43+Math.max(0,k)*r*.12,r*.34,r*.31,r*.48,fur);
   orb(front*r*.74+k*r*.13,side*r*.61,r*.10,r*.33,r*.31,r*.14,"#302e2c");
   if(front>0)for(let n=-1;n<=1;n++)sp(r*(1.02+k*.13),side*r*.60+n*r*.13,r*.10,r*.055,r*.042,r*.21,"#ddd6c2");
  }
  orb(-r*.20,0,r*.95,r*1.26,r*.91,r*.85,fur);
  orb(r*.48,0,r*1.22,r*.91,r*.85,r*.90,"#302e2d");
  orb(r*.91,0,r*1.21,r*.69,r*.62,r*.62,fur);
  for(const side of [-1,1]){
   orb(r*.78,side*r*.49,r*1.64,r*.25,r*.21,r*.25,"#272625");
   orb(r*1.17,side*r*.35,r*1.37,r*.09,r*.07,r*.08,"#e1c5aa");
   orb(r*1.22,side*r*.35,r*1.38,r*.043,r*.04,r*.05,"#151819");
   orb(r*.74,side*r*.20,r*.99,r*.27,r*.11,r*.30,"#d4cbbd");
  }
  orb(r*1.42,0,r*.92,r*.37,r*.31,r*.24,"#837971");
  orb(r*1.65,0,r*.91,r*.15,r*.16,r*.12,"#292422");
  orb(-r*1.32,0,r*.66,r*.28,r*.25,r*.28,fur);
 }
 return true;
}


/* Native swimmer silhouettes: long otter tail and whiskered muzzle; carp fins
 * and tail strokes belong to the same heading/position as their collision body. */
function drawAquaticPlayable3D(m,clock){
 if(m.type!=="otter"&&m.type!=="carp")return false;
 const fish=m.type==="carp",r=m.r||16,angle=Number(m.dir)||0,c=Math.cos(angle),s=Math.sin(angle);
 const px=(x,y)=>m.x+x*c-y*s,py=(x,y)=>m.y+x*s+y*c;
 const orb=(x,y,z,a,b,h,color)=>ellipsoid(px(x,y),py(x,y),z,a,b,h,color,angle,11,7);
 const spike=(x,y,z,a,h,color)=>pyramid(px(x,y),py(x,y),z,a,a,h,color);
 const effort=Math.min(1,Math.hypot(Number(m.vx)||0,Number(m.vy)||0)/160),swim=Math.max(0,Math.min(1,Number(m.swimVisual)||0));
 const beat=Math.sin((m.steps||m.step||0)*2.5+clock*1.2)*effort;
 if(fish){
  // Fish: broad scales, sloping gills, fins and a forked caudal fin.
  const gold="#96805d",shade="#746446",shine="#c2ad83";
  orb(0,0,r*.48,r*1.27,r*.63,r*.54,gold);
  orb(r*.78,0,r*.50,r*.67,r*.51,r*.46,shine);
  orb(r*1.25,0,r*.42,r*.28,r*.33,r*.20,"#8c7358");
  for(const side of [-1,1]){
   orb(r*.92,side*r*.35,r*.59,r*.10,r*.07,r*.075,"#252626");
   orb(r*.40,side*r*.60,r*.27+beat*r*.08,r*.53,r*.11,r*.085,shade);
   spike(-r*.14,side*r*.45,r*.20,r*.18,-r*.27,shade);
  }
  for(let i=0;i<5;i++)orb(-r*.66+i*r*.37,0,r*.88+Math.sin(i*.6)*r*.06,r*.15,r*.14,r*.10,shine);
  spike(-r*.36,0,r*.97,r*.37,r*.63,shade);
  const tailY=beat*r*.29;
  orb(-r*1.33,tailY,r*.46,r*.55,r*.16,r*.19,gold);
  for(const side of [-1,1])spike(-r*1.95,tailY+side*r*.32,r*.45,r*.28,r*.49,shade);
  for(let i=-2;i<=2;i++)orb(-r*.53+i*r*.35,-r*.48,r*.68,r*.11,r*.045,r*.055,i%2?shade:shine);
 }else{
  // Otter: sleek, low swimmer with paddle feet and long muscular tail.
  const fur="#6d5545",belly="#c8ac8e",wetBody=swim?r*.07:0;
  orb(-r*.17,0,r*.46-wetBody,r*1.28,r*.49,r*.43,fur);
  orb(r*.42,0,r*.33-wetBody,r*.78,r*.39,r*.28,belly);
  for(const front of [-1,1])for(const side of [-1,1]){
   const wave=Math.sin((m.steps||m.step||0)*3.1+(front===side?0:Math.PI))*effort;
   orb(front*r*.64+wave*r*.18,side*r*.43,r*(.15+.08*Math.max(0,wave)),r*.25,r*.19,r*.18,fur);
   orb(front*r*.85+wave*r*.14,side*r*.50,r*.08,r*.24,r*.20,r*.09,"#4c3d34");
  }
  orb(r*.92,0,r*.49-wetBody,r*.58,r*.47,r*.39,fur);
  orb(r*1.29,0,r*.32-wetBody,r*.47,r*.31,r*.25,belly);
  for(const side of [-1,1]){
   orb(r*.87,side*r*.38,r*.79-wetBody,r*.17,r*.17,r*.19,fur);
   orb(r*1.22,side*r*.30,r*.55-wetBody,r*.085,r*.07,r*.08,"#182023");
   for(let n=-1;n<=1;n++)orb(r*1.52,side*r*(.19+n*.10),r*.30,r*.22,r*.015,r*.013,"#e6ddd0");
  }
  orb(r*1.65,0,r*.28-wetBody,r*.13,r*.15,r*.09,"#332826");
  for(let j=0;j<7;j++)orb(-r*(1.23+j*.29),Math.sin(j*.44+clock*1.4)*r*.17*swim,r*(.36-j*.035),r*(.30-j*.023),r*(.20-j*.015),r*(.19-j*.014),fur);
 }
 return true;
}


/* Anatomical bird models retain head and beak alignment while actual flight
 * altitude controls wing articulation. */
function drawPlayableBird3D(m,clock){
 if(m.type!=="crow"&&m.type!=="pigeon")return false;
 const crow=m.type==="crow",r=m.r||13,dir=Number(m.dir)||0,c=Math.cos(dir),s=Math.sin(dir);
 const x=(a,b)=>m.x+a*c-b*s,y=(a,b)=>m.y+a*s+b*c;
 const orb=(a,b,z,rx,ry,rz,color)=>ellipsoid(x(a,b),y(a,b),z,rx,ry,rz,color,dir,10,5);
 const main=crow?"#303943":"#879e9f",wing=crow?"#24303b":"#617987",belly=crow?"#586571":"#d5dad6";
 const flap=Math.sin(clock*(m.flying?17:3)+(m.steps||m.step||0)*.5);
 orb(-r*.17,0,r*.45,r*(crow?1.04:.89),r*.53,r*.44,main);
 orb(r*.30,0,r*.33,r*.65,r*.42,r*.33,belly);
 orb(r*.67,0,r*.64,r*.47,r*.43,r*.40,main);
 orb(r*1.1,0,r*.55,r*(crow?.40:.29),r*.20,r*.15,crow?"#697174":"#d8b88f");
 orb(r*1.40,0,r*.51,r*.11,r*.075,r*.06,crow?"#272b2f":"#af835b");
 for(const side of [-1,1]){
  const height=r*(.57+(m.flying?.55+.47*flap:.04));
  for(let k=0;k<6;k++)orb(-r*(.21+k*.13),side*r*(.57+k*.18),
   height-r*k*.04,r*(.63-k*.045),r*.19,r*.12,k%2?wing:main);
  orb(r*.79,side*r*.29,r*.76,r*.095,r*.07,r*.08,"#1c2326");
  orb(r*.82,side*r*.31,r*.78,r*.035,r*.027,r*.035,"#e9e7d8");
  if(!m.flying){orb(-r*.20,side*r*.30,r*.15,r*.10,r*.10,r*.24,"#7c7774");orb(-r*.15,side*r*.37,r*.055,r*.19,r*.10,r*.07,"#a38b7b");}
 }
 for(let n=-2;n<=2;n++)orb(-r*1.06,n*r*.13,r*.42,r*(crow?.66:.50),r*.12,r*.08,wing);
 return true;
}

// ORIGINAL 100-year apex model: a single charcoal giant with exactly one eye.
// Twelve low-poly lobes and eight slow tentacles, no textures or GPU allocations
// beyond the existing dynamic buffer. Rendered at elephant radius x5.
function worldEndMesh(m,clock){
 animalLift=0;
 const x=m.x,y=m.y,r=Math.max(80,Math.min(345,Number(m.r)||345));
 const dir=m.dir||0,cz=window.WildMountain?.height(x,y)||0;
 const bodyZ=cz+r*.68,attack=Number(m.worldEndCharge)||0;
 const strikeProgress=attack>0?clamp(1-attack/2.2,0,1):0;
 const strikePulse=attack>0?Math.sin(Math.PI*strikeProgress):0;
 const attackPhase=Math.max(0,Math.floor(Number(m.worldEndAttackPhase)||0))%3;
 const warningTargets=Array.isArray(m.worldEndThreats)?m.worldEndThreats.filter(t=>
  Number.isFinite(t?.x)&&Number.isFinite(t?.y)&&Number.isFinite(t?.radius)&&t.radius>0):[];
 ellipsoid(x,y,cz+2,r*1.16,r*.95,2.2,"#04060b",dir,12,3);
 ellipsoid(x,y,bodyZ,r*.95,r*.79,r*.64,"#09090e",dir,14,8);
 ellipsoid(x-r*.13,y+r*.02,bodyZ+r*.18,r*.70,r*.66,r*.49,"#11101a",dir,12,7);
 // A single enormous pale eye on the facing side. No mouth or second eye.
 const fx=Math.cos(dir),fy=Math.sin(dir);
 const eyeX=x+fx*r*.70,eyeY=y+fy*r*.70,eyeZ=bodyZ+r*.42;
 ellipsoid(eyeX,eyeY,eyeZ,r*.21,r*.17,r*.20,"#f2eadf",dir,10,6);
 ellipsoid(eyeX+fx*r*.065,eyeY+fy*r*.065,eyeZ-r*.005,r*.105,r*.09,r*.105,"#39303d",dir,9,6);
 ellipsoid(eyeX+fx*r*.106,eyeY+fy*r*.106,eyeZ+r*.015,r*.053,r*.049,r*.056,"#080710",dir,8,5);
 // Eight tentacles now aim and wind up toward the actual warned impact zones.
 for(let i=0;i<8;i++){
  const a=dir+i*Math.PI/4,ca=Math.cos(a),sa=Math.sin(a);
  const wave=Math.sin(clock*.45+i*1.31),reach=r*(1.18+.17*wave);
  const target=attack>0&&warningTargets.length?warningTargets[i%warningTargets.length]:null;
  const aim=target?Math.atan2(target.y-y,target.x-x):a;
  const direction=a+Math.atan2(Math.sin(aim-a),Math.cos(aim-a))*(target?strikeProgress*.88:0);
  const dx=Math.cos(direction),dy=Math.sin(direction);
  const reachBoost=target?strikePulse*r*(attackPhase===2?.48:.33):0;
  for(let j=0;j<3;j++){
   const f=(j+.55)/3,z=cz+r*(.53+.16*Math.sin(i*.93+j*.86+clock*.31));
   const px=x+dx*(r*.63+(reach+reachBoost)*f)-dy*r*.075*wave*f;
   const py=y+dy*(r*.63+(reach+reachBoost)*f)+dx*r*.075*wave*f;
   const size=r*(.135-j*.031);
   ellipsoid(px,py,z,size*1.44,size*.92,size,
    j%2?"#15141f":"#0b0b15",a,7,4);
  }
  const tipX=x+dx*(r*.63+reach+reachBoost),tipY=y+dy*(r*.63+reach+reachBoost);
  ellipsoid(tipX,tipY,cz+r*(.44+.16*strikePulse),r*.055,r*.056,r*.066,
   target?"#a35358":"#342431",direction,6,4);
 }
 if(attack>0){
  // Eye and crown signal the last quarter of the existing 2.2s windup.
  ellipsoid(eyeX+fx*r*.13,eyeY+fy*r*.13,eyeZ+r*.015,
   r*(.07+.035*strikePulse),r*(.06+.03*strikePulse),r*.07,
   strikeProgress>.73?"#ffb78d":"#c86d63",dir,8,5);
  for(let i=0;i<3;i++){
   const a=clock*.6+i*Math.PI*2/3;
   ellipsoid(x+Math.cos(a)*r*.34,y+Math.sin(a)*r*.34,
    cz+r*(1.16+.13*strikePulse),r*.095,r*.085,r*.11,
    attackPhase===2?"#c85c74":"#b16b69",dir,7,4);
  }
 }
}
function animal(m,player,clock){
 if(m.type==="worldEnd"){worldEndMesh(m,clock);return;}
 const type=m.type==="strayCat"?"cat":m.type==="wildFox"?"fox":m.type,c=m.base||m.species||null,base=m.color||(c&&c.color)||"#86928d",belly=m.belly||(c&&c.belly)||"#c5ccbd";
 const r=m.r||16,collapse=player?clamp(m.deathPose||0,0,1):0,dir=(m.dir||0)+collapse*.24,cos=Math.cos(dir),sin=Math.sin(dir),speed=Math.hypot(m.vx||0,m.vy||0);
 const resting=!player&&!!m.resting;
 const moving=resting||collapse>0?0:clamp(speed/95,0,1);
 const phase=(m.steps||m.step||0)*(type==="cat"?3.4:type==="fox"?2.9:type==="wolf"?2.1:2.6);
 const gait=Math.sin(phase)*moving;
 const idleBreath=(.5+.5*Math.sin(clock*2.8+visualIdSeed(m.id)*.7))*r*.048*(1-collapse);
 const headAttention=resting||collapse>0?0:Math.sin(clock*.83+visualIdSeed(m.id))*r*(moving>.4?.016:.07);
 const landingCompression=player&&m.fallTime>0?-r*.12:0;
 const kickPose=player&&type==="cat"?clamp((m.wallKickTime||0)/.43,0,1):0;
 const turboPose=player&&type==="fox"&&m.abilityTime>0?clamp(speed/660,0,1):0;
 const chargePose=player&&type==="wolf"&&m.chargeStrike&&m.pounceTime>0?1:0;
 const specialPose=player&&m.specialVisual>0?Math.sin(Math.PI*clamp(m.specialVisual/1.02,0,1)):0;
 const swingPose=player&&m.attackAction>0?Math.sin(Math.PI*clamp(m.attackAction/.45,0,1)):0;
 const bodyBob=Math.abs(Math.sin(phase))*r*.13*moving+kickPose*r*.32+turboPose*r*.10+idleBreath+landingCompression+specialPose*r*.12+swingPose*r*.06;
 const bodyDrive=Math.sin(phase)*r*.10*moving+turboPose*r*.28+chargePose*r*.34+specialPose*r*.27+swingPose*r*.16;
 const attackPrep=player&&m.pendingStrike?clamp(1-m.windup/Math.max(.001,Math.min(.15,m.rate*.38)),0,1):(!player&&m.windup>0?clamp(1-m.windup/Math.max(.01,m.windupTotal||.53),0,1):0);
 const swingDuration=player?.18:.22,swingLeft=clamp(m.swing||0,0,swingDuration);
 const attackSnap=swingLeft>0?clamp((swingDuration-swingLeft)/.033,0,1)*clamp(swingLeft/.12,0,1):0;
 const airStrike=player&&m.jumpDive&&m.jumpTime>0?
  (["cat","manul","lion","tiger"].includes(type)?.68:
   ["fox","tibetanFox","wolf","dog","wildDog","cheetah","hyena"].includes(type)?.52:.32):0;
 const attackCharge=!player&&(type==="boar"||type==="alpha"||type==="oneEyedWolf"||type==="whiteTiger"||type==="giantMoose"||type==="giantBuffalo")?clamp((m.chargeTime||0)/(type==="alpha"?.24:type==="oneEyedWolf"?.28:type==="whiteTiger"?.39:type==="giantMoose"?.46:type==="giantBuffalo"?.53:.36),0,1)*.55:0;
 const attackReach=Math.min(1.05,Math.max(attackSnap*1.45,attackCharge)+airStrike+swingPose*.68+specialPose*.90);
 const rushPose=player&&(m.pendingStrike||m.swing>0)?(m.rushActiveStep||0):0;
 const foreDrive=(side,base)=>rushPose===1||rushPose===2?attackReach*(side===(rushPose===1?-1:1)?1:.08):rushPose===3?attackReach*.14:rushPose===4?attackReach*.05:rushPose===5?attackReach*.60:base;
 const fx=(dx,dy)=>m.x+dx*cos-dy*sin,fy=(dx,dy)=>m.y+dx*sin+dy*cos;
 const fox=type==="fox"||type==="wildFox",cat=type==="cat"||type==="strayCat",wolf=type==="wolf"||type==="alpha",rabbit=type==="rabbit",rat=type==="rat",pigeon=type==="pigeon";
 const large=wolf||type==="boar",torso=fox?"#c97741":cat?"#9caaa1":wolf?"#647b84":base;
 const h=(large?r*.74:fox?r*.72:cat?r*.64:rabbit?r*.50:r*.56)*(resting?.64:1)*(1-collapse*.52);
 const x=m.x,y=m.y;
 animalLift=0;
 // Shadow is projected to the walkable roof when standing on one.
 const terrainZ=window.WildMountain?.height(m.x,m.y)||0;
 const contactZ=(player?Math.max(0,m.groundZ||0):0)+terrainZ;
 ellipsoid(x+r*.16,y+r*.22,contactZ+1.1,r*1.46,r*.72,1.4,"#1c302b",dir,9,3);
 animalLift=terrainZ+(player?Math.max(0,m.jumpHeight||0):Math.max(0,m.type==="giantEagle"?m.airHeight||125:m.evadeHeight||0)); // NPC feet and body rise during a real emergency leap.
 if(player&&(type==="giantTreeFrog"||type==="pacmanFrog"))animalLift+=Math.max(0,Number(m.frogHopLift)||0);
 // The entire individual now visibly surges or braces during attacks, even
 // when its species uses a dedicated geometry branch below.
 if(player)animalLift+=specialPose*r*(m.specialKind==="roar"?.18:m.specialKind==="slam"?.21:["penguin","crocodile","rhino"].includes(type)?.04:.58)+swingPose*r*.19;
 const easedCollapse=collapse*collapse*(3-2*collapse),tilt=easedCollapse*1.23;
 animalCollapseTransform=player&&collapse>0?{x:m.x,y:m.y,cos,sin,pivot:contactZ+r*.18,ground:contactZ,ct:Math.cos(tilt),st:Math.sin(tilt)}:null;
 if(drawPlayableBird3D(m,clock)){animalLift=0;animalCollapseTransform=null;return;}
 if(drawAquaticPlayable3D(m,clock)){animalLift=0;animalCollapseTransform=null;return;}
 if(drawForestPlayable3D(m,clock)){animalLift=0;animalCollapseTransform=null;return;}
 if(drawDistinctWildlife3D(m,clock)){animalLift=0;animalCollapseTransform=null;return;}
 if(drawJapaneseForestMammals3D(m,clock)){animalLift=0;animalCollapseTransform=null;return;}
 if(drawPlayableFrog3D(m,clock)){animalLift=0;animalCollapseTransform=null;return;}
 if(drawRarePlayable3D(m,clock)){animalLift=0;animalCollapseTransform=null;return;}
 if(drawPenguinPlayable3D(m,clock)){animalLift=0;animalCollapseTransform=null;return;}
 if((type==="crocodile"||type==="rhino")&&drawStrongAnimal3D({...m,type:type==="crocodile"?"giantCrocodile":"rhino",color:base,belly,step:m.steps||m.step||0},clock)){animalLift=0;animalCollapseTransform=null;return;}
  if(drawWorldSquadSpecies3D(m,clock)){animalLift=0;animalCollapseTransform=null;return;}
  // Owned boss actors must use the same species-specific 3D mesh as wild bosses.
  // Previously the player flag skipped this path and drew a generic quadruped.
  if(drawStrongAnimal3D(m,clock)){animalLift=0;animalCollapseTransform=null;return;}
 // Deer uses the dedicated species model for both wildlife and the controlled player.
 if((!player||["deer","macaque","lion","elephant","cheetah","giraffe","zebra","hippo"].includes(type))&&drawCommonAnimal3D(player?{...m,color:base,belly,step:m.steps||0}:m,clock)){animalLift=0;animalCollapseTransform=null;return;}

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
 const headDrive=clamp(r*(attackReach*((rushPose===1||rushPose===2)?.12:rushPose===4?.08:cat?.30:fox?.28:large?.25:.20)-attackPrep*.15),-r*.11,r*.23);
 const neck=(large?r*.70:fox?r*.76:r*.64)+headDrive+bodyDrive*.75+turboPose*r*.15,headR=cat?r*.47:fox?r*.43:rabbit?r*.43:large?r*.53:r*.49;
 ellipsoid(fx(neck,0),fy(neck,0),h+r*.49+headAttention*.15,headR,headR*.80,headR*.83,torso,dir,10,6);
 if(fox||cat||wolf||rabbit||rat||type==="dog"){
  for(const side of [-1,1]){
   const earLength=rabbit?r*1.08:rat?r*.22:wolf?r*.59:fox?r*.52:type==="dog"?r*.25:r*.38;
   const earWidth=rabbit?r*.14:rat?r*.22:r*.20;
   if(type==="dog")ellipsoid(fx(neck-r*.22,side*r*.54),fy(neck-r*.22,side*r*.54),h+r*.66,r*.20,r*.14,r*.26,base,dir,7,4);
   else pyramid(fx(neck-r*.18,side*r*.40),fy(neck-r*.18,side*r*.40),h+r*.79,earWidth,r*.13,earLength,torso);
   if(rabbit)pyramid(fx(neck-r*.16,side*r*.40),fy(neck-r*.16,side*r*.40),h+r*.82,r*.075,r*.06,earLength*.82,"#dfaa9c");
  }
 }
 if(type==="boar"){
  ellipsoid(fx(neck+r*.48,0),fy(neck+r*.48,0),h+r*.32-attackReach*r*.08,r*.35,r*.42,r*.31,"#ba9a83",dir,8,5);
  for(const side of [-1,1])pyramid(fx(neck+r*.52,side*r*.34),fy(neck+r*.52,side*r*.34),h+r*.40-attackReach*r*.08,r*.12,r*.13,r*.36,"#e9d7ad");
 }else if(pigeon){
  for(const side of [-1,1])ellipsoid(fx(-r*.15,side*r*.55),fy(-r*.15,side*r*.55),h+r*.55,r*.60,r*.16,r*.25,"#aec3b8",dir,7,4);
 }else{
  ellipsoid(fx(neck+r*.39,0),fy(neck+r*.39,0),h+r*.42-attackReach*r*.04,fox?r*.60:rat?r*.24:r*.31,fox?r*.15:r*.23,fox?r*.16:r*.19,belly,dir,8,4);
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
  ellipsoid(fx(neck+r*.37,0),fy(neck+r*.37,0),h+r*(.22-attackReach*.06),r*.37,r*.25,r*.12,"#28302b",dir,8,4);
  ellipsoid(fx(neck+r*.43,0),fy(neck+r*.43,0),h+r*(.14-attackReach*.06),r*.32,r*.24,r*.10,belly,dir,8,4);
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
 animalLift=window.WildMountain?.height(c.x,c.y)||0;
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
 const x=p.x+cs*p.r*1.45,y=p.y+sn*p.r*1.45,z=(window.WildMountain?.height(p.x,p.y)||0)+Math.max(0,p.jumpHeight||p.groundZ||0)+p.r*.72;
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
 // Stored meat is visible on every shelter's bedding, independent of species.
 // Part geometry changes with each real stored portion; no extra actors/physics.
 const portions=Array.isArray(d.meatLots)?d.meatLots.slice(0,6):[];
 for(const [j,part] of portions.entries()){
  const points=Math.max(0,Math.min(150,Number(part?.points)||0));if(points<=0)continue;
  const angle=j*2.39996,rx=6+Math.sqrt(points)*1.15;
  const xx=x-9+Math.cos(angle)*27,yy=y+7+Math.sin(angle)*18;
  ellipsoid(xx,yy,z+6,rx,rx*.65,Math.max(3,rx*.36),"#682d30",angle,9,4);
  ellipsoid(xx-2,yy-2,z+8,rx*.74,rx*.43,Math.max(2,rx*.18),"#c76863",angle,8,4);
 }
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
/* Only near-camera foothill tiles enter the cached GPU static mesh.
 * All coordinates share the city world; there is no scene transition. */
function mountainTerrain(isVisible){
 const m=window.WildMountain;if(!m)return;
 const tile=110;
 // North-east forest uses the same physical coordinates as WildMountain.blocked.
 for(let x=m.CITY_EDGE;x<10800;x+=tile)for(let y=850;y<2580;y+=tile){
  const x2=Math.min(10800,x+tile),y2=Math.min(2580,y+tile);
  if(!isVisible((x+x2)/2,(y+y2)/2,280))continue;
  const centerY=m.northTrail((x+x2)/2),path=Math.abs((y+y2)/2-centerY)<82;
  const c=color(path?"#8d8467":((Math.floor(x/tile)+Math.floor(y/tile))%3?"#456b4a":"#50764f"));
  quad([x,y,m.height(x,y)+.2],[x2,y,m.height(x2,y)+.2],
   [x2,y2,m.height(x2,y2)+.2],[x,y2,m.height(x,y2)+.2],c);
 }
 // Fill the former 270-unit north-forest / mountain mesh gap with
 // shared-height quads. Top and bottom sample the exact adjacent boundaries.
 for(let x=m.CITY_EDGE;x<10800;x+=tile){
  const x2=Math.min(10800,x+tile);
  if(x2<9850)continue;
  for(let y=2580;y<2850;y+=54){
   const y2=Math.min(2850,y+54),cx=(x+x2)/2,cy=(y+y2)/2;
   if(!isVisible(cx,cy,265))continue;
   quad([x,y,m.height(x,y)+.23],[x2,y,m.height(x2,y)+.23],
        [x2,y2,m.height(x2,y2)+.23],[x,y2,m.height(x,y2)+.23],color("#59705b"));
  }
 }
 for(let x=m.WEST;x<m.EAST;x+=tile){
  const x2=Math.min(m.EAST,x+tile);
  for(let y=2850;y<5150;y+=tile){
   const y2=y+tile,cx=(x+x2)/2,cy=(y+y2)/2;
   if(!isVisible(cx,cy,350))continue;
   const h00=m.height(x,y),h10=m.height(x2,y),h11=m.height(x2,y2),h01=m.height(x,y2);
   const edge=cy<m.center(cx)-690||cy>m.center(cx)+m.southReach(cx)-30,trail=Math.abs(cy-m.center(cx))<148,meadow=m.meadowAt(cx,cy);
   const upper=cx>m.FOOTHILL_END,alpine=cx>=m.SUMMIT_START;
   const col=color(meadow?"#779260":alpine?(edge?"#85877d":trail?"#8b806a":"#667368"):edge?(upper?"#777970":"#727a70"):trail?(upper?"#918467":"#81785a"):upper?((Math.floor(x/tile)+Math.floor(y/tile))%3?"#466450":"#52675a"):(Math.floor(x/tile)+Math.floor(y/tile))%3?"#526f4c":"#47694b");
   quad([x,y,h00+.24],[x2,y,h10+.24],[x2,y2,h11+.24],[x,y2,h01+.24],col);
  }
  for(const sign of [-1,1]){
   const y=m.center(x)+(sign<0?-720:m.southReach(x)),z=m.height(x,y);
   if(isVisible(x,y,220))pyramid(x+tile*.45,y+sign*37,z,69,75,78,"#737c73");
  }
 }
 // The branch path and real grazeable grass share 2D/3D world positions.
 for(let x=10380;x<11360;x+=70){
  const x2=x+70,y=m.meadowTrail(x),y2=m.meadowTrail(x2);
  if(!isVisible(x,y,180))continue;
  quad([x,y-42,m.height(x,y-42)+.9],[x2,y2-42,m.height(x2,y2-42)+.9],
   [x2,y2+42,m.height(x2,y2+42)+.9],[x,y+42,m.height(x,y+42)+.9],color("#b1a07c"));
 }
 for(const g of m.meadowGrass||[]){if(!isVisible(g.x,g.y,65))continue;
  for(let k=-2;k<=2;k++)pyramid(g.x+k*3,g.y-k*2,g.z,3.2,2.8,16+Math.abs(k)*3,"#8aa96e");
 }
 // Hydrology shares the same world coordinates and collision field as Canvas2D.
 for(let x=m.headwater.mouthX;x<m.headwater.sourceX;x+=36){
  const x2=Math.min(m.headwater.sourceX,x+36),y=m.headwater.yAt(x),y2=m.headwater.yAt(x2);
  if(!isVisible((x+x2)/2,(y+y2)/2,120))continue;
  const z=m.height(x,y)+1.4,z2=m.height(x2,y2)+1.4;
  for(const [half,col] of [[28,"#66766b"],[17,"#315b61"],[13,"#438f91"]])
   quad([x,y-half,z],[x2,y2-half,z2],[x2,y2+half,z2],[x,y+half,z],color(col));
 }
 // Mountain creek: same coordinates and crossing as Canvas2D and physics.
  for(let y=2485;y<4650;y+=70){
   const y2=Math.min(4650,y+70),x1=m.creek.xAt(y),x2=m.creek.xAt(y2);
   if(!isVisible((x1+x2)/2,(y+y2)/2,190))continue;
   const z1=m.height(x1,y)+1.5,z2=m.height(x2,y2)+1.5;
   for(const [half,col] of [[47,"#647268"],[34,"#315862"],[27,"#38818a"]])
    quad([x1-half,y,z1],[x1+half,y,z1],[x2+half,y2,z2],[x2-half,y2,z2],color(col));
  }
  const bridgeX=m.creek.xAt(m.creek.bridgeY),bridgeY=m.creek.bridgeY;
  if(isVisible(bridgeX,bridgeY,360)){
   const z=m.height(bridgeX,bridgeY)+2;
   box(bridgeX-70,bridgeY-168,z,140,336,5,"#625a48","#a69a78");
   for(let x=bridgeX-63;x<bridgeX+65;x+=18)
    box(x,bridgeY-165,z+5,12,330,1.4,"#82765a","#c2b18a");
   for(const side of [-1,1])
    box(bridgeX-70,bridgeY+side*174-3,z+5,140,6,14,"#635f4e","#a89b79");
  }
  // Upper ravine uses the same world-space crossing as collision and 2D.
  for(let y=3000;y<4650;y+=70){
   const y2=Math.min(4650,y+70),x1=m.gorge.xAt(y),x2=m.gorge.xAt(y2);
   if(!isVisible((x1+x2)/2,(y+y2)/2,210))continue;
   const z1=m.height(x1,y)+1.6,z2=m.height(x2,y2)+1.6;
   for(const [half,col] of [[63,"#777a70"],[44,"#384445"],[27,"#397582"]])
    quad([x1-half,y,z1],[x1+half,y,z1],[x2+half,y2,z2],[x2-half,y2,z2],color(col));
   if(Math.abs((y+y2)/2-m.gorge.bridgeY)>205)for(const sign of [-1,1])
    box((x1+x2)/2+sign*59-8,(y+y2)/2-30,z1,16,60,24,"#676c67","#a2a59b");
  }
  const gorgeX=m.gorge.xAt(m.gorge.bridgeY),gorgeY=m.gorge.bridgeY;
  if(isVisible(gorgeX,gorgeY,370)){
   const z=m.height(gorgeX,gorgeY)+3;
   box(gorgeX-82,gorgeY-158,z,164,316,6,"#625c4b","#a89a7a");
   for(let x=gorgeX-75;x<gorgeX+78;x+=16)box(x,gorgeY-154,z+6,11,308,1.5,"#8b7a5e","#c3b18c");
   for(const side of [-1,1])box(gorgeX-85,gorgeY+side*164-3,z+7,170,6,13,"#676453","#b8aa85");
  }
  // Cave corridor is walkable, with open ceiling except for entrance arch.
  for(let x=m.cave.start;x<m.cave.end;x+=65){
   const x2=Math.min(m.cave.end,x+65),cx=(x+x2)/2,cy=m.center(cx);
   if(!isVisible(cx,cy,260))continue;
   const z=m.height(cx,cy);
   quad([x,m.center(x)-m.cave.halfWidth,z+1],[x2,m.center(x2)-m.cave.halfWidth,z+1],
        [x2,m.center(x2)+m.cave.halfWidth,z+1],[x,m.center(x)+m.cave.halfWidth,z+1],color("#383f3b"));
   for(const side of [-1,1]){
    const y=cy+side*(m.cave.halfWidth+17);
    box(x,y-16,z,65,32,62,"#686e69","#969b91");
   }
  }
  // Entrance and exit share the same open, walkable world corridor.
  for(const x of [m.cave.start,m.cave.end]){
   const y=m.center(x);if(!isVisible(x,y,290))continue;
   const z=m.height(x,y);
   for(const side of [-1,1])box(x-16,y+side*127-17,z,34,34,116,"#777c75","#a3a79c");
   box(x-16,y-132,z+116,34,264,16,"#727970","#9a9f94");
  }
  // Cave floor texture and solid rock pillars use exactly the 2D/physics coordinates.
  for(let x=m.cave.start+50;x<m.cave.end-20;x+=82){
   const y=m.center(x);if(!isVisible(x,y,170))continue;
   box(x-7,y-52,m.height(x,y)+1.6,14,104,.75,"#48544e","#5b6760");
  }
  // Shared cave floor minerals and wall fragments are close-range static meshes.
  for(const p of m.caveSeams||[]){
   if(!isVisible(p.x,p.y,65))continue;
   ellipsoid(p.x,p.y,p.z+1.7,p.rx,p.ry,.45,"#758c7e",-.12,7,2);
   box(p.x-p.rx*.6,p.y-1,p.z+2,p.rx*1.2,2,.25,"#a5b6a4");
  }
  for(const p of m.caveWallMarks||[]){
   if(!isVisible(p.x,p.y,65))continue;
   pyramid(p.x,p.y,p.z,p.r,p.r*.8,15,"#89938a");
  }
  for(const p of m.caveColumns||[]){
   if(!isVisible(p.x,p.y,105))continue;
   pyramid(p.x,p.y,p.z,p.r,p.r*.94,43,"#727d75");
   ellipsoid(p.x,p.y,p.z+29,p.r*.58,p.r*.55,13,"#9aa39a",0,7,4);
  }
  for(const a of m.alpineGrass){if(!isVisible(a.x,a.y,60))continue;
   for(let k=-2;k<=2;k++)pyramid(a.x+k*3,a.y-k*2,a.z,3,3,17+Math.abs(k)*3,"#7e9878");
  }
  for(const t of m.alpinePines){if(!isVisible(t.x,t.y,190))continue;
   box(t.x-5,t.y-5,t.z,10,10,59,"#605b4c","#827b66");
   for(let k=0;k<3;k++)pyramid(t.x,t.y,t.z+18+k*23,t.r*(1.08-k*.18),t.r*(.96-k*.17),53-k*6,"#315c50");
  }
  for(const r of [...m.alpineRocks,...m.caveStones]){if(!isVisible(r.x,r.y,120))continue;
   pyramid(r.x,r.y,r.z,r.r,r.r*.81,r.r*.92,"#767c76");
  }
  for(const hut of [...m.ruins,...m.ridgeHuts]){
  if(!isVisible(hut.x+hut.w/2,hut.y+hut.h/2,240))continue;
  const z=m.height(hut.x+hut.w/2,hut.y+hut.h/2);
  box(hut.x,hut.y,z,hut.w,hut.h,4,"#706e5c","#807c68");
  box(hut.x,hut.y,z+4,10,hut.h,33,"#777566","#a7a18a");
  box(hut.x+hut.w-10,hut.y,z+4,10,hut.h,22,"#6b7163","#a7a18a");
  box(hut.x,hut.y,z+4,hut.w,9,27,"#797968","#aaa68c");
  box(hut.x,hut.y+hut.h-10,z+4,hut.w,10,20,"#687367","#9c9b85");
 }
 for(const f of m.ferns){
   if(!isVisible(f.x,f.y,70))continue;
   for(let k=-2;k<=2;k++)
    pyramid(f.x+k*f.r*.35,f.y-k*2,f.z,4.5,3.5,17+Math.abs(k)*2,
      k%2?"#477a4e":"#639264");
  }
  for(const h of m.heather){if(!isVisible(h.x,h.y,75))continue;
   for(let k=-3;k<=3;k++)pyramid(h.x+k*3,h.y-k*2,h.z,2.7,2.3,12+Math.abs(k)*2,k%2?"#729b75":"#557e64");
  }
  for(const r of m.scree){if(!isVisible(r.x,r.y,125))continue;
   pyramid(r.x,r.y,r.z,r.r,r.r*.77,r.r*.84,"#777d78");
   ellipsoid(r.x+5,r.y-4,r.z+r.r*.19,r.r*.58,r.r*.51,r.r*.24,"#92978e",.22,6,3);
  }
  for(const t of m.pines){if(!isVisible(t.x,t.y,200))continue;
   box(t.x-5,t.y-5,t.z,10,10,63,"#635b48","#857963");
   for(let k=0;k<3;k++)pyramid(t.x,t.y,t.z+21+k*25,t.r*(1.12-k*.17),t.r*(.99-k*.16),57-k*6,k%2?"#356450":"#274d40");
  }
  for(const r of m.rocks){
  if(!isVisible(r.x,r.y,150))continue;
  ellipsoid(r.x,r.y,r.z+r.r*.24,r.r,r.r*.76,r.r*.51,"#788078",.22,7,4);
 }
 for(const t of m.trees){
  if(!isVisible(t.x,t.y,210))continue;
  // Mature broadleaf trees: tapered trunk, asymmetric limbs and overlapping
  // rounded foliage masses instead of the old two stacked pyramids.
  const radius=Math.max(17,t.r||32),height=49+radius*.42;
  const seed=Math.sin(t.x*.037+t.y*.071)*43758.5453;
  const variance=seed-Math.floor(seed);
  box(t.x-6,t.y-6,t.z,12,12,height,"#594638","#80634b");
  box(t.x-4,t.y-4,t.z+height*.54,8,8,height*.42,"#67513d","#947052");
  const limbDirs=[[1,.16],[-.78,.62],[-.42,-.85],[.68,-.68]];
  for(let k=0;k<limbDirs.length;k++){
   const [dx,dy]=limbDirs[k],reach=radius*(.38+(k%2)*.12);
   const bx=t.x+dx*reach*.5,by=t.y+dy*reach*.5;
   box(bx-3,by-3,t.z+height*.67+k*2,6+Math.abs(dx)*reach,6+Math.abs(dy)*reach,5,"#67503c","#84664b");
  }
  const clusters=[[0,0,.89],[.56,.08,.60],[-.48,.27,.64],[.12,-.55,.62],[-.24,-.39,.53],[.33,.47,.56]];
  for(let k=0;k<clusters.length;k++){
   const [dx,dy,scale]=clusters[k],r=radius*scale;
   const drift=(variance-.5)*radius*.12;
   const greens=["#315f3d","#42784b","#376c43","#4d8050","#2d603d","#558354"];
   ellipsoid(t.x+dx*radius+drift,t.y+dy*radius-drift,t.z+height+radius*(.10+(k%3)*.14),r,r*.86,r*.66,greens[k],.12,8,5);
  }
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
  box(0,y-80,0,8400,160,1,"#323d3e","#344145");
  box(0,y-86,0,8400,6,2,"#565d54","#717e68");
  box(0,y+80,0,8400,6,5,"#565d54","#717e68");
  for(let x=140;x<8400;x+=280){
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
  initializeGPU();staticBuffer=gl.createBuffer();snowBuffer=gl.createBuffer();
  staticKey="";staticCount=0;dynamicCount=0;snowCacheKey="";snowCount=0;
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
  const regionKey=[Math.floor(cam.x/240),Math.floor(cam.y/240),vw,vh,...[VIEW.a,VIEW.b,VIEW.c,VIEW.d].map(v=>Math.round(v*12)),buildings.length,(o.streetProps||[]).length,(o.scenicProps||[]).length,(o.disasterEvents||[]).filter(e=>e.kind==="fallen_tree"&&(e.permanent||(o.elapsed||0)/120-e.year<e.duration)).map(e=>[Math.round(e.x),Math.round(e.y),Math.round(e.year),Number.isFinite(e.fallAtSeconds)?Math.min(12,Math.floor(Math.max(0,((o.elapsed||0)-e.fallAtSeconds)/1.4)*12)):12].join(",")).join(";"),
   // The static mesh is refreshed exactly when a slope deposit appears or fades.
   (o.disasterEvents||[]).filter(e=>e.kind==="landslide"&&((o.elapsed||0)/120)>=e.year&&
    (e.permanent||((o.elapsed||0)/120)<e.year+e.duration))
     .map(e=>[Math.round(e.x),Math.round(e.y),Math.round(e.year*100),Math.round(e.rx||68),Math.round(e.ry||41)].join(",")).join(";"),
   WORLD.w,WORLD.h,interiorReveal].join(":");
  if(regionKey!==staticKey){
   data=[];terrain(WORLD,o.roadsX||[530,1410,2320,3270],o.roadsY||[465,1170,1890],isVisible,buildings);
   mountainTerrain(isVisible);
   for(const site of o.landmarks||[])if(isVisible(site.x,site.y,600))landmarkMesh(site);
   // Light decorative rewilding; keep it out of physics and saved plants[].
   for(const p of o.scenicProps||[]){
    if(!isVisible(p.x,p.y,175))continue;
    if(p.kind==="wildGrowth"){
     for(let k=0;k<10;k++){
      const a=k*2.4,r=8+(k%4)*7;
      pyramid(p.x+Math.cos(a)*r,p.y+Math.sin(a)*r*.65,.3,5+(k%3)*2,5+(k%2)*2,16+(k%5)*7,
       k%3?"#4b8a52":"#90ad6b");
     }
     for(let k=0;k<3;k++)ellipsoid(p.x+(k-1)*16,p.y-12,29+(k%2)*9,3,3,3,"#d9c282",0,6,3);
    }else if(p.kind==="sapling"){
     box(p.x-4,p.y-4,.4,8,8,53,"#69573d");
     for(let k=0;k<5;k++){const a=k*TAU/5;
      pyramid(p.x+Math.cos(a)*19,p.y+Math.sin(a)*14,26,25,21,66,k%2?"#43814d":"#6b9c5b");
     }
    }else if(p.kind==="collapsed"){
     box(p.x-34,p.y-13,.6,54,26,12,"#626d66","#8f9181");
     box(p.x+17,p.y-18,1,14,20,19,"#4e5853","#969684");
     for(let k=0;k<4;k++)pyramid(p.x-23+k*13,p.y+12,1,7,7,17+(k%3)*4,"#557b54");
    }
   }
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
   // Torn roofline, wall-creeping vines and broken windows: an old building,
   // not a newly constructed intact office tower.
   const age=detailNoise(b.seed*271);
   if(b.broken||age>.26){
    for(let k=0;k<6;k++){
     const u=detailNoise(b.seed*17+k*9),side=k%2;
     const px=b.x+(side?b.w*.95:b.w*.06),py=b.y+b.h*(.08+u*.83);
     pyramid(px,py,h*(.15+u*.58),11+(k%3)*5,12,36+(k%4)*11,
      k%2?"#497a4b":"#6c9362");
    }
    for(let k=0;k<4;k++){
     const tx=b.x+30+k*(b.w-60)/3;
     pyramid(tx,b.y+b.h*.24,h+1,13+(k%3)*6,17,26+(k%2)*16,"#4b8155");
    }
    for(let k=0;k<3;k++){
     const xx=b.x+(k+1)*b.w/4;
     box(xx-13,b.y-.8,h*(.23+k*.18),26,2,15,"#192829","#273a3a");
    }
   }
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
   // Rooted trees occupy identical collision and 2D world positions.
   for(const tree of o.standingFallTrees||[])if(isVisible(tree.x,tree.y,245))standingGiantTreeMesh(tree);
   // Real rocky deposits are cached in the static GPU mesh, not rebuilt
   // each frame. Their footprint and life span use the physics events.
   for(const e of o.disasterEvents||[]){
    const year=(o.elapsed||0)/120;
    if(year<e.year||(!e.permanent&&year-e.year>=e.duration)||
       !isVisible(e.x,e.y,210))continue;
    if(e.kind==="landslide"){
     const rx=Math.max(24,Number(e.rx)||68),ry=Math.max(18,Number(e.ry)||41);
     const mountain=window.WildMountain;
     const h=mountain?.height?.(e.x,e.y)||0;
     ellipsoid(e.x,e.y,h+2,rx,ry,5,"#796653",-.13,14,3);
     for(let k=0;k<10;k++){
      const angle=k*2.39996+e.x*.018,rad=.2+.66*((k*7%11)/11);
      const px=e.x+Math.cos(angle)*rx*rad,py=e.y+Math.sin(angle)*ry*rad;
      const z=mountain?.height?.(px,py)||h;
      pyramid(px,py,z+3,6+k%3*2,5+k%2*2,5+k%4*2,
       k%3===0?"#b1a89a":k%3===1?"#514b43":"#8d8072");
     }
    }else if(e.kind==="fallen_tree")fallenTreeMesh(e,year);
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
  // Continuous snow coverage sampled in world coordinates. Adjacent mesh
  // triangles share identical edge intersections; no square tile silhouettes.
  const snow=clamp(o.snowpack||0,0,1);
  // Permanent high-altitude snow remains visible in clear weather. Avoid
  // tessellating the entire city when there is no falling/ground snow.
  const snowMountain=window.WildMountain;
  // Snow is world-space geometry, not an animation. Reuse a GPU buffer while
  // the camera stays in a 256-unit sector and the snow/weather field is stable.
  // Overscan preserves continuous edges when the camera moves within a sector.
  const snowSector=256,snowCellX=Math.floor(cam.x/snowSector),snowCellY=Math.floor(cam.y/snowSector);
  const snowAnchorX=snowCellX*snowSector,snowAnchorY=snowCellY*snowSector;
  const snowViewMargin=vh*.85+250+snowSector;
  const alpineInView=typeof snowMountain?.snowCover==="function"
   &&snowAnchorX+vw+snowViewMargin>=10100&&snowAnchorX-snowViewMargin<=13600
   &&snowAnchorY+vh+snowViewMargin>=2600&&snowAnchorY-snowViewMargin<=5100;
  // Recheck water and disaster state every five seconds without recomputing per frame.
  const snowKey=[snowCellX,snowCellY,vw,vh,VIEW.a,VIEW.b,VIEW.c,VIEW.d,
   WORLD.w,WORLD.h,snow.toFixed(3),alpineInView?1:0,Math.floor(elapsed/5)].join(":");
  if(snowKey!==snowCacheKey){
   const snowDataStart=data.length;
   if(snow>.06||alpineInView){
   const step=48,margin=snowViewMargin;
   const firstX=Math.max(snow>.06?0:8300,Math.floor((snowAnchorX-margin)/step)*step);
   const firstY=Math.max(snow>.06?0:2600,Math.floor((snowAnchorY-margin)/step)*step);
   const endX=Math.min(snow>.06?WORLD.w:13600,snowAnchorX+vw+margin);
   const endY=Math.min(snow>.06?WORLD.h:5100,snowAnchorY+vh+margin);
   // Per-frame world-coordinate caches share exact edge heights and snow masks
   // across neighbouring cells. Recreated every render to follow terrain/weather.
   const heightCache=new Map(),maskCache=new Map();
   const sampleKey=(px,py)=>px+","+py;
   const ground=(px,py)=>{
    const k=sampleKey(px,py);
    if(heightCache.has(k))return heightCache.get(k);
    const h=Number(window.WildMountain?.height(px,py))||0;
    const safe=Number.isFinite(h)?h:0;
    heightCache.set(k,safe);return safe;
   };
   const water=typeof o.waterAt==="function"?o.waterAt:null;
   const snowZ=1.15+snow*.48;
   // Smooth lattice noise is stable across cells and camera movement.
   const hash=(ix,iy)=>detailNoise(ix*17.13+iy*43.71);
   const smooth=(v)=>v*v*(3-2*v);
   const field=(px,py)=>{
    const key=sampleKey(px,py);
    if(maskCache.has(key))return maskCache.get(key);
    const u=px/170,v=py/170,ix=Math.floor(u),iy=Math.floor(v);
    const fx=smooth(u-ix),fy=smooth(v-iy);
    const a=hash(ix,iy)*(1-fx)+hash(ix+1,iy)*fx;
    const b=hash(ix,iy+1)*(1-fx)+hash(ix+1,iy+1)*fx;
    const broad=a*(1-fy)+b*fy;
    // Interpolate fine noise in world space too: quantized 48-unit cells
    // otherwise produce visible rectangular snow bands.
    const fu=px/48,fv=py/48,fi=Math.floor(fu),fj=Math.floor(fv);
    const tx=smooth(fu-fi),ty=smooth(fv-fj);
    const f00=hash(fi*3+71,fj*3-19),f10=hash((fi+1)*3+71,fj*3-19);
    const f01=hash(fi*3+71,(fj+1)*3-19),f11=hash((fi+1)*3+71,(fj+1)*3-19);
    const fine=(f00*(1-tx)+f10*tx)*(1-ty)+(f01*(1-tx)+f11*tx)*ty;
    const waterMask=water?clamp((.015-water(px,py))/.015,0,1):1;
    // Align visible mountain snow with the continuous elevation/slope field used by terrain.
    const alpine=typeof window.WildMountain?.snowCover==="function"?window.WildMountain.snowCover(px,py):0;
    const weatherField=snow*.97-(broad*.78+fine*.22);
    const alpineField=alpine>0?alpine*(.28+.45*snow)-.13:-1;
    const result=Math.min(Math.max(weatherField,alpineField),waterMask-.5);
    maskCache.set(key,result);
    return result;
   };
   // The snow lip thins to the underlying collision terrain at its boundary.
   // Evaluate the same world-space mask at clipped vertices so adjoining
   // triangles have identical height and no raised square edge.
   // Shared surface samples avoid repeated slope gradients for fan vertices.
   // A world-space key also keeps adjoining snow cells at identical heights.
   const surfaceCache=new Map();
   const surface=(p)=>{
    const key=sampleKey(p[0],p[1]);
    if(surfaceCache.has(key))return surfaceCache.get(key);
    const coverage=clamp(field(p[0],p[1])*4.5,0,1);
    // Zero lift exactly at the contour prevents a floating snow rim;
    // use the same terrain height API as collision and neighbouring cells.
    // Snow accumulates less on steep slopes, while retaining the exact
    // collision-height sample at the edge of every shared world-space cell.
    const d=8;
    const dx=(ground(p[0]+d,p[1])-ground(p[0]-d))/(2*d);
    const dy=(ground(p[0],p[1]+d)-ground(p[0],p[1]-d))/(2*d);
    const slope=Math.hypot(dx,dy);
    const slopeRetention=1-.58*clamp((slope-.28)/1.25,0,1);
    const depth=snowZ*coverage*coverage*slopeRetention;
    const vertex=[p[0],p[1],ground(p[0],p[1])+depth];
    surfaceCache.set(key,vertex);
    return vertex;
   };
   // Clip each triangle against the same continuous snow threshold.
   // Intersections are calculated from shared world-space vertex values.
   const clip=(verts)=>{
    let out=[];
    for(let i=0;i<verts.length;i++){
     const a=verts[i],b=verts[(i+1)%verts.length];
     if(a[2]>=0)out.push(a);
     if((a[2]>=0)!==(b[2]>=0)){
      // The snow mask is nonlinear between vertices. Refine the contour in
      // world space so adjoining triangles meet at the same physical edge,
      // rather than drawing straight threshold estimates across steep slopes.
      let lo=0,hi=1;
      const positive=a[2]>=0;
      for(let k=0;k<6;k++){
       const mid=(lo+hi)*.5;
       const value=field(a[0]+(b[0]-a[0])*mid,a[1]+(b[1]-a[1])*mid);
       if((value>=0)===positive)lo=mid;else hi=mid;
      }
      const t=(lo+hi)*.5;
      out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,0]);
     }
    }
    return out;
   };
   for(let x=firstX;x<endX;x+=step)for(let y=firstY;y<endY;y+=step){
    const x2=Math.min(WORLD.w,x+step),y2=Math.min(WORLD.h,y+step);
    if(!isVisible((x+x2)*.5,(y+y2)*.5,120+snowSector*2))continue;
    // Center-fan tessellation samples shared world-space edge midpoints.
    // Neighboring cells reuse the exact same coordinates and terrain heights,
    // while the center resolves narrow snow contours on curved mountain slopes.
    const mx=(x+x2)*.5,my=(y+y2)*.5;
    const vertices=[[x,y],[mx,y],[x2,y],[x2,my],[x2,y2],
                    [mx,y2],[x,y2],[x,my],[mx,my]];
    const sampled=vertices.map(p=>[p[0],p[1],field(p[0],p[1])]);
    // Constant snow albedo across cells: center-based tint caused visible
    // 32-unit square seams even where the clipped surface was continuous.
    const tint=color("#f4f6f3");
    for(let edge=0;edge<8;edge++){
     const poly=clip([sampled[8],sampled[edge],sampled[(edge+1)%8]]);
     if(poly.length<3)continue;
     const base=surface(poly[0]);
     for(let i=1;i<poly.length-1;i++)triangle(base,surface(poly[i]),surface(poly[i+1]),tint);
    }
   }
   }
   // Preserve animated animals, vegetation, and FX in their existing dynamic buffer.
   // Upload the snow only when its cache key changes; never mix stale geometry
   // into the next frame's dynamic mesh.
   const snowVertices=new Float32Array(data.slice(snowDataStart));
   data.length=snowDataStart;
   gl.bindBuffer(gl.ARRAY_BUFFER,snowBuffer);
   gl.bufferData(gl.ARRAY_BUFFER,snowVertices,gl.STATIC_DRAW);
   snowCount=snowVertices.length/9;
   snowCacheKey=snowKey;snowRebuilds++;
  }
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
  // The combat loop sets flash only on a real hit; missed attacks have no flare.
  // Capped low-poly shapes preserve mobile GPU budgets.
  function drawImpactFlare(m){
   const remaining=Number(m.flash)||0;
   if(remaining<=0||m.hp<=0)return;
   const progress=clamp(1-remaining/.24,0,1);
   const radius=clamp(Number(m.r)||16,10,100);
   const ground=Number(m.groundZ)||0;
   const x=m.x,y=m.y,z=ground+Math.max(8,radius*.6);
   const spread=radius*(.68+progress*.75),pulse=1-progress;
   const tint=m.strongBoss?"#ffc986":"#ffdf9b";
   ellipsoid(x,y,z,Math.max(.6,radius*.24*pulse),Math.max(.6,radius*.24*pulse),Math.max(.6,radius*.24*pulse),"#fff5ce",0,7,3);
   for(let k=0;k<6;k++){
    const a=k*Math.PI/3+progress*.25,px=x+Math.cos(a)*spread,py=y+Math.sin(a)*spread;
    ellipsoid(px,py,z+Math.sin(a*2)*radius*.12,
     Math.max(.6,radius*.12*pulse),Math.max(.6,radius*.09*pulse),
     Math.max(.7,radius*.20*pulse),tint,a,5,3);
   }
   for(let k=0;k<8;k++){
    const a=k*Math.PI/4,px=x+Math.cos(a)*spread,py=y+Math.sin(a)*spread;
    ellipsoid(px,py,ground+2,Math.max(.6,radius*.08*pulse),
     Math.max(.6,radius*.08*pulse),1.3,"#e7aa70",a,5,2);
   }
  }
  // A landed hit produces brief visible recoil without changing the actual
  // NPC position, collision body, AI path, or persistent world coordinates.
  function impactRecoil(m,player){
   const remaining=Number(m.flash)||0;
   if(!(remaining>0)||!(Number(m.hp)>0)||m.worldEndBoss)return {x:m.x,y:m.y,dir:m.dir};
   const phase=clamp(remaining/.24,0,1),impulse=Math.sin(Math.PI*phase);
   const radius=clamp(Number(m.r)||16,8,90);
   const angle=Number.isFinite(m.dir)?m.dir:0;
   const dx=(Number(m.x)||0)-(Number(player?.x)||0),dy=(Number(m.y)||0)-(Number(player?.y)||0);
   const length=Math.hypot(dx,dy);
   const nx=length>1?dx/length:Math.cos(angle),ny=length>1?dy/length:Math.sin(angle);
   const offset=radius*(m.strongBoss?.065:.18)*impulse;
   return {x:m.x+nx*offset,y:m.y+ny*offset,
    dir:angle+Math.sin(Math.PI*2*phase)*(m.strongBoss?.035:.11)};
  }
  for(const m of mobs)if(isVisible(m.x,m.y,m.type==="worldEnd"?640:110)){
   const recoil=impactRecoil(m,P);
   animal({...m,...species[m.type],...recoil},false,elapsed);
   drawImpactFlare(m);
  }
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
  // Primate warnings and projectiles use the same world positions as hit tests.
  for(const m of mobs){
   if(!["macaque","chimpanzee"].includes(m.type)||m.hp<=0||!isVisible(m.x,m.y,420))continue;
   const chimp=m.type==="chimpanzee",a=chimp?(Number.isFinite(m.chimpAim)?m.chimpAim:0):(m.macaqueAim||0),c=Math.cos(a),s=Math.sin(a);
   const warning=chimp?(m.chimpTell||0):(m.macaqueTell||0),reach=chimp&&m.chimpAttackKind==="branch"?95:chimp?355:395;
   if(warning>0)for(let k=1;k<=6;k++){
    const d=reach*(k/7),px=m.x+c*d,py=m.y+s*d;
    if(isVisible(px,py,55))ellipsoid(px,py,(window.WildMountain?.height(px,py)||0)+1.5,19,3.5,.8,k%2?"#e8b26d":"#f1d397",a,7,3);
   }
   const stone=m.macaqueStone||m.chimpStone;
   if(stone&&Number.isFinite(stone.x)&&Number.isFinite(stone.y)&&isVisible(stone.x,stone.y,75)){
    const z=window.WildMountain?.height(stone.x,stone.y)||0;
    ellipsoid(stone.x,stone.y,z+1,8,6,1.1,"#373d36",0,7,3);
    ellipsoid(stone.x,stone.y,z+20,7,6,5,"#b3a999",0,8,4);
   }
  }
  const playerFirst=data.length/9;
  if(P&&!P._ufoAbducting){animal({...P,color:P.base.color,belly:P.base.belly},true,elapsed);carriedFoodMesh(P);}
  const playerEnd=data.length/9;
  const ghostEnd=playerEnd;
  const vertices=new Float32Array(data);
  gl.useProgram(program);
  // Screen-only quake offset: move the rendered world, not the camera used by
  // cached terrain and snow geometry. HUD and saved world positions stay fixed.
  const quakeX=Number.isFinite(o.quakeOffset?.x)?o.quakeOffset.x:0;
  const quakeY=Number.isFinite(o.quakeOffset?.y)?o.quakeOffset.y:0;
  gl.uniform2f(ucenter,cam.x+vw/2+quakeX,cam.y+vh/2+quakeY);
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
  bindAttributes(snowBuffer);
  if(snowCount)gl.drawArrays(gl.TRIANGLES,0,snowCount);
  bindAttributes(buffer);
  gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.DYNAMIC_DRAW);
  dynamicCount=vertices.length/9;
  // Animals behind walls and roofs remain faintly visible: the stencil draws
  // exactly one translucent pixel where the static depth buffer occludes them.
  const hasOcclusionStencil=!!gl.getContextAttributes()?.stencil;
  if(ghostEnd>ghostStart&&hasOcclusionStencil){
   gl.clearStencil(0);gl.stencilMask(0xff);gl.clear(gl.STENCIL_BUFFER_BIT);
   gl.enable(gl.STENCIL_TEST);gl.stencilFunc(gl.EQUAL,0,0xff);
   gl.stencilOp(gl.KEEP,gl.KEEP,gl.INCR);
   gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
   gl.depthFunc(gl.GREATER);gl.depthMask(false);gl.uniform1f(ualpha,.36);
   gl.drawArrays(gl.TRIANGLES,ghostStart,ghostEnd-ghostStart);
   gl.disable(gl.STENCIL_TEST);gl.depthFunc(gl.LEQUAL);gl.depthMask(true);
   gl.disable(gl.BLEND);gl.uniform1f(ualpha,1);
  }
  if(playerFirst)gl.drawArrays(gl.TRIANGLES,0,playerFirst);
  if(P&&playerEnd>playerFirst){
   // Preserve the static building depth! Clearing it here made every player
   // opaque and visible *over* buildings, undoing the translucent silhouette.
   // The normal pass shows only visible faces, while the stencil ghost pass
   // above retains a 36% outline wherever architecture blocks the animal.
   gl.depthFunc(gl.LEQUAL);
   gl.depthMask(true);
   // The player must remain legible even in a dark district/night; keep
   // environmental lighting on the rest of the world unchanged.
   gl.uniform1f(unight,Math.min(night,.36));
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
   gl.uniform1f(unight,night);
  }
  frames++;
  return true;
 }catch(e){
  if(!failed)console.error("Wild3D rendering error; Canvas2D restored",e);
  failed=true;window.Wild3D.available=false;canvas.style.display="none";return false;
 }
}

/* Bestiary viewport: renders the real animal geometry into a private framebuffer.
 * Does not change the world camera, save data or main canvas dimensions. */
let bestiaryFrame=null;
function bestiaryRender(m,target,yaw=0,zoom=1,tilt=0){
 if(!target||!m||failed)return false;
 const w=Math.max(80,Math.min(420,target.width||320)),h=Math.max(80,Math.min(360,target.height||260));
 const oldState={
  viewport:gl.getParameter(gl.VIEWPORT),framebuffer:gl.getParameter(gl.FRAMEBUFFER_BINDING),
  program:gl.getParameter(gl.CURRENT_PROGRAM),arrayBuffer:gl.getParameter(gl.ARRAY_BUFFER_BINDING),
  renderbuffer:gl.getParameter(gl.RENDERBUFFER_BINDING),activeTexture:gl.getParameter(gl.ACTIVE_TEXTURE),
  texture2D:gl.getParameter(gl.TEXTURE_BINDING_2D),clearColor:gl.getParameter(gl.COLOR_CLEAR_VALUE),
  depthTest:gl.isEnabled(gl.DEPTH_TEST),blend:gl.isEnabled(gl.BLEND),stencil:gl.isEnabled(gl.STENCIL_TEST),
  depthFunc:gl.getParameter(gl.DEPTH_FUNC),depthMask:gl.getParameter(gl.DEPTH_WRITEMASK)
 };
 try{
  if(!bestiaryFrame||bestiaryFrame.w!==w||bestiaryFrame.h!==h){
   if(bestiaryFrame){gl.deleteFramebuffer(bestiaryFrame.fb);gl.deleteTexture(bestiaryFrame.tex);gl.deleteRenderbuffer(bestiaryFrame.depth);}
   const fb=gl.createFramebuffer(),tex=gl.createTexture(),depth=gl.createRenderbuffer();
   gl.bindTexture(gl.TEXTURE_2D,tex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
   gl.bindRenderbuffer(gl.RENDERBUFFER,depth);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,w,h);
   gl.bindFramebuffer(gl.FRAMEBUFFER,fb);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0);
   gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,depth);
   if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw Error("図鑑3Dバッファ生成失敗");
   bestiaryFrame={fb,tex,depth,w,h};
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER,bestiaryFrame.fb);gl.viewport(0,0,w,h);
  gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT|gl.STENCIL_BUFFER_BIT); // Transparent preview framebuffer.
  gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.depthMask(true);gl.disable(gl.BLEND);gl.disable(gl.STENCIL_TEST);
  data=[];animal({...m,x:0,y:0,dir:yaw,vx:0,vy:0,step:0,steps:0,deathPose:0},false,0);
  const vertices=new Float32Array(data);
  const r=Math.max(9,m.r||20),factor=Math.min(1.55,34/r)*Math.min(w/300,h/255)*clamp(zoom,.55,2.3);
  const elevation=clamp(.8+tilt*.45,.38,1.18);
  gl.useProgram(program);gl.uniform2f(ucenter,0,-r*.65);gl.uniform2f(usize,w,h);
  gl.uniform4f(uview,.97*factor,.23*factor*elevation,-.35*factor,.76*factor*elevation);
  gl.uniform1f(uzoom,factor*elevation);gl.uniform1f(unight,0);
  gl.uniform3f(utint,1.1,1.1,1.1);gl.uniform1f(ualpha,1);
  gl.uniform4f(unightVision,0,0,0,1);gl.uniform1f(unightVisionStrength,0);
  gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.DYNAMIC_DRAW);
  for(const [attr,offset] of [[attrPos,0],[attrNormal,12],[attrColor,24]]){
   if(attr<0)continue;gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,3,gl.FLOAT,false,36,offset);
  }
  gl.drawArrays(gl.TRIANGLES,0,vertices.length/9);
  const pixels=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
  const ctx=target.getContext("2d"),out=ctx.createImageData(w,h);
  for(let row=0;row<h;row++)out.data.set(pixels.subarray((h-1-row)*w*4,(h-row)*w*4),row*w*4);
  ctx.putImageData(out,0,0);return true;
 }catch(err){console.warn("Bestiary 3D unavailable",err);return false;}
 finally{
  gl.bindFramebuffer(gl.FRAMEBUFFER,oldState.framebuffer);
  gl.viewport(...oldState.viewport);gl.clearColor(...oldState.clearColor);
  gl.depthFunc(oldState.depthFunc);gl.depthMask(oldState.depthMask);
  for(const [cap,enabled] of [[gl.DEPTH_TEST,oldState.depthTest],[gl.BLEND,oldState.blend],[gl.STENCIL_TEST,oldState.stencil]]){
   if(enabled)gl.enable(cap);else gl.disable(cap);
  }
  gl.useProgram(oldState.program);gl.bindBuffer(gl.ARRAY_BUFFER,oldState.arrayBuffer);
  gl.bindRenderbuffer(gl.RENDERBUFFER,oldState.renderbuffer);
  gl.activeTexture(oldState.activeTexture);gl.bindTexture(gl.TEXTURE_2D,oldState.texture2D);
 }
}

function captureDeathFrame(){
 if(failed||!gl||!canvas.width||!canvas.height)return null;
 const w=canvas.width,h=canvas.height,bytes=new Uint8Array(w*h*4);
 try{
  const previous=gl.getParameter(gl.FRAMEBUFFER_BINDING);
  try{gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,bytes)}
  finally{gl.bindFramebuffer(gl.FRAMEBUFFER,previous)}
  const buffer=document.createElement("canvas");buffer.width=w;buffer.height=h;
  const b=buffer.getContext("2d"),im=b.createImageData(w,h);im.data.set(bytes);b.putImageData(im,0,0);
  const screen=document.createElement("canvas");screen.width=w;screen.height=h;
  const c=screen.getContext("2d");c.translate(0,h);c.scale(1,-1);c.drawImage(buffer,0,0);
  return screen;
 }catch(err){console.warn("Death WebGL readback failed",err);return null}
}
window.Wild3D={available:true,render,captureDeathFrame,previewAnimal:bestiaryRender,get frames(){return frames},
 get stats(){return {staticRebuilds,staticTriangles:staticCount/3,
  snowRebuilds,snowTriangles:snowCount/3,dynamicTriangles:dynamicCount/3}}};
})();
