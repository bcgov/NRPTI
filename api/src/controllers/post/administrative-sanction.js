let mongoose = require('mongoose');
let ObjectId = require('mongoose').Types.ObjectId;
let queryUtils = require('../../utils/query-utils');
let postUtils = require('../../utils/post-utils');

/**
 * Performs all operations necessary to create a master Administrative Sanction record and its associated flavour records.
 *
 * Example of incomingObj
 *
 *  administrativeSanctions: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'administrativeSanction',
 *      ...
 *      AdministrativeSanctionLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      AdministrativeSanctionNRCED: {
 *        summary: 'nrced summary',
 *        addRole: 'public'
 *        ...
 *      }
 *    }
 *  ]
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @param {*} incomingObj see example
 * @returns object containing the operation's status and created records
 */
exports.createRecord = async function(args, res, next, incomingObj) {
  // save flavour records
  let observables = [];
  let savedFlavourAdministrativeSanctions = [];
  let flavourIds = [];

  try {
    incomingObj.AdministrativeSanctionLNG &&
      observables.push(this.createLNG(args, res, next, { ...incomingObj, ...incomingObj.AdministrativeSanctionLNG }));
    incomingObj.AdministrativeSanctionNRCED &&
      observables.push(
        this.createNRCED(args, res, next, { ...incomingObj, ...incomingObj.AdministrativeSanctionNRCED })
      );

    if (observables.length > 0) {
      savedFlavourAdministrativeSanctions = await Promise.all(observables);

      flavourIds = savedFlavourAdministrativeSanctions.map(
        flavourAdministrativeSanction => flavourAdministrativeSanction._id
      );
    }
  } catch (e) {
    return {
      status: 'failure',
      object: savedFlavourAdministrativeSanctions,
      errorMessage: e
    };
  }

  // save administrativeSanction record
  let savedAdministrativeSanction = null;

  try {
    savedAdministrativeSanction = await this.createMaster(args, res, next, incomingObj, flavourIds);

    return {
      status: 'success',
      object: savedAdministrativeSanction,
      flavours: savedFlavourAdministrativeSanctions
    };
  } catch (e) {
    return {
      status: 'failure',
      object: savedAdministrativeSanction,
      errorMessage: e
    };
  }
};

/**
 * Performs all operations necessary to create a master Administrative Sanction record.
 *
 * Example of incomingObj
 *
 *  administrativeSanctions: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'administrativeSanction',
 *      ...
 *      AdministrativeSanctionLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      AdministrativeSanctionNRCED: {
 *        summary: 'nrced summary',
 *        addRole: 'public'
 *        ...
 *      }
 *    }
 *  ]
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @param {*} incomingObj see example
 * @param {*} flavourIds array of flavour record _ids
 * @returns created master administrativeSanction record
 */
exports.createMaster = async function(args, res, next, incomingObj, flavourIds) {
  let AdministrativeSanction = mongoose.model('AdministrativeSanction');
  let administrativeSanction = new AdministrativeSanction();

  administrativeSanction._schemaName = 'AdministrativeSanction';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (administrativeSanction._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (administrativeSanction._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (administrativeSanction._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  // set permissions
  administrativeSanction.read = ['sysadmin'];
  administrativeSanction.write = ['sysadmin'];

  // set forward references
  if (flavourIds && flavourIds.length) {
    flavourIds.forEach(id => {
      if (ObjectId.isValid(id)) {
        administrativeSanction._flavourRecords.push(new ObjectId(id));
      }
    });
  }

  // set data
  incomingObj.recordName && (administrativeSanction.recordName = incomingObj.recordName);
  administrativeSanction.recordType = 'Administrative Sanction';
  incomingObj.dateIssued && (administrativeSanction.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (administrativeSanction.issuingAgency = incomingObj.issuingAgency);
  incomingObj.author && (administrativeSanction.author = incomingObj.author);

  incomingObj.legislation &&
    incomingObj.legislation.act &&
    (administrativeSanction.legislation.act = incomingObj.legislation.act);
  incomingObj.legislation &&
    incomingObj.legislation.regulation &&
    (administrativeSanction.legislation.regulation = incomingObj.legislation.regulation);
  incomingObj.legislation &&
    incomingObj.legislation.section &&
    (administrativeSanction.legislation.section = incomingObj.legislation.section);
  incomingObj.legislation &&
    incomingObj.legislation.subSection &&
    (administrativeSanction.legislation.subSection = incomingObj.legislation.subSection);
  incomingObj.legislation &&
    incomingObj.legislation.paragraph &&
    (administrativeSanction.legislation.paragraph = incomingObj.legislation.paragraph);

  administrativeSanction.issuedTo.read = ['sysadmin'];
  administrativeSanction.issuedTo.write = ['sysadmin'];
  incomingObj.issuedTo &&
    incomingObj.issuedTo.type &&
    (administrativeSanction.issuedTo.type = incomingObj.issuedTo.type);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.companyName &&
    (administrativeSanction.issuedTo.companyName = incomingObj.issuedTo.companyName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.firstName &&
    (administrativeSanction.issuedTo.firstName = incomingObj.issuedTo.firstName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.middleName &&
    (administrativeSanction.issuedTo.middleName = incomingObj.issuedTo.middleName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.lastName &&
    (administrativeSanction.issuedTo.lastName = incomingObj.issuedTo.lastName);
  incomingObj.issuedTo &&
    (administrativeSanction.issuedTo.fullName = postUtils.getIssuedToFullNameValue(incomingObj.issuedTo));
  incomingObj.issuedTo &&
    incomingObj.issuedTo.dateOfBirth &&
    (administrativeSanction.issuedTo.dateOfBirth = incomingObj.issuedTo.dateOfBirth);

  incomingObj.projectName && (administrativeSanction.projectName = incomingObj.projectName);
  incomingObj.location && (administrativeSanction.location = incomingObj.location);
  incomingObj.centroid && (administrativeSanction.centroid = incomingObj.centroid);
  incomingObj.outcomeStatus && (administrativeSanction.outcomeStatus = incomingObj.outcomeStatus);
  incomingObj.outcomeDescription && (administrativeSanction.outcomeDescription = incomingObj.outcomeDescription);
  incomingObj.penalty && (administrativeSanction.penalty = incomingObj.penalty);

  // set meta
  administrativeSanction.addedBy = args.swagger.params.auth_payload.displayName;
  administrativeSanction.dateAdded = new Date();

  // set data source references
  incomingObj.sourceDateAdded && (administrativeSanction.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (administrativeSanction.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (administrativeSanction.sourceSystemRef = incomingObj.sourceSystemRef);

  return await administrativeSanction.save();
};

/**
 * Performs all operations necessary to create a LNG Administrative Sanction record.
 *
 * Example of incomingObj
 *
 *  administrativeSanctions: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'administrativeSanction',
 *      ...
 *      AdministrativeSanctionLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      AdministrativeSanctionNRCED: {
 *        summary: 'nrced summary',
 *        addRole: 'public'
 *        ...
 *      }
 *    }
 *  ]
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @param {*} incomingObj see example
 * @returns created lng administrativeSanction record
 */
exports.createLNG = async function(args, res, next, incomingObj) {
  let AdministrativeSanctionLNG = mongoose.model('AdministrativeSanctionLNG');
  let administrativeSanctionLNG = new AdministrativeSanctionLNG();

  administrativeSanctionLNG._schemaName = 'AdministrativeSanctionLNG';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (administrativeSanctionLNG._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (administrativeSanctionLNG._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (administrativeSanctionLNG._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  // set permissions and meta
  administrativeSanctionLNG.read = ['sysadmin'];
  administrativeSanctionLNG.write = ['sysadmin'];

  administrativeSanctionLNG.addedBy = args.swagger.params.auth_payload.displayName;
  administrativeSanctionLNG.dateAdded = new Date();

  // set master data
  incomingObj.recordName && (administrativeSanctionLNG.recordName = incomingObj.recordName);
  administrativeSanctionLNG.recordType = 'Administrative Sanction';
  incomingObj.dateIssued && (administrativeSanctionLNG.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (administrativeSanctionLNG.issuingAgency = incomingObj.issuingAgency);
  incomingObj.author && (administrativeSanctionLNG.author = incomingObj.author);

  incomingObj.legislation &&
    incomingObj.legislation.act &&
    (administrativeSanctionLNG.legislation.act = incomingObj.legislation.act);
  incomingObj.legislation &&
    incomingObj.legislation.regulation &&
    (administrativeSanctionLNG.legislation.regulation = incomingObj.legislation.regulation);
  incomingObj.legislation &&
    incomingObj.legislation.section &&
    (administrativeSanctionLNG.legislation.section = incomingObj.legislation.section);
  incomingObj.legislation &&
    incomingObj.legislation.subSection &&
    (administrativeSanctionLNG.legislation.subSection = incomingObj.legislation.subSection);
  incomingObj.legislation &&
    incomingObj.legislation.paragraph &&
    (administrativeSanctionLNG.legislation.paragraph = incomingObj.legislation.paragraph);

  administrativeSanctionLNG.issuedTo.read = ['sysadmin'];
  administrativeSanctionLNG.issuedTo.write = ['sysadmin'];
  incomingObj.issuedTo &&
    incomingObj.issuedTo.type &&
    (administrativeSanctionLNG.issuedTo.type = incomingObj.issuedTo.type);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.companyName &&
    (administrativeSanctionLNG.issuedTo.companyName = incomingObj.issuedTo.companyName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.firstName &&
    (administrativeSanctionLNG.issuedTo.firstName = incomingObj.issuedTo.firstName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.middleName &&
    (administrativeSanctionLNG.issuedTo.middleName = incomingObj.issuedTo.middleName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.lastName &&
    (administrativeSanctionLNG.issuedTo.lastName = incomingObj.issuedTo.lastName);
  incomingObj.issuedTo &&
    (administrativeSanctionLNG.issuedTo.fullName = postUtils.getIssuedToFullNameValue(incomingObj.issuedTo));
  incomingObj.issuedTo &&
    incomingObj.issuedTo.dateOfBirth &&
    (administrativeSanctionLNG.issuedTo.dateOfBirth = incomingObj.issuedTo.dateOfBirth);

  incomingObj.projectName && (administrativeSanctionLNG.projectName = incomingObj.projectName);
  incomingObj.location && (administrativeSanctionLNG.location = incomingObj.location);
  incomingObj.centroid && (administrativeSanctionLNG.centroid = incomingObj.centroid);
  incomingObj.outcomeStatus && (administrativeSanctionLNG.outcomeStatus = incomingObj.outcomeStatus);
  incomingObj.outcomeDescription && (administrativeSanctionLNG.outcomeDescription = incomingObj.outcomeDescription);
  incomingObj.penalty && (administrativeSanctionLNG.penalty = incomingObj.penalty);

  // set flavour data
  incomingObj.description && (administrativeSanctionLNG.description = incomingObj.description);

  // set data source references
  incomingObj.sourceDateAdded && (administrativeSanctionLNG.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (administrativeSanctionLNG.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (administrativeSanctionLNG.sourceSystemRef = incomingObj.sourceSystemRef);

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    administrativeSanctionLNG.read.push('public');
    administrativeSanctionLNG.datePublished = new Date();
    administrativeSanctionLNG.publishedBy = args.swagger.params.auth_payload.displayName;

    if (!queryUtils.isRecordAnonymous(administrativeSanctionLNG)) {
      administrativeSanctionLNG.issuedTo.read.push('public');
    }
  }

  return await administrativeSanctionLNG.save();
};

/**
 * Performs all operations necessary to create a NRCED Administrative Sanction record.
 *
 * Example of incomingObj
 *
 *  administrativeSanctions: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'administrativeSanction',
 *      ...
 *      AdministrativeSanctionLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      AdministrativeSanctionNRCED: {
 *        summary: 'nrced summary',
 *        addRole: 'public'
 *        ...
 *      }
 *    }
 *  ]
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @param {*} incomingObj see example
 * @returns created nrced administrativeSanction record
 */
exports.createNRCED = async function(args, res, next, incomingObj) {
  let AdministrativeSanctionNRCED = mongoose.model('AdministrativeSanctionNRCED');
  let administrativeSanctionNRCED = new AdministrativeSanctionNRCED();

  administrativeSanctionNRCED._schemaName = 'AdministrativeSanctionNRCED';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (administrativeSanctionNRCED._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (administrativeSanctionNRCED._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (administrativeSanctionNRCED._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  // set permissions and meta
  administrativeSanctionNRCED.read = ['sysadmin'];
  administrativeSanctionNRCED.write = ['sysadmin'];

  administrativeSanctionNRCED.addedBy = args.swagger.params.auth_payload.displayName;
  administrativeSanctionNRCED.dateAdded = new Date();

  // set master data
  incomingObj.recordName && (administrativeSanctionNRCED.recordName = incomingObj.recordName);
  administrativeSanctionNRCED.recordType = 'Administrative Sanction';
  incomingObj.dateIssued && (administrativeSanctionNRCED.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (administrativeSanctionNRCED.issuingAgency = incomingObj.issuingAgency);
  incomingObj.author && (administrativeSanctionNRCED.author = incomingObj.author);

  incomingObj.legislation &&
    incomingObj.legislation.act &&
    (administrativeSanctionNRCED.legislation.act = incomingObj.legislation.act);
  incomingObj.legislation &&
    incomingObj.legislation.regulation &&
    (administrativeSanctionNRCED.legislation.regulation = incomingObj.legislation.regulation);
  incomingObj.legislation &&
    incomingObj.legislation.section &&
    (administrativeSanctionNRCED.legislation.section = incomingObj.legislation.section);
  incomingObj.legislation &&
    incomingObj.legislation.subSection &&
    (administrativeSanctionNRCED.legislation.subSection = incomingObj.legislation.subSection);
  incomingObj.legislation &&
    incomingObj.legislation.paragraph &&
    (administrativeSanctionNRCED.legislation.paragraph = incomingObj.legislation.paragraph);

  administrativeSanctionNRCED.issuedTo.read = ['sysadmin'];
  administrativeSanctionNRCED.issuedTo.write = ['sysadmin'];
  incomingObj.issuedTo &&
    incomingObj.issuedTo.type &&
    (administrativeSanctionNRCED.issuedTo.type = incomingObj.issuedTo.type);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.companyName &&
    (administrativeSanctionNRCED.issuedTo.companyName = incomingObj.issuedTo.companyName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.firstName &&
    (administrativeSanctionNRCED.issuedTo.firstName = incomingObj.issuedTo.firstName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.middleName &&
    (administrativeSanctionNRCED.issuedTo.middleName = incomingObj.issuedTo.middleName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.lastName &&
    (administrativeSanctionNRCED.issuedTo.lastName = incomingObj.issuedTo.lastName);
  incomingObj.issuedTo &&
    (administrativeSanctionNRCED.issuedTo.fullName = postUtils.getIssuedToFullNameValue(incomingObj.issuedTo));
  incomingObj.issuedTo &&
    incomingObj.issuedTo.dateOfBirth &&
    (administrativeSanctionNRCED.issuedTo.dateOfBirth = incomingObj.issuedTo.dateOfBirth);

  incomingObj.projectName && (administrativeSanctionNRCED.projectName = incomingObj.projectName);
  incomingObj.location && (administrativeSanctionNRCED.location = incomingObj.location);
  incomingObj.centroid && (administrativeSanctionNRCED.centroid = incomingObj.centroid);
  incomingObj.outcomeStatus && (administrativeSanctionNRCED.outcomeStatus = incomingObj.outcomeStatus);
  incomingObj.outcomeDescription && (administrativeSanctionNRCED.outcomeDescription = incomingObj.outcomeDescription);
  incomingObj.penalty && (administrativeSanctionNRCED.penalty = incomingObj.penalty);

  // set flavour data
  incomingObj.summary && (administrativeSanctionNRCED.summary = incomingObj.summary);

  // set data source references
  incomingObj.sourceDateAdded && (administrativeSanctionNRCED.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (administrativeSanctionNRCED.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (administrativeSanctionNRCED.sourceSystemRef = incomingObj.sourceSystemRef);

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    administrativeSanctionNRCED.read.push('public');
    administrativeSanctionNRCED.datePublished = new Date();
    administrativeSanctionNRCED.publishedBy = args.swagger.params.auth_payload.displayName;

    if (!queryUtils.isRecordAnonymous(administrativeSanctionNRCED)) {
      administrativeSanctionNRCED.issuedTo.read.push('public');
    }
  }

  return await administrativeSanctionNRCED.save();
};
