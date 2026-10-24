// Run: node games/random-hell-infinity/tests/resume.cjs
// Executes the actual inline game script with a mocked DOM/canvas. Not a browser visual test.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
new vm.Script(script);
function boot(width=390,height=844){
 const nodes=new Map(),storage=new Map(),events={};
 const ctx=new Proxy({}, {get:(o,k)=>o[k]??(o[k]=()=>k==='measureText'?{width:20}:k.includes('Gradient')?{addColorStop(){}}:undefined)});
 function node(){return {style:{removeProperty(){},setProperty(){}},classList:{add(){},remove(){},toggle(){}},addEventListener(){},setAttribute(){},appendChild(){},querySelectorAll(){return []},getContext(){return ctx},getBoundingClientRect(){return {left:0,top:0,width:100,height:100}},setPointerCapture(){},releasePointerCapture(){}}}
 const document={documentElement:{clientWidth:width,clientHeight:height},body:node(),getElementById(id){if(!nodes.has(id))nodes.set(id,node());return nodes.get(id)},createElement:node,addEventListener(t,f){events['doc:'+t]=f}};
 const sandbox={console,document,navigator:{maxTouchPoints:5},innerWidth:width,innerHeight:height,devicePixelRatio:1,Image:class{},requestAnimationFrame(){},setTimeout(){},clearTimeout(){},performance:{now:()=>0},localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},matchMedia:()=>({matches:width<900}),addEventListener(t,f){events[t]=f}};
 sandbox.window=sandbox;
 const context=vm.createContext(sandbox);
 const access=`\nwindow.test={run:code=>eval(code),snapshot:()=>({hp:player.hp,checkpointIndex,levelIndex,mode,save,loadout}),begin,showMenu,saveState,resize,showClear,die,draw};\n`;
 vm.runInContext(script.replace(/\}\)\(\);\s*$/,access+'})();'),context);
 return {t:sandbox.test,sandbox,events,nodes,storage,document};
}
let count=0;
function check(name,fn){fn();count++;console.log('PASS '+name)}
for(const [width,height] of [[390,844],[844,390],[320,568],[1280,720]]){
 const {t,sandbox,events,nodes,storage,document}=boot(width,height);
 check(`${width}x${height} Esc resumes latest HP/checkpoint/stage`,()=>{
  t.begin(12345,5);t.run('player.hp=3;checkpointIndex=2');
  events.keydown({code:'Escape',preventDefault(){}});
  assert.equal(t.snapshot().save.hp,3);assert.equal(t.snapshot().save.levelIndex,5);
  nodes.get('continueGame').onclick();assert.equal(t.snapshot().hp,3);assert.equal(t.snapshot().checkpointIndex,2);
 });
 check('menu resize preserves checkpoint and HP',()=>{
  t.showMenu();document.documentElement.clientHeight=height+200;t.resize();
  assert.equal(t.snapshot().hp,3);assert.equal(t.snapshot().checkpointIndex,2);
  nodes.get('continueGame').onclick();assert.equal(t.snapshot().checkpointIndex,2);
 });
 check('snapshot is detached from inventory mutations',()=>{
  t.saveState();t.run('loadout[0].tier=9');assert.equal(t.snapshot().save.loadout[0].tier,1);
 });
 check('stage transition carries damaged HP',()=>{
  t.showClear();nodes.get('continueNext').onclick();assert.equal(t.snapshot().hp,3);assert.equal(t.snapshot().levelIndex,6);
 });
 check('pending clear survives repeated menu, resize and sound toggle',()=>{
  t.run('stageTime=42');t.showClear();t.showMenu();
  document.documentElement.clientHeight+=180;t.resize();
  t.run('toggleSound()');t.saveState();t.showMenu();
  assert.equal(t.snapshot().save.clearPending,true);assert.equal(t.snapshot().save.clearTime,42);
  nodes.get('continueGame').onclick();assert.equal(t.snapshot().mode,'clear');assert.equal(t.snapshot().hp,3);
  nodes.get('continueNext').onclick();assert.equal(t.snapshot().levelIndex,7);
 });
 check('fall weapon reset survives menu resume',()=>{
  t.run('rhResetWeaponsOnFall()');t.showMenu();nodes.get('continueGame').onclick();
  assert.equal(t.snapshot().loadout[0].id,'fist');assert.equal(t.snapshot().loadout[0].tier,1);assert.equal(t.snapshot().hp,3);
 });
 check('storage failure still permits current in-session resume',()=>{
  sandbox.localStorage.setItem=()=>{throw Error('quota')};t.run('player.hp=2');t.showMenu();nodes.get('continueGame').onclick();assert.equal(t.snapshot().hp,2);
 });
 check('death clears resume and cannot be revived by menu',()=>{
  t.die();t.showMenu();assert.equal(t.snapshot().save,null);assert.equal(storage.has('randomHellSave'),false);
 });
 check('old save without HP remains compatible',()=>{
  t.begin(12345,0,0,{loadout:[{id:'fist',tier:1,affix:'none'}]});assert.equal(t.snapshot().hp,7);
 });
 check('24 stages generate/draw with 8 bosses',()=>{
  let bosses=0;for(let i=0;i<24;i++){t.begin(987654321,i);assert.equal(t.run('level.world'),Math.floor(i/3));if(t.run('!!level.boss'))bosses++;t.draw()}assert.equal(bosses,8);
 });
}
console.log(`${count} checks passed; DOM/canvas mocked, visual and physical-touch testing not covered.`);
