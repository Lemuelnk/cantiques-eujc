// ============================================================
// Cantiques EUJC — Accès en lecture au corpus canonique
// ============================================================

const CANONICAL_FILE_MAP = {
  'lesson-0': 'lesson-0-lucifer',
  'lesson-1': 'lesson-1-creation',
  'lesson-2': 'lesson-2-eden',
  'lesson-3': 'lesson-3-premier-peche',
  'lesson-4': 'lesson-4-fils-adam',
  'lesson-5': 'lesson-5-noe',
  'lesson-6': 'lesson-6-abraham',
  'lesson-7': 'lesson-7-lot',
  'lesson-8': 'lesson-8-fils-isaac',
  'lesson-9': 'lesson-9-jacob',
  'lesson-10': 'lesson-10-egypte',
  'lesson-11': 'lesson-11-moise',
  'lesson-12': 'lesson-12-plaies',
  'lesson-13': 'lesson-13-mer-rouge',
  'lesson-20': 'lesson-20-samson',
  'lesson-21': 'lesson-21-david-saul',
  'lesson-22': 'lesson-22-salomon',
  'lesson-23': 'lesson-23-temple',
  'lesson-24': 'lesson-24-elie-elisee',
  'lesson-25': 'lesson-25-daniel',
  'lesson-26': 'lesson-26-job',
  // Cantiques à classer (non classés thématiquement)
  'a-classer-francais': 'a-classer-francais',
  'a-classer-swahili':  'a-classer-swahili',
  'a-classer-tshiluba': 'a-classer-tshiluba',
  'a-classer-lingala':  'a-classer-lingala',
  'a-classer-autres':   'a-classer-autres'
};

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('fr');
}

function getPrimaryVersion(hymn) {
  return hymn?.versions?.[0] || null;
}

function getLanguageLabel(version) {
  const language = version?.language;

  if (!language || language.status === 'unknown') return 'Langue non identifiée';

  return language.label || 'Langue à confirmer';
}

function countBlocks(version, type) {
  return version?.content?.filter(block => block.type === type).length || 0;
}

async function loadCanonicalLesson(categoryId = 'lesson-1') {
  const slug = CANONICAL_FILE_MAP[categoryId] || categoryId;
  const url = `/data/canonical/${slug}.json`;
  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error('HTTP ' + response.status);
  }

  return response.json();
}

function getHymnDisplay(hymn) {
  const version = getPrimaryVersion(hymn);
  const source = version?.source || {};
  const verseCount = countBlocks(version, 'verse');

  const versions = Array.isArray(hymn.versions) ? hymn.versions : [];

  return {
    id: hymn.id,
    title: version?.title || hymn.title,
    language: getLanguageLabel(version),
    sourceNumber: source.number,
    sourcePosition: source.position,
    verseCount,
    version,
    versionCount: versions.length,
    languages: versions.map(v => ({
      code: v?.language?.code || null,
      label: getLanguageLabel(v)
    }))
  };
}

function findHymn(corpus, hymnId) {
  return corpus?.hymns?.find(hymn => hymn.id === hymnId) || null;
}

// ============================================================
// Helpers URLs propres /cantique/:cat/:num
// ============================================================
function hymnNumberSlug(number) {
  // Version ASCII pure - pas de regex Unicode, pas de normalize() (buggé sur certains Android)
  var s = String(number == null ? '' : number).toLowerCase();
  var out = '';
  for (var i = 0; i < s.length; i++) {
    var c = s.charCodeAt(i);
    if (c === 339) { out += 'oe'; continue; }                    // oe ligature
    if (c >= 97 && c <= 122) { out += s.charAt(i); continue; }   // a-z
    if (c >= 48 && c <= 57)  { out += s.charAt(i); continue; }   // 0-9
    if (c === 95)            { out += '_'; continue; }           // underscore
    if (c === 45) {                                              // tiret (collapse)
      if (out.length > 0 && out.charAt(out.length - 1) !== '-') out += '-';
    }
  }
  if (out.length > 0 && out.charAt(out.length - 1) === '-') out = out.slice(0, -1);
  return out;
}

function hymnRouteKey(hymn, corpus) {
  const num = getHymnDisplay(hymn).sourceNumber;
  if (!num) return null;
  const base = hymnNumberSlug(num);
  const hymns = Array.isArray(corpus?.hymns) ? corpus.hymns : [];
  const sameNumber = hymns.filter(item => hymnNumberSlug(getHymnDisplay(item).sourceNumber) === base);
  const index = sameNumber.findIndex(item => item === hymn || item.id === hymn.id);
  if (index <= 0) return base;
  const ident = hymnNumberSlug(hymn.id) || 'doublon';
  return base + '-' + ident + (index > 1 ? '-' + index : '');
}

function findHymnByRouteKey(corpus, routeKey) {
  if (!corpus || !Array.isArray(corpus.hymns) || !routeKey) return null;
  return corpus.hymns.find(h => hymnRouteKey(h, corpus) === String(routeKey)) || null;
}

function findHymnByNumber(corpus, number) {
  if (!corpus || !corpus.hymns || !number) return null;
  const target = String(number);
  const targetSlug = hymnNumberSlug(target);
  return corpus.hymns.find(h => {
    const versions = Array.isArray(h.versions) ? h.versions : [];
    return versions.some(v => {
      const sourceNumber = String(((v.source) || {}).number || '');
      return sourceNumber === target || hymnNumberSlug(sourceNumber) === targetSlug;
    });
  }) || null;
}

function buildCantiqueUrl(hymnOrDisplay, categoryId, corpus) {
  if (!hymnOrDisplay) return 'cantiques.html';
  const display = (hymnOrDisplay.sourceNumber !== undefined)
    ? hymnOrDisplay
    : getHymnDisplay(hymnOrDisplay);
  const num = display.sourceNumber;
  const cat = categoryId || 'lesson-1';
  if (!num) {
    return 'cantique.html?hymn=' + encodeURIComponent(display.id)
         + '&category=' + encodeURIComponent(cat);
  }
  const route = corpus ? hymnRouteKey(hymnOrDisplay, corpus) : hymnNumberSlug(num);
  return '/cantique/' + encodeURIComponent(cat)
       + '/' + encodeURIComponent(route || hymnNumberSlug(num));
}
