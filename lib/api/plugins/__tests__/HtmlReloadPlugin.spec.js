import HtmlReloadPlugin from '../HtmlReloadPlugin';
import { setConfigOptions, getConfigOptions } from '../../../config';

describe('HtmlReloadPlugin', () => {
  beforeEach(() => {
    setConfigOptions({
      devServer: {
        sockets: 'sockets',
        sockWrite: jest.fn(),
      },
    });
  });


  it('HtmlReloadPlugin 模擬情境', () => {
    const { devServer } = getConfigOptions();
    const htmlReloadPlugin = new HtmlReloadPlugin();
    let htmlReloadPluginCallback;
    const compilation = {
      hooks: {
        htmlWebpackPluginAfterEmit: {
          tap: (plugin, callback) => {
            htmlReloadPluginCallback = callback;
          },
        },
      },
    };
    const emitCompiler = {
      hooks: {
        emit: {
          tap: (plugin, callback) => callback.call(null, compilation),
        },
      },
    };
    // 模擬 webpack 呼叫方式
    htmlReloadPlugin.apply(emitCompiler);

    //
    htmlReloadPluginCallback({
      outputName: 'index.html',
      html: {
        source: () => '<!DOCTYPE html><html><body></body></html>',
        size: () => 10,
      },
    });
    htmlReloadPluginCallback({
      outputName: 'page.html',
      html: {
        source: () => '<!DOCTYPE html><html><body></body></html>',
        size: () => 10,
      },
    });
    expect(devServer.sockWrite.mock.calls.length).toBe(0);

    //
    htmlReloadPluginCallback({
      outputName: 'index.html',
      html: {
        source: () => '<!DOCTYPE html><html><body></body></html>',
        size: () => 10,
      },
    });
    htmlReloadPluginCallback({
      outputName: 'page.html',
      html: {
        source: () => '<!DOCTYPE html><html><body></body></html>',
        size: () => 10,
      },
    });
    expect(devServer.sockWrite.mock.calls.length).toBe(0);

    // change
    htmlReloadPluginCallback({
      outputName: 'index.html',
      html: {
        source: () => '<!DOCTYPE html><html><body></body></html>',
        size: () => 10,
      },
    });
    htmlReloadPluginCallback({
      outputName: 'page.html',
      html: {
        source: () => '<!DOCTYPE html><html><body>11</body></html>',
        size: () => 11,
      },
    });
    expect(devServer.sockWrite.mock.calls.length).toBe(1);
    expect(devServer.sockWrite.mock.calls[0]).toEqual(['sockets', 'content-changed']);

    // change
    htmlReloadPluginCallback({
      outputName: 'index.html',
      html: {
        source: () => '<!DOCTYPE html><html><body></body></html>',
        size: () => 10,
      },
    });
    htmlReloadPluginCallback({
      outputName: 'page.html',
      html: {
        source: () => '<!DOCTYPE html><html><body>12</body></html>',
        size: () => 12,
      },
    });
    expect(devServer.sockWrite.mock.calls.length).toBe(2);
    expect(devServer.sockWrite.mock.calls[1]).toEqual(['sockets', 'content-changed']);
  });
});
