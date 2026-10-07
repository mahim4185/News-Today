#!/usr/bin/env node
/**
 * sitemap.xml + feed.xml + robots.txt তৈরি করে।
 * env:  SITE_URL=https://username.github.io/repo
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CATEGORIES } from './feeds.config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SITE = (process.env.SITE_URL || 'https://example.github.io/news-portal').replace(/\/$/, '');

const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const news = JSON.parse(await fs.readFile(path.join(ROOT, 'data', 'news.json'), 'utf8'));

/* ------------------------------ sitemap.xml ------------------------------ */
const urls = [
  { loc: `${SITE}/`, changefreq: 'hourly', priority: '1.0' },
  ...CATEGORIES.filter((c) => c.id !== 'home')
    .map((c) => ({ loc: `${SITE}/?cat=${c.id}`, changefreq: 'hourly', priority: '0.8' })),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${esc(u.loc)}</loc>
    <lastmod>${new Date(news.updatedAt).toISOString()}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

/* -------------------------------- feed.xml ------------------------------- */
const top = news.articles.slice(0, 60);
const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
<channel>
  <title>News Today — Smart AI News Portal</title>
  <link>${esc(SITE)}/</link>
  <description>বাংলাদেশ, ভারত ও বিশ্বের সর্বশেষ খবর — স্বয়ংক্রিয়ভাবে আপডেটেড</description>
  <language>bn-BD</language>
  <lastBuildDate>${new Date(news.updatedAt).toUTCString()}</lastBuildDate>
  <atom:link href="${esc(SITE)}/feed.xml" rel="self" type="application/rss+xml"/>
${top
  .map(
    (a) => `  <item>
    <title>${esc(a.title)}</title>
    <link>${esc(a.url)}</link>
    <guid isPermaLink="false">${esc(a.id)}</guid>
    <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>
    <description>${esc(a.summary)}</description>
    <source url="${esc(a.sourceUrl)}">${esc(a.source)}</source>
    <category>${esc(a.category)}</category>
    ${a.image ? `<media:content url="${esc(a.image)}" medium="image"/>` : ''}
  </item>`,
  )
  .join('\n')}
</channel>
</rss>
`;

/* ------------------------------- robots.txt ------------------------------ */
const robots = `User-agent: *
Allow: /

Crawl-delay: 1

# ⚠️ নিচের লিংকটি SITE_URL environment variable থেকে আসে।
# GitHub Actions-এ SITE_URL সেট করলে (Settings → Variables) এটি নিজে নিজে ঠিক হয়ে যাবে।
Sitemap: ${SITE}/sitemap.xml
`;

if (/USERNAME|example\.github\.io/.test(SITE)) {
  console.warn(
    '\n⚠️  SITE_URL সেট করা হয়নি! GitHub-এ Settings → Secrets and variables → Actions → Variables\n' +
    '   → New repository variable: Name = SITE_URL, Value = https://আপনার-ইউজারনেম.github.io/আপনার-রিপো\n',
  );
}

await fs.writeFile(path.join(ROOT, 'sitemap.xml'), sitemap, 'utf8');
await fs.writeFile(path.join(ROOT, 'feed.xml'), rss, 'utf8');
await fs.writeFile(path.join(ROOT, 'robots.txt'), robots, 'utf8');

console.log(`📄  sitemap.xml (${urls.length} urls), feed.xml (${top.length} items), robots.txt  →  ${SITE}`);
