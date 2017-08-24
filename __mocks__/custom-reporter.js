const fse = require('fs-extra');
const path = require('path');
const packageJSON = require('../package.json');

// '>=6.9' -> '>= 6.9'
// function nodeVersionFormat(nodeVersion) {
//   const splitPoint = nodeVersion.search(/\d/);
//   const version = nodeVersion.substr(splitPoint);
//   return nodeVersion.replace(/ /g, '').replace(version, ` ${version}`);
// }


module.exports = (report) => {
  if (!report.coverageMap) return report;

  // const coverageSummary = report.coverageMap.getCoverageSummary();
  // const statementsCoverage = Math.floor(coverageSummary.statements.pct);
  const readmePath = path.join(__dirname, '../README.md');
  // const colors = {
  //   0: 'red',
  //   1: 'red',
  //   2: 'red',
  //   3: 'red',
  //   4: 'red',
  //   5: 'orange',
  //   6: 'yellow',
  //   7: 'yellowgreen',
  //   8: 'green',
  //   9: 'brightgreen',
  //   10: 'brightgreen',
  // };
  // const coverageColor = colors[Math.floor(statementsCoverage / 10)];
  // const coverageBadge = `![Coverage Status](https://img.shields.io/badge/coverage-${statementsCoverage}%25-${coverageColor}.svg)`;
  // const testsBadge = `![Tests Status](https://img.shields.io/badge/tests-${report.numPassedTests}%20passed,%20${report.numFailedTests}%20failed,%20${report.numPendingTests}%20skipped-orange.svg)`;
  const nodeBadge = `![Node version](https://img.shields.io/badge/node-${encodeURIComponent(packageJSON.engines.node)}-brightgreen.svg)`;

  let readme = fse.readFileSync(readmePath, { encoding: 'utf-8' });

  readme = readme
    .replace(/!\[Node version\]\(\S*\.svg\)/ig, nodeBadge);
  // .replace(/!\[Coverage Status\]\(\S*\.svg\)/ig, coverageBadge)
  // .replace(/!\[Tests Status\]\(\S*\.svg\)/ig, testsBadge)
  // .replace(/\* node.*\n/i, `* node ${nodeVersionFormat(packageJSON.engines.node)}\n`);

  fse.writeFileSync(readmePath, readme);

  return report;
};
