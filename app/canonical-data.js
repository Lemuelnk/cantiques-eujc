// ============================================================
// Cantiques EUJC — Accès en lecture au corpus canonique
// ============================================================

const CANONICAL_FILE_MAP = { 'lesson-1': 'lesson-1-creation' };

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
  const url = `data/canonical/${slug}.json`;
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
