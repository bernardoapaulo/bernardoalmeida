import sharp from 'sharp';
import fs from 'node:fs';
const [prefix, per = 5, out = 'sheet'] = process.argv.slice(2);
const files = fs.readdirSync('shots').filter((f) => f.startsWith(prefix + '-')).sort();
for (let s = 0; s * per < files.length; s++) {
  const chunk = files.slice(s * per, s * per + per);
  const imgs = await Promise.all(chunk.map((f) => sharp('shots/' + f).resize({ height: 700 }).toBuffer({ resolveWithObject: true })));
  const W = imgs.reduce((a, i) => a + i.info.width + 8, 0);
  await sharp({ create: { width: W, height: 700, channels: 3, background: '#888' } })
    .composite(imgs.map((i, k) => ({ input: i.data, left: imgs.slice(0, k).reduce((a, j) => a + j.info.width + 8, 0), top: 0 })))
    .png().toFile(`shots/${out}-${prefix}-${s}.png`);
}
