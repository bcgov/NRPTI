const InspectionsUtils = require('./inspectionsUtils-utils');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');

describe('InspectionsUtils', () => {
  describe('transformRecord', () => {
    it('throws error if no epicRecord provided', async () => {
      const inspectionsUtils = new InspectionsUtils();

      try {
        await inspectionsUtils.transformRecord();
      } catch (error) {
        expect(error).toEqual(new Error('transformRecord - required record must be non-null.'));
      }
    });

    it('returns a default nrpti record when empty epicRecord provided', async () => {
      const inspectionsUtils = new InspectionsUtils();

      const epicRecord = {};

      const actualRecord = await inspectionsUtils.transformRecord(epicRecord);

      const expectedRecord = {
        _schemaName: RECORD_TYPE.Inspection._schemaName,

        _epicProjectId: '',
        _sourceRefId: '',
        _epicMilestoneId: '',

        read: ['sysadmin'],
        write: ['sysadmin'],

        recordName: '',
        recordType: RECORD_TYPE.Inspection.displayName,
        dateIssued: null,
        issuingAgency: 'Environmental Assessment Office',
        author: '',
        legislation: '',
        projectName: '',
        location: '',
        centroid: '',

        dateAdded: expect.any(Date),
        dateUpdated: expect.any(Date),
        updatedBy: '',
        sourceDateAdded: null,
        sourceDateUpdated: null,
        sourceSystemRef: 'epic'
      };

      expect(actualRecord).toMatchObject(expectedRecord);
    });

    it('returns a nrpti record with all supported epicRecord fields populated', async () => {
      const inspectionsUtils = new InspectionsUtils();

      const epicRecord = {
        _id: 123,
        displayName: 'docDisplay',
        documentFileName: 'docFileName',
        project: {
          name: 'projectName',
          legislation: 'projectLegislation'
        },
        milestone: 'milestone'
      };

      const actualRecord = await inspectionsUtils.transformRecord(epicRecord);

      const expectedRecord = {
        _schemaName: RECORD_TYPE.Inspection._schemaName,

        _epicProjectId: '',
        _sourceRefId: 123,
        _epicMilestoneId: 'milestone',

        read: ['sysadmin'],
        write: ['sysadmin'],

        recordName: 'docDisplay',
        recordType: RECORD_TYPE.Inspection.displayName,
        dateIssued: null,
        issuingAgency: 'Environmental Assessment Office',
        author: '',
        legislation: 'projectLegislation',
        projectName: 'projectName',
        location: '',
        centroid: '',

        dateAdded: expect.any(Date),
        dateUpdated: expect.any(Date),
        updatedBy: '',
        sourceDateAdded: null,
        sourceDateUpdated: null,
        sourceSystemRef: 'epic'
      };

      expect(actualRecord).toMatchObject(expectedRecord);
    });
  });

  describe('saveRecord', () => {
    it('throws error if no inspection record provided', async () => {
      const inspectionsUtils = new InspectionsUtils();
      await expect(inspectionsUtils.saveRecord()).rejects.toThrow(
        new Error('saveRecord - required record must be non-null.')
      );
    });

    it('catches any errors thrown when creating/saving the inspection record', async () => {
      // create mock save function
      const mockFindOneAndUpdate = jest.fn(() => {
        throw Error('this should not be thrown');
      });

      // mock mongoose to call mock save function
      const mongoose = require('mongoose');
      mongoose.model = jest.fn(() => {
        return { findOneAndUpdate: mockFindOneAndUpdate };
      });

      const inspectionsUtils = new InspectionsUtils();

      const inspectionRecord = { _id: '321' };

      await expect(inspectionsUtils.saveRecord(inspectionRecord)).resolves.not.toThrow();
    });

    it('creates and saves a new inspection record', async () => {
      // create mock save function
      const mockFindOneAndUpdate = jest.fn(() => Promise.resolve('saved!'));

      // mock mongoose to call mock save function
      const mongoose = require('mongoose');
      mongoose.model = jest.fn(() => {
        return { findOneAndUpdate: mockFindOneAndUpdate };
      });

      const inspectionsUtils = new InspectionsUtils();

      const inspectionRecord = { _id: '123' };

      const dbStatus = await inspectionsUtils.saveRecord(inspectionRecord);

      expect(mockFindOneAndUpdate).toHaveBeenCalledTimes(1);
      expect(dbStatus).toEqual('saved!');
    });
  });
});
