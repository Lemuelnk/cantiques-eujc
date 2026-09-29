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
    .querySelectorAll('.lesson-row')
    .forEach(row => {

      row.addEventListener('click', event => {

        event.preventDefault();

        const number =
          row.querySelector('.lesson-number')?.textContent.trim();

        const name =
          row.querySelector('.lesson-name')?.textContent.trim();

        if (name) {
          alert(
            `${number} — ${name}\n\n` +
            'La liste des cantiques de cette leçon sera raccordée ensuite.'
          );
        }

      });

    });

});
