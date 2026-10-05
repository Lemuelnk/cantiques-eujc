// ============================================================
// Cantiques EUJC — Bandeau d'installation iOS
// Affiche un guide "Ajouter a l'ecran d'accueil" sur iPhone/iPad
// quand l'app n'est pas deja installee.
// ============================================================
(function () {
  'use strict';

  // 1. Deja installee ? (mode standalone PWA)
  var isStandalone =
    window.navigator.standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches;
  if (isStandalone) return;

  // 2. Deja vu / deja masque par l'utilisateur ?
  try {
    if (localStorage.getItem('eujc-ios-banner-dismissed') === '1') return;
  } catch (e) {}

  // 3. Detection iOS
  var ua = window.navigator.userAgent || '';
  var isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (!isIOS) return;

  // 4. Dans Safari (pas dans Chrome iOS / Firefox iOS / etc.)
  var isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);

  // 5. Style injecte
  var style = document.createElement('style');
  style.textContent = [
    '#ios-install-banner {',
    '  position: fixed;',
    '  left: 12px; right: 12px; bottom: 12px;',
    '  background: #001A17;',
    '  color: #F5F0E6;',
    '  border: 1px solid rgba(201, 169, 97, 0.4);',
    '  border-radius: 16px;',
    '  padding: 16px 18px 14px;',
    '  box-shadow: 0 10px 30px rgba(0,0,0,0.35);',
    '  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;',
    '  font-size: 14px;',
    '  line-height: 1.4;',
    '  z-index: 99999;',
    '  transform: translateY(calc(100% + 20px));',
    '  transition: transform 280ms ease;',
    '  max-width: 460px;',
    '  margin: 0 auto;',
    '}',
    '#ios-install-banner.is-open {',
    '  transform: translateY(0);',
    '}',
    '#ios-install-banner .ios-title {',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 8px;',
    '  font-weight: 700;',
    '  font-size: 15px;',
    '  color: #C9A961;',
    '  margin-bottom: 8px;',
    '}',
    '#ios-install-banner .ios-close {',
    '  position: absolute;',
    '  top: 8px; right: 10px;',
    '  background: transparent;',
    '  border: 0;',
    '  color: #C9A961;',
    '  font-size: 22px;',
    '  line-height: 1;',
    '  padding: 4px 8px;',
    '  cursor: pointer;',
    '  font-family: inherit;',
    '}',
    '#ios-install-banner .ios-body {',
    '  color: #F5F0E6;',
    '}',
    '#ios-install-banner .ios-step {',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 10px;',
    '  margin-top: 6px;',
    '}',
    '#ios-install-banner .ios-icon {',
    '  flex-shrink: 0;',
    '  width: 26px; height: 26px;',
    '  display: inline-flex;',
    '  align-items: center; justify-content: center;',
    '  background: rgba(201, 169, 97, 0.15);',
    '  border-radius: 8px;',
    '  color: #C9A961;',
    '  font-size: 16px;',
    '}',
    '#ios-install-banner .ios-alt {',
    '  margin-top: 10px;',
    '  padding-top: 10px;',
    '  border-top: 1px solid rgba(201, 169, 97, 0.2);',
    '  font-size: 12.5px;',
    '  color: rgba(245, 240, 230, 0.75);',
    '}'
  ].join('\n');
  document.head.appendChild(style);

  // 6. Construit le contenu selon Safari ou autre navigateur iOS
  function buildContent() {
    if (isSafari) {
      return [
        '<div class="ios-title">',
        '  <span style="font-size:18px">📲</span>',
        '  <span>Installer Cantiques EUJC</span>',
        '</div>',
        '<div class="ios-body">',
        '  <div class="ios-step">',
        '    <span class="ios-icon">1</span>',
        '    <span>Touchez <b>Partager</b> en bas de Safari</span>',
        '  </div>',
        '  <div class="ios-step">',
        '    <span class="ios-icon">2</span>',
        '    <span>Choisissez <b>Sur l\u2019\u00e9cran d\u2019accueil</b></span>',
        '  </div>',
        '  <div class="ios-step">',
        '    <span class="ios-icon">3</span>',
        '    <span>Touchez <b>Ajouter</b> en haut \u00e0 droite</span>',
        '  </div>',
        '</div>'
      ].join('');
    }
    // Chrome iOS, Firefox iOS, etc.
    return [
      '<div class="ios-title">',
      '  <span style="font-size:18px">📲</span>',
      '  <span>Installer Cantiques EUJC</span>',
      '</div>',
      '<div class="ios-body">',
      '  <div style="margin-bottom:8px">',
      '    Sur iPhone, seul <b>Safari</b> permet d\u2019installer une application web.',
      '  </div>',
      '  <div class="ios-alt">',
      '    Ouvrez cette page dans <b>Safari</b>, puis touchez <b>Partager</b> \u2192 <b>Sur l\u2019\u00e9cran d\u2019accueil</b>.',
      '  </div>',
      '</div>'
    ].join('');
  }

  // 7. Injecte le bandeau
  function show() {
    var el = document.createElement('div');
    el.id = 'ios-install-banner';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', "Installation de l'application");
    el.innerHTML =
      '<button class="ios-close" aria-label="Fermer" type="button">\u00d7</button>' +
      buildContent();

    document.body.appendChild(el);

    // Animation d'entree
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        el.classList.add('is-open');
      });
    });

    // Fermeture
    function dismiss() {
      el.classList.remove('is-open');
      try {
        localStorage.setItem('eujc-ios-banner-dismissed', '1');
      } catch (e) {}
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 320);
    }

    el.querySelector('.ios-close').addEventListener('click', dismiss);

    // Auto-hide apres 45s si non dismiss
    setTimeout(function () {
      if (el.parentNode && el.classList.contains('is-open')) dismiss();
    }, 45000);
  }

  // 8. Attend que le body soit dispo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(show, 900);
    });
  } else {
    setTimeout(show, 900);
  }
})();
