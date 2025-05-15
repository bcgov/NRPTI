const mockingoose = require('mockingoose');
const integrationUtils = require('../integration-utils');
const moment = require('moment');
const RecordController = require('../../controllers/record-controller');
const defaultLogger = require('../../utils/logger')('nris-emli-datasource');
const BusinessLogicManager = require('../../utils/business-logic-manager');
const documentController = require('../../controllers/document-controller');
const axios = require('axios');
// eslint-disable-next-line no-unused-vars
const fs = require('fs');

const NrisDataSource = require('./datasource');

jest.mock('axios');
jest.mock('fs');

const _nrisInspectionDocument = {
  _id: '507f191e810c19729de860ea',
  attachment: [],
  assessmentId: 1234,
  authorization: {
    sourceId: 1234
  },
  inspection: {
    inspctReportSentDate: new Date(),
    inspectionType: ['Electrical']
  },
  location: {
    locationName: 'My location',
    latitude: 48.407326,
    longitude: -123.329773
  }
};

describe('NrisDataSource', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('sets params', () => {
      const dataSource = new NrisDataSource(null, null, { params: 1 });
      expect(dataSource.params).toEqual({ params: 1 });
    });

    it('sets default params if not provided', () => {
      const dataSource = new NrisDataSource();
      expect(dataSource.params).toEqual({});
    });

    it('sets auth_payload', () => {
      const dataSource = new NrisDataSource(null, { auth_payload: 'some payload' }, { params: 1 });
      expect(dataSource.auth_payload).toEqual({ auth_payload: 'some payload' });
    });

    it('sets default status fields', () => {
      const dataSource = new NrisDataSource();
      expect(dataSource).toEqual({ auth_payload: undefined, params: {} });
    });
  });

  describe('run', () => {
    it('executes run method successfully', async () => {
      const mockedTaskAuditRecord = { updateTaskRecord: jest.fn().mockResolvedValueOnce({ status: 'Running' }) };
      const dataSource = new NrisDataSource(mockedTaskAuditRecord);
  
      await dataSource.run();
  
      expect(mockedTaskAuditRecord.updateTaskRecord).toHaveBeenCalledWith({ status: 'Running' });
    });

    it("should return auth error if there's an issue getting data from NRIS endpoint", async () => {
      const mockedTaskAuditRecord = { updateTaskRecord: jest.fn().mockResolvedValueOnce({ status: 'Running' }) };
      const dataSource = new NrisDataSource(mockedTaskAuditRecord);

      axios.get.mockImplementation(() => Promise.resolve({data : null}));
      
      const result = await dataSource.run();
      expect(result).toEqual({ status: 'Auth Error' });
    });

    it("should run through updating the records", async () => {
      const mockedTaskAuditRecord = { updateTaskRecord: jest.fn().mockResolvedValueOnce({ status: 'Running' }) };
      const dataSource = new NrisDataSource(mockedTaskAuditRecord);

      axios.get.mockImplementation(() => Promise.resolve({
        data : {
          access_token: 'test',
          expires_in: 3600,
        }
      }));

      jest.spyOn(dataSource, 'updateRecords').mockImplementation(() => {
        return {
          status: 'Completed',
          message: 'updateRecordType - all done.',
          itemsProcessed: 0,
          itemTotal: 0,
        }
      });    
      
      const result = await dataSource.run();
      expect(result).toEqual({
        status: 'Complete',
        message: 'Job Complete',
        itemsProcessed: 0,
        itemTotal: 0
      });
    });
  });

  describe('createItem', () => {
    it('should call createItem without an existing record and error out', async () => {
      const dataSource = new NrisDataSource();

      await expect(dataSource.createItem(null)).rejects.toThrow('createItem - required record must be non-null.');
    });
    
    it('should call createItem and call processPostRequest', async () => {
      const dataSource = new NrisDataSource();
      const record = {
        _id: '507f191e810c19729de860ea',
        description: 'Test Description'
      };

      const processPostRequest = jest.spyOn(RecordController, 'processPostRequest').mockImplementation(() => {
        return {};
      });

      await dataSource.createItem(record);

      expect(processPostRequest).toHaveBeenCalled();
    });

    it('should call createItem but error out on processPostRequest', async () => {
      const dataSource = new NrisDataSource();

      jest.spyOn(RecordController,'processPostRequest').mockRejectedValue(() => {
        return [
          {
            "status": "failure"
          }
        ]
     });

      const errorSpy = jest.spyOn(defaultLogger, 'error').mockImplementation(() => {});

      const record = {
        _id: '507f191e810c19729de860ea',
        description: 'Test Description'
      };

      try {
        await dataSource.createItem(record);
      } catch (error) {
        expect(errorSpy.error).toHaveBeenCalledWith();
      }
    });
  });

  describe('findExistingRecord', () => {
    it('should findExistingRecord', async () => {
      const dataSource = new NrisDataSource();
      // eslint-disable-next-line no-unused-vars
      const Inspection = require('../../models/master/inspection');

      mockingoose('Inspection').toReturn(_nrisInspectionDocument, 'findOne');
      const doc = await dataSource.findExistingRecord(_nrisInspectionDocument);
      expect(JSON.parse(JSON.stringify(doc))._id).toBe(_nrisInspectionDocument._id);
      expect([]).toEqual(expect.arrayContaining(doc._flavourRecords));
    });

    it('should findExistingDocument', async () => {
      const dataSource = new NrisDataSource();
      // eslint-disable-next-line no-unused-vars
      const Document = require('../../models/document');
      const _doc = {
        _id: '507f191e810c19729de860ea',
        fileName: 'Test Filename.pdf'
      };

      mockingoose('Document').toReturn(_doc, 'findOne');
      const doc = await dataSource.findExistingDocument(_doc);
      expect(doc.fileName).toEqual(_doc.fileName);
    });
  });

  describe('transformRecord', () => {
    it('should transformRecord', async () => {
      const dataSource = new NrisDataSource();
      // eslint-disable-next-line no-unused-vars
      const Inspection = require('../../models/master/inspection');

      mockingoose('Inspection').toReturn(_nrisInspectionDocument, 'findOne');
      const doc = await dataSource.transformRecord(_nrisInspectionDocument);
      expect(doc.fileName).toEqual(_nrisInspectionDocument.fileName);
      expect(doc.legislation[0].legislationDescription).toEqual(
        'Inspection to verify compliance with regulatory requirements.'
      );
    });
  });

  describe('shouldProcessRecord', () => {
    it('should not process null record', async () => {
      const dataSource = new NrisDataSource();

      const result = dataSource.shouldProcessRecord();
      expect(result).toEqual(false);
    });

    it('should process valid report sent or response received record', async () => {
      const dataSource = new NrisDataSource();

      const assessmentSubStatusList = ['Response Received', 'Report Sent'];

      for (const assessmentSubStatus of assessmentSubStatusList) {
        const record = {
          assessmentSubType: 'Inspection - Site Visit',
          assessmentSubStatus: assessmentSubStatus,
          inspection: {
            inspectionType: ['Health and Safety'],
            inspctReportSentDate: '2020-01-27 00:00',
            inspectionSubType: 'Mine Inspection'
          }
        };

        const result = dataSource.shouldProcessRecord(record);
        expect(result).toEqual(true);
      }
    });

    it('should not process report sent or response received record newer than 45 days', async () => {
      const dataSource = new NrisDataSource();

      const assessmentSubStatusList = ['Response Received', 'Report Sent'];

      for (const assessmentSubStatus of assessmentSubStatusList) {
        const record = {
          assessmentSubType: 'Inspection - Site Visit',
          assessmentSubStatus: assessmentSubStatus,
          inspection: {
            inspectionType: ['Health and Safety'],
            inspctReportSentDate: moment()
              .subtract(43, 'days')
              .format(),
            inspectionSubType: 'Mine Inspection'
          }
        };

        const result = dataSource.shouldProcessRecord(record);
        expect(result).toEqual(false);
      }
    });

    it('should process closed record', async () => {
      const dataSource = new NrisDataSource();

      const record = {
        assessmentSubType: 'Inspection - Site Visit',
        assessmentSubStatus: 'Closed',
        inspection: {
          inspectionType: ['Health and Safety'],
          inspctReportSentDate: moment()
            .subtract(43, 'days')
            .format(),
          inspectionSubType: 'Mine Inspection'
        }
      };

      const result = dataSource.shouldProcessRecord(record);
      expect(result).toEqual(true);
    });

    it('should not process non Mine Inspection record', async () => {
      const dataSource = new NrisDataSource();

      const record = {
        assessmentSubType: 'Inspection - Site Visit',
        assessmentSubStatus: 'Closed',
        inspection: {
          inspectionType: ['Health and Safety'],
          inspctReportSentDate: moment()
            .subtract(43, 'days')
            .format(),
          inspectionSubType: 'inspectionSubType'
        }
      };

      const result = dataSource.shouldProcessRecord(record);
      expect(result).toEqual(false);
    });

    it('should process inspection assessmentSubType records', async () => {
      const dataSource = new NrisDataSource();

      const assessmentSubTypeList = ['Inspection - Site Visit', 'Inspection - Desktop'];

      for (const assessmentSubType of assessmentSubTypeList) {
        const record = {
          assessmentSubType: assessmentSubType,
          assessmentSubStatus: 'Response Received',
          inspection: {
            inspectionType: ['Health and Safety'],
            inspctReportSentDate: '2020-01-27 00:00',
            inspectionSubType: 'Mine Inspection'
          }
        };

        const result = dataSource.shouldProcessRecord(record);
        expect(result).toEqual(true);
      }
    });

    it('should not process other assessmentSubType record', async () => {
      const dataSource = new NrisDataSource();
      
      const record = {
        assessmentSubType: 'assessmentSubType',
        assessmentSubStatus: 'Response Received',
        inspection: {
          inspectionType: ['Health and Safety'],
          inspctReportSentDate: '2020-01-27 00:00',
          inspectionSubType: 'Mine Inspection'
        }
      };

      const result = dataSource.shouldProcessRecord(record);
      expect(result).toEqual(false);
    });
  });

  describe('updateRecords', () => {
    it('should call updateRecords without a record to return', async () => {
      const dataSource = new NrisDataSource();

      const getRecords = jest.spyOn(integrationUtils, 'getRecords').mockImplementation(() => {
        return {};
      });

      const result = await dataSource.updateRecords('start date', 'end date');

      expect(getRecords).toHaveBeenCalled();
      expect(result.status).toEqual('Completed');
    });

    it('should call updateRecords with an existing record to create a document', async () => {
      const dataSource = new NrisDataSource();
      
      jest.spyOn(dataSource, 'shouldProcessRecord').mockImplementation(() => {
        return true;
      });
      
      const createRecordAttachments = jest.spyOn(dataSource, 'createRecordAttachments').mockImplementation(() => {
        return {};
      });
      
      // newRecord
      const transformRecord = jest.spyOn(dataSource, 'transformRecord').mockImplementation(() => {
        return {
          "newRecord": "newRecord",
          "documents": []
        };
      });
      
      // existingRecord
      const findExistingRecord = jest.spyOn(dataSource, 'findExistingRecord').mockImplementation(() => {
        return {
          "existingRecord": "existingRecord"
        };
      });
      
      const getRecords = jest.spyOn(integrationUtils, 'getRecords').mockImplementation(() => {
        return [
          { "testRecord": "testRecord" }
        ];
      });
      
      const result = await dataSource.updateRecords('start date', 'end date');
      
      expect(getRecords).toHaveBeenCalled(); // gets records
      expect(transformRecord).toHaveBeenCalled(); // calls to create newRecord
      expect(findExistingRecord).toHaveBeenCalled(); // calls to find existingRecord
      expect(createRecordAttachments).toHaveBeenCalled(); // calls to create newDocument
      expect(result.status).toEqual('Completed');
      expect(result.message).toEqual('updateRecordType - all done.');
    });
    
    it('should call updateRecords with a new record, creates a document and the record', async () => {
      const dataSource = new NrisDataSource();

      jest.spyOn(dataSource, 'shouldProcessRecord').mockImplementation(() => {
        return true;
      });
      
      const createRecordAttachments = jest.spyOn(dataSource, 'createRecordAttachments').mockImplementation(() => {
        return {};
      });
      
      const createItem = jest.spyOn(dataSource, 'createItem').mockImplementation(() => {
        return {};
      });
      
      // newRecord
      const transformRecord = jest.spyOn(dataSource, 'transformRecord').mockImplementation(() => {
        return {
          "newRecord": "newRecord",
          "documents": [
            {
              "newDocument": "newDocument"
            }
          ]
        };
      });

      // existingRecord
      const findExistingRecord = jest.spyOn(dataSource, 'findExistingRecord').mockImplementation(() => {
        return false;
      });

      const getRecords = jest.spyOn(integrationUtils, 'getRecords').mockImplementation(() => {
        return [
          { "testRecord": "testRecord" }
        ];
      });

      const result = await dataSource.updateRecords('start date', 'end date');

      expect(getRecords).toHaveBeenCalled(); // gets records
      expect(transformRecord).toHaveBeenCalled(); // calls to create newRecord
      expect(findExistingRecord).toHaveBeenCalled(); // calls to find existingRecord
      expect(createRecordAttachments).toHaveBeenCalled(); // calls to create newDocument
      expect(createItem).toHaveBeenCalled(); // calls to create newDocument
      expect(result.status).toEqual('Completed');
      expect(result.message).toEqual('updateRecordType - all done.');
    });
  });

  describe('createRecordAttachments', () => {
    it('should be able to call putFileS3', async () => {
      const dataSource = new NrisDataSource();
  
      dataSource.getFileFromNRIS = jest.fn().mockImplementation((assessmentId, attachmentId) => {
        return {
          tempFilePath: 'mocked/temp/path',
          fileName: 'mockedFileName.txt',
        };
      });
  
      dataSource.putFileS3 = jest.fn().mockResolvedValue(true);
  
      const record = {
        assessmentId: 'sampleAssessmentId',
        attachment: [
          { attachmentId: 'attachmentId1', fileType: 'Other' },
          { attachmentId: 'attachmentId2', fileType: 'Final Report', attachmentMediaType: 'application/pdf'},
          //{ attachmentId: 'attachmentId3', fileType: 'Report', attachmentComment: 'Inspection Report'},
          //{ attachmentId: 'attachmentId3', fileType: 'Report', attachmentComment: 'Inspection Report', attachmentDate: "2020-01-10 11:50"},
          //{ attachmentId: 'attachmentId4', fileType: 'Report', attachmentComment: 'Inspection Report', attachmentDate: "2024-06-06" },
        ],
      };
  
      const newRecord = {};
      await dataSource.createRecordAttachments(record, newRecord);
  
      expect(dataSource.getFileFromNRIS).toHaveBeenCalledTimes(1);
      expect(dataSource.getFileFromNRIS).toHaveBeenCalledWith('sampleAssessmentId', 'attachmentId2');
      //expect(dataSource.getFileFromNRIS).toHaveBeenCalledWith('sampleAssessmentId', 'attachmentId4');
  
      expect(dataSource.putFileS3).toHaveBeenCalledTimes(1);
    });
  });

  describe('getFileFromNRIS', () => {
    const MOCKED_INSPECTION_ID = 'mockedInspectionId';
    const MOCKED_ATTACHMENT_ID = 'mockedAttachmentId';

    it('should log an error if it fails to retrieve attachment', async () => {
      const dataSource = new NrisDataSource();

      const errorSpy = jest.spyOn(defaultLogger, 'error').mockImplementation(() => {});
      
      axios.get.mockImplementation(() => Promise.resolve(null));
      
      try {
        await dataSource.getFileFromNRIS(MOCKED_INSPECTION_ID, MOCKED_ATTACHMENT_ID);
      } catch (error) {
        expect(errorSpy.error).toHaveBeenCalledWith();
      }
    });
  });

  describe('putFileS3', () => {
    it('should call putFileS3 and utilize the createS3Document method', async () => {
      const dataSource = new NrisDataSource();

      const isDocumentConsideredAnonymous = jest.spyOn(BusinessLogicManager, 'isDocumentConsideredAnonymous').mockImplementation(() => {
        return {};
      });

      const createS3Document = jest.spyOn(documentController, 'createS3Document').mockImplementation(() => {
        return {
          docResponse: 'true',
          s3Response: 'true'
        };
      });
      
      const newRecord = {
        _id: '507f191e810c19729de860ea',
        documents: [
          '507f191e810c19729de860eb',
        ],
      };

      await dataSource.putFileS3({file: 'File'}, {fileName: 'file name'}, {newRecord});

      expect(isDocumentConsideredAnonymous).toHaveBeenCalled();
      expect(createS3Document).toHaveBeenCalled();
    });
  });

  describe('updateRecord', () => {
    it('should call updateRecord without a new record and throw an error', async () => {
      const dataSource = new NrisDataSource();

      await expect(dataSource.updateRecord(null, { testRecord: 'testRecord' })).rejects.toThrow('updateRecord - required newRecord must be non-null.');
    });

    it('should call updateRecord without an existing record and throw an erorr', async () => {
      const dataSource = new NrisDataSource();

      await expect(dataSource.updateRecord({ testRecord: 'testRecord' }, null)).rejects.toThrow('updateRecord - required existingRecord must be non-null.');
    });

    it('should build updateObj and continue to processPutRequest', async () => {
      const dataSource = new NrisDataSource();

      const processPutRequest = jest.spyOn(RecordController, 'processPutRequest').mockImplementation(() => {
        return [{
          "test": "test"
        }];
      });

      const newRecord = {
        _id: '507f191e810c19729de860ea',
        _flavourRecords: []
      };

      const existingRecord = {
        _id: '507f191e810c19729de860ea',
        _flavourRecords: [
          {
            _id: '507f191e810c19729de860eb',
          }
        ],
        dateAdded: "2020-01-27",
      };

      const result = await dataSource.updateRecord(newRecord, existingRecord);

      expect(processPutRequest).toHaveBeenCalled();
      expect(result).toEqual([{ "test": "test" }]);
    });

    it('should build updateObj but error out on processPutRequest', async () => {
      const dataSource = new NrisDataSource();

      jest.spyOn(RecordController,'processPutRequest').mockRejectedValue(() => {
        return [
          {
            "status": "failure"
          }
        ]
     });

      const errorSpy = jest.spyOn(defaultLogger, 'error').mockImplementation(() => {});

      const newRecord = {
        _id: '507f191e810c19729de860ea',
        _flavourRecords: []
      };

      const existingRecord = {
        _id: '507f191e810c19729de860ea',
        _flavourRecords: [
          {
            _id: '507f191e810c19729de860eb',
          }
        ],
        dateAdded: "2020-01-27",
      };

      try {
        await dataSource.updateRecord(newRecord, existingRecord);
      } catch (error) {
        expect(errorSpy.error).toHaveBeenCalledWith();
      }
    });
  });
});
