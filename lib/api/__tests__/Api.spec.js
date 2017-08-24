import chalk from 'chalk';
import CSSExtractPlugin from '../plugins/CSSExtractPlugin';
import { setConfigOptions } from '../../config';
import Api from '../Api';
import BabelTask from '../tasks/BabelTask';

describe('API static 驗證', () => {
  beforeEach(() => {
    setConfigOptions({
      dev: false,
      dropConsole: false,
      port: '8888',
      viewsFolder: '__views__',
      staticFolder: '__static__',
      pagesFolder: 'src/pages',
      ejsFolder: 'src/pages',
      cssAssetsPath: '',
      baseTag: '/',
      workDirectory: '/',
    });
    global.console.log = jest.fn();
  });


  it('transformChunkName', () => {
    let name = Api.transformChunkName('module');
    expect(name).toBe('__static__/js/module');

    name = Api.transformChunkName('/module');
    expect(name).toBe('__static__/js/module');

    name = Api.transformChunkName('__static__/js/module');
    expect(name).toBe('__static__/js/module');
  });


  it('transformCssName', () => {
    let name = Api.transformCssName('module');
    expect(name).toBe('__static__/js/module');

    name = Api.transformCssName('/module');
    expect(name).toBe('__static__/js/module');

    name = Api.transformCssName('/__static__/css/module');
    expect(name).toBe('__static__/js/module');
  });


  it('log', () => {
    Api.log('test');
    expect(console.log).toHaveBeenLastCalledWith(`${chalk.black.bgRed(' WARN ')} ${chalk.red('test')}`);

    Api.log('test', 'other');
    expect(console.log).toHaveBeenLastCalledWith(chalk.red('test'));
  });


  it('addEventCallbackPlugin', () => {
    const thenFn = jest.fn();
    const task = new BabelTask({
      src: './src/module.js',
      output: 'module',
    });
    const cssExtractPlugin = new CSSExtractPlugin(Api.transformCssName('style'));
    const api = {
      config: {
        plugins: [cssExtractPlugin],
      },
      buildCallbackList: [thenFn],
      tasks: [task],
    };

    Api.addEventCallbackPlugin(api);
    expect(Object.prototype.hasOwnProperty.call(api, 'eventCallbackPlugin')).toBeTruthy();
    expect(api.config.plugins.length).toBe(2);

    const assets = { '__static__/js/style.js': { size: 1, emitted: true } };
    const emitCompiler = {
      hooks: {
        emit: {
          tap: (event, callback) => callback.call(null, { assets }, jest.fn()),
        },
      },
    };

    const doneCompiler = {
      hooks: {
        done: {
          tap: (event, callback) => callback.call(null, 'then stats'),
        },
      },
    };
    // 模擬 webpack 呼叫方式
    api.config.plugins[0].apply(emitCompiler);
    expect(assets).toEqual({});

    api.config.plugins[1].apply(doneCompiler);
    expect(thenFn).toHaveBeenLastCalledWith('then stats');
    expect(task.savePath).toBe('/dist/__static__/js/module.js');
    expect(task.files).toEqual(['./src/module.js']);
    expect(task.isStarted).toBeTruthy();
  });
});
