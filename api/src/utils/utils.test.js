const Utils = require('./utils');

describe('parseDate', () => {
  it('returns null if null dateString paramter provided ', async () => {
    const result = await Utils.parseDate(null, 'dateFormat');

    expect(result).toBe(null);
  });

  it('returns null if null dateFormat paramter provided ', async () => {
    const result = await Utils.parseDate('dateString', null);

    expect(result).toBe(null);
  });

  it('returns null if the date string and date format do not align ', async () => {
    const result = await Utils.parseDate('2019-12-30', 'MM-DD-YYYY');

    expect(result).toBe(null);
  });

  it('returns a formatted date string if the date string and date format align ', async () => {
    const result = await Utils.parseDate('2019-12-30', 'YYYY-MM-DD');

    expect(result).toEqual(new Date('2019-12-30T08:00:00.000Z'));
  });
});
