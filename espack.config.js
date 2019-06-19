/* eslint-disable */
const merge = require('webpack-merge');

module.exports = {
  webpack: (config, { dev }) => {
    const customizeConfig = [
      config,
      {
        resolve: {
          alias: {
            // 將 react 替換成 preact
            react: 'preact-compat',
            'react-dom': 'preact-compat',
          },
        },
      },
    ];
    return merge.smart(customizeConfig);
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
