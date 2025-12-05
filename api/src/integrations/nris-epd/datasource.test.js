const NrisDataSource = require('./datasource');
const integrationUtils = require('../integration-utils');
const mockingoose = require('mockingoose');
// eslint-disable-next-line no-unused-vars
const fs = require('fs');
const axios = require('axios');
const defaultLogger = require('../../utils/logger')('nris-epd/datasource');
const BusinessLogicManager = require('../../utils/business-logic-manager');
const documentController = require('../../controllers/document-controller');
const RecordController = require('../../controllers/record-controller');

jest.mock('axios');
jest.mock('fs');

const _nrisInspectionDocument = {
  _id: '507f191e810c19729de860ea',
  attachment: [],
  assessmentId: 1234,
  requirementSource: 'Greenhouse Gas Industrial Reporting and Control Act',
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

const _nrisInspectionDocument_FLNRO = {
  _id: '507f191e810c19729de860ea',
  attachment: [],
  assessmentId: 1234,
  issuingAgency: 'FLNRO',
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

const _nrisInspectionDocument_EAO = {
  _id: '507f191e810c19729de860ea',
  attachment: [],
  assessmentId: 1234,
  issuingAgency: 'Environmental Assessment Office',
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

      axios.get.mockImplementation(() => Promise.resolve({ data: null }));

      const result = await dataSource.run();
      expect(result).toEqual({ status: 'Auth Error' });
    });

    it('should run through updating the records', async () => {
      const mockedTaskAuditRecord = { updateTaskRecord: jest.fn().mockResolvedValueOnce({ status: 'Running' }) };
      const dataSource = new NrisDataSource(mockedTaskAuditRecord);

      axios.get.mockImplementation(() =>
        Promise.resolve({
          data: {
            access_token: 'test',
            expires_in: 3600
          }
        })
      );

      jest.spyOn(dataSource, 'updateRecords').mockImplementation(() => {
        return {
          status: 'Completed',
          message: 'updateRecordType - all done.',
          itemsProcessed: 0,
          itemTotal: 0
        };
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

  describe('updateRecords', () => {
    it('should gracefully handle record update with no records', async () => {
      const dataSource = new NrisDataSource();

      const getRecords = jest.spyOn(integrationUtils, 'getRecords').mockImplementation(() => {
        return [];
      });

      const result = await dataSource.updateRecords();

      expect(getRecords).toHaveBeenCalled();
      expect(result.itemsProcessed).toEqual(0);
      expect(result.itemTotal).toEqual(0);
      expect(result.status).toEqual('Completed');
      expect(result.message).toEqual('updateRecordType - no records found');
    });

    beforeEach(() => {
      // eslint-disable-next-line no-undef
      getRecordMock = assessmentStatusValue => {
        // eslint-disable-next-line no-undef
        dataSource = new NrisDataSource();

        return jest.spyOn(integrationUtils, 'getRecords').mockImplementation(() => {
          return [
            {
              _id: '507f191e810c19729de860ea',
              attachment: [],
              assessmentId: 1234,
              assessmentStatus: assessmentStatusValue,
              completionDate: '2023-01-01',
              requirementSource: 'Greenhouse Gas Industrial Reporting and Control Act',
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
            }
          ];
        });
      };

      /* eslint-disable no-undef */
      findExistingRecord = (mockReturn = {}) => {
        return jest.spyOn(dataSource, 'findExistingRecord').mockImplementation(() => {
          return mockReturn;
        });
      };

      shouldRecordHaveAttachments = (mockReturn = {}) => {
        return jest.spyOn(dataSource, 'shouldRecordHaveAttachments').mockImplementation(() => {
          return mockReturn;
        });
      };

      createRecordAttachments = (mockReturn = {}) => {
        return jest.spyOn(dataSource, 'createRecordAttachments').mockImplementation(() => {
          return mockReturn;
        });
      };

      updateRecord = (mockReturn = {}) => {
        return jest.spyOn(dataSource, 'updateRecord').mockImplementation(() => {
          return mockReturn;
        });
      };

      createItem = (mockReturn = {}) => {
        return jest.spyOn(dataSource, 'createItem').mockImplementation(() => {
          return mockReturn;
        });
      };

      transformRecord = (mockReturn = []) => {
        return jest.spyOn(dataSource, 'transformRecord').mockImplementation(() => {
          return {
            documents: mockReturn
          };
        });
      };
      /* eslint-enable no-undef */
    });

    it('should handle record update with one incomplete record', async () => {
      // eslint-disable-next-line no-undef
      const getRecords = getRecordMock('Incomplete');

      // eslint-disable-next-line no-undef
      const result = await dataSource.updateRecords();

      expect(getRecords).toHaveBeenCalled();
      expect(result.itemsProcessed).toEqual(0);
      expect(result.itemTotal).toEqual(0);
      expect(result.status).toEqual('Completed');
      expect(result.message).toEqual('updateRecordType - all done.');
    });

    it('should handle record update with one completed record with no document, and existing record exists', async () => {
      // eslint-disable-next-line no-undef
      const getRecords = getRecordMock('Complete');

      /* eslint-disable no-undef */
      const mockTransformRecord = transformRecord();
      const mockFindExistingRecord = findExistingRecord(true);
      const mockShouldRecordHaveAttachments = shouldRecordHaveAttachments(true);
      const mockCreateRecordAttachments = createRecordAttachments();
      const mockUpdateRecord = updateRecord();
      const mockCreateItem = createItem();
      /* eslint-enable no-undef */

      // eslint-disable-next-line no-undef
      const result = await dataSource.updateRecords();

      expect(getRecords).toHaveBeenCalled();
      expect(mockTransformRecord).toHaveBeenCalled();
      expect(mockFindExistingRecord).toHaveBeenCalled();
      expect(mockShouldRecordHaveAttachments).toHaveBeenCalled();
      expect(mockCreateRecordAttachments).toHaveBeenCalled();
      expect(mockUpdateRecord).toHaveBeenCalled();
      expect(mockCreateItem).not.toHaveBeenCalled();

      expect(result.itemsProcessed).toEqual(1);
      expect(result.itemTotal).toEqual(1);
      expect(result.status).toEqual('Completed');
      expect(result.message).toEqual('updateRecordType - all done.');
    });

    it("should handle record update with one completed record with a document, but existing record doesn't exists", async () => {
      // eslint-disable-next-line no-undef
      const getRecords = getRecordMock('Complete');

      const documentReturn = ['some file name'];

      /* eslint-disable no-undef */
      const mockTransformRecord = transformRecord(documentReturn);
      const mockFindExistingRecord = findExistingRecord(false);
      const mockShouldRecordHaveAttachments = shouldRecordHaveAttachments(true);
      const mockCreateRecordAttachments = createRecordAttachments();
      const mockUpdateRecord = updateRecord();
      const mockCreateItem = createItem();
      /* eslint-enable no-undef */

      // eslint-disable-next-line no-undef
      const result = await dataSource.updateRecords();

      expect(getRecords).toHaveBeenCalled();
      expect(mockTransformRecord).toHaveBeenCalled();
      expect(mockFindExistingRecord).toHaveBeenCalled();
      expect(mockShouldRecordHaveAttachments).toHaveBeenCalled();
      expect(mockCreateRecordAttachments).toHaveBeenCalled();
      expect(mockUpdateRecord).not.toHaveBeenCalled();
      expect(mockCreateItem).toHaveBeenCalled();

      expect(result.itemsProcessed).toEqual(1);
      expect(result.itemTotal).toEqual(1);
      expect(result.status).toEqual('Completed');
      expect(result.message).toEqual('updateRecordType - all done.');
    });
  });

  describe('stringTransform functions', () => {
    it('should return AGENCY_ENV', async () => {
      const dataSource = new NrisDataSource();

      const result = await dataSource.stringTransformEPOtoEPD('Environmental Protection Office');
      expect(result).toEqual('AGENCY_ENV');
    });

    it('should return the appropriate string for AMP', async () => {
      const dataSource = new NrisDataSource();

      const result = await dataSource.stringTransformExpandAMP('AMP');
      expect(result).toEqual('Recommended for administrative monetary penalty');
    });
  });

  describe('transformRecord', () => {
    it.each([
      [_nrisInspectionDocument, 'AGENCY_CAS'],
      [_nrisInspectionDocument_FLNRO, 'AGENCY_FLNRO'],
      [_nrisInspectionDocument_EAO, 'AGENCY_EAO']
    ])('should return the appropriate agency code', async (record, expectedAgency) => {
      const dataSource = new NrisDataSource();
      // eslint-disable-next-line no-unused-vars
      const Inspection = require('../../models/master/inspection');

      mockingoose('Inspection').toReturn(record, 'findOne');
      const doc = await dataSource.transformRecord(record);
      expect(doc.fileName).toEqual(record.fileName);
      expect(doc.issuingAgency).toEqual(expectedAgency);
    });
  });

  describe('createRecordAttachments', () => {
    it('should be able to call putFileS3', async () => {
      const dataSource = new NrisDataSource();

      dataSource.getFileFromNRIS = jest.fn().mockImplementation((assessmentId, attachmentId) => {
        return {
          tempFilePath: 'mocked/temp/path',
          fileName: 'mockedFileName.txt'
        };
      });

      dataSource.putFileS3 = jest.fn().mockResolvedValue(true);

      const record = {
        assessmentId: 'sampleAssessmentId',
        attachment: [
          { attachmentId: 'attachmentId1', fileType: 'Other' },
          { attachmentId: 'attachmentId2', fileType: 'Final Report' }
        ]
      };

      const newRecord = {};
      await dataSource.createRecordAttachments(record, newRecord);

      expect(dataSource.getFileFromNRIS).toHaveBeenCalledTimes(1);
      expect(dataSource.getFileFromNRIS).toHaveBeenCalledWith('sampleAssessmentId', 'attachmentId2');

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

      const isDocumentConsideredAnonymous = jest
        .spyOn(BusinessLogicManager, 'isDocumentConsideredAnonymous')
        .mockImplementation(() => {
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
        documents: ['507f191e810c19729de860eb']
      };

      await dataSource.putFileS3({ file: 'File' }, { fileName: 'file name' }, { newRecord });

      expect(isDocumentConsideredAnonymous).toHaveBeenCalled();
      expect(createS3Document).toHaveBeenCalled();
    });
  });

  describe('createItem', () => {
    it('throws an error when record is null', async () => {
      const dataSource = new NrisDataSource();
      await expect(dataSource.createItem(null)).rejects.toThrow('createItem - required record must be non-null.');
    });

    it('attempts to create an item', async () => {
      const dataSource = new NrisDataSource();

      const processPostRequest = jest.spyOn(RecordController, 'processPostRequest').mockImplementation(() => {
        return {
          status: 'success',
          object: {}
        };
      });

      const record = {
        _id: '507f191e810c19729de860ea',
        description: 'some description'
      };

      const result = await dataSource.createItem(record);

      expect(processPostRequest).toHaveBeenCalled();
      expect(result.status).toEqual('success');
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

  describe('updateRecord', () => {
    it('should call updateRecord without a new record and throw an error', async () => {
      const dataSource = new NrisDataSource();

      await expect(dataSource.updateRecord(null, { testRecord: 'testRecord' })).rejects.toThrow(
        'updateRecord - required newRecord must be non-null.'
      );
    });

    it('should call updateRecord without an existing record and throw an erorr', async () => {
      const dataSource = new NrisDataSource();

      await expect(dataSource.updateRecord({ testRecord: 'testRecord' }, null)).rejects.toThrow(
        'updateRecord - required existingRecord must be non-null.'
      );
    });

    it('should build updateObj and continue to processPutRequest', async () => {
      const dataSource = new NrisDataSource();

      const processPutRequest = jest.spyOn(RecordController, 'processPutRequest').mockImplementation(() => {
        return [
          {
            test: 'test'
          }
        ];
      });

      const newRecord = {
        _id: '507f191e810c19729de860ea',
        _flavourRecords: []
      };

      const existingRecord = {
        _id: '507f191e810c19729de860ea',
        _flavourRecords: [
          {
            _id: '507f191e810c19729de860eb'
          }
        ],
        dateAdded: '2020-01-27'
      };

      const result = await dataSource.updateRecord(newRecord, existingRecord);

      expect(processPutRequest).toHaveBeenCalled();
      expect(result).toEqual([{ test: 'test' }]);
    });

    it('should build updateObj but error out on processPutRequest', async () => {
      const dataSource = new NrisDataSource();

      jest.spyOn(RecordController, 'processPutRequest').mockRejectedValue(() => {
        return [
          {
            status: 'failure'
          }
        ];
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
            _id: '507f191e810c19729de860eb'
          }
        ],
        dateAdded: '2020-01-27'
      };

      try {
        await dataSource.updateRecord(newRecord, existingRecord);
      } catch (error) {
        expect(errorSpy.error).toHaveBeenCalledWith();
      }
    });
  });

  describe('getLegislation', () => {
    it('returns Environmental Management Act section 109 with no record', async () => {
      const dataSource = new NrisDataSource();

      const record = null;

      const result = await dataSource.getLegislation(record);

      expect(result).toEqual({ act: 'Environmental Management Act', section: 109 });
    });

    it('returns appropriate act and section for each requirementSource', async () => {
      const dataSource = new NrisDataSource();

      const requirementSources = [
        'Integrated Pest Management Act',
        'Integrated Pest Management Regulation',
        'Administrative Penalties (Integrated Pest Management Act) Regulation',
        'Greenhouse Gas Industrial Reporting and Control Act',
        'Anything Else'
      ];

      const actsAndSections = {
        'Integrated Pest Management Act': {
          act: 'Integrated Pest Management Act',
          section: 17
        },
        'Integrated Pest Management Regulation': {
          act: 'Integrated Pest Management Act',
          section: 17
        },
        'Administrative Penalties (Integrated Pest Management Act) Regulation': {
          act: 'Integrated Pest Management Act',
          section: 17
        },
        'Greenhouse Gas Industrial Reporting and Control Act': {
          act: 'Greenhouse Gas Industrial Reporting and Control Act',
          section: 22
        },
        'Anything Else': {
          act: 'Environmental Management Act',
          section: 109
        }
      };

      requirementSources.forEach(async requirementSource => {
        const record = {
          requirementSource
        };

        const result = await dataSource.getLegislation(record);

        expect(result).toEqual(actsAndSections[requirementSource]);
      });
    });
  });

  describe('shouldRecordHaveAttachments', () => {
    it('should return false for a record with Greenhouse Gas Industrial Reporting and Control Act', async () => {
      const dataSource = new NrisDataSource();

      const record = {
        legislation: [{ act: 'Greenhouse Gas Industrial Reporting and Control Act', fileType: 'Other' }]
      };

      const result = await dataSource.shouldRecordHaveAttachments(record);

      expect(result).toEqual(false);
    });

    it('should return true for a record with an appropriate act', async () => {
      const dataSource = new NrisDataSource();

      const record = {
        legislation: [{ act: 'Environmental Management Act', fileType: 'Other' }]
      };

      const result = await dataSource.shouldRecordHaveAttachments(record);

      expect(result).toEqual(true);
    });
  });
});
