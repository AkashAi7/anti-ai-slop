const PATTERN = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/;

// Parses durations such as '1h30m' or '45s' into seconds.
export function parseDuration(text) {
  if (typeof text !== 'string') {
    throw new TypeError(`Invalid duration: expected a string, got ${text === null ? 'null' : typeof text}.`);
  }
  const trimmed = text.trim();
  const match = PATTERN.exec(trimmed);
  // Every group is optional, so an empty string matches the pattern; reject it explicitly.
  if (trimmed === '' || !match) throw new RangeError(`Invalid duration: ${JSON.stringify(text)}.`);
  const [, hours = '0', minutes = '0', seconds = '0'] = match;
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
}
