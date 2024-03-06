const axios = require('axios');
const cheerio = require('cheerio');
const defaultLog = require('../../utils/logger')('bcogc-datasource');
const integrationUtils = require('../integration-utils');
const { getCsvRowsFromString } = require('../../utils/csv-helpers');
const { getActTitleFromDB } = require('../../controllers/acts-regulations-controller')

const RECORD_TYPE = require('../../utils/constants/record-type-enum');
const BCOGC_UTILS_TYPES = require('./bcogc-utils-types-enum');
const BCOGC_INSPECTIONS_CSV_ENDPOINT = process.env.BCOGC_INSPECTIONS_CSV_ENDPOINT || 'https://reports.bc-er.ca/ogc/f?p=200:501::CSV';
const BCOGC_ORDERS_CSV_ENDPOINT = process.env.BCOGC_ORDERS_CSV_ENDPOINT || 'https://www.bc-er.ca/data-reports/compliance-enforcement/reports/enforcement-order';
const BCOGC_PENALTIES_CSV_ENDPOINT = process.env.BCOGC_PENALTIES_CSV_ENDPOINT || 'https://www.bc-er.ca/data-reports/compliance-enforcement/reports/contravention-decision';
const BCOGC_WARNING_CSV_ENDPOINT = process.env.BCOGC_WARNING_CSV_ENDPOINT  || 'https://www.bc-er.ca/data-reports/compliance-enforcement/reports/warning-letter';
const ENERGY_ACT_CODE = 'ACT_103'

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

    this.actName = await getActTitleFromDB(ENERGY_ACT_CODE);
    const csvs = await this.fetchAllBcogcCsvs();

    this.status.itemTotal = csvs.getLength();
    await this.taskAuditRecord.updateTaskRecord({ status: 'Running', itemTotal: this.status.itemTotal});

    await this.batchProcessRecords(csvs);

    return this.status;
  }

  /**
   * Runs processRecord() on each csv row, in batches.
   *
   * Batch size configured by env variable `CSV_IMPORT_BATCH_SIZE` if it exists, or 100 by default.
   * @param {Object} csvRows Object containing arrays of CSV rows keyed by record type.
   * @memberof OgcCsvDataSource
   */
  async batchProcessRecords(csvs) {
    try {
      let batchSize = process.env.CSV_IMPORT_BATCH_SIZE || 100;

      // Handle each csv type.
      for (const recordType of csvs.types) {

        const recordTypeConfig = BCOGC_UTILS_TYPES[recordType];

        if (!recordTypeConfig) {
          throw Error('batchProcessRecords - failed to find matching recordTypeConfig.');
        }

        let promises = [];
        for (let i = 0; i < csvs[recordType].length; i++) {
          promises.push(this.processRecord(csvs[recordType][i], recordTypeConfig));

          if (i % batchSize === 0 || i === csvs[recordType].length - 1) {
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
      const nrptiRecord = recordTypeUtils.transformRecord(csvRow, this.actName);

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
        console.log(csvRow)
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
   * Gets the CSV of inspection from BCOGC
   *
   * @returns {Promise<Array<*>>} array of objects for a processed CSV
   * @memberof OgcCsvDataSource
   */
  async fetchBcogcInspectionCsv() {
    try {
      const validUrl = new URL(BCOGC_INSPECTIONS_CSV_ENDPOINT);

      const response = await integrationUtils.getRecords(validUrl);
      const transformedCsv = getCsvRowsFromString(response);

      return transformedCsv;
    } catch (error) {
      this.status.message = 'fetchBcogcInspectionCsv - unexpected error';
      this.status.error = error.message;

      defaultLog.error(`fetchBcogcInspectionCsv - unexpected error: ${error.message}`);
    }
  }

  /**
   * Scrapes rows of data from the BCOGC Order CSV.
   *
   * @returns {Promise<Array<*>>} array of objects for a processed CSV
   * @memberof OgcCsvDataSource
   */
  async fetchBcogcOrderCsv() {
    const response = await axios.get(BCOGC_ORDERS_CSV_ENDPOINT);
    return this.processBcogcHtml(response.data, 'export-table');
  }

    /**
   * Scrapes rows of data from the BCOGC Order CSV.
   *
   * @returns {Promise<Array<*>>} array of objects for a processed CSV
   * @memberof OgcCsvDataSource
   */
  async fetchBcogcPenaltyCsv() {
    const response = await axios.get(BCOGC_PENALTIES_CSV_ENDPOINT);
    return this.processBcogcHtml(response.data, 'export-table');
  }

  /**
   * Scrapes rows of data from the BCOGC Warnings CSV.
   *
   * @returns {Promise<Array<*>>} array of objects for a processed CSV
   * @memberof OgcCsvDataSource
   */
   async fetchBcogcWarningCsv() {
    const response = await axios.get(BCOGC_WARNING_CSV_ENDPOINT);
    return this.processBcogcHtml(response.data, 'export-table');
  }

  /**
   * Fetches rows from CSVs for all types of BCOGC reports
   *
   * @returns {Promise<Object>} Object containing all CSV rows keyed on the record type.
   * @memberof OgcCsvDataSource
   */
  async fetchAllBcogcCsvs() {

    const inspections = await this.fetchBcogcInspectionCsv();
    const orders = await this.fetchBcogcOrderCsv();
    const penalties = await this.fetchBcogcPenaltyCsv();
    const warnings = await this.fetchBcogcWarningCsv();

    return {
      [RECORD_TYPE.Inspection._schemaName]: inspections,
      [RECORD_TYPE.Order._schemaName]: orders,
      [RECORD_TYPE.AdministrativePenalty._schemaName]: penalties,
      [RECORD_TYPE.Warning._schemaName]: warnings,
      types: [RECORD_TYPE.AdministrativePenalty._schemaName, RECORD_TYPE.Order._schemaName, RECORD_TYPE.Inspection._schemaName, RECORD_TYPE.Warning._schemaName],
      getLength: () => orders.length + inspections.length + penalties.length + warnings.length,
    };
  }

  /**
   * Turns a BCOGC HTML table into an array of records.
   *
   * @param {string} html HTML to process
   * @param {string} tableClass Class name used to identify to scrape.
   * @returns {Array<Object>} Array of CSV row objects.
   * @memberof OgcCsvDataSource
   */
  processBcogcHtml(html, tableClass) {
    const csvRows = [];
    const csvHeadings = [];
    const $ = cheerio.load(html);

    // BCOGC tables use the first row as the heading.
    $(`table.${tableClass} tr`).each((index, row) => {
      // Get the headings.
      if (index === 0) {
        $(row).find('th').each((index, th) => {
          csvHeadings.push($(th).text());
        });
      } else {
        const rowObject = {};
        $(row).find('td').each((index, td) => {
          rowObject[csvHeadings[index]] = $(td).text().trim();
        });
        csvRows.push(rowObject);
      }
    });

    return csvRows;
  }
}

module.exports = OgcCsvDataSource;
