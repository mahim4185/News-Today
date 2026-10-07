# 📰 Smart AI News Portal

**GitHub Pages + GitHub Actions দিয়ে ১০০% ফ্রি, সার্ভারবিহীন অটোমেটেড নিউজ পোর্টাল।**
কোনো ডেটাবেস লাগবে না, কোনো ব্যাকএন্ড সার্ভার লাগবে না, কোনো খরচ নেই।

---

## ✨ যা যা পাবেন

| ফিচার | বিস্তারিত |
|---|---|
| 🤖 **স্বয়ংক্রিয় নিউজ ক্রলিং** | ৩০টি RSS ফিড (২৫+ আন্তর্জাতিক পত্রিকা) — GitHub Actions প্রতি ৩০ মিনিটে রিফ্রেশ করে |
| 🌍 **IP-based কান্ট্রি ডিটেকশন** | দর্শক যে দেশ থেকে ঢুকুক, তার দেশের খবর আগে ("আপনার জন্য 🇧🇩" সেকশন) |
| 🌐 **বাংলা + English** | পুরো UI-তে ভাষা সুইচ (localStorage-এ মনে রাখে) |
| 🌙 **Dark / Light মোড** | সিস্টেম প্রেফারেন্স + ম্যানুয়াল টগল |
| 📱 **PWA** | মোবাইলে "Add to Home Screen" — অ্যাপের মতো চলবে |
| 💰 **৫টি অ্যাড স্লট** | Top, Sidebar, In-feed, Sticky Mobile, Modal — অ্যাড কোড `<script>`-সহ রান করে |
| 🔍 **লাইভ সার্চ** | `/` চাপলেই সার্চ বক্স |
| 📊 **SEO + Sitemap + RSS** | JSON-LD, sitemap.xml, feed.xml, `?cat=` deep-link |
| ⚡ **গতি** | কোনো ফ্রেমওয়ার্ক নেই — ৩০ KB CSS + ৩৩ KB JS, CDN নির্ভরতা নেই |
| 🧠 **ঐচ্ছিক AI রিরাইট** | Gemini API key দিলে খবর রিরাইট করে AdSense-ফ্রেন্ডলি করে |

---

## 📁 ফোল্ডার স্ট্রাকচার

```
news-portal/
├── index.html                 ← মূল সাইট
├── standalone.html            ← সব-ইন-ওয়ান সিঙ্গেল ফাইল (যেকোনো জায়গায় পেস্ট করলেই চলবে)
├── assets/
│   ├── style.css              ← সব ডিজাইন (ডার্ক/লাইট টোকেন এখানে)
│   ├── app.js                 ← সব লজিক (i18n, ফিল্টার, কান্ট্রি ডিটেকশন)
│   ├── ads.js                 ← ⭐ অ্যাড কোড এখানে বসাবেন
│   └── icon.svg
├── data/
│   ├── news.json              ← ক্রলারের তৈরি ডেটা (অটো-আপডেট)
│   └── news.fallback.js       ← file:// তে খোলার ব্যাকআপ
├── scripts/
│   ├── feeds.config.mjs       ← ⭐ কোন কোন সাইট থেকে খবর আনবে
│   ├── fetch-news.mjs         ← RSS ক্রলার
│   ├── ai-enhance.mjs         ← ঐচ্ছিক Gemini AI রিরাইট
│   ├── build-meta.mjs         ← sitemap.xml / feed.xml / robots.txt
│   ├── build-standalone.mjs   ← standalone.html তৈরি
│   └── serve.mjs              ← লোকাল টেস্ট সার্ভার
├── .github/workflows/
│   └── update-news.yml        ← ⭐ অটো-আপডেট ক্রন জব
├── sw.js  manifest.webmanifest  robots.txt  ads.txt
└── package.json
```

---

## 🚀 লাইভ করার ধাপ (মোট সময় ~১০ মিনিট)

### ধাপ ১ — GitHub-এ আপলোড

```bash
cd news-portal
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/news-portal.git
git push -u origin main
```

> GitHub ওয়েব UI দিয়েও করা যায়: নতুন repository → **Add file → Upload files** → সব ফাইল ড্র্যাগ-ড্রপ।

### ধাপ ২ — GitHub Pages চালু

`Settings → Pages → Source: **Deploy from a branch** → Branch: **main** / **/(root)** → Save`

২-৩ মিনিটের মধ্যে লাইভ হবে:
👉 `https://YOUR-USERNAME.github.io/news-portal/`

### ধাপ ৩ — অটো-আপডেট ক্রন চালু

`Settings → Secrets and variables → Actions → Variables → New repository variable`

- **Name:** `SITE_URL`
- **Value:** `https://YOUR-USERNAME.github.io/news-portal` (শেষে `/` নয়)

এরপর `Actions` ট্যাবে গিয়ে **"Update News"** ওয়ার্কফ্লো allow করুন।
এখন থেকে **প্রতি ৩০ মিনিটে** সাইট নিজে নিজে নতুন খবর এনে আপডেট হবে।

> ⚠️ GitHub Actions-এর cron সবসময় মিনিট-পারফেক্ট নয় (৫-১৫ মিনিট দেরি হতে পারে)।
> সবচেয়ে নির্ভরযোগ্য সময়ের জন্য cron কমিয়ে `*/15` করতে পারেন।

### ধাপ ৪ — (ঐচ্ছিক) কাস্টম ডোমেইন

`Settings → Pages → Custom domain` → `yourdomain.com`
এরপর ডোমেইন প্রোভাইডারে DNS রেকর্ড যোগ করুন:

| Type | Name | Value |
|---|---|---|
| `A` | `@` | `185.199.108.153` |
| `A` | `@` | `185.199.109.153` |
| `A` | `@` | `185.199.110.153` |
| `A` | `@` | `185.199.111.153` |
| `CNAME` | `www` | `YOUR-USERNAME.github.io` |

কয়েক ঘণ্টার মধ্যেই HTTPS সহ লাইভ (`Enforce HTTPS` টিক দিন)।

---

## 💰 বিজ্ঞাপন সেটআপ

### Adsterra (দ্রুত অ্যাপ্রুভাল, কোনো ট্রাফিক লাগে না)

1. [adsterra.com](https://adsterra.com) → Register as **Publisher**
2. **Websites → Add website** → আপনার GitHub Pages URL দিন → সাথে সাথেই approve
3. **Ad Units → Create Ad Unit**:
   - **Banner 728x90** → কোড কপি করে `assets/ads.js`-এর `top:`-এ পেস্ট
   - **Banner 300x250** → `sidebar:`-এ
   - **Social Bar** → `stickyMobile:`-এ (মোবাইলে সবচেয়ে বেশি আয়)
   - **Native / 728x90** → `infeed:`-এ
4. Save → ১০ মিনিটের মধ্যে অ্যাড লাইভ

**উদাহরণ:**

```js
window.AD_SLOTS = {
  top: `<script src="//pl1234567.inversioncompany.com/xx/invocation.js"><\/script>`,
  sidebar: `<div id="container-abc123"></div><script async="async" data-cfasync="false" src="//pl1234567.totalregen.com/abc123/invocation.js"><\/script>`,
  infeed: ``,
  stickyMobile: `<script type="text/javascript" src="//pl1234567.greatfusions.com/xx/invocation.js"><\/script>`,
  modal: ``,
};
```

> 💡 **জরুরি:** কোড ব্যাকটিক (`` ` ``) এর ভেতরে রাখুন। আর কোডের ভেতরে যদি `</script>` থাকে,
> তাকে `<\/script>` লিখুন — নাহলে HTML স্ক্রিপ্ট ব্লক ভেঙে যাবে।

### Google AdSense (পরের ধাপ)

AdSense স্ক্র্যাপ করা কনটেন্টে অ্যাপ্রুভ হতে চায় না। অ্যাপ্রুভালের আগে:

1. **AI রিরাইট চালু করুন** — নিচের ধাপ দেখুন (একদম ফ্রি)
2. নিচের ৪টা পেজ বানিয়ে ফুটারে লিংক দিন: **Privacy Policy, Terms, Disclaimer, Contact**
3. কমপক্ষে **২০-৩০টা** নিজস্ব/রিরাইট করা আর্টিকেল থাকতে হবে
4. `ads.txt`-এ AdSense দেওয়া লাইনটা বসান

---

## 🧠 ঐচ্ছিক: Gemini AI দিয়ে রিরাইট (AdSense-ফ্রেন্ডলি)

1. [aistudio.google.com/apikey](https://aistudio.google.com/apikey) → **Create API key** (ফ্রি)
2. GitHub repo → `Settings → Secrets → Actions → New repository secret`
   - **Name:** `GEMINI_API_KEY`, **Value:** আপনার key
3. হয়ে গেল! এরপর থেকে প্রতি রানে ৩০টা নতুন খবর AI রিরাইট করবে।

লোকালে টেস্ট:
```bash
GEMINI_API_KEY=your_key node scripts/ai-enhance.mjs
```

> প্রতি রানে ৩০টা (rate-limit সেফটি)। ক্যাশ `data/ai-cache.json`-এ থাকে, ফলে একই খবর দুইবার রিরাইট হয় না।

---

## 🎨 কাস্টমাইজেশন

### সাইটের নাম ও রং বদলাতে

**নাম:** `index.html`-এ `NEWS<span>TODAY</span>` খুঁজে বদলান (৩ জায়গা)।

**রং:** `assets/style.css`-এর একদম উপরে —

```css
:root {
  --brand: #e11d48;      /* মেইন ব্র্যান্ড কালার (লাল) */
  --accent: #2563eb;     /* লিংক/অ্যাকসেন্ট */
  --radius: 16px;        /* কার্ডের গোলাকার কোণা */
}
html[data-theme='dark'] {
  --brand: #ff3d68;      /* ডার্ক মোডের ব্র্যান্ড কালার */
  --bg: #080b14;         /* ডার্ক মোডের ব্যাকগ্রাউন্ড */
}
```

### নতুন নিউজ সাইট যোগ করা

`scripts/feeds.config.mjs` খুলে অ্যারেতে এক লাইন যোগ করুন:

```js
{ name: 'Daily Star', site: 'https://www.thedailystar.net', url: 'https://www.thedailystar.net/rss.xml',
  country: 'BD', lang: 'en', cat: 'bangladesh', weight: 90 },
```

- `cat`: `bangladesh` | `india` | `world` | `tech` | `business` | `sports` | `entertainment` | `science`
- `country`: `BD` / `IN` / `US` / `GLOBAL`
- `weight`: ১-১০০ (বেশি = হোমপেজে আগে)

### ক্যাটেগরি যোগ/বাদ

`scripts/feeds.config.mjs`-এ `CATEGORIES` অ্যারে + `assets/app.js`-এ `CATS` অ্যারে — দুই জায়গায়।

### লোকালে টেস্ট

```bash
npm install
npm run fetch     # RSS থেকে ডেটা আনবে → data/news.json
npm run dev       # http://localhost:4321
```

---

## 📦 সিঙ্গেল-ফাইল ভার্সন (`standalone.html`)

GitHub ব্যবহার না করে সরাসরি যেকোনো হোস্টিং / Blogger / WordPress-এ পেস্ট করার জন্য:

```bash
node scripts/build-standalone.mjs
```

তৈরি হবে `standalone.html` (~৩৩৫ KB) — CSS, JS, ৪০০টা খবর সব এমবেড করা।
**মনে রাখবেন:** এই ভার্সনে খবর অটো-আপডেট হয় না (ডেটা ফাইলের ভেতরে বন্ধ) — নির্দিষ্ট সময় পর
`build-standalone.mjs` আবার চালিয়ে নতুন ফাইল আপলোড করতে হবে।

---

## ❓ সমস্যা সমাধান

**Q. সাইটে "Data load failed" দেখাচ্ছে / খবর আসছে না**
→ আপনি সম্ভবত `index.html` সরাসরি ডাবল-ক্লিক করে খুলেছেন (`file://`)। ব্রাউজার নিরাপত্তার জন্য
`fetch` বন্ধ করে দেয়। সমাধান: `npm run dev` চালিয়ে `http://localhost:4321` দিয়ে খুলুন,
অথবা GitHub Pages-এ আপলোড করুন।

**Q. GitHub Actions চলছে না / খবর আপডেট হচ্ছে না**
→ `Actions` ট্যাবে গিয়ে লাল চিহ্ন আছে কিনা দেখুন। সাধারণত প্রথমবার
**"Workflow permissions" → Read and write permissions** দিতে হয়
(`Settings → Actions → General`)।

**Q. ছবি লোড হচ্ছে না**
→ কিছু সাইট (বিশেষ করে NDTV) hotlink ব্লক করে। অ্যাপ নিজেই সুন্দর গ্রেডিয়েন্ট
প্লেসহোল্ডার দেখিয়ে দেয় — ডিজাইন নষ্ট হয় না। সলিউশন চাইলে ক্লাউডইমেজ প্রক্সি ব্যবহার করতে পারেন।

**Q. "আপনার জন্য" সেকশন দেখাচ্ছে না**
→ দর্শকের দেশে (`country`) কোনো খবর নেই, অথবা IP ডিটেকশন ব্লক হয়েছে (VPN/Ad-blocker)।
Ad-blocker বন্ধ করে টেস্ট করুন। সব ফেইল করলে সাইট সাধারণ মোডেই চলবে।

**Q. GitHub-এর ১০০০ রিকোয়েস্ট বা স্টোরেজ লিমিট?**
→ কোনো সমস্যা নেই। news.json মাত্র ~২৬৫ KB; দিনে ৪৮ বার কমিট = ~১৩ MB/দিন। বছরে ~৪.৭ GB হলেও
Git history বাড়বে — খুব বেশি দিন চালালে `git gc` চালাতে পারেন।

**Q. AdSense-এর জন্য কি Firebase/Telegram লাগবে?**
→ না। এই আর্কিটেকচারেই যথেষ্ট। Firebase ব্যবহার করলে বাড়তি সুবিধা হয় শুধু রিয়েল-টাইম এপ্রুভাল।
চাইলে `news.json`-এর পাশাপাশি Firestore-ও যোগ করা যায়, কিন্তু বেশিরভাগ ক্ষেত্রেই দরকার হয় না।

---

## ⚖️ লিগ্যাল নোট (পড়ুন)

- RSS ফিড থেকে **শিরোনাম + ২ লাইনের সারাংশ + ছবি** ব্যবহার করা হয়, যা সাধারণত fair use হিসেবে গ্রাহ্য।
- সব কার্ডেই **"মূল সাইটে পড়ুন"** লিংক + সোর্সের নাম আছে — এটিই attribution।
- সম্পূর্ণ আর্টিকেল কপি করা হয় **না**। AdSense-এর জন্য AI রিরাইট চালু করুন।
- Google News RSS ডিফল্টরূপে **বন্ধ** আছে, কারণ তাদের শর্তাবলী অনুযায়ী এটি
  ব্যক্তিগত/অ-বাণিজ্যিক ব্যবহারের জন্য। চালু করতে: Actions-এ `USE_GOOGLE_NEWS=true`।

---

## 🛠 টেকনিক্যাল স্পেক

- **Frontend:** HTML5 + Vanilla JS (ES2020) + custom CSS — কোনো বিল্ড স্টেপ নেই
- **Backend:** GitHub Actions (Ubuntu runner, Node 20)
- **Data:** স্ট্যাটিক JSON (কোনো ডেটাবেস নেই)
- **Crawler:** `rss-parser` — ১০টি কনকারেন্ট ফিড, ডিডুপ (URL + টাইটেল), ৬ দিনের পুরনো বাদ,
  প্রতি ক্যাটেগরিতে ৫৮টা করে ক্যাপ
- **Performance:** lazy-loaded images, `no-referrer` (হটলিঙ্ক প্রটেকশন বাইপাস), service worker ক্যাশ

---

<div align="center">
<b>কোনো সমস্যা হলে সরাসরি জিজ্ঞেস করুন — ধাপে ধাপে সলিউশন দিয়ে দেবো।</b>
</div>
