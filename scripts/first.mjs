import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
  const errs = []; p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await p.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(2500);
  await p.evaluate(() => window.scrollTo(0, 120));
  await p.waitForTimeout(1800);
  await p.screenshot({ path: `shots/first-${w}.png` });
  console.log(w, errs.length ? errs : 'ok');
}
await b.close();
