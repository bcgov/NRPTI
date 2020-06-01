# NRPTI Data Models
This is a collection of documentation of all of the data models in NRPTI and the sites that it serves (LNG, NRCED, and BCMI). The general data models are stored in the master folder and the site specific data models are stored in their respective folders. Below are a list of the site wide data models that can be found in the [master](https://github.com/bcgov/NRPTI/tree/master/api/src/models/master) directory.
## Mine
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
|summary|String||
|description|String||
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

## Work in progress