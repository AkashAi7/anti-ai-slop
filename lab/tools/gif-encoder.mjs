import gifenc from 'gifenc';

const { GIFEncoder, quantize, applyPalette } = gifenc;

export function encodeGif(frames, width, height) {
  if (!frames.length || frames.some((frame) => frame.rgba.length !== width * height * 4 || frame.delay < 10)) {
    throw new Error('GIF frames must have full RGBA pixels and a positive centisecond delay.');
  }
  // gifenc reads the backing buffer, so pooled Buffer views must be normalized.
  const pixels = frames.map((frame) => frame.rgba.byteOffset === 0
    && frame.rgba.byteLength === frame.rgba.buffer.byteLength ? frame.rgba : Uint8Array.from(frame.rgba));
  const samples = pixels.filter((_, index) => index % 2 === 1 || frames.length < 4);
  const palette = quantize(Uint8Array.from(Buffer.concat(samples)), 255, { format: 'rgb565' });
  while (palette.length < 255) palette.push([0, 0, 0]);
  const encoder = GIFEncoder();
  let previous;
  for (const [index, frame] of frames.entries()) {
    const indexed = applyPalette(pixels[index], palette, 'rgb565');
    if (!previous) {
      encoder.writeFrame(indexed, width, height, { palette: [...palette, [0, 0, 0]], delay: frame.delay, repeat: 0, dispose: 1 });
    } else {
      const delta = indexed.map((pixel, index) => (pixel === previous[index] ? 255 : pixel));
      encoder.writeFrame(delta, width, height, { delay: frame.delay, transparent: true, transparentIndex: 255, dispose: 1 });
    }
    previous = indexed;
  }
  encoder.finish();
  return Buffer.from(encoder.bytes());
}
