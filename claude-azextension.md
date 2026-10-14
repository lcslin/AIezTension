# AIezTension — Extension Summary

## Purpose
Chrome extension for `aieztrade.com` with two features:
1. **Disable background videos and animations** on page load, with an automatically expanded Chinese control panel
2. **Captcha security demo** — intercepts plaintext `vCode` from login API and auto-fills the input

## Security Finding
`GET https://api.aieztrade.com/api/login/captcha/0` returns:
```json
{ "vCode": "8505", "vCodeEncode": "uuid", "captchaString": "base64-gif..." }
```
`vCode` is plaintext in the response — a client receiving the response can read it before the user types anything. This undermines the CAPTCHA's anti-automation purpose. The demo does not establish whether server-side validation exists, and does not bypass account credentials.

## Files
| File | Role |
|------|------|
| `manifest.json` | MV3, `world: MAIN`, `activeTab` + `scripting` |
| `content.js` | Auto-kills video; armed fetch interceptor for captcha |
| `popup.html/js` | English animation toggle, sharing state with the page panel via `executeScript` |
| `Ai.png` | Original icon, also displayed in the page panel |
| `icon16/32/48/128.png` | Sized extension icons; `icon128.png` is the Chrome Web Store icon with 16 px transparent padding |

## Key Architecture Decisions

**`world: "MAIN"`** — content script must run in the page's JS context to override `window.fetch`. Isolated world cannot intercept the page's own fetch calls.

**Armed interceptor** — fetch override only activates after user clicks `#btnMenu` (login icon), preventing false triggers.

**MutationObserver fill** — after fetch returns `vCode`, waits for the captcha `<input>` to appear in DOM before filling (dialog may not be rendered yet).

**Page controls** — the AIezTension panel opens automatically on matching pages. It uses concise Chinese labels, displays the original icon, and sits vertically centered at the right edge with a 340 px width. Animations and background videos are disabled by default; both the panel and toolbar popup use `window.__aisTensionSetAnimationsEnabled` to update the same state. The page panel embeds the icon as a data URL because its script runs in the MAIN world.

**Captcha dialog** — a Chinese native modal in a Shadow DOM displays the code after autofill with a brief critique of sending the answer to the browser while asking humans to solve the image. It has no animations and supports closing with its buttons, Escape, or the backdrop.

**Flat appearance** — the page panel and captcha dialog use opaque solid colors without gradients, glows, or shadows. The panel can collapse to its icon and reopen by clicking it; its exit button hides the panel without changing animation settings. The dialog has an exit button and an explicit Escape-to-close hint.

**Video kill** — `HTMLVideoElement.pause()` + `visibility: hidden` on load, plus MutationObserver to catch dynamically inserted `<video>` elements (homepage uses `background.mp4`, `/trade-index` uses `/video/pc/1.mp4`).

## Permissions
```json
"permissions": ["scripting", "activeTab"],
"host_permissions": ["https://www.aieztrade.com/*"]
```
- `host_permissions` triggers Chrome Web Store deep review (unavoidable for auto-inject)
- Single specific domain minimises review scope
- Justification for reviewers: auto-pause video on load requires content script; MAIN world fetch intercept requires host permission

## Store Listing
- **Name**: AIezTension
- **Description** (124 chars): Pauses background video on aieztrade.com and demos a captcha security flaw: vCode is exposed in plaintext via the login API.
- **Package**: `aztension-v1.0.0.zip` (16KB)
