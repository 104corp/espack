import CSSExtractPlugin from '../CSSExtractPlugin';

describe('CSSExtractPlugin', () => {
  it('CSSExtractPlugin 模擬情境', () => {
    const cssExtractPlugin = new CSSExtractPlugin('js/style');
    const compilation = {
      assets: {
        'js/style.js?wwww': { size: 1, emitted: true },
        'js/style.js.map?wwww': { size: 1, emitted: true },
        'js/page.js?hhhh': { size: 1, emitted: true },
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
    cssExtractPlugin.apply(emitCompiler);
    // 結果會移除同一 chunkName 的 js 資源
    expect(compilation.assets).toEqual({
      'js/page.js?hhhh': { size: 1, emitted: true },
    });
  });
});
