/**
 * noroute.js — খবরের লিংক + বিজ্ঞাপনের লিংক, দুটোই চালু
 * ============================================================================
 *  🔘 মূল সুইচ:
 *     window.NOROUTE_ENABLED = false  →  সব লিংক স্বাভাবিকভাবে কাজ করবে (এখনকার অবস্থা)
 *     window.NOROUTE_ENABLED = true   →  শুধু খবরের সোর্স লিংক বন্ধ হবে
 *                                        (বিজ্ঞাপন সবসময় চলবে — কখনো বন্ধ হবে না)
 *
 *  ⚙️  বন্ধ করতে চাইলে নিচের false কে true করে দিন — আর কিছু করতে হবে না।
 * ============================================================================ */
window.NOROUTE_ENABLED = false;

(function () {
  if (window.__norouteInstalled) return;
  window.__norouteInstalled = true;

  if (!window.NOROUTE_ENABLED) {
    console.log('[noroute] বন্ধ আছে — খবর ও বিজ্ঞাপনের সব লিংক স্বাভাবিকভাবে কাজ করবে');
    return;
  }

  /* ---------- ১. বন্ধ করতে হবে এমন ডোমেইন (খবরের সোর্স) ---------- */

  var BLOCKED = [
    'bbc.co.uk', 'bbc.com',
    'prothomalo.com',
    'ndtv.com', 'timesofindia.indiatimes.com', 'thehindu.com',
    'aljazeera.com', 'theguardian.com', 'dw.com', 'france24.com',
    'techcrunch.com', 'theverge.com', 'arstechnica.com', 'gadgets360.com',
    'cnbc.com', 'nasa.gov', 'livescience.com',
    'dhakatribune.com', 'thedailystar.net', 'newagebd.net',
    'kalerkantho.com', 'jugantor.com', 'samakal.com', 'ittefaq.com.bd',
    'bdnews24.com', 'daily-sun.com', 'thefinancialexpress.com.bd',
    'bigganchinta.com', 'tbsnews.net', 'thebusinessstandard.com',
  ].reduce(function (s, h) { s.add(h); return s; }, new Set());

  function addHost(h) {
    if (!h) return;
    h = String(h).toLowerCase().replace(/^www\./, '');
    if (h) BLOCKED.add(h);
  }

  function hostOf(href) {
    try {
      return new URL(href, location.href).hostname.toLowerCase().replace(/^www\./, '');
    } catch (e) { return ''; }
  }

  ['data/news.json', 'news.json'].forEach(function (p) {
    fetch(p)
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        var list = (d && d.articles) || [];
        list.forEach(function (a) {
          addHost(hostOf(a.sourceUrl || ''));
          addHost(hostOf(a.url || ''));
        });
      })
      .catch(function () {});
  });

  /* ---------- ২. এটা কি খবরের সোর্স লিংক? ---------- */

  function isNewsLink(url) {
    var h = hostOf(url);
    if (!h) return false;
    if (BLOCKED.has(h)) return true;
    var hit = false;
    BLOCKED.forEach(function (b) {
      if (h === b || h.endsWith('.' + b)) hit = true;
    });
    return hit;
  }

  /* ---------- ৩. বিজ্ঞাপন চিহ্নিতকরণ (এগুলো কখনো বন্ধ করা হবে না) ---------- */

  var AD_HOST = /(adsterra|adsbygoogle|doubleclick|googlesyndication|adservice|googleadservices|highrevenueformat|profitableratecpm|amazon-adsystem|propellerads|adstera|clickadu|popads|exoclick|richpush|hilltopads|trafficstars|mgid|taboola|outbrain|revcontent|adnow|popcash|propeller|juicyads|adxad|clickadilla|zetpay|adspush|onclick|a-ads|admacro|adspy|clickunder|popunder)/i;

  function isAdContext(el) {
    if (!el || !el.closest) return false;
    if (el.closest('.ad-slot, .adslot, [data-ad], .adsbygoogle, ins.adsbygoogle, .sticky-ad, [id^="container-"]')) return true;
    try {
      var h = hostOf(el.href || '');
      if (h && AD_HOST.test(h)) return true;
      if (h && AD_HOST.test(el.href || '')) return true;
    } catch (e) {}
    return false;
  }

  /* ---------- ৪. লিংক → টেক্সট ---------- */

  function label() {
    var l = 'en';
    try {
      l = (document.documentElement.lang || localStorage.getItem('news-lang') || 'en').toLowerCase();
    } catch (e) {}
    return l.indexOf('bn') === 0 ? 'সূত্র' : 'Source';
  }

  function deLink(a) {
    if (a.dataset.norouteDone === '1') return;
    a.dataset.norouteDone = '1';

    var host = hostOf(a.href);
    var txt = (a.textContent || '').trim();
    var isVisitBtn = /↗/.test(txt) || /source|visit|read on|original/i.test(txt);

    var span = document.createElement('span');
    span.className = 'noroute-src';
    span.setAttribute('data-host', host);
    span.textContent = isVisitBtn ? (label() + ': ' + host) : txt;
    span.title = label() + ': ' + (host || 'news');
    span.style.cursor = 'default';
    a.replaceWith(span);
  }

  function clean(root) {
    var scope = root || document;
    var links = scope.querySelectorAll ? scope.querySelectorAll('a[href]') : [];
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      if (a.dataset.norouteDone === '1') continue;
      if (isAdContext(a)) continue;
      if (!isNewsLink(a.href)) continue;
      deLink(a);
    }
  }

  /* ---------- ৫. ক্লিক বন্ধ — শুধু খবরের সোর্সের ক্ষেত্রে ---------- */

  function newsAnchorFrom(e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return null;
    if (isAdContext(a)) return null;
    return isNewsLink(a.href) ? a : null;
  }

  document.addEventListener('click', function (e) {
    var a = newsAnchorFrom(e);
    if (!a) return;
    e.preventDefault();
    e.stopPropagation();
    deLink(a);
  }, true);

  document.addEventListener('auxclick', function (e) {
    if (newsAnchorFrom(e)) { e.preventDefault(); e.stopPropagation(); }
  }, true);

  /* ---------- ৬. window.open — শুধু খবরের সোর্স বন্ধ ---------- */

  try {
    var _open = window.open;
    window.open = function (url) {
      try {
        if (url && isNewsLink(url)) return null;
      } catch (e) {}
      return _open.apply(window, arguments);
    };
  } catch (e) {}

  /* ---------- ৭. ডায়নামিক কনটেন্ট ধরা ---------- */

  var t = null;
  function schedule() {
    clearTimeout(t);
    t = setTimeout(function () { clean(document); }, 80);
  }

  function boot() {
    clean(document);
    try {
      new MutationObserver(function (muts) {
        for (var i = 0; i < muts.length; i++) {
          if (muts[i].addedNodes && muts[i].addedNodes.length) { schedule(); return; }
        }
      }).observe(document.body || document.documentElement, { childList: true, subtree: true });
    } catch (e) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.__noroute = { blocked: BLOCKED, isNewsLink: isNewsLink };
})();
