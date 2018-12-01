import CSSExtractRenamePlugin from '../CSSExtractRenamePlugin';

const { INFO_CHUNK_NAME } = require('../../../config');

describe('CSSExtractRenamePlugin', () => {
  it('CSSExtractRenamePlugin 模擬情境', () => {
    const cssExtractRenamePlugin = new CSSExtractRenamePlugin();
    const compilation = {
      chunks: [{
        id: INFO_CHUNK_NAME,
        files: [
          `js/${INFO_CHUNK_NAME}.css?wwww`,
          `js/${INFO_CHUNK_NAME}.css.map?wwww`,
          `js/${INFO_CHUNK_NAME}.js?wwww`,
        ],
      }, {
        id: 'js/style',
        files: [
          'js/style.css?wwww',
          'js/style.css.map?wwww',
          'js/style.js?wwww',
          'js/style.js.map',
        ],
      }],
      assets: {
        'js/style.js?wwww': { size: 1, emitted: true },
        'js/style.js.map?wwww': { size: 1, emitted: true },
        'js/style.css?wwww': { size: 1, emitted: true },
        'js/style.css.map': { size: 1, emitted: true },
      },
    };
    const emitCompiler = {
      hooks: {
        shouldEmit: {
          tap: (plugin, callback) => callback.call(null, compilation),
        },
      },
    };
    // 模擬 webpack 呼叫方式
    cssExtractRenamePlugin.apply(emitCompiler);
    // 結果會移除同一 chunkName 的 js 資源
    expect(compilation).toEqual({
      chunks: [{
        id: '__about__',
        files: [
          'js/__about__.css?wwww',
          'js/__about__.css.map?wwww',
          'js/__about__.js?wwww',
        ],
      }, {
        id: 'js/style',
        files: [
          'css/style.css?wwww',
          'css/style.css.map?wwww',
          'js/style.js?wwww',
          'js/style.js.map',
        ],
      }],
      assets: {
        'js/style.js.map?wwww': { emitted: true, size: 1 },
        'js/style.js?wwww': { emitted: true, size: 1 },
        'css/style.css?wwww': { size: 1, emitted: true },
        'css/style.css.map': { size: 1, emitted: true },
      },
    });
  });
});
