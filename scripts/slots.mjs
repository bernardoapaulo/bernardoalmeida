import fs from 'node:fs';
import path from 'node:path';

export const ASSETS_DIR = path.resolve('assets');

const range = (n) => [1, 2, 3, 4].map((i) => i);
// kind: image (base name, any of avif/webp/jpg/jpeg/png) | video (exact file)
export const SLOTS = [
  { slot: 'Hero', file: 'photos/hero', kind: 'image', required: true },
  { slot: 'Sobre', file: 'photos/about', kind: 'image', required: true },
  ...['viagens', 'moda', 'restaurante', 'grwm', 'gym'].map((p) => ({ slot: `Pilar (capa) ${p}`, file: `photos/pillar-${p}`, kind: 'image', required: false })),
  ...['viagens', 'moda', 'restaurante', 'grwm', 'gym'].map((p) => ({ slot: `Pilar (vídeo) ${p}`, file: `video/pillar-${p}.mp4`, kind: 'video', required: true })),
  ...['bazc', 'olv', 'capetown'].map((p) => ({ slot: `Case (vídeo) ${p}`, file: `video/work-${p}.mp4`, kind: 'video', required: p === 'capetown' })),
  ...['bazc', 'olv', 'capetown'].map((p) => ({ slot: `Case (capa) ${p}`, file: `photos/work-${p}`, kind: 'image', required: false })),
];

export const IMG_EXT = ['avif', 'webp', 'jpg', 'jpeg', 'png'];

export function walk(dir, base = dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? walk(p, base) : [path.relative(base, p).split(path.sep).join('/')];
  });
}
