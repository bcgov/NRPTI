exports.SYSTEM_USER = 'SYSTEM_USER';

const ApplicationRoles = {
  ADMIN: 'sysadmin',
  ADMIN_NRCED: 'admin:nrced',
  ADMIN_LNG: 'admin:lng',
  ADMIN_BCMI: 'admin:bcmi',
  ADMIN_WF: 'admin:wf',
  PUBLIC: 'public'
};

exports.ApplicationRoles = ApplicationRoles;

exports.ApplicationAdminRoles = [
  ApplicationRoles.ADMIN,
  ApplicationRoles.ADMIN_NRCED,
  ApplicationRoles.ADMIN_LNG,
  ApplicationRoles.ADMIN_BCMI
];

exports.KeycloakDefaultRoles = {
  OFFLINE_ACCESS: 'offline_access',
  UMA_AUTHORIZATION: 'uma_authorization'
};

exports.IssuedToEntityTypes = {
  Company: 'Company',
  Individual: 'Individual',
  IndividualCombined: 'IndividualCombined'
};

exports.CoorsCsvIssuingAgencies = {
  BC_Parks: 'BC Parks',
  Conservation_Officer_Service: 'Conservation Officer Service'
};

exports.EpicProjectIds = {
  lngCanadaId: '588511d0aaecd9001b826192',
  coastalGaslinkId: '588511c4aaecd9001b825604'
};

exports.MASTER_SCHEMA_NAMES = [
  'AdministrativePenalty',
  'AdministrativeSanction',
  'Agreement',
  'AnnualReport',
  'Certificate',
  'CertificateAmendment',
  'ConstructionPlan',
  'Correspondence',
  'CourtConviction',
  'DamSafetyInspection',
  'Inspection',
  'ManagementPlan',
  'Order',
  'Permit',
  'Report',
  'RestorativeJustice',
  'SelfReport',
  'Ticket',
  'Warning'
];

exports.LNG_SCHEMA_NAMES = [
  'ActivityLNG',
  'AdministrativePenaltyLNG',
  'AdministrativeSanctionLNG',
  'AgreementLNG',
  'CertificateLNG',
  'CertificateAmendmentLNG',
  'ConstructionPlanLNG',
  'CourtConvictionLNG',
  'InspectionLNG',
  'ManagementPlanLNG',
  'OrderLNG',
  'PermitLNG',
  'RestorativeJusticeLNG',
  'SelfReportLNG',
  'TicketLNG',
  'WarningLNG'
];

exports.NRCED_SCHEMA_NAMES = [
  'AdministrativePenaltyNRCED',
  'AdministrativeSanctionNRCED',
  'CorrespondenceNRCED',
  'CourtConvictionNRCED',
  'DamSafetyInspectionNRCED',
  'InspectionNRCED',
  'OrderNRCED',
  'ReportNRCED',
  'RestorativeJusticeNRCED',
  'TicketNRCED',
  'WarningNRCED'
];

exports.BCMI_SCHEMA_NAMES = [
  'AnnualReportBCMI',
  'CertificateBCMI',
  'CertificateAmendmentBCMI',
  'ConstructionPlanBCMI',
  'CollectionBCMI',
  'CorrespondenceBCMI',
  'DamSafetyInspectionBCMI',
  'InspectionBCMI',
  'ManagementPlanBCMI',
  'MineBCMI',
  'OrderBCMI',
  'PermitBCMI',
  'ReportBCMI'
];
