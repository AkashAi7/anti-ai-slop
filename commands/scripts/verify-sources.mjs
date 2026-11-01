#!/usr/bin/env node
// Fetches each documentation page in sources.json and checks that every expected command or string still appears.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { root } from './lab.mjs';

const { sources } = JSON.parse(readFileSync(join(root, 'sources.json'), 'utf8'));
let failed = 0;
for (const source of sources) {
  const url = new URL(source.url);
  if (url.protocol !== 'https:' || !['code.visualstudio.com', 'docs.github.com'].includes(url.hostname)) {
    throw new Error(`${source.id}: unexpected source host ${url.hostname}`);
  }
  let text;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    text = (await response.text()).replace(/<wbr\s*\/?>/gi, '');
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${source.id}: ${error.message}`);
    continue;
  }
  const missing = source.expect.filter((value) => !text.includes(value));
  if (missing.length) {
    failed += 1;
    console.error(`FAIL ${source.id}: missing ${missing.join(', ')} at ${source.url}`);
  } else {
    console.log(`ok ${source.id}: ${source.expect.length} strings found at ${source.url}`);
  }
}
if (failed) {
  console.error(`${failed} source(s) failed. Update commands.json and sources.json if the docs changed.`);
  process.exit(1);
}
console.log(`Verified ${sources.length} documentation sources.`);
