'use strict';

var dbm;
var type;
var seed;

/**
 * Update the 'type' of CollectionBCMI entries
 * Checks each permit in the 'record' array if it has a status and if that status is ALG
 * Updates the 'type' of the collection to 'Amalgamated Permit' if the above is true.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function(db) {
  console.log('**** Updating bcmi collections type ****');
  const mClient = await db.connection.connect(db.connectionString, { native_parser: true });

  try {
    const nrpti = await mClient.collection('nrpti');

    const collections = await nrpti.find({ _schemaName: 'CollectionBCMI' }).toArray();
    const permits = await nrpti.find({ _schemaName: { $in: ['Permit', 'PermitBCMI'] } }).toArray();

    let count = 0;

    collections.forEach(async collection => {
      const oldType = collection.type;
      for (const recordId of collection.records) {
        const record = permits.find(permit => permit._id.toString() == recordId.toString());
        if (record && record.status && record.status == 'ALG') {
          collection.type = 'Amalgamated Permit';
        }
        if (oldType != collection.type) {
          count += 1;
          await nrpti.update({ _id: collection._id }, { $set: collection });
        }
      }
    });

    console.log('**** Finished updating ' + count + ' bcmi collection types to Amalgamated Permit ****');
  } catch (error) {
    console.error(`Migration did not complete. Error processing collections: ${error.message}`);
  }

  mClient.close();
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1
};
