const ora = jest.fn(() => ora);

ora.start = () => ora;
ora.render = () => ora;
ora.stop = () => {
  if (typeof ora.callback === 'function') ora.callback.call();
};
ora.then = (callback) => {
  ora.callback = callback;
};
ora.text = '';

module.exports = ora;
