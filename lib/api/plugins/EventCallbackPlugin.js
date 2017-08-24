class EventCallbackPlugin {
  /**
   * Create a new plugin instance.
   *
   * @param {Function} callback
   */
  constructor(callback) {
    this.callback = callback;
  }


  /**
   * Apply the plugin.
   *
   * @param {Object} compiler
   */
  apply(compiler) {
    this.callback.call(null, 'apply');

    compiler.hooks.done.tap('EventCallbackPlugin', (stats) => {
      this.callback.call(null, 'done', stats);
    });
  }
}

module.exports = EventCallbackPlugin;
