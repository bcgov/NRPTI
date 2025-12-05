const CertificatesAmendment = require('./certificates-amendment-utils');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');

describe('CertificatesAmendment', () => {
  let certificatesAmendmentInstance;

  beforeEach(() => {
    certificatesAmendmentInstance = new CertificatesAmendment('auth_payload', RECORD_TYPE.CertificateAmendment);
  });

  describe('constructor', () => {
    it('should create an instance of CertificatesAmendment', () => {
      expect(certificatesAmendmentInstance).toBeInstanceOf(CertificatesAmendment);
    });

    it('should set auth payload and record type', () => {
      expect(certificatesAmendmentInstance.auth_payload).toEqual('auth_payload');
      expect(certificatesAmendmentInstance.recordType).toEqual(RECORD_TYPE.CertificateAmendment);
    });
  });

  describe('transformRecord', () => {
    it('should throw an error if epicRecord is not provided', async () => {
      await expect(certificatesAmendmentInstance.transformRecord()).rejects.toThrow(
        'transformRecord - required record must be non-null.'
      );
    });

    it('should call transformRecord on the record', async () => {
      const epicRecord = {
        project: {
          legislation: 'someLegislation'
        }
      };

      jest.spyOn(certificatesAmendmentInstance, 'transformRecord').mockImplementation(() => {
        return {
          issuingAgency: 'AGENCY_EAO',
          legislation: [
            {
              act: epicRecord.project.legislation
            }
          ]
        };
      });

      const transformedRecord = await certificatesAmendmentInstance.transformRecord(epicRecord);

      expect(transformedRecord).toHaveProperty('issuingAgency', 'AGENCY_EAO');
      expect(transformedRecord).toHaveProperty('legislation');
      expect(transformedRecord.legislation[0]).toHaveProperty('act', 'someLegislation');
    });
  });
});
