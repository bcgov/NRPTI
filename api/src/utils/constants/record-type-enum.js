/**
 * Supported NRPTI record types.
 */
const RECORD_TYPE = Object.freeze({
  AdministrativePenalty: { _schemaName: 'AdministrativePenalty', displayName: 'Administrative Penalty' },
  AdministrativeSanction: { _schemaName: 'AdministrativeSanction', displayName: 'Administrative Sanction' },
  Agreement: { _schemaName: 'Agreement', displayName: 'Agreement' },
  Certificate: { _schemaName: 'Certificate', displayName: 'Certificate' },
  ConstructionPlan: { _schemaName: 'ConstructionPlan', displayName: 'Construction Plan' },
  CourtConviction: { _schemaName: 'CourtConviction', displayName: 'Court Conviction' },
  Inspection: { _schemaName: 'Inspection', displayName: 'Inspection' },
  ManagementPlan: { _schemaName: 'ManagementPlan', displayName: 'Management Plan' },
  Order: { _schemaName: 'Order', displayName: 'Order' },
  Permit: { _schemaName: 'Permit', displayName: 'Permit' },
  RestorativeJustice: { _schemaName: 'RestorativeJustice', displayName: 'Restorative Justice' },
  SelfReport: { _schemaName: 'SelfReport', displayName: 'Compliance Self Report' },
  Ticket: { _schemaName: 'Ticket', displayName: 'Ticket' },
  Warning: { _schemaName: 'Warning', displayName: 'Warning' }
});

module.exports = RECORD_TYPE;
