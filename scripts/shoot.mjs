// Screenshots de revisão: node scripts/shoot.mjs [url] [outDir]
import { chromium } from 'playwright';
import fs from 'node:fs';
const url = process.argv[2] || 'http://localhost:5173/';
const out = process.argv[3] || 'shots';
fs.mkdirSync(out, { recursive: true });
const sizes = [['m', 390, 844, true], ['t', 768, 1024, true], ['d', 1440, 900, false]];
const b = await chromium.launch();
const errors = [];
for (const [tag, w, h, mobile] of sizes) {
  for (const rm of [false, true]) {
    if (rm && tag !== 'm') continue;
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: mobile, isMobile: mobile && w < 700, reducedMotion: rm ? 'reduce' : 'no-preference' });
    const p = await ctx.newPage();
    p.on('console', (m) => ['error', 'warning'].includes(m.type()) && errors.push(`[${tag}${rm ? '-rm' : ''}] ${m.type()}: ${m.text()}`));
    p.on('pageerror', (e) => errors.push(`[${tag}] pageerror: ${e.message}`));
    p.on('requestfailed', (r) => errors.push(`[${tag}] failed: ${r.url()}`));
    await p.goto(url, { waitUntil: 'networkidle' });
    await p.waitForTimeout(rm ? 300 : 3200);
    const total = await p.evaluate(() => document.documentElement.scrollHeight);
    const n = Math.ceil(total / h);
    for (let i = 0; i < n; i++) {
      await p.evaluate((y) => window.scrollTo(0, y), i * h);
      await p.waitForTimeout(rm ? 150 : 1300);
      await p.screenshot({ path: `${out}/${tag}${rm ? 'rm' : ''}-${String(i).padStart(2, '0')}.png` });
    }
    const broken = await p.evaluate(() => [...document.images].filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.src));
    if (broken.length) errors.push(`[${tag}] imagens quebradas: ${broken.join(', ')}`);
    console.log(tag, rm ? 'rm' : '', 'height', total, 'shots', n);
    await ctx.close();
  }
}
await b.close();
console.log(errors.length ? 'PROBLEMAS:\n' + [...new Set(errors)].join('\n') : 'sem erros de console');
