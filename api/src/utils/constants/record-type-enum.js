/**
 * Supported NRPTI record types.
 */
const RECORD_TYPE = Object.freeze({
  ActivityLNG: {
    _schemaName: 'ActivityLNG',
    displayName: 'Activity',
    recordControllerName: 'news',
    flavours: {}
  },
  AdministrativePenalty: {
    _schemaName: 'AdministrativePenalty',
    displayName: 'Administrative Penalty',
    recordControllerName: 'administrativePenalties',
    flavours: {
      lng: { _schemaName: 'AdministrativePenaltyLNG' },
      nrced: { _schemaName: 'AdministrativePenaltyNRCED' },
      bcmi: { _schemaName: 'AdministrativePenaltyBCMI'}
    }
  },
  AdministrativeSanction: {
    _schemaName: 'AdministrativeSanction',
    displayName: 'Administrative Sanction',
    recordControllerName: 'administrativeSanctions',
    flavours: {
      lng: { _schemaName: 'AdministrativeSanctionLNG' },
      nrced: { _schemaName: 'AdministrativeSanctionNRCED' }
    }
  },
  Agreement: {
    _schemaName: 'Agreement',
    displayName: 'Agreement',
    flavours: { lng: { _schemaName: 'AgreementLNG' } }
  },
  AnnualReport: {
    _schemaName: 'AnnualReport',
    displayName: 'Annual Report',
    flavours: { bcmi: { _schemaName: 'AnnualReportBCMI' } }
  },
  Certificate: {
    _schemaName: 'Certificate',
    displayName: 'Certificate',
    recordControllerName: 'certificates',
    flavours: { lng: { _schemaName: 'CertificateLNG' }, bcmi: { _schemaName: 'CertificateBCMI' } }
  },
  CertificateAmendment: {
    _schemaName: 'CertificateAmendment',
    displayName: 'Certificate Amendment',
    recordControllerName: 'certificateAmendments',
    flavours: { lng: { _schemaName: 'CertificateAmendmentLNG' }, bcmi: { _schemaName: 'CertificateAmendmentBCMI' } }
  },
  CollectionBCMI: {
    _schemaName: 'CollectionBCMI',
    displayName: 'Collection',
    recordControllerName: 'collections',
    flavours: {}
  },
  ConstructionPlan: {
    _schemaName: 'ConstructionPlan',
    displayName: 'Construction Plan',
    recordControllerName: 'constructionPlans',
    flavours: { lng: { _schemaName: 'ConstructionPlanLNG' }, bcmi: { _schemaName: 'ConstructionPlanBCMI' } }
  },
  Correspondence: {
    _schemaName: 'Correspondence',
    displayName: 'Correspondence',
    recordControllerName: 'correspondence',
    flavours: { nrced: { _schemaName: 'CorrespondenceNRCED' }, bcmi: { _schemaName: 'CorrespondenceBCMI' } }
  },
  CourtConviction: {
    _schemaName: 'CourtConviction',
    displayName: 'Court Conviction',
    recordControllerName: 'courtConvictions',
    flavours: {
      lng: { _schemaName: 'CourtConvictionLNG' },
      nrced: { _schemaName: 'CourtConvictionNRCED' },
      bcmi: { _schemaName: 'CourtConvictionBCMI' }
    }
  },
  DamSafetyInspection: {
    _schemaName: 'DamSafetyInspection',
    displayName: 'Dam Safety Inspection',
    recordControllerName: 'damSafetyInspection',
    flavours: { nrced: { _schemaName: 'DamSafetyInspectionNRCED' }, bcmi: { _schemaName: 'DamSafetyInspectionBCMI' } }
  },
  Inspection: {
    _schemaName: 'Inspection',
    displayName: 'Inspection',
    recordControllerName: 'inspections',
    flavours: { lng: { _schemaName: 'InspectionLNG' }, nrced: { _schemaName: 'InspectionNRCED' }, bcmi: { _schemaName: 'InspectionBCMI' } }
  },
  ManagementPlan: {
    _schemaName: 'ManagementPlan',
    displayName: 'Management Plan',
    recordControllerName: 'managementPlans',
    flavours: { lng: { _schemaName: 'ManagementPlanLNG' }, bcmi: { _schemaName: 'ManagementPlan' } }
  },
  MineBCMI: {
    _schemaName: 'MineBCMI',
    displayName: 'MineBCMI',
    recordControllerName: 'mines',
    flavours: {}
  },
  Order: {
    _schemaName: 'Order',
    displayName: 'Order',
    recordControllerName: 'orders',
    flavours: { lng: { _schemaName: 'OrderLNG' }, nrced: { _schemaName: 'OrderNRCED' }, bcmi: { _schemaName: 'OrderBCMI' } }
  },
  Permit: {
    _schemaName: 'Permit',
    displayName: 'Permit',
    recordControllerName: 'permits',
    flavours: { lng: { _schemaName: 'PermitLNG' }, bcmi: { _schemaName: 'PermitBCMI' } }
  },
  Report: {
    _schemaName: 'Report',
    displayName: 'Report',
    recordControllerName: 'report',
    flavours: { nrced: { _schemaName: 'ReportNRCED' }, bcmi: { _schemaName: 'ReportBCMI' } }
  },
  RestorativeJustice: {
    _schemaName: 'RestorativeJustice',
    displayName: 'Restorative Justice',
    recordControllerName: 'restorativeJustices',
    flavours: { lng: { _schemaName: 'RestorativeJusticeLNG' }, nrced: { _schemaName: 'RestorativeJusticeNRCED' } }
  },
  SelfReport: {
    _schemaName: 'SelfReport',
    displayName: 'Compliance Self-Report',
    recordControllerName: 'selfReports',
    flavours: { lng: { _schemaName: 'SelfReportLNG' } }
  },
  Ticket: {
    _schemaName: 'Ticket',
    displayName: 'Ticket',
    recordControllerName: 'tickets',
    flavours: { lng: { _schemaName: 'TicketLNG' }, nrced: { _schemaName: 'TicketNRCED' } }
  },
  Warning: {
    _schemaName: 'Warning',
    displayName: 'Warning',
    recordControllerName: 'warnings',
    flavours: { lng: { _schemaName: 'WarningLNG' }, nrced: { _schemaName: 'WarningNRCED' } }
  },
  ApplicationAgency: {
    _schemaName: 'ApplicationAgency',
    displayName: 'ApplicationAgency',
    recordControllerName: 'agencies',
    flavours: {}
  }
});
module.exports = RECORD_TYPE;
