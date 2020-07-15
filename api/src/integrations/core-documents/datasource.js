'use strict';
const mongoose = require('mongoose');
const axios = require('axios');
const fs = require('fs');

const defaultLog = require('../../utils/logger')('core-datasource');
const integrationUtils = require('../integration-utils');
const DocumentController = require('../../controllers/document-controller');
const PermitAmendmentUtils = require('./permit-amendment-utils');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');
const { getCoreAccessToken, getIntegrationUrl, getAuthHeader } = require('../integration-utils');

const CORE_CLIENT_ID = process.env.CORE_CLIENT_ID || null;
const CORE_CLIENT_SECRET = process.env.CORE_CLIENT_SECRET || null;
const CORE_GRANT_TYPE = process.env.CORE_GRANT_TYPE || null;
const CORE_API_HOST = process.env.CORE_API_HOST || 'https://minesdigitalservices.pathfinder.gov.bc.ca';
const CORE_DOC_MANAGER_HOST = process.env.CORE_DOC_MANAGER_HOST || 'https://minesdigitalservices.gov.bc.ca/document-manager';

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

    try{
      // Get Core API access token.
      this.client_token = await getCoreAccessToken(CORE_CLIENT_ID, CORE_CLIENT_SECRET, CORE_GRANT_TYPE);

      // Run main process.
      await this.updateRecords();

      if (this.status.individualRecordStatus.length) {
        defaultLog.error('CoreDocumentsDataSource - error processing some records');
        // This means there was an error on one or more records, but the the job still completed.
       for (const error of this.status.individualRecordStatus) {
         defaultLog.error(`Core record: ${error.coreId}, error: ${error.error}`);
       }
      }
    }
    catch (error) {
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
      const amendments = await this.getPermitAmendments();

      this.status.itemTotal = amendments.length;
      await this.taskAuditRecord.updateTaskRecord({ itemTotal: this.status.itemTotal });

      const permitAmendmentUtils = new PermitAmendmentUtils(this.auth_payload, RECORD_TYPE.PermitAmendment)

      // Process each amendment one at a time. As each record makes calls to the Core API, only process one at a time to prevent 504 errors.
      for (let i = 0; i < amendments.length; i++) {
        defaultLog.info(`Processing amendment ${i + 1} out of ${amendments.length}`);
        await this.processRecord(amendments[i], permitAmendmentUtils);
      }
    } catch (error) {
      defaultLog.error(`updateRecords - unexpected error: ${error.message}`);
      throw(error);
    }
  }



  /**
   * Process a permit amendment record.
   *
   * @param {PermitAmendment} amendment Permit amendment to process.
   * @param {PermitAmendmentUtils} permitAmendmentUtils Permit amendment utils.
   * @returns {object} status of the process operation for this record.
   * @memberof CoreDocumentsDataSource
   */
  async processRecord(amendment, permitAmendmentUtils) {
    const recordStatus = {};

    try {
      if (!amendment || !amendment.documents) {
        throw new Error('Param amendment is required and must have documents.');
      }

      // For any documents that do not have a local version, fetch it and create one.
      const savedDocs = [];
      for (const document of amendment.documents) {
        if (!document.documentId) {
          if (!document._sourceRefId || !document.documentName) {
            // Document is missing required fields. Record error but keep processing.
            recordStatus.amendmentId = amendment._id;
            recordStatus.error = 'Document missing required fields to process.';
            this.status.individualRecordStatus.push(recordStatus);
            continue;
          }

          // Get document and temporarily store it.
          const tempFilePath = await this.getTemporaryDocument(document._sourceRefId, document.documentName);
          const fileContent = fs.readFileSync(tempFilePath);

          // Save document to S3 and locally.
          const newDocumentId = await this.putFileS3(fileContent, document.documentName);

          // Delete temp file.
          fs.unlinkSync(tempFilePath);

          savedDocs.push({
            documentId: newDocumentId,
            _sourceRefId: document._sourceRefId
          });
        }
      }

      // Save the new documents to the permit amendment.
      await this.updateAmendment(amendment, savedDocs, permitAmendmentUtils);
    } catch (error) {
      recordStatus.amendmentId = amendment._id;
      recordStatus.error = error.message;

      // only add individual record status when an error occurs so that processing continues.
      this.status.individualRecordStatus.push(recordStatus);
    }
  }

  /**
   * Gets all Permit Amendments that still need to retrieve a document.
   * 
   * @returns {PermitAmendment[]} Permit Amendments missing documents.
   * @memberof CoreDocumentsDataSource
   */
  async getPermitAmendments() {
    const PermitAmendment = mongoose.model('PermitAmendment');
    return await PermitAmendment.find({ _schemaName: 'PermitAmendment', 'documents.documentId': null }).populate('_flavourRecords');
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
      throw (`getDownloadToken - unexpected error: ${error.message}`);
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
        res.data.pipe(fs.createWriteStream(tempFilePath))
          .on('finish', resolve)
          .on('error', (error) => reject(error));
      });

      return tempFilePath;
    } catch (error) {
      throw new Error(`getTemporaryDocument - unexpected error: ${error.message}`);
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
   * Updates a permit amendment with references to documents that have been created.
   *
   * @param {PermitAmendment} amendment Permit amendment to update.
   * @param {object[]} documents Array of document IDs and source ref info.
   * @param {PermitAmendmentUtils} permitAmendmentUtils Permit Amendment utils.
   * @memberof CoreDocumentsDataSource
   */
  async updateAmendment(amendment, documents, permitAmendmentUtils) {
    if (!amendment || !amendment.documents) {
      throw new Error('updateAmendment - param amendment must not be null and contain documents.');
    }

    if (!documents) {
      throw new Error('updateAmendment - param documents must not be null.');
    }

    for (const document of documents) {
      // Add the document ID to the existing document entries in the amendment.
      for (let i = 0; i < amendment.documents.length; i++) {
        if (amendment.documents[i]._sourceRefId === document._sourceRefId) {
          amendment.documents[i].documentId = document.documentId;
          break;
        }
      }
    }

    try {
      // Before saving we want to transform to remove anything associated with the mongoose model
      const transformedAmendment = permitAmendmentUtils.transformRecord(amendment);
      // Must add field to trigger flavour update.
      await permitAmendmentUtils.updateRecord(transformedAmendment, amendment);
    } catch (error) {
      throw new Error(`updateAmendment - unexpected error: ${error.message}`);
    }
  }
}

module.exports = CoreDocumentsDataSource;