'use strict';
const ObjectID = require('mongodb').ObjectID;
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
 * This aggregation searches for all nris-epd documents without a period
 * in the S3 object key.
 */
const aggregation = [
  {
    $match: {
      _schemaName: 'Inspection',
      sourceSystemRef: 'nris-epd'
    }
  },
  {
    $lookup: {
      from: 'nrpti',
      localField: 'documents',
      foreignField: '_id',
      as: 'docLookup'
    }
  },
  {
    $unwind: {
      path: '$docLookup'
    }
  },
  {
    $replaceRoot: {
      newRoot: '$docLookup'
    }
  },
  {
    $match: {
      // Find filenames without a period
      key: { $in: [/^((?!\.).)*$/] }
    }
  },
  {
    $project: {
      url: 1,
      key: 1,
      fileName: 1,
      read: 1
    }
  }
];

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {};


/**
 * This migration works by finding all nrid-epd documents with incorrect file extensions.
 * Then it will create a copy of the existing S3 objects using the correct filenames,
 * update the DB record values and then delete the old S3 objects.
 */
exports.up = async function(db) {
  const mClient = await db.connection.connect(db.connectionString, {
    native_parser: true
  });

  const errors = [];

  try {
    console.log(`Fixing NRIS document filenames`);

    const nrpti = await mClient.collection('nrpti');
    const redacted_record_subset = await mClient.collection('redacted_record_subset');

    const nrptiRecords = await nrpti.aggregate(aggregation).toArray();
    const redactedRecords = await redacted_record_subset.aggregate(aggregation).toArray();

    for (const record of nrptiRecords) {
      try {
        const newKey = record.key.insert(record.key.length - 3, '.');
        const newUrl = record.url.insert(record.url.length - 3, '.');
        const newFilename = record.fileName.insert(record.fileName.length - 3, '.');

        if (record.read && record.read.includes('public')) {
          await renameS3Object(record.key, newKey, true);
        } else {
          await renameS3Object(record.key, newKey, false);
        }

        await updateRecord(nrpti, record._id, newKey, newUrl, newFilename);

        // Also fix redacted record subset
        if (redactedRecords.find(redacted => redacted._id.toString() === record._id.toString())) {
          await updateRecord(redacted_record_subset, record._id, newKey, newUrl, newFilename);
        }

        // Delete the old object with incorrect filename since there is no native rename or move command
        await deleteS3Object(record.key);

        console.log(`Fixed ${newKey}`);
      } catch (err) {
        const msg = `Failed to update document ${record._id}. ${err}`;
        console.log(msg);
        errors.push(msg);
      }
    }

    // Dump all errors at the end if there are any
    if (errors.length) {
      for (const error of errors) {
        console.log(error);
      }
    }

    console.log(`Finished fixing NRIS document filenames`);
  } catch (err) {
    console.log(`Error fixing NRIS document filenames: ${err}`);
  } finally {
    mClient.close();
  }

  return null;
};

String.prototype.insert = function(index, string) {
  if (index > 0) {
    return this.substring(0, index) + string + this.substr(index);
  }

  return string + this;
};

async function updateRecord(collection, id, newKey, newUrl, newFilename) {
  return collection.updateOne(
    { _id: new ObjectID(id) },
    {
      $set: {
        key: newKey,
        url: newUrl,
        fileName: newFilename
      }
    }
  );
}

async function renameS3Object(sourceKey, newKey, isPublic) {
  if (!process.env.OBJECT_STORE_bucket_name) {
    throw new Error('Missing required OBJECT_STORE_bucket_name env variable');
  }

  try {
    await s3.headObject({ Bucket: process.env.OBJECT_STORE_bucket_name, Key: sourceKey }).promise();
  } catch (err) {
    throw new Error(`Source key not found in S3 ${sourceKey}`);
  }

  await s3
    .copyObject({
      Bucket: process.env.OBJECT_STORE_bucket_name,
      CopySource: `${process.env.OBJECT_STORE_bucket_name}/${sourceKey}`,
      Key: newKey
    })
    .promise();

  if (isPublic) {
    await s3.putObjectAcl({ Bucket: process.env.OBJECT_STORE_bucket_name, Key: newKey, ACL: 'public-read' }).promise();
  }
}

async function deleteS3Object(key) {
  return s3.deleteObject({ Bucket: process.env.OBJECT_STORE_bucket_name, Key: key }).promise();
}

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1
};
