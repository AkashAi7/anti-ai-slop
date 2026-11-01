import assert from 'node:assert/strict';
import { test } from 'node:test';
import omggif from 'omggif';
import { encodeGif } from './gif-encoder.mjs';

test('shared encoder preserves dimensions, animation, looping and delays', () => {
  const pixels = (color) => Buffer.from(Array.from({ length: 4 }, () => [...color, 255]).flat());
  const bytes = encodeGif([
    { rgba: pixels([255, 0, 0]), delay: 200 },
    { rgba: pixels([0, 0, 255]), delay: 400 },
  ], 2, 2);
  const reader = new omggif.GifReader(bytes);
  assert.equal(reader.width, 2);
  assert.equal(reader.height, 2);
  assert.equal(reader.numFrames(), 2);
  assert.equal(reader.loopCount(), 0);
  assert.equal(reader.frameInfo(0).delay, 20);
  assert.equal(reader.frameInfo(1).delay, 40);
  const frame = Buffer.alloc(16);
  reader.decodeAndBlitFrameRGBA(0, frame);
  const first = Buffer.from(frame);
  for (let pixel = 0; pixel < frame.length; pixel += 4) {
    assert.ok(frame[pixel] >= 240 && frame[pixel + 1] <= 8 && frame[pixel + 2] <= 8);
    assert.equal(frame[pixel + 3], 255);
  }
  reader.decodeAndBlitFrameRGBA(1, frame);
  assert.notDeepEqual(frame, first);
  for (let pixel = 0; pixel < frame.length; pixel += 4) {
    assert.ok(frame[pixel] <= 8 && frame[pixel + 1] <= 8 && frame[pixel + 2] >= 240);
    assert.equal(frame[pixel + 3], 255);
  }
});

test('shared encoder rejects empty and incomplete frames', () => {
  assert.throws(() => encodeGif([], 2, 2), /full RGBA/);
  assert.throws(() => encodeGif([{ rgba: Buffer.alloc(1), delay: 200 }], 2, 2), /full RGBA/);
});
