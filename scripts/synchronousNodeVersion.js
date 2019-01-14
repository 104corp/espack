const fse = require('fs-extra');
const path = require('path');
const packageJSON = require('../package.json');

const readmePath = path.join(__dirname, '../README.md');
const nodeBadge = `![Node version](https://img.shields.io/badge/node-${encodeURIComponent(packageJSON.engines.node)}-brightgreen.svg)`;

let readme = fse.readFileSync(readmePath, { encoding: 'utf-8' });
readme = readme.replace(
  /!\[Node version\]\(\S*\.svg\)/ig,
  nodeBadge,
);
fse.writeFileSync(readmePath, readme);
