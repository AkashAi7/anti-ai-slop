import { createInterface } from 'node:readline';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { catalog, exercise, root, setup, reset, runChecks, verifyBaseline, isMain } from './lab.mjs';

export function describeCommands(item, registry = JSON.parse(readFileSync(join(root, 'commands.json'), 'utf8'))) {
  const width = Math.max(...item.commands.map((name) => name.length)) + 2;
  return item.commands.map((name) => {
    const custom = registry.custom.find((entry) => entry.name === name);
    if (custom) return `/${name.padEnd(width)}custom    ${custom.file} (${custom.access})`;
    const builtIn = registry.builtIns.find((entry) => entry.name === name || entry.aliases?.includes(name));
    if (builtIn) return `/${name.padEnd(width)}built-in  ${builtIn.purpose}`;
    throw new Error(`Command /${name} is not in commands.json.`);
  }).join('\n');
}

export async function runDemo(input = process.stdin, output = process.stdout) {
  const rl = createInterface({ input, crlfDelay: Infinity });
  const lines = rl[Symbol.asyncIterator]();
  const ask = async (prompt) => {
    output.write(prompt);
    const next = await lines.next();
    return next.done ? null : next.value.trim();
  };
  let selected;
  let hadError = false;
  output.write('Commands - Anti-Slop Lab\nReal Copilot interaction happens in VS Code Chat (Local harness), not this guide.\n');
  output.write('Watch the illustrative walkthroughs with: npm run studio\n');
  for (const item of catalog) output.write(`${item.id}  [${item.track}] ${item.title}\n`);
  try {
    while (true) {
      const answer = await ask(selected
        ? `\n${selected.id}: task | commands | prompt | setup | baseline | check | hint | solution | reset | back | quit\n> `
        : '\nSelect exercise ID (or quit): ');
      if (answer === null || answer === 'quit') break;
      try {
        if (!selected) {
          selected = exercise(answer);
        } else if (answer === 'back') {
          selected = undefined;
        } else if (answer === 'task' || answer === 'hint') {
          output.write(readFileSync(join(root, 'exercises', selected.id, answer === 'task' ? 'TASK.md' : 'HINTS.md'), 'utf8') + '\n');
        } else if (answer === 'commands') {
          output.write(`Command flow for ${selected.id} (type each in VS Code Chat with Local selected):\n${describeCommands(selected)}\n`);
        } else if (answer === 'prompt') {
          output.write(`Start a NEW Local chat with this lab folder open, then type:\n${selected.prompt}\n`);
        } else if (answer === 'setup') {
          output.write(`Created ${setup(selected.id)}\n`);
        } else if (answer === 'reset') {
          const confirmation = await ask(`Erase ONLY work/${selected.id}? Type "reset ${selected.id}" or anything else to cancel: `);
          if (confirmation !== `reset ${selected.id}`) output.write('Reset cancelled. Files unchanged.\n');
          else output.write(`Recreated ${reset(selected.id, confirmation)}\n`);
        } else if (answer === 'baseline' || answer === 'check') {
          const result = runChecks(selected.id, answer === 'baseline' ? 'starter' : 'work');
          output.write(result.output);
          if (answer === 'baseline') {
            verifyBaseline(selected.id, result);
            output.write('Expected defective baseline confirmed; not a passing implementation.\n');
          } else if (result.status !== 0) {
            hadError = true;
            output.write('Learner checks failed. Fix the behavior, not the acceptance checks.\n');
          }
        } else if (answer === 'solution') {
          const consent = await ask('Reveal reference solution location? Type "reveal": ');
          output.write(consent === 'reveal'
            ? `Open exercises/${selected.id}/solution. Compare without overwriting learner work.\n`
            : 'Solution reveal cancelled.\n');
        } else {
          output.write('Unknown action. Choose a listed action.\n');
        }
      } catch (error) {
        hadError = true;
        output.write(`ERROR: ${error.message}\n`);
      }
    }
  } finally {
    rl.close();
  }
  output.write('Guide closed. No Copilot/model response was simulated.\n');
  return hadError ? 1 : 0;
}

if (isMain(import.meta.url)) {
  try { process.exitCode = await runDemo(); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
