const chokidar = require('chokidar');
const path = require('path');
const fse = require('fs-extra');
const concatenate = require('concatenate');
const terser = require('terser');
const glob = require('glob');
const { BUILD_FOLDER, TMP_BUILD_FOLDER, getConfigOptions } = require('../../config');

class Task {
  constructor(data) {
    this.data = data;
    this.isStarted = false;
  }

  /**
   * 搜尋所有 js，路徑如果是資料夾就繼續往內查找
   * @param {string|string[]} src
   * @return {Array} JS 路徑列表
   */
  getFiles(src) {
    let files = [];
    if (Array.isArray(src)) {
      src.forEach((value) => {
        if (fse.existsSync(value)) {
          const stats = fse.statSync(value);
          if (stats.isFile()) {
            // File
            files.push(value);
          } else if (stats.isDirectory()) {
            // Folder
            const folderFiles = glob.sync(`${value}/**/*.js`, { nodir: true });
            files = files.concat(this.getFiles(folderFiles));
          }
        }
      });
    } else if (typeof src === 'string') {
      files = files.concat(this.getFiles([src]));
    }
    return files;
  }

  watch(watch = false) {
    if (!watch) return;

    const watcher = chokidar.watch(this.files, { usePolling: false, persistent: true })
      .on('change', this.onChange);

    // https://github.com/paulmillr/chokidar/issues/591
    watcher.on('raw', (event) => {
      if (event === 'rename') {
        watcher.unwatch(this.files);
        watcher.add(this.files);
      }
    });
  }

  onChange = (updatedFile) => { // eslint-disable-line no-unused-vars
    this.save();
  }

  run(save = true) {
    if (this.isStarted) return;

    const { workDirectory, dev, espackDirectory } = getConfigOptions();

    this.isStarted = true;

    this.files = this.getFiles(this.data.src);

    this.watch(dev);

    let savePath = require('../Api').transformChunkName(this.data.output); // eslint-disable-line global-require
    savePath = /.js$/i.test(savePath) ? savePath : `${savePath}.js`;
    if (dev) {
      savePath = path.join(espackDirectory, TMP_BUILD_FOLDER, savePath);
    } else {
      savePath = path.join(workDirectory, BUILD_FOLDER, savePath);
    }
    this.savePath = savePath;

    fse.ensureDirSync(path.dirname(this.savePath));

    if (save) this.save();
  }

  save() {
    const contents = concatenate.sync(this.files, this.savePath);
    this.minify(contents);
  }

  minify(code) {
    const { dev, dropConsole } = getConfigOptions();
    let buildCode = code;
    if (!dev) {
      const result = terser.minify(buildCode, {
        warnings: false,
        compress: {
          drop_console: dropConsole,
        },
        output: {
          comments: false,
        },
        ie8: true,
        safari10: true,
      });
      if (result.error) console.log(result.error);
      buildCode = result.code;
    }
    fse.writeFileSync(this.savePath, buildCode);
  }
}

module.exports = Task;
