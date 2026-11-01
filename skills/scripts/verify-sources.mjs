import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { root } from './lab.mjs';

const { sources } = JSON.parse(readFileSync(join(root, 'sources.json'), 'utf8'));
for (const source of sources) {
  const repository = new URL(source.repository);
  assert.equal(repository.hostname, 'github.com');
  assert.match(source.revision, /^[a-f0-9]{40}$/);
  const url = `https://raw.githubusercontent.com${repository.pathname}/${source.revision}/${source.path}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`${source.path}: HTTP ${response.status}`);
  const hash = createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex');
  assert.equal(hash, source.sha256, `Changed upstream bytes: ${source.path}`);
  console.log(`Verified upstream hash: ${repository.pathname}/${source.path}`);
}
