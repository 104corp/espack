module.exports = {
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
