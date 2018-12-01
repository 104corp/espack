const {
  getConfigOptions,
} = require('./../../config');


class HtmlReloadPlugin {
  constructor() {
    this.cache = {};
  }

  /**
   * Apply the plugin.
   *
   * @param {Object} compiler
   */
  apply(compiler) {
    compiler.hooks.emit.tap('HtmlReloadPlugin', (compilation) => {
      compilation.hooks.htmlWebpackPluginAfterEmit.tap('HtmlReloadPlugin', (data) => {
        const orig = this.cache[data.outputName];
        // TODO: data.html.source() 為實際 html 內容，但因為 js、css link 路徑每次都不一樣因此 html 永遠會不一樣
        // 改比對 size，但如果 size 相同則會誤判沒有變更，但目前無其他方法
        const size = data.html.size();
        if (orig && orig !== size) {
          const { devServer } = getConfigOptions();
          devServer.sockWrite(devServer.sockets, 'content-changed');
        }
        this.cache[data.outputName] = size;
      });
    });
  }
}

module.exports = HtmlReloadPlugin;
