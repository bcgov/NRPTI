'use strict';

const mongoose = require('mongoose');
const defaultLog = require('../../utils/logger')('epic-management-plans');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');
const EpicUtils = require('./epic-utils');
const DocumentController = require('./../../controllers/document-controller');

/**
 * Epic ManagementPlan record handler for { type: 'ManagementPlan Package', milestone: 'ManagementPlan' }.
 *
 * Must contain the following functions:
 * - transformRecord: (object) => ManagementPlan
 * - saveRecord: (ManagementPlan) => any
 *
 * @class ManagementPlans
 */
class ManagementPlans {
  /**
   * Creates an instance of ManagementPlans.
   *
   * @param {*} auth_payload user information for auditing
   * @memberof ManagementPlans
   */
  constructor(auth_payload) {
    this.auth_payload = auth_payload;
  }

  /**
   * Transform an Epic management plan record into a NRPTI ManagementPlan record.
   *
   * @param {object} epicRecord Epic management plan record (required)
   * @returns {ManagementPlan} NRPTI management plan record.
   * @throws {Error} if record is not provided.
   * @memberof ManagementPlans
   */
  async transformRecord(epicRecord) {
    if (!epicRecord) {
      throw Error('transformRecord - required record must be non-null.');
    }

    // Apply common Epic pre-processing/transformations
    epicRecord = EpicUtils.preTransformRecord(epicRecord);

    // Creating and saving a document object if we are given a link to an EPIC document.
    const documents = [];
    if (epicRecord._id && epicRecord.documentFileName) {
      const savedDocument = await DocumentController.createLinkDocument(
        epicRecord.documentFileName,
        (this.auth_payload && this.auth_payload.displayName) || '',
        `https://projects.eao.gov.bc.ca/api/document/${epicRecord._id}/fetch/${encodeURIComponent(
          epicRecord.documentFileName
        )}`
      );
      documents.push(savedDocument);
    }

    return {
      _schemaName: RECORD_TYPE.ManagementPlan._schemaName,
      _epicProjectId: (epicRecord.project && epicRecord.project._id) || '',
      _sourceRefId: epicRecord._id || '',
      _epicMilestoneId: epicRecord.milestone || '',

      read: ['sysadmin'],
      write: ['sysadmin'],

      recordName: epicRecord.displayName || '',
      recordType: RECORD_TYPE.ManagementPlan.displayName,
      dateIssued: epicRecord.documentDate || null,
      agency: 'Environmental Assessment Office',
      author: epicRecord.documentAuthor || '',
      description: epicRecord.description || '',
      legislation: {
        act: (epicRecord.project && epicRecord.project.legislation) || ''
      },
      projectName: (epicRecord.project && epicRecord.project.name) || '',
      location: (epicRecord.project && epicRecord.project.location) || '',
      centroid: (epicRecord.project && epicRecord.project.centroid) || '',
      documents: documents,

      dateAdded: new Date(),
      dateUpdated: new Date(),
      updatedBy: (this.auth_payload && this.auth_payload.displayName) || '',
      sourceDateAdded: epicRecord.dateAdded || epicRecord._createdDate || null,
      sourceDateUpdated: epicRecord.dateUpdated || epicRecord._updatedDate || null,
      sourceSystemRef: 'epic'
    };
  }

  /**
   * Persist a NRPTI ManagementPlan record to the database.
   *
   * @async
   * @param {ManagementPlan} managementPlanRecord NRPTI ManagementPlan record (required)
   * @returns {string} status of the add/update operations.
   * @memberof ManagementPlans
   */
  async saveRecord(managementPlanRecord) {
    if (!managementPlanRecord) {
      throw Error('saveRecord - required record must be non-null.');
    }

    try {
      const ManagementPlan = mongoose.model(RECORD_TYPE.ManagementPlan._schemaName);

      const record = await ManagementPlan.findOneAndUpdate(
        { _schemaName: RECORD_TYPE.ManagementPlan._schemaName, _sourceRefId: managementPlanRecord._sourceRefId },
        { $set: managementPlanRecord },
        { upsert: true, new: true }
      );

      return record;
    } catch (error) {
      defaultLog.error(`Failed to save Epic ManagementPlan record: ${error.message}`);
      defaultLog.debug(`Failed to save Epic ManagementPlan record - error.stack: ${error.stack}`);
    }
  }
}

module.exports = ManagementPlans;
