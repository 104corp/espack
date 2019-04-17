const HtmlWebpackPlugin = require('html-webpack-plugin');
const chalk = require('chalk');
const EventCallbackPlugin = require('./plugins/EventCallbackPlugin');
const CSSExtractPlugin = require('./plugins/CSSExtractPlugin');
const { INFO_CHUNK_NAME, getConfigOptions } = require('../config');
const BabelTask = require('./tasks/BabelTask');

class Api {
  constructor() {
    // webpack event 綁定函式清單
    this.buildCallbackList = [];
    // 非 Page Chunk 清單 { type: (js|css|extract), entry: chunkName }
    this.filterEntry = [];

    this.tasks = [];
  }


  /**
   * 轉換 chunk 名稱，如果沒有給資料夾名稱就自動加上資料夾名稱
   * 例如 'myChunk' => './js/myChunk'
   *
   * @param {string} name
   */
  static transformChunkName(name) {
    const { staticFolder } = getConfigOptions();
    const staticNameFormat = new RegExp(`^${staticFolder}/js`, 'i');
    const chunkName = name.charAt(0) === '/' ? name.slice(1) : name;

    if (staticNameFormat.test(chunkName)) return chunkName;

    return `${staticFolder}/js/${chunkName}`;
  }


  /**
   * 轉換 css 路徑名稱，如果沒有給資料夾名稱就自動加上資料夾名稱
   * 例如 'myCss' => './js/myCss'
   * './js/myCss' => './js/myCss'
   * './css/myCss' => './js/myCss'
   *
   * @param {string} name
   */
  static transformCssName(name) {
    const { staticFolder } = getConfigOptions();
    const staticNameFormat = new RegExp(`^${staticFolder}/(css)`, 'i');
    let chunkName = name.charAt(0) === '/' ? name.slice(1) : name;

    if (staticNameFormat.test(chunkName)) {
      chunkName = chunkName.replace(staticNameFormat, '');
      chunkName = chunkName.charAt(0) === '/' ? chunkName.slice(1) : chunkName;
    }

    return Api.transformChunkName(chunkName);
  }


  /**
   * 打印警告訊息
   *
   * @param {string} msg
   */
  static log(msg, type = 'warn') {
    console.log('\n');
    switch (type) {
      case 'warn':
        console.log(`${chalk.black.bgRed(' WARN ')} ${chalk.red(msg)}`);
        break;
      default:
        console.log(chalk.red(msg));
    }
  }


  static addEventCallbackPlugin(thisArg) {
    const target = thisArg;
    if (!target.eventCallbackPlugin) {
      target.eventCallbackPlugin = new EventCallbackPlugin((event, stats) => {
        if (event === 'done') {
          // then Callback
          target.buildCallbackList.forEach((call) => {
            call.call(null, stats);
          });
          // tasks
          target.tasks.forEach((task) => {
            task.run();
          });
        }
      });
      target.config.plugins.push(target.eventCallbackPlugin);
    }
  }


  /**
   * 需要先有 config 才能做任何事
   */
  existConfig() {
    const exist = !!this.config;
    if (exist) return true;

    Api.log('needs a Config');

    return false;
  }


  existEntry(chunkName) {
    const entrys = Object.keys(this.config.entry).filter(entry => entry === chunkName);

    if (entrys.length > 0) {
      Api.log('The same chunk already exists in the entry');
      return this;
    }

    return entrys.length > 0;
  }


  /**
   * webpack config
   *
   * @param {*} config
   */
  setConfig(config) {
    this.config = config;

    return this;
  }


  /**
   * css-loader 啟用或停用 CSS url process
   *
   * @param {(boolean|Function)} custom
   */
  processCSSUrls(custom = true) {
    if (!this.existConfig()) return this;

    const rules = this.config.module.rules.filter(item => item.test.test('.scss') || item.test.test('.sass') || item.test.test('.less'));
    if (typeof custom === 'boolean') {
      rules.forEach((rule) => {
        const cssLoader = rule.use.filter(cssRule => cssRule.loader === 'css-loader')[0];
        if (cssLoader) cssLoader.options.url = custom;
      });
    } else if (typeof custom === 'function') {
      rules.forEach((rule) => {
        const cssLoader = rule.use.filter(cssRule => cssRule.loader.indexOf('mini-css-extract-plugin') > -1)[0];
        if (cssLoader) cssLoader.options.publicPath = custom;
      });
    }

    return this;
  }


  processCssUrls(custom = true) {
    Api.log('processCssUrls has been renamed processCSSUrls');
    return this.processCSSUrls(custom);
  }

  /**
   * 針對 Page 網址路徑規則重寫
   * 重設 entry 名稱，改變未來發佈路徑
   *
   * @param {Function} handler
   */
  resetPageRoute(handler) {
    if (!this.existConfig()) return this;
    if (typeof handler !== 'function') return this;

    const entrys = {};
    const chunks = {};
    const { staticFolder, viewsFolder } = getConfigOptions();

    Object.keys(this.config.entry).forEach((key) => {
      const fromPage = new RegExp(`^${staticFolder}`, 'i');
      let chunkName = key;

      if (key !== INFO_CHUNK_NAME && fromPage.test(key)) {
        const exist = !!this.filterEntry.find(item => item.entry === key);

        if (!exist) {
          const staticNameFormat = new RegExp(`^${staticFolder}/js/`, 'i');
          chunkName = `${staticFolder}/js/${handler(key.replace(staticNameFormat, ''))}`;
        }
      }

      chunks[key] = chunkName;
      entrys[chunkName] = this.config.entry[key];
    });

    this.config.entry = entrys;

    this.config.plugins.forEach((plugin) => {
      if (plugin instanceof HtmlWebpackPlugin) {
        const option = plugin.options;

        if (option.chunkList) {
          option.chunkList = option.chunkList.map((item) => {
            const key = item.link.replace('.html', '').replace(viewsFolder, `${staticFolder}/js`);
            const link = `${chunks[key].replace(`${staticFolder}/js`, viewsFolder)}.html`;
            return { link, text: link };
          });
        }

        if (option.chunks) {
          option.chunks = option.chunks.map(item => chunks[item] || item);
        }

        if (option.filename) {
          const key = option.filename.replace('.html', '').replace(viewsFolder, `${staticFolder}/js`);
          option.filename = chunks[key] ? `${chunks[key].replace(`${staticFolder}/js`, viewsFolder)}.html` : option.filename;
        }
      }
    });

    return this;
  }


  /**
   * 設置 HtmlWebpackPlugin (.html) 中要使用的 chunks，藉此將 chunk 自動引入頁面中
   *
   * @param {Function} handler
   */
  htmlChunks(handler) {
    if (!this.existConfig()) return this;
    if (typeof handler !== 'function') return this;

    this.config.plugins.forEach((plugin) => {
      if (plugin instanceof HtmlWebpackPlugin) {
        const option = plugin.options;
        if (option.chunks && !option.chunks.includes(INFO_CHUNK_NAME)) {
          let chunks = handler(option.chunks, option.filename);

          chunks = chunks.map(name => Api.transformChunkName(name));

          option.chunks = chunks;
        }
      }
    });

    return this;
  }


  /**
   * 修改 HtmlWebpackPlugin (.html) 中各項設定
   * hash, inject, favicon, minify, cache, showErrors, title, xhtml, baseTag, template
   * 另外可以包含自訂參數，但排除 compile, filename, chunks
   *
   * @param {Function} handler
   */
  htmlPluginOptions(handler) {
    if (!this.existConfig()) return this;
    if (typeof handler !== 'function') return this;

    this.config.plugins.forEach((plugin) => {
      if (plugin instanceof HtmlWebpackPlugin) {
        const option = plugin.options;

        if (option.chunks && !option.chunks.includes(INFO_CHUNK_NAME)) {
          const htmlOption = { ...option };
          delete htmlOption.compile;
          delete htmlOption.filename;
          delete htmlOption.chunks;

          const newOption = handler(htmlOption, option.filename);
          delete newOption.compile;
          delete newOption.filename;
          delete newOption.chunks;

          Object.keys(newOption).forEach((key) => {
            option[key] = newOption[key];
          });
        }
      }
    });

    return this;
  }

  /**
   * 指定哪些 chunk 抽取共用模塊
   *
   * @param {string[]} libs - package, js
   * @param {string} output - entry chunk 名稱，也是輸出位置去掉 .js 名稱
   * @param {'all'|string[]} entrys - 要針對哪些 entrys 抽取，all 就是全部
   * @param {Object} options - CommonsChunkPlugin 其他額外配置 - 撇除 name, chunks
   */
  extract(libs, output, entrys = 'all', options = {}) {
    if (!this.existConfig()) return this;
    if (!Array.isArray(libs)) return this;
    if (!output) {
      Api.log('extract method requires an output parameter');
      return this;
    }

    const chunkName = Api.transformChunkName(output);
    if (this.existEntry(chunkName)) return this;

    if (libs.length > 0) {
      this.config.entry[chunkName] = libs;
      this.filterEntry.push({ type: 'extract', entry: chunkName });
    }

    const filterOptions = options;
    delete filterOptions.name;
    // delete filterOptions.filename;
    delete filterOptions.chunks;
    delete filterOptions.children;

    this.config.optimization.splitChunks.cacheGroups[chunkName] = {
      name: chunkName,
      chunks: (module) => {
        if (module.name === INFO_CHUNK_NAME) return false;
        if (entrys === 'all') return true;
        if (Array.isArray(entrys)) {
          const allChunks = entrys.map(name => Api.transformChunkName(name));
          return allChunks.indexOf(module.name) > -1;
        }
        return false;
      },
      ...filterOptions,
    };

    return this;
  }


  /**
   * 將要編譯的模塊加入 entry
   * 用此方法加入的 entry 不會生成 html 頁面
   *
   * @param {string|string[]} entry - chunk 清單
   * @param {string} output - 輸出對應路徑
   */
  js(entry, output) {
    if (!this.existConfig()) return this;
    if (!entry) return this;
    if (!output || typeof output !== 'string') return this;

    const chunkName = Api.transformChunkName(output);
    if (this.existEntry(chunkName)) return this;

    this.config.entry[chunkName] = entry;
    this.filterEntry.push({ type: 'js', entry: chunkName });

    return this;
  }


  /**
   * 單純轉譯 sass scss less css 但不產生 js
   *
   * @param {string|string[]} entry - 各種 css 清單
   * @param {string} output - 輸出對應路徑
   */
  css(entry, output) {
    if (!this.existConfig()) return this;
    if (!entry) return this;
    if (!output || typeof output !== 'string') return this;

    const chunkName = Api.transformCssName(output);
    if (this.existEntry(chunkName)) return this;

    this.config.entry[chunkName] = entry;
    this.config.plugins.push(new CSSExtractPlugin(chunkName));
    this.filterEntry.push({ type: 'css', entry: chunkName });

    return this;
  }


  /**
   * 註冊 webpack build event 'done'
   *
   * @param {Function} callback
   */
  then(callback) {
    if (!this.existConfig()) return this;

    Api.addEventCallbackPlugin(this);

    this.buildCallbackList.push(callback);

    return this;
  }


  /**
   * 使用 babel 轉譯 js 不透過 webpack
   * 當使用 es6 語法但是不想包成 webpack modules 時很需要
   *
   * @param {string|string[]} src
   * @param {string} output
   * @param {Object|string} options - babelrc 設定或是文件路徑
   */
  babel(src, output, options) {
    if (!this.existConfig()) return this;
    if (!src) return this;
    if (!output || typeof output !== 'string') return this;
    if (typeof src !== 'string' && !Array.isArray(src)) return this;

    Api.addEventCallbackPlugin(this);

    this.tasks.push(new BabelTask({
      src, output, options,
    }));

    return this;
  }

  /**
   * 自定義 postcss options
   *
   * @param {Function} handler
   */
  postcssOptions(handler) {
    if (!this.existConfig()) return this;
    if (typeof handler !== 'function') return this;

    this.config.module.rules.find(rule => (
      rule.test.test('.css') || rule.test.test('.less')
    )).use.filter(use => (
      use.loader === 'postcss-loader'
    )).forEach((loader) => {
      const postcssLoader = loader;
      if (typeof postcssLoader === 'object') {
        postcssLoader.options = handler(loader.options);
      }
    });

    return this;
  }
}

module.exports = Api;
