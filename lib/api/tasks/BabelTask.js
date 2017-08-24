const babel = require('@babel/core');
const fse = require('fs-extra');
const path = require('path');
const concatenate = require('concatenate');
const Task = require('./Task');
const { getConfigOptions } = require('../../config');


class BabelTask extends Task {
  run() {
    if (this.isStarted) return;

    super.run(false);

    this.readBabelrc();
    this.save();
  }

  readBabelrc() {
    const { babelrc, workDirectory } = getConfigOptions();

    this.babelrc = babelrc;

    if (this.data.options) {
      if ((typeof this.data.options === 'object') && (this.data.options !== null)) {
        this.babelrc = this.data.options;
      } else if (typeof this.data.options === 'string') {
        try {
          this.babelrc = JSON.parse(this.data.options);
        } catch (e) {
          const babelrcPath = path.join(workDirectory, this.data.options);
          if (fse.existsSync(babelrcPath) && fse.statSync(babelrcPath).isFile()) {
            this.babelrc = JSON.parse(fse.readFileSync(babelrcPath, 'utf8'));
          }
        }
      }
    }
  }

  save() {
    const contents = concatenate.sync(this.files, this.savePath);
    const { code } = babel.transform(contents, this.babelrc);
    super.minify(code);
  }
}

module.exports = BabelTask;
