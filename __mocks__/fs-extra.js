/* eslint-disable */
const path = require('path');
const fse = jest.genMockFromModule('fs-extra');

let mockFiles = [];
function __setMockFiles(newMockFiles) {
  mockFiles = [];
  for (const index in newMockFiles) {
    mockFiles.push(path.basename(newMockFiles[index]));
  }
}

function readdirSync(directoryPath) {
  return mockFiles;
}

function statSync(file) {
  return {
    isFile: () => true
  }
}

function existsSync(file) {
  if (file.includes('espack.config.js')) return false;
  return true;
}

function readFileSync(filename) {
  if (filename.includes('.babelrc')) {
    return `{
      "presets": [
        ["@babel/preset-env", {
          "targets": {
            "node": "current",
            "browsers": [
              ">1%",
              "last 4 versions",
              "Firefox ESR",
              "ie >= 8"
            ]
          },
          "modules": false
        }],
        "./lib/babel/preset-stage"
      ],
      "plugins": [
        ["@babel/plugin-transform-runtime", {
          "helpers": false,
          "regenerator": true
        }]
      ],
      "env": {
        "test": {
          "presets": ["@babel/preset-env", "./lib/babel/preset-stage"],
          "plugins": ["@babel/plugin-transform-runtime", "array-includes"]
        }
      }
    }`;
  }
  return '';
}

fse.__setMockFiles = __setMockFiles;
fse.readdirSync = readdirSync;
fse.statSync = statSync;
fse.existsSync = existsSync;
fse.readFileSync = readFileSync;
fse.copySync = jest.fn();
fse.removeSync = jest.fn();
fse.ensureDirSync = jest.fn();
fse.writeFileSync = jest.fn();

module.exports = fse;