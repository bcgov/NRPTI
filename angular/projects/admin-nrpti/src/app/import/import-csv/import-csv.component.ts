import { Component } from '@angular/core';
import { FactoryService } from '../../services/factory.service';
import { ICsvTaskParams } from '../../services/task.service';
import { CsvConstants } from '../../utils/constants/csv-constants';

@Component({
  selector: 'app-import-csv',
  templateUrl: './import-csv.component.html',
  styleUrls: ['./import-csv.component.scss']
})
export class ImportCSVComponent {
  public dataSourceType = 'cors-csv'; // hard-code value while there is only 1 possible option
  public recordType = 'Ticket'; // hard-code value while there is only 1 possible option
  public csvFiles: File[] = [];

  public csvFileValidated = false;
  public csvFileErrors: string[] = [];

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
  }

  /**
   * Handle record type changes.
   *
   * @param {string} recordType
   * @memberof ImportCSVComponent
   */
  onRecordTypeChange(recordType: string) {
    this.recordType = recordType;
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

    this.validateCsvFile();
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
   * Validate the csv file for errors before attempting to import.
   *
   * @returns
   * @memberof ImportCSVComponent
   */
  validateCsvFile() {
    if (!this.dataSourceType || !this.recordType || !this.csvFiles[0]) {
      return;
    }

    const fileReader = new FileReader();

    fileReader.onloadend = () => {
      const csvData = fileReader.result;

      if (!csvData) {
        this.csvFileErrors.push(`Error reading csv file: ${this.csvFiles[0].name}`);
        return;
      }

      // parse csv into array of rows
      const csvRows: string[] = (csvData as string).split(/\r\n|\n/);

      this.validateRequiredHeaders(csvRows);

      this.validateRequiredFields(csvRows);

      if (this.csvFileErrors && this.csvFileErrors.length) {
        return;
      }

      this.csvFileValidated = true;
    };

    fileReader.readAsText(this.csvFiles[0]);
  }

  /**
   * Validate that the csv file contains all required headers.
   *
   * @param {string[]} csvRows
   * @returns
   * @memberof ImportCSVComponent
   */
  validateRequiredHeaders(csvRows: string[]) {
    if (!csvRows || !csvRows.length) {
      this.csvFileErrors.push(`Error parsing csv file: ${this.csvFiles[0].name}`);
      return;
    }

    // get column header values array
    let csvHeaderRowArray = String(csvRows[0]).split(',');

    if (!csvHeaderRowArray) {
      this.csvFileErrors.push(`Error parsing csv file: ${this.csvFiles[0].name}`);
      return;
    }

    // convert header values array to lowercase
    csvHeaderRowArray = csvHeaderRowArray.map(header => header.toLowerCase());

    // get required column headers for the specified data source and record type
    const requiredHeadersArray = CsvConstants.getCsvRequiredHeadersArray(this.dataSourceType, this.recordType);

    // determine if the csv file is missing any required column headers
    const missingHeaders = requiredHeadersArray.filter(
      requiredHeader => !csvHeaderRowArray.includes(requiredHeader.toLowerCase())
    );

    if (missingHeaders && missingHeaders.length) {
      this.csvFileErrors.push(`CSV file is missing required column headers: ${missingHeaders}`);
      return;
    }
  }

  /**
   * Validate that the csv rows contain non-null/non-empty values for all required fields.
   *
   * @param {string[]} csvRows
   * @returns
   * @memberof ImportCSVComponent
   */
  validateRequiredFields(csvRows: string[]) {
    if (!csvRows || !csvRows.length) {
      this.csvFileErrors.push(`Error parsing csv file: ${this.csvFiles[0].name}`);
      return;
    }

    // get column header values array
    const csvHeaderRowArray = String(csvRows[0]).split(',');

    // get required fields for the specified data source and record type
    const requiredFieldsArray = CsvConstants.getCsvRequiredFieldsArray(this.dataSourceType, this.recordType);

    // start loop at index 1, skipping the header row
    for (let i = 1; i < csvRows.length; i++) {
      if (!csvRows[i]) {
        continue;
      }

      const missingFields = [];

      // get row values array
      const csvRowValuesArray = String(csvRows[i]).split(',');

      // determine if the csv row is missing any required fields
      for (const requiredField of requiredFieldsArray) {
        const requiredFieldIndex = csvHeaderRowArray.indexOf(requiredField);

        if (!csvRowValuesArray[requiredFieldIndex]) {
          missingFields.push(requiredField);
        }
      }

      if (missingFields.length) {
        this.csvFileErrors.push(`CSV row ${i} is missing required fields: ${missingFields}`);
      }
    }
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

    const csvTaskParams: ICsvTaskParams = {
      dataSourceType: this.dataSourceType,
      recordType: this.recordType,
      upfile: this.csvFiles[0]
    };

    await this.factoryService.startCsvTask(csvTaskParams).toPromise();

    this.showAlert = true;
    setTimeout(() => {
      this.showAlert = false;
    }, 4000);
  }
}
