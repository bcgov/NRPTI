const moment = require('moment');
const ObjectID = require('mongodb').ObjectID;

const searchController = require('../../controllers/search');

describe('generateExpArray', () => {
  describe('invalid parameters', () => {
    it('returns undefined if no field paramter provided ', async () => {
      const result = await searchController.generateExpArray();

      expect(result).toBe(undefined);
    });

    it('returns undefined if null field paramter provided ', async () => {
      const result = await searchController.generateExpArray(null);

      expect(result).toBe(undefined);
    });

    it('returns undefined if undefined field paramter provided ', async () => {
      const result = await searchController.generateExpArray(undefined);

      expect(result).toBe(undefined);
    });

    it('returns undefined if falsy field paramter provided ', async () => {
      const result = await searchController.generateExpArray(0);

      expect(result).toBe(undefined);
    });
  });

  describe('array', () => {
    it('returns or expression for field with multiple comma separated values', async () => {
      const result = await searchController.generateExpArray({ item: ['value1', 'value2', 'value3'] });

      expect(result).toEqual([{ $or: [{ item: 'value1' }, { item: 'value2' }, { item: 'value3' }] }]);
    });

    it('returns nor expression for field with (nor) prefix and multiple comma separated values', async () => {
      const result = await searchController.generateExpArray({ '(nor)item': ['value1', 'value2', 'value3'] });

      expect(result).toEqual([{ $nor: [{ item: 'value1' }, { item: 'value2' }, { item: 'value3' }] }]);
    });
  });

  describe('date', () => {
    it('returns empty object for field with no known date range prefix', async () => {
      const result = await searchController.generateExpArray({ noDateRangePrefix: new moment().toISOString() });

      expect(result).toEqual([{}]);
    });

    it('returns date range from expression for field with dateRangeFromFilter prefix and valid date value', async () => {
      const entryDate = new moment().toISOString();
      const result = await searchController.generateExpArray({ dateRangeFromFilteritem: entryDate });

      const date = new Date(entryDate);
      const expectedDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

      expect(result).toEqual([{ item: { $gte: expectedDate } }]);
    });

    it('returns date range to expression for field with dateRangeToFilter prefix and valid date value', async () => {
      const entryDate = new moment().toISOString();
      const result = await searchController.generateExpArray({ dateRangeToFilteritem: entryDate });

      const date = new Date(entryDate);
      const expectedDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1);

      expect(result).toEqual([{ item: { $lt: expectedDate } }]);
    });
  });

  describe('hasDocuments', () => {
    it('returns documents boolean expression for field=hasDocuments and a true value', async () => {
      const result = await searchController.generateExpArray({ hasDocuments: 'true' });

      expect(result).toEqual([{ documents: { $not: { $size: 0 } } }]);
    });

    it('returns documents boolean expression for field=hasDocuments and a false value', async () => {
      const result = await searchController.generateExpArray({ hasDocuments: 'false' });

      expect(result).toEqual([{ documents: { $size: 0 } }]);
    });
  });
});

describe('getConvertedValue', () => {
  describe('number', () => {
    it('returns basic equals expression for a number value', () => {
      const result = searchController.getConvertedValue('item', 123);

      expect(result).toEqual({ ['item']: 123 });
    });
  });

  describe('string', () => {
    it('returns default equals expression for a string value', () => {
      const result = searchController.getConvertedValue('item', 'entry');

      expect(result).toEqual({ ['item']: 'entry' });
    });

    it('returns not equals expression for a string value', () => {
      const result = searchController.getConvertedValue('item', '(ne)entry');

      expect(result).toEqual({ ['item']: { $ne: 'entry' } });
    });
  });

  describe('boolean', () => {
    it('returns equals expression for a true boolean value', () => {
      const result = searchController.getConvertedValue('item', 'true');

      expect(result).toEqual({ ['item']: true, active: true });
    });

    it('returns equals expression for a false boolean value', () => {
      const result = searchController.getConvertedValue('item', 'false');

      expect(result).toEqual({ ['item']: false });
    });
  });

  describe('objectId', () => {
    it('returns equals expression for a objectId value', () => {
      const objectId = new ObjectID(112233445566);

      const result = searchController.getConvertedValue('item', objectId);

      expect(result).toEqual({ ['item']: objectId });
    });
  });
});
