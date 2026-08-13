#!/usr/bin/env node
/**
 * Run the whole backup into one timestamped folder.
 *
 * Each step is independent: a failure is reported and the run continues, so a
 * missing Wix app or a permission gap never costs you the steps that do work.
 */

import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { outDir } from './lib/wix.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const dir = process.env.HVC_OUT_DIR || outDir();

const steps = [
  ['01-discover.mjs', 'Site en gepubliceerde URLs'],
  ['02-export-contacts.mjs', 'Contacten'],
  ['03-export-wix-content.mjs', 'Blog en formulieren'],
  ['04-crawl-site.mjs', 'Websitepaginas (copy)'],
];

const run = (script) =>
  new Promise((resolve) => {
    const child = spawn(process.execPath, [join(here, script), ...process.argv.slice(2)], {
      stdio: 'inherit',
      env: { ...process.env, HVC_OUT_DIR: dir },
    });
    child.on('close', resolve);
  });

const results = [];
for (const [script, label] of steps) {
  console.log(`\n${'='.repeat(64)}\n${label}\n${'='.repeat(64)}`);
  const code = await run(script);
  results.push({ label, script, ok: code === 0 });
}

console.log(`\n${'='.repeat(64)}\nSamenvatting\n${'='.repeat(64)}`);
for (const r of results) console.log(`  ${r.ok ? 'OK  ' : 'FOUT'}  ${r.label}`);
console.log(`\nAlles staat in ${dir}/`);

process.exit(results.every((r) => r.ok) ? 0 : 1);
