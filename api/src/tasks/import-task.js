'use strict';

const defaultLog = require('../utils/logger')('import-task');
const queryActions = require('../utils/query-actions');
const TaskAuditRecord = require('../utils/task-audit-record');

exports.protectedOptions = async function(args, res, next) {
  res.status(200).send();
};

exports.protectedCreateTask = async function(args, res, next) {
  // validate request parameters
  if (!args.swagger.params.task || !args.swagger.params.task.value) {
    throw Error('protectedCreateTask - missing required request body');
  }

  if (!args.swagger.params.task.value.dataSourceType) {
    throw Error('protectedCreateTask - missing required dataSourceType');
  }

  const nrptiDataSource = getDataSourceConfig(args.swagger.params.task.value.dataSourceType);

  if (!nrptiDataSource) {
    throw Error(
      `protectedCreateTask - could not find nrptiDataSource for dataSourceType: ${args.swagger.params.task.value.dataSourceType}`
    );
  }

  // run data source record updates
  runTask(
    nrptiDataSource,
    args.swagger.params.auth_payload,
    args.swagger.params.task.value.params,
    args.swagger.params.task.value.recordTypes
  );

  // send response immediately as the tasks will run in the background
  return queryActions.sendResponse(res, 200);
};

/**
 * Runs an update for a single nrpti data source.
 *
 * @param {*} nrptiDataSource object containing the nrpti data source and additional config
 * @param {*} auth_payload user information for auditing
 * @param {*} [params=null] additional filter parameters to use when fetching records from the data source (optional)
 * @param {*} [recordType=null] specific record types to update (optional)
 */
async function runTask(nrptiDataSource, auth_payload, params = null, recordTypes = null) {
  const taskAuditRecord = new TaskAuditRecord();

  try {
    defaultLog.info(`runTask - ${nrptiDataSource.dataSourceLabel} - started`);

    taskAuditRecord.updateTaskRecord({ dataSourceLabel: nrptiDataSource.dataSourceLabel, startDate: new Date() });

    const dataSource = new nrptiDataSource.dataSourceClass(auth_payload, params, recordTypes);

    if (!dataSource) {
      throw Error(`runTask - ${nrptiDataSource.dataSourceLabel} - failed - could not create instance of dataSource`);
    }

    // Runs all functions necessary to upsert the specified data source and record types.
    const status = await dataSource.updateRecords();

    defaultLog.info(`runTask - ${nrptiDataSource.dataSourceLabel} - completed`);

    // Update task as completed (does not necessarily mean all records were successfully updated)
    await taskAuditRecord.updateTaskRecord({ status: 'Completed', finishDate: new Date(), ...status });
  } catch (error) {
    defaultLog.error(`runTask - ${nrptiDataSource.dataSourceLabel} - failed - unexpected error: ${error.message}`);

    // Update task as encountering unexpected error
    await taskAuditRecord.updateTaskRecord({ status: 'Error', finishDate: new Date() });
  }
}

/**
 * Get a supported data source config.
 *
 * @param {string} dataSourceType a data source type string
 * @returns data source config, or null if the provided data source type is not supported.
 */
function getDataSourceConfig(dataSourceType) {
  if (!dataSourceType) {
    return null;
  }

  switch (dataSourceType) {
    case 'epic':
      return {
        dataSourceLabel: 'epic',
        dataSourceClass: require('../integrations/epic/epic-datasource')
      };
    default:
      return null;
  }
}
