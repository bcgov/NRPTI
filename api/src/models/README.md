# NRPTI Data Models
This is a collection of documentation of all of the data models in NRPTI and the sites that it serves (LNG, NRCED, and BCMI). The general data models are stored in the master folder and the site specific data models are stored in their respective folders. Below are a list of the site wide data models that can be found in the [master](https://github.com/bcgov/NRPTI/tree/master/api/src/models/master) directory.
## MineBCMI
Mines are the main data object for BCMI and pull data from Core.
|Field|Type|Description|
|-----|----|-----------|
|_schemaName|String|Defines the type of object, and is used to group them together|
|_sourceRefId|ObjectId|Reference to a data object in Core that we pull the rest of the fields from|
|read|[String]|holds the user rolls that are able to view this data|
|write|[String]|holds the user rolls that are able to view this data|
|name|String|Name of the mine|
|permitNumber|[String]|Reference to the mine permit|
|status|String|Most recent mine status|
|type|String|Type of mine|
|commodities|String| List of the commodities the mine produces|
|tailingsImpoundments|Number|The number of tailings impoundments associated with this mine|
|region|String|The general region this mine is located|
|location|GeoJSON|The latitude and longitude location of this mine (stored as a point)|
|operator|String|The full name of the mine operator|
|owner|String|The full name of the mine owner|
|summary|String|--|
|description|String|Reason for the administrative action|
|links|[String]|Any external links associated with this mine|
|dateAdded|Date|Date the mine was created for BCMI|
|dateUpdated|Date|The last time someone updated this mine|
|datePublished|Date|The date this mine was published to be visible to the public|
|addedBy|String|the user id of the person who added this mine|
|updatedBy|String|the user id of the person who last updated this mine|
|publishedBy|String|the user id of the person who published this mine|
|sourceDateAdded|Date|the creation date as stored in Core|
|sourceDateUpdated|Date|the date last updated as stored in core|
|sourceSystemRef|String|the reference to the source system ( default 'core' )|

## Certificate
|Field|Type|Description|
|-----|----|-----------|
|_schemaName|String|Defines the type of object, and is used to group them together|
|_epicProjectId|ObjectId|Reference to the EPIC object in EPIC that we pull the rest of the fields from|
|_flavourRecords|[ObjectId]|Array of ObjectIds referencing the sub record, different from the master|
|recordName|String|Public-facing name of the record|
|recordType|String|Type of record|
|recordSubtype|String|Subtype of the record|
|dateIssued|Date|Date that the certificate was issued|
|issuingAgency|String|Internal code for the Ministry or Agency that issued the certificate|
|documents|[ObjectId]|Array of documents referencing the certificate|
|projectName|String|Name of the project|
|dateAdded|Date|Date the record was created
|dateUpdated|Date|The last time someone updated this record|
|addedBy|String|the user id of the person who added this record|
|updatedBy|String|the user id of the person who last updated this record|
|publishedBy|String|the user id of the person who published this record|
|sourceDateAdded|Date|the creation date as stored in the source|
|sourceDateUpdated|Date|the date last updated as stored in the source|
|sourceSystemRef|String|the reference to the source system|
|isLngPublished|Boolean|Determines if the record is published to LNG|
|isNrcedPublished|Boolean|Determines if the record is published to NRCED|

## AdministrativePenalty
|Field|Type|Description|
|-----|----|-----------|
|_schemaName|String|Defines the type of object, and is used to group them together|
|_flavourRecords|[ObjectId]|Array of ObjectIds referencing the sub record, different from the master|
|read|[String]|holds the user rolls that are able to view this data|
|write|[String]|holds the user rolls that are able to view this data|
|recordName|String|Public-facing name of the record|
|recordType|String|Type of record|
|dateIssued|Date|Date that the administrative penalty was issued|
|legislation|[Object]|Object of items that further categorize the administrative penalty|
|issuedTo|Object|Contains `read` and `write` permissions, as well as personal, identifying information of the individual/entity.
|location|GeoJSON|The latitude and longitude location of this mine (stored as a point)|
|penalties|[Object]|Array of object describing the penalty and the fine|
|dateAdded|Date|Date the record was created
|dateUpdated|Date|The last time someone updated this record|
|addedBy|String|the user id of the person who added this record|
|updatedBy|String|the user id of the person who last updated this record|
|sourceDateAdded|Date|the creation date as stored in the source|
|sourceDateUpdated|Date|the date last updated as stored in the source|
|sourceSystemRef|String|the reference to the source system|
|documents|[ObjectId]|Array of documents referencing the administrative penalty|
|isLngPublished|Boolean|Determines if the record is published to LNG|
|isNrcedPublished|Boolean|Determines if the record is published to NRCED|
|issuingAgency|String|Internal code for the Ministry or Agency that issued the administrative penalty|
|__v|Int|Version number of the record|

## AgreementLNG
|Field|Type|Description|
|-----|----|-----------|
|_schemaName|String|Defines the type of object, and is used to group them together|
|_epicProjectId|ObjectId|Reference to the EPIC object in EPIC that we pull the rest of the fields from|
|read|[String]|holds the user rolls that are able to view this data|
|write|[String]|holds the user rolls that are able to view this data|
|recordName|String|Public-facing name of the record|
|recordType|String|Type of record|
|dateIssued|Date|Date that the agreement was issued|
|nationName|String|Name of indigenous group nation|
|projectName|String|Name of the project|
|documents|[ObjectId]|Array of documents referencing the agreement|
|description|String|Reason for the agreement|
|dateAdded|Date|Date the record was created
|dateUpdated|Date|The last time someone updated this record|
|datePublished|Date|The date this record was published to be visible to the public|
|addedBy|String|the user id of the person who added this record|
|updatedBy|String|the user id of the person who last updated this record|
|publishedBy|String|the user id of the person who published this record|
|sourceDateAdded|Date|the creation date as stored in the source|
|sourceDateUpdated|Date|the date last updated as stored in the source|
|sourceSystemRef|String|the reference to the source system|
|_master|ObjectId|the Object Id of the master record

## InspectionLNG
|Field|Type|Description|
|-----|----|-----------|
|_schemaName|String|Defines the type of object, and is used to group them together|
|_epicProjectId|ObjectId|Reference to the EPIC object in EPIC that we pull the rest of the fields from|
|read|[String]|holds the user rolls that are able to view this data|
|write|[String]|holds the user rolls that are able to view this data|
|recordName|String|Public-facing name of the record|
|recordType|String|Type of record|
|dateIssued|Date|Date that the inspection was issued|
|issuingAgency|String|Internal code for the Ministry or Agency that issued the inspection|
|author|String|Public-facing name of the Ministry or Agency that issued the inspection| 
|projectName|String|Name of the project|
|documents|[ObjectId]|Array of documents referencing the inspection|
|description|String|Reason for the inspection|
|dateAdded|Date|Date the record was created
|dateUpdated|Date|The last time someone updated this record|
|datePublished|Date|The date this record was published to be visible to the public|
|addedBy|String|the user id of the person who added this record|
|updatedBy|String|the user id of the person who last updated this record|
|publishedBy|String|the user id of the person who published this record|
|sourceDateAdded|Date|the creation date as stored in the source|
|sourceDateUpdated|Date|the date last updated as stored in the source|
|sourceSystemRef|String|the reference to the source system|
|_master|ObjectId|the Object Id of the master record

## Ticket
|Field|Type|Description|
|-----|----|-----------|
|_schemaName|String|Defines the type of object, and is used to group them together|
|_flavourRecords|[ObjectId]|Array of ObjectIds referencing the sub record, different from the master|
|read|[String]|holds the user rolls that are able to view this data|
|write|[String]|holds the user rolls that are able to view this data|
|recordName|String|Public-facing name of the record|
|recordType|String|Type of record|
|dateIssued|Date|Date that the ticket was issued|
|legislation|[Object]|Object of items that further categorize the ticket|
|issuedTo|Object|Contains `read` and `write` permissions, as well as personal, identifying information of the individual/entity.
|location|GeoJSON|The latitude and longitude location of this mine (stored as a point)|
|penalties|[Object]|Array of object describing the penalty and the fine|
|dateAdded|Date|Date the record was created
|dateUpdated|Date|The last time someone updated this record|
|addedBy|String|the user id of the person who added this record|
|updatedBy|String|the user id of the person who last updated this record|
|sourceDateAdded|Date|the creation date as stored in the source|
|sourceDateUpdated|Date|the date last updated as stored in the source|
|sourceSystemRef|String|the reference to the source system|
|documents|[ObjectId]|Array of documents referencing the ticket|
|isLngPublished|Boolean|Determines if the record is published to LNG|
|isNrcedPublished|Boolean|Determines if the record is published to NRCED|
|issuingAgency|String|Internal code for the Ministry or Agency that issued the ticket|

## RestorativeJustice
|Field|Type|Description|
|-----|----|-----------|
|_schemaName|String|Defines the type of object, and is used to group them together|
|_flavourRecords|[ObjectId]|Array of ObjectIds referencing the sub record, different from the master|
|read|[String]|holds the user rolls that are able to view this data|
|write|[String]|holds the user rolls that are able to view this data|
|recordName|String|Public-facing name of the record|
|recordType|String|Type of record|
|dateIssued|Date|Date that the restorative justice was issued|
|legislation|[Object]|Object of items that further categorize the restorative justice|
|issuedTo|Object|Contains `read` and `write` permissions, as well as personal, identifying information of the individual/entity.
|location|GeoJSON|The latitude and longitude location of this mine (stored as a point)|
|penalties|[Object]|Array of object describing the penalty and the fine|
|dateAdded|Date|Date the record was created
|dateUpdated|Date|The last time someone updated this record|
|addedBy|String|the user id of the person who added this record|
|updatedBy|String|the user id of the person who last updated this record|
|sourceDateAdded|Date|the creation date as stored in the source|
|sourceDateUpdated|Date|the date last updated as stored in the source|
|sourceSystemRef|String|the reference to the source system|
|documents|[ObjectId]|Array of documents referencing the restorative justice|
|isLngPublished|Boolean|Determines if the record is published to LNG|
|isNrcedPublished|Boolean|Determines if the record is published to NRCED|
|issuingAgency|String|Internal code for the Ministry or Agency that issued the restorative justice|

## AdministrativeSanction
|Field|Type|Description|
|-----|----|-----------|
|_schemaName|String|Defines the type of object, and is used to group them together|
|_flavourRecords|[ObjectId]|Array of ObjectIds referencing the sub record, different from the master|
|read|[String]|holds the user rolls that are able to view this data|
|write|[String]|holds the user rolls that are able to view this data|
|recordName|String|Public-facing name of the record|
|recordType|String|Type of record|
|dateIssued|Date|Date that the administrative sanction was issued|
|legislation|[Object]|Object of items that further categorize the administrative sanction|
|issuedTo|Object|Contains `read` and `write` permissions, as well as personal, identifying information of the individual/entity.
|location|GeoJSON|The latitude and longitude location of this mine (stored as a point)|
|penalties|[Object]|Array of object describing the penalty and the fine|
|dateAdded|Date|Date the record was created
|dateUpdated|Date|The last time someone updated this record|
|addedBy|String|the user id of the person who added this record|
|updatedBy|String|the user id of the person who last updated this record|
|sourceDateAdded|Date|the creation date as stored in the source|
|sourceDateUpdated|Date|the date last updated as stored in the source|
|sourceSystemRef|String|the reference to the source system|
|documents|[ObjectId]|Array of documents referencing the administrative sanction|
|isLngPublished|Boolean|Determines if the record is published to LNG|
|isNrcedPublished|Boolean|Determines if the record is published to NRCED|
|issuingAgency|String|Internal code for the Ministry or Agency that issued the administrative sanction|

## ConstructionPlanLNG
|Field|Type|Description|
|-----|----|-----------|

|_schemaName|String|Defines the type of object, and is used to group them together|
|_epicProjectId|ObjectId|Reference to the EPIC object in EPIC that we pull the rest of the fields from|
|read|[String]|holds the user rolls that are able to view this data|
|write|[String]|holds the user rolls that are able to view this data|
|recordName|String|Public-facing name of the record|
|recordType|String|Type of record|
|dateIssued|Date|Date that the construction plan was issued|
|issuingAgency|String|Internal code for the Ministry or Agency that issued the construction plan|
|projectName|String|Name of the project|
|documents|[ObjectId]|Array of documents referencing the construction plan|
relatedPhase
|description|String|Reason for the construction plan|
|dateAdded|Date|Date the record was created
|dateUpdated|Date|The last time someone updated this record|
|datePublished|Date|The date this record was published to be visible to the public|
|addedBy|String|the user id of the person who added this record|
|updatedBy|String|the user id of the person who last updated this record|
|publishedBy|String|the user id of the person who published this record|
|sourceDateAdded|Date|the creation date as stored in the source|
|sourceDateUpdated|Date|the date last updated as stored in the source|
|sourceSystemRef|String|the reference to the source system|
|_master|ObjectId|the Object Id of the master record

## CertificateLNG
|Field|Type|Description|
|-----|----|-----------|
|_schemaName|String|Defines the type of object, and is used to group them together|
|_epicProjectId|ObjectId|Reference to the EPIC object in EPIC that we pull the rest of the fields from|
|read|[String]|holds the user rolls that are able to view this data|
|write|[String]|holds the user rolls that are able to view this data|
|recordName|String|Public-facing name of the record|
|recordType|String|Type of record|
|recordSubtype|String|Subtype of the record|
|dateIssued|Date|Date that the certificate was issued|
|issuingAgency|String|Internal code for the Ministry or Agency that issued the certificate|
|projectName|String|Name of the project|
|documents|[ObjectId]|Array of documents referencing the certificate|
|description|String|Reason for the certificate|
|dateAdded|Date|Date the record was created
|dateUpdated|Date|The last time someone updated this record|
|datePublished|Date|The date this record was published to be visible to the public|
|addedBy|String|the user id of the person who added this record|
|updatedBy|String|the user id of the person who last updated this record|
|publishedBy|String|the user id of the person who published this record|
|sourceDateAdded|Date|the creation date as stored in the source|
|sourceDateUpdated|Date|the date last updated as stored in the source|
|sourceSystemRef|String|the reference to the source system|
|_master|ObjectId|the Object Id of the master record

## ManagementPlan
|Field|Type|Description|
|-----|----|-----------|
|_schemaName|String|Defines the type of object, and is used to group them together|
|_epicProjectId|ObjectId|Reference to the EPIC object in EPIC that we pull the rest of the fields from|
|_flavourRecords|[ObjectId]|Array of ObjectIds referencing the sub record, different from the master|
|read|[String]|holds the user rolls that are able to view this data|
|write|[String]|holds the user rolls that are able to view this data|
|recordName|String|Public-facing name of the record|
|recordType|String|Type of record|
|dateIssued|Date|Date that the management plan was issued|
|issuingAgency|String|Internal code for the Ministry or Agency that issued the management plan|
|projectName|String|Name of the project|
|documents|[ObjectId]|Array of documents referencing the management plan|
|dateAdded|Date|Date the record was created
|dateUpdated|Date|The last time someone updated this record|
|addedBy|String|the user id of the person who added this record|
|updatedBy|String|the user id of the person who last updated this record|
|publishedBy|String|the user id of the person who published this record|
|sourceDateAdded|Date|the creation date as stored in the source|
|sourceDateUpdated|Date|the date last updated as stored in the source|
|sourceSystemRef|String|the reference to the source system|
|isLngPublished|Boolean|Determines if the record is published to LNG|
|isNrcedPublished|Boolean|Determines if the record is published to NRCED|

## CourtConvictionNRCED
|Field|Type|Description|
|-----|----|-----------|
|_schemaName|String|Defines the type of object, and is used to group them together|
|read|[String]|holds the user rolls that are able to view this data|
|write|[String]|holds the user rolls that are able to view this data|
|recordName|String|Public-facing name of the record|
|recordType|String|Type of record|
|dateIssued|Date|Date that the court conviction was issued|
|legislation|[Object]|Object of items that further categorize the court conviction|
|issuedTo|Object|Contains `read` and `write` permissions, as well as personal, identifying information of the individual/entity.
|location|GeoJSON|The latitude and longitude location of this mine (stored as a point)|
|penalties|[Object]|Array of object describing the penalty and the fine|
|summary|String|--|
|dateAdded|Date|Date the record was created
|dateUpdated|Date|The last time someone updated this record|
|datePublished|Date|The date this record was published to be visible to the public|
|addedBy|String|the user id of the person who added this record|
|updatedBy|String|the user id of the person who last updated this record|
|publishedBy|String|the user id of the person who published this record|
|sourceDateAdded|Date|the creation date as stored in the source|
|sourceDateUpdated|Date|the date last updated as stored in the source|
|sourceSystemRef|String|the reference to the source system|
|_master|ObjectId|the Object Id of the master record
|issuingAgency|String|Internal code for the Ministry or Agency that issued the court conviction|
unlistedMine
unlistedMineType

## SelfReport
|Field|Type|Description|
|-----|----|-----------|
|_schemaName|String|Defines the type of object, and is used to group them together|
|_epicProjectId|ObjectId|Reference to the EPIC object in EPIC that we pull the rest of the fields from|
|_flavourRecords|[ObjectId]|Array of ObjectIds referencing the sub record, different from the master|
|read|[String]|holds the user rolls that are able to view this data|
|write|[String]|holds the user rolls that are able to view this data|
|recordName|String|Public-facing name of the record|
|recordType|String|Type of record|
|dateIssued|Date|Date that the self report was issued|
|issuingAgency|String|Internal code for the Ministry or Agency that issued the self report|
|documents|[ObjectId]|Array of documents referencing the self report|
|author|String|Public-facing name of the Ministry or Agency that issued the self report| 
|projectName|String|Name of the project|
|dateAdded|Date|Date the record was created
|dateUpdated|Date|The last time someone updated this record|
|addedBy|String|the user id of the person who added this record|
|updatedBy|String|the user id of the person who last updated this record|
|publishedBy|String|the user id of the person who published this record|
|sourceDateAdded|Date|the creation date as stored in the source|
|sourceDateUpdated|Date|the date last updated as stored in the source|
|sourceSystemRef|String|the reference to the source system|
|isLngPublished|Boolean|Determines if the record is published to LNG|
|isNrcedPublished|Boolean|Determines if the record is published to NRCED|

## ManagementPlanLNG
|Field|Type|Description|
|-----|----|-----------|
|_schemaName|String|Defines the type of object, and is used to group them together|
|_epicProjectId|ObjectId|Reference to the EPIC object in EPIC that we pull the rest of the fields from|
|read|[String]|holds the user rolls that are able to view this data|
|write|[String]|holds the user rolls that are able to view this data|
|recordName|String|Public-facing name of the record|
|recordType|String|Type of record|
|dateIssued|Date|Date that the management plan was issued|
|issuingAgency|String|Internal code for the Ministry or Agency that issued the management plan|
|projectName|String|Name of the project|
|documents|[ObjectId]|Array of documents referencing the management plan|
relatedPhase
|description|String|Reason for the management plan|
|dateAdded|Date|Date the record was created
|dateUpdated|Date|The last time someone updated this record|
|datePublished|Date|The date this record was published to be visible to the public|
|addedBy|String|the user id of the person who added this record|
|updatedBy|String|the user id of the person who last updated this record|
|publishedBy|String|the user id of the person who published this record|
|sourceDateAdded|Date|the creation date as stored in the source|
|sourceDateUpdated|Date|the date last updated as stored in the source|
|sourceSystemRef|String|the reference to the source system|
|_master|ObjectId|the Object Id of the master record

## ActivityLNG
|Field|Type|Description|
|-----|----|-----------|
|_schemaName|String|Defines the type of object, and is used to group them together|
|_epicProjectId|ObjectId|Reference to the EPIC object in EPIC that we pull the rest of the fields from|
|read|[String]|holds the user rolls that are able to view this data|
|write|[String]|holds the user rolls that are able to view this data|
type
title
|url|String|URL to the document in the S3 bucket|
|||--|--|description|String|Reason for the activity|
|projectName|String|Name of the project|
date

## Inspection
|Field|Type|Description|
|-----|----|-----------|
|_schemaName|String|Defines the type of object, and is used to group them together|
|_epicProjectId|ObjectId|Reference to the EPIC object in EPIC that we pull the rest of the fields from|
|_flavourRecords|[ObjectId]|Array of ObjectIds referencing the sub record, different from the master|
|read|[String]|holds the user rolls that are able to view this data|
|write|[String]|holds the user rolls that are able to view this data|
|recordName|String|Public-facing name of the record|
|recordType|String|Type of record|
|dateIssued|Date|Date that the inspection was issued|
|issuingAgency|String|Internal code for the Ministry or Agency that issued the inspection|
|documents|[ObjectId]|Array of documents referencing the inspection|
|author|String|Public-facing name of the Ministry or Agency that issued the inspection| 
|projectName|String|Name of the project|
|dateAdded|Date|Date the record was created
|dateUpdated|Date|The last time someone updated this record|
|addedBy|String|the user id of the person who added this record|
|updatedBy|String|the user id of the person who last updated this record|
|sourceDateAdded|Date|the creation date as stored in the source|
|sourceDateUpdated|Date|the date last updated as stored in the source|
|sourceSystemRef|String|the reference to the source system|
|isLngPublished|Boolean|Determines if the record is published to LNG|
|isNrcedPublished|Boolean|Determines if the record is published to NRCED|

## PermitLNG
|Field|Type|Description|
|-----|----|-----------|
|_schemaName|String|Defines the type of object, and is used to group them together|
|_epicProjectId|ObjectId|Reference to the EPIC object in EPIC that we pull the rest of the fields from|
|read|[String]|holds the user rolls that are able to view this data|
|write|[String]|holds the user rolls that are able to view this data|
|recordName|String|Public-facing name of the record|
|recordType|String|Type of record|
|recordSubtype|String|Subtype of the record|
|dateIssued|Date|Date that the permit was issued|
|issuingAgency|String|Internal code for the Ministry or Agency that issued the permit|
|projectName|String|Name of the project|
|documents|[ObjectId]|Array of documents referencing the permit|
|description|String|Reason for the permit|
|dateAdded|Date|Date the record was created
|dateUpdated|Date|The last time someone updated this record|
|datePublished|Date|The date this record was published to be visible to the public|
|addedBy|String|the user id of the person who added this record|
|updatedBy|String|the user id of the person who last updated this record|
|publishedBy|String|the user id of the person who published this record|
|sourceDateAdded|Date|the creation date as stored in the source|
|sourceDateUpdated|Date|the date last updated as stored in the source|
|sourceSystemRef|String|the reference to the source system|
|_master|ObjectId|the Object Id of the master record

## AdministrativePenaltyNRCED
|Field|Type|Description|
|-----|----|-----------|
|_schemaName|String|Defines the type of object, and is used to group them together|
|read|[String]|holds the user rolls that are able to view this data|
|write|[String]|holds the user rolls that are able to view this data|
|recordName|String|Public-facing name of the record|
|recordType|String|Type of record|
|dateIssued|Date|Date that the administrative penalty was issued|
|legislation|[Object]|Object of items that further categorize the administrative penalty|
|issuedTo|Object|Contains `read` and `write` permissions, as well as personal, identifying information of the individual/entity.
|location|GeoJSON|The latitude and longitude location of this mine (stored as a point)|
|penalties|[Object]|Array of object describing the penalty and the fine|
|summary|String|--|
|dateAdded|Date|Date the record was created
|dateUpdated|Date|The last time someone updated this record|
|datePublished|Date|The date this record was published to be visible to the public|
|addedBy|String|the user id of the person who added this record|
|updatedBy|String|the user id of the person who last updated this record|
|publishedBy|String|the user id of the person who published this record|
|sourceDateAdded|Date|the creation date as stored in the source|
|sourceDateUpdated|Date|the date last updated as stored in the source|
|sourceSystemRef|String|the reference to the source system|
|_master|ObjectId|the Object Id of the master record
|issuingAgency|String|Internal code for the Ministry or Agency that issued the administrative penalty|
unlistedMine
unlistedMineType
|__v|Int|Version number of the record|
|author|String|Public-facing name of the Ministry or Agency that issued the administrative penalty| 
centroid
|documents|[ObjectId]|Array of documents referencing the administrative action|
|projectName|String|Name of the project|

## Order
|Field|Type|Description|
|-----|----|-----------|
|_schemaName|String|Defines the type of object, and is used to group them together|
|_epicProjectId|ObjectId|Reference to the EPIC object in EPIC that we pull the rest of the fields from|
|_flavourRecords|[ObjectId]|Array of ObjectIds referencing the sub record, different from the master|
|read|[String]|holds the user rolls that are able to view this data|
|write|[String]|holds the user rolls that are able to view this data|
|recordName|String|Public-facing name of the record|
|recordType|String|Type of record|
|recordSubtype|String|Subtype of the record|
|dateIssued|Date|Date that the order was issued|
|issuingAgency|String|Internal code for the Ministry or Agency that issued the order|
|documents|[ObjectId]|Array of documents referencing the order|
|author|String|Public-facing name of the Ministry or Agency that issued the order| 
|projectName|String|Name of the project|
|dateAdded|Date|Date the record was created
|dateUpdated|Date|The last time someone updated this record|
|addedBy|String|the user id of the person who added this record|
|updatedBy|String|the user id of the person who last updated this record|
|sourceDateAdded|Date|the creation date as stored in the source|
|sourceDateUpdated|Date|the date last updated as stored in the source|
|sourceSystemRef|String|the reference to the source system|
|isLngPublished|Boolean|Determines if the record is published to LNG|
|isNrcedPublished|Boolean|Determines if the record is published to NRCED|

## WarningLNG
|Field|Type|Description|
|-----|----|-----------|

|_schemaName|String|Defines the type of object, and is used to group them together|
|_epicProjectId|ObjectId|Reference to the EPIC object in EPIC that we pull the rest of the fields from|
|read|[String]|holds the user rolls that are able to view this data|
|write|[String]|holds the user rolls that are able to view this data|
|recordName|String|Public-facing name of the record|
|recordType|String|Type of record|
|recordSubtype|String|Subtype of the record|
|dateIssued|Date|Date that the warning was issued|
|issuingAgency|String|Internal code for the Ministry or Agency that issued the warning|
|author|String|Public-facing name of the Ministry or Agency that issued the warning| 
|projectName|String|Name of the project|
|documents|[ObjectId]|Array of documents referencing the warning|
|description|String|Reason for the warning|
|dateAdded|Date|Date the record was created
|dateUpdated|Date|The last time someone updated this record|
|datePublished|Date|The date this record was published to be visible to the public|
|addedBy|String|the user id of the person who added this record|
|updatedBy|String|the user id of the person who last updated this record|
|publishedBy|String|the user id of the person who published this record|
|sourceDateAdded|Date|the creation date as stored in the source|
|sourceDateUpdated|Date|the date last updated as stored in the source|
|sourceSystemRef|String|the reference to the source system|
|_master|ObjectId|the Object Id of the master record
|__v|Int|Version number of the record|

## InspectionNRCED
|Field|Type|Description|
|-----|----|-----------|
|legislation|[Object]|Object of items that further categorize the inspection|
|issuedTo|Object|Contains `read` and `write` permissions, as well as personal, identifying information of the individual/entity.
|_schemaName|String|Defines the type of object, and is used to group them together|
|_epicProjectId|ObjectId|Reference to the EPIC object in EPIC that we pull the rest of the fields from|
|_sourceRefId|ObjectId|Reference to a data object in Core that we pull the rest of the fields from|
_sourceRefNrisId
_epicMilestoneId
|read|[String]|holds the user rolls that are able to view this data|
|write|[String]|holds the user rolls that are able to view this data|
|recordName|String|Public-facing name of the record|
|recordType|String|Type of record|
|dateIssued|Date|Date that the inspection was issued|
|issuingAgency|String|Internal code for the Ministry or Agency that issued the inspection|
|author|String|Public-facing name of the Ministry or Agency that issued the inspection| 
|projectName|String|Name of the project|
|location|GeoJSON|The latitude and longitude location of this mine (stored as a point)|
centroid
outcomeStatus
outcomeDescription
|documents|[ObjectId]|Array of documents referencing the inspection|
|summary|String|--|
|dateAdded|Date|Date the record was created
|dateUpdated|Date|The last time someone updated this record|
|datePublished|Date|The date this record was published to be visible to the public|
|addedBy|String|the user id of the person who added this record|
|updatedBy|String|the user id of the person who last updated this record|
|publishedBy|String|the user id of the person who published this record|
|sourceDateAdded|Date|the creation date as stored in the source|
|sourceDateUpdated|Date|the date last updated as stored in the source|
|sourceSystemRef|String|the reference to the source system|
|__v|Int|Version number of the record|
|_master|ObjectId|the Object Id of the master record

## CourtConviction
|Field|Type|Description|
|-----|----|-----------|
|_schemaName|String|Defines the type of object, and is used to group them together|
|_flavourRecords|[ObjectId]|Array of ObjectIds referencing the sub record, different from the master|
|read|[String]|holds the user rolls that are able to view this data|
|write|[String]|holds the user rolls that are able to view this data|
|recordName|String|Public-facing name of the record|
|recordType|String|Type of record|
|dateIssued|Date|Date that the court conviction was issued|
|legislation|[Object]|Object of items that further categorize the court conviction|
|issuedTo|Object|Contains `read` and `write` permissions, as well as personal, identifying information of the individual/entity.
|location|GeoJSON|The latitude and longitude location of this mine (stored as a point)|
|penalties|[Object]|Array of object describing the penalty and the fine|
|dateAdded|Date|Date the record was created
|dateUpdated|Date|The last time someone updated this record|
|addedBy|String|the user id of the person who added this record|
|updatedBy|String|the user id of the person who last updated this record|
|sourceDateAdded|Date|the creation date as stored in the source|
|sourceDateUpdated|Date|the date last updated as stored in the source|
|sourceSystemRef|String|the reference to the source system|
|documents|[ObjectId]|Array of documents referencing the court conviction|
|isLngPublished|Boolean|Determines if the record is published to LNG|
|isNrcedPublished|Boolean|Determines if the record is published to NRCED|
|issuingAgency|String|Internal code for the Ministry or Agency that issued the court conviction|

## Agreement
|Field|Type|Description|
|-----|----|-----------|
|_schemaName|String|Defines the type of object, and is used to group them together|
|_epicProjectId|ObjectId|Reference to the EPIC object in EPIC that we pull the rest of the fields from|
|_flavourRecords|[ObjectId]|Array of ObjectIds referencing the sub record, different from the master|
|read|[String]|holds the user rolls that are able to view this data|
|write|[String]|holds the user rolls that are able to view this data|
|recordName|String|Public-facing name of the record|
|recordType|String|Type of record|
|dateIssued|Date|Date that the agreement was issued|
|nationName|String|Name of indigenous group nation|
|projectName|String|Name of the project|
|documents|[ObjectId]|Array of documents referencing the agreement|
|dateAdded|Date|Date the record was created
|dateUpdated|Date|The last time someone updated this record|
|addedBy|String|the user id of the person who added this record|
|updatedBy|String|the user id of the person who last updated this record|
|publishedBy|String|the user id of the person who published this record|
|sourceDateAdded|Date|the creation date as stored in the source|
|sourceDateUpdated|Date|the date last updated as stored in the source|
|sourceSystemRef|String|the reference to the source system|
|isLngPublished|Boolean|Determines if the record is published to LNG|
|isNrcedPublished|Boolean|Determines if the record is published to NRCED|

## Document
|Field|Type|Description|
|-----|----|-----------|
|_schemaName|String|Defines the type of object, and is used to group them together|
|fileName|String|Title of the document uploaded
|addedBy|String|the user id of the person who added this record|
|url|String|URL to the document in the S3 bucket|
|key|--|--|
|dateAdded|Date|Date the record was created
|write|[String]|holds the user rolls that are able to view this data|
|read|[String]|holds the user rolls that are able to view this data|

## Permit
|Field|Type|Description|
|-----|----|-----------|
|_schemaName|String|Defines the type of object, and is used to group them together|
|_epicProjectId|ObjectId|Reference to the EPIC object in EPIC that we pull the rest of the fields from|
|_flavourRecords|[ObjectId]|Array of ObjectIds referencing the sub record, different from the master|
|read|[String]|holds the user rolls that are able to view this data|
|write|[String]|holds the user rolls that are able to view this data|
|recordName|String|Public-facing name of the record|
|recordType|String|Type of record|
|recordSubtype|String|Subtype of the record|
|dateIssued|Date|Date that the permit was issued|
|issuingAgency|String|Internal code for the Ministry or Agency that issued the permit|
|documents|[ObjectId]|Array of documents referencing the permit|
|projectName|String|Name of the project|
|dateAdded|Date|Date the record was created
|dateUpdated|Date|The last time someone updated this record|
|addedBy|String|the user id of the person who added this record|
|updatedBy|String|the user id of the person who last updated this record|
|publishedBy|String|the user id of the person who published this record|
|sourceDateAdded|Date|the creation date as stored in the source|
|sourceDateUpdated|Date|the date last updated as stored in the source|
|sourceSystemRef|String|the reference to the source system|
|isLngPublished|Boolean|Determines if the record is published to LNG|
|isNrcedPublished|Boolean|Determines if the record is published to NRCED|

## TicketNRCED
|Field|Type|Description|
|-----|----|-----------|
|_schemaName|String|Defines the type of object, and is used to group them together|
|read|[String]|holds the user rolls that are able to view this data|
|write|[String]|holds the user rolls that are able to view this data|
|recordName|String|Public-facing name of the record|
|recordType|String|Type of record|
|dateIssued|Date|Date that the ticket was issued|
|legislation|[Object]|Object of items that further categorize the ticket|
|issuedTo|Object|Contains `read` and `write` permissions, as well as personal, identifying information of the individual/entity.
|location|GeoJSON|The latitude and longitude location of this mine (stored as a point)|
|penalties|[Object]|Array of object describing the penalty and the fine|
|summary|String|--|
|dateAdded|Date|Date the record was created
|dateUpdated|Date|The last time someone updated this record|
|datePublished|Date|The date this record was published to be visible to the public|
|addedBy|String|the user id of the person who added this record|
|updatedBy|String|the user id of the person who last updated this record|
|publishedBy|String|the user id of the person who published this record|
|sourceDateAdded|Date|the creation date as stored in the source|
|sourceDateUpdated|Date|the date last updated as stored in the source|
|sourceSystemRef|String|the reference to the source system|
|_master|ObjectId|the Object Id of the master record
|issuingAgency|String|Internal code for the Ministry or Agency that issued the ticket|

## Task
|Field|Type|Description|
|-----|----|-----------|
|_schemaName|String|Defines the type of object, and is used to group them together|
|dataSource|String|--|
|dataSourceLabel|String|Source of the task that was imported
|startDate|Date|Start date of the task|
|finishDate|Date|End date of the task|
|itemTotal|Int|Number of items total|
|itemsProcessed|Int|Number of items processed|
|status|String|Most recent mine status|
|read|[String]|holds the user rolls that are able to view this data|
|write|[String]|holds the user rolls that are able to view this data|
|__v|Int|Version number of the record|

## ConstructionPlan
|Field|Type|Description|
|-----|----|-----------|
|_schemaName|String|Defines the type of object, and is used to group them together|
|_epicProjectId|ObjectId|Reference to the EPIC object in EPIC that we pull the rest of the fields from|
|_flavourRecords|[ObjectId]|Array of ObjectIds referencing the sub record, different from the master|
|read|[String]|holds the user rolls that are able to view this data|
|write|[String]|holds the user rolls that are able to view this data|
|recordName|String|Public-facing name of the record|
|recordType|String|Type of record|
|dateIssued|Date|Date that the construction plan was issued|
|issuingAgency|String|Internal code for the Ministry or Agency that issued the construction plan|
|documents|[ObjectId]|Array of documents referencing the construction plan|
|projectName|String|Name of the project|
|dateAdded|Date|Date the record was created
|dateUpdated|Date|The last time someone updated this record|
|updatedBy|String|the user id of the person who last updated this record|
|publishedBy|String|the user id of the person who published this record|
|sourceDateAdded|Date|the creation date as stored in the source|
|sourceDateUpdated|Date|the date last updated as stored in the source|
|sourceSystemRef|String|the reference to the source system|
|isLngPublished|Boolean|Determines if the record is published to LNG|
|isNrcedPublished|Boolean|Determines if the record is published to NRCED|

## RestorativeJusticeNRCED
|Field|Type|Description|
|-----|----|-----------|
|_schemaName|String|Defines the type of object, and is used to group them together|
|read|[String]|holds the user rolls that are able to view this data|
|write|[String]|holds the user rolls that are able to view this data|
|recordName|String|Public-facing name of the record|
|recordType|String|Type of record|
|dateIssued|Date|Date that the restorative justice was issued|
|legislation|[Object]|Object of items that further categorize the restorative justice|
|issuedTo|Object|Contains `read` and `write` permissions, as well as personal, identifying information of the individual/entity.
|location|GeoJSON|The latitude and longitude location of this mine (stored as a point)|
|penalties|[Object]|Array of object describing the penalty and the fine|
|summary|String|--|
|dateAdded|Date|Date the record was created
|dateUpdated|Date|The last time someone updated this record|
|datePublished|Date|The date this record was published to be visible to the public|
|addedBy|String|the user id of the person who added this record|
|updatedBy|String|the user id of the person who last updated this record|
|publishedBy|String|the user id of the person who published this record|
|sourceDateAdded|Date|the creation date as stored in the source|
|sourceDateUpdated|Date|the date last updated as stored in the source|
|sourceSystemRef|String|the reference to the source system|
|_master|ObjectId|the Object Id of the master record
|issuingAgency|String|Internal code for the Ministry or Agency that issued the restorative justice|

## OrderLNG
|Field|Type|Description|
|-----|----|-----------|
|_schemaName|String|Defines the type of object, and is used to group them together|
|_epicProjectId|ObjectId|Reference to the EPIC object in EPIC that we pull the rest of the fields from|
|read|[String]|holds the user rolls that are able to view this data|
|write|[String]|holds the user rolls that are able to view this data|
|recordName|String|Public-facing name of the record|
|recordType|String|Type of record|
|recordSubtype|String|Subtype of the record|
|dateIssued|Date|Date that the order was issued|
|issuingAgency|String|Internal code for the Ministry or Agency that issued the order|
|author|String|Public-facing name of the Ministry or Agency that issued the order| 
|projectName|String|Name of the project|
|documents|[ObjectId]|Array of documents referencing the order|
|description|String|Reason for the order|
|dateAdded|Date|Date the record was created
|dateUpdated|Date|The last time someone updated this record|
|datePublished|Date|The date this record was published to be visible to the public|
|addedBy|String|the user id of the person who added this record|
|updatedBy|String|the user id of the person who last updated this record|
|publishedBy|String|the user id of the person who published this record|
|sourceDateAdded|Date|the creation date as stored in the source|
|sourceDateUpdated|Date|the date last updated as stored in the source|
|sourceSystemRef|String|the reference to the source system|
|_master|ObjectId|the Object Id of the master record

## Warning
|Field|Type|Description|
|-----|----|-----------|
|_schemaName|String|Defines the type of object, and is used to group them together|
|_epicProjectId|ObjectId|Reference to the EPIC object in EPIC that we pull the rest of the fields from|
|_flavourRecords|[ObjectId]|Array of ObjectIds referencing the sub record, different from the master|
|read|[String]|holds the user rolls that are able to view this data|
|write|[String]|holds the user rolls that are able to view this data|
|recordName|String|Public-facing name of the record|
|recordType|String|Type of record|
|recordSubtype|String|Subtype of the record|
|dateIssued|Date|Date that the warning was issued|
|issuingAgency|String|Internal code for the Ministry or Agency that issued the warning|
|documents|[ObjectId]|Array of documents referencing the warning|
|author|String|Public-facing name of the Ministry or Agency that issued the warning| 
|projectName|String|Name of the project|
|dateAdded|Date|Date the record was created
|dateUpdated|Date|The last time someone updated this record|
|addedBy|String|the user id of the person who added this record|
|updatedBy|String|the user id of the person who last updated this record|
|publishedBy|String|the user id of the person who published this record|
|sourceDateAdded|Date|the creation date as stored in the source|
|sourceDateUpdated|Date|the date last updated as stored in the source|
|sourceSystemRef|String|the reference to the source system|
|isLngPublished|Boolean|Determines if the record is published to LNG|
|isNrcedPublished|Boolean|Determines if the record is published to NRCED|

## AdministrativeSanctionNRCED
|Field|Type|Description|
|-----|----|-----------|
|_schemaName|String|Defines the type of object, and is used to group them together|
|read|[String]|holds the user rolls that are able to view this data|
|write|[String]|holds the user rolls that are able to view this data|
|recordName|String|Public-facing name of the record|
|recordType|String|Type of record|
|dateIssued|Date|Date that the administrative action was issued|
|legislation|[Object]|Object of items that further categorize the administrative action|
|issuedTo|Object|Contains `read` and `write` permissions, as well as personal, identifying information of the individual/entity.
|location|GeoJSON|The latitude and longitude location of this mine (stored as a point)|
|penalties|[Object]|Array of object describing the penalty and the fine|
|summary|String|--|
|dateAdded|Date|Date the record was created
|dateUpdated|Date|The last time someone updated this record|
|datePublished|Date|The date this record was published to be visible to the public|
|addedBy|String|the user id of the person who added this record|
|updatedBy|String|the user id of the person who last updated this record|
|publishedBy|String|the user id of the person who published this record|
|sourceDateAdded|Date|the creation date as stored in the source|
|sourceDateUpdated|Date|the date last updated as stored in the source|
|sourceSystemRef|String|the reference to the source system|
|_master|ObjectId|the Object Id of the master record
|issuingAgency|String|Internal code for the Ministry or Agency that issued the administrative action|

## OrderNRCED
|Field|Type|Description|
|-----|----|-----------|
|_schemaName|String|Defines the type of object, and is used to group them together|
|read|[String]|holds the user rolls that are able to view this data|
|write|[String]|holds the user rolls that are able to view this data|
|recordName|String|Public-facing name of the record|
|recordType|String|Type of record|
|dateIssued|Date|Date that the order was issued|
|legislation|[Object]|Object of items that further categorize the order|
|issuedTo|Object|Contains `read` and `write` permissions, as well as personal, identifying information of the individual/entity.
|location|GeoJSON|The latitude and longitude location of this mine (stored as a point)|
|summary|String|--|
|dateAdded|Date|Date the record was created
|dateUpdated|Date|The last time someone updated this record|
|datePublished|Date|The date this record was published to be visible to the public|
|addedBy|String|the user id of the person who added this record|
|updatedBy|String|the user id of the person who last updated this record|
|publishedBy|String|the user id of the person who published this record|
|sourceDateAdded|Date|the creation date as stored in the source|
|sourceDateUpdated|Date|the date last updated as stored in the source|
|sourceSystemRef|String|the reference to the source system|
|_master|ObjectId|the Object Id of the master record
|issuingAgency|String|Internal code for the Ministry or Agency that issued the order|

## SelfReportLNG
|Field|Type|Description|
|-----|----|-----------|
|_schemaName|String|Defines the type of object, and is used to group them together|
|_epicProjectId|ObjectId|Reference to the EPIC object in EPIC that we pull the rest of the fields from|
|read|[String]|holds the user rolls that are able to view this data|
|write|[String]|holds the user rolls that are able to view this data|
|recordName|String|Public-facing name of the record|
|recordType|String|Type of record|
|dateIssued|Date|Date that the self report was issued|
|issuingAgency|String|Internal code for the Ministry or Agency that issued the self report|
|author|String|Public-facing name of the Ministry or Agency that issued the self report| 
|projectName|String|Name of the project|
|documents|[ObjectId]|Array of documents referencing the self report|
|relatedPhase|String|When in the phase the self report was issued|
|description|String|Reason for the self report|
|dateAdded|Date|Date the record was created
|dateUpdated|Date|The last time someone updated this record|
|datePublished|Date|The date this record was published to be visible to the public|
|addedBy|String|the user id of the person who added this record|
|updatedBy|String|the user id of the person who last updated this record|
|publishedBy|String|the user id of the person who published this record|
|sourceDateAdded|Date|the creation date as stored in the source|
|sourceDateUpdated|Date|the date last updated as stored in the source|
|sourceSystemRef|String|the reference to the source system|
|_master|ObjectId|the Object Id of the master record
