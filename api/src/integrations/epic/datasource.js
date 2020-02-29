'use strict';

const QS = require('qs');
const integrationUtils = require('../integration-utils');
const defaultLog = require('../../utils/logger')('epic-datasource');
const EPIC_RECORD_TYPE = require('./epic-record-type-enum');

const MAX_PAGE_SIZE = Number.MAX_SAFE_INTEGER;

class DataSource {
  /**
   * Creates an instance of DataSource.
   *
   * @param {*} auth_payload information about the user account that started this update.
   * @param {*} [params=null] params to filter epic records (optional).
   * @param {*} [recordTypes=null] specific record types to update (optional).
   * @memberof DataSource
   */
  constructor(auth_payload, params = null, recordTypes = null) {
    this.auth_payload = auth_payload;
    this.params = params || {};
    this.recordTypes = recordTypes || null;

    // Set initial status
    this.status = { itemsProcessed: 0, itemTotal: 0, typeStatus: [], individualRecordStatus: [] };
  }

  // This requires no auth setup, so just call the local updater function.
  async run(taskAuditRecord) {
    defaultLog.info('Run function for epic datasource');
    return await this.updateRecords(taskAuditRecord);
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
  async updateRecords(_taskAuditRecord) {
    // TODO: Make audit record update as it goes.
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
        ...this.params,
        ...this.getBaseParams(recordType.type.typeId, recordType.milestone.milestoneId, MAX_PAGE_SIZE, 0)
      };
      const url = this.getIntegrationUrl(this.getHostname(), this.getSearchPathname(), queryParams);

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

      recordTypeStatus.itemTotal = epicRecords.length;
      this.status.itemTotal += epicRecords.length;

      // Add epic meta (whatever it contains) to the status
      recordTypeStatus.epicMeta = data && data[0] && data[0].meta;

      // Get the record type specific utils, that contain the unique transformations, etc, for this record type.
      const recordTypeUtils = recordType.getUtil(this.auth_payload);

      if (!recordTypeUtils) {
        recordTypeStatus.message = 'updateRecordType - no record type utils found';
        return recordTypeStatus;
      }

      // update each record in batches so as not to overload the EPIC api
      await this.batchProcessRecords(recordTypeUtils, epicRecords);

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

      // Persist NRPTI record
      const savedRecord = await recordTypeUtils.saveRecord(nrptiRecord);

      if (savedRecord) {
        this.status.itemsProcessed++;
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
   * Get the Epic API hostname.
   *
   * Will return the env variable `EPIC_API_HOSTNAME` if it exists.
   *
   * Example: 'my.api.com'
   *
   * @returns {string} Epic API hostname.
   * @memberof DataSource
   */
  getHostname() {
    return process.env.EPIC_API_HOSTNAME || 'eagle-prod.pathfinder.gov.bc.ca';
  }

  /**
   * Get the Epic API Search pathname.
   *
   * Will return the env variable `EPIC_API_SEARCH_PATHNAME` if it exists.
   *
   * Example: '/api/some/route'
   *
   * @returns {string} Epic api inspections path.
   * @memberof DataSource
   */
  getSearchPathname() {
    return process.env.EPIC_API_SEARCH_PATHNAME || '/api/public/search';
  }

  /**
   * Get the Epic API Project pathname.
   *
   * Will return the env variable `EPIC_API_PROJECT_PATHNAME` if it exists.
   *
   * Example: '/api/some/route'
   *
   * @param {*} projectId epic project _id
   * @returns
   * @memberof DataSource
   */
  getProjectPathname(projectId) {
    return `${process.env.EPIC_API_PROJECT_PATHNAME || '/api/public/project'}/${projectId}`;
  }

  /**
   * Get base record query params.
   *
   * @param {string} typeId record type _id.
   * @param {string} milestoneId record milestone _id.
   * @returns {object} base record query params.
   * @memberof DataSource
   */
  getBaseParams(typeId, milestoneId, pageSize, pageNum) {
    return {
      dataset: 'Document',
      populate: false,
      pageSize: pageSize,
      pageNum: pageNum,
      and: { type: typeId, milestone: milestoneId }
    };
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
   * @param {*} epicRecord
   * @returns epic project data
   * @throws {Error} if record project data cannot be found.
   * @memberof DataSource
   */
  async getRecordProject(epicRecord) {
    const url = this.getIntegrationUrl(this.getHostname(), `${this.getProjectPathname(epicRecord.project)}`, {
      fields: 'name|location|centroid|legislation'
    });

    const response = await integrationUtils.getRecords(url);

    if (!response || !response[0]) {
      throw Error('getRecordProject - failed to fetch Project.');
    }

    return response[0];
  }
}

module.exports = DataSource;