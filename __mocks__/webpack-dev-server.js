const webpackDevServer = jest.fn(() => jest.genMockFromModule('webpack-dev-server'));

webpackDevServer.listen = jest.fn();
webpackDevServer.app = { use: jest.fn() };

module.exports = webpackDevServer;
