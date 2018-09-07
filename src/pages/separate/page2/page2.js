import Trace, { sum } from '../../../module/Trace';

require('./page2.scss');

const trace = new Trace();
const { $ } = window;

/**
 * sleep, delay 一下再進行
 * @param {number} ms 延遲毫秒
 * @return {Promise}
 */
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const show = (msg) => {
  const text = `async await ${msg}`;
  trace.log(text);
  $('#console').text(text);
};

async function step() {
  await sleep(1000);
  show(sum(1, 0));

  await sleep(1000);
  show(sum(1, 1));

  await sleep(1000);
  show(sum(2, 1));

  await sleep(1000 * 3);
  step();
}
step();

if (module.hot) {
  // 當狀態改變(任何檔案儲存)就重整頁面，密集修改 css, ejs 時可以暫時使用這方式自動重整
  // 生產階段發佈時這些會被自動移除
  module.hot.addStatusHandler((state) => {
    if (state === 'dispose') window.location.reload();
  });
}
