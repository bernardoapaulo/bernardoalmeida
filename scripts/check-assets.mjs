import fs from 'node:fs';
import path from 'node:path';
import { SLOTS, ASSETS_DIR, IMG_EXT, walk } from './slots.mjs';

const files = new Set(walk(ASSETS_DIR));
let missing = 0;
console.log('\nSlots de imagem e vídeo (assets/)\n');
for (const s of SLOTS) {
  const exts = s.ext || IMG_EXT;
  const found = s.kind === 'video' ? (files.has(s.file) ? s.file : null) : exts.map((e) => `${s.file}.${e}`).find((f) => files.has(f));
  const tag = s.required ? '' : ' (opcional)';
  if (found) {
    const mb = fs.statSync(path.join(ASSETS_DIR, found)).size / 1048576;
    const warn = s.kind === 'video' && mb > 3 ? `  ⚠ ${mb.toFixed(1)} MB (meta: ~3 MB)` : '';
    console.log(`  ok       ${found}${warn}`);
  } else {
    if (s.required) missing++;
    console.log(`  PENDENTE ${s.kind === 'video' ? s.file : s.file + '.' + (s.ext ? s.ext[0] : 'jpg')}${tag}  ← ${s.slot}`);
  }
}
console.log(`\n${missing} slot(s) obrigatório(s) pendente(s). Placeholders cobrem os faltantes.\n`);
