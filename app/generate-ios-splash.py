#!/usr/bin/env python3
"""Genere les Apple Splash Screens pour la PWA Cantiques EUJC."""
import os
from PIL import Image, ImageDraw, ImageFont

SOURCE = 'app/assets/logo/logo-gold.png'
OUT_DIR = 'app/assets/splash'

BG_DEEP = (7, 26, 20)       # #071a14
BG_MID = (13, 46, 34)       # #0d2e22
GOLD_LIGHT = (232, 197, 106)

os.makedirs(OUT_DIR, exist_ok=True)

logo = Image.open(SOURCE).convert('RGBA')
print(f"Logo source : {logo.size}")


def load_font(size):
    for p in [
        '/data/data/com.termux/files/usr/share/fonts/TTF/DejaVuSans-Bold.ttf',
        '/system/fonts/Roboto-Bold.ttf',
        '/system/fonts/DroidSans-Bold.ttf',
    ]:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


# Tailles iOS a generer : (largeur, hauteur, orientation, label)
SIZES = [
    # iPhones recents
    (1290, 2796, 'portrait', 'iphone-15-pro-max'),
    (1179, 2556, 'portrait', 'iphone-15-pro'),
    (1284, 2778, 'portrait', 'iphone-14-plus'),
    (1170, 2532, 'portrait', 'iphone-14'),
    (1125, 2436, 'portrait', 'iphone-x'),
    (828, 1792, 'portrait', 'iphone-11'),
    (750, 1334, 'portrait', 'iphone-se'),
    (640, 1136, 'portrait', 'iphone-5'),
    # iPads
    (2048, 2732, 'portrait', 'ipad-pro-12'),
    (1668, 2388, 'portrait', 'ipad-pro-11'),
    (1640, 2360, 'portrait', 'ipad-air'),
    (1536, 2048, 'portrait', 'ipad-9'),
    (1488, 2266, 'portrait', 'ipad-mini'),
]

generated = []

for w, h, orient, slug in SIZES:
    # Fond degrade vertical
    canvas = Image.new('RGB', (w, h), BG_DEEP)
    d = ImageDraw.Draw(canvas)
    for y in range(h):
        t = y / h
        r = int(BG_MID[0] * (1 - t) + BG_DEEP[0] * t)
        g = int(BG_MID[1] * (1 - t) + BG_DEEP[1] * t)
        b = int(BG_MID[2] * (1 - t) + BG_DEEP[2] * t)
        d.line([(0, y), (w, y)], fill=(r, g, b))

    # Logo centre : taille = 22% de la largeur (min 200, max 400)
    logo_size = int(min(w, h) * 0.28)
    logo_size = max(200, min(logo_size, 500))
    logo_resized = logo.resize((logo_size, logo_size), Image.LANCZOS)
    logo_x = (w - logo_size) // 2
    logo_y = (h - logo_size) // 2
    canvas.paste(logo_resized, (logo_x, logo_y), logo_resized)

    # Texte sous le logo
    font = load_font(int(w * 0.045))
    title = "Cantiques EUJC"
    bbox = d.textbbox((0, 0), title, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    text_x = (w - tw) // 2
    text_y = logo_y + logo_size + int(h * 0.03)
    d.text((text_x, text_y), title, font=font, fill=GOLD_LIGHT)

    out = f'{OUT_DIR}/apple-splash-{w}x{h}.png'
    canvas.save(out, 'PNG', optimize=True)
    size_kb = os.path.getsize(out) // 1024
    print(f"  -> {out} ({size_kb} Ko)")
    generated.append((w, h, slug))

print(f"\nTotal : {len(generated)} splash screens")
