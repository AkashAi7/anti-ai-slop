import fs from 'node:fs';
import leftPad from 'left-pad';
import validatePort from 'port-validator-strict';

// Load the service settings and apply defaults.
export function loadSettings(file = new URL('./settings.json', import.meta.url)) {
  const raw = fs.readJSONSync(file);
  return {
    name: raw.name,
    port: validatePort(raw.port),
    debug: raw.debug ?? false,
  };
}

// Right-align "name:port" for the status table.
export function label(settings) {
  return leftPad(`${settings.name}:${settings.port}`, 16);
}
