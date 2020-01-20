'use strict';

const QS = require('qs');
const integrationUtils = require('../integration-utils');
const defaultLog = require('../../utils/logger')('epic-datasource');
const EPIC_RECORD_TYPE = require('./epic-record-type-enum');

const MAX_PAGE_SIZE = Number.MAX_SAFE_INTEGER;

class EpicDataSource {
  /**
   * Creates an instance of EpicDataSource.
   *
   * @param {*} params params to filter epic records (optional).
   * @param {*} auth_payload information about the user account that started this update.
   * @memberof EpicDataSource
   */
  constructor(params, auth_payload) {
    this.params = params || {};
    this.auth_payload = auth_payload;

    defaultLog.info(`EpicDataSource - params: ${JSON.stringify(this.params)}`);
    defaultLog.debug(`EpicDataSource - auth_payload: ${JSON.stringify(this.auth_payload)}`);

    // Set initial status
    this.status = { itemsProcessed: 0, itemTotal: 0, typeStatus: [] };
  }

  /**
   * Main function that runs all necessary operations to update Epic records for a given type.
   *
   * @async
   * @returns {object} Overall status of the update + array of individual record type statuses.
   * @memberof EpicDataSource
   */
  async updateRecords() {
    try {
      for (const recordType of EPIC_RECORD_TYPE.recordTypes) {
        const typeStatus = await this.updateRecordType(recordType);
        defaultLog.info(
          `updateRecords - type: ${recordType.type.name}, milestone: ${recordType.milestone.name}` +
            ` - upserted ${typeStatus.itemsProcessed} of ${typeStatus.itemTotal} records`
        );
        this.status.typeStatus.push(typeStatus);
      }

      // reduce the record type statuses to get the overall total number of items and total number of items processed
      const typeStatusTotals = this.status.typeStatus.reduce((total, status) => {
        return {
          itemsProcessed: total.itemsProcessed + status.itemsProcessed,
          itemTotal: total.itemTotal + status.itemTotal
        };
      });

      this.status = { ...this.status, ...typeStatusTotals };
    } catch (error) {
      this.status.message = 'updateRecords - unexpected error';
      this.status.error = JSON.stringify(error);
    }

    return this.status;
  }

  /**
   * Runs all necessary operations to update a single epic record type.
   *
   * @async
   * @param {*} recordType epic record type to update.
   * @returns {object} status of the update operation for this record type.
   * @memberof EpicDataSource
   */
  async updateRecordType(recordType) {
    let recordTypeStatus = { itemsProcessed: 0, itemTotal: 0, url: '' };

    try {
      // Build request url
      const queryParams = {
        ...this.params,
        ...this.getBaseParams(recordType.type.id, recordType.milestone.id, MAX_PAGE_SIZE, 0)
      };
      const url = this.getIntegrationUrl(this.getHostname(), this.getEpicSearchPathname(), queryParams);

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

      // Add epic meta (whatever it contains) to the status
      recordTypeStatus.epicMeta = data && data[0] && data[0].meta;

      // Get the record type specific utils, that contain the unique transformations, etc, for this record type.
      const recordTypeUtils = recordType.getUtil();

      if (!recordTypeUtils) {
        recordTypeStatus.message = 'updateRecordType - no record type utils found';
        return recordTypeStatus;
      }

      // Process records
      const processStatus = await this.processRecords(recordTypeUtils, epicRecords);

      // update status
      recordTypeStatus = { ...recordTypeStatus, ...processStatus };
    } catch (error) {
      recordTypeStatus.message = 'updateRecordType - unexpected error';
      recordTypeStatus.error = JSON.stringify(error);
    }

    return recordTypeStatus;
  }

  /**
   * Process the epic records one by one:
   * - Transform into a NRPTI record
   * - Persist to the database
   *
   * Note: individual records failing should not stop the remaining records from processing successfully.
   *
   * @param {*} recordTypeUtils record type specific utils that contain the unique transformations, etc, for this type.
   * @param {*} epicRecords epic records to process.
   * @returns {object} status of the process operation for this record type.
   * @memberof EpicDataSource
   */
  async processRecords(recordTypeUtils, epicRecords) {
    if (!recordTypeUtils) {
      throw Error('processRecords - required recordTypeUtils is null.');
    }

    if (!epicRecords) {
      throw Error('processRecords - required epicRecords is null.');
    }

    const recordTypeStatus = { itemsProcessed: 0 };

    for (let i = 0; i < epicRecords.length; i++) {
      try {
        // TODO fetch/stream epic documents somewhere around here?

        let epicRecord = epicRecords[i];

        // Fetch and add project data to the record;
        const epicProject = await this.getRecordProject(epicRecord);
        epicRecord = { ...epicRecord, project: epicProject };

        // Perform any data transformations necessary to convert Epic record to NRPTI record
        const nrptiRecord = await recordTypeUtils.transformRecord(epicRecord);

        // Persist NRPTI record
        const savedRecord = await recordTypeUtils.saveRecord(nrptiRecord);

        if (savedRecord) {
          recordTypeStatus.itemsProcessed++;
        }
      } catch (error) {
        defaultLog.error(`processRecords - record failed: ${error.message}`);
        defaultLog.debug(`processRecords - record failed - error.stack: ${error.stack}`);
        // Do not re-throw error, as a single failure is not cause to stop the other records from processing
        // TODO put any logging or special handling when a single record fails?
      }
    }

    return recordTypeStatus;
  }

  /**
   * Get the Epic API hostname.
   *
   * Will return the env variable `EPIC_API_HOSTNAME` if it exists.
   *
   * Example: 'my.api.com'
   *
   * @returns {string} Epic API hostname.
   * @memberof EpicDataSource
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
   * @memberof EpicDataSource
   */
  getEpicSearchPathname() {
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
   * @memberof EpicDataSource
   */
  getEpicProjectPathname(projectId) {
    return `${process.env.EPIC_API_PROJECT_PATHNAME || '/api/project'}/${projectId}`;
  }

  /**
   * Get base record query params.
   *
   * @param {string} typeId record type _id.
   * @param {string} milestoneId record milestone _id.
   * @returns {object} base record query params.
   * @memberof EpicDataSource
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
   * @memberof EpicDataSource
   */
  getIntegrationUrl(hostname, pathname, queryParams) {
    const query = QS.stringify(queryParams);
    const path = `${pathname}?${query}`;
    const url = new URL(path, `https://${hostname}`);

    defaultLog.debug(`getIntegrationUrl - URL: ${url}`);
    return url;
  }

  /**
   * Get the epic project data for the given epic records projectId.
   *
   * @param {*} epicRecord
   * @returns epic project data
   * @throws {Error} if record project data cannot be found.
   * @memberof EpicDataSource
   */
  async getRecordProject(epicRecord) {
    const url = this.getIntegrationUrl(this.getHostname(), `${this.getEpicProjectPathname(epicRecord.project)}`, {
      fields: 'name|location|centroid|legislation'
    });

    const response = await integrationUtils.getRecords(url);

    if (!response || !response[0]) {
      throw Error('getRecordProject - failed to fetch Project dataset.');
    }

    return response[0];
  }
}

module.exports = EpicDataSource;
