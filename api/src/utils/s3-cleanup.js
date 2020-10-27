'use strict';

const AWS = require('aws-sdk');

const AWS_BULK_LIMIT = 1000;
const OBJ_STORE_URL = process.env.OBJECT_STORE_endpoint_url || 'nrs.objectstore.gov.bc.ca';
const OBJECT_STORE_BUCKET = process.env.OBJECT_STORE_bucket_name || 'uploads';
const ep = new AWS.Endpoint(OBJ_STORE_URL);
const s3 = new AWS.S3({
  endpoint: ep,
  accessKeyId: process.env.OBJECT_STORE_user_account,
  secretAccessKey: process.env.OBJECT_STORE_password,
  signatureVersion: 'v4',
  s3ForcePathStyle: true
});

/**
 * Recursively list all S3 documents
 *
 * @param {string} marker Specifies the key to start with when listing objects in a bucket.
 * @returns array of S3 document metadata.
 */
async function listS3Objects(marker = null) {
  let contents = [];

  try {
    const result = await s3.listObjects({ Bucket: OBJECT_STORE_BUCKET, Marker: marker }).promise();

    if (result.Contents && result.Contents.length) {
      contents = contents.concat(result.Contents);

      // Grab the next chunk if there are more results
      if (result.IsTruncated) {
        // NRS S3 isn't returning NextMarker, so manually retrieve last key in the array
        const nextMarker = result.Contents[result.Contents.length - 1].Key;

        const nextContents = await listS3Objects(nextMarker);
        contents = contents.concat(nextContents);
      }
    }

    return contents;
  } catch (err) {
    console.log(`Error list S3 documents at marker [${marker}]`);
  }
}

/**
 * Find all document keys in MongoDB
 *
 * @returns array of document keys.
 */
async function getDbDocs() {
  const mongodb = require('../utils/mongodb');

  // Wait for mongodb helper to create connection
  while (!mongodb.connection) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti');

  try {
    const nrpti = db.collection('nrpti');

    // Find all Documents where key is not null
    const result = await nrpti.find({ _schemaName: 'Document', key: { $ne: null } }, { key: 1, _id: -1 }).toArray();

    return result.map(item => item.key);
  } catch (err) {
    console.log(`Error encountered while retrieving database documents - ${err}`);

    return [];
  } finally {
    db.close();
  }
}

/**
 * Retrieve list of S3 documents and MongoDB document keys.  Find all S3 document keys that do
 * not exist within MongoDB.  Proceeds to delete if dryRun is set to false.
 *
 * @param {boolean} dryRun Controls if it should proceed to delete or only list the files
 * @returns
 */
async function run(dryRun) {
  const s3Contents = await listS3Objects();
  const dbKeys = await getDbDocs();

  if (dbKeys.length === 0) console.log('No database documents loaded.  Something probably went wrong, stopping here.');

  if (s3Contents.length === 0) console.log('No S3 documents loaded.  Something probably went wrong, stopping here.');

  const s3Keys = s3Contents.map(item => item.Key);
  const toDelete = s3Keys.filter(item => !dbKeys.includes(item));

  if (toDelete.length) {
    console.log(`\n\nThe following ${toDelete.length} documents have no references in the database:\n`);
    toDelete.forEach(item => console.log(item));
    console.log(`\nTotal: ${toDelete.length}`);

    if (!dryRun) {
      console.log(`\nProceeding to delete`);

      for (let i = 0; i < toDelete.length; i += AWS_BULK_LIMIT) {
        let chunk = toDelete.slice(i, i + AWS_BULK_LIMIT);

        console.log(
          `Deleting ${i + 1} - ${Math.min(i + AWS_BULK_LIMIT, toDelete.length)} out of ${toDelete.length}...`
        );
        await deleteS3Objects(chunk);
      }

      console.log('Done');
    }
  }

  console.log('\nThere are no orphan objects in S3.');
}

/**
 * Delete up to 1000 objects from S3.  S3 will only accept up to 1000 keys in a single call
 *
 * @param {boolean} objectKeys S3 object keys to delete.
 * @returns
 */
function deleteS3Objects(objectKeys) {
  const params = { Bucket: OBJECT_STORE_BUCKET, Delete: { Objects: [] } };
  params.Delete.Objects = objectKeys.map(item => ({ Key: item }));

  return s3.deleteObjects(params).promise();
}

/**
 * Print the help and usage information
 *
 * @returns
 */
function printHelp() {
  console.log('S3 file cleanup script.\n');
  console.log(
    'This script will compare database doocument records against S3 objects to delete orphaned S3 objects.\n\n'
  );

  console.log('Available commands:\n');
  console.log('\ts3-cleanup.js --help\t Print this message');
  console.log('\ts3-cleanup.js --dry-run\t Get a list of S3 objects to be deleted without proceeding');
  console.log('\ts3-cleanup.js --confirm\t Get a list of S3 objects to be deleted and proceed');

  console.log('\n\nRequired environment variables:\n');
  console.log('\tOBJECT_STORE_endpoint_url\t S3 host, e.g. nrs.objectstore.gov.bc.ca');
  console.log('\tOBJECT_STORE_bucket_name\t S3 bucket name, e.g. uploads');
  console.log('\tOBJECT_STORE_user_account\t S3 Access Key ID or username');
  console.log('\tOBJECT_STORE_password\t\t S3 Secret Access Key or password');
  console.log('\tMONGODB_SERVICE_HOST\t\t MongoDB hostname. Default: localhost');
  console.log('\tMONGODB_DATABASE\t\t MongoDB database name.  Default: nrpti');
  console.log("\tMONGODB_USERNAME\t\t MongoDB username. Default ''");
  console.log("\tMONGODB_PASSWORD\t\t MongoDB password. Default ''");
}

if (process.argv.length === 2) {
  printHelp();
} else {
  if (process.argv.includes('--dry-run')) {
    run(true);
  } else if (process.argv.includes('--confirm')) {
    run(false);
  } else {
    printHelp();
  }
}
