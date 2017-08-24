/* eslint-disable no-param-reassign */
class CSSExtractPlugin {
  /**
   * CSS Chunk Name
   *
   * @param {string} chunkName
   */
  constructor(chunkName) {
    this.chunkName = chunkName;
  }


  /**
   * Apply the plugin.
   *
   * @param {Object} compiler
   */
  apply(compiler) {
    compiler.hooks.emit.tap('CSSExtractPlugin', (compilation) => {
      const ignoreAssets = Object.keys(compilation.assets).filter((asset) => {
        const fileName = asset.split('?')[0];
        if (fileName === `${this.chunkName}.js`) return true;
        if (fileName === `${this.chunkName}.js.map`) return true;
        return false;
      });
      ignoreAssets.forEach(asset => delete compilation.assets[asset]);
    });
  }
}

module.exports = CSSExtractPlugin;
