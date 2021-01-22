import { Component } from '@angular/core';
import { FactoryService } from '../../services/factory.service';
import { ITaskParams } from '../../services/task.service';
import { CsvConstants, IRequiredFormat, IDateField } from '../../utils/constants/csv-constants';
import Papa from 'papaparse';
import moment from 'moment';

class CSVTypes {
  public static readonly csvTypes = {
    'coors-csv': ['Ticket'],
    'nro-csv': ['Inspection'],
    'mis-csv': ['Inspection']
  };

  public static getRecordTypes(dataSourceType: string): string[] {
    return this.csvTypes[dataSourceType] || [];
  }
}

@Component({
  selector: 'app-import-csv',
  templateUrl: './import-csv.component.html',
  styleUrls: ['./import-csv.component.scss']
})
export class ImportCSVComponent {
  public CSVTypes = CSVTypes; // make available in template

  public dataSourceType = null;
  public recordType = null;
  public csvFiles: File[] = [];

  public csvFileValidated = false;
  public csvFileErrors: string[] = [];
  public transformedValidatedCsvFile;

  public showAlert = false;

  constructor(public factoryService: FactoryService) {}

  /**
   * Handle data source type changes.
   *
   * @param {string} dataSourceType
   * @memberof ImportCSVComponent
   */
  onDataSourceTypeChange(dataSourceType: string) {
    this.dataSourceType = dataSourceType;

    // If the datasource only has 1 record type, auto select it
    const recordTypes = CSVTypes.getRecordTypes(dataSourceType);
    if (recordTypes && recordTypes.length === 1) {
      this.recordType = recordTypes[0];
    }

    this.readCsvFile();
  }

  /**
   * Handle record type changes.
   *
   * @param {string} recordType
   * @memberof ImportCSVComponent
   */
  onRecordTypeChange(recordType: string) {
    this.recordType = recordType;

    this.readCsvFile();
  }

  /**
   * Handle file changes.
   *
   * @param {File[]} files
   * @memberof ImportCSVComponent
   */
  onFileChange(files: File[]) {
    this.csvFiles = files;

    this.csvFileValidated = false;
    this.csvFileErrors = [];

    this.readCsvFile();
  }

  /**
   * Handle file deletion.
   *
   * @param {File} file
   * @returns
   * @memberof ImportCSVComponent
   */
  onFileDelete(file: File) {
    if (!file) {
      return;
    }

    if (!this.csvFiles.includes(file)) {
      return;
    }

    this.csvFiles = this.csvFiles.filter(csvFile => csvFile.name !== file.name);

    this.csvFileValidated = false;
    this.csvFileErrors = [];
  }

  /**
   * Read the csv file data if all required parameters are valid.
   *
   * @returns
   * @memberof ImportCSVComponent
   */
  readCsvFile() {
    if (!this.dataSourceType || !this.recordType || !this.csvFiles[0]) {
      return;
    }

    this.csvFileValidated = false;
    this.csvFileErrors = [];
    this.transformedValidatedCsvFile = null;

    const fileReader = new FileReader();

    fileReader.onloadend = () => {
      const validatedCsvRows = this.validateCsvFile(fileReader.result);

      if (!validatedCsvRows) {
        return;
      }

      const transformedCsvRows = this.transformFields(validatedCsvRows);

      if (!transformedCsvRows) {
        return;
      }

      this.transformedValidatedCsvFile = Papa.unparse(transformedCsvRows);
    };

    fileReader.readAsText(this.csvFiles[0]);
  }

  /**
   * Parse and validate the csv data for errors.
   *
   * @param {*} csvData
   * @returns {string[][]} parsed and validated csv file
   * @returns
   * @memberof ImportCSVComponent
   */
  validateCsvFile(csvData: any): string[][] {
    if (!csvData) {
      this.csvFileErrors.push(`Error reading csv file: ${this.csvFiles[0].name}`);
      return;
    }

    // parse csv into a 2D array of rows and row values
    const csvRows: string[][] = Papa.parse<string[]>(csvData as string, { skipEmptyLines: true }).data;

    this.validateRequiredHeaders(csvRows[0]);

    this.validateFields(csvRows);

    if (this.csvFileErrors && this.csvFileErrors.length) {
      // csv errors found
      return;
    }

    this.csvFileValidated = true;

    return csvRows;
  }

  /**
   * Validate that the csv file contains all required headers.
   *
   * @param {string[]} csvHeaderRowValuesArray
   * @returns
   * @memberof ImportCSVComponent
   */
  validateRequiredHeaders(csvHeaderRowValuesArray: string[]) {
    if (!csvHeaderRowValuesArray || !csvHeaderRowValuesArray.length) {
      this.csvFileErrors.push(`Error parsing csv file: ${this.csvFiles[0].name}`);
      return;
    }

    // convert header values array to lowercase
    csvHeaderRowValuesArray = csvHeaderRowValuesArray.map(header => header.toLowerCase());

    // get required column headers for the specified data source and record type
    const requiredHeadersArray = CsvConstants.getCsvRequiredHeadersArray(this.dataSourceType, this.recordType);

    // determine if the csv file is missing any required column headers
    const missingHeaders = requiredHeadersArray.filter(
      requiredHeader => !csvHeaderRowValuesArray.includes(requiredHeader.toLowerCase())
    );

    if (missingHeaders && missingHeaders.length) {
      this.csvFileErrors.push(`CSV file is missing required column headers: ${missingHeaders}`);
      return;
    }
  }

  /**
   * Validate csv field values.
   * - Check that the csv rows contain non-null/non-empty values for all required fields.
   * - Check that the csv rows contain correctly formatted values for all fields that have a required format.
   *
   * Note: Not all fields with required formats are necessarily required fields, and so may be null or empty.
   *
   * @param {string[][]} csvRows array of rows, each of which is an array of row values
   * @returns
   * @memberof ImportCSVComponent
   */
  validateFields(csvRows: string[][]) {
    if (!csvRows || !csvRows.length) {
      this.csvFileErrors.push(`Error parsing csv file: ${this.csvFiles[0].name}`);
      return;
    }

    // get column header values array
    const csvHeaderRowValuesArray = csvRows[0];

    // get required fields for the specified data source and record type
    const requiredFieldsArray = CsvConstants.getCsvRequiredFieldsArray(this.dataSourceType, this.recordType);

    // get required formats for fields for the specified data source and record type
    const requiredFormatsArray = CsvConstants.getCsvRequiredFormatsArray(this.dataSourceType, this.recordType);

    // start loop at index 1, skipping the header row
    for (let rowNumber = 1; rowNumber < csvRows.length; rowNumber++) {
      if (!csvRows[rowNumber]) {
        continue;
      }

      // get row values array
      const csvRowValuesArray = csvRows[rowNumber];

      this.validateRequiredFields(csvRowValuesArray, requiredFieldsArray, csvHeaderRowValuesArray, rowNumber);

      this.validateRequiredFormats(csvRowValuesArray, requiredFormatsArray, csvHeaderRowValuesArray, rowNumber);
    }
  }

  /**
   * Validate the csv row for missing required fields.
   *
   * @param {string[]} csvRowValuesArray array of values for a single csv row
   * @param {string[]} requiredFieldsArray array of required columns
   * @param {string[]} csvHeaderRowValuesArray array of the current csv's column headers
   * @param {number} rowNumber csv row number
   * @memberof ImportCSVComponent
   */
  validateRequiredFields(
    csvRowValuesArray: string[],
    requiredFieldsArray: string[],
    csvHeaderRowValuesArray: string[],
    rowNumber: number
  ) {
    const missingFields = [];

    // determine if the csv row is missing any required fields
    for (const requiredField of requiredFieldsArray) {
      const requiredFieldIndex = csvHeaderRowValuesArray.indexOf(requiredField);

      if (!csvRowValuesArray[requiredFieldIndex]) {
        missingFields.push(requiredField);
      }
    }

    if (missingFields.length) {
      this.csvFileErrors.push(`CSV row ${rowNumber} is missing required fields: ${missingFields}`);
    }
  }

  /**
   * Validate the csv row for fields with required formats.
   *
   * @param {string[]} csvRowValuesArray
   * @param {IRequiredFormat[]} requiredFormatsArray
   * @param {string[]} csvHeaderRowValuesArray
   * @param {number} rowNumber csv row number
   * @memberof ImportCSVComponent
   */
  validateRequiredFormats(
    csvRowValuesArray: string[],
    requiredFormatsArray: IRequiredFormat[],
    csvHeaderRowValuesArray: string[],
    rowNumber: number
  ) {
    // determine if the csv row is contains any fields whose values are not in the required format
    for (const requiredFormat of requiredFormatsArray) {
      const fieldIndex = csvHeaderRowValuesArray.indexOf(requiredFormat.field);

      if (!csvRowValuesArray[fieldIndex]) {
        // Field is empty, if it was required it will have already been accounted for in the required fields check.
        // If it is not required then no format needs to be enforced.
        continue;
      }

      if (requiredFormat.type === 'date') {
        if (!moment(csvRowValuesArray[fieldIndex], requiredFormat.format).isValid()) {
          this.csvFileErrors.push(
            `CSV row ${rowNumber}, field: ${requiredFormat.field} - has invalid format, required format: ${requiredFormat.format}`
          );
        }
      }
    }
  }

  /**
   * Transform csv field values.
   *
   * @param {string[][]} csvRows array of rows, each of which is an array of row values
   * @returns {string[][]} array of rows with transformations applied.
   * @memberof ImportCSVComponent
   */
  transformFields(csvRows: string[][]): string[][] {
    if (!csvRows || !csvRows.length) {
      this.csvFileErrors.push(`Error parsing csv file: ${this.csvFiles[0].name}`);
      return;
    }

    // initial transformed csv rows
    const transformedCSvRows: string[][] = [...csvRows];

    // get column header values array
    const csvHeaderRowValuesArray = csvRows[0];

    const dateFields = CsvConstants.getCsvDateFieldsArray(this.dataSourceType, this.recordType);

    // start loop at index 1, skipping the header row
    for (let rowNumber = 1; rowNumber < csvRows.length; rowNumber++) {
      if (!csvRows[rowNumber]) {
        continue;
      }

      // get row values array
      const csvRowValuesArray = csvRows[rowNumber];

      // update row with transformed fields
      transformedCSvRows[rowNumber] = this.transformDateFields(csvRowValuesArray, dateFields, csvHeaderRowValuesArray);
    }

    return transformedCSvRows;
  }

  /**
   * Transform the csv date fields into iso strings.
   *
   * @param {string[]} csvRowValuesArray
   * @param {string[]} dateFieldsArray
   * @param {string[]} csvHeaderRowValuesArray
   * @returns {string[]} csv row fields with transformed date fields
   * @memberof ImportCSVComponent
   */
  transformDateFields(
    csvRowValuesArray: string[],
    dateFieldsArray: IDateField[],
    csvHeaderRowValuesArray: string[]
  ): string[] {
    const transformedCsvRowValuesArray = [...csvRowValuesArray];

    // determine if the csv row is contains any fields whose values are not in the required format
    for (const dateField of dateFieldsArray) {
      const fieldIndex = csvHeaderRowValuesArray.indexOf(dateField.field);

      if (!csvRowValuesArray[fieldIndex]) {
        // Field is empty, if it was required it will have already been accounted for in the required fields check.
        // If it is not required then no format needs to be enforced.
        continue;
      }

      // transform dates into iso strings
      transformedCsvRowValuesArray[fieldIndex] = moment(csvRowValuesArray[fieldIndex], dateField.format).toISOString();
    }

    return transformedCsvRowValuesArray;
  }

  /**
   * Start the csv import job.
   *
   * @returns
   * @memberof ImportCSVComponent
   */
  async startJob() {
    if (!this.dataSourceType) {
      return null;
    }

    if (!this.recordType) {
      return null;
    }

    if (!this.csvFiles || !this.csvFiles.length) {
      return null;
    }

    if (!this.transformedValidatedCsvFile) {
      return null;
    }

    const taskParams: ITaskParams = {
      dataSourceType: this.dataSourceType,
      recordTypes: [this.recordType],
      csvData: this.transformedValidatedCsvFile,
      taskType: 'csvImport'
    };

    await this.factoryService.startTask(taskParams).toPromise();

    this.onFileDelete(this.csvFiles[0]);

    this.showAlert = true;
    setTimeout(() => {
      this.showAlert = false;
    }, 4000);
  }
}
