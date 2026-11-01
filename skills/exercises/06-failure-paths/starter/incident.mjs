export function parseIncidents(text) {
  try {
    return JSON.parse(text);
  } catch {
    return [];
  }
}
