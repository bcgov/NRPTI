const TaskAuditRecord = require('./task-audit-record');
const { ROLES } = require('./constants/misc');

describe('TaskAuditRecord', () => {
  describe('updateTaskRecord', () => {
    it('creates a new task record', async () => {
      // create mock create function
      const mockCreateFunction = jest.fn(() =>
        Promise.resolve({ _id: '123', created: true, read: ROLES.ADMIN_ROLES, write: [ROLES.SYSADMIN] })
      );
      // mock mongoose to call mock create function, etc
      const mongoose = require('mongoose');
      mongoose.model = jest.fn(() => {
        return { create: mockCreateFunction };
      });

      const taskAuditRecord = new TaskAuditRecord();

      const taskRecord = await taskAuditRecord.updateTaskRecord({ param1: 1, param2: 2 });

      expect(mockCreateFunction).toHaveBeenCalledWith({
        param1: 1,
        param2: 2,
        read: ROLES.ADMIN_ROLES,
        write: [ROLES.SYSADMIN]
      });

      expect(taskRecord).toEqual({ _id: '123', created: true, read: ROLES.ADMIN_ROLES, write: [ROLES.SYSADMIN] });
    });

    it('updates an existing task record', async () => {
      // create mock findOneAndUpdate function
      const mockFindOneAndUpdate = jest.fn(() =>
        Promise.resolve({ _id: '456', updated: true, read: ROLES.ADMIN_ROLES, write: [ROLES.SYSADMIN] })
      );
      // mock mongoose to call mock findOneAndUpdate function, etc
      const mongoose = require('mongoose');
      mongoose.model = jest.fn(() => {
        return { findOneAndUpdate: mockFindOneAndUpdate };
      });
      // mock ObjectId to return the original id, so the outcome is predictable for the sake of this test
      mongoose.Types.ObjectId = jest.fn(id => {
        return id;
      });

      const taskAuditRecord = new TaskAuditRecord();

      // set initial task record so a call to updateTaskRecord updates the existing task, rather than create a new one.
      taskAuditRecord.taskRecord = { _id: '456' };

      const taskRecord = await taskAuditRecord.updateTaskRecord({ param1: 3, param2: 4 });

      expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
        { _id: '456' },
        { $set: { _id: '456', ...{ param1: 3, param2: 4, read: ROLES.ADMIN_ROLES, write: [ROLES.SYSADMIN] } } },
        { new: true }
      );

      expect(taskRecord).toEqual({ _id: '456', updated: true, read: ROLES.ADMIN_ROLES, write: [ROLES.SYSADMIN] });
    });
  });
});
