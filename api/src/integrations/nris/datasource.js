'use strict';

const integrationUtils = require('../integration-utils');
const defaultLog = require('../../utils/logger')('nris-datasource');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');
const mongoose = require('mongoose');
const moment = require('moment');
const axios = require('axios');
const documentController = require('../../controllers/document-controller');
const RecordController = require('./../../controllers/record-controller');
const fs = require('fs');

const AWS = require('aws-sdk');
const OBJ_STORE_URL = process.env.OBJECT_STORE_endpoint_url || 'nrs.objectstore.gov.bc.ca';
const ep = new AWS.Endpoint(OBJ_STORE_URL);
const s3 = new AWS.S3({
  endpoint: ep,
  accessKeyId: process.env.OBJECT_STORE_user_account,
  secretAccessKey: process.env.OBJECT_STORE_password,
  signatureVersion: 'v4',
  s3ForcePathStyle: true
});

const NRIS_TOKEN_ENDPOINT =
  process.env.NRIS_TOKEN_ENDPOINT ||
  'https://api.nrs.gov.bc.ca/oauth2/v1/oauth/token?disableDeveloperFilter=true&grant_type=client_credentials&scope=NRISWS.*';
const NRIS_EPD_API_ENDPOINT =
  process.env.NRIS_EPD_API_ENDPOINT || 'https://api.nrs.gov.bc.ca/nrisws-api/v1/epdInspections';
const NRIS_username = process.env.NRIS_username || null;
const NRIS_password = process.env.NRIS_password || null;

class NrisDataSource {
  /**
   * Creates an instance of NrisDataSource.
   *
   * @param {*} auth_payload information about the user account that started this update.
   * @param {*} [params=null] params to filter records (optional).
   * @param {*} [recordTypes=null] specific record types to update (optional).
   * @memberof NrisDataSource
   */
  constructor(auth_payload, params = null, recordTypes = null) {
    this.auth_payload = auth_payload;
    this.params = params || {};
  }

  // Setup the datasource and start running the task.
  async run(taskAuditRecord) {
    await taskAuditRecord.updateTaskRecord({ status: 'Running' });

    // First perform authentication against this datasource
    // We should login using env var creds - get a token from our configured endpoint.
    this.token = null;

    if (NRIS_username === null || NRIS_password === null) {
      defaultLog.error('Must set environment username/password for NRIS data connection.');
      return { status: 'Configuration Error' };
    }

    try {
      const res = await axios.get(NRIS_TOKEN_ENDPOINT, {
        timeout: 2000,
        auth: {
          username: NRIS_username,
          password: NRIS_password
        }
      });

      const payload = res.data ? res.data : null;

      if (!payload) {
        defaultLog.error('Error authenticating against NRIS API.');
        return { status: 'Auth Error' };
      }

      this.token = payload.access_token;
      defaultLog.info('NRIS API token expires:', (payload.expires_in / 60 / 60).toFixed(2), ' hours');

      // Hardcoded to start in 2017
      let startDate = moment('2017-01-01'); // start nth batch
      let endDate = moment(startDate).add(1, 'M'); // end nth batch
      let stopDate = moment('2019-12-31'); // end all updating

      let statusObject = {
        status: 'Complete',
        message: 'Job Complete',
        itemsProcessed: 0,
        itemTotal: 0
      };

      // Keep going until we'd start past today's date.
      while (startDate < stopDate) {
        defaultLog.info('dateRange:', startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'));
        const { status, message, itemsProcessed, itemTotal } = await this.updateRecords(
          startDate.format('YYYY-MM-DD'),
          endDate.format('YYYY-MM-DD')
        );
        if (status === 'Failed') {
          statusObject.status = status;
          statusObject.message += message + ':' + startDate.format('YYYY-MM-DD');
        }
        statusObject.itemsProcessed += itemsProcessed;
        statusObject.itemTotal += itemTotal;
        await taskAuditRecord.updateTaskRecord({
          itemTotal: statusObject.itemTotal,
          itemsProcessed: statusObject.itemsProcessed
        });
        startDate = endDate;
        endDate = moment(startDate).add(1, 'M');
      }

      await taskAuditRecord.updateTaskRecord({ status: statusObject.status });

      return statusObject;
    } catch (error) {
      defaultLog.error('Error:', error);
      return { status: 'General Error ' + error };
    }
  }

  async updateRecords(startDate, endDate) {
    let processingObject = { itemsProcessed: 0, itemTotal: 0, status: 'Running' };
    try {
      const url = {
        href: NRIS_EPD_API_ENDPOINT + '?inspectionStartDate=' + startDate + '&inspectionEndDate=' + endDate
      };
      processingObject.url = url.href;

      // Get records
      defaultLog.info('NRIS Call:', url);
      const records = await integrationUtils.getRecords(url, { headers: { Authorization: 'Bearer ' + this.token } });

      defaultLog.info('NRIS Call complete:', records.length);
      if (!records || records.length === 0) {
        return {
          status: 'Completed',
          message: 'updateRecordType - no records found',
          itemsProcessed: 0,
          itemTotal: 0
        };
      }

      processingObject.itemTotal = records.length;

      for (let i = 0; i < records.length; i++) {

        // Make sure these are completed, and >= 7 days before we bring in the record.
        if (records[i].assessmentStatus === 'Complete'
            && (moment().diff(moment(records[i].completionDate), 'days') >= 7)
        ) {
          const newRecord = await this.transformRecord(records[i]);
          await this.createRecord(newRecord);
          // Assuming we didn't get thrown an error, update the items successfully processed.
          processingObject.itemsProcessed++;
        } else {
          // We skip and don't include non-completed records
          processingObject.itemTotal--;
        }
      }
      processingObject.status = 'Completed';
      processingObject.message = 'updateRecordType - all done.';
    } catch (error) {
      processingObject.status = 'Failed';
      processingObject.message = 'updateRecords - unexpected error: ' + error;
      defaultLog.error(`updateRecords - unexpected error: ${error.message}`);
    }
    defaultLog.info('returning', processingObject.status);
    return processingObject;
  }

  async transformRecord(record) {
    const Inspection = mongoose.model(RECORD_TYPE.Inspection._schemaName);
    let newRecord = new Inspection().toObject();
    // We don't need this as we insert based on assessmentId
    delete newRecord._id;

    newRecord.recordName = `Inspection - ${record.requirementSource} - ${record.assessmentId}`;
    newRecord.legislationDescription = 'Inspection to verify compliance with regulatory requirement.';
    newRecord.recordType = 'Inspection';
    newRecord._sourceRefNrisId = record.assessmentId;
    newRecord.dateIssued = record.assessmentDate;
    // Re-write the issuing agency from Environmental Protection Office => Environmental Protection Division
    newRecord.issuingAgency =
      record.resourceAgency === 'Environmental Protection Office'
        ? 'Environmental Protection Division'
        : record.resourceAgency;
    newRecord.author = record.assessor;
    newRecord.legislation = {
      act: 'Environmental Management Act',
      section: '109'
    };

    newRecord.dateAdded = new Date();
    newRecord.dateUpdated = new Date();

    newRecord.addedBy = (this.auth_payload && this.auth_payload.displayName) || '';
    newRecord.updatedBy = (this.auth_payload && this.auth_payload.displayName) || '';

    newRecord.sourceSystemRef = 'nris';

    // Currently not doing anything different, future logic
    if (record.client && record.client.length > 0 && record.client[0]) {
      const clientType = record.client[0].clientType;
      switch (clientType) {
        case 'C':
        case 'O':
        case 'I':
        case 'Individual':
        default:
          defaultLog.info('clientType:', clientType);
      }

      newRecord.issuedTo = {
        write: ['sysadmin'],
        read: ['sysadmin'],

        type: 'Company',
        companyName: record.client[0].orgName || '',
        fullName: record.client[0].orgName || ''
      };
    }

    newRecord.location = record.location.locationDescription;

    if (record.location && Number(record.location.latitude) && Number(record.location.longitude)) {
      newRecord.centroid = [Number(record.location.latitude), Number(record.location.longitude)];
    }

    if (record.complianceStatus) {
      newRecord.outcomeDescription = record.complianceStatus;
    }

    if (record.inspection && record.inspection.inspctResponse) {
      newRecord.outcomeDescription += ' - ' + record.inspection.inspctResponse;
    }

    for (let i = 0; i < record.attachment.length; i++) {
      if (record.attachment[i].fileType === 'Final Report') {
        const tempFileData = await this.getFileFromNRIS(record.assessmentId, record.attachment[i].attachmentId);
        if (tempFileData) {
          defaultLog.info('Uploading attachmentId:', record.attachment[i].attachmentId, 'to S3');
          const fileContent = fs.readFileSync(tempFileData.tempFilePath);
          await this.putFileS3(fileContent, tempFileData.fileName, newRecord);
          fs.unlinkSync(tempFileData.tempFilePath);
        }
      }
    }
    newRecord.read.push('sysadmin');
    newRecord.write.push('sysadmin');

    defaultLog.info('Processed:', record.assessmentId);
    return newRecord;
  }

  // Grabs a file from NRIS datasource
  async getFileFromNRIS(inspectionId, attachmentId) {
    let nrisAttachmentEndpoint = NRIS_EPD_API_ENDPOINT;
    const url = nrisAttachmentEndpoint.replace(
      'epdInspections',
      `attachments/${inspectionId}/attachment/${attachmentId}`
    );
    try {
      const res = await axios.get(url, { headers: { Authorization: 'Bearer ' + this.token }, responseType: 'stream' });
      const uploadDir = process.env.UPLOAD_DIRECTORY || '/tmp/';
      const tempFilePath = uploadDir + res.headers['content-disposition'].split('= ').pop();
      // Attempt to save locally and prepare for upload to S3.
      await new Promise(resolve => {
        res.data.pipe(fs.createWriteStream(tempFilePath)).on('finish', resolve);
      });
      return { tempFilePath: tempFilePath, fileName: res.headers['content-disposition'].split('= ').pop() };
    } catch (e) {
      defaultLog.info(`Error gettting attachment ${attachmentId}:`, e);
      return null;
    }
  }

  // Puts a file into s3 and return the meta associated with it.
  async putFileS3(file, fileName, newRecord) {
    let docResponse = null;
    let s3Response = null;

    try {
      docResponse = await documentController.createDocument(
        fileName,
        (this.auth_payload && this.auth_payload.displayName) || ''
      );
    } catch (e) {
      defaultLog.info('Error saving document meta:', e);
      return null;
    }

    try {
      const s3UploadResult = await s3
        .upload({
          Bucket: process.env.OBJECT_STORE_bucket_name,
          Key: docResponse.key,
          Body: file,
          ACL: 'public-read'
        })
        .promise();

      s3Response = s3UploadResult;
      if (docResponse && docResponse._id) {
        newRecord.documents.push(docResponse._id);
      }
    } catch (e) {
      defaultLog.info('Error uploading file to S3:', e);
      return null;
    }

    return { docResponse: docResponse, s3Response: s3Response };
  }

  /**
   * Create a new NRPTI master and flavour records.
   *
   * @async
   * @param {object} record NRPTI record (required)
   * @returns {object} object containing the newly inserted master and flavour records
   * @memberof NrisDataSource
   */
  async createRecord(record) {
    if (!record) {
      throw Error('createRecord - required record must be non-null.');
    }

    try {
      // build create Obj, which should include the flavour record details
      const createObj = { ...record };

      createObj[RECORD_TYPE.Inspection.flavours.lng._schemaName] = {
        description: record.description || '',
        addRole: 'public'
      };

      createObj[RECORD_TYPE.Inspection.flavours.nrced._schemaName] = {
        summary: record.description || '',
        addRole: 'public'
      };

      return await RecordController.processPostRequest(
        { swagger: { params: { auth_payload: this.auth_payload } } },
        null,
        null,
        RECORD_TYPE.Inspection.recordControllerName,
        [createObj]
      );
    } catch (error) {
      defaultLog.error(`Failed to create Inspection record: ${error.message}`);
    }
  }
}

module.exports = NrisDataSource;
