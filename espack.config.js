const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  webpack(config, { dev }) {
    const customConfig = config;
    if (!dev) {
      customConfig.plugins.push(new BundleAnalyzerPlugin());
    }
    return customConfig;
  }
};
