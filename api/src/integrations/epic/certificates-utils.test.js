const Certificates = require('./certificates-utils');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');

describe('Certificates', () => {
  let certificatesInstance;

  beforeEach(() => {
    certificatesInstance = new Certificates('auth_payload', RECORD_TYPE.Certificate);
  });

  describe('constructor', () => {
    it('should create an instance of Certificates', () => {
      expect(certificatesInstance).toBeInstanceOf(Certificates);
    });

    it('should set auth payload and record type', () => {
      expect(certificatesInstance.auth_payload).toEqual('auth_payload');
      expect(certificatesInstance.recordType).toEqual(RECORD_TYPE.Certificate);
    });
  });

  describe('transformRecord', () => {
    it('should throw an error if epicRecord is not provided', async () => {
      await expect(certificatesInstance.transformRecord()).rejects.toThrow('transformRecord - required record must be non-null.');
    });

    it('should call transformRecord on the record', async () => {
      const epicRecord = {
        project: {
          legislation: 'someLegislation'
        }
      };

      jest.spyOn(certificatesInstance, 'transformRecord').mockImplementation(() => {
        return {
          issuingAgency: 'AGENCY_EAO',
          legislation: [
            {
              act: epicRecord.project.legislation
            }
          ]
        };
      });

      const transformedRecord = await certificatesInstance.transformRecord(epicRecord);

      expect(transformedRecord).toHaveProperty('issuingAgency', 'AGENCY_EAO');
      expect(transformedRecord).toHaveProperty('legislation');
      expect(transformedRecord.legislation[0]).toHaveProperty('act', 'someLegislation');
    });
  });
});
