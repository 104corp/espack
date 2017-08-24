import packageJSON from '../../package.json';

console.log(
  `%c espack %c v${packageJSON.version} %c`,
  'background:#555 ; padding: 2px; border-radius: 3px 0 0 3px;  color: #fff',
  'background:#007ec6; padding: 2px; border-radius: 0 3px 3px 0;  color: #fff',
  'background:transparent',
);
