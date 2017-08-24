const config = {
  options: {},
  setConfigOptions(options) {
    this.options = { ...this.options, ...options };
  },
  getConfigOptions() {
    return this.options;
  },
  ENV_PRODUCTION: 'production',
  ENV_DEVELOPMENT: 'development',
  SRC_FOLDER: 'src',
  PAGE_FOLDER: 'src/pages',
  EJS_FOLDER: 'src/pages',
  PUBLIC_FOLDER: 'public',
  BUILD_FOLDER: 'dist',
  TMP_BUILD_FOLDER: '.tmp/build',
  DEFAULT_TEMPLATE: '/template/_default.ejs',
  DEFAULT_JS: '/template/_about.js',
  INFO_CHUNK_NAME: '__about__',
  STATIC_ROOT: '.',
  CSS_ASSETS_PATH: '',
  VIEW_ROOT: '.',
  CONFIG_MERGE_JS: 'espack.config.js',
  BASE_TAG: '/',
  CLI_BUILD_TITLE: 'Bundling',
  CLI_DEV_TITLE: 'Starting',
  FONTS_FOLDER: 'fonts',
  IGNORE_PAGES_RULE: ['**/_*.js'],
  OUTPUT_FILE_NAME: {
    js: '[name].js?[chunkhash:8]',
    css: '[name].css?[contenthash:8]',
  },
};

config.setConfigOptions = config.setConfigOptions.bind(config);
config.getConfigOptions = config.getConfigOptions.bind(config);

module.exports = config;
