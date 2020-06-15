const PutUtils = require('./put-utils');

const testRecordName = 'testOrder1';
const fakeId = '123456789012';
const mockFindOneAndUpdate = jest.fn(() =>
  Promise.resolve(
    {
      _id: fakeId,
      recordName: testRecordName,
      _flavourRecords: ['321'],
      read: ['sysadmin'],
      write: ['sysadmin']
    }
  )
);
const editMaster = function (args, res, next, incomingObj, flavourIds) {
  return { _id: fakeId, findOneAndUpdate: mockFindOneAndUpdate };
}

const mockfindOneAndUpdateFlavour = jest.fn(() =>
  Promise.resolve(
    {
      _id: '321',
      recordName: testRecordName,
      description: 'test LNG description',
      read: ['sysadmin'],
      write: ['sysadmin']
    }
  )
);

const editLNG = function (args, res, next, incomingObj) {
  return { findOneAndUpdate: mockfindOneAndUpdateFlavour };
}

describe('PutUtils', () => {
  describe('editRecordWithFlavours', () => {
    const args = {
      swagger: {
        params: {
          auth_payload: 'MockPayload'
        }
      }
    };

    test('edit order without flavours', async () => {
      const mongoose = require('mongoose');
      mongoose.model = jest.fn((schema) => {
        if (schema === 'Order') {
          return { findOneAndUpdate: mockFindOneAndUpdate };
        } else {
          return { findOneAndUpdate: mockfindOneAndUpdateFlavour };
        }
      });

      const incomingObj = {
        recordName: testRecordName
      };

      const response = await PutUtils.editRecordWithFlavours(args, null, null, incomingObj, editMaster, null, 'Order', {});

      expect(response.status).toEqual('success');
      expect(response.object[0].recordName).toEqual(testRecordName);
    });

    test('edit order with flavours', async () => {
      const mongoose = require('mongoose');
      mongoose.model = jest.fn((schema) => {
        if (schema === 'Order') {
          return { findOneAndUpdate: mockFindOneAndUpdate };
        } else {
          return { findOneAndUpdate: mockfindOneAndUpdateFlavour };
        }
      });

      let incomingObj = {
        recordName: 'testOrder1',
        OrderLNG: {
          _id: '321',
          description: 'test LNG description'
        }
      };

      const flavourFunctions = { OrderLNG: editLNG };

      let response = await PutUtils.editRecordWithFlavours(args, null, null, incomingObj, editMaster,
        null, 'Order', flavourFunctions);

      expect(response.status).toEqual('success');

      // Flavour
      expect(response.object[0].recordName).toEqual('testOrder1');
      expect(response.object[0].description).toEqual('test LNG description');

      // Master
      expect(response.object[1].recordName).toEqual('testOrder1');
    });
  });
});