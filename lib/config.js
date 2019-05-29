const config = {
  // shared variable
  options: {},

  setConfigOptions(options) {
    this.options = { ...this.options, ...options };
  },

  getConfigOptions() {
    return this.options;
  },


  // env production
  ENV_PRODUCTION: 'production',

  // env development
  ENV_DEVELOPMENT: 'development',

  // source folder
  SRC_FOLDER: 'src',

  // Default main program (entry) folder
  PAGE_FOLDER: 'src/pages',

  // ejs template source folder
  EJS_FOLDER: 'src/pages',

  // static folder, jpg, png, css, js...
  PUBLIC_FOLDER: 'public',

  // output root folder of production mode
  BUILD_FOLDER: 'dist',

  // development stage temporary release folder
  TMP_BUILD_FOLDER: '.tmp/build',

  // default template of ejs
  DEFAULT_TEMPLATE: `${__dirname}/template/_default.ejs`,

  // main program of default entry list, show information of espack
  DEFAULT_JS: `${__dirname}/template/_about.js`,

  // chunk name of default entry list page
  INFO_CHUNK_NAME: '__about__',

  // output root folder of static resource
  STATIC_ROOT: '.',

  // resource path for CSS
  CSS_ASSETS_PATH: '/',

  // output root folder of HTML
  VIEW_ROOT: '.',

  // config merge file
  CONFIG_MERGE_JS: 'espack.config.js',

  // <base href="<%= baseTag %>"> - base tag setting
  BASE_TAG: '/',

  // CLI Build Title
  CLI_BUILD_TITLE: 'Bundling',

  // CLI Dev Title
  CLI_DEV_TITLE: 'Starting',

  // output Fonts folder
  FONTS_FOLDER: 'fonts',

  // ignore pages rule
  IGNORE_PAGES_RULE: ['**/_*.js'],

  // output filename rule - production mode only
  // because chunkhash is not allowed under devServer hmr
  OUTPUT_FILE_NAME: {
    js: '[name].js?[chunkhash:8]',
    css: '[name].css?[contenthash:8]',
  },

};

config.setConfigOptions = config.setConfigOptions.bind(config);
config.getConfigOptions = config.getConfigOptions.bind(config);

module.exports = config;
