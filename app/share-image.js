// ============================================================
// Cantiques EUJC — Générateur d'image de partage
// Composition adaptative : les paroles ne sont jamais tronquées.
// Les formats indiquent une hauteur minimale ; la toile s'allonge
// si le contenu ne tient pas, au lieu de supprimer des blocs.
// ============================================================

const SHARE_FORMATS = {
  '1:1':  { width: 1080, height: 1080 },
  '4:5':  { width: 1080, height: 1350 },
  '9:16': { width: 1080, height: 1920 },
  '9:19': { width: 1080, height: 2280 }
};

const SHARE_THEMES = {
  cream: {
    background: '#faf6ec', headerStart: '#14392e', headerEnd: '#2d5f4f', footer: '#14392e',
    title: '#14392e', text: '#1a1f1d', muted: '#5a6660', accent: '#b8935a',
    accentLight: '#e4c37f', refrain: 'rgba(184, 147, 90, 0.18)', comment: '#5a6660'
  },
  forest: {
    background: '#081f19', headerStart: '#061711', headerEnd: '#2d5f4f', footer: '#061711',
    title: '#faf6ec', text: '#faf6ec', muted: '#d0ddd4', accent: '#e4c37f',
    accentLight: '#f0dfb5', refrain: 'rgba(240, 223, 181, 0.14)', comment: '#d0ddd4'
  },
  midnight: {
    background: '#101820', headerStart: '#0a1118', headerEnd: '#243b53', footer: '#0a1118',
    title: '#f7f4ed', text: '#f7f4ed', muted: '#c5cbd2', accent: '#e4c37f',
    accentLight: '#f0dfb5', refrain: 'rgba(228, 195, 127, 0.16)', comment: '#c5cbd2'
  },
  botanical: {
    background: '#f1f3e8', headerStart: '#1e3027', headerEnd: '#73866b', footer: '#263e32',
    title: '#263e32', text: '#243128', muted: '#5e6b5e', accent: '#8c7144',
    accentLight: '#b9a06a', refrain: 'rgba(115, 134, 107, 0.18)', comment: '#5e6b5e'
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

function drawComposition(canvas, hymn, version, formatKey, themeKey) {
  const format = SHARE_FORMATS[formatKey] || SHARE_FORMATS['1:1'];
  const palette = SHARE_THEMES[themeKey] || SHARE_THEMES.cream;
  const width = format.width;
  const measureCanvas = document.createElement('canvas');
  const measureCtx = measureCanvas.getContext('2d');

  let scale = 1;
  let layout = prepareLayout(measureCtx, hymn, version, width, scale);
  while (layout.requiredHeight > format.height && scale > 0.68) {
    scale = Math.max(0.68, scale - 0.04);
    layout = prepareLayout(measureCtx, hymn, version, width, scale);
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
  ctx.fillStyle = palette.background;
  ctx.fillRect(0, 0, width, height);

  const headerGradient = ctx.createLinearGradient(0, 0, 0, layout.headerHeight);
  headerGradient.addColorStop(0, palette.headerStart);
  headerGradient.addColorStop(1, palette.headerEnd);
  ctx.fillStyle = headerGradient;
  ctx.fillRect(0, 0, width, layout.headerHeight);

  const centerX = width / 2;
  drawBookLogo(ctx, centerX, Math.round(42 * scale), Math.round(44 * scale), palette.accentLight);

  setFont(ctx, '700', Math.round(29 * scale), '"Montserrat", "Inter", sans-serif');
  ctx.textAlign = 'center';
  ctx.fillStyle = '#faf6ec';
  ctx.fillText(SHARE_BRAND.name, centerX, Math.round(70 * scale));

  setFont(ctx, 'italic', Math.round(15 * scale), '"Cormorant Garamond", Georgia, serif');
  ctx.fillStyle = 'rgba(250, 246, 236, 0.82)';
  ctx.fillText(SHARE_BRAND.tagline, centerX, Math.round(104 * scale));

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

  const footerY = height - layout.footerHeight;
  const footerCenterY = footerY + layout.footerHeight / 2;
  ctx.fillStyle = palette.footer;
  ctx.fillRect(0, footerY, width, layout.footerHeight);
  drawBookLogo(ctx, 64, footerCenterY, 36, palette.accentLight);

  setFont(ctx, '700', 18, '"Montserrat", "Inter", sans-serif');
  ctx.fillStyle = '#faf6ec';
  ctx.textAlign = 'left';
  ctx.fillText(SHARE_BRAND.name, 96, footerCenterY - 18);

  setFont(ctx, 'italic', 13, '"Cormorant Garamond", Georgia, serif');
  ctx.fillStyle = 'rgba(250, 246, 236, 0.78)';
  ctx.fillText(SHARE_BRAND.tagline, 96, footerCenterY + 7);

  setFont(ctx, '500', 12, '"Open Sans", "Inter", sans-serif');
  ctx.fillStyle = palette.accentLight;
  ctx.textAlign = 'right';
  ctx.fillText(window.location.host || 'Cantiques EUJC', width - 42, footerCenterY - 6);
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y);
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
  if (characters < 650 && blocks.length <= 6) return '4:5';
  if (characters < 1500 && blocks.length <= 10) return '9:16';
  return '9:19';
}

window.ShareImage = {
  generate: function(canvas, hymn, version, formatKey, themeKey) {
    drawComposition(canvas, hymn, version, formatKey, themeKey || 'cream');
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
