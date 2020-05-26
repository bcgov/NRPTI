let defaultLog = require('winston').loggers.get('default');
let mongoose = require('mongoose');
let QueryActions = require('../utils/query-actions');
let QueryUtils = require('../utils/query-utils');
let qs = require('qs');
let mongodb = require('../utils/mongodb');
let moment = require('moment');

function isEmpty(obj) {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return false;
    }
  }
  return true;
}

let generateExpArray = async function(field, prefix = '') {
  if (field && field != undefined) {
    let queryString = qs.parse(field);
    defaultLog.info('queryString:', queryString);
    // Note that we need map and not forEach here because Promise.all uses
    // the returned array!
    return await Promise.all(
      Object.keys(queryString).map(async item => {
        let entry = queryString[item];
        defaultLog.info('item:', item, entry);
        if (Array.isArray(entry)) {
          // handle nor filter
          const norFilterString = '(nor)';
          if (item.startsWith(norFilterString)) {
            const propertyName = item.substr(item.indexOf(norFilterString) + norFilterString.length);

            let orArray = entry.map(element => {
              return getConvertedValue(propertyName, element);
            });

            return { $nor: orArray };
          }

          // handle or filter
          let orArray = entry.map(element => {
            return getConvertedValue(item, element);
          });

          return { $or: orArray };
        } else if (moment(entry, moment.ISO_8601).isValid()) {
          // Pluck the variable off the string because this is a date object.  It should
          // always start with either dateRangeFromFilter or _master.dateRangeFromFilter

          const dateRangeFromSearchString = prefix + 'dateRangeFromFilter';
          const dateRangeToSearchString = prefix + 'dateRangeToFilter';

          if (item.startsWith(dateRangeFromSearchString)) {
            const propertyName = item.substr(
              item.indexOf(dateRangeFromSearchString) + dateRangeFromSearchString.length
            );

            return handleDateStartItem(prefix + propertyName, entry);
          } else if (item.startsWith(dateRangeToSearchString)) {
            const propertyName = item.substr(item.indexOf('dateRangeToFilter') + 'dateRangeToFilter'.length);

            return handleDateEndItem(prefix + propertyName, entry);
          } else {
            // Invalid. return empty {}
            return {};
          }
        } else if (item === 'hasDocuments') {
          // We're checking if there are docs in the record or not.
          if (entry === 'true') {
            return { documents: { $not: { $size: 0 } } };
          } else if (entry === 'false') {
            return { documents: { $size: 0 } };
          }
        } else {
          return getConvertedValue(item, entry);
        }
      })
    );
  }
};
exports.generateExpArray = generateExpArray;

const getConvertedValue = function(item, entry) {
  if (isNaN(entry)) {
    if (mongoose.Types.ObjectId.isValid(entry)) {
      defaultLog.info('objectid', entry);
      // ObjectID
      return { [item]: mongoose.Types.ObjectId(entry) };
    } else if (entry === 'true') {
      defaultLog.info('bool');
      // Bool
      let tempObj = {};
      tempObj[item] = true;
      tempObj.active = true;
      return tempObj;
    } else if (entry === 'false') {
      defaultLog.info('bool');
      // Bool
      return { [item]: false };
    } else {
      defaultLog.info('string');

      // handle not equal filter
      const neFilterString = '(ne)';
      if (entry.startsWith(neFilterString)) {
        const entryValue = entry.substr(entry.indexOf(neFilterString) + neFilterString.length);

        return { [item]: { $ne: entryValue } };
      }

      // handle equal filter
      return { [item]: entry };
    }
  } else {
    defaultLog.info('number');
    return { [item]: parseInt(entry) };
  }
};
exports.getConvertedValue = getConvertedValue;

const handleDateStartItem = function(field, entry) {
  let date = new Date(entry);

  // Validate: valid date?
  if (!isNaN(date)) {
    let start = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    return { [field]: { $gte: start } };
  }
};

const handleDateEndItem = function(field, entry) {
  let date = new Date(entry);

  // Validate: valid date?
  if (!isNaN(date)) {
    let end = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1);
    return { [field]: { $lt: end } };
  }
};

let searchCollection = async function(
  roles,
  keywords,
  schemaName,
  pageNum,
  pageSize,
  project,
  sortField = undefined,
  sortDirection = undefined,
  caseSensitive,
  populate = false,
  and,
  or,
  subset
) {
  let properties = undefined;
  if (project) {
    properties = { project: mongoose.Types.ObjectId(project) };
  }

  // optional search keys
  let searchProperties = undefined;
  if (keywords) {
    searchProperties = { $text: { $search: keywords, $caseSensitive: caseSensitive } };
  }

  let match = await generateMatchesForAggregation(and, or, searchProperties, properties, schemaName, roles);

  defaultLog.info('match:', match);

  // aggregations that run against the results of the initial match/filter aggregation
  let searchResultAggregation = [];

  // sort
  if (sortField && sortDirection) {
    searchResultAggregation.push({
      $sort: { [sortField]: sortDirection }
    });
  }
  // pagination
  searchResultAggregation.push(
    {
      $skip: pageNum * pageSize
    },
    {
      $limit: pageSize
    }
  );
  // populate refs
  if (populate) {
    // populate flavours
    searchResultAggregation.push({
      $lookup: {
        from: 'nrpti',
        localField: '_flavourRecords',
        foreignField: '_id',
        as: 'flavours'
      }
    });

    // populate documents
    searchResultAggregation.push({
      $lookup: {
        from: 'nrpti',
        localField: 'documents',
        foreignField: '_id',
        as: 'documents'
      }
    });
  }

  let aggregation = [
    {
      $match: match
    }
  ];

  aggregation.push({
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

  aggregation.push({
    $addFields: {
      score: { $meta: 'textScore' }
    }
  });

  aggregation.push({
    $facet: {
      searchResults: searchResultAggregation,
      meta: [
        {
          $count: 'searchResultsTotal'
        }
      ]
    }
  });

  defaultLog.info('Executing searching on schema(s):', schemaName);

  const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');

  // If we have a subset filter on, we must change to the appropriate collection.
  let collectionName = 'nrpti';
  if (subset) {
    if (subset.includes('issuedTo')) {
      collectionName = 'issued_to_subset';
    } else if (subset.includes('location')) {
      collectionName = 'location_subset';
    }
  }
  const collection = db.collection(collectionName);

  return await collection
    .aggregate(aggregation, {
      collation: {
        locale: 'en_US',
        alternate: 'shifted',
        numericOrdering: true
      }
    })
    .toArray();
};

exports.publicGet = async function(args, res, next) {
  executeQuery(args, res, next);
};

exports.protectedGet = function(args, res, next) {
  executeQuery(args, res, next);
};

// Generates the main match query, and optionally generates the master field match to be used
// later in the pipeline.
const generateMatchesForAggregation = async function(and, or, searchProperties, properties, schemaName, roles) {
  const andExpArray = (await generateExpArray(and)) || [];
  defaultLog.info('andExpArray:', andExpArray);

  const orExpArray = (await generateExpArray(or)) || [];
  defaultLog.info('orExpArray:', orExpArray);

  let modifier = {};
  if (andExpArray.length > 0 && orExpArray.length > 0) {
    modifier = { $and: [{ $and: andExpArray }, { $and: orExpArray }] };
  } else if (andExpArray.length === 0 && orExpArray.length > 0) {
    modifier = { $and: orExpArray };
  } else if (andExpArray.length > 0 && orExpArray.length === 0) {
    modifier = { $and: andExpArray };
  }

  let match = {
    _schemaName: Array.isArray(schemaName) ? { $in: schemaName } : schemaName,
    ...(isEmpty(modifier) ? undefined : modifier),
    ...(searchProperties ? searchProperties : undefined),
    ...(properties ? properties : undefined)
  };

  return match;
};

const executeQuery = async function(args, res, next) {
  let _id = args.swagger.params._id ? args.swagger.params._id.value : null;
  let keywords = args.swagger.params.keywords.value;
  let dataset = args.swagger.params.dataset.value;
  let project = args.swagger.params.project.value;
  let populate = args.swagger.params.populate ? args.swagger.params.populate.value : false;
  let pageNum = args.swagger.params.pageNum.value || 0;
  let pageSize = args.swagger.params.pageSize.value || 25;
  let sortBy = args.swagger.params.sortBy.value ? args.swagger.params.sortBy.value : keywords ? ['-score'] : [];
  let caseSensitive = args.swagger.params.caseSensitive ? args.swagger.params.caseSensitive.value : false;
  let and = args.swagger.params.and ? args.swagger.params.and.value : '';
  let or = args.swagger.params.or ? args.swagger.params.or.value : '';
  let subset = args.swagger.params.subset ? args.swagger.params.subset.value : null;
  defaultLog.info('Searching keywords:', keywords);
  defaultLog.info('Searching datasets:', dataset);
  defaultLog.info('Searching project:', project);
  defaultLog.info('pageNum:', pageNum);
  defaultLog.info('pageSize:', pageSize);
  defaultLog.info('sortBy:', sortBy);
  defaultLog.info('caseSensitive:', caseSensitive);
  defaultLog.info('and:', and);
  defaultLog.info('or:', or);
  defaultLog.info('_id:', _id);
  defaultLog.info('populate:', populate);
  defaultLog.info('subset:', subset);

  let roles = args.swagger.params.auth_payload ? args.swagger.params.auth_payload.realm_access.roles : ['public'];

  defaultLog.info('Searching Collection:', dataset);

  defaultLog.info('******************************************************************');
  defaultLog.info(roles);
  defaultLog.info('******************************************************************');

  QueryUtils.recordAction(
    'Search',
    keywords,
    args.swagger.params.auth_payload ? args.swagger.params.auth_payload.preferred_username : 'public'
  );

  let sortDirection = undefined;
  let sortField = undefined;

  let sortingValue = {};
  sortBy.map(value => {
    sortDirection = value.charAt(0) == '-' ? -1 : 1;
    sortField = value.slice(1);
    sortingValue[sortField] = sortDirection;
  });

  defaultLog.info('sortingValue:', sortingValue);
  defaultLog.info('sortField:', sortField);
  defaultLog.info('sortDirection:', sortDirection);

  if (dataset[0] !== 'Item') {
    defaultLog.info('Searching Dataset:', dataset);
    defaultLog.info('sortField:', sortField);

    let itemData = await searchCollection(
      roles,
      keywords,
      dataset,
      pageNum,
      pageSize,
      project,
      sortField,
      sortDirection,
      caseSensitive,
      populate,
      and,
      or,
      subset
    );

    return QueryActions.sendResponse(res, 200, itemData);
  } else if (dataset[0] === 'Item') {
    let collectionObj = mongoose.model(args.swagger.params._schemaName.value);
    defaultLog.info('ITEM GET', { _id: args.swagger.params._id.value });

    let aggregation = [
      {
        $match: { _id: mongoose.Types.ObjectId(args.swagger.params._id.value) }
      },
      {
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
      }
    ];

    // populate flavours
    populate &&
      QueryUtils.recordTypes.includes(args.swagger.params._schemaName.value) &&
      aggregation.push({
        $lookup: {
          from: 'nrpti',
          localField: '_flavourRecords',
          foreignField: '_id',
          as: 'flavours'
        }
      });

    // Populate documents in a record
    populate &&
      QueryUtils.recordTypes.includes(args.swagger.params._schemaName.value) &&
      aggregation.push({
        $lookup: {
          from: 'nrpti',
          localField: 'documents',
          foreignField: '_id',
          as: 'documents'
        }
      });

    const data = await collectionObj.aggregate(aggregation);

    return QueryActions.sendResponse(res, 200, data);
  } else {
    defaultLog.info('Bad Request');
    return QueryActions.sendResponse(res, 400, {});
  }
};

exports.protectedOptions = function(args, res, next) {
  res.status(200).send();
};
