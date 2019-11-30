'use strict';

const defaultLog = require('../utils/logger')('import-task');
const queryActions = require('../utils/query-actions');
const TaskAuditRecord = require('../utils/task-audit-record');
const IMPORT_DATASOURCE = require('./import-dataSource-enum');

exports.protectedOptions = async function(args, res, next) {
  res.status(200).send();
};

exports.protectedCreateTask = async function(args, res, next) {
  const scopes = args.swagger.params.auth_payload.realm_access.roles;
  defaultLog.debug('scopes:', scopes);

  // Init task record
  const taskAuditRecord = new TaskAuditRecord();
  taskAuditRecord.updateTaskRecord({
    dataSourceLabel: args.swagger.params.task.value.dataSource,
    startDate: new Date(),
    read: ['sysadmin'],
    write: ['sysadmin']
  });

  if (!args.swagger.params.task || !args.swagger.params.task.value) {
    throw Error(`protectedCreateTask - missing required request body`);
  }

  // Get dataSource
  const dataSource = getDataSourceUtils(
    args.swagger.params.task.value.dataSource,
    args.swagger.params.task.value.recordType
  );

  if (!dataSource) {
    throw Error(
      `protectedCreateTask - could not find supported dataSource for: ${args.swagger.params.task.value.dataSource}`
    );
  }

  let status;
  try {
    // Run updateRecords
    status = await dataSource.updateRecords(args.swagger.params.task.value.recordType);

    // TODO check status, as all errors are caught

    defaultLog.debug(`protectedCreateTask - succeeded : ${status}`);

    // Update task as completed (does not necessarily mean all records were successfully updated)
    await taskAuditRecord.updateTaskRecord({ status: 'Completed', finishDate: new Date(), ...status });
  } catch (error) {
    defaultLog.error(`protectedCreateTask - unexpected error: ${error.message}`);
    defaultLog.debug(`protectedCreateTask - unexpected error - error.stack: ${error.stack}`);

    // Update task as encountering unexpected error
    await taskAuditRecord.updateTaskRecord({ status: 'Error', finishDate: new Date(), ...status });

    // Task encountered unexpected error
    return queryActions.sendResponse(res, 500, error);
  }

  // Request finished
  // TODO send different responses based on status?
  return queryActions.sendResponse(res, 200, status);
};

/**
 * Get the dataSource specific util.
 *
 * @param {*} dataSource type of dataSource
 * @param {*} recordType type of record
 * @param {*} params optional params to filter which records the dataSource updates (optional)
 * @returns {object} an instance of the specified dataSource, or null if no supported dataSource found.
 * @throws {Error} if utils for specified type cannot be found.
 */
function getDataSourceUtils(dataSource, recordType, params) {
  switch (dataSource) {
    case IMPORT_DATASOURCE.epic:
      return new (require('../integrations/epic/epic-dataSource'))(recordType, params);
    default:
      return null;
  }
}
