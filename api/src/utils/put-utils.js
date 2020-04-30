const mongoose = require('mongoose');
const QueryUtils = require('./query-utils');
const DocumentController = require('../controllers/document-controller');

exports.validateObjectAgainstModel = function(mongooseModel, incomingObj) {
  if (!incomingObj) {
    return;
  }

  // First we use the mongoose model to create a new object to validate field types.
  const validFields = new mongooseModel(incomingObj);

  // Then iterate through and create a new object with only the fields that are to be updated
  return sanitizeObject(incomingObj, validFields);
};

/**
 * Filters out any fields in objToTest that aren't also found in validObj.
 *
 * @param {*} objToTest object to strip unknown fields from
 * @param {*} validObj source of truth object to compare against
 * @returns a sanitized object that only contains fields that are also found in validObj
 */
const sanitizeObject = function(objToTest, validObj) {
  let sanitizedObj = {};

  let objToTestKeys = Object.keys(objToTest);
  for (const key of objToTestKeys) {
    if (key in validObj) {
      if (isObject(validObj[key])) {
        // descend into sub object
        sanitizedObj[key] = sanitizeObject(objToTest[key], validObj[key]);
      } else {
        sanitizedObj[key] = objToTest[key];
      }
    }
  }

  return sanitizedObj;
};

/**
 * Checks if the value provided is an object.
 *
 * @param {*} obj
 * @returns True if the value is an object, false otherwise.
 */
function isObject(item) {
  return item && typeof item === 'object' && item.constructor.name === 'Object';
}

/**
 * Fetches a master record for the purposes of creating a new flavour record, during an edit (put) request.
 *
 * @param {string} schema master _schemaName
 * @param {string} id master _id
 * @returns {object} master object with certain master-specific fields removed (like _id).
 */
exports.fetchMasterForCreateFlavour = async function(schema, id) {
  const Model = mongoose.model(schema);
  const masterRecord = await Model.findOne({ _schemaName: schema, _id: id });

  if (!masterRecord) {
    return {};
  }

  const masterObj = masterRecord.toObject();

  delete masterObj._id;
  delete masterObj._schemaName;
  delete masterObj._flavourRecords;
  delete masterObj.read;
  delete masterObj.write;

  return masterObj;
};

/**
 * Converts the obj into a flattened object who's keys are the paths of the original object.
 *
 * Example:
 *  inputObj = {
 *    a: {
 *      b: 123
 *    }
 *  }
 *
 *  getDotNotation(inputObj, {}, '')
 *
 *  outputObj = {
 *    'a.b': 123
 *  }
 *
 * @param {*} obj object to flatten
 * @param {*} target obj to assign flattened object to (default: {})
 * @param {*} prefix prefix to add to the start of the flattened path (default: '')
 * @returns a flattened copy of the original obj
 */
exports.getDotNotation = function(obj, target, prefix) {
  if (!obj) {
    return obj;
  }

  target = target || {};
  prefix = prefix || '';

  Object.keys(obj).forEach(key => {
    if (isObject(obj[key])) {
      this.getDotNotation(obj[key], target, prefix + key + '.');
    } else {
      return (target[prefix + key] = obj[key]);
    }
  });

  return target;
};

/**
 * Updates the read roles for all documents associated with the master record.
 *
 * @param {*} masterRecord
 * @param {*} auth_payload
 * @returns savedDocuments
 */
exports.updateDocumentRoles = async function(masterRecord, auth_payload) {
  if (!masterRecord) {
    return null;
  }

  let savedDocuments = [];
  const documentPromises = [];

  if (await QueryUtils.isDocumentConsideredAnonymous(masterRecord)) {
    // unpublish the mongo document AND s3 document if one exists
    masterRecord.documents.forEach(docId => {
      documentPromises.push(
        DocumentController.unpublishDocument(docId, auth_payload).then(document => {
          if (document.key) {
            return DocumentController.unpublishS3Document(document.key);
          }
        })
      );
    });
  } else {
    // publish the mongo document AND s3 document if one exists
    masterRecord.documents.forEach(docId => {
      documentPromises.push(
        DocumentController.publishDocument(docId, auth_payload).then(document => {
          if (document.key) {
            return DocumentController.publishS3Document(document.key);
          }
        })
      );
    });
  }

  if (documentPromises.length > 0) {
    savedDocuments = await Promise.all(documentPromises);
  }

  return savedDocuments;
};

/**
 * Apply business logic changes to a record. Updates the provided updateObj, and returns it.
 *
 * @param {*} updateObj
 * @param {*} sanitizedObj
 * @returns updateObj
 */
exports.applyBusinessLogic = function(updateObj, sanitizedObj) {
  if (!sanitizedObj) {
    return updateObj;
  }

  // apply anonymous business logic
  if (QueryUtils.isRecordConsideredAnonymous(sanitizedObj)) {
    updateObj.$pull['issuedTo.read'] = 'public';
  } else {
    updateObj.$addToSet['issuedTo.read'] = 'public';
  }

  return updateObj;
};
