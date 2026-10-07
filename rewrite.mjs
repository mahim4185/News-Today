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
// ⚠️ gemini-2.0-flash / 2.5-flash আর নেই (Google বন্ধ করে দিয়েছে → 404)।
// gemini-3.5-flash একটি "thinking" মডেল — বড় ব্যাচে অনেক ধীর/টাইমআউট।
// তাই gemini-flash-lite-latest প্রথমে (দ্রুত, স্থিতিশীল)। ব্যর্থ হলে পরেরগুলো চেষ্টা করবে।
const MODELS = (process.env.GEMINI_MODEL ||
  'gemini-flash-lite-latest,gemini-3.5-flash,gemini-3-flash-preview').split(',').map(s => s.trim()).filter(Boolean);
let MODEL = MODELS[0];
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
