'use strict';

const QS = require('qs');
const integrationUtils = require('../integration-utils');
const EPIC_TYPE = require('./epic-type-enum');
const defaultLog = require('../../utils/logger')('epic-integration');

const MAX_PAGE_SIZE = Number.MAX_SAFE_INTEGER;

class EpicDataSource {
  /**
   * Creates an instance of EpicDataSource.
   *
   * @param {EPIC_TYPE} recordType epic record type to fetch/update (required).
   * @param {*} params params to filter epic records (optional).
   * @memberof EpicDataSource
   */
  constructor(recordType, params) {
    if (!recordType) {
      throw Error('EpicDataSource - missing required recordType parameter');
    }

    if (!(recordType in EPIC_TYPE)) {
      throw Error('EpicDataSource - recordType parameter is not supported');
    }

    this.type = EPIC_TYPE[recordType];
    this.params = params || {};

    defaultLog.debug(`EpicDataSource - type: ${JSON.stringify(this.type)}`);
    defaultLog.debug(`EpicDataSource - params: ${JSON.stringify(this.params)}`);

    // Set initial status
    this.status = { itemsProcessed: 0, itemTotal: 0 };
  }

  /**
   * Main function that runs all necessary operations to update Epic records for a given type.
   *
   * @async
   * @returns {object} overall status of update
   * @memberof EpicDataSource
   */
  async updateRecords() {
    try {
      // Build request url
      const typeId = await this.getRecordTypeId(); // TODO Need to change this to account for epic milestone
      const queryParams = {
        ...this.params,
        ...this.getBaseParams(typeId, '5cf00c03a266b7e1877504ef', MAX_PAGE_SIZE, 0) // TODO don't hardcode milestone
      };
      const url = this.getIntegrationUrl(this.getHostname(), this.getPathname(), queryParams);

      // Add url to status
      this.status.dataSource = url;

      // Get Epic records
      const data = await integrationUtils.getRecords(url);
      const epicRecords = data && data[0] && data[0].searchResults;

      // Failed to find any epic records
      if (!epicRecords || !epicRecords.length) {
        this.status.message = 'no records found';
        return this.status;
      }

      // Add total epic items found to status
      this.status.itemTotal = epicRecords.length;

      // Add epic meta (whatever it contains) to the status
      this.status.epicMeta = data && data[0] && data[0].meta && data[0].meta;

      // Process records
      this.processRecords(epicRecords);
    } catch (error) {
      this.status.message = 'unexpected error';
      this.status.error = JSON.stringify(error);
    }

    return this.status;
  }

  /**
   * Process the epic records one by one:
   * - Transform into a NRPTI record
   * - Persist to the database
   *
   * Note: individual records failing should not stop the remaining records from processing successfully.
   *
   * @param {*} epicRecords
   * @memberof EpicDataSource
   */
  processRecords(epicRecords) {
    // Get type specific utils
    this.typeUtils = this.getRecordTypeUtils(this.type);

    for (let i = 0; i < epicRecords.length; i++) {
      try {

        // TODO fetch/stream epic documents somewhere around here?

        // Perform any data transformations necessary to convert Epic record to NRPTI record
        const nrptiRecord = this.typeUtils.transformRecord(epicRecords[i]);

        // Persist NRPTI record
        // const dbStatus = // TODO use dbStatus to check if save passed or failed, and inform itemsProcessed accordingly
        this.typeUtils.saveRecord(nrptiRecord);

        this.status.itemsProcessed++;
      } catch (error) {
        defaultLog.error(`processRecords - record failed: ${error.message}`);
        defaultLog.debug(`processRecords - record failed - error.stack: ${error.stack}`);
        // Do not re-throw error, as a single failure is not cause to stop the other records from processing
        // TODO put any logging or special handling when a single record fails?
      }
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
   * @memberof EpicDataSource
   */
  getHostname() {
    return process.env.EPIC_API_HOSTNAME || 'eagle-prod.pathfinder.gov.bc.ca';
  }

  /**
   * Get the Epic API pathname.
   *
   * Will return the env variable `EPIC_API_INSPECTIONS_PATHNAME` if it exists.
   *
   * Example: '/api/some/route'
   *
   * @returns {string} Epic api inspections path.
   * @memberof EpicDataSource
   */
  getPathname() {
    return process.env.EPIC_API_INSPECTIONS_PATHNAME || '/api/public/search';
  }

  /**
   * Get base record query params.
   *
   * @param {string} typeId record type _id.
   * @param {string} milestoneId record milestone id.
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
   * Get the record type specific util.
   *
   * @returns {object} the type specific util, or null if no matching util found.
   * @throws {Error} if utils for specified type cannot be found.
   * @memberof EpicDataSource
   */
  getRecordTypeUtils() {
    switch (this.type) {
      case EPIC_TYPE.inspection:
        return new (require('./epic-inspections'))();
      case EPIC_TYPE.order:
        return new (require('./epic-orders'))();
      default:
        throw Error(`getTypeUtil - failed to find utils for type: ${JSON.stringify(this.type)}`);
    }
  }

  /**
   * Get the id of the Epic record type based on the List name field.
   *
   * @async
   * @param {EPIC_TYPE} type the name field on the List dataset for the desired document type id.
   * @returns document type _id
   * @throws {Error} if record type id cannot be found.
   * @memberof EpicDataSource
   */
  // TODO Need to account for milestone
  async getRecordTypeId() {
    const url = this.getIntegrationUrl(this.getHostname(), this.getPathname(), { dataset: 'List' });

    const response = await integrationUtils.getRecords(url);

    if (!response || !response[0] || !response[0].searchResults) {
      throw Error(`getTypeUtil - failed to find List record for type: ${this.type.epicType}`);
    }

    const types = response[0].searchResults;

    const desiredType = types.find(element => element.type === 'doctype' && element.name === this.type.epicType);

    if (!desiredType) {
      throw Error(`getTypeUtil - failed to find type _id for epic type: ${this.type.epicType}`);
    }

    return desiredType._id;
  }
}

module.exports = EpicDataSource;
