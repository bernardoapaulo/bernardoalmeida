import { chromium } from 'playwright';
import fs from 'node:fs';
fs.mkdirSync('qa', { recursive: true });
const b = await chromium.launch();
const lum = (c) => { const [r, g, bl] = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * bl; };
for (const [w, h] of [[390, 844], [768, 1024], [1440, 900]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
  const errs = [];
  p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  p.on('response', (r) => r.status() >= 400 && errs.push(r.status() + ' ' + r.url()));
  await p.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);
  const bgs = new Set();
  const total = await p.evaluate(() => document.documentElement.scrollHeight);
  // devagar
  for (let y = 0; y < total; y += 300) {
    await p.evaluate((yy) => window.scrollTo(0, yy), y);
    await p.waitForTimeout(150);
    bgs.add(await p.evaluate(() => getComputedStyle(document.body).backgroundColor));
    if (y % 900 === 0) await p.screenshot({ path: `qa/${w}-${String(y).padStart(5, '0')}.png` });
  }
  await p.waitForTimeout(1500);
  const slow = await p.evaluate(() => {
    const out = [];
    document.querySelectorAll('main h1,main h2,main h3,main h4,main p,main li,main span,main a,main small,main b').forEach((el) => {
      if (el.children.length && !['H1', 'H2', 'H3'].includes(el.tagName) && el.tagName !== 'P') return;
      const t = el.textContent.trim();
      if (!t) return;
      let op = 1, n = el;
      while (n && n !== document.body) { op *= parseFloat(getComputedStyle(n).opacity); n = n.parentElement; }
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return;
      const r = el.getBoundingClientRect();
      if (!r.width || el.closest('.hero__title') || el.closest('.marquee') || el.closest('.pillars__track')) return;
      out.push({ t: t.slice(0, 40), op: +op.toFixed(2), color: cs.color, tag: el.tagName, cls: el.className });
    });
    return out;
  });
  // rápido: fim e volta
  await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await p.waitForTimeout(400);
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(3500);
  const counts = await p.evaluate(() => [...document.querySelectorAll('.count')].map((e) => e.textContent).slice(0, 6));
  const fails = slow.filter((x) => {
    const m = x.color.match(/[\d.]+/g).map(Number);
    const L = lum(m.slice(0, 3));
    const a = m[3] ?? 1;
    const L0 = lum([13, 13, 13]);
    const eff = L * a + L0 * (1 - a);
    const cr = (Math.max(eff, L0) + 0.05) / (Math.min(eff, L0) + 0.05);
    return x.op < 0.9 || cr < 4.5;
  });
  console.log(w, 'bg', [...bgs], 'errs', errs.length ? errs : 'ok', 'counts', counts.join('|'), 'fails', fails.length);
  fails.slice(0, 12).forEach((f) => console.log('  ', JSON.stringify(f)));
}
await b.close();
