#!/usr/bin/env node
/**
 * ================================================================
 *  ঐচ্ছিক — Gemini API দিয়ে AI সামারি (AdSense "low-value content"
 *  সমস্যা এড়াতে সাহায্য করে)
 * ---------------------------------------------------------------
 *  GEMINI_API_KEY environment variable না থাকলে কিছুই করবে না।
 *
 *  Local:   GEMINI_API_KEY=xxx node scripts/ai-enhance.mjs
 *  Actions: repo-তে GEMINI_API_KEY secret হিসেবে যোগ করুন
 *  API key: https://aistudio.google.com/apikey  (ফ্রি)
 * ================================================================
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const NEWS = path.join(ROOT, 'data', 'news.json');
const CACHE = path.join(ROOT, 'data', 'ai-cache.json');

const KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const PER_RUN = Number(process.env.AI_PER_RUN || 30);

if (!KEY) {
  console.log('ℹ️  GEMINI_API_KEY নেই — AI summary স্কিপ করা হলো (এটি ঐচ্ছিক)');
  process.exit(0);
}

const readJson = async (f, fallback) => {
  try { return JSON.parse(await fs.readFile(f, 'utf8')); } catch { return fallback; }
};

const news = await readJson(NEWS, null);
if (!news) { console.error('❌ data/news.json পাওয়া যায়নি — আগে npm run fetch চালান'); process.exit(1); }

const cache = await readJson(CACHE, {});

async function summarize(a) {
  const prompt = `You are a news editor. Rewrite the following headline and snippet into a clear, neutral, factual summary of 2 sentences. Write in the SAME language as the source article. Do not invent facts, do not use clickbait. Reply with ONLY valid JSON, no markdown fencing:

{"title": "<polished headline, max 110 chars>", "summary": "<2 sentence summary, max 240 chars>"}

Headline: ${a.title}
Snippet: ${a.summary}
Source: ${a.source}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 400 },
      }),
    },
  );

  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 160)}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
  const clean = text.replace(/```json|```/gi, '').trim();
  const start = clean.indexOf('{');
  const end = clean.lastIndexOf('}');
  if (start < 0 || end < 0) throw new Error('JSON না পাওয়া গেল');
  return JSON.parse(clean.slice(start, end + 1));
}

/* -- যেগুলোর এখনো AI সামারি হয়নি, শুধু সেগুলো (নতুনগুলো আগে) -- */
const todo = news.articles
  .slice()
  .sort((x, y) => y.ts - x.ts)
  .filter((a) => !cache[a.id])
  .slice(0, PER_RUN);

if (!todo.length) { console.log('✅ সব আর্টিকেলে আগেই AI সামারি আছে'); process.exit(0); }

console.log(`🧠 Gemini (${MODEL}) দিয়ে ${todo.length} টি আর্টিকেল রিরাইট হচ্ছে…`);
let ok = 0; let fail = 0;

for (const a of todo) {
  try {
    const out = await summarize(a);
    if (out && out.summary) {
      cache[a.id] = {
        title: String(out.title || a.title).slice(0, 200),
        summary: String(out.summary).slice(0, 400),
        at: new Date().toISOString(),
      };
      ok++;
    } else { fail++; }
  } catch (err) {
    fail++;
    console.warn(`   ⚠ ${a.id}: ${err.message}`);
  }
  await new Promise((r) => setTimeout(r, 350)); // rate-limit সুরক্ষা
}

/* -- news.json-এ আগে যে টাইটেল/সামারি ছিল তা rawTitle/rawSummary তে রাখি -- */
for (const a of news.articles) {
  const c = cache[a.id];
  if (!c) continue;
  if (!a.rawTitle) a.rawTitle = a.title;
  if (!a.rawSummary) a.rawSummary = a.summary;
  a.title = c.title || a.title;
  a.summary = c.summary || a.summary;
  a.ai = true;
}

await fs.writeFile(CACHE, JSON.stringify(cache), 'utf8');
await fs.writeFile(NEWS, JSON.stringify(news), 'utf8');
await fs.writeFile(
  path.join(ROOT, 'data', 'news.fallback.js'),
  `/* AUTO-GENERATED — do not edit */\nwindow.NEWS_FALLBACK = ${JSON.stringify(news)};\n`,
  'utf8',
);

console.log(`✅ AI enhance done — নতুন: ${ok}, ব্যর্থ: ${fail}, মোট ক্যাশ: ${Object.keys(cache).length}`);
process.exit(0);
