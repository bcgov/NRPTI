/**
 * Supported NRPTI record types.
 */
const RECORD_TYPE = Object.freeze({
  AdministrativePenalty: {
    _schemaName: 'AdministrativePenalty',
    displayName: 'Administrative Penalty',
    flavours: { lng: { _schemaName: 'AdministrativePenaltyLNG' }, nrced: { _schemaName: 'AdministrativePenaltyNRCED' } }
  },
  AdministrativeSanction: {
    _schemaName: 'AdministrativeSanction',
    displayName: 'Administrative Sanction',
    flavours: {
      lng: { _schemaName: 'AdministrativeSanctionLNG' },
      nrced: { _schemaName: 'AdministrativeSanctionNRCED' }
    }
  },
  Agreement: { _schemaName: 'Agreement', displayName: 'Agreement', flavours: { lng: { _schemaName: 'AgreementLNG' } } },
  Certificate: {
    _schemaName: 'Certificate',
    displayName: 'Certificate',
    flavours: { lng: { _schemaName: 'CertificateLNG' } }
  },
  ConstructionPlan: {
    _schemaName: 'ConstructionPlan',
    displayName: 'Construction Plan',
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
    flavours: { lng: { _schemaName: 'InspectionLNG' }, nrced: { _schemaName: 'InspectionNRCED' } }
  },
  ManagementPlan: {
    _schemaName: 'ManagementPlan',
    displayName: 'Management Plan',
    flavours: { lng: { _schemaName: 'ManagementPlanLNG' } }
  },
  Order: {
    _schemaName: 'Order',
    displayName: 'Order',
    flavours: { lng: { _schemaName: 'OrderLNG' }, nrced: { _schemaName: 'OrderNRCED' } }
  },
  Permit: { _schemaName: 'Permit', displayName: 'Permit', flavours: { lng: { _schemaName: 'PermitLNG' } } },
  RestorativeJustice: {
    _schemaName: 'RestorativeJustice',
    displayName: 'Restorative Justice',
    flavours: { lng: { _schemaName: 'RestorativeJusticeLNG' }, nrced: { _schemaName: 'RestorativeJusticeNRCED' } }
  },
  SelfReport: {
    _schemaName: 'SelfReport',
    displayName: 'Compliance Self-Report',
    flavours: { lng: { _schemaName: 'SelfReportLNG' } }
  },
  Ticket: {
    _schemaName: 'Ticket',
    displayName: 'Ticket',
    flavours: { lng: { _schemaName: 'TicketLNG' }, nrced: { _schemaName: 'TicketNRCED' } }
  },
  Warning: {
    _schemaName: 'Warning',
    displayName: 'Warning',
    flavours: { lng: { _schemaName: 'WarningLNG' }, nrced: { _schemaName: 'WarningNRCED' } }
  }
});

module.exports = RECORD_TYPE;
