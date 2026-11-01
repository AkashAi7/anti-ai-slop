#!/usr/bin/env node
// Decodes every GIF and checks dimensions, looping, frame changes, hashes, posters, and transcripts.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import omggif from 'omggif';
import { PNG } from 'pngjs';
import { root } from './lab.mjs';

const { GifReader } = omggif;
const manifest = JSON.parse(readFileSync(join(root, 'assets', 'media-manifest.json'), 'utf8'));
const { scenes } = JSON.parse(readFileSync(join(root, 'demo', 'scenarios.json'), 'utf8'));
assert.equal(manifest.width, 1280);
assert.equal(manifest.height, 720);
assert.equal(manifest.maxBytes, 8 * 1024 * 1024);
assert.equal(manifest.disclaimer, 'Illustrative walkthrough - not recorded Copilot output');
assert.deepEqual(manifest.assets.map(({ id }) => id), [...scenes.map(({ id }) => id), 'studio-tour']);

function poster(name) {
  const png = PNG.sync.read(readFileSync(join(root, 'assets', 'posters', name)));
  assert.equal(png.width, 1280, name);
  assert.equal(png.height, 720, name);
}

for (const asset of manifest.assets) {
  const bytes = readFileSync(join(root, 'assets', 'gifs', `${asset.id}.gif`));
  assert.ok(bytes.length <= manifest.maxBytes, `${asset.id} is larger than 8 MiB`);
  assert.equal(bytes.length, asset.bytes);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256, `${asset.id} hash changed`);
  const reader = new GifReader(bytes);
  assert.equal(reader.width, 1280);
  assert.equal(reader.height, 720);
  assert.equal(reader.loopCount(), 0);
  assert.equal(reader.numFrames(), asset.frames);
  assert.ok(reader.numFrames() > 1);
  const frame = Buffer.alloc(1280 * 720 * 4);
  const hashes = new Set();
  for (let index = 0; index < reader.numFrames(); index++) {
    assert.ok(reader.frameInfo(index).delay > 0);
    reader.decodeAndBlitFrameRGBA(index, frame);
    hashes.add(createHash('sha256').update(frame).digest('hex'));
  }
  assert.ok(hashes.size > 1, `${asset.id} must actually change`);
  const transcript = readFileSync(join(root, 'assets', 'transcripts', `${asset.id}.md`), 'utf8');
  if (asset.kind === 'walkthrough') {
    poster(`${asset.id}-before.png`);
    poster(`${asset.id}-after.png`);
    assert.ok(transcript.includes(manifest.disclaimer), `${asset.id} transcript needs the disclaimer`);
    assert.match(asset.observed, /^# pass \d+ of \d+$/);
  } else {
    poster(`${asset.id}.png`);
    assert.match(transcript, /illustrative/i);
  }
  console.log(`Verified ${asset.id}: decoded ${reader.numFrames()} frames, loop, 1280x720, hash, ${hashes.size} distinct frames, posters, transcript.`);
}
