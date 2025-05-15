'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function(db) {
  console.log('**** Adding reports ****');

  const mClient = await db.connection.connect(db.connectionString, {
    native_parser: true
  });

  try {
    const nrpti = await mClient.collection('nrpti');

    await nrpti.insert({
      _schemaName: "Metric",
      code: "IssuingAgencyPublished365",
      header: "Agency Records",
      description: "Records by Agency published to NRCED over the last 365 days",
      operation: JSON.stringify([
        {
        "$project": {
          "_schemaName": "$_schemaName",
          "datePublished": "$datePublished",
          "issuingAgency": "$issuingAgency",
          "dateIssued~~~day": {
            "$let": {
              "vars": {
                "column": "$dateIssued"
              },
              "in": {
                "___date": {
                  "$dateToString": {
                    "format": "%Y-%m-%d",
                    "date": "$$column"
                  }
                }
              }
            }
          }
        }
      },
      {
        "$match": {
          "$and": [
            {
              "$or": [
                {
                  "_schemaName": {
                    "$eq": "AdministrativePenaltyNRCED"
                  }
                },
                {
                  "_schemaName": {
                    "$eq": "AdministrativeSanctionNRCED"
                  }
                },
                {
                  "_schemaName": {
                    "$eq": "CourtConvictionNRCED"
                  }
                },
                {
                  "_schemaName": {
                    "$eq": "InspectionNRCED"
                  }
                },
                {
                  "_schemaName": {
                    "$eq": "OrderNRCED"
                  }
                },
                {
                  "_schemaName": {
                    "$eq": "RestorativeJusticeNRCED"
                  }
                },
                {
                  "_schemaName": {
                    "$eq": "TicketNRCED"
                  }
                }
              ]
            },
            {
              "datePublished": {
                "$ne": null
              }
            },
            {
              "issuingAgency": {
                "$ne": null
              }
            },
            {
              "dateIssued~~~day": {
                "$gte": {
                  "___date": "2020-01-23"
                },
                "$lte": {
                  "___date": "2021-01-21"
                }
              }
            }
          ]
        }
      },
      {
        "$project": {
          "_id": "$_id",
          "___group": {
            "issuingAgency": "$issuingAgency"
          }
        }
      },
      {
        "$group": {
          "_id": "$___group",
          "count": {
            "$sum": 1
          }
        }
      },
      {
        "$sort": {
          "_id": 1
        }
      },
      {
        "$project": {
          "_id": false,
          "issuingAgency": "$_id.issuingAgency",
          "count": true
        }
      },
      {
        "$sort": {
          "count": -1,
          "issuingAgency": 1
        }
      }])
    });

    await nrpti.insert({
      _schemaName: "Metric",
      header: "Records by Type",
      code: "RecordByType",
      description: "Records by Type Published to NRCED",
      operation: JSON.stringify(
        [
          {
            "$match": {
              "$and": [
                {
                  "$or": [
                    {
                      "_schemaName": {
                        "$eq": "AdministrativePenaltyNRCED"
                      }
                    },
                    {
                      "_schemaName": {
                        "$eq": "AdministrativeSanctionNRCED"
                      }
                    },
                    {
                      "_schemaName": {
                        "$eq": "CourtConvictionNRCED"
                      }
                    },
                    {
                      "_schemaName": {
                        "$eq": "InspectionNRCED"
                      }
                    },
                    {
                      "_schemaName": {
                        "$eq": "OrderNRCED"
                      }
                    },
                    {
                      "_schemaName": {
                        "$eq": "RestorativeJusticeNRCED"
                      }
                    },
                    {
                      "_schemaName": {
                        "$eq": "TicketNRCED"
                      }
                    }
                  ]
                },
                {
                  "datePublished": {
                    "$ne": null
                  }
                }
              ]
            }
          },
          {
            "$project": {
              "_id": "$_id",
              "___group": {
                "recordType": "$recordType"
              }
            }
          },
          {
            "$group": {
              "_id": "$___group",
              "count": {
                "$sum": 1
              }
            }
          },
          {
            "$sort": {
              "_id": 1
            }
          },
          {
            "$project": {
              "_id": false,
              "recordType": "$_id.recordType",
              "count": true
            }
          },
          {
            "$sort": {
              "recordType": 1
            }
          }
        ]
      )}
    );

    console.log(`Finished inserting reports`);
  } catch (err) {
    console.log(`Error inserting reports: ${err}`);
  } finally {
    mClient.close();
  }

  return null;
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
