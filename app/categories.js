document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }

  document
    .querySelectorAll('.category-row[href="#"]')
    .forEach(row => {
      row.addEventListener('click', event => {
        event.preventDefault();

        const name = row.querySelector('.row-name')?.textContent.trim();

        if (name) {
          alert(
            name +
            '\n\nCette catégorie sera raccordée ensuite.'
          );
        }
      });
    });
});
