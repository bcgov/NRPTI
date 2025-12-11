/**
 * @desc Seed data for initialization of NRPTI Development Database
 * @author LocalNewsTV
 */

print("Mongo Seed Starting...");

const db = new Mongo().getDB("nrpti-dev");
const user = process.env.MONGO_USERNAME;
const pwd = process.env.MONGO_USERNAME;

print("Creating User...");

db.createUser({
  user,
  pwd,
  roles: [
    {
      role: "readWrite",
      db: "nrpti-dev"
    },
  ],
});

print("Creating Collections...");

db.createCollection("audit", { capped: false });
db.createCollection("description_summary_subset", { capped: false });
db.createCollection("location_subset", { capped: false });
db.createCollection("migrations", { capped: false });
db.createCollection("nrpti", { capped: false });
db.createCollection("record_name_subset", { capped: false });
db.createCollection("redacted_record_subset", { capped: false });
db.createCollection("acts_regulations_mapping", { capped: false });

print("Creating documents...");
try {
  db.acts_regulations_mapping.insert({
    _schemaName: "ActsRegulationsMapping",
    actCode: "ACT_0",
    actName: "Environmental Management Act",
    regulations: [
      "Administrative Penalties (Environmental Management Act) Regulation",
      "Agricultural Waste Control Regulation",
      "Antifreeze Regulation",
      "Antisapstain Chemical Waste Control Regulation",
      "Asphalt Plant Regulation",
      "Cleaner Gasoline Regulation",
      "Code of Practice for Industrial Non-Hazardous Waste Landfills Incidental to the Wood Processing Industry",
      "Code of Practice for Soil Amendments",
      "Code of Practice for the Concrete and Concrete Products Industry",
      "Code of Practice for the Slaughter and Poultry Processing Industries",
      "Conservation Officer Service Authority Regulation",
      "Contaminated Sites Regulation",
      "Environmental Appeal Board Procedure Regulation",
      "Environmental Data Quality Assurance Regulation",
      "Environmental Impact Assessment Regulation",
      "Gasoline Vapour Control Regulation",
      "Hazardous Waste Regulation",
      "Land-based Finfish Waste Control Regulation",
      "Landfill Gas Management Regulation",
      "Municipal Wastewater Regulation",
      "Mushroom Compost Facilities Regulation",
      "Oil and Gas Waste Regulation",
      "Open Burning Smoke Control Regulation",
      "Organic Matter Recycling Regulation",
      "Ozone Depleting Substances and Other Halocarbons Regulation",
      "Permit Fees Regulation",
      "Petroleum Storage and Distribution Facilities Storm Water Regulation",
      "Placer Mining Waste Control Regulation",
      "Public Notification Regulation",
      "Pulp Mill and Pulp and Paper Mill Liquid Effluent Control Regulation",
      "Recycling Regulation",
      "Solid Fuel Burning Domestic Appliance Regulation",
      "Spill Cost Recovery Regulation",
      "Spill Reporting Regulation",
      "Storage of Recyclable Material Regulation",
      "Vehicle Dismantling and Recycling Industry Environmental Planning Regulation",
      "Waste Discharge Regulation",
      "Wood Residue Burner and Incinerator Regulation",
    ],
    read: ["sysadmin"],
    write: ["sysadmin"],
    dateAdded: new Date(),
    dateUpdated: null,
    addedBy: "",
    updatedBy: "",
  });

  db.acts_regulations_mapping.insert({
    _schemaName: "ActsRegulationsMapping",
    actCode: "ACT_1",
    actName: "Forest Act",
    regulations: [
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
    read: ["sysadmin"],
    write: ["sysadmin"],
    dateAdded: new Date(),
    dateUpdated: null,
    addedBy: "",
    updatedBy: "",
  });

  db.acts_regulations_mapping.insert({
    _schemaName: "ActsRegulationsMapping",
    actCode: "ACT_2",
    actName: "Energy Resource Activities Act",
    regulations: [
      'Administrative Penalties Regulation',
      'Consultation and Notification Regulation',
      'Direction No. 1 to the Oil and Gas Commission',
      'Drilling and Production Regulation',
      'Emergency Management Regulation',
      'Environmental Protection and Management Regulation',
      'Fee, Levy and Security Regulation',
      'Geophysical Exploration Regulation',
      'Liquefied Natural Gas Facility Regulation',
      'Energy Resource Activities Act General Regulation',
      'Oil and Gas Road Regulation',
      'Pipeline Crossings Regulation',
      'Pipeline Regulation',
      'Service Regulation'
    ],
    read: ["sysadmin"],
    write: ["sysadmin"],
    dateAdded: new Date(),
    dateUpdated: null,
    addedBy: "",
    updatedBy: "",
  });
} catch (err) {
  print("Mongo Seed Docker Compose Init. Error: " + err);
}