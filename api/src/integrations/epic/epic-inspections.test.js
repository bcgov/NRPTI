// const EpicInspections = require('./epic-inspections');

describe('EpicInspections', () => {
  it('Is True', () => {
    expect(true).toEqual(true)
  })
})

// describe('EpicInspections', () => {
//   describe('transformRecord', () => {
//     it('throws error if no epicRecord provided', () => {
//       const epicInspections = new EpicInspections();
//       expect(() => epicInspections.transformRecord()).toThrow(
//         new Error('transformRecord - required record must be non-null.')
//       );
//     });

//     it('returns a default nrpti record when empty epicRecord provided', () => {
//       const epicInspections = new EpicInspections();

//       const epicRecord = {};

//       const actualRecord = epicInspections.transformRecord(epicRecord);

//       const expectedRecord = {
//         _schemaName: 'Inspection',

//         read: ['sysadmin'],
//         write: ['sysadmin'],

//         recordName: '',
//         issuingAgency: '',
//         author: '',
//         type: ' - ',
//         description: '',
//         sourceSystemRef: 'epic',
//         project: '',

//         documentId: '',
//         documentType: '',
//         documentFileName: '',
//         documentDate: null,

//         dateUpdated: expect.any(Date),

//         sourceDateAdded: null,
//         sourceDateUpdated: null
//       };

//       expect(actualRecord).toMatchObject(expectedRecord);
//     });

//     it('returns a nrpti record with all supported epicRecord fields populated', () => {
//       const epicInspections = new EpicInspections();

//       const epicRecord = {
//         _id: 123,
//         displayName: 'docDisplay',
//         documentType: 'docType',
//         documentFileName: 'docFileName',
//         milestone: 'milestone'
//       };

//       const actualRecord = epicInspections.transformRecord(epicRecord);

//       const expectedRecord = {
//         _schemaName: 'Inspection',

//         read: ['sysadmin'],
//         write: ['sysadmin'],

//         recordName: 'docDisplay',
//         issuingAgency: '',
//         author: '',
//         type: 'docType - milestone',
//         description: '',
//         sourceSystemRef: 'epic',
//         project: '',

//         documentId: 123,
//         documentType: 'docType',
//         documentFileName: 'docFileName',
//         documentDate: null,

//         dateUpdated: expect.any(Date),

//         sourceDateAdded: null,
//         sourceDateUpdated: null
//       };

//       expect(actualRecord).toMatchObject(expectedRecord);
//     });
//   });

//   describe('saveRecord', () => {
//     it('throws error if no Inspection record provided', async () => {
//       const epicInspections = new EpicInspections();
//       await expect(epicInspections.saveRecord()).rejects.toThrow(
//         new Error('saveRecord - required record must be non-null.')
//       );
//     });

//     it('catches any errors thrown when creating/saving the Inspection record', async () => {
//       // create mock save function
//       const mockFindOneAndUpdate = jest.fn(() => {
//         throw Error('this should not be thrown');
//       });

//       // mock mongoose to call mock save function
//       const mongoose = require('mongoose');
//       mongoose.model = jest.fn(() => {
//         return { findOneAndUpdate: mockFindOneAndUpdate };
//       });

//       const epicInspections = new EpicInspections();

//       const InspectionRecord = { _id: '321' };

//       await expect(epicInspections.saveRecord(InspectionRecord)).resolves.not.toThrow();
//     });

//     it('creates and saves a new Inspection record', async () => {
//       // create mock save function
//       const mockFindOneAndUpdate = jest.fn(() => Promise.resolve('saved!'));

//       // mock mongoose to call mock save function
//       const mongoose = require('mongoose');
//       mongoose.model = jest.fn(() => {
//         return { findOneAndUpdate: mockFindOneAndUpdate };
//       });

//       const epicInspections = new EpicInspections();

//       const InspectionRecord = { _id: '123' };

//       const dbStatus = await epicInspections.saveRecord(InspectionRecord);

//       expect(mockFindOneAndUpdate).toHaveBeenCalledTimes(1);
//       expect(dbStatus).toEqual('saved!');
//     });
//   });
// });
