import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { ASSETS_DIR, walk } from './scripts/slots.mjs';

function findNulls(obj, trail = '', out = []) {
  if (obj === null) out.push(trail);
  else if (obj && typeof obj === 'object') {
    if (obj.show === false) out.push(`${trail} (show: false)`);
    for (const [k, v] of Object.entries(obj)) findNulls(v, trail ? `${trail}.${k}` : k, out);
  }
  return out;
}

function contentWarnings() {
  return {
    name: 'content-warnings',
    buildStart() {
      const data = JSON.parse(fs.readFileSync('src/data/content.json', 'utf8'));
      const nulls = findNulls(data);
      if (nulls.length) {
        console.warn('\n[content.json] Campos nulos ou ocultos (blocos não serão renderizados):');
        nulls.forEach((n) => console.warn('  - ' + n));
        console.warn('');
      }
    },
    closeBundle() {
      // não publicar as imagens originais do mascote
      fs.rmSync(path.resolve('dist/lego/source'), { recursive: true, force: true });
    },
  };
}

export default defineConfig({
  base: './',
  publicDir: 'assets',
  define: { __ASSETS__: JSON.stringify(walk(ASSETS_DIR)) },
  plugins: [contentWarnings()],
  build: { target: 'es2020', chunkSizeWarningLimit: 600 },
});
