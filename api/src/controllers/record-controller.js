'use strict';

let queryActions = require('../utils/query-actions');
let queryUtils = require('../utils/query-utils');

let defaultLog = require('../utils/logger')('record');

let AddOrder = require('./post/order');
let AddInspection = require('./post/inspection');
let AddCertificate = require('./post/certificate');
let AddPermit = require('./post/permit');
let AddAgreement = require('./post/agreement');
let AddSelfReport = require('./post/self-report');
let AddRestorativeJustice = require('./post/restorative-justice');
let AddTicket = require('./post/ticket');
let AddAdministrativePenalty = require('./post/administrative-penalty');
let AddAdministrativeSanction = require('./post/administrative-sanction');
let AddWarning = require('./post/warning');
let AddConstructionPlan = require('./post/construction-plan');
let AddManagementPlan = require('./post/management-plan');
let AddCourtConviction = require('./post/court-conviction');

let EditOrder = require('./put/order');
let EditInspection = require('./put/inspection');
let EditCertificate = require('./put/certificate');
let EditPermit = require('./put/permit');
let EditAgreement = require('./put/agreement');
let EditSelfReport = require('./put/self-report');
let EditRestorativeJustice = require('./put/restorative-justice');
let EditTicket = require('./put/ticket');
let EditAdministrativePenalty = require('./put/administrative-penalty');
let EditAdministrativeSanction = require('./put/administrative-sanction');
let EditWarning = require('./put/warning');
let EditConstructionPlan = require('./put/construction-plan');
let EditManagementPlan = require('./put/management-plan');
let EditCourtConviction = require('./put/court-conviction');

// let allowedFields = ['_createdBy', 'createdDate', 'description', 'publishDate', 'type'];

// Authenticated Requests

/**
 * TODO: populate this documentation
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 */
exports.protectedOptions = function(args, res, next) {
  res.status(200).send();
};

/**
 * TODO: populate this documentation
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.protectedGet = function(args, res, next) {
  return queryActions.sendResponse(res, 501);
};

/**
 * TODO: populate this documentation
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 */
/**
 * Example of args.swagger.params.data.value
 * {
 *   orders: [
 *     {
 *       recordName: 'test abc',
 *       recordType: 'whatever',
 *       ...
 *       OrderLNG: {
 *          description: 'lng description'
 *          addRole: 'public',
 *       }
 *     },
 *     {
 *       recordName: 'this is a name',
 *       recordType: 'this is a type',
 *       ...
 *     }
 *   ],
 *   inspections: [
 *     {
 *       recordName: 'test 123',
 *       recordType: 'test type',
 *       ...
 *     },
 *     {
 *       recordName: 'inspection test name',
 *       recordType: 'inspection type',
 *       ...
 *     },
 *     ...
 *   ],
 *   authorizations: [...],
 *   ...
 * }
 */
exports.protectedPost = async function(args, res, next) {
  let observables = [];

  if (args.swagger.params.data && args.swagger.params.data.value) {
    let data = args.swagger.params.data.value;

    // We handle document logic when we add or remove documents not when we add/edit record
    for (const property of Object.keys(data)) {
      data[property].forEach(element => {
        delete element.documents;
      });
    }

    if (data.orders) {
      observables.push(processPostRequest(args, res, next, 'orders', data.orders));
    }
    if (data.inspections) {
      observables.push(processPostRequest(args, res, next, 'inspections', data.inspections));
    }
    if (data.certificates) {
      observables.push(processPostRequest(args, res, next, 'certificates', data.certificates));
    }
    if (data.permits) {
      observables.push(processPostRequest(args, res, next, 'permits', data.permits));
    }
    if (data.agreements) {
      observables.push(processPostRequest(args, res, next, 'agreements', data.agreements));
    }
    if (data.selfReports) {
      observables.push(processPostRequest(args, res, next, 'selfReports', data.selfReports));
    }
    if (data.restorativeJustices) {
      observables.push(processPostRequest(args, res, next, 'restorativeJustices', data.restorativeJustices));
    }
    if (data.tickets) {
      observables.push(processPostRequest(args, res, next, 'tickets', data.tickets));
    }
    if (data.administrativePenalties) {
      observables.push(processPostRequest(args, res, next, 'administrativePenalties', data.administrativePenalties));
    }
    if (data.administrativeSanctions) {
      observables.push(processPostRequest(args, res, next, 'administrativeSanctions', data.administrativeSanctions));
    }
    if (data.warnings) {
      observables.push(processPostRequest(args, res, next, 'warnings', data.warnings));
    }
    if (data.constructionPlans) {
      observables.push(processPostRequest(args, res, next, 'constructionPlans', data.constructionPlans));
    }
    if (data.managementPlans) {
      observables.push(processPostRequest(args, res, next, 'managementPlans', data.managementPlans));
    }
    if (data.courtConvictions) {
      observables.push(processPostRequest(args, res, next, 'courtConvictions', data.courtConvictions));
    }

    let response = await Promise.all(observables);

    return queryActions.sendResponse(res, 200, response);
  } else {
    return queryActions.sendResponse(res, 500, { error: 'You must provide data' });
  }
};

/**
 * TODO: populate this documentation
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 */
exports.protectedPut = async function(args, res, next) {
  let observables = [];

  if (args.swagger.params.data && args.swagger.params.data.value) {
    let data = args.swagger.params.data.value;

    // We handle document logic when we add or remove documents not when we add/edit record
    for (const property of Object.keys(data)) {
      data[property].forEach(element => {
        delete element.documents;
      });
    }

    if (data.orders) {
      observables.push(processPutRequest(args, res, next, 'orders', data.orders));
    }
    if (data.inspections) {
      observables.push(processPutRequest(args, res, next, 'inspections', data.inspections));
    }
    if (data.certificates) {
      observables.push(processPutRequest(args, res, next, 'certificates', data.certificates));
    }
    if (data.permits) {
      observables.push(processPutRequest(args, res, next, 'permits', data.permits));
    }
    if (data.agreements) {
      observables.push(processPutRequest(args, res, next, 'agreements', data.agreements));
    }
    if (data.selfReports) {
      observables.push(processPutRequest(args, res, next, 'selfReports', data.selfReports));
    }
    if (data.restorativeJustices) {
      observables.push(processPutRequest(args, res, next, 'restorativeJustices', data.restorativeJustices));
    }
    if (data.tickets) {
      observables.push(processPutRequest(args, res, next, 'tickets', data.tickets));
    }
    if (data.administrativePenalties) {
      observables.push(processPutRequest(args, res, next, 'administrativePenalties', data.administrativePenalties));
    }
    if (data.administrativeSanctions) {
      observables.push(processPutRequest(args, res, next, 'administrativeSanctions', data.administrativeSanctions));
    }
    if (data.warnings) {
      observables.push(processPutRequest(args, res, next, 'warnings', data.warnings));
    }
    if (data.constructionPlans) {
      observables.push(processPutRequest(args, res, next, 'constructionPlans', data.constructionPlans));
    }
    if (data.managementPlans) {
      observables.push(processPutRequest(args, res, next, 'managementPlans', data.managementPlans));
    }
    if (data.courtConvictions) {
      observables.push(processPutRequest(args, res, next, 'courtConvictions', data.courtConvictions));
    }

    let response = await Promise.all(observables);

    return queryActions.sendResponse(res, 200, response);
  } else {
    return queryActions.sendResponse(res, 500, { error: 'You must provide data' });
  }
};

/**
 * TODO: populate this documentation
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 */
exports.protectedDelete = function(args, res, next) {
  return queryActions.sendResponse(res, 501);
};

/**
 * Publish a record.
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 */
exports.protectedPublish = async function(args, res, next) {
  try {
    const recordData = args.swagger.params.record.value;
    defaultLog.info(`protectedPublish - recordId: ${recordData._id}`);

    const model = require('mongoose').model(recordData._schemaName);

    const record = await model.findOne({ _id: recordData._id });

    if (!record) {
      defaultLog.info(`protectedPublish - couldn't find record for recordId: ${record._id}`);
      return queryActions.sendResponse(res, 404, {});
    }

    defaultLog.debug(`protectedPublish - record: ${JSON.stringify(record)}`);

    // add entity read role
    if (!queryActions.isPublished(record.issuedTo)) {
      if (!queryUtils.isRecordAnonymous(record)) {
        // make entity information public
        queryActions.addPublicReadRole(record.issuedTo);
      }
    }

    const published = await queryActions.publish(record, true);

    await queryUtils.recordAction('Publish', record, args.swagger.params.auth_payload.preferred_username, record._id);

    return queryActions.sendResponse(res, 200, published);
  } catch (error) {
    return queryActions.sendResponse(res, 500, error);
  }
};

/**
 * Unpublish a record.
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 */
exports.protectedUnPublish = async function(args, res, next) {
  try {
    const recordData = args.swagger.params.record.value;
    defaultLog.info(`protectedUnPublish - recordId: ${recordData._id}`);

    const model = require('mongoose').model(recordData._schemaName);

    const record = await model.findOne({ _id: recordData._id });

    if (!record) {
      defaultLog.info(`protectedUnPublish - couldn't find record for recordId: ${record._id}`);
      return queryActions.sendResponse(res, 404, {});
    }

    defaultLog.debug(`protectedUnPublish - record: ${JSON.stringify(record)}`);

    // remove entity read role
    if (queryActions.isPublished(record.issuedTo)) {
      queryActions.removePublicReadRole(record.issuedTo);
    }

    const unPublished = await queryActions.unPublish(record);

    await queryUtils.recordAction('UnPublish', record, args.swagger.params.auth_payload.preferred_username, record._id);

    return queryActions.sendResponse(res, 200, unPublished);
  } catch (error) {
    return queryActions.sendResponse(res, 500, error);
  }
};

// Public Requests

/**
 * TODO: populate this documentation
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.publicGet = function(args, res, next) {
  return queryActions.sendResponse(res, 501);
};

const processPostRequest = async function(args, res, next, property, data) {
  if (data.length === 0) {
    return {
      status: 'success',
      object: {}
    };
  }

  let i = data.length - 1;
  let observables = [];

  do {
    switch (property) {
      case 'orders':
        observables.push(AddOrder.createRecord(args, res, next, data[i]));
        break;
      case 'inspections':
        observables.push(AddInspection.createRecord(args, res, next, data[i]));
        break;
      case 'certificates':
        observables.push(AddCertificate.createRecord(args, res, next, data[i]));
        break;
      case 'permits':
        observables.push(AddPermit.createRecord(args, res, next, data[i]));
        break;
      case 'agreements':
        observables.push(AddAgreement.createRecord(args, res, next, data[i]));
        break;
      case 'selfReports':
        observables.push(AddSelfReport.createRecord(args, res, next, data[i]));
        break;
      case 'restorativeJustices':
        observables.push(AddRestorativeJustice.createRecord(args, res, next, data[i]));
        break;
      case 'tickets':
        observables.push(AddTicket.createRecord(args, res, next, data[i]));
        break;
      case 'administrativePenalties':
        observables.push(AddAdministrativePenalty.createRecord(args, res, next, data[i]));
        break;
      case 'administrativeSanctions':
        observables.push(AddAdministrativeSanction.createRecord(args, res, next, data[i]));
        break;
      case 'warnings':
        observables.push(AddWarning.createRecord(args, res, next, data[i]));
        break;
      case 'constructionPlans':
        observables.push(AddConstructionPlan.createRecord(args, res, next, data[i]));
        break;
      case 'managementPlans':
        observables.push(AddManagementPlan.createRecord(args, res, next, data[i]));
        break;
      case 'courtConvictions':
        observables.push(AddCourtConviction.createRecord(args, res, next, data[i]));
        break;
      default:
        return {
          errorMessage: `Property ${property} does not exist.`
        };
    }
  } while (i-- > 0);

  try {
    return await Promise.all(observables);
  } catch (e) {
    return {
      status: 'failure',
      object: observables,
      errorMessage: e.message
    };
  }
};

exports.processPostRequest = processPostRequest;

const processPutRequest = async function(args, res, next, property, data) {
  if (data.length === 0) {
    return {
      status: 'success',
      object: {}
    };
  }

  let i = data.length - 1;
  let observables = [];

  do {
    switch (property) {
      case 'orders':
        observables.push(EditOrder.editRecord(args, res, next, data[i]));
        break;
      case 'inspections':
        observables.push(EditInspection.editRecord(args, res, next, data[i]));
        break;
      case 'certificates':
        observables.push(EditCertificate.editRecord(args, res, next, data[i]));
        break;
      case 'permits':
        observables.push(EditPermit.editRecord(args, res, next, data[i]));
        break;
      case 'agreements':
        observables.push(EditAgreement.editRecord(args, res, next, data[i]));
        break;
      case 'selfReports':
        observables.push(EditSelfReport.editRecord(args, res, next, data[i]));
        break;
      case 'restorativeJustices':
        observables.push(EditRestorativeJustice.editRecord(args, res, next, data[i]));
        break;
      case 'tickets':
        observables.push(EditTicket.editRecord(args, res, next, data[i]));
        break;
      case 'administrativePenalties':
        observables.push(EditAdministrativePenalty.editRecord(args, res, next, data[i]));
        break;
      case 'administrativeSanctions':
        observables.push(EditAdministrativeSanction.editRecord(args, res, next, data[i]));
        break;
      case 'warnings':
        observables.push(EditWarning.editRecord(args, res, next, data[i]));
        break;
      case 'constructionPlans':
        observables.push(EditConstructionPlan.editRecord(args, res, next, data[i]));
        break;
      case 'managementPlans':
        observables.push(EditManagementPlan.editRecord(args, res, next, data[i]));
        break;
      case 'courtConvictions':
        observables.push(EditCourtConviction.editRecord(args, res, next, data[i]));
        break;
      default:
        return {
          errorMessage: `Property ${property} does not exist.`
        };
    }
  } while (i-- > 0);

  try {
    return await Promise.all(observables);
  } catch (e) {
    return {
      status: 'failure',
      object: observables,
      errorMessage: e.message
    };
  }
};

exports.processPutRequest = processPutRequest;

/* eslint-enable no-redeclare */
