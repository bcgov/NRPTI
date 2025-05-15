'use strict';
/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {};

exports.up = async function(db) {
  console.log('**** Adding app URLs ****');
  const mClient = await db.connection.connect(db.connectionString, { native_parser: true });

  try {
    const nrpti = await mClient.collection('nrpti');
    await nrpti.insertOne({
      _schemaName: 'ApplicationUrl',
      data: {
        bcmi: {
          dev: 'https://bcmi-f00029-dev.apps.silver.devops.gov.bc.ca',
          test: 'https://bcmi-f00029-test.apps.silver.devops.gov.bc.ca',
          prod: 'https://mines.nrs.gov.bc.ca'
        },
        nrced: {
          dev: 'https://nrced-f00029-test.apps.silver.devops.gov.bc.ca',
          test: 'https://nrced-f00029-test.apps.silver.devops.gov.bc.ca',
          prod: 'https://nrced.gov.bc.ca'
        },
        lng: {
          dev: 'https://lng-f00029-test.apps.silver.devops.gov.bc.ca',
          test: 'https://lng-f00029-test.apps.silver.devops.gov.bc.ca',
          prod: 'https://lng.gov.bc.ca'
        },
        nrpti: {
          dev: 'https://nrpti-f00029-dev.apps.silver.devops.gov.bc.ca',
          test: 'https://nrpti-f00029-test.apps.silver.devops.gov.bc.ca',
          prod: 'https://nrpti-f00029-prod.apps.silver.devops.gov.bc.ca'
        }
      }
    });
    console.log('**** Finished adding app URLs ****');
  } catch (error) {
    console.error(`Migration did not complete. Error processing records: ${error.message}`);
  }

  mClient.close();
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1
};
