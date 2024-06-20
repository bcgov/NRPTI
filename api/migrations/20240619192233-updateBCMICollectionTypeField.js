'use strict';

var dbm;
var type;
var seed;

/**
 * Update the 'type' of CollectionBCMI entries
 * Checks each permit in the 'record' array for its typeCode
 * Assigns the type to the Collection based on the permit's typeCode, with ALG having priority
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
    const permits = await nrpti.find({ _schemaName: 'PermitBCMI' }).toArray();

    let count = 0;

    collections.forEach(async collection => {
      let typeCode = '';
      // Go through each record attached to each collection
      // For each record, check the typeCode
      const oldType = collection.type;
      for (const recordId of collection.records) {
        const record = permits.find(permit => permit._id.toString() == recordId.toString());
        // ALG takes precedence, so don't overwrite
        if (record && record.typeCode && typeCode != record.typeCode && typeCode != 'ALG') {
          typeCode = record.typeCode;
        }
      }
      if (typeCode) {
        switch (typeCode) {
          case 'OGP':
            collection.type = 'Permit';
            break;
          case 'ALG':
            collection.type = 'Amalgamated Permit';
            break;
          default:
            collection.type = 'Permit Amendment';
        }
        if (oldType != collection.type) {
          count += 1;
          await nrpti.update({ _id: collection._id }, { $set: collection });
        }
      }
    });

    console.log('**** Finished updating ' + count + ' bcmi collection types ****');
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
