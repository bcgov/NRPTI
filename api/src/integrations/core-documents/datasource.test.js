const DataSource = require('./datasource');
const integrationUtils = require('../integration-utils');

describe('CoreDocumentsDataSource', () => {
  describe('constructor', () => {
    it('sets taskAuditRecord', () => {
      const dataSource = new DataSource('testing');
      expect(dataSource.taskAuditRecord).toEqual('testing');
    });

    it('sets auth_payload', () => {
      const dataSource = new DataSource('', 'testing');
      expect(dataSource.auth_payload).toEqual('testing');
    });

    it('sets default status fields', () => {
      const dataSource = new DataSource();
      expect(dataSource.status).toEqual({
        itemsProcessed: 0,
        itemTotal: 0,
        individualRecordStatus: []
      });
    });
  });

  describe('processRecord', () => {
    it('throws error if no amendments', () => {
      const dataSource = new DataSource();
      expect(dataSource.processRecord(null, {})).rejects.toThrow('Param amendment is required and must have documents.');
    });

    it('throws error if amendments is missing documents', () => {
      const dataSource = new DataSource();
      expect(dataSource.processRecord({ documents: null }, {})).rejects.toThrow('Param amendment is required and must have documents.');
    });
  });

  describe('getDownloadToken', () => {
    it('throws error if no documentId', () => {
      const dataSource = new DataSource();
      expect(dataSource.getDownloadToken(null)).rejects.toThrow('getDownloadToken - param documentId must not be null');
    });

    it('returns download token', async () => {
      const dataSource = new DataSource();

      jest.spyOn(integrationUtils, 'getIntegrationUrl').mockReturnValue('/test/');
      jest.spyOn(integrationUtils, 'getRecords').mockReturnValue(Promise.resolve({ token_guid: 'testing' }));

      const token = await dataSource.getDownloadToken('testing');

      expect(token).toEqual('testing');
    });
  });
});
