import {
  createStore,
  applyMiddleware,
  compose,
  combineReducers,
} from 'redux';
import { createEpicMiddleware, combineEpics } from 'redux-observable';
import { fetchAPIEpic, fetchAPIState } from './modules/fetchAPI';
import { reactStar } from './modules/reactStar';
import { processing } from './modules/processing';

export const rootEpic = combineEpics(fetchAPIEpic);

export const rootReducer = combineReducers({
  fetchAPIState,
  processing,
  reactStar,
});

const epicMiddleware = createEpicMiddleware(rootEpic);
/* eslint-disable no-underscore-dangle */
const composeEnhancers = process.env.NODE_ENV === 'development'
  && typeof window === 'object'
  && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}) : compose;
/* eslint-enable */

export default function configureStore() {
  const store = createStore(
    rootReducer,
    composeEnhancers(applyMiddleware(epicMiddleware)),
  );
  return store;
}
