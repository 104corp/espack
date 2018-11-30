/* eslint-disable */
/**
 * IE8 issue
 *
 * 使用第三方 library 時在 IE8 環境中測試，當直接 import 無法正常時可以改用 require 試試
 * 如果 require 也無法那建議直接於頁面中引入 <script src='...'></script>
 * 通常這樣也有 broswer cache 的好處
 * 例如：import $ from 'jquery'; 在 IE8 中會出錯
 *
 * IE8 環境中當某個 js 中沒有 export default 任何東西時，例如 requestAnimationFrame.js 的情況
 * 請使用 require('../module/requestAnimationFrame'); 來執行它
 * 或是改寫使用 export default 才能使用 import 來導入 module
 *
 * IE8 中不要想將 image require 進來使用，請放在外部檔案，因為會出錯
 * import img from 'url-loader!xx.jpg';
 * $('#root').html(`<img src="${img}" width="100" height="100" />`);
 *
 */
/* eslint-enable */


require('./page1.scss');

const { $, moment } = window;

function loop() {
  $('#ie8').html(`Hi IE8~ ${moment().format()}`);
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
