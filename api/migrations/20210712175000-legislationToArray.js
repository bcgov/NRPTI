'use strict';

const RecordTypeEnum = require('../src/utils/constants/misc');


/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) { };

exports.up = async function (db) {
  console.log('**** Transfer legislation field on all records to array ****');

  const mClient = await db.connection.connect(db.connectionString, {
    native_parser: true
  });

  const recordSchemas = [
    ...RecordTypeEnum.MASTER_SCHEMA_NAMES,
    ...RecordTypeEnum.LNG_SCHEMA_NAMES,
    ...RecordTypeEnum.NRCED_SCHEMA_NAMES,
    ...RecordTypeEnum.BCMI_SCHEMA_NAMES
  ];

  try {
    // update the nrpti collection
    const nrpti = await mClient.collection('nrpti');
    const allRecordsNrpti = await nrpti.find({ _schemaName: { $in: recordSchemas } }).toArray();

    let numUpdatedNrpti = 0;
    let promisesNrpti = [];

    allRecordsNrpti.forEach(record => {
      if (record.legislation && !Array.isArray(record.legislation)) {
        let newLegislation = [record.legislation];

        if (record.legislationDescription) {
          newLegislation[0].legislationDescription = record.legislationDescription;
        }

        if (record.offence) {
          newLegislation[0].offence = record.offence;
        }

        promisesNrpti.push(nrpti.updateOne(
          {
            _id: record._id
          },
          {
            $set: { legislation: newLegislation },
            $unset: {
              offence: '',
              legislationDescription: ''
            }
          }
        ));
      }
    });

    let resultArrayNrpti = await Promise.all(promisesNrpti);
    resultArrayNrpti.forEach(result => {
      if (result.modifiedCount > 0) {
        numUpdatedNrpti++;
      }
    });

    console.log(`Finished transferring ${numUpdatedNrpti} records legislation fields in NRPTI `);


    // update the redacted record subset collection
    const redacted_record_subset = await mClient.collection('redacted_record_subset');
    const allRecordsRRS = await redacted_record_subset.find({ _schemaName: { $in: recordSchemas } }).toArray();

    let numUpdatedRRS = 0;
    let promisesRRS = [];

    allRecordsRRS.forEach(record => {
      if (record.legislation && !Array.isArray(record.legislation)) {
        let newLegislation = [record.legislation];

        if (record.legislationDescription) {
          newLegislation[0].legislationDescription = record.legislationDescription;
        }

        if (record.offence) {
          newLegislation[0].offence = record.offence;
        }

        promisesRRS.push(redacted_record_subset.updateOne(
          {
            _id: record._id
          },
          {
            $set: { legislation: newLegislation },
            $unset: {
              offence: '',
              legislationDescription: ''
            }
          }
        ));
      }
    });

    let resultArrayRRS = await Promise.all(promisesRRS)
    resultArrayRRS.forEach(result => {
      if (result && result.modifiedCount) {
        numUpdatedRRS++;
      }
    });

    console.log(`Finished transferring ${numUpdatedRRS} records legislation fields in the redacted record subset `);

  } catch (err) {
    console.log(`Error transferring records legislation fields to arrays: ${err}`);
  } finally {
    mClient.close();
  }

  return null;
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1
};
