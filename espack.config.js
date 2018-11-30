/* eslint-disable */
const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const liveServer = require('live-server');
const HtmlBeautifyPlugin = require('html-beautify-webpack-plugin');
const merge = require('webpack-merge');
const jsdom = require('jsdom');
const fse = require('fs-extra');
const { JSDOM } = jsdom;
const opener = require('opener');
const WebpackNotifierPlugin = require('webpack-notifier');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const espack = require('@104corp/espack');
const { VueLoaderPlugin } = require('vue-loader');
/* eslint-enable */


/**
 * 設定測試用 Fake API Server
 */
function setFakeApi(app) {
  app.get('/api/user', (req, res) => {
    res.json({ pid: '0987654321' });
  });
}


/**
 * sleep, delay 一下再進行
 * @param {number} ms 延遲毫秒
 * @return {Promise}
 */
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));


/**
 * 移除與資料夾同名的一階層
 * ./src/page/separate/page1/page1.js -> separate/page1/page1 -> separate/page1
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


/**
 * SPA 類型頁面的設定輔助函式 - redirect, rewrite
 */
const spaHelper = {
  // 輔助 spa 頁面設定轉址
  redirect: (app, setting) => {
    setting.forEach((element) => {
      app.get(element.from, (req, res) => {
        res.redirect(301, element.to);
      });
    });
  },
  // 輔助 spa 頁 rewrite route 內容
  rewrites: setting => setting.map(element => ({ from: element.rewrite, to: element.from })),
};


/**
 * 實驗性質 preRender
 * 理想中的程序是能起一個乾淨的 express server 並且能自動設定指定的 route
 * 然後對其執行 preRender 另外儲存 html 再關閉 express
 */
async function preRender(port) {
  const routes = [
    `http://0.0.0.0:${port}/spa/page3`,
    `http://0.0.0.0:${port}/spa/page4`,
  ];
  const renders = routes.map(route => (
    new Promise((resolve) => {
      JSDOM.fromURL(route, {
        runScripts: 'dangerously',
        resources: 'usable',
      }).then((dom) => {
        const { window } = dom;
        window.onload = () => {
          // console.log(dom.serialize());
          // console.log(dom.window.document.getElementsByTagName('head')[0].innerHTML);
          // console.log(dom.window.document.getElementById('root').innerHTML);
          resolve();
        };
      });
    })
  ));
  await Promise.all(renders);
  // 確定都 preRender 完
  // process.exit();
}


// //////////////////////////////////////////////////////////
// espack config
// //////////////////////////////////////////////////////////

// spa 路由設定 { rewrite: 路由匹配, from: 頁面實際 .html 來源, to: html 5 形式路由 },
const spaRoute = [
  { rewrite: /^\/spa\/*/, from: '/spa/index.html', to: '/spa/page3' },
];

module.exports = {
  ignorePages: ['**/_*.js', 'spa/redux/**/*'],
  // 自訂 output 名稱規則，看打算如何規劃快取政策
  outputFileName: {
    js: '[name].js?v2018.[chunkhash:5]',
    css: '[name].css?v2018.[contenthash:5]',
  },
  webpack: (config, { dev }) => {
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
    const newConfig = espack
      .setConfig(config)
      .resetPageRoute(route => removeLastName(route))
      .css([
        './src/styles/less/reset.less',
        'bootstrap-sass/assets/stylesheets/_bootstrap.scss',
        './src/styles/scss/common.scss',
      ], 'reset')
      .extract([], 'common', ['spa/index'], {
        test: /[\\/]node_modules[\\/]/,
      })
      .htmlChunks((chunks, filename) => {
        if (filename === './spa/index.html') return chunks.concat(['common']);
        return chunks;
      })
      .babel(['./src/module/requestAnimationFrame.js'], 'animation.js', {
        presets: [
          ['@babel/preset-env', {
            targets: {
              browsers: [
                '>1%',
                'last 4 versions',
                'Firefox ESR',
                'not ie < 8',
              ],
            },
            // modules: 'umd',
          }],
          '@104corp/espack/lib/babel/preset-stage',
        ],
      })
      .then((stats) => { // eslint-disable-line no-unused-vars
        // console.log('\n');
        // Object.keys(stats.compilation.assets).forEach(filename => (console.log(filename)));
      })
      .config;

    const customizeConfig = [
      newConfig,
      {
        module: {
          rules: [{ // Vue
            test: /\.vue$/,
            loader: 'vue-loader',
            exclude: /bower_components/,
          }],
        },
        plugins: [
          // Beautify HTML
          new HtmlBeautifyPlugin({
            config: {
              html: {
                indent_size: 2,
                indent_char: ' ',
                max_preserve_newlines: 1,
              },
            },
            replace: [{ test: '<html lang="en">', with: '<html lang="zh-tw">' }],
          }),
          // Vue
          new VueLoaderPlugin(),
        ],
      },
    ];

    if (dev) {
      // 加入開發輔助 Plugin
      customizeConfig.push({
        plugins: [
          // ejs 內有些錯誤使用 FriendlyErrorsWebpackPlugin 會看不到詳細錯誤資訊
          new FriendlyErrorsWebpackPlugin(),
          // Notifier
          new WebpackNotifierPlugin({
            title: 'Example',
            alwaysNotify: true,
          }),
        ],
      });
    } else {
      customizeConfig.push({
        plugins: [
          // 分析 Bundle Size
          new BundleAnalyzerPlugin(),
        ],
      });
    }
    // merge webpack config
    return merge.smart(customizeConfig);
  },
  devServer: {
    // 使用 FriendlyErrorsWebpackPlugin 需要設置 quiet: true
    quiet: true,
    before(app) {
      setFakeApi(app);
      // 將 spa 頁導去對應的 html5 route
      spaHelper.redirect(app, spaRoute);
    },
    historyApiFallback: {
      rewrites: [
        // 將 spa 的 html5 route 指到實際頁面
        ...spaHelper.rewrites(spaRoute),
      ],
    },
    proxy: [
      {
        // 將代理網站的 faq.css 來源使用專案內 /public/my104/css 內的 css
        context: ['/104/jobbank/faq/css/faq.css'],
        target: `http://0.0.0.0:${process.env.npm_package_config_port}/`,
        pathRewrite: { '^/104/jobbank/faq/css': '/my104/css' },
      }, {
        // 其他網站相關的所有靜態資源都使用原始來源
        context: ['/public', '/jobbank', '/104'],
        target: 'https://www.104.com.tw/',
        secure: false,
        pathRewrite: { '^/104': '/' },
      }, {
        // 將臺北市政府資訊開放平台天氣 api 代理進來
        context: ['/opendata'],
        target: 'http://data.taipei/',
      },
    ],
  },
  async processEnd() {
    await sleep(1000 * 2);
    // 使用 liveServer 跑 build 後的檔案
    const port = process.env.npm_package_config_port;
    liveServer.start({
      port,
      root: './dist',
      // 加入 middleware 在 live-server 內部建立 router 處理，彈性比較大
      middleware: [
        // SPA route middleware
        (req, res, next) => {
          if (req.method !== 'GET' && req.method !== 'HEAD') next();
          let pass = true;
          spaRoute.forEach((element) => {
            // 網址是 html 5 route
            if (pass && element.rewrite.test(req.url)) {
              pass = false;
              const fileContent = fse.readFileSync(path.join(__dirname, 'dist', element.from), 'utf-8');
              res.write(fileContent);
              res.end();
            }
            // .html 頁面網址
            if (pass && req.url === element.from) {
              pass = false;
              res.statusCode = 301;
              res.setHeader('Location', element.to);
              res.end();
            }
          });
          if (pass) next();
        },
      ],
      // 有明確少數幾個網址可以直接使用 proxy 便可
      // proxy: [
      //   ['/spa/page3', `http://0.0.0.0:${port}/spa/`],
      //   ['/spa/page4', `http://0.0.0.0:${port}/spa/`],
      // ],
      open: false,
    });
    opener(`http://0.0.0.0:${port}/spa/page3`);
    // 使用 JSDOM 讀取 spa 頁 render 後內容
    preRender(port);
  },
};
