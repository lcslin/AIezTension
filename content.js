// ── Auto-kill background video on load ──────────────────────────
window.__animPaused = true;
const pausedAnimations = new Set();
const videoVisibility = new WeakMap();
let animationToggle;
let animationStatus;

function pauseVideo(video) {
  if (!videoVisibility.has(video)) videoVisibility.set(video, video.style.visibility);
  video.pause();
  video.style.visibility = 'hidden';
}

function killVideos() {
  if (window.__animPaused) document.querySelectorAll('video').forEach(pauseVideo);
}

// 攔截動態插入的 video
new MutationObserver(mutations => {
  if (!window.__animPaused) return;
  for (const m of mutations) {
    for (const node of m.addedNodes) {
      if (node.nodeName === 'VIDEO') pauseVideo(node);
      node.querySelectorAll?.('video').forEach(pauseVideo);
    }
  }
}).observe(document.documentElement, { childList: true, subtree: true });

// Catch autoplay attempts, including videos inserted after the panel opens.
document.addEventListener('play', event => {
  if (window.__animPaused && event.target instanceof HTMLVideoElement) pauseVideo(event.target);
}, true);

window.__aisTensionSetAnimationsEnabled = function (enabled) {
  window.__animPaused = !enabled;
  const styleId = '__anim-kill__';
  if (enabled) {
    document.getElementById(styleId)?.remove();
    pausedAnimations.forEach(animation => { if (animation.playState === 'paused') animation.play(); });
    pausedAnimations.clear();
    document.querySelectorAll('video').forEach(video => {
      if (!videoVisibility.has(video)) return;
      video.style.visibility = videoVisibility.get(video);
      videoVisibility.delete(video);
      video.play()?.catch(() => {});
    });
  } else {
    let style = document.getElementById(styleId);
    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      document.documentElement.appendChild(style);
    }
    style.textContent = '*, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }';
    document.getAnimations().forEach(animation => {
      if (animation.playState === 'running') {
        pausedAnimations.add(animation);
        animation.pause();
      }
    });
    killVideos();
  }
  if (animationToggle) animationToggle.checked = !enabled;
  if (animationStatus) animationStatus.textContent = enabled ? '動畫已開啟' : '動畫已關閉';
};

function showControlPanel() {
  const host = document.createElement('div');
  host.id = '__ais-tension-panel__';
  host.lang = 'zh-Hant';
  const shadow = host.attachShadow({ mode: 'closed' });
  shadow.innerHTML = `
    <style>
      :host { all: initial; position: fixed; right: 20px; top: 50%; transform: translateY(-50%); z-index: 2147483647; }
      * { box-sizing: border-box; }
      details { width: min(340px, calc(100vw - 40px)); max-height: calc(100dvh - 32px); overflow: auto;
        border: 1px solid #384152; border-radius: 8px; background: #101025; color: #f8fafc;
        font: 16px/1.6 system-ui, sans-serif; }
      summary { cursor: pointer; list-style: none; padding: 22px 24px; font-size: 21px; font-weight: 800; color: #67e8f9; }
      summary::-webkit-details-marker { display: none; }
      details:not([open]) { width: 72px; }
      details:not([open]) summary { padding: 11px; }
      details:not([open]) .brand-name { display: none; }
      .brand { display: inline-flex; align-items: center; gap: 12px; vertical-align: middle; }
      .brand img { width: 48px; height: 48px; object-fit: contain; }
      .body { padding: 0 24px 24px; }
      label { display: flex; align-items: center; justify-content: space-between; gap: 12px; cursor: pointer; }
      input { width: 22px; height: 22px; accent-color: #8b5cf6; }
      p { margin: 10px 0 0; color: #a5b4fc; font-size: 14px; }
      .note { padding-top: 12px; border-top: 1px solid #384152; color: #aaaac4; }
      .actions { display: flex; gap: 10px; margin-top: 20px; }
      button { flex: 1; padding: 9px 12px; border: 1px solid #475569; border-radius: 4px;
        background: #202c40; color: #f8fafc; font: inherit; cursor: pointer; }
      button:hover { background: #334155; }
      summary:focus-visible, input:focus-visible, button:focus-visible { outline: 2px solid #67e8f9; outline-offset: 3px; }
    </style>
    <details open>
      <summary><span class="brand"><img src="data:image/png;base64,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" alt="" width="48" height="48"><span class="brand-name">AIezTension</span></span></summary>
      <div class="body">
        <label for="animations">Remove the annoying animations<input id="animations" type="checkbox"></label>
        <p id="status" role="status">動畫已關閉</p>
        <p class="note">登入時自動填入驗證碼</p>
        <div class="actions">
          <button class="minimize" type="button">縮為 Icon</button>
          <button class="exit" type="button">離開</button>
        </div>
      </div>
    </details>
  `;
  animationToggle = shadow.querySelector('input');
  animationStatus = shadow.querySelector('#status');
  animationToggle.checked = window.__animPaused;
  animationStatus.textContent = window.__animPaused ? '動畫已關閉' : '動畫已開啟';
  animationToggle.addEventListener('change', () => window.__aisTensionSetAnimationsEnabled(!animationToggle.checked));
  const panel = shadow.querySelector('details');
  const summary = shadow.querySelector('summary');
  summary.setAttribute('aria-label', '展開或收合 AIezTension');
  summary.title = '展開或收合 AIezTension';
  shadow.querySelector('.minimize').addEventListener('click', () => {
    panel.open = false;
    summary.focus();
  });
  shadow.querySelector('.exit').addEventListener('click', () => {
    host.remove();
    animationToggle = null;
    animationStatus = null;
  });
  document.documentElement.appendChild(host);
  // Include Web Animations started while the page was loading.
  window.__aisTensionSetAnimationsEnabled(!window.__animPaused);
}

window.__aisTensionSetAnimationsEnabled(false);
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', showControlPanel, { once: true });
} else {
  showControlPanel();
}

// ── Captcha intercept ───────────────────────────────────────────

// 只有在使用者點擊 #btnMenu 之後，才啟動攔截
let armed = false;

// 點 #btnMenu → 武裝攔截器
document.addEventListener('click', e => {
  if (e.target.closest('#btnMenu')) {
    armed = true;
  }
}, true);

// 攔截 fetch：在 armed 狀態下，GET /api/login/captcha → 拿 vCode 填入
const originalFetch = window.fetch;
window.fetch = async function (...args) {
  const response = await originalFetch.apply(this, args);
  const url = typeof args[0] === 'string' ? args[0] : args[0]?.url ?? '';

  if (armed && url.includes('/api/login/captcha')) {
    armed = false; // 重置，只填一次
    const clone = response.clone();
    clone.json().then(data => {
      if (data?.vCode) waitForInputAndFill(data.vCode);
    }).catch(() => {});
  }

  return response;
};

function waitForInputAndFill(vCode) {
  const input = document.querySelector('input[placeholder*="驗證碼"]');
  if (input) {
    fillCaptchaInput(input, vCode);
    return;
  }
  // dialog 還沒 render，等 input 出現
  const obs = new MutationObserver(() => {
    const input = document.querySelector('input[placeholder*="驗證碼"]');
    if (input) {
      obs.disconnect();
      fillCaptchaInput(input, vCode);
    }
  });
  obs.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(() => obs.disconnect(), 3000);
}

function fillCaptchaInput(input, vCode) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  setter.call(input, vCode);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
  showCaptchaDialog(vCode);
}

let captchaDialogHost;

function showCaptchaDialog(vCode) {
  captchaDialogHost?.remove();
  const previousFocus = document.activeElement;
  const host = document.createElement('div');
  host.lang = 'zh-Hant';
  captchaDialogHost = host;
  // Keep the page's CSS and animation toggle from affecting the dialog.
  const shadow = host.attachShadow({ mode: 'closed' });
  shadow.innerHTML = `
    <style>
      :host { all: initial; }
      * { box-sizing: border-box; }
      dialog {
        position: fixed; inset: 0; margin: auto;
        width: min(480px, calc(100vw - 32px)); max-height: calc(100dvh - 32px);
        padding: 0; overflow: auto; border: 1px solid #384152; border-radius: 8px;
        color: #f8fafc; background: #101025;
        font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
      }
      dialog::backdrop { background: #161b22; }
      .card { position: relative; padding: 38px 28px 28px; text-align: center; overflow: hidden; }
      .card > * { position: relative; }
      button { font: inherit; cursor: pointer; }
      .close {
        position: absolute; top: 14px; right: 14px; width: 32px; height: 32px;
        border: 1px solid #475569; border-radius: 4px; background: #202c40;
        color: #cbd5e1; font-size: 22px; line-height: 1;
      }
      .badge {
        display: inline-flex; align-items: center; gap: 8px; padding: 7px 12px;
        border: 1px solid #155e75; border-radius: 4px; background: #164e63;
        color: #67e8f9; font-size: 11px; font-weight: 800; letter-spacing: 2px;
      }
      .badge::before {
        content: ''; width: 7px; height: 7px; border-radius: 50%; background: #22d3ee;
      }
      h2 { margin: 22px 0 8px; font-size: 28px; font-weight: 900; letter-spacing: -1px; }
      .subtitle { margin: 0; color: #aaaac4; font-size: 14px; line-height: 1.7; }
      .code {
        margin: 26px 0 18px; padding: 24px 12px; border: 1px solid #475569;
        border-radius: 4px; background: #1e293b;
      }
      .code-label { color: #a5b4fc; font-size: 10px; font-weight: 700; letter-spacing: 3px; }
      .digits {
        display: block; margin-top: 8px; font-family: ui-monospace, monospace;
        font-size: clamp(32px, 12vw, 58px); font-weight: 900; letter-spacing: 8px;
        color: #e9d5ff; overflow-wrap: anywhere;
      }
      .status { margin: 0 0 24px; color: #86efac; font-size: 13px; }
      .explanation {
        margin: 0 0 24px; padding: 18px; text-align: left; border: 1px solid #384152;
        border-radius: 4px; background: #1e293b; color: #cbd5e1; font-size: 14px; line-height: 1.8;
      }
      .explanation h3 { margin: 0 0 6px; color: #e9d5ff; font-size: 14px; }
      .explanation p { margin: 0; }
      .explanation h3:not(:first-child) { margin-top: 14px; }
      .explanation code { color: #67e8f9; font-family: ui-monospace, monospace; }
      .continue {
        width: 100%; padding: 14px; border: 0; border-radius: 4px;
        background: #6d28d9; color: white; font-weight: 800;
      }
      .continue:hover { filter: brightness(1.15); }
      .close:hover { background: #334155; }
      button:focus-visible { outline: 3px solid #67e8f9; outline-offset: 4px; }
      .footer { margin: 18px 0 0; color: #8888a8; font-size: 10px; letter-spacing: 1px; }
    </style>
    <dialog aria-labelledby="captcha-title" aria-describedby="captcha-description">
      <div class="card">
        <button class="close" type="button" aria-label="關閉">×</button>
        <div class="badge">驗證碼設計缺陷</div>
        <h2 id="captcha-title">明文驗證碼已取得 ✦</h2>
        <p class="subtitle" id="captcha-description">答案隨 API 回應送到了瀏覽器</p>
        <div class="code">
          <span class="code-label">本次驗證碼</span>
          <strong class="digits"></strong>
        </div>
        <p class="status">✓ 已自動填入登入欄位</p>
        <section class="explanation" aria-label="設計缺陷說明">
          <p>答案明文送，機器輕鬆用；真人白費功，防護一場空。</p>
        </section>
        <button class="continue" type="button" autofocus>離開</button>
        <p class="subtitle" style="margin-top:12px">按 Esc 關閉</p>
        <p class="footer">AIezTension · 設計缺陷示範</p>
      </div>
    </dialog>
  `;
  // API content is text, never HTML.
  shadow.querySelector('.digits').textContent = String(vCode);
  const dialog = shadow.querySelector('dialog');
  const close = () => dialog.close();
  shadow.querySelector('.close').addEventListener('click', close);
  shadow.querySelector('.continue').addEventListener('click', close);
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right ||
        event.clientY < rect.top || event.clientY > rect.bottom)) close();
  });
  dialog.addEventListener('close', () => {
    host.remove();
    if (captchaDialogHost === host) captchaDialogHost = null;
    if (previousFocus?.isConnected) previousFocus.focus();
  }, { once: true });
  document.documentElement.appendChild(host);
  dialog.showModal();
}
