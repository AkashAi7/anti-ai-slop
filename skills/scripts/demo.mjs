import { createInterface } from 'node:readline';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { catalog, exercise, root, setup, reset, runChecks, verifyBaseline, isMain } from './lab.mjs';

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
  output.write('Skills - Anti-Slop Lab\nReal Copilot interaction happens in VS Code Chat, not this guide.\n');
  for (const item of catalog) output.write(`${item.id}  [${item.track}] ${item.title}\n`);
  try {
    while (true) {
      const answer = await ask(selected
        ? `\n${selected.id}: task | prompt | setup | baseline | check | hint | solution | reset | back | quit\n> `
        : '\nSelect exercise ID (or quit): ');
      if (answer === null || answer === 'quit') break;
      try {
        if (!selected) {
          selected = exercise(answer);
        } else if (answer === 'back') {
          selected = undefined;
        } else if (answer === 'task' || answer === 'hint') {
          output.write(readFileSync(join(root, 'exercises', selected.id, answer === 'task' ? 'TASK.md' : 'HINTS.md'), 'utf8') + '\n');
        } else if (answer === 'prompt') {
          output.write(`Paste into a NEW Copilot chat with this lab open:\n${selected.prompt}\n`);
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
