'use strict';

const RecordTypeEnum = require('../src/utils/constants/misc');
const ObjectId =  require('mongoose').Types.ObjectId;

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
}

exports.up = async function(db) {
  console.log('#############################################################');
  console.log('## Updating records with flipped latitude/longitude values ##');
  console.log('#############################################################');

  const mClient = await db.connection.connect(db.connectionString, { native_parser: true });

  const schemas = [...RecordTypeEnum.MASTER_SCHEMA_NAMES,
                   ...RecordTypeEnum.LNG_SCHEMA_NAMES,
                   ...RecordTypeEnum.NRCED_SCHEMA_NAMES,
                   ...RecordTypeEnum.BCMI_SCHEMA_NAMES];

  try {
    const nrpti = await mClient.collection('nrpti');

    let flippedCount = 0;
    const records = await nrpti.find({ _schemaName: { $in: schemas } }).toArray();

    for(const record of records) {
      if(Object.prototype.hasOwnProperty.call(record, 'centroid') &&
         record.centroid &&
         record.centroid.length === 2 &&
         record.centroid[1] < -90) {
        record.centroid.reverse();
        nrpti.update({ _id: new ObjectId(record._id) }, { $set: { centroid: record.centroid }});
        flippedCount++;
      }
    }

    console.log(`Processed ${records.length} records and flipped coords for ${flippedCount}`);
  } catch (err) {
    console.error(' Error updating centroids: ', err);
  }

  console.log('####################################');
  console.log('##       Updates complete!        ##');
  console.log('####################################');

  mClient.close();
}

exports.down = function(db) {
  return null;
}

exports._meta = {
  "version": 1
}
