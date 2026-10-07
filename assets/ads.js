/* ==========================================================================
   📢 AD CONFIGURATION  —  আপনার Adsterra কোড বসানো আছে ✅
   --------------------------------------------------------------------------
   ⚠️  গুরুত্বপূর্ণ (কেন iframe ব্যবহার করা হয়েছে):
   Adsterra-এর ১, ২ ও ৫ নং কোড সবাই `atOptions` নামের একটা গ্লোবাল
   ভ্যারিয়েবল ব্যবহার করে। সরাসরি একই পেজে বসালে পরের কোড আগেরটার
   সেটিং ওভাররাইট করে দেয় — ফলে সব জায়গায় একই আকারের (ভুল) বিজ্ঞাপন
   দেখা যায়। তাই এই তিনটিকে আলাদা iframe-এ ঢুকানো হয়েছে, যাতে
   প্রতিটির নিজস্ব জগৎ থাকে এবং একে অপরকে নষ্ট না করে।

   🧩 মানচিত্র:
     ① top        → হেডারের নিচে       (728×90)
     ② sidebar    → ডান সাইডবার        (300×250)
     ③ infeed     → প্রতি ৬ খবর পর      (Native)  ← নির্দিষ্ট ID থাকায় শুধু ১ বার
     ④ sticky     → মোবাইলে নিচে আটকানো (Social Bar)
     ⑤ modal      → খবর খোলার পপআপে     (300×250)

   🔧 বন্ধ করতে চাইলে:  AD_SETTINGS.enabled = false
   ========================================================================== */

/* ---------- উপকরণ: কোডটাকে নিজস্ব iframe-এ ঢুকানো ---------- */
function _escAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function _frameAd(code, w, h) {
  const doc =
    '<!doctype html><html><head><meta charset="utf-8">' +
    '<style>' +
    '*{margin:0;padding:0;box-sizing:border-box}' +
    'html,body{background:transparent;overflow:hidden}' +
    'body{width:' + w + 'px;height:' + h + 'px;display:flex;align-items:center;justify-content:center}' +
    '</style></head><body>' + code + '</body></html>';

  return (
    '<iframe srcdoc="' + _escAttr(doc) + '" ' +
    'width="' + w + '" height="' + h + '" ' +
    'frameborder="0" scrolling="no" marginwidth="0" marginheight="0" ' +
    'loading="lazy" referrerpolicy="no-referrer-when-downgrade" ' +
    'style="border:0;display:block;margin:0 auto;max-width:100%;overflow:hidden">' +
    '</iframe>'
  );
}

/* ========================= ১ নং — ৭২৮×৯০ (শীর্ষে) ========================= */
const AD_TOP =
  '<script>' +
  "atOptions = {" +
  "'key' : '24066ac73ceae72f16285bcd9db656e4'," +
  "'format' : 'iframe'," +
  "'height' : 90," +
  "'width' : 728," +
  "'params' : {}" +
  '};' +
  '</scr' + 'ipt>' +
  '<script src="https://www.highrevenueformat.com/24066ac73ceae72f16285bcd9db656e4/invoke.js"></scr' + 'ipt>';

/* ======================= ২ নং — ৩০০×২৫০ (সাইডবার) ======================== */
const AD_SIDEBAR =
  '<script>' +
  "atOptions = {" +
  "'key' : 'bd1cecbb35eb4d9305672b39d660669a'," +
  "'format' : 'iframe'," +
  "'height' : 250," +
  "'width' : 300," +
  "'params' : {}" +
  '};' +
  '</scr' + 'ipt>' +
  '<script src="https://www.highrevenueformat.com/bd1cecbb35eb4d9305672b39d660669a/invoke.js"></scr' + 'ipt>';

/* ================= ৩ নং — Native / In-feed (খবরের মাঝে) ==================
   এই কোডে container-এর ID আগে থেকেই নির্দিষ্ট (container-6f80554a...),
   তাই একাধিক বার বসালে ID ডুপ্লিকেট হয় ও বিজ্ঞাপন আসে না।
   → নিচের গার্ড স্ক্রিপ্ট প্রথমটিতে বিজ্ঞাপন রেখে বাকিগুলো সরিয়ে দেয়।     */
const AD_INFEED =
  '<script>' +
  '(function(){' +
  'var s=document.currentScript;' +
  'var slot=(s&&s.closest)?s.closest(".ad-slot"):null;' +
  'if(window.__newsInfeedDone){if(slot&&slot.parentNode){slot.parentNode.removeChild(slot);}return;}' +
  'window.__newsInfeedDone=1;' +
  '})();' +
  '</scr' + 'ipt>' +
  '<script async="async" data-cfasync="false" ' +
  'src="https://pl31704459.profitableratecpmnetwork.com/6f80554aaa7ab2704ddb25caa41540a6/invoke.js"></scr' + 'ipt>' +
  '<div id="container-6f80554aaa7ab2704ddb25caa41540a6"></div>';

/* ================= ৪ নং — Social Bar (মোবাইলে নিচে আটকানো) ================ */
const AD_STICKY =
  '<script src="https://pl31704460.profitableratecpmnetwork.com/79/c0/01/79c001e754f7e31f8042e45db4fa9426.js"></scr' + 'ipt>';

/* ==================== ৫ নং — ৩০০×২৫০ (পপআপ / মোডাল) ===================== */
const AD_MODAL =
  '<script>' +
  "atOptions = {" +
  "'key' : 'bd1cecbb35eb4d9305672b39d660669a'," +
  "'format' : 'iframe'," +
  "'height' : 250," +
  "'width' : 300," +
  "'params' : {}" +
  '};' +
  '</scr' + 'ipt>' +
  '<script src="https://www.highrevenueformat.com/bd1cecbb35eb4d9305672b39d660669a/invoke.js"></scr' + 'ipt>';

/* =============================== স্লট বসানো =============================== */
window.AD_SLOTS = {
  top: _frameAd(AD_TOP, 728, 90),
  sidebar: _frameAd(AD_SIDEBAR, 300, 250),
  infeed: AD_INFEED,
  stickyMobile: AD_STICKY,
  modal: _frameAd(AD_MODAL, 300, 250),
};

/* ============================== সেটিংস =================================== */
window.AD_SETTINGS = {
  enabled: true,        // false করলে সব বিজ্ঞাপন বন্ধ
  infeedEvery: 6,       // কয়টা কার্ড পর পর in-feed আসবে
  stickyDelayMs: 4000,  // কত মিলিসেকেন্ড পর স্টিকি (Social Bar) দেখাবে
  showPlaceholder: false, // বিজ্ঞাপন না থাকলে ফাঁকা বক্স দেখাবে না
};

/* ===================== ছোটখাটো CSS (মোবাইলে গোলযোগ এড়াতে) ================ */
(function () {
  if (window.__adCssDone) return;
  window.__adCssDone = 1;
  var st = document.createElement('style');
  st.textContent = [
    /* iframe যেন কন্টেইনারের বাইরে না যায় */
    '.ad-inner iframe{max-width:100%}',
    /* মোবাইলে ৭২৮px ব্যানার আটকে যায় — সেখানে Social Bar-ই যথেষ্ট */
    '@media (max-width:780px){ .ad-top{display:none !important} }',
    /* খুব ছোট স্ক্রিনে ৩০০px সাইডবার-ঘরের বিজ্ঞাপন লুকাও */
    '@media (max-width:340px){ .ad-side{display:none !important} }',
    '#container-6f80554aaa7ab2704ddb25caa41540a6{min-height:90px}',
  ].join('\n');
  (document.head || document.documentElement).appendChild(st);
})();
