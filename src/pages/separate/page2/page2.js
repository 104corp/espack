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
