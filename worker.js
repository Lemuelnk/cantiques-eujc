// Cantiques EUJC — Worker de routing + service des pages SEO statiques
// Deux types de routes :
//   /cantique/:cat/:num  → page statique /cantique/:cat/:num/index.html si elle existe
//                          sinon fallback cantique.html (avec JS)
//   /categorie/:cat      → page statique /categorie/:cat/index.html si elle existe
//                          sinon fallback cantiques.html?category=:cat (avec JS)

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // ----- /cantique/:cat/:num -----
    const mCantique = path.match(/^\/cantique\/([^\/]+)\/([^\/]+)\/?$/);
    // Ignorer les fichiers statiques avec extension (.js, .css, .png…)
    const isStaticFile = mCantique && /\.[a-zA-Z0-9]{2,5}$/.test(mCantique[2]);

    if (mCantique && !isStaticFile) {
      // 1. Essayer la page statique SEO : /cantique/:cat/:num/index.html
      const seoPath = new URL(request.url);
      seoPath.pathname = `/cantique/${mCantique[1]}/${mCantique[2]}/index.html`;
      const seoResponse = await env.ASSETS.fetch(seoPath);
      if (seoResponse.status !== 404) return seoResponse;

      // 2. Fallback : cantique.html (chargera les données via JS)
      const fallback = new URL(request.url);
      fallback.pathname = '/cantique.html';
      return env.ASSETS.fetch(fallback);
    }

    // ----- /categorie/:cat -----
    const mCategorie = path.match(/^\/categorie\/([^\/]+)\/?$/);

    if (mCategorie) {
      // 1. Essayer la page statique SEO : /categorie/:cat/index.html
      const seoPath = new URL(request.url);
      seoPath.pathname = `/categorie/${mCategorie[1]}/index.html`;
      const seoResponse = await env.ASSETS.fetch(seoPath);
      if (seoResponse.status !== 404) return seoResponse;

      // 2. Fallback : cantiques.html?category=:cat
      const fallback = new URL(request.url);
      fallback.pathname = '/cantiques.html';
      fallback.search = `?category=${encodeURIComponent(mCategorie[1])}`;
      return env.ASSETS.fetch(fallback);
    }

    // ----- /cantique sans paramètres -----
    if (path === '/cantique' || path === '/cantique/') {
      return Response.redirect(new URL('/cantiques.html', url).href, 302);
    }

    // ----- Tout le reste : assets par défaut -----
    // (anciens liens ?hymn=UUID continuent de fonctionner)
    return env.ASSETS.fetch(request);
  }
};
