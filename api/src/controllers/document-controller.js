const mongoose = require('mongoose');
const AWS = require('aws-sdk');
const ObjectID = require('mongodb').ObjectID;

const queryActions = require('../utils/query-actions');
const queryUtils = require('../utils/query-utils');
const businessLogicManager = require('../utils/business-logic-manager');
const mongodb = require('../utils/mongodb');
const defaultLog = require('../utils/logger')('record');

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

exports.protectedPost = async function(args, res, next) { // Confirm user has correct role.
  if (
    args.swagger.params.fileName &&
    args.swagger.params.fileName.value &&
    args.swagger.params.recordId &&
    args.swagger.params.recordId.value
  ) {
    const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
    const collection = db.collection('nrpti');

    // fetch master record
    const masterRecord = await collection.findOne({ _id: new ObjectID(args.swagger.params.recordId.value), write: { $in: args.swagger.params.auth_payload.realm_access.roles } });

    // Set mongo document and s3 document roles
    const readRoles = [];
    let s3ACLRole = null;
    if (!businessLogicManager.isDocumentConsideredAnonymous(masterRecord)) {
      readRoles.push('public');
      s3ACLRole = 'public-read';
    }

    let docResponse = null;
    let s3Response = null;
    if (args.swagger.params.url && args.swagger.params.url.value) {
      // If the document already has a url we can assume it's a link
      try {
        docResponse = await createURLDocument(
          args.swagger.params.fileName.value,
          (args.swagger.params.auth_payload && args.swagger.params.auth_payload.preferred_username) || '',
          args.swagger.params.url.value,
          readRoles
        );

        queryUtils.audit(args, 'POST', JSON.stringify(docResponse), args.swagger.params.auth_payload, docResponse._id);
      } catch (e) {
        defaultLog.info(`Error creating URL document - fileName: ${args.swagger.params.fileName.value}, Error: ${e}`);
        return queryActions.sendResponse(
          res,
          400,
          `Error creating document for ${args.swagger.params.fileName.value}.`
        );
      }
    } else if (args.swagger.params.upfile && args.swagger.params.upfile.value) {
      // Create document meta and upload file to S3
      try {
        ({ docResponse, s3Response } = await createS3Document(
          args.swagger.params.fileName.value,
          args.swagger.params.upfile.value.buffer,
          (args.swagger.params.auth_payload && args.swagger.params.auth_payload.preferred_username) || '',
          readRoles,
          s3ACLRole
        ));

        queryUtils.audit(args, 'POST', JSON.stringify(s3Response), args.swagger.params.auth_payload, docResponse._id);
      } catch (e) {
        defaultLog.info(`Error creating S3 document - fileName: ${args.swagger.params.fileName.value}, Error ${e}`);
        return queryActions.sendResponse(
          res,
          400,
          `Error creating document for ${args.swagger.params.fileName.value}.`
        );
      }
    }

    // Now we must update the associated record.
    let recordResponse = null;
    try {
      // add to master record
      recordResponse = await collection.findOneAndUpdate(
        { _id: new ObjectID(args.swagger.params.recordId.value), write: { $in: args.swagger.params.auth_payload.realm_access.roles } },
        { $addToSet: { documents: new ObjectID(docResponse._id) } },
        { new: true }
      );

      queryUtils.audit(args, 'Doc Record Update', JSON.stringify(recordResponse), args.swagger.params.auth_payload, recordResponse.key);
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
            { _id: new ObjectID(id), write: { $in: args.swagger.params.auth_payload.realm_access.roles } },
            { $addToSet: { documents: new ObjectID(docResponse._id) } },
            { new: true }
          )
        );

        queryUtils.audit(args, 'Update Flavour', null, args.swagger.params.auth_payload, id);
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

    queryActions.sendResponse(res, 200, {
      document: docResponse,
      record: recordResponse,
      flavours: flavourRecordResponses,
      s3: s3Response
    });
  } else {
    defaultLog.info('Error: You must provide fileName and recordId.');
    queryActions.sendResponse(res, 400, 'You must provide fileName and recordId.');
  }
  next();
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
      docResponse = await Document.findOneAndRemove({ _id: new ObjectID(args.swagger.params.docId.value), write: { $in: args.swagger.params.auth_payload.realm_access.roles } });
      queryUtils.audit(args, 'DELETE', JSON.stringify(docResponse), args.swagger.params.auth_payload, docResponse._id);
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
        queryUtils.audit(args, 'DELETE', JSON.stringify(s3DeleteResult), args.swagger.params.auth_payload, docResponse.key);

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
        { _id: new ObjectID(args.swagger.params.recordId.value), write: { $in: args.swagger.params.auth_payload.realm_access.roles } },
        { $pull: { documents: new ObjectID(docResponse._id) } },
        { new: true }
      );
      queryUtils.audit(args, 'Doc Record Update', JSON.stringify(recordResponse), args.swagger.params.auth_payload, recordResponse.key);
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
            { _id: new ObjectID(id), write: { $in: args.swagger.params.auth_payload.realm_access.roles } },
            { $pull: { documents: new ObjectID(docResponse._id) } },
            { new: true }
          )
        );
        queryUtils.audit(args, 'Flavour Update', null, args.swagger.params.auth_payload, id);
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

    queryActions.sendResponse(res, 200, {
      document: docResponse,
      record: recordResponse,
      flavours: flavourRecordResponses,
      s3: s3Response
    });
  } else {
    defaultLog.info('Error: You must provide docId and recordId');
    queryActions.sendResponse(res, 400, { error: 'You must provide docId and recordId' });
  }
  next();
};

/**
 * Create a new Document record for a URL (no file to upload).
 *
 * @param {*} fileName document file name
 * @param {*} addedBy name of the user that added the document
 * @param {*} [url=null] url of the document
 * @param {*} [readRoles=[]] read roles to add to the document. (optional)
 */
async function createURLDocument(fileName, addedBy, url, readRoles = []) {
  const Document = mongoose.model('Document');
  let document = new Document();

  document.fileName = fileName;
  document.addedBy = addedBy;
  document.url = url;
  document.read = ['sysadmin', ...readRoles];
  document.write = ['sysadmin'];

  return document.save();
}

exports.createURLDocument = createURLDocument;

/**
 * Create a new Document record AND upload the associated file to S3, adding the S3 key to the mongo record.
 *
 * @param {*} fileName document file name
 * @param {*} fileContent document data
 * @param {*} addedBy name of the user that added the document
 * @param {*} [readRoles=[]] read roles to add to the document. (optional)
 * @param {*} [s3ACLRole=null] the ACL role to set.  Defaults to `authenticated-read` if not set. (optional)
 * @returns
 */
async function createS3Document(fileName, fileContent, addedBy, readRoles = [], s3ACLRole = null) {
  const Document = mongoose.model('Document');
  let document = new Document();

  const s3Key = `${document._id}/${fileName}`;

  document.fileName = fileName;
  document.addedBy = addedBy;
  document.url = `https://${process.env.OBJECT_STORE_endpoint_url}/${process.env.OBJECT_STORE_bucket_name}/${document._id}/${fileName}`;
  document.key = s3Key;
  document.read = ['sysadmin', ...readRoles];
  document.write = ['sysadmin'];

  const s3Response = await uploadS3Document(s3Key, fileContent, s3ACLRole);

  const docResponse = await document.save();

  return { docResponse, s3Response };
}

exports.createS3Document = createS3Document;

/**
 * Delete a document from S3
 *
 * @param {*} s3Key
 * @returns
 */
async function deleteS3Document(s3Key) {
  if (!process.env.OBJECT_STORE_bucket_name) {
    throw new Error('Missing required OBJECT_STORE_bucket_name env variable');
  }

  if (!s3Key) {
    throw new Error('Missing required s3Key param');
  }

  return s3.deleteObject({ Bucket: process.env.OBJECT_STORE_bucket_name, Key: s3Key }).promise();
}

exports.deleteS3Document = deleteS3Document;

/**
 * Upload a document to s3.
 *
 * @param {*} s3Key s3 document key
 * @param {*} fileContent document data
 * @param {*} [s3ACLRole=null] the ACL role to set.  Defaults to `authenticated-read` if not set. (optional)
 * @returns
 */
async function uploadS3Document(s3Key, fileContent, s3ACLRole = null) {
  if (!process.env.OBJECT_STORE_bucket_name) {
    throw new Error('Missing required OBJECT_STORE_bucket_name env variable');
  }

  if (!s3Key) {
    throw new Error('Missing required s3Key param');
  }

  if (!fileContent) {
    throw new Error('Missing required s3Key param');
  }

  return s3
    .upload({
      Bucket: process.env.OBJECT_STORE_bucket_name,
      Key: s3Key,
      Body: fileContent,
      ACL: s3ACLRole || 'authenticated-read'
    })
    .promise();
}

exports.uploadS3Document = uploadS3Document;

/**
 * Set the s3 document ACL to `public-read`
 *
 * @param {*} s3Key s3 document key
 * @returns
 */
async function publishS3Document(s3Key) {
  return s3
    .putObjectAcl({
      Bucket: process.env.OBJECT_STORE_bucket_name,
      Key: s3Key,
      ACL: 'public-read'
    })
    .promise();
}

exports.publishS3Document = publishS3Document;

/**
 * Set the s3 document ACL to `authenticated-read`
 *
 * @param {*} s3Key s3 document key
 * @returns
 */
async function unpublishS3Document(s3Key) {
  return s3
    .putObjectAcl({
      Bucket: process.env.OBJECT_STORE_bucket_name,
      Key: s3Key,
      ACL: 'authenticated-read'
    })
    .promise();
}

exports.unpublishS3Document = unpublishS3Document;

/**
 * Publish a document. Removes the `public` role to the documents root read array.
 *
 * @param {*} docId
 * @param {*} auth_payload
 * @returns the published document
 */
async function publishDocument(docId, auth_payload) {
  if (!docId) {
    defaultLog.info('publishDocument - Missing required docId param');
    return null;
  }

  const Document = require('mongoose').model('Document');
  const document = await Document.findOne({ _id: new ObjectID(docId), write: { $in: auth_payload.realm_access.roles } });

  if (!document) {
    defaultLog.info(`publishDocument - couldn't find document for docId: ${docId}`);
  }

  const published = await queryActions.publish(document);

  queryUtils.recordAction('Publish', document, auth_payload, document._id);

  return published;
}

exports.publishDocument = publishDocument;

/**
 * Unpublish a document. Removes the `public` role to the documents root read array.
 *
 * @param {*} docId
 * @param {*} auth_payload
 * @returns the unpublished document
 */
async function unpublishDocument(docId, auth_payload) {
  if (!docId) {
    defaultLog.info('unpublishDocument - Missing required docId param');
    return null;
  }

  const Document = require('mongoose').model('Document');
  const document = await Document.findOne({ _id: new ObjectID(docId), write: { $in: auth_payload.realm_access.roles } });

  if (!document) {
    defaultLog.info(`unpublishDocument - couldn't find document for docId: ${docId}`);
  }

  const unpublished = await queryActions.unPublish(document);

  queryUtils.recordAction('Unpublish', document, auth_payload, document._id);

  return unpublished;
}

exports.unpublishDocument = unpublishDocument;

/**
 * Swagger route handler to get an s3 signed url.
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.protectedGetS3SignedURL = async function(args, res, next) {
  if (!args.swagger.params.docId || !args.swagger.params.docId.value) {
    defaultLog.warn('protectedGet - missing required docId param');
    return queryActions.sendResponse(res, 400, 'Missing required docId param');
  }

  const Document = mongoose.model('Document');
  const document = await Document.findOne({ _id: new ObjectID(args.swagger.params.docId.value), write: { $in: args.swagger.params.auth_payload.realm_access.roles } });

  if (!document) {
    defaultLog.info(`protectedGetS3SignedURL - couldn't find document for docId: ${args.swagger.params.docId.value}`);
    return queryActions.sendResponse(res, 404, {});
  }

  if (!document.key) {
    defaultLog.info(`protectedGetS3SignedURL - not an S3 document: ${args.swagger.params.docId.value}`);
    return queryActions.sendResponse(res, 409, {});
  }

  const signedUrl = await getS3SignedURL(document.key);

  return queryActions.sendResponse(res, 200, signedUrl);
};

/**
 * Get an s3 signed url.
 *
 * @param {*} s3Key
 * @returns
 */
async function getS3SignedURL(s3Key) {
  return s3.getSignedUrl('getObject', {
    Bucket: process.env.OBJECT_STORE_bucket_name,
    Key: s3Key,
    Expires: 300000 // 5 minutes
  });
}

exports.getS3SignedURL = getS3SignedURL;
