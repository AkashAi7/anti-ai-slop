import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import omggif from 'omggif';
import { PNG } from 'pngjs';
import { root } from './lab.mjs';

const { GifReader } = omggif;
const manifest = JSON.parse(readFileSync(join(root, 'assets', 'media-manifest.json'), 'utf8'));
const scenes = JSON.parse(readFileSync(join(root, 'demo', 'scenarios.json'), 'utf8'));
assert.equal(manifest.width, 1280);
assert.equal(manifest.height, 720);
assert.equal(manifest.maxBytes, 8 * 1024 * 1024);
assert.equal(manifest.disclaimer, 'Illustrative walkthrough - not recorded Copilot output');
assert.deepEqual(manifest.assets.map(({ id }) => id), scenes.map(({ id }) => id));
for (const asset of manifest.assets) {
  const bytes = readFileSync(join(root, 'assets', 'gifs', `${asset.id}.gif`));
  assert.ok(bytes.length <= manifest.maxBytes);
  assert.equal(bytes.length, asset.bytes);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256);
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
  assert.ok(hashes.size > 1, 'GIF must actually change');
  for (const suffix of ['before', 'after']) {
    const poster = PNG.sync.read(readFileSync(join(root, 'assets', 'posters', `${asset.id}-${suffix}.png`)));
    assert.equal(poster.width, 1280);
    assert.equal(poster.height, 720);
  }
  assert.ok(readFileSync(join(root, 'assets', 'transcripts', `${asset.id}.md`), 'utf8').includes(manifest.disclaimer));
  console.log(`Verified ${asset.id}: decoded ${reader.numFrames()} frames, loop, dimensions, hash, posters, transcript.`);
}
