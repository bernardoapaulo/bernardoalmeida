import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'msedge' });
const sels = { works: '.works .h2', why: '.why .h2', steps: '.steps .h2', contact: '.contact__title' };
for (const [w, h, mob] of [[1440, 900, false], [390, 844, true]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: mob, isMobile: mob });
  const p = await ctx.newPage();
  const errs = []; p.on('console', (m) => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:4173/', { waitUntil: 'networkidle' }); await p.waitForTimeout(1000);
  const state = (s) => p.evaluate((sel) => { const el = document.querySelector(sel); const items = [...el.querySelectorAll('.wi, .ch')]; const op = items.map((i) => parseFloat(getComputedStyle(i).opacity)); const ys = items.map((i) => +(new DOMMatrix(getComputedStyle(i).transform).m42).toFixed(1)); return { top: Math.round(el.getBoundingClientRect().top), minOp: +Math.min(...op).toFixed(2), maxY: Math.max(...ys.map(Math.abs)) }; }, s);
  // posiciona o título com o topo a frac*h da viewport (ajusta em passos, sem depender de offsets)
  const seek = async (sel, frac, wait = 120) => { for (let i = 0; i < 5; i++) { const d = await p.evaluate(([s, f, hh]) => document.querySelector(s).getBoundingClientRect().top - f * hh, [sel, frac, h]); if (Math.abs(d) < 3) break; await p.evaluate((dd) => scrollBy(0, dd), d); await p.waitForTimeout(wait); } };
  for (const [k, sel] of Object.entries(sels)) {
    // desce por etapas até 1.4h abaixo para não disparar
    await seek(sel, 1.5, 200); await p.waitForTimeout(800);
    const before = await state(sel); await p.screenshot({ path: `qa/t4-${w}-${k}-1before.png` });
    await p.evaluate((hh) => scrollBy(0, hh * 0.62), h); await p.waitForTimeout(450);
    const mid = await state(sel); await p.screenshot({ path: `qa/t4-${w}-${k}-2mid.png` });
    await seek(sel, 0.3, 150); await p.waitForTimeout(2600);
    const fin = await state(sel); await p.screenshot({ path: `qa/t4-${w}-${k}-3final.png` });
    await p.evaluate((hh) => scrollBy(0, -hh * 1.3), h); await p.waitForTimeout(2200);
    const back = await state(sel); await p.screenshot({ path: `qa/t4-${w}-${k}-4reverse.png` });
    console.log(w, k, '\n  before', JSON.stringify(before), '\n  mid   ', JSON.stringify(mid), '\n  final ', JSON.stringify(fin), '\n  back  ', JSON.stringify(back));
  }
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(500);
  await p.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await p.waitForTimeout(3500);
  const jumped = {}; for (const [k, sel] of Object.entries(sels)) jumped[k] = (await state(sel)).maxY + '/' + (await state(sel)).minOp;
  console.log(w, 'jump-to-end maxY/minOp', JSON.stringify(jumped), 'errs', errs.length ? errs : 'ok');
  await ctx.close();
}
await b.close();
