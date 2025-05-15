'use strict';

let dbm;
let type;
let seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
}

exports.up = async function(db) {
  console.log('**** Updating mem-admin document permissions ****');
  const mClient = await db.connection.connect(db.connectionString, { native_parser: true });

  try {
    const nrpti = await mClient.collection('nrpti');
  
    const records = await nrpti.find({ sourceSystemRef: 'mem-admin' }).toArray();
    
    // Only care about records that have documents.
    const recordsWithDocs = records.filter(record => record.documents && record.documents.length);

    // Get all of the document IDs that need updating.
    const docIds = recordsWithDocs.reduce((accumulator, record) => {
      accumulator = [...accumulator, ...record.documents];
      return accumulator;
    }, []);
    
    // Add 'public' to the read permissions if it is not there.
    await nrpti.updateMany({ _id: { $in: docIds } }, {  $addToSet: { read: 'public' } });

    console.log('**** Finished updating records ****');
  } catch (error) {
    console.error(`Migration did not complete. Error processing records: ${error.message}`);
  }

  mClient.close();
}

exports.down = function(db) {
  return null;
}

exports._meta = {
  "version": 1
}
