import './App.scss';

const version = '{{version}}';

console.log(
  `%c espack %c v${version} %c`,
  'background:#555 ; padding: 2px; border-radius: 3px 0 0 3px;  color: #fff',
  'background:#007ec6; padding: 2px; border-radius: 0 3px 3px 0;  color: #fff',
  'background:transparent',
);

const titleDOM = document.querySelectorAll('h1')[0];
titleDOM.innerHTML = `${titleDOM.innerHTML} v${version}`;

// ========================================
// Browser auto reload in development mode.
// ========================================
if (module.hot) {
  module.hot.addStatusHandler((state) => {
    if (state === 'dispose') window.location.reload(); // for ejs & scss reload
  });
}
