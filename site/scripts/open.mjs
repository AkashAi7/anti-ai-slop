import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { SITE } from './lib/util.mjs';

export function siteUrl() {
  const file = join(SITE, 'index.html');
  if (!existsSync(file)) throw new Error('Missing site/index.html. Run npm run build first.');
  return pathToFileURL(file).href;
}

export function openerFor(url, platform = process.platform) {
  if (!/^file:\/\/\//.test(url)) throw new Error('Refusing to open a non-file URL.');
  if (platform === 'win32') {
    return { command: 'cmd.exe', args: ['/d', '/s', '/c', `"start "" "${url}""`], verbatim: true };
  }
  return { command: platform === 'darwin' ? 'open' : 'xdg-open', args: [url], verbatim: false };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.some((arg) => arg !== '--print')) throw new Error('Usage: npm run open [-- --print]');
    const url = siteUrl();
    console.log(`Anti-Slop Labs site (offline): ${url}`);
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
