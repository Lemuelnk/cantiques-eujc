// ============================================================
// Cantiques EUJC — Page Leçons du Chemin
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }

  // Alerte temporaire pour les leçons indéterminées (href="#")
  document.querySelectorAll('.lesson-row[href="#"]').forEach(row => {
    row.addEventListener('click', (event) => {
      event.preventDefault();
      const number = row.querySelector('.lesson-number')?.textContent.trim();
      const name = row.querySelector('.lesson-name')?.textContent.trim();
      if (name) {
        alert(
          `${number} — ${name}\n\n` +
          'Cette leçon sera raccordée dès que son titre sera déterminé.'
        );
      }
    });
  });
});
