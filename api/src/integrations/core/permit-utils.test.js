const Permits = require('./permit-utils'); // Assuming your file is named Permits.js
const mongoose = require('mongoose');

describe('Permits class', () => {
  let permitsInstance;

  beforeEach(() => {
    const auth_payload = 'auth_payload';
    const recordType = { _schemaName: 'mockSchemaName' };

    permitsInstance = new Permits(auth_payload, recordType);

    // eslint-disable-next-line no-undef
    permit = {
      permit_no: 'PERMIT123',
      permit_status_code: 'ACTIVE',
      current_permittee: 'ABC Company',
      permit_amendments: [
        {
          permit_amendment_guid: 'AMENDMENT_GUID_1',
          permit_amendment_status_code: 'APPROVED',
          permit_amendment_type_code: 'TYPE_A',
          received_date: '2023-11-15',
          issue_date: '2023-11-20',
          related_documents: [
            {
              document_manager_guid: 'DOCUMENT_GUID_1',
              document_name: 'Document 1',
              mine_guid: 'MINE_GUID_1'
            },
            {
              document_manager_guid: 'DOCUMENT_GUID_2',
              document_name: 'Document 2',
              mine_guid: 'MINE_GUID_2'
            }
          ]
        }
      ]
    };

    // eslint-disable-next-line no-undef
    record = {
      _id: {
        $oid: '6123af29647c8716e95f1241'
      },
      issuedTo: {
        type: 'Company',
        companyName: 'Test Company',
        fullName: 'Test Company',
        read: ['sysadmin', 'admin:nrced', 'admin:lng', 'admin:bcmi'],
        write: ['sysadmin', 'admin:bcmi']
      },
      _schemaName: 'PermitBCMI',
      _sourceRefId: '18ac1234-7626-4d87-a8ab-25c4d056fc1d',
      _epicProjectId: null,
      _master: {
        $oid: '6123af29647c8716e95f1242'
      },
      collectionId: {
        $oid: '64faf16272ee71001b3daaff'
      },
      read: ['sysadmin', 'admin:nrced', 'admin:lng', 'admin:bcmi', 'public'],
      write: ['sysadmin', 'admin:bcmi'],
      projectName: 'Test Quarry',
      centroid: [-123.52522, 48.59232],
      recordName: 'Permit R-9-77_NoW 0123407-2020-01_20231030.pdf',
      recordType: 'Permit',
      recordSubtype: '',
      mineGuid: '9f63a91d-0123-4723-ae64-3b685b6bc4d2',
      permitNumber: 'R-9-77',
      permitStatusCode: 'O',
      amendmentStatusCode: 'ACT',
      typeCode: 'ALG',
      originalPermit: null,
      receivedDate: null,
      dateIssued: {
        $date: '2023-10-30T07:00:00.000Z'
      },
      issuingAgency: 'AGENCY_EMLI',
      authorizedEndDate: null,
      description: '',
      documents: [],
      sourceDateAdded: null,
      sourceDateUpdated: null,
      dateAdded: {
        $date: '2023-11-17T18:21:29.814Z'
      },
      dateUpdated: null,
      datePublished: null,
      updatedBy: '',
      publishedBy: '',
      sourceSystemRef: 'core',
      __v: 0
    };
  });

  describe('constructor', () => {
    it('should throw an error if auth_payload is null', () => {
      expect(() => new Permits(null, { _schemaName: 'mockSchemaName' })).toThrowError(
        'PermitUtils - required auth_payload must be non-null.'
      );
    });

    it('should throw an error if recordType is null', () => {
      expect(() => new Permits('auth_payload', null)).toThrowError(
        'PermitUtils - required recordType must be non-null.'
      );
    });
  });

  describe('transformRecord method', () => {
    it('should throw an error if permit or permit amendments are null or empty', () => {
      // eslint-disable-next-line no-undef
      expect(() => permitsInstance.transformRecord(null, record)).toThrowError(
        'transformRecords - required permits must be non-null.'
      );
    });

    it('should throw an error if mineRecord is null', () => {
      // eslint-disable-next-line no-undef
      expect(() => permitsInstance.transformRecord(permit, null)).toThrowError(
        'transformRecords - required mineRecord must be non-null.'
      );
    });

    it('should return a transformed record', () => {
      // eslint-disable-next-line no-undef
      const permitRecord = permitsInstance.transformRecord(permit, record);

      expect(permitRecord).toBeInstanceOf(Array);
      expect(permitRecord).toHaveLength(2);
    });

    it('should have the correct structure for each permit record', () => {
      // eslint-disable-next-line no-undef
      const permitRecord = permitsInstance.transformRecord(permit, record);

      permitRecord.forEach((permit, index) => {
        expect(permit._schemaName).toEqual('mockSchemaName');
        expect(permit.sourceSystemRef).toEqual('core');
        expect(permit.amendmentStatusCode).toEqual('APPROVED');
        expect(permit.typeCode).toEqual('TYPE_A');
        expect(permit.permitNumber).toEqual('PERMIT123');
        expect(permit.permitStatusCode).toEqual('ACTIVE');
        expect(permit.issuingAgency).toEqual('AGENCY_EMLI');
      });
    });

    it('it should continue with no documents', () => {
      // eslint-disable-next-line no-undef
      permit.permit_amendments[0].related_documents = [];
      // eslint-disable-next-line no-undef
      const permitRecord = permitsInstance.transformRecord(permit, record);

      permitRecord.forEach((permit, index) => {
        expect(permit._schemaName).toEqual('mockSchemaName');
        expect(permit.sourceSystemRef).toEqual('core');
        expect(permit.amendmentStatusCode).toEqual('APPROVED');
        expect(permit.typeCode).toEqual('TYPE_A');
        expect(permit.permitNumber).toEqual('PERMIT123');
        expect(permit.permitStatusCode).toEqual('ACTIVE');
        expect(permit.issuingAgency).toEqual('AGENCY_EMLI');
      });
    });
  });

  describe('findExistingRecord method', () => {
    it('returns null if no existing record found', async () => {
      mongoose.model = jest.fn(() => ({
        findOne: jest.fn(() => null)
      }));

      const result = await permitsInstance.findExistingRecord('permit_amendment_guid');
      expect(result).toBeNull();
    });

    it('returns existing collection record if found', async () => {
      const existingRecord = { _id: 123, _sourceDocumentRefId: 'permit_amendment_guid' };
      mongoose.model = jest.fn(() => ({
        findOne: jest.fn(() => existingRecord)
      }));

      const result = await permitsInstance.findExistingRecord('permit_amendment_guid');
      expect(result).toEqual(existingRecord);
    });
  });

  const superMock = {
    updateRecord: jest.fn()
  };

  describe('updateRecord method', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should call updateRecord with mocked data', async () => {
      const permitId = '123';
      const newPermit = { _id: '123' };
      const existingPermit = {
        _flavourRecords: [
          { _id: 'flavourRecordId1', _schemaName: 'schemaName1' },
          { _id: 'flavourRecordId2', _schemaName: 'schemaName2' }
        ]
      };

      const findOneMock = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(existingPermit)
      });

      mongoose.model.mockReturnValue({ findOne: findOneMock });

      superMock.updateRecord.mockResolvedValue('Mocked result');

      await permitsInstance.updateRecord(permitId, newPermit);

      expect(mongoose.model).toHaveBeenCalledWith('Permit');
      expect(findOneMock).toHaveBeenCalledWith({ _id: permitId });
    });
  });

  describe('getCurrentMinePermits method', () => {
    it('returns null if no existing record found', async () => {
      mongoose.model = jest.fn(() => ({
        find: jest.fn(() => null)
      }));

      const result = await permitsInstance.getCurrentMinePermits('123');
      expect(result).toBeNull();
    });

    it('returns existing collection record if found', async () => {
      const existingRecord = { mine: 'Mine Name' };
      mongoose.model = jest.fn(() => ({
        find: jest.fn(() => existingRecord)
      }));

      const result = await permitsInstance.getCurrentMinePermits('123');
      expect(result).toEqual(existingRecord);
    });
  });
});
