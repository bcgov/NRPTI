'use strict';

const RECORD_TYPE = require('../src/utils/constants/record-type-enum');

let dbm;
let type;
let seed;

const roles = {
  ADMIN:       'sysadmin',
  ADMIN_NRCED: 'admin:nrced',
  ADMIN_LNG:   'admin:lng',
  ADMIN_BCMI:  'admin:bcmi'
};

const ALL_ROLES = [roles.ADMIN,
                   roles.ADMIN_NRCED,
                   roles.ADMIN_LNG,
                   roles.ADMIN_BCMI];

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  let mClient;

  try {
    mClient = await db.connection.connect(db.connectionString, { native_parser: true });
    const nrpti = mClient.collection('nrpti');

    // Master documents get all roles
    // flavour documents get their specific flavour, right now just lng and nrced

    console.log('-------------------------------');
    console.log('     Starting Role Updates');
    console.log('-------------------------------');
    console.log('\nAdding the following roles to MASTER WRITE: ' + ALL_ROLES);
    console.log('Adding the following roles to LNG WRITE:    ' + [roles.ADMIN, roles.ADMIN_LNG]);
    console.log('Adding the following roles to NRCED WRITE:  ' + [roles.ADMIN, roles.ADMIN_NRCED]);
    console.log('\nAdding the following roles to MASTER READ: ' + [roles.ADMIN_LNG, roles.ADMIN_NRCED, roles.ADMIN_BCMI]);
    console.log('Adding the following roles to LNG READ:    ' + [roles.ADMIN_LNG, roles.ADMIN_NRCED, roles.ADMIN_BCMI]);
    console.log('Adding the following roles to NRCED READ:  ' + [roles.ADMIN_LNG, roles.ADMIN_NRCED, roles.ADMIN_BCMI] + '\n');

    let updateResults = await documentUpdates(nrpti);

    let found = 0;
    let modified = 0;
    let failed = 0;

    updateResults.forEach(update => {
      found += update.result.n;
      modified += update.result.nModified;
      failed += update.result.ok !== 1 ? 1 : 0;
    });

    console.log(`\nQueried ${found} documents, updated ${modified}`);
    console.log(`${updateResults.length} queries executed, ${failed} failures.`);
  } catch(err) {
    console.log('\n// ###############################');
    console.error('// Error on Role Updates: ' + err);
    console.log('// ###############################\n');
  }

  console.log('\n-------------------------------');
  console.log('     Role Updates Complete');
  console.log('-------------------------------');

  mClient.close();
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};

async function documentUpdates(nrpti) {
  let promises = [];

  const masterUpdate = { $set: { write: ALL_ROLES }, $addToSet: { read: { $each: ALL_ROLES }}};
  const lngUpdate    = { $set: { write: [roles.ADMIN, roles.ADMIN_LNG] }, $addToSet: { read: { $each: ALL_ROLES }}};
  const nrcedUpdate  = { $set: { write: [roles.ADMIN, roles.ADMIN_NRCED] }, $addToSet: { read: { $each: ALL_ROLES }}};
  const options      = { "upsert": false };

  for(const recordType in RECORD_TYPE) {
    // master document update
    const masterQuery = { _schemaName: RECORD_TYPE[recordType]._schemaName };
    promises.push(updateMany(nrpti, masterQuery, masterUpdate, options));
    console.log(`Creating master/flavour queries for ${RECORD_TYPE[recordType].displayName}`);

    // Flavour update
    for(const flavour in RECORD_TYPE[recordType].flavours) {
      const flavourQuery = { _schemaName: RECORD_TYPE[recordType].flavours[flavour]._schemaName };

      if (flavour === 'lng') {
        promises.push(updateMany(nrpti, flavourQuery, lngUpdate, options));
      } else if (flavour === 'nrced') {
        promises.push(updateMany(nrpti, flavourQuery, nrcedUpdate, options));
      }
    }
  }

  return Promise.all(promises);
}

async function updateMany(collection, query, update, options) {
  return collection.updateMany(query, update, options);
}
