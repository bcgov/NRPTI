const mongoose = require('mongoose');
const queryActions = require('../utils/query-actions');
const queryUtils = require('../utils/query-utils');
const AWS = require('aws-sdk');
const mongodb = require('../utils/mongodb');
const ObjectID = require('mongodb').ObjectID;
let defaultLog = require('../utils/logger')('record');

const OBJ_STORE_URL = process.env.OBJECT_STORE_endpoint_url || 'nrs.objectstore.gov.bc.ca';
const ep = new AWS.Endpoint(OBJ_STORE_URL);
const s3 = new AWS.S3({
  endpoint: ep,
  accessKeyId: process.env.OBJECT_STORE_user_account,
  secretAccessKey: process.env.OBJECT_STORE_password,
  signatureVersion: 'v4',
  s3ForcePathStyle: true
});

exports.protectedOptions = function(args, res, next) {
  res.status(200).send();
};

exports.protectedPost = async function(args, res, next) {
  if (
    args.swagger.params.fileName &&
    args.swagger.params.fileName.value &&
    args.swagger.params.recordId &&
    args.swagger.params.recordId.value
  ) {
    // Determine if the record is anonymous, and therefore the document must not be publicly available.
    let isAnonymous = false;
    const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
    const collection = db.collection('nrpti');
    const masterRecord = await collection.findOne({ _id: new ObjectID(args.swagger.params.recordId.value) });
    if (Object.prototype.hasOwnProperty.call(mongoose.model(masterRecord._schemaName).schema.obj, 'issuedTo')) {
      // Only check for anonymity if the master schema has entity information.  Otherwise assume not anonymous.
      isAnonymous = queryUtils.isRecordAnonymous(masterRecord);
    }

    let docResponse = null;
    let s3Response = null;
    if (args.swagger.params.url && args.swagger.params.url.value) {
      // If the document already has a url we can assume it's a link
      // An unpublished document will not have url in it's meta.
      // A published document will have a direct url to the S3 object store.
      // Unpublished documents will require a presigned get to the S3 object store.
      try {
        docResponse = await createDocument(
          args.swagger.params.fileName.value,
          (args.swagger.params.auth_payload && args.swagger.params.auth_payload.preferred_username) || '',
          args.swagger.params.url.value,
          isAnonymous
        );
      } catch (e) {
        defaultLog.info(`Error creating document meta for ${args.swagger.params.fileName.value}: ${e}`);
        return queryActions.sendResponse(
          res,
          400,
          `Error creating document meta for ${args.swagger.params.fileName.value}.`
        );
      }
    } else if (args.swagger.params.upfile && args.swagger.params.upfile.value) {
      // Upload to S3
      try {
        docResponse = await createDocument(
          args.swagger.params.fileName.value,
          (args.swagger.params.auth_payload && args.swagger.params.auth_payload.preferred_username) || '',
          null,
          isAnonymous
        );
      } catch (e) {
        defaultLog.info(`Error creating document meta for ${args.swagger.params.fileName.value}: ${e}`);
        return queryActions.sendResponse(
          res,
          400,
          `Error creating document meta for ${args.swagger.params.fileName.value}.`
        );
      }

      // TODO: ACL is set to public-read until we know publishing rules.
      try {
        const s3UploadResult = await uploadS3Document(docResponse.key, args.swagger.params.upfile.value.buffer);

        s3Response = s3UploadResult;
      } catch (e) {
        defaultLog.info(`Error uploading ${args.swagger.params.fileName.value} to S3: ${e}`);
        return queryActions.sendResponse(res, 400, `Error uploading ${args.swagger.params.fileName.value} to S3.`);
      }
    }

    // Now we must update the associated record.
    let recordResponse = null;
    try {
      // add to master record
      recordResponse = await collection.findOneAndUpdate(
        { _id: new ObjectID(args.swagger.params.recordId.value) },
        { $addToSet: { documents: new ObjectID(docResponse._id) } },
        { new: true }
      );
    } catch (e) {
      defaultLog.info(
        `Error adding ${args.swagger.params.fileName.value} to record ${args.swagger.params.recordId.value}: ${e}`
      );
      return queryActions.sendResponse(
        res,
        400,
        `Error adding ${args.swagger.params.fileName.value} to record ${args.swagger.params.recordId.value}.`
      );
    }

    // Add to flavour records
    let observables = [];
    if (recordResponse && recordResponse.value && recordResponse.value._flavourRecords) {
      recordResponse.value._flavourRecords.forEach(id => {
        observables.push(
          collection.findOneAndUpdate(
            { _id: new ObjectID(id) },
            { $addToSet: { documents: new ObjectID(docResponse._id) } },
            { new: true }
          )
        );
      });
    }
    const flavourRecordResponses = await Promise.all(observables).catch(e => {
      defaultLog.info(`Error adding ${args.swagger.params.fileName.value} to flavour record: ${e}`);
      return queryActions.sendResponse(
        res,
        400,
        `Error adding ${args.swagger.params.fileName.value} to flavour record.`
      );
    });

    return queryActions.sendResponse(res, 200, {
      document: docResponse,
      record: recordResponse,
      flavours: flavourRecordResponses,
      s3: s3Response
    });
  } else {
    defaultLog.info('Error: You must provide fileName and recordId.');
    return queryActions.sendResponse(res, 400, 'You must provide fileName and recordId.');
  }
};

exports.protectedDelete = async function(args, res, next) {
  if (
    args.swagger.params.docId &&
    args.swagger.params.docId.value &&
    args.swagger.params.recordId &&
    args.swagger.params.recordId.value
  ) {
    // First we want to delete the document.
    const Document = mongoose.model('Document');
    let docResponse = null;
    let s3Response = null;
    try {
      docResponse = await Document.findOneAndRemove({ _id: new ObjectID(args.swagger.params.docId.value) });
    } catch (e) {
      defaultLog.info(`Error removing document meta ${args.swagger.params.docId.value} from the database: ${e}`);
      return queryActions.sendResponse(
        res,
        400,
        `Error removing document meta ${args.swagger.params.docId.value} from the database.`
      );
    }

    // If a key exists, then the doc is stored in S3.
    // We need to delete this document.
    if (docResponse.key) {
      try {
        const s3DeleteResult = await deleteS3Document(docResponse.key);

        s3Response = s3DeleteResult;
      } catch (e) {
        defaultLog.info(`Error deleting document ${args.swagger.params.docId.value} from S3: ${e}`);
        return queryActions.sendResponse(
          res,
          400,
          `Error deleting document ${args.swagger.params.docId.value} from S3.`
        );
      }
    }

    const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
    const collection = db.collection('nrpti');

    // Then we want to remove the document's id from the record it's attached to.
    let recordResponse = null;
    try {
      // remove from master record
      recordResponse = await collection.findOneAndUpdate(
        { _id: new ObjectID(args.swagger.params.recordId.value) },
        { $pull: { documents: new ObjectID(docResponse._id) } },
        { new: true }
      );
    } catch (e) {
      defaultLog.info(
        `Error removing ${args.swagger.params.docId.value} from record ${args.swagger.params.recordId.value}: ${e}`
      );
      return queryActions.sendResponse(
        res,
        400,
        `Error removing ${args.swagger.params.docId.value} from record ${args.swagger.params.recordId.value}.f`
      );
    }

    // remove from flavour records
    let observables = [];
    if (recordResponse && recordResponse.value && recordResponse.value._flavourRecords) {
      recordResponse.value._flavourRecords.forEach(id => {
        observables.push(
          collection.findOneAndUpdate(
            { _id: new ObjectID(id) },
            { $pull: { documents: new ObjectID(docResponse._id) } },
            { new: true }
          )
        );
      });
    }
    const flavourRecordResponses = await Promise.all(observables).catch(e => {
      defaultLog.info(`Error removing ${args.swagger.params.docId.value} from flavour record: ${e}`);
      return queryActions.sendResponse(
        res,
        400,
        `Error removing ${args.swagger.params.docId.value} from flavour record.`
      );
    });

    return queryActions.sendResponse(res, 200, {
      document: docResponse,
      record: recordResponse,
      flavours: flavourRecordResponses,
      s3: s3Response
    });
  } else {
    defaultLog.info('Error: You must provide docId and recordId');
    return queryActions.sendResponse(res, 400, { error: 'You must provide docId and recordId' });
  }
};

exports.createDocument = createDocument;

/**
 * Create a new Document mongo record.
 *
 * @param {*} fileName document file name
 * @param {*} addedBy name of the user that added the document
 * @param {*} [url=null] url of the document, if it is a link (optional)
 * @param {*} [isAnonymous=true] true if the document is anonymous (not public), false otherwise.
 *   See query-utils -> isRecordAnonymous() for anonymity business logic
 */
async function createDocument(fileName, addedBy, url = null, isAnonymous = true) {
  const Document = mongoose.model('Document');
  let document = new Document();

  // TODO: url is automatically populated making all docs public.
  // We will need to change this once publish rules are in.
  if (!url) {
    url = `https://${process.env.OBJECT_STORE_endpoint_url}/${process.env.OBJECT_STORE_bucket_name}/${document._id}/${fileName}`;
  }

  document.fileName = fileName;
  document.addedBy = addedBy;
  document.url = url;
  document.key = `${document._id}/${fileName}`;
  document.read = ['sysadmin'];
  document.write = ['sysadmin'];

  if (!isAnonymous) {
    document.read.push('public');
  }

  return await document.save();
}

exports.deleteS3Document = deleteS3Document;

async function deleteS3Document(docKey) {
  return await s3.deleteObject({ Bucket: process.env.OBJECT_STORE_bucket_name, Key: docKey }).promise();
}

exports.uploadS3Document = uploadS3Document;

async function uploadS3Document(docKey, docBody) {
  // TODO: ACL is set to public-read until we know publishing rules.
  return await s3
    .upload({
      Bucket: process.env.OBJECT_STORE_bucket_name,
      Key: docKey,
      Body: docBody,
      ACL: 'public-read'
    })
    .promise();
}

/**
 * Publish a document.
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 */
exports.protectedPublish = async function(args, res, next) {
  if (!args.swagger.params.recordId || !args.swagger.params.recordId.value) {
    return queryActions.sendResponse(res, 400, 'MIssing required recordId param');
  }

  if (!args.swagger.params.documentId || !args.swagger.params.documentId.value) {
    return queryActions.sendResponse(res, 400, 'MIssing required documentId param');
  }

  defaultLog.info(`protectedPublish - documentId: ${args.swagger.params.documentId}`);

  try {
    const published = await publishDocument(
      args.swagger.params.recordId.value,
      args.swagger.params.documentId.value,
      args.swagger.params.auth_payload
    );

    return queryActions.sendResponse(res, 200, published);
  } catch (error) {
    if (error.name === 'MissingDocumentError') {
      return queryActions.sendResponse(res, 404, error);
    }

    return queryActions.sendResponse(res, 500, error);
  }
};

exports.publishDocument = publishDocument;

async function publishDocument(recordId, documentId, auth_payload) {
  const Document = require('mongoose').model('Document');
  const documentRecord = await Document.findOne({ _id: documentId });
  if (!documentRecord) {
    defaultLog.info(`publishDocument - couldn't find document for documentId: ${documentId}`);
    throw {
      name: 'MissingDocumentError',
      message: `publishDocument - couldn't find document for documentId: ${documentId}`
    };
  }

  const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
  const collection = db.collection('nrpti');
  const masterRecord = await collection.findOne({ _id: new ObjectID(recordId) });

  let published = null;

  if (!queryUtils.isRecordAnonymous(masterRecord)) {
    published = await queryActions.publish(documentRecord);

    await queryUtils.recordAction(
      'Publish',
      documentRecord,
      auth_payload && auth_payload.displayName,
      documentRecord._id
    );
  }

  return published;
}

/**
 * Unpublish a document.
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 */
exports.protectedUnpublish = async function(args, res, next) {
  if (!args.swagger.params.documentId || !args.swagger.params.documentId.value) {
    return queryActions.sendResponse(res, 400, 'MIssing required documentId param');
  }

  defaultLog.info(`unpublishDocument - documentId: ${args.swagger.params.documentId}`);

  try {
    const unpublished = unpublishDocument(args.swagger.params.documentId.value);

    return queryActions.sendResponse(res, 200, unpublished);
  } catch (error) {
    if (error.name === 'MissingDocumentError') {
      return queryActions.sendResponse(res, 404, error);
    }

    return queryActions.sendResponse(res, 500, error);
  }
};

exports.unpublishDocument = unpublishDocument;

async function unpublishDocument(documentId, auth_payload) {
  const Document = require('mongoose').model('Document');
  const documentRecord = await Document.findOne({ _id: documentId });

  if (!documentRecord) {
    defaultLog.info(`unpublishDocument - couldn't find document for documentId: ${documentId}`);
    throw {
      name: 'MissingDocumentError',
      message: `unpublishDocument - couldn't find document for documentId: ${documentId}`
    };
  }

  const unpublished = await queryActions.unPublish(documentRecord);

  await queryUtils.recordAction(
    'Unpublish',
    documentRecord,
    auth_payload && auth_payload.displayName,
    documentRecord._id
  );

  return unpublished;
}
