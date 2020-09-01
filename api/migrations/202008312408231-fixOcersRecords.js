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
  console.log('**** Updating "ocers-csv" records published flags ****');
  const mClient = await db.connection.connect(db.connectionString, { native_parser: true });

  try {
    const nrpti = await mClient.collection('nrpti');
  
    // Get all ocers-csv records
    const records = await nrpti.find({ sourceSystemRef: 'ocers-csv' }).toArray();
  
    const promises = [];
    for (const record of records) {
      // Check if it is a flavour record. The 'ocers-csv' records only have a NRCED flavour.
      if (record._schemaName.includes('NRCED')) {
        promises.push(updateRecord(nrpti, record));
      }
    }
  
    await Promise.all(promises);
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

async function updateRecord(nrpti, record) {
  try {
    // Locate the master record.
    const masterRecord = await nrpti.findOne({ _flavourRecords: record._id });

    // Set the helper flag on the master record based on the flavour's published state.
    return nrpti.update({ _id: masterRecord._id }, { $set: { isNrcedPublished: record.read.includes('public') } });
  } catch (error) {
    console.error(`Error processing record ${record._id}: ${error.message}`);
    // Throw the error so that the promise resolves.
    throw error;
  }
}
