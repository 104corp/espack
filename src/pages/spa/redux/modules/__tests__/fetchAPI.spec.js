import qs from 'qs';
import nock from 'nock';
import configureMockStore from 'redux-mock-store';
import { createEpicMiddleware } from 'redux-observable';
import { processings } from '../processing';
import {
  API,
  API_ERROR,
  DEL_API_ERROR,
  FETCH_API_CANCELLED,
  delAPIError,
  cancelAllAPI,
  fetchAPIEpic,
  fetchAPIState,
} from '../fetchAPI';

let epicMiddleware = createEpicMiddleware(fetchAPIEpic);
let mockStore = configureMockStore([epicMiddleware]);
const localhost = 'https://127.0.0.1';
const apiPath = '/repos/facebook/react';
const data = qs.stringify({
  r: Date.now(),
});
let store;
const action = {
  type: API,
  payload: {
    url: `${localhost}${apiPath}`,
    method: 'POST',
    crossDomain: true,
    body: data,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  },
  ...processings({
    processingId: '#',
  }),
  cancelType: 'CANCEL_GET_RESUME_COUNT',
};


describe('fetchAPI.js', () => {
  beforeEach(() => {
    store = mockStore();
  });

  afterEach(() => {
    nock.cleanAll();
    // epicMiddleware.replaceEpic(fetchAPIEpic);
    epicMiddleware = createEpicMiddleware(fetchAPIEpic);
    mockStore = configureMockStore([epicMiddleware]);
  });


  it('fetchAPIEpic 成功', (done) => {
    function expectFun() {
      const actions = store.getActions();
      const types = actions.map((item) => {
        if (item.type === 'NEXT_ACTION') {
          return { type: item.type, count: item.count };
        }
        return { type: item.type };
      });
      expect(types).toEqual([
        { type: 'API' },
        { type: 'PROCESSING_START' },
        { type: 'NEXT_ACTION', count: 99 },
        { type: 'PROCESSING_END' },
      ]);
      done();
    }

    nock(localhost)
      .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
      // .log(console.log)
      .post(apiPath)
      // .delayBody(0)
      .reply(200, () => ({
        result: {
          statusCode: 200,
          count: 99,
        },
      }));

    store.dispatch({
      ...action,
      next: (response) => {
        setTimeout(expectFun);
        return { type: 'NEXT_ACTION', count: response.result.count };
      },
      error: () => {
        setTimeout(expectFun);
        return { type: 'ERROR_ACTION' };
      },
    });
  });


  it('fetchAPIEpic 失敗', (done) => {
    function expectFun() {
      const actions = store.getActions();
      const types = actions.map((item) => {
        if (item.type === API_ERROR) {
          return item;
        }
        return { type: item.type };
      });
      expect(types).toEqual([
        { type: 'API' },
        { type: 'PROCESSING_START' },
        {
          type: API_ERROR,
          status: 500,
          message: 'ajax error 500',
          response: {
            result: {
              errorMessage: 'XXXXX',
              statusCode: 500,
            },
          },
        },
        { type: 'ERROR_ACTION' },
        { type: 'ERROR_OTHER_ACTION' },
        { type: 'PROCESSING_END' },
      ]);
      done();
    }

    nock(localhost)
      .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
      .post(apiPath)
      .reply(500, () => ({
        result: {
          statusCode: 500,
          errorMessage: 'XXXXX',
        },
      }));

    store.dispatch({
      ...action,
      next: (response) => {
        setTimeout(expectFun);
        return { type: 'NEXT_ACTION', count: response.result.count };
      },
      error: () => {
        setTimeout(expectFun);
        return [
          { type: 'ERROR_ACTION' },
          { type: 'ERROR_OTHER_ACTION' },
        ];
      },
    });
  });


  it('fetchAPIEpic 網址不存在失敗', (done) => {
    store.dispatch({
      ...action,
      payload: {
        method: 'POST',
        crossDomain: true,
        body: data,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
      next: ({ type: 'NEXT_ACTION' }),
      error: ({ type: 'ERROR_ACTION' }),
    });

    const actions = store.getActions();
    const types = actions.map((item) => {
      if (item.type === API_ERROR) {
        return item;
      }
      return { type: item.type };
    });

    setTimeout(() => {
      expect(types).toEqual([
        { type: 'API' },
        {
          type: API_ERROR,
          status: 0,
          message: 'Missing URL',
        },
      ]);
      done();
    }, 3000);
  });


  it('fetchAPIEpic 強制取消所有 API', () => {
    nock(localhost)
      .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
      .post(apiPath)
      .reply(200, {
        result: {
          statusCode: 200,
          count: 99,
        },
      });

    store.dispatch({
      ...action,
      next: response => (
        { type: 'NEXT_ACTION', count: response.result.count }
      ),
      error: { type: 'ERROR_ACTION' },
    });
    store.dispatch(cancelAllAPI());

    const actions = store.getActions();
    const types = actions.map(item => ({ type: item.type }));
    expect(types).toEqual([
      { type: 'API' },
      { type: 'PROCESSING_START' },
      { type: 'FETCH_API_CANCELLED' },
      { type: 'PROCESSING_END' },
    ]);
  });


  it('fetchAPIEpic 強制取消特定 API', () => {
    nock(localhost)
      .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
      .post(apiPath)
      .reply(200, {
        result: {
          statusCode: 200,
          count: 99,
        },
      });

    store.dispatch({
      ...action,
      next: response => (
        { type: 'NEXT_ACTION', count: response.result.count }
      ),
      error: { type: 'ERROR_ACTION' },
    });
    store.dispatch({
      type: 'CANCEL_GET_RESUME_COUNT',
    });


    const actions = store.getActions();
    const types = actions.map(item => ({ type: item.type }));
    expect(types).toEqual([
      { type: 'API' },
      { type: 'PROCESSING_START' },
      { type: 'CANCEL_GET_RESUME_COUNT' },
      { type: 'PROCESSING_END' },
    ]);
  });


  it('fetchAPIEpic 無 processing action 時強制取消特定 API', () => {
    nock(localhost)
      .defaultReplyHeaders({ 'access-control-allow-origin': '*' })
      .post(apiPath)
      .reply(200, {
        result: {
          statusCode: 200,
          count: 99,
        },
      });

    const newAction = {
      ...action,
      next: response => (
        { type: 'NEXT_ACTION', count: response.result.count }
      ),
      error: { type: 'ERROR_ACTION' },
      cancelType: ['CANCEL_GET_RESUME_COUNT', 'CANCEL_ALL_RELEATED_RESUME_API'],
    };
    delete newAction.processingStart;
    delete newAction.processingEnd;
    store.dispatch(newAction);
    store.dispatch({
      type: 'CANCEL_ALL_RELEATED_RESUME_API',
    });


    const actions = store.getActions();
    const types = actions.map(item => ({ type: item.type }));
    expect(types).toEqual([
      { type: 'API' },
      { type: 'CANCEL_ALL_RELEATED_RESUME_API' },
    ]);
  });
});


describe('fetchAPI.js', () => {
  it('呼叫 delAPIError action', () => {
    const id = '#';
    expect(delAPIError('#')).toEqual({
      type: DEL_API_ERROR,
      id,
    });
  });


  it('呼叫 cancelAllAPI action', () => {
    expect(cancelAllAPI()).toEqual({
      type: FETCH_API_CANCELLED,
    });
  });


  it('reducer initial state', () => {
    expect(fetchAPIState(undefined, {})).toEqual([]);
  });


  it('reducer should handle API_ERROR, DEL_API_ERROR', () => {
    const errorAction = {
      type: API_ERROR,
      status: 500,
      message: 'ajax error 500',
      response: {
        result: {
          errorMessage: 'Something is wrong',
          statusCode: 500,
        },
      },
    };
    let state = [{
      ...errorAction,
      id: 1,
    }];

    // API_ERROR
    state = fetchAPIState([], errorAction);
    expect(state).toEqual([{
      ...errorAction,
      id: 1,
    }]);
    state = fetchAPIState(state, errorAction);
    expect(state).toEqual([{
      ...errorAction,
      id: 1,
    }, {
      ...errorAction,
      id: 2,
    }]);
    // DEL_API_ERROR
    state = fetchAPIState(state, delAPIError(2));
    expect(state).toEqual([{
      ...errorAction,
      id: 1,
    }]);
    state = fetchAPIState(state, delAPIError(1));
    expect(state).toEqual([]);
  });
});
