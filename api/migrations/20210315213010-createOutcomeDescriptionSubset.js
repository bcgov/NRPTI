'use strict';

let dbm;
let type;
let seed;

let outcomeDescriptionUpdate = require('../materialized_views/search/outcomeDescriptionSubset');
//let updateViews = require('../materialized_views/updateViews');

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

/**
 * Create subset 'outcome_description_subset', give it the index 'outcome-description-text-index'
 * Drop and recreate indexes for nrpti and redacted_record_subset collections to include outcomeDescription
 *
 * @param {*} db
 * @returns
 */
exports.up = async function(db) {
  const mClient = await db.connection.connect(db.connectionString, { native_parser: true });

  await outcomeDescriptionUpdate.update();

  try {
    await mClient.createCollection('outcome_description_subset');

    const outcomeCollection = mClient.collection('outcome_description_subset');
    await outcomeCollection.createIndex(
      {
        outcomeDescription: 'text'
      },
      {
        name: 'outcome-description-text-index'
      }
    );

    

    const nrptiCollection = mClient.collection('nrpti');

    nrptiCollection.dropIndex('keyword-search-text-index');

    await nrptiCollection.createIndex(
      {
        summary: 'text',
        location: 'text',
        'issuedTo.companyName': 'text',
        'issuedTo.firstName': 'text',
        'issuedTo.middleName': 'text',
        'issuedTo.lastName': 'text',
        'issuedTo.fullName': 'text',
        permitNumber: 'text',
        recordName: 'text',
        name: 'text',
        outcomeDescription: 'text'
      },
      {
        name: 'keyword-search-text-index'
      }
    );

    const redactedCollection = mClient.collection('redacted_record_subset');

    redactedCollection.dropIndex('keyword-search-text-index');

    await redactedCollection.createIndex(
      {
        summary: 'text',
        location: 'text',
        'issuedTo.companyName': 'text',
        'issuedTo.firstName': 'text',
        'issuedTo.middleName': 'text',
        'issuedTo.lastName': 'text',
        'issuedTo.fullName': 'text',
        recordName: 'text',
        outcomeDescription: 'text'
      },
      {
        name: 'keyword-search-text-index'
      }
    );
    
  } catch (err) {
    console.log('Error on index creation: ', err);
    mClient.close();

  } finally {
    mClient.close();
    console.log('**** Outcome description insertion complete. ****');
  }
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1
};
