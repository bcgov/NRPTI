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

/**
 * This migration finds duplicate NRIS importer records and remove the duplicates.
 * It will also update the _flavourRecords array properly for those records with improperly
 * set _flavourRecords array.
 *
 * These duplicates were created by a bug in the NRIS importer.  The bug was fixed but the data
 * issues remained.
 */
exports.up = async function(db) {
  console.log('**** Removing duplicate NRIS records ****');

  const mClient = await db.connection.connect(db.connectionString, {
    native_parser: true
  });

  try {
    const nrpti = await mClient.collection('nrpti');

    // Get all NRIS Importer records that have duplicates
    const duplicates = await nrpti
      .aggregate([
        {
          $match: {
            _schemaName: 'Inspection',
            sourceSystemRef: 'nris-epd'
          }
        },
        {
          $group: {
            _id: '$_sourceRefNrisId',
            count: {
              $sum: 1
            }
          }
        },
        {
          $match: {
            count: {
              $gte: 2
            }
          }
        },
        {
          $lookup: {
            from: 'nrpti',
            let: {
              ref_id: '$_id'
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: ['$_sourceRefNrisId', '$$ref_id']
                      },
                      {
                        $eq: ['$_schemaName', 'Inspection']
                      }
                    ]
                  }
                }
              }
            ],
            as: 'records'
          }
        },
        {
          $project: {
            'records._id': 1,
            'records.documents': 1
          }
        }
      ])
      .toArray();

    for (const pair of duplicates) {
      // recordA is generally the record in the duplicate pair that we want to keep.
      //
      // recordB is generally the duplicate we want to remove.  This is because they were created
      // later and come second in the find results.
      const recordA = pair.records[0];
      const recordB = pair.records[1];

      // Remove S3 docs
      const recordBDocs = await nrpti.find({ _id: { $in: recordB.documents } }).toArray();
      const s3DocsToRemove = recordBDocs
        .filter(doc => doc.key)
        .map(doc => {
          return { Key: doc.key };
        });

      if (s3DocsToRemove.length > 0) {
        await deleteS3Documents(s3DocsToRemove);
      }

      // Need to find flavours this way because the _flavourRecords are not set
      // properly on the master
      const recordAFlavours = await nrpti.find({ _master: recordA._id }).toArray();
      const recordBFlavours = await nrpti.find({ _master: recordB._id }).toArray();

      // Delete duplicate flavours and documents
      await nrpti.deleteMany({ _id: { $in: recordBFlavours.map(flavour => flavour._id) } });
      await nrpti.deleteMany({ _id: { $in: recordB.documents } });

      // Delete duplicate master
      await nrpti.deleteOne({ _id: recordB._id });

      // Set non-duplicate master _flavourRecords properly
      await nrpti.updateOne(
        { _id: recordA._id },
        { $set: { _flavourRecords: recordAFlavours.map(flavour => flavour._id) } }
      );
    }

    console.log(`Finished de-duplicating ${duplicates.length} pairs of NRIS records`);
  } catch (err) {
    console.log(`Error de-duplicating records: ${err}`);
  } finally {
    mClient.close();
  }

  return null;
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1
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
