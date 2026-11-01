import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
import { root } from '../scripts/lab.mjs';

function load() {
  const context = vm.createContext({});
  for (const file of ['data.js', 'core.js']) {
    vm.runInContext(readFileSync(join(root, 'studio', 'assets', file), 'utf8'), context, { filename: file });
  }
  return { Core: context.StudioCore, DATA: context.STUDIO_DATA };
}

const { Core, DATA } = load();
// Objects created inside the vm context have a different Object.prototype, so compare plain copies.
const plain = (value) => JSON.parse(JSON.stringify(value));
const commands = Core.allCommands(DATA);

test('every registry command is in the studio with the right kind', () => {
  assert.equal(commands.length, DATA.registry.custom.length + DATA.registry.builtIns.length);
  const custom = commands.filter((command) => command.kind === 'custom');
  assert.equal(custom.length, 12);
  for (const command of custom) {
    assert.ok(command.body.startsWith(`# /${command.name}`), `${command.name} body comes from its prompt file`);
    assert.ok(command.tools.length > 0);
    assert.ok(DATA.samples[command.name], `${command.name} has a sample answer`);
    assert.match(command.availability, /not built in/, `${command.name} must not look like a built-in`);
  }
  assert.equal(DATA.registry.labCommands.headline, 'Lab commands are not built in.');
});

test('palette filtering ranks exact, prefix, alias, then text matches', () => {
  assert.equal(Core.filterCommands(commands, '/verify')[0].name, 'verify');
  assert.equal(Core.filterCommands(commands, 'ver')[0].name, 'verify');
  assert.equal(Core.filterCommands(commands, 'yolo')[0].name, 'autoApprove');
  assert.ok(Core.filterCommands(commands, 'cre').every((command) => /cre/i.test(JSON.stringify(command))), 'every match mentions the query');
  assert.equal(Core.filterCommands(commands, '').length, commands.length);
  assert.equal(Core.filterCommands(commands, 'zzzz-nothing').length, 0);
  assert.ok(Core.filterCommands(commands, 'hallucinated').length > 0, 'purpose and slop text are searchable');
});

test('input parsing separates text, partial, and command input', () => {
  assert.deepEqual(plain(Core.parseInput('  ')), { kind: 'empty' });
  assert.equal(Core.parseInput('fix the bug').kind, 'text');
  assert.equal(Core.parseInput('/').kind, 'partial');
  assert.deepEqual(plain(Core.parseInput('/verify all tests pass')), { kind: 'command', name: 'verify', args: 'all tests pass' });
  assert.deepEqual(plain(Core.parseInput('/root-cause')), { kind: 'command', name: 'root-cause', args: '' });
});

test('commands resolve case-insensitively and through aliases', () => {
  assert.equal(Core.resolveCommand(commands, 'VERIFY').name, 'verify');
  assert.equal(Core.resolveCommand(commands, 'yolo').name, 'autoApprove');
  assert.equal(Core.resolveCommand(commands, 'disableYolo').name, 'disableAutoApprove');
  assert.equal(Core.resolveCommand(commands, 'nope'), null);
});

test('missions score only the intended answer and summarize progress', () => {
  for (const mission of DATA.missions) {
    assert.equal(Core.scoreMission(mission, mission.answer).correct, true);
    const wrong = mission.choices.find((choice) => choice !== mission.answer);
    assert.equal(Core.scoreMission(mission, wrong).correct, false);
    assert.ok(Core.resolveCommand(commands, mission.answer), `${mission.id} answer exists`);
  }
  assert.deepEqual(plain(Core.missionSummary([null, { correct: true }, { correct: false }])), { answered: 2, correct: 1, total: 3 });
});

test('scene steps animate prompt, then response, then terminal', () => {
  const scene = DATA.scenes[0];
  const start = Core.stepState(scene, 0, 0);
  assert.equal(start.prompt, '');
  assert.equal(start.response, '');
  assert.equal(start.terminal, '');
  const typing = Core.stepState(scene, 0, Core.PROMPT_END / 2);
  assert.ok(typing.prompt.length > 0 && typing.prompt.length < scene.steps[0].prompt.length);
  assert.equal(typing.response, '');
  const responding = Core.stepState(scene, 0, Core.RESPONSE_END);
  assert.equal(responding.prompt, scene.steps[0].prompt);
  assert.equal(responding.response, scene.steps[0].response);
  assert.equal(responding.terminal, '');
  const done = Core.stepState(scene, 0, 1);
  assert.equal(done.terminal, scene.steps[0].terminal);
  assert.equal(done.complete, true);
  assert.throws(() => Core.stepState(scene, 99, 1), /out of range/);
  assert.throws(() => Core.stepState(null, 0, 1), /Unknown scene/);
  assert.equal(Core.clamp(Number.NaN), 0);
});

test('every scene ends with the real passing count of its exercise', () => {
  for (const scene of DATA.scenes) {
    const item = DATA.catalog.find(({ id }) => id === scene.exercise);
    assert.ok(scene.steps.at(-1).terminal.includes(`# pass ${item.testCount}`), scene.id);
    assert.ok(scene.steps.some((step) => Core.splitCommand(step.prompt).command), `${scene.id} runs a command`);
  }
});

test('command highlighting and diff line kinds', () => {
  assert.deepEqual(plain(Core.splitCommand('/scope fix qty')), { command: '/scope', rest: ' fix qty' });
  assert.deepEqual(plain(Core.splitCommand('plain text')), { command: '', rest: 'plain text' });
  assert.equal(Core.codeLineKind('+ added'), 'add');
  assert.equal(Core.codeLineKind('- removed'), 'del');
  assert.equal(Core.codeLineKind('  context'), 'ctx');
  assert.equal(Core.codeLineKind('-1 is a number'), 'ctx');
});
