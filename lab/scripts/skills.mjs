import { join } from 'node:path';
import { workspace } from './lab.mjs';
import { publicSkillNames, skillSources, verifyPublicSkills } from './public-skills.mjs';

try {
  const count = verifyPublicSkills(join(workspace('skills'), '.github'));
  console.log(`VERIFIED: ${publicSkillNames.length} upstream skills, ${count} files, ${skillSources.length} pinned sources.`);
  for (const source of skillSources) {
    console.log(`${source.repository} @ ${source.commit.slice(0, 7)} (${source.license})`);
    for (const name of Object.keys(source.skills)) console.log(`  /${name} -> .github/skills/${name}/SKILL.md`);
  }
  console.log('FILES ONLY: confirm these exact paths in the live client skill picker/tool activity. No model invocation was tested.');
} catch (error) {
  console.error(`Skill verification failed: ${error.message}`);
  process.exitCode = 1;
}
