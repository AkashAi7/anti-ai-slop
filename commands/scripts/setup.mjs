import { setup } from './lab.mjs';

try {
  if (process.argv.length !== 3) throw new Error('Usage: npm run setup -- <exercise-id>');
  console.log(`Created ${setup(process.argv[2])}`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
