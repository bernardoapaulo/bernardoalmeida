import { chromium } from 'playwright';
import fs from 'node:fs';
fs.mkdirSync('qa', { recursive: true });
const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const lum = (c) => { const [r, g, bl] = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * bl; };
for (const [w, h, mobile] of [[390, 844, true], [768, 1024, false], [1440, 900, false]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: mobile, isMobile: mobile });
  const p = await ctx.newPage();
  const errs = [];
  p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  p.on('pageerror', (e) => errs.push('PAGEERR ' + e.message));
  await p.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: `qa/h-${w}-hero.png` });
  const info = await p.evaluate(() => ({
    total: document.documentElement.scrollHeight,
    pill: document.querySelector('.pillars').getBoundingClientRect().top + scrollY,
    steps: document.querySelector('.steps').getBoundingClientRect().top + scrollY,
    heroTitleVisible: (() => { const r = document.querySelector('.hero__title').getBoundingClientRect(); return r.width > 5 || r.height > 5; })(),
  }));
  const go = async (y, t = 250) => { await p.evaluate((yy) => window.scrollTo(0, yy), y); await p.waitForTimeout(t); };
  // descida lenta
  const bgs = new Set();
  for (let y = 0; y < info.total; y += 300) {
    await go(y, 140);
    bgs.add(await p.evaluate(() => getComputedStyle(document.body).backgroundColor));
    if (y % 1200 === 0) await p.screenshot({ path: `qa/h-${w}-down-${String(y).padStart(5, '0')}.png` });
  }
  // galeria
  const pin = [];
  for (const dy of [0, 150, 400, 800, 1200]) {
    await go(info.pill + dy, 500);
    pin.push(await p.evaluate(() => {
      const s = document.querySelector('.pillars').getBoundingClientRect();
      const tr = document.querySelector('.pillars__track');
      const vp = document.querySelector('.pillars__viewport');
      const vids = [...document.querySelectorAll('.pillar video')].filter((v) => !v.paused).length;
      const act = [...document.querySelectorAll('.pillar')].findIndex((c) => c.classList.contains('is-active'));
      return { top: Math.round(s.top), x: Math.round(new DOMMatrix(getComputedStyle(tr).transform).m41), sl: Math.round(vp.scrollLeft), playing: vids, active: act };
    }));
    if (dy === 400) await p.screenshot({ path: `qa/h-${w}-gallery.png` });
  }
  // passos
  const stp = [];
  for (const f of [0.0, 0.3, 0.6, 0.9]) {
    const sh = await p.evaluate(() => document.querySelector('.steps__list').offsetHeight);
    await go(info.steps + 150 + f * sh, 700);
    stp.push(await p.evaluate(() => ({ on: document.querySelectorAll('.step.on').length, dot: document.querySelector('.steps__dot').style.transform || getComputedStyle(document.querySelector('.steps__dot')).transform })));
    if (f === 0.6) await p.screenshot({ path: `qa/h-${w}-steps.png` });
  }
  // volta ao topo, em passos
  for (let y = info.total; y > 0; y -= 500) {
    await go(y, 100);
    if (Math.round(y) % 1500 < 500) await p.screenshot({ path: `qa/h-${w}-up-${String(Math.round(y)).padStart(5, '0')}.png` });
  }
  await go(0, 2500);
  const rev = await p.evaluate(() => {
    const vh = innerHeight;
    const hidden = [...document.querySelectorAll('[data-fade]')].filter((e) => e.getBoundingClientRect().top > vh * 1.1);
    const stuckVisible = hidden.filter((e) => parseFloat(getComputedStyle(e).opacity) > 0.05).length;
    const cnt = [...document.querySelectorAll('.count')].filter((e) => e.getBoundingClientRect().top > vh * 1.1).map((e) => e.textContent).slice(0, 4);
    return { belowFades: hidden.length, stuckVisible, cnt, on: document.querySelectorAll('.step.on').length };
  });
  // desce de novo: nada preso invisível na tela
  const prevPos = [];
  for (let y = 0; y < info.total; y += 350) {
    await go(y, 900);
    prevPos.push(await p.evaluate(() => {
      const vh = innerHeight;
      return [...document.querySelectorAll('[data-fade],[data-split] .wi')].filter((e) => { const r = e.getBoundingClientRect(); return r.top > 0 && r.bottom < vh * 0.9 && parseFloat(getComputedStyle(e).opacity) < 0.9 && !e.closest('.pillars'); }).length;
    }));
  }
  const counts = await p.evaluate(() => [...document.querySelectorAll('.count')].map((e) => e.textContent).slice(0, 5));
  console.log(w, 'heroTitleVisible', info.heroTitleVisible, 'bg', [...bgs], 'errs', errs.length ? errs.slice(0, 4) : 'ok');
  console.log('  gallery', JSON.stringify(pin));
  console.log('  steps', JSON.stringify(stp));
  console.log('  reverse', JSON.stringify(rev), 'stuck-on-redescent', Math.max(...prevPos), 'counts', counts.join('|'));
  await ctx.close();
}
await b.close();
