// ============================================================
// Cantiques EUJC — Stockage local (favoris + historique)
// ============================================================

const STORAGE_KEYS = {
  recents:   'cantiques-eujc-recents',
  favorites: 'cantiques-eujc-favoris'
};

const MAX_RECENTS = 20;

// ---------- Utilitaires internes ----------

function _read(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function _write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota dépassé ou mode privé : on ignore */
  }
}

// Migration : anciens recents = ['id1', 'id2'] → [{id, category, ts}]
function _normalizeEntry(entry) {
  if (typeof entry === 'string') {
    return { id: entry, category: 'lesson-1', ts: 0 };
  }
  if (entry && typeof entry === 'object' && entry.id) {
    return {
      id: String(entry.id),
      category: entry.category || 'lesson-1',
      ts: entry.ts || 0
    };
  }
  return null;
}

// ---------- Historique (Récemment consultés) ----------

function getRecents() {
  return _read(STORAGE_KEYS.recents).map(_normalizeEntry).filter(Boolean);
}

function addRecent(id, category) {
  if (!id) return;
  const list = getRecents().filter(item => item.id !== id);
  list.unshift({ id, category: category || 'lesson-1', ts: Date.now() });
  _write(STORAGE_KEYS.recents, list.slice(0, MAX_RECENTS));
}

function clearRecents() {
  _write(STORAGE_KEYS.recents, []);
}

// ---------- Favoris ----------

function getFavorites() {
  return _read(STORAGE_KEYS.favorites).map(_normalizeEntry).filter(Boolean);
}

function isFavorite(id) {
  return getFavorites().some(item => item.id === id);
}

function toggleFavorite(id, category) {
  if (!id) return false;
  const list = getFavorites();
  const exists = list.some(item => item.id === id);

  if (exists) {
    _write(STORAGE_KEYS.favorites, list.filter(item => item.id !== id));
    return false;
  }

  list.unshift({ id, category: category || 'lesson-1', ts: Date.now() });
  _write(STORAGE_KEYS.favorites, list);
  return true;
}

function clearFavorites() {
  _write(STORAGE_KEYS.favorites, []);
}
