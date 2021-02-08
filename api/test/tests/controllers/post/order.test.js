const Order = require('../../../../src/controllers/post/order');
const { generateSwaggerParams } = require('../../../factories/factory_helper')
const { ApplicationRoles } = require('../../../../src/utils/constants/misc');

// May require additional time for downloading MongoDB binaries
jasmine.DEFAULT_TIMEOUT_INTERVAL = 600000;

require('../../../../src/models');

describe('order additional admin roles', () => {
  describe('createMaster', () => {
    it('creates master record without additional admin role when user is not an additional admin', async () => {
      const adminArgs = generateSwaggerParams({userRoles: ApplicationRoles.ADMIN});

      for (const role of Order.ADDITIONAL_ROLES) {
        const result = Order.createMaster(adminArgs, null, null, {});

        expect(result.read).toEqual(expect.not.arrayContaining([role]));
        expect(result.write).toEqual(expect.not.arrayContaining([role]));
        expect(result.issuedTo.read).toEqual(expect.not.arrayContaining([role]));
        expect(result.issuedTo.write).toEqual(expect.not.arrayContaining([role]));
      }
    });

    it('creates master record with additional admin role when user is an additional admin', async () => {
      for (const role of Order.ADDITIONAL_ROLES) {
        const roleArgs = generateSwaggerParams({userRoles: role});
        const result = Order.createMaster(roleArgs, null, null, {});

        expect(result.read).toEqual(expect.arrayContaining([role]));
        expect(result.write).toEqual(expect.arrayContaining([role]));
        expect(result.issuedTo.read).toEqual(expect.arrayContaining([role]));
        expect(result.issuedTo.write).toEqual(expect.arrayContaining([role]));
      }
    });
  });

  describe('createNRCED', () => {
    it('creates NRCED record without additional admin role when user is not an additional admin', async () => {
      const adminArgs = generateSwaggerParams({userRoles: ApplicationRoles.ADMIN});

      for (const role of Order.ADDITIONAL_ROLES) {
        const result = Order.createNRCED(adminArgs, null, null, {});

        expect(result.read).toEqual(expect.not.arrayContaining([role]));
        expect(result.write).toEqual(expect.not.arrayContaining([role]));
        expect(result.issuedTo.read).toEqual(expect.not.arrayContaining([role]));
        expect(result.issuedTo.write).toEqual(expect.not.arrayContaining([role]));
      }
    });

    it('creates NRCED record with additional admin role when user is an additional admin', async () => {
      for (const role of Order.ADDITIONAL_ROLES) {
        const roleArgs = generateSwaggerParams({userRoles: role});
        const result = Order.createNRCED(roleArgs, null, null, {});

        expect(result.read).toEqual(expect.arrayContaining([role]));
        expect(result.write).toEqual(expect.arrayContaining([role]));
        expect(result.issuedTo.read).toEqual(expect.arrayContaining([role]));
        expect(result.issuedTo.write).toEqual(expect.arrayContaining([role]));
      }
    });
  });

  describe('createLNG', () => {
    it('creates LNG record without additional admin role when user is not an additional admin', async () => {
      const adminArgs = generateSwaggerParams({userRoles: ApplicationRoles.ADMIN});

      for (const role of Order.ADDITIONAL_ROLES) {
        const result = Order.createLNG(adminArgs, null, null, {});

        expect(result.read).toEqual(expect.not.arrayContaining([role]));
        expect(result.write).toEqual(expect.not.arrayContaining([role]));
        expect(result.issuedTo.read).toEqual(expect.not.arrayContaining([role]));
        expect(result.issuedTo.write).toEqual(expect.not.arrayContaining([role]));
      }
    });

    it('creates LNG record with additional admin role when user is an additional admin', async () => {
      for (const role of Order.ADDITIONAL_ROLES) {
        const roleArgs = generateSwaggerParams({userRoles: role});
        const result = Order.createLNG(roleArgs, null, null, {});

        expect(result.read).toEqual(expect.arrayContaining([role]));
        expect(result.write).toEqual(expect.arrayContaining([role]));
        expect(result.issuedTo.read).toEqual(expect.arrayContaining([role]));
        expect(result.issuedTo.write).toEqual(expect.arrayContaining([role]));
      }
    });
  });

  describe('createBCMI', () => {
    it('creates BCMI record without additional admin role when user is not an additional admin', async () => {
      const adminArgs = generateSwaggerParams({userRoles: ApplicationRoles.ADMIN});

      for (const role of Order.ADDITIONAL_ROLES) {
        const result = Order.createBCMI(adminArgs, null, null, {});

        expect(result.read).toEqual(expect.not.arrayContaining([role]));
        expect(result.write).toEqual(expect.not.arrayContaining([role]));
        expect(result.issuedTo.read).toEqual(expect.not.arrayContaining([role]));
        expect(result.issuedTo.write).toEqual(expect.not.arrayContaining([role]));
      }
    });

    it('creates BCMI record with additional admin role when user is an additional admin', async () => {
      for (const role of Order.ADDITIONAL_ROLES) {
        const roleArgs = generateSwaggerParams({userRoles: role});
        const result = Order.createBCMI(roleArgs, null, null, {});

        expect(result.read).toEqual(expect.arrayContaining([role]));
        expect(result.write).toEqual(expect.arrayContaining([role]));
        expect(result.issuedTo.read).toEqual(expect.arrayContaining([role]));
        expect(result.issuedTo.write).toEqual(expect.arrayContaining([role]));
      }
    });
  });
});
