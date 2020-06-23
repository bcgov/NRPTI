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
let AddNewsItem = require('./post/news-item');
let AddMine = require('./post/mine');

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
let EditNewsItem = require('./put/news-item');
let EditMine = require('./put/mine');

// let allowedFields = ['_createdBy', 'createdDate', 'description', 'publishDate', 'type'];

// Authenticated Requests

/**
 * TODO: populate this documentation
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 */
exports.protectedOptions = function (args, res, next) {
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
exports.protectedGet = function (args, res, next) {
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
exports.protectedPost = async function (args, res, next) {
  let promises = [];

  if (args.swagger.params.data && args.swagger.params.data.value) {
    let data = args.swagger.params.data.value;

    // We handle document logic when we add or remove documents not when we add/edit record
    for (const property of Object.keys(data)) {
      data[property].forEach(element => {
        delete element.documents;
      });
    }

    if (data.orders) {
      promises.push(processPostRequest(args, res, next, 'orders', data.orders));
    }
    if (data.inspections) {
      promises.push(processPostRequest(args, res, next, 'inspections', data.inspections));
    }
    if (data.certificates) {
      promises.push(processPostRequest(args, res, next, 'certificates', data.certificates));
    }
    if (data.permits) {
      promises.push(processPostRequest(args, res, next, 'permits', data.permits));
    }
    if (data.agreements) {
      promises.push(processPostRequest(args, res, next, 'agreements', data.agreements));
    }
    if (data.selfReports) {
      promises.push(processPostRequest(args, res, next, 'selfReports', data.selfReports));
    }
    if (data.restorativeJustices) {
      promises.push(processPostRequest(args, res, next, 'restorativeJustices', data.restorativeJustices));
    }
    if (data.tickets) {
      promises.push(processPostRequest(args, res, next, 'tickets', data.tickets));
    }
    if (data.administrativePenalties) {
      promises.push(processPostRequest(args, res, next, 'administrativePenalties', data.administrativePenalties));
    }
    if (data.administrativeSanctions) {
      promises.push(processPostRequest(args, res, next, 'administrativeSanctions', data.administrativeSanctions));
    }
    if (data.warnings) {
      promises.push(processPostRequest(args, res, next, 'warnings', data.warnings));
    }
    if (data.constructionPlans) {
      promises.push(processPostRequest(args, res, next, 'constructionPlans', data.constructionPlans));
    }
    if (data.managementPlans) {
      promises.push(processPostRequest(args, res, next, 'managementPlans', data.managementPlans));
    }
    if (data.courtConvictions) {
      promises.push(processPostRequest(args, res, next, 'courtConvictions', data.courtConvictions));
    }
    if (data.newsItems) {
      promises.push(processPostRequest(args, res, next, 'newsItems', data.newsItems));
    }
    if (data.mines) {
      promises.push(processPostRequest(args, res, next, 'mines', data.mines));
    }

    let response = await Promise.all(promises);

    // Audit the POST action.
    // If multiple observables are triggered, response will have multiple objects
    // only add the metaId for single objects.
    let meta = response && response[0] && response[0][0] ? response[0][0] : null;
    let metaID = meta && meta.object && meta.object[0] ? meta.object[0]._id : null;
    queryUtils.audit(args, 'POST', JSON.stringify(meta), args.swagger.params.auth_payload, metaID);

    queryActions.sendResponse(res, 200, response);
  } else {
    queryActions.sendResponse(res, 500, { error: 'You must provide data' });
  }
  next();
};

/**
 * TODO: populate this documentation
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 */
exports.protectedPut = async function (args, res, next) {
  let promises = [];

  if (args.swagger.params.data && args.swagger.params.data.value) {
    let data = args.swagger.params.data.value;

    // We handle document logic when we add or remove documents not when we add/edit record
    for (const property of Object.keys(data)) {
      data[property].forEach(element => {
        delete element.documents;
      });
    }

    if (data.orders) {
      promises.push(processPutRequest(args, res, next, 'orders', data.orders));
    }
    if (data.inspections) {
      promises.push(processPutRequest(args, res, next, 'inspections', data.inspections));
    }
    if (data.certificates) {
      promises.push(processPutRequest(args, res, next, 'certificates', data.certificates));
    }
    if (data.permits) {
      promises.push(processPutRequest(args, res, next, 'permits', data.permits));
    }
    if (data.agreements) {
      promises.push(processPutRequest(args, res, next, 'agreements', data.agreements));
    }
    if (data.selfReports) {
      promises.push(processPutRequest(args, res, next, 'selfReports', data.selfReports));
    }
    if (data.restorativeJustices) {
      promises.push(processPutRequest(args, res, next, 'restorativeJustices', data.restorativeJustices));
    }
    if (data.tickets) {
      promises.push(processPutRequest(args, res, next, 'tickets', data.tickets));
    }
    if (data.administrativePenalties) {
      promises.push(processPutRequest(args, res, next, 'administrativePenalties', data.administrativePenalties));
    }
    if (data.administrativeSanctions) {
      promises.push(processPutRequest(args, res, next, 'administrativeSanctions', data.administrativeSanctions));
    }
    if (data.warnings) {
      promises.push(processPutRequest(args, res, next, 'warnings', data.warnings));
    }
    if (data.constructionPlans) {
      promises.push(processPutRequest(args, res, next, 'constructionPlans', data.constructionPlans));
    }
    if (data.managementPlans) {
      promises.push(processPutRequest(args, res, next, 'managementPlans', data.managementPlans));
    }
    if (data.courtConvictions) {
      promises.push(processPutRequest(args, res, next, 'courtConvictions', data.courtConvictions));
    }
    if (data.newsItems) {
      promises.push(processPutRequest(args, res, next, 'newsItems', data.newsItems));
    }
    if (data.mines) {
      promises.push(processPutRequest(args, res, next, 'mines', data.mines));
    }

    let response = await Promise.all(promises);

    let meta = response && response[0] && response[0][0] ? response[0][0] : null;
    let metaID = meta && meta.object && meta.object[0] ? meta.object[0]._id : null;
    queryUtils.audit(args, 'PUT', JSON.stringify(meta), args.swagger.params.auth_payload, metaID);

    queryActions.sendResponse(res, 200, response);
  } else {
    queryActions.sendResponse(res, 500, { error: 'You must provide data' });
  }
  next();
};

exports.protectedNewsDelete = async function (args, res, next) {
  try {
    const recordId = args.swagger.params.recordId.value;
    defaultLog.info(`protectedNewsDelete - recordId: ${recordId}`);

    const model = require('mongoose').model('ActivityLNG');

    try {
      await model.deleteOne({ _id: recordId, write: { $in: args.swagger.params.auth_payload.realm_access.roles } });
    } catch (e) {
      defaultLog.info(`protectedNewsDelete - couldn't find record for recordId: ${recordId}`);
      return queryActions.sendResponse(res, 404, {});
    }

    queryUtils.audit(args, 'DELETE', 'ActivityLNG', args.swagger.params.auth_payload, recordId);
    queryActions.sendResponse(res, 200, {});
  } catch (error) {
    queryActions.sendResponse(res, 500, error);
  }
  next();
};

/**
 * Publish a record.  Adds the `public` role to the records root read array.
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 */
exports.protectedPublish = async function (args, res, next) {
  try {
    const recordData = args.swagger.params.record.value;
    defaultLog.info(`protectedPublish - recordId: ${recordData._id}`);

    const model = require('mongoose').model(recordData._schemaName);

    const record = await model.findOne({ _id: recordData._id, write: { $in: args.swagger.params.auth_payload.realm_access.roles } });

    // If we are updating a flavour, we have to make sure we update master as well
    if (recordData._schemaName.includes('NRCED')) {
      const masterSchema = recordData._schemaName.substring(0, recordData._schemaName.length - 5);
      const masterModel = require('mongoose').model(masterSchema);
      await masterModel.findOneAndUpdate({ _id: record._master, write: { $in: args.swagger.params.auth_payload.realm_access.roles } }, { isNrcedPublished: true });
    }
    else if (recordData._schemaName.includes('LNG')) {
      const masterSchema = recordData._schemaName.substring(0, recordData._schemaName.length - 3);
      const masterModel = require('mongoose').model(masterSchema);
      await masterModel.findOneAndUpdate({ _id: record._master, write: { $in: args.swagger.params.auth_payload.realm_access.roles } }, { isLngPublished: true });
    }

    if (!record) {
      defaultLog.info(`protectedPublish - couldn't find record for recordId: ${record._id}`);
      return queryActions.sendResponse(res, 404, {});
    }

    const published = await queryActions.publish(record, true);

    queryUtils.audit(args, 'Publish', record, args.swagger.params.auth_payload, record._id);

    queryActions.sendResponse(res, 200, published);
  } catch (error) {
    queryActions.sendResponse(res, 500, error);
  }
  next();
};

/**
 * Unpublish a record. Removes the `public` role from the records root read array.
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 */
exports.protectedUnPublish = async function (args, res, next) {
  try {
    const recordData = args.swagger.params.record.value;
    defaultLog.info(`protectedUnPublish - recordId: ${recordData._id}`);

    const model = require('mongoose').model(recordData._schemaName);

    const record = await model.findOne({ _id: recordData._id, write: { $in: args.swagger.params.auth_payload.realm_access.roles } });
    // If we are updating a flavour, we have to make sure we update master as well
    if (recordData._schemaName.includes('NRCED')) {
      const masterSchema = recordData._schemaName.substring(0, recordData._schemaName.length - 5);
      const masterModel = require('mongoose').model(masterSchema);
      await masterModel.findOneAndUpdate({ _id: record._master, write: { $in: args.swagger.params.auth_payload.realm_access.roles } }, { isNrcedPublished: false });
    }
    else if (recordData._schemaName.includes('LNG')) {
      const masterSchema = recordData._schemaName.substring(0, recordData._schemaName.length - 3);
      const masterModel = require('mongoose').model(masterSchema);
      await masterModel.findOneAndUpdate({ _id: record._master, write: { $in: args.swagger.params.auth_payload.realm_access.roles } }, { isLngPublished: false });
    }

    if (!record) {
      defaultLog.info(`protectedUnPublish - couldn't find record for recordId: ${record._id}`);
      return queryActions.sendResponse(res, 404, {});
    }

    const unPublished = await queryActions.unPublish(record);

    queryUtils.audit(args, 'UnPublish', record, args.swagger.params.auth_payload, record._id);

    queryActions.sendResponse(res, 200, unPublished);
  } catch (error) {
    queryActions.sendResponse(res, 500, error);
  }
  next();
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
exports.publicGet = function (args, res, next) {
  return queryActions.sendResponse(res, 501);
};

const processPostRequest = async function (args, res, next, property, data) {
  if (data.length === 0) {
    return {
      status: 'success',
      object: {}
    };
  }

  let i = data.length - 1;
  let promises = [];

  do {
    switch (property) {
      case 'orders':
        promises.push(AddOrder.createRecord(args, res, next, data[i]));
        break;
      case 'inspections':
        promises.push(AddInspection.createRecord(args, res, next, data[i]));
        break;
      case 'certificates':
        promises.push(AddCertificate.createRecord(args, res, next, data[i]));
        break;
      case 'permits':
        promises.push(AddPermit.createRecord(args, res, next, data[i]));
        break;
      case 'agreements':
        promises.push(AddAgreement.createRecord(args, res, next, data[i]));
        break;
      case 'selfReports':
        promises.push(AddSelfReport.createRecord(args, res, next, data[i]));
        break;
      case 'restorativeJustices':
        promises.push(AddRestorativeJustice.createRecord(args, res, next, data[i]));
        break;
      case 'tickets':
        promises.push(AddTicket.createRecord(args, res, next, data[i]));
        break;
      case 'administrativePenalties':
        promises.push(AddAdministrativePenalty.createRecord(args, res, next, data[i]));
        break;
      case 'administrativeSanctions':
        promises.push(AddAdministrativeSanction.createRecord(args, res, next, data[i]));
        break;
      case 'warnings':
        promises.push(AddWarning.createRecord(args, res, next, data[i]));
        break;
      case 'constructionPlans':
        promises.push(AddConstructionPlan.createRecord(args, res, next, data[i]));
        break;
      case 'managementPlans':
        promises.push(AddManagementPlan.createRecord(args, res, next, data[i]));
        break;
      case 'courtConvictions':
        promises.push(AddCourtConviction.createRecord(args, res, next, data[i]));
        break;
      case 'newsItems':
        promises.push(AddNewsItem.createRecord(args, res, next, data[i]));
        break;
      case 'mines':
        promises.push(AddMine.createRecord(args, res, next, data[i]));
        break;
      default:
        return {
          errorMessage: `Property ${property} does not exist.`
        };
    }
  } while (i-- > 0);

  try {
    return await Promise.all(promises);
  } catch (e) {
    return {
      status: 'failure',
      object: promises,
      errorMessage: e.message
    };
  }
};

exports.processPostRequest = processPostRequest;

const processPutRequest = async function (args, res, next, property, data) {
  if (data.length === 0) {
    return {
      status: 'success',
      object: {}
    };
  }

  let i = data.length - 1;
  let promises = [];

  do {
    switch (property) {
      case 'orders':
        promises.push(EditOrder.editRecord(args, res, next, data[i]));
        break;
      case 'inspections':
        promises.push(EditInspection.editRecord(args, res, next, data[i]));
        break;
      case 'certificates':
        promises.push(EditCertificate.editRecord(args, res, next, data[i]));
        break;
      case 'permits':
        promises.push(EditPermit.editRecord(args, res, next, data[i]));
        break;
      case 'agreements':
        promises.push(EditAgreement.editRecord(args, res, next, data[i]));
        break;
      case 'selfReports':
        promises.push(EditSelfReport.editRecord(args, res, next, data[i]));
        break;
      case 'restorativeJustices':
        promises.push(EditRestorativeJustice.editRecord(args, res, next, data[i]));
        break;
      case 'tickets':
        promises.push(EditTicket.editRecord(args, res, next, data[i]));
        break;
      case 'administrativePenalties':
        promises.push(EditAdministrativePenalty.editRecord(args, res, next, data[i]));
        break;
      case 'administrativeSanctions':
        promises.push(EditAdministrativeSanction.editRecord(args, res, next, data[i]));
        break;
      case 'warnings':
        promises.push(EditWarning.editRecord(args, res, next, data[i]));
        break;
      case 'constructionPlans':
        promises.push(EditConstructionPlan.editRecord(args, res, next, data[i]));
        break;
      case 'managementPlans':
        promises.push(EditManagementPlan.editRecord(args, res, next, data[i]));
        break;
      case 'courtConvictions':
        promises.push(EditCourtConviction.editRecord(args, res, next, data[i]));
        break;
      case 'newsItems':
        promises.push(EditNewsItem.editRecord(args, res, next, data[i]));
        break;
      case 'mines':
        promises.push(EditMine.editRecord(args, res, next, data[i]));
        break;
      default:
        return {
          errorMessage: `Property ${property} does not exist.`
        };
    }
  } while (i-- > 0);

  try {
    return await Promise.all(promises);
  } catch (e) {
    return {
      status: 'failure',
      object: promises,
      errorMessage: e.message
    };
  }
};

exports.processPutRequest = processPutRequest;

/* eslint-enable no-redeclare */
