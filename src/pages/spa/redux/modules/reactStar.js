import { API } from './fetchAPI';
import { processings } from './processing';

// ///////////////////////////////////
// Action
// ///////////////////////////////////

export const STAR_COUNT = 'STAR_COUNT';


// 取 React Star
export const getReactStar = () => ({
  type: API,
  // ajax payload (Required)
  payload: {
    url: 'https://api.github.com/repos/facebook/react',
  },
  // 完成後接續 action 或 [action] (Required)
  next: response => ({ type: STAR_COUNT, count: response.stargazers_count }),
  // 出錯時接續 action 或 [action] (Optional)
  error: () => ({ type: STAR_COUNT, count: '--' }),
  // loading actions - processingStart & processingEnd (Optional)
  ...processings(),
  // cancel type (Optional)
  // cancelType: 'CANCEL_REACT_STAR',
});


// ///////////////////////////////////
// reducer
// ///////////////////////////////////

// PropTypes.oneOfType([PropTypes.number, PropTypes.string])
const initialState = '--';

export const reactStar = (state = initialState, action) => {
  switch (action.type) {
    case STAR_COUNT: {
      return action.count;
    }
    default:
      return state;
  }
};
