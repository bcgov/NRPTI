const BaseRecordUtils = require('./base-record-utils');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');
const mongoose = require('mongoose');
const RecordController = require('../../controllers/record-controller');

describe('BaseRecordUtils', () => {
  const Document = require ('../../models/document');
  const utils = require('../../utils/constants/misc');
  const mongo = 'mongodb://127.0.0.1/nrpti-testing'
  mongoose.connect(mongo);

  beforeAll(async () => {
    await Document.remove({});
  });
  
  beforeEach(async () => {
    await Document.remove({});
  });

  afterAll(async () => {
    mongoose.connection.db.dropDatabase();
    await mongoose.connections.close();
  });

  jest.fn('../../controllers/document-controller', () => ({
    createURLDocument: jest.fn((fileName, addedBy, url, readRoles = [], writeRoles = []) => {
      const Document = mongoose.model('Document');
      let document = new Document();

      document.fileName = fileName;
      document.addedBy = addedBy;
      document.url = url;
      document.read = [utils.ApplicationRoles.PUBLIC, utils.ApplicationRoles.ADMIN_LNG, utils.ApplicationRoles.ADMIN_NRCED, utils.ApplicationRoles.ADMIN_NRCED, utils.ApplicationRoles.ADMIN_BCMI];
      document.write = [utils.ApplicationRoles.ADMIN_LNG, utils.ApplicationRoles.ADMIN_NRCED, utils.ApplicationRoles.ADMIN_NRCED, utils.ApplicationRoles.ADMIN_BCMI];;

      return document.save();
    })
  }));

  describe('constructor', () => {
    it('throws an error if no recordType provided', () => {
      try {
        new BaseRecordUtils(null, null);
      } catch (error) {
        expect(error).toEqual(new Error('BaseRecordUtils - required recordType must be non-null.'));
      }
    });

    it('successfully creates an instance', () => {
      const baseRecordUtils = new BaseRecordUtils('auth_payload', RECORD_TYPE.Order);
      expect(baseRecordUtils).toEqual(expect.any(BaseRecordUtils));
    });
  });

  describe('createDocument', () => {
    it('successfully calls createURLDocument and return documents array', async () => {
      const baseRecordUtils = new BaseRecordUtils('auth_payload', RECORD_TYPE.Order);

      const epicRecord = {
        _id: 123,
        displayName: 'docDisplay',
        documentFileName: 'docFileName',
      };

      const actualDocument = await baseRecordUtils.createDocument(epicRecord);

      expect(actualDocument).toEqual(expect.any(Array));
    });

    it('returns an empty document if no epicRecord provided', async () => {
      const baseRecordUtils = new BaseRecordUtils(null, RECORD_TYPE.Order);

      const epicRecord = null;

      const actualDocument = await baseRecordUtils.createDocument(epicRecord);

      expect(actualDocument).toEqual([]);
    });
  });

  describe('removeDocuments', () => {
    it('returns nothing if nrptiRecord is null', async () => {
      const baseRecordUtils = new BaseRecordUtils('auth_payload', RECORD_TYPE.Order);

      await expect(baseRecordUtils.removeDocuments(null)).resolves.toBeUndefined();
    });
  });

  describe('transformRecord', () => {
    it('throws error if no epicRecord provided', async () => {
      const baseRecordUtils = new BaseRecordUtils(null, RECORD_TYPE.Order);

      try {
        await baseRecordUtils.transformRecord();
      } catch (error) {
        expect(error).toEqual(new Error('transformRecord - required epicRecord must be non-null.'));
      }
    });

    it('returns a default nrpti record when empty epicRecord provided', async () => {
      const baseRecordUtils = new BaseRecordUtils(null, RECORD_TYPE.Order);

      const epicRecord = {};

      const actualRecord = await baseRecordUtils.transformRecord(epicRecord);

      const expectedRecord = {
        _schemaName: RECORD_TYPE.Order._schemaName,

        _epicProjectId: '',
        _sourceRefId: expect.any(Object),
        _epicMilestoneId: '',
        issuingAgency: 'AGENCY_EAO',

        recordName: '',
        recordType: RECORD_TYPE.Order.displayName,
        dateIssued: null,
        description: '',
        projectName: '',
        location: '',
        centroid: '',

        dateAdded: expect.any(Date),
        dateUpdated: expect.any(Date),

        addedBy: '',
        updatedBy: '',

        sourceDateAdded: null,
        sourceDateUpdated: null,
        sourceSystemRef: 'epic'
      };

      expect(actualRecord).toMatchObject(expectedRecord);
    });

    // it('returns a nrpti record with all supported epicRecord fields populated', async () => {
    //   const baseRecordUtils = new BaseRecordUtils({ displayName: 'userName' }, RECORD_TYPE.Order);

    //   const epicRecord = {
    //     _id: 123,
    //     displayName: 'docDisplay',
    //     documentFileName: 'docFileName',
    //     description: 'someDescription',
    //     project: {
    //       name: 'projectName',
    //       centroid: '123',
    //       location: 'someLocation'
    //     },
    //     milestone: 'milestone',
    //     datePosted: 'someDate'
    //   };

    //   const actualRecord = await baseRecordUtils.transformRecord(epicRecord);

    //   const expectedRecord = {
    //     _schemaName: RECORD_TYPE.Order._schemaName,

    //     _epicProjectId: '',
    //     _sourceRefId: expect.any(Object),
    //     _epicMilestoneId: 'milestone',

    //     recordName: 'docDisplay',
    //     recordType: RECORD_TYPE.Order.displayName,
    //     dateIssued: 'someDate',
    //     description: 'someDescription',
    //     projectName: 'projectName',
    //     location: 'someLocation',
    //     centroid: '123',

    //     dateAdded: expect.any(Date),
    //     dateUpdated: expect.any(Date),

    //     addedBy: 'userName',
    //     updatedBy: 'userName',

    //     sourceDateAdded: null,
    //     sourceDateUpdated: null,
    //     sourceSystemRef: 'epic'
    //   };

    //   expect(actualRecord).toMatchObject(expectedRecord);
    // });
  });

  describe('findExistingRecord', () => {
    it('returns existing NRPTI master record if found', async () => {
      const baseRecordUtils = new BaseRecordUtils('authPayload', RECORD_TYPE.Order);
  
      const nrptiRecord = { _sourceRefId: '55153a8014829a865bbf700d' };
  
      const masterRecordModelMock = {
        findOne: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue({
            test: 'existingRecord',
            _flavourRecords: [{ _id: 321, _schemaName: 'flavourSchema' }],
          }),
        }),
      };
      const mongoose = require('mongoose');
      jest.spyOn(mongoose, 'model').mockReturnValue(masterRecordModelMock);
  
      const result = await baseRecordUtils.findExistingRecord(nrptiRecord);
  
      expect(result).toMatchObject(masterRecordModelMock.findOne().populate());
    });
  });

  describe('updateRecord', () => {
    it('throws error if nrptiRecord is null', async () => {
      const baseRecordUtils = new BaseRecordUtils('auth_payload', RECORD_TYPE.Order);
      
      const nrptiRecord = null
      const existingRecord = {
        _id: '123'
      }

      try {
        await baseRecordUtils.updateRecord(nrptiRecord, existingRecord);
      } catch (error) {
        expect(error).toEqual(new Error('updateRecord - required nrptiRecord must be non-null.'));
      }
    });
    
    it('throws error if existingRecord is null', async () => {
      const baseRecordUtils = new BaseRecordUtils('auth_payload', RECORD_TYPE.Order);
      
      const nrptiRecord = {
        _id: '123'
      }
      const existingRecord = null
      
      try {
        await baseRecordUtils.updateRecord(nrptiRecord, existingRecord);
      } catch (error) {
        expect(error).toEqual(new Error('updateRecord - required existingRecord must be non-null.'));
      }
    });
    
    it('successfully calls updateRecord to process the put request', async () => {
      const baseRecordUtils = new BaseRecordUtils('auth_payload', RECORD_TYPE.Order);

      const processPutRequestSpy = jest.spyOn(RecordController, 'processPutRequest').mockImplementation(() => {
        return Promise.resolve({ test: 'record' });
      });
      
      const nrptiRecord = {
        "_schemaName": "BCMI",
        "_sourceRefId": "",
        "issuingAgency": "AGENCY_EAO",
        "recordName": "",
        "recordType": RECORD_TYPE.Order.displayName,
        "dateIssued": null,
        "projectName": "",
        "sourceDateAdded": null,
        "sourceDateUpdated": null,
        "sourceSystemRef": "epic"
      }
      
      const existingRecord = {
        "id": "5e6e5f4e0f0c2a001b0b5f6b",
        "_schemaName": "BCMI",
        "_sourceRefId": "",
        "issuingAgency": "AGENCY_EAO",
        "recordName": "Test Record Name",
        "recordType": RECORD_TYPE.Order.displayName,
        "dateIssued": null,
        "projectName": "Project Name",
        "sourceDateAdded": null,
        "sourceDateUpdated": null,
        "sourceSystemRef": "epic",
        "_flavourRecords": [{ _id: 321, _schemaName: 'flavourSchema' }],
      }
      
      await baseRecordUtils.updateRecord(nrptiRecord, existingRecord);

      expect(processPutRequestSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('createItem', () => {
    it('throws error if no record provided', async () => {
      const baseRecordUtils = new BaseRecordUtils(null, RECORD_TYPE.Order);
      await expect(baseRecordUtils.createItem()).rejects.toThrow(
        new Error('createItem - required nrptiRecord must be non-null.')
      );
    });

    it('catches any errors thrown when creating/saving the record', async () => {
      jest.spyOn(require('../../controllers/record-controller'), 'processPostRequest').mockImplementation(() => {
        throw Error('should be caught');
      });

      const baseRecordUtils = new BaseRecordUtils(null, RECORD_TYPE.Order);

      const orderRecord = { _id: '321' };

      await expect(baseRecordUtils.createItem(orderRecord)).resolves.not.toThrow();
    });

    it('creates and saves a new record', async () => {
      jest.spyOn(require('../../controllers/record-controller'), 'processPostRequest').mockImplementation(() => {
        return [{ status: 'success' }];
      });

      const baseRecordUtils = new BaseRecordUtils(null, RECORD_TYPE.Order);

      const orderRecord = { _id: '123' };

      const status = await baseRecordUtils.createItem(orderRecord);

      expect(status).toEqual([{ status: 'success' }]);
    });
  });

  describe('isRecordFeeOrder', () => {
    it('returns false if no record provided', async () => {
      const baseRecordUtils = new BaseRecordUtils('auth_payload', RECORD_TYPE.Order);

      try {
        await baseRecordUtils.isRecordFeeOrder();
      } catch (error) {
        expect(error).toEqual(new Error('isRecordFeeOrder - required transformedRecord must be non-null and include recordName.'));
      }
    });

    it('returns true if recordName is a fee order', async () => {
      const baseRecordUtils = new BaseRecordUtils('auth_payload', RECORD_TYPE.Order);

      const transformedRecord = [
        {
          recordName: 'fee order'
        },
        {
          recordName: 'order to pay feese'
        },
        {
          recordName: 'fee package'
        }
      ]

      transformedRecord.forEach((record) => {
        const actual = baseRecordUtils.isRecordFeeOrder(record);
        expect(actual).toEqual(true);
      });
    });

    it('returns false if recordName is not a fee order', async () => {
      const baseRecordUtils = new BaseRecordUtils('auth_payload', RECORD_TYPE.Order);

      const transformedRecord = {
        recordName: 'test record without fee in it'
      };

      const actual = await baseRecordUtils.isRecordFeeOrder(transformedRecord);

      expect(actual).toEqual(false);
    });
  });
});
