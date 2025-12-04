const Collections = require('./collection-utils');
const mongoose = require('mongoose');
const CollectionController = require('../../controllers/collection-controller');

jest.mock('../../controllers/collection-controller');

describe('Collections', () => {
  describe('constructor', () => {
    it('throws an error if no auth_payload provided', () => {
      expect(() => {
        new Collections(null, {});
      }).toThrow('CollectionUtils - required auth_payload must be non-null.');
    });

    it('throws an error if no recordType provided', () => {
      expect(() => {
        new Collections({}, null);
      }).toThrow('CollectionUtils - required recordType must be non-null.');
    });
  });

  describe('findExistingRecord', () => {
    it('returns null if no existing record found', async () => {
      const collectionUtils = new Collections({}, {});
      mongoose.model = jest.fn(() => ({
        findOne: jest.fn(() => null)
      }));

      const result = await collectionUtils.findExistingRecord('permit_amendment_guid');
      expect(result).toBeNull();
    });

    it('returns existing collection record if found', async () => {
      const existingRecord = { _id: 123, _sourceRefCoreCollectionId: 'permit_amendment_guid' };
      const collectionUtils = new Collections({}, {});
      mongoose.model = jest.fn(() => ({
        findOne: jest.fn(() => existingRecord)
      }));

      const result = await collectionUtils.findExistingRecord('permit_amendment_guid');
      expect(result).toEqual(existingRecord);
    });
  });

  jest.mock('../../controllers/collection-controller', () => ({
    createCollection: jest.fn(),
    updateCollection: jest.fn()
  }));

  describe('createItem', () => {
    it('throws an error if no nrptiRecord provided', async () => {
      const collectionUtils = new Collections({}, {});
      await expect(collectionUtils.createItem(null)).rejects.toThrow(
        'createItem - required nrptiRecord must be non-null.'
      );
    });

    it('calls createCollection with correct arguments', async () => {
      const mockNrptiRecord = {
        _sourceRefCoreCollectionId: '1b0d6d2d-b2ee-5aa7-72b9-1e8f4e4c353f',
        project: '5fa1e3f34635c865df00c519',
        name: 'Permit Documents',
        date: null,
        type: 'Permit Amendment',
        agency: 'AGENCY_EMLI',
        records: [],
        addRole: 'public'
      };

      CollectionController.createCollection.mockResolvedValue('SomeReturnValue');

      const collectionUtils = new Collections({}, {});
      await collectionUtils.createItem(mockNrptiRecord);

      expect(CollectionController.createCollection).toHaveBeenCalledWith(
        mockNrptiRecord,
        collectionUtils.auth_payload.displayName
      );
    });
  });

  describe('updateItem', () => {
    it('throws an error if no updateObj provided', async () => {
      const collectionUtils = new Collections({}, {});
      await expect(collectionUtils.updateItem(null, {})).rejects.toThrow(
        'updateRecord - required updateObj must be non-null.'
      );
    });

    it('throws an error if no existingRecord provided', async () => {
      const collectionUtils = new Collections({}, {});
      await expect(collectionUtils.updateItem({}, null)).rejects.toThrow(
        'updateRecord - required existingRecord must be non-null.'
      );
    });

    it('calls createCollection with correct arguments', async () => {
      const mockUpdateObj = {
        _sourceRefCoreCollectionId: '1b0d6d2d-b2ee-5aa7-72b9-1e8f4e4c353f',
        project: '5fa1e3f34635c865df00c519',
        name: 'Permit Documents',
        date: null,
        type: 'Permit Amendment',
        agency: 'AGENCY_EMLI',
        records: [],
        addRole: 'public'
      };
      const mockExistingRecord = {
        _sourceRefCoreCollectionId: '1b0d6d2d-b2ee-5aa7-72b9-1e8f4e4c353f',
        project: '5fa1e3f34635c865df00c519',
        name: 'Permit Documents 2',
        date: null,
        type: 'Permit Amendment',
        agency: 'AGENCY_EMLI',
        records: [],
        addRole: 'public'
      };

      CollectionController.updateCollection.mockResolvedValue('SomeReturnValue');

      const collectionUtils = new Collections({}, {});
      await collectionUtils.updateItem(mockUpdateObj, mockExistingRecord);

      expect(CollectionController.updateCollection).toHaveBeenCalledWith(
        mockUpdateObj,
        mockExistingRecord._id,
        collectionUtils.auth_payload.displayName
      );
    });
  });
});
