import { Utils } from './utils';
import { Legislation } from '../models/master/common-models/legislation';

export class EpicProjectIds {
  public static readonly lngCanadaId = '588511d0aaecd9001b826192';
  public static readonly coastalGaslinkId = '588511c4aaecd9001b825604';
}

/**
 * Supported search subsets
 *
 * @export
 * @class SearchSubsets
 */
export class SearchSubsets {
  public static readonly all = 'All';
  public static readonly issuedTo = 'Issued To';
  public static readonly location = 'Location';
  public static readonly descriptionAndSummary = 'Description & Summary';
  public static readonly recordName = 'Record Name';
}

/**
 * Schema lists for search.
 *
 * @export
 * @class SchemaLists
 */
export class SchemaLists {
  public static readonly allBasicRecordTypes = [
    'Order',
    'Inspection',
    'Certificate',
    'Permit',
    'SelfReport',
    'Agreement',
    'RestorativeJustice',
    'Ticket',
    'AdministrativePenalty',
    'AdministrativeSanction',
    'Warning',
    'ConstructionPlan',
    'ManagementPlan',
    'CourtConviction',
    'AnnualReport',
    'CertificateAmendment',
    'Correspondence',
    'DamSafetyInspection',
    'Report'
  ];

  public static readonly lngRecordTypes = [
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

  public static readonly bcmiRecordTypes = [
    'AnnualReportBCMI',
    'CertificateBCMI',
    'CertificateAmendmentBCMI',
    'ConstructionPlanBCMI',
    'CorrespondenceBCMI',
    'DamSafetyInspectionBCMI',
    'InspectionBCMI',
    'ManagementPlanBCMI',
    'OrderBCMI',
    'PermitBCMI',
    'ReportBCMI'
  ];

  // set schema filters
  public static readonly nrcedPublicBasicRecordTypes = [
    'OrderNRCED',
    'InspectionNRCED',
    'RestorativeJusticeNRCED',
    'AdministrativePenaltyNRCED',
    'AdministrativeSanctionNRCED',
    'TicketNRCED',
    'WarningNRCED',
    'CourtConvictionNRCED',
    'CorrespondenceNRCED',
    'DamSafetyInspectionNRCED',
    'ReportNRCED'
  ];
}

/**
 * Common store service id's to use when navigating between pages while maintaining state.
 *
 * @export
 * @class StateIDs
 */
export class StateIDs {
  public static readonly collectionAddEdit = 'collectionAddEdit';
  public static readonly recordAddEdit = 'recordAddEdit';
}

/**
 * Statuses for tracking the status/validity of store service objects
 *
 * @export
 * @enum {number}
 */
export enum StateStatus {
  created = 'created',
  valid = 'valid',
  invalid = 'invalid'
}

/**
 * Note: Picklist values should be alphabetical (A -> Z).  The only exception is with catch-all values like 'None' -
 * which should always be at the start, and 'Other' - which should always be at the end.
 *
 * @export
 * @class Picklists
 */
export class Picklists {
  public static readonly orderSubtypePicklist = ['None', 'Cease', 'Remedy', 'Stop Work', 'Other'];
  public static readonly permitSubtypePicklist = ['Ancillary Site', 'General', 'Investigative Use', 'Road', 'Water'];
  public static readonly certificateSubtypePicklist = [
    'Amendment',
    'General',
    'Project Conditions',
    'Project Description',
    'Other'
  ];
  public static readonly courtConvictionSubtypePicklist = [
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
  public static readonly penaltyTypePicklist = ['Years', 'Days', 'Dollars', 'Hours', 'Other'];

  public static readonly agencyPicklist = [
    'Agricultural Land Commission',
    'BC Oil and Gas Commission',
    'BC Parks',
    'BC Wildfire Service',
    'Climate Action Secretariat',
    'Conservation Officer Service (COS)',
    'EAO',
    'Environmental Protection Division',
    'LNG Secretariat',
    'Ministry of Agriculture',
    'EMLI',
    'Ministry of Forests, Lands, Natural Resource Operations and Rural Development',
    'Natural Resource Officers (NRO)'
  ];

  public static readonly entityTypePicklist = ['Company', 'Individual'];

  public static readonly authorPicklist = ['BC Government', 'Proponent', 'Other'];

  public static readonly outcomeStatusPicklist = ['Closed', 'Open'];

  public static readonly activityTypePicklistNRCED = {
    AdministrativePenalty: { displayName: 'Administrative Penalty', _schemaName: 'AdministrativePenaltyNRCED' },
    AdministrativeSanction: { displayName: 'Administrative Sanction', _schemaName: 'AdministrativeSanctionNRCED' },
    CourtConviction: { displayName: 'Court Conviction', _schemaName: 'CourtConvictionNRCED' },
    Inspection: { displayName: 'Inspection', _schemaName: 'InspectionNRCED' },
    Order: { displayName: 'Order', _schemaName: 'OrderNRCED' },
    RestorativeJustice: { displayName: 'Restorative Justice', _schemaName: 'RestorativeJusticeNRCED' },
    Ticket: { displayName: 'Ticket', _schemaName: 'TicketNRCED' }
  };

  public static readonly activityTypePicklist = {
    AdministrativePenalty: { displayName: 'Administrative Penalty', _schemaName: 'AdministrativePenalty' },
    AdministrativeSanction: { displayName: 'Administrative Sanction', _schemaName: 'AdministrativeSanction' },
    Agreement: { displayName: 'Agreement', _schemaName: 'Agreement' },
    AnnualReport: { displayName: 'Annual Report', _schemaName: 'AnnualReport' },
    Certificate: { displayName: 'Certificate', _schemaName: 'Certificate' },
    CertificateAmendment: { displayName: 'Certificate Amendment', _schemaName: 'CertificateAmendment' },
    ConstructionPlan: { displayName: 'Construction Plan', _schemaName: 'ConstructionPlan' },
    Correspondence: { displayName: 'Correspondence', _schemaName: 'Correspondence' },
    CourtConviction: { displayName: 'Court Conviction', _schemaName: 'CourtConviction' },
    DamSafetyInspection: { displayName: 'Dam Safety Inspection', _schemaName: 'DamSafetyInspection' },
    Inspection: { displayName: 'Inspection', _schemaName: 'Inspection' },
    ManagementPlan: { displayName: 'Management Plan', _schemaName: 'ManagementPlan' },
    Order: { displayName: 'Order', _schemaName: 'Order' },
    Permit: { displayName: 'Permit', _schemaName: 'Permit' },
    Report: { displayName: 'Report', _schemaName: 'Report' },
    RestorativeJustice: { displayName: 'Restorative Justice', _schemaName: 'RestorativeJustice' },
    SelfReport: { displayName: 'Self Report', _schemaName: 'SelfReport' },
    Ticket: { displayName: 'Ticket', _schemaName: 'Ticket' },
    Warning: { displayName: 'Warning', _schemaName: 'Warning' }
  };

  public static readonly bcmiRecordTypePicklist = {
    AnnualReport: { displayName: 'Annual Report', _schemaName: 'AnnualReportBCMI' },
    Certificate: { displayName: 'Certificate', _schemaName: 'CertificateBCMI' },
    CertificateAmendment: { displayName: 'Certificate Amendment', _schemaName: 'CertificateAmendmentBCMI' },
    ConstructionPlan: { displayName: 'Construction Plan', _schemaName: 'ConstructionPlanBCMI' },
    Correspondence: { displayName: 'Correspondence', _schemaName: 'CorrespondenceBCMI' },
    DamSafetyInspection: { displayName: 'Dam Safety Inspection', _schemaName: 'DamSafetyInspectionBCMI' },
    Inspection: { displayName: 'Inspection', _schemaName: 'InspectionBCMI' },
    ManagementPlan: { displayName: 'Management Plan', _schemaName: 'ManagementPlanBCMI' },
    Order: { displayName: 'Order', _schemaName: 'OrderBCMI' },
    Permit: { displayName: 'Permit', _schemaName: 'PermitBCMI' },
    Report: { displayName: 'Report', _schemaName: 'ReportBCMI' }
  };

  public static readonly sourceSystemRefPicklist = [
    'agri-mis',
    'bcogc',
    'core',
    'coors-csv',
    'epic',
    'lng-csv',
    'mem-admin',
    'nris-epd',
    'nro-inspections-csv',
    'nrpti',
    'ocers-csv',
  ];

  public static readonly mineTypes = ['Coal', 'Metal', 'Industrial Mineral', 'Sand & Gravel'];

  public static readonly collectionTypePicklist = [
    'Annual Report',
    'Certificate Amendment',
    'Certificate',
    'Compliance Self Report',
    'Construction Plan',
    'Dam Safety Inspection',
    'Inspection Report',
    'Letter of Assurance',
    'Management Plan',
    'Order',
    'Permit Amendment',
    'Permit',
    'Report'
  ];

  public static readonly collectionAgencyPicklist = ['EAO', 'EMLI', 'ENV'];

  /**
   * Contains a mapping of acts to regulations.
   *
   * Object spec:
   * {
   *   "Act1": ["RegulationA", "RegulationB", ...]
   *   "Act2": ["regulationC", ...]
   *   ...
   * }
   *
   * @static
   * @memberof Picklists
   */
  public static readonly legislationActsMappedToRegulations = {
    'Agricultural Land Commission Act': ['Agricultural Land Reserve Use, Subdivision and Procedure Regulation'],
    'Agrologists Act': [],
    'Animal Health Act': [
      'Animal Products and Byproducts Regulation',
      'Bee Regulation',
      'Enforcement Regulation',
      'Fur Farm Regulation',
      'Game Farm Regulation',
      'Laboratory Fees Regulation',
      'Livestock Licensing Regulation',
      'Poultry Health and Buying Regulation',
      'Reportable and Notifiable Disease Regulation'
    ],
    'BC Hydro Public Power Legacy and Heritage Contract Act': ['Remote Communities Regulation'],
    'Boundary Act': [],
    'Canada Shipping Act': [
      'Boating Restriction Regulations',
      'Collision Regulations',
      'Competency of Operators of Pleasure Craft Regulations',
      'Small Vessel Regulation',
      'Vessel Operation Restriction Regulations'
    ],
    'Canadian Pacific Railway (Stone and Timber) Settlement Act': [],
    'Clean Energy Act': [
      'Authorization For Burrard Thermal Electricity Regulation',
      "British Columbia's Energy Objectives Regulation",
      'Clean or Renewable Resource Regulation',
      'Domestic Long-Term Sales Contracts Regulation',
      'Electricity Self-Sufficiency Regulation',
      'Exempt Projects, Programs, Contracts and Expenditures Regulation',
      'First Nations Clean Energy Business Fund Regulation',
      'Greenhouse Gas Reduction (Clean Energy) Regulation',
      'Improvement Financing Regulation',
      'Rate Comparison Regulation',
      'Smart Meters and Smart Grid Regulation',
      'Standing Offer Program Regulation'
    ],
    'Climate Change Accountability Act': [],
    'Coal Act': ['Coal Act Regulation'],
    'Coalbed Gas Act': [],
    'College of Applied Biology Act': [],
    'Controlled Drugs and Substances Act': [],
    'Creston Valley Wildlife Act': [
      'Discharge of Firearms Regulation',
      'Fees for General Uses',
      'Permit Regulations',
      'Summit Creek Campground and Recreation Area Regulations'
    ],
    'Criminal Code (Canada)': [],
    'Dike Maintenance Act': [],
    'Drainage, Ditch and Dike Act': [],
    'Drinking Water Protection Act': [],
    'Ecological Reserve Act': [
      'Application of Park Legislation to Ecological Reserves Regulation',
      'Ecological Reserve Regulations'
    ],
    'Energy Efficiency Act': ['Energy Efficiency Standards Regulation'],
    'Environment and Land Use Act': [],
    'Environmental Assessment Act': [
      'Concurrent Approval Regulation',
      'Environmental Assessment Fee Regulation',
      'Exemption Regulation',
      'Prescribed Time Limits Regulation',
      'Public Consultation Policy Regulation',
      'Reviewable Projects Regulation',
      'Transition Regulation'
    ],
    'Environmental Management Act': [
      'Administrative Penalties (Environmental Management Act) Regulation',
      'Agricultural Waste Control Regulation',
      'Antifreeze Regulation',
      'Antisapstain Chemical Waste Control Regulation',
      'Asphalt Plant Regulation',
      'Cleaner Gasoline Regulation',
      'Code of Practice for Industrial Non-Hazardous Waste Landfills Incidental to the Wood Processing Industry',
      'Code of Practice for Soil Amendments',
      'Code of Practice for the Concrete and Concrete Products Industry',
      'Code of Practice for the Slaughter and Poultry Processing Industries',
      'Conservation Officer Service Authority Regulation',
      'Contaminated Sites Regulation',
      'Environmental Appeal Board Procedure Regulation',
      'Environmental Data Quality Assurance Regulation',
      'Environmental Impact Assessment Regulation',
      'Gasoline Vapour Control Regulation',
      'Hazardous Waste Regulation',
      'Land-based Finfish Waste Control Regulation',
      'Landfill Gas Management Regulation',
      'Municipal Wastewater Regulation',
      'Mushroom Compost Facilities Regulation',
      'Oil and Gas Waste Regulation',
      'Open Burning Smoke Control Regulation',
      'Organic Matter Recycling Regulation',
      'Ozone Depleting Substances and Other Halocarbons Regulation',
      'Permit Fees Regulation',
      'Petroleum Storage and Distribution Facilities Storm Water Regulation',
      'Placer Mining Waste Control Regulation',
      'Public Notification Regulation',
      'Pulp Mill and Pulp and Paper Mill Liquid Effluent Control Regulation',
      'Recycling Regulation',
      'Solid Fuel Burning Domestic Appliance Regulation',
      'Spill Cost Recovery Regulation',
      'Spill Reporting Regulation',
      'Storage of Recyclable Material Regulation',
      'Vehicle Dismantling and Recycling Industry Environmental Planning Regulation',
      'Waste Discharge Regulation',
      'Wood Residue Burner and Incinerator Regulation'
    ],
    'Farm Income Insurance Act': ['Farm Income Plans Regulation'],
    'Farm Practices Protection (Right to Farm) Act': [
      'British Columbia Farm Industry Review Board Regulation',
      'Specialty Farm Operations Regulation'
    ],
    'Farmers and Womens Institutes Act': ['Farmers and Womens Institutes Act Regulation'],
    'Farming and Fishing Industries Development Act': [
      'Blueberry Industry Development Fund Regulation',
      'British Columbia Salmon Marketing Council Regulation',
      'British Columbia Wine Grape Council Regulation',
      'Cattle Industry Development Council Regulation',
      'Dairy Industry Development Council Regulation',
      'Grain Industry Development Fund Regulation',
      'New Tree Fruit Varieties Development Council Regulation',
      'Raspberry Industry Development Council Regulation',
      'Woodlot Product Development Council Regulation'
    ],
    'Federal Port Development Act': [],
    'Firearm Act': [],
    'Firearms Act': [],
    "First Peoples' Heritage, Language and Culture Act": ["First Peoples' Heritage, Language and Culture Regulation"],
    'Fish and Seafood Act': ['Enforcement Regulation', 'Fish and Seafood Licensing Regulation'],
    'Fisheries Act (Canada)': [
      'British Columbia Sport Fishing Regulations',
      'Fishing (General) Regulations ',
      'Pacific Fishery Regulations',
      'Sport Fishing Regulation'
    ],
    'Fisheries Act (Provincial)': ['Aquaculture Regulation', 'Fisheries Act Regulations'],
    'Flathead Watershed Area Conservation Act': [],
    'FNCIDA Implementation Act': [],
    'Food and Agricultural Products Classification Act': [
      'Egg Grading and Standards Regulation',
      'Enforcement Regulation',
      'Organic Certification Regulation',
      'Wines of Marked Quality Regulation'
    ],
    'Food Safety Act': ['Meat Inspection Regulation'],
    'Forest Act': [
      'Administrative Boundaries Regulation',
      'Advertising, Deposits, Disposition and Extension Regulation',
      'Allowable Annual Cut Administration Regulation',
      'Allowable Annual Cut Partition Regulation',
      'Annual Rent Regulation',
      'BC Timber Sales Account Regulation',
      'BC Timber Sales Business Areas Regulation',
      'BC Timber Sales Regulation',
      'Christmas Tree Regulation',
      'Community Tenures Regulation',
      'Cut Control Regulation',
      'Cutting Permit Postponement Regulation',
      'Designated Areas',
      'Effective Director Regulation',
      'First Nation Tenures Regulation',
      'Forest Accounts Receivable Interest Regulation',
      'Forest Act Regulations',
      'Forest Licence Regulation',
      'Forest Revenue Audit Regulation',
      'Free Use Permit Regulation',
      'Innovative Forestry Practices Regulation',
      'Interest Rate Under Various Statutes Regulation',
      'Licence to Cut Regulation',
      'Log Salvage Regulation for the Vancouver Log Salvage District',
      'Manufactured Forest Products Regulation',
      'Minimum Stumpage Rate Regulation',
      'Mountain Pine Beetle Salvage Areas',
      'Performance Based Harvesting Regulation',
      'Scaling Regulation',
      'Special Forest Products Regulation',
      'Surrender Regulation',
      'Timber Definition Regulation',
      'Timber Harvesting Contract and Subcontract Regulation',
      'Timber Marketing Regulation',
      'Timber Marking and Transportation Regulation',
      'Transfer Regulation',
      'Tree Farm Licence Area-based Allowable Annual Cut Trial Program Regulation',
      'Tree Farm Licence Management Plan Regulation',
      'Woodlot Licence Regulation'
    ],
    'Forest and Range Practices Act': [
      'Administrative Orders and Remedies Regulation',
      'Administrative Review and Appeal Procedure Regulation',
      'Forest Planning and Practices Regulation',
      'Forest Practices Board Regulation',
      'Forest Recreation Regulation',
      'Forest Service Road Use Regulation',
      'Fort St. John Pilot Project Regulation',
      'Government Actions Regulation',
      'Invasive Plants Regulation',
      'Range Planning and Practices Regulation',
      'Security for Forest and Range Practice Liabilities Regulation',
      'Woodlot Licence Planning and Practices Regulation'
    ],
    'Forest Practices Code of British Columbia Act': [
      'Administrative Review and Appeal Procedure Regulation',
      'Forest Road Regulation',
      'Forest Service Road Use Regulation',
      'Provincial Forest Use Regulation',
      'Stillwater Pilot Project Regulation'
    ],
    'Forest Stand Management Fund Act': [],
    'Foresters Act': [],
    'Forestry Revitalization Act': [],
    'Forestry Service Providers Protection Act': ['Forestry Service Providers Compensation Fund Regulation'],
    'Gas Utility Act': [],
    'Geothermal Resources Act': [
      'Geothermal Geophysical Exploration Regulation',
      'Geothermal Operations Regulation',
      'Geothermal Resources General Regulation'
    ],
    'Great Bear Rainforest (Forest Management) Act': [
      'Great Bear Rainforest (Forest Management) Regulation',
      'Great Bear Rainforest (Special Forest Management Area) Regulation'
    ],
    'Greenbelt Act': [],
    'Greenhouse Gas Industrial Reporting and Control Act': [
      'Greenhouse Gas Emission Administrative Penalties and Appeals Regulation',
      'Greenhouse Gas Emission Control Regulation',
      'Greenhouse Gas Emission Reporting Regulation'
    ],
    'Greenhouse Gas Reduction (Renewable and Low Carbon Fuel Requirements) Act': [
      'Renewable and Low Carbon Fuel Requirements Regulation'
    ],
    'Greenhouse Gas Reduction (Vehicle Emissions Standards) [not in force] Act': [],
    'Greenhouse Gas Reduction Targets Act': ['Carbon Neutral Government Regulation'],
    'Haida Gwaii Reconciliation Act': [],
    'Heritage Conservation Act': ['Application Regulation'],
    'Hunting and Fishing Heritage Act': [],
    'Hydro and Power Authority Act': [
      'Applicability Regulation No. 1',
      'Applicability Regulation No. 2',
      'Applicability Regulation No. 5',
      'Applicability Regulation No. 6',
      'Applicability Regulation No. 7'
    ],
    'Hydro Power Measures Act': [],
    'Indian Advisory Act': [],
    'Indian Cut-off Lands Disputes Act': [],
    'Industrial Development Act': [],
    'Industrial Operation Compensation Act': [],
    'Insurance for Crops Act': ['Continuous Crop Insurance Regulation'],
    'Integrated Pest Management Act': [
      'Administrative Penalties (Integrated Pest Management Act) Regulation',
      'Integrated Pest Management Regulation '
    ],
    'Land (Spouse Protection) Act': ['Forms Regulation'],
    'Land Act': [
      'Administrative Boundaries Regulation',
      'Base Mapping and Geomatic Services Product and Services Price List Regulation',
      'Crown Land Fees Regulation',
      'Fossil Definition Regulation',
      'Integrated Land and Resource Registry Regulation',
      'Land Act Interest Rate Regulation',
      'Land Act Regulation',
      'Land Use Objectives Regulation',
      'Subscription Fee Regulation'
    ],
    'Land Settlement and Development (Repeal) Act': [],
    'Land Survey Act': ['Subdivision Plan Regulation'],
    'Land Surveyors Act': [],
    'Land Title Act': [
      'Application for Subdivision Approval Regulation',
      'Incompatibility Regulation',
      'Land Title Act (Board of Directors) Regulation',
      'Land Title Act Regulation',
      'Sechelt Indian Band Designation Regulation',
      'Torrens System Application Regulation'
    ],
    'Land Title and Survey Authority Act': [],
    'Land Title Inquiry Act': [],
    'Land Transfer Form Act': [],
    'Libby Dam Reservoir Act': [],
    'Liquor Control and Licensing Act': [],
    'Livestock Act': ['Livestock Regulations', 'Pound Districts Regulation'],
    'Livestock Identification Act': ['Livestock Identification Regulation'],
    'Livestock Lien Act': [],
    'Local Government Act': [],
    'Maa-nulth First Nations Final Agreement Act': ['Maa-nulth Forest Compensation Interim Regulation'],
    'McLeod Lake Indian Band Treaty No. 8 Adhesion and Settlement Agreement Act': [],
    'Migratory Birds Convention Act': ['Migratory Bird Regulations', 'Migratory Bird Sanctuary Regulations'],
    'Milk Industry Act': ['Milk Industry Standards Regulation'],
    'Mineral Land Tax Act': [
      'Agricultural Mineral Land Regulation',
      'Certificate of Forfeiture Form Regulation',
      'Mineral Land Tax Adjustment Regulation',
      'Mineral Land Tax Interest Rate Regulation',
      'Small Amount Notices Regulation',
      'Surrender of Interests in Mineral Land Regulations'
    ],
    'Mineral Tax Act': [
      'Mineral Tax Costs and Expenditures Regulation',
      'Mineral Tax Disposition of a Mine Regulation',
      'Mineral Tax General Regulation',
      'Mineral Tax Reclamation Regulation',
      'Mineral Tax Return Form Regulation',
      'Mineral Tax Transitional Regulation',
      'Partnership Election Form Regulation',
      'Quarry Operator Election Form Regulation'
    ],
    'Mineral Tenure Act': [
      'Mineral and Coal Land Reserve (No Mineral Claim Registrations) Regulation',
      'Mineral and Coal Land Reserve (No Mineral or Placer Claim Registrations) Regulation',
      'Mineral Definition Modification Regulation',
      'Mineral Land Reserve (Conditional Mineral and Placer Claim Registrations) Regulation',
      'Mineral Land Reserve (Conditional Mineral Claim Registrations) Regulation',
      'Mineral Land Reserve (No Mineral Claim Registrations) Regulation',
      'Mineral Land Reserve (No Mineral or Placer Claim Registrations) Regulation',
      'Mineral Land Reserve (No Placer Claim Registrations) Regulation',
      'Mineral Tenure Act Regulation',
      'Mineral Title Online Grid Regulation',
      'Mining Rights Compensation Regulation'
    ],
    'Mines Act': [
      'Administrative Penalties (Mines) Regulation',
      'Mine Reclamation Fund Regulation',
      'Mines Fee Regulation',
      'Mines Regulation',
      'Notice of Debt Form Regulation',
      'Permit Regulation',
      'Workplace Hazardous Materials Information System Regulation (Mines)'
    ],
    'Mining Right of Way Act': [],
    'Ministry of Agriculture and Food Act': ['Laboratory Fees Regulation'],
    'Ministry of Energy and Mines Act': ['Mount Polley Investigation and Inquiry Regulation'],
    'Ministry of Environment Act': [],
    'Ministry of Forests and Range Act': [],
    'Ministry of Lands, Parks and Housing Act': [
      'Affordable Housing Purposes Regulation',
      'British Columbia Housing Management Commission Regulation',
      'Certificate Regulation',
      'Crown Land Fees Regulation',
      'Sole Proponent Fees Regulation'
    ],
    'Motor Vehicle (all terrain) Act': [],
    'Motor Vehicle Act': ['Motor Vehicle Act Regulations'],
    'Muskwa-Kechika Management Area Act': ['Muskwa-Kechika Management Plan Regulation'],
    'Musqueam Reconciliation, Settlement and Benefits Agreement Implementation Act': [
      'Musqueam Reconciliation, Settlement and Benefits Agreement Implementation Regulation'
    ],
    'Natural Gas Price Act': ['Natural Gas Price Act Regulation No. 2'],
    'Natural Products Marketing (BC) Act': [
      'B.C. Egg Marketing Board Powers and Duties Regulation No. 1',
      'B.C. Egg Marketing Board Powers and Duties Regulation No. 3',
      'British Columbia Broiler Hatching Egg Scheme',
      'British Columbia Chicken Marketing Scheme, 1961',
      'British Columbia Cranberry Marketing Scheme, 1968',
      'British Columbia Egg Marketing Scheme, 1967',
      'British Columbia Hog Marketing Scheme',
      'British Columbia Milk Marketing Board Regulation',
      'British Columbia Turkey Marketing Scheme',
      'British Columbia Vegetable Scheme',
      'Natural Products Marketing (BC) Act Regulations'
    ],
    'Natural Resource Compliance Act': ['Natural Resource Officer Authority Regulation'],
    'New Relationship Trust Act': [],
    "Nisga'a Final Agreement Act": [],
    'Off-Road Vehicle Act': ['Off-Road Vehicle Regulation'],
    'Oil and Gas Activities Act': [
      'Administrative Penalties Regulation',
      'Consultation and Notification Regulation',
      'Direction No. 1 to the Oil and Gas Commission',
      'Drilling and Production Regulation',
      'Emergency Management Regulation',
      'Environmental Protection and Management Regulation',
      'Fee, Levy and Security Regulation',
      'Geophysical Exploration Regulation',
      'Liquefied Natural Gas Facility Regulation',
      'Oil and Gas Activities Act General Regulation',
      'Oil and Gas Road Regulation',
      'Pipeline Crossings Regulation',
      'Pipeline Regulation',
      'Service Regulation'
    ],
    'Park Act': [
      'Application of Park Legislation to Ecological Reserves Regulation',
      'BC Parks Recreation User Fees Regulation',
      'Class C Parks Regulations',
      'Park, Conservancy and Recreation Area Regulation'
    ],
    'Petroleum and Natural Gas (Vancouver Island Railway Lands) Act': [],
    'Petroleum and Natural Gas Act': [
      'Long Term Royalty Agreements Regulation',
      'Net Profit Royalty Regulation',
      'Petroleum and Natural Gas Act Fee, Rental and Work Requirement Regulation',
      'Petroleum and Natural Gas Drilling Licence and Lease Regulation',
      'Petroleum and Natural Gas General Regulation',
      'Petroleum and Natural Gas Grid Regulation',
      'Petroleum and Natural Gas Royalty and Freehold Production Tax Regulation',
      'Petroleum and Natural Gas Storage Reservoir Regulation',
      'Surface Lease Information Regulation',
      'Surface Lease Regulation'
    ],
    'Plant Protection Act': [
      'Bacterial Ring Rot Regulation',
      'Balsam Woolly Adelgid Regulation',
      'Blueberry Maggot Control Regulation',
      'Domestic Bacterial Ring Rot Regulation',
      'Golden Nematode Regulation',
      'Little Cherry Control Regulation',
      'North American Gypsy Moth Eradication Regulation, 2017'
    ],
    'Power for Jobs Development Act': [],
    'Prevention of Cruelty to Animals Act': [
      'Cattery and Kennel Regulation',
      'Dairy Cattle Regulation',
      'Prevention of Cruelty to Animals Regulation',
      'Sled Dog Standards of Care Regulation'
    ],
    'Private Managed Forest Land Act': [
      'Private Managed Forest Land Council Matters Regulation',
      'Private Managed Forest Land Council Regulation',
      'Private Managed Forest Land Regulation'
    ],
    'Protected Areas Forests Compensation Act': [],
    'Protected Areas of British Columbia Act': [],
    'Railway Act': [],
    'Range Act': ['Range Regulation'],
    'Resort Timber Administration Act': [
      'Controlled Recreation Area (Resort Timber Administration Act) Regulation',
      'Resort Timber Administration Act (Specified Enactment) Regulation'
    ],
    'Riparian Areas Protection Act': ['Riparian Areas Regulation'],
    'Sechelt Indian Government District Enabling Act': [
      'Sechelt Indian Government District - Sunshine Coast Regional District Participation Regulation',
      'Sechelt Indian Government District Advisory Council Regulation',
      'Sechelt Indian Government District Enabling Act Continuation Regulation',
      'Sechelt Indian Government District Municipal Benefits Regulation',
      'Sechelt Indian Government District Property Taxation Suspension Regulation',
      'Taxation Rate Cap for Class 2 Property Regulation'
    ],
    'Seed Potato Act': [
      'Cariboo Certified Seed Potato Control Area Regulation',
      'Pemberton Certified Seed Potato Control Area Regulation',
      'Seed Potato Regulation'
    ],
    'Skagit Environmental Enhancement Act': [],
    'Special Accounts Appropriation and Control Act': [],
    'Sustainable Environment Fund Act': ['Sustainable Environment Fund Revenue Regulation'],
    "Tla'amin Final Agreement Act": [
      "Tla'amin Final Agreement Forest Compensation Regulation",
      "Tla'amin Final Agreement Interim Regulation"
    ],
    'Treaty Commission Act': [],
    'Treaty First Nation Taxation Act': [],
    'Trespass Act': [],
    'Tsawwassen First Nation Final Agreement Act': [
      'Tsawwassen First Nation Final Agreement Interim Regulations',
      'Tsawwassen First Nation Membership in the Greater Vancouver Water District Regulation'
    ],
    'Tugboat Worker Lien Act': ['Tugboat Worker Lien Fee Regulation'],
    'University Endowment Land Act': [],
    'Vancouver Island Natural Gas Pipeline Act': [
      'Terasen Amalgamation Regulation',
      'Vancouver Island Natural Gas Pipeline Exemption Regulation'
    ],
    'Veterinarians Act': [],
    'Veterinary Drugs Act': ['Veterinary Drug and Medicated Feed Regulation'],
    'Waste Management Act': [],
    'Water Act': ['Water Regulation'],
    'Water Protection Act': [],
    'Water Sustainability Act': [
      'Dam Safety Regulation',
      'Groundwater Protection Regulation',
      'Water Districts Regulation',
      'Water Sustainability Fees, Rentals and Charges Tariff Regulation',
      'Water Sustainability Regulation'
    ],
    "Water User's Communities Act": [],
    'Water Utility Act': [],
    'Weed Control Act': ['Weed Control Regulation'],
    'Wild Animal and Plant Protection Act': [],
    'Wildfire Act': ['Wildfire Regulation'],
    'Wildlife Act': [
      'Angling and Scientific Collection Regulation',
      'Closed Areas Regulation',
      'Controlled Alien Species Regulation',
      'Designation and Exemption Regulation',
      'Designation of Officers Regulation',
      'Freshwater Fish Regulation',
      'Forest Practices Board Regulation',
      'Guiding Territory Certificate Regulation',
      'Hunter Safety and Training Regulation',
      'Hunter Safety Training Regulation',
      'Hunting Licensing Regulation',
      'Hunting Regulation',
      'Limited Entry Hunting Regulation',
      'Management Unit Regulation',
      'Motor Vehicle Prohibition Regulation',
      'Motor Vehicle Prohibition Regulations',
      'Permit Regulation',
      'Public Access Prohibition Regulation',
      'Wildlife Act Commercial Activities Regulation',
      'Wildlife Act General Regulation',
      'Wildlife Management Area Use and Access Regulation',
      'Wildlife Management Areas Regulation'
    ],
    'Wood First Act': [],
    'Woodworker Lien Act': ['Woodworker Lien Fee Regulation'],
    'Yale First Nation Final Agreement Act': [],
    'Zero Net Deforestation Act': []
  };

  /**
   * Returns an array of all supported legislation act strings.
   *
   * @static
   * @memberof Picklists
   * @returns {string[]} sorted array of acts
   */
  public static getAllActs = function (): string[] {
    return Object.keys(this.legislationActsMappedToRegulations).sort();
  };

  /**
   * Returns an array of all supported regulation strings.
   *
   * @static
   * @memberof Picklists
   * @returns {string[]} sorted array of regulations
   */
  public static getAllRegulations = function (): string[] {
    const regulations = [];

    Object.keys(this.legislationActsMappedToRegulations).forEach(act =>
      regulations.push(...this.legislationActsMappedToRegulations[act])
    );

    return Array.from(new Set<string>(regulations)).sort();
  };

  /**
   * Returns an object containing a mapping of regulations to acts.
   *
   * Object spec:
   * {
   *   "Regulation1": ["actA", "actB", ...]
   *   "Regulation2": ["actC", ...]
   *   ...
   * }
   *
   * @static
   * @memberof Picklists
   * @returns {{ [key: string]: string[] }}
   */
  public static getLegislationRegulationsMappedToActs = function (): { [key: string]: string[] } {
    const regulations = {};

    Object.keys(this.legislationActsMappedToRegulations).forEach(act =>
      this.legislationActsMappedToRegulations[act].map(regulation => {
        if (regulations[regulation]) {
          regulations[regulation].push(act);
        } else {
          regulations[regulation] = [act];
        }
      })
    );

    return regulations;
  };

  /**
   * Legislation descriptions.
   *
   * Note: each description has a unique json path, of the form:
   *
   * `recordType.act.<reg>.<section>.<subsection>.<paragraph>`
   *
   * Note: paths in <angle brackets> will not necessarily exist.
   *
   * @static
   * @memberof Picklists
   */
  public static readonly legislationDescriptions = {
    AdministrativePenalty: {
      'Agricultural Land Commission Act': {
        '54': {
          description: 'Contravened the decisions of the Agricultural Land Commission made on an application'
        }
      },
      'Environmental Management Act': {
        '115': {
          description:
            'Penalty for failure to comply with the Act, regulations, terms of permit, or orders issued under this Act'
        }
      },
      'Integrated Pest Management Act': {
        '23': {
          description:
            'Penalty for failure to comply with the Act, regulations, terms of permit, licence, pesticide use notice, or orders issued under this Act'
        }
      },
      'Mines Act': {
        '36.2': {
          description: 'Unauthorized work'
        }
      },
      'Oil and Gas Activities Act': {
        '63': {
          description: 'Penalty for failure to comply with the Act or associated regulations'
        }
      }
    },
    AdministrativeSanction: {
      'Environmental Management Act': {
        '18': {
          description: 'Waste discharge permit suspension or cancellation prompted by non-compliance'
        }
      },
      'Fisheries Act (Provincial)': {
        '24': {
          description: 'Angling, hunting, firearm and/or LEH licence action prompted by violations'
        }
      },
      'Integrated Pest Management Act': {
        '15': {
          description: 'Commercial Licence Action'
        }
      },
      'Wildlife Act': {
        '24': {
          description: 'Angling, hunting, firearm and/or LEH licence action prompted by violations'
        },
        '61': {
          description: 'Commercial Licence Action'
        },
        '85': {
          description: 'Angling, hunting and/or LEH licence action for failure to pay fine'
        }
      }
    },
    Inspection: {
      'Environmental Management Act': {
        '109': {
          description: 'Inspection to verify compliance with regulatory requirement'
        }
      },
      'Integrated Pest Management Act': {
        '17': {
          description: 'Inspection to verify compliance with regulatory requirement'
        }
      }
    },
    CourtConviction: {
      'Controlled Drugs and Substances Act': {
        '4': {
          '1': {
            description: 'Unauthorized possession of substance'
          }
        }
      },
      'Criminal Code (Canada)': {
        '86': {
          '2': {
            description: 'Store/display/handle/transport a firearm contrary to the Firearms Act'
          }
        },
        '91': {
          '1': {
            description: 'Possession of firearm without licence or registration',
            a: {
              description: 'Possession of unlicenced firearm'
            },
            b: {
              description: 'Possess firearm, no registration'
            }
          },
          '2': {
            description: 'Possession of unlicenced prohibited weapon'
          }
        },
        '92': {
          '2': {
            description: 'Possession of prohibited weapon, device or ammunition knowing its possession is unauthorized'
          }
        },
        '93': {
          '1': {
            b: {
              description: 'Possess restricted firearm in location other than indicated on authorization or licence'
            }
          }
        },
        '94': {
          '1': {
            a: {
              description: 'Unauthorized possession of firearm in vehicle'
            }
          }
        },
        '95': {
          '1': {
            description: 'Illegally possess restricted firearm, loaded or with readily accessible ammunition'
          }
        },
        '117': {
          '01': {
            '1': {
              description: 'Possess a weapon, device, ammunition or explosive while prohibited'
            }
          }
        },
        '129': {
          a: {
            description: 'Willfully resisting /obstructing peace officer'
          }
        },
        '145': {
          '3': {
            description: 'Failure to comply with condition of undertaking or recognizance'
          }
        },
        '253': {
          '1': {
            b: {
              description: 'Operate vehicle vessel with over .08'
            }
          },
          a: {
            description: 'Operate vehicle while impaired'
          }
        },
        '270': {
          '1': {
            description: 'Assaulting a peace officer'
          }
        },
        '367': {
          description: 'Commits forgery'
        },
        '380': {
          '1': {
            description: 'Defrauds the public or any person of any property, money or valuable security or any service'
          }
        },
        '430': {
          '1': {
            C: {
              description:
                'Commit mischief by obstructing, interrupting, or interfering with the lawful use of property'
            }
          }
        },
        '264.1': {
          a: {
            description: 'Threatens to cause death or bodily harm to any person'
          }
        }
      },
      'Drinking Water Protection Act': {
        '6': {
          description: 'Failure to provide potable water'
        },
        '23': {
          description: 'Allow contamination of drinking water'
        }
      },
      'Environmental Management Act': {
        '6': {
          '2': {
            description: 'Introduce waste from a prescribed industry, trade or business'
          },
          '3': {
            description: 'Introduce waste by prescribed activity or operation'
          },
          '4': {
            description: 'Introduce waste into environment causing pollution'
          }
        },
        '12': {
          '2': {
            description: 'Deposit litter'
          }
        },
        '79': {
          '5': {
            description: 'Failure to immediately report the spill of a polluting substance'
          }
        },
        '120': {
          '2': {
            B: {
              description: 'Transportation of hazardous waste - drywall containing asbestos'
            }
          },
          '6': {
            description: 'Introduce waste into the environment without complying with permit or approval held'
          },
          '7': {
            description: 'Fail to comply with terms of permit or approval'
          },
          '10': {
            description: 'Fail to comply with order'
          }
        }
      },
      'Firearm Act': {
        '3': {
          description: 'Fail to exercise due care for person or property'
        },
        '9': {
          '1': {
            description: 'Discharge, carry, possess loaded firearm in vehicle'
          }
        }
      },
      'Fisheries Act (Canada)': {
        '25': {
          '1': {
            description: 'Place gear or apparatus in water, along beach or within boundary during close time'
          }
        },
        '33': {
          description: 'Purchase, sell or possess illegally caught fish in contravention of the Act or regulations'
        },
        '35': {
          '1': {
            description: 'Harmful alteration disruption of fish habitat'
          }
        },
        '36': {
          '3': {
            description: 'Deposit deleterious substance in water frequented by fish'
          }
        },
        '62': {
          description: 'Obstruct fishery officer/guardian carrying out duty'
        },
        'Fishing (General) Regulations': {
          '37': {
            '2': {
              description: 'Fish within 100m radius of public fisheries facility'
            }
          }
        },
        'Sport Fishing Regulation': {
          '6': {
            '1': {
              a: {
                description: 'Angle with more than one fishing line'
              }
            }
          },
          '55': {
            '1': {
              description: 'Fish, or catch and retain fish, during close time'
            }
          },
          '56': {
            '1': {
              description: 'Catch and retain more than the daily quota'
            }
          },
          '63': {
            description: 'Fish by/with prohibited method, gear or bait'
          }
        }
      },
      'Forest and Range Practices Act': {
        'Forest Service Road Use Regulation': {
          '22': {
            '2': {
              description:
                'Use, construct, maintain or deactivate a road prescribed by the Act in a manner not in accordance with the Act'
            }
          }
        }
      },
      'Forest Practices Code of British Columbia Act': {
        '67': {
          '1': {
            description:
              'Carry out forest harvesting and related forest practice not in accordance with Act, regulation, standard, prescription or plan'
          },
          '2': {
            a: {
              description:
                'Conduct forest practices in and around streams not in accordance with the regulations or standards'
            }
          }
        }
      },
      'Integrated Pest Management Act': {
        '26': {
          '1': {
            e: {
              description: 'Make false statement or misleads the Administrator'
            }
          }
        }
      },
      'Migratory Birds Convention Act': {
        '5.1': {
          '1': {
            description:
              'Deposit a substance that is harmful to migratory birds, or permit such a substance to be deposited, in waters or an area frequented by migratory birds or in a place from which the substance may enter such waters or such an area'
          }
        }
      },
      'Motor Vehicle Act': {
        '24': {
          '1': {
            description: "No driver's licence"
          }
        },
        '95': {
          '1': {
            description: 'Driving while prohibited'
          }
        },
        '102': {
          description: 'Driving while prohibited'
        },
        '144': {
          '1': {
            a: {
              description: 'Drive a motor vehicle without reasonable consideration for others'
            }
          }
        },
        '234': {
          description: "Driving while driver's licence is suspended"
        }
      },
      'Park Act': {
        '16': {
          e: {
            description:
              'Establish/carry on commercial/industrial activity/enterprise in park/rec area without valid permit'
          }
        },
        '24': {
          '1': {
            description: 'Illegal use of vehicle'
          }
        },
        '29': {
          '1': {
            description: 'Illegal discharge of firearm/ bow'
          }
        },
        '38': {
          '1': {
            description: 'Illegal camping'
          }
        },
        'Park, Conservancy and Recreation Area Regulation': {
          '4': {
            description: 'Guide without permit'
          },
          '29': {
            '1': {
              a: {
                description: 'Discharge a firearm, bow or crossbow in a park'
              }
            }
          }
        }
      },
      'Trespass Act': {
        '4': {
          '1': {
            description: 'Trespass on enclosed land or premises, or engage in prohibited activity'
          }
        }
      },
      'Waste Management Act': {
        '3': {
          '2': {
            description: 'Introduce industrial, business waste into environment'
          },
          '4': {
            description: 'Introduce waste into the environment in such a manner or quantity as to cause pollution'
          }
        }
      },
      'Water Act': {
        '41': {
          '1': {
            s: {
              description: 'Make change in/about stream with out lawful authority (related to road construction)'
            }
          }
        },
        '78': {
          description: 'Operating a well in a manner to cause adverse impact'
        },
        '79': {
          description: 'Introducing foreign matter into a well'
        },
        '93': {
          '2': {
            k: {
              description: 'Unlawfully divert water from stream'
            },
            n: {
              description: 'Use water without entitlement'
            },
            Q: {
              description: 'Make change in or about stream without lawful authority'
            },
            r: {
              description: 'Breach the regulations'
            }
          }
        }
      },
      'Wild Animal and Plant Protection Act': {
        '7': {
          '2': {
            description:
              'Transport  from a province to another province an animal or plant or any part or derivative which was taken, possessed, distributed or transported in contravention of  provincial act or regulation'
          }
        },
        '8': {
          a: {
            description:
              'Knowingly possess animal or plant or part/derivative thereof imported or transported contrary to act'
          },
          b: {
            description: 'Possess animal/plant for unlawful transport/export'
          }
        }
      },
      'Wildfire Act': {
        '10': {
          '3': {
            description: 'Light, fuel or use fire against restriction'
          }
        }
      },
      'Wildlife Act': {
        '2': {
          b: {
            description: 'Transport live fish without authorization or permit'
          }
        },
        '7': {
          '1': {
            description: 'Fail to immediately cancel species licence'
          }
        },
        '11': {
          '1': {
            description: 'Hunts wildlife or carries firearm without LEH authorization (2 counts)',
            a: {
              description: 'Hunts wildlife or carries firearm without licence'
            },
            b: {
              description: 'Hunts wildlife or carries firearm without LEH authorization'
            },
            c: {
              description: 'Hunts wildlife or carries a firearm without a licence'
            },
            f: {
              description: 'Exceed provincial bag limit'
            }
          },
          '8': {
            description: 'Traps without licence'
          }
        },
        '12': {
          a: {
            i: {
              description: 'Angles in non-tidal waters without angling licence'
            }
          },
          A: {
            I: {
              description: 'Angles in non-tidal waters without angling licence'
            }
          }
        },
        '17': {
          '7': {
            b: {
              description: 'Person fails to supervise younger person'
            }
          }
        },
        '21': {
          '1': {
            b: {
              description: 'Export wildlife parts or egg without permit'
            }
          }
        },
        '22': {
          '2': {
            description: 'Damage / Destroy Habitat'
          },
          description: 'Traffic in live wildlife or wildlife meat'
        },
        '24': {
          '6': {
            a: {
              description: 'Obtain or apply for licence while under suspension'
            },
            b: {
              description: 'Hunt while under supervision'
            }
          },
          '7': {
            a: {
              description: 'Applies for or obtains angling licence while cancelled'
            },
            b: {
              description: 'Hunt while ineligible to obtain hunting licence'
            },
            c: {
              description: 'Angle while ineligible to obtain angling licence (2 count)'
            }
          }
        },
        '26': {
          '1': {
            c: {
              description: 'Hunt, take, trap, wound wildlife not within the open season'
            },
            d: {
              description: 'Hunt during prohibited hours'
            },
            e: {
              description: 'Hunt wildlife with the use of a light'
            },
            f: {
              description: 'Hunt wildlife with poison'
            }
          }
        },
        '27': {
          '1': {
            description: 'Discharge firearm/hunt wildlife from motor vehicle/boat'
          },
          '3': {
            description: 'Harass wildlife with use of motor vehicle'
          }
        },
        '28': {
          description: 'Hunts or traps without consideration for the lives, safety or property of other persons'
        },
        '30': {
          description: 'Hunt big game which is swimming'
        },
        '31': {
          description: 'Discharge firearm on or across highway'
        },
        '32': {
          description: 'Discharge firearm in no shooting area.'
        },
        '33': {
          '2': {
            description: 'Unlawful possession of dead wildlife'
          }
        },
        '34': {
          description: 'Possess or injure bird nest or egg of bird',
          a: {
            description: 'Possesses, takes, injures, molests, or destroys a bird or its egg'
          },
          b: {
            description: 'Molest/take/destroy bird nest'
          }
        },
        '35': {
          '2': {
            a: {
              description: 'Fail to retrieve wildlife'
            },
            b: {
              description: 'Fail to remove edible portions of carcass'
            }
          }
        },
        '36': {
          '1': {
            description: 'Possess carcass without parts attached'
          }
        },
        '37': {
          description: 'Transport wildlife in province contrary to regulations'
        },
        '38': {
          description: 'Fail to provide information to an officer'
        },
        '39': {
          '1': {
            a: {
              description: 'Hunt or trap on cultivated land without consent'
            }
          }
        },
        '41': {
          d: {
            description: 'Trap, hunt or kill fur bearing animal without permission of the land owner'
          }
        },
        '46': {
          description: 'Interfere with lawfully set trap'
        },
        '47': {
          description: 'Non-resident hunting without guide',
          a: {
            description: 'Non-resident hunting without guide'
          },
          b: {
            i: {
              description: 'Non-resident hunts big game without guide'
            }
          }
        },
        '48': {
          '1': {
            a: {
              description: 'Guide for game without guide licence'
            }
          },
          '2': {
            description: 'Guide employs person without licence to guide'
          }
        },
        '49': {
          '1': {
            a: {
              description: 'Guide for fish without angling guide licence'
            }
          },
          '2': {
            description: 'Angling guide - employ unlicensed assistant angling guide'
          }
        },
        '55': {
          '1': {
            a: {
              description: 'Fail to complete/sign guide form specified by director'
            }
          },
          '2': {
            description: 'Fail to submit completed guide report'
          }
        },
        '56': {
          '2': {
            description: 'Angling guide guides unlicensed angler'
          }
        },
        '70': {
          '2': {
            description: 'Possess black bear gall bladder'
          }
        },
        '75': {
          description: 'Fail to report killing of game by accident or for protection'
        },
        '78': {
          b: {
            description: 'Allow dog to hunt game in violation of regulations'
          }
        },
        '81': {
          a: {
            description: 'Allow licence to be used by another person'
          },
          b: {
            description: "Use another person's licence"
          }
        },
        '82': {
          '1': {
            description: 'Make false statement to an officer',
            a: {
              description: 'Make false statement to obtain licence/permit'
            },
            b: {
              description: 'Make false statement on licence/permit issued by him/her'
            },
            c: {
              description:
                'Make false statement  in a book, record, certificate, report or return made, kept or furnished under this Act'
            },
            d: {
              description: 'Make false statement to an officer when required to provide information.'
            }
          }
        },
        '85': {
          '2': {
            c: {
              description: 'Apply for or obtain a licence, permit or limited entry authorization while fine is unpaid'
            }
          }
        },
        '96': {
          '1': {
            description: 'Resist or obstruct officer from exercising duty'
          }
        },
        '97': {
          '2': {
            c: {
              description: 'Fail to demonstrate person holds authorization in accordance with section 97 (3)'
            }
          },
          a: {
            description: 'Fail to produce licence or permit for officer'
          }
        },
        '2.08': {
          '1': {
            a: {
              description: 'Accompany non-resident alien on a hunt'
            }
          },
          '3': {
            a: {
              description: 'Traffic in bear gall bladders'
            },
            c: {
              description: 'Traffic in bear paws that are separate from carcass or hide'
            }
          }
        },
        '33.1': {
          '1': {
            description: 'Feed or attempt to feed dangerous wildlife'
          },
          '2': {
            description: 'Attract dangerous wildlife to land or premises'
          }
        },
        '84.1': {
          '4': {
            description: 'Contravene an order under WLA Section 84.1'
          }
        },
        '88.1': {
          '7': {
            description: 'Fail to comply with Dangerous Wildlife Protection Order'
          }
        },
        'Closed Areas Regulation': {
          '10': {
            '1': {
              a: {
                description: 'Discharge firearm using single projectile'
              }
            }
          }
        },
        'Controlled Alien Species Regulation': {
          '3': {
            description: 'Possess a prohibited species individual without permit'
          },
          '6': {
            '1': {
              a: {
                description: 'Possess a prohibited species individual without permit'
              }
            }
          }
        },
        'Freshwater Fish Regulation': {
          '2': {
            a: {
              description: 'Possess live fish without authorization or permit'
            }
          }
        },
        'Hunting Licensing Regulation': {
          '5': {
            '1': {
              description: 'Hunt big game without hunting & species licence'
            }
          },
          '7': {
            '1': {
              description: 'Fail to immediately cancel species licence'
            }
          },
          '11': {
            '1': {
              description: 'Hunt game without required species licence'
            }
          },
          '26': {
            '1': {
              c: {
                description: 'Hunt, take, trap, wound wildlife not within the open season'
              }
            }
          },
          '35': {
            '2': {
              b: {
                description: 'Fail to remove edible portions of wildlife'
              }
            }
          }
        },
        'Hunting Regulation': {
          '10': {
            description: 'Exceed bag or possession limit'
          },
          '11': {
            '1': {
              a: {
                description: 'Exceed provincial bag limit of deer'
              },
              e: {
                description: 'Exceed bag limit of one mountain sheep'
              },
              f: {
                description: 'Exceed provincial bag limit of 1 other than a-e'
              }
            }
          },
          '14': {
            '1': {
              description: 'Hunt from one hour after sunset to one hour before sunrise'
            }
          },
          '15': {
            '2': {
              a: {
                description: 'Fail to leave attached male sex organ of big game'
              }
            }
          },
          '16': {
            '3.3': {
              description: 'Fail to comply with compulsory inspection requirements - black bear in region 6'
            }
          },
          '17': {
            '1': {
              b: {
                description: 'Hunt big game with a rifle using a rim-fire cartridge'
              },
              m: {
                description: 'Hunt bear using a dead animal or part of it as bait'
              },
              o: {
                description: 'Hunt migratory game birds by use of rifle'
              }
            },
            d: {
              description: 'Hunt mountain sheep or goats, elk, etc. with shotgun'
            }
          },
          '18': {
            '1': {
              d: {
                description: 'Continue to hunt after taking daily/seasonal limit'
              }
            }
          },
          '32': {
            description: 'Discharge firearm in no shooting area'
          },
          '81': {
            b: {
              description: "Use another person's licence"
            }
          },
          '82': {
            '1': {
              c: {
                description: 'Makes a false statement in a book, record, etc. kept under this Act'
              }
            }
          }
        },
        'Limited Entry Hunting Regulation': {
          '6': {
            '2': {
              description: 'Hunts in specified area without LEH authorization'
            }
          }
        },
        'Motor Vehicle Prohibition Regulations': {
          '2': {
            description: 'Operate motor vehicle in a closed area'
          },
          '3': {
            description: 'Use or operate a motor vehicle for the purpose of hunting in closed area'
          },
          '6': {
            description:
              'Use or operate an ATV or snowmobile for the purpose of hunting in a closed area as described in schedule 5'
          },
          '7': {
            description:
              'Use or operate an ATV for purpose of hunting in closed area and during periods specified in schedule 6'
          }
        },
        'Wildlife Act Commercial Activities Regulation': {
          '2.08': {
            '1': {
              a: {
                description: 'Possess or import bear gall bladders'
              }
            },
            '2': {
              description: 'Import or export bear paws that are separate from the carcass or hide'
            },
            '3': {
              a: {
                description: 'Traffic in bear gall bladders'
              },
              c: {
                description: 'Traffic in bear paws that are separate from carcass or hide'
              }
            }
          },
          '2.09': {
            '1': {
              description: 'Traffic  in dead wildlife or parts'
            }
          },
          '3.04': {
            '1': {
              j: {
                description: 'Trap wolf, lynx, etc. except by killing or modified trap'
              }
            }
          },
          '3.06': {
            description: 'Traps with killing trap within 200m of a dwelling/house'
          },
          '5.02': {
            '2': {
              description: 'Act as transporter without required licence'
            }
          }
        },
        'Wildlife Act General Regulation': {
          '36': {
            '1': {
              description: 'Possess carcass without parts attached'
            }
          },
          '16.01': {
            description: 'Hunt, take, trap, wound wildlife not within the open season',
            b: {
              description: 'Fail to comply with condition - species license'
            }
          }
        }
      }
    },
    Order: {
      'Agricultural Land Commission Act': {
        '50': {
          description: 'Stop Work Order'
        },
        '52': {
          description: 'Remediation Order'
        }
      },
      'Dike Maintenance Act': {
        '2': {
          description: 'Inspector of Dikes Order'
        },
        '3': {
          '1': {
            a: {
              description: 'Dike Maintenance Act Order'
            }
          }
        }
      },
      'Environmental Assessment Act': {
        '53': {
          description: 'Order to cease or remedy'
        }
      },
      'Integrated Pest Management Act': {
        '15': {
          description: 'IPMA Order'
        },
        '16': {
          '3': {
            description: 'IPMA Order'
          },
          description: 'IPMA Order'
        }
      },
      'Oil and Gas Activities Act': {
        '49': {
          description: 'General Order'
        },
        '50': {
          description: 'Action Order'
        }
      },
      'Park Act': {
        '17': {
          description: 'Park Act Order'
        }
      },
      'Wildfire Act': {
        '7': {
          '3': {
            description: 'Fire hazard abatement order'
          }
        },
        '17': {
          '3.1': {
            description: 'Order for no compensation for fire control costs'
          }
        },
        '25': {
          '2': {
            description: 'Order for recovery of fire control costs and related amounts'
          }
        },
        '26': {
          description: 'Contravention order'
        },
        '27': {
          '1': {
            a: {
              description: 'Administrative penalty for determination of contravention'
            },
            d: {
              description: 'Order for recovery of government\'s costs of fire control and other amounts',
            }
          }
        },
        '28': {
          '1': {
            description: 'Remediation order'
          },
          '3': {
            c: {
              description: 'Order for recovery of costs incurred for remediation work carried out by minister'
            },
            d: {
              description: 'Administrative penalty in lieu of remediation costs'
            }
          }
        },
        '34': {
          '1': {
            description: 'Stop work order'
          }
        }
      },
      'Water Sustainability Act': {
        '47': {
          description: 'Water Sustainability Act Order'
        },
        '60': {
          description: 'Water Sustainability Act Order'
        },
        '93': {
          description: 'Water Sustainability Act Order'
        }
      }
    },
    RestorativeJustice: {
      'Environmental Management Act': {
        '6': {
          '2': {
            description: 'Introduce Business Waste'
          },
          '3': {
            description: 'Introduce waste by prescribed activity or operation'
          }
        },
        '120': {
          '6': {
            description: 'Fail to Comply with Terms of Permit'
          }
        }
      },
      'Fisheries Act (Canada)': {
        '35': {
          '1': {
            description: 'Harmful alteration disruption of fish habitat'
          }
        }
      },
      'Park Act': {
        '9': {
          '6.1': {
            description: 'Destroying a natural resource in a conservancy'
          }
        }
      },
      'Wildlife Act': {
        '26': {
          '1': {
            c: {
              description: 'Hunts or kills wildlife at a time not within an open season'
            }
          }
        },
        '33.1': {
          '2': {
            description: 'Attracting dangerous wildlife and accidental killing of wildlife'
          }
        }
      }
    },
    Ticket: {
      'Canada Shipping Act': {
        '8': {
          '1': {
            description: 'Operate vessel without licence'
          }
        },
        '196': {
          '5': {
            b: {
              description:
                'Failing to produce document or information to officer or inspector - owner, person in charge or person on board pleasure craft'
            }
          }
        },
        '202': {
          '1': {
            a: {
              description: 'Operating unlicensed pleasure craft - owner'
            }
          }
        },
        '204': {
          description:
            'Operating or permitting operation of licenced pleasure craft on which licence number not marked and maintained in the specified form and manner.'
        },
        'Boating Restriction Regulations': {
          '2': {
            '4': {
              description:
                'Operate power driven or electrically propelled vessel with more engine power than maximum specified'
            }
          },
          '2.5': {
            '2': {
              description: 'No person who is under 16 years of age shall operate a personal watercraft'
            }
          }
        },
        'Competency of Operators of Pleasure Craft Regulations': {
          '3': {
            '1': {
              a: {
                description: 'Operate a pleasure craft without prescribed competency'
              },
              b: {
                description: 'Failure to have proof of competency on board a pleasure craft'
              }
            },
            '2.1': {
              A: {
                description: 'Allow a person to operate a pleasure craft without prescribed competency'
              }
            }
          }
        },
        'Small Vessel Regulation': {
          '10': {
            '1': {
              a: {
                description:
                  'Failing to wear personal flotation device or lifejacket in open vessel if device or lifejacket is of inflatable type'
              }
            }
          },
          '41': {
            '1': {
              a: {
                description: 'Use a small vessel to tow a person on water without a person on board keeping watch'
              },
              B: {
                description:
                  'Use a small vessel to tow a person on water without seating space on board for the person being towed'
              },
              d: {
                description:
                  'Use a small vessel to tow a person on water during period beginning one hour after sunset and ending at sunrise'
              },
              f: {
                description:
                  'Use a small vessel to tow a person on water without seating space on board for the person being towed'
              }
            }
          },
          '101': {
            a: {
              description: 'Operate or permit another person to operate a pleasure craft without craft being licenced'
            },
            b: {
              description:
                'Operating or permitting a person to operate a pleasure craft without copy of licence on board'
            },
            c: {
              description:
                'Operate or permit a person to operate a pleasure craft if owner?s name and address on licence are not accurate'
            }
          },
          '201': {
            description:
              'Operator of a pleasure craft failing to take all reasonable steps to ensure safety of craft and of persons on board'
          },
          '202': {
            '1': {
              description: 'Operating or permitting a person to operate an unlicensed pleasure craft - owner'
            }
          },
          '1005': {
            '1': {
              a: {
                description:
                  'Operating vessel to tow a person without a person on board other than the operator keeping watch on every person being towed'
              },
              b: {
                description:
                  'Operating vessel to tow a person without seating space on board for every person being towed'
              }
            }
          },
          '1007': {
            description:
              'Operating vessel in a careless manner, without due care and attention or without reasonable consideration for other persons'
          },
          '3 & 204': {
            a: {
              description:
                'Operating or permitting a person to operate a non-human powered pleasure craft without personal flotation device or lifejacket of appropriate size for each person on board'
            },
            b: {
              description:
                'Operating or permitting person to operate non-human-powered pleasure craft without reboarding device on board'
            },
            c: {
              description:
                'Operating or permitting a person to operate a non-human powered pleasure craft without prescribed additional personal life-saving appliances on board'
            }
          },
          '3 & 205': {
            description:
              'Operating or permitting person to operate non-human powered pleasure craft without prescribed visual signals on board'
          },
          '3 & 206': {
            a: {
              description:
                'Operating non-human powered pleasure craft without prescribed vessel safety equipment on board'
            }
          },
          '3 & 207': {
            description:
              'Operating or permitting a person to operate non-human powered pleasure craft without prescribed navigation equipment on board'
          },
          '3 & 208': {
            description:
              'Operating or permitting person to operate non-human powered pleasure craft without prescribed firefighting equipment on board'
          },
          '3 & 209': {
            '1': {
              description:
                'Operating or permitting person to operate human-powered pleasure craft without personal flotation device or lifejacket of appropriate size for each person on board'
            }
          },
          '3 & 211': {
            b: {
              description:
                'Allow a person to operate human-powered pleasure craft without prescribed vessel safety and navigation equipment on board'
            }
          },
          '3 & 5': {
            '1': {
              a: {
                description:
                  'Operating or permitting a person to operate a vessel with safety equipment not in good working order'
              },
              b: {
                description:
                  'Operating or permitting a person to operate vessel with safety equipment not readily accessible and available for immediate use'
              }
            }
          }
        },
        'Vessel Operation Restriction Regulations': {
          '2': {
            '2': {
              description: 'Operating power-driven or electrically propelled vessel where prohibited'
            },
            '3': {
              description: 'Operating power-driven vessel where prohibited'
            },
            '4': {
              description:
                'Operating power driven or electrically propelled vessel with more engine power than maximum specified'
            },
            '5': {
              description: 'Operating power-driven or electrically propelled vessel over maximum speed specified'
            },
            '7': {
              description:
                'Operating power-driven vessel at a speed over 10 km/hr within 30m of shore in specified waters'
            }
          },
          '21': {
            description: 'Operating a personal watercraft � person under 16 years of age',
            b: {
              description: 'Allowing a person under 16 years of age to operate a personal watercraft'
            }
          }
        }
      },
      'Environmental Management Act': {
        '6': {
          '2': {
            description: 'Introduce waste into the environment in the course of industry, trade or business'
          },
          '3': {
            description: 'Introduce waste into environment by prescribed activity'
          },
          '4': {
            description: 'Introduce waste into the environment and cause pollution'
          }
        },
        '7': {
          '1': {
            description: 'Fail to keep hazardous waste in accordance with regulations'
          },
          '2': {
            description: 'Release hazardous waste'
          }
        },
        '8': {
          '1': {
            description: 'Burning in unfavourable conditions according to publicly available ventilation index'
          },
          description: 'Fail to construct/establish hazardous waste facility in accordance with regulations'
        },
        '9': {
          '1': {
            a: {
              description: 'Store more than prescribed amount of hazardous wastein contravention of regulations'
            }
          },
          '4': {
            description: 'Fail to dispose of stored hazardous waste as ordered by the Director'
          }
        },
        '10': {
          '1': {
            a: {
              description: 'Allow more than prescribed amount of hazardous waste to leave property without manifest'
            },
            b: {
              description:
                'Fail to ensure person transporting more than prescribed amount of hazardous waste has licence'
            },
            c: {
              description:
                'Allow more than prescribed amount of hazardous waste to be transported to a place prohibited under section 9 of the Act'
            }
          },
          '2': {
            a: {
              description:
                'Transport more than the prescribed amount of hazardous waste without carrying a licence as required'
            }
          },
          '3': {
            a: {
              description: 'Accept delivery without manifest'
            },
            b: {
              description:
                'Accept delivery of more than prescribed amount of hazardous waste without completing and filing manifest'
            }
          }
        },
        '12': {
          '2': {
            description: 'Deposit litter'
          }
        },
        '13': {
          description: 'Discharge domestic waste from a recreational vehicle in an unauthorized manner'
        },
        '79': {
          '5': {
            description: 'Fail to immediately report spill'
          }
        },
        '120': {
          '6': {
            description: 'Introduce waste into the environment without complying with permit or approval held'
          },
          '7': {
            description: 'Fail to comply with hazardous waste storage permit or approval (while discharging)'
          },
          '10': {
            description: 'Contravene order of Manager, Director or the Minister'
          },
          '11': {
            description: 'Contravene management plan'
          },
          '12': {
            description: 'Contravene a requirement of the regulations respecting hazardous waste'
          },
          '13': {
            description:
              'Contravenes regulation specifying quantity and characteristics of waste introduced into environment'
          }
        },
        'Hazardous Waste Regulation': {
          '2': {
            '10': {
              description: 'Knowingly provides false information'
            }
          }
        },
        'Ozone Depleting Substances and other Halocarbons Regulation': {
          '4': {
            '1': {
              description:
                'Release or allow or cause the release of an o depleting substance or other halocarbon without permission'
            }
          },
          '6': {
            '3': {
              description: 'Sell substance to unapproved person'
            }
          },
          '7': {
            '1': {
              description: 'Unauthorized service of equipment'
            }
          },
          '9': {
            '1': {
              description: 'Fail to obtain signed acknowledgement'
            }
          },
          '18': {
            description: 'Fail to recover susbstance'
          }
        },
        'Waste Discharge Regulation': {
          '6': {
            '1': {
              description: 'Fail to comply with a code of practice other than a waste introduction requirement'
            }
          }
        }
      },
      'Firearm Act': {
        '9': {
          '1': {
            description: 'Discharge, carry, possess loaded firearm in vehicle'
          }
        }
      },
      'Fish and Seafood Act': {
        '3': {
          description: 'Fail to ensure fish safe for human consumption'
        },
        '14': {
          description: 'Fail to comply with Act'
        },
        '15': {
          '2': {
            description: 'Fail to conduct prescribed monitoring'
          }
        },
        '16': {
          description: 'Fail to meet facility requirements'
        },
        '17': {
          '1': {
            description: 'Fail to keep or produce records'
          },
          '2': {
            description: 'Fail to make reports'
          }
        },
        '19': {
          description: 'Fail to meet traceability requirements'
        },
        '54': {
          '2': {
            a: {
              description: 'Knowingly provide false information'
            }
          }
        },
        'Fish and Seafood Licensing Regulation': {
          '53': {
            '1': {
              b: {
                description: 'Receive bivalve molluscs in untagged container'
              }
            }
          }
        }
      },
      'Fisheries Act (Canada)': {
        'Fishing (General) Regulations': {
          '6': {
            '1': {
              b: {
                description: 'Trap or pen fish on spawning grounds'
              }
            }
          },
          '11': {
            description: "Fail to carry or produce licence or fisher's registration card"
          },
          '15': {
            '1': {
              c: {
                description: 'Use licence of another person'
              }
            },
            '3': {
              description: 'Permit another person to use licence'
            }
          },
          '22': {
            '7': {
              description: 'Contravene or fail to comply with licence condition'
            }
          },
          '27': {
            '1': {
              a: {
                description: 'Set, operate or leave gear unattended without proper markings'
              }
            }
          },
          '33': {
            '2': {
              a: {
                description: 'Fail to forthwith return fish to water'
              },
              b: {
                description: 'Fail to release fish in least harmful manner'
              }
            }
          },
          '36': {
            '1': {
              a: {
                description: 'Possess fish in a way that species cannot be identified'
              },
              b: {
                description: 'Possess fish where number cannot be determined'
              },
              d: {
                description: 'Possess fish where size cannot be determined'
              }
            }
          }
        },
        'Pacific Fishery Regulations': {
          '63': {
            description: 'Fish for shellfish during closed times'
          }
        },
        'Sport Fishing Regulation': {
          '4': {
            description: 'Molest or injure fish'
          },
          '6': {
            '1': {
              a: {
                description: 'Angle with more than one fishing line'
              }
            }
          },
          '8': {
            '1': {
              description:
                'Angle with fishing line to which more than one hook, artificial lure or artificial fly is attached'
            }
          },
          '9': {
            description: 'Fish with illegal dip net'
          },
          '10': {
            '1': {
              c: {
                description: 'Wilfully foul hook, or attempt to foul hook fish'
              }
            },
            '2': {
              description: 'Retain foul-hooked fish'
            }
          },
          '11': {
            description: 'Angle from a vessel equipped with a motor in prohibited waters'
          },
          '12': {
            description: 'Angle from vessel in prohibited waters'
          },
          '13': {
            '1': {
              description: 'Possess more than twice the daily quota for fish, other than halibut'
            },
            '2': {
              description: 'Possess more than daily quota of halibut'
            }
          },
          '18': {
            a: {
              description: 'Fish without a licence'
            },
            b: {
              description: 'Catch and retain salmon without valid conservation stamp'
            }
          },
          '22': {
            description: 'Failure to maintain catch records'
          },
          '24': {
            '1': {
              description: 'Fish for fin fish during a closed time'
            }
          },
          '25': {
            '1': {
              description: 'Catch and retain more than the daily quota of species set out in schedule iv'
            }
          },
          '26': {
            c: {
              description: 'Catch and retain more than the aggregate daily quota for rockfish'
            }
          },
          '29': {
            '1': {
              d: {
                description: 'Catch and retain undersized lingcod'
              }
            }
          },
          '30': {
            description: 'Fish with method or gear not approved by schedule IV of the regulation for that species'
          },
          '34': {
            description: 'Fish for certain fish during close time'
          },
          '35': {
            description: 'Catch and retain certain fish in excess of the daily quota'
          },
          '36': {
            a: {
              description: 'Catch and retain more than the aggregate daily quota for clams'
            },
            b: {
              description:
                'Catch and retain more than the aggregate daily quota of four dungeness crab and red rock crab'
            },
            c: {
              description:
                'Catch and retain more than the aggregate daily quota of six dungeness crab, red rock crab and king crab'
            }
          },
          '37': {
            '1': {
              b: {
                description: 'Catch and retain undersized dungeness crab'
              }
            }
          },
          '38': {
            description:
              'Use prohibited gear in fishing for crustaceans, echinoderms, molluscs and shellfish in tidal waters'
          },
          '39': {
            description: 'Fish for crab with more than two ring nets, dip nets and crab traps in the aggregate'
          },
          '41': {
            description: 'Fish with illegal crab trap'
          },
          '43': {
            description: 'Fish for salmon during closed time'
          },
          '44': {
            description: 'Catch and retain salmon in excess of the daily quota'
          },
          '45': {
            '1': {
              a: {
                description:
                  'Catch and retain more than the aggregate daily quota of hatchery chinook and wild chinook salmon'
              },
              e: {
                description:
                  'Catch and retain more than aggregate daily total of hatchery and wild coho greater than 35 cms in length'
              },
              f: {
                description:
                  'Catch and retain more than the daily aggregate quota of four hatchery coho salmon and wild coho salmon'
              }
            },
            '2': {
              description: 'Catch and retain more than aggregate daily quota for salmon'
            }
          },
          '48': {
            description: 'Catch and retain undersized salmon'
          },
          '49': {
            description: 'Fish for salmon by prohibited method, with prohibited gear or with prohibited bait'
          },
          '50': {
            description: 'Fish for salmon other than by angling'
          },
          '52': {
            description:
              'Fish for fin fish other than salmon, other than by angling, by spear fishing or with a set line'
          },
          '53': {
            description: 'Fishing with a spear for unauthorized species'
          },
          '54': {
            a: {
              description: 'Use more than one set line'
            },
            b: {
              description: 'Use illegal hook on set line'
            },
            c: {
              description: 'Fish with set line and retain fish contrary to regulation'
            }
          },
          '55': {
            '1': {
              description: 'Fish, or catch and retain fish, during closed time'
            }
          },
          '56': {
            '1': {
              description: 'Catch and retain more than the daily quota'
            },
            '2': {
              description: 'Fishing after catching and retaining daily quota for steelhead'
            }
          },
          '57': {
            a: {
              description: 'Catch and retain more than the aggregate daily quota for wild and hatchery rainbow trout'
            },
            b: {
              description: 'Catch and retain more than the aggregate daily quota for wild and Steelhead trout'
            },
            c: {
              description: 'Catch and retain more than the aggregate daily quota for wild and hatchery cutthroat'
            },
            d: {
              description: 'Catch and retain more than the aggregate daily quota for wild and hatchery brown trout'
            },
            f: {
              description: 'Catch and retain more than the aggregate daily quota for wild and hatchery dolly varden'
            },
            g: {
              description: 'Catch and retain more than the aggregate daily quota for wild and hatchery lake trout'
            },
            h: {
              description: 'Catch and retain more than the aggregate daily quota for smallmouth and largemouth bass'
            },
            I: {
              description: 'Catch and retain more than the aggregate daily quota for wild and hatchery kokanee'
            }
          },
          '58': {
            description: 'Catch and retain more than the aggregate daily quota'
          },
          '60': {
            a: {
              description: 'Catch and retain more than annual quota for steelhead'
            }
          },
          '62': {
            description: 'Deposit fish-attracting substance in water'
          },
          '63': {
            description: 'Fish by/with prohibited method, gear or bait'
          },
          '65': {
            description: 'Exceed one single barbless hook when prohibited'
          },
          '66': {
            a: {
              description: 'Use more than one line'
            }
          }
        }
      },
      'Fisheries Act (Provincial)': {
        '6': {
          description: 'Obstruct or interfere with officer in discharge of duties'
        },
        '13': {
          '1': {
            description: 'Process fish without licence'
          },
          '4': {
            description: 'Sell fish without licence'
          }
        }
      },
      'Food Safety Act': {
        'Meat Inspection Regulation': {
          '6': {
            '1': {
              description: 'Operate slaughter facility without licence'
            }
          },
          '30': {
            '1': {
              a: {
                description: 'Sell or store for sale uninspected meat'
              }
            }
          }
        }
      },
      'Forest Act': {
        '84': {
          '1': {
            description: 'Fail to ensure timber is marked'
          },
          '4': {
            description: 'Remove, obliterate or alter a timber mark'
          }
        },
        'Forest Act Regulations': {
          '10': {
            '1': {
              description: 'Fail to have written record of transported timber'
            },
            '2': {
              description: 'Failure to include all required information in written record of timber being transported'
            }
          }
        },
        'Timber Marketing Regulation': {
          '10': {
            '3': {
              description: 'Documentation requirements -  fail to maintain adequate records.'
            }
          }
        }
      },
      'Forest and Range Practices Act': {
        '9': {
          description: 'Illegal disposal of litter'
        },
        '10': {
          description: 'Illegal disposal of game residue'
        },
        '22': {
          '2': {
            b: {
              description: 'Unauthorized use of road in a provincial forest'
            },
            description:
              'Use, construct, maintain or deactivate a road prescribed by the Act in a manner not in accordance with the Act'
          }
        },
        '46': {
          '1': {
            description:
              'Unlawfully carry out a forest/range practice or other activity that results in damage to the environment'
          },
          '1.1': {
            description: 'Unauthorized activity resulting in prescribed damage to the environment'
          }
        },
        '50': {
          '1': {
            description: 'Unauthorized livestock on crown range'
          }
        },
        '52': {
          '1': {
            description: 'Cut, damage or destroy crown timber without authorization'
          },
          '3': {
            description: 'Remove crown timber without authorization'
          }
        },
        '54': {
          '1': {
            description: 'Unauthorized construction or occupation of a structure'
          }
        },
        '58': {
          '1': {
            A: {
              description: 'Disobey non-recreation order'
            },
            b: {
              description: 'Disobey order restricting or prohibiting recreation'
            }
          }
        },
        '63': {
          '1': {
            description: 'Fail to stop vehicle or vessel'
          }
        },
        '96': {
          '1': {
            description: 'Cut, remove, damage or destroy crown timber without authority'
          },
          description: 'Cut, remove, damage or destroy crown timber without authority'
        },
        '97': {
          '2': {
            c: {
              description:
                'Intentionally make a false statement to, or mislead or attempt to mislead, a person acting in an official capacity'
            }
          }
        },
        'Forest Recreation Regulation': {
          '6': {
            '1': {
              description: 'Illegal use of vehicle or equipment on recreation site'
            },
            '2': {
              description: 'Exceed 20km/h'
            },
            '3': {
              description: 'Illegal parking'
            }
          },
          '7': {
            '1': {
              B: {
                description: 'Fail to properly wear a motorcycle safety helmet'
              },
              b: {
                description: 'Fail to wear a motorcycle safety helmet'
              }
            }
          },
          '9': {
            description: 'Illegal disposal of litter'
          },
          '11': {
            description: 'Illegal use of traps, firearms, bows or crossbows'
          },
          '13': {
            '1': {
              description: 'Unauthorized stay exceeding 14 days'
            }
          },
          '14': {
            description: 'Unauthorized removal of firewood'
          },
          '15': {
            '1': {
              description: 'Unauthorized construction of structure'
            }
          },
          '16': {
            description: 'Unauthorized use of site, trail or area'
          },
          '17': {
            a: {
              description: 'Damage to facilities, structures or natural resources'
            },
            B: {
              description: 'Unauthorized moving of a structure'
            }
          },
          '18': {
            '1': {
              description: 'Deliberate or unnecessary disturbance'
            },
            '2': {
              description: 'Disturbance between 11:00 p.m. and 7:00 a.m.'
            }
          },
          '20': {
            '6': {
              description: 'Fail to comply with a prohibition, requirement, limitation, rule or closure'
            }
          },
          '23': {
            '2': {
              description: 'Fail to obey an order issued under section 23(1) of the regulation'
            }
          }
        },
        'Forest Service Road Use Regulation': {
          '3': {
            '3': {
              description: 'Snowmobile illegally on forest service road'
            }
          },
          '4': {
            description: 'Speed on forest service road'
          },
          '6': {
            '4': {
              description: 'Damage or remove traffic control device'
            },
            '5': {
              description: 'Disobey traffic control device'
            }
          },
          '12': {
            '1': {
              description:
                'Operate or cause to be operated a motor vehicle or trailer on a forest service road without required insurance and proof thereof'
            }
          }
        }
      },
      'Forest And Range Practices Act': {
        '22': {
          '2': {
            a: {
              description: 'Unauthorized use of forest service road'
            }
          }
        },
        'Forest Recreation Regulation': {
          '8': {
            description: 'Illegal discharge of holding tank'
          }
        }
      },
      'Forest Practices Code of British Columbia Act': {
        '84': {
          '2': {
            description: 'Enter restricted area without consent'
          }
        },
        '87': {
          '1': {
            description: 'Drop burning substance'
          }
        },
        '96': {
          '1': {
            description: 'Cut, remove, damage or destroy crown timber without authority'
          }
        },
        'Forest Recreation Regulation': {
          '6': {
            '2': {
              description: 'Illegal use of vehicle or equipment on recreation site'
            }
          }
        },
        'Forest Service Road Use Regulation': {
          '12': {
            '1': {
              description: 'Use forest service road without required insurance'
            }
          }
        }
      },
      'Integrated Pest Management Act': {
        '3': {
          '1': {
            a: {
              description: 'Release pesticide in manner causing or likely to cause unreasonable adverse effect'
            },
            b: {
              description: 'Unlawfully use, handle, release, transport, store, dispose of or sell a pesticide'
            },
            c: {
              description: 'Use pesticide contrary to label or instructions'
            }
          },
          '2': {
            B: {
              description: 'Improper use of unregistered pesticide'
            }
          }
        },
        '4': {
          '1': {
            description: 'Sell, use or provide service for pesticide without licence'
          }
        },
        '5': {
          '3': {
            description: 'Fail to ensure certified individual performs pesticide sale duties'
          }
        }
      },
      'Migratory Birds Convention Act': {
        'Migratory Bird Sanctuary Regulations': {
          '8': {
            description: 'Use motor boat in Vaseux Lake Bird Sanctuary'
          },
          '10': {
            '1': {
              a: {
                description: 'Unlawfully carry on activity harmful to migratory birds'
              }
            }
          }
        },
        'Migratory Bird Regulations': {
          '4': {
            '6': {
              a: {
                description: 'Fail to have permit on person while hunting'
              },
              b: {
                description: 'Fail to show permit upon request'
              }
            },
            '11': {
              a: {
                description: 'Fail to have permit on person when taking nest, etc.'
              }
            }
          },
          '5': {
            '1': {
              description: 'Hunt migratory birds without authority of permit'
            },
            '3': {
              description: 'Hunt a migratory game bird without a permit'
            },
            '4': {
              description: 'Hunt migratory birds during closed season'
            }
          },
          '11': {
            '1': {
              description: 'Possess  or transport a migratory bird without at least one feathered wing'
            }
          },
          '15': {
            '1': {
              d: {
                description: 'Hunt migratory birds by use of unplugged shotgun'
              },
              e: {
                description: 'Hunt migratory birds from boat, vehicle or aircraft'
              }
            }
          },
          '16': {
            '1.1': {
              description: 'Fail to make every reasonable effort to retrieve'
            }
          },
          '17': {
            a: {
              description: 'Hunt during prohibited hours'
            }
          },
          '29': {
            description: 'Possess migratory birds without taxidermy permit'
          }
        }
      },
      'Motor Vehicle (all terrain) Act': {
        '2': {
          '1': {
            description: 'Operate non-registered vehicle or fail display vehicle identification'
          }
        },
        '4': {
          '1': {
            a: {
              description: 'Careless operation of an ATV'
            },
            D: {
              description: 'Operate  on private property'
            },
            E: {
              description: 'Harass wildlife or domestic animals'
            },
            F: {
              description: 'Operate in prohibited area; operate during prohibited time'
            }
          },
          '3': {
            description: "Operate an ATV on/across highway without a driver's licence"
          }
        },
        '7': {
          description:
            'Operate ATV for purpose of hunting in an area and during a specified period as described in schedule 6'
        }
      },
      'Motor Vehicle Act': {
        '13': {
          '1': {
            a: {
              description: 'Operates vehicle without the licence required by the act'
            },
            b: {
              description: 'Operate a vehicle or trailer without displaying number plates'
            },
            c: {
              description: 'Wrong number plate'
            }
          }
        },
        '21': {
          '7': {
            C: {
              description: 'Fail to produce registration'
            }
          }
        },
        '24': {
          '1': {
            description: "Operate motor vehicle without driver's licence"
          },
          '3': {
            b: {
              description: 'Operate a vehicle or trailer without insurance'
            }
          }
        },
        '25': {
          '15': {
            description: 'Drive contrary to restriction'
          }
        },
        '31': {
          '1': {
            description: 'Fail to change address'
          }
        },
        '33': {
          '1': {
            description: "Fail to produce driver's licence and certificate and motor vehicle liability insurance"
          }
        },
        '71': {
          description: 'Fail to produce vehicle licence'
        },
        '73': {
          '1': {
            description: 'Fail to stop for officer'
          },
          '2': {
            description: 'Fail to provide name and address of driver and/or owner of vehicle'
          }
        },
        '85': {
          description: 'Allow unlicensed minor to drive'
        },
        '123': {
          description: 'Fail to obey traffic directions of a peace officer'
        },
        '125': {
          description: 'Fail to obey traffic control device'
        },
        '129': {
          '1': {
            description: 'Fail to stop for red light at intersection'
          },
          '5': {
            a: {
              description: 'Fail to stop at red light where no intersection'
            }
          }
        },
        '140': {
          description: 'Fail to obey construction signs if speed limit is exceeded'
        },
        '141': {
          description: 'Fail to obey flagman'
        },
        '144': {
          '1': {
            a: {
              description: 'Drive a motor vehicle without reasonable consideration for others'
            },
            b: {
              description: 'Drive without consideration'
            },
            c: {
              description: 'Speed relative to conditions'
            }
          }
        },
        '146': {
          '1': {
            description:
              'Speed in municipality if the speed limit is exceeded by 21 km/hr to 40 km/hr. (outside cos core mandate)'
          },
          '3': {
            description: 'Speed against highway sign'
          },
          description: 'Speed against highway sign'
        },
        '148': {
          '1': {
            description: 'Excessive speed if the speed limit is exceeded by more than 60 km/hr'
          }
        },
        '149': {
          '1': {
            description: 'Fail to stop for school bus'
          }
        },
        '151': {
          a: {
            description: 'Change lanes unsafely'
          },
          b: {
            description: 'Change lanes over solid line'
          },
          f: {
            description: 'Illegal pass on laned roadway'
          }
        },
        '154': {
          description: 'Pass when meeting oncoming vehicle'
        },
        '155': {
          '1': {
            a: {
              description: 'Cross solid double line'
            },
            b: {
              description: 'Cross solid broken line'
            }
          }
        },
        '158': {
          '1': {
            description: 'Pass on right'
          },
          '2': {
            A: {
              description: 'Pass on right unsafely'
            }
          }
        },
        '159': {
          description: 'Unsafe passing of another vehicle on the left hand side of the roadway'
        },
        '162': {
          '1': {
            description: 'Follow too closely'
          }
        },
        '166': {
          description: 'Improper left turn where no intersection'
        },
        '172': {
          '2': {
            description: 'No proper signalling equipment'
          }
        },
        '176': {
          '1': {
            description: 'Emerging vehicle fail to stop'
          }
        },
        '186': {
          description: 'Fail to obey stop sign'
        },
        '187': {
          '1': {
            description: 'Fail to park off roadway'
          },
          '2': {
            description: 'Obstruct traffic by parking'
          }
        },
        '194': {
          '3': {
            description: 'Ride motorcycle without required helmet'
          }
        },
        '200': {
          description: 'Drive on sidewalk'
        },
        '204': {
          '1': {
            description: 'Deposit injurious article on highway'
          },
          '2': {
            description: 'Litter on highway'
          }
        },
        '215': {
          description: '24 hr suspension for impaired driving'
        },
        '219': {
          '1': {
            description: 'Fail to comply with requirements of regulation'
          }
        },
        '220': {
          '4': {
            description: 'Fail to wear seat belt'
          },
          '6': {
            description: 'Permit passenger without seat belt'
          }
        },
        '221': {
          '1': {
            description: 'Ride motorcycle without required helmet'
          }
        },
        '231.1': {
          description: 'Smoke in motor vehicle when person under the age of 16 is present'
        },
        'Motor Vehicle Act Regulations': {
          '7': {
            A: {
              '01': {
                description: 'Unnecessary noise'
              }
            }
          },
          '30': {
            '10': {
              '4': {
                description:
                  "Fail to display N sign in violation of driver's licence condition (section 25 (15) motor vehicle act)"
              }
            }
          },
          '24.22': {
            description:
              'Drives or operates an air cushion vehicle, golf cart, neighbourhood zero emission vehicle, snow vehicle, snowmobile or utility vehicle in contravention of division 4'
          },
          '3.01': {
            description: 'Fail to display number plates and valid decal'
          },
          '3.02': {
            description: 'Improper display of plate'
          },
          '30.13': {
            description: 'Fail to display L or N sign'
          },
          '35.03': {
            '2': {
              description: 'Insecure load'
            },
            '3': {
              description:
                'Driver operates commercial or business vehicle without proper equipment or with insecure cargo'
            },
            '4': {
              description:
                'Driver operate non-commercial or non-business vehicle without proper equipment or with insecure cargo'
            }
          },
          '39.01': {
            a: {
              description: 'Fail to remain seated'
            }
          },
          '39.02': {
            a: {
              description: 'Operate vehicle while person riding on vehicle'
            }
          },
          '4.01': {
            description: 'Drive without lighted lamp'
          },
          '4.02': {
            '1': {
              description: 'Unauthorized lamp'
            }
          },
          '47.02': {
            description: 'Fail to slow down or move over near stopped official vehicle'
          }
        }
      },
      'Off-Road Vehicle Act': {
        '11': {
          '1': {
            'a-c': {
              description: 'Fail to apply for vehicle identification number'
            }
          },
          '3': {
            description: 'Fail to properly apply vehicle identification number'
          }
        },
        '12': {
          '1': {
            description: 'Alter, remove, or obliterate vehicle identification number'
          }
        },
        '14': {
          'A-B': {
            description:
              'Use or operate off-road vehicle not registered under ORA or registered or licenced under MVA or CTA'
          },
          C: {
            I: {
              description: 'Use or operate off-road vehicle without registration or licence from other jurisdiction'
            },
            II: {
              description: 'Fail to display number plate, decal or sticker of other jurisdiction'
            }
          }
        },
        '15': {
          '1': {
            A: {
              description: 'Fail to carry certificate of registration (or copy)'
            },
            B: {
              description: 'Improper display of number plate, decal or sticker'
            }
          },
          '2': {
            A: {
              description: 'No evidence of licence issued under MVA or CTA'
            }
          },
          '3': {
            description: 'Fail to carry documentation issued by other jurisdiction'
          }
        },
        '17': {
          '1': {
            A: {
              description: 'Use or operate off-road vehicle carelessly'
            }
          },
          '2': {
            B: {
              description: "Use or operate on private land without owner's consent"
            }
          }
        },
        '18': {
          '1': {
            description: 'No approved safety helmet'
          },
          '2': {
            description: 'Allow minor to be passenger without safety helmet'
          }
        },
        '20': {
          A: {
            description: 'Allow prohibited act by minor'
          }
        },
        '21': {
          '2': {
            description: 'Fail to stop for officer'
          },
          '3': {
            B: {
              description: 'Fail to produce documents and identification'
            }
          }
        },
        '25': {
          description: 'Obstruct an officer'
        }
      },
      'Park Act': {
        '4': {
          description: 'Guide without permit'
        },
        '8': {
          '1': {
            description: 'Cause a disturbance'
          }
        },
        '10': {
          '2': {
            description: 'Disobey park sign'
          }
        },
        '21': {
          description: 'Unlawful possession of explosive'
        },
        '33': {
          '1': {
            description: 'Illegal deposit of litter'
          }
        },
        'Park, Conservancy and Recreation Area Regulation': {
          '4': {
            description: 'Guide without permit'
          },
          '7': {
            description: 'Fail to give information'
          },
          '8': {
            '1': {
              description: 'Cause a disturbance'
            },
            '2': {
              description: 'Cause a disturbance between 11 p.m. and 7 a.m.'
            }
          },
          '9': {
            '1': {
              description: 'Fail to comply with eviction order'
            }
          },
          '10': {
            '2': {
              description: 'Disobey park sign'
            }
          },
          '11': {
            '1': {
              description: 'Start or maintain illegal fire in park or recreation area'
            },
            '2': {
              description: 'Unauthorized use of campground or front country vegetation to start or maintain a fire'
            },
            '3': {
              description: 'Illegal use of vegetation'
            },
            '4': {
              description: 'Fail to extinguish fire'
            }
          },
          '17': {
            '1': {
              description: 'Exceed maximum storage period'
            },
            '2': {
              description: 'Unlawful storage'
            }
          },
          '19': {
            '1': {
              description: 'Domestic animal in prohibited area (park)'
            },
            '3': {
              description: 'Unrestrained domestic animal'
            },
            '5': {
              description: 'Domestic animal in Bowron Lake or Garibaldi Park'
            },
            description: 'Unrestrained domestic animal contrary to posted regulation'
          },
          '20': {
            description: 'Fail to control animal'
          },
          '21': {
            description: 'Unlawful possession of explosive'
          },
          '23': {
            '1': {
              description: 'Illegal parking'
            }
          },
          '24': {
            '1': {
              description:
                'Use or operate a motor vehicle, motorcycle or self-propelled vehicle in an undesignated park or recreation area'
            },
            '3': {
              description: 'Illegal use of snowmobile'
            }
          },
          '25': {
            description: 'Illegal use of cycle'
          },
          '26': {
            description: 'Illegal use of vehicle for advertising'
          },
          '27': {
            description: 'Prohibited arrival or departure by aircraft'
          },
          '28': {
            a: {
              description:
                'Possess firearm, bow or crossbow in park or recreation area except when carried in a vehicle'
            }
          },
          '29': {
            '1': {
              description: 'Illegal discharge of firearm or bow'
            }
          },
          '30': {
            description: 'Illegal feeding of wildlife'
          },
          '32': {
            '1': {
              description: 'Unauthorized activity',
              a: {
                description:
                  'Damage or destroy any natural resource or property in a park or recreation area without authority'
              },
              c: {
                description:
                  'Remove any natural resource or property from a park or recreation area without authorization'
              },
              f: {
                description:
                  'Deposit, allow to flow onto land or water or be emitted into the air in a park or recreation area any waste'
              }
            },
            description: 'Damage or destroy any natural resource or property in a park or recreation area'
          },
          '33': {
            '1': {
              description: 'Illegal deposit of litter'
            },
            '2': {
              description: 'Leave litter in park or recreation area where no receptacle is provided'
            }
          },
          '34': {
            description: 'Illegal transport and disposal of litter'
          },
          '36': {
            description: 'Fail to register'
          },
          '37': {
            '1': {
              description: 'Unlawfully in campground'
            }
          },
          '38': {
            '1': {
              description:
                'Camp in front country or back country less than 2000 hectares without a campsite or authorization'
            }
          },
          '39': {
            '2': {
              description: 'Exceed maximum stay'
            }
          },
          '42': {
            description: 'Fail to pay appropriate fee'
          }
        }
      },
      'Trespass Act': {
        '2': {
          '1': {
            description: 'Trespass on enclosed land or premises, or engage in prohibited activity'
          }
        },
        '4': {
          '1': {
            a: {
              description: 'Enter premises that are enclosed land'
            }
          }
        }
      },
      'Waste Management Act': {
        '3': {
          '2': {
            description: 'Introduce industrial, business waste into environment'
          }
        },
        '9.1': {
          '2': {
            description: 'Deposit litter'
          }
        },
        'Open Burning Smoke Control Regulation': {
          '8': {
            '1': {
              description: 'Burning in unfavourable conditions according to publicly available ventilation index'
            }
          }
        }
      },
      'Water Sustainability Act': {
        '106': {
          '2': {
            B: {
              description: 'Divert/make changes water from a stream or aquifer without lawful authority'
            }
          },
          '3': {
            K: {
              description:
                'Breach a term or condition of an authorization change approval, permit or drilling authorization that does not relate to a sensitive stream'
            }
          }
        }
      },
      'Wild Animal and Plant Protection Act': {
        '6': {
          '1': {
            e: {
              description: 'Import an animal transported in contravention of a foreign state\'s law'
            }
          },
          '2': {
            description:
              'Import/export any animal or plant or any part or derivative of an animal or plant, without a permit'
          }
        },
        '7': {
          '1': {
            a: {
              description:
                'Transport an animal from one province to another province without, or not in accordance with a provincial permit'
            }
          },
          '2': {
            description:
              'Transport from a province to another province an animal or plant or any part or derivative which was taken, possessed, distributed or transported in contravention of provincial Act or regulation'
          }
        },
        '8': {
          b: {
            description: 'Unlawfully posses an animal or part thereof for the purposeof exporting it'
          }
        }
      },
      'Wildfire Act': {
        '2': {
          description: 'Fail to report fire'
        },
        '3': {
          '1': {
            description:
              'Drop, release or mishandle a burning substance, or any other thing that the person reasonably ought to know is likely to cause a fire'
          },
          '2': {
            description: 'Fail to extinguish burning substance'
          }
        },
        '5': {
          '1': {
            description:
              'Light, fuel or use an open fire in a non-industrial activity in or within 1 km of  forest or grass land'
          },
          '2': {
            description:
              'Light, fuel or use an open fire in or within 1 km of forest or grass land and fail to immediately carry out fire control and report as required'
          }
        },
        '6': {
          '1': {
            description: 'Light, fuel or use fire against regulations, industrial'
          },
          '3': {
            description:
              'Fail to comply with high risk activity restrictions, and keep at activity site fire fighting hand tools and adequate fire suppression system'
          }
        },
        '10': {
          '3': {
            description: 'Light, fuel or use fire against restriction'
          },
          '4': {
            description: 'Fail to comply with fire restriction'
          }
        },
        '12': {
          '2': {
            description: 'Carry out activity or use equipment, material or substance in contravention of an order'
          }
        },
        '22': {
          '3': {
            description: 'Fail to provide documents'
          }
        },
        '56': {
          '2': {
            description: 'Intentional interference, non-compliance or false statement'
          }
        },
        'Wildfire Regulation': {
          '5': {
            description:
              'Fail to ensure that fire fighting hand tools are available to properly equip each person who works at the site'
          },
          '6': {
            '3': {
              description:
                'Fail to comply with high risk activity restrictions, and keep at activity site fire fighting hand tools and adequate fire suppression system'
            }
          }
        }
      },
      'Wildlife Act': {
        '5': {
          '1': {
            description: 'Hunt big game without hunting licence & species licence'
          }
        },
        '7': {
          '1': {
            description: 'Fail to immediately cancel species licence'
          },
          '5': {
            description:
              'Contravene a regional manager order made under subsection (4) for a wildlife management area, a critical wildlife area, or a wildlife sanctuary'
          }
        },
        '9': {
          '1': {
            a: {
              description: 'Disturbs, molests, destroys muskrat house or den'
            },
            b: {
              description: 'Disturb, molests, destroys beaver house, den or dam'
            }
          }
        },
        '10': {
          '1': {
            a: {
              description: 'Schedule 9-discharges firearm using single project'
            }
          }
        },
        '11': {
          '1': {
            a: {
              description: 'Hunts wildlife without licence'
            },
            b: {
              description: 'Hunts wildlife or carries firearm without Limited Entry Hunt authorization'
            },
            C: {
              description: 'Hunts wildlife or carries a firearm without a licence required by regulation'
            },
            d: {
              description: 'Hunt without permit required'
            }
          },
          '5': {
            description: 'Person under 18 hunts without supervision'
          },
          '8': {
            description: 'Trapping without licence'
          }
        },
        '12': {
          a: {
            i: {
              description: 'Angles in non-tidal waters without angling licence'
            },
            ii: {
              description: 'Angles in non-tidal waters without other licences or permitsrequired by regulation'
            }
          }
        },
        '14': {
          description: 'Possess more than legal number of licences'
        },
        '21': {
          '1': {
            a: {
              description: 'Unlawful import of live wildlife'
            },
            b: {
              description: 'Export wildlife or parts or egg without permit'
            }
          }
        },
        '24': {
          '14': {
            a: {
              description: 'Apply for or obtains angling licence when prohibited'
            }
          }
        },
        '26': {
          '1': {
            C: {
              description: 'Hunt, take, trap, wound or kill wildlife not within open season'
            },
            d: {
              description: 'Hunt during prohibited hours'
            },
            h: {
              description: 'Hunt with unplugged shotgun'
            }
          }
        },
        '27': {
          '1': {
            description: 'Discharge firearm/hunt wildlife from motor vehicle/boat'
          },
          '3': {
            description: 'Harass wildlife with motor vehicle, aircraft or boat'
          },
          '4': {
            description: 'Hunt game within six hours of being airborne'
          }
        },
        '29': {
          description: 'Attempt to capture wildlife'
        },
        '30': {
          description: 'Hunt big game while it is swimming'
        },
        '31': {
          description: 'Discharge firearm on or across highway'
        },
        '32': {
          description: 'Discharge firearm in no shooting area'
        },
        '33': {
          '1': {
            description: 'Unlawful possession of live wildlife'
          },
          '2': {
            description: 'Unlawful possession of dead wildlife or parts'
          }
        },
        '34': {
          a: {
            description: 'Possess/injure/take/molest/destroy a bird or egg'
          },
          b: {
            description: 'Molest / take / destroy bird nest'
          }
        },
        '35': {
          '2': {
            a: {
              description: 'Fail to retrieve wildlife'
            },
            b: {
              description: 'Fail to remove edible portions of wildlife'
            }
          }
        },
        '36': {
          '1': {
            description: 'Possess carcass without parts attached'
          },
          '2': {
            b: {
              description: 'Fail to remove edible portions of wildlife'
            }
          }
        },
        '37': {
          description: 'Transport wildlife in province contrary to regulations'
        },
        '38': {
          description: 'Failure to provide information to officer'
        },
        '39': {
          '1': {
            a: {
              description: 'Hunt or trap on cultivated land without consent'
            }
          }
        },
        '41': {
          a: {
            description: 'Unlawful trapping/violate regulations for trapline'
          },
          b: {
            description: 'Sets traps in violation of regulations'
          },
          d: {
            description: 'Trap, hunt or kill fur bearing animal without permission of the land owner'
          }
        },
        '44': {
          description: 'Leave trap set after open season'
        },
        '46': {
          description: 'Interfere with lawfully set trap'
        },
        '47': {
          a: {
            description: 'Hunt big game while not a resident'
          },
          b: {
            i: {
              description: 'Non-resident hunts big game without guide'
            }
          }
        },
        '48': {
          '1': {
            a: {
              description: 'Guide without guide outfitters licence'
            },
            b: {
              description: 'Guide for game without licence'
            }
          },
          '2': {
            description: 'Guide employs person without licence to guide'
          }
        },
        '49': {
          '1': {
            description: 'Act as guide for fish without angling guide licence',
            a: {
              description: 'Guide for fish without angling guide licence'
            },
            b: {
              description: 'Guide for fish without licence'
            }
          },
          '2': {
            description: 'Angling guide employs assistant guide without assistant angling guide licence'
          }
        },
        '55': {
          '1': {
            c: {
              description: 'Guide outfitter delivers original report to the regional manager 10 days after hunt'
            }
          },
          '2': {
            description: 'Fail to complete or give guide report',
            b: {
              description: 'Guide fails to deliver report'
            }
          }
        },
        '56': {
          '1': {
            description: 'Guide unlicenced hunter'
          },
          '2': {
            description: 'Angling guide guides unlicenced angler'
          }
        },
        '69': {
          description: 'Fail to pay guide royalty'
        },
        '70': {
          '2': {
            description: 'Person without a permit accompanying person on hunt for big game'
          }
        },
        '71': {
          '1': {
            a: {
              description: 'Receive wildlife without owners licence number'
            },
            b: {
              description: 'Fail to keep record of wildlife received'
            }
          },
          '2': {
            a: {
              description: 'Fail to produce all wildlife records in possession'
            }
          }
        },
        '72': {
          '1': {
            description: 'Fur trade without licence'
          }
        },
        '75': {
          '2': {
            description:
              'Fail to report promptly to an officer the accidental killing or wounding and the location of the wildlife'
          },
          description: 'Fail to report killing of game by accident or for protection'
        },
        '78': {
          a: {
            description: 'Cause or allow dog to pursue wildlife'
          },
          b: {
            description: 'Allow dog to unlawfully pursue game'
          }
        },
        '80': {
          description: 'Obstruct person licenced to hunt/fish/guide/trap'
        },
        '82': {
          '1': {
            A: {
              description:
                'Knowingly make a false statement in order to obtain a licence, permit or limited entry hunting authorization'
            }
          }
        },
        '83': {
          '2': {
            description: 'Remove, alter, destroy sign or notice'
          }
        },
        '85': {
          '2': {
            description: 'Obtain licence while fine outstanding',
            c: {
              description:
                'Participate in activity for which a licence, permit or limited entry hunting authorization is required while a fine is unpaid'
            }
          }
        },
        '95': {
          '2': {
            a: {
              description: 'Fail to stop vehicle for officer'
            }
          }
        },
        '97': {
          '2': {
            B: {
              description: 'Fail to produce prescribed photo identification to officer'
            },
            C: {
              description: 'Fail to demonstrate person holds authorization'
            }
          },
          '4': {
            B: {
              description: 'Failure by exempt person to produce prescribed photo identification to officer'
            }
          },
          a: {
            description: 'Fail to produce licence or permit for officer'
          },
          b: {
            description: 'Fail or refuse to state name and address'
          }
        },
        '17.1': {
          '3': {
            description: 'Unlawfully accompany person under 18'
          },
          '4': {
            description: 'Allow person under 18 to hunt/carry firearm without supervision'
          }
        },
        '33.1': {
          '1': {
            a: {
              description: 'Intentionally feed dangerous wildlife'
            },
            b: {
              description: 'Intentionally provide, leave or place an attractant to attract dangerous wildlife'
            }
          },
          '2': {
            description:
              'Provides, leaves or places food, food waste or other substance that could attract dangerous wildlife to land or premises'
          }
        },
        '88.1': {
          '7': {
            description: 'Fail to comply with dangerous wildlife protection order'
          }
        },
        'Angling & Scientific Collection Regulation': {
          '16': {
            '1': {
              description: 'Dress fish in manner such that species, number or length cannot be determined'
            }
          },
          '17': {
            a: {
              description: 'Failure to properly record steelhead from non-tidal waters'
            },
            b: {
              description: 'Fail to properly record Kootenay Lake rainbow trout'
            },
            d: {
              description: 'Fail to properly record adult chinook salmon from non-tidal waters'
            },
            e: {
              description: 'Fail to properly record rainbow trout from Shuswap Lake'
            },
            f: {
              description: 'Fail to properly record char from Shuswap Lake'
            }
          },
          '19': {
            a: {
              description: 'Angle in prescribed waters without licence'
            },
            'A.1': {
              description: 'Angle in prescribed waters during prohibited time'
            },
            b: {
              description: 'Act as guide for person without Class I or II licence for waters'
            },
            K: {
              description: 'Fail to comply with reporting conditions of angling guide licence'
            },
            L: {
              description: 'Fail to comply with a condition of angling guide licence or assistant angling guide licence'
            }
          }
        },
        'Closed Areas Regulation': {
          '10': {
            '1': {
              a: {
                description: 'Schedule 9-discharges firearm using single project'
              },
              b: {
                description: 'Discharge firearm using single projectile during period for shot use only'
              },
              c: {
                description: 'Discharge rifle in a closed area'
              }
            }
          },
          '19': {
            '1': {
              b: {
                description: 'Discharge a firearm within 100 metres of a dwelling house'
              }
            }
          },
          '10.1': {
            '1': {
              description: 'Discharges firearm using single projectile in area set out in schedule 14'
            }
          }
        },
        'Controlled Alien Species Regulation': {
          '7': {
            '1': {
              description: 'Possess an aquatic invasive species individual'
            }
          }
        },
        'Freshwater Fish Regulation': {
          '2': {
            A: {
              description: 'Possess live fish without authorization or permit'
            },
            B: {
              description: 'Transport live fish without authorization or permit'
            }
          }
        },
        'Hunting Licensing Regulation': {
          '5': {
            '1': {
              description: 'Hunt big game without hunting licence and species licence'
            },
            '2': {
              description:
                'Non-resident hunts upland game birds or wolf without hunting licence and uncancelled species licence'
            }
          },
          '7': {
            '1': {
              description: 'Failure to immediately cancel species licence'
            }
          },
          '8': {
            '1': {
              description: 'Issue hunting licence without completed acknowledgement of responsibility form'
            }
          },
          '9': {
            '5': {
              description: 'Fail to notify director of address change'
            }
          },
          '10': {
            '2': {
              description: 'Fail to surrender resident hunter number card as required by regulation'
            }
          },
          '16': {
            '1': {
              'a-f': {
                description: 'Possess more species licence than number specified'
              }
            }
          },
          '25': {
            description: 'Hunt in Fraser Valley without appropriate licenses'
          },
          '27': {
            description: 'Hunt in Fraser Valley without insurance'
          }
        },
        'Hunting Regulation': {
          '7': {
            '2': {
              '2.1': {
                description: 'Hunt, take, kill, mule deer without 4 tines 2.5cm long'
              }
            }
          },
          '8': {
            '1': {
              description: 'Take less than full curl thinhorn ram Region 6'
            }
          },
          '10': {
            description: 'Exceed bag or possession limit as set out in part 1 or 3 or each schedule'
          },
          '11': {
            '1': {
              a: {
                description: 'Exceed provincial bag limit of deer'
              },
              b: {
                description: 'Exceed provincial bag limit of two black bear'
              },
              e: {
                description: 'Exceed provincial bag limit of one mountain sheep'
              },
              f: {
                description: 'Exceed provincial bag limit of 1 other than a-e'
              }
            }
          },
          '12': {
            b: {
              description:
                'Exceeds the possession limit of  3 times the daily bag limit for game birds, excluding migratory game birds'
            }
          },
          '14': {
            '1': {
              description: 'Hunt from 1 hour after sunset to 1 hour before sunrise'
            },
            '2': {
              description: 'Hunt migratory game birds during prohibited hours'
            }
          },
          '15': {
            '1': {
              a: {
                description: 'Leave male organs/head attached on deer, moose, elk,or caribou'
              },
              b: {
                description: 'Leave female organs/head attached on deer, elk, moose,or caribou'
              }
            },
            '2': {
              a: {
                description: 'Fail to leave attached male sex organ of big game'
              },
              b: {
                description:
                  'Fail to leave attached required evidence of gender and species of female elk, moose or deer'
              }
            },
            '3': {
              description: 'Fail to leave attached to carcass identifiable portion of hide',
              a: {
                description: 'Fail to leave attached required evidence of sex and species of male caribou'
              }
            },
            '4': {
              a: {
                description: 'Fail to leave male sex organs attached to hide'
              },
              b: {
                description: 'Leave udder or teats attached to hide'
              }
            },
            '5': {
              a: {
                description: 'Fail to leave attached required evidence of sex of male mountain goat or bison'
              }
            },
            '6': {
              description: 'Game birds - fail to leave one feathered wing attached'
            }
          },
          '16': {
            '1': {
              description: 'Fail to submit species for compulsory inspection within 30 days'
            },
            '3': {
              description: 'Fail to comply with compulsory inspection requirements'
            },
            '5': {
              a: {
                description: 'Fail to report killing to officer within period required'
              }
            },
            '6': {
              description: 'Fail to submit wolf taken in 401-402 within 4 days'
            },
            '2.1': {
              description:
                'Takes or kills a grizzly bear, a mountain goat or a mountina sheep without submitting parts as required',
              D: {
                description: 'Failure to submit prescribed parts for inspection within 30 days'
              }
            },
            '3.2': {
              description: 'Takes or kills an antlered mule (black-tailed) deer without submitting parts as required'
            },
            '3.3': {
              description: 'Fail to comply with compulsory inspection requirements - black bear in region 6'
            }
          },
          '17': {
            '1': {
              a: {
                description: 'Hunts with a rifle using a tracer, incendiary, or explosive bullet'
              },
              b: {
                description: 'Hunt big game with a rifle using a rim-fire cartridge'
              },
              e: {
                description: 'Hunt deer, etc. with shotgun less than 20 gauge'
              },
              k: {
                description: 'Hunt with bow with pull less than 18kg'
              },
              m: {
                description: 'Hunt bear using bait'
              },
              o: {
                description: 'Hunt migratory game birds by use of rifle'
              },
              s: {
                description:
                  'Hunt with a firearm that is designed, altered or intended to be aimed and fired by the action of one hand or that has a barrel less than 305 mm in length.'
              }
            },
            '2': {
              description: 'Possess toxic shot for purpose of hunting'
            }
          },
          '18': {
            '1': {
              b: {
                description: 'Discharge firearm-vehicle drawn by draught animal'
              },
              d: {
                description: 'Continue to hunt after taking daily/seasonal limit'
              },
              g: {
                description: 'Carry a cocked crossbow in or on a vehicle'
              },
              h: {
                description: 'Discharge bow from vehicle'
              },
              j: {
                description: 'Use recorded or electronic calls to hunt wildlife'
              }
            }
          },
          '19': {
            '5': {
              description: 'Hunt in specified park not within open season'
            }
          },
          '24': {
            description: 'Fail to keep antlers and species licence together for inspection'
          },
          '16.1': {
            '1': {
              description:
                'Fail to report or submit parts of the kill of specified animal in select regions/management unit within 30 days'
            },
            '2': {
              description: 'Fail to properly report place, date & sex of kill as required by regulation within 72 hours'
            }
          }
        },
        'Limited Entry Hunting Regulation': {
          '4.4': {
            '2': {
              description: 'Continues to hunt in shared hunt after condition to stop is met'
            },
            '4': {
              description: 'Fail to report kill details to others named in the same LEH Authorization'
            },
            '5': {
              description: 'Hunts moose under shared hunt without up to date information'
            }
          }
        },
        'Motor Vehicle Prohibition Regulations': {
          '2': {
            description: 'Operate motor vehicle in a closed area'
          },
          '3': {
            description: 'Use or operate a motor vehicle for the purpose of hunting in closed area'
          },
          '4': {
            description: 'Operate an ATV or snowmobile  in a closed area described in schedule 3'
          },
          '5': {
            description:
              'Use or operate ATV or snowmobile for the purpose of hunting in closed area as described in schedule 4'
          },
          '6': {
            description:
              'Use or operate ATV or snowmobile for the purpose of hunting in closed area as described in schedule 5'
          },
          '7': {
            description:
              'Use or operate ATV for purpose of hunting in closed area and during periods specified in schedule 6'
          },
          '7.1': {
            description: 'Use or operate snowmobile in closed area and during periods specified in schedule 7'
          }
        },
        'Public Access Prohibition Regulation': {
          '2': {
            '1': {
              description: 'Use or operate a vehicle within management area'
            }
          },
          '7': {
            '1': {
              description: 'Use or operate motor vehicle on closed road'
            }
          },
          '10': {
            a: {
              description: 'Operate vehicle in prohibited area'
            }
          }
        },
        'Permit Regulation': {
          '8': {
            description: 'Fail to observe conditions of permit'
          },
          '16': {
            '4': {
              a: {
                description:
                  'Hunt big game in the presence of a non-resident hunting big game without a guide or person with appropriate permit present'
              },
              c: {
                description: 'Fail to accompany non-resident or non-resident alien while hunting'
              }
            }
          },
          '17': {
            '5': {
              description:
                'Assistant guide while acting as a guide outfitter under a permit fails to comply with act and regulations pertaining to a guide outfitter'
            }
          }
        },
        'Wildlife Act Commercial Activities Regulation': {
          '1.02': {
            a: {
              description: 'Guide without insurance'
            }
          },
          '1.05': {
            '1': {
              b: {
                description: 'Not in the immediate company of person guided'
              }
            },
            '2': {
              description:
                'Guide Outfitter or, with his knowledge, an assistant guide employed by him guides a hunter outside licenced area'
            },
            '3': {
              description: 'Assistant guide guides outside authorized area'
            }
          },
          '1.05.1': {
            '2': {
              description: 'Fail to deliver guide report'
            }
          },
          '2.01': {
            '1': {
              'a-d': {
                description:
                  'Taxidermist, tanner, licenced fur trader, meat cutter or an operator of a cold storage plant fails to immediately record wildlife'
              }
            }
          },
          '2.08': {
            '1': {
              a: {
                description: 'Possess or import bear gall bladders'
              },
              b: {
                description: 'Possess or import bear genitalia separate form carcass or hide'
              }
            },
            '2': {
              description: 'Import or export bear paws that are separate from the carcass or hide'
            },
            '3': {
              c: {
                description: 'Traffic in bear paws that are separate from carcass or hide'
              }
            }
          },
          '2.09': {
            '1': {
              description: 'Traffic  in dead wildlife or parts'
            }
          },
          '3.04': {
            '1': {
              i: {
                description: 'Kill black bear without rifle, shotgun, etc.'
              },
              j: {
                description: 'Trap wolf ,lynx, etc. except by killing or modified trap'
              },
              q: {
                description: 'Trap raccoon with means other than prescribed method'
              }
            }
          },
          '3.05': {
            '1': {
              description: 'Fail to check live trap every 72 hours',
              c: {
                description: 'Registered trapper fails to examine killing trap or snare every 14 days'
              }
            }
          },
          '3.06': {
            description: 'On land, traps with lethal trap less than 200 meters from a dwelling'
          },
          '3.17': {
            '1': {
              description:
                'Trap on private property without a trapping licence or without written permission of property owner'
            }
          },
          '5.02': {
            '2': {
              description: 'Act as transporter without required licence'
            }
          }
        },
        'Wildlife Act General Regulation': {
          '21': {
            '1': {
              b: {
                description: 'Export wildlife or parts or egg without permit'
              }
            }
          },
          '33': {
            '2': {
              description: 'Unlawful possession of dead wildlife'
            }
          },
          '37': {
            description: 'Transport wildlife in province contrary to regulations'
          },
          '55': {
            '2': {
              b: {
                description: 'Guide fails to deliver report'
              }
            }
          },
          '69': {
            description: 'Fail to pay guide royalty'
          },
          '16.01': {
            a: {
              description: 'Fail to comply with condition - hunting licence'
            },
            b: {
              description: 'Fail to comply with condition - species licence'
            },
            c: {
              description: 'Fail to comply with condition - special area'
            },
            d: {
              description: 'Fail to comply with condition - Limited Entry Hunt'
            },
            e: {
              description: 'Fail to comply with condition of an angling licence'
            },
            i: {
              description: 'Fail to comply with condition of guide-outfitter licence'
            },
            j: {
              description: 'Fail to comply with condition of an assistant guide licence'
            },
            l: {
              description: 'Fails to comply with a condition of or an instruction in a trapping licence'
            }
          }
        },
        'Wildlife Management Area Use and Access Regulation': {
          '3': {
            description: 'Enter wildlife management area with dog during prohibited period'
          }
        }
      }
    }
  };

  /**
   * Get the matching legislation description, if any, for the specified legislation path.
   *
   * @param {ILegislationDescriptionPath} legPath
   * @static
   * @returns {string} legislation description or null
   */
  public static getLegislationDescription = function (recordType: string, legislation: Legislation): string {
    if (!recordType || !legislation || !legislation.act || !legislation.section) {
      return null;
    }

    const nonNullPathValues = [recordType, legislation.act];

    if (legislation.regulation) {
      nonNullPathValues.push(legislation.regulation);
    }

    if (legislation.section) {
      nonNullPathValues.push(legislation.section);
    }

    if (legislation.subSection) {
      nonNullPathValues.push(legislation.subSection);
    }

    if (legislation.paragraph) {
      nonNullPathValues.push(legislation.paragraph);
    }

    nonNullPathValues.push('description');

    return this.traverseObject(this.legislationDescriptions, nonNullPathValues);
  };

  /**
   * Recursively descend the object until the end of the paths is reached, at which point return the value of the
   * final path property. If unable to descend through all paths provided, return null.
   *
   * Example:
   *
   * obj = {
   *    a: {
   *      b: {
   *         c: '123'
   *      }
   *    }
   * }
   *
   * traverseObject(obj, ['a', 'b', 'c'])
   * => '123'
   *
   * traverseObject(obj, ['a', 'b'])
   * => { c: '123' }
   *
   * traverseObject(obj, ['a', 'c'])
   * => null
   *
   * @param {object} obj object to traverse
   * @param {string[]} paths properties to descend, in order, through the object.
   * @returns the value found at the end of the path, or null
   */
  public static traverseObject = function (obj: object, paths: string[]) {
    if (!obj || !paths || !paths.length) {
      return null;
    }

    const value = obj[paths[0]];

    // failed to descend using all paths provided
    if (!value) {
      return null;
    }

    // reached end of the paths, return value
    if (paths.length === 1) {
      return value;
    }

    // descend if value is an object
    if (Utils.isObject(value)) {
      paths.splice(0, 1);
      return this.traverseObject(value, paths);
    }

    return null;
  };
}
