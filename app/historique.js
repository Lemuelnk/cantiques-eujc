// ============================================================
// Cantiques EUJC — Page Historique
// ============================================================

const historyList    = document.getElementById('history-list');
const historyEmpty   = document.getElementById('history-empty');
const historyCount   = document.getElementById('history-count');
const historyLoading = document.getElementById('history-loading');
const backButton     = document.getElementById('back-button');
const clearHistory   = document.getElementById('clear-history');


function formatRelativeTime(ts) {
  if (!ts) return '';
  const diff = Date.now() - ts;
  const min  = Math.floor(diff / 60000);
  const h    = Math.floor(diff / 3600000);
  const d    = Math.floor(diff / 86400000);

  if (min < 1)   return "À l'instant";
  if (min < 60)  return `Il y a ${min} min`;
  if (h   < 24)  return `Il y a ${h} h`;
  if (d   < 7)   return `Il y a ${d} j`;

  const date = new Date(ts);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

function createHistoryRow(hymn, category, ts) {
  const display = getHymnDisplay(hymn);

  const row = document.createElement('a');
  row.className = 'history-row';
  row.href = (typeof buildCantiqueUrl === 'function')
    ? buildCantiqueUrl(hymn, category)
    : `cantique.html?hymn=${encodeURIComponent(display.id)}&category=${encodeURIComponent(category)}`;

  const number = document.createElement('span');
  number.className = 'hist-number';
  number.textContent = display.sourceNumber
    || String(display.sourcePosition || '').padStart(2, '0');

  const content = document.createElement('div');
  content.className = 'hist-content';

  const title = document.createElement('h2');
  title.className = 'hist-title';
  title.textContent = display.title;

  const meta = document.createElement('p');
  meta.className = 'hist-meta';
  const verses = display.verseCount
    ? ` · ${display.verseCount} couplet${display.verseCount > 1 ? 's' : ''}`
    : '';
  meta.textContent = `${display.language}${verses}`;

  const time = document.createElement('p');
  time.className = 'hist-time';
  time.textContent = formatRelativeTime(ts);

  content.append(title, meta, time);

  const arrow = document.createElement('span');
  arrow.className = 'hist-arrow';
  arrow.setAttribute('aria-hidden', 'true');
  arrow.innerHTML = '<i data-lucide="chevron-right"></i>';

  row.append(number, content, arrow);
  return row;
}

async function loadHistory() {
  if (typeof getRecents !== 'function') {
    historyCount.textContent = 'Erreur';
    historyLoading.textContent = 'storage.js non chargé.';
    return;
  }

  const recents = getRecents();

  if (recents.length === 0) {
    historyLoading.hidden = true;
    historyEmpty.hidden = false;
    historyCount.textContent = 'Aucun';
    clearHistory.hidden = true;
    if (window.lucide) lucide.createIcons();
    return;
  }

  historyCount.textContent =
    `${recents.length} cantique${recents.length > 1 ? 's' : ''}`;
  clearHistory.hidden = false;

  const byCategory = new Map();
  recents.forEach(item => {
    const cat = item.category || 'lesson-1';
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat).push(item);
  });

  const rows = [];

  for (const [category, items] of byCategory.entries()) {
    const corpus = await getCorpus(category);
    if (!corpus || !Array.isArray(corpus.hymns)) continue;

    items.forEach(item => {
      const hymn = corpus.hymns.find(h => h.id === item.id);
      if (hymn) rows.push({ hymn, category, ts: item.ts || 0 });
    });
  }

  rows.sort((a, b) => (b.ts || 0) - (a.ts || 0));
  historyLoading.hidden = true;

  if (rows.length === 0) {
    historyEmpty.hidden = false;
    historyCount.textContent = 'Aucun';
  } else {
    historyEmpty.hidden = true;
    historyList.replaceChildren(
      ...rows.map(r => createHistoryRow(r.hymn, r.category, r.ts))
    );
    if (window.lucide) lucide.createIcons();
  }
}

// --- Bouton retour ---
if (backButton) {
  backButton.addEventListener('click', () => {
    if (document.referrer) history.back();
    else window.location.href = 'index.html';
  });
}

// --- Bouton Vider ---
if (clearHistory) {
  clearHistory.addEventListener('click', () => {
    if (!confirm("Vider tout l'historique ?")) return;
    if (typeof clearRecents === 'function') clearRecents();
    historyEmpty.hidden = true;
    historyList.replaceChildren();
    historyEmpty.hidden = false;
    historyCount.textContent = 'Aucun';
    clearHistory.hidden = true;
    if (window.lucide) lucide.createIcons();
  });
}

loadHistory();
