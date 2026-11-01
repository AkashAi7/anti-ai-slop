import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import omggif from 'omggif';
import { PNG } from 'pngjs';
import { ROOT, catalog } from '../scripts/lab.mjs';
import { LABS, labFor, sourceFingerprint } from './media.mjs';

const manifest = JSON.parse(readFileSync(join(ROOT, 'assets', 'media-manifest.json'), 'utf8'));
const scenes = JSON.parse(readFileSync(join(ROOT, 'walkthroughs.json'), 'utf8'));
assert.equal(manifest.width, 1280);
assert.equal(manifest.height, 720);
assert.match(manifest.disclaimer, /not a recorded Copilot session/);
assert.equal(manifest.sourceSha256, sourceFingerprint(), 'Walkthrough sources changed; run npm run gifs in lab/tools.');
assert.deepEqual(manifest.assets.map(({ id }) => id), scenes.map(({ id }) => id));
for (const asset of manifest.assets) {
  const scene = scenes.find(({ id }) => id === asset.id);
  const bytes = readFileSync(join(ROOT, 'assets', 'gifs', `${asset.id}.gif`));
  assert.equal(bytes.length, asset.bytes);
  assert.ok(bytes.length <= manifest.maxBytes);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256);
  const gif = new omggif.GifReader(bytes);
  assert.equal(gif.width, 1280);
  assert.equal(gif.height, 720);
  assert.equal(gif.loopCount(), 0);
  assert.equal(gif.numFrames(), asset.frames);
  assert.equal(asset.frames, scene.steps.length * 3);
  const frame = Buffer.alloc(1280 * 720 * 4);
  const hashes = new Set();
  const posters = Object.fromEntries(['before', 'after'].map((suffix) =>
    [suffix, PNG.sync.read(readFileSync(join(ROOT, 'assets', 'posters', `${asset.id}-${suffix}.png`)))]));
  let duration = 0;
  for (let index = 0; index < gif.numFrames(); index++) {
    assert.ok(gif.frameInfo(index).delay > 0);
    duration += gif.frameInfo(index).delay * 10;
    gif.decodeAndBlitFrameRGBA(index, frame);
    hashes.add(createHash('sha256').update(frame).digest('hex'));
    const poster = index === 2 ? posters.before : index === gif.numFrames() - 1 ? posters.after : null;
    if (poster) {
      let error = 0;
      let largeErrors = 0;
      for (let pixel = 0; pixel < frame.length; pixel += 4) {
        let largest = 0;
        for (let channel = 0; channel < 3; channel++) {
          const difference = Math.abs(frame[pixel + channel] - poster.data[pixel + channel]);
          error += difference;
          largest = Math.max(largest, difference);
        }
        if (largest > 32) largeErrors += 1;
      }
      const pixels = 1280 * 720;
      assert.ok(error / (pixels * 3) <= 6, `${asset.id}: GIF differs visibly from its poster.`);
      assert.ok(largeErrors / pixels <= 0.01, `${asset.id}: too many pixels differ from its poster.`);
    }
  }
  assert.equal(duration, asset.durationMs);
  assert.ok(hashes.size >= scene.steps.length, `${asset.id} does not animate through its steps.`);
  for (const suffix of ['before', 'after']) {
    const poster = posters[suffix];
    assert.equal(poster.width, 1280);
    assert.equal(poster.height, 720);
  }
  const transcript = readFileSync(join(ROOT, 'assets', 'transcripts', `${asset.id}.md`), 'utf8');
  assert.ok(transcript.includes(manifest.disclaimer));
  for (const name of scene.commands) assert.ok(transcript.includes(`/${name}`), `${asset.id} is missing /${name}.`);
  assert.ok(transcript.includes(`](../../${LABS[labFor(scene)].guide})`), `${asset.id} does not link to its lab guide.`);
  const track = catalog.tracks.find(({ id }) => id === scene.track);
  assert.equal(asset.baseline.passed, track.testCount - track.expectedFailures.length);
  assert.equal(asset.final.passed, track.testCount);
  assert.equal(asset.final.status, 0);
  assert.ok(asset.red.failed > 0 && asset.red.passed > 0);
  console.log(`Verified ${asset.id}: ${gif.numFrames()} frames, ${hashes.size} distinct, ${duration / 1000}s, loop, checksum, posters and transcript.`);
}
