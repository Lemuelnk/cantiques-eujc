const params = new URLSearchParams(window.location.search);

const categoryId = params.get("category") || "lesson-1";

const categoryData = {
  "lesson-1": {
    title: "Leçon 1 — Création",
    count: 12
  }
};

const category = categoryData[categoryId] || categoryData["lesson-1"];

const categoryTitle = document.getElementById("category-title");
const categoryCount = document.getElementById("category-count");

const backButton = document.getElementById("back-button");
const searchButton = document.getElementById("search-button");
const searchPanel = document.getElementById("search-panel");
const searchInput = document.getElementById("hymn-search");
const clearSearch = document.getElementById("clear-search");

const hymnsList = document.getElementById("hymns-list");
const emptyState = document.getElementById("empty-state");

const sortButton = document.getElementById("sort-button");
const sortSheet = document.getElementById("sort-sheet");
const sortBackdrop = document.getElementById("sort-backdrop");
const closeSort = document.getElementById("close-sort");
const sortOptions = document.querySelectorAll(".sort-option");

categoryTitle.textContent = category.title;
categoryCount.textContent =
  `${category.count} cantique${category.count > 1 ? "s" : ""}`;


/* RETOUR */

backButton.addEventListener("click", () => {
  if (document.referrer) {
    history.back();
  } else {
    window.location.href = "categories.html";
  }
});


/* RECHERCHE */

searchButton.addEventListener("click", () => {
  const isHidden = searchPanel.hidden;

  searchPanel.hidden = !isHidden;

  if (isHidden) {
    searchInput.focus();
  } else {
    searchInput.value = "";
    filterHymns("");
  }
});

clearSearch.addEventListener("click", () => {
  searchInput.value = "";
  filterHymns("");
  searchInput.focus();
});

searchInput.addEventListener("input", () => {
  filterHymns(searchInput.value);
});

function filterHymns(query) {
  const normalizedQuery = query
    .trim()
    .toLowerCase();

  const rows = [...hymnsList.querySelectorAll(".hymn-row")];

  let visible = 0;

  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    const match = !normalizedQuery || text.includes(normalizedQuery);

    row.hidden = !match;

    if (match) {
      visible++;
    }
  });

  emptyState.hidden = visible !== 0;
}


/* TRI */

sortButton.addEventListener("click", openSort);
sortBackdrop.addEventListener("click", closeSortSheet);
closeSort.addEventListener("click", closeSortSheet);

function openSort() {
  sortBackdrop.hidden = false;
  sortSheet.setAttribute("aria-hidden", "false");

  requestAnimationFrame(() => {
    sortSheet.classList.add("open");
  });
}

function closeSortSheet() {
  sortSheet.classList.remove("open");
  sortSheet.setAttribute("aria-hidden", "true");

  setTimeout(() => {
    sortBackdrop.hidden = true;
  }, 220);
}

sortOptions.forEach(option => {
  option.addEventListener("click", () => {
    sortOptions.forEach(item => {
      item.classList.remove("active");
    });

    option.classList.add("active");

    const sortType = option.dataset.sort;

    if (sortType === "alphabetical") {
      sortAlphabetically();
    }

    if (sortType === "source") {
      restoreSourceOrder();
    }

    if (sortType === "favorites") {
      sortFavorites();
    }

    closeSortSheet();
  });
});


/* TRI ALPHABÉTIQUE */

function sortAlphabetically() {
  const rows = getRows();

  rows.sort((a, b) => {
    const titleA = getTitle(a);
    const titleB = getTitle(b);

    return titleA.localeCompare(titleB, "fr", {
      sensitivity: "base"
    });
  });

  rows.forEach(row => hymnsList.appendChild(row));
}


/* ORDRE SOURCE */

function restoreSourceOrder() {
  const rows = getRows();

  rows.sort((a, b) => {
    return Number(a.dataset.sourcePosition || 0)
      - Number(b.dataset.sourcePosition || 0);
  });

  rows.forEach(row => hymnsList.appendChild(row));
}


/* FAVORIS */

function sortFavorites() {
  const rows = getRows();

  rows.sort((a, b) => {
    const aFavorite = a.classList.contains("is-favorite");
    const bFavorite = b.classList.contains("is-favorite");

    return Number(bFavorite) - Number(aFavorite);
  });

  rows.forEach(row => hymnsList.appendChild(row));
}


function getRows() {
  return [...hymnsList.querySelectorAll(".hymn-row")];
}


function getTitle(row) {
  return row.querySelector(".hymn-content h2")?.textContent.trim() || "";
}


/* FAVORIS */

document.querySelectorAll(".favorite-button").forEach(button => {
  button.addEventListener("click", event => {
    event.stopPropagation();

    const row = button.closest(".hymn-row");
    row.classList.toggle("is-favorite");

    const icon = button.querySelector("svg");

    if (row.classList.contains("is-favorite")) {
      button.setAttribute("aria-label", "Retirer des favoris");
      icon?.setAttribute("fill", "currentColor");
    } else {
      button.setAttribute("aria-label", "Ajouter aux favoris");
      icon?.setAttribute("fill", "none");
    }
  });
});


/* VERSIONS */

document.querySelectorAll(".versions-button").forEach(button => {
  button.addEventListener("click", event => {
    event.stopPropagation();

    /*
     * Le sélecteur de versions linguistiques sera branché
     * lorsque les données réelles des versions seront intégrées.
     */
    console.log("Versions linguistiques");
  });
});


/* POSITION SOURCE POUR LE TRI */

document.querySelectorAll(".hymn-row").forEach((row, index) => {
  row.dataset.sourcePosition = index + 1;
});
