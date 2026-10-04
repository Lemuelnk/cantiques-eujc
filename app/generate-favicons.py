#!/usr/bin/env python3
"""Genere favicons, apple-touch-icon et OG image pour Cantiques EUJC."""
import os
from PIL import Image, ImageDraw, ImageFont

SOURCE = 'app/assets/logo/logo-gold.png'
OUT_ROOT = 'app'
OUT_ICONS = 'app/assets/icons'

BG_DEEP = (7, 26, 20)
BG_MID = (13, 46, 34)
GOLD = (201, 164, 74)
GOLD_LIGHT = (232, 197, 106)
CREAM = (250, 246, 236)

os.makedirs(OUT_ICONS, exist_ok=True)

logo = Image.open(SOURCE).convert('RGBA')
print('Source logo:', logo.size)


def save_square(src, size, out_path):
    canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    resized = src.resize((size, size), Image.LANCZOS)
    canvas.paste(resized, (0, 0), resized)
    canvas.save(out_path, 'PNG', optimize=True)
    print(f'  -> {out_path} ({size}x{size})')


# 1. Favicons PNG
save_square(logo, 16, f'{OUT_ROOT}/favicon-16x16.png')
save_square(logo, 32, f'{OUT_ROOT}/favicon-32x32.png')
save_square(logo, 48, f'{OUT_ROOT}/favicon-48x48.png')
save_square(logo, 180, f'{OUT_ROOT}/apple-touch-icon.png')

# 2. favicon.ico multi-taille
ico = logo.resize((48, 48), Image.LANCZOS)
ico.save(f'{OUT_ROOT}/favicon.ico', format='ICO',
         sizes=[(16, 16), (32, 32), (48, 48)])
print(f'  -> {OUT_ROOT}/favicon.ico (multi 16/32/48)')


# 3. OG Image 1200x630
def load_font(size, bold=True):
    candidates = [
        '/data/data/com.termux/files/usr/share/fonts/TTF/DejaVuSans-Bold.ttf',
        '/data/data/com.termux/files/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
        '/system/fonts/Roboto-Bold.ttf',
        '/system/fonts/DroidSans-Bold.ttf',
    ]
    for p in candidates:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


OG_W, OG_H = 1200, 630
og = Image.new('RGB', (OG_W, OG_H), BG_DEEP)
d = ImageDraw.Draw(og)

# Gradient vertical subtil
for y in range(OG_H):
    t = y / OG_H
    r = int(BG_MID[0] * (1 - t) + BG_DEEP[0] * t)
    g = int(BG_MID[1] * (1 - t) + BG_DEEP[1] * t)
    b = int(BG_MID[2] * (1 - t) + BG_DEEP[2] * t)
    d.line([(0, y), (OG_W, y)], fill=(r, g, b))

# Logo a gauche
LOGO_SIZE = 400
logo_og = logo.resize((LOGO_SIZE, LOGO_SIZE), Image.LANCZOS)
og.paste(logo_og, (80, (OG_H - LOGO_SIZE) // 2), logo_og)

# Textes a droite
text_x = 540
f_title = load_font(72, bold=True)
f_sub = load_font(32, bold=False)
f_url = load_font(22, bold=False)

title = 'Cantiques EUJC'
subtitle = 'Le recueil dans votre poche'
url_text = 'cantiques-eujc.lnk-studio.com'

# Mesures
tb = d.textbbox((0, 0), title, font=f_title)
th = tb[3] - tb[1]
sb = d.textbbox((0, 0), subtitle, font=f_sub)
sh = sb[3] - sb[1]
ub = d.textbbox((0, 0), url_text, font=f_url)
uh = ub[3] - ub[1]

gap1 = 24
gap2 = 60
total_h = th + gap1 + sh + gap2 + uh
y_start = (OG_H - total_h) // 2

d.text((text_x, y_start), title, font=f_title, fill=GOLD_LIGHT)
d.text((text_x, y_start + th + gap1), subtitle, font=f_sub, fill=CREAM)
d.text((text_x, y_start + th + gap1 + sh + gap2), url_text,
       font=f_url, fill=GOLD)

# Ligne d'accents doree verticale entre logo et texte
d.rectangle([500, y_start - 10, 504, y_start + total_h + 10], fill=GOLD)

og.save(f'{OUT_ROOT}/og-image.png', 'PNG', optimize=True)
print(f'  -> {OUT_ROOT}/og-image.png ({OG_W}x{OG_H})')

print('OK')
