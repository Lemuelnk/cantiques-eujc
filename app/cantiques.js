const params = new URLSearchParams(window.location.search);

const categoryId = params.get("category") || "lesson-1";

const categoryData = {
  "lesson-1": {
    title: "Leçon 1 — Création"
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
categoryCount.textContent = "Chargement…";


/* DONNÉES */

async function loadCategoryHymns() {
  if (categoryId !== "lesson-1") {
    categoryCount.textContent = "Catégorie non disponible";
    return;
  }

  try {
    const response = await fetch("data/lesson-1-creation.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    const hymns = Array.isArray(data.hymns) ? data.hymns : [];

    categoryTitle.textContent = `Leçon ${data.lesson.number} — ${data.lesson.title}`;
    categoryCount.textContent = `${hymns.length} cantique${hymns.length > 1 ? "s" : ""}`;

    hymnsList.innerHTML = "";

    hymns.forEach(hymn => {
      const row = document.createElement("article");
      row.className = "hymn-row";
      row.dataset.sourcePosition = hymn.source_position ?? "";
      row.dataset.sourceNumber = hymn.source_number ?? "";

      const number = document.createElement("div");
      number.className = "hymn-number";
      number.textContent = hymn.source_number || String(hymn.source_position).padStart(2, "0");

      const content = document.createElement("div");
      content.className = "hymn-content";

      const title = document.createElement("h2");
      title.textContent = hymn.title;

      const meta = document.createElement("p");
      const language = hymn.language || data.source?.language || "";
      meta.textContent = language ? `${language.toUpperCase()} · Position source ${hymn.source_position}` : `Position source ${hymn.source_position}`;

      content.append(title, meta);

      const favorite = document.createElement("button");
      favorite.className = "favorite-button";
      favorite.type = "button";
      favorite.setAttribute("aria-label", "Ajouter aux favoris");
      favorite.innerHTML = '<i data-lucide="star"></i>';

      row.append(number, content, favorite);
      hymnsList.appendChild(row);
    });

    if (window.lucide) lucide.createIcons();
    bindFavoriteButtons();
  } catch (error) {
    console.error("Impossible de charger la liste des cantiques :", error);
    categoryCount.textContent = "Erreur de chargement";
    hymnsList.innerHTML = "";
    emptyState.hidden = false;
    emptyState.querySelector("h2").textContent = "Impossible de charger les cantiques";
    emptyState.querySelector("p").textContent = "Vérifiez la connexion aux données de la leçon.";
  }
}



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

function bindFavoriteButtons() {
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
}


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

loadCategoryHymns();
