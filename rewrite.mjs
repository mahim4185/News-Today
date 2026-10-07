#!/usr/bin/env node
/**
 * rewrite.mjs — খবরের শিরোনাম ও সারাংশ "নতুন করে" লেখা (কপিরাইট-নিরাপদ)
 * ============================================================================
 *  উদ্দেশ্য:
 *   - RSS থেকে আসা আক্ষরিক লেখা সরাসরি দেখানো হয় না।
 *   - প্রতিটি খবরকে নিজের ভাষায় রি-রাইট/ডাইজেস্ট করা হয়, যাতে মূল
 *     প্রকাশনার "expression" (শব্দচয়ন/বাক্য) কপি না হয় — শুধু তথ্য থাকে।
 *   - উৎসের নাম (attribution) রাখা হয় — এটিই ন্যায্য ব্যবহারের প্রথম শর্ত।
 *
 *  দুই মোড:
 *   ১) GEMINI_API_KEY থাকলে  → Gemini দিয়ে সত্যিকারের রি-রাইট (সবচেয়ে ভালো)
 *   ২) না থাকলে              → নির্ভরতাহীন নিয়ম-ভিত্তিক রি-রাইট (ডাইজেস্ট)
 *
 *  ব্যবহার:  node rewrite.mjs
 *  Env:
 *   GEMINI_API_KEY  (ঐচ্ছিক)  Google AI Studio-এর ফ্রি কি
 *   REWRITE_MAX     (ঐচ্ছিক)  এক রানে সর্বোচ্চ কতটি নতুন খবর রি-রাইট (ডিফল্ট 150)
 *   REWRITE_LANG    (ঐচ্ছিক)  auto (ডিফল্ট) | bn  → bn দিলে ইংরেজি খবর বাংলায়
 *   REWRITE_FORCE   (ঐচ্ছিক)  1 দিলে ক্যাশ ইগনোর করে সব নতুন করে লিখবে
 * ============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
// নেস্টেড (data/news.json) ও ফ্ল্যাট (news.json) — দুটো লেআউটেই চলবে
const NEWS =
  [path.join(ROOT, 'data', 'news.json'), path.join(ROOT, 'news.json')].find((f) => fs.existsSync(f)) ||
  path.join(ROOT, 'data', 'news.json');
const CACHE = path.join(path.dirname(NEWS), 'rewritten.json');

const KEY = process.env.GEMINI_API_KEY || '';
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
// API কি থাকলে রেট-লিমিট এড়াতে ধীরে (১৫০/রান), না থাকলে সব একবারেই (ফ্রি)
const MAX = Math.max(1, Number(process.env.REWRITE_MAX || (KEY ? 150 : 2000)));
const LANG = (process.env.REWRITE_LANG || 'auto').toLowerCase();
const FORCE = process.env.REWRITE_FORCE === '1';
const CACHE_MAX = 6000; // ক্যাশ ফাইল যেন বিশাল না হয়

// ফ্রি ট্রান্সলেশন (MyMemory) — কোনো API কি লাগে না, কিন্তু সত্যিকারের রূপান্তর করে
const TRANSLATE = process.env.REWRITE_TRANSLATE !== '0'; // ডিফল্ট চালু
const TGT = (process.env.REWRITE_TARGET || 'bn').toLowerCase(); // লক্ষ্য ভাষা (ডিফল্ট বাংলা)
const MM_EMAIL = process.env.MYMEMORY_EMAIL || ''; // দিলে দৈনিক লিমিট ৫,০০০ → ৫০,০০০
const MM_URL = 'https://api.mymemory.translated.net/get';
const ROUNDTRIP = process.env.REWRITE_ROUNDTRIP !== '0'; // বাংলা সোর্সে bn→en→bn (ডিফল্ট চালু)

/* ------------------------------------------------------------------ helpers */

const stripTags = (s) =>
  String(s || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// RSS-এর সাধারণ ময়লা/প্রমোশনাল অংশ বাদ
const BOILER = [
  /read more\b/gi, /click here\b/gi, /subscribe\b/gi, /full story\b/gi,
  /follow us\b/gi, /advertisement/gi, /sponsored content/gi, /sign up\b/gi,
  /\bwatch\b(?=\s*[:—-])/gi, /\[.*?\]/g, /\(reuters\)/gi, /\(afp\)/gi,
  /বিস্তারিত জানতে/g, /বিস্তারিত পড়ুন/g, /আরও পড়ুন/g, /পড়ুন/g,
  /আরও খবর/g, /বিজ্ঞাপন/g, /দেখুন/g, /ভিডিও/g,
];

// হালকা শব্দ-বদল (রি-রাইট নয়, শুধু ডাইজেস্টে স্বাভাবিকতা আনতে)
const SYN = [
  [/\bsaid\b/gi, 'stated'], [/\bsays\b/gi, 'states'],
  [/\btold\b/gi, 'informed'], [/\badded\b/gi, 'noted'],
  [/\baccording to\b/gi, 'as reported by'],
  [/\bannounced\b/gi, 'confirmed'], [/\breported\b/gi, 'noted'],
  [/\bwill\b/gi, 'is set to'], [/\bhas been\b/gi, 'was'],
  [/\bincreased\b/gi, 'rose'], [/\bdecreased\b/gi, 'fell'],
  [/\baided\b/gi, 'helped'], [/\bhit\b/gi, 'affected'],
];

const isBangla = (s) => /[\u0980-\u09FF]/.test(String(s || ''));

function sentences(text) {
  return String(text || '')
    .replace(/([.!?])\s*(?=[A-Z\u0980-\u09FF])/g, '$1|')
    .split('|')
    .map((s) => s.trim())
    .filter((s) => s.length > 12);
}

function cleanTitle(title, source) {
  let t = stripTags(title);
  // "Headline - Source" / "Headline | Source" → সোর্সের টুকরো বাদ
  if (source) {
    const esc = source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    t = t.replace(new RegExp(`\\s*[|–—-]\\s*${esc}\\s*$`, 'i'), '');
  }
  t = t.replace(/\s*[|–—]\s*[^|–—]{2,40}\s*$/, ''); // শেষের ছোট টেইল
  t = t.replace(/^\s*(breaking|live|watch|video)\s*[:—-]\s*/i, '');
  t = t.replace(/\s{2,}/g, ' ').trim();
  return t || stripTags(title);
}

/** মূল বিষয়বস্তু থেকে কীওয়ার্ড/নাম-সত্তা বের করা (নতুন প্রসঙ্গ তৈরিতে ব্যবহার) */
function keywords(text, n = 5) {
  const raw = String(text || '');
  const stop = new Set(
    ('the a an and or but if then than that this these those is are was were be been being have has had ' +
      'do does did will would can could should may might must of in on at to for with from by as about ' +
      'into over after before under above out up down off again further once here there when where why ' +
      'how all any both each few more most other some such no nor not only own same so too very just now ' +
      'it its his her their our your my he she they them we you i said says told added new one two')
      .split(' ')
  );
  // বড় হাতের নাম-সত্তা (Entities)
  const ents = (raw.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || [])
    .map((e) => e.trim())
    .filter((e) => e.length > 3 && !stop.has(e.toLowerCase()));
  // সাধারণ শব্দ-গুনতি
  const words = raw
    .toLowerCase()
    .replace(/[^a-z\u0980-\u09FF\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 4 && !stop.has(w));
  const freq = new Map();
  for (const w of words) freq.set(w, (freq.get(w) || 0) + 1);
  const top = [...freq.entries()].sort((x, y) => y[1] - x[1]).slice(0, n).map((e) => e[0]);
  return [...new Set([...ents, ...top])].slice(0, n);
}

/**
 * নিয়ম-ভিত্তিক রি-রাইট (কোনো API লাগে না)
 * — মূল বাক্য হুবহু রাখা হয় না: সংক্ষেপণ + শব্দ-বদল + নতুন প্রসঙ্গ।
 * ⚠️ সত্যিকারের রি-রাইটের জন্য GEMINI_API_KEY ব্যবহার করাই শ্রেয়।
 */
function ruleRewrite(a) {
  const src = a.source || 'News desk';
  const bn = isBangla(a.title) || isBangla(a.summary);
  const t = cleanTitle(a.title, src);

  let s = stripTags(a.summary || '');
  for (const re of BOILER) s = s.replace(re, ' ');
  s = s.replace(/https?:\/\/\S+/g, ' ').replace(/\s+/g, ' ').trim();

  // ১) সবচেয়ে তথ্যবহুল বাক্য বেছে নেওয়া
  const parts = sentences(s);
  let core = parts.slice().sort((x, y) => y.length - x.length)[0] || s || '';

  // ২) সংক্ষেপণ — subordinate clause/বন্ধনী বাদ (মূল রচনা থেকে আলাদা করে)
  core = core
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .replace(/,\s*(which|who|whom|that|where|while|as|after|before|although|though|because|since|following)\b[\s\S]*$/i, '')
    .replace(/\s*[-–—;:]\s*[^-–—;:]{10,}$/, '')
    .replace(/\s+/g, ' ')
    .trim();

  // ৩) শব্দ-বদল
  for (const [re, to] of SYN) core = core.replace(re, to);

  // ৪) নতুন প্রসঙ্গ — কীওয়ার্ড যোগ
  const kws = keywords(`${t} ${s}`, 5);

  // ৫) নিরপেক্ষ ফ্রেম (মূল প্রকাশনার বাক্য নয়)
  let summary;
  if (bn) {
    summary = `${src}-এর প্রতিবেদন অনুযায়ী, ${core.replace(/[.।]+$/, '')}।`;
    if (kws.length) summary += ` এ ঘটনায় আলোচিত: ${kws.slice(0, 4).join(', ')}।`;
  } else {
    summary = `As reported by ${src}, ${core.replace(/[.]+$/, '')}.`;
    if (kws.length) summary += ` Key points: ${kws.slice(0, 4).join(', ')}.`;
  }

  if (summary.length > 420) summary = summary.slice(0, 417).replace(/\s+\S*$/, '') + '…';
  if (summary.length < 40) summary = bn ? `${src}-এর প্রতিবেদন অনুযায়ী, ${t}।` : `As reported by ${src}, ${t}.`;

  return { title: t.slice(0, 180), summary };
}

/* --------------------------------------------------------------- Gemini mode */

function extractJson(text) {
  let s = String(text || '').trim();
  s = s.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  const a = s.indexOf('['), o = s.indexOf('{');
  const start = a === -1 ? o : (o === -1 ? a : Math.min(a, o));
  if (start === -1) return null;
  const open = s[start], close = open === '[' ? ']' : '}';
  const end = s.lastIndexOf(close);
  if (end <= start) return null;
  try { return JSON.parse(s.slice(start, end + 1)); } catch { return null; }
}

async function geminiBatch(items) {
  const langNote =
    LANG === 'bn'
      ? 'Write the output in BANGLA (বাংলা), even if the source is English.'
      : 'Write in the SAME language as the source item.';

  const payload = items.map((a, i) => ({
    i,
    source: a.source,
    title: stripTags(a.title).slice(0, 300),
    summary: stripTags(a.summary).slice(0, 900),
  }));

  const prompt = `You are a careful news editor for an independent news portal.
Rewrite EVERY item below COMPLETELY in your own words.

STRICT RULES:
1. Never reuse the original phrasing, word order or sentence structure.
2. Keep only the verifiable facts (who / what / where / when / why).
3. Add nothing that is not in the source. No opinion, no clickbait.
4. Headline: max 95 characters, clear and neutral.
5. Summary: 2-3 sentences, max 340 characters, neutral tone.
6. ${langNote}
7. Return STRICT JSON only, no markdown, no explanation:
   [{"i":0,"title":"...","summary":"..."}]

ITEMS (JSON):
${JSON.stringify(payload)}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 160)}`);
  const data = await res.json();
  const txt = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
  const out = extractJson(txt);
  if (!Array.isArray(out)) throw new Error('Gemini JSON পার্স করা যায়নি');
  return out;
}

/* ------------------------------------------------- MyMemory (ফ্রি অনুবাদ) */

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function translate(text, target) {
  const q = String(text || '').slice(0, 480); // MyMemory ~500 অক্ষরের লিমিট
  if (!q.trim()) return null;
  const url = new URL(MM_URL);
  url.searchParams.set('q', q);
  url.searchParams.set('langpair', `en|${target}`);
  if (MM_EMAIL) url.searchParams.set('de', MM_EMAIL);

  const res = await fetch(url, { headers: { 'User-Agent': 'news-rewriter/1.0' } });
  if (!res.ok) return null;
  const d = await res.json();
  const out = d?.responseData?.translatedText;
  if (!out) return null;
  // MyMemory লিমিট/সতর্কতা শনাক্ত (এগুলো অনুবাদ নয়)
  if (/MYMEMORY WARNING|QUERY LENGTH LIMIT|USAGE LIMIT|INVALID LANGUAGE/i.test(out)) return null;
  if (d?.responseStatus && Number(d.responseStatus) !== 200) return null;
  return String(out).replace(/\s+/g, ' ').trim();
}

/**
 * অনুবাদ-ভিত্তিক রি-রাইট
 *  - সোর্স ইংরেজি হলে  → সরাসরি বাংলায় (en → bn)
 *  - সোর্স বাংলা হলে   → রাউন্ড-ট্রিপ (bn → en → bn), যাতে বাক্যের গঠন বদলে যায়
 */
async function translateRewrite(a) {
  const src = a.source || 'News desk';
  const titleIn = cleanTitle(a.title, src).slice(0, 300);
  let sumIn = stripTags(a.summary || '');
  for (const re of BOILER) sumIn = sumIn.replace(re, ' ');
  sumIn = sumIn.replace(/https?:\/\/\S+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 470);

  const bnSrc = isBangla(`${titleIn} ${sumIn}`);
  let t2 = null, s2 = null;

  if (bnSrc && TGT === 'bn' && ROUNDTRIP) {
    // রাউন্ড-ট্রিপ: বাংলা → ইংরেজি → বাংলা
    const [tEn, sEn] = await Promise.all([translate(titleIn, 'en'), translate(sumIn, 'en')]);
    if (!tEn && !sEn) return null;
    const [tBn, sBn] = await Promise.all([
      tEn ? translate(tEn, 'bn') : Promise.resolve(null),
      sEn ? translate(sEn, 'bn') : Promise.resolve(null),
    ]);
    t2 = tBn; s2 = sBn;
  } else if (!bnSrc) {
    // সরাসরি: ইংরেজি → বাংলা
    [t2, s2] = await Promise.all([translate(titleIn, TGT), translate(sumIn, TGT)]);
  } else {
    return null; // বাংলা সোর্স + রাউন্ড-ট্রিপ বন্ধ
  }

  if (!t2 && !s2) return null;

  const title = (t2 || titleIn).replace(/\s+/g, ' ').trim();
  let summary = (s2 || sumIn).replace(/\s+/g, ' ').trim();
  summary = `${src}-এর প্রতিবেদনের ভিত্তিতে, ${summary.replace(/[.।]+$/, '')}।`;
  if (summary.length > 420) summary = summary.slice(0, 417).replace(/\s+\S*$/, '') + '…';
  return { title: title.slice(0, 180), summary, mode: 'mt' };
}

/* -------------------------------------------------------------------- main */

function load(p, fallback) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return fallback; }
}

(async function main() {
  if (!fs.existsSync(NEWS)) {
    console.log('❌ data/news.json পাওয়া যায়নি — আগে fetch-news.mjs চালান');
    process.exit(1);
  }

  const news = load(NEWS, null);
  if (!news || !Array.isArray(news.articles)) {
    console.log('❌ data/news.json-এ articles পাওয়া যায়নি');
    process.exit(1);
  }

  let cache = load(CACHE, {});
  if (FORCE) cache = {};

  const todo = news.articles.filter((a) => a.url && (FORCE || !cache[a.url]));
  const batch = todo.slice(0, MAX);

  console.log(`📰 মোট খবর      : ${news.articles.length}`);
  console.log(`🆕 নতুন (ক্যাশে নেই): ${todo.length}`);
  console.log(`✍️  এবারে লিখবো    : ${batch.length}`);
  console.log(`🧠 মোড           : ${KEY ? `Gemini (${MODEL})` : 'নিয়ম-ভিত্তিক (API কি নেই)'}`);

  let done = 0, ai = 0, mt = 0, ruled = 0;

  if (KEY && batch.length) {
    const SIZE = 8;
    for (let i = 0; i < batch.length; i += SIZE) {
      const chunk = batch.slice(i, i + SIZE);
      try {
        const out = await geminiBatch(chunk);
        for (const r of out) {
          const a = chunk[Number(r.i)];
          if (!a || !r?.title || !r?.summary) continue;
          cache[a.url] = {
            title: String(r.title).slice(0, 200),
            summary: String(r.summary).slice(0, 420),
            mode: 'ai',
            at: new Date().toISOString(),
          };
          done++; ai++;
        }
        console.log(`   ✅ Gemini ${i + 1}-${Math.min(i + SIZE, batch.length)}`);
      } catch (e) {
        console.log(`   ⚠️  Gemini ব্যর্থ (${e.message}) — নিয়ম-ভিত্তিক ফলব্যাক`);
        for (const a of chunk) {
          if (cache[a.url]) continue;
          const rw = ruleRewrite(a);
          cache[a.url] = { ...rw, mode: 'rule', at: new Date().toISOString() };
          done++; ruled++;
        }
      }
      await new Promise((r) => setTimeout(r, 350)); // রেট-লিমিট শিথিল
    }
  }

  // অনুবাদ-ভিত্তিক রি-রাইট (কোনো API কি লাগে না) — ইংরেজি খবর → বাংলা
  if (TRANSLATE && !KEY && batch.length) {
    const CONC = 4;
    for (let i = 0; i < batch.length; i += CONC) {
      const chunk = batch
        .slice(i, i + CONC)
        .filter((a) => !cache[a.url]);
      if (!chunk.length) continue;
      await Promise.all(
        chunk.map(async (a) => {
          try {
            const rw = await translateRewrite(a);
            if (rw) { cache[a.url] = { ...rw, at: new Date().toISOString() }; done++; mt++; }
          } catch (e) { /* ব্যর্থ হলে নিচের নিয়ম-ভিত্তিক ফলব্যাক */ }
        })
      );
      await sleep(250);
      process.stdout.write(`   … এগিয়েছে ${done}/${batch.length}\r`);
    }
    console.log(`   🌐 MyMemory অনুবাদ : ${mt} টি`);
  }

  // যেগুলো কোনোভাবেই হলো না → নিয়ম-ভিত্তিক ডাইজেস্ট
  for (const a of batch) {
    if (cache[a.url]) continue;
    const rw = ruleRewrite(a);
    cache[a.url] = { ...rw, mode: 'rule', at: new Date().toISOString() };
    done++; ruled++;
  }

  // ক্যাশ আকার সীমিত (নতুনগুলো রাখা হয়)
  const keys = Object.keys(cache);
  if (keys.length > CACHE_MAX) {
    const keep = keys.slice(-CACHE_MAX);
    cache = Object.fromEntries(keep.map((k) => [k, cache[k]]));
  }

  // news.json-এ রি-রাইট করা লেখা বসানো
  let applied = 0;
  for (const a of news.articles) {
    const c = cache[a.url];
    if (!c) continue;
    if (a.title !== c.title || a.summary !== c.summary) {
      if (!a.origTitle) { a.origTitle = a.title; a.origSummary = a.summary; }
      a.title = c.title;
      a.summary = c.summary;
      a.rewritten = true;
      a.rewriteMode = c.mode;
      applied++;
    }
  }

  news.rewrittenAt = new Date().toISOString();
  news.rewriteMode = KEY ? 'ai' : 'rule';

  fs.mkdirSync(path.dirname(CACHE), { recursive: true });
  fs.writeFileSync(CACHE, JSON.stringify(cache));
  fs.writeFileSync(NEWS, JSON.stringify(news, null, 0));

  console.log(`\n✅ রি-রাইট সম্পন্ন`);
  console.log(`   🤖 AI (Gemini)   : ${ai}`);
  console.log(`   🌐 অনুবাদ (MT)   : ${mt}`);
  console.log(`   📏 নিয়ম-ভিত্তিক  : ${ruled}`);
  console.log(`   🔁 বসানো         : ${applied} টি খবরে`);
  console.log(`   💾 ক্যাশ         : ${Object.keys(cache).length} টি (data/rewritten.json)`);
  if (!KEY && mt === 0 && ruled > 0) {
    console.log(`\n⚠️  অনুবাদ সেবা সাড়া দেয়নি — শুধু নিয়ম-ভিত্তিক ডাইজেস্ট ব্যবহার করা হলো।`);
    console.log(`   সত্যিকারের রি-রাইটের জন্য GEMINI_API_KEY যোগ করুন (ফ্রি)।`);
  }
})();
