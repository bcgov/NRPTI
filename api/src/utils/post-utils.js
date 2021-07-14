const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const { userIsOnlyInRole } = require('./auth-utils');
const { CSV_SOURCE_DEFAULT_ROLES } = require('./constants/misc');

/**
 * Builds the issuedTo.fullName string, based on the issuedTo.type field.
 *
 * @param {*} issuedToObj
 * @returns
 */
exports.getIssuedToFullNameValue = function(issuedToObj) {
  if (!issuedToObj || !issuedToObj.type) {
    return '';
  }

  if (issuedToObj.type === 'IndividualCombined') {
    return issuedToObj.fullName;
  }

  if (issuedToObj.type === 'Company') {
    return issuedToObj.companyName;
  }

  if (!issuedToObj.firstName && !issuedToObj.middleName && !issuedToObj.lastName) {
    return '';
  }

  if (issuedToObj.type === 'Individual') {
    let entityString = '';

    const entityNameParts = [];
    if (issuedToObj.lastName) {
      entityNameParts.push(issuedToObj.lastName);
    }

    if (issuedToObj.firstName) {
      entityNameParts.push(issuedToObj.firstName);
    }

    entityString = entityNameParts.join(', ');

    if (issuedToObj.middleName) {
      entityString += ` ${issuedToObj.middleName}`;
    }

    return entityString;
  }
};

exports.createRecordWithFlavours = async function(args, res, next, incomingObj, createMaster, flavourFunctions = {}) {
  let flavours = [];
  let flavourIds = [];
  let promises = [];
  // We have this in case there's error and we need to clean up.
  let idsToDelete = [];

  // Tracker for if a flavour was published, forces the master to have public read as well.
  let flavourPublishedCount = 0;
  // Tracker for issuedTo in the flavour.  We need all issuedTo to match public before we turn on public.
  let issuedToPublishedCount = 0;

  if (!incomingObj.documents) {
    incomingObj.documents = [];
  }

  // Default flavour publish statuses to false
  incomingObj.isNrcedPublished = false;
  incomingObj.isLngPublished = false;
  incomingObj.isBcmiPublished = false;

  // Prepare flavours
  const entries = Object.entries(flavourFunctions);
  // Example of entries: [['OrderLNG', createLNG()], ['OrderNRCED', createNRCED()]]
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (!incomingObj[entry[0]]) {
      continue;
    }

    // This is to determine how we should populate the fields in master that know
    // the publish state of its flavours.
    if (incomingObj[entry[0]].addRole && incomingObj[entry[0]].addRole.includes('public')) {
      flavourPublishedCount++;
      entry[0].includes('NRCED') && (incomingObj.isNrcedPublished = true);
      entry[0].includes('LNG') && (incomingObj.isLngPublished = true);
      entry[0].includes('BCMI') && (incomingObj.isBcmiPublished = true);
    }

    incomingObj[entry[0]] && flavours.push(entry[1](args, res, next, { ...incomingObj, ...incomingObj[entry[0]] }));
  }

  // Get flavour ids for master
  if (flavours.length > 0) {
    flavourIds = flavours.map(flavour => flavour._id);
    idsToDelete = [...flavourIds];
  }

  // Prepare master
  let masterRecord = createMaster(args, res, next, incomingObj, flavourIds);
  idsToDelete.push(masterRecord._id);

  // Set master back ref to flavours get ready to save
  for (let i = 0; i < flavours.length; i++) {
    const flavour = flavours[i];
    flavour._master = new ObjectId(masterRecord._id);
    if (flavour.issuedTo && flavour.issuedTo.read.includes('public')) {
      issuedToPublishedCount++;
    }

    promises.push(flavour.save());
  }

  // Mine GUID logic
  // If an _epicProjectId is provided and we find a mine that requires the project
  // disregard incomingObj.mineGuid
  if (incomingObj._epicProjectId) {
    const Model = mongoose.model('MineBCMI');
    let mineBCMI = null;
    try {
      mineBCMI = await Model.findOne({
        _schemaName: 'MineBCMI',
        _epicProjectIds: { $in: [new ObjectId(incomingObj._epicProjectId)] }
      });
    } catch (e) {
      return {
        status: 'failure',
        object: mineBCMI,
        errorMessage: `Error getting MineBCMI: ${e.message}`
      };
    }
    if (mineBCMI && mineBCMI.mineGuid) {
      incomingObj.mineGuid = mineBCMI.mineGuid;
    }
  }

  if (incomingObj.mineGuid) {
    masterRecord.mineGuid = incomingObj.mineGuid;
  }

  // Tracker on read property
  if (flavourPublishedCount > 0) {
    if (masterRecord.read && !masterRecord.read.includes('public')) {
      masterRecord.read.push('public');
    }
  }

  // Tracker on issuedTo property - this will be 0 on objects that don't have an issuedTo or
  // where the issuedTo wasn't published, and < total when there's a mismatch.
  if (issuedToPublishedCount > 0) {
    if (masterRecord.issuedTo && !masterRecord.issuedTo.read.includes('public')) {
      masterRecord.issuedTo.read.push('public');
    }
  }

  promises.push(masterRecord.save());

  // Attempt to save everything.

  let result = null;
  try {
    result = await Promise.all(promises);
  } catch (e) {
    const mongodb = require('../utils/mongodb');
    const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
    const collection = db.collection('nrpti');
    // Something went wrong. Attempt to clean up
    let orArray = [];
    for (let i = 0; i < idsToDelete.length; i++) {
      orArray.push({ _id: new ObjectId(idsToDelete[i]) });
    }
    await collection.deleteMany({
      $or: orArray
    });

    return {
      status: 'failure',
      object: result,
      errorMessage: e.message
    };
  }
  return {
    status: 'success',
    object: result
  };
};

/**
 * Sets the read/write and issuedTo read/write arrays on the argument record
 * if the user is identified as one of the limited admin roles such as
 * Wildfire or FLNRO.
 *
 * @param {object} record The record to modify
 * @param {Array<string>} userRoles The user's roles
 * @param {Array<string>} rolesToCheck The roles to check for
 * @returns {boolean} Indication if user if wildfire user
 */
exports.setAdditionalRoleOnRecord = function(record, userRoles, rolesToCheck) {
  if (!record || !userRoles || !rolesToCheck) return;

  for (const role of rolesToCheck) {
    if (userIsOnlyInRole(userRoles, role)) {
      record.read.push(role);
      record.write.push(role);
      record.issuedTo.read.push(role);
      record.issuedTo.write.push(role);

      break;
    }
  }

  // Additionally add read and write roles if is csv import source and have matching
  // user roles
  if (record.sourceSystemRef && CSV_SOURCE_DEFAULT_ROLES[record.sourceSystemRef]) {
    const roles = CSV_SOURCE_DEFAULT_ROLES[record.sourceSystemRef];

    // Merge exisitng roles with default CSV roles, and de-dup using Set
    record.read = [...new Set([...record.read, ...roles])];
    record.write = [...new Set([...record.write, ...roles])];
    record.issuedTo.read = [...new Set([...record.issuedTo.read, ...roles])];
    record.issuedTo.write = [...new Set([...record.issuedTo.write, ...roles])];
  }
};


/**
 * Takes in an array of legislation objects and returns the sanitized array
 *
 * @param {Array<object>} incomingLegislationObjectArray the incoming array of legislation objects
 * @returns {Array<object>} recordLegislationArray the sanitized array of legislation objects
 */
exports.populateLegislation = function(incomingLegislationObjectArray) {
  let recordLegislationArray = [];

  if (incomingLegislationObjectArray && incomingLegislationObjectArray.length >= 1) {
    incomingLegislationObjectArray.forEach( (leg, index) => {

      recordLegislationArray.push({});

      leg.act &&
        (recordLegislationArray[index].act = leg.act);
      leg.regulation &&
        (recordLegislationArray[index].regulation = leg.regulation);
      leg.section &&
        (recordLegislationArray[index].section = leg.section);
      leg.subSection &&
        (recordLegislationArray[index].subSection = leg.subSection);
      leg.paragraph &&
        (recordLegislationArray[index].paragraph = leg.paragraph);
      leg.offence &&
        (recordLegislationArray[index].offence = leg.offence);
      leg.legislationDescription &&
        (recordLegislationArray[index].legislationDescription = leg.legislationDescription);
    });
  }

 return recordLegislationArray;
}
