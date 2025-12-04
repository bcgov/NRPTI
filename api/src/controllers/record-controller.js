'use strict';

const ObjectID = require('mongodb').ObjectID;
const mongodb = require('../utils/mongodb');
const Delete = require('../controllers/delete/delete');
const RecordTypeEnum = require('../utils/constants/misc');

let queryActions = require('../utils/query-actions');
let queryUtils = require('../utils/query-utils');
let defaultLog = require('../utils/logger')('record');
let documentController = require('./document-controller');
const businessLogicManager = require('../utils/business-logic-manager');

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
let AddAnnualReport = require('./post/annual-report');
let AddCertificateAmendment = require('./post/certificate-amendment');
let AddCorrespondence = require('./post/correspondence');
let AddDamSafetyInspection = require('./post/dam-safety-inspection');
let AddReport = require('./post/report');

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
let EditAnnualReport = require('./put/annual-report');
let EditCertificateAmendment = require('./put/certificate-amendment');
let EditCorrespondence = require('./put/correspondence');
let EditDamSafetyInspection = require('./put/dam-safety-inspection');
let EditReport = require('./put/report');

// Expected data types for Post/Put operations with Records
// including their Add and Edit function exports.
// Update this collection with new types
const ACCEPTED_DATA_TYPES = [
  { type: 'orders', add: AddOrder, edit: EditOrder, schemaName: 'Order' },
  { type: 'inspections', add: AddInspection, edit: EditInspection, schemaName: 'Inspection' },
  { type: 'certificates', add: AddCertificate, edit: EditCertificate, schemaName: 'Certificate' },
  { type: 'permits', add: AddPermit, edit: EditPermit, schemaName: 'Permit' },
  { type: 'agreements', add: AddAgreement, edit: EditAgreement, schemaName: 'Agreement' },
  { type: 'selfReports', add: AddSelfReport, edit: EditSelfReport, schemaName: 'SelfReport' },
  {
    type: 'restorativeJustices',
    add: AddRestorativeJustice,
    edit: EditRestorativeJustice,
    schemaName: 'RestorativeJustice'
  },
  { type: 'tickets', add: AddTicket, edit: EditTicket, schemaName: 'Ticket' },
  {
    type: 'administrativePenalties',
    add: AddAdministrativePenalty,
    edit: EditAdministrativePenalty,
    schemaName: 'AdministrativePenaltie'
  },
  {
    type: 'administrativeSanctions',
    add: AddAdministrativeSanction,
    edit: EditAdministrativeSanction,
    schemaName: 'AdministrativeSanction'
  },
  { type: 'warnings', add: AddWarning, edit: EditWarning, schemaName: 'Warning' },
  { type: 'constructionPlans', add: AddConstructionPlan, edit: EditConstructionPlan, schemaName: 'ConstructionPlan' },
  { type: 'managementPlans', add: AddManagementPlan, edit: EditManagementPlan, schemaName: 'ManagementPlan' },
  { type: 'courtConvictions', add: AddCourtConviction, edit: EditCourtConviction, schemaName: 'CourtConviction' },
  { type: 'annualReports', add: AddAnnualReport, edit: EditAnnualReport, schemaName: 'AnnualReport' },
  {
    type: 'certificateAmendments',
    add: AddCertificateAmendment,
    edit: EditCertificateAmendment,
    schemaName: 'CertificateAmendment'
  },
  { type: 'correspondences', add: AddCorrespondence, edit: EditCorrespondence, schemaName: 'Correspondence' },
  {
    type: 'damSafetyInspections',
    add: AddDamSafetyInspection,
    edit: EditDamSafetyInspection,
    schemaName: 'DamSafetyInspection'
  },
  { type: 'reports', add: AddReport, edit: EditReport, schemaName: 'Report' }
];

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
  let promises = [];

  if (args.swagger.params.data && args.swagger.params.data.value) {
    let data = args.swagger.params.data.value;

    // We handle document logic when we add or remove documents not when we add/edit record
    for (const property of Object.keys(data)) {
      data[property].forEach(element => {
        delete element.documents;
      });

      if (ACCEPTED_DATA_TYPES.find(t => t.type === property)) {
        promises.push(processPostRequest(args, res, next, property, data[property]));
      }
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
exports.protectedPut = async function(args, res, next) {
  let promises = [];

  if (args.swagger.params.data && args.swagger.params.data.value) {
    let data = args.swagger.params.data.value;

    // We handle document logic when we add or remove documents not when we add/edit record
    for (const property of Object.keys(data)) {
      data[property].forEach(element => {
        delete element.documents;
      });

      if (ACCEPTED_DATA_TYPES.find(t => t.type === property)) {
        promises.push(processPutRequest(args, res, next, property, data[property]));
      }
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

exports.protectedDelete = async function(args, res, next) {
  const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
  const collection = db.collection('nrpti');

  let recordId = null;
  if (args.swagger.params.recordId && args.swagger.params.recordId.value) {
    recordId = args.swagger.params.recordId.value;
  } else {
    defaultLog.info(`protectedDelete - you must provide an id to delete`);
    queryActions.sendResponse(res, 400, {});
    next();
  }

  let record = null;
  try {
    record = await collection.findOne({ _id: new ObjectID(recordId) });
  } catch (error) {
    defaultLog.info(`protectedDelete - couldn't find record for recordId: ${recordId}`);
    defaultLog.debug(error);
    return queryActions.sendResponse(res, 404, {});
  }

  try {
    if (RecordTypeEnum.BCMI_SCHEMA_NAMES.includes(record._schemaName)) {
      await Delete.deleteFlavourRecord(recordId, 'bcmi');
    } else if (RecordTypeEnum.NRCED_SCHEMA_NAMES.includes(record._schemaName)) {
      await Delete.deleteFlavourRecord(recordId, 'nrced');
    } else if (RecordTypeEnum.LNG_SCHEMA_NAMES.includes(record._schemaName)) {
      await Delete.deleteFlavourRecord(recordId, 'lng');
    } else if (RecordTypeEnum.MASTER_SCHEMA_NAMES.includes(record._schemaName)) {
      await Delete.deleteMasterRecord(recordId);
    } else {
      defaultLog.info(`protectedDelete - schemaName not supported: ${record._schemaName}`);
      queryActions.sendResponse(res, 400, {});
      next();
    }
  } catch (error) {
    defaultLog.info(`protectedDelete - error deleting record: ${recordId}`);
    defaultLog.debug(error);
    return queryActions.sendResponse(res, 400, {});
  }

  queryActions.sendResponse(res, 200, {});
  next();
};

/**
 * Publish a record.  Adds the `public` role to the records root read array.
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

    const record = await model.findOne({
      _id: recordData._id,
      write: { $in: args.swagger.params.auth_payload.client_roles }
    });

    // If we are updating a flavour, we have to make sure we update master as well
    if (recordData._schemaName.includes('NRCED')) {
      const masterSchema = recordData._schemaName.substring(0, recordData._schemaName.length - 5);
      const masterModel = require('mongoose').model(masterSchema);
      await masterModel.findOneAndUpdate(
        { _id: record._master, write: { $in: args.swagger.params.auth_payload.client_roles } },
        { isNrcedPublished: true }
      );
    } else if (recordData._schemaName.includes('LNG')) {
      const masterSchema = recordData._schemaName.substring(0, recordData._schemaName.length - 3);
      const masterModel = require('mongoose').model(masterSchema);
      await masterModel.findOneAndUpdate(
        { _id: record._master, write: { $in: args.swagger.params.auth_payload.client_roles } },
        { isLngPublished: true }
      );
    } else if (
      !['CollectionBCMI', 'MineBCMI'].includes(recordData._schemaName) &&
      recordData._schemaName.includes('BCMI')
    ) {
      const masterSchema = recordData._schemaName.substring(0, recordData._schemaName.length - 4);
      const masterModel = require('mongoose').model(masterSchema);
      await masterModel.findOneAndUpdate(
        { _id: record._master, write: { $in: args.swagger.params.auth_payload.client_roles } },
        { isBcmiPublished: true }
      );
    }

    if (!record) {
      defaultLog.info(`protectedPublish - couldn't find record for recordId: ${record._id}`);
      return queryActions.sendResponse(res, 404, {});
    }

    const published = await queryActions.publish(record, args.swagger.params.auth_payload);
    // this should also publish documents, or they may not be usable by other applications
    if (published.documents) {
      for (const docId of published.documents) {
        // only allow a publish if the record is not anonymous
        if (!businessLogicManager.isDocumentConsideredAnonymous(published)) {
          await documentController.publishDocument(docId, args.swagger.params.auth_payload);
        }
      }
    }

    queryUtils.audit(args, 'Publish', record, args.swagger.params.auth_payload, record._id);

    queryActions.sendResponse(res, 200, published);
  } catch (error) {
    // only send error message, error object doesn't jsonify
    queryActions.sendResponse(res, 500, error.message);
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
exports.protectedUnPublish = async function(args, res, next) {
  try {
    const recordData = args.swagger.params.record.value;
    defaultLog.info(`protectedUnPublish - recordId: ${recordData._id}`);

    const model = require('mongoose').model(recordData._schemaName);

    const record = await model.findOne({
      _id: recordData._id,
      write: { $in: args.swagger.params.auth_payload.client_roles }
    });
    // If we are updating a flavour, we have to make sure we update master as well
    if (recordData._schemaName.includes('NRCED')) {
      const masterSchema = recordData._schemaName.substring(0, recordData._schemaName.length - 5);
      const masterModel = require('mongoose').model(masterSchema);
      await masterModel.findOneAndUpdate(
        { _id: record._master, write: { $in: args.swagger.params.auth_payload.client_roles } },
        { isNrcedPublished: false }
      );
    } else if (recordData._schemaName.includes('LNG')) {
      const masterSchema = recordData._schemaName.substring(0, recordData._schemaName.length - 3);
      const masterModel = require('mongoose').model(masterSchema);
      await masterModel.findOneAndUpdate(
        { _id: record._master, write: { $in: args.swagger.params.auth_payload.client_roles } },
        { isLngPublished: false }
      );
    }
    // Mines are a special case where they have no master and only exist as the BCMI flavour.
    else if (recordData._schemaName.includes('BCMI') && recordData._schemaName !== 'MineBCMI') {
      const masterSchema = recordData._schemaName.substring(0, recordData._schemaName.length - 4);
      const masterModel = require('mongoose').model(masterSchema);
      await masterModel.findOneAndUpdate(
        { _id: record._master, write: { $in: args.swagger.params.auth_payload.client_roles } },
        { isBcmiPublished: false }
      );
    }

    if (!record) {
      defaultLog.info(`protectedUnPublish - couldn't find record for recordId: ${record._id}`);
      return queryActions.sendResponse(res, 404, {});
    }

    const unPublished = await queryActions.unPublish(record, args.swagger.params.auth_payload);

    // this should also un-publish documents, or they may not be usable by other applications
    if (unPublished.documents) {
      for (const docId of unPublished.documents) {
        await documentController.unpublishDocument(docId, args.swagger.params.auth_payload);
      }
    }

    queryUtils.audit(args, 'UnPublish', record, args.swagger.params.auth_payload, record._id);

    queryActions.sendResponse(res, 200, unPublished);
  } catch (error) {
    // only send error message, error object doesn't jsonify
    queryActions.sendResponse(res, 500, error.message);
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
  let promises = [];

  do {
    const typeMethods = ACCEPTED_DATA_TYPES.find(t => t.type === property);
    if (typeMethods) {
      // Force the creation of a BCMI flavour.
      const bcmiFlavourSchemaName = typeMethods.schemaName.concat('BCMI');
      if (RecordTypeEnum.BCMI_SCHEMA_NAMES.includes(bcmiFlavourSchemaName) && !data[i][bcmiFlavourSchemaName]) {
        data[i][bcmiFlavourSchemaName] = {};
      }
      promises.push(typeMethods.add.createItem(args, res, next, data[i]));
    } else {
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

const processPutRequest = async function(args, res, next, property, data, overridePutParams = null) {
  if (data.length === 0) {
    return {
      status: 'success',
      object: {}
    };
  }

  let i = data.length - 1;
  let promises = [];

  do {
    const typeMethods = ACCEPTED_DATA_TYPES.find(t => t.type === property);
    if (typeMethods) {
      promises.push(typeMethods.edit.editRecord(args, res, next, data[i]));
    } else {
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
