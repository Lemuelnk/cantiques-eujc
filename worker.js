// Cantiques EUJC - Worker de routing
// Sert cantique.html pour /cantique/:cat/:num

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // /cantique/:category/:number -> cantique.html
    const m = path.match(/^\/cantique\/([^\/]+)\/([^\/]+)\/?$/);
    // Ignorer les fichiers statiques (extensions) : .js, .css, .png, etc.
    const isStaticFile = m && /\.[a-zA-Z0-9]{2,5}$/.test(m[2]);
    if (m && !isStaticFile) {
      // Serve the generated static SEO page when it exists.
      // Fall back to the legacy JS detail page for routes not generated
      // from the canonical corpus.
      const staticResponse = await env.ASSETS.fetch(request);
      if (staticResponse.status !== 404) return staticResponse;

      const rewritten = new URL(request.url);
      rewritten.pathname = '/cantique.html';
      return env.ASSETS.fetch(rewritten);
    }

    // /cantique sans params -> cantiques.html
    if (path === '/cantique' || path === '/cantique/') {
      return Response.redirect(new URL('/cantiques.html', url).href, 302);
    }

    // Tout le reste : assets par defaut (les anciens liens ?hymn=UUID continuent de marcher)
    return env.ASSETS.fetch(request);
  }
};
