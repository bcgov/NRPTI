let mongoose = require('mongoose');
let ObjectId = require('mongoose').Types.ObjectId;
let queryUtils = require('../../utils/query-utils');
let postUtils = require('../../utils/post-utils');

/**
 * Performs all operations necessary to create a master Court Conviction record and its associated flavour records.
 *
 * Example of incomingObj
 *
 *  courtConvictions: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'courtConviction',
 *      ...
 *      CourtConvictionLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      CourtConvictionNRCED: {
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
  let savedFlavourCourtConvictions = [];
  let flavourIds = [];

  try {
    incomingObj.CourtConvictionLNG &&
      observables.push(this.createLNG(args, res, next, { ...incomingObj, ...incomingObj.CourtConvictionLNG }));
    incomingObj.CourtConvictionNRCED &&
      observables.push(this.createNRCED(args, res, next, { ...incomingObj, ...incomingObj.CourtConvictionNRCED }));

    if (observables.length > 0) {
      savedFlavourCourtConvictions = await Promise.all(observables);

      flavourIds = savedFlavourCourtConvictions.map(flavourCourtConviction => flavourCourtConviction._id);
    }
  } catch (e) {
    return {
      status: 'failure',
      object: savedFlavourCourtConvictions,
      errorMessage: e.message
    };
  }

  // save courtConviction record
  let savedCourtConviction = null;

  try {
    savedCourtConviction = await this.createMaster(args, res, next, incomingObj, flavourIds);

    return {
      status: 'success',
      object: savedCourtConviction,
      flavours: savedFlavourCourtConvictions
    };
  } catch (e) {
    return {
      status: 'failure',
      object: savedCourtConviction,
      errorMessage: e.message
    };
  }
};

/**
 * Performs all operations necessary to create a master Court Conviction record.
 *
 * Example of incomingObj
 *
 *  courtConvictions: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'courtConviction',
 *      ...
 *      CourtConvictionLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      CourtConvictionNRCED: {
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
 * @returns created master courtConviction record
 */
exports.createMaster = async function(args, res, next, incomingObj, flavourIds) {
  let CourtConviction = mongoose.model('CourtConviction');
  let courtConviction = new CourtConviction();

  courtConviction._schemaName = 'CourtConviction';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (courtConviction._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (courtConviction._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (courtConviction._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  // set permissions
  courtConviction.read = ['sysadmin'];
  courtConviction.write = ['sysadmin'];

  // set forward references
  if (flavourIds && flavourIds.length) {
    flavourIds.forEach(id => {
      if (ObjectId.isValid(id)) {
        courtConviction._flavourRecords.push(new ObjectId(id));
      }
    });
  }

  // set data
  courtConviction.recordType = 'Court Conviction';
  courtConviction.recordSubtype && (courtConviction.recordSubtype = incomingObj.recordSubtype);
  incomingObj.dateIssued && (courtConviction.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (courtConviction.issuingAgency = incomingObj.issuingAgency);
  incomingObj.author && (courtConviction.author = incomingObj.author);

  incomingObj.legislation &&
    incomingObj.legislation.act &&
    (courtConviction.legislation.act = incomingObj.legislation.act);
  incomingObj.legislation &&
    incomingObj.legislation.regulation &&
    (courtConviction.legislation.regulation = incomingObj.legislation.regulation);
  incomingObj.legislation &&
    incomingObj.legislation.section &&
    (courtConviction.legislation.section = incomingObj.legislation.section);
  incomingObj.legislation &&
    incomingObj.legislation.subSection &&
    (courtConviction.legislation.subSection = incomingObj.legislation.subSection);
  incomingObj.legislation &&
    incomingObj.legislation.paragraph &&
    (courtConviction.legislation.paragraph = incomingObj.legislation.paragraph);

  incomingObj.offence && (courtConviction.offence = incomingObj.offence);

  courtConviction.issuedTo.read = ['sysadmin'];
  courtConviction.issuedTo.write = ['sysadmin'];
  incomingObj.issuedTo && incomingObj.issuedTo.type && (courtConviction.issuedTo.type = incomingObj.issuedTo.type);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.companyName &&
    (courtConviction.issuedTo.companyName = incomingObj.issuedTo.companyName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.firstName &&
    (courtConviction.issuedTo.firstName = incomingObj.issuedTo.firstName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.middleName &&
    (courtConviction.issuedTo.middleName = incomingObj.issuedTo.middleName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.lastName &&
    (courtConviction.issuedTo.lastName = incomingObj.issuedTo.lastName);
  incomingObj.issuedTo &&
    (courtConviction.issuedTo.fullName = postUtils.getIssuedToFullNameValue(incomingObj.issuedTo));
  incomingObj.issuedTo &&
    incomingObj.issuedTo.dateOfBirth &&
    (courtConviction.issuedTo.dateOfBirth = incomingObj.issuedTo.dateOfBirth);

  incomingObj.projectName && (courtConviction.projectName = incomingObj.projectName);
  incomingObj.location && (courtConviction.location = incomingObj.location);
  incomingObj.centroid && (courtConviction.centroid = incomingObj.centroid);
  incomingObj.penalties && (courtConviction.penalties = incomingObj.penalties);
  incomingObj.documents && (courtConviction.documents = incomingObj.documents);

  // set meta
  courtConviction.addedBy = args.swagger.params.auth_payload.displayName;
  courtConviction.dateAdded = new Date();

  // set data source references
  incomingObj.sourceDateAdded && (courtConviction.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (courtConviction.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (courtConviction.sourceSystemRef = incomingObj.sourceSystemRef);

  return await courtConviction.save();
};

/**
 * Performs all operations necessary to create a LNG Court Conviction record.
 *
 * Example of incomingObj
 *
 *  courtConvictions: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'courtConviction',
 *      ...
 *      CourtConvictionLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      CourtConvictionNRCED: {
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
 * @returns created lng courtConviction record
 */
exports.createLNG = async function(args, res, next, incomingObj) {
  let CourtConvictionLNG = mongoose.model('CourtConvictionLNG');
  let courtConvictionLNG = new CourtConvictionLNG();

  courtConvictionLNG._schemaName = 'CourtConvictionLNG';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (courtConvictionLNG._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (courtConvictionLNG._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (courtConvictionLNG._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  // set permissions and meta
  courtConvictionLNG.read = ['sysadmin'];
  courtConvictionLNG.write = ['sysadmin'];

  courtConvictionLNG.addedBy = args.swagger.params.auth_payload.displayName;
  courtConvictionLNG.dateAdded = new Date();

  // set master data
  incomingObj.recordName && (courtConvictionLNG.recordName = incomingObj.recordName);
  courtConvictionLNG.recordType = 'Court Conviction';
  incomingObj.recordSubtype && (courtConvictionLNG.recordSubtype = incomingObj.recordSubtype);
  incomingObj.dateIssued && (courtConvictionLNG.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (courtConvictionLNG.issuingAgency = incomingObj.issuingAgency);
  incomingObj.author && (courtConvictionLNG.author = incomingObj.author);

  incomingObj.legislation &&
    incomingObj.legislation.act &&
    (courtConvictionLNG.legislation.act = incomingObj.legislation.act);
  incomingObj.legislation &&
    incomingObj.legislation.regulation &&
    (courtConvictionLNG.legislation.regulation = incomingObj.legislation.regulation);
  incomingObj.legislation &&
    incomingObj.legislation.section &&
    (courtConvictionLNG.legislation.section = incomingObj.legislation.section);
  incomingObj.legislation &&
    incomingObj.legislation.subSection &&
    (courtConvictionLNG.legislation.subSection = incomingObj.legislation.subSection);
  incomingObj.legislation &&
    incomingObj.legislation.paragraph &&
    (courtConvictionLNG.legislation.paragraph = incomingObj.legislation.paragraph);

  incomingObj.offence && (courtConvictionLNG.offence = incomingObj.offence);

  courtConvictionLNG.issuedTo.read = ['sysadmin'];
  courtConvictionLNG.issuedTo.write = ['sysadmin'];
  incomingObj.issuedTo && incomingObj.issuedTo.type && (courtConvictionLNG.issuedTo.type = incomingObj.issuedTo.type);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.companyName &&
    (courtConvictionLNG.issuedTo.companyName = incomingObj.issuedTo.companyName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.firstName &&
    (courtConvictionLNG.issuedTo.firstName = incomingObj.issuedTo.firstName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.middleName &&
    (courtConvictionLNG.issuedTo.middleName = incomingObj.issuedTo.middleName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.lastName &&
    (courtConvictionLNG.issuedTo.lastName = incomingObj.issuedTo.lastName);
  incomingObj.issuedTo &&
    (courtConvictionLNG.issuedTo.fullName = postUtils.getIssuedToFullNameValue(incomingObj.issuedTo));
  incomingObj.issuedTo &&
    incomingObj.issuedTo.dateOfBirth &&
    (courtConvictionLNG.issuedTo.dateOfBirth = incomingObj.issuedTo.dateOfBirth);

  incomingObj.projectName && (courtConvictionLNG.projectName = incomingObj.projectName);
  incomingObj.location && (courtConvictionLNG.location = incomingObj.location);
  incomingObj.centroid && (courtConvictionLNG.centroid = incomingObj.centroid);
  incomingObj.penalties && (courtConvictionLNG.penalties = incomingObj.penalties);
  incomingObj.documents && (courtConvictionLNG.documents = incomingObj.documents);

  // set flavour data
  incomingObj.description && (courtConvictionLNG.description = incomingObj.description);

  // set data source references
  incomingObj.sourceDateAdded && (courtConvictionLNG.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (courtConvictionLNG.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (courtConvictionLNG.sourceSystemRef = incomingObj.sourceSystemRef);

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    courtConvictionLNG.read.push('public');
    courtConvictionLNG.datePublished = new Date();
    courtConvictionLNG.publishedBy = args.swagger.params.auth_payload.displayName;

    if (!queryUtils.isRecordAnonymous(courtConvictionLNG)) {
      courtConvictionLNG.issuedTo.read.push('public');
    }
  }

  return await courtConvictionLNG.save();
};

/**
 * Performs all operations necessary to create a NRCED Court Conviction record.
 *
 * Example of incomingObj
 *
 *  courtConvictions: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'courtConviction',
 *      ...
 *      CourtConvictionLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      CourtConvictionNRCED: {
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
 * @returns created nrced courtConviction record
 */
exports.createNRCED = async function(args, res, next, incomingObj) {
  let CourtConvictionNRCED = mongoose.model('CourtConvictionNRCED');
  let courtConvictionNRCED = new CourtConvictionNRCED();

  courtConvictionNRCED._schemaName = 'CourtConvictionNRCED';

  // set integration references
  incomingObj._epicProjectId &&
    ObjectId.isValid(incomingObj._epicProjectId) &&
    (courtConvictionNRCED._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId &&
    ObjectId.isValid(incomingObj._sourceRefId) &&
    (courtConvictionNRCED._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId &&
    ObjectId.isValid(incomingObj._epicMilestoneId) &&
    (courtConvictionNRCED._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  // set permissions and meta
  courtConvictionNRCED.read = ['sysadmin'];
  courtConvictionNRCED.write = ['sysadmin'];

  courtConvictionNRCED.addedBy = args.swagger.params.auth_payload.displayName;
  courtConvictionNRCED.dateAdded = new Date();

  // set master data
  courtConvictionNRCED.recordType = 'Court Conviction';
  incomingObj.recordSubtype && (courtConvictionNRCED.recordSubtype = incomingObj.recordSubtype);
  incomingObj.dateIssued && (courtConvictionNRCED.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (courtConvictionNRCED.issuingAgency = incomingObj.issuingAgency);
  incomingObj.author && (courtConvictionNRCED.author = incomingObj.author);

  incomingObj.legislation &&
    incomingObj.legislation.act &&
    (courtConvictionNRCED.legislation.act = incomingObj.legislation.act);
  incomingObj.legislation &&
    incomingObj.legislation.regulation &&
    (courtConvictionNRCED.legislation.regulation = incomingObj.legislation.regulation);
  incomingObj.legislation &&
    incomingObj.legislation.section &&
    (courtConvictionNRCED.legislation.section = incomingObj.legislation.section);
  incomingObj.legislation &&
    incomingObj.legislation.subSection &&
    (courtConvictionNRCED.legislation.subSection = incomingObj.legislation.subSection);
  incomingObj.legislation &&
    incomingObj.legislation.paragraph &&
    (courtConvictionNRCED.legislation.paragraph = incomingObj.legislation.paragraph);

  incomingObj.offence && (courtConvictionNRCED.offence = incomingObj.offence);

  courtConvictionNRCED.issuedTo.read = ['sysadmin'];
  courtConvictionNRCED.issuedTo.write = ['sysadmin'];
  incomingObj.issuedTo && incomingObj.issuedTo.type && (courtConvictionNRCED.issuedTo.type = incomingObj.issuedTo.type);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.companyName &&
    (courtConvictionNRCED.issuedTo.companyName = incomingObj.issuedTo.companyName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.firstName &&
    (courtConvictionNRCED.issuedTo.firstName = incomingObj.issuedTo.firstName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.middleName &&
    (courtConvictionNRCED.issuedTo.middleName = incomingObj.issuedTo.middleName);
  incomingObj.issuedTo &&
    incomingObj.issuedTo.lastName &&
    (courtConvictionNRCED.issuedTo.lastName = incomingObj.issuedTo.lastName);
  incomingObj.issuedTo &&
    (courtConvictionNRCED.issuedTo.fullName = postUtils.getIssuedToFullNameValue(incomingObj.issuedTo));
  incomingObj.issuedTo &&
    incomingObj.issuedTo.dateOfBirth &&
    (courtConvictionNRCED.issuedTo.dateOfBirth = incomingObj.issuedTo.dateOfBirth);

  incomingObj.projectName && (courtConvictionNRCED.projectName = incomingObj.projectName);
  incomingObj.location && (courtConvictionNRCED.location = incomingObj.location);
  incomingObj.centroid && (courtConvictionNRCED.centroid = incomingObj.centroid);
  incomingObj.penalties && (courtConvictionNRCED.penalties = incomingObj.penalties);
  incomingObj.documents && (courtConvictionNRCED.documents = incomingObj.documents);

  // set flavour data
  incomingObj.summary && (courtConvictionNRCED.summary = incomingObj.summary);

  // set data source references
  incomingObj.sourceDateAdded && (courtConvictionNRCED.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (courtConvictionNRCED.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (courtConvictionNRCED.sourceSystemRef = incomingObj.sourceSystemRef);

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    courtConvictionNRCED.read.push('public');
    courtConvictionNRCED.datePublished = new Date();
    courtConvictionNRCED.publishedBy = args.swagger.params.auth_payload.displayName;

    if (!queryUtils.isRecordAnonymous(courtConvictionNRCED)) {
      courtConvictionNRCED.issuedTo.read.push('public');
    }
  }

  return await courtConvictionNRCED.save();
};
