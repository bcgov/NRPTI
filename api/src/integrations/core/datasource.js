'use strict';

const mongoose = require('mongoose');

const integrationUtils = require('../integration-utils');
const MineUtils = require('./mine-utils');
const PermitUtils = require('./permit-utils');
const CollectionUtils = require('./collection-utils');
const defaultLog = require('../../utils/logger')('core-datasource');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');
const { getIntegrationUrl, getCoreAccessToken, getAuthHeader } = require('../integration-utils');

const CORE_API_BATCH_SIZE = process.env.CORE_API_BATCH_SIZE || 300;

const CORE_CLIENT_ID = process.env.CORE_CLIENT_ID || null;
const CORE_CLIENT_SECRET = process.env.CORE_CLIENT_SECRET || null;
const CORE_GRANT_TYPE = process.env.CORE_GRANT_TYPE || null;

const CORE_API_HOST = process.env.CORE_API_HOST|| 'https://minesdigitalservices.pathfinder.gov.bc.ca';
const CORE_API_PATH_MINES = process.env.CORE_API_PATH_MINES || '/api/mines';
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
      // Get a new API access token.
      this.client_token = await getCoreAccessToken(CORE_CLIENT_ID, CORE_CLIENT_SECRET, CORE_GRANT_TYPE);

      // Run main process.
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
        collectionUtils: new CollectionUtils(this.auth_payload, RECORD_TYPE.CollectionBCMI)
      };

      if (!utils.mineUtils || !utils.permitUtils) {
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
      const url = getIntegrationUrl(CORE_API_HOST, CORE_API_PATH_COMMODITIES);
      const { records: commodityTypes } = await integrationUtils.getRecords(url, getAuthHeader(this.client_token));

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
    const { mineUtils, permitUtils, collectionUtils } = utils;
    let recordStatus = {};

    try {
      if (!mineUtils) {
        throw Error('processRecord - required mineUtils is null.');
      }

      if (!permitUtils) {
        throw Error('processRecord - required permitUtils is null.');
      }

      if (!collectionUtils) {
        throw Error('processRecord - required collectionUtils is null.');
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
        await this.updateMinePermit(permitUtils, existingRecord);
        savedRecord = await mineUtils.updateRecord(nrptiRecord, existingRecord);
      } else {   
        // Create the permits.
        const permitInfo = await this.createMinePermit(permitUtils, nrptiRecord);

        // Add permit info to the mine record.
        const recordWithPermits = mineUtils.addPermitToRecord(nrptiRecord, permitInfo);
        savedRecord = await mineUtils.createRecord(recordWithPermits);
        
        // Create a new collections if possible.
        await this.createCollections(collectionUtils, permitInfo.permit, savedRecord[0].object[0]);
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
    const url = getIntegrationUrl(CORE_API_HOST, `/api/mines/${nrptiRecord._sourceRefId}/permits`);
    const { records: permits } = await integrationUtils.getRecords(url, getAuthHeader(this.client_token));

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
   * Creates a new Mine Permit record and any associated collections.
   * 
   * @param {object} permitUtils Mine Permit utilities.
   * @param {*} nrptiRecord Transformed Core record.
   * @returns {object} Permit number and Permitee
   * @memberof CoreDataSource
   */
  async createMinePermit(permitUtils, nrptiRecord) {
    if (!permitUtils) {
      throw new Error('createMinePermit - permitUtils is required');
    }

    if (!nrptiRecord) {
      throw new Error('createMinePermit - nrptiRecord is required');
    }

    const permit = await this.getMinePermit(nrptiRecord);

    if (!permit) {
      throw new Error('createMinePermit - Cannot find valid permit');
    }

    // Transform the permit and amendments into single permits. Each document in an amendment will create a single permit.
    const transformedPermits = await permitUtils.transformRecord(permit, nrptiRecord);

    // To trigger flavour for this import.
    const preparedPermits = transformedPermits.map(amendment => ({ ...amendment, PermitBCMI: {} }))

    const promises = preparedPermits.map(permit => permitUtils.createRecord(permit));
    await Promise.all(promises);

    return {
      permitNumber: permit.permit_no,
      permittee: permit.current_permittee,
      permit
    }
  }

  /**
   * Updates the Mine Permit records.
   * 
   * @param {object} permitUtils Mine Permit utilities
   * @param {Mine} mineRecord Existing Mine record
   * @returns {boolean} Indication of success or not
   * @memberof CoreDataSource
   */
  async updateMinePermit(permitUtils, mineRecord) {
    // Get the updated Core permit.
    const permit = await this.getMinePermit(mineRecord);

    if (!permit || !permit.permit_amendments || !permit.permit_amendments.length) {
      throw new Error('updateMinePermit - Cannot find valid permit');
    }

    // Check how many documents exist on the current permit.
    const currentDocCount = permit.permit_amendments.reduce((acc, amendment) => acc + amendment.related_documents.length, 0);

    // Get the current permits for the mine.
    const currentPermits = await permitUtils.getMinePermits(mineRecord._sourceRefId);

    // If there are currently more documents than permits, locate the missing ones and create new permits for them.
    if (currentDocCount > currentPermits.length) {
      // Transform into permits.
      const transformedPermits = permitUtils.transformRecord(permit, mineRecord);

      // Find the new permits that need to be created.
      const newPermits = [];
      for (const transformedPermit of transformedPermits) {
        if (!currentPermits.some(current => current._sourceDocumentRefId === transformedPermit._sourceDocumentRefId)) {
          newPermits.push(transformedPermit);
        }
      }

      // To trigger flavour for this import.
      const preparedPermits = newPermits.map(amendment => ({ ...amendment, PermitBCMI: {} }))

      const promises = preparedPermits.map(permit => permitUtils.createRecord(permit));
      await Promise.all(promises);
    }
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
        const url = getIntegrationUrl(CORE_API_HOST, CORE_API_PATH_MINES, queryParams);
  
        // Get Core records
        const data = await integrationUtils.getRecords(url, getAuthHeader(this.client_token));
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
   * Adds lat/long details to each Core record.
   * 
   * @param {object[]} coreRecords Records from Core API that have not been transformed.
   * @returns {object[]} Records with details added.
   * @memberof CoreDataSource
   */
  async addMinesDetails(coreRecords) {
    const completeRecords = [];

    for (let i = 0; i < coreRecords.length; i++) {
      const mineDetailsPath = `${CORE_API_PATH_MINES}/${coreRecords[i].mine_guid}`;
      const mineDetailsUrl = getIntegrationUrl(CORE_API_HOST, mineDetailsPath);

      try {
        const mineDetails = await integrationUtils.getRecords(mineDetailsUrl, getAuthHeader(this.client_token));

        const latitude = mineDetails.mine_location && mineDetails.mine_location.latitude || 0.00;
        const longitude = mineDetails.mine_location && mineDetails.mine_location.longitude || 0.00;
  

        completeRecords.push({
          ...coreRecords[i],
          coordinates: [longitude, latitude],
        });
      } catch (error) {
        defaultLog.error(`addMineDetails - error getting details for Core record ${coreRecords[i].mine_guid}: ${error.message} ...skipping`);
      }
    }

    return completeRecords;
  }

  async createCollections(collectionUtils, permit, mineRecord) {
    if (!collectionUtils) {
      throw new Error('createCollections - param collectionUtils is null.');
    }

    if (!permit || !permit.permit_amendments || !permit.permit_amendments.length) {
      throw new Error('createCollections - param permit is null.');
    }

    if (!mineRecord) {
      throw new Error('createCollections - param mineRecord is null.');
    }

    // For each amendment find the existing documents and create a collection.
    for (const amendment of permit.permit_amendments) {
      const Permit = mongoose.model('Permit');
      const existingPermits = await Permit.find({ _schemaName: 'Permit', _sourceRefId: amendment.permit_amendment_guid });

      const collection = {
        _master: mineRecord._id,
        project: mineRecord._id,
        name: amendment.description,
        date: amendment.issue_date,
        type: amendment.permit_amendment_type_code === 'OGP' ? 'Permit' : 'Permit Amendment',
        agency: 'EMPR',
        records: (existingPermits && existingPermits.map(permit => permit._id)) || []
      }

      await collectionUtils.createRecord(collection);
    }
  }
}

module.exports = CoreDataSource;