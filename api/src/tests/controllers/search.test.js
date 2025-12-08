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
    it('returns `or equal` expression for field with multiple comma separated values', async () => {
      const result = await searchController.generateExpArray({ item: ['value1', 'value2', 'value3'] });

      expect(result).toEqual([
        { $or: [{ item: { $eq: 'value1' } }, { item: { $eq: 'value2' } }, { item: { $eq: 'value3' } }] }
      ]);
    });

    it('returns `and equal` expression for field with multiple comma separated values', async () => {
      const result = await searchController.generateExpArray({ item: ['value1', 'value2', 'value3'] }, '$and');

      expect(result).toEqual([
        { $and: [{ item: { $eq: 'value1' } }, { item: { $eq: 'value2' } }, { item: { $eq: 'value3' } }] }
      ]);
    });

    it('returns `and not equal` expression for field with multiple comma separated values', async () => {
      const result = await searchController.generateExpArray({ item: ['value1', 'value2', 'value3'] }, '$and', '$ne');

      expect(result).toEqual([
        { $and: [{ item: { $ne: 'value1' } }, { item: { $ne: 'value2' } }, { item: { $ne: 'value3' } }] }
      ]);
    });

    it('returns `and in contains` expression for field with multiple comma separated values', async () => {
      const result = await searchController.generateExpArray({ item: ['value1', 'value2', 'value3'] }, '$and', '$in');

      expect(result).toEqual([{ $and: [{ item: { $in: ['value1', 'value2', 'value3'] } }] }]);
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

      expect(result).toEqual([{ $and: [{ documents: { $exists: true } }, { documents: { $not: { $size: 0 } } }] }]);
    });

    it('returns documents boolean expression for field=hasDocuments and a false value', async () => {
      const result = await searchController.generateExpArray({ hasDocuments: 'false' });

      expect(result).toEqual([{ $or: [{ documents: { $exists: false } }, { documents: { $size: 0 } }] }]);
    });
  });
});

describe('getConvertedValue', () => {
  describe('null item parameter', () => {
    it('returns empty object', () => {
      const result = searchController.getConvertedValue(null, '123', '$eq');

      expect(result).toEqual({});
    });
  });

  describe('null comparisonOperator parameter', () => {
    it('returns empty object', () => {
      const result = searchController.getConvertedValue('item', '123', null);

      expect(result).toEqual({});
    });
  });

  describe('null entry parameter', () => {
    describe('comparisonOperator = $eq', () => {
      it('returns equals expression for a string', () => {
        const result = searchController.getConvertedValue('item', null, '$eq');

        expect(result).toEqual({ item: { $eq: null } });
      });
    });
    describe('comparisonOperator = $ne', () => {
      it('returns not equals expression for a string', () => {
        const result = searchController.getConvertedValue('item', null, '$ne');

        expect(result).toEqual({ item: { $ne: null } });
      });
    });
  });

  describe('number', () => {
    describe('comparisonOperator = $eq', () => {
      it('returns equals expression for a number value', () => {
        const result = searchController.getConvertedValue('item', 123, '$eq');

        expect(result).toEqual({ item: { $eq: 123 } });
      });
    });

    describe('comparisonOperator = $ne', () => {
      it('returns not equals expression for a number value', () => {
        const result = searchController.getConvertedValue('item', 123, '$ne');

        expect(result).toEqual({ item: { $ne: 123 } });
      });
    });
  });

  describe('string', () => {
    describe('comparisonOperator = $eq', () => {
      it('returns equals expression for a string value', () => {
        const result = searchController.getConvertedValue('item', 'entry', '$eq');

        expect(result).toEqual({ item: { $eq: 'entry' } });
      });
    });

    describe('comparisonOperator = $ne', () => {
      it('returns not equals expression for a string value', () => {
        const result = searchController.getConvertedValue('item', 'entry', '$ne');

        expect(result).toEqual({ item: { $ne: 'entry' } });
      });
    });
  });

  describe('boolean', () => {
    describe('comparisonOperator = $eq', () => {
      it('returns equals expression for a true boolean value', () => {
        const result = searchController.getConvertedValue('item', 'true', '$eq');

        expect(result).toEqual({ item: { $eq: true } });
      });

      it('returns equals expression for a false boolean value', () => {
        const result = searchController.getConvertedValue('item', 'false', '$eq');

        expect(result).toEqual({ item: { $eq: false } });
      });
    });

    describe('comparisonOperator = $ne', () => {
      it('returns not equals expression for a true boolean value', () => {
        const result = searchController.getConvertedValue('item', 'true', '$ne');

        expect(result).toEqual({ item: { $ne: true } });
      });

      it('returns not equals expression for a false boolean value', () => {
        const result = searchController.getConvertedValue('item', 'false', '$ne');

        expect(result).toEqual({ item: { $ne: false } });
      });
    });
  });

  describe('objectId', () => {
    describe('comparisonOperator = $eq', () => {
      it('returns equals expression for a objectId value', () => {
        const objectId = new ObjectID(112233445566);

        const result = searchController.getConvertedValue('item', objectId, '$eq');

        expect(result).toEqual({ item: { $eq: objectId } });
      });
    });

    describe('comparisonOperator = $ne', () => {
      it('returns not equals expression for a objectId value', () => {
        const objectId = new ObjectID(112233445566);

        const result = searchController.getConvertedValue('item', objectId, '$ne');

        expect(result).toEqual({ item: { $ne: objectId } });
      });
    });
  });
});

describe('addArrayCountField', () => {
  describe('null fieldName parameter', () => {
    it('returns empty object', () => {
      const result = searchController.addArrayCountField(null);

      expect(result).toEqual({});
    });
  });

  describe('empty fieldName parameter', () => {
    it('returns empty object', () => {
      const result = searchController.addArrayCountField('');

      expect(result).toEqual({});
    });
  });

  describe('valid fieldName parameter', () => {
    it('returns aggregation pipeline stage object', () => {
      const result = searchController.addArrayCountField('fieldA');

      expect(result).toEqual({
        $addFields: {
          countfieldA: {
            $cond: {
              if: { $isArray: '$fieldA' },
              then: { $size: '$fieldA' },
              else: '$$REMOVE'
            }
          }
        }
      });
    });
  });
});
