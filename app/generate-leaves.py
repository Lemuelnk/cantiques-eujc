#!/usr/bin/env python3
"""
Génère 2 images de feuillage décoratif en PNG transparent.
Style : feuilles organiques vert foncé avec dégradés.
"""
from PIL import Image, ImageDraw, ImageFilter
import math
import os

OUT_DIR = 'assets/share/leaves'
os.makedirs(OUT_DIR, exist_ok=True)

# Couleurs (vert forêt nuancé)
COLORS = {
    'dark':    (8, 31, 25),      # #081f19
    'mid':     (20, 57, 46),     # #14392e
    'light':   (45, 95, 79),     # #2d5f4f
    'accent':  (74, 124, 104),   # #4a7c68
}


def draw_leaf(draw, cx, cy, length, width, angle, color, opacity=255):
    """
    Dessine une feuille en forme d'amande.
    cx, cy : centre
    length : longueur
    width : largeur
    angle : rotation (radians)
    """
    # Points pour une feuille (2 arcs symétriques)
    points = []
    n = 40

    # Demi-côté 1
    for i in range(n + 1):
        t = i / n  # 0 → 1
        # Forme d'amande : largeur max au milieu
        w = width * math.sin(math.pi * t) / 2
        y = length * (t - 0.5)
        points.append((-w, y))

    # Demi-côté 2 (retour)
    for i in range(n, -1, -1):
        t = i / n
        w = width * math.sin(math.pi * t) / 2
        y = length * (t - 0.5)
        points.append((w, y))

    # Rotation
    cos_a, sin_a = math.cos(angle), math.sin(angle)
    rotated = [(x * cos_a - y * sin_a + cx, x * sin_a + y * cos_a + cy) for x, y in points]

    color_rgba = (*color, opacity)
    draw.polygon(rotated, fill=color_rgba)

    # Nervure centrale
    vein_end_x = cx - math.sin(angle) * length * 0.5
    vein_end_y = cy + math.cos(angle) * length * 0.5
    vein_start_x = cx + math.sin(angle) * length * 0.5
    vein_start_y = cy - math.cos(angle) * length * 0.5
    draw.line(
        [(vein_start_x, vein_start_y), (vein_end_x, vein_end_y)],
        fill=(*COLORS['dark'], opacity),
        width=max(1, int(width * 0.05))
    )


def generate_leaves_corner(size, corner='top-left', n_leaves=8):
    """
    Génère un feuillage dans un coin.
    size : (width, height)
    corner : 'top-left', 'top-right', 'bottom-left', 'bottom-right'
    """
    SS = 2
    W, H = size[0] * SS, size[1] * SS
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Point d'ancrage du feuillage selon le coin
    if corner == 'top-left':
        ax, ay = 0, 0
        angles_range = (0, math.pi / 2.2)  # 0 à ~82°
    elif corner == 'top-right':
        ax, ay = W, 0
        angles_range = (math.pi - math.pi / 2.2, math.pi)
    elif corner == 'bottom-left':
        ax, ay = 0, H
        angles_range = (-math.pi / 2.2, 0)
    else:  # bottom-right
        ax, ay = W, H
        angles_range = (math.pi, math.pi + math.pi / 2.2)

    # Générer les feuilles
    for i in range(n_leaves):
        # Distribution en éventail
        t = i / (n_leaves - 1) if n_leaves > 1 else 0.5
        angle = angles_range[0] + (angles_range[1] - angles_range[0]) * t

        # Longueur variable (plus longues au milieu)
        base_len = W * 0.35
        length = base_len * (0.6 + 0.6 * math.sin(math.pi * t)) * (0.85 + 0.3 * (i % 3) / 2)
        width = length * 0.42

        # Distance depuis l'ancre
        dist = length * 0.45

        cx = ax + math.cos(angle) * dist
        cy = ay + math.sin(angle) * dist

        # Couleur selon la profondeur
        if i % 3 == 0:
            color = COLORS['mid']
            opacity = 230
        elif i % 3 == 1:
            color = COLORS['dark']
            opacity = 255
        else:
            color = COLORS['light']
            opacity = 200

        draw_leaf(draw, cx, cy, length, width, angle, color, opacity)

    # Léger flou pour adoucir
    img = img.filter(ImageFilter.GaussianBlur(W * 0.004))

    # Redimensionner
    img = img.resize(size, Image.LANCZOS)
    return img


# ============================================================
# Génération
# ============================================================
print("Génération des feuillages...")

# Feuillage haut-gauche
leaves_top = generate_leaves_corner((800, 600), corner='top-left', n_leaves=9)
leaves_top.save(f'{OUT_DIR}/leaves-top.png', 'PNG', optimize=True)
print(f"  ✅ leaves-top.png ({os.path.getsize(f'{OUT_DIR}/leaves-top.png') / 1024:.1f} Ko)")

# Feuillage bas-droit (miroir)
leaves_bottom = generate_leaves_corner((800, 600), corner='bottom-right', n_leaves=8)
leaves_bottom.save(f'{OUT_DIR}/leaves-bottom.png', 'PNG', optimize=True)
print(f"  ✅ leaves-bottom.png ({os.path.getsize(f'{OUT_DIR}/leaves-bottom.png') / 1024:.1f} Ko)")

print()
print("🎉 Feuillages générés !")
