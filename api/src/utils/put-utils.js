const mongoose = require('mongoose');
const ObjectID = require('mongodb').ObjectID;
const BusinessLogicManager = require('./business-logic-manager');

exports.validateObjectAgainstModel = function (mongooseModel, incomingObj) {
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
const sanitizeObject = function (objToTest, validObj) {
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
exports.fetchMasterForCreateFlavour = async function (schema, id) {
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
exports.getDotNotation = function (obj, target, prefix) {
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

exports.editRecordWithFlavours = async function (args, res, next, incomingObj, editMaster, PostFunctions, masterSchemaName, flavourFunctions = {}) {
  let flavours = [];
  let flavourIds = [];
  let promises = [];

  // make a copy of the incoming object for use by the flavours only
  const flavourIncomingObj = { ...incomingObj };
  // Remove fields that should not be inherited from the master record
  delete flavourIncomingObj._id;
  delete flavourIncomingObj._schemaName;
  delete flavourIncomingObj._flavourRecords;
  delete flavourIncomingObj._master;
  delete flavourIncomingObj.read;
  delete flavourIncomingObj.write;

  // Default flavour publish statuses to false
  incomingObj.isNrcedPublished = false;
  incomingObj.isLngPublished = false;

  // Prepare flavours
  const entries = Object.entries(flavourFunctions);
  // Example of entries: [['OrderLNG', createLNG()], ['OrderNRCED', createNRCED()]]

  if (entries.length > 0 && Object.keys(flavourIncomingObj).length > 0) {
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      if (!flavourIncomingObj[entry[0]]) {
        continue;
      }
      if (flavourIncomingObj[entry[0]]._id) {
        // This is to determine how we should populate the fields in master that know
        // the publish state of its flavours.
        if (flavourIncomingObj[entry[0]].addRole && flavourIncomingObj[entry[0]].addRole.includes('public') && entry[0].includes('NRCED')) {
          incomingObj.isNrcedPublished = true;
        }
        if (flavourIncomingObj[entry[0]].addRole && flavourIncomingObj[entry[0]].addRole.includes('public') && entry[0].includes('LNG')) {
          incomingObj.isLngPublished = true;
        }

        if (flavourIncomingObj[entry[0]]) {
          let flavourUpdateObj = entry[1](args, res, next, { ...flavourIncomingObj, ...flavourIncomingObj[entry[0]] });
          const Model = mongoose.model(entry[0]);
          flavourUpdateObj._master = new ObjectID(incomingObj._id);
          promises.push(
            Model.findOneAndUpdate(
              { _id: flavourIncomingObj[entry[0]]._id },
              flavourUpdateObj,
              { new: true }
            )
          );
        }
      } else {
        // We are adding a flavour instead of editing.
        // We need to get the existing master record.
        const masterRecord = await this.fetchMasterForCreateFlavour(masterSchemaName, incomingObj._id);
        let newFlavour = null;
        if (entry[0].includes('LNG')) {
          newFlavour = PostFunctions.createLNG(args, res, next, {
            ...masterRecord,
            ...flavourIncomingObj,
            ...incomingObj[entry[0]]
          });
        } else if (entry[0].includes('NRCED')) {
          newFlavour = PostFunctions.createNRCED(args, res, next, {
            ...masterRecord,
            ...flavourIncomingObj,
            ...incomingObj[entry[0]]
          });
        }
        if (newFlavour) {
          newFlavour._master = new ObjectID(masterRecord._id);
          flavours.push(newFlavour);
          promises.push(newFlavour.save());
        }
      }
      delete incomingObj[entry[0]];
    }
    // Get flavour ids for master
    if (flavours.length > 0) {
      flavourIds = flavours.map(
        flavour => flavour._id
      );
    }
  }

  const MasterModel = mongoose.model(masterSchemaName);
  promises.push(
    MasterModel.findOneAndUpdate({
      _id: incomingObj._id
    },
      editMaster(args, res, next, incomingObj, flavourIds)
    ),
    {
      new: true
    }
  );

  // Attempt to save everything.
  let result = null;
  try {
    result = await Promise.all(promises);

  } catch (e) {
    return {
      status: 'failure',
      object: result,
      errorMessage: e.message
    };
  }

  let savedDocuments = null;
  try {
    // result returns with the flavours first, master record next and an object created by mongo last.
    // we do result[result.length - 2] because we want the second last item which is the master record.
    savedDocuments = await BusinessLogicManager.updateDocumentRoles(
      result[result.length - 2],
      args.swagger.params.auth_payload
    );
  } catch (e) {
    return {
      status: 'failure',
      object: savedDocuments,
      errorMessage: e.message
    };
  }

  return {
    status: 'success',
    object: result
  };
}