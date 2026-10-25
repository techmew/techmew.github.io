"""Local progress export/import and biome hazard smoke test (Chromium)."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json

html=Path(__file__).with_name('index.html').read_text()
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':390,'height':844},accept_downloads=True)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.evaluate("window.__store={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem(k){return window.__store[k]??null},setItem(k,v){window.__store[k]=String(v)},removeItem(k){delete window.__store[k]}}})")
 page.evaluate("localStorage.setItem('otodama.progress',JSON.stringify({streak:2,best:4,wins:12,stage:6,stageWins:5,attempts:2}))")
 page.set_content(html,wait_until='domcontentloaded')
 assert 'STAGE 06' in page.locator('#adventureStage').inner_text()
 assert '第二章' in page.locator('#stageHint').inner_text()
 with page.expect_download() as info:page.locator('#exportSaveBtn').click()
 d=info.value;payload=json.loads(Path(d.path()).read_text())
 assert payload['progress']['adventureStage']==6 and payload['progress']['stageAttempts']==2
 assert payload['format']=='OTODAMA_SAVE' and 'voiceClip' not in json.dumps(payload)
 page.evaluate("localStorage.setItem('otodama.progress',JSON.stringify({stage:1}))")
 page.set_content(html,wait_until='domcontentloaded')
 assert 'STAGE 01' in page.locator('#adventureStage').inner_text()
 page.locator('#importSaveFile').set_input_files({'name':'progress.json','mimeType':'application/json','buffer':json.dumps(payload).encode()})
 page.wait_for_function("document.getElementById('adventureStage').textContent.includes('06')")
 assert '読み込みました' in page.locator('#saveNotice').inner_text()
 assert 'STAGE 06' in page.locator('#adventureStage').inner_text()
 assert '3人目' in page.locator('#stageHint').inner_text()
 page.locator('#importSaveFile').set_input_files({'name':'bad.json','mimeType':'application/json','buffer':b'{"format":"BAD"}'})
 page.wait_for_function("document.getElementById('saveNotice').textContent.includes('読み込み失敗')")
 assert 'STAGE 06' in page.locator('#adventureStage').inner_text()
 assert not errors,errors
 browser.close()
 print(json.dumps({'result':'PASS','save_export':True,'save_import':True,'invalid_file_rejected':True,'chapter_6':'第二章','errors':errors},ensure_ascii=False))
