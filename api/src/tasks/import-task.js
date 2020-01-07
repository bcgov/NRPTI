'use strict';

const defaultLog = require('../utils/logger')('import-task');
const queryActions = require('../utils/query-actions');
const TaskAuditRecord = require('../utils/task-audit-record');
const DATASOURCE_TYPE = require('./utils/datasource-type-enum');

exports.protectedOptions = async function(args, res, next) {
  res.status(200).send();
};

exports.protectedCreateTask = async function(args, res, next) {
  const scopes = args.swagger.params.auth_payload.realm_access.roles;
  defaultLog.debug('scopes:', scopes);

  // validate request parameters
  if (!args.swagger.params.task || !args.swagger.params.task.value) {
    throw Error('protectedCreateTask - missing required request body');
  }

  if (!args.swagger.params.task.value.dataSourceType) {
    throw Error('protectedCreateTask - missing required dataSourceType');
  }

  if (!args.swagger.params.task.value.recordType) {
    throw Error('protectedCreateTask - missing required recordType');
  }

  // Init task record
  const taskAuditRecord = new TaskAuditRecord();
  taskAuditRecord.updateTaskRecord({
    dataSourceLabel: args.swagger.params.task.value.dataSourceType,
    startDate: new Date(),
    read: ['sysadmin'],
    write: ['sysadmin']
  });

  // create an async task, do not await this call
  runTask(
    taskAuditRecord,
    args.swagger.params.task.value.dataSourceType,
    args.swagger.params.task.value.recordType,
    args.swagger.params.task.value.params,
    args.swagger.params.auth_payload
  );

  // send response immediately as the tasks will run in the background
  return queryActions.sendResponse(res, 200);
};

/**
 * Runs an update for a single (dataSourceType, recordType) pair.
 *
 * @param {*} taskAuditRecord
 * @param {*} dataSourceType
 * @param {*} recordType
 */
async function runTask(taskAuditRecord, dataSourceType, recordType, params, auth_payload) {
  try {
    // Get dataSource
    const dataSource = getDataSource(dataSourceType, recordType, params, auth_payload);

    if (!dataSource) {
      throw Error(`runTask - could not find supported dataSource for dataSourceType: ${dataSourceType}`);
    }

    // Run updateRecords
    const status = await dataSource.updateRecords();

    defaultLog.info(`runTask - completed: ${JSON.stringify(status)}`);

    // Update task as completed (does not necessarily mean all records were successfully updated)
    await taskAuditRecord.updateTaskRecord({ status: 'Completed', finishDate: new Date(), ...status });
  } catch (error) {
    defaultLog.error(`runTask - unexpected error: ${error.message}`);
    defaultLog.debug(`runTask - unexpected error - error.stack: ${error.stack}`);

    // Update task as encountering unexpected error
    await taskAuditRecord.updateTaskRecord({ status: 'Error', finishDate: new Date() });
  }
}

/**
 * Get the dataSource specific util.
 *
 * @param {*} dataSourceType type of dataSource
 * @param {*} recordType type of record
 * @param {*} params optional params to filter which records the dataSource updates (optional)
 * @returns {object} an instance of the specified dataSource, or null if no supported dataSource found.
 * @throws {Error} if utils for specified type cannot be found.
 */
function getDataSource(dataSourceType, recordType, params, auth_payload) {
  switch (dataSourceType) {
    case DATASOURCE_TYPE.epic:
      return new (require('../integrations/epic/epic-datasource'))(recordType, params, auth_payload);
    default:
      throw Error(
        `getDataSource - failed to find dataSource for (dataSourceType, recordType): (${dataSourceType}, ${recordType})`
      );
  }
}
