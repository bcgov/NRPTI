# How to complete Migrations in NRPTI #

## Installing db-migrate ##
By default, MongoDB will be running on localhost:27017

Follow [these instructions](https://db-migrate.readthedocs.io/en/latest/Getting%20Started/configuration/) to create a `database.json` file in the api directory.

## Running Migration Commands Locally ## 
Run `npm i db-migrate` to install the db-migrate library

Run the command `db-migrate create <nameOfMigration>` to create the migration file in api/migrations

Run `db-migrate up <nameOfMigration> -e local` to run the individual migration locally. Run `db-migrate down <nameOfMigration> -e local` to tear the down the migration locally.

## Running Migration on Dev or Prod ## 
Migrations are manually run on dev and prod through OpenShift.

Run your migrations locally and on dev before running against prod. Back up prod before running the migrations.

Retrieve OpenShift token and access the NRPTI namespace.

Run `oc get pods -n <nrpti-namespace>` to retrieve namespace pods.

Run `oc port-forward <nameOfMongoDBPod> 5555:27017` to port forward your MongoDB pod to localhost:5555. Tunnel and redirect your database to MongoDB's 27017 default port.

Run the same migration commands but with the env variables `db-migrate up <nameOfMigration> -e dev`

If there is a file in api/migrations and you run db-migrate up it will look in the database first under the migrations determine if `<nameOfMigration>` has run before.