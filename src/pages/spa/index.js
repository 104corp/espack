/**
 * 簡易 React SPA 範例，目的是示範如何設定專案，express route 請參閱 espack.config.js
 * component 可使用 .jsx 或 .js ，/src/page 之下預設會將 *.js 都當作頁面，
 * 如使用 .js 需於 espack.config.js 設定排除規則 ignorePage: ['spa/component/*.js']
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import configureStore from './redux/configureStore';
import Nav from './component/Nav';
import Page3 from './component/Page3';
import Page4 from './component/Page4';

import { getReactStar } from './redux/modules/reactStar';


const store = configureStore();
store.dispatch(getReactStar());

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <div className="layout">
        <Helmet>
          <html lang="en" />
          <meta name="description" content="SPA" />
          <title>
            SPA
          </title>
          <style type="text/css">
            {
              'h1 { color: #607d8b; }'
            }
          </style>
        </Helmet>
        <Route path="*" component={Nav} />
        <Switch>
          <Route path="/spa/page3" component={Page3} />
          <Route path="/spa/page4" component={Page4} />
          <Route path="/spa" component={Page3} />
        </Switch>
      </div>
    </Router>
  </Provider>,
  document.getElementById('root'),
);
