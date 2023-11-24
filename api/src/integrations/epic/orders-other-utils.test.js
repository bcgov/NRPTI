const OrdersOther = require('./orders-other-utils');
const BaseRecordUtils = require('./base-record-utils');

describe('OrdersOther', () => {
  let ordersOtherInstance;

  beforeEach(() => {
    ordersOtherInstance = new OrdersOther('auth_payload', 'recordType');
  });

  describe('transformRecord', () => {
    it('should throw an error if no record is provided', async () => {
      await expect(ordersOtherInstance.transformRecord(null)).rejects.toThrow(
        'transformRecord - required record must be non-null.'
      );
    });

    it('should transform an Epic order record correctly', async () => {
      BaseRecordUtils.prototype.transformRecord = jest.fn().mockImplementation(() => {
        return {};
      });
      const epicRecord = {
        _id: '588511d0aaecd9001b826192',
        _schemaName: 'Inspection',
        _sourceRefId: 1,
        legislation: 2018,
        project: {
          proponent: {
            company: 'Company Name',
            name: 'Proponent Name'
          }
        }
      };

      const transformedRecord = await ordersOtherInstance.transformRecord(epicRecord);

      expect(transformedRecord.recordSubtype).toBe('Other');
    });
  });
});
