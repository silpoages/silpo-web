import { readFileSync } from 'node:fs';

const { total } = JSON.parse(readFileSync('coverage/coverage-summary.json', 'utf8'));

console.log('## Web test coverage\n');
console.log('| Metric | Covered | Total | Coverage |');
console.log('| --- | ---: | ---: | ---: |');
for (const name of ['lines', 'statements', 'functions', 'branches']) {
  const metric = total[name];
  const percentage = metric.total === 0 ? 'N/A' : `${metric.pct.toFixed(2)}%`;
  console.log(`| ${name} | ${metric.covered} | ${metric.total} | ${percentage} |`);
}
console.log('\nScope: application TypeScript in src/, including untested files.');
console.log('Coverage describes exercised code, not the test pass rate.');
console.log('If tests failed, these figures are partial; check the Test job result.');
