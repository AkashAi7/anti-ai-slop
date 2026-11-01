export function formatCreatedAt(event) {
  if (!Number.isFinite(event?.createdAtSeconds)) throw new TypeError('createdAtSeconds must be finite');
  return new Date(event.createdAtSeconds * 1000).toISOString();
}
