import React from 'react';
import ReactDOM from 'react-dom';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
  Link,
} from 'react-router-dom';

import './App.scss';
import packageJSON from '../../package.json';

const version = packageJSON.devDependencies['@104corp/espack'].replace(/\^/, '');

function Index() {
  return <h2 className="shadow retroshadow">Home</h2>;
}

function Page() {
  return <h2 className="shadow retroshadow">Page</h2>;
}

ReactDOM.render(
  <Router>
    <header>
      <h1>
        @104corp/espack v
        { version }
      </h1>
    </header>
    <ul>
      <li>
        <Link to="/">Home</Link>
      </li>
      <li>
        <Link to="/page">Page</Link>
      </li>
    </ul>
    <hr />
    <Switch>
      <Route exact path="/" component={Index} />
      <Route path="/page" component={Page} />
      <Redirect from="/*" to="/" />
    </Switch>
  </Router>,
  document.getElementById('root'),
);
