import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 916, height: 940 } })).newPage();
await p.goto('http://localhost:4173/', { waitUntil: 'domcontentloaded' });
for (const t of [200, 600, 1200, 2500]) {
  await p.waitForTimeout(t === 200 ? 200 : 400);
  const r = await p.evaluate(() => ({ y: scrollY, th: document.body.dataset.theme, bg: getComputedStyle(document.body).backgroundColor, tt: getComputedStyle(document.querySelector('.hero__title')).color, op: getComputedStyle(document.querySelector('.hero__sub')).opacity, ty: document.querySelector('.hero__line span').getBoundingClientRect().top }));
  console.log(t, JSON.stringify(r));
  await p.mouse.wheel(0, 20);
}
await b.close();
