import { spawnSync } from 'node:child_process';
import { track, specifyVersion } from './lab.mjs';
import { engineeringSkillNames, publicSkillNames, skillFileCount, verifyEngineeringSkills, verifyPublicSkills } from './public-skills.mjs';

try {
  const id = process.argv[2] ?? 'builtins';
  const item = track(id);
  const [major, minor] = process.versions.node.split('.').map(Number);
  if (major < 22 || (major === 22 && minor < 20)) throw new Error('Node.js 22.20+ is required.');
  console.log(`OK Node.js ${process.versions.node}`);
  const tools = item.id === 'spec-kit' ? ['git', 'uv'] : ['git'];
  for (const name of tools) {
    const result = spawnSync(name, ['--version'], { encoding: 'utf8', timeout: 10000 });
    if (result.error || result.status !== 0) throw new Error(`Install ${name} and reopen your terminal. ${result.error?.message ?? result.stderr}`);
    console.log(`OK ${result.stdout.trim()}`);
  }
  if (item.id === 'spec-kit') console.log(`Spec Kit setup will use isolated specify-cli==${specifyVersion}; it does not upgrade your global CLI.`);
  if (id === 'skills') {
    verifyPublicSkills();
    verifyEngineeringSkills();
    console.log(`OK bundled skills: ${publicSkillNames.length} pinned upstream skills (${skillFileCount} files) and ${engineeringSkillNames.length} lab-authored engineering skills; setup needs no network.`);
  }
  console.log('MANUAL CHECK: open this workspace in signed-in VS Code Local chat, or a Copilot app local session. Type / to confirm available commands.');
  console.log('Copilot entitlement, organization policy and sign-in cannot be verified by this script.');
} catch (error) {
  console.error(`Environment check failed: ${error.message}`);
  process.exitCode = 1;
}
