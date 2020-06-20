let defaultLog = require('winston').loggers.get('default');
let mongoose = require('mongoose');
let QueryActions = require('../utils/query-actions');
let QueryUtils = require('../utils/query-utils');
let qs = require('qs');
let mongodb = require('../utils/mongodb');
let moment = require('moment');
let fuzzySearch = require('../utils/fuzzySearch');

function isEmpty(obj) {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return false;
    }
  }
  return true;
}

/**
 * Generate an array of expressions for the query string parameters.
 *
 * @param {string} field query string
 * @param {string} [logicalOperator='$or'] mongo logical operator ('$or', '$and')
 * @param {string} [comparisonOperator='$eq'] mongo comparison operator ('$eq', '$ne')
 * @returns {object[]} array of objects
 */
let generateExpArray = async function (field, logicalOperator = '$or', comparisonOperator = '$eq') {
  if (!field) {
    return;
  }

  let queryString = qs.parse(field);
  defaultLog.info('queryString:', queryString);
  // Note that we need map and not forEach here because Promise.all uses the returned array!
  return await Promise.all(
    Object.keys(queryString).map(async item => {
      let entry = queryString[item];
      defaultLog.info('item:', item, entry);

      if (Array.isArray(entry)) {
        return getArrayExp(item, entry, logicalOperator, comparisonOperator);
      }

      if (moment(entry, moment.ISO_8601).isValid()) {
        return getDateExp(item, entry);
      }

      if (item === 'hasDocuments') {
        return getHasDocumentsExp(entry);
      }

      if (item === 'isNrcedPublished' && entry === 'true') {
        return { isNrcedPublished: true }
      } else if (item === 'isNrcedPublished' && entry === 'false') {
        return { $or: [{ isNrcedPublished: { $exists: false } }, { isNrcedPublished: false }] };
      }
      if (item === 'isLngPublished' && entry === 'true') {
        return { isLngPublished: true }
      } else if (item === 'isLngPublished' && entry === 'false') {
        return { $or: [{ isLngPublished: { $exists: false } }, { isLngPublished: false }] }
      }

      return getConvertedValue(item, entry, comparisonOperator);
    })
  );
};
exports.generateExpArray = generateExpArray;

/**
 * Generate an expression for a paramter with an array of values.
 *
 * @param {string} item parameter key
 * @param {*[]} entry parameter values array
 * @param {string} logicalOperator mongo logical operator ('$and', '$or', '$nor')
 * @param {*} comparisonOperator mongo comparison operator ('$eq', '$ne')
 * @returns {object}
 */
const getArrayExp = function (item, entry, logicalOperator, comparisonOperator) {
  if (!item || !entry || !entry.length) {
    // Invalid
    return {};
  }

  let arrayExp = entry.map(element => {
    return getConvertedValue(item, element, comparisonOperator);
  });

  return { [logicalOperator]: arrayExp };
};
exports.getArrayExp = getArrayExp;

const getDateExp = function (item, entry, prefix = '') {
  // Pluck the variable off the string because this is a date object.  It should
  // always start with either dateRangeFromFilter or dateRangeFromFilter
  const dateRangeFromSearchString = prefix + 'dateRangeFromFilter';
  const dateRangeToSearchString = prefix + 'dateRangeToFilter';

  if (item.startsWith(dateRangeFromSearchString)) {
    const propertyName = item.substr(item.indexOf(dateRangeFromSearchString) + dateRangeFromSearchString.length);

    return handleDateStartItem(prefix + propertyName, entry);
  } else if (item.startsWith(dateRangeToSearchString)) {
    const propertyName = item.substr(item.indexOf('dateRangeToFilter') + 'dateRangeToFilter'.length);

    return handleDateEndItem(prefix + propertyName, entry);
  } else {
    // Invalid
    return {};
  }
};
exports.getDateExp = getDateExp;

const getHasDocumentsExp = function (entry) {
  // We're checking if there are docs in the record or not.
  if (entry === 'true') {
    return { $and: [{ documents: { $exists: true } }, { documents: { $not: { $size: 0 } } }] };
  } else if (entry === 'false') {
    return { $or: [{ documents: { $exists: false } }, { documents: { $size: 0 } }] };
  } else {
    // Invalid
    return {};
  }
};
exports.getHasDocumentsExp = getHasDocumentsExp;

/**
 * Generate an expression for a basic parameter key/value
 *
 * @param {string} item parameter key
 * @param {*} entry parameter value
 * @param {string} comparisonOperator mongo comparison operator ('$eq', '$ne')
 * @returns {object}
 */
const getConvertedValue = function (item, entry, comparisonOperator) {
  if (!item || !comparisonOperator) {
    return {};
  }

  if (isNaN(entry) || entry === null) {
    if (mongoose.Types.ObjectId.isValid(entry)) {
      defaultLog.info('objectid', entry);
      // ObjectID
      return { [item]: { [comparisonOperator]: mongoose.Types.ObjectId(entry) } };
    } else if (entry === 'true') {
      defaultLog.info('bool');
      // Bool
      return { [item]: { [comparisonOperator]: true } };
    } else if (entry === 'false') {
      defaultLog.info('bool');
      // Bool
      return { [item]: { [comparisonOperator]: false } };
    } else {
      defaultLog.info('string');
      // String
      return { [item]: { [comparisonOperator]: entry } };
    }
  } else {
    defaultLog.info('number');
    // Number
    return { [item]: { [comparisonOperator]: parseInt(entry) } };
  }
};
exports.getConvertedValue = getConvertedValue;

const handleDateStartItem = function (field, entry) {
  let date = new Date(entry);

  // Validate: valid date?
  if (!isNaN(date)) {
    let start = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    return { [field]: { $gte: start } };
  }
};

const handleDateEndItem = function (field, entry) {
  let date = new Date(entry);

  // Validate: valid date?
  if (!isNaN(date)) {
    let end = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1);
    return { [field]: { $lt: end } };
  }
};

let searchCollection = async function (
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
  nor,
  subset
) {
  let properties = undefined;
  if (project) {
    properties = { project: mongoose.Types.ObjectId(project) };
  }

  // optional search keys
  let searchProperties = undefined;
  if (keywords) {
    // for now, limit fuzzy search to the mine search only. We can expand to all searches
    // later if desired
    if (schemaName === 'Mine') {
      keywords = keywords && keywords.length > 1 ? fuzzySearch.createFuzzySearchString(keywords, 4, caseSensitive) : keywords;
    }
    searchProperties = { $text: { $search: keywords, $caseSensitive: caseSensitive } };
  }

  let match = await generateMatchesForAggregation(and, or, nor, searchProperties, properties, schemaName, roles);

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
    } else if (subset.includes('description')) {
      collectionName = 'description_summary_subset';
    }
  }
  const collection = db.collection(collectionName);

  return await collection
    .aggregate(aggregation, {
      allowDiskUse: true,
      collation: {
        locale: 'en_US',
        alternate: 'shifted',
        numericOrdering: true
      }
    })
    .toArray();
};

exports.publicGet = async function (args, res, next) {
  executeQuery(args, res, next);
};

exports.protectedGet = function (args, res, next) {
  executeQuery(args, res, next);
};

// Generates the main match query
const generateMatchesForAggregation = async function (and, or, nor, searchProperties, properties, schemaName, roles) {
  const andExpArray = (await generateExpArray(and)) || [];
  defaultLog.info('andExpArray:', andExpArray);

  const orExpArray = (await generateExpArray(or)) || [];
  defaultLog.info('orExpArray:', orExpArray);

  const norExpArray = (await generateExpArray(nor, '$and', '$ne')) || [];
  defaultLog.info('norExpArray:', norExpArray);

  const expArrays = [];
  if (andExpArray.length === 1) {
    expArrays.push(andExpArray[0]);
  } else if (andExpArray.length > 1) {
    expArrays.push({ $and: andExpArray });
  }
  if (orExpArray.length === 1) {
    expArrays.push(orExpArray[0]);
  } else if (orExpArray.length > 1) {
    expArrays.push({ $and: orExpArray });
  }
  if (norExpArray.length === 1) {
    expArrays.push(norExpArray[0]);
  } else if (norExpArray.length > 1) {
    expArrays.push({ $and: norExpArray });
  }

  let modifier = {};
  if (expArrays.length === 1) {
    modifier = expArrays[0];
  } else if (expArrays.length > 1) {
    modifier = { $and: expArrays };
  }

  let match = {
    _schemaName: Array.isArray(schemaName) ? { $in: schemaName } : schemaName,
    ...(isEmpty(modifier) ? undefined : modifier),
    ...(searchProperties ? searchProperties : undefined),
    ...(properties ? properties : undefined)
  };

  return match;
};

const executeQuery = async function (args, res, next) {
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
  let nor = args.swagger.params.nor ? args.swagger.params.nor.value : '';
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
  defaultLog.info('nor:', nor);
  defaultLog.info('_id:', _id);
  defaultLog.info('populate:', populate);
  defaultLog.info('subset:', subset);

  let roles = args.swagger.params.auth_payload ? args.swagger.params.auth_payload.realm_access.roles : ['public'];

  defaultLog.info('Searching Collection:', dataset);

  defaultLog.info('******************************************************************');
  defaultLog.info(roles);
  defaultLog.info('******************************************************************');

  QueryUtils.audit(args,
    'Search',
    keywords,
    args.swagger.params.auth_payload ? args.swagger.params.auth_payload
                                     : { idir_userid: null, displayName: 'public', preferred_username: 'public' }
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
      nor,
      subset
    );

    QueryActions.sendResponse(res, 200, itemData);
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

    QueryActions.sendResponse(res, 200, data);
  } else {
    defaultLog.info('Bad Request');
    QueryActions.sendResponse(res, 400, {});
  }
  next();
};

exports.protectedOptions = function (args, res, next) {
  res.status(200).send();
};
