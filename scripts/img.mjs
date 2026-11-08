import sharp from 'sharp';
sharp.cache(false);
import fs from 'node:fs';
const dir = 'assets/photos/';
for (const f of fs.readdirSync(dir).filter((x) => /\.jpg$/.test(x))) {
  const stem = f.replace('.jpg', '');
  const src = fs.readFileSync(dir + f); const m = await sharp(src).metadata();
  const out = [];
  for (const w of [800, 1600]) {
    if (w > m.width && w !== 800) continue;
    const tw = Math.min(w, m.width);
    await sharp(src).resize({ width: tw }).webp({ quality: 74 }).toFile(`${dir}${stem}-${w}.webp`);
    out.push(`${w}:${(fs.statSync(`${dir}${stem}-${w}.webp`).size / 1024) | 0}KB`);
  }
  // jpg base: recomprime só os grandes (fallback)
  if (fs.statSync(dir + f).size > 150000) {
    const buf = await sharp(src).resize({ width: Math.min(1600, m.width) }).jpeg({ quality: 76, mozjpeg: true }).toBuffer();
    if (buf.length < fs.statSync(dir + f).size) fs.writeFileSync(dir + f, buf);
  }
  console.log(f, m.width + 'x' + m.height, (fs.statSync(dir + f).size / 1024) | 0 + 'KB', out.join(' '));
}
