const csvToJson = require('csvtojson');
const moment = require('moment-timezone');
const flnrCsv = require('./constants/csv/flnro-inspections-csv');
const defaultLog = require('./logger')('csv-import');

/**
 * Given a csv string, return an array of row objects.
 *
 * Note: assumes there is a header row, which is converted to lowercase.
 *
 * @param {*} csvString
 * @returns {string[][]}
 */
exports.getCsvRowsFromString = async function(csvString) {
  if (!csvString) {
    return null;
  }

  let lineNumber = 0;

  // preFileLine bug that prevents us from using the built in line index
  // See: https://github.com/Keyang/node-csvtojson/issues/351
  const csvRows = await csvToJson()
    .preFileLine(fileLine => {
      let line = fileLine;

      if (lineNumber === 0) {
        // convert the header row to lowercase
        line = fileLine.toLowerCase();
      }

      lineNumber++;

      return line;
    })
    .fromString(csvString);

  return csvRows;
}

/**
  * Read the csv file data from S3 if all required parameters are valid.
  *
  * @returns
  */
exports.readAndParseCsvFile = async function(csvStream, dataSourceType, recordType) {

  // parse csv into an array of key-value pairs (header-value)
  const validatedCsvRows = await validateCsvFile(csvStream, dataSourceType, recordType);

  if (!validatedCsvRows) {
    return;
  }

  const transformedValidatedCsvFile = transformFields(validatedCsvRows, dataSourceType, recordType);

  if (!transformedValidatedCsvFile) {
    return;
  }

  return transformedValidatedCsvFile;
}

/**
  * Parse and validate the csv data for errors.
  *
  * @param {*} csvStream node stream object from s3 getObject stream
  * @param {string} dataSourceType which datasource to transform csv to, Eg. nris-flnr-csv
  * @param {string} recordType record type to target, Eg. Inspection
  * @returns {string[]} parsed and validated csv file
  * @returns
  */
async function validateCsvFile(csvStream, dataSourceType, recordType) {
  let headers = [];
  let headersValid = false;
  let lineNumber = 0;
  const csvRows = await csvToJson({downstreamFormat: 'array'}).fromStream(csvStream)
    .preFileLine(fileLine => {
      let line = fileLine;

      if (lineNumber === 0) {
        // convert the header row to lowercase
        line = fileLine.toLowerCase();
      }

      lineNumber++;

      return line;
    })
    .on('header', (header) => {
      headersValid = validateRequiredHeaders(header, dataSourceType, recordType);
      headers = header;
    })
    .on('error', (error) => {
      defaultLog.info(`Error reading csv stream for ${dataSourceType} - ${recordType}: ${error}`)
      return;
    })


  const fieldsValid = validateFields(headers, csvRows, dataSourceType, recordType);

  if (!headersValid && !fieldsValid) {
    // csv errors found
    return;
  }

  return csvRows;
}

/**
  * Validate that the csv file contains all required headers.
  *
  * @param {string[]} csvHeaderRowValuesArray
  * @param {string} dataSourceType which datasource to transform csv to, Eg. nris-flnr-csv
  * @param {string} recordType record type to target, Eg. Inspection
  * @returns
  * @memberof ImportCSVComponent
  */
function validateRequiredHeaders(csvHeaderRowValuesArray, dataSourceType, recordType) {
  if (!csvHeaderRowValuesArray || !csvHeaderRowValuesArray.length) {
    defaultLog.info(`Error parsing csv file: ${dataSourceType} - ${recordType}`);
    return null;
  }

  // convert header values array to lowercase
  csvHeaderRowValuesArray = csvHeaderRowValuesArray.map(header => header.toLowerCase());

  // get required column headers for the specified data source and record type
  const requiredHeadersArray = getCsvRequiredHeadersArray(dataSourceType, recordType);

  // determine if the csv file is missing any required column headers
  const missingHeaders = requiredHeadersArray.filter(
    requiredHeader => !csvHeaderRowValuesArray.includes(requiredHeader.toLowerCase())
  );

  if (missingHeaders && missingHeaders.length) {
    defaultLog.info(`CSV file for ${dataSourceType} - ${recordType} is missing required column headers: ${missingHeaders}`);
    return null;
  }

  return true;
}

/**
   * Validate csv field values.
   * - Check that the csv rows contain non-null/non-empty values for all required fields.
   * - Check that the csv rows contain correctly formatted values for all fields that have a required format.
   *
   * Note: Not all fields with required formats are necessarily required fields, and so may be null or empty.
   *
   * @param {string[]} csvRows array of row objects, each of which is an k-v of header-values
  * @param {string} dataSourceType which datasource to transform csv to, Eg. nris-flnr-csv
  * @param {string} recordType record type to target, Eg. Inspection
   * @returns
   */
function validateFields(header, csvRows, dataSourceType, recordType) {
  if (!header || !csvRows || !csvRows.length) {
    defaultLog.info(`Error validating fields for csv: ${dataSourceType} - ${recordType}`);
    return;
  }

  // get required fields for the specified data source and record type
  const requiredFieldsArray = getCsvRequiredFieldsArray(dataSourceType, recordType);

  // get required formats for fields for the specified data source and record type
  const requiredFormatsArray = getCsvRequiredFormatsArray(dataSourceType, recordType);

  let fieldsValid, formatsValid;
  for (let rowNumber = 0; rowNumber < csvRows.length; rowNumber++) {
    if (!csvRows[rowNumber]) {
      continue;
    }

    // get row values array
    const csvRowValuesArray = csvRows[rowNumber];

    fieldsValid = validateRequiredFields(csvRowValuesArray, requiredFieldsArray, rowNumber);

    formatsValid = validateRequiredFormats(csvRowValuesArray, requiredFormatsArray, rowNumber);
  }
  if (!fieldsValid && !formatsValid) {
    return false;
  }

  return true;
}

/**
 * Validate the csv row for missing required fields.
 *
 * @param {string[]} csvRowValuesArray array of values for a single csv row
 * @param {string[]} requiredFieldsArray array of required columns
 * @param {number} rowNumber csv row number
 */
function validateRequiredFields(
  csvRowValuesArray,
  requiredFieldsArray,
  rowNumber
) {
  const missingFields = [];

  // determine if the csv row is missing any required fields
  for (const requiredField of requiredFieldsArray) {
    if (!(requiredField.toLowerCase() in csvRowValuesArray)) {
      missingFields.push(requiredField);
    }
  }

  if (missingFields.length) {
    defaultLog.info(`CSV row ${rowNumber} is missing required fields: ${missingFields}`);
    return false;
  }

  return true;
}

/**
 * Validate the csv row for fields with required formats.
 *
 * @param {string[]} csvRowValuesArray
 * @param {IRequiredFormat[]} requiredFormatsArray
 * @param {number} rowNumber csv row number
 */
function validateRequiredFormats(
  csvRowValuesArray,
  requiredFormatsArray,
  rowNumber
) {
  // determine if the csv row is contains any fields whose values are not in the required format
  for (const requiredFormat of requiredFormatsArray) {
    // const fieldIndex = csvHeaderRowValuesArray.indexOf(requiredFormat.field);

    if (!csvRowValuesArray[requiredFormat.field]) {
      // Field is empty, if it was required it will have already been accounted for in the required fields check.
      // If it is not required then no format needs to be enforced.
      continue;
    }

    if (requiredFormat.type === 'date') {
      if (!moment(csvRowValuesArray[requiredFormat.field], requiredFormat.format).isValid()) {
        defaultLog.info(
          `CSV row ${rowNumber}, field: ${requiredFormat.field} - has invalid format, required format: ${requiredFormat.format}`
        );
        return false;
      }
    }
  }
  return true;
}

/**
 * Transform csv field values.
 *
 * @param {string[]} csvRows array of row objects, each of which is an k-v of header-values
 * @param {string} dataSourceType which datasource to transform csv to, Eg. nris-flnr-csv
 * @param {string} recordType record type to target, Eg. Inspection
 * @returns {string[]} array of rows with transformations applied.
 * @memberof ImportCSVComponent
 */
function transformFields(csvRows, dataSourceType, recordType) {
  if (!csvRows || !csvRows.length) {
    defaultLog.info(`Error parsing csv file: ${dataSourceType} - ${recordType}`);
    return;
  }

  // initial transformed csv rows
  const transformedCsvRows = [...csvRows];

  const dateFields = getCsvDateFieldsArray(dataSourceType, recordType);

  // start loop at index 1, skipping the header row
  for (let rowNumber = 0; rowNumber < csvRows.length; rowNumber++) {
    if (!csvRows[rowNumber]) {
      continue;
    }

    // get row values array
    const csvRowValuesArray = csvRows[rowNumber];

    // update row with transformed fields
    transformedCsvRows[rowNumber] = transformDateFields(csvRowValuesArray, dateFields);
  }

  return transformedCsvRows;
}

/**
 * Transform the csv date fields into iso strings.
 *
 * @param {string[]} csvRowValuesArray
 * @param {string[]} dateFieldsArray
 * @returns {string[]} csv row fields with transformed date fields
 */
function transformDateFields(
  csvRowValuesArray,
  dateFieldsArray,
) {
  const transformedCsvRowValuesArray = csvRowValuesArray;

  // determine if the csv row is contains any fields whose values are not in the required format
  for (const dateField of dateFieldsArray) {

    if (!csvRowValuesArray[dateField.field]) {
      // Field is empty, if it was required it will have already been accounted for in the required fields check.
      // If it is not required then no format needs to be enforced.
      continue;
    }

    // transform dates into iso strings
    try {
      transformedCsvRowValuesArray[dateField.field] = moment.tz(csvRowValuesArray[dateField.field], "America/Vancouver").toDate()
    } catch (err) {
      defaultLog.debug(`Error transforming csv date field: ${err}`)
      transformedCsvRowValuesArray[dateField.field] = null;
    }
  }

  return transformedCsvRowValuesArray;
}

/**
   * Get the array of required csv field values for the provided dataSourceType and recordType.
   *
   * @static
   * @param {string} dataSourceType
   * @param {string} recordType
   * @returns array of csv required fields
   */
function getCsvRequiredFieldsArray(dataSourceType, recordType) {
  if (!dataSourceType || !recordType) {
    return null;
  }

  if (dataSourceType === 'nris-flnr-csv') {
    if (recordType === 'Inspection') {
      return flnrCsv.flnrInspectionCsvRequiredFields;
    }
  }

  return null;
}

/**
 * Get the array of required formats for csv field values for the provided dataSourceType and recordType.
 *
 * @static
 * @param {string} dataSourceType
 * @param {string} recordType
 * @returns {IRequiredFormat[]} array of required formats for csv fields
 * @memberof CsvConstants
 */
function getCsvRequiredFormatsArray(dataSourceType, recordType) {
  if (!dataSourceType || !recordType) {
    return null;
  }

  if (dataSourceType === 'nris-flnr-csv') {
    if (recordType === 'Inspection') {
      return flnrCsv.flnrInspectionCsvRequiredFormats;
    }
  }

  return null;
}

/**
 * Get the array of date fields for csv dataSourceType and recordType.
 *
 * @static
 * @param {string} dataSourceType
 * @param {string} recordType
 * @returns {IDateFields[]} array of date fields and their formats for csv
 */
function getCsvDateFieldsArray(dataSourceType, recordType) {
  if (!dataSourceType || !recordType) {
    return null;
  }

  if (dataSourceType === 'nris-flnr-csv') {
    if (recordType === 'Inspection') {
      return flnrCsv.flnrInspectionCsvDateFields;
    }
  }

  return null;
}

/**
   * Get the array of required csv headers for the provided dataSourceType and recordType.
   *
   * @static
   * @param {string} dataSourceType
   * @param {string} recordType
   * @returns array of csv required headers
   */
function getCsvRequiredHeadersArray(dataSourceType, recordType) {
  if (!dataSourceType || !recordType) {
    return null;
  }

  if (dataSourceType === 'nris-flnr-csv') {
    if (recordType === 'Inspection') {
      return flnrCsv.flnrInspectionCsvRequiredHeaders;
    }
  }

  return null;
}
