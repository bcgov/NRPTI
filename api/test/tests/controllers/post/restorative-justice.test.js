const RestorativeJustice = require('../../../../src/controllers/post/restorative-justice');
const { generateSwaggerParams } = require('../../../factories/factory_helper');
const { ApplicationRoles } = require('../../../../src/utils/constants/misc');

// May require additional time for downloading MongoDB binaries
jest.DEFAULT_TIMEOUT_INTERVAL = 600000;

require('../../../../src/models');

describe('restorative-justice additional admin roles', () => {
  describe('createMaster', () => {
    it('creates master record without additional admin role when user is not an additional admin', async () => {
      const adminArgs = generateSwaggerParams({ userRoles: ApplicationRoles.ADMIN });

      for (const role of RestorativeJustice.ADDITIONAL_ROLES) {
        const result = RestorativeJustice.createMaster(adminArgs, null, null, {});

        expect(result.read).toEqual(expect.not.arrayContaining([role]));
        expect(result.write).toEqual(expect.not.arrayContaining([role]));
        expect(result.issuedTo.read).toEqual(expect.not.arrayContaining([role]));
        expect(result.issuedTo.write).toEqual(expect.not.arrayContaining([role]));
      }
    });

    it('creates master record with additional admin role when user is an additional admin', async () => {
      for (const role of RestorativeJustice.ADDITIONAL_ROLES) {
        const roleArgs = generateSwaggerParams({ userRoles: role });
        const result = RestorativeJustice.createMaster(roleArgs, null, null, {});

        expect(result.read).toEqual(expect.arrayContaining([role]));
        expect(result.write).toEqual(expect.arrayContaining([role]));
        expect(result.issuedTo.read).toEqual(expect.arrayContaining([role]));
        expect(result.issuedTo.write).toEqual(expect.arrayContaining([role]));
      }
    });
  });

  describe('createNRCED', () => {
    it('creates NRCED record without additional admin role when user is not an additional admin', async () => {
      const adminArgs = generateSwaggerParams({ userRoles: ApplicationRoles.ADMIN });

      for (const role of RestorativeJustice.ADDITIONAL_ROLES) {
        const result = RestorativeJustice.createNRCED(adminArgs, null, null, {});

        expect(result.read).toEqual(expect.not.arrayContaining([role]));
        expect(result.write).toEqual(expect.not.arrayContaining([role]));
        expect(result.issuedTo.read).toEqual(expect.not.arrayContaining([role]));
        expect(result.issuedTo.write).toEqual(expect.not.arrayContaining([role]));
      }
    });

    it('creates NRCED record with additional admin role when user is an additional admin', async () => {
      for (const role of RestorativeJustice.ADDITIONAL_ROLES) {
        const roleArgs = generateSwaggerParams({ userRoles: role });
        const result = RestorativeJustice.createNRCED(roleArgs, null, null, {});

        expect(result.read).toEqual(expect.arrayContaining([role]));
        expect(result.write).toEqual(expect.arrayContaining([role]));
        expect(result.issuedTo.read).toEqual(expect.arrayContaining([role]));
        expect(result.issuedTo.write).toEqual(expect.arrayContaining([role]));
      }
    });
  });

  describe('createLNG', () => {
    it('creates LNG record without additional admin role when user is not an additional admin', async () => {
      const adminArgs = generateSwaggerParams({ userRoles: ApplicationRoles.ADMIN });

      for (const role of RestorativeJustice.ADDITIONAL_ROLES) {
        const result = RestorativeJustice.createLNG(adminArgs, null, null, {});

        expect(result.read).toEqual(expect.not.arrayContaining([role]));
        expect(result.write).toEqual(expect.not.arrayContaining([role]));
        expect(result.issuedTo.read).toEqual(expect.not.arrayContaining([role]));
        expect(result.issuedTo.write).toEqual(expect.not.arrayContaining([role]));
      }
    });

    it('creates LNG record with additional admin role when user is an additional admin', async () => {
      for (const role of RestorativeJustice.ADDITIONAL_ROLES) {
        const roleArgs = generateSwaggerParams({ userRoles: role });
        const result = RestorativeJustice.createLNG(roleArgs, null, null, {});

        expect(result.read).toEqual(expect.arrayContaining([role]));
        expect(result.write).toEqual(expect.arrayContaining([role]));
        expect(result.issuedTo.read).toEqual(expect.arrayContaining([role]));
        expect(result.issuedTo.write).toEqual(expect.arrayContaining([role]));
      }
    });
  });
});
