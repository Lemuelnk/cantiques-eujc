# SEO deployment workflow

The SEO page generator is dependency-free and runs before Cloudflare Pages deploys the \`app/\` directory.

## Local validation

From the repository root:

~~~bash
python3 scripts/generate_seo_pages.py
python3 scripts/validate_seo.py
~~~

The validator checks canonical JSON syntax, duplicate hymn IDs/routes, hymns without numbers, generated pages, visible content, canonical links, JSON-LD, and sitemap completeness.

## Cloudflare Pages

Use the repository root as the build context:

- Build command: \`python3 scripts/generate_seo_pages.py\`
- Build output directory: \`app\`

Run the generator on every deployment so canonical data changes cannot leave HTML pages or the sitemap stale.

Cloudflare Pages serves a top-level \`index.html\` at \`/\` and \`.../index.html\` directories at extensionless routes, so no root redirect is required.

## Source of truth

Do not edit generated hymn pages manually.

Source:
\`app/data/canonical/*.json\`

Generated:
\`app/cantique/<category>/<number>/index.html\`
