const defaultLog = require('../../utils/logger')('bcogc-datasource');
const integrationUtils = require('../integration-utils');
const { getCsvRowsFromString } = require('../../utils/helpers');

const RECORD_TYPE = require('../../utils/constants/record-type-enum');
const BCOGC_CSV_ENDPOINT = process.env.BCOGC_CSV_ENDPOINT || 'https://reports.bcogc.ca/ogc/f?p=200:501::CSV';

class OgcCsvDataSource {
  /**
   * Creates an instance of DataSource.
   *
   * @param {*} taskAuditRecord audit record hook for this import instance
   * @param {*} auth_payload information about the user account that started this update
   * @param {*} recordType record type to create from the csv file
   * @param {*} csvRows array of csv row objects to import
   * @memberof OgcCsvDataSource
   */
  constructor(taskAuditRecord, auth_payload, params = null, recordTypes = null) {
    this.taskAuditRecord = taskAuditRecord;
    this.auth_payload = auth_payload;
    this.recordTypes = recordTypes;
    this.params = params;

    // Set initial status
    this.status = { itemsProcessed: 0, itemTotal: 0, individualRecordStatus: [] };
  }

  /**
   * Run the Ogc csv importer.
   *
   * @returns final status of importer
   * @memberof OgcCsvDataSource
   */
  async run() {
    defaultLog.info('run - import bcogc');
    
    const csvRows = await this.fetchBcogcCsv();

    this.status.itemTotal = csvRows.length;
    await this.taskAuditRecord.updateTaskRecord({ status: 'Running', itemTotal: this.status.itemTotal});

    await this.batchProcessRecords(csvRows);
    
    return this.status;
  }

  /**
   * Runs processRecord() on each csv row, in batches.
   *
   * Batch size configured by env variable `CSV_IMPORT_BATCH_SIZE` if it exists, or 100 by default.
   * @param {Array<*>} csvRows array of objects of values for a single row
   * @memberof OgcCsvDataSource
   */
  async batchProcessRecords(csvRows) {
    try {
      let batchSize = process.env.CSV_IMPORT_BATCH_SIZE || 100;

      const recordTypeConfig = this.getRecordTypeConfig();

      if (!recordTypeConfig) {
        throw Error('batchProcessRecords - failed to find matching recordTypeConfig.');
      }

      let promises = [];
      for (let i = 0; i < csvRows.length; i++) {
        promises.push(this.processRecord(csvRows[i], recordTypeConfig));

        if (i % batchSize === 0 || i === csvRows.length - 1) {
          await Promise.all(promises);
          promises = [];
        }
      }
    } catch (error) {
      this.status.message = 'batchProcessRecords - unexpected error';
      this.status.error = error.message;

      defaultLog.error(`batchProcessRecords - unexpected error: ${error.message}`);
    }
  }

  /**
   * Perform all steps necessary to process and save a single row of the csv file.
   *
   * @param {*} csvRow object of values for a single row
   * @param {*} recordTypeConfig object containing record type specific details
   * @memberof OgcCsvDataSource
   */
  async processRecord(csvRow, recordTypeConfig) {
    // set status defaults
    let recordStatus = {};

    try {
      if (!csvRow) {
        throw Error('processRecord - required csvRow is null.');
      }

      if (!recordTypeConfig) {
        throw Error('processRecord - required recordTypeConfig is null.');
      }

      // Get a new instance of the record utils that correspond with the current recordType
      const recordTypeUtils = recordTypeConfig.getUtil(this.auth_payload, csvRow);

      // Perform any data transformations necessary to convert the csv row into a NRPTI record
      const nrptiRecord = recordTypeUtils.transformRecord(csvRow);

      // Check if this record already exists
      const existingRecord = await recordTypeUtils.findExistingRecord(nrptiRecord);

      let savedRecord = null;
      if (existingRecord) {
        // update existing record
        savedRecord = await recordTypeUtils.updateRecord(nrptiRecord, existingRecord);
      } else {
        // create new record
        savedRecord = await recordTypeUtils.createItem(nrptiRecord);
      }

      if (savedRecord && savedRecord.length > 0 && savedRecord[0].status === 'success') {
        this.status.itemsProcessed++;

        await this.taskAuditRecord.updateTaskRecord({ itemsProcessed: this.status.itemsProcessed });
      } else {
        throw Error('processRecord - savedRecord is null.');
      }
    } catch (error) {
      recordStatus.message = 'processRecord - unexpected error';
      recordStatus.error = error.message;

      // only add individual record status when an error occurs
      this.status.individualRecordStatus.push(recordStatus);

      // Do not re-throw error, as a single failure is not cause to stop the other records from processing
      defaultLog.error(`processRecord - unexpected error: ${error.message}`);
      defaultLog.error(`processRecord - unexpected error: ${error.stack}`);
    }
  }

  /**
   * Supported bcogc record type configs.
   *
   * @returns {*} object with getUtil method to create a new instance of the record type utils.
   * @memberof OgcCsvDataSource
   */
  getRecordTypeConfig() {
    return {
      getUtil: (auth_payload, csvRow) => {
        return new (require('./inspections-utils'))(auth_payload, RECORD_TYPE.Inspection, csvRow);
      }
    };
  }

  /**
   * Gets the CSV of inspection from BCOGC
   * 
   * @returns {Array<*>} array of objects for a processed CSV
   * @memberof OgcCsvDataSource
   */
  async fetchBcogcCsv() {
    try {
      const validUrl = new URL(BCOGC_CSV_ENDPOINT);
      
      const response = await integrationUtils.getRecords(validUrl);
      const transformedCsv = getCsvRowsFromString(response);

      return transformedCsv;
    } catch (error) {
      this.status.message = 'fetchBcogcCsv - unexpected error';
      this.status.error = error.message;

      defaultLog.error(`fetchBcogcCsv - unexpected error: ${error.message}`);
    }
  }
}

module.exports = OgcCsvDataSource;
