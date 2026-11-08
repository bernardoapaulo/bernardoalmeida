import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
  await p.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);
  console.log(w, await p.evaluate(() => [...document.querySelectorAll('main > section, main > div')].map((s) => `${s.className.split(' ')[0]}:${Math.round(s.getBoundingClientRect().height)}`).join(' ')), await p.evaluate(() => document.documentElement.scrollHeight));
  if (w === 1440) {
    const t = await p.evaluate(() => { const c = document.querySelectorAll('.pillar')[1]; const r = c.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
    await p.evaluate(() => window.scrollTo(0, document.querySelector('.pillars').getBoundingClientRect().top + scrollY));
    await p.waitForTimeout(1500);
    const c = await p.evaluate(() => { const r = document.querySelectorAll('.pillar')[0].getBoundingClientRect(); return [r.left + r.width / 2 - 40, r.top + r.height / 3]; });
    await p.mouse.move(c[0], c[1]); await p.mouse.move(c[0] + 30, c[1] + 20, { steps: 8 });
    await p.waitForTimeout(800);
    console.log('tilt', await p.evaluate(() => getComputedStyle(document.querySelectorAll('.pillar')[0]).transform));
  }
}
await b.close();
