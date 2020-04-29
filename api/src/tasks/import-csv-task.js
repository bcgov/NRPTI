'use strict';

const defaultLog = require('../utils/logger')('import-csv-task');
const queryActions = require('../utils/query-actions');
const TaskAuditRecord = require('../utils/task-audit-record');
const csvToJson = require('csvtojson');

exports.protectedOptions = async function(args, res, next) {
  res.status(200).send();
};

exports.protectedCreateTask = async function(args, res, next) {
  // validate request parameters
  if (!args.swagger.params.dataSourceType || !args.swagger.params.dataSourceType.value) {
    throw Error('protectedCreateTask - missing required dataSourceType');
  }

  if (!args.swagger.params.recordType || !args.swagger.params.recordType.value) {
    throw Error('protectedCreateTask - missing required recordType');
  }

  if (!args.swagger.params.upfile || !args.swagger.params.upfile.value) {
    throw Error('protectedCreateTask - missing required upfile');
  }

  const csvRows = await getCsvRowsFromBuffer(args.swagger.params.upfile.value.buffer);

  if (!csvRows || !csvRows.length) {
    throw Error('protectedCreateTask - could not convert upfile buffer to csv rows array');
  }

  const nrptiDataSource = getDataSourceConfig(args.swagger.params.dataSourceType.value);

  if (!nrptiDataSource) {
    throw Error(
      `protectedCreateTask - could not find nrptiDataSource for dataSourceType: ${args.swagger.params.task.value.dataSourceType}`
    );
  }

  // run data source record updates
  runTask(nrptiDataSource, args.swagger.params.auth_payload, args.swagger.params.recordType.value, csvRows);

  // send response immediately as the tasks will run in the background
  return queryActions.sendResponse(res, 200);
};

/**
 * Runs an update for a single nrpti data source.
 *
 * @param {*} nrptiDataSource object containing the nrpti data source and additional config
 * @param {*} auth_payload user information for auditing
 * @param {*} recordType specific record type to update
 * @param {*} csvFile csv file to import
 */
async function runTask(nrptiDataSource, auth_payload, recordType, csvFile) {
  const taskAuditRecord = new TaskAuditRecord();

  try {
    defaultLog.info(`runTask - ${nrptiDataSource.dataSourceLabel} - started`);

    await taskAuditRecord.updateTaskRecord({ dataSourceLabel: nrptiDataSource.dataSourceLabel, startDate: new Date() });

    const dataSource = new nrptiDataSource.dataSourceClass(taskAuditRecord, auth_payload, recordType, csvFile);

    if (!dataSource) {
      throw Error(`runTask - ${nrptiDataSource.dataSourceLabel} - failed - could not create instance of dataSource`);
    }

    // Run the datasource loop, passing in the audit object.
    const res = await dataSource.run(taskAuditRecord);

    defaultLog.info(`runTask - ${nrptiDataSource.dataSourceLabel} - completed`);

    // Update task as completed (does not necessarily mean all records were successfully updated)
    await taskAuditRecord.updateTaskRecord({ status: 'completed', finishDate: new Date(), ...res });
  } catch (error) {
    defaultLog.error(
      `runTask - ${nrptiDataSource.dataSourceLabel} - ${error.status} - unexpected error: ${error.message}`
    );

    // Update task as encountering unexpected error
    await taskAuditRecord.updateTaskRecord({ status: 'Error', finishDate: new Date() });
  }
}

/**
 * GIven a file buffer, return a 2D array, where each inner array contains the column values for a row.
 *
 * Note: assumes there is a header row, which is removed.
 *
 * @param {*} csvFileBuffer
 * @returns {string[][]}
 */
async function getCsvRowsFromBuffer(csvFileBuffer) {
  if (!csvFileBuffer) {
    return null;
  }

  return csvToJson()
    .preFileLine((fileLine, idx) => {
      if (idx === 0) {
        // convert the header row to lowercase
        return fileLine.toLowerCase();
      }
      return fileLine;
    })
    .fromString(csvFileBuffer.toString());
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
    case 'cors-csv':
      return {
        dataSourceLabel: 'cors-csv',
        dataSourceClass: require('../importers/cors/datasource')
      };
    default:
      return null;
  }
}
