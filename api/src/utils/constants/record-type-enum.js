/**
 * Supported NRPTI record types.
 */
const RECORD_TYPE = Object.freeze({
  AdministrativePenalty: {
    _schemaName: 'AdministrativePenalty',
    displayName: 'Administrative Penalty',
    recordControllerName: 'administrativePenalties',
    flavours: { lng: { _schemaName: 'AdministrativePenaltyLNG' }, nrced: { _schemaName: 'AdministrativePenaltyNRCED' } }
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
  Agreement: { _schemaName: 'Agreement', displayName: 'Agreement', flavours: { lng: { _schemaName: 'AgreementLNG' } } },
  Certificate: {
    _schemaName: 'Certificate',
    displayName: 'Certificate',
    recordControllerName: 'certificates',
    flavours: { lng: { _schemaName: 'CertificateLNG' } }
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
    flavours: { lng: { _schemaName: 'ConstructionPlanLNG' } }
  },
  CourtConviction: {
    _schemaName: 'CourtConviction',
    displayName: 'Court Conviction',
    flavours: { lng: { _schemaName: 'CourtConvictionLNG' }, nrced: { _schemaName: 'CourtConvictionNRCED' } }
  },
  Inspection: {
    _schemaName: 'Inspection',
    displayName: 'Inspection',
    recordControllerName: 'inspections',
    flavours: { lng: { _schemaName: 'InspectionLNG' }, nrced: { _schemaName: 'InspectionNRCED' } }
  },
  ManagementPlan: {
    _schemaName: 'ManagementPlan',
    displayName: 'Management Plan',
    recordControllerName: 'managementPlans',
    flavours: { lng: { _schemaName: 'ManagementPlanLNG' } }
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
    flavours: { lng: { _schemaName: 'OrderLNG' }, nrced: { _schemaName: 'OrderNRCED' } }
  },
  Permit: {
    _schemaName: 'Permit',
    displayName: 'Permit',
    recordControllerName: 'permits',
    flavours: { lng: { _schemaName: 'PermitLNG' }, bcmi: { _schemaName: 'PermitBCMI' } }
  },
  PermitAmendment: {
    _schemaName: 'PermitAmendment',
    displayName: 'Permit Amendment',
    recordControllerName: 'permitAmendments',
    flavours: { bcmi: { _schemaName: 'PermitAmendmentBCMI' } }
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
  }
});
module.exports = RECORD_TYPE;