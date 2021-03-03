'use strict';

const { ApplicationRoles } = require('./../src/utils/constants/misc');

const CSV_SOURCE_DEFAULT_ROLES = [
  { source: 'coors-csv', role: ApplicationRoles.ADMIN_FLNRO },
  { source: 'era-csv', role: ApplicationRoles.ADMIN_FLNR_NRO },
  { source: 'nris-flnr-csv', role: ApplicationRoles.ADMIN_FLNR_NRO },
  { source: 'agri-cmdb-csv', role: ApplicationRoles.ADMIN_AGRI },
  { source: 'agri-mis-csv', role: ApplicationRoles.ADMIN_AGRI },
  { source: 'alc-csv', role: ApplicationRoles.ADMIN_ALC }
];

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {};

exports.up = async function(db) {
  console.log('**** Updating CSV Import records permissions ****');

  const mClient = await db.connection.connect(db.connectionString, {
    native_parser: true
  });

  try {
    const nrpti = await mClient.collection('nrpti');

    await nrpti.updateMany(
      {
        sourceSystemRef: 'agri-mis'
      },
      { $set: { sourceSystemRef: 'agri-mis-csv' } }
    );

    await nrpti.updateMany(
      {
        sourceSystemRef: 'agri-cmdb'
      },
      { $set: { sourceSystemRef: 'agri-cmdb-csv' } }
    );

    await nrpti.updateMany(
      {
        sourceSystemRef: 'nro-inspections-csv'
      },
      { $set: { sourceSystemRef: 'nris-flnr-csv' } }
    );

    for (const csvRole of CSV_SOURCE_DEFAULT_ROLES) {
      await nrpti.updateMany(
        {
          sourceSystemRef: csvRole.source
        },
        {
          $addToSet: {
            read: csvRole.role,
            write: csvRole.role,
            ['issuedTo.read']: csvRole.role,
            ['issuedTo.write']: csvRole.role
          }
        }
      );
    }

    console.log(`Finished updating CSV Import records permissions`);
  } catch (err) {
    console.log(`Error updating CSV Import records permissions: ${err}`);
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
