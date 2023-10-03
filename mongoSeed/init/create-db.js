/**
 * @desc Seed data for initialization of NRPTI Development Database
 * @author LocalNewsTV
 */

const db = new Mongo().getDB('nrpti-dev');

db.createUser({
  user: "nrpti-admin",
  pwd: "nrpti-admin",
  roles: [{
    role: 'readWrite',
    db: 'nrpti-dev',
  }],
});

db.createCollection("audit", {capped: false});
db.createCollection("description_summary_subset", {capped: false});
db.createCollection("location_subset", {capped: false});
db.createCollection("migrations", {capped: false});
db.createCollection("nrpti", {capped: false});
db.createCollection("record_name_subset", {capped: false});
db.createCollection("redacted_record_subset", {capped: false});
