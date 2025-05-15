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
};

exports.up = async function(db) {
  const mClient = await db.connection.connect(db.connectionString, { native_parser: true })
  try {
    const nrptiCollection = await mClient.collection('nrpti');

    console.log('Updating All Task Read Arrays to Include All Admin Roles.');

    await nrptiCollection.updateMany(
      { "_schemaName" : "Task" },
      {$set:  { "read" : [ "sysadmin", "admin:lng", "admin:nrced", "admin:bcmi" ] }}
    );

    console.log('Updating All Document Read and Write Arrays to Include All Admin Roles.');

    await nrptiCollection.updateMany({ "_schemaName" : "Document" },
      {$addToSet:
        {
          "read" :  { $each: ["sysadmin", "admin:lng", "admin:nrced", "admin:bcmi"] } ,
          "write": { $each: ["sysadmin", "admin:lng", "admin:nrced", "admin:bcmi"] }
        }
      }
    );

    mClient.close()
  } catch (e) {
    console.log('Error:', e)
    mClient.close()
  }
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
