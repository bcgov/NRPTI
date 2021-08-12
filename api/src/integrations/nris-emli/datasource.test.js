const mockingoose = require('mockingoose');
const moment = require('moment');

const NrisDataSource = require('./datasource');

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
          assessmentSubType: 'Inspection',
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
          assessmentSubType: 'Inspection',
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
        assessmentSubType: 'Inspection',
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

    it('should not process audit record', async () => {
      const dataSource = new NrisDataSource();

      const record = {
        assessmentSubType: 'Inspection',
        assessmentSubStatus: 'Closed',
        inspection: {
          inspectionType: ['Audit'],
          inspctReportSentDate: moment()
            .subtract(43, 'days')
            .format(),
          inspectionSubType: 'Mine Inspection'
        }
      };

      const result = dataSource.shouldProcessRecord(record);
      expect(result).toEqual(false);
    });

    it('should not process non Mine Inspection record', async () => {
      const dataSource = new NrisDataSource();

      const record = {
        assessmentSubType: 'Inspection',
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

    it('should process Compliance Review OR Inspection assessmentSubType record', async () => {
      const dataSource = new NrisDataSource();

      const assessmentSubTypeList = ['Compliance Review', 'Inspection'];

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
});
