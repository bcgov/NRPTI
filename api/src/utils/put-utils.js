const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
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
exports.fetchMasterForCreateFlavour = async function (schema, id, auth_payload) {
  const Model = mongoose.model(schema);
  const masterRecord = await Model.findOne({ _schemaName: schema, _id: id, write: { $in: auth_payload.realm_access.roles } });

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

exports.fetchMasterForReference = async function (schema, id) {
  const Model = mongoose.model(schema);

  const masterRecord = await Model.findOne({ _schemaName: schema, _id: id })
                                  .populate('_flavourRecords');;

  if (!masterRecord) {
    return {};
  }

  return masterRecord.toObject();
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

exports.editRecordWithFlavours = async function (args, res, next, incomingObj, editMaster, PostFunctions, masterSchemaName, flavourFunctions = {}, overridePutParams = null) {
  let flavours = [];
  let flavourIds = [];
  let promises = [];
  let masterRecord = null;

  // This is needed because sanitization below will remove the reference to the masterId
  const masterId = incomingObj._id;

  // make a copy of the incoming object for use by the flavours only
  const flavourIncomingObj = { ...incomingObj };
  // Remove fields that should not be inherited from the master record
  delete flavourIncomingObj._id;
  delete flavourIncomingObj._schemaName;
  delete flavourIncomingObj._flavourRecords;
  delete flavourIncomingObj._master;
  delete flavourIncomingObj.read;
  delete flavourIncomingObj.write;

  // Prepare flavours
  const entries = Object.entries(flavourFunctions);
  // Example of entries: [['OrderLNG', createLNG()], ['OrderNRCED', createNRCED()]]

  if (entries.length > 0 && Object.keys(flavourIncomingObj).length > 0) {
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      if (!flavourIncomingObj[entry[0]]) {
        continue;
      }

      // This is to determine how we should populate the fields in master that know
      // the publish state of its flavours.
      if (flavourIncomingObj[entry[0]].addRole && flavourIncomingObj[entry[0]].addRole.includes('public')) {
        entry[0].includes('NRCED') && (incomingObj.isNrcedPublished = true);
        entry[0].includes('LNG') && (incomingObj.isLngPublished = true);
        entry[0].includes('BCMI') && (incomingObj.isBcmiPublished = true);
      }
      if (flavourIncomingObj[entry[0]].removeRole && flavourIncomingObj[entry[0]].removeRole.includes('public')) {
        entry[0].includes('NRCED') && (incomingObj.isNrcedPublished = false);
        entry[0].includes('LNG') && (incomingObj.isLngPublished = false);
        entry[0].includes('BCMI') && (incomingObj.isBcmiPublished = false);
      }

      const flavourId = flavourIncomingObj[entry[0]]._id;

      if (flavourId) {
        // Grab the existing flavour object to get the issuingAgency and issuedTo if
        // they don't exist in the flavourIncomingObj
        const flavourRecordModel = mongoose.model(entry[0]);

        const flavourExistingObject = await flavourRecordModel
          .findOne({
            _id: new ObjectId(flavourId)
          });

        const flavourExistingJSONObject = flavourExistingObject.toObject();

        // check if this object has issuingAgency and issuedTo to avoid adding null values to objects that don't have these fields
        if (flavourExistingJSONObject.issuingAgency || flavourIncomingObj.issuingAgency) {
          flavourIncomingObj.issuingAgency = flavourIncomingObj.issuingAgency ? flavourIncomingObj.issuingAgency : flavourExistingJSONObject.issuingAgency;
        }

        if (flavourExistingJSONObject.issuedTo || flavourIncomingObj.issuedTo) {
          flavourIncomingObj.issuedTo = flavourIncomingObj.issuedTo ? flavourIncomingObj.issuedTo : flavourExistingJSONObject.issuedTo;

          // Reject any changes to permissions
          // Must be decided through the business logic manager
          delete flavourIncomingObj.issuedTo.read;
          delete flavourIncomingObj.issuedTo.write;
        }

        let flavourUpdateObj = entry[1](args, res, next, { ...flavourIncomingObj, ...flavourIncomingObj[entry[0]] });
        const Model = mongoose.model(entry[0]);
        flavourUpdateObj._master = new ObjectId(masterId);

        // Set flavour objectIds
        flavourIds.push(flavourId);

        promises.push(
          Model.findOneAndUpdate(
            { _id: flavourId, write: { $in: args.swagger.params.auth_payload.realm_access.roles } },
            flavourUpdateObj,
            { new: true }
          )
        );
      } else {
        // We are adding a flavour instead of editing.
        // We need to get the existing master record.
        masterRecord = await this.fetchMasterForCreateFlavour(masterSchemaName, masterId, args.swagger.params.auth_payload);
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
        } else if (entry[0].includes('BCMI')) {
          newFlavour = PostFunctions.createBCMI(args, res, next, {
            ...masterRecord,
            ...flavourIncomingObj,
            ...incomingObj[entry[0]]
          });
        }

        if (newFlavour) {
          newFlavour._master = new ObjectId(masterId);
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
  const updateMasterObj = editMaster(args, res, next, incomingObj, flavourIds);

  // Mine GUID logic
  // If an _epicProjectId is provided and we find a mine that requires the project
  // disregard incomingObj.mineGuid
  if (incomingObj._epicProjectId || incomingObj.mineGuid) {
    // We might have the master record from creating flavours earlier.
    if (!masterRecord) {
      try {
        masterRecord = await MasterModel.findOne(
          { _id: new ObjectId(masterId) }
        );
      } catch (e) {
        return {
          status: 'failure',
          object: masterRecord,
          errorMessage: `Error getting master record for mineGuid logic: ${e.message}`
        };
      }
    }

    // We can only edit epicProjectId/mineGuid on records with sourceSystemRef as nrpti or anything csv import
    if (
      masterRecord.sourceSystemRef === 'nrpti' ||
      masterRecord.sourceSystemRef.includes('csv') ||
      (overridePutParams && overridePutParams.forceMineBCMIGUIDUpdate)
    ) {
      const MineBCMI = mongoose.model('MineBCMI');
      let mineBCMI = null;
      try {
        mineBCMI = await MineBCMI.findOne(
          {
            _epicProjectIds: { $in: [new ObjectId(incomingObj._epicProjectId)] },
          }
        );
      } catch (e) {
        return {
          status: 'failure',
          object: mineBCMI,
          errorMessage: `Error getting MineBCMI: ${e.message}`
        };
      }
      if (mineBCMI && mineBCMI._sourceRefId) {
        incomingObj.mineGuid = mineBCMI._sourceRefId;
      }
    }
    if (incomingObj.mineGuid) {
      updateMasterObj.mineGuid = incomingObj.mineGuid;
    }
  }

  promises.push(
    MasterModel.findOneAndUpdate({
      _id: masterId,
      write: { $in: args.swagger.params.auth_payload.realm_access.roles }
    },
      updateMasterObj,
      { new: true }
    )
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

  // Check flavours, if all public add public read
  let flavourPublishedCount = 0;
  let issuedToPublishedCount = 0;

  const masterRec = await this.fetchMasterForReference(masterSchemaName, masterId);
  for (let x = 0; x < masterRec._flavourRecords.length; x++) {
    if (masterRec._flavourRecords[x].read.includes('public')) {
      flavourPublishedCount++;
    }
    if (masterRec._flavourRecords[x].issuedTo && masterRec._flavourRecords[x].issuedTo.read.includes('public')) {
      issuedToPublishedCount++;
    }
  }

  // Tracker on read property
  if (flavourPublishedCount > 0) {
    if (!masterRec.read.includes('public')) {
      masterRec.read.push('public');
    }
  } else {
    // Ensure removed
    masterRec.read = masterRec.read.filter(role => role !== 'public');

    // Also the issuedTo if it exists.
    if (masterRec.issuedTo && masterRec.issuedTo.read) {
      masterRec.issuedTo.read = masterRec.issuedTo.read.filter(role => role !== 'public');
    }
  }

  // Tracker on issuedTo property - this will be 0 on objects that don't have an issuedTo or
  // where the issuedTo wasn't published, and < total when there's a mismatch.
  if (issuedToPublishedCount > 0 && masterRec.read.includes('public')) {
    if (masterRec.issuedTo && !masterRec.issuedTo.read.includes('public')) {
      masterRec.issuedTo.read.push('public');
    }
  } else {
    // Ensure removed from issuedTo
    if (masterRec.issuedTo && masterRec.issuedTo.read && masterRec.issuedTo.read.length >= 0) {
      masterRec.issuedTo.read = masterRec.issuedTo.read.filter(role => role !== 'public');
    }
  }

  // Update read elements
  await MasterModel.updateOne({ _id: masterId },
                           {
                             $set: {
                               'read': masterRec.read
                             }
                           },
                           { new: true });

  // Not all records have an issuedTo
  if (masterRec.issuedTo) {
    await MasterModel.updateOne({ _id: masterId },
                              {
                                $set: {
                                  "issuedTo.read": masterRec.issuedTo.read
                                }
                              },
                              { new: true });
  }

  let savedDocuments = null;
  try {
    savedDocuments = await BusinessLogicManager.updateDocumentRoles(
      result[result.findIndex(x => x._schemaName === masterSchemaName)],
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
