export function formatCreatedAt(event) {
  return new Date(event.createdAtSeconds ?? 0).toISOString();
}
