from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json, shutil, zipfile

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'store-assets'
FONT = '/System/Library/Fonts/STHeiti Medium.ttc'
LATIN = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'
BG = '#101025'
TEXT = '#f8fafc'
MUTED = '#aaaac4'
CYAN = '#67e8f9'

# Render flat layouts at double resolution for smooth exported text.
class Canvas:
    def __init__(self, size):
        self.size = size
        self.image = Image.new('RGB', (size[0]*2, size[1]*2), BG)
        self.draw = ImageDraw.Draw(self.image)
    def rect(self, box, fill, outline=None, radius=0):
        self.draw.rounded_rectangle(tuple(round(v*2) for v in box), radius=radius*2, fill=fill, outline=outline, width=2)
    def text(self, xy, text, size, fill=TEXT, latin=False):
        font = ImageFont.truetype(LATIN if latin else FONT, size*2)
        self.draw.text((xy[0]*2, xy[1]*2), text, font=font, fill=fill, anchor='lt')
    def icon(self, xy, size):
        icon = Image.open(ROOT / 'Ai.png').convert('RGBA').resize((size*2, size*2), Image.Resampling.LANCZOS)
        self.image.paste(icon, (xy[0]*2, xy[1]*2), icon)
    def save(self, name):
        self.image.resize(self.size, Image.Resampling.LANCZOS).save(OUT / 'images' / name)

def panel(c, x, y, collapsed=False):
    if collapsed:
        c.rect((x,y,x+72,y+72),BG,'#384152',8)
        c.icon((x+11,y+11),48)
        return
    c.rect((x,y,x+340,y+296),BG,'#384152',8)
    c.icon((x+24,y+22),48)
    c.text((x+84,y+36),'AIezTension',21,CYAN,True)
    c.text((x+24,y+91),'Remove the annoying',16)
    c.text((x+24,y+115),'animations',16)
    c.rect((x+294,y+104,x+316,y+126),'#8b5cf6',radius=2)
    c.text((x+298,y+105),'✓',16)
    c.text((x+24,y+147),'動畫已關閉',14,'#a5b4fc')
    c.rect((x+24,y+180,x+316,y+181),'#384152')
    c.text((x+24,y+194),'登入時自動填入驗證碼',14,MUTED)
    for left, right, label in [(24,165,'縮為 Icon'),(175,316,'離開')]:
        c.rect((x+left,y+236,x+right,y+276),'#202c40','#475569',4)
        c.text((x+left+26,y+248),label,16)

def feature_base(number, title, description):
    c=Canvas((1280,800))
    c.icon((48,38),64)
    c.text((130,52),'AIezTension',32,CYAN,True)
    c.text((64,173),number,14,CYAN,True)
    c.text((64,208),title,44)
    c.text((64,283),description,21,MUTED)
    c.text((64,727),'介面示意 · 僅作用於 aieztrade.com',16,MUTED)
    return c

c=Canvas((440,280))
c.rect((0,0,440,6),CYAN)
c.icon((22,35),92)
c.text((124,61),'AIezTension',32,latin=True)
c.text((32,159),'讓頁面安靜下來',28)
c.text((32,220),'動畫控制 · 驗證碼示範',16,CYAN)
c.save('promo-small-440x280.png')

c=Canvas((1400,560))
c.rect((0,0,1400,8),CYAN)
c.icon((72,150),192)
c.text((302,170),'AIezTension',66,latin=True)
c.text((302,274),'讓頁面安靜下來',44)
c.text((302,370),'動畫控制 · 驗證碼設計缺陷示範',24,CYAN)
c.text((1130,490),'aieztrade.com',18,MUTED,True)
c.save('promo-marquee-1400x560.png')

c=feature_base('01 / ANIMATION CONTROL','少點動畫，多點專注','預設移除背景影片與動畫。')
c.text((64,370),'開啟頁面，自動展開控制面板',19)
c.text((64,410),'勾選即移除動畫，需要時再開啟',19,MUTED)
panel(c,820,252)
c.save('feature-01-animations-1280x800.png')

c=feature_base('02 / SIMPLE CONTROLS','縮成圖示，讓出空間','靠右置中，介面簡單。')
c.text((64,370),'縮為 Icon，點一下再展開',19)
c.text((64,410),'按「離開」即可隱藏面板',19,MUTED)
panel(c,740,230)
panel(c,1140,342,True)
c.text((1100,463),'縮為 Icon',18,CYAN)
c.save('feature-02-icon-1280x800.png')

c=feature_base('03 / CAPTCHA DEMO','答案明文送，防護一場空','說明登入 API 回傳答案的設計缺陷。')
c.text((64,370),'僅展示頁面收到的驗證碼',19)
c.text((64,410),'沒有略過帳號密碼',19,MUTED)
x,y=740,95
c.rect((x,y,x+480,y+570),BG,'#384152',8)
c.text((x+170,y+25),'驗證碼設計缺陷',14,CYAN)
c.text((x+76,y+65),'明文驗證碼已取得',28)
c.text((x+91,y+111),'答案隨 API 回應送到了瀏覽器',14,MUTED)
c.rect((x+28,y+150,x+452,y+293),'#1e293b','#475569',4)
c.text((x+199,y+172),'本次驗證碼',12,'#a5b4fc')
c.text((x+159,y+208),'8505',58,'#e9d5ff',True)
c.text((x+136,y+317),'✓ 已自動填入登入欄位',14,'#86efac')
c.rect((x+28,y+358,x+452,y+423),'#1e293b','#384152',4)
c.text((x+46,y+373),'答案明文送，機器輕鬆用；',16)
c.text((x+46,y+397),'真人白費功，防護一場空。',16)
c.rect((x+28,y+447,x+452,y+497),'#6d28d9',radius=4)
c.text((x+225,y+463),'離開',16)
c.text((x+195,y+517),'按 Esc 關閉',14,MUTED)
c.text((64,670),'圖中驗證碼為示範資料',16,CYAN)
c.save('feature-03-captcha-1280x800.png')

for size in (16,32,48,128):
    shutil.copy2(ROOT / f'icon{size}.png', OUT / 'images' / f'icon{size}.png')

manifest=json.loads((ROOT/'manifest.json').read_text())
package=OUT/f'AIezTension-{manifest["version"]}.zip'
files=['manifest.json','content.js','popup.html','popup.js','icon16.png','icon32.png','icon48.png','icon128.png']
with zipfile.ZipFile(package,'w',zipfile.ZIP_DEFLATED) as archive:
    for name in files:
        archive.write(ROOT/name,name)
with zipfile.ZipFile(package) as archive:
    assert archive.testzip() is None
    assert set(archive.namelist()) == set(files)
    packed=json.loads(archive.read('manifest.json'))
    assert packed['version']=='1.0.1'
    assert set(packed['permissions'])=={'scripting','activeTab'}
for p in (OUT/'images').glob('*.png'):
    with Image.open(p) as image:
        image.verify()
print(f'Built {package.name}, 2 promotional images, 3 labeled feature illustrations, and 4 icons.')
