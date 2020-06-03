# Architecture

The following is the system architecture for NRPTI

![Architecture for NRPTI](https://raw.github.com/bcgov/NRPTI/master/docs/NRPTI-Architecture.svg)

# Materialized Views

Since MongoDB only allows a single Fulltext Search index per collection, we have implemented a version of materialized views for MongoDB 3.6.  On-demand materialized views are only available in MongoDB 4.2, so this is a workaround until Openshift has a more modern container for use.

![Materialized Views](https://raw.github.com/bcgov/NRPTI/master/docs/NRPTI%20Materialized%20Views.svg)