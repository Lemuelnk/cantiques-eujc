// ============================================================
// Cantiques EUJC — Page Plus (hub)
// ============================================================

const $btnShareApp = document.getElementById('btn-share-app');

if ($btnShareApp) {
  $btnShareApp.addEventListener('click', async () => {
    const shareData = {
      title: 'Cantiques EUJC',
      text: 'Découvrez Cantiques EUJC — Le recueil dans votre poche.',
      url: 'https://lnk-studio.com/apps.html'
    };

    if (navigator.share) {
      try { await navigator.share(shareData); }
      catch (e) { /* annulé */ }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        alert('Lien copié dans le presse-papier');
      } catch {
        prompt('Copiez ce lien :', shareData.url);
      }
    }
  });
}

if (window.lucide) lucide.createIcons();
