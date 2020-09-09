exports.SYSTEM_USER = 'SYSTEM_USER';

exports.ApplicationRoles = {
  ADMIN: 'sysadmin',
  ADMIN_NRCED: 'admin:nrced',
  ADMIN_LNG: 'admin:lng',
  ADMIN_BCMI: 'admin:bcmi',
};

exports.ApplicationAdminRoles = Object.keys(this.ApplicationRoles).map(role => {
    return this.ApplicationRoles[role];
  }
);

exports.IssuedToEntityTypes = {
  Company: 'Company',
  Individual: 'Individual',
  IndividualCombined: 'IndividualCombined'
};

exports.CorsCsvIssuingAgencies = {
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
  'CertificateAmendmentBCMI',
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
