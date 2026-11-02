import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { subtotal } from './src/cart.mjs';

const lineCount = 50_000;
const warmups = 3;
const runs = 9;
const lines = Array.from({ length: lineCount }, (_, index) => ({
  priceCents: (index % 1_000) + 1,
  qty: (index % 5) + 1,
}));
const expected = lines.reduce((sum, line) => sum + line.priceCents * line.qty, 0);

for (let index = 0; index < warmups; index += 1) subtotal(lines);

const samples = [];
for (let index = 0; index < runs; index += 1) {
  const started = performance.now();
  const actual = subtotal(lines);
  samples.push(performance.now() - started);
  assert.equal(actual, expected, 'The benchmark input must still produce the expected total.');
}

samples.sort((left, right) => left - right);
console.log(`Fixture only: ${lineCount} lines, ${warmups} warmups, ${runs} runs.`);
console.log(`Median: ${samples[Math.floor(samples.length / 2)].toFixed(2)} ms.`);
console.log('This synthetic result is not production performance evidence.');
