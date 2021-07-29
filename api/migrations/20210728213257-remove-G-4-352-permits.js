'use strict';

const AWS = require('aws-sdk');

const OBJ_STORE_URL = process.env.OBJECT_STORE_endpoint_url || 'nrs.objectstore.gov.bc.ca';
const ep = new AWS.Endpoint(OBJ_STORE_URL);
const s3 = new AWS.S3({
  endpoint: ep,
  accessKeyId: process.env.OBJECT_STORE_user_account,
  secretAccessKey: process.env.OBJECT_STORE_password,
  signatureVersion: 'v4',
  s3ForcePathStyle: true
});

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {};

exports.up = async function(db) {
  const mClient = await db.connection.connect(db.connectionString, {
    native_parser: true
  });

  try {
    console.log(`Removing G-4-352 permits`);

    // Only need nrpti collection because these records aren't published
    const nrpti = await mClient.collection('nrpti');

    let dbRecordsToDelete = [];

    const records = await nrpti
      .find({ mineGuid: '6bac3584-ab40-41fb-992a-31cc1e92a9ae', permitNumber: 'G-4-352' })
      .toArray();

    dbRecordsToDelete = records.map(record => record._id);

    const documents = await nrpti
      .find({
        _id: {
          // Flatten record documents array
          $in: [].concat.apply(
            [],
            records.map(record => record.documents)
          )
        }
      })
      .toArray();

    dbRecordsToDelete = dbRecordsToDelete.concat(documents.map(document => document._id));

    await deleteS3Documents(
      documents.map(document => {
        return {
          Key: document.key
        };
      })
    );

    await nrpti.deleteMany({ _id: { $in: dbRecordsToDelete } });

    console.log(`Finished removing G-4-352 permits`);
  } catch (err) {
    console.log(`Error removing G-4-352 permits: ${err}`);
  } finally {
    mClient.close();
  }

  return null;
};

async function deleteS3Documents(s3Keys) {
  if (!process.env.OBJECT_STORE_bucket_name) {
    throw new Error('Missing required OBJECT_STORE_bucket_name env variable');
  }

  if (!s3Keys) {
    throw new Error('Missing required s3Key param');
  }

  let params = {
    Bucket: process.env.OBJECT_STORE_bucket_name,
    Delete: {
      Objects: s3Keys
    }
  };

  return s3.deleteObjects(params).promise();
}

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1
};
