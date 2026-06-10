'use strict';
const ConfigConsts = require('./constants/config');
const { S3 } = require('@aws-sdk/client-s3');
const { readAndParseCsvFile } = require('./csv-helpers');
const defaultLog = require('../utils/logger')('csv-import');

const s3 = new S3({
  endpoint: ConfigConsts.OBJECTS_STORE_URL(),
  region: process.env.OBJECT_STORE_region || 'us-east-1',
  credentials: {
    accessKeyId: process.env.OBJECT_STORE_user_account,
    secretAccessKey: process.env.OBJECT_STORE_password
  },
  forcePathStyle: true
});
const NRIS_FLNRO_KEY = 'fme-exports/NRIS-FLNRO-Inspections.csv';

/**
 * Stream csv from S3, validate, and parse to json expected by csv-importer
 * @param {string} dataSourceType which datasource to transform csv to, Eg. nris-flnr-csv
 * @param {string} recordType record type to target, Eg. Inspection
 * @returns {string[]}
 */
exports.getAndParseFmeCsv = async function (dataSourceType, recordType) {
  const s3Key = getCsvKey(dataSourceType, recordType);
  if (!s3Key) {
    defaultLog.info(`No S3 Key found for ${dataSourceType} - ${recordType}`);
    return;
  }

  let flnroCsv;
  try {
    flnroCsv = s3
      .getObject({
        Bucket: process.env.OBJECT_STORE_bucket_name,
        Key: s3Key
      })
      .createReadStream();
  } catch (error) {
    defaultLog.info(`Error accessing csv from S3 for ${dataSourceType}: ${error}`);
    return;
  }

  const parsedCsv = await readAndParseCsvFile(flnroCsv, dataSourceType, recordType);

  if (!parsedCsv) {
    defaultLog.info(`Error retrieving and parsing ${recordType} csv for FME source ${dataSourceType}`);
    return;
  }

  return parsedCsv;
};

/**
 * Get the S3 key to the location of csv output of FME
 * @param {string} dataSourceType which datasource to transform csv to, Eg. nris-flnr-csv
 * @param {string} recordType record type to target, Eg. Inspection
 * @returns {string} s3 key to source csv
 */
function getCsvKey(dataSourceType, recordType) {
  if (!dataSourceType || !recordType) {
    return null;
  }

  if (dataSourceType === 'nris-flnr-csv') {
    if (recordType === 'Inspection') {
      return NRIS_FLNRO_KEY;
    }
  }

  return null;
}
