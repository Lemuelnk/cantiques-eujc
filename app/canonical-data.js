// ============================================================
// Cantiques EUJC — Accès en lecture au corpus canonique
// ============================================================

const CANONICAL_CORPUS_URLS = {
  'lesson-1': 'data/canonical/lesson-1-creation.json',
  'lesson-2': 'data/canonical/lesson-2-eden.json'
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
  const corpusUrl = CANONICAL_CORPUS_URLS[categoryId];

  if (!corpusUrl) {
    throw new Error('Catégorie canonique indisponible : ' + categoryId);
  }

  const response = await fetch(corpusUrl, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error('HTTP ' + response.status);
  }

  return response.json();
}

function getHymnDisplay(hymn) {
  const version = getPrimaryVersion(hymn);
  const source = version?.source || {};
  const verseCount = countBlocks(version, 'verse');

  return {
    id: hymn.id,
    title: version?.title || hymn.title,
    language: getLanguageLabel(version),
    sourceNumber: source.number,
    sourcePosition: source.position,
    verseCount,
    version
  };
}

function findHymn(corpus, hymnId) {
  return corpus?.hymns?.find(hymn => hymn.id === hymnId) || null;
}
