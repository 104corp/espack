const path = require('path');
const fse = require('fs-extra');
const autoprefixer = require('autoprefixer');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const glob = require('glob');
const _ = require('lodash/array');
const CSSExtractRenamePlugin = require('./api/plugins/CSSExtractRenamePlugin');

const {
  EJS_FOLDER,
  PAGE_FOLDER,
  BUILD_FOLDER,
  DEFAULT_TEMPLATE,
  DEFAULT_JS,
  INFO_CHUNK_NAME,
  STATIC_ROOT,
  VIEW_ROOT,
  CSS_ASSETS_PATH,
  BASE_TAG,
  FONTS_FOLDER,
  getConfigOptions,
  IGNORE_PAGES_RULE,
  PUBLIC_FOLDER,
} = require('./config');


const util = {
  /**
   * 掃出指定資料夾路徑下的所有 js 無副檔名清單
   * @param {Object} param - 處理資料，沒指定則使用預設值
   * @param {string} [param.rootPath=PAGE_FOLDER] - 掃描目錄路徑
   * @param {string} [param.dev=process.env.NODE_ENV] - 是否為開發模式
   * @param {string} param.workDirectory - node.js進程的當前工作目錄
   * @return {Array} JS 路徑列表 ['src/page/account/account_list', 'src/page/account/account_form']
   */
  scanFolder: ({ rootPath = PAGE_FOLDER, dev = process.env.NODE_ENV }) => {
    const allJS = glob.sync(`${rootPath}/**/*.js`, { nodir: true });
    const { ignorePagesRule } = getConfigOptions();
    let ignoreJS = [];
    const ignoreRule = ignorePagesRule || IGNORE_PAGES_RULE;
    if (Array.isArray(ignoreRule)) {
      ignoreRule.forEach((rule) => {
        ignoreJS = ignoreJS.concat(glob.sync(`${rootPath}/${rule}`, { nodir: true }));
      });
    } else if (typeof ignoreRule === 'function') {
      return allJS.filter(page => ignoreRule.call(null, page, dev));
    }

    return _.difference(allJS, ignoreJS);
  },


  /**
   * 檢查字串第一個字或是最後一個字是否為 '/'
   * @param {string} str
   * @param {('start'|'end')} position - 前方或後方
   * @returns {boolean}
   */
  checkSlash: (str, position = 'start') => {
    switch (position) {
      case 'end': // 以 '/' 結尾
        return /\/$/.test(str);
      case 'start': // 以 '/' 開頭
      default:
        return /^\//.test(str);
    }
  },


  /**
   * 檢查是否為網址字串
   * @param {string} str
   * @returns {boolean}
   */
  checkHttp: str => (/^(https?:\/\/|\/\/)/.test(str)),


  /**
   * @param {string} file - 原始路徑
   * @param {string} staticFolder - 靜態資源的根目錄
   * @param {string} workDirectory - node.js進程的當前工作目錄
   * @returns {string}
   */
  processImgsPath: ({
    file,
    staticFolder,
    workDirectory,
    publicFolder,
  }) => {
    const outputPath = staticFolder === '.' ? '' : `${staticFolder}/`;
    const replacePath = new RegExp(staticFolder === '.' ? '' : `.*${staticFolder}/`, 'i');

    return `${outputPath}${
      file
        .replace(/\\/g, '/')
        .replace(/((.*(node_modules|bower_components))|fonts|font|assets|src)\//g, '')
        .replace(`${workDirectory}/${publicFolder}/`, '')
        .replace(`${workDirectory}/`, '')
        .replace(replacePath, '')
    }`;
  },


  /**
   * @param {string} file - 原始路徑
   * @param {string} staticFolder - 靜態資源的根目錄
   * @returns {string}
   */
  processFontsPath: (file, staticFolder) => {
    const outputPath = staticFolder === '.' ? '' : `${staticFolder}/`;

    if (!/node_modules|bower_components/.test(file)) {
      return `${outputPath}${FONTS_FOLDER}/[name].[ext]`;
    }

    return `${outputPath}${FONTS_FOLDER}/vendor/${
      file
        .replace(/\\/g, '/')
        .replace(/((.*(node_modules|bower_components))|fonts|font|assets)\//g, '')
    }`;
  },


  // sass, less 共用處理
  cssProcess: (dev) => {
    const plugins = [
      require('postcss-flexbugs-fixes'), // eslint-disable-line global-require
      autoprefixer({
        browsers: [
          'last 6 versions',
          'iOS 7',
          'Firefox ESR',
          'ie >= 8',
        ],
        flexbox: 'no-2009',
      }),
    ];
    if (!dev) {
      plugins.push(
        require('cssnano')({}), // eslint-disable-line global-require
      );
    }
    return [
      {
        loader: 'css-loader',
        options: {
          sourceMap: true,
        },
      }, {
        loader: 'postcss-loader',
        options: {
          ident: 'postcss',
          sourceMap: true,
          plugins,
        },
      },
    ];
  },
};
exports.util = util;


/**
 * webpack 共用基本設定
 * @param {Object} [param]
 * @param {boolean} [param.dev=false] - 是否為開發模式
 * @param {string} [param.viewsFolder=VIEW_ROOT] - bundle 時 view 的根目錄
 * @param {string} [param.staticFolder=STATIC_ROOT] - bundle 時靜態資源的根目錄
 * @param {string} [param.ejsFolder=EJS_FOLDER] - bundle 時 ejs 樣板的根目錄
 * @param {string} [param.pagesFolder=PAGE_FOLDER] - bundle 時主程式目錄
 * @param {string} [param.cssAssetsPath=CSS_ASSETS_PATH] - CSS 中靜態資源路徑
 * @param {string} [param.baseTag=BASE_TAG] - base tag 上的 href 設定
 * @returns {Object} webpack config
 */
exports.config = ({
  dev = false,
  viewsFolder = VIEW_ROOT,
  staticFolder = STATIC_ROOT,
  cssAssetsPath = CSS_ASSETS_PATH,
  baseTag = BASE_TAG,
  ejsFolder = EJS_FOLDER,
  pagesFolder = PAGE_FOLDER,
} = {}) => {
  const isProduction = (dev === false); // eslint-disable-line no-unused-vars
  const {
    workDirectory,
    outputFileName,
  } = getConfigOptions();
  const commonCssProcess = util.cssProcess(dev);

  const config = {
    entry: {
      // vendor: [],
    },
    output: {
      path: path.resolve(workDirectory, BUILD_FOLDER),
      filename: outputFileName.js,
      publicPath: '',
      chunkFilename: '[name].js',
    },
    devtool: 'source-map',
    optimization: {
      // namedModules: true,
      // noEmitOnErrors: true,
      // concatenateModules: true,
      splitChunks: {
        cacheGroups: {
          default: false,
        },
      },
    },
    module: {
      rules: [
        {
          test: /\.ejs$/,
          loader: 'ejs-loader',
        }, {
          test: /\.jsx?$/,
          use: {
            // 如果專案目錄下有 .babelrc 會優先以那設定為主，否則以這邊 options 設定為主
            loader: 'babel-loader',
            options: {
              plugins: ['lodash'],
              cacheDirectory: true,
            },
          },
          exclude: /(node_modules|bower_components)/,
        }, {
          test: /\.(jpe?g|png|gif|svg)$/i,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 10000,
                // name 返回需要是相對路徑後續 url 才會被 file-loader 處理， / 或 http 為絕對路徑
                // 此處處理為真實儲存路徑，不能為 .. 開頭，必須要是資料夾名稱開頭( 從發佈目錄開始算起 )
                name(file) {
                  if (/\.svg$/i.test(file) && /fonts?\//i.test(file)) {
                    // 字型
                    return util.processFontsPath(file, staticFolder);
                  }
                  return util.processImgsPath({
                    file,
                    staticFolder,
                    workDirectory,
                    publicFolder: PUBLIC_FOLDER,
                  });
                },
              },
            },
          ],
        }, {
          test: /\.(woff2?|ttf|eot|otf)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                // 同圖檔處理相同方式
                name: file => util.processFontsPath(file, staticFolder),
              },
            },
          ],
        }, {
          test: /\.(css|s[ac]ss)$/,
          use: [
            {
              loader: MiniCSSExtractPlugin.loader,
              options: {
                publicPath: cssAssetsPath,
                hmr: dev,
              },
            },
            ...commonCssProcess,
            {
              loader: 'resolve-url-loader',
              options: {
                sourceMap: true,
                root: path.resolve(workDirectory, 'node_modules'),
                // attempts: 1,
                // debug: true,
              },
            }, {
              loader: 'sass-loader',
              options: {
                sourceMap: true,
              },
            },
          ],
        }, {
          test: /\.less$/,
          use: [
            {
              loader: MiniCSSExtractPlugin.loader,
              options: {
                publicPath: cssAssetsPath,
                hmr: dev,
              },
            },
            ...commonCssProcess,
            {
              loader: 'less-loader',
              options: {
                sourceMap: true,
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new MiniCSSExtractPlugin({
        // filename: getPath => (getPath(outputFileName.css).replace('js/', 'css/')),
        filename: outputFileName.css,
      }),
      new LodashModuleReplacementPlugin(),
      new CSSExtractRenamePlugin(),
    ],
    resolve: {
      extensions: ['.web.js', '.js', '.json', '.web.jsx', '.jsx', '.css', '.scss', '.sass', '.less'],
      modules: ['bower_components', 'node_modules'],
      alias: {
        '@': workDirectory,
      },
    },
  };

  // 需處理 entry 清單
  const chunkList = util.scanFolder({ rootPath: pagesFolder, dev });
  const pages = chunkList.map((filePath) => {
    const fileName = filePath.replace(/.js$/, '').replace(new RegExp(`^${pagesFolder}`), '');
    const htmlName = `${viewsFolder}${fileName}`;
    return {
      link: `${htmlName}.html`,
      text: `${htmlName}.html`,
    };
  });

  chunkList.forEach((filePath) => {
    const fileName = filePath.replace(/.js$/, '').replace(new RegExp(`^${pagesFolder}`), '');
    const chunkName = `${staticFolder}/js${fileName}`;
    const htmlName = `${viewsFolder}${fileName}`;
    // 指定 Bundle Entry
    config.entry[chunkName] = [`./${filePath}`];
    // 指定 ejs 樣板
    const htmlInfo = {
      chunks: [chunkName],
      filename: `${htmlName}.html`,
      inject: 'body',
      hash: false,
      minify: {
        minifyCSS: false,
        minifyJS: false,
        removeComments: false,
        collapseWhitespace: false,
        preserveLineBreaks: false,
      },
      baseTag,
    };
    if (fse.existsSync(`./${ejsFolder}${fileName}.ejs`)) {
      // 自訂樣板存在使用自訂樣板
      htmlInfo.template = `./${ejsFolder}${fileName}.ejs`;
    } else {
      // 使用預設樣板
      htmlInfo.template = DEFAULT_TEMPLATE;
      htmlInfo.chunkList = pages;
      htmlInfo.tips = `./${ejsFolder}${fileName}.ejs`;
    }
    config.plugins.unshift(new HtmlWebpackPlugin(htmlInfo));
  });

  if (!isProduction) {
    // dev 預設首頁
    config.entry[INFO_CHUNK_NAME] = [DEFAULT_JS]; // eslint-disable-line dot-notation
    config.plugins.unshift(new HtmlWebpackPlugin({
      chunks: [INFO_CHUNK_NAME],
      filename: 'index.html',
      template: DEFAULT_TEMPLATE,
      chunkList: pages,
    }));
  }

  return config;
};
