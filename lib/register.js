const packageName = require('../package.json').name;
const presetStage = require('./babel/preset-stage');

require('@babel/register')({ // eslint-disable-line
  ignore: [(filepath) => {
    const espackRegExp = new RegExp(`${packageName}/lib`);
    const nodeModulesRegExp = /node_modules/;
    if (espackRegExp.test(filepath)) return false; // espack self
    return nodeModulesRegExp.test(filepath); // ignore node_modules
  }],
  presets: [
    '@babel/preset-env',
    presetStage,
  ],
  plugins: [
    '@babel/plugin-transform-runtime',
  ],
});

module.exports = require('./runner');
