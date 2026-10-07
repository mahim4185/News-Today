#!/usr/bin/env node
/**
 * সবকিছু (CSS + JS + News Data) একটিমাত্র standalone.html ফাইলে ভরে দেয়।
 * যারা GitHub ছাড়া সরাসরি যেকোনো হোস্টিংয়ে / Blogger-এ একটা ফাইল পেস্ট করতে চান।
 *
 *   node scripts/build-standalone.mjs
 *   →  standalone.html (~340 KB, বাইরের কোনো ফাইল লাগবে না)
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const read = (f) => fs.readFile(path.join(ROOT, f), 'utf8');

const html = await read('index.html');
const css = await read('assets/style.css');
const js = await read('assets/app.js');
const ads = await read('assets/ads.js');
const raw = await read('data/news.json');
const data = JSON.parse(raw);

/* ---- 1. নিরাপদ এমবেড (`, </script>`, U+2028/29 সব ঠিক করে) ---- */
const jsonSafe = JSON.stringify(data)
  .replace(/<\//g, '<\\/')        // </script> দিয়ে স্ক্রিপ্ট ব্লক ভাঙতে না পারে
  .replace(/\u2028/g, '\\u2028')
  .replace(/\u2029/g, '\\u2029');

const embedded = `window.NEWS_EMBEDDED = ${jsonSafe};`;
const jsSafe = js.replace(/<\/script/gi, '<\\/script');

/* ---- 2. index.html-এর লিংক/স্ক্রিপ্ট ট্যাগ ইনলাইন করা ----
   ⚠️  সবসময় function-replacer ব্যবহার করি, নাহলে replacement string-এর
       `$$` / `$&` গুলো ভুলভাবে ইন্টারপ্রেট হয়ে কোড নষ্ট হয়ে যায়।        */
let out = html
  .replace(/<link rel="stylesheet" href="assets\/style\.css">/, () => `<style>\n${css}\n</style>`)
  .replace(/<script src="assets\/ads\.js"><\/script>/, () => `<script>\n${ads}\n</script>`)
  .replace(
    /<script src="assets\/app\.js"><\/script>/,
    () => `<script>\n${embedded}\n</script>\n<script>\n${jsSafe}\n</script>`,
  )
  .replace(/<link rel="manifest"[^>]*>\n?/, () => '');

/* ---- 3. Service Worker রেজিস্ট্রেশন সরানো (standalone-এ লাগবে না) ---- */
const SW_BLOCK = `  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
`;
out = out.includes(SW_BLOCK)
  ? out.replace(SW_BLOCK, '')
  : out.replace(/\s*if \('serviceWorker' in navigator\) \{[\s\S]*?\n  \}\n/, '');

/* ---- 4. app.js-কে এমবেডেড ডেটা ব্যবহারের নির্দেশ ---- */
out = out.replace(
  'const DATA_URL = ',
  () => 'const __EMBED = window.NEWS_EMBEDDED || null;\n  const DATA_URL = ',
);
out = out.replace(
  `      const res = await fetch(\`\${DATA_URL}?v=\${Date.now()}\`, { cache: 'no-store' });`,
  () => `      if (__EMBED) return __EMBED;   // standalone build: ডেটা ফাইলের ভেতরেই আছে\n      const res = await fetch(\`\${DATA_URL}?v=\${Date.now()}\`, { cache: 'no-store' });`,
);

/* ---- 5. হেডারে নোট ---- */
out = out.replace(
  '<title>',
  () => `<!-- ✅ Standalone build — ${new Date().toISOString()} | ${data.count} articles embedded -->\n<title>`,
);

await fs.writeFile(path.join(ROOT, 'standalone.html'), out, 'utf8');
console.log(
  `📦  standalone.html — ${(Buffer.byteLength(out, 'utf8') / 1024).toFixed(0)} KB, ${data.count} টি আর্টিকেল এমবেড`,
);

/* ---- 6. সব <script> ব্লক syntax-চেক করে নিশ্চিত হওয়া ---- */
// শুধু আসল JS ব্লক চেক করি — type="application/ld+json" বাদ
const blocks = [...out.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)]
  .filter((m) => {
    const attrs = m[1] || '';
    const type = (attrs.match(/type\s*=\s*["']([^"']+)["']/i) || [])[1] || 'text/javascript';
    return /^(text\/javascript|module|application\/javascript)?$/i.test(type);
  })
  .map((m) => m[2]);
const { execFileSync } = await import('node:child_process');
let bad = 0;
blocks.forEach((code, i) => {
  try {
    execFileSync(process.execPath, ['--check', '-'], { input: code, stdio: ['pipe', 'pipe', 'pipe'] });
  } catch (e) {
    bad++;
    console.error(`❌ script block #${i + 1} তে syntax error:\n${String(e.stderr).slice(0, 400)}`);
  }
});
console.log(bad === 0 ? `✅ ${blocks.length}টি script block সব ঠিক আছে` : `❌ ${bad} টি ব্লকে সমস্যা`);
process.exit(bad === 0 ? 0 : 1);
