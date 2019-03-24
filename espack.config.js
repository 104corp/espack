// eslint-disable-next-line import/no-extraneous-dependencies
const { VueLoaderPlugin } = require('vue-loader');

module.exports = {
  webpack(config) {
    config.module.rules.push({
      test: /\.vue$/,
      loader: 'vue-loader',
      exclude: /bower_components/,
    });
    config.plugins.push(new VueLoaderPlugin());
    return config;
  },
  devServer: {
    before(app) {
      // 將 / 網址導去對應的 route
      app.get('/', (req, res) => {
        res.redirect(301, '/App.html');
      });
    },
    historyApiFallback: {
      rewrites: [
        // 將 html5 route 指到實際頁面
        { from: /^\/?/, to: '/App.html' },
      ],
    },
  },
};
