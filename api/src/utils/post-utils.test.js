const PostUtils = require('./post-utils');
const utils = require('./constants/misc');

const DEFAULT_USER_ROLES = [...Object.values(utils.KeycloakDefaultRoles), utils.ApplicationRoles.PUBLIC];

// const createMaster = function (args, res, next, incomingObj, flavourIds) {
//   const fakeId = '123456789012';
//   const mockSaveFunction = jest.fn(() =>
//     Promise.resolve(
//       {
//         _id: fakeId,
//         recordName: incomingObj.recordName,
//         _flavourRecords: flavourIds,
//         read: ['sysadmin'],
//         write: ['sysadmin'],
//         issuedTo: {
//           read: ['sysadmin']
//         }
//       }
//     )
//   );
//   return { _id: fakeId, save: mockSaveFunction };
// }

// const createLNG = function (args, res, next, incomingObj) {
//   const mockSaveFunction = jest.fn(() =>
//     Promise.resolve(
//       {
//         _id: '321',
//         recordName: incomingObj.recordName,
//         description: incomingObj.description,
//         read: ['sysadmin'],
//         write: ['sysadmin'],
//         issuedTo: {
//           read: ['sysadmin']
//         }
//       }
//     )
//   );
//   return { save: mockSaveFunction };
// }

// describe('PostUtils', () => {
//   describe('createRecordWithFlavours', () => {
//     test('create order without flavours', async () => {
//       const incomingObj = {
//         recordName: 'testOrder1',
//         addRole: 'public',
//         issuedTo: {
//             addRole: 'public'
//         }
//       };

//       const response = await PostUtils.createRecordWithFlavours(null, null, null, incomingObj, createMaster, {});

//       expect(response.status).toEqual('success');
//       expect(response.object[0].recordName).toEqual('testOrder1');
//     });

//     test('create order with flavours', async () => {
//       const incomingObj = {
//         recordName: 'testOrder1',
//         OrderLNG: {
//           description: 'test LNG description',
//           addRole: 'public',
//           issuedTo: {
//             addRole: 'public'
//           }
//         }
//       };

//       const flavourFunctions = { OrderLNG: createLNG };

//       const response = await PostUtils.createRecordWithFlavours(null, null, null, incomingObj, createMaster, flavourFunctions);

//       expect(response.status).toEqual('success');

//       // Flavour
//       expect(response.object[0].recordName).toEqual('testOrder1');
//       expect(response.object[0].description).toEqual('test LNG description');

//       // Master
//       expect(response.object[1].recordName).toEqual('testOrder1');
//     });
//   });
// });

describe('PostUtils', () => {
  it('creates', async () => {
    return true;
  });

  test('setAdditionalRoleOnRecord does not alter record if arguments are emtpy', async () => {
    const record = {};
    PostUtils.setAdditionalRoleOnRecord(record, null, null);

    expect(record).toEqual({});
  });

  test('setAdditionalRoleOnRecord does not alter record if user is not a limited admin such as admin:wf', async () => {
    const record = {};
    PostUtils.setAdditionalRoleOnRecord(record, DEFAULT_USER_ROLES, utils.ApplicationRoles.ADMIN_WF);

    expect(record).toEqual({});
  });

  test('setAdditionalRoleOnRecord does not alter record if user has any other admin roles', async () => {
    const record = {};
    PostUtils.setAdditionalRoleOnRecord(
      record,
      [...DEFAULT_USER_ROLES, utils.ApplicationRoles.ADMIN],
      utils.ApplicationRoles.ADMIN_WF
    );

    expect(record).toEqual({});
  });

  test('setAdditionalRoleOnRecord alters record correctly if user one of the limited admins', async () => {
    const limitedAdmins = [utils.ApplicationRoles.ADMIN_WF, utils.ApplicationRoles.ADMIN_FLNRO, utils.ApplicationRoles.ADMIN_AGRI];

    for (const role of limitedAdmins) {
      const record = {
        read: [],
        write: [],
        issuedTo: {
          read: [],
          write: []
        }
      };
      PostUtils.setAdditionalRoleOnRecord(record, [...DEFAULT_USER_ROLES, role], limitedAdmins);

      expect(record).toEqual({
        read: [role],
        write: [role],
        issuedTo: {
          read: [role],
          write: [role]
        }
      });
    }
  });
});
