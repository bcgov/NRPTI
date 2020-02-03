'use strict';

const integrationUtils    = require('../integration-utils');
const defaultLog          = require('../../utils/logger')('nris-datasource');
const RECORD_TYPE         = require('../../utils/constants/record-type-enum');
const mongoose            = require('mongoose');
const moment              = require('moment');
const axios               = require('axios');

const NRIS_TOKEN_ENDPOINT   = process.env.NRIS_TOKEN_ENDPOINT || "https://api.nrs.gov.bc.ca/oauth2/v1/oauth/token?disableDeveloperFilter=true&grant_type=client_credentials&scope=NRISWS.*";
const NRIS_EPD_API_ENDPOINT = process.env.NRIS_EPD_API_ENDPOINT || "https://api.nrs.gov.bc.ca/nrisws-api/v1/epdInspections";
const NRIS_username         = process.env.NRIS_username || null;
const NRIS_password         = process.env.NRIS_password || null;

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
      defaultLog.error('Must set environment username/password for NRIS data connection.')
      return { status: 'Configuration Error' };
    }

    try {
      const res = await axios.get(NRIS_TOKEN_ENDPOINT,
                                  {
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
      let startDate = moment('2017-01-01');
      let endDate = moment(startDate).add(1, 'M');

      let statusObject = {
        status: 'Complete',
        message: 'Job Complete',
        itemsProcessed: 0,
        itemTotal: 0,
      };

      // Keep going until we'd start past today's date.
      while(startDate < moment()) {
        defaultLog.info("dateRange:", startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'));
        startDate = endDate;
        const { status, message, itemsProcessed, itemTotal } = await this.updateRecords(startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'));
        if (status === 'Failed') {
          statusObject.status = status;
          statusObject.message += message + ':' + startDate.format('YYYY-MM-DD');
        }
        statusObject.itemsProcessed += itemsProcessed;
        statusObject.itemTotal += itemTotal;
        await taskAuditRecord.updateTaskRecord({ itemTotal: statusObject.itemTotal, itemsProcessed: statusObject.itemsProcessed });
        endDate = moment(startDate).add(1, 'M');
      }

      await taskAuditRecord.updateTaskRecord({ status: statusObject.status });

      return statusObject;
    } catch (error) {
      defaultLog.error("Error:", error);
      return { status: 'General Error ' + error };
    }
  }

  async updateRecords(startDate, endDate) {
    let processingObject = { itemsProcessed: 0, itemTotal: 0, status: 'Running' };
    try {
      const url = { href: NRIS_EPD_API_ENDPOINT + '?inspectionStartDate=' + startDate + '&inspectionEndDate=' + endDate };
      processingObject.url = url.href;

      // Get records
      defaultLog.info("NRIS Call:", url);
      const records = await integrationUtils.getRecords(url, { headers: { Authorization: 'Bearer ' + this.token } });

      defaultLog.info("NRIS Call complete:", records.length);
      if (!records || records.length === 0) {
        return {
          status: 'Completed',
          message: 'updateRecordType - no records found',
          itemsProcessed: 0,
          itemTotal: 0
        }
      }

      processingObject.itemTotal =  records.length;

      for (let i = 0; i < records.length; i++) {
        if (records[i].assessmentStatus === 'Complete') {
          const newRecord = await this.transformRecord(records[i]);
          await this.saveRecord(newRecord);
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
    defaultLog.info("returning", processingObject.status);
    return processingObject;
  }

  async transformRecord(record) {
    const Inspection = mongoose.model(RECORD_TYPE.Inspection._schemaName);
    let newRecord = new Inspection().toObject();
    // We don't need this as we insert based on assessmentId
    delete newRecord._id;

    newRecord.recordName        = 'TBD';
    newRecord.recordType        = 'Inspection';
    newRecord._sourceRefNrisId  = record.assessmentId;
    newRecord.dateIssued        = record.assessmentDate;
    newRecord.issuingAgency     = record.resourceAgency;
    newRecord.author            = record.assessor;
    newRecord.legislation       = 'Environmental Management Act, Section 109';

    // Currently not doing anything different, future logic
    if (record.client && record.client.length > 0 && record.client[0]) {
      const clientType = record.client[0].clientType;
      switch(clientType) {
        case 'C':
        case 'O':
        case 'I':
        case 'Individual':
        default:
          defaultLog.info("clientType:", clientType)
      }
      newRecord.issuedTo = record.client[0].orgName;
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

    for(let i=0;i < record.attachment.length;i++) {
      if (record.attachment[i].fileType === 'Final Report') {
        // Grab this & break;
        let file = await this.getFileFromNRIS(record.attachment[i].attachmentId);

        // TODO: s3File.path, create/set document object properly
        let s3File = await this.putFileS3(record.attachment[i].attachmentId, file);
        // newRecord.documents.push(record.attachment[i].attachmentId);
      }
    }
    newRecord.read.push('sysadmin');
    newRecord.write.push('sysadmin');

    defaultLog.info("Processed:", record.assessmentId);
    return newRecord;
  }

  // Grabs a file from NRIS datasource
  async getFileFromNRIS(attachmentId) {
    defaultLog.info('Getting file from nris:', attachmentId);
    return Promise.resolve();
  }

  // Puts a file into s3 and return the meta associated with it.
  async putFileS3(attachmentId, file) {
    defaultLog.info('Uploading attachmentId:', attachmentId, 'to S3');
    return Promise.resolve();
  }

  // Save record into the database.
  async saveRecord(record) {
    if (!record) {
      throw Error('saveRecord - required record must be non-null.');
    }

    try {
      const Inspection = mongoose.model(RECORD_TYPE.Inspection._schemaName);

      const newObject = await Inspection.findOneAndUpdate(
        { _schemaName: RECORD_TYPE.Inspection._schemaName, _sourceRefNrisId: record._sourceRefNrisId },
        { $set: record },
        { upsert: true, new: true }
      );
      return newObject;
    } catch (error) {
      defaultLog.error(`Failed to save NRIS Inspection record: ${error.message}`);
    }
  }
}

module.exports = NrisDataSource;
