exports.SYSTEM_USER = 'SYSTEM_USER';

// Available user roles.
exports.ROLES = {
  SYSADMIN: 'sysadmin',
  LNGADMIN: 'admin:lng',
  NRCEDADMIN: 'admin:nrced',
  BCMIADMIN: 'admin:bcmi',

  ADMIN_ROLES: [
    'sysadmin',
    'admin:lng',
    'admin:nrced',
    'admin:bcmi'
  ]
};

exports.IssuedToEntityTypes = {
  Company: 'Company',
  Individual: 'Individual',
  IndividualCombined: 'IndividualCombined'
};

exports.CorsCsvIssuingAgencies = {
  BC_Parks: 'BC Parks',
  Conservation_Officer_Service: 'Conservation Officer Service'
};
