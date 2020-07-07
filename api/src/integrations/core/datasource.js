'use strict';

const axios = require('axios');
const QS = require('qs');

const integrationUtils = require('../integration-utils');
const MineUtils = require('./mine-utils');
const PermitUtils = require('./permit-utils');
const PermitAmendmentUtils = require('./permit-amendment-utils');
const defaultLog = require('../../utils/logger')('core-datasource');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');

const CORE_API_BATCH_SIZE = process.env.CORE_API_BATCH_SIZE || 300;

const CORE_TOKEN_ENDPOINT = process.env.CORE_TOKEN_ENDPOINT || 'https://sso.pathfinder.gov.bc.ca/auth/realms/mds/protocol/openid-connect/token';
const CORE_CLIENT_ID = process.env.CORE_CLIENT_ID || null;
const CORE_CLIENT_SECRET = process.env.CORE_CLIENT_SECRET || null;
const CORE_GRANT_TYPE = process.env.CORE_GRANT_TYPE || null;

const CORE_API_HOST = process.env.CORE_API_HOST|| 'https://minesdigitalservices.pathfinder.gov.bc.ca';
const CORE_API_PATH_MINES = process.env.CORE_API_PATH_MINES || '/api/mines';
const CORE_API_PATH_PARTIES = process.env.CORE_API_PATH_PARTIES || '/api/parties/mines';
const CORE_API_PATH_COMMODITIES = process.env.CORE_API_PATH_COMMODITIES || '/api/mines/commodity-codes';

class CoreDataSource {
  /**
   * Creates an instance of CoreDataSource.
   *
   * @param {*} taskAuditRecord audit record hook for this import instance
   * @param {*} auth_payload information about the user account that started this update.
   * @memberof CoreDataSource
   */
  constructor(taskAuditRecord, auth_payload) {
    this.taskAuditRecord = taskAuditRecord;
    this.auth_payload = auth_payload;

    // Set initial status
    this.status = { itemsProcessed: 0, itemTotal: 0, individualRecordStatus: [] };
  }

  // This requires no auth setup, so just call the local updater function.
  async run() {
    defaultLog.info('run - update core datasource');
    await this.taskAuditRecord.updateTaskRecord({ status: 'Running' });

    try{
      await this.coreLogin();
      await this.updateRecords();

      if (this.status.individualRecordStatus.length) {
        defaultLog.error('CoreDataSource - error processing some records');
        // This means there was an error on one or more records, but the the job still completed.
       for (const error of this.status.individualRecordStatus) {
         defaultLog.error(`Core record: ${error.coreId}, error: ${error.error}`);
       }
      }
    }
    catch (error) {
      defaultLog.error('CoreDataSource run error:', error.message);
    }
  }

  /**
   * Main function that runs all necessary operations to update Core records.
   * Sample Record Data for reference
      {
        _schemaName: 'MineBCMI',
        _sourceRefId: 'abc123',	
        name: 'Test Mine',
        permitNumber: 'M-209',
        mine_status: ['Abandoned'],
        mine_type: 'Gold',
        mine_tailings_storage_facilities: ['x'],
        mine_region: 'Victoria',
        coordinates : [0,0],
        parties: [{mine_party_appt_type_code: 'PMT', name: "Nobody"}]
      }
    ];
   *
   * @memberof CoreDataSource
   */
  async updateRecords() {
    try {
      const coreRecords = await this.getAllRecordData();

      // Failed to find any epic records
      if (!coreRecords || !coreRecords.length) {
        defaultLog.error('updateRecords - no records found to update');
        return;
      }

      this.status.itemTotal += coreRecords.length;
      await this.taskAuditRecord.updateTaskRecord({ itemTotal: this.status.itemTotal });

      // Get the record type specific utils, that contain the unique transformations, etc, for the various record types.
      const utils = {
        mineUtils: new MineUtils(this.auth_payload, RECORD_TYPE.MineBCMI),
        permitUtils: new PermitUtils(this.auth_payload, RECORD_TYPE.Permit),
        permitAmendmentUtils: new PermitAmendmentUtils(this.auth_payload, RECORD_TYPE.PermitAmendment)
      };

      if (!utils.mineUtils || !utils.permitUtils || !utils.permitAmendmentUtils) {
        defaultLog.error('updateRecords - missing required utils');
        return;
      }

      // Process each record.
      await this.processRecords(utils, coreRecords);
    } catch (error) {
      defaultLog.error(`updateRecords - unexpected error: ${error.message}`);
      throw(error);
    }
  }

  /**
   * Gets all mine records. Calls multiple API endpoints and consolidates the results.
   * 
   * @returns {Array<object>} Mine records with complete data
   * @memberof CoreDataSource
   */
  async getAllRecordData() {
    try{
      const verifiedMines = await this.getVerifiedMines();
      const minesWithDetails = await this.addMinesDetails(verifiedMines);

      return minesWithDetails;
    } catch (error) {
      defaultLog.error(`getAllRecordData - unexpected error: ${error.message}`);
      throw(error);
    }
  }

  /**
   * Runs processRecord() on each coreRecord.
   *
   *
   * @param {*} recordTypeUtils record type specific utils that contain the unique transformations, etc, for this type.
   * @param {*} permitUtils utils to support permits.
   * @param {*} coreRecords core records to process.
   * @memberof CoreDataSource
   */
  async processRecords(utils, coreRecords) {
    try {
      if (!utils) {
        throw Error('processRecords - required utils is null.');
      }

      if (!coreRecords) {
        throw Error('processRecords - required coreRecords is null.');
      }

      // Get the up to date commodity types for records.
      const url = this.getIntegrationUrl(CORE_API_HOST, CORE_API_PATH_COMMODITIES);
      const { records: commodityTypes } = await integrationUtils.getRecords(url, this.getAuthHeader());

      // Process each core record.
      const promises = coreRecords.map(record => this.processRecord(utils, commodityTypes, record));
      await Promise.all(promises);
    } catch (error) {
      defaultLog.error(`processRecords - unexpected error: ${error.message}`);
      // Throwing this error will stop the processing. This will only occur if there is an issue
      // getting commodities. Single record processing errors silently and won't trigger this.
      throw(error);
    }
  }

  /**
   * Process a core record.
   *
   * For this record:
   * - Transform into a NRPTI record
   * - Persist to the database
   *   - Either performing a create or update
   *
   * @param {*} recordTypeUtils record type specific utils that contain the unique transformations, etc, for this type.
   * @param {*} permitUtils utils to support permits.
   * @param {*} coreRecord core record to process.
   * @returns {object} status of the process operation for this record.
   * @memberof CoreDataSource
   */
  async processRecord(utils, commodityTypes, coreRecord) {
    const { mineUtils, permitUtils, permitAmendmentUtils } = utils;
    let recordStatus = {};

    try {
      if (!mineUtils) {
        throw Error('processRecord - required mineUtils is null.');
      }

      if (!permitUtils) {
        throw Error('processRecord - required permitUtils is null.');
      }

      if (!permitAmendmentUtils) {
        throw Error('processRecord - required permitAmendmentUtils is null.');
      }

      if (!coreRecord) {
        throw Error('processRecord - required coreRecord is null.');
      }

      // Perform any data transformations necessary to convert core record to NRPTI record
      const nrptiRecord = await mineUtils.transformRecord(coreRecord, commodityTypes);

      // Check if this record already exists
      const existingRecord = await mineUtils.findExistingRecord(nrptiRecord);

      let savedRecord = null;
      if (existingRecord) {
        // Update permit.
        await this.updateMinePermit(permitUtils, permitAmendmentUtils, existingRecord);
        savedRecord = await mineUtils.updateRecord(nrptiRecord, existingRecord);
      } else {   
        // Create the permit and amendments.
        const permit = await this.createMinePermit(permitUtils, permitAmendmentUtils, nrptiRecord);
        // Get the original parties for the core record. These are required when adding a permit to a NRPTI record.
        const parties = coreRecord.parties;
        const recordWithPermits = mineUtils.addPermitToRecord(nrptiRecord, permit, parties);

        savedRecord = await mineUtils.createRecord(recordWithPermits);
      }

      if (savedRecord && savedRecord.length > 0 && savedRecord[0].status === 'success') {
        this.status.itemsProcessed++;

        await this.taskAuditRecord.updateTaskRecord({ itemsProcessed: this.status.itemsProcessed });
      } else {
        throw Error('processRecord - savedRecord is null.');
      }
    } catch (error) {
      recordStatus.coreId = coreRecord && coreRecord.mine_guid;
      recordStatus.error = error.message;

      // only add individual record status when an error occurs
      this.status.individualRecordStatus.push(recordStatus);
    }
  }

  /**
   * Logs in to the Core API and set the token for future authenticated calls.
   *
   * @memberof CoreDataSource
   */
  async coreLogin() {
    if(!CORE_CLIENT_ID || !CORE_CLIENT_SECRET || !CORE_GRANT_TYPE) {
      defaultLog.error('Must set connection details for Core data connection.');
      throw new Error('Configuration Error');
    }

    const requestBody = {
        client_id: CORE_CLIENT_ID,
        client_secret: CORE_CLIENT_SECRET,
        grant_type: CORE_GRANT_TYPE
    };

    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    const res = await axios.post(CORE_TOKEN_ENDPOINT, QS.stringify(requestBody), config);

    const payload = res.data ? res.data : null;

    if (!payload || !payload.access_token) {
      defaultLog.error('Error authenticating against Core API.');
      throw new Error('Core Login Error');
    }

    this.client_token = payload.access_token;
    defaultLog.info('Core API token expires:', (payload.expires_in / 60 / 60).toFixed(2), ' hours');
  }

  /**
   * Builds the integration URL string.
   *
   * @param {string} hostname the url hostname. Example: 'www.example.com'
   * @param {string} pathname the url pathname. Example: '/api/some/route'
   * @param {object} queryParams the url query params. Example: { type: 'document', other: true }
   * @returns {URL} integration URL (see https://nodejs.org/api/url.html#url_url)
   * @memberof CoreDataSource
   */
  getIntegrationUrl(hostname, pathname, queryParams = {}) {
    const query = QS.stringify(queryParams);
    const path = `${pathname}?${query}`;
    const url = new URL(path, hostname);

    return url;
  }

  /**
   * Creates the authentication header for core API requests.
   * 
   * @returns {object} Axios header with the bearer token set
   * @memberof CoreDataSource
   */
  getAuthHeader() {
    return {
      headers: {
        Authorization: `Bearer ${this.client_token}`
      }
    }
  }

  /**
   * Gets valid permit for a Core mine. A valid permit must meet the following criteria:
   *  - Must not be exploratory
   *  - Must not be historical
   * .
   * 
   * @param {object} nrptiRecord NRPTI record
   * @returns {object} Valid permit.
   * @memberof CoreDataSource
   */
  async getMinePermit(nrptiRecord) {
    if (!nrptiRecord) {
      throw Error('getMinePermit - required nrptiRecord is null.');
    }

    // Get permits with detailed information.
    const url = this.getIntegrationUrl(CORE_API_HOST, `/api/mines/${nrptiRecord._sourceRefId}/permits`);
    const { records: permits } = await integrationUtils.getRecords(url, this.getAuthHeader());

    // First, any mines with 'X' as their second character are considered exploratory. Remove them.
    const nonExploratoryPermits = permits.filter(permit => permit.permit_no[1].toLowerCase() !== 'x');

    // Second, mine must not be historical which is indicated by an authorized year of '9999' on the latest amendment.
    let validPermit;
    for (const permit of nonExploratoryPermits) {
      // Confirm that the most recent amendment is not historical, which is always the first index.
      // If 'null' then it is considered valid.
      if (permit.permit_amendments.length && !permit.permit_amendments[0].authorization_end_date) {
        // There should only be a single record. If there is more then we do not want to continue processing.
        if (validPermit) {
          throw new Error(`More than one valid permit found for mine ${nrptiRecord._sourceRefId}`);
        }

        validPermit = permit;
      }
      else {
        // If it is not '9999' it is considered valid.
        const authDate = new Date(permit.permit_amendments[0].authorization_end_date);

        if (authDate.getFullYear() !== 9999) {
          // There should only be a single record. If there is more then we do not want to continue processing.
          if (validPermit) {
            throw new Error(`More than one valid permit found for mine ${nrptiRecord._sourceRefId}`);
          }

          validPermit = permit;
        }
      }
    }

    return validPermit;
  }

  /**
   * Creates a new Mine Permit record.
   * 
   * @param {object} permitUtils Mine Permit utilities.
   * @param {*} nrptiRecord Transformed Core record.
   * @returns {MinePermit} Newly created Mine Permit.
   * @memberof CoreDataSource
   */
  async createMinePermit(permitUtils, permitAmendmentUtils, nrptiRecord) {
    if (!permitUtils) {
      throw new Error('createMinePermit - permitUtils is required');
    }

    if (!permitAmendmentUtils) {
      throw new Error('createMinePermit - permitAmendmentUtils is required');
    }

    if (!nrptiRecord) {
      throw new Error('createMinePermit - nrptiRecord is required');
    }

    const permit = await this.getMinePermit(nrptiRecord);

    if (!permit) {
      throw new Error('createMinePermit - Cannot find valid permit');
    }

    // Create the permit amendments that belong to the permit.
    const transformedAmendments = await permitAmendmentUtils.transformRecords(permit);
    // To trigger flavour for this import.
    const preparedAmendments = transformedAmendments.map(amendment => ({ ...amendment, PermitAmendmentBCMI: {} }))

    const savedAmendments = [];
    for (const amendment of preparedAmendments) {
      const createdRecord = await permitAmendmentUtils.createRecord(amendment);
      savedAmendments.push(createdRecord);
    }
 
    // Transform and create the permit record.
    const transformedPermit = await permitUtils.transformRecord(permit, savedAmendments);
    // To trigger flavour for this import.
    transformedPermit.PermitBCMI = {};
    const savedRecord = await permitUtils.createRecord(transformedPermit);

    // Get the newly created permit.
    return savedRecord[0] &&
            savedRecord[0].object &&
            savedRecord[0].object[0] &&
            savedRecord[0].object[0]
  }

  /**
   * Updates the Mine Permit record.
   * 
   * @param {object} permitUtils Mine Permit utilities
   * @param {Mine} mineRecord Existing Mine record
   * @returns {boolean} Indication of success or not
   * @memberof CoreDataSource
   */
  async updateMinePermit(permitUtils, permitAmendmentUtils, mineRecord) {
    // Get the updated Core permit.
    const permit = await this.getMinePermit(mineRecord);

    if (!permit) {
      throw new Error('updateMinePermit - Cannot find valid permit');
    }

    // Update the amendments and permit.
    const transformedAmendments = await permitAmendmentUtils.transformRecords(permit);
    // To trigger flavour for this import.
    const preparedAmendments = transformedAmendments.map(amendment => ({ ...amendment, PermitAmendmentBCMI: {} }));

    // Need to update existing, but add any new ones.
    const updatedAmendments = [];
    for (const amendment of preparedAmendments) {
      // Check if this record already exists
      const existingRecord = await permitAmendmentUtils.findExistingRecord(amendment);

      if (existingRecord) {
        const updatedRecord = await permitAmendmentUtils.updateRecord(amendment, existingRecord);
        updatedAmendments.push(updatedRecord);
      } else {
        const createdRecord = await permitAmendmentUtils.createRecord(amendment);
        updatedAmendments.push(createdRecord);
      }
    }
  
    // Transform and update the permit record.
    const transformedPermit = await permitUtils.transformRecord(permit, updatedAmendments);
    // To trigger flavour for this import.
    transformedPermit.PermitBCMI = {};
    const savedRecord = await permitUtils.updateRecord(mineRecord.permit, transformedPermit);

    if (savedRecord && savedRecord[0] && savedRecord[0].status === 'success') {
      return true;
    }

    return false;
  }

  /**
   * Gets all verified mines from Core.
   * 
   * @returns {object[]} Verified Core mines.
   * @memberof CoreDataSource
   */
  async getVerifiedMines() {
    try{
      let currentPage = 1;
      let totalPages = 1;
      let mineRecords = [];

      // The Core API can not return all data in a single call. Must fetch data in batches.
      do {
        const queryParams = { 
          per_page: CORE_API_BATCH_SIZE, 
          page: currentPage,
          major: true 
        };
        const url = this.getIntegrationUrl(CORE_API_HOST, CORE_API_PATH_MINES, queryParams);
  
        // Get Core records
        const data = await integrationUtils.getRecords(url, this.getAuthHeader());
        // Get records from response and add to total.
        const newRecords = data && data.mines || [];
        mineRecords = [...mineRecords, ...newRecords];

        currentPage++;
        totalPages = data.total_pages;

        defaultLog.info(`Fetched page ${currentPage - 1} out of ${totalPages}`);
      } while (currentPage <= totalPages)

      // Filter to only verified mines. There is some discrepancy with data, so check that there is a verified mine ID to be sure.
      const verifiedRecords = mineRecords.filter(record => record.verified_status && record.verified_status.mine_guid);

      return verifiedRecords
    } catch (error) {
      defaultLog.error(`getVerifiedMines - unexpected error: ${error.message}`);
      throw(error);
    }
  }

  /**
   * Adds party and lat/long details to each Core record.
   * 
   * @param {object[]} coreRecords Records from Core API that have not been transformed.
   * @returns {object[]} Records with details added.
   * @memberof CoreDataSource
   */
  async addMinesDetails(coreRecords) {
    const completeRecords = [];

    for (let i = 0; i < coreRecords.length; i++) {
      const partyQueryParams = {
        mine_guid: coreRecords[i].mine_guid,
        relationships: 'party'
      };

      const partyUrl = this.getIntegrationUrl(CORE_API_HOST, CORE_API_PATH_PARTIES, partyQueryParams);
      const mineDetailsPath = `${CORE_API_PATH_MINES}/${coreRecords[i].mine_guid}`;
      const mineDetailsUrl = this.getIntegrationUrl(CORE_API_HOST, mineDetailsPath);

      try {
        const [ parties, mineDetails ] = await Promise.all([
          integrationUtils.getRecords(partyUrl, this.getAuthHeader()),
          integrationUtils.getRecords(mineDetailsUrl, this.getAuthHeader())
        ]);

        const latitude = mineDetails.mine_location && mineDetails.mine_location.latitude || 0.00;
        const longitude = mineDetails.mine_location && mineDetails.mine_location.longitude || 0.00;
  

        completeRecords.push({
          ...coreRecords[i],
          coordinates: [longitude, latitude],
          parties
        });
      } catch (error) {
        defaultLog.error(`addMineDetails - error getting details for Core record ${coreRecords[i].mine_guid}: ${error.message} ...skipping`);
      }
    }

    return completeRecords;
  }
}

module.exports = CoreDataSource;