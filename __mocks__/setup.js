/* eslint-disable */
const localStorageMock = (() => {
  let store = {};
  return {
    getItem(key) {
      return store[key];
    },
    setItem(key, value) {
      store[key] = value.toString();
    },
    removeItem(key) {
      delete store[key];
    },
    clear() {
      store = {};
    }
  };
})();

global.requestAnimationFrame = function(callback) {
  setTimeout(callback);
};

global.localStorage = localStorageMock;
// global.__DEV__ = true;