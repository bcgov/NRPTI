exports.SYSTEM_USER = 'SYSTEM_USER';

const ApplicationRoles = {
  ADMIN: 'sysadmin',
  ADMIN_AGRI: 'admin:agri',
  ADMIN_BCMI: 'admin:bcmi',
  ADMIN_ENV_EPD: 'admin:env-epd',
  ADMIN_ENV_BCPARKS: 'admin:env-bcparks',
  ADMIN_ENV_COS: 'admin:env-cos',
  ADMIN_FLNRO: 'admin:flnro',
  ADMIN_FLNR_NRO: 'admin:flnr-nro',
  ADMIN_LNG: 'admin:lng',
  ADMIN_NRCED: 'admin:nrced',
  ADMIN_WF: 'admin:wf',
  ADMIN_ALC: 'admin:alc',
  ADMIN_WLRS: 'admin:wlrs',
  PUBLIC: 'public'
};

exports.ApplicationRoles = ApplicationRoles;

const ApplicationAgencies = {
  AGENCY_ALC: 'Agricultural Land Commission',
  AGENCY_WF: 'BC Wildfire Service',
  AGENCY_ENV_COS: 'Conservation Officer Service',
  AGENCY_EAO: 'Environmental Assessment Office',
  AGENCY_EMLI: 'Ministry of Energy Mines and Low Carbon Innovation',
  AGENCY_ENV: 'Ministry of Environment and Climate Change Strategy',
  AGENCY_ENV_BCPARKS: 'BC Parks',
  AGENCY_OGC: 'BC Energy Regulator',
  AGENCY_ENV_EPD: 'Ministry of Environment and Climate Change Strategy',
  AGENCY_LNG: 'LNG Secretariat',
  AGENCY_AGRI: 'Ministry of Agriculture and Food',
  AGENCY_FLNRO: 'Ministry of Forests',
  AGENCY_FLNR_NRO: 'Natural Resource Officers',
  AGENCY_WLRS: 'Ministry of Water, Land and Resource Stewardship'
};

exports.ApplicationAgencies = ApplicationAgencies;

exports.ApplicationAdminRoles = [
  ApplicationRoles.ADMIN,
  ApplicationRoles.ADMIN_NRCED,
  ApplicationRoles.ADMIN_LNG,
  ApplicationRoles.ADMIN_BCMI
];

exports.ApplicationLimitedAdminRoles = [
  ApplicationRoles.ADMIN_WF,
  ApplicationRoles.ADMIN_FLNRO,
  ApplicationRoles.ADMIN_FLNR_NRO,
  ApplicationRoles.ADMIN_AGRI,
  ApplicationRoles.ADMIN_ENV_EPD,
  ApplicationRoles.ADMIN_ENV_COS,
  ApplicationRoles.ADMIN_ENV_BCPARKS,
  ApplicationRoles.ADMIN_ALC,
  ApplicationRoles.ADMIN_WLRS
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
  BC_Parks: 'AGENCY_ENV_BCPARKS',
  Conservation_Officer_Service: 'AGENCY_ENV_COS',
  Water_Sustainability_Act: 'AGENCY_OGC'
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

exports.SKIP_REDACTION_SCHEMA_NAMES = [
  'MineBCMI',
  'CollectionBCMI',
  'MapLayerInfo',
  'ActivityLNG',
  'AgreementLNG'
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
  'AdministrativePenaltyBCMI',
  'AnnualReportBCMI',
  'CertificateBCMI',
  'CertificateAmendmentBCMI',
  'CollectionBCMI',
  'ConstructionPlanBCMI',
  'CorrespondenceBCMI',
  'CourtConvictionBCMI',
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
  'AGENCY_ENV_BCPARKS',
  'AGENCY_CAS',
  'AGENCY_ENV_COS',
  'AGENCY_EAO',
  'AGENCY_ENV',
  'AGENCY_FLNRO'
];

exports.CSV_SOURCE_DEFAULT_ROLES = {
  'coors-csv': [ApplicationRoles.ADMIN_FLNRO, ApplicationRoles.ADMIN_ENV_COS],
  'era-csv': [ApplicationRoles.ADMIN_FLNR_NRO],
  'nris-flnr-csv': [ApplicationRoles.ADMIN_FLNR_NRO],
  'agri-cmdb-csv': [ApplicationRoles.ADMIN_AGRI],
  'agri-mis-csv': [ApplicationRoles.ADMIN_AGRI],
  'alc-csv': [ApplicationRoles.ADMIN_ALC],
  'ams-csv': [ApplicationRoles.ADMIN_ENV_EPD]
};
