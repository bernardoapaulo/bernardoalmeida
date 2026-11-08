import { chromium } from 'playwright';
import { execSync } from 'node:child_process';
const b = await chromium.launch({ args: ['--remote-debugging-port=9333'] });
await b.newPage();
try {
  execSync('npx --yes lighthouse http://localhost:4173/ --port=9333 --form-factor=mobile --only-categories=performance,accessibility --output=json --output-path=lh.json --quiet', { stdio: 'inherit' });
} catch (e) { console.log('lighthouse falhou'); }
await b.close();
