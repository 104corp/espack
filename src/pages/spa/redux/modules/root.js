import { combineEpics } from 'redux-observable';
import { combineReducers } from 'redux';
import { fetchAPIEpic, fetchAPIState } from './fetchAPI';
import { reactStar } from './reactStar';
import { processing } from './processing';

export const rootEpic = combineEpics(fetchAPIEpic);

export const rootReducer = combineReducers({
  fetchAPIState,
  processing,
  reactStar,
});
