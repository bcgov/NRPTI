const authUtils = require('./auth-utils');
const utils = require('./constants/misc');

describe('userIsAdminWildfire', () => {
  it('returns false if roles array is null', () => {
    const result = authUtils.userIsAdminWildfire([]);

    expect(result).toEqual(false);
  });

  it('returns false if roles array is emtpy', () => {
    const result = authUtils.userIsAdminWildfire([]);

    expect(result).toEqual(false);
  });

  it('returns false if roles array only contains the default roles', () => {
    const result = authUtils.userIsAdminWildfire([
      utils.ApplicationRoles.PUBLIC,
      utils.KeycloakDefaultRoles.PUBLIC,
      utils.KeycloakDefaultRoles.UMA_AUTHORIZATION
    ]);

    expect(result).toEqual(false);
  });

  it('returns false if roles array contains other admin roles', () => {
    const result = authUtils.userIsAdminWildfire([utils.ApplicationRoles.ADMIN_BCMI, utils.ApplicationRoles.ADMIN_WF]);

    expect(result).toEqual(false);
  });

  it('returns true if roles array only contains admin:wf role', () => {
    const result = authUtils.userIsAdminWildfire([utils.ApplicationRoles.ADMIN_WF]);

    expect(result).toEqual(true);
  });

  it('returns true if roles array contains admin:wf role and default roles', () => {
    const result = authUtils.userIsAdminWildfire([
      utils.ApplicationRoles.ADMIN_WF,
      utils.ApplicationRoles.PUBLIC,
      utils.KeycloakDefaultRoles.OFFLINE_ACCESS,
      utils.KeycloakDefaultRoles.UMA_AUTHORIZATION
    ]);

    expect(result).toEqual(true);
  });
});
