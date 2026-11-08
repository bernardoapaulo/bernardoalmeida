// Gera versões WebP (800w e 1600w) de todas as fotos em assets/photos para uso com srcset.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
const dir = path.resolve('assets/photos');
const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /\.(jpe?g|png)$/i.test(f)) : [];
for (const f of files) {
  const stem = f.replace(/\.[^.]+$/, '');
  for (const w of [800, 1600]) {
    const out = path.join(dir, `${stem}-${w}.webp`);
    await sharp(path.join(dir, f)).resize({ width: w, withoutEnlargement: true }).webp({ quality: 78 }).toFile(out);
    console.log('ok', path.relative('.', out));
  }
}
if (!files.length) console.log('Nenhuma foto em assets/photos ainda.');
