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
    // Set mongo document and s3 document roles based on `addRole` param, if present
    let s3ACLRole = null;
    const documentReadRoles = [];
    if (args.swagger.params.addRole && args.swagger.params.addRole.value === 'public') {
      documentReadRoles.push('public');
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
          documentReadRoles
        );
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
          documentReadRoles,
          s3ACLRole
        ));
      } catch (e) {
        defaultLog.info(`Error creating S3 document - fileName: ${args.swagger.params.fileName.value}, Error ${e}`);
        return queryActions.sendResponse(
          res,
          400,
          `Error creating document for ${args.swagger.params.fileName.value}.`
        );
      }
    }

    const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
    const collection = db.collection('nrpti');

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

/**
 * Create a new Document mongo record.
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

  return await document.save();
}

exports.createURLDocument = createURLDocument;

/**
 * Create a new Document mongo record AND upload the associated file to S3, adding the S3 key to the mongo record.
 *
 * @param {*} fileName document file name
 * @param {*} fileContent document data
 * @param {*} addedBy name of the user that added the document
 * @param {*} [readRoles=[]] read roles to add to the document. (optional)
 * @param {*} [aclRole=null] the ACL role to set.  Defaults to `authenticated-read` if not set. (optional)
 * @returns
 */
async function createS3Document(fileName, fileContent, addedBy, readRoles = [], aclRole = null) {
  const Document = mongoose.model('Document');
  let document = new Document();

  document.fileName = fileName;
  document.addedBy = addedBy;
  document.url = `https://${process.env.OBJECT_STORE_endpoint_url}/${process.env.OBJECT_STORE_bucket_name}/${document._id}/${fileName}`;
  document.key = `${document._id}/${fileName}`;
  document.read = ['sysadmin', ...readRoles];
  document.write = ['sysadmin'];

  const s3Response = await uploadS3Document(`${document._id}/${fileName}`, fileContent, aclRole);

  const docResponse = await document.save();

  return { docResponse, s3Response };
}

exports.createS3Document = createS3Document;

/**
 * Delete a document from S3
 *
 * @param {*} docKey
 * @returns
 */
async function deleteS3Document(docKey) {
  if (!process.env.OBJECT_STORE_bucket_name) {
    throw new Error('Missing required OBJECT_STORE_bucket_name env variable');
  }

  if (!docKey) {
    throw new Error('Missing required docKey param');
  }

  return await s3.deleteObject({ Bucket: process.env.OBJECT_STORE_bucket_name, Key: docKey }).promise();
}

exports.deleteS3Document = deleteS3Document;

/**
 * Upload a document to s3.
 *
 * @param {*} docKey s3 document key
 * @param {*} docBody document data
 * @param {*} [aclRole=null] the ACL role to set.  Defaults to `authenticated-read` if not set. (optional)
 * @returns
 */
async function uploadS3Document(docKey, docBody, aclRole = null) {
  if (!process.env.OBJECT_STORE_bucket_name) {
    throw new Error('Missing required OBJECT_STORE_bucket_name env variable');
  }

  if (!docKey) {
    throw new Error('Missing required docKey param');
  }

  if (!docBody) {
    throw new Error('Missing required docKey param');
  }

  return await s3
    .upload({
      Bucket: process.env.OBJECT_STORE_bucket_name,
      Key: docKey,
      Body: docBody,
      ACL: aclRole || 'authenticated-read'
    })
    .promise();
}

exports.uploadS3Document = uploadS3Document;

/**
 * Set the s3 document ACL to `public-read`
 *
 * @param {*} docKey s3 document key
 * @returns
 */
async function publishS3Document(docKey) {
  return await s3
    .putObjectAcl({
      Bucket: process.env.OBJECT_STORE_bucket_name,
      Key: docKey,
      ACL: 'public-read'
    })
    .promise();
}

exports.publishS3Document = publishS3Document;

/**
 * Set the s3 document ACL to `authenticated-read`
 *
 * @param {*} docKey s3 document key
 * @returns
 */
async function unpublishS3Document(docKey) {
  return await s3
    .putObjectAcl({
      Bucket: process.env.OBJECT_STORE_bucket_name,
      Key: docKey,
      ACL: 'authenticated-read'
    })
    .promise();
}

exports.unpublishS3Document = unpublishS3Document;

/**
 * Swagger route handler for publish a document.
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 */
exports.protectedPublish = async function(args, res, next) {
  try {
    if (!args.swagger.params.docId || !args.swagger.params.docId.value) {
      return queryActions.sendResponse(res, 400, 'Missing required docId param');
    }

    defaultLog.info(`protectedPublish - docId: ${args.swagger.params.docId.value}`);

    const Document = require('mongoose').model('Document');
    const document = await Document.findOne({ _id: new ObjectID(args.swagger.params.docId.value) });

    if (!document) {
      defaultLog.info(`protectedPublish - couldn't find document for docId: ${args.swagger.params.docId.value}`);
      return queryActions.sendResponse(res, 404, {});
    }

    // publish mongo document
    const published = await publishDocument(document, args.swagger.params.auth_payload);

    let publishedS3 = null;
    try {
      if (document.key) {
        // publish s3 document, if it exists
        publishedS3 = await publishS3Document(document.key);
      }
    } catch (error) {
      // don't fail if we try to unpublish a key that doesn't exist
      if (error.code !== 'NoSuchKey') {
        throw error;
      }
    }

    return queryActions.sendResponse(res, 200, { localDocument: published, s3Document: publishedS3 });
  } catch (error) {
    return queryActions.sendResponse(res, 500, error);
  }
};

/**
 * Publish a document. Adds the `public` role to the documents root read array.
 *
 * @param {*} document
 * @param {*} auth_payload
 * @returns the published document
 */
async function publishDocument(document, auth_payload) {
  if (!document) {
    defaultLog.info('publishDocument - Missing required document param');
    return null;
  }

  let published = await queryActions.publish(document);

  await queryUtils.recordAction('Publish', document, auth_payload && auth_payload.displayName, document._id);

  return published;
}

exports.publishDocument = publishDocument;

/**
 * Swagger route handler for unpublish a document.
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 */
exports.protectedUnpublish = async function(args, res, next) {
  try {
    if (!args.swagger.params.docId || !args.swagger.params.docId.value) {
      return queryActions.sendResponse(res, 400, 'Missing required docId param');
    }

    defaultLog.info(`unpublishDocument - docId: ${args.swagger.params.docId.value}`);

    const Document = require('mongoose').model('Document');
    const document = await Document.findOne({ _id: new ObjectID(args.swagger.params.docId.value) });

    if (!document) {
      defaultLog.info(`protectedUnpublish - couldn't find document for docId: ${args.swagger.params.docId.value}`);
      return queryActions.sendResponse(res, 404, {});
    }

    // unpublish mongo document
    const unpublished = unpublishDocument(document, args.swagger.params.auth_payload);

    let unpublishedS3 = null;
    try {
      if (document.key) {
        // unpublish s3 document, if it exists
        unpublishedS3 = await unpublishS3Document(document.key);
      }
    } catch (error) {
      // don't fail if we try to unpublish a key that doesn't exist
      if (error.code !== 'NoSuchKey') {
        throw error;
      }
    }

    return queryActions.sendResponse(res, 200, { localDocument: unpublished, s3Document: unpublishedS3 });
  } catch (error) {
    return queryActions.sendResponse(res, 500, error);
  }
};

/**
 * Unpublish a document. Removes the `public` role to the documents root read array.
 *
 * @param {*} document
 * @param {*} auth_payload
 * @returns the unpublished document
 */
async function unpublishDocument(document, auth_payload) {
  if (!document) {
    defaultLog.info('unpublishDocument - Missing required document param');
    return null;
  }

  const unpublished = await queryActions.unPublish(document);

  await queryUtils.recordAction('Unpublish', document, auth_payload && auth_payload.displayName, document._id);

  return unpublished;
}

exports.unpublishDocument = unpublishDocument;

exports.protectedGetS3SignedURL = async function(args, res, next) {
  if (!args.swagger.params.docId || !args.swagger.params.docId.value) {
    defaultLog.warn('protectedGet - missing required docId param');
    return queryActions.sendResponse(res, 400, 'Missing required docId param');
  }

  const Document = mongoose.model('Document');
  const document = await Document.findOne({ _id: new ObjectID(args.swagger.params.docId.value) });

  if (!document) {
    defaultLog.info(`protectedGetS3SignedURL - couldn't find document for docId: ${args.swagger.params.docId.value}`);
    return queryActions.sendResponse(res, 404, {});
  }

  if (!document.key) {
    defaultLog.info(`protectedGetS3SignedURL - not an S3 document: ${args.swagger.params.docId.value}`);
    return queryActions.sendResponse(res, 404, {});
  }

  const signedUrl = await s3.getSignedUrl('getObject', {
    Bucket: process.env.OBJECT_STORE_bucket_name,
    Key: document.key
  });

  return queryActions.sendResponse(res, 200, signedUrl);
};
