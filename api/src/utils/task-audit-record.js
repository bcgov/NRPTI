'use strict';

const mongoose = require('mongoose');

/**
 * Facilitates the creation and updating of a single Task audit record.
 *
 * @class TaskAuditRecord
 */
class TaskAuditRecord {
  /**
   * Create/Update a Task record.
   *
   * @param {object} params params to save in the Task record.
   * @returns {object} the resulting Task record.
   * @memberof TaskAuditRecord
   */
  async updateTaskRecord(params) {
    // add default sysadmin roles
    params = { ...params, read: ['sysadmin', 'admin:lng', 'admin:nrced', 'admin:bcmi'], write: ['sysadmin'] };

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
