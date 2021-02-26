exports.SYSTEM_USER = 'SYSTEM_USER';

const ApplicationRoles = {
  ADMIN: 'sysadmin',
  ADMIN_AGRI: 'admin:agri',
  ADMIN_BCMI: 'admin:bcmi',
  ADMIN_ENV_EPD: 'admin:env-epd',
  ADMIN_FLNRO: 'admin:flnro',
  ADMIN_LNG: 'admin:lng',
  ADMIN_NRCED: 'admin:nrced',
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

exports.ApplicationLimitedAdminRoles = [
  ApplicationRoles.ADMIN_WF,
  ApplicationRoles.ADMIN_FLNRO,
  ApplicationRoles.ADMIN_AGRI,
  ApplicationRoles.ADMIN_ENV_EPD
]

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

exports.COURT_CONVICTION_PENALTY_TYPES = [
  'Community Service',
  'Court Order',
  'Creative Sentencing',
  'Fined',
  'Forfeiture',
  'Injunction',
  'Jailed',
  'Probation',
  'Restitution',
  'Restorative Justice',
  'Suspended Sentence',
  'Other'
];

exports.PENALTY_VALUE_TYPES = ['Years', 'Months', 'Days', 'Dollars', 'Hours', 'Other'];

exports.AUTHORIZED_PUBLISH_AGENCIES = [
  'BC Parks',
  'Climate Action Secretariat',
  'Conservation Officer Service',
  'Conservation Officer Service (COS)',
  'EAO',
  'Environmental Protection Division',
];
