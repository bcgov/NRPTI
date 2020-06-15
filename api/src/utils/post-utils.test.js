const PostUtils = require('./post-utils');

const createMaster = function (args, res, next, incomingObj, flavourIds) {
  const fakeId = '123456789012';
  const mockSaveFunction = jest.fn(() =>
    Promise.resolve(
      {
        _id: fakeId,
        recordName: incomingObj.recordName,
        _flavourRecords: flavourIds,
        read: ['sysadmin'],
        write: ['sysadmin']
      }
    )
  );
  return { _id: fakeId, save: mockSaveFunction };
}

const createLNG = function (args, res, next, incomingObj) {
  const mockSaveFunction = jest.fn(() =>
    Promise.resolve(
      {
        _id: '321',
        recordName: incomingObj.recordName,
        description: incomingObj.description,
        read: ['sysadmin'],
        write: ['sysadmin']
      }
    )
  );
  return { save: mockSaveFunction };
}

describe('PostUtils', () => {
  describe('createRecordWithFlavours', () => {
    test('create order without flavours', async () => {
      const incomingObj = {
        recordName: 'testOrder1'
      };

      const response = await PostUtils.createRecordWithFlavours(null, null, null, incomingObj, createMaster, {});

      expect(response.status).toEqual('success');
      expect(response.object[0].recordName).toEqual('testOrder1');
    });

    test('create order with flavours', async () => {
      const incomingObj = {
        recordName: 'testOrder1',
        OrderLNG: {
          description: 'test LNG description'
        }
      };

      const flavourFunctions = { OrderLNG: createLNG };

      const response = await PostUtils.createRecordWithFlavours(null, null, null, incomingObj, createMaster, flavourFunctions);

      expect(response.status).toEqual('success');

      // Flavour
      expect(response.object[0].recordName).toEqual('testOrder1');
      expect(response.object[0].description).toEqual('test LNG description');

      // Master
      expect(response.object[1].recordName).toEqual('testOrder1');
    });
  });
});