/* ==========================================================================
   Smart AI News Portal — Frontend Logic (Zero dependency, vanilla JS)
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------ 0. Config ------------------------------ */
  const DATA_URL = 'data/news.json';
  const REFRESH_MS = 5 * 60 * 1000;   // ৫ মিনিটে নতুন খবর আছে কিনা চেক
  const PER_PAGE = 12;

  const CATS = [
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

  const I18N = {
    bn: {
      tagline: 'স্মার্ট নিউজ',
      breaking: 'ব্রেকিং',
      search: 'খবর খুঁজুন…',
      home: 'হোম',
      forYou: 'আপনার জন্য',
      forYouSub: 'আপনার দেশের সবচেয়ে গুরুত্বপূর্ণ খবর',
      latest: 'সর্বশেষ খবর',
      trending: 'ট্রেন্ডিং',
      sources: 'খবরের উৎস',
      allNews: 'সব খবর',
      loadMore: 'আরও খবর দেখুন',
      readMore: 'বিস্তারিত',
      visitSource: 'মূল সাইটে পড়ুন',
      share: 'শেয়ার',
      close: 'বন্ধ',
      sponsored: 'বিজ্ঞাপন',
      adSpace: 'আপনার বিজ্ঞাপনের জায়গা',
      adHint: 'Adsterra / AdSense কোড বসান',
      updated: 'সর্বশেষ আপডেট',
      minRead: 'মিনিটের পড়া',
      detecting: 'লোকেশন যাচাই…',
      noResultTitle: 'কোনো খবর পাওয়া যায়নি',
      noResultSub: 'অন্য কিছু খুঁজে দেখুন অথবা হোমপেজে ফিরে যান',
      goHome: 'হোমপেজে যান',
      newStories: 'নতুন খবর এসেছে!',
      refreshing: 'আপডেট হচ্ছে…',
      stories: 'টি খবর',
      liveNow: 'লাইভ',
      about: 'Smart AI News Portal — স্বয়ংক্রিয়ভাবে বিশ্বের শীর্ষ সংবাদমাধ্যম থেকে খবর সংগ্রহ করে আপনার সামনে সাজিয়ে দেয়।',
      fCategories: 'ক্যাটেগরি',
      fCompany: 'কোম্পানি',
      fLegal: 'নীতিমালা',
      aboutUs: 'আমাদের সম্পর্কে',
      contact: 'যোগাযোগ',
      privacy: 'প্রাইভেসি পলিসি',
      terms: 'ব্যবহারের শর্ত',
      disclaimer: 'ডিসক্লেইমার',
      sitemap: 'সাইটম্যাপ',
      rights: 'সর্বস্বত্ব সংরক্ষিত',
      copyOk: 'লিংক কপি হয়েছে!',
      refresh: 'রিফ্রেশ',
      justNow: 'এইমাত্র',
      minAgo: 'মিনিট আগে',
      hourAgo: 'ঘণ্টা আগে',
      dayAgo: 'দিন আগে',
      weekAgo: 'সপ্তাহ আগে',
      source: 'উৎস',
      filterCountry: 'দেশ',
      sortNewest: 'নতুন আগে',
    },
    en: {
      tagline: 'Smart News',
      breaking: 'Breaking',
      search: 'Search news…',
      home: 'Home',
      forYou: 'For You',
      forYouSub: 'The stories that matter most in your country',
      latest: 'Latest News',
      trending: 'Trending',
      sources: 'News Sources',
      allNews: 'All Stories',
      loadMore: 'Load more stories',
      readMore: 'Read more',
      visitSource: 'Read on source site',
      share: 'Share',
      close: 'Close',
      sponsored: 'Advertisement',
      adSpace: 'Your ad space',
      adHint: 'Paste Adsterra / AdSense code',
      updated: 'Last updated',
      minRead: 'min read',
      detecting: 'Detecting…',
      noResultTitle: 'No stories found',
      noResultSub: 'Try another search or go back to the homepage',
      goHome: 'Back to home',
      newStories: 'New stories available!',
      refreshing: 'Refreshing…',
      stories: 'stories',
      liveNow: 'Live',
      about: 'Smart AI News Portal automatically gathers headlines from the world’s leading newsrooms and arranges them around you.',
      fCategories: 'Categories',
      fCompany: 'Company',
      fLegal: 'Legal',
      aboutUs: 'About Us',
      contact: 'Contact',
      privacy: 'Privacy Policy',
      terms: 'Terms of Use',
      disclaimer: 'Disclaimer',
      sitemap: 'Sitemap',
      rights: 'All rights reserved',
      copyOk: 'Link copied!',
      refresh: 'Refresh',
      justNow: 'just now',
      minAgo: 'm ago',
      hourAgo: 'h ago',
      dayAgo: 'd ago',
      weekAgo: 'w ago',
      source: 'Source',
      filterCountry: 'Country',
      sortNewest: 'Newest first',
    },
  };

  /* ------------------------------- 1. State ------------------------------ */
  const S = {
    all: [],
    view: [],          // বর্তমান ক্যাটেগরি/ফিল্টার অনুযায়ী লিস্ট
    cat: 'home',
    page: 1,
    lang: localStorage.getItem('lang') || 'bn',
    theme: localStorage.getItem('theme') || null,
    country: null,
    countryName: '',
    query: '',
    updatedAt: null,
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const t = (k) => (I18N[S.lang] && I18N[S.lang][k]) || I18N.en[k] || k;
  const catLabel = (id) => {
    const c = CATS.find((x) => x.id === id);
    return c ? (S.lang === 'bn' ? c.bn : c.en) : id;
  };
  const esc = (s = '') =>
    String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ------------------------------ 2. Helpers ----------------------------- */
  function flagEmoji(cc) {
    if (!cc || cc === 'GLOBAL' || cc.length !== 2) return '🌐';
    return String.fromCodePoint(...[...cc.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)));
  }

  function timeAgo(ts) {
    const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
    if (s < 60) return t('justNow');
    const m = Math.floor(s / 60);
    if (m < 60) return S.lang === 'bn' ? `${n(m)} ${t('minAgo')}` : `${m}${t('minAgo')}`;
    const h = Math.floor(m / 60);
    if (h < 24) return S.lang === 'bn' ? `${n(h)} ${t('hourAgo')}` : `${h}${t('hourAgo')}`;
    const d = Math.floor(h / 24);
    if (d < 7) return S.lang === 'bn' ? `${n(d)} ${t('dayAgo')}` : `${d}${t('dayAgo')}`;
    const w = Math.floor(d / 7);
    return S.lang === 'bn' ? `${n(w)} ${t('weekAgo')}` : `${w}${t('weekAgo')}`;
  }

  const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  function n(v) {
    const s = String(v);
    return S.lang === 'bn' ? s.replace(/\d/g, (d) => BN_DIGITS[+d]) : s;
  }

  function dtStr(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return '';
    const opt = { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' };
    return d.toLocaleString(S.lang === 'bn' ? 'bn-BD' : 'en-US', opt);
  }

  function readTime(text = '') {
    const words = text.trim().split(/\s+/).length;
    return Math.max(1, Math.round(words / 200) + 1);
  }

  function hueOf(str = '') {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360;
    return h;
  }

  /** সোর্সের favicon (Google সার্ভিস, ফ্রি) */
  function favicon(url, name) {
    if (!url) return '';
    try {
      const host = new URL(url).hostname.replace(/^www\./, '');
      return `<img src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64"
                   alt="" loading="lazy" referrerpolicy="no-referrer" class="fav"
                   onerror="this.style.visibility='hidden'">`;
    } catch { return ''; }
  }

  /* --------------------------- 3. Ads rendering -------------------------- */
  function injectAd(el, html) {
    if (!el) return;
    const cfg = window.AD_SETTINGS || {};
    if (!cfg.enabled) { el.remove(); return; }
    if (!html || !html.trim()) {
      if (cfg.showPlaceholder === false) { el.remove(); return; }
      el.innerHTML =
        `<div class="ad-placeholder">📢 ${esc(t('adSpace'))}<small>${esc(t('adHint'))}</small></div>`;
      return;
    }
    el.innerHTML = html;
    // innerHTML দিয়ে ঢোকানো <script> রান করে না — তাই নতুন করে বানাই
    $$('script', el).forEach((old) => {
      const s = document.createElement('script');
      Array.from(old.attributes).forEach((a) => s.setAttribute(a.name, a.value));
      s.textContent = old.textContent;
      old.parentNode.replaceChild(s, old);
    });
  }

  function adMarkup(id) {
    const cfg = window.AD_SETTINGS || {};
    if (!cfg.enabled) return '';
    return `<div class="ad-slot ad-${id}"><span class="ad-label">${esc(t('sponsored'))}</span>
              <div class="ad-inner" data-ad="${id}"></div></div>`;
  }

  function hydrateAds(root = document) {
    const slots = window.AD_SLOTS || {};
    $$('[data-ad]', root).forEach((el) => {
      // একবার ইনজেক্ট হলে আর নয় — ডুপ্লিকেট ইম্প্রেশন/ইনভ্যালিড ট্রাফিক এড়ায়
      if (el.dataset.adDone === '1') return;
      el.dataset.adDone = '1';
      injectAd(el, slots[el.dataset.ad] || '');
    });
  }

  /* ------------------------- 4. Image fallback --------------------------- */
  function mediaFallback(img) {
    const holder = img.closest('.card-media, .modal-media, .hero-main, .hero-mini');
    if (!holder || holder.dataset.fb === '1') return;
    holder.dataset.fb = '1';
    const srcName = holder.dataset.src || 'News';
    const hue = hueOf(srcName);
    const initial = (srcName.trim()[0] || 'N').toUpperCase();
    img.style.display = 'none';
    const div = document.createElement('div');
    div.className = 'no-img';
    div.style.cssText =
      `position:absolute;inset:0;display:grid;place-items:center;font-size:44px;font-weight:900;
       color:rgba(255,255,255,.85);letter-spacing:-2px;
       background:linear-gradient(135deg,hsl(${hue} 62% 42%),hsl(${(hue + 48) % 360} 62% 26%));`;
    div.textContent = initial;
    holder.appendChild(div);
  }

  function hydrateImages(root = document) {
    $$('img.news-img', root).forEach((img) => {
      const done = () => { if (img.naturalWidth === 0) mediaFallback(img); };
      img.addEventListener('error', () => mediaFallback(img), { once: true });
      if (img.complete) done();
    });
  }

  /* --------------------------- 5. Country detect -------------------------- */
  /**
   * IP → দেশ। একাধিক ফ্রি provider চেষ্টা করে (যেকোনো একটা কাজ করলেই হবে),
   * ফলাফল localStorage-এ ৬ ঘণ্টা ক্যাশ করে (রেট-লিমিট এড়ায়)।
   */
  const GEO_TTL = 6 * 3600 * 1000;

  function readGeoCache() {
    try {
      const raw = localStorage.getItem('geoCache');
      if (!raw) return null;
      const g = JSON.parse(raw);
      if (!g || Date.now() - g.at > GEO_TTL) return null;
      return g;
    } catch { return null; }
  }

  async function detectCountry() {
    const cached = readGeoCache();
    if (cached && cached.code) {
      S.country = cached.code;
      S.countryName = cached.name || cached.code;
      paintCountryChip();
      renderForYou();
      return;
    }

    const providers = [
      ['https://ipwho.is/', (d) => ({ code: d.country_code, name: d.country })],
      ['https://api.country.is/', (d) => ({ code: d.country, name: d.country })],
      ['https://ipapi.co/json/', (d) => ({ code: d.country_code, name: d.country_name })],
      ['https://get.geojs.io/v1/ip/country.json', (d) => ({ code: d.country, name: d.name })],
    ];

    for (const [url, pick] of providers) {
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 4000);
        const res = await fetch(url, { signal: ctrl.signal, headers: { Accept: 'application/json' } });
        clearTimeout(timer);
        if (!res.ok) continue;
        const g = pick(await res.json());
        if (g && g.code && /^[A-Za-z]{2}$/.test(g.code)) {
          const cc = g.code.toUpperCase();
          S.country = cc;
          S.countryName = g.name || cc;
          try {
            localStorage.setItem('geoCache', JSON.stringify({ code: cc, name: S.countryName, at: Date.now() }));
          } catch { /* storage blocked */ }
          paintCountryChip();
          renderForYou();       // দেশ জানার পর "আপনার জন্য" সেকশন আপডেট
          return;
        }
      } catch { /* পরের provider চেষ্টা করো */ }
    }
    paintCountryChip(true);
  }

  function paintCountryChip(failed) {
    const chip = $('#country-chip');
    if (!chip) return;
    chip.style.display = '';
    if (failed || !S.country) {
      chip.innerHTML = `<span class="flag">🌐</span><span>${esc(t('detecting'))}</span>`;
      return;
    }
    chip.innerHTML =
      `<span class="dot"></span><span class="flag">${flagEmoji(S.country)}</span><span>${esc(S.countryName || S.country)}</span>`;
  }

  /* ----------------------------- 6. Data load ----------------------------- */
  /** file:// দিয়ে খোলার সময় fetch কাজ করে না — তখন fallback স্ক্রিপ্ট লোড করি */
  function loadFallbackScript() {
    return new Promise((resolve) => {
      if (window.NEWS_FALLBACK) return resolve(true);
      const s = document.createElement('script');
      s.src = 'data/news.fallback.js';
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.head.appendChild(s);
    });
  }

  async function loadData() {
    try {
      const res = await fetch(`${DATA_URL}?v=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } catch (err) {
      const ok = await loadFallbackScript();
      if (ok && window.NEWS_FALLBACK) return window.NEWS_FALLBACK;
      throw err;
    }
  }

  /* --------------------------- 7. Cards markup ---------------------------- */
  function cardHTML(a) {
    const img = a.image
      ? `<img class="news-img" src="${esc(a.image)}" alt="${esc(a.title)}" loading="lazy" referrerpolicy="no-referrer">`
      : '';
    return `
      <article class="card" data-id="${esc(a.id)}" tabindex="0" role="button">
        <div class="card-media" data-src="${esc(a.source)}">
          ${img}
          <span class="card-cat">${esc(catLabel(a.category))}</span>
          <span class="card-flag" title="${esc(a.country)}">${flagEmoji(a.country)}</span>
          <span class="read-time">${n(readTime(a.summary))}′</span>
        </div>
        <div class="card-body">
          <h3 class="card-title">${esc(a.title)}</h3>
          <p class="card-sum">${esc(a.summary)}</p>
          <div class="card-foot">
            ${favicon(a.sourceUrl, a.source)}
            <span class="src">${esc(a.source)}</span>
            <span class="time" data-ts="${a.ts}">${timeAgo(a.ts)}</span>
          </div>
        </div>
      </article>`;
  }

  function miniHTML(a, i) {
    return `
      <div class="mini" data-id="${esc(a.id)}" role="button" tabindex="0">
        <div class="rank">${n(i + 1)}</div>
        <div>
          <div class="t">${esc(a.title)}</div>
          <div class="m">${flagEmoji(a.country)} ${esc(a.source)} · <span data-ts="${a.ts}">${timeAgo(a.ts)}</span></div>
        </div>
      </div>`;
  }

  /* ------------------------------ 8. Filtering ---------------------------- */
  function computeView() {
    let list = S.all.slice();
    if (S.query) {
      const q = S.query.toLowerCase();
      list = list.filter((a) => (a.title + ' ' + a.summary + ' ' + a.source).toLowerCase().includes(q));
    } else if (S.cat !== 'home') {
      list = list.filter((a) => a.category === S.cat);
    }
    S.view = list;
  }

  /** উৎস-বৈচিত্র্য (round-robin) — এক পত্রিকার ৬টার বদলে ৬ পত্রিকার ১টি করে */
  function diversify(list, n) {
    const bySrc = new Map();
    for (const a of list) {
      if (!bySrc.has(a.source)) bySrc.set(a.source, []);
      bySrc.get(a.source).push(a);
    }
    const buckets = [...bySrc.values()];
    const out = [];
    for (let i = 0; out.length < n; i++) {
      let added = false;
      for (const b of buckets) {
        if (b[i]) { out.push(b[i]); added = true; if (out.length >= n) break; }
      }
      if (!added) break;          // সব বালতি শেষ
      if (i > 30) break;          // নিরাপত্তা
    }
    return out;
  }

  function forYouList() {
    const cc = S.country;
    if (!cc) return [];
    const pool = S.all.filter(
      (a) => a.country === cc || (cc === 'BD' && a.category === 'bangladesh') || (cc === 'IN' && a.category === 'india'),
    );
    return diversify(pool, 6);
  }

  /* ------------------------------ 9. Rendering ---------------------------- */
  function renderTicker() {
    const items = S.all.slice(0, 14);
    const track = $('#ticker-track');
    if (!track) return;
    const one = items
      .map((a) => `<a href="${esc(a.url)}" target="_blank" rel="noopener">${esc(a.title)}</a>`)
      .join('');
    track.innerHTML = one + one;   // seamless loop
  }

  function renderHero() {
    const wrap = $('#hero');
    if (!wrap) return;
    const top = S.view.slice(0, 3);
    if (!top.length) { wrap.innerHTML = ''; return; }

    const heroOf = (a, big) => {
      const media = a.image
        ? `<img class="news-img" src="${esc(a.image)}" alt="${esc(a.title)}" referrerpolicy="no-referrer">`
        : '';
      return `
        <div class="${big ? 'hero-main' : 'hero-mini'}" data-id="${esc(a.id)}" data-src="${esc(a.source)}" role="button" tabindex="0">
          ${media}
          <div class="hero-body">
            <span class="chip">${esc(catLabel(a.category))}</span>
            <span class="chip flag-chip">${flagEmoji(a.country)} ${esc(a.country)}</span>
            <h1 class="hero-title">${esc(a.title)}</h1>
            ${big ? `<p class="hero-sum">${esc(a.summary)}</p>` : ''}
            <div class="hero-meta">
              ${favicon(a.sourceUrl, a.source)}
              <span>${esc(a.source)}</span><span>·</span>
              <span data-ts="${a.ts}">${timeAgo(a.ts)}</span>
              <span>·</span><span>${n(readTime(a.summary))} ${esc(t('minRead'))}</span>
            </div>
          </div>
        </div>`;
    };

    wrap.innerHTML =
      heroOf(top[0], true) +
      (top.length > 1
        ? `<div class="hero-side-list">${top.slice(1, 3).map((a) => heroOf(a, false)).join('')}</div>`
        : '');
    hydrateImages(wrap);
  }

  function renderForYou() {
    const sec = $('#foryou-sec');
    if (!sec) return;
    const list = forYouList();
    if (S.cat !== 'home' || S.query || list.length < 3) { sec.innerHTML = ''; sec.hidden = true; return; }
    sec.hidden = false;
    sec.innerHTML = `
      <div class="sec-head">
        <h2><span class="bar"></span>${esc(t('forYou'))} ${flagEmoji(S.country)}</h2>
        <span class="sub">${esc(t('forYouSub'))}</span>
        <span class="line"></span>
      </div>
      <div class="news-grid">${list.map(cardHTML).join('')}</div>`;
    hydrateImages(sec);
  }

  function renderGrid(reset) {
    const grid = $('#news-grid');
    const moreWrap = $('#load-more-wrap');
    if (reset) S.page = 1;
    const start = 3;                      // প্রথম ৩টা হিরোতে গেছে
    const end = start + S.page * PER_PAGE;
    const slice = S.view.slice(start, end);

    if (!slice.length && S.view.length <= 3) {
      grid.innerHTML = '';
      moreWrap.innerHTML = '';
      if (S.view.length === 0) renderEmpty();
      return;
    }

    const every = (window.AD_SETTINGS && window.AD_SETTINGS.infeedEvery) || 6;
    let html = '';
    slice.forEach((a, i) => {
      html += cardHTML(a);
      if ((i + 1) % every === 0 && i !== slice.length - 1) html += adMarkup('infeed');
    });

    grid.innerHTML = html || (S.view.length ? '' : '');
    hydrateImages(grid);
    hydrateAds(grid);

    const hasMore = end < S.view.length;
    moreWrap.innerHTML = hasMore
      ? `<button class="btn-load" id="load-more">↓ ${esc(t('loadMore'))} <span style="opacity:.55">(${n(S.view.length - end)})</span></button>`
      : '';
    const btn = $('#load-more');
    if (btn) btn.addEventListener('click', () => { S.page += 1; renderGrid(false); });
  }

  function renderEmpty() {
    const grid = $('#news-grid');
    grid.innerHTML = `
      <div class="empty-state">
        <span class="emo">🔍</span>
        <h3>${esc(t('noResultTitle'))}</h3>
        <p>${esc(t('noResultSub'))}</p>
        <div style="margin-top:18px"><button class="btn btn-primary" id="empty-home">${esc(t('goHome'))}</button></div>
      </div>`;
    const b = $('#empty-home');
    if (b) b.addEventListener('click', () => { S.query = ''; S.cat = 'home'; syncNav(); refreshView(); });
  }

  function renderSidebar() {
    // Trending
    const trend = S.all.slice().sort((a, b) => b.ts - a.ts).slice(0, 8);
    $('#trending-body').innerHTML = `<div class="mini-list">${trend.map(miniHTML).join('')}</div>`;

    // Sources
    const counts = new Map();
    S.all.forEach((a) => counts.set(a.source, (counts.get(a.source) || 0) + 1));
    const rows = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 9);
    const hostOf = (name) => (S.all.find((a) => a.source === name) || {}).sourceUrl || '';
    $('#sources-body').innerHTML = `<div class="src-list">${rows
      .map(([name, c]) => `<div class="src-row" data-src="${esc(name)}">
            ${favicon(hostOf(name), name)}<span class="n">${esc(name)}</span><span class="c">${n(c)}</span>
          </div>`)
      .join('')}</div>`;
  }

  function renderNav() {
    const html = CATS.map(
      (c) => `<a class="nav-link${c.id === S.cat ? ' active' : ''}" data-cat="${c.id}">${c.icon} ${S.lang === 'bn' ? c.bn : c.en}</a>`,
    ).join('');
    $('#main-nav').innerHTML = html;
    $('#drawer-nav').innerHTML = html;
    const pr = $('#pill-row');
    if (pr) pr.innerHTML = CATS.map(
      (c) => `<button class="pill${c.id === S.cat ? ' active' : ''}" data-cat="${c.id}">${c.icon} ${S.lang === 'bn' ? c.bn : c.en}</button>`,
    ).join('');
  }

  function syncNav() {
    $$('[data-cat]').forEach((el) => el.classList.toggle('active', el.dataset.cat === S.cat));
    syncUrl();
  }

  /** ?cat=tech — শেয়ারযোগ্য + SEO ফ্রেন্ডলি URL */
  function syncUrl() {
    try {
      const u = new URL(location.href);
      if (S.cat && S.cat !== 'home') u.searchParams.set('cat', S.cat);
      else u.searchParams.delete('cat');
      history.replaceState(null, '', u.toString());
    } catch { /* ignore */ }
  }

  function readUrl() {
    try {
      const c = new URL(location.href).searchParams.get('cat');
      if (c && CATS.some((x) => x.id === c)) S.cat = c;
      const l = new URL(location.href).searchParams.get('lang');
      if (l === 'bn' || l === 'en') S.lang = l;
    } catch { /* ignore */ }
  }

  function refreshView() {
    computeView();
    renderHero();
    renderForYou();
    renderGrid(true);
    hydrateAds($('#side-col'));
    injectSEO();
  }

  function applyStaticI18n() {
    document.documentElement.lang = S.lang === 'bn' ? 'bn' : 'en';
    document.documentElement.dir = 'ltr';
    $$('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    $$('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
    $('#lang-btn').innerHTML = S.lang === 'bn' ? 'বাং <b>/ EN</b>' : '<b>বাং /</b> EN';
    renderNav();
    syncNav();
  }

  /* ------------------------------ 10. Modal ------------------------------ */
  function openArticle(id) {
    const a = S.all.find((x) => x.id === id);
    if (!a) return;
    const bd = $('#modal-backdrop');
    $('#modal-content').innerHTML = `
      <div class="modal-media" data-src="${esc(a.source)}">
        <button class="modal-close" id="modal-close" aria-label="${esc(t('close'))}">✕</button>
        ${a.image ? `<img class="news-img" src="${esc(a.image)}" alt="${esc(a.title)}" referrerpolicy="no-referrer">` : ''}
      </div>
      <div class="modal-body">
        <span class="chip" style="background:var(--brand-soft);color:var(--brand)">${esc(catLabel(a.category))}</span>
        <h1 style="margin-top:12px">${esc(a.title)}</h1>
        <div class="modal-meta">
          ${favicon(a.sourceUrl, a.source)}
          <strong style="color:var(--text)">${esc(a.source)}</strong>
          <span>·</span><span>${flagEmoji(a.country)} ${esc(a.country)}</span>
          <span>·</span><span>${esc(dtStr(a.publishedAt))}</span>
          <span>·</span><span>${n(readTime(a.summary))} ${esc(t('minRead'))}</span>
        </div>
        <p class="modal-sum">${esc(a.summary)}</p>
        ${adMarkup('modal')}
        <div class="modal-actions">
          <a class="btn btn-primary" href="${esc(a.url)}" target="_blank" rel="noopener">${esc(t('visitSource'))} ↗</a>
          <button class="btn btn-ghost" id="share-btn">🔗 ${esc(t('share'))}</button>
          <button class="btn btn-ghost" id="modal-cancel">${esc(t('close'))}</button>
        </div>
      </div>`;
    hydrateImages($('#modal-content'));
    hydrateAds($('#modal-content'));
    bd.classList.add('open');
    document.body.style.overflow = 'hidden';
    $('#modal-close').onclick = closeModal;
    $('#modal-cancel').onclick = closeModal;
    $('#share-btn').onclick = () => shareArticle(a);
  }

  function closeModal() {
    $('#modal-backdrop').classList.remove('open');
    document.body.style.overflow = '';
  }

  async function shareArticle(a) {
    const url = a.url;
    try {
      if (navigator.share) { await navigator.share({ title: a.title, url }); return; }
      await navigator.clipboard.writeText(url);
      toast(t('copyOk'));
    } catch { /* user cancelled */ }
  }

  let toastTimer;
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
  }

  /* ------------------------------ 11. Search ----------------------------- */
  function openSearch() {
    $('#search-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => $('#search-input').focus(), 60);
  }
  function closeSearch() {
    $('#search-overlay').classList.remove('open');
    document.body.style.overflow = '';
  }

  /* --------------------------- 12. Theme / Lang -------------------------- */
  function applyTheme(mode) {
    const m = mode || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', m);
    $('#theme-icon').innerHTML =
      m === 'dark'
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  }

  function setLang(l) {
    S.lang = l;
    localStorage.setItem('lang', l);
    try {
      const u = new URL(location.href);
      u.searchParams.set('lang', l);
      history.replaceState(null, '', u.toString());
    } catch { /* ignore */ }
    applyStaticI18n();
    refreshView();
    renderSidebar();
    renderTicker();
    hydrateAds(document);
    updateMeta();
  }

  /* ---------------------------- 13. Sticky ad ---------------------------- */
  function setupStickyAd() {
    const cfg = window.AD_SETTINGS || {};
    const box = $('#sticky-ad');
    if (!cfg.enabled || !(window.AD_SLOTS && window.AD_SLOTS.stickyMobile)) return;
    setTimeout(() => {
      if (window.innerWidth > 900) return;
      box.classList.add('show');
      injectAd($('[data-ad="stickyMobile"]'), window.AD_SLOTS.stickyMobile);
    }, cfg.stickyDelayMs || 4000);
    const c = $('#sticky-close');
    if (c) c.onclick = () => box.classList.remove('show');
  }

  /* ---------------------------- 14. Auto refresh ------------------------- */
  function startAutoRefresh() {
    setInterval(async () => {
      try {
        const d = await loadData();
        if (d.updatedAt && d.updatedAt !== S.updatedAt) {
          S.updatedAt = d.updatedAt;
          S.all = d.articles || [];
          updateMeta();
          renderTicker();
          renderSidebar();
          refreshView();
          toast(`🆕 ${t('newStories')}`);
        }
      } catch { /* চুপচাপ পরের চেষ্টা */ }
    }, REFRESH_MS);

    // আপেক্ষিক সময় প্রতি মিনিটে রিফ্রেশ
    setInterval(() => {
      $$('[data-ts]').forEach((el) => { el.textContent = timeAgo(+el.dataset.ts); });
    }, 60000);
  }

  /**
   * SEO — canonical / og:url ঠিক করে + গুগলের জন্য Article-সহ ItemList
   * structured data ইনজেক্ট করে (রিচ রেজাল্ট পাওয়ার সম্ভাবনা বাড়ে)।
   */
  function injectSEO() {
    try {
      const base = location.origin + location.pathname.replace(/index\.html$/, '');
      const url = S.cat && S.cat !== 'home' ? `${base}?cat=${S.cat}` : base;

      let c = document.querySelector('link[rel=canonical]');
      if (c) c.href = url;
      let og = document.querySelector('meta[property="og:url"]');
      if (!og) {
        og = document.createElement('meta');
        og.setAttribute('property', 'og:url');
        document.head.appendChild(og);
      }
      og.content = url;

      // আগের dynamic JSON-LD মুছে নতুনটা দিই (ক্যাটেগরি বদলালে আপডেট হবে)
      const prev = document.getElementById('ld-articles');
      if (prev) prev.remove();

      const top = (S.cat === 'home' ? S.all : S.view).slice(0, 16);
      if (!top.length) return;

      const ld = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: S.cat === 'home' ? 'Latest News' : catLabel(S.cat),
        itemListElement: top.map((a, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: a.url,
          name: a.title,
          item: {
            '@type': 'NewsArticle',
            headline: a.title,
            description: a.summary,
            image: a.image || undefined,
            datePublished: a.publishedAt,
            author: { '@type': 'Organization', name: a.source },
            publisher: { '@type': 'Organization', name: a.source },
            mainEntityOfPage: { '@type': 'WebPage', '@id': a.url },
            inLanguage: a.lang === 'bn' ? 'bn-BD' : 'en-US',
          },
        })),
      };

      const el = document.createElement('script');
      el.type = 'application/ld+json';
      el.id = 'ld-articles';
      el.textContent = JSON.stringify(ld);
      document.head.appendChild(el);
    } catch { /* SEO ব্যর্থ হলেও সাইট চলবে */ }
  }

  function updateMeta() {
    const el = $('#updated-at');
    if (el && S.updatedAt) el.textContent = `${t('updated')}: ${dtStr(S.updatedAt)}`;
    const cnt = $('#story-count');
    if (cnt) cnt.textContent = `${n(S.all.length)} ${t('stories')}`;
  }

  /* ------------------------------ 15. Boot ------------------------------- */
  async function boot() {
    readUrl();
    applyTheme(S.theme);
    applyStaticI18n();

    // skeleton
    $('#news-grid').innerHTML = Array.from({ length: 6 })
      .map(() => `<div class="skel"><div class="skel-media sk"></div><div class="skel-body">
          <div class="sk" style="height:15px"></div>
          <div class="sk" style="height:15px;width:80%"></div>
          <div class="sk" style="height:12px;width:55%;margin-top:6px"></div></div></div>`)
      .join('');

    // event wiring
    $('#main-nav').addEventListener('click', onCatClick);
    $('#drawer-nav').addEventListener('click', onCatClick);
    $('#pill-row').addEventListener('click', onCatClick);

    function onCatClick(e) {
      const el = e.target.closest('[data-cat]');
      if (!el) return;
      S.cat = el.dataset.cat;
      S.query = '';
      syncNav();
      closeDrawer();
      refreshView();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    $('#theme-btn').onclick = () => {
      const cur = document.documentElement.getAttribute('data-theme');
      const next = cur === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', next);
      applyTheme(next);
    };
    $('#lang-btn').onclick = () => setLang(S.lang === 'bn' ? 'en' : 'bn');
    $('#search-btn').onclick = openSearch;
    $('#mobile-search').onclick = openSearch;
    $('#search-close').onclick = closeSearch;
    $('#search-overlay').addEventListener('click', (e) => { if (e.target.id === 'search-overlay') closeSearch(); });
    // ফুটারের ক্যাটেগরি লিংক
    $$('[data-cat-goto]').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        S.cat = a.dataset.catGoto;
        S.query = '';
        syncNav();
        refreshView();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });

    $('#menu-btn').onclick = openDrawer;
    $('#drawer-close').onclick = closeDrawer;
    $('#drawer-backdrop').onclick = closeDrawer;
    $('#refresh-btn').onclick = async () => {
      toast(t('refreshing'));
      const d = await loadData();
      S.all = d.articles || [];
      S.updatedAt = d.updatedAt;
      updateMeta(); renderTicker(); renderSidebar(); refreshView(); injectSEO();
    };

    let sTimer;
    $('#search-input').addEventListener('input', (e) => {
      clearTimeout(sTimer);
      const v = e.target.value.trim();
      sTimer = setTimeout(() => {
        S.query = v;
        computeView();
        const box = $('#search-results');
        const top = S.view.slice(0, 20);
        box.innerHTML = top.length
          ? `<div class="mini-list">${top.map((a, i) => miniHTML(a, i)).join('')}</div>`
          : `<div class="empty-state" style="padding:34px 16px"><span class="emo">🤷</span><h3>${esc(t('noResultTitle'))}</h3></div>`;
      }, 220);
    });

    // card / mini click → modal
    document.addEventListener('click', (e) => {
      const el = e.target.closest('[data-id]');
      if (el && !e.target.closest('a')) openArticle(el.dataset.id);
      const srcRow = e.target.closest('.src-row');
      if (srcRow) {
        const name = srcRow.dataset.src;
        S.cat = 'home';
        S.query = name;
        syncNav();
        refreshView();
        closeSearch();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const el = document.activeElement;
        if (el && el.matches('[data-id]')) openArticle(el.dataset.id);
      }
      if (e.key === 'Escape') { closeModal(); closeSearch(); closeDrawer(); }
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT') { e.preventDefault(); openSearch(); }
    });

    // browser back/forward
    window.addEventListener('popstate', () => {
      readUrl();
      applyStaticI18n();
      refreshView();
    });

    // scroll effects
    const onScroll = () => {
      const y = window.scrollY;
      $('#site-header').classList.toggle('is-stuck', y > 12);
      $('#to-top').classList.toggle('show', y > 700);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    $('#to-top').onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    // data
    try {
      const d = await loadData();
      S.all = (d.articles || []).slice();
      S.updatedAt = d.updatedAt;
      updateMeta();
      renderTicker();
      renderSidebar();
      refreshView();
      hydrateAds(document);
      injectSEO();        // top / sidebar / in-feed — সব স্লট
      startAutoRefresh();
      setupStickyAd();
      detectCountry();
    } catch (err) {
      console.error(err);
      $('#news-grid').innerHTML =
        `<div class="empty-state"><span class="emo">📡</span><h3>Data load failed</h3>
         <p>data/news.json পাওয়া যায়নি। <code>npm run fetch</code> চালিয়ে ডেটা তৈরি করুন,
         অথবা সাইটটি একটি HTTP সার্ভার দিয়ে খুলুন (file:// তে fetch কাজ করে না)।</p></div>`;
    }
  }

  function openDrawer() { $('#drawer').classList.add('open'); $('#drawer-backdrop').classList.add('open'); }
  function closeDrawer() { $('#drawer').classList.remove('open'); $('#drawer-backdrop').classList.remove('open'); }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
