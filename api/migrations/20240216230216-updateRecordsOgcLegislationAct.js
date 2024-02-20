'use strict';

const newOgcLegislationAct = 'Energy Resource Activities Act';
const oldOgcLegislationAct = 'Oil and Gas Activities Act';

var dbm;
var type;
var seed;
let recordCount = 0;

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
  console.log('**** Adding Issuing Agency to historical NRCED records ****');
  const mClient = await db.connection.connect(db.connectionString, { native_parser: true });

  try {
    const nrpti = await mClient.collection('nrpti');

    const ocersRecords = await nrpti.find({ sourceSystemRef: 'ocers-csv' }).toArray();

    for (const record of ocersRecords) {
      if(record.legislation.act == oldOgcLegislationAct){
        recordCount += 1;
        await updateRecord(nrpti, record._id);
      }
    }
  } catch (error) {
    console.log('Error on migration: ', error);
    mClient.close();
  } finally {
    console.log(
      `**** OGC Legislative Act update migration complete, ${recordCount} records updated. *****`
    );
    mClient.close();
  }

  async function updateRecord(db, record_id) {
    try {
      await db.updateOne(
        { _id: record_id },
        {
          $set: {
            legislation: [
              {
                act: newOgcLegislationAct
              }
            ]
          }
        }
      );
    } catch (error) {
      console.log('Migration error: ', error);
    }
  }
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1
};
