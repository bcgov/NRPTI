#!/bin/bash
set -e

echo "Mongo Seed Starting..."

DB="nrpti-dev"
USER="$MONGO_USERNAME"
PASSWORD="$MONGO_PASSWORD"

echo "Creating User..."
mongo <<EOF
use $DB;
db.createUser({
    user: "$USER",
    pwd: "$PASSWORD",
    roles: [{ role: "readWrite", db: "$DB" }]
});
EOF

echo "Creating Collections..."
mongo <<EOF
use $DB;
db.createCollection("audit", {  capped: false });
db.createCollection("description_summary_subset", {  capped: false });
db.createCollection("location_subset", {  capped: false });
db.createCollection("migrations", {  capped: false });
db.createCollection("nrpti", {  capped: false });
db.createCollection("record_name_subset", {  capped: false });
db.createCollection("redacted_record_subset", {  capped: false });
db.createCollection("acts_regulations_mapping", {  capped: false });
EOF

echo "Mongo Seed Completed."