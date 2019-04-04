const espack = require('@104corp/espack');

/**
 * 移除檔名與資料夾同名的一階層
 * /home/home -> /home
 * /page/page -> /page
 * @param {string} route
 * @returns {string}
 */
function removeLastName(route) {
  const routeSplit = route.split('/');
  const { length } = routeSplit;
  if (length > 1) {
    const lastName = routeSplit[length - 1];
    const penultimateName = routeSplit[length - 2];
    if (lastName === penultimateName) routeSplit.pop();
  }
  return routeSplit.join('/');
}

module.exports = {
  // 預設排除檔案，使不被當成頁面 entry js
  // ignorePages: ['**/_*.js'],
  // 自訂 output 名稱規則
  outputFileName: {
    js: '[name].js?v2019.[chunkhash:5]',
    css: '[name].css?v2019.[contenthash:5]',
  },
  webpack(config, { dev }) {
    /**
     * espack API 範例
     * config(config) - 指定原始 config
     * processCSSUrls(enable) - 是否使用 url 處理，預設 true
     * resetPageRoute(handler) - 針對 Page 網址路徑規則重寫
     * htmlChunks(handler) - 每個 page 要依賴的 chunk 的新增修改，藉此將 chunk 自動引入頁面中
     * htmlPluginOptions(handler) - 修改各頁面 HtmlWebpackPlugin 中設定
     * extract(libs, output, entrys) - 指定哪些 chunk 抽取共用模塊
     * js(entry, output) - 於 entry 中新增 chunk
     * css(entry, output) - 單純轉譯 sass scss 但不產生 js
     * babel(src, output, options) - 使用 babel 轉譯 js 不透過 webpack
     * then(callback) - 註冊監聽 webpack 'done' event
     * postcssOptions(handler) - 修改或加入 postcss 設定
     */
    return espack
      .setConfig(config)
      // 修改原本 entry route 規則，更換成自己想要的
      .resetPageRoute(route => removeLastName(route))
      // 將 bootstrap & styles.scss 包成獨立的 styles.css
      .css([
        'bootstrap-sass/assets/stylesheets/_bootstrap.scss',
        './src/pages/styles.scss',
      ], 'styles')
      // 將 home, page 頁面共用部分的程式提取出來成為 common.js
      .extract([], 'common', ['home', 'page'])
      // 將 common.js 扔進 ejs 模板之中自動置入
      .htmlChunks((chunks, filename) => chunks.concat(['common']))
      // 不透過 webpack，直接使用 babel 轉譯 js
      .babel(['./src/requestAnimationFrame.js'], 'requestAnimationFrame.js')
      // webpack 'done' event
      .then((stats) => {
        // console.log('\n');
        // Object.keys(stats.compilation.assets).forEach(filename => (console.log(filename)));
      })
      .config;
  },
  devServer: {
    // https://webpack.js.org/configuration/dev-server/
  },
  processEnd() {
    // build 進程結束後接續處理函式
  },
};
