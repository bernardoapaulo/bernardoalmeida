// Gera assets/og-v2.png (1200x630) no visual do site: preto, Inter Tight, foto do hero em P&B à direita.
import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const U = (f) => pathToFileURL(path.resolve(f)).href;
const font = 'data:font/woff2;base64,' + fs.readFileSync('node_modules/@fontsource-variable/inter-tight/files/inter-tight-latin-wght-normal.woff2').toString('base64');
const photo = U('assets/photos/hero.jpg');
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'IT';src:url('${font}') format('woff2');font-weight:100 900}
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;background:#0d0d0d;color:#f2f1ed;font-family:'IT',sans-serif;position:relative;overflow:hidden}
.ph{position:absolute;right:0;top:0;width:520px;height:630px;background:url('${photo}') 50% 14%/cover;filter:grayscale(1) contrast(1.05)}
.fade{position:absolute;right:0;top:0;width:520px;height:630px;background:linear-gradient(90deg,#0d0d0d 0%,rgba(13,13,13,.6) 22%,rgba(13,13,13,0) 55%)}
.t{position:absolute;left:60px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;gap:0}
.eb{font-weight:600;font-size:21px;letter-spacing:.28em;text-transform:uppercase;color:#a9a9a4;margin-bottom:26px}
h1{font-weight:800;text-transform:uppercase;font-size:134px;line-height:.9;letter-spacing:-.045em}
h1 span{display:block;color:#0d0d0d;-webkit-text-stroke:5px #f2f1ed;paint-order:stroke fill}
.sub{margin-top:40px;font-weight:500;font-size:31px;letter-spacing:-.01em}
.loc{margin-top:8px;font-weight:500;font-size:22px;letter-spacing:.14em;text-transform:uppercase;color:#a9a9a4}
</style></head><body><div class="ph"></div><div class="fade"></div>
<div class="t"><div class="eb">Portfólio · Parcerias</div><h1>Bernardo<span>Almeida</span></h1>
<div class="sub">Creator de viagem, moda e lifestyle</div><div class="loc">Vitória, ES · @bernardoapaulo</div></div></body></html>`;
const tmp = path.resolve('scripts/_og.html');
fs.writeFileSync(tmp, html);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await p.goto(U(tmp));
await p.evaluate(() => document.fonts.load("800 20px IT").then(() => document.fonts.load("500 20px IT"))); console.log('font ok:', await p.evaluate(() => document.fonts.check("800 20px IT")), font.length);
await p.waitForTimeout(400);
const raw = await p.screenshot();
await b.close();
fs.rmSync(tmp);
const out = await sharp(raw).png({ palette: true, colors: 160, quality: 85, compressionLevel: 9, effort: 10 }).toBuffer();
fs.writeFileSync('assets/og-v2.png', out);
console.log('assets/og-v2.png', (out.length / 1024).toFixed(0) + 'KB');
