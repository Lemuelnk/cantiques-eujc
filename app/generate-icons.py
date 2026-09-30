#!/usr/bin/env python3
"""
Génère les icônes PWA pour Cantiques EUJC.
Design : livre ouvert doré sur fond vert forêt dégradé.
"""
from PIL import Image, ImageDraw, ImageFilter
import os

# --- Palette ---
BG_DEEP    = (7, 26, 20)       # #071a14
BG_MID     = (13, 46, 34)      # #0d2e22
BG_LIGHT   = (19, 61, 45)      # #133d2d
GOLD       = (201, 164, 74)    # #c9a44a
GOLD_LIGHT = (232, 197, 106)   # #e8c56a
GOLD_DARK  = (156, 123, 46)    # #9c7b2e

OUT_DIR = 'assets/icons'
os.makedirs(OUT_DIR, exist_ok=True)

# --- Résolution de travail (x4 pour anti-aliasing) ---
SIZE = 512
SS   = 4                # supersampling
W    = SIZE * SS


def make_radial_gradient(size, inner, outer):
    """Crée un dégradé radial doux."""
    img = Image.new('RGB', (size, size), outer)
    draw = ImageDraw.Draw(img)
    cx, cy = size / 2, size / 2
    max_r = size / 1.4
    # Approximation par cercles concentriques
    for i in range(int(max_r), 0, -1):
        t = i / max_r                     # 1 → 0
        r = int(inner[0] * (1 - t) + outer[0] * t)
        g = int(inner[1] * (1 - t) + outer[1] * t)
        b = int(inner[2] * (1 - t) + outer[2] * t)
        draw.ellipse(
            [cx - i, cy - i, cx + i, cy + i],
            fill=(r, g, b)
        )
    return img


def draw_book(draw, size, safe=1.0):
    """
    Dessine un livre ouvert stylisé (deux pages en V renversé).
    `safe` : coefficient de réduction pour respecter la safe zone maskable.
    """
    cx, cy = size / 2, size / 2
    # Échelle du livre
    book_w = size * 0.60 * safe
    book_h = size * 0.48 * safe
    left  = cx - book_w / 2
    right = cx + book_w / 2
    top   = cy - book_h / 2 + size * 0.02 * safe
    bot   = cy + book_h / 2 + size * 0.02 * safe
    spine_x = cx
    spine_top = top + book_h * 0.08
    spine_bot = bot

    # --- Remplissage subtil des pages (dégradé doré) ---
    # (dessiné en plusieurs bandes pour simuler un dégradé vertical)
    steps = 40
    for i in range(steps):
        t = i / steps
        y1 = top + (bot - top) * t
        y2 = top + (bot - top) * (t + 1/steps)
        r = int(GOLD_LIGHT[0] * (1 - t) + GOLD_DARK[0] * t)
        g = int(GOLD_LIGHT[1] * (1 - t) + GOLD_DARK[1] * t)
        b = int(GOLD_LIGHT[2] * (1 - t) + GOLD_DARK[2] * t)
        color = (r, g, b)

        # Page gauche
        draw.polygon([
            (spine_x, spine_top + (spine_bot - spine_top) * t),
            (left, top + (bot - top) * t * 0.9),
            (left, top + (bot - top) * (t + 1/steps) * 0.9),
            (spine_x, spine_top + (spine_bot - spine_top) * (t + 1/steps)),
        ], fill=color)

        # Page droite
        draw.polygon([
            (spine_x, spine_top + (spine_bot - spine_top) * t),
            (right, top + (bot - top) * t * 0.9),
            (right, top + (bot - top) * (t + 1/steps) * 0.9),
            (spine_x, spine_top + (spine_bot - spine_top) * (t + 1/steps)),
        ], fill=color)

    # --- Contour doré (bord du livre) ---
    lw = max(2, int(size * 0.008 * safe))
    # Page gauche
    draw.line([(left, top), (spine_x, spine_top)], fill=GOLD_LIGHT, width=lw)
    draw.line([(left, top), (left, bot - book_h*0.10)], fill=GOLD_LIGHT, width=lw)
    draw.line([(left, bot - book_h*0.10), (spine_x, spine_bot)],
              fill=GOLD_LIGHT, width=lw)
    # Page droite
    draw.line([(right, top), (spine_x, spine_top)], fill=GOLD_LIGHT, width=lw)
    draw.line([(right, top), (right, bot - book_h*0.10)], fill=GOLD_LIGHT, width=lw)
    draw.line([(right, bot - book_h*0.10), (spine_x, spine_bot)],
              fill=GOLD_LIGHT, width=lw)
    # Reliure centrale
    draw.line([(spine_x, spine_top), (spine_x, spine_bot)],
              fill=GOLD_LIGHT, width=lw)

    # --- Lignes de texte stylisées (petits traits dorés) ---
    line_color = GOLD_DARK
    line_w = max(1, int(size * 0.005 * safe))
    n_lines = 3
    for i in range(n_lines):
        t = 0.25 + i * 0.20
        y_top_left  = top + (spine_top - top) * t + (bot - top) * t * 0.55
        y_top_right = top + (spine_top - top) * t + (bot - top) * t * 0.55
        # Gauche
        x1 = left + book_w * 0.10
        x2 = spine_x - book_w * 0.08
        draw.line([(x1, y_top_left + book_h*0.06),
                   (x2, y_top_left + book_h*0.06)],
                  fill=line_color, width=line_w)
        # Droite
        x3 = spine_x + book_w * 0.08
        x4 = right - book_w * 0.10
        draw.line([(x3, y_top_right + book_h*0.06),
                   (x4, y_top_right + book_h*0.06)],
                  fill=line_color, width=line_w)


def generate_icon(path, size, maskable=False):
    """Génère une icône à la taille demandée."""
    # --- Fond dégradé radial ---
    bg = make_radial_gradient(W, BG_LIGHT, BG_DEEP)

    # --- Safe zone pour maskable (0.80) ---
    safe = 0.78 if maskable else 1.0

    # --- Dessin du livre ---
    overlay = Image.new('RGBA', (W, W), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # Ombre douce sous le livre
    shadow = Image.new('RGBA', (W, W), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow)
    sdraw.ellipse(
        [W*0.18, W*0.55, W*0.82, W*0.82],
        fill=(0, 0, 0, 90)
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(W * 0.04))
    bg = Image.alpha_composite(bg.convert('RGBA'), shadow)

    # Livre
    draw_book(draw, W, safe=safe)

    overlay = overlay.filter(ImageFilter.GaussianBlur(0))
    composed = Image.alpha_composite(bg, overlay)

    # --- Resize vers la taille finale ---
    final = composed.convert('RGB').resize((size, size), Image.LANCZOS)
    final.save(path, 'PNG', optimize=True)
    print(f'✅ {path} ({size}x{size}, maskable={maskable})')


# --- Génération des 3 icônes ---
generate_icon(f'{OUT_DIR}/icon-192.png', 192, maskable=False)
generate_icon(f'{OUT_DIR}/icon-512.png', 512, maskable=False)
generate_icon(f'{OUT_DIR}/icon-maskable-512.png', 512, maskable=True)

print()
print('🎉 Icônes générées avec succès')
