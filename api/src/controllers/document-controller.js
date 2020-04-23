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
    const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
    const collection = db.collection('nrpti');

    const documentReadRoles = [];
    if (await canDocumentBePublished(null, args.swagger.params.recordId.value)) {
      documentReadRoles.push('public');
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
          documentReadRoles
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
          documentReadRoles
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
        s3Response = await uploadS3Document(docResponse.key, args.swagger.params.upfile.value.buffer);
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
 * @param {*} [readRoles=[]] read roles to add to the document
 */
async function createDocument(fileName, addedBy, url = null, readRoles = []) {
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
  document.read = ['sysadmin', ...readRoles];
  document.write = ['sysadmin'];

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
 * Publish a document. Adds the `public` role to the documents root read array.
 *
 * @param {*} documentId
 * @param {*} auth_payload
 * @returns the published document
 */
async function publishDocument(documentId, auth_payload) {
  const Document = require('mongoose').model('Document');
  const documentRecord = await Document.findOne({ _id: documentId });
  if (!documentRecord) {
    defaultLog.info(`publishDocument - couldn't find document for documentId: ${documentId}`);
    throw {
      name: 'MissingDocumentError',
      message: `publishDocument - couldn't find document for documentId: ${documentId}`
    };
  }

  let published = await queryActions.publish(documentRecord);

  await queryUtils.recordAction(
    'Publish',
    documentRecord,
    auth_payload && auth_payload.displayName,
    documentRecord._id
  );

  return published;
}

exports.publishDocument = publishDocument;

/**
 * Unpublish a document. Removes the `public` role to the documents root read array.
 *
 * @param {*} documentId
 * @param {*} auth_payload
 * @returns the unpublished document
 */
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

exports.unpublishDocument = unpublishDocument;

/**
 * Determine if the document qualifies for publishing.
 *
 * The document does NOT qualify for publishing if all of the following are true:
 * - The record's model has an `issuedTo` sub-object
 * - The record's `issuedTo` sub-object is not published
 *
 * @param {*} [record=[]] the record that references this document.  If not provided, must provide `recordId` so that
 * the record can be fetched.
 * @param {*} [recordId=null] the record _id used to fetch the record.  If not provided, must provide `record`.
 */
const canDocumentBePublished = async function(record = null, recordId = null) {
  if (!record && !recordId) {
    // At least one of `record` or `recordId` must be provided
    return null;
  }

  if (!record) {
    // fetch record
    const collection = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev').collection('nrpti');
    record = await collection.findOne({ _id: new ObjectID(recordId) });
  }

  // check if document can be published
  if (
    !queryUtils.mongooseModelHasProperty(record._schemaName, 'issuedTo') ||
    queryActions.isPublished(record.issuedTo)
  ) {
    // The model does not have issuedTo or the model has issuedTo and issuedTo is published, therefore the document can
    // be published
    return true;
  }

  // The model has issuedTo and issuedTo is not published, therefore document cannot be published
  return false;
};

exports.canDocumentBePublished = canDocumentBePublished;
