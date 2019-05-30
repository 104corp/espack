import { util } from '../webpack.base.config';
import config from '../config';

jest.unmock('../config');
jest.mock('fs-extra');
jest.mock('glob');

describe('webpack.base.config.js', () => {
  beforeEach(() => {
    require('glob').__setMockFiles([ // eslint-disable-line no-underscore-dangle, global-require
      'src/pages/index.js',
    ]);
  });

  config.setConfigOptions({
    workDirectory: '/Users/project/espack',
  });

  const { workDirectory } = config.getConfigOptions();

  it('util.scanFolder 驗證', () => {
    expect(util.scanFolder({ rootPath: config.PAGE_FOLDER })).toEqual(['src/pages/index.js']);

    config.setConfigOptions({
      ignorePagesRule: () => true,
    });

    expect(util.scanFolder({ rootPath: config.PAGE_FOLDER })).toEqual(['src/pages/index.js']);
  });

  it('util.checkSlash 驗證', () => {
    expect(util.checkSlash('/img/pic.png')).toBeTruthy();
    expect(util.checkSlash('/img/pic.png', 'end')).not.toBeTruthy();
    expect(util.checkSlash('//www.site.com/')).toBeTruthy();
    expect(util.checkSlash('//www.site.com/', 'end')).toBeTruthy();
    expect(util.checkSlash('pic.png')).not.toBeTruthy();
    expect(util.checkSlash('pic.png', 'end')).not.toBeTruthy();
    expect(util.checkSlash('/img/')).toBeTruthy();
    expect(util.checkSlash('/img/', 'end')).toBeTruthy();
  });

  it('util.checkHttp 驗證', () => {
    expect(util.checkHttp('http://www.site.com/')).toBeTruthy();
    expect(util.checkHttp('https://www.site.com/')).toBeTruthy();
    expect(util.checkHttp('//www.site.com/')).toBeTruthy();
    expect(util.checkHttp('www.site.com/')).not.toBeTruthy();
  });

  it('util.processImgsPath 驗證', () => {
    // 圖檔位於 STATIC_ROOT 中
    expect(util.processImgsPath({
      file: '/Users/project/espack/public/img/pic.png',
      staticFolder: config.STATIC_ROOT,
      workDirectory,
      publicFolder: config.PUBLIC_FOLDER,
    })).toEqual('img/pic.png');

    // 圖檔來自 node_modules
    expect(util.processImgsPath({
      file: '/Users/project/espack/node_modules/bootstrap-sass/assets/fonts/bootstrap/glyphicons-halflings-regular.svg',
      staticFolder: config.STATIC_ROOT,
      workDirectory,
      publicFolder: config.PUBLIC_FOLDER,
    })).toEqual('bootstrap-sass/bootstrap/glyphicons-halflings-regular.svg');

    // 圖檔不在指定 STATIC_ROOT 中  espack dev -s __static__
    expect(util.processImgsPath({
      file: '/Users/project/espack/public/img/pic.png',
      staticFolder: '__static__',
      workDirectory,
      publicFolder: config.PUBLIC_FOLDER,
    })).toEqual('__static__/img/pic.png');

    // 圖檔不在指定 STATIC_ROOT 中
    expect(util.processImgsPath({
      file: '/Users/project/espack/src/scss/test.png',
      staticFolder: config.STATIC_ROOT,
      workDirectory,
      publicFolder: config.PUBLIC_FOLDER,
    })).toEqual('scss/test.png');

    // espack dev -s .
    expect(util.processImgsPath({
      file: '/Users/project/espack/src/scss/test.png',
      staticFolder: '.',
      workDirectory,
      publicFolder: config.PUBLIC_FOLDER,
    })).toEqual('scss/test.png');
  });

  it('util.processFontsPath 驗證', () => {
    // 字型來自 node_modules
    expect(util.processFontsPath(
      '/Users/project/espack/node_modules/bootstrap-sass/assets/fonts/bootstrap/glyphicons-halflings-regular.svg',
      config.STATIC_ROOT,
    )).toEqual('fonts/vendor/bootstrap-sass/bootstrap/glyphicons-halflings-regular.svg');

    // 字型在自己專案中
    expect(util.processFontsPath(
      '/Users/project/espack/public/__static__/fonts/glyphicons-halflings-regular.svg',
      config.STATIC_ROOT,
    )).toEqual('fonts/[name].[ext]');

    // espack dev -s __static__
    expect(util.processFontsPath(
      '/Users/project/espack/public/__static__/fonts/glyphicons-halflings-regular.svg',
      '__static__',
    )).toEqual('__static__/fonts/[name].[ext]');
  });

  it('util.moduleFilename 驗證', () => {
    expect(
      util.moduleFilename({ css: '[name].css?v2018.[contenthash:5]' })({ name: './js/a/b/c/js' }),
    ).toEqual('./css/a/b/c/js.css?v2018.[contenthash:5]');

    expect(
      util.moduleFilename({ css: '[name].css?v2018.[contenthash:5]' })({ name: './js/name' }),
    ).toEqual('./css/name.css?v2018.[contenthash:5]');

    expect(
      util.moduleFilename({ css: 'app-[name].css?v2018.[contenthash:5]' })({ name: './js/a/b/c/js' }),
    ).toEqual('./css/a/b/c/app-js.css?v2018.[contenthash:5]');
  });
});
