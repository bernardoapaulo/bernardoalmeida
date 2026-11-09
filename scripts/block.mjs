import { chromium, webkit, devices } from 'playwright';
for (const [engine, rm] of [['chromium', 'no-preference'], ['webkit', 'no-preference'], ['chromium', 'reduce']]) {
  const b = await (engine === 'webkit' ? webkit : chromium).launch(engine === 'webkit' ? {} : { channel: 'msedge' });
  const ctx = await b.newContext({ ...devices['iPhone 13'], reducedMotion: rm });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  // simula bloqueio de autoplay (Modo de Economia de Energia) até um clique em ▶
  await p.addInitScript(() => { window.__allow = false; const op = HTMLMediaElement.prototype.play; HTMLMediaElement.prototype.play = function () { if (!window.__allow) return Promise.reject(new DOMException('blocked', 'NotAllowedError')); return op.call(this); }; });
  await p.goto('http://localhost:4173/', { waitUntil: 'networkidle' }); await p.waitForTimeout(800);
  const top = await p.evaluate(() => document.querySelector('.pillars').getBoundingClientRect().top + scrollY);
  await p.evaluate((y) => scrollTo(0, y + 150), top); await p.waitForTimeout(1800);
  const st = () => p.evaluate(() => [...document.querySelectorAll('.pillar')].map((c) => { const v = c.querySelector('video'); const r = c.getBoundingClientRect(); const pb = c.querySelector('.pillar__play'); return { vis: r.right > 0 && r.left < innerWidth, paused: v.paused, playBtn: !pb.hidden }; }).filter((x) => x.vis));
  console.log(`### ${engine} rm=${rm} bloqueado:`, JSON.stringify(await st()));
  await p.screenshot({ path: `qa/m-blocked-${engine}-${rm}.png` });
  await p.evaluate(() => (window.__allow = true));
  await p.locator('.pillar__play:visible').last().click({ timeout: 5000 }); await p.waitForTimeout(1500);
  const t1 = await p.evaluate(() => [...document.querySelectorAll('.pillar video')].filter((v) => !v.paused).map((v) => +v.currentTime.toFixed(2)));
  await p.waitForTimeout(900);
  const t2 = await p.evaluate(() => [...document.querySelectorAll('.pillar video')].filter((v) => !v.paused).map((v) => +v.currentTime.toFixed(2)));
  console.log('   depois de clicar ▶ (tocando):', JSON.stringify(t1), '→', JSON.stringify(t2), 'botões ▶ visíveis:', await p.evaluate(() => [...document.querySelectorAll('.pillar__play')].filter((x) => !x.hidden).length));
  if (rm === 'reduce') {
    const pb = p.locator('.pillar__pause:visible').first(); await pb.click(); await p.waitForTimeout(800);
    console.log('   ⏸ clicado: pausados visíveis =', await p.evaluate(() => [...document.querySelectorAll('.pillar')].filter((c) => { const r = c.getBoundingClientRect(); return r.right > 0 && r.left < innerWidth && c.querySelector('video').paused; }).length), 'aria-pressed', await pb.getAttribute('aria-pressed'));
  }
  console.log('   errs', errs.length ? errs : 'ok');
  await b.close();
}
