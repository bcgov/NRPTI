'use strict';

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

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
  const mClient = await db.connection.connect(db.connectionString, { native_parser: true });

  try {
    console.log('Starting fix for NRIS records...');

    const nrpti = await mClient.collection('nrpti');

    // Get all records that have been created from an NRIS import.
    const records = await nrpti.find({ sourceSystemRef: 'nris-epd' }).toArray();

    for (const record of records) {
      if (!record.recordName){
        console.log(`Record ${record._id} is missing recordName`);
        continue;
      }

      // The record name contains the assessment ID at the end.
      // It is in the format 'Inspection - {record name} - {assessment ID}'
      const lastDash =  record.recordName.lastIndexOf('-');

      if (!lastDash){
        console.log(`Record ${record._id} has a different recordName format`);
        continue;
      }

      // There is always a space after the last dash.
      const assessmentId = record.recordName.substring(lastDash + 2);

      if (!assessmentId){
        console.log(`Cannot find assessment ID for record ${record._id}`);
        continue;
      }

      await nrpti.update({ _id: new ObjectId(record._id) }, { $set: { _sourceRefNrisId: parseInt(assessmentId) }});
    }

  } catch (err) {
    console.log('Error:', err);
  }

  console.log('Done.');
  mClient.close()
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
