import { join } from 'node:path';
import { workspace } from './lab.mjs';
import { publicSkillNames, upstreamCommit, verifyPublicSkills } from './public-skills.mjs';

try {
  const count = verifyPublicSkills(join(workspace('superpowers'), '.github'));
  console.log(`VERIFIED: ${publicSkillNames.length} upstream skills, ${count} files, commit ${upstreamCommit}.`);
  for (const name of publicSkillNames) console.log(`/${name} -> .github/skills/${name}/SKILL.md`);
  console.log('FILES ONLY: confirm these exact paths in the live client skill picker/tool activity. No model invocation was tested.');
} catch (error) {
  console.error(`Skill verification failed: ${error.message}`);
  process.exitCode = 1;
}
