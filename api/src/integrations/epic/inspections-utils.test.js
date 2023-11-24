const Inspections = require('./inspections-utils');
const BaseRecordUtils = require('./base-record-utils');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');

describe('Inspections', () => {
  let inspectionsInstance;

  beforeEach(() => {
    inspectionsInstance = new Inspections('auth_payload', RECORD_TYPE.Inspection);
  });

  describe('transformRecord', () => {
    it('should throw an error if no record is provided', async () => {
      await expect(inspectionsInstance.transformRecord(null)).rejects.toThrow(
        'transformRecord - required record must be non-null.'
      );
    });

    it('should call transformRecord and provide legislation 2002 data', async () => {
      BaseRecordUtils.prototype.transformRecord = jest.fn().mockImplementation(() => {
        return {};
      });

      const epicRecord = {
        _id: '588511d0aaecd9001b826192',
        _schemaName: 'Inspection',
        _sourceRefId: 1,
        legislation: 2002,
        project: {
          proponent: {
            company: 'Company Name',
            name: 'Proponent Name'
          }
        }
      };

      const transformedRecord = await inspectionsInstance.transformRecord(epicRecord);

      expect(transformedRecord.legislation.length).toBe(1);
      expect(transformedRecord.legislation[0].act).toBe('Environmental Assessment Act');
      expect(transformedRecord.legislation[0].section).toBe('33');
      expect(transformedRecord.legislation[0].subSection).toBe('1');
      expect(transformedRecord.issuingAgency).toBe('AGENCY_EAO');
    });
    
    it('should call transformRecord and provide legislation 2018 data', async () => {
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

      const transformedRecord = await inspectionsInstance.transformRecord(epicRecord);

      expect(transformedRecord.legislation.length).toBe(1);
      expect(transformedRecord.legislation[0].act).toBe('Environmental Assessment Act');
      expect(transformedRecord.legislation[0].section).toBe('49');
      expect(transformedRecord.legislation[0].subSection).toBe('3');
      expect(transformedRecord.issuingAgency).toBe('AGENCY_EAO');
    });

    it('should leave the act blank if the legislation isnt 2002 or 2018 ', async () => {
      BaseRecordUtils.prototype.transformRecord = jest.fn().mockImplementation(() => {
        return {};
      });

      const epicRecord = {
        _id: '588511d0aaecd9001b826192',
        _schemaName: 'Inspection',
        _sourceRefId: 1,
        legislation: 2009,
        project: {
          proponent: {
            company: 'Company Name',
            name: 'Proponent Name'
          }
        }
      };

      const transformedRecord = await inspectionsInstance.transformRecord(epicRecord);

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

      const companyName = inspectionsInstance.getCompanyName(proponentWithCompany);
      expect(companyName).toBe('Company Name');
    });

    it('should return proponent name if company is not available', () => {
      const proponentWithoutCompany = {
        name: 'Proponent Name'
      };

      const proponentName = inspectionsInstance.getCompanyName(proponentWithoutCompany);
      expect(proponentName).toBe('Proponent Name');
    });
  });
});
