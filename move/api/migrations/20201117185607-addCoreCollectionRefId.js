"use strict";

let dbm;
let type;
let seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

/**
 * The purpose of this migration is to set the _sourceRefCoreCollectionId value for CORE
 * collections that already exist in the database.  We can do this by using PermitBCMI
 * records that were create by the CORE importer because these records have the original
 * permit_amendment_guid (as _sourceRefId) and have reference to the collections.
 */
exports.up = async function (db) {
  console.log("**** Adding CORE Collection Ref Id to BCMI Collections ****");

  const mClient = await db.connection.connect(db.connectionString, {
    native_parser: true,
  });

  try {
    const nrpti = await mClient.collection("nrpti");

    // Get all PermitBCMI records that are imported from CORE and have collectionId
    const corePermitRecords = await nrpti
      .find({
        _schemaName: "PermitBCMI",
        sourceSystemRef: "core",
        collectionId: { $ne: null },
      })
      .toArray();

    // There will be some duplicate updates but should be fine for an one time update...
    const promises = corePermitRecords.map(async (permit) => {
      return await nrpti.updateOne(
        { _id: permit.collectionId },
        { $set: { _sourceRefCoreCollectionId: permit._sourceRefId } }
      );
    });

    await Promise.all(promises);

    console.log("Finished updating collections");
  } catch (err) {
    console.log(`Error updating CORE Collection Ref Id: ${err}`);
  } finally {
    mClient.close();
  }

  return null;
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
