import { runChecks, track, verifyBaseline } from './lab.mjs';

try {
  const [id, ...args] = process.argv.slice(2);
  if (args.some((arg) => arg !== '--baseline')) throw new Error('Usage: npm run check -- <track> [--baseline]');
  const item = track(id);
  const result = runChecks(id);
  process.stdout.write(result.output);
  if (args.includes('--baseline')) {
    verifyBaseline(id, result);
    console.log(`BASELINE CONFIRMED: ${result.passed}/${item.testCount} pass; ${result.failed} expected failures. Not solved.`);
  } else {
    console.log(`${result.status === 0 ? 'VERIFIED' : 'NOT VERIFIED'}: ${result.passed}/${item.testCount} acceptance checks. Exit ${result.status}.`);
    process.exitCode = result.status;
  }
} catch (error) {
  console.error(`Check failed: ${error.message}`);
  process.exitCode = 1;
}
