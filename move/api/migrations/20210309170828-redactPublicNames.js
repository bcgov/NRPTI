'use strict';

let dbm;
let type;
let seed;

const RecordTypeEnum = require('../src/utils/constants/misc');


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

  const mClient = await db.connection.connect(db.connectionString, {
    native_parser: true
  });

  try {

    console.log('**** Started redacting individuals names ****');

    const nrpti = await mClient.collection('nrpti');

    const recordSchemas = [
      ...RecordTypeEnum.MASTER_SCHEMA_NAMES,
      ...RecordTypeEnum.LNG_SCHEMA_NAMES,
      ...RecordTypeEnum.NRCED_SCHEMA_NAMES,
      ...RecordTypeEnum.BCMI_SCHEMA_NAMES
    ];

    const authorizedPublishAgencies = RecordTypeEnum.AUTHORIZED_PUBLISH_AGENCIES;

    const allRecords = await nrpti
    .find({
      _schemaName: { $in: recordSchemas },
    })
    .toArray();

    const promises = allRecords.map(async (record) => {

      if ( record.issuingAgency
        && !authorizedPublishAgencies.includes(record.issuingAgency)
        && record.issuedTo
        && record.issuedTo.type === 'Individual'
        && record.issuedTo.read.includes('public') )
      {

        let newReadArray = [];
        record.issuedTo.read.forEach(role => {
          if (role !== 'public') {
            newReadArray.push(role);
          }
        });

        let redactedIssuedTo = record.issuedTo;
        redactedIssuedTo.read = newReadArray;

        return await nrpti.updateOne(
          { _id: record._id },
          { $set: { issuedTo: redactedIssuedTo }}
        );
      }
    });

    await Promise.all(promises);

    console.log('**** Finished redacting individuals names ****');

  } catch (error) {
    console.error(`Migration did not complete. Error processing: ${error.message}`);
  } finally {
    mClient.close();
  }

  return null;
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
