const mongodb = require('../../src/utils/mongodb');

/**
 * Updates the redactedRecord subset.
 *
 * @param {*} defaultLog
 */
async function update(defaultLog) {
  // get all records with valid schemaNames
  let aggregate = [
    {
      $match: {
        _schemaName: {
          $exists: true
        }
      }
    }
  ];

  const issuedToRedaction = [
    {
      $project: {
        fullRecord: 1,
        issuedToAge: {
          $cond: {
            if: { $ne: [{ $arrayElemAt: ['$fullRecord.issuedTo.dateOfBirth', 0] }, null] },
            then: {
              $subtract: [
                { $year: { date: new Date() } },
                { $year: { date: { $arrayElemAt: ['$fullRecord.issuedTo.dateOfBirth', 0] } } }
              ]
            },
            else: 0
          }
        }
      }
    },
    {
      $addFields: {
        skipRedact: {
          $cond: {
            if: {
              $in: [ { $arrayElemAt: ['$fullRecord._schemaName', 0] }, ['MineBCMI', 'CollectionBCMI'] ]
            },
            then: true,
            else: false
          }
        }
      }
    },
    {
      $addFields: {
        'fullRecord.issuedTo.firstName': {
          $cond: {
            if: {
              $lt: ['$issuedToAge', 19]
            },
            then: 'Unpublished',
            else: { $arrayElemAt: ['$fullRecord.issuedTo.firstName', 0] }
          }
        },
        'fullRecord.issuedTo.lastName': {
          $cond: {
            if: {
              $lt: ['$issuedToAge', 19]
            },
            then: 'Unpublished',
            else: { $arrayElemAt: ['$fullRecord.issuedTo.lastName', 0] }
          }
        },
        'fullRecord.issuedTo.middleName': {
          $cond: {
            if: {
              $lt: ['$issuedToAge', 19]
            },
            then: '',
            else: { $arrayElemAt: ['$fullRecord.issuedTo.middleName', 0] }
          }
        },
        'fullRecord.issuedTo.fullName': {
          $cond: {
            if: {
              $lt: ['$issuedToAge', 19]
            },
            then: 'Unpublished',
            else: { $arrayElemAt: ['$fullRecord.issuedTo.fullName', 0] }
          }
        },
        'fullRecord.issuedTo.dateOfBirth': {
          $cond: {
            if: {
               $lt: ['$issuedToAge', 19]
            },
            then: '',
            else: { $arrayElemAt: ['$fullRecord.issuedTo.dateOfBirth', 0] }
          }
        }
      }
    },
    // this step will replace issued to with an empty object {} for mines and collections.
    // mines and collections don't normally have an issuedTo field, but this should minimize confusion
    // TODO: remove the issuedTo field from mines and collections all together
    {
      $addFields: {
        'fullRecord.issuedTo': {
          $cond: {
            if: { $eq: [ '$skipRedact', true ] },
            then: {},
            else: { $arrayElemAt: ['$fullRecord.issuedTo', 0] }
          },
        }
      }
    }
  ];


  try {
    const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
    const mainCollection = db.collection('nrpti');

    defaultLog.info('Updating redacted_record_subset');

    // lookup by id for each object in the match array and populate the fullRecord field
    aggregate.push({
      $lookup: {
        from: 'nrpti',
        localField: '_id',
        foreignField: '_id',
        as: 'fullRecord'
      }
    });

    // redact issued to fields based on age
    aggregate = aggregate.concat(issuedToRedaction);

    // replace root with redacted full record
    aggregate.push(
      {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [
            { $arrayElemAt: ["$fullRecord", 0] },
            "$$ROOT"]
        }
      }
    });

    // trim out the 'fullRecord' attribute, we no longer need it
    // after re-population
    aggregate.push({
      $project: {
        fullRecord: 0,
        issuedToAge: 0
      }
    });

    // Redaction. We've imported details from
    // flavours and documents, and we may need
    // to prevent some of these from being returned
    // if the user lacks the requisite role(s)

    // for this case, only public users should be using this subset
    let roles = ['public'];

    aggregate.push({
      $redact: {
        $cond: {
          if: {
            $cond: {
              if: '$read',
              then: {
                $anyElementTrue: {
                  $map: {
                    input: '$read',
                    as: 'fieldTag',
                    in: { $setIsSubset: [['$$fieldTag'], roles] }
                  }
                }
              },
              else: true
            }
          },
          then: '$$DESCEND',
          else: '$$PRUNE'
        }
      }
    });

    aggregate.push({ $out: 'redacted_record_subset' });

    await mainCollection.aggregate(aggregate).next();

    defaultLog.info('Done Updating redacted_record_subset');

  } catch (error) {
    defaultLog.info('Failed to update redacted_record_subset, error: ' + error);
  }
}

exports.update = update;
