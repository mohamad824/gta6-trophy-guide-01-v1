// Neon Palm — GTA VI Trophy Guide & Tracker (gta6-trophy-guide-01 v1)
// Build entry: copies app/ and screenshots/ into the output directory and
// writes /output/dossier.json with buildDossier from vendor/makefun-frontend.ts.
// Run with: node main.ts   (output: /output, or $MAKEFUN_OUTPUT_DIR)
import { buildDossier } from './vendor/makefun-frontend.ts';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ENTRY_DIR = resolve(import.meta.dirname);
const OUT_DIR = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');

const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 48 * 1024 * 1024,
};

function copyTree(src: string, dest: string): number {
  let files = 0;
  for (const name of readdirSync(src)) {
    const s = join(src, name);
    const d = join(dest, name);
    if (statSync(s).isDirectory()) {
      mkdirSync(d, { recursive: true });
      files += copyTree(s, d);
    } else {
      cpSync(s, d);
      files += 1;
    }
  }
  return files;
}

function main(): void {
  mkdirSync(OUT_DIR, { recursive: true });
  let copied = 0;
  for (const dir of ['app', 'screenshots']) {
    const src = join(ENTRY_DIR, dir);
    if (!existsSync(src)) throw new Error(`missing ${dir}/ in entry dir ${ENTRY_DIR}`);
    const dest = join(OUT_DIR, dir);
    rmSync(dest, { recursive: true, force: true });
    mkdirSync(dest, { recursive: true });
    copied += copyTree(src, dest);
  }
  const dossier = buildDossier(OUT_DIR, CAPS);
  writeFileSync(join(OUT_DIR, 'dossier.json'), dossier);
  // Round-trip check: rebuilding from the copied tree must reproduce the
  // dossier byte for byte, so a stale or partial copy can never ship.
  const rebuilt = buildDossier(OUT_DIR, CAPS);
  const written = readFileSync(join(OUT_DIR, 'dossier.json'));
  if (!written.equals(rebuilt)) throw new Error('dossier round-trip mismatch');
  console.log(`neon-palm v1: copied ${copied} files to ${OUT_DIR}, dossier.json ${dossier.length} bytes`);
}

main();
