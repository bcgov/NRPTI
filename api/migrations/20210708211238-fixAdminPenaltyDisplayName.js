'use strict';

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function (options, seedLink) { };

exports.up = async function (db) {
  console.log('**** Renaming BCOGC Administrative Penalty Display Names ****');

  const mClient = await db.connection.connect(db.connectionString, {
    native_parser: true
  });

  try {
    const nrpti = await mClient.collection('nrpti');

    await nrpti.updateMany(
      {
        $and: [
          { _schemaName: 'AdministrativePenalty' },
          { sourceSystemRef: 'bcogc' }
        ]
      },
      { $set: { recordType: 'Administrative Penalty' } }
    );

    console.log(`Finished renaming BCOGC Administrative Penalty Display Names`);
  } catch (err) {
    console.log(`Error renaming  BCOGC Administrative Penalty Display Names: ${err}`);
  } finally {
    mClient.close();
  }

  return null;
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  "version": 1
};
