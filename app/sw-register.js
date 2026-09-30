// Enregistrement du Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js', { scope: './' })
      .then(reg => console.log('✅ SW enregistré :', reg.scope))
      .catch(err => console.warn('⚠️ SW échec :', err));
  });
}
