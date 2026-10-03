// ============================================================
// Cantiques EUJC — Générateur d'image de partage
// ============================================================
// Dessine une image du cantique sur un canvas 2D.
// 4 formats : 1:1 / 4:5 / 9:16 / 9:19
// ============================================================

const SHARE_FORMATS = {
  '1:1':  { width: 1080, height: 1080, maxCouplets: 1 },
  '4:5':  { width: 1080, height: 1350, maxCouplets: 4 },
  '9:16': { width: 1080, height: 1920, maxCouplets: 8 },
  '9:19': { width: 1080, height: 2280, maxCouplets: 99 }
};

let currentFormat = '1:1';

// ============================================================
// Palette (extraite de la charte)
// ============================================================
let P = {
  cream:       '#faf6ec',
  creamDark:   '#f2efe6',
  forest900:   '#081f19',
  forest700:   '#14392e',
  forest500:   '#2d5f4f',
  gold:        '#b8935a',
  goldLight:   '#e4c37f',
  goldPale:    '#f0dfb5',
  text:        '#1a1f1d',
  textMuted:   '#5a6660',
  textLight:   '#7b837e',
  refrain:     'rgba(184, 147, 90, 0.18)'
};

const SHARE_THEMES = {
  cream: P,
  forest: {
    cream:'#081f19', creamDark:'#14392e', forest900:'#061711', forest700:'#081f19',
    forest500:'#2d5f4f', gold:'#e4c37f', goldLight:'#f0dfb5', goldPale:'#f0dfb5',
    text:'#faf6ec', textMuted:'#e0e7e1', textLight:'#b8c7bd', refrain:'rgba(240, 223, 181, 0.14)'
  },
  midnight: {
    cream:'#101820', creamDark:'#18232d', forest900:'#0a1118', forest700:'#101820',
    forest500:'#243b53', gold:'#e4c37f', goldLight:'#f0dfb5', goldPale:'#f0dfb5',
    text:'#f7f4ed', textMuted:'#c5cbd2', textLight:'#a9b2bd', refrain:'rgba(228, 195, 127, 0.16)'
  },
  botanical: {
    cream:'#f1f3e8', creamDark:'#e4e9d9', forest900:'#1e3027', forest700:'#263e32',
    forest500:'#73866b', gold:'#8c7144', goldLight:'#b9a06a', goldPale:'#e4d8b6',
    text:'#243128', textMuted:'#5e6b5e', textLight:'#7c8778', refrain:'rgba(115, 134, 107, 0.18)'
  }
};

// ============================================================
// Attendre les polices
// ============================================================
async function waitFonts() {
  if (document.fonts && document.fonts.ready) {
    try { await document.fonts.ready; } catch(e) {}
  }
}

// ============================================================
// Choisir le format selon la longueur du cantique
// ============================================================
function autoFormatFor(hymn) {
  const version = (hymn.versions && hymn.versions[0]) || {};
  const content = version.content || [];
  const nCouplets = content.filter(b => b.type === 'source_block' || b.type === 'verse').length;
  const nTotal = content.length;

  if (nTotal <= 2)  return '1:1';
  if (nTotal <= 5)  return '4:5';
  if (nTotal <= 9)  return '9:16';
  return '9:19';
}

// ============================================================
// Récupérer le texte de la version
// ============================================================
function extractBlocks(version) {
  return (version.content || []).map(b => ({
    type: b.type,
    number: b.number || null,
    lines: b.lines || []
  }));
}

// ============================================================
// Découper le texte en lignes selon la largeur max
// ============================================================
function wrapText(ctx, text, maxWidth) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let current = '';

  for (const word of words) {
    const test = current ? current + ' ' + word : word;
    if (ctx.measureText(test).width <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// ============================================================
// Dessin du logo (livre doré simplifié)
// ============================================================
function drawBookLogo(ctx, cx, cy, size, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, size * 0.02);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  const w = size;
  const h = size * 0.75;
  const left  = cx - w / 2;
  const right = cx + w / 2;
  const top   = cy - h / 2;
  const bot   = cy + h / 2;
  const spineTop = top + h * 0.10;

  // Page gauche
  ctx.beginPath();
  ctx.moveTo(cx, spineTop);
  ctx.lineTo(left, top);
  ctx.lineTo(left, bot);
  ctx.lineTo(cx, bot - h * 0.05);
  ctx.closePath();
  ctx.stroke();

  // Page droite
  ctx.beginPath();
  ctx.moveTo(cx, spineTop);
  ctx.lineTo(right, top);
  ctx.lineTo(right, bot);
  ctx.lineTo(cx, bot - h * 0.05);
  ctx.closePath();
  ctx.stroke();

  // Reliure centrale
  ctx.beginPath();
  ctx.moveTo(cx, spineTop);
  ctx.lineTo(cx, bot - h * 0.05);
  ctx.stroke();

  // Lignes décoratives
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = Math.max(1, size * 0.012);
  for (let i = 0; i < 3; i++) {
    const y = top + h * 0.35 + i * h * 0.15;
    ctx.beginPath();
    ctx.moveTo(left + w * 0.10, y);
    ctx.lineTo(cx - w * 0.08, y + h * 0.04);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + w * 0.08, y + h * 0.04);
    ctx.lineTo(right - w * 0.10, y);
    ctx.stroke();
  }

  ctx.restore();
}

// ============================================================
// Dessin principal
// ============================================================
function drawImage(canvas, hymn, version, formatKey, themeKey = 'cream') {
  P = SHARE_THEMES[themeKey] || SHARE_THEMES.cream;
  const fmt = SHARE_FORMATS[formatKey];
  const W = fmt.width;
  const H = fmt.height;

  // Choisir l'échelle selon le format (limite Chrome Android ~4096px)
  const SS = (H * 2 > 4000) ? 1 : 2;
  canvas.width = W * SS;
  canvas.height = H * SS;
  canvas.style.width = '100%';
  canvas.style.height = 'auto';
  canvas.style.aspectRatio = `${W} / ${H}`;

  const ctx = canvas.getContext('2d');
  ctx.scale(SS, SS);

  // ---- Fond ----
  ctx.fillStyle = P.cream;
  ctx.fillRect(0, 0, W, H);

  // Bandeau décoratif en haut
  const headerH = 200;
  const grad = ctx.createLinearGradient(0, 0, 0, headerH);
  grad.addColorStop(0, P.forest700);
  grad.addColorStop(1, P.forest500);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, headerH);

  // ---- Logo + Nom en haut ----
  const centerX = W / 2;

  drawBookLogo(ctx, centerX, 90, 60, P.goldLight);

  ctx.font = '700 34px "Montserrat", "Inter", sans-serif';
  ctx.fillStyle = P.cream;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Cantiques EUJC', centerX, 148);

  ctx.font = 'italic 18px "Cormorant Garamond", Georgia, serif';
  ctx.fillStyle = 'rgba(250, 246, 236, 0.75)';
  ctx.fillText('Le recueil dans votre poche', centerX, 178);

  // ---- Numéro + Titre ----
  let y = headerH + 70;

  const sourceNum = version.source && version.source.number;
  if (sourceNum) {
    ctx.font = '700 20px "Montserrat", "Inter", sans-serif';
    ctx.fillStyle = P.gold;
    ctx.textAlign = 'center';
    ctx.fillText(`N° ${sourceNum}`, centerX, y);
    y += 40;
  }

  const title = (version.title || hymn.title || '').toUpperCase();
  ctx.font = '800 40px "Playfair Display", Georgia, serif';
  ctx.fillStyle = P.forest700;
  ctx.textAlign = 'center';

  const titleLines = wrapText(ctx, title, W - 120);
  for (const line of titleLines) {
    ctx.fillText(line, centerX, y);
    y += 48;
  }
  y += 8;

  // ---- Langue ----
  const lang = (version.language && version.language.label) || '';
  if (lang) {
    ctx.font = '500 18px "Open Sans", "Inter", sans-serif';
    ctx.fillStyle = P.textMuted;
    ctx.fillText(lang, centerX, y);
    y += 50;
  } else {
    y += 20;
  }

  // ---- Séparateur doré ----
  ctx.strokeStyle = P.goldLight;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(centerX - 50, y);
  ctx.lineTo(centerX + 50, y);
  ctx.stroke();
  y += 50;

  // ---- Paroles ----
  const blocks = extractBlocks(version);
  const paddingX = 80;
  const textMaxW = W - paddingX * 2;
  const lineH = 32;

  for (const block of blocks) {
    if (y > H - 220) break; // garde-fou

    if (block.type === 'refrain') {
      // Bloc beige
      const lines = [];
      for (const raw of block.lines) {
        const wrapped = wrapText(ctx, raw, textMaxW - 60);
        lines.push(...wrapped);
      }
      const blockH = lines.length * lineH + 60;

      ctx.fillStyle = P.refrain;
      roundRect(ctx, paddingX - 20, y - 26, W - paddingX * 2 + 40, blockH, 16);
      ctx.fill();

      ctx.font = '700 18px "Montserrat", "Inter", sans-serif';
      ctx.fillStyle = P.gold;
      ctx.textAlign = 'left';
      ctx.fillText('REFRAIN', paddingX, y);
      y += 34;

      ctx.font = '500 22px "Lora", "Open Sans", serif';
      ctx.fillStyle = P.text;
      for (const l of lines) {
        ctx.fillText(l, paddingX, y);
        y += lineH;
      }
      y += 30;
    } else if (block.type === 'comment') {
      // Commentaire : petit, italique, à gauche
      ctx.font = 'italic 18px "Lora", Georgia, serif';
      ctx.fillStyle = P.textMuted;
      ctx.textAlign = 'left';
      for (const raw of block.lines) {
        const wrapped = wrapText(ctx, raw, textMaxW);
        for (const l of wrapped) {
          ctx.fillText(l, paddingX, y);
          y += 26;
        }
      }
      y += 20;
    } else {
      // Couplet avec numéro
      const numMatch = block.lines[0] && block.lines[0].match(/^(\d+)\.\s*/);
      const num = numMatch ? numMatch[1] : null;
      const startIdx = numMatch ? 0 : 0;
      const lines = [];

      for (let i = startIdx; i < block.lines.length; i++) {
        let raw = block.lines[i];
        if (i === 0 && numMatch) raw = raw.replace(/^\d+\.\s*/, '');
        const wrapped = wrapText(ctx, raw, textMaxW - (num ? 40 : 0));
        lines.push(...wrapped);
      }

      ctx.textAlign = 'left';
      if (num) {
        ctx.font = '700 22px "Montserrat", "Inter", sans-serif';
        ctx.fillStyle = P.forest700;
        ctx.fillText(`${num}.`, paddingX, y);
      }

      ctx.font = '500 22px "Lora", "Open Sans", serif';
      ctx.fillStyle = P.text;
      const textX = paddingX + (num ? 40 : 0);
      for (const l of lines) {
        ctx.fillText(l, textX, y);
        y += lineH;
      }
      y += 26;
    }
  }

  // ---- Badge bas de page ----
  const badgeH = 140;
  const badgeY = H - badgeH;

  ctx.fillStyle = P.forest700;
  ctx.fillRect(0, badgeY, W, badgeH);

  // Logo mini + texte
  drawBookLogo(ctx, 100, badgeY + badgeH / 2, 44, P.goldLight);

  ctx.font = '700 22px "Montserrat", "Inter", sans-serif';
  ctx.fillStyle = P.cream;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Cantiques EUJC', 150, badgeY + badgeH / 2 - 10);

  ctx.font = 'italic 14px "Cormorant Garamond", Georgia, serif';
  ctx.fillStyle = 'rgba(250, 246, 236, 0.7)';
  ctx.fillText('Le recueil dans votre poche', 150, badgeY + badgeH / 2 + 16);

  // Lien site
  ctx.font = '500 13px "Open Sans", "Inter", sans-serif';
  ctx.fillStyle = P.goldLight;
  ctx.textAlign = 'right';
  ctx.fillText(window.location.host || 'Cantiques EUJC', W - 60, badgeY + badgeH / 2 + 4);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// ============================================================
// API publique
// ============================================================
window.ShareImage = {
  generate(canvas, hymn, version, formatKey, themeKey = 'cream') {
    currentFormat = formatKey;
    drawImage(canvas, hymn, version, formatKey, themeKey);
  },

  autoFormatFor(hymn) {
    return autoFormatFor(hymn);
  },

  waitFonts,

  async toBlob(canvas) {
    return new Promise(resolve => canvas.toBlob(resolve, 'image/png', 0.92));
  }
};

console.log('[ShareImage] Chargé');
