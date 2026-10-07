/**
 * noroute.js — বাইরের সাইটে কোনো লিংক যাবে না
 * ============================================================================
 *  এই স্ক্রিপ্টটি app.js-এর পরে লোড হয়। কাজ:
 *   ১) সব বাইরের (external) <a> লিংককে সাধারণ টেক্সটে রূপান্তর করে
 *      → পাঠক আপনার সাইটেই থাকেন, অন্য সাইটে চলে যান না।
 *   ২) তার জায়গায় "সূত্র: <উৎসের নাম>" দেখায় (attribution বজায় থাকে)।
 *   ৩) সব রকমের নেভিগেশন (click, কীবোর্ড, target=_blank) ব্লক করে।
 *   ৪) পরে তৈরি হওয়া লিংকগুলোও (MutationObserver দিয়ে) ধরে।
 *   ৫) বিজ্ঞাপনের লিংক ছাড় দেয় — সেগুলো টার্গেট-সাইটে যাবে (Adsterra/AdSense)।
 * ============================================================================
 */
(function () {
  if (window.__norouteInstalled) return;
  window.__norouteInstalled = true;

  var INTERNAL = location.hostname;

  function isExternal(a) {
    try {
      var u = new URL(a.href, location.href);
      if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
      if (u.hostname === INTERNAL) return false;
      if (u.hostname.endsWith('.' + INTERNAL)) return false;
      return true;
    } catch (e) { return false; }
  }

  // বিজ্ঞাপনের লিংক বাইপাস (Adsterra / AdSense / ad networks)
  var AD_HOST = /(adsterra|adsbygoogle|doubleclick|googlesyndication|adservice|googleadservices|amazon-adsystem|propellerads|adstera|clickadu|popads|exoclick|richpush|hilltopads|trafficstars|mgid|taboola|outbrain|revcontent|adnow|popcash|propeller|juicyads|adxad|clickadilla|zetpay|adspush)/i;
  function isAd(a) {
    try {
      var u = new URL(a.href, location.href);
      if (AD_HOST.test(u.hostname) || AD_HOST.test(u.pathname)) return true;
    } catch (e) {}
    if (a.closest && a.closest('.ad-slot, .adslot, [data-ad], .adsbygoogle, ins.adsbygoogle')) return true;
    if (a.id && /^aswift|google_ads/i.test(a.id)) return true;
    return false;
  }

  function hostOf(href) {
    try { return new URL(href, location.href).hostname.replace(/^www\./, ''); }
    catch (e) { return ''; }
  }

  function label() {
    var l = 'en';
    try { l = (document.documentElement.lang || localStorage.getItem('news-lang') || 'en').toLowerCase(); }
    catch (e) {}
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
    // ক্লিক যাতে কিছু না করে
    span.style.cursor = 'default';

    a.replaceWith(span);
  }

  function clean(root) {
    var scope = root || document;
    var links = scope.querySelectorAll ? scope.querySelectorAll('a[href]') : [];
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      if (!isExternal(a)) continue;
      if (isAd(a)) continue;
      deLink(a);
    }
  }

  // ১) সব ধরণের ক্লিক ব্লক (capture phase — সবার আগে)
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    if (isAd(a) || !isExternal(a)) return;
    e.preventDefault();
    e.stopPropagation();
    deLink(a);
  }, true);

  // ২) মাউস-মিডল ক্লিক / কনটেক্সট মেনু থেকেও নেভিগেশন বন্ধ
  document.addEventListener('auxclick', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (a && !isAd(a) && isExternal(a)) { e.preventDefault(); e.stopPropagation(); }
  }, true);

  // ৩) পরে তৈরি হওয়া লিংকও ধরা (app.js ডায়নামিক রেন্ডার করে)
  var t = null;
  function schedule() {
    clearTimeout(t);
    t = setTimeout(function () { clean(document); }, 80);
  }

  function boot() {
    clean(document);
    try {
      var mo = new MutationObserver(function (muts) {
        for (var i = 0; i < muts.length; i++) {
          if (muts[i].addedNodes && muts[i].addedNodes.length) { schedule(); return; }
        }
      });
      mo.observe(document.body || document.documentElement, { childList: true, subtree: true });
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // ৪) window.open / locationও বাইরে যেতে দেবে না
  try {
    var _open = window.open;
    window.open = function (url) {
      try {
        var u = new URL(url, location.href);
        if ((u.protocol === 'http:' || u.protocol === 'https:') && u.hostname !== INTERNAL) {
          console.log('[noroute] বাইরের সাইট ব্লক করা হলো:', u.hostname);
          return null;
        }
      } catch (e) {}
      return _open.apply(window, arguments);
    };
  } catch (e) {}
})();
