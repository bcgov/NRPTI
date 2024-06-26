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

const CORE_API_HOST = process.env.CORE_API_HOST || 'https://minesdigitalservices.gov.bc.ca';
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

    try {
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
    } catch (error) {
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

      // Failed to find any core records
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
      throw error;
    }
  }

  /**
   * Gets all mine records. Calls multiple API endpoints and consolidates the results.
   *
   * @returns {Array<object>} Mine records with complete data
   * @memberof CoreDataSource
   */
  async getAllRecordData() {
    try {
      const verifiedMines = await this.getVerifiedMines();
      const minesWithDetails = await this.addMinesDetails(verifiedMines);

      return minesWithDetails;
    } catch (error) {
      defaultLog.error(`getAllRecordData - unexpected error: ${error.message}`);
      throw error;
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
      for (const record of coreRecords) {
        await this.processRecord(utils, commodityTypes, record);
      }
    } catch (error) {
      defaultLog.error(`processRecords - unexpected error: ${error.message}`);
      // Throwing this error will stop the processing. This will only occur if there is an issue
      // getting commodities. Single record processing errors silently and won't trigger this.
      throw error;
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
      let permitInfo = null;
      if (existingRecord) {
        // Update permit.
        permitInfo = await this.updateMinePermit(permitUtils, existingRecord);
        savedRecord = await mineUtils.updateRecord(nrptiRecord, permitInfo, existingRecord);
      } else {
        // Create the permits.
        permitInfo = await this.createMinePermit(permitUtils, nrptiRecord);

        // Add permit info to the mine record.
        const recordWithPermits = mineUtils.addPermitToRecord(nrptiRecord, permitInfo);
        savedRecord = await mineUtils.createItem(recordWithPermits);
      }

      if (!savedRecord) {
        throw Error('processRecord - savedRecord is null.');
      }
      if (!permitInfo) {
        throw Error('processRecord - permitInfo is null.');
      }

      // Create a new collections if possible.
      if (savedRecord._schemaName === 'MineBCMI') {
        await this.createorUpdateCollections(collectionUtils, permitUtils, permitInfo.permit, savedRecord);
      } else {
        if (!savedRecord.length > 0 || savedRecord[0].status !== 'success') {
          throw Error('processRecord - savedRecord is null.');
        }
        await this.createorUpdateCollections(collectionUtils, permitUtils, permitInfo.permit, savedRecord[0].object[0]);
      }

      this.status.itemsProcessed++;
      await this.taskAuditRecord.updateTaskRecord({ itemsProcessed: this.status.itemsProcessed });
    } catch (error) {
      recordStatus.coreId = coreRecord && coreRecord.mine_guid;
      recordStatus.error = error.message;

      // only add individual record status when an error occurs
      this.status.individualRecordStatus.push(recordStatus);
    }
  }

  /**
   * Gets all valid permits for a Core mine. A valid permit must meet the following criteria:
   *  - Must not be historical
   * .
   *
   * @param {object} nrptiRecord NRPTI record
   * @returns {object} Valid permit.
   * @memberof CoreDataSource
   */
  async getMinePermits(nrptiRecord) {
    if (!nrptiRecord) {
      throw Error('getMinePermits - required nrptiRecord is null.');
    }

    // Get permits with detailed information.
    const url = getIntegrationUrl(CORE_API_HOST, `/api/mines/${nrptiRecord._sourceRefId}/permits`);
    const { records: permits } = await integrationUtils.getRecords(url, getAuthHeader(this.client_token));

    return permits.filter(p => this.isValidPermit(p,nrptiRecord));
  }

  isValidPermit(permit,nrptiRecord){
    //Mine must not be historical which is indicated by an authorized year of '9999' on the latest amendment.
    if((permit.permit_amendments.length && !permit.permit_amendments[0].authorization_end_date) 
      || permit.permit_status_code === 'O'){

      // Do not use 'G-4-352' for Lumby
      // https://bcmines.atlassian.net/browse/NRPT-684
      if (nrptiRecord.name === 'Lumby Mine' && permit.permit_no === 'G-4-352') {
        return false;
      }
      return true;
    }
    return false;
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
  getValidPermit(permits) {
    // First, any mines with 'X' as their second character are considered exploratory. Remove them unless they are the only valid permits
    let nonExploratoryPermits = permits.filter(permit => permit.permit_no[1].toLowerCase() !== 'x');
    if(nonExploratoryPermits.length === 0){
      nonExploratoryPermits = permits;
    }


    // Second, mine must not be historical which is indicated by an authorized year of '9999' on the latest amendment.
    let validPermit;
    for (const permit of nonExploratoryPermits) {
      // Confirm that the most recent amendment is not historical, which is always the first index.
      // If 'null' then it is considered valid.
      // Otherwise, if the status is O, it's valid. (date 9999 check removed)

        // There should only be a single record. If there is more then we need to identify the most
        // recent permit as the official valid permit
        if (validPermit) {
          // we already have a valid permit. replace validPermit with whichever
          // permit is more recent and carry on.
          let validPermitNo;
          let proposedPermitNo;
          try {
            validPermitNo = validPermit.permit_no.split('-');
            proposedPermitNo = permit.permit_no.split('-');

            validPermit =
              Number.parseInt(validPermitNo[validPermitNo.length - 1]) >
                Number.parseInt(proposedPermitNo[proposedPermitNo.length - 1])
                ? validPermit
                : permit;
          } catch (error) {
            throw new Error(`Failed to parse permit numbers [ ${validPermitNo} / ${proposedPermitNo} ]`);
          }
        } else {
          validPermit = permit;
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

    const permits = await this.getMinePermits(nrptiRecord);
    const validPermit = this.getValidPermit(permits);

    if (!validPermit) {
      throw new Error('createMinePermit - Cannot find valid permit');
    }

    // Transform the permit and amendments into single permits. Each document in an amendment will create a single permit.
    let transformedPermits = [];
    for (const permit of permits) {
      transformedPermits = transformedPermits.concat(await permitUtils.transformRecord(permit, nrptiRecord));
    }

    // To trigger flavour for this import.
    const preparedPermits = transformedPermits.map(amendment => ({ ...amendment, PermitBCMI: {} }));

    const promises = preparedPermits.map(permit => permitUtils.createItem(permit));
    await Promise.all(promises);

    return {
      permitNumber: validPermit.permit_no,
      permittee: validPermit.current_permittee,
      validPermit
    };
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
    const permits = await this.getMinePermits(mineRecord);
    const validPermit = this.getValidPermit(permits);

    if (!validPermit || !validPermit.permit_amendments || !validPermit.permit_amendments.length) {
      throw new Error('updateMinePermit - Cannot find valid permit');
    }

    // Get the current permits for the mine.
    const currentPermits = await permitUtils.getCurrentMinePermits(mineRecord._sourceRefId);

    // Transform into permits.
    let transformedPermits = [];
    for (const permit of permits) {
      transformedPermits = transformedPermits.concat(await permitUtils.transformRecord(permit, mineRecord));
    }

    // Find the new permits that need to be created, otherwise update the permits if needed
    const newPermits = [];
    const updatePermits = [];
    for (const transformedPermit of transformedPermits) {
      if (!currentPermits.some(current => current._sourceDocumentRefId === transformedPermit._sourceDocumentRefId)) {
        newPermits.push(transformedPermit);
      } else {
        // NRPT-549 Update the permit if issued date has changed
        const existingPermit = currentPermits.find(
          current => current._sourceDocumentRefId === transformedPermit._sourceDocumentRefId
        );

        if (Date.parse(existingPermit.dateIssued) !== Date.parse(transformedPermit.dateIssued)) {
          updatePermits.push({ permitId: existingPermit._id, updateObj: { dateIssued: transformedPermit.dateIssued } });
        }
      }
    }

    // Determine if the collection should be published or not based on the mine status.
    let addPublic = false;
    if (mineRecord.read && mineRecord.read.includes('public')) {
      addPublic = true;
    }

    // To trigger flavour for this import.
    const preparedPermits = newPermits.map(amendment => ({
      ...amendment,
      PermitBCMI: {},
      addPublic: addPublic && 'public'
    }));

    const promises = preparedPermits.map(permit => permitUtils.createItem(permit));

    updatePermits.forEach(amendment => {
      promises.push(permitUtils.updateRecord(amendment.permitId, amendment.updateObj));
    });

    await Promise.all(promises);

    return {
      permitNumber: validPermit.permit_no,
      permittee: validPermit.current_permittee,
      validPermit
    };
  }

  /**
   * Gets all verified mines from Core.
   *
   * @returns {object[]} Verified Core mines.
   * @memberof CoreDataSource
   */
  async getVerifiedMines() {
    try {
      let currentPage = 1;
      let totalPages = 1;
      let mineRecords = [];

      // The Core API can not return all data in a single call. Must fetch data in batches.
      do {
        const queryParams = {
          per_page: CORE_API_BATCH_SIZE,
          page: currentPage,
          verified: true
        };
        const url = getIntegrationUrl(CORE_API_HOST, CORE_API_PATH_MINES, queryParams);

        // Get Core records
        const data = await integrationUtils.getRecords(url, getAuthHeader(this.client_token));
        // Get records from response and add to total.
        const newRecords = (data && data.mines) || [];
        mineRecords = [...mineRecords, ...newRecords];

        currentPage++;
        totalPages = data.total_pages;

        defaultLog.info(`Fetched page ${currentPage - 1} out of ${totalPages}`);
      } while (currentPage <= totalPages);

      // Only want mines that are not abandoned.
      const activeMines = mineRecords.filter(mine => {
        // If the mine is missing a status we still want to include it.
        if (!mine.mine_status || !mine.mine_status.length) {
          return true;
        }

        // If the mine's most recent status does not include 'Abandoned' then include it.
        if (mine.mine_status[0].status_values && !mine.mine_status[0].status_values.includes('ABN')) {
          return true;
        }

        return false;
      });

      return activeMines;
    } catch (error) {
      defaultLog.error(`getVerifiedMines - unexpected error: ${error.message}`);
      throw error;
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

        const latitude = (mineDetails.mine_location && mineDetails.mine_location.latitude) || 0.0;
        const longitude = (mineDetails.mine_location && mineDetails.mine_location.longitude) || 0.0;

        completeRecords.push({
          ...coreRecords[i],
          coordinates: [longitude, latitude]
        });
      } catch (error) {
        defaultLog.error(
          `addMineDetails - error getting details for Core record ${coreRecords[i].mine_guid}: ${error.message} ...skipping`
        );
      }
    }

    return completeRecords;
  }

  async createorUpdateCollections(collectionUtils,permitUtils, permit, mineRecord) {
    if (!collectionUtils) {
      throw new Error('createorUpdateCollections - param collectionUtils is null.');
    }

    if (!permit || !permit.permit_amendments || !permit.permit_amendments.length) {
      throw new Error('createorUpdateCollections - param permit is null.');
    }

    if (!mineRecord) {
      throw new Error('createorUpdateCollections - param mineRecord is null.');
    }

    // For each amendment find the existing documents and create a collection.
    for (const amendment of permit.permit_amendments) {
      const PermitBCMI = mongoose.model('PermitBCMI');
      const existingPermits = await PermitBCMI.find({
        _schemaName: 'PermitBCMI',
        _sourceRefId: amendment.permit_amendment_guid
      });

      const existingCollection = await collectionUtils.findExistingRecord(amendment.permit_amendment_guid);

      if (!existingCollection) {
        const collection = {
          _sourceRefCoreCollectionId: amendment.permit_amendment_guid,
          project: mineRecord._id,
          name: amendment.description !== null ? amendment.description : 'Permit Documents',
          date: amendment.issue_date ? new Date(amendment.issue_date) : null,
          type: permitUtils.getPermitType(amendment.permit_amendment_type_code),
          agency: 'AGENCY_EMLI',
          records: (existingPermits && existingPermits.map(permit => permit._id)) || []
        };

        // Determine if the collection should be published or not based on the mine status.
        if (mineRecord.read && mineRecord.read.includes('public')) {
          collection.addRole = 'public';
        }

        await collectionUtils.createItem(collection);
      } else {
        // NRPT-549 Update the collection if name, date and number of permits have changed
        if (
          existingCollection.name !== amendment.description ||
          Date.parse(existingCollection.date) !== Date.parse(amendment.issue_date) ||
          existingCollection.records.length != existingPermits.length ||
          existingCollection.type != permitUtils.getPermitType(amendment.permit_amendment_type_code)
        ) {
          const updateCollection = {
            _sourceRefCoreCollectionId: amendment.permit_amendment_guid,
            name: amendment.description,
            date: amendment.issue_date ? new Date(amendment.issue_date) : null,
            type: permitUtils.getPermitType(amendment.permit_amendment_type_code),
            records: (existingPermits && existingPermits.map(permit => permit._id)) || []
          };

          await collectionUtils.updateItem(updateCollection, existingCollection);
        }
      }
    }
  }
}

module.exports = CoreDataSource;
