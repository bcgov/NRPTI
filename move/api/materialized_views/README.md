# Details of MongoDB 3.6 workaround

Since MongoDB only allows a single Fulltext Search index per collection, we have implemented a version of materialized views for MongoDB 3.6.  On-demand materialized views are only available in MongoDB 4.2, so this is a workaround until Openshift has a more modern container for use.

![Materialized View Engine](https://raw.github.com/bcgov/NRPTI/master/docs/NRPTI%20Materialized%20Views.svg)
