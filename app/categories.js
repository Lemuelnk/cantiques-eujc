document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) {
    lucide.createIcons();
  }

  document
    .querySelectorAll('[data-nav="recherche"], [data-nav="plus"]')
    .forEach(button => {
      button.addEventListener('click', () => {
        const destination = button.dataset.nav;

        alert(
          {
            recherche: 'Recherche',
            plus: 'Plus'
          }[destination] +
          '\n\nCette section sera construite ensuite.'
        );
      });
    });

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
