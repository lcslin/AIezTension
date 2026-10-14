const toggle = document.getElementById('animToggle');

// 讀取目前 tab 的動畫狀態
chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    world: 'MAIN',
    func: () => typeof window.__aisTensionSetAnimationsEnabled === 'function' ? window.__animPaused : null
  }, (results) => {
    if (typeof results?.[0]?.result === 'boolean') {
      toggle.checked = results[0].result;
      toggle.disabled = false;
    }
  });
});

toggle.addEventListener('change', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      world: 'MAIN',
      func: (enable) => {
        window.__aisTensionSetAnimationsEnabled?.(enable);
      },
      args: [!toggle.checked]
    });
  });
});
