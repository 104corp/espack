const path = require('path');
const WebpackDevServer = require('webpack-dev-server');
const webpack = require('webpack');
const opener = require('opener');
const fse = require('fs-extra');
const express = require('express');
const chalk = require('chalk');
const webpackConfig = require('./webpack.config');
const {
  ENV_PRODUCTION,
  ENV_DEVELOPMENT,
  PUBLIC_FOLDER,
  BUILD_FOLDER,
  TMP_BUILD_FOLDER,
  VIEW_ROOT,
  STATIC_ROOT,
  PAGE_FOLDER,
  EJS_FOLDER,
  CSS_ASSETS_PATH,
  CONFIG_MERGE_JS,
  BASE_TAG,
  CLI_BUILD_TITLE,
  CLI_DEV_TITLE,
  OUTPUT_FILE_NAME,
  setConfigOptions,
  getConfigOptions,
} = require('./config');


const runner = {
  /**
   * Runner start
   * @param {Object} [param]
   * @param {boolean} [param.dev=false] - 是否為開發模式
   * @param {boolean} [param.dropConsole=false] - 生產模式時是否移除所有 console
   * @param {number|string} [param.port=8888] - Http Server Port
   * @param {string} [param.viewsFolder=VIEW_ROOT] - bundle 時 view 的根目錄
   * @param {string} [param.staticFolder=STATIC_ROOT] - bundle 時靜態資源的根目錄
   * @param {string} [param.cssAssetsPath=CSS_ASSETS_PATH] - CSS 中靜態資源路徑
   * @param {string} [param.baseTag=BASE_TAG] - base tag 上的 href 設定
   * @param {string} [param.spinner] - ora spinner
   */
  start({
    dev = false,
    dropConsole = false,
    keepDist = false,
    port = 8888,
    viewsFolder = VIEW_ROOT,
    staticFolder = STATIC_ROOT,
    cssAssetsPath = CSS_ASSETS_PATH,
    baseTag = BASE_TAG,
    spinner,
  } = {}) {
    process.env.NODE_ENV = !dev ? ENV_PRODUCTION : ENV_DEVELOPMENT;
    this.dev = dev;
    this.options = {
      dev,
      dropConsole,
      port,
      viewsFolder,
      staticFolder,
      cssAssetsPath,
      baseTag,
      pagesFolder: PAGE_FOLDER,
      ejsFolder: EJS_FOLDER,
    };
    // 設定共用變數
    this.setCommonOptions(this.options);

    const { workDirectory } = getConfigOptions();
    const { mergeJS, merge } = this.configMerge(workDirectory);

    // 使用者 config 特殊自訂
    this.setCustomConfig(mergeJS);

    let config = webpackConfig(this.options);

    // 讓使用者修改 webpack config
    config = merge(config, this.options);

    const compiler = webpack(config);

    if (!dev) {
      this.prodBuild({
        compiler,
        workDirectory,
        mergeJS,
        options: this.options,
        spinner,
        keepDist,
      });
    } else {
      const devServer = {
        hot: true,
        stats: { colors: true },
        publicPath: config.output.publicPath,
        contentBase: path.join(workDirectory, PUBLIC_FOLDER),
        watchContentBase: true,
        compress: true, // use gzip compression
        watchOptions: {
          ignored: /node_modules/,
        },
        noInfo: false,
      };
      this.runDevServer({
        port,
        compiler,
        spinner,
        devServer: {
          ...devServer,
          ...mergeJS.devServer,
        },
      });
    }
  },


  /**
   * 整理紀錄各種設定資料，方便其他地方程式取出使用
   * @param {Object} options
   */
  setCommonOptions(options) {
    // 使用者自訂設定
    setConfigOptions(options);

    // 執行相關
    const workDirectory = process.cwd();
    const espackDirectory = path.join(__dirname, '..');
    setConfigOptions({
      workDirectory,
      espackDirectory,
    });

    // babel 設定
    const userBabelrcPath = path.join(workDirectory, '.babelrc');
    const defaultBabelrcPath = path.join(espackDirectory, 'lib', 'babel', '.default-babelrc');
    let babelrc;
    if (fse.existsSync(userBabelrcPath)) {
      babelrc = JSON.parse(fse.readFileSync(userBabelrcPath, { encoding: 'utf-8' }));
    } else {
      babelrc = JSON.parse(fse.readFileSync(defaultBabelrcPath, { encoding: 'utf-8' }));
    }
    setConfigOptions({ babelrc });
  },


  /**
   * 使用者 config 自訂設定值
   */
  setCustomConfig(mergeJS) {
    const { ignorePages, outputFileName, pagesFolder } = mergeJS;
    const outputFileSettings = { ...OUTPUT_FILE_NAME };

    // 使用者排除 page 規則
    if (ignorePages) {
      if (typeof ignorePages === 'string') {
        setConfigOptions({ ignorePagesRule: [ignorePages] });
      } else if (Array.isArray(ignorePages)) {
        setConfigOptions({ ignorePagesRule: ignorePages });
      } else if (typeof ignorePages === 'function') {
        setConfigOptions({ ignorePagesRule: ignorePages });
      }
    }

    // 使用者自訂檔案輸出 filename 規則
    if (outputFileName && (typeof outputFileName === 'object')) {
      if (outputFileName.js) outputFileSettings.js = outputFileName.js;
      if (outputFileName.css) outputFileSettings.css = outputFileName.css;
    }

    // devServer hmr 不能使用 chunkhash, contenthash
    if (this.dev) outputFileSettings.js = outputFileSettings.js.replace(/chunkhash|contenthash/g, 'hash');
    setConfigOptions({ outputFileName: outputFileSettings });

    if (pagesFolder) {
      this.options.pagesFolder = pagesFolder;
      this.options.ejsFolder = pagesFolder;
      setConfigOptions({
        pagesFolder,
        ejsFolder: pagesFolder,
      });
    }
  },


  /**
   * 抓取由使用者自定義處理文件
   * @param {string} workDirectory - 進程所在目錄
   * @returns {Object} {mergeJS: 使用者自定義 JS, merge: Config Merge 函式}
   */
  configMerge(workDirectory) {
    const configMergeJS = `${workDirectory}/${CONFIG_MERGE_JS}`;
    let mergeJS = {};
    if (fse.existsSync(configMergeJS) && fse.statSync(configMergeJS).isFile()) {
      mergeJS = require(configMergeJS); // eslint-disable-line
    }
    return {
      mergeJS,
      merge: (config, options) => {
        let newConfig = config;
        if (typeof mergeJS.webpack === 'function') {
          newConfig = mergeJS.webpack(newConfig, options);
        }
        return newConfig;
      },
    };
  },


  /**
   * 進度文字
   */
  progressText(title, percent) {
    const newPercent = Math.floor(percent * 10000) / 100;
    const bar = ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-'];
    const barProgress = bar.map((item, index) => (index <= percent * 20 ? '■' : '-'));
    return `${title} [${chalk.cyan(barProgress.join(''))}] ${newPercent} %`;
  },


  /**
   * production build
   */
  prodBuild({
    compiler,
    workDirectory,
    mergeJS,
    options,
    spinner,
    keepDist,
  }) {
    if (!keepDist) {
      fse.removeSync(path.join(workDirectory, BUILD_FOLDER));
    }
    spinner.text = this.progressText(CLI_BUILD_TITLE, 0); // eslint-disable-line no-param-reassign
    const timer = setInterval(() => {
      spinner.render();
    }, 80);
    new webpack.ProgressPlugin((percent) => {
      spinner.text = this.progressText(CLI_BUILD_TITLE, percent); // eslint-disable-line no-param-reassign, max-len
      if (percent === 1) {
        clearInterval(timer);
      }
    }).apply(compiler);
    compiler.run((err, stats) => {
      if (err) console.error(err);
      if (fse.existsSync(path.join(workDirectory, PUBLIC_FOLDER))) {
        fse.copySync(
          path.join(workDirectory, PUBLIC_FOLDER),
          path.join(workDirectory, BUILD_FOLDER),
        );
      }
      spinner.stop();
      console.log(chalk.cyan(`times: ${stats.endTime - stats.startTime}`));
      console.log(chalk.green('Compiled successfully.'));
      if (mergeJS.processEnd && typeof mergeJS.processEnd === 'function') mergeJS.processEnd.call(null, options);
    });
  },


  /**
   * development run server
   */
  runDevServer({
    port,
    compiler,
    devServer,
    spinner,
  }) {
    if (devServer.quiet === true) {
      spinner.stop();
    } else {
      let firstRun = true;
      spinner.text = this.progressText(CLI_DEV_TITLE, 0); // eslint-disable-line no-param-reassign
      const timer = setInterval(() => {
        spinner.render();
      }, 80);
      new webpack.ProgressPlugin((percent) => {
        if (!firstRun) return;
        spinner.text = this.progressText(CLI_DEV_TITLE, percent); // eslint-disable-line no-param-reassign, max-len
        if (percent === 1) {
          spinner.stop();
          clearInterval(timer);
          opener(`http://0.0.0.0:${port}`);
          firstRun = false;
        }
      }).apply(compiler);
    }
    const { espackDirectory } = getConfigOptions();
    const tmpFolder = path.join(espackDirectory, TMP_BUILD_FOLDER);
    fse.removeSync(path.join(tmpFolder, '..'));
    const server = new WebpackDevServer(compiler, devServer);
    server.app.use(express.static(tmpFolder));
    setConfigOptions({ devServer: server });
    server.listen(port, '0.0.0.0', (error) => {
      if (error) console.error(error);
      if (devServer.quiet) opener(`http://0.0.0.0:${port}`);
    });
  },
};


module.exports = runner;
