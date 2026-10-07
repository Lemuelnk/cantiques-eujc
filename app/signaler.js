// ============================================================
// Cantiques EUJC — Signalement de problème
// ============================================================

const API_ENDPOINT = 'https://lnk-studio.com/api/cantiques-reports';
const TURNSTILE_SITE_KEY = '0x4AAAAAAEQr5WmuslOhzvrn';
const APP_VERSION = '1.0';

// ------------------------------------------------------------
// Paramètres URL + refs DOM
// ------------------------------------------------------------
const params     = new URLSearchParams(window.location.search);
const hymnId     = params.get('hymn');
const categoryId = params.get('category') || 'lesson-1';

// ------------------------------------------------------------
// Détermination du scope (contexte du signalement)
// ------------------------------------------------------------
function detectScope() {
  const explicit = params.get('scope');
  if (explicit === 'lessons')   return 'liste-lessons';
  if (explicit === 'cantiques') return 'liste-cantiques';
  if (explicit === 'dimanche')  return 'liste-dimanche';
  if (explicit === 'priere')    return 'liste-priere';
  if (explicit === 'global')    return 'global';
  if (hymnId)                   return 'cantique';
  return 'global';
}

const currentScope = detectScope();

// Textes adaptés selon le scope
const SCOPE_TEXTS = {
  'cantique':         { title: 'Signaler un problème', intro: 'Choisissez ce qui ne va pas dans ce cantique. Nous examinerons votre signalement pour l\'améliorer.' },
  'liste-lessons':    { title: 'Signaler un problème', intro: 'Un problème dans la liste des leçons ? Signalez-le, nous l\'examinerons.' },
  'liste-cantiques':  { title: 'Signaler un problème', intro: 'Un problème dans cette liste de cantiques ? Signalez-le, nous l\'examinerons.' },
  'liste-dimanche':   { title: 'Signaler un problème', intro: 'Un problème dans les cantiques du Dimanche ? Signalez-le, nous l\'examinerons.' },
  'liste-priere':     { title: 'Signaler un problème', intro: 'Un problème dans les cantiques de prière ? Signalez-le, nous l\'examinerons.' },
  'global':           { title: 'Signaler un problème', intro: 'Un problème général dans l\'application ? Signalez-le, nous l\'examinerons.' }
};

const $loading        = document.getElementById('report-loading');
const $form           = document.getElementById('report-form');
const $success        = document.getElementById('report-success');
const $context        = document.getElementById('report-context');
const $backButton     = document.getElementById('back-button');
const $backToHymn     = document.getElementById('report-back-to-hymn');
const $typesGrid      = document.getElementById('report-types');
const $detailsStep    = document.getElementById('report-details-step');
const $detailsTitle   = document.getElementById('report-details-title');
const $targetSelect   = document.getElementById('report-target-select');
const $targetField    = document.getElementById('report-target');
const $currentBlock   = document.getElementById('report-current-block');
const $currentText    = document.getElementById('report-current-text');
const $proposedBlock  = document.getElementById('report-proposed-block');
const $proposed       = document.getElementById('report-proposed');
const $categoryBlock  = document.getElementById('report-category-block');
const $categorySelect = document.getElementById('report-category');
const $message        = document.getElementById('report-message');
const $contactStep    = document.getElementById('report-contact-step');
const $name           = document.getElementById('report-name');
const $contact        = document.getElementById('report-contact');
const $submit         = document.getElementById('report-submit');
const $status         = document.getElementById('report-status');
const $modeToggle     = document.querySelector('.report-mode-toggle');
const $msgLabel       = document.getElementById('report-message-label');
const $msgReq         = document.getElementById('report-message-req');
const $hintBlock      = document.getElementById('report-hint-block');
const $hintText       = document.getElementById('report-hint-text');
const $stepLabel      = document.querySelector('.report-step-label');
const $stepDots       = document.querySelectorAll('.report-step-dot');

// ------------------------------------------------------------
// État
// ------------------------------------------------------------
let currentHymn    = null;
let currentVersion = null;
let selectedType   = null;
let currentMode    = 'signaler'; // 'signaler' | 'correction'
let turnstileToken = null;
let turnstileId    = null;
let contentBlocks  = [];

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
const escapeHtml = (v) => {
  const d = document.createElement('div');
  d.textContent = v == null ? '' : String(v);
  return d.innerHTML;
};

function setStatus(text, kind) {
  $status.textContent = text;
  $status.className = 'report-status ' + (kind === 'error' ? 'is-error' : 'is-info');
  $status.hidden = !text;
}

function clearStatus() {
  $status.hidden = true;
  $status.textContent = '';
}

const TYPE_LABELS = {
  orthographe: 'Orthographe',
  traduction: 'Traduction',
  titre: 'Titre',
  couplet: 'Couplet',
  refrain: 'Refrain',
  ordre: 'Ordre',
  categorie: 'Mauvaise catégorie',
  autre: 'Autre problème'
};

const ORDRE_OPTIONS = {
  couplets: 'Ordre des couplets',
  refrain: 'Ordre du refrain',
  commentaires: 'Ordre des commentaires'
};

// Aides contextuelles affichées selon le type choisi
const TYPE_HINTS = {
  orthographe: 'Indiquez le mot mal orthographié et sa correction. Ex : « Mungu » au lieu de « Mungo ».',
  traduction: 'Précisez quelle langue devrait être utilisée, ou quel passage est mal traduit.',
  titre: 'Le titre affiché est incorrect, incomplet, ou appartient à un autre cantique. Indiquez le bon titre.',
  couplet: 'Sélectionnez le couplet concerné ci-dessous, puis indiquez la correction.',
  refrain: 'Le refrain contient une erreur. Vous pouvez proposer une version corrigée ci-dessous.',
  ordre: 'Précisez dans quel ordre les blocs devraient apparaître (ex : Couplet 2 avant Couplet 1).',
  categorie: 'Ce cantique se trouve dans la mauvaise catégorie. Indiquez la bonne catégorie ci-dessous.',
  autre: 'Décrivez précisément le problème. Vous pouvez joindre toute information utile.'
};

const CATEGORIES_LABELS = {
  'a-classer-francais': 'Cantiques a classer - Francais',
  'a-classer-swahili':  'Cantiques a classer - Swahili',
  'a-classer-tshiluba': 'Cantiques a classer - Tshiluba',
  'a-classer-lingala':  'Cantiques a classer - Lingala',
  'a-classer-autres':   'Cantiques a classer - Autres langues',
  'lesson-0': 'Leçon 0 — Lucifer',
  'lesson-1': 'Leçon 1 — Création',
  'lesson-2': 'Leçon 2 — Éden',
  'lesson-3': 'Leçon 3 — Premier péché',
  'lesson-4': 'Leçon 4 — Les fils d\'Adam',
  'lesson-5': 'Leçon 5 — NOÉ',
  'lesson-6': 'Leçon 6 — Abraham',
  'lesson-7': 'Leçon 7 — Lot',
  'lesson-8': 'Leçon 8 — Les fils d\'Isaac',
  'lesson-9': 'Leçon 9 — Jacob et ses fils',
  'lesson-10': 'Leçon 10 — Départ d\'Israël pour l\'Égypte',
  'lesson-11': 'Leçon 11 — Moïse',
  'lesson-12': 'Leçon 12 — Les 10 plaies',
  'lesson-13': 'Leçon 13 — Le passage de la mer Rouge',
  'lesson-20': 'Leçon 20 — Samson',
  'lesson-21': 'Leçon 21 — Le royaume de David',
  'lesson-22': 'Leçon 22 — Salomon',
  'lesson-23': 'Leçon 23 — L\'office du temple',
  'lesson-24': 'Leçon 24 — Élie et Élysée',
  'lesson-25': 'Leçon 25 — Daniel',
  'lesson-26': 'Leçon 26 — Job',
  'dimanche-louange': 'Dimanche — Louange',
  'dimanche-croyants': 'Dimanche — Sacrifice des croyants',
  'dimanche-affliges': 'Dimanche — Sacrifice des affligés',
  'dimanche-egares': 'Dimanche — Sacrifice des égarés',
  'dimanche-rois': 'Dimanche — Sacrifice des rois',
  'dimanche-visiteurs': 'Dimanche — Sacrifice des visiteurs',
  'dimanche-divers': 'Dimanche — Communiquer et divers',
  'priere-misericorde': 'Prière — Miséricorde',
  'priere-invocation': 'Prière — Invocation',
  'priere-general': 'Prière — Général',
  'priere-bataille': 'Prière — Bataille'
};

function getBlockLabel(block, index) {
  if (block.type === 'refrain') return 'Refrain';
  if (block.type === 'comment') return `Commentaire ${block.number || index + 1}`;
  return `Couplet ${block.number || index + 1}`;
}

function getBlockText(block) {
  return (block.lines || []).join('\n');
}

// ------------------------------------------------------------
// Chargement du cantique
// ------------------------------------------------------------
async function loadHymn() {
  // ---- Cas CANTIQUE : besoin de charger le corpus ----
  if (currentScope === 'cantique') {
    if (!hymnId) {
      $loading.textContent = 'Cantique introuvable.';
      return null;
    }

    try {
      const corpus = await loadCanonicalLesson(categoryId);
      const hymns = Array.isArray(corpus.hymns) ? corpus.hymns : [];
      const hymn = hymns.find(h => h.id === hymnId);

      if (!hymn) {
        $loading.textContent = 'Cantique introuvable.';
        return null;
      }

      currentHymn = hymn;
      currentVersion = (hymn.versions && hymn.versions[0]) || null;
      contentBlocks = (currentVersion && currentVersion.content) || [];

      const title = (currentVersion && currentVersion.title) || hymn.title;
      const ref = currentVersion && currentVersion.source && currentVersion.source.number
        ? `N° ${currentVersion.source.number}`
        : '';
      const catLabel = CATEGORIES_LABELS[categoryId] || categoryId;

      $context.textContent = [ref, title, catLabel].filter(Boolean).join(' · ');
      document.title = `Signaler — ${title} — Cantiques EUJC`;

      return hymn;
    } catch (err) {
      console.error('Erreur de chargement :', err);
      $loading.textContent = 'Impossible de charger le cantique.';
      return null;
    }
  }

  // ---- Cas LISTE ou GLOBAL : pas de cantique à charger ----
  const catLabel = CATEGORIES_LABELS[categoryId] || '';

  if (currentScope === 'liste-lessons') {
    $context.textContent = 'Liste des leçons du Chemin';
  } else if (currentScope === 'liste-cantiques') {
    $context.textContent = catLabel || 'Liste des cantiques';
  } else if (currentScope === 'liste-dimanche') {
    $context.textContent = 'Cantiques du Dimanche';
  } else if (currentScope === 'liste-priere') {
    $context.textContent = 'Cantiques de prière';
  } else {
    $context.textContent = 'Application Cantiques EUJC';
  }

  document.title = 'Signaler un problème — Cantiques EUJC';
  return { mode: 'structure' };
}

// ------------------------------------------------------------
// Sélection du type
// ------------------------------------------------------------
// ------------------------------------------------------------
// Filtrer les types visibles selon le scope
// ------------------------------------------------------------
function filterTypesByScope() {
  if (!$typesGrid) return;
  $typesGrid.querySelectorAll('.report-type-card').forEach(card => {
    const scopes = (card.dataset.scopes || 'cantique').split(',').map(s => s.trim());
    const visible = scopes.includes(currentScope);
    card.hidden = !visible;
  });
}

function selectType(type) {
  selectedType = type;

  // Mettre à jour l'UI
  $typesGrid.querySelectorAll('.report-type-card').forEach(card => {
    card.classList.toggle('is-active', card.dataset.type === type);
  });

  // Réinitialiser les champs
  $targetSelect.hidden = true;
  $currentBlock.hidden = true;
  $proposedBlock.hidden = true;
  $categoryBlock.hidden = true;
  $targetField.innerHTML = '';
  $proposed.value = '';
  $currentText.textContent = '';

  $detailsStep.hidden = false;
  $contactStep.hidden = false;
  $detailsTitle.textContent = TYPE_LABELS[type] || 'Détails';

  // Afficher l'aide contextuelle
  showHint(type);

  // Avancer à l'étape 2
  updateStep(2);

  // Adapter les champs selon le type
  if (type === 'couplet' || type === 'refrain' || type === 'commentaire') {
    setupBlockSelection(type);
  } else if (type === 'ordre') {
    setupOrderSelection(type);
  } else if (type === 'categorie') {
    setupCategorySelection();
  }
  // 'titre' et 'autre' : juste le message libre (pas de champ supplémentaire)

  updateSubmitState();

  // Scroll vers les détails
  setTimeout(() => {
    $detailsStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

function setupBlockSelection(type) {
  // 'verse' = nom standard des couplets, 'source_block' = ancien nom (compat)
  const wantedTypes = type === 'couplet' ? ['verse', 'source_block']
                    : type === 'refrain' ? ['refrain']
                    : ['comment'];

  const blocks = contentBlocks
    .map((b, i) => ({ block: b, index: i, globalIdx: i }))
    .filter(item => wantedTypes.includes(item.block.type));

  if (blocks.length === 0) {
    setStatus('Aucun bloc de ce type n\'est disponible dans ce cantique.', 'info');
    return;
  }

  // Remplir le select
  $targetField.innerHTML = '<option value="">— Choisir —</option>'
    + blocks.map(item =>
        `<option value="${item.globalIdx}">${escapeHtml(getBlockLabel(item.block, item.index))}</option>`
      ).join('');

  $targetSelect.hidden = false;

  // Cacher la correction proposée pour "refrain" tant qu'un bloc n'est pas choisi
  $targetField.onchange = () => {
    const idx = parseInt($targetField.value, 10);
    if (isNaN(idx)) {
      $currentBlock.hidden = true;
      $proposedBlock.hidden = true;
      return;
    }
    const block = contentBlocks[idx];
    $currentText.textContent = getBlockText(block);
    $currentBlock.hidden = false;
    $proposedBlock.hidden = false;
  };
}

function setupOrderSelection(type) {
  // Sous-choix : couplets / refrain / commentaires
  $targetSelect.hidden = false;
  $targetField.innerHTML = '<option value="">— Quoi réordonner ? —</option>'
    + Object.entries(ORDRE_OPTIONS).map(([val, lbl]) =>
        `<option value="${val}">${escapeHtml(lbl)}</option>`
      ).join('');

  $targetField.onchange = () => {
    const val = $targetField.value;
    if (!val) {
      $currentBlock.hidden = true;
      return;
    }

    let wantedTypes = ['verse', 'source_block'];
    if (val === 'refrain') wantedTypes = ['refrain'];
    if (val === 'commentaires') wantedTypes = ['comment'];

    const blocks = contentBlocks
      .map((b, i) => ({ block: b, index: i, globalIdx: i }))
      .filter(item => wantedTypes.includes(item.block.type));

    if (blocks.length < 2) {
      setStatus('Il n\'y a pas assez de blocs à réordonner.', 'info');
      $currentBlock.hidden = true;
      return;
    }

    $currentBlock.hidden = false;
    $currentText.textContent = 'Ordre actuel :\n' +
      blocks.map(item => `• ${getBlockLabel(item.block, item.index)}`).join('\n');
  };
}

function setupCategorySelection() {
  $categorySelect.innerHTML = '<option value="">— Choisir une catégorie —</option>'
    + Object.entries(CATEGORIES_LABELS)
        .filter(([id]) => id !== categoryId)
        .map(([id, label]) =>
          `<option value="${id}">${escapeHtml(label)}</option>`
        ).join('');

  $categoryBlock.hidden = false;
}

// ------------------------------------------------------------
// Turnstile (invisible)
// ------------------------------------------------------------
function initTurnstile() {
  if (typeof turnstile === 'undefined') {
    // Attendre que Turnstile soit chargé
    setTimeout(initTurnstile, 200);
    return;
  }

  turnstileId = turnstile.render('#turnstile-container', {
    sitekey: TURNSTILE_SITE_KEY,
callback: (token) => {
      turnstileToken = token;
      updateSubmitState();
    },
    'error-callback': () => {
      turnstileToken = null;
      setStatus('Erreur de vérification anti-spam. Rechargez la page.', 'error');
      updateSubmitState();
    },
    'expired-callback': () => {
      turnstileToken = null;
      updateSubmitState();
    }
  });
}

function resetTurnstile() {
  if (turnstileId != null && typeof turnstile !== 'undefined') {
    turnstile.reset(turnstileId);
    turnstileToken = null;
  }
}

// ------------------------------------------------------------
// Validation du formulaire
// ------------------------------------------------------------
function updateSubmitState() {
  const hasType = !!selectedType;
  const hasTarget = !$targetSelect.hidden ? $targetField.value !== '' : true;
  const hasCategory = !$categoryBlock.hidden ? $categorySelect.value !== '' : true;

  // Selon le mode :
  // - signaler   : description obligatoire (>= 5 caractères)
  // - correction : description optionnelle, correction obligatoire (>= 5 caractères)
  const messageOk = $message.value.trim().length >= 5;
  const proposedOk = $proposed.value.trim().length >= 5;

  const modeOk = currentMode === 'correction'
    ? proposedOk
    : messageOk;

  $submit.disabled = !(hasType && hasTarget && hasCategory && modeOk && turnstileToken);
}

function updateStep(step) {
  if ($stepDots && $stepDots.length >= 3) {
    $stepDots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i < step);
    });
  }
  if ($stepLabel) {
    const labels = {
      1: 'Étape 1 sur 3 · Choisir le type',
      2: 'Étape 2 sur 3 · Décrire le problème',
      3: 'Étape 3 sur 3 · Envoyer'
    };
    $stepLabel.textContent = labels[step] || labels[1];
  }
}

function showHint(type) {
  if (!$hintBlock || !$hintText) return;
  const hint = TYPE_HINTS[type];
  if (hint) {
    $hintText.textContent = hint;
    $hintBlock.hidden = false;
  } else {
    $hintBlock.hidden = true;
  }
}

function hideHint() {
  if ($hintBlock) $hintBlock.hidden = true;
}

function applyMode(mode) {
  currentMode = mode;

  // État visuel du toggle
  if ($modeToggle) {
    $modeToggle.querySelectorAll('.report-mode-btn').forEach(btn => {
      const active = btn.dataset.mode === mode;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', String(active));
    });
  }

  // Adapter les libellés et l'obligation
  if (mode === 'correction') {
    if ($msgLabel) $msgLabel.textContent = 'Description (optionnelle)';
    if ($msgReq) $msgReq.hidden = true;
    $message.required = false;
    $message.placeholder = 'Contexte ou détails supplémentaires…';

    if ($proposedBlock) {
      const proposedLabel = document.querySelector('#report-proposed-block label');
      if (proposedLabel) {
        proposedLabel.innerHTML = 'Correction proposée <span class="report-required">*</span>';
      }
    }

    // Afficher le bloc "correction proposée" si un type est déjà sélectionné
    if (selectedType) {
      $proposedBlock.hidden = false;
    }
  } else {
    if ($msgLabel) $msgLabel.textContent = 'Description';
    if ($msgReq) $msgReq.hidden = false;
    $message.required = true;
    $message.placeholder = 'Décrivez le problème…';

    if ($proposedBlock) {
      const proposedLabel = document.querySelector('#report-proposed-block label');
      if (proposedLabel) {
        proposedLabel.innerHTML = 'Correction proposée <span class="report-optional">(optionnel)</span>';
      }
    }
  }

  // Adapter le texte de rassurance
  const $reassurance = document.querySelector('.report-reassurance p');
  if ($reassurance) {
    $reassurance.textContent = mode === 'correction'
      ? 'Votre correction sera examinée et publiée si elle est validée.'
      : 'Votre signalement sera lu par un administrateur et traité sous 7 jours.';
  }

  updateSubmitState();
}

$message.addEventListener('input', updateSubmitState);
$categorySelect.addEventListener('change', updateSubmitState);

// ------------------------------------------------------------
// Envoi
// ------------------------------------------------------------
async function submitReport(event) {
  event.preventDefault();

  if (!selectedType) return;

  const payload = {
    scope: currentScope,
    cantiqueId: currentHymn ? currentHymn.id : (hymnId || ''),
    cantiqueTitle: (currentVersion && currentVersion.title) || (currentHymn && currentHymn.title) || '',
    categoryId: categoryId,
    scopeContext: currentScope === 'liste-cantiques' ? categoryId : '',
    mode: currentMode,
    languageCode: (currentVersion && currentVersion.language && currentVersion.language.code) || '',
    versionId: (currentVersion && currentVersion.id) || '',
    type: selectedType,
    message: $message.value.trim(),
    reporterName: $name.value.trim(),
    reporterContact: $contact.value.trim(),
    appVersion: APP_VERSION,
    platform: 'pwa',
    'cf-turnstile-response': turnstileToken
  };

  // Données spécifiques au type
  if (!$targetSelect.hidden && $targetField.value !== '') {
    const idx = parseInt($targetField.value, 10);
    if (!isNaN(idx)) {
      payload.targetIndex = idx;
      payload.blockId = (contentBlocks[idx] && contentBlocks[idx].id) || '';
      payload.currentText = getBlockText(contentBlocks[idx]);
    }
  }

  if (!$proposedBlock.hidden && $proposed.value.trim()) {
    payload.proposedText = $proposed.value.trim();
  }

  if (!$categoryBlock.hidden && $categorySelect.value) {
    payload.proposedText = payload.proposedText || '';
    payload.message = `Catégorie suggérée : ${CATEGORIES_LABELS[$categorySelect.value]}\n\n${payload.message}`;
  }

  $submit.disabled = true;
  const originalHTML = $submit.innerHTML;
  $submit.innerHTML = '<i data-lucide="loader"></i><span>Envoi…</span>';
  if (window.lucide) lucide.createIcons();
  clearStatus();

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || `Erreur ${response.status}`);
    }

    // Succès
    $form.hidden = true;
    $success.hidden = false;
    if (window.lucide) lucide.createIcons();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    console.error('Erreur envoi :', err);
    setStatus(err.message || 'Une erreur est survenue. Réessayez.', 'error');
    $submit.innerHTML = originalHTML;
    if (window.lucide) lucide.createIcons();
    resetTurnstile();
    updateSubmitState();
  }
}

// ------------------------------------------------------------
// Navigation
// ------------------------------------------------------------
function backToHymn() {
  const url = `cantique.html?hymn=${encodeURIComponent(hymnId || '')}`
            + `&category=${encodeURIComponent(categoryId)}`;
  window.location.href = url;
}

if ($backButton) $backButton.addEventListener('click', () => {
  if (document.referrer) history.back();
  else backToHymn();
});

if ($backToHymn) $backToHymn.addEventListener('click', backToHymn);

// ------------------------------------------------------------
// Initialisation
// ------------------------------------------------------------
$typesGrid.querySelectorAll('.report-type-card').forEach(card => {
  card.addEventListener('click', () => selectType(card.dataset.type));
});

if ($modeToggle) {
  $modeToggle.querySelectorAll('.report-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => applyMode(btn.dataset.mode));
  });
}

$form.addEventListener('submit', submitReport);

(async () => {
  const hymn = await loadHymn();
  if (!hymn) return;

  $loading.hidden = true;
  $form.hidden = false;

  // Adapter le titre et l'intro selon le scope
  const texts = SCOPE_TEXTS[currentScope] || SCOPE_TEXTS['cantique'];
  const $headerTitle = document.querySelector('.report-header-title h1');
  const $intro = document.querySelector('.report-intro');
  if ($headerTitle) $headerTitle.textContent = texts.title;
  if ($intro) $intro.textContent = texts.intro;

  // Filtrer les types visibles
  filterTypesByScope();

  // Initialiser le stepper à l'étape 1
  updateStep(1);

  if (window.lucide) lucide.createIcons();

  initTurnstile();
})();
