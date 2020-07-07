import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { ImportCSVComponent } from './import-csv.component';
import { TestBedHelper } from '../../../../../common/src/app/spec/spec-utils';
import { CommonModule } from '../../../../../common/src/app/common.module';
import { CsvConstants } from '../../utils/constants/csv-constants';
import { FactoryService } from '../../services/factory.service';
import { of } from 'rxjs';
import moment from 'moment';

describe('ImportCSVComponent', () => {
  const testBedHelper = new TestBedHelper<ImportCSVComponent>(ImportCSVComponent);

  const spyFactoryService = jasmine.createSpyObj<FactoryService>('FactoryService', ['startTask']);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ImportCSVComponent],
      imports: [RouterTestingModule, HttpClientTestingModule, FormsModule, CommonModule],
      providers: [{ provide: FactoryService, useValue: spyFactoryService }]
    }).compileComponents();
  }));

  it('should create', async(() => {
    const { component } = testBedHelper.createComponent();

    expect(component).toBeTruthy();
  }));

  describe('onFileDelete', () => {
    it('does nothing if required file parameter is null', async(() => {
      const { component } = testBedHelper.createComponent();

      // set initial component state
      const fileA = new File([], 'fileA', {});
      component.csvFiles = [fileA];
      component.csvFileValidated = true;
      component.csvFileErrors = ['an error'];

      component.onFileDelete(null);

      expect(component.csvFiles).toEqual([fileA]);
      expect(component.csvFileValidated).toEqual(true);
      expect(component.csvFileErrors).toEqual(['an error']);
    }));

    it('does nothing if file parameter does not match any existing files', async(() => {
      const { component } = testBedHelper.createComponent();

      // set initial component state
      const fileA = new File([], 'fileA', {});
      component.csvFiles = [fileA];
      component.csvFileValidated = true;
      component.csvFileErrors = ['an error'];

      const fileB = new File([], 'fileA', {});

      component.onFileDelete(fileB);

      expect(component.csvFiles).toEqual([fileA]);
      expect(component.csvFileValidated).toEqual(true);
      expect(component.csvFileErrors).toEqual(['an error']);
    }));

    it('removes the file, sets flags, resets errors when valid file provided', async(() => {
      const { component } = testBedHelper.createComponent();

      // set initial component state
      const fileA = new File([], 'fileA', {});
      const fileB = new File([], 'fileB', {});
      component.csvFiles = [fileA, fileB];
      component.csvFileValidated = true;
      component.csvFileErrors = ['an error'];

      component.onFileDelete(fileA);

      expect(component.csvFiles).toEqual([fileB]);
      expect(component.csvFileValidated).toEqual(false);
      expect(component.csvFileErrors).toEqual([]);
    }));
  });

  describe('readCsvFile', () => {
    it('does nothing if this.dataSourceType is null', async(() => {
      const { component } = testBedHelper.createComponent();

      // set initial component state
      component.dataSourceType = null;
      component.recordType = 'recordType';
      component.csvFiles = [new File([], 'fileA', {})];

      // mock FileReader
      const mockFileReader = jasmine.createSpyObj('FileReader', ['onloadend', 'readAsText']);
      mockFileReader.readAsText.and.returnValue();
      spyOn(window as any, 'FileReader').and.returnValue(mockFileReader);

      component.readCsvFile();

      expect(mockFileReader.readAsText).toHaveBeenCalledTimes(0);
    }));

    it('does nothing if this.recordType is null', async(() => {
      const { component } = testBedHelper.createComponent();

      // set initial component state
      component.dataSourceType = 'dataSourceType';
      component.recordType = null;
      component.csvFiles = [new File([], 'fileA', {})];

      // mock FileReader
      const mockFileReader = jasmine.createSpyObj('FileReader', ['onloadend', 'readAsText']);
      mockFileReader.readAsText.and.returnValue();
      spyOn(window as any, 'FileReader').and.returnValue(mockFileReader);

      component.readCsvFile();

      expect(mockFileReader.readAsText).toHaveBeenCalledTimes(0);
    }));

    it('does nothing if this.csvFiles[0] is null', async(() => {
      const { component } = testBedHelper.createComponent();

      // set initial component state
      component.dataSourceType = 'dataSourceType';
      component.recordType = 'recordType';
      component.csvFiles = [];

      // mock FileReader
      const mockFileReader = jasmine.createSpyObj('FileReader', ['onloadend', 'readAsText']);
      mockFileReader.readAsText.and.returnValue();
      spyOn(window as any, 'FileReader').and.returnValue(mockFileReader);

      component.readCsvFile();

      expect(mockFileReader.readAsText).toHaveBeenCalledTimes(0);
    }));

    it('calls validateCsvFile with file data', async(() => {
      const { component } = testBedHelper.createComponent();

      // set initial component state
      component.dataSourceType = 'dataSourceType';
      component.recordType = 'recordType';
      component.csvFiles = [new File([], 'fileA', {})];

      // mock FileReader
      const mockFileReader = jasmine.createSpyObj('FileReader', ['onloadend', 'readAsText']);
      mockFileReader.readAsText.and.callFake(() => {
        mockFileReader.result = 'fileData';
        mockFileReader.onloadend();
      });
      spyOn(window as any, 'FileReader').and.returnValue(mockFileReader);

      // mock component methods
      component.validateCsvFile = jasmine.createSpy('validateCsvFile');

      component.readCsvFile();

      expect(component.validateCsvFile).toHaveBeenCalledWith('fileData');
    }));
  });

  describe('validateCsvFile', () => {
    it('adds error to errors array if csvData is null', async(() => {
      const { component } = testBedHelper.createComponent();

      // set initial component state
      component.csvFiles = [new File([], 'fileA', {})];

      component.validateCsvFile(null);

      expect(component.csvFileErrors).toEqual(['Error reading csv file: fileA']);
    }));

    it('parses the csv data and calls validation methods', async(() => {
      const { component } = testBedHelper.createComponent();

      // set initial component state
      component.dataSourceType = 'cors-csv';
      component.recordType = 'Ticket';
      component.csvFiles = [new File([], 'fileA', {})];

      // stub validation methods
      component.validateRequiredHeaders = jasmine.createSpy('validateRequiredHeadersSpy');
      component.validateFields = jasmine.createSpy('validateFieldsSpy');

      const csvData = 'headerA,headerB,headerC\r\na,b,c\r\n\r\nd,e,f\r\n';

      component.validateCsvFile(csvData);

      expect(component.validateRequiredHeaders).toHaveBeenCalledWith(['headerA', 'headerB', 'headerC']);
      expect(component.validateFields).toHaveBeenCalledWith([
        ['headerA', 'headerB', 'headerC'],
        ['a', 'b', 'c'],
        ['d', 'e', 'f']
      ]);
      expect(component.csvFileValidated).toEqual(true);
      expect(component.csvFileErrors).toEqual([]);
    }));

    it('parses the csv data, calls validation methods and does not set csvFileValidated if errors found', async(() => {
      const { component } = testBedHelper.createComponent();

      // set initial component state
      component.csvFiles = [new File([], 'fileA', {})];

      // stub validation methods
      component.validateRequiredHeaders = jasmine.createSpy('validateRequiredHeadersSpy').and.callFake(() => {
        component.csvFileErrors = ['an error'];
      });
      component.validateFields = jasmine.createSpy('validateFieldsSpy');

      const csvData = 'headerA,headerB,headerC\r\na,b,c\r\n\r\nd,e,f\r\n';

      component.validateCsvFile(csvData);

      expect(component.validateRequiredHeaders).toHaveBeenCalledWith(['headerA', 'headerB', 'headerC']);
      expect(component.validateFields).toHaveBeenCalledWith([
        ['headerA', 'headerB', 'headerC'],
        ['a', 'b', 'c'],
        ['d', 'e', 'f']
      ]);
      expect(component.csvFileValidated).toEqual(false);
      expect(component.csvFileErrors).toEqual(['an error']);
    }));
  });

  describe('validateRequiredHeaders', () => {
    it('adds an error to the errors array if csvHeaderRowValuesArray is null', async(() => {
      const { component } = testBedHelper.createComponent();

      component.csvFiles = [new File([], 'fileA', {})];

      component.validateRequiredHeaders(null);

      expect(component.csvFileErrors).toEqual(['Error parsing csv file: fileA']);
    }));

    it('adds an error to the errors array if csvHeaderRowValuesArray is empty', async(() => {
      const { component } = testBedHelper.createComponent();

      component.csvFiles = [new File([], 'fileA', {})];

      component.validateRequiredHeaders([]);

      expect(component.csvFileErrors).toEqual(['Error parsing csv file: fileA']);
    }));

    it('adds an error to the errors array if any required headers are missing', async(() => {
      const { component } = testBedHelper.createComponent();

      component.dataSourceType = 'cors-csv';
      component.recordType = 'Ticket';
      component.csvFiles = [new File([], 'fileA', {})];

      // values found in CsvConstants.corsTicketCsvRequiredHeaders, with some removed to trigger validation errors
      component.validateRequiredHeaders([
        'CONTRAVENTION_ENFORCEMENT_ID',
        'TICKET_DATE',
        // 'FIRST_NAME',
        'MIDDLE_NAME',
        'LAST_NAME',
        'BUSINESS_NAME',
        'LOCATION_OF_VIOLATION',
        // 'TICKET_TYPE',
        'ACT',
        'REG',
        'REGULATION_DESCRIPTION',
        'SECTION',
        'SUB_SECTION',
        'PARAGRAPH',
        'PENALTY',
        // 'DESCRIPTION',
        'CASE_NUMBER'
        // 'BIRTH_DATE'
      ]);

      expect(component.csvFileErrors).toEqual([
        'CSV file is missing required column headers: FIRST_NAME,TICKET_TYPE,DESCRIPTION,BIRTH_DATE'
      ]);
    }));

    it('adds no errors to the errors array if no required headers are missing', async(() => {
      const { component } = testBedHelper.createComponent();

      component.dataSourceType = 'cors-csv';
      component.recordType = 'Ticket';
      component.csvFiles = [new File([], 'fileA', {})];

      component.validateRequiredHeaders(CsvConstants.corsTicketCsvRequiredHeaders);

      expect(component.csvFileErrors).toEqual([]);
    }));
  });

  describe('validateFields', () => {
    it('adds an error to the errors array if csvRows is null', async(() => {
      const { component } = testBedHelper.createComponent();

      component.csvFiles = [new File([], 'fileA', {})];

      component.validateFields(null);

      expect(component.csvFileErrors).toEqual(['Error parsing csv file: fileA']);
    }));

    it('adds an error to the errors array if csvRows is empty', async(() => {
      const { component } = testBedHelper.createComponent();

      component.csvFiles = [new File([], 'fileA', {})];

      component.validateFields([]);

      expect(component.csvFileErrors).toEqual(['Error parsing csv file: fileA']);
    }));

    it('calls validation methods', async(() => {
      const { component } = testBedHelper.createComponent();

      component.dataSourceType = 'cors-csv';
      component.recordType = 'Ticket';

      // mock component methods
      component.validateRequiredFields = jasmine.createSpy('validateRequiredFields');
      component.validateRequiredFormats = jasmine.createSpy('validateRequiredFormats');

      component.validateFields([
        ['headerA', 'headerB', 'headerC'],
        ['a', 'b', 'c'],
        ['d', 'e', 'f']
      ]);

      // calls validation methods on first row
      expect(component.validateRequiredFields).toHaveBeenCalledWith(
        ['a', 'b', 'c'],
        CsvConstants.corsTicketCsvRequiredFields,
        ['headerA', 'headerB', 'headerC'],
        1
      );
      expect(component.validateRequiredFormats).toHaveBeenCalledWith(
        ['a', 'b', 'c'],
        CsvConstants.corsTicketCsvRequiredFormats,
        ['headerA', 'headerB', 'headerC'],
        1
      );

      // calls validation methods on second row
      expect(component.validateRequiredFields).toHaveBeenCalledWith(
        ['d', 'e', 'f'],
        CsvConstants.corsTicketCsvRequiredFields,
        ['headerA', 'headerB', 'headerC'],
        2
      );
      expect(component.validateRequiredFormats).toHaveBeenCalledWith(
        ['d', 'e', 'f'],
        CsvConstants.corsTicketCsvRequiredFormats,
        ['headerA', 'headerB', 'headerC'],
        2
      );

      expect(component.csvFileErrors).toEqual([]);
    }));
  });

  describe('validateRequiredFields', () => {
    it('adds an error to the errors array if any required fields are missing', async(() => {
      const { component } = testBedHelper.createComponent();

      component.validateRequiredFields(
        ['a', 'b'],
        ['headerA', 'headerC', 'headerE'],
        ['headerA', 'headerB', 'headerC', 'headerE'],
        1
      );

      expect(component.csvFileErrors).toEqual(['CSV row 1 is missing required fields: headerC,headerE']);
    }));

    it('adds no errors to the errors array if no fields are required', async(() => {
      const { component } = testBedHelper.createComponent();

      component.validateRequiredFields(['a', 'b', 'c', 'e'], [], ['headerA', 'headerB', 'headerC', 'headerE'], 1);

      expect(component.csvFileErrors).toEqual([]);
    }));

    it('adds no errors to the errors array if no required fields are missing', async(() => {
      const { component } = testBedHelper.createComponent();

      component.validateRequiredFields(
        ['a', 'b', 'c', 'e'],
        ['headerA', 'headerC'],
        ['headerA', 'headerB', 'headerC', 'headerE'],
        1
      );

      expect(component.csvFileErrors).toEqual([]);
    }));
  });

  describe('validateRequiredFormats', () => {
    it('adds an error to the errors array if any fields are missing the required format', async(() => {
      const { component } = testBedHelper.createComponent();

      component.validateRequiredFormats(
        ['a', '12-2019-30', 'c', '30/12/2019'],
        [
          { field: 'headerB', type: 'date', format: 'YYYY-MM-DD' },
          { field: 'headerE', type: 'date', format: 'MM/DD/YYY' }
        ],
        ['headerA', 'headerB', 'headerC', 'headerE'],
        1
      );

      expect(component.csvFileErrors).toEqual([
        'CSV row 1, field: headerB - has invalid format, required format: YYYY-MM-DD',
        'CSV row 1, field: headerE - has invalid format, required format: MM/DD/YYY'
      ]);
    }));

    it('adds no errors to the errors array if no fields are missing the required format', async(() => {
      const { component } = testBedHelper.createComponent();

      component.validateRequiredFormats(
        ['a', '2019-12-30', 'c', '12/30/2019'],
        [
          { field: 'headerB', type: 'date', format: 'YYYY-MM-DD' },
          { field: 'headerE', type: 'date', format: 'MM/DD/YYY' }
        ],
        ['headerA', 'headerB', 'headerC', 'headerE'],
        1
      );

      expect(component.csvFileErrors).toEqual([]);
    }));
  });

  describe('transformFields', () => {
    it('calls validation methods', async(() => {
      const { component } = testBedHelper.createComponent();

      // mock component methods
      component.dataSourceType = 'cors-csv';
      component.recordType = 'Ticket';
      component.transformDateFields = jasmine.createSpy('transformDateFields');

      component.transformFields([
        ['headerA', 'headerB', 'headerC'],
        ['a', 'b', 'c'],
        ['d', 'e', 'f']
      ]);

      // calls transform methods on first row
      expect(component.transformDateFields).toHaveBeenCalledWith(
        ['a', 'b', 'c'],
        CsvConstants.corsTicketCsvDateFields,
        ['headerA', 'headerB', 'headerC']
      );

      // calls transform methods on second row
      expect(component.transformDateFields).toHaveBeenCalledWith(
        ['d', 'e', 'f'],
        CsvConstants.corsTicketCsvDateFields,
        ['headerA', 'headerB', 'headerC']
      );

      expect(component.csvFileErrors).toEqual([]);
    }));
  });

  describe('transformDateFields', () => {
    it('transforms dates to iso strings', async(() => {
      const { component } = testBedHelper.createComponent();

      const transformedRow: string[] = component.transformDateFields(
        ['2019/12/30', '12/30/2019', '30-Dec-2019'],
        [
          { field: 'headerA', format: 'YYYY/MM/DD' },
          { field: 'headerB', format: 'MM/DD/YYYY' },
          { field: 'headerC', format: 'DD-MMM-YYYY' }
        ],
        ['headerA', 'headerB', 'headerC']
      );

      expect(transformedRow.length).toEqual(3);
      expect(transformedRow[0]).toEqual(moment('2019/12/30', 'YYYY/MM/DD').toISOString());
      expect(transformedRow[1]).toEqual(moment('12/30/2019', 'MM/DD/YYYY').toISOString());
      expect(transformedRow[2]).toEqual(moment('30-Dec-2019', 'DD-MMM-YYYY').toISOString());
    }));
  });

  describe('startJob', () => {
    let factoryServiceSpy: jasmine.SpyObj<FactoryService>;

    beforeEach(async(() => {
      factoryServiceSpy = TestBed.get(FactoryService);
      factoryServiceSpy.startTask.calls.reset();
    }));

    it('does nothing if this.dataSourceType is null', async(async () => {
      const { component } = testBedHelper.createComponent();

      // set initial component state
      component.dataSourceType = null;
      component.recordType = 'recordType';
      component.csvFiles = [new File([], 'fileA', {})];

      await component.startJob();

      expect(factoryServiceSpy.startTask).toHaveBeenCalledTimes(0);
    }));

    it('does nothing if this.recordType is null', async(async () => {
      const { component } = testBedHelper.createComponent();

      // set initial component state
      component.dataSourceType = 'dataSourceType';
      component.recordType = null;
      component.csvFiles = [new File([], 'fileA', {})];

      await component.startJob();

      expect(factoryServiceSpy.startTask).toHaveBeenCalledTimes(0);
    }));

    it('does nothing if this.csvFiles is null or empty', async(async () => {
      const { component } = testBedHelper.createComponent();

      // set initial component state
      component.dataSourceType = 'dataSourceType';
      component.recordType = 'recordType';
      component.csvFiles = [];

      await component.startJob();

      expect(factoryServiceSpy.startTask).toHaveBeenCalledTimes(0);
    }));

    it('calls FactoryService.startTask', async(async () => {
      // set FactoryService mock behaviour
      factoryServiceSpy.startTask.and.returnValue(of());

      const { component } = testBedHelper.createComponent();

      const fileA = new File([], 'fileA', {});

      // set initial component state
      component.dataSourceType = 'dataSourceType';
      component.recordType = 'recordType';
      component.csvFiles = [fileA];
      component.transformedValidatedCsvFile = 'fileData';

      // mock component methods
      component.onFileDelete = jasmine.createSpy('onFileDelete');

      await component.startJob();

      expect(component.onFileDelete).toHaveBeenCalledWith(fileA);

      expect(factoryServiceSpy.startTask).toHaveBeenCalledWith({
        dataSourceType: 'dataSourceType',
        recordTypes: ['recordType'],
        csvData: 'fileData',
        taskType: 'csvImport'
      });
    }));
  });
});
