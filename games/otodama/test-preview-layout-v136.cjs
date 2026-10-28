'use strict';
// Desktop/mobile character preview + evolution milestone regression (Node/V8, not screenshot).
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const css=fs.readFileSync(__dirname+'/ui-refresh-v124.css','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/i)?.[1];
assert.ok(script);new vm.Script(script);
const pos=id=>html.indexOf('id="'+id+'"');
for(const id of ['heroCanvas','statusCard','battleMetrics','rarityBadge','totalPower',
 'kind','voiceRoleName','characterDetails','creatureName','evolutionInfo','evolveBtn',
 'roster','journeySummary','rarityResearch','campaignRank']){
 assert.equal(html.split('id="'+id+'"').length-1,1,'one UI element: '+id);
}
assert.ok(pos('heroCanvas')<pos('statusCard')&&pos('statusCard')<pos('creatureName'),'stats at orange right of fighter, before name');
assert.ok(pos('battleMetrics')>pos('statusCard')&&pos('battleMetrics')<pos('characterDetails'),'combat bars are inside character panel');
assert.ok(pos('characterDetails')>pos('statusCard')&&pos('characterDetails')<pos('creatureName'),'DNA details consolidated into right side');
assert.ok(pos('creatureName')<pos('evolveBtn')&&pos('evolveBtn')<pos('fightBtn'),'level-side evolution, action buttons remain below');
assert.ok(pos('fightBtn')<pos('journeySummary')&&pos('journeySummary')<pos('onlineDrawer')&&pos('onlineDrawer')<pos('roster'),'exploration details immediately follow the start button');
assert.ok(pos('controlCard')<pos('rarityResearch'),'research moved below voice recording');
assert.ok(pos('fightBtn')<pos('onlineDrawer')&&pos('onlineDrawer')<pos('roster'),'rankings immediately below start controls');
assert.match(html,/id="saveBtn" type="button" hidden/,'manual save removed from UI');
assert.match(html,/<canvas id="heroCanvas" width="700" height="570"/,'full-width hero canvas fills back of stats');
assert.match(script,/drawCreature\(hc,cur,cx,288,1\.63,t\)/,'sprite enlarged and layered behind status panel');
assert.match(css,/\.stage \.preview-art\{\s*display:block;position:relative;isolation:isolate/,'full width overlapping preview');
assert.match(css,/\.stage \.preview-figure\{\s*position:absolute;z-index:0/,'large character sits behind info card');
assert.match(css,/\.stage \.preview-art>\.preview-stat-pane\{\s*position:relative;z-index:2/,'info card overlays the character');
assert.match(css,/@media\(max-width:730px\)/,'mobile-specific layout');
assert.match(css,/\.preview-stat-pane \.metrics\.combatbars\{display:grid;grid-template-columns:1fr/,'five combat bars in one readable column');
assert.match(css,/\.stage>\.nametag\.character-footer\{/,'name and evolution grouped together');
assert.doesNotMatch(html,/class="evolution-levels"/,'remove evolution levels strip');
assert.match(html,/id="evolveBtn" type="button" disabled>声を重ねて進化/,'single gated evolution button');
const growthModule={exports:{}};
vm.runInNewContext(fs.readFileSync(__dirname+'/progression-v134.js','utf8'),{module:growthModule});
const GROWTH=growthModule.exports;
const a=script.indexOf('function updateEvolutionUI(){'),b=script.indexOf('const researchStorageKey=',a);
assert.ok(a>=0&&b>a,'UI progression function exists');
const markup=script.slice(a,b);
const getClassList=()=>{const flags=new Map();return {toggle(k,v){flags.set(k,v)},contains(k){return flags.get(k)===true}}};
const steps=[];
const nodes={evolutionInfo:{textContent:''},evolveBtn:{disabled:false,textContent:''},rarityBadge:{textContent:'',dataset:{}}};
const fixture={GROWTH,cur:{seed:113,rarity:'S',level:5,evolutionVoices:[]},roster:[{seed:113}],
 recording:false,recordingRequestPending:false,match:null,document:{querySelectorAll:()=>steps},
 $:id=>nodes[id],levelOf:c=>c.level,rarityOf:c=>c.rarity};
fixture.evolutionEligible=()=>GROWTH.canEvolve(fixture.cur)&&fixture.roster.some(c=>c.seed===fixture.cur.seed)&&!fixture.recording&&!fixture.recordingRequestPending&&!fixture.match;
const ui=vm.runInNewContext(markup+';updateEvolutionUI',fixture);
function paint(level,used){fixture.cur.level=level;fixture.cur.evolutionVoices=Array.from({length:used},()=>({focus:'響き'}));ui();}
paint(5,0);assert.equal(nodes.evolveBtn.disabled,true);assert.match(nodes.evolutionInfo.textContent,/Lv\.10/);
paint(10,0);assert.equal(nodes.evolveBtn.disabled,false);assert.match(nodes.evolveBtn.title,/録音・試聴・録り直し・確定/);
paint(10,1);assert.equal(nodes.evolveBtn.disabled,true);assert.match(nodes.evolveBtn.title,/Lv\.20/);
paint(20,1);assert.equal(nodes.evolveBtn.disabled,false);
paint(30,2);assert.equal(nodes.evolveBtn.disabled,false);
paint(40,3);assert.equal(nodes.evolveBtn.disabled,true);assert.equal(nodes.evolveBtn.textContent,'進化完了');
assert.equal(nodes.rarityBadge.textContent,'S','selected rarity still shown');
console.log('PREVIEW LAYOUT v137 PASS | big overlay fighter, one evolution button, long battle action, relocated ranking/research');
