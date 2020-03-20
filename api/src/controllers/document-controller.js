const mongoose = require('mongoose');
const queryActions = require('../utils/query-actions');
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
    let docResponse = null;
    let s3Response = null;
    if (args.swagger.params.url && args.swagger.params.url.value) {
      // If the document already has a url we can assume it's a link

      // TODO: For now all documents are public.
      // Once we have rules implemented for publishing documents, this code will have to account for that.

      // An unpublished document will not have url in it's meta.
      // A published document will have a direct url to the S3 object store.
      // Unpublished documents will require a presigned get to the S3 object store.
      try {
        docResponse = await createDocument(
          args.swagger.params.fileName.value,
          (this.auth_payload && this.auth_payload.displayName) || '',
          args.swagger.params.url.value
        );
      } catch (e) {
        defaultLog.info('Error creating document meta:', e);
        return queryActions.sendResponse(res, 400, e);
      }
    } else if (args.swagger.params.upfile && args.swagger.params.upfile.value) {
      // Upload to S3
      try {
        docResponse = await createDocument(
          args.swagger.params.fileName.value,
          (this.auth_payload && this.auth_payload.displayName) || ''
        );
      } catch (e) {
        defaultLog.info('Error creating document meta:', e);
        return queryActions.sendResponse(res, 400, e);
      }

      // TODO: ACL is set to public-read until we know publishing rules.
      try {
        const s3UploadResult = await s3
          .upload({
            Bucket: process.env.OBJECT_STORE_bucket_name,
            Key: docResponse.key,
            Body: args.swagger.params.upfile.value.buffer,
            ACL: 'public-read'
          })
          .promise();

        s3Response = s3UploadResult;
      } catch (e) {
        defaultLog.info('Error uploading to S3:', e);
        return queryActions.sendResponse(res, 400, e);
      }
    }
    // Now we must update the associated record.
    try {
      const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
      const collection = db.collection('nrpti');

      // add to master record
      const recordResponse = await collection.findOneAndUpdate(
        { _id: new ObjectID(args.swagger.params.recordId.value) },
        { $addToSet: { documents: new ObjectID(docResponse._id) } },
        { returnNewDocument: true }
      );

      // add to flavour records
      let observables = [];
      if (recordResponse && recordResponse.value && recordResponse.value._flavourRecords) {
        recordResponse.value._flavourRecords.forEach(id => {
          observables.push(
            collection.findOneAndUpdate(
              { _id: new ObjectID(id) },
              { $addToSet: { documents: new ObjectID(docResponse._id) } },
              { returnNewDocument: true }
            )
          );
        });
      }
      const flavourRecordResponses = await Promise.all(observables);

      return queryActions.sendResponse(res, 200, {
        document: docResponse,
        record: recordResponse,
        flavours: flavourRecordResponses,
        s3: s3Response
      });
    } catch (e) {
      defaultLog.info('Error updating associated record:', e);
      return queryActions.sendResponse(res, 400, e);
    }
  } else {
    defaultLog.info('Error: You must provide fileName and recordId');
    return queryActions.sendResponse(res, 400, { error: 'You must provide fileName and recordId' });
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
      defaultLog.info('Error removing document meta from database:', e);
      return queryActions.sendResponse(res, 400, e);
    }

    // If a key exists, then the doc is stored in S3.
    // We need to delete this document.
    if (docResponse.key) {
      try {
        const s3DeleteResult = await s3
          .deleteObject({
            Bucket: process.env.OBJECT_STORE_bucket_name,
            Key: docResponse.key
          })
          .promise();

        s3Response = s3DeleteResult;
      } catch (e) {
        defaultLog.info('Error deleting object from S3:', e);
        return queryActions.sendResponse(res, 400, e);
      }
    }

    // Then we want to remove the document's id from the record it's attached to.
    try {
      const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
      const collection = db.collection('nrpti');

      // remove from master record
      const recordResponse = await collection.findOneAndUpdate(
        { _id: new ObjectID(args.swagger.params.recordId.value) },
        { $pull: { documents: new ObjectID(docResponse._id) } },
        { returnNewDocument: true }
      );

      // remove from flavour records
      let observables = [];
      if (recordResponse && recordResponse.value && recordResponse.value._flavourRecords) {
        recordResponse.value._flavourRecords.forEach(id => {
          observables.push(
            collection.findOneAndUpdate(
              { _id: new ObjectID(id) },
              { $pull: { documents: new ObjectID(docResponse._id) } },
              { returnNewDocument: true }
            )
          );
        });
      }
      const flavourRecordResponses = await Promise.all(observables);

      return queryActions.sendResponse(res, 200, {
        document: docResponse,
        record: recordResponse,
        flavours: flavourRecordResponses,
        s3: s3Response
      });
    } catch (e) {
      defaultLog.info('Error updating associated record:', e);
      return queryActions.sendResponse(res, 400, e);
    }
  } else {
    defaultLog.info('Error: You must provide docId and recordId');
    return queryActions.sendResponse(res, 400, { error: 'You must provide docId and recordId' });
  }
};

exports.createDocument = createDocument;

async function createDocument(fileName, addedBy, url = null) {
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
  document.read = ['public', 'sysadmin'];
  document.write = ['sysadmin'];
  return await document.save();
}
