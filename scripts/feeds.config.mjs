/**
 * ============================================================
 *  FEED SOURCES  —  সবগুলো রিয়েল-টাইম টেস্ট করা (2026-10-07)
 *  নিজের মতো ফিড যোগ/বাদ দিন, ক্রলার সব সামলিয়ে নেবে।
 * ============================================================
 *  country : ISO-2 (BD / IN / US / GLOBAL)
 *  lang    : bn | en
 *  cat     : bangladesh | india | world | tech | business | sports | entertainment | science
 *  weight  : বেশি = হোমপেজে আগে দেখানোর চান্স বেশি (১-১০০)
 */

export const FEEDS = [
  /* ================= বাংলাদেশ ================= */
  { name: 'Prothom Alo',       site: 'https://www.prothomalo.com', url: 'https://www.prothomalo.com/feed',                country: 'BD', lang: 'bn', cat: 'bangladesh', weight: 100 },
  { name: 'Prothom Alo EN',    site: 'https://en.prothomalo.com', url: 'https://en.prothomalo.com/feed',                 country: 'BD', lang: 'en', cat: 'bangladesh', weight: 94 },
  { name: 'Dhaka Tribune',     site: 'https://www.dhakatribune.com', url: 'https://www.dhakatribune.com/feed/',             country: 'BD', lang: 'en', cat: 'bangladesh', weight: 88 },
  { name: 'Rising BD',         site: 'https://www.risingbd.com', url: 'https://www.risingbd.com/rss',                   country: 'BD', lang: 'bn', cat: 'bangladesh', weight: 84 },

  /* ================= ভারত ================= */
  { name: 'NDTV',              site: 'https://www.ndtv.com', url: 'https://feeds.feedburner.com/ndtvnews-top-stories', country: 'IN', lang: 'en', cat: 'india', weight: 92 },
  { name: 'Times of India',    site: 'https://timesofindia.indiatimes.com', url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms', country: 'IN', lang: 'en', cat: 'india', weight: 90 },
  { name: 'The Hindu',         site: 'https://www.thehindu.com', url: 'https://www.thehindu.com/news/feeder/default.rss?service=rss', country: 'IN', lang: 'en', cat: 'india', weight: 86 },
  { name: 'Hindustan Times',   site: 'https://www.hindustantimes.com', url: 'https://www.hindustantimes.com/feeds/rss/india-news/rssfeed.xml', country: 'IN', lang: 'en', cat: 'india', weight: 84 },

  /* ================= বিশ্ব ================= */
  { name: 'BBC World',         site: 'https://www.bbc.com', url: 'https://feeds.bbci.co.uk/news/world/rss.xml',    country: 'GLOBAL', lang: 'en', cat: 'world', weight: 98 },
  { name: 'Al Jazeera',        site: 'https://www.aljazeera.com', url: 'https://www.aljazeera.com/xml/rss/all.xml',      country: 'GLOBAL', lang: 'en', cat: 'world', weight: 95 },
  { name: 'The Guardian',      site: 'https://www.theguardian.com', url: 'https://www.theguardian.com/world/rss',          country: 'GLOBAL', lang: 'en', cat: 'world', weight: 90 },
  { name: 'DW News',           site: 'https://www.dw.com', url: 'https://rss.dw.com/rdf/rss-en-all',              country: 'GLOBAL', lang: 'en', cat: 'world', weight: 84 },
  { name: 'France 24',         site: 'https://www.france24.com', url: 'https://www.france24.com/en/rss',                country: 'GLOBAL', lang: 'en', cat: 'world', weight: 80 },

  /* ================= টেক ================= */
  { name: 'TechCrunch',        site: 'https://techcrunch.com', url: 'https://techcrunch.com/feed/',                   country: 'US', lang: 'en', cat: 'tech', weight: 94 },
  { name: 'The Verge',         site: 'https://www.theverge.com', url: 'https://www.theverge.com/rss/index.xml',         country: 'US', lang: 'en', cat: 'tech', weight: 92 },
  { name: 'Ars Technica',      site: 'https://arstechnica.com', url: 'https://feeds.arstechnica.com/arstechnica/index', country: 'US', lang: 'en', cat: 'tech', weight: 88 },
  { name: 'Engadget',          site: 'https://www.engadget.com', url: 'https://www.engadget.com/rss.xml',               country: 'US', lang: 'en', cat: 'tech', weight: 86 },
  { name: 'Guardian Tech',     site: 'https://www.theguardian.com', url: 'https://www.theguardian.com/technology/rss',     country: 'GLOBAL', lang: 'en', cat: 'tech', weight: 84 },
  { name: 'BBC Technology',    site: 'https://www.bbc.com', url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', country: 'GLOBAL', lang: 'en', cat: 'tech', weight: 82 },
  { name: 'Gadgets 360',       site: 'https://www.gadgets360.com', url: 'https://feeds.feedburner.com/gadgets360-latest', country: 'IN', lang: 'en', cat: 'tech', weight: 80 },

  /* ================= বিজনেস ================= */
  { name: 'BBC Business',      site: 'https://www.bbc.com', url: 'https://feeds.bbci.co.uk/news/business/rss.xml', country: 'GLOBAL', lang: 'en', cat: 'business', weight: 90 },
  { name: 'CNBC',              site: 'https://www.cnbc.com', url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10001147', country: 'US', lang: 'en', cat: 'business', weight: 86 },

  /* ================= খেলাধুলা ================= */
  { name: 'BBC Sport',         site: 'https://www.bbc.com', url: 'https://feeds.bbci.co.uk/sport/rss.xml',         country: 'GLOBAL', lang: 'en', cat: 'sports', weight: 92 },
  { name: 'ESPNcricinfo',      site: 'https://www.espncricinfo.com', url: 'https://www.espncricinfo.com/rss/content/story/feeds/0.xml', country: 'GLOBAL', lang: 'en', cat: 'sports', weight: 88 },
  { name: 'TOI Sports',        site: 'https://timesofindia.indiatimes.com', url: 'https://timesofindia.indiatimes.com/rssfeeds/4719148.cms', country: 'IN', lang: 'en', cat: 'sports', weight: 80 },

  /* ================= বিনোদন ================= */
  { name: 'BBC Entertainment', site: 'https://www.bbc.com', url: 'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml', country: 'GLOBAL', lang: 'en', cat: 'entertainment', weight: 88 },
  { name: 'TOI Entertainment', site: 'https://timesofindia.indiatimes.com', url: 'https://timesofindia.indiatimes.com/rssfeeds/1081479906.cms', country: 'IN', lang: 'en', cat: 'entertainment', weight: 82 },

  /* ================= বিজ্ঞান ও স্বাস্থ্য ================= */
  { name: 'BBC Health',        site: 'https://www.bbc.com', url: 'https://feeds.bbci.co.uk/news/health/rss.xml',   country: 'GLOBAL', lang: 'en', cat: 'science', weight: 86 },
  { name: 'Live Science',      site: 'https://www.livescience.com', url: 'https://www.livescience.com/feeds/all',          country: 'US', lang: 'en', cat: 'science', weight: 82 },
  { name: 'NASA Breaking',     site: 'https://www.nasa.gov', url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss', country: 'US', lang: 'en', cat: 'science', weight: 76 },
];

/**
 * ------------------------------------------------------------------
 *  ঐচ্ছিক — Google News RSS (অনেক বেশি কভারেজ, কিন্তু ছবি থাকে না)
 * ------------------------------------------------------------------
 *  সতর্কতা: Google News-এর RSS শর্তাবলী অনুযায়ী এটি "ব্যক্তিগত,
 *  অ-বাণিজ্যিক" ব্যবহারের জন্য। অ্যাড-চালিত সাইটে ব্যবহার করলে
 *  শর্ত ভঙ্গ হতে পারে — তাই ডিফল্টরূপে বন্ধ আছে।
 *  চালু করতে: GitHub Actions-এ USE_GOOGLE_NEWS = true দিন।
 * ------------------------------------------------------------------
 */
export const OPTIONAL_FEEDS = [
  { name: 'Google News BD (বাংলা)', site: 'https://news.google.com', url: 'https://news.google.com/rss/headlines/section/geo/Bangladesh?hl=bn&gl=BD&ceid=BD:bn', country: 'BD', lang: 'bn', cat: 'bangladesh', weight: 96, googleNews: true },
  { name: 'Google News BD (EN)',    site: 'https://news.google.com', url: 'https://news.google.com/rss/search?q=Bangladesh&hl=en&gl=BD&ceid=BD:en',               country: 'BD', lang: 'en', cat: 'bangladesh', weight: 90, googleNews: true },
  { name: 'Google News বিশ্ব',       site: 'https://news.google.com', url: 'https://news.google.com/rss/headlines/section/topic/WORLD?hl=en&gl=BD&ceid=BD:en',     country: 'GLOBAL', lang: 'en', cat: 'world', weight: 88, googleNews: true },
  { name: 'Google News টেক',        site: 'https://news.google.com', url: 'https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en&gl=BD&ceid=BD:en', country: 'GLOBAL', lang: 'en', cat: 'tech', weight: 82, googleNews: true },
];

export const CATEGORIES = [
  { id: 'home',          bn: 'হোম',      en: 'Home',          icon: '🏠' },
  { id: 'bangladesh',    bn: 'বাংলাদেশ',  en: 'Bangladesh',    icon: '🇧🇩' },
  { id: 'india',         bn: 'ভারত',     en: 'India',         icon: '🇮🇳' },
  { id: 'world',         bn: 'বিশ্ব',    en: 'World',         icon: '🌍' },
  { id: 'tech',          bn: 'টেক',      en: 'Technology',    icon: '💻' },
  { id: 'business',      bn: 'বিজনেস',   en: 'Business',      icon: '📈' },
  { id: 'sports',        bn: 'খেলা',     en: 'Sports',        icon: '⚽' },
  { id: 'entertainment', bn: 'বিনোদন',   en: 'Entertainment', icon: '🎬' },
  { id: 'science',       bn: 'বিজ্ঞান',  en: 'Science',       icon: '🔬' },
];

/** সর্বোচ্চ কয়দিন পুরনো নিউজ রাখবেন */
/** প্রতি ক্যাটেগরিতে সর্বোচ্চ কয়টা (যাতে সব ক্যাটেগরিতে কনটেন্ট থাকে) */
export const PER_CATEGORY_CAP = 58;
/** সর্বোচ্চ কয়দিন পুরনো নিউজ রাখবেন */
export const MAX_AGE_DAYS = 6;
/** প্রতি ফিড থেকে সর্বোচ্চ কয়টা */
export const PER_FEED_LIMIT = 24;
/** সব মিলিয়ে সর্বোচ্চ কয়টা (JSON সাইজ নিয়ন্ত্রণে) */
export const TOTAL_LIMIT = 400;
