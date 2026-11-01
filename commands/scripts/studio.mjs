import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { root, isMain } from './lab.mjs';

export function studioUrl(base = root) {
  const file = join(base, 'studio', 'index.html');
  if (!existsSync(file)) throw new Error('Missing studio/index.html.');
  return pathToFileURL(file).href;
}

export function openerFor(url, platform = process.platform) {
  if (!/^file:\/\/\//.test(url)) throw new Error('Refusing to open a non-file URL.');
  if (platform === 'win32') {
    return { command: 'cmd.exe', args: ['/d', '/s', '/c', `"start "" "${url}""`], verbatim: true };
  }
  return { command: platform === 'darwin' ? 'open' : 'xdg-open', args: [url], verbatim: false };
}

if (isMain(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.some((arg) => arg !== '--print')) throw new Error('Usage: npm run studio [-- --print]');
    const url = studioUrl();
    console.log(`Command Studio (offline, illustrative): ${url}`);
    if (!args.includes('--print')) {
      const { command, args: openArgs, verbatim } = openerFor(url);
      const child = spawn(command, openArgs, { detached: true, stdio: 'ignore', windowsVerbatimArguments: verbatim });
      child.on('error', () => console.log('Could not open a browser automatically. Paste the URL above into a browser.'));
      child.unref();
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
