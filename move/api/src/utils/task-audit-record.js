'use strict';

const mongoose = require('mongoose');
const utils = require('./constants/misc');

/**
 * Facilitates the creation and updating of a single Task audit record.
 *
 * @class TaskAuditRecord
 */
class TaskAuditRecord {
  /**
   * Creates an instance of DataSource.
   *
   * @param {Array<string>} additionalReadRoles additional user roles to create on the record
   * @memberof TaskAuditRecord
   */
  constructor(additionalReadRoles = []) {
    this.additionalReadRoles = additionalReadRoles;
  }

  /**
   * Create/Update a Task record.
   *
   * @param {object} params params to save in the Task record.
   * @returns {object} the resulting Task record.
   * @memberof TaskAuditRecord
   */
  async updateTaskRecord(params) {
    // add default sysadmin roles
    params = { ...params, read: [...utils.ApplicationAdminRoles, ...this.additionalReadRoles], write: [utils.ApplicationRoles.ADMIN] };

    const Task = mongoose.model('Task');

    // create a new record
    if (!this.taskRecord) {
      this.taskRecord = await Task.create(params);
      return this.taskRecord;
    }

    // update the existing record
    return await Task.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(this.taskRecord._id) },
      { $set: { _id: this.taskRecord._id, ...params } },
      { new: true }
    );
  }
}

module.exports = TaskAuditRecord;
