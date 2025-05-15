'use strict';

let dbm;
let recordCount = 0;
let collectionCount = 0;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
};

exports.up = async function(db) {
  console.log('**** Updating records and collections issuing agency EMPR references to be EMLI ****');
  console.log('---------------------------');
  const mClient = await db.connection.connect(db.connectionString, { native_parser: true });

  try {
    console.log('**** Updating records issuing agency EMPR references to be EMLI ****');

    const nrpti = await mClient.collection('nrpti');

    const emprRecords = await nrpti.find({ issuingAgency: 'EMPR' }).toArray();

    emprRecords.forEach( async record => {
      recordCount += 1;
      record.issuingAgency = "EMLI"
      await nrpti.update({ _id: record._id }, { $set: record });
    });

    console.log('**** Finished updating ' + recordCount + ' records issuing agencies from EMPR to EMLI ****');
  } catch (error) {
    console.error(`Migration did not complete. Error processing records: ${error.message}`);
  }
  console.log('---------------------------');

  try {

    console.log('**** Updating collections agency EMPR references to be EMLI ****');

    const nrpti = await mClient.collection('nrpti');

    const emprCollections = await nrpti.find({ agency: 'EMPR' }).toArray();

    emprCollections.forEach( async collection => {
      collectionCount += 1;
      collection.agency = "EMLI"
      await nrpti.update({ _id: collection._id }, { $set: collection });
    });

    console.log('**** Finished updating ' + collectionCount + ' collections agencies from EMPR to EMLI ****');
  } catch (error) {
    console.error(`Migration did not complete. Error processing collections: ${error.message}`);
  }

  console.log('---------------------------');
  console.log('**** Finished updating ' + recordCount + ' records and ' + collectionCount + ' collections agencies from EMPR to EMLI ****');

  mClient.close();
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
