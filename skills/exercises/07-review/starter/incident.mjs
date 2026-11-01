export function priority(value) {
  const result = value || 3;
  if (!Number.isInteger(result) || result < 0 || result > 3) throw new RangeError('Priority must be an integer from 0 to 3');
  return result;
}
