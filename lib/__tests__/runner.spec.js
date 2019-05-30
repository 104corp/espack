/* eslint-disable */
import ora from 'ora';
import webpack from 'webpack';
import runner from '../register';
import config from '../config';

jest.unmock('../config');
jest.mock('fs-extra');
jest.mock('webpack');
jest.mock('mini-css-extract-plugin');
jest.mock('uglifyjs-webpack-plugin');
jest.mock('opener');
jest.mock('ora');
jest.mock('webpack-dev-server');

describe('runner.js', () => {
  it('development 驗證', done => {
    const spinner = ora(config.CLI_DEV_TITLE).start();
    spinner.then(() => {
      expect(webpack).toHaveBeenCalled();
      expect(runner.dev).toBe(true);

      runner.setCustomConfig({
        ignorePages: () => {},
        outputFileName: {
          js: '[name].js?v2019.[chunkhash:5]',
          css: '[name].css?v2019.[contenthash:5]',
        },
        pagesFolder: 'src/appPages',
      });

      const { ignorePagesRule, outputFileName, pagesFolder, ejsFolder } = config.getConfigOptions();
      expect(typeof ignorePagesRule).toBe('function');
      expect(outputFileName).toEqual({
        js: '[name].js?v2019.[hash:5]',
        css: '[name].css?v2019.[contenthash:5]',
      });
      expect(pagesFolder).toBe('src/appPages');
      expect(ejsFolder).toBe('src/appPages');

      done();
    });
    runner.start({
      dev: true,
      port: '8888',
      viewsFolder: config.VIEW_ROOT,
      staticFolder: config.STATIC_ROOT,
      cssAssetsPath: config.CSS_ASSETS_PATH,
      baseTag: config.BASE_TAG,
      spinner
    });
  });


  it('production 驗證', done => {
    const spinner = ora(config.CLI_BUILD_TITLE).start();
    spinner.then(() => {
      expect(webpack).toHaveBeenCalled();
      expect(webpack.run).toHaveBeenCalled();
      expect(runner.dev).toBe(false);
      done();
    });
    runner.start({
      dev: false,
      dropConsole: false,
      viewsFolder: config.VIEW_ROOT,
      staticFolder: config.STATIC_ROOT,
      cssAssetsPath: config.CSS_ASSETS_PATH,
      baseTag: config.BASE_TAG,
      spinner
    });
  });
});