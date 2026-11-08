// Gera assets/og.png (1200x630) com o nome e o boneco, usando Playwright.
import { chromium } from 'playwright';
const html = `<html><body style="margin:0;width:1200px;height:630px;background:#0E1A2F;color:#F3EEE4;font-family:Georgia,serif;position:relative;overflow:hidden">
<div style="position:absolute;right:-120px;top:-160px;width:560px;height:560px;border-radius:50%;background:#C4623B;opacity:.9"></div>
<div style="position:absolute;right:120px;bottom:-40px;width:330px;height:500px;border-radius:999px 999px 0 0;background:#E3A857;opacity:.25"></div>
<div style="position:absolute;left:80px;top:90px;font:600 22px/1 Arial;letter-spacing:.16em;color:#E3A857">CREATOR · VIAGEM · MODA · LIFESTYLE</div>
<div style="position:absolute;left:80px;top:170px;font-size:150px;line-height:.92;letter-spacing:-4px;font-weight:300">Bernardo<br><i style="color:#E3A857">Almeida</i></div>
<div style="position:absolute;left:84px;bottom:70px;font:500 30px Arial">@bernardoapaulo · Vitória, ES</div>
<svg style="position:absolute;right:230px;bottom:60px" width="180" height="312" viewBox="0 0 60 104">
<rect x="14" y="68" width="14" height="32" rx="3" fill="#0E1A2F"/><rect x="12" y="96" width="18" height="7" rx="3" fill="#F3EEE4"/>
<rect x="32" y="68" width="14" height="32" rx="3" fill="#0E1A2F"/><rect x="30" y="96" width="18" height="7" rx="3" fill="#F3EEE4"/>
<rect x="12" y="62" width="36" height="12" rx="3" fill="#13233f"/>
<rect x="3" y="34" width="10" height="28" rx="4" fill="#C4623B"/><circle cx="8" cy="64" r="5" fill="#F2C94C"/>
<rect x="47" y="34" width="10" height="28" rx="4" fill="#C4623B"/><circle cx="52" cy="64" r="5" fill="#F2C94C"/>
<rect x="12" y="32" width="36" height="34" rx="5" fill="#C4623B"/><rect x="25" y="26" width="10" height="8" fill="#F2C94C"/>
<rect x="16" y="3" width="28" height="26" rx="7" fill="#F2C94C"/><rect x="24" y="0" width="12" height="5" rx="2" fill="#F2C94C"/>
<path d="M16 12c2-9 26-9 28 0-8-3-20-3-28 0z" fill="#3a2a1d"/><circle cx="24" cy="18" r="1.8" fill="#0E1A2F"/><circle cx="36" cy="18" r="1.8" fill="#0E1A2F"/>
<path d="M24 23c3 3 9 3 12 0" stroke="#0E1A2F" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>
</body></html>`;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
await p.setContent(html);
await p.screenshot({ path: 'assets/og.png' });
await b.close();
console.log('assets/og.png gerado');
