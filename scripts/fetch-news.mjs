#!/usr/bin/env node
/**
 * ================================================================
 *  Smart AI News Portal — RSS Crawler
 * ---------------------------------------------------------------
 *  সব ফিড থেকে নিউজ এনে → ডিডুপ → সাজিয়ে data/news.json লিখে দেয়।
 *  GitHub Actions প্রতি ৩০ মিনিটে এটা চালায়।
 *
 *  ব্যবহার:  node scripts/fetch-news.mjs
 * ================================================================
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import RSSParser from 'rss-parser';

import {
  FEEDS, OPTIONAL_FEEDS, MAX_AGE_DAYS, PER_FEED_LIMIT, TOTAL_LIMIT, PER_CATEGORY_CAP,
} from './feeds.config.mjs';

/** env USE_GOOGLE_NEWS=true দিলে Google News ফিডও ক্রল হবে */
const USE_OPTIONAL = String(process.env.USE_GOOGLE_NEWS || '').toLowerCase() === 'true';
const SOURCES = USE_OPTIONAL ? [...FEEDS, ...OPTIONAL_FEEDS] : FEEDS;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT_JSON = path.join(ROOT, 'data', 'news.json');
const OUT_FALLBACK = path.join(ROOT, 'data', 'news.fallback.js');

const UA =
  'Mozilla/5.0 (compatible; SmartNewsBot/1.0; +https://github.com/) Chrome/124.0 Safari/537.36';

const parser = new RSSParser({
  headers: { 'User-Agent': UA, Accept: 'application/rss+xml, application/xml, text/xml, */*' },
  timeout: 12000,
  maxRedirects: 5,
  customFields: {
    item: ['media:content', 'media:thumbnail', 'content:encoded', 'itunes:image', 'image'],
  },
});

/* ---------------------------------- helpers ---------------------------------- */

const stripHtml = (s = '') =>
  String(s)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#\d+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const truncate = (s, n) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

function hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

function normalizeTitle(t = '') {
  return String(t)
    .toLowerCase()
    .replace(/[\u0980-\u09FF]/g, (c) => c) // বাংলা অক্ষর রাখি
    .replace(/[^a-z0-9\u0980-\u09FF]+/g, ' ')
    .trim()
    .slice(0, 80);
}

function absolutize(url, base) {
  if (!url) return '';
  try {
    return new URL(url, base).toString();
  } catch {
    return url.startsWith('//') ? `https:${url}` : '';
  }
}

/** RSS আইটেম থেকে যথাসম্ভব ভালো ছবি বের করা */
function pickImage(item, feedUrl) {
  const candidates = [];

  const push = (v) => {
    if (!v) return;
    if (Array.isArray(v)) v.forEach(push);
    else if (typeof v === 'string') candidates.push(v);
    else if (typeof v === 'object') {
      candidates.push(v.url, v.$?.url, v.link, v.href);
    }
  };

  push(item.enclosure?.url || item.enclosure);
  push(item['media:content']);
  push(item['media:thumbnail']);
  push(item['itunes:image']);
  push(item.image);

  // content:encoded / content / description এর ভেতরের <img>
  const html = `${item['content:encoded'] || ''} ${item.content || ''} ${item.description || ''}`;
  const imgTags = html.match(/<img[^>]+src=["']([^"']+)["']/gi) || [];
  for (const tag of imgTags) {
    const m = tag.match(/src=["']([^"']+)["']/i);
    if (m) candidates.push(m[1]);
  }

  for (const raw of candidates) {
    if (!raw || typeof raw !== 'string') continue;
    const u = absolutize(raw.trim(), feedUrl);
    if (!/^https?:\/\//i.test(u)) continue;
    if (/\.svg($|\?)/i.test(u)) continue;
    if (/(spacer|blank|pixel|1x1|default[-_]?(thumb|image)|logo|avatar)/i.test(u)) continue;
    return u;
  }
  return '';
}

function cleanUrl(u = '') {
  try {
    const url = new URL(u);
    // ট্র্যাকিং প্যারামিটার ঝাড়া
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid', 'ref'].forEach(
      (p) => url.searchParams.delete(p),
    );
    return url.toString();
  } catch {
    return u;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, rej) => {
    timer = setTimeout(() => rej(new Error(`timeout (${label})`)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

/* ------------------------------ feed processing ------------------------------ */

async function fetchFeed(feed) {
  for (let attempt = 1; attempt <= 1; attempt++) {
    try {
      const parsed = await withTimeout(parser.parseURL(feed.url), 12000, feed.name);
      const items = (parsed.items || []).slice(0, PER_FEED_LIMIT);
      const cutoff = Date.now() - MAX_AGE_DAYS * 864e5;

      const out = [];
      for (const item of items) {
        let title = stripHtml(item.title || '');
        if (!title || title.length < 6) continue;

        // Google News: "শিরোনাম - সোর্স" → আলাদা করে সোর্স বের করা
        let sourceName = feed.name;
        if (feed.googleNews) {
          const parts = title.split(/\s+-\s+/);
          if (parts.length > 1) {
            const tail = parts.pop();
            if (tail.length <= 40) {
              sourceName = tail || item.source?.$._ || item.source || feed.name;
              title = parts.join(' - ');
            }
          }
        }

        const link = cleanUrl(absolutize(item.link || item.guid || item.id || '', feed.url));
        if (!/^https?:\/\//i.test(link)) continue;

        const pub = item.isoDate || item.pubDate || item.pubdate || null;
        const ts = pub ? new Date(pub).getTime() : Date.now();
        if (!Number.isFinite(ts) || ts < cutoff || ts > Date.now() + 36e5) continue;

        const rawSummary = stripHtml(
          item.contentSnippet || item.summary || item.description || item['content:encoded'] || item.content || '',
        );
        const summary = truncate(
          rawSummary.replace(new RegExp(`^${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s:.-]*`, 'i'), ''),
          260,
        );

        out.push({
          id: hash(link.split('?')[0]),
          title,
          summary: summary || title,
          url: link,
          image: pickImage(item, feed.url),
          source: sourceName,
          sourceUrl: (() => {
            try {
              return new URL(feed.site || feed.url).origin;
            } catch {
              return '';
            }
          })(),
          category: feed.cat,
          country: feed.countryOverride || feed.country,
          lang: feed.lang,
          weight: feed.weight,
          publishedAt: new Date(ts).toISOString(),
          ts,
        });
      }
      return { feed, items: out, ok: true };
    } catch (err) {
      if (attempt === 2) {
        console.warn(`  ✗  ${feed.name.padEnd(24)} — ${err.message}`);
        return { feed, items: [], ok: false };
      }
      await sleep(1200);
    }
  }
  return { feed, items: [], ok: false };
}

/** নির্দিষ্ট concurrency তে সব ফিড ডাকা */
async function pool(tasks, limit) {
  const results = [];
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, tasks.length) }, async () => {
    while (cursor < tasks.length) {
      const idx = cursor++;
      results[idx] = await tasks[idx]();
    }
  });
  await Promise.all(workers);
  return results;
}

/* ----------------------------------- main ----------------------------------- */

async function main() {
  console.log(`\n🚀  Smart AI News Portal — crawl started (${SOURCES.length} sources)\n`);
  const t0 = Date.now();

  const results = await pool(SOURCES.map((f) => () => fetchFeed(f)), 10);

  const seenUrl = new Set();
  const seenTitle = new Set();
  const all = [];

  for (const r of results) {
    if (r?.ok) console.log(`  ✓  ${r.feed.name.padEnd(24)} — ${String(r.items.length).padStart(2)} items`);
    for (const a of r?.items || []) {
      const keyUrl = a.url.split('?')[0].replace(/\/$/, '');
      const keyTitle = normalizeTitle(a.title);
      if (seenUrl.has(keyUrl) || seenTitle.has(keyTitle)) continue;
      seenUrl.add(keyUrl);
      seenTitle.add(keyTitle);
      all.push(a);
    }
  }

  // weight + সময় মিলিয়ে স্কোর
  const now = Date.now();
  all.forEach((a) => {
    const ageHours = Math.max(0, (now - a.ts) / 36e5);
    a.score = a.weight / 100 + Math.max(0, 6 - ageHours) * 0.16;
  });
  all.sort((x, y) => y.score - x.score || y.ts - x.ts);

  // ১) প্রতি ক্যাটেগরি থেকে নির্দিষ্ট সংখ্যা (যাতে সব ক্যাটেগরিতে কনটেন্ট থাকে)
  const perCat = new Map();
  const picked = [];
  const leftover = [];
  for (const a of all) {
    const n = perCat.get(a.category) || 0;
    if (n < PER_CATEGORY_CAP) {
      perCat.set(a.category, n + 1);
      picked.push(a);
    } else {
      leftover.push(a);
    }
  }
  // ২) বাকি জায়গা সবচেয়ে ভালো স্কোরের নিউজ দিয়ে ভরাট
  const finalList = picked.concat(leftover).slice(0, TOTAL_LIMIT);

  const articles = finalList.map((a) => {
    const { score, weight, ...rest } = a; // বাহ্যিক ফিল্ড বাদ
    return rest;
  });

  const sources = [...new Set(articles.map((a) => a.source))].sort();
  const payload = {
    updatedAt: new Date().toISOString(),
    count: articles.length,
    sources,
    articles,
  };

  await fs.mkdir(path.join(ROOT, 'data'), { recursive: true });
  await fs.writeFile(OUT_JSON, JSON.stringify(payload), 'utf8');

  // file:// বা CDN ছাড়া খোলার সময় কাজ করার জন্য fallback
  await fs.writeFile(
    OUT_FALLBACK,
    `/* AUTO-GENERATED — do not edit */\nwindow.NEWS_FALLBACK = ${JSON.stringify(payload)};\n`,
    'utf8',
  );

  const okCount = results.filter((r) => r?.ok).length;
  console.log(
    `\n✅  Done in ${((Date.now() - t0) / 1000).toFixed(1)}s — ` +
      `${okCount}/${SOURCES.length} feeds OK, ${articles.length} unique articles saved\n`,
  );

  process.exit(0);

  if (articles.length === 0) {
    console.error('⚠️  কোনো নিউজ পাওয়া যায়নি। ফিড URL গুলো চেক করুন।');
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
