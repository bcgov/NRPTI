const EpicInspections = require('./epic-inspections');

describe('EpicInspections', () => {
  describe('transformRecord', () => {
    it('throws error if no epicRecord provided', () => {
      const epicInspections = new EpicInspections();
      expect(() => epicInspections.transformRecord()).toThrow(
        new Error('transformRecord - required record must be non-null.')
      );
    });

    it('returns a default nrpti record when empty epicRecord provided', () => {
      const epicInspections = new EpicInspections();

      const epicRecord = {};

      const actualRecord = epicInspections.transformRecord(epicRecord);

      const expectedRecord = {
        _schemaName: 'Inspection',
        documents: [
          {
            documentId: null,
            documentType: '',
            documentFileName: ''
          }
        ],
        read: ['sysadmin'],
        write: ['sysadmin']
      };

      expect(actualRecord).toEqual(expectedRecord);
    });

    it('returns a nrpti record with all supported epicRecord fields populated', () => {
      const epicInspections = new EpicInspections();

      const epicRecord = { _id: 123, documentType: 'docType', documentFileName: 'docFileName' };

      const actualRecord = epicInspections.transformRecord(epicRecord);

      const expectedRecord = {
        _schemaName: 'Inspection',
        documents: [
          {
            documentId: 123,
            documentType: 'docType',
            documentFileName: 'docFileName'
          }
        ],
        read: ['sysadmin'],
        write: ['sysadmin']
      };

      expect(actualRecord).toEqual(expectedRecord);
    });
  });

  describe('saveRecord', () => {
    it('throws error if no inspection record provided', async () => {
      const epicInspections = new EpicInspections();
      await expect(epicInspections.saveRecord()).rejects.toThrow(
        new Error('saveRecord - required record must be non-null.')
      );
    });

    it('catches any errors thrown when creating/saving the inspection record', async () => {
      // create mock Save function
      const mockSaveFunction = jest.fn(() => {
        throw Error('this should not be thrown');
      });

      // create mock inspection class
      const mockInspection = jest.fn().mockImplementation(() => {
        return { save: mockSaveFunction };
      });

      // spy on mongoose.model to return mock inspection class
      jest.spyOn(require('mongoose'), 'model').mockImplementation(() => {
        return mockInspection;
      });

      const epicInspections = new EpicInspections();

      const inspectionRecord = { _id: '321' };

      await expect(epicInspections.saveRecord(inspectionRecord)).resolves.not.toThrow();
    });

    it('creates and saves a new inspection record', async () => {
      // create mock Save function
      const mockSaveFunction = jest.fn(() => Promise.resolve('saved!'));

      // create mock inspection class
      const mockInspection = jest.fn().mockImplementation(() => {
        return { save: mockSaveFunction };
      });

      // spy on mongoose.model to return mock inspection class
      jest.spyOn(require('mongoose'), 'model').mockImplementation(() => {
        return mockInspection;
      });

      const epicInspections = new EpicInspections();

      const inspectionRecord = { _id: '123' };

      const dbStatus = await epicInspections.saveRecord(inspectionRecord);

      expect(mockInspection).toHaveBeenCalledWith(inspectionRecord);
      expect(mockSaveFunction).toHaveBeenCalledTimes(1);
      expect(dbStatus).toEqual('saved!');
    });
  });
});
