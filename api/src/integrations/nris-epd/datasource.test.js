const NrisDataSource = require('./datasource');
const mockingoose = require('mockingoose');

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

  describe('transformRecord', () => {
    it.each([
      [_nrisInspectionDocument, 'AGENCY_CAS'],
      [_nrisInspectionDocument_FLNRO, 'AGENCY_FLNRO'],
      [_nrisInspectionDocument_EAO, 'AGENCY_EAO']
    ])('should return the appropriate agency code', async (record, expectedAgency) => {
      dataSource = new NrisDataSource();
      // eslint-disable-next-line no-unused-vars
      Inspection = require('../../models/master/inspection');

      mockingoose('Inspection').toReturn(record, 'findOne');
      const doc = await dataSource.transformRecord(record);
      expect(doc.fileName).toEqual(record.fileName);
      expect(doc.issuingAgency).toEqual(expectedAgency);
    });
  });
  
});
