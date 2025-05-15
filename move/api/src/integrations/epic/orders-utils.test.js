const Orders = require('./orders-utils');
const BaseRecordUtils = require('./base-record-utils');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');

describe('Orders', () => {
  let ordersInstance;

  beforeEach(() => {
    ordersInstance = new Orders('auth_payload', RECORD_TYPE.Order);
  });

  describe('transformRecord', () => {
    it('should throw an error if no record is provided', async () => {
      await expect(ordersInstance.transformRecord(null)).rejects.toThrow(
        'transformRecord - required record must be non-null.'
      );
    });

    it('should call transformRecord and provide legislation 2002 data', async () => {
      BaseRecordUtils.prototype.transformRecord = jest.fn().mockImplementation(() => {
        return {};
      });

      const epicRecord = {
        _id: '588511d0aaecd9001b826192',
        _schemaName: 'Order',
        _sourceRefId: 1,
        legislation: 2002,
        project: {
          proponent: {
            company: 'Company Name',
            name: 'Proponent Name'
          }
        }
      };

      const transformedRecord = await ordersInstance.transformRecord(epicRecord);

      expect(transformedRecord.legislation.length).toBe(1);
      expect(transformedRecord.legislation[0].act).toBe('Environmental Assessment Act');
      expect(transformedRecord.legislation[0].section).toBe('34');
      expect(transformedRecord.issuingAgency).toBe('AGENCY_EAO');
    });
    
    it('should call transformRecord and provide legislation 2018 data', async () => {
      BaseRecordUtils.prototype.transformRecord = jest.fn().mockImplementation(() => {
        return {};
      });

      const epicRecord = {
        _id: '588511d0aaecd9001b826192',
        _schemaName: 'Order',
        _sourceRefId: 1,
        legislation: 2018,
        project: {
          proponent: {
            company: 'Company Name',
            name: 'Proponent Name'
          }
        }
      };

      const transformedRecord = await ordersInstance.transformRecord(epicRecord);

      expect(transformedRecord.legislation.length).toBe(1);
      expect(transformedRecord.legislation[0].act).toBe('Environmental Assessment Act');
      expect(transformedRecord.legislation[0].section).toBe('53');
      expect(transformedRecord.issuingAgency).toBe('AGENCY_EAO');
    });

    it('should leave the act blank if the legislation isnt 2002 or 2018 ', async () => {
      BaseRecordUtils.prototype.transformRecord = jest.fn().mockImplementation(() => {
        return {};
      });

      const epicRecord = {
        _id: '588511d0aaecd9001b826192',
        _schemaName: 'Order',
        _sourceRefId: 1,
        legislation: 2009,
        project: {
          proponent: {
            company: 'Company Name',
            name: 'Proponent Name'
          }
        }
      };

      const transformedRecord = await ordersInstance.transformRecord(epicRecord);

      expect(transformedRecord.legislation.length).toBe(1);
      expect(transformedRecord.legislation[0].act).toBe('');
      expect(transformedRecord.issuingAgency).toBe('AGENCY_EAO');
    });
  });

  describe('getCompanyName', () => {
    it('should return company name if available in proponent', () => {
      const proponentWithCompany = {
        company: 'Company Name',
        name: 'Proponent Name'
      };

      const companyName = ordersInstance.getCompanyName(proponentWithCompany);
      expect(companyName).toBe('Company Name');
    });

    it('should return proponent name if company is not available', () => {
      const proponentWithoutCompany = {
        name: 'Proponent Name'
      };

      const proponentName = ordersInstance.getCompanyName(proponentWithoutCompany);
      expect(proponentName).toBe('Proponent Name');
    });
  });
});
