'use strict';

let dbm;
let type;
let seed;

let ObjectID = require('mongodb').ObjectID;

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
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  try {
    let mClient = await db.connection.connect(db.connectionString, { native_parser: true });
    let nrptiCollection = mClient.collection('nrpti');
    console.log('Getting all records');
    const records = await nrptiCollection.find(
      {
        _schemaName: {
          $in: [
            'AdministrativePenalty',
            'AdministrativeSanction',
            'Agreement',
            'Certificate',
            'ConstructionPlan',
            'CourtConviction',
            'Inspection',
            'ManagementPlan',
            'Order',
            'Permit',
            'RestorativeJustice',
            'SelfReport',
            'Ticket',
            'Warning'
          ]
        }
      }
    ).toArray();
    let recordDocIds = [];
    for (let i = 0; i < records.length; i++) {
      if (records[i].documents && records[i].documents.length > 0) {
        for (let j = 0; j < records[i].documents.length; j++) {
          recordDocIds.push(ObjectID(records[i].documents[j]).toString());
        }
      }
    }

    console.log('Getting all documents');
    const documents = await nrptiCollection.find(
      {
        _schemaName: 'Document'
      }
    ).toArray();

    console.log('Finding orphaned documents');
    let orphanedDocIds = [];
    let s3Keys = [];
    for (let k = 0; k < documents.length; k++) {
      if (!recordDocIds.includes(ObjectID(documents[k]._id).toString())) {
        orphanedDocIds.push(ObjectID(documents[k]._id));
        if (documents[k].key) {
          s3Keys.push({ Key: documents[k].key });
        }
      }
    }

    console.log('Deleting S3 documents');
    let i, j, tempArray;
    // S3 can only delete 1000 docs at a time
    const chunk = 1000;
    if (s3Keys.length > 0) {
      for (i = 0, j = s3Keys.length; i < j; i += chunk) {
        tempArray = s3Keys.slice(i, i + chunk);
        try {
          await deleteS3Documents(tempArray);
        } catch (e) {
          console.log('Error removing s3 doc:', e);
        }
      }
    }

    console.log('Deleted', orphanedDocIds.length, 'orphaned document(s)');
    await nrptiCollection.deleteMany(
      {
        _id: {
          $in: orphanedDocIds
        }
      }
    );

    mClient.close();
  } catch (err) {
    console.log("Error deleting orphans: ", err);
    mClient.close();
  };
}


exports.down = function (db) {
  return null;
};

exports._meta = {
  "version": 1
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