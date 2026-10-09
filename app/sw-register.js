// ============================================================
// Cantiques EUJC — Enregistrement du Service Worker
// ============================================================
// NOTE : désactivé temporairement pour éliminer les caches fantômes.
// À réactiver quand tout sera stabilisé.

(function () {
  if (!('serviceWorker' in navigator)) return;

  // 1. Désinscrire TOUS les service workers existants
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(reg => {
      reg.unregister().then(() => {
        console.log('[SW] Désinscrit :', reg.scope);
      });
    });
  });

  // 2. Nettoyer tous les caches
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name).then(() => {
          console.log('[SW] Cache supprimé :', name);
        });
      });
    });
  }

  // 3. NE PAS enregistrer de nouveau SW pour l'instant
  // navigator.serviceWorker.register('sw.js');
})();
