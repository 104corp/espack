const webpack = jest.fn(() => {
  const mockWebpack = jest.genMockFromModule('webpack');
  mockWebpack.run = webpack.run;
  return mockWebpack;
});

webpack.optimize = {
  UglifyJsPlugin: options => options,
};


// webpack.DefinePlugin = options => options;
webpack.HotModuleReplacementPlugin = options => options;
webpack.HashedModuleIdsPlugin = options => options;
webpack.ProgressPlugin = (callback) => {
  setTimeout(callback.bind(null, 1), 100);
  return { apply: jest.fn() };
};

webpack.plugin = options => options;
webpack.validateSchema = options => options;
webpack.watch = options => options;
webpack.run = jest.fn((callback) => {
  setTimeout(callback.bind(null, undefined, { startTime: 0, endTime: 100 }), 100);
});

module.exports = webpack;
