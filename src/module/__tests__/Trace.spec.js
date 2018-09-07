import Trace, { sum } from '../Trace';

describe('Trace.js', () => {
  global.console = { log: jest.fn() };
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('console.log 是否正確呼叫', () => {
    const trace = new Trace();
    trace.log('msg');
    expect(console.log).toBeCalled();
  });

  it('sum 是否正確', () => {
    expect(sum(1, 2)).toBe(3);
  });
});
