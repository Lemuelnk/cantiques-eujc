// ============================================================
// Cantiques EUJC — Préférences utilisateur
// ============================================================
// Gère : thème (clair/sombre/système), taille du texte, police
// Stockage : localStorage (clé : cantiques-eujc-preferences)
// ============================================================

(function () {
  'use strict';

  const STORAGE_KEY = 'cantiques-eujc-preferences';

  const DEFAULTS = {
    theme: 'system',      // 'light' | 'dark' | 'system'
    textScale: 1,         // 0.85 | 1 | 1.15 | 1.3
    font: 'open-sans'     // 'system' | 'open-sans' | 'lora' | 'atkinson'
  };

  // ----------------------------------------------------------
  // Chargement / sauvegarde
  // ----------------------------------------------------------
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULTS };
      const parsed = JSON.parse(raw);
      return { ...DEFAULTS, ...parsed };
    } catch {
      return { ...DEFAULTS };
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch { /* quota / mode privé : on ignore */ }
  }

  let prefs = load();

  // ----------------------------------------------------------
  // Thème
  // ----------------------------------------------------------
  function getEffectiveTheme() {
    if (prefs.theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return prefs.theme;
  }

  function applyTheme() {
    const effective = getEffectiveTheme();
    document.documentElement.setAttribute('data-theme', effective);
    document.documentElement.setAttribute('data-theme-pref', prefs.theme);

    const isDark = effective === 'dark';
    document.documentElement.classList.toggle('theme-dark', isDark);
    if (document.body) {
      document.body.classList.toggle('theme-dark', isDark);
    }

    // Mettre à jour la barre Chrome (theme-color)
    updateThemeColor(effective);
  }

  // ----------------------------------------------------------
  // Mise à jour de la barre Chrome (theme-color)
  // ----------------------------------------------------------
  function updateThemeColor(effective) {
    const color = effective === 'dark' ? '#0b2b24' : '#faf6ec';

    // Supprimer les anciennes meta theme-color
    document.querySelectorAll('meta[name="theme-color"]').forEach(m => m.remove());

    // Ajouter la nouvelle
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = color;
    document.head.appendChild(meta);
  }

  // ----------------------------------------------------------
  // Taille du texte
  // ----------------------------------------------------------
  function applyTextScale() {
    document.documentElement.style.setProperty('--text-scale', prefs.textScale);
  }

  // ----------------------------------------------------------
  // Police
  // ----------------------------------------------------------
  const FONT_MAP = {
    'system':    'var(--font-system)',
    'open-sans': 'var(--font-open-sans)',
    'lora':      'var(--font-lora)',
    'atkinson':  'var(--font-atkinson)'
  };

  function applyFont() {
    const value = FONT_MAP[prefs.font] || FONT_MAP['open-sans'];
    document.documentElement.style.setProperty('--font-body', value);
    document.documentElement.style.setProperty('--font-heading', value);
  }

  // ----------------------------------------------------------
  // Application globale
  // ----------------------------------------------------------
  function applyAll() {
    applyTheme();
    applyTextScale();
    applyFont();
  }

  // ----------------------------------------------------------
  // Écouter le changement de thème système
  // ----------------------------------------------------------
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  if (mql.addEventListener) {
    mql.addEventListener('change', () => {
      if (prefs.theme === 'system') applyTheme();
    });
  } else if (mql.addListener) {
    // Fallback anciens navigateurs
    mql.addListener(() => {
      if (prefs.theme === 'system') applyTheme();
    });
  }

  // ----------------------------------------------------------
  // Application immédiate (évite le FOUC)
  // ----------------------------------------------------------
  applyAll();

  // Réapplication dès que <body> est disponible
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyTheme, { once: true });
  }

  // ----------------------------------------------------------
  // API publique
  // ----------------------------------------------------------
  window.preferences = {
    get: (key) => prefs[key],
    getAll: () => ({ ...prefs }),
    set(key, value) {
      prefs[key] = value;
      save();
      applyAll();
    },
    setTheme(v)     { this.set('theme', v); },
    setTextScale(v) { this.set('textScale', v); },
    setFont(v)      { this.set('font', v); },
    getEffectiveTheme,
    applyAll,
    reset() {
      prefs = { ...DEFAULTS };
      save();
      applyAll();
    },
    DEFAULTS: { ...DEFAULTS }
  };

  console.log('[Preferences] Chargées :', prefs);
})();
