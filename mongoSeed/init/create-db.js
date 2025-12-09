/**
 * @desc Seed data for initialization of NRPTI Development Database
 * @author LocalNewsTV
 */

print("Mongo Seed Starting...");

const db = new Mongo().getDB("nrpti-dev");
const user = "nrpti-admin";
const pwd = "nrpti-admin";

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
