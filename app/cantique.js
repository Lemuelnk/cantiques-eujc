const detailRoot = document.getElementById('hymn-detail');
const detailParams = new URLSearchParams(window.location.search);
const hymnId = detailParams.get('hymn');

function escapeHtml(value) {
  const element = document.createElement('div');
  element.textContent = value == null ? '' : String(value);
  return element.innerHTML;
}

function renderBlock(block, index) {
  const title = {
    verse: `Couplet ${block.number || index + 1}`,
    refrain: 'Refrain',
    comment: 'Commentaire source',
    source_block: 'Paroles'
  }[block.type] || 'Paroles';

  const lines = (block.lines || [])
    .map(line => `<p>${escapeHtml(line)}</p>`)
    .join('');

  return `<section class="lyric-block lyric-block-${escapeHtml(block.type)}">
    <h2>${title}</h2>
    <div class="lyric-lines">${lines}</div>
  </section>`;
}

function renderHymn(hymn) {
  const display = getHymnDisplay(hymn);
  const { version } = display;
  const sourceNumber = display.sourceNumber ? `N° ${escapeHtml(display.sourceNumber)}` : 'Sans numéro source';
  const sourcePosition = display.sourcePosition ? `Position source ${display.sourcePosition}` : '';
  const blocks = (version?.content || []).map(renderBlock).join('');

  document.title = `${display.title} — Cantiques EUJC`;
  detailRoot.innerHTML = `
    <header class="hymn-detail-intro">
      <p class="hymn-number-label">${sourceNumber}</p>
      <h1>${escapeHtml(display.title)}</h1>
      <p class="hymn-metadata">${escapeHtml(display.language)}${sourcePosition ? ` · ${sourcePosition}` : ''}</p>
    </header>
    <div class="hymn-lyrics">${blocks || '<p class="detail-empty">Aucune parole n’est disponible pour cette version.</p>'}</div>
  `;
}

async function loadDetail() {
  if (!hymnId) {
    detailRoot.innerHTML = '<p class="detail-empty">Cantique introuvable.</p>';
    return;
  }

  try {
    const corpus = await loadCanonicalLesson();
    const hymn = findHymn(corpus, hymnId);

    if (!hymn) {
      detailRoot.innerHTML = '<p class="detail-empty">Cantique introuvable.</p>';
      return;
    }

    renderHymn(hymn);
  } catch (error) {
    console.error('Impossible de charger le cantique :', error);
    detailRoot.innerHTML = '<p class="detail-empty">Impossible de charger ce cantique.</p>';
  }
}

document.getElementById('back-button').addEventListener('click', () => {
  if (document.referrer) {
    history.back();
  } else {
    window.location.href = 'cantiques.html?category=lesson-1';
  }
});

loadDetail();
