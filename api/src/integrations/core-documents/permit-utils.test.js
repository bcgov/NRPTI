const PermitUtils = require('./permit-utils');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');

describe('Permits', () => {
  describe('constructor', () => {
    it('throws an error if no recordType provided', () => {
      expect(() => {
        new PermitUtils({}, null);
      }).toThrow('PermitAmendmentUtils - required recordType must be non-null.');
    });

    it('throws an error if no auth_payload provided', () => {
      expect(() => {
        new PermitUtils(null, {});
      }).toThrow('PermitAmendmentUtils - required auth_payload must be non-null.');
    });
  });

  describe('transformRecord', () => {
    it('throws error if no permit provided', async () => {
      const permitUtils = new PermitUtils({}, RECORD_TYPE.Permit);
      expect(permitUtils.transformRecord).toThrow('transformRecords - required amendment must be non-null.');
    });

    it('returns transformed permit record', () => {
      const permitUtils = new PermitUtils({}, RECORD_TYPE.Permit);
      const permit = {
        _sourceRefId: '123',
        amendmentStatusCode: 'test',
        documents: []
      };

      const expectedResult = {
        _schemaName: 'Permit',
        sourceSystemRef: 'core',
        _sourceRefId: '123',
        _sourceDocumentRefId: '',
        _flavourRecords: [],
        amendmentStatusCode: 'test',
        typeCode: '',
        sourceDateAdded: null,
        dateIssued: null,
        permitNumber: '',
        permitStatusCode: '',
        recordName: '',
        mineGuid: '',
        agency: '',
        documents: []
      };

      const result = permitUtils.transformRecord(permit);

      expect(result).toEqual(expectedResult);
    });
  });
});
