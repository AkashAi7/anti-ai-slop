import { runChecks, verifyBaseline } from './lab.mjs';

try {
  const [id, flag] = process.argv.slice(2);
  if (process.argv.length > 4 || (flag && !['--baseline', '--solution'].includes(flag))) {
    throw new Error('Usage: npm run check -- <exercise-id> [--baseline|--solution]');
  }
  const result = runChecks(id, flag === '--baseline' ? 'starter' : flag === '--solution' ? 'solution' : 'work');
  process.stdout.write(result.output);
  if (flag === '--baseline') {
    verifyBaseline(id, result);
    console.log('Expected defective baseline confirmed. This is NOT a passing implementation.');
  } else {
    process.exitCode = result.status;
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
