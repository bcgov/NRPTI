import { ICodeSet, ICodeGroup } from './constant-interfaces';

/**
 * Demo codes.
 *
 * @export
 * @class DemoCodes
 * @implements {ICodeSet}
 */
export class DemoCodes implements ICodeSet {
  public static readonly BUILD_COMPLETE: ICodeGroup = {
    code: 'COMPLETE',
    param: 'BC',
    text: { long: 'Construction Completed', short: 'Complete' },
    mappedCodes: ['Demo', 'Example', 'Constructed', 'Built', 'Building Finished']
  };

  /**
   * @inheritdoc
   * @memberof DemoCodes
   */
  public getCodeGroups(): ICodeGroup[] {
    return [DemoCodes.BUILD_COMPLETE];
  }
}

export class EpicProjectIds {
  public static readonly lngCanadaId = '588511c4aaecd9001b825604';
  public static readonly coastalGaslinkId = '588510cdaaecd9001b815f84';
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

  public static readonly agencyPicklist = [
    'Agricultural Land Commission',
    'BC Oil and Gas Commission',
    'BC Parks',
    'BC Wildfire Service',
    'Climate Action Secretariat',
    'Conservation Officer Service (COS)',
    'Environmental Assessment Office',
    'Environmental Protection Division',
    'LNG Secretariat',
    'Ministry of Agriculture',
    'Ministry of Energy, Mines and Petroleum Resources',
    'Ministry of Forests, Lands, Natural Resource Operations and Rural Development',
    'Natural Resource Officers (NRO)'
  ];

  public static readonly authorPicklist = ['BC Government', 'Proponent', 'Other'];

  public static readonly outcomeStatusPicklist = ['Closed', 'Open'];

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
    'Fisheries Act (Provincial)': [
      'Aquaculture Regulation',
      'Fisheries Act Regulations'
    ],
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
      'Wildfire Regulation',
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
  public static getAllActs = function(): string[] {
    return Object.keys(this.legislationActsMappedToRegulations).sort();
  };

  /**
   * Returns an array of all supported regulation strings.
   *
   * @static
   * @memberof Picklists
   * @returns {string[]} sorted array of regulations
   */
  public static getAllRegulations = function(): string[] {
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
  public static getLegislationRegulationsMappedToActs = function(): { [key: string]: string[] } {
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
}
