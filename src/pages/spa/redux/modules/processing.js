import { randomID } from '../../../../module/GUID';

// constants
export const PROCESSING_GLOBAL = 'PROCESSING_GLOBAL';

// ///////////////////////////////////
// Action
// ///////////////////////////////////

export const PROCESSING_START = 'PROCESSING_START';
export const PROCESSING_END = 'PROCESSING_END';

export function processingStart(level = PROCESSING_GLOBAL, id = '#') {
  return {
    type: PROCESSING_START,
    level,
    id,
  };
}

export function processingEnd(level = PROCESSING_GLOBAL, id = '#') {
  return {
    type: PROCESSING_END,
    level,
    id,
  };
}

// processing actions utility
export function processings({
  processingLevel = PROCESSING_GLOBAL,
  processingId = randomID(),
} = {}) {
  return {
    processingStart: processingStart(processingLevel, processingId),
    processingEnd: processingEnd(processingLevel, processingId),
  };
}

// ///////////////////////////////////
// reducer
// ///////////////////////////////////

// PropTypes.arrayOf(PropTypes.shape({ level: PropTypes.string, id: PropTypes.string }))
const initialState = [];

export const processing = (state = initialState, action) => {
  switch (action.type) {
    case PROCESSING_START: {
      // id & level 相同則覆蓋
      const stateFilter = state.filter(item => (
        item.id !== action.id || item.level !== action.level
      ));
      return stateFilter.concat([{
        level: action.level,
        id: action.id,
      }]);
    }

    case PROCESSING_END: {
      const stateFilter = state.filter(item => (
        item.id !== action.id || item.level !== action.level
      ));
      return stateFilter;
    }

    default:
      return state;
  }
};
