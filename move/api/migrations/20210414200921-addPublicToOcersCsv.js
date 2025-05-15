'use strict';

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {};

exports.up = async function(db) {
  console.log('**** Update OCERS-CSV Issued To ****');

  const mClient = await db.connection.connect(db.connectionString, {
    native_parser: true
  });

  try {
    const nrpti = await mClient.collection('nrpti');

    // Added public to ocers-csv records where the individual names are not empty
    const result = await nrpti.updateMany(
      {
        sourceSystemRef: 'ocers-csv',
        'issuedTo.type': 'Individual',
        $or: [
          { 'issuedTo.firstName': { $ne: '' } },
          { 'issuedTo.lastName': { $ne: '' } },
          { 'issuedTo.middleName': { $ne: '' } }
        ]
      },
      {
        $addToSet: { 'issuedTo.read': 'public' }
      }
    );

    console.log(`Finished updating ${result.modifiedCount} OCERS-CSV Issued To`);
  } catch (err) {
    console.log(`Error updating OCERS-CSV Issued To: ${err}`);
  } finally {
    mClient.close();
  }

  return null;
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1
};
