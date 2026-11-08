import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'msedge' });
for (const [w, h, mob] of [[1440, 900, false], [390, 844, true]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: mob, isMobile: mob });
  const p = await ctx.newPage();
  const errs = []; p.on('console', (m) => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:4173/', { waitUntil: 'networkidle' }); await p.waitForTimeout(800);
  const top = await p.evaluate(() => document.querySelector('.pillars').getBoundingClientRect().top + scrollY);
  await p.evaluate((y) => scrollTo(0, y + 100), top); await p.waitForTimeout(1500);
  const st = () => p.evaluate(() => { const g = (s) => +new DOMMatrix(getComputedStyle(document.querySelector(s)).transform).m41; const sc = Math.round(g('.pillars__track')), nu = Math.round(g('.pillars__nudge')); return { scrollY: Math.round(scrollY), scrub: sc, manual: nu, total: sc + nu, playing: [...document.querySelectorAll('.pillars video')].filter((v) => !v.paused).length, prevDis: document.querySelector('.pillars__nav--prev').disabled, nextDis: document.querySelector('.pillars__nav--next').disabled }; });
  const rows = [];
  const log = async (l) => { const s = await st(); rows.push({ step: l, ...s }); };
  await log('inicio');
  const next = () => p.click('.pillars__nav--next', { timeout: 1500 }).catch(() => {});
  const prev = () => p.click('.pillars__nav--prev', { timeout: 1500 }).catch(() => {});
  for (let i = 0; i < 5; i++) { await next(); await p.waitForTimeout(900); }
  await log('5x ›'); await p.screenshot({ path: `qa/g4-${w}-next.png` });
  for (let i = 0; i < 5; i++) { await prev(); await p.waitForTimeout(900); }
  await log('5x ‹');
  if (!mob) {
    const box = await p.locator('.pillars__viewport').boundingBox();
    await p.mouse.move(box.x + box.width - 25, box.y + 200); await p.waitForTimeout(1800); await log('borda dir 1.8s'); await p.screenshot({ path: `qa/g4-${w}-edge-r.png` });
    await p.mouse.move(box.x + 25, box.y + 200); await p.waitForTimeout(2500); await log('borda esq 2.5s');
    await p.mouse.move(box.x + box.width / 2, box.y + 200); await p.waitForTimeout(800); await log('mouse no centro (parou)');
    await p.mouse.move(box.x + box.width - 5, box.y + 200); await p.waitForTimeout(6000); await log('borda dir 6s (limite)');
    await p.mouse.move(box.x + box.width / 2, box.y + 200);
    await p.focus('.pillars__viewport'); for (let i = 0; i < 3; i++) { await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(800); } await log('3x ← teclado');
    for (let i = 0; i < 3; i++) { await p.keyboard.press('ArrowRight'); await p.waitForTimeout(800); } await log('3x → teclado');
    // segurar
    const nb = await p.locator('.pillars__nav--prev').boundingBox();
    await p.mouse.move(nb.x + 20, nb.y + 20); await p.mouse.down(); await p.waitForTimeout(2200); await p.mouse.up(); await log('segurar ‹ 2.2s');
  } else {
    const box = await p.locator('.pillars__viewport').boundingBox();
    const cdp = await ctx.newCDPSession(p);
    const swipe = async (x0, x1, y = box.y + 250) => { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y }] }); for (let i = 1; i <= 8; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + ((x1 - x0) * i) / 8, y: y + 2 }] }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await p.waitForTimeout(1200); };
    await swipe(300, 60); await log('swipe ←'); await swipe(60, 330); await log('swipe →');
  }
  console.log(w, 'errs', errs.length ? errs : 'ok'); console.table(rows);
  await p.screenshot({ path: `qa/g4-${w}-end.png` });
  await ctx.close();
}
await b.close();
