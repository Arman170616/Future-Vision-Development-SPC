// Writes public/sitemap.xml before each build: the main pages plus every project, blog post and job
// currently published on the live API. If the API can't be reached, the main pages are still listed.
import { readFileSync, writeFileSync } from 'node:fs';

const SITE = 'https://futureinnvo.com';
const env = readFileSync(new URL('../.env.production', import.meta.url), 'utf8');
const API = (env.match(/^VITE_API_BASE_URL=(.+)$/m)?.[1] ?? 'https://api.futureinnvo.com/api/v1').trim().replace(/\/$/, '');

const PAGES = [
  ['/', 'weekly', 1.0],
  ['/about', 'monthly', 0.8],
  ['/projects', 'weekly', 0.9],
  ['/courses', 'weekly', 0.9],
  ['/blog', 'weekly', 0.8],
  ['/team', 'monthly', 0.7],
  ['/ceo-message', 'yearly', 0.5],
  ['/activities', 'monthly', 0.6],
  ['/gallery', 'monthly', 0.5],
  ['/jobs', 'weekly', 0.7],
  ['/career', 'monthly', 0.6],
  ['/contact', 'yearly', 0.7],
  ['/privacy', 'yearly', 0.3],
];

async function list(path) {
  const items = [];
  let url = `${API}${path}`;
  try {
    while (url) {
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) break;
      const data = await res.json();
      items.push(...(Array.isArray(data) ? data : data.results ?? []));
      url = Array.isArray(data) ? null : data.next;
    }
  } catch (err) {
    console.warn(`sitemap: could not load ${path} (${err.message}) — skipping`);
  }
  return items;
}

const day = value => (value ? String(value).slice(0, 10) : undefined);
const [projects, posts, jobs] = await Promise.all([list('/projects/'), list('/posts/'), list('/jobs/')]);

const urls = [
  ...PAGES.map(([path, changefreq, priority]) => ({ path, changefreq, priority })),
  ...projects.filter(p => p.slug).map(p => ({ path: `/projects/${p.slug}`, changefreq: 'monthly', priority: 0.7, lastmod: day(p.updated_at) })),
  ...posts.filter(p => p.slug).map(p => ({ path: `/blog/${p.slug}`, changefreq: 'monthly', priority: 0.6, lastmod: day(p.updated_at ?? p.published_at) })),
  ...jobs.filter(j => j.id).map(j => ({ path: `/jobs/${j.id}`, changefreq: 'weekly', priority: 0.5, lastmod: day(j.updated_at) })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map(u => {
  const loc = `${SITE}${u.path}`;
  const sep = loc.includes('?') ? '&amp;' : '?';
  return `  <url>
    <loc>${loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority.toFixed(1)}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${loc}${sep}lang=en"/>
    <xhtml:link rel="alternate" hreflang="ar" href="${loc}${sep}lang=ar"/>
  </url>`;
}).join('\n')}
</urlset>
`;
writeFileSync(new URL('../public/sitemap.xml', import.meta.url), xml);
console.log(`sitemap: ${urls.length} URLs (${projects.length} projects, ${posts.length} posts, ${jobs.length} jobs)`);
