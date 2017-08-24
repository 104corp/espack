/* eslint-disable */
const glob = jest.genMockFromModule('glob');

let mockFiles = [];
function __setMockFiles(newMockFiles) {
  mockFiles = [];
  for (const index in newMockFiles) {
    if (/\.js$/i.test(newMockFiles[index])) {
      mockFiles.push(newMockFiles[index]);
    }
  }
}

function sync(src, options) {
  if (src === 'src/pages/**/_*.js') return [];
  return mockFiles;
}

glob.__setMockFiles = __setMockFiles;
glob.sync = sync;

module.exports = glob;
