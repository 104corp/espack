import { randomID } from '../../../../../module/GUID';
import {
  PROCESSING_GLOBAL,
  PROCESSING_START,
  PROCESSING_END,
  processingStart,
  processingEnd,
  processings,
  processing,
} from '../processing';

describe('processing.js', () => {
  const id = randomID();
  const level = 'specialID';
  const payload = {
    level,
    id,
  };


  it('呼叫 processingStart action', () => {
    // 使用預設
    expect(processingStart()).toEqual({
      type: PROCESSING_START,
      level: PROCESSING_GLOBAL,
      id: '#',
    });
    // 自訂 level & id
    expect(processingStart(
      payload.level,
      payload.id,
    )).toEqual({
      type: PROCESSING_START,
      ...payload,
    });
  });


  it('呼叫 processingEnd action', () => {
    // 使用預設
    expect(processingEnd()).toEqual({
      type: PROCESSING_END,
      level: PROCESSING_GLOBAL,
      id: '#',
    });
    // 自訂 level & id
    expect(processingEnd(
      payload.level,
      payload.id,
    )).toEqual({
      type: PROCESSING_END,
      ...payload,
    });
  });


  it('呼叫 processings action', () => {
    // 預設 processingLevel
    expect(processings({
      processingId: id,
    })).toEqual({
      processingStart: {
        type: PROCESSING_START,
        ...payload,
        level: PROCESSING_GLOBAL,
      },
      processingEnd: {
        type: PROCESSING_END,
        ...payload,
        level: PROCESSING_GLOBAL,
      },
    });
    // 自訂 processingLevel
    expect(processings({
      processingLevel: level,
      processingId: id,
    })).toEqual({
      processingStart: {
        type: PROCESSING_START,
        ...payload,
      },
      processingEnd: {
        type: PROCESSING_END,
        ...payload,
      },
    });

    const defaultAction = processings();
    expect(Object.keys(defaultAction)).toEqual([
      'processingStart',
      'processingEnd',
    ]);
  });


  it('reducer initial state', () => {
    expect(processing(undefined, {})).toEqual([]);
  });


  it('reducer should handle PROCESSING_START, PROCESSING_END', () => {
    const startAction = {
      type: PROCESSING_START,
      level: PROCESSING_GLOBAL,
      id,
    };
    let state;
    // 加入 processing 資料
    state = processing([], startAction);
    expect(state).toEqual([{
      level: startAction.level,
      id: startAction.id,
    }]);

    state = processing(state, startAction);
    expect(state).toEqual([{
      level: startAction.level,
      id: startAction.id,
    }]);

    const endAction = {
      type: PROCESSING_END,
      level: PROCESSING_GLOBAL,
      id,
    };
    // 刪除 processing 資料
    expect(processing(state, endAction)).toEqual([]);
  });
});
