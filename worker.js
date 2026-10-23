// Cantiques EUJC — Worker de routing
// html_handling: "none" → Cloudflare ne fait AUCUNE traduction, on gère tout ici.
// Routes :
//   /                     → /index.html
//   /cantique/:cat/:num   → page statique SEO ou fallback cantique.html
//   /categorie/:cat       → page statique SEO ou fallback cantiques.html?category=:cat
//   /X (sans extension)   → /X.html si existe, sinon 404
//   /X.ext                → fichier statique direct

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let path = url.pathname;

    // ----- 0. Preflight CORS (OPTIONS) pour /data/* -----
    if (request.method === 'OPTIONS' && path.startsWith('/data/')) {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': 'https://lnk-studio.com',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400'
        }
      });
    }

    // ----- 1. Racine → /index.html -----
    if (path === '/' || path === '') {
      const indexPath = new URL(request.url);
      indexPath.pathname = '/index.html';
      return env.ASSETS.fetch(indexPath);
    }

    // ----- 1b. /cantique/:cat/ (sans num) → redirection vers la catégorie -----
    const mCatSansNum = path.match(/^\/cantique\/([^\/]+)\/?$/);
    if (mCatSansNum) {
      return Response.redirect(
        new URL('/categorie/' + mCatSansNum[1] + '/', url).href,
        302
      );
    }

    // ----- 2. /cantique/:cat/:num -----
    const mCantique = path.match(/^\/cantique\/([^\/]+)\/([^\/]+)\/?$/);
    const isStaticFile = mCantique && /\.[a-zA-Z0-9]{2,5}$/.test(mCantique[2]);

    if (mCantique && !isStaticFile) {
      // Page statique SEO : /cantique/:cat/:num/index.html
      const seoPath = new URL(request.url);
      seoPath.pathname = `/cantique/${mCantique[1]}/${mCantique[2]}/index.html`;
      const seoResponse = await env.ASSETS.fetch(seoPath);
      if (seoResponse.status !== 404) return seoResponse;

      // Fallback : cantique.html
      const fallback = new URL(request.url);
      fallback.pathname = '/cantique.html';
      return env.ASSETS.fetch(fallback);
    }

    // ----- 3. /categorie/:cat -----
    const mCategorie = path.match(/^\/categorie\/([^\/]+)\/?$/);

    if (mCategorie) {
      // Page statique SEO : /categorie/:cat/index.html
      const seoPath = new URL(request.url);
      seoPath.pathname = `/categorie/${mCategorie[1]}/index.html`;
      const seoResponse = await env.ASSETS.fetch(seoPath);
      if (seoResponse.status !== 404) return seoResponse;

      // Fallback : cantiques.html?category=:cat
      const fallback = new URL(request.url);
      fallback.pathname = '/cantiques.html';
      fallback.search = `?category=${encodeURIComponent(mCategorie[1])}`;
      return env.ASSETS.fetch(fallback);
    }

    // ----- 4. /cantique sans params → redirection -----
    if (path === '/cantique' || path === '/cantique/') {
      return Response.redirect(new URL('/cantiques.html', url).href, 302);
    }

    // ----- 5. Fichier statique (avec extension) → direct -----
    if (/\.[a-zA-Z0-9]{2,5}$/.test(path)) {
      return env.ASSETS.fetch(request);
    }

    // ----- 6. Route sans extension → essayer /X.html puis /X/index.html -----
    // Exemple : /signaler → /signaler.html, /apropos → /apropos.html
    const htmlTry = new URL(request.url);
    htmlTry.pathname = path.replace(/\/$/, '') + '.html';
    const htmlResponse = await env.ASSETS.fetch(htmlTry);
    if (htmlResponse.status !== 404) return htmlResponse;

    // ----- 7. 404 final -----
    const notFound = new URL(request.url);
    notFound.pathname = '/404.html';
    return env.ASSETS.fetch(notFound);
  }
};
