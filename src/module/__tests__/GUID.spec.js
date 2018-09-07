import GUID, { randomID } from '../GUID';

describe('GUID.js', () => {
  it('GUID', () => {
    const value = GUID();
    const valueArray = value.split('-');
    valueArray.forEach((element) => {
      expect(/^[a-z0-9]+$/.test(element)).toBeTruthy();
    });
    expect(valueArray.length).toBe(5);
    expect(valueArray[0].length).toBe(8);
    expect(valueArray[1].length).toBe(4);
    expect(valueArray[2].length).toBe(4);
    expect(valueArray[3].length).toBe(4);
    expect(valueArray[4].length).toBe(12);
  });
  it('randomID', () => {
    const value = randomID();
    const valueArray = value.split('-');
    expect(/^[0-9]+$/.test(valueArray[0])).toBeTruthy();
    expect(/^[a-z0-9]+$/.test(valueArray[1])).toBeTruthy();
    expect(valueArray[1].length).toBe(4);
  });
});
