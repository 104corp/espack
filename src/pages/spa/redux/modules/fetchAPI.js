/* eslint-disable max-len */
import { ajax } from 'rxjs/observable/dom/ajax';
import { AjaxResponse } from 'rxjs/observable/dom/AjaxObservable';
import { of } from 'rxjs/observable/of';
import { merge } from 'rxjs/observable/merge';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mapTo';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/race';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/let';
import 'rxjs/add/operator/takeUntil';

// ///////////////////////////////////
// Action
// ///////////////////////////////////

export const API = 'API';
export const API_ERROR = 'API_ERROR';
export const DEL_API_ERROR = 'DEL_API_ERROR';
export const FETCH_API_CANCELLED = 'FETCH_API_CANCELLED';

export function delAPIError(id) {
  return {
    type: DEL_API_ERROR,
    id,
  };
}

export function cancelAllAPI() {
  return {
    type: FETCH_API_CANCELLED,
  };
}


// ///////////////////////////////////
// Epic
// ///////////////////////////////////

/**
 * API Action 用法
 *
 * {
 *   type: API,
 *   payload: {
 *     url: 'http://...',
 *   },
 *   next: response => nextActions
 *   error: response => errorActions
 *   processingStart: processingStartAction,
 *   processingEnd: processingEndAction,
 *   cancelType: 'MY_API_CANCELLED'
 * }
 *
 * payload         (Required)：AJAX data，請參考 AJAX doc - https://github.com/Reactive-Extensions/RxJS-DOM/blob/master/doc/operators/ajax.md
 * next            (Required)：接收 response 資料後接著返回下一個處理 action 或 [action]
 * error           (Optional)：發生錯誤時接著的 action 或 [action]
 * processingStart (Optional)：loading 開始 action
 * processingEnd   (Optional)：loading 結束 action
 * cancelType      (Optional)：自訂中斷取消 action - 讓強制取消時可針對特定目標
 *
 * - 正常程序 -
 * [API action] -> [processingStart action] -> [AJAX] -> [next actions] -> [processingEnd action]
 *
 * - Server error -
 * [API action] -> [processingStart action] -> [AJAX] -> [API error action] -> [error actions] -> [processingEnd action]
 *
 * - Cancel -
 * [API action] -> [processingStart action] -> [AJAX] -> [cancel action, self cancel action] -> [processingEnd action]
*/
export const fetchAPIEpic = action$ => (
  action$.ofType(API)
    .mergeMap((action) => {
      const {
        next,
        error,
        processingStart,
        processingEnd,
        cancelType,
      } = action;
      const { ...payload } = action.payload;
      payload.responseType = payload.responseType || 'json';
      payload.method = payload.method || 'GET';
      if (payload.url) {
        // Cancel Action
        const cancelAction = (obs) => {
          const cancelTypes = [FETCH_API_CANCELLED];
          if (typeof cancelType === 'string') cancelTypes.push(cancelType);
          if (processingEnd) {
            return obs.race(action$.ofType(...cancelTypes)
              .map(() => processingEnd)
              .take(1));
          }
          return obs.takeUntil(action$.ofType(...cancelTypes));
        };
        // Ajax
        const apiActions = [
          ajax({ ...payload })
            .catch(err => of(err))
            .mergeMap((response) => {
              const resultAction = [];
              if (response instanceof AjaxResponse) {
                // Success - AjaxResponse
                const nextActions = [].concat(next(response.response));
                resultAction.push(of(...nextActions));
              } else {
                // Error - AjaxError
                // general action
                // if (response.status === 401)
                resultAction.push(of({
                  type: API_ERROR,
                  status: response.status,
                  message: response.message,
                  response: response.response,
                }));
                // custom action
                if (error) {
                  const errorActions = [].concat(error(response));
                  resultAction.push(of(...errorActions));
                }
              }
              // Processing End Action
              if (processingEnd) resultAction.push(of(processingEnd));
              return merge(...resultAction);
            })
            .let(cancelAction),
        ];
        // Processing Start Action
        if (processingStart) apiActions.unshift(of(processingStart));
        return merge(...apiActions);
      }
      // Missing URL
      return of({ type: API_ERROR, status: 0, message: 'Missing URL' });
    })
);


// ///////////////////////////////////
// reducer
// ///////////////////////////////////
const initialState = [];
let errorId = 0;

export const fetchAPIState = (state = initialState, action) => {
  switch (action.type) {
    case API_ERROR: {
      errorId += 1;
      return state.concat([{
        id: errorId,
        ...action,
      }]);
    }

    case DEL_API_ERROR: {
      const stateFilter = state.filter(item => (
        item.id !== action.id
      ));
      return stateFilter;
    }

    default:
      return state;
  }
};
