const UNIT_SECONDS = { h: 3600, m: 60, s: 1 };

// Parses durations such as '1h30m' or '45s' into seconds.
export function parseDuration(text) {
  let seconds = 0;
  for (const [, amount, unit] of String(text).matchAll(/(\d+)([hms])/g)) {
    seconds += Number(amount) * UNIT_SECONDS[unit];
  }
  return seconds;
}
