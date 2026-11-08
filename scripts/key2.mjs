import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'msedge' });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto('http://localhost:4173/', { waitUntil: 'networkidle' }); await p.waitForTimeout(800);
const top = await p.evaluate(() => document.querySelector('.pillars').getBoundingClientRect().top + scrollY);
await p.evaluate((y) => scrollTo(0, y + 5), top); await p.waitForTimeout(1200);
const offs = await p.evaluate(() => [...document.querySelectorAll('.pillar')].map((c) => [c.offsetLeft, c.offsetWidth]));
console.log(JSON.stringify(offs));
const x = () => p.evaluate(() => Math.round(new DOMMatrix(getComputedStyle(document.querySelector('.pillars__track')).transform).m41) + ' y' + Math.round(scrollY));
await p.evaluate(() => document.addEventListener('keydown', (e) => console.log('KEY', e.key, e.defaultPrevented, document.activeElement.className)));
p.on('console', (m) => console.log('  page:', m.text()));
await p.focus('.pillars__viewport');
for (let i = 0; i < 4; i++) { await p.keyboard.press('ArrowRight'); await p.waitForTimeout(1300); console.log('→', await x()); }
await b.close();
