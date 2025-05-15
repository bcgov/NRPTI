const defaultLog = require('../../utils/logger')('coors-csv-datasource');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');

class CoorsCsvDataSource {
  /**
   * Creates an instance of DataSource.
   *
   * @param {*} taskAuditRecord audit record hook for this import instance
   * @param {*} auth_payload information about the user account that started this update
   * @param {*} recordType record type to create from the csv file
   * @param {*} csvRows array of csv row objects to import
   * @memberof CoorsCsvDataSource
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
   * Run the COORS csv importer.
   *
   * @returns final status of importer
   * @memberof CoorsCsvDataSource
   */
  async run() {
    defaultLog.info('run - import coors-csv');

    this.status.itemTotal = this.csvRows.length;

    await this.taskAuditRecord.updateTaskRecord({ status: 'Running', itemTotal: this.csvRows.length });

    await this.batchProcessRecords();

    return this.status;
  }

  /**
   * Runs processRecord() on each csv row, in batches.
   *
   * Batch size configured by env variable `CSV_IMPORT_BATCH_SIZE` if it exists, or 100 by default.
   *
   * @memberof CoorsCsvDataSource
   */
  async batchProcessRecords() {
    try {
      let batchSize = process.env.CSV_IMPORT_BATCH_SIZE || 100;

      const recordTypeConfig = this.getRecordTypeConfig();
      const courtConvictionTypeConfig = {
        getUtil: (auth_payload, csvRow) => {
          return new (require('./court-conviction-utils'))(auth_payload, RECORD_TYPE.CourtConviction, csvRow);
        }
      };

      if (!recordTypeConfig) {
        throw Error('batchProcessRecords - failed to find matching recordTypeConfig.');
      }

      let promises = [];
      for (let i = 0; i < this.csvRows.length; i++) {
        const csvRow = this.csvRows[i];

        // process Convictions serially so penalties can be appended to existing records propely
        //
        // Rows with enforcemnt_outcome === 'GTYJ' should be treated as Court Conviction regardless
        // of the selected import type.  This is due to limitation on COORS export query.
        // https://bcmines.atlassian.net/browse/NRPT-798
        if (
          this.recordType === 'Court Conviction' ||
          (csvRow['enforcement_outcome'] && csvRow['enforcement_outcome'] === 'GTYJ')
        ) {
          await this.processRecord(csvRow, courtConvictionTypeConfig);
        } else {
          // batch process
          promises.push(this.processRecord(csvRow, recordTypeConfig));
          if (i % batchSize === 0 || i === this.csvRows.length - 1) {
            await Promise.all(promises);
            promises = [];
          }
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
   * @memberof CoorsCsvDataSource
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

      // Record will be null if row has business_reviewed = N, skip processing it
      if (!nrptiRecord) {
        defaultLog.debug('skipped record processing, not reviewed by business');
        return Promise.resolve();
      }
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
    }
  }

  /**
   * Supported coors-csv record type configs.
   *
   * @returns {*} object with getUtil method to create a new instance of the record type utils.
   * @memberof CoorsCsvDataSource
   */
  getRecordTypeConfig() {
    if (this.recordType === 'Ticket') {
      return {
        getUtil: (auth_payload, csvRow) => {
          return new (require('./tickets-utils'))(auth_payload, RECORD_TYPE.Ticket, csvRow);
        }
      };
    }

    if (this.recordType === 'Court Conviction') {
      return {
        getUtil: (auth_payload, csvRow) => {
          return new (require('./court-conviction-utils'))(auth_payload, RECORD_TYPE.CourtConviction, csvRow);
        }
      };
    }

    if (this.recordType === 'Administrative Sanction') {
      return {
        getUtil: (auth_payload, csvRow) => {
          return new (require('./admin-sanction-utils'))(auth_payload, RECORD_TYPE.AdministrativeSanction, csvRow);
        }
      };
    }

    return null;
  }
}

module.exports = CoorsCsvDataSource;
