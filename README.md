# AIezTension

Chrome extension for `https://www.aieztrade.com/` that disables background videos and animations by default and demonstrates plaintext captcha answers exposed in the site's login API response.

## Install locally

1. Open `chrome://extensions` and enable Developer mode.
2. Select **Load unpacked** and choose this project directory.
3. Open the supported website. The page panel opens automatically; use its checkbox to control animations, collapse it to the icon, or hide it with Exit.

When the site's login response includes `vCode`, the extension displays a Chinese explanation and fills the captcha field. This demonstrates answer exposure; it does not bypass account credentials or establish how the server validates the response.

## Store materials

Upload `store-assets/AIezTension-1.0.1.zip` as the extension package. The separate store-materials ZIP contains promotional images, labeled interface illustrations, listing text, and a privacy policy draft. See `store-assets/UPLOAD-GUIDE.txt` for the remaining screenshot and privacy-policy hosting steps.

The extension processes captcha data locally without storing it or sending it to the developer. It is an independent tool and is not affiliated with aieztrade.com.
