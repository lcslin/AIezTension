// Run locally with Playwright installed beside this file. Uses only a local fixture.
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const output = path.join(root, 'store-assets/images');
const chrome = process.env.CHROME_PATH || (process.platform === 'darwin'
  ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  : process.platform === 'win32' ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' : '/usr/bin/google-chrome');
const fixture = `<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><title>AIezTension 功能示範</title>
<style>
*{box-sizing:border-box}body{margin:0;color:#0f172a;background:#f1f5f9;font:16px/1.7 system-ui,sans-serif}
header{padding:24px 48px;background:#fff;border-bottom:1px solid #cbd5e1}header strong{font-size:24px}
small{display:block;color:#64748b}main{padding:48px;max-width:820px}h1{font-size:38px;margin:0 0 12px}
section{background:#fff;border:1px solid #cbd5e1;padding:24px;margin-top:24px;border-radius:8px}
label{display:block;margin:12px 0}input{padding:10px;border:1px solid #94a3b8;border-radius:4px;font:inherit}
button{background:#0f172a;color:white;border:0;border-radius:4px;padding:12px 20px;font:inherit;cursor:pointer}
.ambient{height:64px;background:#e2e8f0;margin-top:20px;animation:demo 2s infinite alternate}
@keyframes demo{to{background:#c7d2fe}}
</style><header><strong>AIezTension 功能示範頁</strong><small>本機示範資料 · 非 aieztrade.com 正式頁面</small></header>
<main><h1>讓頁面安靜下來</h1><p>右側為套件中的實際控制面板。移除動畫、縮為 Icon，或按離開。</p>
<section><h2>動畫控制示範</h2><p>預設停用背景影片與動畫；取消勾選可恢復。</p><div class="ambient"></div></section>
<section><h2>驗證碼對話框示範</h2><p>此頁只回傳示範值 8505，不會登入或連線至正式網站。</p>
<label>驗證碼 <input placeholder="驗證碼" aria-label="驗證碼"></label><button id="btnMenu">開啟登入示範</button></section></main>
<script src="/content.js"></script><script>document.querySelector('#btnMenu').addEventListener('click',()=>fetch('/api/login/captcha/0'));</script></html>`;
const server = http.createServer((req,res) => {
  res.setHeader('Cache-Control','no-store');
  if (req.url === '/content.js') {
    res.setHeader('Content-Type','application/javascript; charset=utf-8');
    res.end(fs.readFileSync(path.join(root,'content.js')));
  } else if (req.url === '/api/login/captcha/0') {
    res.setHeader('Content-Type','application/json');res.end(JSON.stringify({vCode:'8505'}));
  } else if (req.url === '/') {
    res.setHeader('Content-Type','text/html; charset=utf-8');res.end(fixture);
  } else {res.writeHead(404);res.end();}
});
(async()=>{
  let browser;
  try {
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    browser=await chromium.launch({executablePath:chrome,headless:true});
    const page=await browser.newPage({viewport:{width:1280,height:800},deviceScaleFactor:1});
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.addInitScript(()=>{
      // Retain handles only for this local capture; keep production closed Shadow DOM behavior.
      window.__captureRoots=[];
      const original=Element.prototype.attachShadow;
      Element.prototype.attachShadow=function(options){
        const shadow=original.call(this,options);window.__captureRoots.push({host:this,shadow});return shadow;
      };
    });
    await page.goto(`http://127.0.0.1:${server.address().port}/`);
    await page.waitForFunction(()=>!!document.getElementById('__ais-tension-panel__'));
    await page.evaluate(()=>document.fonts.ready);
    assert.equal(await page.evaluate(()=>window.__animPaused),true);
    assert.equal(await page.locator('.ambient').evaluate(el=>getComputedStyle(el).animationName),'none');
    await page.screenshot({path:path.join(output,'screenshot-01-panel-1280x800.png')});
    const panelAction=async selector=>page.evaluate(selector=>{
      const root=window.__captureRoots.find(entry=>entry.host.id==='__ais-tension-panel__').shadow;
      root.querySelector(selector).click();
    },selector);
    await panelAction('input');
    assert.equal(await page.evaluate(()=>window.__animPaused),false);
    assert.equal(await page.locator('.ambient').evaluate(el=>getComputedStyle(el).animationName),'demo');
    await panelAction('input');
    assert.equal(await page.evaluate(()=>window.__animPaused),true);
    await panelAction('.minimize');
    assert.equal(await page.evaluate(()=>window.__captureRoots[0].shadow.querySelector('details').open),false);
    await page.screenshot({path:path.join(output,'screenshot-02-icon-1280x800.png')});
    await panelAction('summary');
    assert.equal(await page.evaluate(()=>window.__captureRoots[0].shadow.querySelector('details').open),true);
    await page.getByRole('button',{name:'開啟登入示範'}).click();
    await page.waitForFunction(()=>window.__captureRoots.some(entry=>entry.shadow.querySelector('dialog')?.open));
    assert.equal(await page.locator('input[placeholder="驗證碼"]').inputValue(),'8505');
    await page.screenshot({path:path.join(output,'screenshot-03-captcha-1280x800.png')});
    await page.keyboard.press('Escape');
    await page.waitForFunction(()=>!window.__captureRoots.some(entry=>entry.host.isConnected&&entry.shadow.querySelector('dialog')?.open));
    await panelAction('.exit');
    assert.equal(await page.locator('#__ais-tension-panel__').count(),0);
    assert.deepEqual(errors,[]);
    console.log('Captured 3 actual UI renderings on the labeled demo page; animation toggle, icon collapse/restore, autofill, Escape and Exit passed.');
  } finally {
    if(browser) await browser.close();
    await new Promise(resolve=>server.close(resolve));
  }
})().catch(error=>{console.error(error.message);process.exitCode=1;});
