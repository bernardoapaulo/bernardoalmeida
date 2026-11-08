import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'msedge' });
const tx = (p) => p.evaluate(() => { const t = document.querySelector('.pillars__track'); return { x: Math.round(new DOMMatrix(getComputedStyle(t).transform).m41), sl: Math.round(document.querySelector('.pillars__viewport').scrollLeft), y: Math.round(scrollY), playing: [...document.querySelectorAll('.pillars video')].filter((v) => !v.paused).length }; });
// desktop
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const errs = []; p.on('console', (m) => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(800);
  const st = await p.evaluate(() => { const s = document.querySelector('.pillars'); return { top: s.getBoundingClientRect().top + scrollY, h: s.offsetHeight }; });
  console.log('section', st);
  await p.evaluate((y) => scrollTo(0, y), st.top + 120); await p.waitForTimeout(1500);
  console.log('mid', await tx(p));
  const box = await p.locator('.pillars__viewport').boundingBox();
  const cy = box.y + 200;
  await p.mouse.move(box.x + box.width / 2, cy); await p.waitForTimeout(300);
  console.log('center', await tx(p));
  await p.mouse.move(box.x + box.width - 30, cy); await p.waitForTimeout(1500);
  console.log('right 1.5s', await tx(p)); await p.screenshot({ path: 'qa/n-1440-right.png' });
  await p.mouse.move(box.x + box.width / 2, cy); await p.waitForTimeout(800);
  const a = await tx(p); await p.waitForTimeout(600); console.log('stopped?', a, await tx(p));
  await p.mouse.move(box.x + 30, cy); await p.waitForTimeout(1500);
  console.log('left 1.5s', await tx(p)); await p.screenshot({ path: 'qa/n-1440-left.png' });
  await p.waitForTimeout(3000); console.log('left more (start limit)', await tx(p));
  await p.mouse.move(box.x + box.width - 5, cy); await p.waitForTimeout(6000);
  console.log('right 6s (end limit)', await tx(p));
  await p.mouse.move(box.x + box.width / 2, cy);
  // botão e teclado
  await p.evaluate((y) => scrollTo(0, y), st.top + 5); await p.waitForTimeout(1200);
  console.log('btn start', await tx(p));
  await p.click('.pillars__nav--next'); await p.waitForTimeout(1500); console.log('after next', await tx(p));
  await p.click('.pillars__nav--prev'); await p.waitForTimeout(1500); console.log('after prev', await tx(p));
  await p.focus('.pillars__viewport'); await p.keyboard.press('ArrowRight'); await p.waitForTimeout(1500); console.log('key →', await tx(p));
  // roda do mouse tem prioridade
  await p.mouse.move(box.x + box.width - 30, cy); await p.mouse.wheel(0, 0); await p.waitForTimeout(300);
  const w0 = await tx(p); await p.waitForTimeout(400); console.log('wheel pause (mantém ~parado 600ms)', w0, await tx(p));
  console.log('errs', errs.length ? errs : 'ok');
  await ctx.close();
}
// mobile
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const p = await ctx.newPage();
  const errs = []; p.on('console', (m) => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(800);
  const top = await p.evaluate(() => document.querySelector('.pillars').getBoundingClientRect().top + scrollY);
  await p.evaluate((y) => scrollTo(0, y + 200), top); await p.waitForTimeout(1500);
  console.log('m start', await tx(p));
  await p.screenshot({ path: 'qa/n-390-a.png' });
  await p.tap('.pillars__nav--next'); await p.waitForTimeout(1500); console.log('m next', await tx(p));
  await p.tap('.pillars__nav--next'); await p.waitForTimeout(1500); console.log('m next2', await tx(p));
  await p.tap('.pillars__nav--prev'); await p.waitForTimeout(1500); console.log('m prev', await tx(p));
  await p.screenshot({ path: 'qa/n-390-b.png' });
  console.log('m errs', errs.length ? errs : 'ok');
  await ctx.close();
}
await b.close();
