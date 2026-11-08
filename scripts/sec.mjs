import { chromium } from 'playwright';
const [, , w = '1440', h = '900'] = process.argv;
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: +w, height: +h } })).newPage();
await p.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
await p.waitForTimeout(2500);
for (const [id, name] of [['about', '.about'], ['pill', '.pillars'], ['works', '.works']]) {
  const y = await p.evaluate((s) => document.querySelector(s).getBoundingClientRect().top + scrollY, name);
  await p.evaluate((y) => window.scrollTo(0, y), y + (id === 'works' ? 250 : 0));
  await p.waitForTimeout(1800);
  await p.screenshot({ path: `shots/sec-${w}-${id}.png` });
}
await p.evaluate(() => window.scrollTo(0, document.querySelector('.work--solo').getBoundingClientRect().top + scrollY - 80));
await p.waitForTimeout(1800);
await p.screenshot({ path: `shots/sec-${w}-cape.png` });
await b.close();
