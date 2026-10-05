// ============================================================
// Cantiques EUJC — Générateur d'image de partage
// Composition adaptative : les paroles ne sont jamais tronquées.
// Les formats indiquent une hauteur minimale ; la toile s'allonge
// si le contenu ne tient pas, au lieu de supprimer des blocs.
// ============================================================

const SHARE_FORMATS = {
  '1:1':  { width: 1080, height: 1080, imageKey: '1x1',  label: 'Court' },
  '4:5':  { width: 1080, height: 1350, imageKey: '4x5',  label: 'Moyen' },
  '3:4':  { width: 1080, height: 1440, imageKey: '3x4',  label: 'Moyen +' },
  '2:3':  { width: 1080, height: 1620, imageKey: '2x3',  label: 'Long' },
  '9:16': { width: 1080, height: 1920, imageKey: '9x16', label: 'Long +' },
  '9:17': { width: 1080, height: 2040, imageKey: '9x17', label: 'Très long' },
  '9:18': { width: 1080, height: 2160, imageKey: '9x18', label: 'Très long +' },
  '9:19': { width: 1080, height: 2280, imageKey: '9x19', label: 'Max' }
};

const SHARE_THEMES = {
  cream: {
    background: '#faf6ec',
    image: 'assets/share/themes/theme-cream.jpg',
    logoVariant: 'dark',
    overlay: 'rgba(250, 246, 236, 0.60)',
    title: '#1e3a2e', text: '#1a241f', muted: '#5a6660', accent: '#a07a3d',
    accentLight: '#b8935a', refrain: 'rgba(184, 147, 90, 0.22)', comment: '#5a6660'
  },
  forest: {
    background: '#081f19',
    image: 'assets/share/themes/theme-forest.jpg',
    logoVariant: 'white',
    overlay: 'rgba(8, 31, 25, 0.55)',
    title: '#faf6ec', text: '#f2ede1', muted: '#c8d4c9', accent: '#e4c37f',
    accentLight: '#f0dfb5', refrain: 'rgba(240, 223, 181, 0.18)', comment: '#c8d4c9'
  },
  midnight: {
    background: '#101820',
    image: 'assets/share/themes/theme-midnight.jpg',
    logoVariant: 'white',
    overlay: 'rgba(10, 15, 25, 0.62)',
    title: '#f7f4ed', text: '#f0ede4', muted: '#c5cbd2', accent: '#e4c37f',
    accentLight: '#f0dfb5', refrain: 'rgba(228, 195, 127, 0.20)', comment: '#c5cbd2'
  },
  botanical: {
    background: '#f1f3e8',
    image: 'assets/share/themes/theme-botanical.jpg',
    logoVariant: 'dark',
    overlay: 'rgba(241, 243, 232, 0.62)',
    title: '#20382d', text: '#243128', muted: '#5e6b5e', accent: '#8c7144',
    accentLight: '#a8863a', refrain: 'rgba(115, 134, 107, 0.22)', comment: '#5e6b5e'
  }
};

const SHARE_BRAND = {
  name: 'Cantiques EUJC',
  tagline: 'Le recueil dans votre poche'
};

async function waitFonts() {
  if (document.fonts && document.fonts.ready) {
    try { await document.fonts.ready; } catch (_) {}
  }
}

function getBlocks(version) {
  return (Array.isArray(version && version.content) ? version.content : []).map(function(block) {
    return {
      type: ['refrain', 'comment', 'verse', 'source_block'].includes(block.type) ? block.type : 'source_block',
      number: block.number == null ? null : String(block.number),
      lines: Array.isArray(block.lines) ? block.lines.map(function(line) { return String(line == null ? '' : line); }) : []
    };
  });
}

function wrapText(ctx, text, maxWidth) {
  if (maxWidth <= 0) return [String(text || '')];
  const words = String(text == null ? '' : text).split(/\s+/);
  const lines = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? current + ' ' + word : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
      continue;
    }

    if (current) lines.push(current);
    current = '';
    let fragment = '';

    for (const char of word) {
      const test = fragment + char;
      if (fragment && ctx.measureText(test).width > maxWidth) {
        lines.push(fragment);
        fragment = char;
      } else {
        fragment = test;
      }
    }
    current = fragment;
  }

  if (current) lines.push(current);
  return lines.length ? lines : [''];
}

function measureLines(ctx, sourceLines, maxWidth) {
  return sourceLines.flatMap(function(line) { return wrapText(ctx, line, maxWidth); });
}

function setFont(ctx, weight, size, family) {
  ctx.font = weight + ' ' + size + 'px ' + family;
}

function drawBookLogo(ctx, cx, cy, size, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, size * 0.025);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  const w = size;
  const h = size * 0.7;
  const left = cx - w / 2;
  const right = cx + w / 2;
  const top = cy - h / 2;
  const bottom = cy + h / 2;

  ctx.beginPath();
  ctx.moveTo(cx, top + h * 0.08);
  ctx.lineTo(left, top);
  ctx.lineTo(left, bottom);
  ctx.lineTo(cx, bottom - h * 0.06);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx, top + h * 0.08);
  ctx.lineTo(right, top);
  ctx.lineTo(right, bottom);
  ctx.lineTo(cx, bottom - h * 0.06);
  ctx.closePath();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx, top + h * 0.08);
  ctx.lineTo(cx, bottom - h * 0.06);
  ctx.stroke();
  ctx.restore();
}

function prepareLayout(ctx, hymn, version, width, scale) {
  const marginX = Math.round(width * 0.075);
  const contentWidth = width - marginX * 2;
  const headerHeight = Math.round(170 * scale);
  const footerHeight = Math.round(112 * scale);
  const titleSize = Math.max(24, Math.round(39 * scale));
  const numberSize = Math.max(15, Math.round(19 * scale));
  const languageSize = Math.max(14, Math.round(17 * scale));
  const bodySize = Math.max(16, Math.round(22 * scale));
  const lineHeight = Math.round(bodySize * 1.48);
  const smallSize = Math.max(13, Math.round(16 * scale));
  const refrainLabelSize = Math.max(13, Math.round(16 * scale));
  const gap = Math.round(24 * scale);
  let y = headerHeight + Math.round(44 * scale);
  const elements = [];

  const sourceNumber = version && version.source ? version.source.number : null;
  if (sourceNumber !== null && sourceNumber !== undefined && String(sourceNumber).trim()) {
    elements.push({ type: 'source-number', text: 'N° ' + sourceNumber, y: y, size: numberSize });
    y += Math.round(numberSize * 1.9);
  }

  const title = String((version && version.title) || (hymn && hymn.title) || '').trim();
  setFont(ctx, '700', titleSize, '"Montserrat", "Inter", sans-serif');
  const titleLines = wrapText(ctx, title, contentWidth);
  elements.push({ type: 'title', lines: titleLines, y: y, size: titleSize });
  y += titleLines.length * Math.round(titleSize * 1.22) + Math.round(12 * scale);

  const language = String(version && version.language && version.language.label || '').trim();
  if (language) {
    elements.push({ type: 'language', text: language, y: y, size: languageSize });
    y += Math.round(languageSize * 2.2);
  } else {
    y += Math.round(12 * scale);
  }

  elements.push({ type: 'divider', y: y });
  y += Math.round(38 * scale);

  const blocks = getBlocks(version);
  for (const block of blocks) {
    if (!block.lines.length) continue;

    if (block.type === 'refrain') {
      setFont(ctx, '500', bodySize, '"Lora", "Open Sans", serif');
      const lines = measureLines(ctx, block.lines, contentWidth - Math.round(38 * scale));
      const labelHeight = Math.round(refrainLabelSize * 1.8);
      const paddingY = Math.round(15 * scale);
      const blockHeight = paddingY * 2 + labelHeight + lines.length * lineHeight;
      elements.push({
        type: 'refrain', lines: lines, y: y, height: blockHeight,
        size: bodySize, labelSize: refrainLabelSize, lineHeight: lineHeight, paddingY: paddingY
      });
      y += blockHeight + gap;
      continue;
    }

    if (block.type === 'comment') {
      setFont(ctx, 'italic', smallSize, '"Lora", Georgia, serif');
      const lines = measureLines(ctx, block.lines, contentWidth);
      const commentLineHeight = Math.round(smallSize * 1.5);
      elements.push({ type: 'comment', lines: lines, y: y, size: smallSize, lineHeight: commentLineHeight });
      y += lines.length * commentLineHeight + Math.round(18 * scale);
      continue;
    }

    // Un source_block n'est jamais numéroté par déduction.
    // Un verse n'affiche un numéro que si la donnée en fournit un.
    const hasExplicitNumber = block.type === 'verse' && block.number !== null;
    const numberGutter = hasExplicitNumber ? Math.round(46 * scale) : 0;
    setFont(ctx, '500', bodySize, '"Lora", "Open Sans", serif');
    const lines = measureLines(ctx, block.lines, contentWidth - numberGutter);
    elements.push({
      type: block.type, number: hasExplicitNumber ? block.number : null,
      lines: lines, y: y, size: bodySize, lineHeight: lineHeight, numberGutter: numberGutter
    });
    y += lines.length * lineHeight + Math.round(22 * scale);
  }

  return {
    width: width, scale: scale, marginX: marginX, contentWidth: contentWidth,
    headerHeight: headerHeight, footerHeight: footerHeight,
    elements: elements, requiredHeight: Math.ceil(y + Math.round(30 * scale) + footerHeight)
  };
}

function drawLines(ctx, lines, x, y, lineHeight) {
  for (const line of lines) {
    ctx.fillText(line, x, y);
    y += lineHeight;
  }
}

// ============================================================
// Chargement des images de thème (async, mis en cache)
// ============================================================
const THEME_IMAGES = {};
const THEME_LOGOS = {};

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image introuvable: ' + src));
    img.src = src;
  });
}

// Construit l'URL de l'image : theme-<theme>-<imageKey>.jpg
function themeImageUrl(themeKey, formatKey) {
  const fmt = SHARE_FORMATS[formatKey] || SHARE_FORMATS['1:1'];
  return 'assets/share/themes/theme-' + themeKey + '-' + fmt.imageKey + '.jpg';
}

async function ensureThemeImage(themeKey, formatKey) {
  const fmt = SHARE_FORMATS[formatKey] || SHARE_FORMATS['1:1'];
  const cacheKey = themeKey + '-' + fmt.imageKey;
  if (THEME_IMAGES[cacheKey]) return THEME_IMAGES[cacheKey];
  const url = themeImageUrl(themeKey, formatKey);
  try {
    THEME_IMAGES[cacheKey] = await loadImage(url);
    return THEME_IMAGES[cacheKey];
  } catch (e) {
    console.warn('[ShareImage]', e.message);
    return null;
  }
}

// Charge le logo selon la variante du thème
async function ensureLogo(themeKey) {
  const variant = (SHARE_THEMES[themeKey] || {}).logoVariant || 'dark';
  if (THEME_LOGOS[variant]) return THEME_LOGOS[variant];
  const url = 'assets/share/logo/logo-share-' + variant + '.png';
  try {
    THEME_LOGOS[variant] = await loadImage(url);
    return THEME_LOGOS[variant];
  } catch (e) {
    console.warn('[ShareImage]', e.message);
    return null;
  }
}


function drawImageCover(ctx, img, width, height) {
  const imgAspect = img.width / img.height;
  const canvasAspect = width / height;
  let sx, sy, sw, sh;
  if (imgAspect > canvasAspect) {
    sh = img.height;
    sw = img.height * canvasAspect;
    sx = (img.width - sw) / 2;
    sy = 0;
  } else {
    sw = img.width;
    sh = img.width / canvasAspect;
    sx = 0;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
}

function drawComposition(canvas, hymn, version, formatKey, themeKey) {
  const format = SHARE_FORMATS[formatKey] || SHARE_FORMATS['1:1'];
  const palette = SHARE_THEMES[themeKey] || SHARE_THEMES.cream;
  const width = format.width;
  const measureCanvas = document.createElement('canvas');
  const measureCtx = measureCanvas.getContext('2d');

  let scale = 1;
  let layout = prepareLayout(measureCtx, hymn, version, width, scale);
  // 1) Réduire si le contenu dépasse la hauteur demandée
  while (layout.requiredHeight > format.height && scale > 0.68) {
    scale = Math.max(0.68, scale - 0.04);
    layout = prepareLayout(measureCtx, hymn, version, width, scale);
  }
  // 2) Agrandir si le contenu est trop petit pour remplir la page
  const maxScale = 2.4;
  while (layout.requiredHeight < format.height * 0.92 && scale < maxScale) {
    const next = Math.min(maxScale, scale + 0.06);
    const trial = prepareLayout(measureCtx, hymn, version, width, next);
    if (trial.requiredHeight > format.height) break;
    scale = next;
    layout = trial;
  }

  // La hauteur s'adapte au texte : aucun break/cutoff de paroles.
  const height = Math.max(format.height, layout.requiredHeight);
  const pixelRatio = height > 2600 ? 1 : 2;
  canvas.width = width * pixelRatio;
  canvas.height = height * pixelRatio;
  canvas.style.width = '100%';
  canvas.style.height = 'auto';
  canvas.style.aspectRatio = width + ' / ' + height;

  const ctx = canvas.getContext('2d');
  ctx.scale(pixelRatio, pixelRatio);
  ctx.textBaseline = 'top';

  // Couleur de fond du thème (fallback)
  ctx.fillStyle = palette.background;
  ctx.fillRect(0, 0, width, height);

  // Image de fond (déjà au bon ratio) + voile de lisibilité
  const fmt = SHARE_FORMATS[formatKey] || SHARE_FORMATS['1:1'];
  const bgImage = THEME_IMAGES[themeKey + '-' + fmt.imageKey];
  if (bgImage) {
    drawImageCover(ctx, bgImage, width, height);
    if (palette.overlay) {
      ctx.fillStyle = palette.overlay;
      ctx.fillRect(0, 0, width, height);
    }
  }

  // ---- Header discret (sans bande) ----
  const centerX = width / 2;
  const logoImg = THEME_LOGOS[palette.logoVariant || 'dark'];
  const logoSize = Math.round(70 * scale);
  if (logoImg) {
    ctx.drawImage(logoImg, centerX - logoSize / 2, Math.round(30 * scale), logoSize, logoSize);
  } else {
    // Fallback : livre vectoriel
    drawBookLogo(ctx, centerX, Math.round(58 * scale), Math.round(48 * scale), palette.accent);
  }

  setFont(ctx, '700', Math.round(24 * scale), '"Montserrat", "Inter", sans-serif');
  ctx.textAlign = 'center';
  ctx.fillStyle = palette.title;
  ctx.fillText(SHARE_BRAND.name, centerX, Math.round(114 * scale));

  setFont(ctx, 'italic', Math.round(13 * scale), '"Cormorant Garamond", Georgia, serif');
  ctx.fillStyle = palette.muted;
  ctx.fillText(SHARE_BRAND.tagline, centerX, Math.round(140 * scale));

  // Fine ligne décorative sous le header
  ctx.save();
  ctx.strokeStyle = palette.accent;
  ctx.globalAlpha = 0.4;
  ctx.lineWidth = Math.max(1, Math.round(1.4 * scale));
  ctx.beginPath();
  ctx.moveTo(centerX - Math.round(72 * scale), Math.round(164 * scale));
  ctx.lineTo(centerX + Math.round(72 * scale), Math.round(164 * scale));
  ctx.stroke();
  ctx.restore();

  for (const element of layout.elements) {
    if (element.type === 'source-number') {
      setFont(ctx, '700', element.size, '"Montserrat", "Inter", sans-serif');
      ctx.fillStyle = palette.accent;
      ctx.textAlign = 'center';
      ctx.fillText(element.text, centerX, element.y);
    } else if (element.type === 'title') {
      setFont(ctx, '700', element.size, '"Montserrat", "Inter", sans-serif');
      ctx.fillStyle = palette.title;
      ctx.textAlign = 'center';
      drawLines(ctx, element.lines, centerX, element.y, Math.round(element.size * 1.22));
    } else if (element.type === 'language') {
      setFont(ctx, '500', element.size, '"Open Sans", "Inter", sans-serif');
      ctx.fillStyle = palette.muted;
      ctx.textAlign = 'center';
      ctx.fillText(element.text, centerX, element.y);
    } else if (element.type === 'divider') {
      ctx.strokeStyle = palette.accentLight;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX - 42, element.y);
      ctx.lineTo(centerX + 42, element.y);
      ctx.stroke();
    } else if (element.type === 'refrain') {
      const x = layout.marginX - 14;
      const boxWidth = width - x * 2;
      ctx.fillStyle = palette.refrain;
      roundRect(ctx, x, element.y, boxWidth, element.height, 16);
      ctx.fill();

      setFont(ctx, '700', element.labelSize, '"Montserrat", "Inter", sans-serif');
      ctx.fillStyle = palette.accent;
      ctx.textAlign = 'left';
      let textY = element.y + element.paddingY;
      ctx.fillText('REFRAIN', layout.marginX, textY);
      textY += Math.round(element.labelSize * 1.8);

      setFont(ctx, '500', element.size, '"Lora", "Open Sans", serif');
      ctx.fillStyle = palette.text;
      drawLines(ctx, element.lines, layout.marginX, textY, element.lineHeight);
    } else if (element.type === 'comment') {
      setFont(ctx, 'italic', element.size, '"Lora", Georgia, serif');
      ctx.fillStyle = palette.comment;
      ctx.textAlign = 'left';
      drawLines(ctx, element.lines, layout.marginX, element.y, element.lineHeight);
    } else {
      ctx.textAlign = 'left';
      if (element.number !== null) {
        setFont(ctx, '700', Math.round(element.size * 0.94), '"Montserrat", "Inter", sans-serif');
        ctx.fillStyle = palette.title;
        ctx.fillText(element.number + '.', layout.marginX, element.y);
      }
      setFont(ctx, '500', element.size, '"Lora", "Open Sans", serif');
      ctx.fillStyle = palette.text;
      drawLines(ctx, element.lines, layout.marginX + element.numberGutter, element.y, element.lineHeight);
    }
  }

  // ---- Footer discret (sans bande) ----
  const footerY = height - layout.footerHeight;
  const footerLineY = footerY + Math.round(30 * scale);

  // Fine ligne séparatrice
  ctx.save();
  ctx.strokeStyle = palette.accent;
  ctx.globalAlpha = 0.4;
  ctx.lineWidth = Math.max(1, Math.round(1.4 * scale));
  ctx.beginPath();
  ctx.moveTo(layout.marginX, footerLineY);
  ctx.lineTo(width - layout.marginX, footerLineY);
  ctx.stroke();
  ctx.restore();

  const footY = footerLineY + Math.round(38 * scale);

  // Logo mini à gauche
  if (logoImg) {
    const footLogoSize = Math.round(36 * scale);
    ctx.drawImage(logoImg, layout.marginX + Math.round(4 * scale), footY - footLogoSize / 2 + Math.round(4 * scale), footLogoSize, footLogoSize);
  } else {
    drawBookLogo(ctx, layout.marginX + Math.round(16 * scale), footY, Math.round(28 * scale), palette.accent);
  }

  setFont(ctx, '600', Math.round(15 * scale), '"Montserrat", "Inter", sans-serif');
  ctx.fillStyle = palette.title;
  ctx.textAlign = 'left';
  ctx.fillText(SHARE_BRAND.name, layout.marginX + Math.round(52 * scale), footY - Math.round(14 * scale));

  setFont(ctx, 'italic', Math.round(12 * scale), '"Cormorant Garamond", Georgia, serif');
  ctx.fillStyle = palette.muted;
  ctx.fillText(SHARE_BRAND.tagline, layout.marginX + Math.round(52 * scale), footY + Math.round(2 * scale));

  // URL à droite
  setFont(ctx, '500', Math.round(12 * scale), '"Open Sans", "Inter", sans-serif');
  ctx.fillStyle = palette.accent;
  ctx.textAlign = 'right';
  ctx.fillText(window.location.host || 'Cantiques EUJC', width - layout.marginX, footY);
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y + height, radius);
  ctx.closePath();
}

function autoFormatFor(hymn, selectedVersion) {
  const version = selectedVersion || (hymn && hymn.versions && hymn.versions[0]) || {};
  const blocks = getBlocks(version);
  const characters = blocks.reduce(function(total, block) {
    return total + block.lines.reduce(function(sum, line) { return sum + line.length; }, 0);
  }, 0);

  if (characters < 240 && blocks.length <= 3) return '1:1';
  if (characters < 420 && blocks.length <= 4) return '4:5';
  if (characters < 600 && blocks.length <= 5) return '3:4';
  if (characters < 800 && blocks.length <= 6) return '2:3';
  if (characters < 1100 && blocks.length <= 8) return '9:16';
  if (characters < 1400 && blocks.length <= 10) return '9:17';
  if (characters < 1800 && blocks.length <= 12) return '9:18';
  return '9:19';
}

window.ShareImage = {
  preloadThemes: async function(formatKey) {
    const fk = formatKey || '1:1';
    const keys = Object.keys(SHARE_THEMES);
    await Promise.all(keys.map(k => Promise.all([ensureThemeImage(k, fk), ensureLogo(k)])));
    console.log('[ShareImage] Themes + logos precharges pour ' + fk);
  },
  generate: async function(canvas, hymn, version, formatKey, themeKey) {
    const tk = themeKey || 'cream';
    const fk = formatKey || '1:1';
    await Promise.all([ensureThemeImage(tk, fk), ensureLogo(tk)]);
    drawComposition(canvas, hymn, version, fk, tk);
  },
  autoFormatFor: autoFormatFor,
  waitFonts: waitFonts,
  toBlob: async function(canvas) {
    return new Promise(function(resolve) {
      if (!canvas || typeof canvas.toBlob !== 'function') {
        resolve(null);
        return;
      }
      canvas.toBlob(resolve, 'image/png');
    });
  }
};

console.log('[ShareImage] Générateur adaptatif chargé');
