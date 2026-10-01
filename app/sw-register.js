// Enregistrement du Service Worker (uniquement en production)
if ('serviceWorker' in navigator) {
  const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';

  if (isLocalhost) {
    // En local : on désenregistre tous les SW pour éviter le cache
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(reg => reg.unregister());
    });
    console.log('🔧 Mode dev : Service Worker désactivé');
  } else {
    // En production : on enregistre normalement
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js', { scope: './' })
        .then(reg => console.log('✅ SW enregistré :', reg.scope))
        .catch(err => console.warn('⚠️ SW échec :', err));
    });
  }
}
