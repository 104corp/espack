import packageJSON from '../../package.json';

const version = packageJSON.devDependencies['@104corp/espack'].replace(/\^/, '');
export { version };
