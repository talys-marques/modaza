#!/usr/bin/env node
// Runs before `astro dev` / `astro build` (predev/prebuild in package.json).
// Reads the versioned product photos in imagens/produtos/{sku}/ (any of webp, jpg, png, gif,
// named 1, 2, 3... in display order) and writes what the site serves:
//   public/img/produtos/{sku}/{n}.webp       up to 1600px, for the product gallery
//   public/img/produtos/{sku}/{n}-640.webp   640px, for cards and thumbnails
//   src/generated/imagens.json               dimensions per SKU, read by the site
// Outputs are git-ignored and only regenerated when the source photo changes,
// so editors can drop a plain JPG in the folder and the build converts it.

import { readdir, mkdir, stat, rm, writeFile, copyFile } from 'node:fs/promises';
import { availableParallelism } from 'node:os';
import { join, parse } from 'node:path';
import sharp from 'sharp';

const SOURCE_DIR = join('imagens', 'produtos');
const OUTPUT_DIR = join('public', 'img', 'produtos');
const MANIFEST = join('src', 'generated', 'imagens.json');
const FULL_SIDE = 1600;
const THUMB_SIDE = 640;
const SOURCE_EXT = new Set(['.webp', '.jpg', '.jpeg', '.png', '.gif', '.avif']);

const mtime = (path) => stat(path).then((s) => s.mtimeMs, () => 0);

async function render(source, dest, side, quality) {
  await sharp(source, { animated: true })
    .autoOrient()
    .resize({ width: side, height: side, fit: 'inside', withoutEnlargement: true })
    .webp({ quality, effort: 4 })
    .toFile(dest);
}

async function processImage({ sku, file, n }) {
  const source = join(SOURCE_DIR, sku, file);
  const full = join(OUTPUT_DIR, sku, `${n}.webp`);
  const thumb = join(OUTPUT_DIR, sku, `${n}-${THUMB_SIDE}.webp`);
  const sourceTime = await mtime(source);
  const meta = await sharp(source, { animated: true }).metadata();
  const width = meta.width;
  const height = meta.pageHeight ?? meta.height;

  if ((await mtime(full)) < sourceTime) {
    // Already-optimized WebP sources are copied as they are
    if (meta.format === 'webp' && Math.max(width, height) <= FULL_SIDE) await copyFile(source, full);
    else await render(source, full, FULL_SIDE, 80);
  }
  if ((await mtime(thumb)) < sourceTime) await render(source, thumb, THUMB_SIDE, 75);

  const scale = (side) => Math.min(1, side / Math.max(width, height));
  return {
    n,
    w: Math.round(width * scale(FULL_SIDE)),
    h: Math.round(height * scale(FULL_SIDE)),
    tw: Math.round(width * scale(THUMB_SIDE)),
    th: Math.round(height * scale(THUMB_SIDE)),
  };
}

async function main() {
  const started = Date.now();
  const skus = (await readdir(SOURCE_DIR, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name);
  const jobs = [];
  for (const sku of skus) {
    await mkdir(join(OUTPUT_DIR, sku), { recursive: true });
    const files = (await readdir(join(SOURCE_DIR, sku)))
      .filter((f) => SOURCE_EXT.has(parse(f).ext.toLowerCase()) && /^\d+$/.test(parse(f).name))
      .sort((a, b) => Number(parse(a).name) - Number(parse(b).name));
    for (const file of files) jobs.push({ sku, file, n: Number(parse(file).name) });
  }

  // Remove outputs whose source folder no longer exists
  const outputs = await readdir(OUTPUT_DIR).catch(() => []);
  for (const dir of outputs.filter((d) => !skus.includes(d))) await rm(join(OUTPUT_DIR, dir), { recursive: true });

  const manifest = {};
  const queue = [...jobs];
  const failures = [];
  await Promise.all(
    Array.from({ length: availableParallelism() }, async () => {
      while (queue.length) {
        const job = queue.shift();
        try {
          (manifest[job.sku] ??= []).push(await processImage(job));
        } catch (err) {
          failures.push(`${join(SOURCE_DIR, job.sku, job.file)}: ${err.message}`);
        }
      }
    })
  );
  for (const list of Object.values(manifest)) list.sort((a, b) => a.n - b.n);

  await mkdir(parse(MANIFEST).dir, { recursive: true });
  await writeFile(MANIFEST, JSON.stringify(manifest));
  console.log(`Imagens: ${jobs.length} fotos de ${skus.length} produtos prontas em ${((Date.now() - started) / 1000).toFixed(1)}s`);
  if (failures.length) {
    console.error(`Falha ao processar ${failures.length} imagem(ns):\n  ${failures.join('\n  ')}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
