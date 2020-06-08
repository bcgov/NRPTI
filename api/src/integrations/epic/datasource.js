'use strict';

const QS = require('qs');
const integrationUtils = require('../integration-utils');
const defaultLog = require('../../utils/logger')('epic-datasource');
const EPIC_RECORD_TYPE = require('./epic-record-type-enum');
const moment = require('moment');
const MAX_PAGE_SIZE = Number.MAX_SAFE_INTEGER;

const EPIC_API_HOSTNAME = process.env.EPIC_API_HOSTNAME || 'eagle-prod.pathfinder.gov.bc.ca';
const EPIC_API_SEARCH_PATHNAME = process.env.EPIC_API_SEARCH_PATHNAME || '/api/public/search';
const EPIC_API_PROJECT_PATHNAME = process.env.EPIC_API_PROJECT_PATHNAME || '/api/public/project';

class DataSource {
  /**
   * Creates an instance of DataSource.
   *
   * @param {*} taskAuditRecord audit record hook for this import instance
   * @param {*} auth_payload information about the user account that started this update.
   * @param {*} [params=null] params to filter epic records (optional).
   * @param {*} [recordTypes=null] specific record types to update (optional).
   * @memberof DataSource
   */
  constructor(taskAuditRecord, auth_payload, params = null, recordTypes = null) {
    this.taskAuditRecord = taskAuditRecord;
    this.auth_payload = auth_payload;
    this.params = params || {};
    this.recordTypes = recordTypes || null;

    // Set initial status
    this.status = { itemsProcessed: 0, itemTotal: 0, typeStatus: [], individualRecordStatus: [] };
  }

  // This requires no auth setup, so just call the local updater function.
  async run() {
    defaultLog.info('run - update epic datasource');
    await this.taskAuditRecord.updateTaskRecord({ status: 'Running', itemTotal: 0 });

    return await this.updateRecords();
  }

  /**
   * Main function that runs all necessary operations to update Epic records for supported types.
   *
   * Note: supported types specified in epic-record-type-enum.js
   *
   * @async
   * @returns {object} Overall status of the update + array of statuses by record type + array of any failed records.
   * @memberof DataSource
   */
  async updateRecords() {
    try {
      let recordTypesToUpdate = [];

      if (this.recordTypes) {
        // update only the specified types
        recordTypesToUpdate = EPIC_RECORD_TYPE.getSome(this.recordTypes);
      } else {
        // update all supported types
        recordTypesToUpdate = EPIC_RECORD_TYPE.getAll();
      }

      if (!recordTypesToUpdate || !recordTypesToUpdate.length) {
        defaultLog.error('updateRecords - no supported record types to update');
      }

      const promises = [];

      // for each supported type, run its update
      for (const recordType of recordTypesToUpdate) {
        promises.push(this.updateRecordType(recordType));
      }

      await Promise.all(promises);
    } catch (error) {
      this.status.message = 'updateRecords - unexpected error';
      this.status.error = error.message;

      defaultLog.error(`updateRecords - unexpected error: ${error.message}`);
    }

    return this.status;
  }

  /**
   * Runs all necessary operations to update a single epic record type.
   *
   * @async
   * @param {*} recordType epic record type to update.
   * @returns {object} status of the update operation for this record type.
   * @memberof DataSource
   */
  async updateRecordType(recordType) {
    // set status defaults
    let recordTypeStatus = { type: recordType, itemTotal: 0, url: '' };

    try {
      if (!recordType) {
        throw Error('updateRecordType - required recordType is null.');
      }

      // Build request url
      const queryParams = {
        dataset: 'Document',
        populate: false,
        pageSize: MAX_PAGE_SIZE,
        pageNum: 0,
        and: {
          type: recordType.type.typeId,
          milestone: recordType.milestone.milestoneId,
          ...this.getProjectFilterParams(recordType),
          ...this.params
        }
      };
      const url = this.getIntegrationUrl(EPIC_API_HOSTNAME, EPIC_API_SEARCH_PATHNAME, queryParams);

      recordTypeStatus.url = url.href;

      // Get Epic records
      const data = await integrationUtils.getRecords(url);

      // Get records from response
      const epicRecords = data && data[0] && data[0].searchResults;

      // Failed to find any epic records
      if (!epicRecords || !epicRecords.length) {
        recordTypeStatus.message = 'updateRecordType - no records found';
        return recordTypeStatus;
      }

      // Get the record type specific utils, that contain the unique transformations, etc, for this record type.
      const recordTypeUtils = recordType.getUtil(this.auth_payload);

      if (!recordTypeUtils) {
        recordTypeStatus.message = 'updateRecordType - no record type utils found';
        return recordTypeStatus;
      }

      const processRecords = [];
      // Prior to April 1, 2020 we import Inspection and Orders except from LNG Canada and Coastal Gaslink
      // After April 1, 2020, we import everything regardless of project.
      for (let z = 0; z < epicRecords.length; z++) {
        const theRecord = epicRecords[z];

        if (moment(theRecord.datePosted).isBefore(moment('2020-04-01').toISOString())) {
          // Check if it's an Order or an Inspection and not part of LNG Canada or Coastal Gas Link

          // Check if !CGL/LNG
          if (theRecord.project === ('588511c4aaecd9001b825604' || '588510cdaaecd9001b815f84')) {
            // Skip
            console.log("Skipping LNG Canada/Coastal Gas Link Record > 2020-04-01", theRecord.displayName)
            continue;
          }

          // Check if Inspection
          const rec = await recordTypeUtils.transformRecord(theRecord);
          if (rec._schemaName === "Inspection") {
              processRecords.push(theRecord);
          }

          // Check if Order and not a Fee Order 
          if (rec._schemaName === 'Order' && !recordTypeUtils.isRecordFeeOrder(rec)) {
            processRecords.push(theRecord);
          }
          // Skip everything else
        } else {
          const rec = await recordTypeUtils.transformRecord(theRecord);

          // Check if Order and not a Fee Order 
          if (rec._schemaName === 'Order') {
            if (!recordTypeUtils.isRecordFeeOrder(rec)) {
              processRecords.push(theRecord);
            }
          }
          else {
            processRecords.push(theRecord);
          }
        }
      }

      recordTypeStatus.itemTotal = processRecords.length;
      this.status.itemTotal += processRecords.length;
      await this.taskAuditRecord.updateTaskRecord({ itemTotal: this.status.itemTotal });

      // Add epic meta (whatever it contains) to the status
      recordTypeStatus.epicMeta = data && data[0] && data[0].meta;

      // update each record in batches so as not to overload the EPIC api
      await this.batchProcessRecords(recordTypeUtils, processRecords);

      // Add this types specific status object to the array of type statuses
      this.status.typeStatus.push(recordTypeStatus);
    } catch (error) {
      recordTypeStatus.message = 'updateRecordType - unexpected error';
      recordTypeStatus.error = error.message;

      // Do not re-throw error, as a single failure is not cause to stop the other record types from processing
      defaultLog.error(`updateRecordType - unexpected error: ${error.message}`);
    }

    return recordTypeStatus;
  }

  /**
   * Runs processRecord() on each epicRecord, in batches.
   *
   * Batch size configured by env variable `EPIC_API_BATCH_SIZE` if it exists, or 50 by default.
   *
   * @param {*} recordTypeUtils record type specific utils that contain the unique transformations, etc, for this type.
   * @param {*} epicRecords epic records to process.
   * @memberof EpicDataSource
   */
  async batchProcessRecords(recordTypeUtils, epicRecords) {
    let batchSize = process.env.EPIC_API_BATCH_SIZE || 50;

    let promises = [];
    for (let i = 0; i < epicRecords.length; i++) {
      promises.push(this.processRecord(recordTypeUtils, epicRecords[i]));

      if (i % batchSize === 0 || i === epicRecords.length - 1) {
        await Promise.all(promises);
        promises = [];
      }
    }
  }

  /**
   * Process an epic record.
   *
   * For this record:
   * - Transform into a NRPTI record
   * - Persist to the database
   *
   * @param {*} recordTypeUtils record type specific utils that contain the unique transformations, etc, for this type.
   * @param {*} epicRecord epic record to process.
   * @returns {object} status of the process operation for this record.
   * @memberof DataSource
   */
  async processRecord(recordTypeUtils, epicRecord) {
    // set status defaults
    let recordStatus = {};

    try {
      if (!recordTypeUtils) {
        throw Error('processRecord - required recordTypeUtils is null.');
      }

      if (!epicRecord) {
        throw Error('processRecord - required epicRecord is null.');
      }

      // Fetch and add project data to the record;
      const epicProject = await this.getRecordProject(epicRecord);
      epicRecord = { ...epicRecord, project: epicProject };

      // Perform any data transformations necessary to convert Epic record to NRPTI record
      const nrptiRecord = await recordTypeUtils.transformRecord(epicRecord);

      // Check if this record already exists
      const existingRecord = await recordTypeUtils.findExistingRecord(nrptiRecord);

      let savedRecords = null;
      if (existingRecord) {
        // Delete old documents (if any)
        await recordTypeUtils.removeDocuments(existingRecord);

        // Create new documents (if any) and add reference to record
        nrptiRecord.documents = await recordTypeUtils.createDocument(epicRecord);

        savedRecords = await recordTypeUtils.updateRecord(nrptiRecord, existingRecord);
      } else {
        // Create new documents (if any) and add reference to record
        nrptiRecord.documents = await recordTypeUtils.createDocument(epicRecord);

        // Create NRPTI master record OR update existing NRPTI master record and its flavours (if any)
        savedRecords = await recordTypeUtils.createRecord(nrptiRecord);
      }

      if (savedRecords && savedRecords.length > 0 && savedRecords[0].status === 'success') {
        this.status.itemsProcessed++;

        await this.taskAuditRecord.updateTaskRecord({ itemsProcessed: this.status.itemsProcessed });
      } else {
        throw Error('processRecord - savedRecord is null.');
      }
    } catch (error) {
      recordStatus.epicId = epicRecord && epicRecord._id;
      recordStatus.message = 'processRecord - unexpected error';
      recordStatus.error = error.message;

      // only add individual record status when an error occurs
      this.status.individualRecordStatus.push(recordStatus);

      // Do not re-throw error, as a single failure is not cause to stop the other records from processing
      defaultLog.error(`processRecord - unexpected error: ${error.message}`);
    }
  }

  /**
   * Build the Epic API Project pathname.
   *
   * @param {*} projectId epic project _id
   * @returns
   * @memberof DataSource
   */
  buildProjectPathname(projectId) {
    return `${EPIC_API_PROJECT_PATHNAME}/${projectId}`;
  }

  /**
   * Build query parameters to filter results based on one or more project ids.
   *
   * @param {*} recordType
   * @returns project filter query params
   * @memberof DataSource
   */
  getProjectFilterParams(recordType) {
    if (!recordType) {
      return null;
    }

    if (!recordType.projects || !recordType.projects.length) {
      return null;
    }

    const projectFilterParams = { project: [] };
    recordType.projects.forEach(project => {
      projectFilterParams.project.push(project.projectId);
    });

    return projectFilterParams;
  }

  /**
   * Builds the integration URL string.
   *
   * Note: assumes HTTPS.
   *
   * @param {string} hostname the url hostname. Example: 'www.example.com'
   * @param {string} pathname the url pathname. Example: '/api/some/route'
   * @param {object} queryParams the url query params. Example: { type: 'document', other: true }
   * @returns {URL} integration URL (see https://nodejs.org/api/url.html#url_url)
   * @memberof DataSource
   */
  getIntegrationUrl(hostname, pathname, queryParams) {
    const query = QS.stringify(queryParams);
    const path = `${pathname}?${query}`;
    const url = new URL(path, `https://${hostname}`);

    return url;
  }

  /**
   * Get the epic project data for the given epic records projectId.
   *
   * Note: `populate: true` is set to fetch proponent information.
   *
   * @param {*} epicRecord
   * @returns epic project data
   * @throws {Error} if record project data cannot be found.
   * @memberof DataSource
   */
  async getRecordProject(epicRecord) {
    const url = this.getIntegrationUrl(EPIC_API_HOSTNAME, `${this.buildProjectPathname(epicRecord.project)}`, {
      populate: true,
      fields: 'name|location|centroid|legislation|proponent'
    });

    const response = await integrationUtils.getRecords(url);

    if (!response || !response[0]) {
      throw Error('getRecordProject - failed to fetch Project.');
    }

    return response[0];
  }
}

module.exports = DataSource;
