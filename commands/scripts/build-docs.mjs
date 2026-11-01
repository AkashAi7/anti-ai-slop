#!/usr/bin/env node
// Regenerates the command tables inside COMMANDS.md from commands.json and the prompt files.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, loadPrompts } from './build-studio-data.mjs';

export const COMMANDS_DOC = join(ROOT, 'COMMANDS.md');
export const BEGIN = '<!-- BEGIN GENERATED: commands.json - run npm run build:docs -->';
export const END = '<!-- END GENERATED -->';

const cell = (value) => String(value ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');

export function renderCommandsBlock() {
  const registry = JSON.parse(readFileSync(join(ROOT, 'commands.json'), 'utf8'));
  const prompts = loadPrompts();
  const out = [BEGIN, ''];

  out.push('## Custom commands in this lab (prompt files)', '');
  out.push(`These ${registry.custom.length} commands live in [.github/prompts](.github/prompts). Type \`/\` in the VS Code Chat view (Session Target: Local) to run them.`, '');
  out.push('| Command | Mechanism | Access | Slop it fixes | Evidence it must return |');
  out.push('|---|---|---|---|---|');
  for (const entry of registry.custom) {
    out.push(`| [\`/${entry.name}\`](${entry.file}) | ${cell(entry.mechanism)} | ${cell(entry.access)} | ${cell(entry.slop)} | ${cell(entry.evidence)} |`);
  }
  out.push('');
  out.push('Argument hints (what to type after the command):', '');
  for (const entry of registry.custom) {
    out.push(`- \`/${entry.name} ${prompts[entry.name].argumentHint}\``);
  }
  out.push('');

  out.push('## Built-in VS Code chat commands, by mechanism', '');
  for (const mechanism of registry.mechanisms) {
    const rows = registry.builtIns.filter((entry) => entry.mechanism === mechanism.id);
    const custom = registry.custom.filter((entry) => entry.mechanism === mechanism.id).map((entry) => `\`/${entry.name}\``);
    out.push(`### ${mechanism.title}: ${mechanism.tagline}`, '');
    out.push(`Slop smell: ${mechanism.smell}`, '');
    if (custom.length) out.push(`Lab commands: ${custom.join(', ')}`, '');
    if (!rows.length) continue;
    out.push('| Command | What it does | Why it reduces slop | Example | Availability |');
    out.push('|---|---|---|---|---|');
    for (const entry of rows) {
      const aliases = entry.aliases && entry.aliases.length ? ` (alias ${entry.aliases.map((a) => `\`/${a}\``).join(', ')})` : '';
      const caution = entry.caution ? ' **Caution:** removes a human checkpoint.' : '';
      out.push(`| [\`/${entry.name}\`](${entry.doc})${aliases} | ${cell(entry.purpose)} | ${cell(entry.antiSlop)}${caution} | \`${cell(entry.usage)}\` | ${cell(entry.availability)} |`);
    }
    out.push('');
  }

  out.push('## GitHub Copilot app (mention only)', '');
  out.push(`${registry.copilotApp.note} See the [Copilot app slash command reference](${registry.copilotApp.doc}).`, '');
  out.push('| Command | What it does |');
  out.push('|---|---|');
  for (const entry of registry.copilotApp.commands) out.push(`| \`/${entry.name}\` | ${cell(entry.purpose)} |`);
  out.push('');
  out.push(`Registry as of ${registry.asOf}; VS Code docs dated ${registry.docsDated}.`, '', END);
  return out.join('\n');
}

export function applyBlock(text, block = renderCommandsBlock()) {
  const start = text.indexOf(BEGIN);
  const end = text.indexOf(END);
  if (start < 0 || end < start) throw new Error('COMMANDS.md is missing the generated block markers.');
  return text.slice(0, start) + block + text.slice(end + END.length);
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const current = readFileSync(COMMANDS_DOC, 'utf8').replace(/\r\n/g, '\n');
  const next = applyBlock(current);
  if (next !== current) writeFileSync(COMMANDS_DOC, next);
  console.log(next === current ? 'COMMANDS.md is up to date.' : 'Updated COMMANDS.md.');
}
