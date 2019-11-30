'use strict';

const mongoose = require('mongoose');

/**
 * Facilitates the creation and updating of a single Task audit record.
 *
 * @class TaskAuditRecord
 */
class TaskAuditRecord {
  /**
   * Creates an instance of TaskAuditRecord.
   *
   * @memberof TaskAuditRecord
   */
  constructor() {
    this.Task = mongoose.model('Task');
  }

  /**
   * Create/Update a Task record.
   *
   * @param {object} params params to save in the Task record.
   * @returns {object} the resulting Task record.
   * @memberof TaskAuditRecord
   */
  async updateTaskRecord(params) {
    // create a new record
    if (!this.taskRecord) {
      this.taskRecord = await this.Task.create(params);
      return this.taskRecord;
    }

    // update the existing record
    return await this.Task.findOneAndUpdate(
      { _id: mongoose.Types.ObjectId(this.taskRecord._id) },
      { $set: { _id: this.taskRecord._id, ...params } },
      { new: true }
    );
  }

  /**
   * Get the Task record.
   *
   * @returns {*} the Task record.
   * @memberof TaskAuditRecord
   */
  getTaskRecord() {
    return this.taskRecord;
  }
}

module.exports = TaskAuditRecord;
