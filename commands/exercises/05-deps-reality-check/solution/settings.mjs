import { readFileSync } from 'node:fs';

export function loadSettings(file = new URL('./settings.json', import.meta.url)) {
  const raw = JSON.parse(readFileSync(file, 'utf8'));
  if (!Number.isInteger(raw.port) || raw.port < 1 || raw.port > 65535) {
    throw new Error(`Invalid port ${JSON.stringify(raw.port)}: expected an integer from 1 to 65535.`);
  }
  return { name: raw.name, port: raw.port, debug: raw.debug ?? false };
}

export function label(settings) {
  return `${settings.name}:${settings.port}`.padStart(16);
}
