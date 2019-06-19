import './App.scss';
import $ from "jquery";
import packageJSON from '@104corp/espack/package.json';

const version = packageJSON.version;

console.log(
  `%c espack %c v${version} %c`,
  'background:#555 ; padding: 2px; border-radius: 3px 0 0 3px;  color: #fff',
  'background:#007ec6; padding: 2px; border-radius: 0 3px 3px 0;  color: #fff',
  'background:transparent',
);

const titleDOM = $('h1');
$('h1').text(`${titleDOM.text()} v${version}`);
