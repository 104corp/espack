/*
  Workaround 的 Plugin，等待 mini-css-extract-plugin 增加處理 filename 能使用 function 更改輸出名稱前的作法後便棄用
  https://github.com/webpack-contrib/mini-css-extract-plugin/issues/67
*/

const { INFO_CHUNK_NAME } = require('../../config');

const REGEXP_CSS = /\.css(\.map)?$/i;

/* eslint-disable class-methods-use-this, no-param-reassign */
class CSSExtractRenamePlugin {
  apply(compiler) {
    const rename = (fileName) => {
      if (REGEXP_CSS.test(fileName.split('?')[0])) {
        const [name, ...queryString] = fileName.split('?');
        const getQueryString = qs => (qs.length > 0 ? `?${qs.join('?')}` : '');
        return `${name.replace(/js\//i, 'css/')}${getQueryString(queryString)}`;
      }
      return fileName;
    };

    compiler.hooks.shouldEmit.tap('CSSExtractRenamePlugin', (compilation) => {
      compilation.chunks.forEach((chunk) => {
        if (chunk.id !== INFO_CHUNK_NAME) {
          chunk.files = chunk.files.map(fileName => rename(fileName));
        }
      });

      const cssRename = Object.keys(compilation.assets)
        .filter(asset => REGEXP_CSS.test(asset.split('?')[0]))
        .map(asset => ({
          originName: asset,
          newName: rename(asset),
        }));

      cssRename.forEach((item) => {
        compilation.assets[item.newName] = compilation.assets[item.originName];
        delete compilation.assets[item.originName];
      });
    });
  }
}

module.exports = CSSExtractRenamePlugin;
