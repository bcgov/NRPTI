
const mongoose = require('mongoose');
const queryActions = require('../utils/query-actions');
const { uuid } = require('uuidv4');
const AWS = require('aws-sdk');

const OBJ_STORE_URL = process.env.OBJECT_STORE_endpoint_url || 'nrs.objectstore.gov.bc.ca';
const ep = new AWS.Endpoint(OBJ_STORE_URL);
const s3 = new AWS.S3(
  {
    endpoint: ep,
    accessKeyId: process.env.OBJECT_STORE_user_account,
    secretAccessKey: process.env.OBJECT_STORE_password,
    signatureVersion: 'v4'
  });

exports.protectedOptions = function (args, res, next) {
  res.status(200).send();
};

// WIP
exports.protectedPut = async function (args, res, next) {
  if (args.swagger.params.data && args.swagger.params.data.value) {
    const data = args.swagger.params.data.value;

    if (!data.fileName) {
      return queryActions.sendResponse(res, 400, 'You must have a file name');
    }

    const Document = mongoose.model('Document');
    let document = new Document();
    const key = `${uuid()}_${data.fileName}`;

    document.fileName = data.fileName;
    document.key = key;
    document._addedBy = args.swagger.params.auth_payload.displayName;

    let savedDocument = null;
    try {
      savedDocument = await document.save();
    } catch (e) {
      return queryActions.sendResponse(res, 400, e);
    }

    try {
      const url = redirect('PUT', key);
      return queryActions.sendResponse(res, 200, { document: savedDocument, presignedData: url });
    } catch (e) {
      return queryActions.sendResponse(res, 400, e);
    }
  } else {
    return queryActions.sendResponse(res, 400, { error: 'You must provide data' });
  }
}

exports.createLinkDocument = async function (fileName, addedBy, url) {
  const Document = mongoose.model('Document');
  let document = new Document();
  document.fileName = fileName;
  document.addedBy = addedBy;
  document.url = url;
  document.read = ['public', 'sysadmin'];
  document.write = ['sysadmin'];
  return await document.save();;
}

// WIP
function createSignedUrl(operation, key) {
  let params = {
    Bucket: process.env.OBJECT_STORE_bucket_name,
    Key: key,
    Expires: 5 * 60 // Link expires in 5 minutes
  }

  try {
    if (operation === 'postObject') {
      return s3.createPresignedPost(params);
    } else {
      return s3.getSignedUrl(operation, params);
    }
  } catch (e) {
    throw new Error(`Unable to genereate presigned post url. ${e}`);
  }
}

// WIP
function redirect(method, key) {
  let operation;
  switch (method) {
    case 'GET':
      operation = 'getObject';
      break;
    case 'HEAD':
      operation = 'headObject';
      break;
    case 'POST':
      operation = 'postObject'
      break;
    case 'PUT':
      operation = 'putObject';
      break;
    case 'DELETE':
      operation = 'deleteObject';
      break;
    default:
      throw new Error(`Invalid method operation ${method}`);
  }

  return createSignedUrl(operation, key);
}
