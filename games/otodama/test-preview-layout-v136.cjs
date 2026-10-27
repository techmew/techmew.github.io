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
assert.ok(pos('roster')<pos('journeySummary')&&pos('journeySummary')<pos('controlCard'),'exploration and rarity research separate from character info');
assert.match(html,/<canvas id="heroCanvas" width="460" height="590"/,'shrunken portrait preview canvas');
assert.match(script,/drawCreature\(hc,cur,cx,293,1\.02,t\)/,'preview character 30% smaller in drawing units');
assert.match(css,/\.stage \.preview-art\{\s*display:grid;grid-template-columns/,'two-column preview');
assert.match(css,/@media\(max-width:730px\)/,'mobile-specific layout');
assert.match(css,/\.preview-stat-pane \.metrics\.combatbars\{display:grid;grid-template-columns:1fr/,'five combat bars in one readable column');
assert.match(css,/\.stage>\.nametag\.character-footer\{/,'name and evolution grouped together');
for(const n of [10,20,30,40])assert.match(html,new RegExp('data-level="'+n+'"'),'visible evolution timeline '+n);
const growthModule={exports:{}};
vm.runInNewContext(fs.readFileSync(__dirname+'/progression-v134.js','utf8'),{module:growthModule});
const GROWTH=growthModule.exports;
const a=script.indexOf('function updateEvolutionUI(){'),b=script.indexOf('const researchStorageKey=',a);
assert.ok(a>=0&&b>a,'UI progression function exists');
const markup=script.slice(a,b);
const getClassList=()=>{const flags=new Map();return {toggle(k,v){flags.set(k,v)},contains(k){return flags.get(k)===true}}};
const steps=[10,20,30,40].map(level=>({dataset:{level:String(level)},classList:getClassList()}));
const nodes={evolutionInfo:{textContent:''},evolveBtn:{disabled:false,textContent:''},rarityBadge:{textContent:'',dataset:{}}};
const fixture={GROWTH,cur:{seed:113,rarity:'S',level:5,evolutionVoices:[]},roster:[{seed:113}],
 recording:false,recordingRequestPending:false,match:null,document:{querySelectorAll:()=>steps},
 $:id=>nodes[id],levelOf:c=>c.level,rarityOf:c=>c.rarity};
const ui=vm.runInNewContext(markup+';updateEvolutionUI',fixture);
function paint(level,used){fixture.cur.level=level;fixture.cur.evolutionVoices=Array.from({length:used},()=>({focus:'響き'}));ui();}
paint(5,0);assert.equal(nodes.evolveBtn.disabled,true);assert.match(nodes.evolutionInfo.textContent,/声 1\/4/);
assert.equal(steps[0].classList.contains('next'),true,'first next unlock at Lv10');
paint(10,0);assert.equal(nodes.evolveBtn.disabled,false);assert.equal(steps[0].classList.contains('unlocked'),true);
paint(10,1);assert.equal(nodes.evolveBtn.disabled,true);assert.equal(steps[1].classList.contains('next'),true);
paint(20,1);assert.equal(nodes.evolveBtn.disabled,false);assert.equal(steps[1].classList.contains('unlocked'),true);
paint(30,2);assert.equal(nodes.evolveBtn.disabled,false);
paint(40,3);assert.equal(nodes.evolveBtn.disabled,true);assert.equal(steps[3].classList.contains('at-max'),true);
assert.match(nodes.evolutionInfo.textContent,/Lv\.40/,'clear max level');
assert.equal(nodes.rarityBadge.textContent,'S','selected rarity still shown');
console.log('PREVIEW LAYOUT v136 PASS | portrait shrunk, orange-side consolidated stats, 10/20/30/40 unlocks, mobile grid, existing actions');
