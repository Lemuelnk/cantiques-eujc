// Cantiques EUJC - Worker de routing
// Sert cantique.html pour /cantique/:cat/:num

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // /cantique/:category/:number -> cantique.html
    const m = path.match(/^\/cantique\/([^\/]+)\/([^\/]+)\/?$/);
    if (m) {
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
