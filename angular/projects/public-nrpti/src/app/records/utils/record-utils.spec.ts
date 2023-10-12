import { RecordUtils } from './record-utils';
import moment from 'moment';

const mockData = [
  {
    recordType: 'testRecord',
    dateIssued: '2023-10-11',
    issuedTo: {
      type: 'Company',
      companyName: 'This company doesnt exist'
    },
    summary: 'In summary, this is a test',
    issuingAgency: 'testCode',
    legislation: {
      act: '1',
      regulation: '2',
      section: '3',
      subSection: '4',
      paragraph: '5',
      legislationDescription: 'This sounds serious'
    },
    offence: 'None',
    penalties: '',
    projectName: 'Test Project',
    location: 'BC',
    centroid: ['1', '2'],
    outcomeDescription: 'The outcome was a success, hooray!'
  }
];
const expectedOutput = `Record Type,Issued On,Issued To,Summary,Issuing Agency,Legislation Act,Regulation,Section,Sub Section,Paragraph,Description,Offence,Penalties,Site/Project,Location,Latitude,Longitude,Outcome Description
"testRecord","2023-10-11","Company",This company doesnt exist,"In summary, this is a test","testCode","1","2","3","4","5","This sounds serious","None","","BC","1","2","The outcome was a success, hooray!"`;

describe('RecordUtils', () => {
  describe('exportToCsv', () => {
    it('should call the download function with the expected data', () => {
      // Defining spies
      const downloadSpy = jasmine.createSpyObj('a', ['click']);
      spyOn(moment.prototype, 'format').and.returnValue('this-is-the-time');
      spyOn(document, 'createElement').and.returnValue(downloadSpy);
      spyOn(window.URL, 'createObjectURL').and.callThrough();

      // Executing exportToCsv function
      RecordUtils.exportToCsv(mockData);

      // Ensuring expected behaviour
      expect(document.createElement).toHaveBeenCalledTimes(1);
      expect(document.createElement).toHaveBeenCalledWith('a');

      expect(window.URL.createObjectURL).toHaveBeenCalledWith(new Blob([expectedOutput], { type: 'text/plain' }))
      expect(downloadSpy.href).toBeDefined()
      expect(downloadSpy.download).toContain('nrced-export-this-is-the-time.csv');
    });
  });
});
