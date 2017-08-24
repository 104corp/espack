import webpackConfig from '../webpack.config';
import { setConfigOptions, OUTPUT_FILE_NAME } from '../config';

jest.mock('../config');
jest.mock('fs-extra');
jest.mock('glob');
jest.mock('webpack');
jest.mock('mini-css-extract-plugin');
jest.mock('uglifyjs-webpack-plugin');

describe('webpack.config.js', () => {
  beforeEach(() => {
    require('glob').__setMockFiles([ // eslint-disable-line no-underscore-dangle, global-require
      'src/pages/index.js',
    ]);
    setConfigOptions({
      workDirectory: '/',
      outputFileName: { ...OUTPUT_FILE_NAME },
    });
  });

  it('production config 驗證', () => {
    const config = webpackConfig({ dev: false, dropConsole: false });
    expect(config).toMatchSnapshot();
  });

  it('development config 驗證', () => {
    const config = webpackConfig({ dev: true });
    expect(config).toMatchSnapshot();
  });
});
