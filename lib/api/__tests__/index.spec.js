import HtmlWebpackPlugin from 'html-webpack-plugin';
import espack from '../index';
import webpackConfig from '../../webpack.config';
import CSSExtractPlugin from '../plugins/CSSExtractPlugin';
import EventCallbackPlugin from '../plugins/EventCallbackPlugin';
import { setConfigOptions, OUTPUT_FILE_NAME, INFO_CHUNK_NAME } from '../../config';
import presetStage from '../../babel/preset-stage';

jest.unmock('../../config');
jest.mock('fs-extra');
jest.mock('glob');
jest.unmock('webpack');
jest.mock('mini-css-extract-plugin');
jest.mock('uglifyjs-webpack-plugin');

require('glob').__setMockFiles([ // eslint-disable-line no-underscore-dangle, global-require
  'src/pages/index.js',
]);

global.console.log = jest.fn();
const Api = espack.constructor;
jest.spyOn(Api, 'log');


describe('API 需要先提供 config 驗證', () => {
  beforeEach(() => {
    setConfigOptions({
      dev: false,
      dropConsole: false,
      port: '8888',
      viewsFolder: '.',
      staticFolder: '.',
      pagesFolder: 'src/pages',
      ejsFolder: 'src/pages',
      cssAssetsPath: '',
      baseTag: '/',
      workDirectory: '/',
      outputFileName: { ...OUTPUT_FILE_NAME },
    });
  });


  it('config 驗證', () => {
    espack.processCssUrls(true);
    expect(Api.log.mock.calls.length).toBe(2);

    espack.processCSSUrls(true);
    expect(Api.log.mock.calls.length).toBe(3);

    espack.resetPageRoute(route => route);
    expect(Api.log.mock.calls.length).toBe(4);

    espack.htmlChunks(chunks => chunks);
    expect(Api.log.mock.calls.length).toBe(5);

    espack.htmlPluginOptions(option => option);
    expect(Api.log.mock.calls.length).toBe(6);

    espack.extract(['react'], 'common', 'all');
    expect(Api.log.mock.calls.length).toBe(7);

    espack.js('./src/module.js', 'module');
    expect(Api.log.mock.calls.length).toBe(8);

    espack.css('./src/scss/common.scss', 'css');
    expect(Api.log.mock.calls.length).toBe(9);

    espack.then(() => {});
    expect(Api.log.mock.calls.length).toBe(10);

    espack.babel(['./src/module.js'], 'module');
    expect(Api.log.mock.calls.length).toBe(11);

    espack.postcssOptions(option => option);
    expect(Api.log.mock.calls.length).toBe(12);
  });
});


describe('API 轉換 production config', () => {
  beforeEach(() => {
    setConfigOptions({
      dev: false,
      dropConsole: false,
      port: '8888',
      viewsFolder: '.',
      staticFolder: '.',
      pagesFolder: 'src/pages',
      ejsFolder: 'src/pages',
      cssAssetsPath: '',
      baseTag: '/',
      workDirectory: '/',
      outputFileName: { ...OUTPUT_FILE_NAME },
    });
    const config = webpackConfig({ dev: false, dropConsole: false });
    espack.setConfig(config);
  });


  it('processCSSUrls 驗證', () => {
    const { config } = espack.processCSSUrls(false);
    const rules = config.module.rules.filter(item => item.test.test('.scss') || item.test.test('.sass') || item.test.test('.less'));
    rules.forEach((rule) => {
      const cssLoader = rule.use.filter(cssRule => cssRule.loader === 'css-loader')[0];
      if (cssLoader) expect(cssLoader.options.url).toEqual(false);
    });
  });


  it('resetPageRoute 驗證', () => {
    // index >> route/index
    const { config } = espack.resetPageRoute(route => `route/${route}`);
    expect(config.entry['./js/index']).toEqual(undefined);
    expect(config.entry['./js/route/index']).toEqual(['./src/pages/index.js']);

    const htmls = [];
    config.plugins.forEach((plugin) => {
      if (plugin instanceof HtmlWebpackPlugin) {
        const option = plugin.options;
        htmls.push({
          chunks: option.chunks,
          filename: option.filename,
        });
      }
    });

    expect(htmls).toEqual([
      {
        filename: './route/index.html',
        chunks: ['./js/route/index'],
      },
    ]);
  });


  it('js 驗證', () => {
    let { config } = espack.js('./src/module.js', 'module');
    expect(config.entry['./js/module']).toEqual('./src/module.js');

    ({ config } = espack.js(['./src/module.js', './src/module.scss'], './js/module2'));
    expect(config.entry['./js/module2']).toEqual(['./src/module.js', './src/module.scss']);
  });


  it('css 驗證', () => {
    let { config } = espack.css('./src/scss/common.scss', 'css');
    expect(config.entry['./js/css']).toEqual('./src/scss/common.scss');

    const cssPlugins = config.plugins.filter(plugin => (plugin instanceof CSSExtractPlugin));
    expect(cssPlugins.length).toBe(1);
    expect(cssPlugins[0].chunkName).toBe('./js/css');

    ({ config } = espack.css(['./src/scss/common.scss', './src/less/common.less'], './css/css2'));
    expect(config.entry['./js/css2']).toEqual(['./src/scss/common.scss', './src/less/common.less']);

    const cssChunkNames = config.plugins
      .filter(plugin => (plugin instanceof CSSExtractPlugin))
      .map(plugin => plugin.chunkName);

    expect(cssChunkNames).toEqual(['./js/css', './js/css2']);
  });


  it('htmlChunks 驗證', () => {
    const { config } = espack.htmlChunks((chunks, filename) => {
      if (filename === './index.html') return chunks.concat('module');
      return chunks;
    });

    const htmls = [];
    config.plugins.forEach((plugin) => {
      if (plugin instanceof HtmlWebpackPlugin) {
        const option = plugin.options;
        htmls.push({
          chunks: option.chunks,
          filename: option.filename,
        });
      }
    });

    expect(htmls).toEqual([
      {
        chunks: ['./js/index', './js/module'],
        filename: './index.html',
      },
    ]);
  });


  it('htmlPluginOptions 驗證', () => {
    const { config } = espack.htmlPluginOptions(() => ({
      inject: false,
      minify: false,
      msg: 'Hello',
      chunks: [],
      filename: '',
      compile: false,
      template: './src/pages/index.hbs',
      excludeChunks: [1, 2, 3],
      chunksSortMode: 'manual',
      templateParameters: { params: 'test' },
    }));

    const options = [];
    config.plugins.forEach((plugin) => {
      if (plugin instanceof HtmlWebpackPlugin) {
        options.push(plugin.options);
      }
    });

    expect(options).toEqual([
      {
        chunks: ['./js/index'],
        filename: './index.html',
        baseTag: '/',
        cache: true,
        compile: true,
        favicon: false,
        hash: false,
        inject: false,
        meta: {},
        minify: false,
        msg: 'Hello',
        showErrors: true,
        template: './src/pages/index.hbs',
        excludeChunks: [1, 2, 3],
        chunksSortMode: 'manual',
        templateParameters: { params: 'test' },
        title: 'Webpack App',
        xhtml: false,
      },
    ]);
  });


  it('extract 驗證', () => {
    const { config } = espack.extract(['react', 'lodash'], 'common', 'all');
    const jsonStr = JSON.stringify(config.optimization.splitChunks.cacheGroups);
    expect(JSON.parse(jsonStr))
      .toEqual({
        default: false,
        './js/common': {
          name: './js/common',
        },
      });

    const { chunks } = config.optimization.splitChunks.cacheGroups['./js/common'];
    expect(chunks({ name: './js/page' })).toBeTruthy();
    expect(chunks({ name: INFO_CHUNK_NAME })).toBeFalsy();
    expect(chunks({ name: './js/index' })).toBeTruthy();
  });


  it('then 驗證', () => {
    const { config } = espack
      .then((stats) => { // eslint-disable-line no-unused-vars
        // stats
      })
      .then((stats) => { // eslint-disable-line no-unused-vars
        // stats
      });

    const callbackPlugin = [];
    config.plugins.forEach((plugin) => {
      if (plugin instanceof EventCallbackPlugin) {
        callbackPlugin.push(plugin);
      }
    });

    expect(callbackPlugin.length).toBe(1);
  });


  it('babel 驗證', () => {
    const babelrc = {
      presets: [
        ['@babel/preset-env', {
          targets: {
            node: 'current',
            browsers: [
              'last 4 versions',
            ],
          },
          modules: 'commonjs',
        }],
        presetStage,
      ],
    };
    espack.babel('./src/module.js', 'module', babelrc);
    expect(espack.tasks.length).toBe(1);
    expect(espack.tasks[0].isStarted).not.toBeTruthy();
    espack.tasks[0].run();
    expect(espack.tasks[0].savePath).toBe('/dist/js/module.js');
    expect(espack.tasks[0].files).toEqual(['./src/module.js']);
    expect(espack.tasks[0].isStarted).toBeTruthy();
    expect(espack.tasks[0].babelrc).toEqual(babelrc);

    const babelrc2 = {
      presets: [
        ['@babel/preset-env', {
          targets: {
            node: 'current',
            browsers: [
              'last 4 versions',
            ],
          },
          modules: 'commonjs',
        }],
        './lib/babel/preset-stage',
      ],
    };

    espack.babel('./src/module2.js', 'module2', JSON.stringify(babelrc2));
    expect(espack.tasks.length).toBe(2);
    expect(espack.tasks[1].isStarted).not.toBeTruthy();
    espack.tasks.forEach(task => task.run());
    expect(espack.tasks[1].savePath).toBe('/dist/js/module2.js');
    expect(espack.tasks[1].files).toEqual(['./src/module2.js']);
    expect(espack.tasks[1].isStarted).toBeTruthy();
    expect(espack.tasks[1].babelrc).toEqual(babelrc2);
  });

  it('postcssOptions 驗證', () => {
    const { config } = espack.postcssOptions((option) => {
      const options = {
        ...option,
        plugins: [
          ...option.plugins,
          'require(\'cssnano\')({})', // 用字串當假外掛
        ],
      };
      return options;
    });
    const { plugins } = config.module.rules.find(rule => (
      rule.test.test('.css') || rule.test.test('.less')
    )).use.filter(use => (
      use.loader === 'postcss-loader'
    ))[0].options;
    expect(plugins[plugins.length - 1]).toBe('require(\'cssnano\')({})');
  });
});


describe('API 轉換 development config', () => {
  beforeEach(() => {
    setConfigOptions({
      dev: true,
      dropConsole: false,
      port: '8888',
      viewsFolder: '.',
      staticFolder: '.',
      pagesFolder: 'src/pages',
      ejsFolder: 'src/pages',
      cssAssetsPath: '',
      baseTag: '/',
      workDirectory: '/',
      outputFileName: { ...OUTPUT_FILE_NAME },
    });
    const config = webpackConfig({ dev: true, dropConsole: false });
    espack.setConfig(config);
  });


  it('resetPageRoute 驗證', () => {
    // index >> route/index
    const { config } = espack.resetPageRoute(route => `route/${route}`);
    expect(config.entry['./js/index']).toEqual(undefined);
    expect(config.entry['./js/route/index']).toEqual([
      'webpack-dev-server/client?http://localhost:8888/',
      'webpack/hot/dev-server',
      './src/pages/index.js',
    ]);

    const htmls = [];
    const chunkList = [];
    config.plugins.forEach((plugin) => {
      if (plugin instanceof HtmlWebpackPlugin) {
        const option = plugin.options;

        if (option.chunkList) {
          chunkList.push(option.chunkList);
        }

        htmls.push({
          chunks: option.chunks,
          filename: option.filename,
        });
      }
    });

    expect(htmls).toEqual([
      {
        filename: 'index.html',
        chunks: ['__about__'],
      },
      {
        filename: './route/index.html',
        chunks: ['./js/route/index'],
      },
    ]);

    expect(chunkList).toEqual([
      [{ link: './route/index.html', text: './route/index.html' }],
    ]);
  });


  it('extract 驗證', () => {
    const { config } = espack.extract(['react', 'lodash'], 'common', ['index']);
    const jsonStr = JSON.stringify(config.optimization.splitChunks.cacheGroups);
    expect(JSON.parse(jsonStr))
      .toEqual({
        default: false,
        './js/common': {
          name: './js/common',
        },
      });

    const { chunks } = config.optimization.splitChunks.cacheGroups['./js/common'];
    expect(chunks({ name: './js/page' })).toBeFalsy();
    expect(chunks({ name: INFO_CHUNK_NAME })).toBeFalsy();
    expect(chunks({ name: './js/index' })).toBeTruthy();
  });

  it('js 已存在 chunkName 則顯示警告', () => {
    Api.log.mockReset();
    espack.js('./src/module.js', 'index');
    expect(Api.log).toHaveBeenLastCalledWith('The same chunk already exists in the entry');
  });
});
