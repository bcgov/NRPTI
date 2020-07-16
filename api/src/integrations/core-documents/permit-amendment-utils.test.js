const PermitAmendmentUtils = require('./permit-amendment-utils');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');

describe('PermitAmendments', () => {
  describe('constructor', () => {
    it('throws an error if no recordType provided', () => {
      expect(() => {
        new PermitAmendmentUtils({}, null);
      })
      .toThrow('PermitAmendmentUtils - required recordType must be non-null.');
    });

    it('throws an error if no auth_payload provided', () => {
      expect(() => {
        new PermitAmendmentUtils(null, {});
      })
      .toThrow('PermitAmendmentUtils - required auth_payload must be non-null.');
    });
  });

  describe('transformRecord', () => {
    it('throws error if no amendment provided', async () => {
      const permitAmendmentUtils = new PermitAmendmentUtils({}, RECORD_TYPE.PermitAmendment);
      expect(permitAmendmentUtils.transformRecord).toThrow('transformRecords - required amendment must be non-null.');
    });

    it('returns transformed amendment record', () => {
      const permitAmendmentUtils = new PermitAmendmentUtils({}, RECORD_TYPE.PermitAmendment);
      const amendment = {
        _sourceRefId: '123',
        statusCode: 'test',
        documents: [
          {
            _sourceRefId: '123',
            documentName: 'test',
            documentId: '1234'
          }
        ]
      };

      const expectedResult = {
        _schemaName: 'PermitAmendment',
        sourceSystemRef: 'core',
        _sourceRefId: '123',
        _flavourRecords: [],
        statusCode: 'test',
        typeCode: '',
        receivedDate: null,
        issueDate: null,
        authorizedEndDate: null,
        description: '',
        documents: [
          {
            _sourceRefId: '123',
            documentName: 'test',
            documentId: '1234'
          }
        ]
      };

      const result = permitAmendmentUtils.transformRecord(amendment);

      expect(result).toEqual(expectedResult);
    })
  });
});
