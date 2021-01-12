# Architecture

The following is the system architecture for NRPTI

![Architecture for NRPTI](https://raw.github.com/bcgov/NRPTI/master/docs/NRPTI-Architecture.svg)

# Materialized Views

Since MongoDB only allows a single Fulltext Search index per collection, we have implemented a version of materialized views for MongoDB 3.6.  On-demand materialized views are only available in MongoDB 4.2, so this is a workaround until Openshift has a more modern container for use.

![Materialized Views](https://raw.github.com/bcgov/NRPTI/master/docs/NRPTI%20Materialized%20Views.svg)


# Data Sources

#### EPIC
EPIC data is source from a public api endpoint.  There is no authorization needed and it is assumed that all data coming from this endpoint has had proper PIA/STRA rules applied, and is considered public.

> **Endpoint**: https://projects.eao.gov.bc.ca/api/public/*

#### NRIS
NRIS is a WebADE secured endpoint, which produces all the Natural Resource Inspectors' reports and documents.  The entirety of this data is considered not-for-public consumption until a business administrator has vetted the information prior to publishing.  As a result, all NRIS based data is not auto-published by design.  Sensitive information includes first, last, and middle names, address information, and DOB.  Both companies and individual type records exist in NRIS data.  We are pulling records only from EPD (Environmental Protection Division)

> **Endpoint**: https://api.nrs.gov.bc.ca/nrisws-api/v1/epdInspections

#### CSV Import
Currently CSV data loads are handled by db-migrate tool - there is yet to be a file upload tool to be built.

##### OCERS
All data formerly in the Natural Resource Compliance and Enforcement Database has been imported via CSV.  OCERS stands for Online Compliance and Enforcement Reporting System.  It's the database housing all the information for the [Legacy Site](https://a100.gov.bc.ca/pub/ocers/searchApproved.do?submitType=menu) . It's supposed to be sanitized and trimmed of any PIA before loading.  The migration task auto-publishes this data as it should have business vetting already completed before loading.  Sensitive information includes first, last, and middle names, address information, DOB, and document(s) related to the record.

> **Use:** db-migrate tool via npm.

#### BCMI Mine Data
Mining detail data is going to be imported from calling the [Legacy Mine EMLI Website](https://mines.empr.gov.bc.ca/api/projects/major) endpoints.  Without supplying credentials to the endpoint, this should only receive data that has already been vetted as publicly consumable.

> **Endpoint**: https://mines.empr.gov.bc.ca/api/projects/major


# File storage
All new documents are stored in the [NRS S3 Compatible Object store](nrs.objectstore.gov.bc.ca).  There are 3 environments for S3, dev, test, and prod.

> **Endpoint**: https://nrs.objectstore.gov.bc.ca/-bucketname-/
> NB: this is going to be deprecated in favour of https://bucketname.nrs.objectstore.gov.bc.ca/ but this method cannot be used until SSL certs are setup in the objectstore hosting environment.

# Record redaction
Redactions in the database are handled by the embedded properties **read** and **write**.  If the user who is requesting data from the API does not have the correct read/write role, the database redacts the sub object, or entire record from the result set.

> Examples:
```
{
  data: 'Viewable by public, and sysadmin',
  read: ['public', 'sysadmin'],
  write: ['sysadmin'],
  thing: {
    data: 'Viewable by sysadmin only',
	read: ['sysadmin'],
	write: ['sysadmin']
  }
}
```

```
{
  data: 'Viewable by sysadmin only',
  read: ['sysadmin'],
  write: ['sysadmin'],
  thing: {
    data: 'Viewable by sysadmin only',
    read ['sysadmin'],
    write: ['sysadmin']
  }
}
```

```
{
  data: 'Viewable by public and sysadmin',
  read: ['public', 'sysadmin'],
  write: ['sysadmin'],
  thing: {
    data: 'Viewable by public, and sysadmin',
	read: ['public', 'sysadmin'],
	write: ['sysadmin']
  }
}
```


# Openshift Environments

#### DEV

```
API --> NRIS (test)
API --> EPIC (prod)
API --> S3 (dev)
```

#### TEST

```
API --> NRIS (prod)
API --> EPIC (prod)
API --> S3 (test)
```

#### PROD

```
API --> NRIS (prod)
API --> EPIC (prod)
API --> S3 (prod)
```

# Tagging a Release

#### TEST
check the releases page (https://github.com/bcgov/NRPTI/releases) to see if there is anything currently in test that hasnt been pushed to production. If there is then you will have to update the commit hash on that tag. The best way to do that is to delete the tag and create a new one pointing to the most recent hash. Make sure you copy the release notes before you delete the tag. If there is no test release yet then you can skip this step.

In this example and the following one upstream referes to this repo (https://github.com/bcgov/NRPTI)
e.g.
```
git tag -d v1.0.8
git push --delete upstream v1.0.8
```

Once there is no test tag, you can create new one with the following commands. you can copy the latest comit hash from here: https://github.com/bcgov/NRPTI/commits/master

e.g.
```
git tag -a v1.0.8 2ae61a317e6c534e782eac2323935ab6a7cee555 -m "Mad Max #3"
git push upstream --tags
```
