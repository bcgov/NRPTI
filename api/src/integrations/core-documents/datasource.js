'use strict';
const mongoose = require('mongoose');
const axios = require('axios');
const fs = require('fs');

const defaultLog = require('../../utils/logger')('core-datasource');
const integrationUtils = require('../integration-utils');
const DocumentController = require('../../controllers/document-controller');
const PermitUtils = require('./permit-utils');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');
const { getCoreAccessToken, getIntegrationUrl, getAuthHeader } = require('../integration-utils');

const CORE_CLIENT_ID = process.env.CORE_CLIENT_ID || null;
const CORE_CLIENT_SECRET = process.env.CORE_CLIENT_SECRET || null;
const CORE_GRANT_TYPE = process.env.CORE_GRANT_TYPE || null;
const CORE_API_HOST = process.env.CORE_API_HOST || 'https://minesdigitalservices.pathfinder.gov.bc.ca';
const CORE_DOC_MANAGER_HOST =
  process.env.CORE_DOC_MANAGER_HOST || 'https://minesdigitalservices.gov.bc.ca/document-manager';

class CoreDocumentsDataSource {
  /**
   * Creates an instance of CoreDocumentsDataSource.
   *
   * @param {*} taskAuditRecord audit record hook for this import instance
   * @param {*} auth_payload information about the user account that started this update.
   * @memberof CoreDocumentsDataSource
   */
  constructor(taskAuditRecord, auth_payload) {
    this.taskAuditRecord = taskAuditRecord;
    this.auth_payload = auth_payload;

    // Set initial status
    this.status = { itemsProcessed: 0, itemTotal: 0, individualRecordStatus: [] };
  }

  // This requires no auth setup, so just call the local updater function.
  async run() {
    defaultLog.info('run - update core documents datasource');
    await this.taskAuditRecord.updateTaskRecord({ status: 'Running' });

    try {
      // Get Core API access token.
      this.client_token = await getCoreAccessToken(CORE_CLIENT_ID, CORE_CLIENT_SECRET, CORE_GRANT_TYPE);

      // Run main process.
      await this.updateRecords();
      await this.taskAuditRecord.updateTaskRecord({ itemsProcessed: this.status.itemsProcessed });

      if (this.status.individualRecordStatus.length) {
        defaultLog.error('CoreDocumentsDataSource - error processing some records');
        // This means there was an error on one or more records, but the the job still completed.
        for (const error of this.status.individualRecordStatus) {
          defaultLog.error(`Core record: ${error.coreId}, error: ${error.error}`);
        }
      }
    } catch (error) {
      defaultLog.error('CoreDataSource run error:', error.message);
    }
  }

  /**
   * Main function that runs all necessary operations to update Permit Amendments with documents.
   *
   * @memberof CoreDocumentsDataSource
   */
  async updateRecords() {
    try {
      const jobCount = process.env.PARALLEL_IMPORT_LIMIT ? parseInt(process.env.PARALLEL_IMPORT_LIMIT) : 1;

      const permits = await this.getPermits();

      this.status.itemTotal = permits.length;
      await this.taskAuditRecord.updateTaskRecord({ itemTotal: this.status.itemTotal });

      const permitUtils = new PermitUtils(this.auth_payload, RECORD_TYPE.Permit);

      // Push records to proccess into a Promise array to be processed in parallel.
      for (let i = 0; i < permits.length; i += jobCount) {
        const promises = [];
        for (let j = 0; j < jobCount && i + j < permits.length; j++) {
          defaultLog.info(`Processing permit ${i + j + 1} out of ${permits.length}`);
          promises.push(this.processRecord(permits[i + j], permitUtils));
        }

        if (promises.length > 0) {
          const reuslts = await Promise.all(promises);
          this.status.itemsProcessed += reuslts.filter(value => value === true).length;
        }
      }
    } catch (error) {
      defaultLog.error(`updateRecords - unexpected error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process a permit record.
   *
   * @param {Permit} permit Permit to process.
   * @param {PermitUtils} permitUtils Permit utils.
   * @returns {object} status of the process operation for this record.
   * @memberof CoreDocumentsDataSource
   */
  async processRecord(permit, permitUtils) {
    const recordStatus = {};

    try {
      if (!permit) {
        throw new Error('Param permit is required.');
      }

      // Get document and temporarily store it.
      const tempFilePath = await this.getTemporaryDocument(permit._sourceDocumentRefId, permit.recordName);
      const fileContent = fs.readFileSync(tempFilePath);

      // Save document to S3 and locally.
      const newDocumentId = await this.putFileS3(fileContent, permit.recordName);

      // Delete temp file.
      fs.unlinkSync(tempFilePath);

      await this.updatePermit(permit, newDocumentId, permitUtils);

      return true;
    } catch (error) {
      recordStatus.amendmentId = permit._id;
      recordStatus.error = error.message;

      // only add individual record status when an error occurs so that processing continues.
      this.status.individualRecordStatus.push(recordStatus);

      return false;
    }
  }

  /**
   * Gets all Permit Amendments that still need to retrieve a document.
   *
   * @returns {PermitAmendment[]} Permit Amendments missing documents.
   * @memberof CoreDocumentsDataSource
   */
  async getPermits() {
    const PermitAmendment = mongoose.model('Permit');
    return await PermitAmendment.find({
      _schemaName: 'Permit',
      _sourceDocumentRefId: { $ne: null },
      documents: []
    }).populate('_flavourRecords');
  }

  /**
   * Retrieve download token for Core API.
   *
   * @param {string} documentId Core document ID.
   * @returns {string} Download token.
   * @memberof CoreDocumentsDataSource
   */
  async getDownloadToken(documentId) {
    if (!documentId) {
      throw new Error('getDownloadToken - param documentId must not be null');
    }

    try {
      const url = getIntegrationUrl(CORE_API_HOST, `/api/download-token/${documentId}`);
      const { token_guid } = await integrationUtils.getRecords(url, getAuthHeader(this.client_token));
      return token_guid;
    } catch (error) {
      throw `getDownloadToken - unexpected error: ${error.message}`;
    }
  }

  /**
   * Downloads and saves a document to a temporary location.
   *
   * @param {string} documentId Core document ID.
   * @param {string}  documentName Document name.
   * @returns {string} File path.
   * @memberof CoreDocumentsDataSource
   */
  async getTemporaryDocument(documentId, documentName) {
    if (!documentId) {
      throw new Error('getTemporaryDocument - param documentId must not be null');
    }

    if (!documentName) {
      throw new Error('getTemporaryDocument - param documentName must not be null');
    }

    const uploadDir = process.env.UPLOAD_DIRECTORY || '/tmp/';

    try {
      // Get a download token.
      const downloadToken = await this.getDownloadToken(documentId);

      const url = `${CORE_DOC_MANAGER_HOST}/documents?token=${downloadToken}`;

      const res = await axios.get(url, getAuthHeader(this.client_token, { responseType: 'stream' }));

      const tempFilePath = `${uploadDir}/${documentName}`;
      // Attempt to save locally.
      await new Promise((resolve, reject) => {
        res.data
          .pipe(fs.createWriteStream(tempFilePath))
          .on('finish', resolve)
          .on('error', error => reject(error));
      });

      return tempFilePath;
    } catch (error) {
      throw new Error(
        `getTemporaryDocument - documentId ${documentId} - documentName ${documentName} - unexpected error: ${error.message}`
      );
    }
  }

  /**
   * Stores a document in S3.
   *
   * @param {*} fileContent File content from stream.
   * @param {string} fileName File name to use for storage.
   * @returns {string} Document ID.
   * @memberof CoreDocumentsDataSource
   */
  async putFileS3(fileContent, fileName) {
    if (!fileContent) {
      throw new Error('putFileS3 - param fileContent must not be null');
    }

    if (!fileName) {
      throw new Error('putFileS3 - param fileName must not be null');
    }

    try {
      const { docResponse } = await DocumentController.createS3Document(
        fileName,
        fileContent,
        (this.auth_payload && this.auth_payload.displayName) || ''
      );

      return docResponse && docResponse._id;
    } catch (e) {
      throw new Error(`Error creating S3 document - fileName: ${fileName}, Error: ${e}`);
    }
  }

  /**
   * Updates a permit with references to a document that has been created.
   *
   * @param {Permit} permit Permit to update.
   * @param {object[]} documents Array of document IDs and source ref info.
   * @param {PermitUtils} permitUtils Permit utils.
   * @memberof CoreDocumentsDataSource
   */
  async updatePermit(permit, documentId, permitUtils) {
    if (!permit) {
      throw new Error('updateAmendment - param permit must not be null and contain documents.');
    }

    if (!documentId) {
      throw new Error('updateAmendment - param documentId must not be null.');
    }

    permit.documents.push(documentId);

    try {
      // Before saving we want to transform to remove anything associated with the mongoose model
      const transformedAmendment = permitUtils.transformRecord(permit);
      const result = await permitUtils.updateRecord(transformedAmendment, permit);

      if(result.length && result[0].status && result[0].status === 'failure')
        throw Error(`permitUtils.updateRecord failed: ${result[0].errorMessage}`);
    } catch (error) {
      throw new Error(`updateAmendment - unexpected error: ${error.message}`);
    }
  }
}

module.exports = CoreDocumentsDataSource;
