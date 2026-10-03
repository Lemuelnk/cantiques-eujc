// ============================================================
// Cantiques EUJC — Page Cantiques de prière
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }

  // Alerte temporaire pour les catégories non branchées (href="#")
  document.querySelectorAll('.lesson-row[href="#"]').forEach(row => {
    row.addEventListener('click', (event) => {
      event.preventDefault();
      const name = row.querySelector('.lesson-name')?.textContent.trim();
      if (name) {
        alert(name + '\n\nCette catégorie sera raccordée ensuite.');
      }
    });
  });
});
