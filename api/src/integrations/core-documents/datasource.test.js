const DataSource = require('./datasource');
const integrationUtils = require('../integration-utils');
const mongoose = require('mongoose');
const axios = require('axios');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { Readable } = require('stream');
const DocumentController = require('../../controllers/document-controller');
const permitUtils = require('./permit-utils');
const coreUtil = require('../core-util');

jest.mock('../../controllers/document-controller', () => ({
  createS3Document: jest.fn()
}));
jest.mock('axios');
jest.mock('./permit-utils', () => ({
  transformRecord: jest.fn(),
  updateRecord: jest.fn()
}));

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

  describe('run', () => {
    it('executes run method successfully', async () => {
      const mockedTaskAuditRecord = { updateTaskRecord: jest.fn().mockResolvedValueOnce({ status: 'Running' }) };
      const dataSource = new DataSource(mockedTaskAuditRecord);

      await dataSource.run();

      expect(mockedTaskAuditRecord.updateTaskRecord).toHaveBeenCalledWith({ status: 'Running' });
    });
  });

  describe('processRecord', () => {
    it('throws error if no permit', () => {
      const dataSource = new DataSource();
      expect(dataSource.processRecord(null, {})).resolves.toEqual(false);
    });
  });

  describe('getPermits', () => {
    it('should call getPermits with mocked data', async () => {
      const existingRecord = {
        _id: 123,
        _sourceDocumentRefId: 'permit_amendment_guid',
        documents: []
      };
      const mockFind = jest.fn().mockReturnThis();
      const mockPopulate = jest.fn().mockResolvedValue([existingRecord]);

      const mockPermitAmendment = {
        find: mockFind,
        populate: mockPopulate
      };

      mongoose.model = jest.fn(() => mockPermitAmendment);

      const dataSource = new DataSource();
      await dataSource.getPermits();

      expect(mongoose.model).toHaveBeenCalledWith('Permit');
      expect(mockFind).toHaveBeenCalledWith({
        _schemaName: 'Permit',
        _sourceDocumentRefId: { $ne: null },
        documents: []
      });
      expect(mockPopulate).toHaveBeenCalledWith('_flavourRecords');
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
      jest.spyOn(coreUtil.prototype, 'getRecords').mockReturnValue(Promise.resolve({ token_guid: 'testing' }));

      const token = await dataSource.getDownloadToken('testing');

      expect(token).toEqual('testing');
    });
  });

  describe('getTemporaryDocument', () => {
    it('should throw an error if documentId or documentName is missing', async () => {
      const dataSource = new DataSource();

      await expect(dataSource.getTemporaryDocument(null, 'example.docx')).rejects.toThrow(
        'getTemporaryDocument - param documentId must not be null'
      );

      await expect(dataSource.getTemporaryDocument('documentId', null)).rejects.toThrow(
        'getTemporaryDocument - param documentName must not be null'
      );
    });

    it('should download and save a document to a temporary location with a mocked URL', async () => {
      const documentId = 'documentId';
      const documentName = 'example.pdf';
      const mockDownloadToken = 'downloadToken';
      const mockResponseStream = new Readable();
      mockResponseStream.push('%PDF-1.4\n%%EOF');
      mockResponseStream.push(null);
      const mockResponse = {
        data: mockResponseStream,
        status: 200,
        headers: { 'content-type': 'application/pdf' }
      };

      axios.get.mockResolvedValue(mockResponse);

      const dataSource = new DataSource();
      dataSource.getDownloadToken = jest.fn().mockResolvedValue(mockDownloadToken);

      const uploadDir = fs.mkdtempSync(path.join(os.tmpdir(), 'core-documents-test-'));
      const previousUploadDir = process.env.UPLOAD_DIRECTORY;
      process.env.UPLOAD_DIRECTORY = uploadDir;

      try {
        const tempFilePath = await dataSource.getTemporaryDocument(documentId, documentName);

        expect(fs.readFileSync(tempFilePath, 'utf8')).toBe('%PDF-1.4\n%%EOF');
        expect(axios.get).toHaveBeenCalledWith(
          `${process.env.CORE_API_HOST || 'https://mds-test.apps.silver.devops.gov.bc.ca'}/document-manager/documents`,
          {
            params: { token: mockDownloadToken },
            responseType: 'stream',
            headers: { Accept: 'application/pdf, application/octet-stream' },
            maxRedirects: 0
          }
        );
      } finally {
        fs.rmSync(uploadDir, { recursive: true, force: true });
        if (previousUploadDir === undefined) {
          delete process.env.UPLOAD_DIRECTORY;
        } else {
          process.env.UPLOAD_DIRECTORY = previousUploadDir;
        }
      }
    });

    it('rejects HTML responses for PDF documents', async () => {
      const htmlResponse = Readable.from('<!doctype html><title>CORE</title>');
      axios.get.mockResolvedValue({
        data: htmlResponse,
        status: 200,
        headers: { 'content-type': 'text/html; charset=utf-8' }
      });

      const dataSource = new DataSource();
      dataSource.getDownloadToken = jest.fn().mockResolvedValue('downloadToken');

      await expect(dataSource.getTemporaryDocument('documentId', 'example.pdf')).rejects.toThrow(
        'CORE document download returned unexpected content type: text/html'
      );
    });
  });

  describe('putFileS3', () => {
    it('should store a document in S3 and return Document ID', async () => {
      const fileContent = 'file content';
      const fileName = 'example.docx';

      const mockDocumentResponse = { docResponse: { _id: 'documentId' } };

      DocumentController.createS3Document.mockResolvedValue(mockDocumentResponse);

      const dataSource = new DataSource();

      const result = await dataSource.putFileS3(fileContent, fileName);

      expect(DocumentController.createS3Document).toHaveBeenCalledWith(fileName, fileContent, expect.any(String));

      expect(result).toBe('documentId');
    });
  });

  describe('updatePermit', () => {
    it('should throw an error when permit is null', async () => {
      const documentId = 'documentId';
      const dataSource = new DataSource();

      await expect(dataSource.updatePermit(null, documentId, permitUtils)).rejects.toThrow(
        'updateAmendment - param permit must not be null and contain documents.'
      );
    });

    it('should throw an error when permit is null', async () => {
      const permit = { documents: [] };
      const dataSource = new DataSource();

      await expect(dataSource.updatePermit(permit, null, permitUtils)).rejects.toThrow(
        'updateAmendment - param documentId must not be null.'
      );
    });

    it('should successfully call transformRecord and updateRecord', async () => {
      const permit = { documents: [] };
      const documentId = 'documentId';

      permitUtils.transformRecord.mockImplementation(permit => permit);
      permitUtils.updateRecord.mockResolvedValue([{ status: 'success' }]);

      const dataSource = new DataSource();

      await dataSource.updatePermit(permit, documentId, permitUtils);

      expect(permitUtils.transformRecord).toHaveBeenCalled();
      expect(permitUtils.updateRecord).toHaveBeenCalled();
    });

    it('should fail to call transformRecord and updateRecord', async () => {
      const permit = { documents: [] };
      const documentId = 'documentId';

      permitUtils.transformRecord.mockImplementation(new Error('Failed to transform record'));

      const dataSource = new DataSource();

      await expect(dataSource.updatePermit(permit, documentId, permitUtils)).rejects.toThrowError();
    });
  });
});
