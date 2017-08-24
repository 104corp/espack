const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const baseConfig = require('./webpack.base.config').config;
const {
  ENV_PRODUCTION,
  ENV_DEVELOPMENT,
  VIEW_ROOT,
  STATIC_ROOT,
  EJS_FOLDER,
  PAGE_FOLDER,
  CSS_ASSETS_PATH,
  BASE_TAG,
} = require('./config');

/**
 * webpack 共用基本設定
 * @param {Object} [param]
 * @param {boolean} [param.dev=false] - 是否為開發模式
 * @param {boolean} [param.dropConsole=false] - 生產模式時是否移除所有 console
 * @param {number|string} [param.port=8888] - Http Server Port
 * @param {string} [param.viewsFolder=VIEW_ROOT] - bundle 時 view 的根目錄
 * @param {string} [param.staticFolder=STATIC_ROOT] - bundle 時靜態資源的根目錄
 * @param {string} [param.ejsFolder=EJS_FOLDER] - bundle 時 ejs 樣板的根目錄
 * @param {string} [param.pagesFolder=PAGE_FOLDER] - bundle 時主程式目錄
 * @param {string} [param.cssAssetsPath=CSS_ASSETS_PATH] - CSS 中靜態資源路徑
 * @param {string} [param.baseTag=BASE_TAG] - base tag 上的 href 設定
 * @returns {Object} webpack config
 */
module.exports = ({
  dev = false,
  dropConsole = false,
  port = 8888,
  viewsFolder = VIEW_ROOT,
  staticFolder = STATIC_ROOT,
  ejsFolder = EJS_FOLDER,
  pagesFolder = PAGE_FOLDER,
  cssAssetsPath = CSS_ASSETS_PATH,
  baseTag = BASE_TAG,
} = {}) => {
  const config = baseConfig({
    dev,
    viewsFolder,
    staticFolder,
    cssAssetsPath,
    baseTag,
    ejsFolder,
    pagesFolder,
  });

  if (!dev) {
    // production
    config.devtool = false;
    config.mode = ENV_PRODUCTION;
    config.plugins.unshift(new webpack.HashedModuleIdsPlugin());
    // 壓縮醜化js
    config.optimization.minimizer = [
      new UglifyJSPlugin({
        sourceMap: false,
        parallel: true,
        uglifyOptions: {
          ie8: true,
          output: {
            comments: false,
          },
          compress: {
            dead_code: true,
            drop_console: dropConsole || false, // 移除 console
            warnings: false,
          },
        },
      }),
    ];
  } else {
    // development
    config.mode = ENV_DEVELOPMENT;
    Object.keys(config.entry).forEach((key) => {
      config.entry[key].unshift(
        `webpack-dev-server/client?http://localhost:${port}/`,
        'webpack/hot/dev-server',
      );
    });
    config.plugins.unshift(new webpack.HotModuleReplacementPlugin());
  }

  return config;
};
