import { chromium } from 'playwright';
const label = process.argv[2] || 'x';
let b;
try { b = await chromium.launch({ channel: 'chrome' }); console.log('browser: chrome'); } catch { try { b = await chromium.launch({ channel: 'msedge' }); console.log('browser: msedge'); } catch { b = await chromium.launch(); console.log('browser: chromium'); } }
for (const [w, h, mob] of [[1440, 900, false], [390, 844, true]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: mob, isMobile: mob });
  const p = await ctx.newPage();
  const errs = [];
  p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  p.on('response', (r) => r.status() >= 400 && errs.push(r.status() + ' ' + r.url()));
  await p.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1000);
  await p.evaluate(() => { window.__pe = []; document.querySelectorAll('.pillars video').forEach((v, i) => { const op = v.play.bind(v); v.play = () => { const r = op(); r.catch((e) => window.__pe.push(i + ':' + e.name)); return r; }; }); });
  const y = await p.evaluate(() => { const s = document.querySelector('.pillars'); return s.getBoundingClientRect().top + scrollY; });
  await p.evaluate((yy) => scrollTo(0, yy + 300), y);
  await p.waitForTimeout(2500);
  const snap = () => p.evaluate(() => [...document.querySelectorAll('.pillars video')].map((v) => { const r = v.getBoundingClientRect(); const vis = Math.max(0, Math.min(r.right, innerWidth) - Math.max(r.left, 0)) / r.width; return { src: v.getAttribute('src').split('/').pop(), vis: +vis.toFixed(2), paused: v.paused, rs: v.readyState, ns: v.networkState, err: v.error && v.error.code, t: +v.currentTime.toFixed(2) }; }));
  const a = await snap(); await p.waitForTimeout(1000); const c = await snap();
  console.log(label, w, 'playErrors', await p.evaluate(() => window.__pe), 'errs', errs.slice(0, 5));
  console.table(a.map((r, i) => ({ ...r, t2: c[i].t, adv: c[i].t > r.t })));
  await p.screenshot({ path: `qa/v-${label}-${w}.png` });
  await ctx.close();
}
await b.close();
