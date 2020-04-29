const defaultLog = require('../../utils/logger')('cors-csv-datasource');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');

class CorsCsvDataSource {
  /**
   * Creates an instance of DataSource.
   *
   * @param {*} taskAuditRecord audit record hook for this import instance
   * @param {*} auth_payload information about the user account that started this update
   * @param {*} recordType record type to create from the csv file
   * @param {*} csvRows csv file to import
   * @memberof CorsCsvDataSource
   */
  constructor(taskAuditRecord, auth_payload, recordType, csvRows) {
    this.taskAuditRecord = taskAuditRecord;
    this.auth_payload = auth_payload;
    this.recordType = recordType;
    this.csvRows = csvRows;

    // Set initial status
    this.status = { itemsProcessed: 0, itemTotal: 0, individualRecordStatus: [] };
  }

  /**
   * Run the Cors csv importer.
   *
   * @returns
   * @memberof CorsCsvDataSource
   */
  async run() {
    defaultLog.info('run - import cors-csv');
    await this.taskAuditRecord.updateTaskRecord({ status: 'Running', itemTotal: this.csvRows.length });

    return await this.batchProcessRecords();
  }

  /**
   * Runs processRecord() on each csv row, in batches.
   *
   * Batch size configured by env variable `CSV_IMPORT_BATCH_SIZE` if it exists, or 100 by default.
   *
   * @memberof CorsCsvDataSource
   */
  async batchProcessRecords() {
    try {
      let batchSize = process.env.CSV_IMPORT_BATCH_SIZE || 100;

      const recordTypeConfig = this.getRecordTypeConfig();

      if (!recordTypeConfig) {
        throw Error('batchProcessRecords - failed to find matching recordTypeConfig.');
      }

      let promises = [];
      for (let i = 0; i < this.csvRows.length; i++) {
        promises.push(this.processRecord(this.csvRows[i], recordTypeConfig));

        if (i % batchSize === 0 || i === this.csvRows.length - 1) {
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
   * @param {*} csvRow array of values for a single row
   * @param {*} recordTypeConfig object containing record type specific details
   * @memberof CorsCsvDataSource
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
      const nrptiRecord = await recordTypeUtils.transformRecord(csvRow);

      // Check if this record already exists
      const existingRecord = await recordTypeUtils.findExistingRecord(nrptiRecord);

      let savedRecords = null;
      if (existingRecord) {
        // update existing record
        savedRecords = await recordTypeUtils.updateRecord(nrptiRecord, existingRecord);
      } else {
        // create new record
        savedRecords = await recordTypeUtils.createRecord(nrptiRecord);
      }

      if (savedRecords && savedRecords.length > 0 && savedRecords[0].status === 'success') {
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
   * Supported cors-csv record type configs.
   *
   * @returns {*} object with getUtil method to create a new instance of the record type utils.
   * @memberof CorsCsvDataSource
   */
  getRecordTypeConfig() {
    switch (this.recordType) {
      case 'Ticket':
        return {
          getUtil: (auth_payload, csvRow) => {
            return new (require('./tickets-utils'))(auth_payload, RECORD_TYPE.Ticket, csvRow);
          }
        };
      default:
        return null;
    }
  }
}

module.exports = CorsCsvDataSource;
