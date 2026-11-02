import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { ROOT, command, runChecks, seed, specifyVersion, track, validateSpecKit, verifyBaseline, workspace } from './lab.mjs';
import { publicSkillNames, skillSources } from './public-skills.mjs';

try {
  const [id, ...args] = process.argv.slice(2);
  if (args.length) throw new Error('Usage: npm run setup -- builtins|spec-kit|spec-kit-skills|skills');
  const item = track(id);
  const destination = workspace(id);
  if (existsSync(destination)) throw new Error(`Workspace already exists: ${destination}. Nothing overwritten. Keep or rename your learner folder before starting a new attempt.`);
  command('git', ['--version'], ROOT);
  mkdirSync(dirname(destination), { recursive: true });
  if (item.id === 'spec-kit') {
    const skills = id === 'spec-kit-skills';
    command('uv', [
      'tool', 'run', '--from', `specify-cli==${specifyVersion}`, 'specify', 'init', destination,
      '--integration', 'copilot',
      `--integration-options=${skills ? '--skills' : '--commands'} --events false`,
      '--script', process.platform === 'win32' ? 'ps' : 'sh',
      '--non-interactive', '--ignore-agent-tools',
    ], ROOT);
    const count = validateSpecKit(destination, skills);
    console.log(`Verified ${count} required core Spec Kit ${skills ? 'skills (/speckit-*)' : 'prompt commands (/speckit.*)'}.`);
    seed(id, destination, 'starter', true);
    if (skills) {
      const path = join(destination, 'package.json');
      const pkg = JSON.parse(readFileSync(path, 'utf8'));
      pkg.scripts.check = 'node ../../scripts/check.mjs spec-kit-skills';
      writeFileSync(path, `${JSON.stringify(pkg, null, 2)}\n`);
    }
  } else {
    seed(id, destination);
  }
  if (id === 'skills') console.log(`Installed ${publicSkillNames.length} pinned upstream skills from ${skillSources.length} public repositories in .github/skills. No plugin hooks, global installs or upstream scripts executed.`);
  writeFileSync(join(destination, '.gitignore'), 'node_modules/\n*.log\n');
  command('git', ['init', '--quiet', '--initial-branch=lab'], destination);
  command('git', ['-c', 'core.autocrlf=false', 'add', '--', '.'], destination);
  command('git', [
    '-c', 'user.name=Anti-Slop Lab', '-c', 'user.email=lab@example.invalid',
    '-c', 'commit.gpgsign=false', 'commit', '--quiet', '-m',
    'chore(lab): save the defective starter\n\nCo-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>',
  ], destination);
  const result = runChecks(id);
  verifyBaseline(id, result);
  console.log(`READY: ${destination}`);
  console.log(`Baseline: ${result.passed}/${item.testCount} pass, ${result.failed} expected failures. Not solved.`);
  console.log('A baseline commit exists only in this new disposable lab repository; your source repository was not staged or committed.');
  console.log(`Open this exact folder in VS Code: code -n "${destination}"`);
  if (id !== 'spec-kit') {
    console.log('Or add this exact repository in the Copilot app and start a local Interactive session.');
  } else {
    console.log('For the Copilot app, set up spec-kit-skills instead; dotted prompt commands are the VS Code Local layout.');
  }
  console.log('Open BRIEF.md, type / in chat, and follow the workshop guide. No live Copilot call was made by setup.');
} catch (error) {
  console.error(`Setup failed: ${error.message}`);
  console.error('No existing learner folder is overwritten. If initialization left a partial new folder, inspect and rename that folder before retrying.');
  process.exitCode = 1;
}
